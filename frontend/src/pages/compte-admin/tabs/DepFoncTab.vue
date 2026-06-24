<template>
  <div>
    <div class="text-center q-mb-md">
      <div class="text-h6 text-weight-bold">VENTILATION DES DEPENSES PAR PARAGRAPHE</div>
    </div>

    <q-markup-table dense bordered flat separator="cell" class="ventilation-table">
      <thead>
        <tr>
          <th rowspan="2" class="text-left" style="min-width: 220px">RUBRIQUES BUDGETAIRES</th>
          <th rowspan="2" class="text-right">PREVISIONS</th>
          <th rowspan="2" class="text-right">MANDATS</th>
          <th rowspan="2" class="text-right">CREDITS<br />SANS EMPLOIS</th>
          <th colspan="8" class="text-center">VENTILATION DES DEPENSES PAR PARAGRAPHE</th>
          <th rowspan="2" class="text-right">TOTAUX</th>
        </tr>
        <tr>
          <th class="text-right col-para">SALAIRES ET<br />INDEMNITES</th>
          <th class="text-right col-para">CHARGES<br />SOCIALES</th>
          <th class="text-right col-para">TRANSPORT ET<br />FRAIS DE MISSION</th>
          <th class="text-right col-para">CARBURANT ET<br />LUBRIFIANTS</th>
          <th class="text-right col-para">MATERIELS ET<br />FOURNITURES</th>
          <th class="text-right col-para">ABONNEMENT EAU,<br />ELECTRICITE, TEL.</th>
          <th class="text-right col-para">TRAVAUX ET SERVICES<br />A L'ENTREPRISE</th>
          <th class="text-right col-para">INTERVENTIONS<br />ET TRANSFERTS</th>
        </tr>
      </thead>
      <tbody>
        <template v-for="section in depenseSections" :key="section.code">
          <!-- Section header -->
          <tr class="section-header-row">
            <td colspan="13">SECTION {{ section.code }}-{{ section.libelle }}</td>
          </tr>

          <!-- Chapitre groups (3-digit) -->
          <template v-for="chapGroup in getChapitreGroups(section.code)" :key="chapGroup.code">
            <tr class="chapitre-header-row">
              <td colspan="13">
                CHAPITRE {{ chapGroup.code }}&nbsp;:&nbsp;{{ chapGroup.libelle }}
              </td>
            </tr>

            <!-- Articles under this chapitre -->
            <template v-for="article in chapGroup.articles" :key="article.sousChapitreId">
              <!-- Article header -->
              <tr class="article-header-row">
                <td colspan="13" class="q-pl-md">{{ article.code }} - {{ article.libelle }}</td>
              </tr>

              <!-- Paragraph rows /1 through /8 -->
              <tr
                v-for="para in getArticleParagraphes(article)"
                :key="`${article.sousChapitreId}-${para.n}`"
                class="paragraph-row"
              >
                <td class="q-pl-lg">
                  {{ article.code }}/{{ para.n }}&nbsp;&nbsp;{{ para.libelle }}
                </td>
                <td class="text-right">{{ fmtDash(para.prevu) }}</td>
                <td class="text-right">{{ fmtDash(para.mandat) }}</td>
                <td class="text-right">{{ fmtCredits(para.prevu, para.mandat) }}</td>
                <td v-for="col in 8" :key="col" class="text-right">
                  {{ col === para.n ? fmtDash(para.mandat) : '' }}
                </td>
                <td class="text-right">{{ fmtDash(para.mandat) }}</td>
              </tr>

              <!-- SOUS TOTAL ARTICLE -->
              <tr class="subtotal-row">
                <td class="q-pl-md text-italic">SOUS TOTAL ARTICLE {{ article.code }}</td>
                <td class="text-right">{{ fmt(article.montantPrevu) }}</td>
                <td class="text-right">{{ fmt(article.total) }}</td>
                <td class="text-right">
                  {{ fmt(article.montantPrevu - article.total) }}
                </td>
                <td class="text-right">{{ fmtZ(article.chap1) }}</td>
                <td class="text-right">{{ fmtZ(article.chap2) }}</td>
                <td class="text-right">{{ fmtZ(article.chap3) }}</td>
                <td class="text-right">{{ fmtZ(article.chap4) }}</td>
                <td class="text-right">{{ fmtZ(article.chap5) }}</td>
                <td class="text-right">{{ fmtZ(article.chap6) }}</td>
                <td class="text-right">{{ fmtZ(article.chap7) }}</td>
                <td class="text-right">{{ fmtZ(article.chap8) }}</td>
                <td class="text-right">{{ fmt(article.total) }}</td>
              </tr>
            </template>
          </template>

          <!-- Section total -->
          <tr class="section-total-row">
            <td>TOTAL SECTION {{ section.code }}</td>
            <td class="text-right">
              {{ fmt(sectionSum(section.code, 'montantPrevu')) }}
            </td>
            <td class="text-right">
              {{ fmt(sectionSum(section.code, 'total')) }}
            </td>
            <td class="text-right">
              {{
                fmt(sectionSum(section.code, 'montantPrevu') - sectionSum(section.code, 'total'))
              }}
            </td>
            <td class="text-right">{{ fmtZ(sectionSum(section.code, 'chap1')) }}</td>
            <td class="text-right">{{ fmtZ(sectionSum(section.code, 'chap2')) }}</td>
            <td class="text-right">{{ fmtZ(sectionSum(section.code, 'chap3')) }}</td>
            <td class="text-right">{{ fmtZ(sectionSum(section.code, 'chap4')) }}</td>
            <td class="text-right">{{ fmtZ(sectionSum(section.code, 'chap5')) }}</td>
            <td class="text-right">{{ fmtZ(sectionSum(section.code, 'chap6')) }}</td>
            <td class="text-right">{{ fmtZ(sectionSum(section.code, 'chap7')) }}</td>
            <td class="text-right">{{ fmtZ(sectionSum(section.code, 'chap8')) }}</td>
            <td class="text-right">
              {{ fmt(sectionSum(section.code, 'total')) }}
            </td>
          </tr>
        </template>

        <!-- Grand total -->
        <tr class="grand-total-row">
          <td>TOTAL GENERAL DES DEPENSES AU TITRE I</td>
          <td class="text-right">{{ fmt(totals.prevu) }}</td>
          <td class="text-right">{{ fmt(totals.total) }}</td>
          <td class="text-right">{{ fmt(totals.prevu - totals.total) }}</td>
          <td class="text-right">{{ fmt(totals.chap1) }}</td>
          <td class="text-right">{{ fmt(totals.chap2) }}</td>
          <td class="text-right">{{ fmt(totals.chap3) }}</td>
          <td class="text-right">{{ fmt(totals.chap4) }}</td>
          <td class="text-right">{{ fmt(totals.chap5) }}</td>
          <td class="text-right">{{ fmt(totals.chap6) }}</td>
          <td class="text-right">{{ fmt(totals.chap7) }}</td>
          <td class="text-right">{{ fmt(totals.chap8) }}</td>
          <td class="text-right">{{ fmt(totals.total) }}</td>
        </tr>
      </tbody>
    </q-markup-table>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { useCompteAdmin, DepenseVentilee } from 'src/composables/useCompteAdmin';

