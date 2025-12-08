<template>
  <q-page class="q-pa-md">
    <div class="row q-mb-md items-center justify-between">
      <div class="col">
        <div class="text-h5">
          <q-icon name="bar_chart" color="purple" class="q-mr-sm" />
          Statistiques - Timbres Fiscaux
        </div>
        <div class="text-caption text-grey-7 q-mt-xs">
          <q-icon name="info" size="16px" color="grey-7" />
          Analyses et rapports des ventes de timbres
        </div>
      </div>
      <div class="col-auto">
        <q-select
          v-model="selectedExercice"
          :options="exerciceOptions"
          label="Exercice"
          outlined
          dense
          emit-value
          map-options
          style="min-width: 150px"
          @update:model-value="loadData"
        />
      </div>
    </div>

    <!-- Résumé global -->
    <div class="row q-col-gutter-md q-mb-md">
      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="bg-purple text-white">
          <q-card-section>
            <div class="text-overline">Total Approvisionnements</div>
            <div class="text-h5">{{ formatMontant(stats.totalApprovisionnements) }}</div>
            <div class="text-caption">{{ stats.countApprovisionnements }} opérations</div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="bg-deep-purple text-white">
          <q-card-section>
            <div class="text-overline">Total Remises</div>
            <div class="text-h5">{{ formatMontant(stats.totalRemises) }}</div>
            <div class="text-caption">{{ stats.countRemises }} opérations</div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="bg-indigo text-white">
          <q-card-section>
            <div class="text-overline">Total Versements</div>
            <div class="text-h5">{{ formatMontant(stats.totalVersements) }}</div>
            <div class="text-caption">{{ stats.countVersements }} opérations</div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="bg-blue-grey text-white">
          <q-card-section>
            <div class="text-overline">Stock Actuel</div>
            <div class="text-h5">{{ formatMontant(stats.stockActuel) }}</div>
            <div class="text-caption">Valeur en stock</div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Graphiques -->
    <div class="row q-col-gutter-md q-mb-md">
      <div class="col-12 col-md-6">
        <q-card>
          <q-card-section>
            <div class="text-h6 q-mb-md">Évolution mensuelle</div>
            <div class="chart-container">
              <canvas ref="monthlyChartRef"></canvas>
            </div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-md-6">
        <q-card>
          <q-card-section>
            <div class="text-h6 q-mb-md">Répartition par quotité</div>
            <div class="chart-container">
              <canvas ref="quotiteChartRef"></canvas>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Tableau détaillé par mois -->
    <q-card>
      <q-card-section>
        <div class="text-h6 q-mb-md">Détail par mois</div>
        <q-table
          :rows="monthlyData"
          :columns="monthlyColumns"
          row-key="month"
          :loading="loading"
          :pagination="{ rowsPerPage: 12 }"
        >
          <template v-slot:body-cell-approvisionnements="props">
            <q-td :props="props" class="text-positive"
              >+{{ formatMontant(props.row.approvisionnements) }}</q-td
            >
          </template>
          <template v-slot:body-cell-remises="props">
            <q-td :props="props" class="text-warning">{{ formatMontant(props.row.remises) }}</q-td>
          </template>
          <template v-slot:body-cell-versements="props">
            <q-td :props="props" class="text-negative"
              >-{{ formatMontant(props.row.versements) }}</q-td
            >
          </template>
          <template v-slot:body-cell-solde="props">
            <q-td :props="props"
              ><strong>{{ formatMontant(props.row.solde) }}</strong></q-td
            >
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <!-- Top quotités -->
    <div class="row q-col-gutter-md q-mt-md">
      <div class="col-12 col-md-6">
        <q-card>
          <q-card-section>
            <div class="text-h6 q-mb-md">Top Quotités Vendues</div>
            <q-list separator>
              <q-item v-for="(item, index) in topQuotites" :key="item.code">
                <q-item-section avatar>
                  <q-avatar :color="index < 3 ? 'purple' : 'grey'" text-color="white">{{
                    index + 1
                  }}</q-avatar>
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ item.code }}</q-item-label>
                  <q-item-label caption>{{ item.count }} unités vendues</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-badge color="purple">{{ formatMontant(item.total) }}</q-badge>
                </q-item-section>
              </q-item>
              <q-item v-if="topQuotites.length === 0">
                <q-item-section class="text-grey">Aucune donnée disponible</q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-md-6">
        <q-card>
          <q-card-section>
            <div class="text-h6 q-mb-md">Quotités Disponibles</div>
            <q-list separator>
              <q-item v-for="q in quotites" :key="q.id ?? q.code">
                <q-item-section avatar>
                  <q-avatar color="purple-2" text-color="purple">
                    <q-icon name="verified" />
                  </q-avatar>
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ q.code }}</q-item-label>
                  <q-item-label caption>{{ q.prix }} FCFA</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-badge :color="q.actif ? 'positive' : 'grey'">{{
                    q.actif ? 'Actif' : 'Inactif'
                  }}</q-badge>
                </q-item-section>
              </q-item>
              <q-item v-if="quotites.length === 0">
                <q-item-section class="text-grey">Aucune quotité timbre définie</q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { db, DEFAULT_MAIRIE_ID } from 'src/database/db';
