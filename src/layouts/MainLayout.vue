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
          <q-badge color="negative" text-color="white" floating rounded>3</q-badge>
          <q-tooltip>Notifications</q-tooltip>
        </q-btn>

        <!-- Menu utilisateur -->
        <q-btn flat round dense class="user-menu-btn">
          <q-avatar size="36px" color="primary" text-color="white" class="hover-glow">
            <q-icon name="account_circle" size="24px" />
          </q-avatar>
          <q-menu transition-show="jump-down" transition-hide="jump-up" class="modern-menu">
            <q-list style="min-width: 220px" class="q-pa-sm">
              <q-item class="user-info-item q-mb-sm">
                <q-item-section avatar>
                  <q-avatar size="48px" color="primary" text-color="white">
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
            <img :src="logoMairie" alt="Logo Mairie" class="logo-sidebar" />
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
        <q-expansion-item
          icon="receipt"
          label="Gestion des Dépenses"
          :default-opened="isApp3Active"
          header-class="text-grey-7 text-weight-medium accordion-header"
          expand-icon-class="text-grey-7"
          class="accordion-section q-mb-xs"
        >
          <q-item
            clickable
            v-ripple
            to="/app3/dashboard"
            class="nav-item q-mb-xs"
            active-class="nav-item-active"
          >
            <q-item-section avatar>
              <q-icon name="dashboard" color="primary" />
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
              <q-icon name="category" color="primary" />
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
              <q-icon name="view_list" color="primary" />
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
              <q-icon name="pie_chart" color="primary" />
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
              <q-icon name="receipt" color="primary" />
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
              <q-icon name="folder_open" color="primary" />
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
              <q-icon name="bar_chart" color="primary" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Statistiques Dépenses</q-item-label>
            </q-item-section>
          </q-item>
        </q-expansion-item>

        <q-separator class="q-my-xs" />

        <!-- ===== 5. GESTION DES RECETTES ===== -->
        <q-expansion-item
          icon="payments"
          label="Gestion des Recettes"
          :default-opened="isApp6Active"
          header-class="text-grey-7 text-weight-medium accordion-header"
          expand-icon-class="text-grey-7"
          class="accordion-section q-mb-xs"
        >
          <q-item
            clickable
            v-ripple
            to="/app6/dashboard"
            class="nav-item q-mb-xs"
            active-class="nav-item-active"
          >
            <q-item-section avatar>
              <q-icon name="dashboard" color="secondary" />
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
              <q-icon name="description" color="secondary" />
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
              <q-icon name="receipt" color="secondary" />
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
              <q-icon name="folder" color="secondary" />
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
              <q-icon name="folder_open" color="secondary" />
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
              <q-icon name="trending_up" color="secondary" />
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
              <q-icon name="account_balance" color="secondary" />
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
              <q-icon name="bar_chart" color="secondary" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Statistiques Recettes</q-item-label>
            </q-item-section>
          </q-item>
        </q-expansion-item>

        <q-separator class="q-my-xs" />

        <!-- ===== 6. GESTION DES EMPLOYÉS ===== -->
        <q-expansion-item
          icon="people"
          label="Gestion des Employés"
          :default-opened="isApp7Active"
          header-class="text-grey-7 text-weight-medium accordion-header"
          expand-icon-class="text-grey-7"
          class="accordion-section q-mb-xs"
        >
          <q-item
            clickable
            v-ripple
            to="/app7/dashboard"
            class="nav-item q-mb-xs"
            active-class="nav-item-active"
          >
            <q-item-section avatar>
              <q-icon name="dashboard" color="deep-purple" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Dashboard RH</q-item-label>
            </q-item-section>
          </q-item>

          <q-item
            clickable
            v-ripple
            to="/app7/employes"
            class="nav-item q-mb-xs"
            active-class="nav-item-active"
          >
            <q-item-section avatar>
              <q-icon name="badge" color="deep-purple" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Agents</q-item-label>
            </q-item-section>
          </q-item>

          <q-item
            clickable
            v-ripple
            to="/app7/salaires"
            class="nav-item q-mb-xs"
            active-class="nav-item-active"
          >
            <q-item-section avatar>
              <q-icon name="payments" color="deep-purple" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Salaires & Bulletins</q-item-label>
            </q-item-section>
          </q-item>

          <!-- Congés masqué temporairement
          <q-item
            clickable
            v-ripple
            to="/app7/conges"
            class="nav-item q-mb-xs"
            active-class="nav-item-active"
          >
            <q-item-section avatar>
              <q-icon name="beach_access" color="deep-purple" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Congés & Absences</q-item-label>
            </q-item-section>
          </q-item>
          -->

          <!-- Ordres de Mission masqué temporairement
          <q-item
            clickable
            v-ripple
            to="/app7/missions"
            class="nav-item q-mb-xs"
            active-class="nav-item-active"
          >
            <q-item-section avatar>
              <q-icon name="flight_takeoff" color="deep-purple" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Ordres de Mission</q-item-label>
            </q-item-section>
          </q-item>
          -->

          <q-item
            clickable
            v-ripple
            to="/app7/statistiques"
            class="nav-item q-mb-xs"
            active-class="nav-item-active"
          >
            <q-item-section avatar>
              <q-icon name="bar_chart" color="deep-purple" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Statistiques RH</q-item-label>
            </q-item-section>
          </q-item>
        </q-expansion-item>

        <q-separator class="q-my-xs" />

        <!-- ===== ADMINISTRATION ===== -->
        <template v-if="authStore.isAdmin">
          <q-expansion-item
            icon="admin_panel_settings"
            label="Administration"
            :default-opened="isAdminActive"
            header-class="text-grey-7 text-weight-medium accordion-header"
            expand-icon-class="text-grey-7"
            class="accordion-section q-mb-xs"
          >
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

            <q-item
              clickable
              v-ripple
              to="/admin/parametrage"
              class="nav-item q-mb-xs"
              active-class="nav-item-active"
            >
              <q-item-section avatar>
                <q-icon name="settings" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Paramétrage</q-item-label>
              </q-item-section>
            </q-item>
          </q-expansion-item>
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
  </q-layout>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useQuasar } from 'quasar';
