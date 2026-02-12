<template>
  <q-page class="q-pa-md">
    <PageHeader
      title="Gestion des Bordereaux de Mandats"
      subtitle="Bordereaux de mandats pour les dépenses budgétaires"
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
            <div class="text-h6">{{ formatMontant(montantTotal) }}</div>
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
      show-export-csv
      export-filename="bordereaux-mandats"
      @view="viewMandats"
      @print="printBordereau"
      @download="downloadBordereauPDF"
      @edit="openDialog"
      @delete="confirmDelete"
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
    <BordereauMandatDialog
      v-model="dialogVisible"
      :bordereau="currentBordereau"
      :is-editing="isEditing"
      :statut-options="statutOptions"
      :readonly="!authStore.isAdmin"
      :loading="saving"
      :next-numero="nextNumeroBordereau"
      @submit="onSubmit"
    />

    <!-- Dialog pour voir les mandats -->
    <q-dialog v-model="mandatsDialogVisible" maximized>
      <q-card>
        <q-card-section class="accent-left">
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
                  {{ formatStatut(props.row.statut) }}
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
import { db, type BordereauMandat, type Mairie, type Mandat } from 'src/database/db';
import { useAuthStore } from 'src/stores/auth-store';
import { openPrintWindow } from 'src/utils/printUrl';
import FilterBar from 'src/components/FilterBar.vue';
import DataTable from 'src/components/DataTable.vue';
import PageHeader from 'src/components/PageHeader.vue';
import BordereauMandatDialog from 'src/components/BordereauMandatDialog.vue';

const $q = useQuasar();
const authStore = useAuthStore();

const bordereaux = ref<BordereauMandat[]>([]);
const mairies = ref<Mairie[]>([]);
const loading = ref(false);
const nextNumeroBordereau = ref<number>(1);
const saving = ref(false);
const dialogVisible = ref(false);
const isEditing = ref(false);
const currentBordereau = ref<BordereauMandat | null>(null);
const search = ref('');
const filterStatut = ref('');
const filterDateDebut = ref('');
const filterDateFin = ref('');
const mandatsDialogVisible = ref(false);
const bordereauMandats = ref<Mandat[]>([]);
const loadingMandats = ref(false);
const selectedBordereau = ref<BordereauMandat | null>(null);

const statutOptions = ['ouvert', 'ferme'];

const columns = [
  { name: 'numero', label: 'N°', field: 'numero', align: 'center' as const, sortable: true },
  {
    name: 'exercice',
    label: 'Exercice',
    field: 'exercice',
    align: 'center' as const,
    sortable: true,
  },
  {
    name: 'dateEmission',
    label: "Date d'émission",
    field: 'dateEmission',
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
    name: 'beneficiaire',
    label: 'Bénéficiaire',
    field: 'beneficiaire',
    align: 'left' as const,
    sortable: true,
  },
  {
    name: 'objet',
    label: 'Objet',
    field: 'objet',
    align: 'left' as const,
    sortable: true,
  },
  {
    name: 'montant',
    label: 'Montant',
    field: 'montant',
    align: 'right' as const,
    sortable: true,
  },
  {
    name: 'statut',
    label: 'Statut',
    field: 'statut',
    align: 'center' as const,
    sortable: true,
  },
];

const bordereauMandatsTotal = computed(() => {
  return bordereauMandats.value.reduce((sum, mandat) => sum + (mandat.montant || 0), 0);
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

const montantTotal = computed(() => {
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

async function calculateNextNumeroBordereau() {
  const currentYear = new Date().getFullYear();
  const bordereauxThisYear = await db.bordereauMandats
    .where('exercice')
    .equals(currentYear)
    .toArray();

  if (bordereauxThisYear.length === 0) {
    nextNumeroBordereau.value = 1;
  } else {
    const maxNumero = Math.max(...bordereauxThisYear.map((b) => b.numero));
    nextNumeroBordereau.value = maxNumero + 1;
  }
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
    emis: 'info',
    valide: 'green',
    paye: 'green',
    annule: 'red',
  };
  return colors[statut] || 'grey';
}

function formatStatut(statut: string): string {
  const statuts: Record<string, string> = {
    brouillon: 'Brouillon',
    emis: 'Émis',
    valide: 'Validé',
    paye: 'Payé',
    annule: 'Annulé',
  };
  return statuts[statut] || statut;
}

function formatDate(dateValue: Date): string {
  return date.formatDate(dateValue, 'DD/MM/YYYY');
}

async function viewMandats(bordereau: BordereauMandat) {
  selectedBordereau.value = bordereau;
  loadingMandats.value = true;
  mandatsDialogVisible.value = true;

  try {
    bordereauMandats.value = await db.mandats
      .where('bordereauMandatId')
      .equals(bordereau.id!)
      .toArray();
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
    [bordereaux.value, mairies.value] = await Promise.all([
      db.bordereauMandats.toArray(),
      db.mairies.toArray(),
    ]);
  } catch (error) {
    console.error('Erreur:', error);
    $q.notify({ type: 'negative', message: 'Erreur lors du chargement' });
  } finally {
    loading.value = false;
  }
}

async function openDialog(bordereau?: BordereauMandat) {
  isEditing.value = !!bordereau;
  currentBordereau.value = bordereau || null;
  if (!bordereau) {
    await calculateNextNumeroBordereau();
  }
  dialogVisible.value = true;
}

async function onSubmit(formData: Partial<BordereauMandat>) {
  saving.value = true;
  try {
    const now = new Date();
    const data = {
      ...formData,
      personnelId: authStore.currentUser?.id ?? 0,
    };

    if (isEditing.value && formData.id) {
      await db.bordereauMandats.update(formData.id, { ...data, updatedAt: now });
      $q.notify({ type: 'positive', message: 'Bordereau modifié' });
    } else {
      await db.bordereauMandats.add({ ...data, createdAt: now, updatedAt: now } as BordereauMandat);
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

function confirmDelete(bordereau: BordereauMandat) {
  $q.dialog({
    title: 'Confirmation',
    message: `Supprimer le bordereau "${bordereau.numero}" ?`,
    cancel: true,
    persistent: true,
  }).onOk(() => {
    void (async () => {
      try {
        await db.bordereauMandats.delete(bordereau.id);
        $q.notify({ type: 'positive', message: 'Bordereau supprimé' });
        await loadData();
      } catch (error) {
        console.error('Erreur:', error);
        $q.notify({ type: 'negative', message: 'Erreur lors de la suppression' });
      }
    })();
  });
}

function printBordereau(bordereau: BordereauMandat) {
  // Afficher un dialog avec les deux options d'impression (radio)
  $q.dialog({
    title: 'Impression du Bordereau',
    message: 'Choisissez le type de bordereau à imprimer :',
    options: {
      type: 'radio',
      model: 'emission',
      items: [
        { label: "Bordereau d'Émission", value: 'emission' },
        { label: 'Bordereau de Rejet (mandats annulés)', value: 'rejet' },
      ],
    },
    cancel: true,
    persistent: true,
  }).onOk((selected: string) => {
    if (selected === 'emission') {
      openPrintWindow('bordereau_mandat.html', { bordereauId: bordereau.id! });
    } else if (selected === 'rejet') {
      openPrintWindow('bordereau_mandat_rejet.html', { bordereauId: bordereau.id! });
    }
  });
}

function downloadBordereauPDF(bordereau: BordereauMandat) {
  openPrintWindow('bordereau_mandat.html', { bordereauId: bordereau.id!, print: 'true' });
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
