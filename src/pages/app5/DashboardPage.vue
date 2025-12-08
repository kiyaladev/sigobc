<template>
  <q-page class="dashboard-page q-pa-md">
    <PageHeader
      title="Tableau de Bord - Investissements"
      subtitle="Vue d'ensemble de la gestion des investissements"
      icon="dashboard"
    />

    <!-- Cartes de statistiques -->
    <div class="row q-col-gutter-md q-mb-md">
      <div class="col-12 col-sm-6 col-md-3">
        <StatisticsCard
          :value="stats.budgetTotal"
          title="Budget Total"
          subtitle="Prévisions d'investissement"
          icon="account_balance_wallet"
          icon-color="grey-7"
          border-color="#009688"
          format="currency"
        />
      </div>
      <div class="col-12 col-sm-6 col-md-3">
        <StatisticsCard
          :value="stats.montantEngage"
          title="Montant Engagé"
          :subtitle="`${stats.tauxExecution}% exécuté`"
          icon="receipt_long"
          icon-color="grey-7"
          border-color="#00796B"
          format="currency"
        />
      </div>
      <div class="col-12 col-sm-6 col-md-3">
        <StatisticsCard
          :value="stats.nombreMandats"
          title="Mandats"
          :subtitle="`${stats.mandatsPayes} payés`"
          icon="receipt"
          icon-color="grey-7"
          border-color="#26A69A"
        />
      </div>
      <div class="col-12 col-sm-6 col-md-3">
        <StatisticsCard
          :value="stats.nombreBordereaux"
          title="Bordereaux"
          :subtitle="`${stats.bordereauOuverts} ouverts`"
          icon="folder_open"
          icon-color="grey-7"
          border-color="#4DB6AC"
        />
      </div>
    </div>

    <!-- Deuxième ligne de statistiques -->
    <div class="row q-col-gutter-md q-mb-md">
      <div class="col-12 col-sm-6 col-md-3">
        <StatisticsCard
          :value="stats.nombreChapitres"
          title="Chapitres"
          subtitle="Chapitres budgétaires"
          icon="category"
          icon-color="grey-7"
          border-color="#80CBC4"
        />
      </div>
      <div class="col-12 col-sm-6 col-md-3">
        <StatisticsCard
          :value="stats.nombreSousChapitres"
          title="Sous-Chapitres"
          subtitle="Comptes budgétaires"
          icon="view_list"
          icon-color="grey-7"
          border-color="#B2DFDB"
        />
      </div>
      <div class="col-12 col-sm-6 col-md-3">
        <StatisticsCard
          :value="stats.montantDisponible"
          title="Budget Disponible"
          :subtitle="`${100 - stats.tauxExecution}% restant`"
          icon="savings"
          icon-color="grey-7"
          border-color="#00897B"
          format="currency"
        />
      </div>
      <div class="col-12 col-sm-6 col-md-3">
        <StatisticsCard
          :value="stats.nombrePrevisions"
          title="Prévisions"
          subtitle="Lignes budgétaires"
          icon="pie_chart"
          icon-color="grey-7"
          border-color="#009688"
        />
      </div>
    </div>

    <!-- Contenu principal -->
    <div class="row q-col-gutter-md">
      <q-inner-loading :showing="loading">
        <q-spinner-gears size="50px" color="teal" />
      </q-inner-loading>

      <!-- Derniers mandats -->
      <div class="col-12 col-md-6">
        <q-card class="dashboard-card">
          <q-card-section class="bg-grey-1">
            <div class="row items-center justify-between">
              <div class="text-h6 text-grey-8">Derniers Mandats</div>
              <q-btn flat dense color="teal" label="Voir tout" to="/app5/mandats" />
            </div>
          </q-card-section>
          <q-card-section>
            <q-list separator v-if="derniersMandats.length > 0">
              <q-item v-for="(mandat, index) in derniersMandats" :key="index">
                <q-item-section avatar>
                  <q-avatar
                    :color="getStatutColor(mandat.statut)"
                    text-color="white"
                    icon="receipt"
                    size="40px"
                  />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-bold">{{ mandat.numeroMandat }}</q-item-label>
                  <q-item-label caption>{{ mandat.beneficiaire }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-item-label class="text-weight-bold text-teal">
                    {{ formatMontant(mandat.montant) }}
                  </q-item-label>
                  <q-item-label caption>{{ formatDate(mandat.dateMandat) }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
            <div v-else class="text-center text-grey-6 q-pa-md">
              <q-icon name="receipt" size="48px" class="q-mb-sm" />
              <div>Aucun mandat récent</div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Bordereaux ouverts -->
      <div class="col-12 col-md-6">
        <q-card class="dashboard-card">
          <q-card-section class="bg-grey-1">
            <div class="row items-center justify-between">
              <div class="text-h6 text-grey-8">Bordereaux Ouverts</div>
              <q-btn flat dense color="teal" label="Voir tout" to="/app5/bordereaux-mandats" />
            </div>
          </q-card-section>
          <q-card-section>
            <q-list separator v-if="bordereauOuverts.length > 0">
              <q-item v-for="(bordereau, index) in bordereauOuverts" :key="index">
                <q-item-section avatar>
                  <q-avatar color="teal" text-color="white" icon="folder_open" size="40px" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-bold">
                    Bordereau {{ bordereau.numero }}-{{ bordereau.exercice % 100 }}
                  </q-item-label>
                  <q-item-label caption>{{ bordereau.nombreMandats }} mandat(s)</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-item-label class="text-weight-bold text-teal">
                    {{ formatMontant(bordereau.montantTotal) }}
                  </q-item-label>
                  <q-badge color="positive" label="Ouvert" />
                </q-item-section>
              </q-item>
            </q-list>
            <div v-else class="text-center text-grey-6 q-pa-md">
              <q-icon name="folder_open" size="48px" class="q-mb-sm" />
              <div>Aucun bordereau ouvert</div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Exécution par chapitre -->
      <div class="col-12">
        <q-card class="dashboard-card">
          <q-card-section class="bg-grey-1">
            <div class="row items-center justify-between">
              <div class="text-h6 text-grey-8">Exécution Budgétaire par Chapitre</div>
              <q-btn flat dense color="teal" label="Statistiques" to="/app5/statistiques" />
            </div>
          </q-card-section>
          <q-card-section>
            <div v-if="previsionsStats.length > 0" class="q-gutter-md">
              <div v-for="prev in previsionsStats" :key="prev.id" class="execution-item">
                <div class="row items-center justify-between q-mb-xs">
                  <div class="text-weight-medium">{{ prev.chapitre }}</div>
                  <div class="text-weight-bold">{{ prev.taux }}%</div>
                </div>
                <q-linear-progress
                  :value="prev.taux / 100"
                  :color="getTauxColor(prev.taux)"
                  size="12px"
                  rounded
                />
                <div class="row justify-between text-caption text-grey-6 q-mt-xs">
                  <span>Engagé: {{ formatMontant(prev.engage) }}</span>
                  <span>Prévu: {{ formatMontant(prev.prevu) }}</span>
                </div>
              </div>
            </div>
            <div v-else class="text-center text-grey-6 q-pa-md">
              <q-icon name="pie_chart" size="48px" class="q-mb-sm" />
              <div>Aucune prévision enregistrée</div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Raccourcis -->
      <div class="col-12">
        <q-card class="dashboard-card">
          <q-card-section class="bg-grey-1">
            <div class="text-h6 text-grey-8">Accès Rapide</div>
          </q-card-section>
          <q-card-section>
            <div class="row q-gutter-md justify-center">
              <q-btn color="teal" icon="add" label="Nouveau Mandat" unelevated to="/app5/mandats" />
              <q-btn
                color="teal-8"
                icon="folder_open"
                label="Nouveau Bordereau"
                unelevated
                to="/app5/bordereaux-mandats"
              />
              <q-btn
                color="teal-6"
                icon="pie_chart"
                label="Nouvelle Prévision"
                unelevated
                to="/app5/previsions"
              />
              <q-btn
                color="secondary"
                icon="print"
                label="Imprimer CT02"
                unelevated
                to="/app5/ct02"
              />
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useQuasar, date } from 'quasar';
import {
  db,
  type PrevisionInvestissement,
  type MandatInvestissement,
  type BordereauMandatInvestissement,
  type ChapitreInvestissement,
  type SousChapitreInvestissement,
  DEFAULT_MAIRIE_ID,
} from 'src/database/db';
import PageHeader from 'src/components/PageHeader.vue';
import StatisticsCard from 'src/components/StatisticsCard.vue';

const $q = useQuasar();
const loading = ref(false);
const currentYear = new Date().getFullYear();

const previsions = ref<PrevisionInvestissement[]>([]);
const mandats = ref<MandatInvestissement[]>([]);
const bordereaux = ref<BordereauMandatInvestissement[]>([]);
const chapitres = ref<ChapitreInvestissement[]>([]);
const sousChapitres = ref<SousChapitreInvestissement[]>([]);

const stats = computed(() => {
  const budgetTotal = previsions.value.reduce((sum, p) => sum + p.montantPrevu, 0);
  const montantEngage = previsions.value.reduce((sum, p) => sum + p.montantEngage, 0);
  const montantDisponible = previsions.value.reduce((sum, p) => sum + p.montantDisponible, 0);
  const tauxExecution = budgetTotal > 0 ? Math.round((montantEngage / budgetTotal) * 100) : 0;

  const nombreMandats = mandats.value.length;
  const mandatsPayes = mandats.value.filter((m) => m.statut === 'paye').length;

  const nombreBordereaux = bordereaux.value.length;
  const bordereauOuverts = bordereaux.value.filter((b) => b.statut === 'ouvert').length;

  return {
    budgetTotal,
    montantEngage,
    montantDisponible,
    tauxExecution,
    nombreMandats,
    mandatsPayes,
    nombreBordereaux,
    bordereauOuverts,
    nombreChapitres: chapitres.value.length,
    nombreSousChapitres: sousChapitres.value.length,
    nombrePrevisions: previsions.value.length,
  };
});

const derniersMandats = computed(() => {
  return [...mandats.value]
    .sort((a, b) => new Date(b.dateMandat).getTime() - new Date(a.dateMandat).getTime())
    .slice(0, 5);
});

const bordereauOuverts = computed(() => {
  return bordereaux.value.filter((b) => b.statut === 'ouvert').slice(0, 5);
});

const previsionsStats = computed(() => {
  return previsions.value.map((p) => {
    const chapitre = chapitres.value.find((c) => c.id === p.chapitreInvestissementId);
    const taux = p.montantPrevu > 0 ? Math.round((p.montantEngage / p.montantPrevu) * 100) : 0;
    return {
      id: p.id!,
      chapitre: chapitre ? `${chapitre.code} - ${chapitre.libelle}` : 'N/A',
      prevu: p.montantPrevu,
      engage: p.montantEngage,
      taux,
    };
  });
});

function formatMontant(montant: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    minimumFractionDigits: 0,
  }).format(montant);
}

