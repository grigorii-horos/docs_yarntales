<template>
  <div class="drive-app">
    <!-- Topbar -->
    <header class="topbar">
      <div class="logo">
        <svg viewBox="0 0 40 40" class="icon-logo"><path fill="#FFC107" d="M13.4 29.5L6.6 18h13.4l6.6 11.5z"/><path fill="#4CAF50" d="M26.8 29.5H13.4l-6.8-11.5h13.4z"/><path fill="#2196F3" d="M26.8 6.5L20 18l6.8 11.5L33.4 18z"/></svg>
        <span>Yarntales Drive</span>
      </div>
      <div class="search-bar">
        <input type="text" placeholder="Search in Drive (demo)" v-model="searchQuery" />
      </div>
      <div class="profile">
        <div class="avatar">U</div>
      </div>
    </header>
    
    <div class="main-layout">
      <!-- Left Sidebar -->
      <aside class="left-sidebar">
        <div class="nav-item active" @click="navigate('/')">
          <span class="icon">💾</span> My Drive
        </div>
        <div class="nav-tree">
           <tree-node 
            v-for="node in folderTree" 
            :key="node.path" 
            :node="node" 
            :currentPath="currentPath"
            @navigate="navigate"
          />
        </div>
      </aside>

      <!-- Main Content -->
      <main class="content-area">
        <div class="breadcrumbs">
          <span class="crumb" @click="navigate('/')">My Drive</span>
          <span v-for="(crumb, idx) in breadcrumbs" :key="idx">
             <span class="separator">›</span> 
             <span class="crumb" @click="navigate(crumb.path)">{{ crumb.name }}</span>
          </span>
        </div>

        <div class="scroll-area" @click="clearSelection">
          <!-- Folders -->
          <div v-if="folders.length > 0" class="section">
            <h3>Folders</h3>
            <div class="grid folders-grid">
              <div 
                class="folder-card" 
                v-for="folder in folders" 
                :key="folder.path"
                :class="{ selected: selectedItem === folder }"
                @click.stop="selectItem(folder)"
                @dblclick.stop="navigate(folder.path)"
              >
                <span class="icon">📁</span>
                <span class="name">{{ folder.name }}</span>
              </div>
            </div>
          </div>

          <!-- Files -->
          <div v-if="files.length > 0" class="section">
            <h3>Files</h3>
            <div class="grid files-grid">
              <div 
                class="file-card" 
                v-for="file in files" 
                :key="file.path"
                :class="{ selected: selectedItem === file }"
                @click.stop="selectItem(file)"
                @dblclick.stop="openPreview(file)"
              >
                <div class="thumbnail-wrapper">
                  <img v-if="file.preview" :src="file.preview" class="thumbnail" />
                  <span v-else class="file-icon">📄</span>
                </div>
                <div class="file-info">
                  <span class="icon">📄</span>
                  <span class="name">{{ file.name }}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div v-if="folders.length === 0 && files.length === 0" class="empty-state">
            This folder is empty.
          </div>
        </div>
      </main>

      <!-- Right Sidebar (Info/Meta) -->
      <aside class="right-sidebar" v-if="selectedItem">
        <div class="info-header">
          <h3>{{ selectedItem.type === 'directory' ? '📁' : '📄' }} {{ selectedItem.name }}</h3>
          <button @click="selectedItem = null" class="close-btn">✕</button>
        </div>
        <div class="info-content">
          <div class="info-preview" v-if="selectedItem.type === 'file'">
             <img v-if="selectedItem.preview" :src="selectedItem.preview" />
             <div v-else class="placeholder">No Preview</div>
          </div>
          
          <div class="meta-section">
            <h4>Properties</h4>
            <div class="meta-row"><span>Type</span> <span>{{ selectedItem.type }}</span></div>
            <div class="meta-row" v-if="selectedItem.type === 'file'"><span>Size</span> <span>{{ formatBytes(selectedItem.size) }}</span></div>
            <div class="meta-row"><span>Modified</span> <span>{{ new Date(selectedItem.updatedAt).toLocaleDateString() }}</span></div>
          </div>

          <div class="meta-section" v-if="selectedItem.meta">
            <h4>Metadata</h4>
            <div class="meta-row" v-for="(val, key) in selectedItem.meta" :key="key">
              <span>{{ key }}</span> <span>{{ val }}</span>
            </div>
          </div>

          <div class="actions" v-if="selectedItem.type === 'file'">
             <a :href="selectedItem.path" download class="btn primary">Download</a>
             <button @click="openPreview(selectedItem)" class="btn">Open Preview</button>
          </div>
        </div>
      </aside>
    </div>

    <!-- Fullscreen Preview Modal -->
    <div class="modal-overlay" v-if="previewItem" @click="previewItem = null">
      <div class="modal-content" @click.stop>
        <header class="modal-header">
          <div class="modal-title">📄 {{ previewItem.name }}</div>
          <div class="modal-actions">
            <a :href="previewItem.path" download class="btn primary">Download</a>
            <button @click="previewItem = null" class="close-btn">✕</button>
          </div>
        </header>
        <div class="modal-body">
          <img v-if="previewItem.preview" :src="previewItem.preview" />
          <img v-else-if="isImage(previewItem.name)" :src="previewItem.path" />
          <iframe v-else-if="isPdf(previewItem.name)" :src="previewItem.path"></iframe>
          <div v-else class="no-preview">Preview not available</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import TreeNode from './components/TreeNode.vue'

