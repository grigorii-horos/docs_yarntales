const fs = require('fs');
const path = require('path');

const bagsDir = path.join(__dirname, '../public/data/Bags');

const files = fs.readdirSync(bagsDir);
for (const file of files) {
  const targetDir = path.join(bagsDir, file);
  if (fs.statSync(targetDir).isDirectory()) {
    const pdfs = fs.readdirSync(targetDir).filter(f => f.endsWith('.pdf'));
    if (pdfs.length > 0) {
      const pdfName = pdfs[0];
      const previewName = `${pdfName}.preview.jpg`;
      const baseName = path.basename(pdfName, '.pdf');
      
      const langs = ['ru', 'en', 'ro'];
      for (const lang of langs) {
        const mdPath = path.join(targetDir, `ITEM.${lang}.md`);
        if (fs.existsSync(mdPath)) {
          let content = fs.readFileSync(mdPath, 'utf8');
          
          let title = baseName;
          if (lang === 'en') title = `${baseName} (EN)`;
          if (lang === 'ro') title = `${baseName} (RO)`;
          
          if (!content.includes('title:')) {
            content = content.replace(/^---\n/, `---
title: "${title}"
preview: "${previewName}"
`);
            fs.writeFileSync(mdPath, content);
          }
        }
      }
    }
  }
}
console.log('Meta injected.');
