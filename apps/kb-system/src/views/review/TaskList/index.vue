<template>
  <div class="task-list-page">
    <el-row :gutter="20">
      <!-- 左侧：提交任务 -->
      <el-col :span="8">
        <UploadCard
          :file-list="fileList"
          :submitting="submitLoading.loading"
          @update:file-list="fileList = $event"
          @submit="handleSubmit"
        />

        <TaskStatsCard :stats="stats" />
      </el-col>

      <!-- 右侧：任务列表 -->
      <el-col :span="16">
        <TaskTable
          :tasks="table.list"
          :loading="table.loading"
          :filter-status="filterStatus"
          v-model:page="table.pagination.page"
          v-model:page-size="table.pagination.pageSize"
          :total="table.pagination.total"
          @filter-change="handleFilterChange"
          @refresh="table.fetch(buildQueryParams())"
          @view="goToTaskDetail"
          @export="handleExport"
          @delete="handleDelete"
          @page-change="table.fetch(buildQueryParams())"
        />
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'

import {
  submitReviewTask,
  submitBatchReviewTasks,
  getReviewTasks,
  deleteReviewTask,
  exportTaskResult,
  downloadBlob,
} from '@/api'
import type { ReviewTask } from '@/types'

import UploadCard from './components/UploadCard.vue'
import TaskStatsCard from './components/TaskStatsCard.vue'
import TaskTable from './components/TaskTable.vue'

import { useTable } from '@/composables/useTable'
import { useLoading } from '@/composables/useLoading'

const router = useRouter()

// 上传文件列表
const fileList = ref<any[]>([])

// 审查模式（你现在页面里没地方切换，就先保留 full）
const reviewMode = ref<'full' | 'quick'>('full')

// 筛选状态
const filterStatus = ref('')

// stats（从列表接口返回）
const stats = ref<any>({})

// 提交 loading
const submitLoading = useLoading(false)

// 列表：useTable
const table = useTable<ReviewTask>({
  defaultPageSize: 20,
  fetchFn: async (params) => {
    /**
     * 你的原接口是：getReviewTasks(status, limit, offset)
     * useTable 给的是：{ page, page_size, ...extra }
     */
    const status = params.status || undefined
    const limit = params.page_size
    const offset = (params.page - 1) * params.page_size

    const res = await getReviewTasks(status, limit, offset)

    // 统计从 res.stats 来
    stats.value = res.data.stats || {}

    // total：优先 stats.total，没有就 fallback
    const total = res.data.stats?.total ?? res.data.tasks?.length ?? 0

    return {
      items: res.data.tasks || [],
      total,
    }
  },
})

function buildQueryParams() {
  return {
    status: filterStatus.value || '',
  }
}

// 是否有活动任务（需要轮询）
const hasActiveTask = computed(() => {
  return table.list.value.some((t) => t.status === 'pending' || t.status === 'running')
})

// 提交任务
async function handleSubmit() {
  if (fileList.value.length === 0) {
    ElMessage.warning('请先选择文件')
    return
  }

  await submitLoading.withLoading(async () => {
    try {
      const files = fileList.value.map((f) => f.raw)

      if (files.length === 1) {
        await submitReviewTask(files[0], reviewMode.value)
        ElMessage.success('任务已提交')
      } else {
        const res = await submitBatchReviewTasks(files, reviewMode.value)
        ElMessage.success(`已提交 ${res.count} 个任务`)
      }

      fileList.value = []
      table.pagination.reset()
      await table.fetch(buildQueryParams())
    } catch (error: any) {
      ElMessage.error(error?.message || '提交失败')
      throw error
    }
  })
}

// 筛选变更
function handleFilterChange(status: string) {
  filterStatus.value = status
  table.pagination.reset()
  table.fetch(buildQueryParams())
}

// 跳转任务详情
function goToTaskDetail(task: ReviewTask) {
  router.push(`/review/tasks/${task.task_id}`)
}

// 导出
async function handleExport(task: ReviewTask, command: string) {
  try {
    ElMessage.info('正在生成报告...')
    const includeOriginal = command === 'full'
    const blob = await exportTaskResult(task.task_id, includeOriginal)
    const filename = task.filename.replace(/\.[^/.]+$/, '') + '_审查报告.docx'
    downloadBlob(blob, filename)
    ElMessage.success('导出成功')
  } catch (error: any) {
    ElMessage.error(error?.message || '导出失败')
  }
}

// 删除
async function handleDelete(task: ReviewTask) {
  try {
    await ElMessageBox.confirm(`确定要删除任务 "${task.filename}" 吗？`, '确认删除', {
      type: 'warning',
      confirmButtonText: '确定',
      cancelButtonText: '取消',
    })
  } catch {
    return
  }

  await submitLoading.withLoading(async () => {
    try {
      await deleteReviewTask(task.task_id)
      ElMessage.success('删除成功')
      await table.fetch(buildQueryParams())
    } catch (error: any) {
      ElMessage.error(error?.message || '删除失败')
      throw error
    }
  })
}

// 轮询
let pollTimer: number | null = null

function startPolling() {
  pollTimer = window.setInterval(() => {
    if (hasActiveTask.value) {
      table.fetch(buildQueryParams())
    }
  }, 3000)
}

function stopPolling() {
  if (pollTimer) {
    clearInterval(pollTimer)
    pollTimer = null
  }
}

onMounted(() => {
  table.fetch(buildQueryParams())
  startPolling()
})

onUnmounted(() => {
  stopPolling()
})
</script>

<style scoped>
.task-list-page {
  padding: 20px;
  min-height: calc(100vh - 82px);
}
</style>
