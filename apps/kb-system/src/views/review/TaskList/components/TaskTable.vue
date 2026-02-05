<template>
  <el-card>
    <template #header>
      <div class="card-header">
        <span>任务列表</span>
        <div>
          <el-radio-group
            v-model="localFilterStatus"
            size="small"
            @change="$emit('filter-change', $event)"
          >
            <el-radio-button value="">全部</el-radio-button>
            <el-radio-button value="pending">待处理</el-radio-button>
            <el-radio-button value="running">处理中</el-radio-button>
            <el-radio-button value="completed">已完成</el-radio-button>
            <el-radio-button value="failed">失败</el-radio-button>
          </el-radio-group>

          <el-button type="primary" size="small" style="margin-left: 12px" @click="$emit('refresh')">
            <el-icon><Refresh /></el-icon>
          </el-button>
        </div>
      </div>
    </template>

    <el-table v-loading="loading" :data="tasks" stripe min-height="600">
      <el-table-column prop="filename" label="文件名" show-overflow-tooltip min-width="180" />
      <el-table-column prop="review_mode" label="模式" width="80">
        <template #default="{ row }">
          <el-tag size="small" :type="row.review_mode === 'full' ? 'primary' : 'info'">
            {{ row.review_mode === 'full' ? '完整' : '快速' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="90">
        <template #default="{ row }">
          <el-tag :type="statusTagType(row.status)" size="small">
            {{ statusText(row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="overall_risk" label="风险" width="80">
        <template #default="{ row }">
          <el-tag v-if="row.overall_risk" :type="riskTagType(row.overall_risk)" size="small">
            {{ row.overall_risk }}
          </el-tag>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column prop="issue_count" label="问题数" width="70" align="center" />
      <el-table-column prop="create_time" label="提交时间" width="160">
        <template #default="{ row }">
          {{ formatTime(row.create_time) }}
        </template>
      </el-table-column>

      <el-table-column label="操作" width="150" fixed="right">
        <template #default="{ row }">
          <el-button
            v-if="row.status === 'completed'"
            type="primary"
            size="small"
            link
            @click="$emit('view', row)"
          >
            查看
          </el-button>

          <el-dropdown
            v-if="row.status === 'completed'"
            style="margin-left: 8px"
            @command="(cmd: string) => $emit('export', row, cmd)"
          >
            <el-button type="success" size="small" link>导出</el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="simple">审查意见</el-dropdown-item>
                <el-dropdown-item command="full">含原文标注</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>

          <el-button
            type="danger"
            size="small"
            link
            style="margin-left: 8px"
            @click="$emit('delete', row)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-empty v-if="!loading && tasks.length === 0" description="暂无任务" />

    <!-- 分页 -->
    <div v-if="total > 0" class="pagination-wrapper">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="currentPageSize"
        :total="total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="$emit('page-change')"
        @current-change="$emit('page-change')"
      />
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { Refresh } from '@element-plus/icons-vue'
import type { ReviewTask } from '@/types'
import { RISK_LEVEL_TYPE, TASK_STATUS_TEXT, TASK_STATUS_TYPE } from "@/config";
import { formatTime } from "@/utils";

const props = defineProps<{
  tasks: ReviewTask[]
  loading: boolean
  filterStatus: string
  page: number
  pageSize: number
  total: number
}>()

const emit = defineEmits<{
  'filter-change': [status: string]
  refresh: []
  view: [task: ReviewTask]
  export: [task: ReviewTask, command: string]
  delete: [task: ReviewTask]
  'page-change': []
  'update:page': [value: number]
  'update:page-size': [value: number]
}>()

// 本地筛选状态（用于 radio 组）
const localFilterStatus = ref(props.filterStatus)
watch(() => props.filterStatus, (val) => {
  localFilterStatus.value = val
})

// 标准 v-model：page / pageSize
const currentPage = computed({
  get: () => props.page,
  set: (val) => emit('update:page', val),
})

const currentPageSize = computed({
  get: () => props.pageSize,
  set: (val) => emit('update:page-size', val),
})

function statusTagType(status: string) {
  return TASK_STATUS_TYPE[status] || 'info'
}

function statusText(status: string) {
  return TASK_STATUS_TEXT[status] || status
}

function riskTagType(risk: string) {
  return RISK_LEVEL_TYPE[risk] || 'success'
}
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.pagination-wrapper {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}
</style>
