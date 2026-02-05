<template>
  <el-card class="info-card">
    <el-descriptions :column="4" border size="small">
      <el-descriptions-item label="文件名">{{ task.filename }}</el-descriptions-item>
      <el-descriptions-item label="审查模式">
        <el-tag :type="task.review_mode === 'full' ? 'primary' : 'info'" size="small">
          {{ task.review_mode === 'full' ? '完整' : '快速' }}
        </el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="状态">
        <el-tag :type="statusTagType" size="small">
          {{ statusText }}
        </el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="风险等级">
        <el-tag v-if="task.overall_risk" :type="riskTagType">
          {{ task.overall_risk }}
        </el-tag>
        <span v-else>-</span>
      </el-descriptions-item>
      <el-descriptions-item label="校验问题">{{ task.validation_count || 0 }}</el-descriptions-item>
      <el-descriptions-item label="语义问题">{{ task.llm_count || 0 }}</el-descriptions-item>
      <el-descriptions-item label="耗时">{{ duration }}</el-descriptions-item>
      <el-descriptions-item label="提交时间">{{ formatTime(task.create_time) }}</el-descriptions-item>
    </el-descriptions>
  </el-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ReviewTask } from '@/types'
import { RISK_LEVEL_TYPE, TASK_STATUS_TEXT, TASK_STATUS_TYPE } from "@/config";
import { calcDuration, formatTime } from "@/utils";

const props = defineProps<{
  task: ReviewTask
}>()

const statusTagType = computed(() => TASK_STATUS_TYPE[props.task.status] || 'info')
const statusText = computed(() => TASK_STATUS_TEXT[props.task.status] || props.task.status)
const riskTagType = computed(() => RISK_LEVEL_TYPE[props.task.overall_risk] || 'success')
const duration = computed(() => calcDuration(props.task.start_time, props.task.end_time))
</script>

<style scoped>
.info-card {
  margin-bottom: 16px;
}
</style>
