<template>
  <div>
    <!-- ========== RESULTAT AVANT CORRECTION ========== -->
    <q-markup-table dense bordered flat separator="cell" class="resultat-table q-mb-md">
      <thead>
        <!-- Document header -->
        <tr>
          <td colspan="8" class="doc-header-cell">
            <div class="doc-header-grid">
              <div class="doc-header-block doc-header-left">COMPTE ADMINISTRATIF</div>
              <div class="doc-header-block doc-header-center">RESULTAT AVANT CORRECTION</div>
              <div class="doc-header-block doc-header-right">
                ANNEE<br />{{ data.exercice.value }}
              </div>
            </div>
          </td>
        </tr>
        <!-- Column headers -->
        <tr>
          <th rowspan="2" class="text-left" style="min-width: 220px">BUDGET</th>
          <th rowspan="2" class="text-right">PREVISIONS<br />RECETTES</th>
          <th rowspan="2" class="text-right">RECETTES<br />RECOUVREES</th>
          <th colspan="2" class="text-center">DEPENSES ENGAGEES</th>
          <th colspan="2" class="text-center">RESULTAT</th>
          <th rowspan="2" class="text-right">RESULTAT<br />CUMULE</th>
        </tr>
        <tr>
          <th class="text-right">DEPENSES<br />MANDATEES</th>
          <th class="text-right">CREDITS<br />SANS EMPLOIS</th>
          <th class="text-right">EXCEDENT</th>
          <th class="text-right">DEFICIT</th>
        </tr>
      </thead>
      <tbody>
        <!-- TITRE I FONCTIONNEMENT -->
        <tr>
          <td class="text-weight-bold">TITRE I FONCTIONNEMENT</td>
          <td class="text-right">{{ fmt(data.totalPrevuRecFonct.value) }}</td>
          <td class="text-right">{{ fmt(data.totalRecettesFonct.value) }}</td>
          <td class="text-right">{{ fmt(data.totalDepensesFonct.value) }}</td>
          <td class="text-right">
            {{ fmtZ(data.totalPrevuDepFonct.value - data.totalDepensesFonct.value) }}
          </td>
          <td class="text-right">
            {{
              data.resultatFonctionnement.value > 0 ? fmt(data.resultatFonctionnement.value) : ''
            }}
          </td>
          <td class="text-right">
            {{
              data.resultatFonctionnement.value < 0
                ? fmt(Math.abs(data.resultatFonctionnement.value))
                : ''
            }}
          </td>
          <td class="text-right">{{ fmtSigned(data.resultatFonctionnement.value) }}</td>
        </tr>
        <!-- TITRE II INVESTISSEMENT -->
        <tr>
          <td class="text-weight-bold">TITRE II INVESTISSEMENT</td>
          <td class="text-right">{{ fmt(data.totalPrevuRecInvest.value) }}</td>
          <td class="text-right">{{ fmt(data.totalRecettesInvest.value) }}</td>
          <td class="text-right">{{ fmt(data.totalDepensesInvest.value) }}</td>
          <td class="text-right">
            {{ fmtZ(data.totalPrevuDepInvest.value - data.totalDepensesInvest.value) }}
          </td>
          <td class="text-right">
            {{
              data.resultatInvestissement.value > 0 ? fmt(data.resultatInvestissement.value) : ''
            }}
          </td>
          <td class="text-right">
            {{
              data.resultatInvestissement.value < 0
                ? fmt(Math.abs(data.resultatInvestissement.value))
                : ''
            }}
          </td>
          <td class="text-right">{{ fmtSigned(data.resultatInvestissement.value) }}</td>
        </tr>
        <!-- RESULTAT CUMULE (N-1) -->
        <tr class="bg-grey-2">
          <td class="text-weight-bold">RESULTAT CUMULE</td>
          <td class="text-right"></td>
          <td class="text-right"></td>
          <td class="text-right"></td>
          <td class="text-right"></td>
          <td class="text-right">{{ prevGlobal > 0 ? fmt(prevGlobal) : '' }}</td>
          <td class="text-right">{{ prevGlobal < 0 ? fmt(Math.abs(prevGlobal)) : '' }}</td>
          <td class="text-right">{{ fmtSigned(prevGlobal) }}</td>
        </tr>
        <!-- TOTAL -->
        <tr class="bg-grey-4 text-weight-bold">
          <td>TOTAL</td>
          <td class="text-right">
            {{ fmt(data.totalPrevuRecFonct.value + data.totalPrevuRecInvest.value) }}
          </td>
          <td class="text-right">
            {{ fmt(data.totalRecettesFonct.value + data.totalRecettesInvest.value) }}
          </td>
          <td class="text-right">
            {{ fmt(data.totalDepensesFonct.value + data.totalDepensesInvest.value) }}
          </td>
          <td class="text-right">{{ fmtZ(creditsSansEmploiTotal) }}</td>
          <td class="text-right">
            {{ data.resultatCumuleGlobal.value > 0 ? fmt(data.resultatCumuleGlobal.value) : '' }}
          </td>
          <td class="text-right">
            {{
              data.resultatCumuleGlobal.value < 0
                ? fmt(Math.abs(data.resultatCumuleGlobal.value))
                : ''
            }}
          </td>
          <td class="text-right">{{ fmtSigned(data.resultatCumuleGlobal.value) }}</td>
        </tr>
      </tbody>
    </q-markup-table>

    <!-- Certification avant correction -->
    <div class="certification q-mb-sm">
      <p>
        Arrêté le résultat avant correction du présent compte administratif à la somme de
        {{ fmt(Math.abs(data.resultatCumuleGlobal.value)) }} Francs CFA
      </p>
    </div>
    <div class="sig-date q-mb-sm">
      Fait à {{ data.ville.value || '________' }} le 31 Décembre {{ data.exercice.value }}
    </div>
    <div class="sig-grid q-mb-xl">
      <div>LE TRESORIER PRINCIPAL</div>
      <div class="text-center">LE</div>
      <div class="text-right"></div>
    </div>

    <!-- ========== RESULTAT APRES CORRECTION ========== -->
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
          <th rowspan="2" class="text-left" style="min-width: 220px">BUDGET</th>
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
        <!-- TITRE 1 FONCTIONNEMENT -->
        <tr>
          <td class="text-weight-bold">TITRE 1 FONCTIONNEMENT</td>
          <td class="text-right">
            {{ data.resultatCumuleFonct.value > 0 ? fmt(data.resultatCumuleFonct.value) : '' }}
          </td>
          <td class="text-right">
            {{
              data.resultatCumuleFonct.value < 0
                ? fmt(Math.abs(data.resultatCumuleFonct.value))
                : ''
            }}
          </td>
          <td class="text-right"></td>
          <td class="text-right"></td>
          <td class="text-right">
            {{ data.resultatCumuleFonct.value > 0 ? fmt(data.resultatCumuleFonct.value) : '' }}
          </td>
          <td class="text-right">
            {{
              data.resultatCumuleFonct.value < 0
                ? fmt(Math.abs(data.resultatCumuleFonct.value))
                : ''
            }}
          </td>
        </tr>
        <!-- TITRE 2 INVESTISSEMENT -->
        <tr>
          <td class="text-weight-bold">TITRE 2 INVESTISSEMENT</td>
          <td class="text-right">
            {{ data.resultatCumuleInvest.value > 0 ? fmt(data.resultatCumuleInvest.value) : '' }}
          </td>
          <td class="text-right">
            {{
              data.resultatCumuleInvest.value < 0
                ? fmt(Math.abs(data.resultatCumuleInvest.value))
                : ''
            }}
          </td>
          <td class="text-right"></td>
          <td class="text-right"></td>
          <td class="text-right">
            {{ data.resultatCumuleInvest.value > 0 ? fmt(data.resultatCumuleInvest.value) : '' }}
          </td>
          <td class="text-right">
            {{
              data.resultatCumuleInvest.value < 0
                ? fmt(Math.abs(data.resultatCumuleInvest.value))
                : ''
            }}
          </td>
        </tr>
        <!-- TOTAL -->
        <tr class="bg-grey-4 text-weight-bold">
          <td>TOTAL</td>
          <td class="text-right">
            {{ data.resultatCumuleGlobal.value > 0 ? fmt(data.resultatCumuleGlobal.value) : '' }}
          </td>
          <td class="text-right">
            {{
              data.resultatCumuleGlobal.value < 0
                ? fmt(Math.abs(data.resultatCumuleGlobal.value))
                : ''
            }}
          </td>
          <td class="text-right"></td>
          <td class="text-right"></td>
          <td class="text-right">
            {{ data.resultatCumuleGlobal.value > 0 ? fmt(data.resultatCumuleGlobal.value) : '' }}
          </td>
          <td class="text-right">
            {{
              data.resultatCumuleGlobal.value < 0
                ? fmt(Math.abs(data.resultatCumuleGlobal.value))
                : ''
            }}
          </td>
        </tr>
      </tbody>
    </q-markup-table>

    <!-- Certification après correction -->
    <div class="certification q-mb-sm">
      <p>
        Arrêté le résultat après correction du présent compte administratif à la somme de
        {{ fmt(Math.abs(data.resultatCumuleGlobal.value)) }} Francs CFA
      </p>
    </div>
    <div class="sig-date q-mb-sm">
      Fait à {{ data.ville.value || '________' }} le 31 Décembre {{ data.exercice.value }}
    </div>
    <div class="sig-grid">
      <div>LE TRESORIER PRINCIPAL</div>
      <div class="text-center">LE</div>
      <div class="text-right"></div>
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

const creditsSansEmploiTotal = computed(
  () =>
    props.data.totalPrevuDepFonct.value -
    props.data.totalDepensesFonct.value +
    (props.data.totalPrevuDepInvest.value - props.data.totalDepensesInvest.value),
);

function fmt(v: number) {
  return new Intl.NumberFormat('fr-FR').format(v);
}

function fmtZ(v: number) {
  return v === 0 ? '-' : new Intl.NumberFormat('fr-FR').format(v);
}

function fmtSigned(v: number) {
  if (v === 0) return '-';
  return new Intl.NumberFormat('fr-FR').format(v);
}
</script>

<style scoped>
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
