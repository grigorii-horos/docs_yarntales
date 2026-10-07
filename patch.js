const fs = require('fs');
const file = 'src/App.vue';
let content = fs.readFileSync(file, 'utf8');

// Remove search bar
content = content.replace(/<div class="search-bar">[\s\S]*?<\/div>\s*/, '');

// Remove breadcrumbs
content = content.replace(/<div class="breadcrumbs">[\s\S]*?<\/div>\s*/, '');

// Remove searchQuery ref and breadcrumbs computed
content = content.replace(/const searchQuery = ref\(''\)\n/, '');
content = content.replace(/searchQuery\.value = ''\n/, '');

// Remove searchQuery from filteredChildren
content = content.replace(/if \(!searchQuery\.value\) return currentNode\.value\.children;\n\s*const q = searchQuery\.value\.toLowerCase\(\);\n\s*return currentNode\.value\.children\.filter\(c => {\n\s*const name = getChildName\(c\)\.toLowerCase\(\);\n\s*return name\.includes\(q\) \|\| c\.name\.toLowerCase\(\)\.includes\(q\);\n\s*}\);\n/, 'return currentNode.value.children;\n');

// Remove searchQuery from filteredFiles
content = content.replace(/if \(searchQuery\.value\) {[\s\S]*?}\n\s*return files;\n/, 'return files;\n');

// Remove breadcrumbs computed
content = content.replace(/const breadcrumbs = computed\(\(\) => {[\s\S]*?}\)\n/, '');

fs.writeFileSync(file, content);
console.log('Patched');
