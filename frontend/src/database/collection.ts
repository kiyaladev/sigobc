/**
 * collection.ts
 *
 * Offline-first data access layer.
 *
 * ┌──────────────────────────────────────────────────────────────────┐
 * │  Online mode  (isOnline = true)                                  │
 * │   Reads  → API  → upsert results to Dexie cache → return        │
 * │   Writes → API  → update Dexie cache             → return       │
 * ├──────────────────────────────────────────────────────────────────┤
 * │  Offline mode (isOnline = false, or network failure)             │
 * │   Reads  → Dexie cache                                           │
 * │   Writes → Dexie cache (temp negative ID) + _syncQueue entry     │
 * └──────────────────────────────────────────────────────────────────┘
 *
 * When the connection is restored (sync.ts), pending _syncQueue entries
 * are replayed against the API and temp IDs are remapped to server IDs.
 *
 * Public API is identical to the old Dexie EntityTable so all 40+ pages
 * continue to work without changes.
 */

import axios from 'axios';
import type { Table } from 'dexie';
import { api } from 'src/boot/axios';
import { isOnline, useApi, useCache, useSyncQueue } from './connectivity';
import { offlineDb, nextTempId, type SyncOp } from './offline-db';

// ─── helpers ─────────────────────────────────────────────────────────────────

/** Returns true when the error is a network failure (no server response). */
function isOfflineError(error: unknown): boolean {
  return axios.isAxiosError(error) && !error.response;
}

type Filter = Record<string, unknown>;
type CacheTable = Table<Record<string, unknown>, number>;

// ─── FieldQuery — returned by where(field: string) ───────────────────────────

/**
 * Represents a field expression before the comparator is chosen.
 * e.g. `db.mandats.where('exercice')` returns a FieldQuery.
 */
export class FieldQuery<T> {
  constructor(
    private col: Collection<T>,
    private field: string,
  ) {}

  equals(val: unknown): WhereClause<T> {
    return new WhereClause(this.col, this.field, val);
  }

  below(val: unknown): AndClause<T> {
    const field = this.field;
    return new AndClause(this.col, {}, (item) => {
      const v = (item as Record<string, unknown>)[field] as number | string | Date | undefined;
      return v != null && v < (val as typeof v);
    });
  }

  above(val: unknown): AndClause<T> {
    const field = this.field;
    return new AndClause(this.col, {}, (item) => {
      const v = (item as Record<string, unknown>)[field] as number | string | Date | undefined;
      return v != null && v > (val as typeof v);
    });
  }

  between(lower: unknown, upper: unknown): AndClause<T> {
    const field = this.field;
    return new AndClause(this.col, {}, (item) => {
      const v = (item as Record<string, unknown>)[field] as number | string | undefined;
      return v != null && v >= (lower as typeof v) && v <= (upper as typeof v);
    });
  }

  equalsIgnoreCase(val: string): AndClause<T> {
    const field = this.field;
    const lower = val.toLowerCase();
    return new AndClause(this.col, {}, (item) => {
      const v = (item as Record<string, unknown>)[field];
      return typeof v === 'string' && v.toLowerCase() === lower;
    });
  }
}

// ─── MatchClause — returned by where(filter: object) ─────────────────────────

/**
 * Represents a multi-field equality filter passed as an object.
 * e.g. `db.previsions.where({ chapitreId: 5 })`
 */
export class MatchClause<T> {
  constructor(
    private col: Collection<T>,
    private fieldFilter: Filter,
  ) {}

  async toArray(): Promise<T[]> {
    return this.col.toArray(this.fieldFilter);
  }

  async first(): Promise<T | undefined> {
    return (await this.toArray())[0];
  }

  async count(): Promise<number> {
    return this.col.count(this.fieldFilter);
  }

  /** Update all matching items with the given partial changes. */
  async modify(changes: Partial<T>): Promise<void> {
    const items = await this.toArray();
    for (const item of items) {
      const id = (item as { id?: number }).id;
      if (id !== undefined) await this.col.update(id, changes);
    }
  }
}

// ─── LimitClause — returned by .limit(n) ─────────────────────────────────────

class LimitClause<T> {
  constructor(
    private parent: { toArray(): Promise<T[]> },
    private n: number,
  ) {}

  async toArray(): Promise<T[]> {
    return (await this.parent.toArray()).slice(0, this.n);
  }

  async first(): Promise<T | undefined> {
    return (await this.toArray())[0];
  }
}

// ─── WhereClause — returned by FieldQuery.equals() ───────────────────────────

