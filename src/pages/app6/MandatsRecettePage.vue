<template>
  <q-page class="mandats-recette-page q-pa-md">
    <PageHeader
      title="Mandats de Recettes"
      subtitle="Gestion des mandats de recettes"
      icon="receipt"
    >
      <template #actions>
        <q-btn
          color="secondary"
          icon="upload_file"
          label="Importer CSV"
          unelevated
          class="q-mr-sm"
          @click="triggerFileUpload"
        >
          <q-tooltip>Importer des mandats depuis un fichier CSV</q-tooltip>
        </q-btn>
        <q-btn color="primary" icon="add" label="Nouveau Mandat" @click="openDialog()" />
        <input
          ref="fileInputRef"
          type="file"
          accept=".csv"
          style="display: none"
          @change="handleFileUpload"
        />
      </template>
    </PageHeader>

    <q-card class="main-card">
      <q-card-section>
        <!-- Filtres -->
        <div class="row q-col-gutter-md q-mb-md">
          <div class="col-12 col-md-2">
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
          <div class="col-12 col-md-2">
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
          <div class="col-12 col-md-2">
            <q-select
              v-model="filterStatut"
              :options="statutFilterOptions"
              label="Statut"
              outlined
              dense
              emit-value
              map-options
              clearable
            />
          </div>
          <div class="col-12 col-md-2">
            <q-input
              v-model="filterDateDebut"
              label="Date début"
              outlined
              dense
              type="date"
              clearable
            />
          </div>
          <div class="col-12 col-md-2">
            <q-input
              v-model="filterDateFin"
              label="Date fin"
              outlined
              dense
              type="date"
              clearable
            />
          </div>
          <div class="col-12 col-md-2">
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
            <q-input v-model="filter" placeholder="Rechercher un mandat..." outlined dense>
              <template v-slot:prepend>
                <q-icon name="search" />
              </template>
            </q-input>
          </div>
        </div>

        <DataTable
          :rows="filteredMandats"
          :columns="columns"
          :loading="loading"
          show-print
          show-download
          @edit="openDialog"
          @delete="confirmDelete"
          @print="printMandat"
          @download="downloadMandatPDF"
        >
          <template v-slot:body-cell-bordereauNumero="props">
            <q-td :props="props">
              {{ getBordereauNumero(props.row.bordereauMandatRecetteId) }}
            </q-td>
          </template>

          <template v-slot:body-cell-montant="props">
            <q-td :props="props">
              {{ formatMontant(props.row.montant) }}
            </q-td>
          </template>

          <template v-slot:body-cell-dateMandat="props">
            <q-td :props="props">
              {{ formatDate(props.row.dateMandat) }}
            </q-td>
          </template>

          <template v-slot:body-cell-statut="props">
            <q-td :props="props">
              <q-chip :color="getStatutColor(props.row.statut)" text-color="white" size="sm">
                {{ formatStatut(props.row.statut) }}
              </q-chip>
            </q-td>
          </template>
        </DataTable>
      </q-card-section>
    </q-card>

    <!-- Dialog d'ajout/modification -->
    <q-dialog v-model="showAddDialog" persistent>
      <q-card style="min-width: 700px">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">{{ editingId ? 'Modifier le mandat' : 'Nouveau mandat' }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <q-form @submit="saveMandat" class="q-gutter-md">
            <div class="row q-col-gutter-md">
              <div class="col-4">
                <q-input
                  v-model="formData.numeroMandat"
                  label="Numéro Mandat *"
                  outlined
                  dense
                  :rules="[(val) => !!val || 'Numéro requis']"
                />
              </div>
              <div class="col-4">
                <q-input
                  v-model="formDataDateStr"
                  label="Date Mandat *"
                  outlined
                  dense
                  type="date"
                  :rules="[(val) => !!val || 'Date requise']"
                />
              </div>
              <div class="col-4">
                <q-input
                  v-model.number="formData.exercice"
                  label="Exercice *"
                  outlined
                  dense
                  type="number"
                  :rules="[(val) => !!val || 'Exercice requis']"
                />
              </div>
            </div>

            <div class="row q-col-gutter-md">
              <div class="col-6">
                <q-select
                  v-model="formData.chapitreId"
                  :options="filteredChapitreOptions"
                  label="Nature de la recette (barre)"
                  outlined
                  dense
                  emit-value
                  map-options
                  use-input
                  input-debounce="0"
                  clearable
                  hint="Sélectionner un chapitre budgétaire"
                  @filter="filterChapitre"
                />
              </div>
              <div class="col-6">
                <q-select
                  v-model="formData.taxeId"
                  :options="filteredTaxeOptions"
                  label="Compte fonctionnel"
                  outlined
                  dense
                  emit-value
                  map-options
                  clearable
                  use-input
                  input-debounce="0"
                  hint="Sélectionner une taxe"
                  @filter="filterTaxe"
                />
              </div>
            </div>

            <q-input
              v-model="formData.partieVersante"
              label="Partie Versante *"
              outlined
              dense
              :rules="[(val) => !!val || 'Partie versante requise']"
            />

            <!-- Bordereau, RIB, Patrimonial sur la même ligne -->
            <div class="row q-col-gutter-md">
              <div class="col-4">
                <q-select
                  v-model="formData.bordereauMandatRecetteId"
                  :options="filteredBordereauOptions"
                  label="Bordereau de Mandat"
                  outlined
                  dense
                  emit-value
                  map-options
                  use-input
                  input-debounce="0"
                  clearable
                  @filter="filterBordereau"
                >
                  <template v-slot:prepend>
                    <q-icon name="description" />
                  </template>
                </q-select>
              </div>
              <div class="col-4">
                <q-input
                  v-model="formData.rib"
                  label="RIB"
                  outlined
                  dense
                  placeholder="Ex: SN001 01234 123456789012 12"
                />
              </div>
              <div class="col-4">
                <q-input
                  v-model="formData.patrimonial"
                  label="Imputation Patrimoniale"
                  outlined
                  dense
                  placeholder="Ex: 6000/1"
                />
              </div>
            </div>

            <q-input
              v-model="formData.objet"
              label="Objet *"
              outlined
              dense
              type="textarea"
              rows="2"
              :rules="[(val) => !!val || 'Objet requis']"
            />

            <div class="row q-col-gutter-md">
              <div class="col-4">
                <q-input
                  v-model.number="formData.montant"
                  label="Montant *"
                  outlined
                  dense
                  type="number"
                  prefix="XOF"
                  :rules="[(val) => val > 0 || 'Montant requis']"
                />
              </div>
              <div class="col-4">
                <q-input v-model="formData.numeroFacture" label="N° Facture" outlined dense />
              </div>
              <div class="col-4">
                <q-input
                  v-model="formDataDateFactureStr"
                  label="Date Facture"
                  outlined
                  dense
                  type="date"
                />
              </div>
            </div>

            <div class="row q-col-gutter-md">
              <div class="col-6">
                <q-select
                  v-model="formData.modePaiement"
                  :options="['virement', 'cheque', 'especes', 'autre']"
                  label="Mode de paiement *"
                  outlined
                  dense
                />
              </div>
              <div class="col-6">
                <q-select
                  v-model="formData.statut"
                  :options="['brouillon', 'emis', 'encaisse', 'rejete']"
                  label="Statut *"
                  outlined
                  dense
                />
              </div>
            </div>

            <q-input
              v-model="formData.observations"
              label="Observations"
              outlined
              dense
              type="textarea"
              rows="2"
            />

            <div class="row justify-end q-gutter-sm q-mt-md">
              <q-btn label="Annuler" flat color="grey-7" v-close-popup />
              <q-btn label="Enregistrer" type="submit" color="primary" unelevated />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Dialog d'import CSV -->
    <q-dialog v-model="showImportDialog" persistent maximized>
      <q-card>
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">
            <q-icon name="upload_file" class="q-mr-sm" />
            Import de mandats de recettes depuis CSV
          </div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <q-banner v-if="importErrors.length > 0" class="bg-negative text-white q-mb-md">
            <template v-slot:avatar>
              <q-icon name="warning" />
            </template>
            {{ importErrors.length }} erreur(s) détectée(s) dans le fichier
          </q-banner>

          <div class="text-subtitle1 q-mb-sm">
            {{ importPreviewData.length }} mandat(s) à importer
          </div>

          <q-table
            :rows="importPreviewData"
            :columns="importPreviewColumns"
            row-key="_rowIndex"
            dense
            flat
            bordered
            :rows-per-page-options="[10, 25, 50, 0]"
            class="import-preview-table"
          >
            <template v-slot:body-cell-_status="props">
              <q-td :props="props">
                <q-icon
                  :name="props.row._hasError ? 'error' : 'check_circle'"
                  :color="props.row._hasError ? 'negative' : 'positive'"
                />
                <q-tooltip v-if="props.row._errorMessage">
                  {{ props.row._errorMessage }}
                </q-tooltip>
              </q-td>
            </template>

            <template v-slot:body-cell-numeroMandat="props">
              <q-td :props="props">
                <span :class="{ 'text-primary': props.row._autoNumero }">
                  {{ props.row.numeroMandat }}
                  <q-tooltip v-if="props.row._autoNumero">Numéro généré automatiquement</q-tooltip>
                </span>
              </q-td>
            </template>

            <template v-slot:body-cell-montant="props">
              <q-td :props="props" class="text-right">
                {{ formatMontant(props.row.montant) }}
              </q-td>
            </template>
          </q-table>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn
            label="Télécharger le template"
            flat
            color="grey-7"
            icon="download"
            @click="downloadTemplate"
          />
          <q-space />
          <q-btn label="Annuler" flat color="grey-7" v-close-popup />
          <q-btn
            label="Importer"
            color="primary"
            unelevated
            icon="upload"
            :disable="importPreviewData.length === 0 || importErrors.length > 0"
            :loading="importLoading"
            @click="executeImport"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useQuasar, date } from 'quasar';
