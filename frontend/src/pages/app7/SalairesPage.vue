<template>
  <q-page class="dashboard-page q-pa-md">
    <PageHeader
      title="Gestion des Salaires"
      subtitle="Bulletins de paie mensuels"
      icon="payments"
    />

    <q-card class="main-card q-mb-md">
      <q-card-section>
        <div class="compact-toolbar q-mb-md">
          <div class="compact-toolbar-top row items-center q-col-gutter-sm">
            <div class="col-12 col-md-4">
              <q-input
                v-model="filterSearch"
                label="Rechercher un agent"
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
                          v-model="filterMois"
                          :options="moisOptions"
                          label="Mois"
                          outlined
                          dense
                          emit-value
                          map-options
                          clearable
                        />
                      </div>
                      <div class="col-12 col-sm-6 col-md-4">
                        <q-input
                          v-model.number="filterAnnee"
                          label="Année"
                          outlined
                          dense
                          type="number"
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
                icon="bolt"
                label="Générer"
                color="primary"
                unelevated
                no-caps
                @click="openGenerateDialog"
              />
              <q-btn icon="add" label="Nouveau" color="teal" unelevated no-caps @click="openAdd" />
              <q-btn
                icon="print"
                label="Imprimer"
                color="deep-purple"
                unelevated
                no-caps
                @click="showPrintDialog = true"
              />
            </div>
          </div>
        </div>

        <!-- Résumé du mois -->
        <div class="listing-stats-row row q-col-gutter-md q-mb-md">
          <div class="col-12 col-sm-6 col-lg-3" v-for="(stat, index) in statsCards" :key="index">
            <q-card flat class="listing-stat-card overview-stat-card">
              <q-card-section class="row items-center no-wrap">
                <div class="col">
                  <div class="overview-stat-label">{{ stat.label }}</div>
                  <div class="overview-stat-value">{{ stat.value }}</div>
                  <div class="overview-stat-helper">{{ stat.helper }}</div>
                </div>
                <q-icon :name="stat.icon" size="30px" :color="stat.color" />
              </q-card-section>
            </q-card>
          </div>
        </div>

        <DataTable
          :rows="filteredFiches"
          :columns="columns"
          :loading="loading"
          :show-actions="false"
          :pagination="tablePagination"
          @update:pagination="(v: any) => (tablePagination = v)"
          show-export-csv
          export-filename="fiches-paie"
        >
          <template v-slot:body-cell-employe="props">
            <q-td :props="props">{{ getEmployeNom(props.row.employeId) }}</q-td>
          </template>
          <template v-slot:body-cell-typeAgent="props">
            <q-td :props="props">{{ getEmployeType(props.row.employeId) }}</q-td>
          </template>
          <template v-slot:body-cell-statut="props">
            <q-td :props="props">
              <q-chip :color="getStatutColor(props.row.statut)" text-color="white" size="sm" dense>
                {{ getStatutLabel(props.row.statut) }}
              </q-chip>
            </q-td>
          </template>
          <template v-slot:body-cell-actions="props">
            <q-td :props="props" class="text-center">
              <q-btn
                v-if="props.row.statut !== 'brouillon'"
                flat
                round
                dense
                icon="print"
                color="grey-7"
                @click="printBulletin(props.row)"
              >
                <q-tooltip>Imprimer bulletin</q-tooltip>
              </q-btn>
              <q-btn flat round dense icon="edit" color="grey-7" @click="editFiche(props.row)">
                <q-tooltip>Modifier</q-tooltip>
              </q-btn>
              <q-btn
                flat
                round
                dense
                icon="delete"
                color="negative"
                @click="deleteFiche(props.row)"
              >
                <q-tooltip>Supprimer</q-tooltip>
              </q-btn>
            </q-td>
          </template>
          <!-- Report row (page 2+) -->
          <template v-slot:top-row>
            <q-tr v-if="tablePagination.page > 1" class="report-row">
              <q-td class="text-weight-bold text-italic">REPORT</q-td>
              <q-td></q-td>
              <q-td></q-td>
              <q-td></q-td>
              <q-td class="text-right text-weight-bold text-italic">{{
                formatMontant(reportValues.montantBrut)
              }}</q-td>
              <q-td class="text-right text-weight-bold text-italic">{{
                formatMontant(reportValues.montantNet)
              }}</q-td>
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
              <q-td class="text-right text-weight-bold">{{
                formatMontant(totalPageValues.montantBrut)
              }}</q-td>
              <q-td class="text-right text-weight-bold">{{
                formatMontant(totalPageValues.montantNet)
              }}</q-td>
              <q-td></q-td>
              <q-td></q-td>
            </q-tr>
          </template>
        </DataTable>
      </q-card-section>
    </q-card>

    <!-- Dialog Impression Documents Officiels -->
    <q-dialog v-model="showPrintDialog" persistent>
      <q-card class="dialog-card" style="width: min(460px, 96vw); max-width: 96vw">
        <q-card-section class="row items-center q-pb-none">
          <q-icon name="print" color="deep-purple" size="sm" class="q-mr-sm" />
          <div class="text-h6">Imprimer un document officiel</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>
        <q-card-section class="q-gutter-sm">
          <div class="row q-col-gutter-sm">
            <div class="col-12 col-sm-6">
              <q-select
                v-model="printMois"
                :options="moisOptions"
                label="Mois"
                outlined
                dense
                emit-value
                map-options
              />
            </div>
            <div class="col-12 col-sm-6">
              <q-input v-model.number="printAnnee" label="Année" outlined dense type="number" />
            </div>
          </div>
          <div class="row q-col-gutter-sm q-mt-xs">
            <div class="col-12 col-sm-6">
              <q-select
                v-model="printService"
                :options="servicesOptions"
                label="Service (Optionnel)"
                outlined
                dense
                clearable
                emit-value
                map-options
              />
            </div>
            <div class="col-12 col-sm-6">
              <q-select
                v-model="printTypeEmploye"
                :options="typeEmployeOptions"
                label="Type d'employé (Optionnel)"
                outlined
                dense
                clearable
              />
            </div>
          </div>
          <div class="text-subtitle2 text-grey-8 q-mt-sm">Document officiel</div>
          <q-list bordered separator class="rounded-borders">
            <q-item
              v-for="doc in officialDocs"
              :key="doc.file"
              clickable
              v-ripple
              @click="launchOfficialDoc(doc.file)"
              class="q-py-sm"
            >
              <q-item-section avatar>
                <q-icon :name="doc.icon" color="orange" />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ doc.label }}</q-item-label>
                <q-item-label caption>{{ doc.caption }}</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-icon name="open_in_new" color="grey" size="xs" />
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn label="Fermer" flat color="grey-7" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Dialog Ajout/Modification bulletin -->
    <q-dialog v-model="showDialog" persistent>
      <q-card class="dialog-card" style="width: min(700px, 96vw); max-width: 96vw">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">{{ editingId ? 'Modifier' : 'Nouveau' }} bulletin de paie</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>
        <q-card-section>
          <q-form @submit="saveFiche" class="q-gutter-sm">
            <div class="row q-col-gutter-sm">
              <div class="col-12 col-md-6">
                <q-select
                  v-model="form.employeId"
                  :options="employeOptions"
                  label="Agent *"
                  outlined
                  dense
                  emit-value
                  map-options
                  use-input
                  input-debounce="0"
                  @filter="filterEmployeOptions"
                  :rules="[(v) => !!v || 'Obligatoire']"
                  @update:model-value="onEmployeSelected"
                />
              </div>
              <div class="col-12 col-md-3">
                <q-select
                  v-model="form.mois"
                  :options="moisOptions"
                  label="Mois *"
                  outlined
                  dense
                  emit-value
                  map-options
                />
              </div>
              <div class="col-12 col-md-3">
                <q-input v-model.number="form.annee" label="Année *" outlined dense type="number" />
              </div>
            </div>
            <q-separator class="q-my-sm" />
            <div class="text-subtitle2 text-grey-8">Éléments de rémunération</div>
            <div class="row q-col-gutter-sm">
              <div class="col-12 col-md-3">
                <q-input
                  v-model.number="form.salaireBase"
                  label="Salaire de base"
                  outlined
                  dense
                  type="number"
                  suffix="CFA"
                  @update:model-value="recalculate"
                />
              </div>
              <div class="col-12 col-md-3">
                <q-input
                  v-model.number="form.indemniteLogement"
                  label="Indem. logement"
                  outlined
                  dense
                  type="number"
                  suffix="CFA"
                  @update:model-value="recalculate"
                />
              </div>
              <div class="col-12 col-md-3">
                <q-input
                  v-model.number="form.indemniteTransport"
                  label="Indem. transport"
                  outlined
                  dense
                  type="number"
                  suffix="CFA"
                  @update:model-value="recalculate"
                />
              </div>
              <div class="col-12 col-md-3">
                <q-input
                  v-model.number="form.autresIndemnites"
                  label="Autres indemnités"
                  outlined
                  dense
                  type="number"
                  suffix="CFA"
                  @update:model-value="recalculate"
                />
              </div>
            </div>
            <q-separator class="q-my-sm" />
            <div class="text-subtitle2 text-grey-8">Retenues</div>
            <div class="row q-col-gutter-sm">
              <div class="col-12 col-md-4">
                <q-input
                  v-model.number="form.cotisationCNPS"
                  label="Cotisation CNPS"
                  outlined
                  dense
                  type="number"
                  suffix="CFA"
                  @update:model-value="recalculate"
                />
              </div>
              <div class="col-12 col-md-4">
                <q-input
                  v-model.number="form.impotSurSalaire"
                  label="Impôt sur salaire"
                  outlined
                  dense
                  type="number"
                  suffix="CFA"
                  @update:model-value="recalculate"
                />
              </div>
              <div class="col-12 col-md-4">
                <q-input
                  v-model.number="form.autresRetenues"
                  label="Autres retenues"
                  outlined
                  dense
                  type="number"
                  suffix="CFA"
                  @update:model-value="recalculate"
                />
              </div>
            </div>
            <q-separator class="q-my-sm" />
            <div class="row q-col-gutter-sm items-center">
              <div class="col-12 col-md-4">
                <q-banner class="bg-blue-1 rounded-borders">
                  <div class="text-caption">Montant brut</div>
                  <div class="text-h6 text-blue">{{ formatMontant(form.montantBrut) }}</div>
                </q-banner>
              </div>
              <div class="col-12 col-md-4">
                <q-banner class="bg-orange-1 rounded-borders">
                  <div class="text-caption">Total retenues</div>
                  <div class="text-h6 text-orange">
                    {{
                      formatMontant(
                        form.cotisationCNPS + form.impotSurSalaire + form.autresRetenues,
                      )
                    }}
                  </div>
                </q-banner>
              </div>
              <div class="col-12 col-md-4">
                <q-banner class="bg-green-1 rounded-borders">
                  <div class="text-caption">Net à payer</div>
                  <div class="text-h6 text-positive">{{ formatMontant(form.montantNet) }}</div>
                </q-banner>
              </div>
            </div>
            <div class="row q-col-gutter-sm q-mt-sm">
              <div class="col-12 col-md-6">
                <q-select
                  v-model="form.statut"
                  :options="statutOptions"
                  label="Statut"
                  outlined
                  dense
                  emit-value
                  map-options
                />
              </div>
            </div>
            <q-input
              v-model="form.observations"
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

    <!-- Dialog génération en masse -->
    <q-dialog v-model="showGenerateDialog" persistent>
      <q-card class="dialog-card" style="width: min(500px, 96vw); max-width: 96vw">
        <q-card-section class="row items-center q-pb-none">
          <q-icon name="bolt" color="primary" size="sm" class="q-mr-sm" />
          <div class="text-h6">Générer les bulletins du mois</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>
        <q-card-section>
          <p class="text-body2 text-grey-7">
            Génère un bulletin de paie pour chaque agent actif correspondant aux critères
            ci-dessous, en reprenant les éléments de rémunération de leur fiche.
          </p>
          <div class="row q-col-gutter-sm">
            <div class="col-6">
              <q-select
                v-model="genMois"
                :options="moisOptions"
                label="Mois"
                outlined
                dense
                emit-value
                map-options
              />
            </div>
            <div class="col-6">
              <q-input v-model.number="genAnnee" label="Année" outlined dense type="number" />
            </div>
          </div>
          <div class="text-subtitle2 text-grey-8 q-mt-md q-mb-xs">
            Filtrer les agents (optionnel)
          </div>
          <div class="row q-col-gutter-sm">
            <div class="col-12 col-sm-6">
              <q-select
                v-model="genService"
                :options="[{ label: 'Tous les services', value: null }, ...servicesOptions]"
                label="Service"
                outlined
                dense
                emit-value
                map-options
              />
            </div>
            <div class="col-12 col-sm-6">
              <q-select
                v-model="genTypeEmploye"
                :options="[
                  { label: 'Tous les types', value: null },
                  ...typeEmployeOptions.map((t) => ({ label: t, value: t })),
                ]"
                label="Type de salarié"
                outlined
                dense
                emit-value
                map-options
              />
            </div>
          </div>
          <div class="q-mt-sm text-caption text-grey-6">
            <q-icon name="info" size="xs" class="q-mr-xs" />
            {{ genCountLabel }}
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn label="Annuler" flat color="grey-7" v-close-popup />
          <q-btn
            label="Générer"
            color="primary"
            unelevated
            icon="bolt"
            @click="generateBulletins"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useQuasar } from 'quasar';
