<template>
  <q-page class="q-pa-md">
    <div class="row q-col-gutter-md">
      <!-- En-tête avec titre et filtre -->
      <div class="col-12">
        <div class="row items-center justify-between q-mb-md">
          <div class="col">
            <div class="text-h4">Gestion des Stocks de Timbres Fiscaux</div>
            <div class="text-subtitle1 text-grey-7">
              Suivi des approvisionnements, remises et versements
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

      <!-- Statistiques des stocks par valeur -->
      <div class="col-12">
        <q-card>
          <q-card-section class="bg-primary text-white">
            <div class="text-h6">Stock Actuel des Timbres</div>
            <div class="text-caption">Exercice {{ selectedYear }}</div>
          </q-card-section>
          <q-card-section>
            <q-inner-loading :showing="loading">
              <q-spinner-gears size="50px" color="primary" />
            </q-inner-loading>
            <div
              v-if="!loading && stats.totalTimbres === 0"
              class="text-center q-pa-lg text-grey-6"
            >
              <q-icon name="inventory_2" size="64px" />
              <div class="text-h6 q-mt-md">Aucun stock disponible</div>
              <div class="text-caption">
                Créez une balance d'entrée ou un approvisionnement pour commencer
              </div>
            </div>
            <div v-else class="row q-col-gutter-md">
              <div class="col-12 col-sm-6 col-md-4" v-for="timbre in timbres" :key="timbre.valeur">
                <q-card flat bordered>
                  <q-card-section class="text-center">
                    <div class="text-h3 text-primary">{{ timbre.stock }}</div>
                    <div class="text-h6 text-grey-7">{{ timbre.valeur }} FCFA</div>
                    <q-linear-progress
                      :value="timbre.stock / 1000"
                      :color="getStockColor(timbre.stock)"
                      size="8px"
                      class="q-mt-sm"
                    />
                    <div class="text-caption text-grey-6 q-mt-xs">
                      Valeur totale: {{ formatMontant(timbre.stock * timbre.valeur) }}
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
            <q-card class="stat-card" style="border-left: 4px solid #2196f3">
              <q-card-section>
                <div class="row items-center">
                  <div class="col">
                    <div class="text-h6 text-grey-8">{{ stats.totalTimbres }}</div>
                    <div class="text-caption text-grey-6">Total Timbres</div>
                  </div>
                  <div class="col-auto">
                    <q-icon
                      name="confirmation_number"
                      size="48px"
                      color="blue"
                      style="opacity: 0.3"
                    />
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>

          <div class="col-12 col-sm-6 col-md col-lg">
            <q-card class="stat-card" style="border-left: 4px solid #4caf50">
              <q-card-section>
                <div class="row items-center">
                  <div class="col">
                    <div class="text-h6 text-grey-8">{{ formatMontant(stats.valeurTotale) }}</div>
                    <div class="text-caption text-grey-6">Valeur Totale</div>
                  </div>
                  <div class="col-auto">
                    <q-icon name="payments" size="48px" color="green" style="opacity: 0.3" />
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>

          <div class="col-12 col-sm-6 col-md col-lg">
            <q-card class="stat-card" style="border-left: 4px solid #4caf50">
              <q-card-section>
                <div class="row items-center">
                  <div class="col">
                    <div class="text-h6 text-grey-8">{{ stats.approsMois }}</div>
                    <div class="text-caption text-grey-6">Appros du Mois</div>
                    <div class="text-caption text-positive">+ Stock</div>
                  </div>
                  <div class="col-auto">
                    <q-icon name="add_box" size="48px" color="green" style="opacity: 0.3" />
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>

          <div class="col-12 col-sm-6 col-md col-lg">
            <q-card class="stat-card" style="border-left: 4px solid #f44336">
              <q-card-section>
                <div class="row items-center">
                  <div class="col">
                    <div class="text-h6 text-grey-8">{{ stats.remisesMois }}</div>
                    <div class="text-caption text-grey-6">Remises du Mois</div>
                    <div class="text-caption text-negative">- Stock</div>
                  </div>
                  <div class="col-auto">
                    <q-icon name="remove_circle" size="48px" color="red" style="opacity: 0.3" />
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>

          <div class="col-12 col-sm-6 col-md col-lg">
            <q-card class="stat-card" style="border-left: 4px solid #2196f3">
              <q-card-section>
                <div class="row items-center">
                  <div class="col">
                    <div class="text-h6 text-grey-8">{{ stats.versementsMois }}</div>
                    <div class="text-caption text-grey-6">Versements du Mois</div>
                    <div class="text-caption text-grey-7">Recettes</div>
                  </div>
                  <div class="col-auto">
                    <q-icon name="payments" size="48px" color="primary" style="opacity: 0.3" />
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
                  @click="navigateTo('/app2/approvisionnements')"
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
                  @click="navigateTo('/app2/remises')"
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
                  color="primary"
                  class="full-width q-py-lg"
                  style="background: white; border-width: 2px"
                  stack
                  @click="navigateTo('/app2/versements')"
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
                  @click="navigateTo('/app2/balance-entree')"
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
                  color="deep-purple"
                  class="full-width q-py-lg"
                  style="background: white; border-width: 2px"
                  icon="bar_chart"
                  label="Statistiques"
                  stack
                  @click="navigateTo('/app2/statistiques')"
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
              <q-spinner-gears size="50px" color="primary" />
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
import { db } from 'src/database/db';
import type { Approvisionnement, Remise, Versement, BalanceEntree } from 'src/database/db';
import { useQuasar } from 'quasar';

