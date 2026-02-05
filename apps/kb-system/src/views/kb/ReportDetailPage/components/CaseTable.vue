<template>
  <div>
    <h4 style="margin: 24px 0 16px">关联案例 ({{ cases?.length || 0 }})</h4>

    <el-table :data="cases || []" stripe size="small">
      <el-table-column prop="case_id" label="编号" width="80" fixed />

      <el-table-column label="地址" min-width="180">
        <template #default="{ row }">
          <el-button type="primary" link @click="$emit('view-case', row)">
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
      <template v-if="reportType !== 'biaozhunfang'">
        <el-table-column label="交易" width="70" align="center">
          <template #default="{ row }">{{ formatCorrection(row.transaction_correction) }}</template>
        </el-table-column>
        <el-table-column label="市场" width="70" align="center">
          <template #default="{ row }">{{ formatCorrection(row.market_correction) }}</template>
        </el-table-column>
        <el-table-column label="区位" width="70" align="center">
          <template #default="{ row }">{{ formatCorrection(row.location_correction) }}</template>
        </el-table-column>
        <el-table-column label="实物" width="70" align="center">
          <template #default="{ row }">{{ formatCorrection(row.physical_correction) }}</template>
        </el-table-column>
        <el-table-column label="权益" width="70" align="center">
          <template #default="{ row }">{{ formatCorrection(row.rights_correction) }}</template>
        </el-table-column>
        <el-table-column label="修正后" width="100" align="right">
          <template #default="{ row }">{{ formatPrice(row.adjusted_price) }}</template>
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
          <template #default="{ row }">{{ formatPrice(row.final_price) }}</template>
        </el-table-column>
      </template>

      <el-table-column prop="usage" label="用途" width="70" />
      <el-table-column label="楼层" width="90">
        <template #default="{ row }">{{ formatFloor(row) }}</template>
      </el-table-column>
    </el-table>

    <el-empty v-if="cases?.length === 0" description="暂无案例" />
  </div>
</template>

<script setup lang="ts">
defineProps<{
  cases: any[]
  reportType: string
}>()

defineEmits<{
  'view-case': [row: any]
}>()

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

function formatCorrection(val: any): string {
  if (!val) return '-'
  if (typeof val === 'object' && 'value' in val) {
    const v = val.value
    if (!v) return '-'
    return v.toFixed(4)
  }
  if (typeof val === 'number') return val.toFixed(4)
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

function formatPValue(val: any): string {
  if (!val) return '1.00'
  if (typeof val === 'object' && 'raw' in val) {
    if (val.raw === '不修正' || val.raw === '无修正') return '1.00'
    if (val.value) return val.value.toFixed(4)
    return val.raw
  }
  if (typeof val === 'object' && 'value' in val) {
    const v = val.value
    if (!v) return '1.00'
    return v.toFixed(4)
  }
  if (typeof val === 'string') {
    if (val === '不修正' || val === '无修正' || val === '-') return '1.00'
    if (val.includes('/')) {
      const parts = val.split('/')
      if (parts.length === 2) {
        try {
          const a = parseFloat(parts[0])
          const b = parseFloat(parts[1])
          if (b !== 0) return (a / b).toFixed(4)
        } catch {}
      }
    }
    return val
  }
  if (typeof val === 'number') return val.toFixed(4)
  return '1.00'
}

function getPValueTooltip(val: any): string {
  if (!val) return '无修正'
  if (typeof val === 'object' && 'raw' in val) {
    if (val.raw && val.value) return `原始值: ${val.raw}\n计算值: ${val.value.toFixed(4)}`
    return val.raw || '无修正'
  }
  if (typeof val === 'object' && 'raw_text' in val && val.raw_text) {
    return `原始值: ${val.raw_text}\n计算值: ${val.value?.toFixed(4) || '-'}`
  }
  if (typeof val === 'string') {
    if (val.includes('/')) {
      const parts = val.split('/')
      if (parts.length === 2) {
        try {
          const a = parseFloat(parts[0])
          const b = parseFloat(parts[1])
          if (b !== 0) return `原始值: ${val}\n计算值: ${(a / b).toFixed(4)}`
        } catch {}
      }
    }
    return val
  }
  return '无修正'
}

function formatFloor(row: any): string {
  if (row.floor_info) {
    const info = row.floor_info
    let result = ''
    if (info.is_duplex && info.current) result = `${info.current}(复式)`
    else if (info.is_basement && info.current) result = `地下${Math.abs(info.current)}层`
    else if (info.current !== null && info.current !== undefined) result = String(info.current)
    if (info.total) result += `/${info.total}`
    if (info.is_penthouse) result += '(顶)'
    return result || '-'
  }
  const current = row.current_floor
  const total = row.total_floor
  if (current && total) {
    let result = String(current)
    if (current === total) result += `/${total}(顶)`
    else result += `/${total}`
    return result
  }
  if (current) return String(current)
  if (row.floor) return row.floor
  return '-'
}
</script>
