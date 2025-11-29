import {
  db,
  DEFAULT_MAIRIE_ID,
  type Mairie,
  type Taxe,
  type Declaration,
  type BordereauRecette,
  type Utilisateur,
  type Approvisionnement,
  type Remise,
  type Versement,
  type BalanceEntree,
  type Timbres,
  type Rubrique,
  type Chapitre,
  type Prevision,
  type Mandat,
  type BordereauMandat,
} from './db';

/**
 * Seeders pour générer des données de test
 */

// Fonction utilitaire pour générer une date aléatoire dans une plage
function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// Fonction utilitaire pour générer un montant aléatoire
function randomAmount(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Fonction utilitaire pour choisir un élément aléatoire dans un tableau
function randomChoice<T>(array: T[]): T {
  const index = Math.floor(Math.random() * array.length);
  return array[index]!;
}

/**
 * Seeder pour les Utilisateurs
 */
export async function seedUtilisateurs(count: number = 10) {
  console.log(`🌱 Seeding ${count} utilisateurs...`);

  const roles: Array<'admin' | 'gestionnaire' | 'operateur'> = [
    'admin',
    'gestionnaire',
    'operateur',
  ];
  const prenoms = [
    'Jean',
    'Marie',
    'Pierre',
    'Sophie',
    'Luc',
    'Anne',
    'Paul',
    'Julie',
    'Marc',
    'Emma',
  ];
  const noms = [
    'Dupont',
    'Martin',
    'Bernard',
    'Dubois',
    'Thomas',
    'Robert',
    'Richard',
    'Petit',
    'Durand',
    'Leroy',
  ];

  const utilisateurs: Utilisateur[] = [];
  const now = new Date();

  // Créer d'abord le compte admin par défaut
  utilisateurs.push({
    username: 'admin',
    password: 'admin123',
    nom: 'Administrateur',
    prenom: 'Système',
    email: 'admin@tresor.gov',
    role: 'admin',
    actif: true,
    createdAt: new Date(2023, 0, 1),
    updatedAt: now,
  });

  for (let i = 0; i < count; i++) {
    const prenom = randomChoice(prenoms);
    const nom = randomChoice(noms);
    const username = `${prenom.toLowerCase()}.${nom.toLowerCase()}${i}`;
    const derniereConnexion =
      Math.random() > 0.3 ? randomDate(new Date(2024, 0, 1), now) : undefined;

    utilisateurs.push({
      username,
      password: 'password123',
      nom,
      prenom,
      email: `${username}@tresor.gov`,
      role: randomChoice(roles),
      actif: Math.random() > 0.2, // 80% actifs
      ...(derniereConnexion && { derniereConnexion }),
      createdAt: randomDate(new Date(2023, 0, 1), now),
      updatedAt: now,
    });
  }

  await db.utilisateurs.bulkAdd(utilisateurs);
  console.log(`✅ ${count} utilisateurs créés`);
  return utilisateurs;
}

/**
 * Seeder pour la Mairie d'Azaguié (mairie unique)
 */
export async function seedMairies() {
  console.log(`🌱 Seeding Mairie d'Azaguié...`);

  const mairies: Mairie[] = [];
  const now = new Date();

  // Créer uniquement la Mairie d'Azaguié
  mairies.push({
    nom: "Mairie d'Azaguié",
    code: '422',
    adresse: 'Avenue Principale',
    ville: 'Azaguié',
    codePostal: '00225',
    telephone: '+225 XX XX XX XX',
    email: 'contact@mairie-azaguie.ci',
    createdAt: new Date(2020, 0, 1),
    updatedAt: now,
  });

  await db.mairies.bulkAdd(mairies);
  console.log(`✅ Mairie d'Azaguié créée`);
  return mairies;
}

/**
 * Seeder pour les Taxes
 */
export async function seedTaxes(count: number = 25) {
  console.log(`🌱 Seeding ${count} taxes...`);

  const nomsTaxesFixe = [
    'Taxe Foncière',
    "Taxe d'Habitation",
    'Taxe sur les Ordures Ménagères',
    'Redevance Assainissement',
    'Taxe de Séjour',
    'Droit de Place Marché',
  ];

  const nomsTaxesVariable = [
    'Taxe Professionnelle',
    'Contribution Économique Territoriale',
    'Taxe sur les Véhicules',
    'Taxe Publicité Extérieure',
  ];

  const taxes: Taxe[] = [];
  const now = new Date();

  // Taxes fixes
  for (let i = 0; i < count / 2; i++) {
    taxes.push({
      mairieId: DEFAULT_MAIRIE_ID,
      libelle: randomChoice(nomsTaxesFixe),
      code: `TXF${String(i + 1).padStart(3, '0')}`,
      type: 'fixe',
      montant: randomAmount(50, 500),
      description: 'Taxe à montant fixe',
      actif: true,
      createdAt: randomDate(new Date(2020, 0, 1), now),
      updatedAt: now,
    });
  }

  // Taxes variables
  for (let i = 0; i < count / 2; i++) {
    taxes.push({
      mairieId: DEFAULT_MAIRIE_ID,
      libelle: randomChoice(nomsTaxesVariable),
      code: `TXV${String(i + 1).padStart(3, '0')}`,
      type: 'variable',
      taux: randomAmount(5, 25) / 100, // 5% à 25%
      description: 'Taxe à taux variable',
      actif: true,
      createdAt: randomDate(new Date(2020, 0, 1), now),
      updatedAt: now,
    });
  }

  await db.taxes.bulkAdd(taxes);
  console.log(`✅ ${taxes.length} taxes créées`);
  return taxes;
}

/**
 * Seeder pour les Déclarations
 */
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

/**
 * Seeder pour les Bordereaux
 */
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

/**
 * ========== SEEDERS APP2 - GESTION DE LA TRÉSORERIE ==========
 */

/**
 * Seeder pour les Approvisionnements (App2)
 */
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

/**
 * Seeder pour les Remises (App2)
 */
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

/**
 * Seeder pour les Versements (App2)
 */
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

/**
 * Seeder pour les Balances d'Entrée (App2)
 */
export async function seedBalancesEntree(personnelIds: number[], count: number = 5) {
  console.log(`🌱 Seeding ${count} balances d'entrée...`);

  const balances: Partial<BalanceEntree>[] = [];
  const now = new Date();
  const exercices = [2023, 2024, 2025];

  for (let i = 0; i < count; i++) {
    const exercice = randomChoice(exercices);
    const date = new Date(exercice, 0, 1); // 1er janvier de l'exercice

    const types = ['INITIAL', 'BE-S1', 'BE-S2', 'BE-S3'];
    const type = types[i % types.length]!; // Cycle through types to ensure coverage

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

/**
 * ========== SEEDERS APP3 - GESTION DES DÉPENSES ==========
 */

/**
 * Seeder pour les Rubriques budgétaires (App3)
 */
export async function seedRubriques(count: number = 15) {
  console.log(`🌱 Seeding ${count} rubriques budgétaires...`);

  const chapitresData = [
    { code: '01', libelle: 'SALAIRE ET INDEM', description: 'Salaires et indemnités' },
    { code: '02', libelle: 'CHARGES SOCIALES', description: 'Charges sociales' },
    {
      code: '03',
      libelle: 'TRANSP. & FRAIS DE MISS.',
      description: 'Transport et frais de mission',
    },
    { code: '04', libelle: 'CARBUR. ET LUBRIF.', description: 'Carburant et lubrifiants' },
    { code: '05', libelle: 'MATERIEL ET FOURNIT', description: 'Matériel et fournitures' },
    {
      code: '06',
      libelle: 'ABONN. EAU, ELEC, TELEPH',
      description: 'Abonnements eau, électricité, téléphone',
    },
    {
      code: '07',
      libelle: "TRAVAUX & SCES A L'ENTREP",
      description: "Travaux et services à l'entreprise",
    },
    { code: '08', libelle: 'INTERVEN ET TRANSF.', description: 'Interventions et transferts' },
  ];

  const rubriques: Rubrique[] = [];
  const now = new Date();

  for (let i = 0; i < Math.min(count, chapitresData.length); i++) {
    const data = chapitresData[i]!;
    rubriques.push({
      code: data.code,
      libelle: data.libelle,
      description: data.description,
      mairieId: DEFAULT_MAIRIE_ID,
      actif: Math.random() > 0.1, // 90% actifs
      createdAt: randomDate(new Date(2020, 0, 1), now),
      updatedAt: now,
    });
  }

  await db.rubriques.bulkAdd(rubriques);
  console.log(`✅ ${rubriques.length} rubriques créées`);
  return rubriques;
}

/**
 * Seeder pour les Chapitres budgétaires (App3)
 */
export async function seedChapitres(rubriqueIds: number[], count: number = 60) {
  console.log(`🌱 Seeding ${count} chapitres budgétaires...`);

  const comptesData = [
    { code: '6000', libelle: 'Administration', description: 'Administration' },
    {
      code: '60010',
      libelle: 'Fonctionnement du Conseil et des commissions',
      description: 'Fonctionnement du Conseil et des commissions',
    },
    {
      code: '60011',
      libelle: 'Fonctionnement de la municipalité',
      description: 'Fonctionnement de la municipalité',
    },
    {
      code: '60012',
      libelle: 'Fonctionnement du Cabinet du Maire',
      description: 'Fonctionnement du Cabinet du Maire',
    },
    {
      code: '60013',
      libelle: 'Indemnités de fonction et de représentation',
      description: 'Indemnités de fonction et de représentation',
    },
    {
      code: '60015',
      libelle: 'Frais de missions en dehors du territoire national',
      description: 'Frais de missions en dehors du territoire national',
    },
    {
      code: '60016',
      libelle: 'Autres dépenses au titre des autorités municipales',
      description: 'Autres dépenses au titre des autorités municipales',
    },
    { code: '6002', libelle: 'État civil et population', description: 'État civil et population' },
    {
      code: '6006',
      libelle: "Autres dépenses d'Administration générale",
      description: "Autres dépenses d'Administration générale",
    },
    { code: '6010', libelle: 'Administration', description: 'Administration' },
    { code: '6020', libelle: 'Administration', description: 'Administration' },
    { code: '6031', libelle: 'Gardes municipaux', description: 'Gardes municipaux' },
    {
      code: '6033',
      libelle: 'Programmes spéciaux et Opérations diverses',
      description: 'Programmes spéciaux et Opérations diverses',
    },
    { code: '6100', libelle: 'Administration', description: 'Administration' },
    {
      code: '6101',
      libelle: 'Voiries - Routes - Chemins',
      description: 'Voiries - Routes - Chemins',
    },
    {
      code: '6133',
      libelle: 'Nettoiement de la voirie - Enlèvement des ordures',
      description: 'Nettoiement de la voirie - Enlèvement des ordures',
    },
    {
      code: '6141',
      libelle: 'Autres dettes de la commune',
      description: 'Autres dettes de la commune',
    },
    {
      code: '6142',
      libelle: 'Autres dettes de la commune',
      description: 'Autres dettes de la commune',
    },
    {
      code: '6152',
      libelle: 'Autres dettes de la commune',
      description: 'Autres dettes de la commune',
    },
    {
      code: '6201',
      libelle: "Autres dépenses d'éducation",
      description: "Autres dépenses d'éducation",
    },
    {
      code: '6206',
      libelle: "Autres dépenses d'éducation",
      description: "Autres dépenses d'éducation",
    },
    {
      code: '6224',
      libelle: 'Aide aux familiale, sociale',
      description: 'Aide aux familiale, sociale',
    },
    { code: '6225', libelle: 'Aide aux indigents', description: 'Aide aux indigents' },
    {
      code: '6226',
      libelle: "Autres dépenses d'Assistance Sociales",
      description: "Autres dépenses d'Assistance Sociales",
    },
    { code: '6242', libelle: 'Manifestations sportives', description: 'Manifestations sportives' },
    {
      code: '6246',
      libelle: 'Autres dépenses au titre des sports et loisirs',
      description: 'Autres dépenses au titre des sports et loisirs',
    },
    { code: '6250', libelle: 'Administration', description: 'Administration' },
    {
      code: '6256',
      libelle: 'Autres dépenses au titre des activités culturelles',
      description: 'Autres dépenses au titre des activités culturelles',
    },
    { code: '6301', libelle: 'Projets agricoles', description: 'Projets agricoles' },
    { code: '6306', libelle: 'Projets agricoles', description: 'Projets agricoles' },
    {
      code: '6336',
      libelle: 'Autres dépenses de transports et communications',
      description: 'Autres dépenses de transports et communications',
    },
    {
      code: '6341',
      libelle: 'Abattoir - conservation / Transport de viande',
      description: 'Abattoir - conservation / Transport de viande',
    },
    {
      code: '6406',
      libelle: 'Autres dettes de la commune',
      description: 'Autres dettes de la commune',
    },
    {
      code: '6415',
      libelle: 'Conférences intercommunales - Association des villes et communes',
      description: 'Conférences intercommunales - Association des villes et communes',
    },
    {
      code: '6416',
      libelle: 'Autres contributions et Transferts',
      description: 'Autres contributions et Transferts',
    },
    { code: '6420', libelle: 'Responsabilité civile', description: 'Responsabilité civile' },
    { code: '6421', libelle: 'Assurance du personnel', description: 'Assurance du personnel' },
    { code: '6422', libelle: 'Assurances des véhicules', description: 'Assurances des véhicules' },
    {
      code: '6426',
      libelle: 'Autres assurances (Assurances des élus)',
      description: 'Autres assurances (Assurances des élus)',
    },
    { code: '6430', libelle: 'Cérémonies publiques', description: 'Cérémonies publiques' },
    {
      code: '6431',
      libelle: 'Fêtes et réceptions officielles',
      description: 'Fêtes et réceptions officielles',
    },
    {
      code: '6440',
      libelle: 'Fonds de réserve ordinaire',
      description: 'Fonds de réserve ordinaire',
    },
    { code: '6441', libelle: "Fonds d'investissement", description: "Fonds d'investissement" },
    {
      code: '6451',
      libelle: 'Indemnités, Frais et dommages et Intérêts culturels et de promotion humaine',
      description: 'Indemnités, Frais et dommages et Intérêts culturels et de promotion humaine',
    },
  ];

  const comptes: Chapitre[] = [];
  const now = new Date();

  for (let i = 0; i < Math.min(count, comptesData.length); i++) {
    const data = comptesData[i]!;
    comptes.push({
      code: data.code,
      libelle: data.libelle,
      description: data.description,
      rubriqueId: randomChoice(rubriqueIds),
      mairieId: DEFAULT_MAIRIE_ID,
      actif: true,
      createdAt: randomDate(new Date(2020, 0, 1), now),
      updatedAt: now,
    });
  }

  await db.chapitres.bulkAdd(comptes);
  console.log(`✅ ${comptes.length} chapitres créés`);
  return comptes;
}

/**
 * Seeder pour les Prévisions budgétaires (App3)
 */
export async function seedPrevisions(
  rubriqueIds: number[],
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
      rubriqueId: randomChoice(rubriqueIds),
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

/**
 * Seeder pour les Mandats de dépense (App3)
 */
export async function seedMandats(
  rubriqueIds: number[],
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
      rubriqueId: randomChoice(rubriqueIds),
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

/**
 * Seeder pour les Bordereaux d'émission des mandats (App3)
 */
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

/**
 * Fonction principale pour exécuter tous les seeders
 */
export async function runAllSeeders(
  options: {
    utilisateurs?: number;
    mairies?: number;
    taxes?: number;
    declarations?: number;
    bordereaux?: number;
    // App2
    approvisionnements?: number;
    remises?: number;
    versements?: number;
    balancesEntree?: number;
    // App3
    chapitres?: number;
    previsions?: number;
    mandats?: number;
    bordereauMandats?: number;
  } = {},
) {
  console.log('🚀 Démarrage des seeders...');

  const {
    utilisateurs = 10,

    taxes = 25,
    declarations = 100,
    bordereaux = 80,
    // App2
    approvisionnements = 20,
    remises = 50,
    versements = 60,
    balancesEntree = 2,
    // App3
    chapitres = 15,
    previsions = 30,
    mandats = 100,
    bordereauMandats = 20,
  } = options;

  try {
    // Vider les tables existantes
    console.log('🗑️  Nettoyage des tables...');
    await Promise.all([
      db.utilisateurs.clear(),
      db.mairies.clear(),
      db.taxes.clear(),
      db.declarations.clear(),
      db.bordereauxRecette.clear(),
      // App2
      db.approvisionnements.clear(),
      db.remises.clear(),
      db.versements.clear(),
      db.balancesEntree.clear(),
      // App3
      db.chapitres.clear(),
      db.previsions.clear(),
      db.mandats.clear(),
      db.bordereauMandats.clear(),
    ]);

    // Créer les utilisateurs
    const utilisateursCreated = await seedUtilisateurs(utilisateurs);
    const utilisateurIds = utilisateursCreated.map((u) => u.id!);

    // Créer la Mairie d'Azaguié (mairie unique)
    const mairiesCreated = await seedMairies();

    // Créer les taxes
    const taxesCreated = await seedTaxes(taxes);
    const taxeIds = taxesCreated.map((t) => t.id!);

    // Créer les bordereaux
    const bordereauxCreated = await seedBordereaux(utilisateurIds, bordereaux);

    // Créer les déclarations
    await seedDeclarations(
      taxeIds,
      utilisateurIds,
      bordereauxCreated as BordereauRecette[],
      declarations, // count of declarations to create
    );

    // App2 - Gestion de la Trésorerie
    console.log('\n💰 Seeders App2 - Gestion de la Trésorerie');

    // Créer les approvisionnements
    await seedApprovisionnements(utilisateurIds, approvisionnements);

    // Créer les remises
    await seedRemises(utilisateurIds, remises);

    //  Créer les versements
    await seedVersements(utilisateurIds, versements);

    // Créer les balances d'entrée
    await seedBalancesEntree(utilisateurIds, balancesEntree);

    // App3 - Gestion des Dépenses
    console.log('\n📦 Seeders App3 - Gestion des Dépenses');

    // Créer les rubriques budgétaires (ex-chapitres)
    const rubriquesCreated = await seedRubriques(chapitres);
    const rubriqueIds = rubriquesCreated.map((c) => c.id!);

    // Créer les chapitres budgétaires (ex-comptes)
    const chapitresCreated = await seedChapitres(rubriqueIds, chapitres);

    // Créer les prévisions budgétaires
    const previsionsCreated = await seedPrevisions(rubriqueIds, utilisateurIds, previsions);
    const previsionIds = previsionsCreated.map((p) => p.id!);

    // Créer les mandats de dépense
    await seedMandats(rubriqueIds, previsionIds, utilisateurIds, mandats);

    // Créer les bordereaux d'émission des mandats
    await seedBordereauMandats(utilisateurIds, bordereauMandats);

    console.log('\n✨ Tous les seeders ont été exécutés avec succès !');
    console.log('📊 Statistiques :');
    console.log('   App1 - Déclarations & Bordereaux:');
    console.log(`   - Utilisateurs: ${utilisateurs}`);
    console.log(`   - Mairies: ${mairiesCreated.length}`);
    console.log(`   - Taxes: ${taxesCreated.length}`);
    console.log(`   - Déclarations: ${declarations}`);
    console.log(`   - Bordereaux: ${bordereaux}`);
    console.log('   App2 - Gestion de la Trésorerie:');
    console.log(`   - Approvisionnements: ${approvisionnements}`);
    console.log(`   - Remises: ${remises}`);
    console.log(`   - Versements: ${versements}`);
    console.log('   App3 - Gestion des Dépenses:');
    console.log(`   - Rubriques: ${rubriquesCreated.length}`);
    console.log(`   - Chapitres: ${chapitresCreated.length}`);
    console.log(`   - Prévisions: ${previsions}`);
    console.log(`   - Mandats: ${mandats}`);
    console.log(`   - Bordereaux Mandats: ${bordereauMandats}`);

    return {
      success: true,
      counts: {
        utilisateurs,
        mairies: mairiesCreated.length,
        taxes: taxesCreated.length,
        declarations,
        bordereaux,
        approvisionnements,
        remises,
        versements,
        rubriques: rubriquesCreated.length,
        chapitres: chapitresCreated.length,
        previsions,
        mandats,
        bordereauMandats,
      },
    };
  } catch (error) {
    console.error("❌ Erreur lors de l'exécution des seeders:", error);
    throw error;
  }
}

/**
 * Fonction pour seed uniquement une table spécifique
 */
export async function seedTable(
  table:
    | 'utilisateurs'
    | 'mairies'
    | 'taxes'
    | 'declarations'
    | 'bordereaux'
    | 'approvisionnements'
    | 'remises'
    | 'versements'
    | 'rubriques'
    | 'chapitres'
    | 'previsions'
    | 'mandats'
    | 'bordereauMandats',
  count?: number,
) {
  switch (table) {
    case 'utilisateurs':
      return seedUtilisateurs(count);

    case 'mairies':
      return seedMairies();

    case 'declarations': {
      const [taxes, utilisateurs] = await Promise.all([
        db.taxes.toArray(),
        db.utilisateurs.toArray(),
      ]);
      const taxeIds = taxes.map((t: Taxe) => t.id!);
      const utilisateurIds = utilisateurs.map((u: Utilisateur) => u.id!);
      if (taxeIds.length === 0 || utilisateurIds.length === 0) {
        throw new Error("Taxes et utilisateurs requis. Créez-les d'abord.");
      }
      return seedDeclarations(taxeIds, utilisateurIds, [], count);
    }

    case 'bordereaux': {
      const utilisateurs = await db.utilisateurs.toArray();
      const utilisateurIds = utilisateurs.map((u: Utilisateur) => u.id!);
      if (utilisateurIds.length === 0) {
        throw new Error("Utilisateurs requis. Créez-les d'abord.");
      }
      return seedBordereaux(utilisateurIds, count);
    }

    // App2 - Gestion de la Trésorerie
    case 'approvisionnements': {
      const utilisateurs = await db.utilisateurs.toArray();
      const utilisateurIds = utilisateurs.map((u: Utilisateur) => u.id!);
      if (utilisateurIds.length === 0) {
        throw new Error("Utilisateurs requis. Créez-les d'abord.");
      }
      return seedApprovisionnements(utilisateurIds, count);
    }

    case 'remises': {
      const utilisateurs = await db.utilisateurs.toArray();
      const utilisateurIds = utilisateurs.map((u: Utilisateur) => u.id!);
      if (utilisateurIds.length === 0) {
        throw new Error("Utilisateurs requis. Créez-les d'abord.");
      }
      return seedRemises(utilisateurIds, count);
    }

    case 'versements': {
      const utilisateurs = await db.utilisateurs.toArray();
      const utilisateurIds = utilisateurs.map((u: Utilisateur) => u.id!);
      if (utilisateurIds.length === 0) {
        throw new Error("Utilisateurs requis. Créez-les d'abord.");
      }
      return seedVersements(utilisateurIds, count);
    }

    // App3 - Gestion des Dépenses
    case 'rubriques': {
      return seedRubriques(count);
    }

    case 'chapitres': {
      const rubriques = await db.rubriques.toArray();
      const rubriqueIds = rubriques.map((r: Rubrique) => r.id!);
      if (rubriqueIds.length === 0) {
        throw new Error("Rubriques requises. Créez-les d'abord.");
      }
      return seedChapitres(rubriqueIds, count);
    }

    case 'previsions': {
      const [rubriques, utilisateurs] = await Promise.all([
        db.rubriques.toArray(),
        db.utilisateurs.toArray(),
      ]);
      const rubriqueIds = rubriques.map((c: Rubrique) => c.id!);
      const utilisateurIds = utilisateurs.map((u: Utilisateur) => u.id!);
      if (rubriqueIds.length === 0 || utilisateurIds.length === 0) {
        throw new Error("Rubriques et utilisateurs requis. Créez-les d'abord.");
      }
      return seedPrevisions(rubriqueIds, utilisateurIds, count);
    }

    case 'mandats': {
      const [rubriques, previsions, utilisateurs] = await Promise.all([
        db.rubriques.toArray(),
        db.previsions.toArray(),
        db.utilisateurs.toArray(),
      ]);
      const rubriqueIds = rubriques.map((c: Rubrique) => c.id!);
      const previsionIds = previsions.map((p: Prevision) => p.id!);
      const utilisateurIds = utilisateurs.map((u: Utilisateur) => u.id!);
      if (rubriqueIds.length === 0 || utilisateurIds.length === 0) {
        throw new Error("Rubriques, prévisions et utilisateurs requis. Créez-les d'abord.");
      }
      return seedMandats(rubriqueIds, previsionIds, utilisateurIds, count);
    }

    case 'bordereauMandats': {
      const utilisateurs = await db.utilisateurs.toArray();
      const utilisateurIds = utilisateurs.map((u: Utilisateur) => u.id!);
      if (utilisateurIds.length === 0) {
        throw new Error("Utilisateurs requis. Créez-les d'abord.");
      }
      return seedBordereauMandats(utilisateurIds, count);
    }
  }
}
