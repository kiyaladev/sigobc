<template>
  <div class="q-pa-md" id="section3-print">
    <div class="row items-center justify-between q-mb-md">
      <div class="col">
        <div class="text-h6">
          <q-icon name="payments" color="secondary" class="q-mr-sm" />
          Section III - Timbres (BE + Versements)
        </div>
      </div>
      <div class="col-auto no-print">
        <q-btn color="primary" label="Imprimer" icon="print" @click="$emit('print')" flat dense />
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
              props.row.type === 'BE-S3' || props.row.type === 'Stock initial'
                ? 'info'
                : props.row.type === 'Versement'
                  ? 'negative'
                  : 'info'
            "
            :label="props.row.type"
          />
        </q-td>
      </template>



      <template v-slot:body-cell-approvisionnement="props">
        <q-td :props="props">
          <div v-if="props.row.approvisionnement" class="text-info text-weight-bold">
            {{ formatMontant(props.row.approvisionnement) }}
          </div>
        </q-td>
      </template>

      <template v-slot:body-cell-remise="props">
        <q-td :props="props">
          <div v-if="props.row.remise" class="text-positive text-weight-bold">
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
          <div class="text-primary text-weight-bold">
            {{ formatMontant(props.row.solde) }}
          </div>
        </q-td>
      </template>
    </q-table>
  </div>
</template>

<script setup lang="ts">
import type { SectionIIIEntry } from '../types';

const props = defineProps<{
  data: SectionIIIEntry[];
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

// const formatNumber = (num: number) => new Intl.NumberFormat('fr-FR').format(num);

const columns = (() => {
  const base = [
    { name: 'date', label: 'Date', field: 'date', align: 'left' as const, sortable: true },
    { name: 'type', label: 'Nature', field: 'type', align: 'center' as const, sortable: true },
  ];
  const priceCols = (props.quotites || []).map((q) => ({
    name: q.key,
    label: q.label,
    field: (row: SectionIIIEntry) => (row.detailsQuotites && row.detailsQuotites[q.key]) || 0,
    align: 'right' as const,
    sortable: true,
  }));
  const tail = [
    { name: 'approvisionnement', label: 'Approv°', field: 'approvisionnement', align: 'right' as const, sortable: true },
    { name: 'remise', label: 'Remise', field: 'remise', align: 'right' as const, sortable: true },
    { name: 'versement', label: 'Versement', field: 'versement', align: 'right' as const, sortable: true },
    { name: 'solde', label: 'Solde', field: 'solde', align: 'right' as const, sortable: true },
  ];
  return [...base, ...priceCols, ...tail];
})();
</script>

<style scoped lang="scss">
.sticky-header-table {
  /* height or max-height is important */
  max-height: 600px;

  :deep(.q-table__top),
  :deep(.q-table__bottom),
  :deep(thead tr:first-child th) {
    /* bg color is important for th; just specify one */
    background-color: #fff;
  }

  :deep(thead tr th) {
    position: sticky;
    z-index: 1;
  }

  :deep(thead tr:first-child th) {
    top: 0;
  }

  /* this is when the loading indicator appears */
  :deep(&.q-table--loading thead tr:last-child th) {
    /* height of all previous header rows */
    top: 48px;
  }
}
</style>
