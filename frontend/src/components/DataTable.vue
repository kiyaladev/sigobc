<template>
  <q-card flat class="q-pa-sm">
    <q-card-section v-if="showExportCsv" class="q-pb-none">
      <div class="row justify-end">
        <q-btn
          flat
          color="primary"
          icon="download"
          label="Exporter CSV"
          @click="handleExportCsv"
          no-caps
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
      v-bind="$attrs"
    >
      <!-- Forward all custom column slots -->
      <template v-for="(_, slot) in $slots" v-slot:[slot]="props">
        <slot :name="slot" v-bind="props"></slot>
      </template>

      <!-- Actions column with standard actions -->
      <template v-if="showActions" v-slot:body-cell-actions="props">
        <q-td :props="props" class="no-print">
          <q-btn
            v-if="showView"
            flat
            round
            dense
            icon="visibility"
            color="grey-7"
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
            color="grey-7"
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
            @click="$emit('delete', props.row)"
          >
            <q-tooltip>Supprimer</q-tooltip>
          </q-btn>

          <!-- Slot pour actions personnalisées -->
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
</script>
