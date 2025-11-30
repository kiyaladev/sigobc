<template>
  <q-page class="q-pa-md">
    <div class="row q-mb-md">
      <div class="col">
        <div class="text-h5">Approvisionnement</div>
        <div class="text-caption text-grey-7 q-mt-xs">
          <q-icon name="info" size="16px" color="grey-7" />
          L'imprimerie envoie des valeurs au trésor
          <span class="text-positive text-weight-bold">(+ Augmente le stock du trésor - Section 1)</span>
        </div>
      </div>
      <div class="col-auto">
        <q-btn color="primary" icon="add_box" label="Nouvel Approvisionnement" @click="openDialog()" />
      </div>
    </div>

    <!-- Recherche et filtres -->
    <q-card class="q-mb-md">
      <q-card-section>
        <div class="row q-col-gutter-md">
          <div class="col-12 col-sm-6 col-md-4">
            <q-input v-model="search" filled placeholder="Rechercher..." dense clearable>
              <template v-slot:prepend>
                <q-icon name="search" />
              </template>
            </q-input>
          </div>
          <div class="col-12 col-sm-6 col-md-4">
            <q-select
              v-model="filterType"
              filled
              dense
              label="Type d'opération"
              :options="typeOptions"
              clearable
            />
          </div>
          <div class="col-12 col-sm-6 col-md-4">
            <q-input v-model="filterDate" filled dense type="date" label="Date" clearable />
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Table des approvisionnements -->
    <q-card>
      <q-table
        :rows="filteredAppros"
        :columns="columns"
        row-key="id"
        :loading="loading"
        :pagination="{ rowsPerPage: 10 }"
        binary-state-sort
      >
        <template v-slot:body-cell-date="props">
          <q-td :props="props">
            {{ new Date(props.row.date).toLocaleDateString('fr-FR', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit'
            }) }}
          </q-td>
        </template>

        <template v-slot:body-cell-type="props">
          <q-td :props="props">
            <q-badge color="positive" :label="props.row.type" />
          </q-td>
        </template>

        <template v-slot:body-cell-details="props">
          <q-td :props="props">
            <div class="row q-gutter-xs">
              <div v-for="(value, key) in props.row.timbres" :key="key">
                <q-chip v-if="value > 0" dense color="positive" text-color="white">
                  {{ key }}: {{ value }}
                </q-chip>
              </div>
            </div>
          </q-td>
        </template>

        <template v-slot:body-cell-total="props">
          <q-td :props="props">
            <strong>{{ formatMontant(props.row.total) }}</strong>
          </q-td>
        </template>

        <template v-slot:body-cell-actions="props">
          <q-td :props="props">
            <q-btn
              flat
              round
              dense
              icon="visibility"
              color="grey-7"
              @click="viewDetails(props.row)"
            >
              <q-tooltip>Voir détails</q-tooltip>
            </q-btn>
            <q-btn flat round dense icon="edit" color="grey-7" @click="openDialog(props.row)">
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
        <q-card-section>
          <div class="text-h6">{{ isEditing ? 'Modifier' : 'Ajouter des' }} Approvisionnements</div>
        </q-card-section>

        <q-card-section>
          <q-form @submit="onSubmit" class="q-gutter-md">
            <div class="row q-col-gutter-md">


              <div class="col-12 col-sm-4">
                <q-input
                  v-model.number="form.exercice"
                  filled
                  type="number"
                  label="Exercice"
                  min="0"
                  dense
                />
              </div>

              <div class="col-12 col-sm-4">
                <q-select
                  v-model="form.type"
                  filled
                  label="Type d'opération *"
                  :options="typeOptions"
                  lazy-rules
                  :rules="[(val) => !!val || 'Le type est requis']"
                />
              </div>

              <div class="col-12 col-sm-4">
                <q-input
                  :model-value="form.date ? new Date(form.date).toISOString().split('T')[0] : ''"
                  @update:model-value="(val: string | number | null) => {
                    if (val && typeof val === 'string') {
                      form.date = new Date(val);
                    }
                  }"
                  filled
                  type="date"
                  label="Date d'opération *"
                  lazy-rules
                  :rules="[(val) => !!val || 'La date est requise']"
                />
              </div>

              <!-- Quantités de timbres -->
              <div class="col-12">
                <div class="text-subtitle1 text-weight-medium q-mb-sm">
                  Quantités par valeur de timbre
                </div>
                <div class="row q-col-gutter-sm">
                  <div
                    class="col-6 col-sm-4 col-md-2"
                    v-for="valeur in valeursTimbre"
                    :key="valeur"
                  >
                    <q-input
                      v-model.number="form.timbres![valeur]"
                      filled
                      type="number"
                      :label="`t_${valeur}`"
                      min="0"
                      dense
                      @update:model-value="calculateTotal"
                    >
                      <template v-slot:prepend>
                        <q-icon name="confirmation_number" />
                      </template>
                    </q-input>
                  </div>
                </div>
              </div>

              <!-- Total calculé -->
              <div class="col-12">
                <q-card flat bordered>
                  <q-card-section class="accent-left">
                    <div class="row items-center justify-between">
                      <div class="col">
                        <div class="text-subtitle2 text-grey-7">Total</div>
                      </div>
                      <div class="col-auto">
                        <div class="text-h6">{{ formatMontant(form.total || 0) }}</div>
                      </div>
                    </div>
                  </q-card-section>
                </q-card>
              </div>



              <!-- Observations -->
              <div class="col-12">
                <q-input
                  v-model="form.observations"
                  filled
                  type="textarea"
                  label="Observations"
                  rows="3"
                />
              </div>
            </div>

            <div class="row q-gutter-sm justify-end">
              <q-btn label="Fermer" color="grey-7" flat @click="dialogVisible = false" />
              <q-btn label="OK" color="primary" type="submit" :loading="saving" />
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
import { db, type Approvisionnement } from 'src/database/db';

