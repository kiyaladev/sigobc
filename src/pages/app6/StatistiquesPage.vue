<template>
  <q-page class="q-pa-md">
    <PageHeader
      title="Statistiques des Recettes"
      subtitle="Analyse et suivi des recettes"
      icon="bar_chart"
    />

    <!-- Filtres -->
    <div class="row q-mb-md items-center q-gutter-sm">
      <q-input
        v-model="filters.codeCommune"
        label="Code Commune"
        outlined
        dense
        class="col-12 col-sm-2"
      />

      <q-select
        v-model="filters.exercice"
        :options="exerciceOptions"
        label="Exercice"
        outlined
        dense
        class="col-12 col-sm-2"
      />

      <q-select
        v-model="filters.periode"
        :options="periodeOptions"
        label="Période"
        outlined
        dense
        emit-value
        map-options
        class="col-12 col-sm-2"
      />

      <q-space />

      <q-btn color="secondary" icon="download" label="Exporter" @click="exportData" />
    </div>

    <!-- Cartes de statistiques -->
    <div class="row q-col-gutter-md q-mb-lg">
      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="stats-card">
          <q-card-section>
            <div class="row items-center no-wrap">
              <div class="col">
                <div class="text-overline text-grey-7">Recettes Prévues</div>
                <div class="text-h5 text-weight-bold">{{ formatCurrency(stats.prevu) }}</div>
              </div>
              <div class="col-auto">
                <q-avatar color="blue-1" text-color="blue" size="56px" icon="savings" />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="stats-card">
          <q-card-section>
            <div class="row items-center no-wrap">
              <div class="col">
                <div class="text-overline text-grey-7">Recettes Réalisées</div>
                <div class="text-h5 text-weight-bold text-green">
                  {{ formatCurrency(stats.realise) }}
                </div>
              </div>
              <div class="col-auto">
                <q-avatar color="green-1" text-color="green" size="56px" icon="paid" />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="stats-card">
          <q-card-section>
            <div class="row items-center no-wrap">
              <div class="col">
                <div class="text-overline text-grey-7">Taux de Réalisation</div>
                <div class="text-h5 text-weight-bold" :class="tauxColor">{{ stats.taux }}%</div>
              </div>
              <div class="col-auto">
                <q-circular-progress
                  :value="stats.taux"
                  size="56px"
                  :thickness="0.15"
                  :color="tauxProgressColor"
                  track-color="grey-3"
                />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="stats-card">
          <q-card-section>
            <div class="row items-center no-wrap">
              <div class="col">
                <div class="text-overline text-grey-7">Reste à Réaliser</div>
                <div class="text-h5 text-weight-bold text-orange">
                  {{ formatCurrency(stats.reste) }}
                </div>
              </div>
              <div class="col-auto">
                <q-avatar color="orange-1" text-color="orange" size="56px" icon="pending" />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Graphiques -->
    <div class="row q-col-gutter-md q-mb-lg">
      <div class="col-12 col-md-8">
        <q-card>
          <q-card-section>
            <div class="text-h6">Évolution Mensuelle des Recettes</div>
          </q-card-section>
          <q-card-section>
            <div class="chart-container">
              <q-skeleton v-if="loading" type="rect" height="350px" />
              <div v-else class="placeholder-chart">
                <q-icon name="show_chart" size="80px" color="grey-4" />
                <div class="text-grey-6 q-mt-md text-h6">Graphique d'évolution mensuelle</div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-4">
        <q-card class="full-height">
          <q-card-section>
            <div class="text-h6">Répartition par Compte</div>
          </q-card-section>
          <q-card-section>
            <div class="chart-container-small">
              <q-skeleton v-if="loading" type="rect" height="280px" />
              <div v-else class="placeholder-chart">
                <q-icon name="donut_large" size="64px" color="grey-4" />
                <div class="text-grey-6 q-mt-md">Répartition</div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Tableau des recettes par compte fonctionnel -->
    <q-card>
      <q-card-section>
        <div class="text-h6">Détail par Compte Fonctionnel</div>
      </q-card-section>
      <q-card-section class="q-pt-none">
        <q-table
          :rows="recettesParCompte"
          :columns="columns"
          row-key="compteFonctionnel"
          :loading="loading"
          flat
          bordered
          :pagination="{ rowsPerPage: 10 }"
        >
          <template v-slot:body-cell-prevu="props">
            <q-td :props="props">
              {{ formatCurrency(props.row.prevu) }}
            </q-td>
          </template>

          <template v-slot:body-cell-realise="props">
            <q-td :props="props">
              <span class="text-weight-bold text-green">
                {{ formatCurrency(props.row.realise) }}
              </span>
            </q-td>
          </template>

          <template v-slot:body-cell-taux="props">
            <q-td :props="props">
              <q-linear-progress
                :value="props.row.taux / 100"
                :color="
                  props.row.taux >= 80 ? 'positive' : props.row.taux >= 50 ? 'warning' : 'negative'
                "
                style="width: 100px"
                class="q-mr-sm"
              />
              <span class="text-weight-medium">{{ props.row.taux }}%</span>
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import PageHeader from 'src/components/PageHeader.vue';

