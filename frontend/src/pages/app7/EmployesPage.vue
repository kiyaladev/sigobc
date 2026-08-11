<template>
  <q-page class="dashboard-page q-pa-md">
    <PageHeader title="Agents / Employés" subtitle="Registre du personnel" icon="badge">
      <template #stats>
        <div class="col-12 col-sm-6 col-lg-3" v-for="(stat, index) in statsCards" :key="index">
          <q-card flat class="listing-stat-card overview-stat-card">
            <q-card-section class="row items-center no-wrap">
              <div class="col">
                <div class="overview-stat-label">{{ stat.label }}</div>
                <div class="overview-stat-value">{{ stat.value }}</div>
                <div v-if="stat.helper" class="overview-stat-helper">{{ stat.helper }}</div>
              </div>
              <q-icon :name="stat.icon" size="30px" :color="stat.color" />
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
                placeholder="Rechercher par nom, matricule, poste..."
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
                    <div class="row q-col-gutter-sm items-center">
                      <div class="col-12 col-sm-6 col-md-4">
                        <q-toggle v-model="showInactifs" label="Afficher inactifs" dense />
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
                dense
                outline
                color="teal-8"
                icon="assignment_ind"
                label="Rapport DISA"
                no-caps
                @click="openDisaDialog"
              />
              <q-btn
                color="primary"
                icon="add"
                label="Nouvel agent"
                unelevated
                no-caps
                @click="openAdd"
              />
            </div>
          </div>
        </div>

        <DataTable
          :rows="filteredEmployes"
          :columns="columns"
          :loading="loading"
          :pagination="tablePagination"
          @update:pagination="(v: any) => (tablePagination = v)"
          show-export-csv
          export-filename="employes"
          @edit="editEmploye"
          @delete="deleteEmploye"
        >
          <template v-slot:body-cell-actif="props">
            <q-td :props="props">
              <q-chip
                :color="props.row.actif ? 'positive' : 'grey'"
                text-color="white"
                size="sm"
                dense
              >
                {{ props.row.actif ? 'Actif' : 'Inactif' }}
              </q-chip>
            </q-td>
          </template>
          <template v-slot:body-cell-salaireBase="props">
            <q-td :props="props" class="text-right">
              {{ formatMontant(props.row.salaireBase) }}
            </q-td>
          </template>
          <!-- Report row (page 2+) -->
          <template v-slot:top-row>
            <q-tr v-if="tablePagination.page > 1" class="report-row">
              <q-td class="text-weight-bold text-italic">REPORT</q-td>
              <q-td></q-td>
              <q-td></q-td>
              <q-td></q-td>
              <q-td></q-td>
              <q-td class="text-right text-weight-bold text-italic">{{
                formatMontant(reportValues.salaireBase)
              }}</q-td>
              <q-td></q-td>
              <q-td></q-td>
              <q-td></q-td>
            </q-tr>
          </template>
          <!-- Total row -->
          <template v-slot:bottom-row>
            <q-tr class="total-row">
              <q-td class="text-weight-bold">TOTAL</q-td>
              <q-td></q-td>
              <q-td></q-td>
              <q-td></q-td>
              <q-td></q-td>
              <q-td class="text-right text-weight-bold">{{
                formatMontant(totalPageValues.salaireBase)
              }}</q-td>
              <q-td></q-td>
              <q-td></q-td>
              <q-td></q-td>
            </q-tr>
          </template>
        </DataTable>
      </q-card-section>
    </q-card>

    <!-- Dialog Ajout/Modification -->
    <q-dialog v-model="showDialog" persistent>
      <q-card class="dialog-card" style="width: min(850px, 96vw); max-width: 96vw">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">
            {{ editingId ? "Modifier l'agent" : 'Nouvel agent' }}
          </div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-pt-md">
          <q-form @submit="saveEmploye" class="q-gutter-sm">
            <!-- Identité -->
            <div class="text-subtitle2 text-grey-8 q-mb-xs">Identité</div>
            <div class="row q-col-gutter-sm">
              <div class="col-12 col-md-2">
                <q-input
                  v-model="form.matricule"
                  label="Matricule *"
                  outlined
                  dense
                  :rules="[(v) => !!v || 'Obligatoire']"
                />
              </div>
              <div class="col-12 col-md-4">
                <q-input
                  v-model="form.nom"
                  label="Nom *"
                  outlined
                  dense
                  :rules="[(v) => !!v || 'Obligatoire']"
                />
              </div>
              <div class="col-12 col-md-4">
                <q-input
                  v-model="form.prenom"
                  label="Prénom *"
                  outlined
                  dense
                  :rules="[(v) => !!v || 'Obligatoire']"
                />
              </div>
              <div class="col-12 col-md-2">
                <q-select
                  v-model="form.sexe"
                  :options="[
                    { label: 'Masculin', value: 'M' },
                    { label: 'Féminin', value: 'F' },
                  ]"
                  label="Sexe"
                  outlined
                  dense
                  emit-value
                  map-options
                />
              </div>
            </div>
            <div class="row q-col-gutter-sm">
              <div class="col-12 col-md-3">
                <q-input
                  v-model="form.dateNaissance"
                  label="Date de naissance"
                  outlined
                  dense
                  type="date"
                />
              </div>
              <div class="col-12 col-md-3">
                <q-input
                  v-model="form.dateEmbauche"
                  label="Date d'embauche"
                  outlined
                  dense
                  type="date"
                />
              </div>
              <div class="col-12 col-md-3">
                <q-input v-model="form.numeroCNPS" label="N° CNPS" outlined dense />
              </div>
              <div class="col-12 col-md-3">
                <q-input v-model="form.rib" label="RIB / Compte bancaire" outlined dense />
              </div>
            </div>

            <!-- Déclaration CNPS : alimente les colonnes du rapport DISA -->
            <div class="row q-col-gutter-sm">
              <div class="col-12 col-md-3">
                <q-input
                  v-model="form.dateDepart"
                  label="Date de départ"
                  outlined
                  dense
                  clearable
                  type="date"
                  hint="Vide si toujours en poste"
                />
              </div>
              <div class="col-12 col-md-3">
                <q-select
                  v-model="form.typeSalarieCnps"
                  :options="typeSalarieCnpsOptions"
                  label="Type salarié (CNPS)"
                  outlined
                  dense
                  emit-value
                  map-options
                />
              </div>
              <div class="col-12 col-md-3">
                <q-input
                  v-model="form.regimeCnps"
                  label="Régime CNPS"
                  outlined
                  dense
                  hint="1 = PF, 2 = AT, 3 = retraite"
                />
              </div>
            </div>

            <q-separator class="q-my-sm" />

            <!-- Poste -->
            <div class="text-subtitle2 text-grey-8 q-mb-xs">Poste & Affectation</div>
            <div class="row q-col-gutter-sm">
              <div class="col-12 col-md-3">
                <q-select
                  v-model="form.typeEmploye"
                  :options="typeEmployeOptions"
                  label="Type d'agent *"
                  outlined
                  dense
                  :rules="[(v) => !!v || 'Obligatoire']"
                />
              </div>
              <div class="col-12 col-md-3">
                <q-input
                  v-model="form.poste"
                  label="Poste / Fonction *"
                  outlined
                  dense
                  :rules="[(v) => !!v || 'Obligatoire']"
                />
              </div>
              <div class="col-12 col-md-3">
                <q-input v-model="form.grade" label="Grade / Catégorie" outlined dense />
              </div>
              <div class="col-12 col-md-3">
                <q-select
                  v-model="form.service"
                  :options="servicesOptions"
                  label="Service / Direction *"
                  outlined
                  dense
                  use-input
                  input-debounce="0"
                  new-value-mode="add-unique"
                  :rules="[(v) => !!v || 'Obligatoire']"
                />
              </div>
            </div>

            <q-separator class="q-my-sm" />

            <!-- Rémunération -->
            <div class="row items-center q-mb-xs">
              <div class="text-subtitle2 text-grey-8">Rémunération</div>
              <q-space />
              <q-toggle
                v-model="hasIndemniteLogement"
                label="Indemnité de logement"
                dense
                left-label
                class="text-caption"
              />
            </div>
            <div class="row q-col-gutter-sm">
              <div class="col-12 col-md-4">
                <q-input
                  v-model.number="form.salaireBase"
                  label="Salaire de base *"
                  outlined
                  dense
                  type="number"
                  suffix="CFA"
                  :rules="[(v) => v >= 0 || 'Invalide']"
                />
              </div>
              <div v-if="hasIndemniteLogement" class="col-12 col-md-2">
                <q-input
                  :model-value="form.indemniteLogement"
                  :label="`Logement (${parametresPaie?.tauxIndemniteResidence ?? 15}%)`"
                  outlined
                  dense
                  type="number"
                  suffix="CFA"
                  readonly
                  bg-color="blue-1"
                />
              </div>
              <div :class="hasIndemniteLogement ? 'col-12 col-md-3' : 'col-12 col-md-4'">
                <q-input
                  v-model.number="form.indemniteTransport"
                  label="Indem. transport"
                  outlined
                  dense
                  type="number"
                  suffix="CFA"
                />
              </div>
              <div :class="hasIndemniteLogement ? 'col-12 col-md-3' : 'col-12 col-md-4'">
                <q-input
                  v-model.number="form.autresIndemnites"
                  label="Autres indemnités"
                  outlined
                  dense
                  type="number"
                  suffix="CFA"
                />
              </div>
            </div>

            <q-separator class="q-my-sm" />

            <div class="row q-col-gutter-sm items-center">
              <div class="col-auto">
                <q-toggle v-model="form.actif" label="Agent actif" />
              </div>
              <div class="col">
                <q-input v-model="form.observations" label="Observations" outlined dense />
              </div>
            </div>

            <div class="row justify-end q-gutter-sm q-mt-md">
              <q-btn label="Annuler" flat color="grey-7" v-close-popup />
              <q-btn label="Enregistrer" type="submit" color="primary" unelevated />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Dialog Rapport DISA (déclaration annuelle CNPS) -->
    <q-dialog v-model="showDisaDialog">
      <q-card class="dialog-card" style="width: min(560px, 96vw); max-width: 96vw">
        <q-card-section class="accent-left">
          <div class="text-h6">Rapport DISA</div>
          <div class="text-caption text-grey-7">
            Déclaration Individuelle des Salaires Annuels — CNPS
          </div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <div class="row q-col-gutter-sm">
            <div class="col-12 col-sm-4">
              <q-select
                v-model.number="disaAnnee"
                :options="disaAnneesOptions"
                label="Année *"
                outlined
                dense
                emit-value
                map-options
              />
            </div>
            <div class="col-12 col-sm-8">
              <q-input
                v-model="disaNumeroEmployeur"
                label="N° employeur CNPS *"
                outlined
                dense
                hint="Celui de la mairie, repris dans le nom du fichier"
                :rules="[(v: string) => !!v || 'Obligatoire']"
              />
            </div>
            <div class="col-12">
              <q-input v-model="disaRaisonSociale" label="Raison sociale" outlined dense />
            </div>
          </div>

          <q-toggle
            v-model="disaInclureBrouillons"
            label="Inclure les fiches de paie en brouillon"
            dense
            class="q-mt-sm"
          />

          <q-separator class="q-my-md" />

          <div class="text-body2 q-mb-xs">Format du fichier Excel</div>
          <q-option-group
            v-model="disaFormat"
            type="radio"
            dense
            :options="[
              { label: '.xls — format de dépôt CNPS', value: 'xls' },
              { label: '.xlsx — en-têtes et total en gris', value: 'xlsx' },
            ]"
          />
          <div class="text-caption text-grey-7 q-ml-sm">
            {{
              disaFormat === 'xls'
                ? 'Classeur binaire identique à celui de la CNPS. Ce format hérité ne transporte pas les couleurs.'
                : 'Mêmes données, avec la mise en couleur. À réserver à la lecture, pas au dépôt.'
            }}
          </div>

          <q-banner dense class="bg-grey-2 q-mt-md" v-if="disaRapport">
            <template v-slot:avatar>
              <q-icon name="summarize" color="teal-8" />
            </template>
            <div class="text-body2">
              <strong>{{ disaRapport.lignes.length }}</strong> agent(s) ·
              <strong>{{ disaRapport.nbFiches }}</strong> fiche(s) retenue(s)
            </div>
            <div class="text-caption text-grey-8">
              Total brut déclaré : {{ formatMontant(disaRapport.totaux.salaireBrut) }}
            </div>
          </q-banner>
          <q-banner dense class="bg-orange-1 q-mt-md" v-else-if="!disaLoading">
            <template v-slot:avatar>
              <q-icon name="warning" color="orange-8" />
            </template>
            Aucune fiche de paie sur cette année.
          </q-banner>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Fermer" color="grey-7" v-close-popup />
          <q-btn
            outline
            icon="picture_as_pdf"
            label="PDF"
            color="red-8"
            no-caps
            :disable="!disaPret"
            @click="exporterDisaEnPdf"
          />
          <q-btn
            unelevated
            icon="grid_on"
            :label="`Excel (.${disaFormat})`"
            color="green-8"
            no-caps
            :disable="!disaPret"
            @click="exporterDisaEnExcel"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useQuasar, date } from 'quasar';
