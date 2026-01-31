<template>
  <q-page class="q-pa-md">
    <PageHeader
      title="Gestion des Bordereaux de Mandats de Recette"
      subtitle="Bordereaux pour les mandats de recettes"
      icon="receipt_long"
    >
      <template #actions>
        <q-btn color="primary" icon="add" label="Nouveau Bordereau" @click="openDialog()" />
      </template>
    </PageHeader>

    <!-- Recherche et filtres -->
    <FilterBar
      v-model:search="search"
      v-model:statut="filterStatut"
      v-model:date-debut="filterDateDebut"
      v-model:date-fin="filterDateFin"
      :statut-options="statutOptions"
      show-statut
      show-date-range
      search-placeholder="Rechercher N° bordereau..."
      @reset="resetFilters"
    />

    <!-- Statistiques -->
    <div class="row q-col-gutter-sm q-mb-md">
      <div class="col-12 col-md-3">
        <q-card>
          <q-card-section>
            <div class="text-caption text-grey-7">Total Bordereaux</div>
            <div class="text-h6">{{ filteredBordereaux.length }}</div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-md-3">
        <q-card>
          <q-card-section>
            <div class="text-caption text-grey-7">Montant Total</div>
            <div class="text-h6">{{ formatMontant(totalMontant) }}</div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-md-3">
        <q-card>
          <q-card-section>
            <div class="text-caption text-grey-7">Bordereaux Ouverts</div>
            <div class="text-h6">{{ bordereauxOuverts }}</div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-md-3">
        <q-card>
          <q-card-section>
            <div class="text-caption text-grey-7">Bordereaux Fermés</div>
            <div class="text-h6">{{ bordereauxFermes }}</div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Table des bordereaux -->
    <DataTable
      :rows="filteredBordereaux"
      :columns="columns"
      :loading="loading"
      show-view
      show-print
      show-download
      @view="viewMandats"
      @print="printBordereau"
      @download="downloadBordereauPDF"
      @edit="openDialog"
      @delete="confirmDelete"
      title-label="Bordereau"
    >
      <template v-slot:body-cell-numero="props">
        <q-td :props="props">
          {{ formatNumeroBordereau(props.row.numero, props.row.exercice) }}
        </q-td>
      </template>

      <template v-slot:body-cell-statut="props">
        <q-td :props="props">
          <q-chip :color="getStatutColor(props.row.statut)" text-color="white" size="sm">
            {{ props.row.statut }}
          </q-chip>
        </q-td>
      </template>

      <template v-slot:body-cell-montantTotal="props">
        <q-td :props="props">
          {{ formatMontant(props.row.montantTotal) }}
        </q-td>
      </template>

      <template v-slot:body-cell-dateEmission="props">
        <q-td :props="props">
          {{ props.row.dateEmission ? formatDate(props.row.dateEmission) : '-' }}
        </q-td>
      </template>
    </DataTable>

    <!-- Dialog de création/modification -->
    <q-dialog v-model="dialogVisible" persistent>
      <q-card style="min-width: 500px">
        <q-card-section class="bg-primary text-white row items-center">
          <div class="text-h6">{{ isEditing ? 'Modifier' : 'Nouveau' }} Bordereau</div>
          <q-space />
          <q-btn flat round dense icon="close" v-close-popup />
        </q-card-section>

        <q-card-section>
          <q-form class="q-gutter-md">
            <q-input
              v-model.number="form.numero"
              type="number"
              label="Numéro Bordereau *"
              outlined
              :rules="[(val) => val > 0 || 'Numéro requis']"
            />

            <q-select
              v-model="form.exercice"
              :options="exerciceOptions"
              label="Exercice (Année) *"
              outlined
            />

            <q-input v-model="formDateStr" type="date" label="Date d'émission" outlined />

            <q-input
              v-model.number="form.totalPrecedent"
              type="number"
              label="Total précédent"
              outlined
              prefix="FCFA"
            />

            <q-select v-model="form.statut" :options="statutOptions" label="Statut" outlined />

            <q-input v-model="form.observations" label="Observations" outlined type="textarea" />
          </q-form>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Annuler" color="grey" v-close-popup />
          <q-btn label="Enregistrer" color="primary" :loading="saving" @click="onSubmit" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Dialog pour voir les mandats -->
    <q-dialog v-model="mandatsDialogVisible" maximized>
      <q-card>
        <q-card-section class="bg-primary text-white">
          <div class="row items-center">
            <div class="col">
              <div class="text-h6">
                Mandats du Bordereau N°
                {{
                  selectedBordereau
                    ? formatNumeroBordereau(selectedBordereau.numero, selectedBordereau.exercice)
                    : ''
                }}
              </div>
              <div class="text-caption">
                {{ bordereauMandats.length }} mandat(s) -
                {{ formatMontant(bordereauMandatsTotal) }}
              </div>
            </div>
            <q-btn flat round dense icon="close" v-close-popup />
          </div>
        </q-card-section>

        <q-card-section>
          <q-table
            :rows="bordereauMandats"
            :columns="mandatsColumns"
            row-key="id"
            :loading="loadingMandats"
            :pagination="{ rowsPerPage: 20 }"
            title="Liste des Mandats de Recette"
          >
            <template v-slot:body-cell-dateMandat="props">
              <q-td :props="props">
                {{ formatDate(props.row.dateMandat) }}
              </q-td>
            </template>

            <template v-slot:body-cell-montant="props">
              <q-td :props="props">
                {{ formatMontant(props.row.montant) }}
              </q-td>
            </template>

            <template v-slot:body-cell-statut="props">
              <q-td :props="props">
                <q-chip
                  :color="getMandatStatutColor(props.row.statut)"
                  text-color="white"
                  size="sm"
                >
                  {{ props.row.statut }}
                </q-chip>
              </q-td>
            </template>
          </q-table>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useQuasar, date } from 'quasar';
