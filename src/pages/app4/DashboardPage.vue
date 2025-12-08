<template>
  <q-page class="q-pa-md">
    <div class="row q-col-gutter-md">
      <!-- En-tête avec titre et filtre -->
      <div class="col-12">
        <div class="row items-center justify-between q-mb-md">
          <div class="col">
            <div class="text-h4">
              <q-icon name="verified" color="purple" class="q-mr-sm" />
              Gestion des Timbres Fiscaux
            </div>
            <div class="text-subtitle1 text-grey-7">
              Suivi des approvisionnements, remises et versements de timbres
            </div>
          </div>
          <div class="col-auto">
            <q-select
              v-model="selectedYear"
              :options="yearOptions"
              label="Exercice"
              outlined
              dense
              style="min-width: 150px"
              @update:model-value="loadData"
            >
              <template v-slot:prepend>
                <q-icon name="event" />
              </template>
            </q-select>
          </div>
        </div>
      </div>

      <!-- Statistiques des stocks par quotité -->
      <div class="col-12">
        <q-card>
          <q-card-section>
            <div class="text-h6">Stock Actuel des Timbres</div>
            <div class="text-caption">Exercice {{ selectedYear }}</div>
          </q-card-section>
          <q-card-section>
            <q-inner-loading :showing="loading">
              <q-spinner-gears size="50px" color="purple" />
            </q-inner-loading>
            <div
              v-if="!loading && Object.keys(stockQuotites).length === 0"
              class="text-center q-pa-lg text-grey-6"
            >
              <q-icon name="inventory_2" size="64px" />
              <div class="text-h6 q-mt-md">Aucun stock disponible</div>
              <div class="text-caption">
                Créez une balance d'entrée ou un approvisionnement pour commencer
              </div>
            </div>
            <div v-else class="row q-col-gutter-md">
              <div
                class="col-12 col-sm-6 col-md-4 col-lg-3"
                v-for="(stock, code) in stockQuotites"
                :key="code"
              >
                <q-card flat bordered>
                  <q-card-section class="text-center">
                    <div class="text-h3 text-purple">{{ stock.quantite }}</div>
                    <div class="text-subtitle2 text-grey-7">{{ code }}</div>
                    <div class="text-caption text-grey-6">{{ stock.prix }} FCFA / unité</div>
                    <q-linear-progress
                      :value="stock.quantite / 500"
                      color="purple"
                      size="8px"
                      class="q-mt-sm"
                    />
                    <div class="text-caption text-grey-6 q-mt-xs">
                      Valeur: {{ formatMontant(stock.quantite * stock.prix) }}
                    </div>
                  </q-card-section>
                </q-card>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Statistiques globales -->
      <div class="col-12">
        <div class="row q-col-gutter-md">
          <div class="col-12 col-sm-6 col-md col-lg">
            <q-card class="stat-card" style="border-left: 4px solid #9c27b0">
              <q-card-section>
                <div class="row items-center">
                  <div class="col">
                    <div class="text-h6 text-grey-8">{{ stats.totalTimbres }}</div>
                    <div class="text-caption text-grey-6">Total Timbres</div>
                  </div>
                  <div class="col-auto">
                    <q-icon name="verified" size="48px" color="purple" style="opacity: 0.3" />
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>

          <div class="col-12 col-sm-6 col-md col-lg">
            <q-card class="stat-card" style="border-left: 4px solid #2e7d32">
              <q-card-section>
                <div class="row items-center">
                  <div class="col">
                    <div class="text-h6 text-grey-8">{{ formatMontant(stats.valeurTotale) }}</div>
                    <div class="text-caption text-grey-6">Valeur Totale</div>
                  </div>
                  <div class="col-auto">
                    <q-icon name="payments" size="48px" color="grey-7" style="opacity: 0.3" />
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>

          <div class="col-12 col-sm-6 col-md col-lg">
            <q-card class="stat-card" style="border-left: 4px solid #2e7d32">
              <q-card-section>
                <div class="row items-center">
                  <div class="col">
                    <div class="text-h6 text-grey-8">{{ stats.approsMois }}</div>
                    <div class="text-caption text-grey-6">Appros du Mois</div>
                    <div class="text-caption text-positive">+ Stock</div>
                  </div>
                  <div class="col-auto">
                    <q-icon name="add_box" size="48px" color="grey-7" style="opacity: 0.3" />
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>

          <div class="col-12 col-sm-6 col-md col-lg">
            <q-card class="stat-card" style="border-left: 4px solid #dc2626">
              <q-card-section>
                <div class="row items-center">
                  <div class="col">
                    <div class="text-h6 text-grey-8">{{ stats.remisesMois }}</div>
                    <div class="text-caption text-grey-6">Remises du Mois</div>
                    <div class="text-caption text-negative">- Stock</div>
                  </div>
                  <div class="col-auto">
                    <q-icon name="remove_circle" size="48px" color="grey-7" style="opacity: 0.3" />
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>

          <div class="col-12 col-sm-6 col-md col-lg">
            <q-card class="stat-card" style="border-left: 4px solid #9c27b0">
              <q-card-section>
                <div class="row items-center">
                  <div class="col">
                    <div class="text-h6 text-grey-8">{{ stats.versementsMois }}</div>
                    <div class="text-caption text-grey-6">Versements du Mois</div>
                    <div class="text-caption text-grey-7">Recettes</div>
                  </div>
                  <div class="col-auto">
                    <q-icon name="payments" size="48px" color="grey-7" style="opacity: 0.3" />
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </div>

      <!-- Accès rapide -->
      <div class="col-12">
        <q-card>
          <q-card-section>
            <div class="text-h6 q-mb-md">Accès Rapide</div>
            <div class="row q-col-gutter-md">
              <div class="col-12 col-sm-6 col-md col-lg">
                <q-btn
                  outline
                  color="positive"
                  class="full-width q-py-lg"
                  style="background: white; border-width: 2px"
                  stack
                  @click="navigateTo('/app4/approvisionnements')"
                >
                  <q-icon name="add_box" size="32px" class="q-mb-sm" />
                  <div class="text-caption text-weight-medium">Approvisionnement</div>
                  <div class="text-caption text-positive" style="font-size: 0.65rem">
                    + Augmente le stock
                  </div>
                </q-btn>
              </div>

              <div class="col-12 col-sm-6 col-md col-lg">
                <q-btn
                  outline
                  color="negative"
                  class="full-width q-py-lg"
                  style="background: white; border-width: 2px"
                  stack
                  @click="navigateTo('/app4/remises')"
                >
                  <q-icon name="remove_circle" size="32px" class="q-mb-sm" />
                  <div class="text-caption text-weight-medium">Remises</div>
                  <div class="text-caption text-negative" style="font-size: 0.65rem">
                    - Diminue le stock
                  </div>
                </q-btn>
              </div>

              <div class="col-12 col-sm-6 col-md col-lg">
                <q-btn
                  outline
                  color="purple"
                  class="full-width q-py-lg"
                  style="background: white; border-width: 2px"
                  stack
                  @click="navigateTo('/app4/versements')"
                >
                  <q-icon name="payments" size="32px" class="q-mb-sm" />
                  <div class="text-caption text-weight-medium">Versements</div>
                  <div class="text-caption text-grey-7" style="font-size: 0.65rem">
                    Recettes mairie
                  </div>
                </q-btn>
              </div>

              <div class="col-12 col-sm-6 col-md col-lg">
                <q-btn
                  outline
                  color="info"
                  class="full-width q-py-lg"
                  style="background: white; border-width: 2px"
                  stack
                  @click="navigateTo('/app4/balance-entree')"
                >
                  <q-icon name="balance" size="32px" class="q-mb-sm" />
                  <div class="text-caption text-weight-medium">Balance</div>
                  <div class="text-caption text-grey-6" style="font-size: 0.65rem">
                    État du stock
                  </div>
                </q-btn>
              </div>

              <div class="col-12 col-sm-6 col-md col-lg">
                <q-btn
                  outline
                  color="grey-7"
                  class="full-width q-py-lg"
                  style="background: white; border-width: 2px"
                  icon="bar_chart"
                  label="Statistiques"
                  stack
                  @click="navigateTo('/app4/statistiques')"
                />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Dernières opérations -->
      <div class="col-12">
        <q-card>
          <q-card-section>
            <div class="text-h6 q-mb-md">Dernières Opérations</div>
            <q-inner-loading :showing="loading">
              <q-spinner-gears size="50px" color="purple" />
            </q-inner-loading>
            <div
              v-if="!loading && dernieresOperations.length === 0"
              class="text-center q-pa-lg text-grey-6"
            >
              <q-icon name="history" size="64px" />
              <div class="text-h6 q-mt-md">Aucune opération</div>
              <div class="text-caption">Les opérations apparaîtront ici une fois créées</div>
            </div>
            <q-table
              v-else
              :rows="dernieresOperations"
              :columns="operationsColumns"
              row-key="id"
              :rows-per-page-options="[5, 10]"
              :loading="loading"
              flat
            >
              <template v-slot:body-cell-type="props">
                <q-td :props="props">
                  <q-badge :color="getTypeColor(props.row.type)" :label="props.row.type" />
                </q-td>
              </template>
              <template v-slot:body-cell-montant="props">
                <q-td :props="props">
                  {{ formatMontant(props.row.montant) }}
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
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { db, DEFAULT_MAIRIE_ID } from 'src/database/db';
import type {
  TimbreApprovisionnement,
  TimbreRemise,
  TimbreVersement,
  TimbreBalanceEntree,
  Quotite,
} from 'src/database/db';
import { useQuasar } from 'quasar';

