<template>
  <div v-loading="loading" class="report-detail-page">
    <div class="page-header">
      <el-button :icon="ArrowLeft" @click="router.back()">返回</el-button>
      <h3>报告详情</h3>
    </div>

    <el-card v-if="report">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="文件名">{{
            report.metadata.source_file || report.metadata.filename
          }}</el-descriptions-item>
        <el-descriptions-item label="报告类型">
          <el-tag>{{ report.report_type }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="估价对象地址" :span="2">{{
            report.address
          }}</el-descriptions-item>
        <el-descriptions-item label="建筑面积">{{
            report.area ? report.area + ' ㎡' : '-'
          }}</el-descriptions-item>
        <el-descriptions-item label="案例数量">{{
            report.metadata.cases.length
          }}</el-descriptions-item>
        <el-descriptions-item label="上传时间" :span="2">{{
            formatTime(report.create_time)
          }}</el-descriptions-item>
      </el-descriptions>

      <CaseTable
        :cases="report.metadata.cases"
        :report-type="report.report_type"
        @view-case="goToCaseDetail"
      />
    </el-card>

    <el-empty v-else-if="!loading" description="报告不存在" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft } from '@element-plus/icons-vue'
import { getReportDetail } from '@/api'
import { ElMessage } from 'element-plus'

import CaseTable from './components/CaseTable.vue'

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const report = ref<any>(null)

async function loadReport() {
  const docId = route.params.docId as string
  if (!docId) return

  loading.value = true
  try {
    const res = await getReportDetail(docId)
    report.value = res.report
  } catch (error: any) {
    ElMessage.error(error.message || '加载失败')
  } finally {
    loading.value = false
  }
}

function formatTime(time: string) {
  if (!time) return '-'
  return time.replace('T', ' ').slice(0, 19)
}

function goToCaseDetail(row: any) {
  const docId = route.params.docId as string
  router.push(`/kb/cases/${docId + '_case_' + row.case_id}`)
}

onMounted(() => {
  loadReport()
})
</script>

<style scoped>
.report-detail-page {
  padding: 20px;
}

.page-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}

.page-header h3 {
  margin: 0;
}
</style>
