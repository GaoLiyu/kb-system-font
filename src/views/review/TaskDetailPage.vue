<template>
  <div class="task-detail-page" v-loading="loading">
    <div class="page-header">
      <el-button @click="router.back()" :icon="ArrowLeft">返回</el-button>
      <h3>审查详情</h3>
      <div class="header-actions" v-if="task?.status === 'completed'">
        <el-dropdown @command="handleExport">
          <el-button type="success">
            <el-icon><Download /></el-icon>
            导出报告
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="simple">审查意见</el-dropdown-item>
              <el-dropdown-item command="full">含原文标注</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>

    <template v-if="task">
      <!-- 基本信息 -->
      <el-card class="info-card">
        <el-descriptions :column="4" border size="small">
          <el-descriptions-item label="文件名">{{ task.filename }}</el-descriptions-item>
          <el-descriptions-item label="审查模式">
            <el-tag :type="task.review_mode === 'full' ? 'primary' : 'info'" size="small">
              {{ task.review_mode === 'full' ? '完整' : '快速' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="statusTagType(task.status)" size="small">
              {{ statusText(task.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="风险等级">
            <el-tag v-if="task.overall_risk" :type="riskTagType(task.overall_risk)">
              {{ task.overall_risk }}
            </el-tag>
            <span v-else>-</span>
          </el-descriptions-item>
          <el-descriptions-item label="校验问题">{{ task.validation_count || 0 }}</el-descriptions-item>
          <el-descriptions-item label="语义问题">{{ task.llm_count || 0 }}</el-descriptions-item>
          <el-descriptions-item label="耗时">{{ calcDuration() }}</el-descriptions-item>
          <el-descriptions-item label="提交时间">{{ formatTime(task.create_time) }}</el-descriptions-item>
        </el-descriptions>
      </el-card>

      <!-- 错误信息 -->
      <el-alert
        v-if="task.status === 'failed'"
        :title="task.error || '审查失败'"
        type="error"
        style="margin-top: 16px;"
        :closable="false"
      />

      <!-- 审查结果 - 左右布局 -->
      <div v-if="task.status === 'completed' && task.result" class="review-content">
        <!-- 左侧：原文预览 -->
        <el-card class="content-panel">
          <template #header>
            <div class="panel-header">
              <span>原文预览</span>
              <el-tag size="small">{{ contentItems.length }} 段</el-tag>
            </div>
          </template>
          <div class="content-scroll" ref="contentScrollRef">
            <div
              v-for="item in contentItems"
              :key="item.index"
              :ref="el => setContentRef(item.index, el)"
              :class="[
                'content-item',
                { 'has-issue': item.has_issue },
                { 'active': activeContentIndex === item.index }
              ]"
              @click="handleContentClick(item)"
            >
              <span class="index">[{{ item.index }}]</span>
              <span class="text">{{ item.text }}</span>
              <el-tag
                v-if="item.issue_ids?.length"
                size="small"
                type="danger"
                class="issue-badge"
              >
                {{ item.issue_ids.length }}
              </el-tag>
            </div>
            <el-empty v-if="contentItems.length === 0" description="无原文内容" />
          </div>
        </el-card>

        <!-- 右侧：问题列表 -->
        <el-card class="issues-panel">
          <template #header>
            <div class="panel-header">
              <span>问题列表</span>
              <el-tag size="small" type="danger">{{ allIssues.length }} 个问题</el-tag>
            </div>
          </template>

          <!-- 问题分类标签 -->
          <div class="issue-tabs">
            <el-radio-group v-model="issueTab" size="small">
              <el-radio-button value="all">
                全部 ({{ allIssues.length }})
              </el-radio-button>
              <el-radio-button value="validation">
                校验 ({{ validationIssues.length }})
              </el-radio-button>
              <el-radio-button value="llm">
                语义 ({{ llmIssues.length }})
              </el-radio-button>
            </el-radio-group>
          </div>

          <div class="issues-scroll" ref="issuesScrollRef">
            <div
              v-for="(issue, idx) in filteredIssues"
              :key="idx"
              :ref="el => setIssueRef(idx, el)"
              :class="[
                'issue-item',
                { 'active': activeIssueIndex === idx }
              ]"
              @click="handleIssueClick(issue, idx)"
            >
              <div class="issue-header">
                <el-tag
                  :type="getIssueSeverityType(issue)"
                  size="small"
                >
                  {{ getIssueSeverityText(issue) }}
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
      </div>

      <!-- 公式校验（如果有） -->
      <el-card v-if="task.result?.formula_checks?.length" style="margin-top: 16px;">
        <template #header>
          <span>公式校验</span>
        </template>
        <el-table :data="task.result.formula_checks" size="small" max-height="200">
          <el-table-column prop="case_id" label="案例" width="100" />
          <el-table-column prop="expected" label="预期值" width="120">
            <template #default="{ row }">{{ row.expected?.toFixed(2) }}</template>
          </el-table-column>
          <el-table-column prop="actual" label="实际值" width="120">
            <template #default="{ row }">{{ row.actual?.toFixed(2) }}</template>
          </el-table-column>
          <el-table-column prop="is_valid" label="结果" width="80">
            <template #default="{ row }">
              <el-tag :type="row.is_valid ? 'success' : 'danger'" size="small">
                {{ row.is_valid ? '通过' : '异常' }}
              </el-tag>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </template>

    <el-empty v-else-if="!loading" description="任务不存在" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, Download, ChatLineRound, Sunny } from '@element-plus/icons-vue'
import { getTaskStatus, exportTaskResult, downloadBlob } from '@/api'
import type { ReviewTask } from '@/types'
import { ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const task = ref<ReviewTask | null>(null)

// 当前激活的索引
const activeContentIndex = ref<number | null>(null)
const activeIssueIndex = ref<number | null>(null)

// 问题分类标签
const issueTab = ref('all')

// refs
const contentScrollRef = ref<HTMLElement | null>(null)
const issuesScrollRef = ref<HTMLElement | null>(null)
const contentRefs = ref<Record<number, HTMLElement | null>>({})
const issueRefs = ref<Record<number, HTMLElement | null>>({})

function setContentRef(index: number, el: any) {
  contentRefs.value[index] = el
}

function setIssueRef(index: number, el: any) {
  issueRefs.value[index] = el
}

// 计算属性
const contentItems = computed(() => {
  if (!task.value?.result?.document_content?.contents) return []
  return task.value.result.document_content.contents.filter(
    (item: any) => item.type === 'paragraph' && item.text
  )
})

const validationIssues = computed(() => {
  return (task.value?.result?.validation_issues || []).map((issue: any, idx: number) => ({
    ...issue,
    _type: 'validation',
    _idx: idx,
  }))
})

const llmIssues = computed(() => {
  return (task.value?.result?.llm_issues || []).map((issue: any, idx: number) => ({
    ...issue,
    _type: 'llm',
    _idx: idx,
  }))
})

const allIssues = computed(() => {
  return [...validationIssues.value, ...llmIssues.value]
})

const filteredIssues = computed(() => {
  if (issueTab.value === 'validation') return validationIssues.value
  if (issueTab.value === 'llm') return llmIssues.value
  return allIssues.value
})

// 加载任务
async function loadTask() {
  const taskId = route.params.taskId as string
  if (!taskId) return

  loading.value = true
  try {
    const res = await getTaskStatus(taskId)
    task.value = res
  } catch (error: any) {
    ElMessage.error(error.message || '加载失败')
  } finally {
    loading.value = false
  }
}

// 点击原文
function handleContentClick(item: any) {
  activeContentIndex.value = item.index

  // 查找关联的问题
  if (item.issue_ids?.length) {
    const issueIdx = item.issue_ids[0]
    scrollToIssue(issueIdx)
  }
}

// 点击问题
function handleIssueClick(issue: any, idx: number) {
  activeIssueIndex.value = idx

  // 跳转到关联的段落
  if (issue.paragraph_index !== undefined) {
    scrollToContent(issue.paragraph_index)
  }
}

// 滚动到指定原文
function scrollToContent(index: number) {
  activeContentIndex.value = index
  nextTick(() => {
    const el = contentRefs.value[index]
    if (el && contentScrollRef.value) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  })
}

// 滚动到指定问题
function scrollToIssue(idx: number) {
  activeIssueIndex.value = idx
  nextTick(() => {
    const el = issueRefs.value[idx]
    if (el && issuesScrollRef.value) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  })
}

// 导出
async function handleExport(command: string) {
  if (!task.value) return

  try {
    ElMessage.info('正在生成报告...')
    const includeOriginal = command === 'full'
    const blob = await exportTaskResult(task.value.task_id, includeOriginal)

    const filename = task.value.filename.replace(/\.[^/.]+$/, '') + '_审查报告.docx'
    downloadBlob(blob, filename)

    ElMessage.success('导出成功')
  } catch (error: any) {
    ElMessage.error(error.message || '导出失败')
  }
}

// 工具函数
function statusTagType(status: string) {
  const map: Record<string, string> = { pending: 'info', running: 'warning', completed: 'success', failed: 'danger' }
  return map[status] || 'info'
}

function statusText(status: string) {
  const map: Record<string, string> = { pending: '待处理', running: '处理中', completed: '已完成', failed: '失败' }
  return map[status] || status
}

function riskTagType(risk: string) {
  if (risk === '高风险') return 'danger'
  if (risk === '中风险') return 'warning'
  return 'success'
}

function getIssueSeverityType(issue: any) {
  if (issue._type === 'validation') {
    return issue.level === 'error' ? 'danger' : 'warning'
  }
  if (issue.severity === 'critical') return 'danger'
  if (issue.severity === 'major') return 'warning'
  return 'info'
}

function getIssueSeverityText(issue: any) {
  if (issue._type === 'validation') {
    return issue.level === 'error' ? '错误' : '警告'
  }
  const map: Record<string, string> = { critical: '严重', major: '重要', minor: '轻微' }
  return map[issue.severity] || issue.severity || '未知'
}

function formatTime(time?: string) {
  if (!time) return '-'
  return time.replace('T', ' ').slice(0, 19)
}

function calcDuration() {
  if (!task.value?.start_time || !task.value?.end_time) return '-'
  const start = new Date(task.value.start_time).getTime()
  const end = new Date(task.value.end_time).getTime()
  const seconds = Math.round((end - start) / 1000)
  return seconds < 60 ? `${seconds}秒` : `${Math.floor(seconds / 60)}分${seconds % 60}秒`
}

onMounted(() => {
  loadTask()
})
</script>

<style scoped>
.task-detail-page {
  padding: 20px;
}

.page-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
}

.page-header h3 {
  margin: 0;
  flex: 1;
}

.info-card {
  margin-bottom: 16px;
}

/* 左右布局 */
.review-content {
  display: flex;
  gap: 16px;
  height: calc(100vh - 280px);
  min-height: 500px;
}

.content-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
}

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

/* 滚动区域 */
.content-scroll,
.issues-scroll {
  flex: 1;
  overflow-y: auto;
  padding-right: 8px;
}

/* 原文项 */
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

/* 问题项 */
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

/* 滚动条美化 */
.content-scroll::-webkit-scrollbar,
.issues-scroll::-webkit-scrollbar {
  width: 6px;
}

.content-scroll::-webkit-scrollbar-thumb,
.issues-scroll::-webkit-scrollbar-thumb {
  background: #dcdfe6;
  border-radius: 3px;
}

.content-scroll::-webkit-scrollbar-thumb:hover,
.issues-scroll::-webkit-scrollbar-thumb:hover {
  background: #c0c4cc;
}
</style>