<template>
  <div class="task-detail-page" v-loading="loading">
    <div class="page-header">
      <el-button @click="router.back()" :icon="ArrowLeft">返回</el-button>
      <h3>审查详情</h3>
      <div class="header-actions" v-if="task?.status === 'completed'">
        <el-dropdown @command="handleExport">
          <el-button type="success">
            <el-icon><Download /></el-icon>
            导出报告
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="simple">审查意见</el-dropdown-item>
              <el-dropdown-item command="full">含原文标注</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>

    <template v-if="task">
      <!-- 基本信息 -->
      <el-card class="info-card">
        <el-descriptions :column="4" border size="small">
          <el-descriptions-item label="文件名">{{ task.filename }}</el-descriptions-item>
          <el-descriptions-item label="审查模式">
            <el-tag :type="task.review_mode === 'full' ? 'primary' : 'info'" size="small">
              {{ task.review_mode === 'full' ? '完整' : '快速' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="statusTagType(task.status)" size="small">
              {{ statusText(task.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="风险等级">
            <el-tag v-if="task.overall_risk" :type="riskTagType(task.overall_risk)">
              {{ task.overall_risk }}
            </el-tag>
            <span v-else>-</span>
          </el-descriptions-item>
          <el-descriptions-item label="校验问题">{{ task.validation_count || 0 }}</el-descriptions-item>
          <el-descriptions-item label="语义问题">{{ task.llm_count || 0 }}</el-descriptions-item>
          <el-descriptions-item label="耗时">{{ calcDuration() }}</el-descriptions-item>
          <el-descriptions-item label="提交时间">{{ formatTime(task.create_time) }}</el-descriptions-item>
        </el-descriptions>
      </el-card>

      <!-- 错误信息 -->
      <el-alert
        v-if="task.status === 'failed'"
        :title="task.error || '审查失败'"
        type="error"
        style="margin-top: 16px;"
        :closable="false"
      />

      <!-- 审查结果 - 左右布局 -->
      <div v-if="task.status === 'completed' && task.result" class="review-content">
        <!-- 左侧：原文预览 -->
        <el-card class="content-panel">
          <template #header>
            <div class="panel-header">
              <span>原文预览</span>
              <el-tag size="small">{{ contentItems.length }} 段</el-tag>
            </div>
          </template>
          <div class="content-scroll" ref="contentScrollRef">
            <div
              v-for="item in contentItems"
              :key="item.index"
              :ref="el => setContentRef(item.index, el)"
              :class="[
                'content-item',
                { 'has-issue': item.has_issue },
                { 'active': activeContentIndex === item.index }
              ]"
              @click="handleContentClick(item)"
            >
              <span class="index">[{{ item.index }}]</span>
              <span class="text">{{ item.text }}</span>
              <el-tag
                v-if="item.issue_ids?.length"
                size="small"
                type="danger"
                class="issue-badge"
              >
                {{ item.issue_ids.length }}
              </el-tag>
            </div>
            <el-empty v-if="contentItems.length === 0" description="无原文内容" />
          </div>
        </el-card>

        <!-- 右侧：问题列表 -->
        <el-card class="issues-panel">
          <template #header>
            <div class="panel-header">
              <span>问题列表</span>
              <el-tag size="small" type="danger">{{ allIssues.length }} 个问题</el-tag>
            </div>
          </template>

          <!-- 问题分类标签 -->
          <div class="issue-tabs">
            <el-radio-group v-model="issueTab" size="small">
              <el-radio-button value="all">
                全部 ({{ allIssues.length }})
              </el-radio-button>
              <el-radio-button value="validation">
                校验 ({{ validationIssues.length }})
              </el-radio-button>
              <el-radio-button value="llm">
                语义 ({{ llmIssues.length }})
              </el-radio-button>
              <el-radio-button value="comparison" v-if="abnormalComparisons.length > 0">
                知识库 ({{ abnormalComparisons.length }})
              </el-radio-button>
            </el-radio-group>
          </div>

          <div class="issues-scroll" ref="issuesScrollRef">
            <div
              v-for="(issue, idx) in filteredIssues"
              :key="idx"
              :ref="el => setIssueRef(idx, el)"
              :class="[
                'issue-item',
                { 'active': activeIssueIndex === idx }
              ]"
              @click="handleIssueClick(issue, idx)"
            >
              <div class="issue-header">
                <el-tag
                  :type="getIssueSeverityType(issue)"
                  size="small"
                >
                  {{ getIssueSeverityText(issue) }}
                </el-tag>
                <el-tag size="small" plain>{{ issue.category || issue.type || '未分类' }}</el-tag>
                <span v-if="issue.paragraph_index !== undefined" class="para-link">
                  段落 [{{ issue.paragraph_index }}]
                </span>
              </div>
              <div class="issue-desc">{{ issue.description }}</div>
              <div v-if="issue.span" class="issue-span">
                <el-icon><ChatLineRound /></el-icon>
                {{ issue.span }}
              </div>
              <div v-if="issue.suggestion" class="issue-suggestion">
                <el-icon><Sunny /></el-icon>
                {{ issue.suggestion }}
              </div>
            </div>
            <el-empty v-if="filteredIssues.length === 0" description="无问题" />
          </div>
        </el-card>
      </div>

      <!-- 公式校验（如果有） -->
      <el-card v-if="task.result?.formula_checks?.length" style="margin-top: 16px;">
        <template #header>
          <div class="panel-header">
            <span>反算验证</span>
            <el-tag size="small" :type="hasFormulaErrors ? 'danger' : 'success'">
              {{ formulaCheckSummary }}
            </el-tag>
          </div>
        </template>

        <el-table :data="task.result.formula_checks" size="small" max-height="300">
          <!-- 案例编号 -->
          <el-table-column prop="case_id" label="案例" width="80" fixed />

          <!-- 【新增】公式名称 -->
          <el-table-column prop="formula_name" label="验证公式" min-width="180">
            <template #default="{ row }">
              <el-tooltip
                :content="getFormulaDescription(row.formula_name)"
                placement="top"
                :disabled="!getFormulaDescription(row.formula_name)"
              >
                <span class="formula-name">{{ row.formula_name }}</span>
              </el-tooltip>
            </template>
          </el-table-column>

          <!-- 【新增】输入参数（展开查看） -->
          <el-table-column label="计算参数" width="100">
            <template #default="{ row }">
              <el-popover
                placement="left"
                :width="400"
                trigger="click"
                v-if="row.inputs || row.formula_detail"
              >
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
                  <el-descriptions :column="2" size="small" border v-if="row.inputs">
                    <el-descriptions-item
                      v-for="(val, key) in row.inputs"
                      :key="key"
                      :label="formatInputLabel(key)"
                    >
                      {{ formatInputValue(val) }}
                    </el-descriptions-item>
                  </el-descriptions>
                </div>
              </el-popover>
              <span v-else class="text-muted">-</span>
            </template>
          </el-table-column>

          <!-- 预期值 -->
          <el-table-column prop="expected" label="理论值" width="120" align="right">
            <template #default="{ row }">
              <span class="number">{{ formatNumber(row.expected) }}</span>
            </template>
          </el-table-column>

          <!-- 实际值 -->
          <el-table-column prop="actual" label="实际值" width="120" align="right">
            <template #default="{ row }">
              <span class="number">{{ formatNumber(row.actual) }}</span>
            </template>
          </el-table-column>

          <!-- 【新增】差异值 -->
          <el-table-column prop="difference" label="差异" width="100" align="right">
            <template #default="{ row }">
              <span :class="['difference', row.is_valid ? '' : 'error']">
                {{ row.difference !== undefined ? formatNumber(row.difference) : formatNumber(Math.abs(row.expected - row.actual)) }}
              </span>
            </template>
          </el-table-column>

          <!-- 结果 -->
          <el-table-column prop="is_valid" label="结果" width="80" align="center" fixed="right">
            <template #default="{ row }">
              <el-tag :type="row.is_valid ? 'success' : 'danger'" size="small">
                {{ row.is_valid ? '通过' : '异常' }}
              </el-tag>
            </template>
          </el-table-column>
        </el-table>

        <!-- 【新增】公式说明 -->
        <div class="formula-legend" v-if="task.result.report_type">
          <el-divider content-position="left">公式说明</el-divider>
          <div class="legend-content">
            <template v-if="task.result.report_type === 'biaozhunfang'">
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

      <!-- 知识库对比异常 -->
      <el-card v-if="abnormalComparisons.length > 0" style="margin-top: 16px;">
        <template #header>
          <div class="panel-header">
            <span>知识库对比异常</span>
            <el-tag size="small" type="warning">{{ abnormalComparisons.length }} 项</el-tag>
          </div>
        </template>
        <el-table :data="abnormalComparisons" size="small" max-height="300">
          <el-table-column prop="item" label="对比项" width="150" />
          <el-table-column prop="current_value" label="当前值" width="100">
            <template #default="{ row }">
              {{ typeof row.current_value === 'number' ? row.current_value.toFixed(2) : row.current_value }}
            </template>
          </el-table-column>
          <el-table-column label="知识库范围" width="180">
            <template #default="{ row }">
              <span class="kb-range">
                {{ row.kb_min?.toFixed(2) }} ~ {{ row.kb_max?.toFixed(2) }}
              </span>
              <span class="kb-avg">(均值: {{ row.kb_avg?.toFixed(2) }})</span>
            </template>
          </el-table-column>
          <el-table-column prop="description" label="说明" min-width="200">
            <template #default="{ row }">
              <el-text type="warning" size="small">{{ row.description }}</el-text>
            </template>
          </el-table-column>
        </el-table>
      </el-card>

      <!-- 相似案例参考 -->
      <el-card v-if="similarCases.length > 0" style="margin-top: 16px;">
        <template #header>
          <div class="panel-header">
            <span>相似案例参考</span>
            <el-tag size="small" type="info">{{ similarCases.length }} 个</el-tag>
          </div>
        </template>
        <el-table :data="similarCases.slice(0, 5)" size="small">
          <el-table-column label="地址" min-width="200">
            <template #default="{ row }">
              {{ row.address?.value || row.address || '-' }}
            </template>
          </el-table-column>
          <el-table-column label="面积(㎡)" width="100">
            <template #default="{ row }">
              {{ row.building_area?.value || row.area || '-' }}
            </template>
          </el-table-column>
          <el-table-column label="价格(元/㎡)" width="120">
            <template #default="{ row }">
              {{ (row.transaction_price?.value || row.rental_price?.value || row.price || 0).toFixed(0) }}
            </template>
          </el-table-column>
          <el-table-column label="区域" width="100">
            <template #default="{ row }">
              {{ row.district || '-' }}
            </template>
          </el-table-column>
        </el-table>
      </el-card>

      <!-- 审查建议 -->
      <el-card v-if="recommendations.length > 0" style="margin-top: 16px;">
        <template #header>
          <span>审查建议</span>
        </template>
        <ul class="recommendations-list">
          <li v-for="(rec, idx) in recommendations" :key="idx">
            <el-icon><Sunny /></el-icon>
            {{ rec }}
          </li>
        </ul>
      </el-card>
    </template>

    <el-empty v-else-if="!loading" description="任务不存在" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, Download, ChatLineRound, Sunny, View } from '@element-plus/icons-vue'
import { getTaskStatus, exportTaskResult, downloadBlob } from '@/api'
import type { ReviewTask } from '@/types'
import { ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const task = ref<ReviewTask | null>(null)

// 当前激活的索引
const activeContentIndex = ref<number | null>(null)
const activeIssueIndex = ref<number | null>(null)

// 问题分类标签
const issueTab = ref('all')

// refs
const contentScrollRef = ref<HTMLElement | null>(null)
const issuesScrollRef = ref<HTMLElement | null>(null)
const contentRefs = ref<Record<number, HTMLElement | null>>({})
const issueRefs = ref<Record<number, HTMLElement | null>>({})

function setContentRef(index: number, el: any) {
  contentRefs.value[index] = el
}

function setIssueRef(index: number, el: any) {
  issueRefs.value[index] = el
}

// 计算属性
const contentItems = computed(() => {
  if (!task.value?.result?.document_content?.contents) return []
  return task.value.result.document_content.contents.filter(
    (item: any) => item.type === 'paragraph' && item.text
  )
})

const validationIssues = computed(() => {
  return (task.value?.result?.validation_issues || []).map((issue: any, idx: number) => ({
    ...issue,
    _type: 'validation',
    _idx: idx,
  }))
})

const llmIssues = computed(() => {
  return (task.value?.result?.llm_issues || []).map((issue: any, idx: number) => ({
    ...issue,
    _type: 'llm',
    _idx: idx,
  }))
})

const comparisons = computed(() => {
  return task.value?.result?.comparisons || []
})

const abnormalComparisons = computed(() => {
  return comparisons.value.filter((item: any) => item.is_abnormal)
})

const similarCases = computed(() => {
  return task.value?.result?.similar_cases || []
})

const recommendations = computed(() => {
  return task.value?.result?.recommendations || []
})

// 是否有公式错误
const hasFormulaErrors = computed(() => {
  const checks = task.value?.result?.formula_checks || []
  return checks.some((c: any) => !c.is_valid)
})

// 公式校验汇总
const formulaCheckSummary = computed(() => {
  const checks = task.value?.result?.formula_checks || []
  const total = checks.length
  const passed = checks.filter((c: any) => c.is_valid).length
  const failed = total - passed
  if (failed === 0) {
    return `全部通过 (${total}项)`
  }
  return `${failed}项异常 / ${total}项`
})

// 格式化数字
function formatNumber(num: any): string {
  if (num === undefined || num === null) return '-'
  if (typeof num !== 'number') return String(num)
  // 大于1000的数字加千分位
  if (Math.abs(num) >= 1000) {
    return num.toLocaleString('zh-CN', { maximumFractionDigits: 2 })
  }
  return num.toFixed(4).replace(/\\.?0+$/, '')
}

// 获取公式描述
function getFormulaDescription(name: string): string {
  const descriptions: Record<string, string> = {
    '比准价格(VsxP1xP2xP3xP4-Va-Vb)': '标准房比较法核心公式：可比实例成交价经过四项修正后减去附属物和装修价值',
    '修正后单价': '涉执/租金报告修正公式：成交价乘以五项修正系数',
    'P3实体修正': 'P3由结构、楼层、朝向、成新、东西至五个子系数相乘得出',
  }
  return descriptions[name] || ''
}

// 格式化输入参数标签
function formatInputLabel(key: string): string {
  const labels: Record<string, string> = {
    vs: 'Vs(成交价)',
    p1: 'P1(交易情况)',
    p2: 'P2(交易日期)',
    p3: 'P3(实体修正)',
    p4: 'P4(区位修正)',
    va: 'Va(附属物)',
    vb: 'Vb(装修)',
    sf: '结构系数',
    ff: '楼层系数',
    of: '朝向系数',
    af: '成新系数',
    ew: '东西至修正',
    tc: '交易情况',
    mc: '市场状况',
    lc: '区位修正',
    pc: '实物修正',
    rc: '权益修正',
    trans: '成交价',
  }
  return labels[key] || key
}

// 格式化输入参数值
function formatInputValue(val: any): string {
  if (val === undefined || val === null) return '-'
  if (typeof val === 'number') {
    return formatNumber(val)
  }
  // 如果是对象（如 {raw: '108/103', value: 1.0485}）
  if (typeof val === 'object' && val.raw) {
    return val.value ? `${val.raw} (=${val.value.toFixed(4)})` : val.raw
  }
  return String(val)
}

const allIssues = computed(() => {
  return [...validationIssues.value, ...llmIssues.value]
})

const filteredIssues = computed(() => {
  if (issueTab.value === 'validation') return validationIssues.value
  if (issueTab.value === 'llm') return llmIssues.value
  if (issueTab.value === 'comparison') {
    // 将 comparisons 转换为类似 issue 的格式
    return abnormalComparisons.value.map((item: any, idx: number) => ({
      _type: 'comparison',
      _idx: idx,
      level: 'warning',
      category: 'kb_comparison',
      type: '知识库对比',
      severity: 'warning',
      description: item.description || `${item.item}: ${item.current_value}，知识库范围${item.kb_min?.toFixed(2)} ~ ${item.kb_max?.toFixed(2)}`,
    }))
  }
  return allIssues.value
})

// 加载任务
async function loadTask() {
  const taskId = route.params.taskId as string
  if (!taskId) return

  loading.value = true
  try {
    const res = await getTaskStatus(taskId)
    task.value = res
  } catch (error: any) {
    ElMessage.error(error.message || '加载失败')
  } finally {
    loading.value = false
  }
}

// 点击原文
function handleContentClick(item: any) {
  activeContentIndex.value = item.index

  // 查找关联的问题
  if (item.issue_ids?.length) {
    const issueIdx = item.issue_ids[0]
    scrollToIssue(issueIdx)
  }
}

// 点击问题
function handleIssueClick(issue: any, idx: number) {
  activeIssueIndex.value = idx

  // 跳转到关联的段落
  if (issue.paragraph_index !== undefined) {
    scrollToContent(issue.paragraph_index)
  }
}

// 滚动到指定原文
function scrollToContent(index: number) {
  activeContentIndex.value = index
  nextTick(() => {
    const el = contentRefs.value[index]
    if (el && contentScrollRef.value) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  })
}

// 滚动到指定问题
function scrollToIssue(idx: number) {
  activeIssueIndex.value = idx
  nextTick(() => {
    const el = issueRefs.value[idx]
    if (el && issuesScrollRef.value) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  })
}

// 导出
async function handleExport(command: string) {
  if (!task.value) return

  try {
    ElMessage.info('正在生成报告...')
    const includeOriginal = command === 'full'
    const blob = await exportTaskResult(task.value.task_id, includeOriginal)

    const filename = task.value.filename.replace(/\.[^/.]+$/, '') + '_审查报告.docx'
    downloadBlob(blob, filename)

    ElMessage.success('导出成功')
  } catch (error: any) {
    ElMessage.error(error.message || '导出失败')
  }
}

// 工具函数
function statusTagType(status: string) {
  const map: Record<string, string> = { pending: 'info', running: 'warning', completed: 'success', failed: 'danger' }
  return map[status] || 'info'
}

function statusText(status: string) {
  const map: Record<string, string> = { pending: '待处理', running: '处理中', completed: '已完成', failed: '失败' }
  return map[status] || status
}

function riskTagType(risk: string) {
  if (risk === '高风险') return 'danger'
  if (risk === '中风险') return 'warning'
  return 'success'
}

function getIssueSeverityType(issue: any) {
  if (issue._type === 'validation') {
    return issue.level === 'error' ? 'danger' : 'warning'
  }
  if (issue.severity === 'critical') return 'danger'
  if (issue.severity === 'major') return 'warning'
  return 'info'
}

function getIssueSeverityText(issue: any) {
  if (issue._type === 'validation') {
    return issue.level === 'error' ? '错误' : '警告'
  }
  const map: Record<string, string> = { critical: '严重', major: '重要', minor: '轻微' }
  return map[issue.severity] || issue.severity || '未知'
}

function formatTime(time?: string) {
  if (!time) return '-'
  return time.replace('T', ' ').slice(0, 19)
}

function calcDuration() {
  if (!task.value?.start_time || !task.value?.end_time) return '-'
  const start = new Date(task.value.start_time).getTime()
  const end = new Date(task.value.end_time).getTime()
  const seconds = Math.round((end - start) / 1000)
  return seconds < 60 ? `${seconds}秒` : `${Math.floor(seconds / 60)}分${seconds % 60}秒`
}

onMounted(() => {
  loadTask()
})
</script>

<style scoped>
.task-detail-page {
  padding: 20px;
}

.page-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
}

.page-header h3 {
  margin: 0;
  flex: 1;
}

.info-card {
  margin-bottom: 16px;
}

/* 左右布局 */
.review-content {
  display: flex;
  gap: 16px;
  height: calc(100vh - 280px);
  min-height: 500px;
}

.content-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.issues-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.issue-tabs {
  margin-bottom: 12px;
}

/* 滚动区域 */
.content-scroll,
.issues-scroll {
  flex: 1;
  overflow-y: auto;
  padding-right: 8px;
}

/* 原文项 */
.content-item {
  padding: 8px 12px;
  margin-bottom: 4px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
  line-height: 1.6;
  font-size: 13px;
}

.content-item:hover {
  background: #f5f7fa;
}

.content-item.has-issue {
  background: #fef0f0;
  border-left: 3px solid #f56c6c;
}

.content-item.active {
  background: #ecf5ff;
  border-left: 3px solid #409eff;
}

.content-item .index {
  color: #909399;
  margin-right: 8px;
  font-size: 12px;
}

.content-item .issue-badge {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
}

/* 问题项 */
.issue-item {
  padding: 12px;
  margin-bottom: 8px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.issue-item:hover {
  border-color: #409eff;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.1);
}

.issue-item.active {
  border-color: #409eff;
  background: #ecf5ff;
}

.issue-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.issue-header .para-link {
  margin-left: auto;
  font-size: 12px;
  color: #409eff;
}

.issue-desc {
  font-size: 13px;
  color: #303133;
  line-height: 1.5;
}

.issue-span {
  margin-top: 8px;
  padding: 8px;
  background: #f5f7fa;
  border-radius: 4px;
  font-size: 12px;
  color: #606266;
  display: flex;
  align-items: flex-start;
  gap: 4px;
}

.issue-suggestion {
  margin-top: 8px;
  font-size: 12px;
  color: #67c23a;
  display: flex;
  align-items: flex-start;
  gap: 4px;
}

/* 知识库对比样式 */
.kb-range {
  color: #409eff;
  font-family: monospace;
}

.kb-avg {
  color: #909399;
  font-size: 12px;
  margin-left: 8px;
}

/* 建议列表样式 */
.recommendations-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.recommendations-list li {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 0;
  color: #67c23a;
  border-bottom: 1px dashed #ebeef5;
}

.recommendations-list li:last-child {
  border-bottom: none;
}

.recommendations-list .el-icon {
  color: #e6a23c;
}

/* 滚动条美化 */
.content-scroll::-webkit-scrollbar,
.issues-scroll::-webkit-scrollbar {
  width: 6px;
}

.content-scroll::-webkit-scrollbar-thumb,
.issues-scroll::-webkit-scrollbar-thumb {
  background: #dcdfe6;
  border-radius: 3px;
}

.content-scroll::-webkit-scrollbar-thumb:hover,
.issues-scroll::-webkit-scrollbar-thumb:hover {
  background: #c0c4cc;
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