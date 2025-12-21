import { db, DEFAULT_MAIRIE_ID } from './db';
import type { Chapitre, SousChapitre, Prevision, Mandat, BordereauMandat } from './db';
import type {
  ChapitreInvestissement,
  PrevisionInvestissement,
  MandatInvestissement,
  BordereauMandatInvestissement,
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
  mandatsInvest?: number;
  bordereauMandatsInvest?: number;
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

  // 5. Seed Investissements Chapitres (App5)
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
  ]);

  // 6. Seed Investissements Sous-Chapitres (App5)
  console.log('🌱 Seeding default investissement sous-chapitres...');
  const chapitres = await db.chapitresInvestissement.toArray();
  const getChapId = (code: string) =>
    chapitres.find((c: ChapitreInvestissement) => c.code === code)?.id;

  await db.sousChapitresInvestissement.bulkAdd([
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
      code: '231',
      libelle: 'VEHICULES AUTOMOBILES',
      chapitreInvestissementId: getChapId('23')!,
      mairieId: mairieId as number,
      actif: true,
      createdAt: now,
      updatedAt: now,
    },
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
      code: '251',
      libelle: 'MOBILIER DE BUREAU',
      chapitreInvestissementId: getChapId('25')!,
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
    mandats = 200,
    bordereauMandats = 20,
    mandatsInvest = 50,
    bordereauMandatsInvest = 8,
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
    const sousChapitreIds = sousChapitresCreated.map((s) => s.id!);

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

    // Seeding mandats
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

    console.log(`🌱 Seeding ${bordereauMandatsInvest} test bordereau mandats investissement...`);
    const bordereauMandatsInvestCreated = await seedBordereauMandatsInvestissement(
      utilisateurIds,
      bordereauMandatsInvest,
    );

    console.log(`🌱 Seeding ${mandatsInvest} test mandats investissement...`);
    await seedMandatsInvestissement(
      chapitreInvestIds,
      sousChapitreInvestIds,
      utilisateurIds,
      bordereauMandatsInvestCreated,
      mandatsInvest,
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

  try {
    await db.mandats.clear();
    await db.bordereauMandats.clear();
    await db.previsions.clear();
    await db.sousChapitres.clear();
    await db.chapitres.clear();

    await db.mandatsInvestissement.clear();
    await db.bordereauMandatsInvestissement.clear();
    await db.previsionsInvestissement.clear();
    await db.sousChapitresInvestissement.clear();
    await db.chapitresInvestissement.clear();

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

async function seedPrevisions(
  chapitreIds: number[],
  personnelIds: number[],
  count: number = 30,
  sousChapitreIds: number[] = [],
) {
  const previsions: Partial<Prevision>[] = [];
  const exercices = [2023, 2024];

  // En 2025: créer une prévision pour CHAQUE combinaison sous-chapitre/chapitre
  // Chaque sous-chapitre doit avoir les 8 chapitres:
  // 1-Salaires, 2-Charges sociales, 3-Transport, 4-Carburants,
  // 5-Matériels, 6-Abonnements, 7-Travaux, 8-Interventions
  console.log('🌱 Creating previsions 2025 for all sous-chapitres with all 8 chapitres...');

  for (const sousChapitreId of sousChapitreIds) {
    for (const chapitreId of chapitreIds) {
      const montantPrevu = randomAmount(500000, 15000000);
      const montantEngage = Math.round((montantPrevu * randomAmount(5, 50)) / 100);
      const montantDisponible = montantPrevu - montantEngage;

      const prevision: Partial<Prevision> = {
        exercice: 2025,
        chapitreId,
        sousChapitreId,
        mairieId: DEFAULT_MAIRIE_ID,
        montantPrevu,
        montantEngage,
        montantDisponible,
        statut: 'validee',
        personnelId: randomChoice(personnelIds),
        createdAt: new Date(2024, 11, 15),
        updatedAt: now,
      };

      previsions.push(prevision);
    }
  }

  const previsions2025Count = previsions.length;
  console.log(
    `📊 ${previsions2025Count} prévisions 2025 créées (${sousChapitreIds.length} sous-chapitres x ${chapitreIds.length} chapitres)`,
  );

  // Ajouter quelques prévisions pour 2023/2024 (historique)
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
    `✅ ${previsions.length} prévisions créées au total (${previsions2025Count} pour 2025 + ${historicalCount} historiques)`,
  );

  const created = await db.previsions.toArray();
  return created;
}

async function seedBordereauMandats(personnelIds: number[], count: number = 20) {
  const bordereauMandats: Partial<BordereauMandat>[] = [];
  const exercices = [2023, 2024, 2025];
  let numeroGlobal = 1;

  for (let i = 0; i < count; i++) {
    const exercice = exercices[i % exercices.length]!;
    const mois = Math.floor((i / count) * 12);
    const dateEmission = new Date(exercice, mois, randomAmount(1, 28));

    if (exercice === 2025 && dateEmission > now) {
      dateEmission.setTime(now.getTime() - randomAmount(1, 30) * 24 * 60 * 60 * 1000);
    }

    const statuts: Array<'ouvert' | 'ferme'> = ['ouvert', 'ferme'];
    const statut = exercice < 2025 ? 'ferme' : randomChoice(statuts);

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
  _count: number = 200, // Ignoré, on génère 3 mandats par couple chapitre/sous-chapitre
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

  // Générer 3 mandats pour chaque couple chapitre/sous-chapitre
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

        // Tous les mandats sont en décembre 2025
        const exercice = 2025;
        const startOfDecember = new Date(2025, 11, 1); // 1er décembre 2025
        const endOfDecember = new Date(2025, 11, 21); // 21 décembre 2025 (date actuelle)
        const dateMandat = randomDate(startOfDecember, endOfDecember);

        const numeroMandat = String(numeroOrdre);
        const montant = randomAmount(5000, 500000);

        const statuts: Array<'emis' | 'paye'> = ['emis', 'paye'];
        const statut = bordereau.statut === 'ferme' ? randomChoice(statuts) : randomChoice(statuts);

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

  await db.mandats.bulkAdd(mandats as Mandat[]);

  for (const [id, stats] of bordereauUpdates.entries()) {
    await db.bordereauMandats.update(id, {
      nombreMandats: stats.count,
      montantTotal: stats.total,
      updatedAt: now,
    });
  }

  console.log(
    `✅ ${mandats.length} mandats créés (${MANDATS_PAR_COUPLE} par couple chapitre/sous-chapitre: ${chapitreIds.length} chapitres x ${sousChapitreIds.length} sous-chapitres)`,
  );
}

async function seedBordereauMandatsInvestissement(personnelIds: number[], count: number = 8) {
  const bordereaux: Partial<BordereauMandatInvestissement>[] = [];
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

  const created = await db.bordereauMandatsInvestissement.toArray();
  return created;
}

async function seedMandatsInvestissement(
  chapitreInvestIds: number[],
  sousChapitreInvestIds: number[],
  personnelIds: number[],
  bordereauMandats: BordereauMandatInvestissement[],
  count: number = 50,
) {
  const beneficiaires = [
    'ENTREPRISE BTP AZAGUIE',
    'SARL CONSTRUCTION MODERNE',
    'ETS FOURNITURES ÉQUIPEMENTS',
    'SOCIÉTÉ TRAVAUX PUBLICS',
    'INFORMATIQUE SOLUTIONS CI',
  ];

  const objets = [
    'Acquisition terrain',
    'Construction bâtiment',
    'Achat véhicule',
    'Équipement informatique',
    'Mobilier de bureau',
  ];
  const modesPaiement: Array<'virement' | 'cheque' | 'especes' | 'autre'> = [
    'virement',
    'cheque',
    'autre',
  ];

  const mandats: Partial<MandatInvestissement>[] = [];
  const bordereauUpdates = new Map<number, { count: number; total: number }>();

  for (let i = 0; i < count; i++) {
    const bordereau = randomChoice(bordereauMandats);
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
    const statut = bordereau.statut === 'ferme' ? randomChoice(statuts) : randomChoice(statuts);

    const mandat: Partial<MandatInvestissement> = {
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

    if (sousChapitreInvestIds.length > 0 && Math.random() > 0.3) {
      mandat.sousChapitreInvestissementId = randomChoice(sousChapitreInvestIds);
    }

    if (bordereauId) {
      mandat.bordereauMandatInvestissementId = bordereauId;
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

  await db.mandatsInvestissement.bulkAdd(mandats as MandatInvestissement[]);

  for (const [bordereauId, update] of bordereauUpdates) {
    await db.bordereauMandatsInvestissement.update(bordereauId, {
      nombreMandats: update.count,
      montantTotal: update.total,
    });
  }

  console.log(`✅ ${count} mandats d'investissement créés`);
}
