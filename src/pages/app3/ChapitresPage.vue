<template>
  <q-page class="q-pa-md">
    <PageHeader
      title="Gestion des Chapitres Budgétaires"
      subtitle="Chapitres budgétaires pour les mandats de dépense"
      icon="account_balance_wallet"
    >
      <template #actions>
        <q-btn color="primary" icon="add" label="Nouveau Chapitre" @click="openDialog()" />
      </template>
    </PageHeader>

    <!-- Filtres -->
    <FilterBar class="q-mb-md">
      <template #filters>
        <div class="col-12 col-sm-6 col-md-3">
          <q-input v-model="filters.search" filled dense placeholder="Rechercher...">
            <template v-slot:prepend>
              <q-icon name="search" />
            </template>
          </q-input>
        </div>
        <div class="col-12 col-sm-6 col-md-3">
          <q-select
            v-model="filters.actif"
            filled
            dense
            label="Statut"
            :options="statutOptions"
            emit-value
            map-options
            clearable
          />
        </div>
      </template>
    </FilterBar>

    <!-- Table des chapitres -->
    <DataTable
      :rows="filteredChapitres"
      :columns="columns"
      :loading="loading"
      row-key="id"
      @row-click="openDialog"
    >
      <template v-slot:body-cell-code="props">
        <q-td :props="props">
          <q-badge color="primary" :label="props.row.code" />
        </q-td>
      </template>

      <template v-slot:body-cell-actif="props">
        <q-td :props="props">
          <q-badge :color="props.row.actif ? 'positive' : 'negative'">
            {{ props.row.actif ? 'Actif' : 'Inactif' }}
          </q-badge>
        </q-td>
      </template>

      <template v-slot:body-cell-actions="props">
        <q-td :props="props">
          <q-btn flat round dense icon="edit" color="primary" @click.stop="openDialog(props.row)">
            <q-tooltip>Modifier</q-tooltip>
          </q-btn>
          <q-btn
            flat
            round
            dense
            icon="delete"
            color="negative"
            @click.stop="confirmDelete(props.row)"
          >
            <q-tooltip>Supprimer</q-tooltip>
          </q-btn>
        </q-td>
      </template>
    </DataTable>

    <!-- Dialog d'ajout/modification -->
    <q-dialog v-model="dialogVisible" persistent>
      <q-card style="min-width: 500px">
        <q-card-section class="bg-primary text-white">
          <div class="text-h6">{{ isEditing ? 'Modifier' : 'Nouveau' }} Chapitre</div>
        </q-card-section>

        <q-card-section>
          <q-form @submit="saveChaptre" class="q-gutter-md">


            <q-input
              v-model="form.code"
              filled
              label="Code du chapitre *"
              hint="Ex: 6011, 6013, 6020, etc."
              :rules="[(val) => !!val || 'Le code est requis']"
            />

            <q-input
              v-model="form.libelle"
              filled
              label="Libellé *"
              hint="Ex: Achats de matières et fournitures"
              :rules="[(val) => !!val || 'Le libellé est requis']"
            />

            <q-input
              v-model="form.description"
              filled
              type="textarea"
              label="Description"
              rows="3"
              hint="Description détaillée du chapitre"
            />

            <q-toggle v-model="form.actif" label="Chapitre actif" color="positive" />

            <div class="row q-gutter-sm justify-end">
              <q-btn label="Annuler" color="grey-7" flat @click="dialogVisible = false" />
              <q-btn label="Enregistrer" color="primary" type="submit" :loading="saving" />
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
import { db, type Chapitre, type Rubrique } from 'src/database/db';
import PageHeader from 'src/components/PageHeader.vue';
import FilterBar from 'src/components/FilterBar.vue';
import DataTable from 'src/components/DataTable.vue';

const $q = useQuasar();

const loading = ref(false);
const saving = ref(false);
const dialogVisible = ref(false);
const isEditing = ref(false);

const chapitres = ref<Chapitre[]>([]);
const rubriques = ref<Rubrique[]>([]);

const filters = ref({
  search: '',
  actif: null as boolean | null,
});

interface ChapitreForm {
  id?: number;
  code: string;
  libelle: string;
  description: string;
  // rubriqueId: number | null;
  actif: boolean;
}

const form = ref<ChapitreForm>({
  //rubriqueId: null,
  code: '',
  libelle: '',
  description: '',
  actif: true,
});

