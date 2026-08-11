<template>
  <q-page class="parametrage-page q-pa-md">
      <PageHeader
        title="Paramétrage"
        subtitle="Configuration générale de l'application"
        icon="settings"
      >
        <template #stats>
          <div v-for="(stat, index) in heroStats" :key="index" class="col-12 col-sm-6 col-lg-3">
            <q-card flat class="listing-stat-card overview-stat-card">
              <q-card-section class="row items-center no-wrap">
                <div class="col">
                  <div class="overview-stat-label">{{ stat.label }}</div>
                  <div class="overview-stat-value">{{ stat.value }}</div>
                  <div v-if="stat.helper" class="overview-stat-helper">{{ stat.helper }}</div>
                </div>
                <q-icon :name="stat.icon" size="30px" :color="stat.color" />
              </q-card-section>
            </q-card>
          </div>
        </template>
      </PageHeader>

      <!-- Gestion des Exercices Budgétaires -->
      <q-card class="main-card q-mt-md">
        <q-card-section>
          <div class="listing-toolbar row items-center justify-between q-mb-md">
            <div class="text-h6">
              <q-icon name="calendar_today" class="q-mr-sm" />
              Gestion des Exercices Budgétaires
            </div>
            <q-btn
              color="primary"
              icon="add"
              label="Nouvel Exercice"
              @click="openExerciceDialog()"
            />
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
          <div class="listing-toolbar row items-center justify-between q-mb-md">
            <div class="text-h6">
              <q-icon name="business" class="q-mr-sm" />
              Informations de la Mairie
            </div>
          </div>

          <div class="row q-col-gutter-md">
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
                  <q-item-label class="text-weight-bold text-body1">{{
                    mairie.ville
                  }}</q-item-label>
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
                  <q-icon name="badge" color="teal-8" />
                </q-item-section>
                <q-item-section>
                  <q-item-label caption>N° employeur CNPS</q-item-label>
                  <q-item-label class="text-weight-bold text-body1">{{
                    mairie.numeroEmployeurCNPS || '-'
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
        </q-card-section>
      </q-card>

      <!-- Paramètres de Paie -->
      <q-card class="main-card q-mt-md">
        <q-card-section>
          <div class="listing-toolbar row items-center justify-between q-mb-md">
            <div class="text-h6">
              <q-icon name="payments" class="q-mr-sm" />
              Paramètres de Paie (Taux & Cotisations)
            </div>
            <q-btn
              color="primary"
              icon="save"
              label="Enregistrer les paramètres"
              @click="saveParametresPaie"
              :loading="savingPaie"
            />
          </div>

          <div v-if="parametresPaie" class="row q-col-gutter-md">
            <div class="col-12 col-md-4">
              <q-input
                v-model.number="parametresPaie.tauxIndemniteResidence"
                label="Taux Indemnité Résidence"
                type="number"
                step="0.01"
                outlined
                dense
                suffix="%"
              />
            </div>
            <div class="col-12 col-md-4">
              <q-input
                v-model.number="parametresPaie.tauxIts"
                label="Taux ITS"
                type="number"
                step="0.01"
                outlined
                dense
                suffix="%"
              />
            </div>
            <div class="col-12 col-md-4">
              <q-input
                v-model.number="parametresPaie.tauxFns"
                label="Taux FNS"
                type="number"
                step="0.01"
                outlined
                dense
                suffix="%"
              />
            </div>
            <div class="col-12 col-md-4">
              <q-input
                v-model.number="parametresPaie.tauxIgr"
                label="Taux IGR"
                type="number"
                step="0.01"
                outlined
                dense
                suffix="%"
                hint="Impôt Général sur le Revenu"
              />
            </div>
            <div class="col-12 col-md-4">
              <q-input
                v-model.number="parametresPaie.abattementCN"
                label="Abattement C.N. (ITS - valeur)"
                type="number"
                step="1"
                outlined
                dense
                suffix="F CFA"
                hint="C.N. = ITS - cette valeur"
              />
            </div>
            <div class="col-12 col-md-3">
              <q-input
                v-model.number="parametresPaie.tauxCnpsEmploye"
                label="Part Salariale CNPS"
                type="number"
                step="0.01"
                outlined
                dense
                suffix="%"
              />
            </div>
            <div class="col-12 col-md-3">
              <q-input
                v-model.number="parametresPaie.tauxCnpsPatronalPrestationFamiliale"
                label="Patronal - Prest. Familiale"
                type="number"
                step="0.01"
                outlined
                dense
                suffix="%"
              />
            </div>
            <div class="col-12 col-md-3">
              <q-input
                v-model.number="parametresPaie.tauxCnpsPatronalAccidentTravail"
                label="Patronal - Accident Travail"
                type="number"
                step="0.01"
                outlined
                dense
                suffix="%"
              />
            </div>
            <div class="col-12 col-md-3">
              <q-input
                v-model.number="parametresPaie.tauxCnpsPatronalRetraite"
                label="Patronal - Retraite"
                type="number"
                step="0.01"
                outlined
                dense
                suffix="%"
              />
            </div>
            <!-- Plafonds mensuels des assiettes CNPS : servent aux états de
                 décompte patronal et aux colonnes du rapport DISA. -->
            <div class="col-12 col-md-3">
              <q-input
                v-model.number="parametresPaie.plafondCnpsPfAt"
                label="Plafond mensuel PF / AT"
                type="number"
                step="1000"
                outlined
                dense
                suffix="F CFA"
                hint="Assiette prest. familiales et accidents du travail"
              />
            </div>
            <div class="col-12 col-md-3">
              <q-input
                v-model.number="parametresPaie.plafondCnpsRetraite"
                label="Plafond mensuel Retraite"
                type="number"
                step="1000"
                outlined
                dense
                suffix="F CFA"
                hint="Assiette de la cotisation retraite"
              />
            </div>
          </div>
          <div v-else class="text-center text-grey-5 q-pa-lg">
            <q-spinner color="primary" size="2em" />
          </div>
        </q-card-section>
      </q-card>

      <!-- Dialog création exercice -->
      <q-dialog v-model="showExerciceDialog" persistent>
        <q-card class="dialog-card" style="width: min(400px, 96vw); max-width: 96vw">
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
import { computed, ref, onMounted } from 'vue';
import { useQuasar, date } from 'quasar';
import {
  db,
  type Exercice,
  type ParametresPaie,
  DEFAULT_MAIRIE_ID,
} from 'src/database/db';
import PageHeader from 'src/components/PageHeader.vue';
import { MAIRIE_INFO } from 'src/constanteInfo';
import { PLAFOND_PF_AT_DEFAUT, PLAFOND_RETRAITE_DEFAUT } from 'src/utils/disa';

const $q = useQuasar();

const exercices = ref<Exercice[]>([]);
const mairie = MAIRIE_INFO;
const parametresPaie = ref<ParametresPaie | null>(null);
const loading = ref(false);
const savingPaie = ref(false);

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

const openedExercicesCount = computed(
  () => exercices.value.filter((exercice) => exercice.statut === 'ouvert').length,
);

const heroStats = computed(() => [
  {
    label: 'Exercices',
    value: exercices.value.length,
    helper: `${openedExercicesCount.value} ouvert(s)`,
    icon: 'event_note',
    color: 'primary',
  },
  {
    label: 'Mairie',
    value: mairie.code,
    helper: mairie.nom,
    icon: 'location_city',
    color: 'secondary',
  },
  {
    label: 'Maire',
    value: 'OK',
    helper: mairie.maire,
    icon: 'person',
    color: 'teal',
  },
  {
    label: 'Taux ITS',
    value: `${parametresPaie.value?.tauxIts ?? 0}%`,
    helper: 'Paramètre de paie actif',
    icon: 'payments',
    color: 'positive',
  },
]);

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

    const params = await db.parametresPaie.toCollection().first();
    // Paramètres ajoutés après coup : valeur par défaut pour les bases existantes
    if (params) {
      params.tauxIgr = params.tauxIgr ?? 0;
      params.plafondCnpsPfAt = params.plafondCnpsPfAt ?? PLAFOND_PF_AT_DEFAUT;
      params.plafondCnpsRetraite = params.plafondCnpsRetraite ?? PLAFOND_RETRAITE_DEFAUT;
    }
    parametresPaie.value = params || null;
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

async function saveParametresPaie() {
  if (!parametresPaie.value || !parametresPaie.value.id) return;
  savingPaie.value = true;
  try {
    parametresPaie.value.updatedAt = new Date();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await db.parametresPaie.update(parametresPaie.value.id, parametresPaie.value as any);
    $q.notify({ type: 'positive', message: 'Paramètres de paie enregistrés avec succès' });
  } catch (error) {
    console.error('Erreur:', error);
    $q.notify({ type: 'negative', message: 'Erreur lors de la sauvegarde' });
  } finally {
    savingPaie.value = false;
  }
}

onMounted(() => {
  void loadData();
});
</script>

<style scoped lang="scss">
.parametrage-page {
  max-width: 1400px;
  margin: 0 auto;
}

.overview-stat-card {
  min-height: 112px;
}

.overview-stat-label {
  margin-bottom: 8px;
  color: #64748b;
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.overview-stat-value {
  color: #0f172a;
  font-size: clamp(1.05rem, 1.7vw, 1.45rem);
  font-weight: 800;
  line-height: 1.2;
}

.overview-stat-helper {
  margin-top: 6px;
  color: #64748b;
  font-size: 0.76rem;
  line-height: 1.35;
}

.admin-password-shell {
  min-height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.admin-password-card {
  width: min(440px, 100%);
  border-radius: 28px;
  border: 1px solid rgba(148, 163, 184, 0.18);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.94));
  box-shadow: 0 24px 44px rgba(15, 23, 42, 0.08);
}

.parametrage-page .main-card {
  border-radius: 24px;
  border: 1px solid rgba(148, 163, 184, 0.18);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.94));
  box-shadow: 0 18px 34px rgba(15, 23, 42, 0.08);
  overflow: hidden;
}

.parametrage-page .listing-toolbar {
  padding: 14px 16px;
  border: 1px solid rgba(148, 163, 184, 0.16);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.72);
}

.parametrage-page :deep(.q-item) {
  border-radius: 14px;
  margin: 4px 0;
}

.parametrage-page :deep(.q-table) {
  border-radius: 18px;
  overflow: hidden;
}

.parametrage-page :deep(.q-table thead tr) {
  background: linear-gradient(180deg, #f8fafc 0%, #eef4f8 100%);
}

.dialog-card {
  border-radius: 24px;
  overflow: hidden;
}
</style>
