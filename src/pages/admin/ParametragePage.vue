<template>
  <q-page class="parametrage-page q-pa-md">
    <PageHeader
      title="Paramétrage"
      subtitle="Configuration générale de l'application"
      icon="settings"
    />

    <!-- Gestion des Exercices Budgétaires -->
    <q-card class="main-card q-mt-md">
      <q-card-section>
        <div class="row items-center justify-between q-mb-md">
          <div class="text-h6">
            <q-icon name="calendar_today" class="q-mr-sm" />
            Gestion des Exercices Budgétaires
          </div>
          <q-btn color="primary" icon="add" label="Nouvel Exercice" @click="openExerciceDialog()" />
        </div>

        <q-table
          :rows="exercices"
          :columns="exerciceColumns"
          row-key="id"
          :loading="loading"
          flat
          bordered
          :pagination="{ rowsPerPage: 10 }"
        >
          <template v-slot:body-cell-annee="props">
            <q-td :props="props">
              <strong>{{ props.row.annee }}</strong>
            </q-td>
          </template>

          <template v-slot:body-cell-statut="props">
            <q-td :props="props">
              <q-chip
                :color="props.row.statut === 'ouvert' ? 'positive' : 'orange'"
                text-color="white"
                size="sm"
                :icon="props.row.statut === 'ouvert' ? 'lock_open' : 'lock'"
              >
                {{ props.row.statut === 'ouvert' ? 'Ouvert' : 'Verrouillé' }}
              </q-chip>
            </q-td>
          </template>

          <template v-slot:body-cell-dateVerrouillage="props">
            <q-td :props="props">
              {{ props.row.dateVerrouillage ? formatDate(props.row.dateVerrouillage) : '-' }}
            </q-td>
          </template>

          <template v-slot:body-cell-actions="props">
            <q-td :props="props" class="q-gutter-xs">
              <q-btn
                v-if="props.row.statut === 'ouvert'"
                flat
                round
                dense
                color="orange"
                icon="lock"
                @click="confirmVerrouiller(props.row)"
              >
                <q-tooltip>Verrouiller cet exercice</q-tooltip>
              </q-btn>
              <q-btn
                v-else
                flat
                round
                dense
                color="positive"
                icon="lock_open"
                @click="confirmOuvrir(props.row)"
              >
                <q-tooltip>Rouvrir cet exercice</q-tooltip>
              </q-btn>
              <q-btn
                flat
                round
                dense
                color="negative"
                icon="delete"
                @click="confirmDeleteExercice(props.row)"
              >
                <q-tooltip>Supprimer</q-tooltip>
              </q-btn>
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <!-- Informations Mairie -->
    <q-card class="main-card q-mt-md">
      <q-card-section>
        <div class="row items-center justify-between q-mb-md">
          <div class="text-h6">
            <q-icon name="business" class="q-mr-sm" />
            Informations de la Mairie
          </div>
        </div>

        <div v-if="mairie" class="row q-col-gutter-md">
          <div class="col-12 col-md-6">
            <q-item>
              <q-item-section avatar>
                <q-icon name="business" color="primary" />
              </q-item-section>
              <q-item-section>
                <q-item-label caption>Nom</q-item-label>
                <q-item-label class="text-weight-bold text-body1">{{ mairie.nom }}</q-item-label>
              </q-item-section>
            </q-item>
          </div>
          <div class="col-12 col-md-3">
            <q-item>
              <q-item-section avatar>
                <q-icon name="tag" color="secondary" />
              </q-item-section>
              <q-item-section>
                <q-item-label caption>Code</q-item-label>
                <q-item-label class="text-weight-bold text-body1">{{ mairie.code }}</q-item-label>
              </q-item-section>
            </q-item>
          </div>
          <div class="col-12 col-md-3">
            <q-item>
              <q-item-section avatar>
                <q-icon name="location_city" color="orange" />
              </q-item-section>
              <q-item-section>
                <q-item-label caption>Ville</q-item-label>
                <q-item-label class="text-weight-bold text-body1">{{ mairie.ville }}</q-item-label>
              </q-item-section>
            </q-item>
          </div>
          <div class="col-12 col-md-4">
            <q-item>
              <q-item-section avatar>
                <q-icon name="map" color="teal" />
              </q-item-section>
              <q-item-section>
                <q-item-label caption>Département</q-item-label>
                <q-item-label class="text-weight-bold text-body1">{{
                  mairie.departement || '-'
                }}</q-item-label>
              </q-item-section>
            </q-item>
          </div>
          <div class="col-12 col-md-4">
            <q-item>
              <q-item-section avatar>
                <q-icon name="public" color="deep-purple" />
              </q-item-section>
              <q-item-section>
                <q-item-label caption>Région</q-item-label>
                <q-item-label class="text-weight-bold text-body1">{{
                  mairie.region || '-'
                }}</q-item-label>
              </q-item-section>
            </q-item>
          </div>
          <div class="col-12 col-md-4">
            <q-item>
              <q-item-section avatar>
                <q-icon name="person" color="primary" />
              </q-item-section>
              <q-item-section>
                <q-item-label caption>Maire</q-item-label>
                <q-item-label class="text-weight-bold text-body1">{{
                  mairie.maire || '-'
                }}</q-item-label>
              </q-item-section>
            </q-item>
          </div>
          <div class="col-12 col-md-4">
            <q-item>
              <q-item-section avatar>
                <q-icon name="phone" color="green" />
              </q-item-section>
              <q-item-section>
                <q-item-label caption>Téléphone</q-item-label>
                <q-item-label class="text-weight-bold text-body1">{{
                  mairie.telephone || '-'
                }}</q-item-label>
              </q-item-section>
            </q-item>
          </div>
          <div class="col-12 col-md-4">
            <q-item>
              <q-item-section avatar>
                <q-icon name="email" color="blue" />
              </q-item-section>
              <q-item-section>
                <q-item-label caption>Email</q-item-label>
                <q-item-label class="text-weight-bold text-body1">{{
                  mairie.email || '-'
                }}</q-item-label>
              </q-item-section>
            </q-item>
          </div>
          <div class="col-12 col-md-4">
            <q-item>
              <q-item-section avatar>
                <q-icon name="home" color="brown" />
              </q-item-section>
              <q-item-section>
                <q-item-label caption>Adresse</q-item-label>
                <q-item-label class="text-weight-bold text-body1">{{
                  mairie.adresse || '-'
                }}</q-item-label>
              </q-item-section>
            </q-item>
          </div>
        </div>
        <div v-else class="text-center text-grey-5 q-pa-lg">
          <q-icon name="info" size="32px" class="q-mb-sm" />
          <div>Aucune mairie configurée. Veuillez initialiser la base de données.</div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Dialog création exercice -->
    <q-dialog v-model="showExerciceDialog" persistent>
      <q-card style="min-width: 400px">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">Nouvel Exercice Budgétaire</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <q-form @submit="saveExercice" class="q-gutter-md">
            <q-input
              v-model.number="exerciceForm.annee"
              label="Année *"
              outlined
              dense
              type="number"
              :rules="[
                (val) => !!val || 'Année requise',
                (val) => (val >= 2020 && val <= 2050) || 'Année entre 2020 et 2050',
                (val) => !exerciceExists(val) || 'Cet exercice existe déjà',
              ]"
            />

            <q-input
              v-model="exerciceForm.libelle"
              label="Libellé (optionnel)"
              outlined
              dense
              :placeholder="`Exercice budgétaire ${exerciceForm.annee}`"
            />

            <q-input
              v-model="exerciceForm.observations"
              label="Observations"
              outlined
              dense
              type="textarea"
              rows="2"
            />

            <div class="row justify-end q-gutter-sm q-mt-md">
              <q-btn label="Annuler" flat color="grey-7" v-close-popup />
              <q-btn label="Créer" type="submit" color="primary" unelevated />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useQuasar, date } from 'quasar';
