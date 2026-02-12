<template>
  <q-page class="statistiques-page q-pa-md">
    <PageHeader
      title="Statistiques des Recettes"
      subtitle="Analyse et suivi des déclarations de recettes"
      icon="analytics"
    />

    <!-- Filtres de période -->
    <q-card class="filter-card q-mb-md">
      <q-card-section>
        <div class="row q-col-gutter-md items-end">
          <!-- Exercice -->
          <div class="col-12 col-sm-6 col-md-2">
            <q-select
              v-model="selectedExercice"
              :options="exerciceOptions"
              label="Exercice"
              outlined
              dense
              @update:model-value="loadStatistics"
            />
          </div>

          <!-- Sélecteur de période -->
          <div class="col-12 col-sm-6 col-md-2">
            <q-select
              v-model="periodFilter"
              :options="periodOptions"
              label="Période"
              outlined
              dense
              emit-value
              map-options
              @update:model-value="onPeriodChange"
            />
          </div>

          <!-- Date début -->
          <div class="col-12 col-sm-6 col-md-2">
            <q-input v-model="dateDebut" type="date" label="Date début" outlined dense clearable />
          </div>

          <!-- Date fin -->
          <div class="col-12 col-sm-6 col-md-2">
            <q-input v-model="dateFin" type="date" label="Date fin" outlined dense clearable />
          </div>

          <!-- Boutons d'action -->
          <div class="col-12 col-sm-6 col-md-4 row q-gutter-sm">
            <q-btn
              color="grey-7"
              icon="clear"
              label="Réinitialiser"
              outline
              @click="resetFilters"
              class="col"
              no-caps
            />
            <q-btn
              color="primary"
              icon="refresh"
              label="Actualiser"
              unelevated
              @click="loadStatistics"
              :loading="loading"
              class="col"
              no-caps
            />
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Cartes de statistiques principales -->
    <div class="row q-col-gutter-md q-mb-md">
      <div class="col-12 col-sm-6 col-md-3">
        <StatisticsCard
          :value="stats.totalDeclarations"
          title="Déclarations"
          :subtitle="`${stats.declarationsValidees} validées`"
          icon="description"
          icon-color="grey-7"
          border-color="#E67E22"
        />
      </div>

      <div class="col-12 col-sm-6 col-md-3">
        <StatisticsCard
          :value="stats.montantTotal"
          title="Montant Total"
          subtitle="Recettes encaissées"
          icon="payments"
          icon-color="grey-7"
          border-color="#2E7D32"
          format="currency"
        />
      </div>

      <div class="col-12 col-sm-6 col-md-3">
        <StatisticsCard
          :value="stats.totalBordereaux"
          title="Bordereaux"
          :subtitle="`${stats.bordereauxFermes} fermés`"
          icon="receipt_long"
          icon-color="grey-7"
          border-color="#E67E22"
        />
      </div>

      <div class="col-12 col-sm-6 col-md-3">
        <StatisticsCard
          :value="stats.tauxValidation"
          title="Taux Validation"
          subtitle="Déclarations validées"
          icon="trending_up"
          icon-color="grey-7"
          border-color="#1A1A1A"
          suffix="%"
        />
      </div>
    </div>

    <!-- Graphiques et analyses -->
    <div class="row q-col-gutter-md">
      <q-inner-loading :showing="loading">
        <q-spinner-gears size="50px" color="primary" />
      </q-inner-loading>

      <!-- Message si aucune donnée -->
      <div v-if="!loading && stats.totalDeclarations === 0" class="col-12 text-center q-pa-xl">
        <q-icon name="bar_chart" size="64px" color="grey-5" />
        <div class="text-h6 text-grey-6 q-mt-md">Aucune donnée disponible</div>
        <div class="text-caption text-grey-5">
          Créez des déclarations de recettes pour voir les statistiques
        </div>
      </div>

      <!-- Répartition par statut -->
      <div v-if="!loading && stats.totalDeclarations > 0" class="col-12 col-md-6">
        <ChartCard
          title="Répartition par Statut"
          :chart-config="statutChartConfig"
          header-class="text-grey-8"
        />
      </div>

      <!-- Répartition par taxe -->
      <div v-if="!loading && stats.totalDeclarations > 0" class="col-12 col-md-6">
        <ChartCard
          title="Top 5 Taxes par Montant"
          :chart-config="taxeChartConfig"
          header-class="text-grey-8"
        />
      </div>

      <!-- Évolution mensuelle -->
      <div v-if="!loading && stats.totalDeclarations > 0" class="col-12">
        <ChartCard
          title="Évolution Mensuelle des Recettes"
          :chart-config="evolutionChartConfig"
          header-class="text-grey-8"
          container-class="chart-container-large"
        />
      </div>

      <!-- Tableau détaillé par taxe -->
      <div v-if="!loading && stats.totalDeclarations > 0" class="col-12">
        <q-card class="details-card">
          <q-card-section class="bg-grey-1">
            <div class="text-h6 text-grey-8">Détails par Taxe</div>
          </q-card-section>
          <q-card-section>
            <q-table
              :rows="detailsTaxes"
              :columns="taxesColumns"
              row-key="taxeId"
              :pagination="{ rowsPerPage: 10 }"
              flat
              bordered
            >
              <template v-slot:body-cell-taxe="props">
                <q-td :props="props">
                  <q-badge color="primary" text-color="white" :label="props.row.label" />
                </q-td>
              </template>
              <template v-slot:body-cell-count="props">
                <q-td :props="props">
                  <span class="text-weight-bold">{{ formatNumber(props.row.count) }}</span>
                </q-td>
              </template>
              <template v-slot:body-cell-montant="props">
                <q-td :props="props" class="text-weight-bold" style="color: #2e7d32">
                  {{ formatMontant(props.row.montant) }}
                </q-td>
              </template>
              <template v-slot:body-cell-moyenne="props">
                <q-td :props="props">
                  {{ formatMontant(props.row.moyenne) }}
                </q-td>
              </template>
              <template v-slot:body-cell-part="props">
                <q-td :props="props">
                  <q-chip :color="getPartColor(props.row.part)" text-color="white" size="sm" dense>
                    {{ props.row.part }}%
                  </q-chip>
                </q-td>
              </template>
            </q-table>
          </q-card-section>
        </q-card>
      </div>

      <!-- Statistiques d'activité -->
      <div v-if="!loading && stats.totalDeclarations > 0" class="col-12 col-md-6">
        <q-card class="activity-card">
          <q-card-section class="bg-grey-1">
            <div class="text-h6 text-grey-8">Résumé de l'Activité</div>
          </q-card-section>
          <q-card-section>
            <q-list separator>
              <q-item>
                <q-item-section avatar>
                  <q-avatar color="primary" text-color="white" icon="description" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-bold">Déclarations Totales</q-item-label>
                  <q-item-label caption>Sur la période sélectionnée</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-item-label class="text-h6" style="color: #e67e22">
                    {{ formatNumber(stats.totalDeclarations) }}
                  </q-item-label>
                </q-item-section>
              </q-item>

              <q-item>
                <q-item-section avatar>
                  <q-avatar color="positive" text-color="white" icon="check_circle" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-bold">Déclarations Validées</q-item-label>
                  <q-item-label caption>Prêtes pour émission</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-item-label class="text-h6" style="color: #2e7d32">
                    {{ formatNumber(stats.declarationsValidees) }}
                  </q-item-label>
                </q-item-section>
              </q-item>

              <q-item>
                <q-item-section avatar>
                  <q-avatar color="warning" text-color="white" icon="receipt_long" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-bold">Bordereaux Créés</q-item-label>
                  <q-item-label caption>Dont {{ stats.bordereauxFermes }} fermés</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-item-label class="text-h6" style="color: #e67e22">
                    {{ formatNumber(stats.totalBordereaux) }}
                  </q-item-label>
                </q-item-section>
              </q-item>

              <q-item>
                <q-item-section avatar>
                  <q-avatar style="background-color: #1a1a1a" text-color="white" icon="calculate" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-bold">Montant Moyen</q-item-label>
                  <q-item-label caption>Par déclaration</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-item-label class="text-h6" style="color: #1a1a1a">
                    {{ formatMontant(stats.montantMoyen) }}
                  </q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
      </div>

      <!-- Top 5 taxes -->
      <div v-if="!loading && stats.totalDeclarations > 0" class="col-12 col-md-6">
        <q-card class="top-card">
          <q-card-section class="bg-grey-1">
            <div class="text-h6 text-grey-8">Top 5 Taxes</div>
          </q-card-section>
          <q-card-section>
            <q-list separator>
              <q-item v-for="(item, index) in topTaxes" :key="index">
                <q-item-section avatar>
                  <q-avatar :color="getTopColor(index)" text-color="white">
                    {{ index + 1 }}
                  </q-avatar>
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-medium">{{ item.label }}</q-item-label>
                  <q-item-label caption>{{ item.count }} déclarations</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-item-label class="text-weight-bold" style="color: #2e7d32">
                    {{ formatMontant(item.montant) }}
                  </q-item-label>
                </q-item-section>
              </q-item>
              <q-item v-if="topTaxes.length === 0">
                <q-item-section class="text-center text-grey-6">
                  Aucune donnée disponible
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
import PageHeader from 'src/components/PageHeader.vue';
import StatisticsCard from 'src/components/StatisticsCard.vue';
import ChartCard from 'src/components/ChartCard.vue';
import { db } from 'src/database/db';
import type { Declaration, Taxe, BordereauRecette } from 'src/database/db';

