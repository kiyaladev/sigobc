<template>
  <q-layout view="lHh Lpr lFf" :class="{ 'demo-mode-active': demoStore.isActive }">
    <!-- Bannière Mode Démo -->
    <DemoBanner />

    <q-header elevated class="modern-header print-hide">
      <q-toolbar class="q-py-sm">
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
          class="menu-btn hover-scale"
        >
          <q-tooltip anchor="bottom middle" self="top middle" :offset="[0, 8]"> Menu </q-tooltip>
        </q-btn>

        <q-space />

        <!-- Toggle mode sombre -->
        <ThemeToggle class="q-mr-sm" />

        <!-- Notifications -->
        <q-btn flat round dense icon="notifications" class="q-mr-sm hover-scale">
          <q-badge color="negative" floating rounded>3</q-badge>
          <q-tooltip>Notifications</q-tooltip>
        </q-btn>

        <!-- Menu utilisateur -->
        <q-btn flat round dense class="user-menu-btn">
          <q-avatar size="36px" color="accent" text-color="white" class="hover-glow">
            <q-icon name="account_circle" size="24px" />
          </q-avatar>
          <q-menu transition-show="jump-down" transition-hide="jump-up" class="modern-menu">
            <q-list style="min-width: 220px" class="q-pa-sm">
              <q-item class="user-info-item q-mb-sm">
                <q-item-section avatar>
                  <q-avatar size="48px" color="accent" text-color="white">
                    <q-icon name="account_circle" size="32px" />
                  </q-avatar>
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-bold">{{ authStore.userName }}</q-item-label>
                  <q-item-label caption lines="1">{{ authStore.userRole }}</q-item-label>
                </q-item-section>
              </q-item>

              <q-separator class="q-my-sm" />

              <q-item clickable v-close-popup @click="router.push('/profile')" class="menu-item">
                <q-item-section avatar>
                  <q-icon name="person" color="grey-7" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Mon Profil</q-item-label>
                </q-item-section>
              </q-item>

              <q-item clickable v-close-popup class="menu-item">
                <q-item-section avatar>
                  <q-icon name="settings" color="grey-7" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Paramètres</q-item-label>
                </q-item-section>
              </q-item>

              <q-item clickable v-close-popup @click="openLicenseDialog" class="menu-item">
                <q-item-section avatar>
                  <q-icon
                    name="verified"
                    :color="licenseStore.isLicensed ? 'positive' : 'warning'"
                  />
                </q-item-section>
                <q-item-section>
                  <q-item-label>
                    Licence
                    <q-chip v-if="licenseStore.licenseType" size="sm" dense class="q-ml-xs">
                      {{ licenseStore.licenseType }}
                    </q-chip>
                  </q-item-label>
                  <q-item-label caption v-if="licenseStore.daysRemaining">
                    {{ licenseStore.daysRemaining }} jours restants
                  </q-item-label>
                </q-item-section>
              </q-item>

              <q-separator class="q-my-sm" />

              <q-item clickable v-close-popup @click="onLogout" class="menu-item logout-item">
                <q-item-section avatar>
                  <q-icon name="logout" color="negative" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-negative">Déconnexion</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
      class="modern-drawer print-hide"
      :width="280"
    >
      <!-- Logo et titre -->
      <q-item class="drawer-header q-pa-lg">
        <q-item-section avatar>
          <div class="logo-container">
            <q-icon name="account_balance" size="56px" class="logo-icon-large" />
          </div>
        </q-item-section>
        <q-item-section>
          <q-item-label class="text-h5 text-weight-bold">SIGOBC</q-item-label>
          <small style="font-size: 0.5rem">
            Système Informatique de Gestion des Opérations Budgétaires des Collectivités
          </small>
        </q-item-section>
      </q-item>

      <q-list padding class="q-px-sm">
        <!-- ===== 4. GESTION DES DÉPENSES ===== -->
        <q-item-label header class="text-grey-7 text-weight-medium q-px-md">
          <q-icon name="receipt" size="18px" class="q-mr-xs" />
          Gestion des Dépenses
        </q-item-label>

        <q-item
          clickable
          v-ripple
          to="/app3/dashboard"
          class="nav-item q-mb-xs"
          active-class="nav-item-active"
        >
          <q-item-section avatar>
            <q-icon name="dashboard" color="deep-orange" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Dashboard Dépenses</q-item-label>
          </q-item-section>
        </q-item>

        <q-item
          clickable
          v-ripple
          to="/app3/chapitres"
          class="nav-item q-mb-xs"
          active-class="nav-item-active"
        >
          <q-item-section avatar>
            <q-icon name="category" color="deep-orange" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Natures de Dépense</q-item-label>
          </q-item-section>
        </q-item>

        <q-item
          clickable
          v-ripple
          to="/app3/sous-chapitres"
          class="nav-item q-mb-xs"
          active-class="nav-item-active"
        >
          <q-item-section avatar>
            <q-icon name="view_list" color="deep-orange" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Comptes Fonctionnels</q-item-label>
          </q-item-section>
        </q-item>

        <q-item
          clickable
          v-ripple
          to="/app3/previsions"
          class="nav-item q-mb-xs"
          active-class="nav-item-active"
        >
          <q-item-section avatar>
            <q-icon name="pie_chart" color="deep-orange" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Prévisions</q-item-label>
          </q-item-section>
        </q-item>

        <q-item
          clickable
          v-ripple
          to="/app3/mandats"
          class="nav-item q-mb-xs"
          active-class="nav-item-active"
        >
          <q-item-section avatar>
            <q-icon name="receipt" color="deep-orange" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Mandats</q-item-label>
          </q-item-section>
        </q-item>

        <q-item
          clickable
          v-ripple
          to="/app3/bordereaux-mandats-gestion"
          class="nav-item q-mb-xs"
          active-class="nav-item-active"
        >
          <q-item-section avatar>
            <q-icon name="folder_open" color="deep-orange" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Bordereaux Mandats</q-item-label>
          </q-item-section>
        </q-item>

        <q-item
          clickable
          v-ripple
          to="/app3/statistiques"
          class="nav-item q-mb-xs"
          active-class="nav-item-active"
        >
          <q-item-section avatar>
            <q-icon name="bar_chart" color="deep-orange" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Statistiques Dépenses</q-item-label>
          </q-item-section>
        </q-item>

        <q-separator class="q-my-md" />

        <!-- ===== 5. GESTION DES RECETTES ===== -->
        <q-item-label header class="text-grey-7 text-weight-medium q-px-md">
          <q-icon name="payments" size="18px" class="q-mr-xs" />
          Gestion des Recettes
        </q-item-label>

        <q-item
          clickable
          v-ripple
          to="/app6/dashboard"
          class="nav-item q-mb-xs"
          active-class="nav-item-active"
        >
          <q-item-section avatar>
            <q-icon name="dashboard" color="green" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Dashboard Recettes</q-item-label>
          </q-item-section>
        </q-item>

        <q-item
          clickable
          v-ripple
          to="/app6/declarations"
          class="nav-item q-mb-xs"
          active-class="nav-item-active"
        >
          <q-item-section avatar>
            <q-icon name="description" color="green" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Déclarations</q-item-label>
          </q-item-section>
        </q-item>

        <q-item
          clickable
          v-ripple
          to="/app6/mandats-recette"
          class="nav-item q-mb-xs"
          active-class="nav-item-active"
        >
          <q-item-section avatar>
            <q-icon name="receipt" color="green" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Mandats de Recette</q-item-label>
          </q-item-section>
        </q-item>

        <q-item
          clickable
          v-ripple
          to="/app6/bordereaux"
          class="nav-item q-mb-xs"
          active-class="nav-item-active"
        >
          <q-item-section avatar>
            <q-icon name="folder" color="green" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Bordereaux Recettes</q-item-label>
          </q-item-section>
        </q-item>

        <q-item
          clickable
          v-ripple
          to="/app6/bordereaux-mandats-recette"
          class="nav-item q-mb-xs"
          active-class="nav-item-active"
        >
          <q-item-section avatar>
            <q-icon name="folder_open" color="green" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Bordereaux Ordres Recettes</q-item-label>
          </q-item-section>
        </q-item>

        <q-item
          clickable
          v-ripple
          to="/app6/previsions"
          class="nav-item q-mb-xs"
          active-class="nav-item-active"
        >
          <q-item-section avatar>
            <q-icon name="trending_up" color="green" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Prévisions Recettes</q-item-label>
          </q-item-section>
        </q-item>

        <q-item
          clickable
          v-ripple
          to="/app6/taxes"
          class="nav-item q-mb-xs"
          active-class="nav-item-active"
        >
          <q-item-section avatar>
            <q-icon name="account_balance" color="green" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Taxes</q-item-label>
          </q-item-section>
        </q-item>

        <q-item
          clickable
          v-ripple
          to="/app6/statistiques"
          class="nav-item q-mb-xs"
          active-class="nav-item-active"
        >
          <q-item-section avatar>
            <q-icon name="bar_chart" color="green" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Statistiques Recettes</q-item-label>
          </q-item-section>
        </q-item>

        <q-separator class="q-my-md" />

        <!-- ===== ADMINISTRATION ===== -->
        <template v-if="authStore.isAdmin">
          <q-item-label header class="text-grey-7 text-weight-medium q-px-md">
            <q-icon name="admin_panel_settings" size="18px" class="q-mr-xs" />
            Administration
          </q-item-label>

          <q-item
            clickable
            v-ripple
            to="/utilisateurs"
            class="nav-item q-mb-xs"
            active-class="nav-item-active"
          >
            <q-item-section avatar>
              <q-icon name="manage_accounts" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Utilisateurs</q-item-label>
            </q-item-section>
          </q-item>

          <q-item
            clickable
            v-ripple
            to="/mairies"
            class="nav-item q-mb-xs"
            active-class="nav-item-active"
          >
            <q-item-section avatar>
              <q-icon name="location_city" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Mairies</q-item-label>
            </q-item-section>
          </q-item>

          <q-item
            clickable
            v-ripple
            to="/statistiques"
            class="nav-item q-mb-xs"
            active-class="nav-item-active"
          >
            <q-item-section avatar>
              <q-icon name="bar_chart" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Statistiques Globales</q-item-label>
            </q-item-section>
          </q-item>

          <q-item
            clickable
            v-ripple
            to="/admin/seeders"
            class="nav-item q-mb-xs"
            active-class="nav-item-active"
          >
            <q-item-section avatar>
              <q-icon name="database" color="grey-7" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Seeders (Test)</q-item-label>
            </q-item-section>
          </q-item>

          <q-item
            clickable
            v-ripple
            to="/admin/backup"
            class="nav-item q-mb-xs"
            active-class="nav-item-active"
          >
            <q-item-section avatar>
              <q-icon name="backup" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Sauvegarde</q-item-label>
            </q-item-section>
          </q-item>
        </template>
      </q-list>
    </q-drawer>

    <q-page-container class="modern-page-container">
      <router-view v-slot="{ Component }">
        <transition
          appear
          enter-active-class="animated fadeIn"
          leave-active-class="animated fadeOut"
          mode="out-in"
        >
          <component :is="Component" />
        </transition>
      </router-view>
    </q-page-container>

    <!-- Dialog de gestion de licence -->
    <LicenseDialog
      v-model="showLicenseDialog"
      @close="showLicenseDialog = false"
      @activated="licenseStore.checkLicense()"
    />
  </q-layout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { useAuthStore } from 'src/stores/auth-store';
