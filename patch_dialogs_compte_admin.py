from pathlib import Path
import re

root = Path(r'C:\Users\Coumbassa Stephane\Documents\GitHub\declarapp\frontend\src')

# ---- app.scss dialogs polish ----
scss = root / 'css' / 'app.scss'
text = scss.read_text(encoding='utf-8')
old = '''.q-dialog__backdrop {
  backdrop-filter: blur(8px);
}

.q-dialog .q-card {
  animation: scaleIn 0.24s var(--transition-smooth);
}

.q-dialog .q-card-section {
  padding-left: 24px;
  padding-right: 24px;
}
'''
new = '''.q-dialog__backdrop {
  backdrop-filter: blur(10px);
  background: rgba(15, 23, 42, 0.28);
}

.q-dialog .q-card {
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 24px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.99), rgba(248, 250, 252, 0.96));
  box-shadow: 0 26px 56px rgba(15, 23, 42, 0.16);
  animation: scaleIn 0.24s var(--transition-smooth);
  overflow: hidden;
}

.q-dialog .q-card-section {
  padding-left: 24px;
  padding-right: 24px;
}

.q-dialog .q-card-actions {
  padding: 0 24px 24px;
}

.q-dialog .q-card > .q-card-section:first-child:not(.bg-warning):not(.bg-negative):not(.bg-positive) {
  background: linear-gradient(135deg, rgba(27, 94, 59, 0.08), rgba(197, 168, 77, 0.12));
}
'''
text = text.replace(old, new)
text = text.replace(
'''  .q-card,
  .listing-filter-card,
  .filter-card,
  .listing-filter-row,
  .listing-toolbar,
  .data-table-shell,
  .page-header-card {
    background: linear-gradient(180deg, rgba(17, 24, 39, 0.92), rgba(15, 23, 42, 0.96));
    border-color: rgba(255, 255, 255, 0.1);
    color: #e5e7eb;
  }''',
'''  .q-card,
  .listing-filter-card,
  .filter-card,
  .listing-filter-row,
  .listing-toolbar,
  .data-table-shell,
  .page-header-card,
  .q-dialog .q-card {
    background: linear-gradient(180deg, rgba(17, 24, 39, 0.92), rgba(15, 23, 42, 0.96));
    border-color: rgba(255, 255, 255, 0.1);
    color: #e5e7eb;
  }''')
scss.write_text(text, encoding='utf-8')

# ---- CompteAdminPage ----
page = root / 'pages' / 'compte-admin' / 'CompteAdminPage.vue'
text = page.read_text(encoding='utf-8')
text = text.replace('<q-page padding>', '<q-page class="compte-admin-page q-pa-md">', 1)
text = text.replace(
'''    <PageHeader
      title="Compte Administratif"
      subtitle="Synthèse annuelle de l'exécution budgétaire"
      icon="assignment"
    >
      <template #actions>
        <div class="row items-center q-gutter-sm">
          <q-select
            v-model="data.exercice.value"
            :options="exerciceOptions"
            label="Exercice"
            dense
            outlined
            style="min-width: 120px"
            emit-value
            map-options
          />
          <q-btn
            color="teal"
            icon="print"
            label="Imprimer"
            @click="printCurrentTab"
            :loading="data.loading.value"
          />
        </div>
      </template>
    </PageHeader>

    <!-- Stats cards -->
    <div class="row q-col-gutter-md q-mb-md">
      <div class="col-12 col-md-3" v-for="(stat, i) in statsCards" :key="stat.label">
        <q-card class="stat-card" :style="{ animationDelay: `${i * 0.1}s` }">
          <q-card-section>
            <div class="row items-center no-wrap">
              <q-icon :name="stat.icon" :color="stat.color" size="32px" class="q-mr-md" />
              <div>
                <div class="text-caption text-grey-7">{{ stat.label }}</div>
                <div class="text-h6 text-weight-bold">{{ formatMontant(stat.value) }}</div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Tabs -->
    <q-card>''',
'''    <PageHeader
      title="Compte Administratif"
      subtitle="Synthèse annuelle de l'exécution budgétaire"
      icon="assignment"
    >
      <template #actions>
        <div class="row items-center q-gutter-sm compte-admin-actions">
          <q-select
            v-model="data.exercice.value"
            :options="exerciceOptions"
            label="Exercice"
            dense
            outlined
            style="min-width: 120px"
            emit-value
            map-options
          />
          <q-btn
            color="teal"
            icon="print"
            label="Imprimer"
            @click="printCurrentTab"
            :loading="data.loading.value"
          />
        </div>
      </template>
      <template #stats>
        <div v-for="(stat, i) in statsCards" :key="stat.label" class="col-12 col-sm-6 col-lg-3">
          <q-card flat class="listing-stat-card overview-stat-card" :style="{ animationDelay: `${i * 0.1}s` }">
            <q-card-section class="row items-center no-wrap">
              <div class="col">
                <div class="overview-stat-label">{{ stat.label }}</div>
                <div class="overview-stat-value">{{ formatMontant(stat.value) }}</div>
                <div v-if="stat.helper" class="overview-stat-helper">{{ stat.helper }}</div>
              </div>
              <q-icon :name="stat.icon" :color="stat.color" size="30px" />
            </q-card-section>
          </q-card>
        </div>
      </template>
    </PageHeader>

    <!-- Tabs -->
    <q-card class="main-card">''')
