<template>
  <div>
    <div class="text-center q-mb-md">
      <div class="text-h6 text-weight-bold">COMPTE ADMINISTRATIF DEPENSES D'INVESTISSEMENT</div>
    </div>

    <q-markup-table dense bordered flat separator="cell" class="ventilation-table">
      <thead>
        <tr>
          <th rowspan="2" class="text-left" style="min-width: 220px">
            COMPTES ET RUBRIQUES BUDGETAIRES
          </th>
          <th rowspan="2" class="text-right">PREVISIONS</th>
          <th rowspan="2" class="text-right">MANDATS</th>
          <th rowspan="2" class="text-right">CREDITS<br />SANS EMPLOI</th>
          <th colspan="3" class="text-center">VENTILATION DES DEPENSES PAR TYPE DE BIEN</th>
          <th rowspan="2" class="text-right">TOTAL</th>
        </tr>
        <tr>
          <th class="text-right col-type">IMMOBILIER</th>
          <th class="text-right col-type">MOBILIER</th>
          <th class="text-right col-type">INCORPOREL</th>
        </tr>
      </thead>
      <tbody>
        <template v-for="section in investSections" :key="section.code">
          <!-- Section header -->
          <tr class="section-header-row">
            <td colspan="8">SECTION {{ section.code }} - {{ section.libelle }}</td>
          </tr>

          <!-- Articles in this section -->
          <template v-for="article in getSectionRows(section.code)" :key="article.sousChapitreId">
            <tr class="article-row">
              <td class="q-pl-md">{{ article.code }} - {{ article.libelle }}</td>
              <td class="text-right">{{ fmt(article.montantPrevu) }}</td>
              <td class="text-right">{{ fmt(article.total) }}</td>
              <td class="text-right">{{ fmtCredits(article.montantPrevu, article.total) }}</td>
              <td class="text-right">{{ fmtZ(article.immobilier) }}</td>
              <td class="text-right">{{ fmtZ(article.mobilier) }}</td>
              <td class="text-right">{{ fmtZ(article.incorporel) }}</td>
              <td class="text-right">{{ fmtZ(article.total) }}</td>
            </tr>
          </template>

          <!-- Section total -->
          <tr class="section-total-row">
            <td>TOTAL SECTION {{ section.code }}</td>
            <td class="text-right">{{ fmt(sectionSum(section.code, 'montantPrevu')) }}</td>
            <td class="text-right">{{ fmt(sectionSum(section.code, 'total')) }}</td>
            <td class="text-right">
              {{
                fmt(sectionSum(section.code, 'montantPrevu') - sectionSum(section.code, 'total'))
              }}
            </td>
            <td class="text-right">{{ fmtZ(sectionSum(section.code, 'immobilier')) }}</td>
            <td class="text-right">{{ fmtZ(sectionSum(section.code, 'mobilier')) }}</td>
            <td class="text-right">{{ fmtZ(sectionSum(section.code, 'incorporel')) }}</td>
            <td class="text-right">{{ fmtZ(sectionSum(section.code, 'total')) }}</td>
          </tr>
        </template>

        <!-- Grand total -->
        <tr class="grand-total-row">
          <td>TOTAL GENERAL DES DEPENSES AU TITRE II</td>
          <td class="text-right">{{ fmt(totals.prevu) }}</td>
          <td class="text-right">{{ fmt(totals.total) }}</td>
          <td class="text-right">{{ fmt(totals.prevu - totals.total) }}</td>
          <td class="text-right">{{ fmtZ(totals.immobilier) }}</td>
          <td class="text-right">{{ fmtZ(totals.mobilier) }}</td>
          <td class="text-right">{{ fmtZ(totals.incorporel) }}</td>
          <td class="text-right">{{ fmtZ(totals.total) }}</td>
        </tr>
      </tbody>
    </q-markup-table>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { useCompteAdmin, DepenseInvestVentilee } from 'src/composables/useCompteAdmin';

const props = defineProps<{ data: ReturnType<typeof useCompteAdmin> }>();

const investSections = [
  { code: '90', libelle: 'EQUIPEMENT DES SERVICES GENERAUX' },
  { code: '91', libelle: 'EQUIPEMENT DES SERVICES DE COLLECTIVITE' },
  { code: '92', libelle: 'URBANISME ET ASSAINISSEMENT' },
  { code: '93', libelle: 'INVESTISSEMENTS FINANCIERS' },
  { code: '94', libelle: 'REMBOURSEMENT EMPRUNTS' },
  { code: '95', libelle: 'DEPENSES DIVERSES' },
];

function getSectionRows(sectionCode: string): DepenseInvestVentilee[] {
  return props.data.depensesInvestVentilees.value.filter((r) => r.code.startsWith(sectionCode));
}

function sectionSum(sectionCode: string, field: keyof DepenseInvestVentilee): number {
  return getSectionRows(sectionCode).reduce((s, r) => s + (r[field] as number), 0);
}

const totals = computed(() => {
  const rows = props.data.depensesInvestVentilees.value;
  return {
    prevu: rows.reduce((s, r) => s + r.montantPrevu, 0),
    immobilier: rows.reduce((s, r) => s + r.immobilier, 0),
    mobilier: rows.reduce((s, r) => s + r.mobilier, 0),
    incorporel: rows.reduce((s, r) => s + r.incorporel, 0),
    total: rows.reduce((s, r) => s + r.total, 0),
  };
});

function fmt(v: number) {
  return new Intl.NumberFormat('fr-FR').format(v);
}

function fmtZ(v: number) {
  return v === 0 ? '-' : new Intl.NumberFormat('fr-FR').format(v);
}

function fmtCredits(prevu: number, mandat: number) {
  const credits = prevu - mandat;
  if (credits <= 0) return '-';
  return new Intl.NumberFormat('fr-FR').format(credits);
}
</script>

<style scoped>
.ventilation-table {
  font-size: 9px;
}
.ventilation-table th {
  font-size: 7px;
  background-color: #f0f0f0;
}
.col-type {
  min-width: 90px;
}
.section-header-row td {
  font-weight: bold;
  background-color: #e3f2fd;
  font-size: 10px;
}
.article-row td {
  font-size: 9px;
}
.section-total-row td {
  font-weight: bold;
  background-color: #e0e0e0;
  font-size: 9px;
}
.grand-total-row td {
  font-weight: bold;
  background-color: #bdbdbd;
  font-size: 10px;
}
</style>
