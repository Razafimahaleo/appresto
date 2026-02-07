cls/**
 * Correctif Windows : le chemin "node:sea" contient ":" invalide sur Windows.
 * Ce script patch le fichier @expo/cli pour utiliser un chemin safe.
 */
const fs = require('fs');
const path = require('path');

if (process.platform !== 'win32') process.exit(0);

const cliPackagePath = path.join(__dirname, '..', 'node_modules', '@expo', 'cli', 'package.json');
if (!fs.existsSync(cliPackagePath)) process.exit(0);

// Chercher externals.js ou externals.ts dans build/
const buildDir = path.join(__dirname, '..', 'node_modules', '@expo', 'cli', 'build');
if (!fs.existsSync(buildDir)) process.exit(0);

function findAndPatch(dir) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  for (const f of files) {
    const full = path.join(dir, f.name);
    if (f.isDirectory()) {
      findAndPatch(full);
    } else if (f.name === 'externals.js') {
      let content = fs.readFileSync(full, 'utf8');
      if (content.includes('path.join') && content.includes('externalsDir') && content.includes('moduleName') && !content.includes('moduleName.replace(/:/g')) {
        content = content.replace(
          /path\.join\(\s*externalsDir\s*,\s*moduleName\s*\)/g,
          "path.join(externalsDir, process.platform === 'win32' ? moduleName.replace(/:/g, '_') : moduleName)"
        );
        fs.writeFileSync(full, content);
        console.log('Correctif Windows Expo (node:sea) appliqué.');
      }
    }
  }
}

findAndPatch(buildDir);
