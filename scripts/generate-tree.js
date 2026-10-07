const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../public/data');
const OUTPUT_FILE = path.join(__dirname, '../public/tree.json');

function buildTree(dirPath, basePath = '/data') {
  const result = [];
  if (!fs.existsSync(dirPath)) return result;

  const items = fs.readdirSync(dirPath);

  for (const item of items) {
    // Ignore meta and preview files directly
    if (item.endsWith('.meta.json') || item.includes('.preview.')) continue;
    
    const fullPath = path.join(dirPath, item);
    const stat = fs.statSync(fullPath);
    
    const node = {
      name: item,
      path: `${basePath}/${item}`,
      type: stat.isDirectory() ? 'directory' : 'file',
      size: stat.size,
      updatedAt: stat.mtime
    };

    if (stat.isDirectory()) {
      node.children = buildTree(fullPath, node.path);
    } else {
      // Check for metadata file
      const metaPath = `${fullPath}.meta.json`;
      if (fs.existsSync(metaPath)) {
        try {
          const metaContent = fs.readFileSync(metaPath, 'utf-8');
          node.meta = JSON.parse(metaContent);
        } catch (e) {
          console.error(`Error parsing meta for ${item}:`, e);
        }
      }

      // Check for preview files (.preview.jpg, .preview.png)
      const previewJpgPath = `${fullPath}.preview.jpg`;
      const previewPngPath = `${fullPath}.preview.png`;
      if (fs.existsSync(previewJpgPath)) {
        node.preview = `${node.path}.preview.jpg`;
      } else if (fs.existsSync(previewPngPath)) {
        node.preview = `${node.path}.preview.png`;
      }
    }
    result.push(node);
  }
  
  // Sort: directories first
  return result.sort((a, b) => {
    if (a.type === 'directory' && b.type === 'file') return -1;
    if (a.type === 'file' && b.type === 'directory') return 1;
    return a.name.localeCompare(b.name);
  });
}

const tree = buildTree(DATA_DIR);
fs.writeFileSync(OUTPUT_FILE, JSON.stringify(tree, null, 2));
console.log(`Tree generated with ${tree.length} top-level items.`);