import type { Quotite } from 'src/database/db';
import Chart from 'chart.js/auto';

const loading = ref(false);
const selectedExercice = ref(new Date().getFullYear());
const monthlyChartRef = ref<HTMLCanvasElement | null>(null);
const quotiteChartRef = ref<HTMLCanvasElement | null>(null);
let monthlyChart: Chart | null = null;
let quotiteChart: Chart | null = null;

const exerciceOptions = computed(() => {
  const currentYear = new Date().getFullYear();
  return Array.from({ length: 5 }, (_, i) => ({
    label: `Exercice ${currentYear - i}`,
    value: currentYear - i,
  }));
});

const stats = ref({
  totalApprovisionnements: 0,
  totalRemises: 0,
  totalVersements: 0,
  stockActuel: 0,
  countApprovisionnements: 0,
  countRemises: 0,
  countVersements: 0,
});

const monthlyData = ref<
  Array<{
    month: string;
    approvisionnements: number;
    remises: number;
    versements: number;
    solde: number;
  }>
>([]);
const topQuotites = ref<Array<{ code: string; count: number; total: number }>>([]);
const quotites = ref<Quotite[]>([]);

const monthlyColumns = [
  { name: 'month', label: 'Mois', field: 'month', align: 'left' as const, sortable: true },
  {
    name: 'approvisionnements',
    label: 'Approvisionnements',
    field: 'approvisionnements',
    align: 'right' as const,
    sortable: true,
  },
  { name: 'remises', label: 'Remises', field: 'remises', align: 'right' as const, sortable: true },
  {
    name: 'versements',
    label: 'Versements',
    field: 'versements',
    align: 'right' as const,
    sortable: true,
  },
  { name: 'solde', label: 'Solde', field: 'solde', align: 'right' as const, sortable: true },
];

const formatMontant = (m: number) =>
  new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    minimumFractionDigits: 0,
  }).format(m);

