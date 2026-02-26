<template>
  <div>
    <div class="text-center q-mb-md">
      <div class="text-h6 text-weight-bold">
        DEPENSES D'INVESTISSEMENT - VENTILATION PAR PARAGRAPHE
      </div>
    </div>

    <q-markup-table dense bordered flat separator="cell" class="ventilation-table">
      <thead>
        <tr>
          <th rowspan="2" class="text-left" style="min-width: 200px">COMPTES ET RUBRIQUES BUDGETAIRES</th>
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
        <template v-for="section in investSections" :key="section.code">
          <!-- Section header -->
          <tr class="bg-grey-3 text-weight-bold">
            <td colspan="13">{{ section.libelle }}</td>
          </tr>
          <!-- Detail rows -->
          <tr v-for="row in getSectionRows(section.code)" :key="row.sousChapitreId">
            <td class="ellipsis-cell" :title="row.code + ' - ' + row.libelle">
              {{ row.code }} - {{ row.libelle }}
            </td>
            <td class="text-right">{{ fmtZ(row.montantPrevu) }}</td>
            <td class="text-right">{{ fmtZ(row.total) }}</td>
            <td class="text-right">{{ fmtZ(row.montantPrevu - row.total) }}</td>
            <td class="text-right">{{ fmtZ(row.chap1) }}</td>
            <td class="text-right">{{ fmtZ(row.chap2) }}</td>
            <td class="text-right">{{ fmtZ(row.chap3) }}</td>
            <td class="text-right">{{ fmtZ(row.chap4) }}</td>
            <td class="text-right">{{ fmtZ(row.chap5) }}</td>
            <td class="text-right">{{ fmtZ(row.chap6) }}</td>
            <td class="text-right">{{ fmtZ(row.chap7) }}</td>
            <td class="text-right">{{ fmtZ(row.chap8) }}</td>
            <td class="text-right text-weight-bold">{{ fmtZ(row.total) }}</td>
          </tr>
          <!-- Section total -->
          <tr class="bg-grey-3 text-weight-bold">
            <td>TOTAL SECTION {{ section.code }}</td>
            <td class="text-right">{{ fmt(sectionSum(section.code, 'montantPrevu')) }}</td>
            <td class="text-right">{{ fmt(sectionSum(section.code, 'total')) }}</td>
            <td class="text-right">{{ fmt(sectionSum(section.code, 'montantPrevu') - sectionSum(section.code, 'total')) }}</td>
            <td class="text-right">{{ fmtZ(sectionSum(section.code, 'chap1')) }}</td>
            <td class="text-right">{{ fmtZ(sectionSum(section.code, 'chap2')) }}</td>
            <td class="text-right">{{ fmtZ(sectionSum(section.code, 'chap3')) }}</td>
            <td class="text-right">{{ fmtZ(sectionSum(section.code, 'chap4')) }}</td>
            <td class="text-right">{{ fmtZ(sectionSum(section.code, 'chap5')) }}</td>
            <td class="text-right">{{ fmtZ(sectionSum(section.code, 'chap6')) }}</td>
            <td class="text-right">{{ fmtZ(sectionSum(section.code, 'chap7')) }}</td>
            <td class="text-right">{{ fmtZ(sectionSum(section.code, 'chap8')) }}</td>
            <td class="text-right">{{ fmt(sectionSum(section.code, 'total')) }}</td>
          </tr>
        </template>
        <!-- Grand total -->
        <tr class="bg-grey-4 text-weight-bold">
          <td>TOTAL GENERAL DES DEPENSES AU TITRE II</td>
          <td class="text-right">{{ fmt(totals.prevu) }}</td>
          <td class="text-right">{{ fmt(totals.total) }}</td>
          <td class="text-right">{{ fmt(totals.prevu - totals.total) }}</td>
          <td class="text-right">{{ fmtZ(totals.chap1) }}</td>
          <td class="text-right">{{ fmtZ(totals.chap2) }}</td>
          <td class="text-right">{{ fmtZ(totals.chap3) }}</td>
          <td class="text-right">{{ fmtZ(totals.chap4) }}</td>
          <td class="text-right">{{ fmtZ(totals.chap5) }}</td>
          <td class="text-right">{{ fmtZ(totals.chap6) }}</td>
          <td class="text-right">{{ fmtZ(totals.chap7) }}</td>
          <td class="text-right">{{ fmtZ(totals.chap8) }}</td>
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

const investSections = [
  { code: '90', libelle: 'SECTION 90 - EQUIPEMENT DES SERVICES GENERAUX' },
  { code: '91', libelle: 'SECTION 91 - EQUIPEMENT DES SERVICES DE COLLECTIVITE' },
  { code: '92', libelle: 'SECTION 92 - URBANISME ET ASSAINISSEMENT' },
  { code: '93', libelle: 'SECTION 93 - INVESTISSEMENTS FINANCIERS' },
  { code: '94', libelle: 'SECTION 94 - REMBOURSEMENT EMPRUNTS' },
  { code: '95', libelle: 'SECTION 95 - DEPENSES DIVERSES' },
];

function getSectionRows(sectionCode: string): DepenseVentilee[] {
  return props.data.depensesInvestVentilees.value.filter((r) => r.code.startsWith(sectionCode));
}

function sectionSum(sectionCode: string, field: keyof DepenseVentilee): number {
  return getSectionRows(sectionCode).reduce((s, r) => s + (r[field] as number), 0);
}

const totals = computed(() => {
  const rows = props.data.depensesInvestVentilees.value;
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
</script>

<style scoped>
.ventilation-table { font-size: 9px; }
.ventilation-table th { font-size: 7px; background-color: #f0f0f0; }
.col-para { min-width: 65px; }
.ellipsis-cell { max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
</style>
