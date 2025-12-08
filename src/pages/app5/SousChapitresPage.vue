<template>
  <q-page class="q-pa-md">
    <PageHeader
      title="Sous-Chapitres - Investissements"
      subtitle="Sous-chapitres budgétaires pour les investissements"
      icon="view_list"
    >
      <template #actions>
        <q-btn color="teal" icon="add" label="Nouveau Sous-Chapitre" @click="openDialog()" />
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
            v-model="filters.chapitreId"
            filled
            dense
            label="Chapitre"
            :options="chapitreOptions"
            emit-value
            map-options
            clearable
          />
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

    <!-- Table -->
    <DataTable
      :rows="filteredSousChapitres"
      :columns="columns"
      :loading="loading"
      row-key="id"
      @edit="openDialog"
      @delete="confirmDelete"
    >
      <template v-slot:body-cell-code="props">
        <q-td :props="props">
          <q-badge color="teal-8" :label="props.row.code" />
        </q-td>
      </template>

      <template v-slot:body-cell-chapitre="props">
        <q-td :props="props">
          <span v-if="getChapitreLabel(props.row.chapitreInvestissementId)">
            {{ getChapitreLabel(props.row.chapitreInvestissementId) }}
          </span>
          <span v-else class="text-grey">-</span>
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

    <!-- Dialog -->
    <q-dialog v-model="dialogVisible" persistent>
      <q-card style="min-width: 500px">
        <q-card-section class="bg-teal text-white">
          <div class="text-h6">{{ isEditing ? 'Modifier' : 'Nouveau' }} Sous-Chapitre</div>
        </q-card-section>

        <q-card-section>
          <q-form @submit="saveSousChapitre" class="q-gutter-md">
            <q-select
              v-model="form.chapitreInvestissementId"
              filled
              label="Chapitre parent (optionnel)"
              :options="chapitreOptions"
              emit-value
              map-options
              clearable
            />

            <q-input
              v-model="form.code"
              filled
              label="Code *"
              hint="Ex: 211, 212, 221..."
              :rules="[(val) => !!val || 'Le code est requis']"
            />

            <q-input
              v-model="form.libelle"
              filled
              label="Libellé *"
              :rules="[(val) => !!val || 'Le libellé est requis']"
            />

            <q-input
              v-model="form.description"
              filled
              type="textarea"
              label="Description"
              rows="3"
            />

            <q-toggle v-model="form.actif" label="Actif" color="teal" />

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
import {
  db,
  type SousChapitreInvestissement,
  type ChapitreInvestissement,
  DEFAULT_MAIRIE_ID,
} from 'src/database/db';
import PageHeader from 'src/components/PageHeader.vue';
import FilterBar from 'src/components/FilterBar.vue';
import DataTable from 'src/components/DataTable.vue';

const $q = useQuasar();

const loading = ref(false);
const saving = ref(false);
const dialogVisible = ref(false);
const isEditing = ref(false);

const sousChapitres = ref<SousChapitreInvestissement[]>([]);
const chapitres = ref<ChapitreInvestissement[]>([]);

const filters = ref({
  search: '',
  chapitreId: null as number | null,
  actif: null as boolean | null,
});

interface SousChapitreForm {
  id?: number;
  code: string;
  libelle: string;
  description: string;
  chapitreInvestissementId?: number;
  actif: boolean;
}

const form = ref<SousChapitreForm>({
  code: '',
  libelle: '',
  description: '',
  chapitreInvestissementId: undefined,
  actif: true,
});

const statutOptions = [
  { label: 'Actif', value: true },
  { label: 'Inactif', value: false },
];

const chapitreOptions = computed(() =>
  chapitres.value.map((c) => ({ label: `${c.code} - ${c.libelle}`, value: c.id })),
);

const columns = [
  { name: 'code', label: 'Code', field: 'code', align: 'left' as const, sortable: true },
  {
    name: 'chapitre',
    label: 'Chapitre',
    field: 'chapitreInvestissementId',
    align: 'left' as const,
  },
  { name: 'libelle', label: 'Libellé', field: 'libelle', align: 'left' as const, sortable: true },
  { name: 'description', label: 'Description', field: 'description', align: 'left' as const },
  { name: 'actif', label: 'Statut', field: 'actif', align: 'center' as const, sortable: true },
  { name: 'actions', label: 'Actions', field: 'actions', align: 'center' as const },
];

