<template>
  <div class="explorer">
    <header class="header">
      <h1>Yarntales Files</h1>
    </header>
    
    <main class="main-content">
      <!-- Sidebar / Tree -->
      <div class="sidebar">
        <h3>Navigation</h3>
        <ul class="tree-list">
          <li @click="navigate('/')" :class="{ active: currentPath === '/' }">📁 Root</li>
          <tree-node 
            v-for="node in tree" 
            :key="node.path" 
            :node="node" 
            :currentPath="currentPath"
            @navigate="navigate"
          />
        </ul>
      </div>

      <!-- Content Area -->
      <div class="content">
        <!-- Breadcrumbs -->
        <div class="breadcrumbs">
          <span @click="navigate('/')">Root</span>
          <span v-for="(crumb, idx) in breadcrumbs" :key="idx">
            / <span @click="navigate(crumb.path)">{{ crumb.name }}</span>
          </span>
        </div>

        <!-- Folder View -->
        <div class="grid" v-if="!selectedFile">
          <div 
            class="card" 
            v-for="item in currentFolderContents" 
            :key="item.path"
            @click="handleItemClick(item)"
          >
            <div class="icon">
              {{ item.type === 'directory' ? '📁' : '📄' }}
            </div>
            <div class="details">
              <div class="name">{{ item.name }}</div>
              <div class="meta" v-if="item.meta && item.meta.description">
                {{ item.meta.description }}
              </div>
            </div>
          </div>
          <div v-if="currentFolderContents.length === 0" class="empty">
            Folder is empty
          </div>
        </div>

        <!-- File Preview -->
        <div class="file-view" v-else>
          <div class="actions">
            <button @click="selectedFile = null">⬅ Back to Folder</button>
            <a :href="selectedFile.path" download class="btn-download">⬇ Download</a>
          </div>
          
          <div class="preview-container">
            <div class="preview-pane">
              <img v-if="isImage(selectedFile.name)" :src="selectedFile.path" alt="Preview" />
              <iframe v-else-if="isPdf(selectedFile.name)" :src="selectedFile.path" frameborder="0"></iframe>
              <div v-else class="no-preview">
                No visual preview available for this file type.
              </div>
            </div>
            
            <div class="meta-pane">
              <h3>Metadata</h3>
              <div v-if="selectedFile.meta">
                <div class="meta-item" v-for="(value, key) in selectedFile.meta" :key="key">
                  <strong>{{ key }}:</strong> {{ value }}
                </div>
              </div>
              <div v-else>No metadata available.</div>
              
              <hr />
              <div class="meta-item"><strong>Size:</strong> {{ formatBytes(selectedFile.size) }}</div>
              <div class="meta-item"><strong>Updated:</strong> {{ new Date(selectedFile.updatedAt).toLocaleString() }}</div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

import TreeNode from './components/TreeNode.vue'

const tree = ref([])
const currentPath = ref('/')
const selectedFile = ref(null)

onMounted(async () => {
  try {
    const res = await fetch('/tree.json')
    tree.value = await res.json()
  } catch (e) {
    console.error('Failed to load tree', e)
  }
})

function findNode(nodes, path) {
  for (const node of nodes) {
    if (node.path === path) return node
    if (node.children) {
      const found = findNode(node.children, path)
      if (found) return found
    }
  }
  return null
}

const currentFolderContents = computed(() => {
  if (currentPath.value === '/') {
    return tree.value
  }
  const folder = findNode(tree.value, currentPath.value)
  return folder && folder.children ? folder.children : []
})

const breadcrumbs = computed(() => {
  if (currentPath.value === '/') return []
  const parts = currentPath.value.replace('/data/', '').split('/')
  let acc = '/data'
  return parts.map(p => {
    acc += '/' + p
    return { name: p, path: acc }
  })
})

function navigate(path) {
  currentPath.value = path
  selectedFile.value = null
}

function handleItemClick(item) {
  if (item.type === 'directory') {
    navigate(item.path)
  } else {
    selectedFile.value = item
  }
}

function isImage(name) {
  return /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(name)
}

function isPdf(name) {
  return /\.pdf$/i.test(name)
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
.explorer {
  display: flex;
  flex-direction: column;
  height: 100vh;
}
.header {
  background: #fff;
  border-bottom: 1px solid #e5e7eb;
  padding: 1rem 2rem;
}
.header h1 { margin: 0; font-size: 1.25rem; }
.main-content {
  display: flex;
  flex: 1;
  overflow: hidden;
}
.sidebar {
  width: 250px;
  background: #f3f4f6;
  border-right: 1px solid #e5e7eb;
  padding: 1rem;
  overflow-y: auto;
}
.tree-list { list-style: none; padding: 0; margin: 0; }
.tree-list li {
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 4px;
}
.tree-list li:hover { background: #e5e7eb; }
.tree-list li.active { background: #d1d5db; font-weight: bold; }

.content {
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
}
.breadcrumbs {
  margin-bottom: 2rem;
  font-size: 1.1rem;
}
.breadcrumbs span { cursor: pointer; color: #2563eb; }
.breadcrumbs span:hover { text-decoration: underline; }

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
}
.card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: shadow 0.2s;
}
.card:hover { box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
.card .icon { font-size: 2rem; }
.card .name { font-weight: 500; word-break: break-all; }
.card .meta { font-size: 0.8rem; color: #6b7280; margin-top: 0.25rem; }

.empty { color: #6b7280; font-style: italic; }

.file-view {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 2rem;
}
.actions {
  display: flex;
  justify-content: space-between;
  margin-bottom: 2rem;
}
button, .btn-download {
  padding: 0.5rem 1rem;
  background: #2563eb;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  text-decoration: none;
}
button:hover, .btn-download:hover { background: #1d4ed8; }

.preview-container {
  display: flex;
  gap: 2rem;
}
.preview-pane {
  flex: 2;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #f9fafb;
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}
.preview-pane img { max-width: 100%; max-height: 100%; object-fit: contain; }
.preview-pane iframe { width: 100%; height: 600px; }
.no-preview { color: #6b7280; }

.meta-pane {
  flex: 1;
  background: #f9fafb;
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}
.meta-item { margin-bottom: 0.5rem; }
</style>
