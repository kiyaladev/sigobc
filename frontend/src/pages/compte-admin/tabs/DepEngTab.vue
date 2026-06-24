<template>
  <div>
    <div class="text-center q-mb-md">
      <div class="text-h6 text-weight-bold">DEPENSES DE FONCTIONNEMENT</div>
    </div>

    <q-markup-table dense bordered flat separator="cell" class="dep-eng-table">
      <thead>
        <tr>
          <th rowspan="2" class="text-left" style="width: 300px">
            COMPTES ET RUBRIQUES BUDGETAIRES
          </th>
          <th rowspan="2" class="text-right">PREVISIONS</th>
          <th colspan="2" class="text-center">DEPENSES ENGAGEES</th>
          <th colspan="4" class="text-center">ENGAGEMENTS NON MANDATES</th>
        </tr>
        <tr>
          <th class="text-right">POURCENTAGE<br />REALISATION</th>
          <th class="text-right">DEPENSES<br />MANDATEES</th>
          <th class="text-right">COMMANDES<br />NON LIVREES</th>
          <th class="text-right">
            COMMANDES<br />LIVREES NON<br />FACTUREES
          </th>
          <th class="text-right">COMMANDES<br />FACTUREES</th>
          <th class="text-right">TOTAL<br />(6 + 7 + 8)</th>
        </tr>
      </thead>
      <tbody>
        <!-- Column numbers -->
        <tr class="col-num-row">
          <td class="text-center">1</td>
          <td class="text-center">2</td>
          <td class="text-center">3</td>
          <td class="text-center">4</td>
          <td class="text-center">5</td>
          <td class="text-center">6</td>
          <td class="text-center">7</td>
          <td class="text-center">8</td>
        </tr>
        <template v-for="section in sections" :key="section.code">
          <!-- Section header -->
          <tr class="section-header-row">
            <td colspan="8">{{ section.libelle }}</td>
          </tr>
          <!-- Chapitre groups (3-digit prefix) -->
          <template
            v-for="chapGroup in getChapitreGroups(section.code)"
            :key="chapGroup.code"
          >
            <tr class="chapitre-header-row">
              <td colspan="8" class="q-pl-md">
                CHAPITRE {{ chapGroup.code }}
              </td>
            </tr>
            <!-- Articles (individual sous-chapitres) -->
            <tr
              v-for="article in chapGroup.articles"
              :key="article.sousChapitreId"
              class="article-row"
            >
              <td class="q-pl-lg">{{ article.code }} - {{ article.libelle }}</td>
              <td class="text-right">{{ fmtZ(article.montantPrevu) }}</td>
              <td class="text-right">
                {{
                  article.montantPrevu > 0
                    ? ((article.montantEngage / article.montantPrevu) * 100).toFixed(2)
                    : '-'
                }}
              </td>
              <td class="text-right">{{ fmtZ(article.montantEngage) }}</td>
              <td class="text-right">-</td>
              <td class="text-right">-</td>
              <td class="text-right">-</td>
              <td class="text-right">-</td>
            </tr>
            <!-- Chapitre subtotal -->
            <tr class="subtotal-row">
              <td class="q-pl-md text-italic">
                SOUS TOTAL CHAPITRE {{ chapGroup.code }}
              </td>
              <td class="text-right">{{ fmtZ(chapGroupTotal(chapGroup, 'montantPrevu')) }}</td>
              <td class="text-right">
                {{
                  chapGroupTotal(chapGroup, 'montantPrevu') > 0
                    ? (
                        (chapGroupTotal(chapGroup, 'montantEngage') /
                          chapGroupTotal(chapGroup, 'montantPrevu')) *
                        100
                      ).toFixed(2)
                    : '-'
                }}
              </td>
              <td class="text-right">{{ fmtZ(chapGroupTotal(chapGroup, 'montantEngage')) }}</td>
              <td class="text-right">-</td>
              <td class="text-right">-</td>
              <td class="text-right">-</td>
              <td class="text-right">-</td>
            </tr>
          </template>
          <!-- Section total -->
          <tr class="section-total-row">
            <td class="text-center">TOTAL SECTION {{ section.code }}</td>
            <td class="text-right">{{ fmt(sectionTotal(section.code, 'montantPrevu')) }}</td>
            <td class="text-right">
              {{
                sectionTotal(section.code, 'montantPrevu') > 0
                  ? (
                      (sectionTotal(section.code, 'montantEngage') /
                        sectionTotal(section.code, 'montantPrevu')) *
                      100
                    ).toFixed(2)
                  : '-'
              }}
            </td>
            <td class="text-right">{{ fmt(sectionTotal(section.code, 'montantEngage')) }}</td>
            <td class="text-right">-</td>
            <td class="text-right">-</td>
            <td class="text-right">-</td>
            <td class="text-right">-</td>
          </tr>
        </template>
        <!-- Grand total -->
        <tr class="grand-total-row">
          <td class="text-center">TOTAL GENERAL DES DEPENSES AU TITRE I</td>
          <td class="text-right">{{ fmt(data.totalPrevuDepFonct.value) }}</td>
          <td class="text-right">
            {{
              data.totalPrevuDepFonct.value > 0
                ? ((data.totalDepensesFonct.value / data.totalPrevuDepFonct.value) * 100).toFixed(2)
                : '0.00'
            }}
          </td>
          <td class="text-right">{{ fmt(data.totalDepensesFonct.value) }}</td>
          <td class="text-right">-</td>
          <td class="text-right">-</td>
          <td class="text-right">-</td>
          <td class="text-right">-</td>
        </tr>
      </tbody>
    </q-markup-table>
  </div>