function getChapitreLabel(id?: number): string {
  if (!id) return '';
  const ch = chapitres.value.find((c) => c.id === id);
  return ch ? `${ch.code} - ${ch.libelle}` : '';
}

const filteredSousChapitres = computed(() => {
  let result = sousChapitres.value;

  if (filters.value.search) {
    const s = filters.value.search.toLowerCase();
    result = result.filter(
      (sc) =>
        sc.code.toLowerCase().includes(s) ||
        sc.libelle.toLowerCase().includes(s) ||
        sc.description?.toLowerCase().includes(s),
    );
  }

  if (filters.value.chapitreId !== null) {
    result = result.filter((sc) => sc.chapitreInvestissementId === filters.value.chapitreId);
  }

  if (filters.value.actif !== null) {
    result = result.filter((sc) => sc.actif === filters.value.actif);
  }

  return result;
});

async function loadData() {
  loading.value = true;
  try {
    chapitres.value = await db.chapitresInvestissement
      .where('mairieId')
      .equals(DEFAULT_MAIRIE_ID)
      .toArray();
    sousChapitres.value = await db.sousChapitresInvestissement
      .where('mairieId')
      .equals(DEFAULT_MAIRIE_ID)
      .toArray();
  } catch (error) {
    console.error('Erreur:', error);
    $q.notify({ type: 'negative', message: 'Erreur lors du chargement' });
  } finally {
    loading.value = false;
  }
}

function openDialog(sousChapitre?: SousChapitreInvestissement) {
  if (sousChapitre?.id) {
    isEditing.value = true;
    form.value = {
      id: sousChapitre.id,
      code: sousChapitre.code,
      libelle: sousChapitre.libelle,
      description: sousChapitre.description || '',
      chapitreInvestissementId: sousChapitre.chapitreInvestissementId,
      actif: sousChapitre.actif,
    };
  } else {
    isEditing.value = false;
    form.value = {
      code: '',
      libelle: '',
      description: '',
      chapitreInvestissementId: undefined,
      actif: true,
    };
  }
  dialogVisible.value = true;
}

async function saveSousChapitre() {
  saving.value = true;
  try {
    const now = new Date();
    const chapitreId = form.value.chapitreInvestissementId;
    if (typeof chapitreId !== 'number') {
      $q.notify({ type: 'negative', message: 'Veuillez sélectionner un chapitre' });
      saving.value = false;
      return;
    }

    const baseData: Pick<
      SousChapitreInvestissement,
      'code' | 'libelle' | 'chapitreInvestissementId' | 'actif'
    > = {
      code: form.value.code,
      libelle: form.value.libelle,
      chapitreInvestissementId: chapitreId,
      actif: form.value.actif,
    };

    if (isEditing.value && form.value.id) {
      await db.sousChapitresInvestissement.update(form.value.id, {
        ...baseData,
        ...(form.value.description ? { description: form.value.description } : {}),
        updatedAt: now,
      });
      $q.notify({ type: 'positive', message: 'Sous-chapitre modifié' });
    } else {
      await db.sousChapitresInvestissement.add({
        ...baseData,
        ...(form.value.description ? { description: form.value.description } : {}),
        mairieId: DEFAULT_MAIRIE_ID,
        createdAt: now,
        updatedAt: now,
      });
      $q.notify({ type: 'positive', message: 'Sous-chapitre créé' });
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

function confirmDelete(sousChapitre: SousChapitreInvestissement) {
  if (!sousChapitre.id) return;

  $q.dialog({
    title: 'Confirmation',
    message: `Supprimer le sous-chapitre "${sousChapitre.code}" ?`,
    cancel: true,
    persistent: true,
  }).onOk(() => {
    void (async () => {
      try {
        if (sousChapitre.id) {
          const relatedMandats = await db.mandatsInvestissement
            .where({ sousChapitreInvestissementId: sousChapitre.id })
            .count();

          if (relatedMandats > 0) {
            $q.notify({
              type: 'negative',
              message: 'Impossible de supprimer : utilisé par des mandats.',
            });
            return;
          }

          await db.sousChapitresInvestissement.delete(sousChapitre.id);
          $q.notify({ type: 'positive', message: 'Sous-chapitre supprimé' });
          await loadData();
        }
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
