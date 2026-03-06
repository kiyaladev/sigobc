/**
 * offline-db.ts
 *
 * Dexie (IndexedDB) database used as:
 *   1. Read-through cache — every successful API fetch updates the local tables.
 *   2. Offline store    — when the API is unreachable, reads come from here
 *                          and writes are queued in `_syncQueue`.
 *
 * Primary keys use explicit `id` (not `++id`) because server-assigned
 * integer IDs must be preserved.  Offline-created items receive temporary
 * negative IDs (see `nextTempId`) until they are synced and remapped.
 */

import Dexie, { type Table } from 'dexie';

// ─── Sync queue ───────────────────────────────────────────────────────────────

export type SyncOp = 'add' | 'put' | 'update' | 'delete' | 'bulkPut' | 'bulkDelete';

export interface SyncEntry {
  id?: number; // Dexie auto-increment key
  collection: string; // API endpoint, e.g. 'mandats'
  op: SyncOp;
  localId?: number; // Temporary negative ID assigned offline
  serverId?: number; // Real server ID
  payload: unknown; // Data for add / put / update / bulkPut / bulkDelete
  timestamp: number;
  retryCount?: number; // Incremented each time the server rejects this entry
}

// ─── Offline Dexie DB ─────────────────────────────────────────────────────────

export class OfflineDb extends Dexie {
  // ── Meta ──────────────────────────────────────────────────────────────────
  _syncQueue!: Table<SyncEntry, number>;

  // ── Auth / Mairie ─────────────────────────────────────────────────────────
  mairies!: Table<Record<string, unknown>, number>;
  utilisateurs!: Table<Record<string, unknown>, number>;

  // ── App3 - Dépenses ───────────────────────────────────────────────────────
  chapitres!: Table<Record<string, unknown>, number>;
  sousChapitres!: Table<Record<string, unknown>, number>;
  previsions!: Table<Record<string, unknown>, number>;
  mandats!: Table<Record<string, unknown>, number>;
  bordereauMandats!: Table<Record<string, unknown>, number>;
  etatFinancierMensuel!: Table<Record<string, unknown>, number>;

  // ── App6 - Recettes ───────────────────────────────────────────────────────
  taxes!: Table<Record<string, unknown>, number>;
  declarations!: Table<Record<string, unknown>, number>;
  bordereauxRecette!: Table<Record<string, unknown>, number>;
  previsionsRecettes!: Table<Record<string, unknown>, number>;
  mandatsRecette!: Table<Record<string, unknown>, number>;
  bordereauMandatsRecette!: Table<Record<string, unknown>, number>;
  chapitresRecette!: Table<Record<string, unknown>, number>;
  etatFinancierMensuelRecette!: Table<Record<string, unknown>, number>;

  // ── App7 - Employés ───────────────────────────────────────────────────────
  employes!: Table<Record<string, unknown>, number>;
  fichesPaie!: Table<Record<string, unknown>, number>;
  conges!: Table<Record<string, unknown>, number>;
  ordresMission!: Table<Record<string, unknown>, number>;
  parametresPaie!: Table<Record<string, unknown>, number>;
  servicesApp7!: Table<Record<string, unknown>, number>;

  // ── Misc ──────────────────────────────────────────────────────────────────
  printData!: Table<Record<string, unknown>, number>;
  exercices!: Table<Record<string, unknown>, number>;

  constructor() {
    super('TresorOfflineDB');

    this.version(1).stores({
      _syncQueue: '++id, collection, op, timestamp',

      // Auth / Mairie
      mairies: 'id, nom, code, ville',
      utilisateurs: 'id, username, email, role, mairieId, actif',

      // App3
      chapitres: 'id, code, libelle, mairieId, actif',
      sousChapitres: 'id, code, libelle, parentId, mairieId, actif',
      previsions: 'id, exercice, chapitreId, mairieId, statut',
      mandats:
        'id, numeroMandat, exercice, chapitreId, sousChapitreId, bordereauMandatId, mairieId, statut',
      bordereauMandats: 'id, numero, exercice, mairieId, statut',
      etatFinancierMensuel: 'id, annee, sousChapitreId, chapitreId, mairieId',

      // App6
      taxes: 'id, code, libelle, mairieId, type, actif',
      declarations: 'id, numeroPiece, mairieId, taxeId, statut, exercice, bordereauId',
      bordereauxRecette: 'id, numero, annee, mairieId, statut',
      previsionsRecettes: 'id, exercice, taxeId, mairieId, statut',
      mandatsRecette: 'id, numeroMandat, exercice, chapitreId, taxeId, mairieId, statut',
      bordereauMandatsRecette: 'id, numero, exercice, mairieId, statut',
      chapitresRecette: 'id, code, libelle, mairieId, actif',
      etatFinancierMensuelRecette: 'id, annee, taxeId, chapitreRecetteId, mairieId',

      // App7
      employes: 'id, matricule, nom, mairieId, actif',
      fichesPaie: 'id, employeId, mois, annee, exercice, mairieId, statut',
      conges: 'id, employeId, type, statut, mairieId',
      ordresMission: 'id, numero, employeId, exercice, statut, mairieId',
      parametresPaie: 'id, mairieId',
      servicesApp7: 'id, nom, mairieId, actif',

      // Misc
      printData: 'id, type, createdAt',
      exercices: 'id, annee, statut, mairieId',
    });
  }
}

export const offlineDb = new OfflineDb();

// ─── Temporary ID generator ───────────────────────────────────────────────────

/**
 * Persisted in localStorage so the counter never restarts at -1 after a page
 * reload.  Without this, a second offline session would produce IDs that
 * collide with items already sitting in the sync queue from the first session.
 */
const COUNTER_KEY = '_tresor_tempIdCounter';

let _tempIdCounter: number = (() => {
  if (typeof localStorage === 'undefined') return -1;
  const stored = localStorage.getItem(COUNTER_KEY);
  return stored ? parseInt(stored, 10) : -1;
})();

export function nextTempId(): number {
  const id = _tempIdCounter--;
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(COUNTER_KEY, String(_tempIdCounter));
  }
  return id;
}

/** Reset after the sync queue is fully drained (called by sync.ts). */
export function resetTempIdCounter(): void {
  _tempIdCounter = -1;
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem(COUNTER_KEY);
  }
}
