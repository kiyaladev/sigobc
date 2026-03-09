/**
 * offline-db.ts
 *
 * Dexie (IndexedDB) database used as:
 *   1. Read-through cache — every successful API fetch updates the local tables.
 *   2. Offline store    — when the API is unreachable, reads come from here
 *                          and writes are queued in `_syncQueue`.
 *
 * Primary keys use `++id` (auto-increment) so Dexie assigns sequential IDs
 * automatically when no explicit `id` is provided.
 */

import Dexie, { type Table } from 'dexie';

// ─── Sync queue ───────────────────────────────────────────────────────────────

export type SyncOp = 'add' | 'put' | 'update' | 'delete' | 'bulkPut' | 'bulkDelete';

export interface SyncEntry {
  id?: number; // Dexie auto-increment key
  collection: string; // API endpoint, e.g. 'mandats'
  op: SyncOp;
  localId?: number; // Auto-increment ID assigned offline
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

    // Version 1: original schema with explicit IDs
    this.version(1).stores({
      _syncQueue: '++id, collection, op, timestamp',
      mairies: 'id, nom, code, ville',
      utilisateurs: 'id, username, email, role, mairieId, actif',
      chapitres: 'id, code, libelle, mairieId, actif',
      sousChapitres: 'id, code, libelle, parentId, mairieId, actif',
      previsions: 'id, exercice, chapitreId, mairieId, statut',
      mandats: 'id, numeroMandat, exercice, chapitreId, sousChapitreId, bordereauMandatId, mairieId, statut',
      bordereauMandats: 'id, numero, exercice, mairieId, statut',
      etatFinancierMensuel: 'id, annee, sousChapitreId, chapitreId, mairieId',
      taxes: 'id, code, libelle, mairieId, type, actif',
      declarations: 'id, numeroPiece, mairieId, taxeId, statut, exercice, bordereauId',
      bordereauxRecette: 'id, numero, annee, mairieId, statut',
      previsionsRecettes: 'id, exercice, taxeId, mairieId, statut',
      mandatsRecette: 'id, numeroMandat, exercice, chapitreId, taxeId, mairieId, statut',
      bordereauMandatsRecette: 'id, numero, exercice, mairieId, statut',
      chapitresRecette: 'id, code, libelle, mairieId, actif',
      etatFinancierMensuelRecette: 'id, annee, taxeId, chapitreRecetteId, mairieId',
      employes: 'id, matricule, nom, mairieId, actif',
      fichesPaie: 'id, employeId, mois, annee, exercice, mairieId, statut',
      conges: 'id, employeId, type, statut, mairieId',
      ordresMission: 'id, numero, employeId, exercice, statut, mairieId',
      parametresPaie: 'id, mairieId',
      servicesApp7: 'id, nom, mairieId, actif',
      printData: 'id, type, createdAt',
      exercices: 'id, annee, statut, mairieId',
    });

    // Version 2: auto-increment IDs
    this.version(2).stores({
      _syncQueue: '++id, collection, op, timestamp',

      // Auth / Mairie
      mairies: '++id, nom, code, ville',
      utilisateurs: '++id, username, email, role, mairieId, actif',

      // App3
      chapitres: '++id, code, libelle, mairieId, actif',
      sousChapitres: '++id, code, libelle, parentId, mairieId, actif',
      previsions: '++id, exercice, chapitreId, mairieId, statut',
      mandats:
        '++id, numeroMandat, exercice, chapitreId, sousChapitreId, bordereauMandatId, mairieId, statut',
      bordereauMandats: '++id, numero, exercice, mairieId, statut',
      etatFinancierMensuel: '++id, annee, sousChapitreId, chapitreId, mairieId',

      // App6
      taxes: '++id, code, libelle, mairieId, type, actif',
      declarations: '++id, numeroPiece, mairieId, taxeId, statut, exercice, bordereauId',
      bordereauxRecette: '++id, numero, annee, mairieId, statut',
      previsionsRecettes: '++id, exercice, taxeId, mairieId, statut',
      mandatsRecette: '++id, numeroMandat, exercice, chapitreId, taxeId, mairieId, statut',
      bordereauMandatsRecette: '++id, numero, exercice, mairieId, statut',
      chapitresRecette: '++id, code, libelle, mairieId, actif',
      etatFinancierMensuelRecette: '++id, annee, taxeId, chapitreRecetteId, mairieId',

      // App7
      employes: '++id, matricule, nom, mairieId, actif',
      fichesPaie: '++id, employeId, mois, annee, exercice, mairieId, statut',
      conges: '++id, employeId, type, statut, mairieId',
      ordresMission: '++id, numero, employeId, exercice, statut, mairieId',
      parametresPaie: '++id, mairieId',
      servicesApp7: '++id, nom, mairieId, actif',

      // Misc
      printData: '++id, type, createdAt',
      exercices: '++id, annee, statut, mairieId',
    });
  }
}

export const offlineDb = new OfflineDb();

