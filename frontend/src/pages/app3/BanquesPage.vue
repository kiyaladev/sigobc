<template>
  <q-page class="banques-page q-pa-md">
    <PageHeader
      title="Banques"
      subtitle="Banques partenaires de la commune"
      icon="account_balance"
    />

    <q-card class="main-card">
      <q-card-section>
        <div class="listing-toolbar row items-center justify-between q-mb-md">
          <div class="col-12 col-md-6 listing-search">
            <q-input
              v-model="filter"
              placeholder="Rechercher une banque..."
              outlined
              dense
              clearable
            >
              <template v-slot:prepend>
                <q-icon name="search" />
              </template>
            </q-input>
          </div>
          <div class="col-12 col-md-auto q-mt-sm q-mt-md-none listing-actions">
            <q-btn
              color="primary"
              icon="add"
              label="Nouvelle Banque"
              unelevated
              @click="openAddDialog"
            />
          </div>
        </div>

        <DataTable
          :rows="filteredBanques"
          :columns="columns"
          :loading="loading"
          show-export-csv
          export-filename="banques"
          @edit="editBanque"
          @delete="deleteBanque"
        />
      </q-card-section>
    </q-card>

    <!-- Dialog d'ajout/modification -->
    <q-dialog v-model="showDialog" persistent>
      <q-card class="dialog-card" style="width: min(600px, 96vw); max-width: 96vw">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">
            {{ editingId ? 'Modifier la banque' : 'Nouvelle banque' }}
          </div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-pt-md">
          <q-form @submit="saveBanque" class="q-gutter-sm">
            <div class="row q-col-gutter-sm">
              <div class="col-12 col-md-4">
                <q-input
                  v-model="formData.code"
                  label="Code *"
                  outlined
                  dense
                  placeholder="Ex: BACI"
                  :rules="[(val) => !!val || 'Code requis']"
                />
              </div>
              <div class="col-12 col-md-8">
                <q-input
                  v-model="formData.nom"
                  label="Nom de la banque *"
                  outlined
                  dense
                  :rules="[(val) => !!val || 'Nom requis']"
                />
              </div>
            </div>

            <q-input
              v-model="formData.description"
              label="Description"
              outlined
              dense
              type="textarea"
              rows="3"
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
import { useQuasar } from 'quasar';
import { db, type Banque } from 'src/database/db';
import PageHeader from 'src/components/PageHeader.vue';
import DataTable from 'src/components/DataTable.vue';

const $q = useQuasar();
const loading = ref(false);
const filter = ref('');
const showDialog = ref(false);
const editingId = ref<number | null>(null);
const banques = ref<Banque[]>([]);

const formData = ref({
  code: '',
  nom: '',
  description: '',
});

const columns = [
  { name: 'id', label: 'ID', align: 'center' as const, field: 'id', sortable: true },
  { name: 'code', label: 'Code', align: 'left' as const, field: 'code', sortable: true },
  { name: 'nom', label: 'Nom de la banque', align: 'left' as const, field: 'nom', sortable: true },
  {
    name: 'description',
    label: 'Description',
    align: 'left' as const,
    field: 'description',
    sortable: true,
  },
  { name: 'actions', label: 'Actions', align: 'center' as const, field: 'id' },
];

const filteredBanques = computed(() => {
  if (!filter.value) return banques.value;
  const search = filter.value.toLowerCase();
  return banques.value.filter(
    (b) =>
      b.code.toLowerCase().includes(search) ||
      b.nom.toLowerCase().includes(search) ||
      (b.description && b.description.toLowerCase().includes(search)),
  );
});

async function loadData() {
  loading.value = true;
  try {
    banques.value = await db.banques.toArray();
  } catch (error) {
    console.error('Erreur:', error);
    $q.notify({ type: 'negative', message: 'Erreur lors du chargement' });
  } finally {
    loading.value = false;
  }
}

function resetForm() {
  editingId.value = null;
  formData.value = {
    code: '',
    nom: '',
    description: '',
  };
}

function openAddDialog() {
  resetForm();
  showDialog.value = true;
}

function editBanque(row: Banque) {
  editingId.value = row.id || null;
  formData.value = {
    code: row.code,
    nom: row.nom,
    description: row.description || '',
  };
  showDialog.value = true;
}

async function saveBanque() {
  try {
    const now = new Date();

    if (editingId.value) {
      await db.banques.update(editingId.value, { ...formData.value, updatedAt: now });
      $q.notify({ type: 'positive', message: 'Banque modifiée' });
    } else {
      await db.banques.add({
        ...formData.value,
        createdAt: now,
        updatedAt: now,
      } as Omit<Banque, 'id'>);
      $q.notify({ type: 'positive', message: 'Banque ajoutée' });
    }

    showDialog.value = false;
    resetForm();
    await loadData();
  } catch (error) {
    console.error('Erreur:', error);
    $q.notify({ type: 'negative', message: "Erreur lors de l'enregistrement" });
  }
}

function deleteBanque(row: Banque) {
  $q.dialog({
    title: 'Confirmation',
    message: `Supprimer la banque "${row.nom}" ?`,
    cancel: true,
    persistent: true,
  }).onOk(() => {
    void (async () => {
      try {
        await db.banques.delete(row.id);
        $q.notify({ type: 'positive', message: 'Banque supprimée' });
        await loadData();
      } catch (error) {
        console.error('Erreur:', error);
        $q.notify({ type: 'negative', message: 'Erreur lors de la suppression' });
      }
    })();
  });
}

onMounted(() => {
  void loadData();
});
</script>

<style scoped lang="scss">
.banques-page {
  max-width: 1400px;
  margin: 0 auto;
}
.main-card {
  border-radius: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}
</style>
