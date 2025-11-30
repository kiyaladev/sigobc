<template>
  <q-page class="q-pa-md">
    <div class="row q-mb-md justify-between items-center">
      <div class="text-h5">Statistiques des Tickets</div>
      <ExportButtons @export-pdf="exportPDF" @export-excel="exportExcel" />
    </div>

    <!-- Filtres de période -->
    <FilterBar
      v-model:period="periodFilter"
      v-model:date-debut="dateDebut"
      v-model:date-fin="dateFin"
      :period-options="periodOptions"
      show-period
      show-date-range
      show-refresh
      :loading="loading"
      @period-change="onPeriodChange"
      @refresh="loadStatistics"
      @reset="resetFilters"
    />

    <!-- Cartes de statistiques principales -->
    <div class="row q-col-gutter-md q-mb-md">
      <div class="col-12 col-sm-6 col-md-3">
        <StatisticsCard
          :value="stats.stockTotal"
          title="Stock Total"
          :subtitle="`${stats.typesTickets} types de tickets`"
          icon="confirmation_number"
          icon-color="grey-7"
          border-color="var(--q-orange)"
        />
      </div>

      <div class="col-12 col-sm-6 col-md-3">
        <StatisticsCard
          :value="stats.valeurTotale"
          title="Valeur Totale"
          subtitle="En stock actuellement"
          icon="payments"
          icon-color="grey-7"
          border-color="var(--q-green)"
          format="currency"
        />
      </div>

      <div class="col-12 col-sm-6 col-md-3">
        <StatisticsCard
          :value="stats.approvisionnements"
          title="Appros Période"
          :subtitle="formatMontant(stats.montantAppros)"
          icon="inventory"
          icon-color="grey-7"
          border-color="var(--q-orange)"
        />
      </div>

      <div class="col-12 col-sm-6 col-md-3">
        <StatisticsCard
          :value="stats.versements"
          title="Versements Période"
          :subtitle="formatMontant(stats.montantVersements)"
          icon="upload"
          icon-color="grey-7"
          border-color="var(--q-orange)"
        />
      </div>
    </div>

    <!-- Graphiques et analyses -->
    <div class="row q-col-gutter-md">
      <q-inner-loading :showing="loading">
        <q-spinner-gears size="50px" color="primary" />
      </q-inner-loading>

      <!-- Message si aucune donnée -->
      <div v-if="!loading && stats.stockTotal === 0" class="col-12 text-center q-pa-xl">
        <q-icon name="bar_chart" size="64px" color="grey-5" />
        <div class="text-h6 text-grey-6 q-mt-md">Aucune donnée disponible</div>
        <div class="text-caption text-grey-5">
          Créez une balance d'entrée ou un approvisionnement pour l'exercice {{ selectedYear }}
        </div>
      </div>

      <!-- Stock par valeur -->
      <div v-if="!loading && stats.stockTotal > 0" class="col-12 col-md-6">
        <ChartCard
          title="Répartition du Stock par Valeur"
          :chart-config="stockChartConfig"
          header-class="text-grey-8"
        />
      </div>

      <!-- Valeur du stock -->
      <div v-if="!loading && stats.stockTotal > 0" class="col-12 col-md-6">
        <ChartCard
          title="Valeur du Stock par Type"
          :chart-config="valeurChartConfig"
          header-class="text-grey-8"
        />
      </div>

      <!-- Évolution mensuelle -->
      <div v-if="!loading && stats.stockTotal > 0" class="col-12">
        <ChartCard
          title="Évolution des Opérations"
          :chart-config="evolutionChartConfig"
          header-class="text-grey-8"
          container-class="chart-container-large"
        />
      </div>

      <!-- Tableau détaillé par type de ticket -->
      <div v-if="!loading && stats.stockTotal > 0" class="col-12">
        <q-card>
          <q-card-section class="accent-left">
            <div class="text-h6">Détails par Type de Ticket</div>
          </q-card-section>
          <q-card-section class="accent-left">
            <q-table
              :rows="detailsTickets"
              :columns="ticketsColumns"
              row-key="valeur"
              :pagination="{ rowsPerPage: 10 }"
              flat
              bordered
            >
              <template v-slot:body-cell-valeur="props">
                <q-td :props="props">
                  <q-badge color="accent" :label="props.row.valeur + ' FCFA'" />
                </q-td>
              </template>
              <template v-slot:body-cell-stock="props">
                <q-td :props="props">
                  <div class="row items-center">
                    <div class="col-auto q-mr-md">
                      <span class="text-weight-bold">{{ formatNumber(props.row.stock) }}</span>
                    </div>
                    <div class="col">
                      <q-linear-progress
                        :value="props.row.stock / 1000"
                        :color="getStockColor(props.row.stock)"
                        size="8px"
                      />
                    </div>
                  </div>
                </q-td>
              </template>
              <template v-slot:body-cell-valeurStock="props">
                <q-td :props="props" class="text-weight-bold text-positive">
                  {{ formatMontant(props.row.valeurStock) }}
                </q-td>
              </template>
              <template v-slot:body-cell-appros="props">
                <q-td :props="props">
                  {{ formatNumber(props.row.appros) }}
                </q-td>
              </template>
              <template v-slot:body-cell-remises="props">
                <q-td :props="props">
                  {{ formatNumber(props.row.remises) }}
                </q-td>
              </template>
              <template v-slot:body-cell-versements="props">
                <q-td :props="props">
                  {{ formatNumber(props.row.versements) }}
                </q-td>
              </template>
              <template v-slot:body-cell-taux="props">
                <q-td :props="props">
                  <q-chip :color="getTauxColor(props.row.taux)" text-color="white" size="sm" dense>
                    {{ props.row.taux }}%
                  </q-chip>
                </q-td>
              </template>
            </q-table>
          </q-card-section>
        </q-card>
      </div>

      <!-- Statistiques d'activité -->
      <div v-if="!loading && stats.stockTotal > 0" class="col-12 col-md-6">
        <q-card>
          <q-card-section class="accent-left">
            <div class="text-h6">Activité de la Période</div>
          </q-card-section>
          <q-card-section>
            <q-list separator>
              <q-item>
                <q-item-section avatar>
                  <q-avatar color="accent" text-color="grey-9" icon="shopping_cart" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-bold">Approvisionnements</q-item-label>
                  <q-item-label caption>Total des entrées</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-item-label class="text-h6 text-primary">
                    {{ formatNumber(stats.totalEntrees) }}
                  </q-item-label>
                  <q-item-label caption>tickets</q-item-label>
                </q-item-section>
              </q-item>

              <q-item>
                <q-item-section avatar>
                  <q-avatar color="accent" text-color="grey-9" icon="local_shipping" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-bold">Remises</q-item-label>
                  <q-item-label caption>Total des sorties (remises)</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-item-label class="text-h6">
                    {{ formatNumber(stats.totalRemises) }}
                  </q-item-label>
                  <q-item-label caption>tickets</q-item-label>
                </q-item-section>
              </q-item>

              <q-item>
                <q-item-section avatar>
                  <q-avatar color="accent" text-color="grey-9" icon="account_balance" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-bold">Versements</q-item-label>
                  <q-item-label caption>Total des versements</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-item-label class="text-h6">
                    {{ formatNumber(stats.totalVersementsTickets) }}
                  </q-item-label>
                  <q-item-label caption>tickets</q-item-label>
                </q-item-section>
              </q-item>

              <q-item>
                <q-item-section avatar>
                  <q-avatar color="positive" text-color="white" icon="trending_up" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-bold">Taux de Rotation</q-item-label>
                  <q-item-label caption>Rotation du stock</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-item-label class="text-h6 text-green">
                    {{ stats.tauxRotation }}%
                  </q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
      </div>

      <!-- Alertes et recommandations -->
      <div v-if="!loading && stats.stockTotal > 0" class="col-12 col-md-6">
        <q-card>
          <q-card-section>
            <div class="text-h6">Alertes et Recommandations</div>
          </q-card-section>
          <q-card-section>
            <q-list separator>
              <q-item v-for="(alerte, index) in alertes" :key="index">
                <q-item-section avatar>
                  <q-icon :name="alerte.icon" :color="alerte.color" size="md" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-medium">{{ alerte.titre }}</q-item-label>
                  <q-item-label caption>{{ alerte.description }}</q-item-label>
                </q-item-section>
              </q-item>
              <q-item v-if="alertes.length === 0">
                <q-item-section avatar>
                  <q-icon name="check_circle" color="positive" size="md" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-medium">Tout est normal</q-item-label>
                  <q-item-label caption>Aucune alerte à signaler</q-item-label>
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
import { ref, computed, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { type ChartConfiguration, type TooltipItem, type ChartTypeRegistry } from 'chart.js';
import FilterBar from 'src/components/FilterBar.vue';
import StatisticsCard from 'src/components/StatisticsCard.vue';
import ChartCard from 'src/components/ChartCard.vue';
import ExportButtons from 'src/components/ExportButtons.vue';
import { db } from 'src/database/db';
import type { Approvisionnement, Remise, Versement, BalanceEntree } from 'src/database/db';

const $q = useQuasar();

// Filtre par année
const currentYear = new Date().getFullYear();
const selectedYear = ref(currentYear);
const yearOptions = ref<number[]>([]);

// Refs
const loading = ref(false);
const periodFilter = ref('mois');
const dateDebut = ref('');
const dateFin = ref('');

// Données brutes de la base
const approvisionnements = ref<Approvisionnement[]>([]);
const remises = ref<Remise[]>([]);
const versements = ref<Versement[]>([]);
const balancesEntree = ref<BalanceEntree[]>([]);

// Options de période
const periodOptions = [
  { label: "Aujourd'hui", value: 'jour' },
  { label: 'Cette semaine', value: 'semaine' },
  { label: 'Ce mois', value: 'mois' },
  { label: 'Ce trimestre', value: 'trimestre' },
  { label: 'Cette année', value: 'annee' },
  { label: 'Personnalisé', value: 'custom' },
];

// Calcul du stock actuel
const stockActuel = computed(() => {
  const valeursTimbre: (100 | 200 | 300 | 500 | 600 | 1000)[] = [100, 200, 300, 500, 600, 1000];
  const stock: Record<number, number> = {};

  // Initialiser à zéro
  valeursTimbre.forEach((valeur) => {
    stock[valeur] = 0;
  });

  // Ajouter les balances d'entrée (BE-S1 uniquement)
  const balancesBES1 = balancesEntree.value.filter((b) =>
    b.type.includes('BE-S1') || b.type.includes('INITIAL') || b.type.includes('Stock')
  );

  balancesBES1.forEach((balance) => {
    if (balance.timbres) {
      valeursTimbre.forEach((valeur) => {
        stock[valeur] = (stock[valeur] ?? 0) + (balance.timbres[valeur] || 0);
      });
    }
  });

  // Ajouter les approvisionnements
  approvisionnements.value.forEach((appro) => {
    if (appro?.timbres) {
      valeursTimbre.forEach((valeur) => {
        stock[valeur] = (stock[valeur] ?? 0) + (appro.timbres[valeur] || 0);
      });
    }
  });

  // Soustraire les remises
  remises.value.forEach((remise) => {
    if (remise?.timbres) {
      valeursTimbre.forEach((valeur) => {
        stock[valeur] = (stock[valeur] ?? 0) - (remise.timbres[valeur] || 0);
      });
    }
  });

  return stock;
});

// Données des statistiques (calculées depuis les vraies données)
const stats = computed(() => {
  const valeursTimbre: (100 | 200 | 300 | 500 | 600 | 1000)[] = [100, 200, 300, 500, 600, 1000];

  // Stock total
  const stockTotal = valeursTimbre.reduce(
    (sum, valeur) => sum + (stockActuel.value[valeur] || 0),
    0,
  );

  // Valeur totale du stock
  const valeurTotale = valeursTimbre.reduce(
    (sum, valeur) => sum + (stockActuel.value[valeur] || 0) * valeur,
    0,
  );

  // Helper filter
  const filterByPeriod = (items: { date: string | Date }[]) => {
    if (!dateDebut.value || !dateFin.value) return items;
    const start = new Date(dateDebut.value).getTime();
    const end = new Date(dateFin.value).getTime() + 86400000 - 1; // End of day
    return items.filter(i => {
      const d = new Date(i.date).getTime();
      return d >= start && d <= end;
    });
  };

  const approsFiltered = filterByPeriod(approvisionnements.value) as Approvisionnement[];
  const remisesFiltered = filterByPeriod(remises.value) as Remise[];
  const versementsFiltered = filterByPeriod(versements.value) as Versement[];

  // Nombre d'approvisionnements et montant total
  const nbAppros = approsFiltered.length;
  const montantAppros = approsFiltered.reduce((sum, a) => sum + (a.total || 0), 0);

  // Nombre de versements et montant total
  const nbVersements = versementsFiltered.length;
  const montantVersements = versementsFiltered.reduce((sum, v) => sum + (v.total || 0), 0);

  // Total des tickets entrés (approvisionnements + balances)
  // Balances are usually "Initial", so they might be before period.
  // If period includes Start of Year, include balances?
  // For "Activity", usually we only count movements (Appros).
  // But "Rotation" needs Initial Stock + Appros.
  // I will include Balances ONLY if period starts at Jan 1?
  // Or just ignore Balances for "Activity Flow".
  // "Total Entrees" for Rotation usually means "Stock Available to be sold".
  // So it should include Initial Stock.

  let totalEntrees = 0;

  // Include balances in 'totalEntrees' for Rotation calculation?
  // If Rotation = Output / Input.
  // Input = Initial Stock + Appros.
  // So yes, include balances.

  const balancesBES1 = balancesEntree.value.filter((b) =>
    b.type.includes('BE-S1') || b.type.includes('INITIAL') || b.type.includes('Stock')
  );

  balancesBES1.forEach((balance) => {
    if (balance.timbres) {
      valeursTimbre.forEach((valeur) => {
        totalEntrees += balance.timbres[valeur] || 0;
      });
    }
  });

  approsFiltered.forEach((appro) => {
    if (appro?.timbres) {
      valeursTimbre.forEach((valeur) => {
        totalEntrees += appro.timbres[valeur] || 0;
      });
    }
  });

  // Total des remises
  let totalRemises = 0;
  remisesFiltered.forEach((remise) => {
    if (remise?.timbres) {
      valeursTimbre.forEach((valeur) => {
        totalRemises += remise.timbres[valeur] || 0;
      });
    }
  });

  // Total des versements (tickets)
  let totalVersementsTickets = 0;
  versementsFiltered.forEach((versement) => {
    if (versement?.timbres) {
      valeursTimbre.forEach((valeur) => {
        totalVersementsTickets += versement.timbres[valeur] || 0;
      });
    }
  });

  // Taux de rotation (sorties (remises) / entrées * 100)
  const tauxRotation =
    totalEntrees > 0
      ? Math.round((totalRemises / totalEntrees) * 100)
      : 0;

  return {
    stockTotal,
    typesTickets: 6,
    valeurTotale,
    approvisionnements: nbAppros,
    montantAppros,
    versements: nbVersements,
    montantVersements,
    totalEntrees,
    totalRemises,
    totalVersementsTickets,
    tauxRotation,
  };
});

// Détails par type de ticket (calculés dynamiquement)
const detailsTickets = computed(() => {
  const valeursTimbre: (100 | 200 | 300 | 500 | 600 | 1000)[] = [100, 200, 300, 500, 600, 1000];

  return valeursTimbre.map((valeur) => {
    const stock = stockActuel.value[valeur] || 0;
    const valeurStock = stock * valeur;

    // Calculer les appros pour cette valeur
    let appros = 0;
    approvisionnements.value.forEach((appro) => {
      if (appro?.timbres) {
        appros += appro.timbres[valeur] || 0;
      }
    });

    // Calculer les remises pour cette valeur
    let remisesQte = 0;
    remises.value.forEach((remise) => {
      if (remise?.timbres) {
        remisesQte += remise.timbres[valeur] || 0;
      }
    });

    // Calculer les versements pour cette valeur
    let versementsQte = 0;
    versements.value.forEach((versement) => {
      if (versement?.timbres) {
        versementsQte += versement.timbres[valeur] || 0;
      }
    });

    // Calculer le taux de rotation pour cette valeur
    let balanceVal = 0;
    const balancesBES1 = balancesEntree.value.filter((b) =>
      b.type.includes('BE-S1') || b.type.includes('INITIAL') || b.type.includes('Stock')
    );
    balancesBES1.forEach((b) => {
      balanceVal += b.timbres[valeur] || 0;
    });

    const totalEntrees = appros + balanceVal;
    const totalSorties = remisesQte; // Versements removed from rotation logic
    const taux = totalEntrees > 0 ? Math.round((totalSorties / totalEntrees) * 100) : 0;

    return {
      valeur,
      stock,
      valeurStock,
      appros,
      remises: remisesQte,
      versements: versementsQte,
      taux,
    };
  });
});

// Alertes
const alertes = computed(() => {
  const alerts: Array<{ icon: string; color: string; titre: string; description: string }> = [];

  detailsTickets.value.forEach((ticket) => {
    if (ticket.stock < 100) {
      alerts.push({
        icon: 'warning',
        color: 'negative',
        titre: `Stock faible - Tickets ${ticket.valeur} FCFA`,
        description: `Seulement ${ticket.stock} tickets en stock. Réapprovisionnement recommandé.`,
      });
    } else if (ticket.stock < 200) {
      alerts.push({
        icon: 'info',
        color: 'warning',
        titre: `Stock moyen - Tickets ${ticket.valeur} FCFA`,
        description: `${ticket.stock} tickets en stock. Surveiller l'évolution.`,
      });
    }
  });

  return alerts;
});

// Colonnes du tableau
const ticketsColumns = [
  {
    name: 'valeur',
    label: 'Valeur',
    field: 'valeur',
    align: 'center' as const,
    sortable: true,
  },
  {
    name: 'stock',
    label: 'Stock Actuel',
    field: 'stock',
    align: 'left' as const,
    sortable: true,
  },
  {
    name: 'valeurStock',
    label: 'Valeur Stock',
    field: 'valeurStock',
    align: 'right' as const,
    sortable: true,
  },
  {
    name: 'appros',
    label: 'Appros',
    field: 'appros',
    align: 'center' as const,
    sortable: true,
  },
  {
    name: 'remises',
    label: 'Remises',
    field: 'remises',
    align: 'center' as const,
    sortable: true,
  },
  {
    name: 'versements',
    label: 'Versements',
    field: 'versements',
    align: 'center' as const,
    sortable: true,
  },
  {
    name: 'taux',
    label: 'Taux Rotation',
    field: 'taux',
    align: 'center' as const,
    sortable: true,
  },
];

// Fonctions utilitaires
function formatMontant(montant: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    minimumFractionDigits: 0,
  }).format(montant);
}