import {
  db,
  type BordereauMandatRecette,
  type MandatRecette,
  DEFAULT_MAIRIE_ID,
} from 'src/database/db';
import FilterBar from 'src/components/FilterBar.vue';
import DataTable from 'src/components/DataTable.vue';
import PageHeader from 'src/components/PageHeader.vue';
import { openPrintWindow } from 'src/utils/printUrl';

const $q = useQuasar();

const bordereaux = ref<BordereauMandatRecette[]>([]);
const loading = ref(false);
const saving = ref(false);
const dialogVisible = ref(false);
const isEditing = ref(false);
const currentBordereau = ref<BordereauMandatRecette | null>(null);
const search = ref('');
const filterStatut = ref('');
const filterDateDebut = ref('');
const filterDateFin = ref('');
const mandatsDialogVisible = ref(false);
const bordereauMandats = ref<MandatRecette[]>([]);
const loadingMandats = ref(false);
const selectedBordereau = ref<BordereauMandatRecette | null>(null);
const formDateStr = ref('');

const currentYear = new Date().getFullYear();
const exerciceOptions = [2023, 2024, 2025, 2026];
const statutOptions = ['ouvert', 'ferme'];

const form = ref<Partial<BordereauMandatRecette>>({
  numero: 1,
  exercice: currentYear,
  mairieId: DEFAULT_MAIRIE_ID,
  montantTotal: 0,
  nombreMandats: 0,
  totalPrecedent: 0,
  statut: 'ouvert',
  observations: '',
});

const columns = [
  { name: 'id', label: 'ID', field: 'id', align: 'center' as const, sortable: true },
  { name: 'numero', label: 'N°', field: 'numero', align: 'center' as const, sortable: true },
  {
    name: 'exercice',
    label: 'Exercice',
    field: 'exercice',
    align: 'center' as const,
    sortable: true,
  },
  {
    name: 'nombreMandats',
    label: 'Nb Mandats',
    field: 'nombreMandats',
    align: 'center' as const,
    sortable: true,
  },
  {
    name: 'montantTotal',
    label: 'Montant Total',
    field: 'montantTotal',
    align: 'right' as const,
    sortable: true,
  },
  {
    name: 'dateEmission',
    label: 'Date Émission',
    field: 'dateEmission',
    align: 'left' as const,
    sortable: true,
  },
  { name: 'statut', label: 'Statut', field: 'statut', align: 'center' as const, sortable: true },
  { name: 'actions', label: 'Actions', field: 'actions', align: 'center' as const },
];

