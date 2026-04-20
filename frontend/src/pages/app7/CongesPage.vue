<template>
  <q-page class="dashboard-page q-pa-md">
    <PageHeader
      title="Congés & Absences"
      subtitle="Gestion des congés du personnel"
      icon="beach_access"
    >
      <template #stats>
        <div class="col-12 col-sm-6 col-lg-3" v-for="(stat, index) in statsCards" :key="index">
          <q-card flat class="listing-stat-card overview-stat-card">
            <q-card-section class="row items-center no-wrap">
              <div class="col">
                <div class="overview-stat-label">{{ stat.label }}</div>
                <div class="overview-stat-value">{{ stat.value }}</div>
                <div class="overview-stat-helper">{{ stat.helper }}</div>
              </div>
              <q-icon :name="stat.icon" size="30px" :color="stat.color" />
            </q-card-section>
          </q-card>
        </div>
      </template>
    </PageHeader>

    <q-card class="main-card">
      <q-card-section>
        <div class="compact-toolbar q-mb-md">
          <div class="compact-toolbar-top row items-center q-col-gutter-sm">
            <div class="col-12 col-md-5">
              <q-input
                v-model="filter"
                placeholder="Rechercher..."
                outlined
                dense
                clearable
                class="compact-search"
              >
                <template v-slot:prepend><q-icon name="search" /></template>
              </q-input>
            </div>
            <div class="col-12 col-md-auto compact-toolbar-summary">
              <q-chip outline color="primary" icon="filter_alt" size="sm">
                {{ activeFiltersCount }} filtre{{ activeFiltersCount > 1 ? 's' : '' }}
              </q-chip>
            </div>
            <div class="col-12 col-md-auto compact-toolbar-actions">
              <q-btn dense outline color="grey-7" icon="tune" label="Filtres" no-caps>
                <q-menu class="compact-filter-menu" anchor="bottom right" self="top right">
                  <div class="compact-filter-panel">
                    <div class="compact-filter-panel-title">Filtres avancés</div>
                    <div class="row q-col-gutter-sm">
                      <div class="col-12 col-sm-6 col-md-4">
                        <q-select
                          v-model="filterStatut"
                          :options="statutOptions"
                          label="Statut"
                          outlined
                          dense
                          emit-value
                          map-options
                          clearable
                        />
                      </div>
                      <div class="col-12 col-sm-6 col-md-4">
                        <q-btn
                          label="Réinitialiser"
                          icon="refresh"
                          outline
                          color="grey-7"
                          @click="resetFilters"
                          class="full-width"
                        />
                      </div>
                    </div>
                  </div>
                </q-menu>
              </q-btn>
              <q-btn
                color="primary"
                icon="add"
                label="Nouveau congé"
                unelevated
                no-caps
                @click="openAdd"
              />
            </div>
          </div>
        </div>

        <DataTable
          :rows="filteredConges"
          :columns="columns"
          :loading="loading"
          :pagination="tablePagination"
          @update:pagination="(v: any) => (tablePagination = v)"
          show-export-csv
          export-filename="conges"
          @edit="editConge"
          @delete="deleteConge"
        >
          <template v-slot:body-cell-employeId="props">
            <q-td :props="props">{{ getEmployeNom(props.row.employeId) }}</q-td>
          </template>
          <template v-slot:body-cell-type="props">
            <q-td :props="props">
              <q-chip :color="getTypeColor(props.row.type)" text-color="white" size="sm" dense>
                {{ getTypeLabel(props.row.type) }}
              </q-chip>
            </q-td>
          </template>
          <template v-slot:body-cell-statut="props">
            <q-td :props="props">
              <q-chip :color="getStatutColor(props.row.statut)" text-color="white" size="sm" dense>
                {{ getStatutLabel(props.row.statut) }}
              </q-chip>
            </q-td>
          </template>
          <!-- Boutons d'approbation rapide -->
          <template v-slot:body-cell-actions="props">
            <q-td :props="props" class="q-gutter-x-xs">
              <q-btn
                v-if="props.row.statut === 'demande'"
                flat
                round
                dense
                icon="check_circle"
                color="positive"
                size="sm"
                @click.stop="approuverConge(props.row)"
              >
                <q-tooltip>Approuver</q-tooltip>
              </q-btn>
              <q-btn
                v-if="props.row.statut === 'demande'"
                flat
                round
                dense
                icon="cancel"
                color="negative"
                size="sm"
                @click.stop="refuserConge(props.row)"
              >
                <q-tooltip>Refuser</q-tooltip>
              </q-btn>
              <q-btn
                flat
                round
                dense
                icon="edit"
                color="primary"
                size="sm"
                @click.stop="editConge(props.row)"
              >
                <q-tooltip>Modifier</q-tooltip>
              </q-btn>
              <q-btn
                flat
                round
                dense
                icon="delete"
                color="negative"
                size="sm"
                @click.stop="deleteConge(props.row)"
              >
                <q-tooltip>Supprimer</q-tooltip>
              </q-btn>
            </q-td>
          </template>
          <!-- Report row (page 2+) -->
          <template v-slot:top-row>
            <q-tr v-if="tablePagination.page > 1" class="report-row">
              <q-td class="text-weight-bold text-italic">REPORT</q-td>
              <q-td></q-td>
              <q-td></q-td>
              <q-td></q-td>
              <q-td class="text-center text-weight-bold text-italic">{{
                reportValues.nombreJours
              }}</q-td>
              <q-td></q-td>
              <q-td></q-td>
            </q-tr>
          </template>
          <!-- Total row -->
          <template v-slot:bottom-row>
            <q-tr class="total-row">
              <q-td class="text-weight-bold">TOTAL</q-td>
              <q-td></q-td>
              <q-td></q-td>
              <q-td></q-td>
              <q-td class="text-center text-weight-bold">{{ totalPageValues.nombreJours }}</q-td>
              <q-td></q-td>
              <q-td></q-td>
            </q-tr>
          </template>
        </DataTable>
      </q-card-section>
    </q-card>

    <!-- Dialog -->
    <q-dialog v-model="showDialog" persistent>
      <q-card class="dialog-card" style="width: min(600px, 96vw); max-width: 96vw">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">{{ editingId ? 'Modifier' : 'Nouveau' }} congé</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>
        <q-card-section>
          <q-form @submit="saveConge" class="q-gutter-sm">
            <div class="row q-col-gutter-sm">
              <div class="col-12 col-md-6">
                <q-select
                  v-model="form.employeId"
                  :options="employeOptions"
                  label="Agent *"
                  outlined
                  dense
                  emit-value
                  map-options
                  use-input
                  input-debounce="0"
                  @filter="filterEmp"
                  :rules="[(v) => !!v || 'Obligatoire']"
                />
              </div>
              <div class="col-12 col-md-6">
                <q-select
                  v-model="form.type"
                  :options="typeOptions"
                  label="Type *"
                  outlined
                  dense
                  emit-value
                  map-options
                />
              </div>
            </div>
            <div class="row q-col-gutter-sm">
              <div class="col-12 col-md-4">
                <q-input
                  v-model="form.dateDebut"
                  label="Date début *"
                  outlined
                  dense
                  type="date"
                  :rules="[(v) => !!v || 'Obligatoire']"
                  @update:model-value="calcJours"
                />
              </div>
              <div class="col-12 col-md-4">
                <q-input
                  v-model="form.dateFin"
                  label="Date fin *"
                  outlined
                  dense
                  type="date"
                  :rules="[(v) => !!v || 'Obligatoire']"
                  @update:model-value="calcJours"
                />
              </div>
              <div class="col-12 col-md-4">
                <q-input
                  v-model.number="form.nombreJours"
                  label="Nombre de jours"
                  outlined
                  dense
                  type="number"
                  readonly
                />
              </div>
            </div>
            <q-input v-model="form.motif" label="Motif" outlined dense type="textarea" rows="2" />
            <q-select
              v-model="form.statut"
              :options="statutOptions"
              label="Statut"
              outlined
              dense
              emit-value
              map-options
            />
            <q-input
              v-model="form.observations"
              label="Observations"
              outlined
              dense
              type="textarea"
              rows="2"
            />
            <div class="row justify-end q-gutter-sm q-mt-md">
              <q-btn label="Annuler" flat color="grey-7" v-close-popup />
              <q-btn label="Enregistrer" type="submit" color="primary" unelevated />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useQuasar, date } from 'quasar';
