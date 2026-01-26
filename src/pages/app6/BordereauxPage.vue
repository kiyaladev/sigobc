<template>
  <q-page class="q-pa-md">
    <PageHeader
      title="Gestion des Bordereaux de Recettes"
      subtitle="Bordereaux pour les déclarations de recettes"
      icon="receipt_long"
    >
      <template #actions>
        <q-btn color="primary" icon="add" label="Nouveau Bordereau" @click="openDialog()" />
      </template>
    </PageHeader>

    <!-- Recherche et filtres -->
    <FilterBar
      v-model:search="search"
      v-model:statut="filterStatut"
      v-model:date-debut="filterDateDebut"
      v-model:date-fin="filterDateFin"
      :statut-options="statutOptions"
      show-statut
      show-date-range
      search-placeholder="Rechercher N° bordereau..."
      @reset="resetFilters"
    />

    <!-- Table des bordereaux -->
    <DataTable
      :rows="filteredBordereaux"
      :columns="columns"
      :loading="loading"
      show-view
      show-download
      @view="viewDeclarations"
      @download="downloadBordereauPDF"
      @edit="openDialog"
      @delete="confirmDelete"
    >
      <template v-slot:body-cell-numero="props">
        <q-td :props="props">
          {{ formatNumeroBordereau(props.row.numero, props.row.annee) }}
        </q-td>
      </template>

      <template v-slot:body-cell-statut="props">
        <q-td :props="props">
          <q-chip :color="getStatutColor(props.row.statut)" text-color="white" size="sm">
            {{ props.row.statut }}
          </q-chip>
        </q-td>
      </template>

      <template v-slot:body-cell-montantTotal="props">
        <q-td :props="props">
          {{ formatMontant(props.row.montantTotal) }}
        </q-td>
      </template>
      <template v-slot:body-cell-totalPrecedent="props">
        <q-td :props="props">
          {{ formatMontant(props.row.totalPrecedent || 0) }}
        </q-td>
      </template>
    </DataTable>

    <!-- Dialog de création/modification -->
    <q-dialog v-model="dialogVisible" persistent>
      <q-card style="min-width: 500px">
        <q-card-section class="bg-primary text-white row items-center">
          <div class="text-h6">{{ isEditing ? 'Modifier' : 'Nouveau' }} Bordereau</div>
          <q-space />
          <q-btn flat round dense icon="close" v-close-popup />
        </q-card-section>

        <q-card-section>
          <q-form class="q-gutter-md">
            <q-input
              v-model.number="form.numero"
              type="number"
              label="Numéro Bordereau *"
              outlined
              :rules="[(val) => val > 0 || 'Numéro requis']"
            />

            <q-select
              v-model="form.annee"
              :options="exerciceOptions"
              label="Exercice (Année) *"
              outlined
            />

            <q-input v-model="formDateStr" type="date" label="Date de transmission" outlined />

            <q-input
              v-model.number="form.totalPrecedent"
              type="number"
              label="Total précédent"
              outlined
              prefix="FCFA"
            />

            <q-select v-model="form.statut" :options="statutOptions" label="Statut" outlined />

            <q-input v-model="form.observations" label="Observations" outlined type="textarea" />
          </q-form>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Annuler" color="grey" v-close-popup />
          <q-btn label="Enregistrer" color="primary" :loading="saving" @click="onSubmit" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Dialog pour voir les déclarations -->
    <q-dialog v-model="declarationsDialogVisible" maximized>
      <q-card>
        <q-card-section class="bg-primary text-white">
          <div class="row items-center">
            <div class="col">
              <div class="text-h6">
                Déclarations du Bordereau N°
                {{
                  selectedBordereau
                    ? formatNumeroBordereau(selectedBordereau.numero, selectedBordereau.annee)
                    : ''
                }}
              </div>
              <div class="text-caption">
                {{ bordereauDeclarations.length }} déclaration(s) -
                {{ formatMontant(bordereauDeclarationsTotal) }}
              </div>
            </div>
            <q-btn flat round dense icon="close" v-close-popup />
          </div>
        </q-card-section>

        <q-card-section>
          <q-table
            :rows="bordereauDeclarations"
            :columns="declarationsColumns"
            row-key="id"
            :loading="loadingDeclarations"
            :pagination="{ rowsPerPage: 20 }"
          >
            <template v-slot:body-cell-dateEncaissement="props">
              <q-td :props="props">
                {{ formatDate(props.row.dateEncaissement) }}
              </q-td>
            </template>

            <template v-slot:body-cell-montantRecette="props">
              <q-td :props="props">
                {{ formatMontant(props.row.montantRecette || props.row.montant || 0) }}
              </q-td>
            </template>

            <template v-slot:body-cell-statut="props">
              <q-td :props="props">
                <q-chip
                  :color="getStatutDeclarationColor(props.row.statut)"
                  text-color="white"
                  size="sm"
                >
                  {{ props.row.statut }}
                </q-chip>
              </q-td>
            </template>
          </q-table>
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
  type BordereauRecette,
  type Declaration,
  type Taxe,
  DEFAULT_MAIRIE_ID,
} from 'src/database/db';
import FilterBar from 'src/components/FilterBar.vue';
import DataTable from 'src/components/DataTable.vue';
import PageHeader from 'src/components/PageHeader.vue';

