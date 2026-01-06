<template>
  <q-page class="q-pa-md">
    <div class="text-h5 q-mb-md">💾 Sauvegarde & Restauration</div>

    <div class="row q-col-gutter-md">
      <!-- Sauvegarde -->
      <div class="col-12 col-md-6">
        <q-card>
          <q-card-section class="accent-left">
            <div class="row items-center">
              <q-icon name="save" size="md" class="q-mr-md" />
              <div>
                <div class="text-h6">Sauvegarder la base de données</div>
                <div class="text-caption">Créer une copie de toutes vos données</div>
              </div>
            </div>
          </q-card-section>

          <q-card-section class="accent-left">
            <div class="text-body2 q-mb-md">
              La sauvegarde exportera toutes les données de l'application dans un fichier JSON que
              vous pourrez télécharger.
            </div>

            <q-list bordered separator class="q-mb-md">
              <q-item>
                <q-item-section avatar>
                  <q-icon name="check_circle" color="positive" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Utilisateurs</q-item-label>
                  <q-item-label caption>{{ stats.utilisateurs }} enregistrement(s)</q-item-label>
                </q-item-section>
              </q-item>

              <q-item>
                <q-item-section avatar>
                  <q-icon name="check_circle" color="positive" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Chapitres (Dépenses)</q-item-label>
                  <q-item-label caption>{{ stats.chapitres }} enregistrement(s)</q-item-label>
                </q-item-section>
              </q-item>

              <q-item>
                <q-item-section avatar>
                  <q-icon name="check_circle" color="positive" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Sous-Chapitres (Dépenses)</q-item-label>
                  <q-item-label caption>{{ stats.sousChapitres }} enregistrement(s)</q-item-label>
                </q-item-section>
              </q-item>

              <q-item>
                <q-item-section avatar>
                  <q-icon name="check_circle" color="positive" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Prévisions (Dépenses)</q-item-label>
                  <q-item-label caption>{{ stats.previsions }} enregistrement(s)</q-item-label>
                </q-item-section>
              </q-item>

              <q-item>
                <q-item-section avatar>
                  <q-icon name="check_circle" color="positive" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Mandats (Dépenses)</q-item-label>
                  <q-item-label caption>{{ stats.mandats }} enregistrement(s)</q-item-label>
                </q-item-section>
              </q-item>

              <q-item>
                <q-item-section avatar>
                  <q-icon name="check_circle" color="positive" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Bordereaux Mandats (Dépenses)</q-item-label>
                  <q-item-label caption
                    >{{ stats.bordereauMandats }} enregistrement(s)</q-item-label
                  >
                </q-item-section>
              </q-item>

              <q-item>
                <q-item-section avatar>
                  <q-icon name="check_circle" color="green" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Taxes (Recettes)</q-item-label>
                  <q-item-label caption>{{ stats.taxes }} enregistrement(s)</q-item-label>
                </q-item-section>
              </q-item>

              <q-item>
                <q-item-section avatar>
                  <q-icon name="check_circle" color="green" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Déclarations (Recettes)</q-item-label>
                  <q-item-label caption>{{ stats.declarations }} enregistrement(s)</q-item-label>
                </q-item-section>
              </q-item>

              <q-item>
                <q-item-section avatar>
                  <q-icon name="check_circle" color="green" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Bordereaux Recette (Recettes)</q-item-label>
                  <q-item-label caption
                    >{{ stats.bordereauxRecette }} enregistrement(s)</q-item-label
                  >
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>

          <q-card-actions align="right">
            <q-btn
              label="Télécharger la sauvegarde"
              color="positive"
              icon="download"
              @click="exportDatabase"
              :loading="exportLoading"
              unelevated
            />
          </q-card-actions>
        </q-card>
      </div>

      <!-- Restauration -->
      <div class="col-12 col-md-6">
        <q-card>
          <q-card-section class="accent-left">
            <div class="row items-center">
              <q-icon name="upload" size="md" class="q-mr-md" />
              <div>
                <div class="text-h6">Restaurer la base de données</div>
                <div class="text-caption">Importer une sauvegarde précédente</div>
              </div>
            </div>
          </q-card-section>

          <q-card-section>
            <q-banner class="bg-warning text-white q-mb-md" rounded>
              <template v-slot:avatar>
                <q-icon name="warning" />
              </template>
              <strong>Attention :</strong> La restauration remplacera toutes vos données actuelles !
            </q-banner>

            <div class="text-body2 q-mb-md">
              Importez un fichier de sauvegarde pour restaurer vos données. Assurez-vous que le
              fichier provient d'une sauvegarde valide de cette application.
            </div>

            <div class="text-subtitle2 q-mb-sm">Instructions :</div>
            <ol class="q-pl-md text-body2">
              <li class="q-mb-xs">Cliquez sur "Choisir un fichier"</li>
              <li class="q-mb-xs">Sélectionnez votre fichier de sauvegarde (.json)</li>
              <li class="q-mb-xs">Confirmez la restauration</li>
              <li>Attendez que l'importation se termine</li>
            </ol>
          </q-card-section>

          <q-card-actions align="right">
            <q-btn
              label="Choisir un fichier"
              color="info"
              icon="folder_open"
              @click="importDatabase"
              :loading="importLoading"
              unelevated
            />
          </q-card-actions>
        </q-card>
      </div>

      <!-- Historique des sauvegardes -->
      <div class="col-12">
        <q-card>
          <q-card-section>
            <div class="text-h6">📋 Dernières opérations</div>
          </q-card-section>

          <q-card-section v-if="history.length === 0">
            <div class="text-center text-grey-7 q-pa-md">
              <q-icon name="info" size="lg" class="q-mb-sm" />
              <div>Aucune opération enregistrée</div>
            </div>
          </q-card-section>

          <q-card-section v-else>
            <q-list separator>
              <q-item v-for="(item, index) in history" :key="index">
                <q-item-section avatar>
                  <q-icon
                    :name="item.type === 'export' ? 'download' : 'upload'"
                    :color="item.type === 'export' ? 'positive' : 'info'"
                  />
                </q-item-section>

                <q-item-section>
                  <q-item-label>{{ item.action }}</q-item-label>
                  <q-item-label caption>{{ item.date }}</q-item-label>
                </q-item-section>

                <q-item-section side>
                  <q-chip
                    :color="item.success ? 'positive' : 'negative'"
                    text-color="white"
                    size="sm"
                  >
                    {{ item.success ? 'Succès' : 'Échec' }}
                  </q-chip>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { db } from 'src/database/db';

