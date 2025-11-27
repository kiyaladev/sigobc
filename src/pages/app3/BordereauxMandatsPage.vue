<template>
  <q-page class="q-pa-md">
    <div class="row q-mb-md justify-between items-center no-print">
      <div class="text-h5">Bordereaux d'Émission des Mandats</div>
      <q-btn color="purple" icon="print" label="Imprimer le Bordereau" @click="openPrintDialog()" />
    </div>

    <!-- Recherche et filtres -->
    <FilterBar
      v-model:search="search"
      v-model:date-debut="filterDateDebut"
      v-model:date-fin="filterDateFin"
      show-date-range
      search-placeholder="Rechercher par exercice..."
      @reset="resetFilters"
    />

    <!-- Statistiques -->
    <div class="row q-col-gutter-md q-mb-md">
      <div class="col-12 col-md-3">
        <q-card>
          <q-card-section>
            <div class="text-caption text-grey-7">Total Exercice en cours</div>
            <div class="text-h6 text-purple">{{ formatMontant(statsExerciceCourant) }}</div>
            <div class="text-caption">{{ mandatsExerciceCourant.length }} mandats</div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-md-3">
        <q-card>
          <q-card-section>
            <div class="text-caption text-grey-7">Mandats Émis</div>
            <div class="text-h6 text-blue">{{ mandatsEmis }}</div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-md-3">
        <q-card>
          <q-card-section>
            <div class="text-caption text-grey-7">Mandats Payés</div>
            <div class="text-h6 text-green">{{ mandatsPayes }}</div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-md-3">
        <q-card>
          <q-card-section>
            <div class="text-caption text-grey-7">En Attente</div>
            <div class="text-h6 text-orange">{{ mandatsEnAttente }}</div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Liste par exercice -->
    <q-card>
      <q-card-section>
        <div class="text-h6 q-mb-md">Bordereaux par Exercice</div>
        <q-list bordered separator>
          <q-item
            v-for="exercice in exercicesDisponibles"
            :key="exercice"
            clickable
            @click="viewBordereauExercice(exercice)"
          >
            <q-item-section avatar>
              <q-avatar color="purple" text-color="white" icon="calendar_today" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Exercice {{ exercice }}</q-item-label>
              <q-item-label caption>
                {{ getMandatsCountByExercice(exercice) }} mandats -
                {{ formatMontant(getMontantTotalByExercice(exercice)) }}
              </q-item-label>
            </q-item-section>
            <q-item-section side>
              <div class="row q-gutter-sm">
                <q-btn
                  flat
                  round
                  dense
                  color="purple"
                  icon="visibility"
                  @click.stop="viewBordereauExercice(exercice)"
                >
                  <q-tooltip>Voir les mandats</q-tooltip>
                </q-btn>
                <q-btn
                  flat
                  round
                  dense
                  color="primary"
                  icon="print"
                  @click.stop="printBordereauExercice(exercice)"
                >
                  <q-tooltip>Imprimer</q-tooltip>
                </q-btn>
                <q-btn
                  flat
                  round
                  dense
                  color="red"
                  icon="picture_as_pdf"
                  @click.stop="downloadBordereauPDF(exercice)"
                >
                  <q-tooltip>Télécharger PDF</q-tooltip>
                </q-btn>
              </div>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
    </q-card>

    <!-- Dialog de sélection pour impression -->
    <q-dialog v-model="printDialogVisible">
      <q-card style="min-width: 400px">
        <q-card-section class="bg-purple text-white">
          <div class="text-h6">Imprimer Bordereau d'Émission</div>
        </q-card-section>

        <q-card-section>
          <q-select
            v-model="selectedExercice"
            :options="exerciceOptions"
            label="Exercice"
            outlined
            emit-value
            map-options
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Annuler" color="grey" v-close-popup />
          <q-btn
            flat
            label="Imprimer"
            color="purple"
            icon="print"
            @click="confirmPrint"
            :disable="!selectedExercice"
          />
          <q-btn
            flat
            label="PDF"
            color="red"
            icon="picture_as_pdf"
            @click="confirmDownload"
            :disable="!selectedExercice"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Dialog pour voir les mandats d'un exercice -->
    <q-dialog v-model="mandatsDialogVisible" maximized>
      <q-card>
        <q-card-section class="bg-purple text-white">
          <div class="row items-center">
            <div class="col">
              <div class="text-h6">Mandats de l'Exercice {{ selectedExerciceView }}</div>
              <div class="text-caption">
                {{ mandatsExerciceView.length }} mandat(s) -
                {{ formatMontant(mandatsExerciceViewTotal) }}
              </div>
            </div>
            <q-btn flat round dense icon="close" v-close-popup />
          </div>
        </q-card-section>

        <q-card-section>
          <q-table
            :rows="mandatsExerciceView"
            :columns="mandatsColumns"
            row-key="id"
            :loading="loadingMandats"
            :pagination="{ rowsPerPage: 20 }"
          >
            <template v-slot:body-cell-dateMandat="props">
              <q-td :props="props">
                {{ formatDate(props.row.dateMandat) }}
              </q-td>
            </template>

            <template v-slot:body-cell-montant="props">
              <q-td :props="props">
                {{ formatMontant(props.row.montant) }}
              </q-td>
            </template>

            <template v-slot:body-cell-statut="props">
              <q-td :props="props">
                <q-chip :color="getStatutColor(props.row.statut)" text-color="white" size="sm">
                  {{ formatStatut(props.row.statut) }}
                </q-chip>
              </q-td>
            </template>

            <template v-slot:body-cell-chapitre="props">
              <q-td :props="props">
                {{ getChapitreLabel(props.row.chapitreId) }}
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
import { db, type Mandat, type Mairie, type Chapitre } from 'src/database/db';