const $q = useQuasar();
const loading = ref(true);
const currentYear = new Date().getFullYear();
const exerciceOptions = [2023, 2024, 2025, 2026];

const filters = ref({
  codeCommune: '422',
  exercice: currentYear,
  periode: 'annee',
});

const periodeOptions = [
  { label: 'Année complète', value: 'annee' },
  { label: 'Trimestre 1', value: 't1' },
  { label: 'Trimestre 2', value: 't2' },
  { label: 'Trimestre 3', value: 't3' },
  { label: 'Trimestre 4', value: 't4' },
];

const stats = ref({
  prevu: 250000000,
  realise: 175250000,
  taux: 70,
  reste: 74750000,
});

interface RecetteParCompte {
  compteFonctionnel: string;
  libelle: string;
  nombreDeclarations: number;
  prevu: number;
  realise: number;
  taux: number;
}

const recettesParCompte = ref<RecetteParCompte[]>([
  {
    compteFonctionnel: '7000',
    libelle: 'Contribution foncière bâties',
    nombreDeclarations: 45,
    prevu: 50000000,
    realise: 42000000,
    taux: 84,
  },
  {
    compteFonctionnel: '7001',
    libelle: 'Contribution foncière non bâties',
    nombreDeclarations: 32,
    prevu: 30000000,
    realise: 21000000,
    taux: 70,
  },
  {
    compteFonctionnel: '7004',
    libelle: 'Contribution des patentes',
    nombreDeclarations: 78,
    prevu: 45000000,
    realise: 38000000,
    taux: 84,
  },
  {
    compteFonctionnel: '7005',
    libelle: 'Contribution des licences',
    nombreDeclarations: 25,
    prevu: 15000000,
    realise: 12500000,
    taux: 83,
  },
  {
    compteFonctionnel: '7130',
    libelle: 'Taxe ordures ménagères',
    nombreDeclarations: 156,
    prevu: 40000000,
    realise: 28000000,
    taux: 70,
  },
  {
    compteFonctionnel: '71330',
    libelle: 'Gare routière',
    nombreDeclarations: 120,
    prevu: 25000000,
    realise: 15750000,
    taux: 63,
  },
  {
    compteFonctionnel: '71344',
    libelle: 'Marchés',
    nombreDeclarations: 250,
    prevu: 35000000,
    realise: 14000000,
    taux: 40,
  },
  {
    compteFonctionnel: '7041',
    libelle: 'Taxes sur les taxis',
    nombreDeclarations: 48,
    prevu: 10000000,
    realise: 4000000,
    taux: 40,
  },
]);

const columns = [
  {
    name: 'compteFonctionnel',
    label: 'Compte Fonct.',
    field: 'compteFonctionnel',
    align: 'left' as const,
  },
  { name: 'libelle', label: 'Libellé', field: 'libelle', align: 'left' as const },
  {
    name: 'nombreDeclarations',
    label: 'Nb Décl.',
    field: 'nombreDeclarations',
    align: 'center' as const,
  },
  { name: 'prevu', label: 'Prévu', field: 'prevu', align: 'right' as const },
  { name: 'realise', label: 'Réalisé', field: 'realise', align: 'right' as const },
  { name: 'taux', label: 'Taux', field: 'taux', align: 'center' as const },
];

const tauxColor = computed(() => {
  if (stats.value.taux >= 80) return 'text-green';
  if (stats.value.taux >= 50) return 'text-orange';
  return 'text-red';
});

const tauxProgressColor = computed(() => {
  if (stats.value.taux >= 80) return 'green';
  if (stats.value.taux >= 50) return 'orange';
  return 'red';
});

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    minimumFractionDigits: 0,
  }).format(value);
}

function exportData() {
  $q.notify({ type: 'info', message: 'Export des données en cours...' });
}

onMounted(async () => {
  await new Promise((resolve) => setTimeout(resolve, 500));
  loading.value = false;
});
</script>

<style scoped lang="scss">
.stats-card {
  border-radius: 12px;
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  }
}

.chart-container {
  min-height: 350px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chart-container-small {
  min-height: 280px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.placeholder-chart {
  text-align: center;
  padding: 40px;
}
</style>
