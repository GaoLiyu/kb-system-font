<template>
  <el-card v-if="formulaChecks.length" style="margin-top: 16px">
    <template #header>
      <div class="panel-header">
        <span>反算验证</span>
        <el-tag size="small" :type="hasErrors ? 'danger' : 'success'">
          {{ summary }}
        </el-tag>
      </div>
    </template>

    <el-table :data="formulaChecks" size="small" max-height="300">
      <el-table-column prop="case_id" label="案例" width="80" fixed />

      <el-table-column prop="formula_name" label="验证公式" min-width="180">
        <template #default="{ row }">
          <el-tooltip :content="getFormulaDescription(row.formula_name)" placement="top" :disabled="!getFormulaDescription(row.formula_name)">
            <span class="formula-name">{{ row.formula_name }}</span>
          </el-tooltip>
        </template>
      </el-table-column>

      <el-table-column label="计算参数" width="100">
        <template #default="{ row }">
          <el-popover v-if="row.inputs || row.formula_detail" placement="left" :width="400" trigger="click">
            <template #reference>
              <el-button type="primary" link size="small">
                <el-icon><View /></el-icon>
                查看
              </el-button>
            </template>
            <div class="formula-detail">
              <h4>计算详情</h4>
              <div v-if="row.formula_detail" class="formula-expression">
                {{ row.formula_detail }}
              </div>
              <el-descriptions v-if="row.inputs" :column="2" size="small" border>
                <el-descriptions-item v-for="(val, key) in row.inputs" :key="key" :label="formatInputLabel(key as string)">
                  {{ formatInputValue(val) }}
                </el-descriptions-item>
              </el-descriptions>
            </div>
          </el-popover>
          <span v-else class="text-muted">-</span>
        </template>
      </el-table-column>

      <el-table-column prop="expected" label="理论值" width="120" align="right">
        <template #default="{ row }">
          <span class="number">{{ formatNumber(row.expected) }}</span>
        </template>
      </el-table-column>

      <el-table-column prop="actual" label="实际值" width="120" align="right">
        <template #default="{ row }">
          <span class="number">{{ formatNumber(row.actual) }}</span>
        </template>
      </el-table-column>

      <el-table-column prop="difference" label="差异" width="100" align="right">
        <template #default="{ row }">
          <span :class="['difference', row.is_valid ? '' : 'error']">
            {{ row.difference !== undefined ? formatNumber(row.difference) : formatNumber(Math.abs(row.expected - row.actual)) }}
          </span>
        </template>
      </el-table-column>

      <el-table-column prop="is_valid" label="结果" width="80" align="center" fixed="right">
        <template #default="{ row }">
          <el-tag :type="row.is_valid ? 'success' : 'danger'" size="small">
            {{ row.is_valid ? '通过' : '异常' }}
          </el-tag>
        </template>
      </el-table-column>
    </el-table>

    <!-- 公式说明 -->
    <div v-if="reportType" class="formula-legend">
      <el-divider content-position="left">公式说明</el-divider>
      <div class="legend-content">
        <template v-if="reportType === 'biaozhunfang'">
          <p><strong>比准价格</strong> = Vs × P1 × P2 × P3 × P4 - Va - Vb</p>
          <p class="legend-desc">其中：Vs=可比实例成交价，P1=交易情况修正，P2=交易日期修正，P3=实体因素修正，P4=区位状况修正，Va=附属物单价，Vb=装修重置价</p>
          <p><strong>P3(实体因素)</strong> = 结构系数 × 楼层系数 × 朝向系数 × 成新系数 × 东西至修正</p>
        </template>
        <template v-else>
          <p><strong>修正后单价</strong> = 成交价 × 交易情况 × 市场状况 × 区位修正 × 实物修正 × 权益修正</p>
        </template>
      </div>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { View } from '@element-plus/icons-vue'

interface FormulaCheck {
  case_id: string
  formula_name: string
  expected: number
  actual: number
  difference?: number
  is_valid: boolean
  inputs?: Record<string, any>
  formula_detail?: string
}

const props = defineProps<{
  formulaChecks: FormulaCheck[]
  reportType?: string
}>()

const hasErrors = computed(() => props.formulaChecks.some((c) => !c.is_valid))

const summary = computed(() => {
  const total = props.formulaChecks.length
  const passed = props.formulaChecks.filter((c) => c.is_valid).length
  const failed = total - passed
  if (failed === 0) return `全部通过 (${total}项)`
  return `${failed}项异常 / ${total}项`
})

const formulaDescriptions: Record<string, string> = {
  '比准价格(VsxP1xP2xP3xP4-Va-Vb)': '标准房比较法核心公式：可比实例成交价经过四项修正后减去附属物和装修价值',
  修正后单价: '涉执/租金报告修正公式：成交价乘以五项修正系数',
  P3实体修正: 'P3由结构、楼层、朝向、成新、东西至五个子系数相乘得出',
}

const inputLabels: Record<string, string> = {
  vs: 'Vs(成交价)', p1: 'P1(交易情况)', p2: 'P2(交易日期)', p3: 'P3(实体修正)', p4: 'P4(区位修正)',
  va: 'Va(附属物)', vb: 'Vb(装修)', sf: '结构系数', ff: '楼层系数', of: '朝向系数',
  af: '成新系数', ew: '东西至修正', tc: '交易情况', mc: '市场状况', lc: '区位修正',
  pc: '实物修正', rc: '权益修正', trans: '成交价',
}

function getFormulaDescription(name: string): string {
  return formulaDescriptions[name] || ''
}

function formatInputLabel(key: string): string {
  return inputLabels[key] || key
}

function formatInputValue(val: any): string {
  if (val === undefined || val === null) return '-'
  if (typeof val === 'number') return formatNumber(val)
  if (typeof val === 'object' && val.raw) {
    return val.value ? `${val.raw} (=${val.value.toFixed(4)})` : val.raw
  }
  return String(val)
}

function formatNumber(num: any): string {
  if (num === undefined || num === null) return '-'
  if (typeof num !== 'number') return String(num)
  if (Math.abs(num) >= 1000) {
    return num.toLocaleString('zh-CN', { maximumFractionDigits: 2 })
  }
  return num.toFixed(4).replace(/\.?0+$/, '')
}
</script>

<style scoped>
.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.formula-name {
  font-family: 'Consolas', 'Monaco', monospace;
  color: #409eff;
}

.formula-detail {
  padding: 8px;
}

.formula-detail h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: #303133;
}

.formula-expression {
  background: #f5f7fa;
  padding: 8px 12px;
  border-radius: 4px;
  font-family: 'Consolas', 'Monaco', monospace;
  margin-bottom: 12px;
  word-break: break-all;
}

.number {
  font-family: 'Consolas', 'Monaco', monospace;
}

.difference {
  font-family: 'Consolas', 'Monaco', monospace;
}

.difference.error {
  color: #f56c6c;
  font-weight: 500;
}

.text-muted {
  color: #909399;
}

.formula-legend {
  margin-top: 16px;
}

.legend-content {
  font-size: 13px;
  color: #606266;
  line-height: 1.8;
}

.legend-content p {
  margin: 4px 0;
}

.legend-desc {
  color: #909399;
  font-size: 12px;
}
</style>
