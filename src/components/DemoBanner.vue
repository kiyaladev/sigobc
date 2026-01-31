<template>
  <div v-if="demoStore.isActive && !demoStore.isExpired" class="demo-banner" :class="bannerClass">
    <div class="demo-banner-content">
      <q-icon :name="bannerIcon" size="20px" class="q-mr-sm" />
      <span class="demo-text">
        <strong>Période d'essai</strong>
        <span class="demo-separator">|</span>
        <span class="demo-time">
          <q-icon name="event" size="14px" class="q-mr-xs" />
          {{ demoStore.trialDaysRemaining }} jour{{
            demoStore.trialDaysRemaining > 1 ? 's' : ''
          }}
          restant{{ demoStore.trialDaysRemaining > 1 ? 's' : '' }}
        </span>
      </span>
      <q-space />
      <q-btn
        flat
        dense
        size="sm"
        color="white"
        label="Activer la licence"
        icon="key"
        @click="showActivationDialog = true"
        class="demo-exit-btn"
      />
    </div>

    <!-- Tooltip d'informations -->
    <q-tooltip anchor="bottom middle" self="top middle" :offset="[0, 8]">
      <div class="text-center">
        <div class="text-weight-bold q-mb-xs">Période d'essai de 30 jours</div>
        <p class="q-ma-none">Après expiration, seul l'export des données sera disponible.</p>
      </div>
    </q-tooltip>
  </div>

  <!-- Dialog d'activation -->
  <q-dialog v-model="showActivationDialog">
    <q-card style="min-width: 400px">
      <q-card-section class="bg-primary text-white">
        <div class="text-h6">
          <q-icon name="key" class="q-mr-sm" />
          Activer la licence
        </div>
      </q-card-section>

      <q-card-section>
        <p class="text-body1 q-mb-md">
          Pour continuer à utiliser l'application après la période d'essai, veuillez contacter le
          support pour obtenir une clé de licence.
        </p>
        <q-input
          v-model="licenseKey"
          label="Clé de licence"
          outlined
          placeholder="XXXX-XXXX-XXXX-XXXX"
        />
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Annuler" v-close-popup />
        <q-btn color="primary" label="Activer" @click="activateLicense" :loading="activating" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useQuasar } from 'quasar';
import { useDemoStore } from 'src/stores/demo-store';

const $q = useQuasar();
const demoStore = useDemoStore();

const showActivationDialog = ref(false);
const licenseKey = ref('');
const activating = ref(false);

const bannerClass = computed(() => {
  if (demoStore.trialDaysRemaining <= 3) {
    return 'banner-critical';
  } else if (demoStore.trialDaysRemaining <= 7) {
    return 'banner-warning';
  }
  return 'banner-info';
});

const bannerIcon = computed(() => {
  if (demoStore.trialDaysRemaining <= 3) {
    return 'warning';
  } else if (demoStore.trialDaysRemaining <= 7) {
    return 'schedule';
  }
  return 'science';
});

function activateLicense() {
  if (!licenseKey.value.trim()) {
    $q.notify({
      type: 'warning',
      message: 'Veuillez entrer une clé de licence',
    });
    return;
  }

  activating.value = true;

  // Simuler la vérification
  setTimeout(() => {
    activating.value = false;
    $q.notify({
      type: 'negative',
      message: 'Clé de licence invalide. Contactez le support.',
    });
  }, 1500);
}
</script>

<style scoped lang="scss">
.demo-banner {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 9999;
  color: white;
  padding: 8px 16px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

.banner-info {
  background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
}

.banner-warning {
  background: linear-gradient(135deg, #f39c12 0%, #e67e22 100%);
}

.banner-critical {
  background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
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
}
</style>
