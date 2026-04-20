<template>
  <div>
    <div class="text-center q-mb-lg">
      <div class="text-h5 text-weight-bold">RECAPITULATIF GLOBAL - COMPTE ADMINISTRATIF {{ data.exercice.value }}</div>
      <div class="text-subtitle2 text-grey-7">Synthese de l'execution budgetaire</div>
    </div>

    <!-- ========== TITRE I - FONCTIONNEMENT ========== -->
    <div class="text-center text-weight-bold q-mb-sm text-h6">TITRE I - BUDGET DE FONCTIONNEMENT</div>

    <!-- Recettes Fonctionnement -->
    <div class="text-center text-weight-bold q-mb-xs">RECETTES DE FONCTIONNEMENT</div>
    <q-markup-table dense bordered flat separator="cell" class="recap-table q-mb-md">
      <thead>
        <tr>
          <th class="text-left" style="width: 280px">SECTIONS BUDGETAIRES</th>
          <th class="text-right">PREVISIONS</th>
          <th class="text-right">EMISSIONS</th>
          <th class="text-right">RECOUVREMENT</th>
          <th class="text-right">ECART PREV/EMIS</th>
          <th class="text-right">E / P %</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in data.recapRecettesFonct.value" :key="row.code">
          <td>{{ row.libelle }}</td>
          <td class="text-right">{{ fmt(row.prevu) }}</td>
          <td class="text-right">{{ fmt(row.emissions) }}</td>
          <td class="text-right">{{ fmt(row.recouvrement) }}</td>
          <td class="text-right">{{ fmt(row.ecartPrevEmission) }}</td>
          <td class="text-right">{{ row.tauxEP.toFixed(2) }}%</td>
        </tr>
        <tr class="bg-grey-3 text-weight-bold">
          <td class="text-center">TOTAL RECETTES TITRE I</td>
          <td class="text-right">{{ fmt(data.totalPrevuRecFonct.value) }}</td>
          <td class="text-right">{{ fmt(data.totalEmissionsFonct.value) }}</td>
          <td class="text-right">{{ fmt(data.totalRecettesFonct.value) }}</td>
          <td class="text-right">{{ fmt(data.totalPrevuRecFonct.value - data.totalEmissionsFonct.value) }}</td>
          <td class="text-right">
            {{ data.totalPrevuRecFonct.value > 0 ? ((data.totalEmissionsFonct.value / data.totalPrevuRecFonct.value) * 100).toFixed(2) : '0.00' }}%
          </td>
        </tr>
      </tbody>
    </q-markup-table>

    <!-- Depenses Fonctionnement -->
    <div class="text-center text-weight-bold q-mb-xs">DEPENSES DE FONCTIONNEMENT</div>
    <q-markup-table dense bordered flat separator="cell" class="recap-table q-mb-lg">
      <thead>
        <tr>
          <th class="text-left" style="width: 280px">SECTIONS BUDGETAIRES</th>
          <th class="text-right">PREVISIONS</th>
          <th class="text-right">% REALISATION</th>
          <th class="text-right">DEPENSES MANDATEES</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in data.recapDepensesFonct.value" :key="row.code">
          <td>{{ row.libelle }}</td>
          <td class="text-right">{{ fmt(row.previsionsEngagees) }}</td>
          <td class="text-right">{{ row.pourcentageRealisation.toFixed(2) }}%</td>
          <td class="text-right">{{ fmt(row.depensesMandatees) }}</td>
        </tr>
        <tr class="bg-grey-3 text-weight-bold">
          <td class="text-center">TOTAL DEPENSES TITRE I</td>
          <td class="text-right">{{ fmt(data.totalPrevuDepFonct.value) }}</td>
          <td class="text-right">
            {{ data.totalPrevuDepFonct.value > 0 ? ((data.totalDepensesFonct.value / data.totalPrevuDepFonct.value) * 100).toFixed(2) : '0.00' }}%
          </td>
          <td class="text-right">{{ fmt(data.totalDepensesFonct.value) }}</td>
        </tr>
      </tbody>
    </q-markup-table>

    <!-- Resultat Fonctionnement -->
    <q-card flat bordered class="q-mb-lg q-pa-sm">
      <div class="row q-col-gutter-md text-center">
        <div class="col-4">
          <div class="text-caption text-grey-7">Recettes Fonct.</div>
          <div class="text-h6 text-positive text-weight-bold">{{ fmt(data.totalRecettesFonct.value) }}</div>
        </div>
        <div class="col-4">
          <div class="text-caption text-grey-7">Depenses Fonct.</div>
          <div class="text-h6 text-negative text-weight-bold">{{ fmt(data.totalDepensesFonct.value) }}</div>
        </div>
        <div class="col-4">
          <div class="text-caption text-grey-7">Resultat Fonct.</div>
          <div class="text-h6 text-weight-bold" :class="data.resultatFonctionnement.value >= 0 ? 'text-positive' : 'text-negative'">
            {{ fmtSigned(data.resultatFonctionnement.value) }}
          </div>
        </div>
      </div>
    </q-card>

    <q-separator class="q-my-lg" />

    <!-- ========== TITRE II - INVESTISSEMENT ========== -->
    <div class="text-center text-weight-bold q-mb-sm text-h6">TITRE II - BUDGET D'INVESTISSEMENT</div>

    <!-- Recettes Investissement -->
    <div class="text-center text-weight-bold q-mb-xs">RECETTES D'INVESTISSEMENT</div>
    <q-markup-table dense bordered flat separator="cell" class="recap-table q-mb-md">
      <thead>
        <tr>
          <th class="text-left" style="width: 280px">SECTIONS BUDGETAIRES</th>
          <th class="text-right">PREVISIONS</th>
          <th class="text-right">EMISSIONS</th>
          <th class="text-right">RECOUVREMENT</th>
          <th class="text-right">ECART PREV/EMIS</th>
          <th class="text-right">E / P %</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in data.recapRecettesInvest.value" :key="row.code">
          <td>{{ row.libelle }}</td>
          <td class="text-right">{{ fmt(row.prevu) }}</td>
          <td class="text-right">{{ fmt(row.emissions) }}</td>
          <td class="text-right">{{ fmt(row.recouvrement) }}</td>
          <td class="text-right">{{ fmt(row.ecartPrevEmission) }}</td>
          <td class="text-right">{{ row.tauxEP.toFixed(2) }}%</td>
        </tr>
        <tr class="bg-grey-3 text-weight-bold">
          <td class="text-center">TOTAL RECETTES TITRE II</td>
          <td class="text-right">{{ fmt(data.totalPrevuRecInvest.value) }}</td>
          <td class="text-right">{{ fmt(data.totalEmissionsInvest.value) }}</td>
          <td class="text-right">{{ fmt(data.totalRecettesInvest.value) }}</td>
          <td class="text-right">{{ fmt(data.totalPrevuRecInvest.value - data.totalEmissionsInvest.value) }}</td>
          <td class="text-right">
            {{ data.totalPrevuRecInvest.value > 0 ? ((data.totalEmissionsInvest.value / data.totalPrevuRecInvest.value) * 100).toFixed(2) : '0.00' }}%
          </td>
        </tr>
      </tbody>
    </q-markup-table>

    <!-- Depenses Investissement -->
    <div class="text-center text-weight-bold q-mb-xs">DEPENSES D'INVESTISSEMENT</div>
    <q-markup-table dense bordered flat separator="cell" class="recap-table q-mb-lg">
      <thead>
        <tr>
          <th class="text-left" style="width: 280px">SECTIONS BUDGETAIRES</th>
          <th class="text-right">PREVISIONS</th>
          <th class="text-right">% REALISATION</th>
          <th class="text-right">DEPENSES MANDATEES</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in data.recapDepensesInvest.value" :key="row.code">
          <td>{{ row.libelle }}</td>
          <td class="text-right">{{ fmt(row.previsionsEngagees) }}</td>
          <td class="text-right">{{ row.pourcentageRealisation.toFixed(2) }}%</td>
          <td class="text-right">{{ fmt(row.depensesMandatees) }}</td>
        </tr>
        <tr class="bg-grey-3 text-weight-bold">
          <td class="text-center">TOTAL DEPENSES TITRE II</td>
          <td class="text-right">{{ fmt(data.totalPrevuDepInvest.value) }}</td>
          <td class="text-right">
            {{ data.totalPrevuDepInvest.value > 0 ? ((data.totalDepensesInvest.value / data.totalPrevuDepInvest.value) * 100).toFixed(2) : '0.00' }}%
          </td>
          <td class="text-right">{{ fmt(data.totalDepensesInvest.value) }}</td>
        </tr>
      </tbody>
    </q-markup-table>

    <!-- Resultat Investissement -->
    <q-card flat bordered class="q-mb-lg q-pa-sm">
      <div class="row q-col-gutter-md text-center">
        <div class="col-4">
          <div class="text-caption text-grey-7">Recettes Invest.</div>
          <div class="text-h6 text-positive text-weight-bold">{{ fmt(data.totalRecettesInvest.value) }}</div>
        </div>
        <div class="col-4">
          <div class="text-caption text-grey-7">Depenses Invest.</div>
          <div class="text-h6 text-negative text-weight-bold">{{ fmt(data.totalDepensesInvest.value) }}</div>
        </div>
        <div class="col-4">
          <div class="text-caption text-grey-7">Resultat Invest.</div>
          <div class="text-h6 text-weight-bold" :class="data.resultatInvestissement.value >= 0 ? 'text-positive' : 'text-negative'">
            {{ fmtSigned(data.resultatInvestissement.value) }}
          </div>
        </div>
      </div>
    </q-card>

    <q-separator class="q-my-lg" />

    <!-- ========== TABLEAU DES RESULTATS DU COMPTE ADMINISTRATIF ========== -->
    <div class="text-center q-mb-md">
      <div class="text-h6 text-weight-bold">TABLEAU DES RESULTATS DU COMPTE ADMINISTRATIF</div>
      <div class="text-caption text-grey-7">(Montants en Francs CFA)</div>
    </div>

    <!-- RESULTAT AVANT CORRECTION -->
    <q-markup-table dense bordered flat separator="cell" class="resultat-table q-mb-md">
      <thead>
        <tr>
          <td colspan="10" class="doc-header-cell">
            <div class="doc-header-grid">
              <div class="doc-header-block doc-header-left">COMPTE ADMINISTRATIF</div>
              <div class="doc-header-block doc-header-center">RESULTAT AVANT CORRECTION</div>
              <div class="doc-header-block doc-header-right">
                ANNEE<br />{{ data.exercice.value }}
              </div>
            </div>
          </td>
        </tr>
        <tr>
          <th rowspan="2" class="text-left" style="min-width: 180px">BUDGET</th>
          <th rowspan="2" class="text-right">PREVISIONS<br />BUDGETAIRES</th>
          <th rowspan="2" class="text-right">RECETTES<br />RECOUVREES</th>
          <th rowspan="2" class="text-right">DEPENSES<br />ORDONNANCEES</th>
          <th colspan="2" class="text-center">EXERCICE EN COURS</th>
          <th colspan="2" class="text-center">EXERCICE PRECEDENT</th>
          <th colspan="2" class="text-center">RESULTAT CUMULE</th>
        </tr>
        <tr>
          <th class="text-right">EXCEDENT</th>
          <th class="text-right">DEFICIT</th>
          <th class="text-right">EXCEDENT</th>
          <th class="text-right">DEFICIT</th>
          <th class="text-right">EXCEDENT</th>
          <th class="text-right">DEFICIT</th>
        </tr>
      </thead>
      <tbody>
        <!-- FONCTIONNEMENT -->
        <tr>
          <td class="text-weight-bold">FONCTIONNEMENT</td>
          <td class="text-right">{{ fmt(data.totalPrevuRecFonct.value) }}</td>
          <td class="text-right">{{ fmt(data.totalRecettesFonct.value) }}</td>
          <td class="text-right">{{ fmt(data.totalDepensesFonct.value) }}</td>
          <td class="text-right">{{ data.resultatFonctionnement.value > 0 ? fmt(data.resultatFonctionnement.value) : '-' }}</td>
          <td class="text-right">{{ data.resultatFonctionnement.value < 0 ? fmt(Math.abs(data.resultatFonctionnement.value)) : '-' }}</td>
          <td class="text-right">{{ data.resultatFonctPrev.value > 0 ? fmt(data.resultatFonctPrev.value) : '-' }}</td>
          <td class="text-right">{{ data.resultatFonctPrev.value < 0 ? fmt(Math.abs(data.resultatFonctPrev.value)) : '-' }}</td>
          <td class="text-right">{{ data.resultatCumuleFonct.value > 0 ? fmt(data.resultatCumuleFonct.value) : '-' }}</td>
          <td class="text-right">{{ data.resultatCumuleFonct.value < 0 ? fmt(Math.abs(data.resultatCumuleFonct.value)) : '-' }}</td>
        </tr>
        <!-- INVESTISSEMENT -->
        <tr>
          <td class="text-weight-bold">INVESTISSEMENT</td>
          <td class="text-right">{{ fmt(data.totalPrevuRecInvest.value) }}</td>
          <td class="text-right">{{ fmt(data.totalRecettesInvest.value) }}</td>
          <td class="text-right">{{ fmt(data.totalDepensesInvest.value) }}</td>
          <td class="text-right">{{ data.resultatInvestissement.value > 0 ? fmt(data.resultatInvestissement.value) : '-' }}</td>
          <td class="text-right">{{ data.resultatInvestissement.value < 0 ? fmt(Math.abs(data.resultatInvestissement.value)) : '-' }}</td>
          <td class="text-right">{{ data.resultatInvestPrev.value > 0 ? fmt(data.resultatInvestPrev.value) : '-' }}</td>
          <td class="text-right">{{ data.resultatInvestPrev.value < 0 ? fmt(Math.abs(data.resultatInvestPrev.value)) : '-' }}</td>
          <td class="text-right">{{ data.resultatCumuleInvest.value > 0 ? fmt(data.resultatCumuleInvest.value) : '-' }}</td>
          <td class="text-right">{{ data.resultatCumuleInvest.value < 0 ? fmt(Math.abs(data.resultatCumuleInvest.value)) : '-' }}</td>
        </tr>
        <!-- TOTAL -->
        <tr class="bg-grey-4 text-weight-bold">
          <td>TOTAL</td>
          <td class="text-right">{{ fmt(data.totalPrevuRecFonct.value + data.totalPrevuRecInvest.value) }}</td>
          <td class="text-right">{{ fmt(data.totalRecettesFonct.value + data.totalRecettesInvest.value) }}</td>
          <td class="text-right">{{ fmt(data.totalDepensesFonct.value + data.totalDepensesInvest.value) }}</td>
          <td class="text-right">{{ data.resultatGlobal.value > 0 ? fmt(data.resultatGlobal.value) : '-' }}</td>
          <td class="text-right">{{ data.resultatGlobal.value < 0 ? fmt(Math.abs(data.resultatGlobal.value)) : '-' }}</td>
          <td class="text-right">{{ prevGlobal > 0 ? fmt(prevGlobal) : '-' }}</td>
          <td class="text-right">{{ prevGlobal < 0 ? fmt(Math.abs(prevGlobal)) : '-' }}</td>
          <td class="text-right">{{ data.resultatCumuleGlobal.value > 0 ? fmt(data.resultatCumuleGlobal.value) : '-' }}</td>
          <td class="text-right">{{ data.resultatCumuleGlobal.value < 0 ? fmt(Math.abs(data.resultatCumuleGlobal.value)) : '-' }}</td>
        </tr>
      </tbody>
    </q-markup-table>

    <!-- Certification avant correction -->
    <div class="certification q-mb-sm">
      <p>
        Arrete le resultat avant correction du present compte administratif a la somme de :
        <strong>{{ fmt(Math.abs(data.resultatCumuleGlobal.value)) }} Francs CFA</strong>
      </p>
    </div>
    <div class="sig-date q-mb-sm">
      Fait a {{ data.ville.value || '________' }} le 31 Decembre {{ data.exercice.value }}
    </div>
    <div class="sig-grid q-mb-xl">
      <div>LE TRESORIER PRINCIPAL</div>
      <div class="text-center"></div>
      <div class="text-right">LE MAIRE</div>
    </div>

    <!-- RESULTAT APRES CORRECTION -->
    <q-markup-table dense bordered flat separator="cell" class="resultat-table q-mb-md">
      <thead>
        <tr>
          <td colspan="7" class="doc-header-cell">
            <div class="doc-header-grid">
              <div class="doc-header-block doc-header-left">COMPTE ADMINISTRATIF</div>
              <div class="doc-header-block doc-header-center">RESULTAT APRES CORRECTION</div>
              <div class="doc-header-block doc-header-right">
                ANNEE<br />{{ data.exercice.value }}
              </div>
            </div>
          </td>
        </tr>
        <tr>
          <th rowspan="2" class="text-left" style="min-width: 180px">BUDGET</th>
          <th colspan="2" class="text-center">RESULTAT AVANT CORRECTION</th>
          <th rowspan="2" class="text-right">NON VALEUR<br />ADMISE EN<br />DECHARGE</th>
          <th rowspan="2" class="text-right">ENGAGEMENTS<br />NON MANDATES</th>
          <th colspan="2" class="text-center">RESULTAT APRES CORRECTION</th>
        </tr>
        <tr>
          <th class="text-right">EXCEDENT</th>
          <th class="text-right">DEFICIT</th>
          <th class="text-right">EXCEDENT</th>
          <th class="text-right">DEFICIT</th>
        </tr>
      </thead>
      <tbody>
        <!-- TITRE I FONCTIONNEMENT -->
        <tr>
          <td class="text-weight-bold">TITRE I FONCTIONNEMENT</td>
          <td class="text-right">{{ data.resultatCumuleFonct.value > 0 ? fmt(data.resultatCumuleFonct.value) : '' }}</td>
          <td class="text-right">{{ data.resultatCumuleFonct.value < 0 ? fmt(Math.abs(data.resultatCumuleFonct.value)) : '' }}</td>
          <td class="text-right"></td>
          <td class="text-right"></td>
          <td class="text-right">{{ data.resultatCumuleFonct.value > 0 ? fmt(data.resultatCumuleFonct.value) : '' }}</td>
          <td class="text-right">{{ data.resultatCumuleFonct.value < 0 ? fmt(Math.abs(data.resultatCumuleFonct.value)) : '' }}</td>
        </tr>
        <!-- TITRE II INVESTISSEMENT -->
        <tr>
          <td class="text-weight-bold">TITRE II INVESTISSEMENT</td>
          <td class="text-right">{{ data.resultatCumuleInvest.value > 0 ? fmt(data.resultatCumuleInvest.value) : '' }}</td>
          <td class="text-right">{{ data.resultatCumuleInvest.value < 0 ? fmt(Math.abs(data.resultatCumuleInvest.value)) : '' }}</td>
          <td class="text-right"></td>
          <td class="text-right"></td>
          <td class="text-right">{{ data.resultatCumuleInvest.value > 0 ? fmt(data.resultatCumuleInvest.value) : '' }}</td>
          <td class="text-right">{{ data.resultatCumuleInvest.value < 0 ? fmt(Math.abs(data.resultatCumuleInvest.value)) : '' }}</td>
        </tr>
        <!-- TOTAL -->
        <tr class="bg-grey-4 text-weight-bold">
          <td>TOTAL</td>
          <td class="text-right">{{ data.resultatCumuleGlobal.value > 0 ? fmt(data.resultatCumuleGlobal.value) : '' }}</td>
          <td class="text-right">{{ data.resultatCumuleGlobal.value < 0 ? fmt(Math.abs(data.resultatCumuleGlobal.value)) : '' }}</td>
          <td class="text-right"></td>
          <td class="text-right"></td>
          <td class="text-right">{{ data.resultatCumuleGlobal.value > 0 ? fmt(data.resultatCumuleGlobal.value) : '' }}</td>
          <td class="text-right">{{ data.resultatCumuleGlobal.value < 0 ? fmt(Math.abs(data.resultatCumuleGlobal.value)) : '' }}</td>
        </tr>
      </tbody>
    </q-markup-table>

    <!-- Certification apres correction -->
    <div class="certification q-mb-sm">
      <p>
        Arrete le resultat apres correction du present compte administratif a la somme de :
        <strong>{{ fmt(Math.abs(data.resultatCumuleGlobal.value)) }} Francs CFA</strong>
      </p>
    </div>
    <div class="sig-date q-mb-sm">
      Fait a {{ data.ville.value || '________' }} le 31 Decembre {{ data.exercice.value }}
    </div>
    <div class="sig-grid">
      <div>LE TRESORIER PRINCIPAL</div>
      <div class="text-center"></div>
      <div class="text-right">LE MAIRE</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { useCompteAdmin } from 'src/composables/useCompteAdmin';

