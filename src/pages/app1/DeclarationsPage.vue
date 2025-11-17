<template>
  <q-page class="q-pa-md">
    <div class="row q-mb-md justify-between items-center no-print">
      <div class="text-h5">Gestion des Déclarations</div>
      <q-btn color="primary" icon="add" label="Nouvelle Déclaration" @click="openDialog()" />
    </div>

    <!-- Recherche et filtres -->
    <q-card class="q-mb-md no-print">
      <q-card-section>
        <div class="row q-col-gutter-md">
          <div class="col-12 col-sm-4 col-md-3">
            <q-input v-model="search" filled placeholder="Rechercher..." dense clearable>
              <template v-slot:prepend>
                <q-icon name="search" />
              </template>
            </q-input>
          </div>

          <div class="col-12 col-sm-4 col-md-3">
            <q-select
              v-model="filterStatut"
              filled
              dense
              :options="statutOptions"
              label="Statut"
              clearable
            />
          </div>

          <div class="col-12 col-sm-4 col-md-3">
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

          <div class="col-12 col-sm-4 col-md-3">
            <q-input
              v-model.number="filterExercice"
              filled
              dense
              type="number"
              label="Exercice"
              clearable
            />
          </div>

          <div class="col-12 col-sm-4 col-md-3">
            <q-select
              v-model="filterTaxe"
              filled
              dense
              :options="taxeOptions"
              option-value="value"
              option-label="label"
              emit-value
              map-options
              label="Taxe"
              clearable
            />
          </div>

          <div class="col-12 col-sm-4 col-md-3">
            <q-input
              v-model="filterDateDebut"
              filled
              dense
              type="date"
              label="Date début"
              clearable
            />
          </div>

          <div class="col-12 col-sm-4 col-md-3">
            <q-input v-model="filterDateFin" filled dense type="date" label="Date fin" clearable />
          </div>

          <div class="col-12 col-sm-4 col-md-3">
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

    <!-- Table des déclarations -->
    <q-card>
      <q-table
        :rows="filteredDeclarations"
        :columns="columns"
        row-key="id"
        :loading="loading"
        :pagination="{ rowsPerPage: 10 }"
      >
        <template v-slot:body-cell-statut="props">
          <q-td :props="props">
            <q-chip :color="getStatutColor(props.row.statut)" text-color="white" size="sm">
              {{ props.row.statut }}
            </q-chip>
          </q-td>
        </template>

        <template v-slot:body-cell-montantRecette="props">
          <q-td :props="props">
            {{ formatMontant(props.row.montantRecette) }}
          </q-td>
        </template>

        <template v-slot:body-cell-dateEncaissement="props">
          <q-td :props="props">
            {{ formatDate(props.row.dateEncaissement) }}
          </q-td>
        </template>

        <template v-slot:body-cell-actions="props">
          <q-td :props="props" class="no-print">
            <q-btn
              flat
              round
              dense
              icon="print"
              color="primary"
              @click="printDeclaration(props.row)"
            >
              <q-tooltip>Imprimer</q-tooltip>
            </q-btn>
            <q-btn
              flat
              round
              dense
              icon="download"
              color="secondary"
              @click="downloadDeclarationPDF(props.row)"
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
      <q-card style="min-width: 700px">
        <q-card-section class="bg-primary text-white">
          <div class="text-h6">{{ isEditing ? 'Modifier' : 'Nouvelle' }} Déclaration</div>
        </q-card-section>

        <q-card-section>
          <q-form @submit="onSubmit" class="q-gutter-md">
            <div class="row q-col-gutter-md">
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

              <!-- Exercice -->
              <div class="col-12 col-sm-6">
                <q-input
                  v-model.number="form.exercice"
                  filled
                  type="number"
                  label="Exercice (Année) *"
                  :rules="[(val) => !!val || 'Requis']"
                />
              </div>

              <!-- Article N° (Taxe) -->
              <div class="col-12">
                <q-select
                  v-model="form.taxeId"
                  filled
                  :options="taxeOptions"
                  option-value="value"
                  option-label="label"
                  emit-value
                  map-options
                  use-input
                  input-debounce="0"
                  label="Article N° (Taxe) *"
                  :rules="[(val) => !!val || 'Requis']"
                >
                  <template v-slot:no-option>
                    <q-item>
                      <q-item-section class="text-grey">Aucun résultat</q-item-section>
                    </q-item>
                  </template>
                </q-select>
              </div>

              <!-- Numéro de la pièce -->
              <div class="col-12 col-sm-6">
                <q-input
                  v-model="form.numeroPiece"
                  filled
                  label="Numéro de la pièce *"
                  :rules="[(val) => !!val || 'Requis']"
                />
              </div>

              <!-- Nom de la partie versante -->
              <div class="col-12 col-sm-6">
                <q-input
                  v-model="form.nomPartieVersante"
                  filled
                  label="Nom de la partie versante *"
                  :rules="[(val) => !!val || 'Requis']"
                />
              </div>

              <!-- Adresse -->
              <div class="col-12">
                <q-input
                  v-model="form.adresse"
                  filled
                  label="Adresse *"
                  :rules="[(val) => !!val || 'Requis']"
                />
              </div>

              <!-- Date encaissement -->
              <div class="col-12 col-sm-6">
                <q-input
                  v-model="dateStr"
                  filled
                  type="date"
                  label="Date encaissement *"
                  :rules="[(val) => !!val || 'Requis']"
                />
              </div>

              <!-- N° Livre -->
              <div class="col-12 col-sm-6">
                <q-input
                  v-model="form.numeroLivre"
                  filled
                  label="N° Livre *"
                  :rules="[(val) => !!val || 'Requis']"
                />
              </div>

              <!-- N° Encaissement -->
              <div class="col-12 col-sm-6">
                <q-input
                  v-model="form.numeroEncaissement"
                  filled
                  label="N° Encaissement *"
                  :rules="[(val) => !!val || 'Requis']"
                />
              </div>

              <!-- Montant de la recette -->
              <div class="col-12 col-sm-6">
                <q-input
                  v-model.number="form.montantRecette"
                  filled
                  type="number"
                  label="Montant de la recette *"
                  :rules="[(val) => val > 0 || 'Requis']"
                  suffix="FCFA"
                />
              </div>

              <!-- Bordereau -->
              <div class="col-12 col-sm-6">
                <q-select
                  v-model="form.bordereauId"
                  filled
                  :options="bordereauOptions"
                  option-value="value"
                  option-label="label"
                  emit-value
                  map-options
                  label="Bordereau *"
                  :rules="[(val) => !!val || 'Requis']"
                  hint="Sélectionnez un bordereau ouvert"
                >
                  <template v-slot:no-option>
                    <q-item>
                      <q-item-section class="text-grey">
                        Aucun bordereau ouvert disponible
                      </q-item-section>
                    </q-item>
                  </template>
                </q-select>
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

    <!-- Zone d'impression (cachée à l'écran) -->
    <div v-if="printData" class="print-only">
      <div class="print-page">
        <div class="print-header">
          <h1>DÉCLARATION DE RECETTE</h1>
          <p>N° Pièce: {{ printData.numeroPiece }}</p>
          <p>Date Encaissement: {{ formatDate(printData.dateEncaissement) }}</p>
        </div>

        <div class="print-section">
          <h3>Informations</h3>
          <table class="print-table">
            <tr>
              <td><strong>Exercice:</strong></td>
              <td>{{ printData.exercice }}</td>
            </tr>
            <tr>
              <td><strong>Partie Versante:</strong></td>
              <td>{{ printData.nomPartieVersante }}</td>
            </tr>
            <tr>
              <td><strong>Adresse:</strong></td>
              <td>{{ printData.adresse }}</td>
            </tr>
            <tr>
              <td><strong>N° Livre:</strong></td>
              <td>{{ printData.numeroLivre }}</td>
            </tr>
            <tr>
              <td><strong>N° Encaissement:</strong></td>
              <td>{{ printData.numeroEncaissement }}</td>
            </tr>
            <tr>
              <td><strong>Statut:</strong></td>
              <td>{{ printData.statut }}</td>
            </tr>
          </table>
        </div>

        <div class="print-section">
          <h3>Montants</h3>
          <table class="print-table">
            <tr class="total-row">
              <td><strong>Montant de la Recette:</strong></td>
              <td class="text-right">
                <strong>{{ formatMontant(printData.montantRecette) }}</strong>
              </td>
            </tr>
          </table>
        </div>

        <div class="print-section" v-if="printData.observations">
          <h3>Observations</h3>
          <p>{{ printData.observations }}</p>
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
import { db, type Declaration, type Mairie, type Taxe, type Bordereau } from 'src/database/db';
import { useAuthStore } from 'src/stores/auth-store';

