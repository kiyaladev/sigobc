/* eslint-disable */
// Synchronise frontend/src/constanteInfo.js depuis frontend/public/constanteInfo.js.
// Le fichier public est la source unique : il est chargé par les HTML statiques
// (script tag) et par les modules Vue/TS via cet wrapper généré.

const fs = require('fs');
const path = require('path');

const PUBLIC_PATH = path.resolve(__dirname, '..', 'public', 'constanteInfo.js');
const SRC_PATH = path.resolve(__dirname, '..', 'src', 'constanteInfo.js');

const source = fs.readFileSync(PUBLIC_PATH, 'utf8');

// On remplace `var MAIRIE_INFO` par `export const MAIRIE_INFO` (le bloc commenté
// reste commenté tel quel). L'ancre `^` en mode multiligne évite de toucher aux
// déclarations commentées (`// var MAIRIE_INFO = {`) qui précèdent la vraie.
const DECLARATION_RE = /^var\s+MAIRIE_INFO\s*=/m;

if (!DECLARATION_RE.test(source)) {
  console.error(
    '[sync-mairie-info] Aucune déclaration active `var MAIRIE_INFO =` trouvée dans ' + PUBLIC_PATH,
  );
  process.exit(1);
}

const transformed = source.replace(DECLARATION_RE, 'export const MAIRIE_INFO =');

const banner =
  '// ⚠️ Fichier généré automatiquement par scripts/sync-mairie-info.cjs.\n' +
  '// Source de vérité : frontend/public/constanteInfo.js. Ne pas éditer directement.\n\n';

fs.writeFileSync(SRC_PATH, banner + transformed, 'utf8');
console.log('[sync-mairie-info] ' + SRC_PATH + ' regenerated from public/constanteInfo.js');
