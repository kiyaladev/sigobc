<template>
  <q-page class="ct02-page q-pa-md">
    <PageHeader
      title="CT02 - Livre d'exécution budgétaire Investissements"
      subtitle="Suivi des opérations d'investissement"
      icon="menu_book"
    />

    <q-card class="main-card q-mb-md">
      <q-card-section>
        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-3">
            <q-select
              v-model="filters.exercice"
              :options="exerciceOptions"
              label="Exercice *"
              outlined
              dense
              emit-value
              map-options
            />
          </div>
          <div class="col-12 col-md-3">
            <q-select
              v-model="filters.chapitreId"
              :options="chapitreOptions"
              label="Chapitre"
              outlined
              dense
              emit-value
              map-options
              clearable
            />
          </div>
          <div class="col-12 col-md-3">
            <q-select
              v-model="filters.sousChapitreId"
              :options="sousChapitreOptions"
              label="Sous-chapitre"
              outlined
              dense
              emit-value
              map-options
              clearable
            />
          </div>
          <div class="col-12 col-md-3 row q-gutter-sm">
            <q-btn
              color="teal"
              icon="search"
              label="Rechercher"
              unelevated
              @click="loadCT02Data"
              :loading="loading"
            />
            <q-btn
              color="secondary"
              icon="print"
              label="Imprimer"
              unelevated
              @click="printCT02"
              :disable="ct02Data.length === 0"
            />
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Résumé -->
    <div class="row q-col-gutter-md q-mb-md" v-if="summary">
      <div class="col-12 col-md-3">
        <q-card class="bg-teal-1">
          <q-card-section>
            <div class="text-caption text-grey-8">Montant Prévu</div>
            <div class="text-h6 text-teal">{{ formatMontant(summary.montantPrevu) }}</div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-md-3">
        <q-card class="bg-blue-1">
          <q-card-section>
            <div class="text-caption text-grey-8">Montant Engagé</div>
            <div class="text-h6 text-blue">{{ formatMontant(summary.montantEngage) }}</div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-md-3">
        <q-card class="bg-green-1">
          <q-card-section>
            <div class="text-caption text-grey-8">Montant Disponible</div>
            <div class="text-h6 text-green">{{ formatMontant(summary.montantDisponible) }}</div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-md-3">
        <q-card class="bg-orange-1">
          <q-card-section>
            <div class="text-caption text-grey-8">Taux d'exécution</div>
            <div class="text-h6 text-orange">{{ summary.tauxExecution.toFixed(1) }}%</div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Tableau CT02 -->
    <q-card class="main-card">
      <q-card-section>
        <q-table
          :rows="ct02Data"
          :columns="columns"
          row-key="id"
          flat
          bordered
          :loading="loading"
          :pagination="{ rowsPerPage: 50 }"
        >
          <template v-slot:body-cell-montant="props">
            <q-td :props="props" class="text-right">
              {{ formatMontant(props.row.montant) }}
            </q-td>
          </template>

          <template v-slot:body-cell-cumul="props">
            <q-td :props="props" class="text-right">
              {{ formatMontant(props.row.cumul) }}
            </q-td>
          </template>

          <template v-slot:body-cell-disponible="props">
            <q-td :props="props" class="text-right">
              <span :class="props.row.disponible < 0 ? 'text-negative' : 'text-positive'">
                {{ formatMontant(props.row.disponible) }}
              </span>
            </q-td>
          </template>

          <template v-slot:bottom>
            <div class="full-width row justify-end q-pa-sm">
              <div class="text-weight-bold">Total Mandats: {{ formatMontant(totalMandats) }}</div>
            </div>
          </template>
        </q-table>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useQuasar, date } from 'quasar';
import {
  db,
  type PrevisionInvestissement,
  type MandatInvestissement,
  type ChapitreInvestissement,
  type SousChapitreInvestissement,
  DEFAULT_MAIRIE_ID,
} from 'src/database/db';
import PageHeader from 'src/components/PageHeader.vue';

const $q = useQuasar();
const loading = ref(false);

interface CT02Row {
  id: number;
  date: string;
  numeroMandat: string;
  beneficiaire: string;
  objet: string;
  montant: number;
  cumul: number;
  disponible: number;
}

interface Summary {
  montantPrevu: number;
  montantEngage: number;
  montantDisponible: number;
  tauxExecution: number;
}

const filters = ref({
  exercice: new Date().getFullYear(),
  chapitreId: null as number | null,
  sousChapitreId: null as number | null,
});

const ct02Data = ref<CT02Row[]>([]);
const summary = ref<Summary | null>(null);

const chapitres = ref<ChapitreInvestissement[]>([]);
const sousChapitres = ref<SousChapitreInvestissement[]>([]);
const previsions = ref<PrevisionInvestissement[]>([]);
const mandats = ref<MandatInvestissement[]>([]);

const exerciceOptions = computed(() => {
  const currentYear = new Date().getFullYear();
  return [currentYear - 2, currentYear - 1, currentYear, currentYear + 1].map((y) => ({
    label: String(y),
    value: y,
  }));
});

const chapitreOptions = computed(() =>
  chapitres.value.map((c) => ({ label: `${c.code} - ${c.libelle}`, value: c.id })),
);

const sousChapitreOptions = computed(() =>
  sousChapitres.value.map((s) => ({ label: `${s.code} - ${s.libelle}`, value: s.id })),
);

