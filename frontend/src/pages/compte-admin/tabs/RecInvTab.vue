<template>
  <div>
    <div class="text-center q-mb-md">
      <div class="text-h6 text-weight-bold">RECETTES D'INVESTISSEMENT</div>
    </div>

    <q-markup-table dense bordered flat separator="cell" class="recinv-table">
      <thead>
        <tr>
          <th rowspan="2" class="text-left" style="width: 320px">COMPTES ET RUBRIQUES BUDGETAIRES</th>
          <th rowspan="2" class="text-right">PREVISIONS</th>
          <th colspan="4" class="text-center">EXECUTION DU BUDGET</th>
          <th rowspan="2" class="text-right">ECART<br />PREVISIONS<br />RECOUVREMENTS</th>
          <th rowspan="2" class="text-right">R / P<br />%</th>
        </tr>
        <tr>
          <th class="text-right">EMISSIONS</th>
          <th class="text-right">RECOUVREMENT</th>
          <th class="text-right">NON VALEUR</th>
          <th class="text-right">RESTE A<br />RECOUVRER</th>
        </tr>
      </thead>
      <tbody>
        <template v-for="section in sections" :key="section.code">
          <!-- Section header -->
          <tr class="bg-grey-3 text-weight-bold">
            <td colspan="8">{{ section.libelle }}</td>
          </tr>
          <!-- Chapitres -->
          <template v-for="chap in getChapitres(section.code)" :key="chap.code">
            <tr class="bg-grey-1 text-weight-medium">
              <td colspan="8" class="q-pl-md">{{ chap.libelle }}</td>
            </tr>
            <!-- Articles -->
            <tr v-for="article in getArticles(chap.code)" :key="article.taxeId" class="article-row">
              <td class="q-pl-lg">Article {{ article.code }} - {{ article.libelle }}</td>
              <td class="text-right">{{ fmtZ(article.montantPrevu) }}</td>
              <td class="text-right">{{ fmtZ(article.montantEmis) }}</td>
              <td class="text-right">{{ fmtZ(article.montantRecouvre) }}</td>
              <td class="text-right">-</td>
              <td class="text-right">
                {{ article.montantEmis - article.montantRecouvre > 0 ? fmt(article.montantEmis - article.montantRecouvre) : '-' }}
              </td>
              <td class="text-right">{{ fmtZ(article.montantPrevu - article.montantRecouvre) }}</td>
              <td class="text-right">
                {{ article.montantPrevu > 0 ? ((article.montantRecouvre / article.montantPrevu) * 100).toFixed(2) : '-' }}
              </td>
            </tr>
            <!-- Chapitre subtotal -->
            <tr class="bg-grey-1 text-weight-bold text-caption">
              <td class="q-pl-md text-italic">SOUS TOTAL CHAPITRE - {{ chap.code }}</td>
              <td class="text-right">{{ fmtZ(chapTotal(chap.code, 'montantPrevu')) }}</td>
              <td class="text-right">{{ fmtZ(chapTotal(chap.code, 'montantEmis')) }}</td>
              <td class="text-right">{{ fmtZ(chapTotal(chap.code, 'montantRecouvre')) }}</td>
              <td class="text-right">-</td>
              <td class="text-right">
                {{ chapTotal(chap.code, 'montantEmis') - chapTotal(chap.code, 'montantRecouvre') > 0 ? fmt(chapTotal(chap.code, 'montantEmis') - chapTotal(chap.code, 'montantRecouvre')) : '-' }}
              </td>
              <td class="text-right">{{ fmtZ(chapTotal(chap.code, 'montantPrevu') - chapTotal(chap.code, 'montantRecouvre')) }}</td>
              <td class="text-right">
                {{ chapTotal(chap.code, 'montantPrevu') > 0 ? ((chapTotal(chap.code, 'montantRecouvre') / chapTotal(chap.code, 'montantPrevu')) * 100).toFixed(2) : '-' }}
              </td>
            </tr>
          </template>
          <!-- Section total -->
          <tr class="bg-grey-3 text-weight-bold">
            <td class="text-center">TOTAL SECTION - {{ section.code }}</td>
            <td class="text-right">{{ fmt(sectionTotal(section.code, 'montantPrevu')) }}</td>
            <td class="text-right">{{ fmtZ(sectionTotal(section.code, 'montantEmis')) }}</td>
            <td class="text-right">{{ fmtZ(sectionTotal(section.code, 'montantRecouvre')) }}</td>
            <td class="text-right">-</td>
            <td class="text-right">-</td>
            <td class="text-right">{{ fmtZ(sectionTotal(section.code, 'montantPrevu') - sectionTotal(section.code, 'montantRecouvre')) }}</td>
            <td class="text-right">
              {{ sectionTotal(section.code, 'montantPrevu') > 0 ? ((sectionTotal(section.code, 'montantRecouvre') / sectionTotal(section.code, 'montantPrevu')) * 100).toFixed(2) : '-' }}
            </td>
          </tr>
        </template>
        <!-- Grand total -->
        <tr class="bg-grey-4 text-weight-bold">
          <td class="text-center">TOTAL DES RECETTES AU TITRE - II</td>
          <td class="text-right">{{ fmt(data.totalPrevuRecInvest.value) }}</td>
          <td class="text-right">{{ fmtZ(data.totalEmissionsInvest.value) }}</td>
          <td class="text-right">{{ fmtZ(data.totalRecettesInvest.value) }}</td>
          <td class="text-right"></td>
          <td class="text-right"></td>
          <td class="text-right">{{ fmtZ(data.totalPrevuRecInvest.value - data.totalRecettesInvest.value) }}</td>
          <td class="text-right">
            {{ data.totalPrevuRecInvest.value > 0 ? ((data.totalRecettesInvest.value / data.totalPrevuRecInvest.value) * 100).toFixed(2) : '-' }}
          </td>
        </tr>
      </tbody>
    </q-markup-table>
  </div>