const $q = useQuasar();
const authStore = useAuthStore();

const declarations = ref<Declaration[]>([]);
const mairies = ref<Mairie[]>([]);
const taxes = ref<Taxe[]>([]);
const bordereaux = ref<Bordereau[]>([]);
const loading = ref(false);
const saving = ref(false);
const dialogVisible = ref(false);
const isEditing = ref(false);
const search = ref('');
const filterStatut = ref('');
const filterMairie = ref<number | null>(null);
const filterExercice = ref<number | null>(null);
const filterTaxe = ref<number | null>(null);
const filterDateDebut = ref('');
const filterDateFin = ref('');
const printData = ref<Declaration | null>(null);
const dateStr = ref('');

const statutOptions = ['brouillon', 'validee'];

const form = ref<Partial<Declaration>>({
  exercice: new Date().getFullYear(),
  numeroPiece: '',
  nomPartieVersante: '',
  adresse: '',
  dateEncaissement: new Date(),
  numeroLivre: 'T31T',
  numeroEncaissement: '',
  montantRecette: 0,
  statut: 'brouillon',
  observations: '',
});

const columns = [
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
    label: 'Montant Recette',
    field: 'montantRecette',
    align: 'right' as const,
    sortable: true,
  },
  { name: 'statut', label: 'Statut', field: 'statut', align: 'center' as const, sortable: true },
  { name: 'actions', label: 'Actions', field: 'actions', align: 'center' as const },
];

