<template>
  <q-page class="prevision-page q-pa-md">
    <PageHeader
      title="Prévisions Budgétaires"
      subtitle="Gestion des prévisions de dépenses"
      icon="pie_chart"
    >
      <template #stats>
        <div class="col-12 col-sm-6 col-lg-3">
          <q-card flat class="listing-stat-card overview-stat-card">
            <q-card-section class="row items-center no-wrap">
              <div class="col">
                <div class="overview-stat-label">Prévisions visibles</div>
                <div class="overview-stat-value">{{ filteredPrevisions.length }}</div>
              </div>
              <q-icon name="dataset" size="30px" color="primary" />
            </q-card-section>
          </q-card>
        </div>
        <div class="col-12 col-sm-6 col-lg-3">
          <q-card flat class="listing-stat-card overview-stat-card">
            <q-card-section class="row items-center no-wrap">
              <div class="col">
                <div class="overview-stat-label">Montant prévu</div>
                <div class="overview-stat-value">{{ formatMontant(totalPrevu) }}</div>
              </div>
              <q-icon name="payments" size="30px" color="secondary" />
            </q-card-section>
          </q-card>
        </div>
        <div class="col-12 col-sm-6 col-lg-3">
          <q-card flat class="listing-stat-card overview-stat-card">
            <q-card-section class="row items-center no-wrap">
              <div class="col">
                <div class="overview-stat-label">Montant engagé</div>
                <div class="overview-stat-value">{{ formatMontant(totalEngage) }}</div>
                <div class="overview-stat-helper">
                  Disponible : {{ formatMontant(totalDisponible) }}
                </div>
              </div>
              <q-icon name="receipt_long" size="30px" color="teal" />
            </q-card-section>
          </q-card>
        </div>
        <div class="col-12 col-sm-6 col-lg-3">
          <q-card flat class="listing-stat-card overview-stat-card">
            <q-card-section class="row items-center no-wrap">
              <div class="col">
                <div class="overview-stat-label">Taux d'exécution</div>
                <div class="overview-stat-value">{{ tauxExecution.toFixed(1) }} %</div>
              </div>
              <q-icon name="monitoring" size="30px" color="positive" />
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
                placeholder="Rechercher une prévision..."
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
                      <div class="col-12 col-sm-6 col-md-4">
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
                label="Nouvelle"
                unelevated
                no-caps
                @click="showAddDialog = true"
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
                    <q-item clickable v-close-popup @click="openEtatFinancierMensuel('fonctionnel')">
                      <q-item-section avatar>
                        <q-icon name="description" color="accent" />
                      </q-item-section>
                      <q-item-section>État fonctionnel</q-item-section>
                    </q-item>
                    <q-item clickable v-close-popup @click="openEtatFinancierMensuel('investissement')">
                      <q-item-section avatar>
                        <q-icon name="business_center" color="teal" />
                      </q-item-section>
                      <q-item-section>État investissement</q-item-section>
                    </q-item>
                    <q-item clickable v-close-popup @click="showCT02Dialog = true">
                      <q-item-section avatar>
                        <q-icon name="print" color="secondary" />
                      </q-item-section>
                      <q-item-section>CT02</q-item-section>
                    </q-item>
                    <q-item v-if="isDev" clickable v-close-popup @click="createFakePrevision">
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
          :rows="filteredPrevisions"
          :columns="columns"
          :loading="loading"
          export-filename="previsions"
          @edit="editPrevision"
          @delete="deletePrevision"
        >
          <template v-slot:body-cell-statut="props">
            <q-td :props="props">
              <q-badge :color="getStatutColor(props.row.statut)" text-color="white" size="sm">
                {{ getStatutLabel(props.row.statut) }}
              </q-badge>
            </q-td>
          </template>
        </DataTable>
      </q-card-section>
    </q-card>

    <!-- Dialog d'ajout/modification -->
    <q-dialog v-model="showAddDialog" persistent>
      <q-card class="dialog-card" style="width: min(600px, 96vw); max-width: 96vw">
        <q-card-section class="row items-center q-pb-none">
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
              :options="filteredSousChapitreOptions"
              label="Sous-chapitre (Compte)"
              outlined
              dense
              emit-value
              map-options
              clearable
              use-input
              input-debounce="0"
              @filter="filterSousChapitre"
            />

            <q-input
              v-model.number="formData.montantPrevu"
              label="Montant Prévu *"
              outlined
              dense
              type="number"
              prefix="CFA"
              :rules="[(val) => !!val || 'Montant requis']"
            />

            <q-select
              v-model="formData.typeBien"
              :options="typeBienOptions"
              label="Type de bien"
              outlined
              dense
              emit-value
              map-options
              clearable
            />

            <q-select
              v-model="formData.statut"
              :options="statutOptions"
              label="Statut *"
              outlined
              dense
              emit-value
              map-options
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
              <q-btn label="Enregistrer" type="submit" color="primary" unelevated />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Dialog CT02 - Livre d'exécution des opérations budgétaires dépenses -->
    <q-dialog v-model="showCT02Dialog" persistent>
      <q-card class="dialog-card" style="width: min(500px, 96vw); max-width: 96vw">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">CT02 - Livre d'exécution budgétaire</div>
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
              :options="filteredSousChapitreOptions"
              label="Sous-chapitre (Compte)"
              outlined
              dense
              emit-value
              map-options
              clearable
              use-input
              input-debounce="0"
              @filter="filterSousChapitre"
            />

            <div class="row justify-end q-gutter-sm q-mt-md">
              <q-btn label="Annuler" flat color="grey-7" v-close-popup />
              <q-btn
                label="Imprimer CT02"
                icon="print"
                color="primary"
                unelevated
                @click="printCT02"
                :loading="loadingCT02"
              />
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <q-dialog v-model="showEtatFinancierDialog" persistent>
      <q-card class="dialog-card" style="width: min(400px, 96vw); max-width: 96vw">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">
            État Financier Mensuel
            <q-chip
              :color="etatFinancierFilters.type === 'fonctionnel' ? 'accent' : 'teal'"
              text-color="white"
              size="sm"
            >
              {{
                etatFinancierFilters.type === 'fonctionnel'
                  ? 'Fonctionnel (6xxx)'
                  : 'Investissement (9xxx)'
              }}
            </q-chip>
          </div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <div class="q-gutter-md">
            <q-select
              v-model="etatFinancierFilters.annee"
              :options="exerciceOptions"
              label="Année *"
              outlined
              dense
              emit-value
              map-options
            />

            <q-select
              v-model="etatFinancierFilters.mois"
              :options="moisOptions"
              label="Mois *"
              outlined
              dense
              emit-value
              map-options
            />

            <div class="row justify-end q-gutter-sm q-mt-md">
              <q-btn label="Annuler" flat color="grey-7" v-close-popup />
              <q-btn
                label="Générer l'état"
                icon="description"
                color="accent"
                unelevated
                @click="generateEtatFinancierMensuel"
                :loading="loadingEtatFinancier"
              />
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useQuasar } from 'quasar';
import { db, type Prevision, type Chapitre, type Exercice, type SousChapitre, type Mandat } from 'src/database/db';
import PageHeader from 'src/components/PageHeader.vue';
import DataTable from 'src/components/DataTable.vue';
import { openPrintWindowWithMessage } from 'src/utils/printUrl';
import { MAIRIE_INFO } from 'src/constanteInfo';