</template>

<script setup lang="ts">
import type { useCompteAdmin, LigneRecette } from 'src/composables/useCompteAdmin';

const props = defineProps<{ data: ReturnType<typeof useCompteAdmin> }>();

const sections = [
  { code: '01', libelle: "SECTION 01 - DOTATIONS DE L'ETAT" },
  { code: '02', libelle: 'SECTION 02 - PRELEVEMENTS SUR FONDS D\'INVESTISSEMENT' },
  { code: '03', libelle: 'SECTION 03 - CESSIONS IMMOBILIERES' },
  { code: '04', libelle: "SECTION 04 - AIDE DE L'ETAT - FONDS DE CONCOURS - AIDES EXTERIEURES" },
  { code: '05', libelle: 'SECTION 05 - FONDS PROPRES' },
  { code: '06', libelle: 'SECTION 06 - RECETTES DIVERSES AU TITRE II' },
];

function getChapitres(sectionCode: string) {
  return props.data.recettesInvestissement.value.filter(
    (r) => r.code.startsWith(sectionCode) && r.code.length === 3,
  );
}

function getArticles(chapitreCode: string): LigneRecette[] {
  return props.data.recettesInvestissement.value.filter(
    (r) => r.code.startsWith(chapitreCode) && r.code.length > 3,
  );
}

function chapTotal(chapCode: string, field: 'montantPrevu' | 'montantEmis' | 'montantRecouvre'): number {
  return getArticles(chapCode).reduce((s, r) => s + r[field], 0);
}

function sectionTotal(sectionCode: string, field: 'montantPrevu' | 'montantEmis' | 'montantRecouvre'): number {
  return props.data.recettesInvestissement.value
    .filter((r) => r.code.startsWith(sectionCode) && r.code.length > 2)
    .reduce((s, r) => s + r[field], 0);
}

function fmt(v: number) {
  return new Intl.NumberFormat('fr-FR').format(v);
}

function fmtZ(v: number) {
  return v === 0 ? '-' : new Intl.NumberFormat('fr-FR').format(v);
}
</script>

<style scoped>
.recinv-table { font-size: 11px; }
.recinv-table th { font-size: 9px; background-color: #f0f0f0; }
.article-row td { font-size: 10px; }
</style>
