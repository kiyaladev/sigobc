<template>
  <q-page class="admin-seeders-page q-pa-md">
    <!-- Password Gate -->
    <div v-if="!isUnlocked" class="admin-password-shell">
      <q-card class="admin-password-card q-pa-lg">
        <q-card-section class="text-center">
          <q-icon name="lock" size="48px" color="warning" class="q-mb-md" />
          <div class="text-h6 q-mb-sm">Accès protégé</div>
          <div class="text-caption text-grey-7 q-mb-lg">
            Veuillez entrer le mot de passe administrateur pour accéder à cette page.
          </div>
          <q-form @submit="checkPassword">
            <q-input
              v-model="adminPassword"
              type="password"
              label="Mot de passe administrateur"
              outlined
              dense
              :error="passwordError"
              error-message="Mot de passe incorrect"
              @keyup.enter="checkPassword"
              class="q-mb-md"
            />
            <q-btn
              type="submit"
              label="Déverrouiller"
              color="primary"
              unelevated
              class="full-width"
              icon="lock_open"
            />
          </q-form>
        </q-card-section>
      </q-card>
    </div>

    <!-- Actual content -->
    <template v-if="isUnlocked">
      <PageHeader
        title="Gestion de la Base de Données"
        subtitle="Initialisation et génération de données de test"
        icon="database"
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

      <q-banner class="admin-warning-banner q-mb-md" rounded>
        <template v-slot:avatar>
          <q-icon name="warning" />
        </template>
        <strong>Attention :</strong> Les actions sur cette page peuvent supprimer définitivement les
        données.
      </q-banner>

      <div class="row q-col-gutter-md">
        <!-- Actions Principales -->
        <div class="col-12 col-md-6">
          <q-card class="admin-card">
            <q-card-section>
              <div class="text-h6">🚀 Actions Rapides</div>
            </q-card-section>
            <q-list separator>
              <q-item>
                <q-item-section>
                  <q-item-label>Initialiser la base de données</q-item-label>
                  <q-item-label caption
                    >Vide la DB et la remplit avec les données par défaut (chapitres,
                    sous-chapitres, admin, etc.).</q-item-label
                  >
                </q-item-section>
                <q-item-section side>
                  <q-btn
                    label="Initialiser"
                    color="primary"
                    icon="rocket_launch"
                    @click="runSeedDefault"
                    :loading="loading.default"
                  />
                </q-item-section>
              </q-item>

              <q-item>
                <q-item-section>
                  <q-item-label>Supprimer toutes les données</q-item-label>
                  <q-item-label caption
                    >Vide complètement la base de données. Action irréversible.</q-item-label
                  >
                </q-item-section>
                <q-item-section side>
                  <q-btn
                    label="Supprimer"
                    color="negative"
                    icon="delete_forever"
                    @click="runClear"
                    :loading="loading.clear"
                  />
                </q-item-section>
              </q-item>

              <q-item>
                <q-item-section>
                  <q-item-label>Seeder projets de référence</q-item-label>
                  <q-item-label caption
                    >Ajoute les projets de test issus du compte administratif sans vider la
                    base.</q-item-label
                  >
                </q-item-section>
                <q-item-section side>
                  <q-btn
                    label="Seeder projets"
                    color="secondary"
                    icon="engineering"
                    @click="runSeedProjects"
                    :loading="loading.projects"
                  />
                </q-item-section>
              </q-item>
            </q-list>
          </q-card>
        </div>

        <!-- Seeder de Test -->
        <div class="col-12 col-md-6">
          <q-card class="admin-card">
            <q-card-section>
              <div class="text-h6">🧪 Générer des Données de Test</div>
              <div class="text-caption">
                Remplit la base avec un grand volume de données aléatoires pour les tests.
              </div>
            </q-card-section>

            <q-card-section>
              <q-expansion-item icon="settings" label="Personnaliser les quantités" class="q-mb-md">
                <div class="q-gutter-md q-pt-md">
                  <q-input
                    v-model.number="testDataOptions.mandats"
                    type="number"
                    label="Mandats"
                    filled
                    dense
                  />
                  <q-input
                    v-model.number="testDataOptions.bordereauMandats"
                    type="number"
                    label="Bordereaux de Mandats"
                    filled
                    dense
                  />
                  <q-separator />
                  <div class="text-subtitle2">Génération des données</div>
                  <div class="text-caption">
                    Les données seront générées pour l'exercice 2025 ainsi que des historiques pour
                    2023-2024.
                  </div>
                </div>
              </q-expansion-item>
            </q-card-section>

            <q-card-actions align="right">
              <q-btn
                label="Générer Données de Test"
                color="secondary"
                icon="science"
                @click="runSeedTest"
                :loading="loading.test"
              />
            </q-card-actions>
          </q-card>
        </div>

        <!-- Statistiques -->
        <div class="col-12">
          <q-card class="admin-card">
            <q-card-section>
              <div class="text-h6">📊 Données Actuelles</div>
            </q-card-section>
            <q-card-section>
              <div class="row q-col-gutter-md">
                <div class="col-6 col-sm-4 col-md-2" v-for="stat in stats" :key="stat.label">
                  <q-card flat class="listing-stat-card admin-mini-stat">
                    <q-card-section class="text-center">
                      <div class="text-h4 text-primary">{{ stat.count }}</div>
                      <div class="text-caption text-grey-7">{{ stat.label }}</div>
                    </q-card-section>
                  </q-card>
                </div>
              </div>
            </q-card-section>
            <q-card-actions align="right">
              <q-btn flat label="Actualiser" icon="refresh" color="primary" @click="loadStats" />
            </q-card-actions>
          </q-card>
        </div>

        <!-- Logs -->
        <div class="col-12" v-if="logs.length > 0">
          <q-card class="admin-card">
            <q-card-section>
              <div class="text-h6">📝 Logs d'exécution</div>
            </q-card-section>
            <q-card-section style="max-height: 300px; overflow-y: auto">
              <div
                v-for="(log, index) in logs"
                :key="index"
                class="text-caption q-mb-xs"
                v-html="log"
              ></div>
            </q-card-section>
            <q-card-actions align="right">
              <q-btn flat label="Effacer" icon="clear" color="grey" @click="logs = []" />
            </q-card-actions>
          </q-card>
        </div>
      </div>
    </template>
  </q-page>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { db } from 'src/database/db';
