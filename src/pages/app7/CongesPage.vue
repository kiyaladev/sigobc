<template>
  <q-page class="q-pa-md">
    <PageHeader
      title="Congés & Absences"
      subtitle="Gestion des congés du personnel"
      icon="beach_access"
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
            <q-btn color="primary" icon="add" label="Nouveau congé" unelevated @click="openAdd" />
          </div>
        </div>

        <DataTable
          :rows="filteredConges"
          :columns="columns"
          :loading="loading"
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
        </DataTable>
      </q-card-section>
    </q-card>

    <!-- Dialog -->
    <q-dialog v-model="showDialog" persistent>
      <q-card style="min-width: 600px">
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

const filteredConges = computed(() => {
  let r = conges.value;
  if (filterStatut.value) r = r.filter((c) => c.statut === filterStatut.value);
  if (filter.value) {
    const s = filter.value.toLowerCase();
    r = r.filter((c) => getEmployeNom(c.employeId).toLowerCase().includes(s));
  }
  return r;
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
.main-card {
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}
</style>
