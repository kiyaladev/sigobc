from pathlib import Path
import re
root = Path(r'C:\Users\Coumbassa Stephane\Documents\GitHub\declarapp\frontend\src')

# 1) PageHeader.vue
(root / 'components' / 'PageHeader.vue').write_text('''<template>
  <q-card class="page-header-card" :class="{ 'with-actions': hasActions }">
    <q-card-section class="page-header-content q-pa-lg">
      <div class="page-header-top row items-start justify-between q-col-gutter-lg">
        <div class="col page-header-copy">
          <div class="breadcrumbs q-mb-sm" v-if="breadcrumbs && breadcrumbs.length > 0">
            <q-breadcrumbs active-color="primary">
              <q-breadcrumbs-el
                v-for="(crumb, index) in breadcrumbs"
                :key="index"
                :label="crumb.label"
                :to="crumb.to"
                :icon="crumb.icon"
              />
            </q-breadcrumbs>
          </div>

          <h1 class="page-title" :class="{ 'gradient-text': gradient }">
            <span v-if="icon" class="page-title-icon">
              <q-icon :name="icon" size="30px" />
            </span>
            <span>{{ title }}</span>
          </h1>

          <p v-if="subtitle" class="page-subtitle text-grey-7">
            {{ subtitle }}
          </p>
        </div>

        <div class="col-auto page-actions" v-if="hasActions">
          <slot name="actions"></slot>
        </div>
      </div>

      <div v-if="hasStats" class="page-header-stats row q-col-gutter-md q-mt-lg">
        <slot name="stats"></slot>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { useSlots, computed } from 'vue';

interface Breadcrumb {
  label: string;
  to?: string;
  icon?: string;
}

interface Props {
  title: string;
  subtitle?: string;
  icon?: string;
  breadcrumbs?: Breadcrumb[];
  gradient?: boolean;
}

withDefaults(defineProps<Props>(), {
  gradient: false,
});

const slots = useSlots();
const hasActions = computed(() => !!slots.actions);
const hasStats = computed(() => !!slots.stats);
</script>

<style scoped lang="scss">
.page-header-card {
  position: relative;
  margin-bottom: 24px;
  border-radius: 24px;
  overflow: hidden;
  border: 1px solid rgba(27, 94, 59, 0.1);
  background:
    radial-gradient(circle at top right, rgba(197, 168, 77, 0.18), transparent 32%),
    linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.96) 100%);
  box-shadow: 0 22px 48px rgba(15, 23, 42, 0.08);

  &::before,
  &::after {
    content: '';
    position: absolute;
    border-radius: 999px;
    pointer-events: none;
    filter: blur(6px);
  }

  &::before {
    top: -80px;
    right: -40px;
    width: 220px;
    height: 220px;
    background: radial-gradient(circle, rgba(197, 168, 77, 0.18), transparent 70%);
  }

  &::after {
    left: -60px;
    bottom: -80px;
    width: 180px;
    height: 180px;
    background: radial-gradient(circle, rgba(27, 94, 59, 0.12), transparent 70%);
  }
}

.page-header-content {
  position: relative;
  z-index: 1;
}

.page-header-top {
  gap: 20px 0;
}

.page-header-copy {
  min-width: 0;
}

.breadcrumbs :deep(.q-breadcrumbs__el),
.breadcrumbs :deep(.q-breadcrumbs__el .q-icon) {
  color: #64748b;
}

.page-title {
  display: flex;
  align-items: center;
  gap: 14px;
  margin: 0;
  font-size: clamp(1.75rem, 3vw, 2.35rem);
  font-weight: 800;
  line-height: 1.1;
  color: #0f172a;
}

.page-title-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: 18px;
  background: linear-gradient(135deg, rgba(27, 94, 59, 0.12), rgba(197, 168, 77, 0.18));
  color: var(--q-primary);
  box-shadow: inset 0 0 0 1px rgba(27, 94, 59, 0.1);
}

.gradient-text {
  background: linear-gradient(135deg, #1b5e3b 0%, #c5a84d 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.page-subtitle {
  max-width: 760px;
  margin: 12px 0 0;
  font-size: 1rem;
  line-height: 1.6;
}

.page-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.page-actions :deep(.q-btn) {
  min-height: 42px;
}

.page-header-stats {
  position: relative;
  z-index: 1;
}

@media (max-width: 900px) {
  .page-title-icon {
    width: 48px;
    height: 48px;
    border-radius: 15px;
  }
}

@media (max-width: 768px) {
  .page-header-card {
    border-radius: 20px;
  }

  .page-title {
    gap: 10px;
  }

  .page-actions {
    width: 100%;
    justify-content: flex-start;
  }
}
</style>
''', encoding='utf-8')

