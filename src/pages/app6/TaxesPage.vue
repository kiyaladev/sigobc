<template>
  <q-page class="taxes-page q-pa-md">
    <PageHeader
      title="Taxes et Recettes"
      subtitle="Gestion des taxes et sources de recettes"
      icon="account_balance"
    />

    <q-card class="main-card">
      <q-card-section>
        <!-- Barre de recherche et actions -->
        <div class="row items-center justify-between q-mb-md">
          <div class="col-12 col-md-6">
            <q-input v-model="filter" placeholder="Rechercher une taxe..." outlined dense clearable>
              <template v-slot:prepend>
                <q-icon name="search" />
              </template>
            </q-input>
          </div>
          <div class="col-12 col-md-auto q-mt-sm q-mt-md-none q-gutter-sm">
            <q-btn
              color="primary"
              icon="add"
              label="Nouvelle Taxe"
              unelevated
              @click="showAddDialog = true"
            />
          </div>
        </div>

        <!-- Tableau des taxes -->
        <div class="row justify-end q-mb-sm">
          <q-btn
            flat
            color="primary"
            icon="download"
            label="Exporter CSV"
            @click="exportCsv"
            no-caps
          />
        </div>
        <q-table
          :rows="filteredTaxes"
          :columns="columns"
          :loading="loading"
          row-key="id"
          :pagination="{ rowsPerPage: 20 }"
          flat
          bordered
          class="taxes-table"
        >
          <template v-slot:body-cell-type="props">
            <q-td :props="props">
              <q-chip
                :color="props.row.type === 'fixe' ? 'blue' : 'green'"
                text-color="white"
                size="sm"
                dense
              >
                {{ props.row.type }}
              </q-chip>
            </q-td>
          </template>

          <template v-slot:body-cell-actif="props">
            <q-td :props="props">
              <q-toggle
                :model-value="props.row.actif"
                color="positive"
                @update:model-value="toggleActif(props.row)"
              />
            </q-td>
          </template>

          <template v-slot:body-cell-actions="props">
            <q-td :props="props" class="q-gutter-xs">
              <q-btn flat dense icon="edit" color="primary" @click="editTaxe(props.row)">
                <q-tooltip>Modifier</q-tooltip>
              </q-btn>
              <q-btn flat dense icon="delete" color="negative" @click="deleteTaxe(props.row)">
                <q-tooltip>Supprimer</q-tooltip>
              </q-btn>
            </q-td>
          </template>

          <template v-slot:no-data>
            <div class="full-width text-center q-pa-lg">
              <q-icon name="inbox" size="48px" color="grey-5" class="q-mb-md" />
              <div class="text-grey-6">Aucune taxe trouvée</div>
            </div>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <!-- Dialog d'ajout/modification -->
    <q-dialog v-model="showAddDialog" persistent>
      <q-card style="min-width: 600px">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">
            {{ editingId ? 'Modifier la taxe' : 'Nouvelle taxe' }}
          </div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <q-form @submit="saveTaxe" class="q-gutter-md">
            <q-input
              v-model="formData.code"
              label="Code *"
              outlined
              dense
              :rules="[(val) => !!val || 'Code requis']"
            />

            <q-input
              v-model="formData.libelle"
              label="Libellé *"
              outlined
              dense
              :rules="[(val) => !!val || 'Libellé requis']"
            />

            <q-input
              v-model="formData.description"
              label="Description"
              outlined
              dense
              type="textarea"
              rows="2"
            />

            <q-select
              v-model="formData.type"
              :options="['fixe', 'variable']"
              label="Type *"
              outlined
              dense
            />

            <q-input
              v-if="formData.type === 'fixe'"
              v-model.number="formData.montant"
              label="Montant fixe"
              outlined
              dense
              type="number"
              prefix="XOF"
            />

            <q-input
              v-if="formData.type === 'variable'"
              v-model.number="formData.taux"
              label="Taux (%)"
              outlined
              dense
              type="number"
              suffix="%"
            />

            <q-toggle v-model="formData.actif" label="Taxe active" color="positive" />

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
import { db, type Taxe, DEFAULT_MAIRIE_ID } from 'src/database/db';
import PageHeader from 'src/components/PageHeader.vue';
import { exportToCsv } from 'src/utils/exportCsv';

const $q = useQuasar();
const loading = ref(false);
const filter = ref('');
const showAddDialog = ref(false);
const editingId = ref<number | null>(null);

const taxes = ref<Taxe[]>([]);

