<template>
  <q-page padding>
    <PageHeader
      title="Compte Administratif"
      subtitle="Synthèse annuelle de l'exécution budgétaire"
      icon="assignment"
    >
      <template #actions>
        <div class="row items-center q-gutter-sm">
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
    </PageHeader>

    <!-- Stats cards -->
    <div class="row q-col-gutter-md q-mb-md">
      <div class="col-12 col-md-3" v-for="(stat, i) in statsCards" :key="stat.label">
        <q-card class="stat-card" :style="{ animationDelay: `${i * 0.1}s` }">
          <q-card-section>
            <div class="row items-center no-wrap">
              <q-icon :name="stat.icon" :color="stat.color" size="32px" class="q-mr-md" />
              <div>
                <div class="text-caption text-grey-7">{{ stat.label }}</div>
                <div class="text-h6 text-weight-bold">{{ formatMontant(stat.value) }}</div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Tabs -->
    <q-card>
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

const data = useCompteAdmin();
const currentTab = ref('recap-fonct');

const currentYear = new Date().getFullYear();
const exerciceOptions = Array.from({ length: 10 }, (_, i) => ({
  label: String(currentYear - i),
  value: currentYear - i,
}));

const statsCards = computed(() => [
  {
    label: 'Recettes Fonct.',
    value: data.totalRecettesFonct.value,
    icon: 'trending_up',
    color: 'positive',
  },
  {
    label: 'Dépenses Fonct.',
    value: data.totalDepensesFonct.value,
    icon: 'trending_down',
    color: 'negative',
  },
  {
    label: 'Résultat Fonct.',
    value: data.resultatFonctionnement.value,
    icon: 'account_balance',
    color: data.resultatFonctionnement.value >= 0 ? 'positive' : 'negative',
  },
  {
    label: 'Résultat Global',
    value: data.resultatGlobal.value,
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
.stat-card {
  border-radius: 12px;
  animation: slideUp 0.5s ease-out both;
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
