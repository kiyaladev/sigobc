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

        <!-- Sélecteur mode de données -->
        <q-btn-dropdown
          flat
          dense
          no-caps
          :icon="dataModeIcon"
          :label="dataModeLabel"
          class="q-mr-sm"
          data-visite="mode-donnees"
        >
          <q-list dense style="min-width: 200px">
            <q-item
              v-for="opt in dataModeOptions"
              :key="opt.value"
              clickable
              v-close-popup
              @click="onSetDataMode(opt.value)"
              :active="dataMode === opt.value"
              active-class="text-primary"
            >
              <q-item-section avatar>
                <q-icon :name="opt.icon" />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ opt.label }}</q-item-label>
                <q-item-label caption>{{ opt.caption }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>

        <!-- Toggle mode sombre -->
        <ThemeToggle class="q-mr-sm" />

        <!-- Notifications -->
        <q-btn flat round dense icon="notifications" class="q-mr-sm hover-scale">
          <q-badge color="negative" text-color="white" floating rounded>3</q-badge>
          <q-tooltip>Notifications</q-tooltip>
        </q-btn>

        <!-- Menu utilisateur -->
        <q-btn flat round dense class="user-menu-btn" data-visite="compte">
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

      <q-list padding class="q-px-sm" data-visite="modules">
        <!-- ===== 4. GESTION DES DÉPENSES ===== -->
        <q-expansion-item
          group="sidebar"
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

          <q-item
            clickable
            v-ripple
            to="/app3/projets"
            class="nav-item q-mb-xs"
            active-class="nav-item-active"
          >
            <q-item-section avatar>
              <q-icon name="engineering" color="primary" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Projets</q-item-label>
            </q-item-section>
          </q-item>

          <q-item
            clickable
            v-ripple
            to="/app3/banques"
            class="nav-item q-mb-xs"
            active-class="nav-item-active"
          >
            <q-item-section avatar>
              <q-icon name="account_balance" color="primary" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Banques</q-item-label>
            </q-item-section>
          </q-item>
        </q-expansion-item>

        <q-separator class="q-my-xs" />

        <!-- ===== 5. GESTION DES RECETTES ===== -->
        <q-expansion-item
          group="sidebar"
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
          group="sidebar"
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
            to="/app3/fournisseurs"
            class="nav-item q-mb-xs"
            active-class="nav-item-active"
          >
            <q-item-section avatar>
              <q-icon name="storefront" color="deep-purple" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Fournisseurs</q-item-label>
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

          <q-item
            clickable
            v-ripple
            to="/app7/services"
            class="nav-item q-mb-xs"
            active-class="nav-item-active"
          >
            <q-item-section avatar>
              <q-icon name="business" color="deep-purple" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Services</q-item-label>
            </q-item-section>
          </q-item>

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

        <!-- ===== COMPTE ADMINISTRATIF ===== -->
        <q-expansion-item
          group="sidebar"
          icon="assignment"
          label="Compte Administratif"
          :default-opened="isCompteAdminActive"
          header-class="text-grey-7 text-weight-medium accordion-header"
          expand-icon-class="text-grey-7"
          class="accordion-section q-mb-xs"
        >
          <q-item
            clickable
            v-ripple
            to="/compte-admin"
            class="nav-item q-mb-xs"
            active-class="nav-item-active"
          >
            <q-item-section avatar>
              <q-icon name="summarize" color="teal" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Compte Administratif</q-item-label>
            </q-item-section>
          </q-item>
        </q-expansion-item>

        <q-separator class="q-my-xs" />

        <!-- ===== DOCUMENTATION ===== -->
        <q-expansion-item
          group="sidebar"
          icon="menu_book"
          label="Documentation"
          :default-opened="isDocumentationActive"
          header-class="text-grey-7 text-weight-medium accordion-header"
          expand-icon-class="text-grey-7"
          class="accordion-section q-mb-xs"
          data-visite="documentation"
        >
          <q-item
            clickable
            v-ripple
            to="/documentation"
            class="nav-item q-mb-xs"
            active-class="nav-item-active"
          >
            <q-item-section avatar>
              <q-icon name="menu_book" color="primary" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Documentation</q-item-label>
            </q-item-section>
          </q-item>
        </q-expansion-item>

        <q-separator class="q-my-xs" />

        <!-- ===== ADMINISTRATION ===== -->
        <!-- Branche no-auth : session locale admin toujours active -> menu toujours visible -->
        <template v-if="authStore.isAdmin || authStore.isAuthenticated">
          <q-expansion-item
            group="sidebar"
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
              <q-item-section side>
                <q-badge class="admin-nav-badge" color="primary" text-color="white">Admin</q-badge>
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
              <q-item-section side>
                <q-badge class="admin-nav-badge" color="teal" text-color="white">Vue</q-badge>
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
              <q-item-section side>
                <q-badge class="admin-nav-badge" color="orange" text-color="white">DB</q-badge>
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
              <q-item-section side>
                <q-badge class="admin-nav-badge" color="positive" text-color="white">Safe</q-badge>
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
              <q-item-section side>
                <q-badge class="admin-nav-badge" color="secondary" text-color="white"
                  >Config</q-badge
                >
              </q-item-section>
            </q-item>
          </q-expansion-item>
        </template>
      </q-list>
    </q-drawer>

    <q-page-container class="modern-page-container">
      <!-- Écran de blocage si période d'essai expirée -->
      <div v-if="demoStore.isExpired" class="expired-overlay">
        <q-card class="expired-card text-center" flat bordered>
          <q-card-section>
            <q-icon name="lock" size="64px" color="negative" />
            <h5 class="q-mt-md q-mb-sm">Période d'essai expirée</h5>
            <p class="text-grey-7">
              Votre période d'essai de 4 mois est terminée.<br />
              Seul l'export de vos données reste disponible.
            </p>
          </q-card-section>
          <q-card-actions align="center" class="q-pb-lg">
            <q-btn
              color="primary"
              icon="download"
              label="Exporter mes données"
              @click="router.push({ name: 'admin-backup' })"
            />
          </q-card-actions>
        </q-card>
      </div>

      <router-view v-if="!demoStore.isExpired" v-slot="{ Component }">
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

    <SommaireVisite v-model="sommaireOuvert" />
    <VisiteGuidee
      v-model="visiteOuverte"
      :etapes="etapesVisiteActives"
      @termine="marquerVisiteVue"
    />
  </q-layout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from 'src/stores/auth-store';
import { useDemoStore } from 'src/stores/demo-store';
import ThemeToggle from 'src/components/ThemeToggle.vue';
import VisiteGuidee from 'src/components/VisiteGuidee.vue';
import SommaireVisite from 'src/components/SommaireVisite.vue';
import {
  etapesVisiteActives,
  marquerVisiteVue,
  ouvrirVisiteSiPremiereFois,
  sommaireOuvert,
  visiteOuverte,
} from 'src/composables/visiteGuidee';
import logoMairie from '/logo-mairie-gboguhe.png';
import { dataMode, setDataMode, type DataMode } from 'src/database/connectivity';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const demoStore = useDemoStore();

onMounted(() => {
  // La visite ne s'ouvre qu'au tout premier démarrage ; ensuite elle se
  // relance à la demande depuis la documentation.
  ouvrirVisiteSiPremiereFois();
  demoStore.initializeDemo();
  // S'assurer que la session admin locale est chargee (role/nom + menu Administration)
  void authStore.checkAuth();
});

const leftDrawerOpen = ref(false);

// Data mode selector
const dataModeOptions = [
  {
    value: 'offline' as DataMode,
    label: 'Hors ligne',
    caption: 'Données locales uniquement',
    icon: 'cloud_off',
  },
  {
    value: 'offline-sync' as DataMode,
    label: 'Hors ligne + Sync',
    caption: 'Local avec synchronisation',
    icon: 'sync',
  },
  { value: 'online' as DataMode, label: 'En ligne', caption: 'Serveur uniquement', icon: 'cloud' },
];
const dataModeIcon = computed(
  () => dataModeOptions.find((o) => o.value === dataMode.value)?.icon ?? 'sync',
);
const dataModeLabel = computed(
  () => dataModeOptions.find((o) => o.value === dataMode.value)?.label ?? '',
);
function onSetDataMode(mode: DataMode) {
  setDataMode(mode);
  window.location.reload();
}

// Déterminer quelle section est active pour ouvrir le bon accordéon
const isApp3Active = computed(() => route.path.startsWith('/app3'));
const isApp6Active = computed(() => route.path.startsWith('/app6'));
const isApp7Active = computed(() => route.path.startsWith('/app7'));
const isCompteAdminActive = computed(() => route.path.startsWith('/compte-admin'));
const isDocumentationActive = computed(() => route.path.startsWith('/documentation'));
const isAdminActive = computed(
  () =>
    route.path.startsWith('/admin') ||
    route.path.startsWith('/utilisateurs') ||
    route.path.startsWith('/statistiques'),
);

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value;
}
</script>