import { db, type Employe, type ParametresPaie } from 'src/database/db';
import PageHeader from 'src/components/PageHeader.vue';
import DataTable from 'src/components/DataTable.vue';
import { MAIRIE_INFO } from 'src/constanteInfo';
import { openPrintWindow } from 'src/utils/printUrl';
import {
  construireDisa,
  exporterDisaExcel,
  nomFichierDisa,
  type DisaRapport,
  type FormatDisa,
} from 'src/utils/disa';

const $q = useQuasar();
const loading = ref(false);
const filter = ref('');
const showDialog = ref(false);
const showInactifs = ref(false);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const tablePagination = ref<any>({ page: 1, rowsPerPage: 10 });
const editingId = ref<number | null>(null);
const employes = ref<Employe[]>([]);
const parametresPaie = ref<ParametresPaie | null>(null);

const activeFiltersCount = computed(() => {
  return [filter.value, showInactifs.value ? 'inactifs' : ''].filter(
    (value) => value !== null && value !== '',
  ).length;
});

function resetFilters() {
  filter.value = '';
  showInactifs.value = false;
}

const statsCards = computed(() => {
  const total = employes.value.length;
  const actifs = employes.value.filter((e) => e.actif).length;
  const inactifs = total - actifs;
  const totalSalaires = employes.value.reduce((sum, e) => sum + (e.salaireBase || 0), 0);

  return [
    {
      value: total,
      label: 'Agents enregistrés',
      icon: 'people',
      color: 'primary',
      helper: `${actifs} actifs`,
    },
    {
      value: actifs,
      label: 'Agents actifs',
      icon: 'how_to_reg',
      color: 'positive',
      helper: total > 0 ? `${((actifs / total) * 100).toFixed(1)} % du total` : 'Aucun agent',
    },
    {
      value: inactifs,
      label: 'Agents inactifs',
      icon: 'person_off',
      color: 'grey',
      helper: showInactifs.value ? 'Visibles dans la liste' : 'Masqués par défaut',
    },
    {
      value: formatMontant(totalSalaires),
      label: 'Masse salariale',
      icon: 'payments',
      color: 'secondary',
      helper: 'Salaire de base cumulé',
    },
  ];
});