const props = defineProps<{ data: ReturnType<typeof useCompteAdmin> }>();

const prevGlobal = computed(
  () => props.data.resultatFonctPrev.value + props.data.resultatInvestPrev.value,
);

function fmt(v: number) {
  return new Intl.NumberFormat('fr-FR').format(v);
}

function fmtSigned(v: number) {
  if (v === 0) return '-';
  return new Intl.NumberFormat('fr-FR').format(v);
}
</script>

<style scoped>
.recap-table {
  font-size: 11px;
}
.recap-table th {
  font-size: 9px;
  background-color: #f0f0f0;
}
.resultat-table {
  font-size: 11px;
}
.resultat-table th {
  font-size: 9px;
  background-color: #f0f0f0;
}
.doc-header-cell {
  padding: 0 !important;
  background: #fff !important;
}
.doc-header-grid {
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 2fr 1fr;
}
.doc-header-block {
  padding: 8px 12px;
  min-height: 40px;
}
.doc-header-block + .doc-header-block {
  border-left: 1px solid #ccc;
}
.doc-header-left {
  text-align: left;
  font-weight: bold;
}
.doc-header-center {
  text-align: center;
  font-weight: bold;
  font-size: 13px;
}
.doc-header-right {
  text-align: right;
  font-weight: bold;
}
.certification {
  font-size: 11px;
}
.sig-date {
  text-align: right;
  font-size: 11px;
}
.sig-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  font-weight: bold;
  font-size: 11px;
}
</style>
