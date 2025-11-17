<template>
  <q-page class="q-pa-md">
    <div class="row q-mb-md justify-between items-center no-print">
      <div class="text-h5">Gestion des Bordereaux</div>
      <q-btn color="primary" icon="add" label="Nouveau Bordereau" @click="openDialog()" />
    </div>

    <!-- Recherche et filtres -->
    <q-card class="q-mb-md no-print">
      <q-card-section>
        <div class="row q-col-gutter-md">
          <div class="col-12 col-sm-6 col-md-3">
            <q-input
              v-model="search"
              filled
              placeholder="Rechercher N° bordereau..."
              dense
              clearable
            >
              <template v-slot:prepend>
                <q-icon name="search" />
              </template>
            </q-input>
          </div>

          <div class="col-12 col-sm-6 col-md-3">
            <q-select
              v-model="filterStatut"
              filled
              dense
              :options="statutOptions"
              label="Statut"
              clearable
            />
          </div>

          <div class="col-12 col-sm-6 col-md-3">
            <q-select
              v-model="filterMairie"
              filled
              dense
              :options="mairieOptions"
              option-value="value"
              option-label="label"
              emit-value
              map-options
              label="Mairie"
              clearable
            />
          </div>

          <div class="col-12 col-sm-6 col-md-3">
            <q-input
              v-model="filterDateDebut"
              filled
              dense
              type="date"
              label="Date début"
              clearable
            />
          </div>

          <div class="col-12 col-sm-6 col-md-3">
            <q-input v-model="filterDateFin" filled dense type="date" label="Date fin" clearable />
          </div>

          <div class="col-12 col-sm-6 col-md-3">
            <q-btn
              flat
              color="primary"
              icon="clear"
              label="Réinitialiser"
              @click="resetFilters"
              dense
            />
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Table des bordereaux -->
    <q-card>
      <q-table
        :rows="filteredBordereaux"
        :columns="columns"
        row-key="id"
        :loading="loading"
        :pagination="{ rowsPerPage: 10 }"
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
            <q-btn
              flat
              round
              dense
              icon="delete"
              color="negative"
              @click="confirmDelete(props.row)"
            >
              <q-tooltip>Supprimer</q-tooltip>
            </q-btn>
          </q-td>
        </template>
      </q-table>
    </q-card>

    <!-- Dialog de création/modification -->
    <q-dialog v-model="dialogVisible" persistent>
      <q-card style="min-width: 600px">
        <q-card-section class="bg-primary text-white">
          <div class="text-h6">{{ isEditing ? 'Modifier' : 'Nouveau' }} Bordereau</div>
        </q-card-section>

        <q-card-section>
          <q-form @submit="onSubmit" class="q-gutter-md">
            <div class="row q-col-gutter-md">
              <!-- Numéro Bordereau -->
              <div class="col-12 col-sm-6">
                <q-input
                  v-model="numeroInput"
                  filled
                  type="number"
                  label="Numéro *"
                  :rules="[(val) => val > 0 || 'Requis']"
                  placeholder="1"
                  hint="Numéro séquentiel du bordereau"
                  @update:model-value="updateNumeroBordereauFromNumero"
                />
              </div>

              <!-- Année -->
              <div class="col-12 col-sm-6">
                <q-input
                  v-model.number="form.annee"
                  filled
                  type="number"
                  label="Année *"
                  :rules="[(val) => val >= 2000 || 'Requis']"
                  hint="Année du bordereau"
                  @update:model-value="updateNumeroBordereauFromAnnee"
                />
              </div>

              <!-- Mairie -->
              <div class="col-12 col-sm-6">
                <q-select
                  v-model="form.mairieId"
                  filled
                  :options="mairieOptions"
                  option-value="value"
                  option-label="label"
                  emit-value
                  map-options
                  label="Mairie *"
                  :rules="[(val) => !!val || 'Requis']"
                  :readonly="!authStore.isAdmin"
                />
              </div>

              <!-- Statut -->
              <div class="col-12 col-sm-6">
                <q-select
                  v-model="form.statut"
                  filled
                  :options="statutOptions"
                  label="Statut *"
                  :rules="[(val) => !!val || 'Requis']"
                />
              </div>

              <!-- Montant Total (readonly) -->
              <div class="col-12 col-sm-6">
                <q-input
                  v-model.number="form.montantTotal"
                  filled
                  type="number"
                  label="Montant Total"
                  readonly
                  suffix="FCFA"
                  hint="Calculé automatiquement"
                />
              </div>

              <!-- Nombre de Déclarations (readonly) -->
              <div class="col-12 col-sm-6">
                <q-input
                  v-model.number="form.nombreDeclarations"
                  filled
                  type="number"
                  label="Nombre de Déclarations"
                  readonly
                  hint="Calculé automatiquement"
                />
              </div>

              <!-- Observations -->
              <div class="col-12">
                <q-input
                  v-model="form.observations"
                  filled
                  type="textarea"
                  label="Observations"
                  rows="3"
                />
              </div>
            </div>
          </q-form>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Annuler" color="grey" v-close-popup />
          <q-btn label="Enregistrer" color="primary" @click="onSubmit" :loading="saving" />
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

    <!-- Zone d'impression (cachée à l'écran) -->
    <div v-if="printData" class="print-only">
      <div class="print-page">
        <div class="print-header">
          <h1>BORDEREAU DE RECETTES</h1>
          <p>N°: {{ formatNumeroBordereau(printData.numero, printData.annee) }}</p>
        </div>

        <div class="print-section">
          <h3>Informations Générales</h3>
          <table class="print-table">
            <tr>
              <td><strong>Année:</strong></td>
              <td>{{ printData.annee }}</td>
            </tr>
            <tr>
              <td><strong>Statut:</strong></td>
              <td>{{ printData.statut }}</td>
            </tr>
            <tr>
              <td><strong>Nombre de déclarations:</strong></td>
              <td>{{ printData.nombreDeclarations }}</td>
            </tr>
          </table>
        </div>

        <div class="print-section">
          <h3>Récapitulatif Financier</h3>
          <table class="print-table">
            <tr class="total-row">
              <td><strong>Montant Total:</strong></td>
              <td class="text-right">
                <strong>{{ formatMontant(printData.montantTotal) }}</strong>
              </td>
            </tr>
          </table>
        </div>

        <div class="print-section" v-if="printData.observations">
          <h3>Observations</h3>
          <p>{{ printData.observations }}</p>
        </div>

        <div class="print-signatures">
          <div class="signature-block">
            <p>Le Trésorier</p>
            <div class="signature-line"></div>
          </div>
          <div class="signature-block">
            <p>Le Maire</p>
            <div class="signature-line"></div>
          </div>
        </div>

        <div class="print-footer">
          <p>Généré le {{ new Date().toLocaleDateString('fr-FR') }}</p>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useQuasar, date } from 'quasar';
