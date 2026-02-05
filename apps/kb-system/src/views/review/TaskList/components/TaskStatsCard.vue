<template>
  <el-card style="margin-top: 20px">
    <template #header>
      <span>任务统计</span>
    </template>

    <el-row :gutter="12">
      <el-col :span="12">
        <el-statistic title="待处理" :value="stats.by_status?.pending || 0" />
      </el-col>
      <el-col :span="12">
        <el-statistic title="处理中" :value="stats.by_status?.running || 0" />
      </el-col>
    </el-row>
    <el-row :gutter="12" style="margin-top: 12px">
      <el-col :span="12">
        <el-statistic title="已完成" :value="stats.by_status?.completed || 0" />
      </el-col>
      <el-col :span="12">
        <el-statistic title="失败" :value="stats.by_status?.failed || 0" />
      </el-col>
    </el-row>

    <el-divider />

    <div class="risk-stats">
      <div class="risk-item">
        <span>高风险</span>
        <el-tag type="danger">{{ stats.by_risk?.['高风险'] || 0 }}</el-tag>
      </div>
      <div class="risk-item">
        <span>中风险</span>
        <el-tag type="warning">{{ stats.by_risk?.['中风险'] || 0 }}</el-tag>
      </div>
      <div class="risk-item">
        <span>低风险</span>
        <el-tag type="success">{{ stats.by_risk?.['低风险'] || 0 }}</el-tag>
      </div>
    </div>
  </el-card>
</template>

<script setup lang="ts">
defineProps<{
  stats: {
    by_status?: Record<string, number>
    by_risk?: Record<string, number>
  }
}>()
</script>

<style scoped>
.risk-stats {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.risk-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