import { db, type Conge, type Employe } from 'src/database/db';
import PageHeader from 'src/components/PageHeader.vue';
import DataTable from 'src/components/DataTable.vue';

const $q = useQuasar();
const loading = ref(false);
const showDialog = ref(false);
const editingId = ref<number | null>(null);
const filter = ref('');
const filterStatut = ref<string | null>(null);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const tablePagination = ref<any>({ page: 1, rowsPerPage: 10 });
const conges = ref<Conge[]>([]);
const employes = ref<Employe[]>([]);

const typeOptions = [
  { label: 'Annuel', value: 'annuel' },
  { label: 'Maladie', value: 'maladie' },
  { label: 'Maternité', value: 'maternite' },
  { label: 'Circonstance', value: 'circonstance' },
  { label: 'Autre', value: 'autre' },
];

const statutOptions = [
  { label: 'Demandé', value: 'demande' },
  { label: 'Approuvé', value: 'approuve' },
  { label: 'Refusé', value: 'refuse' },
  { label: 'Annulé', value: 'annule' },
];

const defaultForm = () => ({
  employeId: null as number | null,
  type: 'annuel' as Conge['type'],
  dateDebut: date.formatDate(new Date(), 'YYYY-MM-DD'),
  dateFin: date.formatDate(new Date(), 'YYYY-MM-DD'),
  nombreJours: 0,
  motif: '',
  statut: 'demande' as Conge['statut'],
  observations: '',
});

