<template>
  <el-row :gutter="16" class="stats-row">
    <el-col :span="6">
      <el-card shadow="hover" class="stats-card">
        <div class="stats-content">
          <div class="stats-value">{{ stats.total || 0 }}</div>
          <div class="stats-label">总操作数</div>
        </div>
        <el-icon class="stats-icon" :size="40"><Operation /></el-icon>
      </el-card>
    </el-col>
    <el-col :span="6">
      <el-card shadow="hover" class="stats-card success">
        <div class="stats-content">
          <div class="stats-value">{{ stats.by_status?.success || 0 }}</div>
          <div class="stats-label">成功</div>
        </div>
        <el-icon class="stats-icon" :size="40"><SuccessFilled /></el-icon>
      </el-card>
    </el-col>
    <el-col :span="6">
      <el-card shadow="hover" class="stats-card danger">
        <div class="stats-content">
          <div class="stats-value">{{ stats.by_status?.failed || 0 }}</div>
          <div class="stats-label">失败</div>
        </div>
        <el-icon class="stats-icon" :size="40"><CircleCloseFilled /></el-icon>
      </el-card>
    </el-col>
    <el-col :span="6">
      <el-card shadow="hover" class="stats-card info">
        <div class="stats-content">
          <div class="stats-value">{{ stats.top_users?.length || 0 }}</div>
          <div class="stats-label">活跃用户</div>
        </div>
        <el-icon class="stats-icon" :size="40"><User /></el-icon>
      </el-card>
    </el-col>
  </el-row>
</template>

<script setup lang="ts">
import { Operation, SuccessFilled, CircleCloseFilled, User } from '@element-plus/icons-vue'

defineProps<{
  stats: {
    total?: number
    by_status?: { success?: number; failed?: number }
    top_users?: any[]
  }
}>()
</script>

<style scoped>
.stats-row {
  margin-bottom: 20px;
}

.stats-card {
  position: relative;
  overflow: hidden;
}

.stats-card :deep(.el-card__body) {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
}

.stats-content {
  z-index: 1;
}

.stats-value {
  font-size: 28px;
  font-weight: 600;
  color: #303133;
}

.stats-label {
  font-size: 14px;
  color: #909399;
  margin-top: 4px;
}

.stats-icon {
  color: #dcdfe6;
}

.stats-card.success .stats-value {
  color: #67c23a;
}

.stats-card.success .stats-icon {
  color: #e1f3d8;
}

.stats-card.danger .stats-value {
  color: #f56c6c;
}

.stats-card.danger .stats-icon {
  color: #fde2e2;
}

.stats-card.info .stats-value {
  color: #409eff;
}

.stats-card.info .stats-icon {
  color: #d9ecff;
}
</style>