const formData = ref({
  code: '',
  libelle: '',
  description: '',
  type: 'variable' as 'fixe' | 'variable',
  montant: 0,
  taux: 0,
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
    sortable: false,
  },
  {
    name: 'type',
    label: 'Type',
    align: 'center' as const,
    field: 'type',
    sortable: true,
  },
  {
    name: 'valeur',
    label: 'Valeur',
    align: 'right' as const,
    field: (row: Taxe) =>
      row.type === 'fixe' ? formatMontant(row.montant || 0) : row.taux ? `${row.taux}%` : '-',
    sortable: false,
  },
  {
    name: 'actif',
    label: 'Actif',
    align: 'center' as const,
    field: 'actif',
    sortable: true,
  },
  {
    name: 'actions',
    label: 'Actions',
    align: 'center' as const,
    field: 'id',
  },
];

const filteredTaxes = computed(() => {
  if (!filter.value) return taxes.value;

  const searchTerm = filter.value.toLowerCase();
  return taxes.value.filter(
    (t) =>
      t.code.toLowerCase().includes(searchTerm) ||
      t.libelle.toLowerCase().includes(searchTerm) ||
      (t.description && t.description.toLowerCase().includes(searchTerm)),
  );
});

function formatMontant(montant: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    minimumFractionDigits: 0,
  }).format(montant);
}

function exportCsv() {
  exportToCsv(filteredTaxes.value as Record<string, unknown>[], columns, 'taxes');
}

async function loadData() {
  loading.value = true;
  try {
    taxes.value = await db.taxes.toArray();
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

async function saveTaxe() {
  try {
    const now = new Date();

    if (editingId.value) {
      // Modification
      const updateData: Record<string, unknown> = {
        code: formData.value.code,
        libelle: formData.value.libelle,
        description: formData.value.description,
        type: formData.value.type,
        actif: formData.value.actif,
        updatedAt: now,
      };
      if (formData.value.type === 'fixe') {
        updateData.montant = formData.value.montant;
      }
      if (formData.value.type === 'variable') {
        updateData.taux = formData.value.taux;
      }
      await db.taxes.update(editingId.value, updateData);
    } else {
      // Création
      const addData: Record<string, unknown> = {
        code: formData.value.code,
        libelle: formData.value.libelle,
        description: formData.value.description,
        type: formData.value.type,
        mairieId: DEFAULT_MAIRIE_ID,
        actif: formData.value.actif,
        createdAt: now,
        updatedAt: now,
      };
      if (formData.value.type === 'fixe') {
        addData.montant = formData.value.montant;
      }
      if (formData.value.type === 'variable') {
        addData.taux = formData.value.taux;
      }
      await db.taxes.add(addData as Parameters<typeof db.taxes.add>[0]);
    }

    $q.notify({
      type: 'positive',
      message: editingId.value ? 'Taxe modifiée' : 'Taxe créée',
    });

    showAddDialog.value = false;
    resetForm();
    await loadData();
  } catch (error) {
    console.error('Erreur lors de la sauvegarde:', error);
    $q.notify({
      type: 'negative',
      message: 'Erreur lors de la sauvegarde',
    });
  }
}

function editTaxe(row: Taxe) {
  editingId.value = row.id || null;
  formData.value = {
    code: row.code,
    libelle: row.libelle,
    description: row.description || '',
    type: row.type,
    montant: row.montant || 0,
    taux: row.taux || 0,
    actif: row.actif,
  };
  showAddDialog.value = true;
}

function deleteTaxe(row: Taxe) {
  $q.dialog({
    title: 'Confirmation',
    message: 'Voulez-vous vraiment supprimer cette taxe ?',
    cancel: true,
    persistent: true,
  }).onOk(() => {
    if (row.id) {
      db.taxes
        .delete(row.id)
        .then(() => {
          $q.notify({
            type: 'positive',
            message: 'Taxe supprimée',
          });
          return loadData();
        })
        .catch((error: unknown) => {
          console.error('Erreur lors de la suppression:', error);
          $q.notify({
            type: 'negative',
            message: 'Erreur lors de la suppression',
          });
        });
    }
  });
}

async function toggleActif(row: Taxe) {
  try {
    if (row.id) {
      await db.taxes.update(row.id, {
        actif: !row.actif,
        updatedAt: new Date(),
      });
      await loadData();
    }
  } catch (error) {
    console.error('Erreur lors de la mise à jour:', error);
  }
}

function resetForm() {
  editingId.value = null;
  formData.value = {
    code: '',
    libelle: '',
    description: '',
    type: 'variable',
    montant: 0,
    taux: 0,
    actif: true,
  };
}

onMounted(() => {
  void loadData();
});
</script>

<style scoped lang="scss">
.taxes-page {
  max-width: 1400px;
  margin: 0 auto;
}

.main-card {
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.taxes-table {
  :deep(th) {
    font-weight: 600;
    background-color: #f5f5f5;
  }

  :deep(tr:hover) {
    background-color: rgba(255, 102, 0, 0.05);
  }
}
</style>
