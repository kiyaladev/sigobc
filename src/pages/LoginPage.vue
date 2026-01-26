<template>
  <q-page class="flex flex-center login-page">
    <!-- Carte de connexion -->
    <q-card class="login-card q-pa-lg">
      <!-- En-tête avec logo -->
      <q-card-section class="text-center q-pb-md">
        <div class="logo-wrapper q-mb-md">
          <q-icon name="account_balance" class="logo-icon" />
        </div>
        <div class="text-h4 text-weight-bold q-mb-xs">SIGOBC</div>
        <div class="text-subtitle1 text-grey-7">
          Système Informatique de Gestion des opérations Budgétaires des Collectivités
        </div>
      </q-card-section>

      <q-card-section>
        <q-form @submit="onSubmit" class="q-gutter-md">
          <div class="input-wrapper">
            <q-input
              v-model="username"
              filled
              label="Nom d'utilisateur"
              lazy-rules
              :rules="[(val) => (val && val.length > 0) || 'Le nom d\'utilisateur est requis']"
              :disable="loading"
              class="modern-input"
            >
              <template v-slot:prepend>
                <q-icon name="person" color="grey-7" class="input-icon" />
              </template>
            </q-input>
          </div>

          <div class="input-wrapper">
            <q-input
              v-model="password"
              filled
              :type="isPwd ? 'password' : 'text'"
              label="Mot de passe"
              lazy-rules
              :rules="[(val) => (val && val.length > 0) || 'Le mot de passe est requis']"
              :disable="loading"
              @keyup.enter="onSubmit"
              class="modern-input"
            >
              <template v-slot:prepend>
                <q-icon name="lock" color="grey-7" class="input-icon" />
              </template>
              <template v-slot:append>
                <q-icon
                  :name="isPwd ? 'visibility_off' : 'visibility'"
                  class="cursor-pointer password-toggle"
                  @click="isPwd = !isPwd"
                />
              </template>
            </q-input>
          </div>

          <div class="row items-center justify-between">
            <q-toggle
              v-model="rememberMe"
              label="Se souvenir de moi"
              color="grey-7"
              :disable="loading"
              class="modern-toggle"
            />

            <q-btn
              flat
              dense
              label="Mot de passe oublié ?"
              color="grey-7"
              size="sm"
              @click="onForgotPassword"
              :disable="loading"
              class="forgot-btn"
            />
          </div>

          <div class="q-mt-lg">
            <q-btn
              type="submit"
              label="Se connecter"
              color="primary"
              class="full-width modern-submit-btn"
              size="lg"
              :loading="loading"
              :disable="loading"
              unelevated
            >
              <template v-slot:loading>
                <q-spinner-dots />
              </template>
            </q-btn>
          </div>

          <!-- Bouton Mode Démo -->
          <div class="q-mt-md">
            <q-btn
              label="Essayer en mode démo"
              color="warning"
              class="full-width demo-btn"
              size="md"
              icon="science"
              :loading="demoLoading"
              :disable="loading || demoLoading"
              outline
              @click="onDemoLogin"
            >
              <template v-slot:loading>
                <q-spinner-dots />
              </template>
            </q-btn>
          </div>
        </q-form>
      </q-card-section>

      <q-card-section class="q-pt-none text-center text-grey-6 text-caption">
        <q-separator class="q-mb-md" />
        <div class="footer-info">
          <div>Version 1.0.0</div>
          <div class="q-mt-xs">© 2025 SIGOBC - Tous droits réservés</div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Informations de démonstration -->
    <q-card class="demo-info scale-in q-pa-md q-mt-md" flat bordered>
      <div class="text-subtitle2 text-weight-bold q-mb-sm flex items-center">
        <q-icon name="science" color="warning" size="20px" class="q-mr-xs" />
        Mode Démonstration
      </div>
      <div class="text-caption text-grey-7 q-mb-sm">
        Testez l'application avec des fonctionnalités limitées :
      </div>
      <div class="demo-restrictions q-mb-md">
        <div class="demo-restriction-item">
          <q-icon name="check_circle" color="positive" size="16px" />
          <span>Accès en lecture à toutes les fonctionnalités</span>
        </div>
        <div class="demo-restriction-item">
          <q-icon name="warning" color="warning" size="16px" />
          <span>Création limitée (max 100 par type)</span>
        </div>
        <div class="demo-restriction-item">
          <q-icon name="cancel" color="negative" size="16px" />
          <span>Suppression et export complet désactivés</span>
        </div>
        <div class="demo-restriction-item">
          <q-icon name="schedule" color="info" size="16px" />
          <span>Session de 30 minutes</span>
        </div>
      </div>
      <q-separator class="q-my-sm" />
      <div class="text-caption text-grey-7">
        <div class="q-mb-xs demo-account" @click="fillAdminCredentials" role="button" tabindex="0">
          <q-chip size="sm" color="accent" text-color="grey-9" dense> Admin </q-chip>
          <span class="q-ml-sm">admin / admin123</span>
          <q-icon name="edit" size="16px" class="q-ml-xs" />
        </div>
      </div>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { useAuthStore } from 'src/stores/auth-store';

const router = useRouter();
const $q = useQuasar();
const authStore = useAuthStore();

const username = ref('');
const password = ref('');
const rememberMe = ref(false);
const isPwd = ref(true);
const loading = ref(false);
const demoLoading = ref(false);

//