text = text.replace(
'''const statsCards = computed(() => [
  {
    label: 'Recettes Fonct.',
    value: data.totalRecettesFonct.value,
    icon: 'trending_up',
    color: 'positive',
  },
  {
    label: 'Dépenses Fonct.',
    value: data.totalDepensesFonct.value,
    icon: 'trending_down',
    color: 'negative',
  },
  {
    label: 'Résultat Fonct.',
    value: data.resultatFonctionnement.value,
    icon: 'account_balance',
    color: data.resultatFonctionnement.value >= 0 ? 'positive' : 'negative',
  },
  {
    label: 'Résultat Global',
    value: data.resultatGlobal.value,
    icon: 'summarize',
    color: data.resultatGlobal.value >= 0 ? 'teal' : 'negative',
  },
]);''',
'''const statsCards = computed(() => [
  {
    label: 'Recettes fonct.',
    value: data.totalRecettesFonct.value,
    helper: 'Recettes de fonctionnement',
    icon: 'trending_up',
    color: 'positive',
  },
  {
    label: 'Dépenses fonct.',
    value: data.totalDepensesFonct.value,
    helper: 'Dépenses de fonctionnement',
    icon: 'trending_down',
    color: 'negative',
  },
  {
    label: 'Résultat fonct.',
    value: data.resultatFonctionnement.value,
    helper: data.resultatFonctionnement.value >= 0 ? 'Excédent' : 'Déficit',
    icon: 'account_balance',
    color: data.resultatFonctionnement.value >= 0 ? 'positive' : 'negative',
  },
  {
    label: 'Résultat global',
    value: data.resultatGlobal.value,
    helper: `Exercice ${data.exercice.value}`,
    icon: 'summarize',
    color: data.resultatGlobal.value >= 0 ? 'teal' : 'negative',
  },
]);''')
text = re.sub(r'<style scoped lang="scss">.*?</style>\s*$', '''<style scoped lang="scss">
.compte-admin-page {
  max-width: 1400px;
  margin: 0 auto;
}

.compte-admin-actions {
  align-items: center;
}

.main-card {
  border-radius: 24px;
  border: 1px solid rgba(148, 163, 184, 0.18);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.94));
  box-shadow: 0 18px 34px rgba(15, 23, 42, 0.08);
  overflow: hidden;
}

.overview-stat-card {
  min-height: 112px;
  animation: slideUp 0.5s ease-out both;
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

.main-card :deep(.q-tabs) {
  padding: 8px 12px 0;
}

.main-card :deep(.q-tab) {
  border-radius: 12px 12px 0 0;
}

.main-card :deep(.q-tab-panels) {
  background: transparent;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
''', text, flags=re.S)
page.write_text(text, encoding='utf-8')

print('patched dialogs and compte admin')
