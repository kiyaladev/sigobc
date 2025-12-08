<template>
  <q-page class="q-pa-md">
    <PageHeader
      title="Chapitres Budgétaires - Investissements"
      subtitle="Chapitres budgétaires pour les mandats d'investissement"
      icon="account_balance"
    >
      <template #actions>
        <q-btn color="teal" icon="add" label="Nouveau Chapitre" @click="openDialog()" />
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
      @edit="openDialog"
      @delete="confirmDelete"
    >
      <template v-slot:body-cell-code="props">
        <q-td :props="props">
          <q-badge color="teal" :label="props.row.code" />
        </q-td>
      </template>

      <template v-slot:body-cell-actif="props">
        <q-td :props="props">
          <q-badge :color="props.row.actif ? 'positive' : 'negative'">
            {{ props.row.actif ? 'Actif' : 'Inactif' }}
          </q-badge>
        </q-td>
      </template>
    </DataTable>

    <!-- Dialog d'ajout/modification -->
    <q-dialog v-model="dialogVisible" persistent>
      <q-card style="min-width: 500px">
        <q-card-section class="bg-teal text-white">
          <div class="text-h6">
            {{ isEditing ? 'Modifier' : 'Nouveau' }} Chapitre Investissement
          </div>
        </q-card-section>

        <q-card-section>
          <q-form @submit="saveChapitre" class="q-gutter-md">
            <q-input
              v-model="form.code"
              filled
              label="Code du chapitre *"
              hint="Ex: 21, 22, 23..."
              :rules="[(val) => !!val || 'Le code est requis']"
            />

            <q-input
              v-model="form.libelle"
              filled
              label="Libellé *"
              hint="Ex: Immobilisations corporelles"
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

            <q-toggle v-model="form.actif" label="Chapitre actif" color="teal" />

            <div class="row q-gutter-sm justify-end">
              <q-btn label="Annuler" color="grey-7" flat @click="dialogVisible = false" />
              <q-btn label="Enregistrer" color="teal" type="submit" :loading="saving" />
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
import { db, type ChapitreInvestissement, DEFAULT_MAIRIE_ID } from 'src/database/db';
import PageHeader from 'src/components/PageHeader.vue';
import FilterBar from 'src/components/FilterBar.vue';
import DataTable from 'src/components/DataTable.vue';

const $q = useQuasar();

const loading = ref(false);
const saving = ref(false);
const dialogVisible = ref(false);
const isEditing = ref(false);

const chapitres = ref<ChapitreInvestissement[]>([]);

const filters = ref({
  search: '',
  actif: null as boolean | null,
});

interface ChapitreForm {
  id?: number;
  code: string;
  libelle: string;
  description: string;
  actif: boolean;
}

const form = ref<ChapitreForm>({
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
    chapitres.value = await db.chapitresInvestissement
      .where('mairieId')
      .equals(DEFAULT_MAIRIE_ID)
      .toArray();
  } catch (error) {
    console.error('Erreur lors du chargement des chapitres:', error);
    $q.notify({ type: 'negative', message: 'Erreur lors du chargement des chapitres' });
  } finally {
    loading.value = false;
  }
}

function openDialog(chapitre?: ChapitreInvestissement) {
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
    form.value = { code: '', libelle: '', description: '', actif: true };
  }
  dialogVisible.value = true;
}

async function saveChapitre() {
  saving.value = true;
  try {
    const now = new Date();
    const chapitreData: ChapitreInvestissement = {
      code: form.value.code,
      libelle: form.value.libelle,
      description: form.value.description,
      actif: form.value.actif,
      mairieId: DEFAULT_MAIRIE_ID,
      createdAt: now,
      updatedAt: now,
    };

    if (isEditing.value && form.value.id) {
      await db.chapitresInvestissement.update(form.value.id, { ...chapitreData, updatedAt: now });
      $q.notify({ type: 'positive', message: 'Chapitre modifié avec succès' });
    } else {
      await db.chapitresInvestissement.add(chapitreData);
      $q.notify({ type: 'positive', message: 'Chapitre créé avec succès' });
    }

    dialogVisible.value = false;
    await loadChapitres();
  } catch (error) {
    console.error('Erreur lors de la sauvegarde:', error);
    $q.notify({ type: 'negative', message: "Erreur lors de l'enregistrement" });
  } finally {
    saving.value = false;
  }
}

function confirmDelete(chapitre: ChapitreInvestissement) {
  if (!chapitre.id) return;

  $q.dialog({
    title: 'Confirmation',
    message: `Supprimer le chapitre "${chapitre.code} - ${chapitre.libelle}" ?`,
    cancel: true,
    persistent: true,
  }).onOk(() => {
    void (async () => {
      try {
        if (chapitre.id) {
          const relatedPrevisions = await db.previsionsInvestissement
            .where({ chapitreInvestissementId: chapitre.id })
            .count();
          const relatedMandats = await db.mandatsInvestissement
            .where({ chapitreInvestissementId: chapitre.id })
            .count();

          if (relatedPrevisions > 0 || relatedMandats > 0) {
            $q.notify({
              type: 'negative',
              message: 'Impossible de supprimer : chapitre utilisé par des prévisions ou mandats.',
              caption: `Prévisions: ${relatedPrevisions}, Mandats: ${relatedMandats}`,
            });
            return;
          }

          await db.chapitresInvestissement.delete(chapitre.id);
          $q.notify({ type: 'positive', message: 'Chapitre supprimé' });
          await loadChapitres();
        }
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        $q.notify({ type: 'negative', message: 'Erreur lors de la suppression' });
      }
    })();
  });
}

onMounted(() => {
  void loadChapitres();
});
</script>