import PageHeader from 'src/components/PageHeader.vue';
import {
  seedDefaultData,
  seedTestData,
  seedReferenceProjects,
  clearDatabase,
  type SeedOptions,
} from 'src/database/seeders';

const $q = useQuasar();

// Password protection
const ADMIN_PAGE_PASSWORD = 'Sigobc@2026!';
const isUnlocked = ref(false);
const adminPassword = ref('');
const passwordError = ref(false);

function checkPassword() {
  if (adminPassword.value === ADMIN_PAGE_PASSWORD) {
    isUnlocked.value = true;
    passwordError.value = false;
    sessionStorage.setItem('seeders_unlocked', 'true');
  } else {
    passwordError.value = true;
  }
}

// Check if already unlocked in this session
if (sessionStorage.getItem('seeders_unlocked') === 'true') {
  isUnlocked.value = true;
}

const loading = ref({
  default: false,
  test: false,
  clear: false,
  projects: false,
});
const logs = ref<string[]>([]);

const testDataOptions = ref<SeedOptions>({
  mandats: 50,
  bordereauMandats: 6,
});

const stats = ref([
  // Système
  { label: 'Mairies', count: 0, table: 'mairies' },
  { label: 'Utilisateurs', count: 0, table: 'utilisateurs' },
  { label: 'Exercices', count: 0, table: 'exercices' },
  // App3 - Dépenses
  { label: 'Chapitres Dép.', count: 0, table: 'chapitres' },
  { label: 'Sous-chapitres Dép.', count: 0, table: 'sousChapitres' },
  { label: 'Prévisions Dép.', count: 0, table: 'previsions' },
  { label: 'Projets', count: 0, table: 'projets' },
  { label: 'Mandats Dép.', count: 0, table: 'mandats' },
  { label: 'Bordereaux Mandats Dép.', count: 0, table: 'bordereauMandats' },
  { label: 'États Fin. Mensuels Dép.', count: 0, table: 'etatFinancierMensuel' },
  // App6 - Recettes
  { label: 'Taxes/Recettes', count: 0, table: 'taxes' },
  { label: 'Chapitres Recettes', count: 0, table: 'chapitresRecette' },
  { label: 'Déclarations', count: 0, table: 'declarations' },
  { label: 'Bordereaux Recettes', count: 0, table: 'bordereauxRecette' },
  { label: 'Prévisions Recettes', count: 0, table: 'previsionsRecettes' },
  { label: 'Mandats Recettes', count: 0, table: 'mandatsRecette' },
  { label: 'Bord. Mandats Recettes', count: 0, table: 'bordereauMandatsRecette' },
  { label: 'États Fin. Mensuels Rec.', count: 0, table: 'etatFinancierMensuelRecette' },
  // App7 - Employés
  { label: 'Employés', count: 0, table: 'employes' },
  { label: 'Fiches de Paie', count: 0, table: 'fichesPaie' },
  { label: 'Congés', count: 0, table: 'conges' },
  { label: 'Ordres de Mission', count: 0, table: 'ordresMission' },
  { label: 'Paramètres Paie', count: 0, table: 'parametresPaie' },
  { label: 'Services (App7)', count: 0, table: 'servicesApp7' },
]);

