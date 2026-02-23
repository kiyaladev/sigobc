<template>
  <q-page class="q-pa-md">
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
      <div class="col-12 col-sm-6 col-md-3" v-for="card in cards" :key="card.label">
        <q-card class="stat-card" :class="`bg-${card.color}`">
          <q-card-section class="q-pa-md text-white">
            <div class="row items-center no-wrap">
              <div class="col">
                <div class="text-h4 text-weight-bold">{{ card.value }}</div>
                <div class="text-body2 opacity-80">{{ card.label }}</div>
              </div>
              <q-icon :name="card.icon" size="40px" class="opacity-50" />
            </div>
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

const cards = computed(() => [
  { label: 'Agents actifs', value: stats.value.totalActifs, color: 'primary', icon: 'people' },
  { label: 'Agents inactifs', value: stats.value.totalInactifs, color: 'grey', icon: 'person_off' },
  {
    label: 'Masse salariale brute',
    value: formatMontant(stats.value.masseSalarialeBrute),
    color: 'teal',
    icon: 'payments',
  },
  { label: 'Missions', value: stats.value.totalMissions, color: 'indigo', icon: 'flight_takeoff' },
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
    valide: 'blue',
    paye: 'positive',
  };
  const statutLabels: Record<string, string> = {
    brouillon: 'Brouillon',
    valide: 'Validé',
    paye: 'Payé',
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
.stat-card {
  border-radius: 12px;
}
.main-card {
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}
</style>
