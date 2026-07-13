import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { db, type Utilisateur } from 'src/database/db';

export const useAuthStore = defineStore('auth', () => {
  // State
  const currentUser = ref<Utilisateur | null>(null);
  const isAuthenticated = ref(true);
  const token = ref<string | null>(localStorage.getItem('auth_token') || 'local_admin_session');

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
        await db.utilisateurs.add({
          username: 'admin',
          password: '',
          nom: 'Administrateur',
          prenom: 'Local',
          email: 'admin@sigobc.gov',
          role: 'admin',
          actif: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      } else {
        const needsUpdate = !adminUser.actif || adminUser.role !== 'admin';
        if (needsUpdate) {
          await db.utilisateurs.update(adminUser.id, {
            actif: true,
            role: 'admin',
            updatedAt: new Date(),
          });
        }
      }
    } catch (error) {
      console.error('Erreur lors de la création du compte admin:', error);
    }
  }

  async function signInDefaultUser(): Promise<boolean> {
    await ensureAdminExists();

    const user = await db.utilisateurs.where('username').equals('admin').first();
    currentUser.value =
      user ||
      ({
        username: 'admin',
        password: '',
        nom: 'Administrateur',
        prenom: 'Local',
        email: 'admin@sigobc.gov',
        role: 'admin',
        actif: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      } satisfies Utilisateur);
    isAuthenticated.value = true;
    token.value = 'local_admin_session';
    localStorage.setItem('auth_token', token.value);

    if (user?.id) {
      await db.utilisateurs.update(user.id, {
        derniereConnexion: new Date(),
        updatedAt: new Date(),
      });
    }

    return true;
  }

  async function loginDemo(): Promise<boolean> {
    return signInDefaultUser();
  }

  async function login(_username?: string, _password?: string): Promise<boolean> {
    try {
      return await signInDefaultUser();
    } catch (error) {
      console.error("Erreur lors de l'accès automatique:", error);
      return false;
    }
  }

  function logout() {
    isAuthenticated.value = true;
    token.value = 'local_admin_session';
    localStorage.setItem('auth_token', token.value);
  }

  async function checkAuth(): Promise<boolean> {
    try {
      return await signInDefaultUser();
    } catch (error) {
      console.error("Erreur lors de l'accès automatique:", error);
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

  function changePassword(_oldPassword: string, _newPassword: string): Promise<boolean> {
    return Promise.resolve(true);
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
