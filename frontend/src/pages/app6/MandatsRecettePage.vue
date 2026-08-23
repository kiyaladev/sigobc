<template>
  <q-page class="mandats-recette-page q-pa-md">
    <PageHeader
      title="Mandats de Recettes"
      subtitle="Gestion des mandats de recettes"
      icon="receipt"
    >
      <template #stats>
        <div class="col-12 col-sm-6 col-lg-3">
          <q-card flat class="listing-stat-card overview-stat-card">
            <q-card-section class="row items-center no-wrap">
              <div class="col">
                <div class="overview-stat-label">Mandats visibles</div>
                <div class="overview-stat-value">{{ filteredMandats.length }}</div>
              </div>
              <q-icon name="dataset" size="30px" color="primary" />
            </q-card-section>
          </q-card>
        </div>
        <div class="col-12 col-sm-6 col-lg-3">
          <q-card flat class="listing-stat-card overview-stat-card">
            <q-card-section class="row items-center no-wrap">
              <div class="col">
                <div class="overview-stat-label">Montant total</div>
                <div class="overview-stat-value">{{ formatMontant(totalMontantMandats) }}</div>
              </div>
              <q-icon name="payments" size="30px" color="secondary" />
            </q-card-section>
          </q-card>
        </div>
        <div class="col-12 col-sm-6 col-lg-3">
          <q-card flat class="listing-stat-card overview-stat-card">
            <q-card-section class="row items-center no-wrap">
              <div class="col">
                <div class="overview-stat-label">Mandatés</div>
                <div class="overview-stat-value">{{ mandatsPayesCount }}</div>
                <div class="overview-stat-helper">{{ formatMontant(totalMontantPaye) }}</div>
              </div>
              <q-icon name="task_alt" size="30px" color="positive" />
            </q-card-section>
          </q-card>
        </div>
        <div class="col-12 col-sm-6 col-lg-3">
          <q-card flat class="listing-stat-card overview-stat-card">
            <q-card-section class="row items-center no-wrap">
              <div class="col">
                <div class="overview-stat-label">Brouillons</div>
                <div class="overview-stat-value">{{ mandatsBrouillonCount }}</div>
                <div class="overview-stat-helper">Annulés : {{ mandatsAnnulesCount }}</div>
              </div>
              <q-icon name="edit_note" size="30px" color="warning" />
            </q-card-section>
          </q-card>
        </div>
      </template>
    </PageHeader>

    <q-card class="main-card">
      <q-card-section>
        <div class="compact-toolbar q-mb-md">
          <div class="compact-toolbar-top row items-center q-col-gutter-sm">
            <div class="col-12 col-md-5">
              <q-input
                v-model="filter"
                placeholder="Rechercher un mandat..."
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
                      <div class="col-12 col-sm-6 col-md-4">
                        <q-select
                          v-model="filterCompte"
                          :options="compteFilterOptions"
                          label="Compte"
                          outlined
                          dense
                          emit-value
                          map-options
                          clearable
                        />
                      </div>
                      <div class="col-12 col-sm-6 col-md-4">
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
              <q-btn
                color="primary"
                icon="add"
                label="Nouveau"
                unelevated
                no-caps
                data-visite="recettes-nouveau-mandat"
                @click="openDialog()"
              />
              <q-btn dense flat round color="grey-7" icon="more_horiz">
                <q-menu anchor="bottom right" self="top right">
                  <q-list dense style="min-width: 220px">
                    <q-item clickable v-close-popup @click="exportRows">
                      <q-item-section avatar>
                        <q-icon name="download" color="primary" />
                      </q-item-section>
                      <q-item-section>Exporter CSV</q-item-section>
                    </q-item>
                    <q-item v-if="isDev" clickable v-close-popup @click="createFakeMandat">
                      <q-item-section avatar>
                        <q-icon name="science" color="orange" />
                      </q-item-section>
                      <q-item-section>Générer des données fake</q-item-section>
                    </q-item>
                  </q-list>
                </q-menu>
              </q-btn>
            </div>
          </div>
        </div>

        <DataTable
          ref="dataTableRef"
          :rows="filteredMandats"
          :columns="columns"
          :loading="loading"
          show-print
          show-download
          export-filename="mandats-recette"
          data-visite-edit="recettes-modifier-mandat"
          @edit="openDialog"
          @delete="confirmDelete"
          data-visite-print="recettes-imprimer-mandat"
          @print="printMandat"
          @download="downloadMandatPDF"
        >
          <template v-slot:body-cell-bordereauNumero="props">
            <q-td :props="props">
              {{ getBordereauNumero(props.row.bordereauMandatRecetteId) }}
            </q-td>
          </template>

          <template v-slot:body-cell-compte="props">
            <q-td :props="props">
              {{ getCompte(props.row) }}
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
      <q-card class="dialog-card" style="width: min(700px, 96vw); max-width: 96vw">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">{{ editingId ? 'Modifier le mandat' : 'Nouveau mandat' }}</div>
          <q-space />
          <q-btn
            v-if="!editingId"
            dense
            outline
            no-caps
            color="primary"
            icon="bolt"
            label="Pré-remplir"
            class="q-mr-sm"
            @click="preRemplirForm"
          >
            <q-tooltip>Remplir le formulaire avec des données d'exemple</q-tooltip>
          </q-btn>
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <q-form @submit="saveMandat" class="q-gutter-md">
            <div class="row q-col-gutter-md">
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
              <div class="col-4">
                <q-input
                  v-model="formData.numeroMandat"
                  label="Numéro Mandat *"
                  outlined
                  dense
                  hint="Proposé automatiquement (dernier + 1), modifiable"
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
            </div>

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
                  :options="bordereauOptions"
                  label="Bordereau de Mandat"
                  outlined
                  dense
                  emit-value
                  map-options
                  clearable
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
                  prefix="CFA"
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
                  :options="statutOptions"
                  label="Statut *"
                  outlined
                  dense
                  emit-value
                  map-options
                />
              </div>
            </div>

            <!-- Budget disponible info -->
            <q-banner
              v-if="budgetInfo && formData.statut === 'paye'"
              :class="
                (formData.montant || 0) > budgetInfo.disponible
                  ? 'bg-red-1 text-red-8'
                  : 'bg-teal-1 text-teal-8'
              "
              rounded
              dense
              class="q-mt-xs"
            >
              <template v-slot:avatar>
                <q-icon
                  :name="(formData.montant || 0) > budgetInfo.disponible ? 'warning' : 'info'"
                />
              </template>
              <div class="text-caption text-weight-medium">Budget {{ budgetInfo.taxeLabel }}</div>
              <div class="row q-gutter-md text-caption">
                <span
                  >Prevision : <strong>{{ formatMontant(budgetInfo.totalPrevu) }}</strong></span
                >
                <span
                  >Mandate : <strong>{{ formatMontant(budgetInfo.totalMandated) }}</strong></span
                >
                <span
                  >Disponible : <strong>{{ formatMontant(budgetInfo.disponible) }}</strong></span
                >
              </div>
              <div
                v-if="(formData.montant || 0) > budgetInfo.disponible"
                class="text-weight-bold q-mt-xs"
              >
                Depassement de
                {{ formatMontant((formData.montant || 0) - budgetInfo.disponible) }}
              </div>
            </q-banner>

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
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useQuasar, date } from 'quasar';
import {
  db,
  type MandatRecette,
  type Taxe,
  type BordereauMandatRecette,
  type Exercice,
  type PrevisionRecette,
  DEFAULT_MAIRIE_ID,
} from 'src/database/db';
import DataTable from 'src/components/DataTable.vue';
import PageHeader from 'src/components/PageHeader.vue';
import { openPrintWindow } from 'src/utils/printUrl';
import { prochainNumero, exerciceValide } from 'src/utils/numeroSequence';

