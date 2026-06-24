<template>
  <q-page class="statistiques-page q-pa-md">
    <PageHeader
      title="Statistiques des Dépenses"
      subtitle="Analyse et suivi de l'exécution budgétaire"
      icon="analytics"
    >
      <template #stats>
        <div
          v-for="(stat, index) in heroStats"
          :key="`hero-${index}`"
          class="col-12 col-sm-6 col-lg-3"
        >
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
    <div class="compact-toolbar q-mb-md">
      <div class="compact-toolbar-top row items-center q-col-gutter-sm">
        <div class="col-12 col-md-auto compact-toolbar-summary">
          <q-chip outline color="primary" icon="filter_alt" size="sm">
            {{ activeFiltersCount }} filtre{{ activeFiltersCount > 1 ? 's' : '' }}
          </q-chip>
        </div>
        <div class="col-12 col-md-auto compact-toolbar-actions">
          <q-btn dense outline color="grey-7" icon="tune" label="Filtres" no-caps>
            <q-menu class="compact-filter-menu" anchor="bottom right" self="top right">
              <div class="compact-filter-panel">
                <div class="compact-filter-panel-title">Filtres</div>
                <div class="row q-col-gutter-sm items-end">
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
                      emit-value
                      map-options
                      @update:model-value="onPeriodChange"
                    />
                  </div>
                  <div class="col-12 col-sm-6 col-md-3">
                    <q-input
                      v-model="dateDebut"
                      type="date"
                      label="Date début"
                      outlined
                      dense
                      clearable
                    />
                  </div>
                  <div class="col-12 col-sm-6 col-md-3">
                    <q-input
                      v-model="dateFin"
                      type="date"
                      label="Date fin"
                      outlined
                      dense
                      clearable
                    />
                  </div>
                  <div class="col-12 col-sm-6 col-md-3">
                    <q-btn
                      label="Réinitialiser"
                      icon="clear"
                      outline
                      color="grey-7"
                      @click="resetFilters"
                      class="full-width"
                      no-caps
                    />
                  </div>
                  <div class="col-12 col-sm-6 col-md-3">
                    <q-btn
                      label="Actualiser"
                      icon="refresh"
                      color="primary"
                      unelevated
                      @click="loadStatistics"
                      :loading="loading"
                      class="full-width"
                      no-caps
                    />
                  </div>
                </div>
              </div>
            </q-menu>
          </q-btn>
          <q-btn
            color="primary"
            icon="refresh"
            label="Actualiser"
            unelevated
            no-caps
            :loading="loading"
            @click="loadStatistics"
          />
        </div>
      </div>
    </div>

    <div class="row q-col-gutter-md q-mb-md">
      <div
        v-for="(stat, index) in secondaryStats"
        :key="`secondary-${index}`"
        class="col-12 col-sm-6 col-lg-3"
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

    <!-- Graphiques et analyses -->
    <div class="row q-col-gutter-md analytics-grid">
      <q-inner-loading :showing="loading">
        <q-spinner-gears size="50px" color="primary" />
      </q-inner-loading>

      <!-- Message si aucune donnée -->
      <div v-if="!loading && stats.budgetTotal === 0" class="col-12">
        <q-card class="analytics-empty-state">
          <q-card-section class="text-center q-pa-xl">
            <q-icon name="bar_chart" size="64px" color="grey-5" />
            <div class="text-h6 text-grey-6 q-mt-md">Aucune donnée disponible</div>
            <div class="text-caption text-grey-5">
              Créez des prévisions budgétaires pour l'exercice {{ selectedExercice }}
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Graphique des dépenses par chapitre -->
      <div v-if="!loading && stats.budgetTotal > 0" class="col-12 col-md-6">
        <ChartCard
          class="analytics-card analytics-chart-card"
          title="Dépenses par Chapitre"
          :chart-config="depensesChartConfig"
          header-class="text-grey-8"
        />
      </div>

      <!-- Graphique d'exécution budgétaire -->
      <div v-if="!loading && stats.budgetTotal > 0" class="col-12 col-md-6">
        <ChartCard
          class="analytics-card analytics-chart-card"
          title="Exécution Budgétaire"
          :chart-config="executionChartConfig"
          header-class="text-grey-8"
        />
      </div>

      <!-- Graphique de l'évolution mensuelle -->
      <div v-if="!loading && stats.budgetTotal > 0" class="col-12">
        <ChartCard
          class="analytics-card analytics-chart-card"
          title="Évolution Mensuelle des Mandats"
          :chart-config="evolutionChartConfig"
          header-class="text-grey-8"
          container-class="chart-container-large"
        />
      </div>

      <!-- Tableau des prévisions vs réalisations -->
      <div v-if="!loading && stats.budgetTotal > 0" class="col-12">
        <q-card class="analytics-card details-card">
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
                  <q-badge color="primary" text-color="white" :label="props.row.chapitre" />
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

      <!-- Résumé Bordereaux -->
      <div v-if="!loading && stats.budgetTotal > 0" class="col-12 col-md-6">
        <q-card class="analytics-card activity-card">
          <q-card-section class="bg-grey-1">
            <div class="text-h6 text-grey-8">Résumé des Bordereaux</div>
          </q-card-section>
          <q-card-section>
            <q-list separator>
              <q-item>
                <q-item-section avatar>
                  <q-avatar color="primary" text-color="white" icon="folder_open" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-bold">Total Bordereaux</q-item-label>
                  <q-item-label caption>Sur l'exercice {{ selectedExercice }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-item-label class="text-h6" style="color: #e67e22">
                    {{ stats.totalBordereaux }}
                  </q-item-label>
                </q-item-section>
              </q-item>

              <q-item>
                <q-item-section avatar>
                  <q-avatar style="background-color: #2e7d32" text-color="white" icon="lock" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-bold">Fermés</q-item-label>
                  <q-item-label caption>Bordereaux validés et transmis</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-item-label class="text-h6" style="color: #2e7d32">
                    {{ stats.bordereauxFermes }}
                  </q-item-label>
                </q-item-section>
              </q-item>

              <q-item>
                <q-item-section avatar>
                  <q-avatar color="warning" text-color="white" icon="lock_open" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-bold">Ouverts</q-item-label>
                  <q-item-label caption>Bordereaux en cours</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-item-label class="text-h6" style="color: #e67e22">
                    {{ stats.bordereauxOuverts }}
                  </q-item-label>
                </q-item-section>
              </q-item>

              <q-item>
                <q-item-section avatar>
                  <q-avatar style="background-color: #1a1a1a" text-color="white" icon="payments" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-bold">Montant Total</q-item-label>
                  <q-item-label caption>Somme des bordereaux</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-item-label class="text-h6" style="color: #1a1a1a">
                    {{ formatMontant(stats.montantTotalBordereaux) }}
                  </q-item-label>
                </q-item-section>
              </q-item>

              <q-item>
                <q-item-section avatar>
                  <q-avatar color="grey-7" text-color="white" icon="receipt" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-bold">Mandats Payés</q-item-label>
                  <q-item-label caption>Inclus dans les bordereaux</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-item-label class="text-h6 text-grey-8">
                    {{ stats.nombreMandats }}
                  </q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
      </div>

      <!-- Alertes et recommandations -->
      <div v-if="!loading && stats.budgetTotal > 0" class="col-12 col-md-6">
        <q-card class="analytics-card alerts-card">
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
import ChartCard from 'src/components/ChartCard.vue';
import { db } from 'src/database/db';
import type { Prevision, Mandat, Chapitre, BordereauMandat } from 'src/database/db';

