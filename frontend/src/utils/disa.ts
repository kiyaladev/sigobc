/**
 * disa.ts
 *
 * Construction et export du rapport DISA (Déclaration Individuelle des Salaires
 * Annuels) à déposer à la CNPS.
 *
 * Le gabarit reproduit celui des fichiers fournis par la CNPS
 * (`DISA_<n° employeur>_<année>.xls`) :
 *
 *   B1                  année de la déclaration
 *   A2/B2               « CNPS » / n° employeur
 *   C2/D2               « RAISON SOCIALE » / raison sociale
 *   ligne 3             14 en-têtes de colonnes
 *   lignes suivantes    un agent par ligne
 *   dernière ligne      « TOTAL » sur brut, PF/AT et retraite
 *
 * Deux formats de sortie :
 *   `.xls`   vrai classeur BIFF8, format attendu par la CNPS. Le format binaire
 *            hérité ne transporte pas les aplats de couleur : aucune
 *            bibliothèque JavaScript ne sait les y écrire.
 *   `.xlsx`  même contenu, avec les en-têtes et le total en gris.
 */

import * as XLSX from 'xlsx-js-style';
import { db, type Employe, type FichePaie } from 'src/database/db';

/** Plafonds retenus quand les paramètres de paie ne les renseignent pas. */
export const PLAFOND_PF_AT_DEFAUT = 70000;
export const PLAFOND_RETRAITE_DEFAUT = 3375000;

/** Valeurs CNPS par défaut quand l'agent ne les porte pas. */
const TYPE_SALARIE_DEFAUT = 'M';
const REGIME_DEFAUT = '123';

export interface DisaLigne {
  numOrdre: number;
  nom: string;
  prenom: string;
  numeroCnps: string;
  anneeNaissance: string;
  dateEmbauche: string;
  dateDepart: string;
  typeSalarie: string;
  salaireBrut: number;
  dureeActivite: number;
  montantPfAt: number;
  montantRetraite: number;
  regime: string;
  observation: string;
}

export interface DisaRapport {
  annee: number;
  numeroEmployeur: string;
  raisonSociale: string;
  lignes: DisaLigne[];
  totaux: {
    salaireBrut: number;
    montantPfAt: number;
    montantRetraite: number;
  };
  /** Nombre de fiches de paie retenues, pour information dans l'interface. */
  nbFiches: number;
}

export interface ConstruireDisaOptions {
  annee: number;
  numeroEmployeur: string;
  raisonSociale: string;
  /** Inclure les fiches encore en brouillon. Faux par défaut. */
  inclureBrouillons?: boolean;
}

function formaterDate(valeur: Date | string | undefined | null): string {
  if (!valeur) return '';
  const d = valeur instanceof Date ? valeur : new Date(valeur);
  if (Number.isNaN(d.getTime())) return '';
  const jj = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  return `${jj}/${mm}/${d.getFullYear()}`;
}

/**
 * Nettoie une valeur texte avant dépôt : d'anciennes saisies portent le
 * littéral « <Undefined> », qui n'a rien à faire dans un fichier CNPS.
 */
function texte(valeur: string | undefined | null): string {
  const v = (valeur ?? '').trim();
  return /^<?undefined>?$/i.test(v) ? '' : v;
}

function anneeDe(valeur: Date | string | undefined | null): string {
  if (!valeur) return '';
  const d = valeur instanceof Date ? valeur : new Date(valeur);
  return Number.isNaN(d.getTime()) ? '' : String(d.getFullYear());
}

/**
 * Assemble le rapport DISA d'un exercice à partir des fiches de paie de l'année.
 *
 * Seuls les agents ayant au moins une fiche sur l'exercice figurent dans la
 * déclaration : c'est ce que déclare le DISA, les effectifs réellement payés.
 */
