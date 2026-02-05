<template>
  <el-card v-if="recommendations.length > 0" style="margin-top: 16px">
    <template #header>
      <span>审查建议</span>
    </template>
    <ul class="recommendations-list">
      <li v-for="(rec, idx) in recommendations" :key="idx">
        <el-icon><Sunny /></el-icon>
        {{ rec }}
      </li>
    </ul>
  </el-card>
</template>

<script setup lang="ts">
import { Sunny } from '@element-plus/icons-vue'

defineProps<{
  recommendations: string[]
}>()
</script>

<style scoped>
.recommendations-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.recommendations-list li {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 0;
  color: #67c23a;
  border-bottom: 1px dashed #ebeef5;
}

.recommendations-list li:last-child {
  border-bottom: none;
}

.recommendations-list .el-icon {
  color: #e6a23c;
}
</style>