const props = defineProps<{ data: ReturnType<typeof useCompteAdmin> }>();

// Labels pour les 8 paragraphes (chapitres 1-8)
const paragrapheLabels: Record<number, string> = {
  1: 'Salaires et indemnités',
  2: 'Charges sociales',
  3: 'Transport et frais de mission',
  4: 'Carburant et lubrifiants',
  5: 'Matériels et fournitures',
  6: 'Abonnements eau, électricité et téléphone',
  7: "Travaux et services à l'entreprise",
  8: 'Intervention et transfert',
};

const depenseSections = [
  { code: '60', libelle: 'DEPENSES DES SERVICES GENERAUX' },
  { code: '61', libelle: 'DEPENSES DES SERVICES DE COLLECTIVITE' },
  { code: '62', libelle: 'DEPENSES DES SERVICES SOCIOCULTURELS ET DE PROM. HUM.' },
  { code: '63', libelle: 'DEPENSES DES SERVICES ECONOMIQUES' },
  { code: '64', libelle: 'DEPENSES DIVERSES AU TITRE I' },
];

// Libellés des chapitres (3 digits) - dérivés du premier article
function getChapitreLibelle(chapCode: string, articles: DepenseVentilee[]): string {
  // Prend le libellé du premier article comme indication du chapitre
  const first = articles[0];
  if (first) {
    // Si le code de l'article est exactement 4 digits et commence par le chapitre code
    if (first.code.length === 4) {
      return first.libelle.toUpperCase();
    }
  }
  return '';
}

interface ChapitreGroup {
  code: string;
  libelle: string;
  articles: DepenseVentilee[];
}