const $q = useQuasar();

const bordereaux = ref<BordereauRecette[]>([]);
const taxes = ref<Taxe[]>([]);
const loading = ref(false);
const saving = ref(false);
const dialogVisible = ref(false);
const isEditing = ref(false);
const currentBordereau = ref<BordereauRecette | null>(null);
const search = ref('');
const filterStatut = ref('');
const filterDateDebut = ref('');
const filterDateFin = ref('');
const declarationsDialogVisible = ref(false);
const bordereauDeclarations = ref<Declaration[]>([]);
const loadingDeclarations = ref(false);
const selectedBordereau = ref<BordereauRecette | null>(null);
const formDateStr = ref('');

const currentYear = new Date().getFullYear();
const exerciceOptions = [2023, 2024, 2025, 2026];
const statutOptions = ['ouvert', 'ferme'];

const form = ref<Partial<BordereauRecette>>({
  numero: 1,
  annee: currentYear,
  mairieId: DEFAULT_MAIRIE_ID,
  montantTotal: 0,
  nombreDeclarations: 0,
  totalPrecedent: 0,
  statut: 'ouvert',
  observations: '',
});

const columns = [
  { name: 'id', label: 'ID', field: 'id', align: 'center' as const, sortable: true },
  { name: 'numero', label: 'N°', field: 'numero', align: 'center' as const, sortable: true },
  {
    name: 'annee',
    label: 'Année',
    field: 'annee',
    align: 'center' as const,
    sortable: true,
  },
  {
    name: 'nombreDeclarations',
    label: 'Nb Décl.',
    field: 'nombreDeclarations',
    align: 'center' as const,
    sortable: true,
  },
  {
    name: 'montantTotal',
    label: 'Montant Total',
    field: 'montantTotal',
    align: 'right' as const,
    sortable: true,
  },
  {
    name: 'totalPrecedent',
    label: 'Total Précédent',
    field: 'totalPrecedent',
    align: 'right' as const,
    sortable: true,
  },
  { name: 'statut', label: 'Statut', field: 'statut', align: 'center' as const, sortable: true },
  { name: 'actions', label: 'Actions', field: 'actions', align: 'center' as const },
];

const declarationsColumns = [
  {
    name: 'numeroPiece',
    label: 'N° Pièce',
    field: 'numeroPiece',
    align: 'left' as const,
    sortable: true,
  },
  {
    name: 'exercice',
    label: 'Exercice',
    field: 'exercice',
    align: 'center' as const,
    sortable: true,
  },
  {
    name: 'dateEncaissement',
    label: 'Date Encaissement',
    field: 'dateEncaissement',
    align: 'left' as const,
    sortable: true,
  },
  {
    name: 'nomPartieVersante',
    label: 'Partie Versante',
    field: 'nomPartieVersante',
    align: 'left' as const,
    sortable: true,
  },
  {
    name: 'montantRecette',
    label: 'Montant',
    field: 'montantRecette',
    align: 'right' as const,
    sortable: true,
  },
  {
    name: 'statut',
    label: 'Statut',
    field: 'statut',
    align: 'center' as const,
    sortable: true,
  },
];