const router = useRouter();
const $q = useQuasar();

const navigateTo = (path: string) => {
  void router.push(path);
};

interface StockQuotite {
  quantite: number;
  prix: number;
}

interface Operation {
  id: number;
  date: string;
  type: string;
  description: string;
  montant: number;
}

// Filtre par année
const currentYear = new Date().getFullYear();
const selectedYear = ref(currentYear);
const yearOptions = ref<number[]>([]);

// Données
const quotites = ref<Quotite[]>([]);
const stockQuotites = ref<Record<string, StockQuotite>>({});
const dernieresOperations = ref<Operation[]>([]);
const loading = ref(false);

const approvisionnements = ref<TimbreApprovisionnement[]>([]);
const remises = ref<TimbreRemise[]>([]);
const versements = ref<TimbreVersement[]>([]);
const balancesEntree = ref<TimbreBalanceEntree[]>([]);

// Calculer les statistiques
const stats = computed(() => {
  const totalTimbres = Object.values(stockQuotites.value).reduce((sum, s) => sum + s.quantite, 0);
  const valeurTotale = Object.values(stockQuotites.value).reduce(
    (sum, s) => sum + s.quantite * s.prix,
    0,
  );

  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYearVal = today.getFullYear();

  const approsMois = approvisionnements.value.filter((a) => {
    const date = new Date(a.date);
    return date.getMonth() === currentMonth && date.getFullYear() === currentYearVal;
  }).length;

  const remisesMois = remises.value.filter((r) => {
    const date = new Date(r.date);
    return date.getMonth() === currentMonth && date.getFullYear() === currentYearVal;
  }).length;

  const versementsMois = versements.value.filter((v) => {
    const date = new Date(v.date);
    return date.getMonth() === currentMonth && date.getFullYear() === currentYearVal;
  }).length;

  return {
    totalTimbres,
    valeurTotale,
    approsMois,
    remisesMois,
    versementsMois,
  };
});

