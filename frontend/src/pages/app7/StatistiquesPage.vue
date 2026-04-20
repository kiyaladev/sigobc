<template>
  <q-page class="dashboard-page q-pa-md">
    <PageHeader
      title="Statistiques du Personnel"
      subtitle="Analyse des données RH"
      icon="bar_chart"
    >
      <template #stats>
        <div v-for="(stat, index) in statsCards" :key="index" class="col-12 col-sm-6 col-lg-3">
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

    <div class="row q-col-gutter-md analytics-grid">
      <!-- Effectif par service -->
      <div class="col-12 col-md-6">
        <q-card class="analytics-card main-card">
          <q-card-section>
            <div class="text-h6 q-mb-md">
              <q-icon name="corporate_fare" class="q-mr-sm" color="primary" />
              Effectif par service
            </div>
            <q-list separator dense>
              <q-item v-for="s in stats.parService" :key="s.service">
                <q-item-section>
                  <q-item-label>{{ s.service }}</q-item-label>
                  <q-linear-progress :value="s.pct" color="primary" class="q-mt-xs" />
                </q-item-section>
                <q-item-section side>
                  <div class="text-weight-bold">{{ s.count }}</div>
                </q-item-section>
              </q-item>
              <q-item v-if="!stats.parService.length">
                <q-item-section class="text-grey text-center">Aucun agent</q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
      </div>

      <!-- Masse salariale mensuelle -->
      <div class="col-12 col-md-6">
        <q-card class="analytics-card main-card">
          <q-card-section>
            <div class="text-h6 q-mb-md">
              <q-icon name="payments" class="q-mr-sm" color="teal" />
              Masse salariale {{ filterAnnee }} (net)
            </div>
            <q-list separator dense>
              <q-item v-for="m in stats.masseSalarialeParMois" :key="m.mois">
                <q-item-section>
                  <q-item-label>{{ m.label }}</q-item-label>
                  <q-linear-progress :value="m.pct" color="teal" class="q-mt-xs" />
                </q-item-section>
                <q-item-section side>
                  <div class="text-weight-bold text-teal">{{ formatMontant(m.total) }}</div>
                </q-item-section>
              </q-item>
              <q-item v-if="!stats.masseSalarialeParMois.length">
                <q-item-section class="text-grey text-center">Aucune donnée de paie</q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
      </div>

      <!-- Congés par type -->
      <div class="col-12 col-md-6">
        <q-card class="analytics-card main-card">
          <q-card-section>
            <div class="text-h6 q-mb-md">
              <q-icon name="beach_access" class="q-mr-sm" color="orange" />
              Congés par type ({{ filterAnnee }})
            </div>
            <q-list separator dense>
              <q-item v-for="c in stats.congesParType" :key="c.type">
                <q-item-section>
                  <q-item-label>{{ c.label }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <div class="row q-gutter-x-sm items-center">
                    <q-chip color="orange" text-color="white" size="sm"
                      >{{ c.count }} demandes</q-chip
                    >
                    <span class="text-caption text-grey">{{ c.jours }} jours</span>
                  </div>
                </q-item-section>
              </q-item>
              <q-item v-if="!stats.congesParType.length">
                <q-item-section class="text-grey text-center">Aucun congé</q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
      </div>

      <!-- Missions -->
      <div class="col-12 col-md-6">
        <q-card class="analytics-card main-card">
          <q-card-section>
            <div class="text-h6 q-mb-md">
              <q-icon name="flight_takeoff" class="q-mr-sm" color="indigo" />
              Missions par statut ({{ filterAnnee }})
            </div>
            <q-list separator dense>
              <q-item v-for="m in stats.missionsParStatut" :key="m.statut">
                <q-item-section>
                  <q-item-label>{{ m.label }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <div class="row q-gutter-x-sm items-center">
                    <q-chip :color="m.color" text-color="white" size="sm">{{ m.count }}</q-chip>
                    <span class="text-caption text-grey">{{ formatMontant(m.montant) }}</span>
                  </div>
                </q-item-section>
              </q-item>
              <q-item v-if="!stats.missionsParStatut.length">
                <q-item-section class="text-grey text-center">Aucune mission</q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { db } from 'src/database/db';
import PageHeader from 'src/components/PageHeader.vue';

const filterAnnee = ref(new Date().getFullYear());

const moisNoms = [
  'Janvier',
  'Février',
  'Mars',
  'Avril',
  'Mai',
  'Juin',
  'Juillet',
  'Août',
  'Septembre',
  'Octobre',
  'Novembre',
  'Décembre',
];

const typeCongeLabels: Record<string, string> = {
  annuel: 'Annuel',
  maladie: 'Maladie',
  maternite: 'Maternité',
  circonstance: 'Circonstance',
  autre: 'Autre',
};

const stats = ref({
  totalActifs: 0,
  totalInactifs: 0,
  masseSalarialeBrute: 0,
  totalMissions: 0,
  parService: [] as { service: string; count: number; pct: number }[],
  masseSalarialeParMois: [] as { mois: number; label: string; total: number; pct: number }[],
  congesParType: [] as { type: string; label: string; count: number; jours: number }[],
  missionsParStatut: [] as {
    statut: string;
    label: string;
    color: string;
    count: number;
    montant: number;
  }[],
});

// Cartes de statistiques avec animations
const statsCards = computed(() => {
  const missionsValidees =
    stats.value.missionsParStatut.find((mission) => mission.statut === 'valide')?.count || 0;

  return [
    {
      label: 'Agents actifs',
      value: stats.value.totalActifs,
      helper: `Inactifs : ${stats.value.totalInactifs}`,
      color: 'primary',
      icon: 'people',
    },
    {
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
  ];
});

function formatMontant(v: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    minimumFractionDigits: 0,
  }).format(v);
}

async function loadStats() {
  const [employes, fiches, conges, missions] = await Promise.all([
    db.employes.toArray(),
    db.fichesPaie
      .filter((f) => f.annee === filterAnnee.value && f.statut !== 'brouillon')
      .toArray(),
    db.conges
      .filter((c) => {
        const d = new Date(c.dateDebut);
        return d.getFullYear() === filterAnnee.value;
      })
      .toArray(),
    db.ordresMission.filter((m) => m.exercice === filterAnnee.value).toArray(),
  ]);

  const actifs = employes.filter((e) => e.actif);
  const inactifs = employes.filter((e) => !e.actif);
  const masseBrute = actifs.reduce(
    (s, e) =>
      s +
      e.salaireBase +
      (e.indemniteLogement || 0) +
      (e.indemniteTransport || 0) +
      (e.autresIndemnites || 0),
    0,
  );

  // Par service
  const serviceMap = new Map<string, number>();
  actifs.forEach((e) => serviceMap.set(e.service, (serviceMap.get(e.service) || 0) + 1));
  const parService = Array.from(serviceMap.entries())
    .map(([service, count]) => ({ service, count, pct: count / (actifs.length || 1) }))
    .sort((a, b) => b.count - a.count);

  // Masse salariale mensuelle
  const moisMap = new Map<number, number>();
  fiches.forEach((f) => moisMap.set(f.mois, (moisMap.get(f.mois) || 0) + f.montantNet));
  const maxNet = Math.max(...Array.from(moisMap.values()), 1);
  const masseSalarialeParMois = Array.from(moisMap.entries())
    .map(([mois, total]) => ({ mois, label: moisNoms[mois - 1] || '', total, pct: total / maxNet }))
    .sort((a, b) => a.mois - b.mois);

  // Congés par type
  const congeTypeMap = new Map<string, { count: number; jours: number }>();
  conges.forEach((c) => {
    const cur = congeTypeMap.get(c.type) || { count: 0, jours: 0 };
    congeTypeMap.set(c.type, { count: cur.count + 1, jours: cur.jours + c.nombreJours });
  });
  const congesParType = Array.from(congeTypeMap.entries()).map(([type, v]) => ({
    type,
    label: typeCongeLabels[type] || type,
    ...v,
  }));

  // Missions par statut
  const statutColors: Record<string, string> = {
    brouillon: 'grey',
    valide: 'positive',
  };
  const statutLabels: Record<string, string> = {
    brouillon: 'Brouillon',
    valide: 'Validé',
  };
  const missionStatutMap = new Map<string, { count: number; montant: number }>();
  missions.forEach((m) => {
    const cur = missionStatutMap.get(m.statut) || { count: 0, montant: 0 };
    missionStatutMap.set(m.statut, { count: cur.count + 1, montant: cur.montant + m.montantTotal });
  });
  const missionsParStatut = Array.from(missionStatutMap.entries()).map(([statut, v]) => ({
    statut,
    label: statutLabels[statut] || statut,
    color: statutColors[statut] || 'grey',
    ...v,
  }));

  stats.value = {
    totalActifs: actifs.length,
    totalInactifs: inactifs.length,
    masseSalarialeBrute: masseBrute,
    totalMissions: missions.length,
    parService,
    masseSalarialeParMois,
    congesParType,
    missionsParStatut,
  };
}

watch(filterAnnee, () => {
  void loadStats();
});
onMounted(() => {
  void loadStats();
});
</script>

<style scoped lang="scss">
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
  transition:
    background-color 0.2s ease,
    transform 0.2s ease;
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
