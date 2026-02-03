<template>
  <q-page class="q-pa-md">
    <PageHeader
      title="Gestion des Comptes Fonctionnels"
      subtitle="Comptes fonctionnels pour les mandats de dépense"
      icon="account_balance_wallet"
    >
      <template #actions>
        <q-btn
          color="primary"
          icon="add"
          label="Nouveau Compte Fonctionnel"
          @click="openDialog()"
        />
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

    <!-- Table des sous-chapitres -->
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
          <q-badge color="primary" text-color="white" :label="props.row.code" />
        </q-td>
      </template>

      <template v-slot:body-cell-parent="props">
        <q-td :props="props">
          <q-badge v-if="props.row.parentId" color="primary" text-color="white">
            {{ getParentCode(props.row.parentId) }}
          </q-badge>
          <span v-else class="text-grey-5">-</span>
        </q-td>
      </template>

      <template v-slot:body-cell-actif="props">
        <q-td :props="props">
          <q-badge :color="props.row.actif ? 'primary' : 'negative'" text-color="white">
            {{ props.row.actif ? 'Actif' : 'Inactif' }}
          </q-badge>
        </q-td>
      </template>
    </DataTable>

    <!-- Dialog d'ajout/modification -->
    <q-dialog v-model="dialogVisible" persistent>
      <q-card style="min-width: 500px">
        <q-card-section class="accent-left">
          <div class="text-h6">{{ isEditing ? 'Modifier' : 'Nouveau' }} Compte Fonctionnel</div>
        </q-card-section>

        <q-card-section>
          <q-form @submit="saveSousChapitre" class="q-gutter-md">
            <q-input
              v-model="form.code"
              filled
              label="Code du compte fonctionnel *"
              hint="Ex: 6000, 60010, 60011, etc."
              :rules="[(val) => !!val || 'Le code est requis']"
            />

            <q-input
              v-model="form.libelle"
              filled
              label="Libellé *"
              hint="Ex: ADMINISTRATION"
              :rules="[(val) => !!val || 'Le libellé est requis']"
            />

            <q-select
              v-model="form.parentId"
              :options="parentOptions"
              filled
              label="Parent (Optionnel)"
              hint="Sélectionnez le compte fonctionnel parent"
              option-value="id"
              option-label="label"
              emit-value
              map-options
              clearable
              use-input
              input-debounce="0"
              @filter="filterParents"
            >
              <template v-slot:option="scope">
                <q-item v-bind="scope.itemProps">
                  <q-item-section>
                    <q-item-label>{{ scope.opt.code }} - {{ scope.opt.libelle }}</q-item-label>
                  </q-item-section>
                </q-item>
              </template>
            </q-select>

            <q-input
              v-model="form.description"
              filled
              type="textarea"
              label="Description"
              rows="3"
              hint="Description détaillée du compte fonctionnel"
            />

            <q-toggle v-model="form.actif" label="Compte fonctionnel actif" color="positive" />

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
import { db, type SousChapitre } from 'src/database/db';
import PageHeader from 'src/components/PageHeader.vue';
import FilterBar from 'src/components/FilterBar.vue';
import DataTable from 'src/components/DataTable.vue';

const $q = useQuasar();

const loading = ref(false);
const saving = ref(false);
const dialogVisible = ref(false);
const isEditing = ref(false);

const sousChapitres = ref<SousChapitre[]>([]);

const filters = ref({
  search: '',
  actif: null as boolean | null,
});

interface SousChapitreForm {
  id?: number;
  code: string;
  libelle: string;
  description: string;
  parentId?: number;
  actif: boolean;
}

interface ParentOption {
  id?: number;
  code: string;
  libelle: string;
  label: string;
}

