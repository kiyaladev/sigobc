<template>
  <q-page class="dashboard-page q-pa-md">
    <PageHeader title="Gestion des Employés" subtitle="Tableau de bord du personnel" icon="people" />

    <div class="row q-col-gutter-md">
      <!-- KPI -->
      <div class="col-12 col-sm-6 col-lg-3" v-for="(stat, index) in statsCards" :key="index">
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

      <!-- Accès rapide -->
      <div class="col-12 fade-in" style="animation-delay: 0.4s">
        <q-card class="quick-access-card">
          <q-card-section>
            <div class="section-header q-mb-md">
              <div class="flex items-center">
                <q-icon name="bolt" color="primary" size="24px" class="q-mr-sm" />
                <span class="text-h6 text-weight-bold">Accès Rapide</span>
              </div>
              <div class="section-decoration"></div>
            </div>

            <div class="row q-col-gutter-md">
              <div class="col-6 col-sm-4 col-md" v-for="(action, index) in quickActions" :key="action.route">
                <q-btn
                  unelevated
                  :color="action.color"
                  class="full-width quick-action-btn"
                  stack
                  :style="{ animationDelay: `${index * 0.05}s` }"
                  @click="$router.push(action.route)"
                >
                  <q-icon :name="action.icon" size="32px" class="q-mb-sm" />
                  <div class="text-caption text-weight-medium">{{ action.label }}</div>
                </q-btn>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Répartition par service -->
      <div class="col-12 col-md-6 fade-in" style="animation-delay: 0.5s">
        <q-card class="activity-card">
          <q-card-section>
            <div class="section-header q-mb-md">
              <div class="flex items-center">
                <q-icon name="corporate_fare" color="primary" size="24px" class="q-mr-sm" />
                <span class="text-h6 text-weight-bold">Répartition par service</span>
              </div>
              <div class="section-decoration"></div>
            </div>

            <q-list separator class="activity-list">
              <q-item
                v-for="(service, index) in stats.parService"
                :key="service.service"
                class="activity-item"
                :style="{ animationDelay: `${index * 0.08}s` }"
              >
                <q-item-section avatar>
                  <q-avatar color="primary" text-color="white" class="pulse-soft">
                    <q-icon name="groups" />
                  </q-avatar>
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-medium">{{ service.service }}</q-item-label>
                  <q-item-label caption class="text-grey-6">
                    {{ service.count }} agent{{ service.count > 1 ? 's' : '' }}
                  </q-item-label>
                  <q-linear-progress
                    :value="service.count / (stats.totalEmployes || 1)"
                    color="primary"
                    track-color="grey-3"
                    rounded
                    class="q-mt-sm"
                  />
                </q-item-section>
                <q-item-section side>
                  <q-chip color="primary" text-color="white" size="sm" class="status-chip">
                    {{ Math.round((service.count / (stats.totalEmployes || 1)) * 100) }}%
                  </q-chip>
                </q-item-section>
              </q-item>

              <q-item v-if="!stats.parService.length" class="empty-state">
                <q-item-section class="text-center">
                  <q-icon name="inbox" size="48px" color="grey-4" class="q-mb-sm" />
                  <div class="text-grey-5 q-mb-sm">Aucun agent enregistré</div>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
          <q-card-actions align="right" class="q-px-md q-pb-md">
            <q-btn
              flat
              color="primary"
              label="Voir tout"
              icon-right="arrow_forward"
              @click="$router.push('/app7/employes')"
              class="view-all-btn"
            />
          </q-card-actions>
        </q-card>
      </div>

      <!-- Paie du mois -->
      <div class="col-12 col-md-6 fade-in" style="animation-delay: 0.6s">
        <q-card class="activity-card">
          <q-card-section>
            <div class="section-header q-mb-md">
              <div class="flex items-center">
                <q-icon name="receipt_long" color="teal" size="24px" class="q-mr-sm" />
                <span class="text-h6 text-weight-bold">Paie – {{ nomMoisCourant }} {{ anneeCourante }}</span>
              </div>
              <div class="section-decoration"></div>
            </div>

            <div class="row q-col-gutter-md q-mb-md">
              <div class="col-12 col-sm-6">
                <q-card flat class="mini-stat-card">
                  <q-card-section>
                    <div class="overview-stat-label">Bulletins générés</div>
                    <div class="overview-stat-value text-teal">{{ stats.paie.nbFiches }}</div>
                  </q-card-section>
                </q-card>
              </div>
              <div class="col-12 col-sm-6">
                <q-card flat class="mini-stat-card">
                  <q-card-section>
                    <div class="overview-stat-label">Bulletins payés</div>
                    <div class="overview-stat-value text-positive">{{ stats.paie.nbPayes }}</div>
                  </q-card-section>
                </q-card>
              </div>
              <div class="col-12">
                <q-card flat class="mini-stat-card">
                  <q-card-section>
                    <div class="overview-stat-label">Total net à payer</div>
                    <div class="overview-stat-value">{{ formatMontant(stats.paie.totalNet) }}</div>
                    <div class="overview-stat-helper">
                      Taux de paiement : {{ tauxPaie }} %
                    </div>
                  </q-card-section>
                </q-card>
              </div>
            </div>
          </q-card-section>
          <q-card-actions align="right" class="q-px-md q-pb-md">
            <q-btn
              unelevated
              color="teal"
              label="Gérer la paie"
              icon="payments"
              @click="$router.push('/app7/salaires')"
            />
          </q-card-actions>
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