const bordereauDeclarationsTotal = computed(() => {
  return bordereauDeclarations.value.reduce(
    (sum, decl) => sum + (decl.montantRecette || decl.montant || 0),
    0,
  );
});

const filteredBordereaux = computed(() => {
  let result = bordereaux.value;

  if (filterStatut.value) {
    result = result.filter((b) => b.statut === filterStatut.value);
  }

  if (filterDateDebut.value) {
    const anneeDebut = new Date(filterDateDebut.value).getFullYear();
    result = result.filter((b) => b.annee >= anneeDebut);
  }

  if (filterDateFin.value) {
    const anneeFin = new Date(filterDateFin.value).getFullYear();
    result = result.filter((b) => b.annee <= anneeFin);
  }

  if (search.value) {
    const searchLower = search.value.toLowerCase();
    result = result.filter((b) => b.numero.toString().includes(searchLower));
  }

  return result;
});

function resetFilters() {
  search.value = '';
  filterStatut.value = '';
  filterDateDebut.value = '';
  filterDateFin.value = '';
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
    ouvert: 'orange',
    ferme: 'green',
  };
  return colors[statut] || 'grey';
}

function getStatutDeclarationColor(statut: string): string {
  const colors: Record<string, string> = {
    brouillon: 'grey',
    validee: 'green',
  };
  return colors[statut] || 'grey';
}

function formatDate(dateValue: Date | undefined): string {
  if (!dateValue) return '-';
  return date.formatDate(dateValue, 'DD/MM/YYYY');
}

async function viewDeclarations(bordereau: BordereauRecette) {
  selectedBordereau.value = bordereau;
  loadingDeclarations.value = true;
  declarationsDialogVisible.value = true;

  try {
    if (!bordereau.id) {
      bordereauDeclarations.value = [];
      return;
    }
    bordereauDeclarations.value = await db.declarations
      .where('bordereauId')
      .equals(bordereau.id)
      .toArray();

    // Trier par date décroissante
    bordereauDeclarations.value.sort((a, b) => {
      const dateA = a.dateEncaissement ? new Date(a.dateEncaissement).getTime() : 0;
      const dateB = b.dateEncaissement ? new Date(b.dateEncaissement).getTime() : 0;
      return dateB - dateA;
    });
  } catch (error) {
    console.error('Erreur:', error);
    $q.notify({ type: 'negative', message: 'Erreur lors du chargement des déclarations' });
  } finally {
    loadingDeclarations.value = false;
  }
}

function formatNumeroBordereau(numero: number, annee: number): string {
  const anneeShort = annee % 100;
  return `${numero}-${anneeShort.toString().padStart(2, '0')}`;
}

async function loadData() {
  loading.value = true;
  try {
    [bordereaux.value, taxes.value] = await Promise.all([
      db.bordereauxRecette.toArray(),
      db.taxes.toArray(),
    ]);

    // Trier par année puis par numéro décroissant
    bordereaux.value.sort((a, b) => {
      if (a.annee !== b.annee) {
        return b.annee - a.annee;
      }
      return b.numero - a.numero;
    });
  } catch (error) {
    console.error('Erreur:', error);
    $q.notify({ type: 'negative', message: 'Erreur lors du chargement' });
  } finally {
    loading.value = false;
  }
}

function openDialog(bordereau?: BordereauRecette) {
  isEditing.value = !!bordereau;
  currentBordereau.value = bordereau || null;

  if (bordereau) {
    form.value = { ...bordereau };
    formDateStr.value = bordereau.dateTransmission
      ? date.formatDate(bordereau.dateTransmission, 'YYYY-MM-DD')
      : '';
  } else {
    // Calculer le prochain numéro
    const bordereauxThisYear = bordereaux.value.filter((b) => b.annee === currentYear);
    const nextNum =
      bordereauxThisYear.length > 0 ? Math.max(...bordereauxThisYear.map((b) => b.numero)) + 1 : 1;

    form.value = {
      numero: nextNum,
      annee: currentYear,
      mairieId: DEFAULT_MAIRIE_ID,
      montantTotal: 0,
      nombreDeclarations: 0,
      totalPrecedent: 0,
      statut: 'ouvert',
      observations: '',
    };
    formDateStr.value = '';
  }
  dialogVisible.value = true;
}

