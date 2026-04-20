from pathlib import Path
import re

base = Path(r'C:\Users\Coumbassa Stephane\Documents\GitHub\declarapp\frontend\src\pages')

old_stats_block = re.compile(r"\n\s*<!-- Cartes de statistiques principales -->.*?<!-- Graphiques et analyses -->", re.S)

new_style_common = '''<style scoped lang="scss">
.statistiques-page,
.dashboard-page {
  max-width: 1400px;
  margin: 0 auto;
}

.overview-stat-card {
  min-height: 112px;
}

.secondary-stat-card {
  min-height: 108px;
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

.analytics-grid {
  position: relative;
}

.analytics-card,
.analytics-empty-state {
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 24px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.94));
  box-shadow: 0 18px 34px rgba(15, 23, 42, 0.08);
}

.analytics-card {
  overflow: hidden;
}

.analytics-card :deep(.q-card__section.bg-grey-1) {
  background: linear-gradient(180deg, rgba(248, 250, 252, 0.94), rgba(241, 245, 249, 0.86));
  border-bottom: 1px solid rgba(148, 163, 184, 0.16);
}

.analytics-card :deep(.q-card__section.bg-grey-1 .text-h6),
.analytics-chart-card :deep(.q-card__section:first-child .text-h6),
.analytics-card :deep(.text-h6) {
  color: #0f172a !important;
  font-size: 1.08rem;
  font-weight: 800;
}

.analytics-card :deep(.q-card__section + .q-card__section) {
  padding-top: 18px;
}

.analytics-card :deep(.q-list .q-item) {
  border-radius: 14px;
  margin: 6px 0;
  transition: background-color 0.2s ease, transform 0.2s ease;
}

.analytics-card :deep(.q-list .q-item:hover) {
  background: rgba(15, 23, 42, 0.04);
  transform: translateX(3px);
}

.analytics-card :deep(.q-table) {
  border-radius: 18px;
  overflow: hidden;
}

.analytics-card :deep(.q-table thead tr) {
  background: linear-gradient(180deg, #f8fafc 0%, #eef4f8 100%);
}

.analytics-card :deep(.q-table tbody tr:nth-child(even)) {
  background: rgba(248, 250, 252, 0.72);
}

.analytics-card :deep(.q-table tbody tr:hover) {
  background: rgba(197, 168, 77, 0.08);
}

.analytics-card :deep(.q-linear-progress) {
  border-radius: 999px;
  overflow: hidden;
}

.analytics-chart-card :deep(.q-card__section:first-child) {
  padding-bottom: 0;
}

.analytics-empty-state {
  overflow: hidden;
}

.chart-container {
  position: relative;
  height: 300px;
}

.chart-container-large {
  position: relative;
  height: 400px;
}

.compact-toolbar {
  margin-bottom: 14px;
  padding: 10px 12px;
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 18px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(248, 250, 252, 0.92));
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.05);
}

.compact-toolbar-top {
  gap: 10px 0;
}

.compact-toolbar-summary {
  display: flex;
  align-items: center;
}

.compact-toolbar-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

.compact-toolbar-actions :deep(.q-btn) {
  min-height: 36px;
  border-radius: 12px;
}

.compact-filter-panel {
  width: min(920px, 92vw);
  padding: 14px;
}

.compact-filter-panel-title {
  margin-bottom: 10px;
  color: #334155;
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
</style>
'''

# app3
app3 = base / 'app3' / 'StatistiquesPage.vue'
text = app3.read_text(encoding='utf-8')
text = text.replace(
'''    <PageHeader
      title="Statistiques des Dépenses"
      subtitle="Analyse et suivi de l'exécution budgétaire"
      icon="analytics"
    />''',
'''    <PageHeader
      title="Statistiques des Dépenses"
      subtitle="Analyse et suivi de l'exécution budgétaire"
      icon="analytics"
    >
      <template #stats>
        <div
          v-for="(stat, index) in heroStats"
          :key="`hero-${index}`"
          class="col-12 col-sm-6 col-lg-3"
        >
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
text = old_stats_block.sub('''

    <div class="row q-col-gutter-md q-mb-md">
      <div
        v-for="(stat, index) in secondaryStats"
        :key="`secondary-${index}`"
        class="col-12 col-sm-6 col-lg-3"
      >
        <q-card flat class="listing-stat-card overview-stat-card secondary-stat-card">
          <q-card-section class="row items-center no-wrap">
            <div class="col">
              <div class="overview-stat-label">{{ stat.label }}</div>
              <div class="overview-stat-value">{{ stat.value }}</div>
              <div v-if="stat.helper" class="overview-stat-helper">{{ stat.helper }}</div>
            </div>
            <q-icon :name="stat.icon" size="28px" :color="stat.color" />
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Graphiques et analyses -->''', text, count=1)
text = text.replace("import StatisticsCard from 'src/components/StatisticsCard.vue';\n", '')
text = text.replace(
'''});