const form = ref<SousChapitreForm>({
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
  { name: 'parent', label: 'Parent', field: 'parentId', align: 'left' as const, sortable: true },
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

const filteredSousChapitres = computed(() => {
  let result = sousChapitres.value;

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

  // Trier par code pour afficher la hiérarchie naturellement
  return result.sort((a, b) => a.code.localeCompare(b.code));
});

function getParentCode(parentId: number) {
  const parent = sousChapitres.value.find((sc) => sc.id === parentId);
  return parent ? `${parent.code} - ${parent.libelle}` : parentId;
}

const allParentOptions = computed(() => {
  return sousChapitres.value.map((sc) => {
    const option: ParentOption = {
      code: sc.code,
      libelle: sc.libelle,
      label: `${sc.code} - ${sc.libelle}`,
    };
    if (sc.id !== undefined) {
      option.id = sc.id;
    }
    return option;
  });
});

const parentOptions = ref<ParentOption[]>([]);

function filterParents(val: string, update: (fn: () => void) => void) {
  if (val === '') {
    update(() => {
      parentOptions.value = allParentOptions.value.filter(
        // Exclure soi-même si modification
        (p) => !isEditing.value || p.id !== form.value.id,
      );
    });
    return;
  }

  update(() => {
    const needle = val.toLowerCase();
    parentOptions.value = allParentOptions.value.filter(
      (v) =>
        (!isEditing.value || v.id !== form.value.id) && v.label.toLowerCase().indexOf(needle) > -1,
    );
  });
}

async function loadSousChapitres() {
  loading.value = true;
  try {
    sousChapitres.value = await db.sousChapitres.toArray();
  } catch (error) {
    console.error('Erreur lors du chargement des sous-chapitres:', error);
    $q.notify({
      type: 'negative',
      message: 'Erreur lors du chargement des sous-chapitres',
    });
  } finally {
    loading.value = false;
  }
}

function openDialog(sousChapitre?: SousChapitre) {
  if (sousChapitre?.id) {
    isEditing.value = true;
    form.value = {
      id: sousChapitre.id,
      code: sousChapitre.code,
      libelle: sousChapitre.libelle,
      description: sousChapitre.description || '',
      actif: sousChapitre.actif,
    };
    if (sousChapitre.parentId !== undefined) {
      form.value.parentId = sousChapitre.parentId;
    }
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

async function saveSousChapitre() {
  saving.value = true;
  try {
    const now = new Date();
    const sousChapitreData: SousChapitre = {
      ...form.value,
      code: form.value.code,
      libelle: form.value.libelle,
      actif: form.value.actif,
      mairieId: 1, // À remplacer par l'ID de la mairie connectée
      createdAt: now,
      updatedAt: now,
    };

    if (isEditing.value && form.value.id) {
      await db.sousChapitres.update(form.value.id, {
        ...sousChapitreData,
        updatedAt: now,
      });
      $q.notify({
        type: 'positive',
        message: 'Sous-chapitre modifié avec succès',
      });
    } else {
      sousChapitreData.createdAt = now;
      await db.sousChapitres.add(sousChapitreData);
      $q.notify({
        type: 'positive',
        message: 'Sous-chapitre créé avec succès',
      });
    }

    dialogVisible.value = false;
    await loadSousChapitres();
  } catch (error) {
    console.error('Erreur lors de la sauvegarde:', error);
    $q.notify({
      type: 'negative',
      message: "Erreur lors de l'enregistrement du sous-chapitre",
    });
  } finally {
    saving.value = false;
  }
}

function confirmDelete(sousChapitre: SousChapitre) {
  if (!sousChapitre.id) {
    $q.notify({
      type: 'negative',
      message: 'Impossible de supprimer ce sous-chapitre (ID manquant)',
    });
    return;
  }

  $q.dialog({
    title: 'Confirmation',
    message: `Voulez-vous vraiment supprimer le sous-chapitre "${sousChapitre.code} - ${sousChapitre.libelle}" ?`,
    cancel: true,
    persistent: true,
  }).onOk(() => {
    void (async () => {
      try {
        if (sousChapitre.id) {
          // Vérifier les dépendances dans les mandats
          const relatedMandats = await db.mandats
            .where({ sousChapitreId: sousChapitre.id })
            .count();

          if (relatedMandats > 0) {
            console.log(`Suppression bloquée: ${relatedMandats} mandats associés.`);
            $q.notify({
              type: 'negative',
              message:
                'Impossible de supprimer ce sous-chapitre car il est utilisé par des mandats.',
              caption: `Mandats: ${relatedMandats}`,
              timeout: 5000,
            });
            return;
          }

          await db.sousChapitres.delete(sousChapitre.id);
          $q.notify({
            type: 'positive',
            message: 'Sous-chapitre supprimé avec succès',
          });
          await loadSousChapitres();
        }
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        $q.notify({
          type: 'negative',
          message: 'Erreur lors de la suppression du sous-chapitre',
        });
      }
    })();
  });
}

onMounted(() => {
  void loadSousChapitres();
});
</script>
