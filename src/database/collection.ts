/**
 * Collection — wrapper compatible avec l'API Dexie autour d'axios.
 *
 * Remplace `EntityTable<T,'id'>` de Dexie tout en conservant la même interface
 * afin de minimiser les changements dans les 40+ pages.
 *
 * Patterns supportés :
 *   db.mandats.add(mandat)                          → POST /api/mandats
 *   db.mandats.put(mandat)                          → PUT /api/mandats/:id  (ou POST si pas d'id)
 *   db.mandats.update(id, changes)                  → PUT /api/mandats/:id
 *   db.mandats.delete(id)                           → DELETE /api/mandats/:id
 *   db.mandats.get(id)                              → GET /api/mandats/:id
 *   db.mandats.toArray()                            → GET /api/mandats
 *   db.mandats.count()                              → GET /api/mandats/count
 *   db.mandats.bulkAdd(items)                       → POST /api/mandats/bulk
 *   db.mandats.bulkPut(items)                       → PUT /api/mandats/bulk
 *   db.mandats.where('field').equals(val).toArray() → GET /api/mandats?field=val
 *   db.mandats.where('field').equals(val).and(fn)
 *              .toArray()                           → GET + client-side filter
 *   db.mandats.where('field').equals(val).first()   → GET ?field=val&_limit=1
 *   db.mandats.where('field').equals(val).count()   → GET /api/mandats/count?field=val
 *   db.mandats.orderBy('field').toArray()           → GET /api/mandats?_sort=field
 */

import { api } from 'src/boot/axios';

// ─── internal types ───────────────────────────────────────────────────────────

type Filter = Record<string, unknown>;

// ─── WhereClause ──────────────────────────────────────────────────────────────

export class WhereClause<T> {
  constructor(
    private col: Collection<T>,
    private field: string,
    private value: unknown,
  ) {}

  private get filter(): Filter {
    return { [this.field]: this.value };
  }

  and(predicate: (item: T) => boolean): AndClause<T> {
    return new AndClause(this.col, this.filter, predicate);
  }

  async toArray(): Promise<T[]> {
    return this.col.toArray(this.filter);
  }

  async first(): Promise<T | undefined> {
    const items = await this.col.toArray({ ...this.filter, _limit: 1 });
    return items[0];
  }

  async count(): Promise<number> {
    return this.col.count(this.filter);
  }

  async sortBy(sortField: string): Promise<T[]> {
    return this.col.toArray({ ...this.filter, _sort: sortField });
  }

  /** Collect all results then return the last once sorted by `sortField` */
  async last(sortField?: string): Promise<T | undefined> {
    const items = sortField
      ? await this.col.toArray({ ...this.filter, _sort: sortField })
      : await this.col.toArray(this.filter);
    return items[items.length - 1];
  }

  /** Supports Dexie-style `.between(lower, upper)` → fetched on server,
   *  but requires that the field is filterable as exact match.
   *  For simple ranges only (lte/gte won't be sent — items are
   *  fetched by base filter and filtered client-side). */
  between(lower: unknown, upper: unknown): AndClause<T> {
    return new AndClause(this.col, {}, (item) => {
      const v = (item as Record<string, unknown>)[this.field];
      return v !== undefined && v >= (lower as never) && v <= (upper as never);
    });
  }

  /** Dexie `.anyOf(values)` → fetch all then filter client-side */
  anyOf(values: unknown[]): AndClause<T> {
    return new AndClause(this.col, {}, (item) => {
      const v = (item as Record<string, unknown>)[this.field];
      return values.includes(v);
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

  async toArray(): Promise<T[]> {
    const items = await this.col.toArray(this.serverFilter);
    return items.filter(this.clientFilter);
  }

  async first(): Promise<T | undefined> {
    const items = await this.toArray();
    return items[0];
  }

  async count(): Promise<number> {
    const items = await this.toArray();
    return items.length;
  }

  async sortBy(sortField: string): Promise<T[]> {
    const items = await this.toArray();
    return [...items].sort((a, b) => {
      const av = (a as Record<string, unknown>)[sortField];
      const bv = (b as Record<string, unknown>)[sortField];
      if (av === undefined || bv === undefined) return 0;
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
    const items = await this.col.toArray({ _sort: this.sortField });
    return [...items].reverse();
  }
}

// ─── Collection ───────────────────────────────────────────────────────────────

export class Collection<T> {
  constructor(private endpoint: string) {}

  // ── writes ───────────────────────────────────────────────────────────────

  async add(item: Omit<T, 'id'>): Promise<number> {
    const { data } = await api.post<{ ok: boolean; id: number }>(this.endpoint, item);
    return data.id;
  }

  /** Upsert: if item has an `id` call PUT, else call POST */
  async put(item: T | Omit<T, 'id'>): Promise<number> {
    const id = (item as { id?: number }).id;
    if (id) {
      await api.put(`${this.endpoint}/${id}`, item);
      return id;
    }
    return this.add(item as Omit<T, 'id'>);
  }

  async update(id: number, changes: Partial<T>): Promise<void> {
    await api.put(`${this.endpoint}/${id}`, changes);
  }

  async delete(id: number): Promise<void> {
    await api.delete(`${this.endpoint}/${id}`);
  }

  async bulkAdd(items: Omit<T, 'id'>[]): Promise<number[]> {
    const { data } = await api.post<{ ok: boolean; ids: number[] }>(`${this.endpoint}/bulk`, items);
    return data.ids ?? [];
  }

  async bulkPut(items: T[]): Promise<void> {
    await api.put(`${this.endpoint}/bulk`, items);
  }

  async bulkDelete(ids: number[]): Promise<void> {
    await Promise.all(ids.map((id) => api.delete(`${this.endpoint}/${id}`)));
  }

  // ── reads ────────────────────────────────────────────────────────────────

  async get(id: number): Promise<T | undefined> {
    try {
      const { data } = await api.get<{ ok: boolean; data: T }>(`${this.endpoint}/${id}`);
      return data.data;
    } catch {
      return undefined;
    }
  }

  async toArray(filter?: Filter): Promise<T[]> {
    const { data } = await api.get<{ ok: boolean; data: T[] }>(this.endpoint, {
      params: filter,
    });
    return data.data ?? [];
  }

  async count(filter?: Filter): Promise<number> {
    const { data } = await api.get<{ ok: boolean; count: number }>(`${this.endpoint}/count`, {
      params: filter,
    });
    return data.count ?? 0;
  }

  // ── query builders ───────────────────────────────────────────────────────

  where(field: string): { equals: (val: unknown) => WhereClause<T> } {
    return {
      equals: (val: unknown) => new WhereClause<T>(this, field, val),
    };
  }

  orderBy(field: string): OrderByClause<T> {
    return new OrderByClause<T>(this, field);
  }

  filter(predicate: (item: T) => boolean): AndClause<T> {
    return new AndClause<T>(this, {}, predicate);
  }

  // ── Dexie transaction shim (no real ACID — runs callback directly) ───────

  async transaction(
    _mode: string,
    _tables: Collection<unknown>[],
    callback: () => Promise<void>,
  ): Promise<void> {
    await callback();
  }
}