const totalRecords = computed(() => stats.value.reduce((sum, stat) => sum + stat.count, 0));
const populatedTables = computed(() => stats.value.filter((stat) => stat.count > 0).length);
const usersCount = computed(
  () => stats.value.find((stat) => stat.table === 'utilisateurs')?.count ?? 0,
);
const previsionsCount = computed(
  () => stats.value.find((stat) => stat.table === 'previsions')?.count ?? 0,
);

const heroStats = computed(() => [
  {
    label: 'Enregistrements',
    value: totalRecords.value,
    helper: `${populatedTables.value} table(s) alimentée(s)`,
    icon: 'dataset',
    color: 'primary',
  },
  {
    label: 'Utilisateurs',
    value: usersCount.value,
    helper: 'Comptes système disponibles',
    icon: 'manage_accounts',
    color: 'secondary',
  },
  {
    label: 'Prévisions',
    value: previsionsCount.value,
    helper: 'Base dépenses active',
    icon: 'pie_chart',
    color: 'teal',
  },
  {
    label: 'Logs session',
    value: logs.value.length,
    helper: 'Historique de la session courante',
    icon: 'terminal',
    color: 'positive',
  },
]);

function addLog(message: string) {
  const timestamp = new Date().toLocaleTimeString();
  const color =
    message.includes('✅') || message.includes('✔')
      ? 'green'
      : message.includes('❌')
        ? 'red'
        : message.includes('🌱')
          ? 'blue'
          : message.includes('🗑️')
            ? 'orange'
            : 'white';
  logs.value.push(`[${timestamp}] <span class="text-${color}">${message}</span>`);
}

async function loadStats() {
  try {
    const counts = await Promise.all(stats.value.map((stat) => db.table(stat.table).count()));
    stats.value.forEach((stat, index) => {
      stat.count = counts[index] ?? 0;
    });
  } catch (error) {
    console.error('Erreur lors du chargement des statistiques:', error);
    $q.notify({ type: 'negative', message: 'Impossible de charger les statistiques.' });
  }
}

// Wrapper pour exécuter une fonction de seeder avec gestion de logs et d'état
async function runSeederAction(
  action: () => Promise<void>,
  type: 'default' | 'test' | 'clear' | 'projects',
  successMessage: string,
) {
  loading.value[type] = true;
  logs.value = [];

  const originalLog = console.log;
  console.log = (...args) => {
    addLog(args.join(' '));
    originalLog(...args);
  };

  try {
    await action();
    $q.notify({ type: 'positive', message: successMessage, timeout: 3000 });
    await loadStats();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`Erreur lors de l'action '${type}':`, errorMessage);
    $q.notify({ type: 'negative', message: `Erreur lors de l'action: ${errorMessage}` });
  } finally {
    console.log = originalLog;
    loading.value[type] = false;
  }
}

function runSeedDefault() {
  $q.dialog({
    title: 'Confirmation',
    message:
      'Voulez-vous vraiment initialiser la base de données ? Toutes les données actuelles seront supprimées.',
    cancel: true,
    persistent: true,
  }).onOk(() => {
    void runSeederAction(seedDefaultData, 'default', 'Base de données initialisée avec succès !');
  });
}

function runSeedTest() {
  $q.dialog({
    title: 'Confirmation',
    message:
      "Voulez-vous vraiment générer les données de test ? Cela va d'abord initialiser la base de données.",
    cancel: true,
    persistent: true,
  }).onOk(() => {
    void runSeederAction(
      () => seedTestData(testDataOptions.value),
      'test',
      'Données de test générées avec succès !',
    );
  });
}

function runClear() {
  $q.dialog({
    title: 'Confirmation',
    message: 'Voulez-vous vraiment supprimer TOUTES les données ? Cette action est irréversible !',
    cancel: true,
    persistent: true,
    color: 'negative',
  }).onOk(() => {
    void runSeederAction(clearDatabase, 'clear', 'Base de données entièrement vidée.');
  });
}

function runSeedProjects() {
  $q.dialog({
    title: 'Confirmation',
    message:
      'Voulez-vous vraiment ajouter les projets de référence pour les tests ? Les projets déjà présents seront conservés.',
    cancel: true,
    persistent: true,
  }).onOk(() => {
    void runSeederAction(
      seedReferenceProjects,
      'projects',
      'Projets de référence générés avec succès !',
    );
  });
}

onMounted(loadStats);
</script>

<style scoped lang="scss">
.admin-seeders-page {
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

.admin-card {
  height: 100%;
  border-radius: 24px;
  border: 1px solid rgba(148, 163, 184, 0.18);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.94));
  box-shadow: 0 18px 34px rgba(15, 23, 42, 0.08);
}

.admin-card :deep(.q-list .q-item) {
  border-radius: 14px;
}

.admin-warning-banner {
  background: linear-gradient(135deg, rgba(197, 168, 77, 0.94), rgba(185, 146, 38, 0.92));
  color: white;
}

.admin-mini-stat {
  min-height: 120px;
}

.admin-mini-stat :deep(.q-card__section) {
  display: flex;
  min-height: 120px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
</style>
