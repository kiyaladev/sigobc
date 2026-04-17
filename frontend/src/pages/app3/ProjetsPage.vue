<template>
  <q-page class="projets-page q-pa-md">
    <PageHeader
      title="Projets"
      subtitle="Gestion des projets d'investissement"
      icon="engineering"
    />

    <q-card class="main-card">
      <q-card-section>
        <!-- Filtres -->
        <div class="row q-col-gutter-sm q-mb-md">
          <div class="col-12 col-md-3">
            <q-select
              v-model="filterAnnee"
              :options="anneeFilterOptions"
              label="Année"
              outlined
              dense
              emit-value
              map-options
              clearable
            />
          </div>
          <div class="col-12 col-md-3">
            <q-select
              v-model="filterTypeBien"
              :options="typeBienOptions"
              label="Type de bien"
              outlined
              dense
              emit-value
              map-options
              clearable
            />
          </div>
          <div class="col-12 col-md-3">
            <q-select
              v-model="filterStatut"
              :options="statutOptions"
              label="Statut"
              outlined
              dense
              emit-value
              map-options
              clearable
            />
          </div>
          <div class="col-12 col-md-3">
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
            <q-input
              v-model="filter"
              placeholder="Rechercher un projet..."
              outlined
              dense
              clearable
            >
              <template v-slot:prepend>
                <q-icon name="search" />
              </template>
            </q-input>
          </div>
          <div class="col-12 col-md-auto q-mt-sm q-mt-md-none q-gutter-x-sm">
            <q-btn
              color="primary"
              icon="add"
              label="Nouveau Projet"
              unelevated
              @click="openAddDialog"
            />
            <q-btn
              v-if="isDev"
              color="orange"
              icon="science"
              label="Fake Projet"
              unelevated
              @click="createFakeProjet"
            />
          </div>
        </div>

        <DataTable
          :rows="filteredProjets"
          :columns="columns"
          :loading="loading"
          show-print
          show-export-csv
          show-custom-actions
          export-filename="projets"
          @edit="editProjet"
          @delete="deleteProjet"
        >
          <template #custom-actions="{ row }">
            <q-btn
              flat
              round
              dense
              :icon="row.statut === 'annule' ? 'check_circle' : 'block'"
              :color="row.statut === 'annule' ? 'positive' : 'warning'"
              @click="toggleProjet(row)"
            >
              <q-tooltip>{{ row.statut === 'annule' ? 'Réactiver' : 'Désactiver' }}</q-tooltip>
            </q-btn>
          </template>

          <template v-slot:body-cell-compteFonctionnel="props">
            <q-td :props="props">
              {{ getCompteFonctionnel(props.row.sousChapitreId) }}
            </q-td>
          </template>

          <template v-slot:body-cell-typeBien="props">
            <q-td :props="props">
              <q-chip
                v-if="props.row.typeBien"
                :color="getTypeBienColor(props.row.typeBien)"
                text-color="white"
                size="sm"
                dense
              >
                {{ getTypeBienLabel(props.row.typeBien) }}
              </q-chip>
              <span v-else>-</span>
            </q-td>
          </template>

          <template v-slot:body-cell-statut="props">
            <q-td :props="props">
              <q-chip :color="getStatutColor(props.row.statut)" text-color="white" size="sm" dense>
                {{ getStatutLabel(props.row.statut) }}
              </q-chip>
            </q-td>
          </template>

          <template v-slot:body-cell-tauxRealisation="props">
            <q-td :props="props">
              <q-linear-progress
                :value="props.row.montant > 0 ? props.row.realise / props.row.montant : 0"
                :color="props.row.realise >= props.row.montant ? 'positive' : 'primary'"
                rounded
                size="20px"
                class="q-mt-xs"
              >
                <div class="absolute-full flex flex-center">
                  <q-badge
                    color="transparent"
                    text-color="white"
                    :label="
                      (props.row.montant > 0
                        ? (props.row.realise / props.row.montant) * 100
                        : 0
                      ).toFixed(0) + '%'
                    "
                  />
                </div>
              </q-linear-progress>
            </q-td>
          </template>
        </DataTable>
      </q-card-section>
    </q-card>

    <!-- Dialog d'ajout/modification -->
    <q-dialog v-model="showAddDialog" persistent>
      <q-card style="min-width: 900px">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">{{ editingId ? 'Modifier le projet' : 'Nouveau projet' }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-pt-md">
          <q-form @submit="saveProjet" class="q-gutter-sm">
            <!-- Section 1: Informations générales -->
            <div class="text-subtitle2 text-grey-8 q-mb-xs">Informations générales</div>
            <div class="row q-col-gutter-sm">
              <div class="col-12 col-md-8">
                <q-input
                  v-model="formData.libelle"
                  label="Libellé du projet *"
                  outlined
                  dense
                  :rules="[(val) => !!val || 'Libellé requis']"
                />
              </div>
              <div class="col-12 col-md-4">
                <q-input
                  v-model.number="formData.annee"
                  label="Année *"
                  outlined
                  dense
                  type="number"
                  :rules="[(val) => !!val || 'Année requise']"
                />
              </div>
            </div>
            <div class="row q-col-gutter-sm">
              <div class="col-12 col-md-6">
                <q-input
                  v-model="formData.refPT"
                  label="Référence PT (ex: PT 24-26)"
                  outlined
                  dense
                  clearable
                />
              </div>
              <div class="col-12 col-md-6">
                <q-input v-model="formData.numeroOrdre" label="N° d'ordre" outlined dense />
              </div>
            </div>

            <q-separator class="q-my-sm" />

            <!-- Section 2: Classification -->
            <div class="text-subtitle2 text-grey-8 q-mb-xs">Classification</div>
            <div class="row q-col-gutter-sm">
              <div class="col-12 col-md-6">
                <q-select
                  v-model="formData.sousChapitreId"
                  :options="filteredSousChapitreOptions"
                  label="Compte fonctionnel"
                  outlined
                  dense
                  emit-value
                  map-options
                  clearable
                  use-input
                  input-debounce="0"
                  @filter="filterSousChapitre"
                />
              </div>
              <div class="col-12 col-md-6">
                <q-select
                  v-model="formData.typeBien"
                  :options="typeBienOptions"
                  label="Type de bien"
                  outlined
                  dense
                  emit-value
                  map-options
                  clearable
                />
              </div>
            </div>

            <div class="row q-col-gutter-sm">
              <div class="col-12 col-md-6">
                <q-input
                  v-model="formData.patrimoine"
                  label="Patrimoine"
                  outlined
                  dense
                  placeholder="Ex: Bâtiment communal"
                />
              </div>
              <div class="col-12 col-md-6">
                <q-select
                  v-model="formData.statut"
                  :options="statutOptions"
                  label="Statut *"
                  outlined
                  dense
                  emit-value
                  map-options
                />
              </div>
            </div>

            <q-separator class="q-my-sm" />

            <!-- Section 3: Détails financiers -->
            <div class="text-subtitle2 text-grey-8 q-mb-xs">Détails financiers</div>
            <div class="row q-col-gutter-sm">
              <div class="col-12 col-md-6">
                <q-input
                  v-model.number="formData.montant"
                  label="Montant *"
                  outlined
                  dense
                  type="number"
                  suffix="CFA"
                  :rules="[(val) => val > 0 || 'Montant requis']"
                />
              </div>
              <div class="col-12 col-md-6">
                <q-input
                  v-model.number="formData.realise"
                  label="Réalisé"
                  outlined
                  dense
                  type="number"
                  suffix="CFA"
                />
              </div>
            </div>

            <q-separator class="q-my-sm" />

            <!-- Section 4: Notes -->
            <div class="text-subtitle2 text-grey-8 q-mb-xs">Notes</div>
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
import { useQuasar } from 'quasar';
import { db, type Projet, type SousChapitre } from 'src/database/db';
import PageHeader from 'src/components/PageHeader.vue';
import DataTable from 'src/components/DataTable.vue';

