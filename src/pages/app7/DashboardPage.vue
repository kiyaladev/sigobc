<template>
  <q-page class="dashboard-page q-pa-md">
    <PageHeader
      title="Gestion des Employés"
      subtitle="Tableau de bord du personnel"
      icon="people"
    />

    <!-- Statistiques principales -->
    <div class="row q-col-gutter-md q-mb-md">
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
      <!-- Répartition par service -->
      <div class="col-12 col-md-6">
        <q-card class="main-card">
          <q-card-section>
            <div class="text-h6 q-mb-md">
              <q-icon name="corporate_fare" class="q-mr-sm" color="primary" />
              Répartition par service
            </div>
            <q-list separator>
              <q-item v-for="s in stats.parService" :key="s.service">
                <q-item-section>
                  <q-item-label>{{ s.service }}</q-item-label>
                  <q-linear-progress
                    :value="s.count / (stats.totalEmployes || 1)"
                    color="primary"
                    class="q-mt-xs"
                  />
                </q-item-section>
                <q-item-section side>
                  <q-chip color="primary" text-color="white" size="sm">{{ s.count }}</q-chip>
                </q-item-section>
              </q-item>
              <q-item v-if="!stats.parService.length">
                <q-item-section class="text-grey text-center"
                  >Aucun agent enregistré</q-item-section
                >
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
      </div>

      <!-- Fiches de paie du mois courant -->
      <div class="col-12 col-md-6">
        <q-card class="main-card">
          <q-card-section>
            <div class="text-h6 q-mb-md">
              <q-icon name="receipt_long" class="q-mr-sm" color="teal" />
              Paie – {{ nomMoisCourant }} {{ anneeCourante }}
            </div>
            <div class="row q-col-gutter-sm q-mb-md">
              <div class="col-6">
                <div class="text-caption text-grey">Bulletins générés</div>
                <div class="text-h5 text-weight-bold text-teal">{{ stats.paie.nbFiches }}</div>
              </div>
              <div class="col-6">
                <div class="text-caption text-grey">Bulletins payés</div>
                <div class="text-h5 text-weight-bold text-positive">{{ stats.paie.nbPayes }}</div>
              </div>
              <div class="col-12">
                <div class="text-caption text-grey">Total net à payer</div>
                <div class="text-h6 text-weight-bold">{{ formatMontant(stats.paie.totalNet) }}</div>
              </div>
            </div>
            <q-btn
              label="Gérer la paie"
              icon="payments"
              color="teal"
              unelevated
              to="/app7/salaires"
            />
          </q-card-section>
        </q-card>
      </div>

      <!-- Liens rapides -->
      <div class="col-12">
        <q-card class="main-card">
          <q-card-section>
            <div class="text-h6 q-mb-md">Accès rapides</div>
            <div class="row q-col-gutter-sm">
              <div class="col-6 col-sm-4 col-md-2" v-for="link in quickLinks" :key="link.to">
                <q-btn
                  :to="link.to"
                  :icon="link.icon"
                  :label="link.label"
                  :color="link.color"
                  unelevated
                  stack
                  class="full-width q-py-md"
                />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { db } from 'src/database/db';
import PageHeader from 'src/components/PageHeader.vue';

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

const now = new Date();
const anneeCourante = now.getFullYear();
const moisCourant = now.getMonth() + 1;
const nomMoisCourant = computed(() => moisNoms[moisCourant - 1]);

const stats = ref({
  totalEmployes: 0,
  masseSalariale: 0,
  congesEnAttente: 0,
  missionsMois: 0,
  parService: [] as { service: string; count: number }[],
  paie: { nbFiches: 0, nbPayes: 0, totalNet: 0 },
});

// Cartes de statistiques avec animations
const statsCards = computed(() => [
  {
    value: stats.value.totalEmployes,
    label: 'Agents actifs',
    icon: 'people',
    color: 'primary',
    progress: 1,
  },
  {
    value: formatMontant(stats.value.masseSalariale),
    label: 'Masse salariale',
    icon: 'payments',
    color: 'teal',
    progress: 0.9,
  },
  {
    value: stats.value.congesEnAttente,
    label: 'Congés en attente',
    icon: 'beach_access',
    color: 'orange',
    progress: stats.value.congesEnAttente > 0 ? 0.5 : 1,
  },
  {
    value: stats.value.missionsMois,
    label: 'Missions ce mois',
    icon: 'flight_takeoff',
    color: 'indigo',
    progress: 0.8,
  },
]);

const quickLinks = [
  { to: '/app7/employes', icon: 'people', label: 'Agents', color: 'primary' },
  { to: '/app7/salaires', icon: 'payments', label: 'Salaires', color: 'teal' },
  { to: '/app7/conges', icon: 'beach_access', label: 'Congés', color: 'orange' },
  { to: '/app7/missions', icon: 'flight_takeoff', label: 'Missions', color: 'indigo' },
  { to: '/app7/statistiques', icon: 'bar_chart', label: 'Stats', color: 'purple' },
];

function formatMontant(montant: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    minimumFractionDigits: 0,
  }).format(montant);
}

async function loadStats() {
  const [employes, conges, missions, fichesPayMonth] = await Promise.all([
    db.employes.filter((e) => e.actif).toArray(),
    db.conges.filter((c) => c.statut === 'demande').toArray(),
    db.ordresMission
      .filter((m) => {
        const d = new Date(m.dateDebut);
        return d.getMonth() + 1 === moisCourant && d.getFullYear() === anneeCourante;
      })
      .toArray(),
    db.fichesPaie.filter((f) => f.mois === moisCourant && f.annee === anneeCourante).toArray(),
  ]);

  const masseSalariale = employes.reduce(
    (sum, e) =>
      sum +
      (e.salaireBase || 0) +
      (e.indemniteLogement || 0) +
      (e.indemniteTransport || 0) +
      (e.autresIndemnites || 0),
    0,
  );

  // Répartition par service
  const serviceMap = new Map<string, number>();
  employes.forEach((e) => {
    serviceMap.set(e.service, (serviceMap.get(e.service) || 0) + 1);
  });
  const parService = Array.from(serviceMap.entries())
    .map(([service, count]) => ({ service, count }))
    .sort((a, b) => b.count - a.count);

  const totalNet = fichesPayMonth.reduce((sum, f) => sum + f.montantNet, 0);

  stats.value = {
    totalEmployes: employes.length,
    masseSalariale,
    congesEnAttente: conges.length,
    missionsMois: missions.length,
    parService,
    paie: {
      nbFiches: fichesPayMonth.length,
      nbPayes: fichesPayMonth.filter((f) => f.statut === 'paye').length,
      totalNet,
    },
  };
}

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
