<template>
  <q-page class="q-pa-md">
    <div class="text-h5 q-mb-md">Statistiques et Rapports</div>

    <!-- Sélecteur de période -->
    <q-card class="q-mb-md">
      <q-card-section>
        <div class="row q-col-gutter-md items-center">
          <div class="col-12 col-sm-3">
            <q-input
              v-model="dateDebut"
              filled
              type="date"
              label="Date début"
              @update:model-value="loadStatistics"
            />
          </div>
          <div class="col-12 col-sm-3">
            <q-input
              v-model="dateFin"
              filled
              type="date"
              label="Date fin"
              @update:model-value="loadStatistics"
            />
          </div>
          <div class="col-12 col-sm-3">
            <q-btn
              color="primary"
              icon="refresh"
              label="Actualiser"
              @click="loadStatistics"
              :loading="loading"
            />
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Cartes de statistiques principales -->
    <div class="row q-col-gutter-md q-mb-md">
      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="stat-card" style="border-left: 4px solid var(--q-blue)">
          <q-card-section>
            <div class="text-h3 text-grey-8">{{ stats.totalDeclarations }}</div>
            <div class="text-subtitle1 text-grey-6">Déclarations</div>
            <q-icon name="description" size="48px" class="stat-icon" color="blue" />
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="stat-card" style="border-left: 4px solid var(--q-green)">
          <q-card-section>
            <div class="text-h3 text-grey-8">{{ stats.declarationsPayees }}</div>
            <div class="text-subtitle1 text-grey-6">Déclarations Payées</div>
            <q-icon name="check_circle" size="48px" class="stat-icon" color="green" />
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="stat-card" style="border-left: 4px solid var(--q-orange)">
          <q-card-section>
            <div class="text-h3 text-grey-8">{{ stats.totalBordereaux }}</div>
            <div class="text-subtitle1 text-grey-6">Bordereaux</div>
            <q-icon name="receipt_long" size="48px" class="stat-icon" color="orange" />
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="stat-card" style="border-left: 4px solid var(--q-purple)">
          <q-card-section>
            <div class="text-h4 text-grey-8">{{ formatMontant(stats.montantTotal) }}</div>
            <div class="text-subtitle1 text-grey-6">Montant Total</div>
            <q-icon name="payments" size="48px" class="stat-icon" color="purple" />
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Graphiques et tableaux -->
    <div class="row q-col-gutter-md">
      <!-- Répartition par statut -->
      <div class="col-12 col-md-6">
        <q-card>
          <q-card-section>
            <div class="text-h6 q-mb-md">Répartition par Statut</div>
            <div class="chart-container">
              <canvas ref="statutChartRef"></canvas>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Répartition par taxe -->
      <div class="col-12 col-md-6">
        <q-card>
          <q-card-section>
            <div class="text-h6 q-mb-md">Répartition par Taxe</div>
            <div class="chart-container">
              <canvas ref="taxeChartRef"></canvas>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Évolution mensuelle -->
      <div class="col-12">
        <q-card>
          <q-card-section>
            <div class="text-h6 q-mb-md">Évolution Mensuelle</div>
            <div class="chart-container">
              <canvas ref="evolutionChartRef"></canvas>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Top 5 taxes -->
      <div class="col-12 col-md-6">
        <q-card>
          <q-card-section>
            <div class="text-h6 q-mb-md">Top 5 Taxes par Montant</div>
            <q-list separator>
              <q-item v-for="(item, index) in topTaxes" :key="index">
                <q-item-section avatar>
                  <q-avatar color="primary" text-color="white">
                    {{ index + 1 }}
                  </q-avatar>
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ item.label }}</q-item-label>
                  <q-item-label caption>{{ item.count }} déclarations</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <div class="text-weight-bold">{{ formatMontant(item.montant) }}</div>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
      </div>

      <!-- Statistiques détaillées -->
      <div class="col-12 col-md-6">
        <q-card>
          <q-card-section>
            <div class="text-h6 q-mb-md">Statistiques Détaillées</div>
            <q-list>
              <q-item>
                <q-item-section>
                  <q-item-label caption>Montant Moyen par Déclaration</q-item-label>
                  <q-item-label>{{ formatMontant(stats.montantMoyen) }}</q-item-label>
                </q-item-section>
              </q-item>
              <q-separator />
              <q-item>
                <q-item-section>
                  <q-item-label caption>Taux de Paiement</q-item-label>
                  <q-item-label>{{ stats.tauxPaiement }}%</q-item-label>
                </q-item-section>
              </q-item>
              <q-separator />
              <q-item>
                <q-item-section>
                  <q-item-label caption>Nombre de Mairies</q-item-label>
                  <q-item-label>{{ stats.nombreMairies }}</q-item-label>
                </q-item-section>
              </q-item>
              <q-separator />
              <q-item>
                <q-item-section>
                  <q-item-label caption>Bordereaux Transmis</q-item-label>
                  <q-item-label>{{ stats.bordereauxTransmis }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, nextTick } from 'vue';
import {
  db,
  type Declaration,
  type Taxe,
  type Mairie,
  type BordereauRecette,
} from 'src/database/db';
import Chart from 'chart.js/auto';

const loading = ref(false);
const dateDebut = ref('');
const dateFin = ref('');

const mairies = ref<Mairie[]>([]);
const declarations = ref<Declaration[]>([]);
const taxes = ref<Taxe[]>([]);
const bordereaux = ref<BordereauRecette[]>([]);

const statutChartRef = ref<HTMLCanvasElement | null>(null);
const taxeChartRef = ref<HTMLCanvasElement | null>(null);
const evolutionChartRef = ref<HTMLCanvasElement | null>(null);