import {
  db,
  type FichePaie,
  type Employe,
  type Exercice,
  type ParametresPaie,
  type ServiceApp7,
} from 'src/database/db';
import PageHeader from 'src/components/PageHeader.vue';
import DataTable from 'src/components/DataTable.vue';
import { openPrintWindow } from 'src/utils/printUrl';

const $q = useQuasar();
const loading = ref(false);
const showDialog = ref(false);
const showGenerateDialog = ref(false);
const showPrintDialog = ref(false);
const editingId = ref<number | null>(null);
const fiches = ref<FichePaie[]>([]);
const employes = ref<Employe[]>([]);
const exercices = ref<Exercice[]>([]);
const lockedYears = computed(() =>
  exercices.value.filter((e) => e.statut === 'verrouille').map((e) => e.annee),
);
const parametresPaie = ref<ParametresPaie | null>(null);

const now = new Date();
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const tablePagination = ref<any>({ page: 1, rowsPerPage: 10 });
const filterMois = ref<number | null>(null);
const filterAnnee = ref(now.getFullYear());
const filterStatut = ref<string | null>(null);
const filterSearch = ref('');

const activeFiltersCount = computed(() => {
  return [
    filterMois.value !== null ? String(filterMois.value) : '',
    filterAnnee.value ? String(filterAnnee.value) : '',
    filterStatut.value,
    filterSearch.value,
  ].filter((value) => value !== null && value !== '').length;
});