async function onSubmit() {
  loading.value = true;

  try {
    const success = await authStore.login(username.value, password.value);

    if (success) {
      $q.notify({
        type: 'positive',
        message: `Bienvenue ${authStore.userName}`,
        icon: 'check_circle',
        position: 'top',
        progress: true,
      });

      await router.push('/');
    } else {
      $q.notify({
        type: 'negative',
        message: "Nom d'utilisateur ou mot de passe incorrect",
        icon: 'error',
        position: 'top',
      });
    }
  } catch (error) {
    console.error('Erreur de connexion:', error);
    $q.notify({
      type: 'negative',
      message: 'Une erreur est survenue lors de la connexion',
      icon: 'error',
      position: 'top',
    });
  } finally {
    loading.value = false;
  }
}

async function onDemoLogin() {
  demoLoading.value = true;

  try {
    const success = await authStore.loginDemo();

    if (success) {
      $q.notify({
        type: 'positive',
        message: 'Bienvenue en mode démonstration !',
        caption: 'Session limitée à 30 minutes',
        icon: 'science',
        position: 'top',
        progress: true,
        timeout: 4000,
      });

      await router.push('/');
    } else {
      $q.notify({
        type: 'negative',
        message: 'Erreur lors de la connexion en mode démo',
        icon: 'error',
        position: 'top',
      });
    }
  } catch (error) {
    console.error('Erreur de connexion démo:', error);
    $q.notify({
      type: 'negative',
      message: 'Une erreur est survenue',
      icon: 'error',
      position: 'top',
    });
  } finally {
    demoLoading.value = false;
  }
}

function fillAdminCredentials() {
  username.value = 'admin';
  password.value = 'admin123';
  $q.notify({
    type: 'info',
    message: 'Identifiants admin pré-remplis',
    icon: 'info',
    position: 'top',
    timeout: 1500,
  });
}

function onForgotPassword() {
  $q.notify({
    type: 'info',
    message: "Veuillez contacter l'administrateur système",
    icon: 'info',
    position: 'top',
  });
}
</script>

<style scoped lang="scss">
// Page de connexion
.login-page {
  min-height: 100vh;
  position: relative;
  overflow: hidden;
}

// Particules d'arrière-plan
/* pas de particules d'arrière-plan pour sobriété */

// Carte de connexion
.login-card {
  width: 100%;
  max-width: 480px;
  border-radius: 24px;
  backdrop-filter: blur(20px);
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  position: relative;
  z-index: 1;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 24px;
    padding: 2px;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.4), rgba(255, 255, 255, 0.1));
    -webkit-mask:
      linear-gradient(#fff 0 0) content-box,
      linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    pointer-events: none;
  }
}

// Logo
.logo-wrapper {
  position: relative;
  display: inline-block;
}

.logo-icon {
  font-size: 80px;
  color: #e67e22;
}

@keyframes logoFloat {
  0%,
  100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
}

/* texte sans gradient pour sobriété */

// Inputs modernes
.input-wrapper {
  position: relative;

  &:focus-within {
    .input-icon {
      transform: scale(1.2);
    }
  }
}

.modern-input {
  .q-field__control {
    border-radius: 12px;
    background: rgba(0, 0, 0, 0.02);
    transition: all 0.3s ease;

    &::before {
      border-color: transparent;
    }

    &:hover {
      background: rgba(0, 0, 0, 0.04);
    }
  }

  &.q-field--focused {
    .q-field__control {
      background: white;
    }
  }
}

.input-icon {
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.password-toggle {
  transition: all 0.3s ease;
}

// Toggle et boutons
.modern-toggle {
  :deep(.q-toggle__inner) {
    transition: all 0.3s ease;
  }
}

.forgot-btn {
  transition: all 0.3s ease;

  &:hover {
    transform: translateX(4px);
  }
}

// Bouton de soumission
.modern-submit-btn {
  border-radius: 12px;
  font-weight: 600;
  letter-spacing: 0.5px;
  background: #e67e22;
}

// Bouton Mode Démo
.demo-btn {
  border-radius: 12px;
  font-weight: 600;
  letter-spacing: 0.5px;
  border-width: 2px;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(243, 156, 18, 0.3);
  }
}

// Carte de démonstration
.demo-info {
  max-width: 480px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  position: relative;
  z-index: 1;
}

// Liste des restrictions démo
.demo-restrictions {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.demo-restriction-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;

  .q-icon {
    flex-shrink: 0;
  }
}

.demo-account {
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;

  &:hover {
    background: rgba(0, 0, 0, 0.04);
    transform: translateX(4px);

    .q-icon {
      opacity: 1;
      transform: scale(1.2);
    }
  }

  .q-icon {
    opacity: 0.6;
    transition: all 0.3s ease;
  }
}

// Footer
.footer-info {
  transition: all 0.3s ease;

  &:hover {
    transform: scale(1.02);
  }
}

// Animations d'entrée
.scale-in {
  animation: scaleIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

// Responsive
@media (max-width: 600px) {
  .login-card {
    max-width: 90%;
    padding: 16px !important;
    border-radius: 16px;
  }

  .demo-info {
    max-width: 90%;
  }

  .logo-icon {
    font-size: 64px;
  }

  .text-h4 {
    font-size: 1.75rem;
  }
}

// Mode paysage mobile
@media (max-height: 600px) and (orientation: landscape) {
  .login-page {
    padding: 20px 0;
  }

  .login-card {
    margin: 0;
  }

  .logo-wrapper {
    display: none;
  }
}
</style>
