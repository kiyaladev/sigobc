<template>
  <q-page class="prevision-page q-pa-md">
    <PageHeader
      title="Prévisions Budgétaires - Investissements"
      subtitle="Gestion des prévisions d'investissements"
      icon="pie_chart"
    />

    <q-card class="main-card">
      <q-card-section>
        <!-- Filtres -->
        <div class="row q-col-gutter-md q-mb-md">
          <div class="col-12 col-md-3">
            <q-select
              v-model="filterExercice"
              :options="exerciceFilterOptions"
              label="Exercice"
              outlined
              dense
              emit-value
              map-options
              clearable
            />
          </div>
          <div class="col-12 col-md-3">
            <q-select
              v-model="filterChapitreId"
              :options="chapitreOptions"
              label="Chapitre"
              outlined
              dense
              emit-value
              map-options
              clearable
            />
          </div>
          <div class="col-12 col-md-3">
            <q-select
              v-model="filterSousChapitreId"
              :options="sousChapitreOptions"
              label="Sous-chapitre"
              outlined
              dense
              emit-value
              map-options
              clearable
            />
          </div>
          <div class="col-12 col-md-3">
            <q-btn
              label="Réinitialiser"
              icon="refresh"
              flat
              color="grey-7"
              @click="resetFilters"
              class="full-width"
            />
          </div>
        </div>

        <div class="row items-center justify-between q-mb-md">
          <div class="col-12 col-md-6">
            <q-input
              v-model="filter"
              placeholder="Rechercher une prévision..."
              outlined
              dense
              clearable
            >
              <template v-slot:prepend>
                <q-icon name="search" />
              </template>
            </q-input>
          </div>
          <div class="col-12 col-md-auto q-mt-sm q-mt-md-none q-gutter-sm">
            <q-btn
              color="secondary"
              icon="print"
              label="CT02"
              unelevated
              @click="showCT02Dialog = true"
            />
            <q-btn
              color="teal"
              icon="add"
              label="Nouvelle Prévision"
              unelevated
              @click="showAddDialog = true"
            />
          </div>
        </div>

        <DataTable
          :rows="filteredPrevisions"
          :columns="columns"
          :loading="loading"
          @edit="editPrevision"
          @delete="deletePrevision"
        >
          <template v-slot:body-cell-statut="props">
            <q-td :props="props">
              <q-badge
                :color="getStatutColor(props.row.statut)"
                :label="getStatutLabel(props.row.statut)"
              />
            </q-td>
          </template>
        </DataTable>
      </q-card-section>
    </q-card>

    <!-- Dialog d'ajout/modification -->
    <q-dialog v-model="showAddDialog" persistent>
      <q-card style="min-width: 600px">
        <q-card-section class="row items-center q-pb-none bg-teal text-white">
          <div class="text-h6">
            {{ editingId ? 'Modifier la prévision' : 'Nouvelle prévision' }}
          </div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <q-form @submit="savePrevision" class="q-gutter-md">
            <q-input
              v-model.number="formData.exercice"
              label="Exercice *"
              outlined
              dense
              type="number"
              :rules="[(val) => !!val || 'Exercice requis']"
            />

            <q-select
              v-model="formData.chapitreId"
              :options="chapitreOptions"
              label="Chapitre *"
              outlined
              dense
              emit-value
              map-options
              :rules="[(val) => !!val || 'Chapitre requis']"
            />

            <q-select
              v-model="formData.sousChapitreId"
              :options="sousChapitreOptions"
              label="Sous-chapitre (Compte)"
              outlined
              dense
              emit-value
              map-options
              clearable
            />

            <q-input
              v-model.number="formData.montantPrevu"
              label="Montant Prévu *"
              outlined
              dense
              type="number"
              prefix="XOF"
              :rules="[(val) => !!val || 'Montant requis']"
            />

            <q-select
              v-model="formData.statut"
              :options="['brouillon', 'validee', 'cloturee']"
              label="Statut *"
              outlined
              dense
            />

            <q-input
              v-model="formData.observations"
              label="Observations"
              outlined
              dense
              type="textarea"
              rows="3"
            />

            <div class="row justify-end q-gutter-sm q-mt-md">
              <q-btn label="Annuler" flat color="grey-7" v-close-popup />
              <q-btn label="Enregistrer" type="submit" color="teal" unelevated />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Dialog CT02 - Livre d'exécution des opérations budgétaires investissements -->
    <q-dialog v-model="showCT02Dialog" persistent>
      <q-card style="min-width: 500px">
        <q-card-section class="row items-center q-pb-none bg-teal text-white">
          <div class="text-h6">CT02 - Livre d'exécution budgétaire Investissements</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <div class="q-gutter-md">
            <q-select
              v-model="ct02Filters.exercice"
              :options="exerciceOptions"
              label="Exercice *"
              outlined
              dense
              emit-value
              map-options
            />

            <q-select
              v-model="ct02Filters.sousChapitreId"
              :options="sousChapitreOptions"
              label="Sous-chapitre (Compte)"
              outlined
              dense
              emit-value
              map-options
              clearable
            />

            <div class="row justify-end q-gutter-sm q-mt-md">
              <q-btn label="Annuler" flat color="grey-7" v-close-popup />
              <q-btn
                label="Imprimer CT02"
                icon="print"
                color="teal"
                unelevated
                @click="printCT02"
                :loading="loadingCT02"
              />
            </div>
          </div>
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
  type PrevisionInvestissement,
  type ChapitreInvestissement,
  type SousChapitreInvestissement,
  type MandatInvestissement,
  DEFAULT_MAIRIE_ID,
} from 'src/database/db';
import PageHeader from 'src/components/PageHeader.vue';
import DataTable from 'src/components/DataTable.vue';

