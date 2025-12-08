<template>
  <q-page class="mandats-page q-pa-md">
    <PageHeader
      title="Mandats d'Investissement"
      subtitle="Gestion des mandats d'investissement"
      icon="receipt"
    />

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
              v-model="filterSousChapitreId"
              :options="sousChapitreOptions"
              label="Sous-chapitre"
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
          <div class="col-12 col-md-auto q-mt-sm q-mt-md-none">
            <q-btn
              color="teal"
              icon="add"
              label="Nouveau Mandat"
              unelevated
              @click="openAddDialog"
            />
          </div>
        </div>

        <DataTable
          :rows="filteredMandats"
          :columns="columns"
          :loading="loading"
          show-print
          @print="printMandat"
          @edit="editMandat"
          @delete="deleteMandat"
        >
          <template v-slot:body-cell-bordereauNumero="props">
            <q-td :props="props">
              {{ getBordereauNumero(props.row.bordereauMandatInvestissementId) }}
            </q-td>
          </template>

          <template v-slot:body-cell-statut="props">
            <q-td :props="props">
              <q-badge :color="getStatutColor(props.row.statut)">
                {{ getStatutLabel(props.row.statut) }}
              </q-badge>
            </q-td>
          </template>
        </DataTable>
      </q-card-section>
    </q-card>

    <!-- Dialog d'ajout/modification -->
    <q-dialog v-model="showAddDialog" persistent>
      <q-card style="min-width: 700px">
        <q-card-section class="row items-center q-pb-none bg-teal text-white">
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
                  v-model="formData.dateMandat"
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
                  label="Chapitre *"
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
              <div class="col-6">
                <q-select
                  v-model="formData.sousChapitreId"
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
            </div>

            <q-input
              v-model="formData.beneficiaire"
              label="Bénéficiaire *"
              outlined
              dense
              :rules="[(val) => !!val || 'Bénéficiaire requis']"
            />

            <div class="row q-col-gutter-md">
              <div class="col-4">
                <q-select
                  v-model="formData.bordereauMandatId"
                  :options="filteredBordereauOptions"
                  label="Bordereau de Mandat *"
                  outlined
                  dense
                  emit-value
                  map-options
                  use-input
                  input-debounce="0"
                  :rules="[(val) => !!val || 'Bordereau requis']"
                  @filter="filterBordereau"
                >
                  <template v-slot:prepend>
                    <q-icon name="description" />
                  </template>
                </q-select>
              </div>
              <div class="col-4">
                <q-input v-model="formData.rib" label="RIB" outlined dense />
              </div>
              <div class="col-4">
                <q-input
                  v-model="formData.patrimonial"
                  label="Imputation Patrimoniale"
                  outlined
                  dense
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
                  :rules="[(val) => !!val || 'Montant requis']"
                />
              </div>
              <div class="col-4">
                <q-input v-model="formData.numeroFacture" label="N° Facture" outlined dense />
              </div>
              <div class="col-4">
                <q-input
                  v-model="formData.dateFacture"
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
                  :options="['brouillon', 'emis', 'paye', 'annule']"
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
              <q-btn label="Enregistrer" type="submit" color="teal" unelevated />
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
  type MandatInvestissement,
  type ChapitreInvestissement,
  type SousChapitreInvestissement,
  type BordereauMandatInvestissement,
  type Mairie,
  DEFAULT_MAIRIE_ID,
} from 'src/database/db';
import PageHeader from 'src/components/PageHeader.vue';
import DataTable from 'src/components/DataTable.vue';
import { amountToWords } from 'src/utils/numberToWords';

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

const mandats = ref<MandatInvestissement[]>([]);
const chapitres = ref<ChapitreInvestissement[]>([]);
const sousChapitres = ref<SousChapitreInvestissement[]>([]);
const bordereauMandats = ref<BordereauMandatInvestissement[]>([]);
const mairies = ref<Mairie[]>([]);

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
  statut: 'emis' as 'brouillon' | 'emis' | 'paye' | 'annule',
  observations: '',
});

const chapitreOptions = computed(() =>
  chapitres.value.map((c) => ({ label: `${c.code} - ${c.libelle}`, value: c.id })),
);

const sousChapitreOptions = computed(() =>
  sousChapitres.value.map((s) => ({ label: `${s.code} - ${s.libelle}`, value: s.id })),
);

