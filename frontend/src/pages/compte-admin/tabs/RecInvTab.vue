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
          <tr class="section-header-row">
            <td colspan="8">{{ section.libelle }}</td>
          </tr>

          <!-- Chapitre groups -->
          <template
            v-for="chapGroup in getChapitreGroups(section.code)"
            :key="chapGroup.code"
          >
            <!-- Chapitre header (only if has child articles) -->
            <tr v-if="chapGroup.articles.length > 0" class="chapitre-header-row">
              <td colspan="8" class="q-pl-md">CHAPITRE {{ chapGroup.code }}</td>
            </tr>

            <!-- Articles under this chapitre -->
            <tr
              v-for="article in chapGroup.articles"
              :key="article.taxeId"
              class="article-row"
            >
              <td class="q-pl-lg">{{ article.code }} - {{ article.libelle }}</td>
              <td class="text-right">{{ fmtZ(article.montantPrevu) }}</td>
              <td class="text-right">{{ fmtZ(article.montantEmis) }}</td>
              <td class="text-right">{{ fmtZ(article.montantRecouvre) }}</td>
              <td class="text-right">-</td>
              <td class="text-right">
                {{ article.montantPrevu - article.montantRecouvre > 0 ? fmt(article.montantPrevu - article.montantRecouvre) : '-' }}
              </td>
              <td class="text-right">{{ fmtZ(article.montantPrevu - article.montantRecouvre) }}</td>
              <td class="text-right">
                {{ article.montantPrevu > 0 ? ((article.montantRecouvre / article.montantPrevu) * 100).toFixed(2) : '-' }}
              </td>
            </tr>

            <!-- Chapitre subtotal (only if more than 1 article) -->
            <tr v-if="chapGroup.articles.length > 1" class="subtotal-row">
              <td class="q-pl-md text-italic">SOUS TOTAL CHAPITRE {{ chapGroup.code }}</td>
              <td class="text-right">{{ fmtZ(groupTotal(chapGroup, 'montantPrevu')) }}</td>
              <td class="text-right">{{ fmtZ(groupTotal(chapGroup, 'montantEmis')) }}</td>
              <td class="text-right">{{ fmtZ(groupTotal(chapGroup, 'montantRecouvre')) }}</td>
              <td class="text-right">-</td>
              <td class="text-right">
                {{ groupTotal(chapGroup, 'montantPrevu') - groupTotal(chapGroup, 'montantRecouvre') > 0 ? fmt(groupTotal(chapGroup, 'montantPrevu') - groupTotal(chapGroup, 'montantRecouvre')) : '-' }}
              </td>
              <td class="text-right">{{ fmtZ(groupTotal(chapGroup, 'montantPrevu') - groupTotal(chapGroup, 'montantRecouvre')) }}</td>
              <td class="text-right">
                {{ groupTotal(chapGroup, 'montantPrevu') > 0 ? ((groupTotal(chapGroup, 'montantRecouvre') / groupTotal(chapGroup, 'montantPrevu')) * 100).toFixed(2) : '-' }}
              </td>
            </tr>
          </template>

          <!-- Section total -->
          <tr class="section-total-row">
            <td class="text-center">TOTAL SECTION {{ section.code }}</td>
            <td class="text-right">{{ fmt(sectionTotal(section.code, 'montantPrevu')) }}</td>
            <td class="text-right">{{ fmtZ(sectionTotal(section.code, 'montantEmis')) }}</td>
            <td class="text-right">{{ fmtZ(sectionTotal(section.code, 'montantRecouvre')) }}</td>
            <td class="text-right">-</td>
            <td class="text-right">
              {{ sectionTotal(section.code, 'montantPrevu') - sectionTotal(section.code, 'montantRecouvre') > 0 ? fmt(sectionTotal(section.code, 'montantPrevu') - sectionTotal(section.code, 'montantRecouvre')) : '-' }}
            </td>
            <td class="text-right">{{ fmtZ(sectionTotal(section.code, 'montantPrevu') - sectionTotal(section.code, 'montantRecouvre')) }}</td>
            <td class="text-right">
              {{ sectionTotal(section.code, 'montantPrevu') > 0 ? ((sectionTotal(section.code, 'montantRecouvre') / sectionTotal(section.code, 'montantPrevu')) * 100).toFixed(2) : '-' }}
            </td>
          </tr>
        </template>

        <!-- Grand total -->
        <tr class="grand-total-row">
          <td class="text-center">TOTAL DES RECETTES AU TITRE II</td>
          <td class="text-right">{{ fmt(data.totalPrevuRecInvest.value) }}</td>
          <td class="text-right">{{ fmtZ(data.totalEmissionsInvest.value) }}</td>
          <td class="text-right">{{ fmtZ(data.totalRecettesInvest.value) }}</td>
          <td class="text-right">-</td>
          <td class="text-right">
            {{ data.totalPrevuRecInvest.value - data.totalRecettesInvest.value > 0 ? fmt(data.totalPrevuRecInvest.value - data.totalRecettesInvest.value) : '-' }}
          </td>
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
  { code: '02', libelle: "SECTION 02 - PRELEVEMENTS SUR FONDS D'INVESTISSEMENT" },
  { code: '03', libelle: 'SECTION 03 - CESSIONS IMMOBILIERES' },
  { code: '04', libelle: "SECTION 04 - AIDE DE L'ETAT - FONDS DE CONCOURS - AIDES EXTERIEURES" },
  { code: '05', libelle: 'SECTION 05 - FONDS PROPRES' },
  { code: '06', libelle: 'SECTION 06 - RECETTES DIVERSES AU TITRE II' },
];

interface ChapitreGroup {
  code: string;
  articles: LigneRecette[];
}

// Group all entries under a section, excluding the 2-digit section-level entries
function getChapitreGroups(sectionCode: string): ChapitreGroup[] {
  // Get all entries for this section
  const allEntries = props.data.recettesInvestissement.value.filter(
    (r) => r.code.startsWith(sectionCode),
  );

  if (allEntries.length === 0) return [];

  // Group by first 3 digits
  const groupMap = new Map<string, LigneRecette[]>();

  for (const entry of allEntries) {
    const groupCode = entry.code.substring(0, 3);
    if (!groupMap.has(groupCode)) {
      groupMap.set(groupCode, []);
    }
    groupMap.get(groupCode)!.push(entry);
  }

  return Array.from(groupMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([code, articles]) => ({
      code,
      articles: articles.sort((a, b) => a.code.localeCompare(b.code)),
    }));
}

function groupTotal(group: ChapitreGroup, field: 'montantPrevu' | 'montantEmis' | 'montantRecouvre'): number {
  return group.articles.reduce((s, r) => s + r[field], 0);
}

function sectionTotal(sectionCode: string, field: 'montantPrevu' | 'montantEmis' | 'montantRecouvre'): number {
  return props.data.recettesInvestissement.value
    .filter((r) => r.code.startsWith(sectionCode))
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
.section-header-row td { font-weight: bold; background-color: #e3f2fd; }
.chapitre-header-row td { font-weight: bold; background-color: #e8eaf6; font-size: 10px; }
.subtotal-row td { font-weight: bold; background-color: #f5f5f5; font-size: 10px; }
.section-total-row td { font-weight: bold; background-color: #e0e0e0; }
.grand-total-row td { font-weight: bold; background-color: #bdbdbd; }
</style>
