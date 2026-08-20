<template>
  <q-page class="backup-page q-pa-md">
    <PageHeader
      title="Sauvegarde & Restauration"
      subtitle="Exportation et importation des données"
      icon="backup"
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

    <div class="row q-col-gutter-md">
      <!-- Sauvegarde complète -->
      <div class="col-12 col-md-6">
        <q-card class="admin-card">
          <q-card-section class="accent-left">
            <div class="row items-center">
              <q-icon name="save" size="md" class="q-mr-md" />
              <div>
                <div class="text-h6">Sauvegarder toute la base</div>
                <div class="text-caption">Créer une copie complète de toutes vos données</div>
              </div>
            </div>
          </q-card-section>

          <q-card-section class="accent-left">
            <div class="text-body2 q-mb-md">
              La sauvegarde exportera toutes les données de l'application dans un fichier JSON.
            </div>

            <q-list bordered separator class="q-mb-md">
              <q-item v-for="mod in modules" :key="mod.key">
                <q-item-section avatar>
                  <q-icon name="check_circle" :color="mod.color" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ mod.icon }} {{ mod.label }}</q-item-label>
                  <q-item-label caption
                    >{{ getModuleRecordCount(mod) }} enregistrement(s)</q-item-label
                  >
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>

          <q-card-actions align="right">
            <q-btn
              label="Télécharger la sauvegarde complète"
              color="positive"
              icon="download"
              data-visite="systeme-backup"
              @click="exportAll"
              :loading="exportLoading"
              unelevated
            />
          </q-card-actions>
        </q-card>
      </div>

      <!-- Restauration complète -->
      <div class="col-12 col-md-6">
        <q-card class="admin-card">
          <q-card-section class="accent-left">
            <div class="row items-center">
              <q-icon name="upload" size="md" class="q-mr-md" />
              <div>
                <div class="text-h6">Restaurer la base de données</div>
                <div class="text-caption">Importer une sauvegarde complète</div>
              </div>
            </div>
          </q-card-section>

          <q-card-section>
            <q-banner class="admin-warning-banner q-mb-md" rounded>
              <template v-slot:avatar>
                <q-icon name="warning" />
              </template>
              <strong>Attention :</strong> La restauration complète remplacera toutes vos données
              actuelles !
            </q-banner>

            <div class="text-body2 q-mb-md">
              Importez un fichier de sauvegarde complète pour restaurer vos données.
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
              @click="importAll"
              :loading="importLoading"
              unelevated
            />
          </q-card-actions>
        </q-card>
      </div>

      <!-- Export / Import par module -->
      <div class="col-12">
        <q-card class="admin-card">
          <q-card-section>
            <div class="text-h6">📦 Export / Import par module</div>
            <div class="text-caption text-grey-7">
              Téléchargez ou importez les données d'un module spécifique sans toucher aux autres.
            </div>
          </q-card-section>

          <q-card-section>
            <div class="row q-col-gutter-md">
              <div class="col-12 col-sm-6 col-md-3" v-for="mod in modules" :key="mod.key">
                <q-card flat class="listing-stat-card admin-module-card">
                  <q-card-section>
                    <div class="text-subtitle1 text-weight-medium q-mb-xs">
                      {{ mod.icon }} {{ mod.label }}
                    </div>
                    <q-list dense class="text-caption text-grey-7 q-mb-sm">
                      <q-item
                        v-for="t in mod.tables"
                        :key="t.table"
                        dense
                        class="q-pa-none"
                        style="min-height: 24px"
                      >
                        <q-item-section>{{ t.label }}</q-item-section>
                        <q-item-section side>
                          <span class="text-primary text-weight-medium">{{
                            stats[t.table] ?? 0
                          }}</span>
                        </q-item-section>
                      </q-item>
                    </q-list>
                  </q-card-section>
                  <q-separator />
                  <q-card-actions>
                    <q-btn
                      flat
                      dense
                      icon="download"
                      label="Exporter"
                      color="positive"
                      :loading="moduleLoading[mod.key]?.export"
                      @click="exportModule(mod)"
                      class="col"
                    />
                    <q-separator vertical />
                    <q-btn
                      flat
                      dense
                      icon="upload"
                      label="Importer"
                      color="info"
                      :loading="moduleLoading[mod.key]?.import"
                      @click="importModule(mod)"
                      class="col"
                    />
                  </q-card-actions>
                </q-card>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Historique des sauvegardes -->
      <div class="col-12">
        <q-card class="admin-card">
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
import { computed, ref, reactive, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { db } from 'src/database/db';
import PageHeader from 'src/components/PageHeader.vue';

const $q = useQuasar();

const exportLoading = ref(false);
const importLoading = ref(false);

// ========== Module definitions ==========

interface TableDef {
  table: string;
  label: string;
}

interface ModuleDef {
  key: string;
  label: string;
  icon: string;
  color: string;
  tables: TableDef[];
}

const modules: ModuleDef[] = [
  {
    key: 'systeme',
    label: 'Système',
    icon: '🔧',
    color: 'grey',
    tables: [
      { table: 'mairies', label: 'Mairies' },
      { table: 'utilisateurs', label: 'Utilisateurs' },
      { table: 'exercices', label: 'Exercices' },
    ],
  },
  {
    key: 'depenses',
    label: 'Dépenses',
    icon: '💰',
    color: 'primary',
    tables: [
      { table: 'chapitres', label: 'Chapitres' },
      { table: 'sousChapitres', label: 'Sous-Chapitres' },
      { table: 'previsions', label: 'Prévisions' },
      { table: 'mandats', label: 'Mandats' },
      { table: 'bordereauMandats', label: 'Bordereaux Mandats' },
      { table: 'etatFinancierMensuel', label: 'États Fin. Mensuels' },
    ],
  },
  {
    key: 'recettes',
    label: 'Recettes',
    icon: '📥',
    color: 'green',
    tables: [
      { table: 'taxes', label: 'Taxes' },
      { table: 'chapitresRecette', label: 'Chapitres Recettes' },
      { table: 'declarations', label: 'Déclarations' },
      { table: 'bordereauxRecette', label: 'Bordereaux Recettes' },
      { table: 'previsionsRecettes', label: 'Prévisions Recettes' },
      { table: 'mandatsRecette', label: 'Mandats Recettes' },
      { table: 'bordereauMandatsRecette', label: 'Bord. Mandats Recettes' },
      { table: 'etatFinancierMensuelRecette', label: 'États Fin. Mensuels' },
    ],
  },
  {
    key: 'employes',
    label: 'Employés',
    icon: '👥',
    color: 'orange',
    tables: [
      { table: 'employes', label: 'Employés' },
      { table: 'fichesPaie', label: 'Fiches de Paie' },
      { table: 'conges', label: 'Congés' },
      { table: 'ordresMission', label: 'Ordres de Mission' },
      { table: 'parametresPaie', label: 'Paramètres Paie' },
      { table: 'servicesApp7', label: 'Services' },
    ],
  },
];

// All table names flattened
const allTableNames = modules.flatMap((m) => m.tables.map((t) => t.table));

// Stats (counts per table)
const stats = reactive<Record<string, number>>({});

// Per-module loading states
const moduleLoading = reactive<Record<string, { export: boolean; import: boolean }>>({});
for (const mod of modules) {
  moduleLoading[mod.key] = { export: false, import: false };
}

function getModuleRecordCount(mod: ModuleDef): number {
  return mod.tables.reduce((sum, t) => sum + (stats[t.table] ?? 0), 0);
}

const totalRecords = computed(() =>
  allTableNames.reduce((sum, name) => sum + (stats[name] ?? 0), 0),
);
const successfulOperations = computed(() => history.value.filter((item) => item.success).length);
const heroStats = computed(() => [
  {
    label: 'Enregistrements',
    value: totalRecords.value,
    helper: `${modules.length} modules couverts`,
    icon: 'dataset',
    color: 'primary',
  },
  {
    label: 'Modules',
    value: modules.length,
    helper: 'Export / import granulaire',
    icon: 'inventory_2',
    color: 'secondary',
  },
  {
    label: 'Historique',
    value: history.value.length,
    helper: `${successfulOperations.value} opération(s) réussie(s)`,
    icon: 'history',
    color: 'teal',
  },
  {
    label: 'Dernière action',
    value: history.value[0]?.type === 'import' ? 'Import' : history.value[0] ? 'Export' : 'Aucune',
    helper: history.value[0]?.action || 'Pas encore d’opération enregistrée',
    icon: 'sync_alt',
    color: 'positive',
  },
]);

// ========== History ==========

interface HistoryItem {
  type: 'export' | 'import';
  action: string;
  date: string;
  success: boolean;
}

const history = ref<HistoryItem[]>([]);

function addToHistory(type: 'export' | 'import', action: string, success: boolean) {
  history.value.unshift({
    type,
    action,
    date: new Date().toLocaleString('fr-FR'),
    success,
  });
  if (history.value.length > 10) history.value = history.value.slice(0, 10);
  localStorage.setItem('backup-history', JSON.stringify(history.value));
}

function loadHistory() {
  try {
    const saved = localStorage.getItem('backup-history');
    if (saved) history.value = JSON.parse(saved);
  } catch {
    /* ignore */
  }
}

// ========== Stats ==========

async function loadStats() {
  try {
    await Promise.all(
      allTableNames.map(async (name) => {
        try {
          stats[name] = await db.table(name).count();
        } catch {
          stats[name] = 0;
        }
      }),
    );
  } catch (error) {
    console.error('Erreur lors du chargement des statistiques:', error);
  }
}

// ========== Generic helpers ==========

async function readTablesData(tableNames: string[]): Promise<Record<string, unknown[]>> {
  const data: Record<string, unknown[]> = {};
  await Promise.all(
    tableNames.map(async (name) => {
      try {
        data[name] = await db.table(name).toArray();
      } catch {
        data[name] = [];
      }
    }),
  );
  return data;
}

function downloadJson(obj: unknown, filename: string) {
  const json = JSON.stringify(obj, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function buildFilename(suffix: string): string {
  const dateStr = new Date().toISOString().split('T')[0];
  const timeStr = new Date().toTimeString().split(' ')[0]?.replace(/:/g, '-');
  return `sigobc-${suffix}-${dateStr}-${timeStr}.json`;
}

function pickJsonFile(): Promise<File | null> {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e: Event) => {
      const target = e.target as HTMLInputElement;
      resolve(target.files?.[0] ?? null);
    };
    input.click();
  });
}

