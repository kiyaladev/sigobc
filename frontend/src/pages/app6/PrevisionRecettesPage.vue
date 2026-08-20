<template>
  <q-page class="prevision-page q-pa-md">
    <PageHeader
      title="Prévisions de Recettes"
      subtitle="Gestion des prévisions budgétaires de recettes"
      icon="trending_up"
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
                <div class="overview-stat-label">Montant réalisé</div>
                <div class="overview-stat-value">{{ formatMontant(totalRealise) }}</div>
                <div class="overview-stat-helper">Écart : {{ formatMontant(ecart) }}</div>
              </div>
              <q-icon name="task_alt" size="30px" color="positive" />
            </q-card-section>
          </q-card>
        </div>
        <div class="col-12 col-sm-6 col-lg-3">
          <q-card flat class="listing-stat-card overview-stat-card">
            <q-card-section class="row items-center no-wrap">
              <div class="col">
                <div class="overview-stat-label">Taux de réalisation</div>
                <div class="overview-stat-value">{{ tauxRealisation.toFixed(1) }} %</div>
              </div>
              <q-icon name="monitoring" size="30px" color="teal" />
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
                          v-model="filterTaxeId"
                          :options="taxeOptions"
                          label="Taxe / Recette"
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
                          :options="statutOptions"
                          label="Statut"
                          outlined
                          dense
                          emit-value
                          map-options
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
                label="Nouvelle"
                unelevated
                no-caps
                data-visite="recettes-nouvelle-prevision"
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
                    <q-item clickable v-close-popup @click="openEtatMensuel('fonctionnel')">
                      <q-item-section avatar>
                        <q-icon name="description" color="green" />
                      </q-item-section>
                      <q-item-section>État fonctionnel</q-item-section>
                    </q-item>
                    <q-item clickable v-close-popup @click="openEtatMensuel('investissement')">
                      <q-item-section avatar>
                        <q-icon name="business_center" color="grey" />
                      </q-item-section>
                      <q-item-section>État investissement</q-item-section>
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
          row-key="id"
          :pagination="{ rowsPerPage: 15 }"
          bordered
          class="prevision-table"
          export-filename="previsions-recettes"
          data-visite-edit="recettes-modifier-prevision"
          @edit="editPrevision"
          @delete="deletePrevision"
        >
          <template v-slot:body-cell-statut="props">
            <q-td :props="props">
              <q-chip :color="getStatutColor(props.row.statut)" text-color="white" size="sm" dense>
                {{ props.row.statut }}
              </q-chip>
            </q-td>
          </template>

          <template v-slot:no-data>
            <div class="full-width text-center q-pa-lg">
              <q-icon name="inbox" size="48px" color="grey-5" class="q-mb-md" />
              <div class="text-grey-6">Aucune prévision trouvée</div>
            </div>
          </template>
        </DataTable>
      </q-card-section>
    </q-card>

    <!-- Dialog d'ajout/modification -->
    <q-dialog v-model="showAddDialog" persistent>
      <q-card class="dialog-card" style="width: min(600px, 96vw); max-width: 96vw">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">
            {{ editingId ? 'Modifier la prévision' : 'Nouvelle prévision de recette' }}
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
              v-model="formData.taxeId"
              :options="taxeOptions"
              label="Taxe / Recette *"
              outlined
              dense
              emit-value
              map-options
              :rules="[(val) => !!val || 'Taxe requise']"
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

            <q-input
              v-model.number="formData.montantRealise"
              label="Montant Réalisé"
              outlined
              dense
              type="number"
              prefix="CFA"
            />

            <q-select
              v-model="formData.statut"
              :options="['brouillon', 'validee']"
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
              <q-btn label="Enregistrer" type="submit" color="primary" unelevated />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Dialog État Mensuel -->
    <q-dialog v-model="showEtatMensuelDialog" persistent>
      <q-card class="dialog-card" style="width: min(400px, 96vw); max-width: 96vw">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">
            État Mensuel des Recettes
            <q-chip
              :color="etatMensuelFilters.type === 'fonctionnel' ? 'green' : 'blue'"
              text-color="white"
              size="sm"
            >
              {{
                etatMensuelFilters.type === 'fonctionnel'
                  ? 'Fonctionnel (Titre I)'
                  : 'Investissement (Titre II)'
              }}
            </q-chip>
          </div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <div class="q-gutter-md">
            <q-select
              v-model="etatMensuelFilters.annee"
              :options="exerciceOptions"
              label="Année *"
              outlined
              dense
              emit-value
              map-options
            />

            <q-select
              v-model="etatMensuelFilters.mois"
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
                :color="etatMensuelFilters.type === 'fonctionnel' ? 'green' : 'blue'"
                unelevated
                @click="generateEtatMensuel"
                :loading="loadingEtatMensuel"
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
  type Taxe,
  type PrevisionRecette,
  type Declaration,
  type Exercice,
  type MandatRecette,
  DEFAULT_MAIRIE_ID,
} from 'src/database/db';
import PageHeader from 'src/components/PageHeader.vue';
import DataTable from 'src/components/DataTable.vue';
import { openPrintWindowWithMessage } from 'src/utils/printUrl';
import { MAIRIE_INFO } from 'src/constanteInfo';

