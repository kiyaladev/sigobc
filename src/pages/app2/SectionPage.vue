<template>
  <q-page class="q-pa-md">
    <div class="row q-col-gutter-md">
      <div class="col-12">
        <div class="row items-center justify-between q-mb-md">
          <div class="col">
            <div class="text-h4">Sections de Trésorerie</div>
            <div class="text-subtitle1 text-grey-7">Gestion des flux de trésorerie et des timbres fiscaux</div>
          </div>
        </div>
      </div>

      <div class="col-12">
        <q-card flat bordered>
          <q-card-section class="row q-col-gutter-md items-center">
            <div class="col-12 col-md-3">
              <q-select v-model="selectedExercice" :options="exerciceOptions" label="Exercice" outlined dense emit-value map-options />
            </div>
            <div class="col-12 col-md-3">
              <q-btn color="primary" label="Actualiser" icon="refresh" @click="loadData" class="full-width" />
            </div>
            <div class="col-12 col-md-3">
              <q-btn color="grey-7" label="Imprimer section" icon="print" @click="printCurrentSection" class="full-width" outline />
            </div>
            <div class="col-12 col-md-3">
              <q-btn color="grey-7" label="Imprimer tout" icon="print" @click="printAllSections" class="full-width" outline />
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12">
        <q-card>
          <q-tabs v-model="activeTab" dense class="text-primary bg-white" active-color="primary" indicator-color="primary" align="justify" animated>
            <q-tab name="section1" label="Section I - Timbres Fiscaux" icon="receipt" />
            <q-tab name="section2" label="Section II - Remises & Versements" icon="swap_horiz" />
            <q-tab name="section3" label="Section III - Versements" icon="payments" />
          </q-tabs>
          <q-separator />
          <q-tab-panels v-model="activeTab" animated>
            <q-tab-panel name="section1">
              <SectionI :data="sectionIData" :loading="loading" :labels="labelsByPrice" :quotites="activeQuotiteCols" @print="printSection('section1')" />
            </q-tab-panel>
            <q-tab-panel name="section2">
              <SectionII :data="sectionIIData" :loading="loading" :labels="labelsByPrice" :quotites="activeQuotiteCols" @print="printSection('section2')" />
            </q-tab-panel>
            <q-tab-panel name="section3">
              <SectionIII :data="sectionIIIData" :loading="loading" :labels="labelsByPrice" :quotites="activeQuotiteCols" @print="printSection('section3')" />
            </q-tab-panel>
          </q-tab-panels>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import SectionI from './components/SectionI.vue';
import SectionII from './components/SectionII.vue';
import SectionIII from './components/SectionIII.vue';
import type { SectionIEntry, SectionIIEntry, SectionIIIEntry, DenominationsType, AnySectionEntry } from './types';
import { db, DEFAULT_MAIRIE_ID } from 'src/database/db';

const $q = useQuasar();
const activeTab = ref('section1');
const loading = ref(false);
const selectedExercice = ref(new Date().getFullYear());

const exerciceOptions = computed(() => {
  const currentYear = new Date().getFullYear();
  return Array.from({ length: 5 }, (_, i) => ({ label: `Exercice ${currentYear - i}`, value: currentYear - i }));
});

const soldeSectionI = ref(0);
const soldeSectionII = ref(0);
const soldeSectionIII = ref(0);

const sectionIData = ref<SectionIEntry[]>([]);
const sectionIIData = ref<SectionIIEntry[]>([]);
const sectionIIIData = ref<SectionIIIEntry[]>([]);
type QuotiteCol = { key: string; label: string; prix: number; code: string };
const labelsByPrice = ref<Record<number, string>>({});
const activeQuotiteCols = ref<QuotiteCol[]>([]);

