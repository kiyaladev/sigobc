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
    currentUser.value ? `${currentUser.value.prenom} ${currentUser.value.nom}` : ''
  );

  const userRole = computed(() => currentUser.value?.role || 'operateur');

  const isAdmin = computed(() => currentUser.value?.role === 'admin');

  const isGestionnaire = computed(() =>
    currentUser.value?.role === 'admin' || currentUser.value?.role === 'gestionnaire'
  );

  // Actions
  async function login(username: string, password: string): Promise<boolean> {
    try {
      const user = await db.utilisateurs
        .where('username')
        .equals(username)
        .first();

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

        return true;
      }

      return false;
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      return false;
    }
  }

  function logout() {
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

      const user = await db.utilisateurs
        .where('username')
        .equals(username)
        .first();

      if (user && user.actif) {
        currentUser.value = user;
        isAuthenticated.value = true;
        return true;
      }

      // Token invalide, déconnecter
      logout();
      return false;
    } catch (error) {
      console.error('Erreur lors de la vérification de l\'authentification:', error);
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

    // Actions
    login,
    logout,
    checkAuth,
    updateProfile,
    changePassword,
  };
});
