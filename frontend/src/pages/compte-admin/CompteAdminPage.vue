<template>
  <q-page class="compte-admin-page q-pa-md">
    <PageHeader
      title="Compte Administratif"
      subtitle="Synthèse annuelle de l'exécution budgétaire"
      icon="assignment"
    >
      <template #actions>
        <div class="row items-center q-gutter-sm compte-admin-actions">
          <q-select
            v-model="data.exercice.value"
            :options="exerciceOptions"
            label="Exercice"
            dense
            outlined
            style="min-width: 120px"
            emit-value
            map-options
          />
          <q-btn
            color="teal"
            icon="print"
            label="Imprimer"
            @click="printCurrentTab"
            :loading="data.loading.value"
          />
        </div>
      </template>
      <template #stats>
        <div v-for="(stat, i) in statsCards" :key="stat.label" class="col-12 col-sm-6 col-lg-3">
          <q-card
            flat
            class="listing-stat-card overview-stat-card"
            :style="{ animationDelay: `${i * 0.1}s` }"
          >
            <q-card-section class="row items-center no-wrap">
              <div class="col">
                <div class="overview-stat-label">{{ stat.label }}</div>
                <div class="overview-stat-value">{{ formatMontant(stat.value) }}</div>
                <div v-if="stat.helper" class="overview-stat-helper">{{ stat.helper }}</div>
              </div>
              <q-icon :name="stat.icon" :color="stat.color" size="30px" />
            </q-card-section>
          </q-card>
        </div>
      </template>
    </PageHeader>

    <!-- Tabs -->
    <q-card class="main-card">
      <q-tabs
        v-model="currentTab"
        dense
        class="text-grey"
        active-color="teal"
        indicator-color="teal"
        align="left"
        narrow-indicator
        no-caps
      >
        <q-tab name="recap-fonct" label="RECAP. FONCT" />
        <q-tab name="rec-fonct" label="REC. FONCT" />
        <q-tab name="dep-eng" label="DEP. ENG" />
        <q-tab name="dep-fonc" label="DEP. FONC" />
        <q-tab name="recap-inv" label="RECAP INV" />
        <q-tab name="rec-inv" label="REC. INV" />
        <q-tab name="invest-dep-eng" label="INVEST 1" />
        <q-tab name="invest-dep-vent" label="INVEST 2" />
        <q-tab name="resultat" label="RESULTAT" />
        <q-tab name="mod-pat" label="MOD. PAT" />
        <q-tab name="recap-global" label="RECAP. GLOBAL" />
      </q-tabs>

      <q-separator />

      <q-tab-panels v-model="currentTab" animated>
        <q-tab-panel name="recap-fonct">
          <RecapFonctTab :data="data" />
        </q-tab-panel>
        <q-tab-panel name="rec-fonct">
          <RecFonctTab :data="data" />
        </q-tab-panel>
        <q-tab-panel name="dep-eng">
          <DepEngTab :data="data" />
        </q-tab-panel>
        <q-tab-panel name="dep-fonc">
          <DepFoncTab :data="data" />
        </q-tab-panel>
        <q-tab-panel name="recap-inv">
          <RecapInvTab :data="data" />
        </q-tab-panel>
        <q-tab-panel name="rec-inv">
          <RecInvTab :data="data" />
        </q-tab-panel>
        <q-tab-panel name="invest-dep-eng">
          <InvestDepEngTab :data="data" />
        </q-tab-panel>
        <q-tab-panel name="invest-dep-vent">
          <InvestDepVentTab :data="data" />
        </q-tab-panel>
        <q-tab-panel name="resultat">
          <ResultatTab :data="data" />
        </q-tab-panel>
        <q-tab-panel name="mod-pat">
          <ModPatTab :data="data" />
        </q-tab-panel>
        <q-tab-panel name="recap-global">
          <RecapGlobalTab :data="data" />
        </q-tab-panel>
      </q-tab-panels>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import PageHeader from 'src/components/PageHeader.vue';