const $q = useQuasar();

// Refs
const loading = ref(false);
const currentYear = new Date().getFullYear();
const selectedExercice = ref(currentYear - 1); // Année précédente par défaut pour voir les données de test
const periodFilter = ref('annee');
const dateDebut = ref('');
const dateFin = ref('');

// Options d'exercice
const exerciceOptions = ref<number[]>([currentYear - 2, currentYear - 1, currentYear]);

// Données brutes de la base
const declarations = ref<Declaration[]>([]);
const taxes = ref<Taxe[]>([]);
const bordereaux = ref<BordereauRecette[]>([]);

// Options de période
const periodOptions = [
  { label: "Aujourd'hui", value: 'jour' },
  { label: 'Cette semaine', value: 'semaine' },
  { label: 'Ce mois', value: 'mois' },
  { label: 'Ce trimestre', value: 'trimestre' },
  { label: 'Cette année', value: 'annee' },
  { label: 'Personnalisé', value: 'custom' },
];

// Déclarations filtrées par période
const filteredDeclarations = computed(() => {
  let filtered = declarations.value;

  if (dateDebut.value) {
    const debut = new Date(dateDebut.value);
    filtered = filtered.filter((d) => d.dateEncaissement && new Date(d.dateEncaissement) >= debut);
  }

  if (dateFin.value) {
    const fin = new Date(dateFin.value);
    fin.setHours(23, 59, 59, 999);
    filtered = filtered.filter((d) => d.dateEncaissement && new Date(d.dateEncaissement) <= fin);
  }

  return filtered;
});

