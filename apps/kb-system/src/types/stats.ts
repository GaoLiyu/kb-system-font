// ==================== 统计相关 ====================

// 总览统计
export interface OverviewStats {
  success: boolean
  total_reports: number
  total_cases: number
  by_type: Record<string, number>
  vector_index: {
    total_vectors?: number
  }
}

// 报告统计
export interface ReportStats {
  success: boolean
  total: number
  by_type: Record<string, number>
  by_month: Record<string, number>
}

// 案例统计
export interface CaseStats {
  success: boolean
  total: number
  by_type: Record<string, number>
  by_district: Record<string, number>
  by_usage: Record<string, number>
  area_distribution: Record<string, number>
  price_distribution: Record<string, number>
}

// 审查统计
export interface ReviewStats {
  success: boolean
  total_reviews: number
  by_status: Record<string, number>
  by_risk: Record<string, number>
  common_issues: Array<{
    type: string
    count: number
  }>
}
