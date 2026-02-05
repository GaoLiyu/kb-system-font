<template>
  <el-card class="issues-panel">
    <template #header>
      <div class="panel-header">
        <span>问题列表</span>
        <el-tag size="small" type="danger">{{ allIssues.length }} 个问题</el-tag>
      </div>
    </template>

    <!-- 问题分类标签 -->
    <div class="issue-tabs">
      <el-radio-group v-model="activeTab" size="small">
        <el-radio-button value="all"> 全部 ({{ allIssues.length }}) </el-radio-button>
        <el-radio-button value="validation"> 校验 ({{ validationIssues.length }}) </el-radio-button>
        <el-radio-button value="llm"> 语义 ({{ llmIssues.length }}) </el-radio-button>
        <el-radio-button v-if="abnormalComparisons.length > 0" value="comparison">
          知识库 ({{ abnormalComparisons.length }})
        </el-radio-button>
      </el-radio-group>
    </div>

    <div ref="scrollRef" class="issues-scroll">
      <div
        v-for="(issue, idx) in filteredIssues"
        :key="idx"
        :ref="(el) => setIssueRef(idx, el)"
        :class="['issue-item', { active: activeIndex === idx }]"
        @click="handleClick(issue, idx)"
      >
        <div class="issue-header">
          <el-tag :type="getSeverityType(issue)" size="small">
            {{ getSeverityText(issue) }}
          </el-tag>
          <el-tag size="small" plain>{{ issue.category || issue.type || '未分类' }}</el-tag>
          <span v-if="issue.paragraph_index !== undefined" class="para-link">
            段落 [{{ issue.paragraph_index }}]
          </span>
        </div>
        <div class="issue-desc">{{ issue.description }}</div>
        <div v-if="issue.span" class="issue-span">
          <el-icon><ChatLineRound /></el-icon>
          {{ issue.span }}
        </div>
        <div v-if="issue.suggestion" class="issue-suggestion">
          <el-icon><Sunny /></el-icon>
          {{ issue.suggestion }}
        </div>
      </div>
      <el-empty v-if="filteredIssues.length === 0" description="无问题" />
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import { ChatLineRound, Sunny } from '@element-plus/icons-vue'
import { ISSUE_SEVERITY_TEXT, ISSUE_SEVERITY_TYPE } from "@/config";

interface Issue {
  _type?: string
  _idx?: number
  level?: string
  severity?: string
  category?: string
  type?: string
  description: string
  span?: string
  suggestion?: string
  paragraph_index?: number
}

const props = defineProps<{
  validationIssues: Issue[]
  llmIssues: Issue[]
  abnormalComparisons: any[]
  activeIndex: number | null
}>()

const emit = defineEmits<{
  issueClick: [issue: Issue, index: number]
}>()

const activeTab = ref('all')
const scrollRef = ref<HTMLElement | null>(null)
const issueRefs = ref<Record<number, HTMLElement | null>>({})

const allIssues = computed(() => [...props.validationIssues, ...props.llmIssues])

const filteredIssues = computed(() => {
  if (activeTab.value === 'validation') return props.validationIssues
  if (activeTab.value === 'llm') return props.llmIssues
  if (activeTab.value === 'comparison') {
    return props.abnormalComparisons.map((item: any, idx: number) => ({
      _type: 'comparison',
      _idx: idx,
      level: 'warning',
      category: 'kb_comparison',
      type: '知识库对比',
      severity: 'warning',
      description:
        item.description ||
        `${item.item}: ${item.current_value}，知识库范围${item.kb_min?.toFixed(2)} ~ ${item.kb_max?.toFixed(2)}`,
    }))
  }
  return allIssues.value
})

function setIssueRef(index: number, el: any) {
  issueRefs.value[index] = el
}

function handleClick(issue: Issue, idx: number) {
  emit('issueClick', issue, idx)
}

function getSeverityType(issue: Issue) {
  if (issue._type === 'validation') {
    return issue.level === 'error' ? 'danger' : 'warning'
  }
  return ISSUE_SEVERITY_TYPE[issue.severity || ''] || 'info'
}

function getSeverityText(issue: Issue) {
  if (issue._type === 'validation') {
    return issue.level === 'error' ? '错误' : '警告'
  }
  return ISSUE_SEVERITY_TEXT[issue.severity || ''] || issue.severity || '未知'
}

function scrollTo(idx: number) {
  nextTick(() => {
    const el = issueRefs.value[idx]
    if (el && scrollRef.value) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  })
}

defineExpose({ scrollTo })
</script>

<style scoped>
.issues-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.issue-tabs {
  margin-bottom: 12px;
}

.issues-scroll {
  flex: 1;
  overflow-y: auto;
  padding-right: 8px;
}

.issue-item {
  padding: 12px;
  margin-bottom: 8px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.issue-item:hover {
  border-color: #409eff;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.1);
}

.issue-item.active {
  border-color: #409eff;
  background: #ecf5ff;
}

.issue-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.issue-header .para-link {
  margin-left: auto;
  font-size: 12px;
  color: #409eff;
}

.issue-desc {
  font-size: 13px;
  color: #303133;
  line-height: 1.5;
}

.issue-span {
  margin-top: 8px;
  padding: 8px;
  background: #f5f7fa;
  border-radius: 4px;
  font-size: 12px;
  color: #606266;
  display: flex;
  align-items: flex-start;
  gap: 4px;
}

.issue-suggestion {
  margin-top: 8px;
  font-size: 12px;
  color: #67c23a;
  display: flex;
  align-items: flex-start;
  gap: 4px;
}

.issues-scroll::-webkit-scrollbar {
  width: 6px;
}

.issues-scroll::-webkit-scrollbar-thumb {
  background: #dcdfe6;
  border-radius: 3px;
}

.issues-scroll::-webkit-scrollbar-thumb:hover {
  background: #c0c4cc;
}
</style>
