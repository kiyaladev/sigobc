import { db, DEFAULT_MAIRIE_ID } from './db';
import { MAIRIE_INFO } from 'src/constanteInfo';
import type {
  SousChapitre,
  Prevision,
  Projet,
  Mandat,
  BordereauMandat,
  BordereauRecette,
  PrevisionRecette,
  Declaration,
  MandatRecette,
  BordereauMandatRecette,
  ChapitreRecette,
  EtatFinancierMensuelRecette,
  Employe,
  FichePaie,
} from './db';

const now = new Date();
const CURRENT_YEAR = now.getFullYear();

// =================================================================
//                      HELPERS
// =================================================================

function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function randomAmount(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomChoice<T>(array: T[]): T {
  const index = Math.floor(Math.random() * array.length);
  return array[index]!;
}

/**
 * Génère l'etatMensuelId d'un mandat au format: {année-mois}--{sousChapitreCode}/{chapitreCode}
 * @param date Date du mandat
 * @param sousChapitreCode Code du sous-chapitre
 * @param chapitreCode Code du chapitre
 * @returns L'etatMensuelId formaté
 */
function generateEtatMensuelId(date: Date, sousChapitreCode: string, chapitreCode: string): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}--${sousChapitreCode}/${chapitreCode}`;
}

/**
 * Génère l'etatMensuelId d'un mandat (version exportable)
 * Format: {année-mois}--{sousChapitreCode}/{chapitreCode}
 */
export function computeEtatMensuelId(
  date: Date,
  sousChapitreCode: string,
  chapitreCode: string,
): string {
  return generateEtatMensuelId(date, sousChapitreCode, chapitreCode);
}

// =================================================================
//                      INTERFACES
// =================================================================

export interface SeedOptions {
  mandats?: number;
  bordereauMandats?: number;
}

interface ReferenceProjetSeed {
  libelle: string;
  compteCode: string;
  patrimoine: string;
  montant: number;
  realise: number;
  typeBien: 'immobilier' | 'mobilier' | 'incorporel';
}

function getProjetStatut(montant: number, realise: number): Projet['statut'] {
  if (realise <= 0) return 'en_cours';
  if (realise >= montant * 0.995) return 'termine';
  return 'en_cours';
}

const REFERENCE_PROJETS: ReferenceProjetSeed[] = [
  {
    libelle: 'Ouverture de voies au quartier Zouah Bi Bah',
    compteCode: '9101',
    patrimoine: '2220',
    montant: 29000000,
    realise: 28999750,
    typeBien: 'immobilier',
  },
  {
    libelle: 'Réhabilitation du bâtiment de la municipale de la mairie',
    compteCode: '900',
    patrimoine: '2210',
    montant: 16990000,
    realise: 0,
    typeBien: 'immobilier',
  },
  {
    libelle: "Construction d'un centre de santé à DEMA",
    compteCode: '9212',
    patrimoine: '2214',
    montant: 10358000,
    realise: 6590815,
    typeBien: 'immobilier',
  },
  {
    libelle: "Construction d'une école primaire publique SEBOUAFLA",
    compteCode: '9201',
    patrimoine: '2212',
    montant: 95723000,
    realise: 74247877,
    typeBien: 'immobilier',
  },
  {
    libelle: "Construction d'une école primaire publique BOUHITAFLA",
    compteCode: '9201',
    patrimoine: '2212',
    montant: 30000000,
    realise: 22925555,
    typeBien: 'immobilier',
  },
  {
    libelle: 'Extension du réseau électrique sur 800 mètres au quartier Château',
    compteCode: '9103',
    patrimoine: '2224',
    montant: 54000000,
    realise: 44690615,
    typeBien: 'immobilier',
  },
  {
    libelle: 'Extension du réseau électrique sur 900 mètres au quartier Rouge',
    compteCode: '9103',
    patrimoine: '2224',
    montant: 65000000,
    realise: 47165980,
    typeBien: 'immobilier',
  },
  {
    libelle: 'Extension du réseau électrique sur 250 mètres au centre de santé DEMA',
    compteCode: '9103',
    patrimoine: '2224',
    montant: 15000000,
    realise: 13930224,
    typeBien: 'immobilier',
  },
  {
    libelle: 'Réhabilitation de 40 magasins gare routière de Vavoua',
    compteCode: '9344',
    patrimoine: '2213',
    montant: 2321000,
    realise: 0,
    typeBien: 'immobilier',
  },
  {
    libelle: 'Réhabilitation de 3 bâtiments du groupe scolaire 2-7-9',
    compteCode: '9201',
    patrimoine: '2212',
    montant: 2476000,
    realise: 0,
    typeBien: 'immobilier',
  },
  {
    libelle: 'Réhabilitation de 6 salles de classe EPP GOUABAFLA',
    compteCode: '9201',
    patrimoine: '2212',
    montant: 1264000,
    realise: 0,
    typeBien: 'immobilier',
  },
  {
    libelle: 'Équipement de 15 forages en pompe scolaire dans les villages',
    compteCode: '9134',
    patrimoine: '2222',
    montant: 3650000,
    realise: 0,
    typeBien: 'immobilier',
  },
  {
    libelle: 'Construction de 7 forages dans les villages',
    compteCode: '9134',
    patrimoine: '2222',
    montant: 57335000,
    realise: 0,
    typeBien: 'immobilier',
  },
  {
    libelle: "Construction d'un bâtiment au groupe scolaire 146",
    compteCode: '9201',
    patrimoine: '2212',
    montant: 26710000,
    realise: 0,
    typeBien: 'immobilier',
  },
  {
    libelle: 'Équipement du centre de santé de DEMA en mobilier de bureau',
    compteCode: '9212',
    patrimoine: '2260',
    montant: 20578000,
    realise: 20570000,
    typeBien: 'mobilier',
  },
  {
    libelle: 'Acquisition de 5 motos pour les chefs de service de la mairie',
    compteCode: '900',
    patrimoine: '2244',
    montant: 7500000,
    realise: 7500000,
    typeBien: 'mobilier',
  },
  {
    libelle: "Acquisition d'un véhicule de fonction pour le maire",
    compteCode: '900',
    patrimoine: '2257',
    montant: 29000000,
    realise: 29000000,
    typeBien: 'mobilier',
  },
  {
    libelle: "Acquisition d'un véhicule de fonction pour le secrétaire général",
    compteCode: '900',
    patrimoine: '2257',
    montant: 25000000,
    realise: 25000000,
    typeBien: 'mobilier',
  },
  {
    libelle: 'Acquisition de 5 ordinateurs portables pour les chefs de service',
    compteCode: '900',
    patrimoine: '2262',
    montant: 1800000,
    realise: 1799975,
    typeBien: 'mobilier',
  },
  {
    libelle: 'Acquisition de 450 tables-bancs pour les EPP de SEBOUAFLA et BOUHITAFLA',
    compteCode: '9201',
    patrimoine: '2264',
    montant: 29500000,
    realise: 29452500,
    typeBien: 'mobilier',
  },
];

// =================================================================
//                      SEEDER DE DONNÉES PAR DÉFAUT
// =================================================================

/**
 * Remplit la base de données avec des données initiales par défaut.
 * Cette fonction est appelée si la base est vide.
 */
export async function seedDefaultData() {
  const mairieCount = await db.mairies.count();
  if (mairieCount > 0) return;

  // L'utilisateur initialise volontairement, retirer le flag de suppression
  localStorage.removeItem('sigobc_db_cleared');

  console.log('🚀 Seeding default data...');

  // 1. Mairie
  const mairieId = await db.mairies.add({
    nom: MAIRIE_INFO.nom,
    code: MAIRIE_INFO.code,
    adresse: MAIRIE_INFO.adresse,
    ville: MAIRIE_INFO.ville,
    departement: MAIRIE_INFO.departement,
    region: MAIRIE_INFO.region,
    codePostal: MAIRIE_INFO.codePostal,
    telephone: MAIRIE_INFO.telephone,
    email: MAIRIE_INFO.email,
    maire: MAIRIE_INFO.maire,
    createdAt: now,
    updatedAt: now,
  });

  // 2. Utilisateurs
  await db.utilisateurs.bulkAdd([
    {
      username: 'admin',
      password: 'Sigobc@2026!',
      nom: 'Administrateur',
      prenom: 'Complet',
      email: 'admin@sigobc.sn',
      role: 'admin',
      mairieId: mairieId,
      actif: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      username: 'agent',
      password: 'password',
      nom: 'Agent',
      prenom: 'Recouvrement',
      email: 'agent@sigobc.sn',
      role: 'agent',
      mairieId: mairieId,
      actif: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      username: 'comptable',
      password: 'password',
      nom: 'Comptable',
      prenom: 'Public',
      email: 'comptable@sigobc.sn',
      role: 'comptable',
      mairieId: mairieId,
      actif: true,
      createdAt: now,
      updatedAt: now,
    },
  ]);

  // 3. Chapitres par défaut (App3)
  await db.chapitres.bulkAdd([
    {
      code: '1',
      libelle: 'SALAIRE ET INDEM.',
      mairieId: mairieId,
      actif: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      code: '2',
      libelle: 'CHARGES SOCIALES',
      mairieId: mairieId,
      actif: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      code: '3',
      libelle: 'TRANSP. & FRAIS DE MISS.',
      mairieId: mairieId,
      actif: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      code: '4',
      libelle: 'CARBUR. & LUBRIF.',
      mairieId: mairieId,
      actif: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      code: '5',
      libelle: 'MATÉRIEL ET FOURNIT.',
      mairieId: mairieId,
      actif: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      code: '6',
      libelle: 'ABONN. EAU, ÉLEC, TÉLÉPH.',
      mairieId: mairieId,
      actif: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      code: '7',
      libelle: "TRAVAUX & SCES A L'ENTREP.",
      mairieId: mairieId,
      actif: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      code: '8',
      libelle: 'INTERVEN ET TRANSF.',
      mairieId: mairieId,
      actif: true,
      createdAt: now,
      updatedAt: now,
    },
  ]);

  // 4. Sous-chapitres par défaut (App3) - Liste complète avec hiérarchie
  console.log('🌱 Seeding sous-chapitres (hierarchical - complete list)...');

  const sousChapitresData = [
    // SECTION 60 - DÉPENSES DES SERVICES GÉNÉRAUX
    { code: '60', libelle: 'SECTION 60- DÉPENSES DES SERVICES GÉNÉRAUX', parent: null },
    { code: '600', libelle: 'CHAP. ADMINISTRATION GÉNÉRALE', parent: '60' },
    { code: '6000', libelle: 'ADMINISTRATION', parent: '600' },
    { code: '6001', libelle: 'AUTORITÉS MUNICIPALES', parent: '600' },
    { code: '60010', libelle: 'FONCTIONNEMENT CONSEILS ET COMMISSIONS', parent: '6001' },
    { code: '60011', libelle: 'FONCTIONNEMENT DE LA MUNICIPALITÉ', parent: '6001' },
    { code: '60012', libelle: 'FONCTIONNEMENT CABINET DU MAIRE', parent: '6001' },
    { code: '60013', libelle: 'INDEMNITÉ DE FONCTION ET DE REPRÉSENTATION', parent: '6001' },
    {
      code: '60015',
      libelle: 'FRAIS DE MISSIONS EN DEHORS DU TERRITOIRE NATIONAL (COMMUNE)',
      parent: '6001',
    },
    {
      code: '60016',
      libelle: 'AUTRES DÉPENSES AU TITRE DES AUTORITÉS MUNICIPALES',
      parent: '6001',
    },
    { code: '6002', libelle: 'ÉTAT CIVIL ET POPULATION', parent: '600' },
    { code: '6006', libelle: "AUTRES DÉPENSES D'ADMINISTRATION GÉNÉRALE", parent: '600' },

    { code: '601', libelle: 'CHAP. 601- ADMINISTRATION FINANCIÈRE ET DOM.', parent: '60' },
    { code: '6010', libelle: 'ADMINISTRATION', parent: '601' },
    { code: '6016', libelle: 'AUTRES DÉPENSES RELATIVES AU DOMAINE COMMUNAL', parent: '601' },

    { code: '602', libelle: 'CHAP. 602-RECETTE MUNICIPALE', parent: '60' },
    { code: '6020', libelle: 'ADMINISTRATION', parent: '602' },
    { code: '6021', libelle: 'FRAIS DE RECOUVREMENT ET POURSUITES', parent: '602' },

    { code: '603', libelle: 'CHAP.603-POLICE ET ORDRE PUBLIC-FOURRIÈRE', parent: '60' },
    { code: '6031', libelle: 'GARDES MUNICIPAUX', parent: '603' },
    { code: '6033', libelle: 'PROGRAMMES SPÉCIAUX ET OPÉRATIONS DIVERSES', parent: '603' },

    // SECTION 61 - DÉPENSES DES SERVICES DE COLLECTIVITÉ
    { code: '61', libelle: 'SECTION 61- DÉPENSES DES SERVICES DE COLLECTIVITÉ', parent: null },
    { code: '610', libelle: 'CHAP. 610-VOIRIES ET RÉSEAUX', parent: '61' },
    { code: '6100', libelle: 'ADMINISTRATION', parent: '610' },
    { code: '6101', libelle: 'VOIRIES - ROUTES - CHEMINS', parent: '610' },

    {
      code: '613',
      libelle: "CHAP. 613-HYGIÈNE ET SALUBRITÉ PUBLIQUES - HYDRAULIQUE - ADDUCTION D'EAU",
      parent: '61',
    },
    { code: '6133', libelle: 'NETTOIEMENT VOIRIE-ENLÈVEMENT ORDURES', parent: '613' },
    { code: '6136', libelle: "Autres dépenses d'hygiène et de salubrité", parent: '613' },

    {
      code: '614',
      libelle: "CHAP. 614- PROTECTION CIVILE - LUTTE CONTRE L'INCENDIE",
      parent: '61',
    },
    { code: '6141', libelle: 'PROTECTION CIVILE', parent: '614' },
    { code: '6142', libelle: 'LUTTE CONTRE INCENDIE', parent: '614' },

    { code: '615', libelle: 'CHAP. 615- CIMETIÈRES - SERVICES FUNÉRAIRES', parent: '61' },
    { code: '6151', libelle: 'CIMETIÈRE-INHUMATIONS-EXHUMATIONS', parent: '615' },
    { code: '6152', libelle: 'CREUSEMENT DE FOSSES', parent: '615' },

    // SECTION 62 - DÉPENSES DES SERVICES SOCIAUX CULTURELS ET DE PROMOTION HUMAINE
    {
      code: '62',
      libelle: 'SECTION 62- DÉPENSES DES SERVICES SOCIAUX CULTURELS ET DE PROMOTION HUMAINE',
      parent: null,
    },
    { code: '620', libelle: 'CHAP. 620- ÉDUCATION', parent: '62' },
    { code: '6201', libelle: "Crèche, jardin d'enfants et ecoles primaire", parent: '620' },
    { code: '6206', libelle: "AUTRES DÉPENSES D'ÉDUCATION", parent: '620' },

    { code: '621', libelle: 'CHAP. 621 : SANTÉ PUBLIQUE', parent: '62' },
    { code: '6214', libelle: 'Evacuation sanitaire - service ambulance', parent: '621' },

    { code: '622', libelle: 'CHAP. 622- ASSISTANCE SOCIALE', parent: '62' },
    { code: '6223', libelle: 'HANDICAPÉS', parent: '622' },
    { code: '6224', libelle: 'AIDE FAMILIALE, SOCIALE ET PERSONNES A.', parent: '622' },
    { code: '6225', libelle: 'AIDES AUX INDIGENTS', parent: '622' },
    { code: '6226', libelle: "AUTRES DÉPENSES D'ASSISTANCE SOCIALE", parent: '622' },

    { code: '624', libelle: 'CHAP. 624- SPORTS ET LOISIRS', parent: '62' },
    { code: '6242', libelle: 'MANIFESTATIONS SPORTIVES', parent: '624' },

    { code: '625', libelle: 'CHAP.625- ACTIVITÉS CULTURELLES', parent: '62' },
    { code: '6250', libelle: 'ADMINISTRATION', parent: '625' },
    { code: '6256', libelle: 'AUTRES DÉPENSES DES ACTIVITÉS CULTURELLES', parent: '625' },

    {
      code: '626',
      libelle: 'CHAP.626- AUTRES DÉPENSES DES SERVICE SOCIAUX .CULTURELS ET DE PROMOTION HUMAINE',
      parent: '62',
    },

    // SECTION 63 - DÉPENSES DES SERVICES ÉCONOMIQUES
    { code: '63', libelle: 'SECTION 63- DÉPENSES DES SERVICES ÉCONOMIQUES', parent: null },
    { code: '630', libelle: 'CHAP. 630- AGRICULTURE ET ÉLEVAGE', parent: '63' },
    { code: '633', libelle: 'CHAP.633-TRANSPORT-COMMUNICATIONS', parent: '63' },
    { code: '634', libelle: 'CHAP. 634- INDUSTRIE ET COMMERCE', parent: '63' },
    { code: '6341', libelle: 'ABATTOIRS-CONSERVATION ET TRANSPORTS DE VIANDE', parent: '634' },

    // SECTION 64 - DÉPENSES DIVERSES
    { code: '64', libelle: 'SECTION 64 - DÉPENSES DIVERSES', parent: null },
    { code: '640', libelle: 'CHAP. 640- DETTES', parent: '64' },
    { code: '6406', libelle: 'AUTRES DETTES DE LA COMMUNE', parent: '640' },

    {
      code: '641',
      libelle: 'CHAP. 641-CONTRIBUTIONS FONDS DE CONCOURS ET TRANSFERTS',
      parent: '64',
    },
    {
      code: '6415',
      libelle: 'CONFÉRENCES INTERNATIONALES, ASSOCIATION DES VILLES ET COMMUNES',
      parent: '641',
    },

    { code: '642', libelle: 'CHAP. 642- ASSURANCE DE LA COMMUNE', parent: '64' },
    { code: '6420', libelle: 'RESPONSABILITÉ CIVILE', parent: '642' },
    { code: '6422', libelle: 'ASSURANCE DES VÉHICULES', parent: '642' },
    { code: '6426', libelle: 'AUTRES ASSURANCES (ÉLUS)', parent: '642' },

    {
      code: '643',
      libelle: 'CHAP.643- CÉRÉMONIES PUBLIQUES - FÊTES ET RÉCEPTIONS OFFICIELLES',
      parent: '64',
    },
    { code: '6430', libelle: 'CÉRÉMONIES PUBLIQUES', parent: '643' },
    { code: '6431', libelle: 'FÊTES ET RÉCEPTIONS OFFICIELLES', parent: '643' },

    { code: '644', libelle: 'CHAP.644-VERSEMENT AUX FONDS DE RÉSERVE', parent: '64' },
    { code: '6440', libelle: 'FONDS DE RÉSERVES ORDINAIRE', parent: '644' },
    { code: '6441', libelle: "FONDS D'INVESTISSEMENT", parent: '644' },

    { code: '645', libelle: 'CHAP.645- DÉPENSES ACCIDENTELLES', parent: '64' },
    { code: '6451', libelle: 'INDEMNITÉS -FRAIS ET DOMMAGE ET INTÉRÊTS', parent: '645' },

    // SECTION 90 - EQUIPEMENT DES SERVICES GENERAUX
    { code: '90', libelle: 'SECTION 90 - ÉQUIPEMENT DES SERVICES GÉNÉRAUX', parent: null },
    { code: '900', libelle: 'CHAP.900-ADMINISTRATION GÉNÉRALE', parent: '90' },
    { code: '903', libelle: 'CHAP.903-POLICE ET ORDRE PUBLIC FOURRIÈRE', parent: '90' },
    {
      code: '9030',
      libelle: 'Police et ordre publique - fourrière SOUS TOTAL CHAP. 903',
      parent: '903',
    },

    // SECTION 91 - EQUIPEMENT DES SERVICES DE COLLECTIVITE
    { code: '91', libelle: 'SECTION 91-ÉQUIPEMENT DES SCES DE COLLECTIVITÉ', parent: null },
    { code: '910', libelle: 'CHAP.910-VOIRIES ET RÉSEAUX', parent: '91' },
    { code: '9101', libelle: 'VOIRIES', parent: '910' },
    { code: '9102', libelle: "Réseaux d'assainissement & Drainage", parent: '910' },
    { code: '9103', libelle: 'Électricité - éclairage public', parent: '910' },
    {
      code: '913',
      libelle: "CHAP. 913- HYGIÈNE & SALUBRITÉ PUBLIQ. HYDRAULIQUE- ADDUCTION D'EAU Articles",
      parent: '91',
    },
    { code: '9134', libelle: 'Hydraulique - pompages puits lavoirs', parent: '913' },
    { code: '9136', libelle: "Autres dépenses d'équipement au tritre", parent: '913' },

    // SECTION 92 - EQUIPEMENT DES SERVICES SOCIAUX, CULTURELS ET DE LA PROMOTION HUMAINE
    {
      code: '92',
      libelle: 'SECTION 92-ÉQUIPEMENT DES SERVICES SOCIAUX, CULTURELS ET DE LA PROMOTION HUMAINE',
      parent: null,
    },
    { code: '921', libelle: 'CHAP. 921- SANTÉ PUBLIQUE Articles', parent: '92' },
    { code: '9212', libelle: 'Hôpitaux & Dispensaires', parent: '921' },

    // SECTION 93 - EQUIPEMENT DES SERVICES ECONOMIQUES
    { code: '93', libelle: 'SECTION 93- ÉQUIPEMENT DES SERVICES ÉCONOMIQUES', parent: null },
    { code: '934', libelle: 'CHAP. 934- INDUSTRIES & COMMERCES Articles', parent: '93' },
    { code: '9341', libelle: 'Abattoir- Conservation de viande & Transp.', parent: '934' },
    { code: '9344', libelle: 'Marchés', parent: '934' },

    // ========== RECETTES ==========

    // SECTION 70 - RECETTES FISCALES
    { code: '70', libelle: 'SECTION 70- RECETTES FISCALES', parent: null },

    {
      code: '700',
      libelle: 'CHAP.700-IMPOTS DONT LE PRODUIT EST ATTRIBUE AUX COMMUNES',
      parent: '70',
    },
    { code: '7000', libelle: 'Contribution foncière des propriétés bâties', parent: '700' },
    { code: '7001', libelle: 'Contribution foncière des propriétés non bâties', parent: '700' },
    { code: '7004', libelle: 'Contribution des patentes', parent: '700' },
    { code: '7005', libelle: 'Contribution des licences', parent: '700' },

    { code: '702', libelle: 'CHAP. 702- TAXES COMMUNALES PERCUES PAR VOIE DE ROLE', parent: '70' },
    { code: '70261', libelle: 'Impôt synthétique', parent: '702' },
    {
      code: '70262',
      libelle: 'Taxes forfaitaires des petits commerçants et artisans',
      parent: '702',
    },
    { code: '7027', libelle: 'Taxe sur les locaux loués en garnis', parent: '702' },

    {
      code: '703',
      libelle: 'CHAP. 703- TAXES COMMUNALES PERCUES SUR TITRE DE RECETTES PROPRES AUX COMMUNES',
      parent: '70',
    },
    { code: '7030', libelle: 'Taxes sur les pompes distributrices de carburant', parent: '703' },
    { code: '7031', libelle: 'Taxes sur les charrettes', parent: '703' },
    { code: '7036', libelle: 'Taxes sur les spectacles et galas', parent: '703' },
    { code: '7038', libelle: 'Taxes sur les établissements de nuit', parent: '703' },

    {
      code: '704',
      libelle: 'CHAP. 704- TAXES COMMUNALES PERCUES SUR TITRE DE RECETTES PAR LES COMMUNES',
      parent: '70',
    },
    { code: '7041', libelle: 'Taxes sur les taxis', parent: '704' },
    { code: '7042', libelle: 'Taxes sur la publicité', parent: '704' },

    // SECTION 71 - RECETTES DES PRESTATIONS ET SERVICES
    { code: '71', libelle: 'SECTION 71-RECETTES DES PRESTATIONS ET SERVICES', parent: null },

    { code: '710', libelle: 'CHAP. 710- RECETTES DES SERVICES GENERAUX', parent: '71' },
    { code: '7100', libelle: 'Administration générale', parent: '710' },
    { code: '71000', libelle: 'Légalisation de signatures et certifications', parent: '7100' },
    {
      code: '71001',
      libelle: 'Délivrance de livrets de famille et autres documents',
      parent: '7100',
    },
    {
      code: '71006',
      libelle: "Autres recettes de prestations et services de l'administration générale",
      parent: '7100',
    },
    { code: '7101', libelle: 'Administration financière et domaniale', parent: '710' },
    { code: '71010', libelle: "Taxe sur les délivrances des permis d'habiter", parent: '7101' },
    {
      code: '71016',
      libelle:
        "Autres recettes de prestations et services de l'administration financière et domaniale",
      parent: '7101',
    },
    { code: '71030', libelle: 'Taxe de séquestre', parent: '710' },
    {
      code: '71031',
      libelle: 'Produits de ventes effectuées au titre de la fourrière',
      parent: '710',
    },

    { code: '711', libelle: 'CHAP. 711- RECETTES DES SERVICES DE COLLECTIVITE', parent: '71' },
    { code: '7112', libelle: 'Urbanisme et environnement', parent: '711' },
    { code: '71120', libelle: 'Taxes ou redevance de bornage', parent: '7112' },
    {
      code: '71126',
      libelle:
        "Autres recettes de prestations et services au titre de l'urbanisme et de l'environnement",
      parent: '7112',
    },
    {
      code: '7113',
      libelle: "Hygiène et salubrité publiques - hydraulique - adduction d'eau",
      parent: '711',
    },
    {
      code: '7130',
      libelle: "Taxe d'enlèvement des ordures ménagères et redevances",
      parent: '7113',
    },
    {
      code: '71150',
      libelle: 'Cimetières - services funéraires, taxes, redevances, autres recettes',
      parent: '711',
    },
    { code: '71152', libelle: 'Morgue - Dépôts de cercueils', parent: '711' },
    {
      code: '71154',
      libelle: 'Autres recettes de prestations et services funéraires',
      parent: '711',
    },

    {
      code: '712',
      libelle: 'CHAP. 712- RECETTES DES SERVICES SOCIAUX, CULTURELS ET DE LA PROMOTION HUMAINE',
      parent: '71',
    },
    {
      code: '7125',
      libelle: 'Activités culturelles - Taxes, Redevances, Autres recettes',
      parent: '712',
    },
    { code: '71250', libelle: 'Administration des activités culturelles', parent: '7125' },
    {
      code: '71256',
      libelle:
        'Autres recettes de prestations et services au titre des services sociaux, culturels et de la promotion humaine',
      parent: '7125',
    },

    { code: '713', libelle: 'CHAP. 713- RECETTES DES SERVICES ECONOMIQUES', parent: '71' },
    {
      code: '7133',
      libelle: 'Transports - communications, taxes, redevances, autres recettes',
      parent: '713',
    },
    { code: '71330', libelle: 'Administration des transports et communications', parent: '7133' },
    {
      code: '71331',
      libelle: 'Transports par routes - gare routière - stations de taxis',
      parent: '7133',
    },
    {
      code: '7134',
      libelle: 'Industrie et commerce - taxes - redevances, autres recettes',
      parent: '713',
    },
    { code: '71341', libelle: 'Abattoirs, conservation et transport de viande', parent: '7134' },
    { code: '71344', libelle: 'Marchés', parent: '7134' },
    { code: '71345', libelle: 'Foires et expositions', parent: '7134' },
  ];

  const codeToIdMap = new Map<string, number>();

  for (const item of sousChapitresData) {
    let parentId = undefined;
    if (item.parent) {
      parentId = codeToIdMap.get(item.parent);
    }

    const newItem: Omit<SousChapitre, 'id'> = {
      code: item.code,
      libelle: item.libelle,
      mairieId: mairieId,
      actif: true,
      createdAt: now,
      updatedAt: now,
    };
    if (parentId !== undefined) {
      newItem.parentId = parentId;
    }

    const id = await db.sousChapitres.add(newItem);
    codeToIdMap.set(item.code, id);
  }

  // 5. Taxes par défaut pour App6 - Recettes (Nomenclature complète)
  console.log('🌱 Seeding taxes (App6 - Recettes)...');
  await db.taxes.bulkAdd([
    // ========== SECTION 70 - RECETTES FISCALES ==========
    {
      code: '70',
      libelle: 'SECTION 70 - RECETTES FISCALES',
      type: 'variable',
      mairieId: mairieId,
      actif: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      code: '700',
      libelle: 'CHAP.700 - IMPÔTS ATTRIBUÉS AUX COMMUNES',
      type: 'variable',
      mairieId: mairieId,
      actif: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      code: '7000',
      libelle: 'Contribution foncière des propriétés bâties',
      type: 'variable',
      mairieId: mairieId,
      actif: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      code: '7001',
      libelle: 'Contribution foncière des propriétés non bâties',
      type: 'variable',
      mairieId: mairieId,
      actif: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      code: '7004',
      libelle: 'Contribution des patentes',
      type: 'variable',
      mairieId: mairieId,
      actif: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      code: '7005',
      libelle: 'Contribution des licences',
      type: 'variable',
      mairieId: mairieId,
      actif: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      code: '702',
      libelle: 'CHAP.702 - TAXES COMMUNALES PAR VOIE DE RÔLE',
      type: 'variable',
      mairieId: mairieId,
      actif: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      code: '70261',
      libelle: 'Impôt synthétique',
      type: 'variable',
      mairieId: mairieId,
      actif: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      code: '70262',
      libelle: 'Taxes forfaitaires petits commerçants/artisans',
      type: 'variable',
      mairieId: mairieId,
      actif: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      code: '7027',
      libelle: 'Taxe sur les locaux loués en garnis',
      type: 'variable',
      mairieId: mairieId,
      actif: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      code: '703',
      libelle: 'CHAP.703 - TAXES SUR TITRE DE RECETTES PROPRES',
      type: 'variable',
      mairieId: mairieId,
      actif: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      code: '7030',
      libelle: 'Taxes sur les pompes distributrices de carburant',
      type: 'variable',
      mairieId: mairieId,
      actif: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      code: '7031',
      libelle: 'Taxes sur les charrettes',
      type: 'variable',
      mairieId: mairieId,
      actif: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      code: '7036',
      libelle: 'Taxes sur les spectacles et galas',
      type: 'variable',
      mairieId: mairieId,
      actif: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      code: '7038',
      libelle: 'Taxes sur les établissements de nuit',
      type: 'variable',
      mairieId: mairieId,
      actif: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      code: '704',
      libelle: 'CHAP.704 - TAXES SUR TITRE DE RECETTES PAR LES COMMUNES',
      type: 'variable',
      mairieId: mairieId,
      actif: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      code: '7041',
      libelle: 'Taxes sur les taxis',
      type: 'variable',
      mairieId: mairieId,
      actif: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      code: '7042',
      libelle: 'Taxes sur la publicité',
      type: 'variable',
      mairieId: mairieId,
      actif: true,
      createdAt: now,
      updatedAt: now,
    },

    // ========== SECTION 71 - RECETTES DES PRESTATIONS ET SERVICES ==========
    {
      code: '71',
      libelle: 'SECTION 71 - RECETTES DES PRESTATIONS ET SERVICES',
      type: 'variable',
      mairieId: mairieId,
      actif: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      code: '710',
      libelle: 'CHAP.710 - RECETTES DES SERVICES GENERAUX',
      type: 'variable',
      mairieId: mairieId,
      actif: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      code: '7100',
      libelle: 'Administration générale',
      type: 'variable',
      mairieId: mairieId,
      actif: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      code: '71000',
      libelle: 'Légalisation de signatures et certifications',
      type: 'fixe',
      montant: 500,
      mairieId: mairieId,
      actif: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      code: '71001',
      libelle: 'Délivrance livrets de famille et documents',
      type: 'fixe',
      montant: 1000,
      mairieId: mairieId,
      actif: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      code: '71006',
      libelle: 'Autres recettes administration générale',
      type: 'variable',
      mairieId: mairieId,
      actif: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      code: '7101',
      libelle: 'Administration financière et domaniale',
      type: 'variable',
      mairieId: mairieId,
      actif: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      code: '71010',
      libelle: "Taxe sur délivrance permis d'habiter",
      type: 'variable',
      mairieId: mairieId,
      actif: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      code: '71016',
      libelle: 'Autres recettes admin. financière/domaniale',
      type: 'variable',
      mairieId: mairieId,
      actif: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      code: '71030',
      libelle: 'Taxe de séquestre',
      type: 'variable',
      mairieId: mairieId,
      actif: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      code: '71031',
      libelle: 'Produits de ventes de la fourrière',
      type: 'variable',
      mairieId: mairieId,
      actif: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      code: '711',
      libelle: 'CHAP.711 - RECETTES DES SERVICES DE COLLECTIVITE',
      type: 'variable',
      mairieId: mairieId,
      actif: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      code: '7112',
      libelle: 'Urbanisme et environnement',
      type: 'variable',
      mairieId: mairieId,
      actif: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      code: '71120',
      libelle: 'Taxes ou redevance de bornage',
      type: 'variable',
      mairieId: mairieId,
      actif: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      code: '71126',
      libelle: 'Autres recettes urbanisme/environnement',
      type: 'variable',
      mairieId: mairieId,
      actif: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      code: '7113',
      libelle: "Hygiène, salubrité, hydraulique, adduction d'eau",
      type: 'variable',
      mairieId: mairieId,
      actif: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      code: '7130',
      libelle: "Taxe d'enlèvement des ordures ménagères",
      type: 'fixe',
      montant: 15000,
      mairieId: mairieId,
      actif: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      code: '71150',
      libelle: 'Cimetières - services funéraires',
      type: 'variable',
      mairieId: mairieId,
      actif: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      code: '71152',
      libelle: 'Morgue - Dépôts de cercueils',
      type: 'variable',
      mairieId: mairieId,
      actif: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      code: '71154',
      libelle: 'Autres recettes services funéraires',
      type: 'variable',
      mairieId: mairieId,
      actif: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      code: '712',
      libelle: 'CHAP.712 - RECETTES SERVICES SOCIAUX/CULTURELS',
      type: 'variable',
      mairieId: mairieId,
      actif: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      code: '7125',
      libelle: 'Activités culturelles - Taxes, Redevances',
      type: 'variable',
      mairieId: mairieId,
      actif: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      code: '71250',
      libelle: 'Administration activités culturelles',
      type: 'variable',
      mairieId: mairieId,
      actif: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      code: '71256',
      libelle: 'Autres recettes services sociaux/culturels',
      type: 'variable',
      mairieId: mairieId,
      actif: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      code: '713',
      libelle: 'CHAP.713 - RECETTES DES SERVICES ECONOMIQUES',
      type: 'variable',
      mairieId: mairieId,
      actif: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      code: '7133',
      libelle: 'Transports - communications',
      type: 'variable',
      mairieId: mairieId,
      actif: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      code: '71330',
      libelle: 'Administration transports et communications',
      type: 'variable',
      mairieId: mairieId,
      actif: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      code: '71331',
      libelle: 'Gare routière - stations de taxis',
      type: 'variable',
      mairieId: mairieId,
      actif: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      code: '7134',
      libelle: 'Industrie et commerce',
      type: 'variable',
      mairieId: mairieId,
      actif: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      code: '71341',
      libelle: 'Abattoirs, conservation et transport de viande',
      type: 'variable',
      mairieId: mairieId,
      actif: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      code: '71344',
      libelle: 'Marchés',
      type: 'variable',
      mairieId: mairieId,
      actif: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      code: '71345',
      libelle: 'Foires et expositions',
      type: 'variable',
      mairieId: mairieId,
      actif: true,
      createdAt: now,
      updatedAt: now,
    },

    // ========== SECTION 72 - REVENU DU PATRIMOINE ET DU PORTEFEUILLE ==========
    {
      code: '72',
      libelle: 'SECTION 72 - REVENU DU PATRIMOINE',
      type: 'variable',
      mairieId: mairieId,
      actif: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      code: '720',
      libelle: 'CHAP.720 - REVENU DU PATRIMOINE IMMOBILIER',
      type: 'variable',
      mairieId: mairieId,
      actif: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      code: '7200',
      libelle: 'Location terrains et immeubles domaine privé',
      type: 'variable',
      mairieId: mairieId,
      actif: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      code: '72000',
      libelle: 'Baux à loyer',
      type: 'variable',
      mairieId: mairieId,
      actif: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      code: '7203',
      libelle: 'Revenus occupations temporaires domaine public',
      type: 'variable',
      mairieId: mairieId,
      actif: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      code: '72031',
      libelle: 'Concessions sur accord conventionnel',
      type: 'variable',
      mairieId: mairieId,
      actif: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      code: '72032',
      libelle: 'Droit de dépôts temporaires',
      type: 'variable',
      mairieId: mairieId,
      actif: true,
      createdAt: now,
      updatedAt: now,
    },

    // ========== SECTION 73 - AIDE DE L'ETAT - FONDS DE CONCOURS ==========
    {
      code: '73',
      libelle: "SECTION 73 - AIDE DE L'ÉTAT - FONDS DE CONCOURS",
      type: 'variable',
      mairieId: mairieId,
      actif: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      code: '730',
      libelle: 'CHAP.730 - DOTATION GLOBALE DE FONCTIONNEMENT',
      type: 'variable',
      mairieId: mairieId,
      actif: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      code: '7300',
      libelle: 'Partie minimale',
      type: 'variable',
      mairieId: mairieId,
      actif: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      code: '7301',
      libelle: 'Partie complémentaire, versement général',
      type: 'variable',
      mairieId: mairieId,
      actif: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      code: '7302',
      libelle: 'Partie complémentaire, versement spécial',
      type: 'variable',
      mairieId: mairieId,
      actif: true,
      createdAt: now,
      updatedAt: now,
    },

    // ========== SECTION 74 - RECETTES DIVERSES AU TITRE I ==========
    {
      code: '74',
      libelle: 'SECTION 74 - RECETTES DIVERSES AU TITRE I',
      type: 'variable',
      mairieId: mairieId,
      actif: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      code: '742',
      libelle: 'CHAP.742 - PRÉLÈVEMENT SUR FONDS DE RÉSERVE',
      type: 'variable',
      mairieId: mairieId,
      actif: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      code: '743',
      libelle: 'CHAP.743 - RECETTES ACCIDENTELLES',
      type: 'variable',
      mairieId: mairieId,
      actif: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      code: '7406',
      libelle: 'Autres versements (Vignettes auto)',
      type: 'variable',
      mairieId: mairieId,
      actif: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      code: '7436',
      libelle: 'Recettes accidentelles',
      type: 'variable',
      mairieId: mairieId,
      actif: true,
      createdAt: now,
      updatedAt: now,
    },

    // ========== SECTION 02 - PRELEVEMENT SUR FONDS D'INVESTISSEMENT ==========
    {
      code: '02',
      libelle: "SECTION 02 - PRÉLÈVEMENT SUR FONDS D'INVESTISSEMENT",
      type: 'variable',
      mairieId: mairieId,
      actif: true,
      createdAt: now,
      updatedAt: now,
    },

    // ========== SECTION 04 - AIDE DE L'ETAT - FONDS DE CONCOURS - AIDES EXTERIEURES ==========
    {
      code: '04',
      libelle: "SECTION 04 - AIDE DE L'ÉTAT - FONDS DE CONCOURS",
      type: 'variable',
      mairieId: mairieId,
      actif: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      code: '040',
      libelle: "CHAP.040 - AIDE ET CONCOURS DE L'ÉTAT",
      type: 'variable',
      mairieId: mairieId,
      actif: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      code: '0401',
      libelle: "Subvention d'équipement de l'État",
      type: 'variable',
      mairieId: mairieId,
      actif: true,
      createdAt: now,
      updatedAt: now,
    },

    // ========== SECTION 06 - RECETTES DIVERSES AU TITRE II ==========
    {
      code: '06',
      libelle: 'SECTION 06 - RECETTES DIVERSES AU TITRE II',
      type: 'variable',
      mairieId: mairieId,
      actif: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      code: '066',
      libelle: 'CHAP.066 - AUTRES RECETTES DIVERSES AU TITRE II',
      type: 'variable',
      mairieId: mairieId,
      actif: true,
      createdAt: now,
      updatedAt: now,
    },
  ]);

  console.log('✅ Default data seeded successfully.');
}

// =================================================================
//                      SEEDERS DE DONNÉES DE TEST
// =================================================================

/**
 * Remplit la base de données avec une grande quantité de données de test aléatoires.
 */
export async function seedTestData(options: SeedOptions = {}) {
  console.log('🚀 Starting test data seeders...');

  const {
    // mandats = 200,
    bordereauMandats = 20,
  } = options;

  try {
    // D'abord, vider et réinitialiser la base
    await clearDatabase();
    // Retirer le flag après le clear car on va remplir la base
    localStorage.removeItem('sigobc_db_cleared');
    await seedDefaultData();
    console.log('Default data seeded before adding test data.');

    const utilisateursCreated = await db.utilisateurs.toArray();
    const utilisateurIds = utilisateursCreated.map((u) => u.id!);
    const chapitresCreated = await db.chapitres.toArray();
    const chapitreIds = chapitresCreated.map((c) => c.id!);
    const sousChapitresCreated = await db.sousChapitres.toArray();
    // App3 : Seulement les sous-chapitres commençant par 6 ou 9
    const app3SousChapitres = sousChapitresCreated.filter(
      (s) => s.code.startsWith('6') || s.code.startsWith('9'),
    );
    const sousChapitreIds = app3SousChapitres.map((s) => s.id!);

    // Seeding prévisions
    console.log(
      `🌱 Seeding test previsions (1 per chapitre/sous-chapitre couple for ${CURRENT_YEAR} & ${CURRENT_YEAR - 1})...`,
    );
    const previsionsCreated = await seedPrevisions(chapitreIds, utilisateurIds, sousChapitreIds);
    const previsionIds = previsionsCreated.map((p) => p.id!);

    // Seeding bordereaux mandats
    console.log(`🌱 Seeding ${bordereauMandats} test bordereau mandats...`);
    const bordereauMandatsCreated = await seedBordereauMandats(utilisateurIds, bordereauMandats);

    // Seeding mandats (3 par couple chapitre/sous-chapitre)
    console.log('🌱 Seeding mandats (3 par couple chapitre/sous-chapitre)...');
    await seedMandats(
      chapitreIds,
      sousChapitreIds,
      previsionIds,
      utilisateurIds,
      bordereauMandatsCreated,
    );

    // Mettre à jour les prévisions avec les montants engagés réels
    console.log('🌱 Mise à jour des montants engagés dans les prévisions...');
    await updatePrevisionsFromMandats();

    console.log('🌱 Seeding projets de référence...');
    await seedReferenceProjects();

    // =================================================================
    // APP6 - RECETTES SEEDERS
    // =================================================================

    // Seeding des prévisions de recettes
    console.log('🌱 Seeding prévisions de recettes...');
    await seedPrevisionsRecettes(utilisateurIds);

    // Seeding bordereaux recettes
    console.log('🌱 Seeding bordereaux recettes...');
    const bordereauxRecetteCreated = await seedBordereauxRecettes(utilisateurIds);

    // Seeding déclarations de recettes
    console.log('🌱 Seeding déclarations de recettes...');
    await seedDeclarations(utilisateurIds, bordereauxRecetteCreated);

    // Seeding bordereaux mandats de recettes
    console.log('🌱 Seeding bordereaux mandats de recettes...');
    const bordereauMandatsRecetteCreated = await seedBordereauMandatsRecette(utilisateurIds, 10);

    // Seeding mandats de recettes
    console.log('🌱 Seeding mandats de recettes...');
    const taxeList = await db.taxes.toArray();
    const taxeIds = taxeList.map((t) => t.id!);
    await seedMandatsRecette(chapitreIds, taxeIds, utilisateurIds, bordereauMandatsRecetteCreated);

    // Seeding chapitres recettes (Nature des recettes avec Autres par défaut)
    console.log('🌱 Seeding chapitres recettes (Nature des recettes)...');
    await seedChapitresRecette();

    // Seeding états financiers mensuels recettes
    console.log('🌱 Seeding états financiers mensuels recettes...');
    const chapitresRecetteList = await db.chapitresRecette.toArray();
    const chapitreRecetteIds = chapitresRecetteList.map((c) => c.id!);
    await seedEtatFinancierMensuelRecette(taxeIds, chapitreRecetteIds);

    // =================================================================
    // APP7 - GESTION DES EMPLOYÉS SEEDERS
    // =================================================================
    console.log('🌱 Seeding employés, fiches de paie et congés...');
    const employesCreated = await seedEmployes();
    const employeIds = employesCreated.map((e) => e.id);
    await seedFichesPaie(employeIds);
    await seedCongesApp7(employeIds);
    await seedOrdresMissionApp7(employeIds);

    console.log('\n✨ All test data seeders have been executed successfully!');
  } catch (error) {
    console.error('❌ Error during test data seeding:', error);
    throw error;
  }
}

export async function seedReferenceProjects() {
  console.log('🚀 Seeding projets de référence du compte administratif...');

  const sousChapitres = await db.sousChapitres.toArray();
  const projetsExistants = await db.projets.toArray();
  const sousChapitreByCode = new Map(sousChapitres.map((item) => [item.code, item.id!]));
  const existingKeys = new Set(
    projetsExistants.map((projet) => `${projet.annee}::${projet.libelle.toLowerCase()}`),
  );

  const now = new Date();
  const projetsToCreate: Omit<Projet, 'id'>[] = [];
  const missingCodes = new Set<string>();
  let skipped = 0;

  for (const item of REFERENCE_PROJETS) {
    const key = `${CURRENT_YEAR}::${item.libelle.toLowerCase()}`;
    if (existingKeys.has(key)) {
      skipped += 1;
      continue;
    }

    const sousChapitreId = sousChapitreByCode.get(item.compteCode);
    if (!sousChapitreId) {
      missingCodes.add(item.compteCode);
    }

    const observations = !sousChapitreId
      ? `Projet de test créé via seeder. Compte fonctionnel source introuvable: ${item.compteCode}`
      : 'Projet de test créé via seeder.';

    projetsToCreate.push({
      libelle: item.libelle,
      ...(sousChapitreId ? { sousChapitreId } : {}),
      patrimoine: item.patrimoine,
      montant: item.montant,
      realise: item.realise,
      annee: CURRENT_YEAR,
      typeBien: item.typeBien,
      statut: getProjetStatut(item.montant, item.realise),
      observations,
      mairieId: DEFAULT_MAIRIE_ID,
      personnelId: 1,
      createdAt: now,
      updatedAt: now,
    });
  }

  if (projetsToCreate.length > 0) {
    await db.projets.bulkAdd(projetsToCreate);
  }

  if (missingCodes.size > 0) {
    console.log(
      `⚠️ Comptes fonctionnels introuvables dans le référentiel local: ${Array.from(missingCodes).join(', ')}`,
    );
  }

  console.log(`✅ ${projetsToCreate.length} projets de référence créés, ${skipped} déjà présents.`);
}

// =================================================================
//                  APP7 - SEEDER FUNCTIONS
// =================================================================

async function seedEmployes(): Promise<(Employe & { id: number })[]> {
  const mairieId = DEFAULT_MAIRIE_ID;
  const employes: Omit<Employe, 'id'>[] = [
    {
      matricule: 'EMP001',
      nom: 'KONSEIGA',
      prenom: 'Georges Ulrich',
      sexe: 'M',
      typeEmploye: 'Salariés (6000/2)',
      poste: 'Secrétaire Général',
      grade: 'A1',
      service: 'Direction Générale',
      dateEmbauche: new Date('2015-01-15'),
      salaireBase: 105345,
      indemniteLogement: 15802,
      indemniteTransport: 22000,
      autresIndemnites: 0,
      numeroCNPS: 'CNPS001235',
      mairieId,
      actif: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      matricule: 'EMP002',
      nom: 'TOURE',
      prenom: 'Mory',
      sexe: 'M',
      typeEmploye: 'Salariés (6000/2)',
      poste: 'Comptable',
      grade: 'B2',
      service: 'Finance',
      dateEmbauche: new Date('2017-06-01'),
      salaireBase: 105345,
      indemniteLogement: 15802,
      indemniteTransport: 22000,
      autresIndemnites: 0,
      numeroCNPS: 'CNPS001236',
      mairieId,
      actif: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      matricule: 'EMP003',
      nom: 'SIDIBE',
      prenom: 'Dramane',
      sexe: 'M',
      typeEmploye: 'Contractuels (60012/2)',
      poste: 'Agent Administratif',
      grade: 'C1',
      service: 'Administration',
      dateEmbauche: new Date('2019-03-01'),
      salaireBase: 83520,
      indemniteLogement: 12528,
      indemniteTransport: 22000,
      autresIndemnites: 0,
      numeroCNPS: 'CNPS001237',
      mairieId,
      actif: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      matricule: 'EMP004',
      nom: 'KONE',
      prenom: 'Korotoum',
      sexe: 'F',
      typeEmploye: 'Salariés (6000/2)',
      poste: 'Technicienne',
      grade: 'B1',
      service: 'Technique',
      dateEmbauche: new Date('2018-09-01'),
      salaireBase: 89009,
      indemniteLogement: 13351,
      indemniteTransport: 22000,
      autresIndemnites: 0,
      numeroCNPS: 'CNPS001238',
      mairieId,
      actif: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      matricule: 'EMP005',
      nom: 'TOH TAPE',
      prenom: 'Edmond',
      sexe: 'M',
      typeEmploye: 'Contractuels (60012/2)',
      poste: 'Chauffeur',
      grade: 'D1',
      service: 'Logistique',
      dateEmbauche: new Date('2016-04-01'),
      salaireBase: 105345,
      indemniteLogement: 15802,
      indemniteTransport: 22000,
      autresIndemnites: 0,
      numeroCNPS: 'CNPS001239',
      mairieId,
      actif: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      matricule: 'EMP006',
      nom: 'SILUE',
      prenom: 'Guébessôngui Léon',
      sexe: 'M',
      typeEmploye: 'Contractuels (60012/2)',
      poste: 'Agent de Sécurité',
      grade: 'D2',
      service: 'Sécurité',
      dateEmbauche: new Date('2020-01-15'),
      salaireBase: 81649,
      indemniteLogement: 12247,
      indemniteTransport: 22000,
      autresIndemnites: 0,
      numeroCNPS: 'CNPS001240',
      mairieId,
      actif: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      matricule: 'EMP007',
      nom: 'FOFANA',
      prenom: 'Abou',
      sexe: 'M',
      typeEmploye: "Agents de l'État (6002/2)",
      poste: 'Technicien',
      grade: 'C2',
      service: 'Technique',
      dateEmbauche: new Date('2021-05-01'),
      salaireBase: 79779,
      indemniteLogement: 11967,
      indemniteTransport: 22000,
      autresIndemnites: 0,
      numeroCNPS: 'CNPS001241',
      mairieId,
      actif: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      matricule: 'EMP008',
      nom: 'GBAHA',
      prenom: 'Hermann Bertrand',
      sexe: 'M',
      typeEmploye: 'Maire et Adjoints (6010/2)',
      poste: "Agent d'accueil",
      grade: 'D1',
      service: 'Accueil',
      dateEmbauche: new Date('2022-02-01'),
      salaireBase: 76038,
      indemniteLogement: 11406,
      indemniteTransport: 22000,
      autresIndemnites: 0,
      numeroCNPS: 'CNPS001242',
      mairieId,
      actif: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      matricule: 'EMP009',
      nom: 'OUATTARA',
      prenom: 'Seydou',
      sexe: 'M',
      typeEmploye: 'Salariés (6000/2)',
      poste: 'Chef de Service RH',
      grade: 'A2',
      service: 'Ressources Humaines',
      dateEmbauche: new Date('2016-03-15'),
      salaireBase: 98500,
      indemniteLogement: 14775,
      indemniteTransport: 22000,
      autresIndemnites: 5000,
      numeroCNPS: 'CNPS001243',
      mairieId,
      actif: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      matricule: 'EMP010',
      nom: 'COULIBALY',
      prenom: 'Aminata',
      sexe: 'F',
      typeEmploye: 'Salariés (6000/2)',
      poste: 'Responsable Budget',
      grade: 'A2',
      service: 'Finance',
      dateEmbauche: new Date('2017-09-01'),
      salaireBase: 95200,
      indemniteLogement: 14280,
      indemniteTransport: 22000,
      autresIndemnites: 0,
      numeroCNPS: 'CNPS001244',
      mairieId,
      actif: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      matricule: 'EMP011',
      nom: 'DIALLO',
      prenom: 'Mamadou',
      sexe: 'M',
      typeEmploye: 'Contractuels (60012/2)',
      poste: 'Jardinier',
      grade: 'D2',
      service: 'Logistique',
      dateEmbauche: new Date('2020-06-01'),
      salaireBase: 72000,
      indemniteLogement: 10800,
      indemniteTransport: 22000,
      autresIndemnites: 0,
      numeroCNPS: 'CNPS001245',
      mairieId,
      actif: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      matricule: 'EMP012',
      nom: 'BAMBA',
      prenom: 'Fatoumata',
      sexe: 'F',
      typeEmploye: 'Contractuels (60012/2)',
      poste: 'Secrétaire',
      grade: 'C2',
      service: 'Direction Générale',
      dateEmbauche: new Date('2019-11-01'),
      salaireBase: 78000,
      indemniteLogement: 11700,
      indemniteTransport: 22000,
      autresIndemnites: 0,
      numeroCNPS: 'CNPS001246',
      mairieId,
      actif: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      matricule: 'EMP013',
      nom: 'YAO',
      prenom: 'Kouadio Jean',
      sexe: 'M',
      typeEmploye: "Agents de l'État (6002/2)",
      poste: 'Ingénieur Génie Civil',
      grade: 'A1',
      service: 'Technique',
      dateEmbauche: new Date('2018-01-15'),
      salaireBase: 110000,
      indemniteLogement: 16500,
      indemniteTransport: 22000,
      autresIndemnites: 8000,
      numeroCNPS: 'CNPS001247',
      mairieId,
      actif: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      matricule: 'EMP014',
      nom: 'KONAN',
      prenom: 'Aya Simone',
      sexe: 'F',
      typeEmploye: 'Salariés (6000/2)',
      poste: 'Assistante Comptable',
      grade: 'B2',
      service: 'Finance',
      dateEmbauche: new Date('2021-02-01'),
      salaireBase: 85000,
      indemniteLogement: 12750,
      indemniteTransport: 22000,
      autresIndemnites: 0,
      numeroCNPS: 'CNPS001248',
      mairieId,
      actif: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      matricule: 'EMP015',
      nom: 'TRAORE',
      prenom: 'Ibrahim',
      sexe: 'M',
      typeEmploye: 'Contractuels (60012/2)',
      poste: 'Plombier',
      grade: 'D1',
      service: 'Technique',
      dateEmbauche: new Date('2020-08-01'),
      salaireBase: 75000,
      indemniteLogement: 11250,
      indemniteTransport: 22000,
      autresIndemnites: 0,
      numeroCNPS: 'CNPS001249',
      mairieId,
      actif: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      matricule: 'EMP016',
      nom: 'GNAGNE',
      prenom: 'Marie-Claire',
      sexe: 'F',
      typeEmploye: 'Maire et Adjoints (6010/2)',
      poste: 'Adjointe au Maire',
      grade: 'A1',
      service: 'Direction Générale',
      dateEmbauche: new Date('2023-01-01'),
      salaireBase: 120000,
      indemniteLogement: 18000,
      indemniteTransport: 22000,
      autresIndemnites: 15000,
      numeroCNPS: 'CNPS001250',
      mairieId,
      actif: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      matricule: 'EMP017',
      nom: 'DEMBELE',
      prenom: 'Lacina',
      sexe: 'M',
      typeEmploye: "Agents de l'État (6002/2)",
      poste: 'Archiviste',
      grade: 'C1',
      service: 'Administration',
      dateEmbauche: new Date('2019-07-01'),
      salaireBase: 82000,
      indemniteLogement: 12300,
      indemniteTransport: 22000,
      autresIndemnites: 0,
      numeroCNPS: 'CNPS001251',
      mairieId,
      actif: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      matricule: 'EMP018',
      nom: 'AKOU',
      prenom: "N'Guessan Patricia",
      sexe: 'F',
      typeEmploye: 'Salariés (6000/2)',
      poste: 'Responsable État Civil',
      grade: 'B1',
      service: 'Administration',
      dateEmbauche: new Date('2018-04-01'),
      salaireBase: 91000,
      indemniteLogement: 13650,
      indemniteTransport: 22000,
      autresIndemnites: 3000,
      numeroCNPS: 'CNPS001252',
      mairieId,
      actif: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      matricule: 'EMP019',
      nom: 'SORO',
      prenom: 'Youssouf',
      sexe: 'M',
      typeEmploye: 'Contractuels (60012/2)',
      poste: 'Électricien',
      grade: 'D1',
      service: 'Technique',
      dateEmbauche: new Date('2021-10-01'),
      salaireBase: 77500,
      indemniteLogement: 11625,
      indemniteTransport: 22000,
      autresIndemnites: 0,
      numeroCNPS: 'CNPS001253',
      mairieId,
      actif: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      matricule: 'EMP020',
      nom: 'KOUAME',
      prenom: 'Affoué Rachelle',
      sexe: 'F',
      typeEmploye: 'Salariés (6000/2)',
      poste: 'Informaticienne',
      grade: 'B1',
      service: 'Administration',
      dateEmbauche: new Date('2022-03-01'),
      salaireBase: 93000,
      indemniteLogement: 13950,
      indemniteTransport: 22000,
      autresIndemnites: 5000,
      numeroCNPS: 'CNPS001254',
      mairieId,
      actif: true,
      createdAt: now,
      updatedAt: now,
    },
  ];

  await db.employes.bulkAdd(employes);
  const created = await db.employes.toArray();
  console.log(`✅ ${created.length} employés seedés.`);
  return created as (Employe & { id: number })[];
}

async function seedFichesPaie(employeIds: number[]) {
  const mairieId = DEFAULT_MAIRIE_ID;
  const fiches: Omit<FichePaie, 'id'>[] = [];

  // Générer des fiches pour les 12 derniers mois
  const today = new Date();
  for (let m = 0; m < 12; m++) {
    const d = new Date(today.getFullYear(), today.getMonth() - m, 1);
    const mois = d.getMonth() + 1;
    const annee = d.getFullYear();

    for (const empId of employeIds) {
      const emp = await db.employes.get(empId);
      if (!emp) continue;

      const salaireBase = emp.salaireBase;
      const indemniteLogement = emp.indemniteLogement ?? 0;
      const indemniteTransport = emp.indemniteTransport ?? 0;
      const autresIndemnites = emp.autresIndemnites ?? 0;
      const montantBrut = salaireBase + indemniteLogement;
      const cotisationCNPS = Math.round(montantBrut * 0.063);
      const impotSurSalaire = Math.round(montantBrut * 0.016);
      const autresRetenues = 0;
      const montantNet =
        montantBrut - cotisationCNPS - impotSurSalaire + indemniteTransport + autresIndemnites;

      fiches.push({
        employeId: empId,
        mois,
        annee,
        exercice: annee,
        mairieId,
        salaireBase,
        indemniteLogement,
        indemniteTransport,
        autresIndemnites,
        montantBrut,
        cotisationCNPS,
        impotSurSalaire,
        autresRetenues,
        montantNet,
        statut: 'valide',
        personnelId: 1,
        createdAt: now,
        updatedAt: now,
      });
    }
  }

  await db.fichesPaie.bulkAdd(fiches);
  console.log(`✅ ${fiches.length} fiches de paie seedées.`);
}

async function seedCongesApp7(employeIds: number[]) {
  const mairieId = DEFAULT_MAIRIE_ID;
  const types: Array<'annuel' | 'maladie' | 'maternite' | 'circonstance' | 'autre'> = [
    'annuel',
    'maladie',
    'annuel',
    'circonstance',
    'annuel',
  ];
  const statuts: Array<'demande' | 'approuve' | 'refuse' | 'annule'> = [
    'approuve',
    'approuve',
    'demande',
    'refuse',
    'annule',
  ];
  const conges = employeIds.slice(0, 5).map((empId, i) => ({
    employeId: empId,
    mairieId,
    type: types[i]!,
    dateDebut: new Date(CURRENT_YEAR, i, 5),
    dateFin: new Date(CURRENT_YEAR, i, 12 + i),
    nombreJours: 7 + i,
    motif: 'Congé de routine',
    statut: statuts[i]!,
    personnelId: 1,
    createdAt: now,
    updatedAt: now,
  }));
  await db.conges.bulkAdd(conges);
  console.log(`✅ ${conges.length} congés seedés.`);
}

async function seedOrdresMissionApp7(employeIds: number[]) {
  const mairieId = DEFAULT_MAIRIE_ID;
  const destinations = ['Abidjan', 'Bouaké', 'Yamoussoukro', 'Daloa', 'San Pédro'];
  const objets = [
    'Réunion mensuelle DGDDL',
    'Formation sur les finances locales',
    'Conférence des maires',
    'Atelier budgétaire',
    'Séminaire de gestion',
  ];
  const missions = employeIds.slice(0, 5).map((empId, i) => ({
    numero: `OM/${CURRENT_YEAR}/${String(i + 1).padStart(3, '0')}`,
    employeId: empId,
    mairieId,
    exercice: CURRENT_YEAR,
    objet: objets[i]!,
    destination: destinations[i]!,
    dateDebut: new Date(CURRENT_YEAR, i, 10),
    dateFin: new Date(CURRENT_YEAR, i, 12 + i),
    nombreJours: 2 + i,
    indemniteJournaliere: 25000,
    fraisTransport: 15000,
    montantTotal: (2 + i) * 25000 + 15000,
    statut: i < 2 ? ('paye' as const) : i < 4 ? ('valide' as const) : ('brouillon' as const),
    personnelId: 1,
    createdAt: now,
    updatedAt: now,
  }));
  await db.ordresMission.bulkAdd(missions);
  console.log(`✅ ${missions.length} ordres de mission seedés.`);
}

// =================================================================
//                      FONCTIONS UTILITAIRES
// =================================================================

/**
 * Supprime toutes les données de toutes les tables.
 */
export async function clearDatabase() {
  console.log('🗑️ Clearing all database tables...');

  try {
    await db.mandats.clear();
    await db.bordereauMandats.clear();
    await db.previsions.clear();
    await db.sousChapitres.clear();
    await db.chapitres.clear();
    await db.etatFinancierMensuel.clear();

    // App6
    await db.taxes.clear();
    await db.declarations.clear();
    await db.bordereauxRecette.clear();
    await db.previsionsRecettes.clear();
    await db.mandatsRecette.clear();
    await db.bordereauMandatsRecette.clear();
    await db.chapitresRecette.clear();
    await db.etatFinancierMensuelRecette.clear();

    // Tables supplémentaires
    await db.exercices.clear();
    await db
      .table('printData')
      .clear()
      .catch(() => {});

    await db.utilisateurs.clear();
    await db.mairies.clear();

    // Tables app7 - Gestion des Employés
    await db.employes.clear();
    await db.fichesPaie.clear();
    await db.conges.clear();
    await db.ordresMission.clear();

    // Empecher le auto-seed au prochain chargement
    localStorage.setItem('sigobc_db_cleared', 'true');

    console.log('✅ All tables cleared successfully.');
  } catch (error) {
    console.error('❌ Error clearing database:', error);
    throw error;
  }
}

// =================================================================
//           MISE À JOUR DES PRÉVISIONS DEPUIS LES MANDATS
// =================================================================

/**
 * Recalcule montantEngage et montantDisponible des prévisions
 * à partir des mandats payés réellement enregistrés.
 */
async function updatePrevisionsFromMandats() {
  const previsions = await db.previsions.toArray();
  const mandats = await db.mandats.filter((m) => m.statut === 'paye').toArray();

  // Calculer le montant engagé par couple (exercice, chapitreId, sousChapitreId)
  const engageMap = new Map<string, number>();
  for (const m of mandats) {
    const key = `${m.exercice}-${m.chapitreId}-${m.sousChapitreId}`;
    engageMap.set(key, (engageMap.get(key) || 0) + m.montant);
  }

  let updated = 0;
  for (const prev of previsions) {
    const key = `${prev.exercice}-${prev.chapitreId}-${prev.sousChapitreId || 0}`;
    const engage = engageMap.get(key) || 0;
    if (engage > 0) {
      await db.previsions.update(prev.id, {
        montantEngage: engage,
        montantDisponible: Math.max(0, prev.montantPrevu - engage),
      });
      updated++;
    }
  }

  console.log(`✅ ${updated} prévisions mises à jour avec les montants engagés réels`);
}

// =================================================================
//           SEEDERS POUR CHAPITRES RECETTES (Nature des recettes)
// =================================================================

/**
 * Seed les chapitres recettes (Nature des recettes) pour App6
 * Inclut un chapitre par défaut "Autres"
 */
async function seedChapitresRecette() {
  const chapitresRecette: Omit<ChapitreRecette, 'id'>[] = [
    {
      code: '1',
      libelle: 'RECETTES FISCALES',
      description: 'Impôts et taxes fiscales',
      mairieId: DEFAULT_MAIRIE_ID,
      actif: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      code: '2',
      libelle: 'PRESTATIONS ET SERVICES',
      description: 'Recettes des prestations et services communaux',
      mairieId: DEFAULT_MAIRIE_ID,
      actif: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      code: '3',
      libelle: 'REVENUS DU PATRIMOINE',
      description: 'Revenus du patrimoine immobilier et mobilier',
      mairieId: DEFAULT_MAIRIE_ID,
      actif: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      code: '4',
      libelle: "AIDE DE L'ÉTAT",
      description: "Dotations et subventions de l'État",
      mairieId: DEFAULT_MAIRIE_ID,
      actif: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      code: '5',
      libelle: 'FONDS DE CONCOURS',
      description: 'Participations et fonds de concours',
      mairieId: DEFAULT_MAIRIE_ID,
      actif: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      code: '6',
      libelle: 'EMPRUNTS ET DETTES',
      description: 'Produits des emprunts et dettes',
      mairieId: DEFAULT_MAIRIE_ID,
      actif: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      code: '7',
      libelle: 'RECETTES EXCEPTIONNELLES',
      description: 'Recettes exceptionnelles et extraordinaires',
      mairieId: DEFAULT_MAIRIE_ID,
      actif: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      code: '99',
      libelle: 'Autres',
      description: 'Autres recettes non classifiées',
      mairieId: DEFAULT_MAIRIE_ID,
      actif: true,
      createdAt: now,
      updatedAt: now,
    },
  ];

  await db.chapitresRecette.bulkAdd(chapitresRecette);
  console.log(`✅ ${chapitresRecette.length} chapitres recettes créés (dont "Autres" par défaut)`);
}

// =================================================================
//           SEEDERS POUR ÉTATS FINANCIERS MENSUELS RECETTES
// =================================================================

/**
 * Seed les états financiers mensuels pour les recettes (App6)
 * Calcule les états à partir des déclarations existantes (comme les mandats impactent les états des dépenses)
 */
async function seedEtatFinancierMensuelRecette(taxeIds: number[], chapitreRecetteIds: number[]) {
  const etats: Omit<EtatFinancierMensuelRecette, 'id'>[] = [];

  const taxes = await db.taxes.toArray();
  const chapitresRecette = await db.chapitresRecette.toArray();
  const declarations = await db.declarations.filter((d) => d.exercice === CURRENT_YEAR).toArray();
  const mandatsRecette = await db.mandatsRecette
    .filter((m) => m.exercice === CURRENT_YEAR)
    .toArray();

  // Filtrer les taxes App6 fonctionnelles (codes >= 7000)
  const app6Taxes = taxes.filter((t) => {
    if (!t.code.startsWith('7')) return false;
    const codeNum = parseInt(t.code, 10);
    return !isNaN(codeNum) && codeNum >= 7000;
  });

  // Calculer les recettes par taxe et par mois à partir des déclarations ET mandats
  const recettesByTaxe: Map<number, number[]> = new Map();

  // Ajouter les déclarations
  for (const decl of declarations) {
    if (!decl.taxeId) continue;

    // Initialiser le tableau des recettes mensuelles si nécessaire
    if (!recettesByTaxe.has(decl.taxeId)) {
      recettesByTaxe.set(decl.taxeId, Array(12).fill(0));
    }

    // Déterminer le mois de la déclaration
    const dateDecl = decl.dateEncaissement || decl.dateDeclaration;
    if (!dateDecl) continue;

    const moisIndex = new Date(dateDecl).getMonth();
    const montant = decl.montantRecette || decl.montant || 0;

    const monthlyRecettes = recettesByTaxe.get(decl.taxeId)!;
    monthlyRecettes[moisIndex] = (monthlyRecettes[moisIndex] || 0) + montant;
  }

  // Ajouter les mandats de recettes
  for (const mandat of mandatsRecette) {
    if (!mandat.taxeId) continue;

    // Initialiser le tableau des recettes mensuelles si nécessaire
    if (!recettesByTaxe.has(mandat.taxeId)) {
      recettesByTaxe.set(mandat.taxeId, Array(12).fill(0));
    }

    // Déterminer le mois du mandat
    const dateMandat = mandat.dateMandat;
    if (!dateMandat) continue;

    const moisIndex = new Date(dateMandat).getMonth();
    const montant = mandat.montant || 0;

    const monthlyRecettes = recettesByTaxe.get(mandat.taxeId)!;
    monthlyRecettes[moisIndex] = (monthlyRecettes[moisIndex] || 0) + montant;
  }

  // Créer un état par taxe (basé sur les déclarations) pour chaque chapitreRecette
  for (const taxeId of taxeIds) {
    const taxe = app6Taxes.find((t) => t.id === taxeId);
    if (!taxe) continue;

    // Récupérer les recettes mensuelles pour cette taxe (ou tableau vide si pas de déclarations)
    const monthlyRecettes = recettesByTaxe.get(taxeId) || Array(12).fill(0);

    // Calculer les antécédents (cumul des mois précédents)
    const antecedents: number[] = [];
    let cumul = 0;
    for (let m = 0; m < 12; m++) {
      antecedents[m] = cumul;
      cumul += monthlyRecettes[m] || 0;
    }

    // Créer un état pour le premier chapitreRecette (ou associer à "Autres" si pas de correspondance)
    const chapitreRecetteId =
      chapitreRecetteIds.length > 0
        ? chapitreRecetteIds[0] // Utiliser le premier chapitre par défaut
        : null;

    if (!chapitreRecetteId) continue;

    const chapitreRecette = chapitresRecette.find((c) => c.id === chapitreRecetteId);
    if (!chapitreRecette) continue;

    etats.push({
      annee: CURRENT_YEAR,
      taxeId,
      chapitreRecetteId,
      taxeCode: taxe.code,
      chapitreRecetteCode: chapitreRecette.code,
      mairieId: DEFAULT_MAIRIE_ID,
      ant1: antecedents[0] || 0,
      ant2: antecedents[1] || 0,
      ant3: antecedents[2] || 0,
      ant4: antecedents[3] || 0,
      ant5: antecedents[4] || 0,
      ant6: antecedents[5] || 0,
      ant7: antecedents[6] || 0,
      ant8: antecedents[7] || 0,
      ant9: antecedents[8] || 0,
      ant10: antecedents[9] || 0,
      ant11: antecedents[10] || 0,
      ant12: antecedents[11] || 0,
      rec1: monthlyRecettes[0] || 0,
      rec2: monthlyRecettes[1] || 0,
      rec3: monthlyRecettes[2] || 0,
      rec4: monthlyRecettes[3] || 0,
      rec5: monthlyRecettes[4] || 0,
      rec6: monthlyRecettes[5] || 0,
      rec7: monthlyRecettes[6] || 0,
      rec8: monthlyRecettes[7] || 0,
      rec9: monthlyRecettes[8] || 0,
      rec10: monthlyRecettes[9] || 0,
      rec11: monthlyRecettes[10] || 0,
      rec12: monthlyRecettes[11] || 0,
      createdAt: now,
      updatedAt: now,
    });
  }

  await db.etatFinancierMensuelRecette.bulkAdd(etats);
  console.log(
    `✅ ${etats.length} états financiers mensuels recettes créés pour ${CURRENT_YEAR} (calculés à partir des déclarations)`,
  );
}

// =================================================================
//                      FONCTIONS DE GÉNÉRATION
// =================================================================

async function seedBordereauxRecettes(personnelIds: number[]) {
  const bordereaux: Partial<BordereauRecette>[] = [];

  // Générer 8 bordereaux validés pour les derniers mois de l'année précédente (pour avoir des données dans le passé)
  for (let i = 1; i <= 8; i++) {
    // Alterner entre Novembre et Décembre
    const mois = i <= 4 ? 10 : 11; // 10 = Novembre, 11 = Décembre
    const jour = randomAmount(1, 28);
    const dateEmission = new Date(CURRENT_YEAR - 1, mois, jour);

    bordereaux.push({
      numero: i,
      annee: CURRENT_YEAR - 1,
      mairieId: DEFAULT_MAIRIE_ID,
      montantTotal: 0, // Sera mis à jour après
      nombreDeclarations: 0,
      statut: 'ferme',
      personnelId: randomChoice(personnelIds),
      createdAt: dateEmission,
      updatedAt: now,
      dateTransmission: new Date(CURRENT_YEAR - 1, mois, jour + 5),
    });
  }

  // Générer 6 bordereaux pour l'année courante (Janvier à Février)
  for (let i = 9; i <= 14; i++) {
    const mois = i <= 11 ? 0 : 1; // Janvier et Février
    const jour = randomAmount(1, 28);
    const dateEmission = new Date(CURRENT_YEAR, mois, jour);

    bordereaux.push({
      numero: i,
      annee: CURRENT_YEAR,
      mairieId: DEFAULT_MAIRIE_ID,
      montantTotal: 0,
      nombreDeclarations: 0,
      statut: randomChoice(['ouvert', 'ferme']),
      personnelId: randomChoice(personnelIds),
      createdAt: dateEmission,
      updatedAt: now,
    });
  }

  await db.bordereauxRecette.bulkAdd(bordereaux as BordereauRecette[]);
  console.log(
    `✅ ${bordereaux.length} bordereaux de recettes créés (${CURRENT_YEAR - 1} + ${CURRENT_YEAR})`,
  );

  return await db.bordereauxRecette.toArray();
}

async function seedPrevisionsRecettes(personnelIds: number[]) {
  const taxes = await db.taxes.toArray();
  const previsions: Omit<PrevisionRecette, 'id'>[] = [];

  // Prévisions pour l'année courante (2026)
  for (const taxe of taxes) {
    if (!taxe.id) continue;

    const montantPrevu = randomAmount(100000, 5000000);
    const montantRealise = 0; // Pas encore réalisé pour l'année courante

    previsions.push({
      exercice: CURRENT_YEAR,
      taxeId: taxe.id,
      mairieId: DEFAULT_MAIRIE_ID,
      montantPrevu,
      montantRealise,
      statut: 'validee',
      personnelId: randomChoice(personnelIds),
      createdAt: new Date(CURRENT_YEAR - 1, 11, 15),
      updatedAt: now,
    });
  }

  console.log(`✅ ${previsions.length} prévisions de recettes créées pour ${CURRENT_YEAR}`);

  // Prévisions pour l'année précédente (2025) - avec des données réalisées
  for (const taxe of taxes) {
    if (!taxe.id) continue;

    const montantPrevu = randomAmount(100000, 5000000);
    const montantRealise = Math.round(montantPrevu * (randomAmount(70, 120) / 100));

    previsions.push({
      exercice: CURRENT_YEAR - 1,
      taxeId: taxe.id,
      mairieId: DEFAULT_MAIRIE_ID,
      montantPrevu,
      montantRealise,
      statut: 'validee',
      personnelId: randomChoice(personnelIds),
      createdAt: new Date(CURRENT_YEAR - 2, 11, 15),
      updatedAt: now,
    });
  }

  await db.previsionsRecettes.bulkAdd(previsions);
  console.log(
    `✅ ${previsions.length} prévisions de recettes créées au total (${CURRENT_YEAR} + ${CURRENT_YEAR - 1})`,
  );
}

async function seedDeclarations(personnelIds: number[], bordereaux: BordereauRecette[]) {
  const taxes = await db.taxes.toArray();

  // Filtrer les taxes App6 fonctionnelles avec codes >= 7000
  // Exclure les sections/chapitres (70, 700, 71, 710, etc.) et les taxes d'investissement (0x)
  const app6Taxes = taxes.filter((t) => {
    if (!t.code.startsWith('7')) return false;
    const codeNum = parseInt(t.code, 10);
    return !isNaN(codeNum) && codeNum >= 7000;
  });

  if (app6Taxes.length === 0) {
    console.warn('⚠️ Aucune taxe App6 trouvée, skip des déclarations');
    return;
  }

  const declarations: Partial<Declaration>[] = [];
  const contribuables = [
    'ENTREPRISE BTP KOUASSI',
    'PHARMACIE DE LA PAIX',
    'SUPERMARCHÉ BON PRIX',
    'BOULANGERIE MODERNE',
    'STATION SERVICE TOTAL',
    'MAQUIS LE ZOUGLOU',
    'HOTEL LES PALMIERS',
    'TRANSPORT KONE & FRÈRES',
    'GARAGE AUTO PREMIER',
    'RESTAURANT LE GOURMET',
    'QUINCAILLERIE CENTRALE',
    'LIBRAIRIE PAPETERIE PLUS',
  ];

  let numeroPiece = 1000;
  const bordereauMontants: Map<number, { total: number; count: number }> = new Map();

  // Séparer bordereaux par année
  const bordereauxPrevYear = bordereaux.filter((b) => b.annee === CURRENT_YEAR - 1);
  const bordereauxCurrYear = bordereaux.filter((b) => b.annee === CURRENT_YEAR);

  // Pour chaque taxe, créer 2 ou 3 déclarations validées pour l'année précédente
  for (const taxe of app6Taxes) {
    if (!taxe.id) continue;

    const nombreDecls = randomAmount(2, 3);

    for (let i = 0; i < nombreDecls; i++) {
      const bordereau =
        bordereauxPrevYear.length > 0 ? randomChoice(bordereauxPrevYear) : randomChoice(bordereaux);
      if (!bordereau || !bordereau.id) continue;

      const montant = taxe.montant || randomAmount(5000, 500000);

      const mois = randomChoice([10, 11]);
      const jour = randomAmount(1, 28);
      const d = new Date(CURRENT_YEAR - 1, mois, jour);

      declarations.push({
        exercice: CURRENT_YEAR - 1,
        numeroPiece: `P-${numeroPiece++}`,
        dateDeclaration: d,
        dateEncaissement: d,
        bordereauId: bordereau.id,
        taxeId: taxe.id,
        mairieId: DEFAULT_MAIRIE_ID,
        contribuable: randomChoice(contribuables),
        nomPartieVersante: randomChoice([
          'Le Gérant',
          'Le Comptable',
          'Le Directeur',
          'Le Propriétaire',
        ]),
        adresse: randomChoice([
          "Abidjan, Côte d'Ivoire",
          'Bouaké, CI',
          'Yamoussoukro, CI',
          'Korhogo, CI',
        ]),
        montant: montant,
        montantRecette: montant,
        modePaiement: randomChoice(['especes', 'cheque', 'virement', 'autre']),
        statut: 'validee',
        personnelId: randomChoice(personnelIds),
        createdAt: d,
        updatedAt: now,
      });

      const existing = bordereauMontants.get(bordereau.id) || { total: 0, count: 0 };
      bordereauMontants.set(bordereau.id, {
        total: existing.total + montant,
        count: existing.count + 1,
      });
    }
  }

  // Pour chaque taxe, créer 1 ou 2 déclarations pour l'année courante (Janvier-Février)
  for (const taxe of app6Taxes) {
    if (!taxe.id) continue;

    const nombreDecls = randomAmount(1, 2);

    for (let i = 0; i < nombreDecls; i++) {
      const bordereau =
        bordereauxCurrYear.length > 0 ? randomChoice(bordereauxCurrYear) : randomChoice(bordereaux);
      if (!bordereau || !bordereau.id) continue;

      const montant = taxe.montant || randomAmount(5000, 500000);

      const mois = randomChoice([0, 1]); // Janvier, Février
      const jour = randomAmount(1, 28);
      const d = new Date(CURRENT_YEAR, mois, jour);

      declarations.push({
        exercice: CURRENT_YEAR,
        numeroPiece: `P-${numeroPiece++}`,
        dateDeclaration: d,
        dateEncaissement: d,
        bordereauId: bordereau.id,
        taxeId: taxe.id,
        mairieId: DEFAULT_MAIRIE_ID,
        contribuable: randomChoice(contribuables),
        nomPartieVersante: randomChoice([
          'Le Gérant',
          'Le Comptable',
          'Le Directeur',
          'Le Propriétaire',
        ]),
        adresse: randomChoice([
          "Abidjan, Côte d'Ivoire",
          'Bouaké, CI',
          'Yamoussoukro, CI',
          'Korhogo, CI',
        ]),
        montant: montant,
        montantRecette: montant,
        modePaiement: randomChoice(['especes', 'cheque', 'virement', 'autre']),
        statut: randomChoice(['brouillon', 'validee', 'validee']),
        personnelId: randomChoice(personnelIds),
        createdAt: d,
        updatedAt: now,
      });

      const existing = bordereauMontants.get(bordereau.id) || { total: 0, count: 0 };
      bordereauMontants.set(bordereau.id, {
        total: existing.total + montant,
        count: existing.count + 1,
      });
    }
  }

  // Mettre à jour chaque bordereau avec ses totaux
  for (const [bordereauId, data] of bordereauMontants.entries()) {
    await db.bordereauxRecette.update(bordereauId, {
      montantTotal: data.total,
      nombreDeclarations: data.count,
    });
  }

  await db.declarations.bulkAdd(declarations as Declaration[]);
  console.log(`✅ ${declarations.length} déclarations de recettes créées (2-3 par taxe, validées)`);
}

async function seedPrevisions(
  chapitreIds: number[],
  personnelIds: number[],
  sousChapitreIds: number[] = [],
) {
  const previsions: Partial<Prevision>[] = [];

  // Année courante: créer une prévision pour CHAQUE combinaison sous-chapitre/chapitre
  console.log(
    `🌱 Creating previsions ${CURRENT_YEAR} for all sous-chapitres with all 8 chapitres...`,
  );

  for (const sousChapitreId of sousChapitreIds) {
    for (const chapitreId of chapitreIds) {
      const montantPrevu = randomAmount(500000, 15000000);
      const montantEngage = 0;
      const montantDisponible = montantPrevu;

      const prevision: Partial<Prevision> = {
        exercice: CURRENT_YEAR,
        chapitreId,
        sousChapitreId,
        mairieId: DEFAULT_MAIRIE_ID,
        montantPrevu,
        montantEngage,
        montantDisponible,
        statut: 'validee',
        personnelId: randomChoice(personnelIds),
        createdAt: new Date(CURRENT_YEAR - 1, 11, 15),
        updatedAt: now,
      };

      previsions.push(prevision);
    }
  }

  const previsionsCurrentYearCount = previsions.length;
  console.log(
    `📊 ${previsionsCurrentYearCount} prévisions ${CURRENT_YEAR} créées (${sousChapitreIds.length} sous-chapitres x ${chapitreIds.length} chapitres)`,
  );

  // Créer UNE prévision pour CHAQUE couple chapitre/sous-chapitre pour l'année précédente (exactement 1 par couple)
  console.log(
    `🌱 Creating previsions ${CURRENT_YEAR - 1} for all sous-chapitres/chapitres (1 per couple)...`,
  );

  for (const sousChapitreId of sousChapitreIds) {
    for (const chapitreId of chapitreIds) {
      const montantPrevu = randomAmount(500000, 10000000);
      const montantEngage = Math.round((montantPrevu * randomAmount(60, 95)) / 100);
      const montantDisponible = montantPrevu - montantEngage;

      const prevision: Partial<Prevision> = {
        exercice: CURRENT_YEAR - 1,
        chapitreId,
        sousChapitreId,
        mairieId: DEFAULT_MAIRIE_ID,
        montantPrevu,
        montantEngage,
        montantDisponible,
        statut: 'validee',
        personnelId: randomChoice(personnelIds),
        createdAt: new Date(CURRENT_YEAR - 2, 11, 15), // Créée en décembre de l'année précédente
        updatedAt: now,
      };

      previsions.push(prevision);
    }
  }

  const previsionsPreviousYearCount = previsions.length - previsionsCurrentYearCount;
  console.log(
    `📊 ${previsionsPreviousYearCount} prévisions ${CURRENT_YEAR - 1} créées (${sousChapitreIds.length} sous-chapitres x ${chapitreIds.length} chapitres)`,
  );

  await db.previsions.bulkAdd(previsions as Prevision[]);
  console.log(
    `✅ ${previsions.length} prévisions créées au total (${previsionsCurrentYearCount} pour ${CURRENT_YEAR} + ${previsionsPreviousYearCount} pour ${CURRENT_YEAR - 1})`,
  );

  const created = await db.previsions.toArray();
  return created;
}

async function seedBordereauMandats(personnelIds: number[], count: number = 20) {
  const bordereauMandats: Partial<BordereauMandat>[] = [];
  const exercices = [CURRENT_YEAR - 2, CURRENT_YEAR - 1, CURRENT_YEAR];
  let numeroGlobal = 1;

  for (let i = 0; i < count; i++) {
    const exercice = exercices[i % exercices.length]!;
    const mois = Math.floor((i / count) * 12);
    const dateEmission = new Date(exercice, mois, randomAmount(1, 28));

    if (exercice === CURRENT_YEAR && dateEmission > now) {
      dateEmission.setTime(now.getTime() - randomAmount(1, 30) * 24 * 60 * 60 * 1000);
    }

    const statuts: Array<'ouvert' | 'ferme'> = ['ouvert', 'ferme'];
    const statut = exercice < CURRENT_YEAR ? 'ferme' : randomChoice(statuts);

    bordereauMandats.push({
      numero: numeroGlobal++,
      exercice,
      dateEmission,
      mairieId: DEFAULT_MAIRIE_ID,
      montantTotal: 0,
      nombreMandats: 0,
      statut,
      personnelId: randomChoice(personnelIds),
      createdAt: dateEmission,
      updatedAt: now,
    });
  }

  await db.bordereauMandats.bulkAdd(bordereauMandats as BordereauMandat[]);
  console.log(`✅ ${count} bordereaux mandats créés`);

  const created = await db.bordereauMandats.toArray();
  return created;
}

async function seedMandats(
  chapitreIds: number[],
  sousChapitreIds: number[],
  previsionIds: number[],
  personnelIds: number[],
  bordereauMandats: BordereauMandat[],
) {
  const beneficiaires = [
    'THEODULE DIRO LAHUET',
    'SANOGO OUMAR',
    'IDRISSA KONATE',
    'SORO TIÉGBÉ',
    'DIABY FANTA',
    'RECEVEUR MUNICIPAL',
    'Société ÉLECTRICITÉ GÉNÉRALE',
    'SARL FOURNITURES BUREAU',
  ];

  const objets = ['INDEMNITE DE FONCTION', 'TRANSP. & FRAIS DE MISSION', "Régie d'avance"];
  const modesPaiement: Array<'virement' | 'cheque' | 'especes' | 'autre'> = [
    'virement',
    'cheque',
    'especes',
    'autre',
  ];

  // Récupérer les chapitres et sous-chapitres pour avoir les codes
  const chapitresData = await db.chapitres.toArray();
  const sousChapitresData = await db.sousChapitres.toArray();

  const mandats: Partial<Mandat>[] = [];
  const bordereauUpdates = new Map<number, { count: number; total: number }>();

  let numeroOrdre = 0;
  const MANDATS_PAR_COUPLE = 3;

  const MONTH_SPECS: Array<{ label: string; start: Date; end: Date; exercice: number }> = [
    {
      label: 'janvier',
      exercice: 2026,
      start: new Date(2026, 0, 1),
      end: new Date(2026, 0, 31),
    },
    {
      label: 'février',
      exercice: 2026,
      start: new Date(2026, 1, 1),
      end: new Date(2026, 1, 28),
    },
  ];

  // Générer 3 mandats pour chaque couple chapitre/sous-chapitre, pour novembre ET décembre de l'année courante
  for (const monthSpec of MONTH_SPECS) {
    for (const chapitreId of chapitreIds) {
      for (const sousChapitreId of sousChapitreIds) {
        const chapitre = chapitresData.find((c) => c.id === chapitreId);
        const sousChapitre = sousChapitresData.find((s) => s.id === sousChapitreId);
        const chapitreCode = chapitre?.code || String(chapitreId);
        const sousChapitreCode = sousChapitre?.code || String(sousChapitreId);

        for (let m = 0; m < MANDATS_PAR_COUPLE; m++) {
          numeroOrdre++;
          const bordereau = randomChoice(bordereauMandats);
          const bordereauId = bordereau.id;

          const exercice = monthSpec.exercice;
          const dateMandat = randomDate(monthSpec.start, monthSpec.end);

          const numeroMandat = String(numeroOrdre);
          const montant = randomAmount(5000, 500000);

          const statuts: Array<'brouillon' | 'paye'> = ['brouillon', 'paye'];
          const statut =
            bordereau.statut === 'ferme' ? randomChoice(statuts) : randomChoice(statuts);

          // Générer l'etatMensuelId
          const etatMensuelId = generateEtatMensuelId(dateMandat, sousChapitreCode, chapitreCode);

          const mandat: Partial<Mandat> = {
            exercice,
            numeroMandat,
            numeroOrdre,
            dateMandat,
            chapitreId,
            sousChapitreId,
            etatMensuelId,
            mairieId: DEFAULT_MAIRIE_ID,
            beneficiaire: randomChoice(beneficiaires),
            objet: randomChoice(objets),
            montant,
            modePaiement: randomChoice(modesPaiement),
            statut,
            personnelId: randomChoice(personnelIds),
            createdAt: dateMandat,
            updatedAt: now,
          };

          if (bordereauId) {
            mandat.bordereauMandatId = bordereauId;
          }

          if (previsionIds.length > 0 && Math.random() > 0.2) {
            mandat.previsionId = randomChoice(previsionIds);
          }

          mandats.push(mandat);

          if (bordereauId) {
            const current = bordereauUpdates.get(bordereauId) || { count: 0, total: 0 };
            bordereauUpdates.set(bordereauId, {
              count: current.count + 1,
              total: current.total + montant,
            });
          }
        }
      }
    }
  }

  await db.mandats.bulkAdd(mandats as Mandat[]);

  for (const [id, stats] of bordereauUpdates.entries()) {
    await db.bordereauMandats.update(id, {
      nombreMandats: stats.count,
      montantTotal: stats.total,
      updatedAt: now,
    });
  }

  console.log(
    `✅ ${mandats.length} mandats créés (${MANDATS_PAR_COUPLE} par couple chapitre/sous-chapitre, pour ${MONTH_SPECS.length} mois: ${chapitreIds.length} chapitres x ${sousChapitreIds.length} sous-chapitres)`,
  );
}

// =================================================================
//           SEEDERS POUR MANDATS DE RECETTES (App6)
// =================================================================

async function seedBordereauMandatsRecette(personnelIds: number[], count: number = 10) {
  const bordereaux: Omit<BordereauMandatRecette, 'id'>[] = [];
  const exercices = [CURRENT_YEAR - 1, CURRENT_YEAR];
  let numeroGlobal = 1;

  for (let i = 0; i < count; i++) {
    const exercice = exercices[i % exercices.length]!;
    const mois = Math.floor((i / count) * 12);
    const dateEmission = new Date(exercice, mois, randomAmount(1, 28));

    const statuts: ('ouvert' | 'ferme')[] = ['ouvert', 'ferme'];
    const statut = exercice < CURRENT_YEAR ? 'ferme' : randomChoice(statuts);

    bordereaux.push({
      numero: numeroGlobal++,
      exercice,
      dateEmission,
      mairieId: DEFAULT_MAIRIE_ID,
      montantTotal: 0,
      nombreMandats: 0,
      statut,
      personnelId: randomChoice(personnelIds),
      createdAt: dateEmission,
      updatedAt: now,
    });
  }

  await db.bordereauMandatsRecette.bulkAdd(bordereaux);
  console.log(`✅ ${count} bordereaux mandats recettes créés`);
  return await db.bordereauMandatsRecette.toArray();
}

async function seedMandatsRecette(
  chapitreIds: number[],
  taxeIds: number[],
  personnelIds: number[],
  bordereauxRecette: BordereauMandatRecette[],
) {
  const mandatsRecette: Omit<MandatRecette, 'id'>[] = [];

  const partiesVersantes = [
    'ENTREPRISE ABC SARL',
    'COMMERCE GENERAL KOUASSI',
    'BOULANGERIE LA PAIX',
    'STATION SERVICE TOTAL',
    'PHARMACIE CENTRALE',
    'RESTAURANT LE GOURMET',
    'TRANSPORT KONE FRERES',
    'HOTEL LES PALMIERS',
  ];

  const objets = [
    'Taxe annuelle',
    'Redevance mensuelle',
    'Droit de place marché',
    'Taxe de publicité',
    'Contribution foncière',
    'Patente commerciale',
  ];

  const modePaiements: ('virement' | 'cheque' | 'especes' | 'autre')[] = [
    'virement',
    'cheque',
    'especes',
    'autre',
  ];

  const MONTH_SPECS = [
    {
      label: 'janvier',
      exercice: CURRENT_YEAR,
      start: new Date(CURRENT_YEAR, 0, 1),
      end: new Date(CURRENT_YEAR, 0, 31),
    },
    {
      label: 'février',
      exercice: CURRENT_YEAR,
      start: new Date(CURRENT_YEAR, 1, 1),
      end: new Date(CURRENT_YEAR, 1, 28),
    },
  ];

  const bordereauUpdates = new Map<number, { count: number; total: number }>();
  let numeroOrdre = 1000;
  const MANDATS_PAR_COUPLE = 2;

  // Créer 2 mandats par couple chapitre/taxe pour chaque mois
  for (const monthSpec of MONTH_SPECS) {
    for (const chapitreId of chapitreIds) {
      for (const taxeId of taxeIds) {
        for (let m = 0; m < MANDATS_PAR_COUPLE; m++) {
          numeroOrdre++;

          const bordereau = randomChoice(bordereauxRecette);
          const bordereauId = bordereau.id;
          const exercice = monthSpec.exercice;
          const dateMandat = randomDate(monthSpec.start, monthSpec.end);
          const numeroMandat = String(numeroOrdre);
          const montant = randomAmount(10000, 500000);

          const statutsOptions: ('brouillon' | 'paye' | 'annule')[] = ['paye', 'paye'];
          const statut = bordereau.statut === 'ferme' ? 'paye' : randomChoice(statutsOptions);

          const mandat: Omit<MandatRecette, 'id'> = {
            exercice,
            numeroMandat,
            dateMandat,
            chapitreId,
            taxeId,
            mairieId: DEFAULT_MAIRIE_ID,
            partieVersante: randomChoice(partiesVersantes),
            objet: randomChoice(objets),
            montant,
            modePaiement: randomChoice(modePaiements),
            statut,
            personnelId: randomChoice(personnelIds),
            createdAt: dateMandat,
            updatedAt: now,
          };

          if (bordereauId) {
            mandat.bordereauMandatRecetteId = bordereauId;
          }

          mandatsRecette.push(mandat);

          if (bordereauId) {
            const current = bordereauUpdates.get(bordereauId) || { count: 0, total: 0 };
            bordereauUpdates.set(bordereauId, {
              count: current.count + 1,
              total: current.total + montant,
            });
          }
        }
      }
    }
  }

  await db.mandatsRecette.bulkAdd(mandatsRecette);

  for (const [id, stats] of bordereauUpdates.entries()) {
    await db.bordereauMandatsRecette.update(id, {
      nombreMandats: stats.count,
      montantTotal: stats.total,
      updatedAt: now,
    });
  }

  console.log(
    `✅ ${mandatsRecette.length} mandats de recettes créés (${MANDATS_PAR_COUPLE} par couple chapitre/taxe)`,
  );
}
// =================================================================
//                      MIGRATION DE DONNÉES
// =================================================================

/**
 * Vérifie et corrige les informations de la mairie si elles sont incorrectes (ex: Bodokro au lieu de Vavoua)
 * Cette fonction est appelée au démarrage de l'application
 */
export async function ensureSousChapitres9xxExist() {
  const existing = await db.sousChapitres.filter((s) => s.code.startsWith('9')).toArray();
  if (existing.length > 0) return; // Already have 9xx sous-chapitres

  const mairie = await db.mairies.toCollection().first();
  if (!mairie?.id) return;
  const mairieId = mairie.id;
  const now = new Date();

  console.log('🔄 Migration: ajout des sous-chapitres 9xx (investissement)...');

  const items9xx = [
    { code: '90', libelle: 'SECTION 90 - ÉQUIPEMENT DES SERVICES GÉNÉRAUX', parent: null },
    { code: '900', libelle: 'CHAP.900-ADMINISTRATION GÉNÉRALE', parent: '90' },
    { code: '903', libelle: 'CHAP.903-POLICE ET ORDRE PUBLIC FOURRIÈRE', parent: '90' },
    {
      code: '9030',
      libelle: 'Police et ordre publique - fourrière SOUS TOTAL CHAP. 903',
      parent: '903',
    },
    { code: '91', libelle: 'SECTION 91-ÉQUIPEMENT DES SCES DE COLLECTIVITÉ', parent: null },
    { code: '910', libelle: 'CHAP.910-VOIRIES ET RÉSEAUX', parent: '91' },
    { code: '9101', libelle: 'VOIRIES', parent: '910' },
    { code: '9102', libelle: "Réseaux d'assainissement & Drainage", parent: '910' },
    { code: '9103', libelle: 'Électricité - éclairage public', parent: '910' },
    {
      code: '913',
      libelle: "CHAP. 913- HYGIÈNE & SALUBRITÉ PUBLIQ. HYDRAULIQUE- ADDUCTION D'EAU Articles",
      parent: '91',
    },
    { code: '9134', libelle: 'Hydraulique - pompages puits lavoirs', parent: '913' },
    { code: '9136', libelle: "Autres dépenses d'équipement au tritre", parent: '913' },
    {
      code: '92',
      libelle: 'SECTION 92-ÉQUIPEMENT DES SERVICES SOCIAUX, CULTURELS ET DE LA PROMOTION HUMAINE',
      parent: null,
    },
    { code: '921', libelle: 'CHAP. 921- SANTÉ PUBLIQUE Articles', parent: '92' },
    { code: '9212', libelle: 'Hôpitaux & Dispensaires', parent: '921' },
    { code: '93', libelle: 'SECTION 93- ÉQUIPEMENT DES SERVICES ÉCONOMIQUES', parent: null },
    { code: '934', libelle: 'CHAP. 934- INDUSTRIES & COMMERCES Articles', parent: '93' },
    { code: '9341', libelle: 'Abattoir- Conservation de viande & Transp.', parent: '934' },
    { code: '9344', libelle: 'Marchés', parent: '934' },
  ];

  const codeToIdMap = new Map<string, number>();

  for (const item of items9xx) {
    let parentId: number | undefined;
    if (item.parent) {
      parentId = codeToIdMap.get(item.parent);
    }

    const newItem: Omit<SousChapitre, 'id'> = {
      code: item.code,
      libelle: item.libelle,
      mairieId,
      actif: true,
      createdAt: now,
      updatedAt: now,
    };
    if (parentId !== undefined) {
      newItem.parentId = parentId;
    }

    const id = await db.sousChapitres.add(newItem);
    codeToIdMap.set(item.code, id);
  }

  console.log(`✅ ${items9xx.length} sous-chapitres 9xx ajoutés avec succès`);
}

export async function ensureCorrectMairieInfo() {
  const mairies = await db.mairies.toArray();

  if (mairies.length > 0) {
    const mairie = mairies[0];
    if (!mairie) return;

    // Si c'est Bodokro ou si le code n'est pas 433, on met à jour
    if (mairie.nom.includes('Bodokro') || mairie.code !== '433') {
      console.log('🔄 Correction des données de la mairie détectée (Bodokro -> Vavoua)...');

      await db.mairies.update(mairie.id, {
        nom: MAIRIE_INFO.nom,
        code: MAIRIE_INFO.code,
        ville: MAIRIE_INFO.ville,
        departement: MAIRIE_INFO.departement,
        region: MAIRIE_INFO.region,
        email: MAIRIE_INFO.email,
        updatedAt: new Date(),
      });

      console.log('✅ Données de la mairie corrigées avec succès');
    }
  }
}