<style scoped lang="scss">
.expired-overlay {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 80vh;
  padding: 24px;
}

.expired-card {
  max-width: 480px;
  width: 100%;
  border-radius: 16px;
}

.modern-header {
  background: rgba(255, 255, 255, 0.88);
  // `q-header` impose du texte blanc, hérité de son fond primaire par défaut.
  // Cet en-tête est passé au fond clair : sans cette encre, ses commandes —
  // dont le sélecteur de mode de données — sont blanc sur blanc.
  color: #262626;
  backdrop-filter: blur(18px);
  border-bottom: 1px solid rgba(148, 163, 184, 0.18);
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.05);
}

:deep(.modern-header .q-toolbar) {
  min-height: 72px;
  padding-left: 16px;
  padding-right: 16px;
}

.menu-btn,
.user-menu-btn {
  border-radius: 14px;
}

.menu-btn:hover {
  transform: rotate(90deg);
}

.modern-drawer {
  background:
    radial-gradient(circle at top left, rgba(197, 168, 77, 0.14), transparent 24%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.98) 100%);
  border-right: 1px solid rgba(148, 163, 184, 0.14);
  box-shadow: 12px 0 32px rgba(15, 23, 42, 0.05);
}

.drawer-header {
  background: transparent;
  border-bottom: 1px solid rgba(148, 163, 184, 0.16);
}

