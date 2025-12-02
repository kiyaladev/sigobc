<template>
  <q-page class="prevision-page q-pa-md">
    <PageHeader
      title="Prévisions Budgétaires"
      subtitle="Gestion des prévisions de dépenses"
      icon="pie_chart"
    />

    <q-card class="main-card">
      <q-card-section>
        <div class="row items-center justify-between q-mb-md">
          <div class="col-12 col-md-6">
            <q-input
              v-model="filter"
              placeholder="Rechercher une prévision..."
              outlined
              dense
              clearable
            >
              <template v-slot:prepend>
                <q-icon name="search" />
              </template>
            </q-input>
          </div>
          <div class="col-12 col-md-auto q-mt-sm q-mt-md-none q-gutter-sm">
            <q-btn
              color="secondary"
              icon="print"
              label="CT02"
              unelevated
              @click="showCT02Dialog = true"
            />
            <q-btn
              color="primary"
              icon="add"
              label="Nouvelle Prévision"
              unelevated
              @click="showAddDialog = true"
            />
          </div>
        </div>

        <DataTable
          :rows="filteredPrevisions"
          :columns="columns"
          :loading="loading"
          @edit="editPrevision"
          @delete="deletePrevision"
        />
      </q-card-section>
    </q-card>

    <!-- Dialog d'ajout/modification -->
    <q-dialog v-model="showAddDialog" persistent>
      <q-card style="min-width: 600px">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">
            {{ editingId ? 'Modifier la prévision' : 'Nouvelle prévision' }}
          </div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <q-form @submit="savePrevision" class="q-gutter-md">
            <q-input
              v-model.number="formData.exercice"
              label="Exercice *"
              outlined
              dense
              type="number"
              :rules="[(val) => !!val || 'Exercice requis']"
            />

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

            <q-select
              v-model="formData.sousChapitreId"
              :options="sousChapitreOptions"
              label="Sous-chapitre (Compte)"
              outlined
              dense
              emit-value
              map-options
              clearable
            />

            <q-input
              v-model.number="formData.montantPrevu"
              label="Montant Prévu *"
              outlined
              dense
              type="number"
              prefix="XOF"
              :rules="[(val) => !!val || 'Montant requis']"
            />

            <q-select
              v-model="formData.statut"
              :options="['brouillon', 'validee', 'cloturee']"
              label="Statut *"
              outlined
              dense
            />

            <q-input
              v-model="formData.observations"
              label="Observations"
              outlined
              dense
              type="textarea"
              rows="3"
            />

            <div class="row justify-end q-gutter-sm q-mt-md">
              <q-btn label="Annuler" flat color="grey-7" v-close-popup />
              <q-btn label="Enregistrer" type="submit" color="primary" unelevated />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Dialog CT02 - Livre d'exécution des opérations budgétaires dépenses -->
    <q-dialog v-model="showCT02Dialog" persistent>
      <q-card style="min-width: 500px">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">CT02 - Livre d'exécution budgétaire</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <div class="q-gutter-md">
            <q-select
              v-model="ct02Filters.exercice"
              :options="exerciceOptions"
              label="Exercice *"
              outlined
              dense
              emit-value
              map-options
            />

            <q-select
              v-model="ct02Filters.sousChapitreId"
              :options="sousChapitreOptions"
              label="Sous-chapitre (Compte)"
              outlined
              dense
              emit-value
              map-options
              clearable
            />

            <div class="row justify-end q-gutter-sm q-mt-md">
              <q-btn label="Annuler" flat color="grey-7" v-close-popup />
              <q-btn
                label="Imprimer CT02"
                icon="print"
                color="primary"
                unelevated
                @click="printCT02"
                :loading="loadingCT02"
              />
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { db, type Prevision, type Chapitre, type SousChapitre, type Mandat } from 'src/database/db';
import PageHeader from 'src/components/PageHeader.vue';
import DataTable from 'src/components/DataTable.vue';

const $q = useQuasar();
const loading = ref(false);
const loadingCT02 = ref(false);
const filter = ref('');
const showAddDialog = ref(false);
const showCT02Dialog = ref(false);
const editingId = ref<number | null>(null);

const previsions = ref<Prevision[]>([]);
const chapitres = ref<Chapitre[]>([]);
const sousChapitres = ref<SousChapitre[]>([]);
const mandats = ref<Mandat[]>([]);

const formData = ref({
  exercice: new Date().getFullYear(),
  chapitreId: null as number | null,
  sousChapitreId: null as number | null,
  montantPrevu: 0,
  statut: 'validee' as 'brouillon' | 'validee' | 'cloturee',
  observations: '',
});

// Filtres CT02
const ct02Filters = ref({
  exercice: new Date().getFullYear(),
  sousChapitreId: null as number | null,
});

const chapitreOptions = computed(() =>
  chapitres.value.map((c) => ({ label: `${c.code} - ${c.libelle}`, value: c.id })),
);

