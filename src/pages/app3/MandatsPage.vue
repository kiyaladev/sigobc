<template>
  <q-page class="mandats-page q-pa-md">
    <PageHeader title="Mandats de Dépenses" subtitle="Gestion des mandats" icon="receipt" />

    <q-card class="main-card">
      <q-card-section>
        <!-- Filtres -->
        <div class="row q-col-gutter-sm q-mb-md">
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
              v-model="filterSousChapitreId"
              :options="filteredSousChapitreOptions"
              label="Sous-chapitre"
              outlined
              dense
              emit-value
              map-options
              clearable
              use-input
              input-debounce="0"
              @filter="filterSousChapitre"
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
            <q-input
              v-model="filter"
              placeholder="Rechercher un mandat..."
              outlined
              dense
              clearable
            >
              <template v-slot:prepend>
                <q-icon name="search" />
              </template>
            </q-input>
          </div>
          <div class="col-12 col-md-auto q-mt-sm q-mt-md-none q-gutter-x-sm">
            <q-btn
              color="primary"
              icon="add"
              label="Nouveau Mandat"
              unelevated
              @click="openAddDialog"
            />
            <q-btn
              v-if="isDev"
              color="orange"
              icon="science"
              label="Fake Mandat"
              unelevated
              @click="createFakeMandat"
            />
          </div>
        </div>

        <DataTable
          :rows="filteredMandats"
          :columns="columns"
          :loading="loading"
          show-print
          show-export-csv
          export-filename="mandats"
          @print="printMandat"
          @edit="editMandat"
          @delete="deleteMandat"
        >
          <template v-slot:body-cell-numeroOrdre="props">
            <q-td :props="props">
              {{ props.row.numeroOrdre || '-' }}
            </q-td>
          </template>

          <template v-slot:body-cell-bordereauNumero="props">
            <q-td :props="props">
              {{ getBordereauNumero(props.row.bordereauMandatId) }}
            </q-td>
          </template>

          <template v-slot:body-cell-compte="props">
            <q-td :props="props">
              {{ getCompte(props.row) }}
            </q-td>
          </template>

          <template v-slot:body-cell-statut="props">
            <q-td :props="props">
              <q-chip :color="getStatutColor(props.row.statut)" text-color="white" size="sm" dense>
                {{ getStatutLabel(props.row.statut) }}
              </q-chip>
            </q-td>
          </template>
        </DataTable>
      </q-card-section>
    </q-card>

    <!-- Dialog d'ajout/modification -->
    <q-dialog v-model="showAddDialog" persistent>
      <q-card style="min-width: 900px">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">{{ editingId ? 'Modifier le mandat' : 'Nouveau mandat' }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-pt-md">
          <q-form @submit="saveMandat" class="q-gutter-sm">
            <!-- Section 1: Informations générales -->
            <div class="text-subtitle2 text-grey-8 q-mb-xs">Informations générales</div>
            <div class="row q-col-gutter-sm">
              <div class="col-12 col-md-4">
                <q-input
                  v-model.number="formData.exercice"
                  label="Exercice *"
                  outlined
                  dense
                  type="number"
                  :rules="[(val) => !!val || 'Exercice requis']"
                />
              </div>

              <div class="col-12 col-md-4">
                <q-input
                  v-model="formData.numeroMandat"
                  label="Numéro Mandat *"
                  outlined
                  dense
                  :rules="[(val) => !!val || 'Numéro requis']"
                />
              </div>

              <div class="col-12 col-md-4">
                <q-input
                  v-model="formData.dateMandat"
                  label="Date Mandat *"
                  outlined
                  dense
                  type="date"
                  :rules="[(val) => !!val || 'Date requise']"
                />
              </div>
            </div>

            <q-separator class="q-my-sm" />

            <!-- Section 2: Classification budgétaire -->
            <div class="text-subtitle2 text-grey-8 q-mb-xs">Classification budgétaire</div>
            <div class="row q-col-gutter-sm">
              <div class="col-12 col-md-6">
                <q-select
                  v-model="formData.chapitreId"
                  :options="filteredChapitreOptions"
                  label="Nature de la dépense (barre) *"
                  outlined
                  dense
                  emit-value
                  map-options
                  use-input
                  input-debounce="0"
                  :rules="[(val) => !!val || 'Chapitre requis']"
                  @filter="filterChapitre"
                />
              </div>
              <div class="col-12 col-md-6">
                <q-select
                  v-model="formData.sousChapitreId"
                  :options="filteredSousChapitreOptions"
                  label="Compte fonctionnel"
                  outlined
                  dense
                  emit-value
                  map-options
                  clearable
                  use-input
                  input-debounce="0"
                  @filter="filterSousChapitre"
                />
              </div>
            </div>

            <div class="row q-col-gutter-sm">
              <div class="col-12 col-md-6">
                <q-select
                  v-model="formData.bordereauMandatId"
                  :options="filteredBordereauMandatOptions"
                  label="Bordereau de Mandat *"
                  outlined
                  dense
                  emit-value
                  map-options
                  use-input
                  input-debounce="0"
                  :rules="[(val) => !!val || 'Bordereau requis']"
                  @filter="filterBordereauMandat"
                >
                  <template v-slot:prepend>
                    <q-icon name="description" />
                  </template>
                </q-select>
              </div>
              <div class="col-12 col-md-6">
                <q-input
                  v-model="formData.patrimonial"
                  label="Imputation Patrimoniale"
                  outlined
                  dense
                  placeholder="Ex: 6000/1"
                />
              </div>
            </div>

            <q-separator class="q-my-sm" />

            <!-- Section 3: Bénéficiaire et paiement -->
            <div class="text-subtitle2 text-grey-8 q-mb-xs">Bénéficiaire et paiement</div>
            <div class="row q-col-gutter-sm">
              <div class="col-12 col-md-6">
                <q-input
                  v-model="formData.beneficiaire"
                  label="Bénéficiaire *"
                  outlined
                  dense
                  :rules="[(val) => !!val || 'Bénéficiaire requis']"
                />
              </div>
              <div class="col-12 col-md-6">
                <q-input
                  v-model="formData.rib"
                  label="RIB / Compte bancaire"
                  outlined
                  dense
                  placeholder="Ex: SN001 01234 123456789012 12"
                />
              </div>
            </div>

            <q-input
              v-model="formData.objet"
              label="Objet de la dépense *"
              outlined
              dense
              type="textarea"
              rows="2"
              :rules="[(val) => !!val || 'Objet requis']"
            />

            <q-separator class="q-my-sm" />

            <!-- Section 4: Détails financiers -->
            <div class="text-subtitle2 text-grey-8 q-mb-xs">Détails financiers</div>

            <div class="row q-col-gutter-sm">
              <div class="col-12 col-md-4">
                <q-input
                  v-model.number="formData.montant"
                  label="Montant brut *"
                  outlined
                  dense
                  type="number"
                  suffix="CFA"
                  :rules="[(val) => !!val || 'Montant requis']"
                />
              </div>
              <div class="col-12 col-md-4">
                <q-select
                  v-model="formData.modePaiement"
                  :options="['virement', 'cheque', 'especes', 'autre']"
                  label="Mode de paiement *"
                  outlined
                  dense
                />
              </div>
              <div class="col-12 col-md-4">
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

            <div class="row q-col-gutter-sm">
              <div class="col-12 col-md-4">
                <q-input v-model="formData.numeroFacture" label="N° Facture" outlined dense />
              </div>
              <div class="col-12 col-md-4">
                <q-input
                  v-model="formData.dateFacture"
                  label="Date Facture"
                  outlined
                  dense
                  type="date"
                />
              </div>
              <div class="col-12 col-md-4">
                <q-input
                  v-model.number="formData.montantPrecompter"
                  label="Montant à précompter"
                  outlined
                  dense
                  type="number"
                  suffix="CFA"
                />
              </div>
            </div>

            <q-separator class="q-my-sm" />

            <!-- Section 5: Informations complémentaires -->
            <div class="text-subtitle2 text-grey-8 q-mb-xs">Informations complémentaires</div>
            <div class="row q-col-gutter-sm">
              <div class="col-12 col-md-6">
                <q-input
                  v-model="formData.referenceMarche"
                  label="Référence du Marché"
                  outlined
                  dense
                />
              </div>
              <div class="col-12 col-md-6">
                <q-input
                  v-model="formData.avisMunicipalite"
                  label="Avis de la Municipalité"
                  outlined
                  dense
                />
              </div>
            </div>

            <div class="row q-col-gutter-sm">
              <div class="col-12 col-md-6">
                <q-input
                  v-model="formData.numeroDeliberation"
                  label="N° Délibération"
                  outlined
                  dense
                />
              </div>
              <div class="col-12 col-md-6">
                <q-input
                  v-model="formData.dateDeliberation"
                  label="Date de Délibération"
                  outlined
                  dense
                  type="date"
                />
              </div>
            </div>

            <!-- Section 6: Motif d'annulation (visible uniquement si statut = annulé) -->
            <template v-if="formData.statut === 'annule'">
              <q-separator class="q-my-sm" />
              <div class="text-subtitle2 text-red q-mb-xs">Motif d'annulation</div>
              <div class="row q-col-gutter-sm">
                <div class="col-12">
                  <q-input
                    v-model="formData.motifAnnulation"
                    label="Motif d'annulation *"
                    outlined
                    dense
                    type="textarea"
                    rows="2"
                    :rules="[(val) => !!val || 'Le motif d\'annulation est requis']"
                    class="bg-red-1"
                  />
                </div>
              </div>
            </template>

            <q-separator class="q-my-sm" />

            <!-- Section 7: Observations -->
            <div class="text-subtitle2 text-grey-8 q-mb-xs">Notes</div>
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
  type Mandat,
  type Chapitre,
  type SousChapitre,
  type BordereauMandat,
  type Mairie,
  type Exercice,
} from 'src/database/db';
import PageHeader from 'src/components/PageHeader.vue';
import DataTable from 'src/components/DataTable.vue';
import { openPrintWindow } from 'src/utils/printUrl';

