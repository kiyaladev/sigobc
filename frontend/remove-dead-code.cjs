const fs = require('fs');
const path = require('path');

const dbFile = path.join(__dirname, 'src', 'database', 'db.ts');
let content = fs.readFileSync(dbFile, 'utf8');

// The dead block starts right after the db object (after '};')
// We identify start by looking for the first '\n\n\n  constructor() {'
// and end by looking for the '}\n}\n\n' that precedes the export function

const startTag = '\n\n\n  constructor() {';
const startIdx = content.indexOf(startTag);

// The dead block ends just before '// Fonction d'initialisation'
const funcComment = "// Fonction d'initialisation";
const funcIdx = content.indexOf(funcComment);

if (startIdx === -1) {
  console.error('Start marker not found');
  process.exit(1);
}
if (funcIdx === -1) {
  console.error('End marker not found');
  // Try with regular apostrophe
  const altIdx = content.indexOf("// Fonction d'initialisation");
  console.log('Alt search result:', altIdx);
  console.log(
    'Content around line 756:',
    JSON.stringify(
      content.slice(content.indexOf('}\n}\n\n') - 10, content.indexOf('}\n}\n\n') + 100),
    ),
  );
  process.exit(1);
}

console.log('startIdx:', startIdx);
console.log('funcIdx:', funcIdx);

// Find the end of the dead block: last }\n} before funcIdx
// The dead block ends with "    });\n  }\n}\n\n"
const endTag = '\n}\n\n';
const endIdx = content.lastIndexOf(endTag, funcIdx);

if (endIdx === -1 || endIdx <= startIdx) {
  console.error('End tag not found properly. endIdx=' + endIdx);
  process.exit(1);
}

console.log('endIdx:', endIdx);
console.log('Characters being removed:', endIdx + endTag.length - startIdx);

const cleaned = content.slice(0, startIdx) + '\n\n' + content.slice(endIdx + endTag.length);
fs.writeFileSync(dbFile, cleaned, 'utf8');
console.log('Done! Dead Dexie code removed.');
