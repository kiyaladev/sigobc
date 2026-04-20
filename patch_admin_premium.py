from pathlib import Path
import re

root = Path(r'C:\Users\Coumbassa Stephane\Documents\GitHub\declarapp\frontend\src\pages')

# ---------- AdminSeedersPage ----------
path = root / 'admin' / 'AdminSeedersPage.vue'
text = path.read_text(encoding='utf-8')
text = text.replace("import { ref, onMounted } from 'vue';", "import { computed, ref, onMounted } from 'vue';")
text = text.replace(
'''      <PageHeader
        title="Gestion de la Base de Données"
        subtitle="Initialisation et génération de données de test"
        icon="database"
      />''',
'''      <PageHeader
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
      </PageHeader>''')
text = text.replace(
'''const stats = ref([
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
]);''',
'''const stats = ref([
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
const usersCount = computed(() => stats.value.find((stat) => stat.table === 'utilisateurs')?.count ?? 0);
const previsionsCount = computed(() => stats.value.find((stat) => stat.table === 'previsions')?.count ?? 0);

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
]);''')
text = re.sub(r'<style scoped lang="scss">.*?</style>\s*$', '''<style scoped lang="scss">
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
''', text, flags=re.S)
path.write_text(text, encoding='utf-8')

# ---------- BackupPage ----------
path = root / 'admin' / 'BackupPage.vue'
text = path.read_text(encoding='utf-8')
text = text.replace("import { ref, reactive, onMounted } from 'vue';", "import { computed, ref, reactive, onMounted } from 'vue';")
text = text.replace(
'''      <PageHeader
        title="Sauvegarde & Restauration"
        subtitle="Exportation et importation des données"
        icon="backup"
      />''',
'''      <PageHeader
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
      </PageHeader>''')
text = text.replace(
'''function getModuleRecordCount(mod: ModuleDef): number {
  return mod.tables.reduce((sum, t) => sum + (stats[t.table] ?? 0), 0);
}''',
'''function getModuleRecordCount(mod: ModuleDef): number {
  return mod.tables.reduce((sum, t) => sum + (stats[t.table] ?? 0), 0);
}

const totalRecords = computed(() => allTableNames.reduce((sum, name) => sum + (stats[name] ?? 0), 0));
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
]);''')
text = re.sub(r'<style scoped lang="scss">.*?</style>\s*$', '''<style scoped lang="scss">
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
''', text, flags=re.S)
path.write_text(text, encoding='utf-8')

# ---------- ParametragePage ----------
path = root / 'admin' / 'ParametragePage.vue'
text = path.read_text(encoding='utf-8')
text = text.replace("import { ref, onMounted } from 'vue';", "import { computed, ref, onMounted } from 'vue';")
text = text.replace(
'''      <PageHeader
        title="Paramétrage"
        subtitle="Configuration générale de l'application"
        icon="settings"
      />''',
'''      <PageHeader
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
      </PageHeader>''')
text = text.replace(
'''const exerciceColumns = [
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
];''',
'''const exerciceColumns = [
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
    value: mairie.value?.code || '--',
    helper: mairie.value?.nom || 'Aucune mairie configurée',
    icon: 'location_city',
    color: 'secondary',
  },
  {
    label: 'Maire',
    value: mairie.value?.maire ? 'OK' : '--',
    helper: mairie.value?.maire || 'Information non renseignée',
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
]);''')
text = re.sub(r'<style scoped lang="scss">.*?</style>\s*$', '''<style scoped lang="scss">
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
</style>
''', text, flags=re.S)
path.write_text(text, encoding='utf-8')

print('patched admin premium')