const columns = [
  {
    name: 'date',
    label: 'Date',
    align: 'left' as const,
    field: 'date',
    sortable: true,
  },
  {
    name: 'numeroMandat',
    label: 'N° Mandat',
    align: 'left' as const,
    field: 'numeroMandat',
    sortable: true,
  },
  {
    name: 'beneficiaire',
    label: 'Bénéficiaire',
    align: 'left' as const,
    field: 'beneficiaire',
  },
  {
    name: 'objet',
    label: 'Objet',
    align: 'left' as const,
    field: 'objet',
  },
  {
    name: 'montant',
    label: 'Montant',
    align: 'right' as const,
    field: 'montant',
    sortable: true,
  },
  {
    name: 'cumul',
    label: 'Cumul',
    align: 'right' as const,
    field: 'cumul',
  },
  {
    name: 'disponible',
    label: 'Disponible',
    align: 'right' as const,
    field: 'disponible',
  },
];

const totalMandats = computed(() => ct02Data.value.reduce((sum, row) => sum + row.montant, 0));

function formatMontant(montant: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    minimumFractionDigits: 0,
  }).format(montant);
}

async function loadReferenceData() {
  try {
    [chapitres.value, sousChapitres.value] = await Promise.all([
      db.chapitresInvestissement.where('mairieId').equals(DEFAULT_MAIRIE_ID).toArray(),
      db.sousChapitresInvestissement.where('mairieId').equals(DEFAULT_MAIRIE_ID).toArray(),
    ]);
  } catch (error) {
    console.error('Erreur:', error);
    $q.notify({ type: 'negative', message: 'Erreur lors du chargement' });
  }
}

async function loadCT02Data() {
  loading.value = true;
  try {
    const exercice = filters.value.exercice;

    // Charger prévisions
    let prevsQuery = db.previsionsInvestissement
      .where('mairieId')
      .equals(DEFAULT_MAIRIE_ID)
      .filter((p) => p.exercice === exercice);

    if (filters.value.chapitreId) {
      prevsQuery = prevsQuery.filter(
        (p) => p.chapitreInvestissementId === filters.value.chapitreId,
      );
    }
    if (filters.value.sousChapitreId) {
      prevsQuery = prevsQuery.filter(
        (p) => p.sousChapitreInvestissementId === filters.value.sousChapitreId,
      );
    }

    previsions.value = await prevsQuery.toArray();

    // Charger mandats
    let mandatsQuery = db.mandatsInvestissement
      .where('mairieId')
      .equals(DEFAULT_MAIRIE_ID)
      .filter((m) => m.exercice === exercice && m.statut !== 'annule');

    if (filters.value.chapitreId) {
      mandatsQuery = mandatsQuery.filter(
        (m) => m.chapitreInvestissementId === filters.value.chapitreId,
      );
    }
    if (filters.value.sousChapitreId) {
      mandatsQuery = mandatsQuery.filter(
        (m) => m.sousChapitreInvestissementId === filters.value.sousChapitreId,
      );
    }

    mandats.value = await mandatsQuery.toArray();

    // Trier par date
    mandats.value.sort(
      (a, b) => new Date(a.dateMandat).getTime() - new Date(b.dateMandat).getTime(),
    );

    // Calculer le montant prévu total
    const montantPrevu = previsions.value.reduce((sum, p) => sum + p.montantPrevu, 0);

    // Construire les lignes CT02
    let cumul = 0;
    ct02Data.value = mandats.value.map((m, index) => {
      cumul += m.montant;
      return {
        id: index,
        date: date.formatDate(m.dateMandat, 'DD/MM/YYYY'),
        numeroMandat: m.numeroMandat,
        beneficiaire: m.beneficiaire,
        objet: m.objet,
        montant: m.montant,
        cumul,
        disponible: montantPrevu - cumul,
      };
    });

    // Calculer le résumé
    const montantEngage = cumul;
    const montantDisponible = montantPrevu - montantEngage;
    const tauxExecution = montantPrevu > 0 ? (montantEngage / montantPrevu) * 100 : 0;

    summary.value = {
      montantPrevu,
      montantEngage,
      montantDisponible,
      tauxExecution,
    };
  } catch (error) {
    console.error('Erreur:', error);
    $q.notify({ type: 'negative', message: 'Erreur lors du chargement des données' });
  } finally {
    loading.value = false;
  }
}

function printCT02() {
  const printWindow = window.open('/CT02.html', '_blank');

  if (printWindow) {
    printWindow.addEventListener('load', () => {
      const sousChapitre = filters.value.sousChapitreId
        ? sousChapitres.value.find((s) => s.id === filters.value.sousChapitreId)
        : null;

      const chapitre = filters.value.chapitreId
        ? chapitres.value.find((c) => c.id === filters.value.chapitreId)
        : null;

      printWindow.postMessage(
        {
          type: 'FILL_CT02',
          data: {
            exercice: filters.value.exercice,
            type: 'investissement',
            chapitre: chapitre ? `${chapitre.code} - ${chapitre.libelle}` : 'Tous',
            sousChapitre: sousChapitre ? `${sousChapitre.code} - ${sousChapitre.libelle}` : 'Tous',
            rows: ct02Data.value,
            summary: summary.value,
          },
        },
        '*',
      );
    });
  }
}

onMounted(() => {
  void loadReferenceData();
});
</script>

<style scoped lang="scss">
.ct02-page {
  max-width: 1400px;
  margin: 0 auto;
}

.main-card {
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}
</style>
