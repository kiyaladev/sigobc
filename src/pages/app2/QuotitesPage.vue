<template>
  <q-page class="q-pa-md">
    <div class="row q-mb-md justify-between items-center">
      <div class="text-h5">Gestion des Quotités</div>
      <q-btn color="primary" icon="add" label="Nouvelle Quotité" @click="openDialog()" />
    </div>

    <q-card class="q-mb-md">
      <q-card-section>
        <div class="row q-col-gutter-md">
          <div class="col-12 col-sm-4">
            <q-input v-model="search" filled placeholder="Rechercher..." dense clearable>
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

    <q-card>
      <q-table
        :rows="filteredRows"
        :columns="columns"
        row-key="id"
        :loading="loading"
        :pagination="{ rowsPerPage: 10 }"
        binary-state-sort
      >
        <template v-slot:body-cell-prix="props">
          <q-td :props="props">
            {{ formatMontant(props.row.prix) }}
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

    <q-dialog v-model="dialogVisible" persistent>
      <q-card style="min-width: 700px">
        <q-card-section class="accent-left">
          <div class="text-h6">{{ isEditing ? 'Modifier' : 'Nouvelle' }} Quotité</div>
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

              <div class="col-12 col-sm-6">
                <q-input
                  v-model.number="form.prix"
                  filled
                  type="number"
                  label="Prix *"
                  suffix="FCFA"
                  :rules="[(val) => val > 0 || 'Le prix est requis']"
                />
              </div>

              <div class="col-12">
                <q-input v-model="form.description" filled label="Description *" :rules="[(v)=>!!v||'Requis']" />
              </div>

              <div class="col-12 col-sm-6">
                <q-select
                  v-model="form.type"
                  filled
                  :options="typeOptions"
                  label="Type *"
                  :rules="[(val) => !!val || 'Le type est requis']"
                />
              </div>

              <div class="col-12 col-sm-6">
                <q-toggle v-model="form.actif" label="Actif" color="green" />
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
import { db, type Quotite, DEFAULT_MAIRIE_ID } from 'src/database/db';

const $q = useQuasar();

const rows = ref<Quotite[]>([]);
const loading = ref(false);
const saving = ref(false);
const dialogVisible = ref(false);
const isEditing = ref(false);
const search = ref('');
const filterType = ref('');
const filterActif = ref('');

const typeOptions = ['Marché', 'Abattoirs', 'Stationnement'];
const actifOptions = ['Actif', 'Inactif'];

const form = ref<Partial<Quotite>>({
  code: '',
  prix: 0,
  description: 'Ticket',
  type: '',
  actif: true,
});

const columns = [
  { name: 'code', label: 'Code', field: 'code', align: 'left' as const, sortable: true },
  { name: 'prix', label: 'Prix', field: 'prix', align: 'right' as const, sortable: true },
  { name: 'description', label: 'Description', field: 'description', align: 'left' as const, sortable: true },
  { name: 'type', label: 'Type', field: 'type', align: 'left' as const, sortable: true },
  { name: 'actif', label: 'Statut', field: 'actif', align: 'center' as const, sortable: true },
  { name: 'actions', label: 'Actions', field: 'actions', align: 'center' as const },
];

const filteredRows = computed(() => {
  let result = rows.value;

  if (filterType.value) {
    result = result.filter((t) => t.type === filterType.value);
  }

  if (filterActif.value) {
    const isActif = filterActif.value === 'Actif';
    result = result.filter((t) => t.actif === isActif);
  }

  if (search.value) {
    const s = search.value.toLowerCase();
    result = result.filter(
      (t) =>
        t.code.toLowerCase().includes(s) ||
        t.description.toLowerCase().includes(s) ||
        t.type.toLowerCase().includes(s),
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
    rows.value = await db.quotites.toArray();
  } catch (error) {
    console.error('Erreur lors du chargement:', error);
    $q.notify({ type: 'negative', message: 'Erreur lors du chargement' });
  } finally {
    loading.value = false;
  }
}

function openDialog(item?: Quotite) {
  isEditing.value = !!item;
  if (item) {
    form.value = { ...item };
  } else {
    form.value = {
      code: '',
      prix: 0,
      description: 'Ticket',
      type: '',
      actif: true,
    };
  }
  dialogVisible.value = true;
}

async function onSubmit() {
  saving.value = true;
  try {
    const now = new Date();
    const existing = await db.quotites
      .where('code')
      .equals(form.value.code!)
      .and((q) => q.mairieId === DEFAULT_MAIRIE_ID)
      .first();
    if (!isEditing.value && existing) {
      $q.notify({ type: 'warning', message: `Le code ${form.value.code} existe déjà` });
      saving.value = false;
      return;
    }
    if (isEditing.value && existing && existing.id !== form.value.id) {
      $q.notify({ type: 'warning', message: `Le code ${form.value.code} est déjà utilisé` });
      saving.value = false;
      return;
    }
    if (isEditing.value && form.value.id) {
      await db.quotites.update(form.value.id, {
        ...form.value,
        updatedAt: now,
      });
      $q.notify({ type: 'positive', message: 'Quotité modifiée avec succès' });
    } else {
      await db.quotites.add({
        ...(form.value as Quotite),
        mairieId: DEFAULT_MAIRIE_ID,
        createdAt: now,
        updatedAt: now,
      } as Quotite);
      $q.notify({ type: 'positive', message: 'Quotité créée avec succès' });
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

function confirmDelete(item: Quotite) {
  $q.dialog({
    title: 'Confirmation',
    message: `Supprimer la quotité "${item.code} - ${item.type}" ?`,
    cancel: true,
    persistent: true,
  }).onOk(() => {
    void (async () => {
      try {
        await db.quotites.delete(item.id);
        $q.notify({ type: 'positive', message: 'Quotité supprimée avec succès' });
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
