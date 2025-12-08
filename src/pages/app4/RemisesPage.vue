<template>
  <q-page class="q-pa-md">
    <div class="row q-mb-md">
      <div class="col">
        <div class="text-h5">
          <q-icon name="verified" color="purple" class="q-mr-sm" />
          Remises de Timbres
        </div>
        <div class="text-caption text-grey-7 q-mt-xs">
          <q-icon name="info" size="16px" color="grey-7" />
          Distribution de timbres
          <span class="text-negative text-weight-bold">(- Diminue le stock)</span>
        </div>
      </div>
      <div class="col-auto">
        <q-btn
          color="negative"
          icon="remove_circle"
          label="Nouvelle Remise"
          @click="openDialog()"
        />
      </div>
    </div>

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
            <q-input v-model="filterDate" filled dense type="date" label="Date" clearable />
          </div>
        </div>
      </q-card-section>
    </q-card>

    <q-card>
      <q-table
        :rows="filteredRemises"
        :columns="columns"
        row-key="id"
        :loading="loading"
        :pagination="{ rowsPerPage: 10 }"
      >
        <template v-slot:body-cell-date="props">
          <q-td :props="props">{{ new Date(props.row.date).toLocaleDateString('fr-FR') }}</q-td>
        </template>
        <template v-slot:body-cell-details="props">
          <q-td :props="props">
            <div class="row q-gutter-xs">
              <q-chip
                v-for="(value, key) in props.row.detailsQuotites"
                :key="key"
                v-show="value > 0"
                dense
                color="negative"
                text-color="white"
              >
                {{ key }}: {{ value }}
              </q-chip>
            </div>
          </q-td>
        </template>
        <template v-slot:body-cell-total="props">
          <q-td :props="props"
            ><strong>{{ formatMontant(props.row.total) }}</strong></q-td
          >
        </template>
        <template v-slot:body-cell-actions="props">
          <q-td :props="props">
            <q-btn flat round dense icon="edit" color="purple" @click="openDialog(props.row)" />
            <q-btn
              flat
              round
              dense
              icon="delete"
              color="negative"
              @click="confirmDelete(props.row)"
            />
          </q-td>
        </template>
      </q-table>
    </q-card>

    <q-dialog v-model="dialogVisible" persistent>
      <q-card style="min-width: 700px">
        <q-card-section class="bg-negative text-white">
          <div class="text-h6">{{ isEditing ? 'Modifier' : 'Nouvelle' }} Remise de Timbres</div>
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
                <q-input
                  v-model="form.numeroRemise"
                  filled
                  label="N° Remise *"
                  :rules="[(v) => !!v || 'Requis']"
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
                  :rules="[(v) => !!v || 'Requis']"
                />
              </div>
              <div class="col-12">
                <div class="text-subtitle1 q-mb-sm">Quantités par quotité</div>
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
              <div class="col-12">
                <q-card flat bordered>
                  <q-card-section class="bg-red-1">
                    <div class="row items-center justify-between">
                      <div class="text-subtitle2">Total</div>
                      <div class="text-h6 text-negative">{{ formatMontant(form.total || 0) }}</div>
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
              <q-btn label="Annuler" flat @click="dialogVisible = false" />
              <q-btn label="Enregistrer" color="negative" type="submit" :loading="saving" />
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
import type { TimbreRemise, Quotite } from 'src/database/db';

const $q = useQuasar();
const quotites = ref<Quotite[]>([]);
const quantites = ref<Record<string, number>>({});
const search = ref('');
const filterDate = ref<string | null>(null);
const loading = ref(false);
const saving = ref(false);
const dialogVisible = ref(false);
const isEditing = ref(false);
const editingId = ref<number | undefined>(undefined);
const remises = ref<TimbreRemise[]>([]);

const form = ref<Partial<TimbreRemise>>({
  type: 'remise',
  numeroRemise: '',
  date: new Date(),
  detailsQuotites: {},
  total: 0,
  exercice: new Date().getFullYear(),
});