async function onSubmit() {
  if (!form.value.numero || form.value.numero <= 0) {
    $q.notify({ type: 'warning', message: 'Veuillez remplir les champs obligatoires' });
    return;
  }

  saving.value = true;
  try {
    const now = new Date();
    const data: Partial<BordereauRecette> = {
      ...form.value,
      updatedAt: now,
    };

    // Only set dateTransmission if there's a value
    if (formDateStr.value) {
      data.dateTransmission = new Date(formDateStr.value);
    }

    if (isEditing.value && form.value.id) {
      await db.bordereauxRecette.update(form.value.id, data);
      $q.notify({ type: 'positive', message: 'Bordereau modifié' });
    } else {
      data.createdAt = now;
      await db.bordereauxRecette.add(data as BordereauRecette);
      $q.notify({ type: 'positive', message: 'Bordereau créé' });
    }

    dialogVisible.value = false;
    await loadData();
  } catch (error) {
    console.error('Erreur:', error);
    $q.notify({ type: 'negative', message: "Erreur lors de l'enregistrement" });
  } finally {
    saving.value = false;
  }
}

function confirmDelete(bordereau: BordereauRecette) {
  $q.dialog({
    title: 'Confirmation',
    message: `Supprimer le bordereau "${bordereau.numero}" ?`,
    cancel: true,
    persistent: true,
  }).onOk(() => {
    void (async () => {
      try {
        await db.bordereauxRecette.delete(bordereau.id);
        $q.notify({ type: 'positive', message: 'Bordereau supprimé' });
        await loadData();
      } catch (error) {
        console.error('Erreur:', error);
        $q.notify({ type: 'negative', message: 'Erreur lors de la suppression' });
      }
    })();
  });
}

async function downloadBordereauPDF(bordereau: BordereauRecette) {
  try {
    if (!bordereau.id) return;
    const declarationsList = await db.declarations
      .where('bordereauId')
      .equals(bordereau.id)
      .toArray();
    const mairie = await db.mairies.get(bordereau.mairieId);

    const declarationsAvecTaxes = await Promise.all(
      declarationsList.map(async (decl) => {
        const taxe = await db.taxes.get(decl.taxeId);
        return {
          natureRecette: taxe?.libelle || '',
          montant: decl.montantRecette || decl.montant || 0,
          dateEncaissement: decl.dateEncaissement
            ? date.formatDate(decl.dateEncaissement, 'DD/MM/YYYY')
            : '-',
          nomPartieVersante: decl.nomPartieVersante || '',
          article: taxe?.code || '',
          numeroPiece: decl.numeroPiece || '',
          statut: decl.statut || '',
          adresse: decl.adresse || '',
        };
      }),
    );

    // Ouvrir le template et demander l'impression
    const printWindow = window.open(
      '/bordereau_recouvrements_v2.html?bordereauId=' + bordereau.id,
      '_blank',
    );

    if (printWindow) {
      printWindow.addEventListener('load', () => {
        printWindow.postMessage(
          {
            type: 'FILL_AND_PRINT',
            data: {
              mairie: mairie?.nom || "Mairie de Vavoua",
              codeCommune: mairie?.code || '422',
              ville: mairie?.ville || 'Vavoua',
              numeroBordereau: formatNumeroBordereau(bordereau.numero, bordereau.annee),
              annee: bordereau.annee,
              nombreDeclarations: bordereau.nombreDeclarations,
              montantTotal: bordereau.montantTotal,
              totalPrecedent: bordereau.totalPrecedent || 0,
              nouveauTotal: (bordereau.totalPrecedent || 0) + bordereau.montantTotal,
              statut: bordereau.statut,
              declarations: declarationsAvecTaxes,
            },
          },
          '*',
        );
      });
    }
  } catch (error) {
    console.error('Erreur lors du téléchargement du bordereau:', error);
    $q.notify({
      type: 'negative',
      message: 'Erreur lors du téléchargement du bordereau',
    });
  }
}

onMounted(() => {
  void loadData();
});
</script>

<style scoped lang="scss">
.no-print {
  @media print {
    display: none !important;
  }
}
</style>
