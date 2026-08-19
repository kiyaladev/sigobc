import { getNextId } from './db.js';
import { MairieModel, UtilisateurModel } from './models/index.js';

// Default municipality (mirrors frontend src/constanteInfo.js — MAIRIE_INFO).
// Doit rester synchronisé avec frontend/public/constanteInfo.js, source de vérité.
const DEFAULT_MAIRIE = {
  nom: 'Mairie de Vavoua',
  code: '433',
  ville: 'Vavoua',
  departement: 'Vavoua',
  region: 'Haut-Sassandra',
  maire: 'BONAVENTURE KALOU',
  telephone: '+225 23 54 00 00',
  email: 'contact@mairie-vavoua.ci',
  adresse: 'Avenue Principale',
  codePostal: '00225',
  logo: 'commune-de-vavoua.png',
  numeroEmployeurCNPS: '54486',
};

// Default user accounts (mirrors frontend seedDefaultData).
const DEFAULT_USERS = [
  {
    username: 'admin',
    password: 'Sigobc@2026!',
    nom: 'Administrateur',
    prenom: 'Complet',
    email: 'admin@sigobc.sn',
    role: 'admin' as const,
  },
  {
    username: 'agent',
    password: 'password',
    nom: 'Agent',
    prenom: 'Recouvrement',
    email: 'agent@sigobc.sn',
    role: 'agent' as const,
  },
  {
    username: 'comptable',
    password: 'password',
    nom: 'Comptable',
    prenom: 'Public',
    email: 'comptable@sigobc.sn',
    role: 'comptable' as const,
  },
];

async function seedMairie(): Promise<number | null> {
  if ((await MairieModel.countDocuments()) > 0) return null;
  const id = await getNextId('mairies');
  await MairieModel.create({ id, ...DEFAULT_MAIRIE });
  console.log(`[seed] mairie créée: ${DEFAULT_MAIRIE.nom} (id=${id})`);
  return id;
}

async function seedUsers(mairieId: number | null): Promise<void> {
  for (const user of DEFAULT_USERS) {
    const exists = await UtilisateurModel.exists({ username: user.username });
    if (exists) continue;
    const id = await getNextId('utilisateurs');
    await UtilisateurModel.create({ id, ...user, mairieId: mairieId ?? undefined, actif: true });
    console.log(`[seed] utilisateur créé: ${user.username} (${user.role}, id=${id})`);
  }
}

export async function runSeeders(): Promise<void> {
  try {
    const existingMairie = await MairieModel.findOne().lean<{ id: number } | null>();
    const mairieId = existingMairie?.id ?? (await seedMairie());
    await seedUsers(mairieId);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'unknown error';
    console.warn(`[seed] échec: ${message}`);
  }
}