.logo-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 72px;
  height: 72px;
  padding: 10px;
  border-radius: 20px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.96), rgba(248, 250, 252, 0.92));
  border: 1px solid rgba(148, 163, 184, 0.14);
  box-shadow: 0 14px 24px rgba(15, 23, 42, 0.08);
}

.logo-sidebar {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.nav-item {
  position: relative;
  min-height: 46px;
  margin: 5px 8px;
  border-radius: 14px;
  transition: all 0.22s ease;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 8px;
    bottom: 8px;
    width: 3px;
    border-radius: 999px;
    background: linear-gradient(180deg, $primary 0%, $secondary 100%);
    transform: scaleY(0);
    transition: transform 0.22s ease;
  }

  &:hover {
    background: rgba(15, 23, 42, 0.05);
    transform: translateX(4px);

    &::before {
      transform: scaleY(1);
    }
  }

  .q-icon {
    transition: transform 0.22s ease;
  }

  &:hover .q-icon {
    transform: scale(1.08);
  }
}

.nav-item-active {
  background: linear-gradient(90deg, rgba(27, 94, 59, 0.12), rgba(197, 168, 77, 0.12));
  box-shadow: inset 0 0 0 1px rgba(27, 94, 59, 0.1);
  font-weight: 700;

  &::before {
    transform: scaleY(1);
  }

  .q-item-label,
  .q-icon {
    color: $primary;
  }
}

.accordion-section {
  border-radius: 16px;
  overflow: hidden;

  :deep(.q-expansion-item__content) {
    padding-left: 6px;
  }
}

.accordion-header {
  border-radius: 14px;
  padding: 10px 12px;

  &:hover {
    background: rgba(15, 23, 42, 0.04);
  }
}

.admin-nav-badge {
  min-width: 52px;
  justify-content: center;
  border-radius: 999px;
  font-size: 0.66rem;
  font-weight: 800;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

@media (max-width: 768px) {
  .admin-nav-badge {
    min-width: 44px;
    font-size: 0.62rem;
  }
}

.modern-menu {
  border-radius: 18px;
  border: 1px solid rgba(148, 163, 184, 0.14);
  box-shadow: 0 24px 44px rgba(15, 23, 42, 0.14);
  overflow: hidden;
}

.user-info-item {
  background: linear-gradient(135deg, rgba(27, 94, 59, 0.1), rgba(197, 168, 77, 0.12));
  border-radius: 12px;
}

.menu-item {
  border-radius: 10px;
  margin: 2px 0;

  &:hover {
    background: rgba(15, 23, 42, 0.05);
    transform: translateX(4px);
  }
}

.logout-item:hover {
  background: rgba(239, 68, 68, 0.1);
}

.modern-page-container {
  min-height: 100vh;
  padding: 28px;
  background:
    radial-gradient(circle at top right, rgba(197, 168, 77, 0.15), transparent 24%),
    radial-gradient(circle at bottom left, rgba(27, 94, 59, 0.08), transparent 18%),
    linear-gradient(180deg, #f6f9fc 0%, #eaf0f6 100%);
}

.animated {
  animation-duration: 0.3s;
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
    transform: translateY(8px);
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
    transform: translateY(-8px);
  }
}

@media (max-width: 1024px) {
  .modern-page-container {
    padding: 18px;
  }
}

@media (max-width: 600px) {
  .modern-page-container {
    padding: 12px;
  }

  :deep(.modern-header .q-toolbar) {
    min-height: 64px;
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
