import {
  db,
  type Mairie,
  type Taxe,
  type Declaration,
  type Bordereau,
  type Utilisateur,
  type Chapitre,
  type Prevision,
  type Mandat,
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
 * Seeder pour les Mairies
 */
export async function seedMairies(count: number = 15) {
  console.log(`🌱 Seeding ${count} mairies...`);

  const prefixes = ['Commune de', 'Ville de', 'Mairie de'];
  const villes = [
    'Saint-Denis',
    'Saint-Paul',
    'Le Tampon',
    'Saint-Pierre',
    'Saint-André',
    'Saint-Benoît',
    'Le Port',
    'Saint-Louis',
    'Saint-Joseph',
    'Sainte-Marie',
    'Sainte-Suzanne',
    'Saint-Leu',
    'Entre-Deux',
    'Cilaos',
    'Salazie',
  ];

  const mairies: Mairie[] = [];
  const now = new Date();

  for (let i = 0; i < Math.min(count, villes.length); i++) {
    const ville = villes[i]!;
    mairies.push({
      nom: `${randomChoice(prefixes)} ${ville}`,
      code: `MAI${String(i + 1).padStart(3, '0')}`,
      adresse: `${randomAmount(1, 200)} Avenue de la République`,
      ville,
      codePostal: `97${randomAmount(400, 499)}`,
      telephone: `0262 ${randomAmount(20, 99)} ${randomAmount(10, 99)} ${randomAmount(10, 99)}`,
      email: `mairie.${ville.toLowerCase().replace(/[- ]/g, '')}@reunion.fr`,
      createdAt: randomDate(new Date(2020, 0, 1), now),
      updatedAt: now,
    });
  }

  await db.mairies.bulkAdd(mairies);
  console.log(`✅ ${mairies.length} mairies créées`);
  return mairies;
}

/**
 * Seeder pour les Taxes
 */
export async function seedTaxes(mairieIds: number[], count: number = 25) {
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
      mairieId: randomChoice(mairieIds),
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
      mairieId: randomChoice(mairieIds),
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
  mairieIds: number[],
  taxeIds: number[],
  personnelIds: number[],
  count: number = 100,
) {
  console.log(`🌱 Seeding ${count} déclarations...`);

  const declarations: Partial<Declaration>[] = [];
  const now = new Date();
  const startDate = new Date(2023, 0, 1);

  for (let i = 0; i < count; i++) {
    const montantHT = randomAmount(1000, 50000);
    const montantTaxe = Math.round((montantHT * randomAmount(5, 20)) / 100);
    const montantTTC = montantHT + montantTaxe;
    const dateEncaissement = randomDate(startDate, now);
    const personnelId = randomChoice(personnelIds);

    const obs = Math.random() > 0.7 ? 'Observations diverses sur la déclaration' : undefined;

    const declaration: Partial<Declaration> = {
      personnelId,
      mairieId: randomChoice(mairieIds),
      taxeId: randomChoice(taxeIds),
      exercice: new Date(dateEncaissement).getFullYear(),
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

    if (obs) {
      declaration.observations = obs;
    }

    declarations.push(declaration as Declaration);
  }

  await db.declarations.bulkAdd(declarations as Declaration[]);
  console.log(`✅ ${count} déclarations créées`);
  return declarations;
}

/**
 * Seeder pour les Bordereaux
 */
export async function seedBordereaux(
  mairieIds: number[],
  personnelIds: number[],
  count: number = 80,
) {
  console.log(`🌱 Seeding ${count} bordereaux...`);

  const statutsBordereau: Array<'ouvert' | 'ferme'> = ['ouvert', 'ferme'];

  const bordereaux: Partial<Bordereau>[] = [];
  const now = new Date();
  const startDate = new Date(2023, 0, 1);

  for (let i = 0; i < count; i++) {
    const montantTotal = randomAmount(10000, 200000);
    const annee = randomAmount(2023, 2025);
    const statut = randomChoice(statutsBordereau);
    const personnelId = randomChoice(personnelIds);

    const obs = Math.random() > 0.6 ? 'Bordereau conforme' : undefined;

    const bordereau: Partial<Bordereau> = {
      personnelId,
      mairieId: randomChoice(mairieIds),
      numero: i + 1,
      annee,
      montantTotal,
      nombreDeclarations: randomAmount(5, 30),
      statut,
      createdAt: randomDate(startDate, now),
      updatedAt: now,
    };

    if (obs) {
      bordereau.observations = obs;
    }

    bordereaux.push(bordereau);
  }

  await db.bordereaux.bulkAdd(bordereaux as Bordereau[]);
  console.log(`✅ ${count} bordereaux créés`);
  return bordereaux;
}

/**
 * Seeder pour les Chapitres budgétaires (App3)
 */
export async function seedChapitres(mairieIds: number[], count: number = 15) {
  console.log(`🌱 Seeding ${count} chapitres budgétaires...`);

  const chapitresData = [
    {
      code: '60',
      libelle: 'Achats et variations de stocks',
      description: 'Achats de marchandises, matières premières',
    },
    {
      code: '6011',
      libelle: 'Achats de matières et fournitures',
      description: 'Matériel de bureau, fournitures diverses',
    },
    {
      code: '6013',
      libelle: 'Variations de stocks',
      description: 'Variation des stocks de matières',
    },
    { code: '61', libelle: 'Services extérieurs', description: 'Services fournis par des tiers' },
    {
      code: '6010',
      libelle: 'Transport et déplacement',
      description: 'Frais de transport et missions',
    },
    {
      code: '6020',
      libelle: 'Loyers et charges locatives',
      description: 'Loyers des locaux et équipements',
    },
    {
      code: '62',
      libelle: 'Autres services extérieurs',
      description: 'Honoraires, assurances, publicité',
    },
    { code: '63', libelle: 'Impôts et taxes', description: 'Impôts et taxes diverses' },
    { code: '64', libelle: 'Charges de personnel', description: 'Salaires, charges sociales' },
    { code: '6400', libelle: 'Rémunérations du personnel', description: 'Salaires et primes' },
    {
      code: '65',
      libelle: 'Autres charges de gestion courante',
      description: 'Redevances, subventions versées',
    },
    { code: '66', libelle: 'Charges financières', description: 'Intérêts et frais bancaires' },
    { code: '67', libelle: 'Charges exceptionnelles', description: 'Charges non courantes' },
    {
      code: '68',
      libelle: 'Dotations aux amortissements',
      description: 'Amortissements des immobilisations',
    },
    { code: '69', libelle: 'Impôt sur les bénéfices', description: 'Impôt sur les résultats' },
  ];

  const chapitres: Chapitre[] = [];
  const now = new Date();

  for (let i = 0; i < Math.min(count, chapitresData.length); i++) {
    const data = chapitresData[i]!;
    chapitres.push({
      code: data.code,
      libelle: data.libelle,
      description: data.description,
      mairieId: randomChoice(mairieIds),
      actif: Math.random() > 0.1, // 90% actifs
      createdAt: randomDate(new Date(2020, 0, 1), now),
      updatedAt: now,
    });
  }

  await db.chapitres.bulkAdd(chapitres);
  console.log(`✅ ${chapitres.length} chapitres créés`);
  return chapitres;
}

/**
 * Seeder pour les Prévisions budgétaires (App3)
 */
export async function seedPrevisions(
  mairieIds: number[],
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
      mairieId: randomChoice(mairieIds),
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

  await db.previsions.bulkAdd(previsions);
  console.log(`✅ ${count} prévisions créées`);
  return previsions;
}

/**
 * Seeder pour les Mandats de dépense (App3)
 */
export async function seedMandats(
  mairieIds: number[],
  chapitreIds: number[],
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
      mairieId: randomChoice(mairieIds),
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

  await db.mandats.bulkAdd(mandats);
  console.log(`✅ ${count} mandats créés`);
  return mandats;
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
    // App3
    chapitres?: number;
    previsions?: number;
    mandats?: number;
  } = {},
) {
  console.log('🚀 Démarrage des seeders...');

  const {
    utilisateurs = 10,
    mairies = 15,
    taxes = 25,
    declarations = 100,
    bordereaux = 80,
    // App3
    chapitres = 15,
    previsions = 30,
    mandats = 100,
  } = options;

  try {
    // Vider les tables existantes
    console.log('🗑️  Nettoyage des tables...');
    await Promise.all([
      db.utilisateurs.clear(),
      db.mairies.clear(),
      db.taxes.clear(),
      db.declarations.clear(),
      db.bordereaux.clear(),
      // App3
      db.chapitres.clear(),
      db.previsions.clear(),
      db.mandats.clear(),
    ]);

    // Créer les utilisateurs
    const utilisateursCreated = await seedUtilisateurs(utilisateurs);
    const utilisateurIds = utilisateursCreated.map((u) => u.id!);

    // Créer les mairies
    const mairiesCreated = await seedMairies(mairies);
    const mairieIds = mairiesCreated.map((m) => m.id!);

    // Créer les taxes
    const taxesCreated = await seedTaxes(mairieIds, taxes);
    const taxeIds = taxesCreated.map((t) => t.id!);

    // Créer les déclarations
    await seedDeclarations(mairieIds, taxeIds, utilisateurIds, declarations);

    // Créer les bordereaux
    await seedBordereaux(mairieIds, utilisateurIds, bordereaux);

    // App3 - Gestion des Dépenses
    console.log('\n📦 Seeders App3 - Gestion des Dépenses');

    // Créer les chapitres budgétaires
    const chapitresCreated = await seedChapitres(mairieIds, chapitres);
    const chapitreIds = chapitresCreated.map((c) => c.id!);

    // Créer les prévisions budgétaires
    const previsionsCreated = await seedPrevisions(
      mairieIds,
      chapitreIds,
      utilisateurIds,
      previsions,
    );
    const previsionIds = previsionsCreated.map((p) => p.id!);

    // Créer les mandats de dépense
    await seedMandats(mairieIds, chapitreIds, previsionIds, utilisateurIds, mandats);

    console.log('\n✨ Tous les seeders ont été exécutés avec succès !');
    console.log('📊 Statistiques :');
    console.log('   App1 - Déclarations & Bordereaux:');
    console.log(`   - Utilisateurs: ${utilisateurs}`);
    console.log(`   - Mairies: ${mairiesCreated.length}`);
    console.log(`   - Taxes: ${taxesCreated.length}`);
    console.log(`   - Déclarations: ${declarations}`);
    console.log(`   - Bordereaux: ${bordereaux}`);
    console.log('   App3 - Gestion des Dépenses:');
    console.log(`   - Chapitres: ${chapitresCreated.length}`);
    console.log(`   - Prévisions: ${previsions}`);
    console.log(`   - Mandats: ${mandats}`);

    return {
      success: true,
      counts: {
        utilisateurs,
        mairies: mairiesCreated.length,
        taxes: taxesCreated.length,
        declarations,
        bordereaux,
        chapitres: chapitresCreated.length,
        previsions,
        mandats,
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
    | 'chapitres'
    | 'previsions'
    | 'mandats',
  count?: number,
) {
  switch (table) {
    case 'utilisateurs':
      return seedUtilisateurs(count);

    case 'mairies':
      return seedMairies(count);

    case 'taxes': {
      const mairies = await db.mairies.toArray();
      const mairieIds = mairies.map((m: Mairie) => m.id!);
      if (mairieIds.length === 0) {
        throw new Error("Aucune mairie trouvée. Créez d'abord des mairies.");
      }
      return seedTaxes(mairieIds, count);
    }

    case 'declarations': {
      const [mairies, taxes, utilisateurs] = await Promise.all([
        db.mairies.toArray(),
        db.taxes.toArray(),
        db.utilisateurs.toArray(),
      ]);
      const mairieIds = mairies.map((m: Mairie) => m.id!);
      const taxeIds = taxes.map((t: Taxe) => t.id!);
      const utilisateurIds = utilisateurs.map((u: Utilisateur) => u.id!);
      if (mairieIds.length === 0 || taxeIds.length === 0 || utilisateurIds.length === 0) {
        throw new Error("Mairies, taxes et utilisateurs requis. Créez-les d'abord.");
      }
      return seedDeclarations(mairieIds, taxeIds, utilisateurIds, count);
    }

    case 'bordereaux': {
      const [mairies, utilisateurs] = await Promise.all([
        db.mairies.toArray(),
        db.utilisateurs.toArray(),
      ]);
      const mairieIds = mairies.map((m: Mairie) => m.id!);
      const utilisateurIds = utilisateurs.map((u: Utilisateur) => u.id!);
      if (mairieIds.length === 0 || utilisateurIds.length === 0) {
        throw new Error("Mairies et utilisateurs requis. Créez-les d'abord.");
      }
      return seedBordereaux(mairieIds, utilisateurIds, count);
    }

    // App3 - Gestion des Dépenses
    case 'chapitres': {
      const mairies = await db.mairies.toArray();
      const mairieIds = mairies.map((m: Mairie) => m.id!);
      if (mairieIds.length === 0) {
        throw new Error("Aucune mairie trouvée. Créez d'abord des mairies.");
      }
      return seedChapitres(mairieIds, count);
    }

    case 'previsions': {
      const [mairies, chapitres, utilisateurs] = await Promise.all([
        db.mairies.toArray(),
        db.chapitres.toArray(),
        db.utilisateurs.toArray(),
      ]);
      const mairieIds = mairies.map((m: Mairie) => m.id!);
      const chapitreIds = chapitres.map((c: Chapitre) => c.id!);
      const utilisateurIds = utilisateurs.map((u: Utilisateur) => u.id!);
      if (mairieIds.length === 0 || chapitreIds.length === 0 || utilisateurIds.length === 0) {
        throw new Error("Mairies, chapitres et utilisateurs requis. Créez-les d'abord.");
      }
      return seedPrevisions(mairieIds, chapitreIds, utilisateurIds, count);
    }

    case 'mandats': {
      const [mairies, chapitres, previsions, utilisateurs] = await Promise.all([
        db.mairies.toArray(),
        db.chapitres.toArray(),
        db.previsions.toArray(),
        db.utilisateurs.toArray(),
      ]);
      const mairieIds = mairies.map((m: Mairie) => m.id!);
      const chapitreIds = chapitres.map((c: Chapitre) => c.id!);
      const previsionIds = previsions.map((p: Prevision) => p.id!);
      const utilisateurIds = utilisateurs.map((u: Utilisateur) => u.id!);
      if (mairieIds.length === 0 || chapitreIds.length === 0 || utilisateurIds.length === 0) {
        throw new Error(
          "Mairies, chapitres, prévisions et utilisateurs requis. Créez-les d'abord.",
        );
      }
      return seedMandats(mairieIds, chapitreIds, previsionIds, utilisateurIds, count);
    }
  }
}
