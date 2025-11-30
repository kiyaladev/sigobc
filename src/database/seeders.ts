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
  type Chapitre,
  type SousChapitre,
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
 * Seeder pour les Chapitres principaux (App3)
 */
export async function seedChapitresPrincipaux(count: number = 8) {
  console.log(`🌱 Seeding ${count} chapitres principaux...`);

  const chapitresData = [
    { code: '01', libelle: 'SALAIRE ET INDEM.', description: 'Salaires et indemnités' },
    { code: '02', libelle: 'CHARGES SOCIALES', description: 'Charges sociales' },
    { code: '03', libelle: 'TRANSP. & FRAIS DE MISS.', description: 'Transport et frais de mission' },
    { code: '04', libelle: 'CARBUR. ET LUBRIF.', description: 'Carburant et lubrifiants' },
    { code: '05', libelle: 'MATERIEL ET FOURNIT.', description: 'Matériel et fournitures' },
    { code: '06', libelle: 'ABONN. EAU, ELEC, TELEPH.', description: 'Abonnements eau, électricité, téléphone' },
    { code: '07', libelle: "TRAVAUX & SCES A L'ENTREP.", description: "Travaux et services à l'entreprise" },
    { code: '08', libelle: 'INTERVEN ET TRANSF.', description: 'Interventions et transferts' },
  ];

  const rows: Chapitre[] = [];
  const now = new Date();

  for (let i = 0; i < Math.min(count, chapitresData.length); i++) {
    const data = chapitresData[i]!;
    rows.push({
      code: data.code,
      libelle: data.libelle,
      description: data.description,
      mairieId: DEFAULT_MAIRIE_ID,
      actif: true,
      createdAt: randomDate(new Date(2020, 0, 1), now),
      updatedAt: now,
    });
  }

  await db.chapitres.bulkAdd(rows);
  console.log(`✅ ${rows.length} chapitres principaux créés`);
  return rows;
}

/**
 * Seeder pour les Chapitres budgétaires (App3)
 */