const $q = useQuasar();
const loading = ref(false);
const filter = ref('');
const showAddDialog = ref(false);
const editingId = ref<number | null>(null);

// Filtres
const filterExercice = ref<number | null>(null);
const filterChapitreId = ref<number | null>(null);
const filterSousChapitreId = ref<number | null>(null);
const filterDateDebut = ref<string>('');
const filterDateFin = ref<string>('');

const mandats = ref<Mandat[]>([]);
const chapitres = ref<Chapitre[]>([]);
const sousChapitres = ref<SousChapitre[]>([]);
const bordereauMandats = ref<BordereauMandat[]>([]);
const mairies = ref<Mairie[]>([]);
const exercices = ref<Exercice[]>([]);

const lockedYears = computed(() =>
  exercices.value.filter((e) => e.statut === 'verrouille').map((e) => e.annee),
);

function isYearLocked(annee: number): boolean {
  return lockedYears.value.includes(annee);
}

const formData = ref({
  numeroMandat: '',
  dateMandat: date.formatDate(new Date(), 'YYYY-MM-DD'),
  exercice: new Date().getFullYear(),
  chapitreId: null as number | null,
  sousChapitreId: null as number | null,
  bordereauMandatId: null as number | null,
  beneficiaire: '',
  rib: '',
  patrimonial: '',
  objet: '',
  montant: 0,
  numeroFacture: '',
  dateFacture: '',
  modePaiement: 'virement' as 'virement' | 'cheque' | 'especes' | 'autre',
  statut: 'paye' as 'brouillon' | 'paye' | 'annule',
  observations: '',
  motifAnnulation: '',
  // Nouveaux champs
  referenceMarche: '',
  avisMunicipalite: '',
  numeroDeliberation: '',
  dateDeliberation: '',
  montantPrecompter: 0,
});

