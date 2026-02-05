<template>
  <el-dialog
    :model-value="visible"
    :title="isEdit ? '编辑用户' : '新增用户'"
    width="500px"
    @update:model-value="$emit('update:visible', $event)"
    @closed="resetForm"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="80px"
    >
      <el-form-item label="用户名" prop="username">
        <el-input v-model="form.username" :disabled="isEdit" placeholder="请输入用户名" />
      </el-form-item>
      <el-form-item v-if="!isEdit" label="密码" prop="password">
        <el-input
          v-model="form.password"
          type="password"
          placeholder="请输入密码"
          show-password
        />
      </el-form-item>
      <el-form-item label="姓名" prop="real_name">
        <el-input v-model="form.real_name" placeholder="请输入真实姓名" />
      </el-form-item>
      <el-form-item label="邮箱" prop="email">
        <el-input v-model="form.email" placeholder="请输入邮箱" />
      </el-form-item>
      <el-form-item label="手机号" prop="phone">
        <el-input v-model="form.phone" placeholder="请输入手机号" />
      </el-form-item>
      <el-form-item label="组织" prop="org_id">
        <el-select v-model="form.org_id" placeholder="请选择组织" clearable>
          <el-option
            v-for="org in organizations"
            :key="org.id"
            :label="org.org_name"
            :value="org.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="角色" prop="roles">
        <el-checkbox-group v-model="form.roles">
          <el-checkbox
            v-for="role in roles"
            :key="role.code"
            :label="role.code"
            :disabled="role.code === 'super_admin' && !isSuperAdmin"
          >
            {{ role.name }}
          </el-checkbox>
        </el-checkbox-group>
      </el-form-item>
      <el-form-item v-if="isEdit" label="状态" prop="status">
        <el-radio-group v-model="form.status">
          <el-radio label="active">正常</el-radio>
          <el-radio label="inactive">禁用</el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="$emit('update:visible', false)">取消</el-button>
      <el-button type="primary" :loading="submitting" @click="handleSubmit">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'

interface UserForm {
  username: string
  password: string
  real_name: string
  email: string
  phone: string
  org_id?: number
  roles: string[]
  status: string
}

interface Organization {
  id: number
  org_name: string
}

interface Role {
  code: string
  name: string
}

const props = defineProps<{
  visible: boolean
  isEdit: boolean
  initialData?: Partial<UserForm>
  organizations: Organization[]
  roles: Role[]
  isSuperAdmin: boolean
  submitting: boolean
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  submit: [form: UserForm, isEdit: boolean]
}>()

const formRef = ref<FormInstance>()

const form = ref<UserForm>({
  username: '',
  password: '',
  real_name: '',
  email: '',
  phone: '',
  org_id: undefined,
  roles: [],
  status: 'active',
})

const rules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 50, message: '长度在 3 到 50 个字符', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码至少 6 个字符', trigger: 'blur' },
  ],
  roles: [{ required: true, message: '请选择角色', trigger: 'change' }],
}

watch(() => props.visible, (val) => {
  if (val && props.initialData) {
    Object.assign(form.value, props.initialData)
  }
})

function resetForm() {
  form.value = {
    username: '',
    password: '',
    real_name: '',
    email: '',
    phone: '',
    org_id: undefined,
    roles: [],
    status: 'active',
  }
  formRef.value?.resetFields()
}

async function handleSubmit() {
  if (!formRef.value) return

  await formRef.value.validate((valid) => {
    if (valid) {
      emit('submit', { ...form.value }, props.isEdit)
    }
  })
}
</script>