const form = ref(defaultForm());
const filteredEmpOptions = ref<{ label: string; value: number }[]>([]);

const employeOptions = computed(() =>
  employes.value
    .filter((e) => e.actif)
    .map((e) => ({
      label: `${e.matricule} – ${e.nom} ${e.prenom}`,
      value: e.id!,
    })),
);

function filterEmp(val: string, update: (cb: () => void) => void) {
  update(() => {
    const needle = val.toLowerCase();
    filteredEmpOptions.value = val
      ? employeOptions.value.filter((o) => o.label.toLowerCase().includes(needle))
      : employeOptions.value;
  });
}

function calcJours() {
  if (form.value.dateDebut && form.value.dateFin) {
    const d1 = new Date(form.value.dateDebut);
    const d2 = new Date(form.value.dateFin);
    const diff = Math.ceil((d2.getTime() - d1.getTime()) / (1000 * 3600 * 24)) + 1;
    form.value.nombreJours = diff > 0 ? diff : 0;
  }
}

function getEmployeNom(id: number): string {
  const e = employes.value.find((x) => x.id === id);
  return e ? `${e.nom} ${e.prenom}` : '-';
}

function getTypeLabel(t: string): string {
  return typeOptions.find((o) => o.value === t)?.label || t;
}

function getTypeColor(t: string): string {
  const map: Record<string, string> = {
    annuel: 'primary',
    maladie: 'orange',
    maternite: 'pink',
    circonstance: 'teal',
    autre: 'grey',
  };
  return map[t] || 'grey';
}

function getStatutLabel(s: string): string {
  return statutOptions.find((o) => o.value === s)?.label || s;
}

function getStatutColor(s: string): string {
  const map: Record<string, string> = {
    demande: 'orange',
    approuve: 'positive',
    refuse: 'negative',
    annule: 'grey',
  };
  return map[s] || 'grey';
}

const columns = [
  { name: 'employeId', label: 'Agent', field: 'employeId', align: 'left' as const, sortable: true },
  { name: 'type', label: 'Type', field: 'type', align: 'center' as const },
  {
    name: 'dateDebut',
    label: 'Du',
    field: 'dateDebut',
    align: 'left' as const,
    format: (v: Date) => date.formatDate(v, 'DD/MM/YYYY'),
    sortable: true,
  },
  {
    name: 'dateFin',
    label: 'Au',
    field: 'dateFin',
    align: 'left' as const,
    format: (v: Date) => date.formatDate(v, 'DD/MM/YYYY'),
  },
  { name: 'nombreJours', label: 'Jours', field: 'nombreJours', align: 'center' as const },
  { name: 'statut', label: 'Statut', field: 'statut', align: 'center' as const },
  { name: 'actions', label: 'Actions', field: 'id', align: 'center' as const },
];

const activeFiltersCount = computed(() => {
  return [filter.value, filterStatut.value].filter((value) => value !== null && value !== '')
    .length;
});

function resetFilters() {
  filter.value = '';
  filterStatut.value = null;
}

const filteredConges = computed(() => {
  let r = conges.value;
  if (filterStatut.value) r = r.filter((c) => c.statut === filterStatut.value);
  if (filter.value) {
    const s = filter.value.toLowerCase();
    r = r.filter((c) => getEmployeNom(c.employeId).toLowerCase().includes(s));
  }
  return r;
});

// Report (cumul pages précédentes) et Total (cumul jusqu'à page courante)
const reportValues = computed(() => {
  const page = tablePagination.value.page;
  const perPage = tablePagination.value.rowsPerPage;
  if (page <= 1 || perPage <= 0) return { nombreJours: 0 };
  const rows = filteredConges.value.slice(0, (page - 1) * perPage);
  return {
    nombreJours: rows.reduce((s, c) => s + (c.nombreJours || 0), 0),
  };
});

const totalPageValues = computed(() => {
  const page = tablePagination.value.page;
  const perPage = tablePagination.value.rowsPerPage;
  const endIdx =
    perPage <= 0
      ? filteredConges.value.length
      : Math.min(page * perPage, filteredConges.value.length);
  const rows = filteredConges.value.slice(0, endIdx);
  return {
    nombreJours: rows.reduce((s, c) => s + (c.nombreJours || 0), 0),
  };
});

