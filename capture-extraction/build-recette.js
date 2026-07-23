const fs = require('fs');
const path = require('path');
const DIR = __dirname;
const OFF = 'c:/Me/SIGOBC_export/SIGOBC_export/TresorOfflineDB/';
const now = new Date().toISOString();

const taxesSrc = require(OFF + 'taxes.json');
const chapSrc = require(OFF + 'chapitresRecette.json');
const NORM = { '7026': '70262', '0401': '401' };
const LIB_NEW = {
  '72030': "Taxes des ODP (occupations domaine public)", '7126': "Location du foyer (SSCPH)",
  '71336': "Autres recettes transports et communications", '401': "Subventions d'equipement de l'Etat",
  '70261': "Impot synthetique", '71250': "Administration des activites culturelles",
  '71256': "Autres recettes activites culturelles", '7000': "Contribution fonciere proprietes baties",
  '7004': "Contribution des patentes", '7300': "Subvention - Partie minimale",
  '7301': "Subvention - Partie complementaire (general)", '7302': "Subvention - Partie complementaire (special)",
  '71006': "Location de salle", '71016': "Autres recettes prestations Administration",
  '71152': "Morgue - Depots de cercueils", '71126': "Autres recettes urbanisme",
};

// Un referentiel taxes independant par commune (fichier autonome, l'import remplace la table)
function buildReferentiel() {
  const taxes = [], byCode = new Map();
  taxesSrc.forEach((t, i) => { const r = { id: i + 1, code: String(t.code), libelle: t.libelle || String(t.code), description: t.description || '', taux: t.taux, montant: t.montant, type: t.type || 'fixe', mairieId: 1, actif: true, createdAt: now, updatedAt: now }; taxes.push(r); byCode.set(r.code, r.id); });
  let next = taxes.length + 1; const crees = [];
  const chapitresRecette = chapSrc.map((c, i) => ({ id: i + 1, code: String(c.code), libelle: c.libelle || '', description: '', mairieId: 1, actif: true, createdAt: now, updatedAt: now }));
  function ensure(code) {
    code = String(code); if (NORM[code]) code = NORM[code];
    if (byCode.has(code)) return { id: byCode.get(code), code, cree: false };
    const r = { id: next++, code, libelle: LIB_NEW[code] || (code + ' (a definir)'), description: '', type: 'fixe', mairieId: 1, actif: true, createdAt: now, updatedAt: now };
    taxes.push(r); byCode.set(code, r.id); crees.push(code); return { id: r.id, code, cree: true };
  }
  return { taxes, chapitresRecette, ensure, crees };
}

