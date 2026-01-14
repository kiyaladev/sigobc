<template>
  <q-page class="mandats-recette-page q-pa-md">
    <PageHeader
      title="Mandats de Recettes"
      subtitle="Gestion des mandats de recettes"
      icon="receipt"
    >
      <template #actions>
        <q-btn color="primary" icon="add" label="Nouveau Mandat" @click="openDialog()" />
      </template>
    </PageHeader>

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
              v-model="filterChapitre"
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
              v-model="filterStatut"
              :options="statutFilterOptions"
              label="Statut"
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
            <q-input v-model="filter" placeholder="Rechercher un mandat..." outlined dense>
              <template v-slot:prepend>
                <q-icon name="search" />
              </template>
            </q-input>
          </div>
        </div>

        <DataTable
          :rows="filteredMandats"
          :columns="columns"
          :loading="loading"
          show-print
          show-download
          @edit="openDialog"
          @delete="confirmDelete"
          @print="printMandat"
          @download="downloadMandatPDF"
        >
          <template v-slot:body-cell-bordereauNumero="props">
            <q-td :props="props">
              {{ getBordereauNumero(props.row.bordereauMandatRecetteId) }}
            </q-td>
          </template>

          <template v-slot:body-cell-montant="props">
            <q-td :props="props">
              {{ formatMontant(props.row.montant) }}
            </q-td>
          </template>

          <template v-slot:body-cell-dateMandat="props">
            <q-td :props="props">
              {{ formatDate(props.row.dateMandat) }}
            </q-td>
          </template>

          <template v-slot:body-cell-statut="props">
            <q-td :props="props">
              <q-chip :color="getStatutColor(props.row.statut)" text-color="white" size="sm">
                {{ formatStatut(props.row.statut) }}
              </q-chip>
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
                  label="Numéro *"
                  outlined
                  dense
                  :rules="[(val) => !!val || 'Numéro requis']"
                />
              </div>
              <div class="col-4">
                <q-input
                  v-model="formDataDateStr"
                  label="Date *"
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
                  :options="chapitreOptions"
                  label="Chapitre *"
                  outlined
                  dense
                  emit-value
                  map-options
                  :rules="[(val) => !!val || 'Chapitre requis']"
                />
              </div>
              <div class="col-6">
                <q-select
                  v-model="formData.taxeId"
                  :options="taxeOptions"
                  label="Taxe (Nature de recette) *"
                  outlined
                  dense
                  emit-value
                  map-options
                  :rules="[(val) => !!val || 'Taxe requise']"
                />
              </div>
            </div>

            <q-input
              v-model="formData.partieVersante"
              label="Partie Versante *"
              outlined
              dense
              :rules="[(val) => !!val || 'Partie versante requise']"
            />

            <!-- Bordereau -->
            <div class="row q-col-gutter-md">
              <div class="col-12">
                <q-select
                  v-model="formData.bordereauMandatRecetteId"
                  :options="bordereauOptions"
                  label="Bordereau (optionnel)"
                  outlined
                  dense
                  emit-value
                  map-options
                  clearable
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
              <div class="col-6">
                <q-input
                  v-model.number="formData.montant"
                  label="Montant (FCFA) *"
                  outlined
                  dense
                  type="number"
                  :rules="[(val) => val > 0 || 'Montant requis']"
                />
              </div>
              <div class="col-6">
                <q-select
                  v-model="formData.modePaiement"
                  :options="['virement', 'cheque', 'especes', 'autre']"
                  label="Mode de paiement *"
                  outlined
                  dense
                />
              </div>
            </div>

            <q-select
              v-model="formData.statut"
              :options="statutOptions"
              label="Statut"
              outlined
              dense
            />

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
import { ref, computed, onMounted } from 'vue';
import { useQuasar, date } from 'quasar';
import {
  db,
  type MandatRecette,
  type Chapitre,
  type Taxe,
  type BordereauMandatRecette,
  DEFAULT_MAIRIE_ID,
} from 'src/database/db';
import DataTable from 'src/components/DataTable.vue';
import PageHeader from 'src/components/PageHeader.vue';

const $q = useQuasar();

const mandats = ref<MandatRecette[]>([]);
const chapitres = ref<Chapitre[]>([]);
const taxes = ref<Taxe[]>([]);
const bordereaux = ref<BordereauMandatRecette[]>([]);
const loading = ref(false);

