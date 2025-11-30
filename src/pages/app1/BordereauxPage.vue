<template>
  <q-page class="q-pa-md">
    <div class="row q-mb-md justify-between items-center no-print">
      <div class="text-h5">Gestion des Bordereaux</div>
      <q-btn color="primary" icon="add" label="Nouveau Bordereau" @click="openDialog()" />
    </div>

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
      show-print
      show-download
      @view="viewDeclarations"
      @print="printBordereau"
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
    <BordereauDialog
      v-model="dialogVisible"
      :bordereau="currentBordereau"
      :is-editing="isEditing"
      :statut-options="statutOptions"
      :readonly="!authStore.isAdmin"
      :loading="saving"
      :next-numero="nextNumeroBordereau"
      @submit="onSubmit"
    />

    <!-- Dialog pour voir les déclarations -->
    <q-dialog v-model="declarationsDialogVisible" maximized>
      <q-card>
        <q-card-section class="accent-left">
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
                {{ formatMontant(props.row.montantRecette) }}
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
  type Mairie,
  type Declaration,
  type Taxe,
} from 'src/database/db';
import { useAuthStore } from 'src/stores/auth-store';
import FilterBar from 'src/components/FilterBar.vue';
import DataTable from 'src/components/DataTable.vue';
import BordereauDialog from 'src/components/BordereauDialog.vue';

const $q = useQuasar();
const authStore = useAuthStore();

const bordereaux = ref<BordereauRecette[]>([]);
const mairies = ref<Mairie[]>([]);
const taxes = ref<Taxe[]>([]);
const loading = ref(false);
const nextNumeroBordereau = ref<number>(1);
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

const statutOptions = ['ouvert', 'ferme'];

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
  return bordereauDeclarations.value.reduce((sum, decl) => sum + (decl.montantRecette || 0), 0);
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