function resetFilters() {
  filterMois.value = null;
  filterAnnee.value = now.getFullYear();
  filterStatut.value = null;
  filterSearch.value = '';
}

const genMois = ref(now.getMonth() + 1);
const genAnnee = ref(now.getFullYear());
const genService = ref<string | null>(null);
const genTypeEmploye = ref<string | null>(null);
const printMois = ref(now.getMonth() + 1);
const printAnnee = ref(now.getFullYear());
const printService = ref<string | null>(null);
const printTypeEmploye = ref<string | null>(null);

const servicesList = ref<ServiceApp7[]>([]);
const servicesOptions = ref<{ label: string; value: string }[]>([]);
const typeEmployeOptions = ['Salariés', 'Contractuels', "Agents de l'État", 'Maire et Adjoints'];

const officialDocs = [
  {
    file: 'employe/etat-solde.html',
    label: 'État de solde',
    caption: 'Détail des rémunérations',
    icon: 'list_alt',
  },
  {
    file: 'employe/etat-impot.html',
    label: 'État ITS',
    caption: 'Impôt sur traitements et salaires',
    icon: 'account_balance',
  },
  {
    file: 'employe/etats-cnps.html',
    label: 'États CNPS',
    caption: 'Part salariale CNPS',
    icon: 'health_and_safety',
  },
  {
    file: 'employe/etat-decompte.html',
    label: 'Décompte part patronale',
    caption: 'Cotisations patronales CNPS',
    icon: 'corporate_fare',
  },
];

