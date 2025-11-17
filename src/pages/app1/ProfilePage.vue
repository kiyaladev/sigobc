<template>
  <q-page class="q-pa-md">
    <div class="row q-col-gutter-md">
      <!-- Informations du profil -->
      <div class="col-12 col-md-4">
        <q-card class="profile-card">
          <q-card-section class="text-center bg-primary text-white">
            <q-avatar size="100px" color="white" text-color="primary">
              <span class="text-h4">{{ userInitials }}</span>
            </q-avatar>
            <div class="text-h6 q-mt-md">{{ authStore.userName }}</div>
            <div class="text-caption">{{ roleLabel }}</div>
            <q-chip outline color="white" text-color="white" class="q-mt-sm">
              <q-icon name="verified_user" left />
              {{ authStore.userRole.toUpperCase() }}
            </q-chip>
          </q-card-section>

          <q-card-section>
            <q-list>
              <q-item>
                <q-item-section avatar>
                  <q-icon name="email" color="primary" />
                </q-item-section>
                <q-item-section>
                  <q-item-label caption>Email</q-item-label>
                  <q-item-label>{{ currentUser?.email }}</q-item-label>
                </q-item-section>
              </q-item>

              <q-item>
                <q-item-section avatar>
                  <q-icon name="badge" color="primary" />
                </q-item-section>
                <q-item-section>
                  <q-item-label caption>Nom d'utilisateur</q-item-label>
                  <q-item-label>{{ currentUser?.username }}</q-item-label>
                </q-item-section>
              </q-item>

              <q-item>
                <q-item-section avatar>
                  <q-icon name="calendar_today" color="primary" />
                </q-item-section>
                <q-item-section>
                  <q-item-label caption>Dernière connexion</q-item-label>
                  <q-item-label>{{ formatDate(currentUser?.derniereConnexion) }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
      </div>

      <!-- Formulaire d'édition -->
      <div class="col-12 col-md-8">
        <q-card>
          <q-tabs
            v-model="tab"
            dense
            class="text-grey"
            active-color="primary"
            indicator-color="primary"
            align="justify"
          >
            <q-tab name="info" label="Informations" icon="person" />
            <q-tab name="security" label="Sécurité" icon="lock" />
          </q-tabs>

          <q-separator />

          <q-tab-panels v-model="tab" animated>
            <!-- Onglet Informations -->
            <q-tab-panel name="info">
              <div class="text-h6 q-mb-md">Informations personnelles</div>
              <q-form @submit="onUpdateProfile" class="q-gutter-md">
                <div class="row q-col-gutter-md">
                  <div class="col-12 col-sm-6">
                    <q-input
                      v-model="profileForm.nom"
                      filled
                      label="Nom"
                      lazy-rules
                      :rules="[val => !!val || 'Le nom est requis']"
                    >
                      <template v-slot:prepend>
                        <q-icon name="person" />
                      </template>
                    </q-input>
                  </div>

                  <div class="col-12 col-sm-6">
                    <q-input
                      v-model="profileForm.prenom"
                      filled
                      label="Prénom"
                      lazy-rules
                      :rules="[val => !!val || 'Le prénom est requis']"
                    >
                      <template v-slot:prepend>
                        <q-icon name="person" />
                      </template>
                    </q-input>
                  </div>

                  <div class="col-12">
                    <q-input
                      v-model="profileForm.email"
                      filled
                      type="email"
                      label="Email"
                      lazy-rules
                      :rules="[
                        val => !!val || 'L\'email est requis',
                        val => /.+@.+\..+/.test(val) || 'Email invalide'
                      ]"
                    >
                      <template v-slot:prepend>
                        <q-icon name="email" />
                      </template>
                    </q-input>
                  </div>
                </div>

                <div class="q-mt-lg">
                  <q-btn
                    type="submit"
                    label="Enregistrer les modifications"
                    color="primary"
                    icon="save"
                    :loading="loadingProfile"
                  />
                </div>
              </q-form>
            </q-tab-panel>

            <!-- Onglet Sécurité -->
            <q-tab-panel name="security">
              <div class="text-h6 q-mb-md">Changer le mot de passe</div>
              <q-form @submit="onChangePassword" class="q-gutter-md">
                <q-input
                  v-model="passwordForm.oldPassword"
                  filled
                  type="password"
                  label="Mot de passe actuel"
                  lazy-rules
                  :rules="[val => !!val || 'Le mot de passe actuel est requis']"
                >
                  <template v-slot:prepend>
                    <q-icon name="lock" />
                  </template>
                </q-input>

                <q-input
                  v-model="passwordForm.newPassword"
                  filled
                  type="password"
                  label="Nouveau mot de passe"
                  lazy-rules
                  :rules="[
                    val => !!val || 'Le nouveau mot de passe est requis',
                    val => val.length >= 6 || 'Le mot de passe doit contenir au moins 6 caractères'
                  ]"
                >
                  <template v-slot:prepend>
                    <q-icon name="lock" />
                  </template>
                </q-input>

                <q-input
                  v-model="passwordForm.confirmPassword"
                  filled
                  type="password"
                  label="Confirmer le nouveau mot de passe"
                  lazy-rules
                  :rules="[
                    val => !!val || 'La confirmation est requise',
                    val => val === passwordForm.newPassword || 'Les mots de passe ne correspondent pas'
                  ]"
                >
                  <template v-slot:prepend>
                    <q-icon name="lock" />
                  </template>
                </q-input>

                <q-banner class="bg-info text-white" rounded>
                  <template v-slot:avatar>
                    <q-icon name="info" />
                  </template>
                  Le mot de passe doit contenir au moins 6 caractères
                </q-banner>

                <div class="q-mt-lg">
                  <q-btn
                    type="submit"
                    label="Changer le mot de passe"
                    color="primary"
                    icon="vpn_key"
                    :loading="loadingPassword"
                  />
                </div>
              </q-form>
            </q-tab-panel>
          </q-tab-panels>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { useAuthStore } from 'src/stores/auth-store';
