<template>
  <div class="q-pa-md" id="timbre-section2-print">
    <div class="row items-center justify-between q-mb-md">
      <div class="col">
        <div class="text-h6">
          <q-icon name="swap_horiz" color="purple" class="q-mr-sm" />
          Section II - Remises & Versements
        </div>
      </div>
      <div class="col-auto no-print">
        <q-btn color="purple" label="Imprimer" icon="print" @click="$emit('print')" flat dense />
      </div>
    </div>

    <q-table
      :rows="data"
      :columns="columns"
      row-key="id"
      :rows-per-page-options="[10, 20, 50, 0]"
      :loading="loading"
      flat
      bordered
      class="sticky-header-table"
      :pagination="{ rowsPerPage: 20 }"
    >
      <template v-slot:body-cell-date="props">
        <q-td :props="props">
          {{ formatDate(props.row.date) }}
        </q-td>
      </template>

      <template v-slot:body-cell-type="props">
        <q-td :props="props">
          <q-badge
            :color="
              props.row.type === 'BE-S2'
                ? 'info'
                : props.row.type === 'Versement'
                  ? 'negative'
                  : 'purple'
            "
            :label="props.row.type"
          />
        </q-td>
      </template>

      <template v-slot:body-cell-remise="props">
        <q-td :props="props">
          <div v-if="props.row.remise" class="text-purple text-weight-bold">
            {{ formatMontant(props.row.remise) }}
          </div>
        </q-td>
      </template>

      <template v-slot:body-cell-versement="props">
        <q-td :props="props">
          <div v-if="props.row.versement" class="text-negative text-weight-bold">
            {{ formatMontant(props.row.versement) }}
          </div>
        </q-td>
      </template>

      <template v-slot:body-cell-solde="props">
        <q-td :props="props">
          <div class="text-purple text-weight-bold">
            {{ formatMontant(props.row.solde) }}
          </div>
        </q-td>
      </template>
    </q-table>
  </div>
</template>

<script setup lang="ts">
import type { SectionIIEntry } from '../types';

const props = defineProps<{
  data: SectionIIEntry[];
  loading: boolean;
  labels?: Record<number, string>;
  quotites?: { key: string; label: string; prix: number; code: string }[];
}>();

defineEmits<{
  (e: 'print'): void;
}>();

const formatDate = (date: Date | string) => {
  return new Date(date).toLocaleDateString('fr-FR');
};

const formatMontant = (montant: number) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    minimumFractionDigits: 0,
  }).format(montant);
};

const columns = (() => {
  const base = [
    { name: 'date', label: 'Date', field: 'date', align: 'left' as const, sortable: true },
    { name: 'type', label: 'Type', field: 'type', align: 'center' as const, sortable: true },
  ];
  const priceCols = (props.quotites || []).map((q) => ({
    name: q.key,
    label: q.label,
    field: (row: SectionIIEntry) => (row.detailsQuotites && row.detailsQuotites[q.key]) || 0,
    align: 'right' as const,
    sortable: true,
  }));
  const tail = [
    { name: 'remise', label: 'Remise', field: 'remise', align: 'right' as const, sortable: true },
    {
      name: 'versement',
      label: 'Versement',
      field: 'versement',
      align: 'right' as const,
      sortable: true,
    },
    { name: 'solde', label: 'Solde', field: 'solde', align: 'right' as const, sortable: true },
  ];
  return [...base, ...priceCols, ...tail];
})();
</script>

<style scoped lang="scss">
.sticky-header-table {
  max-height: 600px;

  :deep(.q-table__top),
  :deep(.q-table__bottom),
  :deep(thead tr:first-child th) {
    background-color: #fff;
    color: #000;
  }

  :deep(thead tr th) {
    position: sticky;
    z-index: 1;
  }

  :deep(thead tr:first-child th) {
    top: 0;
  }

  :deep(&.q-table--loading thead tr:last-child th) {
    top: 48px;
  }
}
</style>
