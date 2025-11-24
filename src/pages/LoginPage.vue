<template>
  <q-page class="flex flex-center login-page">
    <!-- Particules d'arrière-plan -->
    <div class="particles-bg">
      <div class="particle" v-for="i in 20" :key="i" :style="getParticleStyle()"></div>
    </div>

    <!-- Carte de connexion -->
    <q-card class="login-card scale-in q-pa-lg shadow-24">
      <!-- En-tête avec logo -->
      <q-card-section class="text-center q-pb-md">
        <div class="logo-wrapper q-mb-md">
          <q-icon name="account_balance" class="logo-icon" />
        </div>
        <div class="text-h4 text-weight-bold gradient-text q-mb-xs">Trésor App</div>
        <div class="text-subtitle1 text-grey-6">Système de Gestion des Taxes Municipales</div>
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
                <q-icon name="person" color="primary" class="input-icon" />
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
                <q-icon name="lock" color="primary" class="input-icon" />
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
              color="primary"
              :disable="loading"
              class="modern-toggle"
            />

            <q-btn
              flat
              dense
              label="Mot de passe oublié ?"
              color="primary"
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
        </q-form>
      </q-card-section>

      <q-card-section class="q-pt-none text-center text-grey-6 text-caption">
        <q-separator class="q-mb-md" />
        <div class="footer-info">
          <div>Version 1.0.0</div>
          <div class="q-mt-xs">© 2025 Trésor App - Tous droits réservés</div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Informations de démonstration -->
    <q-card class="demo-info scale-in q-pa-md q-mt-md" flat bordered>
      <div class="text-subtitle2 text-weight-bold q-mb-sm flex items-center">
        <q-icon name="info" color="primary" size="20px" class="q-mr-xs" />
        Comptes de démonstration
      </div>
      <div class="text-caption text-grey-7">
        <div class="q-mb-xs demo-account" @click="fillAdminCredentials" role="button" tabindex="0">
          <q-chip size="sm" color="primary" text-color="white" dense> Admin </q-chip>
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

function getParticleStyle() {
  const size = Math.random() * 4 + 2;
  const duration = Math.random() * 20 + 10;
  const delay = Math.random() * 5;
  const left = Math.random() * 100;

  return {
    width: `${size}px`,
    height: `${size}px`,
    left: `${left}%`,
    animationDuration: `${duration}s`,
    animationDelay: `${delay}s`,
  };
}

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
.particles-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  pointer-events: none;
}

.particle {
  position: absolute;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 50%;
  animation: float linear infinite;
}

@keyframes float {
  0% {
    transform: translateY(100vh) rotate(0deg);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    transform: translateY(-100px) rotate(360deg);
    opacity: 0;
  }
}

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
  background: linear-gradient(135deg, #ff6600 0%, #22c55e 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: logoFloat 3s ease-in-out infinite;
  filter: drop-shadow(0 4px 8px rgba(255, 102, 0, 0.3));
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

.gradient-text {
  background: linear-gradient(135deg, #ff6600 0%, #22c55e 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

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
      box-shadow: 0 4px 12px rgba(255, 102, 0, 0.15);
    }
  }
}

.input-icon {
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.password-toggle {
  transition: all 0.3s ease;

  &:hover {
    transform: scale(1.2);
    color: #ff6600;
  }
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
  background: linear-gradient(135deg, #ff6600 0%, #22c55e 100%);
  box-shadow: 0 4px 15px rgba(255, 102, 0, 0.4);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.2);
    transform: translate(-50%, -50%);
    transition:
      width 0.6s,
      height 0.6s;
  }

  &:hover:not(:disabled) {
    transform: translateY(-3px);
    box-shadow: 0 8px 25px rgba(255, 102, 0, 0.5);

    &::before {
      width: 300px;
      height: 300px;
    }
  }

  &:active:not(:disabled) {
    transform: translateY(-1px);
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

.demo-account {
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;

  &:hover {
    background: rgba(255, 102, 0, 0.1);
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
