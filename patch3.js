const fs = require('fs');
const file = 'scripts/generate-tree.js';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /allowedFiles = fileLines.map\(l => l.replace\(\/\^- \/, ''\).replace\(\/\["'\\]\/g, ''\).trim\(\)\);/g,
  "allowedFiles = fileLines.map(l => l.trim().replace(/^- /, '').replace(/[\"']/g, '').trim());"
);

fs.writeFileSync(file, content);
