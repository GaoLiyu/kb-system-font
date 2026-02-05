<template>
  <el-card class="search-card" shadow="never">
    <el-form :inline="true" :model="form" class="search-form">
      <el-form-item label="关键词">
        <el-input
          v-model="form.keyword"
          placeholder="用户名/姓名/邮箱"
          clearable
          @keyup.enter="$emit('search')"
        />
      </el-form-item>
      <el-form-item label="状态">
        <el-select v-model="form.status" placeholder="全部" clearable>
          <el-option label="正常" value="active" />
          <el-option label="禁用" value="inactive" />
          <el-option label="锁定" value="locked" />
        </el-select>
      </el-form-item>
      <el-form-item label="组织">
        <el-select v-model="form.org_id" placeholder="全部" clearable>
          <el-option
            v-for="org in organizations"
            :key="org.id"
            :label="org.org_name"
            :value="org.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="$emit('search')">
          <el-icon><Search /></el-icon>
          搜索
        </el-button>
        <el-button @click="$emit('reset')">重置</el-button>
      </el-form-item>
    </el-form>

    <div class="action-bar">
      <el-button type="primary" @click="$emit('create')">
        <el-icon><Plus /></el-icon>
        新增用户
      </el-button>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { Search, Plus } from '@element-plus/icons-vue'

interface SearchForm {
  keyword: string
  status: string
  org_id?: number
}

interface Organization {
  id: number
  org_name: string
}

defineProps<{
  form: SearchForm
  organizations: Organization[]
}>()

defineEmits<{
  search: []
  reset: []
  create: []
}>()
</script>

<style scoped>
.search-card {
  margin-bottom: 16px;
}

.search-form {
  margin-bottom: 16px;
}

.action-bar {
  display: flex;
  justify-content: flex-end;
}
</style>
