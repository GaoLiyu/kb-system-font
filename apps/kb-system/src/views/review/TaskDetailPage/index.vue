<template>
  <div v-loading="loading" class="task-detail-page">
    <div class="page-header">
      <el-button :icon="ArrowLeft" @click="router.back()">返回</el-button>
      <h3>审查详情</h3>
      <div v-if="task?.status === 'completed'" class="header-actions">
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
      <TaskInfoCard :task="task" />

      <!-- 错误信息 -->
      <el-alert
        v-if="task.status === 'failed'"
        :title="task.error || '审查失败'"
        type="error"
        style="margin-top: 16px"
        :closable="false"
      />

      <!-- 审查结果 - 左右布局 -->
      <div v-if="task.status === 'completed' && task.result" class="review-content">
        <!-- 左侧：原文预览 -->
        <DocumentPreview
          ref="documentPreviewRef"
          :content-items="contentItems"
          :active-index="activeContentIndex"
          @item-click="handleContentClick"
        />

        <!-- 右侧：问题列表 -->
        <IssueList
          ref="issueListRef"
          :validation-issues="validationIssues"
          :llm-issues="llmIssues"
          :abnormal-comparisons="abnormalComparisons"
          :active-index="activeIssueIndex"
          @issue-click="handleIssueClick"
        />
      </div>

      <!-- 公式校验 -->
      <FormulaCheckTable
        :formula-checks="task.result?.formula_checks || []"
        :report-type="task.result?.report_type"
      />

      <!-- 知识库对比异常 -->
      <ComparisonTable :comparisons="abnormalComparisons" />

      <!-- 相似案例参考 -->
      <SimilarCaseTable :cases="similarCases" />

      <!-- 审查建议 -->
      <RecommendationList :recommendations="recommendations" />
    </template>

    <el-empty v-else-if="!loading" description="任务不存在" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, Download } from '@element-plus/icons-vue'
import { getTaskStatus, exportTaskResult, downloadBlob } from '@/api'
import type { ReviewTask } from '@/types'
import { ElMessage } from 'element-plus'

import TaskInfoCard from './components/TaskInfoCard.vue'
import DocumentPreview from './components/DocumentPreview.vue'
import IssueList from './components/IssueList.vue'
import FormulaCheckTable from './components/FormulaCheckTable.vue'
import ComparisonTable from './components/ComparisonTable.vue'
import SimilarCaseTable from './components/SimilarCaseTable.vue'
import RecommendationList from './components/RecommendationList.vue'

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const task = ref<ReviewTask | null>(null)

// 当前激活的索引
const activeContentIndex = ref<number | null>(null)
const activeIssueIndex = ref<number | null>(null)

// 组件引用
const documentPreviewRef = ref<InstanceType<typeof DocumentPreview> | null>(null)
const issueListRef = ref<InstanceType<typeof IssueList> | null>(null)

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

const abnormalComparisons = computed(() => {
  return (task.value?.result?.comparisons || []).filter((item: any) => item.is_abnormal)
})

const similarCases = computed(() => {
  return task.value?.result?.similar_cases || []
})

const recommendations = computed(() => {
  return task.value?.result?.recommendations || []
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
    activeIssueIndex.value = issueIdx
    issueListRef.value?.scrollTo(issueIdx)
  }
}

// 点击问题
function handleIssueClick(issue: any, idx: number) {
  activeIssueIndex.value = idx

  // 跳转到关联的段落
  if (issue.paragraph_index !== undefined) {
    activeContentIndex.value = issue.paragraph_index
    documentPreviewRef.value?.scrollTo(issue.paragraph_index)
  }
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

/* 左右布局 */
.review-content {
  display: flex;
  gap: 16px;
  height: calc(100vh - 280px);
  min-height: 500px;
}
</style>
