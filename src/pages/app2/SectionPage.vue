<template>
  <q-page class="q-pa-md">
    <div class="row q-col-gutter-md">
      <!-- En-tête avec titre -->
      <div class="col-12">
        <div class="row items-center justify-between q-mb-md">
          <div class="col">
            <div class="text-h4">Sections de Trésorerie</div>
            <div class="text-subtitle1 text-grey-7">
              Gestion des flux de trésorerie et des timbres fiscaux
            </div>
          </div>
        </div>
      </div>

      <!-- Filtres et Actions -->
      <div class="col-12">
        <q-card flat bordered>
          <q-card-section class="row q-col-gutter-md items-center">
            <div class="col-12 col-md-3">
              <q-select
                v-model="selectedExercice"
                :options="exerciceOptions"
                label="Exercice"
                outlined
                dense
                emit-value
                map-options
              />
            </div>
            <div class="col-12 col-md-3">
              <q-btn
                color="primary"
                label="Actualiser"
                icon="refresh"
                @click="loadData"
                class="full-width"
              />
            </div>
            <div class="col-12 col-md-3">
              <q-btn
                color="secondary"
                label="Imprimer section"
                icon="print"
                @click="printCurrentSection"
                class="full-width"
                outline
              />
            </div>
            <div class="col-12 col-md-3">
              <q-btn
                color="accent"
                label="Imprimer tout"
                icon="print"
                @click="printAllSections"
                class="full-width"
                outline
              />
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Tabs pour les sections -->
      <div class="col-12">
        <q-card>
          <q-tabs
            v-model="activeTab"
            dense
            class="text-primary bg-white"
            active-color="primary"
            indicator-color="primary"
            align="left"
            animated
          >
            <q-tab name="section1" label="Section I - Timbres Fiscaux" icon="receipt" />
            <q-tab name="section2" label="Section II - Remises & Versements" icon="swap_horiz" />
            <q-tab name="section3" label="Section III - Versements" icon="payments" />
          </q-tabs>

          <q-separator />

          <q-tab-panels v-model="activeTab" animated>
            <!-- Section 1 - Approvisionnement -->
            <q-tab-panel name="section1">
              <SectionI :data="sectionIData" :loading="loading" @print="printSection('section1')" />
            </q-tab-panel>

            <!-- Section 2 - Remises et Versements -->
            <q-tab-panel name="section2">
              <SectionII
                :data="sectionIIData"
                :loading="loading"
                @print="printSection('section2')"
              />
            </q-tab-panel>

            <!-- Section 3 - Versements -->
            <q-tab-panel name="section3">
              <SectionIII
                :data="sectionIIIData"
                :loading="loading"
                @print="printSection('section3')"
              />
            </q-tab-panel>
          </q-tab-panels>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
/**
 * PAGE DES SECTIONS DE TRÉSORERIE - GESTION DES TIMBRES FISCAUX
 *
 * Cette page gère les 3 sections de trésorerie pour les timbres fiscaux :
 *
 * SECTION I - TIMBRES FISCAUX (Stock)
 * - Balance d'entrée initiale (BE-S1)
 * - Remises vers Section II (sorties négatives)
 * - Formule : Solde = BE-S1 - Remises
 *
 * SECTION II - TRANSIT (Remises et Versements)
 * - Balance d'entrée (BE-S2)
 * - Reçoit les remises de Section I (entrées positives, en vert)
 * - Envoie des versements vers Section III (sorties négatives, en rouge)
 * - Formule : Solde = BE-S2 - Versements + Remises
 *
 * SECTION III - CAISSE (Versements finaux)
 * - Balance d'entrée (BE-S3)
 * - Reçoit les versements de Section II (sorties négatives)
 * - Formule : Solde = BE-S3 + Versements
 *
 * LES 4 TYPES DE BALANCE D'ENTRÉE PAR EXERCICE :
 * 1. Stock initial - Stock de départ de l'année
 * 2. BE-S1 - Balance d'entrée Section I (Timbres Fiscaux)
 * 3. BE-S2 - Balance d'entrée Section II (Transit)
 * 4. BE-S3 - Balance d'entrée Section III (Caisse)
 *
 * COLONNES DES TIMBRES (Valeurs) :
 * - 100 F, 200 F, 300 F, 500 F, 600 F, 1000 F
 *
 * FLUX DE TRÉSORERIE :
 * Section I (Timbres) → Remises → Section II (Transit) → Versements → Section III (Caisse)
 */