const $q = useQuasar();

const exportLoading = ref(false);
const importLoading = ref(false);

const stats = ref({
  utilisateurs: 0,
  chapitres: 0,
  sousChapitres: 0,
  previsions: 0,
  mandats: 0,
  bordereauMandats: 0,
  taxes: 0,
  declarations: 0,
  bordereauxRecette: 0,
});

interface HistoryItem {
  type: 'export' | 'import';
  action: string;
  date: string;
  success: boolean;
}

const history = ref<HistoryItem[]>([]);

async function loadStats() {
  try {
    const [
      utilisateurs,
      chapitres,
      sousChapitres,
      previsions,
      mandats,
      bordereauMandats,
      taxes,
      declarations,
      bordereauxRecette,
    ] = await Promise.all([
      db.utilisateurs.count(),
      db.chapitres.count(),
      db.sousChapitres.count(),
      db.previsions.count(),
      db.mandats.count(),
      db.bordereauMandats.count(),
      db.taxes.count(),
      db.declarations.count(),
      db.bordereauxRecette.count(),
    ]);

    stats.value = {
      utilisateurs,
      chapitres,
      sousChapitres,
      previsions,
      mandats,
      bordereauMandats,
      taxes,
      declarations,
      bordereauxRecette,
    };
  } catch (error) {
    console.error('Erreur lors du chargement des statistiques:', error);
  }
}

