<template>
  <q-page class="q-pa-md">
    <PageHeader
      title="Gestion des Bordereaux de Mandats"
      subtitle="Bordereaux de mandats pour les dépenses budgétaires"
      icon="receipt_long"
    >
      <template #actions>
        <q-btn
          color="secondary"
          icon="upload_file"
          label="Importer un PDF"
          :loading="importingPdf"
          @click="pdfFileInput?.pickFiles()"
        />
        <q-file
          ref="pdfFileInput"
          v-model="pdfFile"
          accept="application/pdf,.pdf"
          class="hidden"
          @update:model-value="onPdfSelected"
        />
        <q-btn
          color="primary"
          icon="add"
          label="Nouveau Bordereau"
          data-visite="depenses-nouveau-bordereau"
          @click="openDialog()"
        />
        <q-btn
          v-if="isDev"
          color="orange"
          icon="science"
          label="Fake Bordereau"
          @click="createFakeBordereau"
        />
      </template>
    </PageHeader>

    <div class="compact-toolbar q-mb-md">
      <div class="compact-toolbar-top row items-center q-col-gutter-sm">
        <div class="col-12 col-md-5">
          <q-input
            v-model="search"
            placeholder="Rechercher N° bordereau..."
            outlined
            dense
            clearable
            class="compact-search"
          >
            <template v-slot:prepend>
              <q-icon name="search" />
            </template>
          </q-input>
        </div>
        <div class="col-12 col-md-auto compact-toolbar-summary">
          <q-chip outline color="primary" icon="filter_alt" size="sm">
            {{ activeFiltersCount }} filtre{{ activeFiltersCount > 1 ? 's' : '' }}
          </q-chip>
        </div>
        <div class="col-12 col-md-auto compact-toolbar-actions">
          <q-btn dense outline color="grey-7" icon="tune" label="Filtres" no-caps>
            <q-menu class="compact-filter-menu" anchor="bottom right" self="top right">
              <div class="compact-filter-panel">
                <div class="compact-filter-panel-title">Filtres avancés</div>
                <div class="row q-col-gutter-sm">
                  <div class="col-12 col-sm-6 col-md-4">
                    <q-select
                      v-model="filterStatut"
                      :options="statutOptions"
                      label="Statut"
                      outlined
                      dense
                      clearable
                    />
                  </div>
                  <div class="col-12 col-sm-6 col-md-4">
                    <q-input
                      v-model="filterDateDebut"
                      label="Date début"
                      outlined
                      dense
                      type="date"
                      clearable
                    />
                  </div>
                  <div class="col-12 col-sm-6 col-md-4">
                    <q-input
                      v-model="filterDateFin"
                      label="Date fin"
                      outlined
                      dense
                      type="date"
                      clearable
                    />
                  </div>
                  <div class="col-12 col-sm-6 col-md-4">
                    <q-btn
                      label="Réinitialiser"
                      icon="refresh"
                      outline
                      color="grey-7"
                      @click="resetFilters"
                      class="full-width"
                    />
                  </div>
                </div>
              </div>
            </q-menu>
          </q-btn>
          <q-btn color="primary" icon="add" label="Nouveau" unelevated no-caps @click="openDialog()" />
          <q-btn
            v-if="isDev"
            color="orange"
            icon="science"
            label="Fake"
            unelevated
            no-caps
            @click="createFakeBordereau"
          />
        </div>
      </div>
    </div>

    <!-- Statistiques -->
    <div class="listing-stats-row row q-col-gutter-sm q-mb-md">
      <div class="col-12 col-md-3">
        <q-card class="listing-stat-card">
          <q-card-section>
            <div class="text-caption text-grey-7">Total Bordereaux</div>
            <div class="text-h6">{{ filteredBordereaux.length }}</div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-md-3">
        <q-card class="listing-stat-card">
          <q-card-section>
            <div class="text-caption text-grey-7">Montant Total</div>
            <div class="text-h6">{{ formatMontant(montantTotal) }}</div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-md-3">
        <q-card class="listing-stat-card">
          <q-card-section>
            <div class="text-caption text-grey-7">Bordereaux Ouverts</div>
            <div class="text-h6">{{ bordereauxOuverts }}</div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-md-3">
        <q-card class="listing-stat-card">
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
      data-visite-print="depenses-imprimer-bordereau"
      @print="printBordereau"
      @download="downloadBordereauPDF"
      data-visite-edit="depenses-modifier-bordereau"
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
          <q-chip
            :color="getStatutColor(props.row.statut)"
            text-color="white"
            size="sm"
            clickable
            @click="toggleStatut(props.row)"
            style="cursor: pointer"
          >
            {{ props.row.statut }}
            <q-tooltip>Cliquer pour changer le statut</q-tooltip>
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

    <!-- Dialog d'impression : type de bordereau + options d'affichage -->
    <q-dialog v-model="printDialogVisible" persistent>
      <q-card class="dialog-card" style="width: min(460px, 96vw); max-width: 96vw">
        <q-card-section class="accent-left">
          <div class="text-h6">Impression du Bordereau</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <div class="text-body2 q-mb-sm">Choisissez le type de bordereau à imprimer :</div>
          <q-option-group
            v-model="printType"
            type="radio"
            :options="[
              { label: 'Bordereau d\'Émission', value: 'emission' },
              { label: 'Bordereau de Rejet (mandats annulés)', value: 'rejet' },
            ]"
          />

          <q-separator class="q-my-md" />

          <q-toggle
            v-model="printControlePec"
            :disable="printType !== 'emission'"
            label="Calculer le contrôle des prises en charge"
          />
          <div class="text-caption text-grey-7 q-ml-sm">
            {{
              printType === 'emission'
                ? 'Cumul des montants mandatés par compte, en bas du bordereau.'
                : 'Disponible uniquement sur le bordereau d’émission.'
            }}
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Annuler" color="grey-7" v-close-popup />
          <q-btn unelevated label="Imprimer" color="primary" @click="confirmPrintBordereau" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useQuasar, date } from 'quasar';