const $q = useQuasar();
const dataTableRef = ref<{ exportCsv: () => void } | null>(null);

const mandats = ref<MandatRecette[]>([]);
const taxes = ref<Taxe[]>([]);
const bordereaux = ref<BordereauMandatRecette[]>([]);
const exercices = ref<Exercice[]>([]);
const previsions = ref<PrevisionRecette[]>([]);
const loading = ref(false);

const lockedYears = computed(() =>
  exercices.value.filter((e) => e.statut === 'verrouille').map((e) => e.annee),
);

function isYearLocked(annee: number): boolean {
  return lockedYears.value.includes(annee);
}

const filter = ref('');
const filterExercice = ref<number | null>(null);
const filterCompte = ref<number | null>(null);
const filterStatut = ref<string | null>(null);
const filterDateDebut = ref('');
const filterDateFin = ref('');

const showAddDialog = ref(false);
const editingId = ref<number | null>(null);
/**
 * Dernier numéro proposé automatiquement dans le formulaire.
 * Sert à distinguer « l'agent a gardé la proposition » (on la recalcule à
 * l'enregistrement, au cas où elle serait périmée) de « l'agent a saisi son
 * propre numéro » (on respecte sa saisie).
 */
const numeroMandatPropose = ref('');
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
  statut: 'paye',
  observations: '',
});