function launchOfficialDoc(file: string) {
  const svc = printService.value
    ? servicesList.value.find((s) => s.nom === printService.value)
    : null;
  openPrintWindow(file, {
    mois: printMois.value,
    annee: printAnnee.value,
    service: printService.value || '',
    typeEmploye: printTypeEmploye.value || '',
    compte: svc?.compte || '',
    chapitre: svc?.chapitre || '',
  });
  showPrintDialog.value = false;
}

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
  { label: 'Validé', value: 'valide' },
];

const defaultForm = () => ({
  employeId: null as number | null,
  mois: now.getMonth() + 1,
  annee: now.getFullYear(),
  exercice: now.getFullYear(),
  salaireBase: 0,
  indemniteLogement: 0,
  indemniteTransport: 0,
  autresIndemnites: 0,
  montantBrut: 0,
  cotisationCNPS: 0,
  impotSurSalaire: 0,
  autresRetenues: 0,
  montantNet: 0,
  statut: 'valide' as 'brouillon' | 'valide' | 'paye',
  observations: '',
});

const form = ref(defaultForm());
const filteredEmployeOptions = ref<{ label: string; value: number }[]>([]);

const employeOptions = computed(() =>
  employes.value
    .filter((e) => e.actif)
    .map((e) => ({ label: `${e.matricule} – ${e.nom} ${e.prenom}`, value: e.id! })),
);