const $q = useQuasar();
const loading = ref(false);
const loadingCT02 = ref(false);
const loadingEtatFinancier = ref(false);
const dataTableRef = ref<{ exportCsv: () => void } | null>(null);
const filter = ref('');
const showAddDialog = ref(false);
const showCT02Dialog = ref(false);
const showEtatFinancierDialog = ref(false);
const editingId = ref<number | null>(null);

// Filtres
const filterExercice = ref<number | null>(null);
const filterChapitreId = ref<number | null>(null);
const filterSousChapitreId = ref<number | null>(null);

const previsions = ref<Prevision[]>([]);
const chapitres = ref<Chapitre[]>([]);
const sousChapitres = ref<SousChapitre[]>([]);
const mandats = ref<Mandat[]>([]);
const exercices = ref<Exercice[]>([]);
const lockedYears = computed(() =>
  exercices.value.filter((e) => e.statut === 'verrouille').map((e) => e.annee),
);

const formData = ref({
  exercice: new Date().getFullYear(),
  chapitreId: null as number | null,
  sousChapitreId: null as number | null,
  montantPrevu: 0,
  typeBien: '' as '' | 'immobilier' | 'mobilier' | 'incorporel',
  statut: 'validee' as 'brouillon' | 'validee',
  observations: '',
});

