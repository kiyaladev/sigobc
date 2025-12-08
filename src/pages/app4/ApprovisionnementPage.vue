<template>
  <q-page class="q-pa-md">
    <div class="row q-mb-md">
      <div class="col">
        <div class="text-h5">
          <q-icon name="verified" color="purple" class="q-mr-sm" />
          Approvisionnement Timbres
        </div>
        <div class="text-caption text-grey-7 q-mt-xs">
          <q-icon name="info" size="16px" color="grey-7" />
          Réception de timbres fiscaux
          <span class="text-positive text-weight-bold">(+ Augmente le stock)</span>
        </div>
      </div>
      <div class="col-auto">
        <q-btn
          color="purple"
          icon="add_box"
          label="Nouvel Approvisionnement"
          @click="openDialog()"
        />
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
            {{ new Date(props.row.date).toLocaleDateString('fr-FR') }}
          </q-td>
        </template>

        <template v-slot:body-cell-type="props">
          <q-td :props="props">
            <q-badge color="purple" :label="props.row.type" />
          </q-td>
        </template>

        <template v-slot:body-cell-details="props">
          <q-td :props="props">
            <div class="row q-gutter-xs">
              <div v-for="(value, key) in props.row.detailsQuotites" :key="key">
                <q-chip v-if="value > 0" dense color="purple" text-color="white">
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
            <q-btn flat round dense icon="edit" color="purple" @click="openDialog(props.row)">
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
        <q-card-section class="bg-purple text-white">
          <div class="text-h6">
            {{ isEditing ? 'Modifier' : 'Nouvel' }} Approvisionnement de Timbres
          </div>
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
                  dense
                />
              </div>

              <div class="col-12 col-sm-4">
                <q-select
                  v-model="form.type"
                  filled
                  label="Type *"
                  :options="typeOptions"
                  :rules="[(val) => !!val || 'Requis']"
                />
              </div>

              <div class="col-12 col-sm-4">
                <q-input
                  :model-value="form.date ? new Date(form.date).toISOString().split('T')[0] : ''"
                  @update:model-value="
                    (val: string | number | null) => {
                      if (val && typeof val === 'string') form.date = new Date(val);
                    }
                  "
                  filled
                  type="date"
                  label="Date *"
                  :rules="[(val) => !!val || 'Requis']"
                />
              </div>

              <!-- Quantités par quotité de timbre -->
              <div class="col-12">
                <div class="text-subtitle1 text-weight-medium q-mb-sm">
                  Quantités par quotité de timbre
                </div>
                <div class="row q-col-gutter-sm">
                  <div class="col-6 col-sm-4 col-md-3" v-for="q in quotites" :key="q.code">
                    <q-input
                      v-model.number="quantites[q.code]"
                      filled
                      type="number"
                      :label="`${q.code} (${q.prix} F)`"
                      min="0"
                      dense
                      @update:model-value="calculateTotal"
                    />
                  </div>
                </div>
              </div>

              <!-- Total -->
              <div class="col-12">
                <q-card flat bordered>
                  <q-card-section class="bg-purple-1">
                    <div class="row items-center justify-between">
                      <div class="text-subtitle2 text-grey-7">Total</div>
                      <div class="text-h6 text-purple">{{ formatMontant(form.total || 0) }}</div>
                    </div>
                  </q-card-section>
                </q-card>
              </div>

              <div class="col-12">
                <q-input
                  v-model="form.observations"
                  filled
                  type="textarea"
                  label="Observations"
                  rows="2"
                />
              </div>
            </div>

            <div class="row q-gutter-sm justify-end">
              <q-btn label="Annuler" color="grey-7" flat @click="dialogVisible = false" />
              <q-btn label="Enregistrer" color="purple" type="submit" :loading="saving" />
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
import { db, DEFAULT_MAIRIE_ID } from 'src/database/db';
import type { TimbreApprovisionnement, Quotite } from 'src/database/db';

const $q = useQuasar();

const typeOptions = ['approvisionnement', 'réception', 'transfert'];
const quotites = ref<Quotite[]>([]);
const quantites = ref<Record<string, number>>({});

const search = ref('');
const filterType = ref<string | null>(null);
const filterDate = ref<string | null>(null);
const loading = ref(false);
const saving = ref(false);
const dialogVisible = ref(false);
const isEditing = ref(false);
const editingId = ref<number | undefined>(undefined);

