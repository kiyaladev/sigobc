<template>
  <q-page class="q-pa-md">
    <div class="text-h5 q-mb-md">⚙️ Gestion de la Base de Données</div>

    <q-banner class="bg-warning text-white q-mb-md" rounded>
      <template v-slot:avatar>
        <q-icon name="warning" />
      </template>
      <strong>Attention :</strong> Les actions sur cette page peuvent supprimer définitivement les
      données.
    </q-banner>

    <div class="row q-col-gutter-md">
      <!-- Actions Principales -->
      <div class="col-12 col-md-6">
        <q-card>
          <q-card-section>
            <div class="text-h6">🚀 Actions Rapides</div>
          </q-card-section>
          <q-list separator>
            <q-item>
              <q-item-section>
                <q-item-label>Initialiser la base de données</q-item-label>
                <q-item-label caption
                  >Vide la DB et la remplit avec les données par défaut (chapitres, sous-chapitres,
                  admin, etc.).</q-item-label
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
          </q-list>
        </q-card>
      </div>

      <!-- Seeder de Test -->
      <div class="col-12 col-md-6">
        <q-card>
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
        <q-card>
          <q-card-section>
            <div class="text-h6">📊 Données Actuelles</div>
          </q-card-section>
          <q-card-section>
            <div class="row q-col-gutter-md">
              <div class="col-6 col-sm-4 col-md-2" v-for="stat in stats" :key="stat.label">
                <q-card flat bordered>
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
        <q-card>
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
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { db } from 'src/database/db';
import {
  seedDefaultData,
  seedTestData,
  clearDatabase,
  type SeedOptions,
} from 'src/database/seeders';

const $q = useQuasar();

const loading = ref({
  default: false,
  test: false,
  clear: false,
});
const logs = ref<string[]>([]);

const testDataOptions = ref<SeedOptions>({
  mandats: 50,
  bordereauMandats: 6,
});

const stats = ref([
  { label: 'Utilisateurs', count: 0, table: 'utilisateurs' },
  { label: 'Chapitres Dép.', count: 0, table: 'chapitres' },
  { label: 'Sous-chapitres Dép.', count: 0, table: 'sousChapitres' },
  { label: 'Prévisions Dép.', count: 0, table: 'previsions' },
  { label: 'Mandats Dép.', count: 0, table: 'mandats' },
  { label: 'Bordereaux Mandats Dép.', count: 0, table: 'bordereauMandats' },
  { label: 'Bordereaux Mandats Dép.', count: 0, table: 'bordereauMandats' },
  { label: 'Taxes/Recettes', count: 0, table: 'taxes' },
  { label: 'Déclarations', count: 0, table: 'declarations' },
  { label: 'Bordereaux Recettes', count: 0, table: 'bordereauxRecette' },
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
  type: 'default' | 'test' | 'clear',
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

onMounted(loadStats);
</script>