// Filtres CT02
const ct02Filters = ref({
  exercice: new Date().getFullYear(),
  sousChapitreId: null as number | null,
});

// Filtres État Financier Mensuel
const etatFinancierFilters = ref({
  annee: new Date().getFullYear(),
  mois: new Date().getMonth() + 1, // Mois courant (1-12)
  type: 'fonctionnel' as 'fonctionnel' | 'investissement',
});

// Options pour les mois
const moisOptions = [
  { label: 'Janvier', value: 1 },
  { label: 'Février', value: 2 },
  { label: 'Mars', value: 3 },
  { label: 'Avril', value: 4 },
  { label: 'Mai', value: 5 },
  { label: 'Juin', value: 6 },
  { label: 'Juillet', value: 7 },
  { label: 'Août', value: 8 },
  { label: 'Septembre', value: 9 },
  { label: 'Octobre', value: 10 },
  { label: 'Novembre', value: 11 },
  { label: 'Décembre', value: 12 },
];

const statutOptions = [
  { label: 'Brouillon', value: 'brouillon' },
  { label: 'Validée', value: 'validee' },
];

const typeBienOptions = [
  { label: 'Immobilier', value: 'immobilier' },
  { label: 'Mobilier', value: 'mobilier' },
  { label: 'Incorporel', value: 'incorporel' },
];

const chapitreOptions = computed(() =>
  chapitres.value.map((c) => ({ label: `${c.code} - ${c.libelle}`, value: c.id })),
);

const sousChapitreOptions = computed(() =>
  sousChapitres.value.map((s) => ({ label: `${s.code} - ${s.libelle}`, value: s.id })),
);

const filteredSousChapitreOptions = ref([] as { label: string; value: number | undefined }[]);

watch(
  sousChapitreOptions,
  (newOptions) => {
    filteredSousChapitreOptions.value = newOptions;
  },
  { immediate: true },
);

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
    field: (row: Prevision) => {
      const chapitre = chapitres.value.find((c) => c.id === row.chapitreId);
      return chapitre ? `${chapitre.code} - ${chapitre.libelle}` : '';
    },
    sortable: true,
  },
  {
    name: 'sousChapitre',
    label: 'Sous-chapitre',
    align: 'left' as const,
    field: (row: Prevision) => {
      if (!('sousChapitreId' in row) || !row.sousChapitreId) return '';
      const sousChapitre = sousChapitres.value.find((s) => s.id === row.sousChapitreId);
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
    name: 'typeBien',
    label: 'Type de bien',
    align: 'center' as const,
    field: (row: Prevision) => {
      const opt = typeBienOptions.find((o) => o.value === row.typeBien);
      return opt ? opt.label : '-';
    },
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

  if (lockedYears.value.length > 0) {
    result = result.filter((p) => !lockedYears.value.includes(p.exercice));
  }

  if (filterExercice.value) {
    result = result.filter((p) => p.exercice === filterExercice.value);
  }

  if (filterChapitreId.value) {
    result = result.filter((p) => p.chapitreId === filterChapitreId.value);
  }

  if (filterSousChapitreId.value) {
    result = result.filter(
      (p) => 'sousChapitreId' in p && p.sousChapitreId === filterSousChapitreId.value,
    );
  }

  if (filter.value) {
    const searchTerm = filter.value.toLowerCase();
    result = result.filter((p) => {
      const chapitre = chapitres.value.find((c) => c.id === p.chapitreId);
      const sousChapitre = sousChapitres.value.find((s) => s.id === p.sousChapitreId);
      return [
        p.exercice.toString(),
        chapitre?.code,
        chapitre?.libelle,
        sousChapitre?.code,
        sousChapitre?.libelle,
        p.typeBien,
        p.statut,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(searchTerm));
    });
  }

  return result;
});

