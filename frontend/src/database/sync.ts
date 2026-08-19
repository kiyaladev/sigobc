/**
 * sync.ts
 *
 * Service that replays the offline sync queue against the API when
 * connectivity is restored.
 *
 * Responsibilities:
 *  - Listen for browser `online` / `offline` events → keep `isOnline` in sync.
 *  - Periodically probe the API when offline so that reconnection is detected
 *    even when the network interface stays up (WiFi connected, internet down).
 *  - On reconnection (and at startup), flush `_syncQueue` in chronological order.
 *  - Remap local IDs to real server IDs so that FK references
 *    stored in later queue entries are fixed up before they are sent.
 *  - Prefetch all collections into the local cache at startup (when online) so
 *    that every page has data available immediately when the user goes offline.
 *
 * Call `initSyncService()` once from a boot file.
 */

import axios from 'axios';
import type { Table } from 'dexie';
import { watch } from 'vue';
import { api } from 'src/boot/axios';
import { isOnline, useApi, useCache, useSyncQueue } from './connectivity';
import { offlineDb } from './offline-db';
import type { SyncEntry } from './offline-db';

// ─── Constants ────────────────────────────────────────────────────────────────

/** How often to probe the API while offline (30 s). */
const PROBE_INTERVAL_MS = 30_000;

/**
 * Minimum time between full cache prefetches (1 h).
 * Prevents re-downloading everything on every app reload.
 */
const PREFETCH_INTERVAL_MS = 60 * 60 * 1000;

/** Max server-side failures before a sync queue entry is permanently skipped. */
const MAX_SYNC_RETRIES = 3;

/**
 * All data collections that should be cached locally for offline use.
 * `printData` is intentionally excluded — it holds transient print payloads
 * that are only meaningful in the current session.
 */
const ALL_COLLECTIONS = [
  'mairies',
  'utilisateurs',
  'exercices',
  // App3 – Dépenses
  'chapitres',
  'sousChapitres',
  'previsions',
  'mandats',
  'bordereauMandats',
  'etatFinancierMensuel',
  'projets',
  'fournisseurs',
  // App6 – Recettes
  'taxes',
  'declarations',
  'bordereauxRecette',
  'previsionsRecettes',
  'mandatsRecette',
  'bordereauMandatsRecette',
  'chapitresRecette',
  'etatFinancierMensuelRecette',
  // App7 – Employés
  'employes',
  'fichesPaie',
  'conges',
  'ordresMission',
  'parametresPaie',
  'servicesApp7',
] as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** True when the error is a network-level failure (no server response). */
function isOfflineError(error: unknown): boolean {
  return axios.isAxiosError(error) && !error.response;
}

/** Replace every local ID in `payload` that exists in `idMap` with the server ID. */
function remapPayload(
  payload: Record<string, unknown>,
  idMap: Map<number, number>,
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(payload)) {
    if (typeof value === 'number' && idMap.has(value)) {
      out[key] = idMap.get(value);
    } else {
      out[key] = value;
    }
  }
  return out;
}

function getCacheTable(collectionName: string): Table<Record<string, unknown>, number> | undefined {
  return (offlineDb as unknown as Record<string, unknown>)[collectionName] as
    | Table<Record<string, unknown>, number>
    | undefined;
}

// ─── Connectivity probe ───────────────────────────────────────────────────────

let _probeTimer: ReturnType<typeof setInterval> | null = null;

/**
 * Lightweight connectivity check.
 * Uses a tiny request (1 record) with its own short timeout so it does not
 * interfere with the global 10 s axios timeout.
 */
async function checkConnectivity(): Promise<boolean> {
  try {
    await api.get('mairies', { params: { _limit: 1 }, timeout: 5000 });
    return true;
  } catch {
    return false;
  }
}

/**
 * Start polling the API every PROBE_INTERVAL_MS while we are offline.
 *
 * Runs in both `offline-sync` and `online` modes: in `online` mode there is no
 * local fallback, so the app stays unusable until the server is reachable
 * again — the probe is what unblocks it after a transient outage.
 */
