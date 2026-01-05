<template>
  <q-page class="q-pa-md">
    <PageHeader
      title="Gestion des Recettes"
      subtitle="Vue d'ensemble de la gestion des recettes"
      icon="payments"
    />

    <!-- Cartes de résumé -->
    <div class="row q-col-gutter-md q-mb-lg">
      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="dashboard-card bg-green text-white">
          <q-card-section>
            <div class="text-overline">Total Recettes</div>
            <div class="text-h4 text-weight-bold">{{ formatCurrency(stats.totalRecettes) }}</div>
            <div class="text-caption">Exercice {{ currentYear }}</div>
          </q-card-section>
          <q-card-section class="q-pt-none">
            <q-icon name="trending_up" size="48px" class="float-right opacity-30" />
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="dashboard-card bg-blue text-white">
          <q-card-section>
            <div class="text-overline">Titres de Recettes</div>
            <div class="text-h4 text-weight-bold">{{ stats.totalTitres }}</div>
            <div class="text-caption">Ce mois</div>
          </q-card-section>
          <q-card-section class="q-pt-none">
            <q-icon name="receipt" size="48px" class="float-right opacity-30" />
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="dashboard-card bg-orange text-white">
          <q-card-section>
            <div class="text-overline">Bordereaux</div>
            <div class="text-h4 text-weight-bold">{{ stats.totalBordereaux }}</div>
            <div class="text-caption">Émis cette année</div>
          </q-card-section>
          <q-card-section class="q-pt-none">
            <q-icon name="folder_open" size="48px" class="float-right opacity-30" />
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="dashboard-card bg-purple text-white">
          <q-card-section>
            <div class="text-overline">Comptes Fonctionnels</div>
            <div class="text-h4 text-weight-bold">{{ stats.totalComptes }}</div>
            <div class="text-caption">Catégories actives</div>
          </q-card-section>
          <q-card-section class="q-pt-none">
            <q-icon name="category" size="48px" class="float-right opacity-30" />
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Graphiques -->
    <div class="row q-col-gutter-md q-mb-lg">
      <div class="col-12 col-md-8">
        <q-card class="full-height">
          <q-card-section>
            <div class="text-h6">Évolution des Recettes Mensuelles</div>
          </q-card-section>
          <q-card-section>
            <div class="chart-container">
              <q-skeleton v-if="loading" type="rect" height="300px" />
              <div v-else class="placeholder-chart">
                <q-icon name="bar_chart" size="64px" color="grey-4" />
                <div class="text-grey-6 q-mt-md">Graphique des recettes mensuelles</div>
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
            <div class="chart-container">
              <q-skeleton v-if="loading" type="rect" height="300px" />
              <div v-else class="placeholder-chart">
                <q-icon name="pie_chart" size="64px" color="grey-4" />
                <div class="text-grey-6 q-mt-md">Graphique répartition</div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Dernières recettes -->
    <q-card>
      <q-card-section>
        <div class="text-h6">Derniers Titres de Recettes</div>
      </q-card-section>
      <q-card-section class="q-pt-none">
        <q-table
          :rows="recentTitres"
          :columns="titreColumns"
          row-key="id"
          :loading="loading"
          flat
          bordered
          :rows-per-page-options="[5]"
        >
          <template v-slot:body-cell-montant="props">
            <q-td :props="props">
              <span class="text-weight-bold text-green">
                {{ formatCurrency(props.row.montant) }}
              </span>
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import PageHeader from 'src/components/PageHeader.vue';

const loading = ref(true);
const currentYear = new Date().getFullYear();

const stats = ref({
  totalRecettes: 0,
  totalTitres: 0,
  totalBordereaux: 0,
  totalComptes: 0,
});

interface TitreRecette {
  id: number;
  codeCommune: string;
  exercice: number;
  compteFonctionnel: string;
  numeroBordereau: string;
  numeroDeclaration: string;
  date: string;
  montant: number;
}

const recentTitres = ref<TitreRecette[]>([]);

const titreColumns = [
  { name: 'codeCommune', label: 'Code Commune', field: 'codeCommune', align: 'left' as const },
  {
    name: 'compteFonctionnel',
    label: 'Compte Fonct.',
    field: 'compteFonctionnel',
    align: 'left' as const,
  },
  {
    name: 'numeroBordereau',
    label: 'N° Bord.',
    field: 'numeroBordereau',
    align: 'center' as const,
  },
  {
    name: 'numeroDeclaration',
    label: 'N° Décl.',
    field: 'numeroDeclaration',
    align: 'center' as const,
  },
  { name: 'date', label: 'Date', field: 'date', align: 'center' as const },
  { name: 'montant', label: 'Montant', field: 'montant', align: 'right' as const },
];

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    minimumFractionDigits: 0,
  }).format(value);
}

onMounted(async () => {
  // Simuler le chargement des données
  await new Promise((resolve) => setTimeout(resolve, 500));

  stats.value = {
    totalRecettes: 125750000,
    totalTitres: 342,
    totalBordereaux: 24,
    totalComptes: 48,
  };

  recentTitres.value = [
    {
      id: 1,
      codeCommune: '422',
      exercice: 2025,
      compteFonctionnel: '7000',
      numeroBordereau: '003',
      numeroDeclaration: '015',
      date: '2025-01-05',
      montant: 1500000,
    },
    {
      id: 2,
      codeCommune: '422',
      exercice: 2025,
      compteFonctionnel: '7004',
      numeroBordereau: '003',
      numeroDeclaration: '014',
      date: '2025-01-04',
      montant: 850000,
    },
    {
      id: 3,
      codeCommune: '422',
      exercice: 2025,
      compteFonctionnel: '7130',
      numeroBordereau: '002',
      numeroDeclaration: '013',
      date: '2025-01-03',
      montant: 320000,
    },
    {
      id: 4,
      codeCommune: '422',
      exercice: 2025,
      compteFonctionnel: '71330',
      numeroBordereau: '002',
      numeroDeclaration: '012',
      date: '2025-01-02',
      montant: 175000,
    },
    {
      id: 5,
      codeCommune: '422',
      exercice: 2025,
      compteFonctionnel: '7041',
      numeroBordereau: '001',
      numeroDeclaration: '011',
      date: '2025-01-01',
      montant: 95000,
    },
  ];

  loading.value = false;
});
</script>

<style scoped lang="scss">
.dashboard-card {
  border-radius: 12px;
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  }
}

.chart-container {
  min-height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.placeholder-chart {
  text-align: center;
  padding: 40px;
}

.opacity-30 {
  opacity: 0.3;
}
</style>