// Données des statistiques
const stats = computed(() => {
  const decl = filteredDeclarations.value;

  const totalDeclarations = decl.length;
  const declarationsValidees = decl.filter((d) => d.statut === 'validee').length;
  const montantTotal = decl.reduce((sum, d) => sum + (d.montantRecette || d.montant || 0), 0);
  const montantMoyen = totalDeclarations > 0 ? montantTotal / totalDeclarations : 0;
  const tauxValidation =
    totalDeclarations > 0 ? Math.round((declarationsValidees / totalDeclarations) * 100) : 0;

  const totalBordereaux = bordereaux.value.length;
  const bordereauxFermes = bordereaux.value.filter((b) => b.statut === 'ferme').length;

  return {
    totalDeclarations,
    declarationsValidees,
    montantTotal,
    montantMoyen,
    tauxValidation,
    totalBordereaux,
    bordereauxFermes,
    nombreTaxes: taxes.value.length,
  };
});

// Top taxes
const topTaxes = computed(() => {
  const decl = filteredDeclarations.value;
  const taxeStats: Record<number, { label: string; montant: number; count: number }> = {};

  decl.forEach((d) => {
    if (!taxeStats[d.taxeId]) {
      const taxe = taxes.value.find((t) => t.id === d.taxeId);
      taxeStats[d.taxeId] = {
        label: taxe?.libelle || 'Inconnu',
        montant: 0,
        count: 0,
      };
    }
    const stat = taxeStats[d.taxeId];
    if (stat) {
      stat.montant += d.montantRecette || d.montant || 0;
      stat.count += 1;
    }
  });

  return Object.values(taxeStats)
    .sort((a, b) => b.montant - a.montant)
    .slice(0, 5);
});

