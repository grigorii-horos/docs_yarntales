<template>
  <li v-if="node.type === 'directory'">
    <div 
      class="folder-label" 
      @click="$emit('navigate', node.path)"
      :class="{ active: currentPath === node.path }"
    >
      <span class="icon">📁</span> {{ node.name }}
    </div>
    <ul v-if="node.children && node.children.length > 0" class="sub-tree">
      <TreeNode 
        v-for="child in node.children" 
        :key="child.path" 
        :node="child" 
        :currentPath="currentPath"
        @navigate="$emit('navigate', $event)"
      />
    </ul>
  </li>
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
.folder-label {
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.folder-label:hover { background: #e5e7eb; }
.folder-label.active { background: #d1d5db; font-weight: bold; }
.sub-tree {
  list-style: none;
  padding-left: 1.5rem;
  margin: 0;
}
</style>
