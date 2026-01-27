<template>
  <div v-if="demoStore.isActive" class="demo-banner">
    <div class="demo-banner-content">
      <q-icon name="science" size="20px" class="q-mr-sm" />
      <span class="demo-text">
        <strong>Mode Démonstration</strong>
        <span class="demo-separator">|</span>
        <span class="demo-time">
          <q-icon name="schedule" size="14px" class="q-mr-xs" />
          {{ demoStore.sessionTimeRemainingMinutes }} min restantes
        </span>
      </span>
      <q-space />
      <q-btn
        flat
        dense
        size="sm"
        color="white"
        label="Quitter le mode démo"
        icon="close"
        @click="exitDemoMode"
        class="demo-exit-btn"
      />
    </div>

    <!-- Tooltip d'informations -->
    <q-tooltip anchor="bottom middle" self="top middle" :offset="[0, 8]">
      <div class="text-center">
        <div class="text-weight-bold q-mb-xs">Restrictions du mode démo :</div>
        <ul class="q-ma-none q-pl-md text-left">
          <li>Création limitée (max 100 par type)</li>
          <li>Suppression désactivée</li>
          <li>Export limité à 5 enregistrements</li>
          <li>Fonctions admin désactivées</li>
          <li>Session de 30 minutes</li>
        </ul>
      </div>
    </q-tooltip>
  </div>

  <!-- Dialog d'expiration -->
  <q-dialog v-model="showExpirationDialog" persistent>
    <q-card class="demo-expiration-card">
      <q-card-section class="text-center">
        <q-icon name="timer_off" size="64px" color="warning" class="q-mb-md" />
        <div class="text-h5 text-weight-bold q-mb-sm">Session démo expirée</div>
        <div class="text-body1 text-grey-7">
          Votre session de démonstration de 30 minutes est terminée.
        </div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        <div class="demo-stats q-pa-md bg-grey-2 rounded-borders">
          <div class="text-subtitle2 text-weight-bold q-mb-sm">Résumé de votre session :</div>
          <div class="row q-gutter-md">
            <div class="col">
              <div class="text-h6">{{ demoStore.actionsCount.creates }}</div>
              <div class="text-caption text-grey-7">Créations</div>
            </div>
            <div class="col">
              <div class="text-h6">{{ demoStore.actionsCount.updates }}</div>
              <div class="text-caption text-grey-7">Modifications</div>
            </div>
            <div class="col">
              <div class="text-h6">{{ demoStore.actionsCount.views }}</div>
              <div class="text-caption text-grey-7">Consultations</div>
            </div>
          </div>
        </div>
      </q-card-section>

      <q-card-actions align="center" class="q-pb-md">
        <q-btn
          color="primary"
          label="Nouvelle session démo"
          icon="refresh"
          @click="restartDemoSession"
          class="q-mr-sm"
        />
        <q-btn outline color="primary" label="Quitter" icon="logout" @click="exitAndRedirect" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { useDemoStore } from 'src/stores/demo-store';
import { useAuthStore } from 'src/stores/auth-store';

const router = useRouter();
const $q = useQuasar();
const demoStore = useDemoStore();
const authStore = useAuthStore();

const showExpirationDialog = ref(false);
let expirationCheckInterval: ReturnType<typeof setInterval> | null = null;

onMounted(() => {
  // Vérifier périodiquement l'expiration de la session
  expirationCheckInterval = setInterval(() => {
    if (demoStore.isActive && demoStore.isSessionExpired) {
      showExpirationDialog.value = true;
    }

    // Avertissement à 5 minutes
    if (
      demoStore.isActive &&
      demoStore.sessionTimeRemainingMinutes <= 5 &&
      demoStore.sessionTimeRemainingMinutes > 0 &&
      !demoStore.demoWarningShown
    ) {
      demoStore.showDemoWarning();
      $q.notify({
        type: 'warning',
        message: `Votre session démo expire dans ${demoStore.sessionTimeRemainingMinutes} minutes`,
        icon: 'schedule',
        timeout: 5000,
      });
    }
  }, 30000); // Vérifier toutes les 30 secondes
});

onUnmounted(() => {
  if (expirationCheckInterval) {
    clearInterval(expirationCheckInterval);
  }
});

watch(
  () => demoStore.isSessionExpired,
  (expired) => {
    if (expired) {
      showExpirationDialog.value = true;
    }
  },
);

function exitDemoMode() {
  $q.dialog({
    title: 'Quitter le mode démo',
    message:
      'Voulez-vous vraiment quitter le mode démonstration ? Les données créées seront conservées.',
    cancel: {
      label: 'Annuler',
      flat: true,
    },
    ok: {
      label: 'Quitter',
      color: 'warning',
    },
  }).onOk(() => {
    demoStore.deactivateDemoMode();
    authStore.logout();
    void router.push('/login');
  });
}

function restartDemoSession() {
  showExpirationDialog.value = false;
  demoStore.activateDemoMode();
  $q.notify({
    type: 'positive',
    message: 'Nouvelle session démo démarrée',
    icon: 'refresh',
  });
}

function exitAndRedirect() {
  showExpirationDialog.value = false;
  demoStore.deactivateDemoMode();
  authStore.logout();
  void router.push('/login');
}
</script>

<style scoped lang="scss">
.demo-banner {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 9999;
  background: linear-gradient(135deg, #f39c12 0%, #e74c3c 100%);
  color: white;
  padding: 8px 16px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

.demo-banner-content {
  display: flex;
  align-items: center;
  max-width: 1400px;
  margin: 0 auto;
}

.demo-text {
  display: flex;
  align-items: center;
  gap: 8px;
}

.demo-separator {
  opacity: 0.5;
}

.demo-time {
  display: flex;
  align-items: center;
  font-size: 0.9em;
  opacity: 0.9;
}

.demo-exit-btn {
  border: 1px solid rgba(255, 255, 255, 0.3);

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
}

.demo-expiration-card {
  min-width: 400px;
  max-width: 500px;
}

.demo-stats {
  border-radius: 8px;
}

@media (max-width: 600px) {
  .demo-banner-content {
    flex-wrap: wrap;
    justify-content: center;
    gap: 8px;
  }

  .demo-text {
    flex-wrap: wrap;
    justify-content: center;
  }

  .demo-exit-btn {
    width: 100%;
    margin-top: 8px;
  }

  .demo-expiration-card {
    min-width: unset;
    width: 90vw;
  }
}
</style>