const statsCards = computed<{ value: number | string; label: string; icon: string; color: string; helper?: string }[]>(() => [
  {
    value: stats.value.totalEmployes,
    label: 'Agents actifs',
    icon: 'people',
    color: 'primary',
  },
  {
    value: formatMontant(stats.value.masseSalariale),
    label: 'Masse salariale',
    icon: 'payments',
    color: 'secondary',
  },
  {
    value: stats.value.congesEnAttente,
    label: 'Congés en attente',
    icon: 'beach_access',
    color: 'teal',
  },
  {
    value: stats.value.missionsMois,
    label: 'Missions ce mois',
    icon: 'flight_takeoff',
    color: 'positive',
  },
]);

const quickActions = [
  { route: '/app7/employes', icon: 'people', label: 'Agents', color: 'primary' },
  { route: '/app7/salaires', icon: 'payments', label: 'Salaires', color: 'teal' },
  { route: '/app7/conges', icon: 'beach_access', label: 'Congés', color: 'orange' },
  { route: '/app7/missions', icon: 'flight_takeoff', label: 'Missions', color: 'indigo' },
  { route: '/app7/statistiques', icon: 'bar_chart', label: 'Stats', color: 'purple' },
];

const tauxPaie = computed(() => {
  if (!stats.value.paie.nbFiches) return 0;
  return ((stats.value.paie.nbPayes / stats.value.paie.nbFiches) * 100).toFixed(1);
});

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
      (Number(e.salaireBase) || 0) +
      (Number(e.indemniteLogement) || 0) +
      (Number(e.indemniteTransport) || 0) +
      (Number(e.autresIndemnites) || 0),
    0,
  );

  const serviceMap = new Map<string, number>();
  employes.forEach((e) => {
    serviceMap.set(e.service, (serviceMap.get(e.service) || 0) + 1);
  });
  const parService = Array.from(serviceMap.entries())
    .map(([service, count]) => ({ service, count }))
    .sort((a, b) => b.count - a.count);

  const totalNet = fichesPayMonth.reduce((sum, f) => sum + (Number(f.montantNet) || 0), 0);

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
.dashboard-page {
  max-width: 1400px;
  margin: 0 auto;
}

.overview-stat-card {
  min-height: 112px;
}

.overview-stat-label {
  margin-bottom: 8px;
  color: #64748b;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.overview-stat-value {
  color: #0f172a;
  font-size: clamp(1.1rem, 2vw, 1.5rem);
  font-weight: 800;
  line-height: 1.2;
}

.overview-stat-helper {
  margin-top: 6px;
  color: #64748b;
  font-size: 0.82rem;
  font-weight: 600;
}

.quick-access-card {
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.quick-action-btn {
  border-radius: 12px;
  padding: 20px 12px;
  min-height: 100px;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  animation: fadeInUp 0.5s ease-out both;

  &:hover {
    transform: translateY(-4px) scale(1.02);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
  }
}

.activity-card {
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  height: 100%;
  display: flex;
  flex-direction: column;
}

.activity-list {
  min-height: 300px;
}

.activity-item {
  border-radius: 8px;
  margin: 8px 0;
  transition: all 0.3s ease;
  animation: fadeInLeft 0.5s ease-out both;

  &:hover {
    background-color: rgba(25, 118, 210, 0.05);
    transform: translateX(8px);
  }
}

.mini-stat-card {
  border-radius: 14px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
}

.pulse-soft {
  animation: pulseSoft 3s ease-in-out infinite;
}

.status-chip {
  font-weight: 600;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.empty-state {
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.view-all-btn {
  transition: all 0.3s ease;

  &:hover {
    transform: translateX(4px);
  }
}

.section-header {
  position: relative;

  .section-decoration {
    height: 3px;
    background: linear-gradient(90deg, #1976d2 0%, transparent 100%);
    border-radius: 2px;
    margin-top: 8px;
  }
}

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

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInLeft {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes pulseSoft {
  0%,
  100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(25, 118, 210, 0.35);
  }
  50% {
    transform: scale(1.05);
    box-shadow: 0 0 0 8px rgba(25, 118, 210, 0);
  }
}

.fade-in {
  animation: fadeIn 0.6s ease-out both;
}

@media (max-width: 600px) {
  .quick-action-btn {
    min-height: 80px;
    padding: 16px 8px;
  }
}
</style>