const columns = [
  { name: 'date', label: 'Date', field: 'date', align: 'left' as const, sortable: true },
  { name: 'numeroRemise', label: 'N° Remise', field: 'numeroRemise', align: 'left' as const },
  { name: 'details', label: 'Détails', field: 'detailsQuotites', align: 'left' as const },
  { name: 'total', label: 'Total', field: 'total', align: 'right' as const, sortable: true },
  { name: 'actions', label: 'Actions', field: 'actions', align: 'center' as const },
];

async function loadData() {
  loading.value = true;
  try {
    remises.value = await db.timbreRemises.where('mairieId').equals(DEFAULT_MAIRIE_ID).toArray();
  } finally {
    loading.value = false;
  }
}

const filteredRemises = computed(() => {
  let result = remises.value;
  if (search.value) {
    const s = search.value.toLowerCase();
    result = result.filter((r) => r.numeroRemise.toLowerCase().includes(s));
  }
  if (filterDate.value) {
    const fd = new Date(filterDate.value).toISOString().split('T')[0];
    result = result.filter((r) => new Date(r.date).toISOString().split('T')[0] === fd);
  }
  return result;
});

const formatMontant = (m: number) =>
  new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    minimumFractionDigits: 0,
  }).format(m);

const calculateTotal = () => {
  form.value.total = quotites.value.reduce(
    (sum, q) => sum + q.prix * (quantites.value[q.code] || 0),
    0,
  );
};

const openDialog = (item?: TimbreRemise) => {
  quantites.value = {};
  quotites.value.forEach((q) => (quantites.value[q.code] = 0));
  if (item?.id) {
    isEditing.value = true;
    editingId.value = item.id;
    form.value = { ...item, date: new Date(item.date) };
    Object.entries(item.detailsQuotites || {}).forEach(([k, v]) => (quantites.value[k] = v));
  } else {
    isEditing.value = false;
    editingId.value = undefined;
    form.value = {
      type: 'remise',
      numeroRemise: '',
      date: new Date(),
      detailsQuotites: {},
      total: 0,
      exercice: new Date().getFullYear(),
    };
  }
  dialogVisible.value = true;
};

const onSubmit = async () => {
  saving.value = true;
  try {
    const now = new Date();
    const details: Record<string, number> = {};
    quotites.value.forEach((q) => (details[q.code] = quantites.value[q.code] || 0));
    const data: TimbreRemise = {
      mairieId: DEFAULT_MAIRIE_ID,
      exercice: form.value.exercice || new Date().getFullYear(),
      date: form.value.date ? new Date(form.value.date) : now,
      type: form.value.type || 'remise',
      numeroRemise: form.value.numeroRemise || '',
      detailsQuotites: details,
      total: form.value.total || 0,
      observations: form.value.observations || '',
      personnelId: 1,
      createdAt: now,
      updatedAt: now,
    };
    if (isEditing.value && editingId.value) {
      await db.timbreRemises.update(editingId.value, { ...data, updatedAt: now });
      $q.notify({ type: 'positive', message: 'Remise modifiée' });
    } else {
      await db.timbreRemises.add(data);
      $q.notify({ type: 'positive', message: 'Remise ajoutée' });
    }
    dialogVisible.value = false;
    await loadData();
  } finally {
    saving.value = false;
  }
};

const confirmDelete = (item: TimbreRemise) => {
  $q.dialog({ title: 'Confirmation', message: 'Supprimer cette remise ?', cancel: true }).onOk(
    () => {
      if (item.id) {
        void db.timbreRemises.delete(item.id).then(() => {
          $q.notify({ type: 'positive', message: 'Supprimé' });
          void loadData();
        });
      }
    },
  );
};

onMounted(async () => {
  quotites.value = (await db.quotites.toArray()).filter(
    (q) => q.isTimbre && q.actif && q.mairieId === DEFAULT_MAIRIE_ID,
  );
  quotites.value.forEach((q) => (quantites.value[q.code] = 0));
  await loadData();
});
</script>