const exerciceFilterOptions = computed(() => {
  const years = [...new Set(mandats.value.map((m) => m.exercice))].sort((a, b) => b - a);
  return years.map((y) => ({ label: String(y), value: y }));
});

const bordereauOptions = computed(() =>
  bordereauMandats.value
    .filter((b) => b.statut === 'ouvert')
    .map((b) => ({
      label: `Bordereau ${b.numero}-${b.exercice % 100} (${b.nombreMandats || 0} mandats)`,
      value: b.id,
    })),
);

const filteredChapitreOptions = ref(chapitreOptions.value);
const filteredSousChapitreOptions = ref(sousChapitreOptions.value);
const filteredBordereauOptions = ref(bordereauOptions.value);

watch(chapitreOptions, (newOptions) => {
  filteredChapitreOptions.value = newOptions;
});

watch(sousChapitreOptions, (newOptions) => {
  filteredSousChapitreOptions.value = newOptions;
});

watch(bordereauOptions, (newOptions) => {
  filteredBordereauOptions.value = newOptions;
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

const columns = [
  {
    name: 'numeroMandat',
    label: 'N° Mandat',
    align: 'left' as const,
    field: 'numeroMandat',
    sortable: true,
  },
  {
    name: 'bordereauNumero',
    label: 'N° Bordereau',
    align: 'center' as const,
    field: 'bordereauMandatInvestissementId',
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

  if (filterExercice.value) {
    result = result.filter((m) => m.exercice === filterExercice.value);
  }
  if (filterChapitreId.value) {
    result = result.filter((m) => m.chapitreInvestissementId === filterChapitreId.value);
  }
  if (filterSousChapitreId.value) {
    result = result.filter((m) => m.sousChapitreInvestissementId === filterSousChapitreId.value);
  }
  if (filterDateDebut.value) {
    const dateDebut = new Date(filterDateDebut.value);
    result = result.filter((m) => new Date(m.dateMandat) >= dateDebut);
  }
  if (filterDateFin.value) {
    const dateFin = new Date(filterDateFin.value);
    dateFin.setHours(23, 59, 59, 999);
    result = result.filter((m) => new Date(m.dateMandat) <= dateFin);
  }
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

function getStatutColor(statut: string): string {
  switch (statut) {
    case 'emis':
      return 'info';
    case 'paye':
      return 'positive';
    case 'brouillon':
      return 'warning';
    case 'annule':
      return 'negative';
    default:
      return 'grey';
  }
}

function getStatutLabel(statut: string): string {
  switch (statut) {
    case 'emis':
      return 'Émis';
    case 'paye':
      return 'Payé';
    case 'brouillon':
      return 'Brouillon';
    case 'annule':
      return 'Annulé';
    default:
      return statut;
  }
}

function getBordereauNumero(bordereauId?: number): string {
  if (!bordereauId) return '-';
  const bordereau = bordereauMandats.value.find((b) => b.id === bordereauId);
  if (!bordereau) return '-';
  return `${bordereau.numero}-${bordereau.exercice}`;
}

async function loadData() {
  loading.value = true;
  try {
    [mandats.value, chapitres.value, sousChapitres.value, bordereauMandats.value, mairies.value] =
      await Promise.all([
        db.mandatsInvestissement.where('mairieId').equals(DEFAULT_MAIRIE_ID).toArray(),
        db.chapitresInvestissement.filter((c) => c.actif).toArray(),
        db.sousChapitresInvestissement.filter((s) => s.actif).toArray(),
        db.bordereauMandatsInvestissement.toArray(),
        db.mairies.toArray(),
      ]);
  } catch (error) {
    console.error('Erreur lors du chargement:', error);
    $q.notify({ type: 'negative', message: 'Erreur lors du chargement des données' });
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
    statut: 'emis',
    observations: '',
  };
  editingId.value = null;
}

async function openAddDialog() {
  resetForm();
  const count = await db.mandatsInvestissement.count();
  formData.value.numeroMandat = `MI${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;
  showAddDialog.value = true;
}

async function saveMandat() {
  try {
    const now = new Date();

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { dateFacture, dateMandat, ...otherFormData } = formData.value;

    const data = {
      ...otherFormData,
      chapitreInvestissementId: formData.value.chapitreId!,
      ...(formData.value.sousChapitreId
        ? { sousChapitreInvestissementId: formData.value.sousChapitreId }
        : {}),
      dateMandat: new Date(formData.value.dateMandat),
      ...(dateFacture ? { dateFacture: new Date(dateFacture) } : {}),
      ...(formData.value.bordereauMandatId
        ? { bordereauMandatInvestissementId: formData.value.bordereauMandatId }
        : {}),
      mairieId: DEFAULT_MAIRIE_ID,
      personnelId: 1,
    };

    if (editingId.value) {
      await db.mandatsInvestissement.update(editingId.value, { ...data, updatedAt: now });
      $q.notify({ type: 'positive', message: 'Mandat modifié avec succès' });
    } else {
      type MandatInsert = Omit<MandatInvestissement, 'id'>;
      const insertData: MandatInsert = {
        ...data,
        createdAt: now,
        updatedAt: now,
      } as MandatInsert;
      await db.mandatsInvestissement.add(insertData);
      $q.notify({ type: 'positive', message: 'Mandat ajouté avec succès' });
    }

    showAddDialog.value = false;
    resetForm();
    await loadData();
  } catch (error) {
    console.error('Erreur lors de la sauvegarde:', error);
    $q.notify({ type: 'negative', message: "Erreur lors de l'enregistrement" });
  }
}

function editMandat(row: MandatInvestissement) {
  editingId.value = row.id ?? null;
  formData.value = {
    numeroMandat: row.numeroMandat,
    dateMandat: date.formatDate(row.dateMandat, 'YYYY-MM-DD'),
    exercice: row.exercice,
    chapitreId: row.chapitreInvestissementId,
    sousChapitreId: row.sousChapitreInvestissementId ?? null,
    bordereauMandatId: row.bordereauMandatInvestissementId ?? null,
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
  };
  showAddDialog.value = true;
}

function deleteMandat(row: MandatInvestissement) {
  $q.dialog({
    title: 'Confirmation',
    message: `Voulez-vous vraiment supprimer le mandat "${row.numeroMandat}" ?`,
    cancel: true,
    persistent: true,
  }).onOk(() => {
    void (async () => {
      try {
        await db.mandatsInvestissement.delete(row.id);
        $q.notify({ type: 'positive', message: 'Mandat supprimé avec succès' });
        await loadData();
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        $q.notify({ type: 'negative', message: 'Erreur lors de la suppression' });
      }
    })();
  });
}

function printMandat(mandat: MandatInvestissement) {
  const printWindow = window.open(
    `/mandat_depense.html?mandatId=${mandat.id}&print=true&type=investissement`,
    '_blank',
  );

  if (printWindow) {
    printWindow.addEventListener('load', () => {
      const chapitre = chapitres.value.find((c) => c.id === mandat.chapitreInvestissementId);
      const sousChapitre = sousChapitres.value.find(
        (s) => s.id === mandat.sousChapitreInvestissementId,
      );
      const bordereau = bordereauMandats.value.find(
        (b) => b.id === mandat.bordereauMandatInvestissementId,
      );
      const mairie = mairies.value[0];

      printWindow.postMessage(
        {
          type: 'FILL_MANDAT',
          data: {
            exercice: mandat.exercice,
            imputationFonctionnelle: sousChapitre
              ? `${sousChapitre.code}/${chapitre?.code}`
              : chapitre?.code,
            imputationPatrimoniale: mandat.patrimonial || '',
            numeroOrdre: mandat.numeroMandat || '',
            numeroBordereau: bordereau ? `${bordereau.numero}-${bordereau.exercice % 100}` : '',
            objetDepense: mandat.objet,
            periode: '',
            beneficiaire: mandat.beneficiaire,
            beneficiaireDetails: '',
            rib: mandat.rib || '',
            montantBrut: mandat.montant,
            montantNet: mandat.montant,
            montantLettres: amountToWords(mandat.montant).toUpperCase(),
            dateEmission: new Date(mandat.dateMandat).toLocaleDateString('fr-FR'),
            mairieDepartement: mairie?.ville ?? '',
            mairieCommune: mairie?.ville ?? '',
            mairieCode: mairie?.code ?? '',
            mairieVille: mairie?.nom ?? '',
            typeMandat: 'INVESTISSEMENT',
          },
        },
        '*',
      );
    });
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
</style>
