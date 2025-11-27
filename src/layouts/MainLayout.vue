<template>
  <q-layout view="lHh Lpr lFf">
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
                  <q-icon name="person" color="primary" />
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
          <q-item-label class="text-h5 text-weight-bold text-white">Trésor App</q-item-label>
          <q-item-label caption class="text-white text-opacity-90">Gestion Municipale</q-item-label>
        </q-item-section>
      </q-item>

      <q-scroll-area class="fit q-pt-md" style="height: calc(100% - 120px)">
        <q-list padding class="q-px-sm">
          <q-item-label header class="text-grey-7 text-weight-medium q-px-md">
            <q-icon name="dashboard" size="18px" class="q-mr-xs" />
            Declarations & Bordereaux
          </q-item-label>

          <q-item
            clickable
            v-ripple
            to="/"
            exact
            class="nav-item q-mb-xs"
            active-class="nav-item-active"
          >
            <q-item-section avatar>
              <q-icon name="dashboard" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Tableau de Bord</q-item-label>
            </q-item-section>
          </q-item>

          <q-item
            clickable
            v-ripple
            to="/declarations"
            class="nav-item q-mb-xs"
            active-class="nav-item-active"
          >
            <q-item-section avatar>
              <q-icon name="description" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Déclarations</q-item-label>
            </q-item-section>
          </q-item>

          <q-item
            clickable
            v-ripple
            to="/bordereaux"
            class="nav-item q-mb-xs"
            active-class="nav-item-active"
          >
            <q-item-section avatar>
              <q-icon name="receipt_long" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Bordereaux</q-item-label>
            </q-item-section>
          </q-item>

          <q-item
            clickable
            v-ripple
            to="/taxes"
            class="nav-item q-mb-xs"
            active-class="nav-item-active"
          >
            <q-item-section avatar>
              <q-icon name="calculate" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Taxes</q-item-label>
            </q-item-section>
          </q-item>

          <q-separator class="q-my-md" />

          <q-item-label header class="text-grey-7 text-weight-medium q-px-md">
            <q-icon name="confirmation_number" size="18px" class="q-mr-xs" />
            Gestion des Tickets
          </q-item-label>

          <q-item
            clickable
            v-ripple
            to="/app2/dashboard"
            class="nav-item q-mb-xs"
            active-class="nav-item-active"
          >
            <q-item-section avatar>
              <q-icon name="dashboard" color="teal" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Dashboard Tickets</q-item-label>
            </q-item-section>
          </q-item>

          <q-item
            clickable
            v-ripple
            to="/app2/sections"
            class="nav-item q-mb-xs"
            active-class="nav-item-active"
          >
            <q-item-section avatar>
              <q-icon name="folder_open" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Sections</q-item-label>
            </q-item-section>
          </q-item>

          <q-item
            clickable
            v-ripple
            to="/app2/balance-entree"
            class="nav-item q-mb-xs"
            active-class="nav-item-active"
          >
            <q-item-section avatar>
              <q-icon name="balance" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Balance d'Entrée</q-item-label>
            </q-item-section>
          </q-item>

          <q-item
            clickable
            v-ripple
            to="/app2/approvisionnements"
            class="nav-item q-mb-xs"
            active-class="nav-item-active"
          >
            <q-item-section avatar>
              <q-icon name="inventory" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Approvisionnements</q-item-label>
            </q-item-section>
          </q-item>

          <q-item
            clickable
            v-ripple
            to="/app2/remises"
            class="nav-item q-mb-xs"
            active-class="nav-item-active"
          >
            <q-item-section avatar>
              <q-icon name="local_shipping" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Remises</q-item-label>
            </q-item-section>
          </q-item>

          <q-item
            clickable
            v-ripple
            to="/app2/versements"
            class="nav-item q-mb-xs"
            active-class="nav-item-active"
          >
            <q-item-section avatar>
              <q-icon name="upload" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Versements</q-item-label>
            </q-item-section>
          </q-item>

          <q-item
            clickable
            v-ripple
            to="/app2/statistiques"
            class="nav-item q-mb-xs"
            active-class="nav-item-active"
          >
            <q-item-section avatar>
              <q-icon name="bar_chart" color="deep-purple" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Statistiques</q-item-label>
            </q-item-section>
          </q-item>

          <q-separator class="q-my-md" />

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
              <q-icon name="dashboard" color="purple" />
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
              <q-icon name="category" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Chapitres</q-item-label>
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
              <q-icon name="pie_chart" />
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
              <q-icon name="receipt" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Mandats</q-item-label>
            </q-item-section>
          </q-item>

          <q-item
            clickable
            v-ripple
            to="/app3/bordereaux-mandats"
            class="nav-item q-mb-xs"
            active-class="nav-item-active"
          >
            <q-item-section avatar>
              <q-icon name="description" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Bordereaux (Impression)</q-item-label>
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
              <q-icon name="folder_open" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Gestion Bordereaux</q-item-label>
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
              <q-icon name="bar_chart" color="indigo" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Statistiques</q-item-label>
            </q-item-section>
          </q-item>

          <template v-if="authStore.isAdmin">
            <q-separator class="q-my-md" />

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
                <q-item-label>Statistiques</q-item-label>
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
                <q-icon name="database" color="warning" />
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
      </q-scroll-area>
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
import ThemeToggle from 'src/components/ThemeToggle.vue';
import LicenseDialog from 'src/components/LicenseDialog.vue';

const router = useRouter();
const $q = useQuasar();
const authStore = useAuthStore();
const licenseStore = useLicenseStore();

const leftDrawerOpen = ref(false);
const showLicenseDialog = ref(false);

onMounted(async () => {
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
  /*background: linear-gradient(135deg, #ff6600 0%, #22c55e 100%);*/
  background: gray;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
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
  background: linear-gradient(135deg, #ff6600 0%, #22c55e 100%);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
    animation: pulse 4s infinite;
  }
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
    background: linear-gradient(135deg, #ff6600 0%, #22c55e 100%);
    transform: scaleY(0);
    transition: transform 0.3s ease;
  }

  &:hover {
    background-color: rgba(255, 102, 0, 0.08);
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
  background: linear-gradient(135deg, rgba(255, 102, 0, 0.15) 0%, rgba(34, 197, 94, 0.15) 100%);
  font-weight: 600;

  &::before {
    transform: scaleY(1);
  }

  .q-icon {
    color: #ff6600;
  }

  .q-item-label {
    color: #ff6600;
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
}
</style>