import { db, type Exercice, type Mairie, DEFAULT_MAIRIE_ID } from 'src/database/db';
import PageHeader from 'src/components/PageHeader.vue';

const $q = useQuasar();

const exercices = ref<Exercice[]>([]);
const mairie = ref<Mairie | null>(null);
const loading = ref(false);

const showExerciceDialog = ref(false);

const exerciceForm = ref({
  annee: new Date().getFullYear(),
  libelle: '',
  observations: '',
});

const exerciceColumns = [
  { name: 'annee', label: 'Année', field: 'annee', align: 'center' as const, sortable: true },
  {
    name: 'libelle',
    label: 'Libellé',
    field: (row: Exercice) => row.libelle || `Exercice ${row.annee}`,
    align: 'left' as const,
  },
  { name: 'statut', label: 'Statut', field: 'statut', align: 'center' as const },
  {
    name: 'dateVerrouillage',
    label: 'Date verrouillage',
    field: 'dateVerrouillage',
    align: 'center' as const,
  },
  { name: 'observations', label: 'Observations', field: 'observations', align: 'left' as const },
  { name: 'actions', label: 'Actions', field: 'actions', align: 'center' as const },
];

function formatDate(dateValue: Date | undefined): string {
  if (!dateValue) return '-';
  return date.formatDate(dateValue, 'DD/MM/YYYY');
}

function exerciceExists(annee: number): boolean {
  return exercices.value.some((e) => e.annee === annee);
}

