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

export interface Utilisateur {
  id?: number;
  username: string;
  password: string; // Hash du mot de passe
  nom: string;
  prenom: string;
  email: string;
  role: 'admin' | 'gestionnaire' | 'operateur' | 'agent' | 'comptable';
  mairieId?: number;
  actif: boolean;
  derniereConnexion?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// ========== Interfaces pour App5 - Gestion des Investissements ==========

export interface ChapitreInvestissement {
  id?: number;
  code: string; // Ex: 21, 22, 23...
  libelle: string; // Ex: "Immobilisations incorporelles"
  description?: string;
  mairieId: number;
  actif: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SousChapitreInvestissement {
  id?: number;
  code: string; // Ex: 211, 212, 221...
  libelle: string;
  description?: string;
  chapitreInvestissementId?: number; // Lien optionnel vers le chapitre parent
  mairieId: number;
  actif: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PrevisionInvestissement {
  id?: number;
  exercice: number;
  chapitreInvestissementId: number;
  sousChapitreInvestissementId?: number;
  mairieId: number;
  montantPrevu: number;
  montantEngage: number;
  montantDisponible: number;
  observations?: string;
  statut: 'brouillon' | 'validee' | 'cloturee';
  personnelId: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface MandatInvestissement {
  id?: number;
  numeroOrdre?: number;
  exercice: number;
  numeroMandat: string;
  dateMandat: Date;
  chapitreInvestissementId: number;
  sousChapitreInvestissementId?: number;
  previsionInvestissementId?: number;
  bordereauMandatInvestissementId?: number;
  mairieId: number;
  beneficiaire: string;
  rib?: string;
  patrimonial?: string;
  objet: string;
  montant: number;
  numeroFacture?: string;
  dateFacture?: Date;
  modePaiement: 'virement' | 'cheque' | 'especes' | 'autre';
  statut: 'brouillon' | 'emis' | 'paye' | 'annule';
  observations?: string;
  personnelId: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface BordereauMandatInvestissement {
  id?: number;
  numero: number;
  exercice: number;
  dateEmission?: Date;
  mairieId: number;
  montantTotal: number;
  totalPrecedent?: number;
  nombreMandats: number;
  statut: 'ouvert' | 'ferme';
  observations?: string;
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
  parentId?: number; // ID du parent (pour la hiérarchie)
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
  sousChapitreId?: number; // Référence optionnelle au sous-chapitre
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
  chapitreId: number; // Chapitre budgétaire (01..08) - OBLIGATOIRE
  sousChapitreId: number; // Sous-chapitre budgétaire (codes 600xx) - OBLIGATOIRE
  etatMensuelId?: string; // Format: {année-mois}--{sousChapitreCode}/{chapitreCode}
  previsionId?: number; // Lien vers la prévision
  bordereauMandatId?: number; // ID du bordereau d'émission des mandats
  mairieId: number;
  beneficiaire: string; // Nom du bénéficiaire
  rib?: string; // RIB du bénéficiaire
  patrimonial?: string; // Imputation patrimoniale
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
  totalPrecedent?: number;
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
  utilisateurs!: EntityTable<Utilisateur, 'id'>;

  // App3 - Gestion des Dépenses
  chapitres!: EntityTable<Chapitre, 'id'>;
  sousChapitres!: EntityTable<SousChapitre, 'id'>;
  previsions!: EntityTable<Prevision, 'id'>;
  mandats!: EntityTable<Mandat, 'id'>;
  bordereauMandats!: EntityTable<BordereauMandat, 'id'>;

  // App5 - Gestion des Investissements
  chapitresInvestissement!: EntityTable<ChapitreInvestissement, 'id'>;
  sousChapitresInvestissement!: EntityTable<SousChapitreInvestissement, 'id'>;
  previsionsInvestissement!: EntityTable<PrevisionInvestissement, 'id'>;
  mandatsInvestissement!: EntityTable<MandatInvestissement, 'id'>;
  bordereauMandatsInvestissement!: EntityTable<BordereauMandatInvestissement, 'id'>;

  constructor() {
    super('TresorDatabase');

    this.version(18).stores({
      mairies: '++id, nom, code, ville',
      utilisateurs: '++id, username, email, role, mairieId, actif',

      // App3
      chapitres: '++id, code, libelle, mairieId, actif',
      sousChapitres: '++id, code, libelle, parentId, mairieId, actif',
      previsions: '++id, exercice, chapitreId, mairieId, statut, personnelId',
      mandats:
        '++id, numeroMandat, dateMandat, exercice, chapitreId, sousChapitreId, previsionId, bordereauMandatId, mairieId, statut, personnelId',
      bordereauMandats: '++id, numero, exercice, mairieId, statut, personnelId',

      // App5 - Investissements
      chapitresInvestissement: '++id, code, libelle, mairieId, actif',
      sousChapitresInvestissement: '++id, code, libelle, chapitreInvestissementId, mairieId, actif',
      previsionsInvestissement:
        '++id, exercice, chapitreInvestissementId, sousChapitreInvestissementId, mairieId, statut, personnelId',
      mandatsInvestissement:
        '++id, numeroMandat, dateMandat, exercice, chapitreInvestissementId, sousChapitreInvestissementId, previsionInvestissementId, bordereauMandatInvestissementId, mairieId, statut, personnelId',
      bordereauMandatsInvestissement: '++id, numero, exercice, mairieId, statut, personnelId',
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

    // Créer quelques rubriques et chapitres par défaut pour App3
    await db.chapitres.bulkAdd([
      {
        code: '1',
        libelle: 'SALAIRE ET INDEM.',
        mairieId: mairieId as number,
        actif: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        code: '2',
        libelle: 'CHARGES SOCIALES',
        mairieId: mairieId as number,
        actif: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        code: '3',
        libelle: 'TRANSP. & FRAIS DE MISS.',
        mairieId: mairieId as number,
        actif: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        code: '4',
        libelle: 'CARBUR. ET LUBRIF.',
        mairieId: mairieId as number,
        actif: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        code: '5',
        libelle: 'MATERIEL ET FOURNIT.',
        mairieId: mairieId as number,
        actif: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        code: '6',
        libelle: 'ABONN. EAU, ELEC, TELEPH.',
        mairieId: mairieId as number,
        actif: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        code: '7',
        libelle: "TRAVAUX & SCES A L'ENTREP.",
        mairieId: mairieId as number,
        actif: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        code: '8',
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

    console.log('Base de données initialisée avec succès avec des données de démonstration');
  }
}
