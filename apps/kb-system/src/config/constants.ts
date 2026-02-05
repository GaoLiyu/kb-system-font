/**
 * 应用常量定义
 */

// ==================== 任务状态 ====================

export const TASK_STATUS = {
  PENDING: 'pending',
  RUNNING: 'running',
  COMPLETED: 'completed',
  FAILED: 'failed',
} as const

export type TaskStatus = (typeof TASK_STATUS)[keyof typeof TASK_STATUS]

export const TASK_STATUS_TEXT: Record<string, string> = {
  pending: '待处理',
  running: '处理中',
  completed: '已完成',
  failed: '失败',
}

export const TASK_STATUS_TYPE: Record<string, string> = {
  pending: 'info',
  running: 'warning',
  completed: 'success',
  failed: 'danger',
}

// ==================== 风险等级 ====================

export const RISK_LEVEL = {
  HIGH: '高风险',
  MEDIUM: '中风险',
  LOW: '低风险',
} as const

export type RiskLevel = (typeof RISK_LEVEL)[keyof typeof RISK_LEVEL]

export const RISK_LEVEL_TYPE: Record<string, string> = {
  高风险: 'danger',
  中风险: 'warning',
  低风险: 'success',
}

// ==================== 问题严重程度 ====================

export const ISSUE_SEVERITY = {
  CRITICAL: 'critical',
  MAJOR: 'major',
  MINOR: 'minor',
  ERROR: 'error',
  WARNING: 'warning',
} as const

export const ISSUE_SEVERITY_TEXT: Record<string, string> = {
  critical: '严重',
  major: '重要',
  minor: '轻微',
  error: '错误',
  warning: '警告',
}

export const ISSUE_SEVERITY_TYPE: Record<string, string> = {
  critical: 'danger',
  major: 'warning',
  minor: 'info',
  error: 'danger',
  warning: 'warning',
}

// ==================== 用户角色 ====================

export const USER_ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  REVIEWER: 'reviewer',
  EDITOR: 'editor',
  VIEWER: 'viewer',
} as const

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES]

// 角色定义（与后端 ROLE_DEFINITIONS 对应）
export interface RoleDefinition {
  name: string
  description: string
  permissions: string[]
}

export const ROLE_DEFINITIONS: Record<string, RoleDefinition> = {
  super_admin: {
    name: '超级管理员',
    description: '拥有所有权限',
    permissions: ['*'], // 所有权限
  },
  admin: {
    name: '管理员',
    description: '组织管理员，可管理本组织数据',
    permissions: [
      'kb:view',
      'kb:upload',
      'kb:delete',
      'kb:rebuild',
      'search:case',
      'review:submit',
      'review:view',
      'review:delete',
      'review:export',
      'generate:suggest',
      'stats:view',
      'system:audit',
      'system:user',
    ],
  },
  reviewer: {
    name: '审查员',
    description: '可以提交和查看审查任务',
    permissions: ['review:submit', 'review:view', 'review:export', 'stats:view'],
  },
  editor: {
    name: '编辑员',
    description: '可以上传和编辑报告',
    permissions: ['kb:view', 'kb:upload', 'search:case', 'generate:suggest', 'stats:view'],
  },
  viewer: {
    name: '只读用户',
    description: '只能查看数据',
    permissions: ['kb:view', 'search:case', 'stats:view'],
  },
}

// 便捷获取函数
export function getRoleLabel(role: string): string {
  return ROLE_DEFINITIONS[role]?.name || role
}

export function getRoleDescription(role: string): string {
  return ROLE_DEFINITIONS[role]?.description || ''
}

export function getRolePermissions(role: string): string[] {
  return ROLE_DEFINITIONS[role]?.permissions || []
}

export const ROLE_TAG_TYPES: Record<string, string> = {
  super_admin: 'danger',
  admin: 'warning',
  reviewer: 'success',
  editor: 'primary',
  viewer: 'info',
}

// ==================== 用户状态 ====================

export const USER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  LOCKED: 'locked',
} as const

export type UserStatus = (typeof USER_STATUS)[keyof typeof USER_STATUS]

export const USER_STATUS_TEXT: Record<string, string> = {
  active: '正常',
  inactive: '禁用',
  locked: '锁定',
}

export const USER_STATUS_TYPE: Record<string, string> = {
  active: 'success',
  inactive: 'info',
  locked: 'danger',
}

// ==================== 审计日志 ====================

export const AUDIT_ACTIONS = [
  { value: 'create', label: '创建' },
  { value: 'read', label: '查看' },
  { value: 'update', label: '更新' },
  { value: 'delete', label: '删除' },
  { value: 'upload', label: '上传' },
  { value: 'download', label: '下载' },
  { value: 'export', label: '导出' },
  { value: 'search', label: '搜索' },
  { value: 'review', label: '审查' },
  { value: 'login', label: '登录' },
  { value: 'logout', label: '登出' },
] as const

export const AUDIT_ACTION_TEXT: Record<string, string> = {
  create: '创建',
  read: '查看',
  update: '更新',
  delete: '删除',
  upload: '上传',
  download: '下载',
  export: '导出',
  search: '搜索',
  review: '审查',
  login: '登录',
  logout: '登出',
}

export const AUDIT_ACTION_TYPE: Record<string, string> = {
  create: 'success',
  delete: 'danger',
  update: 'warning',
  upload: 'success',
  download: 'info',
  export: 'info',
  review: 'primary',
  login: 'success',
  logout: 'info',
}

export const RESOURCE_TYPES = [
  { value: 'report', label: '报告' },
  { value: 'case', label: '案例' },
  { value: 'review_task', label: '审查任务' },
  { value: 'knowledge_base', label: '知识库' },
  { value: 'vector_index', label: '向量索引' },
  { value: 'user', label: '用户' },
  { value: 'system', label: '系统' },
] as const

export const RESOURCE_TYPE_TEXT: Record<string, string> = {
  report: '报告',
  case: '案例',
  review_task: '审查任务',
  knowledge_base: '知识库',
  vector_index: '向量索引',
  user: '用户',
  system: '系统',
}

// ==================== 审查模式 ====================

export const REVIEW_MODE = {
  FULL: 'full',
  QUICK: 'quick',
} as const

export const REVIEW_MODE_TEXT: Record<string, string> = {
  full: '完整',
  quick: '快速',
}

// ==================== 公式相关 ====================

export const FORMULA_DESCRIPTIONS: Record<string, string> = {
  '比准价格(VsxP1xP2xP3xP4-Va-Vb)':
    '标准房比较法核心公式：可比实例成交价经过四项修正后减去附属物和装修价值',
  修正后单价: '涉执/租金报告修正公式：成交价乘以五项修正系数',
  P3实体修正: 'P3由结构、楼层、朝向、成新、东西至五个子系数相乘得出',
}

export const FORMULA_INPUT_LABELS: Record<string, string> = {
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