const mairieOptions = computed(() => mairies.value.map((m) => ({ label: m.nom, value: m.id! })));

const taxeOptions = computed(() =>
  taxes.value.map((t) => ({ label: `${t.code} - ${t.libelle}`, value: t.id! })),
);

const bordereauOptions = computed(() => {
  const userMairieId = authStore.currentUser?.mairieId;
  return bordereaux.value
    .filter((b) => b.statut === 'ouvert' && (!userMairieId || b.mairieId === userMairieId))
    .map((b) => {
      const anneeShort = b.annee % 100;
      const numeroFormat = `${b.numero}-${anneeShort.toString().padStart(2, '0')}`;
      return {
        label: `N° ${numeroFormat} - ${b.nombreDeclarations} décl.`,
        value: b.id!,
      };
    });
});

const filteredDeclarations = computed(() => {
  let result = declarations.value;

  if (filterStatut.value) {
    result = result.filter((d) => d.statut === filterStatut.value);
  }

  if (filterMairie.value) {
    result = result.filter((d) => d.mairieId === filterMairie.value);
  }

  if (filterExercice.value) {
    result = result.filter((d) => d.exercice === filterExercice.value);
  }

  if (filterTaxe.value) {
    result = result.filter((d) => d.taxeId === filterTaxe.value);
  }

  if (filterDateDebut.value) {
    const debut = new Date(filterDateDebut.value);
    result = result.filter((d) => new Date(d.dateEncaissement) >= debut);
  }

  if (filterDateFin.value) {
    const fin = new Date(filterDateFin.value);
    fin.setHours(23, 59, 59, 999);
    result = result.filter((d) => new Date(d.dateEncaissement) <= fin);
  }

  if (search.value) {
    const searchLower = search.value.toLowerCase();
    result = result.filter(
      (d) =>
        d.numeroPiece.toLowerCase().includes(searchLower) ||
        d.nomPartieVersante.toLowerCase().includes(searchLower) ||
        d.numeroEncaissement.toLowerCase().includes(searchLower) ||
        (d.adresse && d.adresse.toLowerCase().includes(searchLower)),
    );
  }

  return result;
});

