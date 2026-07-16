const fs = require('fs');
const path = require('path');
const DIR = __dirname;

const LIVE = require('c:/Me/sigobc-module-depenses-2026-07-13-14-18-38.json');
const live = LIVE.data || LIVE;
const { folios } = JSON.parse(fs.readFileSync(path.join(DIR, 'consolide.json'), 'utf8'));

// --- Resolution doublon folio 122 (le "122" de 20.47 = folio 121) ---
for (const f of folios) {
  if (f.numero === 122 && f.totalPresent === 480000 && /20\.47/.test(f.source)) f.numero = 121;
}

// --- Fusion des 12 folios re-scannes (PDF 14-07) : remplacent les versions degradees ---
const recuperes = JSON.parse(fs.readFileSync(path.join(DIR, 'p8-14.07-recuperes.json'), 'utf8')).folios
  .map(f => ({ ...f, source: 'CamScanner 14-07-2026 15.42.pdf' }));
const numsRecuperes = new Set(recuperes.map(f => f.numero));
folios.splice(0, folios.length, ...folios.filter(f => !numsRecuperes.has(f.numero)), ...recuperes);

// --- Fix numerotation folio 101 (Transport) : N° 627-633 chevauchent le folio 99.
//     Entre folio 100 (636) et folio 102 (644), le folio 101 doit porter 637-643. ---
const f101 = folios.find(f => f.numero === 101 && /20\.38/.test(f.source || ''));
if (f101) f101.mandats.forEach((m, i) => { m.numeroOrdre = 637 + i; });

// --- Reference vive ---
const chapitres = live.chapitres || [];
const sousChapitres = [...(live.sousChapitres || [])];
const chByCode = new Map();
for (const c of chapitres) if (typeof c.id === 'number') chByCode.set(String(c.code), c.id);
const scByCode = new Map();
for (const s of sousChapitres) if (typeof s.id === 'number') scByCode.set(String(s.code), s.id);

// --- Normalisation OCR sure + libelles des codes a creer ---
const NORM = { '6013': '60013', '6906': '6006' };
const LIB = {
  '6131': "Opérations d'assainissement",
  '6344': 'Marchés',
  '9100': 'Administration (investissement)',
  '9212': 'Hôpitaux & Dispensaires (investissement)',
  '6205': 'ACHAT DE MATERIELS (code à vérifier)',
  '6018': 'Cotisation (code à vérifier)',
  '6812': 'Prime de session (code à vérifier)',
};

// --- Re-basement IDs sur la base vive ---
const maxId = (arr) => arr.reduce((m, x) => Math.max(m, x.id || 0), 0);
let bId = maxId(live.bordereauMandats || []) + 1; // bordereaux
let mId = maxId(live.mandats || []) + 1;           // mandats
let scId = maxId(sousChapitres) + 1;               // sous-chapitres crees
const nowIso = new Date().toISOString();

const nouveauxSC = [];
function ensureSC(code) {
  if (scByCode.has(code)) return scByCode.get(code);
  const id = scId++;
  const rec = { code, libelle: LIB[code] || (code + ' (à définir)'), description: '', parentId: null, mairieId: 1, actif: true, createdAt: nowIso, updatedAt: nowIso, id };
  sousChapitres.push(rec);
  nouveauxSC.push(rec);
  scByCode.set(code, id);
  return id;
}

const FOLIO_MIN = 1, FOLIO_MAX = 123;
const importBordereaux = [];
const importMandats = [];
const aSaisir = [];
const collisions = [];
const numeroMandatVus = new Set();

const enPerimetre = folios
  .filter(f => typeof f.numero === 'number' && f.numero >= FOLIO_MIN && f.numero <= FOLIO_MAX)
  .sort((a, b) => a.numero - b.numero);

