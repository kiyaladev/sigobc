<template>
  <q-page class="q-pa-md">
    <div class="row q-mb-md justify-between items-center">
      <div class="text-h5">Gestion des Versements</div>
      <q-btn color="accent" icon="add" label="Nouveau Versement" @click="openDialog()" />
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
              :options="['Versement']"
              clearable
            />
          </div>
          <div class="col-12 col-sm-6 col-md-4">
            <q-input v-model="filterDate" filled dense type="date" label="Date" clearable />
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Table des versements -->
    <q-card>
      <q-table
        :rows="filteredVersements"
        :columns="columns"
        row-key="id"
        :loading="loading"
        :pagination="{ rowsPerPage: 10 }"
        binary-state-sort
      >
        <template v-slot:body-cell-type="props">
          <q-td :props="props">
            <q-badge color="accent" :label="props.row.type" />
          </q-td>
        </template>

        <template v-slot:body-cell-details="props">
          <q-td :props="props">
            <div class="row q-gutter-xs">
              <div v-for="(value, key) in props.row.timbres" :key="key">
                <q-chip v-if="value > 0" dense color="accent" text-color="white">
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
              color="accent"
              @click="viewDetails(props.row)"
            >
              <q-tooltip>Voir détails</q-tooltip>
            </q-btn>
            <q-btn flat round dense icon="edit" color="accent" @click="openDialog(props.row)">
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
        <q-card-section class="bg-accent text-white">
          <div class="text-h6">{{ isEditing ? 'Modifier' : 'Ajouter un' }} Versement</div>
        </q-card-section>

        <q-card-section>
          <q-form @submit="onSubmit" class="q-gutter-md">
            <div class="row q-col-gutter-md">
              <div class="col-12 col-sm-6">
                <q-select
                  v-model="form.type"
                  filled
                  label="Type d'opération *"
                  :options="['Versement']"
                  lazy-rules
                  :rules="[(val) => !!val || 'Le type est requis']"
                />
              </div>

              <div class="col-12 col-sm-6">
                <q-input
                  v-model="form.date"
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
                      v-model.number="form.timbres[valeur]"
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
                <q-card flat bordered class="bg-teal-1">
                  <q-card-section>
                    <div class="row items-center justify-between">
                      <div class="col">
                        <div class="text-subtitle2 text-grey-7">Total</div>
                      </div>
                      <div class="col-auto">
                        <div class="text-h6 text-accent">{{ formatMontant(form.total) }}</div>
                      </div>
                    </div>
                  </q-card-section>
                </q-card>
              </div>

              <!-- Commentaires -->
              <div class="col-12">
                <q-input
                  v-model="form.commentaires"
                  filled
                  type="textarea"
                  label="Commentaires"
                  rows="3"
                />
              </div>
            </div>

            <div class="row q-gutter-sm justify-end">
              <q-btn label="Fermer" color="grey-7" flat @click="dialogVisible = false" />
              <q-btn label="OK" color="accent" type="submit" :loading="saving" />
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

interface Timbres {
  [key: number]: number;
}

interface Versement {
  id?: number;
  type: string;
  date: string;
  timbres: Timbres;
  total: number;
  commentaires: string;
}

const $q = useQuasar();

const valeursTimbre = [100, 200, 300, 500, 600, 1000];

const search = ref('');
const filterType = ref<string | null>(null);
const filterDate = ref<string | null>(null);
const loading = ref(false);
const saving = ref(false);
const dialogVisible = ref(false);
const isEditing = ref(false);

const versements = ref<Versement[]>([
  {
    id: 1,
    type: 'Versement',
    date: '2025-11-07',
    timbres: { 100: 300, 200: 200, 300: 150, 500: 100, 600: 80, 1000: 50 },
    total: 315000,
    commentaires: 'Versement journalier - Matin',
  },
  {
    id: 2,
    type: 'Versement',
    date: '2025-11-06',
    timbres: { 100: 250, 200: 180, 300: 120, 500: 80, 600: 60, 1000: 40 },
    total: 255000,
    commentaires: 'Versement journalier - Soir',
  },
]);

