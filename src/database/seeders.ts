import { db, DEFAULT_MAIRIE_ID, type Quotite } from './db';
import type {
  Declaration,
  BordereauRecette,
  Approvisionnement,
  Remise,
  Versement,
  BalanceEntree,
  Timbres,
  Prevision,
  Mandat,
  BordereauMandat,
} from './db';

// =================================================================
//                      SEEDERS DE DONNÉES PAR DÉFAUT
// =================================================================

/**
 * Remplit la base de données avec les données initiales et essentielles.
 * C'est l'équivalent de la fonction `initializeDatabase` mais externalisée.
 */
export async function seedDefaultData() {
  console.log('🌱 Seeding default data...');
  await clearDatabase();

  const now = new Date();

  // 1. Mairie par défaut
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

  // 2. Utilisateur admin par défaut
  await db.utilisateurs.add({
    username: 'admin',
    password: 'admin123', // Doit être hashé en production
    nom: 'Administrateur',
    prenom: 'Système',
    email: 'admin@tresor.sn',
    role: 'admin',
    actif: true,
    createdAt: now,
    updatedAt: now,
  });

  // 3. Taxes par défaut
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

  // 4. Chapitres par défaut (App3)
  await db.chapitres.bulkAdd([
    { code: '6011', libelle: 'Fournitures de bureau', mairieId: mairieId as number, actif: true, createdAt: now, updatedAt: now },
    { code: '6012', libelle: 'Fournitures informatiques', mairieId: mairieId as number, actif: true, createdAt: now, updatedAt: now },
    { code: '6013', libelle: 'SALAIRE ET INDEM.', mairieId: mairieId as number, actif: true, createdAt: now, updatedAt: now },
    { code: '6014', libelle: 'CHARGES SOCIALES', mairieId: mairieId as number, actif: true, createdAt: now, updatedAt: now },
    { code: '6015', libelle: 'TRANSP. & FRAIS DE MISS.', mairieId: mairieId as number, actif: true, createdAt: now, updatedAt: now },
    { code: '6016', libelle: 'CARBUR. & LUBRIF.', mairieId: mairieId as number, actif: true, createdAt: now, updatedAt: now },
    { code: '6017', libelle: 'MATERIEL ET FOURNIT.', mairieId: mairieId as number, actif: true, createdAt: now, updatedAt: now },
    { code: '6018', libelle: 'ABONN. EAU, ELEC, TELEPH.', mairieId: mairieId as number, actif: true, createdAt: now, updatedAt: now },
    { code: '6019', libelle: 'TRAVAUX & SCES A L\'ENTREP.', mairieId: mairieId as number, actif: true, createdAt: now, updatedAt: now },
    { code: '6020', libelle: 'INTERVEN ET TRANSF.', mairieId: mairieId as number, actif: true, createdAt: now, updatedAt: now },
  ]);

  // 5. Sous-chapitres par défaut (App3)
  await db.sousChapitres.bulkAdd([
    { code: '6000', libelle: 'ADMINISTRATION', mairieId: mairieId as number, actif: true, createdAt: now, updatedAt: now },
    { code: '60010', libelle: 'FONCTIONNEMENT DU CONSEIL ET DES COMMISSIONS', mairieId: mairieId as number, actif: true, createdAt: now, updatedAt: now },
    { code: '60011', libelle: 'FONCTIONNEMENT DE LA MUNICIPALITÉ', mairieId: mairieId as number, actif: true, createdAt: now, updatedAt: now },
    { code: '60012', libelle: 'FONCTIONNEMENT CABINET DU MAIRE', mairieId: mairieId as number, actif: true, createdAt: now, updatedAt: now },
    { code: '60013', libelle: 'INDEMNITÉS DE FONCTION ET DE REPRÉSENTATION', mairieId: mairieId as number, actif: true, createdAt: now, updatedAt: now },
    { code: '60015', libelle: 'FRAIS DE MISSIONS EN DEHORS DU TERRITOIRE NATIONALE', mairieId: mairieId as number, actif: true, createdAt: now, updatedAt: now },
    { code: '60016', libelle: 'AUTRES DÉPENSES AU TITRE DES AUTORITÉS MUNICIPALES', mairieId: mairieId as number, actif: true, createdAt: now, updatedAt: now },
    { code: '6002', libelle: 'ETAT CIVIL ET POPULATION', mairieId: mairieId as number, actif: true, createdAt: now, updatedAt: now },
    { code: '6006', libelle: "AUTRES DÉPENSES D'ADMINISTRATION GÉNÉRALE", mairieId: mairieId as number, actif: true, createdAt: now, updatedAt: now },
    { code: '6010', libelle: 'ADMINISTRATION', mairieId: mairieId as number, actif: true, createdAt: now, updatedAt: now },
    { code: '6016', libelle: 'AUTRES DÉPENSES RELATIVES AU DOMAINE COMMUNAL', mairieId: mairieId as number, actif: true, createdAt: now, updatedAt: now },
    { code: '6020', libelle: 'ADMINISTRATION', mairieId: mairieId as number, actif: true, createdAt: now, updatedAt: now },
    { code: '6021', libelle: 'FRAIS DE RECOUVREMENTS ET DE POURSUITES', mairieId: mairieId as number, actif: true, createdAt: now, updatedAt: now },
    { code: '6031', libelle: 'GARDES MUNICIPAUX', mairieId: mairieId as number, actif: true, createdAt: now, updatedAt: now },
    { code: '6100', libelle: 'ADMINISTRATION', mairieId: mairieId as number, actif: true, createdAt: now, updatedAt: now },
    { code: '6101', libelle: 'VOIRIES-ROUTES-CHEMINS', mairieId: mairieId as number, actif: true, createdAt: now, updatedAt: now },
    { code: '6131', libelle: "OPÉRATIONS D'ASSAINISSEMENT", mairieId: mairieId as number, actif: true, createdAt: now, updatedAt: now },
    { code: '6133', libelle: 'NETTOIEMENT DE LA VOIRIE- ENLÈVEMENT DES ORDURES', mairieId: mairieId as number, actif: true, createdAt: now, updatedAt: now },
    { code: '6136', libelle: "AUTRES DÉPENSES D'HYGIÈNES ET SALUBRITÉ PUBLIQUE-HYDRAULIQUE", mairieId: mairieId as number, actif: true, createdAt: now, updatedAt: now },
    { code: '6141', libelle: 'PROTECTION CIVILE', mairieId: mairieId as number, actif: true, createdAt: now, updatedAt: now },
    { code: '6151', libelle: 'CIMETIÈRES-INHUMATION-EXHUMATIONS-CREUSEMENTS DE FOSSES', mairieId: mairieId as number, actif: true, createdAt: now, updatedAt: now },
    { code: '6206', libelle: "AUTRES DÉPENSES D'ÉDUCATION", mairieId: mairieId as number, actif: true, createdAt: now, updatedAt: now },
    { code: '6214', libelle: 'EVACUATIONS SANITAIRES-SERVICE AMBULANCE', mairieId: mairieId as number, actif: true, createdAt: now, updatedAt: now },
    { code: '6216', libelle: 'AUTRES DÉPENSES DE SANTÉ PUBLIQUE', mairieId: mairieId as number, actif: true, createdAt: now, updatedAt: now },
    { code: '6223', libelle: 'HANDICAPÉS', mairieId: mairieId as number, actif: true, createdAt: now, updatedAt: now },
    { code: '6224', libelle: 'AIDE FAMILIALE ,SOCIALE ET PERSONNES AGÉES', mairieId: mairieId as number, actif: true, createdAt: now, updatedAt: now },
    { code: '6225', libelle: 'AIDE AUX INDIGENTS', mairieId: mairieId as number, actif: true, createdAt: now, updatedAt: now },
    { code: '6246', libelle: 'AUTRES DÉPENSES AU TITRE DES SPORTS ET LOISIRS', mairieId: mairieId as number, actif: true, createdAt: now, updatedAt: now },
    { code: '6250', libelle: 'ADMINISTRATION', mairieId: mairieId as number, actif: true, createdAt: now, updatedAt: now },
    { code: '6256', libelle: 'AUTRES DÉPENSES AU TITRE DES ACTIVITÉS CULTURELLES', mairieId: mairieId as number, actif: true, createdAt: now, updatedAt: now },
    { code: '626', libelle: 'AUTRES DEPENSES DES SERVICES SOCIAUX ,CULTURELS ET DE PROMOTION HUMAINE', mairieId: mairieId as number, actif: true, createdAt: now, updatedAt: now },
    { code: '6336', libelle: 'AUTRES DÉPENSES DE TRANSPORT ET COMMUNICATIONS', mairieId: mairieId as number, actif: true, createdAt: now, updatedAt: now },
    { code: '6341', libelle: 'ABATTOIRS-CONSERVATION ET TRANSPORTS DE VIANDE', mairieId: mairieId as number, actif: true, createdAt: now, updatedAt: now },
    { code: '6344', libelle: 'MARCHÉS', mairieId: mairieId as number, actif: true, createdAt: now, updatedAt: now },
    { code: '6406', libelle: 'AUTRES DETTES DE LA COMMUNE (OU DE LA VILLE )', mairieId: mairieId as number, actif: true, createdAt: now, updatedAt: now },
    { code: '6415', libelle: 'CONFÉRENCES INTERCOMMUNALES -ASSOCIATION DES VILLES ET COMMUNES', mairieId: mairieId as number, actif: true, createdAt: now, updatedAt: now },
    { code: '6416', libelle: 'AUTRES CONTRIBUTIONS ET TRANSFERTS', mairieId: mairieId as number, actif: true, createdAt: now, updatedAt: now },
    { code: '6420', libelle: 'RESPONSABILITÉ CIVILE', mairieId: mairieId as number, actif: true, createdAt: now, updatedAt: now },
    { code: '6422', libelle: 'ASSURANCES DES VÉHICULES', mairieId: mairieId as number, actif: true, createdAt: now, updatedAt: now },
    { code: '6426', libelle: 'AUTRES ASSURANCES', mairieId: mairieId as number, actif: true, createdAt: now, updatedAt: now },
    { code: '6430', libelle: 'CÉRÉMONIES PUBLIQUES', mairieId: mairieId as number, actif: true, createdAt: now, updatedAt: now },
    { code: '6431', libelle: 'FÊTES ET RÉCEPTIONS OFFICIELLES', mairieId: mairieId as number, actif: true, createdAt: now, updatedAt: now },
    { code: '6441', libelle: "FONDS D'INVESTISSEMENT", mairieId: mairieId as number, actif: true, createdAt: now, updatedAt: now },
    { code: '6456', libelle: 'AUTRES REMBOURSEMENTS DIVERS', mairieId: mairieId as number, actif: true, createdAt: now, updatedAt: now },
  ]);

  // 6. Quotités par défaut (App2)
  await db.quotites.bulkAdd([
    { code: 'TM', prix: 100, description: 'Ticket', type: 'Marché', mairieId: mairieId as number, actif: true, createdAt: now, updatedAt: now },
    { code: 'TA', prix: 100, description: 'Ticket', type: 'Abattoirs', mairieId: mairieId as number, actif: true, createdAt: now, updatedAt: now },
    { code: 'TS', prix: 100, description: 'Ticket', type: 'Stationnement', mairieId: mairieId as number, actif: true, createdAt: now, updatedAt: now },
  ]);

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

// ... etc. pour toutes les autres fonctions de génération

/**
 * Options pour le seeder de données de test.
 */
export interface SeedOptions {
  utilisateurs?: number;
  taxes?: number;
  declarations?: number;
  bordereaux?: number;
  approvisionnements?: number;
  remises?: number;
  versements?: number;
  balancesEntree?: number;
  chapitres?: number;
  sousChapitres?: number;
  previsions?: number;
  mandats?: number;
  bordereauMandats?: number;
  quotites?: number;
}

/**
 * Remplit la base de données avec une grande quantité de données de test aléatoires.
 */
export async function seedTestData(options: SeedOptions = {}) {
  console.log('🚀 Starting test data seeders...');

  const {
    declarations = 100,
    bordereaux = 80,
    approvisionnements = 20,
    remises = 50,
    versements = 60,
    balancesEntree = 2,
    previsions = 30,
    mandats = 100,
    bordereauMandats = 20,
    quotites = 10,
  } = options;

  try {
    // Il est recommandé de partir d'une base propre (ou de données par défaut)
    await seedDefaultData();
    console.log('Default data seeded before adding test data.');

    // On récupère les IDs nécessaires après le seeding par défaut
    const utilisateursCreated = await db.utilisateurs.toArray();
    const utilisateurIds = utilisateursCreated.map((u) => u.id!);
    const taxesCreated = await db.taxes.toArray();
    const taxeIds = taxesCreated.map((t) => t.id!);
    const chapitresCreated = await db.chapitres.toArray();
    const chapitreIds = chapitresCreated.map((c) => c.id!);
    const sousChapitresCreated = await db.sousChapitres.toArray();
    const sousChapitreIds = sousChapitresCreated.map((s) => s.id!);


    // Génération des données de test supplémentaires
    // Note: les fonctions ci-dessous sont les anciennes fonctions de seeders.ts
    // qui génèrent des données aléatoires.
    // Pour l'instant, on simule leur exécution.
    console.log(`🌱 Seeding ${bordereaux} test bordereaux...`);
    const bordereauxCreated = await seedBordereaux(utilisateurIds, bordereaux);
    console.log(`🌱 Seeding ${declarations} test declarations...`);
    await seedDeclarations(taxeIds, utilisateurIds, bordereauxCreated as BordereauRecette[], declarations);
    console.log(`🌱 Seeding ${approvisionnements} test approvisionnements...`);
    await seedApprovisionnements(utilisateurIds, approvisionnements);
    console.log(`🌱 Seeding ${remises} test remises...`);
    await seedRemises(utilisateurIds, remises);
    console.log(`🌱 Seeding ${versements} test versements...`);
    await seedVersements(utilisateurIds, versements);
    console.log(`🌱 Seeding ${balancesEntree} test balances...`);
    await seedBalancesEntree(utilisateurIds, balancesEntree);
    console.log(`🌱 Seeding ${previsions} test previsions...`);
    const previsionsCreated = await seedPrevisions(chapitreIds, utilisateurIds, previsions);
    const previsionIds = previsionsCreated.map((p) => p.id!);
    console.log(`🌱 Seeding ${mandats} test mandats...`);
    await seedMandats(chapitreIds, sousChapitreIds, previsionIds, utilisateurIds, mandats);
    console.log(`🌱 Seeding ${bordereauMandats} test bordereau mandats...`);
    await seedBordereauMandats(utilisateurIds, bordereauMandats);
    console.log(`🌱 Seeding ${quotites} test quotites...`);
    await seedQuotites(quotites);


    console.log('\n✨ All test data seeders have been executed successfully!');
  } catch (error) {
    console.error("❌ Error during test data seeding:", error);
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
  await Promise.all([
    db.mairies.clear(),
    db.taxes.clear(),
    db.declarations.clear(),
    db.bordereauxRecette.clear(),
    db.utilisateurs.clear(),
    db.approvisionnements.clear(),
    db.remises.clear(),
    db.versements.clear(),
    db.balancesEntree.clear(),
    db.quotites.clear(),
    db.chapitres.clear(),
    db.sousChapitres.clear(),
    db.previsions.clear(),
    db.mandats.clear(),
    db.bordereauMandats.clear(),
  ]);
  console.log('✅ All tables cleared.');
}


// On garde les fonctions de génération de l'ancien seeder.ts ici
// pour que seedTestData puisse les utiliser.

export async function seedBordereaux(personnelIds: number[], count: number = 80) {
  console.log(`🌱 Seeding ${count} bordereaux...`);

  const statutsBordereau: Array<'ouvert' | 'ferme'> = ['ouvert', 'ferme'];

  const bordereaux: Partial<BordereauRecette>[] = [];
  const now = new Date();
  const startDate = new Date(2023, 0, 1);

  for (let i = 0; i < count; i++) {
    const annee = randomAmount(2023, 2025);
    const statut = randomChoice(statutsBordereau);
    const personnelId = randomChoice(personnelIds);

    const obs = Math.random() > 0.6 ? 'Bordereau conforme' : undefined;

    const bordereau: Partial<BordereauRecette> = {
      personnelId,
      mairieId: DEFAULT_MAIRIE_ID,
      numero: i + 1,
      annee,
      montantTotal: 0,
      nombreDeclarations: 0,
      statut,
      createdAt: randomDate(startDate, now),
      updatedAt: now,
    };

    if (obs) {
      bordereau.observations = obs;
    }

    bordereaux.push(bordereau);
  }

  await db.bordereauxRecette.bulkAdd(bordereaux as BordereauRecette[]);
  console.log(`✅ ${count} bordereaux créés`);
  return bordereaux;
}

export async function seedDeclarations(
  taxeIds: number[],
  personnelIds: number[],
  bordereaux: BordereauRecette[],
  count: number = 100,
) {
  console.log(`🌱 Seeding ${count} déclarations...`);

  const declarations: Partial<Declaration>[] = [];
  const now = new Date();
  const startDate = new Date(2023, 0, 1);

  // Map to track bordereau updates
  const bordereauUpdates = new Map<number, { count: number; total: number }>();

  for (let i = 0; i < count; i++) {
    const montantHT = randomAmount(1000, 50000);
    const montantTaxe = Math.round((montantHT * randomAmount(5, 20)) / 100);
    const montantTTC = montantHT + montantTaxe;

    // Choose a bordereau (100% chance if bordereaux exist)
    const assignBordereau = bordereaux.length > 0;
    let bordereauId: number | undefined;
    let exercice = new Date(randomDate(startDate, now)).getFullYear();
    let dateEncaissement = randomDate(new Date(exercice, 0, 1), new Date(exercice, 11, 31));

    if (assignBordereau) {
      const bordereau = randomChoice(bordereaux);
      if (bordereau && bordereau.id) {
        bordereauId = bordereau.id;
        exercice = bordereau.annee; // Match exercice with bordereau year
        // Date encaissement must be in that year
        dateEncaissement = randomDate(new Date(exercice, 0, 1), new Date(exercice, 11, 31));

        // Update stats
        const current = bordereauUpdates.get(bordereauId) || { count: 0, total: 0 };
        bordereauUpdates.set(bordereauId, {
          count: current.count + 1,
          total: current.total + montantTTC,
        });
      }
    }

    const personnelId = randomChoice(personnelIds);
    const obs = Math.random() > 0.7 ? 'Observations diverses sur la déclaration' : undefined;

    const declaration: Partial<Declaration> = {
      personnelId,
      mairieId: DEFAULT_MAIRIE_ID,
      taxeId: randomChoice(taxeIds),
      exercice,
      numeroPiece: String(i + 1),
      nomPartieVersante: `Contribuable ${String(i + 1).padStart(4, '0')}`,
      adresse: `${randomChoice(['Rue', 'Avenue', 'Boulevard'])} ${Math.floor(Math.random() * 100)} ${randomChoice(['Dakar', 'Thiès', 'Saint-Louis'])}`,
      dateEncaissement,
      numeroLivre: 'T31T',
      numeroEncaissement: `ENC-${String(i + 1).padStart(6, '0')}`,
      montantRecette: montantTTC,
      statut: 'validee',
      createdAt: dateEncaissement,
      updatedAt: now,
    };

    if (bordereauId) {
      declaration.bordereauId = bordereauId;
    }

    if (obs) {
      declaration.observations = obs;
    }

    declarations.push(declaration as Declaration);
  }

  await db.declarations.bulkAdd(declarations as Declaration[]);

  // Update bordereaux
  for (const [id, stats] of bordereauUpdates.entries()) {
    await db.bordereauxRecette.update(id, {
      nombreDeclarations: stats.count,
      montantTotal: stats.total,
    });
  }

  console.log(`✅ ${count} déclarations créées et liées aux bordereaux`);
  return declarations;
}

export async function seedApprovisionnements(personnelIds: number[], count: number = 20) {
  console.log(`🌱 Seeding ${count} approvisionnements...`);

  const approvisionnements: Partial<Approvisionnement>[] = [];
  const now = new Date();
  const exercices = [2023, 2024, 2025];

  for (let i = 0; i < count; i++) {
    const exercice = randomChoice(exercices);
    const date = randomDate(
      new Date(exercice, 0, 1),
      exercice === 2025 ? now : new Date(exercice, 11, 31),
    );
    const type = 'appro';
    // Générer des quantités aléatoires pour chaque valeur de timbre
    const timbres: Timbres = {
      100: randomAmount(100, 1000),
      200: randomAmount(80, 800),
      300: randomAmount(50, 500),
      500: randomAmount(30, 300),
      600: randomAmount(20, 200),
      1000: randomAmount(10, 100),
    };

    // Calculer le total
    const total = 
      timbres[100] * 100 +
      timbres[200] * 200 +
      timbres[300] * 300 +
      timbres[500] * 500 +
      timbres[600] * 600 +
      timbres[1000] * 1000;

    const obs =
      Math.random() > 0.7 ? `Approvisionnement ${type} de l'exercice ${exercice}` : undefined;

    const approvisionnement: Partial<Approvisionnement> = {
      mairieId: DEFAULT_MAIRIE_ID,
      exercice,
      date,
      type,
      timbres,
      total,
      personnelId: randomChoice(personnelIds),
      createdAt: date,
      updatedAt: now,
    };

    if (obs) {
      approvisionnement.observations = obs;
    }

    approvisionnements.push(approvisionnement);
  }

  await db.approvisionnements.bulkAdd(approvisionnements as unknown as Approvisionnement[]);
  console.log(`✅ ${count} approvisionnements créés`);
  return approvisionnements;
}

export async function seedRemises(personnelIds: number[], count: number = 50) {
  console.log(`🌱 Seeding ${count} remises...`);

  const remises: Partial<Remise>[] = [];
  const now = new Date();
  const exercices = [2023, 2024, 2025];

  for (let i = 0; i < count; i++) {
    const exercice = randomChoice(exercices);
    const date = randomDate(
      new Date(exercice, 0, 1),
      exercice === 2025 ? now : new Date(exercice, 11, 31),
    );
    const numeroRemise = `REM-${exercice}-${String(i + 1).padStart(4, '0')}`;

    // Générer des quantités aléatoires pour chaque valeur de timbre
    const timbres: Timbres = {
      100: randomAmount(50, 500),
      200: randomAmount(40, 400),
      300: randomAmount(30, 300),
      500: randomAmount(20, 200),
      600: randomAmount(10, 100),
      1000: randomAmount(5, 50),
    };

    // Calculer le total
    const total = 
      timbres[100] * 100 +
      timbres[200] * 200 +
      timbres[300] * 300 +
      timbres[500] * 500 +
      timbres[600] * 600 +
      timbres[1000] * 1000;

    const obs = Math.random() > 0.6 ? `Remise de l'imprimerie nationale` : undefined;

    const remise: Partial<Remise> = {
      mairieId: DEFAULT_MAIRIE_ID,
      exercice,
      date,
      numeroRemise,
      timbres,
      total,
      personnelId: randomChoice(personnelIds),
      createdAt: date,
      updatedAt: now,
    };

    if (obs) {
      remise.observations = obs;
    }

    remises.push(remise);
  }

  await db.remises.bulkAdd(remises as unknown as Remise[]);
  console.log(`✅ ${count} remises créées`);
  return remises;
}

export async function seedVersements(personnelIds: number[], count: number = 60) {
  console.log(`🌱 Seeding ${count} versements...`);

  const versements: Partial<Versement>[] = [];
  const now = new Date();
  const exercices = [2023, 2024, 2025];

  for (let i = 0; i < count; i++) {
    const exercice = randomChoice(exercices);
    const date = randomDate(
      new Date(exercice, 0, 1),
      exercice === 2025 ? now : new Date(exercice, 11, 31),
    );
    const numeroVersement = `VERS-${exercice}-${String(i + 1).padStart(4, '0')}`;

    // Générer des quantités aléatoires pour chaque valeur de timbre (vendus)
    const timbres: Timbres = {
      100: randomAmount(20, 200),
      200: randomAmount(15, 150),
      300: randomAmount(10, 100),
      500: randomAmount(8, 80),
      600: randomAmount(5, 50),
      1000: randomAmount(2, 20),
    };

    // Calculer le total
    const total = 
      timbres[100] * 100 +
      timbres[200] * 200 +
      timbres[300] * 300 +
      timbres[500] * 500 +
      timbres[600] * 600 +
      timbres[1000] * 1000;

    const obs = Math.random() > 0.7 ? `Versement journalier` : undefined;

    const versement: Partial<Versement> = {
      mairieId: DEFAULT_MAIRIE_ID,
      exercice,
      date,
      numeroVersement,
      timbres,
      total,
      personnelId: randomChoice(personnelIds),
      createdAt: date,
      updatedAt: now,
    };

    if (obs) {
      versement.observations = obs;
    }

    versements.push(versement);
  }

  await db.versements.bulkAdd(versements as unknown as Versement[]);
  console.log(`✅ ${count} versements créés`);
  return versements;
}

export async function seedBalancesEntree(personnelIds: number[], count: number = 5) {
  console.log(`🌱 Seeding ${count} balances d'entrée...`);

  const balances: Partial<BalanceEntree>[] = [];
  const now = new Date();
  const exercices = [2023, 2024, 2025];

  for (let i = 0; i < count; i++) {
    const exercice = randomChoice(exercices);
    const date = new Date(exercice, 0, 1); // 1er janvier de l'exercice

    const types = ['INITIAL', 'BE-S1', 'BE-S2', 'BE-S3'];
    const type = types[i % types.length]!;

    // Générer des quantités aléatoires pour le stock initial
    const timbres: Timbres = {
      100: randomAmount(500, 2000),
      200: randomAmount(400, 1500),
      300: randomAmount(300, 1000),
      500: randomAmount(200, 800),
      600: randomAmount(100, 500),
      1000: randomAmount(50, 300),
    };

    // Calculer le total
    const total = 
      timbres[100] * 100 +
      timbres[200] * 200 +
      timbres[300] * 300 +
      timbres[500] * 500 +
      timbres[600] * 600 +
      timbres[1000] * 1000;

    const balance: Partial<BalanceEntree> = {
      mairieId: DEFAULT_MAIRIE_ID,
      exercice,
      date,
      type,
      timbres,
      total,
      commentaires: `Stock initial de l'exercice ${exercice}`,
      personnelId: randomChoice(personnelIds),
      createdAt: date,
      updatedAt: now,
    };

    balances.push(balance);
  }

  await db.balancesEntree.bulkAdd(balances as unknown as BalanceEntree[]);
  console.log(`✅ ${count} balances d'entrée créées`);
  return balances;
}

export async function seedPrevisions(
  chapitreIds: number[],
  personnelIds: number[],
  count: number = 30,
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
  count: number = 100,
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

  const objets = [
    'INDEMNITE DE FONCTION',
    'TRANSP. & FRAIS DE MISSION',
    "Régie d'avance",
    'Fournitures de bureau',
    'Travaux de réparation',
    'Maintenance informatique',
    'Carburant véhicules de service',
    'Frais de communication',
    'Honoraires consultant',
    'Achats matériel technique',
  ];

  const modesPaiement: Array<'virement' | 'cheque' | 'especes' | 'autre'> = [
    'virement',
    'cheque',
    'especes',
    'autre',
  ];

  const mandats: Partial<Mandat>[] = [];
  const now = new Date();

  for (let i = 0; i < count; i++) {
    const exercice = randomAmount(2023, 2025);
    const dateMandat = randomDate(
      new Date(exercice, 0, 1),
      exercice === 2025 ? now : new Date(exercice, 11, 31),
    );

    const numeroMandat = `M${exercice}-${String(i + 1).padStart(4, '0')}`;
    const montant = randomAmount(5000, 500000);

    const statuts: Array<'brouillon' | 'emis' | 'paye' | 'annule'> = [
      'brouillon',
      'emis',
      'paye',
      'annule',
    ];
    const statut =
      exercice < 2025 ? randomChoice(['emis' as const, 'paye' as const]) : randomChoice(statuts);

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

    mandats.push(mandat);
  }

  await db.mandats.bulkAdd(mandats as unknown as Mandat[]);
  console.log(`✅ ${count} mandats créés`);
  return mandats;
}

export async function seedBordereauMandats(personnelIds: number[], count: number = 20) {
  console.log(`🌱 Seeding ${count} bordereaux d'émission des mandats...`);

  const bordereauMandats: Partial<BordereauMandat>[] = [];
  const now = new Date();

  for (let i = 0; i < count; i++) {
    const exercice = randomAmount(2023, 2025);
    const dateEmission = randomDate(
      new Date(exercice, 0, 1),
      exercice === 2025 ? now : new Date(exercice, 11, 31),
    );

    const numero = i + 1;
    const nombreMandats = randomAmount(3, 15);
    const montantTotal = randomAmount(100000, 2000000);

    const statuts: Array<'ouvert' | 'ferme'> = ['ouvert', 'ferme'];
    const statut = exercice < 2025 ? 'ferme' : randomChoice(statuts);

    const obs = Math.random() > 0.6 ? 'Bordereau conforme' : undefined;

    const bordereauMandat: Partial<BordereauMandat> = {
      numero,
      exercice,
      dateEmission,
      mairieId: DEFAULT_MAIRIE_ID,
      montantTotal,
      nombreMandats,
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

  await db.bordereauMandats.bulkAdd(bordereauMandats as unknown as BordereauMandat[]);
  console.log(`✅ ${count} bordereaux mandats créés`);
  return bordereauMandats;
}

export async function seedQuotites(count: number = 10) {
  console.log(`🌱 Seeding ${count} quotités...`);

  const quotites: Partial<Quotite>[] = [];
  const now = new Date();
  const types = ['Marché', 'Abattoirs', 'Stationnement', 'Publicité', 'Occupation Voie Publique'];
  const descriptions = ['Ticket', 'Macaron', 'Droit de place', 'Autocollant'];

  for (let i = 0; i < count; i++) {
    const type = randomChoice(types);
    const prix = randomChoice([100, 200, 300, 500, 1000, 2000]);
    const code = `${type.substring(0, 2).toUpperCase()}${prix}`;

    const quotite: Partial<Quotite> = {
      code,
      prix,
      description: randomChoice(descriptions),
      type,
      mairieId: DEFAULT_MAIRIE_ID,
      actif: Math.random() > 0.2, // 80% chance of being active
      createdAt: randomDate(new Date(2023, 0, 1), now),
      updatedAt: now,
    };
    quotites.push(quotite);
  }

  await db.quotites.bulkAdd(quotites as Quotite[]);
  console.log(`✅ ${count} quotités créées`);
  return quotites;
}