const mandatsColumns = [
  {
    name: 'numeroMandat',
    label: 'N° Mandat',
    field: 'numeroMandat',
    align: 'left' as const,
    sortable: true,
  },
  {
    name: 'dateMandat',
    label: 'Date',
    field: 'dateMandat',
    align: 'left' as const,
    sortable: true,
  },
  {
    name: 'partieVersante',
    label: 'Partie Versante',
    field: 'partieVersante',
    align: 'left' as const,
    sortable: true,
  },
  { name: 'objet', label: 'Objet', field: 'objet', align: 'left' as const },
  { name: 'montant', label: 'Montant', field: 'montant', align: 'right' as const, sortable: true },
  { name: 'statut', label: 'Statut', field: 'statut', align: 'center' as const, sortable: true },
];

const bordereauMandatsTotal = computed(() => {
  return bordereauMandats.value.reduce((sum, m) => sum + (m.montant || 0), 0);
});

const filteredBordereaux = computed(() => {
  let result = bordereaux.value;

  if (filterStatut.value) {
    result = result.filter((b) => b.statut === filterStatut.value);
  }

  if (filterDateDebut.value) {
    const anneeDebut = new Date(filterDateDebut.value).getFullYear();
    result = result.filter((b) => b.exercice >= anneeDebut);
  }

  if (filterDateFin.value) {
    const anneeFin = new Date(filterDateFin.value).getFullYear();
    result = result.filter((b) => b.exercice <= anneeFin);
  }

  if (search.value) {
    const searchLower = search.value.toLowerCase();
    result = result.filter((b) => b.numero.toString().includes(searchLower));
  }

  return result;
});

const totalMontant = computed(() => {
  return filteredBordereaux.value.reduce((sum, b) => sum + (b.montantTotal || 0), 0);
});

const bordereauxOuverts = computed(() => {
  return filteredBordereaux.value.filter((b) => b.statut === 'ouvert').length;
});

const bordereauxFermes = computed(() => {
  return filteredBordereaux.value.filter((b) => b.statut === 'ferme').length;
});

function resetFilters() {
  search.value = '';
  filterStatut.value = '';
  filterDateDebut.value = '';
  filterDateFin.value = '';
}

function formatMontant(montant: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    minimumFractionDigits: 0,
  }).format(montant);
}

function getStatutColor(statut: string): string {
  const colors: Record<string, string> = {
    ouvert: 'orange',
    ferme: 'green',
  };
  return colors[statut] || 'grey';
}

function getMandatStatutColor(statut: string): string {
  const colors: Record<string, string> = {
    brouillon: 'grey',
    emis: 'warning',
    encaisse: 'positive',
    annule: 'negative',
  };
  return colors[statut] || 'grey';
}

function formatDate(dateValue: Date | undefined): string {
  if (!dateValue) return '-';
  return date.formatDate(dateValue, 'DD/MM/YYYY');
}

async function viewMandats(bordereau: BordereauMandatRecette) {
  selectedBordereau.value = bordereau;
  loadingMandats.value = true;
  mandatsDialogVisible.value = true;

  try {
    if (!bordereau.id) {
      bordereauMandats.value = [];
      return;
    }
    bordereauMandats.value = await db.mandatsRecette
      .where('bordereauMandatRecetteId')
      .equals(bordereau.id)
      .toArray();

    // Trier par date décroissante
    bordereauMandats.value.sort((a, b) => {
      const dateA = a.dateMandat ? new Date(a.dateMandat).getTime() : 0;
      const dateB = b.dateMandat ? new Date(b.dateMandat).getTime() : 0;
      return dateB - dateA;
    });
  } catch (error) {
    console.error('Erreur:', error);
    $q.notify({ type: 'negative', message: 'Erreur lors du chargement des mandats' });
  } finally {
    loadingMandats.value = false;
  }
}