const form = ref<Versement>({
  type: 'Versement',
  date: new Date().toISOString().split('T')[0] as string,
  timbres: {
    100: 0,
    200: 0,
    300: 0,
    500: 0,
    600: 0,
    1000: 0,
  },
  total: 0,
  commentaires: '',
});

const columns = [
  { name: 'date', label: 'Date', field: 'date', align: 'left' as const, sortable: true },
  { name: 'type', label: 'Type', field: 'type', align: 'left' as const, sortable: true },
  { name: 'details', label: 'Détails', field: 'timbres', align: 'left' as const },
  { name: 'total', label: 'Total', field: 'total', align: 'right' as const, sortable: true },
  { name: 'actions', label: 'Actions', field: 'actions', align: 'center' as const },
];

const filteredVersements = computed(() => {
  let result = versements.value;

  if (search.value) {
    const searchLower = search.value.toLowerCase();
    result = result.filter(
      (v) =>
        v.type.toLowerCase().includes(searchLower) ||
        v.commentaires.toLowerCase().includes(searchLower),
    );
  }

  if (filterType.value) {
    result = result.filter((v) => v.type === filterType.value);
  }

  if (filterDate.value) {
    result = result.filter((v) => v.date === filterDate.value);
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

const calculateTotal = () => {
  let total = 0;
  for (const valeur of valeursTimbre) {
    const quantite = form.value.timbres[valeur] || 0;
    total += valeur * quantite;
  }
  form.value.total = total;
};

const openDialog = (versement?: Versement) => {
  if (versement) {
    isEditing.value = true;
    form.value = { ...versement };
  } else {
    isEditing.value = false;
    form.value = {
      type: 'Versement',
      date: new Date().toISOString().split('T')[0] as string,
      timbres: {
        100: 0,
        200: 0,
        300: 0,
        500: 0,
        600: 0,
        1000: 0,
      },
      total: 0,
      commentaires: '',
    };
  }
  dialogVisible.value = true;
};

const onSubmit = async () => {
  saving.value = true;
  try {
    await new Promise((resolve) => setTimeout(resolve, 500));

    if (isEditing.value) {
      const index = versements.value.findIndex((v) => v.id === form.value.id);
      if (index !== -1) {
        versements.value[index] = { ...form.value };
      }
      $q.notify({
        type: 'positive',
        message: 'Versement modifié avec succès',
      });
    } else {
      const newId = Math.max(...versements.value.map((v) => v.id || 0)) + 1;
      versements.value.unshift({ ...form.value, id: newId });
      $q.notify({
        type: 'positive',
        message: 'Versement ajouté avec succès',
      });
    }

    dialogVisible.value = false;
  } catch {
    $q.notify({
      type: 'negative',
      message: "Erreur lors de l'enregistrement",
    });
  } finally {
    saving.value = false;
  }
};

const viewDetails = (versement: Versement) => {
  $q.dialog({
    title: 'Détails du versement',
    message: `
      Date: ${versement.date}
      Type: ${versement.type}
      Total: ${formatMontant(versement.total)}
      Commentaires: ${versement.commentaires}
    `,
    html: true,
  });
};

const confirmDelete = (versement: Versement) => {
  $q.dialog({
    title: 'Confirmation',
    message: 'Êtes-vous sûr de vouloir supprimer ce versement ?',
    cancel: true,
    persistent: true,
  }).onOk(() => {
    const index = versements.value.findIndex((v) => v.id === versement.id);
    if (index !== -1) {
      versements.value.splice(index, 1);
      $q.notify({
        type: 'positive',
        message: 'Versement supprimé avec succès',
      });
    }
  });
};

onMounted(() => {
  // Charger les données depuis la base de données
});
</script>