import { useAuthStore } from 'src/stores/auth-store';
import ThemeToggle from 'src/components/ThemeToggle.vue';
import logoMairie from '/logo-mairie-vavoua.png';

const router = useRouter();
const route = useRoute();
const $q = useQuasar();
const authStore = useAuthStore();

const leftDrawerOpen = ref(false);

// Déterminer quelle section est active pour ouvrir le bon accordéon
const isApp3Active = computed(() => route.path.startsWith('/app3'));
const isApp6Active = computed(() => route.path.startsWith('/app6'));
const isApp7Active = computed(() => route.path.startsWith('/app7'));
const isAdminActive = computed(
  () =>
    route.path.startsWith('/admin') ||
    route.path.startsWith('/utilisateurs') ||
    route.path.startsWith('/statistiques'),
);

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value;
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
  border-bottom: 3px solid $primary;
}

.logo-container {
  background: rgba(255, 255, 255, 0.95);
  padding: 8px;
  border-radius: 12px;
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-sidebar {
  width: 56px;
  height: 56px;
  object-fit: contain;
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
    background: $primary;
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
    color: $primary;
  }
}

.nav-item-active {
  background-color: rgba(0, 0, 0, 0.04);
  font-weight: 600;

  &::before {
    transform: scaleY(1);
  }

  .q-icon {
    color: $primary;
  }

  .q-item-label {
    color: $primary;
  }
}

// Accordéons du sidebar
.accordion-section {
  border-radius: 12px;
  overflow: hidden;

  :deep(.q-expansion-item__content) {
    padding-left: 8px;
  }
}

.accordion-header {
  border-radius: 12px;
  padding: 8px 12px;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: rgba(0, 0, 0, 0.04);
  }
}
.modern-menu {
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  overflow: hidden;
}

.user-info-item {
  background: linear-gradient(135deg, rgba(13, 117, 86, 0.1) 0%, rgba(201, 169, 97, 0.1) 100%);
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