import { db, type BordereauMandat, type Exercice, type Mairie, type Mandat } from 'src/database/db';
import { useAuthStore } from 'src/stores/auth-store';
import { openPrintWindow } from 'src/utils/printUrl';
import DataTable from 'src/components/DataTable.vue';
import PageHeader from 'src/components/PageHeader.vue';
import BordereauMandatDialog from 'src/components/BordereauMandatDialog.vue';
import { importDepensePdf } from 'src/services/depensePdfImport';

const $q = useQuasar();
const authStore = useAuthStore();

const pdfFileInput = ref<{ pickFiles: () => void } | null>(null);
const pdfFile = ref<File | null>(null);
const importingPdf = ref(false);

async function onPdfSelected(file: File | null) {
  if (!file || importingPdf.value) return;
  importingPdf.value = true;
  try {
    const result = await importDepensePdf(file);
    await loadData();
    const details = `${result.bordereauxCrees} bordereau(x) et ${result.mandatsCrees} mandat(s) créé(s)`;
    const duplicates = result.doublonsIgnores
      ? ` ; ${result.doublonsIgnores} doublon(s) ignoré(s)`
      : '';
    $q.notify({
      type: result.bordereauxCrees ? 'positive' : 'info',
      message: `${details}${duplicates}.`,
      timeout: 7000,
    });
    if (result.avertissements.length) {
      $q.dialog({
        title: 'Import terminé avec écarts source',
        message: result.avertissements.join('\n'),
        ok: true,
      });
    }
  } catch (error) {
    console.error("Erreur d'import PDF:", error);
    $q.notify({
      type: 'negative',
      message: error instanceof Error ? error.message : "Échec de l'import PDF.",
      timeout: 8000,
    });
  } finally {
    importingPdf.value = false;
    pdfFile.value = null;
  }
}

const bordereaux = ref<BordereauMandat[]>([]);
const mairies = ref<Mairie[]>([]);
const exercices = ref<Exercice[]>([]);
const lockedYears = computed(() =>
  exercices.value.filter((e) => e.statut === 'verrouille').map((e) => e.annee),
);
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

const activeFiltersCount = computed(() => {
  return [filterStatut.value, filterDateDebut.value, filterDateFin.value].filter(
    (value) => value !== null && value !== '',
  ).length;
});

