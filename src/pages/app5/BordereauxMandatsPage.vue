<template>
  <q-page class="bordereaux-page q-pa-md">
    <PageHeader
      title="Bordereaux de Mandats - Investissements"
      subtitle="Gestion des bordereaux d'émission des mandats d'investissement"
      icon="folder_open"
    />

    <q-card class="main-card">
      <q-card-section>
        <!-- Filtres -->
        <div class="row q-col-gutter-md q-mb-md">
          <div class="col-12 col-md-3">
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
          <div class="col-12 col-md-3">
            <q-input v-model="filter" placeholder="Rechercher..." outlined dense clearable>
              <template v-slot:prepend>
                <q-icon name="search" />
              </template>
            </q-input>
          </div>
          <div class="col-12 col-md-3">
            <q-btn
              color="teal"
              icon="add"
              label="Nouveau Bordereau"
              unelevated
              class="full-width"
              @click="openAddDialog"
            />
          </div>
        </div>

        <DataTable
          :rows="filteredBordereaux"
          :columns="columns"
          :loading="loading"
          show-print
          @print="printBordereau"
          @edit="editBordereau"
          @delete="deleteBordereau"
        >
          <template v-slot:body-cell-numero="props">
            <q-td :props="props">
              <q-badge color="teal-8" :label="`${props.row.numero}-${props.row.exercice % 100}`" />
            </q-td>
          </template>

          <template v-slot:body-cell-statut="props">
            <q-td :props="props">
              <q-badge :color="props.row.statut === 'ouvert' ? 'positive' : 'grey'">
                {{ props.row.statut === 'ouvert' ? 'Ouvert' : 'Fermé' }}
              </q-badge>
            </q-td>
          </template>

          <template v-slot:body-cell-mandats="props">
            <q-td :props="props">
              <q-btn
                flat
                dense
                color="teal"
                :label="`${props.row.nombreMandats || 0} mandat(s)`"
                @click="showMandats(props.row)"
              />
            </q-td>
          </template>
        </DataTable>
      </q-card-section>
    </q-card>

    <!-- Dialog d'ajout/modification -->
    <q-dialog v-model="showAddDialog" persistent>
      <q-card style="min-width: 500px">
        <q-card-section class="row items-center q-pb-none bg-teal text-white">
          <div class="text-h6">
            {{ editingId ? 'Modifier le bordereau' : 'Nouveau bordereau' }}
          </div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <q-form @submit="saveBordereau" class="q-gutter-md">
            <q-input
              v-model.number="formData.numero"
              label="Numéro *"
              outlined
              dense
              type="number"
              :rules="[(val) => !!val || 'Numéro requis']"
            />

            <q-input
              v-model.number="formData.exercice"
              label="Exercice *"
              outlined
              dense
              type="number"
              :rules="[(val) => !!val || 'Exercice requis']"
            />

            <q-input
              v-model="formData.dateEmission"
              label="Date d'émission"
              outlined
              dense
              type="date"
            />

            <q-select
              v-model="formData.statut"
              :options="['ouvert', 'ferme']"
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
              <q-btn label="Enregistrer" type="submit" color="teal" unelevated />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Dialog liste des mandats -->
    <q-dialog v-model="showMandatsDialog" maximized>
      <q-card>
        <q-card-section class="row items-center q-pb-none bg-teal text-white">
          <div class="text-h6">
            Mandats du Bordereau {{ selectedBordereau?.numero }}-{{ selectedBordereau?.exercice }}
          </div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <q-table
            :rows="bordereauMandats"
            :columns="mandatColumns"
            row-key="id"
            flat
            bordered
            :loading="loadingMandats"
          >
            <template v-slot:body-cell-montant="props">
              <q-td :props="props">
                {{ formatMontant(props.row.montant) }}
              </q-td>
            </template>
          </q-table>

          <div class="q-mt-md text-right">
            <strong>Total: {{ formatMontant(totalMandats) }}</strong>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useQuasar, date } from 'quasar';
import {
  db,
  type BordereauMandatInvestissement,
  type MandatInvestissement,
  type Mairie,
  DEFAULT_MAIRIE_ID,
} from 'src/database/db';
import PageHeader from 'src/components/PageHeader.vue';
import DataTable from 'src/components/DataTable.vue';

const $q = useQuasar();
const loading = ref(false);
const loadingMandats = ref(false);
const filter = ref('');
const showAddDialog = ref(false);
const showMandatsDialog = ref(false);
const editingId = ref<number | null>(null);

// Filtres
const filterExercice = ref<number | null>(null);
const filterStatut = ref<string | null>(null);