import {
  db,
  type MandatRecette,
  type Chapitre,
  type Taxe,
  type BordereauMandatRecette,
  DEFAULT_MAIRIE_ID,
} from 'src/database/db';
import DataTable from 'src/components/DataTable.vue';
import PageHeader from 'src/components/PageHeader.vue';
import { openPrintWindow } from 'src/utils/printUrl';

const $q = useQuasar();

const mandats = ref<MandatRecette[]>([]);
const chapitres = ref<Chapitre[]>([]);
const taxes = ref<Taxe[]>([]);
const bordereaux = ref<BordereauMandatRecette[]>([]);
const loading = ref(false);

// Import CSV
const fileInputRef = ref<HTMLInputElement | null>(null);
const showImportDialog = ref(false);
const importLoading = ref(false);
const importPreviewData = ref<ImportMandatRecetteRow[]>([]);
const importErrors = ref<string[]>([]);

interface ImportMandatRecetteRow {
  _rowIndex: number;
  _hasError: boolean;
  _errorMessage: string;
  _autoNumero: boolean;
  numeroMandat: string;
  dateMandat: string;
  exercice: number;
  chapitreCode: string;
  taxeCode: string;
  bordereauNumero: string;
  partieVersante: string;
  rib: string;
  patrimonial: string;
  objet: string;
  montant: number;
  numeroFacture: string;
  dateFacture: string;
  modePaiement: string;
  statut: string;
  observations: string;
}