const sousChapitreOptions = computed(() =>
  sousChapitres.value.map((s) => ({ label: `${s.code} - ${s.libelle}`, value: s.id })),
);

const exerciceOptions = computed(() => {
  const currentYear = new Date().getFullYear();
  return [currentYear - 2, currentYear - 1, currentYear, currentYear + 1].map((y) => ({
    label: String(y),
    value: y,
  }));
});

const columns = [
  {
    name: 'exercice',
    label: 'Exercice',
    align: 'left' as const,
    field: 'exercice',
    sortable: true,
  },
  {
    name: 'chapitre',
    label: 'Chapitre',
    align: 'left' as const,
    field: (row: Prevision) => {
      const chapitre = chapitres.value.find((c) => c.id === row.chapitreId);
      return chapitre ? `${chapitre.code} - ${chapitre.libelle}` : '';
    },
  },
  {
    name: 'montantPrevu',
    label: 'Montant Prévu',
    align: 'right' as const,
    field: 'montantPrevu',
    format: (val: number) => formatMontant(val),
  },
  {
    name: 'montantEngage',
    label: 'Engagé',
    align: 'right' as const,
    field: 'montantEngage',
    format: (val: number) => formatMontant(val),
  },
  {
    name: 'montantDisponible',
    label: 'Disponible',
    align: 'right' as const,
    field: 'montantDisponible',
    format: (val: number) => formatMontant(val),
  },
  {
    name: 'statut',
    label: 'Statut',
    align: 'center' as const,
    field: 'statut',
  },
  {
    name: 'actions',
    label: 'Actions',
    align: 'center' as const,
    field: 'id',
  },
];

const filteredPrevisions = computed(() => {
  if (!filter.value) return previsions.value;
  const searchTerm = filter.value.toLowerCase();
  return previsions.value.filter((p) => p.exercice.toString().includes(searchTerm));
});

function formatMontant(montant: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    minimumFractionDigits: 0,
  }).format(montant);
}

async function loadData() {
  loading.value = true;
  try {
    previsions.value = await db.previsions.toArray();
    chapitres.value = await db.chapitres.filter((c) => c.actif).toArray();
    sousChapitres.value = await db.sousChapitres.filter((s) => s.actif).toArray();
    mandats.value = await db.mandats.toArray();
  } catch (error) {
    console.error('Erreur lors du chargement:', error);
    $q.notify({
      type: 'negative',
      message: 'Erreur lors du chargement des données',
    });
  } finally {
    loading.value = false;
  }
}

async function printCT02() {
  loadingCT02.value = true;
  try {
    const exercice = ct02Filters.value.exercice;
    const sousChapitreId = ct02Filters.value.sousChapitreId;

    // Récupérer la mairie
    const mairie = await db.mairies.toCollection().first();

    // Récupérer le sous-chapitre sélectionné
    let sousChapitreInfo = null;
    if (sousChapitreId) {
      sousChapitreInfo = await db.sousChapitres.get(sousChapitreId);
    }

    // Récupérer les prévisions de l'exercice
    const previsionsExercice = await db.previsions.where('exercice').equals(exercice).toArray();
    const previsionsFiltered = sousChapitreId
      ? previsionsExercice.filter(
          (p) => 'sousChapitreId' in p && p.sousChapitreId === sousChapitreId,
        )
      : previsionsExercice;

    // Récupérer les mandats de l'exercice (émis ou payés)
    const mandatsExercice = (await db.mandats.where('exercice').equals(exercice).toArray()).filter(
      (m) => m.statut === 'emis' || m.statut === 'paye',
    );

    // Si un sous-chapitre est sélectionné, filtrer les mandats
    const mandatsFiltres = sousChapitreId
      ? mandatsExercice.filter((m) => m.sousChapitreId === sousChapitreId)
      : mandatsExercice;

    // Calculer les totaux par chapitre (1-8)
    const chapitresCodes = ['1', '2', '3', '4', '5', '6', '7', '8'];
    const chapitresData = await db.chapitres.toArray();
    const chapitresMap = new Map(chapitresData.map((c) => [c.id, c]));

    // Prévisions par chapitre
    const previsionsByChapitreCode: Record<string, number> = {};
    chapitresCodes.forEach((code) => (previsionsByChapitreCode[code] = 0));

    previsionsFiltered.forEach((p) => {
      const chapitre = chapitresMap.get(p.chapitreId);
      if (chapitre && chapitresCodes.includes(chapitre.code)) {
        previsionsByChapitreCode[chapitre.code] += p.montantPrevu;
      }
    });

    // Émissions par chapitre
    const emissionsByChapitreCode: Record<string, number> = {};
    chapitresCodes.forEach((code) => (emissionsByChapitreCode[code] = 0));

    mandatsFiltres.forEach((m) => {
      const chapitre = chapitresMap.get(m.chapitreId);
      if (chapitre && chapitresCodes.includes(chapitre.code)) {
        emissionsByChapitreCode[chapitre.code] += m.montant;
      }
    });

    // Calculer les crédits disponibles
    const creditsDispoByChapitreCode: Record<string, number> = {};
    chapitresCodes.forEach((code) => {
      creditsDispoByChapitreCode[code] =
        previsionsByChapitreCode[code] - emissionsByChapitreCode[code];
    });

    // Calculer les totaux
    const totalPrevisions = Object.values(previsionsByChapitreCode).reduce((a, b) => a + b, 0);
    const totalEmissions = Object.values(emissionsByChapitreCode).reduce((a, b) => a + b, 0);
    const totalCreditsDispo = totalPrevisions - totalEmissions;

    // Grouper les mandats par mois pour l'affichage détaillé
    const mandatsByMonth: Record<string, Mandat[]> = {};
    mandatsFiltres.forEach((m) => {
      const date = new Date(m.dateMandat);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (!mandatsByMonth[monthKey]) {
        mandatsByMonth[monthKey] = [];
      }
      mandatsByMonth[monthKey].push(m);
    });

    // Préparer les données pour CT02.html
    const ct02Data = {
      mairie: mairie
        ? {
            nom: mairie.nom,
            code: mairie.code,
            ville: mairie.ville,
          }
        : null,
      exercice,
      sousChapitreCode: sousChapitreInfo?.code || 'TOUS',
      sousChapitreLibelle: sousChapitreInfo?.libelle || 'TOUS LES SOUS-CHAPITRES',
      chapitresCodes,
      previsionsByChapitreCode,
      emissionsByChapitreCode,
      creditsDispoByChapitreCode,
      totalPrevisions,
      totalEmissions,
      totalCreditsDispo,
      mandats: mandatsFiltres.map((m) => ({
        ...m,
        chapitreCode: chapitresMap.get(m.chapitreId)?.code || '',
      })),
      mandatsByMonth,
    };

    // Ouvrir CT02.html dans une nouvelle fenêtre et lui envoyer les données
    const ct02Window = window.open('/CT02.html', '_blank');
    if (ct02Window) {
      ct02Window.addEventListener('load', () => {
        ct02Window.postMessage({ type: 'FILL_CT02_DATA', data: ct02Data }, '*');
      });
    }

    showCT02Dialog.value = false;
  } catch (error) {
    console.error('Erreur lors de la génération du CT02:', error);
    $q.notify({
      type: 'negative',
      message: 'Erreur lors de la génération du CT02',
    });
  } finally {
    loadingCT02.value = false;
  }
}