const $q = useQuasar();

// État
const loading = ref(false);
const currentYear = new Date().getFullYear();
const selectedExercice = ref(currentYear); // Année en cours par défaut
const periodFilter = ref('annee');
const dateDebut = ref('');
const dateFin = ref('');

const activeFiltersCount = computed(() => {
  return [selectedExercice.value, periodFilter.value, dateDebut.value, dateFin.value].filter(
    (value) => value !== null && value !== '',
  ).length;
});

// Données brutes
const previsions = ref<Prevision[]>([]);
const mandats = ref<Mandat[]>([]);
const chapitres = ref<Chapitre[]>([]);
const bordereauMandats = ref<BordereauMandat[]>([]);

// Options
const exerciceOptions = ref<number[]>([currentYear - 2, currentYear - 1, currentYear]);

const periodOptions = [
  { label: "Aujourd'hui", value: 'jour' },
  { label: 'Cette semaine', value: 'semaine' },
  { label: 'Ce mois', value: 'mois' },
  { label: 'Ce trimestre', value: 'trimestre' },
  { label: 'Cette année', value: 'annee' },
  { label: 'Personnalisé', value: 'custom' },
];

// Statistiques calculées (uniquement mandats payés)
const stats = computed(() => {
  const budgetTotal = previsions.value.reduce((sum, p) => sum + p.montantPrevu, 0);

  // Filtrer les mandats par période - uniquement les payés
  const mandatsFiltered = filterMandatsByPeriod(mandats.value);
  const mandatsPayesList = mandatsFiltered.filter((m) => m.statut === 'paye');
  const montantEngage = mandatsPayesList.reduce((sum, m) => sum + m.montant, 0);
  const montantDisponible = Math.max(0, budgetTotal - montantEngage);

  const nombreMandats = mandatsPayesList.length;
  const mandatsPayes = mandatsPayesList.length;

  const tauxExecution = budgetTotal > 0 ? Math.round((montantEngage / budgetTotal) * 100) : 0;

  // Stats bordereaux
  const totalBordereaux = bordereauMandats.value.length;
  const bordereauxFermes = bordereauMandats.value.filter((b) => b.statut === 'ferme').length;
  const bordereauxOuverts = bordereauMandats.value.filter((b) => b.statut === 'ouvert').length;
  const montantTotalBordereaux = bordereauMandats.value.reduce((sum, b) => sum + b.montantTotal, 0);
  const nombreMandatsBordereaux = bordereauMandats.value.reduce(
    (sum, b) => sum + b.nombreMandats,
    0,
  );

  return {
    budgetTotal,
    montantEngage,
    montantDisponible,
    nombreMandats,
    mandatsPayes,
    tauxExecution,
    totalBordereaux,
    bordereauxFermes,
    bordereauxOuverts,
    montantTotalBordereaux,
    nombreMandatsBordereaux,
  };
});

