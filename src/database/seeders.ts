import { db, DEFAULT_MAIRIE_ID } from './db';
import type {
  SousChapitre,
  Prevision,
  Mandat,
  BordereauMandat,
  BordereauRecette,
  PrevisionRecette,
  Declaration,
} from './db';

const now = new Date();

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
  previsions?: number;
  mandats?: number;
  bordereauMandats?: number;
}

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

  console.log('🚀 Seeding default data...');

  // 1. Mairie
  const mairieId = await db.mairies.add({
    nom: "Mairie d'Azaguié",
    code: '422',
    adresse: 'Avenue Principale',
    ville: 'Azaguié',
    departement: 'Agboville',
    region: 'Agnéby-Tiassa',
    codePostal: '00225',
    telephone: '+225 23 54 00 00',
    email: 'contact@mairie-azaguie.ci',
    createdAt: now,
    updatedAt: now,
  });

  // 2. Utilisateurs
  await db.utilisateurs.bulkAdd([
    {
      username: 'admin',
      password: 'password',
      nom: 'Administrateur',
      prenom: 'Complet',
      email: 'admin@sigobc.sn',
      role: 'admin',
      mairieId: mairieId as number,
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
      mairieId: mairieId as number,
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
      mairieId: mairieId as number,
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
      libelle: 'CARBUR. & LUBRIF.',
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

  // 4. Sous-chapitres par défaut (App3) - Liste complète avec hiérarchie
  console.log('🌱 Seeding sous-chapitres (hierarchical - complete list)...');

  const sousChapitresData = [
    // SECTION 60 - DÉPENSES DES SERVICES GÉNÉRAUX
    { code: '60', libelle: 'SECTION 60- DEPENSES DES SERVICES GENERAUX', parent: null },
    { code: '600', libelle: 'CHAP. ADMINISTRATION GENERALE', parent: '60' },
    { code: '6000', libelle: 'ADMINISTRATION', parent: '600' },
    { code: '6001', libelle: 'AUTORITES MUNICIPALES', parent: '600' },
    { code: '60010', libelle: 'FONCTIONNEMENT CONSEILS ET COMMISSIONS', parent: '6001' },
    { code: '60011', libelle: 'FONCTIONNEMENT DE LA MUNICIPALITE', parent: '6001' },
    { code: '60012', libelle: 'FONCTIONNEMENT CABINET DU MAIRE', parent: '6001' },
    { code: '60013', libelle: 'INDEMNITE DE FONCTION ET DE REPRESENTATION', parent: '6001' },
    {
      code: '60015',
      libelle: 'FRAIS DE MISSIONS EN DEHORS DU TERRITOIRE NATIONAL (COMMUNE)',
      parent: '6001',
    },
    {
      code: '60016',
      libelle: 'AUTRES DEPENSES AU TITRE DES AUTORITES MUNICIPALES',
      parent: '6001',
    },
    { code: '6002', libelle: 'ETAT CIVIL ET POPULATION', parent: '600' },
    { code: '6006', libelle: "AUTRES DEPENSES D'ADMINISTRATION GENERALE", parent: '600' },

    { code: '601', libelle: 'CHAP. 601- ADMINISTRATION FINANCIERE ET DOM.', parent: '60' },
    { code: '6010', libelle: 'ADMINISTRATION', parent: '601' },
    { code: '6016', libelle: 'AUTRES DEPENSES RELATIVES AU DOMAINE COMMUNAL', parent: '601' },

    { code: '602', libelle: 'CHAP. 602-RECETTE MUNICIPALE', parent: '60' },
    { code: '6020', libelle: 'ADMINISTRATION', parent: '602' },
    { code: '6021', libelle: 'FRAIS DE RECOUVREMENT ET POURSUITES', parent: '602' },

    { code: '603', libelle: 'CHAP.603-POLICE ET ORDRE PUBLIC-FOURRIERE', parent: '60' },
    { code: '6031', libelle: 'GARDES MUNICIPAUX', parent: '603' },
    { code: '6033', libelle: 'PROGRAMMES SPECIAUX ET OPERATIONS DIVERSES', parent: '603' },

    // SECTION 61 - DÉPENSES DES SERVICES DE COLLECTIVITÉ
    { code: '61', libelle: 'SECTION 61- DEPENSES DES SERVICES DE COLLECTIVITE', parent: null },
    { code: '610', libelle: 'CHAP. 610-VOIRIES ET RESEAUX', parent: '61' },
    { code: '6100', libelle: 'ADMINISTRATION', parent: '610' },
    { code: '6101', libelle: 'VOIRIES - ROUTES - CHEMINS', parent: '610' },

    {
      code: '613',
      libelle: "CHAP. 613-HYGIENE ET SALUBRITE PUBLIQUES - HYDRAULIQUE - ADDUCTION D'EAU",
      parent: '61',
    },
    { code: '6133', libelle: 'NETTOIEMENT VOIRIE-ENLEVEMENT ORDURES', parent: '613' },
    { code: '6136', libelle: "Autres depenses d'hygiène et de salubrité", parent: '613' },

    {
      code: '614',
      libelle: "CHAP. 614- PROTECTION CIVILE - LUTTE CONTRE L'INCENDIE",
      parent: '61',
    },
    { code: '6141', libelle: 'PROTECTION CIVILE', parent: '614' },
    { code: '6142', libelle: 'LUTTE CONTRE INCENDIE', parent: '614' },

    { code: '615', libelle: 'CHAP. 615- CIMETIERES - SERVICES FUNERAIRES', parent: '61' },
    { code: '6151', libelle: 'CIMETIERE-INHUMATIONS-EXHUMATIONS', parent: '615' },
    { code: '6152', libelle: 'CREUSEMENT DE FOSSES', parent: '615' },

    // SECTION 62 - DÉPENSES DES SERVICES SOCIAUX CULTURELS ET DE PROMOTION HUMAINE
    {
      code: '62',
      libelle: 'SECTION 62- DEPENSES DES SERVICES SOCIAUX CULTURELS ET DE PROMOTION HUMAINE',
      parent: null,
    },
    { code: '620', libelle: 'CHAP. 620- EDUCATION', parent: '62' },
    { code: '6201', libelle: "Crèche, jardin d'enfants et ecoles primaire", parent: '620' },
    { code: '6206', libelle: "AUTRES DEPENSES D'EDUCATION", parent: '620' },

    { code: '621', libelle: 'CHAP. 621 : SANTE PUBLIQUE', parent: '62' },
    { code: '6214', libelle: 'Evacuation sanitaire - service ambulance', parent: '621' },

    { code: '622', libelle: 'CHAP. 622- ASSISTANCE SOCIALE', parent: '62' },
    { code: '6223', libelle: 'HANDICAPES', parent: '622' },
    { code: '6224', libelle: 'AIDE FAMILIALE, SOCIALE ET PERSONNES A.', parent: '622' },
    { code: '6225', libelle: 'AIDES AUX INDIGENTS', parent: '622' },
    { code: '6226', libelle: "AUTRES DEPENSES D'ASSISTANCE SOCIALE", parent: '622' },

    { code: '624', libelle: 'CHAP. 624- SPORTS ET LOISIRS', parent: '62' },
    { code: '6242', libelle: 'MANIFESTATIONS SPORTIVES', parent: '624' },

    { code: '625', libelle: 'CHAP.625- ACTIVITES CULTURELLES', parent: '62' },
    { code: '6250', libelle: 'ADMINISTRATION', parent: '625' },
    { code: '6256', libelle: 'AUTRES DEPENSES DES ACTIVITES CULTURELLES', parent: '625' },

    {
      code: '626',
      libelle: 'CHAP.626- AUTRES DEPENSES DES SERVICE SOCIAUX .CULTURELS ET DE PROMOTION HUMAINE',
      parent: '62',
    },

    // SECTION 63 - DÉPENSES DES SERVICES ÉCONOMIQUES
    { code: '63', libelle: 'SECTION 63- DEPENSES DES SERVICES ECONOMIQUES', parent: null },
    { code: '630', libelle: 'CHAP. 630- AGRICULTURE ET ELEVAGE', parent: '63' },
    { code: '633', libelle: 'CHAP.633-TRANSPORT-COMMUNICATIONS', parent: '63' },
    { code: '634', libelle: 'CHAP. 634- INDUSTRIE ET COMMERCE', parent: '63' },
    { code: '6341', libelle: 'ABATTOIRS-CONSERVATION ET TRANSPORTS DE VIANDE', parent: '634' },

    // SECTION 64 - DÉPENSES DIVERSES
    { code: '64', libelle: 'SECTION 64 - DEPENSES DIVERSES', parent: null },
    { code: '640', libelle: 'CHAP. 640- DETTES', parent: '64' },
    { code: '6406', libelle: 'AUTRES DETTES DE LA COMMUNE', parent: '640' },

    {
      code: '641',
      libelle: 'CHAP. 641-CONTRIBUTIONS FONDS DE CONCOURS ET TRANSFERTS',
      parent: '64',
    },
    {
      code: '6415',
      libelle: 'CONFERENCES INTERNATIONALES, ASSOCIATION DES VILLES ET COMMUNES',
      parent: '641',
    },

    { code: '642', libelle: 'CHAP. 642- ASSURANCE DE LA COMMUNE', parent: '64' },
    { code: '6420', libelle: 'RESPONSABILITE CIVILE', parent: '642' },
    { code: '6422', libelle: 'ASSURANCE DES VEHICULES', parent: '642' },
    { code: '6426', libelle: 'AUTRES ASSURANCES (ELUS)', parent: '642' },

    {
      code: '643',
      libelle: 'CHAP.643- CEREMONIES PUBLIQUES - FETES ET RECEPTIONS OFFICIELLES',
      parent: '64',
    },
    { code: '6430', libelle: 'CEREMONIES PUBLIQUES', parent: '643' },
    { code: '6431', libelle: 'FETES ET RECEPTIONS OFFICIELLES', parent: '643' },

    { code: '644', libelle: 'CHAP.644-VERSEMENT AUX FONDS DE RESERVE', parent: '64' },
    { code: '6440', libelle: 'FONDS DE RESERVES ORDINAIRE', parent: '644' },
    { code: '6441', libelle: "FONDS D'INVESTISSEMENT", parent: '644' },

    { code: '645', libelle: 'CHAP.645- DEPENSES ACCIDENTELLES', parent: '64' },
    { code: '6451', libelle: 'INDEMNITES -FRAIS ET DOMMAGE ET INTERETS', parent: '645' },

    // SECTION 90 - EQUIPEMENT DES SERVICES GENERAUX
    { code: '90', libelle: 'SECTION 90 - EQUIPEMENT DES SERVICES GENERAUX', parent: null },
    { code: '900', libelle: 'CHAP.900-ADMINISTRATION GENERALE', parent: '90' },
    { code: '903', libelle: 'CHAP.903-POLICE ET ORDRE PUBLIC FOURRIERE', parent: '90' },
    {
      code: '9030',
      libelle: 'Police et ordre publique - fourrière SOUS TOTAL CHAP. 903',
      parent: '903',
    },

    // SECTION 91 - EQUIPEMENT DES SERVICES DE COLLECTIVITE
    { code: '91', libelle: 'SECTION 91-EQUIPEMENT DES SCES DE COLLECTIVITE', parent: null },
    { code: '910', libelle: 'CHAP.910-VOIRIES ET RESEAUX', parent: '91' },
    { code: '9101', libelle: 'VOIRIES', parent: '910' },
    { code: '9102', libelle: "Réseaux d'assainissement & Drainage", parent: '910' },
    { code: '9103', libelle: 'Electricité - éclairage public', parent: '910' },
    {
      code: '913',
      libelle: "CHAP. 913- HYGIENE & SALUBRITE PUBLIQ. HYDRAULIQUE- ADDUCTION D'EAU Articles",
      parent: '91',
    },
    { code: '9134', libelle: 'Hydraulique - pompages puits lavoirs', parent: '913' },
    { code: '9136', libelle: "Autres dépenses d'équipement au tritre", parent: '913' },

    // SECTION 92 - EQUIPEMENT DES SERVICES SOCIAUX, CULTURELS ET DE LA PROMOTION HUMAINE
    {
      code: '92',
      libelle: 'SECTION 92-EQUIPEMENT DES SERVICES SOCIAUX, CULTURELS ET DE LA PROMOTION HUMAINE',
      parent: null,
    },
    { code: '921', libelle: 'CHAP. 921- SANTE PUBLIQUE Articles', parent: '92' },
    { code: '9212', libelle: 'Hôpitaux & Dispensaires', parent: '921' },

    // SECTION 93 - EQUIPEMENT DES SERVICES ECONOMIQUES
    { code: '93', libelle: 'SECTION 93- EQUIPEMENT DES SERVICES ECONOMIQUES', parent: null },
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
      mairieId: mairieId as number,
      actif: true,
      createdAt: now,
      updatedAt: now,
    };
    if (parentId !== undefined) {
      newItem.parentId = parentId;
    }

    const id = await db.sousChapitres.add(newItem);
    codeToIdMap.set(item.code, id as number);
  }

  // 5. Taxes par défaut pour App6 - Recettes (Nomenclature complète)
  console.log('🌱 Seeding taxes (App6 - Recettes)...');
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
    previsions = 30,
    // mandats = 200,
    bordereauMandats = 20,
  } = options;

  try {
    // D'abord, vider et réinitialiser la base
    await clearDatabase();
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
    console.log(`🌱 Seeding ${previsions} test previsions...`);
    const previsionsCreated = await seedPrevisions(
      chapitreIds,
      utilisateurIds,
      previsions,
      sousChapitreIds,
    );
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

    console.log('\n✨ All test data seeders have been executed successfully!');
  } catch (error) {
    console.error('❌ Error during test data seeding:', error);
    throw error;
  }
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

    await db.utilisateurs.clear();
    await db.mairies.clear();

    console.log('✅ All tables cleared successfully.');
  } catch (error) {
    console.error('❌ Error clearing database:', error);
    throw error;
  }
}