const tree = ref([])
const currentPath = ref('/')
const selectedItem = ref(null)
const previewItem = ref(null)
const searchQuery = ref('')

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
  let items = []
  if (currentPath.value === '/') {
    items = tree.value
  } else {
    const folder = findNode(tree.value, currentPath.value)
    items = folder && folder.children ? folder.children : []
  }
  
  if (searchQuery.value) {
    // Simple flat search for demo
    const query = searchQuery.value.toLowerCase()
    return items.filter(i => i.name.toLowerCase().includes(query))
  }
  return items
})

const folders = computed(() => currentFolderContents.value.filter(i => i.type === 'directory'))
const files = computed(() => currentFolderContents.value.filter(i => i.type === 'file'))
const folderTree = computed(() => tree.value.filter(i => i.type === 'directory'))

const breadcrumbs = computed(() => {
  if (currentPath.value === '/') return []
  const parts = currentPath.value.replace('/data/', '').split('/').filter(Boolean)
  let acc = '/data'
  return parts.map(p => {
    acc += '/' + p
    return { name: p, path: acc }
  })
})

function navigate(path) {
  currentPath.value = path
  selectedItem.value = null
  searchQuery.value = ''
}

function selectItem(item) {
  selectedItem.value = item
}

function clearSelection() {
  selectedItem.value = null
}

function openPreview(file) {
  previewItem.value = file
}

