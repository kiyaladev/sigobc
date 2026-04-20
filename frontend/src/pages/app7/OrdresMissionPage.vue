<template>
  <q-page class="dashboard-page q-pa-md">
    <PageHeader
      title="Ordres de Mission"
      subtitle="Gestion des missions du personnel"
      icon="flight_takeoff"
    >
      <template #stats>
        <div class="col-12 col-sm-6 col-lg-4" v-for="(stat, index) in statsCards" :key="index">
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
                label="Nouvel ordre"
                unelevated
                no-caps
                @click="openAdd"
              />
            </div>
          </div>
        </div>

        <DataTable
          :rows="filteredMissions"
          :columns="columns"
          :loading="loading"
          :pagination="tablePagination"
          @update:pagination="(v: any) => (tablePagination = v)"
          show-print
          show-export-csv
          export-filename="ordres-mission"
          @print="printMission"
          @edit="editMission"
          @delete="deleteMission"
        >
          <template v-slot:body-cell-employeId="props">
            <q-td :props="props">{{ getEmployeNom(props.row.employeId) }}</q-td>
          </template>
          <template v-slot:body-cell-statut="props">
            <q-td :props="props">
              <q-chip :color="getStatutColor(props.row.statut)" text-color="white" size="sm" dense>
                {{ getStatutLabel(props.row.statut) }}
              </q-chip>
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
              <q-td class="text-right text-weight-bold text-italic">{{
                formatMontant(reportValues.montantTotal)
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
              <q-td class="text-right text-weight-bold">{{
                formatMontant(totalPageValues.montantTotal)
              }}</q-td>
              <q-td></q-td>
              <q-td></q-td>
            </q-tr>
          </template>
        </DataTable>
      </q-card-section>
    </q-card>

    <!-- Dialog -->
    <q-dialog v-model="showDialog" persistent>
      <q-card class="dialog-card" style="width: min(750px, 96vw); max-width: 96vw">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">{{ editingId ? 'Modifier' : 'Nouvel' }} ordre de mission</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>
        <q-card-section>
          <q-form @submit="saveMission" class="q-gutter-sm">
            <div class="row q-col-gutter-sm">
              <div class="col-12 col-md-3">
                <q-input
                  v-model="form.numero"
                  label="N° Ordre *"
                  outlined
                  dense
                  :rules="[(v) => !!v || 'Obligatoire']"
                />
              </div>
              <div class="col-12 col-md-5">
                <q-select
                  v-model="form.employeId"
                  :options="filteredEmpOptions"
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
              <div class="col-12 col-md-4">
                <q-input
                  v-model.number="form.exercice"
                  label="Exercice"
                  outlined
                  dense
                  type="number"
                />
              </div>
            </div>
            <q-input
              v-model="form.objet"
              label="Objet de la mission *"
              outlined
              dense
              :rules="[(v) => !!v || 'Obligatoire']"
            />
            <q-input
              v-model="form.destination"
              label="Destination *"
              outlined
              dense
              :rules="[(v) => !!v || 'Obligatoire']"
            />
            <div class="row q-col-gutter-sm">
              <div class="col-12 col-md-4">
                <q-input
                  v-model="form.dateDebut"
                  label="Date départ *"
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
                  label="Date retour *"
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
            <div class="row q-col-gutter-sm q-mt-sm">
              <div class="col-12 col-md-4">
                <q-toggle
                  v-model="form.hebergementAssure"
                  label="Hébergement assuré"
                  @update:model-value="calcTotal"
                />
              </div>
              <div class="col-12 col-md-4">
                <q-toggle
                  v-model="form.nourritureAssuree"
                  label="Nourriture assurée"
                  @update:model-value="calcTotal"
                />
              </div>
              <div class="col-12 col-md-4">
                <q-input v-model="form.moyenTransport" label="Moyen de transport" outlined dense />
              </div>
            </div>
            <div
              class="row q-col-gutter-sm"
              v-if="!form.hebergementAssure || !form.nourritureAssuree"
            >
              <div class="col-12 col-md-4" v-if="!form.hebergementAssure">
                <q-input
                  v-model.number="form.fraisHebergement"
                  label="Frais d'hébergement"
                  outlined
                  dense
                  type="number"
                  suffix="CFA"
                  @update:model-value="calcTotal"
                />
              </div>
              <div class="col-12 col-md-4" v-if="!form.nourritureAssuree">
                <q-input
                  v-model.number="form.fraisNourriture"
                  label="Frais de nourriture"
                  outlined
                  dense
                  type="number"
                  suffix="CFA"
                  @update:model-value="calcTotal"
                />
              </div>
            </div>
            <q-separator class="q-my-sm" />
            <div class="text-subtitle2 text-grey-8">Frais</div>
            <div class="row q-col-gutter-sm">
              <div class="col-12 col-md-4">
                <q-input
                  v-model.number="form.indemniteJournaliere"
                  label="Indemnité journalière"
                  outlined
                  dense
                  type="number"
                  suffix="CFA"
                  @update:model-value="calcTotal"
                />
              </div>
              <div class="col-12 col-md-4">
                <q-input
                  v-model.number="form.fraisTransport"
                  label="Frais de transport"
                  outlined
                  dense
                  type="number"
                  suffix="CFA"
                  @update:model-value="calcTotal"
                />
              </div>
              <div class="col-12 col-md-4">
                <q-banner class="bg-green-1 rounded-borders">
                  <div class="text-caption">Montant total</div>
                  <div class="text-h6 text-positive">{{ formatMontant(form.montantTotal) }}</div>
                </q-banner>
              </div>
            </div>
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
import { db, type OrdreMission, type Employe, type PrintData } from 'src/database/db';
import { openPrintWindow } from 'src/utils/printUrl';
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
const missions = ref<OrdreMission[]>([]);
const employes = ref<Employe[]>([]);
const filteredEmpOptions = ref<{ label: string; value: number }[]>([]);

const statutOptions = [
  { label: 'Validé', value: 'valide' },
  { label: 'Brouillon', value: 'brouillon' },
];

const defaultForm = () => ({
  numero: '',
  employeId: null as number | null,
  exercice: new Date().getFullYear(),
  objet: '',
  destination: '',
  dateDebut: date.formatDate(new Date(), 'YYYY-MM-DD'),
  dateFin: date.formatDate(new Date(), 'YYYY-MM-DD'),
  nombreJours: 1,
  indemniteJournaliere: 0,
  fraisTransport: 0,
  fraisHebergement: 0,
  fraisNourriture: 0,
  montantTotal: 0,
  statut: 'valide' as OrdreMission['statut'],
  observations: '',
  hebergementAssure: false,
  nourritureAssuree: false,
  moyenTransport: '',
});

const form = ref(defaultForm());

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
    form.value.nombreJours = diff > 0 ? diff : 1;
    calcTotal();
  }
}

