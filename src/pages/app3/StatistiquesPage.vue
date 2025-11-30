<template>
  <q-page class="statistiques-page q-pa-md">
    <PageHeader
      title="Statistiques des Dépenses"
      subtitle="Analyse et visualisation des données"
      icon="bar_chart"
    />

    <div class="row q-col-gutter-md">
      <!-- Cartes de résumé -->
      <div class="col-12 col-sm-6 col-md-3" v-for="(stat, index) in stats" :key="index">
        <StatCard
          :label="stat.title"
          :value="stat.value"
          :icon="stat.icon"
          :color="stat.color"
          :trend="stat.trend"
        />
      </div>

      <!-- Graphique des dépenses par chapitre -->
      <div class="col-12 col-md-6">
        <ChartCard title="Dépenses par Chapitre" icon="pie_chart">
          <div class="chart-placeholder">
            <q-icon name="pie_chart" size="64px" color="grey-4" />
            <div class="text-grey-6 q-mt-md">Graphique des dépenses par chapitre</div>
          </div>
        </ChartCard>
      </div>

      <!-- Graphique de l'évolution des mandats -->
      <div class="col-12 col-md-6">
        <ChartCard title="Évolution des Mandats" icon="trending_up">
          <div class="chart-placeholder">
            <q-icon name="show_chart" size="64px" color="grey-4" />
            <div class="text-grey-6 q-mt-md">Évolution mensuelle des mandats</div>
          </div>
        </ChartCard>
      </div>

      <!-- Tableau des prévisions vs réalisations -->
      <div class="col-12">
        <q-card class="stats-card">
          <q-card-section>
            <div class="text-h6 q-mb-md">
              <q-icon name="analytics" color="primary" class="q-mr-sm" />
              Prévisions vs Réalisations
            </div>
            <q-table
              :rows="previsionsStats"
              :columns="tableColumns"
              row-key="id"
              flat
              bordered
              :rows-per-page-options="[10]"
            >
              <template v-slot:body-cell-taux="props">
                <q-td :props="props">
                  <q-linear-progress
                    :value="props.row.taux / 100"
                    size="20px"
                    :color="getTauxColor(props.row.taux)"
                  >
                    <div class="absolute-full flex flex-center">
                      <q-badge color="white" text-color="black" :label="`${props.row.taux}%`" />
                    </div>
                  </q-linear-progress>
                </q-td>
              </template>
            </q-table>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { db } from 'src/database/db';
import PageHeader from 'src/components/PageHeader.vue';
import StatCard from 'src/components/StatCard.vue';
import ChartCard from 'src/components/ChartCard.vue';

const stats = ref([
  {
    title: 'Budget Total',
    value: '0 XOF',
    icon: 'account_balance_wallet',
    color: 'primary',
    trend: 12,
  },
  {
    title: 'Mandats Émis',
    value: '0',
    icon: 'receipt',
    color: 'positive',
    trend: 5,
  },
  {
    title: 'En Attente',
    value: '0',
    icon: 'schedule',
    color: 'warning',
    trend: -3,
  },
  {
    title: 'Taux Exécution',
    value: '0%',
    icon: 'trending_up',
    color: 'info',
    trend: 8,
  },
]);

const previsionsStats = ref<
  Array<{
    id: number;
    rubrique: string;
    prevu: string;
    engage: string;
    disponible: string;
    taux: number;
  }>
>([]);

const tableColumns = [
  {
    name: 'rubrique',
    label: 'Chapitre',
    align: 'left' as const,
    field: 'rubrique',
  },
  {
    name: 'prevu',
    label: 'Prévu',
    align: 'right' as const,
    field: 'prevu',
  },
  {
    name: 'engage',
    label: 'Engagé',
    align: 'right' as const,
    field: 'engage',
  },
  {
    name: 'disponible',
    label: 'Disponible',
    align: 'right' as const,
    field: 'disponible',
  },
  {
    name: 'taux',
    label: "Taux d'exécution",
    align: 'center' as const,
    field: 'taux',
  },
];

function formatMontant(montant: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    minimumFractionDigits: 0,
  }).format(montant);
}

function getTauxColor(taux: number): string {
  if (taux >= 80) return 'negative';
  if (taux >= 60) return 'warning';
  return 'positive';
}

async function loadStatistics() {
  try {
    // Charger les prévisions
    const previsions = await db.previsions.toArray();
    const chapitres = await db.chapitres.toArray();
    const mandats = await db.mandats.toArray();

    // Calculer le budget total
    const budgetTotal = previsions.reduce((sum, p) => sum + p.montantPrevu, 0);
    stats.value[0]!.value = formatMontant(budgetTotal);

    // Compter les mandats émis
    const mandatsEmis = mandats.filter((m) => m.statut === 'emis' || m.statut === 'paye');
    stats.value[1]!.value = mandatsEmis.length.toString();

    // Compter les mandats en attente
    const mandatsAttente = mandats.filter((m) => m.statut === 'brouillon');
    stats.value[2]!.value = mandatsAttente.length.toString();

    // Calculer le taux d'exécution
    const montantEngage = previsions.reduce((sum, p) => sum + p.montantEngage, 0);
    const tauxExecution = budgetTotal > 0 ? Math.round((montantEngage / budgetTotal) * 100) : 0;
    stats.value[3]!.value = `${tauxExecution}%`;

    // Préparer les données du tableau
    previsionsStats.value = previsions.map((p) => {
      const chapitre = chapitres.find((c) => c.id === p.chapitreId);
      const taux = p.montantPrevu > 0 ? Math.round((p.montantEngage / p.montantPrevu) * 100) : 0;

      return {
        id: p.id!,
        rubrique: chapitre ? `${chapitre.code} - ${chapitre.libelle}` : 'N/A',
        prevu: formatMontant(p.montantPrevu),
        engage: formatMontant(p.montantEngage),
        disponible: formatMontant(p.montantDisponible),
        taux,
      };
    });
  } catch (error) {
    console.error('Erreur lors du chargement des statistiques:', error);
  }
}

onMounted(() => {
  void loadStatistics();
});
</script>

<style scoped lang="scss">
.statistiques-page {
  max-width: 1400px;
  margin: 0 auto;
}

.stats-card {
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.chart-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  background: linear-gradient(135deg, #f5f7fa 0%, #e8edf2 100%);
  border-radius: 12px;
  padding: 24px;
}
</style>
