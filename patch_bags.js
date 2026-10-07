const fs = require('fs');
const path = require('path');

const bagsDir = 'public/data/Bags';

const titles = {
  'ru': 'Сумки',
  'en': 'Bags',
  'ro': 'Genți'
};

for (const lang of ['ru', 'en', 'ro']) {
  const filePath = path.join(bagsDir, `FOLDER.${lang}.md`);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    if (!content.startsWith('---')) {
      content = `---\ntitle: "${titles[lang]}"\n---\n` + content;
      fs.writeFileSync(filePath, content);
    }
  }
}
console.log('Patched FOLDERs');
