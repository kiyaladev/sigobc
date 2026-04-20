from pathlib import Path
import re

root = Path(r'C:\Users\Coumbassa Stephane\Documents\GitHub\declarapp\frontend\src\pages')

# ---------- UtilisateursPage ----------
util = root / 'UtilisateursPage.vue'
text = util.read_text(encoding='utf-8')
text = text.replace('<q-page class="q-pa-md">', '<q-page class="utilisateurs-page q-pa-md">', 1)
text = text.replace(
'''    <PageHeader
      title="Gestion des Utilisateurs"
      subtitle="Administration des comptes utilisateurs"
      icon="manage_accounts"
    >
      <template #actions>
        <q-btn color="primary" icon="add" label="Nouvel Utilisateur" @click="openDialog()" />
      </template>
    </PageHeader>''',
'''    <PageHeader
      title="Gestion des Utilisateurs"
      subtitle="Administration des comptes utilisateurs"
      icon="manage_accounts"
    >
      <template #actions>
        <q-btn color="primary" icon="add" label="Nouvel Utilisateur" @click="openDialog()" />
      </template>
      <template #stats>
        <div v-for="(stat, index) in headerStats" :key="index" class="col-12 col-sm-6 col-lg-3">
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
'    <q-card flat bordered class="listing-filter-card q-mb-md">',
'    <q-card flat bordered class="listing-filter-card compact-toolbar q-mb-md">',
    1,
)
text = text.replace('    <q-card>\n', '    <q-card class="main-card">\n', 1)
text = text.replace('<q-card style="min-width: 700px">', '<q-card class="dialog-card" style="min-width: 700px">', 1)
text = text.replace(
'''const filteredUtilisateurs = computed(() => {
  let result = utilisateurs.value;

  if (filterRole.value) {
    result = result.filter((u) => u.role === filterRole.value);
  }

  if (filterActif.value) {
    const isActif = filterActif.value === 'Actif';
    result = result.filter((u) => u.actif === isActif);
  }

  if (search.value) {
    const searchLower = search.value.toLowerCase();
    result = result.filter(
      (u) =>
        u.username.toLowerCase().includes(searchLower) ||
        u.nom.toLowerCase().includes(searchLower) ||
        u.prenom.toLowerCase().includes(searchLower) ||
        u.email.toLowerCase().includes(searchLower),
    );
  }

  return result;
});''',
'''const filteredUtilisateurs = computed(() => {
  let result = utilisateurs.value;

  if (filterRole.value) {
    result = result.filter((u) => u.role === filterRole.value);
  }

  if (filterActif.value) {
    const isActif = filterActif.value === 'Actif';
    result = result.filter((u) => u.actif === isActif);
  }

  if (search.value) {
    const searchLower = search.value.toLowerCase();
    result = result.filter(
      (u) =>
        u.username.toLowerCase().includes(searchLower) ||
        u.nom.toLowerCase().includes(searchLower) ||
        u.prenom.toLowerCase().includes(searchLower) ||
        u.email.toLowerCase().includes(searchLower),
    );
  }

  return result;
});

const headerStats = computed(() => {
  const totalActifs = utilisateurs.value.filter((u) => u.actif).length;
  const totalAdmins = utilisateurs.value.filter((u) => u.role === 'admin').length;

  return [
    {
      label: 'Utilisateurs visibles',
      value: filteredUtilisateurs.value.length,
      helper: `Total : ${utilisateurs.value.length}`,
      icon: 'dataset',
      color: 'primary',
    },
    {
      label: 'Administrateurs',
      value: totalAdmins,
      helper: 'Accès complet à la plateforme',
      icon: 'admin_panel_settings',
      color: 'secondary',
    },
    {
      label: 'Comptes actifs',
      value: totalActifs,
      helper: `Inactifs : ${utilisateurs.value.length - totalActifs}`,
      icon: 'task_alt',
      color: 'teal',
    },
    {
      label: 'Mairies',
      value: mairies.value.length,
      helper: 'Référentiel disponible',
      icon: 'location_city',
      color: 'positive',
    },
  ];
});''')
text += '''
<style scoped lang="scss">
.utilisateurs-page {
  max-width: 1400px;
  margin: 0 auto;
}

.main-card {
  border-radius: 24px;
  box-shadow: 0 18px 34px rgba(15, 23, 42, 0.08);
  overflow: hidden;
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

.compact-toolbar {
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 18px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(248, 250, 252, 0.92));
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.05);
}