import FilterBar from 'src/components/FilterBar.vue';

const $q = useQuasar();

const mandats = ref<Mandat[]>([]);
const mairies = ref<Mairie[]>([]);
const chapitres = ref<Chapitre[]>([]);
const loading = ref(false);
const search = ref('');
const filterDateDebut = ref('');
const filterDateFin = ref('');
const printDialogVisible = ref(false);
const selectedExercice = ref<number | null>(null);
const mandatsDialogVisible = ref(false);
const selectedExerciceView = ref<number | null>(null);
const mandatsExerciceView = ref<Mandat[]>([]);
const loadingMandats = ref(false);

const mandatsColumns = [
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
    name: 'beneficiaire',
    label: 'Bénéficiaire',
    field: 'beneficiaire',
    align: 'left' as const,
    sortable: true,
  },
  {
    name: 'objet',
    label: 'Objet',
    field: 'objet',
    align: 'left' as const,
    sortable: true,
  },
  {
    name: 'chapitre',
    label: 'Chapitre',
    field: 'chapitreId',
    align: 'left' as const,
    sortable: true,
  },
  {
    name: 'montant',
    label: 'Montant',
    field: 'montant',
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

const exerciceOptions = computed(() =>
  exercicesDisponibles.value.map((e) => ({ label: `Exercice ${e}`, value: e })),
);

const exercicesDisponibles = computed(() => {
  const exercices = [...new Set(mandats.value.map((m) => m.exercice))];
  return exercices.sort((a, b) => b - a);
});

const mandatsExerciceCourant = computed(() => {
  const currentYear = new Date().getFullYear();
  return mandats.value.filter((m) => m.exercice === currentYear);
});

const statsExerciceCourant = computed(() => {
  return mandatsExerciceCourant.value.reduce((sum, m) => sum + m.montant, 0);
});

const mandatsEmis = computed(() => {
  const currentYear = new Date().getFullYear();
  return mandats.value.filter((m) => m.exercice === currentYear && m.statut === 'emis').length;
});

const mandatsPayes = computed(() => {
  const currentYear = new Date().getFullYear();
  return mandats.value.filter((m) => m.exercice === currentYear && m.statut === 'paye').length;
});

const mandatsEnAttente = computed(() => {
  const currentYear = new Date().getFullYear();
  return mandats.value.filter(
    (m) => m.exercice === currentYear && (m.statut === 'brouillon' || m.statut === 'emis'),
  ).length;
});

const mandatsExerciceViewTotal = computed(() => {
  return mandatsExerciceView.value.reduce((sum, m) => sum + m.montant, 0);
});

function resetFilters() {
  search.value = '';
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

function formatStatut(statut: string): string {
  const statuts: Record<string, string> = {
    brouillon: 'Brouillon',
    emis: 'Émis',
    paye: 'Payé',
    annule: 'Annulé',
  };
  return statuts[statut] || statut;
}

function getStatutColor(statut: string): string {
  const colors: Record<string, string> = {
    brouillon: 'grey',
    emis: 'blue',
    paye: 'green',
    annule: 'red',
  };
  return colors[statut] || 'grey';
}

function getChapitreLabel(chapitreId: number): string {
  const chapitre = chapitres.value.find((c) => c.id === chapitreId);
  return chapitre ? `${chapitre.code} - ${chapitre.libelle}` : '';
}

function getMandatsCountByExercice(exercice: number): number {
  return mandats.value.filter((m) => m.exercice === exercice).length;
}

function getMontantTotalByExercice(exercice: number): number {
  return mandats.value
    .filter((m) => m.exercice === exercice)
    .reduce((sum, m) => sum + m.montant, 0);
}

async function viewBordereauExercice(exercice: number) {
  selectedExerciceView.value = exercice;
  loadingMandats.value = true;
  mandatsDialogVisible.value = true;

  try {
    mandatsExerciceView.value = await db.mandats.where('exercice').equals(exercice).toArray();
    mandatsExerciceView.value.sort(
      (a, b) => new Date(a.dateMandat).getTime() - new Date(b.dateMandat).getTime(),
    );
  } catch (error) {
    console.error('Erreur:', error);
    $q.notify({ type: 'negative', message: 'Erreur lors du chargement des mandats' });
  } finally {
    loadingMandats.value = false;
  }
}

function openPrintDialog() {
  const currentYear = new Date().getFullYear();
  selectedExercice.value = currentYear;
  printDialogVisible.value = true;
}

function printBordereauExercice(exercice: number) {
  const url = `/bordereau_mandat_new.html?exercice=${exercice}`;
  window.open(url, '_blank');
}

function downloadBordereauPDF(exercice: number) {
  const url = `/bordereau_mandat_new.html?exercice=${exercice}&print=true`;
  window.open(url, '_blank');
}

function confirmPrint() {
  if (!selectedExercice.value) return;

  const url = `/bordereau_mandat_new.html?exercice=${selectedExercice.value}`;
  window.open(url, '_blank');
  printDialogVisible.value = false;
}

function confirmDownload() {
  if (!selectedExercice.value) return;

  const url = `/bordereau_mandat_new.html?exercice=${selectedExercice.value}&print=true`;
  window.open(url, '_blank');
  printDialogVisible.value = false;
}

async function loadData() {
  loading.value = true;
  try {
    [mandats.value, mairies.value, chapitres.value] = await Promise.all([
      db.mandats.toArray(),
      db.mairies.toArray(),
      db.chapitres.toArray(),
    ]);
  } catch (error) {
    console.error('Erreur:', error);
    $q.notify({ type: 'negative', message: 'Erreur lors du chargement' });
  } finally {
    loading.value = false;
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
