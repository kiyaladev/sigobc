<template>
  <q-page class="q-pa-md">
    <div class="row q-mb-md justify-between items-center">
      <div class="text-h5">Statistiques des Tickets</div>
      <ExportButtons @export-pdf="exportPDF" @export-excel="exportExcel" />
    </div>

    <!-- Filtres de période -->
    <FilterBar
      v-model:period="periodFilter"
      v-model:date-debut="dateDebut"
      v-model:date-fin="dateFin"
      :period-options="periodOptions"
      show-period
      show-date-range
      show-refresh
      :loading="loading"
      @period-change="onPeriodChange"
      @refresh="loadStatistics"
      @reset="resetFilters"
    />

    <!-- Cartes de statistiques principales -->
    <div class="row q-col-gutter-md q-mb-md">
      <div class="col-12 col-sm-6 col-md-3">
        <StatisticsCard
          :value="stats.stockTotal"
          title="Stock Total"
          :subtitle="`${stats.typesTickets} types de tickets`"
          icon="confirmation_number"
          icon-color="blue"
          border-color="var(--q-blue)"
        />
      </div>

      <div class="col-12 col-sm-6 col-md-3">
        <StatisticsCard
          :value="stats.valeurTotale"
          title="Valeur Totale"
          subtitle="En stock actuellement"
          icon="payments"
          icon-color="green"
          border-color="var(--q-green)"
          format="currency"
        />
      </div>

      <div class="col-12 col-sm-6 col-md-3">
        <StatisticsCard
          :value="stats.approvisionnements"
          title="Appros Période"
          :subtitle="formatMontant(stats.montantAppros)"
          icon="inventory"
          icon-color="orange"
          border-color="var(--q-orange)"
        />
      </div>

      <div class="col-12 col-sm-6 col-md-3">
        <StatisticsCard
          :value="stats.versements"
          title="Versements Période"
          :subtitle="formatMontant(stats.montantVersements)"
          icon="upload"
          icon-color="purple"
          border-color="var(--q-purple)"
        />
      </div>
    </div>

    <!-- Graphiques et analyses -->
    <div class="row q-col-gutter-md">
      <!-- Stock par valeur -->
      <div class="col-12 col-md-6">
        <ChartCard
          title="Répartition du Stock par Valeur"
          :chart-config="stockChartConfig"
          header-class="bg-primary text-white"
        />
      </div>

      <!-- Valeur du stock -->
      <div class="col-12 col-md-6">
        <ChartCard
          title="Valeur du Stock par Type"
          :chart-config="valeurChartConfig"
          header-class="bg-secondary text-white"
        />
      </div>

      <!-- Évolution mensuelle -->
      <div class="col-12">
        <ChartCard
          title="Évolution des Opérations"
          :chart-config="evolutionChartConfig"
          header-class="bg-info text-white"
          container-class="chart-container-large"
        />
      </div>

      <!-- Tableau détaillé par type de ticket -->
      <div class="col-12">
        <q-card>
          <q-card-section class="bg-accent text-white">
            <div class="text-h6">Détails par Type de Ticket</div>
          </q-card-section>
          <q-card-section>
            <q-table
              :rows="detailsTickets"
              :columns="ticketsColumns"
              row-key="valeur"
              :pagination="{ rowsPerPage: 10 }"
              flat
              bordered
            >
              <template v-slot:body-cell-valeur="props">
                <q-td :props="props">
                  <q-badge color="primary" :label="props.row.valeur + ' FCFA'" />
                </q-td>
              </template>
              <template v-slot:body-cell-stock="props">
                <q-td :props="props">
                  <div class="row items-center">
                    <div class="col-auto q-mr-md">
                      <span class="text-weight-bold">{{ formatNumber(props.row.stock) }}</span>
                    </div>
                    <div class="col">
                      <q-linear-progress
                        :value="props.row.stock / 1000"
                        :color="getStockColor(props.row.stock)"
                        size="8px"
                      />
                    </div>
                  </div>
                </q-td>
              </template>
              <template v-slot:body-cell-valeurStock="props">
                <q-td :props="props" class="text-weight-bold text-positive">
                  {{ formatMontant(props.row.valeurStock) }}
                </q-td>
              </template>
              <template v-slot:body-cell-appros="props">
                <q-td :props="props">
                  {{ formatNumber(props.row.appros) }}
                </q-td>
              </template>
              <template v-slot:body-cell-remises="props">
                <q-td :props="props">
                  {{ formatNumber(props.row.remises) }}
                </q-td>
              </template>
              <template v-slot:body-cell-versements="props">
                <q-td :props="props">
                  {{ formatNumber(props.row.versements) }}
                </q-td>
              </template>
              <template v-slot:body-cell-taux="props">
                <q-td :props="props">
                  <q-chip :color="getTauxColor(props.row.taux)" text-color="white" size="sm" dense>
                    {{ props.row.taux }}%
                  </q-chip>
                </q-td>
              </template>
            </q-table>
          </q-card-section>
        </q-card>
      </div>

      <!-- Statistiques d'activité -->
      <div class="col-12 col-md-6">
        <q-card>
          <q-card-section class="bg-positive text-white">
            <div class="text-h6">Activité de la Période</div>
          </q-card-section>
          <q-card-section>
            <q-list separator>
              <q-item>
                <q-item-section avatar>
                  <q-avatar color="blue" text-color="white" icon="shopping_cart" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-bold">Approvisionnements</q-item-label>
                  <q-item-label caption>Total des entrées</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-item-label class="text-h6 text-primary">
                    {{ formatNumber(stats.totalEntrees) }}
                  </q-item-label>
                  <q-item-label caption>tickets</q-item-label>
                </q-item-section>
              </q-item>

              <q-item>
                <q-item-section avatar>
                  <q-avatar color="orange" text-color="white" icon="local_shipping" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-bold">Remises</q-item-label>
                  <q-item-label caption>Total des sorties (remises)</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-item-label class="text-h6 text-orange">
                    {{ formatNumber(stats.totalRemises) }}
                  </q-item-label>
                  <q-item-label caption>tickets</q-item-label>
                </q-item-section>
              </q-item>

              <q-item>
                <q-item-section avatar>
                  <q-avatar color="purple" text-color="white" icon="account_balance" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-bold">Versements</q-item-label>
                  <q-item-label caption>Total des versements</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-item-label class="text-h6 text-purple">
                    {{ formatNumber(stats.totalVersementsTickets) }}
                  </q-item-label>
                  <q-item-label caption>tickets</q-item-label>
                </q-item-section>
              </q-item>

              <q-item>
                <q-item-section avatar>
                  <q-avatar color="green" text-color="white" icon="trending_up" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-bold">Taux de Rotation</q-item-label>
                  <q-item-label caption>Rotation du stock</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-item-label class="text-h6 text-green">
                    {{ stats.tauxRotation }}%
                  </q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
      </div>

      <!-- Alertes et recommandations -->
      <div class="col-12 col-md-6">
        <q-card>
          <q-card-section class="bg-warning text-white">
            <div class="text-h6">Alertes et Recommandations</div>
          </q-card-section>
          <q-card-section>
            <q-list separator>
              <q-item v-for="(alerte, index) in alertes" :key="index">
                <q-item-section avatar>
                  <q-icon :name="alerte.icon" :color="alerte.color" size="md" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-medium">{{ alerte.titre }}</q-item-label>
                  <q-item-label caption>{{ alerte.description }}</q-item-label>
                </q-item-section>
              </q-item>
              <q-item v-if="alertes.length === 0">
                <q-item-section avatar>
                  <q-icon name="check_circle" color="positive" size="md" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-medium">Tout est normal</q-item-label>
                  <q-item-label caption>Aucune alerte à signaler</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { type ChartConfiguration, type TooltipItem, type ChartTypeRegistry } from 'chart.js';