// Cartes de statistiques avec animations
const statsCards = computed(() => {
  const total = conges.value.length;
  const approuves = conges.value.filter((c) => c.statut === 'approuve').length;
  const attente = conges.value.filter((c) => c.statut === 'demande').length;
  const refuses = conges.value.filter((c) => c.statut === 'refuse' || c.statut === 'annule').length;

  return [
    {
      value: total,
      label: 'Demandes soumises',
      helper: 'Total des demandes enregistrées',
      icon: 'all_inbox',
      color: 'primary',
    },
    {
      value: approuves,
      label: 'Congés approuvés',
      helper: 'Demandes validées',
      icon: 'verified',
      color: 'positive',
    },
    {
      value: attente,
      label: 'En attente',
      helper: 'Dossiers à traiter',
      icon: 'pending',
      color: 'orange',
    },
    {
      value: refuses,
      label: 'Refusés / annulés',
      helper: 'Demandes non retenues',
      icon: 'cancel',
      color: 'negative',
    },
  ];
});

async function loadData() {
  loading.value = true;
  try {
    [conges.value, employes.value] = await Promise.all([
      db.conges.toArray(),
      db.employes.toArray(),
    ]);
    filteredEmpOptions.value = employeOptions.value;
  } finally {
    loading.value = false;
  }
}

function openAdd() {
  editingId.value = null;
  form.value = defaultForm();
  showDialog.value = true;
}

function editConge(row: Conge) {
  editingId.value = row.id!;
  form.value = {
    employeId: row.employeId,
    type: row.type,
    dateDebut: date.formatDate(row.dateDebut, 'YYYY-MM-DD'),
    dateFin: date.formatDate(row.dateFin, 'YYYY-MM-DD'),
    nombreJours: row.nombreJours,
    motif: row.motif || '',
    statut: row.statut,
    observations: row.observations || '',
  };
  showDialog.value = true;
}

async function saveConge() {
  if (!form.value.employeId) return;
  const now = new Date();
  const data = {
    employeId: form.value.employeId,
    type: form.value.type,
    dateDebut: new Date(form.value.dateDebut),
    dateFin: new Date(form.value.dateFin),
    nombreJours: form.value.nombreJours,
    motif: form.value.motif || undefined,
    statut: form.value.statut,
    observations: form.value.observations || undefined,
    mairieId: 1,
    personnelId: 1,
    updatedAt: now,
  };
  try {
    if (editingId.value) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await db.conges.update(editingId.value, data as any);
      $q.notify({ type: 'positive', message: 'Congé modifié' });
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await db.conges.add({ ...data, createdAt: now } as any);
      $q.notify({ type: 'positive', message: 'Congé enregistré' });
    }
    showDialog.value = false;
    await loadData();
  } catch {
    $q.notify({ type: 'negative', message: 'Erreur' });
  }
}

async function approuverConge(row: Conge) {
  await db.conges.update(row.id, { statut: 'approuve', updatedAt: new Date() });
  $q.notify({ type: 'positive', message: 'Congé approuvé' });
  await loadData();
}

async function refuserConge(row: Conge) {
  await db.conges.update(row.id, { statut: 'refuse', updatedAt: new Date() });
  $q.notify({ type: 'warning', message: 'Congé refusé' });
  await loadData();
}

function deleteConge(row: Conge) {
  $q.dialog({ title: 'Confirmation', message: 'Supprimer ce congé ?', cancel: true }).onOk(() => {
    void (async () => {
      await db.conges.delete(row.id);
      $q.notify({ type: 'positive', message: 'Congé supprimé' });
      await loadData();
    })();
  });
}

onMounted(() => {
  void loadData();
});
</script>

<style scoped lang="scss">
// Page principale
.dashboard-page {
  max-width: 1400px;
  margin: 0 auto;
}

.main-card {
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  animation: fadeIn 0.6s ease-out both;
  animation-delay: 0.4s;
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

.overview-stat-helper {
  margin-top: 6px;
  color: #64748b;
  font-size: 0.82rem;
  font-weight: 600;
}

:deep(.q-dialog .q-card) {
  border-radius: 22px;
  box-shadow: 0 24px 56px rgba(15, 23, 42, 0.18);
}

// Report & Total rows
:deep(.report-row) {
  background: #fef3c7 !important;
  td {
    font-style: italic;
    font-weight: 600;
  }
}
:deep(.total-row) {
  background: #dbeafe !important;
  td {
    font-weight: 700;
  }
}

// Animations
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
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

.compact-search :deep(.q-field__control) {
  min-height: 38px;
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
  width: min(760px, 88vw);
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