const filter = ref('');
const filterExercice = ref<number | null>(null);
const filterChapitre = ref<number | null>(null);
const filterStatut = ref<string | null>(null);
const filterDateDebut = ref('');
const filterDateFin = ref('');

const showAddDialog = ref(false);
const editingId = ref<number | null>(null);
const formDataDateStr = ref('');

const currentYear = new Date().getFullYear();

const formData = ref<Partial<MandatRecette>>({
  exercice: currentYear,
  numeroMandat: '',
  dateMandat: new Date(),
  partieVersante: '',
  objet: '',
  montant: 0,
  modePaiement: 'virement',
  statut: 'brouillon',
  observations: '',
});

const statutOptions = ['brouillon', 'emis', 'encaisse', 'annule'];

const columns = [
  {
    name: 'numeroMandat',
    label: 'N° Mandat',
    field: 'numeroMandat',
    align: 'left' as const,
    sortable: true,
  },
  {
    name: 'dateMandat',
    label: 'Date',
    field: 'dateMandat',
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
    name: 'bordereauNumero',
    label: 'Bordereau',
    field: 'bordereauMandatRecetteId',
    align: 'center' as const,
  },
  {
    name: 'partieVersante',
    label: 'Partie Versante',
    field: 'partieVersante',
    align: 'left' as const,
    sortable: true,
  },
  { name: 'montant', label: 'Montant', field: 'montant', align: 'right' as const, sortable: true },
  { name: 'statut', label: 'Statut', field: 'statut', align: 'center' as const, sortable: true },
  { name: 'actions', label: 'Actions', field: 'actions', align: 'center' as const },
];

const exerciceFilterOptions = computed(() => {
  const years = [...new Set(mandats.value.map((m) => m.exercice))].sort((a, b) => b - a);
  return years.map((y) => ({ label: String(y), value: y }));
});

const chapitreOptions = computed(() =>
  chapitres.value.map((c) => ({ label: `${c.code} - ${c.libelle}`, value: c.id! })),
);

const taxeOptions = computed(() =>
  taxes.value.map((t) => ({ label: `${t.code} - ${t.libelle}`, value: t.id! })),
);

const bordereauOptions = computed(() =>
  bordereaux.value
    .filter((b) => b.statut === 'ouvert')
    .map((b) => ({ label: `N° ${b.numero} - ${b.exercice}`, value: b.id! })),
);

const statutFilterOptions = [
  { label: 'Brouillon', value: 'brouillon' },
  { label: 'Émis', value: 'emis' },
  { label: 'Encaissé', value: 'encaisse' },
  { label: 'Annulé', value: 'annule' },
];

const filteredMandats = computed(() => {
  let result = mandats.value;

  if (filterExercice.value) {
    result = result.filter((m) => m.exercice === filterExercice.value);
  }

  if (filterChapitre.value) {
    result = result.filter((m) => m.chapitreId === filterChapitre.value);
  }

  if (filterStatut.value) {
    result = result.filter((m) => m.statut === filterStatut.value);
  }

  if (filterDateDebut.value) {
    const debut = new Date(filterDateDebut.value);
    result = result.filter((m) => new Date(m.dateMandat) >= debut);
  }

  if (filterDateFin.value) {
    const fin = new Date(filterDateFin.value);
    fin.setHours(23, 59, 59, 999);
    result = result.filter((m) => new Date(m.dateMandat) <= fin);
  }

  if (filter.value) {
    const searchLower = filter.value.toLowerCase();
    result = result.filter(
      (m) =>
        m.numeroMandat.toLowerCase().includes(searchLower) ||
        m.partieVersante.toLowerCase().includes(searchLower) ||
        m.objet.toLowerCase().includes(searchLower),
    );
  }

  return result;
});

function resetFilters() {
  filter.value = '';
  filterExercice.value = null;
  filterChapitre.value = null;
  filterStatut.value = null;
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
    emis: 'warning',
    encaisse: 'positive',
    annule: 'negative',
  };
  return colors[statut] || 'grey';
}

function formatStatut(statut: string): string {
  const labels: Record<string, string> = {
    brouillon: 'Brouillon',
    emis: 'Émis',
    encaisse: 'Encaissé',
    annule: 'Annulé',
  };
  return labels[statut] || statut;
}

