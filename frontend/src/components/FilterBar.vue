<template>
  <q-expansion-item
    class="listing-filter-card q-mb-md compact-filter-card fade-in"
    icon="tune"
    label="Filtres"
    expand-separator
    dense
    default-opened
    switch-toggle-side
    header-class="listing-filter-header"
  >
    <q-card flat>
      <q-card-section class="q-pt-sm">
        <div class="listing-filter-grid row q-col-gutter-sm">
          <slot v-if="hasLegacyFilters" name="filters"></slot>

          <!-- Recherche -->
          <div v-if="!hasLegacyFilters && showSearch" :class="searchColClass">
            <q-input
              v-model="searchModel"
              outlined
              :placeholder="searchPlaceholder"
              dense
              clearable
            >
              <template v-slot:prepend>
                <q-icon name="search" />
              </template>
            </q-input>
          </div>

          <!-- Statut -->
          <div v-if="!hasLegacyFilters && showStatut" :class="filterColClass">
            <q-select
              v-model="statutModel"
              outlined
              dense
              :options="statutOptions"
              label="Statut"
              clearable
            />
          </div>

          <!-- Exercice -->
          <div v-if="!hasLegacyFilters && showExercice" :class="filterColClass">
            <q-input
              v-model.number="exerciceModel"
              outlined
              dense
              type="number"
              label="Exercice"
              clearable
            />
          </div>

          <!-- Taxe -->
          <div v-if="!hasLegacyFilters && showTaxe" :class="filterColClass">
            <q-select
              v-model="taxeModel"
              outlined
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
          <div v-if="!hasLegacyFilters && showDateRange" :class="filterColClass">
            <q-input
              v-model="dateDebutModel"
              outlined
              dense
              type="date"
              label="Date début"
              clearable
            />
          </div>

          <!-- Date fin -->
          <div v-if="!hasLegacyFilters && showDateRange" :class="filterColClass">
            <q-input v-model="dateFinModel" outlined dense type="date" label="Date fin" clearable />
          </div>

          <!-- Sélecteur de période -->
          <div v-if="!hasLegacyFilters && showPeriod" :class="filterColClass">
            <q-select
              v-model="periodModel"
              outlined
              dense
              :options="periodOptions"
              label="Période"
              @update:model-value="$emit('period-change')"
            />
          </div>

          <!-- Slot pour filtres personnalisés -->
          <slot v-if="!hasLegacyFilters" name="custom-filters"></slot>

          <!-- Bouton Réinitialiser -->
          <div v-if="hasResetListener" class="col-12 col-sm-auto">
            <q-btn
              outline
              color="grey-7"
              icon="restart_alt"
              label="Réinitialiser"
              @click="$emit('reset')"
              no-caps
              dense
              class="listing-reset-btn full-width"
            />
          </div>

          <!-- Bouton Actualiser (optionnel) -->
          <div v-if="!hasLegacyFilters && showRefresh" :class="filterColClass">
            <q-btn
              color="primary"
              icon="refresh"
              label="Actualiser"
              @click="$emit('refresh')"
              :loading="loading"
              no-caps
              dense
              class="full-width"
            />
          </div>
        </div>
      </q-card-section>
    </q-card>
  </q-expansion-item>
</template>

<script setup lang="ts">
import { computed, getCurrentInstance, useSlots } from 'vue';

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

const slots = useSlots();
const instance = getCurrentInstance();

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

const hasLegacyFilters = computed(() => !!slots.filters);
const hasResetListener = computed(() => typeof instance?.vnode.props?.onReset === 'function');

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

<style scoped lang="scss">
.compact-filter-card {
  border-radius: 18px;
  overflow: hidden;
}

.fade-in {
  animation: fadeIn 0.3s ease-out;
}

.listing-filter-header {
  min-height: 42px;
  padding: 0 14px;
}

:deep(.listing-filter-header .q-item__section--main) {
  font-size: 0.84rem;
  font-weight: 700;
  letter-spacing: 0.02em;
}

:deep(.compact-filter-card .q-expansion-item__content .q-card) {
  background: transparent;
}

:deep(.compact-filter-card .q-card__section) {
  padding-top: 10px;
  padding-bottom: 12px;
}

:deep(.compact-filter-card .q-field--dense .q-field__control) {
  min-height: 38px;
  height: 38px;
}

:deep(.compact-filter-card .q-field--dense .q-field__marginal) {
  height: 38px;
}

:deep(.compact-filter-card .q-btn) {
  min-height: 38px;
}

.listing-filter-header {
  min-height: 46px;
  padding: 0 14px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.55), rgba(248, 250, 252, 0.32));
}

:deep(.listing-filter-header .q-item__section--main) {
  font-size: 0.84rem;
  font-weight: 800;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

:deep(.compact-filter-card .q-expansion-item__toggle-icon) {
  color: #64748b;
}

:deep(.compact-filter-card .q-card__section) {
  padding-top: 12px;
  padding-bottom: 14px;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
