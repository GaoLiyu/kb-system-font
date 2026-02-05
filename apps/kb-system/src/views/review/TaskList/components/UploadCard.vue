<template>
  <el-card>
    <template #header>
      <span>提交审查</span>
    </template>

    <el-upload
      drag
      multiple
      :auto-upload="false"
      :on-change="handleFileChange"
      :on-remove="handleFileRemove"
      :file-list="fileList"
      accept=".doc,.docx"
    >
      <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
      <div class="el-upload__text">拖拽文件到此处，或 <em>点击选择</em></div>
      <template #tip>
        <div class="el-upload__tip">支持批量上传 .doc/.docx 文件</div>
      </template>
    </el-upload>

    <div style="margin-top: 16px">
      <el-button
        type="primary"
        :loading="submitting"
        :disabled="fileList.length === 0"
        style="width: 100%"
        @click="$emit('submit')"
      >
        提交审查 ({{ fileList.length }} 个文件)
      </el-button>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { UploadFilled } from '@element-plus/icons-vue'

defineProps<{
  fileList: any[]
  submitting: boolean
}>()

const emit = defineEmits<{
  'update:file-list': [files: any[]]
  submit: []
}>()

function handleFileChange(_file: any, files: any[]) {
  emit('update:file-list', files)
}

function handleFileRemove(_file: any, files: any[]) {
  emit('update:fileList', files)
}
</script>
