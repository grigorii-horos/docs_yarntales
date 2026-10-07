<template>
  <div class="portal-app">
    <!-- Header -->
    <header class="header">
      <div class="logo">
        <span class="icon-logo">🧶</span>
        <span>Yarntales Instructions</span>
      </div>
      <div class="search-bar">
        <input type="text" placeholder="Search instructions..." v-model="searchQuery" />
      </div>
    </header>

    <div class="main-layout">
      <!-- Sidebar -->
      <aside class="sidebar">
        <div class="nav-tree">
          <tree-node 
            :node="tree" 
            :currentPath="currentPath"
            @navigate="navigate"
          />
        </div>
      </aside>

      <!-- Content -->
      <main class="content-area" v-if="currentNode">
        <div class="breadcrumbs">
          <span v-for="(crumb, idx) in breadcrumbs" :key="idx">
            <span class="crumb" @click="navigate(crumb.path)">{{ crumb.name }}</span>
            <span class="separator" v-if="idx < breadcrumbs.length - 1">›</span>
          </span>
        </div>

        <div class="scroll-area">
          
          <!-- ITEM / FOLDER Markdown Content -->
          <div class="markdown-body" v-if="currentNode.content" v-html="parsedContent"></div>
          
          <!-- Subfolders / Items Grid (For Folders) -->
          <div class="section" v-if="currentNode.type === 'folder' && filteredChildren.length > 0">
            <h3>Subsections & Items</h3>
            <div class="grid">
              <div 
                class="card item-card" 
                v-for="child in filteredChildren" 
                :key="child.path"
                @click="navigate(child.path)"
              >
                <div class="icon">{{ child.type === 'item' ? '📖' : '📁' }}</div>
                <div class="details">
                  <div class="name">{{ child.name }}</div>
                  <div class="type">{{ child.type === 'item' ? 'Instruction' : 'Folder' }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Files Grid (PDFs, Images, etc) -->
          <div class="section" v-if="filteredFiles.length > 0">
            <h3>Attached Files</h3>
            <div class="grid files-grid">
              <a 
                class="card file-card" 
                v-for="file in filteredFiles" 
                :key="file.path"
                :href="file.path"
                target="_blank"
                download
              >
                <div class="thumbnail-wrapper">
                  <img v-if="file.preview" :src="file.preview" class="thumbnail" />
                  <span v-else class="file-icon">📄</span>
                </div>
                <div class="file-info">
                  <span class="name">{{ file.meta?.title || file.name }}</span>
                  <span class="size">{{ formatBytes(file.size) }}</span>
                </div>
              </a>
            </div>
          </div>

          <div v-if="!currentNode.content && filteredChildren.length === 0 && filteredFiles.length === 0" class="empty">
            Nothing to display here.
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { marked } from 'marked'
import TreeNode from './components/TreeNode.vue'

const tree = ref(null)
const currentPath = ref('/data')
const searchQuery = ref('')

onMounted(async () => {
  try {
    const res = await fetch('/tree.json')
    tree.value = await res.json()
  } catch (e) {
    console.error('Failed to load tree', e)
  }
})

function findNode(node, path) {
  if (!node) return null;
  if (node.path === path) return node;
  for (const child of node.children || []) {
    const found = findNode(child, path);
    if (found) return found;
  }
  return null;
}

const currentNode = computed(() => {
  return findNode(tree.value, currentPath.value)
})

const parsedContent = computed(() => {
  if (currentNode.value && currentNode.value.content) {
    return marked(currentNode.value.content)
  }
  return ''
})

const filteredChildren = computed(() => {
  if (!currentNode.value || !currentNode.value.children) return [];
  if (!searchQuery.value) return currentNode.value.children;
  const q = searchQuery.value.toLowerCase();
  return currentNode.value.children.filter(c => c.name.toLowerCase().includes(q));
})

const filteredFiles = computed(() => {
  if (!currentNode.value || !currentNode.value.files) return [];
  if (!searchQuery.value) return currentNode.value.files;
  const q = searchQuery.value.toLowerCase();
  return currentNode.value.files.filter(f => f.name.toLowerCase().includes(q) || (f.meta && f.meta.title && f.meta.title.toLowerCase().includes(q)));
})

const breadcrumbs = computed(() => {
  if (currentPath.value === '/data') return [{ name: 'Home', path: '/data' }]
  const parts = currentPath.value.replace('/data', '').split('/').filter(Boolean)
  let acc = '/data'
  const crumbs = [{ name: 'Home', path: '/data' }]
  parts.forEach(p => {
    acc += '/' + p
    crumbs.push({ name: p, path: acc })
  })
  return crumbs
})

function navigate(path) {
  currentPath.value = path
  searchQuery.value = ''
}

function formatBytes(bytes) {
  if (!bytes) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
</script>

<style scoped>
.portal-app {
  display: flex;
  flex-direction: column;
  height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  color: #333;
  background: #fafafa;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 2rem;
  background: #fff;
  border-bottom: 1px solid #eaeaea;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  z-index: 10;
}
.logo { font-size: 1.5rem; font-weight: 600; display: flex; align-items: center; gap: 0.5rem; }
.search-bar input {
  padding: 0.6rem 1rem;
  width: 300px;
  border-radius: 20px;
  border: 1px solid #ccc;
  outline: none;
}
.search-bar input:focus { border-color: #0070f3; }

.main-layout { display: flex; flex: 1; overflow: hidden; }

.sidebar {
  width: 280px;
  background: #fff;
  border-right: 1px solid #eaeaea;
  padding: 1.5rem 1rem;
  overflow-y: auto;
}

.content-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #fafafa;
  overflow: hidden;
}

.breadcrumbs { padding: 1.5rem 2rem 0; font-size: 0.95rem; color: #666; }
.crumb { cursor: pointer; color: #0070f3; }
.crumb:hover { text-decoration: underline; }
.separator { margin: 0 0.5rem; color: #999; }

.scroll-area {
  flex: 1;
  padding: 1.5rem 2rem 3rem;
  overflow-y: auto;
}

.markdown-body {
  background: #fff;
  padding: 2.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  border: 1px solid #eaeaea;
  margin-bottom: 2.5rem;
  line-height: 1.6;
  font-size: 1.05rem;
  max-width: 900px;
}
:deep(.markdown-body h1) { margin-top: 0; font-size: 2rem; }
:deep(.markdown-body img) { max-width: 100%; border-radius: 8px; }

.section h3 { font-size: 1.2rem; margin-bottom: 1rem; color: #444; border-bottom: 2px solid #eaeaea; padding-bottom: 0.5rem; display: inline-block; }

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.card {
  background: #fff;
  border: 1px solid #eaeaea;
  border-radius: 10px;
  transition: all 0.2s;
  cursor: pointer;
  text-decoration: none;
  color: inherit;
  overflow: hidden;
}
.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 15px rgba(0,0,0,0.08);
  border-color: #ddd;
}

.item-card {
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}
.item-card .icon { font-size: 2.5rem; }
.item-card .name { font-weight: 600; font-size: 1.05rem; margin-bottom: 0.2rem; }
.item-card .type { font-size: 0.85rem; color: #888; text-transform: uppercase; letter-spacing: 0.5px; }

.file-card {
  display: flex;
  flex-direction: column;
}
.thumbnail-wrapper {
  height: 160px;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid #eaeaea;
}
.thumbnail { width: 100%; height: 100%; object-fit: cover; }
.file-icon { font-size: 4rem; opacity: 0.5; }
.file-info {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}
.file-info .name { font-weight: 500; font-size: 0.95rem; }
.file-info .size { font-size: 0.85rem; color: #888; }

.empty { color: #888; font-style: italic; margin-top: 2rem; }
</style>
