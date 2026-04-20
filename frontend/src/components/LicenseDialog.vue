<template>
  <q-dialog v-model="show" persistent>
    <q-card class="dialog-card" style="width: min(500px, 96vw); max-width: 96vw">
      <q-card-section class="row items-center q-pb-none">
        <div>
          <div class="text-h6">
            {{ isActivation ? 'Activation de licence' : 'Information de licence' }}
          </div>
          <div class="text-caption text-grey-7 q-mt-xs">
            Sécurisez votre installation ou démarrez une période d'essai.
          </div>
        </div>
        <q-space />
        <q-btn v-if="!isActivation" icon="close" flat round dense @click="$emit('close')" />
      </q-card-section>

      <q-card-section v-if="!licenseInfo">
        <div class="license-intro-card q-mb-md">
          <q-chip dense outline color="primary" icon="verified_user">Activation sécurisée</q-chip>
          <q-chip dense outline color="secondary" icon="schedule">Essai 7 jours</q-chip>
          <div class="license-intro-copy q-mt-sm">
            Choisissez entre une licence définitive ou une version d'essai pour activer
            l'application.
          </div>
        </div>

        <q-tabs
          v-model="tab"
          dense
          class="text-grey"
          active-color="primary"
          indicator-color="primary"
          align="justify"
        >
          <q-tab name="activate" label="Activer" />
          <q-tab name="trial" label="Version d'essai" />
        </q-tabs>

        <q-separator />

        <q-tab-panels v-model="tab" animated>
          <!-- Activation avec clé de licence -->
          <q-tab-panel name="activate">
            <div class="q-gutter-md">
              <div class="text-subtitle2">
                Entrez votre clé de licence pour activer l'application
              </div>

              <q-input
                v-model="licenseKey"
                type="textarea"
                label="Clé de licence"
                placeholder="Collez votre clé de licence ici..."
                outlined
                :rows="5"
                :error="!!error"
                :error-message="error"
              />

              <q-banner class="license-machine-banner" rounded>
                <template v-slot:avatar>
                  <q-icon name="memory" color="primary" />
                </template>
                <div>
                  <div>
                    ID de machine : <strong>{{ machineId }}</strong>
                  </div>
                  <div class="text-caption">
                    Envoyez cet ID au fournisseur pour obtenir votre clé de licence
                  </div>
                </div>
              </q-banner>

              <div class="row q-gutter-sm">
                <q-btn
                  label="Copier ID Machine"
                  icon="content_copy"
                  outline
                  color="primary"
                  @click="copyMachineId"
                />
                <q-space />
                <q-btn
                  label="Activer"
                  color="primary"
                  :loading="loading"
                  :disable="!licenseKey || loading"
                  @click="activateLicense"
                />
              </div>
            </div>
          </q-tab-panel>

          <!-- Version d'essai -->
          <q-tab-panel name="trial">
            <div class="q-gutter-md">
              <div class="text-subtitle2">Activez une version d'essai de 7 jours</div>

              <q-input v-model="trialCompany" label="Nom de l'entreprise" outlined required />

              <q-input v-model="trialEmail" label="Email" type="email" outlined required />

              <div class="text-caption text-grey-7">
                La version d'essai vous permet de tester l'application pendant 7 jours
              </div>

              <div class="row justify-end">
                <q-btn
                  label="Activer version d'essai"
                  color="primary"
                  :loading="loading"
                  :disable="!trialCompany || !trialEmail || loading"
                  @click="activateTrialLicense"
                />
              </div>
            </div>
          </q-tab-panel>
        </q-tab-panels>
      </q-card-section>

      <!-- Affichage des informations de licence -->
      <q-card-section v-else>
        <div class="q-gutter-md">
          <q-list bordered separator>
            <q-item>
              <q-item-section>
                <q-item-label>Type de licence</q-item-label>
                <q-item-label caption>
                  <q-chip :color="getLicenseTypeColor(licenseInfo.licenseType)" text-color="white">
                    {{ getLicenseTypeLabel(licenseInfo.licenseType) }}
                  </q-chip>
                </q-item-label>
              </q-item-section>
            </q-item>

            <q-item>
              <q-item-section>
                <q-item-label>Entreprise</q-item-label>
                <q-item-label caption>{{ licenseInfo.companyName }}</q-item-label>
              </q-item-section>
            </q-item>

            <q-item>
              <q-item-section>
                <q-item-label>Email</q-item-label>
                <q-item-label caption>{{ licenseInfo.email }}</q-item-label>
              </q-item-section>
            </q-item>

            <q-item>
              <q-item-section>
                <q-item-label>Date d'activation</q-item-label>
                <q-item-label caption>{{ formatDate(licenseInfo.activationDate) }}</q-item-label>
              </q-item-section>
            </q-item>

            <q-item>
              <q-item-section>
                <q-item-label>Date d'expiration</q-item-label>
                <q-item-label caption>
                  <span :class="daysRemaining && daysRemaining <= 30 ? 'text-negative' : ''">
                    {{ formatDate(licenseInfo.expirationDate) }}
                    <span v-if="daysRemaining">({{ daysRemaining }} jours restants)</span>
                  </span>
                </q-item-label>
              </q-item-section>
            </q-item>
          </q-list>

          <div v-if="!isActivation" class="row justify-end q-gutter-sm">
            <q-btn label="Désactiver" color="negative" outline @click="deactivateLicense" />
            <q-btn label="Fermer" color="primary" @click="$emit('close')" />
          </div>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useQuasar } from 'quasar';