export class WhereClause<T> {
  constructor(
    private col: Collection<T>,
    private field: string,
    private value: unknown,
  ) {}

  private get _fieldFilter(): Filter {
    return { [this.field]: this.value };
  }

  and(predicate: (item: T) => boolean): AndClause<T> {
    return new AndClause(this.col, this._fieldFilter, predicate);
  }

  /** Filter results by predicate (Dexie-compat alias for `.and()`). */
  filter(predicate: (item: T) => boolean): AndClause<T> {
    return new AndClause(this.col, this._fieldFilter, predicate);
  }

  async toArray(): Promise<T[]> {
    return this.col.toArray(this._fieldFilter);
  }

  async first(): Promise<T | undefined> {
    const items = await this.col.toArray({ ...this._fieldFilter, _limit: 1 });
    return items[0];
  }

  async count(): Promise<number> {
    return this.col.count(this._fieldFilter);
  }

  limit(n: number): LimitClause<T> {
    return new LimitClause(this, n);
  }

  /** Update all matching items with the given partial changes. */
  async modify(changes: Partial<T>): Promise<void> {
    const items = await this.toArray();
    for (const item of items) {
      const id = (item as { id?: number }).id;
      if (id !== undefined) await this.col.update(id, changes);
    }
  }

  async sortBy(sortField: string): Promise<T[]> {
    return this.col.toArray({ ...this._fieldFilter, _sort: sortField });
  }

  async last(sortField?: string): Promise<T | undefined> {
    const items = sortField
      ? await this.col.toArray({ ...this._fieldFilter, _sort: sortField })
      : await this.col.toArray(this._fieldFilter);
    return items[items.length - 1];
  }

  anyOf(values: unknown[]): AndClause<T> {
    const field = this.field;
    return new AndClause(this.col, {}, (item) => {
      const v = (item as Record<string, unknown>)[field];
      return values.includes(v);
    });
  }

  equalsIgnoreCase(val: string): AndClause<T> {
    const field = this.field;
    const lower = val.toLowerCase();
    return new AndClause(this.col, {}, (item) => {
      const v = (item as Record<string, unknown>)[field];
      return typeof v === 'string' && v.toLowerCase() === lower;
    });
  }
}

// ─── AndClause ────────────────────────────────────────────────────────────────

export class AndClause<T> {
  constructor(
    private col: Collection<T>,
    private serverFilter: Filter,
    private clientFilter: (item: T) => boolean,
  ) {}

  and(predicate: (item: T) => boolean): AndClause<T> {
    const prev = this.clientFilter;
    return new AndClause(this.col, this.serverFilter, (item) => prev(item) && predicate(item));
  }

  filter(predicate: (item: T) => boolean): AndClause<T> {
    return this.and(predicate);
  }

  async toArray(): Promise<T[]> {
    const items = await this.col.toArray(this.serverFilter);
    return items.filter(this.clientFilter);
  }

  async first(): Promise<T | undefined> {
    return (await this.toArray())[0];
  }

  async count(): Promise<number> {
    return (await this.toArray()).length;
  }

  limit(n: number): LimitClause<T> {
    return new LimitClause(this, n);
  }

  /** Delete all matching items. */
  async delete(): Promise<void> {
    const items = await this.toArray();
    for (const item of items) {
      const id = (item as { id?: number }).id;
      if (id !== undefined) await this.col.delete(id);
    }
  }

  async sortBy(sortField: string): Promise<T[]> {
    const items = await this.toArray();
    return [...items].sort((a, b) => {
      const av = (a as Record<string, unknown>)[sortField];
      const bv = (b as Record<string, unknown>)[sortField];
      if (av == null || bv == null) return 0;
      return av < bv ? -1 : av > bv ? 1 : 0;
    });
  }
}

// ─── OrderByClause ────────────────────────────────────────────────────────────

class OrderByClause<T> {
  constructor(
    private col: Collection<T>,
    private sortField: string,
  ) {}

  async toArray(): Promise<T[]> {
    return this.col.toArray({ _sort: this.sortField });
  }

  async first(): Promise<T | undefined> {
    return (await this.toArray())[0];
  }

  reverse(): ReverseClause<T> {
    return new ReverseClause(this.col, this.sortField);
  }
}

class ReverseClause<T> {
  constructor(
    private col: Collection<T>,
    private sortField: string,
  ) {}

  async toArray(): Promise<T[]> {
    return [...(await this.col.toArray({ _sort: this.sortField }))].reverse();
  }

  async first(): Promise<T | undefined> {
    return (await this.toArray())[0];
  }