function formatNumeroBordereau(numero: number, exercice: number): string {
  const anneeShort = exercice % 100;
  return `${numero}-${anneeShort.toString().padStart(2, '0')}`;
}

async function loadData() {
  loading.value = true;
  try {
    bordereaux.value = await db.bordereauMandatsRecette.toArray();

    // Trier par exercice puis par numéro décroissant
    bordereaux.value.sort((a, b) => {
      if (a.exercice !== b.exercice) {
        return b.exercice - a.exercice;
      }
      return b.numero - a.numero;
    });
  } catch (error) {
    console.error('Erreur:', error);
    $q.notify({ type: 'negative', message: 'Erreur lors du chargement' });
  } finally {
    loading.value = false;
  }
}

function openDialog(bordereau?: BordereauMandatRecette) {
  isEditing.value = !!bordereau;
  currentBordereau.value = bordereau || null;

  if (bordereau) {
    form.value = { ...bordereau };
    formDateStr.value = bordereau.dateEmission
      ? date.formatDate(bordereau.dateEmission, 'YYYY-MM-DD')
      : '';
  } else {
    // Calculer le prochain numéro
    const bordereauxThisYear = bordereaux.value.filter((b) => b.exercice === currentYear);
    const nextNum =
      bordereauxThisYear.length > 0 ? Math.max(...bordereauxThisYear.map((b) => b.numero)) + 1 : 1;

    form.value = {
      numero: nextNum,
      exercice: currentYear,
      mairieId: DEFAULT_MAIRIE_ID,
      montantTotal: 0,
      nombreMandats: 0,
      totalPrecedent: 0,
      statut: 'ouvert',
      observations: '',
    };
    formDateStr.value = '';
  }
  dialogVisible.value = true;
}

async function onSubmit() {
  if (!form.value.numero || form.value.numero <= 0) {
    $q.notify({ type: 'warning', message: 'Veuillez remplir les champs obligatoires' });
    return;
  }

  saving.value = true;
  try {
    const now = new Date();
    const data: Partial<BordereauMandatRecette> = {
      ...form.value,
      updatedAt: now,
    };

    // Only set dateEmission if there's a value
    if (formDateStr.value) {
      data.dateEmission = new Date(formDateStr.value);
    }

    if (isEditing.value && form.value.id) {
      await db.bordereauMandatsRecette.update(form.value.id, data);
      $q.notify({ type: 'positive', message: 'Bordereau modifié' });
    } else {
      data.createdAt = now;
      data.personnelId = 1;
      await db.bordereauMandatsRecette.add(data as BordereauMandatRecette);
      $q.notify({ type: 'positive', message: 'Bordereau créé' });
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

function confirmDelete(bordereau: BordereauMandatRecette) {
  $q.dialog({
    title: 'Confirmation',
    message: `Supprimer le bordereau "${bordereau.numero}" ?`,
    cancel: true,
    persistent: true,
  }).onOk(() => {
    void (async () => {
      try {
        await db.bordereauMandatsRecette.delete(bordereau.id);
        $q.notify({ type: 'positive', message: 'Bordereau supprimé' });
        await loadData();
      } catch (error) {
        console.error('Erreur:', error);
        $q.notify({ type: 'negative', message: 'Erreur lors de la suppression' });
      }
    })();
  });
}

function printBordereau(bordereau: BordereauMandatRecette) {
  // Impression directe du bordereau d'émission (pas de bordereau de rejet pour les recettes)
  openPrintWindow('bordereau_mandat_recette.html', { bordereauId: bordereau.id! });
}

function downloadBordereauPDF(bordereau: BordereauMandatRecette) {
  openPrintWindow('bordereau_mandat_recette.html', { bordereauId: bordereau.id!, print: 'true' });
}

onMounted(() => {
  void loadData();
});
</script>

<style scoped lang="scss">
.no-print {
  @media print {
    display: none !important;
  }
}
</style>
