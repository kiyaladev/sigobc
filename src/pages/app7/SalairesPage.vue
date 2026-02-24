<template>
  <q-page class="dashboard-page q-pa-md">
    <PageHeader
      title="Gestion des Salaires"
      subtitle="Bulletins de paie mensuels"
      icon="payments"
    />

    <q-card class="main-card q-mb-md">
      <q-card-section>
        <div class="row q-col-gutter-sm items-center q-mb-md">
          <div class="col-12 col-md-2">
            <q-select
              v-model="filterMois"
              :options="moisOptions"
              label="Mois"
              outlined
              dense
              emit-value
              map-options
            />
          </div>
          <div class="col-12 col-md-2">
            <q-input v-model.number="filterAnnee" label="Année" outlined dense type="number" />
          </div>
          <div class="col-12 col-md-3">
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
          <div class="col-12 col-md-auto q-gutter-sm row">
            <q-btn
              v-if="false"
              icon="add"
              label="Générer bulletins"
              color="primary"
              unelevated
              @click="openGenerateDialog"
            />
            <q-btn icon="add" label="Nouveau bulletin" color="teal" unelevated @click="openAdd" />
            <q-btn
              icon="print"
              label="Imprimer"
              color="deep-purple"
              unelevated
              @click="showPrintDialog = true"
            />
          </div>
        </div>

        <!-- Résumé du mois -->
        <div class="row q-col-gutter-md q-mb-md">
          <div class="col-12 col-sm-6 col-md-3" v-for="(stat, index) in statsCards" :key="index">
            <q-card
              class="stat-card hover-lift"
              :class="`stat-card-${index}`"
              :style="{
                animationDelay: `${index * 0.1}s`,
                borderLeft: `4px solid var(--q-${stat.color})`,
              }"
            >
              <q-card-section class="stat-card-content">
                <div class="row items-center no-wrap">
                  <div class="col">
                    <div class="stat-value text-grey-8">{{ stat.value }}</div>
                    <div class="stat-label text-grey-6">{{ stat.label }}</div>
                  </div>
                  <div class="col-auto">
                    <div class="stat-icon-wrapper" :class="`bg-${stat.color}-1`">
                      <q-icon :name="stat.icon" class="stat-icon" :color="stat.color" />
                    </div>
                  </div>
                </div>

                <!-- Indicateur de progression -->
                <q-linear-progress
                  :value="stat.progress || 1"
                  :color="stat.color"
                  class="stat-progress q-mt-md"
                  :class="{ 'pulse-animation': stat.progress < 1 }"
                />
              </q-card-section>
            </q-card>
          </div>
        </div>

        <DataTable
          :rows="filteredFiches"
          :columns="columns"
          :loading="loading"
          :show-actions="false"
          show-export-csv
          export-filename="fiches-paie"
        >
          <template v-slot:body-cell-employe="props">
            <q-td :props="props">{{ getEmployeNom(props.row.employeId) }}</q-td>
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
        </DataTable>
      </q-card-section>
    </q-card>

    <!-- Dialog Impression Documents Officiels -->
    <q-dialog v-model="showPrintDialog" persistent>
      <q-card style="min-width: 460px">
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
      <q-card style="min-width: 700px">
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
      <q-card style="min-width: 450px">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">Générer les bulletins du mois</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>
        <q-card-section>
          <p class="text-body2 text-grey-7">
            Cette action génère un bulletin de paie pour chaque agent actif, en reprenant les
            éléments de rémunération de leur fiche.
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
        </q-card-section>
        <q-card-actions align="right">
          <q-btn label="Annuler" flat color="grey-7" v-close-popup />
          <q-btn label="Générer" color="primary" unelevated @click="generateBulletins" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useQuasar } from 'quasar';
import { db, type FichePaie, type Employe, type ParametresPaie } from 'src/database/db';
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
const parametresPaie = ref<ParametresPaie | null>(null);

const now = new Date();
const filterMois = ref(now.getMonth() + 1);
const filterAnnee = ref(now.getFullYear());
const filterStatut = ref<string | null>(null);
const genMois = ref(now.getMonth() + 1);
const genAnnee = ref(now.getFullYear());
const printMois = ref(now.getMonth() + 1);
const printAnnee = ref(now.getFullYear());

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
  openPrintWindow(file, { mois: printMois.value, annee: printAnnee.value });
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

