<template>
  <div class="user-manage">
    <UserSearchForm
      :form="searchForm"
      :organizations="organizations"
      @search="onSearch"
      @reset="onReset"
      @create="onCreate"
    />

    <UserTable
      v-model:page="table.pagination.page"
      v-model:page-size="table.pagination.pageSize"
      :users="table.list"
      :loading="table.loading"
      :total="table.pagination.total"
      @edit="onEdit"
      @reset-password="onResetPassword"
      @unlock="onUnlock"
      @delete="onDelete"
      @page-change="table.fetch(buildQueryParams())"
    />

    <UserFormDialog
      v-model:visible="userDialog.visible"
      :is-edit="isEdit"
      :initial-data="userDialog.data || {}"
      :organizations="organizations"
      :roles="roles"
      :is-super-admin="isSuperAdmin"
      :submitting="submitLoading.loading"
      @submit="onSubmit"
    />

    <ResetPasswordDialog
      v-model:visible="pwdDialog.visible"
      :submitting="submitLoading.loading"
      @submit="submitResetPassword"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '@/stores/user'
import {
  getUserList,
  createUser,
  updateUser,
  updateUserRoles,
  resetUserPassword,
  deleteUser,
  unlockUser,
  getOrganizationList,
  getRoleList,
} from '@/api/modules/user'

import UserSearchForm from './components/UserSearchForm.vue'
import UserTable from './components/UserTable.vue'
import UserFormDialog from './components/UserFormDialog.vue'
import ResetPasswordDialog from './components/ResetPasswordDialog.vue'

import { useDialog } from '@/composables/useDialog'
import { useTable } from '@/composables/useTable'
import { useLoading } from '@/composables/useLoading'

type UserRow = {
  id: number
  username: string
  real_name?: string
  email?: string
  phone?: string
  org_id?: number
  org_name?: string
  roles: string[]
  status: 'active' | 'inactive' | 'locked' | string
  last_login_at?: string
}

type UserForm = {
  username: string
  password: string
  real_name: string
  email: string
  phone: string
  org_id?: number
  roles: string[]
  status: string
}

const userStore = useUserStore()
const isSuperAdmin = computed(() => userStore.isSuperAdmin)

// 搜索条件：保留你原来的 reactive
const searchForm = reactive({
  keyword: '',
  status: '',
  org_id: undefined as number | undefined,
})

// 组织/角色
const organizations = ref<any[]>([])
const roles = ref<any[]>([])

// 提交 loading（创建/更新/重置密码共用）
const submitLoading = useLoading(false)

// 弹窗：新增/编辑
const userDialog = useDialog<Partial<UserForm> & { id?: number }>()
const isEdit = ref(false)
const editingUserId = ref<number | null>(null)

// 弹窗：重置密码（data 里放 userId）
const pwdDialog = useDialog<{ userId: number }>()

// 列表：useTable
const table = useTable<UserRow>({
  defaultPageSize: 20,
  fetchFn: async (params) => {
    // 你的接口返回：{ users, total }
    const res = await getUserList(params)
    return {
      items: res.users || [],
      total: res.total || 0,
    }
  },
  deleteFn: async (id) => {
    // 这里不直接用 handleDelete（因为你要自定义 confirm 文案）
    return deleteUser(Number(id))
  },
})

function buildQueryParams() {
  return {
    ...searchForm,
  }
}

// 拉组织/角色
async function fetchOrganizations() {
  try {
    const res = await getOrganizationList()
    organizations.value = res.organizations || []
  } catch (e) {
    console.error('获取组织列表失败', e)
  }
}

async function fetchRoles() {
  try {
    const res = await getRoleList()
    roles.value = res.roles || []
  } catch (e) {
    console.error('获取角色列表失败', e)
  }
}

// 搜索/重置
function onSearch() {
  table.pagination.reset()
  table.fetch(buildQueryParams())
}

function onReset() {
  searchForm.keyword = ''
  searchForm.status = ''
  searchForm.org_id = undefined
  onSearch()
}

// 新增/编辑
function onCreate() {
  isEdit.value = false
  editingUserId.value = null
  userDialog.open({
    username: '',
    password: '',
    real_name: '',
    email: '',
    phone: '',
    org_id: undefined,
    roles: [],
    status: 'active',
  })
}

function onEdit(row: UserRow) {
  isEdit.value = true
  editingUserId.value = row.id

  userDialog.open({
    username: row.username,
    // 编辑时不需要密码字段，但为了 Dialog 内 form 结构一致可以留空
    password: '',
    real_name: row.real_name || '',
    email: row.email || '',
    phone: row.phone || '',
    org_id: row.org_id,
    roles: [...(row.roles || [])],
    status: row.status,
  })
}

// 提交（新增/编辑）
async function onSubmit(form: UserForm, isEditMode: boolean) {
  await submitLoading.withLoading(async () => {
    try {
      if (isEditMode && editingUserId.value) {
        await updateUser(editingUserId.value, {
          real_name: form.real_name,
          email: form.email,
          phone: form.phone,
          org_id: form.org_id,
          status: form.status,
        })
        await updateUserRoles(editingUserId.value, form.roles)
        ElMessage.success('更新成功')
      } else {
        await createUser({
          username: form.username,
          password: form.password,
          real_name: form.real_name,
          email: form.email,
          phone: form.phone,
          org_id: form.org_id,
          roles: form.roles,
        })
        ElMessage.success('创建成功')
      }

      userDialog.close()
      await table.fetch(buildQueryParams())
    } catch (error: any) {
      ElMessage.error(error?.message || '操作失败')
      throw error
    }
  })
}

// 重置密码
function onResetPassword(row: UserRow) {
  pwdDialog.open({ userId: row.id })
}

async function submitResetPassword(password: string) {
  const userId = pwdDialog.data.value?.userId
  if (!userId) return

  await submitLoading.withLoading(async () => {
    try {
      await resetUserPassword(userId, password)
      ElMessage.success('密码重置成功')
      pwdDialog.close()
    } catch (error: any) {
      ElMessage.error(error?.message || '重置失败')
      throw error
    }
  })
}

// 解锁
async function onUnlock(row: UserRow) {
  try {
    await ElMessageBox.confirm(`确定要解锁用户 "${row.username}" 吗？`, '确认解锁', {
      type: 'warning',
      confirmButtonText: '确定',
      cancelButtonText: '取消',
    })
  } catch {
    return
  }

  await submitLoading.withLoading(async () => {
    try {
      await unlockUser(row.id)
      ElMessage.success('解锁成功')
      await table.fetch(buildQueryParams())
    } catch (error: any) {
      ElMessage.error(error?.message || '解锁失败')
      throw error
    }
  })
}

// 删除（自定义 confirm 文案）
async function onDelete(row: UserRow) {
  try {
    await ElMessageBox.confirm(
      `确定要删除用户 "${row.username}" 吗？此操作不可恢复！`,
      '确认删除',
      { type: 'warning', confirmButtonText: '确定', cancelButtonText: '取消' }
    )
  } catch {
    return
  }

  await submitLoading.withLoading(async () => {
    try {
      await deleteUser(row.id)
      ElMessage.success('删除成功')
      await table.fetch(buildQueryParams())
    } catch (error: any) {
      ElMessage.error(error?.message || '删除失败')
      throw error
    }
  })
}

onMounted(() => {
  table.fetch(buildQueryParams())
  fetchOrganizations()
  fetchRoles()
})
</script>

<style scoped>
.user-manage {
  padding: 0;
}
</style>
