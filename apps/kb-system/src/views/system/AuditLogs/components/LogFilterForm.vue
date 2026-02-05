<template>
  <el-card class="filter-card">
    <el-form :inline="true" :model="filters" class="filter-form">
      <el-form-item label="操作类型">
        <el-select
          v-model="filters.action"
          placeholder="全部"
          clearable
          style="width: 120px"
        >
          <el-option
            v-for="item in actionTypes"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="资源类型">
        <el-select
          v-model="filters.resource_type"
          placeholder="全部"
          clearable
          style="width: 120px"
        >
          <el-option
            v-for="item in resourceTypes"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="状态">
        <el-select
          v-model="filters.status"
          placeholder="全部"
          clearable
          style="width: 100px"
        >
          <el-option label="成功" value="success" />
          <el-option label="失败" value="failed" />
        </el-select>
      </el-form-item>

      <el-form-item label="日期范围">
        <el-date-picker
          v-model="filters.dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="YYYY-MM-DD"
          style="width: 240px"
        />
      </el-form-item>

      <el-form-item label="关键词">
        <el-input
          v-model="filters.keyword"
          placeholder="搜索资源名称、路径"
          clearable
          style="width: 180px"
          @keyup.enter="$emit('search')"
        />
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="$emit('search')">
          <el-icon><Search /></el-icon>
          查询
        </el-button>
        <el-button @click="$emit('reset')">
          <el-icon><Refresh /></el-icon>
          重置
        </el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<script setup lang="ts">
import { Search, Refresh } from '@element-plus/icons-vue'

interface Filters {
  action: string
  resource_type: string
  status: string
  dateRange: string[]
  keyword: string
}

defineProps<{
  filters: Filters
}>()

defineEmits<{
  search: []
  reset: []
}>()

const actionTypes = [
  { value: 'create', label: '创建' },
  { value: 'read', label: '查看' },
  { value: 'update', label: '更新' },
  { value: 'delete', label: '删除' },
  { value: 'upload', label: '上传' },
  { value: 'download', label: '下载' },
  { value: 'export', label: '导出' },
  { value: 'search', label: '搜索' },
  { value: 'review', label: '审查' },
  { value: 'login', label: '登录' },
  { value: 'logout', label: '登出' },
]

const resourceTypes = [
  { value: 'report', label: '报告' },
  { value: 'case', label: '案例' },
  { value: 'review_task', label: '审查任务' },
  { value: 'knowledge_base', label: '知识库' },
  { value: 'vector_index', label: '向量索引' },
  { value: 'user', label: '用户' },
  { value: 'system', label: '系统' },
]
</script>

<style scoped>
.filter-card {
  margin-bottom: 20px;
}

.filter-form {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
</style>
