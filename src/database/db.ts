import Dexie, { type EntityTable } from 'dexie';

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
  statut: 'brouillon' | 'validee';
  observations?: string;
  personnelId: number; // Agent qui a créé la déclaration
  createdAt: Date;
  updatedAt: Date;
}

export interface Bordereau {
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

// Classe Dexie pour la base de données
class TresorDatabase extends Dexie {
  mairies!: EntityTable<Mairie, 'id'>;
  taxes!: EntityTable<Taxe, 'id'>;
  declarations!: EntityTable<Declaration, 'id'>;
  bordereaux!: EntityTable<Bordereau, 'id'>;
  utilisateurs!: EntityTable<Utilisateur, 'id'>;

  constructor() {
    super('TresorDatabase');

    this.version(1).stores({
      mairies: '++id, nom, code, ville',
      taxes: '++id, code, libelle, mairieId, type, actif',
      declarations:
        '++id, numeroPiece, dateEncaissement, mairieId, taxeId, statut, bordereauId, personnelId, exercice',
      bordereaux: '++id, numero, annee, mairieId, statut, personnelId',
      utilisateurs: '++id, username, email, role, mairieId, actif',
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

    // Créer une mairie par défaut
    const mairieId = await db.mairies.add({
      nom: 'Mairie de Dakar',
      code: 'MDK001',
      adresse: "Place de l'Indépendance",
      ville: 'Dakar',
      codePostal: '10000',
      telephone: '+221 33 889 40 00',
      email: 'contact@mairie-dakar.sn',
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

    console.log('Base de données initialisée avec succès avec des données de démonstration');
  }
}
