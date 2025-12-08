<template>
  <q-page class="statistiques-page q-pa-md">
    <PageHeader
      title="Statistiques des Investissements"
      subtitle="Analyse et suivi de l'exécution budgétaire des investissements"
      icon="analytics"
    />

    <!-- Filtres -->
    <q-card class="filter-card q-mb-md">
      <q-card-section>
        <div class="row q-col-gutter-md items-end">
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
          <div class="col-12 col-sm-6 col-md-3">
            <q-input v-model="dateDebut" type="date" label="Date début" outlined dense clearable />
          </div>
          <div class="col-12 col-sm-6 col-md-3">
            <q-input v-model="dateFin" type="date" label="Date fin" outlined dense clearable />
          </div>
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
              color="teal"
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
          subtitle="Prévisions d'investissement"
          icon="account_balance_wallet"
          icon-color="grey-7"
          border-color="#009688"
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
          border-color="#00796B"
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
          border-color="#26A69A"
        />
      </div>

      <div class="col-12 col-sm-6 col-md-3">
        <StatisticsCard
          :value="stats.montantDisponible"
          title="Budget Disponible"
          :subtitle="`${100 - stats.tauxExecution}% restant`"
          icon="savings"
          icon-color="grey-7"
          border-color="#4DB6AC"
          format="currency"
        />
      </div>
    </div>

    <!-- Graphiques et analyses -->
    <div class="row q-col-gutter-md">
      <q-inner-loading :showing="loading">
        <q-spinner-gears size="50px" color="teal" />
      </q-inner-loading>

      <!-- Message si aucune donnée -->
      <div v-if="!loading && stats.budgetTotal === 0" class="col-12 text-center q-pa-xl">
        <q-icon name="bar_chart" size="64px" color="grey-5" />
        <div class="text-h6 text-grey-6 q-mt-md">Aucune donnée disponible</div>
        <div class="text-caption text-grey-5">
          Créez des prévisions budgétaires pour l'exercice {{ selectedExercice }}
        </div>
      </div>

      <!-- Graphique des investissements par chapitre -->
      <div v-if="!loading && stats.budgetTotal > 0" class="col-12 col-md-6">
        <ChartCard
          title="Investissements par Chapitre"
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
          title="Évolution Mensuelle des Mandats d'Investissement"
          :chart-config="evolutionChartConfig"
          header-class="text-grey-8"
          container-class="chart-container-large"
        />
      </div>

      <!-- Tableau des prévisions vs réalisations -->
      <div v-if="!loading && stats.budgetTotal > 0" class="col-12">
        <q-card class="details-card">
          <q-card-section class="bg-teal-1">
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
                  <q-badge color="teal" :label="props.row.chapitre" />
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
          <q-card-section class="bg-teal-1">
            <div class="text-h6 text-grey-8">Répartition par Statut</div>
          </q-card-section>
          <q-card-section>
            <q-list separator>
              <q-item>
                <q-item-section avatar>
                  <q-avatar color="grey" text-color="white" icon="edit_note" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-bold">Brouillons</q-item-label>
                  <q-item-label caption>Mandats en préparation</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-item-label class="text-h6 text-grey-8">
                    {{ stats.mandatsBrouillon }}
                  </q-item-label>
                </q-item-section>
              </q-item>

              <q-item>
                <q-item-section avatar>
                  <q-avatar color="info" text-color="white" icon="send" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-bold">Émis</q-item-label>
                  <q-item-label caption>Mandats émis</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-item-label class="text-h6 text-info">
                    {{ stats.mandatsEmis }}
                  </q-item-label>
                </q-item-section>
              </q-item>

              <q-item>
                <q-item-section avatar>
                  <q-avatar color="positive" text-color="white" icon="check_circle" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-bold">Payés</q-item-label>
                  <q-item-label caption>Mandats payés</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-item-label class="text-h6 text-positive">
                    {{ stats.mandatsPayes }}
                  </q-item-label>
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
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
      </div>

      <!-- Alertes et recommandations -->
      <div v-if="!loading && stats.budgetTotal > 0" class="col-12 col-md-6">
        <q-card class="alerts-card">
          <q-card-section class="bg-teal-1">
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
                  <q-icon name="check_circle" color="positive" size="md" />
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
import { db, DEFAULT_MAIRIE_ID } from 'src/database/db';
import type {
  PrevisionInvestissement,
  MandatInvestissement,
  ChapitreInvestissement,
} from 'src/database/db';

const $q = useQuasar();

const loading = ref(false);
const currentYear = new Date().getFullYear();
const selectedExercice = ref(currentYear);
const periodFilter = ref('annee');
const dateDebut = ref('');
const dateFin = ref('');

const previsions = ref<PrevisionInvestissement[]>([]);
const mandats = ref<MandatInvestissement[]>([]);
const chapitres = ref<ChapitreInvestissement[]>([]);

const exerciceOptions = ref<number[]>([currentYear - 1, currentYear, currentYear + 1]);

const periodOptions = [
  { label: "Aujourd'hui", value: 'jour' },
  { label: 'Cette semaine', value: 'semaine' },
  { label: 'Ce mois', value: 'mois' },
  { label: 'Ce trimestre', value: 'trimestre' },
  { label: 'Cette année', value: 'annee' },
  { label: 'Personnalisé', value: 'custom' },
];

