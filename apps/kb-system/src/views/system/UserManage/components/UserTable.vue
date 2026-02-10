<template>
  <el-card shadow="never">
    <el-table v-loading="loading" :data="users" stripe>
      <el-table-column prop="id" label="ID" width="70" />
      <el-table-column prop="username" label="用户名" width="120" />
      <el-table-column prop="real_name" label="姓名" width="100" />
      <el-table-column prop="email" label="邮箱" width="180" />
      <el-table-column prop="phone" label="手机号" width="130" />
      <el-table-column prop="org_name" label="组织" width="120" />
      <el-table-column label="角色" width="180">
        <template #default="{ row }">
          <el-tag
            v-for="role in row.roles"
            :key="role"
            :type="getRoleTagType(role)"
            size="small"
            class="role-tag"
          >
            {{ getRoleLabel(role) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="状态" width="80">
        <template #default="{ row }">
          <el-tag :type="getStatusTagType(row.status)" size="small">
            {{ getStatusLabel(row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="last_login_at" label="最后登录" width="170">
        <template #default="{ row }">
          {{ row.last_login_at ? formatDateTime(row.last_login_at) : '-' }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="{ row }">
          <el-button
            type="primary"
            link
            size="small"
            @click="$emit('edit', row)"
          >
            编辑
          </el-button>
          <el-button
            type="warning"
            link
            size="small"
            @click="$emit('reset-password', row)"
          >
            重置密码
          </el-button>
          <el-button
            v-if="row.status === 'locked'"
            type="success"
            link
            size="small"
            @click="$emit('unlock', row)"
          >
            解锁
          </el-button>
          <el-button
            v-if="!row.roles.includes('super_admin')"
            type="danger"
            link
            size="small"
            @click="$emit('delete', row)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination-wrapper">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
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
import { getRoleLabel, ROLE_TAG_TYPES, USER_STATUS_TEXT, USER_STATUS_TYPE } from "@/config";
import { formatDateTime } from "@/utils";

const props = defineProps<{
  users: any[]
  loading: boolean
  page: number
  pageSize: number
  total: number
}>()

const emit = defineEmits<{
  edit: [user: any]
  'reset-password': [user: any]
  unlock: [user: any]
  delete: [user: any]
  'page-change': []
  'update:page': [value: number]
  'update:page-size': [value: number]
}>()

const currentPage = computed({
  get: () => props.page,
  set: (val) => emit('update:page', val)
})

const pageSize = computed({
  get: () => props.pageSize,
  set: (val) => emit('update:page-size', val)
})

function getRoleTagType(role: string): string {
  return ROLE_TAG_TYPES[role] || 'info'
}

function getStatusLabel(status: string): string {
  return USER_STATUS_TEXT[status] || status
}

function getStatusTagType(status: string): string {
  return USER_STATUS_TYPE[status] || 'info'
}
</script>

<style scoped>
.role-tag {
  margin-right: 4px;
  margin-bottom: 4px;
}

.pagination-wrapper {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}
</style>