  limit(n: number): LimitClause<T> {
    return new LimitClause(this, n);
  }
}

// ─── Collection ───────────────────────────────────────────────────────────────

export class Collection<T> {
  /**
   * @param endpoint  API path segment, e.g. `'mandats'`.
   *                  Must match the Dexie table name in OfflineDb.
   */
  constructor(private endpoint: string) {}

  // ── Cache helpers ─────────────────────────────────────────────────────────

  private get cache(): CacheTable | null {
    const tbl = (offlineDb as unknown as Record<string, unknown>)[this.endpoint];
    return (tbl as CacheTable | undefined) ?? null;
  }

  private async cacheUpsert(item: unknown): Promise<void> {
    try {
      await this.cache?.put(item as Record<string, unknown>);
    } catch {
      // non-critical — never block the caller
    }
  }

  private async cacheUpsertMany(items: unknown[]): Promise<void> {
    try {
      if (items.length > 0) await this.cache?.bulkPut(items as Record<string, unknown>[]);
    } catch {
      // non-critical
    }
  }

  private async cacheRemove(id: number): Promise<void> {
    try {
      await this.cache?.delete(id);
    } catch {
      // non-critical
    }
  }

  // ── Mode-aware predicates ──────────────────────────────────────────────
  /** Can we call the API right now? */
  private get canApi(): boolean {
    return useApi.value && isOnline.value;
  }
  /** Should we read/write the Dexie cache? */
  private get canCache(): boolean {
    return useCache.value;
  }
  /** Should we enqueue writes for later sync? (only in offline-sync mode) */
  private get canQueue(): boolean {
    return useSyncQueue.value;
  }

  // ── Writes ────────────────────────────────────────────────────────────────

  async add(item: Omit<T, 'id'>): Promise<number> {
    if (this.canApi) {
      try {
        const { data } = await api.post<{ ok: boolean; id: number }>(this.endpoint, item);
        isOnline.value = true;
        if (this.canCache) await this.cacheUpsert({ ...(item as object), id: data.id });
        return data.id;
      } catch (e) {
        if (!isOfflineError(e)) throw e;
        isOnline.value = false;
        if (!this.canCache) throw e;
      }
    }

    // ── local path (offline / offline-sync) ──
    const tempId = nextTempId();
    await this.cacheUpsert({ ...(item as object), id: tempId });
    if (this.canQueue) {
      await offlineDb._syncQueue.add({
        collection: this.endpoint,
        op: 'add',
        localId: tempId,
        payload: item,
        timestamp: Date.now(),
      });
    }
    return tempId;
  }

  /** Upsert: PUT if item has an id, POST otherwise. */
  async put(item: T | Omit<T, 'id'>): Promise<number> {
    const id = (item as { id?: number }).id;
    if (!id) return this.add(item as Omit<T, 'id'>);

    if (this.canApi) {
      try {
        await api.put(`${this.endpoint}/${id}`, item);
        isOnline.value = true;
        if (this.canCache) await this.cacheUpsert(item);
        return id;
      } catch (e) {
        if (!isOfflineError(e)) throw e;
        isOnline.value = false;
        if (!this.canCache) throw e;
      }
    }

    if (this.canCache) await this.cacheUpsert(item);
    if (this.canQueue) {
      const putEntry = {
        collection: this.endpoint,
        op: (id < 0 ? 'add' : 'put') as SyncOp,
        payload: item as unknown,
        timestamp: Date.now(),
      };
      if (id < 0) Object.assign(putEntry, { localId: id });
      else Object.assign(putEntry, { serverId: id });
      await offlineDb._syncQueue.add(putEntry);
    }
    return id;
  }

  async update(id: number | undefined, changes: Partial<T>): Promise<void> {
    if (id === undefined) return;
    if (this.canApi) {
      try {
        await api.put(`${this.endpoint}/${id}`, changes);
        isOnline.value = true;
        if (this.canCache) {
          const existing = await this.cache?.get(id);
          await this.cacheUpsert({ ...(existing ?? {}), ...(changes as object), id });
        }
        return;
      } catch (e) {
        if (!isOfflineError(e)) throw e;
        isOnline.value = false;
        if (!this.canCache) throw e;
      }
    }

    if (this.canCache) {
      const existing = await this.cache?.get(id);
      await this.cacheUpsert({ ...(existing ?? {}), ...(changes as object), id });
    }
    if (!this.canQueue) return;
    const updateEntry = {
      collection: this.endpoint,
      op: 'update' as const,
      payload: changes as unknown,
      timestamp: Date.now(),
    };
    if (id > 0) Object.assign(updateEntry, { serverId: id });
    else Object.assign(updateEntry, { localId: id });
    await offlineDb._syncQueue.add(updateEntry);
  }

