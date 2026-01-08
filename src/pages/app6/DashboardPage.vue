<template>
  <q-page class="dashboard-page q-pa-md">
    <PageHeader
      title="Tableau de Bord - Recettes"
      subtitle="Vue d'ensemble de la gestion des recettes"
      icon="payments"
      style="margin-left: 15px !important"
    />

    <div class="row q-col-gutter-md">
      <!-- Cartes de statistiques -->
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
              <div
                class="col-6 col-sm-4 col-md-3"
                v-for="(action, index) in quickActions"
                :key="index"
              >
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

      <!-- Déclarations récentes -->
      <div class="col-12 col-md-6 fade-in" style="animation-delay: 0.5s">
        <q-card class="activity-card">
          <q-card-section>
            <div class="section-header q-mb-md">
              <div class="flex items-center">
                <q-icon name="schedule" color="primary" size="24px" class="q-mr-sm" />
                <span class="text-h6 text-weight-bold">Déclarations Récentes</span>
              </div>
              <div class="section-decoration"></div>
            </div>

            <q-list separator class="activity-list">
              <q-item
                v-for="(decl, index) in recentDeclarations"
                :key="decl.id || 0"
                class="activity-item"
                :style="{ animationDelay: `${index * 0.1}s` }"
              >
                <q-item-section avatar>
                  <q-avatar color="primary" text-color="white" class="pulse-soft">
                    <q-icon name="description" />
                  </q-avatar>
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-medium">{{ decl.numeroPiece }}</q-item-label>
                  <q-item-label caption class="text-grey-6">
                    <q-icon name="event" size="14px" class="q-mr-xs" />
                    {{ formatDate(decl.dateEncaissement) }}
                  </q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-chip
                    :color="getStatutColor(decl.statut)"
                    text-color="white"
                    size="sm"
                    class="status-chip"
                  >
                    {{ decl.statut }}
                  </q-chip>
                </q-item-section>
              </q-item>

              <q-item v-if="recentDeclarations.length === 0" class="empty-state">
                <q-item-section class="text-center">
                  <q-icon name="inbox" size="48px" color="grey-4" class="q-mb-sm" />
                  <div class="text-grey-5 q-mb-sm">Aucune déclaration récente</div>
                  <q-btn
                    flat
                    dense
                    color="primary"
                    label="Nouvelle déclaration"
                    icon="add"
                    size="sm"
                    @click="$router.push('/recettes/declarations')"
                  />
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
              @click="$router.push('/recettes/declarations')"
              class="view-all-btn"
            />
          </q-card-actions>
        </q-card>
      </div>

      <!-- Bordereaux ouverts -->
      <div class="col-12 col-md-6 fade-in" style="animation-delay: 0.6s">
        <q-card class="activity-card">
          <q-card-section>
            <div class="section-header q-mb-md">
              <div class="flex items-center">
                <q-icon name="folder_open" color="warning" size="24px" class="q-mr-sm" />
                <span class="text-h6 text-weight-bold">Bordereaux Ouverts</span>
              </div>
              <div class="section-decoration"></div>
            </div>

            <q-list separator class="activity-list">
              <q-item
                v-for="(bordereau, index) in openBordereaux"
                :key="bordereau.id || 0"
                class="activity-item"
                :style="{ animationDelay: `${index * 0.1}s` }"
              >
                <q-item-section avatar>
                  <q-avatar color="warning" text-color="white" class="pulse-soft">
                    <q-icon name="receipt_long" />
                  </q-avatar>
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-medium">
                    {{ formatNumeroBordereau(bordereau.numero, bordereau.annee) }}
                  </q-item-label>
                  <q-item-label caption class="text-grey-6">
                    <q-icon name="description" size="14px" class="q-mr-xs" />
                    {{ bordereau.nombreDeclarations }} déclarations
                  </q-item-label>
                </q-item-section>
                <q-item-section side>
                  <div class="amount-badge">
                    {{ formatMontant(bordereau.montantTotal) }}
                  </div>
                </q-item-section>
              </q-item>

              <q-item v-if="openBordereaux.length === 0" class="empty-state">
                <q-item-section class="text-center">
                  <q-icon name="inbox" size="48px" color="grey-4" class="q-mb-sm" />
                  <div class="text-grey-5 q-mb-sm">Aucun bordereau ouvert</div>
                  <q-btn
                    flat
                    dense
                    color="primary"
                    label="Nouveau bordereau"
                    icon="add"
                    size="sm"
                    @click="$router.push('/recettes/bordereaux')"
                  />
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
              @click="$router.push('/recettes/bordereaux')"
              class="view-all-btn"
            />
          </q-card-actions>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { db, type Declaration, type BordereauRecette } from 'src/database/db';
import { date } from 'quasar';
import PageHeader from 'src/components/PageHeader.vue';

const stats = ref({
  totalTaxes: 0,
  totalDeclarations: 0,
  totalBordereaux: 0,
  montantTotal: 0,
});

const recentDeclarations = ref<Declaration[]>([]);
const openBordereaux = ref<BordereauRecette[]>([]);