const columns = [
  {
    name: 'numeroMandat',
    label: 'N° Mandat',
    field: 'numeroMandat',
    align: 'left' as const,
    sortable: true,
    sort: (a: string, b: string) => parseInt(a, 10) - parseInt(b, 10),
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
    name: 'compte',
    label: 'Compte',
    field: 'id',
    align: 'left' as const,
    sortable: false,
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

const compteFilterOptions = computed(() => {
  const usedTaxeIds = [...new Set(mandats.value.map((m) => m.taxeId).filter(Boolean))];
  return usedTaxeIds
    .map((id) => {
      const t = taxes.value.find((tx) => tx.id === id);
      return t ? { label: `${t.code} - ${t.libelle}`, value: t.id! } : null;
    })
    .filter(Boolean) as { label: string; value: number }[];
});

const taxeOptions = computed(() =>
  taxes.value.map((t) => ({ label: `${t.code} - ${t.libelle}`, value: t.id! })),
);

const bordereauOptions = computed(() =>
  bordereaux.value
    // Tolérant à la casse / aux espaces pour ne manquer aucun bordereau ouvert
    .filter(
      (b) =>
        String(b.statut ?? '')
          .trim()
          .toLowerCase() === 'ouvert',
    )
    .map((b) => ({
      label: `Bordereau ${b.numero}-${b.exercice % 100} (${b.nombreMandats || 0} mandats)`,
      value: b.id!,
    })),
);

const filteredTaxeOptions = ref(taxeOptions.value);

watch(taxeOptions, (newOptions) => {
  filteredTaxeOptions.value = newOptions;
});

const statutOptions = [
  { label: 'Mandaté', value: 'paye' },
  { label: 'Annulé', value: 'annule' },
  { label: 'Brouillon', value: 'brouillon' },
];

const statutFilterOptions = [
  { label: 'Mandaté', value: 'paye' },
  { label: 'Annulé', value: 'annule' },
  { label: 'Brouillon', value: 'brouillon' },
];

const activeFiltersCount = computed(() => {
  return [
    filterExercice.value,
    filterCompte.value,
    filterStatut.value,
    filterDateDebut.value,
    filterDateFin.value,
  ].filter((value) => value !== null && value !== '').length;
});

const filteredMandats = computed(() => {
  let result = mandats.value;

  // Masquer les mandats des exercices verrouillés
  if (lockedYears.value.length > 0) {
    result = result.filter((m) => !lockedYears.value.includes(m.exercice));
  }

  if (filterExercice.value) {
    result = result.filter((m) => m.exercice === filterExercice.value);
  }

  if (filterCompte.value) {
    result = result.filter((m) => m.taxeId === filterCompte.value);
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

const totalMontantMandats = computed(() =>
  filteredMandats.value.reduce((sum, mandat) => sum + (mandat.montant || 0), 0),
);

const mandatsPayesCount = computed(
  () => filteredMandats.value.filter((mandat) => mandat.statut === 'paye').length,
);

const totalMontantPaye = computed(() =>
  filteredMandats.value
    .filter((mandat) => mandat.statut === 'paye')
    .reduce((sum, mandat) => sum + (mandat.montant || 0), 0),
);

const mandatsBrouillonCount = computed(
  () => filteredMandats.value.filter((mandat) => mandat.statut === 'brouillon').length,
);

const mandatsAnnulesCount = computed(
  () => filteredMandats.value.filter((mandat) => mandat.statut === 'annule').length,
);

function resetFilters() {
  filter.value = '';
  filterExercice.value = null;
  filterCompte.value = null;
  filterStatut.value = null;
  filterDateDebut.value = '';
  filterDateFin.value = '';
}

function exportRows() {
  dataTableRef.value?.exportCsv();
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

// Budget info: show available prevision for current taxe selection
const budgetInfo = computed(() => {
  const ex = formData.value.exercice;
  const taxeId = formData.value.taxeId;
  if (!ex || !taxeId) return null;

  const matchingPrevisions = previsions.value.filter(
    (p) => p.exercice === ex && p.taxeId === taxeId,
  );
  const totalPrevu = matchingPrevisions.reduce((s, p) => s + p.montantPrevu, 0);
  if (totalPrevu === 0) return null;

  const totalMandated = mandats.value
    .filter(
      (m) =>
        m.exercice === ex && m.taxeId === taxeId && m.statut === 'paye' && m.id !== editingId.value,
    )
    .reduce((s, m) => s + (m.montant || 0), 0);

  const disponible = totalPrevu - totalMandated;
  const taxe = taxes.value.find((t) => t.id === taxeId);

  return {
    totalPrevu,
    totalMandated,
    disponible,
    taxeLabel: taxe ? `${taxe.code} - ${taxe.libelle}` : '',
  };
});

function checkBudgetAvailability(): string | null {
  const info = budgetInfo.value;
  if (!info) return null;
  const montant = formData.value.montant || 0;
  if (montant > info.disponible) {
    return (
      `Le montant du mandat (${formatMontant(montant)}) depasse le budget disponible.\n\n` +
      `  Prevision : ${formatMontant(info.totalPrevu)}\n` +
      `  Deja mandate : ${formatMontant(info.totalMandated)}\n` +
      `  Disponible : ${formatMontant(info.disponible)}\n` +
      `  Depassement : ${formatMontant(montant - info.disponible)}`
    );
  }
  return null;
}

function getStatutColor(statut: string): string {
  const colors: Record<string, string> = {
    brouillon: 'grey',
    paye: 'positive',
    annule: 'red',
  };
  return colors[statut] || 'grey';
}

function formatStatut(statut: string): string {
  const labels: Record<string, string> = {
    brouillon: 'Brouillon',
    paye: 'Mandaté',
    annule: 'Annulé',
  };
  return labels[statut] || statut;
}

function getBordereauNumero(bordereauId?: number): string {
  if (!bordereauId) return '-';
  const bordereau = bordereaux.value.find((b) => b.id === bordereauId);
  if (!bordereau) return '-';
  return `${bordereau.numero}-${bordereau.exercice % 100}`;
}

function getCompte(row: MandatRecette): string {
  const taxe = taxes.value.find((t) => t.id === row.taxeId);
  if (!taxe) return '-';
  return `${taxe.code} - ${taxe.libelle}`;
}

async function loadData() {
  loading.value = true;
  try {
    [mandats.value, taxes.value, bordereaux.value, exercices.value, previsions.value] =
      await Promise.all([
        db.mandatsRecette.toArray(),
        db.taxes.toArray(),
        db.bordereauMandatsRecette.toArray(),
        db.exercices.toArray(),
        db.previsionsRecettes.toArray(),
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

/** Zéro-remplissage historique des mandats de recette (« 0124 »). */
const PAD_NUMERO_MANDAT = 4;

/**
 * Prochain numéro de mandat de recette de l'exercice : « dernier + 1 », sans trou.
 * Voir src/utils/numeroSequence.ts pour la règle complète.
 */
async function getNextMandatNumber(exercice: number | undefined): Promise<string> {
  const annee = exerciceValide(exercice);
  if (annee === null) return prochainNumero([], PAD_NUMERO_MANDAT);

  const mandatsForYear = await db.mandatsRecette.where('exercice').equals(annee).toArray();
  return prochainNumero(
    mandatsForYear.map((m) => m.numeroMandat),
    PAD_NUMERO_MANDAT,
  );
}

async function openDialog(mandat?: MandatRecette) {
  if (mandat) {
    if (isYearLocked(mandat.exercice)) {
      $q.notify({
        type: 'warning',
        message: 'Cet exercice est verrouillé. Modification impossible.',
      });
      return;
    }
    editingId.value = mandat.id!;
    formData.value = { ...mandat };
    formDataDateStr.value = date.formatDate(mandat.dateMandat, 'YYYY-MM-DD');
    formDataDateFactureStr.value = mandat.dateFacture
      ? date.formatDate(mandat.dateFacture, 'YYYY-MM-DD')
      : '';
  } else {
    if (isYearLocked(currentYear)) {
      $q.notify({
        type: 'warning',
        message: "L'exercice en cours est verrouillé. Impossible d'ajouter un mandat.",
      });
      return;
    }
    editingId.value = null;
    const nextNum = await getNextMandatNumber(currentYear);
    numeroMandatPropose.value = nextNum;
    formData.value = {
      exercice: currentYear,
      numeroMandat: nextNum,
      dateMandat: new Date(),
      ...(taxes.value[0]?.id !== undefined && { taxeId: taxes.value[0].id }),
      partieVersante: '',
      rib: '',
      patrimonial: '',
      objet: '',
      montant: 0,
      numeroFacture: '',
      modePaiement: 'virement',
      statut: 'paye',
      observations: '',
    };
    formDataDateStr.value = date.formatDate(new Date(), 'YYYY-MM-DD');
    formDataDateFactureStr.value = '';
  }
  showAddDialog.value = true;
}

const OBJETS_EXEMPLE = [
  'Recouvrement de la taxe sur les activités commerciales',
  'Droit de place sur le marché central',
  'Taxe sur la publicité et les enseignes',
  'Redevance d’occupation du domaine public',
  'Droit de stationnement des véhicules de transport',
  'Taxe sur les spectacles et manifestations',
  'Produit de la location de bâtiments communaux',
  'Droit de délivrance d’actes administratifs',
];

const PARTIES_VERSANTES_EXEMPLE = [
  'ETS SODIAM',
  'SARL BATIPRO',
  'Coopérative des commerçants du marché',
  'Entreprise KOUASSI & Fils',
  'SOCIETE IVOIRE SERVICES',
];

const MODES_PAIEMENT_EXEMPLE: Array<'virement' | 'cheque' | 'especes' | 'autre'> = [
  'virement',
  'cheque',
  'especes',
  'autre',
];

function pickRandom<T>(items: T[]): T | undefined {
  if (items.length === 0) return undefined;
  return items[Math.floor(Math.random() * items.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Remplit le formulaire avec un jeu de données d'exemple cohérent, tiré des
 * données déjà saisies (taxes, bordereaux ouverts). Le numéro et la date du
 * mandat proposés à l'ouverture sont conservés, et le montant reste dans le
 * budget disponible dès qu'une prévision de recette existe.
 */
function preRemplirForm() {
  const exercice = formData.value.exercice || currentYear;

  // Taxe : privilégier celles qui disposent d'une prévision sur l'exercice.
  const previsionsUtilisables = previsions.value.filter(
    (p) => p.exercice === exercice && taxes.value.some((t) => t.id === p.taxeId),
  );
  const prevision = pickRandom(previsionsUtilisables);
  const taxe = prevision
    ? taxes.value.find((t) => t.id === prevision.taxeId)
    : pickRandom(taxes.value);

  if (!taxe) {
    $q.notify({ type: 'warning', message: 'Aucune taxe disponible pour le pré-remplissage' });
    return;
  }

  formData.value.taxeId = taxe.id!;

  // Montant : dans la limite du disponible quand le budget est connu.
  const info = budgetInfo.value;
  if (info && info.disponible > 0) {
    const brut = Math.round((info.disponible * (0.1 + Math.random() * 0.4)) / 1000) * 1000;
    formData.value.montant = Math.min(Math.max(brut, 1000), info.disponible);
  } else {
    formData.value.montant = randomInt(1, 50) * 100000;
  }

  // Bordereau ouvert, du même exercice de préférence.
  const bordereauxOuverts = bordereaux.value.filter(
    (b) =>
      String(b.statut ?? '')
        .trim()
        .toLowerCase() === 'ouvert',
  );
  const bordereau =
    pickRandom(bordereauxOuverts.filter((b) => b.exercice === exercice)) ??
    pickRandom(bordereauxOuverts);
  if (bordereau?.id !== undefined) {
    formData.value.bordereauMandatRecetteId = bordereau.id;
  } else {
    delete formData.value.bordereauMandatRecetteId;
  }

  formData.value.partieVersante = pickRandom(PARTIES_VERSANTES_EXEMPLE) ?? 'Partie versante test';
  formData.value.rib = `CI001 ${randomInt(10000, 99999)} ${randomInt(100000, 999999)} ${randomInt(10, 99)}`;
  formData.value.patrimonial = `${taxe.code}/1`;
  formData.value.objet = pickRandom(OBJETS_EXEMPLE) ?? 'Recette communale';
  formData.value.modePaiement = pickRandom(MODES_PAIEMENT_EXEMPLE) ?? 'virement';
  formData.value.statut = 'paye';
  formData.value.numeroFacture = `FA-${exercice}-${String(randomInt(1, 9999)).padStart(4, '0')}`;
  formData.value.observations = "Mandat pré-rempli avec des données d'exemple.";

  const dateMandat = formDataDateStr.value ? new Date(formDataDateStr.value) : new Date();
  formDataDateFactureStr.value = date.formatDate(
    date.subtractFromDate(dateMandat, { days: randomInt(3, 30) }),
    'YYYY-MM-DD',
  );

  $q.notify({
    type: 'info',
    message: "Formulaire pré-rempli avec des données d'exemple",
    timeout: 1500,
  });
}

async function saveMandat() {
  if (formData.value.exercice && isYearLocked(formData.value.exercice)) {
    $q.notify({
      type: 'warning',
      message: 'Cet exercice est verrouillé. Modification impossible.',
    });
    return;
  }
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

  // Verifier le budget disponible si le mandat est mandaté
  if (formData.value.statut === 'paye') {
    const budgetError = checkBudgetAvailability();
    if (budgetError) {
      $q.notify({
        type: 'negative',
        message: 'Depassement de budget !',
        caption: budgetError,
        timeout: 8000,
        multiLine: true,
      });
      return;
    }
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
      // Si l'agent a gardé le numéro proposé, on le recalcule : celui affiché a
      // été calculé à l'ouverture du formulaire et peut être périmé si un autre
      // mandat a été créé entre-temps. S'il a saisi son propre numéro, on le
      // respecte tel quel.
      if (data.numeroMandat === numeroMandatPropose.value) {
        data.numeroMandat = await getNextMandatNumber(formData.value.exercice);
      }
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
  if (isYearLocked(mandat.exercice)) {
    $q.notify({ type: 'warning', message: 'Cet exercice est verrouillé. Suppression impossible.' });
    return;
  }
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
  openPrintWindow('mandat/ordre_de_recette.html', { mandatRecetteId: mandat.id! });
}

watch(
  () => formData.value.exercice,
  async (newExercice) => {
    if (newExercice && !editingId.value) {
      formData.value.numeroMandat = await getNextMandatNumber(newExercice);
      numeroMandatPropose.value = formData.value.numeroMandat;
    }
  },
);

const isDev = import.meta.env.VITE_ENV === 'development';

async function createFakeMandat() {
  try {
    const currentYear = new Date().getFullYear();
    const taxe = taxes.value[Math.floor(Math.random() * taxes.value.length)];
    if (!taxe) {
      $q.notify({ type: 'warning', message: 'Aucune taxe disponible' });
      return;
    }

    const nextNum = await getNextMandatNumber(currentYear);
    const now = new Date();
    const montant = Math.floor(Math.random() * 5000000) + 100000;

    await db.mandatsRecette.add({
      numeroMandat: nextNum,
      dateMandat: now,
      exercice: currentYear,
      taxeId: taxe.id!,
      partieVersante: `Contribuable Test ${nextNum}`,
      objet: `Objet test mandat recette ${nextNum}`,
      montant,
      modePaiement: 'virement',
      statut: 'paye',
      mairieId: DEFAULT_MAIRIE_ID,
      personnelId: 1,
      createdAt: now,
      updatedAt: now,
    } as MandatRecette);

    $q.notify({ type: 'positive', message: `Mandat recette fake #${nextNum} créé` });
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
.mandats-recette-page {
  max-width: 1400px;
  margin: 0 auto;
}

.main-card {
  border-radius: 24px;
}

.overview-stat-card {
  min-height: 112px;
}

.overview-stat-label {
  margin-bottom: 8px;
  color: #64748b;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.overview-stat-value {
  color: #0f172a;
  font-size: clamp(1.1rem, 2vw, 1.5rem);
  font-weight: 800;
  line-height: 1.2;
}

.overview-stat-helper {
  margin-top: 6px;
  color: #64748b;
  font-size: 0.82rem;
  font-weight: 600;
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
