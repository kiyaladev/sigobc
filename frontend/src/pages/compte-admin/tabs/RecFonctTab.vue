<template>
  <div>
    <div class="text-center q-mb-md">
      <div class="text-h6 text-weight-bold">RECETTES DE FONCTIONNEMENT</div>
    </div>

    <q-markup-table dense bordered flat separator="cell" class="recfonct-table">
      <thead>
        <tr>
          <th rowspan="2" class="text-left" style="width: 320px">NOMENCLATURE BUDGETAIRE</th>
          <th rowspan="2" class="text-right">PREVISIONS</th>
          <th colspan="4" class="text-center">EXECUTION DU BUDGET</th>
          <th rowspan="2" class="text-right">ECART</th>
          <th rowspan="2" class="text-right">E / P %</th>
        </tr>
        <tr>
          <th class="text-right">EMISSIONS</th>
          <th class="text-right">RECOUVREMENT /<br />ENCAISSEMENT</th>
          <th class="text-right">NON VALEUR</th>
          <th class="text-right">RESTE A<br />RECOUVRER</th>
        </tr>
      </thead>
      <tbody>
        <template v-for="section in sections" :key="section.code">
          <!-- Section header (e.g., SECTION 70 - RECETTES FISCALES) -->
          <tr class="bg-grey-3 text-weight-bold">
            <td colspan="8">{{ section.libelle }}</td>
          </tr>
          <!-- Chapitres under this section -->
          <template v-for="chap in getChapitres(section.code)" :key="chap.code">
            <tr class="bg-grey-1 text-weight-medium">
              <td colspan="8" class="q-pl-md">{{ chap.libelle }}</td>
            </tr>
            <!-- Articles under this chapitre -->
            <tr v-for="article in getArticles(chap.code)" :key="article.taxeId" class="article-row">
              <td class="q-pl-lg">{{ article.code }} - {{ article.libelle }}</td>
              <td class="text-right">{{ fmtZ(article.montantPrevu) }}</td>
              <td class="text-right">{{ fmtZ(article.montantEmis) }}</td>
              <td class="text-right">{{ fmtZ(article.montantRecouvre) }}</td>
              <td class="text-right">-</td>
              <td class="text-right">
                {{ article.montantPrevu - article.montantRecouvre > 0 ? fmt(article.montantPrevu - article.montantRecouvre) : '-' }}
              </td>
              <td class="text-right">
                {{ article.montantPrevu - article.montantEmis !== 0 ? fmt(article.montantPrevu - article.montantEmis) : '-' }}
              </td>
              <td class="text-right">
                {{ article.montantPrevu > 0 ? ((article.montantEmis / article.montantPrevu) * 100).toFixed(2) + '%' : '-' }}
              </td>
            </tr>
            <!-- Chapitre subtotal -->
            <tr class="bg-grey-1 text-weight-bold text-caption">
              <td class="q-pl-md text-italic">Total {{ chap.code }}</td>
              <td class="text-right">{{ fmtZ(chapTotal(chap.code, 'montantPrevu')) }}</td>
              <td class="text-right">{{ fmtZ(chapTotal(chap.code, 'montantEmis')) }}</td>
              <td class="text-right">{{ fmtZ(chapTotal(chap.code, 'montantRecouvre')) }}</td>
              <td class="text-right">-</td>
              <td class="text-right">
                {{ chapTotal(chap.code, 'montantPrevu') - chapTotal(chap.code, 'montantRecouvre') > 0 ? fmt(chapTotal(chap.code, 'montantPrevu') - chapTotal(chap.code, 'montantRecouvre')) : '-' }}
              </td>
              <td class="text-right">
                {{ fmt(chapTotal(chap.code, 'montantPrevu') - chapTotal(chap.code, 'montantEmis')) }}
              </td>
              <td class="text-right">
                {{ chapTotal(chap.code, 'montantPrevu') > 0 ? ((chapTotal(chap.code, 'montantEmis') / chapTotal(chap.code, 'montantPrevu')) * 100).toFixed(2) + '%' : '-' }}
              </td>
            </tr>
          </template>
          <!-- Section subtotal -->
          <tr class="bg-grey-3 text-weight-bold">
            <td>TOTAL {{ section.label }}</td>
            <td class="text-right">{{ fmt(sectionTotal(section.code, 'montantPrevu')) }}</td>
            <td class="text-right">{{ fmt(sectionTotal(section.code, 'montantEmis')) }}</td>
            <td class="text-right">{{ fmt(sectionTotal(section.code, 'montantRecouvre')) }}</td>
            <td class="text-right">-</td>
            <td class="text-right">
              {{ sectionTotal(section.code, 'montantPrevu') - sectionTotal(section.code, 'montantRecouvre') > 0 ? fmt(sectionTotal(section.code, 'montantPrevu') - sectionTotal(section.code, 'montantRecouvre')) : '-' }}
            </td>
            <td class="text-right">
              {{ fmt(sectionTotal(section.code, 'montantPrevu') - sectionTotal(section.code, 'montantEmis')) }}
            </td>
            <td class="text-right">
              {{
                sectionTotal(section.code, 'montantPrevu') > 0
                  ? ((sectionTotal(section.code, 'montantEmis') / sectionTotal(section.code, 'montantPrevu')) * 100).toFixed(2) + '%'
                  : '-'
              }}
            </td>
          </tr>
        </template>
        <!-- Grand total -->
        <tr class="bg-grey-4 text-weight-bold">
          <td>TOTAL GENERAL DES RECETTES AU TITRE I</td>
          <td class="text-right">{{ fmt(data.totalPrevuRecFonct.value) }}</td>
          <td class="text-right">{{ fmt(data.totalEmissionsFonct.value) }}</td>
          <td class="text-right">{{ fmt(data.totalRecettesFonct.value) }}</td>
          <td class="text-right">-</td>
          <td class="text-right">
            {{ data.totalPrevuRecFonct.value - data.totalRecettesFonct.value > 0 ? fmt(data.totalPrevuRecFonct.value - data.totalRecettesFonct.value) : '-' }}
          </td>
          <td class="text-right">
            {{ fmt(data.totalPrevuRecFonct.value - data.totalEmissionsFonct.value) }}
          </td>
          <td class="text-right">
            {{
              data.totalPrevuRecFonct.value > 0
                ? ((data.totalEmissionsFonct.value / data.totalPrevuRecFonct.value) * 100).toFixed(2) + '%'
                : '-'
            }}
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
  { code: '70', libelle: 'SECTION 70 - RECETTES FISCALES', label: 'SECTION 70' },
  { code: '71', libelle: 'SECTION 71 - RECETTES DES PRESTATIONS ET SERVICES', label: 'SECTION 71' },
  { code: '72', libelle: 'SECTION 72 - REVENUS DU PATRIMOINE ET DU PORTEFEUILLE', label: 'SECTION 72' },
  { code: '73', libelle: "SECTION 73 - AIDE DE L'ETAT, FONDS DE CONCOURS, AIDES EXTERIEURES", label: 'SECTION 73' },
  { code: '74', libelle: 'SECTION 74 - RECETTES DIVERS AU TITRE I', label: 'SECTION 74' },
];

// Get chapitre-level entries (3-digit codes like 700, 702, 703, 710, etc.)
function getChapitres(sectionCode: string) {
  return props.data.recettesFonctionnement.value.filter(
    (r) => r.code.startsWith(sectionCode) && r.code.length === 3,
  );
}

// Get article-level entries (4+ digit codes under a chapitre)
function getArticles(chapitreCode: string): LigneRecette[] {
  return props.data.recettesFonctionnement.value.filter(
    (r) => r.code.startsWith(chapitreCode) && r.code.length > 3,
  );
}

function chapTotal(chapCode: string, field: 'montantPrevu' | 'montantEmis' | 'montantRecouvre'): number {
  return getArticles(chapCode).reduce((s, r) => s + r[field], 0);
}

function sectionTotal(sectionCode: string, field: 'montantPrevu' | 'montantEmis' | 'montantRecouvre'): number {
  return props.data.recettesFonctionnement.value
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
.recfonct-table {
  font-size: 11px;
}
.recfonct-table th {
  font-size: 9px;
  background-color: #f0f0f0;
}
.article-row td {
  font-size: 10px;
}
</style>