import FilterBar from 'src/components/FilterBar.vue';
import StatisticsCard from 'src/components/StatisticsCard.vue';
import ChartCard from 'src/components/ChartCard.vue';
import ExportButtons from 'src/components/ExportButtons.vue';

const $q = useQuasar();

// Refs
const loading = ref(false);
const periodFilter = ref('mois');
const dateDebut = ref('');
const dateFin = ref('');

// Options de période
const periodOptions = [
  { label: "Aujourd'hui", value: 'jour' },
  { label: 'Cette semaine', value: 'semaine' },
  { label: 'Ce mois', value: 'mois' },
  { label: 'Ce trimestre', value: 'trimestre' },
  { label: 'Cette année', value: 'annee' },
  { label: 'Personnalisé', value: 'custom' },
];

// Données des statistiques
const stats = ref({
  stockTotal: 1475,
  typesTickets: 6,
  valeurTotale: 682500,
  approvisionnements: 45,
  montantAppros: 1250000,
  versements: 38,
  montantVersements: 985000,
  totalEntrees: 2500,
  totalRemises: 1800,
  totalVersementsTickets: 1600,
  tauxRotation: 68,
});

// Détails par type de ticket
const detailsTickets = ref([
  {
    valeur: 100,
    stock: 450,
    valeurStock: 45000,
    appros: 800,
    remises: 350,
    versements: 320,
    taux: 72,
  },
  {
    valeur: 200,
    stock: 320,
    valeurStock: 64000,
    appros: 600,
    remises: 280,
    versements: 250,
    taux: 65,
  },
  {
    valeur: 300,
    stock: 280,
    valeurStock: 84000,
    appros: 500,
    remises: 220,
    versements: 200,
    taux: 60,
  },
  {
    valeur: 500,
    stock: 150,
    valeurStock: 75000,
    appros: 400,
    remises: 250,
    versements: 230,
    taux: 80,
  },
  {
    valeur: 600,
    stock: 180,
    valeurStock: 108000,
    appros: 350,
    remises: 170,
    versements: 160,
    taux: 58,
  },
  {
    valeur: 1000,
    stock: 95,
    valeurStock: 95000,
    appros: 300,
    remises: 205,
    versements: 190,
    taux: 75,
  },
]);