const chapitreOptions = computed(() =>
  chapitres.value.map((c) => ({
    label: `${c.code} - ${c.libelle}`,
    value: c.id,
  })),
);

const sousChapitreOptions = computed(() =>
  sousChapitres.value.map((s) => ({ label: `${s.code} - ${s.libelle}`, value: s.id })),
);

const exerciceFilterOptions = computed(() => {
  const years = [...new Set(mandats.value.map((m) => m.exercice))].sort((a, b) => b - a);
  return years.map((y) => ({ label: String(y), value: y }));
});

const bordereauMandatOptions = computed(() =>
  bordereauMandats.value
    .filter((b) => b.statut === 'ouvert')
    .map((b) => ({
      label: `Bordereau ${b.numero}-${b.exercice % 100} (${b.nombreMandats || 0} mandats)`,
      value: b.id,
    })),
);

const filteredChapitreOptions = ref(chapitreOptions.value);
const filteredSousChapitreOptions = ref(sousChapitreOptions.value);
const filteredBordereauMandatOptions = ref(bordereauMandatOptions.value);

watch(chapitreOptions, (newOptions) => {
  filteredChapitreOptions.value = newOptions;
});

watch(sousChapitreOptions, (newOptions) => {
  filteredSousChapitreOptions.value = newOptions;
});

