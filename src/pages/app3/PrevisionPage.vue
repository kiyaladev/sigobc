<template>
  <q-page class="prevision-page q-pa-md">
    <PageHeader
      title="Prévisions Budgétaires"
      subtitle="Gestion des prévisions de dépenses"
      icon="pie_chart"
    />

    <q-card class="main-card">
      <q-card-section>
        <div class="row items-center justify-between q-mb-md">
          <div class="col-12 col-md-6">
            <q-input
              v-model="filter"
              placeholder="Rechercher une prévision..."
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
              label="Nouvelle Prévision"
              unelevated
              @click="showAddDialog = true"
            />
          </div>
        </div>

        <DataTable
          :rows="filteredPrevisions"
          :columns="columns"
          :loading="loading"
          @edit="editPrevision"
          @delete="deletePrevision"
        />
      </q-card-section>
    </q-card>

    <!-- Dialog d'ajout/modification -->
    <q-dialog v-model="showAddDialog" persistent>
      <q-card style="min-width: 600px">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">
            {{ editingId ? 'Modifier la prévision' : 'Nouvelle prévision' }}
          </div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <q-form @submit="savePrevision" class="q-gutter-md">
            <q-input
              v-model.number="formData.exercice"
              label="Exercice *"
              outlined
              dense
              type="number"
              :rules="[(val) => !!val || 'Exercice requis']"
            />

            <q-select
              v-model="formData.chapitreId"
              :options="chapitreOptions"
              label="Chapitre *"
              outlined
              dense
              emit-value
              map-options
              :rules="[(val) => !!val || 'Chapitre requis']"
            />

            <q-input
              v-model.number="formData.montantPrevu"
              label="Montant Prévu *"
              outlined
              dense
              type="number"
              prefix="XOF"
              :rules="[(val) => !!val || 'Montant requis']"
            />

            <q-select
              v-model="formData.statut"
              :options="['brouillon', 'validee', 'cloturee']"
              label="Statut *"
              outlined
              dense
            />

            <q-input
              v-model="formData.observations"
              label="Observations"
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
import { db, type Prevision, type Chapitre } from 'src/database/db';
import PageHeader from 'src/components/PageHeader.vue';
import DataTable from 'src/components/DataTable.vue';

const $q = useQuasar();
const loading = ref(false);
const filter = ref('');
const showAddDialog = ref(false);
const editingId = ref<number | null>(null);

const previsions = ref<Prevision[]>([]);
const chapitres = ref<Chapitre[]>([]);

const formData = ref({
  exercice: new Date().getFullYear(),
  chapitreId: null as number | null,
  montantPrevu: 0,
  statut: 'brouillon' as 'brouillon' | 'validee' | 'cloturee',
  observations: '',
});

const chapitreOptions = computed(() =>
  chapitres.value.map((c) => ({
    label: `${c.code} - ${c.libelle}`,
    value: c.id,
  })),
);

const columns = [
  {
    name: 'exercice',
    label: 'Exercice',
    align: 'left' as const,
    field: 'exercice',
    sortable: true,
  },
  {
    name: 'chapitre',
    label: 'Chapitre',
    align: 'left' as const,
    field: (row: Prevision) => {
      const chapitre = chapitres.value.find((c) => c.id === row.chapitreId);
      return chapitre ? `${chapitre.code} - ${chapitre.libelle}` : '';
    },
  },
  {
    name: 'montantPrevu',
    label: 'Montant Prévu',
    align: 'right' as const,
    field: 'montantPrevu',
    format: (val: number) => formatMontant(val),
  },
  {
    name: 'montantEngage',
    label: 'Engagé',
    align: 'right' as const,
    field: 'montantEngage',
    format: (val: number) => formatMontant(val),
  },
  {
    name: 'montantDisponible',
    label: 'Disponible',
    align: 'right' as const,
    field: 'montantDisponible',
    format: (val: number) => formatMontant(val),
  },
  {
    name: 'statut',
    label: 'Statut',
    align: 'center' as const,
    field: 'statut',
  },
  {
    name: 'actions',
    label: 'Actions',
    align: 'center' as const,
    field: 'id',
  },
];

const filteredPrevisions = computed(() => {
  if (!filter.value) return previsions.value;
  const searchTerm = filter.value.toLowerCase();
  return previsions.value.filter((p) => p.exercice.toString().includes(searchTerm));
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
    previsions.value = await db.previsions.toArray();
    chapitres.value = await db.chapitres.where('actif').equals(true).toArray();
  } catch (error) {
    console.error('Erreur lors du chargement:', error);
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
    exercice: new Date().getFullYear(),
    chapitreId: null,
    montantPrevu: 0,
    statut: 'brouillon',
    observations: '',
  };
  editingId.value = null;
}

async function savePrevision() {
  try {
    const now = new Date();
    const mairieId = 1;
    const personnelId = 1;

    const data = {
      ...formData.value,
      montantEngage: 0,
      montantDisponible: formData.value.montantPrevu,
      mairieId,
      personnelId,
    };

    if (editingId.value) {
      await db.previsions.update(editingId.value, {
        ...data,
        updatedAt: now,
      });
      $q.notify({
        type: 'positive',
        message: 'Prévision modifiée avec succès',
      });
    } else {
      await db.previsions.add({
        ...data,
        createdAt: now,
        updatedAt: now,
      });
      $q.notify({
        type: 'positive',
        message: 'Prévision ajoutée avec succès',
      });
    }

    showAddDialog.value = false;
    resetForm();
    await loadData();
  } catch (error) {
    console.error('Erreur lors de la sauvegarde:', error);
    $q.notify({
      type: 'negative',
      message: "Erreur lors de l'enregistrement",
    });
  }
}

async function editPrevision(row: Prevision) {
  editingId.value = row.id!;
  formData.value = {
    exercice: row.exercice,
    chapitreId: row.chapitreId,
    montantPrevu: row.montantPrevu,
    statut: row.statut,
    observations: row.observations || '',
  };
  showAddDialog.value = true;
}

async function deletePrevision(row: Prevision) {
  $q.dialog({
    title: 'Confirmation',
    message: 'Voulez-vous vraiment supprimer cette prévision ?',
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    try {
      await db.previsions.delete(row.id!);
      $q.notify({
        type: 'positive',
        message: 'Prévision supprimée avec succès',
      });
      await loadData();
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
  void loadData();
});
</script>

<style scoped lang="scss">
.prevision-page {
  max-width: 1400px;
  margin: 0 auto;
}

.main-card {
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}
</style>
