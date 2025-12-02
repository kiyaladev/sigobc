<template>
  <q-page class="statistiques-page q-pa-md">
    <PageHeader
      title="Statistiques des Dépenses"
      subtitle="Analyse et suivi de l'exécution budgétaire"
      icon="analytics"
    />

    <!-- Filtres -->
    <q-card class="filter-card q-mb-md">
      <q-card-section>
        <div class="row q-col-gutter-md items-end">
          <!-- Exercice -->
          <div class="col-12 col-sm-6 col-md-3">
            <q-select
              v-model="selectedExercice"
              :options="exerciceOptions"
              label="Exercice"
              outlined
              dense
              @update:model-value="loadStatistics"
            />
          </div>

          <!-- Période -->
          <div class="col-12 col-sm-6 col-md-3">
            <q-select
              v-model="periodFilter"
              :options="periodOptions"
              label="Période"
              outlined
              dense
              @update:model-value="onPeriodChange"
            />
          </div>

          <!-- Date début -->
          <div class="col-12 col-sm-6 col-md-3">
            <q-input v-model="dateDebut" type="date" label="Date début" outlined dense clearable />
          </div>

          <!-- Date fin -->
          <div class="col-12 col-sm-6 col-md-3">
            <q-input v-model="dateFin" type="date" label="Date fin" outlined dense clearable />
          </div>

          <!-- Boutons d'action -->
          <div class="col-12 row q-gutter-sm justify-end">
            <q-btn
              color="grey-7"
              icon="clear"
              label="Réinitialiser"
              outline
              @click="resetFilters"
              no-caps
            />
            <q-btn
              color="primary"
              icon="refresh"
              label="Actualiser"
              unelevated
              @click="loadStatistics"
              :loading="loading"
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
          :value="stats.budgetTotal"
          title="Budget Total"
          subtitle="Prévisions budgétaires"
          icon="account_balance_wallet"
          icon-color="grey-7"
          border-color="#E67E22"
          format="currency"
        />
      </div>

      <div class="col-12 col-sm-6 col-md-3">
        <StatisticsCard
          :value="stats.montantEngage"
          title="Montant Engagé"
          :subtitle="`${stats.tauxExecution}% du budget`"
          icon="receipt_long"
          icon-color="grey-7"
          border-color="#2E7D32"
          format="currency"
        />
      </div>

      <div class="col-12 col-sm-6 col-md-3">
        <StatisticsCard
          :value="stats.nombreMandats"
          title="Mandats"
          :subtitle="`${stats.mandatsEmis} émis / ${stats.mandatsPayes} payés`"
          icon="receipt"
          icon-color="grey-7"
          border-color="#E67E22"
        />
      </div>

      <div class="col-12 col-sm-6 col-md-3">
        <StatisticsCard
          :value="stats.montantDisponible"
          title="Budget Disponible"
          :subtitle="`${100 - stats.tauxExecution}% restant`"
          icon="savings"
          icon-color="grey-7"
          border-color="#2E7D32"
          format="currency"
        />
      </div>
    </div>

    <!-- Graphiques et analyses -->
    <div class="row q-col-gutter-md">
      <q-inner-loading :showing="loading">
        <q-spinner-gears size="50px" color="primary" />
      </q-inner-loading>

      <!-- Message si aucune donnée -->
      <div v-if="!loading && stats.budgetTotal === 0" class="col-12 text-center q-pa-xl">
        <q-icon name="bar_chart" size="64px" color="grey-5" />
        <div class="text-h6 text-grey-6 q-mt-md">Aucune donnée disponible</div>
        <div class="text-caption text-grey-5">
          Créez des prévisions budgétaires pour l'exercice {{ selectedExercice }}
        </div>
      </div>

      <!-- Graphique des dépenses par chapitre -->
      <div v-if="!loading && stats.budgetTotal > 0" class="col-12 col-md-6">
        <ChartCard
          title="Dépenses par Chapitre"
          :chart-config="depensesChartConfig"
          header-class="text-grey-8"
        />
      </div>

      <!-- Graphique d'exécution budgétaire -->
      <div v-if="!loading && stats.budgetTotal > 0" class="col-12 col-md-6">
        <ChartCard
          title="Exécution Budgétaire"
          :chart-config="executionChartConfig"
          header-class="text-grey-8"
        />
      </div>

      <!-- Graphique de l'évolution mensuelle -->
      <div v-if="!loading && stats.budgetTotal > 0" class="col-12">
        <ChartCard
          title="Évolution Mensuelle des Mandats"
          :chart-config="evolutionChartConfig"
          header-class="text-grey-8"
          container-class="chart-container-large"
        />
      </div>

      <!-- Tableau des prévisions vs réalisations -->
      <div v-if="!loading && stats.budgetTotal > 0" class="col-12">
        <q-card class="details-card">
          <q-card-section class="bg-grey-1">
            <div class="text-h6 text-grey-8">Prévisions vs Réalisations par Chapitre</div>
          </q-card-section>
          <q-card-section>
            <q-table
              :rows="previsionsStats"
              :columns="tableColumns"
              row-key="id"
              flat
              bordered
              :pagination="{ rowsPerPage: 10 }"
            >
              <template v-slot:body-cell-chapitre="props">
                <q-td :props="props">
                  <q-badge color="primary" :label="props.row.chapitre" />
                </q-td>
              </template>
              <template v-slot:body-cell-prevu="props">
                <q-td :props="props" class="text-weight-bold">
                  {{ props.row.prevu }}
                </q-td>
              </template>
              <template v-slot:body-cell-engage="props">
                <q-td :props="props" style="color: #e67e22" class="text-weight-bold">
                  {{ props.row.engage }}
                </q-td>
              </template>
              <template v-slot:body-cell-disponible="props">
                <q-td :props="props" style="color: #2e7d32" class="text-weight-bold">
                  {{ props.row.disponible }}
                </q-td>
              </template>
              <template v-slot:body-cell-taux="props">
                <q-td :props="props">
                  <div class="row items-center">
                    <div class="col-auto q-mr-md" style="min-width: 50px">
                      <span class="text-weight-bold">{{ props.row.taux }}%</span>
                    </div>
                    <div class="col">
                      <q-linear-progress
                        :value="props.row.taux / 100"
                        :color="getTauxColor(props.row.taux)"
                        size="8px"
                      />
                    </div>
                  </div>
                </q-td>
              </template>
            </q-table>
          </q-card-section>
        </q-card>
      </div>

      <!-- Statistiques par statut -->
      <div v-if="!loading && stats.budgetTotal > 0" class="col-12 col-md-6">
        <q-card class="activity-card">
          <q-card-section class="bg-grey-1">
            <div class="text-h6 text-grey-8">Répartition par Statut</div>
          </q-card-section>
          <q-card-section>
            <q-list separator>
              <q-item>
                <q-item-section avatar>
                  <q-avatar color="primary" text-color="white" icon="edit_note" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-bold">Brouillons</q-item-label>
                  <q-item-label caption>Mandats en préparation</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-item-label class="text-h6 text-grey-8">
                    {{ stats.mandatsBrouillon }}
                  </q-item-label>
                  <q-item-label caption>mandats</q-item-label>
                </q-item-section>
              </q-item>

              <q-item>
                <q-item-section avatar>
                  <q-avatar color="primary" text-color="white" icon="send" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-bold">Émis</q-item-label>
                  <q-item-label caption>Mandats émis</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-item-label class="text-h6" style="color: #e67e22">
                    {{ stats.mandatsEmis }}
                  </q-item-label>
                  <q-item-label caption>mandats</q-item-label>
                </q-item-section>
              </q-item>

              <q-item>
                <q-item-section avatar>
                  <q-avatar
                    style="background-color: #2e7d32"
                    text-color="white"
                    icon="check_circle"
                  />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-bold">Payés</q-item-label>
                  <q-item-label caption>Mandats payés</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-item-label class="text-h6" style="color: #2e7d32">
                    {{ stats.mandatsPayes }}
                  </q-item-label>
                  <q-item-label caption>mandats</q-item-label>
                </q-item-section>
              </q-item>

              <q-item>
                <q-item-section avatar>
                  <q-avatar color="negative" text-color="white" icon="cancel" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-bold">Annulés</q-item-label>
                  <q-item-label caption>Mandats annulés</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-item-label class="text-h6 text-grey-8">
                    {{ stats.mandatsAnnules }}
                  </q-item-label>
                  <q-item-label caption>mandats</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
      </div>

      <!-- Alertes et recommandations -->
      <div v-if="!loading && stats.budgetTotal > 0" class="col-12 col-md-6">
        <q-card class="alerts-card">
          <q-card-section class="bg-grey-1">
            <div class="text-h6 text-grey-8">Alertes Budgétaires</div>
          </q-card-section>
          <q-card-section>
            <q-list separator>
              <q-item v-for="(alerte, index) in alertes" :key="index">
                <q-item-section avatar>
                  <q-icon :name="alerte.icon" :color="alerte.color" size="md" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-medium">{{ alerte.titre }}</q-item-label>
                  <q-item-label caption class="text-grey-6">{{ alerte.description }}</q-item-label>
                </q-item-section>
              </q-item>
              <q-item v-if="alertes.length === 0">
                <q-item-section avatar>
                  <q-icon name="check_circle" style="color: #2e7d32" size="md" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-medium">Situation normale</q-item-label>
                  <q-item-label caption class="text-grey-6"
                    >Aucune alerte budgétaire à signaler</q-item-label
                  >
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
import type { Prevision, Mandat, Chapitre } from 'src/database/db';

