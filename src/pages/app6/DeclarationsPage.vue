<template>
  <q-page class="q-pa-md">
    <div class="row q-mb-md justify-between items-center no-print">
      <div class="text-h5">Gestion des Déclarations de Recettes</div>
      <q-btn color="primary" icon="add" label="Nouvelle Déclaration" @click="openDialog()" />
    </div>

    <!-- Recherche et filtres -->
    <FilterBar
      v-model:search="search"
      v-model:statut="filterStatut"
      v-model:exercice="filterExercice"
      v-model:taxe="filterTaxe"
      v-model:date-debut="filterDateDebut"
      v-model:date-fin="filterDateFin"
      :statut-options="statutOptions"
      :taxe-options="taxeOptions"
      show-statut
      show-exercice
      show-taxe
      show-date-range
      search-placeholder="Rechercher..."
      @reset="resetFilters"
    >
      <template v-slot:custom-filters>
        <div class="col-12 col-sm-4 col-md-3">
          <q-input v-model="filterBordereau" filled dense label="N° Bordereau" clearable />
        </div>
      </template>
    </FilterBar>

    <!-- Table des déclarations -->
    <DataTable
      :rows="filteredDeclarations"
      :columns="columns"
      :loading="loading"
      show-print
      show-download
      @print="printDeclaration"
      @download="downloadDeclarationPDF"
      @edit="openDialog"
      @delete="confirmDelete"
    >
      <template v-slot:body-cell-bordereauNumero="props">
        <q-td :props="props">
          {{ getBordereauNumero(props.row.bordereauId) }}
        </q-td>
      </template>

      <template v-slot:body-cell-statut="props">
        <q-td :props="props">
          <q-chip :color="getStatutColor(props.row.statut)" text-color="white" size="sm">
            {{ props.row.statut }}
          </q-chip>
        </q-td>
      </template>

      <template v-slot:body-cell-montantRecette="props">
        <q-td :props="props">
          {{ formatMontant(props.row.montantRecette || props.row.montant || 0) }}
        </q-td>
      </template>

      <template v-slot:body-cell-dateEncaissement="props">
        <q-td :props="props">
          {{ formatDate(props.row.dateEncaissement) }}
        </q-td>
      </template>
    </DataTable>

    <!-- Dialog de création/modification -->
    <q-dialog v-model="dialogVisible" persistent>
      <q-card style="min-width: 600px; max-width: 90vw">
        <q-card-section class="bg-primary text-white row items-center">
          <div class="text-h6">{{ isEditing ? 'Modifier' : 'Nouvelle' }} Déclaration</div>
          <q-space />
          <q-btn flat round dense icon="close" v-close-popup />
        </q-card-section>

        <q-card-section>
          <q-form class="row q-col-gutter-md">
            <div class="col-12 col-md-6">
              <q-input
                v-model="form.numeroPiece"
                label="N° Pièce *"
                outlined
                :rules="[(val) => !!val || 'Requis']"
              />
            </div>

            <div class="col-12 col-md-6">
              <q-select
                v-model="form.exercice"
                :options="exerciceOptions"
                label="Exercice (Année) *"
                outlined
              />
            </div>

            <div class="col-12 col-md-6">
              <q-select
                v-model="form.taxeId"
                :options="taxeSelectOptions"
                label="Taxe / Nature de recette *"
                outlined
                emit-value
                map-options
              />
            </div>

            <div class="col-12 col-md-6">
              <q-select
                v-model="form.bordereauId"
                :options="bordereauSelectOptions"
                label="Bordereau"
                outlined
                emit-value
                map-options
                clearable
              />
            </div>

            <div class="col-12 col-md-6">
              <q-input
                v-model="form.nomPartieVersante"
                label="Nom Partie Versante *"
                outlined
                :rules="[(val) => !!val || 'Requis']"
              />
            </div>

            <div class="col-12 col-md-6">
              <q-input v-model="form.adresse" label="Adresse" outlined />
            </div>

            <div class="col-12 col-md-6">
              <q-input
                v-model="formDateStr"
                type="date"
                label="Date Encaissement *"
                outlined
                :rules="[(val) => !!val || 'Requis']"
              />
            </div>

            <div class="col-12 col-md-6">
              <q-input
                v-model.number="form.montantRecette"
                type="number"
                label="Montant *"
                outlined
                prefix="FCFA"
                :rules="[(val) => val > 0 || 'Montant requis']"
              />
            </div>

            <div class="col-12 col-md-6">
              <q-input v-model="form.numeroEncaissement" label="N° Encaissement" outlined />
            </div>

            <div class="col-12 col-md-6">
              <q-select v-model="form.statut" :options="statutOptions" label="Statut" outlined />
            </div>

            <div class="col-12">
              <q-input
                v-model="form.observations"
                label="Observations"
                outlined
                type="textarea"
                rows="2"
              />
            </div>
          </q-form>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Annuler" color="grey" v-close-popup />
          <q-btn label="Enregistrer" color="primary" :loading="saving" @click="onSubmit" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useQuasar, date } from 'quasar';