const statutOptions = [
  { label: 'Actif', value: true },
  { label: 'Inactif', value: false },
];



const columns = [
  { name: 'code', label: 'Code', field: 'code', align: 'left' as const, sortable: true },
  // {
  //   name: 'rubrique',
  //   label: 'Rubrique',
  //   align: 'left' as const,
  //   field: (row: Chapitre) => {
  //     const rubrique = rubriques.value.find((r) => r.id === row.rubriqueId);
  //     return rubrique ? `${rubrique.code} - ${rubrique.libelle}` : '';
  //   },
  //   sortable: true,
  // },
  { name: 'libelle', label: 'Libellé', field: 'libelle', align: 'left' as const, sortable: true },
  {
    name: 'description',
    label: 'Description',
    field: 'description',
    align: 'left' as const,
    sortable: true,
  },
  { name: 'actif', label: 'Statut', field: 'actif', align: 'center' as const, sortable: true },
  { name: 'actions', label: 'Actions', field: 'actions', align: 'center' as const },
];

const filteredChapitres = computed(() => {
  let result = chapitres.value;

  if (filters.value.search) {
    const searchLower = filters.value.search.toLowerCase();
    result = result.filter(
      (c) =>
        c.code.toLowerCase().includes(searchLower) ||
        c.libelle.toLowerCase().includes(searchLower) ||
        c.description?.toLowerCase().includes(searchLower),
    );
  }

  if (filters.value.actif !== null) {
    result = result.filter((c) => c.actif === filters.value.actif);
  }

  return result;
});

async function loadChapitres() {
  loading.value = true;
  try {
    chapitres.value = await db.chapitres.toArray();
    rubriques.value = await db.rubriques.toArray();
  } catch (error) {
    console.error('Erreur lors du chargement des chapitres:', error);
    $q.notify({
      type: 'negative',
      message: 'Erreur lors du chargement des chapitres',
    });
  } finally {
    loading.value = false;
  }
}

function openDialog(chapitre?: Chapitre) {
  if (chapitre?.id) {
    isEditing.value = true;
    form.value = {
      id: chapitre.id,
      code: chapitre.code,
      libelle: chapitre.libelle,
      description: chapitre.description || '',
      actif: chapitre.actif,
    };
  } else {
    isEditing.value = false;
    form.value = {
      code: '',
      libelle: '',
      description: '',
      actif: true,
    };
  }
  dialogVisible.value = true;
}

async function saveChaptre() {
  saving.value = true;
  try {
    const now = new Date();
    const chapitreData: Chapitre = {
      ...form.value,
      code: form.value.code,
      libelle: form.value.libelle,
      actif: form.value.actif,
      mairieId: 1, // À remplacer par l'ID de la mairie connectée
      createdAt: now,
      updatedAt: now,
    };

    if (isEditing.value && form.value.id) {
      await db.chapitres.update(form.value.id, {
        ...chapitreData,
        updatedAt: now,
      });
      $q.notify({
        type: 'positive',
        message: 'Chapitre modifié avec succès',
      });
    } else {
      chapitreData.createdAt = now;
      await db.chapitres.add(chapitreData);
      $q.notify({
        type: 'positive',
        message: 'Chapitre créé avec succès',
      });
    }

    dialogVisible.value = false;
    await loadChapitres();
  } catch (error) {
    console.error('Erreur lors de la sauvegarde:', error);
    $q.notify({
      type: 'negative',
      message: "Erreur lors de l'enregistrement du chapitre",
    });
  } finally {
    saving.value = false;
  }
}

function confirmDelete(chapitre: Chapitre) {
  if (!chapitre.id) {
    $q.notify({
      type: 'negative',
      message: 'Impossible de supprimer ce chapitre (ID manquant)',
    });
    return;
  }

  $q.dialog({
    title: 'Confirmation',
    message: `Voulez-vous vraiment supprimer le chapitre "${chapitre.code} - ${chapitre.libelle}" ?`,
    cancel: true,
    persistent: true,
  }).onOk(() => {
    void (async () => {
      try {
        if (chapitre.id) {
          await db.chapitres.delete(chapitre.id);
          $q.notify({
            type: 'positive',
            message: 'Chapitre supprimé avec succès',
          });
          await loadChapitres();
        }
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        $q.notify({
          type: 'negative',
          message: 'Erreur lors de la suppression du chapitre',
        });
      }
    })();
  });
}

onMounted(() => {
  void loadChapitres();
});
</script>