// Détails par chapitre''',
''' });

const heroStats = computed(() => [
  {
    label: 'Budget total',
    value: formatMontant(stats.value.budgetTotal),
    helper: `${previsions.value.length} prévision${previsions.value.length > 1 ? 's' : ''} sur l'exercice`,
    icon: 'payments',
    color: 'secondary',
  },
  {
    label: 'Montant engagé',
    value: formatMontant(stats.value.montantEngage),
    helper: `Mandats payés : ${stats.value.mandatsPayes}`,
    icon: 'receipt_long',
    color: 'teal',
  },
  {
    label: 'Budget disponible',
    value: formatMontant(stats.value.montantDisponible),
    helper: `${Math.max(0, 100 - stats.value.tauxExecution)} % restant`,
    icon: 'savings',
    color: 'positive',
  },
  {
    label: "Taux d'exécution",
    value: `${stats.value.tauxExecution} %`,
    helper: `${stats.value.totalBordereaux} bordereau${stats.value.totalBordereaux > 1 ? 'x' : ''}`,
    icon: 'monitoring',
    color: 'primary',
  },
]);

const secondaryStats = computed(() => [
  {
    label: 'Mandats payés',
    value: stats.value.nombreMandats,
    helper: `Exercice ${selectedExercice.value}`,
    icon: 'task_alt',
    color: 'primary',
  },
  {
    label: 'Bordereaux',
    value: stats.value.totalBordereaux,
    helper: `${stats.value.bordereauxOuverts} ouverts`,
    icon: 'folder_open',
    color: 'secondary',
  },
  {
    label: 'Bordereaux fermés',
    value: stats.value.bordereauxFermes,
    helper: 'Validés et transmis',
    icon: 'lock',
    color: 'dark',
  },
  {
    label: 'Mandats / bordereau',
    value: stats.value.nombreMandatsBordereaux,
    helper: 'Répartition dans les bordereaux',
    icon: 'assignment',
    color: 'warning',
  },
]);

// Détails par chapitre''')
text = text.replace('<div class="row q-col-gutter-md">', '<div class="row q-col-gutter-md analytics-grid">', 1)
text = text.replace('<ChartCard\n          title="Dépenses par Chapitre"', '<ChartCard\n          class="analytics-card analytics-chart-card"\n          title="Dépenses par Chapitre"')
text = text.replace('<ChartCard\n          title="Exécution Budgétaire"', '<ChartCard\n          class="analytics-card analytics-chart-card"\n          title="Exécution Budgétaire"')
text = text.replace('<ChartCard\n          title="Évolution Mensuelle des Mandats"', '<ChartCard\n          class="analytics-card analytics-chart-card"\n          title="Évolution Mensuelle des Mandats"')
text = text.replace('<q-card class="details-card">', '<q-card class="analytics-card details-card">')
text = text.replace('<q-card class="activity-card">', '<q-card class="analytics-card activity-card">')
text = text.replace('<q-card class="alerts-card">', '<q-card class="analytics-card alerts-card">')
text = text.replace(
'''      <div v-if="!loading && stats.budgetTotal === 0" class="col-12 text-center q-pa-xl">
        <q-icon name="bar_chart" size="64px" color="grey-5" />
        <div class="text-h6 text-grey-6 q-mt-md">Aucune donnée disponible</div>
        <div class="text-caption text-grey-5">
          Créez des prévisions budgétaires pour l'exercice {{ selectedExercice }}
        </div>
      </div>''',
'''      <div v-if="!loading && stats.budgetTotal === 0" class="col-12">
        <q-card class="analytics-empty-state">
          <q-card-section class="text-center q-pa-xl">
            <q-icon name="bar_chart" size="64px" color="grey-5" />
            <div class="text-h6 text-grey-6 q-mt-md">Aucune donnée disponible</div>
            <div class="text-caption text-grey-5">
              Créez des prévisions budgétaires pour l'exercice {{ selectedExercice }}
            </div>
          </q-card-section>
        </q-card>
      </div>''')