function isImage(name) { return /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(name) }
function isPdf(name) { return /\.pdf$/i.test(name) }
function formatBytes(bytes) {
  if (!bytes) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
</script>

<style scoped>
.drive-app {
  display: flex;
  flex-direction: column;
  height: 100vh;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #202124;
  background: #fff;
  overflow: hidden;
}

/* Topbar */
.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 1.5rem;
  border-bottom: 1px solid #dadce0;
  height: 64px;
}
.logo { display: flex; align-items: center; gap: 0.5rem; font-size: 1.2rem; color: #5f6368; }
.icon-logo { width: 32px; height: 32px; }
.search-bar input {
  width: 500px;
  padding: 0.8rem 1rem;
  border-radius: 8px;
  border: none;
  background: #f1f3f4;
  font-size: 1rem;
}
.search-bar input:focus { background: #fff; box-shadow: 0 1px 1px 0 rgba(65,69,73,0.3), 0 1px 3px 1px rgba(65,69,73,0.15); outline: none; }
.profile .avatar { width: 32px; height: 32px; background: #1a73e8; color: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; }

/* Main Layout */
.main-layout { display: flex; flex: 1; overflow: hidden; }

/* Left Sidebar */
.left-sidebar {
  width: 250px;
  padding: 1rem 0;
  display: flex;
  flex-direction: column;
}
.nav-item {
  padding: 0.5rem 1.5rem;
  border-radius: 0 16px 16px 0;
  margin-right: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 1rem;
  color: #3c4043;
}
.nav-item:hover { background: #f1f3f4; }
.nav-item.active { background: #e8f0fe; color: #1a73e8; }
.nav-tree { padding-left: 1.5rem; margin-top: 1rem; overflow-y: auto; }

/* Content Area */
.content-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: 16px 16px 0 0;
  margin-top: 1rem;
  overflow: hidden;
}
.breadcrumbs { padding: 1rem 2rem; font-size: 1.1rem; color: #5f6368; border-bottom: 1px solid #f1f3f4; }
.crumb { cursor: pointer; padding: 0.2rem 0.5rem; border-radius: 4px; }
.crumb:hover { background: #f1f3f4; }
.separator { margin: 0 0.2rem; }

.scroll-area { flex: 1; padding: 1rem 2rem; overflow-y: auto; }
.section h3 { font-size: 0.9rem; font-weight: 500; color: #5f6368; margin-bottom: 1rem; }
.grid { display: grid; gap: 1rem; margin-bottom: 2rem; }

/* Folders */
.folders-grid { grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); }
.folder-card {
  display: flex; align-items: center; gap: 0.8rem;
  padding: 0.8rem 1rem; border: 1px solid #dadce0; border-radius: 6px; cursor: pointer;
  user-select: none;
}
.folder-card:hover { background: #f8f9fa; }
.folder-card.selected { background: #e8f0fe; border-color: #1a73e8; }
.folder-card .icon { color: #5f6368; }
.folder-card .name { font-weight: 500; font-size: 0.9rem; color: #3c4043; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

/* Files */
.files-grid { grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); }
.file-card {
  border: 1px solid #dadce0; border-radius: 6px; cursor: pointer;
  display: flex; flex-direction: column; overflow: hidden;
  user-select: none;
}
.file-card:hover { background: #f8f9fa; }
.file-card.selected { background: #e8f0fe; border-color: #1a73e8; }
.thumbnail-wrapper { height: 140px; background: #f1f3f4; display: flex; align-items: center; justify-content: center; border-bottom: 1px solid #dadce0; }
.thumbnail { width: 100%; height: 100%; object-fit: cover; }
.file-icon { font-size: 3rem; }
.file-info { padding: 0.8rem; display: flex; align-items: center; gap: 0.8rem; }
.file-info .name { font-weight: 500; font-size: 0.9rem; color: #3c4043; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

/* Right Sidebar */
.right-sidebar {
  width: 300px; border-left: 1px solid #dadce0; background: #fff;
  display: flex; flex-direction: column;
}
.info-header { display: flex; justify-content: space-between; align-items: center; padding: 1rem; border-bottom: 1px solid #dadce0; }
.info-header h3 { margin: 0; font-size: 1rem; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.close-btn { background: none; border: none; font-size: 1.2rem; cursor: pointer; color: #5f6368; }
.info-content { padding: 1rem; overflow-y: auto; }
.info-preview { margin-bottom: 1.5rem; border-radius: 8px; overflow: hidden; border: 1px solid #dadce0; background: #f1f3f4; height: 150px; display: flex; align-items: center; justify-content: center; }
.info-preview img { max-width: 100%; max-height: 100%; object-fit: contain; }
.meta-section { margin-bottom: 1.5rem; }
.meta-section h4 { font-size: 0.9rem; margin: 0 0 0.5rem 0; color: #5f6368; }
.meta-row { display: flex; justify-content: space-between; font-size: 0.85rem; padding: 0.3rem 0; border-bottom: 1px solid #f1f3f4; }
.meta-row span:first-child { color: #5f6368; }
.meta-row span:last-child { color: #202124; font-weight: 500; text-align: right; max-width: 60%; word-break: break-all; }
.actions { display: flex; flex-direction: column; gap: 0.5rem; }
.btn { padding: 0.6rem; border-radius: 4px; border: 1px solid #dadce0; background: #fff; cursor: pointer; text-align: center; text-decoration: none; color: #3c4043; font-weight: 500; }
.btn:hover { background: #f1f3f4; }
.btn.primary { background: #1a73e8; color: #fff; border: none; }
.btn.primary:hover { background: #1765cc; }

/* Modal */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.8); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.modal-content { background: #fff; width: 90%; max-width: 1000px; height: 90vh; border-radius: 8px; display: flex; flex-direction: column; overflow: hidden; }
.modal-header { display: flex; justify-content: space-between; align-items: center; padding: 1rem; background: #202124; color: #fff; }
.modal-title { font-size: 1.1rem; font-weight: 500; }
.modal-actions { display: flex; align-items: center; gap: 1rem; }
.modal-actions .close-btn { color: #fff; }
.modal-body { flex: 1; background: #f1f3f4; display: flex; align-items: center; justify-content: center; overflow: hidden; padding: 1rem; }
.modal-body img { max-width: 100%; max-height: 100%; object-fit: contain; }
.modal-body iframe { width: 100%; height: 100%; border: none; }
.no-preview { color: #5f6368; font-size: 1.2rem; }
</style>
