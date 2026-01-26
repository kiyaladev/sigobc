<template>
  <q-page class="statistiques-page q-pa-md">
    <PageHeader
      title="Statistiques Globales"
      subtitle="Vue d'ensemble de l'exécution budgétaire"
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

    <!-- Cartes de statistiques principales - Dépenses -->
    <div class="text-h6 text-grey-8 q-mb-sm">
      <q-icon name="trending_down" color="orange" class="q-mr-sm" />
      Dépenses
    </div>
    <div class="row q-col-gutter-md q-mb-lg">
      <div class="col-12 col-sm-6 col-md-3">
        <StatisticsCard
          :value="depensesStats.budgetTotal"
          title="Budget Prévu"
          subtitle="Prévisions budgétaires"
          icon="account_balance_wallet"
          icon-color="grey-7"
          border-color="#E67E22"
          format="currency"
        />
      </div>
      <div class="col-12 col-sm-6 col-md-3">
        <StatisticsCard
          :value="depensesStats.montantEngage"
          title="Montant Engagé"
          :subtitle="`${depensesStats.tauxExecution}% exécuté`"
          icon="receipt_long"
          icon-color="grey-7"
          border-color="#F39C12"
          format="currency"
        />
      </div>
      <div class="col-12 col-sm-6 col-md-3">
        <StatisticsCard
          :value="depensesStats.nombreMandats"
          title="Mandats"
          :subtitle="`${depensesStats.mandatsPayes} payés`"
          icon="receipt"
          icon-color="grey-7"
          border-color="#E74C3C"
        />
      </div>
      <div class="col-12 col-sm-6 col-md-3">
        <StatisticsCard
          :value="depensesStats.montantDisponible"
          title="Budget Disponible"
          :subtitle="`${100 - depensesStats.tauxExecution}% restant`"
          icon="savings"
          icon-color="grey-7"
          border-color="#2E7D32"
          format="currency"
        />
      </div>
    </div>

    <!-- Cartes de statistiques principales - Recettes -->
    <div class="text-h6 text-grey-8 q-mb-sm">
      <q-icon name="trending_up" color="green" class="q-mr-sm" />
      Recettes
    </div>
    <div class="row q-col-gutter-md q-mb-lg">
      <div class="col-12 col-sm-6 col-md-3">
        <StatisticsCard
          :value="recettesStats.totalDeclarations"
          title="Déclarations"
          :subtitle="`${recettesStats.declarationsValidees} validées`"
          icon="description"
          icon-color="grey-7"
          border-color="#2196F3"
        />
      </div>
      <div class="col-12 col-sm-6 col-md-3">
        <StatisticsCard
          :value="recettesStats.montantTotal"
          title="Montant Total"
          subtitle="Recettes encaissées"
          icon="payments"
          icon-color="grey-7"
          border-color="#4CAF50"
          format="currency"
        />
      </div>
      <div class="col-12 col-sm-6 col-md-3">
        <StatisticsCard
          :value="recettesStats.totalBordereaux"
          title="Bordereaux"
          :subtitle="`${recettesStats.bordereauxFermes} fermés`"
          icon="receipt_long"
          icon-color="grey-7"
          border-color="#9C27B0"
        />
      </div>
      <div class="col-12 col-sm-6 col-md-3">
        <StatisticsCard
          :value="recettesStats.tauxValidation"
          title="Taux Validation"
          subtitle="Déclarations validées"
          icon="check_circle"
          icon-color="grey-7"
          border-color="#00BCD4"
          suffix="%"
        />
      </div>
    </div>

    <!-- Graphiques -->
    <div class="row q-col-gutter-md">
      <q-inner-loading :showing="loading">
        <q-spinner-gears size="50px" color="primary" />
      </q-inner-loading>

      <!-- Message si aucune donnée -->
      <div
        v-if="!loading && depensesStats.budgetTotal === 0 && recettesStats.totalDeclarations === 0"
        class="col-12 text-center q-pa-xl"
      >
        <q-icon name="bar_chart" size="64px" color="grey-5" />
        <div class="text-h6 text-grey-6 q-mt-md">Aucune donnée disponible</div>
        <div class="text-caption text-grey-5">
          Créez des prévisions ou des déclarations pour voir les statistiques
        </div>
      </div>

      <!-- Comparaison Dépenses vs Recettes -->
      <div
        v-if="!loading && (depensesStats.budgetTotal > 0 || recettesStats.montantTotal > 0)"
        class="col-12 col-md-6"
      >
        <ChartCard
          title="Dépenses vs Recettes"
          :chart-config="comparaisonChartConfig"
          header-class="text-grey-8"
        />
      </div>

      <!-- Répartition des mandats par statut -->
      <div v-if="!loading && depensesStats.nombreMandats > 0" class="col-12 col-md-6">
        <ChartCard
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
        <q-card class="summary-card">
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
        <q-card class="links-card">
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
import StatisticsCard from 'src/components/StatisticsCard.vue';
import ChartCard from 'src/components/ChartCard.vue';
import { db } from 'src/database/db';
import type { Prevision, Mandat, Declaration, BordereauRecette } from 'src/database/db';