import type { LicenseInfo } from '../types/license';

interface Props {
  modelValue: boolean;
  isActivation?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  isActivation: false,
});

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (e: 'close'): void;
  (e: 'activated'): void;
}>();

const $q = useQuasar();

const show = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
});

const tab = ref('activate');
const machineId = ref('');
const licenseKey = ref('');
const trialCompany = ref('');
const trialEmail = ref('');
const loading = ref(false);
const error = ref('');
const licenseInfo = ref<LicenseInfo | null>(null);
const daysRemaining = ref<number | undefined>();

onMounted(async () => {
  if (window.licenseAPI) {
    machineId.value = await window.licenseAPI.getMachineId();
    await loadLicenseInfo();
  }
});

async function loadLicenseInfo() {
  if (!window.licenseAPI) return;

  const validation = await window.licenseAPI.validateLicense();
  if (validation.valid && validation.licenseInfo) {
    licenseInfo.value = validation.licenseInfo;
    daysRemaining.value = validation.daysRemaining;
  }
}

function copyMachineId() {
  void navigator.clipboard.writeText(machineId.value);
  $q.notify({
    message: 'ID de machine copié dans le presse-papier',
    color: 'positive',
    icon: 'check',
    position: 'top',
  });
}

async function activateLicense() {
  if (!window.licenseAPI) return;

  loading.value = true;
  error.value = '';

  try {
    const result = await window.licenseAPI.activateLicense(licenseKey.value.trim());

    if (result.success) {
      $q.notify({
        message: 'Licence activée avec succès !',
        color: 'positive',
        icon: 'check_circle',
        position: 'top',
      });

      await loadLicenseInfo();
      emit('activated');

      if (props.isActivation) {
        // Recharger l'application
        setTimeout(() => {
          void window.location.reload();
        }, 1000);
      }
    } else {
      error.value = result.error || "Erreur lors de l'activation";
      $q.notify({
        message: error.value,
        color: 'negative',
        icon: 'error',
        position: 'top',
      });
    }
  } catch {
    error.value = "Erreur lors de l'activation de la licence";
    $q.notify({
      message: error.value,
      color: 'negative',
      icon: 'error',
      position: 'top',
    });
  } finally {
    loading.value = false;
  }
}

async function activateTrialLicense() {
  if (!window.licenseAPI) return;

  loading.value = true;
  error.value = '';

  try {
    const trialKey = await window.licenseAPI.generateTrialLicense(
      trialCompany.value,
      trialEmail.value,
    );

    const result = await window.licenseAPI.activateLicense(trialKey);

    if (result.success) {
      $q.notify({
        message: "Version d'essai activée avec succès ! (7 jours)",
        color: 'positive',
        icon: 'check_circle',
        position: 'top',
      });

      await loadLicenseInfo();
      emit('activated');

      if (props.isActivation) {
        setTimeout(() => {
          void window.location.reload();
        }, 1000);
      }
    } else {
      error.value = result.error || "Erreur lors de l'activation";
      $q.notify({
        message: error.value,
        color: 'negative',
        icon: 'error',
        position: 'top',
      });
    }
  } catch {
    error.value = "Erreur lors de l'activation de la version d'essai";
    $q.notify({
      message: error.value,
      color: 'negative',
      icon: 'error',
      position: 'top',
    });
  } finally {
    loading.value = false;
  }
}

function deactivateLicense() {
  if (!window.licenseAPI) return;

  $q.dialog({
    title: 'Confirmation',
    message: 'Êtes-vous sûr de vouloir désactiver la licence ?',
    cancel: true,
    persistent: true,
  }).onOk(() => {
    void (async () => {
      const success = await window.licenseAPI.deactivateLicense();

      if (success) {
        $q.notify({
          message: 'Licence désactivée',
          color: 'info',
          icon: 'info',
          position: 'top',
        });

        licenseInfo.value = null;
        emit('close');

        setTimeout(() => {
          void window.location.reload();
        }, 1000);
      } else {
        $q.notify({
          message: 'Erreur lors de la désactivation',
          color: 'negative',
          icon: 'error',
          position: 'top',
        });
      }
    })();
  });
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function getLicenseTypeLabel(type: string) {
  const labels: Record<string, string> = {
    trial: "Version d'essai",
    standard: 'Standard',
    premium: 'Premium',
    enterprise: 'Enterprise',
  };
  return labels[type] || type;
}

function getLicenseTypeColor(type: string) {
  const colors: Record<string, string> = {
    trial: 'orange',
    standard: 'blue',
    premium: 'purple',
    enterprise: 'green',
  };
  return colors[type] || 'grey';
}
</script>

<style scoped lang="scss">
.license-intro-card {
  padding: 14px 16px;
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 18px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.82), rgba(248, 250, 252, 0.9));
}

.license-intro-copy {
  color: #64748b;
  font-size: 0.9rem;
  line-height: 1.5;
}

.license-machine-banner {
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.84), rgba(248, 250, 252, 0.92));
}
</style>