const servicesOptions = ref<string[]>([]);
const typeEmployeOptions = ['Salariés', 'Contractuels', "Agents de l'État", 'Maire et Adjoints'];

// Codes CNPS repris tels quels dans la colonne « TYPE SALARIE » du DISA.
const TYPE_SALARIE_CNPS_DEFAUT = 'M';
const REGIME_CNPS_DEFAUT = '123';
const typeSalarieCnpsOptions = [
  { label: 'M — Mensuel', value: 'M' },
  { label: 'J — Journalier', value: 'J' },
  { label: 'H — Horaire', value: 'H' },
];

const defaultForm = () => ({
  matricule: '',
  nom: '',
  prenom: '',
  sexe: '' as 'M' | 'F' | '',
  typeEmploye: '' as Employe['typeEmploye'] | '',
  dateNaissance: '',
  dateEmbauche: date.formatDate(new Date(), 'YYYY-MM-DD'),
  dateDepart: '',
  typeSalarieCnps: TYPE_SALARIE_CNPS_DEFAUT,
  regimeCnps: REGIME_CNPS_DEFAUT,
  poste: '',
  grade: '',
  categorie: '',
  service: '',
  salaireBase: 0,
  indemniteLogement: 0,
  indemniteTransport: 0,
  autresIndemnites: 0,
  numeroCNPS: '',
  rib: '',
  actif: true,
  observations: '',
});