const totalPrevu = computed(() =>
  filteredPrevisions.value.reduce((sum, p) => sum + (p.montantPrevu || 0), 0),
);

const totalEngage = computed(() =>
  filteredPrevisions.value.reduce((sum, p) => sum + (p.montantEngage || 0), 0),
);

const totalDisponible = computed(() =>
  filteredPrevisions.value.reduce((sum, p) => sum + (p.montantDisponible || 0), 0),
);

const tauxExecution = computed(() =>
  totalPrevu.value > 0 ? (totalEngage.value / totalPrevu.value) * 100 : 0,
);

const activeFiltersCount = computed(() => {
  let count = 0;
  if (filterExercice.value) count += 1;
  if (filterChapitreId.value) count += 1;
  if (filterSousChapitreId.value) count += 1;
  return count;
});

function resetFilters() {
  filterExercice.value = null;
  filterChapitreId.value = null;
  filterSousChapitreId.value = null;
  filter.value = '';
}

function exportRows() {
  dataTableRef.value?.exportCsv();
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
    brouillon: 'grey-6',
    validee: 'primary',
  };
  return colors[statut] || 'grey';
}

function getStatutLabel(statut: string): string {
  const labels: Record<string, string> = {
    brouillon: 'Brouillon',
    validee: 'Validée',
  };
  return labels[statut] || statut;
}

