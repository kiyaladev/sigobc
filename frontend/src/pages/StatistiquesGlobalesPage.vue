<template>
  <q-page class="statistiques-page q-pa-md" data-visite="administration-statistiques-globales">
    <PageHeader
      title="Statistiques Globales"
      subtitle="Vue d'ensemble de l'exécution budgétaire"
      icon="analytics"
    >
      <template #stats>
        <div v-for="(stat, index) in heroStats" :key="index" class="col-12 col-sm-6 col-lg-3">
          <q-card flat class="listing-stat-card overview-stat-card">
            <q-card-section class="row items-center no-wrap">
              <div class="col">
                <div class="overview-stat-label">{{ stat.label }}</div>
                <div class="overview-stat-value">{{ stat.value }}</div>
                <div v-if="stat.helper" class="overview-stat-helper">{{ stat.helper }}</div>
              </div>
              <q-icon :name="stat.icon" size="30px" :color="stat.color" />
            </q-card-section>
          </q-card>
        </div>
      </template>
    </PageHeader>

    <!-- Filtres -->
    <q-card flat bordered class="listing-filter-card compact-toolbar q-mb-md">
      <q-card-section class="q-pa-md">
        <div class="listing-filter-title">
          <q-icon name="tune" size="18px" />
          <span>Filtres</span>
        </div>
        <div class="listing-filter-grid row q-col-gutter-sm items-end">
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
            <q-btn
              color="primary"
              icon="refresh"
              label="Actualiser"
              unelevated
              @click="loadStatistics"
              :loading="loading"
              class="full-width"
              no-caps
            />
          </div>
        </div>
      </q-card-section>
    </q-card>

    <div class="admin-section-heading q-mb-sm">
      <q-icon name="trending_down" color="orange" class="q-mr-sm" />
      Dépenses
    </div>
    <div class="row q-col-gutter-md q-mb-lg">
      <div
        v-for="(stat, index) in depensesCards"
        :key="`dep-${index}`"
        class="col-12 col-sm-6 col-md-3"
      >
        <q-card flat class="listing-stat-card overview-stat-card secondary-stat-card">
          <q-card-section class="row items-center no-wrap">
            <div class="col">
              <div class="overview-stat-label">{{ stat.label }}</div>
              <div class="overview-stat-value">{{ stat.value }}</div>
              <div v-if="stat.helper" class="overview-stat-helper">{{ stat.helper }}</div>
            </div>
            <q-icon :name="stat.icon" size="28px" :color="stat.color" />
          </q-card-section>
        </q-card>
      </div>
    </div>

    <div class="admin-section-heading q-mb-sm">
      <q-icon name="trending_up" color="positive" class="q-mr-sm" />
      Recettes
    </div>
    <div class="row q-col-gutter-md q-mb-lg">
      <div
        v-for="(stat, index) in recettesCards"
        :key="`rec-${index}`"
        class="col-12 col-sm-6 col-md-3"
      >
        <q-card flat class="listing-stat-card overview-stat-card secondary-stat-card">
          <q-card-section class="row items-center no-wrap">
            <div class="col">
              <div class="overview-stat-label">{{ stat.label }}</div>
              <div class="overview-stat-value">{{ stat.value }}</div>
              <div v-if="stat.helper" class="overview-stat-helper">{{ stat.helper }}</div>
            </div>
            <q-icon :name="stat.icon" size="28px" :color="stat.color" />
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Graphiques -->
    <div class="row q-col-gutter-md analytics-grid">
      <q-inner-loading :showing="loading">
        <q-spinner-gears size="50px" color="primary" />
      </q-inner-loading>

      <!-- Message si aucune donnée -->
      <div
        v-if="!loading && depensesStats.budgetTotal === 0 && recettesStats.totalDeclarations === 0"
        class="col-12"
      >
        <q-card class="analytics-empty-state">
          <q-card-section class="text-center q-pa-xl">
            <q-icon name="bar_chart" size="64px" color="grey-5" />
            <div class="text-h6 text-grey-6 q-mt-md">Aucune donnée disponible</div>
            <div class="text-caption text-grey-5">
              Créez des prévisions ou des déclarations pour voir les statistiques
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Comparaison Dépenses vs Recettes -->
      <div
        v-if="!loading && (depensesStats.budgetTotal > 0 || recettesStats.montantTotal > 0)"
        class="col-12 col-md-6"
      >
        <ChartCard
          class="analytics-card analytics-chart-card"
          title="Dépenses vs Recettes"
          :chart-config="comparaisonChartConfig"
          header-class="text-grey-8"
        />
      </div>

      <!-- Répartition des mandats par statut -->
      <div v-if="!loading && depensesStats.nombreMandats > 0" class="col-12 col-md-6">
        <ChartCard
          class="analytics-card analytics-chart-card"
          title="Statut des Mandats"
          :chart-config="mandatsStatutChartConfig"
          header-class="text-grey-8"
        />
      </div>

      <!-- Évolution mensuelle -->
      <div
        v-if="!loading && (depensesStats.budgetTotal > 0 || recettesStats.montantTotal > 0)"
        class="col-12"
      >
        <ChartCard
          class="analytics-card analytics-chart-card"
          title="Évolution Mensuelle (Dépenses vs Recettes)"
          :chart-config="evolutionChartConfig"
          header-class="text-grey-8"
          container-class="chart-container-large"
        />
      </div>

      <!-- Solde Budgétaire -->
      <div
        v-if="!loading && (depensesStats.budgetTotal > 0 || recettesStats.montantTotal > 0)"
        class="col-12 col-md-6"
      >
        <q-card class="analytics-card summary-card">
          <q-card-section class="bg-grey-1">
            <div class="text-h6 text-grey-8">Résumé Financier</div>
          </q-card-section>
          <q-card-section>
            <q-list separator>
              <q-item>
                <q-item-section avatar>
                  <q-avatar color="green" text-color="white" icon="trending_up" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-bold">Total Recettes</q-item-label>
                  <q-item-label caption>Montant encaissé</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-item-label class="text-h6" style="color: #4caf50">
                    {{ formatMontant(recettesStats.montantTotal) }}
                  </q-item-label>
                </q-item-section>
              </q-item>

              <q-item>
                <q-item-section avatar>
                  <q-avatar color="orange" text-color="white" icon="trending_down" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-bold">Total Dépenses</q-item-label>
                  <q-item-label caption>Montant engagé</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-item-label class="text-h6" style="color: #e67e22">
                    {{ formatMontant(depensesStats.montantEngage) }}
                  </q-item-label>
                </q-item-section>
              </q-item>

              <q-item>
                <q-item-section avatar>
                  <q-avatar :color="solde >= 0 ? 'positive' : 'negative'" text-color="white">
                    <q-icon :name="solde >= 0 ? 'arrow_upward' : 'arrow_downward'" />
                  </q-avatar>
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-bold">Solde</q-item-label>
                  <q-item-label caption>{{ solde >= 0 ? 'Excédent' : 'Déficit' }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-item-label
                    class="text-h6"
                    :style="`color: ${solde >= 0 ? '#4caf50' : '#f44336'}`"
                  >
                    {{ formatMontant(Math.abs(solde)) }}
                  </q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
      </div>

      <!-- Liens rapides -->
      <div class="col-12 col-md-6">
        <q-card class="analytics-card links-card">
          <q-card-section class="bg-grey-1">
            <div class="text-h6 text-grey-8">Accès Rapide</div>
          </q-card-section>
          <q-card-section>
            <q-list separator>
              <q-item clickable v-ripple to="/app3/statistiques">
                <q-item-section avatar>
                  <q-avatar color="orange" text-color="white" icon="analytics" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-bold">Statistiques Dépenses</q-item-label>
                  <q-item-label caption>Analyse détaillée des dépenses</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-icon name="chevron_right" color="grey" />
                </q-item-section>
              </q-item>

              <q-item clickable v-ripple to="/app6/statistiques">
                <q-item-section avatar>
                  <q-avatar color="green" text-color="white" icon="analytics" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-bold">Statistiques Recettes</q-item-label>
                  <q-item-label caption>Analyse détaillée des recettes</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-icon name="chevron_right" color="grey" />
                </q-item-section>
              </q-item>

              <q-item clickable v-ripple to="/app3/previsions">
                <q-item-section avatar>
                  <q-avatar color="primary" text-color="white" icon="pie_chart" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-bold">Prévisions</q-item-label>
                  <q-item-label caption>Gérer les prévisions budgétaires</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-icon name="chevron_right" color="grey" />
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
import ChartCard from 'src/components/ChartCard.vue';
import { db } from 'src/database/db';
import type {
  Prevision,
  Mandat,
  Declaration,
  BordereauRecette,
  MandatRecette,
  PrevisionRecette,
} from 'src/database/db';

const $q = useQuasar();

// État
const loading = ref(false);
const currentYear = new Date().getFullYear();
const selectedExercice = ref(currentYear); // Année en cours par défaut

// Données brutes
const previsions = ref<Prevision[]>([]);
const mandats = ref<Mandat[]>([]);
const declarations = ref<Declaration[]>([]);
const bordereaux = ref<BordereauRecette[]>([]);
const mandatsRecette = ref<MandatRecette[]>([]);
const previsionsRecettes = ref<PrevisionRecette[]>([]);

// Options
const exerciceOptions = ref<number[]>([currentYear - 2, currentYear - 1, currentYear]);

// Statistiques des dépenses - calculées dynamiquement depuis les mandats
const depensesStats = computed(() => {
  const budgetTotal = previsions.value.reduce((sum, p) => sum + p.montantPrevu, 0);

  // Calculer le montant engagé depuis les mandats réels (non annulés)
  const montantEngage = mandats.value
    .filter((m) => m.statut !== 'annule')
    .reduce((sum, m) => sum + m.montant, 0);
  const montantDisponible = Math.max(0, budgetTotal - montantEngage);

  const nombreMandats = mandats.value.length;
  const mandatsBrouillon = mandats.value.filter((m) => m.statut === 'brouillon').length;
  const mandatsPayes = mandats.value.filter((m) => m.statut === 'paye').length;
  const mandatsAnnules = mandats.value.filter((m) => m.statut === 'annule').length;

  const tauxExecution = budgetTotal > 0 ? Math.round((montantEngage / budgetTotal) * 100) : 0;

  return {
    budgetTotal,
    montantEngage,
    montantDisponible,
    nombreMandats,
    mandatsBrouillon,
    mandatsPayes,
    mandatsAnnules,
    tauxExecution,
  };
});

// Statistiques des recettes - incluant déclarations et mandats recettes
const recettesStats = computed(() => {
  const totalDeclarations = declarations.value.length;
  const declarationsValidees = declarations.value.filter((d) => d.statut === 'validee').length;
  const montantDeclarations = declarations.value.reduce(
    (sum, d) => sum + (d.montantRecette || d.montant || 0),
    0,
  );

  // Mandats de recettes (non annulés)
  const montantMandatsRecette = mandatsRecette.value
    .filter((m) => m.statut !== 'annule')
    .reduce((sum, m) => sum + m.montant, 0);

  // Montant total = déclarations + mandats recettes
  const montantTotal = montantDeclarations + montantMandatsRecette;

  // Prévisions recettes
  const budgetPrevuRecettes = previsionsRecettes.value.reduce((sum, p) => sum + p.montantPrevu, 0);

  const totalBordereaux = bordereaux.value.length;
  const bordereauxFermes = bordereaux.value.filter((b) => b.statut === 'ferme').length;

  const tauxValidation =
    totalDeclarations > 0 ? Math.round((declarationsValidees / totalDeclarations) * 100) : 0;

  return {
    totalDeclarations,
    declarationsValidees,
    montantTotal,
    montantDeclarations,
    montantMandatsRecette,
    budgetPrevuRecettes,
    totalBordereaux,
    bordereauxFermes,
    tauxValidation,
  };
});

// Solde
const solde = computed(() => recettesStats.value.montantTotal - depensesStats.value.montantEngage);

const heroStats = computed(() => [
  {
    label: 'Dépenses prévues',
    value: formatMontant(depensesStats.value.budgetTotal),
    helper: `Engagé : ${formatMontant(depensesStats.value.montantEngage)}`,
    icon: 'payments',
    color: 'secondary',
  },
  {
    label: 'Recettes encaissées',
    value: formatMontant(recettesStats.value.montantTotal),
    helper: `${recettesStats.value.totalDeclarations} déclaration(s)`,
    icon: 'account_balance_wallet',
    color: 'teal',
  },
  {
    label: 'Solde',
    value: formatMontant(Math.abs(solde.value)),
    helper: solde.value >= 0 ? 'Excédent budgétaire' : 'Déficit budgétaire',
    icon: 'balance',
    color: solde.value >= 0 ? 'positive' : 'negative',
  },
  {
    label: 'Exercice',
    value: selectedExercice.value,
    helper: `${depensesStats.value.nombreMandats} mandats • ${recettesStats.value.totalBordereaux} bordereaux`,
    icon: 'event',
    color: 'primary',
  },
]);

const depensesCards = computed(() => [
  {
    label: 'Budget prévu',
    value: formatMontant(depensesStats.value.budgetTotal),
    helper: 'Prévisions budgétaires',
    icon: 'account_balance_wallet',
    color: 'secondary',
  },
  {
    label: 'Montant engagé',
    value: formatMontant(depensesStats.value.montantEngage),
    helper: `${depensesStats.value.tauxExecution}% exécuté`,
    icon: 'receipt_long',
    color: 'teal',
  },
  {
    label: 'Mandats',
    value: depensesStats.value.nombreMandats,
    helper: `${depensesStats.value.mandatsPayes} payés`,
    icon: 'receipt',
    color: 'warning',
  },
  {
    label: 'Budget disponible',
    value: formatMontant(depensesStats.value.montantDisponible),
    helper: `${100 - depensesStats.value.tauxExecution}% restant`,
    icon: 'savings',
    color: 'positive',
  },
]);

const recettesCards = computed(() => [
  {
    label: 'Déclarations',
    value: recettesStats.value.totalDeclarations,
    helper: `${recettesStats.value.declarationsValidees} validées`,
    icon: 'description',
    color: 'primary',
  },
  {
    label: 'Montant total',
    value: formatMontant(recettesStats.value.montantTotal),
    helper: 'Recettes encaissées',
    icon: 'payments',
    color: 'teal',
  },
  {
    label: 'Bordereaux',
    value: recettesStats.value.totalBordereaux,
    helper: `${recettesStats.value.bordereauxFermes} fermés`,
    icon: 'receipt_long',
    color: 'purple',
  },
  {
    label: 'Taux validation',
    value: `${recettesStats.value.tauxValidation}%`,
    helper: 'Déclarations validées',
    icon: 'check_circle',
    color: 'positive',
  },
]);

// Fonctions utilitaires
function formatMontant(montant: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    minimumFractionDigits: 0,
  }).format(montant);
}