const form = ref(defaultForm());
const hasIndemniteLogement = ref(false);

// Auto-calcul de l'indemnité de logement à partir du salaire de base
watch([() => form.value.salaireBase, hasIndemniteLogement], ([newBase, hasIndem]) => {
  if (hasIndem && parametresPaie.value) {
    form.value.indemniteLogement = Math.round(
      (newBase || 0) * (parametresPaie.value.tauxIndemniteResidence / 100),
    );
  } else if (!hasIndem) {
    form.value.indemniteLogement = 0;
  }
});

const columns = [
  {
    name: 'matricule',
    label: 'Matricule',
    field: 'matricule',
    align: 'left' as const,
    sortable: true,
  },
  {
    name: 'nom',
    label: 'Nom',
    field: (r: Employe) => `${r.nom} ${r.prenom}`,
    align: 'left' as const,
    sortable: true,
  },
  {
    name: 'typeEmploye',
    label: 'Type',
    field: 'typeEmploye',
    align: 'left' as const,
    sortable: true,
  },
  { name: 'poste', label: 'Poste', field: 'poste', align: 'left' as const, sortable: true },
  { name: 'service', label: 'Service', field: 'service', align: 'left' as const, sortable: true },
  {
    name: 'salaireBase',
    label: 'Salaire de base',
    field: 'salaireBase',
    align: 'right' as const,
    sortable: true,
  },
  {
    name: 'dateEmbauche',
    label: 'Embauche',
    field: 'dateEmbauche',
    align: 'left' as const,
    format: (v: Date) => (v ? date.formatDate(v, 'DD/MM/YYYY') : '-'),
    sortable: true,
  },
  { name: 'actif', label: 'Statut', field: 'actif', align: 'center' as const },
  { name: 'actions', label: 'Actions', field: 'id', align: 'center' as const },
];