import { useLicenseStore } from 'src/stores/license-store';
import { useDemoStore } from 'src/stores/demo-store';
import ThemeToggle from 'src/components/ThemeToggle.vue';
import LicenseDialog from 'src/components/LicenseDialog.vue';
import DemoBanner from 'src/components/DemoBanner.vue';

const router = useRouter();
const $q = useQuasar();
const authStore = useAuthStore();
const licenseStore = useLicenseStore();
const demoStore = useDemoStore();

const leftDrawerOpen = ref(false);
const showLicenseDialog = ref(false);

onMounted(async () => {
  // Vérifier si une session démo est active
  demoStore.checkDemoSession();

  // Vérifier la licence au démarrage
  await licenseStore.checkLicense();

  // Afficher un avertissement si la licence expire bientôt
  if (licenseStore.isExpiringSoon && licenseStore.daysRemaining) {
    $q.notify({
      type: 'warning',
      message: `Votre licence expire dans ${licenseStore.daysRemaining} jour(s)`,
      caption: 'Veuillez renouveler votre licence',
      timeout: 5000,
      actions: [
        {
          label: 'Voir',
          color: 'white',
          handler: () => {
            showLicenseDialog.value = true;
          },
        },
      ],
    });
  }
});

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value;
}

function openLicenseDialog() {
  showLicenseDialog.value = true;
}

