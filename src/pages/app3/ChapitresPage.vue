<template>
  <q-page class="chapitres-page q-pa-md">
    <PageHeader
      title="Chapitres Budgétaires"
      subtitle="Gestion des chapitres de dépenses"
      icon="category"
    />

    <q-card class="main-card">
      <q-card-section>
        <div class="row items-center justify-between q-mb-md">
          <div class="col-12 col-md-6">
            <q-input
              v-model="filter"
              placeholder="Rechercher un chapitre..."
              outlined
              dense
              clearable
            >
              <template v-slot:prepend>
                <q-icon name="search" />
              </template>
            </q-input>
          </div>
          <div class="col-12 col-md-auto q-mt-sm q-mt-md-none">
            <q-btn
              color="primary"
              icon="add"
              label="Nouveau Chapitre"
              unelevated
              @click="showAddDialog = true"
            />
          </div>
        </div>

        <DataTable
          :rows="filteredChapitres"
          :columns="columns"
          :loading="loading"
          @edit="editChapitre"
          @delete="deleteChapitre"
        />
      </q-card-section>
    </q-card>

    <!-- Dialog d'ajout/modification -->
    <q-dialog v-model="showAddDialog" persistent>
      <q-card style="min-width: 500px">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">
            {{ editingId ? 'Modifier le chapitre' : 'Nouveau chapitre' }}
          </div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <q-form @submit="saveChapitre" class="q-gutter-md">
            <q-input
              v-model="formData.code"
              label="Code *"
              outlined
              dense
              :rules="[(val) => !!val || 'Le code est requis']"
            />

            <q-input
              v-model="formData.libelle"
              label="Libellé *"
              outlined
              dense
              :rules="[(val) => !!val || 'Le libellé est requis']"
            />

            <q-input
              v-model="formData.description"
              label="Description"
              outlined
              dense
              type="textarea"
              rows="3"
            />

            <q-toggle v-model="formData.actif" label="Actif" color="positive" />

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
import { db, type Chapitre } from 'src/database/db';
import PageHeader from 'src/components/PageHeader.vue';
import DataTable from 'src/components/DataTable.vue';

const $q = useQuasar();
const loading = ref(false);
const filter = ref('');
const showAddDialog = ref(false);
const editingId = ref<number | null>(null);

const chapitres = ref<Chapitre[]>([]);

const formData = ref({
  code: '',
  libelle: '',
  description: '',
  actif: true,
});

const columns = [
  {
    name: 'code',
    label: 'Code',
    align: 'left' as const,
    field: 'code',
    sortable: true,
  },
  {
    name: 'libelle',
    label: 'Libellé',
    align: 'left' as const,
    field: 'libelle',
    sortable: true,
  },
  {
    name: 'description',
    label: 'Description',
    align: 'left' as const,
    field: 'description',
  },
  {
    name: 'actif',
    label: 'Statut',
    align: 'center' as const,
    field: 'actif',
    format: (val: boolean) => (val ? 'Actif' : 'Inactif'),
  },
  {
    name: 'actions',
    label: 'Actions',
    align: 'center' as const,
    field: 'id',
  },
];

const filteredChapitres = computed(() => {
  if (!filter.value) return chapitres.value;
  const searchTerm = filter.value.toLowerCase();
  return chapitres.value.filter(
    (c) =>
      c.code.toLowerCase().includes(searchTerm) ||
      c.libelle.toLowerCase().includes(searchTerm) ||
      c.description?.toLowerCase().includes(searchTerm),
  );
});

async function loadChapitres() {
  loading.value = true;
  try {
    chapitres.value = await db.chapitres.toArray();
  } catch (error) {
    console.error('Erreur lors du chargement des chapitres:', error);
    $q.notify({
      type: 'negative',
      message: 'Erreur lors du chargement des données',
    });
  } finally {
    loading.value = false;
  }
}

function resetForm() {
  formData.value = {
    code: '',
    libelle: '',
    description: '',
    actif: true,
  };
  editingId.value = null;
}

async function saveChapitre() {
  try {
    const now = new Date();
    const mairieId = 1; // À remplacer par l'ID de la mairie de l'utilisateur connecté

    if (editingId.value) {
      await db.chapitres.update(editingId.value, {
        ...formData.value,
        updatedAt: now,
      });
      $q.notify({
        type: 'positive',
        message: 'Chapitre modifié avec succès',
      });
    } else {
      await db.chapitres.add({
        ...formData.value,
        mairieId,
        createdAt: now,
        updatedAt: now,
      });
      $q.notify({
        type: 'positive',
        message: 'Chapitre ajouté avec succès',
      });
    }

    showAddDialog.value = false;
    resetForm();
    await loadChapitres();
  } catch (error) {
    console.error('Erreur lors de la sauvegarde:', error);
    $q.notify({
      type: 'negative',
      message: "Erreur lors de l'enregistrement",
    });
  }
}

async function editChapitre(row: Chapitre) {
  editingId.value = row.id!;
  formData.value = {
    code: row.code,
    libelle: row.libelle,
    description: row.description || '',
    actif: row.actif,
  };
  showAddDialog.value = true;
}

async function deleteChapitre(row: Chapitre) {
  $q.dialog({
    title: 'Confirmation',
    message: `Voulez-vous vraiment supprimer le chapitre "${row.libelle}" ?`,
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    try {
      await db.chapitres.delete(row.id!);
      $q.notify({
        type: 'positive',
        message: 'Chapitre supprimé avec succès',
      });
      await loadChapitres();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      $q.notify({
        type: 'negative',
        message: 'Erreur lors de la suppression',
      });
    }
  });
}

onMounted(() => {
  void loadChapitres();
});
</script>

<style scoped lang="scss">
.chapitres-page {
  max-width: 1400px;
  margin: 0 auto;
}

.main-card {
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}
</style>
