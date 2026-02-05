// ==================== 审查相关 ====================

// 审查结果
import {Case} from "@/types/kb";

export interface ReviewResult {
  success: boolean
  overall_risk: string
  summary: string
  validation_issues: Array<{
    level: string
    category: string
    description: string
  }>
  formula_checks: Array<{
    case_id: string
    expected: number
    actual: number
    is_valid: boolean
  }>
  llm_issues: Array<{
    type: string
    severity: string
    description: string
    suggestion: string
    paragraph_index?: number
    span?: string
  }>
  similar_cases?: Case[]
  recommendations?: string[]
  error?: string
}

// 审查任务
export interface ReviewTask {
  task_id: string
  filename: string
  file_path?: string
  review_mode: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  overall_risk?: string
  issue_count: number
  validation_count?: number
  llm_count?: number
  result?: {
    document_content?: DocumentContent
    validation_issues?: Array<{
      level: string
      category: string
      description: string
    }>
    formula_checks?: Array<{
      case_id: string
      expected: number
      actual: number
      is_valid: boolean
    }>
    llm_issues?: Array<{
      type: string
      severity: string
      description: string
      suggestion: string
      paragraph_index?: number
      span?: string
    }>
    comparisons?: ComparisonResult[]
    similar_cases?: SimilarCase[]
    recommendations?: string[]
    extraction?: any
  }
  error?: string
  create_time: string
  start_time?: string
  end_time?: string
}


// 文档内容项
export interface ContentItem {
  index: number
  type: 'paragraph' | 'table'
  text?: string
  rows?: string[][]
  has_issue: boolean
  issue_ids: number[]
}

// 文档内容
export interface DocumentContent {
  filename: string
  paragraph_count: number
  table_count: number
  contents: ContentItem[]
}

// 审查详情结果（带原文）
export interface ReviewDetailResult extends ReviewResult {
  document_content: DocumentContent
}

// 批量审查结果
export interface BatchReviewResult {
  success: boolean
  total: number
  success_count: number
  fail_count: number
  high_risk_count: number
  medium_risk_count: number
  low_risk_count: number
  summary: string
  results: {
    filename: string
    success: boolean
    error?: string
    overall_risk?: string
    issue_count: number
    validation_count?: number
    llm_count?: number
  }[]
}

// 知识库对比结果
export interface ComparisonResult {
  item: string
  current_value: number
  kb_min: number
  kb_max: number
  kb_avg: number
  is_abnormal: boolean
  description: string
}

// 相似案例
export interface SimilarCase {
  case_id: string
  address: string
  area: number
  price: number
  district?: string
  usage?: string
  score?: number
}

// 审查任务
export interface ReviewTask {
  task_id: string
  filename: string
  file_path?: string
  review_mode: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  overall_risk?: string
  issue_count: number
  validation_count?: number
  llm_count?: number
  result?: {
    document_content?: DocumentContent
    validation_issues?: Array<{
      level: string
      category: string
      description: string
    }>
    formula_checks?: Array<{
      case_id: string
      expected: number
      actual: number
      is_valid: boolean
    }>
    llm_issues?: Array<{
      type: string
      severity: string
      description: string
      suggestion: string
      paragraph_index?: number
      span?: string
    }>
    comparisons?: ComparisonResult[]
    similar_cases?: SimilarCase[]
    recommendations?: string[]
    extraction?: any
  }
  error?: string
  create_time: string
  start_time?: string
  end_time?: string
}