// Détails par taxe pour le tableau
const detailsTaxes = computed(() => {
  const decl = filteredDeclarations.value;
  const montantTotal = stats.value.montantTotal;
  const taxeStats: Record<
    number,
    { taxeId: number; label: string; montant: number; count: number; moyenne: number; part: number }
  > = {};

  decl.forEach((d) => {
    if (!taxeStats[d.taxeId]) {
      const taxe = taxes.value.find((t) => t.id === d.taxeId);
      taxeStats[d.taxeId] = {
        taxeId: d.taxeId,
        label: taxe?.libelle || 'Inconnu',
        montant: 0,
        count: 0,
        moyenne: 0,
        part: 0,
      };
    }
    const stat = taxeStats[d.taxeId];
    if (stat) {
      stat.montant += d.montantRecette || d.montant || 0;
      stat.count += 1;
    }
  });

  return Object.values(taxeStats)
    .map((t) => ({
      ...t,
      moyenne: t.count > 0 ? t.montant / t.count : 0,
      part: montantTotal > 0 ? Math.round((t.montant / montantTotal) * 100) : 0,
    }))
    .sort((a, b) => b.montant - a.montant);
});

// Colonnes du tableau
const taxesColumns = [
  { name: 'taxe', label: 'Taxe', align: 'left' as const, field: 'label', sortable: true },
  {
    name: 'count',
    label: 'Déclarations',
    align: 'center' as const,
    field: 'count',
    sortable: true,
  },
  {
    name: 'montant',
    label: 'Montant Total',
    align: 'right' as const,
    field: 'montant',
    sortable: true,
  },
  { name: 'moyenne', label: 'Moyenne', align: 'right' as const, field: 'moyenne', sortable: true },
  { name: 'part', label: 'Part', align: 'center' as const, field: 'part', sortable: true },
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

function getPartColor(part: number): string {
  if (part >= 30) return 'positive';
  if (part >= 15) return 'warning';
  return 'grey-7';
}

function getTopColor(index: number): string {
  const colors = ['orange-8', 'green-8', 'grey-8', 'orange-6', 'green-6'];
  return colors[index] || 'grey-7';
}

// Gestion des périodes
function onPeriodChange() {
  const exercice = selectedExercice.value;
  let debut = new Date();
  let fin = new Date();

  switch (periodFilter.value) {
    case 'jour':
      // Pour l'exercice sélectionné, on montre le dernier jour de l'année
      debut = new Date(exercice, 11, 31);
      fin = new Date(exercice, 11, 31);
      break;
    case 'semaine':
      // Dernière semaine de l'exercice
      debut = new Date(exercice, 11, 25);
      fin = new Date(exercice, 11, 31);
      break;
    case 'mois':
      // Dernier mois de l'exercice (décembre)
      debut = new Date(exercice, 11, 1);
      fin = new Date(exercice, 11, 31);
      break;
    case 'trimestre': {
      // Dernier trimestre (Oct-Déc)
      debut = new Date(exercice, 9, 1);
      fin = new Date(exercice, 11, 31);
      break;
    }
    case 'annee':
      debut = new Date(exercice, 0, 1);
      fin = new Date(exercice, 11, 31);
      break;
    default:
      return;
  }

  dateDebut.value = debut.toISOString().split('T')[0]!;
  dateFin.value = fin.toISOString().split('T')[0]!;

  void loadStatistics();
}

function resetFilters() {
  periodFilter.value = 'annee';
  selectedExercice.value = currentYear - 1;
  onPeriodChange();
}

// Chargement des statistiques
async function loadStatistics() {
  loading.value = true;
  try {
    // Récupérer la première mairie disponible
    const mairie = await db.mairies.orderBy('id').first();
    const mairieId = mairie?.id || 1; // Fallback à 1 si aucune mairie n'est trouvée

    if (!mairieId) {
      console.warn('Aucune mairie trouvée et ID par défaut invalide');
      return;
    }

    const exercice = selectedExercice.value;

    const [decl, taxesList, bordereauxList] = await Promise.all([
      db.declarations
        .where('mairieId')
        .equals(mairieId)
        .filter((d) => d.exercice === exercice)
        .toArray(),
      db.taxes.where('mairieId').equals(mairieId).toArray(),
      db.bordereauxRecette
        .where('mairieId')
        .equals(mairieId)
        .filter((b) => b.annee === exercice)
        .toArray(),
    ]);

    declarations.value = decl;
    taxes.value = taxesList;
    bordereaux.value = bordereauxList;
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
const statutChartConfig = computed<ChartConfiguration>(() => {
  const decl = filteredDeclarations.value;
  const brouillon = decl.filter((d) => d.statut === 'brouillon').length;
  const validee = decl.filter((d) => d.statut === 'validee').length;

  return {
    type: 'doughnut',
    data: {
      labels: ['Brouillon', 'Validée'],
      datasets: [
        {
          label: 'Déclarations',
          data: [brouillon, validee],
          backgroundColor: ['#9E9E9E', '#2E7D32'],
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
              return `${label}: ${formatNumber(value)} déclarations`;
            },
          },
        },
      },
    },
  };
});

const taxeChartConfig = computed<ChartConfiguration>(() => {
  const top5 = topTaxes.value;

  return {
    type: 'bar',
    data: {
      labels: top5.map((t) => t.label),
      datasets: [
        {
          label: 'Montant',
          data: top5.map((t) => t.montant),
          backgroundColor: ['#E67E22', '#2E7D32', '#F57C00', '#388E3C', '#757575'],
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      indexAxis: 'y',
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: function (context: TooltipItem<keyof ChartTypeRegistry>) {
              const value = context.parsed.x || 0;
              return `Montant: ${formatMontant(value)}`;
            },
          },
        },
      },
      scales: {
        x: {
          beginAtZero: true,
          ticks: {
            callback: function (tickValue: string | number) {
              return formatMontant(Number(tickValue));
            },
          },
        },
      },
    },
  };
});

