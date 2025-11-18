<template>
  <q-page class="q-pa-md">
    <div class="row q-mb-md justify-between items-center no-print">
      <div class="text-h5">Gestion des Déclarations</div>
      <q-btn color="primary" icon="add" label="Nouvelle Déclaration" @click="openDialog()" />
    </div>

    <!-- Recherche et filtres -->
    <FilterBar
      v-model:search="search"
      v-model:statut="filterStatut"
      v-model:mairie="filterMairie"
      v-model:exercice="filterExercice"
      v-model:taxe="filterTaxe"
      v-model:date-debut="filterDateDebut"
      v-model:date-fin="filterDateFin"
      :statut-options="statutOptions"
      :mairie-options="mairieOptions"
      :taxe-options="taxeOptions"
      show-statut
      show-mairie
      show-exercice
      show-taxe
      show-date-range
      search-placeholder="Rechercher..."
      @reset="resetFilters"
    />

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
    </DataTable>

    <!-- Dialog de création/modification -->
    <DeclarationDialog
      v-model="dialogVisible"
      :declaration="currentDeclaration"
      :is-editing="isEditing"
      :mairie-options="mairieOptions"
      :taxe-options="taxeOptions"
      :bordereau-options="bordereauOptions"
      :statut-options="statutOptions"
      :readonly="!authStore.isAdmin"
      :loading="saving"
      :default-mairie-id="authStore.currentUser?.mairieId || 0"
      @submit="onSubmit"
    />
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useQuasar, date } from 'quasar';
import { db, type Declaration, type Mairie, type Taxe, type Bordereau } from 'src/database/db';
import { useAuthStore } from 'src/stores/auth-store';
import FilterBar from 'src/components/FilterBar.vue';
import DataTable from 'src/components/DataTable.vue';
import DeclarationDialog from 'src/components/DeclarationDialog.vue';

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
const currentDeclaration = ref<Declaration | null>(null);
const search = ref('');
const filterStatut = ref('');
const filterMairie = ref<number | null>(null);
const filterExercice = ref<number | null>(null);
const filterTaxe = ref<number | null>(null);
const filterDateDebut = ref('');
const filterDateFin = ref('');

const statutOptions = ['brouillon', 'validee'];

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
  currentDeclaration.value = declaration || null;
  dialogVisible.value = true;
}

async function onSubmit(formData: Partial<Declaration>, dateStr: string) {
  saving.value = true;
  try {
    const now = new Date();
    const data = {
      ...formData,
      personnelId: authStore.currentUser?.id ?? 0,
      dateEncaissement: new Date(dateStr),
    };

    let oldBordereauId: number | undefined;
    if (isEditing.value && formData.id) {
      const oldDeclaration = await db.declarations.get(formData.id);
      oldBordereauId = oldDeclaration?.bordereauId;
      await db.declarations.update(formData.id, { ...data, updatedAt: now });
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
  const printWindow = window.open(
    `/declaration_recette.html?declarationId=${declaration.id}`,
    '_blank',
  );

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
            dateEncaissement: date.formatDate(declaration.dateEncaissement, 'DD/MM/YYYY'),
            natureRecette: taxe?.libelle || '',
            montantRecette: declaration.montantRecette,
            numeroLivre: declaration.numeroLivre,
            declaration,
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
  const printWindow = window.open(
    `/declaration_recette.html?declarationId=${declaration.id}`,
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
            codeCommune: mairie?.code || '',
            exercice: declaration.exercice,
            article: taxe?.code || '',
            numeroPiece: declaration.numeroPiece,
            nomPartieVersante: declaration.nomPartieVersante,
            adresse: declaration.adresse,
            numeroEncaissement: declaration.numeroEncaissement,
            dateEncaissement: date.formatDate(declaration.dateEncaissement, 'DD/MM/YYYY'),
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
.no-print {
  @media print {
    display: none !important;
  }
}
.q-field {
  margin-bottom: 1px;
}
</style>
