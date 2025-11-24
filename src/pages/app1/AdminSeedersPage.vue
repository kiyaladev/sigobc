<template>
  <q-page class="q-pa-md">
    <div class="text-h5 q-mb-md">⚙️ Seeders de Test - 3 Applications</div>

    <q-banner class="bg-warning text-white q-mb-md" rounded>
      <template v-slot:avatar>
        <q-icon name="warning" />
      </template>
      <strong>Attention :</strong> Les seeders vont supprimer toutes les données existantes !
    </q-banner>

    <!-- Sélection d'application -->
    <q-card class="q-mb-md">
      <q-card-section>
        <div class="text-h6 q-mb-md">Sélectionner l'application à seeder</div>
        <q-tabs
          v-model="selectedApp"
          dense
          class="text-grey"
          active-color="primary"
          indicator-color="primary"
          align="justify"
        >
          <q-tab name="all" label="Toutes les Apps" icon="apps" />
          <q-tab name="app1" label="App1: Déclarations" icon="receipt" />
          <q-tab name="app2" label="App2: Trésorerie" icon="account_balance" />
          <q-tab name="app3" label="App3: Dépenses" icon="payments" />
        </q-tabs>
      </q-card-section>
    </q-card>

    <div class="row q-col-gutter-md">
      <!-- Seeder complet -->
      <div class="col-12 col-md-6">
        <q-card>
          <q-card-section class="bg-primary text-white">
            <div class="text-h6">🚀 Seeder Complet</div>
            <div class="text-caption">
              Génère toutes les données de test pour {{ selectedAppLabel }}
            </div>
          </q-card-section>

          <q-card-section>
            <div class="q-gutter-md">
              <!-- Commun -->
              <div v-if="showCommon">
                <div class="text-subtitle2 text-primary q-mb-sm">Commun</div>
                <q-input
                  v-model.number="fullSeederOptions.utilisateurs"
                  type="number"
                  label="Utilisateurs"
                  filled
                  dense
                />
                <q-input
                  v-model.number="fullSeederOptions.mairies"
                  type="number"
                  label="Mairies"
                  filled
                  dense
                  class="q-mt-sm"
                />
              </div>

              <!-- App1 -->
              <div v-if="showApp1">
                <div class="text-subtitle2 text-primary q-mb-sm">
                  App1 - Déclarations & Bordereaux
                </div>
                <q-input
                  v-model.number="fullSeederOptions.taxes"
                  type="number"
                  label="Taxes"
                  filled
                  dense
                />
                <q-input
                  v-model.number="fullSeederOptions.declarations"
                  type="number"
                  label="Déclarations"
                  filled
                  dense
                  class="q-mt-sm"
                />
                <q-input
                  v-model.number="fullSeederOptions.bordereaux"
                  type="number"
                  label="Bordereaux"
                  filled
                  dense
                  class="q-mt-sm"
                />
              </div>

              <!-- App2 -->
              <div v-if="showApp2">
                <div class="text-subtitle2 text-primary q-mb-sm">App2 - Gestion Trésorerie</div>
                <q-input
                  v-model.number="fullSeederOptions.approvisionnements"
                  type="number"
                  label="Approvisionnements"
                  filled
                  dense
                />
                <q-input
                  v-model.number="fullSeederOptions.remises"
                  type="number"
                  label="Remises"
                  filled
                  dense
                  class="q-mt-sm"
                />
                <q-input
                  v-model.number="fullSeederOptions.versements"
                  type="number"
                  label="Versements"
                  filled
                  dense
                  class="q-mt-sm"
                />
              </div>

              <!-- App3 -->
              <div v-if="showApp3">
                <div class="text-subtitle2 text-primary q-mb-sm">App3 - Gestion des Dépenses</div>
                <q-input
                  v-model.number="fullSeederOptions.rubriques"
                  type="number"
                  label="Rubriques"
                  filled
                  dense
                />
                <q-input
                  v-model.number="fullSeederOptions.chapitres"
                  type="number"
                  label="Chapitres"
                  filled
                  dense
                  class="q-mt-sm"
                />

                <q-input
                  v-model.number="fullSeederOptions.previsions"
                  type="number"
                  label="Prévisions"
                  filled
                  dense
                  class="q-mt-sm"
                />
                <q-input
                  v-model.number="fullSeederOptions.mandats"
                  type="number"
                  label="Mandats"
                  filled
                  dense
                  class="q-mt-sm"
                />
                <q-input
                  v-model.number="fullSeederOptions.bordereauMandats"
                  type="number"
                  label="Bordereaux Mandats"
                  filled
                  dense
                  class="q-mt-sm"
                />
              </div>
            </div>
          </q-card-section>

          <q-card-actions align="right">
            <q-btn
              label="Exécuter Tout"
              color="primary"
              icon="play_arrow"
              @click="runFullSeeder"
              :loading="loading"
            />
          </q-card-actions>
        </q-card>
      </div>

      <!-- Seeders individuels -->
      <div class="col-12 col-md-6">
        <q-card>
          <q-card-section class="bg-secondary text-white">
            <div class="text-h6">🎯 Seeders Individuels</div>
            <div class="text-caption">Génère des données pour une table spécifique</div>
          </q-card-section>

          <q-card-section>
            <q-list separator>
              <q-item v-for="table in filteredTables" :key="table.name" class="q-mb-sm">
                <q-item-section>
                  <q-item-label>{{ table.label }}</q-item-label>
                  <q-item-label caption>{{ table.description }}</q-item-label>
                </q-item-section>

                <q-item-section side>
                  <q-input v-model.number="table.count" type="number" dense style="width: 80px" />
                </q-item-section>

                <q-item-section side>
                  <q-btn
                    flat
                    round
                    dense
                    icon="play_arrow"
                    color="primary"
                    @click="runSingleSeeder(table.name, table.count)"
                    :loading="loadingTable === table.name"
                  />
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
      </div>

      <!-- Statistiques actuelles -->
      <div class="col-12">
        <q-card>
          <q-card-section class="bg-info text-white">
            <div class="text-h6">📊 Données Actuelles</div>
          </q-card-section>

          <q-card-section>
            <div class="row q-col-gutter-md">
              <div class="col-6 col-sm-4 col-md-2" v-for="stat in filteredStats" :key="stat.label">
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
            <q-btn
              flat
              label="Sauvegarder DB"
              icon="save"
              color="positive"
              @click="exportDatabase"
            />
            <q-btn flat label="Restaurer DB" icon="upload" color="info" @click="importDatabase" />
            <q-btn
              flat
              label="Tout Supprimer"
              icon="delete_forever"
              color="negative"
              @click="confirmClearAll"
            />
          </q-card-actions>
        </q-card>
      </div>

      <!-- Logs -->
      <div class="col-12" v-if="logs.length > 0">
        <q-card>
          <q-card-section class="bg-dark text-white">
            <div class="text-h6">📝 Logs d'exécution</div>
          </q-card-section>

          <q-card-section class="bg-grey-10 text-white" style="max-height: 300px; overflow-y: auto">
            <div v-for="(log, index) in logs" :key="index" class="text-caption q-mb-xs">
              <span :class="getLogColor(log)">{{ log }}</span>
            </div>
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
import { ref, onMounted, computed } from 'vue';
import { useQuasar } from 'quasar';
import { db } from 'src/database/db';
import { runAllSeeders, seedTable } from 'src/database/seeders';

