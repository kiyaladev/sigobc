<template>
  <q-page class="dashboard-page q-pa-md">
    <PageHeader
      title="Ordres de Mission"
      subtitle="Gestion des missions du personnel"
      icon="flight_takeoff"
    />

    <div class="row q-col-gutter-md q-mb-md">
      <!-- Cartes de statistiques -->
      <div class="col-12 col-md-4" v-for="(stat, index) in statsCards" :key="index">
        <q-card
          class="stat-card hover-lift"
          :class="`stat-card-${index}`"
          :style="{
            animationDelay: `${index * 0.1}s`,
            borderLeft: `4px solid var(--q-${stat.color})`,
          }"
        >
          <q-card-section class="stat-card-content">
            <div class="row items-center no-wrap">
              <div class="col">
                <div class="stat-value text-grey-8">{{ stat.value }}</div>
                <div class="stat-label text-grey-6">{{ stat.label }}</div>
              </div>
              <div class="col-auto">
                <div class="stat-icon-wrapper" :class="`bg-${stat.color}-1`">
                  <q-icon :name="stat.icon" class="stat-icon" :color="stat.color" />
                </div>
              </div>
            </div>

            <!-- Indicateur de progression -->
            <q-linear-progress
              :value="stat.progress || 1"
              :color="stat.color"
              class="stat-progress q-mt-md"
              :class="{ 'pulse-animation': stat.progress < 1 }"
            />
          </q-card-section>
        </q-card>
      </div>
    </div>

    <q-card class="main-card">
      <q-card-section>
        <div class="row q-col-gutter-sm items-center q-mb-md">
          <div class="col-12 col-md-3">
            <q-input v-model="filter" placeholder="Rechercher..." outlined dense clearable>
              <template v-slot:prepend><q-icon name="search" /></template>
            </q-input>
          </div>
          <div class="col-12 col-md-auto">
            <q-select
              v-model="filterStatut"
              :options="statutOptions"
              label="Statut"
              outlined
              dense
              emit-value
              map-options
              clearable
              style="min-width: 160px"
            />
          </div>
          <div class="col-12 col-md-auto">
            <q-btn color="primary" icon="add" label="Nouvel ordre" unelevated @click="openAdd" />
          </div>
        </div>

        <DataTable
          :rows="filteredMissions"
          :columns="columns"
          :loading="loading"
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
        </DataTable>
      </q-card-section>
    </q-card>

    <!-- Dialog -->
    <q-dialog v-model="showDialog" persistent>
      <q-card style="min-width: 750px">
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
                <q-toggle v-model="form.hebergementAssure" label="Hébergement assuré" />
              </div>
              <div class="col-12 col-md-4">
                <q-toggle v-model="form.nourritureAssuree" label="Nourriture assurée" />
              </div>
              <div class="col-12 col-md-4">
                <q-input v-model="form.moyenTransport" label="Moyen de transport" outlined dense />
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
import PageHeader from 'src/components/PageHeader.vue';
import DataTable from 'src/components/DataTable.vue';

const $q = useQuasar();
const loading = ref(false);
const showDialog = ref(false);
const editingId = ref<number | null>(null);
const filter = ref('');
const filterStatut = ref<string | null>(null);
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
  form.value.montantTotal =
    (form.value.indemniteJournaliere || 0) * (form.value.nombreJours || 1) +
    (form.value.fraisTransport || 0);
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

// Cartes de statistiques avec animations
const statsCards = computed(() => {
  const total = missions.value.length;
  const valides = missions.value.filter((m) => m.statut === 'valide').length;
  const brouillons = missions.value.filter((m) => m.statut === 'brouillon').length;

  return [
    {
      value: total,
      label: 'Total Missions',
      icon: 'flight_takeoff',
      color: 'primary',
      progress: total > 0 ? 1 : 0,
    },
    {
      value: valides,
      label: 'Missions Validées',
      icon: 'verified',
      color: 'positive',
      progress: total > 0 ? valides / total : 0,
    },
    {
      value: brouillons,
      label: 'En Brouillon',
      icon: 'pending',
      color: 'grey',
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

    // Preparer les données complètes pour l'impression finale
    const missionData = {
      ...row,
      agentNom: emp?.nom || '',
      agentPrenom: emp?.prenom || '',
      agentSexe: emp?.sexe || 'M',
      agentMatricule: emp?.matricule || '-',
      agentPoste: emp?.poste || '-',
      agentService: emp?.service || '-',
    };

    // Sauvegarder dans PrintData pour l'accès de l'autre page

    const printId = await db.printData.add({
      type: 'PRINT_ORDRE_MISSION',
      data: JSON.stringify(missionData),
      createdAt: new Date(),
    } as PrintData);

    // Ouvrir la fenêtre d'impression avec le printId
    const url = `/employe/ordre-mission.html?printId=${printId}&print=true`;

    // Si on est dans Electron, informer le main process (le cas échéant)
    // Sinon on ouvre une nouvelle fenêtre (cas du web browser)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((window as any).electronAPI) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (window as any).electronAPI.printDocument({
        url: url,
        title: `Ordre de Mission N° ${row.numero}`,
      });
    } else {
      window.open(url, '_blank');
    }
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

// Cartes de statistiques
.stat-card {
  height: 100%;
  border-radius: 16px;
  overflow: hidden;
  animation: slideInUp 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) both;

  &:hover {
    .stat-icon {
      transform: scale(1.1) rotate(5deg);
    }
  }
}

.stat-card-content {
  position: relative;
  overflow: hidden;
  background: white;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  line-height: 1.2;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.stat-label {
  font-size: 0.875rem;
  opacity: 0.95;
  margin-top: 4px;
}

.stat-icon-wrapper {
  border-radius: 12px;
  padding: 12px;
}

.stat-icon {
  font-size: 48px;
  transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.stat-progress {
  border-radius: 4px;
  height: 4px;
}

.pulse-animation {
  animation: pulse 2s ease-in-out infinite;
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
</style>