watch(bordereauMandatOptions, (newOptions) => {
  filteredBordereauMandatOptions.value = newOptions;
});

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

function filterSousChapitre(val: string, update: (callback: () => void) => void) {
  if (val === '') {
    update(() => {
      filteredSousChapitreOptions.value = sousChapitreOptions.value;
    });
    return;
  }
  update(() => {
    const needle = val.toLowerCase();
    filteredSousChapitreOptions.value = sousChapitreOptions.value.filter(
      (v) => v.label.toLowerCase().indexOf(needle) > -1,
    );
  });
}

function filterBordereauMandat(val: string, update: (callback: () => void) => void) {
  if (val === '') {
    update(() => {
      filteredBordereauMandatOptions.value = bordereauMandatOptions.value;
    });
    return;
  }
  update(() => {
    const needle = val.toLowerCase();
    filteredBordereauMandatOptions.value = bordereauMandatOptions.value.filter(
      (v) => v.label.toLowerCase().indexOf(needle) > -1,
    );
  });
}

const columns = [
  /*{
    name: 'numeroOrdre',
    label: 'N° Ordre',
    align: 'center' as const,
    field: 'numeroOrdre',
    sortable: true,
  },*/
  {
    name: 'numeroMandat',
    label: 'N° Mandat',
    align: 'left' as const,
    field: 'numeroMandat',
    sortable: true,
    sort: (a: string, b: string) => parseInt(a, 10) - parseInt(b, 10),
  },
  {
    name: 'bordereauNumero',
    label: 'N° Bordereau',
    align: 'center' as const,
    field: 'bordereauMandatId',
    sortable: true,
  },
  {
    name: 'dateMandat',
    label: 'Date',
    align: 'left' as const,
    field: 'dateMandat',
    format: (val: Date) => date.formatDate(val, 'DD/MM/YYYY'),
    sortable: true,
  },
  {
    name: 'compte',
    label: 'Compte',
    align: 'left' as const,
    field: 'id',
    sortable: false,
  },
  {
    name: 'beneficiaire',
    label: 'Bénéficiaire',
    align: 'left' as const,
    field: 'beneficiaire',
    sortable: true,
  },
  {
    name: 'objet',
    label: 'Objet',
    align: 'left' as const,
    field: 'objet',
    sortable: true,
  },
  {
    name: 'montant',
    label: 'Montant',
    align: 'right' as const,
    field: 'montant',
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

const filteredMandats = computed(() => {
  let result = mandats.value;

  // Masquer les mandats des exercices verrouillés
  if (lockedYears.value.length > 0) {
    result = result.filter((m) => !lockedYears.value.includes(m.exercice));
  }

  // Filtre par exercice
  if (filterExercice.value) {
    result = result.filter((m) => m.exercice === filterExercice.value);
  }

  // Filtre par chapitre
  if (filterChapitreId.value) {
    result = result.filter((m) => m.chapitreId === filterChapitreId.value);
  }

  // Filtre par sous-chapitre
  if (filterSousChapitreId.value) {
    result = result.filter((m) => m.sousChapitreId === filterSousChapitreId.value);
  }

  // Filtre par date début
  if (filterDateDebut.value) {
    const dateDebut = new Date(filterDateDebut.value);
    result = result.filter((m) => new Date(m.dateMandat) >= dateDebut);
  }

  // Filtre par date fin
  if (filterDateFin.value) {
    const dateFin = new Date(filterDateFin.value);
    dateFin.setHours(23, 59, 59, 999); // Inclure toute la journée
    result = result.filter((m) => new Date(m.dateMandat) <= dateFin);
  }

  // Filtre par texte
  if (filter.value) {
    const searchTerm = filter.value.toLowerCase();
    result = result.filter(
      (m) =>
        m.numeroMandat.toLowerCase().includes(searchTerm) ||
        m.beneficiaire.toLowerCase().includes(searchTerm) ||
        m.objet.toLowerCase().includes(searchTerm),
    );
  }

  return result;
});

function resetFilters() {
  filterExercice.value = null;
  filterChapitreId.value = null;
  filterSousChapitreId.value = null;
  filterDateDebut.value = '';
  filterDateFin.value = '';
  filter.value = '';
}

function formatMontant(montant: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    minimumFractionDigits: 0,
  }).format(montant);
}