const approvisionnements = ref<TimbreApprovisionnement[]>([]);

const form = ref<Partial<TimbreApprovisionnement>>({
  type: 'approvisionnement',
  date: new Date(),
  detailsQuotites: {},
  total: 0,
  exercice: new Date().getFullYear(),
  observations: '',
});

const columns = [
  { name: 'date', label: 'Date', field: 'date', align: 'left' as const, sortable: true },
  { name: 'type', label: 'Type', field: 'type', align: 'left' as const, sortable: true },
  { name: 'details', label: 'Détails', field: 'detailsQuotites', align: 'left' as const },
  { name: 'total', label: 'Total', field: 'total', align: 'right' as const, sortable: true },
  { name: 'actions', label: 'Actions', field: 'actions', align: 'center' as const },
];

async function loadData() {
  loading.value = true;
  try {
    approvisionnements.value = await db.timbreApprovisionnements
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

const filteredAppros = computed(() => {
  let result = approvisionnements.value;
  if (search.value) {
    const s = search.value.toLowerCase();
    result = result.filter(
      (a) => a.type.toLowerCase().includes(s) || a.observations?.toLowerCase().includes(s),
    );
  }
  if (filterType.value) {
    result = result.filter((a) => a.type === filterType.value);
  }
  if (filterDate.value) {
    const fd = new Date(filterDate.value).toISOString().split('T')[0];
    result = result.filter((a) => new Date(a.date).toISOString().split('T')[0] === fd);
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
  for (const q of quotites.value) {
    const qty = quantites.value[q.code] || 0;
    total += q.prix * qty;
  }
  form.value.total = total;
};

const openDialog = (appro?: TimbreApprovisionnement) => {
  quantites.value = {};
  for (const q of quotites.value) {
    quantites.value[q.code] = 0;
  }

  if (appro?.id) {
    isEditing.value = true;
    editingId.value = appro.id;
    form.value = { ...appro, date: new Date(appro.date) };
    if (appro.detailsQuotites) {
      for (const [key, val] of Object.entries(appro.detailsQuotites)) {
        quantites.value[key] = val;
      }
    }
  } else {
    isEditing.value = false;
    editingId.value = undefined;
    form.value = {
      type: 'approvisionnement',
      date: new Date(),
      detailsQuotites: {},
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
    const details: Record<string, number> = {};
    for (const q of quotites.value) {
      details[q.code] = quantites.value[q.code] || 0;
    }

    const data: TimbreApprovisionnement = {
      mairieId: DEFAULT_MAIRIE_ID,
      exercice: form.value.exercice || new Date().getFullYear(),
      date: form.value.date ? new Date(form.value.date) : now,
      type: form.value.type || 'approvisionnement',
      detailsQuotites: details,
      total: form.value.total || 0,
      observations: form.value.observations || '',
      personnelId: 1,
      createdAt: now,
      updatedAt: now,
    };

    if (isEditing.value && editingId.value) {
      await db.timbreApprovisionnements.update(editingId.value, { ...data, updatedAt: now });
      $q.notify({ type: 'positive', message: 'Approvisionnement modifié' });
    } else {
      await db.timbreApprovisionnements.add(data);
      $q.notify({ type: 'positive', message: 'Approvisionnement ajouté' });
    }

    dialogVisible.value = false;
    await loadData();
  } catch (error) {
    console.error('Erreur:', error);
    $q.notify({ type: 'negative', message: "Erreur lors de l'enregistrement" });
  } finally {
    saving.value = false;
  }
};

const confirmDelete = (appro: TimbreApprovisionnement) => {
  $q.dialog({
    title: 'Confirmation',
    message: 'Supprimer cet approvisionnement ?',
    cancel: true,
    persistent: true,
  }).onOk(() => {
    if (appro.id) {
      void db.timbreApprovisionnements
        .delete(appro.id)
        .then(() => {
          $q.notify({ type: 'positive', message: 'Supprimé' });
          void loadData();
        })
        .catch(() => {
          $q.notify({ type: 'negative', message: 'Erreur' });
        });
    }
  });
};

onMounted(async () => {
  const allQuotites = await db.quotites.toArray();
  quotites.value = allQuotites.filter(
    (q) => q.isTimbre && q.actif && q.mairieId === DEFAULT_MAIRIE_ID,
  );
  for (const q of quotites.value) {
    quantites.value[q.code] = 0;
  }
  await loadData();
});
</script>