const $q = useQuasar();
const loading = ref(false);
const loadingCT02 = ref(false);
const filter = ref('');
const showAddDialog = ref(false);
const showCT02Dialog = ref(false);
const editingId = ref<number | null>(null);

// Filtres
const filterExercice = ref<number | null>(null);
const filterChapitreId = ref<number | null>(null);
const filterSousChapitreId = ref<number | null>(null);

const previsions = ref<PrevisionInvestissement[]>([]);
const chapitres = ref<ChapitreInvestissement[]>([]);
const sousChapitres = ref<SousChapitreInvestissement[]>([]);
const mandats = ref<MandatInvestissement[]>([]);

const formData = ref({
  exercice: new Date().getFullYear(),
  chapitreId: null as number | null,
  sousChapitreId: null as number | null,
  montantPrevu: 0,
  statut: 'validee' as 'brouillon' | 'validee' | 'cloturee',
  observations: '',
});

// Filtres CT02
const ct02Filters = ref({
  exercice: new Date().getFullYear(),
  sousChapitreId: null as number | null,
});

const chapitreOptions = computed(() =>
  chapitres.value.map((c) => ({ label: `${c.code} - ${c.libelle}`, value: c.id })),
);

const sousChapitreOptions = computed(() =>
  sousChapitres.value.map((s) => ({ label: `${s.code} - ${s.libelle}`, value: s.id })),
);

const exerciceOptions = computed(() => {
  const currentYear = new Date().getFullYear();
  return [currentYear - 2, currentYear - 1, currentYear, currentYear + 1].map((y) => ({
    label: String(y),
    value: y,
  }));
});

const exerciceFilterOptions = computed(() => {
  const years = [...new Set(previsions.value.map((p) => p.exercice))].sort((a, b) => b - a);
  return years.map((y) => ({ label: String(y), value: y }));
});