function formatNumber(num: number): string {
  return new Intl.NumberFormat('fr-FR').format(num);
}

function getStockColor(stock: number): string {
  if (stock < 100) return 'negative';
  if (stock < 200) return 'warning';
  return 'positive';
}

function getTauxColor(taux: number): string {
  if (taux >= 70) return 'positive';
  if (taux >= 50) return 'warning';
  return 'negative';
}

// Fonctions d'export
function exportPDF() {
  $q.notify({
    type: 'info',
    message: 'Export PDF en cours de développement...',
  });
}

function exportExcel() {
  $q.notify({
    type: 'info',
    message: 'Export Excel en cours de développement...',
  });
}

// Gestion des périodes
function onPeriodChange() {
  const today = new Date();
  let debut = new Date();
  let fin = new Date();

  switch (periodFilter.value) {
    case 'jour':
      debut = new Date(today);
      fin = new Date(today);
      break;
    case 'semaine':
      debut = new Date(today.setDate(today.getDate() - today.getDay()));
      fin = new Date();
      break;
    case 'mois':
      debut = new Date(today.getFullYear(), today.getMonth(), 1);
      fin = new Date();
      break;
    case 'trimestre': {
      const quarter = Math.floor(today.getMonth() / 3);
      debut = new Date(today.getFullYear(), quarter * 3, 1);
      fin = new Date();
      break;
    }
    case 'annee':
      debut = new Date(today.getFullYear(), 0, 1);
      fin = new Date();
      break;
    default:
      return;
  }

  dateDebut.value = debut.toISOString().split('T')[0]!;
  dateFin.value = fin.toISOString().split('T')[0]!;

  void loadStatistics();
}