function getBordereauNumero(bordereauMandatId?: number): string {
  if (!bordereauMandatId) return '-';
  const bordereau = bordereauMandats.value.find((b) => b.id === bordereauMandatId);
  if (!bordereau) return '-';
  return `${bordereau.numero}-${bordereau.exercice}`;
}

function getCompte(row: Mandat): string {
  const sc = sousChapitres.value.find((s) => s.id === row.sousChapitreId);
  const ch = chapitres.value.find((c) => c.id === row.chapitreId);
  const scCode = sc?.code || '?';
  const chCode = ch?.code || '?';
  return `${scCode}/${chCode}`;
}

function getStatutColor(statut: string): string {
  switch (statut) {
    case 'brouillon':
      return 'grey';
    case 'paye':
      return 'positive';
    case 'annule':
      return 'red';
    default:
      return 'grey';
  }
}

const statutOptions = [
  { label: 'Mandaté', value: 'paye' },
  { label: 'Annulé', value: 'annule' },
  { label: 'Brouillon', value: 'brouillon' },
];

function getStatutLabel(statut: string): string {
  switch (statut) {
    case 'brouillon':
      return 'Brouillon';
    case 'paye':
      return 'Mandaté';
    case 'annule':
      return 'Annulé';
    default:
      return statut;
  }
}

function printMandat(mandat: Mandat) {
  // Le fichier HTML charge les données directement depuis IndexedDB
  openPrintWindow('mandat_depense.html', {
    mandatId: mandat.id!,
    print: 'true',
  });
}

