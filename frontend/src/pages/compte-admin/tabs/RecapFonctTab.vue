<template>
  <div>
    <div class="text-center q-mb-md">
      <div class="text-h6 text-weight-bold">TITRE I - BUDGET DE FONCTIONNEMENT</div>
    </div>

    <!-- RECETTES DE FONCTIONNEMENT -->
    <div class="text-center text-weight-bold q-mb-sm">RECETTES DE FONCTIONNEMENT</div>
    <q-markup-table dense bordered flat separator="cell" class="recap-table q-mb-lg">
      <thead>
        <tr>
          <th rowspan="2" class="text-left" style="width: 280px">SECTIONS BUDGETAIRES</th>
          <th rowspan="2" class="text-right">PREVISIONS</th>
          <th colspan="4" class="text-center">EXECUTION DU BUDGET</th>
          <th rowspan="2" class="text-right">ECART PREVISION<br />EMISSION</th>
          <th rowspan="2" class="text-right">E / P %</th>
        </tr>
        <tr>
          <th class="text-right">EMISSIONS</th>
          <th class="text-right">RECOUVREMENT</th>
          <th class="text-right">NON VALEUR</th>
          <th class="text-right">RESTE A<br />RECOUVRER</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in data.recapRecettesFonct.value" :key="row.code">
          <td>{{ row.libelle }}</td>
          <td class="text-right">{{ fmt(row.prevu) }}</td>
          <td class="text-right">{{ fmt(row.emissions) }}</td>
          <td class="text-right">{{ fmt(row.recouvrement) }}</td>
          <td class="text-right">{{ row.nonValeur ? fmt(row.nonValeur) : '-' }}</td>
          <td class="text-right">{{ row.resteARecouvrer ? fmt(row.resteARecouvrer) : '-' }}</td>
          <td class="text-right">{{ fmt(row.ecartPrevEmission) }}</td>
          <td class="text-right">{{ row.tauxEP.toFixed(2) }}%</td>
        </tr>
        <tr class="bg-grey-3 text-weight-bold">
          <td class="text-center">TOTAL DES RECETTES AU TITRE I</td>
          <td class="text-right">{{ fmt(data.totalPrevuRecFonct.value) }}</td>
          <td class="text-right">{{ fmt(data.totalEmissionsFonct.value) }}</td>
          <td class="text-right">{{ fmt(data.totalRecettesFonct.value) }}</td>
          <td class="text-right">-</td>
          <td class="text-right">
            {{ fmt(data.totalPrevuRecFonct.value - data.totalRecettesFonct.value) }}
          </td>
          <td class="text-right">
            {{ fmt(data.totalPrevuRecFonct.value - data.totalEmissionsFonct.value) }}
          </td>
          <td class="text-right">
            {{
              data.totalPrevuRecFonct.value > 0
                ? ((data.totalEmissionsFonct.value / data.totalPrevuRecFonct.value) * 100).toFixed(
                    2,
                  )
                : '0.00'
            }}%
          </td>
        </tr>
      </tbody>
    </q-markup-table>

    <!-- DEPENSES DE FONCTIONNEMENT -->
    <div class="text-center text-weight-bold q-mb-sm">DEPENSES DE FONCTIONNEMENT</div>
    <q-markup-table dense bordered flat separator="cell" class="recap-table">
      <thead>
        <tr>
          <th rowspan="2" class="text-left" style="width: 280px">SECTIONS BUDGETAIRES</th>
          <th rowspan="2" class="text-right">PREVISIONS</th>
          <th rowspan="2" class="text-right">POURCENTAGE<br />REALISATION</th>
          <th rowspan="2" class="text-right">DEPENSES<br />MANDATEES</th>
          <th colspan="4" class="text-center">ENGAGEMENTS NON MANDATES</th>
        </tr>
        <tr>
          <th class="text-right">COMMANDES<br />NON LIVREES</th>
          <th class="text-right">COMMANDES<br />LIVREES NON<br />FACTUREES</th>
          <th class="text-right">COMMANDES<br />FACTUREES</th>
          <th class="text-right">TOTAL<br />(6 + 7 + 8)</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in data.recapDepensesFonct.value" :key="row.code">
          <td>{{ row.libelle }}</td>
          <td class="text-right">{{ fmt(row.previsionsEngagees) }}</td>
          <td class="text-right">{{ row.pourcentageRealisation.toFixed(2) }}</td>
          <td class="text-right">{{ fmt(row.depensesMandatees) }}</td>
          <td class="text-right">-</td>
          <td class="text-right">-</td>
          <td class="text-right">-</td>
          <td class="text-right">-</td>
        </tr>
        <tr class="bg-grey-3 text-weight-bold">
          <td class="text-center">TOTAL DES DEPENSES AU TITRE I</td>
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
import type { useCompteAdmin } from 'src/composables/useCompteAdmin';

defineProps<{ data: ReturnType<typeof useCompteAdmin> }>();

function fmt(v: number) {
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
</style>