function recalculate() {
  const brut =
    (form.value.salaireBase || 0) +
    (form.value.indemniteLogement || 0) +
    (form.value.indemniteTransport || 0) +
    (form.value.autresIndemnites || 0);
  form.value.montantBrut = brut;

  if (parametresPaie.value) {
    const cnps = Math.round(brut * (parametresPaie.value.tauxCnpsEmploye / 100));
    const its = Math.round(brut * (parametresPaie.value.tauxIts / 100));
    form.value.cotisationCNPS = cnps;
    form.value.impotSurSalaire = its;
  }

  form.value.montantNet =
    brut -
    (form.value.cotisationCNPS || 0) -
    (form.value.impotSurSalaire || 0) -
    (form.value.autresRetenues || 0);
}

const filteredFiches = computed(() => {
  let r = fiches.value.filter((f) => f.mois === filterMois.value && f.annee === filterAnnee.value);
  if (filterStatut.value) r = r.filter((f) => f.statut === filterStatut.value);
  return r;
});

const totalBrut = computed(() => filteredFiches.value.reduce((s, f) => s + f.montantBrut, 0));
const totalNet = computed(() => filteredFiches.value.reduce((s, f) => s + f.montantNet, 0));

// Cartes de statistiques avec animations
const statsCards = computed(() => {
  const total = filteredFiches.value.length;
  const valides = filteredFiches.value.filter(
    (f) => f.statut === 'valide' || f.statut === 'paye',
  ).length;

  return [
    {
      value: total,
      label: 'Total bulletins',
      icon: 'receipt_long',
      color: 'primary',
      progress: total > 0 ? 1 : 0,
    },
    {
      value: valides,
      label: 'Bulletins Validés',
      icon: 'check_circle',
      color: 'positive',
      progress: total > 0 ? valides / total : 0,
    },
    {
      value: formatMontant(totalBrut.value),
      label: 'Total Brut',
      icon: 'account_balance',
      color: 'blue',
      progress: 0.8,
    },
    {
      value: formatMontant(totalNet.value),
      label: 'Total Net à payer',
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
    const [loadedFiches, loadedEmployes, loadedParams] = await Promise.all([
      db.fichesPaie.toArray(),
      db.employes.toArray(),
      db.parametresPaie.toCollection().first(),
    ]);
    fiches.value = loadedFiches;
    employes.value = loadedEmployes;
    parametresPaie.value = loadedParams ?? null;
    filteredEmployeOptions.value = employeOptions.value;
  } finally {
    loading.value = false;
  }
}

function openAdd() {
  editingId.value = null;
  form.value = defaultForm();
  showDialog.value = true;
}

function openGenerateDialog() {
  showGenerateDialog.value = true;
}

async function generateBulletins() {
  const activeEmployes = employes.value.filter((e) => e.actif);
  const existingFiches = await db.fichesPaie
    .filter((f) => f.mois === genMois.value && f.annee === genAnnee.value)
    .toArray();
  const existingIds = new Set(existingFiches.map((f) => f.employeId));

  const newFiches = activeEmployes
    .filter((e) => !existingIds.has(e.id!))
    .map((e) => {
      const brut =
        e.salaireBase +
        (e.indemniteLogement || 0) +
        (e.indemniteTransport || 0) +
        (e.autresIndemnites || 0);

      let calcCnps = 0;
      let calcIts = 0;
      if (parametresPaie.value) {
        calcCnps = Math.round(brut * (parametresPaie.value.tauxCnpsEmploye / 100));
        calcIts = Math.round(brut * (parametresPaie.value.tauxIts / 100));
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
        montantNet: brut - calcCnps - calcIts,
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

// Cartes de statistiques
.stat-card {
  height: 100%;
  border-radius: 16px;
  overflow: hidden;
  animation: slideInUp 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) both;

  &:hover {
    .stat-icon {
      transform: scale(1.1) rotate(5deg);
    }
  }
}

.stat-card-content {
  position: relative;
  overflow: hidden;
  background: white;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  line-height: 1.2;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.stat-label {
  font-size: 0.875rem;
  opacity: 0.95;
  margin-top: 4px;
}

.stat-icon-wrapper {
  border-radius: 12px;
  padding: 12px;
}

.stat-icon {
  font-size: 48px;
  transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.stat-progress {
  border-radius: 4px;
  height: 4px;
}

.pulse-animation {
  animation: pulse 2s ease-in-out infinite;
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
</style>
