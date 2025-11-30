<template>
  <q-page class="q-pa-md">
    <div class="row q-mb-md justify-between items-center">
      <div class="text-h5">Gestion des Taxes</div>
      <q-btn color="primary" icon="add" label="Nouvelle Taxe" @click="openDialog()" />
    </div>

    <!-- Recherche et filtres -->
    <q-card class="q-mb-md">
      <q-card-section>
        <div class="row q-col-gutter-md">
          <div class="col-12 col-sm-4">
            <q-input v-model="search" filled placeholder="Rechercher une taxe..." dense clearable>
              <template v-slot:prepend>
                <q-icon name="search" />
              </template>
            </q-input>
          </div>
          <div class="col-12 col-sm-3">
            <q-select
              v-model="filterType"
              filled
              dense
              :options="typeOptions"
              label="Type"
              clearable
            />
          </div>
          <div class="col-12 col-sm-3">
            <q-select
              v-model="filterActif"
              filled
              dense
              :options="actifOptions"
              label="Statut"
              clearable
            />
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Table des taxes -->
    <q-card>
      <q-table
        :rows="filteredTaxes"
        :columns="columns"
        row-key="id"
        :loading="loading"
        :pagination="{ rowsPerPage: 10 }"
        binary-state-sort
      >
        <template v-slot:body-cell-type="props">
          <q-td :props="props">
            <q-chip
              :color="props.row.type === 'fixe' ? 'accent' : 'accent'"
              text-color="grey-9"
              size="sm"
            >
              {{ props.row.type }}
            </q-chip>
          </q-td>
        </template>

        <template v-slot:body-cell-montant="props">
          <q-td :props="props">
            <span v-if="props.row.type === 'fixe'">
              {{ formatMontant(props.row.montant || 0) }}
            </span>
            <span v-else> {{ props.row.taux }}% </span>
          </q-td>
        </template>

        <template v-slot:body-cell-actif="props">
          <q-td :props="props">
            <q-chip :color="props.row.actif ? 'positive' : 'grey'" text-color="white" size="sm">
              {{ props.row.actif ? 'Actif' : 'Inactif' }}
            </q-chip>
          </q-td>
        </template>

        <template v-slot:body-cell-actions="props">
          <q-td :props="props">
            <q-btn flat round dense icon="edit" color="primary" @click="openDialog(props.row)">
              <q-tooltip>Modifier</q-tooltip>
            </q-btn>
            <q-btn
              flat
              round
              dense
              icon="delete"
              color="negative"
              @click="confirmDelete(props.row)"
            >
              <q-tooltip>Supprimer</q-tooltip>
            </q-btn>
          </q-td>
        </template>
      </q-table>
    </q-card>

    <!-- Dialog de création/modification -->
    <q-dialog v-model="dialogVisible" persistent>
      <q-card style="min-width: 700px">
        <q-card-section class="accent-left">
          <div class="text-h6">{{ isEditing ? 'Modifier' : 'Nouvelle' }} Taxe</div>
        </q-card-section>

        <q-card-section>
          <q-form @submit="onSubmit" class="q-gutter-md">
            <div class="row q-col-gutter-md">
              <div class="col-12 col-sm-6">
                <q-input
                  v-model="form.code"
                  filled
                  label="Code *"
                  lazy-rules
                  :rules="[(val) => !!val || 'Le code est requis']"
                />
              </div>

              <!-- <div class="col-12 col-sm-6">
                <q-select
                  v-model="form.type"
                  filled
                  :options="typeOptions"
                  label="Type *"
                  :rules="[val => !!val || 'Le type est requis']"
                  @update:model-value="onTypeChange"
                />
              </div> -->

              <div class="col-12">
                <q-input
                  v-model="form.libelle"
                  filled
                  label="Libellé *"
                  lazy-rules
                  :rules="[(val) => !!val || 'Le libellé est requis']"
                />
              </div>

              <div class="col-12">
                <q-input
                  v-model="form.description"
                  filled
                  type="textarea"
                  label="Description"
                  rows="3"
                />
              </div>

              <!-- <div class="col-12 col-sm-6" v-if="form.type === 'fixe'">
                <q-input
                  v-model.number="form.montant"
                  filled
                  type="number"
                  label="Montant fixe *"
                  suffix="FCFA"
                  :rules="[(val) => val > 0 || 'Le montant est requis']"
                />
              </div> -->

              <!-- <div class="col-12 col-sm-6" v-if="form.type === 'variable'">
                <q-input
                  v-model.number="form.taux"
                  filled
                  type="number"
                  label="Taux (%)"
                  suffix="%"
                  :rules="[val => val >= 0 || 'Le taux doit être positif']"
                />
              </div>

              <div class="col-12 col-sm-6">
                <q-select
                  v-model="form.mairieId"
                  filled
                  :options="mairieOptions"
                  option-value="value"
                  option-label="label"
                  emit-value
                  map-options
                  label="Mairie *"
                  :rules="[val => !!val || 'La mairie est requise']"
                /> -->
              <!-- </div> -->

              <div class="col-12 col-sm-6">
                <q-toggle v-model="form.actif" label="Taxe active" color="green" />
              </div>
            </div>
          </q-form>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Annuler" color="grey" v-close-popup />
          <q-btn label="Enregistrer" color="primary" @click="onSubmit" :loading="saving" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { db, type Taxe, DEFAULT_MAIRIE_ID } from 'src/database/db';