function readFileAsJson(file: File): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        resolve(JSON.parse(event.target?.result as string));
      } catch (err) {
        reject(err instanceof Error ? err : new Error(String(err)));
      }
    };
    reader.onerror = () => reject(new Error('Erreur de lecture du fichier'));
    reader.readAsText(file);
  });
}

async function restoreTables(
  tableNames: string[],
  data: Record<string, unknown[]>,
): Promise<number> {
  // Clear target tables
  await Promise.all(
    tableNames.map(async (name) => {
      try {
        await db.table(name).clear();
      } catch {
        /* table may not exist */
      }
    }),
  );

  // Restore
  let restored = 0;
  for (const name of tableNames) {
    const rows = data[name];
    if (Array.isArray(rows) && rows.length > 0) {
      try {
        await db.table(name).bulkAdd(rows);
        restored += rows.length;
      } catch {
        /* skip unknown table */
      }
    }
  }
  return restored;
}

// ========== Full export ==========

async function exportAll() {
  exportLoading.value = true;
  try {
    const data = await readTablesData(allTableNames);
    const statsCounts: Record<string, number> = {};
    for (const name of allTableNames) {
      statsCounts[name] = (data[name] ?? []).length;
    }

    const backup = {
      version: '3.0',
      appName: 'SIGOBC-MAIRIE',
      exportType: 'full',
      exportDate: new Date().toISOString(),
      data,
      stats: statsCounts,
    };

    downloadJson(backup, buildFilename('backup-complet'));
    const total = Object.values(statsCounts).reduce((a, b) => a + b, 0);
    addToHistory('export', `Sauvegarde complète (${total} enregistrements)`, true);
    $q.notify({
      type: 'positive',
      message: 'Sauvegarde complète téléchargée',
      icon: 'check_circle',
      position: 'top',
    });
  } catch (error) {
    console.error('Erreur export:', error);
    addToHistory('export', 'Échec de la sauvegarde complète', false);
    $q.notify({ type: 'negative', message: 'Erreur lors de la sauvegarde', position: 'top' });
  } finally {
    exportLoading.value = false;
  }
}

