<template>
  <q-page class="q-pa-md">
    <PageHeader
      title="Titres de Recettes"
      subtitle="Enregistrement et gestion des recettes"
      icon="payments"
    />

    <!-- Barre d'outils -->
    <div class="row q-mb-md items-center q-gutter-sm">
      <q-input
        v-model="filters.search"
        outlined
        dense
        placeholder="Rechercher..."
        class="col-12 col-sm-3"
      >
        <template v-slot:prepend>
          <q-icon name="search" />
        </template>
      </q-input>

      <q-select
        v-model="filters.exercice"
        :options="exerciceOptions"
        label="Exercice"
        outlined
        dense
        class="col-12 col-sm-2"
      />

      <q-space />

      <q-btn color="primary" icon="add" label="Nouveau Titre" @click="openDialog()" />
    </div>

    <!-- Tableau des titres de recettes -->
    <q-card>
      <q-table
        :rows="filteredTitres"
        :columns="columns"
        row-key="id"
        :loading="loading"
        flat
        bordered
        :pagination="{ rowsPerPage: 15 }"
      >
        <template v-slot:body-cell-codeCommune="props">
          <q-td :props="props">
            <span class="text-weight-bold">{{ props.row.codeCommune }}</span>
          </q-td>
        </template>

        <template v-slot:body-cell-montant="props">
          <q-td :props="props">
            <span class="text-weight-bold text-green">
              {{ formatCurrency(props.row.montant) }}
            </span>
          </q-td>
        </template>

        <template v-slot:body-cell-actions="props">
          <q-td :props="props">
            <q-btn flat round dense icon="edit" color="primary" @click="openDialog(props.row)">
              <q-tooltip>Modifier</q-tooltip>
            </q-btn>
            <q-btn flat round dense icon="delete" color="negative" @click="confirmDelete(props.row)">
              <q-tooltip>Supprimer</q-tooltip>
            </q-btn>
          </q-td>
        </template>
      </q-table>
    </q-card>

    <!-- Dialog d'édition -->
    <q-dialog v-model="showDialog" persistent>
      <q-card style="min-width: 600px; max-width: 90vw">
        <q-card-section class="bg-primary text-white">
          <div class="text-h6">{{ isEdit ? 'Modifier' : 'Nouveau' }} Titre de Recette</div>
        </q-card-section>

        <q-card-section>
          <q-form class="row q-col-gutter-md">
            <div class="col-12 col-md-6">
              <q-input
                v-model="form.codeCommune"
                label="Code Commune *"
                outlined
                :rules="[(val) => !!val || 'Le code commune est requis']"
              />
            </div>

            <div class="col-12 col-md-6">
              <q-select
                v-model="form.exercice"
                :options="exerciceOptions"
                label="Exercice (Année) *"
                outlined
                :rules="[(val) => !!val || 'L\'exercice est requis']"
              />
            </div>

            <div class="col-12">
              <q-input
                v-model="form.compteFonctionnel"
                label="Compte Fonctionnel *"
                outlined
                :rules="[(val) => !!val || 'Le compte fonctionnel est requis']"
              />
            </div>

            <div class="col-12 col-md-6">
              <q-input
                v-model="form.numeroBordereau"
                label="N° Bordereau *"
                outlined
                :rules="[(val) => !!val || 'Le numéro de bordereau est requis']"
              />
            </div>

            <div class="col-12 col-md-6">
              <q-input
                v-model="form.numeroDeclaration"
                label="N° Déclaration *"
                outlined
                :rules="[(val) => !!val || 'Le numéro de déclaration est requis']"
              />
            </div>

            <div class="col-12 col-md-6">
              <q-input
                v-model="form.date"
                type="date"
                label="Date *"
                outlined
                :rules="[(val) => !!val || 'La date est requise']"
              />
            </div>

            <div class="col-12 col-md-6">
              <q-input
                v-model.number="form.montant"
                type="number"
                label="Montant *"
                outlined
                prefix="FCFA"
                :rules="[(val) => val > 0 || 'Le montant doit être supérieur à 0']"
              />
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

        <q-card-actions align="right">
          <q-btn flat label="Annuler" color="grey" v-close-popup />
          <q-btn label="Enregistrer" color="primary" @click="saveItem" />
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
const isEdit = ref(false);

const currentYear = new Date().getFullYear();
const exerciceOptions = [2023, 2024, 2025, 2026];

interface TitreRecette {
  id?: number;
  codeCommune: string;
  exercice: number;
  compteFonctionnel: string;
  numeroBordereau: string;
  numeroDeclaration: string;
  date: string;
  montant: number;
  observations?: string;
}

const titres = ref<TitreRecette[]>([]);

const filters = ref({
  search: '',
  exercice: currentYear,
});