const operationsColumns = [
  { name: 'date', label: 'Date', field: 'date', align: 'left' as const, sortable: true },
  { name: 'type', label: 'Type', field: 'type', align: 'left' as const, sortable: true },
  { name: 'description', label: 'Description', field: 'description', align: 'left' as const },
  { name: 'montant', label: 'Montant', field: 'montant', align: 'right' as const, sortable: true },
];

const formatMontant = (montant: number) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    minimumFractionDigits: 0,
  }).format(montant);
};

const getTypeColor = (type: string) => {
  const colors: Record<string, string> = {
    Approvisionnement: 'positive',
    Versement: 'purple',
    Remise: 'negative',
    'Balance Entree': 'info',
  };
  return colors[type] || 'grey';
};

// Calculer le stock actuel par quotité
const calculateStock = () => {
  const stock: Record<string, StockQuotite> = {};

  // Initialiser avec les quotités de type timbre
  quotites.value.forEach((q) => {
    if (q.isTimbre && q.actif) {
      stock[q.code] = { quantite: 0, prix: q.prix };
    }
  });

  // Ajouter les balances d'entrée
  balancesEntree.value.forEach((balance) => {
    if (balance.detailsQuotites) {
      Object.entries(balance.detailsQuotites).forEach(([code, qty]) => {
        if (stock[code]) {
          stock[code].quantite += qty;
        }
      });
    }
  });

  // Ajouter les approvisionnements
  approvisionnements.value.forEach((appro) => {
    if (appro.detailsQuotites) {
      Object.entries(appro.detailsQuotites).forEach(([code, qty]) => {
        if (stock[code]) {
          stock[code].quantite += qty;
        }
      });
    }
  });

  // Soustraire les remises
  remises.value.forEach((remise) => {
    if (remise.detailsQuotites) {
      Object.entries(remise.detailsQuotites).forEach(([code, qty]) => {
        if (stock[code]) {
          stock[code].quantite -= qty;
        }
      });
    }
  });

  stockQuotites.value = stock;
};