const importPreviewColumns = [
  { name: '_status', label: '', field: '_status', align: 'center' as const, style: 'width: 40px' },
  { name: 'numeroMandat', label: 'N° Mandat', field: 'numeroMandat', align: 'left' as const },
  { name: 'dateMandat', label: 'Date', field: 'dateMandat', align: 'left' as const },
  { name: 'exercice', label: 'Exercice', field: 'exercice', align: 'center' as const },
  {
    name: 'partieVersante',
    label: 'Partie Versante',
    field: 'partieVersante',
    align: 'left' as const,
  },
  { name: 'objet', label: 'Objet', field: 'objet', align: 'left' as const },
  { name: 'montant', label: 'Montant', field: 'montant', align: 'right' as const },
  { name: 'statut', label: 'Statut', field: 'statut', align: 'center' as const },
];

const filter = ref('');
const filterExercice = ref<number | null>(null);
const filterChapitreId = ref<number | null>(null);
const filterStatut = ref<string | null>(null);
const filterDateDebut = ref('');
const filterDateFin = ref('');

const showAddDialog = ref(false);
const editingId = ref<number | null>(null);
const formDataDateStr = ref('');
const formDataDateFactureStr = ref('');

const currentYear = new Date().getFullYear();

const formData = ref<Partial<MandatRecette>>({
  exercice: currentYear,
  numeroMandat: '',
  dateMandat: new Date(),
  partieVersante: '',
  rib: '',
  patrimonial: '',
  objet: '',
  montant: 0,
  numeroFacture: '',
  modePaiement: 'virement',
  statut: 'brouillon',
  observations: '',
});

