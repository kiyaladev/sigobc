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

    await db.chapitres.bulkAdd([
      {
        code: '6013',
        libelle: 'SALAIRE ET INDEM.',
        mairieId: mairieId as number,
        actif: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        code: '6014',
        libelle: 'CHARGES SOCIALES',
        mairieId: mairieId as number,
        actif: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        code: '6015',
        libelle: 'TRANSP. & FRAIS DE MISS.',
        mairieId: mairieId as number,
        actif: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        code: '6016',
        libelle: 'CARBUR. ET LUBRIF.',
        mairieId: mairieId as number,
        actif: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        code: '6017',
        libelle: 'MATERIEL ET FOURNIT.',
        mairieId: mairieId as number,
        actif: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        code: '6018',
        libelle: 'ABONN. EAU, ELEC, TELEPH.',
        mairieId: mairieId as number,
        actif: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        code: '6019',
        libelle: "TRAVAUX & SCES A L'ENTREP.",
        mairieId: mairieId as number,
        actif: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        code: '6020',
        libelle: 'INTERVEN ET TRANSF.',
        mairieId: mairieId as number,
        actif: true,
        createdAt: now,
        updatedAt: now,
      },
    ]);

    // Sous-chapitres par défaut pour App3
    await db.sousChapitres.bulkAdd([
      {
        code: '6000',
        libelle: 'ADMINISTRATION',
        mairieId: mairieId as number,
        actif: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        code: '60010',
        libelle: 'FONCTIONNEMENT DU CONSEIL ET DES COMMISSIONS',
        mairieId: mairieId as number,
        actif: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        code: '60011',
        libelle: 'FONCTIONNEMENT DE LA MUNICIPALITÉ',
        mairieId: mairieId as number,
        actif: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        code: '60012',
        libelle: 'FONCTIONNEMENT CABINET DU MAIRE',
        mairieId: mairieId as number,
        actif: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        code: '60013',
        libelle: 'INDEMNITÉS DE FONCTION ET DE REPRÉSENTATION',
        mairieId: mairieId as number,
        actif: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        code: '60015',
        libelle: 'FRAIS DE MISSIONS EN DEHORS DU TERRITOIRE NATIONALE',
        mairieId: mairieId as number,
        actif: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        code: '60016',
        libelle: 'AUTRES DÉPENSES AU TITRE DES AUTORITÉS MUNICIPALES',
        mairieId: mairieId as number,
        actif: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        code: '6002',
        libelle: 'ETAT CIVIL ET POPULATION',
        mairieId: mairieId as number,
        actif: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        code: '6006',
        libelle: "AUTRES DÉPENSES D'ADMINISTRATION GÉNÉRALE",
        mairieId: mairieId as number,
        actif: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        code: '6010',
        libelle: 'ADMINISTRATION',
        mairieId: mairieId as number,
        actif: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        code: '6016',
        libelle: 'AUTRES DÉPENSES RELATIVES AU DOMAINE COMMUNAL',
        mairieId: mairieId as number,
        actif: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        code: '6020',
        libelle: 'ADMINISTRATION',
        mairieId: mairieId as number,
        actif: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        code: '6021',
        libelle: 'FRAIS DE RECOUVREMENTS ET DE POURSUITES',
        mairieId: mairieId as number,
        actif: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        code: '6031',
        libelle: 'GARDES MUNICIPAUX',
        mairieId: mairieId as number,
        actif: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        code: '6100',
        libelle: 'ADMINISTRATION',
        mairieId: mairieId as number,
        actif: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        code: '6101',
        libelle: 'VOIRIES-ROUTES-CHEMINS',
        mairieId: mairieId as number,
        actif: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        code: '6131',
        libelle: "OPÉRATIONS D'ASSAINISSEMENT",
        mairieId: mairieId as number,
        actif: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        code: '6133',
        libelle: 'NETTOIEMENT DE LA VOIRIE- ENLÈVEMENT DES ORDURES',
        mairieId: mairieId as number,
        actif: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        code: '6136',
        libelle: "AUTRES DÉPENSES D'HYGIÈNES ET SALUBRITÉ PUBLIQUE-HYDRAULIQUE",
        mairieId: mairieId as number,
        actif: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        code: '6141',
        libelle: 'PROTECTION CIVILE',
        mairieId: mairieId as number,
        actif: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        code: '6151',
        libelle: 'CIMETIÈRES-INHUMATION-EXHUMATIONS-CREUSEMENTS DE FOSSES',
        mairieId: mairieId as number,
        actif: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        code: '6206',
        libelle: "AUTRES DÉPENSES D'ÉDUCATION",
        mairieId: mairieId as number,
        actif: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        code: '6214',
        libelle: 'EVACUATIONS SANITAIRES-SERVICE AMBULANCE',
        mairieId: mairieId as number,
        actif: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        code: '6216',
        libelle: 'AUTRES DÉPENSES DE SANTÉ PUBLIQUE',
        mairieId: mairieId as number,
        actif: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        code: '6223',
        libelle: 'HANDICAPÉS',
        mairieId: mairieId as number,
        actif: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        code: '6224',
        libelle: 'AIDE FAMILIALE ,SOCIALE ET PERSONNES AGÉES',
        mairieId: mairieId as number,
        actif: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        code: '6225',
        libelle: 'AIDE AUX INDIGENTS',
        mairieId: mairieId as number,
        actif: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        code: '6246',
        libelle: 'AUTRES DÉPENSES AU TITRE DES SPORTS ET LOISIRS',
        mairieId: mairieId as number,
        actif: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        code: '6250',
        libelle: 'ADMINISTRATION',
        mairieId: mairieId as number,
        actif: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        code: '6256',
        libelle: 'AUTRES DÉPENSES AU TITRE DES ACTIVITÉS CULTURELLES',
        mairieId: mairieId as number,
        actif: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        code: '626',
        libelle: 'AUTRES DEPENSES DES SERVICES SOCIAUX ,CULTURELS ET DE PROMOTION HUMAINE',
        mairieId: mairieId as number,
        actif: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        code: '6336',
        libelle: 'AUTRES DÉPENSES DE TRANSPORT ET COMMUNICATIONS',
        mairieId: mairieId as number,
        actif: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        code: '6341',
        libelle: 'ABATTOIRS-CONSERVATION ET TRANSPORTS DE VIANDE',
        mairieId: mairieId as number,
        actif: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        code: '6344',
        libelle: 'MARCHÉS',
        mairieId: mairieId as number,
        actif: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        code: '6406',
        libelle: 'AUTRES DETTES DE LA COMMUNE (OU DE LA VILLE )',
        mairieId: mairieId as number,
        actif: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        code: '6415',
        libelle: 'CONFÉRENCES INTERCOMMUNALES -ASSOCIATION DES VILLES ET COMMUNES',
        mairieId: mairieId as number,
        actif: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        code: '6416',
        libelle: 'AUTRES CONTRIBUTIONS ET TRANSFERTS',
        mairieId: mairieId as number,
        actif: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        code: '6420',
        libelle: 'RESPONSABILITÉ CIVILE',
        mairieId: mairieId as number,
        actif: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        code: '6422',
        libelle: 'ASSURANCES DES VÉHICULES',
        mairieId: mairieId as number,
        actif: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        code: '6426',
        libelle: 'AUTRES ASSURANCES',
        mairieId: mairieId as number,
        actif: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        code: '6430',
        libelle: 'CÉRÉMONIES PUBLIQUES',
        mairieId: mairieId as number,
        actif: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        code: '6431',
        libelle: 'FÊTES ET RÉCEPTIONS OFFICIELLES',
        mairieId: mairieId as number,
        actif: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        code: '6441',
        libelle: "FONDS D'INVESTISSEMENT",
        mairieId: mairieId as number,
        actif: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        code: '6456',
        libelle: 'AUTRES REMBOURSEMENTS DIVERS',
        mairieId: mairieId as number,
        actif: true,
        createdAt: now,
        updatedAt: now,
      },
    ]);

    // Quotités par défaut (App2)
    await db.quotites.bulkAdd([
      {
        code: 'TM100',
        prix: 100,
        description: 'Ticket',
        type: 'Marché',
        mairieId: mairieId as number,
        actif: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        code: 'TA100',
        prix: 100,
        description: 'Ticket',
        type: 'Abattoirs',
        mairieId: mairieId as number,
        actif: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        code: 'TS100',
        prix: 100,
        description: 'Ticket',
        type: 'Stationnement',
        mairieId: mairieId as number,
        actif: true,
        createdAt: now,
        updatedAt: now,
      },
    ]);

    console.log('Base de données initialisée avec succès avec des données de démonstration');
  }
}