# 2) DataTable.vue
(root / 'components' / 'DataTable.vue').write_text('''<template>
  <q-card flat class="data-table-shell">
    <q-card-section v-if="showExportCsv" class="data-table-top q-pb-none">
      <div class="row justify-end">
        <q-btn
          unelevated
          color="primary"
          icon="download"
          label="Exporter CSV"
          @click="handleExportCsv"
          no-caps
          class="data-table-export"
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

<style scoped lang="scss">
.data-table-shell {
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 22px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.92), rgba(255, 255, 255, 0.98));
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.06);
}

.data-table-top {
  padding: 14px 14px 0;
}

.data-table-export {
  border-radius: 12px;
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
''', encoding='utf-8')

# 3) app.scss
(root / 'css' / 'app.scss').write_text('''// Variables personnalisées - Interface modernisée
:root {
  --transition-speed: 0.22s;
  --transition-smooth: cubic-bezier(0.4, 0, 0.2, 1);
  --radius-sm: 10px;
  --radius-md: 14px;
  --radius-lg: 22px;
  --shadow-sm: 0 10px 24px rgba(15, 23, 42, 0.05);
  --shadow-md: 0 18px 40px rgba(15, 23, 42, 0.08);
  --shadow-lg: 0 24px 56px rgba(15, 23, 42, 0.12);
  --surface-0: #f4f7fb;
  --surface-1: rgba(255, 255, 255, 0.92);
  --surface-2: #ffffff;
  --surface-border: rgba(148, 163, 184, 0.18);
  --text-soft: #64748b;
}

.q-col-gutter-x-md,
.q-col-gutter-md {
  margin-left: 0;
}

html,
body,
#q-app {
  background:
    radial-gradient(circle at top left, rgba(197, 168, 77, 0.14), transparent 24%),
    linear-gradient(180deg, #f8fafc 0%, #edf2f7 100%);
}

* {
  box-sizing: border-box;
}

body {
  color: #0f172a;
}

.q-page {
  width: 100%;
  max-width: 1440px;
  margin: 0 auto;
  animation: fadeIn 0.35s var(--transition-smooth);
}

.q-card {
  border-radius: var(--radius-lg);
  border: 1px solid var(--surface-border);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.94), rgba(255, 255, 255, 0.98));
  box-shadow: var(--shadow-sm);
  overflow: hidden;
  transition:
    transform var(--transition-speed) var(--transition-smooth),
    box-shadow var(--transition-speed) var(--transition-smooth),
    border-color var(--transition-speed) var(--transition-smooth);

  &:hover {
    box-shadow: var(--shadow-md);
  }
}

.q-btn {
  border-radius: 12px;
  font-weight: 700;
  letter-spacing: 0.01em;
  text-transform: none;
  transition:
    transform var(--transition-speed) var(--transition-smooth),
    box-shadow var(--transition-speed) var(--transition-smooth),
    opacity var(--transition-speed) var(--transition-smooth);

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 10px 24px rgba(15, 23, 42, 0.12);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }
}

.q-field {
  margin-bottom: 0;

  .q-field__control {
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.9);
  }

  &.q-field--outlined .q-field__control::before {
    border-color: rgba(148, 163, 184, 0.35);
  }

  &:focus-within .q-field__control {
    box-shadow: 0 0 0 4px rgba(27, 94, 59, 0.08);
  }
}

.fade-in {
  animation: fadeIn 0.3s ease-in-out;
}

.listing-filter-card,
.filter-card,
.listing-filter-row,
.listing-toolbar {
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 18px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.95), rgba(248, 250, 252, 0.92));
  box-shadow: var(--shadow-sm);
}

.listing-filter-grid,
.listing-filter-row,
.listing-toolbar {
  align-items: center;
}

.listing-filter-row,
.listing-toolbar {
  padding: 12px 14px;
}

.listing-filter-row::before {
  content: 'Filtres';
  display: inline-flex;
  align-items: center;
  align-self: stretch;
  padding: 0 16px 0 2px;
  margin-right: 4px;
  border-right: 1px solid rgba(148, 163, 184, 0.18);
  color: #334155;
  font-size: 0.76rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.listing-filter-row.q-mb-md,
.listing-toolbar.q-mb-md {
  margin-bottom: 14px;
}

.listing-toolbar {
  gap: 14px 16px;
}

.listing-search {
  min-width: min(100%, 360px);
}

.listing-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 10px;
}

.listing-filter-row .q-field,
.listing-toolbar .q-field,
.listing-filter-card .q-field {
  margin-bottom: 0;
}

.listing-filter-row .q-field--dense .q-field__control,
.listing-toolbar .q-field--dense .q-field__control,
.listing-filter-card .q-field--dense .q-field__control {
  min-height: 42px;
  height: 42px;
}

.listing-filter-row .q-field--dense .q-field__marginal,
.listing-toolbar .q-field--dense .q-field__marginal,
.listing-filter-card .q-field--dense .q-field__marginal {
  height: 42px;
}

.listing-filter-row .q-field--dense .q-field__label,
.listing-toolbar .q-field--dense .q-field__label,
.listing-filter-card .q-field--dense .q-field__label {
  top: 11px;
  font-size: 0.8rem;
}

.listing-filter-row .q-field--dense.q-field--float .q-field__label,
.listing-toolbar .q-field--dense.q-field--float .q-field__label,
.listing-filter-card .q-field--dense.q-field--float .q-field__label {
  transform: translateY(-44%) scale(0.75);
}

.listing-filter-row .q-field__native,
.listing-filter-row .q-field__input,
.listing-toolbar .q-field__native,
.listing-toolbar .q-field__input,
.listing-filter-card .q-field__native,
.listing-filter-card .q-field__input {
  font-size: 0.92rem;
}

.listing-filter-row .q-btn,
.listing-toolbar .q-btn,
.listing-filter-card .q-btn {
  min-height: 42px;
  padding: 8px 14px;
}

.listing-stats-row {
  margin-top: 4px;
}

.listing-stat-card {
  height: 100%;
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 18px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.86), rgba(248, 250, 252, 0.96));
  box-shadow: 0 14px 28px rgba(15, 23, 42, 0.06);
}

.listing-stat-card .q-card__section,
.listing-stat-card .stat-card-content {
  padding: 14px 16px;
}

.listing-stat-card .text-h6,
.listing-stat-card .stat-value {
  font-size: 1.3rem;
  line-height: 1.15;
}

.listing-stat-card .text-caption,
.listing-stat-card .stat-label {
  font-size: 0.78rem;
  line-height: 1.35;
  color: var(--text-soft);
}

.q-table {
  border-radius: 18px;
  overflow: hidden;

  thead tr {
    background: linear-gradient(180deg, #f8fafc 0%, #eef4f8 100%);
    color: #1e293b;
  }

  th {
    font-size: 0.78rem;
    font-weight: 800;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  tbody tr {
    transition: background-color var(--transition-speed) var(--transition-smooth);

    &:nth-child(even) {
      background: rgba(248, 250, 252, 0.74);
    }

    &:hover {
      background: rgba(197, 168, 77, 0.08);
    }
  }
}

.q-chip,
.q-badge {
  border-radius: 999px;
  font-weight: 700;
}

.q-list .q-item {
  border-radius: 12px;
  margin: 4px 0;
  transition:
    background-color var(--transition-speed) var(--transition-smooth),
    transform var(--transition-speed) var(--transition-smooth);

  &:hover {
    background-color: rgba(15, 23, 42, 0.04);
    transform: translateX(3px);
  }
}

.q-dialog__backdrop {
  backdrop-filter: blur(8px);
}

.q-dialog .q-card {
  animation: scaleIn 0.24s var(--transition-smooth);
}

.q-dialog .q-card-section {
  padding-left: 24px;
  padding-right: 24px;
}

::-webkit-scrollbar {
  width: 10px;
  height: 10px;
}

::-webkit-scrollbar-track {
  background: rgba(226, 232, 240, 0.9);
}

::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, rgba(27, 94, 59, 0.42), rgba(197, 168, 77, 0.55));
  border-radius: 999px;
}

::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, rgba(27, 94, 59, 0.56), rgba(197, 168, 77, 0.7));
}

.glass-effect {
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(14px);
  border: 1px solid rgba(255, 255, 255, 0.18);
}

.gradient-text {
  background: linear-gradient(135deg, $primary 0%, $secondary 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.text-shadow {
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.08);
}

*:focus-visible {
  outline: 2px solid rgba(27, 94, 59, 0.6);
  outline-offset: 2px;
}

html {
  scroll-behavior: smooth;
}

html.theme-transitioning * {
  transition:
    background-color 0.3s ease,
    color 0.3s ease,
    border-color 0.3s ease !important;
}

body.body--dark {
  background:
    radial-gradient(circle at top left, rgba(197, 168, 77, 0.12), transparent 24%),
    linear-gradient(180deg, #0f172a 0%, #111827 100%);

  .modern-header {
    background: rgba(15, 23, 42, 0.88);
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  }

  .modern-drawer,
  .modern-page-container {
    background: linear-gradient(180deg, #0f172a 0%, #111827 100%);
  }

  .q-card,
  .listing-filter-card,
  .filter-card,
  .listing-filter-row,
  .listing-toolbar,
  .data-table-shell,
  .page-header-card {
    background: linear-gradient(180deg, rgba(17, 24, 39, 0.92), rgba(15, 23, 42, 0.96));
    border-color: rgba(255, 255, 255, 0.1);
    color: #e5e7eb;
  }

  .q-field .q-field__control {
    background: rgba(15, 23, 42, 0.68);
  }

  .listing-filter-row::before,
  .listing-filter-title,
  .page-subtitle,
  .listing-stat-card .text-caption,
  .listing-stat-card .stat-label {
    color: #cbd5e1;
  }

  .q-table {
    thead tr {
      background: linear-gradient(180deg, #111827 0%, #1f2937 100%);
    }

    tbody tr:nth-child(even) {
      background: rgba(255, 255, 255, 0.02);
    }

    tbody tr:hover {
      background: rgba(197, 168, 77, 0.12);
    }
  }

  .q-list .q-item:hover,
  .nav-item:hover,
  .accordion-header:hover,
  .menu-item:hover {
    background-color: rgba(255, 255, 255, 0.06);
  }

  ::-webkit-scrollbar-track {
    background: rgba(30, 41, 59, 0.9);
  }

  ::-webkit-scrollbar-thumb {
    background: linear-gradient(180deg, rgba(197, 168, 77, 0.45), rgba(27, 94, 59, 0.55));
  }
}

.accent-left {
  border-left: 3px solid $primary;
}

.accent-bottom {
  border-bottom: 2px solid $primary;
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

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.97);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@media (max-width: 1024px) {
  .q-page {
    max-width: 100%;
  }
}

@media (max-width: 768px) {
  .listing-filter-row,
  .listing-toolbar {
    padding: 12px;
  }

  .listing-actions {
    justify-content: flex-start;
  }
}

@media (max-width: 600px) {
  .q-card {
    border-radius: 18px;
  }

  .listing-filter-row::before {
    flex: 0 0 100%;
    padding: 0 0 8px;
    margin: 0 0 8px;
    border-right: 0;
    border-bottom: 1px solid rgba(148, 163, 184, 0.18);
  }
}

@media print {
  .print-hide {
    display: none !important;
  }

  .q-page {
    max-width: 100%;
    animation: none;
  }

  .q-card,
  .data-table-shell,
  .page-header-card {
    box-shadow: none !important;
    border: 1px solid #d5dbe3;
    background: #fff !important;
  }
}
''', encoding='utf-8')