const $q = useQuasar();
const loading = ref(false);
const loadingEtatMensuel = ref(false);
const dataTableRef = ref<{ exportCsv: () => void } | null>(null);
const filter = ref('');
const showAddDialog = ref(false);
const showEtatMensuelDialog = ref(false);
const editingId = ref<number | null>(null);

// Filtres
const filterExercice = ref<number | null>(null);
const filterTaxeId = ref<number | null>(null);
const filterStatut = ref<string | null>(null);

const previsions = ref<PrevisionRecette[]>([]);
const taxes = ref<Taxe[]>([]);
const declarations = ref<Declaration[]>([]);
const mandatsRecette = ref<MandatRecette[]>([]);
const exercices = ref<Exercice[]>([]);
const lockedYears = computed(() =>
  exercices.value.filter((e) => e.statut === 'verrouille').map((e) => e.annee),
);

const formData = ref({
  exercice: new Date().getFullYear(),
  taxeId: null as number | null,
  montantPrevu: 0,
  montantRealise: 0,
  statut: 'validee' as 'brouillon' | 'validee',
  observations: '',
});

// Filtres État Mensuel
const etatMensuelFilters = ref({
  annee: new Date().getFullYear(),
  mois: new Date().getMonth() + 1,
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

const taxeOptions = computed(() =>
  taxes.value.map((t) => ({ label: `${t.code} - ${t.libelle}`, value: t.id })),
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
  if (years.length === 0) {
    const currentYear = new Date().getFullYear();
    years.push(currentYear);
  }
  return years.map((y) => ({ label: String(y), value: y }));
});

// Compute realise dynamically from declarations + mandats recette
const realiseMap = computed(() => {
  const map = new Map<string, number>();
  // Declarations validees
  for (const d of declarations.value) {
    if (d.statut !== 'validee') continue;
    const key = `${d.exercice}-${d.taxeId}`;
    const montant = d.montantRecette || d.montant || 0;
    map.set(key, (map.get(key) || 0) + montant);
  }
  // Mandats recette payes
  for (const m of mandatsRecette.value) {
    if (m.statut !== 'paye') continue;
    const key = `${m.exercice}-${m.taxeId}`;
    map.set(key, (map.get(key) || 0) + m.montant);
  }
  return map;
});

function getRealise(row: PrevisionRecette): number {
  const key = `${row.exercice}-${row.taxeId}`;
  return realiseMap.value.get(key) || 0;
}

const columns = [
  {
    name: 'exercice',
    label: 'Exercice',
    align: 'left' as const,
    field: 'exercice',
    sortable: true,
  },
  {
    name: 'taxe',
    label: 'Taxe / Recette',
    align: 'left' as const,
    field: (row: PrevisionRecette) => {
      const taxe = taxes.value.find((t) => t.id === row.taxeId);
      return taxe ? `${taxe.code} - ${taxe.libelle}` : '';
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
    name: 'montantRealise',
    label: 'Engagé',
    align: 'right' as const,
    field: (row: PrevisionRecette) => getRealise(row),
    format: (val: number) => formatMontant(val),
    sortable: true,
  },
  {
    name: 'montantDisponible',
    label: 'Disponible',
    align: 'right' as const,
    field: (row: PrevisionRecette) => row.montantPrevu - getRealise(row),
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

  if (filterTaxeId.value) {
    result = result.filter((p) => p.taxeId === filterTaxeId.value);
  }

  if (filterStatut.value) {
    result = result.filter((p) => p.statut === filterStatut.value);
  }

  if (filter.value) {
    const searchTerm = filter.value.toLowerCase();
    result = result.filter((p) => {
      const taxe = taxes.value.find((t) => t.id === p.taxeId);
      return (
        p.exercice.toString().includes(searchTerm) ||
        (taxe && taxe.libelle.toLowerCase().includes(searchTerm))
      );
    });
  }

  return result;
});

const totalPrevu = computed(() =>
  filteredPrevisions.value.reduce((sum, p) => sum + p.montantPrevu, 0),
);

const totalRealise = computed(() =>
  filteredPrevisions.value.reduce((sum, p) => sum + getRealise(p), 0),
);

const ecart = computed(() => totalRealise.value - totalPrevu.value);

const tauxRealisation = computed(() =>
  totalPrevu.value > 0 ? (totalRealise.value / totalPrevu.value) * 100 : 0,
);

const activeFiltersCount = computed(() => {
  return [filterExercice.value, filterTaxeId.value, filterStatut.value].filter(
    (value) => value !== null && value !== '',
  ).length;
});

function resetFilters() {
  filterExercice.value = null;
  filterTaxeId.value = null;
  filterStatut.value = null;
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
    brouillon: 'grey',
    validee: 'blue',
  };
  return colors[statut] || 'grey';
}

function openEtatMensuel(type: 'fonctionnel' | 'investissement') {
  etatMensuelFilters.value.type = type;
  showEtatMensuelDialog.value = true;
}

async function generateEtatMensuel() {
  loadingEtatMensuel.value = true;

  try {
    const annee = etatMensuelFilters.value.annee;
    const moisSelectionne = etatMensuelFilters.value.mois;
    const type = etatMensuelFilters.value.type;

    // Récupérer toutes les taxes
    const allTaxes = await db.taxes.toArray();

    // Filtrer les taxes par type
    // Fonctionnel: codes >= 7000 (exclure sections/chapitres 70, 700, 71, 710, etc.)
    // Investissement: codes commençant par 0 (02, 04, 06, etc.)
    const filteredTaxes = allTaxes.filter((t) => {
      const code = t.code || '';
      if (type === 'fonctionnel') {
        if (!code.startsWith('7')) return false;
        const codeNum = parseInt(code, 10);
        if (isNaN(codeNum)) return false;
        // Comptes de détail (4 chiffres et +)
        if (codeNum >= 7000) return true;
        // Inclure aussi les chapitres "feuilles" (3 chiffres sans sous-compte),
        // utilisés directement comme comptes d'imputation (ex. 742). Les vrais
        // en-têtes de section/chapitre (qui ont des sous-comptes) restent exclus.
        if (code.length === 3) {
          const hasChild = allTaxes.some(
            (o) =>
              o.code &&
              o.code !== code &&
              o.code.startsWith(code) &&
              o.code.length > code.length,
          );
          return !hasChild;
        }
        return false;
      } else {
        // Codes 02, 04, 06 (investissement)
        return code.startsWith('0');
      }
    });

    // Récupérer uniquement les déclarations validées de l'année
    // (brouillon et annulé ne doivent pas impacter l'état d'exécution)
    const declarations = await db.declarations
      .filter((d) => d.exercice === annee && d.statut === 'validee')
      .toArray();

    // Récupérer uniquement les mandats de recettes payés de l'année
    const mandatsRecette = await db.mandatsRecette
      .filter((m) => m.exercice === annee && m.statut === 'paye')
      .toArray();

    // Récupérer les prévisions de l'année en cours
    const previsionsAnnee = previsions.value.filter((p) => p.exercice === annee);

    // Calculer les recettes par taxe et par mois
    const recettesByTaxe: Record<
      number,
      {
        taxe: Taxe;
        prevision: number;
        recettesParMois: number[];
      }
    > = {};

    // Initialiser avec les taxes filtrées
    for (const taxe of filteredTaxes) {
      if (!taxe.id) continue;
      const previsionTaxe = previsionsAnnee.find((p) => p.taxeId === taxe.id);
      recettesByTaxe[taxe.id] = {
        taxe,
        prevision: previsionTaxe?.montantPrevu || 0,
        recettesParMois: Array(12).fill(0),
      };
    }

    // Ajouter les recettes des déclarations
    for (const decl of declarations) {
      if (!decl.taxeId || !recettesByTaxe[decl.taxeId]) continue;

      const dateDecl = decl.dateEncaissement || decl.dateDeclaration;
      if (!dateDecl) continue;

      const moisIndex = new Date(dateDecl).getMonth();
      const montant = decl.montantRecette || decl.montant || 0;
      const taxeEntry = recettesByTaxe[decl.taxeId];
      if (taxeEntry) {
        const currentValue = taxeEntry.recettesParMois[moisIndex] ?? 0;
        taxeEntry.recettesParMois[moisIndex] = currentValue + montant;
      }
    }

    // Ajouter les recettes des mandats de recettes
    for (const mandat of mandatsRecette) {
      if (!mandat.taxeId || !recettesByTaxe[mandat.taxeId]) continue;

      const dateMandat = mandat.dateMandat;
      if (!dateMandat) continue;

      const moisIndex = new Date(dateMandat).getMonth();
      const montant = mandat.montant || 0;
      const taxeEntry = recettesByTaxe[mandat.taxeId];
      if (taxeEntry) {
        const currentValue = taxeEntry.recettesParMois[moisIndex] ?? 0;
        taxeEntry.recettesParMois[moisIndex] = currentValue + montant;
      }
    }

    // Préparer les données pour le rapport
    const lignes = Object.values(recettesByTaxe)
      .map((item) => {
        const antecedents: number[] = [];
        let cumul = 0;

        // Calculer les antécédents pour chaque mois
        for (let m = 0; m < 12; m++) {
          antecedents[m] = cumul;
          cumul += item.recettesParMois[m] || 0;
        }

        const moisIndex = moisSelectionne - 1;
        const antecedent = antecedents[moisIndex] || 0;
        const recetteMois = item.recettesParMois[moisIndex] || 0;
        const total = antecedent + recetteMois;

        return {
          code: item.taxe.code,
          libelle: item.taxe.libelle,
          prevision: item.prevision,
          antecedent,
          recetteMois,
          total,
        };
      })
      // Trier par code numérique pour un affichage cohérent
      .sort((a, b) => {
        const aNum = parseInt(a.code, 10);
        const bNum = parseInt(b.code, 10);
        if (!isNaN(aNum) && !isNaN(bNum)) return aNum - bNum;
        return a.code.localeCompare(b.code);
      });

    // Calculer les totaux
    const totaux = {
      prevision: lignes.reduce((sum, l) => sum + l.prevision, 0),
      antecedent: lignes.reduce((sum, l) => sum + l.antecedent, 0),
      recetteMois: lignes.reduce((sum, l) => sum + l.recetteMois, 0),
      total: lignes.reduce((sum, l) => sum + l.total, 0),
    };

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
      lignes,
      totaux,
    };

    // Ouvrir la page HTML et envoyer les données
    const pageUrl =
      type === 'fonctionnel'
        ? 'etat-financier-mensuel/recette-fonctionnelle.html'
        : 'etat-financier-mensuel/recette-investissement.html';

    await openPrintWindowWithMessage(pageUrl, { type: 'FILL_ETAT_RECETTE_DATA', data: dataToSend });

    showEtatMensuelDialog.value = false;
  } catch (error) {
    console.error("Erreur lors de la génération de l'état mensuel:", error);
    $q.notify({
      type: 'negative',
      message: "Erreur lors de la génération de l'état mensuel",
    });
  } finally {
    loadingEtatMensuel.value = false;
  }
}