export async function seedSousChapitres(count: number = 60) {
  console.log(`🌱 Seeding ${count} sous-chapitres budgétaires...`);

  const comptesData = [
    { code: '6000', libelle: 'ADMINISTRATION', description: 'Administration générale' },
    { code: '60010', libelle: 'FONCTIONNEMENT DU CONSEIL ET DES COMMISSIONS', description: 'Fonctionnement du Conseil et des commissions' },
    { code: '60011', libelle: 'FONCTIONNEMENT DE LA MUNICIPALITÉ', description: 'Fonctionnement de la municipalité' },
    { code: '60012', libelle: 'FONCTIONNEMENT CABINET DU MAIRE', description: 'Fonctionnement du Cabinet du Maire' },
    { code: '60013', libelle: 'INDEMNITÉS DE FONCTION ET DE REPRÉSENTATION', description: 'Indemnités de fonction et de représentation' },
    { code: '60015', libelle: 'FRAIS DE MISSIONS EN DEHORS DU TERRITOIRE NATIONALE', description: 'Frais de missions en dehors du territoire national' },
    { code: '60016', libelle: "AUTRES DÉPENSES AU TITRE DES AUTORITÉS MUNICIPALES", description: "Autres dépenses au titre des autorités municipales" },
    { code: '6002', libelle: 'ETAT CIVIL ET POPULATION', description: 'État civil et population' },
    { code: '6006', libelle: "AUTRES DÉPENSES D'ADMINISTRATION GÉNÉRALE", description: "Autres dépenses d'Administration générale" },
    { code: '6010', libelle: 'ADMINISTRATION', description: 'Administration financière et domaniale' },
    { code: '6016', libelle: 'AUTRES DÉPENSES RELATIVES AU DOMAINE COMMUNAL', description: 'Autres dépenses relatives au domaine communal' },
    { code: '6020', libelle: 'ADMINISTRATION', description: 'Recette municipale' },
    { code: '6021', libelle: 'FRAIS DE RECOUVREMENTS ET DE POURSUITES', description: 'Frais de recouvrements et de poursuites' },
    { code: '6031', libelle: 'GARDES MUNICIPAUX', description: 'Police et ordre public' },
    { code: '6100', libelle: 'ADMINISTRATION', description: 'Voiries et réseaux' },
    { code: '6101', libelle: 'VOIRIES-ROUTES-CHEMINS', description: 'Voiries - Routes - Chemins' },
    { code: '6131', libelle: "OPÉRATIONS D'ASSAINISSEMENT", description: "Opérations d'assainissement" },
    { code: '6133', libelle: 'NETTOIEMENT DE LA VOIRIE- ENLÈVEMENT DES ORDURES', description: 'Nettoiement de la voirie - Enlèvement des ordures' },
    { code: '6136', libelle: "AUTRES DÉPENSES D'HYGIÈNES ET SALUBRITÉ PUBLIQUE-HYDRAULIQUE", description: "Autres dépenses d'hygiènes et salubrité publique - hydraulique" },
    { code: '6141', libelle: 'PROTECTION CIVILE', description: 'Protection civile' },
    { code: '6151', libelle: 'CIMETIÈRES-INHUMATION-EXHUMATIONS-CREUSEMENTS DE FOSSES', description: 'Cimetières - Inhumation - Exhumations - Creusements de fosses' },
    { code: '6206', libelle: "AUTRES DÉPENSES D'ÉDUCATION", description: "Autres dépenses d'éducation" },
    { code: '6214', libelle: 'EVACUATIONS SANITAIRES-SERVICE AMBULANCE', description: 'Évacuations sanitaires - Service ambulance' },
    { code: '6216', libelle: "AUTRES DÉPENSES DE SANTÉ PUBLIQUE", description: "Autres dépenses de santé publique" },
    { code: '6223', libelle: 'HANDICAPÉS', description: 'Handicapés' },
    { code: '6224', libelle: 'AIDE FAMILIALE ,SOCIALE ET PERSONNES AGÉES', description: 'Aide familiale, sociale et personnes âgées' },
    { code: '6225', libelle: 'AIDE AUX INDIGENTS', description: 'Aide aux indigents' },
    { code: '6246', libelle: 'AUTRES DÉPENSES AU TITRE DES SPORTS ET LOISIRS', description: 'Autres dépenses au titre des sports et loisirs' },
    { code: '6250', libelle: 'ADMINISTRATION', description: 'Activités culturelles - Administration' },
    { code: '6256', libelle: 'AUTRES DÉPENSES AU TITRE DES ACTIVITÉS CULTURELLES', description: 'Autres dépenses au titre des activités culturelles' },
    { code: '6336', libelle: 'AUTRES DÉPENSES DE TRANSPORT ET COMMUNICATIONS', description: 'Autres dépenses de transport et communications' },
    { code: '6341', libelle: 'ABATTOIRS-CONSERVATION ET TRANSPORTS DE VIANDE', description: 'Abattoirs - Conservation et transports de viande' },
    { code: '6344', libelle: 'MARCHÉS', description: 'Marchés' },
    { code: '6406', libelle: 'AUTRES DETTES DE LA COMMUNE (OU DE LA VILLE )', description: 'Autres dettes de la commune (ou de la ville)' },
    { code: '6415', libelle: 'CONFÉRENCES INTERCOMMUNALES -ASSOCIATION DES VILLES ET COMMUNES', description: 'Conférences intercommunales - Association des villes et communes' },
    { code: '6416', libelle: 'AUTRES CONTRIBUTIONS ET TRANSFERTS', description: 'Autres contributions et transferts' },
    { code: '6420', libelle: 'RESPONSABILITÉ CIVILE', description: 'Responsabilité civile' },
    { code: '6422', libelle: 'ASSURANCES DES VÉHICULES', description: 'Assurances des véhicules' },
    { code: '6426', libelle: 'AUTRES ASSURANCES', description: 'Autres assurances' },
    { code: '6430', libelle: 'CÉRÉMONIES PUBLIQUES', description: 'Cérémonies publiques' },
    { code: '6431', libelle: 'FÊTES ET RÉCEPTIONS OFFICIELLES', description: 'Fêtes et réceptions officielles' },
    { code: '6441', libelle: "FONDS D'INVESTISSEMENT", description: "Fonds d'investissement" },
    { code: '6456', libelle: 'AUTRES REMBOURSEMENTS DIVERS', description: 'Autres remboursements divers' },
  ];

  const comptes: SousChapitre[] = [];
  const now = new Date();

  for (let i = 0; i < Math.min(count, comptesData.length); i++) {
    const data = comptesData[i]!;
    comptes.push({
      code: data.code,
      libelle: data.libelle,
      description: data.description,
      mairieId: DEFAULT_MAIRIE_ID,
      actif: true,
      createdAt: randomDate(new Date(2020, 0, 1), now),
      updatedAt: now,
    });
  }

  await db.sousChapitres.bulkAdd(comptes);
  console.log(`✅ ${comptes.length} sous-chapitres créés`);
  return comptes;
}