function resetForm() {
  formData.value = {
    exercice: new Date().getFullYear(),
    chapitreId: null,
    sousChapitreId: null,
    montantPrevu: 0,
    statut: 'validee',
    observations: '',
  };
  editingId.value = null;
}

async function savePrevision() {
  try {
    const now = new Date();
    const mairieId = 1;
    const personnelId = 1;

    const data = {
      ...formData.value,
      montantEngage: 0,
      montantDisponible: formData.value.montantPrevu,
      mairieId,
      personnelId,
      chapitreId: formData.value.chapitreId!,
      sousChapitreId: formData.value.sousChapitreId || undefined,
    };

    if (editingId.value) {
      await db.previsions.update(editingId.value, {
        ...data,
        updatedAt: now,
      });
      $q.notify({
        type: 'positive',
        message: 'Prévision modifiée avec succès',
      });
    } else {
      await db.previsions.add({
        ...data,
        createdAt: now,
        updatedAt: now,
      });
      $q.notify({
        type: 'positive',
        message: 'Prévision ajoutée avec succès',
      });
    }

    showAddDialog.value = false;
    resetForm();
    await loadData();
  } catch (error) {
    console.error('Erreur lors de la sauvegarde:', error);
    $q.notify({
      type: 'negative',
      message: "Erreur lors de l'enregistrement",
    });
  }
}

function editPrevision(row: Prevision) {
  editingId.value = row.id!;
  formData.value = {
    exercice: row.exercice,
    chapitreId: row.chapitreId,
    sousChapitreId: ('sousChapitreId' in row ? row.sousChapitreId : null) || null,
    montantPrevu: row.montantPrevu,
    statut: row.statut,
    observations: row.observations || '',
  };
  showAddDialog.value = true;
}

function deletePrevision(row: Prevision) {
  $q.dialog({
    title: 'Confirmation',
    message: 'Voulez-vous vraiment supprimer cette prévision ?',
    cancel: true,
    persistent: true,
  }).onOk(() => {
    void (async () => {
      try {
        await db.previsions.delete(row.id);
        $q.notify({
          type: 'positive',
          message: 'Prévision supprimée avec succès',
        });
        await loadData();
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        $q.notify({
          type: 'negative',
          message: 'Erreur lors de la suppression',
        });
      }
    })();
  });
}

onMounted(() => {
  void loadData();
});
</script>

<style scoped lang="scss">
.prevision-page {
  max-width: 1400px;
  margin: 0 auto;
}

.main-card {
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}
</style>