const heroStats = computed(() => [
  {
    label: 'Budget total',
    value: formatMontant(stats.value.budgetTotal),
    helper: `${previsions.value.length} prévision${previsions.value.length > 1 ? 's' : ''} sur l'exercice`,
    icon: 'payments',
    color: 'secondary',
  },
  {
    label: 'Montant engagé',
    value: formatMontant(stats.value.montantEngage),
    helper: `Mandats payés : ${stats.value.mandatsPayes}`,
    icon: 'receipt_long',
    color: 'teal',
  },
  {
    label: 'Budget disponible',
    value: formatMontant(stats.value.montantDisponible),
    helper: `${Math.max(0, 100 - stats.value.tauxExecution)} % restant`,
    icon: 'savings',
    color: 'positive',
  },
  {
    label: "Taux d'exécution",
    value: `${stats.value.tauxExecution} %`,
    helper: `${stats.value.totalBordereaux} bordereau${stats.value.totalBordereaux > 1 ? 'x' : ''}`,
    icon: 'monitoring',
    color: 'primary',
  },
]);

const secondaryStats = computed(() => [
  {
    label: 'Mandats payés',
    value: stats.value.nombreMandats,
    helper: `Exercice ${selectedExercice.value}`,
    icon: 'task_alt',
    color: 'primary',
  },
  {
    label: 'Bordereaux',
    value: stats.value.totalBordereaux,
    helper: `${stats.value.bordereauxOuverts} ouverts`,
    icon: 'folder_open',
    color: 'secondary',
  },
  {
    label: 'Bordereaux fermés',
    value: stats.value.bordereauxFermes,
    helper: 'Validés et transmis',
    icon: 'lock',
    color: 'dark',
  },
  {
    label: 'Mandats / bordereau',
    value: stats.value.nombreMandatsBordereaux,
    helper: 'Répartition dans les bordereaux',
    icon: 'assignment',
    color: 'warning',
  },
]);

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