const evolutionChartConfig = computed<ChartConfiguration>(() => {
  const labels = [
    'Janv',
    'Févr',
    'Mars',
    'Avr',
    'Mai',
    'Juin',
    'Juil',
    'Août',
    'Sept',
    'Oct',
    'Nov',
    'Déc',
  ];
  const monthlyData = new Array(12).fill(0);

  filteredDeclarations.value.forEach((d) => {
    if (d.dateEncaissement) {
      const dateVal = new Date(d.dateEncaissement);
      const month = dateVal.getMonth();
      if (month >= 0 && month < 12) {
        monthlyData[month] += d.montantRecette || d.montant || 0;
      }
    }
  });

  return {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Montant des recettes',
          data: monthlyData,
          borderColor: '#E67E22',
          backgroundColor: 'rgba(230, 126, 34, 0.1)',
          tension: 0.4,
          fill: true,
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
              return `${label}: ${formatMontant(value)}`;
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
  };
});

// Lifecycle hooks
onMounted(async () => {
  onPeriodChange();
  await loadStatistics();
});
</script>

<style scoped lang="scss">
.statistiques-page {
  max-width: 1400px;
  margin: 0 auto;
}

.filter-card,
.details-card,
.activity-card,
.top-card {
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition:
    transform 0.2s,
    box-shadow 0.2s;

  &:hover {
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
  }
}

.chart-container {
  position: relative;
  height: 300px;
}

.chart-container-large {
  position: relative;
  height: 400px;
}
</style>