async function loadData() {
  loading.value = true;
  try {
    previsions.value = await db.previsions.toArray();
    chapitres.value = await db.chapitres.filter((c) => c.actif).toArray();
    sousChapitres.value = await db.sousChapitres
      .filter((s) => s.actif && !s.code.startsWith('7'))
      .toArray();
    mandats.value = await db.mandats.toArray();
    exercices.value = await db.exercices.toArray();
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

async function printCT02() {
  loadingCT02.value = true;
  try {
    const exercice = ct02Filters.value.exercice;
    const sousChapitreId = ct02Filters.value.sousChapitreId;

    // Récupérer la mairie
    const mairie = await db.mairies.toCollection().first();

    // Récupérer le sous-chapitre sélectionné
    let sousChapitreInfo = null;
    if (sousChapitreId) {
      sousChapitreInfo = await db.sousChapitres.get(sousChapitreId);
    }

    // Récupérer les prévisions de l'exercice
    const previsionsExercice = await db.previsions.where('exercice').equals(exercice).toArray();
    const previsionsFiltered = sousChapitreId
      ? previsionsExercice.filter(
          (p) => 'sousChapitreId' in p && p.sousChapitreId === sousChapitreId,
        )
      : previsionsExercice;

    // Récupérer les mandats de l'exercice (payés)
    const mandatsExercice = (await db.mandats.where('exercice').equals(exercice).toArray()).filter(
      (m) => m.statut === 'paye',
    );

    // Si un sous-chapitre est sélectionné, filtrer les mandats
    const mandatsFiltres = sousChapitreId
      ? mandatsExercice.filter((m) => m.sousChapitreId === sousChapitreId)
      : mandatsExercice;

    // Calculer les totaux par chapitre (1-8)
    const chapitresCodes = ['1', '2', '3', '4', '5', '6', '7', '8'];
    const chapitresData = await db.chapitres.toArray();
    const chapitresMap = new Map(chapitresData.map((c) => [c.id, c]));

    // Prévisions par chapitre
    const previsionsByChapitreCode: Record<string, number> = {};
    chapitresCodes.forEach((code) => (previsionsByChapitreCode[code] = 0));

    previsionsFiltered.forEach((p) => {
      const chapitre = chapitresMap.get(p.chapitreId);
      if (chapitre && chapitresCodes.includes(chapitre.code)) {
        previsionsByChapitreCode[chapitre.code] =
          (previsionsByChapitreCode[chapitre.code] ?? 0) + p.montantPrevu;
      }
    });

    // Émissions par chapitre
    const emissionsByChapitreCode: Record<string, number> = {};
    chapitresCodes.forEach((code) => (emissionsByChapitreCode[code] = 0));

    mandatsFiltres.forEach((m) => {
      const chapitre = chapitresMap.get(m.chapitreId);
      if (chapitre && chapitresCodes.includes(chapitre.code)) {
        emissionsByChapitreCode[chapitre.code] =
          (emissionsByChapitreCode[chapitre.code] ?? 0) + m.montant;
      }
    });

    // Calculer les crédits disponibles
    const creditsDispoByChapitreCode: Record<string, number> = {};
    chapitresCodes.forEach((code) => {
      creditsDispoByChapitreCode[code] =
        (previsionsByChapitreCode[code] ?? 0) - (emissionsByChapitreCode[code] ?? 0);
    });

    // Calculer les totaux
    const totalPrevisions = Object.values(previsionsByChapitreCode).reduce((a, b) => a + b, 0);
    const totalEmissions = Object.values(emissionsByChapitreCode).reduce((a, b) => a + b, 0);
    const totalCreditsDispo = totalPrevisions - totalEmissions;

    // Grouper les mandats par mois pour l'affichage détaillé
    const mandatsByMonth: Record<string, Mandat[]> = {};
    mandatsFiltres.forEach((m) => {
      const date = new Date(m.dateMandat);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (!mandatsByMonth[monthKey]) {
        mandatsByMonth[monthKey] = [];
      }
      mandatsByMonth[monthKey].push(m);
    });

    // Préparer les données pour CT02.html
    const ct02Data = {
      mairie: mairie
        ? {
            nom: mairie.nom,
            code: mairie.code,
            ville: mairie.ville,
          }
        : null,
      exercice,
      sousChapitreCode: sousChapitreInfo?.code || 'TOUS',
      sousChapitreLibelle: sousChapitreInfo?.libelle || 'TOUS LES SOUS-CHAPITRES',
      chapitresCodes,
      previsionsByChapitreCode,
      emissionsByChapitreCode,
      creditsDispoByChapitreCode,
      totalPrevisions,
      totalEmissions,
      totalCreditsDispo,
      mandats: mandatsFiltres.map((m) => ({
        ...m,
        chapitreCode: chapitresMap.get(m.chapitreId)?.code || '',
      })),
      mandatsByMonth,
    };

    // Ouvrir CT02.html dans une nouvelle fenêtre et lui envoyer les données
    await openPrintWindowWithMessage('CT02.html', { type: 'FILL_CT02_DATA', data: ct02Data });

    showCT02Dialog.value = false;
  } catch (error) {
    console.error('Erreur lors de la génération du CT02:', error);
    $q.notify({
      type: 'negative',
      message: 'Erreur lors de la génération du CT02',
    });
  } finally {
    loadingCT02.value = false;
  }
}

/**
 * Ouvre le dialogue pour sélectionner l'année et le mois de l'état financier
 */
function openEtatFinancierMensuel(type: 'fonctionnel' | 'investissement') {
  etatFinancierFilters.value.type = type;
  showEtatFinancierDialog.value = true;
}

/**
 * Génère l'état financier mensuel avec calcul dynamique des antécédents
 */
async function generateEtatFinancierMensuel() {
  loadingEtatFinancier.value = true;

  try {
    const annee = etatFinancierFilters.value.annee;
    const moisSelectionne = etatFinancierFilters.value.mois;

    // Récupérer uniquement les mandats payés de l'année sélectionnée
    // (brouillon et annulé ne doivent pas impacter l'état d'exécution)
    const mandatsAnnee = await db.mandats
      .where('exercice')
      .equals(annee)
      .filter((m) => m.statut === 'paye')
      .toArray();

    // Récupérer les chapitres et sous-chapitres
    const chapitresData = await db.chapitres.toArray();
    const sousChapitresData = await db.sousChapitres.toArray();
    const previsionsData = await db.previsions.where('exercice').equals(annee).toArray();

    // Créer une map des codes
    const chapitreMap = new Map(chapitresData.map((c) => [c.id, c]));
    const sousChapitreMap = new Map(sousChapitresData.map((s) => [s.id, s]));

    const isEligibleSousChapitreCode = (code: string) => {
      const trimmed = (code || '').trim();
      if (trimmed.length < 3) return false;
      const firstChar = trimmed.charAt(0);
      // Fonctionnel: codes commençant par 6
      // Investissement: codes commençant par 9
      if (etatFinancierFilters.value.type === 'fonctionnel') {
        return firstChar === '6';
      } else {
        return firstChar === '9';
      }
    };

    const parseEtatMensuelId = (etatMensuelId: string) => {
      // Format attendu: {année-mois}--{sousChapitreCode}/{chapitreCode}
      // Exemple: 2025-12--6000/5
      const [ym, rest] = (etatMensuelId || '').split('--');
      if (!ym || !rest) return null;
      const [sousChapitreCode, chapitreCode] = rest.split('/');
      if (!sousChapitreCode || !chapitreCode) return null;
      return {
        ym,
        sousChapitreCode: sousChapitreCode.trim(),
        chapitreCode: chapitreCode.trim(),
      };
    };

    // Calculer les dépenses par mois et par couple sous-chapitre/chapitre
    // (clé basée sur les codes pour faciliter le groupement via etatMensuelId)
    interface DepensesMensuelles {
      [key: string]: {
        sousChapitreCode: string;
        chapitreCode: string;
        sousChapitreLibelle: string;
        chapitreLibelle: string;
        previsionMontant: number;
        depenses: number[]; // Index 0 = janvier, 11 = décembre
      };
    }

    const depensesMap: DepensesMensuelles = {};

    // Initialiser avec toutes les combinaisons existantes dans les prévisions
    for (const prev of previsionsData) {
      if (!prev.sousChapitreId) continue;

      const sousChapitre = sousChapitreMap.get(prev.sousChapitreId);
      const chapitre = chapitreMap.get(prev.chapitreId);

      const sousChapitreCode = (sousChapitre?.code || '').trim();
      const chapitreCode = (chapitre?.code || '').trim();
      if (!sousChapitreCode || !chapitreCode) continue;
      if (!isEligibleSousChapitreCode(sousChapitreCode)) continue;

      const key = `${sousChapitreCode}/${chapitreCode}`;
      if (!depensesMap[key]) {
        depensesMap[key] = {
          sousChapitreCode,
          chapitreCode,
          sousChapitreLibelle: sousChapitre?.libelle || '',
          chapitreLibelle: chapitre?.libelle || '',
          previsionMontant: 0,
          depenses: Array(12).fill(0),
        };
      }
      depensesMap[key].previsionMontant += prev.montantPrevu;
    }

    // Ajouter les dépenses des mandats (utiliser etatMensuelId pour grouper)
    const anneePrefix = `${annee}-`;
    for (const mandat of mandatsAnnee) {
      if (mandat.statut !== 'paye') continue;

      let sousChapitreCode = '';
      let chapitreCode = '';
      let moisIndex: number | null = null;

      if (mandat.etatMensuelId) {
        const parsed = parseEtatMensuelId(mandat.etatMensuelId);
        if (!parsed) continue;
        if (!parsed.ym.startsWith(anneePrefix)) continue;

        const mm = parsed.ym.split('-')[1] || '';
        const moisNum = parseInt(mm, 10);
        if (Number.isNaN(moisNum) || moisNum < 1 || moisNum > 12) continue;

        sousChapitreCode = parsed.sousChapitreCode;
        chapitreCode = parsed.chapitreCode;
        moisIndex = moisNum - 1;
      } else if (mandat.dateMandat) {
        // Fallback si un vieux mandat n'a pas etatMensuelId
        const sousChapitre = sousChapitreMap.get(mandat.sousChapitreId);
        const chapitre = chapitreMap.get(mandat.chapitreId);
        sousChapitreCode = (sousChapitre?.code || '').trim();
        chapitreCode = (chapitre?.code || '').trim();
        moisIndex = new Date(mandat.dateMandat).getMonth();
      }

      if (!sousChapitreCode || !chapitreCode || moisIndex === null) continue;
      if (!isEligibleSousChapitreCode(sousChapitreCode)) continue;

      const key = `${sousChapitreCode}/${chapitreCode}`;
      let entry = depensesMap[key];
      if (!entry) {
        // Combinaison présente dans les mandats mais pas dans les prévisions
        const sousChapitre = sousChapitresData.find(
          (s) => (s.code || '').trim() === sousChapitreCode,
        );
        const chapitre = chapitresData.find((c) => (c.code || '').trim() === chapitreCode);
        entry = depensesMap[key] = {
          sousChapitreCode,
          chapitreCode,
          sousChapitreLibelle: sousChapitre?.libelle || '',
          chapitreLibelle: chapitre?.libelle || '',
          previsionMontant: 0,
          depenses: Array(12).fill(0),
        };
      }

      if (entry && moisIndex >= 0 && moisIndex < 12) {
        entry.depenses[moisIndex] = (entry.depenses[moisIndex] ?? 0) + mandat.montant;
      }
    }

    // Calculer les antécédents et préparer les données pour l'affichage
    const etatFinancierData = Object.values(depensesMap).map((item) => {
      const antecedents: number[] = [];
      let cumul = 0;

      // Calculer les antécédents pour chaque mois
      for (let m = 0; m < 12; m++) {
        antecedents[m] = cumul; // L'antécédent du mois est le cumul des mois précédents
        cumul += item.depenses[m] ?? 0;
      }

      // Données pour le mois sélectionné
      const moisIndex = moisSelectionne - 1;
      const antecedent = antecedents[moisIndex] ?? 0;
      const depenseMois = item.depenses[moisIndex] ?? 0;
      const total = antecedent + depenseMois;

      return {
        sousChapitreCode: item.sousChapitreCode,
        chapitreCode: item.chapitreCode,
        sousChapitreLibelle: item.sousChapitreLibelle,
        chapitreLibelle: item.chapitreLibelle,
        prevision: item.previsionMontant,
        antecedent,
        depenseMois,
        total,
        solde: item.previsionMontant - total,
        // Tous les mois pour référence
        depensesParMois: item.depenses,
        antecedentsParMois: antecedents,
      };
    });

    // Filtrer + trier par code sous-chapitre puis chapitre
    const etatFinancierDataFiltered = etatFinancierData
      .filter((l) => isEligibleSousChapitreCode(l.sousChapitreCode))
      .sort((a, b) => {
        const aSous = parseInt(a.sousChapitreCode, 10);
        const bSous = parseInt(b.sousChapitreCode, 10);
        if (!Number.isNaN(aSous) && !Number.isNaN(bSous) && aSous !== bSous) return aSous - bSous;

        const aChap = parseInt(a.chapitreCode, 10);
        const bChap = parseInt(b.chapitreCode, 10);
        if (!Number.isNaN(aChap) && !Number.isNaN(bChap) && aChap !== bChap) return aChap - bChap;

        return `${a.sousChapitreCode}-${a.chapitreCode}`.localeCompare(
          `${b.sousChapitreCode}-${b.chapitreCode}`,
        );
      });

    // Préparer les données pour la page HTML
    const dataToSend = {
      annee,
      mois: moisSelectionne,
      moisNom: moisOptions.find((m) => m.value === moisSelectionne)?.label || '',
      // En-tête de l'état : lu depuis constanteInfo, source de vérité de la
      // commune, et non depuis la table `mairies` figée au premier seed.
      mairie: {
        nom: MAIRIE_INFO.nom,
        code: MAIRIE_INFO.code,
        departement: MAIRIE_INFO.departement,
      },
      lignes: etatFinancierDataFiltered,
      totaux: {
        prevision: etatFinancierDataFiltered.reduce((sum, l) => sum + l.prevision, 0),
        antecedent: etatFinancierDataFiltered.reduce((sum, l) => sum + l.antecedent, 0),
        depenseMois: etatFinancierDataFiltered.reduce((sum, l) => sum + l.depenseMois, 0),
        total: etatFinancierDataFiltered.reduce((sum, l) => sum + l.total, 0),
        solde: etatFinancierDataFiltered.reduce((sum, l) => sum + l.solde, 0),
      },
    };

    // Ouvrir la page HTML et envoyer les données
    const pageUrl =
      etatFinancierFilters.value.type === 'fonctionnel'
        ? 'etat-financier-mensuel/depense.html'
        : 'etat-financier-mensuel/investissement.html';
    await openPrintWindowWithMessage(pageUrl, {
      type: 'FILL_ETAT_FINANCIER_DATA',
      data: dataToSend,
    });

    showEtatFinancierDialog.value = false;
  } catch (error) {
    console.error("Erreur lors de la génération de l'état financier:", error);
    $q.notify({
      type: 'negative',
      message: "Erreur lors de la génération de l'état financier mensuel",
    });
  } finally {
    loadingEtatFinancier.value = false;
  }
}

function resetForm() {
  formData.value = {
    exercice: new Date().getFullYear(),
    chapitreId: null,
    sousChapitreId: null,
    montantPrevu: 0,
    typeBien: '',
    statut: 'validee',
    observations: '',
  };
  editingId.value = null;
}

async function savePrevision() {
  try {
    const now = new Date();
    const mairieId = 1;
    const personnelId = 1;

    const baseData = {
      exercice: formData.value.exercice,
      chapitreId: formData.value.chapitreId!,
      montantPrevu: formData.value.montantPrevu,
      montantEngage: 0,
      montantDisponible: formData.value.montantPrevu,
      ...(formData.value.typeBien ? { typeBien: formData.value.typeBien } : {}),
      statut: formData.value.statut,
      observations: formData.value.observations,
      mairieId,
      personnelId,
    };

    // Ajouter sousChapitreId seulement s'il est défini
    const data = formData.value.sousChapitreId
      ? { ...baseData, sousChapitreId: formData.value.sousChapitreId }
      : baseData;

    if (editingId.value) {
      await db.previsions.update(editingId.value, {
        ...data,
        updatedAt: now,
      } as Parameters<typeof db.previsions.update>[1]);
      $q.notify({
        type: 'positive',
        message: 'Prévision modifiée avec succès',
      });
    } else {
      await db.previsions.add({
        ...data,
        createdAt: now,
        updatedAt: now,
      } as Parameters<typeof db.previsions.add>[0]);
      $q.notify({
        type: 'positive',
        message: 'Prévision ajoutée avec succès',
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

function editPrevision(row: Prevision) {
  editingId.value = row.id!;
  formData.value = {
    exercice: row.exercice,
    chapitreId: row.chapitreId,
    sousChapitreId: ('sousChapitreId' in row ? row.sousChapitreId : null) || null,
    montantPrevu: row.montantPrevu,
    typeBien: (row.typeBien as '' | 'immobilier' | 'mobilier' | 'incorporel') || '',
    statut: row.statut,
    observations: row.observations || '',
  };
  showAddDialog.value = true;
}

function deletePrevision(row: Prevision) {
  $q.dialog({
    title: 'Confirmation',
    message: 'Voulez-vous vraiment supprimer cette prévision ?',
    cancel: true,
    persistent: true,
  }).onOk(() => {
    void (async () => {
      try {
        await db.previsions.delete(row.id);
        $q.notify({
          type: 'positive',
          message: 'Prévision supprimée avec succès',
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

const isDev = import.meta.env.VITE_ENV === 'development';

async function createFakePrevision() {
  try {
    const currentYear = new Date().getFullYear();
    const chapitre = chapitres.value[Math.floor(Math.random() * chapitres.value.length)];
    const sousChapitre =
      sousChapitres.value[Math.floor(Math.random() * sousChapitres.value.length)];
    if (!chapitre || !sousChapitre) {
      $q.notify({ type: 'warning', message: 'Aucun chapitre/sous-chapitre disponible' });
      return;
    }
    const now = new Date();
    const montantPrevu = Math.floor(Math.random() * 10000000) + 500000;
    const types = ['immobilier', 'mobilier', 'incorporel'] as const;
    const randomType = types[Math.floor(Math.random() * types.length)]!;
    await db.previsions.add({
      exercice: currentYear,
      chapitreId: chapitre.id!,
      sousChapitreId: sousChapitre.id!,
      montantPrevu,
      montantEngage: 0,
      montantDisponible: montantPrevu,
      typeBien: randomType,
      statut: 'validee',
      mairieId: 1,
      personnelId: 1,
      createdAt: now,
      updatedAt: now,
    });
    $q.notify({ type: 'positive', message: 'Prévision fake créée' });
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
.prevision-page {
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