const filteredEmployes = computed(() => {
  let result = employes.value;
  if (!showInactifs.value) result = result.filter((e) => e.actif);
  if (filter.value) {
    const s = filter.value.toLowerCase();
    result = result.filter(
      (e) =>
        e.matricule.toLowerCase().includes(s) ||
        e.nom.toLowerCase().includes(s) ||
        e.prenom.toLowerCase().includes(s) ||
        e.poste.toLowerCase().includes(s) ||
        e.service.toLowerCase().includes(s),
    );
  }
  return result;
});

// Report (cumul pages précédentes) et Total (cumul jusqu'à page courante)
const reportValues = computed(() => {
  const page = tablePagination.value.page;
  const perPage = tablePagination.value.rowsPerPage;
  if (page <= 1 || perPage <= 0) return { salaireBase: 0 };
  const rows = filteredEmployes.value.slice(0, (page - 1) * perPage);
  return {
    salaireBase: rows.reduce((s, e) => s + (e.salaireBase || 0), 0),
  };
});

const totalPageValues = computed(() => {
  const page = tablePagination.value.page;
  const perPage = tablePagination.value.rowsPerPage;
  const endIdx =
    perPage <= 0
      ? filteredEmployes.value.length
      : Math.min(page * perPage, filteredEmployes.value.length);
  const rows = filteredEmployes.value.slice(0, endIdx);
  return {
    salaireBase: rows.reduce((s, e) => s + (e.salaireBase || 0), 0),
  };
});

function formatMontant(montant: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    minimumFractionDigits: 0,
  }).format(montant);
}

async function loadData() {
  loading.value = true;
  try {
    const [loadedEmployes, loadedParams, svcs] = await Promise.all([
      db.employes.toArray(),
      db.parametresPaie.toCollection().first(),
      db.servicesApp7.toArray(),
    ]);
    employes.value = loadedEmployes;
    parametresPaie.value = loadedParams ?? null;
    servicesOptions.value = svcs.map((s) => s.nom);
  } finally {
    loading.value = false;
  }
}

