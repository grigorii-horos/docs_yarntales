const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../public/data');
const OUTPUT_FILE = path.join(__dirname, '../public/tree.json');

function buildTree(dirPath, basePath = '/data') {
  if (!fs.existsSync(dirPath)) return null;
  const stat = fs.statSync(dirPath);
  if (!stat.isDirectory()) return null;

  const items = fs.readdirSync(dirPath);
  const node = {
    name: path.basename(dirPath),
    path: basePath,
    type: 'folder',
    children: [],
    files: []
  };

  if (basePath === '/data') {
    node.name = 'Root';
  }

  // Check for FOLDER.md or ITEM.md
  if (items.includes('FOLDER.md')) {
    node.type = 'folder';
    node.content = fs.readFileSync(path.join(dirPath, 'FOLDER.md'), 'utf-8');
  } else if (items.includes('ITEM.md')) {
    node.type = 'item';
    node.content = fs.readFileSync(path.join(dirPath, 'ITEM.md'), 'utf-8');
  } else {
    node.type = 'folder'; // default
  }

  for (const item of items) {
    if (item === 'FOLDER.md' || item === 'ITEM.md') continue;
    if (item.endsWith('.meta.json') || item.includes('.preview.')) continue;

    const fullPath = path.join(dirPath, item);
    const itemStat = fs.statSync(fullPath);

    if (itemStat.isDirectory()) {
      const childNode = buildTree(fullPath, `${basePath}/${item}`);
      if (childNode) node.children.push(childNode);
    } else {
      // It's a file
      const fileNode = {
        name: item,
        path: `${basePath}/${item}`,
        size: itemStat.size
      };

      // Check meta
      const metaPath = `${fullPath}.meta.json`;
      if (fs.existsSync(metaPath)) {
        try {
          fileNode.meta = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
        } catch(e){}
      }

      // Check preview
      if (fs.existsSync(`${fullPath}.preview.jpg`)) {
        fileNode.preview = `${fileNode.path}.preview.jpg`;
      } else if (fs.existsSync(`${fullPath}.preview.png`)) {
        fileNode.preview = `${fileNode.path}.preview.png`;
      }

      node.files.push(fileNode);
    }
  }

  // Sort children
  node.children.sort((a, b) => a.name.localeCompare(b.name));
  node.files.sort((a, b) => a.name.localeCompare(b.name));

  return node;
}

const tree = buildTree(DATA_DIR);
fs.writeFileSync(OUTPUT_FILE, JSON.stringify(tree, null, 2));
console.log('Tree generated.');
