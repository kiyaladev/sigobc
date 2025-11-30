<template>
  <q-page class="q-pa-md">
    <div class="row q-mb-md">
      <div class="col">
        <div class="text-h5">Gestion des Versements</div>
        <div class="text-caption text-grey-7 q-mt-xs">
          <q-icon name="info" size="16px" color="grey-7" />
          Le régisseur de mairie vient verser ce qu'il a vendu
          <span class="text-grey-8">(Enregistrement des recettes)</span>
        </div>
      </div>
      <div class="col-auto">
        <q-btn color="primary" icon="payments" label="Nouveau Versement" @click="openDialog()" />
      </div>
    </div>

    <!-- Recherche et filtres -->
    <q-card class="q-mb-md">
      <q-card-section>
        <div class="row q-col-gutter-md">
          <div class="col-12 col-sm-6">
            <q-input v-model="search" filled placeholder="Rechercher..." dense clearable>
              <template v-slot:prepend>
                <q-icon name="search" />
              </template>
            </q-input>
          </div>
          <div class="col-12 col-sm-6">
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
        <template v-slot:body-cell-details="props">
          <q-td :props="props">
            <div class="row q-gutter-xs">
              <template v-if="props.row.detailsQuotites">
                <div v-for="(value, key) in props.row.detailsQuotites" :key="key">
                  <q-chip v-if="value > 0" dense color="accent" text-color="grey-9">
                    {{ key }}: {{ value }}
                  </q-chip>
                </div>
              </template>
              <template v-else>
                <div v-for="(value, key) in props.row.timbres" :key="key">
                  <q-chip v-if="value > 0" dense color="accent" text-color="grey-9">
                    {{ key }}: {{ value }}
                  </q-chip>
                </div>
              </template>
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
              color="grey-8"
              @click="viewDetails(props.row)"
            >
              <q-tooltip>Voir détails</q-tooltip>
            </q-btn>
            <q-btn flat round dense icon="edit" color="grey-8" @click="openDialog(props.row)">
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
          <div class="text-h6">
            <q-icon name="remove_circle" class="q-mr-sm" />
            {{ isEditing ? 'Modifier' : 'Ajouter un' }} Versement
          </div>
          <div class="text-caption">Arrêté des ventes - Diminue le stock</div>
        </q-card-section>

        <q-card-section>
          <q-form @submit="onSubmit" class="q-gutter-md">
            <div class="row q-col-gutter-md">
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

              <div class="col-12 col-sm-6">
                <q-input
                  v-model="form.exercice"
                  filled
                  type="number"
                  label="Exercice *"
                  lazy-rules
                  :rules="[(val) => !!val || 'Exercice requis']"
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
                    v-for="q in quotites"
                    :key="`${q.prix}-${q.code}`"
                  >
                    <q-input
                      v-model.number="quantites[`${q.prix}-${q.code}`]"
                      filled
                      type="number"
                      :label="`t_${q.prix} (${q.code})`"
                      min="0"
                      dense
                      @update:model-value="calculateTotal"
                      :hint="q.type ? `Type: ${q.type}` : ''"
                      :hide-hint="false"
                    >
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
                        <div class="text-subtitle2 text-grey-7">Total (- Stock)</div>
                      </div>
                      <div class="col-auto">
                        <div class="text-h6">{{ formatMontant(form.total) }}</div>
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
import { db, type Quotite, type Versement, type Timbres } from 'src/database/db';
import { useQuasar } from 'quasar';

const $q = useQuasar();

const valeursTimbre = ref<number[]>([]);
const quotites = ref<Quotite[]>([]);
const quantites = ref<Record<string, number>>({});

const search = ref('');
const filterDate = ref<string | null>(null);
const loading = ref(false);
const saving = ref(false);
const dialogVisible = ref(false);
const isEditing = ref(false);

const versements = ref<Versement[]>([]);

interface VersementForm {
  id?: number;
  date: string;
  exercice: number;
  timbres: Timbres;
  detailsQuotites?: Record<string, number>;
  total: number;
  commentaires: string;
}

const form = ref<VersementForm>({
  date: new Date().toISOString().split('T')[0] as string,
  exercice: new Date().getFullYear(),
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
        (v.observations && v.observations.toLowerCase().includes(searchLower))
    );
  }

  if (filterDate.value) {
    result = result.filter((v) => new Date(v.date).toISOString().split('T')[0] === filterDate.value);
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
    const key = `${q.prix}-${q.code}`;
    const qty = quantites.value[key] || 0;
    total += q.prix * qty;
  }
  form.value.total = total;
};