  async delete(id: number | undefined): Promise<void> {
    if (id === undefined) return;
    if (this.canApi) {
      try {
        await api.delete(`${this.endpoint}/${id}`);
        isOnline.value = true;
        if (this.canCache) await this.cacheRemove(id);
        return;
      } catch (e) {
        if (!isOfflineError(e)) throw e;
        isOnline.value = false;
        if (!this.canCache) throw e;
      }
    }

    if (this.canCache) await this.cacheRemove(id);
    if (this.canQueue) {
      if (id > 0) {
        await offlineDb._syncQueue.add({
          collection: this.endpoint,
          op: 'delete',
          serverId: id,
          payload: null,
          timestamp: Date.now(),
        });
      } else {
        // Cancel pending add/put/update for this temp item
        const pending = await offlineDb._syncQueue.where('localId').equals(id).toArray();
        await offlineDb._syncQueue.bulkDelete(pending.map((p) => p.id!));
      }
    }
  }

  bulkAdd(items: Omit<T, 'id'>[]): Promise<number[]>;
  bulkAdd(items: unknown[]): Promise<number[]>;
  async bulkAdd(items: unknown[]): Promise<number[]> {
    if (this.canApi) {
      try {
        const { data } = await api.post<{ ok: boolean; ids: number[] }>(
          `${this.endpoint}/bulk`,
          items,
        );
        isOnline.value = true;
        const ids = data.ids ?? [];
        if (this.canCache)
          await this.cacheUpsertMany(items.map((item, i) => ({ ...(item as object), id: ids[i] })));
        return ids;
      } catch (e) {
        if (!isOfflineError(e)) throw e;
        isOnline.value = false;
        if (!this.canCache) throw e;
      }
    }

    // Queue each item as an individual 'add' so tempId remapping works correctly
    const tempIds: number[] = [];
    for (const item of items) {
      const tempId = nextTempId();
      tempIds.push(tempId);
      await this.cacheUpsert({ ...(item as object), id: tempId });
      if (this.canQueue) {
        await offlineDb._syncQueue.add({
          collection: this.endpoint,
          op: 'add',
          localId: tempId,
          payload: item,
          timestamp: Date.now(),
        });
      }
    }
    return tempIds;
  }

  async bulkPut(items: T[]): Promise<void> {
    if (this.canApi) {
      try {
        await api.put(`${this.endpoint}/bulk`, items);
        isOnline.value = true;
        if (this.canCache) await this.cacheUpsertMany(items);
        return;
      } catch (e) {
        if (!isOfflineError(e)) throw e;
        isOnline.value = false;
        if (!this.canCache) throw e;
      }
    }

    if (this.canCache) await this.cacheUpsertMany(items);
    if (this.canQueue) {
      await offlineDb._syncQueue.add({
        collection: this.endpoint,
        op: 'bulkPut',
        payload: items,
        timestamp: Date.now(),
      });
    }
  }

  async bulkDelete(ids: number[]): Promise<void> {
    if (this.canApi) {
      try {
        await Promise.all(ids.map((id) => api.delete(`${this.endpoint}/${id}`)));
        isOnline.value = true;
        if (this.canCache) await Promise.all(ids.map((id) => this.cacheRemove(id)));
        return;
      } catch (e) {
        if (!isOfflineError(e)) throw e;
        isOnline.value = false;
        if (!this.canCache) throw e;
      }
    }

    if (this.canCache) await Promise.all(ids.map((id) => this.cacheRemove(id)));
    if (this.canQueue) {
      const serverIds = ids.filter((id) => id > 0);
      if (serverIds.length > 0) {
        await offlineDb._syncQueue.add({
          collection: this.endpoint,
          op: 'bulkDelete',
          payload: serverIds,
          timestamp: Date.now(),
        });
      }
    }
  }

  // ── Reads ─────────────────────────────────────────────────────────────────

  async get(id: number): Promise<T | undefined> {
    if (this.canApi) {
      try {
        const { data } = await api.get<{ ok: boolean; data: T }>(`${this.endpoint}/${id}`);
        isOnline.value = true;
        if (this.canCache) await this.cacheUpsert(data.data);
        return data.data;
      } catch (e) {
        if (!isOfflineError(e)) return undefined;
        isOnline.value = false;
      }
    }

    if (this.canCache) {
      const cached = await this.cache?.get(id);
      return cached as T | undefined;
    }
    return undefined;
  }