function addToHistory(type: 'export' | 'import', action: string, success: boolean) {
  const item: HistoryItem = {
    type,
    action,
    date: new Date().toLocaleString('fr-FR'),
    success,
  };

  history.value.unshift(item);

  // Garder seulement les 10 dernières opérations
  if (history.value.length > 10) {
    history.value = history.value.slice(0, 10);
  }

  // Sauvegarder dans localStorage
  localStorage.setItem('backup-history', JSON.stringify(history.value));
}

function loadHistory() {
  try {
    const saved = localStorage.getItem('backup-history');
    if (saved) {
      history.value = JSON.parse(saved);
    }
  } catch (error) {
    console.error("Erreur lors du chargement de l'historique:", error);
  }
}

async function exportDatabase() {
  exportLoading.value = true;
  try {
    // Récupérer toutes les données de toutes les tables
    const [
      utilisateurs,
      chapitres,
      sousChapitres,
      previsions,
      mandats,
      bordereauMandats,
      taxes,
      declarations,
      bordereauxRecette,
    ] = await Promise.all([
      db.utilisateurs.toArray(),
      db.chapitres.toArray(),
      db.sousChapitres.toArray(),
      db.previsions.toArray(),
      db.mandats.toArray(),
      db.bordereauMandats.toArray(),
      db.taxes.toArray(),
      db.declarations.toArray(),
      db.bordereauxRecette.toArray(),
    ]);

    // Créer l'objet de sauvegarde
    const backup = {
      version: '2.0',
      appName: 'TresorApp-MAIRIE',
      exportDate: new Date().toISOString(),
      data: {
        utilisateurs,
        chapitres,
        sousChapitres,
        previsions,
        mandats,
        bordereauMandats,
        taxes,
        declarations,
        bordereauxRecette,
      },
      stats: {
        utilisateurs: utilisateurs.length,
        chapitres: chapitres.length,
        sousChapitres: sousChapitres.length,
        previsions: previsions.length,
        mandats: mandats.length,
        bordereauMandats: bordereauMandats.length,
        taxes: taxes.length,
        declarations: declarations.length,
        bordereauxRecette: bordereauxRecette.length,
      },
    };

    // Convertir en JSON
    const json = JSON.stringify(backup, null, 2);

    // Créer un blob et le télécharger
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const dateStr = new Date().toISOString().split('T')[0];
    const timeStr = new Date().toTimeString().split(' ')[0]?.replace(/:/g, '-');
    link.download = `tresor-mairie-backup-${dateStr}-${timeStr}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    const totalRecords = Object.values(backup.stats).reduce((a, b) => a + b, 0);
    addToHistory('export', `Sauvegarde créée (${totalRecords} enregistrements)`, true);

    $q.notify({
      type: 'positive',
      message: 'Base de données sauvegardée avec succès',
      icon: 'check_circle',
      position: 'top',
    });
  } catch (error) {
    console.error('Erreur lors de la sauvegarde:', error);
    addToHistory('export', 'Échec de la sauvegarde', false);
    $q.notify({
      type: 'negative',
      message: 'Erreur lors de la sauvegarde de la base de données',
      position: 'top',
    });
  } finally {
    exportLoading.value = false;
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

    importLoading.value = true;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = event.target?.result as string;
        const backup = JSON.parse(json);

        // Vérifier la structure du backup
        if (!backup.data || !backup.appName || !backup.appName.startsWith('TresorApp')) {
          throw new Error('Format de fichier invalide ou incompatible');
        }

        const exportDate = new Date(backup.exportDate).toLocaleString('fr-FR');
        const totalRecords = backup.stats
          ? Object.values(backup.stats).reduce((a: number, b: unknown) => a + (b as number), 0)
          : 0;

        // Demander confirmation
        $q.dialog({
          title: 'Confirmation de restauration',
          message: `Voulez-vous vraiment restaurer cette sauvegarde ?

📅 Date : ${exportDate}
📊 ${totalRecords} enregistrements au total

⚠️ Les données actuelles seront remplacées !`,
          cancel: { label: 'Annuler', color: 'grey', flat: true },
          ok: { label: 'Restaurer', color: 'info', unelevated: true },
          persistent: true,
        })
          .onOk(() => {
            void (async () => {
              try {
                // Vider les tables existantes
                await Promise.all([
                  db.utilisateurs.clear(),
                  db.chapitres.clear(),
                  db.sousChapitres.clear(),
                  db.previsions.clear(),
                  db.mandats.clear(),
                  db.bordereauMandats.clear(),
                  db.taxes.clear(),
                  db.declarations.clear(),
                  db.bordereauxRecette.clear(),
                ]);

                // Restaurer les données
                let restored = 0;
                if (backup.data.utilisateurs?.length) {
                  await db.utilisateurs.bulkAdd(backup.data.utilisateurs);
                  restored += backup.data.utilisateurs.length;
                }
                if (backup.data.chapitres?.length) {
                  await db.chapitres.bulkAdd(backup.data.chapitres);
                  restored += backup.data.chapitres.length;
                }
                if (backup.data.sousChapitres?.length) {
                  await db.sousChapitres.bulkAdd(backup.data.sousChapitres);
                  restored += backup.data.sousChapitres.length;
                }
                if (backup.data.previsions?.length) {
                  await db.previsions.bulkAdd(backup.data.previsions);
                  restored += backup.data.previsions.length;
                }
                if (backup.data.mandats?.length) {
                  await db.mandats.bulkAdd(backup.data.mandats);
                  restored += backup.data.mandats.length;
                }
                if (backup.data.bordereauMandats?.length) {
                  await db.bordereauMandats.bulkAdd(backup.data.bordereauMandats);
                  restored += backup.data.bordereauMandats.length;
                }
                if (backup.data.taxes?.length) {
                  await db.taxes.bulkAdd(backup.data.taxes);
                  restored += backup.data.taxes.length;
                }
                if (backup.data.declarations?.length) {
                  await db.declarations.bulkAdd(backup.data.declarations);
                  restored += backup.data.declarations.length;
                }
                if (backup.data.bordereauxRecette?.length) {
                  await db.bordereauxRecette.bulkAdd(backup.data.bordereauxRecette);
                  restored += backup.data.bordereauxRecette.length;
                }

                addToHistory('import', `Restauration réussie (${restored} enregistrements)`, true);

                $q.notify({
                  type: 'positive',
                  message: `Base de données restaurée avec succès (${restored} enregistrements)`,
                  icon: 'check_circle',
                  position: 'top',
                  timeout: 3000,
                });

                await loadStats();
              } catch (error) {
                console.error('Erreur lors de la restauration:', error);
                addToHistory('import', 'Échec de la restauration', false);
                $q.notify({
                  type: 'negative',
                  message: 'Erreur lors de la restauration de la base de données',
                  position: 'top',
                });
              } finally {
                importLoading.value = false;
              }
            })();
          })
          .onCancel(() => {
            importLoading.value = false;
          });
      } catch (error) {
        console.error('Erreur lors de la lecture du fichier:', error);
        addToHistory('import', 'Fichier invalide', false);
        $q.notify({
          type: 'negative',
          message: 'Erreur : Fichier de sauvegarde invalide ou corrompu',
          position: 'top',
        });
        importLoading.value = false;
      }
    };
    reader.readAsText(file);
  };

  input.click();
}

onMounted(() => {
  void loadStats();
  loadHistory();
});
</script>

<style scoped lang="scss">
.q-card {
  height: 100%;
}
</style>