text = re.sub(r'<style scoped lang="scss">.*?</style>\s*$', new_style_common, text, flags=re.S)
app3.write_text(text, encoding='utf-8')

# app6
app6 = base / 'app6' / 'StatistiquesPage.vue'
text = app6.read_text(encoding='utf-8')
text = text.replace(
'''    <PageHeader
      title="Statistiques des Recettes"
      subtitle="Analyse et suivi des déclarations de recettes"
      icon="analytics"
    />''',
'''    <PageHeader
      title="Statistiques des Recettes"
      subtitle="Analyse et suivi des déclarations de recettes"
      icon="analytics"
    >
      <template #stats>
        <div
          v-for="(stat, index) in heroStats"
          :key="`hero-${index}`"
          class="col-12 col-sm-6 col-lg-3"
        >
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
text = old_stats_block.sub('''

    <div class="row q-col-gutter-md q-mb-md">
      <div
        v-for="(stat, index) in secondaryStats"
        :key="`secondary-${index}`"
        class="col-12 col-sm-6 col-lg-3"
      >
        <q-card flat class="listing-stat-card overview-stat-card secondary-stat-card">
          <q-card-section class="row items-center no-wrap">
            <div class="col">
              <div class="overview-stat-label">{{ stat.label }}</div>
              <div class="overview-stat-value">{{ stat.value }}</div>
              <div v-if="stat.helper" class="overview-stat-helper">{{ stat.helper }}</div>
            </div>
            <q-icon :name="stat.icon" size="28px" :color="stat.color" />
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Graphiques et analyses -->''', text, count=1)
text = text.replace("import StatisticsCard from 'src/components/StatisticsCard.vue';\n", '')
text = text.replace(
'''});

// Top taxes''',
''' });

const heroStats = computed(() => [
  {
    label: 'Déclarations',
    value: stats.value.totalDeclarations,
    helper: `${stats.value.declarationsValidees} validées`,
    icon: 'dataset',
    color: 'primary',
  },
  {
    label: 'Montant encaissé',
    value: formatMontant(stats.value.montantTotal),
    helper: `${formatMontant(stats.value.montantMandatsRecette)} via mandats`,
    icon: 'payments',
    color: 'secondary',
  },
  {
    label: 'Bordereaux',
    value: stats.value.totalBordereaux,
    helper: `${stats.value.bordereauxFermes} fermés`,
    icon: 'receipt_long',
    color: 'teal',
  },
  {
    label: 'Mandats recette',
    value: stats.value.totalMandatsRecette,
    helper: formatMontant(stats.value.montantMandatsRecette),
    icon: 'monitoring',
    color: 'positive',
  },
]);

const secondaryStats = computed(() => [
  {
    label: 'Déclarations validées',
    value: stats.value.declarationsValidees,
    helper: 'Sur la période filtrée',
    icon: 'description',
    color: 'primary',
  },
  {
    label: 'Total bordereaux',
    value: stats.value.totalBordereaux,
    helper: `${stats.value.bordereauxOuverts} ouverts`,
    icon: 'folder_open',
    color: 'secondary',
  },
  {
    label: 'Montant bordereaux',
    value: formatMontant(stats.value.montantTotalBordereaux),
    helper: 'Total cumulé',
    icon: 'account_balance_wallet',
    color: 'teal',
  },
  {
    label: 'Décl. / bordereau',
    value: stats.value.nombreDeclBordereaux,
    helper: 'Déclarations dans les bordereaux',
    icon: 'list_alt',
    color: 'warning',
  },
]);

// Top taxes''')
text = text.replace('<div class="row q-col-gutter-md">', '<div class="row q-col-gutter-md analytics-grid">', 1)
text = text.replace('<ChartCard\n          title="Top 5 Taxes par Montant"', '<ChartCard\n          class="analytics-card analytics-chart-card"\n          title="Top 5 Taxes par Montant"')
text = text.replace('<ChartCard\n          title="Évolution Mensuelle des Recettes"', '<ChartCard\n          class="analytics-card analytics-chart-card"\n          title="Évolution Mensuelle des Recettes"')
text = text.replace('<q-card class="details-card">', '<q-card class="analytics-card details-card">')
text = text.replace('<q-card class="activity-card">', '<q-card class="analytics-card activity-card">')
text = text.replace('<q-card class="top-card">', '<q-card class="analytics-card top-card">')
text = text.replace(
'''      <div v-if="!loading && stats.totalDeclarations === 0" class="col-12 text-center q-pa-xl">
        <q-icon name="bar_chart" size="64px" color="grey-5" />
        <div class="text-h6 text-grey-6 q-mt-md">Aucune donnée disponible</div>
        <div class="text-caption text-grey-5">
          Créez des déclarations de recettes pour voir les statistiques
        </div>
      </div>''',
'''      <div v-if="!loading && stats.totalDeclarations === 0" class="col-12">
        <q-card class="analytics-empty-state">
          <q-card-section class="text-center q-pa-xl">
            <q-icon name="bar_chart" size="64px" color="grey-5" />
            <div class="text-h6 text-grey-6 q-mt-md">Aucune donnée disponible</div>
            <div class="text-caption text-grey-5">
              Créez des déclarations de recettes pour voir les statistiques
            </div>
          </q-card-section>
        </q-card>
      </div>''')
