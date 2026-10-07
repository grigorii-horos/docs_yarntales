<template>
  <div v-if="node">
    <div 
      class="nav-item" 
      @click="$emit('navigate', node.path)"
      :class="{ active: currentPath === node.path }"
    >
      <span class="icon">{{ node.type === 'item' ? '📖' : '📁' }}</span> 
      <span class="name">{{ node.name }}</span>
    </div>
    <div v-if="node.children && node.children.length > 0" class="sub-tree">
      <TreeNode 
        v-for="child in node.children" 
        :key="child.path" 
        :node="child" 
        :currentPath="currentPath"
        @navigate="$emit('navigate', $event)"
      />
    </div>
  </div>
</template>

<script setup>
defineProps(['node', 'currentPath'])
defineEmits(['navigate'])
</script>

<script>
export default {
  name: 'TreeNode'
}
</script>

<style scoped>
.nav-item {
  padding: 0.6rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.8rem;
  color: #444;
  margin-bottom: 4px;
  transition: background 0.15s;
}
.nav-item:hover { background: #f0f0f0; }
.nav-item.active { background: #e0f0ff; color: #0070f3; font-weight: 500; }
.icon { font-size: 1.1rem; }
.name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 0.95rem; }
.sub-tree {
  padding-left: 1.2rem;
  margin-top: 4px;
  border-left: 1px solid #eaeaea;
  margin-left: 0.8rem;
}
</style>