function buildTimbresFromQuantites(): Timbres {
  const result: Timbres = { 100: 0, 200: 0, 300: 0, 500: 0, 600: 0, 1000: 0 };
  for (const q of quotites.value) {
    const key = `${q.prix}-${q.code}`;
    const qty = quantites.value[key] || 0;
    result[q.prix] = (result[q.prix] || 0) + qty;
  }
  return result;
}

function buildDetailsFromQuantites(): Record<string, number> {
  const details: Record<string, number> = {};
  for (const q of quotites.value) {
    const key = `${q.prix}-${q.code}`;
    details[key] = quantites.value[key] || 0;
  }
  return details;
}

const openDialog = (versement?: Versement) => {
  // Réinitialiser les quantités à 0
  quantites.value = {};
  for (const q of quotites.value) {
    quantites.value[`${q.prix}-${q.code}`] = 0;
  }

  if (versement) {
    isEditing.value = true;
    form.value = {
      ...(versement.id && { id: versement.id }),
      date: new Date(versement.date).toISOString().split('T')[0]!,
      exercice: versement.exercice,
      timbres: versement.timbres,
      total: versement.total,
      commentaires: versement.observations || '',
      ...(versement.detailsQuotites && { detailsQuotites: versement.detailsQuotites }),
    };

    // Récupérer les quantités
    if (versement.detailsQuotites) {
      for (const [key, val] of Object.entries(versement.detailsQuotites)) {
        quantites.value[key] = val;
      }
    } else {
      // Fallback pour la rétrocompatibilité
      for (const [prixStr, val] of Object.entries(versement.timbres)) {
        const prix = parseInt(prixStr);
        const q = quotites.value.find((q) => q.prix === prix);
        if (q) {
          quantites.value[`${q.prix}-${q.code}`] = val;
        }
      }
    }
  } else {
    isEditing.value = false;
    form.value = {
      date: new Date().toISOString().split('T')[0] as string,
      exercice: new Date().getFullYear(),
      timbres: { 100: 0, 200: 0, 300: 0, 500: 0, 600: 0, 1000: 0 },
      total: 0,
      commentaires: '',
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
    
    const data = {
      mairieId,
      exercice: form.value.exercice,
      date: new Date(form.value.date),
      numeroVersement: `V-${Date.now()}`, // Génération temporaire
      timbres: buildTimbresFromQuantites(),
      detailsQuotites: buildDetailsFromQuantites(),
      total: form.value.total,
      observations: form.value.commentaires,
      personnelId,
      createdAt: now,
      updatedAt: now,
    };

    if (isEditing.value && form.value.id) {
      await db.versements.update(form.value.id, {
        ...data,
        updatedAt: now,
      });
      $q.notify({
        type: 'positive',
        message: 'Versement modifié avec succès',
      });
    } else {
      await db.versements.add(data);
      $q.notify({
        type: 'positive',
        message: 'Versement ajouté avec succès',
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

const viewDetails = (versement: Versement) => {
  $q.dialog({
    title: 'Détails du versement',
    message: `
      Date: ${new Date(versement.date).toLocaleDateString()}
      Total: ${formatMontant(versement.total)}
      Commentaires: ${versement.observations || ''}
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
    void (async () => {
      try {
        if (versement.id) {
          await db.versements.delete(versement.id);
          $q.notify({
            type: 'positive',
            message: 'Versement supprimé avec succès',
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

async function loadData() {
  loading.value = true;
  try {
    versements.value = await db.versements.toArray();
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

onMounted(() => {
  void (async () => {
    const qs = await db.quotites.toArray();
    const byCode: Record<string, Quotite> = {};
    for (const q of qs) {
      if (!q.actif) continue;
      if (!byCode[q.code]) byCode[q.code] = q;
    }
    quotites.value = Object.values(byCode);
    const set = Array.from(new Set(quotites.value.map((q) => q.prix))).sort((a, b) => a - b);
    valeursTimbre.value = set.length ? set : [100, 200, 300, 500, 600, 1000];
    for (const q of quotites.value) {
      const key = `${q.prix}-${q.code}`;
      if (!(key in quantites.value)) quantites.value[key] = 0;
    }
    await loadData();
  })();
});
</script>