export async function construireDisa(options: ConstruireDisaOptions): Promise<DisaRapport> {
  const { annee, numeroEmployeur, raisonSociale, inclureBrouillons = false } = options;

  const [employes, fichesAnnee, parametres] = await Promise.all([
    db.employes.toArray(),
    db.fichesPaie.where('annee').equals(annee).toArray(),
    db.parametresPaie.toArray(),
  ]);

  const plafondPfAt = parametres[0]?.plafondCnpsPfAt ?? PLAFOND_PF_AT_DEFAUT;
  const plafondRetraite = parametres[0]?.plafondCnpsRetraite ?? PLAFOND_RETRAITE_DEFAUT;

  const fiches = inclureBrouillons
    ? fichesAnnee
    : fichesAnnee.filter((f) => f.statut !== 'brouillon');

  // Regroupement par agent, en dédoublonnant sur le mois : une régularisation
  // saisie deux fois pour un même mois ne doit pas gonfler la durée d'activité.
  const parEmploye = new Map<number, Map<number, FichePaie>>();
  for (const fiche of fiches) {
    if (!fiche.employeId) continue;
    let mois = parEmploye.get(fiche.employeId);
    if (!mois) {
      mois = new Map();
      parEmploye.set(fiche.employeId, mois);
    }
    const existante = mois.get(fiche.mois);
    if (existante) {
      // Fiches multiples sur un même mois : on cumule le brut, un seul mois compté.
      existante.montantBrut = (existante.montantBrut || 0) + (fiche.montantBrut || 0);
    } else {
      mois.set(fiche.mois, { ...fiche });
    }
  }

  const parId = new Map<number, Employe>();
  for (const e of employes) {
    if (e.id) parId.set(e.id, e);
  }

  const lignes: DisaLigne[] = [];
  let numOrdre = 0;

  // Ordre alphabétique : le DISA se relit par nom, pas par ordre de saisie.
  const employeIds = [...parEmploye.keys()].sort((a, b) => {
    const ea = parId.get(a);
    const eb = parId.get(b);
    return `${ea?.nom ?? ''} ${ea?.prenom ?? ''}`.localeCompare(
      `${eb?.nom ?? ''} ${eb?.prenom ?? ''}`,
      'fr',
    );
  });

  for (const employeId of employeIds) {
    const employe = parId.get(employeId);
    if (!employe) continue;

    const moisTravailles = [...(parEmploye.get(employeId)?.values() ?? [])];
    const salaireBrut = moisTravailles.reduce((s, f) => s + (f.montantBrut || 0), 0);

    // Assiettes plafonnées mois par mois : un brut mensuel supérieur au plafond
    // est écrêté sur ce mois-là, pas sur le cumul annuel.
    const montantPfAt = moisTravailles.reduce(
      (s, f) => s + Math.min(f.montantBrut || 0, plafondPfAt),
      0,
    );
    const montantRetraite = moisTravailles.reduce(
      (s, f) => s + Math.min(f.montantBrut || 0, plafondRetraite),
      0,
    );

    numOrdre += 1;
    lignes.push({
      numOrdre,
      nom: texte(employe.nom),
      prenom: texte(employe.prenom),
      numeroCnps: texte(employe.numeroCNPS),
      anneeNaissance: anneeDe(employe.dateNaissance),
      dateEmbauche: formaterDate(employe.dateEmbauche),
      dateDepart: formaterDate(employe.dateDepart),
      typeSalarie: texte(employe.typeSalarieCnps) || TYPE_SALARIE_DEFAUT,
      salaireBrut,
      dureeActivite: moisTravailles.length,
      montantPfAt,
      montantRetraite,
      regime: texte(employe.regimeCnps) || REGIME_DEFAUT,
      observation: texte(employe.observations),
    });
  }

  return {
    annee,
    numeroEmployeur,
    raisonSociale,
    lignes,
    totaux: {
      salaireBrut: lignes.reduce((s, l) => s + l.salaireBrut, 0),
      montantPfAt: lignes.reduce((s, l) => s + l.montantPfAt, 0),
      montantRetraite: lignes.reduce((s, l) => s + l.montantRetraite, 0),
    },
    nbFiches: fiches.length,
  };
}

/** En-têtes de la ligne 3, avec les retours à la ligne du gabarit CNPS. */
const EN_TETES = [
  'NUM \nORDRE',
  'NOM',
  'PRENOM',
  'NUM CNPS',
  'ANNEE \nNAISS.',
  'DATE \nEMBAUCHE',
  'DATE \nDEPART',
  'TYPE \nSALARIE',
  'SALAIRE \nBRUT.',
  'DUREE \nACTIVITE',
  'MONTANT \nPF/AT.',
  'MONTANT \nRETRAITE',
  'REGIME',
  'OBSERVATION',
];

const LARGEURS = [8, 18, 22, 16, 9, 12, 12, 9, 13, 10, 12, 13, 9, 18];

