<template>
  <el-card class="content-panel">
    <template #header>
      <div class="panel-header">
        <span>原文预览</span>
        <el-tag size="small">{{ contentItems.length }} 段</el-tag>
      </div>
    </template>
    <div ref="scrollRef" class="content-scroll">
      <div
        v-for="item in contentItems"
        :key="item.index"
        :ref="(el) => setItemRef(item.index, el)"
        :class="['content-item', { 'has-issue': item.has_issue }, { active: activeIndex === item.index }]"
        @click="handleClick(item)"
      >
        <span class="index">[{{ item.index }}]</span>
        <span class="text">{{ item.text }}</span>
        <el-tag v-if="item.issue_ids?.length" size="small" type="danger" class="issue-badge">
          {{ item.issue_ids.length }}
        </el-tag>
      </div>
      <el-empty v-if="contentItems.length === 0" description="无原文内容" />
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'

interface ContentItem {
  index: number
  text: string
  type: string
  has_issue?: boolean
  issue_ids?: number[]
}

defineProps<{
  contentItems: ContentItem[]
  activeIndex: number | null
}>()

const emit = defineEmits<{
  itemClick: [item: ContentItem]
}>()

const scrollRef = ref<HTMLElement | null>(null)
const itemRefs = ref<Record<number, HTMLElement | null>>({})

function setItemRef(index: number, el: any) {
  itemRefs.value[index] = el
}

function handleClick(item: ContentItem) {
  emit('itemClick', item)
}

function scrollTo(index: number) {
  nextTick(() => {
    const el = itemRefs.value[index]
    if (el && scrollRef.value) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  })
}

defineExpose({ scrollTo })
</script>

<style scoped>
.content-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.content-scroll {
  flex: 1;
  overflow-y: auto;
  padding-right: 8px;
}

.content-item {
  padding: 8px 12px;
  margin-bottom: 4px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
  line-height: 1.6;
  font-size: 13px;
}

.content-item:hover {
  background: #f5f7fa;
}

.content-item.has-issue {
  background: #fef0f0;
  border-left: 3px solid #f56c6c;
}

.content-item.active {
  background: #ecf5ff;
  border-left: 3px solid #409eff;
}

.content-item .index {
  color: #909399;
  margin-right: 8px;
  font-size: 12px;
}

.content-item .issue-badge {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
}

.content-scroll::-webkit-scrollbar {
  width: 6px;
}

.content-scroll::-webkit-scrollbar-thumb {
  background: #dcdfe6;
  border-radius: 3px;
}

.content-scroll::-webkit-scrollbar-thumb:hover {
  background: #c0c4cc;
}
</style>