// Chargement des statistiques
async function loadStatistics() {
  loading.value = true;
  try {
    // Récupérer la première mairie disponible
    const mairie = await db.mairies.orderBy('id').first();
    const mairieId = mairie?.id || 1;
    const exercice = selectedExercice.value;

    const [
      previsionsList,
      mandatsList,
      declarationsList,
      bordereauxList,
      mandatsRecetteList,
      prevRecettesList,
    ] = await Promise.all([
      db.previsions
        .where('mairieId')
        .equals(mairieId)
        .filter((p) => p.exercice === exercice)
        .toArray(),
      db.mandats
        .where('mairieId')
        .equals(mairieId)
        .filter((m) => m.exercice === exercice)
        .toArray(),
      db.declarations
        .where('mairieId')
        .equals(mairieId)
        .filter((d) => d.exercice === exercice)
        .toArray(),
      db.bordereauxRecette
        .where('mairieId')
        .equals(mairieId)
        .filter((b) => b.annee === exercice)
        .toArray(),
      db.mandatsRecette
        .where('mairieId')
        .equals(mairieId)
        .filter((m) => m.exercice === exercice)
        .toArray(),
      db.previsionsRecettes
        .where('mairieId')
        .equals(mairieId)
        .filter((p) => p.exercice === exercice)
        .toArray(),
    ]);

    previsions.value = previsionsList;
    mandats.value = mandatsList;
    declarations.value = declarationsList;
    bordereaux.value = bordereauxList;
    mandatsRecette.value = mandatsRecetteList;
    previsionsRecettes.value = prevRecettesList;
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
const comparaisonChartConfig = computed<ChartConfiguration>(() => {
  return {
    type: 'bar',
    data: {
      labels: ['Recettes', 'Dépenses'],
      datasets: [
        {
          label: 'Montant',
          data: [recettesStats.value.montantTotal, depensesStats.value.montantEngage],
          backgroundColor: ['#4CAF50', '#E67E22'],
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
              return formatMontant(value);
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

const mandatsStatutChartConfig = computed<ChartConfiguration>(() => {
  return {
    type: 'doughnut',
    data: {
      labels: ['Brouillon', 'Payés', 'Annulés'],
      datasets: [
        {
          label: 'Mandats',
          data: [
            depensesStats.value.mandatsBrouillon,
            depensesStats.value.mandatsPayes,
            depensesStats.value.mandatsAnnules,
          ],
          backgroundColor: ['#9E9E9E', '#4CAF50', '#F44336'],
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: { position: 'bottom' },
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
  const depensesData = new Array(12).fill(0);
  const recettesData = new Array(12).fill(0);

  // Dépenses: mandats non annulés
  mandats.value
    .filter((m) => m.statut !== 'annule')
    .forEach((m) => {
      const date = new Date(m.dateMandat);
      if (date.getFullYear() === selectedExercice.value) {
        const month = date.getMonth();
        if (month >= 0 && month < 12) {
          depensesData[month] += m.montant;
        }
      }
    });

  // Recettes: déclarations validées
  declarations.value.forEach((d) => {
    if (d.dateEncaissement) {
      const date = new Date(d.dateEncaissement);
      if (date.getFullYear() === selectedExercice.value) {
        const month = date.getMonth();
        if (month >= 0 && month < 12) {
          recettesData[month] += d.montantRecette || d.montant || 0;
        }
      }
    }
  });

  // Recettes: mandats de recettes non annulés
  mandatsRecette.value
    .filter((m) => m.statut !== 'annule')
    .forEach((m) => {
      const date = new Date(m.dateMandat);
      if (date.getFullYear() === selectedExercice.value) {
        const month = date.getMonth();
        if (month >= 0 && month < 12) {
          recettesData[month] += m.montant;
        }
      }
    });

  return {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Recettes',
          data: recettesData,
          borderColor: '#4CAF50',
          backgroundColor: 'rgba(76, 175, 80, 0.1)',
          tension: 0.4,
          fill: true,
        },
        {
          label: 'Dépenses',
          data: depensesData,
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

// Lifecycle
onMounted(() => {
  void loadStatistics();
});
</script>

<style scoped lang="scss">
.statistiques-page {
  max-width: 1400px;
  margin: 0 auto;
}

.overview-stat-card {
  min-height: 112px;
}

.secondary-stat-card {
  min-height: 108px;
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

.compact-toolbar {
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 18px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(248, 250, 252, 0.92));
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.05);
}

.admin-section-heading {
  display: flex;
  align-items: center;
  color: #0f172a;
  font-size: 1.2rem;
  font-weight: 800;
}

.analytics-card,
.analytics-empty-state {
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 24px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.94));
  box-shadow: 0 18px 34px rgba(15, 23, 42, 0.08);
  overflow: hidden;
}

.analytics-card :deep(.q-card__section.bg-grey-1) {
  background: linear-gradient(180deg, rgba(248, 250, 252, 0.94), rgba(241, 245, 249, 0.86));
  border-bottom: 1px solid rgba(148, 163, 184, 0.16);
}

.analytics-card :deep(.q-list .q-item) {
  border-radius: 14px;
  margin: 6px 0;
  transition:
    background-color 0.2s ease,
    transform 0.2s ease;
}

.analytics-card :deep(.q-list .q-item:hover) {
  background: rgba(15, 23, 42, 0.04);
  transform: translateX(3px);
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