for (const fo of enPerimetre) {
  const hasNull = fo.mandats.some(m => m.somme == null);
  const sommeLignes = fo.mandats.reduce((a, m) => a + (m.somme || 0), 0);
  if (hasNull || sommeLignes !== fo.totalPresent) {
    aSaisir.push({ folio: fo.numero, source: fo.source, raison: hasNull ? 'montants illisibles' : `Σ lignes (${sommeLignes}) != total (${fo.totalPresent})`, totalPresent: fo.totalPresent, sommeLignes, mandats: fo.mandats });
    continue;
  }
  const lignes = [];
  for (const m of fo.mandats) {
    let scCode = m.imputationFonctionnelle != null ? String(m.imputationFonctionnelle) : null;
    if (scCode && NORM[scCode]) scCode = NORM[scCode];
    // chapitre patrimonial (2211/2219...) -> champ patrimonial, chapitreId null
    const chId = m.chapitre != null && chByCode.has(String(m.chapitre)) ? chByCode.get(String(m.chapitre)) : null;
    const patrimonial = (m.chapitre != null && chId === null) ? String(m.chapitre) : '';
    const scResId = scCode ? ensureSC(scCode) : null;

    const numeroMandat = String(m.numeroOrdre);
    if (numeroMandatVus.has(numeroMandat)) collisions.push({ folio: fo.numero, numeroMandat });
    numeroMandatVus.add(numeroMandat);

    const obs = [];
    if (m.imputationFonctionnelle != null && NORM[String(m.imputationFonctionnelle)]) obs.push(`imputation ${m.imputationFonctionnelle}->${scCode}`);
    if (scCode && LIB[scCode] && !((live.sousChapitres || []).some(s => String(s.code) === scCode))) obs.push(`code ${scCode} CREE`);
    if (patrimonial) obs.push(`imputation patrimoniale ${patrimonial} (investissement)`);
    if ((fo.warnings || []).length) obs.push('folio: ' + fo.warnings.join(' | '));

    importMandats.push({
      numeroMandat, numeroOrdre: m.numeroOrdre, exercice: fo.exercice,
      dateMandat: fo.dateEmission ? fo.dateEmission + 'T00:00:00.000Z' : null,
      chapitreId: chId, sousChapitreId: scResId, bordereauMandatId: bId, mairieId: 1,
      beneficiaire: m.creancier, patrimonial, objet: m.nature, montant: m.somme,
      modePaiement: 'virement', statut: 'paye', observations: obs.join(' ; '),
      personnelId: 1, createdAt: nowIso, updatedAt: nowIso, id: mId++,
    });
    lignes.push(m.somme || 0);
  }
  importBordereaux.push({
    numero: fo.numero, exercice: fo.exercice,
    dateEmission: fo.dateEmission ? fo.dateEmission + 'T00:00:00.000Z' : null,
    mairieId: 1, montantTotal: lignes.reduce((a, b) => a + b, 0), totalPrecedent: fo.totalPrecedent,
    nombreMandats: fo.mandats.length, statut: 'ferme', observations: '',
    personnelId: 1, createdAt: nowIso, updatedAt: nowIso, id: bId++,
  });
}

// --- Module Depenses final : demo REMPLACEE par le reel, referentiel vif conserve + codes crees ---
const data = {
  chapitres,
  sousChapitres,
  previsions: live.previsions || [],
  mandats: importMandats,
  bordereauMandats: importBordereaux,
  etatFinancierMensuel: live.etatFinancierMensuel || [],
};
const stats = {}; for (const k of Object.keys(data)) stats[k] = data[k].length;
const out = { version: '3.0', appName: 'SIGOBC-MAIRIE', exportType: 'module', moduleKey: 'depenses', moduleLabel: 'Dépenses', exportDate: nowIso, data, stats };
fs.writeFileSync(path.join(DIR, 'sigobc-module-depenses-REEL.json'), JSON.stringify(out, null, 2));
fs.writeFileSync(path.join(DIR, 'A-SAISIR-MANUELLEMENT.json'), JSON.stringify(aSaisir, null, 2));

console.log('=== MODULE DEPENSES REEL (demo remplacee) ===');
console.log('Bordereaux :', importBordereaux.length, '(ids ' + (importBordereaux[0]?.id) + '->' + (bId - 1) + ')');
console.log('Mandats    :', importMandats.length, '(ids ' + (importMandats[0]?.id) + '->' + (mId - 1) + ')');
console.log('Montant total :', importMandats.reduce((a, m) => a + m.montant, 0).toLocaleString('fr-FR'), 'FCFA');
console.log('Sous-chapitres CREES :', nouveauxSC.map(s => s.code + '(id' + s.id + ')').join(', ') || 'aucun');
console.log('Folios exclus -> A-SAISIR :', aSaisir.map(a => a.folio).join(', '));
console.log('Collisions numeroMandat :', collisions.length ? collisions.map(c => c.numeroMandat + '(f' + c.folio + ')').join(', ') : 'aucune');
console.log('Referentiel conserve : chapitres', stats.chapitres, '| sousChapitres', stats.sousChapitres, '| previsions', stats.previsions);
