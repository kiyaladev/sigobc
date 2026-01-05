<template>
  <q-page class="q-pa-md">
    <PageHeader
      title="Déclarations de Recettes"
      subtitle="Saisie et gestion des déclarations de recettes"
      icon="receipt"
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

      <q-input
        v-model="filters.dateDebut"
        type="date"
        label="Du"
        outlined
        dense
        class="col-12 col-sm-2"
      />

      <q-input
        v-model="filters.dateFin"
        type="date"
        label="Au"
        outlined
        dense
        class="col-12 col-sm-2"
      />

      <q-space />

      <q-btn color="primary" icon="add" label="Nouvelle Déclaration" @click="openDialog()" />
    </div>

    <!-- Tableau des déclarations -->
    <q-card>
      <q-table
        :rows="filteredDeclarations"
        :columns="columns"
        row-key="id"
        :loading="loading"
        flat
        bordered
        :pagination="{ rowsPerPage: 15 }"
      >
        <template v-slot:body-cell-numeroDeclaration="props">
          <q-td :props="props">
            <span class="text-weight-bold text-primary">{{ props.row.numeroDeclaration }}</span>
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
            <q-btn
              flat
              round
              dense
              icon="visibility"
              color="info"
              @click="viewDeclaration(props.row)"
            >
              <q-tooltip>Voir</q-tooltip>
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

    <!-- Dialog d'édition -->
    <q-dialog v-model="showDialog" persistent>
      <q-card style="min-width: 600px; max-width: 90vw">
        <q-card-section class="bg-primary text-white row items-center">
          <div class="text-h6">{{ isEdit ? 'Modifier' : 'Nouvelle' }} Déclaration</div>
          <q-space />
          <q-btn flat round dense icon="close" v-close-popup />
        </q-card-section>

        <q-card-section>
          <q-form class="row q-col-gutter-md">
            <div class="col-12 col-md-6">
              <q-input
                v-model="form.codeCommune"
                label="Code Commune *"
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

            <div class="col-12">
              <q-input
                v-model="form.compteFonctionnel"
                label="Compte Fonctionnel *"
                outlined
                :rules="[(val) => !!val || 'Requis']"
              />
            </div>

            <div class="col-12 col-md-6">
              <q-input
                v-model="form.numeroBordereau"
                label="N° Bordereau *"
                outlined
                :rules="[(val) => !!val || 'Requis']"
              />
            </div>

            <div class="col-12 col-md-6">
              <q-input
                v-model="form.numeroDeclaration"
                label="N° Déclaration *"
                outlined
                :rules="[(val) => !!val || 'Requis']"
              />
            </div>

            <div class="col-12 col-md-6">
              <q-input
                v-model="form.date"
                type="date"
                label="Date *"
                outlined
                :rules="[(val) => !!val || 'Requis']"
              />
            </div>

            <div class="col-12 col-md-6">
              <q-input
                v-model.number="form.montant"
                type="number"
                label="Montant *"
                outlined
                prefix="FCFA"
                :rules="[(val) => val > 0 || 'Montant requis']"
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

        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Annuler" color="grey" v-close-popup />
          <q-btn label="Enregistrer" color="primary" @click="saveDeclaration" />
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