function resetFilters() {
  search.value = '';
  filterStatut.value = '';
  filterMairie.value = null;
  filterExercice.value = null;
  filterTaxe.value = null;
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

function formatDate(dateValue: Date): string {
  return date.formatDate(dateValue, 'DD/MM/YYYY');
}

function getStatutColor(statut: string): string {
  const colors: Record<string, string> = {
    brouillon: 'grey',
    validee: 'green',
  };
  return colors[statut] || 'grey';
}

async function loadData() {
  loading.value = true;
  try {
    [declarations.value, mairies.value, taxes.value, bordereaux.value] = await Promise.all([
      db.declarations.toArray(),
      db.mairies.toArray(),
      db.taxes.toArray(),
      db.bordereaux.toArray(),
    ]);
  } catch (error) {
    console.error('Erreur:', error);
    $q.notify({ type: 'negative', message: 'Erreur lors du chargement' });
  } finally {
    loading.value = false;
  }
}

function openDialog(declaration?: Declaration) {
  isEditing.value = !!declaration;
  if (declaration) {
    form.value = { ...declaration };
    dateStr.value = declaration.dateEncaissement
      ? date.formatDate(declaration.dateEncaissement, 'YYYY-MM-DD')
      : '';
  } else {
    const currentUserMairieId = authStore.currentUser?.mairieId || 0;
    form.value = {
      mairieId: currentUserMairieId,
      exercice: new Date().getFullYear(),
      taxeId: 0,
      numeroPiece: `DEC-${Date.now()}`,
      nomPartieVersante: '',
      adresse: '',
      dateEncaissement: new Date(),
      numeroLivre: 'T31T',
      numeroEncaissement: '',
      montantRecette: 0,
      statut: 'brouillon',
      observations: '',
    };
    dateStr.value = date.formatDate(new Date(), 'YYYY-MM-DD');
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
      dateEncaissement: new Date(dateStr.value),
    };

    let oldBordereauId: number | undefined;
    if (isEditing.value && form.value.id) {
      const oldDeclaration = await db.declarations.get(form.value.id);
      oldBordereauId = oldDeclaration?.bordereauId;
      await db.declarations.update(form.value.id, { ...data, updatedAt: now });
      $q.notify({ type: 'positive', message: 'Déclaration modifiée' });
    } else {
      await db.declarations.add({ ...data, createdAt: now, updatedAt: now } as Declaration);
      $q.notify({ type: 'positive', message: 'Déclaration créée' });
    }

    // Mettre à jour le bordereau si nécessaire
    await updateBordereauCounts(data.bordereauId, oldBordereauId);

    dialogVisible.value = false;
    await loadData();
  } catch (error) {
    console.error('Erreur:', error);
    $q.notify({ type: 'negative', message: "Erreur lors de l'enregistrement" });
  } finally {
    saving.value = false;
  }
}