# 4) MainLayout style
mainlayout = root / 'layouts' / 'MainLayout.vue'
text = mainlayout.read_text(encoding='utf-8')
text = re.sub(r'<style scoped lang="scss">[\s\S]*?</style>', '''<style scoped lang="scss">
.modern-header {
  background: rgba(255, 255, 255, 0.88);
  backdrop-filter: blur(18px);
  border-bottom: 1px solid rgba(148, 163, 184, 0.18);
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.05);
}

:deep(.modern-header .q-toolbar) {
  min-height: 72px;
  padding-left: 16px;
  padding-right: 16px;
}

.menu-btn,
.user-menu-btn {
  border-radius: 14px;
}

.menu-btn:hover {
  transform: rotate(90deg);
}

.modern-drawer {
  background:
    radial-gradient(circle at top left, rgba(197, 168, 77, 0.14), transparent 24%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.98) 100%);
  border-right: 1px solid rgba(148, 163, 184, 0.14);
  box-shadow: 12px 0 32px rgba(15, 23, 42, 0.05);
}

.drawer-header {
  background: transparent;
  border-bottom: 1px solid rgba(148, 163, 184, 0.16);
}

.logo-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 72px;
  height: 72px;
  padding: 10px;
  border-radius: 20px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.96), rgba(248, 250, 252, 0.92));
  border: 1px solid rgba(148, 163, 184, 0.14);
  box-shadow: 0 14px 24px rgba(15, 23, 42, 0.08);
}

.logo-sidebar {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.nav-item {
  position: relative;
  min-height: 46px;
  margin: 5px 8px;
  border-radius: 14px;
  transition: all 0.22s ease;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 8px;
    bottom: 8px;
    width: 3px;
    border-radius: 999px;
    background: linear-gradient(180deg, $primary 0%, $secondary 100%);
    transform: scaleY(0);
    transition: transform 0.22s ease;
  }

  &:hover {
    background: rgba(15, 23, 42, 0.05);
    transform: translateX(4px);

    &::before {
      transform: scaleY(1);
    }
  }

  .q-icon {
    transition: transform 0.22s ease;
  }

  &:hover .q-icon {
    transform: scale(1.08);
  }
}

.nav-item-active {
  background: linear-gradient(90deg, rgba(27, 94, 59, 0.12), rgba(197, 168, 77, 0.12));
  box-shadow: inset 0 0 0 1px rgba(27, 94, 59, 0.1);
  font-weight: 700;

  &::before {
    transform: scaleY(1);
  }

  .q-item-label,
  .q-icon {
    color: $primary;
  }
}

.accordion-section {
  border-radius: 16px;
  overflow: hidden;

  :deep(.q-expansion-item__content) {
    padding-left: 6px;
  }
}

.accordion-header {
  border-radius: 14px;
  padding: 10px 12px;

  &:hover {
    background: rgba(15, 23, 42, 0.04);
  }
}

.modern-menu {
  border-radius: 18px;
  border: 1px solid rgba(148, 163, 184, 0.14);
  box-shadow: 0 24px 44px rgba(15, 23, 42, 0.14);
  overflow: hidden;
}

.user-info-item {
  background: linear-gradient(135deg, rgba(27, 94, 59, 0.1), rgba(197, 168, 77, 0.12));
  border-radius: 12px;
}

.menu-item {
  border-radius: 10px;
  margin: 2px 0;

  &:hover {
    background: rgba(15, 23, 42, 0.05);
    transform: translateX(4px);
  }
}

.logout-item:hover {
  background: rgba(239, 68, 68, 0.1);
}

.modern-page-container {
  min-height: 100vh;
  padding: 28px;
  background:
    radial-gradient(circle at top right, rgba(197, 168, 77, 0.15), transparent 24%),
    radial-gradient(circle at bottom left, rgba(27, 94, 59, 0.08), transparent 18%),
    linear-gradient(180deg, #f6f9fc 0%, #eaf0f6 100%);
}

.animated {
  animation-duration: 0.3s;
  animation-fill-mode: both;
}

.fadeIn {
  animation-name: fadeIn;
}

.fadeOut {
  animation-name: fadeOut;
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

@keyframes fadeOut {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
    transform: translateY(-8px);
  }
}

@media (max-width: 1024px) {
  .modern-page-container {
    padding: 18px;
  }
}

@media (max-width: 600px) {
  .modern-page-container {
    padding: 12px;
  }

  :deep(.modern-header .q-toolbar) {
    min-height: 64px;
  }

  .demo-mode-active {
    .modern-header {
      margin-top: 80px;
    }

    .q-drawer {
      top: 80px !important;
    }
  }
}
</style>''', text, count=1)
mainlayout.write_text(text, encoding='utf-8')

