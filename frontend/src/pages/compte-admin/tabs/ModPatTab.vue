<template>
  <div>
    <h6 class="q-mt-none q-mb-md">Modifications du Patrimoine - Exercice {{ data.exercice.value }}</h6>

    <!-- Patrimoine d'Investissement -->
    <div class="text-subtitle1 text-weight-bold q-mb-sm">MODIFICATIONS DU PATRIMOINE</div>
    <q-markup-table dense bordered flat class="q-mb-lg">
      <thead>
        <tr class="bg-deep-purple-1">
          <th class="text-left">Rubrique</th>
          <th class="text-right">Acquisitions (Dépenses)</th>
          <th class="text-right">Cessions (Recettes)</th>
          <th class="text-right">Variation nette</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="section in investSections" :key="section.code">
          <td>{{ section.libelle }}</td>
          <td class="text-right">{{ fmt(getDepInvest(section.code)) }}</td>
          <td class="text-right">{{ fmt(getRecInvest(section.code)) }}</td>
          <td class="text-right" :class="resultClass(getRecInvest(section.code) - getDepInvest(section.code))">
            {{ fmt(getRecInvest(section.code) - getDepInvest(section.code)) }}
          </td>
        </tr>
        <tr class="bg-grey-2 text-weight-bold">
          <td>TOTAL VARIATIONS PATRIMOINE</td>
          <td class="text-right">{{ fmt(data.totalDepensesInvest.value) }}</td>
          <td class="text-right">{{ fmt(data.totalRecettesInvest.value) }}</td>
          <td class="text-right" :class="resultClass(data.resultatInvestissement.value)">
            {{ fmt(data.resultatInvestissement.value) }}
          </td>
        </tr>
      </tbody>
    </q-markup-table>

    <!-- Résumé -->
    <div class="text-subtitle1 text-weight-bold q-mb-sm">SYNTHESE</div>
    <q-markup-table dense bordered flat>
      <thead>
        <tr class="bg-deep-purple-1">
          <th class="text-left">Section</th>
          <th class="text-right">Prévisions Dép.</th>
          <th class="text-right">Réalisations Dép.</th>
          <th class="text-right">Prévisions Rec.</th>
          <th class="text-right">Réalisations Rec.</th>
          <th class="text-right">Résultat</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Fonctionnement</td>
          <td class="text-right">{{ fmt(data.totalPrevuDepFonct.value) }}</td>
          <td class="text-right">{{ fmt(data.totalDepensesFonct.value) }}</td>
          <td class="text-right">{{ fmt(data.totalPrevuRecFonct.value) }}</td>
          <td class="text-right">{{ fmt(data.totalRecettesFonct.value) }}</td>
          <td class="text-right" :class="resultClass(data.resultatFonctionnement.value)">
            {{ fmt(data.resultatFonctionnement.value) }}
          </td>
        </tr>
        <tr>
          <td>Investissement</td>
          <td class="text-right">{{ fmt(data.totalPrevuDepInvest.value) }}</td>
          <td class="text-right">{{ fmt(data.totalDepensesInvest.value) }}</td>
          <td class="text-right">{{ fmt(data.totalPrevuRecInvest.value) }}</td>
          <td class="text-right">{{ fmt(data.totalRecettesInvest.value) }}</td>
          <td class="text-right" :class="resultClass(data.resultatInvestissement.value)">
            {{ fmt(data.resultatInvestissement.value) }}
          </td>
        </tr>
        <tr class="bg-deep-purple-2 text-weight-bold">
          <td>TOTAL GENERAL</td>
          <td class="text-right">
            {{ fmt(data.totalPrevuDepFonct.value + data.totalPrevuDepInvest.value) }}
          </td>
          <td class="text-right">
            {{ fmt(data.totalDepensesFonct.value + data.totalDepensesInvest.value) }}
          </td>
          <td class="text-right">
            {{ fmt(data.totalPrevuRecFonct.value + data.totalPrevuRecInvest.value) }}
          </td>
          <td class="text-right">
            {{ fmt(data.totalRecettesFonct.value + data.totalRecettesInvest.value) }}
          </td>
          <td class="text-right" :class="resultClass(data.resultatGlobal.value)">
            {{ fmt(data.resultatGlobal.value) }}
          </td>
        </tr>
      </tbody>
    </q-markup-table>
  </div>
</template>

<script setup lang="ts">
import type { useCompteAdmin } from 'src/composables/useCompteAdmin';

const props = defineProps<{ data: ReturnType<typeof useCompteAdmin> }>();

const investSections = [
  { code: '90', libelle: 'Immobilisations incorporelles' },
  { code: '91', libelle: 'Immobilisations corporelles' },
  { code: '92', libelle: 'Immobilisations en cours' },
  { code: '93', libelle: 'Immobilisations financières' },
  { code: '94', libelle: 'Remboursement emprunts' },
  { code: '95', libelle: 'Autres' },
];

function getDepInvest(sectionCode: string): number {
  return props.data.depensesInvestissement.value
    .filter((l) => l.code.startsWith(sectionCode))
    .reduce((s, l) => s + l.montantEngage, 0);
}

function getRecInvest(sectionCode: string): number {
  // Map 9x -> 0x for recettes
  const recCode = '0' + sectionCode.charAt(1);
  return props.data.recettesInvestissement.value
    .filter((l) => l.code.startsWith(recCode))
    .reduce((s, l) => s + l.montantRecouvre, 0);
}

function fmt(v: number) {
  return new Intl.NumberFormat('fr-FR').format(v);
}

function resultClass(v: number) {
  if (v > 0) return 'text-positive text-weight-bold';
  if (v < 0) return 'text-negative text-weight-bold';
  return '';
}
</script>
