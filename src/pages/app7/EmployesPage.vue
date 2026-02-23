<template>
  <q-page class="q-pa-md">
    <PageHeader title="Agents / Employés" subtitle="Registre du personnel" icon="badge" />

    <q-card class="main-card">
      <q-card-section>
        <div class="row items-center justify-between q-mb-md">
          <div class="col-12 col-md-6">
            <q-input
              v-model="filter"
              placeholder="Rechercher par nom, matricule, poste..."
              outlined
              dense
              clearable
            >
              <template v-slot:prepend>
                <q-icon name="search" />
              </template>
            </q-input>
          </div>
          <div class="col-12 col-md-auto q-mt-sm q-mt-md-none q-gutter-x-sm">
            <q-toggle v-model="showInactifs" label="Afficher inactifs" dense />
            <q-btn color="primary" icon="add" label="Nouvel Agent" unelevated @click="openAdd" />
          </div>
        </div>

        <DataTable
          :rows="filteredEmployes"
          :columns="columns"
          :loading="loading"
          show-export-csv
          export-filename="employes"
          @edit="editEmploye"
          @delete="deleteEmploye"
        >
          <template v-slot:body-cell-actif="props">
            <q-td :props="props">
              <q-chip
                :color="props.row.actif ? 'positive' : 'grey'"
                text-color="white"
                size="sm"
                dense
              >
                {{ props.row.actif ? 'Actif' : 'Inactif' }}
              </q-chip>
            </q-td>
          </template>
          <template v-slot:body-cell-salaireBase="props">
            <q-td :props="props" class="text-right">
              {{ formatMontant(props.row.salaireBase) }}
            </q-td>
          </template>
        </DataTable>
      </q-card-section>
    </q-card>

    <!-- Dialog Ajout/Modification -->
    <q-dialog v-model="showDialog" persistent>
      <q-card style="min-width: 850px">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">
            {{ editingId ? "Modifier l'agent" : 'Nouvel agent' }}
          </div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-pt-md">
          <q-form @submit="saveEmploye" class="q-gutter-sm">
            <!-- Identité -->
            <div class="text-subtitle2 text-grey-8 q-mb-xs">Identité</div>
            <div class="row q-col-gutter-sm">
              <div class="col-12 col-md-3">
                <q-input
                  v-model="form.matricule"
                  label="Matricule *"
                  outlined
                  dense
                  :rules="[(v) => !!v || 'Obligatoire']"
                />
              </div>
              <div class="col-12 col-md-4">
                <q-input
                  v-model="form.nom"
                  label="Nom *"
                  outlined
                  dense
                  :rules="[(v) => !!v || 'Obligatoire']"
                />
              </div>
              <div class="col-12 col-md-4">
                <q-input
                  v-model="form.prenom"
                  label="Prénom *"
                  outlined
                  dense
                  :rules="[(v) => !!v || 'Obligatoire']"
                />
              </div>
              <div class="col-12 col-md-1">
                <q-select
                  v-model="form.sexe"
                  :options="[
                    { label: 'M', value: 'M' },
                    { label: 'F', value: 'F' },
                  ]"
                  label="Sexe"
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
                  v-model="form.dateNaissance"
                  label="Date de naissance"
                  outlined
                  dense
                  type="date"
                />
              </div>
              <div class="col-12 col-md-4">
                <q-input
                  v-model="form.dateEmbauche"
                  label="Date d'embauche"
                  outlined
                  dense
                  type="date"
                />
              </div>
              <div class="col-12 col-md-4">
                <q-input v-model="form.numeroCNPS" label="N° CNPS" outlined dense />
              </div>
            </div>

            <q-separator class="q-my-sm" />

            <!-- Poste -->
            <div class="text-subtitle2 text-grey-8 q-mb-xs">Poste & Service</div>
            <div class="row q-col-gutter-sm">
              <div class="col-12 col-md-4">
                <q-input
                  v-model="form.poste"
                  label="Poste / Fonction *"
                  outlined
                  dense
                  :rules="[(v) => !!v || 'Obligatoire']"
                />
              </div>
              <div class="col-12 col-md-4">
                <q-input v-model="form.grade" label="Grade / Catégorie" outlined dense />
              </div>
              <div class="col-12 col-md-4">
                <q-select
                  v-model="form.service"
                  :options="servicesOptions"
                  label="Service / Direction *"
                  outlined
                  dense
                  use-input
                  input-debounce="0"
                  new-value-mode="add-unique"
                  :rules="[(v) => !!v || 'Obligatoire']"
                />
              </div>
            </div>

            <q-separator class="q-my-sm" />

            <!-- Salaire -->
            <div class="text-subtitle2 text-grey-8 q-mb-xs">Rémunération</div>
            <div class="row q-col-gutter-sm">
              <div class="col-12 col-md-3">
                <q-input
                  v-model.number="form.salaireBase"
                  label="Salaire de base *"
                  outlined
                  dense
                  type="number"
                  suffix="CFA"
                  :rules="[(v) => v >= 0 || 'Invalide']"
                />
              </div>
              <div class="col-12 col-md-3">
                <q-input
                  v-model.number="form.indemniteLogement"
                  label="Indem. logement"
                  outlined
                  dense
                  type="number"
                  suffix="CFA"
                />
              </div>
              <div class="col-12 col-md-3">
                <q-input
                  v-model.number="form.indemniteTransport"
                  label="Indem. transport"
                  outlined
                  dense
                  type="number"
                  suffix="CFA"
                />
              </div>
              <div class="col-12 col-md-3">
                <q-input
                  v-model.number="form.autresIndemnites"
                  label="Autres indemnités"
                  outlined
                  dense
                  type="number"
                  suffix="CFA"
                />
              </div>
            </div>
            <div class="row q-col-gutter-sm">
              <div class="col-12 col-md-6">
                <q-input v-model="form.rib" label="RIB / Compte bancaire" outlined dense />
              </div>
              <div class="col-12 col-md-6">
                <q-toggle v-model="form.actif" label="Agent actif" />
              </div>
            </div>

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
import { db, type Employe } from 'src/database/db';
import PageHeader from 'src/components/PageHeader.vue';
import DataTable from 'src/components/DataTable.vue';