const bordereaux = ref<BordereauMandatInvestissement[]>([]);
const bordereauMandats = ref<MandatInvestissement[]>([]);
const selectedBordereau = ref<BordereauMandatInvestissement | null>(null);
const mairies = ref<Mairie[]>([]);

const formData = ref({
  numero: 1,
  exercice: new Date().getFullYear(),
  dateEmission: date.formatDate(new Date(), 'YYYY-MM-DD'),
  statut: 'ouvert' as 'ouvert' | 'ferme',
  observations: '',
});

const statutOptions = [
  { label: 'Ouvert', value: 'ouvert' },
  { label: 'Fermé', value: 'ferme' },
];

const exerciceFilterOptions = computed(() => {
  const years = [...new Set(bordereaux.value.map((b) => b.exercice))].sort((a, b) => b - a);
  return years.map((y) => ({ label: String(y), value: y }));
});

const columns = [
  {
    name: 'numero',
    label: 'N° Bordereau',
    align: 'left' as const,
    field: 'numero',
    sortable: true,
  },
  {
    name: 'exercice',
    label: 'Exercice',
    align: 'left' as const,
    field: 'exercice',
    sortable: true,
  },
  {
    name: 'dateEmission',
    label: "Date d'émission",
    align: 'left' as const,
    field: 'dateEmission',
    format: (val: Date) => (val ? date.formatDate(val, 'DD/MM/YYYY') : '-'),
    sortable: true,
  },
  {
    name: 'mandats',
    label: 'Mandats',
    align: 'center' as const,
    field: 'nombreMandats',
    sortable: true,
  },
  {
    name: 'montantTotal',
    label: 'Montant Total',
    align: 'right' as const,
    field: 'montantTotal',
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

const mandatColumns = [
  { name: 'numeroMandat', label: 'N° Mandat', align: 'left' as const, field: 'numeroMandat' },
  {
    name: 'dateMandat',
    label: 'Date',
    align: 'left' as const,
    field: 'dateMandat',
    format: (val: Date) => date.formatDate(val, 'DD/MM/YYYY'),
  },
  { name: 'beneficiaire', label: 'Bénéficiaire', align: 'left' as const, field: 'beneficiaire' },
  { name: 'objet', label: 'Objet', align: 'left' as const, field: 'objet' },
  { name: 'montant', label: 'Montant', align: 'right' as const, field: 'montant' },
];

const filteredBordereaux = computed(() => {
  let result = bordereaux.value;

  if (filterExercice.value) {
    result = result.filter((b) => b.exercice === filterExercice.value);
  }
  if (filterStatut.value) {
    result = result.filter((b) => b.statut === filterStatut.value);
  }
  if (filter.value) {
    const searchTerm = filter.value.toLowerCase();
    result = result.filter(
      (b) =>
        String(b.numero).includes(searchTerm) || b.observations?.toLowerCase().includes(searchTerm),
    );
  }

  return result;
});

const totalMandats = computed(() => bordereauMandats.value.reduce((sum, m) => sum + m.montant, 0));

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
    [bordereaux.value, mairies.value] = await Promise.all([
      db.bordereauMandatsInvestissement.where('mairieId').equals(DEFAULT_MAIRIE_ID).toArray(),
      db.mairies.toArray(),
    ]);

    // Recalculer les totaux
    for (const bordereau of bordereaux.value) {
      const mandats = await db.mandatsInvestissement
        .where({ bordereauMandatInvestissementId: bordereau.id })
        .toArray();
      bordereau.nombreMandats = mandats.length;
      bordereau.montantTotal = mandats.reduce((sum, m) => sum + m.montant, 0);
    }
  } catch (error) {
    console.error('Erreur lors du chargement:', error);
    $q.notify({ type: 'negative', message: 'Erreur lors du chargement des données' });
  } finally {
    loading.value = false;
  }
}

function resetForm() {
  formData.value = {
    numero: 1,
    exercice: new Date().getFullYear(),
    dateEmission: date.formatDate(new Date(), 'YYYY-MM-DD'),
    statut: 'ouvert',
    observations: '',
  };
  editingId.value = null;
}

async function openAddDialog() {
  resetForm();
  // Générer le prochain numéro
  const existingBordereaux = bordereaux.value.filter((b) => b.exercice === formData.value.exercice);
  formData.value.numero =
    existingBordereaux.length > 0 ? Math.max(...existingBordereaux.map((b) => b.numero)) + 1 : 1;
  showAddDialog.value = true;
}

function editBordereau(row: BordereauMandatInvestissement) {
  editingId.value = row.id ?? null;
  formData.value = {
    numero: row.numero,
    exercice: row.exercice,
    dateEmission: row.dateEmission ? date.formatDate(row.dateEmission, 'YYYY-MM-DD') : '',
    statut: row.statut,
    observations: row.observations || '',
  };
  showAddDialog.value = true;
}

