const fs = require('fs');
const path = require('path');

const bagsDir = path.join(__dirname, '../public/data/Bags');

const files = fs.readdirSync(bagsDir);

for (const file of files) {
  if (file.endsWith('.pdf')) {
    const baseName = path.basename(file, '.pdf');
    const targetDir = path.join(bagsDir, baseName);
    
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir);
    }
    
    // Move PDF
    fs.renameSync(path.join(bagsDir, file), path.join(targetDir, file));
    
    // Move Preview if exists
    const previewName = `${file}.preview.jpg`;
    if (fs.existsSync(path.join(bagsDir, previewName))) {
      fs.renameSync(path.join(bagsDir, previewName), path.join(targetDir, previewName));
    }
    
    // Create ITEM.ru.md
    const ruContent = `---
files:
  - "${file}"
---
# ${baseName}

Инструкция по уходу:
`;
    fs.writeFileSync(path.join(targetDir, 'ITEM.ru.md'), ruContent);

    // Create ITEM.en.md
    const enContent = `---
files:
  - "${file}"
---
# ${baseName}

Care instructions:
`;
    fs.writeFileSync(path.join(targetDir, 'ITEM.en.md'), enContent);
  }
}
console.log('Migration done.');