# 5) app3 PrevisionPage.vue
app3 = root / 'pages' / 'app3' / 'PrevisionPage.vue'
text = app3.read_text(encoding='utf-8')
text = text.replace('''    <PageHeader
      title="Prévisions Budgétaires"
      subtitle="Gestion des prévisions de dépenses"
      icon="pie_chart"
    />''', '''    <PageHeader
      title="Prévisions Budgétaires"
      subtitle="Gestion des prévisions de dépenses"
      icon="pie_chart"
    >
      <template #stats>
        <div class="col-12 col-sm-6 col-lg-3">
          <q-card flat class="listing-stat-card overview-stat-card">
            <q-card-section class="row items-center no-wrap">
              <div class="col">
                <div class="overview-stat-label">Prévisions visibles</div>
                <div class="overview-stat-value">{{ filteredPrevisions.length }}</div>
              </div>
              <q-icon name="dataset" size="30px" color="primary" />
            </q-card-section>
          </q-card>
        </div>
        <div class="col-12 col-sm-6 col-lg-3">
          <q-card flat class="listing-stat-card overview-stat-card">
            <q-card-section class="row items-center no-wrap">
              <div class="col">
                <div class="overview-stat-label">Montant prévu</div>
                <div class="overview-stat-value">{{ formatMontant(totalPrevu) }}</div>
              </div>
              <q-icon name="payments" size="30px" color="secondary" />
            </q-card-section>
          </q-card>
        </div>
        <div class="col-12 col-sm-6 col-lg-3">
          <q-card flat class="listing-stat-card overview-stat-card">
            <q-card-section class="row items-center no-wrap">
              <div class="col">
                <div class="overview-stat-label">Montant engagé</div>
                <div class="overview-stat-value">{{ formatMontant(totalEngage) }}</div>
              </div>
              <q-icon name="receipt_long" size="30px" color="teal" />
            </q-card-section>
          </q-card>
        </div>
        <div class="col-12 col-sm-6 col-lg-3">
          <q-card flat class="listing-stat-card overview-stat-card">
            <q-card-section class="row items-center no-wrap">
              <div class="col">
                <div class="overview-stat-label">Taux d\'exécution</div>
                <div class="overview-stat-value">{{ tauxExecution.toFixed(1) }} %</div>
              </div>
              <q-icon name="monitoring" size="30px" color="positive" />
            </q-card-section>
          </q-card>
        </div>
      </template>
    </PageHeader>''')
