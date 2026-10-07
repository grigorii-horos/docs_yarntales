const fs = require('fs');
const file = 'src/App.vue';
let content = fs.readFileSync(file, 'utf8');

// Update syncFromHash
content = content.replace(
  /function syncFromHash\(\) \{[\s\S]*?\}\n\}/,
  `function syncFromHash() {
  const hash = window.location.hash.slice(1);
  if (hash) {
    const [pathPart, queryPart] = hash.split('?');
    if (pathPart) {
      const decodedPath = decodeURIComponent(pathPart);
      if (decodedPath !== currentPath.value) {
        currentPath.value = decodedPath;
      }
    }
    if (queryPart) {
      const params = new URLSearchParams(queryPart);
      if (params.has('lang') && params.get('lang') !== currentLang.value) {
        currentLang.value = params.get('lang');
      }
    }
  }
}`
);

// Update watch
content = content.replace(
  /watch\(\[currentPath, currentLang\], \(\[newPath, newLang\]\) => \{[\s\S]*?\}\)/,
  `watch([currentPath, currentLang], ([newPath, newLang]) => {
  const newHash = \`\${newPath}?lang=\${newLang}\`;
  if (decodeURIComponent(window.location.hash) !== '#' + newHash) {
    window.location.hash = newHash;
  }
})`
);

fs.writeFileSync(file, content);
console.log('Patched App.vue for hash decoding');
