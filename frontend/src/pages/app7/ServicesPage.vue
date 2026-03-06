<template>
  <q-page class="dashboard-page q-pa-md">
    <PageHeader title="Services" subtitle="Gestion des Services de la Mairie" icon="business" />

    <q-card class="main-card q-mt-md">
      <q-card-section>
        <div class="row items-center justify-between q-mb-md">
          <div class="col-12 col-md-4">
            <q-input
              v-model="filter"
              placeholder="Rechercher par nom, compte ou chapitre..."
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
            <q-btn color="primary" icon="add" label="Nouveau Service" unelevated @click="openAdd" />
          </div>
        </div>

        <DataTable
          :rows="filteredServices"
          :columns="columns"
          :loading="loading"
          @edit="editService"
          @delete="deleteService"
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
        </DataTable>
      </q-card-section>
    </q-card>

    <!-- Dialog Ajout/Modification -->
    <q-dialog v-model="showDialog" persistent>
      <q-card style="min-width: 400px">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">
            {{ editingId ? 'Modifier le service' : 'Nouveau service' }}
          </div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-pt-md">
          <q-form @submit="saveService" class="q-gutter-md">
            <q-input
              v-model="form.nom"
              label="Nom du service *"
              outlined
              dense
              :rules="[(v) => !!v || 'Obligatoire']"
            />

            <q-input v-model="form.compte" label="Compte associé" outlined dense type="number" />

            <q-input v-model="form.chapitre" label="Chapitre" outlined dense type="number" />

            <q-toggle v-model="form.actif" label="Service actif" />

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
import { useQuasar } from 'quasar';
import { db, type ServiceApp7 } from 'src/database/db';
import PageHeader from 'src/components/PageHeader.vue';
import DataTable from 'src/components/DataTable.vue';

const $q = useQuasar();
const loading = ref(false);
const filter = ref('');
const showDialog = ref(false);
const showInactifs = ref(false);
const editingId = ref<number | null>(null);
const servicesList = ref<ServiceApp7[]>([]);

const defaultForm = () => ({
  nom: '',
  compte: '',
  chapitre: '',
  actif: true,
});

const form = ref(defaultForm());

const columns = [
  {
    name: 'nom',
    label: 'Nom du Service',
    field: 'nom',
    align: 'left' as const,
    sortable: true,
  },
  {
    name: 'compte',
    label: 'Compte',
    field: 'compte',
    align: 'left' as const,
    sortable: true,
  },
  {
    name: 'chapitre',
    label: 'Chapitre',
    field: 'chapitre',
    align: 'left' as const,
    sortable: true,
  },
  { name: 'actif', label: 'Statut', field: 'actif', align: 'center' as const },
  { name: 'actions', label: 'Actions', field: 'id', align: 'center' as const },
];

const filteredServices = computed(() => {
  let result = servicesList.value;
  if (!showInactifs.value) result = result.filter((s) => s.actif);
  if (filter.value) {
    const term = filter.value.toLowerCase();
    result = result.filter(
      (s) =>
        s.nom.toLowerCase().includes(term) ||
        (s.compte && s.compte.toLowerCase().includes(term)) ||
        (s.chapitre && s.chapitre.toLowerCase().includes(term)),
    );
  }
  return result;
});

async function loadData() {
  loading.value = true;
  try {
    servicesList.value = await db.servicesApp7.toArray();
  } finally {
    loading.value = false;
  }
}

function openAdd() {
  editingId.value = null;
  form.value = defaultForm();
  showDialog.value = true;
}

function editService(row: ServiceApp7) {
  editingId.value = row.id!;
  form.value = {
    nom: row.nom,
    compte: row.compte || '',
    chapitre: row.chapitre || '',
    actif: row.actif,
  };
  showDialog.value = true;
}

async function saveService() {
  const now = new Date();
  const data = {
    nom: form.value.nom,
    compte: form.value.compte || undefined,
    chapitre: form.value.chapitre || undefined,
    actif: form.value.actif,
    mairieId: 1, // Mairie par défaut
    createdAt: now,
    updatedAt: now,
  };

  try {
    if (editingId.value) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await db.servicesApp7.update(editingId.value, { ...data, updatedAt: now } as any);
      $q.notify({ type: 'positive', message: 'Service modifié avec succès' });
    } else {
      // Vérifier le nom
      const existing = await db.servicesApp7.where('nom').equalsIgnoreCase(data.nom).first();
      if (existing) {
        $q.notify({ type: 'negative', message: 'Un service avec ce nom existe déjà' });
        return;
      }
      await db.servicesApp7.add(data as Omit<ServiceApp7, 'id'>);
      $q.notify({ type: 'positive', message: 'Service ajouté avec succès' });
    }
    showDialog.value = false;
    await loadData();
  } catch (err) {
    console.error(err);
    $q.notify({ type: 'negative', message: "Erreur lors de l'enregistrement" });
  }
}

function deleteService(row: ServiceApp7) {
  $q.dialog({
    title: 'Confirmation',
    message: `Voulez-vous vraiment supprimer le service "${row.nom}" ?`,
    cancel: true,
    persistent: true,
  }).onOk(() => {
    void (async () => {
      await db.servicesApp7.delete(row.id as number);
      $q.notify({ type: 'positive', message: 'Service supprimé' });
      await loadData();
    })();
  });
}

onMounted(() => {
  void loadData();
});
</script>

<style scoped lang="scss">
.dashboard-page {
  max-width: 1400px;
  margin: 0 auto;
}

.main-card {
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}
</style>
