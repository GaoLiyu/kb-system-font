<template>
  <el-dialog
    :model-value="visible"
    title="重置密码"
    width="400px"
    @update:model-value="$emit('update:visible', $event)"
    @closed="resetForm"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="80px"
    >
      <el-form-item label="新密码" prop="password">
        <el-input
          v-model="form.password"
          type="password"
          placeholder="请输入新密码"
          show-password
        />
      </el-form-item>
      <el-form-item label="确认密码" prop="confirmPassword">
        <el-input
          v-model="form.confirmPassword"
          type="password"
          placeholder="请再次输入新密码"
          show-password
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="$emit('update:visible', false)">取消</el-button>
      <el-button type="primary" :loading="submitting" @click="handleSubmit">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'

defineProps<{
  visible: boolean
  submitting: boolean
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  submit: [password: string]
}>()

const formRef = ref<FormInstance>()

const form = reactive({
  password: '',
  confirmPassword: '',
})

const rules: FormRules = {
  password: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码至少 6 个字符', trigger: 'blur' },
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    {
      validator: (_rule: any, value: string, callback: Function) => {
        if (value !== form.password) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur',
    },
  ],
}

function resetForm() {
  form.password = ''
  form.confirmPassword = ''
  formRef.value?.resetFields()
}

async function handleSubmit() {
  if (!formRef.value) return

  await formRef.value.validate((valid) => {
    if (valid) {
      emit('submit', form.password)
    }
  })
}
</script>
