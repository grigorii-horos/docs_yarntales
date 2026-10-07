<template>
  <div>
    <div 
      class="nav-item" 
      @click="$emit('navigate', node.path)"
      :class="{ active: currentPath === node.path }"
    >
      <span class="icon">📁</span> <span class="name">{{ node.name }}</span>
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
  padding: 0.5rem 1.5rem 0.5rem 0.5rem;
  border-radius: 0 16px 16px 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #3c4043;
  margin-bottom: 2px;
}
.nav-item:hover { background: #f1f3f4; }
.nav-item.active { background: #e8f0fe; color: #1a73e8; }
.name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.sub-tree {
  padding-left: 1rem;
}
</style>