function startConnectivityPolling(): void {
  if (_probeTimer !== null) return; // already running
  _probeTimer = setInterval(() => {
    if (isOnline.value) {
      stopConnectivityPolling();
      return;
    }
    checkConnectivity()
      .then((reachable) => {
        if (reachable) {
          console.log('[Sync] Connectivity restored (detected by probe).');
          isOnline.value = true;
          stopConnectivityPolling();
          if (useSyncQueue.value) {
            syncPendingChanges().catch((e) => console.error('[Sync] Post-probe sync error:', e));
          }
        }
      })
      .catch(() => {
        // probe failed — stay offline
      });
  }, PROBE_INTERVAL_MS);
}

function stopConnectivityPolling(): void {
  if (_probeTimer !== null) {
    clearInterval(_probeTimer);
    _probeTimer = null;
  }
}

// ─── Cache prefetch ───────────────────────────────────────────────────────────

const PREFETCH_KEY = '_tresor_lastPrefetch';

/**
 * Downloads all collections into the Dexie cache so the app has fresh data
 * available when the user goes offline later.
 *
 * Throttled by PREFETCH_INTERVAL_MS — runs at most once per hour.
 * Errors are swallowed per-collection so a single slow endpoint cannot block
 * the rest of the prefetch.
 */
export async function prefetchAllCollections(): Promise<void> {
  if (!useCache.value) return;

  if (typeof localStorage !== 'undefined') {
    const last = localStorage.getItem(PREFETCH_KEY);
    if (last && Date.now() - parseInt(last, 10) < PREFETCH_INTERVAL_MS) return;
  }

  console.log('[Sync] Prefetching all collections into offline cache…');

  for (const col of ALL_COLLECTIONS) {
    try {
      const { data } = await api.get<{ ok: boolean; data: Record<string, unknown>[] }>(col);
      const results = data.data ?? [];
      const cache = getCacheTable(col);
      if (cache && results.length > 0) {
        await cache.bulkPut(results);
      }
    } catch {
      // Non-critical — a partial prefetch is better than none
    }
  }

  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(PREFETCH_KEY, String(Date.now()));
  }

  console.log('[Sync] Prefetch complete.');
}

// ─── Main sync logic ──────────────────────────────────────────────────────────

let _syncing = false;

export async function syncPendingChanges(): Promise<void> {
  if (!useSyncQueue.value) return;
  if (_syncing) return;
  _syncing = true;

  try {
    const queue = await offlineDb._syncQueue.orderBy('timestamp').toArray();
    if (queue.length === 0) return;

    console.log(`[Sync] Flushing ${queue.length} pending operation(s)…`);

    /** localId → serverId for items created offline during this sync run. */
    const idMap = new Map<number, number>();

    for (const entry of queue) {
      try {
        await processEntry(entry, idMap);
        await offlineDb._syncQueue.delete(entry.id!);
      } catch (e) {
        if (isOfflineError(e)) {
          // Transient network failure — stop here and retry on next reconnection.
          console.warn(`[Sync] Network failure mid-sync. Will retry later.`);
          isOnline.value = false;
          startConnectivityPolling();
          break;
        }

        // Server-side error — increment retry counter.
        const retries = (entry.retryCount ?? 0) + 1;
        console.error(
          `[Sync] Server error (attempt ${retries}/${MAX_SYNC_RETRIES}) for ${entry.op} on ${entry.collection}:`,
          e,
        );
        await offlineDb._syncQueue.update(entry.id!, { retryCount: retries });

        if (retries >= MAX_SYNC_RETRIES) {
          // Permanently failed — skip this entry so the rest of the queue can proceed.
          console.error(
            `[Sync] Entry permanently failed after ${MAX_SYNC_RETRIES} attempts — skipping.`,
            entry,
          );
          continue;
        }

        // First / second failure — stop and retry next cycle.
        break;
      }
    }

    console.log('[Sync] Done.');
  } finally {
    _syncing = false;
  }
}