text = re.sub(r'<style scoped lang="scss">.*?</style>\s*$', new_style_common, text, flags=re.S)
app6.write_text(text, encoding='utf-8')

# app7
app7 = base / 'app7' / 'StatistiquesPage.vue'
text = app7.read_text(encoding='utf-8')
text = text.replace(
'''    <PageHeader
      title="Statistiques du Personnel"
      subtitle="Analyse des données RH"
      icon="bar_chart"
    />''',
'''    <PageHeader
      title="Statistiques du Personnel"
      subtitle="Analyse des données RH"
      icon="bar_chart"
    >
      <template #stats>
        <div
          v-for="(stat, index) in statsCards"
          :key="index"
          class="col-12 col-sm-6 col-lg-3"
        >
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
text = re.sub(
    r'\n\s*<q-card flat bordered class="listing-filter-card q-mb-md">.*?<!-- Cartes récapitulatives -->.*?</div>\n\n    <div class="row q-col-gutter-md">',
    '''

    <div class="compact-toolbar q-mb-md">
      <div class="compact-toolbar-top row items-center q-col-gutter-sm">
        <div class="col-12 col-md-3">
          <q-input v-model.number="filterAnnee" label="Année" outlined dense type="number" />
        </div>
        <div class="col-12 col-md-auto compact-toolbar-summary">
          <q-chip outline color="primary" icon="filter_alt" size="sm">
            Exercice {{ filterAnnee }}
          </q-chip>
        </div>
      </div>
    </div>

    <div class="row q-col-gutter-md analytics-grid">''',
    text,
    count=1,
    flags=re.S,
)
text = text.replace('const statsCards = computed(() => [', 'const statsCards = computed(() => {\n  const missionsValidees = stats.value.missionsParStatut.find((mission) => mission.statut === \'valide\')?.count || 0;\n\n  return [')
text = text.replace(
'''  {
    label: 'Agents actifs',
    value: stats.value.totalActifs,
    color: 'primary',
    icon: 'people',
    progress: 1,
  },''',
'''  {
    label: 'Agents actifs',
    value: stats.value.totalActifs,
    helper: `Inactifs : ${stats.value.totalInactifs}`,
    color: 'primary',
    icon: 'people',
  },''')
text = text.replace(
'''  {
    label: 'Agents inactifs',
    value: stats.value.totalInactifs,
    color: 'grey',
    icon: 'person_off',
    progress: 0.5,
  },
  {
    label: 'Masse salariale',
    value: formatMontant(stats.value.masseSalarialeBrute),
    color: 'teal',
    icon: 'payments',
    progress: 0.9,
  },
  {
    label: 'Missions',
    value: stats.value.totalMissions,
    color: 'indigo',
    icon: 'flight_takeoff',
    progress: 0.8,
  },
]);''',
'''  {
    label: 'Masse salariale',
    value: formatMontant(stats.value.masseSalarialeBrute),
    helper: `Paies ${filterAnnee.value}`,
    color: 'teal',
    icon: 'payments',
  },
  {
    label: 'Missions',
    value: stats.value.totalMissions,
    helper: `Validées : ${missionsValidees}`,
    color: 'indigo',
    icon: 'flight_takeoff',
  },
  {
    label: 'Services couverts',
    value: stats.value.parService.length,
    helper: `${stats.value.congesParType.length} type(s) de congés`,
    color: 'secondary',
    icon: 'corporate_fare',
  },
];\n});''')
text = text.replace('<q-card class="main-card">', '<q-card class="analytics-card main-card">')
text = re.sub(r'<style scoped lang="scss">.*?</style>\s*$', new_style_common, text, flags=re.S)
app7.write_text(text, encoding='utf-8')

print('patched statistiques pages')