import {
  db,
  type Declaration,
  type Mairie,
  type Taxe,
  type BordereauRecette,
  DEFAULT_MAIRIE_ID,
} from 'src/database/db';
import FilterBar from 'src/components/FilterBar.vue';
import DataTable from 'src/components/DataTable.vue';

const $q = useQuasar();

const declarations = ref<Declaration[]>([]);
const mairies = ref<Mairie[]>([]);
const taxes = ref<Taxe[]>([]);
const bordereaux = ref<BordereauRecette[]>([]);
const loading = ref(false);
const saving = ref(false);
const dialogVisible = ref(false);
const isEditing = ref(false);
const currentDeclaration = ref<Declaration | null>(null);
const search = ref('');
const filterStatut = ref('');
const filterExercice = ref<number | null>(null);
const filterTaxe = ref<number | null>(null);
const filterDateDebut = ref('');
const filterDateFin = ref('');
const filterBordereau = ref('');
const formDateStr = ref('');

const currentYear = new Date().getFullYear();
const exerciceOptions = [2023, 2024, 2025, 2026];
const statutOptions = ['brouillon', 'validee'];

const form = ref<Partial<Declaration>>({
  numeroPiece: '',
  exercice: currentYear,
  taxeId: 0,
  nomPartieVersante: '',
  adresse: '',
  montantRecette: 0,
  numeroEncaissement: '',
  statut: 'brouillon',
  observations: '',
  mairieId: DEFAULT_MAIRIE_ID,
});

