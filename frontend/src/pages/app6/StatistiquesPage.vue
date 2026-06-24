<template>
  <q-page class="statistiques-page q-pa-md">
    <PageHeader
      title="Statistiques des Recettes"
      subtitle="Analyse et suivi des déclarations de recettes"
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

    <!-- Filtres de période -->
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
      <div v-if="!loading && stats.totalDeclarations === 0" class="col-12">
        <q-card class="analytics-empty-state">
          <q-card-section class="text-center q-pa-xl">
            <q-icon name="bar_chart" size="64px" color="grey-5" />
            <div class="text-h6 text-grey-6 q-mt-md">Aucune donnée disponible</div>
            <div class="text-caption text-grey-5">
              Créez des déclarations de recettes pour voir les statistiques
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Résumé des Bordereaux -->
      <div v-if="!loading && stats.totalDeclarations > 0" class="col-12 col-md-6">
        <q-card class="analytics-card activity-card">
          <q-card-section class="bg-grey-1">
            <div class="text-h6 text-grey-8">Résumé des Bordereaux</div>
          </q-card-section>
          <q-card-section>
            <q-list separator>
              <q-item>
                <q-item-section avatar>
                  <q-avatar color="orange-8" text-color="white" icon="folder_open" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-bold">Total Bordereaux</q-item-label>
                  <q-item-label caption>Sur l'exercice</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-item-label class="text-h6" style="color: #e67e22">{{
                    formatNumber(stats.totalBordereaux)
                  }}</q-item-label>
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section avatar>
                  <q-avatar color="positive" text-color="white" icon="lock" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-bold">Fermés</q-item-label>
                  <q-item-label caption>Bordereaux clôturés</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-item-label class="text-h6" style="color: #2e7d32">{{
                    formatNumber(stats.bordereauxFermes)
                  }}</q-item-label>
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
                  <q-item-label class="text-h6" style="color: #f57c00">{{
                    formatNumber(stats.bordereauxOuverts)
                  }}</q-item-label>
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section avatar>
                  <q-avatar color="green-8" text-color="white" icon="payments" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-bold">Montant Total</q-item-label>
                  <q-item-label caption>Cumulé des bordereaux</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-item-label class="text-h6" style="color: #2e7d32">{{
                    formatMontant(stats.montantTotalBordereaux)
                  }}</q-item-label>
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section avatar>
                  <q-avatar
                    style="background-color: #1a1a1a"
                    text-color="white"
                    icon="description"
                  />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-bold">Déclarations Incluses</q-item-label>
                  <q-item-label caption>Dans les bordereaux</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-item-label class="text-h6" style="color: #1a1a1a">{{
                    formatNumber(stats.nombreDeclBordereaux)
                  }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
      </div>

      <!-- Répartition par taxe -->
      <div v-if="!loading && stats.totalDeclarations > 0" class="col-12 col-md-6">
        <ChartCard
          class="analytics-card analytics-chart-card"
          title="Top 5 Taxes par Montant"
          :chart-config="taxeChartConfig"
          header-class="text-grey-8"
        />
      </div>

      <!-- Évolution mensuelle -->
      <div v-if="!loading && stats.totalDeclarations > 0" class="col-12">
        <ChartCard
          class="analytics-card analytics-chart-card"
          title="Évolution Mensuelle des Recettes"
          :chart-config="evolutionChartConfig"
          header-class="text-grey-8"
          container-class="chart-container-large"
        />
      </div>

      <!-- Tableau détaillé par taxe -->
      <div v-if="!loading && stats.totalDeclarations > 0" class="col-12">
        <q-card class="analytics-card details-card">
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
        <q-card class="analytics-card activity-card">
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
        <q-card class="analytics-card top-card">
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
import ChartCard from 'src/components/ChartCard.vue';
import { db } from 'src/database/db';
import type { Declaration, Taxe, BordereauRecette, MandatRecette } from 'src/database/db';

const $q = useQuasar();

// Refs
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

// Options d'exercice
const exerciceOptions = ref<number[]>([currentYear - 2, currentYear - 1, currentYear]);

// Données brutes de la base
const declarations = ref<Declaration[]>([]);
const taxes = ref<Taxe[]>([]);
const bordereaux = ref<BordereauRecette[]>([]);
const mandatsRecette = ref<MandatRecette[]>([]);

// Options de période
const periodOptions = [
  { label: "Aujourd'hui", value: 'jour' },
  { label: 'Cette semaine', value: 'semaine' },
  { label: 'Ce mois', value: 'mois' },
  { label: 'Ce trimestre', value: 'trimestre' },
  { label: 'Cette année', value: 'annee' },
  { label: 'Personnalisé', value: 'custom' },
];

// Déclarations filtrées par période (uniquement validées)
const filteredDeclarations = computed(() => {
  // Uniquement les déclarations validées
  let filtered = declarations.value.filter((d) => d.statut === 'validee');

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
  const declarationsValidees = decl.length; // Toutes sont validées désormais
  const montantTotal = decl.reduce((sum, d) => sum + (d.montantRecette || d.montant || 0), 0);

  // Inclure les mandats de recettes payés dans le montant total
  const mandatsPayes = mandatsRecette.value.filter((m) => m.statut === 'paye');
  const montantMandatsRecette = mandatsPayes.reduce((sum, m) => sum + m.montant, 0);
  const montantGlobal = montantTotal + montantMandatsRecette;

  const montantMoyen = totalDeclarations > 0 ? montantGlobal / totalDeclarations : 0;
  const tauxValidation = 100; // Toutes validées

  const totalBordereaux = bordereaux.value.length;
  const bordereauxFermes = bordereaux.value.filter((b) => b.statut === 'ferme').length;
  const bordereauxOuverts = bordereaux.value.filter((b) => b.statut === 'ouvert').length;
  const montantTotalBordereaux = bordereaux.value.reduce((sum, b) => sum + b.montantTotal, 0);
  const nombreDeclBordereaux = bordereaux.value.reduce((sum, b) => sum + b.nombreDeclarations, 0);

  const totalMandatsRecette = mandatsPayes.length;
  const mandatsRecettePayes = mandatsPayes.length;

  return {
    totalDeclarations,
    declarationsValidees,
    montantTotal: montantGlobal,
    montantMoyen,
    tauxValidation,
    totalBordereaux,
    bordereauxFermes,
    bordereauxOuverts,
    montantTotalBordereaux,
    nombreDeclBordereaux,
    nombreTaxes: taxes.value.length,
    totalMandatsRecette,
    mandatsRecettePayes,
    montantMandatsRecette,
  };
});

const heroStats = computed(() => [
  {
    label: 'Déclarations',
    value: stats.value.totalDeclarations,
    helper: `${stats.value.declarationsValidees} validées`,
    icon: 'dataset',
    color: 'primary',
  },
  {
    label: 'Montant encaissé',
    value: formatMontant(stats.value.montantTotal),
    helper: `${formatMontant(stats.value.montantMandatsRecette)} via mandats`,
    icon: 'payments',
    color: 'secondary',
  },
  {
    label: 'Bordereaux',
    value: stats.value.totalBordereaux,
    helper: `${stats.value.bordereauxFermes} fermés`,
    icon: 'receipt_long',
    color: 'teal',
  },
  {
    label: 'Mandats recette',
    value: stats.value.totalMandatsRecette,
    helper: formatMontant(stats.value.montantMandatsRecette),
    icon: 'monitoring',
    color: 'positive',
  },
]);

const secondaryStats = computed(() => [
  {
    label: 'Déclarations validées',
    value: stats.value.declarationsValidees,
    helper: 'Sur la période filtrée',
    icon: 'description',
    color: 'primary',
  },
  {
    label: 'Total bordereaux',
    value: stats.value.totalBordereaux,
    helper: `${stats.value.bordereauxOuverts} ouverts`,
    icon: 'folder_open',
    color: 'secondary',
  },
  {
    label: 'Montant bordereaux',
    value: formatMontant(stats.value.montantTotalBordereaux),
    helper: 'Total cumulé',
    icon: 'account_balance_wallet',
    color: 'teal',
  },
  {
    label: 'Décl. / bordereau',
    value: stats.value.nombreDeclBordereaux,
    helper: 'Déclarations dans les bordereaux',
    icon: 'list_alt',
    color: 'warning',
  },
]);

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

    const [decl, taxesList, bordereauxList, mandatsRecetteList] = await Promise.all([
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
      db.mandatsRecette
        .where('mairieId')
        .equals(mairieId)
        .filter((m) => m.exercice === exercice)
        .toArray(),
    ]);

    declarations.value = decl;
    taxes.value = taxesList;
    bordereaux.value = bordereauxList;
    mandatsRecette.value = mandatsRecetteList;
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

// Lifecycle hooks
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