const filteredBordereaux = computed(() => {
  let result = bordereaux.value;

  if (lockedYears.value.length > 0) {
    result = result.filter((b) => !lockedYears.value.includes(b.exercice));
  }

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

async function toggleStatut(bordereau: BordereauMandat) {
  if (!bordereau.id) return;
  const newStatut = bordereau.statut === 'ouvert' ? 'ferme' : 'ouvert';
  try {
    await db.bordereauMandats.update(bordereau.id, {
      statut: newStatut,
      updatedAt: new Date(),
    });
    bordereau.statut = newStatut;
    $q.notify({
      type: 'positive',
      message: `Bordereau ${formatNumeroBordereau(bordereau.numero, bordereau.exercice)} → ${newStatut}`,
    });
  } catch (error) {
    console.error('Erreur:', error);
    $q.notify({ type: 'negative', message: 'Erreur lors du changement de statut' });
  }
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
    [bordereaux.value, mairies.value, exercices.value] = await Promise.all([
      db.bordereauMandats.toArray(),
      db.mairies.toArray(),
      db.exercices.toArray(),
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

const printDialogVisible = ref(false);
const printType = ref<'emission' | 'rejet'>('emission');
const printControlePec = ref(true);
const bordereauToPrint = ref<BordereauMandat | null>(null);

function printBordereau(bordereau: BordereauMandat) {
  bordereauToPrint.value = bordereau;
  printType.value = 'emission';
  printControlePec.value = true;
  printDialogVisible.value = true;
}

function confirmPrintBordereau() {
  const bordereau = bordereauToPrint.value;
  if (!bordereau) return;
  printDialogVisible.value = false;

  if (printType.value === 'emission') {
    openPrintWindow('bordereau_mandat.html', {
      Numbordereau: bordereau.numero,
      Annee: bordereau.exercice,
      // Valeur initiale de la case dans la barre d'options du bordereau,
      // que l'utilisateur peut encore modifier une fois le document ouvert.
      controlePec: printControlePec.value ? 1 : 0,
    });
  } else {
    // Le bordereau de rejet n'a pas de bloc de contrôle des prises en charge.
    openPrintWindow('bordereau_mandat_rejet.html', {
      Numbordereau: bordereau.numero,
      Annee: bordereau.exercice,
    });
  }
}

function downloadBordereauPDF(bordereau: BordereauMandat) {
  openPrintWindow('bordereau_mandat.html', {
    Numbordereau: bordereau.numero,
    Annee: bordereau.exercice,
  });
}

const isDev = import.meta.env.VITE_ENV === 'development';

async function createFakeBordereau() {
  try {
    const currentYear = new Date().getFullYear();
    const bordereauxThisYear = await db.bordereauMandats
      .where('exercice')
      .equals(currentYear)
      .toArray();
    const nextNum =
      bordereauxThisYear.length > 0 ? Math.max(...bordereauxThisYear.map((b) => b.numero)) + 1 : 1;
    const now = new Date();
    await db.bordereauMandats.add({
      numero: nextNum,
      exercice: currentYear,
      dateEmission: now,
      mairieId: 1,
      montantTotal: 0,
      nombreMandats: 0,
      statut: 'ouvert',
      personnelId: authStore.currentUser?.id ?? 1,
      createdAt: now,
      updatedAt: now,
    });
    $q.notify({ type: 'positive', message: `Bordereau fake #${nextNum} créé` });
    await loadData();
  } catch (error) {
    console.error('Erreur:', error);
    $q.notify({ type: 'negative', message: 'Erreur création fake' });
  }
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
.compact-toolbar {
  margin-bottom: 14px;
  padding: 10px 12px;
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 18px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(248, 250, 252, 0.92));
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.05);
}

.compact-toolbar-top {
  gap: 10px 0;
}

.compact-search :deep(.q-field__control) {
  min-height: 38px;
}

.compact-toolbar-summary {
  display: flex;
  align-items: center;
}

.compact-toolbar-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

.compact-toolbar-actions :deep(.q-btn) {
  min-height: 36px;
  border-radius: 12px;
}

.compact-filter-panel {
  width: min(760px, 88vw);
  padding: 14px;
}

.compact-filter-panel-title {
  margin-bottom: 10px;
  color: #334155;
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
</style>