const columns = [
  {
    name: 'exercice',
    label: 'Exercice',
    align: 'left' as const,
    field: 'exercice',
    sortable: true,
  },
  {
    name: 'chapitre',
    label: 'Chapitre',
    align: 'left' as const,
    field: (row: PrevisionInvestissement) => {
      const chapitre = chapitres.value.find((c) => c.id === row.chapitreInvestissementId);
      return chapitre ? `${chapitre.code} - ${chapitre.libelle}` : '';
    },
    sortable: true,
  },
  {
    name: 'sousChapitre',
    label: 'Sous-chapitre',
    align: 'left' as const,
    field: (row: PrevisionInvestissement) => {
      if (!row.sousChapitreInvestissementId) return '';
      const sousChapitre = sousChapitres.value.find(
        (s) => s.id === row.sousChapitreInvestissementId,
      );
      return sousChapitre ? `${sousChapitre.code} - ${sousChapitre.libelle}` : '';
    },
    sortable: true,
  },
  {
    name: 'montantPrevu',
    label: 'Montant Prévu',
    align: 'right' as const,
    field: 'montantPrevu',
    format: (val: number) => formatMontant(val),
    sortable: true,
  },
  {
    name: 'montantEngage',
    label: 'Engagé',
    align: 'right' as const,
    field: 'montantEngage',
    format: (val: number) => formatMontant(val),
    sortable: true,
  },
  {
    name: 'montantDisponible',
    label: 'Disponible',
    align: 'right' as const,
    field: 'montantDisponible',
    format: (val: number) => formatMontant(val),
    sortable: true,
  },
  {
    name: 'statut',
    label: 'Statut',
    align: 'center' as const,
    field: 'statut',
    sortable: true,
  },
  {
    name: 'actions',
    label: 'Actions',
    align: 'center' as const,
    field: 'id',
  },
];

const filteredPrevisions = computed(() => {
  let result = previsions.value;

  if (filterExercice.value) {
    result = result.filter((p) => p.exercice === filterExercice.value);
  }
  if (filterChapitreId.value) {
    result = result.filter((p) => p.chapitreInvestissementId === filterChapitreId.value);
  }
  if (filterSousChapitreId.value) {
    result = result.filter((p) => p.sousChapitreInvestissementId === filterSousChapitreId.value);
  }
  if (filter.value) {
    const searchTerm = filter.value.toLowerCase();
    result = result.filter((p) => {
      const chapitre = chapitres.value.find((c) => c.id === p.chapitreInvestissementId);
      const sousChapitre = sousChapitres.value.find((s) => s.id === p.sousChapitreInvestissementId);
      return (
        chapitre?.libelle.toLowerCase().includes(searchTerm) ||
        sousChapitre?.libelle.toLowerCase().includes(searchTerm) ||
        p.observations?.toLowerCase().includes(searchTerm)
      );
    });
  }

  return result;
});

function resetFilters() {
  filterExercice.value = null;
  filterChapitreId.value = null;
  filterSousChapitreId.value = null;
  filter.value = '';
}

function formatMontant(montant: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    minimumFractionDigits: 0,
  }).format(montant);
}

function getStatutColor(statut: string): string {
  switch (statut) {
    case 'validee':
      return 'positive';
    case 'brouillon':
      return 'warning';
    case 'cloturee':
      return 'grey';
    default:
      return 'grey';
  }
}

function getStatutLabel(statut: string): string {
  switch (statut) {
    case 'validee':
      return 'Validée';
    case 'brouillon':
      return 'Brouillon';
    case 'cloturee':
      return 'Clôturée';
    default:
      return statut;
  }
}

async function loadData() {
  loading.value = true;
  try {
    [previsions.value, chapitres.value, sousChapitres.value, mandats.value] = await Promise.all([
      db.previsionsInvestissement.where('mairieId').equals(DEFAULT_MAIRIE_ID).toArray(),
      db.chapitresInvestissement.where('mairieId').equals(DEFAULT_MAIRIE_ID).toArray(),
      db.sousChapitresInvestissement.where('mairieId').equals(DEFAULT_MAIRIE_ID).toArray(),
      db.mandatsInvestissement.where('mairieId').equals(DEFAULT_MAIRIE_ID).toArray(),
    ]);
  } catch (error) {
    console.error('Erreur lors du chargement:', error);
    $q.notify({ type: 'negative', message: 'Erreur lors du chargement des données' });
  } finally {
    loading.value = false;
  }
}

function resetForm() {
  formData.value = {
    exercice: new Date().getFullYear(),
    chapitreId: null,
    sousChapitreId: null,
    montantPrevu: 0,
    statut: 'validee',
    observations: '',
  };
  editingId.value = null;
}

function editPrevision(row: PrevisionInvestissement) {
  editingId.value = row.id ?? null;
  formData.value = {
    exercice: row.exercice,
    chapitreId: row.chapitreInvestissementId,
    sousChapitreId: row.sousChapitreInvestissementId ?? null,
    montantPrevu: row.montantPrevu,
    statut: row.statut,
    observations: row.observations || '',
  };
  showAddDialog.value = true;
}