// Alertes
const alertes = computed(() => {
  const alerts: Array<{ icon: string; color: string; titre: string; description: string }> = [];

  detailsTickets.value.forEach((ticket) => {
    if (ticket.stock < 100) {
      alerts.push({
        icon: 'warning',
        color: 'negative',
        titre: `Stock faible - Tickets ${ticket.valeur} FCFA`,
        description: `Seulement ${ticket.stock} tickets en stock. Réapprovisionnement recommandé.`,
      });
    } else if (ticket.stock < 200) {
      alerts.push({
        icon: 'info',
        color: 'warning',
        titre: `Stock moyen - Tickets ${ticket.valeur} FCFA`,
        description: `${ticket.stock} tickets en stock. Surveiller l'évolution.`,
      });
    }
  });

  return alerts;
});

// Colonnes du tableau
const ticketsColumns = [
  {
    name: 'valeur',
    label: 'Valeur',
    field: 'valeur',
    align: 'center' as const,
    sortable: true,
  },
  {
    name: 'stock',
    label: 'Stock Actuel',
    field: 'stock',
    align: 'left' as const,
    sortable: true,
  },
  {
    name: 'valeurStock',
    label: 'Valeur Stock',
    field: 'valeurStock',
    align: 'right' as const,
    sortable: true,
  },
  {
    name: 'appros',
    label: 'Appros',
    field: 'appros',
    align: 'center' as const,
    sortable: true,
  },
  {
    name: 'remises',
    label: 'Remises',
    field: 'remises',
    align: 'center' as const,
    sortable: true,
  },
  {
    name: 'versements',
    label: 'Versements',
    field: 'versements',
    align: 'center' as const,
    sortable: true,
  },
  {
    name: 'taux',
    label: 'Taux Rotation',
    field: 'taux',
    align: 'center' as const,
    sortable: true,
  },
];

// Fonctions utilitaires
function formatMontant(montant: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    minimumFractionDigits: 0,
  }).format(montant);
}

function formatNumber(num: number): string {
  return new Intl.NumberFormat('fr-FR').format(num);
}

function getStockColor(stock: number): string {
  if (stock < 100) return 'negative';
  if (stock < 200) return 'warning';
  return 'positive';
}

function getTauxColor(taux: number): string {
  if (taux >= 70) return 'positive';
  if (taux >= 50) return 'warning';
  return 'negative';
}

// Fonctions d'export
function exportPDF() {
  $q.notify({
    type: 'info',
    message: 'Export PDF en cours de développement...',
  });
}

function exportExcel() {
  $q.notify({
    type: 'info',
    message: 'Export Excel en cours de développement...',
  });
}

