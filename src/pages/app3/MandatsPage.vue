<template>
  <q-page class="mandats-page q-pa-md">
    <PageHeader title="Mandats de Dépenses" subtitle="Gestion des mandats" icon="receipt" />

    <q-card class="main-card">
      <q-card-section>
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
              color="primary"
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
              <div class="col-12">
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
                  hint="Sélectionner un chapitre budgétaire"
                  @filter="filterChapitre"
                />
              </div>
              <div class="col-12">
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
                  hint="Sélectionner un sous-chapitre budgétaire"
                  @filter="filterSousChapitre"
                />
              </div>
            </div>

            <!-- Bordereau de Mandat -->
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
              hint="Sélectionner un bordereau"
              @filter="filterBordereauMandat"
            >
              <template v-slot:prepend>
                <q-icon name="description" />
              </template>
            </q-select>

            <q-input
              v-model="formData.beneficiaire"
              label="Bénéficiaire *"
              outlined
              dense
              :rules="[(val) => !!val || 'Bénéficiaire requis']"
            />

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
} from 'src/database/db';
import PageHeader from 'src/components/PageHeader.vue';
import DataTable from 'src/components/DataTable.vue';

const $q = useQuasar();
const loading = ref(false);
const filter = ref('');
const showAddDialog = ref(false);
const editingId = ref<number | null>(null);

const mandats = ref<Mandat[]>([]);
const chapitres = ref<Chapitre[]>([]);
const sousChapitres = ref<SousChapitre[]>([]);
const bordereauMandats = ref<BordereauMandat[]>([]);

const formData = ref({
  numeroMandat: '',
  dateMandat: date.formatDate(new Date(), 'YYYY-MM-DD'),
  exercice: new Date().getFullYear(),
  chapitreId: null as number | null,
  sousChapitreId: null as number | null,
  bordereauMandatId: null as number | null,
  beneficiaire: '',
  objet: '',
  montant: 0,
  numeroFacture: '',
  dateFacture: '',
  modePaiement: 'virement' as 'virement' | 'cheque' | 'especes' | 'autre',
  statut: 'emis' as 'brouillon' | 'emis' | 'paye' | 'annule',
  observations: '',
});

const chapitreOptions = computed(() =>
  chapitres.value
    .map((c) => ({
      label: `${c.code} - ${c.libelle}`,
      value: c.id,
    })),
);

const sousChapitreOptions = computed(() =>
  sousChapitres.value.map((s) => ({ label: `${s.code} - ${s.libelle}`, value: s.id })),
);

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
      (v) => v.label.toLowerCase().indexOf(needle) > -1
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
      (v) => v.label.toLowerCase().indexOf(needle) > -1
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
      (v) => v.label.toLowerCase().indexOf(needle) > -1
    );
  });
}

const columns = [
  {
    name: 'numeroOrdre',
    label: 'N° Ordre',
    align: 'center' as const,
    field: 'numeroOrdre',
    sortable: true,
  },
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
    name: 'beneficiaire',
    label: 'Bénéficiaire',
    align: 'left' as const,
    field: 'beneficiaire',
  },
  {
    name: 'objet',
    label: 'Objet',
    align: 'left' as const,
    field: 'objet',
  },
  {
    name: 'montant',
    label: 'Montant',
    align: 'right' as const,
    field: 'montant',
    format: (val: number) => formatMontant(val),
  },
  {
    name: 'statut',
    label: 'Statut',
    align: 'center' as const,
    field: 'statut',
  },
  {
    name: 'actions',
    label: 'Actions',
    align: 'center' as const,
    field: 'id',
  },
];

const filteredMandats = computed(() => {
  if (!filter.value) return mandats.value;
  const searchTerm = filter.value.toLowerCase();
  return mandats.value.filter(
    (m) =>
      m.numeroMandat.toLowerCase().includes(searchTerm) ||
      m.beneficiaire.toLowerCase().includes(searchTerm) ||
      m.objet.toLowerCase().includes(searchTerm),
  );
});

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

function printMandat(mandat: Mandat) {
  const printWindow = window.open(
    `/mandat_depense.html?mandatId=${mandat.id}&print=true`,
    '_blank',
  );

  if (printWindow) {
    printWindow.addEventListener('load', () => {
      const chapitre = chapitres.value.find((c) => c.id === mandat.chapitreId);
      const sousChapitre = sousChapitres.value.find((s) => s.id === mandat.sousChapitreId);
      const bordereau = bordereauMandats.value.find((b) => b.id === mandat.bordereauMandatId);

      printWindow.postMessage(
        {
          type: 'FILL_MANDAT',
          data: {
            exercice: mandat.exercice,
            imputationFonctionnelle: sousChapitre
              ? `${sousChapitre.code}/${chapitre?.code}`
              : chapitre?.code,
            numeroOrdre: mandat.numeroOrdre || '',
            numeroBordereau: bordereau ? `${bordereau.numero}-${bordereau.exercice}` : '',
            objetDepense: mandat.objet,
            periode: '', // This field is not in the Mandat interface
            beneficiaire: mandat.beneficiaire,
            beneficiaireDetails: '', // This field is not in the Mandat interface
            montantBrut: mandat.montant,
            montantNet: mandat.montant,
            dateEmission: new Date(mandat.dateMandat).toLocaleDateString('fr-FR'),
          },
        },
        '*',
      );
    });
  }
}

async function loadData() {
  loading.value = true;
  try {
    mandats.value = await db.mandats.toArray();
    mandats.value = await db.mandats.toArray();
    chapitres.value = await db.chapitres.filter((c) => c.actif).toArray();
    sousChapitres.value = await db.sousChapitres.filter((s) => s.actif).toArray();
    bordereauMandats.value = await db.bordereauMandats.toArray();
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
  // Générer automatiquement le numéro de mandat
  const count = await db.mandats.count();
  formData.value.numeroMandat = `M${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;
  showAddDialog.value = true;
}

async function saveMandat() {
  try {
    const now = new Date();
    const mairieId = 1;
    const personnelId = 1;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { dateFacture, dateMandat, ...otherFormData } = formData.value;

    const data = {
      ...otherFormData,
      chapitreId: formData.value.chapitreId!,
      ...(formData.value.sousChapitreId ? { sousChapitreId: formData.value.sousChapitreId } : {}),
      dateMandat: new Date(formData.value.dateMandat),
      ...(dateFacture ? { dateFacture: new Date(dateFacture) } : {}),
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
  editingId.value = row.id!;
  formData.value = {
    numeroMandat: row.numeroMandat,
    dateMandat: date.formatDate(row.dateMandat, 'YYYY-MM-DD'),
    exercice: row.exercice,
    chapitreId: row.chapitreId,
    sousChapitreId: row.sousChapitreId || null,
    bordereauMandatId: row.bordereauMandatId || null,
    beneficiaire: row.beneficiaire,
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

function deleteMandat(row: Mandat) {
  $q.dialog({
    title: 'Confirmation',
    message: `Voulez-vous vraiment supprimer le mandat "${row.numeroMandat}" ?`,
    cancel: true,
    persistent: true,
  }).onOk(() => {
    void (async () => {
      try {
        await db.mandats.delete(row.id);
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