function calcTotal() {
  const hebergement = form.value.hebergementAssure ? 0 : form.value.fraisHebergement || 0;
  const nourriture = form.value.nourritureAssuree ? 0 : form.value.fraisNourriture || 0;
  form.value.montantTotal =
    (form.value.indemniteJournaliere || 0) * (form.value.nombreJours || 1) +
    (form.value.fraisTransport || 0) +
    hebergement +
    nourriture;
}

function getEmployeNom(id: number): string {
  const e = employes.value.find((x) => x.id === id);
  return e ? `${e.nom} ${e.prenom}` : '-';
}

function getStatutColor(s: string): string {
  return s === 'valide' ? 'positive' : 'grey';
}

function getStatutLabel(s: string): string {
  return s === 'valide' ? 'Validé' : 'Brouillon';
}

function formatMontant(v: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    minimumFractionDigits: 0,
  }).format(v);
}

const columns = [
  { name: 'numero', label: 'N° Ordre', field: 'numero', align: 'left' as const, sortable: true },
  { name: 'employeId', label: 'Agent', field: 'employeId', align: 'left' as const },
  { name: 'destination', label: 'Destination', field: 'destination', align: 'left' as const },
  {
    name: 'dateDebut',
    label: 'Départ',
    field: 'dateDebut',
    align: 'left' as const,
    format: (v: Date) => date.formatDate(v, 'DD/MM/YYYY'),
    sortable: true,
  },
  { name: 'nombreJours', label: 'Jours', field: 'nombreJours', align: 'center' as const },
  {
    name: 'montantTotal',
    label: 'Montant',
    field: 'montantTotal',
    align: 'right' as const,
    format: formatMontant,
  },
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

const filteredMissions = computed(() => {
  let r = missions.value;
  if (filterStatut.value) r = r.filter((m) => m.statut === filterStatut.value);
  if (filter.value) {
    const s = filter.value.toLowerCase();
    r = r.filter(
      (m) =>
        m.numero.toLowerCase().includes(s) ||
        m.destination.toLowerCase().includes(s) ||
        m.objet.toLowerCase().includes(s) ||
        getEmployeNom(m.employeId).toLowerCase().includes(s),
    );
  }
  return r;
});

// Report (cumul pages précédentes) et Total (cumul jusqu'à page courante)
const reportValues = computed(() => {
  const page = tablePagination.value.page;
  const perPage = tablePagination.value.rowsPerPage;
  if (page <= 1 || perPage <= 0) return { nombreJours: 0, montantTotal: 0 };
  const rows = filteredMissions.value.slice(0, (page - 1) * perPage);
  return {
    nombreJours: rows.reduce((s, m) => s + (m.nombreJours || 0), 0),
    montantTotal: rows.reduce((s, m) => s + (m.montantTotal || 0), 0),
  };
});

const totalPageValues = computed(() => {
  const page = tablePagination.value.page;
  const perPage = tablePagination.value.rowsPerPage;
  const endIdx =
    perPage <= 0
      ? filteredMissions.value.length
      : Math.min(page * perPage, filteredMissions.value.length);
  const rows = filteredMissions.value.slice(0, endIdx);
  return {
    nombreJours: rows.reduce((s, m) => s + (m.nombreJours || 0), 0),
    montantTotal: rows.reduce((s, m) => s + (m.montantTotal || 0), 0),
  };
});

// Cartes de statistiques avec animations
const statsCards = computed(() => {
  const total = missions.value.length;
  const valides = missions.value.filter((m) => m.statut === 'valide').length;
  const brouillons = missions.value.filter((m) => m.statut === 'brouillon').length;

  return [
    {
      value: total,
      label: 'Ordres de mission',
      helper: 'Documents enregistrés',
      icon: 'flight_takeoff',
      color: 'primary',
      progress: total > 0 ? 1 : 0,
    },
    {
      value: valides,
      label: 'Missions validées',
      helper: total > 0 ? `${Math.round((valides / total) * 100)}% du total` : 'Aucune validation',
      icon: 'verified',
      color: 'positive',
      progress: total > 0 ? valides / total : 0,
    },
    {
      value: brouillons,
      label: 'Brouillons',
      helper:
        total > 0 ? `${Math.round((brouillons / total) * 100)}% en attente` : 'Aucun brouillon',
      icon: 'pending',
      color: 'grey-7',
      progress: total > 0 ? brouillons / total : 0,
    },
  ];
});

async function loadData() {
  loading.value = true;
  try {
    [missions.value, employes.value] = await Promise.all([
      db.ordresMission.toArray(),
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

function editMission(row: OrdreMission) {
  editingId.value = row.id!;
  form.value = {
    numero: row.numero,
    employeId: row.employeId,
    exercice: row.exercice,
    objet: row.objet,
    destination: row.destination,
    dateDebut: date.formatDate(row.dateDebut, 'YYYY-MM-DD'),
    dateFin: date.formatDate(row.dateFin, 'YYYY-MM-DD'),
    nombreJours: row.nombreJours,
    indemniteJournaliere: row.indemniteJournaliere,
    fraisTransport: row.fraisTransport || 0,
    fraisHebergement: row.fraisHebergement || 0,
    fraisNourriture: row.fraisNourriture || 0,
    montantTotal: row.montantTotal,
    statut: row.statut,
    observations: row.observations || '',
    hebergementAssure: row.hebergementAssure || false,
    nourritureAssuree: row.nourritureAssuree || false,
    moyenTransport: row.moyenTransport || '',
  };
  showDialog.value = true;
}

async function saveMission() {
  if (!form.value.employeId) return;
  const now = new Date();
  const data = {
    numero: form.value.numero,
    employeId: form.value.employeId,
    exercice: form.value.exercice,
    objet: form.value.objet,
    destination: form.value.destination,
    dateDebut: new Date(form.value.dateDebut),
    dateFin: new Date(form.value.dateFin),
    nombreJours: form.value.nombreJours,
    indemniteJournaliere: form.value.indemniteJournaliere,
    fraisTransport: form.value.fraisTransport || undefined,
    fraisHebergement: form.value.hebergementAssure
      ? undefined
      : form.value.fraisHebergement || undefined,
    fraisNourriture: form.value.nourritureAssuree
      ? undefined
      : form.value.fraisNourriture || undefined,
    montantTotal: form.value.montantTotal,
    statut: form.value.statut,
    observations: form.value.observations || undefined,
    hebergementAssure: form.value.hebergementAssure,
    nourritureAssuree: form.value.nourritureAssuree,
    moyenTransport: form.value.moyenTransport,
    mairieId: 1,
    personnelId: 1,
    updatedAt: now,
  };
  try {
    if (editingId.value) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await db.ordresMission.update(editingId.value, data as any);
      $q.notify({ type: 'positive', message: 'Mission modifiée' });
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await db.ordresMission.add({ ...data, createdAt: now } as any);
      $q.notify({ type: 'positive', message: 'Mission enregistrée' });
    }
    showDialog.value = false;
    await loadData();
  } catch {
    $q.notify({ type: 'negative', message: 'Erreur' });
  }
}

function deleteMission(row: OrdreMission) {
  $q.dialog({
    title: 'Confirmation',
    message: `Supprimer l'ordre de mission "${row.numero}" ?`,
    cancel: true,
  }).onOk(() => {
    void (async () => {
      await db.ordresMission.delete(row.id);
      $q.notify({ type: 'positive', message: 'Mission supprimée' });
      await loadData();
    })();
  });
}

async function printMission(row: OrdreMission) {
  loading.value = true;
  try {
    const emp = employes.value.find((e) => e.id === row.employeId);

    const missionData = {
      ...row,
      agentNom: emp?.nom || '',
      agentPrenom: emp?.prenom || '',
      agentSexe: emp?.sexe || 'M',
      agentMatricule: emp?.matricule || '-',
      agentPoste: emp?.poste || '-',
      agentService: emp?.service || '-',
    };

    const printId = await db.printData.add({
      type: 'PRINT_ORDRE_MISSION',
      data: JSON.stringify(missionData),
      createdAt: new Date(),
    } as PrintData);

    openPrintWindow('employe/ordre-mission.html', { printId });
  } catch (error) {
    console.error("Erreur lors de l'impression :", error);
    $q.notify({ type: 'negative', message: "Erreur lors de la préparation de l'impression" });
  } finally {
    loading.value = false;
  }
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