function formatDate(d: Date): string {
  return date.formatDate(d, 'DD/MM/YYYY');
}

function getStatutColor(statut: string): string {
  switch (statut) {
    case 'emis':
      return 'info';
    case 'paye':
      return 'positive';
    case 'brouillon':
      return 'warning';
    case 'annule':
      return 'negative';
    default:
      return 'grey';
  }
}

function getTauxColor(taux: number): string {
  if (taux >= 90) return 'negative';
  if (taux >= 75) return 'warning';
  return 'teal';
}

async function loadData() {
  loading.value = true;
  try {
    const [previsionsList, mandatsList, bordereauList, chapitresList, sousChapitresList] =
      await Promise.all([
        db.previsionsInvestissement
          .where('exercice')
          .equals(currentYear)
          .and((p) => p.mairieId === DEFAULT_MAIRIE_ID)
          .toArray(),
        db.mandatsInvestissement
          .where('exercice')
          .equals(currentYear)
          .and((m) => m.mairieId === DEFAULT_MAIRIE_ID)
          .toArray(),
        db.bordereauMandatsInvestissement
          .where('exercice')
          .equals(currentYear)
          .and((b) => b.mairieId === DEFAULT_MAIRIE_ID)
          .toArray(),
        db.chapitresInvestissement
          .filter((c) => c.actif && c.mairieId === DEFAULT_MAIRIE_ID)
          .toArray(),
        db.sousChapitresInvestissement
          .filter((s) => s.actif && s.mairieId === DEFAULT_MAIRIE_ID)
          .toArray(),
      ]);

    previsions.value = previsionsList;
    mandats.value = mandatsList;
    bordereaux.value = bordereauList;
    chapitres.value = chapitresList;
    sousChapitres.value = sousChapitresList;
  } catch (error) {
    console.error('Erreur lors du chargement:', error);
    $q.notify({ type: 'negative', message: 'Erreur lors du chargement des données' });
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  void loadData();
});
</script>

<style scoped lang="scss">
.dashboard-page {
  max-width: 1400px;
  margin: 0 auto;
}

.dashboard-card {
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition:
    transform 0.2s,
    box-shadow 0.2s;

  &:hover {
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
  }
}

.execution-item {
  padding: 12px;
  background: #f9f9f9;
  border-radius: 8px;
}
</style>