async function calculateNextNumeroBordereau() {
  const currentYear = new Date().getFullYear();
  const bordereauxThisYear = await db.bordereauxRecette
    .where('annee')
    .equals(currentYear)
    .toArray();

  if (bordereauxThisYear.length === 0) {
    nextNumeroBordereau.value = 1;
  } else {
    const maxNumero = Math.max(...bordereauxThisYear.map((b) => b.numero));
    nextNumeroBordereau.value = maxNumero + 1;
  }
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

function formatDate(dateValue: Date): string {
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

    // Trier les déclarations par date d'encaissement décroissante (plus récent en premier)
    bordereauDeclarations.value.sort((a, b) => {
      const dateA = new Date(a.dateEncaissement).getTime();
      const dateB = new Date(b.dateEncaissement).getTime();
      return dateB - dateA; // Ordre décroissant
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
    [bordereaux.value, mairies.value, taxes.value] = await Promise.all([
      db.bordereauxRecette.toArray(),
      db.mairies.toArray(),
      db.taxes.toArray(),
    ]);

    // Trier les bordereaux par année puis par numéro, ordre décroissant (plus récent en premier)
    bordereaux.value.sort((a, b) => {
      // D'abord par année
      if (a.annee !== b.annee) {
        return b.annee - a.annee; // Année décroissante
      }
      // Puis par numéro si même année
      return b.numero - a.numero; // Numéro décroissant
    });
  } catch (error) {
    console.error('Erreur:', error);
    $q.notify({ type: 'negative', message: 'Erreur lors du chargement' });
  } finally {
    loading.value = false;
  }
}

async function openDialog(bordereau?: BordereauRecette) {
  isEditing.value = !!bordereau;
  currentBordereau.value = bordereau || null;
  if (!bordereau) {
    await calculateNextNumeroBordereau();
  }
  dialogVisible.value = true;
}

async function onSubmit(formData: Partial<BordereauRecette>) {
  saving.value = true;
  try {
    const now = new Date();
    const data = {
      ...formData,
      personnelId: authStore.currentUser?.id ?? 0,
    };

    if (isEditing.value && formData.id) {
      await db.bordereauxRecette.update(formData.id, { ...data, updatedAt: now });
      $q.notify({ type: 'positive', message: 'Bordereau modifié' });
    } else {
      await db.bordereauxRecette.add({
        ...data,
        createdAt: now,
        updatedAt: now,
      });
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

async function printBordereau(bordereau: BordereauRecette) {
  try {
    // Récupérer la mairie
    const mairie = mairies.value.find((m) => m.id === bordereau.mairieId);

    // Récupérer toutes les déclarations du bordereau
    if (!bordereau.id) return;
    const declarations = await db.declarations.where('bordereauId').equals(bordereau.id).toArray();

    // Récupérer les taxes pour chaque déclaration
    const declarationsAvecTaxes = await Promise.all(
      declarations.map(async (decl) => {
        const taxe = await db.taxes.get(decl.taxeId);
        return {
          natureRecette: taxe?.libelle || '',
          montant: decl.montantRecette,
          dateEncaissement: date.formatDate(decl.dateEncaissement, 'DD/MM/YYYY'),
          nomPartieVersante: decl.nomPartieVersante,
          article: taxe?.code || '',
        };
      }),
    );

    // Ouvrir la page HTML
    const printWindow = window.open(
      '/bordereau_recouvrements_v2.html?bordereauId=' + bordereau.id,
      '_blank',
    );

    if (printWindow) {
      printWindow.addEventListener('load', () => {
        // Envoyer les données via postMessage
        printWindow.postMessage(
          {
            type: 'FILL_BORDEREAU',
            data: {
              mairie: mairie?.nom || '',
              ville: mairie?.ville || 'Azaguié',
              codeCommune: mairie?.code || 422,
              exercice: bordereau.annee || new Date().getFullYear(),
              numeroBordereau: formatNumeroBordereau(bordereau.numero, bordereau.annee),
              numeroSimple: bordereau.numero,
              dateBordereau: bordereau.dateTransmission
                ? date.formatDate(bordereau.dateTransmission, 'DD/MM/YYYY')
                : date.formatDate(new Date(), 'DD/MM/YYYY'),
              montantTotal: bordereau.montantTotal || 0,
              totalPrecedent: bordereau.totalPrecedent || 0,
              declarations: declarationsAvecTaxes,
            },
          },
          '*',
        );
      });
    }
  } catch (error) {
    console.error("Erreur lors de l'impression du bordereau:", error);
    $q.notify({
      type: 'negative',
      message: "Erreur lors de l'impression du bordereau",
    });
  }
}

async function downloadBordereauPDF(bordereau: BordereauRecette) {
  try {
    // Récupérer la mairie
    const mairie = mairies.value.find((m) => m.id === bordereau.mairieId);

    // Récupérer toutes les déclarations du bordereau
    if (!bordereau.id) return;
    const declarations = await db.declarations.where('bordereauId').equals(bordereau.id).toArray();

    // Récupérer les taxes pour chaque déclaration
    const declarationsAvecTaxes = await Promise.all(
      declarations.map(async (decl) => {
        const taxe = await db.taxes.get(decl.taxeId);
        return {
          natureRecette: taxe?.libelle || '',
          montant: decl.montantRecette,
          dateEncaissement: date.formatDate(decl.dateEncaissement, 'DD/MM/YYYY'),
          nomPartieVersante: decl.nomPartieVersante,
          article: taxe?.code || '',
        };
      }),
    );

    // Ouvrir la page HTML et lancer l'impression automatiquement
    const printWindow = window.open(
      '/bordereau_recouvrements_v2.html?bordereauId=' + bordereau.id,
      '_blank',
    );

    if (printWindow) {
      printWindow.addEventListener('load', () => {
        // Envoyer les données et demander l'impression
        printWindow.postMessage(
          {
            type: 'FILL_AND_PRINT',
            data: {
              mairie: mairie?.nom || '',
              ville: mairie?.ville || 'Azaguié',
              codeCommune: mairie?.code || 422,
              exercice: bordereau.annee || new Date().getFullYear(),
              numeroBordereau: formatNumeroBordereau(bordereau.numero, bordereau.annee),
              numeroSimple: bordereau.numero,
              dateBordereau: bordereau.dateTransmission
                ? date.formatDate(bordereau.dateTransmission, 'DD/MM/YYYY')
                : date.formatDate(new Date(), 'DD/MM/YYYY'),
              montantTotal: bordereau.montantTotal || 0,
              declarations: declarationsAvecTaxes,
            },
          },
          '*',
        );
      });
    }
  } catch (error) {
    console.error('Erreur lors du téléchargement PDF:', error);
    $q.notify({
      type: 'negative',
      message: 'Erreur lors du téléchargement PDF',
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