text = text.replace('''const filteredPrevisions = computed(() => {
  let result = previsions.value;

  // Filtre par exercice
  if (filterExercice.value) {
    result = result.filter((p) => p.exercice === filterExercice.value);
  }

  // Filtre par chapitre
  if (filterChapitreId.value) {
    result = result.filter((p) => p.chapitreId === filterChapitreId.value);
  }

  // Filtre par sous-chapitre
  if (filterSousChapitreId.value) {
    result = result.filter(
      (p) => 'sousChapitreId' in p && p.sousChapitreId === filterSousChapitreId.value,
    );
  }

  // Filtre par texte
  if (filter.value) {
    const searchTerm = filter.value.toLowerCase();
    result = result.filter((p) => p.exercice.toString().includes(searchTerm));
  }

  return result;
});''', '''const filteredPrevisions = computed(() => {
  let result = previsions.value;

  if (filterExercice.value) {
    result = result.filter((p) => p.exercice === filterExercice.value);
  }

  if (filterChapitreId.value) {
    result = result.filter((p) => p.chapitreId === filterChapitreId.value);
  }

  if (filterSousChapitreId.value) {
    result = result.filter(
      (p) => 'sousChapitreId' in p && p.sousChapitreId === filterSousChapitreId.value,
    );
  }

  if (filter.value) {
    const searchTerm = filter.value.toLowerCase();
    result = result.filter((p) => {
      const chapitre = chapitres.value.find((c) => c.id === p.chapitreId);
      const sousChapitre = sousChapitres.value.find((s) => s.id === p.sousChapitreId);
      return [
        p.exercice.toString(),
        chapitre?.code,
        chapitre?.libelle,
        sousChapitre?.code,
        sousChapitre?.libelle,
        p.typeBien,
        p.statut,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(searchTerm));
    });
  }

  return result;
});

const totalPrevu = computed(() =>
  filteredPrevisions.value.reduce((sum, p) => sum + (p.montantPrevu || 0), 0),
);

const totalEngage = computed(() =>
  filteredPrevisions.value.reduce((sum, p) => sum + (p.montantEngage || 0), 0),
);

const totalDisponible = computed(() =>
  filteredPrevisions.value.reduce((sum, p) => sum + (p.montantDisponible || 0), 0),
);

const tauxExecution = computed(() =>
  totalPrevu.value > 0 ? (totalEngage.value / totalPrevu.value) * 100 : 0,
);''')
text = text.replace('''<style scoped lang="scss">
.prevision-page {
  max-width: 1400px;
  margin: 0 auto;
}

.main-card {
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}
</style>''', '''<style scoped lang="scss">
.prevision-page {
  max-width: 1400px;
  margin: 0 auto;
}

.main-card {
  border-radius: 24px;
}

.overview-stat-card {
  min-height: 112px;
}

.overview-stat-label {
  margin-bottom: 8px;
  color: #64748b;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.overview-stat-value {
  color: #0f172a;
  font-size: clamp(1.1rem, 2vw, 1.5rem);
  font-weight: 800;
  line-height: 1.2;
}
</style>''')
app3.write_text(text, encoding='utf-8')

