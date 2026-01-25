<template>
  <div class="report-detail-page" v-loading="loading">
    <div class="page-header">
      <el-button @click="router.back()" :icon="ArrowLeft">返回</el-button>
      <h3>报告详情</h3>
    </div>

    <el-card v-if="report">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="文件名">{{ report.metadata.source_file || report.metadata.filename }}</el-descriptions-item>
        <el-descriptions-item label="报告类型">
          <el-tag>{{ report.report_type }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="估价对象地址" :span="2">{{ report.address }}</el-descriptions-item>
        <el-descriptions-item label="建筑面积">{{ report.area ? report.area + ' ㎡' : '-' }}</el-descriptions-item>
        <el-descriptions-item label="案例数量">{{ report.metadata.cases.length }}</el-descriptions-item>
        <el-descriptions-item label="上传时间" :span="2">{{ formatTime(report.create_time) }}</el-descriptions-item>
      </el-descriptions>

      <h4 style="margin: 24px 0 16px;">关联案例 ({{ report.metadata.cases?.length || 0 }})</h4>

      <el-table :data="report.metadata.cases || []" stripe size="small">
        <el-table-column prop="case_id" label="编号" width="80" fixed />

        <el-table-column label="地址" min-width="180">
          <template #default="{ row }">
            <el-button type="primary" link @click="goToCaseDetail(row)">
              {{ getAddress(row) }}
            </el-button>
          </template>
        </el-table-column>

        <el-table-column prop="district" label="区域" width="90" />

        <el-table-column label="面积" width="90" align="right">
          <template #default="{ row }">{{ getArea(row) }}</template>
        </el-table-column>

        <el-table-column label="单价" width="100" align="right">
          <template #default="{ row }">{{ getPrice(row) }}</template>
        </el-table-column>

        <!-- 涉执/租金报告：五因素修正 -->
        <template v-if="report.report_type !== 'biaozhunfang'">
          <el-table-column label="交易" width="70" align="center">
            <template #default="{ row }">
              {{ formatCorrection(row.transaction_correction) }}
            </template>
          </el-table-column>
          <el-table-column label="市场" width="70" align="center">
            <template #default="{ row }">
              {{ formatCorrection(row.market_correction) }}
            </template>
          </el-table-column>
          <el-table-column label="区位" width="70" align="center">
            <template #default="{ row }">
              {{ formatCorrection(row.location_correction) }}
            </template>
          </el-table-column>
          <el-table-column label="实物" width="70" align="center">
            <template #default="{ row }">
              {{ formatCorrection(row.physical_correction) }}
            </template>
          </el-table-column>
          <el-table-column label="权益" width="70" align="center">
            <template #default="{ row }">
              {{ formatCorrection(row.rights_correction) }}
            </template>
          </el-table-column>
          <el-table-column label="修正后" width="100" align="right">
            <template #default="{ row }">
              {{ formatPrice(row.adjusted_price) }}
            </template>
          </el-table-column>
        </template>

        <!-- 标准房报告：P 系数 -->
        <template v-else>
          <el-table-column label="P1(交易)" width="90" align="center">
            <template #default="{ row }">
              <el-tooltip :content="getPValueTooltip(row.p1_transaction)" placement="top">
                <span>{{ formatPValue(row.p1_transaction) }}</span>
              </el-tooltip>
            </template>
          </el-table-column>
          <el-table-column label="P2(日期)" width="90" align="center">
            <template #default="{ row }">
              <el-tooltip :content="getPValueTooltip(row.p2_date)" placement="top">
                <span>{{ formatPValue(row.p2_date) }}</span>
              </el-tooltip>
            </template>
          </el-table-column>
          <el-table-column label="P3(实体)" width="90" align="center">
            <template #default="{ row }">
              <el-tooltip :content="getPValueTooltip(row.p3_physical || row.physical_composite)" placement="top">
                <span>{{ formatPValue(row.p3_physical || row.physical_composite) }}</span>
              </el-tooltip>
            </template>
          </el-table-column>
          <el-table-column label="P4(区位)" width="90" align="center">
            <template #default="{ row }">
              <el-tooltip :content="getPValueTooltip(row.p4_location)" placement="top">
                <span>{{ formatPValue(row.p4_location) }}</span>
              </el-tooltip>
            </template>
          </el-table-column>
          <el-table-column label="比准价" width="100" align="right">
            <template #default="{ row }">
              {{ formatPrice(row.final_price) }}
            </template>
          </el-table-column>
        </template>

        <el-table-column prop="usage" label="用途" width="70" />

        <!-- 【新增】楼层信息 -->
        <el-table-column label="楼层" width="90">
          <template #default="{ row }">
            {{ formatFloor(row) }}
          </template>
        </el-table-column>
      </el-table>

      <el-empty v-if="report.cases?.length === 0" description="暂无案例" />
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

function getAddress(row: any): string {
  if (!row.address) return '-'
  return typeof row.address === 'string' ? row.address : row.address.value || '-'
}

function getArea(row: any): string {
  const area = row.area ?? row.building_area?.value ?? row.building_area
  return area ? String(area) : '-'
}

function getPrice(row: any): string {
  const price = row.price ?? row.transaction_price?.value ?? row.rental_price?.value
  return price ? price.toLocaleString() : '-'
}

function goToCaseDetail(row: any) {
  const docId = route.params.docId as string
  router.push(`/kb/cases/${docId + '_case_' + row.case_id}`)
}

function formatCorrection(val: any): string {
  if (!val) return '-'

  // LocatedValue 格式
  if (typeof val === 'object' && 'value' in val) {
    const v = val.value
    if (!v) return '-'
    return v.toFixed(4)
  }

  // 直接数字
  if (typeof val === 'number') {
    return val.toFixed(4)
  }

  return String(val)
}

function formatPrice(val: any): string {
  if (!val) return '-'

  let price: number
  if (typeof val === 'object' && 'value' in val) {
    price = val.value
  } else if (typeof val === 'number') {
    price = val
  } else {
    return '-'
  }

  if (!price) return '-'
  return price.toLocaleString('zh-CN', { maximumFractionDigits: 0 })
}

// ========== P 系数格式化（标准房专用）==========

function formatPValue(val: any): string {
  if (!val) return '1.00'

  // 新格式：{ raw: '108/103', value: 1.0485 }
  if (typeof val === 'object' && 'raw' in val) {
    if (val.raw === '不修正' || val.raw === '无修正') {
      return '1.00'
    }
    if (val.value) {
      return val.value.toFixed(4)
    }
    return val.raw
  }

  // LocatedValue 格式
  if (typeof val === 'object' && 'value' in val) {
    const v = val.value
    if (!v) return '1.00'
    // 判断是否是分数原始文本
    const raw = val.raw_text || ''
    if (raw.includes('/')) {
      return v.toFixed(4)
    }
    return v.toFixed(4)
  }

  // 字符串：'不修正'、'108/103'
  if (typeof val === 'string') {
    if (val === '不修正' || val === '无修正' || val === '-') {
      return '1.00'
    }
    if (val.includes('/')) {
      // 计算分数值
      const parts = val.split('/')
      if (parts.length === 2) {
        try {
          const a = parseFloat(parts[0])
          const b = parseFloat(parts[1])
          if (b !== 0) {
            return (a / b).toFixed(4)
          }
        } catch {}
      }
    }
    return val
  }

  // 数字
  if (typeof val === 'number') {
    return val.toFixed(4)
  }

  return '1.00'
}

function getPValueTooltip(val: any): string {
  if (!val) return '无修正'

  // 新格式
  if (typeof val === 'object' && 'raw' in val) {
    if (val.raw && val.value) {
      return `原始值: ${val.raw}\n计算值: ${val.value.toFixed(4)}`
    }
    return val.raw || '无修正'
  }

  // LocatedValue 格式
  if (typeof val === 'object' && 'raw_text' in val && val.raw_text) {
    return `原始值: ${val.raw_text}\n计算值: ${val.value?.toFixed(4) || '-'}`
  }

  // 字符串
  if (typeof val === 'string') {
    if (val.includes('/')) {
      const parts = val.split('/')
      if (parts.length === 2) {
        try {
          const a = parseFloat(parts[0])
          const b = parseFloat(parts[1])
          if (b !== 0) {
            return `原始值: ${val}\n计算值: ${(a / b).toFixed(4)}`
          }
        } catch {}
      }
    }
    return val
  }

  return '无修正'
}

// ========== 楼层格式化 ==========

function formatFloor(row: any): string {
  // 优先使用解析后的楼层信息
  if (row.floor_info) {
    const info = row.floor_info
    let result = ''

    if (info.is_duplex && info.current) {
      result = `${info.current}(复式)`
    } else if (info.is_basement && info.current) {
      result = `地下${Math.abs(info.current)}层`
    } else if (info.current !== null && info.current !== undefined) {
      result = String(info.current)
    }

    if (info.total) {
      result += `/${info.total}`
    }

    if (info.is_penthouse) {
      result += '(顶)'
    }

    return result || '-'
  }

  // 回退到原始字段
  const current = row.current_floor
  const total = row.total_floor

  if (current && total) {
    let result = String(current)
    if (current === total) {
      result += `/${total}(顶)`
    } else {
      result += `/${total}`
    }
    return result
  }

  if (current) return String(current)
  if (row.floor) return row.floor

  return '-'
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

.el-table {
  font-size: 13px;
}

.el-table .el-button--link {
  font-size: 13px;
}

/* P 值样式 */
.el-table td .el-tooltip__trigger {
  cursor: help;
}
</style>