<template>
  <el-dialog
    :model-value="visible"
    title="日志详情"
    width="600px"
    @update:model-value="$emit('update:visible', $event)"
  >
    <el-descriptions v-if="log" :column="2" border>
      <el-descriptions-item label="时间" :span="2">
        {{ formatTime(log.created_at) }}
      </el-descriptions-item>
      <el-descriptions-item label="用户">
        {{ log.username || log.user_id }}
      </el-descriptions-item>
      <el-descriptions-item label="组织">
        {{ log.org_name || log.org_id || '-' }}
      </el-descriptions-item>
      <el-descriptions-item label="操作">
        <el-tag :type="getActionTagType(log.action)" size="small">
          {{ getActionLabel(log.action) }}
        </el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="状态">
        <el-tag :type="log.status === 'success' ? 'success' : 'danger'" size="small">
          {{ log.status === 'success' ? '成功' : '失败' }}
        </el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="资源类型">
        {{ getResourceLabel(log.resource_type) }}
      </el-descriptions-item>
      <el-descriptions-item label="资源ID">
        {{ log.resource_id || '-' }}
      </el-descriptions-item>
      <el-descriptions-item label="资源名称" :span="2">
        {{ log.resource_name || '-' }}
      </el-descriptions-item>
      <el-descriptions-item label="请求方法">
        {{ log.method || '-' }}
      </el-descriptions-item>
      <el-descriptions-item label="耗时">
        {{ log.duration_ms ? log.duration_ms + 'ms' : '-' }}
      </el-descriptions-item>
      <el-descriptions-item label="请求路径" :span="2">
        {{ log.path || '-' }}
      </el-descriptions-item>
      <el-descriptions-item label="IP地址">
        {{ log.ip_address || '-' }}
      </el-descriptions-item>
      <el-descriptions-item label="状态码">
        {{ log.status_code || '-' }}
      </el-descriptions-item>
      <el-descriptions-item v-if="log.error_message" label="错误信息" :span="2">
        <span class="error-message">{{ log.error_message }}</span>
      </el-descriptions-item>
      <el-descriptions-item v-if="log.detail" label="详情" :span="2">
        <pre class="detail-json">{{ JSON.stringify(log.detail, null, 2) }}</pre>
      </el-descriptions-item>
    </el-descriptions>
  </el-dialog>
</template>

<script setup lang="ts">
defineProps<{
  visible: boolean
  log: any | null
}>()

defineEmits<{
  'update:visible': [value: boolean]
}>()

const actionTypes: Record<string, string> = {
  create: '创建', read: '查看', update: '更新', delete: '删除',
  upload: '上传', download: '下载', export: '导出', search: '搜索',
  review: '审查', login: '登录', logout: '登出',
}

const resourceTypes: Record<string, string> = {
  report: '报告', case: '案例', review_task: '审查任务',
  knowledge_base: '知识库', vector_index: '向量索引', user: '用户', system: '系统',
}

const actionTagTypes: Record<string, string> = {
  create: 'success', delete: 'danger', update: 'warning',
  upload: 'success', export: 'info', review: 'primary',
}

function formatTime(time: string) {
  if (!time) return '-'
  return new Date(time).toLocaleString('zh-CN')
}

function getActionLabel(action: string) {
  return actionTypes[action] || action
}

function getActionTagType(action: string) {
  return actionTagTypes[action] || 'info'
}

function getResourceLabel(type: string) {
  return resourceTypes[type] || type
}
</script>

<style scoped>
.error-message {
  color: #f56c6c;
}

.detail-json {
  background: #f5f7fa;
  padding: 10px;
  border-radius: 4px;
  font-size: 12px;
  max-height: 200px;
  overflow: auto;
  margin: 0;
}
</style>
