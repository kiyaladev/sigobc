<template>
  <q-page class="q-pa-md">
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
        <div class="row q-col-gutter-sm q-mb-md">
          <div class="col-12 col-sm-4">
            <q-banner class="bg-teal-1 rounded-borders">
              <div class="text-caption text-grey">Total bulletins</div>
              <div class="text-h6 text-teal">{{ filteredFiches.length }}</div>
            </q-banner>
          </div>
          <div class="col-12 col-sm-4">
            <q-banner class="bg-blue-1 rounded-borders">
              <div class="text-caption text-grey">Total brut</div>
              <div class="text-h6 text-blue">{{ formatMontant(totalBrut) }}</div>
            </q-banner>
          </div>
          <div class="col-12 col-sm-4">
            <q-banner class="bg-green-1 rounded-borders">
              <div class="text-caption text-grey">Total net à payer</div>
              <div class="text-h6 text-positive">{{ formatMontant(totalNet) }}</div>
            </q-banner>
          </div>
        </div>

        <DataTable
          :rows="filteredFiches"
          :columns="columns"
          :loading="loading"
          show-print
          show-export-csv
          export-filename="fiches-paie"
          @print="printBulletin"
          @edit="editFiche"
          @delete="deleteFiche"
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
import { db, type FichePaie, type Employe } from 'src/database/db';
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
    [fiches.value, employes.value] = await Promise.all([
      db.fichesPaie.toArray(),
      db.employes.toArray(),
    ]);
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
        cotisationCNPS: 0,
        impotSurSalaire: 0,
        autresRetenues: 0,
        montantNet: brut,
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
.main-card {
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}
</style>
