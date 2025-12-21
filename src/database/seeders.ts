import { db, DEFAULT_MAIRIE_ID } from './db';
import type { Mairie, Utilisateur, Chapitre, SousChapitre, Prevision, Mandat, BordereauMandat } from './db';
import type {
  ChapitreInvestissement,
  SousChapitreInvestissement,
  PrevisionInvestissement,
  MandatInvestissement,
  BordereauMandatInvestissement,
} from './db';

const now = new Date();

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
      password: 'password', // Hashage à faire en prod
      nom: 'Administrateur',
      prenom: 'Complet',
      email: 'admin@tresor.sn',
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
      email: 'agent@tresor.sn',
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
      email: 'comptable@tresor.sn',
      role: 'comptable',
      mairieId: mairieId as number,
      actif: true,
      createdAt: now,
      updatedAt: now,
    },
  ]);

  // 4. Chapitres par défaut (App3)
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

  // 5. Sous-chapitres par défaut (App3) - Hiérarchisé
  console.log('🌱 Seeding sous-chapitres (hierarchical)...');

  const sousChapitresData = [
    // SECTION 60
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
      libelle: 'FRAIS DE MISSIONS EN DEHORS DU TERRITOIRE NATIONAL( COMMUNE)',
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

    // SECTION 61
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
    { code: '6151', libelle: 'CIMETIERE-INHUMATIONS-EXHUMATIONS-', parent: '615' },
    { code: '6152', libelle: 'CREUSEMENT DE FOSSES', parent: '615' },

    // SECTION 62
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

    // SECTION 63
    { code: '63', libelle: 'SECTION 63- DEPENSES DES SERVICES ECONOMIQUES', parent: null },
    { code: '630', libelle: 'CHAP. 630- AGRICULTURE ET ELEVAGE', parent: '63' },
    { code: '633', libelle: 'CHAP.633-TRANSPORT-COMMUNIATIONS', parent: '63' },
    { code: '634', libelle: 'CHAP. 634- INDUSTRIE ET COMMERCE', parent: '63' },
    { code: '6341', libelle: 'ABATTOIRS-CONSERVATION ET TRANSPORTS DE VIANDE', parent: '634' },

    // SECTION 64
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
    { code: '6420', libelle: 'RESPONSABLITE CIVILE', parent: '642' },
    { code: '6422', libelle: 'ASSURANCE DES VEHICULES', parent: '642' },
    { code: '6426', libelle: 'AUTRES ASSURANCES ( ELUS)', parent: '642' },

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
  ];

  const codeToIdMap = new Map<string, number>();

  for (const item of sousChapitresData) {
    let parentId = undefined;
    if (item.parent) {
      parentId = codeToIdMap.get(item.parent);
      if (!parentId) {
        console.warn(`Parent ${item.parent} not found for ${item.code}`);
      }
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

  // Seed Investissements Chapitres (App5)
  const investChapitresCount = await db.chapitresInvestissement.count();
  if (investChapitresCount === 0) {
    console.log('🌱 Seeding default investissement chapitres...');
    await db.chapitresInvestissement.bulkAdd([
      {
        code: '21',
        libelle: 'ACQUISITIONS IMMOBILIERES',
        mairieId: mairieId as number,
        actif: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        code: '22',
        libelle: 'AGENCEMENTS ET AMENAGEMENTS',
        mairieId: mairieId as number,
        actif: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        code: '23',
        libelle: 'MATERIEL DE TRANSPORT',
        mairieId: mairieId as number,
        actif: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        code: '24',
        libelle: 'MATERIEL ET OUTILLAGE',
        mairieId: mairieId as number,
        actif: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        code: '25',
        libelle: 'MOBILIER DE BUREAU ET MATERIEL INFORMATIQUE',
        mairieId: mairieId as number,
        actif: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        code: '26',
        libelle: 'AUTRES IMMOBILISATIONS CORPORELLES',
        mairieId: mairieId as number,
        actif: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        code: '27',
        libelle: 'IMMOBILISATIONS INCORPORELLES',
        mairieId: mairieId as number,
        actif: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        code: '28',
        libelle: 'IMMOBILISATIONS FINANCIERES',
        mairieId: mairieId as number,
        actif: true,
        createdAt: now,
        updatedAt: now,
      },
    ]);
  }

  // Seed Investissements Sous-Chapitres (App5)
  const investSousChapitresCount = await db.sousChapitresInvestissement.count();
  if (investSousChapitresCount === 0) {
    console.log('🌱 Seeding default investissement sous-chapitres...');
    // Fetch chapitres to link IDs
    const chapitres = await db.chapitresInvestissement.toArray();
    const getChapId = (code: string) =>
      chapitres.find((c: ChapitreInvestissement) => c.code === code)?.id;

    await db.sousChapitresInvestissement.bulkAdd([
      // Chapitre 21
      {
        code: '211',
        libelle: 'TERRAINS',
        chapitreInvestissementId: getChapId('21')!,
        mairieId: mairieId as number,
        actif: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        code: '212',
        libelle: 'BATIMENTS',
        chapitreInvestissementId: getChapId('21')!,
        mairieId: mairieId as number,
        actif: true,
        createdAt: now,
        updatedAt: now,
      },
      // Chapitre 22
      {
        code: '221',
        libelle: 'VOIRIE ET RESEAUX DIVERS',
        chapitreInvestissementId: getChapId('22')!,
        mairieId: mairieId as number,
        actif: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        code: '222',
        libelle: 'PLANTATIONS',
        chapitreInvestissementId: getChapId('22')!,
        mairieId: mairieId as number,
        actif: true,
        createdAt: now,
        updatedAt: now,
      },
      // Chapitre 23
      {
        code: '231',
        libelle: 'VEHICULES AUTOMOBILES',
        chapitreInvestissementId: getChapId('23')!,
        mairieId: mairieId as number,
        actif: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        code: '232',
        libelle: 'CYCLES ET MOTOCYCLES',
        chapitreInvestissementId: getChapId('23')!,
        mairieId: mairieId as number,
        actif: true,
        createdAt: now,
        updatedAt: now,
      },
      // Chapitre 24
      {
        code: '241',
        libelle: 'MATERIEL TECHNIQUE',
        chapitreInvestissementId: getChapId('24')!,
        mairieId: mairieId as number,
        actif: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        code: '242',
        libelle: 'OUTILLAGE',
        chapitreInvestissementId: getChapId('24')!,
        mairieId: mairieId as number,
        actif: true,
        createdAt: now,
        updatedAt: now,
      },
      // Chapitre 25
      {
        code: '251',
        libelle: 'MOBILIER DE BUREAU',
        chapitreInvestissementId: getChapId('25')!,
        mairieId: mairieId as number,
        actif: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        code: '252',
        libelle: 'MATERIEL INFORMATIQUE',
        chapitreInvestissementId: getChapId('25')!,
        mairieId: mairieId as number,
        actif: true,
        createdAt: now,
        updatedAt: now,
      },
      // Chapitre 26
      {
        code: '261',
        libelle: 'LIVRES ET BIBLIOTHEQUES',
        chapitreInvestissementId: getChapId('26')!,
        mairieId: mairieId as number,
        actif: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        code: '262',
        libelle: "OEUVRES D'ART",
        chapitreInvestissementId: getChapId('26')!,
        mairieId: mairieId as number,
        actif: true,
        createdAt: now,
        updatedAt: now,
      },
    ]);
  }

  console.log('✅ Default data seeded successfully.');
}

// =================================================================
//                      SEEDERS DE DONNÉES DE TEST
// =================================================================

// ... (Le reste du fichier contient les fonctions pour générer des données aléatoires)
// Pour la concision, je vais réutiliser les fonctions existantes de l'ancien `seeders.ts`
// mais je les préfixerai avec "generate" pour clarifier leur rôle.

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
 * Construire un objet detailsQuotites à partir d'un objet timbres.
 * Répartit les quantités par valeur entre les quotités actives de même prix.
 */
  await Promise.all([
    db.mairies.clear(),
    db.utilisateurs.clear(),
    db.chapitres.clear(),
    db.sousChapitres.clear(),
    db.previsions.clear(),
    db.mandats.clear(),
    db.bordereauMandats.clear(),
    db.chapitresInvestissement.clear(),
    db.sousChapitresInvestissement.clear(),
    db.previsionsInvestissement.clear(),
    db.mandatsInvestissement.clear(),
    db.bordereauMandatsInvestissement.clear(),
  ]);
  console.log('✅ All tables cleared.');
export interface SeedOptions {
  utilisateurs?: number;
  chapitres?: number;
  sousChapitres?: number;
  previsions?: number;
  mandats?: number;
  bordereauMandats?: number;
  previsionsInvestissement?: number;
  mandatsInvestissement?: number;
  bordereauMandatsInvestissement?: number;
}

/**
 * Remplit la base de données avec une grande quantité de données de test aléatoires.
 */
export async function seedTestData(options: SeedOptions = {}) {
  console.log('🚀 Starting test data seeders...');


    console.log(`🌱 Seeding ${previsions} test previsions...`);
    const previsionsCreated = await seedPrevisions(
      chapitreIds,
      utilisateurIds,
      previsions,
      sousChapitreIds,
    );
    const previsionIds = previsionsCreated.map((p) => p.id!);
    // D'abord créer les bordereaux de mandats
    console.log(`🌱 Seeding ${bordereauMandats} test bordereau mandats...`);
    const bordereauMandatsCreated = await seedBordereauMandats(utilisateurIds, bordereauMandats);
    // Puis créer les mandats en les liant aux bordereaux
    console.log(`🌱 Seeding ${mandats} test mandats...`);
    await seedMandats(
      chapitreIds,
      sousChapitreIds,
      previsionIds,
      utilisateurIds,
      bordereauMandatsCreated,
      mandats,
    );

    // Seeding App5 - Investissements
    const chapitresInvestCreated = await db.chapitresInvestissement.toArray();
    const chapitreInvestIds = chapitresInvestCreated.map((c) => c.id!);
    const sousChapitresInvestCreated = await db.sousChapitresInvestissement.toArray();
    const sousChapitreInvestIds = sousChapitresInvestCreated.map((s) => s.id!);

    console.log(`🌱 Seeding ${previsionsInvestissement} test previsions investissement...`);
    const previsionsInvestCreated = await seedPrevisionsInvestissement(
      chapitreInvestIds,
      utilisateurIds,
      previsionsInvestissement,
      sousChapitreInvestIds,
    );
    const previsionInvestIds = previsionsInvestCreated.map((p) => p.id!);

    console.log(
      `🌱 Seeding ${bordereauMandatsInvestissement} test bordereau mandats investissement...`,
    );
    const bordereauMandatsInvestCreated = await seedBordereauMandatsInvestissement(
      utilisateurIds,
      bordereauMandatsInvestissement,
    );

    console.log(`🌱 Seeding ${mandatsInvestissement} test mandats investissement...`);
    await seedMandatsInvestissement(
      chapitreInvestIds,
      sousChapitreInvestIds,
      previsionInvestIds,
      utilisateurIds,
      bordereauMandatsInvestCreated,
      mandatsInvestissement,
    );

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
  const {
    previsions = 30,
    mandats = 200,
    bordereauMandats = 20,
    previsionsInvestissement = 20,
    mandatsInvestissement = 50,
    bordereauMandatsInvestissement = 8,
  } = options;

  try {
    // Il est recommandé de partir d'une base propre (ou de données par défaut)
    await seedDefaultData();
    console.log('Default data seeded before adding test data.');

    // On récupère les IDs nécessaires après le seeding par défaut
    const utilisateursCreated = await db.utilisateurs.toArray();
    const utilisateurIds = utilisateursCreated.map((u) => u.id!);
    // Removed: taxesCreated, taxeIds (App1)

    const chapitresCreated = await db.chapitres.toArray();
    const chapitreIds = chapitresCreated.map((c) => c.id!);
    const sousChapitresCreated = await db.sousChapitres.toArray();
    const sousChapitreIds = sousChapitresCreated.map((s) => s.id!);

    // Génération des données de test supplémentaires
}

// On garde les fonctions de génération de l'ancien seeder.ts ici
// pour que seedTestData puisse les utiliser.



export async function seedPrevisions(
  chapitreIds: number[],
  personnelIds: number[],
  count: number = 30,
  sousChapitreIds?: number[],
) {
  console.log(`🌱 Seeding ${count} prévisions budgétaires...`);

  const previsions: Partial<Prevision>[] = [];
  const now = new Date();
  const exercices = [2023, 2024, 2025];

  for (let i = 0; i < count; i++) {
    const montantPrevu = randomAmount(500000, 10000000);
    const montantEngage = Math.round((montantPrevu * randomAmount(0, 80)) / 100);
    const montantDisponible = montantPrevu - montantEngage;
    const exercice = randomChoice(exercices);

    const statuts: Array<'brouillon' | 'validee' | 'cloturee'> = [
      'brouillon',
      'validee',
      'cloturee',
    ];
    const statut =
      exercice < 2025
        ? randomChoice(['validee' as const, 'cloturee' as const])
        : randomChoice(statuts);

    const obs = Math.random() > 0.6 ? 'Prévision conforme au budget' : undefined;

    const prevision: Partial<Prevision> = {
      exercice,
      chapitreId: randomChoice(chapitreIds),
      mairieId: DEFAULT_MAIRIE_ID,
      montantPrevu,
      montantEngage,
      montantDisponible,
      statut,
      personnelId: randomChoice(personnelIds),
      createdAt: randomDate(new Date(exercice - 1, 10, 1), new Date(exercice, 0, 31)),
      updatedAt: now,
    };

    if (obs) {
      prevision.observations = obs;
    }

    // Associer éventuellement un sous-chapitre à la prévision si fourni
    if (sousChapitreIds && sousChapitreIds.length > 0 && Math.random() > 0.3) {
      prevision.sousChapitreId = randomChoice(sousChapitreIds);
    }

    previsions.push(prevision);
  }

  await db.previsions.bulkAdd(previsions as unknown as Prevision[]);
  console.log(`✅ ${count} prévisions créées`);
  return previsions;
}

export async function seedMandats(
  chapitreIds: number[],
  sousChapitreIds: number[],
  previsionIds: number[],
  personnelIds: number[],
  bordereauMandats: BordereauMandat[],
  count: number = 200,
) {
  console.log(`🌱 Seeding ${count} mandats de dépense...`);

  const beneficiaires = [
    'THEODULE DIRO LAHUET',
    'SANOGO OUMAR',
    'IDRISSA KONATE',
    'SORO TIÉGBÉ',
    'DIABY FANTA',
    'DANIEL TRABI',
    'ALI SANOGO',
    'AMINA ASSI ALEX-PARFAIT',
    'YOGOLI KOFFI',
    'RECEVEUR MUNICIPAL',
    'Société ÉLECTRICITÉ GÉNÉRALE',
    "Entreprise BTP CÔTE D'IVOIRE",
    'SARL FOURNITURES BUREAU',
    'Cabinet AUDIT CONSEIL',
    'Garage AUTO REPAIR',
  ];

  const objets = ['INDEMNITE DE FONCTION', 'TRANSP. & FRAIS DE MISSION', "Régie d'avance"];

  const modesPaiement: Array<'virement' | 'cheque' | 'especes' | 'autre'> = [
    'virement',
    'cheque',
    'especes',
    'autre',
  ];

  // Codes patrimoniaux possibles
  const patrimonials = ['21', '22', '23', '24', '211', '212', '213', '221', '231', '241', '242'];

  const mandats: Partial<Mandat>[] = [];
  const now = new Date();

  // Map pour suivre les mises à jour des bordereaux (nombre de mandats et montant total)
  const bordereauUpdates = new Map<number, { count: number; total: number }>();

  // Trier les bordereaux par date pour une meilleure répartition
  const sortedBordereaux = [...bordereauMandats].sort((a, b) => {
    const dateA = a.dateEmission ? new Date(a.dateEmission).getTime() : 0;
    const dateB = b.dateEmission ? new Date(b.dateEmission).getTime() : 0;
    return dateA - dateB;
  });

  for (let i = 0; i < count; i++) {
    // Choisir un bordereau aléatoirement
    const bordereau = randomChoice(sortedBordereaux);
    const exercice = bordereau.exercice;
    const bordereauId = bordereau.id;

    // La date du mandat doit être dans la période du bordereau
    // Le mandat doit être créé avant ou à la date d'émission du bordereau
    const bordereauDate = bordereau.dateEmission
      ? new Date(bordereau.dateEmission)
      : new Date(exercice, 11, 31);
    const startOfYear = new Date(exercice, 0, 1);

    // Date du mandat : entre le début de l'année et la date du bordereau
    const dateMandat = randomDate(startOfYear, bordereauDate);

    const numeroMandat = String(i + 1);
    const montant = randomAmount(5000, 500000);

    const statuts: Array<'emis' | 'paye'> = ['emis', 'paye'];
    // Les mandats liés à un bordereau fermé sont émis ou payés
    const statut =
      bordereau.statut === 'ferme'
        ? randomChoice(['emis' as const, 'paye' as const])
        : randomChoice(statuts);

    const numeroFacture =
      Math.random() > 0.3 ? `FACT-${String(randomAmount(1000, 9999)).padStart(4, '0')}` : undefined;
    const dateFacture = numeroFacture
      ? randomDate(new Date(dateMandat.getTime() - 30 * 24 * 60 * 60 * 1000), dateMandat)
      : undefined;

    const obs = Math.random() > 0.7 ? 'Mandat conforme' : undefined;
    const prevId = Math.random() > 0.2 ? randomChoice(previsionIds) : undefined;

    const mandat: Partial<Mandat> = {
      exercice,
      numeroMandat,
      numeroOrdre: i + 1,
      dateMandat,
      chapitreId: randomChoice(chapitreIds),
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

    // Ajouter le patrimonial (70% des mandats)
    const maybePatrimonial = Math.random() > 0.3 ? randomChoice(patrimonials) : undefined;
    if (maybePatrimonial) {
      mandat.patrimonial = maybePatrimonial;
    }

    // Lier le mandat au bordereau
    if (bordereauId) {
      mandat.bordereauMandatId = bordereauId;
    }

    const maybeSous = Math.random() > 0.2 ? randomChoice(sousChapitreIds) : undefined;
    if (maybeSous != null) {
      mandat.sousChapitreId = maybeSous;
    }

    if (prevId) {
      mandat.previsionId = prevId;
    }

    if (numeroFacture) {
      mandat.numeroFacture = numeroFacture;
    }

    if (dateFacture) {
      mandat.dateFacture = dateFacture;
    }

    if (obs) {
      mandat.observations = obs;
    }

    // Mettre à jour les statistiques du bordereau
    if (bordereauId) {
      const current = bordereauUpdates.get(bordereauId) || { count: 0, total: 0 };
      bordereauUpdates.set(bordereauId, {
        count: current.count + 1,
        total: current.total + montant,
      });
    }

    mandats.push(mandat);
  }

  await db.mandats.bulkAdd(mandats as unknown as Mandat[]);

  // Mettre à jour les bordereaux avec le nombre réel de mandats et le montant total
  for (const [id, stats] of bordereauUpdates.entries()) {
    await db.bordereauMandats.update(id, {
      nombreMandats: stats.count,
      montantTotal: stats.total,
      updatedAt: now,
    });
  }

  console.log(`✅ ${count} mandats créés et liés aux bordereaux`);
  return mandats;
}

export async function seedBordereauMandats(personnelIds: number[], count: number = 20) {
  console.log(`🌱 Seeding ${count} bordereaux d'émission des mandats...`);

  const bordereauMandats: Partial<BordereauMandat>[] = [];
  const now = new Date();

  // Créer des bordereaux répartis sur les exercices avec des dates cohérentes
  const exercices = [2023, 2024, 2025];
  let numeroGlobal = 1;

  for (let i = 0; i < count; i++) {
    const exercice = exercices[i % exercices.length]!;
    // Date d'émission répartie sur l'année
    const mois = Math.floor((i / count) * 12);
    const dateEmission = new Date(exercice, mois, randomAmount(1, 28));

    // Si c'est 2025 et la date dépasse maintenant, ajuster
    if (exercice === 2025 && dateEmission > now) {
      dateEmission.setTime(now.getTime() - randomAmount(1, 30) * 24 * 60 * 60 * 1000);
    }

    const statuts: Array<'ouvert' | 'ferme'> = ['ouvert', 'ferme'];
    // Les exercices passés sont fermés, l'année en cours peut être ouvert
    const statut = exercice < 2025 ? 'ferme' : randomChoice(statuts);

    const obs = Math.random() > 0.6 ? 'Bordereau conforme' : undefined;

    const bordereauMandat: Partial<BordereauMandat> = {
      numero: numeroGlobal++,
      exercice,
      dateEmission,
      mairieId: DEFAULT_MAIRIE_ID,
      montantTotal: 0, // Sera calculé après insertion des mandats
      nombreMandats: 0, // Sera calculé après insertion des mandats
      statut,
      personnelId: randomChoice(personnelIds),
      createdAt: dateEmission,
      updatedAt: now,
    };

    if (obs) {
      bordereauMandat.observations = obs;
    }

    bordereauMandats.push(bordereauMandat);
  }

  // Insérer les bordereaux et récupérer les IDs
  const insertedIds = await db.bordereauMandats.bulkAdd(
    bordereauMandats as unknown as BordereauMandat[],
    { allKeys: true },
  );

  // Retourner les bordereaux avec leurs IDs
  const result = bordereauMandats.map((b, index) => ({
    ...b,
    id: insertedIds[index],
  })) as BordereauMandat[];

  console.log(`✅ ${count} bordereaux mandats créés`);
  return result;
}



// =================================================================
//                SEEDERS APP5 - INVESTISSEMENTS
// =================================================================

export async function seedPrevisionsInvestissement(
  chapitreInvestIds: number[],
  personnelIds: number[],
  count: number = 20,
  sousChapitreInvestIds: number[] = [],
) {
  console.log(`🌱 Seeding ${count} prévisions d'investissement...`);

  const previsions: Omit<PrevisionInvestissement, 'id'>[] = [];
  const now = new Date();
  const exercices = [2023, 2024, 2025];

  for (let i = 0; i < count; i++) {
    const exercice = randomChoice(exercices);
    const chapitreId = randomChoice(chapitreInvestIds);

    const montantPrevu = randomAmount(1000000, 50000000);
    const montantEngage = randomAmount(0, montantPrevu);
    const montantDisponible = montantPrevu - montantEngage;

    const statuts: Array<'brouillon' | 'validee' | 'cloturee'> = [
      'brouillon',
      'validee',
      'cloturee',
    ];
    const statut = randomChoice(statuts);

    const prevision: Omit<PrevisionInvestissement, 'id'> = {
      exercice,
      chapitreInvestissementId: chapitreId,
      mairieId: DEFAULT_MAIRIE_ID,
      montantPrevu,
      montantEngage,
      montantDisponible,
      statut,
      personnelId: randomChoice(personnelIds),
      createdAt: randomDate(new Date(exercice, 0, 1), now),
      updatedAt: now,
    };

    // Ajouter sousChapitreInvestissementId seulement si défini
    if (Math.random() > 0.3 && sousChapitreInvestIds.length > 0) {
      prevision.sousChapitreInvestissementId = randomChoice(sousChapitreInvestIds);
    }

    previsions.push(prevision);
  }

  await db.previsionsInvestissement.bulkAdd(previsions as PrevisionInvestissement[]);
  console.log(`✅ ${count} prévisions d'investissement créées`);

  // Récupérer les prévisions créées avec leurs IDs
  const createdPrevisions = await db.previsionsInvestissement.toArray();
  return createdPrevisions;
}

export async function seedBordereauMandatsInvestissement(
  personnelIds: number[],
  count: number = 8,
) {
  console.log(`🌱 Seeding ${count} bordereaux mandats investissement...`);

  const bordereaux: Omit<BordereauMandatInvestissement, 'id'>[] = [];
  const now = new Date();
  const exercices = [2023, 2024, 2025];

  for (let i = 0; i < count; i++) {
    const exercice = randomChoice(exercices);
    const numero = i + 1;
    const dateEmission = randomDate(new Date(exercice, 0, 1), new Date(exercice, 11, 31));
    const statut: 'ouvert' | 'ferme' = Math.random() > 0.3 ? 'ferme' : 'ouvert';

    bordereaux.push({
      numero,
      exercice,
      dateEmission,
      mairieId: DEFAULT_MAIRIE_ID,
      montantTotal: 0,
      nombreMandats: 0,
      statut,
      personnelId: randomChoice(personnelIds),
      createdAt: randomDate(new Date(exercice, 0, 1), dateEmission),
      updatedAt: now,
    });
  }

  await db.bordereauMandatsInvestissement.bulkAdd(bordereaux as BordereauMandatInvestissement[]);

  console.log(`✅ ${count} bordereaux mandats investissement créés`);

  // Récupérer les bordereaux créés avec leurs IDs
  const createdBordereaux = await db.bordereauMandatsInvestissement.toArray();
  return createdBordereaux;
}

export async function seedMandatsInvestissement(
  chapitreInvestIds: number[],
  sousChapitreInvestIds: number[],
  previsionInvestIds: number[],
  personnelIds: number[],
  bordereauMandats: BordereauMandatInvestissement[],
  count: number = 50,
) {
  console.log(`🌱 Seeding ${count} mandats d'investissement...`);

  const beneficiaires = [
    'ENTREPRISE BTP AZAGUIE',
    'SARL CONSTRUCTION MODERNE',
    'ETS FOURNITURES ÉQUIPEMENTS',
    'CABINET ARCHITECTURE DESIGN',
    'SOCIÉTÉ TRAVAUX PUBLICS',
    'GARAGE VEHICULES MUNICIPAUX',
    'INFORMATIQUE SOLUTIONS CI',
    'MOBILIER BUREAU PRO',
  ];

  const objets = [
    'Acquisition terrain',
    'Construction bâtiment',
    'Achat véhicule',
    'Équipement informatique',
    'Mobilier de bureau',
    'Matériel technique',
    'Aménagement voirie',
  ];

  const modesPaiement: Array<'virement' | 'cheque' | 'especes' | 'autre'> = [
    'virement',
    'cheque',
    'autre',
  ];

  const mandats: Omit<MandatInvestissement, 'id'>[] = [];
  const now = new Date();

  const bordereauUpdates = new Map<number, { count: number; total: number }>();

  const sortedBordereaux = [...bordereauMandats].sort((a, b) => {
    const dateA = a.dateEmission ? new Date(a.dateEmission).getTime() : 0;
    const dateB = b.dateEmission ? new Date(b.dateEmission).getTime() : 0;
    return dateA - dateB;
  });

  for (let i = 0; i < count; i++) {
    const bordereau = randomChoice(sortedBordereaux);
    const exercice = bordereau.exercice;
    const bordereauId = bordereau.id;

    const bordereauDate = bordereau.dateEmission
      ? new Date(bordereau.dateEmission)
      : new Date(exercice, 11, 31);
    const startOfYear = new Date(exercice, 0, 1);

    const dateMandat = randomDate(startOfYear, bordereauDate);
    const numeroMandat = String(i + 1);
    const montant = randomAmount(100000, 10000000);

    const statuts: Array<'emis' | 'paye'> = ['emis', 'paye'];
    const statut =
      bordereau.statut === 'ferme'
        ? randomChoice(['emis' as const, 'paye' as const])
        : randomChoice(statuts);

    const numeroFacture =
      Math.random() > 0.3 ? `INV-${String(randomAmount(1000, 9999)).padStart(4, '0')}` : undefined;

    const mandat: Omit<MandatInvestissement, 'id'> = {
      numeroMandat,
      exercice,
      dateMandat,
      chapitreInvestissementId: randomChoice(chapitreInvestIds),
      mairieId: DEFAULT_MAIRIE_ID,
      objet: randomChoice(objets),
      beneficiaire: randomChoice(beneficiaires),
      montant,
      modePaiement: randomChoice(modesPaiement),
      statut,
      personnelId: randomChoice(personnelIds),
      createdAt: randomDate(startOfYear, dateMandat),
      updatedAt: now,
    };

    // Ajouter les propriétés optionnelles seulement si définies
    if (Math.random() > 0.3 && sousChapitreInvestIds.length > 0) {
      mandat.sousChapitreInvestissementId = randomChoice(sousChapitreInvestIds);
    }
    if (Math.random() > 0.2 && previsionInvestIds.length > 0) {
      mandat.previsionInvestissementId = randomChoice(previsionInvestIds);
    }
    if (bordereauId) {
      mandat.bordereauMandatInvestissementId = bordereauId;
    }
    if (numeroFacture) {
      mandat.numeroFacture = numeroFacture;
    }

    mandats.push(mandat);

    if (bordereauId && !bordereauUpdates.has(bordereauId)) {
      bordereauUpdates.set(bordereauId, { count: 0, total: 0 });
    }
    const update = bordereauId ? bordereauUpdates.get(bordereauId) : undefined;
    if (update) {
      update.count++;
      update.total += montant;
    }
  }

  await db.mandatsInvestissement.bulkAdd(mandats as MandatInvestissement[]);

  for (const [bordereauId, update] of bordereauUpdates) {
    await db.bordereauMandatsInvestissement.update(bordereauId, {
      nombreMandats: update.count,
      montantTotal: update.total,
    });
  }

  console.log(`✅ ${count} mandats d'investissement créés`);
  return mandats;
}