import { db, type Bordereau, type Mairie, type Declaration, type Taxe } from 'src/database/db';
import { useAuthStore } from 'src/stores/auth-store';

const $q = useQuasar();
const authStore = useAuthStore();

const bordereaux = ref<Bordereau[]>([]);
const mairies = ref<Mairie[]>([]);
const taxes = ref<Taxe[]>([]);
const loading = ref(false);
const saving = ref(false);
const dialogVisible = ref(false);
const isEditing = ref(false);
const search = ref('');
const filterStatut = ref('');
const filterMairie = ref<number | null>(null);
const filterDateDebut = ref('');
const filterDateFin = ref('');
const printData = ref<Bordereau | null>(null);
const numeroInput = ref(1);
const declarationsDialogVisible = ref(false);
const bordereauDeclarations = ref<Declaration[]>([]);
const loadingDeclarations = ref(false);
const selectedBordereau = ref<Bordereau | null>(null);

const statutOptions = ['ouvert', 'ferme'];

const form = ref<Partial<Bordereau>>({
  numero: 1,
  annee: new Date().getFullYear(),
  montantTotal: 0,
  nombreDeclarations: 0,
  statut: 'ouvert',
  observations: '',
});

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

function updateNumeroBordereauFromNumero() {
  form.value.numero = numeroInput.value || 1;
}

function updateNumeroBordereauFromAnnee() {
  // La mise à jour de l'année est automatique via v-model
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
  if (bordereau) {
    form.value = { ...bordereau };
    numeroInput.value = bordereau.numero;
  } else {
    const currentUserMairieId = authStore.currentUser?.mairieId || 0;
    const currentYear = new Date().getFullYear();
    form.value = {
      numero: 1,
      annee: currentYear,
      mairieId: currentUserMairieId,
      montantTotal: 0,
      nombreDeclarations: 0,
      statut: 'ouvert',
      observations: '',
    };
    numeroInput.value = 1;
  }
  dialogVisible.value = true;
}

async function onSubmit() {
  saving.value = true;
  try {
    const now = new Date();
    const data = {
      ...form.value,
      personnelId: authStore.currentUser?.id ?? 0,
    };

    if (isEditing.value && form.value.id) {
      await db.bordereaux.update(form.value.id, { ...data, updatedAt: now });
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
  const printWindow = window.open('/bordereau-municipale.html', '_blank');

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
  const printWindow = window.open('/bordereau-municipale.html', '_blank');

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
@media print {
  .no-print {
    display: none !important;
  }

  .print-only {
    display: block !important;
  }

  .print-page {
    width: 100%;
    padding: 20mm;
  }

  .print-header {
    text-align: center;
    margin-bottom: 30px;

    h1 {
      font-size: 24pt;
      margin-bottom: 10px;
    }
  }

  .print-section {
    margin-bottom: 25px;

    h3 {
      font-size: 14pt;
      margin-bottom: 10px;
      border-bottom: 2px solid #333;
      padding-bottom: 5px;
    }
  }

  .print-table {
    width: 100%;
    border-collapse: collapse;

    td {
      padding: 8px;
      border-bottom: 1px solid #ddd;
    }

    .text-right {
      text-align: right;
    }

    .total-row {
      font-size: 12pt;
      border-top: 2px solid #333;
    }
  }

  .print-signatures {
    display: flex;
    justify-content: space-around;
    margin-top: 60px;

    .signature-block {
      text-align: center;
      width: 200px;

      p {
        margin-bottom: 50px;
        font-weight: bold;
      }

      .signature-line {
        border-bottom: 1px solid #333;
      }
    }
  }

  .print-footer {
    margin-top: 40px;
    text-align: center;
    font-size: 9pt;
    color: #666;
  }
}

@media screen {
  .print-only {
    display: none;
  }
}
</style>