function resetFilters() {
  periodFilter.value = 'mois';
  onPeriodChange();
}

// Chargement des statistiques
async function loadStatistics() {
  loading.value = true;
  try {
    const mairieId = 1;
    const exercice = selectedYear.value;

    const [appros, remisesList, versementsList, balances] = await Promise.all([
      db.approvisionnements.where('exercice').equals(exercice).and(a => a.mairieId === mairieId).toArray(),
      db.remises.where('exercice').equals(exercice).and(r => r.mairieId === mairieId).toArray(),
      db.versements.where('exercice').equals(exercice).and(v => v.mairieId === mairieId).toArray(),
      db.balancesEntree.where('exercice').equals(exercice).and(b => b.mairieId === mairieId).toArray(),
    ]);

    approvisionnements.value = appros;
    remises.value = remisesList;
    versements.value = versementsList;
    balancesEntree.value = balances;
  } catch (error) {
    console.error('Erreur:', error);
    $q.notify({
      type: 'negative',
      message: 'Erreur lors du chargement des statistiques',
    });
  } finally {
    loading.value = false;
  }
}

// Générer les options d'années
async function generateYearOptions() {
  try {
    const years = new Set<number>();

    const [appros, remisesList, versementsList, balances] = await Promise.all([
      db.approvisionnements.toArray(),
      db.remises.toArray(),
      db.versements.toArray(),
      db.balancesEntree.toArray(),
    ]);

    appros.forEach((a) => years.add(a.exercice));
    remisesList.forEach((r) => years.add(r.exercice));
    versementsList.forEach((v) => years.add(v.exercice));
    balances.forEach((b) => years.add(b.exercice));

    years.add(currentYear);
    yearOptions.value = Array.from(years).sort((a, b) => b - a);
  } catch (error) {
    console.error('Erreur lors de la génération des années:', error);
    yearOptions.value = [currentYear];
  }
}