// ========== Full import ==========

async function importAll() {
  const file = await pickJsonFile();
  if (!file) return;
  importLoading.value = true;
  try {
    const backup = (await readFileAsJson(file)) as {
      appName?: string;
      data?: Record<string, unknown[]>;
      stats?: Record<string, number>;
      exportDate?: string;
    };

    if (
      !backup.data ||
      !backup.appName ||
      (!backup.appName.startsWith('TresorApp') && !backup.appName.startsWith('SIGOBC'))
    ) {
      throw new Error('Format de fichier invalide ou incompatible');
    }

    const exportDate = new Date(backup.exportDate || '').toLocaleString('fr-FR');
    const totalRecords = backup.stats ? Object.values(backup.stats).reduce((a, b) => a + b, 0) : 0;

    $q.dialog({
      title: 'Confirmation de restauration complète',
      message: `Voulez-vous vraiment restaurer cette sauvegarde ?\n\n📅 Date : ${exportDate}\n📊 ${totalRecords} enregistrements au total\n\n⚠️ TOUTES les données actuelles seront remplacées !`,
      cancel: { label: 'Annuler', color: 'grey', flat: true },
      ok: { label: 'Restaurer', color: 'info', unelevated: true },
      persistent: true,
    })
      .onOk(() => {
        void (async () => {
          try {
            const restored = await restoreTables(allTableNames, backup.data!);
            addToHistory('import', `Restauration complète (${restored} enregistrements)`, true);
            $q.notify({
              type: 'positive',
              message: `Restauration complète réussie (${restored} enregistrements)`,
              icon: 'check_circle',
              position: 'top',
              timeout: 3000,
            });
            await loadStats();
          } catch (error) {
            console.error('Erreur restauration:', error);
            addToHistory('import', 'Échec de la restauration complète', false);
            $q.notify({
              type: 'negative',
              message: 'Erreur lors de la restauration',
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
    console.error('Erreur lecture fichier:', error);
    addToHistory('import', 'Fichier invalide', false);
    $q.notify({
      type: 'negative',
      message: 'Fichier de sauvegarde invalide ou corrompu',
      position: 'top',
    });
    importLoading.value = false;
  }
}

// ========== Per-module export ==========

async function exportModule(mod: ModuleDef) {
  moduleLoading[mod.key]!.export = true;
  try {
    const tableNames = mod.tables.map((t) => t.table);
    const data = await readTablesData(tableNames);
    const statsCounts: Record<string, number> = {};
    for (const name of tableNames) {
      statsCounts[name] = (data[name] ?? []).length;
    }

    const backup = {
      version: '3.0',
      appName: 'SIGOBC-MAIRIE',
      exportType: 'module',
      moduleKey: mod.key,
      moduleLabel: mod.label,
      exportDate: new Date().toISOString(),
      data,
      stats: statsCounts,
    };

    downloadJson(backup, buildFilename(`module-${mod.key}`));
    const total = Object.values(statsCounts).reduce((a, b) => a + b, 0);
    addToHistory('export', `Export ${mod.label} (${total} enregistrements)`, true);
    $q.notify({
      type: 'positive',
      message: `${mod.label} exporté avec succès`,
      icon: 'check_circle',
      position: 'top',
    });
  } catch (error) {
    console.error('Erreur export module:', error);
    addToHistory('export', `Échec export ${mod.label}`, false);
    $q.notify({
      type: 'negative',
      message: `Erreur lors de l'export de ${mod.label}`,
      position: 'top',
    });
  } finally {
    moduleLoading[mod.key]!.export = false;
  }
}

// ========== Per-module import ==========

async function importModule(mod: ModuleDef) {
  const file = await pickJsonFile();
  if (!file) return;
  moduleLoading[mod.key]!.import = true;
  try {
    const backup = (await readFileAsJson(file)) as {
      appName?: string;
      moduleKey?: string;
      exportType?: string;
      data?: Record<string, unknown[]>;
      stats?: Record<string, number>;
      exportDate?: string;
    };

    if (!backup.data || !backup.appName) {
      const manquants = [!backup.appName && 'appName', !backup.data && 'data']
        .filter(Boolean)
        .join(' et ');
      throw new Error(
        `Format de fichier invalide : « ${file.name} » n'est pas une sauvegarde SIGOBC (clé ${manquants} absente). Choisissez un fichier sigobc-module-….json issu du bouton « Exporter ».`,
      );
    }

    // Determine which tables we can import from this file
    const tableNames = mod.tables.map((t) => t.table);
    const availableTables = tableNames.filter((name) => Array.isArray(backup.data![name]));

    if (availableTables.length === 0) {
      throw new Error(`Ce fichier ne contient aucune donnée pour le module "${mod.label}".`);
    }

    const totalRecords = availableTables.reduce(
      (sum, name) => sum + (backup.data![name]?.length ?? 0),
      0,
    );

    $q.dialog({
      title: `Importer ${mod.label}`,
      message: `Voulez-vous remplacer les données du module "${mod.label}" ?\n\n📊 ${totalRecords} enregistrements à importer\n📁 ${availableTables.length} table(s) trouvée(s)\n\n⚠️ Les données actuelles de ce module seront remplacées !`,
      cancel: { label: 'Annuler', color: 'grey', flat: true },
      ok: { label: 'Importer', color: 'info', unelevated: true },
      persistent: true,
    })
      .onOk(() => {
        void (async () => {
          try {
            const restored = await restoreTables(tableNames, backup.data!);
            addToHistory('import', `Import ${mod.label} (${restored} enregistrements)`, true);
            $q.notify({
              type: 'positive',
              message: `${mod.label} importé avec succès (${restored} enregistrements)`,
              icon: 'check_circle',
              position: 'top',
              timeout: 3000,
            });
            await loadStats();
          } catch (error) {
            console.error('Erreur import module:', error);
            addToHistory('import', `Échec import ${mod.label}`, false);
            $q.notify({
              type: 'negative',
              message: `Erreur lors de l'import de ${mod.label}`,
              position: 'top',
            });
          } finally {
            moduleLoading[mod.key]!.import = false;
          }
        })();
      })
      .onCancel(() => {
        moduleLoading[mod.key]!.import = false;
      });
  } catch (error) {
    console.error('Erreur lecture fichier:', error);
    const msg = error instanceof Error ? error.message : 'Fichier invalide';
    addToHistory('import', `Échec import ${mod.label}: ${msg}`, false);
    $q.notify({ type: 'negative', message: msg, position: 'top' });
    moduleLoading[mod.key]!.import = false;
  }
}

onMounted(() => {
  void loadStats();
  loadHistory();
});
</script>

<style scoped lang="scss">
.backup-page {
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
  overflow: hidden;
}

.admin-warning-banner {
  background: linear-gradient(135deg, rgba(197, 168, 77, 0.94), rgba(185, 146, 38, 0.92));
  color: white;
}

.admin-module-card {
  min-height: 100%;
}

.admin-card :deep(.q-list .q-item),
.admin-module-card :deep(.q-item) {
  border-radius: 14px;
}
</style>