function openAdd() {
  editingId.value = null;
  form.value = defaultForm();
  hasIndemniteLogement.value = false;
  showDialog.value = true;
}

function editEmploye(row: Employe) {
  editingId.value = row.id!;
  hasIndemniteLogement.value = (row.indemniteLogement || 0) > 0;
  form.value = {
    matricule: row.matricule,
    nom: row.nom,
    prenom: row.prenom,
    sexe: row.sexe || '',
    typeEmploye: row.typeEmploye,
    dateNaissance: row.dateNaissance ? date.formatDate(row.dateNaissance, 'YYYY-MM-DD') : '',
    dateEmbauche: row.dateEmbauche ? date.formatDate(row.dateEmbauche, 'YYYY-MM-DD') : '',
    dateDepart: row.dateDepart ? date.formatDate(row.dateDepart, 'YYYY-MM-DD') : '',
    typeSalarieCnps: row.typeSalarieCnps || TYPE_SALARIE_CNPS_DEFAUT,
    regimeCnps: row.regimeCnps || REGIME_CNPS_DEFAUT,
    poste: row.poste,
    grade: row.grade || '',
    categorie: row.categorie || '',
    service: row.service,
    salaireBase: row.salaireBase,
    indemniteLogement: row.indemniteLogement || 0,
    indemniteTransport: row.indemniteTransport || 0,
    autresIndemnites: row.autresIndemnites || 0,
    numeroCNPS: row.numeroCNPS || '',
    rib: row.rib || '',
    actif: row.actif,
    observations: row.observations || '',
  };
  showDialog.value = true;
}

async function saveEmploye() {
  const now = new Date();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data: any = {
    matricule: form.value.matricule,
    nom: form.value.nom,
    prenom: form.value.prenom,
    ...(form.value.sexe ? { sexe: form.value.sexe } : {}),
    typeEmploye: form.value.typeEmploye,
    ...(form.value.dateNaissance ? { dateNaissance: new Date(form.value.dateNaissance) } : {}),
    ...(form.value.dateEmbauche ? { dateEmbauche: new Date(form.value.dateEmbauche) } : {}),
    // `dateDepart` doit pouvoir être effacée : on l'écrit toujours, à null si vide,
    // sinon un agent réintégré garderait sa date de sortie.
    dateDepart: form.value.dateDepart ? new Date(form.value.dateDepart) : null,
    typeSalarieCnps: form.value.typeSalarieCnps || undefined,
    regimeCnps: form.value.regimeCnps || undefined,
    poste: form.value.poste,
    grade: form.value.grade || undefined,
    categorie: form.value.categorie || undefined,
    service: form.value.service,
    salaireBase: form.value.salaireBase,
    indemniteLogement: form.value.indemniteLogement,
    indemniteTransport: form.value.indemniteTransport,
    autresIndemnites: form.value.autresIndemnites,
    numeroCNPS: form.value.numeroCNPS || undefined,
    rib: form.value.rib || undefined,
    actif: form.value.actif,
    observations: form.value.observations || undefined,
    mairieId: 1,
    createdAt: now,
    updatedAt: now,
  };

  try {
    if (editingId.value) {
      await db.employes.update(editingId.value, { ...data, updatedAt: now });
      $q.notify({ type: 'positive', message: 'Agent modifié avec succès' });
    } else {
      // Vérifier que le matricule n'existe pas déjà
      const existing = await db.employes.where('matricule').equals(data.matricule).first();
      if (existing) {
        $q.notify({ type: 'negative', message: 'Ce matricule existe déjà' });
        return;
      }
      await db.employes.add(data as Omit<Employe, 'id'>);
      $q.notify({ type: 'positive', message: 'Agent ajouté avec succès' });
    }
    showDialog.value = false;
    await loadData();
  } catch {
    $q.notify({ type: 'negative', message: "Erreur lors de l'enregistrement" });
  }
}

// ─── Rapport DISA ────────────────────────────────────────────────────────────

const showDisaDialog = ref(false);
const disaLoading = ref(false);
const disaAnnee = ref(new Date().getFullYear());
const disaNumeroEmployeur = ref('');
const disaRaisonSociale = ref('');
const disaInclureBrouillons = ref(false);
const disaFormat = ref<FormatDisa>('xls');
const disaRapport = ref<DisaRapport | null>(null);
const disaAnneesDisponibles = ref<number[]>([]);