const $q = useQuasar();

// État
const loading = ref(false);
const currentYear = new Date().getFullYear();
const selectedExercice = ref(currentYear);
const periodFilter = ref('annee');
const dateDebut = ref('');
const dateFin = ref('');

// Données brutes
const previsions = ref<Prevision[]>([]);
const mandats = ref<Mandat[]>([]);
const chapitres = ref<Chapitre[]>([]);

// Options
const exerciceOptions = ref<number[]>([currentYear - 1, currentYear, currentYear + 1]);

const periodOptions = [
  { label: "Aujourd'hui", value: 'jour' },
  { label: 'Cette semaine', value: 'semaine' },
  { label: 'Ce mois', value: 'mois' },
  { label: 'Ce trimestre', value: 'trimestre' },
  { label: 'Cette année', value: 'annee' },
  { label: 'Personnalisé', value: 'custom' },
];

// Statistiques calculées
const stats = computed(() => {
  const budgetTotal = previsions.value.reduce((sum, p) => sum + p.montantPrevu, 0);
  const montantEngage = previsions.value.reduce((sum, p) => sum + p.montantEngage, 0);
  const montantDisponible = previsions.value.reduce((sum, p) => sum + p.montantDisponible, 0);

  // Filtrer les mandats par période
  const mandatsFiltered = filterMandatsByPeriod(mandats.value);

  const nombreMandats = mandatsFiltered.length;
  const mandatsBrouillon = mandatsFiltered.filter((m) => m.statut === 'brouillon').length;
  const mandatsEmis = mandatsFiltered.filter((m) => m.statut === 'emis').length;
  const mandatsPayes = mandatsFiltered.filter((m) => m.statut === 'paye').length;
  const mandatsAnnules = mandatsFiltered.filter((m) => m.statut === 'annule').length;

  const tauxExecution = budgetTotal > 0 ? Math.round((montantEngage / budgetTotal) * 100) : 0;

  return {
    budgetTotal,
    montantEngage,
    montantDisponible,
    nombreMandats,
    mandatsBrouillon,
    mandatsEmis,
    mandatsPayes,
    mandatsAnnules,
    tauxExecution,
  };
});

