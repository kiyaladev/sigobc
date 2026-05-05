import { useQuasar } from 'quasar';
import { useDemoStore, DEMO_CONFIG } from 'src/stores/demo-store';

/**
 * Composable pour gérer les restrictions du mode démo
 * Utiliser dans les pages pour vérifier les permissions avant les actions
 */
export function useDemoRestrictions() {
  const $q = useQuasar();
  const demoStore = useDemoStore();

  /**
   * Vérifie si l'utilisateur peut créer un enregistrement
   * @param entityType Type d'entité (declarations, mandats, etc.)
   * @param currentCount Nombre actuel d'enregistrements
   * @returns true si autorisé, false sinon
   */
  function checkCanCreate(
    entityType: keyof typeof DEMO_CONFIG.maxRecords,
    currentCount: number,
  ): boolean {
    if (!demoStore.isActive) return true;

    const canCreate = demoStore.canCreate(entityType, currentCount);

    if (!canCreate) {
      const max = DEMO_CONFIG.maxRecords[entityType];
      $q.notify({
        type: 'warning',
        message: demoStore.getRestrictionMessage('create', { max }),
        icon: 'science',
        timeout: 4000,
      });
    } else {
      demoStore.recordAction('creates');
    }

    return canCreate;
  }

  /**
   * Vérifie si l'utilisateur peut modifier un enregistrement
   * @returns true si autorisé, false sinon
   */
  function checkCanUpdate(): boolean {
    if (!demoStore.isActive) return true;

    const canUpdate = demoStore.canUpdate();

    if (!canUpdate) {
      $q.notify({
        type: 'warning',
        message: demoStore.getRestrictionMessage('update'),
        icon: 'science',
        timeout: 4000,
      });
    } else {
      demoStore.recordAction('updates');
    }

    return canUpdate;
  }

  /**
   * Vérifie si l'utilisateur peut supprimer un enregistrement
   * @returns true si autorisé, false sinon
   */
  function checkCanDelete(): boolean {
    if (!demoStore.isActive) return true;

    const canDelete = demoStore.canDelete();

    if (!canDelete) {
      $q.notify({
        type: 'warning',
        message: demoStore.getRestrictionMessage('delete'),
        icon: 'science',
        timeout: 4000,
      });
    }

    return canDelete;
  }

  /**
   * Vérifie si l'utilisateur peut exporter des données
   * Retourne le nombre max d'enregistrements exportables
   * @returns Nombre max d'enregistrements exportables
   */
  function getExportLimit(): number {
    // Export toujours illimité (même après expiration de l'essai)
    return Infinity;
  }

  /**
   * Vérifie si l'utilisateur peut accéder aux fonctions admin
   * @returns true si autorisé, false sinon
   */
  function checkCanAccessAdmin(): boolean {
    if (!demoStore.isActive) return true;

    const canAccess = demoStore.canAccessAdmin();

    if (!canAccess) {
      $q.notify({
        type: 'warning',
        message: demoStore.getRestrictionMessage('admin'),
        icon: 'science',
        timeout: 4000,
      });
    }

    return canAccess;
  }

  /**
   * Vérifie si l'utilisateur peut effectuer une sauvegarde/restauration
   * @returns true si autorisé, false sinon
   */
  function checkCanBackup(): boolean {
    if (!demoStore.isActive) return true;

    const canBackup = demoStore.canBackup();

    if (!canBackup) {
      $q.notify({
        type: 'warning',
        message: demoStore.getRestrictionMessage('backup'),
        icon: 'science',
        timeout: 4000,
      });
    }

    return canBackup;
  }

  /**
   * Enregistre une consultation (pour les statistiques)
   */
  function recordView() {
    if (demoStore.isActive) {
      demoStore.recordAction('views');
    }
  }

  /**
   * Affiche un message informatif sur le mode démo
   */
  function showDemoInfo() {
    $q.dialog({
      title: 'Mode Démonstration',
      message: `
        <div class="text-body1">
          <p>Vous utilisez l'application en <strong>mode démonstration</strong>.</p>
          <p class="q-mt-md"><strong>Restrictions :</strong></p>
          <ul>
            <li>Création limitée à 100 enregistrements par type</li>
            <li>Suppression désactivée</li>
            <li>Export limité à 5 enregistrements</li>
            <li>Fonctions administrateur désactivées</li>
            <li>Session limitée à 30 minutes</li>
          </ul>
          <p class="q-mt-md text-grey-7">
            Pour accéder à toutes les fonctionnalités, veuillez vous connecter avec un compte standard.
          </p>
        </div>
      `,
      html: true,
      ok: {
        label: 'Compris',
        color: 'primary',
      },
    });
  }

  return {
    // State
    isDemo: demoStore.isActive,

    // Méthodes de vérification
    checkCanCreate,
    checkCanUpdate,
    checkCanDelete,
    getExportLimit,
    checkCanAccessAdmin,
    checkCanBackup,
    recordView,
    showDemoInfo,
  };
}