const columns = [
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
    name: 'exercice',
    label: 'Exercice',
    field: 'exercice',
    align: 'center' as const,
    sortable: true,
  },
  {
    name: 'bordereauNumero',
    label: 'Bordereau',
    field: 'bordereauMandatRecetteId',
    align: 'center' as const,
  },
  {
    name: 'partieVersante',
    label: 'Partie Versante',
    field: 'partieVersante',
    align: 'left' as const,
    sortable: true,
  },
  { name: 'montant', label: 'Montant', field: 'montant', align: 'right' as const, sortable: true },
  { name: 'statut', label: 'Statut', field: 'statut', align: 'center' as const, sortable: true },
  { name: 'actions', label: 'Actions', field: 'actions', align: 'center' as const },
];

const exerciceFilterOptions = computed(() => {
  const years = [...new Set(mandats.value.map((m) => m.exercice))].sort((a, b) => b - a);
  return years.map((y) => ({ label: String(y), value: y }));
});

const chapitreOptions = computed(() =>
  chapitres.value.map((c) => ({ label: `${c.code} - ${c.libelle}`, value: c.id! })),
);

const taxeOptions = computed(() =>
  taxes.value.map((t) => ({ label: `${t.code} - ${t.libelle}`, value: t.id! })),
);

const bordereauOptions = computed(() =>
  bordereaux.value
    .filter((b) => b.statut === 'ouvert')
    .map((b) => ({
      label: `Bordereau ${b.numero}-${b.exercice % 100} (${b.nombreMandats || 0} mandats)`,
      value: b.id!,
    })),
);

const filteredChapitreOptions = ref(chapitreOptions.value);
const filteredTaxeOptions = ref(taxeOptions.value);
const filteredBordereauOptions = ref(bordereauOptions.value);

watch(chapitreOptions, (newOptions) => {
  filteredChapitreOptions.value = newOptions;
});

watch(taxeOptions, (newOptions) => {
  filteredTaxeOptions.value = newOptions;
});

watch(bordereauOptions, (newOptions) => {
  filteredBordereauOptions.value = newOptions;
});

const statutFilterOptions = [
  { label: 'Brouillon', value: 'brouillon' },
  { label: 'Émis', value: 'emis' },
  { label: 'Encaissé', value: 'encaisse' },
  { label: 'Rejeté', value: 'rejete' },
];

const filteredMandats = computed(() => {
  let result = mandats.value;

  if (filterExercice.value) {
    result = result.filter((m) => m.exercice === filterExercice.value);
  }

  if (filterChapitreId.value) {
    result = result.filter((m) => m.chapitreId === filterChapitreId.value);
  }

  if (filterStatut.value) {
    result = result.filter((m) => m.statut === filterStatut.value);
  }

  if (filterDateDebut.value) {
    const debut = new Date(filterDateDebut.value);
    result = result.filter((m) => new Date(m.dateMandat) >= debut);
  }

  if (filterDateFin.value) {
    const fin = new Date(filterDateFin.value);
    fin.setHours(23, 59, 59, 999);
    result = result.filter((m) => new Date(m.dateMandat) <= fin);
  }

  if (filter.value) {
    const searchLower = filter.value.toLowerCase();
    result = result.filter(
      (m) =>
        m.numeroMandat.toLowerCase().includes(searchLower) ||
        m.partieVersante.toLowerCase().includes(searchLower) ||
        m.objet.toLowerCase().includes(searchLower),
    );
  }

  return result;
});

function resetFilters() {
  filter.value = '';
  filterExercice.value = null;
  filterChapitreId.value = null;
  filterStatut.value = null;
  filterDateDebut.value = '';
  filterDateFin.value = '';
}

function filterChapitre(val: string, update: (callback: () => void) => void) {
  if (val === '') {
    update(() => {
      filteredChapitreOptions.value = chapitreOptions.value;
    });
    return;
  }
  update(() => {
    const needle = val.toLowerCase();
    filteredChapitreOptions.value = chapitreOptions.value.filter(
      (v) => v.label.toLowerCase().indexOf(needle) > -1,
    );
  });
}

function filterTaxe(val: string, update: (callback: () => void) => void) {
  if (val === '') {
    update(() => {
      filteredTaxeOptions.value = taxeOptions.value;
    });
    return;
  }
  update(() => {
    const needle = val.toLowerCase();
    filteredTaxeOptions.value = taxeOptions.value.filter(
      (v) => v.label.toLowerCase().indexOf(needle) > -1,
    );
  });
}

