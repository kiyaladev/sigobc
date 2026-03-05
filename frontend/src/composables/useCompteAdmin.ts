import { ref, computed, watch } from 'vue';
import { db } from 'src/database/db';
import type {
  Mandat,
  Prevision,
  SousChapitre,
  Chapitre,
  Taxe,
  Declaration,
  PrevisionRecette,
} from 'src/database/db';

// Types pour les données agrégées
export interface LigneDepense {
  sousChapitreId: number;
  code: string;
  libelle: string;
  chapitreId: number;
  chapitreCode: string;
  montantPrevu: number;
  montantEngage: number;
  tauxExecution: number;
}

export interface LigneRecette {
  taxeId: number;
  code: string;
  libelle: string;
  montantPrevu: number;
  montantEmis: number;
  montantRecouvre: number;
  tauxRecouvrement: number;
}

export interface RecapSectionRecette {
  code: string;
  libelle: string;
  prevu: number;
  emissions: number;
  recouvrement: number;
  nonValeur: number;
  resteARecouvrer: number;
  ecartPrevEmission: number;
  tauxEP: number;
}

export interface RecapSectionDepense {
  code: string;
  libelle: string;
  previsionsEngagees: number;
  pourcentageRealisation: number;
  depensesMandatees: number;
  commandesNonLivrees: number;
  commandesLivreesNonFacturees: number;
  commandesFacturees: number;
  totalEngagementsNonMandates: number;
}

export interface DepenseVentilee {
  sousChapitreId: number;
  code: string;
  libelle: string;
  montantPrevu: number;
  // Ventilation par chapitre (1 à 8)
  chap1: number;
  chap2: number;
  chap3: number;
  chap4: number;
  chap5: number;
  chap6: number;
  chap7: number;
  chap8: number;
  total: number;
}