// Charger les dernières opérations
const loadDernieresOperations = () => {
  const operations: Operation[] = [];

  balancesEntree.value.forEach((balance) => {
    operations.push({
      id: balance.id!,
      date: new Date(balance.date).toLocaleString('fr-FR'),
      type: 'Balance Entree',
      description: balance.type || "Balance d'entrée",
      montant: balance.total,
    });
  });

  approvisionnements.value.forEach((appro) => {
    operations.push({
      id: appro.id!,
      date: new Date(appro.date).toLocaleString('fr-FR'),
      type: 'Approvisionnement',
      description: appro.type || 'Approvisionnement',
      montant: appro.total,
    });
  });

  remises.value.forEach((remise) => {
    operations.push({
      id: remise.id!,
      date: new Date(remise.date).toLocaleString('fr-FR'),
      type: 'Remise',
      description: `Remise ${remise.numeroRemise}`,
      montant: remise.total,
    });
  });

  versements.value.forEach((versement) => {
    operations.push({
      id: versement.id!,
      date: new Date(versement.date).toLocaleString('fr-FR'),
      type: 'Versement',
      description: `Versement ${versement.numeroVersement}`,
      montant: versement.total,
    });
  });

  operations.sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return dateB.getTime() - dateA.getTime();
  });

  dernieresOperations.value = operations.slice(0, 10);
};

// Charger les données
const loadData = async () => {
  loading.value = true;
  try {
    const exercice = selectedYear.value;

    // Charger les quotités de type timbre
    quotites.value = await db.quotites
      .where('isTimbre')
      .equals(1) // Dexie stocke les booléens comme 0/1
      .and((q) => q.mairieId === DEFAULT_MAIRIE_ID && q.actif)
      .toArray();

    // Si pas de résultats avec l'index, charger tout et filtrer
    if (quotites.value.length === 0) {
      quotites.value = (await db.quotites.toArray()).filter(
        (q) => q.isTimbre && q.actif && q.mairieId === DEFAULT_MAIRIE_ID,
      );
    }

    const [appros, remisesList, versementsList, balances] = await Promise.all([
      db.timbreApprovisionnements
        .where('exercice')
        .equals(exercice)
        .and((a) => a.mairieId === DEFAULT_MAIRIE_ID)
        .toArray(),
      db.timbreRemises
        .where('exercice')
        .equals(exercice)
        .and((r) => r.mairieId === DEFAULT_MAIRIE_ID)
        .toArray(),
      db.timbreVersements
        .where('exercice')
        .equals(exercice)
        .and((v) => v.mairieId === DEFAULT_MAIRIE_ID)
        .toArray(),
      db.timbreBalancesEntree
        .where('exercice')
        .equals(exercice)
        .and((b) => b.mairieId === DEFAULT_MAIRIE_ID)
        .toArray(),
    ]);

    approvisionnements.value = appros;
    remises.value = remisesList;
    versements.value = versementsList;
    balancesEntree.value = balances;

    calculateStock();
    loadDernieresOperations();
  } catch (error) {
    console.error('Erreur lors du chargement des données:', error);
    $q.notify({
      type: 'negative',
      message: 'Erreur lors du chargement des données',
    });
  } finally {
    loading.value = false;
  }
};

const generateYearOptions = async () => {
  try {
    const years = new Set<number>();

    const [appros, remisesList, versementsList, balances] = await Promise.all([
      db.timbreApprovisionnements.toArray(),
      db.timbreRemises.toArray(),
      db.timbreVersements.toArray(),
      db.timbreBalancesEntree.toArray(),
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
};

onMounted(async () => {
  await generateYearOptions();
  await loadData();
});
</script>

<style scoped lang="scss">
.stat-card {
  transition: transform 0.2s;
  &:hover {
    transform: translateY(-2px);
  }
}
</style>