// Détails par chapitre
const previsionsStats = computed(() => {
  return previsions.value.map((p) => {
    const chapitre = chapitres.value.find((c) => c.id === p.chapitreId);
    const taux = p.montantPrevu > 0 ? Math.round((p.montantEngage / p.montantPrevu) * 100) : 0;

    return {
      id: p.id!,
      chapitre: chapitre ? `${chapitre.code} - ${chapitre.libelle}` : 'N/A',
      prevu: formatMontant(p.montantPrevu),
      engage: formatMontant(p.montantEngage),
      disponible: formatMontant(p.montantDisponible),
      taux,
    };
  });
});

// Alertes budgétaires
const alertes = computed(() => {
  const alerts: Array<{ icon: string; color: string; titre: string; description: string }> = [];

  previsionsStats.value.forEach((stat) => {
    if (stat.taux >= 90) {
      alerts.push({
        icon: 'warning',
        color: 'negative',
        titre: `Budget critique - ${stat.chapitre}`,
        description: `${stat.taux}% du budget utilisé. Attention au dépassement.`,
      });
    } else if (stat.taux >= 75) {
      alerts.push({
        icon: 'info',
        color: 'warning',
        titre: `Budget élevé - ${stat.chapitre}`,
        description: `${stat.taux}% du budget utilisé. Surveiller l'évolution.`,
      });
    }
  });

  return alerts;
});