function onLogout() {
  $q.dialog({
    title: 'Déconnexion',
    message: 'Voulez-vous vraiment vous déconnecter ?',
    cancel: {
      label: 'Annuler',
      flat: true,
    },
    ok: {
      label: 'Déconnexion',
      color: 'negative',
    },
    persistent: true,
  }).onOk(() => {
    void (async () => {
      authStore.logout();
      $q.notify({
        type: 'info',
        message: 'Vous êtes déconnecté',
        icon: 'logout',
      });
      await router.push('/login');
    })();
  });
}
</script>

<style scoped lang="scss">
// Header moderne
.modern-header {
  background: #ffffff;
  backdrop-filter: blur(6px);
  border-bottom: 1px solid #e5e7eb;
}

.toolbar-title {
  animation: slideInRight 0.5s ease-out;
}

.logo-icon {
  animation: scaleIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.menu-btn {
  transition: transform 0.3s ease;

  &:hover {
    transform: rotate(90deg);
  }
}

.user-menu-btn {
  transition: all 0.3s ease;

  &:hover {
    transform: scale(1.1);
  }
}

// Drawer moderne
.modern-drawer {
  background: linear-gradient(180deg, #ffffff 0%, #f9fafb 100%);
  box-shadow: 4px 0 12px rgba(0, 0, 0, 0.05);
}

.drawer-header {
  background: #ffffff;
  border-bottom: 3px solid #e67e22;
}

.logo-container {
  background: rgba(255, 255, 255, 0.2);
  padding: 12px;
  border-radius: 12px;
  backdrop-filter: blur(10px);
}

.logo-icon-large {
  color: white;
  filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1));
}