async function saveBordereau() {
  try {
    const now = new Date();

    const data = {
      numero: formData.value.numero,
      exercice: formData.value.exercice,
      dateEmission: formData.value.dateEmission ? new Date(formData.value.dateEmission) : new Date(),
      mairieId: DEFAULT_MAIRIE_ID,
      montantTotal: 0,
      nombreMandats: 0,
      statut: formData.value.statut,
      observations: formData.value.observations,
      personnelId: 1,
      createdAt: now,
      updatedAt: now,
    } satisfies Omit<BordereauMandatInvestissement, 'id'>;

    if (editingId.value) {
      await db.bordereauMandatsInvestissement.update(editingId.value, {
        ...data,
        updatedAt: now,
      });
      $q.notify({ type: 'positive', message: 'Bordereau modifié avec succès' });
    } else {
      await db.bordereauMandatsInvestissement.add(data);
      $q.notify({ type: 'positive', message: 'Bordereau créé avec succès' });
    }

    showAddDialog.value = false;
    resetForm();
    await loadData();
  } catch (error) {
    console.error('Erreur lors de la sauvegarde:', error);
    $q.notify({ type: 'negative', message: "Erreur lors de l'enregistrement" });
  }
}

function deleteBordereau(row: BordereauMandatInvestissement) {
  $q.dialog({
    title: 'Confirmation',
    message: `Voulez-vous vraiment supprimer le bordereau ${row.numero}-${row.exercice} ?`,
    cancel: true,
    persistent: true,
  }).onOk(() => {
    void (async () => {
      try {
        // Vérifier s'il y a des mandats liés
        const mandats = await db.mandatsInvestissement
          .where({ bordereauMandatInvestissementId: row.id })
          .count();

        if (mandats > 0) {
          $q.notify({
            type: 'negative',
            message: 'Impossible de supprimer : ce bordereau contient des mandats.',
          });
          return;
        }

        await db.bordereauMandatsInvestissement.delete(row.id);
        $q.notify({ type: 'positive', message: 'Bordereau supprimé avec succès' });
        await loadData();
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        $q.notify({ type: 'negative', message: 'Erreur lors de la suppression' });
      }
    })();
  });
}

async function showMandats(bordereau: BordereauMandatInvestissement) {
  selectedBordereau.value = bordereau;
  loadingMandats.value = true;
  showMandatsDialog.value = true;

  try {
    bordereauMandats.value = await db.mandatsInvestissement
      .where({ bordereauMandatInvestissementId: bordereau.id })
      .toArray();
  } catch (error) {
    console.error('Erreur:', error);
    $q.notify({ type: 'negative', message: 'Erreur lors du chargement des mandats' });
  } finally {
    loadingMandats.value = false;
  }
}

function printBordereau(bordereau: BordereauMandatInvestissement) {
  const printWindow = window.open(
    `/bordereau_mandat_new.html?bordereauId=${bordereau.id}&type=investissement`,
    '_blank',
  );

  if (printWindow) {
    printWindow.addEventListener('load', () => {
      void (async () => {
        const mandats = await db.mandatsInvestissement
          .where({ bordereauMandatInvestissementId: bordereau.id })
          .toArray();

        const mairie = mairies.value[0];

        printWindow.postMessage(
          {
            type: 'FILL_BORDEREAU_MANDAT',
            data: {
              exercice: bordereau.exercice,
              numeroBordereau: `${bordereau.numero}-${bordereau.exercice % 100}`,
              dateEmission: bordereau.dateEmission
                ? new Date(bordereau.dateEmission).toLocaleDateString('fr-FR')
                : new Date().toLocaleDateString('fr-FR'),
              mandats: mandats.map((m) => ({
                numeroMandat: m.numeroMandat,
                dateMandat: new Date(m.dateMandat).toLocaleDateString('fr-FR'),
                beneficiaire: m.beneficiaire,
                objet: m.objet,
                montant: m.montant,
              })),
              montantTotal: mandats.reduce((sum, m) => sum + m.montant, 0),
              mairieDepartement: mairie?.ville ?? '',
              mairieCommune: mairie?.ville ?? '',
              mairieCode: mairie?.code ?? '',
              mairieVille: mairie?.nom ?? '',
              typeBordereau: 'INVESTISSEMENT',
            },
          },
          '*',
        );
      })();
    });
  }
}

onMounted(() => {
  void loadData();
});
</script>

<style scoped lang="scss">
.bordereaux-page {
  max-width: 1400px;
  margin: 0 auto;
}

.main-card {
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}
</style>
