const fs = require('fs');
const path = require('path');
const DIR = __dirname;
const ROOT = path.join(DIR, '..');

// --- reference maps ---
const chapitres = require(path.join(ROOT, 'TresorDatabase/chapitres.json'));
const sousChapitres = require(path.join(ROOT, 'TresorDatabase/sousChapitres.json'));

function buildCodeMap(rows) {
  const m = new Map();
  for (const r of rows) {
    if (typeof r.id !== 'number') continue;
    const code = String(r.code);
    const prev = m.get(code);
    // prefer mairieId===1, else first with id
    if (!prev || (r.mairieId === 1 && prev.mairieId !== 1)) m.set(code, r);
  }
  return m;
}
const chapMap = buildCodeMap(chapitres);   // code "1".."8" -> chapitre
const scMap = buildCodeMap(sousChapitres); // code -> souschapitre

// --- load extractions ---
const files = ['p1-19.39','p2-19.48','p3-19.59','p4-20.23','p5-20.38','p6-20.47','p7-20.54']
  .map(f => JSON.parse(fs.readFileSync(path.join(DIR, f + '.json'), 'utf8')));

const allFolios = [];
for (const f of files) for (const fo of f.folios) allFolios.push({ ...fo, source: f.fichier });

// --- resolve codes + validate lines ---
const unresolvedSC = new Set();
const unresolvedCH = new Set();
let nbMandats = 0, nbSommeNull = 0;
for (const fo of allFolios) {
  for (const m of fo.mandats) {
    nbMandats++;
    if (m.somme == null) nbSommeNull++;
    const sc = m.imputationFonctionnelle != null ? scMap.get(String(m.imputationFonctionnelle)) : null;
    const ch = m.chapitre != null ? chapMap.get(String(m.chapitre)) : null;
    m.sousChapitreId = sc ? sc.id : null;
    m.chapitreId = ch ? ch.id : null;
    if (m.imputationFonctionnelle != null && !sc) unresolvedSC.add(String(m.imputationFonctionnelle));
    if (m.chapitre != null && !ch) unresolvedCH.add(String(m.chapitre));
  }
}

// --- folio-level validation ---
const byNum = new Map();
for (const fo of allFolios) {
  if (!byNum.has(fo.numero)) byNum.set(fo.numero, []);
  byNum.get(fo.numero).push(fo);
}
const dupFolios = [...byNum.entries()].filter(([, v]) => v.length > 1).map(([k]) => k);
const nums = [...byNum.keys()].filter(n => typeof n === 'number').sort((a, b) => a - b);
const gaps = [];
for (let i = nums[0]; i <= nums[nums.length - 1]; i++) if (!byNum.has(i)) gaps.push(i);
const totalMismatch = allFolios.filter(f => f.totalMatch === false).map(f => f.numero);
const totalNull = allFolios.filter(f => f.totalMatch === null).map(f => f.numero);

// numeroOrdre collisions
const ordreSeen = new Map();
for (const fo of allFolios) for (const m of fo.mandats) {
  if (m.numeroOrdre == null) continue;
  if (!ordreSeen.has(m.numeroOrdre)) ordreSeen.set(m.numeroOrdre, []);
  ordreSeen.get(m.numeroOrdre).push(fo.numero);
}
const ordreDups = [...ordreSeen.entries()].filter(([, v]) => v.length > 1);

// grand totals
const sommeGlobale = allFolios.reduce((s, f) =>
  s + f.mandats.reduce((a, m) => a + (m.somme || 0), 0), 0);

fs.writeFileSync(path.join(DIR, 'consolide.json'),
  JSON.stringify({ folios: allFolios }, null, 1));

console.log('=== CONSOLIDATION ===');
console.log('Folios extraits :', allFolios.length, '| Mandats :', nbMandats, '| sommes null :', nbSommeNull);
console.log('Somme globale des lignes :', sommeGlobale.toLocaleString('fr-FR'));
console.log('Plage folios :', nums[0], '->', nums[nums.length - 1]);
console.log('Folios en DOUBLON (num utilise 2x) :', dupFolios.length ? dupFolios.join(', ') : 'aucun');
console.log('Folios MANQUANTS (trous) :', gaps.length ? gaps.join(', ') : 'aucun');
console.log('Folios total NON concordant (Sigma != total) :', totalMismatch.join(', ') || 'aucun');
console.log('Folios total NON verifiable (montants null) :', totalNull.join(', ') || 'aucun');
console.log('numeroOrdre en COLLISION :', ordreDups.length, 'valeurs');
if (ordreDups.length) console.log('   ex:', ordreDups.slice(0, 12).map(([n, f]) => n + '(folios ' + [...new Set(f)].join('/') + ')').join(', '));
console.log('Codes sous-chapitre NON resolus :', [...unresolvedSC].sort().join(', ') || 'aucun');
console.log('Codes chapitre NON resolus :', [...unresolvedCH].sort().join(', ') || 'aucun');
