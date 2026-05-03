<template>
  <q-page class="flex flex-center login-page">
    <!-- Carte de connexion -->
    <q-card class="login-card q-pa-lg">
      <!-- En-tête avec logo -->
      <q-card-section class="text-center q-pb-md">
        <div class="login-eyebrow q-mb-sm">Plateforme budgétaire intégrée</div>
        <div class="logo-wrapper q-mb-md">
          <img :src="logoMairie" alt="Logo Mairie" class="logo-image" />
        </div>
        <div class="text-h4 text-weight-bold q-mb-xs">SIGOBC</div>
        <div class="text-subtitle1 text-grey-7">
          Système Informatique de Gestion des opérations Budgétaires des Collectivités
        </div>
        <div class="login-badges q-mt-md">
          <q-chip dense outline color="primary" icon="shield">Accès sécurisé</q-chip>
          <q-chip dense outline color="secondary" icon="dashboard_customize"
            >Interface unifiée</q-chip
          >
        </div>
      </q-card-section>

      <q-card-section>
        <q-form @submit="onSubmit" class="q-gutter-md">
          <div class="input-wrapper">
            <q-input
              v-model="username"
              outlined
              dense
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
              outlined
              dense
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

          <q-banner class="login-tip-banner" rounded>
            <template v-slot:avatar>
              <q-icon name="tips_and_updates" color="primary" />
            </template>
            Utilisez votre compte administrateur ou opérateur pour accéder à la plateforme.
          </q-banner>

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
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { useAuthStore } from 'src/stores/auth-store';
import logoMairie from '/logo-mairie-gboguhe.png';

const router = useRouter();
const $q = useQuasar();
const authStore = useAuthStore();

const username = ref('');
const password = ref('');
const rememberMe = ref(false);
const isPwd = ref(true);
const loading = ref(false);
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

.logo-image {
  width: 120px;
  height: 120px;
  object-fit: contain;
  animation: logoFloat 3s ease-in-out infinite;
}

.login-eyebrow {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 6px 12px;
  border-radius: 999px;
  background: linear-gradient(135deg, rgba(27, 94, 59, 0.08), rgba(197, 168, 77, 0.12));
  color: #47627e;
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.login-badges {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 8px;
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
  border-radius: 14px;
  min-height: 48px;
  font-weight: 700;
  letter-spacing: 0.3px;
}

.login-tip-banner {
  border-radius: 16px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.84), rgba(248, 250, 252, 0.92));
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

  .logo-image {
    width: 90px;
    height: 90px;
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
