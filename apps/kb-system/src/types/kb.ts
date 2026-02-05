// ==================== 知识库相关 ====================

// 知识库统计
export interface KBStats {
  total_reports: number
  total_cases: number
  by_type: Record<string, number>
  vector_index: {
    total_vectors?: number
    is_dirty?: boolean
  }
}

// 报告
export interface Report {
  doc_id: string
  report_type: string
  source_file?: string
  filename?: string
  address?: string
  area?: number
  case_count: number
  create_time?: string
  cases?: Case[]
  metadata?: any
}

// 案例（兼容多种数据结构）
export interface Case {
  case_id: string
  doc_id?: string
  case_id_full?: string
  report_type?: string

  // 地址信息（两种格式）
  address?: string | { value: string }
  district?: string
  street?: string

  // 面积信息（两种格式）
  area?: number
  building_area?: number | { value: number }

  // 价格信息
  price?: number
  transaction_price?: { value: number }
  rental_price?: { value: number }

  // 物业信息
  usage?: string
  build_year?: number
  total_floor?: number
  current_floor?: number
  orientation?: string
  decoration?: string
  structure?: string

  // 修正系数
  transaction_correction?: { value: number }
  market_correction?: { value: number }
  location_correction?: { value: number }
  physical_correction?: { value: number }
  rights_correction?: { value: number }
  adjusted_price?: { value: number }

  // 因素描述
  location_factors?: Record<string, { name: string; description: string }>

  // 搜索相关
  _score?: number

  // 完整数据
  case_data?: any
  create_time?: string
}

// 筛选选项
export interface FilterOptions {
  districts: string[]
  usages: string[]
  report_types: string[]
}

// 批量上传结果
export interface BatchUploadResult {
  success: boolean
  total: number
  success_count: number
  fail_count: number
  results: {
    filename: string
    success: boolean
    error?: string
    doc_id?: string
    report_type?: string
  }[]
}
