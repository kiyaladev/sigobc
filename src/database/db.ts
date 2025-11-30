import Dexie, { type EntityTable } from 'dexie';

// Constante pour l'ID de la mairie par défaut (Mairie d'Azaguié)
export const DEFAULT_MAIRIE_ID = 1;

// Interfaces pour les modèles de données
export interface Mairie {
  id?: number;
  nom: string;
  code: string;
  adresse: string;
  ville: string;
  codePostal: string;
  telephone?: string;
  email?: string;
  logo?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Taxe {
  id?: number;
  code: string;
  libelle: string;
  description?: string;
  taux?: number;
  montant?: number;
  type: 'fixe' | 'variable';
  mairieId: number;
  actif: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Declaration {
  id?: number;
  mairieId: number; // Mairie de l'utilisateur
  exercice: number; // Année en cours
  taxeId: number; // Article N° - Taxe sélectionnée
  numeroPiece: string; // Numéro de la pièce
  nomPartieVersante: string; // Nom de la partie versante
  adresse: string; // Adresse
  dateEncaissement: Date; // Date d'encaissement (date du jour par défaut)
  numeroLivre: string; // N° Livre (T31T par défaut)
  numeroEncaissement: string; // N° Encaissement
  montantRecette: number; // Montant de la recette
  bordereauId?: number; // ID du Bordereau (optionnel)
  statut: 'validee' | 'brouillon';
  observations?: string;
  personnelId: number; // Agent qui a créé la déclaration
  createdAt: Date;
  updatedAt: Date;
}

export interface BordereauRecette {
  id?: number;
  numero: number; // Numéro incrémental (1, 2, 3...)
  annee: number; // Année du bordereau
  mois?: number; // Mois du bordereau (1-12)
  dateTransmission?: Date; // Date de transmission du bordereau
  mairieId: number;
  montantTotal: number;
  totalPrecedent?: number;
  nombreDeclarations: number;
  statut: 'ouvert' | 'ferme';
  observations?: string;
  personnelId: number; // Agent responsable
  createdAt: Date;
  updatedAt: Date;
}

export interface Utilisateur {
  id?: number;
  username: string;
  password: string; // Hash du mot de passe
  nom: string;
  prenom: string;
  email: string;
  role: 'admin' | 'gestionnaire' | 'operateur';
  mairieId?: number;
  actif: boolean;
  derniereConnexion?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// ========== Interfaces pour App2 - Gestion de la Trésorerie ==========

export interface Timbres {
  100: number;
  200: number;
  300: number;
  500: number;
  600: number;
  1000: number;
  [key: number]: number; // Index signature pour permettre l'accès par number
}

export interface Approvisionnement {
  id?: number;
  mairieId: number;
  exercice: number; // Année
  date: Date;
  type: string; // Type d'approvisionnement (initial, complementaire, etc.)
  timbres: Timbres; // Stock de timbres par valeur
  detailsQuotites?: Record<string, number>;
  total: number; // Montant total
  observations?: string;
  personnelId: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Remise {
  id?: number;
  mairieId: number;
  exercice: number;
  date: Date;
  type: string; // Type de la remise
  numeroRemise: string; // Numéro de la remise
  timbres: Timbres; // Quantité de timbres reçus
  detailsQuotites?: Record<string, number>;
  total: number; // Montant total
  observations?: string;
  personnelId: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Versement {
  id?: number;
  mairieId: number;
  exercice: number;
  date: Date;
  numeroVersement: string; // Numéro du versement
  timbres: Timbres; // Quantité de timbres vendus
  detailsQuotites?: Record<string, number>;
  total: number; // Montant total
  observations?: string;
  personnelId: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface BalanceEntree {
  id?: number;
  mairieId: number;
  exercice: number; // Année
  date: Date;
  type: string; // Type de balance (INITIAL, BE-S1, BE-S2, BE-S3)
  timbres: Timbres; // Stock de timbres par valeur
  detailsQuotites?: Record<string, number>;
  total: number; // Montant total du stock
  commentaires?: string;
  personnelId: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Quotite {
  id?: number;
  code: string;
  prix: number;
  description: string;
  type: string;
  mairieId: number;
  actif: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ========== Interfaces pour App3 - Gestion des Dépenses ==========

export interface Chapitre {
  id?: number;
  code: string; // Ex: 6011
  libelle: string; // Ex: "Fournitures de bureau"
  description?: string;
  //  rubriqueId: number; // Lien vers la rubrique
  mairieId: number;
  actif: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SousChapitre {
  id?: number;
  code: string;
  libelle: string;
  description?: string;
  mairieId: number;
  actif: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Rubriques ne sont plus utilisées dans App3

export interface Prevision {
  id?: number;
  exercice: number; // Année budgétaire
  chapitreId: number; // Référence au chapitre principal
  mairieId: number;
  montantPrevu: number; // Montant total prévu pour ce chapitre
  montantEngage: number; // Montant déjà engagé (mandats)
  montantDisponible: number; // Reste à mandater
  observations?: string;
  statut: 'brouillon' | 'validee' | 'cloturee';
  personnelId: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Mandat {
  id?: number;
  numeroOrdre?: number; // Numéro d'ordre du mandat
  exercice: number; // Année
  numeroMandat: string; // Numéro unique du mandat
  dateMandat: Date; // Date d'émission du mandat
  chapitreId: number; // Chapitre budgétaire (01..08)
  sousChapitreId?: number; // Sous-chapitre budgétaire (codes 600xx)
  previsionId?: number; // Lien vers la prévision
  bordereauMandatId?: number; // ID du bordereau d'émission des mandats
  mairieId: number;
  beneficiaire: string; // Nom du bénéficiaire
  objet: string; // Objet de la dépense
  montant: number; // Montant du mandat
  numeroFacture?: string; // Numéro de facture
  dateFacture?: Date;
  modePaiement: 'virement' | 'cheque' | 'especes' | 'autre';
  statut: 'brouillon' | 'emis' | 'paye' | 'annule';
  observations?: string;
  personnelId: number; // Agent qui a créé le mandat
  createdAt: Date;
  updatedAt: Date;
}

export interface BordereauMandat {
  id?: number;
  numero: number; // Numéro incrémental (1, 2, 3...)
  exercice: number; // Exercice budgétaire
  dateEmission?: Date; // Date d'émission du bordereau
  mairieId: number;
  montantTotal: number;
  nombreMandats: number;
  statut: 'ouvert' | 'ferme';
  observations?: string;
  personnelId: number; // Agent responsable
  createdAt: Date;
  updatedAt: Date;
}

// Classe Dexie pour la base de données
class TresorDatabase extends Dexie {
  mairies!: EntityTable<Mairie, 'id'>;
  taxes!: EntityTable<Taxe, 'id'>;
  declarations!: EntityTable<Declaration, 'id'>;
  bordereauxRecette!: EntityTable<BordereauRecette, 'id'>;
  utilisateurs!: EntityTable<Utilisateur, 'id'>;
  // App2 - Gestion de la Trésorerie
  approvisionnements!: EntityTable<Approvisionnement, 'id'>;
  remises!: EntityTable<Remise, 'id'>;
  versements!: EntityTable<Versement, 'id'>;
  balancesEntree!: EntityTable<BalanceEntree, 'id'>;
  quotites!: EntityTable<Quotite, 'id'>;
  // App3 - Gestion des Dépenses
  chapitres!: EntityTable<Chapitre, 'id'>;
  sousChapitres!: EntityTable<SousChapitre, 'id'>;
  previsions!: EntityTable<Prevision, 'id'>;
  mandats!: EntityTable<Mandat, 'id'>;
  bordereauMandats!: EntityTable<BordereauMandat, 'id'>;

  constructor() {
    super('TresorDatabase');

    this.version(11).stores({
      mairies: '++id, nom, code, ville',
      taxes: '++id, code, libelle, mairieId, type, actif',
      declarations:
        '++id, numeroPiece, dateEncaissement, mairieId, taxeId, statut, bordereauId, personnelId, exercice',
      bordereauxRecette: '++id, numero, annee, mairieId, statut, personnelId',
      utilisateurs: '++id, username, email, role, mairieId, actif',
      // App2
      approvisionnements: '++id, date, exercice, mairieId, type, personnelId',
      remises: '++id, numeroRemise, date, exercice, mairieId, personnelId',
      versements: '++id, numeroVersement, date, exercice, mairieId, personnelId',
      balancesEntree: '++id, date, exercice, mairieId, type, personnelId, [exercice+mairieId]',
      quotites: '++id, code, prix, type, mairieId, actif',
      // App3
      chapitres: '++id, code, libelle, mairieId, actif',
      sousChapitres: '++id, code, libelle, mairieId, actif',
      previsions: '++id, exercice, chapitreId, mairieId, statut, personnelId',
      mandats:
        '++id, numeroMandat, dateMandat, exercice, chapitreId, sousChapitreId, previsionId, bordereauMandatId, mairieId, statut, personnelId',
      bordereauMandats: '++id, numero, exercice, mairieId, statut, personnelId',
    });
  }
}

// Instance unique de la base de données
export const db = new TresorDatabase();