const loadData = async () => {
  loading.value = true;
  try {
    const mairieId = DEFAULT_MAIRIE_ID;
    const exercice = selectedExercice.value;

    const balances = await db.balancesEntree.where({ exercice, mairieId }).toArray();
    const remises = await db.remises.where('exercice').equals(exercice).toArray();
    const approvisionnements = await db.approvisionnements.where('exercice').equals(exercice).toArray();
    const versements = await db.versements.where('exercice').equals(exercice).toArray();

    const rawSectionI: { id: number; date: Date; type: string; denominations: DenominationsType; detailsQuotites?: Record<string, number>; approvisionnement?: number; remise?: number }[] = [];
    const balancesBES1 = balances.filter((b) => b.type.includes('BE-S1') || b.type.includes('INITIAL') || b.type.includes('Stock'));
    balancesBES1.forEach((b) => rawSectionI.push({ id: b.id!, date: b.date, type: b.type, denominations: b.timbres, detailsQuotites: b.detailsQuotites, approvisionnement: b.total }));
    approvisionnements.forEach((a) => rawSectionI.push({ id: a.id!, date: a.date, type: 'Approvisionnement', denominations: a.timbres, detailsQuotites: a.detailsQuotites, approvisionnement: a.total }));
    remises.forEach((r) => rawSectionI.push({ id: r.id!, date: r.date, type: 'Remise', denominations: r.timbres, detailsQuotites: r.detailsQuotites, remise: r.total }));
    rawSectionI.sort((a, b) => a.date.getTime() - b.date.getTime());
    let sectionISolde = 0;
    sectionIData.value = rawSectionI.map((item) => {
      if (item.approvisionnement) sectionISolde += item.approvisionnement;
      if (item.remise) sectionISolde -= item.remise;
      return { ...item, date: item.date.toISOString(), solde: sectionISolde };
    });

    const rawSectionII: { id: number; date: Date; type: string; denominations: DenominationsType; detailsQuotites?: Record<string, number>; remise?: number; versement?: number }[] = [];
    const balancesBES2 = balances.filter((b) => b.type.includes('BE-S2'));
    balancesBES2.forEach((b) => rawSectionII.push({ id: b.id!, date: b.date, type: b.type, denominations: b.timbres, detailsQuotites: b.detailsQuotites, remise: b.total }));
    remises.forEach((r) => rawSectionII.push({ id: r.id!, date: r.date, type: 'Remise', denominations: r.timbres, detailsQuotites: r.detailsQuotites, remise: r.total }));
    versements.forEach((v) => rawSectionII.push({ id: v.id!, date: v.date, type: 'Versement', denominations: v.timbres, detailsQuotites: v.detailsQuotites, versement: v.total }));
    rawSectionII.sort((a, b) => a.date.getTime() - b.date.getTime());
    let sectionIISolde = 0;
    sectionIIData.value = rawSectionII.map((item) => {
      if (item.remise) sectionIISolde += item.remise;
      if (item.versement) sectionIISolde -= item.versement;
      return { ...item, date: item.date.toISOString(), solde: sectionIISolde };
    });

    const rawSectionIII: { id: number; date: Date; type: string; denominations: DenominationsType; detailsQuotites?: Record<string, number>; approvisionnement?: number; versement?: number; remise?: number }[] = [];
    const balancesBES3 = balances.filter((b) => b.type.includes('BE-S3'));
    balancesBES3.forEach((b) => rawSectionIII.push({ id: b.id!, date: b.date, type: b.type, denominations: b.timbres, detailsQuotites: b.detailsQuotites, approvisionnement: b.total }));
    versements.forEach((v) => rawSectionIII.push({ id: v.id!, date: v.date, type: 'Versement', denominations: v.timbres, detailsQuotites: v.detailsQuotites, versement: v.total }));
    remises.forEach((r) => rawSectionIII.push({ id: r.id!, date: r.date, type: 'Remise', denominations: r.timbres, detailsQuotites: r.detailsQuotites, remise: r.total }));
    rawSectionIII.sort((a, b) => a.date.getTime() - b.date.getTime());
    let sectionIIISolde = 0;
    sectionIIIData.value = rawSectionIII.map((item) => {
      if (item.approvisionnement) sectionIIISolde += item.approvisionnement;
      if (item.remise) sectionIIISolde += item.remise;
      if (item.versement) sectionIIISolde -= item.versement;
      return { ...item, date: item.date.toISOString(), solde: sectionIIISolde };
    });

    soldeSectionI.value = sectionISolde;
    soldeSectionII.value = sectionIISolde;
    soldeSectionIII.value = sectionIIISolde;

    const quotites = await db.quotites.toArray();
    const actives = quotites.filter((q) => q.actif);
    labelsByPrice.value = {};
    activeQuotiteCols.value = actives.map((q) => ({ key: `${q.prix}-${q.code}`, label: `${q.prix} (${q.code})`, prix: q.prix, code: q.code }));
    for (const q of actives) {
      labelsByPrice.value[q.prix] = labelsByPrice.value[q.prix]
        ? `${labelsByPrice.value[q.prix]}, ${q.code}`
        : `${q.prix} (${q.code})`;
    }
  } catch (error) {
    console.error(error);
    $q.notify({ type: 'negative', message: 'Erreur lors du chargement des données' });
  } finally {
    loading.value = false;
  }
};