const stats = computed(() => {
  const budgetTotal = previsions.value.reduce((sum, p) => sum + p.montantPrevu, 0);
  const montantEngage = previsions.value.reduce((sum, p) => sum + p.montantEngage, 0);
  const montantDisponible = previsions.value.reduce((sum, p) => sum + p.montantDisponible, 0);

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

const previsionsStats = computed(() => {
  return previsions.value.map((p) => {
    const chapitre = chapitres.value.find((c) => c.id === p.chapitreInvestissementId);
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

const tableColumns = [
  { name: 'chapitre', label: 'Chapitre', align: 'left' as const, field: 'chapitre', sortable: true },
  { name: 'prevu', label: 'Prévu', align: 'right' as const, field: 'prevu', sortable: true },
  { name: 'engage', label: 'Engagé', align: 'right' as const, field: 'engage', sortable: true },
  { name: 'disponible', label: 'Disponible', align: 'right' as const, field: 'disponible', sortable: true },
  { name: 'taux', label: "Taux d'exécution", align: 'left' as const, field: 'taux', sortable: true },
];

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

function filterMandatsByPeriod(mandatsList: MandatInvestissement[]): MandatInvestissement[] {
  if (!dateDebut.value || !dateFin.value) return mandatsList;
  const start = new Date(dateDebut.value).getTime();
  const end = new Date(dateFin.value).getTime() + 86400000 - 1;
  return mandatsList.filter((m) => {
    const d = new Date(m.dateMandat).getTime();
    return d >= start && d <= end;
  });
}

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

async function loadStatistics() {
  loading.value = true;
  try {
    const exercice = selectedExercice.value;

    const [previsionsList, mandatsList, chapitresList] = await Promise.all([
      db.previsionsInvestissement
        .where('exercice')
        .equals(exercice)
        .and((p) => p.mairieId === DEFAULT_MAIRIE_ID)
        .toArray(),
      db.mandatsInvestissement
        .where('exercice')
        .equals(exercice)
        .and((m) => m.mairieId === DEFAULT_MAIRIE_ID)
        .toArray(),
      db.chapitresInvestissement.filter((c) => c.actif && c.mairieId === DEFAULT_MAIRIE_ID).toArray(),
    ]);

    previsions.value = previsionsList;
    mandats.value = mandatsList;
    chapitres.value = chapitresList;
  } catch (error) {
    console.error('Erreur lors du chargement des statistiques:', error);
    $q.notify({ type: 'negative', message: 'Erreur lors du chargement des statistiques' });
  } finally {
    loading.value = false;
  }
}

const depensesChartConfig = computed<ChartConfiguration>(() => {
  const data = previsions.value.map((p) => {
    const chapitre = chapitres.value.find((c) => c.id === p.chapitreInvestissementId);
    return { label: chapitre ? chapitre.code : 'N/A', value: p.montantEngage };
  });

  return {
    type: 'doughnut',
    data: {
      labels: data.map((d) => d.label),
      datasets: [
        {
          label: 'Investissements',
          data: data.map((d) => d.value),
          backgroundColor: ['#009688', '#00796B', '#4DB6AC', '#26A69A', '#80CBC4', '#B2DFDB', '#E0F2F1', '#00BCD4'],
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
    const chapitre = chapitres.value.find((c) => c.id === p.chapitreInvestissementId);
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
        { label: 'Budget Prévu', data: data.map((d) => d.prevu), backgroundColor: '#6B7280' },
        { label: 'Montant Engagé', data: data.map((d) => d.engage), backgroundColor: '#009688' },
        { label: 'Disponible', data: data.map((d) => d.disponible), backgroundColor: '#4DB6AC' },
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
  const labels = ['Janv', 'Févr', 'Mars', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sept', 'Oct', 'Nov', 'Déc'];
  const brouillonData = new Array(12).fill(0);
  const emisData = new Array(12).fill(0);
  const payeData = new Array(12).fill(0);

  mandats.value.forEach((m) => {
    const date = new Date(m.dateMandat);
    if (date.getFullYear() === selectedExercice.value) {
      const month = date.getMonth();
      if (month >= 0 && month < 12) {
        if (m.statut === 'brouillon') brouillonData[month] += m.montant;
        else if (m.statut === 'emis') emisData[month] += m.montant;
        else if (m.statut === 'paye') payeData[month] += m.montant;
      }
    }
  });

  return {
    type: 'line',
    data: {
      labels,
      datasets: [
        { label: 'Brouillons', data: brouillonData, borderColor: '#6B7280', backgroundColor: 'rgba(107, 114, 128, 0.1)', tension: 0.4 },
        { label: 'Émis', data: emisData, borderColor: '#009688', backgroundColor: 'rgba(0, 150, 136, 0.1)', tension: 0.4 },
        { label: 'Payés', data: payeData, borderColor: '#00796B', backgroundColor: 'rgba(0, 121, 107, 0.1)', tension: 0.4 },
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
}

.chart-container-large {
  height: 400px;
}
</style>