watch(employeOptions, (opts) => {
  filteredEmployeOptions.value = opts;
});

function filterEmployeOptions(val: string, update: (cb: () => void) => void) {
  update(() => {
    const needle = val.toLowerCase();
    filteredEmployeOptions.value = val
      ? employeOptions.value.filter((o) => o.label.toLowerCase().includes(needle))
      : employeOptions.value;
  });
}

function onEmployeSelected(id: number) {
  const emp = employes.value.find((e) => e.id === id);
  if (!emp) return;
  form.value.salaireBase = emp.salaireBase;
  form.value.indemniteLogement = emp.indemniteLogement || 0;
  form.value.indemniteTransport = emp.indemniteTransport || 0;
  form.value.autresIndemnites = emp.autresIndemnites || 0;
  recalculate();
}

// Seuls les Salariés sont imposables (CNPS + ITS)
function isExemptFromTax(typeEmploye: string | undefined): boolean {
  if (!typeEmploye) return false;
  return (
    typeEmploye.startsWith('Contractuels') ||
    typeEmploye.startsWith("Agents de l'État") ||
    typeEmploye.startsWith('Maire et Adjoints')
  );
}

function recalculate() {
  const emp = employes.value.find((e) => e.id === form.value.employeId);
  const exempt = isExemptFromTax(emp?.typeEmploye);

  if (exempt) {
    // Non-salariés : brut = base + logement, pas de taxes, net = brut + primes
    const base = form.value.salaireBase || 0;
    const log = form.value.indemniteLogement || 0;
    const transport = form.value.indemniteTransport || 0;
    const autres = form.value.autresIndemnites || 0;
    const brut = base + log;
    form.value.montantBrut = brut;
    form.value.cotisationCNPS = 0;
    form.value.impotSurSalaire = 0;
    form.value.autresRetenues = 0;
    form.value.montantNet = brut + transport + autres;
  } else {
    // Salariés : brut = base + logement, taxes sur le brut, net = brut - taxes + primes
    const base = form.value.salaireBase || 0;
    const log = form.value.indemniteLogement || 0;
    const transport = form.value.indemniteTransport || 0;
    const autres = form.value.autresIndemnites || 0;
    const brut = base + log;
    form.value.montantBrut = brut;

    if (parametresPaie.value) {
      form.value.cotisationCNPS = Math.round(brut * (parametresPaie.value.tauxCnpsEmploye / 100));
      form.value.impotSurSalaire = Math.round(brut * (parametresPaie.value.tauxIts / 100));
    }

    form.value.montantNet =
      brut -
      (form.value.cotisationCNPS || 0) -
      (form.value.impotSurSalaire || 0) -
      (form.value.autresRetenues || 0) +
      transport +
      autres;
  }
}