export function useCompteAdmin() {
  const exercice = ref(new Date().getFullYear());
  const loading = ref(false);

  // Raw data
  const mandats = ref<Mandat[]>([]);
  const previsions = ref<Prevision[]>([]);
  const sousChapitres = ref<SousChapitre[]>([]);
  const chapitres = ref<Chapitre[]>([]);
  const taxes = ref<Taxe[]>([]);
  const declarations = ref<Declaration[]>([]);
  const previsionsRecettes = ref<PrevisionRecette[]>([]);

  // Previous year data for cumulative results
  const mandatsPrev = ref<Mandat[]>([]);
  const previsionsPrev = ref<Prevision[]>([]);
  const declarationsPrev = ref<Declaration[]>([]);
  const previsionsRecettesPrev = ref<PrevisionRecette[]>([]);

  async function loadData() {
    loading.value = true;
    try {
      const [m, p, sc, ch, tx, decl, pr, mPrev, pPrev, dPrev, prPrev] = await Promise.all([
        db.mandats.filter((m) => m.exercice === exercice.value && m.statut === 'paye').toArray(),
        db.previsions.filter((p) => p.exercice === exercice.value).toArray(),
        db.sousChapitres.toArray(),
        db.chapitres.toArray(),
        db.taxes.toArray(),
        db.declarations
          .filter((d) => d.exercice === exercice.value && d.statut === 'validee')
          .toArray(),
        db.previsionsRecettes.filter((p) => p.exercice === exercice.value).toArray(),
        // Previous year
        db.mandats
          .filter((m) => m.exercice === exercice.value - 1 && m.statut === 'paye')
          .toArray(),
        db.previsions.filter((p) => p.exercice === exercice.value - 1).toArray(),
        db.declarations
          .filter((d) => d.exercice === exercice.value - 1 && d.statut === 'validee')
          .toArray(),
        db.previsionsRecettes.filter((p) => p.exercice === exercice.value - 1).toArray(),
      ]);

      mandats.value = m;
      previsions.value = p;
      sousChapitres.value = sc;
      chapitres.value = ch;
      taxes.value = tx;
      declarations.value = decl;
      previsionsRecettes.value = pr;
      mandatsPrev.value = mPrev;
      previsionsPrev.value = pPrev;
      declarationsPrev.value = dPrev;
      previsionsRecettesPrev.value = prPrev;
    } finally {
      loading.value = false;
    }
  }

  // Helper maps
  const sousChapitreMap = computed(() => {
    const map = new Map<number, SousChapitre>();
    for (const sc of sousChapitres.value) {
      if (sc.id) map.set(sc.id, sc);
    }
    return map;
  });

  const chapitreMap = computed(() => {
    const map = new Map<number, Chapitre>();
    for (const ch of chapitres.value) {
      if (ch.id) map.set(ch.id, ch);
    }
    return map;
  });

  const taxeMap = computed(() => {
    const map = new Map<number, Taxe>();
    for (const tx of taxes.value) {
      if (tx.id) map.set(tx.id, tx);
    }
    return map;
  });

  // ===== DEPENSES FONCTIONNEMENT =====

  // Sections dépenses fonctionnement: codes 60-64 (sous-chapitres dont le code commence par 60x)
  const depensesFonctionnement = computed<LigneDepense[]>(() => {
    const lignes: LigneDepense[] = [];
    const prevMap = new Map<number, number>();
    for (const p of previsions.value) {
      if (p.sousChapitreId) {
        prevMap.set(p.sousChapitreId, (prevMap.get(p.sousChapitreId) || 0) + p.montantPrevu);
      }
    }

    const engageMap = new Map<number, number>();
    for (const m of mandats.value) {
      engageMap.set(m.sousChapitreId, (engageMap.get(m.sousChapitreId) || 0) + m.montant);
    }

    for (const sc of sousChapitres.value) {
      if (!sc.id) continue;
      // Fonctionnement = codes 6xxx
      if (!sc.code.startsWith('6')) continue;

      const prevu = prevMap.get(sc.id) || 0;
      const engage = engageMap.get(sc.id) || 0;
      const ch = chapitreMap.value.get(
        mandats.value.find((m) => m.sousChapitreId === sc.id)?.chapitreId || 0,
      );

      lignes.push({
        sousChapitreId: sc.id,
        code: sc.code,
        libelle: sc.libelle,
        chapitreId: ch?.id || 0,
        chapitreCode: ch?.code || '',
        montantPrevu: prevu,
        montantEngage: engage,
        tauxExecution: prevu > 0 ? (engage / prevu) * 100 : 0,
      });
    }
    return lignes.sort((a, b) => a.code.localeCompare(b.code));
  });

  // ===== DEPENSES VENTILEES PAR CHAPITRE (8 paragraphes) =====
  const depensesVentilees = computed<DepenseVentilee[]>(() => {
    const lignes: DepenseVentilee[] = [];
    const prevMap = new Map<number, number>();
    for (const p of previsions.value) {
      if (p.sousChapitreId) {
        prevMap.set(p.sousChapitreId, (prevMap.get(p.sousChapitreId) || 0) + p.montantPrevu);
      }
    }

    // Group mandats by sousChapitreId + chapitreId
    const ventilationMap = new Map<string, number>();
    for (const m of mandats.value) {
      const key = `${m.sousChapitreId}-${m.chapitreId}`;
      ventilationMap.set(key, (ventilationMap.get(key) || 0) + m.montant);
    }

    for (const sc of sousChapitres.value) {
      if (!sc.id) continue;
      if (!sc.code.startsWith('6')) continue;

      const prevu = prevMap.get(sc.id) || 0;
      const getChapAmount = (chapCode: string) => {
        const chap = chapitres.value.find((c) => c.code === chapCode);
        if (!chap?.id) return 0;
        return ventilationMap.get(`${sc.id}-${chap.id}`) || 0;
      };

      const chap1 = getChapAmount('1');
      const chap2 = getChapAmount('2');
      const chap3 = getChapAmount('3');
      const chap4 = getChapAmount('4');
      const chap5 = getChapAmount('5');
      const chap6 = getChapAmount('6');
      const chap7 = getChapAmount('7');
      const chap8 = getChapAmount('8');
      const total = chap1 + chap2 + chap3 + chap4 + chap5 + chap6 + chap7 + chap8;

      if (prevu > 0 || total > 0) {
        lignes.push({
          sousChapitreId: sc.id,
          code: sc.code,
          libelle: sc.libelle,
          montantPrevu: prevu,
          chap1,
          chap2,
          chap3,
          chap4,
          chap5,
          chap6,
          chap7,
          chap8,
          total,
        });
      }
    }
    return lignes.sort((a, b) => a.code.localeCompare(b.code));
  });

  // ===== RECETTES FONCTIONNEMENT =====
  // Sections recettes fonctionnement: codes 70-74
  const recettesFonctionnement = computed<LigneRecette[]>(() => {
    const lignes: LigneRecette[] = [];

    const prevMap = new Map<number, number>();
    for (const pr of previsionsRecettes.value) {
      prevMap.set(pr.taxeId, (prevMap.get(pr.taxeId) || 0) + pr.montantPrevu);
    }

    const emisMap = new Map<number, number>();
    const recouvreMap = new Map<number, number>();
    for (const d of declarations.value) {
      const montant = d.montant || d.montantRecette || 0;
      emisMap.set(d.taxeId, (emisMap.get(d.taxeId) || 0) + montant);
      if (d.dateEncaissement) {
        recouvreMap.set(d.taxeId, (recouvreMap.get(d.taxeId) || 0) + montant);
      }
    }

    for (const tx of taxes.value) {
      if (!tx.id) continue;
      // Fonctionnement = codes 7x
      if (!tx.code.startsWith('7')) continue;

      const prevu = prevMap.get(tx.id) || 0;
      const emis = emisMap.get(tx.id) || 0;
      const recouvre = recouvreMap.get(tx.id) || 0;

      lignes.push({
        taxeId: tx.id,
        code: tx.code,
        libelle: tx.libelle,
        montantPrevu: prevu,
        montantEmis: emis,
        montantRecouvre: recouvre,
        tauxRecouvrement: emis > 0 ? (recouvre / emis) * 100 : 0,
      });
    }
    return lignes.sort((a, b) => a.code.localeCompare(b.code));
  });

  // ===== RECAP FONCTIONNEMENT =====
  const recapDepensesFonct = computed<RecapSectionDepense[]>(() => {
    const sections = [
      { code: '60', libelle: '60 - Dépenses des services généraux' },
      { code: '61', libelle: '61 - Dépenses des services de collectivité' },
      { code: '62', libelle: '62 - Dépenses des services socioculturels et de prom. Hum.' },
      { code: '63', libelle: '63 - Dépenses des services économiques' },
      { code: '64', libelle: '64 - Dépenses diverses au titre I' },
    ];

    return sections.map((s) => {
      const lignes = depensesFonctionnement.value.filter((l) => l.code.startsWith(s.code));
      const prevu = lignes.reduce((sum, l) => sum + l.montantPrevu, 0);
      const mandatees = lignes.reduce((sum, l) => sum + l.montantEngage, 0);
      return {
        code: s.code,
        libelle: s.libelle,
        previsionsEngagees: prevu,
        pourcentageRealisation: prevu > 0 ? (mandatees / prevu) * 100 : 0,
        depensesMandatees: mandatees,
        commandesNonLivrees: 0,
        commandesLivreesNonFacturees: 0,
        commandesFacturees: 0,
        totalEngagementsNonMandates: 0,
      };
    });
  });

  const recapRecettesFonct = computed<RecapSectionRecette[]>(() => {
    const sections = [
      { code: '70', libelle: '70 - Recettes fiscales' },
      { code: '71', libelle: '71 - Recettes des prestations et services' },
      { code: '72', libelle: '72 - Revenus du patrimoine et du portefeuille' },
      { code: '73', libelle: "73 - Aide de l'état, fonds de concours, aides extérieures" },
      { code: '74', libelle: '74 - Recettes divers au titre I' },
    ];

    return sections.map((s) => {
      const lignes = recettesFonctionnement.value.filter((l) => l.code.startsWith(s.code));
      const prevu = lignes.reduce((sum, l) => sum + l.montantPrevu, 0);
      const emissions = lignes.reduce((sum, l) => sum + l.montantEmis, 0);
      const recouvrement = lignes.reduce((sum, l) => sum + l.montantRecouvre, 0);
      return {
        code: s.code,
        libelle: s.libelle,
        prevu,
        emissions,
        recouvrement,
        nonValeur: 0,
        resteARecouvrer: emissions - recouvrement,
        ecartPrevEmission: prevu - emissions,
        tauxEP: prevu > 0 ? (emissions / prevu) * 100 : 0,
      };
    });
  });

  // ===== DEPENSES INVESTISSEMENT =====
  const depensesInvestissement = computed<LigneDepense[]>(() => {
    const lignes: LigneDepense[] = [];
    const prevMap = new Map<number, number>();
    for (const p of previsions.value) {
      if (p.sousChapitreId) {
        prevMap.set(p.sousChapitreId, (prevMap.get(p.sousChapitreId) || 0) + p.montantPrevu);
      }
    }

    const engageMap = new Map<number, number>();
    for (const m of mandats.value) {
      engageMap.set(m.sousChapitreId, (engageMap.get(m.sousChapitreId) || 0) + m.montant);
    }

    for (const sc of sousChapitres.value) {
      if (!sc.id) continue;
      // Investissement = codes 9xxx
      if (!sc.code.startsWith('9')) continue;

      const prevu = prevMap.get(sc.id) || 0;
      const engage = engageMap.get(sc.id) || 0;

      lignes.push({
        sousChapitreId: sc.id,
        code: sc.code,
        libelle: sc.libelle,
        chapitreId: 0,
        chapitreCode: '',
        montantPrevu: prevu,
        montantEngage: engage,
        tauxExecution: prevu > 0 ? (engage / prevu) * 100 : 0,
      });
    }
    return lignes.sort((a, b) => a.code.localeCompare(b.code));
  });

  // ===== RECETTES INVESTISSEMENT =====
  const recettesInvestissement = computed<LigneRecette[]>(() => {
    const lignes: LigneRecette[] = [];

    const prevMap = new Map<number, number>();
    for (const pr of previsionsRecettes.value) {
      prevMap.set(pr.taxeId, (prevMap.get(pr.taxeId) || 0) + pr.montantPrevu);
    }

    const emisMap = new Map<number, number>();
    const recouvreMap = new Map<number, number>();
    for (const d of declarations.value) {
      const montant = d.montant || d.montantRecette || 0;
      emisMap.set(d.taxeId, (emisMap.get(d.taxeId) || 0) + montant);
      if (d.dateEncaissement) {
        recouvreMap.set(d.taxeId, (recouvreMap.get(d.taxeId) || 0) + montant);
      }
    }

    for (const tx of taxes.value) {
      if (!tx.id) continue;
      // Investissement = codes 0x (01-06)
      if (!tx.code.startsWith('0')) continue;

      const prevu = prevMap.get(tx.id) || 0;
      const emis = emisMap.get(tx.id) || 0;
      const recouvre = recouvreMap.get(tx.id) || 0;

      lignes.push({
        taxeId: tx.id,
        code: tx.code,
        libelle: tx.libelle,
        montantPrevu: prevu,
        montantEmis: emis,
        montantRecouvre: recouvre,
        tauxRecouvrement: emis > 0 ? (recouvre / emis) * 100 : 0,
      });
    }
    return lignes.sort((a, b) => a.code.localeCompare(b.code));
  });

  // ===== RECAP INVESTISSEMENT =====
  const recapDepensesInvest = computed<RecapSectionDepense[]>(() => {
    const sections = [
      { code: '90', libelle: '90 - Immobilisations incorporelles' },
      { code: '91', libelle: '91 - Immobilisations corporelles' },
      { code: '92', libelle: '92 - Immobilisations en cours' },
      { code: '93', libelle: '93 - Immobilisations financières' },
      { code: '94', libelle: '94 - Remboursement emprunts' },
      { code: '95', libelle: '95 - Autres dépenses investissement' },
    ];

    return sections.map((s) => {
      const lignes = depensesInvestissement.value.filter((l) => l.code.startsWith(s.code));
      const prevu = lignes.reduce((sum, l) => sum + l.montantPrevu, 0);
      const mandatees = lignes.reduce((sum, l) => sum + l.montantEngage, 0);
      return {
        code: s.code,
        libelle: s.libelle,
        previsionsEngagees: prevu,
        pourcentageRealisation: prevu > 0 ? (mandatees / prevu) * 100 : 0,
        depensesMandatees: mandatees,
        commandesNonLivrees: 0,
        commandesLivreesNonFacturees: 0,
        commandesFacturees: 0,
        totalEngagementsNonMandates: 0,
      };
    });
  });

  const recapRecettesInvest = computed<RecapSectionRecette[]>(() => {
    const sections = [
      { code: '01', libelle: "01 - Dotations de l'État" },
      { code: '02', libelle: '02 - Emprunts' },
      { code: '03', libelle: '03 - Cessions immobilières' },
      { code: '04', libelle: '04 - Subventions investissement' },
      { code: '05', libelle: '05 - Fonds propres' },
      { code: '06', libelle: '06 - Autres recettes investissement' },
    ];

    return sections.map((s) => {
      const lignes = recettesInvestissement.value.filter((l) => l.code.startsWith(s.code));
      const prevu = lignes.reduce((sum, l) => sum + l.montantPrevu, 0);
      const emissions = lignes.reduce((sum, l) => sum + l.montantEmis, 0);
      const recouvrement = lignes.reduce((sum, l) => sum + l.montantRecouvre, 0);
      return {
        code: s.code,
        libelle: s.libelle,
        prevu,
        emissions,
        recouvrement,
        nonValeur: 0,
        resteARecouvrer: emissions - recouvrement,
        ecartPrevEmission: prevu - emissions,
        tauxEP: prevu > 0 ? (emissions / prevu) * 100 : 0,
      };
    });
  });

  // ===== DEPENSES INVESTISSEMENT VENTILEES =====
  const depensesInvestVentilees = computed<DepenseVentilee[]>(() => {
    const lignes: DepenseVentilee[] = [];
    const prevMap = new Map<number, number>();
    for (const p of previsions.value) {
      if (p.sousChapitreId) {
        prevMap.set(p.sousChapitreId, (prevMap.get(p.sousChapitreId) || 0) + p.montantPrevu);
      }
    }

    const ventilationMap = new Map<string, number>();
    for (const m of mandats.value) {
      const key = `${m.sousChapitreId}-${m.chapitreId}`;
      ventilationMap.set(key, (ventilationMap.get(key) || 0) + m.montant);
    }

    for (const sc of sousChapitres.value) {
      if (!sc.id) continue;
      if (!sc.code.startsWith('9')) continue;

      const prevu = prevMap.get(sc.id) || 0;
      const getChapAmount = (chapCode: string) => {
        const chap = chapitres.value.find((c) => c.code === chapCode);
        if (!chap?.id) return 0;
        return ventilationMap.get(`${sc.id}-${chap.id}`) || 0;
      };

      const chap1 = getChapAmount('1');
      const chap2 = getChapAmount('2');
      const chap3 = getChapAmount('3');
      const chap4 = getChapAmount('4');
      const chap5 = getChapAmount('5');
      const chap6 = getChapAmount('6');
      const chap7 = getChapAmount('7');
      const chap8 = getChapAmount('8');
      const total = chap1 + chap2 + chap3 + chap4 + chap5 + chap6 + chap7 + chap8;

      if (prevu > 0 || total > 0) {
        lignes.push({
          sousChapitreId: sc.id,
          code: sc.code,
          libelle: sc.libelle,
          montantPrevu: prevu,
          chap1,
          chap2,
          chap3,
          chap4,
          chap5,
          chap6,
          chap7,
          chap8,
          total,
        });
      }
    }
    return lignes.sort((a, b) => a.code.localeCompare(b.code));
  });

  // ===== RESULTATS =====
  const totalDepensesFonct = computed(() =>
    depensesFonctionnement.value.reduce((s, l) => s + l.montantEngage, 0),
  );
  const totalRecettesFonct = computed(() =>
    recettesFonctionnement.value.reduce((s, l) => s + l.montantRecouvre, 0),
  );
  const totalPrevuDepFonct = computed(() =>
    depensesFonctionnement.value.reduce((s, l) => s + l.montantPrevu, 0),
  );
  const totalPrevuRecFonct = computed(() =>
    recettesFonctionnement.value.reduce((s, l) => s + l.montantPrevu, 0),
  );

  const totalDepensesInvest = computed(() =>
    depensesInvestissement.value.reduce((s, l) => s + l.montantEngage, 0),
  );
  const totalRecettesInvest = computed(() =>
    recettesInvestissement.value.reduce((s, l) => s + l.montantRecouvre, 0),
  );
  const totalPrevuDepInvest = computed(() =>
    depensesInvestissement.value.reduce((s, l) => s + l.montantPrevu, 0),
  );
  const totalPrevuRecInvest = computed(() =>
    recettesInvestissement.value.reduce((s, l) => s + l.montantPrevu, 0),
  );

  const totalEmissionsFonct = computed(() =>
    recettesFonctionnement.value.reduce((s, l) => s + l.montantEmis, 0),
  );
  const totalEmissionsInvest = computed(() =>
    recettesInvestissement.value.reduce((s, l) => s + l.montantEmis, 0),
  );

  const resultatFonctionnement = computed(
    () => totalRecettesFonct.value - totalDepensesFonct.value,
  );
  const resultatInvestissement = computed(
    () => totalRecettesInvest.value - totalDepensesInvest.value,
  );
  const resultatGlobal = computed(
    () => resultatFonctionnement.value + resultatInvestissement.value,
  );

  // Previous year totals
  const totalDepensesFonctPrev = computed(() => {
    let total = 0;
    for (const m of mandatsPrev.value) {
      const sc = sousChapitreMap.value.get(m.sousChapitreId);
      if (sc && sc.code.startsWith('6')) total += m.montant;
    }
    return total;
  });

  const totalRecettesFonctPrev = computed(() => {
    let total = 0;
    for (const d of declarationsPrev.value) {
      const tx = taxeMap.value.get(d.taxeId);
      if (tx && tx.code.startsWith('7') && d.dateEncaissement) {
        total += d.montant || d.montantRecette || 0;
      }
    }
    return total;
  });

  const totalDepensesInvestPrev = computed(() => {
    let total = 0;
    for (const m of mandatsPrev.value) {
      const sc = sousChapitreMap.value.get(m.sousChapitreId);
      if (sc && sc.code.startsWith('9')) total += m.montant;
    }
    return total;
  });

  const totalRecettesInvestPrev = computed(() => {
    let total = 0;
    for (const d of declarationsPrev.value) {
      const tx = taxeMap.value.get(d.taxeId);
      if (tx && tx.code.startsWith('0') && d.dateEncaissement) {
        total += d.montant || d.montantRecette || 0;
      }
    }
    return total;
  });

  const resultatFonctPrev = computed(
    () => totalRecettesFonctPrev.value - totalDepensesFonctPrev.value,
  );
  const resultatInvestPrev = computed(
    () => totalRecettesInvestPrev.value - totalDepensesInvestPrev.value,
  );

  const resultatCumuleFonct = computed(
    () => resultatFonctionnement.value + resultatFonctPrev.value,
  );
  const resultatCumuleInvest = computed(
    () => resultatInvestissement.value + resultatInvestPrev.value,
  );
  const resultatCumuleGlobal = computed(
    () => resultatCumuleFonct.value + resultatCumuleInvest.value,
  );

  // Watch exercice changes
  watch(exercice, () => {
    void loadData();
  });

  return {
    exercice,
    loading,
    loadData,
    // Raw data
    mandats,
    previsions,
    sousChapitres,
    chapitres,
    taxes,
    declarations,
    previsionsRecettes,
    // Maps
    sousChapitreMap,
    chapitreMap,
    taxeMap,
    // Fonctionnement
    depensesFonctionnement,
    recettesFonctionnement,
    depensesVentilees,
    recapDepensesFonct,
    recapRecettesFonct,
    // Investissement
    depensesInvestissement,
    recettesInvestissement,
    depensesInvestVentilees,
    recapDepensesInvest,
    recapRecettesInvest,
    // Totals
    totalDepensesFonct,
    totalRecettesFonct,
    totalPrevuDepFonct,
    totalPrevuRecFonct,
    totalDepensesInvest,
    totalRecettesInvest,
    totalPrevuDepInvest,
    totalPrevuRecInvest,
    totalEmissionsFonct,
    totalEmissionsInvest,
    // Résultats
    resultatFonctionnement,
    resultatInvestissement,
    resultatGlobal,
    resultatFonctPrev,
    resultatInvestPrev,
    resultatCumuleFonct,
    resultatCumuleInvest,
    resultatCumuleGlobal,
  };
}