const $q = useQuasar();
const loading = ref(false);
const filter = ref('');
const showAddDialog = ref(false);
const editingId = ref<number | null>(null);

const isDev = computed(() => import.meta.env.DEV);

// Filtres
const filterAnnee = ref<number | null>(null);
const filterTypeBien = ref<string | null>(null);
const filterStatut = ref<string | null>(null);

const projets = ref<Projet[]>([]);
const sousChapitres = ref<SousChapitre[]>([]);

const formData = ref({
  numeroOrdre: '',
  refPT: '',
  libelle: '',
  sousChapitreId: null as number | null,
  patrimoine: '',
  montant: 0,
  realise: 0,
  annee: new Date().getFullYear(),
  typeBien: '' as '' | 'immobilier' | 'mobilier' | 'incorporel',
  statut: 'en_cours' as 'en_cours' | 'termine' | 'annule',
  observations: '',
});

const typeBienOptions = [
  { label: 'Immobilier', value: 'immobilier' },
  { label: 'Mobilier', value: 'mobilier' },
  { label: 'Incorporel', value: 'incorporel' },
];

const statutOptions = [
  { label: 'En cours', value: 'en_cours' },
  { label: 'Terminé', value: 'termine' },
  { label: 'Annulé', value: 'annule' },
];

const sousChapitreOptions = computed(() =>
  sousChapitres.value.map((s) => ({ label: `${s.code} - ${s.libelle}`, value: s.id })),
);
const filteredSousChapitreOptions = ref(sousChapitreOptions.value);

