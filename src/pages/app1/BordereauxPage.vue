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
      v-model:mairie="filterMairie"
      v-model:date-debut="filterDateDebut"
      v-model:date-fin="filterDateFin"
      :statut-options="statutOptions"
      :mairie-options="mairieOptions"
      show-statut
      show-mairie
      show-date-range
      search-placeholder="Rechercher N° bordereau..."
      @reset="resetFilters"
    />

    <!-- Table des bordereaux -->
    <DataTable :rows="filteredBordereaux" :columns="columns" :loading="loading" show-custom-actions>
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

      <template v-slot:body-cell-actions="props">
        <q-td :props="props" class="no-print">
          <q-btn
            flat
            round
            dense
            icon="visibility"
            color="info"
            @click="viewDeclarations(props.row)"
          >
            <q-tooltip>Voir les déclarations</q-tooltip>
          </q-btn>
          <q-btn flat round dense icon="print" color="primary" @click="printBordereau(props.row)">
            <q-tooltip>Imprimer</q-tooltip>
          </q-btn>
          <q-btn
            flat
            round
            dense
            icon="download"
            color="secondary"
            @click="downloadBordereauPDF(props.row)"
          >
            <q-tooltip>Télécharger PDF</q-tooltip>
          </q-btn>
          <q-btn flat round dense icon="edit" color="primary" @click="openDialog(props.row)">
            <q-tooltip>Modifier</q-tooltip>
          </q-btn>
          <q-btn flat round dense icon="delete" color="negative" @click="confirmDelete(props.row)">
            <q-tooltip>Supprimer</q-tooltip>
          </q-btn>
        </q-td>
      </template>
    </DataTable>

    <!-- Dialog de création/modification -->
    <BordereauDialog
      v-model="dialogVisible"
      :bordereau="currentBordereau"
      :is-editing="isEditing"
      :mairie-options="mairieOptions"
      :statut-options="statutOptions"
      :readonly="!authStore.isAdmin"
      :loading="saving"
      :default-mairie-id="authStore.currentUser?.mairieId || 0"
      @submit="onSubmit"
    />

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
import { db, type Bordereau, type Mairie, type Declaration, type Taxe } from 'src/database/db';
import { useAuthStore } from 'src/stores/auth-store';
import FilterBar from 'src/components/FilterBar.vue';
import DataTable from 'src/components/DataTable.vue';
import BordereauDialog from 'src/components/BordereauDialog.vue';

const $q = useQuasar();
const authStore = useAuthStore();

const bordereaux = ref<Bordereau[]>([]);
const mairies = ref<Mairie[]>([]);
const taxes = ref<Taxe[]>([]);
const loading = ref(false);
const saving = ref(false);
const dialogVisible = ref(false);
const isEditing = ref(false);
const currentBordereau = ref<Bordereau | null>(null);
const search = ref('');
const filterStatut = ref('');
const filterMairie = ref<number | null>(null);
const filterDateDebut = ref('');
const filterDateFin = ref('');
const declarationsDialogVisible = ref(false);
const bordereauDeclarations = ref<Declaration[]>([]);
const loadingDeclarations = ref(false);
const selectedBordereau = ref<Bordereau | null>(null);

const statutOptions = ['ouvert', 'ferme'];