const $q = useQuasar();

const taxes = ref<Taxe[]>([]);
const loading = ref(false);
const saving = ref(false);
const dialogVisible = ref(false);
const isEditing = ref(false);
const search = ref('');
const filterType = ref('');
const filterActif = ref('');

const typeOptions = ['fixe', 'variable'];
const actifOptions = ['Actif', 'Inactif'];

const form = ref<Partial<Taxe>>({
  code: '',
  libelle: '',
  description: '',
  // taux: 0,
  // montant: 0,
  // type: 'fixe',
  actif: true,
});

const columns = [
  { name: 'code', label: 'Code', field: 'code', align: 'left' as const, sortable: true },
  { name: 'libelle', label: 'Libellé', field: 'libelle', align: 'left' as const, sortable: true },
  // { name: 'type', label: 'Type', field: 'type', align: 'center' as const, sortable: true },
  // {
  //   name: 'montant',
  //   label: 'Montant/Taux',
  //   field: 'montant',
  //   align: 'right' as const,
  //   sortable: true,
  // },
  // { name: 'actif', label: 'Statut', field: 'actif', align: 'center' as const, sortable: true },
  { name: 'actions', label: 'Actions', field: 'actions', align: 'center' as const },
];

const filteredTaxes = computed(() => {
  let result = taxes.value;

  if (filterType.value) {
    result = result.filter((t) => t.type === filterType.value);
  }

  if (filterActif.value) {
    const isActif = filterActif.value === 'Actif';
    result = result.filter((t) => t.actif === isActif);
  }

  if (search.value) {
    const searchLower = search.value.toLowerCase();
    result = result.filter(
      (t) =>
        t.code.toLowerCase().includes(searchLower) ||
        t.libelle.toLowerCase().includes(searchLower) ||
        (t.description && t.description.toLowerCase().includes(searchLower)),
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
    taxes.value = await db.taxes.toArray();
  } catch (error) {
    console.error('Erreur lors du chargement:', error);
    $q.notify({ type: 'negative', message: 'Erreur lors du chargement' });
  } finally {
    loading.value = false;
  }
}

function openDialog(taxe?: Taxe) {
  isEditing.value = !!taxe;
  if (taxe) {
    form.value = { ...taxe };
  } else {
    form.value = {
      code: '',
      libelle: '',
      description: '',
      // taux: 0,
      // montant: 0,
      // type: 'fixe',
      actif: true,
    };
  }
  dialogVisible.value = true;
}

async function onSubmit() {
  saving.value = true;
  try {
    const now = new Date();
    if (isEditing.value && form.value.id) {
      await db.taxes.update(form.value.id, {
        ...form.value,
        updatedAt: now,
      });
      $q.notify({ type: 'positive', message: 'Taxe modifiée avec succès' });
    } else {
      await db.taxes.add({
        ...form.value,
        mairieId: DEFAULT_MAIRIE_ID,
        createdAt: now,
        updatedAt: now,
      } as Taxe);
      $q.notify({ type: 'positive', message: 'Taxe créée avec succès' });
    }
    dialogVisible.value = false;
    await loadData();
  } catch (error) {
    console.error('Erreur:', error);
    $q.notify({ type: 'negative', message: "Erreur lors de l'enregistrement" });
  } finally {
    saving.value = false;
  }
}

function confirmDelete(taxe: Taxe) {
  $q.dialog({
    title: 'Confirmation',
    message: `Voulez-vous vraiment supprimer la taxe "${taxe.libelle}" ?`,
    cancel: true,
    persistent: true,
  }).onOk(() => {
    void (async () => {
      try {
        await db.taxes.delete(taxe.id);
        $q.notify({ type: 'positive', message: 'Taxe supprimée avec succès' });
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