const $q = useQuasar();

const valeursTimbre = [100, 200, 300, 500, 600, 1000];
const typeOptions = ['approvisionnement'];

const search = ref('');
const filterType = ref<string | null>(null);
const filterDate = ref<string | null>(null);
const loading = ref(false);
const saving = ref(false);
const dialogVisible = ref(false);
const isEditing = ref(false);
const editingId = ref<number | undefined>(undefined);

const approvisionnements = ref<Approvisionnement[]>([]);

const form = ref<Partial<Approvisionnement>>({
  type: 'approvisionnement',
  date: new Date(),
  timbres: {
    100: 0,
    200: 0,
    300: 0,
    500: 0,
    600: 0,
    1000: 0,
  },
  total: 0,
  exercice: new Date().getFullYear(),
  observations: '',
});

const columns = [
  { name: 'date', label: 'Date', field: 'date', align: 'left' as const, sortable: true },
  { name: 'type', label: 'Type', field: 'type', align: 'left' as const, sortable: true },
  { name: 'details', label: 'Détails', field: 'timbres', align: 'left' as const },
  { name: 'total', label: 'Total', field: 'total', align: 'right' as const, sortable: true },
  { name: 'actions', label: 'Actions', field: 'actions', align: 'center' as const },
];

// Charger les données depuis la base
async function loadData() {
  loading.value = true;
  try {
    approvisionnements.value = await db.approvisionnements.toArray();
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

const filteredAppros = computed(() => {
  let result = approvisionnements.value;

  if (search.value) {
    const searchLower = search.value.toLowerCase();
    result = result.filter(
      (a) =>
        a.type.toLowerCase().includes(searchLower) ||
        (a.observations && a.observations.toLowerCase().includes(searchLower)),
    );
  }

  if (filterType.value) {
    result = result.filter((a) => a.type === filterType.value);
  }

  if (filterDate.value) {
    const filterDateStr = new Date(filterDate.value).toISOString().split('T')[0];
    result = result.filter((a) => {
      const dateStr = new Date(a.date).toISOString().split('T')[0];
      return dateStr === filterDateStr;
    });
  }

  return result;
});

const formatMontant = (montant: number) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    minimumFractionDigits: 0,
  }).format(montant);
};

//

const calculateTotal = () => {
  let total = 0;
  if (form.value.timbres) {
    for (const valeur of valeursTimbre) {
      const quantite = form.value.timbres[valeur] || 0;
      total += valeur * quantite;
    }
  }
  form.value.total = total;
};

const openDialog = (appro?: Approvisionnement) => {
  if (appro && appro.id) {
    isEditing.value = true;
    editingId.value = appro.id;
    // Cloner proprement l'objet avec de nouvelles instances de Date
    form.value = {
      ...appro,
      date: new Date(appro.date),
      timbres: { ...appro.timbres },
    };
  } else {
    isEditing.value = false;
    editingId.value = undefined;
    form.value = {
      type: 'approvisionnement',
      date: new Date(),
      timbres: {
        100: 0,
        200: 0,
        300: 0,
        500: 0,
        600: 0,
        1000: 0,
      },
      total: 0,
      exercice: new Date().getFullYear(),
      observations: '',
    };
  }
  dialogVisible.value = true;
};

const onSubmit = async () => {
  saving.value = true;
  try {
    const now = new Date();
    const mairieId = 1; // À adapter selon l'utilisateur connecté
    const personnelId = 1; // À adapter selon l'utilisateur connecté

    // S'assurer que la date est un nouvel objet Date pour éviter les problèmes de clonage
    const dateValue = form.value.date ? new Date(form.value.date) : now;

    const data = {
      mairieId,
      exercice: form.value.exercice || new Date().getFullYear(),
      date: dateValue,
      type: form.value.type || 'initial',
      timbres: { ...form.value.timbres! }, // Cloner l'objet timbres
      total: form.value.total || 0,
      observations: form.value.observations || '',
      personnelId,
      createdAt: now,
      updatedAt: now,
    };

    if (isEditing.value && editingId.value) {
      await db.approvisionnements.update(editingId.value, {
        ...data,
        updatedAt: now,
      });
      $q.notify({
        type: 'positive',
        message: 'Approvisionnement modifié avec succès',
      });
    } else {
      await db.approvisionnements.add(data);
      $q.notify({
        type: 'positive',
        message: 'Approvisionnement ajouté avec succès',
      });
    }

    dialogVisible.value = false;
    await loadData();
  } catch (error) {
    console.error('Erreur:', error);
    $q.notify({
      type: 'negative',
      message: "Erreur lors de l'enregistrement",
    });
  } finally {
    saving.value = false;
  }
};

const confirmDelete = (appro: Approvisionnement) => {
  $q.dialog({
    title: 'Confirmation',
    message: 'Êtes-vous sûr de vouloir supprimer cet approvisionnement ?',
    cancel: true,
    persistent: true,
  }).onOk(() => {
    void (async () => {
      try {
        if (appro.id) {
          await db.approvisionnements.delete(appro.id);
          $q.notify({
            type: 'positive',
            message: 'Approvisionnement supprimé avec succès',
          });
          await loadData();
        }
      } catch (error) {
        console.error('Erreur:', error);
        $q.notify({
          type: 'negative',
          message: 'Erreur lors de la suppression',
        });
      }
    })();
  });
};

const viewDetails = (appro: Approvisionnement) => {
  openDialog(appro);
};

onMounted(() => {
  void loadData();
});
</script>
