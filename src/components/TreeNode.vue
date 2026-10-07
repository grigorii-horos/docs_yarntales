<template>
  <div v-if="node">
    <div 
      class="nav-item" 
      @click="$emit('navigate', node.path)"
      :class="{ active: currentPath === node.path }"
    >
      <img v-if="displayPreview" :src="displayPreview" class="node-preview" />
      <span v-else class="icon">{{ displayIcon }}</span> 
      <span class="name">{{ displayName }}</span>
    </div>
    <div v-if="node.children && node.children.length > 0" class="sub-tree">
      <TreeNode 
        v-for="child in node.children" 
        :key="child.path" 
        :node="child" 
        :currentPath="currentPath"
        :currentLang="currentLang"
        @navigate="$emit('navigate', $event)"
      />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps(['node', 'currentPath', 'currentLang'])
defineEmits(['navigate'])

const contentObj = computed(() => {
  if (!props.node || !props.node.content) return null;
  return props.node.content[props.currentLang] || props.node.content['default'] || Object.values(props.node.content)[0];
})

const displayName = computed(() => {
  if (contentObj.value && contentObj.value.title) return contentObj.value.title;
  return props.node.name;
})

const displayPreview = computed(() => {
  if (contentObj.value && contentObj.value.preview) {
    return props.node.path + '/' + contentObj.value.preview;
  }
  return null;
})

const displayIcon = computed(() => {
  if (contentObj.value && contentObj.value.icon) return contentObj.value.icon;
  return props.node.type === 'item' ? '📖' : '📁';
})
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
.icon { font-size: 1.1rem; display: inline-flex; align-items: center; justify-content: center; width: 24px; }
.node-preview { width: 24px; height: 24px; object-fit: cover; border-radius: 4px; }
.name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 0.95rem; flex: 1; }
.sub-tree {
  padding-left: 1.2rem;
  margin-top: 4px;
  border-left: 1px solid #eaeaea;
  margin-left: 0.8rem;
}
</style>