async function loadData() {
  loading.value = true;
  try {
    [
      mandats.value,
      chapitres.value,
      sousChapitres.value,
      bordereauMandats.value,
      mairies.value,
      exercices.value,
    ] = await Promise.all([
      db.mandats.toArray(),
      db.chapitres.filter((c) => c.actif).toArray(),
      db.sousChapitres.filter((s) => s.actif && !s.code.startsWith('7')).toArray(),
      db.bordereauMandats.toArray(),
      db.mairies.toArray(),
      db.exercices.toArray(),
    ]);
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

function resetForm() {
  formData.value = {
    numeroMandat: '',
    dateMandat: date.formatDate(new Date(), 'YYYY-MM-DD'),
    exercice: new Date().getFullYear(),
    chapitreId: null,
    sousChapitreId: null,
    bordereauMandatId: null,
    beneficiaire: '',
    rib: '',
    patrimonial: '',
    objet: '',
    montant: 0,
    numeroFacture: '',
    dateFacture: '',
    modePaiement: 'virement',
    statut: 'paye',
    observations: '',
    motifAnnulation: '',
    // Nouveaux champs
    referenceMarche: '',
    avisMunicipalite: '',
    numeroDeliberation: '',
    dateDeliberation: '',
    montantPrecompter: 0,
  };
  editingId.value = null;
}

async function getNextMandatNumber(exercice: number): Promise<string> {
  const mandatsForYear = await db.mandats.where('exercice').equals(exercice).toArray();

  let maxNum = 0;
  for (const m of mandatsForYear) {
    const num = parseInt(m.numeroMandat, 10);
    if (!isNaN(num) && num > maxNum) {
      maxNum = num;
    }
  }

  return String(maxNum + 1);
}

async function openAddDialog() {
  if (isYearLocked(new Date().getFullYear())) {
    $q.notify({
      type: 'warning',
      message: "L'exercice en cours est verrouillé. Impossible d'ajouter un mandat.",
    });
    return;
  }
  resetForm();
  // Générer automatiquement le numéro de mandat (max des mandats de l'année + 1)
  const currentYear = new Date().getFullYear();
  formData.value.numeroMandat = await getNextMandatNumber(currentYear);
  showAddDialog.value = true;
}

/**
 * Recalcule les statistiques d'un bordereau (nombreMandats, montantTotal)
 * Note: Les mandats annulés ne sont pas comptabilisés
 */
async function recalculateBordereauStats(bordereauId: number): Promise<void> {
  const allMandats = await db.mandats.where('bordereauMandatId').equals(bordereauId).toArray();

  // Seuls les mandats payés impactent le bordereau (brouillon et annulé exclus)
  const mandatsDuBordereau = allMandats.filter((m) => m.statut === 'paye');

  const nombreMandats = mandatsDuBordereau.length;
  const montantTotal = mandatsDuBordereau.reduce((sum, m) => sum + (m.montant || 0), 0);

  await db.bordereauMandats.update(bordereauId, {
    nombreMandats,
    montantTotal,
    updatedAt: new Date(),
  });
}

async function saveMandat() {
  try {
    if (isYearLocked(formData.value.exercice)) {
      $q.notify({
        type: 'warning',
        message: 'Cet exercice est verrouillé. Modification impossible.',
      });
      return;
    }
    const now = new Date();
    const mairieId = 1;
    const personnelId = 1;

    // Garder trace de l'ancien bordereauMandatId pour la mise à jour des stats
    let oldBordereauMandatId: number | undefined;
    if (editingId.value) {
      const existingMandat = await db.mandats.get(editingId.value);
      oldBordereauMandatId = existingMandat?.bordereauMandatId;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { dateFacture, dateMandat, dateDeliberation, ...otherFormData } = formData.value;

    const data = {
      ...otherFormData,
      chapitreId: formData.value.chapitreId!,
      ...(formData.value.sousChapitreId ? { sousChapitreId: formData.value.sousChapitreId } : {}),
      dateMandat: new Date(formData.value.dateMandat),
      ...(dateFacture ? { dateFacture: new Date(dateFacture) } : {}),
      ...(dateDeliberation ? { dateDeliberation: new Date(dateDeliberation) } : {}),
      ...(formData.value.bordereauMandatId
        ? { bordereauMandatId: formData.value.bordereauMandatId }
        : {}),
      mairieId,
      personnelId,
    };

    if (editingId.value) {
      const updateData = {
        ...data,
        updatedAt: now,
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await db.mandats.update(editingId.value, updateData as any);

      // Recalculer les stats des bordereaux impactés
      const newBordereauId = formData.value.bordereauMandatId;
      if (oldBordereauMandatId && oldBordereauMandatId !== newBordereauId) {
        // L'ancien bordereau a perdu ce mandat
        await recalculateBordereauStats(oldBordereauMandatId);
      }
      if (newBordereauId) {
        // Le nouveau bordereau (ou le même si montant changé) doit être recalculé
        await recalculateBordereauStats(newBordereauId);
      }

      $q.notify({
        type: 'positive',
        message: 'Mandat modifié avec succès',
      });
    } else {
      type MandatInsert = Omit<Mandat, 'id'>;
      const insertData: MandatInsert = {
        ...data,
        createdAt: now,
        updatedAt: now,
      } as MandatInsert;
      await db.mandats.add(insertData);

      // Recalculer les stats du bordereau si un bordereau est sélectionné
      if (formData.value.bordereauMandatId) {
        await recalculateBordereauStats(formData.value.bordereauMandatId);
      }

      $q.notify({
        type: 'positive',
        message: 'Mandat ajouté avec succès',
      });
    }

    showAddDialog.value = false;
    resetForm();
    await loadData();
  } catch (error) {
    console.error('Erreur lors de la sauvegarde:', error);
    $q.notify({
      type: 'negative',
      message: "Erreur lors de l'enregistrement",
    });
  }
}

function editMandat(row: Mandat) {
  if (isYearLocked(row.exercice)) {
    $q.notify({
      type: 'warning',
      message: 'Cet exercice est verrouillé. Modification impossible.',
    });
    return;
  }
  editingId.value = row.id!;
  formData.value = {
    numeroMandat: row.numeroMandat,
    dateMandat: date.formatDate(row.dateMandat, 'YYYY-MM-DD'),
    exercice: row.exercice,
    chapitreId: row.chapitreId,
    sousChapitreId: row.sousChapitreId || null,
    bordereauMandatId: row.bordereauMandatId || null,
    beneficiaire: row.beneficiaire,
    rib: row.rib || '',
    patrimonial: row.patrimonial || '',
    objet: row.objet,
    montant: row.montant,
    numeroFacture: row.numeroFacture || '',
    dateFacture: row.dateFacture ? date.formatDate(row.dateFacture, 'YYYY-MM-DD') : '',
    modePaiement: row.modePaiement,
    statut: row.statut,
    observations: row.observations || '',
    motifAnnulation: row.motifAnnulation || '',
    // Nouveaux champs
    referenceMarche: row.referenceMarche || '',
    avisMunicipalite: row.avisMunicipalite || '',
    numeroDeliberation: row.numeroDeliberation || '',
    dateDeliberation: row.dateDeliberation
      ? date.formatDate(row.dateDeliberation, 'YYYY-MM-DD')
      : '',
    montantPrecompter: row.montantPrecompter || 0,
  };
  showAddDialog.value = true;
}

function deleteMandat(row: Mandat) {
  if (isYearLocked(row.exercice)) {
    $q.notify({ type: 'warning', message: 'Cet exercice est verrouillé. Suppression impossible.' });
    return;
  }
  $q.dialog({
    title: 'Confirmation',
    message: `Voulez-vous vraiment supprimer le mandat "${row.numeroMandat}" ?`,
    cancel: true,
    persistent: true,
  }).onOk(() => {
    void (async () => {
      try {
        const bordereauIdToUpdate = row.bordereauMandatId;
        await db.mandats.delete(row.id);

        // Recalculer les stats du bordereau si le mandat en avait un
        if (bordereauIdToUpdate) {
          await recalculateBordereauStats(bordereauIdToUpdate);
        }

        $q.notify({
          type: 'positive',
          message: 'Mandat supprimé avec succès',
        });
        await loadData();
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        $q.notify({
          type: 'negative',
          message: 'Erreur lors de la suppression',
        });
      }
    })();
  });
}

watch(
  () => formData.value.exercice,
  async (newExercice) => {
    if (newExercice && !editingId.value) {
      formData.value.numeroMandat = await getNextMandatNumber(newExercice);
    }
  },
);

const isDev = import.meta.env.VITE_ENV === 'development';

async function createFakeMandat() {
  try {
    const currentYear = new Date().getFullYear();
    if (isYearLocked(currentYear)) {
      $q.notify({ type: 'warning', message: 'Exercice verrouillé' });
      return;
    }
    const nextNum = await getNextMandatNumber(currentYear);
    const chapitre = chapitres.value[Math.floor(Math.random() * chapitres.value.length)];
    const sousChapitre =
      sousChapitres.value[Math.floor(Math.random() * sousChapitres.value.length)];
    if (!chapitre || !sousChapitre) {
      $q.notify({ type: 'warning', message: 'Aucun chapitre/sous-chapitre disponible' });
      return;
    }
    const now = new Date();
    const montant = Math.floor(Math.random() * 5000000) + 100000;
    await db.mandats.add({
      numeroMandat: nextNum,
      dateMandat: now,
      exercice: currentYear,
      chapitreId: chapitre.id!,
      sousChapitreId: sousChapitre.id!,
      beneficiaire: `Fournisseur Test ${nextNum}`,
      objet: `Objet test mandat ${nextNum}`,
      montant,
      modePaiement: 'virement',
      statut: 'paye',
      mairieId: 1,
      personnelId: 1,
      createdAt: now,
      updatedAt: now,
    } as Omit<Mandat, 'id'> & Record<string, unknown>);
    $q.notify({ type: 'positive', message: `Mandat fake #${nextNum} créé` });
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
.mandats-page {
  max-width: 1400px;
  margin: 0 auto;
}

.main-card {
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.import-preview-table {
  max-height: 60vh;

  :deep(.q-table__container) {
    max-height: 60vh;
  }
}

// Print styles
.print-container {
  .print-content {
    padding: 40px;
  }

  .mandat-document {
    max-width: 800px;
    margin: 0 auto;
    font-family: 'Times New Roman', serif;
  }

  .document-header {
    border-bottom: 2px solid #333;
    padding-bottom: 16px;
    margin-bottom: 24px;
  }

  .document-title {
    border-top: 1px solid #ccc;
    border-bottom: 1px solid #ccc;
    padding: 16px 0;
  }

  .details-table {
    width: 100%;
    border-collapse: collapse;
    margin: 16px 0;

    tr {
      border-bottom: 1px solid #eee;
    }

    .label-cell {
      padding: 12px 8px;
      width: 35%;
      font-weight: 500;
      color: #666;
    }

    .value-cell {
      padding: 12px 8px;
      color: #333;
    }
  }

  .montant-box {
    border: 2px solid #1976d2;
    border-radius: 8px;
    padding: 24px;
    text-align: center;
    background: #f5f5f5;
  }

  .signature-box {
    text-align: center;
    padding: 16px;
  }

  .signature-line {
    margin-top: 60px;
    border-top: 1px solid #333;
    width: 200px;
    margin-left: auto;
    margin-right: auto;
  }

  .observations {
    background: #f9f9f9;
    padding: 16px;
    border-left: 4px solid #1976d2;
    border-radius: 4px;
  }

  .document-footer {
    margin-top: 40px;
    padding-top: 16px;
    border-top: 1px solid #ccc;
    color: #999;
  }
}

// Media query for printing
@media print {
  .no-print {
    display: none !important;
  }

  .print-container {
    .print-content {
      padding: 0;
    }

    .mandat-document {
      max-width: 100%;
    }
  }

  // Optimize for A4 paper
  @page {
    size: A4 portrait;
    margin: 2cm;
  }

  body {
    print-color-adjust: exact;
    -webkit-print-color-adjust: exact;
  }
}
</style>