// =================================================================
//                      FONCTIONS DE GÉNÉRATION
// =================================================================

async function seedBordereauxRecettes(personnelIds: number[]) {
  const bordereaux: Partial<BordereauRecette>[] = [];

  // Générer 8 bordereaux validés pour Novembre et Décembre 2025
  for (let i = 1; i <= 8; i++) {
    // Alterner entre Novembre et Décembre
    const mois = i <= 4 ? 10 : 11; // 10 = Novembre, 11 = Décembre
    const jour = randomAmount(1, 28);
    const dateEmission = new Date(2025, mois, jour);

    bordereaux.push({
      numero: i,
      annee: 2025,
      mairieId: DEFAULT_MAIRIE_ID,
      montantTotal: 0, // Sera mis à jour après
      nombreDeclarations: 0,
      statut: 'ferme',
      personnelId: randomChoice(personnelIds),
      createdAt: dateEmission,
      updatedAt: now,
      dateTransmission: new Date(2025, mois, jour + 5),
    });
  }

  await db.bordereauxRecette.bulkAdd(bordereaux as BordereauRecette[]);
  console.log(`✅ ${bordereaux.length} bordereaux de recettes créés (validés, Nov-Déc 2025)`);

  return await db.bordereauxRecette.toArray();
}

async function seedPrevisionsRecettes(personnelIds: number[]) {
  const taxes = await db.taxes.toArray();
  const previsions: Partial<PrevisionRecette>[] = [];

  // Une prévision par taxe pour 2025 uniquement
  for (const taxe of taxes) {
    if (!taxe.id) continue;

    const montantPrevu = randomAmount(100000, 5000000);
    const montantRealise = Math.round(montantPrevu * (randomAmount(70, 120) / 100));

    previsions.push({
      exercice: 2025,
      taxeId: taxe.id,
      mairieId: DEFAULT_MAIRIE_ID,
      montantPrevu,
      montantRealise,
      statut: 'validee',
      personnelId: randomChoice(personnelIds),
      createdAt: new Date(2024, 11, 15),
      updatedAt: now,
    });
  }

  await db.previsionsRecettes.bulkAdd(previsions as PrevisionRecette[]);
  console.log(`✅ ${previsions.length} prévisions de recettes créées (1 par taxe, 2025)`);
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

  // Pour chaque taxe, créer 2 ou 3 déclarations validées
  for (const taxe of app6Taxes) {
    if (!taxe.id) continue;

    const nombreDecls = randomAmount(2, 3);

    for (let i = 0; i < nombreDecls; i++) {
      // Assigner à un bordereau aléatoire
      const bordereau = randomChoice(bordereaux);
      if (!bordereau || !bordereau.id) continue;

      const montant = taxe.montant || randomAmount(5000, 500000);

      // Alterner entre Novembre et Décembre 2025
      const mois = randomChoice([10, 11]);
      const jour = randomAmount(1, 28);
      const d = new Date(2025, mois, jour);

      declarations.push({
        exercice: 2025,
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

      // Accumuler les montants par bordereau
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
  count: number = 30,
  sousChapitreIds: number[] = [],
) {
  const previsions: Partial<Prevision>[] = [];
  const exercices = [2024, 2025];

  // En 2026: créer une prévision pour CHAQUE combinaison sous-chapitre/chapitre
  console.log('🌱 Creating previsions 2026 for all sous-chapitres with all 8 chapitres...');

  for (const sousChapitreId of sousChapitreIds) {
    for (const chapitreId of chapitreIds) {
      const montantPrevu = randomAmount(500000, 15000000);
      const montantEngage = 0;
      const montantDisponible = montantPrevu;

      const prevision: Partial<Prevision> = {
        exercice: 2026,
        chapitreId,
        sousChapitreId,
        mairieId: DEFAULT_MAIRIE_ID,
        montantPrevu,
        montantEngage,
        montantDisponible,
        statut: 'validee',
        personnelId: randomChoice(personnelIds),
        createdAt: new Date(2025, 11, 15),
        updatedAt: now,
      };

      previsions.push(prevision);
    }
  }

  const previsions2026Count = previsions.length;
  console.log(
    `📊 ${previsions2026Count} prévisions 2026 créées (${sousChapitreIds.length} sous-chapitres x ${chapitreIds.length} chapitres)`,
  );

  // Ajouter quelques prévisions pour 2024/2025 (historique)
  const historicalCount = Math.min(count, 50);
  for (let i = 0; i < historicalCount; i++) {
    const exercice = randomChoice(exercices);
    const montantPrevu = randomAmount(500000, 10000000);
    const montantEngage = Math.round((montantPrevu * randomAmount(60, 95)) / 100);
    const montantDisponible = montantPrevu - montantEngage;

    const prevision: Partial<Prevision> = {
      exercice,
      chapitreId: randomChoice(chapitreIds),
      sousChapitreId: randomChoice(sousChapitreIds),
      mairieId: DEFAULT_MAIRIE_ID,
      montantPrevu,
      montantEngage,
      montantDisponible,
      statut: 'cloturee',
      personnelId: randomChoice(personnelIds),
      createdAt: randomDate(new Date(exercice - 1, 10, 1), new Date(exercice, 0, 31)),
      updatedAt: now,
    };

    previsions.push(prevision);
  }

  await db.previsions.bulkAdd(previsions as Prevision[]);
  console.log(
    `✅ ${previsions.length} prévisions créées au total (${previsions2026Count} pour 2026 + ${historicalCount} historiques)`,
  );

  const created = await db.previsions.toArray();
  return created;
}

async function seedBordereauMandats(personnelIds: number[], count: number = 20) {
  const bordereauMandats: Partial<BordereauMandat>[] = [];
  const exercices = [2024, 2025, 2026];
  let numeroGlobal = 1;

  for (let i = 0; i < count; i++) {
    const exercice = exercices[i % exercices.length]!;
    const mois = Math.floor((i / count) * 12);
    const dateEmission = new Date(exercice, mois, randomAmount(1, 28));

    if (exercice === 2026 && dateEmission > now) {
      dateEmission.setTime(now.getTime() - randomAmount(1, 30) * 24 * 60 * 60 * 1000);
    }

    const statuts: Array<'ouvert' | 'ferme'> = ['ouvert', 'ferme'];
    const statut = exercice < 2026 ? 'ferme' : randomChoice(statuts);

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
      label: 'novembre',
      exercice: 2025,
      start: new Date(2025, 10, 1),
      end: new Date(2025, 10, 30),
    },
    {
      label: 'décembre',
      exercice: 2025,
      start: new Date(2025, 11, 1),
      end: new Date(2025, 11, 31),
    },
  ];

  // Générer 3 mandats pour chaque couple chapitre/sous-chapitre, pour novembre ET décembre 2025
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

          const statuts: Array<'emis' | 'paye'> = ['emis', 'paye'];
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
