import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { db, type Utilisateur } from 'src/database/db';

export const useAuthStore = defineStore('auth', () => {
  // State
  const currentUser = ref<Utilisateur | null>(null);
  const isAuthenticated = ref(false);
  const token = ref<string | null>(localStorage.getItem('auth_token'));

  // Getters
  const userName = computed(() =>
    currentUser.value ? `${currentUser.value.prenom} ${currentUser.value.nom}` : '',
  );

  const userRole = computed(() => currentUser.value?.role || 'operateur');

  const isAdmin = computed(() => currentUser.value?.role === 'admin');

  const isGestionnaire = computed(
    () => currentUser.value?.role === 'admin' || currentUser.value?.role === 'gestionnaire',
  );

  // Vérifier si l'utilisateur est en mode démo
  const isDemoUser = computed(() => currentUser.value?.username === 'demo');

  // Actions
  async function ensureAdminExists(): Promise<void> {
    try {
      const adminUser = await db.utilisateurs.where('username').equals('admin').first();

      if (!adminUser) {
        console.log('🔧 Création du compte admin par défaut...');
        await db.utilisateurs.add({
          username: 'admin',
          password: 'Sigobc@2026!',
          nom: 'Administrateur',
          prenom: 'Système',
          email: 'admin@sigobc.gov',
          role: 'admin',
          actif: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        console.log('✅ Compte admin créé avec succès');
      } else if (!adminUser.actif) {
        // S'assurer que le compte admin est actif
        console.log('🔧 Réactivation du compte admin...');
        await db.utilisateurs.update(adminUser.id, {
          actif: true,
          updatedAt: new Date(),
        });
        console.log('✅ Compte admin réactivé avec succès');
      }

      // Créer le compte démo s'il n'existe pas
      const demoUser = await db.utilisateurs.where('username').equals('demo').first();
      if (!demoUser) {
        console.log('🎮 Création du compte démo...');
        await db.utilisateurs.add({
          username: 'demo',
          password: 'demo',
          nom: 'Utilisateur',
          prenom: 'Démo',
          email: 'demo@sigobc.gov',
          role: 'operateur', // Rôle limité pour le mode démo
          actif: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        console.log('✅ Compte démo créé avec succès');
      } else if (!demoUser.actif) {
        // S'assurer que le compte démo est actif
        await db.utilisateurs.update(demoUser.id, {
          actif: true,
          updatedAt: new Date(),
        });
        console.log('✅ Compte démo réactivé');
      }
    } catch (error) {
      console.error('Erreur lors de la création du compte admin:', error);
    }
  }

  async function loginDemo(): Promise<boolean> {
    try {
      console.log('🎮 Connexion en mode démo...');

      // S'assurer que le compte démo existe
      await ensureAdminExists();

      const user = await db.utilisateurs.where('username').equals('demo').first();

      if (user && user.actif) {
        currentUser.value = user;
        isAuthenticated.value = true;

        // Générer un token démo
        const demoToken = btoa(`demo:${Date.now()}:demo_session`);
        token.value = demoToken;
        localStorage.setItem('auth_token', demoToken);

        // Le mode démo est automatiquement initialisé dans MainLayout

        // Mettre à jour la dernière connexion
        await db.utilisateurs.update(user.id, {
          derniereConnexion: new Date(),
          updatedAt: new Date(),
        });

        console.log('✅ Connexion démo réussie');
        return true;
      }

      console.log('❌ Échec de la connexion démo');
      return false;
    } catch (error) {
      console.error('Erreur lors de la connexion démo:', error);
      return false;
    }
  }

  async function login(username: string, password: string): Promise<boolean> {
    try {
      console.log('🔍 Tentative de connexion pour:', username);

      // Vérifier si le compte admin existe, sinon le créer
      await ensureAdminExists();

      const user = await db.utilisateurs.where('username').equals(username).first();

      console.log('👤 Utilisateur trouvé:', user ? 'Oui' : 'Non');
      if (user) {
        console.log('📋 Détails:', {
          username: user.username,
          actif: user.actif,
          role: user.role,
          passwordMatch: user.password === password,
        });
      }

      if (user && user.password === password && user.actif) {
        // En production, utiliser un vrai système de hash et JWT
        currentUser.value = user;
        isAuthenticated.value = true;

        // Générer un token simple (à remplacer par JWT en production)
        const simpleToken = btoa(`${username}:${Date.now()}`);
        token.value = simpleToken;
        localStorage.setItem('auth_token', simpleToken);

        // Mettre à jour la dernière connexion
        await db.utilisateurs.update(user.id, {
          derniereConnexion: new Date(),
          updatedAt: new Date(),
        });

        console.log('✅ Connexion réussie');
        return true;
      }

      console.log('❌ Échec de connexion');
      return false;
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      return false;
    }
  }

  function logout() {
    // Le mode démo reste actif (basé sur la date de première utilisation)
    currentUser.value = null;
    isAuthenticated.value = false;
    token.value = null;
    localStorage.removeItem('auth_token');
  }

  async function checkAuth(): Promise<boolean> {
    const storedToken = localStorage.getItem('auth_token');

    if (!storedToken) {
      return false;
    }

    try {
      // En production, vérifier le JWT côté serveur
      // Pour l'instant, on vérifie juste la présence du token
      token.value = storedToken;

      // Récupérer l'utilisateur depuis le token (simplifié)
      const username = atob(storedToken).split(':')[0];
      if (!username) {
        logout();
        return false;
      }

      const user = await db.utilisateurs.where('username').equals(username).first();

      if (user && user.actif) {
        currentUser.value = user;
        isAuthenticated.value = true;
        return true;
      }

      // Token invalide, déconnecter
      logout();
      return false;
    } catch (error) {
      console.error("Erreur lors de la vérification de l'authentification:", error);
      logout();
      return false;
    }
  }

  async function updateProfile(data: Partial<Utilisateur>): Promise<boolean> {
    if (!currentUser.value || !currentUser.value.id) {
      return false;
    }

    try {
      await db.utilisateurs.update(currentUser.value.id, {
        ...data,
        updatedAt: new Date(),
      });

      // Recharger l'utilisateur
      const updatedUser = await db.utilisateurs.get(currentUser.value.id);
      if (updatedUser) {
        currentUser.value = updatedUser;
      }

      return true;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      return false;
    }
  }

  async function changePassword(oldPassword: string, newPassword: string): Promise<boolean> {
    if (!currentUser.value || !currentUser.value.id) {
      return false;
    }

    try {
      const user = await db.utilisateurs.get(currentUser.value.id);

      if (user && user.password === oldPassword) {
        await db.utilisateurs.update(currentUser.value.id, {
          password: newPassword,
          updatedAt: new Date(),
        });

        return true;
      }

      return false;
    } catch (error) {
      console.error('Erreur lors du changement de mot de passe:', error);
      return false;
    }
  }

  return {
    // State
    currentUser,
    isAuthenticated,
    token,

    // Getters
    userName,
    userRole,
    isAdmin,
    isGestionnaire,
    isDemoUser,

    // Actions
    login,
    loginDemo,
    logout,
    checkAuth,
    updateProfile,
    changePassword,
    ensureAdminExists,
  };
});
