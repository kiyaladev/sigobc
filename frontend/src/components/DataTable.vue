<template>
  <q-card flat class="data-table-shell">
    <q-card-section v-if="showExportCsv" class="data-table-top q-pb-none">
      <div class="row justify-end">
        <q-btn
          dense
          outline
          color="primary"
          icon="download"
          label="Exporter CSV"
          @click="handleExportCsv"
          no-caps
          class="data-table-export compact-export-btn"
        />
      </div>
    </q-card-section>

    <q-table
      :rows="rows"
      :columns="columns"
      :row-key="rowKey"
      :loading="loading"
      :pagination="pagination"
      flat
      class="data-table"
      v-bind="$attrs"
    >
      <template v-for="(_, slot) in $slots" v-slot:[slot]="props">
        <slot :name="slot" v-bind="props"></slot>
      </template>

      <template v-if="showActions" v-slot:body-cell-actions="props">
        <q-td :props="props" class="no-print data-table-actions">
          <q-btn
            v-if="showView"
            flat
            round
            dense
            icon="visibility"
            color="grey-7"
            class="table-action-btn"
            @click="$emit('view', props.row)"
          >
            <q-tooltip>Voir</q-tooltip>
          </q-btn>
          <q-btn
            v-if="showPrint"
            flat
            round
            dense
            icon="print"
            color="grey-7"
            class="table-action-btn"
            :data-visite="dataVisitePrint"
            @click="$emit('print', props.row)"
          >
            <q-tooltip>Imprimer</q-tooltip>
          </q-btn>
          <q-btn
            v-if="showDownload"
            flat
            round
            dense
            icon="download"
            color="grey-7"
            class="table-action-btn"
            @click="$emit('download', props.row)"
          >
            <q-tooltip>Télécharger PDF</q-tooltip>
          </q-btn>
          <q-btn
            v-if="showEdit"
            flat
            round
            dense
            icon="edit"
            color="primary"
            class="table-action-btn"
            :data-visite="dataVisiteEdit"
            @click="$emit('edit', props.row)"
          >
            <q-tooltip>Modifier</q-tooltip>
          </q-btn>
          <q-btn
            v-if="showDelete"
            flat
            round
            dense
            icon="delete"
            color="negative"
            class="table-action-btn"
            @click="$emit('delete', props.row)"
          >
            <q-tooltip>Supprimer</q-tooltip>
          </q-btn>

          <slot v-if="showCustomActions" name="custom-actions" :row="props.row"></slot>
        </q-td>
      </template>
    </q-table>
  </q-card>
</template>

<script setup lang="ts" generic="T extends Record<string, unknown>">
import type { QTableColumn } from 'quasar';
import { exportToCsv } from 'src/utils/exportCsv';

interface Props {
  rows: T[];
  columns: QTableColumn[];
  rowKey?: string;
  loading?: boolean;
  pagination?: Record<string, number | string>;
  showActions?: boolean;
  showView?: boolean;
  showPrint?: boolean;
  showDownload?: boolean;
  showEdit?: boolean;
  showDelete?: boolean;
  showCustomActions?: boolean;
  showExportCsv?: boolean;
  exportFilename?: string;
  /** Ancres de la visite guidée, posées sur les boutons d'action correspondants. */
  dataVisiteEdit?: string;
  dataVisitePrint?: string;
}

const props = withDefaults(defineProps<Props>(), {
  rowKey: 'id',
  loading: false,
  pagination: () => ({ rowsPerPage: 10 }),
  showActions: true,
  showView: false,
  showPrint: false,
  showDownload: false,
  showEdit: true,
  showDelete: true,
  showCustomActions: false,
  showExportCsv: false,
  exportFilename: 'export',
});

defineEmits<{
  view: [row: T];
  print: [row: T];
  download: [row: T];
  edit: [row: T];
  delete: [row: T];
}>();

function handleExportCsv() {
  exportToCsv(props.rows, props.columns, props.exportFilename);
}

defineExpose({
  exportCsv: handleExportCsv,
});
</script>

<style scoped lang="scss">
.data-table-shell {
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 22px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.92), rgba(255, 255, 255, 0.98));
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.06);
  overflow: hidden;
}

.data-table-top {
  padding: 14px 14px 0;
}

.data-table-export {
  border-radius: 12px;
}

.compact-export-btn {
  min-height: 34px;
  padding: 6px 10px;
  font-size: 0.8rem;
}

.data-table {
  background: transparent;
}

.data-table-actions {
  white-space: nowrap;
}

.table-action-btn {
  margin: 0 2px;
}

:deep(.data-table .q-table__top),
:deep(.data-table .q-table__bottom) {
  padding: 14px 18px;
  background: rgba(255, 255, 255, 0.62);
}

:deep(.data-table .q-table thead tr),
:deep(.data-table thead tr) {
  background: linear-gradient(180deg, #f8fafc 0%, #eff4f8 100%);
}

:deep(.data-table th) {
  padding-top: 15px;
  padding-bottom: 15px;
  color: #334155;
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  border-bottom: 1px solid rgba(148, 163, 184, 0.22);
}

:deep(.data-table td) {
  padding-top: 14px;
  padding-bottom: 14px;
  border-color: rgba(226, 232, 240, 0.85);
}

:deep(.data-table tbody tr:nth-child(even)) {
  background: rgba(248, 250, 252, 0.8);
}

:deep(.data-table tbody tr:hover) {
  background: rgba(197, 168, 77, 0.08);
}

:deep(.data-table .q-table__middle) {
  border-radius: 18px;
}

:deep(.data-table .q-table__bottom .q-btn) {
  border-radius: 10px;
}

:deep(.data-table .q-table__bottom .q-field__control) {
  border-radius: 10px;
}

:deep(.data-table .q-table__bottom .q-select),
:deep(.data-table .q-table__bottom .q-field) {
  min-width: 72px;
}

@media (max-width: 768px) {
  .data-table-shell {
    border-radius: 18px;
  }

  :deep(.data-table th),
  :deep(.data-table td) {
    padding-left: 10px;
    padding-right: 10px;
  }
}
</style>
