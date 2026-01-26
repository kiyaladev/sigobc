import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

// Configuration du mode démo
export const DEMO_CONFIG = {
  // Nombre maximum d'enregistrements autorisés par type
  maxRecords: {
    declarations: 100,
    mandats: 100,
    bordereaux: 100,
    taxes: 100,
    chapitres: 100,
    sousChapitres: 100,
    previsions: 100,
    utilisateurs: 1, // Seulement le compte démo
  },
  // Délai d'expiration de la session démo (en millisecondes) - 30 minutes
  sessionTimeout: 30 * 60 * 1000,
  // Message affiché pour les restrictions
  restrictionMessages: {
    create: 'Mode démo : création limitée. Maximum {max} enregistrements autorisés.',
    update: 'Mode démo : modification limitée.',
    delete: 'Mode démo : suppression non autorisée.',
    export: 'Mode démo : export limité à 5 enregistrements.',
    admin: 'Mode démo : fonctionnalités administrateur désactivées.',
    backup: 'Mode démo : sauvegarde/restauration non disponible.',
  },
};

export const useDemoStore = defineStore('demo', () => {
  // State
  const isDemoMode = ref(false);
  const demoSessionStart = ref<Date | null>(null);
  const demoWarningShown = ref(false);
  const actionsCount = ref({
    creates: 0,
    updates: 0,
    views: 0,
  });

  // Getters
  const isActive = computed(() => isDemoMode.value);

  const sessionTimeRemaining = computed(() => {
    if (!demoSessionStart.value) return 0;
    const elapsed = Date.now() - demoSessionStart.value.getTime();
    const remaining = DEMO_CONFIG.sessionTimeout - elapsed;
    return Math.max(0, remaining);
  });

  const sessionTimeRemainingMinutes = computed(() => {
    return Math.ceil(sessionTimeRemaining.value / 60000);
  });

  const isSessionExpired = computed(() => {
    return isDemoMode.value && sessionTimeRemaining.value <= 0;
  });

  const demoStats = computed(() => ({
    ...actionsCount.value,
    sessionMinutes: sessionTimeRemainingMinutes.value,
  }));

  // Actions
  function activateDemoMode() {
    isDemoMode.value = true;
    demoSessionStart.value = new Date();
    demoWarningShown.value = false;
    actionsCount.value = {
      creates: 0,
      updates: 0,
      views: 0,
    };
    localStorage.setItem('demo_mode', 'true');
    localStorage.setItem('demo_session_start', demoSessionStart.value.toISOString());
    console.log('🎮 Mode démo activé');
  }

  function deactivateDemoMode() {
    isDemoMode.value = false;
    demoSessionStart.value = null;
    demoWarningShown.value = false;
    localStorage.removeItem('demo_mode');
    localStorage.removeItem('demo_session_start');
    console.log('🎮 Mode démo désactivé');
  }

  function checkDemoSession(): boolean {
    const storedMode = localStorage.getItem('demo_mode');
    const storedStart = localStorage.getItem('demo_session_start');

    if (storedMode === 'true' && storedStart) {
      demoSessionStart.value = new Date(storedStart);
      isDemoMode.value = true;

      // Vérifier si la session a expiré
      if (isSessionExpired.value) {
        deactivateDemoMode();
        return false;
      }
      return true;
    }
    return false;
  }

  function canCreate(
    entityType: keyof typeof DEMO_CONFIG.maxRecords,
    currentCount: number,
  ): boolean {
    if (!isDemoMode.value) return true;
    const max = DEMO_CONFIG.maxRecords[entityType];
    return currentCount < max;
  }

  function canUpdate(): boolean {
    if (!isDemoMode.value) return true;
    // En mode démo, les mises à jour sont autorisées mais limitées
    return actionsCount.value.updates < 20;
  }

  function canDelete(): boolean {
    // Suppression désactivée en mode démo
    return !isDemoMode.value;
  }

  function canExport(): boolean {
    // Export limité en mode démo
    return true; // Autorisé mais limité à 5 enregistrements
  }

  function canAccessAdmin(): boolean {
    // Accès admin désactivé en mode démo
    return !isDemoMode.value;
  }

  function canBackup(): boolean {
    // Backup/Restore désactivé en mode démo
    return !isDemoMode.value;
  }

  function recordAction(action: 'creates' | 'updates' | 'views') {
    if (isDemoMode.value) {
      actionsCount.value[action]++;
    }
  }

  function getRestrictionMessage(
    action: keyof typeof DEMO_CONFIG.restrictionMessages,
    params?: Record<string, string | number>,
  ): string {
    let message = DEMO_CONFIG.restrictionMessages[action];
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        message = message.replace(`{${key}}`, String(value));
      });
    }
    return message;
  }

  function showDemoWarning() {
    demoWarningShown.value = true;
  }

  return {
    // State
    isDemoMode,
    demoSessionStart,
    demoWarningShown,
    actionsCount,

    // Getters
    isActive,
    sessionTimeRemaining,
    sessionTimeRemainingMinutes,
    isSessionExpired,
    demoStats,

    // Actions
    activateDemoMode,
    deactivateDemoMode,
    checkDemoSession,
    canCreate,
    canUpdate,
    canDelete,
    canExport,
    canAccessAdmin,
    canBackup,
    recordAction,
    getRestrictionMessage,
    showDemoWarning,
  };
});