const columns = [
  { name: 'id', label: 'ID', field: 'id', align: 'center' as const, sortable: true },
  {
    name: 'numeroPiece',
    label: 'N° Pièce',
    field: 'numeroPiece',
    align: 'left' as const,
    sortable: true,
  },
  {
    name: 'bordereauNumero',
    label: 'N° Bordereau',
    field: 'bordereauId',
    align: 'center' as const,
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

const taxeOptions = computed(() =>
  taxes.value.map((t) => ({ label: `${t.code} - ${t.libelle}`, value: t.id! })),
);

const taxeSelectOptions = computed(() =>
  taxes.value.map((t) => ({ label: `${t.code} - ${t.libelle}`, value: t.id! })),
);

const bordereauSelectOptions = computed(() => {
  return bordereaux.value
    .filter((b) => b.statut === 'ouvert')
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

  if (filterExercice.value) {
    result = result.filter((d) => d.exercice === filterExercice.value);
  }

  if (filterTaxe.value) {
    result = result.filter((d) => d.taxeId === filterTaxe.value);
  }

  if (filterBordereau.value) {
    const searchBordereau = filterBordereau.value.toLowerCase();
    result = result.filter((d) => {
      const bordereauNum = getBordereauNumero(d.bordereauId).toLowerCase();
      return bordereauNum.includes(searchBordereau);
    });
  }

  if (filterDateDebut.value) {
    const debut = new Date(filterDateDebut.value);
    result = result.filter((d) => d.dateEncaissement && new Date(d.dateEncaissement) >= debut);
  }

  if (filterDateFin.value) {
    const fin = new Date(filterDateFin.value);
    fin.setHours(23, 59, 59, 999);
    result = result.filter((d) => d.dateEncaissement && new Date(d.dateEncaissement) <= fin);
  }

  if (search.value) {
    const searchLower = search.value.toLowerCase();
    result = result.filter(
      (d) =>
        String(d.numeroPiece).toLowerCase().includes(searchLower) ||
        (d.nomPartieVersante && d.nomPartieVersante.toLowerCase().includes(searchLower)) ||
        (d.numeroEncaissement && d.numeroEncaissement.toLowerCase().includes(searchLower)) ||
        (d.adresse && d.adresse.toLowerCase().includes(searchLower)),
    );
  }

  return result;
});

function resetFilters() {
  search.value = '';
  filterStatut.value = '';
  filterExercice.value = null;
  filterTaxe.value = null;
  filterBordereau.value = '';
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

function formatDate(dateValue: Date | undefined): string {
  if (!dateValue) return '-';
  return date.formatDate(dateValue, 'DD/MM/YYYY');
}

function getStatutColor(statut: string): string {
  const colors: Record<string, string> = {
    brouillon: 'grey',
    validee: 'green',
  };
  return colors[statut] || 'grey';
}

function getBordereauNumero(bordereauId?: number): string {
  if (!bordereauId) return '-';
  const bordereau = bordereaux.value.find((b) => b.id === bordereauId);
  if (!bordereau) return '-';
  const anneeShort = bordereau.annee % 100;
  return `${bordereau.numero}-${anneeShort.toString().padStart(2, '0')}`;
}

async function loadData() {
  loading.value = true;
  try {
    [declarations.value, mairies.value, taxes.value, bordereaux.value] = await Promise.all([
      db.declarations.toArray(),
      db.mairies.toArray(),
      db.taxes.toArray(),
      db.bordereauxRecette.toArray(),
    ]);

    // Trier les déclarations par date d'encaissement décroissante
    declarations.value.sort((a, b) => {
      const dateA = a.dateEncaissement ? new Date(a.dateEncaissement).getTime() : 0;
      const dateB = b.dateEncaissement ? new Date(b.dateEncaissement).getTime() : 0;
      return dateB - dateA;
    });
  } catch (error) {
    console.error('Erreur:', error);
    $q.notify({ type: 'negative', message: 'Erreur lors du chargement' });
  } finally {
    loading.value = false;
  }
}

function openDialog(declaration?: Declaration) {
  isEditing.value = !!declaration;
  currentDeclaration.value = declaration || null;

  if (declaration) {
    form.value = { ...declaration };
    formDateStr.value = declaration.dateEncaissement
      ? date.formatDate(declaration.dateEncaissement, 'YYYY-MM-DD')
      : '';
  } else {
    // Calculer le prochain numéro de pièce
    const declarationsThisYear = declarations.value.filter((d) => d.exercice === currentYear);
    const nextNum = declarationsThisYear.length + 1;

    form.value = {
      numeroPiece: String(nextNum).padStart(4, '0'),
      exercice: currentYear,
      taxeId: taxes.value[0]?.id || 0,
      nomPartieVersante: '',
      adresse: mairies.value[0]?.ville || 'Azaguié',
      montantRecette: 0,
      numeroEncaissement: '',
      statut: 'brouillon',
      observations: '',
      mairieId: DEFAULT_MAIRIE_ID,
    };
    formDateStr.value = date.formatDate(new Date(), 'YYYY-MM-DD');
  }
  dialogVisible.value = true;
}

async function onSubmit() {
  if (
    !form.value.numeroPiece ||
    !form.value.taxeId ||
    !formDateStr.value ||
    !form.value.montantRecette ||
    form.value.montantRecette <= 0
  ) {
    $q.notify({ type: 'warning', message: 'Veuillez remplir tous les champs obligatoires' });
    return;
  }

  saving.value = true;
  try {
    const now = new Date();
    const data: Partial<Declaration> = {
      ...form.value,
      dateEncaissement: new Date(formDateStr.value),
      updatedAt: now,
    };

    let oldBordereauId: number | undefined;
    if (isEditing.value && form.value.id) {
      const oldDeclaration = await db.declarations.get(form.value.id);
      oldBordereauId = oldDeclaration?.bordereauId;
      await db.declarations.update(form.value.id, data);
      $q.notify({ type: 'positive', message: 'Déclaration modifiée' });
    } else {
      data.createdAt = now;
      await db.declarations.add(data as Declaration);
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

  // Ouvrir le nouveau template HTML
  const printWindow = window.open(
    '/declaration_recette_new.html?declarationId=' + declaration.id,
    '_blank',
  );

  if (printWindow) {
    printWindow.addEventListener('load', () => {
      // Envoyer toutes les données nécessaires
      printWindow.postMessage(
        {
          type: 'FILL_DECLARATION',
          data: {
            mairie: mairie?.nom || '',
            codeCommune: mairie?.code || '422',
            exercice: declaration.exercice,
            article: taxe?.code || '',
            numeroPiece: declaration.numeroPiece,
            nomPartieVersante: declaration.nomPartieVersante || '',
            adresse: declaration.adresse || '',
            numeroLivre: declaration.numeroLivre || 'T31T',
            numeroEncaissement: declaration.numeroEncaissement || '',
            dateEncaissement: declaration.dateEncaissement
              ? date.formatDate(declaration.dateEncaissement, 'DD/MM/YYYY')
              : '',
            natureRecette: taxe?.libelle || '',
            montantRecette: declaration.montantRecette || declaration.montant || 0,
            ville: mairie?.ville || 'Azaguié',
            observations: declaration.observations || '',
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

  // Ouvrir le template et lancer l'impression automatiquement
  const printWindow = window.open(
    '/declaration_recette_new.html?declarationId=' + declaration.id,
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
            codeCommune: mairie?.code || '422',
            exercice: declaration.exercice,
            article: taxe?.code || '',
            numeroPiece: declaration.numeroPiece,
            nomPartieVersante: declaration.nomPartieVersante || '',
            adresse: declaration.adresse || '',
            numeroLivre: declaration.numeroLivre || 'T31T',
            numeroEncaissement: declaration.numeroEncaissement || '',
            dateEncaissement: declaration.dateEncaissement
              ? date.formatDate(declaration.dateEncaissement, 'DD/MM/YYYY')
              : '',
            natureRecette: taxe?.libelle || '',
            montantRecette: declaration.montantRecette || declaration.montant || 0,
            ville: mairie?.ville || 'Azaguié',
            observations: declaration.observations || '',
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

    const declarationsInBordereau = await db.declarations
      .where('bordereauId')
      .equals(bordereauId)
      .toArray();

    const nombreDeclarations = declarationsInBordereau.length;
    const montantTotal = declarationsInBordereau.reduce(
      (sum, decl) => sum + (decl.montantRecette || decl.montant || 0),
      0,
    );

    await db.bordereauxRecette.update(bordereauId, {
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
.no-print {
  @media print {
    display: none !important;
  }
}
.q-field {
  margin-bottom: 1px;
}
</style>