// Alertes budgétaires (toujours 5)
const alertes = computed(() => {
  const allAlerts: Array<{
    icon: string;
    color: string;
    titre: string;
    description: string;
    taux: number;
  }> = [];

  previsionsStats.value.forEach((stat) => {
    if (stat.taux >= 90) {
      allAlerts.push({
        icon: 'warning',
        color: 'negative',
        titre: `Budget critique - ${stat.chapitre}`,
        description: `${stat.taux}% du budget utilisé. Attention au dépassement.`,
        taux: stat.taux,
      });
    } else if (stat.taux >= 75) {
      allAlerts.push({
        icon: 'info',
        color: 'warning',
        titre: `Budget élevé - ${stat.chapitre}`,
        description: `${stat.taux}% du budget utilisé. Surveiller l'évolution.`,
        taux: stat.taux,
      });
    } else if (stat.taux >= 50) {
      allAlerts.push({
        icon: 'trending_up',
        color: 'primary',
        titre: `Budget modéré - ${stat.chapitre}`,
        description: `${stat.taux}% du budget utilisé. Exécution en cours.`,
        taux: stat.taux,
      });
    } else {
      allAlerts.push({
        icon: 'check_circle',
        color: 'positive',
        titre: `Budget normal - ${stat.chapitre}`,
        description: `${stat.taux}% du budget utilisé. Situation saine.`,
        taux: stat.taux,
      });
    }
  });

  // Trier par taux décroissant et prendre les 5 premières
  return allAlerts.sort((a, b) => b.taux - a.taux).slice(0, 5);
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

    const [previsionsList, mandatsList, chapitresList, bordereauMandatsList] = await Promise.all([
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
      db.chapitres
        .where('mairieId')
        .equals(mairieId)
        .filter((c) => c.actif)
        .toArray(),
      db.bordereauMandats
        .where('mairieId')
        .equals(mairieId)
        .filter((b) => b.exercice === exercice)
        .toArray(),
    ]);

    previsions.value = previsionsList;
    mandats.value = mandatsList;
    chapitres.value = chapitresList;
    bordereauMandats.value = bordereauMandatsList;
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
  // Top 5 chapitres par montant engagé
  const data = previsions.value
    .map((p) => {
      const chapitre = chapitres.value.find((c) => c.id === p.chapitreId);
      return {
        label: chapitre ? `Ch.${chapitre.code}` : 'N/A',
        fullLabel: chapitre ? `${chapitre.code} - ${chapitre.libelle}` : 'N/A',
        value: p.montantEngage,
      };
    })
    .filter((d) => d.value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  return {
    type: 'doughnut',
    data: {
      labels: data.map((d) => d.label),
      datasets: [
        {
          label: 'Dépenses',
          data: data.map((d) => d.value),
          backgroundColor: ['#E67E22', '#2E7D32', '#757575', '#f57c00', '#388e3c'],
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
              const idx = context.dataIndex;
              const fullLabel = data[idx]?.fullLabel || context.label || '';
              const value = context.parsed || 0;
              return `${fullLabel}: ${formatMontant(value)}`;
            },
          },
        },
      },
    },
  };
});