  async toArray(filter?: Filter): Promise<T[]> {
    if (this.canApi) {
      try {
        const { data } = await api.get<{ ok: boolean; data: T[] }>(this.endpoint, {
          params: filter,
        });
        isOnline.value = true;
        const results = data.data ?? [];

        if (this.canCache) {
          if (!filter && this.cache) {
            // Full fetch — evict stale server-side items from cache
            const serverIds = new Set(
              results
                .map((r) => (r as { id?: number }).id)
                .filter((id): id is number => id !== undefined),
            );
            const cached = await this.cache.toArray();
            const toEvict = cached
              .filter((c) => typeof c.id === 'number' && c.id > 0 && !serverIds.has(c.id))
              .map((c) => c.id as number);
            if (toEvict.length > 0) await this.cache.bulkDelete(toEvict);
          }
          await this.cacheUpsertMany(results);
        }

        return results;
      } catch (e) {
        if (!isOfflineError(e)) throw e;
        isOnline.value = false;
      }
    }

    if (this.canCache) return this._queryCache(filter);
    return [];
  }

  async count(filter?: Filter): Promise<number> {
    if (this.canApi) {
      try {
        const { data } = await api.get<{ ok: boolean; count: number }>(`${this.endpoint}/count`, {
          params: filter,
        });
        isOnline.value = true;
        return data.count ?? 0;
      } catch (e) {
        if (!isOfflineError(e)) throw e;
        isOnline.value = false;
      }
    }

    if (this.canCache) return (await this._queryCache(filter)).length;
    return 0;
  }

  // ── Cache query (offline reads) ───────────────────────────────────────────

  private async _queryCache(filter?: Filter): Promise<T[]> {
    const cache = this.cache;
    if (!cache) return [];

    const { _sort, _limit, _skip, ...fieldFilters } = (filter ?? {}) as Record<string, unknown>;
    const entries = Object.entries(fieldFilters);

    let results: Record<string, unknown>[];

    if (entries.length > 0) {
      const [firstField, firstValue] = entries[0]!;
      try {
        results = await cache
          .where(firstField)
          .equals(firstValue as string | number)
          .toArray();
        for (const [k, v] of entries.slice(1)) {
          results = results.filter((item) => item[k] === v);
        }
      } catch {
        // Field not indexed — full table scan with in-memory filter
        results = await cache.toArray();
        for (const [k, v] of entries) {
          results = results.filter((item) => item[k] === v);
        }
      }
    } else {
      results = await cache.toArray();
    }

    if (_sort) {
      const key = _sort as string;
      results = [...results].sort((a, b) => {
        const av = a[key],
          bv = b[key];
        if (av == null || bv == null) return 0;
        return av < bv ? -1 : av > bv ? 1 : 0;
      });
    }

    if (_skip) results = results.slice(Number(_skip));
    if (_limit) results = results.slice(0, Number(_limit));

    return results as unknown as T[];
  }

  // ── Query builders ────────────────────────────────────────────────────────

  where(field: string): FieldQuery<T>;
  where(filter: Record<string, unknown>): MatchClause<T>;
  where(fieldOrFilter: string | Record<string, unknown>): FieldQuery<T> | MatchClause<T> {
    if (typeof fieldOrFilter === 'string') return new FieldQuery<T>(this, fieldOrFilter);
    return new MatchClause<T>(this, fieldOrFilter);
  }

  orderBy(field: string): OrderByClause<T> {
    return new OrderByClause<T>(this, field);
  }

  filter(predicate: (item: T) => boolean): AndClause<T> {
    return new AndClause<T>(this, {}, predicate);
  }

  /** Clear all items in the collection (fetches IDs then bulk-deletes). */
  async clear(): Promise<void> {
    const items = await this.toArray();
    const ids = items
      .map((item) => (item as { id?: number }).id)
      .filter((id): id is number => id !== undefined);
    if (ids.length > 0) await this.bulkDelete(ids);
    await this.cache?.clear();
  }

  /**
   * Dexie shim: returns a minimal collection-like object for backward-compat.
   * Supports `.first()` and `.toArray()`.
   */
  toCollection(): { first: () => Promise<T | undefined>; toArray: () => Promise<T[]> } {
    return {
      first: () => this.toArray().then((items) => items[0]),
      toArray: () => this.toArray(),
    };
  }

  // ── Dexie transaction shim (no real ACID — runs callback directly) ────────

  async transaction(
    _mode: string,
    _tables: Collection<unknown>[],
    callback: () => Promise<void>,
  ): Promise<void> {
    await callback();
  }
}