// Colonnes du tableau
const tableColumns = [
  {
    name: 'chapitre',
    label: 'Chapitre',
    align: 'left' as const,
    field: 'chapitre',
    sortable: true,
  },
  {
    name: 'prevu',
    label: 'Prévu',
    align: 'right' as const,
    field: 'prevu',
    sortable: true,
  },
  {
    name: 'engage',
    label: 'Engagé',
    align: 'right' as const,
    field: 'engage',
    sortable: true,
  },
  {
    name: 'disponible',
    label: 'Disponible',
    align: 'right' as const,
    field: 'disponible',
    sortable: true,
  },
  {
    name: 'taux',
    label: "Taux d'exécution",
    align: 'left' as const,
    field: 'taux',
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

function getTauxColor(taux: number): string {
  if (taux >= 90) return 'negative';
  if (taux >= 75) return 'warning';
  return 'positive';
}

function filterMandatsByPeriod(mandatsList: Mandat[]): Mandat[] {
  if (!dateDebut.value || !dateFin.value) return mandatsList;
  const start = new Date(dateDebut.value).getTime();
  const end = new Date(dateFin.value).getTime() + 86400000 - 1;
  return mandatsList.filter((m) => {
    const d = new Date(m.dateMandat).getTime();
    return d >= start && d <= end;
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
  periodFilter.value = 'annee';
  selectedExercice.value = currentYear;
  onPeriodChange();
}

// Chargement des statistiques
async function loadStatistics() {
  loading.value = true;
  try {
    const mairieId = 1;
    const exercice = selectedExercice.value;

    const [previsionsList, mandatsList, chapitresList] = await Promise.all([
      db.previsions
        .where('exercice')
        .equals(exercice)
        .and((p) => p.mairieId === mairieId)
        .toArray(),
      db.mandats
        .where('exercice')
        .equals(exercice)
        .and((m) => m.mairieId === mairieId)
        .toArray(),
      db.chapitres.filter((c) => c.actif && c.mairieId === mairieId).toArray(),
    ]);

    previsions.value = previsionsList;
    mandats.value = mandatsList;
    chapitres.value = chapitresList;
  } catch (error) {
    console.error('Erreur lors du chargement des statistiques:', error);
    $q.notify({
      type: 'negative',
      message: 'Erreur lors du chargement des statistiques',
    });
  } finally {
    loading.value = false;
  }
}

// Configuration des graphiques
const depensesChartConfig = computed<ChartConfiguration>(() => {
  const data = previsions.value.map((p) => {
    const chapitre = chapitres.value.find((c) => c.id === p.chapitreId);
    return {
      label: chapitre ? chapitre.code : 'N/A',
      value: p.montantEngage,
    };
  });

  return {
    type: 'doughnut',
    data: {
      labels: data.map((d) => d.label),
      datasets: [
        {
          label: 'Dépenses',
          data: data.map((d) => d.value),
          backgroundColor: [
            '#E67E22',
            '#2E7D32',
            '#42A5F5',
            '#AB47BC',
            '#FFA726',
            '#66BB6A',
            '#26C6DA',
            '#EF5350',
          ],
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
              return `${label}: ${formatMontant(value)}`;
            },
          },
        },
      },
    },
  };
});

const executionChartConfig = computed<ChartConfiguration>(() => {
  const data = previsions.value.map((p) => {
    const chapitre = chapitres.value.find((c) => c.id === p.chapitreId);
    return {
      label: chapitre ? chapitre.code : 'N/A',
      prevu: p.montantPrevu,
      engage: p.montantEngage,
      disponible: p.montantDisponible,
    };
  });

  return {
    type: 'bar',
    data: {
      labels: data.map((d) => d.label),
      datasets: [
        {
          label: 'Budget Prévu',
          data: data.map((d) => d.prevu),
          backgroundColor: '#6B7280',
        },
        {
          label: 'Montant Engagé',
          data: data.map((d) => d.engage),
          backgroundColor: '#E67E22',
        },
        {
          label: 'Disponible',
          data: data.map((d) => d.disponible),
          backgroundColor: '#2E7D32',
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
  const brouillonData = new Array(12).fill(0);
  const emisData = new Array(12).fill(0);
  const payeData = new Array(12).fill(0);

  mandats.value.forEach((m) => {
    const date = new Date(m.dateMandat);
    if (date.getFullYear() === selectedExercice.value) {
      const month = date.getMonth();
      if (month >= 0 && month < 12) {
        if (m.statut === 'brouillon') {
          const val = brouillonData[month];
          if (typeof val === 'number') {
            brouillonData[month] = val + m.montant;
          }
        } else if (m.statut === 'emis') {
          const val = emisData[month];
          if (typeof val === 'number') {
            emisData[month] = val + m.montant;
          }
        } else if (m.statut === 'paye') {
          const val = payeData[month];
          if (typeof val === 'number') {
            payeData[month] = val + m.montant;
          }
        }
      }
    }
  });

  return {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Brouillons',
          data: brouillonData,
          borderColor: '#6B7280',
          backgroundColor: 'rgba(107, 114, 128, 0.1)',
          tension: 0.4,
        },
        {
          label: 'Émis',
          data: emisData,
          borderColor: '#E67E22',
          backgroundColor: 'rgba(230, 126, 34, 0.1)',
          tension: 0.4,
        },
        {
          label: 'Payés',
          data: payeData,
          borderColor: '#2E7D32',
          backgroundColor: 'rgba(46, 125, 50, 0.1)',
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

// Lifecycle
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
.alerts-card {
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
