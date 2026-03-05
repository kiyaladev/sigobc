<template>
  <q-card class="q-mb-md">
    <q-card-section>
      <div class="row q-col-gutter-md">
        <!-- Recherche -->
        <div v-if="showSearch" :class="searchColClass">
          <q-input v-model="searchModel" filled :placeholder="searchPlaceholder" dense clearable>
            <template v-slot:prepend>
              <q-icon name="search" />
            </template>
          </q-input>
        </div>

        <!-- Statut -->
        <div v-if="showStatut" :class="filterColClass">
          <q-select
            v-model="statutModel"
            filled
            dense
            :options="statutOptions"
            label="Statut"
            clearable
          />
        </div>

        <!-- Exercice -->
        <div v-if="showExercice" :class="filterColClass">
          <q-input
            v-model.number="exerciceModel"
            filled
            dense
            type="number"
            label="Exercice"
            clearable
          />
        </div>

        <!-- Taxe -->
        <div v-if="showTaxe" :class="filterColClass">
          <q-select
            v-model="taxeModel"
            filled
            dense
            :options="taxeOptions"
            option-value="value"
            option-label="label"
            emit-value
            map-options
            label="Taxe"
            clearable
          />
        </div>

        <!-- Date début -->
        <div v-if="showDateRange" :class="filterColClass">
          <q-input v-model="dateDebutModel" filled dense type="date" label="Date début" clearable />
        </div>

        <!-- Date fin -->
        <div v-if="showDateRange" :class="filterColClass">
          <q-input v-model="dateFinModel" filled dense type="date" label="Date fin" clearable />
        </div>

        <!-- Sélecteur de période -->
        <div v-if="showPeriod" :class="filterColClass">
          <q-select
            v-model="periodModel"
            filled
            dense
            :options="periodOptions"
            label="Période"
            @update:model-value="$emit('period-change')"
          />
        </div>

        <!-- Slot pour filtres personnalisés -->
        <slot name="custom-filters"></slot>

        <!-- Bouton Réinitialiser -->
        <div :class="filterColClass">
          <q-btn
            flat
            color="primary"
            icon="clear"
            label="Réinitialiser"
            @click="$emit('reset')"
            dense
          />
        </div>

        <!-- Bouton Actualiser (optionnel) -->
        <div v-if="showRefresh" :class="filterColClass">
          <q-btn
            color="primary"
            icon="refresh"
            label="Actualiser"
            @click="$emit('refresh')"
            :loading="loading"
            no-caps
            class="full-width"
          />
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  // Search
  search?: string;
  searchPlaceholder?: string;
  showSearch?: boolean;

  // Statut
  statut?: string;
  statutOptions?: string[];
  showStatut?: boolean;

  // Exercice
  exercice?: number | null;
  showExercice?: boolean;

  // Taxe
  taxe?: number | null;
  taxeOptions?: Array<{ label: string; value: number }>;
  showTaxe?: boolean;

  // Date Range
  dateDebut?: string;
  dateFin?: string;
  showDateRange?: boolean;

  // Period
  period?: string;
  periodOptions?: Array<{ label: string; value: string }>;
  showPeriod?: boolean;

  // Refresh button
  showRefresh?: boolean;
  loading?: boolean;

  // Responsive col classes
  searchColClass?: string;
  filterColClass?: string;
}

const props = withDefaults(defineProps<Props>(), {
  searchPlaceholder: 'Rechercher...',
  showSearch: true,
  showStatut: false,

  showExercice: false,
  showTaxe: false,
  showDateRange: false,
  showPeriod: false,
  showRefresh: false,
  loading: false,
  statutOptions: () => [],

  taxeOptions: () => [],
  periodOptions: () => [],
  searchColClass: 'col-12 col-sm-4 col-md-3',
  filterColClass: 'col-12 col-sm-4 col-md-3',
});

const emit = defineEmits([
  'update:search',
  'update:statut',

  'update:exercice',
  'update:taxe',
  'update:dateDebut',
  'update:dateFin',
  'update:period',
  'reset',
  'refresh',
  'period-change',
]);

const searchModel = computed({
  get: () => props.search,
  set: (value) => emit('update:search', value || ''),
});

const statutModel = computed({
  get: () => props.statut,
  set: (value) => emit('update:statut', value || ''),
});

const exerciceModel = computed({
  get: () => props.exercice,
  set: (value) => emit('update:exercice', value),
});

const taxeModel = computed({
  get: () => props.taxe,
  set: (value) => emit('update:taxe', value),
});

const dateDebutModel = computed({
  get: () => props.dateDebut,
  set: (value) => emit('update:dateDebut', value || ''),
});

const dateFinModel = computed({
  get: () => props.dateFin,
  set: (value) => emit('update:dateFin', value || ''),
});

const periodModel = computed({
  get: () => props.period,
  set: (value) => emit('update:period', value || ''),
});
</script>