const $q = useQuasar();
const loading = ref(false);
const filter = ref('');
const showDialog = ref(false);
const showInactifs = ref(false);
const editingId = ref<number | null>(null);
const employes = ref<Employe[]>([]);

const servicesOptions = [
  'Administration Générale',
  'Direction Financière',
  'Service Technique',
  'État Civil',
  'Urbanisme',
  'Hygiène et Assainissement',
  'Service Social',
  'Sécurité',
  'Cabinet du Maire',
];

const defaultForm = () => ({
  matricule: '',
  nom: '',
  prenom: '',
  sexe: '' as 'M' | 'F' | '',
  dateNaissance: '',
  dateEmbauche: date.formatDate(new Date(), 'YYYY-MM-DD'),
  poste: '',
  grade: '',
  categorie: '',
  service: '',
  salaireBase: 0,
  indemniteLogement: 0,
  indemniteTransport: 0,
  autresIndemnites: 0,
  numeroCNPS: '',
  rib: '',
  actif: true,
  observations: '',
});

const form = ref(defaultForm());

const columns = [
  {
    name: 'matricule',
    label: 'Matricule',
    field: 'matricule',
    align: 'left' as const,
    sortable: true,
  },
  {
    name: 'nom',
    label: 'Nom',
    field: (r: Employe) => `${r.nom} ${r.prenom}`,
    align: 'left' as const,
    sortable: true,
  },
  { name: 'poste', label: 'Poste', field: 'poste', align: 'left' as const, sortable: true },
  { name: 'service', label: 'Service', field: 'service', align: 'left' as const, sortable: true },
  {
    name: 'salaireBase',
    label: 'Salaire de base',
    field: 'salaireBase',
    align: 'right' as const,
    sortable: true,
  },
  {
    name: 'dateEmbauche',
    label: 'Embauche',
    field: 'dateEmbauche',
    align: 'left' as const,
    format: (v: Date) => (v ? date.formatDate(v, 'DD/MM/YYYY') : '-'),
    sortable: true,
  },
  { name: 'actif', label: 'Statut', field: 'actif', align: 'center' as const },
  { name: 'actions', label: 'Actions', field: 'id', align: 'center' as const },
];

