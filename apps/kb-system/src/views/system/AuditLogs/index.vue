<template>
  <div class="audit-logs">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>操作日志</h2>
      <p class="subtitle">查看系统操作记录和审计信息</p>
    </div>

    <!-- 统计卡片 -->
    <StatsCards :stats="stats" />

    <!-- 筛选条件 -->
    <LogFilterForm :filters="filters" @search="onSearch" @reset="onReset" />

    <!-- 日志列表 -->
    <LogTable
      v-model:page="table.pagination.page"
      v-model:page-size="table.pagination.pageSize"
      :logs="table.list"
      :loading="table.loading"
      :total="table.pagination.total"
      @row-click="onRowClick"
      @page-change="table.fetch()"
    />

    <!-- 详情弹窗 -->
    <LogDetailDialog v-model:visible="dialog.visible" :log="dialog.data" />
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus'
import api from '@/api/request'

import StatsCards from './components/StatsCards.vue'
import LogFilterForm from './components/LogFilterForm.vue'
import LogTable from './components/LogTable.vue'
import LogDetailDialog from './components/LogDetailDialog.vue'

import { useDialog } from '@/composables/useDialog'
import { useTable } from '@/composables/useTable'
import { useLoading } from '@/composables/useLoading'

type AuditLog = {
  id?: string | number
  created_at?: string
  username?: string
  user_id?: string | number
  action?: string
  resource_type?: string
  resource_id?: string | number
  resource_name?: string
  path?: string
  ip_address?: string
  status?: 'success' | 'failed' | string
  duration_ms?: number
  method?: string
  status_code?: number
  error_message?: string
  detail?: any
  org_name?: string
  org_id?: string | number
}

// 数据
const stats = ref<any>({})
const statsLoading = useLoading(false)

// 弹框
const dialog = useDialog<AuditLog>()

// 筛选条件
const filters = reactive({
  action: '',
  resource_type: '',
  status: '',
  dataRange: [] as string[],
  keyword: '',
})

// 表格
const table = useTable<AuditLog>({
  defaultPageSize: 20,
  fetchFn: async (params) => {
    try {
      const res = await api.get('/audit/logs', { params })
      return {
        items: res.data.logs || [],
        total: res.data.total || 0
      }
    } catch (error: any) {
      ElMessage.error(error?.response?.detail || '加载失败')
      return {
        items: [],
        total: 0
      }
    }
  }
})

function buildFilterParams() {
  const params: Record<string, any> = {}

  if (filters.action) params.action = filters.action
  if (filters.resource_type) params.resource_type = filters.resource_type
  if (filters.status) params.status = filters.status
  if (filters.keyword) params.keyword = filters.keyword

  if (filters.dataRange?.length === 2) {
    params.start_date = filters.dataRange[0]
    params.end_date = filters.dataRange[1]
  }

  return params
}

/**
 * 搜索
 */
function onSearch() {
  table.pagination.reset()
  table.fetch(buildFilterParams())
}

/**
 * 重置
 */
function onReset() {
  filters.action = ''
  filters.resource_type = ''
  filters.status = ''
  filters.dataRange = []
  filters.keyword = ''
  table.pagination.reset()
  table.fetch()
}

function onRowClick(row: AuditLog) {
  dialog.open(row)
}

async function loadSatas() {
  await statsLoading.withLoading(async () => {
    try {
      const res = await api.get('/audit/stats', { params: { days: 7 } })
      stats.value = res || {}
    } catch (e) {
      console.error('加载统计失败', e)
    }
  })
}

onMounted(() => {
  table.fetch()
  loadSatas()
})
</script>

<style scoped>
.audit-logs {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0 0 8px 0;
  font-size: 24px;
  color: #303133;
}

.subtitle {
  margin: 0;
  color: #909399;
  font-size: 14px;
}
</style>