import { ref, onMounted, computed } from 'vue';
import { useQuasar } from 'quasar';
import type { SectionIEntry, SectionIIEntry, SectionIIIEntry } from './types';
import type { AnySectionEntry } from './types';
import SectionI from './components/SectionI.vue';
import SectionII from './components/SectionII.vue';
import SectionIII from './components/SectionIII.vue';
import { db, DEFAULT_MAIRIE_ID } from 'src/database/db';

const $q = useQuasar();

const activeTab = ref('section1');
const loading = ref(false);
const selectedExercice = ref(new Date().getFullYear());

// Options d'exercice (5 dernières années)
const exerciceOptions = computed(() => {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let i = 0; i < 5; i++) {
    const year = currentYear - i;
    years.push({
      label: `Exercice ${year}`,
      value: year,
    });
  }
  return years;
});

// Soldes des sections
const soldeSectionI = ref(256940000);
const soldeSectionII = ref(840000);
const soldeSectionIII = ref(253680000);

// Données de Section I
const sectionIData = ref<SectionIEntry[]>([]);
const sectionIIData = ref<SectionIIEntry[]>([]);
const sectionIIIData = ref<SectionIIIEntry[]>([]);

const formatDate = (date: Date | string) => {
  return new Date(date).toLocaleDateString('fr-FR');
};

const formatMontant = (montant: number) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    minimumFractionDigits: 0,
  }).format(montant);
};

const formatNumber = (num: number) => {
  return new Intl.NumberFormat('fr-FR').format(num);
};