const $q = useQuasar();

// État
const loading = ref(false);
const currentYear = new Date().getFullYear();
const selectedExercice = ref(currentYear - 1); // Année précédente par défaut pour voir les données de test

// Données brutes
const previsions = ref<Prevision[]>([]);
const mandats = ref<Mandat[]>([]);
const declarations = ref<Declaration[]>([]);
const bordereaux = ref<BordereauRecette[]>([]);

// Options
const exerciceOptions = ref<number[]>([currentYear - 2, currentYear - 1, currentYear]);

// Statistiques des dépenses
const depensesStats = computed(() => {
  const budgetTotal = previsions.value.reduce((sum, p) => sum + p.montantPrevu, 0);
  const montantEngage = previsions.value.reduce((sum, p) => sum + p.montantEngage, 0);
  const montantDisponible = previsions.value.reduce((sum, p) => sum + p.montantDisponible, 0);

  const nombreMandats = mandats.value.length;
  const mandatsBrouillon = mandats.value.filter((m) => m.statut === 'brouillon').length;
  const mandatsEmis = mandats.value.filter((m) => m.statut === 'emis').length;
  const mandatsPayes = mandats.value.filter((m) => m.statut === 'paye').length;
  const mandatsAnnules = mandats.value.filter((m) => m.statut === 'annule').length;

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

// Statistiques des recettes
const recettesStats = computed(() => {
  const totalDeclarations = declarations.value.length;
  const declarationsValidees = declarations.value.filter((d) => d.statut === 'validee').length;
  const montantTotal = declarations.value.reduce(
    (sum, d) => sum + (d.montantRecette || d.montant || 0),
    0,
  );

  const totalBordereaux = bordereaux.value.length;
  const bordereauxFermes = bordereaux.value.filter((b) => b.statut === 'ferme').length;

  const tauxValidation =
    totalDeclarations > 0 ? Math.round((declarationsValidees / totalDeclarations) * 100) : 0;

  return {
    totalDeclarations,
    declarationsValidees,
    montantTotal,
    totalBordereaux,
    bordereauxFermes,
    tauxValidation,
  };
});

// Solde
const solde = computed(() => recettesStats.value.montantTotal - depensesStats.value.montantEngage);

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

    const [previsionsList, mandatsList, declarationsList, bordereauxList] = await Promise.all([
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
    ]);

    previsions.value = previsionsList;
    mandats.value = mandatsList;
    declarations.value = declarationsList;
    bordereaux.value = bordereauxList;
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
      labels: ['Brouillon', 'Émis', 'Payés', 'Annulés'],
      datasets: [
        {
          label: 'Mandats',
          data: [
            depensesStats.value.mandatsBrouillon,
            depensesStats.value.mandatsEmis,
            depensesStats.value.mandatsPayes,
            depensesStats.value.mandatsAnnules,
          ],
          backgroundColor: ['#9E9E9E', '#E67E22', '#4CAF50', '#F44336'],
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

  mandats.value.forEach((m) => {
    const date = new Date(m.dateMandat);
    if (date.getFullYear() === selectedExercice.value) {
      const month = date.getMonth();
      if (month >= 0 && month < 12) {
        depensesData[month] += m.montant;
      }
    }
  });

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

.filter-card,
.summary-card,
.links-card {
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