// Gestion des périodes
function onPeriodChange() {
  const today = new Date();
  let debut = new Date();
  let fin = new Date();

  switch (periodFilter.value) {
    case 'jour':
      debut = new Date(today);
      fin = new Date(today);
      break;
    case 'semaine':
      debut = new Date(today.setDate(today.getDate() - today.getDay()));
      fin = new Date();
      break;
    case 'mois':
      debut = new Date(today.getFullYear(), today.getMonth(), 1);
      fin = new Date();
      break;
    case 'trimestre': {
      const quarter = Math.floor(today.getMonth() / 3);
      debut = new Date(today.getFullYear(), quarter * 3, 1);
      fin = new Date();
      break;
    }
    case 'annee':
      debut = new Date(today.getFullYear(), 0, 1);
      fin = new Date();
      break;
    default:
      return;
  }

  dateDebut.value = debut.toISOString().split('T')[0]!;
  dateFin.value = fin.toISOString().split('T')[0]!;

  void loadStatistics();
}

function resetFilters() {
  periodFilter.value = 'mois';
  onPeriodChange();
}

// Chargement des statistiques
async function loadStatistics() {
  loading.value = true;
  try {
    // Ici, charger les vraies données depuis la base de données
    await new Promise((resolve) => setTimeout(resolve, 500));
  } catch (error) {
    console.error('Erreur:', error);
    $q.notify({
      type: 'negative',
      message: 'Erreur lors du chargement des statistiques',
    });
  } finally {
    loading.value = false;
  }
}

// Configuration des graphiques
const stockChartConfig = computed<ChartConfiguration>(() => ({
  type: 'doughnut',
  data: {
    labels: detailsTickets.value.map((t) => `${t.valeur} FCFA`),
    datasets: [
      {
        label: 'Stock',
        data: detailsTickets.value.map((t) => t.stock),
        backgroundColor: ['#42A5F5', '#66BB6A', '#FFA726', '#AB47BC', '#26C6DA', '#EF5350'],
      },
    ],
  },
  options: {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: { position: 'bottom' },
      tooltip: {
        callbacks: {
          label: function (context: TooltipItem<keyof ChartTypeRegistry>) {
            const label = context.label || '';
            const value = context.parsed || 0;
            return `${label}: ${formatNumber(value)} tickets`;
          },
        },
      },
    },
  },
}));

const valeurChartConfig = computed<ChartConfiguration>(() => ({
  type: 'bar',
  data: {
    labels: detailsTickets.value.map((t) => `${t.valeur} FCFA`),
    datasets: [
      {
        label: 'Valeur du stock',
        data: detailsTickets.value.map((t) => t.valeurStock),
        backgroundColor: '#66BB6A',
      },
    ],
  },
  options: {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: function (context: TooltipItem<keyof ChartTypeRegistry>) {
            const value = context.parsed.y || 0;
            return `Valeur: ${formatMontant(value)}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (tickValue: string | number) {
            return formatMontant(Number(tickValue));
          },
        },
      },
    },
  },
}));

const evolutionChartConfig = computed<ChartConfiguration>(() => ({
  type: 'line',
  data: {
    labels: ['Janv', 'Févr', 'Mars', 'Avr', 'Mai', 'Juin'],
    datasets: [
      {
        label: 'Approvisionnements',
        data: [1200, 1900, 1500, 2200, 1800, 2500],
        borderColor: '#42A5F5',
        backgroundColor: 'rgba(66, 165, 245, 0.1)',
        tension: 0.4,
      },
      {
        label: 'Remises',
        data: [800, 1200, 1000, 1500, 1300, 1800],
        borderColor: '#FFA726',
        backgroundColor: 'rgba(255, 167, 38, 0.1)',
        tension: 0.4,
      },
      {
        label: 'Versements',
        data: [700, 1100, 900, 1400, 1200, 1600],
        borderColor: '#AB47BC',
        backgroundColor: 'rgba(171, 71, 188, 0.1)',
        tension: 0.4,
      },
    ],
  },
  options: {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: { position: 'bottom' },
      tooltip: {
        callbacks: {
          label: function (context: TooltipItem<keyof ChartTypeRegistry>) {
            const label = context.dataset.label || '';
            const value = context.parsed.y || 0;
            return `${label}: ${formatNumber(value)} tickets`;
          },
        },
      },
    },
    scales: {
      y: { beginAtZero: true },
    },
  },
}));

// Lifecycle hooks
onMounted(() => {
  // Initialiser les dates par défaut
  onPeriodChange();
});
</script>

<style scoped lang="scss">
.chart-container {
  position: relative;
  height: 300px;
}

.chart-container-large {
  position: relative;
  height: 400px;
}
</style>