const executionChartConfig = computed<ChartConfiguration>(() => {
  // Top 5 chapitres par budget prévu, barres horizontales empilées
  const data = previsions.value
    .map((p) => {
      const chapitre = chapitres.value.find((c) => c.id === p.chapitreId);
      return {
        label: chapitre ? `Ch.${chapitre.code}` : 'N/A',
        engage: p.montantEngage,
        disponible: p.montantDisponible,
        taux: p.montantPrevu > 0 ? Math.round((p.montantEngage / p.montantPrevu) * 100) : 0,
      };
    })
    .filter((d) => d.engage > 0 || d.disponible > 0)
    .sort((a, b) => b.engage + b.disponible - (a.engage + a.disponible))
    .slice(0, 5);

  return {
    type: 'bar',
    data: {
      labels: data.map((d) => d.label),
      datasets: [
        {
          label: 'Engagé',
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
      indexAxis: 'y',
      plugins: {
        legend: { position: 'bottom' },
        tooltip: {
          callbacks: {
            label: function (context: TooltipItem<keyof ChartTypeRegistry>) {
              const label = context.dataset.label || '';
              const value = context.parsed.x || 0;
              const idx = context.dataIndex;
              const taux = data[idx]?.taux || 0;
              return `${label}: ${formatMontant(value)} (${taux}%)`;
            },
          },
        },
      },
      scales: {
        x: {
          stacked: true,
          beginAtZero: true,
          ticks: {
            callback: function (tickValue: string | number) {
              return formatMontant(Number(tickValue));
            },
          },
        },
        y: {
          stacked: true,
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
  const payeData = new Array(12).fill(0);

  // Uniquement les mandats payés
  mandats.value.forEach((m) => {
    if (m.statut !== 'paye') return;
    const date = new Date(m.dateMandat);
    if (date.getFullYear() === selectedExercice.value) {
      const month = date.getMonth();
      if (month >= 0 && month < 12) {
        const val = payeData[month];
        if (typeof val === 'number') {
          payeData[month] = val + m.montant;
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
          label: 'Mandats Payés',
          data: payeData,
          borderColor: '#2E7D32',
          backgroundColor: 'rgba(46, 125, 50, 0.1)',
          tension: 0.4,
          fill: true,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
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
.statistiques-page,
.dashboard-page {
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

.analytics-grid {
  position: relative;
}

.analytics-card,
.analytics-empty-state {
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 24px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.94));
  box-shadow: 0 18px 34px rgba(15, 23, 42, 0.08);
}

.analytics-card {
  overflow: hidden;
}

.analytics-card :deep(.q-card__section.bg-grey-1) {
  background: linear-gradient(180deg, rgba(248, 250, 252, 0.94), rgba(241, 245, 249, 0.86));
  border-bottom: 1px solid rgba(148, 163, 184, 0.16);
}

.analytics-card :deep(.q-card__section.bg-grey-1 .text-h6),
.analytics-chart-card :deep(.q-card__section:first-child .text-h6),
.analytics-card :deep(.text-h6) {
  color: #0f172a !important;
  font-size: 1.08rem;
  font-weight: 800;
}

.analytics-card :deep(.q-card__section + .q-card__section) {
  padding-top: 18px;
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

.analytics-card :deep(.q-table) {
  border-radius: 18px;
  overflow: hidden;
}

.analytics-card :deep(.q-table thead tr) {
  background: linear-gradient(180deg, #f8fafc 0%, #eef4f8 100%);
}

.analytics-card :deep(.q-table tbody tr:nth-child(even)) {
  background: rgba(248, 250, 252, 0.72);
}

.analytics-card :deep(.q-table tbody tr:hover) {
  background: rgba(197, 168, 77, 0.08);
}

.analytics-card :deep(.q-linear-progress) {
  border-radius: 999px;
  overflow: hidden;
}

.analytics-chart-card :deep(.q-card__section:first-child) {
  padding-bottom: 0;
}

.analytics-empty-state {
  overflow: hidden;
}

.chart-container {
  position: relative;
  height: 300px;
}

.chart-container-large {
  position: relative;
  height: 400px;
}

.compact-toolbar {
  margin-bottom: 14px;
  padding: 10px 12px;
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 18px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(248, 250, 252, 0.92));
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.05);
}

.compact-toolbar-top {
  gap: 10px 0;
}

.compact-toolbar-summary {
  display: flex;
  align-items: center;
}

.compact-toolbar-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

.compact-toolbar-actions :deep(.q-btn) {
  min-height: 36px;
  border-radius: 12px;
}

.compact-filter-panel {
  width: min(920px, 92vw);
  padding: 14px;
}

.compact-filter-panel-title {
  margin-bottom: 10px;
  color: #334155;
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
</style>