// Configuration des graphiques
const stockChartConfig = computed<ChartConfiguration>(() => ({
  type: 'doughnut',
  data: {
    labels: detailsTickets.value.map((t) => `${t.valeur} FCFA`),
    datasets: [
      {
        label: 'Stock',
        data: detailsTickets.value.map((t) => t.stock),
        backgroundColor: ['#42A5F5', '#66BB6A', '#FFA726', '#AB47BC', '#26C6DA', '#EF5350'],
      },
    ],
  },
  options: {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: { position: 'bottom' },
      tooltip: {
        callbacks: {
          label: function (context: TooltipItem<keyof ChartTypeRegistry>) {
            const label = context.label || '';
            const value = context.parsed || 0;
            return `${label}: ${formatNumber(value)} tickets`;
          },
        },
      },
    },
  },
}));

const valeurChartConfig = computed<ChartConfiguration>(() => ({
  type: 'bar',
  data: {
    labels: detailsTickets.value.map((t) => `${t.valeur} FCFA`),
    datasets: [
      {
        label: 'Valeur du stock',
        data: detailsTickets.value.map((t) => t.valeurStock),
        backgroundColor: '#66BB6A',
      },
    ],
  },
  options: {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: function (context: TooltipItem<keyof ChartTypeRegistry>) {
            const value = context.parsed.y || 0;
            return `Valeur: ${formatMontant(value)}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (tickValue: string | number) {
            return formatMontant(Number(tickValue));
          },
        },
      },
    },
  },
}));

const evolutionChartConfig = computed<ChartConfiguration>(() => {
  const labels = ['Janv', 'Févr', 'Mars', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sept', 'Oct', 'Nov', 'Déc'];
  const appData = new Array(12).fill(0);
  const remData = new Array(12).fill(0);
  const verData = new Array(12).fill(0);

  const process = (items: any[], target: number[]) => {
    items.forEach(item => {
      const d = new Date(item.date);
      if (d.getFullYear() === selectedYear.value) {
        target[d.getMonth()] += (item.total || 0);
      }
    });
  };

  process(approvisionnements.value, appData);
  process(remises.value, remData);
  process(versements.value, verData);

  return {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Approvisionnements',
          data: appData,
          borderColor: '#42A5F5',
          backgroundColor: 'rgba(66, 165, 245, 0.1)',
          tension: 0.4,
        },
        {
          label: 'Remises',
          data: remData,
          borderColor: '#FFA726',
          backgroundColor: 'rgba(255, 167, 38, 0.1)',
          tension: 0.4,
        },
        {
          label: 'Versements',
          data: verData,
          borderColor: '#AB47BC',
          backgroundColor: 'rgba(171, 71, 188, 0.1)',
          tension: 0.4,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: { position: 'bottom' },
        tooltip: {
          callbacks: {
            label: function (context: TooltipItem<keyof ChartTypeRegistry>) {
              const label = context.dataset.label || '';
              const value = context.parsed.y || 0;
              return `${label}: ${formatMontant(value)}`;
            },
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function (tickValue: string | number) {
              return formatMontant(Number(tickValue));
            },
          },
        },
      },
    },
  };
});

// Lifecycle hooks
onMounted(async () => {
  // Initialiser les dates par défaut
  onPeriodChange();
  // Générer les options d'années
  await generateYearOptions();
  // Charger les statistiques
  await loadStatistics();
});
</script>

<style scoped lang="scss">
.chart-container {
  position: relative;
  height: 300px;
}

.chart-container-large {
  position: relative;
  height: 400px;
}
</style>
