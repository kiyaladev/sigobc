<template>
  <q-page class="q-pa-md">
    <PageHeader
      title="Gestion des Employés"
      subtitle="Tableau de bord du personnel"
      icon="people"
    />

    <!-- Statistiques principales -->
    <div class="row q-col-gutter-md q-mb-md">
      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="stat-card bg-primary text-white">
          <q-card-section class="q-pa-md">
            <div class="row items-center no-wrap">
              <div class="col">
                <div class="text-h4 text-weight-bold">{{ stats.totalEmployes }}</div>
                <div class="text-body2 q-mt-xs opacity-80">Agents actifs</div>
              </div>
              <div class="col-auto">
                <q-icon name="people" size="48px" class="opacity-60" />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="stat-card bg-teal text-white">
          <q-card-section class="q-pa-md">
            <div class="row items-center no-wrap">
              <div class="col">
                <div class="text-h4 text-weight-bold">
                  {{ formatMontant(stats.masseSalariale) }}
                </div>
                <div class="text-body2 q-mt-xs opacity-80">Masse salariale mensuelle</div>
              </div>
              <div class="col-auto">
                <q-icon name="payments" size="48px" class="opacity-60" />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="stat-card bg-orange text-white">
          <q-card-section class="q-pa-md">
            <div class="row items-center no-wrap">
              <div class="col">
                <div class="text-h4 text-weight-bold">{{ stats.congesEnAttente }}</div>
                <div class="text-body2 q-mt-xs opacity-80">Congés en attente</div>
              </div>
              <div class="col-auto">
                <q-icon name="beach_access" size="48px" class="opacity-60" />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="stat-card bg-indigo text-white">
          <q-card-section class="q-pa-md">
            <div class="row items-center no-wrap">
              <div class="col">
                <div class="text-h4 text-weight-bold">{{ stats.missionsMois }}</div>
                <div class="text-body2 q-mt-xs opacity-80">Missions ce mois</div>
              </div>
              <div class="col-auto">
                <q-icon name="flight_takeoff" size="48px" class="opacity-60" />
              </div>
            </div>
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
.stat-card {
  border-radius: 12px;
}
.main-card {
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}
</style>