async function savePrevision() {
  try {
    const now = new Date();

    // Calcul montant engagé
    const relatedMandats = mandats.value.filter(
      (m) =>
        m.exercice === formData.value.exercice &&
        m.chapitreInvestissementId === formData.value.chapitreId &&
        (formData.value.sousChapitreId
          ? m.sousChapitreInvestissementId === formData.value.sousChapitreId
          : true) &&
        m.statut !== 'annule',
    );
    const montantEngage = relatedMandats.reduce((sum, m) => sum + m.montant, 0);
    const montantDisponible = formData.value.montantPrevu - montantEngage;

    const data = {
      exercice: formData.value.exercice,
      chapitreInvestissementId: formData.value.chapitreId!,
      sousChapitreInvestissementId: formData.value.sousChapitreId!,
      mairieId: DEFAULT_MAIRIE_ID,
      montantPrevu: formData.value.montantPrevu,
      montantEngage,
      montantDisponible,
      observations: formData.value.observations,
      statut: formData.value.statut,
      personnelId: 1,
      createdAt: now,
      updatedAt: now,
    } satisfies Omit<PrevisionInvestissement, 'id'>;

    if (editingId.value) {
      await db.previsionsInvestissement.update(editingId.value, { ...data, updatedAt: now });
      $q.notify({ type: 'positive', message: 'Prévision modifiée avec succès' });
    } else {
      await db.previsionsInvestissement.add(data);
      $q.notify({ type: 'positive', message: 'Prévision ajoutée avec succès' });
    }

    showAddDialog.value = false;
    resetForm();
    await loadData();
  } catch (error) {
    console.error('Erreur lors de la sauvegarde:', error);
    $q.notify({ type: 'negative', message: "Erreur lors de l'enregistrement" });
  }
}

function deletePrevision(row: PrevisionInvestissement) {
  $q.dialog({
    title: 'Confirmation',
    message: 'Voulez-vous vraiment supprimer cette prévision ?',
    cancel: true,
    persistent: true,
  }).onOk(() => {
    void (async () => {
      try {
        if (row.id) {
          await db.previsionsInvestissement.delete(row.id);
          $q.notify({ type: 'positive', message: 'Prévision supprimée avec succès' });
          await loadData();
        }
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        $q.notify({ type: 'negative', message: 'Erreur lors de la suppression' });
      }
    })();
  });
}

function printCT02() {
  loadingCT02.value = true;
  try {
    // Filtrer les prévisions et mandats selon les filtres CT02
    const exercice = ct02Filters.value.exercice;
    const sousChapitreId = ct02Filters.value.sousChapitreId;

    let filteredPrevs = previsions.value.filter((p) => p.exercice === exercice);
    let filteredMandats = mandats.value.filter((m) => m.exercice === exercice);

    if (sousChapitreId) {
      filteredPrevs = filteredPrevs.filter(
        (p) => p.sousChapitreInvestissementId === sousChapitreId,
      );
      filteredMandats = filteredMandats.filter(
        (m) => m.sousChapitreInvestissementId === sousChapitreId,
      );
    }

    const sousChapitre = sousChapitreId
      ? sousChapitres.value.find((s) => s.id === sousChapitreId)
      : null;

    // Ouvrir la page CT02
    const printWindow = window.open('/CT02.html', '_blank');
    if (printWindow) {
      printWindow.addEventListener('load', () => {
        printWindow.postMessage(
          {
            type: 'FILL_CT02',
            data: {
              exercice,
              type: 'investissement',
              sousChapitre: sousChapitre
                ? `${sousChapitre.code} - ${sousChapitre.libelle}`
                : 'Tous',
              previsions: filteredPrevs,
              mandats: filteredMandats,
              chapitres: chapitres.value,
              sousChapitres: sousChapitres.value,
            },
          },
          '*',
        );
      });
    }

    showCT02Dialog.value = false;
  } catch (error) {
    console.error('Erreur CT02:', error);
    $q.notify({ type: 'negative', message: "Erreur lors de l'impression" });
  } finally {
    loadingCT02.value = false;
  }
}

onMounted(() => {
  void loadData();
});
</script>

<style scoped lang="scss">
.prevision-page {
  max-width: 1400px;
  margin: 0 auto;
}

.main-card {
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}
</style>