# 6) app6 PrevisionRecettesPage.vue
app6 = root / 'pages' / 'app6' / 'PrevisionRecettesPage.vue'
text = app6.read_text(encoding='utf-8')
text = text.replace("import PageHeader from 'src/components/PageHeader.vue';\nimport { openPrintWindowWithMessage } from 'src/utils/printUrl';\nimport { exportToCsv } from 'src/utils/exportCsv';", "import PageHeader from 'src/components/PageHeader.vue';\nimport DataTable from 'src/components/DataTable.vue';\nimport { openPrintWindowWithMessage } from 'src/utils/printUrl';")
text = text.replace('''    <PageHeader
      title="Prévisions de Recettes"
      subtitle="Gestion des prévisions budgétaires de recettes"
      icon="trending_up"
    />''', '''    <PageHeader
      title="Prévisions de Recettes"
      subtitle="Gestion des prévisions budgétaires de recettes"
      icon="trending_up"
    >
      <template #stats>
        <div class="col-12 col-sm-6 col-lg-3">
          <q-card flat class="listing-stat-card overview-stat-card">
            <q-card-section class="row items-center no-wrap">
              <div class="col">
                <div class="overview-stat-label">Prévisions visibles</div>
                <div class="overview-stat-value">{{ filteredPrevisions.length }}</div>
              </div>
              <q-icon name="dataset" size="30px" color="primary" />
            </q-card-section>
          </q-card>
        </div>
        <div class="col-12 col-sm-6 col-lg-3">
          <q-card flat class="listing-stat-card overview-stat-card">
            <q-card-section class="row items-center no-wrap">
              <div class="col">
                <div class="overview-stat-label">Montant prévu</div>
                <div class="overview-stat-value">{{ formatMontant(totalPrevu) }}</div>
              </div>
              <q-icon name="payments" size="30px" color="secondary" />
            </q-card-section>
          </q-card>
        </div>
        <div class="col-12 col-sm-6 col-lg-3">
          <q-card flat class="listing-stat-card overview-stat-card">
            <q-card-section class="row items-center no-wrap">
              <div class="col">
                <div class="overview-stat-label">Montant réalisé</div>
                <div class="overview-stat-value">{{ formatMontant(totalRealise) }}</div>
              </div>
              <q-icon name="task_alt" size="30px" color="positive" />
            </q-card-section>
          </q-card>
        </div>
        <div class="col-12 col-sm-6 col-lg-3">
          <q-card flat class="listing-stat-card overview-stat-card">
            <q-card-section class="row items-center no-wrap">
              <div class="col">
                <div class="overview-stat-label">Taux de réalisation</div>
                <div class="overview-stat-value">{{ tauxRealisation.toFixed(1) }} %</div>
              </div>
              <q-icon name="monitoring" size="30px" color="teal" />
            </q-card-section>
          </q-card>
        </div>
      </template>
    </PageHeader>''')
