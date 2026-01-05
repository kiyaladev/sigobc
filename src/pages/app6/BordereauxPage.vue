<template>
  <q-page class="q-pa-md">
    <PageHeader
      title="Bordereaux de Recettes"
      subtitle="Gestion des bordereaux d'émission des recettes"
      icon="folder_open"
    />

    <!-- Barre d'outils -->
    <div class="row q-mb-md items-center q-gutter-sm">
      <q-select
        v-model="filters.exercice"
        :options="exerciceOptions"
        label="Exercice"
        outlined
        dense
        class="col-12 col-sm-2"
      />

      <q-select
        v-model="filters.statut"
        :options="statutOptions"
        label="Statut"
        outlined
        dense
        emit-value
        map-options
        clearable
        class="col-12 col-sm-2"
      />

      <q-space />

      <q-btn color="primary" icon="add" label="Nouveau Bordereau" @click="openDialog()" />
      <q-btn color="secondary" icon="print" label="Imprimer" @click="printBordereaux" />
    </div>

    <!-- Tableau des bordereaux -->
    <q-card>
      <q-table
        :rows="filteredBordereaux"
        :columns="columns"
        row-key="id"
        :loading="loading"
        flat
        bordered
        :pagination="{ rowsPerPage: 15 }"
      >
        <template v-slot:body-cell-numero="props">
          <q-td :props="props">
            <span class="text-weight-bold text-primary">
              {{ String(props.row.numero).padStart(3, '0') }}/{{ props.row.exercice }}
            </span>
          </q-td>
        </template>

        <template v-slot:body-cell-montantTotal="props">
          <q-td :props="props">
            <span class="text-weight-bold text-green">
              {{ formatCurrency(props.row.montantTotal) }}
            </span>
          </q-td>
        </template>

        <template v-slot:body-cell-statut="props">
          <q-td :props="props">
            <q-badge :color="props.row.statut === 'ouvert' ? 'warning' : 'positive'">
              {{ props.row.statut === 'ouvert' ? 'Ouvert' : 'Fermé' }}
            </q-badge>
          </q-td>
        </template>

        <template v-slot:body-cell-actions="props">
          <q-td :props="props">
            <q-btn
              flat
              round
              dense
              icon="visibility"
              color="info"
              @click="viewBordereau(props.row)"
            >
              <q-tooltip>Voir détails</q-tooltip>
            </q-btn>
            <q-btn
              v-if="props.row.statut === 'ouvert'"
              flat
              round
              dense
              icon="lock"
              color="positive"
              @click="fermerBordereau(props.row)"
            >
              <q-tooltip>Fermer</q-tooltip>
            </q-btn>
            <q-btn
              flat
              round
              dense
              icon="print"
              color="secondary"
              @click="printSingleBordereau(props.row)"
            >
              <q-tooltip>Imprimer</q-tooltip>
            </q-btn>
          </q-td>
        </template>
      </q-table>
    </q-card>

    <!-- Dialog de création -->
    <q-dialog v-model="showDialog" persistent>
      <q-card style="min-width: 500px">
        <q-card-section class="bg-primary text-white">
          <div class="text-h6">Nouveau Bordereau de Recettes</div>
        </q-card-section>

        <q-card-section>
          <q-form class="q-gutter-md">
            <q-input
              v-model="form.codeCommune"
              label="Code Commune *"
              outlined
              :rules="[(val) => !!val || 'Requis']"
            />

            <q-input
              v-model.number="form.numero"
              type="number"
              label="Numéro Bordereau *"
              outlined
              :rules="[(val) => val > 0 || 'Numéro requis']"
            />

            <q-select
              v-model="form.exercice"
              :options="exerciceOptions"
              label="Exercice (Année) *"
              outlined
            />

            <q-input v-model="form.date" type="date" label="Date d'émission" outlined />

            <q-input v-model="form.observations" label="Observations" outlined type="textarea" />
          </q-form>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Annuler" color="grey" v-close-popup />
          <q-btn label="Créer" color="primary" @click="saveBordereau" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import PageHeader from 'src/components/PageHeader.vue';

const $q = useQuasar();
const loading = ref(true);
const showDialog = ref(false);

const currentYear = new Date().getFullYear();
const exerciceOptions = [2023, 2024, 2025, 2026];

interface BordereauRecette {
  id?: number;
  codeCommune: string;
  numero: number;
  exercice: number;
  date: string;
  nombreDeclarations: number;
  montantTotal: number;
  statut: 'ouvert' | 'ferme';
  observations?: string;
}

const bordereaux = ref<BordereauRecette[]>([]);

const filters = ref({
  exercice: currentYear,
  statut: null as string | null,
});

const statutOptions = [
  { label: 'Ouvert', value: 'ouvert' },
  { label: 'Fermé', value: 'ferme' },
];