/**
 * Seeder pour les Prévisions budgétaires (App3)
 */
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

/**
 * Seeder pour les Mandats de dépense (App3)
 */
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
    sousChapitres?: number;
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
    chapitres = 8,
    sousChapitres = 43,
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
      db.sousChapitres.clear(),
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

    // Créer les chapitres principaux
    const chapitresCreated = await seedChapitresPrincipaux(chapitres);
    const chapitreIds = chapitresCreated.map((c) => c.id!);

    // Créer les sous-chapitres budgétaires
    const sousChapitresCreated = await seedSousChapitres(sousChapitres);
    const sousChapitreIds = sousChapitresCreated.map((s) => s.id!);

    // Créer les prévisions budgétaires
    const previsionsCreated = await seedPrevisions(chapitreIds, utilisateurIds, previsions);
    const previsionIds = previsionsCreated.map((p) => p.id!);

    // Créer les mandats de dépense
    await seedMandats(chapitreIds, sousChapitreIds, previsionIds, utilisateurIds, mandats);

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
    console.log(`   - Chapitres: ${chapitresCreated.length}`);
    console.log(`   - Sous-chapitres: ${sousChapitresCreated.length}`);
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
        chapitres: chapitresCreated.length,
        sousChapitres: sousChapitresCreated.length,
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
    | 'chapitres'
    | 'sousChapitres'
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

    case 'chapitres': {
      return seedChapitresPrincipaux(count);
    }

    case 'sousChapitres': {
      return seedSousChapitres(count);
    }

    case 'previsions': {
      const [chapitres, utilisateurs] = await Promise.all([
        db.chapitres.toArray(),
        db.utilisateurs.toArray(),
      ]);
      const chapitreIds = chapitres.map((c: Chapitre) => c.id!);
      const utilisateurIds = utilisateurs.map((u: Utilisateur) => u.id!);
      if (chapitreIds.length === 0 || utilisateurIds.length === 0) {
        throw new Error("Chapitres et utilisateurs requis. Créez-les d'abord.");
      }
      return seedPrevisions(chapitreIds, utilisateurIds, count);
    }

    case 'mandats': {
      const [chapitres, sousChaps, previsions, utilisateurs] = await Promise.all([
        db.chapitres.toArray(),
        db.sousChapitres.toArray(),
        db.previsions.toArray(),
        db.utilisateurs.toArray(),
      ]);
      const chapitreIds = chapitres.map((c: Chapitre) => c.id!);
      const sousChapitreIds = sousChaps.map((s: SousChapitre) => s.id!);
      const previsionIds = previsions.map((p: Prevision) => p.id!);
      const utilisateurIds = utilisateurs.map((u: Utilisateur) => u.id!);
      if (chapitreIds.length === 0 || utilisateurIds.length === 0) {
        throw new Error("Chapitres, prévisions et utilisateurs requis. Créez-les d'abord.");
      }
      return seedMandats(chapitreIds, sousChapitreIds, previsionIds, utilisateurIds, count);
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