// Cartes de statistiques avec animations
const statsCards = computed(() => [
  {
    value: stats.value.totalTaxes,
    label: 'Taxes / Recettes',
    icon: 'category',
    color: 'primary',
    progress: 0.75,
  },
  {
    value: stats.value.totalDeclarations,
    label: 'Déclarations',
    icon: 'description',
    color: 'secondary',
    progress: 0.85,
  },
  {
    value: stats.value.totalBordereaux,
    label: 'Bordereaux',
    icon: 'receipt_long',
    color: 'warning',
    progress: 0.6,
  },
  {
    value: formatMontant(stats.value.montantTotal),
    label: 'Montant Total (CFA)',
    icon: 'payments',
    color: 'dark',
    progress: 0.9,
  },
]);

// Actions rapides
const quickActions = [
  {
    label: 'Déclarations',
    icon: 'description',
    color: 'positive',
    route: '/app6/declarations',
  },
  { label: 'Bordereaux', icon: 'receipt_long', color: 'warning', route: '/app6/bordereaux' },
  { label: 'Prévisions', icon: 'trending_up', color: 'secondary', route: '/app6/previsions' },
  { label: 'Taxes', icon: 'account_balance', color: 'primary', route: '/app6/taxes' },
  { label: 'Statistiques', icon: 'bar_chart', color: 'dark', route: '/app6/statistiques' },
];

function formatMontant(montant: number): string {
  return new Intl.NumberFormat('fr-FR', {
    // style: 'currency',
    // currency: 'XOF',
    minimumFractionDigits: 0,
  }).format(montant);
}

function formatDate(dateValue: Date | undefined): string {
  if (!dateValue) return '-';
  return date.formatDate(dateValue, 'DD/MM/YYYY');
}

function formatNumeroBordereau(numero: number, annee: number): string {
  const anneeShort = annee % 100;
  return `${numero}-${anneeShort.toString().padStart(2, '0')}`;
}

function getStatutColor(statut: string): string {
  const colors: Record<string, string> = {
    brouillon: 'grey',
    validee: 'primary',
    payee: 'secondary',
    annulee: 'negative',
  };
  return colors[statut] || 'grey';
}

async function loadStats() {
  try {
    stats.value.totalTaxes = await db.taxes.count();
    stats.value.totalDeclarations = await db.declarations.count();
    stats.value.totalBordereaux = await db.bordereauxRecette.count();

    const declarations = await db.declarations.toArray();
    stats.value.montantTotal = declarations.reduce(
      (sum, d) => sum + (d.montantRecette || d.montant || 0),
      0,
    );

    // Déclarations récentes (triées par date)
    const allDeclarations = await db.declarations.toArray();
    allDeclarations.sort((a, b) => {
      const dateA = a.dateEncaissement ? new Date(a.dateEncaissement).getTime() : 0;
      const dateB = b.dateEncaissement ? new Date(b.dateEncaissement).getTime() : 0;
      return dateB - dateA;
    });
    recentDeclarations.value = allDeclarations.slice(0, 5);

    openBordereaux.value = await db.bordereauxRecette
      .where('statut')
      .equals('ouvert')
      .limit(5)
      .toArray();

    console.log('Déclarations récentes:', recentDeclarations.value.length);
    console.log('Bordereaux ouverts:', openBordereaux.value.length);
  } catch (error) {
    console.error('Erreur lors du chargement des statistiques:', error);
  }
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

// En-tête de page
.page-header {
  margin-bottom: 24px;

  h1 {
    margin: 0;
  }
}

.gradient-text {
  background: linear-gradient(135deg, #e67e22 0%, #2e7d32 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
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

// Accès rapide
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

// Cartes d'activité
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
    background-color: rgba(230, 126, 34, 0.05);
    transform: translateX(8px);
  }
}

.pulse-soft {
  animation: pulseSoft 3s ease-in-out infinite;
}

@keyframes pulseSoft {
  0%,
  100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(46, 125, 50, 0.4);
  }
  50% {
    transform: scale(1.05);
    box-shadow: 0 0 0 8px rgba(46, 125, 50, 0);
  }
}

.status-chip {
  font-weight: 600;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.amount-badge {
  background: linear-gradient(135deg, #e67e22 0%, #2e7d32 100%);
  color: white;
  padding: 8px 12px;
  border-radius: 8px;
  font-weight: 700;
  font-size: 0.875rem;
  box-shadow: 0 2px 8px rgba(230, 126, 34, 0.3);
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

// En-tête de section
.section-header {
  position: relative;

  .section-decoration {
    height: 3px;
    background: linear-gradient(90deg, #e67e22 0%, transparent 100%);
    border-radius: 2px;
    margin-top: 8px;
  }
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

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
}

.fade-in {
  animation: fadeIn 0.6s ease-out both;
}

// Responsive
@media (max-width: 1024px) {
  .stat-value {
    font-size: 1.75rem;
  }

  .stat-icon {
    font-size: 40px;
  }
}

@media (max-width: 600px) {
  .stat-value {
    font-size: 1.5rem;
  }

  .stat-icon {
    font-size: 36px;
  }

  .quick-action-btn {
    min-height: 80px;
    padding: 16px 8px;
  }

  .amount-badge {
    font-size: 0.75rem;
    padding: 6px 10px;
  }
}
</style>