import { useCompteAdmin } from 'src/composables/useCompteAdmin';
import { openPrintWindowWithMessage } from 'src/utils/printUrl';
import RecapFonctTab from './tabs/RecapFonctTab.vue';
import RecFonctTab from './tabs/RecFonctTab.vue';
import DepEngTab from './tabs/DepEngTab.vue';
import DepFoncTab from './tabs/DepFoncTab.vue';
import RecapInvTab from './tabs/RecapInvTab.vue';
import RecInvTab from './tabs/RecInvTab.vue';
import InvestDepEngTab from './tabs/InvestDepEngTab.vue';
import InvestDepVentTab from './tabs/InvestDepVentTab.vue';
import ResultatTab from './tabs/ResultatTab.vue';
import ModPatTab from './tabs/ModPatTab.vue';
import RecapGlobalTab from './tabs/RecapGlobalTab.vue';

const data = useCompteAdmin();
const currentTab = ref('recap-fonct');

const currentYear = new Date().getFullYear();
const exerciceOptions = Array.from({ length: 10 }, (_, i) => ({
  label: String(currentYear - i),
  value: currentYear - i,
}));

const statsCards = computed(() => [
  {
    label: 'Recettes fonct.',
    value: data.totalRecettesFonct.value,
    helper: 'Recettes de fonctionnement',
    icon: 'trending_up',
    color: 'positive',
  },
  {
    label: 'Dépenses fonct.',
    value: data.totalDepensesFonct.value,
    helper: 'Dépenses de fonctionnement',
    icon: 'trending_down',
    color: 'negative',
  },
  {
    label: 'Résultat fonct.',
    value: data.resultatFonctionnement.value,
    helper: data.resultatFonctionnement.value >= 0 ? 'Excédent' : 'Déficit',
    icon: 'account_balance',
    color: data.resultatFonctionnement.value >= 0 ? 'positive' : 'negative',
  },
  {
    label: 'Résultat global',
    value: data.resultatGlobal.value,
    helper: `Exercice ${data.exercice.value}`,
    icon: 'summarize',
    color: data.resultatGlobal.value >= 0 ? 'teal' : 'negative',
  },
]);

function formatMontant(value: number): string {
  return new Intl.NumberFormat('fr-FR', { style: 'decimal', maximumFractionDigits: 0 }).format(
    value,
  );
}

const tabPrintFileMap: Record<string, string> = {
  'recap-global': 'compte-admin/recap-global.html',
  'recap-fonct': 'compte-admin/recap-fonct.html',
  'rec-fonct': 'compte-admin/rec-fonct.html',
  'dep-eng': 'compte-admin/dep-eng.html',
  'dep-fonc': 'compte-admin/dep-fonc.html',
  'recap-inv': 'compte-admin/recap-inv.html',
  'rec-inv': 'compte-admin/rec-inv.html',
  'invest-dep-eng': 'compte-admin/invest-dep-eng.html',
  'invest-dep-vent': 'compte-admin/invest-dep-vent.html',
  resultat: 'compte-admin/resultat.html',
  'mod-pat': 'compte-admin/mod-pat.html',
};

function printCurrentTab() {
  const file = tabPrintFileMap[currentTab.value];
  if (!file) return;

  void openPrintWindowWithMessage(file, {
    type: 'FILL_COMPTE_ADMIN_DATA',
    exercice: data.exercice.value,
    tab: currentTab.value,
  });
}

onMounted(() => {
  void data.loadData();
});
</script>

<style scoped lang="scss">
.compte-admin-page {
  max-width: 1400px;
  margin: 0 auto;
}

.compte-admin-actions {
  align-items: center;
}

.main-card {
  border-radius: 24px;
  border: 1px solid rgba(148, 163, 184, 0.18);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.94));
  box-shadow: 0 18px 34px rgba(15, 23, 42, 0.08);
  overflow: hidden;
}

.overview-stat-card {
  min-height: 112px;
  animation: slideUp 0.5s ease-out both;
}

.overview-stat-label {
  margin-bottom: 8px;
  color: #64748b;
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.overview-stat-value {
  color: #0f172a;
  font-size: clamp(1.05rem, 1.7vw, 1.45rem);
  font-weight: 800;
  line-height: 1.2;
}

.overview-stat-helper {
  margin-top: 6px;
  color: #64748b;
  font-size: 0.76rem;
  line-height: 1.35;
}

.main-card :deep(.q-tabs) {
  padding: 8px 12px 0;
}

.main-card :deep(.q-tab) {
  border-radius: 12px 12px 0 0;
}

.main-card :deep(.q-tab-panels) {
  background: transparent;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