async function processEntry(entry: SyncEntry, idMap: Map<number, number>): Promise<void> {
  const col = entry.collection;

  switch (entry.op) {
    // ── add ────────────────────────────────────────────────────────────────
    case 'add': {
      const raw = entry.payload as Record<string, unknown>;
      const remapped = remapPayload(raw, idMap);
      delete remapped['id']; // Remove the local auto-increment ID

      const { data } = await api.post<{ ok: boolean; id: number }>(col, remapped);
      const serverId = data.id;

      if (entry.localId !== undefined) {
        idMap.set(entry.localId, serverId);

        // Replace temp entry in cache with real server ID
        const cache = getCacheTable(col);
        if (cache) {
          const existing = await cache.get(entry.localId);
          if (existing) {
            await cache.delete(entry.localId);
            await cache.put({ ...existing, id: serverId });
          }
        }
      }
      break;
    }

    // ── put ────────────────────────────────────────────────────────────────
    case 'put': {
      const raw = entry.payload as Record<string, unknown>;
      const remapped = remapPayload(raw, idMap);
      const id =
        entry.serverId ?? (entry.localId !== undefined ? idMap.get(entry.localId) : undefined);
      if (id) {
        await api.put(`${col}/${id}`, { ...remapped, id });
      }
      break;
    }

    // ── update ─────────────────────────────────────────────────────────────
    case 'update': {
      const raw = entry.payload as Record<string, unknown>;
      const remapped = remapPayload(raw, idMap);
      const id =
        entry.serverId ?? (entry.localId !== undefined ? idMap.get(entry.localId) : undefined);
      if (id) {
        await api.put(`${col}/${id}`, remapped);
      }
      break;
    }

    // ── delete ─────────────────────────────────────────────────────────────
    case 'delete': {
      if (entry.serverId) {
        await api.delete(`${col}/${entry.serverId}`);
      }
      break;
    }

    // ── bulkPut ────────────────────────────────────────────────────────────
    case 'bulkPut': {
      const items = (entry.payload as Record<string, unknown>[]).map((item) =>
        remapPayload(item, idMap),
      );
      await api.put(`${col}/bulk`, items);
      break;
    }

    // ── bulkDelete ─────────────────────────────────────────────────────────
    case 'bulkDelete': {
      const ids = entry.payload as number[];
      await Promise.all(ids.map((id) => api.delete(`${col}/${id}`)));
      break;
    }
  }
}

// ─── Initialisation ───────────────────────────────────────────────────────────

/** Call once from the app boot file. */
export function initSyncService(): void {
  if (typeof window === 'undefined') return;

  // In pure offline mode, nothing to do.
  if (!useApi.value) return;

  window.addEventListener('online', () => {
    isOnline.value = true;
    stopConnectivityPolling();
    if (useSyncQueue.value) {
      syncPendingChanges().catch((e) => console.error('[Sync] Error during sync:', e));
    }
  });

  window.addEventListener('offline', () => {
    isOnline.value = false;
    startConnectivityPolling();
  });

  // The Collection layer flips `isOnline` to false as soon as a request fails
  // at the network level (server down while the WiFi link stays up). Without
  // this watcher nothing would ever probe the API again, and the app would
  // stay stuck offline until a full reload — especially visible in `online`
  // mode, which has no local fallback.
  watch(isOnline, (online) => {
    if (online) stopConnectivityPolling();
    else startConnectivityPolling();
  });

  if (navigator.onLine) {
    // Flush any pending changes that were queued before the last session ended.
    if (useSyncQueue.value) {
      syncPendingChanges().catch((e) => console.error('[Sync] Startup sync error:', e));
    }
    // Warm up the local cache so every page is ready for offline use.
    if (useCache.value) {
      prefetchAllCollections().catch((e) => console.error('[Sync] Prefetch error:', e));
    }
  } else {
    isOnline.value = false;
    // App started offline — begin probing so we catch reconnection automatically.
    startConnectivityPolling();
  }
}