const $q = useQuasar();

const loading = ref(false);
const loadingTable = ref<string | null>(null);
const logs = ref<string[]>([]);

const selectedApp = ref('all');

const fullSeederOptions = ref({
  // Commun
  utilisateurs: 10,
  mairies: 15,
  // App1
  taxes: 25,
  declarations: 100,
  bordereaux: 80,
  // App2
  approvisionnements: 20,
  remises: 50,
  versements: 60,
  // App3
  rubriques: 8,
  chapitres: 47,
  previsions: 30,
  mandats: 100,
  bordereauMandats: 20,
});

const tables = ref([
  // Commun
  {
    name: 'utilisateurs',
    label: 'Utilisateurs',
    description: 'Comptes utilisateurs',
    count: 10,
    app: 'common',
  },
  {
    name: 'mairies',
    label: 'Mairies',
    description: 'Communes et mairies',
    count: 15,
    app: 'common',
  },
  // App1 - Déclarations et Bordereaux
  { name: 'taxes', label: 'Taxes', description: 'Types de taxes', count: 25, app: 'app1' },
  {
    name: 'declarations',
    label: 'Déclarations',
    description: 'Déclarations de recettes',
    count: 100,
    app: 'app1',
  },
  {
    name: 'bordereaux',
    label: 'Bordereaux',
    description: 'Bordereaux de paiement',
    count: 80,
    app: 'app1',
  },
  // App2 - Gestion Trésorerie
  {
    name: 'approvisionnements',
    label: 'Approvisionnements',
    description: 'Stock initial de timbres',
    count: 20,
    app: 'app2',
  },
  { name: 'remises', label: 'Remises', description: 'Remises de timbres', count: 50, app: 'app2' },
  {
    name: 'versements',
    label: 'Versements',
    description: 'Versements effectués',
    count: 60,
    app: 'app2',
  },
  // App3 - Gestion des Dépenses
  {
    name: 'rubriques',
    label: 'Rubriques',
    description: 'Rubriques budgétaires',
    count: 8,
    app: 'app3',
  },
  {
    name: 'chapitres',
    label: 'Chapitres',
    description: 'Chapitres budgétaires',
    count: 47,
    app: 'app3',
  },

  {
    name: 'previsions',
    label: 'Prévisions',
    description: 'Prévisions budgétaires',
    count: 30,
    app: 'app3',
  },
  { name: 'mandats', label: 'Mandats', description: 'Mandats de dépense', count: 100, app: 'app3' },
  {
    name: 'bordereauMandats',
    label: 'Bordereaux Mandats',
    description: 'Bordereaux émission mandats',
    count: 20,
    app: 'app3',
  },
]);