const anneeFilterOptions = computed(() => {
  const years = [...new Set(projets.value.map((p) => p.annee))].sort((a, b) => b - a);
  return years.map((y) => ({ label: String(y), value: y }));
});

const columns = [
  {
    name: 'numeroOrdre',
    label: 'N°',
    field: 'numeroOrdre',
    align: 'center' as const,
    sortable: true,
    style: 'width: 50px',
  },
  {
    name: 'refPT',
    label: 'Réf. PT',
    field: 'refPT',
    align: 'center' as const,
    sortable: true,
    style: 'width: 80px',
  },
  {
    name: 'libelle',
    label: 'Libellé',
    field: 'libelle',
    align: 'left' as const,
    sortable: true,
  },
  {
    name: 'compteFonctionnel',
    label: 'Compte Fonctionnel',
    field: 'sousChapitreId',
    align: 'left' as const,
    sortable: true,
  },
  {
    name: 'patrimoine',
    label: 'Patrimoine',
    field: 'patrimoine',
    align: 'left' as const,
    sortable: true,
  },
  {
    name: 'montant',
    label: 'Montant',
    field: 'montant',
    align: 'right' as const,
    sortable: true,
    format: (v: number) => new Intl.NumberFormat('fr-FR').format(v) + ' CFA',
  },
  {
    name: 'realise',
    label: 'Réalisé',
    field: 'realise',
    align: 'right' as const,
    sortable: true,
    format: (v: number) => new Intl.NumberFormat('fr-FR').format(v) + ' CFA',
  },
  {
    name: 'tauxRealisation',
    label: 'Taux',
    field: (row: Projet) => (row.montant > 0 ? (row.realise / row.montant) * 100 : 0),
    align: 'center' as const,
    sortable: true,
  },
  {
    name: 'annee',
    label: 'Année',
    field: 'annee',
    align: 'center' as const,
    sortable: true,
  },
  {
    name: 'typeBien',
    label: 'Type',
    field: 'typeBien',
    align: 'center' as const,
    sortable: true,
  },
  {
    name: 'statut',
    label: 'Statut',
    field: 'statut',
    align: 'center' as const,
    sortable: true,
  },
  {
    name: 'actions',
    label: 'Actions',
    field: 'actions',
    align: 'center' as const,
    sortable: false,
  },
];

const filteredProjets = computed(() => {
  let result = projets.value;
  if (filterAnnee.value) {
    result = result.filter((p) => p.annee === filterAnnee.value);
  }
  if (filterTypeBien.value) {
    result = result.filter((p) => p.typeBien === filterTypeBien.value);
  }
  if (filterStatut.value) {
    result = result.filter((p) => p.statut === filterStatut.value);
  }
  if (filter.value) {
    const needle = filter.value.toLowerCase();
    result = result.filter(
      (p) =>
        p.libelle.toLowerCase().includes(needle) ||
        (p.patrimoine || '').toLowerCase().includes(needle) ||
        (p.observations || '').toLowerCase().includes(needle),
    );
  }
  return result;
});