/** Construit la matrice de cellules du fichier DISA. */
export function disaVersMatrice(rapport: DisaRapport): (string | number)[][] {
  const lignes: (string | number)[][] = [
    ['   ', rapport.annee, '', '', '', '', '', '', '', '', '', '', '', ''],
    [
      'CNPS',
      rapport.numeroEmployeur,
      'RAISON \nSOCIALE',
      rapport.raisonSociale,
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
    ],
    EN_TETES,
  ];

  for (const l of rapport.lignes) {
    lignes.push([
      l.numOrdre,
      l.nom,
      l.prenom,
      l.numeroCnps,
      l.anneeNaissance,
      l.dateEmbauche,
      l.dateDepart,
      l.typeSalarie,
      l.salaireBrut,
      l.dureeActivite,
      l.montantPfAt,
      l.montantRetraite,
      l.regime,
      l.observation,
    ]);
  }

  lignes.push([
    'TOTAL',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    rapport.totaux.salaireBrut,
    '',
    rapport.totaux.montantPfAt,
    rapport.totaux.montantRetraite,
    '',
    '',
  ]);

  return lignes;
}

export type FormatDisa = 'xls' | 'xlsx';

/** Nom de fichier normalisé : `DISA_<n° employeur>_<année>.<ext>`. */
export function nomFichierDisa(rapport: DisaRapport, extension: FormatDisa = 'xls'): string {
  const numero = (rapport.numeroEmployeur || 'SANS-NUMERO').replace(/[^\w-]/g, '');
  return `DISA_${numero}_${rapport.annee}.${extension}`;
}

// Palette neutre : gris clair sur les libellés et les en-têtes de colonnes,
// gris un ton plus soutenu sur la ligne de total.
const BORDURE = {
  top: { style: 'thin' as const },
  bottom: { style: 'thin' as const },
  left: { style: 'thin' as const },
  right: { style: 'thin' as const },
};
const STYLE_LIBELLE = {
  fill: { fgColor: { rgb: 'E9E9E9' } },
  font: { bold: true },
  alignment: { horizontal: 'center' as const, vertical: 'center' as const, wrapText: true },
  border: BORDURE,
};
const STYLE_VALEUR_ENTETE = {
  fill: { fgColor: { rgb: 'F4F4F4' } },
  font: { bold: true },
  border: BORDURE,
};
const STYLE_TOTAL = {
  fill: { fgColor: { rgb: 'D9D9D9' } },
  font: { bold: true },
  border: BORDURE,
};

/** Applique la palette neutre aux deux lignes d'en-tête et à la ligne de total. */
function habillerFeuille(feuille: XLSX.WorkSheet, nbLignes: number): void {
  const styler = (adresse: string, style: object) => {
    const cellule = feuille[adresse];
    if (cellule) (cellule as { s?: object }).s = style;
  };

  styler('A1', STYLE_LIBELLE);
  styler('B1', STYLE_VALEUR_ENTETE);
  styler('A2', STYLE_LIBELLE);
  styler('B2', STYLE_VALEUR_ENTETE);
  styler('C2', STYLE_LIBELLE);
  styler('D2', STYLE_VALEUR_ENTETE);

  for (let col = 0; col < EN_TETES.length; col++) {
    styler(XLSX.utils.encode_cell({ r: 2, c: col }), STYLE_LIBELLE);
    styler(XLSX.utils.encode_cell({ r: nbLignes - 1, c: col }), STYLE_TOTAL);
  }
}

/**
 * Écrit le rapport dans un classeur et déclenche le téléchargement.
 *
 * En `.xls` (BIFF8) les styles sont ignorés : le format binaire hérité ne les
 * transporte pas. Le rendu gris n'apparaît donc qu'en `.xlsx`.
 */
export function exporterDisaExcel(rapport: DisaRapport, format: FormatDisa = 'xls'): void {
  const matrice = disaVersMatrice(rapport);
  const feuille = XLSX.utils.aoa_to_sheet(matrice);
  feuille['!cols'] = LARGEURS.map((wch) => ({ wch }));
  habillerFeuille(feuille, matrice.length);

  const classeur = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(classeur, feuille, 'DISA');

  XLSX.writeFile(classeur, nomFichierDisa(rapport, format), {
    bookType: format === 'xlsx' ? 'xlsx' : 'biff8',
  });
}