function confirmDelete(declaration: Declaration) {
  $q.dialog({
    title: 'Confirmation',
    message: `Supprimer la déclaration "${declaration.numeroPiece}" ?`,
    cancel: true,
    persistent: true,
  }).onOk(() => {
    void (async () => {
      try {
        const bordereauId = declaration.bordereauId;
        await db.declarations.delete(declaration.id);
        $q.notify({ type: 'positive', message: 'Déclaration supprimée' });

        // Mettre à jour le bordereau
        if (bordereauId) {
          await updateBordereauCounts(undefined, bordereauId);
        }

        await loadData();
      } catch (error) {
        console.error('Erreur:', error);
        $q.notify({ type: 'negative', message: 'Erreur lors de la suppression' });
      }
    })();
  });
}

function printDeclaration(declaration: Declaration) {
  const mairie = mairies.value.find((m) => m.id === declaration.mairieId);
  const taxe = taxes.value.find((t) => t.id === declaration.taxeId);

  // Ouvrir la page HTML dans une nouvelle fenêtre avec les données
  const printWindow = window.open('/declaration-recettes.html', '_blank');

  if (printWindow) {
    printWindow.addEventListener('load', () => {
      // Envoyer les données à la fenêtre
      printWindow.postMessage(
        {
          type: 'FILL_DECLARATION',
          data: {
            mairie: mairie?.nom || '',
            codeCommune: mairie?.code || '',
            exercice: declaration.exercice,
            article: taxe?.code || '',
            numeroPiece: declaration.numeroPiece,
            nomPartieVersante: declaration.nomPartieVersante,
            adresse: declaration.adresse,
            numeroEncaissement: declaration.numeroEncaissement,
            dateEncaissement: date.formatDate(declaration.dateEncaissement, 'YYYY-MM-DD'),
            natureRecette: taxe?.libelle || '',
            montantRecette: declaration.montantRecette,
            numeroLivre: declaration.numeroLivre,
          },
        },
        '*',
      );
    });
  }
}

function downloadDeclarationPDF(declaration: Declaration) {
  const mairie = mairies.value.find((m) => m.id === declaration.mairieId);
  const taxe = taxes.value.find((t) => t.id === declaration.taxeId);

  // Ouvrir la page HTML dans une nouvelle fenêtre
  const printWindow = window.open('/declaration-recettes.html', '_blank');

  if (printWindow) {
    printWindow.addEventListener('load', () => {
      // Envoyer les données et demander l'impression
      printWindow.postMessage(
        {
          type: 'FILL_AND_PRINT',
          data: {
            mairie: mairie?.nom || '',
            codeCommune: mairie?.code || '',
            exercice: declaration.exercice,
            article: taxe?.code || '',
            numeroPiece: declaration.numeroPiece,
            nomPartieVersante: declaration.nomPartieVersante,
            adresse: declaration.adresse,
            numeroEncaissement: declaration.numeroEncaissement,
            dateEncaissement: date.formatDate(declaration.dateEncaissement, 'YYYY-MM-DD'),
            natureRecette: taxe?.libelle || '',
            montantRecette: declaration.montantRecette,
            numeroLivre: declaration.numeroLivre,
          },
        },
        '*',
      );
    });
  }
}

async function updateBordereauCounts(
  newBordereauId?: number,
  oldBordereauId?: number,
): Promise<void> {
  const bordereauIds = new Set([newBordereauId, oldBordereauId].filter((id) => id != null));

  for (const bordereauId of bordereauIds) {
    if (!bordereauId) continue;

    // Récupérer toutes les déclarations du bordereau
    const declarationsInBordereau = await db.declarations
      .where('bordereauId')
      .equals(bordereauId)
      .toArray();

    const nombreDeclarations = declarationsInBordereau.length;
    const montantTotal = declarationsInBordereau.reduce(
      (sum, decl) => sum + (decl.montantRecette || 0),
      0,
    );

    // Mettre à jour le bordereau
    await db.bordereaux.update(bordereauId, {
      nombreDeclarations,
      montantTotal,
      updatedAt: new Date(),
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
