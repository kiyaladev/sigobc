<template>
  <q-page class="dashboard-page q-pa-md">
    <PageHeader
      title="Statistiques du Personnel"
      subtitle="Analyse des données RH"
      icon="bar_chart"
    />

    <div class="row q-col-gutter-sm q-mb-md">
      <div class="col-12 col-md-2">
        <q-input v-model.number="filterAnnee" label="Année" outlined dense type="number" />
      </div>
    </div>

    <!-- Cartes récapitulatives -->
    <div class="row q-col-gutter-md q-mb-md">
      <!-- Cartes de statistiques -->
      <div class="col-12 col-sm-6 col-md-3" v-for="(stat, index) in statsCards" :key="index">
        <q-card
          class="stat-card hover-lift"
          :class="`stat-card-${index}`"
          :style="{
            animationDelay: `${index * 0.1}s`,
            borderLeft: `4px solid var(--q-${stat.color})`,
          }"
        >
          <q-card-section class="stat-card-content">
            <div class="row items-center no-wrap">
              <div class="col">
                <div class="stat-value text-grey-8">{{ stat.value }}</div>
                <div class="stat-label text-grey-6">{{ stat.label }}</div>
              </div>
              <div class="col-auto">
                <div class="stat-icon-wrapper" :class="`bg-${stat.color}-1`">
                  <q-icon :name="stat.icon" class="stat-icon" :color="stat.color" />
                </div>
              </div>
            </div>

            <!-- Indicateur de progression -->
            <q-linear-progress
              :value="stat.progress || 1"
              :color="stat.color"
              class="stat-progress q-mt-md"
              :class="{ 'pulse-animation': stat.progress < 1 }"
            />
          </q-card-section>
        </q-card>
      </div>
    </div>

    <div class="row q-col-gutter-md">
      <!-- Effectif par service -->
      <div class="col-12 col-md-6">
        <q-card class="main-card">
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
        <q-card class="main-card">
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
        <q-card class="main-card">
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
        <q-card class="main-card">
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
const statsCards = computed(() => [
  {
    label: 'Agents actifs',
    value: stats.value.totalActifs,
    color: 'primary',
    icon: 'people',
    progress: 1,
  },
  {
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
]);

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
    db.fichesPaie.filter((f) => f.annee === filterAnnee.value).toArray(),
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
// Page principale
.dashboard-page {
  max-width: 1400px;
  margin: 0 auto;
}

.main-card {
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  animation: fadeIn 0.6s ease-out both;
  animation-delay: 0.4s;
}

// Cartes de statistiques
.stat-card {
  height: 100%;
  border-radius: 16px;
  overflow: hidden;
  animation: slideInUp 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) both;

  &:hover {
    .stat-icon {
      transform: scale(1.1) rotate(5deg);
    }
  }
}

.stat-card-content {
  position: relative;
  overflow: hidden;
  background: white;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  line-height: 1.2;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.stat-label {
  font-size: 0.875rem;
  opacity: 0.95;
  margin-top: 4px;
}

.stat-icon-wrapper {
  border-radius: 12px;
  padding: 12px;
}

.stat-icon {
  font-size: 48px;
  transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.stat-progress {
  border-radius: 4px;
  height: 4px;
}

.pulse-animation {
  animation: pulse 2s ease-in-out infinite;
}

// Animations
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
}
</style>