</template>

<script setup lang="ts">
import type { useCompteAdmin, LigneDepense } from 'src/composables/useCompteAdmin';

const props = defineProps<{ data: ReturnType<typeof useCompteAdmin> }>();

const sections = [
  { code: '60', libelle: 'SECTION 60 - DEPENSES DES SERVICES GENERAUX' },
  { code: '61', libelle: 'SECTION 61 - DEPENSES DES SERVICES DE COLLECTIVITE' },
  {
    code: '62',
    libelle: 'SECTION 62 - DEPENSES DES SERVICES SOCIOCULTURELS ET DE PROM. HUM.',
  },
  { code: '63', libelle: 'SECTION 63 - DEPENSES DES SERVICES ECONOMIQUES' },
  { code: '64', libelle: 'SECTION 64 - DEPENSES DIVERSES AU TITRE I' },
];

interface ChapitreGroup {
  code: string;
  articles: LigneDepense[];
}

// Group sous-chapitres by first 3 digits of code
function getChapitreGroups(sectionCode: string): ChapitreGroup[] {
  const rows = props.data.depensesFonctionnement.value.filter(
    (r) => r.code.startsWith(sectionCode),
  );
  const groupMap = new Map<string, LigneDepense[]>();

  for (const row of rows) {
    const chapCode = row.code.substring(0, 3);
    if (!groupMap.has(chapCode)) {
      groupMap.set(chapCode, []);
    }
    groupMap.get(chapCode)!.push(row);
  }

  return Array.from(groupMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([code, articles]) => ({
      code,
      articles: articles.sort((a, b) => a.code.localeCompare(b.code)),
    }));
}

function chapGroupTotal(group: ChapitreGroup, field: 'montantPrevu' | 'montantEngage'): number {
  return group.articles.reduce((s, r) => s + r[field], 0);
}

function sectionTotal(sectionCode: string, field: 'montantPrevu' | 'montantEngage'): number {
  return props.data.depensesFonctionnement.value
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
.dep-eng-table { font-size: 11px; }
.dep-eng-table th { font-size: 9px; background-color: #f0f0f0; }
.article-row td { font-size: 10px; }
.col-num-row td { text-align: center; font-size: 8px; font-style: italic; background-color: #fafafa; }
.section-header-row td { font-weight: bold; background-color: #e3f2fd; }
.chapitre-header-row td { font-weight: bold; background-color: #e8eaf6; font-size: 10px; }
.subtotal-row td { font-weight: bold; background-color: #f5f5f5; font-size: 10px; }
.section-total-row td { font-weight: bold; background-color: #e0e0e0; }
.grand-total-row td { font-weight: bold; background-color: #bdbdbd; }
</style>
