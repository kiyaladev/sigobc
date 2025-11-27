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
  type: string; // Type de balance (Balance, Balance Entrée, Solde Initial)
  timbres: Timbres; // Stock de timbres par valeur
  total: number; // Montant total du stock
  commentaires?: string;
  personnelId: number;
  createdAt: Date;
  updatedAt: Date;
}

// ========== Interfaces pour App3 - Gestion des Dépenses ==========

export interface Chapitre {
  id?: number;
  code: string; // Ex: 6011
  libelle: string; // Ex: "Fournitures de bureau"
  description?: string;
  rubriqueId: number; // Lien vers la rubrique
  mairieId: number;
  actif: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Rubrique {
  id?: number;
  code: string; // Ex: 60, 61, 62, etc.
  libelle: string; // Ex: "Charges de personnel"
  description?: string;
  mairieId: number;
  actif: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Prevision {
  id?: number;
  exercice: number; // Année budgétaire
  rubriqueId: number; // Référence à la rubrique
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
  rubriqueId: number; // Rubrique budgétaire
  chapitreId: number; // Chapitre budgétaire
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
  // App3 - Gestion des Dépenses
  chapitres!: EntityTable<Chapitre, 'id'>;
  rubriques!: EntityTable<Rubrique, 'id'>;
  previsions!: EntityTable<Prevision, 'id'>;
  mandats!: EntityTable<Mandat, 'id'>;
  bordereauMandats!: EntityTable<BordereauMandat, 'id'>;

  constructor() {
    super('TresorDatabase');

    this.version(9).stores({
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
      // App3
      chapitres: '++id, code, libelle, rubriqueId, mairieId, actif',
      rubriques: '++id, code, libelle, mairieId, actif',
      previsions: '++id, exercice, rubriqueId, mairieId, statut, personnelId',
      mandats:
        '++id, numeroMandat, dateMandat, exercice, rubriqueId, chapitreId, previsionId, bordereauMandatId, mairieId, statut, personnelId',
      bordereauMandats: '++id, numero, exercice, mairieId, statut, personnelId',
    });
  }
}

// Instance unique de la base de données
export const db = new TresorDatabase();

// Fonction d'initialisation avec données de démonstration
export async function initializeDatabase() {
  const mairieCount = await db.mairies.count();

  if (mairieCount === 0) {
    // Données de démonstration
    const now = new Date();

    // Créer la Mairie d'Azaguié (mairie unique de l'application)
    const mairieId = await db.mairies.add({
      nom: "Mairie d'Azaguié",
      code: '422',
      adresse: 'Avenue Principale',
      ville: 'Azaguié',
      codePostal: '00225',
      telephone: '+225 XX XX XX XX',
      email: 'contact@mairie-azaguie.ci',
      createdAt: now,
      updatedAt: now,
    });

    // Créer un utilisateur admin par défaut
    await db.utilisateurs.add({
      username: 'admin',
      password: 'admin123', // À remplacer par un hash sécurisé en production
      nom: 'Administrateur',
      prenom: 'Système',
      email: 'admin@tresor.sn',
      role: 'admin',
      actif: true,
      createdAt: now,
      updatedAt: now,
    });

    // Créer quelques taxes par défaut
    await db.taxes.bulkAdd([
      {
        code: 'TXF001',
        libelle: 'Taxe foncière',
        description: 'Taxe sur les propriétés bâties',
        taux: 5,
        type: 'variable',
        mairieId: mairieId as number,
        actif: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        code: 'TXH001',
        libelle: "Taxe d'habitation",
        description: "Taxe sur l'occupation des logements",
        taux: 3,
        type: 'variable',
        mairieId: mairieId as number,
        actif: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        code: 'TXE001',
        libelle: "Taxe d'enlèvement des ordures",
        description: 'Taxe pour le service de collecte des ordures',
        montant: 15000,
        type: 'fixe',
        mairieId: mairieId as number,
        actif: true,
        createdAt: now,
        updatedAt: now,
      },
    ]);

    // Créer quelques rubriques et chapitres par défaut pour App3
    const rubriqueId = await db.rubriques.add({
      code: '60',
      libelle: 'Achats de matières et fournitures',
      mairieId: mairieId as number,
      actif: true,
      createdAt: now,
      updatedAt: now,
    });

    await db.chapitres.bulkAdd([
      {
        code: '6011',
        libelle: 'Fournitures de bureau',
        rubriqueId: rubriqueId as number,
        mairieId: mairieId as number,
        actif: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        code: '6012',
        libelle: 'Fournitures informatiques',
        rubriqueId: rubriqueId as number,
        mairieId: mairieId as number,
        actif: true,
        createdAt: now,
        updatedAt: now,
      },
    ]);

    console.log('Base de données initialisée avec succès avec des données de démonstration');
  }
}