const loadData = async () => {
  loading.value = true;
  try {
    const exercice = selectedExercice.value;

    // Charger les quotités timbres
    quotites.value = (await db.quotites.toArray()).filter(
      (q) => q.isTimbre && q.mairieId === DEFAULT_MAIRIE_ID,
    );

    // Charger les données
    const approvisionnements = await db.timbreApprovisionnements
      .where('exercice')
      .equals(exercice)
      .toArray();
    const remises = await db.timbreRemises.where('exercice').equals(exercice).toArray();
    const versements = await db.timbreVersements.where('exercice').equals(exercice).toArray();

    // Calculer les stats
    stats.value.totalApprovisionnements = approvisionnements.reduce((sum, a) => sum + a.total, 0);
    stats.value.totalRemises = remises.reduce((sum, r) => sum + r.total, 0);
    stats.value.totalVersements = versements.reduce((sum, v) => sum + v.total, 0);
    stats.value.stockActuel = stats.value.totalApprovisionnements - stats.value.totalRemises;
    stats.value.countApprovisionnements = approvisionnements.length;
    stats.value.countRemises = remises.length;
    stats.value.countVersements = versements.length;

    // Données mensuelles
    const months = [
      'Janvier',
      'Février',
      'Mars',
      'Avril',
      'Mai',
      'Juin',
      'Juillet',
      'Août',
      'Septembre',
      'Octobre',
      'Novembre',
      'Décembre',
    ];
    const monthlyStats: { approvisionnements: number; remises: number; versements: number }[] = [];
    for (let i = 0; i < 12; i++)
      monthlyStats.push({ approvisionnements: 0, remises: 0, versements: 0 });

    approvisionnements.forEach((a) => {
      const month = new Date(a.date).getMonth();
      monthlyStats[month]!.approvisionnements += a.total;
    });
    remises.forEach((r) => {
      const month = new Date(r.date).getMonth();
      monthlyStats[month]!.remises += r.total;
    });
    versements.forEach((v) => {
      const month = new Date(v.date).getMonth();
      monthlyStats[month]!.versements += v.total;
    });

    let cumSolde = 0;
    monthlyData.value = months.map((month, i) => {
      const ms = monthlyStats[i]!;
      cumSolde += ms.approvisionnements - ms.remises;
      return {
        month,
        approvisionnements: ms.approvisionnements,
        remises: ms.remises,
        versements: ms.versements,
        solde: cumSolde,
      };
    });

    // Top quotités
    const quotiteStats: Record<string, { count: number; total: number }> = {};
    remises.forEach((r) => {
      if (r.detailsQuotites) {
        Object.entries(r.detailsQuotites).forEach(([code, count]) => {
          if (!quotiteStats[code]) quotiteStats[code] = { count: 0, total: 0 };
          quotiteStats[code].count += count;
          const quotite = quotites.value.find((q) => q.code === code);
          if (quotite) quotiteStats[code].total += count * quotite.prix;
        });
      }
    });
    topQuotites.value = Object.entries(quotiteStats)
      .map(([code, data]) => ({ code, ...data }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);

    updateCharts();
  } finally {
    loading.value = false;
  }
};

const updateCharts = () => {
  // Graphique mensuel
  if (monthlyChartRef.value) {
    if (monthlyChart) monthlyChart.destroy();
    monthlyChart = new Chart(monthlyChartRef.value, {
      type: 'line',
      data: {
        labels: monthlyData.value.map((m) => m.month.substring(0, 3)),
        datasets: [
          {
            label: 'Approvisionnements',
            data: monthlyData.value.map((m) => m.approvisionnements),
            borderColor: '#9c27b0',
            backgroundColor: 'rgba(156, 39, 176, 0.1)',
            fill: true,
          },
          {
            label: 'Remises',
            data: monthlyData.value.map((m) => m.remises),
            borderColor: '#673ab7',
            backgroundColor: 'rgba(103, 58, 183, 0.1)',
            fill: true,
          },
          {
            label: 'Versements',
            data: monthlyData.value.map((m) => m.versements),
            borderColor: '#3f51b5',
            backgroundColor: 'rgba(63, 81, 181, 0.1)',
            fill: true,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom' } },
      },
    });
  }

  // Graphique par quotité
  if (quotiteChartRef.value && topQuotites.value.length > 0) {
    if (quotiteChart) quotiteChart.destroy();
    quotiteChart = new Chart(quotiteChartRef.value, {
      type: 'doughnut',
      data: {
        labels: topQuotites.value.map((q) => q.code),
        datasets: [
          {
            data: topQuotites.value.map((q) => q.total),
            backgroundColor: ['#9c27b0', '#673ab7', '#3f51b5', '#7b1fa2', '#512da8'],
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'right' } },
      },
    });
  }
};

watch(selectedExercice, () => loadData());

onMounted(() => loadData());

onUnmounted(() => {
  if (monthlyChart) monthlyChart.destroy();
  if (quotiteChart) quotiteChart.destroy();
});
</script>

<style scoped>
.chart-container {
  height: 300px;
  position: relative;
}
</style>