const filteredFiches = computed(() => {
  let r = fiches.value.filter((f) => {
    if (lockedYears.value.includes(f.annee)) return false;
    if (filterMois.value && f.mois !== filterMois.value) return false;
    if (f.annee !== filterAnnee.value) return false;
    return true;
  });
  if (filterStatut.value) r = r.filter((f) => f.statut === filterStatut.value);
  if (filterSearch.value) {
    const needle = filterSearch.value.toLowerCase();
    r = r.filter((f) => {
      const emp = employes.value.find((e) => e.id === f.employeId);
      if (!emp) return false;
      const nom = `${emp.nom} ${emp.prenom} ${emp.matricule}`.toLowerCase();
      const type = (emp.typeEmploye || '').toLowerCase();
      return nom.includes(needle) || type.includes(needle);
    });
  }
  return r;
});

function toNumber(v: unknown): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

const totalBrut = computed(() =>
  filteredFiches.value.reduce((s, f) => s + toNumber(f.montantBrut), 0),
);
const totalNet = computed(() =>
  filteredFiches.value.reduce((s, f) => s + toNumber(f.montantNet), 0),
);

// Report (cumul pages précédentes) et Total (cumul jusqu'à page courante)
const reportValues = computed(() => {
  const page = tablePagination.value.page;
  const perPage = tablePagination.value.rowsPerPage;
  if (page <= 1 || perPage <= 0) return { montantBrut: 0, montantNet: 0 };
  const rows = filteredFiches.value.slice(0, (page - 1) * perPage);
  return {
    montantBrut: rows.reduce((s, f) => s + toNumber(f.montantBrut), 0),
    montantNet: rows.reduce((s, f) => s + toNumber(f.montantNet), 0),
  };
});

const totalPageValues = computed(() => {
  const page = tablePagination.value.page;
  const perPage = tablePagination.value.rowsPerPage;
  const endIdx =
    perPage <= 0
      ? filteredFiches.value.length
      : Math.min(page * perPage, filteredFiches.value.length);
  const rows = filteredFiches.value.slice(0, endIdx);
  return {
    montantBrut: rows.reduce((s, f) => s + toNumber(f.montantBrut), 0),
    montantNet: rows.reduce((s, f) => s + toNumber(f.montantNet), 0),
  };
});

// Cartes de statistiques avec animations
const statsCards = computed(() => {
  const total = filteredFiches.value.length;
  const valides = filteredFiches.value.filter(
    (f) => f.statut === 'valide' || f.statut === 'paye',
  ).length;

  return [
    {
      value: total,
      label: 'Bulletins visibles',
      helper: 'Résultat des filtres en cours',
      icon: 'receipt_long',
      color: 'primary',
      progress: total > 0 ? 1 : 0,
    },
    {
      value: valides,
      label: 'Bulletins validés',
      helper:
        total > 0
          ? `${Math.round((valides / total) * 100)}% validés / payés`
          : 'Aucun bulletin validé',
      icon: 'check_circle',
      color: 'positive',
      progress: total > 0 ? valides / total : 0,
    },
    {
      value: formatMontant(totalBrut.value),
      label: 'Montant brut',
      helper: 'Total brut cumulé',
      icon: 'account_balance',
      color: 'blue',
      progress: 0.8,
    },
    {
      value: formatMontant(totalNet.value),
      label: 'Net à payer',
      helper: 'Montant net cumulé',
      icon: 'payments',
      color: 'teal',
      progress: 0.9,
    },
  ];
});

function getEmployeNom(id: number): string {
  const e = employes.value.find((x) => x.id === id);
  return e ? `${e.nom} ${e.prenom}` : '-';
}

function getEmployeType(id: number): string {
  const e = employes.value.find((x) => x.id === id);
  return e?.typeEmploye || '-';
}

function getStatutColor(s: string): string {
  return s === 'paye' ? 'positive' : s === 'valide' ? 'blue' : 'grey';
}

function getStatutLabel(s: string): string {
  return s === 'paye' ? 'Payé' : s === 'valide' ? 'Validé' : 'Brouillon';
}