let statutChart: Chart | null = null;
let taxeChart: Chart | null = null;
let evolutionChart: Chart | null = null;

const stats = computed(() => {
  const filteredDecl = getFilteredDeclarations();

  const totalDeclarations = filteredDecl.length;
  const declarationsValidees = filteredDecl.filter((d) => d.statut === 'validee').length;
  const montantTotal = filteredDecl.reduce((sum, d) => sum + (d.montantRecette || 0), 0);
  const montantMoyen = totalDeclarations > 0 ? montantTotal / totalDeclarations : 0;
  const tauxValidation =
    totalDeclarations > 0 ? Math.round((declarationsValidees / totalDeclarations) * 100) : 0;

  const filteredBordereaux = bordereaux.value;

  const bordereauxFermes = filteredBordereaux.filter((b) => b.statut === 'ferme').length;

  return {
    totalDeclarations,
    declarationsPayees: declarationsValidees,
    totalBordereaux: filteredBordereaux.length,
    montantTotal,
    montantMoyen,
    tauxPaiement: tauxValidation,
    nombreMairies: mairies.value.length,
    bordereauxTransmis: bordereauxFermes,
  };
});

const topTaxes = computed(() => {
  const filteredDecl = getFilteredDeclarations();
  const taxeStats: Record<number, { label: string; montant: number; count: number }> = {};

  filteredDecl.forEach((d) => {
    if (!taxeStats[d.taxeId]) {
      const taxe = taxes.value.find((t) => t.id === d.taxeId);
      taxeStats[d.taxeId] = {
        label: taxe?.libelle || 'Inconnu',
        montant: 0,
        count: 0,
      };
    }
    const stat = taxeStats[d.taxeId];
    if (stat) {
      stat.montant += d.montantRecette || 0;
      stat.count += 1;
    }
  });

  return Object.values(taxeStats)
    .sort((a, b) => b.montant - a.montant)
    .slice(0, 5);
});

function getFilteredDeclarations(): Declaration[] {
  let filtered = declarations.value;

  if (dateDebut.value) {
    const debut = new Date(dateDebut.value);
    filtered = filtered.filter((d) => new Date(d.dateEncaissement) >= debut);
  }

  if (dateFin.value) {
    const fin = new Date(dateFin.value);
    filtered = filtered.filter((d) => new Date(d.dateEncaissement) <= fin);
  }

  return filtered;
}

function formatMontant(montant: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    minimumFractionDigits: 0,
  }).format(montant);
}

async function loadData() {
  loading.value = true;
  try {
    [declarations.value, taxes.value, mairies.value, bordereaux.value] = await Promise.all([
      db.declarations.toArray(),
      db.taxes.toArray(),
      db.mairies.toArray(),
      db.bordereauxRecette.toArray(),
    ]);
  } catch (error) {
    console.error('Erreur lors du chargement:', error);
  } finally {
    loading.value = false;
  }
}

async function loadStatistics() {
  await loadData();
  await nextTick();
  createCharts();
}

function createCharts() {
  createStatutChart();
  createTaxeChart();
  createEvolutionChart();
}

function createStatutChart() {
  if (!statutChartRef.value) return;

  const filteredDecl = getFilteredDeclarations();
  const statutData = {
    brouillon: filteredDecl.filter((d) => d.statut === 'brouillon').length,
    validee: filteredDecl.filter((d) => d.statut === 'validee').length,
  };

  if (statutChart) statutChart.destroy();

  statutChart = new Chart(statutChartRef.value, {
    type: 'doughnut',
    data: {
      labels: ['Brouillon', 'Validée'],
      datasets: [
        {
          data: [statutData.brouillon, statutData.validee],
          backgroundColor: ['#9E9E9E', '#4CAF50'],
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          position: 'bottom',
        },
      },
    },
  });
}

function createTaxeChart() {
  if (!taxeChartRef.value) return;

  const top5 = topTaxes.value;

  if (taxeChart) taxeChart.destroy();

  taxeChart = new Chart(taxeChartRef.value, {
    type: 'bar',
    data: {
      labels: top5.map((t) => t.label),
      datasets: [
        {
          label: 'Montant (FCFA)',
          data: top5.map((t) => t.montant),
          backgroundColor: '#673AB7',
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          display: false,
        },
      },
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  });
}

function createEvolutionChart() {
  if (!evolutionChartRef.value) return;

  const filteredDecl = getFilteredDeclarations();
  const monthlyData: Record<string, number> = {};

  filteredDecl.forEach((d) => {
    const month = new Date(d.dateEncaissement).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
    });
    monthlyData[month] = (monthlyData[month] || 0) + (d.montantRecette || 0);
  });

  const sortedMonths = Object.keys(monthlyData).sort();

  if (evolutionChart) evolutionChart.destroy();

  evolutionChart = new Chart(evolutionChartRef.value, {
    type: 'line',
    data: {
      labels: sortedMonths,
      datasets: [
        {
          label: 'Montant (FCFA)',
          data: sortedMonths.map((m) => monthlyData[m] ?? 0),
          borderColor: '#FF9800',
          backgroundColor: 'rgba(255, 152, 0, 0.1)',
          tension: 0.4,
          fill: true,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          display: false,
        },
      },
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  });
}

onMounted(() => {
  void loadStatistics();
});
</script>

<style scoped lang="scss">
.stat-card {
  position: relative;
  overflow: hidden;

  .stat-icon {
    position: absolute;
    right: 10px;
    top: 10px;
    opacity: 0.3;
  }
}

.chart-container {
  position: relative;
  height: 300px;

  canvas {
    max-height: 100%;
  }
}
</style>
