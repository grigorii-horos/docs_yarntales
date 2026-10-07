const fs = require('fs');
const path = require('path');

const bagsDir = path.join(__dirname, '../public/data/Bags');

// Add FOLDER.ro.md if missing
if (!fs.existsSync(path.join(bagsDir, 'FOLDER.ro.md'))) {
  const folderRo = `# Instrucțiuni pentru genți\nAici găsiți toate instrucțiunile de îngrijire pentru gențile noastre. Alegeți una de mai jos:\n`;
  fs.writeFileSync(path.join(bagsDir, 'FOLDER.ro.md'), folderRo);
}

const files = fs.readdirSync(bagsDir);

for (const file of files) {
  const targetDir = path.join(bagsDir, file);
  if (fs.statSync(targetDir).isDirectory()) {
    const pdfs = fs.readdirSync(targetDir).filter(f => f.endsWith('.pdf'));
    if (pdfs.length > 0) {
      const pdfName = pdfs[0];
      const baseName = path.basename(pdfName, '.pdf');
      
      const roContent = `---
files:
  - "${pdfName}"
---
# ${baseName}

Instrucțiuni de îngrijire:
`;
      fs.writeFileSync(path.join(targetDir, 'ITEM.ro.md'), roContent);
    }
  }
}
console.log('RO added.');