function buildCommune({ commune, sources, out }) {
  const ref = buildReferentiel();
  const all = [];
  for (const s of sources) for (const b of require('./' + s).bordereaux) all.push(b);

  // numeros uniques : non-entiers reattribues a max+1
  const maxNum = all.reduce((m, b) => (typeof b.numero === 'number' && b.numero > m ? b.numero : m), 0);
  let nextNum = maxNum + 1;
  for (const b of all) if (typeof b.numero !== 'number') { b._orig = b.numero; b.numero = nextNum++; }
  all.sort((a, b) => a.numero - b.numero);

  let brId = 1, dcId = 1;
  const bordereauxRecette = [], declarations = [], aVerifier = [];
  for (const b of all) {
    const dt = b.dateEncaissement ? b.dateEncaissement + 'T00:00:00.000Z' : null;
    const lignesOk = b.lignes.filter(l => l.montant != null && l.taxeCode != null);
    const sommeDecl = lignesOk.reduce((a, l) => a + l.montant, 0);
    const montantTotal = b.totalPresent != null ? b.totalPresent : sommeDecl; // total officiel du document
    const ecart = montantTotal - sommeDecl;
    const bid = brId++;
    for (const l of lignesOk) {
      const { id: taxeId, code } = ref.ensure(l.taxeCode);
      declarations.push({
        id: dcId++, exercice: 2026, numeroPiece: l.numeroDecompte, dateDeclaration: dt, dateEncaissement: dt,
        bordereauRecetteId: bid, taxeId, mairieId: 1, contribuable: l.nom || 'REGISSEUR', nomPartieVersante: l.nom || 'REGISSEUR',
        numeroLivre: String(l.taxeCode), montant: l.montant, montantRecette: l.montant, modePaiement: 'especes', statut: 'validee',
        observations: l.nature + (NORM[String(l.taxeCode)] ? ` [code ${l.taxeCode}->${code}]` : ''),
        personnelId: 1, createdAt: now, updatedAt: now,
      });
    }
    const obs = [];
    if (b._orig) obs.push(`n° document: ${b._orig}`);
    if (ecart !== 0) { obs.push(`A VERIFIER: Σ declarations (${sommeDecl}) != total bordereau (${montantTotal}), ecart ${ecart}`); aVerifier.push({ numero: b.numero, totalPresent: montantTotal, sommeDeclarations: sommeDecl, ecart }); }
    if (b.note) obs.push(b.note);
    bordereauxRecette.push({ id: bid, numero: b.numero, annee: 2026, mairieId: 1, montantTotal, totalPrecedent: b.totalGeneralPrecedent ?? null, nombreDeclarations: lignesOk.length, dateTransmission: dt, statut: 'ferme', observations: obs.join(' ; '), personnelId: 1, createdAt: now, updatedAt: now });
  }

  const data = { taxes: ref.taxes, chapitresRecette: ref.chapitresRecette, declarations, bordereauxRecette, previsionsRecettes: [], mandatsRecette: [], bordereauMandatsRecette: [], etatFinancierMensuelRecette: [] };
  const stats = {}; for (const k of Object.keys(data)) stats[k] = data[k].length;
  const outObj = { version: '3.0', appName: 'SIGOBC-MAIRIE', exportType: 'module', moduleKey: 'recettes', moduleLabel: 'Recettes', commune, exportDate: now, data, stats };
  fs.writeFileSync(path.join(DIR, out), JSON.stringify(outObj, null, 2));

  // integrite
  let bad = 0; for (const b of bordereauxRecette) { const s = declarations.filter(d => d.bordereauRecetteId === b.id).reduce((a, d) => a + d.montant, 0); if (s !== (b.montantTotal - (aVerifier.find(v => v.numero === b.numero)?.ecart || 0))) bad++; }
  const nums = bordereauxRecette.map(b => b.numero);
  console.log(`\n=== ${commune} -> ${out} ===`);
  console.log('BordereauxRecette:', bordereauxRecette.length, '| Declarations:', declarations.length, '| Montant total (officiel):', bordereauxRecette.reduce((a, b) => a + b.montantTotal, 0).toLocaleString('fr-FR'), 'FCFA');
  console.log('Taxes referentiel:', ref.taxes.length, '(crees:', [...new Set(ref.crees)].join(',') || 'aucun', ')');
  console.log('Doublons numero folio:', nums.filter((n, i) => nums.indexOf(n) !== i).join(',') || 'aucun');
  console.log('Bordereaux A VERIFIER (ecart Σ/total):', aVerifier.map(v => v.numero).join(', ') || 'aucun');
  return { commune, aVerifier };
}

const res = [
  buildCommune({ commune: 'VAVOUA (433)', sources: ['recette-vavoua-p2.json', 'recette-p1-39-45.json'], out: 'sigobc-module-recettes-vavoua.json' }),
  buildCommune({ commune: 'GBOGUHE (491)', sources: ['recette-gboguhe-1-17.json'], out: 'sigobc-module-recettes-gboguhe.json' }),
];
fs.writeFileSync(path.join(DIR, 'A-VERIFIER-RECETTES.json'), JSON.stringify(res, null, 2));