// Navigation items
.nav-item {
  border-radius: 12px;
  margin: 4px 8px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    width: 4px;
    background: #e67e22;
    transform: scaleY(0);
    transition: transform 0.3s ease;
  }

  &:hover {
    background-color: rgba(0, 0, 0, 0.04);
    transform: translateX(4px);
    &::before {
      transform: scaleY(1);
    }
  }

  .q-icon {
    transition: all 0.3s ease;
  }

  &:hover .q-icon {
    transform: scale(1.1);
    color: #ff6600;
  }
}

.nav-item-active {
  background-color: rgba(0, 0, 0, 0.04);
  font-weight: 600;

  &::before {
    transform: scaleY(1);
  }

  .q-icon {
    color: #e67e22;
  }

  .q-item-label {
    color: #e67e22;
  }
} // Menu utilisateur
.modern-menu {
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  overflow: hidden;
}

.user-info-item {
  background: linear-gradient(135deg, rgba(255, 102, 0, 0.1) 0%, rgba(34, 197, 94, 0.1) 100%);
  border-radius: 8px;
}

.menu-item {
  border-radius: 8px;
  margin: 2px 0;
  transition: all 0.2s ease;

  &:hover {
    background-color: rgba(0, 0, 0, 0.04);
    transform: translateX(4px);
  }
}

.logout-item:hover {
  background-color: rgba(244, 63, 94, 0.08);
}

// Page container
.modern-page-container {
  background: linear-gradient(135deg, #f5f7fa 0%, #e8edf2 100%);
  min-height: 100vh;
  padding: 24px;
}

// Animations
@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
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

.animated {
  animation-duration: 0.4s;
  animation-fill-mode: both;
}

.fadeIn {
  animation-name: fadeIn;
}

.fadeOut {
  animation-name: fadeOut;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeOut {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
    transform: translateY(-10px);
  }
}

// Mode démo actif - décaler le contenu pour la bannière
.demo-mode-active {
  .modern-header {
    margin-top: 40px;
  }

  .q-drawer {
    top: 40px !important;
  }
}

// Responsive
@media (max-width: 1024px) {
  .modern-page-container {
    padding: 16px;
  }
}

@media (max-width: 600px) {
  .modern-page-container {
    padding: 12px;
  }

  .demo-mode-active {
    .modern-header {
      margin-top: 80px;
    }

    .q-drawer {
      top: 80px !important;
    }
  }
}
</style>
