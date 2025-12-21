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

  // 4. Sous-chapitres par défaut (App3) - Hiérarchisé
  console.log('🌱 Seeding sous-chapitres (hierarchical)...');

  const sousChapitresData = [
    { code: '60', libelle: 'SECTION 60- DEPENSES DES SERVICES GENERAUX', parent: null },
    { code: '600', libelle: 'CHAP. ADMINISTRATION GENERALE', parent: '60' },
    { code: '6000', libelle: 'ADMINISTRATION', parent: '600' },
    { code: '6001', libelle: 'AUTORITES MUNICIPALES', parent: '600' },
    { code: '60010', libelle: 'FONCTIONNEMENT CONSEILS ET COMMISSIONS', parent: '6001' },
    { code: '60011', libelle: 'FONCTIONNEMENT DE LA MUNICIPALITE', parent: '6001' },
    { code: '60012', libelle: 'FONCTIONNEMENT CABINET DU MAIRE', parent: '6001' },
    { code: '60013', libelle: 'INDEMNITE DE FONCTION ET DE REPRESENTATION', parent: '6001' },
    { code: '6002', libelle: 'ETAT CIVIL ET POPULATION', parent: '600' },
    { code: '6006', libelle: "AUTRES DEPENSES D'ADMINISTRATION GENERALE", parent: '600' },
    { code: '601', libelle: 'CHAP. 601- ADMINISTRATION FINANCIERE ET DOM.', parent: '60' },
    { code: '6010', libelle: 'ADMINISTRATION', parent: '601' },
    { code: '602', libelle: 'CHAP. 602-RECETTE MUNICIPALE', parent: '60' },
    { code: '6020', libelle: 'ADMINISTRATION', parent: '602' },
    { code: '61', libelle: 'SECTION 61- DEPENSES DES SERVICES DE COLLECTIVITE', parent: null },
    { code: '610', libelle: 'CHAP. 610-VOIRIES ET RESEAUX', parent: '61' },
    { code: '6100', libelle: 'ADMINISTRATION', parent: '610' },
    { code: '62', libelle: 'SECTION 62- DEPENSES DES SERVICES SOCIAUX', parent: null },
    { code: '620', libelle: 'CHAP. 620- EDUCATION', parent: '62' },
    { code: '6201', libelle: "Crèche, jardin d'enfants et ecoles primaire", parent: '620' },
    { code: '63', libelle: 'SECTION 63- DEPENSES DES SERVICES ECONOMIQUES', parent: null },
    { code: '64', libelle: 'SECTION 64 - DEPENSES DIVERSES', parent: null },
    { code: '640', libelle: 'CHAP. 640- DETTES', parent: '64' },
    { code: '6406', libelle: 'AUTRES DETTES DE LA COMMUNE', parent: '640' },
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

    if (sousChapitreIds.length > 0 && Math.random() > 0.3) {
      prevision.sousChapitreId = randomChoice(sousChapitreIds);
    }

    previsions.push(prevision);
  }

  await db.previsions.bulkAdd(previsions as Prevision[]);
  console.log(`✅ ${count} prévisions créées`);

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
  count: number = 200,
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

  const mandats: Partial<Mandat>[] = [];
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
    const montant = randomAmount(5000, 500000);

    const statuts: Array<'emis' | 'paye'> = ['emis', 'paye'];
    const statut = bordereau.statut === 'ferme' ? randomChoice(statuts) : randomChoice(statuts);

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

    if (bordereauId) {
      mandat.bordereauMandatId = bordereauId;
    }

    if (sousChapitreIds.length > 0 && Math.random() > 0.2) {
      mandat.sousChapitreId = randomChoice(sousChapitreIds);
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

  await db.mandats.bulkAdd(mandats as Mandat[]);

  for (const [id, stats] of bordereauUpdates.entries()) {
    await db.bordereauMandats.update(id, {
      nombreMandats: stats.count,
      montantTotal: stats.total,
      updatedAt: now,
    });
  }

  console.log(`✅ ${count} mandats créés et liés aux bordereaux`);
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