const router = useRouter();
const $q = useQuasar();

const navigateTo = (path: string) => {
  void router.push(path);
};

interface Timbre {
  valeur: number;
  stock: number;
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
const timbres = ref<Timbre[]>([
  { valeur: 100, stock: 0 },
  { valeur: 200, stock: 0 },
  { valeur: 300, stock: 0 },
  { valeur: 500, stock: 0 },
  { valeur: 600, stock: 0 },
  { valeur: 1000, stock: 0 },
]);

const dernieresOperations = ref<Operation[]>([]);
const loading = ref(false);

const approvisionnements = ref<Approvisionnement[]>([]);
const remises = ref<Remise[]>([]);
const versements = ref<Versement[]>([]);
const balanceEntree = ref<BalanceEntree | null>(null);

// Calculer les statistiques
const stats = computed(() => {
  const totalTimbres = timbres.value.reduce((sum, t) => sum + t.stock, 0);
  const valeurTotale = timbres.value.reduce((sum, t) => sum + t.stock * t.valeur, 0);

  // Compter les opérations du mois en cours
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  const approsMois = approvisionnements.value.filter((a) => {
    const date = new Date(a.date);
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
  }).length;

  const remisesMois = remises.value.filter((r) => {
    const date = new Date(r.date);
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
  }).length;

  const versementsMois = versements.value.filter((v) => {
    const date = new Date(v.date);
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
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

const getStockColor = (stock: number) => {
  if (stock < 100) return 'negative';
  if (stock < 200) return 'warning';
  return 'positive';
};

const getTypeColor = (type: string) => {
  const colors: Record<string, string> = {
    Approvisionnement: 'positive',
    Versement: 'primary',
    Remise: 'negative',
    'Balance Entree': 'info',
  };
  return colors[type] || 'grey';
};

// Calculer le stock actuel
const calculateStock = () => {
  const valeursTimbre: (100 | 200 | 300 | 500 | 600 | 1000)[] = [100, 200, 300, 500, 600, 1000];
  const stockActuel: Record<number, number> = {};

  // Initialiser à zéro
  valeursTimbre.forEach((valeur) => {
    stockActuel[valeur] = 0;
  });

  // 1. Ajouter la balance d'entrée si elle existe
  if (balanceEntree.value?.timbres) {
    valeursTimbre.forEach((valeur) => {
      stockActuel[valeur] =
        (stockActuel[valeur] ?? 0) + (balanceEntree.value?.timbres[valeur] || 0);
    });
  }

  // 2. Ajouter les approvisionnements
  approvisionnements.value.forEach((appro) => {
    if (appro?.timbres) {
      valeursTimbre.forEach((valeur) => {
        stockActuel[valeur] = (stockActuel[valeur] ?? 0) + (appro.timbres[valeur] || 0);
      });
    }
  });

  // 3. Soustraire les remises
  remises.value.forEach((remise) => {
    if (remise?.timbres) {
      valeursTimbre.forEach((valeur) => {
        stockActuel[valeur] = (stockActuel[valeur] ?? 0) - (remise.timbres[valeur] || 0);
      });
    }
  });

  // 4. Soustraire les versements
  versements.value.forEach((versement) => {
    if (versement?.timbres) {
      valeursTimbre.forEach((valeur) => {
        stockActuel[valeur] = (stockActuel[valeur] ?? 0) - (versement.timbres[valeur] || 0);
      });
    }
  });

  // Mettre à jour l'affichage
  timbres.value = valeursTimbre.map((valeur) => ({
    valeur,
    stock: stockActuel[valeur] || 0,
  }));
};

// Charger les dernières opérations
const loadDernieresOperations = () => {
  const operations: Operation[] = [];

  // Ajouter la balance d'entrée
  if (balanceEntree.value) {
    operations.push({
      id: balanceEntree.value.id!,
      date: new Date(balanceEntree.value.date).toLocaleString('fr-FR'),
      type: 'Balance Entree',
      description: balanceEntree.value.type || "Balance d'entrée",
      montant: balanceEntree.value.total,
    });
  }

  // Ajouter les approvisionnements
  approvisionnements.value.forEach((appro) => {
    operations.push({
      id: appro.id!,
      date: new Date(appro.date).toLocaleString('fr-FR'),
      type: 'Approvisionnement',
      description: appro.type || 'Approvisionnement',
      montant: appro.total,
    });
  });

  // Ajouter les remises
  remises.value.forEach((remise) => {
    operations.push({
      id: remise.id!,
      date: new Date(remise.date).toLocaleString('fr-FR'),
      type: 'Remise',
      description: `Remise ${remise.numeroRemise}`,
      montant: remise.total,
    });
  });

  // Ajouter les versements
  versements.value.forEach((versement) => {
    operations.push({
      id: versement.id!,
      date: new Date(versement.date).toLocaleString('fr-FR'),
      type: 'Versement',
      description: `Versement ${versement.numeroVersement}`,
      montant: versement.total,
    });
  });

  // Trier par date (plus récentes en premier)
  operations.sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return dateB.getTime() - dateA.getTime();
  });

  // Garder seulement les 10 dernières
  dernieresOperations.value = operations.slice(0, 10);
};

// Charger les données depuis la base de données
const loadData = async () => {
  loading.value = true;
  try {
    const mairieId = 1; // À adapter selon l'utilisateur connecté
    const exercice = selectedYear.value;

    // Charger toutes les données pour l'exercice sélectionné
    const [appros, remisesList, versementsList, balance] = await Promise.all([
      db.approvisionnements
        .where('exercice')
        .equals(exercice)
        .and((a) => a.mairieId === mairieId)
        .toArray(),
      db.remises
        .where('exercice')
        .equals(exercice)
        .and((r) => r.mairieId === mairieId)
        .toArray(),
      db.versements
        .where('exercice')
        .equals(exercice)
        .and((v) => v.mairieId === mairieId)
        .toArray(),
      db.balancesEntree
        .where('exercice')
        .equals(exercice)
        .and((b) => b.mairieId === mairieId)
        .first(),
    ]);

    approvisionnements.value = appros;
    remises.value = remisesList;
    versements.value = versementsList;
    balanceEntree.value = balance ?? null;

    // Calculer le stock actuel
    calculateStock();

    // Charger les dernières opérations
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

// Générer les options d'années
const generateYearOptions = async () => {
  try {
    // Récupérer les années disponibles dans la base de données
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

    // Ajouter l'année courante si elle n'existe pas
    years.add(currentYear);

    // Convertir en tableau et trier
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
