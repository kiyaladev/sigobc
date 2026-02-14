import Dexie, { type EntityTable } from 'dexie';

// Constante pour l'ID de la mairie par défaut (Mairie de Vavoua)
export const DEFAULT_MAIRIE_ID = 1;

// Interfaces pour les modèles de données
export interface Mairie {
  id?: number;
  nom: string;
  code: string;
  adresse: string;
  ville: string;
  departement?: string;
  region?: string;
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

// ========== Interface pour les Taxes (App6 - Recettes) ==========

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
  statut: 'brouillon' | 'paye' | 'annule';
  motifAnnulation?: string; // Motif d'annulation du mandat
  observations?: string;
  // Nouveaux champs
  referenceMarche?: string; // Référence du Marché
  avisMunicipalite?: string; // Avis de la Municipalité
  numeroDeliberation?: string; // N° Délibération
  dateDeliberation?: Date; // Date de Délibération
  montantPrecompter?: number; // Montant à précompter
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

// ========== Interfaces pour les Recettes ==========

export interface BordereauRecette {
  id?: number;
  numero: number;
  annee: number;
  mairieId: number;
  montantTotal: number;
  totalPrecedent?: number;
  nombreDeclarations: number;
  dateTransmission?: Date;
  statut: 'ouvert' | 'ferme';
  observations?: string;
  personnelId?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Declaration {
  id?: number;
  exercice: number;
  numeroPiece: number | string;
  dateDeclaration?: Date;
  dateEncaissement?: Date;
  bordereauRecetteId?: number;
  bordereauId?: number;
  taxeId: number;
  mairieId: number;
  contribuable?: string;
  nomPartieVersante?: string;
  adresse?: string;
  numeroLivre?: string;
  numeroEncaissement?: string;
  montant?: number;
  montantRecette?: number;
  patrimonial?: string;
  modePaiement?: 'especes' | 'cheque' | 'virement' | 'autre';
  statut: 'brouillon' | 'validee' | 'annulee';
  observations?: string;
  personnelId?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PrevisionRecette {
  id?: number;
  exercice: number;
  taxeId: number;
  mairieId: number;
  montantPrevu: number;
  montantRealise: number;
  statut: 'brouillon' | 'validee' | 'cloturee';
  observations?: string;
  personnelId?: number;
  createdAt: Date;
  updatedAt: Date;
}

// Interface MandatRecette (similaire à Mandat mais pour recettes)
export interface MandatRecette {
  id?: number;
  exercice: number;
  numeroMandat: string;
  dateMandat: Date;
  chapitreId: number; // Même chapitres que App3 (1-8)
  taxeId: number; // Taxe = équivalent de sous-chapitre
  previsionRecetteId?: number;
  bordereauMandatRecetteId?: number;
  mairieId: number;
  partieVersante: string; // Équivalent de bénéficiaire
  rib?: string; // RIB de la partie versante
  patrimonial?: string; // Imputation patrimoniale
  objet: string;
  montant: number;
  numeroFacture?: string; // Numéro de facture
  dateFacture?: Date;
  modePaiement: 'virement' | 'cheque' | 'especes' | 'autre';
  statut: 'brouillon' | 'paye' | 'annule';
  observations?: string;
  personnelId: number;
  createdAt: Date;
  updatedAt: Date;
}

// Interface BordereauMandatRecette (similaire à BordereauMandat)
export interface BordereauMandatRecette {
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

// ========== Interface ChapitreRecette (Nature des Recettes) pour App6 ==========

/**
 * Chapitre pour les recettes (Nature des recettes)
 * Équivalent du Chapitre pour les dépenses mais spécifique aux recettes
 * Inclut un chapitre par défaut "Autres"
 */
export interface ChapitreRecette {
  id?: number;
  code: string; // Ex: 1, 2, 3... ou "99" pour Autres
  libelle: string; // Ex: "RECETTES FISCALES", "Autres"
  description?: string;
  mairieId: number;
  actif: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ========== Interface pour l'État Financier Mensuel ==========

/**
 * État financier mensuel par couple sous-chapitre/chapitre
 * Stocke les antécédents pour chaque mois de l'année
 *
 * Logique des antécédents:
 * - ant1 (Janvier) = 0 (pas d'antécédent)
 * - ant2 (Février) = total des dépenses de janvier
 * - ant3 (Mars) = total des dépenses de janvier + février
 * - ...
 * - ant12 (Décembre) = total des dépenses de janvier à novembre
 *
 * Total du mois = antécédent + dépenses du mois
 */
export interface EtatFinancierMensuel {
  id?: number;
  annee: number; // Année de l'état financier (ex: 2025)
  sousChapitreId: number; // Référence au sous-chapitre
  chapitreId: number; // Référence au chapitre
  sousChapitreCode?: string; // Code du sous-chapitre (ex: '6001')
  chapitreCode?: string; // Code du chapitre (ex: '1')
  mairieId: number;

  // Antécédents pour chaque mois (cumul des mois précédents)
  ant1: number; // Janvier = 0
  ant2: number; // Février = total janvier
  ant3: number; // Mars = total janvier + février
  ant4: number; // Avril
  ant5: number; // Mai
  ant6: number; // Juin
  ant7: number; // Juillet
  ant8: number; // Août
  ant9: number; // Septembre
  ant10: number; // Octobre
  ant11: number; // Novembre
  ant12: number; // Décembre = total janvier à novembre

  // Dépenses par mois
  dep1: number; // Dépenses Janvier
  dep2: number; // Dépenses Février
  dep3: number; // Dépenses Mars
  dep4: number; // Dépenses Avril
  dep5: number; // Dépenses Mai
  dep6: number; // Dépenses Juin
  dep7: number; // Dépenses Juillet
  dep8: number; // Dépenses Août
  dep9: number; // Dépenses Septembre
  dep10: number; // Dépenses Octobre
  dep11: number; // Dépenses Novembre
  dep12: number; // Dépenses Décembre

  createdAt: Date;
  updatedAt: Date;
}

/**
 * État financier mensuel pour les recettes (App6)
 * Stocke les antécédents et recettes pour chaque mois de l'année
 * Par couple taxe/chapitreRecette
 *
 * Logique des antécédents:
 * - ant1 (Janvier) = 0 (pas d'antécédent)
 * - ant2 (Février) = total des recettes de janvier
 * - ant3 (Mars) = total des recettes de janvier + février
 * - ...
 * - ant12 (Décembre) = total des recettes de janvier à novembre
 *
 * Total du mois = antécédent + recettes du mois
 */
export interface EtatFinancierMensuelRecette {
  id?: number;
  annee: number; // Année de l'état financier (ex: 2025)
  taxeId: number; // Référence à la taxe
  chapitreRecetteId: number; // Référence au chapitre recette
  taxeCode?: string; // Code de la taxe
  chapitreRecetteCode?: string; // Code du chapitre recette
  mairieId: number;

  // Antécédents pour chaque mois (cumul des mois précédents)
  ant1: number; // Janvier = 0
  ant2: number; // Février = total janvier
  ant3: number; // Mars = total janvier + février
  ant4: number; // Avril
  ant5: number; // Mai
  ant6: number; // Juin
  ant7: number; // Juillet
  ant8: number; // Août
  ant9: number; // Septembre
  ant10: number; // Octobre
  ant11: number; // Novembre
  ant12: number; // Décembre = total janvier à novembre

  // Recettes par mois
  rec1: number; // Recettes Janvier
  rec2: number; // Recettes Février
  rec3: number; // Recettes Mars
  rec4: number; // Recettes Avril
  rec5: number; // Recettes Mai
  rec6: number; // Recettes Juin
  rec7: number; // Recettes Juillet
  rec8: number; // Recettes Août
  rec9: number; // Recettes Septembre
  rec10: number; // Recettes Octobre
  rec11: number; // Recettes Novembre
  rec12: number; // Recettes Décembre

  createdAt: Date;
  updatedAt: Date;
}

// Interface pour stocker temporairement les données d'impression
// Utilisé pour passer les données aux pages d'impression en mode Electron
export interface PrintData {
  id?: number;
  type: string; // Type de document (FILL_ETAT_FINANCIER_DATA, FILL_CT02_DATA, etc.)
  data: unknown; // Données à imprimer (sérialisées en JSON)
  createdAt: Date;
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
  etatFinancierMensuel!: EntityTable<EtatFinancierMensuel, 'id'>;

  // App6 - Gestion des Recettes
  taxes!: EntityTable<Taxe, 'id'>;
  declarations!: EntityTable<Declaration, 'id'>;
  bordereauxRecette!: EntityTable<BordereauRecette, 'id'>;
  previsionsRecettes!: EntityTable<PrevisionRecette, 'id'>;
  mandatsRecette!: EntityTable<MandatRecette, 'id'>;
  bordereauMandatsRecette!: EntityTable<BordereauMandatRecette, 'id'>;
  chapitresRecette!: EntityTable<ChapitreRecette, 'id'>;
  etatFinancierMensuelRecette!: EntityTable<EtatFinancierMensuelRecette, 'id'>;

  // Table temporaire pour les données d'impression
  printData!: EntityTable<PrintData, 'id'>;

  constructor() {
    super('TresorDatabase');

    this.version(24).stores({
      mairies: '++id, nom, code, ville',
      utilisateurs: '++id, username, email, role, mairieId, actif',

      // App3
      chapitres: '++id, code, libelle, mairieId, actif',
      sousChapitres: '++id, code, libelle, parentId, mairieId, actif',
      previsions: '++id, exercice, chapitreId, mairieId, statut, personnelId',
      mandats:
        '++id, numeroMandat, dateMandat, exercice, chapitreId, sousChapitreId, previsionId, bordereauMandatId, mairieId, statut, personnelId',
      bordereauMandats: '++id, numero, exercice, mairieId, statut, personnelId',
      etatFinancierMensuel:
        '++id, annee, sousChapitreId, chapitreId, mairieId, [annee+sousChapitreId+chapitreId]',

      // App6 - Recettes
      taxes: '++id, code, libelle, mairieId, type, actif',
      declarations:
        '++id, numeroPiece, dateEncaissement, mairieId, taxeId, statut, bordereauId, personnelId, exercice',
      bordereauxRecette: '++id, numero, annee, mairieId, statut, personnelId',
      previsionsRecettes: '++id, exercice, taxeId, mairieId, statut, personnelId',

      // App6 - Mandats de Recettes
      mandatsRecette:
        '++id, numeroMandat, dateMandat, exercice, chapitreId, taxeId, previsionRecetteId, bordereauMandatRecetteId, mairieId, statut, personnelId',
      bordereauMandatsRecette: '++id, numero, exercice, mairieId, statut, personnelId',

      // App6 - Chapitres Recettes (Nature des recettes) et États Mensuels
      chapitresRecette: '++id, code, libelle, mairieId, actif',
      etatFinancierMensuelRecette:
        '++id, annee, taxeId, chapitreRecetteId, mairieId, [annee+taxeId+chapitreRecetteId]',

      // Table temporaire pour les données d'impression (utilisée en mode Electron)
      printData: '++id, type, createdAt',
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

    // Créer la Mairie de Vavoua (mairie unique de l'application)
    const mairieId = await db.mairies.add({
      nom: 'Mairie de Vavoua',
      code: '433',
      adresse: 'Avenue Principale',
      ville: 'Vavoua',
      codePostal: '00225',
      telephone: '+225 XX XX XX XX',
      email: 'contact@mairie-vavoua.ci',
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

    // Créer les taxes par défaut pour App6 - Recettes (Nomenclature complète)
    await db.taxes.bulkAdd([
      // ========== SECTION 70 - RECETTES FISCALES ==========
      {
        code: '70',
        libelle: 'SECTION 70 - RECETTES FISCALES',
        type: 'variable',
        mairieId: mairieId as number,
        actif: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        code: '700',
        libelle: 'CHAP.700 - IMPOTS ATTRIBUES AUX COMMUNES',
        type: 'variable',
        mairieId: mairieId as number,
        actif: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        code: '7000',
        libelle: 'Contribution foncière des propriétés bâties',
        type: 'variable',
        mairieId: mairieId as number,
        actif: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        code: '7001',
        libelle: 'Contribution foncière des propriétés non bâties',
        type: 'variable',
        mairieId: mairieId as number,
        actif: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        code: '7004',
        libelle: 'Contribution des patentes',
        type: 'variable',
        mairieId: mairieId as number,
        actif: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        code: '7005',
        libelle: 'Contribution des licences',
        type: 'variable',
        mairieId: mairieId as number,
        actif: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        code: '702',
        libelle: 'CHAP.702 - TAXES COMMUNALES PAR VOIE DE ROLE',
        type: 'variable',
        mairieId: mairieId as number,
        actif: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        code: '70261',
        libelle: 'Impôt synthétique',
        type: 'variable',
        mairieId: mairieId as number,
        actif: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        code: '70262',
        libelle: 'Taxes forfaitaires petits commerçants/artisans',
        type: 'variable',
        mairieId: mairieId as number,
        actif: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        code: '7027',
        libelle: 'Taxe sur les locaux loués en garnis',
        type: 'variable',
        mairieId: mairieId as number,
        actif: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        code: '703',
        libelle: 'CHAP.703 - TAXES SUR TITRE DE RECETTES PROPRES',
        type: 'variable',
        mairieId: mairieId as number,
        actif: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        code: '7030',
        libelle: 'Taxes sur les pompes distributrices de carburant',
        type: 'variable',
        mairieId: mairieId as number,
        actif: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        code: '7031',
        libelle: 'Taxes sur les charrettes',
        type: 'variable',
        mairieId: mairieId as number,
        actif: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        code: '7036',
        libelle: 'Taxes sur les spectacles et galas',
        type: 'variable',
        mairieId: mairieId as number,
        actif: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        code: '7038',
        libelle: 'Taxes sur les établissements de nuit',
        type: 'variable',
        mairieId: mairieId as number,
        actif: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        code: '704',
        libelle: 'CHAP.704 - TAXES SUR TITRE DE RECETTES PAR LES COMMUNES',
        type: 'variable',
        mairieId: mairieId as number,
        actif: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        code: '7041',
        libelle: 'Taxes sur les taxis',
        type: 'variable',
        mairieId: mairieId as number,
        actif: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        code: '7042',
        libelle: 'Taxes sur la publicité',
        type: 'variable',
        mairieId: mairieId as number,
        actif: true,
        createdAt: now,
        updatedAt: now,
      },

      // ========== SECTION 71 - RECETTES DES PRESTATIONS ET SERVICES ==========
      {
        code: '71',
        libelle: 'SECTION 71 - RECETTES DES PRESTATIONS ET SERVICES',
        type: 'variable',
        mairieId: mairieId as number,
        actif: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        code: '710',
        libelle: 'CHAP.710 - RECETTES DES SERVICES GENERAUX',
        type: 'variable',
        mairieId: mairieId as number,
        actif: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        code: '7100',
        libelle: 'Administration générale',
        type: 'variable',
        mairieId: mairieId as number,
        actif: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        code: '71000',
        libelle: 'Légalisation de signatures et certifications',
        type: 'fixe',
        montant: 500,
        mairieId: mairieId as number,
        actif: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        code: '71001',
        libelle: 'Délivrance livrets de famille et documents',
        type: 'fixe',
        montant: 1000,
        mairieId: mairieId as number,
        actif: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        code: '71006',
        libelle: 'Autres recettes administration générale',
        type: 'variable',
        mairieId: mairieId as number,
        actif: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        code: '7101',
        libelle: 'Administration financière et domaniale',
        type: 'variable',
        mairieId: mairieId as number,
        actif: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        code: '71010',
        libelle: "Taxe sur délivrance permis d'habiter",
        type: 'variable',
        mairieId: mairieId as number,
        actif: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        code: '71016',
        libelle: 'Autres recettes admin. financière/domaniale',
        type: 'variable',
        mairieId: mairieId as number,
        actif: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        code: '71030',
        libelle: 'Taxe de séquestre',
        type: 'variable',
        mairieId: mairieId as number,
        actif: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        code: '71031',
        libelle: 'Produits de ventes de la fourrière',
        type: 'variable',
        mairieId: mairieId as number,
        actif: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        code: '711',
        libelle: 'CHAP.711 - RECETTES DES SERVICES DE COLLECTIVITE',
        type: 'variable',
        mairieId: mairieId as number,
        actif: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        code: '7112',
        libelle: 'Urbanisme et environnement',
        type: 'variable',
        mairieId: mairieId as number,
        actif: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        code: '71120',
        libelle: 'Taxes ou redevance de bornage',
        type: 'variable',
        mairieId: mairieId as number,
        actif: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        code: '71126',
        libelle: 'Autres recettes urbanisme/environnement',
        type: 'variable',
        mairieId: mairieId as number,
        actif: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        code: '7113',
        libelle: "Hygiène, salubrité, hydraulique, adduction d'eau",
        type: 'variable',
        mairieId: mairieId as number,
        actif: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        code: '7130',
        libelle: "Taxe d'enlèvement des ordures ménagères",
        type: 'fixe',
        montant: 15000,
        mairieId: mairieId as number,
        actif: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        code: '71150',
        libelle: 'Cimetières - services funéraires',
        type: 'variable',
        mairieId: mairieId as number,
        actif: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        code: '71152',
        libelle: 'Morgue - Dépôts de cercueils',
        type: 'variable',
        mairieId: mairieId as number,
        actif: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        code: '71154',
        libelle: 'Autres recettes services funéraires',
        type: 'variable',
        mairieId: mairieId as number,
        actif: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        code: '712',
        libelle: 'CHAP.712 - RECETTES SERVICES SOCIAUX/CULTURELS',
        type: 'variable',
        mairieId: mairieId as number,
        actif: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        code: '7125',
        libelle: 'Activités culturelles - Taxes, Redevances',
        type: 'variable',
        mairieId: mairieId as number,
        actif: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        code: '71250',
        libelle: 'Administration activités culturelles',
        type: 'variable',
        mairieId: mairieId as number,
        actif: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        code: '71256',
        libelle: 'Autres recettes services sociaux/culturels',
        type: 'variable',
        mairieId: mairieId as number,
        actif: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        code: '713',
        libelle: 'CHAP.713 - RECETTES DES SERVICES ECONOMIQUES',
        type: 'variable',
        mairieId: mairieId as number,
        actif: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        code: '7133',
        libelle: 'Transports - communications',
        type: 'variable',
        mairieId: mairieId as number,
        actif: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        code: '71330',
        libelle: 'Administration transports et communications',
        type: 'variable',
        mairieId: mairieId as number,
        actif: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        code: '71331',
        libelle: 'Gare routière - stations de taxis',
        type: 'variable',
        mairieId: mairieId as number,
        actif: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        code: '7134',
        libelle: 'Industrie et commerce',
        type: 'variable',
        mairieId: mairieId as number,
        actif: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        code: '71341',
        libelle: 'Abattoirs, conservation et transport de viande',
        type: 'variable',
        mairieId: mairieId as number,
        actif: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        code: '71344',
        libelle: 'Marchés',
        type: 'variable',
        mairieId: mairieId as number,
        actif: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        code: '71345',
        libelle: 'Foires et expositions',
        type: 'variable',
        mairieId: mairieId as number,
        actif: true,
        createdAt: now,
        updatedAt: now,
      },

      // ========== SECTION 72 - REVENU DU PATRIMOINE ET DU PORTEFEUILLE ==========
      {
        code: '72',
        libelle: 'SECTION 72 - REVENU DU PATRIMOINE',
        type: 'variable',
        mairieId: mairieId as number,
        actif: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        code: '720',
        libelle: 'CHAP.720 - REVENU DU PATRIMOINE IMMOBILIER',
        type: 'variable',
        mairieId: mairieId as number,
        actif: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        code: '7200',
        libelle: 'Location terrains et immeubles domaine privé',
        type: 'variable',
        mairieId: mairieId as number,
        actif: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        code: '72000',
        libelle: 'Baux à loyer',
        type: 'variable',
        mairieId: mairieId as number,
        actif: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        code: '7203',
        libelle: 'Revenus occupations temporaires domaine public',
        type: 'variable',
        mairieId: mairieId as number,
        actif: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        code: '72031',
        libelle: 'Concessions sur accord conventionnel',
        type: 'variable',
        mairieId: mairieId as number,
        actif: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        code: '72032',
        libelle: 'Droit de dépôts temporaires',
        type: 'variable',
        mairieId: mairieId as number,
        actif: true,
        createdAt: now,
        updatedAt: now,
      },

      // ========== SECTION 73 - AIDE DE L'ETAT - FONDS DE CONCOURS ==========
      {
        code: '73',
        libelle: "SECTION 73 - AIDE DE L'ETAT - FONDS DE CONCOURS",
        type: 'variable',
        mairieId: mairieId as number,
        actif: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        code: '730',
        libelle: 'CHAP.730 - DOTATION GLOBALE DE FONCTIONNEMENT',
        type: 'variable',
        mairieId: mairieId as number,
        actif: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        code: '7300',
        libelle: 'Partie minimale',
        type: 'variable',
        mairieId: mairieId as number,
        actif: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        code: '7301',
        libelle: 'Partie complémentaire, versement général',
        type: 'variable',
        mairieId: mairieId as number,
        actif: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        code: '7302',
        libelle: 'Partie complémentaire, versement spécial',
        type: 'variable',
        mairieId: mairieId as number,
        actif: true,
        createdAt: now,
        updatedAt: now,
      },

      // ========== SECTION 74 - RECETTES DIVERSES AU TITRE I ==========
      {
        code: '74',
        libelle: 'SECTION 74 - RECETTES DIVERSES AU TITRE I',
        type: 'variable',
        mairieId: mairieId as number,
        actif: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        code: '742',
        libelle: 'CHAP.742 - PRELEVEMENT SUR FONDS DE RESERVE',
        type: 'variable',
        mairieId: mairieId as number,
        actif: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        code: '743',
        libelle: 'CHAP.743 - RECETTES ACCIDENTELLES',
        type: 'variable',
        mairieId: mairieId as number,
        actif: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        code: '7406',
        libelle: 'Autres versements (Vignettes auto)',
        type: 'variable',
        mairieId: mairieId as number,
        actif: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        code: '7436',
        libelle: 'Recettes accidentelles',
        type: 'variable',
        mairieId: mairieId as number,
        actif: true,
        createdAt: now,
        updatedAt: now,
      },

      // ========== SECTION 02 - PRELEVEMENT SUR FONDS D'INVESTISSEMENT ==========
      {
        code: '02',
        libelle: "SECTION 02 - PRELEVEMENT SUR FONDS D'INVESTISSEMENT",
        type: 'variable',
        mairieId: mairieId as number,
        actif: true,
        createdAt: now,
        updatedAt: now,
      },

      // ========== SECTION 04 - AIDE DE L'ETAT - FONDS DE CONCOURS - AIDES EXTERIEURES ==========
      {
        code: '04',
        libelle: "SECTION 04 - AIDE DE L'ETAT - FONDS DE CONCOURS",
        type: 'variable',
        mairieId: mairieId as number,
        actif: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        code: '040',
        libelle: "CHAP.040 - AIDE ET CONCOURS DE L'ETAT",
        type: 'variable',
        mairieId: mairieId as number,
        actif: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        code: '0401',
        libelle: "Subvention d'équipement de l'Etat",
        type: 'variable',
        mairieId: mairieId as number,
        actif: true,
        createdAt: now,
        updatedAt: now,
      },

      // ========== SECTION 06 - RECETTES DIVERSES AU TITRE II ==========
      {
        code: '06',
        libelle: 'SECTION 06 - RECETTES DIVERSES AU TITRE II',
        type: 'variable',
        mairieId: mairieId as number,
        actif: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        code: '066',
        libelle: 'CHAP.066 - AUTRES RECETTES DIVERSES AU TITRE II',
        type: 'variable',
        mairieId: mairieId as number,
        actif: true,
        createdAt: now,
        updatedAt: now,
      },
    ]);

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