.compact-toolbar :deep(.q-card__section) {
  padding: 14px 16px;
}

.main-card :deep(.q-card__section.q-pb-none) {
  padding-bottom: 0;
}

.main-card :deep(.q-table) {
  border-radius: 18px;
  overflow: hidden;
}

.main-card :deep(.q-table thead tr) {
  background: linear-gradient(180deg, #f8fafc 0%, #eef4f8 100%);
}

.main-card :deep(.q-table tbody tr:nth-child(even)) {
  background: rgba(248, 250, 252, 0.72);
}

.main-card :deep(.q-table tbody tr:hover) {
  background: rgba(197, 168, 77, 0.08);
}

.dialog-card {
  border-radius: 24px;
}
</style>
'''
util.write_text(text, encoding='utf-8')

# ---------- StatistiquesGlobalesPage ----------
global_stats = root / 'StatistiquesGlobalesPage.vue'
text = global_stats.read_text(encoding='utf-8')
text = text.replace(
'''    <PageHeader
      title="Statistiques Globales"
      subtitle="Vue d'ensemble de l'exécution budgétaire"
      icon="analytics"
    />''',
'''    <PageHeader
      title="Statistiques Globales"
      subtitle="Vue d'ensemble de l'exécution budgétaire"
      icon="analytics"
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
text = text.replace('    <q-card flat bordered class="listing-filter-card q-mb-md">', '    <q-card flat bordered class="listing-filter-card compact-toolbar q-mb-md">', 1)
text = text.replace(
'''    <!-- Cartes de statistiques principales - Dépenses -->
    <div class="text-h6 text-grey-8 q-mb-sm">
      <q-icon name="trending_down" color="orange" class="q-mr-sm" />
      Dépenses
    </div>
    <div class="row q-col-gutter-md q-mb-lg">
      <div class="col-12 col-sm-6 col-md-3">
        <StatisticsCard
          :value="depensesStats.budgetTotal"
          title="Budget Prévu"
          subtitle="Prévisions budgétaires"
          icon="account_balance_wallet"
          icon-color="grey-7"
          border-color="#E67E22"
          format="currency"
        />
      </div>
      <div class="col-12 col-sm-6 col-md-3">
        <StatisticsCard
          :value="depensesStats.montantEngage"
          title="Montant Engagé"
          :subtitle="`${depensesStats.tauxExecution}% exécuté`"
          icon="receipt_long"
          icon-color="grey-7"
          border-color="#F39C12"
          format="currency"
        />
      </div>
      <div class="col-12 col-sm-6 col-md-3">
        <StatisticsCard
          :value="depensesStats.nombreMandats"
          title="Mandats"
          :subtitle="`${depensesStats.mandatsPayes} payés`"
          icon="receipt"
          icon-color="grey-7"
          border-color="#E74C3C"
        />
      </div>
      <div class="col-12 col-sm-6 col-md-3">
        <StatisticsCard
          :value="depensesStats.montantDisponible"
          title="Budget Disponible"
          :subtitle="`${100 - depensesStats.tauxExecution}% restant`"
          icon="savings"
          icon-color="grey-7"
          border-color="#2E7D32"
          format="currency"
        />
      </div>
    </div>

    <!-- Cartes de statistiques principales - Recettes -->
    <div class="text-h6 text-grey-8 q-mb-sm">
      <q-icon name="trending_up" color="green" class="q-mr-sm" />
      Recettes
    </div>
    <div class="row q-col-gutter-md q-mb-lg">
      <div class="col-12 col-sm-6 col-md-3">
        <StatisticsCard
          :value="recettesStats.totalDeclarations"
          title="Déclarations"
          :subtitle="`${recettesStats.declarationsValidees} validées`"
          icon="description"
          icon-color="grey-7"
          border-color="#2196F3"
        />
      </div>
      <div class="col-12 col-sm-6 col-md-3">
        <StatisticsCard
          :value="recettesStats.montantTotal"
          title="Montant Total"
          subtitle="Recettes encaissées"
          icon="payments"
          icon-color="grey-7"
          border-color="#4CAF50"
          format="currency"
        />
      </div>
      <div class="col-12 col-sm-6 col-md-3">
        <StatisticsCard
          :value="recettesStats.totalBordereaux"
          title="Bordereaux"
          :subtitle="`${recettesStats.bordereauxFermes} fermés`"
          icon="receipt_long"
          icon-color="grey-7"
          border-color="#9C27B0"
        />
      </div>
      <div class="col-12 col-sm-6 col-md-3">
        <StatisticsCard
          :value="recettesStats.tauxValidation"
          title="Taux Validation"
          subtitle="Déclarations validées"
          icon="check_circle"
          icon-color="grey-7"
          border-color="#00BCD4"
          format="percentage"
        />
      </div>
    </div>''',
'''    <div class="admin-section-heading q-mb-sm">
      <q-icon name="trending_down" color="orange" class="q-mr-sm" />
      Dépenses
    </div>
    <div class="row q-col-gutter-md q-mb-lg">
      <div v-for="(stat, index) in depensesCards" :key="`dep-${index}`" class="col-12 col-sm-6 col-md-3">
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

    <div class="admin-section-heading q-mb-sm">
      <q-icon name="trending_up" color="positive" class="q-mr-sm" />
      Recettes
    </div>
    <div class="row q-col-gutter-md q-mb-lg">
      <div v-for="(stat, index) in recettesCards" :key="`rec-${index}`" class="col-12 col-sm-6 col-md-3">
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
    </div>''')
text = text.replace('import StatisticsCard from \'src/components/StatisticsCard.vue\';\n', '')
text = text.replace(
'''const solde = computed(() => recettesStats.value.montantTotal - depensesStats.value.montantEngage);

// Fonctions utilitaires''',
'''const solde = computed(() => recettesStats.value.montantTotal - depensesStats.value.montantEngage);

const heroStats = computed(() => [
  {
    label: 'Dépenses prévues',
    value: formatMontant(depensesStats.value.budgetTotal),
    helper: `Engagé : ${formatMontant(depensesStats.value.montantEngage)}`,
    icon: 'payments',
    color: 'secondary',
  },
  {
    label: 'Recettes encaissées',
    value: formatMontant(recettesStats.value.montantTotal),
    helper: `${recettesStats.value.totalDeclarations} déclaration(s)`,
    icon: 'account_balance_wallet',
    color: 'teal',
  },
  {
    label: 'Solde',
    value: formatMontant(Math.abs(solde.value)),
    helper: solde.value >= 0 ? 'Excédent budgétaire' : 'Déficit budgétaire',
    icon: 'balance',
    color: solde.value >= 0 ? 'positive' : 'negative',
  },
  {
    label: 'Exercice',
    value: selectedExercice.value,
    helper: `${depensesStats.value.nombreMandats} mandats • ${recettesStats.value.totalBordereaux} bordereaux`,
    icon: 'event',
    color: 'primary',
  },
]);

const depensesCards = computed(() => [
  {
    label: 'Budget prévu',
    value: formatMontant(depensesStats.value.budgetTotal),
    helper: 'Prévisions budgétaires',
    icon: 'account_balance_wallet',
    color: 'secondary',
  },
  {
    label: 'Montant engagé',
    value: formatMontant(depensesStats.value.montantEngage),
    helper: `${depensesStats.value.tauxExecution}% exécuté`,
    icon: 'receipt_long',
    color: 'teal',
  },
  {
    label: 'Mandats',
    value: depensesStats.value.nombreMandats,
    helper: `${depensesStats.value.mandatsPayes} payés`,
    icon: 'receipt',
    color: 'warning',
  },
  {
    label: 'Budget disponible',
    value: formatMontant(depensesStats.value.montantDisponible),
    helper: `${100 - depensesStats.value.tauxExecution}% restant`,
    icon: 'savings',
    color: 'positive',
  },
]);

const recettesCards = computed(() => [
  {
    label: 'Déclarations',
    value: recettesStats.value.totalDeclarations,
    helper: `${recettesStats.value.declarationsValidees} validées`,
    icon: 'description',
    color: 'primary',
  },
  {
    label: 'Montant total',
    value: formatMontant(recettesStats.value.montantTotal),
    helper: 'Recettes encaissées',
    icon: 'payments',
    color: 'teal',
  },
  {
    label: 'Bordereaux',
    value: recettesStats.value.totalBordereaux,
    helper: `${recettesStats.value.bordereauxFermes} fermés`,
    icon: 'receipt_long',
    color: 'purple',
  },
  {
    label: 'Taux validation',
    value: `${recettesStats.value.tauxValidation}%`,
    helper: 'Déclarations validées',
    icon: 'check_circle',
    color: 'positive',
  },
]);

// Fonctions utilitaires''')
text = text.replace('<div class="row q-col-gutter-md">', '<div class="row q-col-gutter-md analytics-grid">', 1)
text = text.replace('<ChartCard\n          title="Dépenses vs Recettes"', '<ChartCard\n          class="analytics-card analytics-chart-card"\n          title="Dépenses vs Recettes"')
text = text.replace('<ChartCard\n          title="Statut des Mandats"', '<ChartCard\n          class="analytics-card analytics-chart-card"\n          title="Statut des Mandats"')
text = text.replace('<ChartCard\n          title="Évolution Mensuelle (Dépenses vs Recettes)"', '<ChartCard\n          class="analytics-card analytics-chart-card"\n          title="Évolution Mensuelle (Dépenses vs Recettes)"')
text = text.replace('<q-card class="summary-card">', '<q-card class="analytics-card summary-card">')
text = text.replace('<q-card class="links-card">', '<q-card class="analytics-card links-card">')
text = text.replace(
'''      <div
        v-if="!loading && depensesStats.budgetTotal === 0 && recettesStats.totalDeclarations === 0"
        class="col-12 text-center q-pa-xl"
      >
        <q-icon name="bar_chart" size="64px" color="grey-5" />
        <div class="text-h6 text-grey-6 q-mt-md">Aucune donnée disponible</div>
        <div class="text-caption text-grey-5">
          Créez des prévisions ou des déclarations pour voir les statistiques
        </div>
      </div>''',
'''      <div
        v-if="!loading && depensesStats.budgetTotal === 0 && recettesStats.totalDeclarations === 0"
        class="col-12"
      >
        <q-card class="analytics-empty-state">
          <q-card-section class="text-center q-pa-xl">
            <q-icon name="bar_chart" size="64px" color="grey-5" />
            <div class="text-h6 text-grey-6 q-mt-md">Aucune donnée disponible</div>
            <div class="text-caption text-grey-5">
              Créez des prévisions ou des déclarations pour voir les statistiques
            </div>
          </q-card-section>
        </q-card>
      </div>''')
text = re.sub(r'<style scoped lang="scss">.*?</style>\s*$', '''<style scoped lang="scss">
.statistiques-page {
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

.compact-toolbar {
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 18px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(248, 250, 252, 0.92));
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.05);
}

.admin-section-heading {
  display: flex;
  align-items: center;
  color: #0f172a;
  font-size: 1.2rem;
  font-weight: 800;
}

.analytics-card,
.analytics-empty-state {
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 24px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.94));
  box-shadow: 0 18px 34px rgba(15, 23, 42, 0.08);
  overflow: hidden;
}

.analytics-card :deep(.q-card__section.bg-grey-1) {
  background: linear-gradient(180deg, rgba(248, 250, 252, 0.94), rgba(241, 245, 249, 0.86));
  border-bottom: 1px solid rgba(148, 163, 184, 0.16);
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

.chart-container {
  position: relative;
  height: 300px;
}

.chart-container-large {
  position: relative;
  height: 400px;
}
</style>
''', text, flags=re.S)
global_stats.write_text(text, encoding='utf-8')

# ---------- AdminSeedersPage ----------
seeders = root / 'admin' / 'AdminSeedersPage.vue'
text = seeders.read_text(encoding='utf-8')
text = text.replace('<q-page class="q-pa-md">', '<q-page class="admin-seeders-page q-pa-md">', 1)
text = text.replace(
'<div v-if="!isUnlocked" class="flex flex-center" style="min-height: 60vh">',
'<div v-if="!isUnlocked" class="admin-password-shell">',
1,
)
text = text.replace('<q-card style="max-width: 420px; width: 100%" class="q-pa-lg">', '<q-card class="admin-password-card q-pa-lg">', 1)
text = text.replace('<q-banner class="bg-warning text-white q-mb-md" rounded>', '<q-banner class="admin-warning-banner q-mb-md" rounded>', 1)
text = text.replace('<q-card>\n            <q-card-section>\n              <div class="text-h6">🚀 Actions Rapides</div>', '<q-card class="admin-card">\n            <q-card-section>\n              <div class="text-h6">🚀 Actions Rapides</div>', 1)
text = text.replace('<q-card>\n            <q-card-section>\n              <div class="text-h6">🧪 Générer des Données de Test</div>', '<q-card class="admin-card">\n            <q-card-section>\n              <div class="text-h6">🧪 Générer des Données de Test</div>', 1)
text = text.replace('<q-card>\n            <q-card-section>\n              <div class="text-h6">📊 Données Actuelles</div>', '<q-card class="admin-card">\n            <q-card-section>\n              <div class="text-h6">📊 Données Actuelles</div>', 1)
text = text.replace('<q-card>\n            <q-card-section>\n              <div class="text-h6">📝 Logs d\'exécution</div>', '<q-card class="admin-card">\n            <q-card-section>\n              <div class="text-h6">📝 Logs d\'exécution</div>', 1)
text = text.replace('<q-card flat bordered>', '<q-card flat class="listing-stat-card admin-mini-stat">')
text = re.sub(r'</script>\s*$', '''</script>

<style scoped lang="scss">
.admin-seeders-page {
  max-width: 1400px;
  margin: 0 auto;
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
seeders.write_text(text, encoding='utf-8')

# ---------- BackupPage ----------
backup = root / 'admin' / 'BackupPage.vue'
text = backup.read_text(encoding='utf-8')
text = text.replace('<q-page class="q-pa-md">', '<q-page class="backup-page q-pa-md">', 1)
text = text.replace('<div v-if="!isUnlocked" class="flex flex-center" style="min-height: 60vh">', '<div v-if="!isUnlocked" class="admin-password-shell">', 1)
text = text.replace('<q-card style="max-width: 420px; width: 100%" class="q-pa-lg">', '<q-card class="admin-password-card q-pa-lg">', 1)
for old in ['<q-card>\n            <q-card-section class="accent-left">', '<q-card>\n            <q-card-section>', '<q-card>\n            <q-card-section>\n              <div class="text-h6">📋 Dernières opérations</div>']:
    text = text.replace(old, old.replace('<q-card>', '<q-card class="admin-card">'))
text = text.replace('<q-banner class="bg-warning text-white q-mb-md" rounded>', '<q-banner class="admin-warning-banner q-mb-md" rounded>', 1)
text = text.replace('<q-card flat bordered>', '<q-card flat class="listing-stat-card admin-module-card">')
text = re.sub(r'<style scoped lang="scss">.*?</style>\s*$', '''<style scoped lang="scss">
.backup-page {
  max-width: 1400px;
  margin: 0 auto;
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
backup.write_text(text, encoding='utf-8')

# ---------- ParametragePage ----------
param = root / 'admin' / 'ParametragePage.vue'
text = param.read_text(encoding='utf-8')
text = text.replace('<div v-if="!isUnlocked" class="flex flex-center" style="min-height: 60vh">', '<div v-if="!isUnlocked" class="admin-password-shell">', 1)
text = text.replace('<q-card style="max-width: 420px; width: 100%" class="q-pa-lg">', '<q-card class="admin-password-card q-pa-lg">', 1)
text = re.sub(r'<style scoped lang="scss">.*?</style>\s*$', '''<style scoped lang="scss">
.parametrage-page {
  max-width: 1400px;
  margin: 0 auto;
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
param.write_text(text, encoding='utf-8')

print('patched admin pages')