function getSectionRows(sectionCode: string): DepenseVentilee[] {
  return props.data.depensesVentilees.value.filter((r) => r.code.startsWith(sectionCode));
}

// Grouper les articles par chapitre (3 premiers digits du code)
function getChapitreGroups(sectionCode: string): ChapitreGroup[] {
  const rows = getSectionRows(sectionCode);
  const groupMap = new Map<string, DepenseVentilee[]>();

  for (const row of rows) {
    const chapCode = row.code.substring(0, 3);
    if (!groupMap.has(chapCode)) {
      groupMap.set(chapCode, []);
    }
    groupMap.get(chapCode)!.push(row);
  }

  return Array.from(groupMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([code, articles]) => {
      const sorted = articles.sort((a, b) => a.code.localeCompare(b.code));
      return {
        code,
        libelle: getChapitreLibelle(code, sorted),
        articles: sorted,
      };
    });
}

interface ParagrapheRow {
  n: number;
  libelle: string;
  prevu: number;
  mandat: number;
}

// Générer les lignes /1 à /8 pour un article
function getArticleParagraphes(article: DepenseVentilee): ParagrapheRow[] {
  const rows: ParagrapheRow[] = [];
  const chapAmounts = [
    0,
    article.chap1,
    article.chap2,
    article.chap3,
    article.chap4,
    article.chap5,
    article.chap6,
    article.chap7,
    article.chap8,
  ];

  for (let n = 1; n <= 8; n++) {
    const key = `${article.sousChapitreId}-${n}`;
    const prevu = props.data.previsionParParagraphe.value.get(key) || 0;
    const mandat = chapAmounts[n] ?? 0;

    // Afficher la ligne si prévision > 0 ou mandat > 0
    if (prevu > 0 || mandat > 0) {
      rows.push({
        n,
        libelle: paragrapheLabels[n] || `Paragraphe ${n}`,
        prevu,
        mandat,
      });
    }
  }
  return rows;
}

function sectionSum(sectionCode: string, field: keyof DepenseVentilee): number {
  return getSectionRows(sectionCode).reduce((s, r) => s + (r[field] as number), 0);
}

const totals = computed(() => {
  const rows = props.data.depensesVentilees.value;
  return {
    prevu: rows.reduce((s, r) => s + r.montantPrevu, 0),
    chap1: rows.reduce((s, r) => s + r.chap1, 0),
    chap2: rows.reduce((s, r) => s + r.chap2, 0),
    chap3: rows.reduce((s, r) => s + r.chap3, 0),
    chap4: rows.reduce((s, r) => s + r.chap4, 0),
    chap5: rows.reduce((s, r) => s + r.chap5, 0),
    chap6: rows.reduce((s, r) => s + r.chap6, 0),
    chap7: rows.reduce((s, r) => s + r.chap7, 0),
    chap8: rows.reduce((s, r) => s + r.chap8, 0),
    total: rows.reduce((s, r) => s + r.total, 0),
  };
});

function fmt(v: number) {
  return new Intl.NumberFormat('fr-FR').format(v);
}

function fmtZ(v: number) {
  return v === 0 ? '-' : new Intl.NumberFormat('fr-FR').format(v);
}

// Comme fmtZ mais pour les lignes paragraphes (affiche "-" pour 0)
function fmtDash(v: number) {
  return v === 0 ? '-' : new Intl.NumberFormat('fr-FR').format(v);
}

// Credits sans emplois: prevision - mandat, affiche "-" si 0 ou négatif
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
.col-para {
  min-width: 65px;
}

/* Section header: CTION 60-DEPENSES... */
.section-header-row td {
  font-weight: bold;
  background-color: #e3f2fd;
  font-size: 10px;
}

/* Chapitre header: CHAPITRE 600 */
.chapitre-header-row td {
  font-weight: bold;
  background-color: #e8eaf6;
  font-size: 9px;
  padding-left: 8px;
}

/* Article header: 6000 - Administration */
.article-header-row td {
  font-weight: 600;
  background-color: #f5f5f5;
  font-size: 9px;
}

/* Paragraph rows: 6000/1 Salaires... */
.paragraph-row td {
  font-size: 9px;
}

/* Sous-total article */
.subtotal-row td {
  font-weight: bold;
  background-color: #f5f5f5;
  font-size: 9px;
}

/* Section total */
.section-total-row td {
  font-weight: bold;
  background-color: #e0e0e0;
  font-size: 9px;
}

/* Grand total */
.grand-total-row td {
  font-weight: bold;
  background-color: #bdbdbd;
  font-size: 10px;
}
</style>