function filterBordereau(val: string, update: (callback: () => void) => void) {
  if (val === '') {
    update(() => {
      filteredBordereauOptions.value = bordereauOptions.value;
    });
    return;
  }
  update(() => {
    const needle = val.toLowerCase();
    filteredBordereauOptions.value = bordereauOptions.value.filter(
      (v) => v.label.toLowerCase().indexOf(needle) > -1,
    );
  });
}

function formatMontant(montant: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    minimumFractionDigits: 0,
  }).format(montant);
}

function formatDate(dateValue: Date | undefined): string {
  if (!dateValue) return '-';
  return date.formatDate(dateValue, 'DD/MM/YYYY');
}

function getStatutColor(statut: string): string {
  const colors: Record<string, string> = {
    brouillon: 'grey',
    emis: 'warning',
    encaisse: 'positive',
    rejete: 'negative',
  };
  return colors[statut] || 'grey';
}

function formatStatut(statut: string): string {
  const labels: Record<string, string> = {
    brouillon: 'Brouillon',
    emis: 'Émis',
    encaisse: 'Encaissé',
    rejete: 'Rejeté',
  };
  return labels[statut] || statut;
}

function getBordereauNumero(bordereauId?: number): string {
  if (!bordereauId) return '-';
  const bordereau = bordereaux.value.find((b) => b.id === bordereauId);
  if (!bordereau) return '-';
  return `${bordereau.numero}-${bordereau.exercice % 100}`;
}

async function loadData() {
  loading.value = true;
  try {
    [mandats.value, chapitres.value, taxes.value, bordereaux.value] = await Promise.all([
      db.mandatsRecette.toArray(),
      db.chapitres.toArray(),
      db.taxes.toArray(),
      db.bordereauMandatsRecette.toArray(),
    ]);

    // Trier par date décroissante
    mandats.value.sort((a, b) => {
      return new Date(b.dateMandat).getTime() - new Date(a.dateMandat).getTime();
    });
  } catch (error) {
    console.error('Erreur:', error);
    $q.notify({ type: 'negative', message: 'Erreur lors du chargement' });
  } finally {
    loading.value = false;
  }
}

function openDialog(mandat?: MandatRecette) {
  if (mandat) {
    editingId.value = mandat.id!;
    formData.value = { ...mandat };
    formDataDateStr.value = date.formatDate(mandat.dateMandat, 'YYYY-MM-DD');
    formDataDateFactureStr.value = mandat.dateFacture
      ? date.formatDate(mandat.dateFacture, 'YYYY-MM-DD')
      : '';
  } else {
    editingId.value = null;
    const nextNum = mandats.value.length + 1;
    formData.value = {
      exercice: currentYear,
      numeroMandat: String(nextNum).padStart(4, '0'),
      dateMandat: new Date(),
      ...(chapitres.value[0]?.id !== undefined && { chapitreId: chapitres.value[0].id }),
      ...(taxes.value[0]?.id !== undefined && { taxeId: taxes.value[0].id }),
      partieVersante: '',
      rib: '',
      patrimonial: '',
      objet: '',
      montant: 0,
      numeroFacture: '',
      modePaiement: 'virement',
      statut: 'brouillon',
      observations: '',
    };
    formDataDateStr.value = date.formatDate(new Date(), 'YYYY-MM-DD');
    formDataDateFactureStr.value = '';
  }
  showAddDialog.value = true;
}

async function saveMandat() {
  if (
    !formData.value.numeroMandat ||
    !formData.value.partieVersante ||
    !formData.value.objet ||
    !formData.value.montant ||
    formData.value.montant <= 0
  ) {
    $q.notify({ type: 'warning', message: 'Veuillez remplir tous les champs obligatoires' });
    return;
  }

  try {
    const now = new Date();
    const data: Partial<MandatRecette> = {
      ...formData.value,
      dateMandat: new Date(formDataDateStr.value),
      ...(formDataDateFactureStr.value
        ? { dateFacture: new Date(formDataDateFactureStr.value) }
        : {}),
      mairieId: DEFAULT_MAIRIE_ID,
      updatedAt: now,
    };

    if (editingId.value) {
      await db.mandatsRecette.update(editingId.value, data);
      $q.notify({ type: 'positive', message: 'Mandat modifié avec succès' });
    } else {
      data.createdAt = now;
      data.personnelId = 1;
      await db.mandatsRecette.add(data as MandatRecette);
      $q.notify({ type: 'positive', message: 'Mandat créé avec succès' });
    }

    showAddDialog.value = false;
    await loadData();
  } catch (error) {
    console.error('Erreur:', error);
    $q.notify({ type: 'negative', message: "Erreur lors de l'enregistrement" });
  }
}

