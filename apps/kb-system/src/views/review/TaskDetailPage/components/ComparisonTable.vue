<template>
  <el-card v-if="comparisons.length > 0" style="margin-top: 16px">
    <template #header>
      <div class="panel-header">
        <span>知识库对比异常</span>
        <el-tag size="small" type="warning">{{ comparisons.length }} 项</el-tag>
      </div>
    </template>
    <el-table :data="comparisons" size="small" max-height="300">
      <el-table-column prop="item" label="对比项" width="150" />
      <el-table-column prop="current_value" label="当前值" width="100">
        <template #default="{ row }">
          {{ typeof row.current_value === 'number' ? row.current_value.toFixed(2) : row.current_value }}
        </template>
      </el-table-column>
      <el-table-column label="知识库范围" width="180">
        <template #default="{ row }">
          <span class="kb-range">
            {{ row.kb_min?.toFixed(2) }} ~ {{ row.kb_max?.toFixed(2) }}
          </span>
          <span class="kb-avg">(均值: {{ row.kb_avg?.toFixed(2) }})</span>
        </template>
      </el-table-column>
      <el-table-column prop="description" label="说明" min-width="200">
        <template #default="{ row }">
          <el-text type="warning" size="small">{{ row.description }}</el-text>
        </template>
      </el-table-column>
    </el-table>
  </el-card>
</template>

<script setup lang="ts">
interface Comparison {
  item: string
  current_value: number | string
  kb_min?: number
  kb_max?: number
  kb_avg?: number
  description?: string
  is_abnormal?: boolean
}

defineProps<{
  comparisons: Comparison[]
}>()
</script>

<style scoped>
.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.kb-range {
  color: #409eff;
  font-family: monospace;
}

.kb-avg {
  color: #909399;
  font-size: 12px;
  margin-left: 8px;
}
</style>