interface DeclarationRecette {
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

const declarations = ref<DeclarationRecette[]>([]);

const filters = ref({
  search: '',
  exercice: currentYear,
  dateDebut: '',
  dateFin: '',
});

const form = ref<DeclarationRecette>({
  codeCommune: '422',
  exercice: currentYear,
  compteFonctionnel: '',
  numeroBordereau: '',
  numeroDeclaration: '',
  date: '',
  montant: 0,
  observations: '',
});

const columns = [
  { name: 'codeCommune', label: 'Code Commune', field: 'codeCommune', align: 'left' as const },
  {
    name: 'exercice',
    label: 'Exercice',
    field: 'exercice',
    align: 'center' as const,
    sortable: true,
  },
  {
    name: 'compteFonctionnel',
    label: 'Compte Fonct.',
    field: 'compteFonctionnel',
    align: 'left' as const,
  },
  {
    name: 'numeroBordereau',
    label: 'N° Bord.',
    field: 'numeroBordereau',
    align: 'center' as const,
  },
  {
    name: 'numeroDeclaration',
    label: 'N° Décl.',
    field: 'numeroDeclaration',
    align: 'center' as const,
    sortable: true,
  },
  { name: 'date', label: 'Date', field: 'date', align: 'center' as const, sortable: true },
  { name: 'montant', label: 'Montant', field: 'montant', align: 'right' as const, sortable: true },
  { name: 'actions', label: 'Actions', field: 'actions', align: 'center' as const },
];

const filteredDeclarations = computed(() => {
  let result = declarations.value.filter((d) => d.exercice === filters.value.exercice);

  if (filters.value.search) {
    const s = filters.value.search.toLowerCase();
    result = result.filter(
      (d) =>
        d.codeCommune.toLowerCase().includes(s) ||
        d.compteFonctionnel.toLowerCase().includes(s) ||
        d.numeroBordereau.toLowerCase().includes(s) ||
        d.numeroDeclaration.toLowerCase().includes(s),
    );
  }

  if (filters.value.dateDebut) {
    result = result.filter((d) => d.date >= filters.value.dateDebut);
  }

  if (filters.value.dateFin) {
    result = result.filter((d) => d.date <= filters.value.dateFin);
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
    declarations.value = [
      {
        id: 1,
        codeCommune: '422',
        exercice: 2025,
        compteFonctionnel: '7000',
        numeroBordereau: '003',
        numeroDeclaration: '015',
        date: '2025-01-05',
        montant: 1500000,
        observations: 'Contribution foncière',
      },
      {
        id: 2,
        codeCommune: '422',
        exercice: 2025,
        compteFonctionnel: '7004',
        numeroBordereau: '003',
        numeroDeclaration: '014',
        date: '2025-01-04',
        montant: 850000,
        observations: 'Patentes',
      },
      {
        id: 3,
        codeCommune: '422',
        exercice: 2025,
        compteFonctionnel: '7130',
        numeroBordereau: '002',
        numeroDeclaration: '013',
        date: '2025-01-03',
        montant: 320000,
      },
    ];
  } catch (error) {
    console.error('Erreur chargement:', error);
    $q.notify({ type: 'negative', message: 'Erreur lors du chargement' });
  } finally {
    loading.value = false;
  }
}

function openDialog(item?: DeclarationRecette) {
  isEdit.value = !!item;
  if (item) {
    form.value = { ...item };
  } else {
    const nextNum = declarations.value.filter((d) => d.exercice === currentYear).length + 1;
    form.value = {
      codeCommune: '422',
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

function saveDeclaration() {
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
    const index = declarations.value.findIndex((d) => d.id === form.value.id);
    if (index !== -1) {
      declarations.value[index] = { ...form.value };
    }
    $q.notify({ type: 'positive', message: 'Déclaration modifiée avec succès' });
  } else {
    const newId = Math.max(...declarations.value.map((d) => d.id ?? 0), 0) + 1;
    declarations.value.push({ ...form.value, id: newId });
    $q.notify({ type: 'positive', message: 'Déclaration créée avec succès' });
  }

  showDialog.value = false;
}

function viewDeclaration(item: DeclarationRecette) {
  $q.dialog({
    title: `Déclaration N° ${item.numeroDeclaration}`,
    message: `
Code Commune: ${item.codeCommune}
Exercice: ${item.exercice}
Compte Fonctionnel: ${item.compteFonctionnel}
N° Bordereau: ${item.numeroBordereau}
Date: ${item.date}
Montant: ${formatCurrency(item.montant)}
${item.observations ? `Observations: ${item.observations}` : ''}
    `.trim(),
  });
}

function confirmDelete(item: DeclarationRecette) {
  $q.dialog({
    title: 'Confirmation',
    message: `Voulez-vous vraiment supprimer la déclaration N° ${item.numeroDeclaration} ?`,
    cancel: true,
    persistent: true,
  }).onOk(() => {
    declarations.value = declarations.value.filter((d) => d.id !== item.id);
    $q.notify({ type: 'positive', message: 'Déclaration supprimée' });
  });
}

onMounted(() => {
  void loadData();
});
</script>