const stats = ref([
  // Commun
  { label: 'Utilisateurs', count: 0, app: 'common' },
  { label: 'Mairies', count: 0, app: 'common' },
  // App1
  { label: 'Taxes', count: 0, app: 'app1' },
  { label: 'Déclarations', count: 0, app: 'app1' },
  { label: 'Bordereaux', count: 0, app: 'app1' },
  // App2
  { label: 'Approvisionnements', count: 0, app: 'app2' },
  { label: 'Remises', count: 0, app: 'app2' },
  { label: 'Versements', count: 0, app: 'app2' },
  // App3
  { label: 'Rubriques', count: 0, app: 'app3' },
  { label: 'Chapitres', count: 0, app: 'app3' },
  { label: 'Prévisions', count: 0, app: 'app3' },
  { label: 'Mandats', count: 0, app: 'app3' },
  { label: 'Bordereaux Mandats', count: 0, app: 'app3' },
]);

// Computed properties pour le filtrage
const selectedAppLabel = computed(() => {
  switch (selectedApp.value) {
    case 'all':
      return 'toutes les applications';
    case 'app1':
      return 'App1 - Déclarations & Bordereaux';
    case 'app2':
      return 'App2 - Gestion Trésorerie';
    case 'app3':
      return 'App3 - Gestion des Dépenses';
    default:
      return 'toutes les applications';
  }
});

const showCommon = computed(() => selectedApp.value === 'all');
const showApp1 = computed(() => selectedApp.value === 'all' || selectedApp.value === 'app1');
const showApp2 = computed(() => selectedApp.value === 'all' || selectedApp.value === 'app2');
const showApp3 = computed(() => selectedApp.value === 'all' || selectedApp.value === 'app3');

const filteredTables = computed(() => {
  if (selectedApp.value === 'all') {
    return tables.value;
  }
  return tables.value.filter((t) => t.app === 'common' || t.app === selectedApp.value);
});

const filteredStats = computed(() => {
  if (selectedApp.value === 'all') {
    return stats.value;
  }
  return stats.value.filter((s) => s.app === 'common' || s.app === selectedApp.value);
});

function addLog(message: string) {
  const timestamp = new Date().toLocaleTimeString();
  logs.value.push(`[${timestamp}] ${message}`);
}

function getLogColor(log: string): string {
  if (log.includes('✅') || log.includes('✨')) return 'text-green';
  if (log.includes('❌')) return 'text-red';
  if (log.includes('🌱')) return 'text-blue';
  if (log.includes('🗑️')) return 'text-orange';
  return 'text-white';
}

async function loadStats() {
  try {
    const [
      utilisateurs,
      mairies,
      taxes,
      declarations,
      bordereaux,
      approvisionnements,
      remises,
      versements,
      rubriques,
      chapitres,
      previsions,
      mandats,
      bordereauMandats,
    ] = await Promise.all([
      db.utilisateurs.count(),
      db.mairies.count(),
      db.taxes.count(),
      db.declarations.count(),
      db.bordereaux.count(),
      db.approvisionnements.count(),
      db.remises.count(),
      db.versements.count(),
      db.rubriques.count(),
      db.chapitres.count(),
      db.previsions.count(),
      db.mandats.count(),
      db.bordereauMandats.count(),
    ]);

    // Commun
    stats.value[0]!.count = utilisateurs;
    stats.value[1]!.count = mairies;
    // App1
    stats.value[2]!.count = taxes;
    stats.value[3]!.count = declarations;
    stats.value[4]!.count = bordereaux;
    // App2
    stats.value[5]!.count = approvisionnements;
    stats.value[6]!.count = remises;
    stats.value[7]!.count = versements;
    // App3
    stats.value[8]!.count = rubriques;
    stats.value[9]!.count = chapitres;
    stats.value[10]!.count = previsions;
    stats.value[11]!.count = mandats;
    stats.value[12]!.count = bordereauMandats;
  } catch (error) {
    console.error('Erreur lors du chargement des statistiques:', error);
  }
}