const filteredEmployes = computed(() => {
  let result = employes.value;
  if (!showInactifs.value) result = result.filter((e) => e.actif);
  if (filter.value) {
    const s = filter.value.toLowerCase();
    result = result.filter(
      (e) =>
        e.matricule.toLowerCase().includes(s) ||
        e.nom.toLowerCase().includes(s) ||
        e.prenom.toLowerCase().includes(s) ||
        e.poste.toLowerCase().includes(s) ||
        e.service.toLowerCase().includes(s),
    );
  }
  return result;
});

function formatMontant(montant: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    minimumFractionDigits: 0,
  }).format(montant);
}

async function loadData() {
  loading.value = true;
  try {
    employes.value = await db.employes.toArray();
  } finally {
    loading.value = false;
  }
}

function openAdd() {
  editingId.value = null;
  form.value = defaultForm();
  showDialog.value = true;
}

function editEmploye(row: Employe) {
  editingId.value = row.id!;
  form.value = {
    matricule: row.matricule,
    nom: row.nom,
    prenom: row.prenom,
    sexe: row.sexe || '',
    dateNaissance: row.dateNaissance ? date.formatDate(row.dateNaissance, 'YYYY-MM-DD') : '',
    dateEmbauche: row.dateEmbauche ? date.formatDate(row.dateEmbauche, 'YYYY-MM-DD') : '',
    poste: row.poste,
    grade: row.grade || '',
    categorie: row.categorie || '',
    service: row.service,
    salaireBase: row.salaireBase,
    indemniteLogement: row.indemniteLogement || 0,
    indemniteTransport: row.indemniteTransport || 0,
    autresIndemnites: row.autresIndemnites || 0,
    numeroCNPS: row.numeroCNPS || '',
    rib: row.rib || '',
    actif: row.actif,
    observations: row.observations || '',
  };
  showDialog.value = true;
}

async function saveEmploye() {
  const now = new Date();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data: any = {
    matricule: form.value.matricule,
    nom: form.value.nom,
    prenom: form.value.prenom,
    ...(form.value.sexe ? { sexe: form.value.sexe } : {}),
    ...(form.value.dateNaissance ? { dateNaissance: new Date(form.value.dateNaissance) } : {}),
    ...(form.value.dateEmbauche ? { dateEmbauche: new Date(form.value.dateEmbauche) } : {}),
    poste: form.value.poste,
    grade: form.value.grade || undefined,
    categorie: form.value.categorie || undefined,
    service: form.value.service,
    salaireBase: form.value.salaireBase,
    indemniteLogement: form.value.indemniteLogement,
    indemniteTransport: form.value.indemniteTransport,
    autresIndemnites: form.value.autresIndemnites,
    numeroCNPS: form.value.numeroCNPS || undefined,
    rib: form.value.rib || undefined,
    actif: form.value.actif,
    observations: form.value.observations || undefined,
    mairieId: 1,
    createdAt: now,
    updatedAt: now,
  };

  try {
    if (editingId.value) {
      await db.employes.update(editingId.value, { ...data, updatedAt: now });
      $q.notify({ type: 'positive', message: 'Agent modifié avec succès' });
    } else {
      // Vérifier que le matricule n'existe pas déjà
      const existing = await db.employes.where('matricule').equals(data.matricule).first();
      if (existing) {
        $q.notify({ type: 'negative', message: 'Ce matricule existe déjà' });
        return;
      }
      await db.employes.add(data as Omit<Employe, 'id'>);
      $q.notify({ type: 'positive', message: 'Agent ajouté avec succès' });
    }
    showDialog.value = false;
    await loadData();
  } catch {
    $q.notify({ type: 'negative', message: "Erreur lors de l'enregistrement" });
  }
}

function deleteEmploye(row: Employe) {
  $q.dialog({
    title: 'Confirmation',
    message: `Supprimer l'agent "${row.nom} ${row.prenom}" ?`,
    cancel: true,
    persistent: true,
  }).onOk(() => {
    void (async () => {
      await db.employes.delete(row.id);
      $q.notify({ type: 'positive', message: 'Agent supprimé' });
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