async function loadData() {
  loading.value = true;
  try {
    exercices.value = await db.exercices.orderBy('annee').reverse().toArray();
    let m = await db.mairies.get(DEFAULT_MAIRIE_ID);
    if (!m) m = await db.mairies.toCollection().first();
    if (!m) {
      // Créer la mairie par défaut si elle n'existe pas
      const now = new Date();
      await db.mairies.add({
        nom: 'Mairie de Vavoua',
        code: '433',
        adresse: 'Avenue Principale',
        ville: 'Vavoua',
        departement: 'Vavoua',
        region: 'Haut-Sassandra',
        codePostal: '00225',
        telephone: '+225 23 54 00 00',
        email: 'contact@mairie-vavoua.ci',
        maire: 'KALOU BONAVENTURE',
        createdAt: now,
        updatedAt: now,
      });
      m = await db.mairies.toCollection().first();
    } else if (!m.maire || !m.departement || !m.region) {
      // Compléter les champs manquants sur une mairie existante
      const mId = m.id!;
      await db.mairies.update(mId, {
        maire: m.maire || 'KALOU BONAVENTURE',
        departement: m.departement || 'Vavoua',
        region: m.region || 'Haut-Sassandra',
        adresse: m.adresse || 'Avenue Principale',
        email: m.email || 'contact@mairie-vavoua.ci',
        updatedAt: new Date(),
      });
      m = await db.mairies.get(mId);
    }
    mairie.value = m || null;
  } catch (error) {
    console.error('Erreur:', error);
    $q.notify({ type: 'negative', message: 'Erreur lors du chargement' });
  } finally {
    loading.value = false;
  }
}

function openExerciceDialog() {
  exerciceForm.value = {
    annee: new Date().getFullYear(),
    libelle: '',
    observations: '',
  };
  showExerciceDialog.value = true;
}

async function saveExercice() {
  if (!exerciceForm.value.annee) return;

  try {
    const now = new Date();
    await db.exercices.add({
      annee: exerciceForm.value.annee,
      libelle: exerciceForm.value.libelle || `Exercice ${exerciceForm.value.annee}`,
      statut: 'ouvert',
      mairieId: DEFAULT_MAIRIE_ID,
      dateOuverture: now,
      observations: exerciceForm.value.observations,
      createdAt: now,
      updatedAt: now,
    });

    $q.notify({ type: 'positive', message: `Exercice ${exerciceForm.value.annee} créé` });
    showExerciceDialog.value = false;
    await loadData();
  } catch (error) {
    console.error('Erreur:', error);
    $q.notify({ type: 'negative', message: "Erreur lors de la création de l'exercice" });
  }
}

function confirmVerrouiller(exercice: Exercice) {
  $q.dialog({
    title: "Verrouiller l'exercice",
    message: `Voulez-vous verrouiller l'exercice ${exercice.annee} ? Les opérations sur cette année ne seront plus modifiables.`,
    cancel: { label: 'Annuler', flat: true },
    ok: { label: 'Verrouiller', color: 'orange' },
    persistent: true,
  }).onOk(() => {
    void (async () => {
      try {
        if (!exercice.id) return;
        const exerciceId = exercice.id;
        await db.exercices.update(exerciceId, {
          statut: 'verrouille',
          dateVerrouillage: new Date(),
          updatedAt: new Date(),
        });
        $q.notify({ type: 'positive', message: `Exercice ${exercice.annee} verrouillé` });
        await loadData();
      } catch (error) {
        console.error('Erreur:', error);
        $q.notify({ type: 'negative', message: 'Erreur lors du verrouillage' });
      }
    })();
  });
}

function confirmOuvrir(exercice: Exercice) {
  $q.dialog({
    title: "Rouvrir l'exercice",
    message: `Voulez-vous rouvrir l'exercice ${exercice.annee} ? Les opérations sur cette année redeviendront modifiables.`,
    cancel: { label: 'Annuler', flat: true },
    ok: { label: 'Rouvrir', color: 'positive' },
    persistent: true,
  }).onOk(() => {
    void (async () => {
      try {
        if (!exercice.id) return;
        const exerciceId = exercice.id;
        await db.exercices.update(exerciceId, {
          statut: 'ouvert',
          updatedAt: new Date(),
        });
        // Clear dateVerrouillage separately
        await db.exercices
          .where('id')
          .equals(exerciceId)
          .modify({ dateVerrouillage: null as unknown as Date });
        $q.notify({ type: 'positive', message: `Exercice ${exercice.annee} rouvert` });
        await loadData();
      } catch (error) {
        console.error('Erreur:', error);
        $q.notify({ type: 'negative', message: 'Erreur lors de la réouverture' });
      }
    })();
  });
}

function confirmDeleteExercice(exercice: Exercice) {
  $q.dialog({
    title: "Supprimer l'exercice",
    message: `Supprimer l'exercice ${exercice.annee} ? Cette action est irréversible.`,
    cancel: { label: 'Annuler', flat: true },
    ok: { label: 'Supprimer', color: 'negative' },
    persistent: true,
  }).onOk(() => {
    void (async () => {
      try {
        if (!exercice.id) return;
        await db.exercices.delete(exercice.id);
        $q.notify({ type: 'positive', message: `Exercice ${exercice.annee} supprimé` });
        await loadData();
      } catch (error) {
        console.error('Erreur:', error);
        $q.notify({ type: 'negative', message: 'Erreur lors de la suppression' });
      }
    })();
  });
}

onMounted(() => {
  void loadData();
});
</script>

<style scoped lang="scss">
.parametrage-page {
  .main-card {
    border-radius: 12px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  }
}
</style>