function runFullSeeder() {
  $q.dialog({
    title: 'Confirmation',
    message:
      'Voulez-vous vraiment exécuter le seeder complet ? Toutes les données existantes seront supprimées !',
    cancel: true,
    persistent: true,
  }).onOk(() => {
    void (async () => {
      loading.value = true;
      logs.value = [];

      // Rediriger console.log vers les logs
      const originalLog = console.log;
      console.log = (...args) => {
        addLog(args.join(' '));
        originalLog(...args);
      };

      try {
        await runAllSeeders(fullSeederOptions.value);

        $q.notify({
          type: 'positive',
          message: 'Seeders exécutés avec succès !',
          timeout: 3000,
        });

        await loadStats();
      } catch (error) {
        console.error('Erreur:', error);
        addLog(`❌ Erreur: ${String(error)}`);
        $q.notify({
          type: 'negative',
          message: "Erreur lors de l'exécution des seeders",
        });
      } finally {
        console.log = originalLog;
        loading.value = false;
      }
    })();
  });
}

function runSingleSeeder(tableName: string, count: number) {
  $q.dialog({
    title: 'Confirmation',
    message: `Voulez-vous générer ${count} enregistrements pour ${tableName} ?`,
    cancel: true,
  }).onOk(() => {
    void (async () => {
      loadingTable.value = tableName;

      const originalLog = console.log;
      console.log = (...args) => {
        addLog(args.join(' '));
        originalLog(...args);
      };

      try {
        await seedTable(
          tableName as
            | 'utilisateurs'
            | 'mairies'
            | 'taxes'
            | 'declarations'
            | 'bordereaux'
            | 'approvisionnements'
            | 'remises'
            | 'versements'
            | 'rubriques'
            | 'chapitres'
            | 'previsions'
            | 'mandats'
            | 'bordereauMandats',
          count,
        );

        $q.notify({
          type: 'positive',
          message: `${count} enregistrements créés pour ${tableName}`,
        });

        await loadStats();
      } catch (error) {
        console.error('Erreur:', error);
        const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
        addLog(`❌ Erreur: ${errorMessage}`);
        $q.notify({
          type: 'negative',
          message: errorMessage || "Erreur lors de l'exécution du seeder",
        });
      } finally {
        console.log = originalLog;
        loadingTable.value = null;
      }
    })();
  });
}

function confirmClearAll() {
  $q.dialog({
    title: 'Confirmation',
    message: 'Voulez-vous vraiment supprimer TOUTES les données ? Cette action est irréversible !',
    cancel: true,
    persistent: true,
    color: 'negative',
  }).onOk(() => {
    void (async () => {
      try {
        await Promise.all([
          db.utilisateurs.clear(),
          db.mairies.clear(),
          db.taxes.clear(),
          db.declarations.clear(),
          db.bordereaux.clear(),
          db.approvisionnements.clear(),
          db.remises.clear(),
          db.versements.clear(),
          db.rubriques.clear(),
          db.chapitres.clear(),
          db.previsions.clear(),
          db.mandats.clear(),
          db.bordereauMandats.clear(),
        ]);

        addLog('🗑️ Toutes les données ont été supprimées');

        $q.notify({
          type: 'positive',
          message: 'Toutes les données ont été supprimées',
        });

        await loadStats();
      } catch (error) {
        console.error('Erreur:', error);
        $q.notify({
          type: 'negative',
          message: 'Erreur lors de la suppression',
        });
      }
    })();
  });
}