function confirmDelete(mandat: MandatRecette) {
  $q.dialog({
    title: 'Confirmation',
    message: `Supprimer le mandat "${mandat.numeroMandat}" ?`,
    cancel: true,
    persistent: true,
  }).onOk(() => {
    void (async () => {
      try {
        await db.mandatsRecette.delete(mandat.id);
        $q.notify({ type: 'positive', message: 'Mandat supprimé' });
        await loadData();
      } catch (error) {
        console.error('Erreur:', error);
        $q.notify({ type: 'negative', message: 'Erreur lors de la suppression' });
      }
    })();
  });
}

function printMandat(mandat: MandatRecette) {
  openPrintWindow('mandat/ordre_de_recette.html', { mandatRecetteId: mandat.id! });
}

function downloadMandatPDF(mandat: MandatRecette) {
  openPrintWindow('mandat/ordre_de_recette.html', { mandatRecetteId: mandat.id!, print: 'true' });
}

// ============================================
// IMPORT CSV FUNCTIONS
// ============================================

function triggerFileUpload() {
  fileInputRef.value?.click();
}

function downloadTemplate() {
  window.open('/templates/mandat_recette_template.csv', '_blank');
}

async function handleFileUpload(event: Event) {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];

  if (!file) return;

  try {
    const text = await file.text();
    await parseCSV(text);
    showImportDialog.value = true;
  } catch (error) {
    console.error('Erreur lors de la lecture du fichier:', error);
    $q.notify({
      type: 'negative',
      message: 'Erreur lors de la lecture du fichier CSV',
    });
  }

  // Reset input pour permettre de sélectionner le même fichier
  target.value = '';
}

async function parseCSV(csvText: string) {
  importPreviewData.value = [];
  importErrors.value = [];

  const lines = csvText.trim().split('\n');
  if (lines.length < 2) {
    importErrors.value.push('Le fichier CSV doit contenir au moins une ligne de données');
    return;
  }

  // Parser l'en-tête
  const headerLine = lines[0];
  if (!headerLine) {
    importErrors.value.push('En-tête CSV manquant');
    return;
  }
  const header = headerLine.split(';').map((h) => h.trim().replace(/^"|"$/g, ''));

  // Compter les mandats existants pour l'année en cours pour générer les numéros auto
  let nextNumero = (await db.mandatsRecette.where('exercice').equals(currentYear).count()) + 1;

  const rows: ImportMandatRecetteRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i]?.trim();
    if (!line) continue;

    const values = line.split(';').map((v) => v.trim().replace(/^"|"$/g, ''));
    const row: Record<string, string> = {};

    header.forEach((h, idx) => {
      row[h] = values[idx] || '';
    });

    let hasError = false;
    let errorMessage = '';
    let autoNumero = false;

    // Validation des champs obligatoires
    if (!row.partieVersante) {
      hasError = true;
      errorMessage = 'Partie versante requise';
    }
    if (!row.objet) {
      hasError = true;
      errorMessage = errorMessage ? `${errorMessage}, Objet requis` : 'Objet requis';
    }
    if (!row.montant || isNaN(Number(row.montant))) {
      hasError = true;
      errorMessage = errorMessage ? `${errorMessage}, Montant invalide` : 'Montant invalide';
    }

    // Si pas de numéro de mandat, générer automatiquement
    let numeroMandat = row.numeroMandat || '';
    if (!numeroMandat) {
      numeroMandat = String(nextNumero++).padStart(4, '0');
      autoNumero = true;
    }

    const exercice = row.exercice ? parseInt(row.exercice) : currentYear;
    const montant = parseFloat(row.montant || '0') || 0;

    rows.push({
      _rowIndex: i,
      _hasError: hasError,
      _errorMessage: errorMessage,
      _autoNumero: autoNumero,
      numeroMandat,
      dateMandat: row.dateMandat || date.formatDate(new Date(), 'YYYY-MM-DD'),
      exercice,
      chapitreCode: row.chapitreCode || '',
      taxeCode: row.taxeCode || '',
      bordereauNumero: row.bordereauNumero || '',
      partieVersante: row.partieVersante || '',
      rib: row.rib || '',
      patrimonial: row.patrimonial || '',
      objet: row.objet || '',
      montant,
      numeroFacture: row.numeroFacture || '',
      dateFacture: row.dateFacture || '',
      modePaiement: row.modePaiement || 'virement',
      statut: row.statut || 'brouillon',
      observations: row.observations || '',
    });

    if (hasError) {
      importErrors.value.push(`Ligne ${i}: ${errorMessage}`);
    }
  }

  importPreviewData.value = rows;
}

