const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const DATA_DIR = path.join(__dirname, '../public/data');

function scanAndGenerate(dir) {
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      scanAndGenerate(fullPath);
    } else if (item.endsWith('.pdf')) {
      const previewPath = `${fullPath}.preview.jpg`;
      if (!fs.existsSync(previewPath)) {
        console.log(`Generating preview for ${item}...`);
        try {
          // pdftoppm outputs to <prefix>-1.jpg
          const prefix = `${fullPath}.preview`;
          execSync(`pdftoppm -jpeg -f 1 -l 1 "${fullPath}" "${prefix}"`);
          // rename prefix-1.jpg or prefix-01.jpg etc
          const possibleSuffixes = ['-1.jpg', '-01.jpg', '-001.jpg'];
          for (const suffix of possibleSuffixes) {
            if (fs.existsSync(`${prefix}${suffix}`)) {
              fs.renameSync(`${prefix}${suffix}`, previewPath);
              break;
            }
          }
        } catch (e) {
          console.error(`Failed to generate preview for ${item}:`, e.message);
        }
      }
    }
  }
}

console.log('Scanning for PDFs without previews...');
scanAndGenerate(DATA_DIR);
console.log('Preview generation complete.');