function formatMontant(v: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    minimumFractionDigits: 0,
  }).format(v);
}

const columns = [
  { name: 'employe', label: 'Agent', field: 'employeId', align: 'left' as const, sortable: true },
  {
    name: 'typeAgent',
    label: "Type d'agent",
    field: 'employeId',
    align: 'left' as const,
    sortable: true,
  },
  {
    name: 'mois',
    label: 'Mois',
    field: 'mois',
    align: 'center' as const,
    format: (v: number) => moisOptions[v - 1]?.label ?? '',
  },
  { name: 'annee', label: 'Année', field: 'annee', align: 'center' as const },
  {
    name: 'montantBrut',
    label: 'Brut',
    field: 'montantBrut',
    align: 'right' as const,
    format: formatMontant,
  },
  {
    name: 'montantNet',
    label: 'Net',
    field: 'montantNet',
    align: 'right' as const,
    format: formatMontant,
  },
  { name: 'statut', label: 'Statut', field: 'statut', align: 'center' as const },
  { name: 'actions', label: 'Actions', field: 'id', align: 'center' as const },
];

async function loadData() {
  loading.value = true;
  try {
    const [loadedFiches, loadedEmployes, loadedParams, svcs, loadedExercices] = await Promise.all([
      db.fichesPaie.toArray(),
      db.employes.toArray(),
      db.parametresPaie.toCollection().first(),
      db.servicesApp7.toArray(),
      db.exercices.toArray(),
    ]);
    fiches.value = loadedFiches;
    employes.value = loadedEmployes;
    parametresPaie.value = loadedParams ?? null;
    exercices.value = loadedExercices;
    filteredEmployeOptions.value = employeOptions.value;
    servicesList.value = svcs;
    servicesOptions.value = svcs.map((s) => ({
      label: s.compte ? `(${s.compte}) ${s.nom}` : s.nom,
      value: s.nom,
    }));
  } finally {
    loading.value = false;
  }
}

function openAdd() {
  editingId.value = null;
  form.value = defaultForm();
  showDialog.value = true;
}

const genCandidates = computed(() => {
  let list = employes.value.filter((e) => e.actif);
  if (genService.value) list = list.filter((e) => e.service === genService.value);
  if (genTypeEmploye.value) list = list.filter((e) => e.typeEmploye === genTypeEmploye.value);
  return list;
});

const genCountLabel = computed(() => {
  const n = genCandidates.value.length;
  return n === 0
    ? 'Aucun agent ne correspond aux critères sélectionnés.'
    : `${n} agent${n > 1 ? 's' : ''} seront traité${n > 1 ? 's' : ''}.`;
});

function openGenerateDialog() {
  genService.value = null;
  genTypeEmploye.value = null;
  showGenerateDialog.value = true;
}