function getCompteFonctionnel(sousChapitreId?: number): string {
  if (!sousChapitreId) return '-';
  const sc = sousChapitres.value.find((s) => s.id === sousChapitreId);
  return sc ? `${sc.code} - ${sc.libelle}` : '-';
}

function getTypeBienLabel(type: string): string {
  const opt = typeBienOptions.find((o) => o.value === type);
  return opt ? opt.label : type;
}

function getTypeBienColor(type: string): string {
  switch (type) {
    case 'immobilier':
      return 'blue';
    case 'mobilier':
      return 'teal';
    case 'incorporel':
      return 'purple';
    default:
      return 'grey';
  }
}

function getStatutLabel(statut: string): string {
  const opt = statutOptions.find((o) => o.value === statut);
  return opt ? opt.label : statut;
}

function getStatutColor(statut: string): string {
  switch (statut) {
    case 'en_cours':
      return 'primary';
    case 'termine':
      return 'positive';
    case 'annule':
      return 'negative';
    default:
      return 'grey';
  }
}

function filterSousChapitre(val: string, update: (callback: () => void) => void) {
  if (val === '') {
    update(() => {
      filteredSousChapitreOptions.value = sousChapitreOptions.value;
    });
    return;
  }
  update(() => {
    const needle = val.toLowerCase();
    filteredSousChapitreOptions.value = sousChapitreOptions.value.filter(
      (v) => v.label.toLowerCase().indexOf(needle) > -1,
    );
  });
}

async function loadData() {
  loading.value = true;
  try {
    const [allProjets, allSousChapitres] = await Promise.all([
      db.projets.toArray(),
      db.sousChapitres.toArray(),
    ]);
    projets.value = allProjets.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
    sousChapitres.value = allSousChapitres;
    filteredSousChapitreOptions.value = sousChapitreOptions.value;
  } catch (error) {
    console.error('Erreur chargement projets:', error);
    $q.notify({ type: 'negative', message: 'Erreur de chargement des projets' });
  } finally {
    loading.value = false;
  }
}

function resetForm() {
  formData.value = {
    numeroOrdre: '',
    refPT: '',
    libelle: '',
    sousChapitreId: null,
    patrimoine: '',
    montant: 0,
    realise: 0,
    annee: new Date().getFullYear(),
    typeBien: '',
    statut: 'en_cours',
    observations: '',
  };
  editingId.value = null;
}

function resetFilters() {
  filterAnnee.value = null;
  filterTypeBien.value = null;
  filterStatut.value = null;
  filter.value = '';
}

function openAddDialog() {
  resetForm();
  showAddDialog.value = true;
}

async function saveProjet() {
  try {
    const now = new Date();
    const baseData = {
      ...(formData.value.numeroOrdre ? { numeroOrdre: formData.value.numeroOrdre } : {}),
      ...(formData.value.refPT ? { refPT: formData.value.refPT } : {}),
      libelle: formData.value.libelle,
      ...(formData.value.sousChapitreId ? { sousChapitreId: formData.value.sousChapitreId } : {}),
      ...(formData.value.patrimoine ? { patrimoine: formData.value.patrimoine } : {}),
      montant: formData.value.montant,
      realise: formData.value.realise || 0,
      annee: formData.value.annee,
      ...(formData.value.typeBien ? { typeBien: formData.value.typeBien } : {}),
      statut: formData.value.statut,
      ...(formData.value.observations ? { observations: formData.value.observations } : {}),
      mairieId: 1,
      personnelId: 1,
    };

    if (editingId.value) {
      await db.projets.update(editingId.value, { ...baseData, updatedAt: now });
      $q.notify({ type: 'positive', message: 'Projet modifié' });
    } else {
      await db.projets.add({ ...baseData, createdAt: now, updatedAt: now } as Omit<Projet, 'id'>);
      $q.notify({ type: 'positive', message: 'Projet créé' });
    }
    showAddDialog.value = false;
    await loadData();
  } catch (error) {
    console.error('Erreur sauvegarde:', error);
    $q.notify({ type: 'negative', message: 'Erreur lors de la sauvegarde' });
  }
}

