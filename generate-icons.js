// Script simple pour copier le logo comme icône
const fs = require('fs');
const path = require('path');

const source = path.join(__dirname, 'public', 'logo-mairie.png');
const iconsDir = path.join(__dirname, 'public', 'icons');

// Créer le dossier icons s'il n'existe pas
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Pour l'instant, copier le logo comme favicon
const faviconPath = path.join(__dirname, 'public', 'favicon.ico');
fs.copyFileSync(source, faviconPath.replace('.ico', '.png'));

console.log('✓ Logo copié comme favicon');
console.log('\nPour générer toutes les icônes aux bonnes tailles:');
console.log('npm install -g @quasar/icongenie');
console.log('icongenie generate -i public/logo-mairie.png -m spa,pwa,electron');