import { date } from 'quasar';

const $q = useQuasar();
const authStore = useAuthStore();

const tab = ref('info');
const loadingProfile = ref(false);
const loadingPassword = ref(false);

const currentUser = computed(() => authStore.currentUser);

const userInitials = computed(() => {
  if (!currentUser.value) return '';
  const initials = `${currentUser.value.prenom[0]}${currentUser.value.nom[0]}`;
  return initials.toUpperCase();
});

const roleLabel = computed(() => {
  const roles: Record<string, string> = {
    admin: 'Administrateur',
    gestionnaire: 'Gestionnaire',
    operateur: 'Opérateur',
  };
  return roles[authStore.userRole] || 'Utilisateur';
});

const profileForm = ref({
  nom: '',
  prenom: '',
  email: '',
});

const passwordForm = ref({
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
});

function formatDate(dateValue: Date | undefined) {
  if (!dateValue) return 'Jamais';
  return date.formatDate(dateValue, 'DD/MM/YYYY HH:mm');
}

async function onUpdateProfile() {
  loadingProfile.value = true;

  try {
    const success = await authStore.updateProfile({
      nom: profileForm.value.nom,
      prenom: profileForm.value.prenom,
      email: profileForm.value.email,
    });

    if (success) {
      $q.notify({
        type: 'positive',
        message: 'Profil mis à jour avec succès',
        icon: 'check_circle',
      });
    } else {
      $q.notify({
        type: 'negative',
        message: 'Erreur lors de la mise à jour du profil',
        icon: 'error',
      });
    }
  } catch (error) {
    console.error('Erreur:', error);
    $q.notify({
      type: 'negative',
      message: 'Une erreur est survenue',
      icon: 'error',
    });
  } finally {
    loadingProfile.value = false;
  }
}

async function onChangePassword() {
  loadingPassword.value = true;

  try {
    const success = await authStore.changePassword(
      passwordForm.value.oldPassword,
      passwordForm.value.newPassword
    );

    if (success) {
      $q.notify({
        type: 'positive',
        message: 'Mot de passe changé avec succès',
        icon: 'check_circle',
      });

      // Réinitialiser le formulaire
      passwordForm.value = {
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
      };
    } else {
      $q.notify({
        type: 'negative',
        message: 'Mot de passe actuel incorrect',
        icon: 'error',
      });
    }
  } catch (error) {
    console.error('Erreur:', error);
    $q.notify({
      type: 'negative',
      message: 'Une erreur est survenue',
      icon: 'error',
    });
  } finally {
    loadingPassword.value = false;
  }
}

onMounted(() => {
  if (currentUser.value) {
    profileForm.value = {
      nom: currentUser.value.nom,
      prenom: currentUser.value.prenom,
      email: currentUser.value.email,
    };
  }
});
</script>

<style scoped lang="scss">
.profile-card {
  height: 100%;
}
</style>