function editProjet(row: Projet) {
  editingId.value = row.id ?? null;
  formData.value = {
    numeroOrdre: row.numeroOrdre || '',
    refPT: row.refPT || '',
    libelle: row.libelle,
    sousChapitreId: row.sousChapitreId ?? null,
    patrimoine: row.patrimoine || '',
    montant: row.montant,
    realise: row.realise,
    annee: row.annee,
    typeBien: (row.typeBien as '' | 'immobilier' | 'mobilier' | 'incorporel') || '',
    statut: row.statut,
    observations: row.observations || '',
  };
  showAddDialog.value = true;
}

function deleteProjet(row: Projet) {
  $q.dialog({
    title: 'Confirmation',
    message: `Supprimer le projet "${row.libelle}" ?`,
    cancel: true,
    persistent: true,
  }).onOk(() => {
    void (async () => {
      try {
        if (row.id) {
          await db.projets.delete(row.id);
          $q.notify({ type: 'positive', message: 'Projet supprimé' });
          await loadData();
        }
      } catch (error) {
        console.error('Erreur suppression:', error);
        $q.notify({ type: 'negative', message: 'Erreur lors de la suppression' });
      }
    })();
  });
}

function toggleProjet(row: Projet) {
  const isActive = row.statut !== 'annule';
  const action = isActive ? 'Désactiver' : 'Réactiver';
  $q.dialog({
    title: 'Confirmation',
    message: `${action} le projet "${row.libelle}" ?`,
    cancel: true,
    persistent: true,
  }).onOk(() => {
    void (async () => {
      try {
        if (row.id) {
          const newStatut = isActive ? 'annule' : 'en_cours';
          await db.projets.update(row.id, { statut: newStatut, updatedAt: new Date() });
          $q.notify({ type: 'positive', message: `Projet ${isActive ? 'désactivé' : 'réactivé'}` });
          await loadData();
        }
      } catch (error) {
        console.error('Erreur:', error);
        $q.notify({ type: 'negative', message: `Erreur lors de la ${action.toLowerCase()}` });
      }
    })();
  });
}

async function createFakeProjet() {
  try {
    const sc = sousChapitres.value.filter((s) => (s.code || '').startsWith('9'));
    if (sc.length === 0) {
      $q.notify({ type: 'warning', message: 'Aucun compte fonctionnel 9xx trouvé' });
      return;
    }
    const randomSC = sc[Math.floor(Math.random() * sc.length)]!;
    const types = ['immobilier', 'mobilier', 'incorporel'] as const;
    const randomType = types[Math.floor(Math.random() * types.length)]!;
    const montant = Math.floor(Math.random() * 50000000) + 1000000;
    const realise = Math.floor(Math.random() * montant);
    const now = new Date();

    const labels = [
      'Construction école primaire',
      'Réhabilitation marché central',
      'Acquisition véhicule utilitaire',
      'Logiciel de gestion',
      'Extension réseau eau potable',
      'Aménagement voirie communale',
      'Équipement salle informatique',
      'Construction centre de santé',
    ];
    const randomLabel = labels[Math.floor(Math.random() * labels.length)]!;

    await db.projets.add({
      libelle: randomLabel,
      sousChapitreId: randomSC.id!,
      patrimoine: `PAT-${Math.floor(Math.random() * 1000)}`,
      montant,
      realise,
      annee: new Date().getFullYear(),
      typeBien: randomType,
      statut: 'en_cours',
      mairieId: 1,
      personnelId: 1,
      createdAt: now,
      updatedAt: now,
    });
    $q.notify({ type: 'positive', message: 'Projet fake créé' });
    await loadData();
  } catch (error) {
    console.error('Erreur:', error);
    $q.notify({ type: 'negative', message: 'Erreur création fake' });
  }
}

onMounted(loadData);
</script>

<style scoped>
.projets-page {
  max-width: 1400px;
  margin: 0 auto;
}
.main-card {
  border-radius: 12px;
}
</style>
