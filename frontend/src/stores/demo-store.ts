import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

// Configuration du mode démo
export const DEMO_CONFIG = {
  // Nombre maximum d'enregistrements autorisés par type
  maxRecords: {
    declarations: 200,
    mandats: 200,
    bordereaux: 200,
    taxes: 200,
    chapitres: 200,
    sousChapitres: 200,
    previsions: 200,
    utilisateurs: 3, // Seulement le compte démo
  },
  // Délai d'expiration de la démo (en millisecondes) - 4 mois (120 jours)
  trialDuration: 120 * 24 * 60 * 60 * 1000,
  // Message affiché pour les restrictions
  restrictionMessages: {
    create: 'Mode démo : création limitée. Maximum {max} enregistrements autorisés.',
    update: 'Mode démo : modification limitée.',
    delete: 'Mode démo : suppression non autorisée.',
    export: 'Exportation des données.',
    admin: 'Mode démo : fonctionnalités administrateur désactivées.',
    backup: 'Mode démo : sauvegarde/restauration non disponible.',
    expired: "Période d'essai de 4 mois expirée. Seul l'export des données est disponible.",
  },
};

// Clé pour stocker la date de première utilisation
const FIRST_USE_KEY = 'tresor_app_first_use';
const TRIAL_EXPIRED_KEY = 'tresor_app_trial_expired';
const TRIAL_BONUS_KEY = 'tresor_app_trial_bonus';

export const useDemoStore = defineStore('demo', () => {
  // State
  const isDemoMode = ref(false); // Mode démo désactivé (licence payée)
  const firstUseDate = ref<Date | null>(null);
  const isTrialExpired = ref(false);
  const demoWarningShown = ref(false);
  const trialBonusDays = ref(0);
  const actionsCount = ref({
    creates: 0,
    updates: 0,
    views: 0,
  });

  // Getters
  const isActive = computed(() => isDemoMode.value);

  const trialTimeRemaining = computed(() => {
    if (!firstUseDate.value) return DEMO_CONFIG.trialDuration;
    const elapsed = Date.now() - firstUseDate.value.getTime();
    const bonus = trialBonusDays.value * 24 * 60 * 60 * 1000;
    const remaining = DEMO_CONFIG.trialDuration + bonus - elapsed;
    return Math.max(0, remaining);
  });

  const trialDaysRemaining = computed(() => {
    return Math.ceil(trialTimeRemaining.value / (24 * 60 * 60 * 1000));
  });

  const isExpired = computed(() => {
    return trialTimeRemaining.value <= 0;
  });

  const demoStats = computed(() => ({
    ...actionsCount.value,
    daysRemaining: trialDaysRemaining.value,
    expired: isExpired.value,
  }));

  // Actions
  function initializeDemo() {
    // Vérifier si c'est la première utilisation
    const storedFirstUse = localStorage.getItem(FIRST_USE_KEY);
    const storedExpired = localStorage.getItem(TRIAL_EXPIRED_KEY);

    // Charger le bonus de jours
    const storedBonus = localStorage.getItem(TRIAL_BONUS_KEY);
    if (storedBonus) {
      trialBonusDays.value = parseInt(storedBonus, 10) || 0;
    }

    if (storedFirstUse) {
      firstUseDate.value = new Date(storedFirstUse);
    } else {
      // Première utilisation - enregistrer la date
      firstUseDate.value = new Date();
      localStorage.setItem(FIRST_USE_KEY, firstUseDate.value.toISOString());
      console.log("🎮 Première utilisation - Période d'essai démarrée");
    }

    // Vérifier si la période d'essai est expirée
    if (storedExpired === 'true' || isExpired.value) {
      isTrialExpired.value = true;
      localStorage.setItem(TRIAL_EXPIRED_KEY, 'true');
      console.log("⏰ Période d'essai expirée");
    }

    isDemoMode.value = true;
    console.log(`🎮 Version d'essai active - ${trialDaysRemaining.value} jours restants`);
  }

  function checkTrialStatus(): { expired: boolean; daysRemaining: number } {
    initializeDemo();
    return {
      expired: isExpired.value,
      daysRemaining: trialDaysRemaining.value,
    };
  }

  function canCreate(
    entityType: keyof typeof DEMO_CONFIG.maxRecords,
    currentCount: number,
  ): boolean {
    // Si la période d'essai est expirée, bloquer la création
    if (isExpired.value) return false;
    if (!isDemoMode.value) return true;
    const max = DEMO_CONFIG.maxRecords[entityType];
    return currentCount < max;
  }

  function canUpdate(): boolean {
    // Si la période d'essai est expirée, bloquer les modifications
    if (isExpired.value) return false;
    if (!isDemoMode.value) return true;
    // En mode démo, les mises à jour sont autorisées mais limitées
    return actionsCount.value.updates < 50;
  }

  function canDelete(): boolean {
    // Si la période d'essai est expirée, bloquer la suppression
    if (isExpired.value) return false;
    // Suppression autorisée en mode démo
    return true;
  }

  function canExport(): boolean {
    // Export TOUJOURS autorisé, même après expiration
    return true;
  }

  function canAccessAdmin(): boolean {
    // Si la période d'essai est expirée, bloquer l'accès admin
    if (isExpired.value) return false;
    return true;
  }

  function canBackup(): boolean {
    // Backup/Restore désactivé après expiration
    if (isExpired.value) return false;
    return true;
  }

  function canAccessApp(): boolean {
    // Si la période d'essai est expirée, l'app est bloquée sauf export
    return !isExpired.value;
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

  function extendTrial(days: number) {
    trialBonusDays.value += days;
    localStorage.setItem(TRIAL_BONUS_KEY, String(trialBonusDays.value));
    // Réinitialiser l'état d'expiration
    isTrialExpired.value = false;
    localStorage.removeItem(TRIAL_EXPIRED_KEY);
    console.log(`🔑 Licence activée - Période prolongée de ${days} jours`);
  }

  function showDemoWarning() {
    demoWarningShown.value = true;
  }

  return {
    // State
    isDemoMode,
    firstUseDate,
    isTrialExpired,
    demoWarningShown,
    actionsCount,

    // Getters
    isActive,
    trialTimeRemaining,
    trialDaysRemaining,
    isExpired,
    demoStats,

    // Actions
    initializeDemo,
    checkTrialStatus,
    canCreate,
    canUpdate,
    canDelete,
    canExport,
    canAccessAdmin,
    canBackup,
    canAccessApp,
    recordAction,
    getRestrictionMessage,
    extendTrial,
    showDemoWarning,
  };
});