// Charger les données depuis Dexie
const loadData = async () => {
  loading.value = true;
  try {
    const mairieId = DEFAULT_MAIRIE_ID;
    const exercice = selectedExercice.value;

    console.log('🔍 Chargement des données pour exercice:', exercice, 'mairie:', mairieId);

    // Charger les balances d'entrée
    const balances = await db.balancesEntree.where({ exercice, mairieId }).toArray();

    console.log('📊 Balances chargées:', balances.length, balances);

    // Charger les remises (uniquement par exercice, pas de mairieId dans cette table)
    const remises = await db.remises.where('exercice').equals(exercice).toArray();

    console.log('✅ Remises pour exercice', exercice, ':', remises.length);

    // Charger les versements (uniquement par exercice)
    const versements = await db.versements.where('exercice').equals(exercice).toArray();
    console.log('✅ Versements pour exercice', exercice, ':', versements.length);

    // Construire les données pour Section I (Balances + Approvisionnements + Remises)
    const sectionIEntries: SectionIEntry[] = [];
    let sectionISolde = 0;

    // Ajouter les balances d'entrée de Section I
    const balancesBES1 = balances.filter(
      (b) => b.type.includes('BE-S1') || b.type.includes('Stock'),
    );
    console.log(
      '🔍 Section I - Balances filtrées (BE-S1 ou Stock):',
      balancesBES1.length,
      balancesBES1.map((b) => b.type),
    );

    balancesBES1.forEach((b) => {
      sectionISolde += b.total;
      sectionIEntries.push({
        id: b.id!,
        date: b.date.toISOString(),
        type: b.type,
        denominations: b.timbres,
        approvisionnement: b.total,
        solde: sectionISolde,
      });
    });

    // Ajouter les remises (sorties)
    remises.forEach((r) => {
      sectionISolde -= r.total;
      sectionIEntries.push({
        id: r.id!,
        date: r.date.toISOString(),
        type: 'Remise',
        denominations: r.timbres,
        remise: r.total,
        solde: sectionISolde,
      });
    });

    sectionIData.value = sectionIEntries.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );

    // Construire les données pour Section II (Balances + Remises + Versements)
    const sectionIIEntries: SectionIIEntry[] = [];
    let sectionIISolde = 0;

    // Ajouter les balances d'entrée de Section II
    const balancesBES2 = balances.filter((b) => b.type.includes('BE-S2'));
    console.log(
      '🔍 Section II - Balances filtrées (BE-S2):',
      balancesBES2.length,
      balancesBES2.map((b) => b.type),
    );

    balancesBES2.forEach((b) => {
      sectionIISolde += b.total;
      sectionIIEntries.push({
        id: b.id!,
        date: b.date.toISOString(),
        type: b.type,
        denominations: b.timbres,
        remise: b.total,
        solde: sectionIISolde,
      });
    });

    // Ajouter remises et versements
    [...remises, ...versements]
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .forEach((entry) => {
        const isRemise = 'numeroRemise' in entry;
        if (isRemise) {
          sectionIISolde += entry.total;
          sectionIIEntries.push({
            id: entry.id!,
            date: entry.date.toISOString(),
            type: 'Remise',
            denominations: entry.timbres,
            remise: entry.total,
            solde: sectionIISolde,
          });
        } else {
          sectionIISolde -= entry.total;
          sectionIIEntries.push({
            id: entry.id!,
            date: entry.date.toISOString(),
            type: 'Versement',
            denominations: entry.timbres,
            versement: entry.total,
            solde: sectionIISolde,
          });
        }
      });

    sectionIIData.value = sectionIIEntries;

    // Construire les données pour Section III (Balances + Versements)
    const sectionIIIEntries: SectionIIIEntry[] = [];
    let sectionIIISolde = 0;

    // Ajouter les balances d'entrée de Section III
    const balancesBES3 = balances.filter((b) => b.type.includes('BE-S3'));
    console.log(
      '🔍 Section III - Balances filtrées (BE-S3):',
      balancesBES3.length,
      balancesBES3.map((b) => b.type),
    );

    balancesBES3.forEach((b) => {
      sectionIIISolde += b.total;
      sectionIIIEntries.push({
        id: b.id!,
        date: b.date.toISOString(),
        type: b.type,
        denominations: b.timbres,
        approvisionnement: b.total,
        solde: sectionIIISolde,
      });
    });

    // Ajouter les versements
    versements.forEach((v) => {
      sectionIIISolde -= v.total;
      sectionIIIEntries.push({
        id: v.id!,
        date: v.date.toISOString(),
        type: 'Versement',
        denominations: v.timbres,
        versement: v.total,
        solde: sectionIIISolde,
      });
    });

    sectionIIIData.value = sectionIIIEntries.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );

    // Mettre à jour les soldes
    soldeSectionI.value = sectionISolde;
    soldeSectionII.value = sectionIISolde;
    soldeSectionIII.value = sectionIIISolde;
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

// Impression d'une section spécifique
const printSection = (sectionName: string) => {
  let data: AnySectionEntry[] = [];
  let templateUrl = '';

  if (sectionName === 'section1') {
    data = sectionIData.value;
    templateUrl = '/SectionI.html';
  } else if (sectionName === 'section2') {
    data = sectionIIData.value;
    templateUrl = '/SectionII.html';
  } else if (sectionName === 'section3') {
    data = sectionIIIData.value;
    templateUrl = '/SectionIII.html';
  }

  const printWindow = window.open(templateUrl, '_blank');

  if (printWindow) {
    printWindow.addEventListener('load', () => {
      printWindow.postMessage(
        {
          type: 'FILL_DATA',
          data: data,
        },
        '*',
      );
    });
  }
};

// Impression de la section active
const printCurrentSection = () => {
  printSection(activeTab.value);
};

// Impression de toutes les sections
const printAllSections = () => {
  // Ouvrir les trois sections dans des fenêtres séparées
  printSection('section1');
  setTimeout(() => printSection('section2'), 500);
  setTimeout(() => printSection('section3'), 1000);
};

onMounted(() => {
  void loadData();
});
</script>

<style scoped lang="scss">
.bg-gradient-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
</style>
