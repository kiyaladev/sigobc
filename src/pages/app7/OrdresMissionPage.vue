<template>
  <q-page class="q-pa-md">
    <PageHeader
      title="Ordres de Mission"
      subtitle="Gestion des missions du personnel"
      icon="flight_takeoff"
    />

    <q-card class="main-card">
      <q-card-section>
        <div class="row items-center justify-between q-mb-md">
          <div class="col-12 col-md-4">
            <q-input v-model="filter" placeholder="Rechercher..." outlined dense clearable>
              <template v-slot:prepend><q-icon name="search" /></template>
            </q-input>
          </div>
          <div class="col-12 col-md-auto q-mt-sm q-mt-md-none q-gutter-x-sm">
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
import { db, type OrdreMission, type Employe } from 'src/database/db';
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
  { label: 'Brouillon', value: 'brouillon' },
  { label: 'Validé', value: 'valide' },
  { label: 'Payé', value: 'paye' },
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
  statut: 'brouillon' as OrdreMission['statut'],
  observations: '',
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
  return s === 'paye' ? 'positive' : s === 'valide' ? 'blue' : 'grey';
}

function getStatutLabel(s: string): string {
  return s === 'paye' ? 'Payé' : s === 'valide' ? 'Validé' : 'Brouillon';
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

function printMission(row: OrdreMission) {
  const emp = employes.value.find((e) => e.id === row.employeId);
  const html = `
    <html><head><title>Ordre de Mission N° ${row.numero}</title>
    <style>
      body{font-family:Arial,sans-serif;margin:40px;}
      h2{text-align:center;}
      table{width:100%;border-collapse:collapse;margin-top:16px;}
      td,th{padding:8px 12px;border:1px solid #ddd;}
      th{background:#f5f5f5;}
      .signature{display:flex;justify-content:space-between;margin-top:60px;}
      .sig-box{text-align:center;width:200px;border-top:1px solid #333;padding-top:8px;}
    </style></head>
    <body>
      <h2>ORDRE DE MISSION N° ${row.numero}</h2>
      <table>
        <tr><th colspan="2">Agent</th></tr>
        <tr><td>Matricule</td><td>${emp?.matricule || '-'}</td></tr>
        <tr><td>Nom & Prénom</td><td>${emp ? `${emp.nom} ${emp.prenom}` : '-'}</td></tr>
        <tr><td>Poste</td><td>${emp?.poste || '-'}</td></tr>
        <tr><td>Service</td><td>${emp?.service || '-'}</td></tr>
        <tr><th colspan="2">Mission</th></tr>
        <tr><td>Objet</td><td>${row.objet}</td></tr>
        <tr><td>Destination</td><td>${row.destination}</td></tr>
        <tr><td>Date de départ</td><td>${date.formatDate(row.dateDebut, 'DD/MM/YYYY')}</td></tr>
        <tr><td>Date de retour</td><td>${date.formatDate(row.dateFin, 'DD/MM/YYYY')}</td></tr>
        <tr><td>Nombre de jours</td><td>${row.nombreJours}</td></tr>
        <tr><th colspan="2">Frais</th></tr>
        <tr><td>Indemnité journalière</td><td>${row.indemniteJournaliere.toLocaleString('fr-FR')} CFA × ${row.nombreJours} j</td></tr>
        <tr><td>Frais de transport</td><td>${(row.fraisTransport || 0).toLocaleString('fr-FR')} CFA</td></tr>
        <tr><td><strong>MONTANT TOTAL</strong></td><td><strong>${row.montantTotal.toLocaleString('fr-FR')} CFA</strong></td></tr>
      </table>
      <div class="signature">
        <div class="sig-box">L'Agent</div>
        <div class="sig-box">Le Chef de Service</div>
        <div class="sig-box">Le Maire</div>
      </div>
    </body></html>`;
  const win = window.open('', '_blank');
  if (win) {
    win.document.write(html);
    win.document.close();
    win.print();
  }
}

onMounted(() => {
  void loadData();
});
</script>

<style scoped lang="scss">
.main-card {
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}
</style>