const disaAnneesOptions = computed(() => {
  const courante = new Date().getFullYear();
  const annees = new Set([...disaAnneesDisponibles.value, courante, disaAnnee.value]);
  return [...annees].sort((a, b) => b - a).map((a) => ({ label: String(a), value: a }));
});

const disaPret = computed(
  () =>
    !!disaRapport.value &&
    disaRapport.value.lignes.length > 0 &&
    !!disaNumeroEmployeur.value.trim(),
);

async function openDisaDialog() {
  disaNumeroEmployeur.value = MAIRIE_INFO.numeroEmployeurCNPS || '';
  disaRaisonSociale.value = (MAIRIE_INFO.nom || '').toUpperCase();

  const fiches = await db.fichesPaie.toArray();
  disaAnneesDisponibles.value = [...new Set(fiches.map((f) => f.annee).filter(Boolean))];
  // La DISA se dépose sur l'exercice écoulé : on propose la dernière année saisie.
  const derniere = disaAnneesDisponibles.value.sort((a, b) => b - a)[0];
  if (derniere) disaAnnee.value = derniere;

  showDisaDialog.value = true;
  await rafraichirDisa();
}

async function rafraichirDisa() {
  disaLoading.value = true;
  try {
    const rapport = await construireDisa({
      annee: disaAnnee.value,
      numeroEmployeur: disaNumeroEmployeur.value.trim(),
      raisonSociale: disaRaisonSociale.value,
      inclureBrouillons: disaInclureBrouillons.value,
    });
    disaRapport.value = rapport.lignes.length > 0 ? rapport : null;
  } finally {
    disaLoading.value = false;
  }
}

watch([disaAnnee, disaInclureBrouillons], () => {
  if (showDisaDialog.value) void rafraichirDisa();
});

/** Recompose le rapport avec les en-têtes saisis avant tout export. */
function rapportAJour(): DisaRapport | null {
  if (!disaRapport.value) return null;
  return {
    ...disaRapport.value,
    numeroEmployeur: disaNumeroEmployeur.value.trim(),
    raisonSociale: disaRaisonSociale.value,
  };
}

function exporterDisaEnExcel() {
  const rapport = rapportAJour();
  if (!rapport) return;
  exporterDisaExcel(rapport, disaFormat.value);
  $q.notify({
    type: 'positive',
    message: `Fichier ${nomFichierDisa(rapport, disaFormat.value)} généré`,
  });
}

function exporterDisaEnPdf() {
  const rapport = rapportAJour();
  if (!rapport) return;
  // La page recalcule elle-même depuis IndexedDB : elle reste ouvrable seule,
  // par simple URL, comme les autres imprimés du dossier employe/.
  openPrintWindow('employe/disa.html', {
    annee: rapport.annee,
    numeroEmployeur: rapport.numeroEmployeur,
    raisonSociale: rapport.raisonSociale,
    brouillons: disaInclureBrouillons.value ? 1 : 0,
  });
}

function deleteEmploye(row: Employe) {
  $q.dialog({
    title: 'Confirmation',
    message: `Supprimer l'agent "${row.nom} ${row.prenom}" ?`,
    cancel: true,
    persistent: true,
  }).onOk(() => {
    void (async () => {
      await db.employes.delete(row.id);
      $q.notify({ type: 'positive', message: 'Agent supprimé' });
      await loadData();
    })();
  });
}

onMounted(() => {
  void loadData();
});
</script>

<style scoped lang="scss">
// Page principale
.dashboard-page {
  max-width: 1400px;
  margin: 0 auto;
}

.main-card {
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  animation: fadeIn 0.6s ease-out both;
  animation-delay: 0.4s;
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

:deep(.q-dialog .q-card) {
  border-radius: 22px;
  box-shadow: 0 24px 56px rgba(15, 23, 42, 0.18);
}

// Report & Total rows
:deep(.report-row) {
  background: #fef3c7 !important;
  td {
    font-style: italic;
    font-weight: 600;
  }
}
:deep(.total-row) {
  background: #dbeafe !important;
  td {
    font-weight: 700;
  }
}

// Animations
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
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
