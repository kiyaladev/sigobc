<template>
  <q-page class="q-pa-md">
    <div class="row q-mb-md">
      <div class="col">
        <div class="text-h5">Gestion des Remises</div>
        <div class="text-caption text-grey-7 q-mt-xs">
          <q-icon name="info" size="16px" color="positive" />
          Envoi de timbres par l'imprimerie nationale
          <span class="text-positive text-weight-bold">(+ Augmente le stock)</span>
        </div>
      </div>
      <div class="col-auto">
        <q-btn color="positive" icon="add_box" label="Nouvelle Remise" @click="openDialog()" />
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
              :options="['Remise']"
              clearable
            />
          </div>
          <div class="col-12 col-sm-6 col-md-4">
            <q-input v-model="filterDate" filled dense type="date" label="Date" clearable />
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Table des remises -->
    <q-card>
      <q-table
        :rows="filteredRemises"
        :columns="columns"
        row-key="id"
        :loading="loading"
        :pagination="{ rowsPerPage: 10 }"
        binary-state-sort
      >
        <template v-slot:body-cell-type="props">
          <q-td :props="props">
            <q-badge color="positive" :label="props.row.type">
              <q-icon name="add" size="xs" class="q-ml-xs" />
            </q-badge>
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
              color="positive"
              @click="viewDetails(props.row)"
            >
              <q-tooltip>Voir détails</q-tooltip>
            </q-btn>
            <q-btn flat round dense icon="edit" color="positive" @click="openDialog(props.row)">
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
        <q-card-section class="bg-positive text-white">
          <div class="text-h6">
            <q-icon name="add_box" class="q-mr-sm" />
            {{ isEditing ? 'Modifier' : 'Ajouter une' }} Remise
          </div>
          <div class="text-caption">Envoi de timbres - Augmente le stock</div>
        </q-card-section>

        <q-card-section>
          <q-form @submit="onSubmit" class="q-gutter-md">
            <div class="row q-col-gutter-md">
              <div class="col-12 col-sm-6">
                <q-select
                  v-model="form.type"
                  filled
                  label="Type d'opération *"
                  :options="['Remise']"
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
                <q-card flat bordered class="bg-green-1">
                  <q-card-section>
                    <div class="row items-center justify-between">
                      <div class="col">
                        <div class="text-subtitle2 text-grey-7">Total (+ Stock)</div>
                      </div>
                      <div class="col-auto">
                        <div class="text-h6 text-positive">{{ formatMontant(form.total) }}</div>
                      </div>
                    </div>
                  </q-card-section>
                </q-card>
              </div>

              <!-- EXO (Exonération) -->
              <div class="col-12">
                <q-input
                  v-model.number="form.exo"
                  filled
                  type="number"
                  label="EXO (Exonération)"
                  min="0"
                  dense
                />
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
              <q-btn label="OK" color="positive" type="submit" :loading="saving" />
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

interface Remise {
  id?: number;
  type: string;
  date: string;
  timbres: Timbres;
  total: number;
  exo: number;
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

const remises = ref<Remise[]>([
  {
    id: 1,
    type: 'Remise',
    date: '2025-11-07',
    timbres: { 100: 200, 200: 150, 300: 100, 500: 80, 600: 60, 1000: 40 },
    total: 235000,
    exo: 0,
    commentaires: 'Remise pour Mairie Centrale',
  },
  {
    id: 2,
    type: 'Remise',
    date: '2025-11-06',
    timbres: { 100: 150, 200: 100, 300: 80, 500: 50, 600: 40, 1000: 20 },
    total: 155000,
    exo: 2000,
    commentaires: 'Remise pour Mairie Annexe',
  },
]);

const form = ref<Remise>({
  type: 'Remise',
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
  exo: 0,
  commentaires: '',
});

const columns = [
  { name: 'date', label: 'Date', field: 'date', align: 'left' as const, sortable: true },
  { name: 'type', label: 'Type', field: 'type', align: 'left' as const, sortable: true },
  { name: 'details', label: 'Détails', field: 'timbres', align: 'left' as const },
  { name: 'total', label: 'Total', field: 'total', align: 'right' as const, sortable: true },
  { name: 'exo', label: 'EXO', field: 'exo', align: 'right' as const, sortable: true },
  { name: 'actions', label: 'Actions', field: 'actions', align: 'center' as const },
];

const filteredRemises = computed(() => {
  let result = remises.value;

  if (search.value) {
    const searchLower = search.value.toLowerCase();
    result = result.filter(
      (r) =>
        r.type.toLowerCase().includes(searchLower) ||
        r.commentaires.toLowerCase().includes(searchLower),
    );
  }

  if (filterType.value) {
    result = result.filter((r) => r.type === filterType.value);
  }

  if (filterDate.value) {
    result = result.filter((r) => r.date === filterDate.value);
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

const openDialog = (remise?: Remise) => {
  if (remise) {
    isEditing.value = true;
    form.value = { ...remise };
  } else {
    isEditing.value = false;
    form.value = {
      type: 'Remise',
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
      exo: 0,
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
      const index = remises.value.findIndex((r) => r.id === form.value.id);
      if (index !== -1) {
        remises.value[index] = { ...form.value };
      }
      $q.notify({
        type: 'positive',
        message: 'Remise modifiée avec succès',
      });
    } else {
      const newId = Math.max(...remises.value.map((r) => r.id || 0)) + 1;
      remises.value.unshift({ ...form.value, id: newId });
      $q.notify({
        type: 'positive',
        message: 'Remise ajoutée avec succès',
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

const viewDetails = (remise: Remise) => {
  $q.dialog({
    title: 'Détails de la remise',
    message: `
      Date: ${remise.date}
      Type: ${remise.type}
      Total: ${formatMontant(remise.total)}
      EXO: ${formatMontant(remise.exo)}
      Commentaires: ${remise.commentaires}
    `,
    html: true,
  });
};

const confirmDelete = (remise: Remise) => {
  $q.dialog({
    title: 'Confirmation',
    message: 'Êtes-vous sûr de vouloir supprimer cette remise ?',
    cancel: true,
    persistent: true,
  }).onOk(() => {
    const index = remises.value.findIndex((r) => r.id === remise.id);
    if (index !== -1) {
      remises.value.splice(index, 1);
      $q.notify({
        type: 'positive',
        message: 'Remise supprimée avec succès',
      });
    }
  });
};

onMounted(() => {
  // Charger les données depuis la base de données
});
</script>