function getBordereauNumero(bordereauId?: number): string {
  if (!bordereauId) return '-';
  const bordereau = bordereaux.value.find((b) => b.id === bordereauId);
  if (!bordereau) return '-';
  return `${bordereau.numero}-${bordereau.exercice % 100}`;
}

async function loadData() {
  loading.value = true;
  try {
    [mandats.value, chapitres.value, taxes.value, bordereaux.value] = await Promise.all([
      db.mandatsRecette.toArray(),
      db.chapitres.toArray(),
      db.taxes.toArray(),
      db.bordereauMandatsRecette.toArray(),
    ]);

    // Trier par date décroissante
    mandats.value.sort((a, b) => {
      return new Date(b.dateMandat).getTime() - new Date(a.dateMandat).getTime();
    });
  } catch (error) {
    console.error('Erreur:', error);
    $q.notify({ type: 'negative', message: 'Erreur lors du chargement' });
  } finally {
    loading.value = false;
  }
}

function openDialog(mandat?: MandatRecette) {
  if (mandat) {
    editingId.value = mandat.id!;
    formData.value = { ...mandat };
    formDataDateStr.value = date.formatDate(mandat.dateMandat, 'YYYY-MM-DD');
  } else {
    editingId.value = null;
    const nextNum = mandats.value.length + 1;
    formData.value = {
      exercice: currentYear,
      numeroMandat: String(nextNum).padStart(4, '0'),
      dateMandat: new Date(),
      ...(chapitres.value[0]?.id !== undefined && { chapitreId: chapitres.value[0].id }),
      ...(taxes.value[0]?.id !== undefined && { taxeId: taxes.value[0].id }),
      partieVersante: '',
      objet: '',
      montant: 0,
      modePaiement: 'virement',
      statut: 'brouillon',
      observations: '',
    };
    formDataDateStr.value = date.formatDate(new Date(), 'YYYY-MM-DD');
  }
  showAddDialog.value = true;
}

async function saveMandat() {
  if (
    !formData.value.numeroMandat ||
    !formData.value.chapitreId ||
    !formData.value.taxeId ||
    !formData.value.partieVersante ||
    !formData.value.objet ||
    !formData.value.montant ||
    formData.value.montant <= 0
  ) {
    $q.notify({ type: 'warning', message: 'Veuillez remplir tous les champs obligatoires' });
    return;
  }

  try {
    const now = new Date();
    const data: Partial<MandatRecette> = {
      ...formData.value,
      dateMandat: new Date(formDataDateStr.value),
      mairieId: DEFAULT_MAIRIE_ID,
      updatedAt: now,
    };

    if (editingId.value) {
      await db.mandatsRecette.update(editingId.value, data);
      $q.notify({ type: 'positive', message: 'Mandat modifié avec succès' });
    } else {
      data.createdAt = now;
      data.personnelId = 1;
      await db.mandatsRecette.add(data as MandatRecette);
      $q.notify({ type: 'positive', message: 'Mandat créé avec succès' });
    }

    showAddDialog.value = false;
    await loadData();
  } catch (error) {
    console.error('Erreur:', error);
    $q.notify({ type: 'negative', message: "Erreur lors de l'enregistrement" });
  }
}

function confirmDelete(mandat: MandatRecette) {
  $q.dialog({
    title: 'Confirmation',
    message: `Supprimer le mandat "${mandat.numeroMandat}" ?`,
    cancel: true,
    persistent: true,
  }).onOk(() => {
    void (async () => {
      try {
        await db.mandatsRecette.delete(mandat.id);
        $q.notify({ type: 'positive', message: 'Mandat supprimé' });
        await loadData();
      } catch (error) {
        console.error('Erreur:', error);
        $q.notify({ type: 'negative', message: 'Erreur lors de la suppression' });
      }
    })();
  });
}

function printMandat(mandat: MandatRecette) {
  window.open('/mandat_recette.html?mandatRecetteId=' + mandat.id, '_blank');
}

function downloadMandatPDF(mandat: MandatRecette) {
  window.open('/mandat_recette.html?mandatRecetteId=' + mandat.id + '&print=true', '_blank');
}

onMounted(() => {
  void loadData();
});
</script>

<style scoped lang="scss">
.mandats-recette-page {
  .main-card {
    border-radius: 12px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  }
}
</style>