type MonthlyTotalEntry = { isMonthlyTotal: boolean; date: string; denominations: DenominationsType; approvisionnement?: number; remise?: number; versement?: number; solde: number };

const getMonthLabel = (month: number, year: number) => {
  const date = new Date(year, month, 1);
  const label = date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  return 'Total ' + label.charAt(0).toUpperCase() + label.slice(1);
};

const addMonthlyTotals = (data: AnySectionEntry[]) => {
  if (!data.length) return [];
  const result: (AnySectionEntry | MonthlyTotalEntry)[] = [];
  let currentMonth = new Date(data[0]!.date).getMonth();
  let currentYear = new Date(data[0]!.date).getFullYear();
  let totalDenom: DenominationsType = { 100: 0, 200: 0, 300: 0, 500: 0, 600: 0, 1000: 0 };
  let totalApprov = 0, totalRemise = 0, totalVersement = 0;
  data.forEach((row, index) => {
    const d = new Date(row.date);
    const month = d.getMonth();
    const year = d.getFullYear();
    if (month !== currentMonth || year !== currentYear) {
      result.push({ isMonthlyTotal: true, date: getMonthLabel(currentMonth, currentYear), denominations: { ...totalDenom }, approvisionnement: totalApprov, remise: totalRemise, versement: totalVersement, solde: data[index - 1]!.solde });
      totalDenom = { 100: 0, 200: 0, 300: 0, 500: 0, 600: 0, 1000: 0 };
      totalApprov = 0; totalRemise = 0; totalVersement = 0;
      currentMonth = month; currentYear = year;
    }
    if (row.denominations) {
      for (const k in row.denominations) {
        const key = Number(k);
        const val = row.denominations[key];
        if (totalDenom[key] !== undefined) totalDenom[key] += val || 0;
      }
    }
    if ('approvisionnement' in row && row.approvisionnement) totalApprov += row.approvisionnement;
    if ('remise' in row && row.remise) totalRemise += row.remise;
    if ('versement' in row && row.versement) totalVersement += row.versement;
    result.push(row);
  });
  result.push({ isMonthlyTotal: true, date: getMonthLabel(currentMonth, currentYear), denominations: { ...totalDenom }, approvisionnement: totalApprov, remise: totalRemise, versement: totalVersement, solde: data[data.length - 1]!.solde });
  return result;
};

const printSection = (sectionName: string) => {
  let data: AnySectionEntry[] = [];
  let templateUrl = '';
  if (sectionName === 'section1') { data = JSON.parse(JSON.stringify(sectionIData.value)); templateUrl = '/SectionI.html'; }
  else if (sectionName === 'section2') { data = JSON.parse(JSON.stringify(sectionIIData.value)); templateUrl = '/SectionII.html'; }
  else if (sectionName === 'section3') { data = JSON.parse(JSON.stringify(sectionIIIData.value)); templateUrl = '/SectionIII.html'; }
  const printWindow = window.open(templateUrl, '_blank');
  if (printWindow) {
    const dataWithTotals = addMonthlyTotals(data);
    printWindow.addEventListener('load', () => {
      printWindow.postMessage({ type: 'FILL_DATA', data: dataWithTotals, columns: activeQuotiteCols.value.map(c=>c.key), labels: Object.fromEntries(activeQuotiteCols.value.map(c=>[c.key,c.label])) }, '*');
    });
  }
};

const printCurrentSection = () => { printSection(activeTab.value); };
const printAllSections = () => { printSection('section1'); setTimeout(() => printSection('section2'), 500); setTimeout(() => printSection('section3'), 1000); };
onMounted(() => { void loadData(); });
</script>

<style scoped lang="scss">
.bg-gradient-primary { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
</style>
