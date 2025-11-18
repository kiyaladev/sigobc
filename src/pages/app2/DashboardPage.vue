<template>
  <q-page class="q-pa-md">
    <div class="row q-col-gutter-md">
      <!-- En-tête avec titre -->
      <div class="col-12">
        <div class="text-h4 q-mb-md">Gestion des Stocks de Timbres Fiscaux</div>
        <div class="text-subtitle1 text-grey-7 q-mb-md">
          Suivi des approvisionnements, remises et versements
        </div>
      </div>

      <!-- Statistiques des stocks par valeur -->
      <div class="col-12">
        <q-card>
          <q-card-section class="bg-primary text-white">
            <div class="text-h6">Stock Actuel des Timbres</div>
          </q-card-section>
          <q-card-section>
            <div class="row q-col-gutter-md">
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
          <div class="col-12 col-sm-6 col-md-3">
            <q-card class="stat-card" style="border-left: 4px solid var(--q-blue)">
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

          <div class="col-12 col-sm-6 col-md-3">
            <q-card class="stat-card" style="border-left: 4px solid var(--q-green)">
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

          <div class="col-12 col-sm-6 col-md-3">
            <q-card class="stat-card" style="border-left: 4px solid var(--q-orange)">
              <q-card-section>
                <div class="row items-center">
                  <div class="col">
                    <div class="text-h6 text-grey-8">{{ stats.remisesJour }}</div>
                    <div class="text-caption text-grey-6">Remises Aujourd'hui</div>
                    <div class="text-caption text-positive">+ Stock</div>
                  </div>
                  <div class="col-auto">
                    <q-icon name="add_box" size="48px" color="orange" style="opacity: 0.3" />
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>

          <div class="col-12 col-sm-6 col-md-3">
            <q-card class="stat-card" style="border-left: 4px solid var(--q-purple)">
              <q-card-section>
                <div class="row items-center">
                  <div class="col">
                    <div class="text-h6 text-grey-8">{{ stats.versementsJour }}</div>
                    <div class="text-caption text-grey-6">Versements Aujourd'hui</div>
                    <div class="text-caption text-negative">- Stock</div>
                  </div>
                  <div class="col-auto">
                    <q-icon name="remove_circle" size="48px" color="purple" style="opacity: 0.3" />
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
              <div class="col-6 col-sm-4 col-md-3">
                <q-btn
                  outline
                  color="primary"
                  class="full-width q-py-lg"
                  style="background: white; border-width: 2px"
                  stack
                  @click="$router.push('/app2/approvisionnements')"
                >
                  <q-icon name="inventory_2" size="32px" class="q-mb-sm" />
                  <div class="text-caption text-weight-medium">Approvisionnement</div>
                  <div class="text-caption text-grey-6" style="font-size: 0.65rem">
                    Stock initial annuel
                  </div>
                </q-btn>
              </div>

              <div class="col-6 col-sm-4 col-md-3">
                <q-btn
                  outline
                  color="positive"
                  class="full-width q-py-lg"
                  style="background: white; border-width: 2px"
                  stack
                  @click="$router.push('/app2/remises')"
                >
                  <q-icon name="add_box" size="32px" class="q-mb-sm" />
                  <div class="text-caption text-weight-medium">Remises</div>
                  <div class="text-caption text-positive" style="font-size: 0.65rem">
                    + Augmente le stock
                  </div>
                </q-btn>
              </div>

              <div class="col-6 col-sm-4 col-md-3">
                <q-btn
                  outline
                  color="negative"
                  class="full-width q-py-lg"
                  style="background: white; border-width: 2px"
                  stack
                  @click="$router.push('/app2/versements')"
                >
                  <q-icon name="remove_circle" size="32px" class="q-mb-sm" />
                  <div class="text-caption text-weight-medium">Versements</div>
                  <div class="text-caption text-negative" style="font-size: 0.65rem">
                    - Diminue le stock
                  </div>
                </q-btn>
              </div>

              <div class="col-6 col-sm-4 col-md-3">
                <q-btn
                  outline
                  color="info"
                  class="full-width q-py-lg"
                  style="background: white; border-width: 2px"
                  stack
                  @click="$router.push('/app2/balance-entree')"
                >
                  <q-icon name="balance" size="32px" class="q-mb-sm" />
                  <div class="text-caption text-weight-medium">Balance</div>
                  <div class="text-caption text-grey-6" style="font-size: 0.65rem">
                    État du stock
                  </div>
                </q-btn>
              </div>

              <div class="col-6 col-sm-4 col-md-3">
                <q-btn
                  outline
                  color="deep-purple"
                  class="full-width q-py-lg"
                  style="background: white; border-width: 2px"
                  icon="bar_chart"
                  label="Statistiques"
                  stack
                  @click="$router.push('/app2/statistiques')"
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
            <q-table
              :rows="dernieresOperations"
              :columns="operationsColumns"
              row-key="id"
              :rows-per-page-options="[5]"
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

const timbres = ref<Timbre[]>([
  { valeur: 100, stock: 450 },
  { valeur: 200, stock: 320 },
  { valeur: 300, stock: 280 },
  { valeur: 500, stock: 150 },
  { valeur: 600, stock: 180 },
  { valeur: 1000, stock: 95 },
]);

const dernieresOperations = ref<Operation[]>([
  {
    id: 1,
    date: '2025-11-07 10:30',
    type: 'Approvisionnement',
    description: 'Approvisionnement timbres 100 FCFA',
    montant: 50000,
  },
  {
    id: 2,
    date: '2025-11-07 09:15',
    type: 'Versement',
    description: 'Versement journalier',
    montant: 125000,
  },
  {
    id: 3,
    date: '2025-11-06 16:45',
    type: 'Remise',
    description: 'Remise timbres 500 FCFA',
    montant: 75000,
  },
  {
    id: 4,
    date: '2025-11-06 14:20',
    type: 'Approvisionnement',
    description: 'Approvisionnement timbres 1000 FCFA',
    montant: 100000,
  },
  {
    id: 5,
    date: '2025-11-06 11:30',
    type: 'Balance Entrée',
    description: "Balance d'entrée du jour",
    montant: 0,
  },
]);

const stats = computed(() => {
  const totalTimbres = timbres.value.reduce((sum, t) => sum + t.stock, 0);
  const valeurTotale = timbres.value.reduce((sum, t) => sum + t.stock * t.valeur, 0);

  return {
    totalTimbres,
    valeurTotale,
    remisesJour: 3,
    versementsJour: 2,
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
    Approvisionnement: 'primary',
    Versement: 'positive',
    Remise: 'secondary',
    'Balance Entrée': 'info',
  };
  return colors[type] || 'grey';
};

onMounted(() => {
  // Charger les données depuis la base de données
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
