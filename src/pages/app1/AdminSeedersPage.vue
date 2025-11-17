<template>
  <q-page class="q-pa-md">
    <div class="text-h5 q-mb-md">⚙️ Seeders de Test</div>

    <q-banner class="bg-warning text-white q-mb-md" rounded>
      <template v-slot:avatar>
        <q-icon name="warning" />
      </template>
      <strong>Attention :</strong> Les seeders vont supprimer toutes les données existantes !
    </q-banner>

    <div class="row q-col-gutter-md">
      <!-- Seeder complet -->
      <div class="col-12 col-md-6">
        <q-card>
          <q-card-section class="bg-primary text-white">
            <div class="text-h6">🚀 Seeder Complet</div>
            <div class="text-caption">Génère toutes les données de test</div>
          </q-card-section>

          <q-card-section>
            <div class="q-gutter-md">
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
              />
              <q-input
                v-model.number="fullSeederOptions.personnel"
                type="number"
                label="Personnel"
                filled
                dense
              />
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
              />
              <q-input
                v-model.number="fullSeederOptions.bordereaux"
                type="number"
                label="Bordereaux"
                filled
                dense
              />
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
              <q-item v-for="table in tables" :key="table.name" class="q-mb-sm">
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
import { ref, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { db } from 'src/database/db';
import { runAllSeeders, seedTable } from 'src/database/seeders';

const $q = useQuasar();

const loading = ref(false);
const loadingTable = ref<string | null>(null);
const logs = ref<string[]>([]);

const fullSeederOptions = ref({
  utilisateurs: 10,
  mairies: 15,
  personnel: 30,
  taxes: 25,
  declarations: 100,
  bordereaux: 80,
});

const tables = ref([
  { name: 'utilisateurs', label: 'Utilisateurs', description: 'Comptes utilisateurs', count: 10 },
  { name: 'mairies', label: 'Mairies', description: 'Communes et mairies', count: 15 },
  { name: 'taxes', label: 'Taxes', description: 'Types de taxes', count: 25 },
  {
    name: 'declarations',
    label: 'Déclarations',
    description: 'Déclarations de recettes',
    count: 100,
  },
  { name: 'bordereaux', label: 'Bordereaux', description: 'Bordereaux de paiement', count: 80 },
]);

const stats = ref([
  { label: 'Utilisateurs', count: 0 },
  { label: 'Mairies', count: 0 },
  { label: 'Taxes', count: 0 },
  { label: 'Déclarations', count: 0 },
  { label: 'Bordereaux', count: 0 },
]);

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
    const [utilisateurs, mairies, taxes, declarations, bordereaux] = await Promise.all([
      db.utilisateurs.count(),
      db.mairies.count(),
      db.taxes.count(),
      db.declarations.count(),
      db.bordereaux.count(),
    ]);

    stats.value[0]!.count = utilisateurs;
    stats.value[1]!.count = mairies;
    stats.value[2]!.count = taxes;
    stats.value[3]!.count = declarations;
    stats.value[4]!.count = bordereaux;
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
          tableName as 'utilisateurs' | 'mairies' | 'taxes' | 'declarations' | 'bordereaux',
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
    const [utilisateurs, mairies, taxes, declarations, bordereaux] = await Promise.all([
      db.utilisateurs.toArray(),
      db.mairies.toArray(),
      db.taxes.toArray(),
      db.declarations.toArray(),
      db.bordereaux.toArray(),
    ]);

    // Créer l'objet de sauvegarde
    const backup = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      data: {
        utilisateurs,
        mairies,
        taxes,
        declarations,
        bordereaux,
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