const form = ref({
  codeCommune: '422',
  numero: 1,
  exercice: currentYear,
  date: '',
  observations: '',
});

const columns = [
  { name: 'codeCommune', label: 'Code Commune', field: 'codeCommune', align: 'left' as const },
  {
    name: 'numero',
    label: 'N° Bordereau',
    field: 'numero',
    align: 'center' as const,
    sortable: true,
  },
  { name: 'exercice', label: 'Exercice', field: 'exercice', align: 'center' as const },
  { name: 'date', label: 'Date', field: 'date', align: 'center' as const },
  {
    name: 'nombreDeclarations',
    label: 'Nb Décl.',
    field: 'nombreDeclarations',
    align: 'center' as const,
  },
  {
    name: 'montantTotal',
    label: 'Montant Total',
    field: 'montantTotal',
    align: 'right' as const,
    sortable: true,
  },
  { name: 'statut', label: 'Statut', field: 'statut', align: 'center' as const },
  { name: 'actions', label: 'Actions', field: 'actions', align: 'center' as const },
];

const filteredBordereaux = computed(() => {
  let result = bordereaux.value.filter((b) => b.exercice === filters.value.exercice);

  if (filters.value.statut) {
    result = result.filter((b) => b.statut === filters.value.statut);
  }

  return result;
});

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    minimumFractionDigits: 0,
  }).format(value);
}

async function loadData() {
  loading.value = true;
  try {
    // Données de démonstration
    bordereaux.value = [
      {
        id: 1,
        codeCommune: '422',
        numero: 1,
        exercice: 2025,
        date: '2025-01-02',
        nombreDeclarations: 15,
        montantTotal: 5750000,
        statut: 'ferme',
      },
      {
        id: 2,
        codeCommune: '422',
        numero: 2,
        exercice: 2025,
        date: '2025-01-03',
        nombreDeclarations: 12,
        montantTotal: 3250000,
        statut: 'ferme',
      },
      {
        id: 3,
        codeCommune: '422',
        numero: 3,
        exercice: 2025,
        date: '2025-01-05',
        nombreDeclarations: 8,
        montantTotal: 1875000,
        statut: 'ouvert',
      },
    ];
  } catch (error) {
    console.error('Erreur chargement bordereaux:', error);
  } finally {
    loading.value = false;
  }
}

function openDialog() {
  form.value = {
    codeCommune: '422',
    numero: bordereaux.value.filter((b) => b.exercice === currentYear).length + 1,
    exercice: currentYear,
    date: new Date().toISOString().split('T')[0] ?? '',
    observations: '',
  };
  showDialog.value = true;
}

function saveBordereau() {
  if (!form.value.numero || !form.value.codeCommune) {
    $q.notify({ type: 'warning', message: 'Veuillez remplir les champs obligatoires' });
    return;
  }

  const newId = Math.max(...bordereaux.value.map((b) => b.id ?? 0), 0) + 1;
  bordereaux.value.push({
    id: newId,
    codeCommune: form.value.codeCommune,
    numero: form.value.numero,
    exercice: form.value.exercice,
    date: form.value.date,
    nombreDeclarations: 0,
    montantTotal: 0,
    statut: 'ouvert',
    observations: form.value.observations,
  });

  $q.notify({ type: 'positive', message: 'Bordereau créé avec succès' });
  showDialog.value = false;
}

function viewBordereau(item: BordereauRecette) {
  $q.dialog({
    title: `Bordereau N° ${String(item.numero).padStart(3, '0')}/${item.exercice}`,
    message: `
Code Commune: ${item.codeCommune}
Date: ${item.date}
Nombre de déclarations: ${item.nombreDeclarations}
Montant Total: ${formatCurrency(item.montantTotal)}
Statut: ${item.statut === 'ouvert' ? 'Ouvert' : 'Fermé'}
${item.observations ? `Observations: ${item.observations}` : ''}
    `.trim(),
  });
}

function fermerBordereau(item: BordereauRecette) {
  $q.dialog({
    title: 'Fermer le bordereau',
    message: `Voulez-vous fermer le bordereau N° ${String(item.numero).padStart(3, '0')}/${item.exercice} ?`,
    cancel: true,
    persistent: true,
  }).onOk(() => {
    const index = bordereaux.value.findIndex((b) => b.id === item.id);
    if (index !== -1) {
      bordereaux.value[index].statut = 'ferme';
    }
    $q.notify({ type: 'positive', message: 'Bordereau fermé avec succès' });
  });
}

function printBordereaux() {
  $q.notify({ type: 'info', message: 'Impression des bordereaux en cours...' });
}

function printSingleBordereau(item: BordereauRecette) {
  $q.notify({ type: 'info', message: `Impression du bordereau N° ${item.numero}...` });
}

onMounted(() => {
  void loadData();
});
</script>