const columns = [
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

const mairieOptions = computed(() => mairies.value.map((m) => ({ label: m.nom, value: m.id! })));

const bordereauDeclarationsTotal = computed(() => {
  return bordereauDeclarations.value.reduce((sum, decl) => sum + (decl.montantRecette || 0), 0);
});

const filteredBordereaux = computed(() => {
  let result = bordereaux.value;

  if (filterStatut.value) {
    result = result.filter((b) => b.statut === filterStatut.value);
  }

  if (filterMairie.value) {
    result = result.filter((b) => b.mairieId === filterMairie.value);
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
  filterMairie.value = null;
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

function formatDate(dateValue: Date): string {
  return date.formatDate(dateValue, 'DD/MM/YYYY');
}

async function viewDeclarations(bordereau: Bordereau) {
  selectedBordereau.value = bordereau;
  loadingDeclarations.value = true;
  declarationsDialogVisible.value = true;

  try {
    bordereauDeclarations.value = await db.declarations
      .where('bordereauId')
      .equals(bordereau.id!)
      .toArray();
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
      db.bordereaux.toArray(),
      db.mairies.toArray(),
      db.taxes.toArray(),
    ]);
  } catch (error) {
    console.error('Erreur:', error);
    $q.notify({ type: 'negative', message: 'Erreur lors du chargement' });
  } finally {
    loading.value = false;
  }
}

function openDialog(bordereau?: Bordereau) {
  isEditing.value = !!bordereau;
  currentBordereau.value = bordereau || null;
  dialogVisible.value = true;
}

async function onSubmit(formData: Partial<Bordereau>) {
  saving.value = true;
  try {
    const now = new Date();
    const data = {
      ...formData,
      personnelId: authStore.currentUser?.id ?? 0,
    };

    if (isEditing.value && formData.id) {
      await db.bordereaux.update(formData.id, { ...data, updatedAt: now });
      $q.notify({ type: 'positive', message: 'Bordereau modifié' });
    } else {
      await db.bordereaux.add({ ...data, createdAt: now, updatedAt: now } as Bordereau);
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

function confirmDelete(bordereau: Bordereau) {
  $q.dialog({
    title: 'Confirmation',
    message: `Supprimer le bordereau "${bordereau.numero}" ?`,
    cancel: true,
    persistent: true,
  }).onOk(() => {
    void (async () => {
      try {
        await db.bordereaux.delete(bordereau.id);
        $q.notify({ type: 'positive', message: 'Bordereau supprimé' });
        await loadData();
      } catch (error) {
        console.error('Erreur:', error);
        $q.notify({ type: 'negative', message: 'Erreur lors de la suppression' });
      }
    })();
  });
}

async function printBordereau(bordereau: Bordereau) {
  // Récupérer les déclarations du bordereau
  const declarations = await db.declarations.where('bordereauId').equals(bordereau.id!).toArray();
  const mairie = mairies.value.find((m) => m.id === bordereau.mairieId);

  // Ouvrir la page HTML dans une nouvelle fenêtre
  const printWindow = window.open('/bordereau.html', '_blank');

  if (printWindow) {
    printWindow.addEventListener('load', () => {
      // Envoyer les données à la fenêtre
      printWindow.postMessage(
        {
          type: 'FILL_BORDEREAU',
          data: {
            mairie: mairie?.nom || '',
            numero: formatNumeroBordereau(bordereau.numero, bordereau.annee),
            annee: bordereau.annee,
            mois: bordereau.mois,
            dateTransmission: bordereau.dateTransmission
              ? date.formatDate(bordereau.dateTransmission, 'DD/MM/YYYY')
              : '',
            declarations: declarations.map((d) => {
              const taxe = taxes.value.find((t) => t.id === d.taxeId);
              return {
                nomContribuable: d.nomPartieVersante,
                montant: d.montantRecette,
                taxe: taxe?.libelle || '',
                dateEncaissement: date.formatDate(d.dateEncaissement, 'DD/MM/YYYY'),
              };
            }),
            montantTotal: bordereau.montantTotal,
          },
        },
        '*',
      );
    });
  }
}

async function downloadBordereauPDF(bordereau: Bordereau) {
  // Récupérer les déclarations du bordereau
  const declarations = await db.declarations.where('bordereauId').equals(bordereau.id!).toArray();
  const mairie = mairies.value.find((m) => m.id === bordereau.mairieId);

  // Ouvrir la page HTML dans une nouvelle fenêtre
  const printWindow = window.open('/bordereau.html', '_blank');

  if (printWindow) {
    printWindow.addEventListener('load', () => {
      // Envoyer les données et demander l'impression
      printWindow.postMessage(
        {
          type: 'FILL_AND_PRINT',
          data: {
            mairie: mairie?.nom || '',
            numero: formatNumeroBordereau(bordereau.numero, bordereau.annee),
            annee: bordereau.annee,
            mois: bordereau.mois,
            dateTransmission: bordereau.dateTransmission
              ? date.formatDate(bordereau.dateTransmission, 'DD/MM/YYYY')
              : '',
            declarations: declarations.map((d) => {
              const taxe = taxes.value.find((t) => t.id === d.taxeId);
              return {
                nomContribuable: d.nomPartieVersante,
                montant: d.montantRecette,
                taxe: taxe?.libelle || '',
                dateEncaissement: date.formatDate(d.dateEncaissement, 'DD/MM/YYYY'),
              };
            }),
            montantTotal: bordereau.montantTotal,
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
.no-print {
  @media print {
    display: none !important;
  }
}
</style>