async function generateBulletins() {
  const candidates = genCandidates.value;
  const existingFiches = await db.fichesPaie
    .filter((f) => f.mois === genMois.value && f.annee === genAnnee.value)
    .toArray();
  const existingIds = new Set(existingFiches.map((f) => f.employeId));

  const newFiches = candidates
    .filter((e) => !existingIds.has(e.id!))
    .map((e) => {
      const exempt = isExemptFromTax(e.typeEmploye);

      let brut: number;
      let calcCnps = 0;
      let calcIts = 0;
      let netPay: number;

      if (exempt) {
        // Non-salariés : brut = base + logement, pas de taxes, net = brut + primes
        brut = e.salaireBase + (e.indemniteLogement || 0);
        netPay = brut + (e.indemniteTransport || 0) + (e.autresIndemnites || 0);
      } else {
        // Salariés : brut = base + logement, taxes sur le brut, net = brut - taxes + primes
        brut = e.salaireBase + (e.indemniteLogement || 0);

        if (parametresPaie.value) {
          calcCnps = Math.round(brut * (parametresPaie.value.tauxCnpsEmploye / 100));
          calcIts = Math.round(brut * (parametresPaie.value.tauxIts / 100));
        }
        netPay =
          brut - calcCnps - calcIts + (e.indemniteTransport || 0) + (e.autresIndemnites || 0);
      }

      return {
        employeId: e.id!,
        mois: genMois.value,
        annee: genAnnee.value,
        exercice: genAnnee.value,
        mairieId: 1,
        salaireBase: e.salaireBase,
        indemniteLogement: e.indemniteLogement || 0,
        indemniteTransport: e.indemniteTransport || 0,
        autresIndemnites: e.autresIndemnites || 0,
        montantBrut: brut,
        cotisationCNPS: calcCnps,
        impotSurSalaire: calcIts,
        autresRetenues: 0,
        montantNet: netPay,
        statut: 'valide' as const,
        personnelId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    });

  if (newFiches.length === 0) {
    $q.notify({ type: 'info', message: 'Tous les bulletins ont déjà été générés pour ce mois.' });
    showGenerateDialog.value = false;
    return;
  }

  await db.fichesPaie.bulkAdd(newFiches);
  $q.notify({ type: 'positive', message: `${newFiches.length} bulletin(s) généré(s)` });
  showGenerateDialog.value = false;
  filterMois.value = genMois.value;
  filterAnnee.value = genAnnee.value;
  await loadData();
}

function editFiche(row: FichePaie) {
  editingId.value = row.id!;
  form.value = {
    employeId: row.employeId,
    mois: row.mois,
    annee: row.annee,
    exercice: row.exercice,
    salaireBase: row.salaireBase,
    indemniteLogement: row.indemniteLogement,
    indemniteTransport: row.indemniteTransport,
    autresIndemnites: row.autresIndemnites,
    montantBrut: row.montantBrut,
    cotisationCNPS: row.cotisationCNPS,
    impotSurSalaire: row.impotSurSalaire,
    autresRetenues: row.autresRetenues,
    montantNet: row.montantNet,
    statut: row.statut,
    observations: row.observations || '',
  };
  showDialog.value = true;
}

async function saveFiche() {
  if (!form.value.employeId) return;
  const now = new Date();
  const data = {
    employeId: form.value.employeId,
    mois: form.value.mois,
    annee: form.value.annee,
    exercice: form.value.annee,
    mairieId: 1,
    salaireBase: form.value.salaireBase,
    indemniteLogement: form.value.indemniteLogement,
    indemniteTransport: form.value.indemniteTransport,
    autresIndemnites: form.value.autresIndemnites,
    montantBrut: form.value.montantBrut,
    cotisationCNPS: form.value.cotisationCNPS,
    impotSurSalaire: form.value.impotSurSalaire,
    autresRetenues: form.value.autresRetenues,
    montantNet: form.value.montantNet,
    statut: form.value.statut,
    observations: form.value.observations || undefined,
    personnelId: 1,
    updatedAt: now,
  };
  try {
    if (editingId.value) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await db.fichesPaie.update(editingId.value, data as any);
      $q.notify({ type: 'positive', message: 'Bulletin modifié' });
    } else {
      // Vérifier l'unicité agent/mois/année
      const existing = await db.fichesPaie
        .filter(
          (f) => f.employeId === data.employeId && f.mois === data.mois && f.annee === data.annee,
        )
        .first();
      if (existing) {
        $q.notify({
          type: 'negative',
          message: `Un bulletin existe déjà pour cet agent en ${moisOptions[data.mois - 1]?.label ?? ''} ${data.annee}`,
        });
        return;
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await db.fichesPaie.add({ ...data, createdAt: now } as any);
      $q.notify({ type: 'positive', message: 'Bulletin ajouté' });
    }
    showDialog.value = false;
    await loadData();
  } catch {
    $q.notify({ type: 'negative', message: "Erreur lors de l'enregistrement" });
  }
}

function deleteFiche(row: FichePaie) {
  $q.dialog({
    title: 'Confirmation',
    message: `Supprimer ce bulletin de paie ?`,
    cancel: true,
  }).onOk(() => {
    void (async () => {
      await db.fichesPaie.delete(row.id);
      $q.notify({ type: 'positive', message: 'Bulletin supprimé' });
      await loadData();
    })();
  });
}

function printBulletin(row: FichePaie) {
  openPrintWindow('bulletin_paie.html', { fichePaieId: row.id! });
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

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
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