async function loadData() {
  loading.value = true;
  try {
    [taxes.value, previsions.value, declarations.value, mandatsRecette.value, exercices.value] = await Promise.all([
      db.taxes.filter((t) => t.actif).toArray(),
      db.previsionsRecettes.toArray(),
      db.declarations.toArray(),
      db.mandatsRecette.toArray(),
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

async function savePrevision() {
  try {
    const now = new Date();

    // Règle métier : une seule prévision par compte (taxe) et par exercice.
    const duplicate = previsions.value.find(
      (p) =>
        p.exercice === formData.value.exercice &&
        p.taxeId === formData.value.taxeId &&
        p.id !== editingId.value,
    );
    if (duplicate) {
      $q.notify({
        type: 'negative',
        message: `Une prévision existe déjà pour ce compte sur l'exercice ${formData.value.exercice}. Modifiez-la plutôt que d'en créer une seconde.`,
      });
      return;
    }

    if (editingId.value) {
      // Modification
      await db.previsionsRecettes.update(editingId.value, {
        exercice: formData.value.exercice,
        taxeId: formData.value.taxeId!,
        montantPrevu: formData.value.montantPrevu,
        montantRealise: formData.value.montantRealise,
        statut: formData.value.statut,
        observations: formData.value.observations,
        updatedAt: now,
      });
    } else {
      // Création
      await db.previsionsRecettes.add({
        exercice: formData.value.exercice,
        taxeId: formData.value.taxeId!,
        mairieId: DEFAULT_MAIRIE_ID,
        montantPrevu: formData.value.montantPrevu,
        montantRealise: formData.value.montantRealise,
        statut: formData.value.statut,
        observations: formData.value.observations,
        createdAt: now,
        updatedAt: now,
      });
    }

    $q.notify({
      type: 'positive',
      message: editingId.value ? 'Prévision modifiée' : 'Prévision créée',
    });

    showAddDialog.value = false;
    resetForm();
    await loadData();
  } catch (error) {
    console.error('Erreur lors de la sauvegarde:', error);
    $q.notify({
      type: 'negative',
      message: 'Erreur lors de la sauvegarde',
    });
  }
}

function editPrevision(row: PrevisionRecette) {
  editingId.value = row.id || null;
  formData.value = {
    exercice: row.exercice,
    taxeId: row.taxeId,
    montantPrevu: row.montantPrevu,
    montantRealise: row.montantRealise,
    statut: row.statut,
    observations: row.observations || '',
  };
  showAddDialog.value = true;
}

function deletePrevision(row: PrevisionRecette) {
  if (!row.id) return;

  $q.dialog({
    title: 'Confirmation',
    message: 'Voulez-vous vraiment supprimer cette prévision ?',
    cancel: true,
    persistent: true,
  }).onOk(() => {
    db.previsionsRecettes
      .delete(row.id)
      .then(() => {
        $q.notify({
          type: 'positive',
          message: 'Prévision supprimée',
        });
        return loadData();
      })
      .catch((error: unknown) => {
        console.error('Erreur lors de la suppression:', error);
        $q.notify({
          type: 'negative',
          message: 'Erreur lors de la suppression',
        });
      });
  });
}

function resetForm() {
  editingId.value = null;
  formData.value = {
    exercice: new Date().getFullYear(),
    taxeId: null,
    montantPrevu: 0,
    montantRealise: 0,
    statut: 'brouillon',
    observations: '',
  };
}

const isDev = import.meta.env.VITE_ENV === 'development';

async function createFakePrevision() {
  try {
    const currentYear = new Date().getFullYear();
    const taxe = taxes.value[Math.floor(Math.random() * taxes.value.length)];
    if (!taxe) {
      $q.notify({ type: 'warning', message: 'Aucune taxe disponible' });
      return;
    }
    const now = new Date();
    const montantPrevu = Math.floor(Math.random() * 8000000) + 200000;
    await db.previsionsRecettes.add({
      exercice: currentYear,
      taxeId: taxe.id!,
      mairieId: DEFAULT_MAIRIE_ID,
      montantPrevu,
      montantRealise: 0,
      statut: 'validee',
      createdAt: now,
      updatedAt: now,
    });
    $q.notify({ type: 'positive', message: 'Prévision recette fake créée' });
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

@media print {
  .q-btn,
  .q-input,
  .q-select {
    display: none !important;
  }
}
</style>