async function executeImport() {
  importLoading.value = true;

  try {
    const now = new Date();
    let successCount = 0;

    for (const row of importPreviewData.value) {
      if (row._hasError) continue;

      // Trouver le chapitreId par code
      let chapitreId: number | undefined;
      if (row.chapitreCode) {
        const chapitre = chapitres.value.find((c) => c.code === row.chapitreCode);
        if (chapitre) chapitreId = chapitre.id;
      }

      // Trouver le taxeId par code
      let taxeId: number | undefined;
      if (row.taxeCode) {
        const taxe = taxes.value.find((t) => t.code === row.taxeCode);
        if (taxe) taxeId = taxe.id;
      }

      // Trouver le bordereauMandatRecetteId par numéro
      let bordereauMandatRecetteId: number | undefined;
      if (row.bordereauNumero) {
        const bordereau = bordereaux.value.find((b) => {
          const bNumero = `${b.numero}-${b.exercice % 100}`;
          return bNumero === row.bordereauNumero || String(b.numero) === row.bordereauNumero;
        });
        if (bordereau) {
          bordereauMandatRecetteId = bordereau.id;
        }
      }

      // Parser la date au format DD/MM/YYYY ou YYYY-MM-DD
      let dateMandat: Date;
      if (row.dateMandat.includes('/')) {
        const dateParts = row.dateMandat.split('/');
        const day = dateParts[0] || '1';
        const month = dateParts[1] || '1';
        const year = dateParts[2] || String(currentYear);
        dateMandat = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      } else {
        dateMandat = new Date(row.dateMandat);
      }

      let dateFacture: Date | undefined;
      if (row.dateFacture) {
        if (row.dateFacture.includes('/')) {
          const dateParts = row.dateFacture.split('/');
          const day = dateParts[0] || '1';
          const month = dateParts[1] || '1';
          const year = dateParts[2] || String(currentYear);
          dateFacture = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        } else {
          dateFacture = new Date(row.dateFacture);
        }
      }

      // Mapper le statut 'rejete' vers 'annule' si nécessaire
      const statutValue = row.statut === 'rejete' ? 'annule' : row.statut;

      const insertData: Omit<MandatRecette, 'id'> = {
        numeroMandat: row.numeroMandat,
        dateMandat,
        exercice: row.exercice,
        chapitreId: chapitreId ?? 0,
        taxeId: taxeId ?? 0,
        ...(bordereauMandatRecetteId !== undefined && { bordereauMandatRecetteId }),
        partieVersante: row.partieVersante,
        rib: row.rib,
        patrimonial: row.patrimonial,
        objet: row.objet,
        montant: row.montant,
        numeroFacture: row.numeroFacture,
        ...(dateFacture && { dateFacture }),
        modePaiement: row.modePaiement as 'virement' | 'cheque' | 'especes' | 'autre',
        statut: statutValue as 'brouillon' | 'emis' | 'encaisse' | 'annule',
        observations: row.observations,
        mairieId: DEFAULT_MAIRIE_ID,
        personnelId: 1,
        createdAt: now,
        updatedAt: now,
      };

      await db.mandatsRecette.add(insertData as MandatRecette);
      successCount++;
    }

    $q.notify({
      type: 'positive',
      message: `${successCount} mandat(s) de recette importé(s) avec succès`,
    });

    showImportDialog.value = false;
    importPreviewData.value = [];
    importErrors.value = [];
    await loadData();
  } catch (error) {
    console.error("Erreur lors de l'import:", error);
    $q.notify({
      type: 'negative',
      message: "Erreur lors de l'import des mandats",
    });
  } finally {
    importLoading.value = false;
  }
}

onMounted(() => {
  void loadData();
});
</script>

<style scoped lang="scss">
.mandats-recette-page {
  .main-card {
    border-radius: 12px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  }
}

.import-preview-table {
  max-height: 60vh;

  :deep(.q-table__container) {
    max-height: 60vh;
  }
}
</style>