async function exportDatabase() {
  try {
    // Récupérer toutes les données de toutes les tables
    const [
      utilisateurs,
      mairies,
      taxes,
      declarations,
      bordereaux,
      approvisionnements,
      remises,
      versements,
      rubriques,
      chapitres,
      previsions,
      mandats,
      bordereauMandats,
    ] = await Promise.all([
      db.utilisateurs.toArray(),
      db.mairies.toArray(),
      db.taxes.toArray(),
      db.declarations.toArray(),
      db.bordereaux.toArray(),
      db.approvisionnements.toArray(),
      db.remises.toArray(),
      db.versements.toArray(),
      db.rubriques.toArray(),
      db.chapitres.toArray(),
      db.previsions.toArray(),
      db.mandats.toArray(),
      db.bordereauMandats.toArray(),
    ]);

    // Créer l'objet de sauvegarde
    const backup = {
      version: '2.0',
      exportDate: new Date().toISOString(),
      data: {
        utilisateurs,
        mairies,
        taxes,
        declarations,
        bordereaux,
        approvisionnements,
        remises,
        versements,
        rubriques,
        chapitres,
        previsions,
        mandats,
        bordereauMandats,
      },
    };

    // Convertir en JSON
    const json = JSON.stringify(backup, null, 2);

    // Créer un blob et le télécharger
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `tresor-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    $q.notify({
      type: 'positive',
      message: 'Base de données sauvegardée avec succès',
      icon: 'save',
    });
  } catch (error) {
    console.error('Erreur lors de la sauvegarde:', error);
    $q.notify({
      type: 'negative',
      message: 'Erreur lors de la sauvegarde de la base de données',
    });
  }
}

function importDatabase() {
  // Créer un input file caché
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';

  input.onchange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    const file = target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = event.target?.result as string;
        const backup = JSON.parse(json);

        // Vérifier la structure du backup
        if (!backup.data) {
          throw new Error('Format de fichier invalide');
        }

        // Demander confirmation
        $q.dialog({
          title: 'Confirmation',
          message: `Voulez-vous vraiment restaurer cette sauvegarde du ${new Date(backup.exportDate).toLocaleDateString('fr-FR')} ? Les données actuelles seront remplacées !`,
          cancel: true,
          persistent: true,
          color: 'warning',
        }).onOk(() => {
          void (async () => {
            try {
              // Vider les tables existantes
              await Promise.all([
                db.utilisateurs.clear(),
                db.mairies.clear(),
                db.taxes.clear(),
                db.declarations.clear(),
                db.bordereaux.clear(),
                db.approvisionnements.clear(),
                db.remises.clear(),
                db.versements.clear(),
                db.rubriques.clear(),
                db.chapitres.clear(),
                db.previsions.clear(),
                db.mandats.clear(),
                db.bordereauMandats.clear(),
              ]);

              // Restaurer les données
              if (backup.data.utilisateurs?.length) {
                await db.utilisateurs.bulkAdd(backup.data.utilisateurs);
              }
              if (backup.data.mairies?.length) {
                await db.mairies.bulkAdd(backup.data.mairies);
              }
              if (backup.data.taxes?.length) {
                await db.taxes.bulkAdd(backup.data.taxes);
              }
              if (backup.data.declarations?.length) {
                await db.declarations.bulkAdd(backup.data.declarations);
              }
              if (backup.data.bordereaux?.length) {
                await db.bordereaux.bulkAdd(backup.data.bordereaux);
              }
              if (backup.data.approvisionnements?.length) {
                await db.approvisionnements.bulkAdd(backup.data.approvisionnements);
              }
              if (backup.data.remises?.length) {
                await db.remises.bulkAdd(backup.data.remises);
              }
              if (backup.data.versements?.length) {
                await db.versements.bulkAdd(backup.data.versements);
              }
              if (backup.data.rubriques?.length) {
                await db.rubriques.bulkAdd(backup.data.rubriques);
              }
              if (backup.data.chapitres?.length) {
                await db.chapitres.bulkAdd(backup.data.chapitres);
              }
              if (backup.data.previsions?.length) {
                await db.previsions.bulkAdd(backup.data.previsions);
              }
              if (backup.data.mandats?.length) {
                await db.mandats.bulkAdd(backup.data.mandats);
              }
              if (backup.data.bordereauMandats?.length) {
                await db.bordereauMandats.bulkAdd(backup.data.bordereauMandats);
              }

              $q.notify({
                type: 'positive',
                message: 'Base de données restaurée avec succès',
                icon: 'check_circle',
              });

              await loadStats();
            } catch (error) {
              console.error('Erreur lors de la restauration:', error);
              $q.notify({
                type: 'negative',
                message: 'Erreur lors de la restauration de la base de données',
              });
            }
          })();
        });
      } catch (error) {
        console.error('Erreur lors de la lecture du fichier:', error);
        $q.notify({
          type: 'negative',
          message: 'Erreur lors de la lecture du fichier de sauvegarde',
        });
      }
    };
    reader.readAsText(file);
  };

  input.click();
}

onMounted(() => {
  void loadStats();
});
</script>
