import { ref, computed } from 'vue';

// ─── Data mode ────────────────────────────────────────────────────────────────

/**
 * Three operating modes for data access:
 *
 * - `offline`      — Dexie (IndexedDB) only. No API calls at all.
 *                     Ideal when there is no server or no internet for days.
 *
 * - `offline-sync` — Offline-first with background sync.
 *                     Reads/writes go through Dexie, API is used when
 *                     reachable, and a sync queue replays missed writes.
 *                     Recommended for zones with unstable connectivity.
 *
 * - `online`       — API only. No Dexie cache.
 *                     For offices with stable broadband.
 *
 * `offline` is the default: an installation that has never been pointed at a
 * server must keep working exactly as before, without silent network calls.
 */
export type DataMode = 'offline' | 'offline-sync' | 'online';

const STORAGE_KEY = '_tresor_dataMode';

function loadMode(): DataMode {
  if (typeof localStorage === 'undefined') return 'offline';
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'offline' || stored === 'offline-sync' || stored === 'online') return stored;
  return 'offline';
}

/** The user-chosen data mode, persisted in localStorage. */
export const dataMode = ref<DataMode>(loadMode());

export function setDataMode(mode: DataMode): void {
  dataMode.value = mode;
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, mode);
  }
}

// ─── Derived flags (used by collection.ts & sync.ts) ──────────────────────────

/** True when the backend API is reachable, false when offline. */
export const isOnline = ref(typeof navigator !== 'undefined' ? navigator.onLine : true);

/** Should the Collection class attempt API calls? */
export const useApi = computed(() => dataMode.value !== 'offline');

/** Should the Collection class read/write the Dexie cache? */
export const useCache = computed(() => dataMode.value !== 'online');

/** Should the sync service run? */
export const useSyncQueue = computed(() => dataMode.value === 'offline-sync');
