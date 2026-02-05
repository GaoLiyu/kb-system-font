<template>
  <el-card class="table-card">
    <el-table
      v-loading="loading"
      :data="logs"
      stripe
      style="width: 100%"
      @row-click="handleRowClick"
    >
      <el-table-column prop="created_at" label="时间" width="180">
        <template #default="{ row }">
          {{ formatTime(row.created_at) }}
        </template>
      </el-table-column>

      <el-table-column prop="username" label="用户" width="120">
        <template #default="{ row }">
          <span>{{ row.username || row.user_id || '-' }}</span>
        </template>
      </el-table-column>

      <el-table-column prop="action" label="操作" width="100">
        <template #default="{ row }">
          <el-tag :type="getActionTagType(row.action)" size="small">
            {{ getActionLabel(row.action) }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column prop="resource_type" label="资源类型" width="100">
        <template #default="{ row }">
          {{ getResourceLabel(row.resource_type) }}
        </template>
      </el-table-column>

      <el-table-column prop="resource_name" label="资源" min-width="200">
        <template #default="{ row }">
          <div class="resource-info">
            <span class="resource-name">{{ row.resource_name || row.resource_id || '-' }}</span>
            <span v-if="row.path" class="resource-path">{{ row.path }}</span>
          </div>
        </template>
      </el-table-column>

      <el-table-column prop="ip_address" label="IP" width="130" />

      <el-table-column
        prop="status"
        label="状态"
        width="80"
        align="center"
      >
        <template #default="{ row }">
          <el-tag :type="row.status === 'success' ? 'success' : 'danger'" size="small">
            {{ row.status === 'success' ? '成功' : '失败' }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column
        prop="duration_ms"
        label="耗时"
        width="80"
        align="right"
      >
        <template #default="{ row }">
          <span v-if="row.duration_ms">{{ row.duration_ms }}ms</span>
          <span v-else>-</span>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination-wrapper">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="currentPageSize"
        :total="total"
        :page-sizes="[20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="$emit('page-change')"
        @current-change="$emit('page-change')"
      />
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { AUDIT_ACTION_TEXT, AUDIT_ACTION_TYPE, RESOURCE_TYPE_TEXT } from "@/config";
import { formatTime } from '@/utils'

const props = defineProps<{
  logs: any[]
  loading: boolean
  page: number
  pageSize: number
  total: number
}>()

const emit = defineEmits<{
  'row-click': [row: any]
  'page-change': []
  'update:page': [value: number]
  'update:page-size': [value: number]
}>()

const currentPage = computed({
  get: () => props.page,
  set: (val) => emit('update:page', val)
})

const currentPageSize = computed({
  get: () => props.pageSize,
  set: (val) => emit('update:page-size', val)
})

function handleRowClick(row: any) {
  emit('row-click', row)
}

function getActionLabel(action: string) {
  return AUDIT_ACTION_TEXT[action] || action
}

function getActionTagType(action: string) {
  return AUDIT_ACTION_TYPE[action] || 'info'
}

function getResourceLabel(type: string) {
  return RESOURCE_TYPE_TEXT[type] || type
}
</script>

<style scoped>
.table-card {
  margin-bottom: 20px;
}

.resource-info {
  display: flex;
  flex-direction: column;
}

.resource-name {
  color: #303133;
}

.resource-path {
  font-size: 12px;
  color: #909399;
  margin-top: 2px;
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