const form = ref<TitreRecette>({
  codeCommune: '',
  exercice: currentYear,
  compteFonctionnel: '',
  numeroBordereau: '',
  numeroDeclaration: '',
  date: '',
  montant: 0,
  observations: '',
});

const columns = [
  { name: 'codeCommune', label: 'Code Commune', field: 'codeCommune', align: 'left' as const, sortable: true },
  { name: 'exercice', label: 'Exercice', field: 'exercice', align: 'center' as const, sortable: true },
  { name: 'compteFonctionnel', label: 'Compte Fonctionnel', field: 'compteFonctionnel', align: 'left' as const },
  { name: 'numeroBordereau', label: 'N° Bordereau', field: 'numeroBordereau', align: 'center' as const },
  { name: 'numeroDeclaration', label: 'N° Déclaration', field: 'numeroDeclaration', align: 'center' as const },
  { name: 'date', label: 'Date', field: 'date', align: 'center' as const, sortable: true },
  { name: 'montant', label: 'Montant', field: 'montant', align: 'right' as const, sortable: true },
  { name: 'actions', label: 'Actions', field: 'actions', align: 'center' as const },
];

const filteredTitres = computed(() => {
  let result = titres.value.filter((t) => t.exercice === filters.value.exercice);

  if (filters.value.search) {
    const s = filters.value.search.toLowerCase();
    result = result.filter(
      (t) =>
        t.codeCommune.toLowerCase().includes(s) ||
        t.compteFonctionnel.toLowerCase().includes(s) ||
        t.numeroBordereau.toLowerCase().includes(s) ||
        t.numeroDeclaration.toLowerCase().includes(s)
    );
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
    titres.value = [
      {
        id: 1,
        codeCommune: '422',
        exercice: 2025,
        compteFonctionnel: '7000',
        numeroBordereau: '001',
        numeroDeclaration: '001',
        date: '2025-01-05',
        montant: 1500000,
        observations: 'Contribution foncière',
      },
      {
        id: 2,
        codeCommune: '422',
        exercice: 2025,
        compteFonctionnel: '7004',
        numeroBordereau: '001',
        numeroDeclaration: '002',
        date: '2025-01-05',
        montant: 850000,
        observations: 'Patentes',
      },
      {
        id: 3,
        codeCommune: '422',
        exercice: 2025,
        compteFonctionnel: '7130',
        numeroBordereau: '002',
        numeroDeclaration: '003',
        date: '2025-01-04',
        montant: 320000,
        observations: 'Taxe ordures ménagères',
      },
    ];
  } catch (error) {
    console.error('Erreur chargement titres:', error);
    $q.notify({ type: 'negative', message: 'Erreur lors du chargement' });
  } finally {
    loading.value = false;
  }
}

function openDialog(item?: TitreRecette) {
  isEdit.value = !!item;
  if (item) {
    form.value = { ...item };
  } else {
    const nextNum = titres.value.filter((t) => t.exercice === currentYear).length + 1;
    form.value = {
      codeCommune: '422', // Code commune par défaut (Azaguié)
      exercice: currentYear,
      compteFonctionnel: '',
      numeroBordereau: '',
      numeroDeclaration: String(nextNum).padStart(3, '0'),
      date: new Date().toISOString().split('T')[0] ?? '',
      montant: 0,
      observations: '',
    };
  }
  showDialog.value = true;
}

function saveItem() {
  if (
    !form.value.codeCommune ||
    !form.value.compteFonctionnel ||
    !form.value.numeroBordereau ||
    !form.value.numeroDeclaration ||
    !form.value.date ||
    form.value.montant <= 0
  ) {
    $q.notify({ type: 'warning', message: 'Veuillez remplir tous les champs obligatoires' });
    return;
  }

  if (isEdit.value) {
    // Mise à jour
    const index = titres.value.findIndex((t) => t.id === form.value.id);
    if (index !== -1) {
      titres.value[index] = { ...form.value };
    }
    $q.notify({ type: 'positive', message: 'Titre de recette modifié avec succès' });
  } else {
    // Création
    const newId = Math.max(...titres.value.map((t) => t.id ?? 0), 0) + 1;
    titres.value.push({ ...form.value, id: newId });
    $q.notify({ type: 'positive', message: 'Titre de recette créé avec succès' });
  }

  showDialog.value = false;
}

function confirmDelete(item: TitreRecette) {
  $q.dialog({
    title: 'Confirmation',
    message: `Voulez-vous vraiment supprimer ce titre de recette ?`,
    cancel: true,
    persistent: true,
  }).onOk(() => {
    titres.value = titres.value.filter((t) => t.id !== item.id);
    $q.notify({ type: 'positive', message: 'Titre de recette supprimé' });
  });
}

onMounted(() => {
  void loadData();
});
</script>