text = text.replace('''        <!-- Tableau des prévisions -->
        <div class="row justify-end q-mb-sm">
          <q-btn
            flat
            color="primary"
            icon="download"
            label="Exporter CSV"
            @click="exportCsv"
            no-caps
          />
        </div>
        <q-table
          :rows="filteredPrevisions"
          :columns="columns"
          :loading="loading"
          row-key="id"
          :pagination="{ rowsPerPage: 15 }"
          flat
          bordered
          class="prevision-table"
        >''', '''        <DataTable
          :rows="filteredPrevisions"
          :columns="columns"
          :loading="loading"
          row-key="id"
          :pagination="{ rowsPerPage: 15 }"
          bordered
          class="prevision-table"
          show-export-csv
          export-filename="previsions-recettes"
        >''')
text = text.replace('</q-table>', '</DataTable>', 1)
text = re.sub(r'\n\s*<!-- Totaux -->\n\s*<div class="row q-col-gutter-sm q-mt-md">[\s\S]*?</div>\n\s*</q-card-section>', '\n      </q-card-section>', text, count=1)
text = re.sub(r'\nfunction exportCsv\(\) \{[\s\S]*?\n\}\n', '\n', text, count=1)
text = text.replace('const ecart = computed(() => totalRealise.value - totalPrevu.value);', "const ecart = computed(() => totalRealise.value - totalPrevu.value);\n\nconst tauxRealisation = computed(() =>\n  totalPrevu.value > 0 ? (totalRealise.value / totalPrevu.value) * 100 : 0,\n);")
text = text.replace('''<style scoped lang="scss">
.prevision-page {
  max-width: 1400px;
  margin: 0 auto;
}

.main-card {
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.prevision-table {
  :deep(.q-table__top) {
    padding: 0;
  }

  :deep(th) {
    font-weight: 600;
    background-color: #f5f5f5;
  }

  :deep(tr:hover) {
    background-color: rgba(255, 102, 0, 0.05);
  }
}

@media print {
  .q-btn,
  .q-input,
  .q-select {
    display: none !important;
  }
}
</style>''', '''<style scoped lang="scss">
.prevision-page {
  max-width: 1400px;
  margin: 0 auto;
}

.main-card {
  border-radius: 24px;
}

.overview-stat-card {
  min-height: 112px;
}

.overview-stat-label {
  margin-bottom: 8px;
  color: #64748b;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.overview-stat-value {
  color: #0f172a;
  font-size: clamp(1.1rem, 2vw, 1.5rem);
  font-weight: 800;
  line-height: 1.2;
}

@media print {
  .q-btn,
  .q-input,
  .q-select {
    display: none !important;
  }
}
</style>''')
app6.write_text(text, encoding='utf-8')

print('Patch applied successfully')
