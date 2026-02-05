// 通用 API 响应类型
import {Case} from "@/types/kb";
import {ReviewTask} from "@/types/review";

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

export interface PaginatedResponse<T> {
  success: boolean
  total: number
  page: number
  page_size: number
  total_pages: number
  items: T[]
}

// 分页响应
export interface PaginatedResponse<T> {
  success: boolean
  total: number
  page: number
  page_size: number
  total_pages: number
  items: T[]
}

// 报告列表响应
export interface ReportListResponse {
  success: boolean
  total: number
  page: number
  page_size: number
  total_pages: number
  reports: Report[]
}

// 案例列表响应
export interface CaseListResponse {
  success: boolean
  total: number
  page: number
  page_size: number
  total_pages: number
  cases: Case[]
}

// 上传响应
export interface UploadResponse {
  success: boolean
  doc_id: string
  message?: string
  report_type: string
  address?: string
  case_count?: number
  error?: string
}

// 搜索请求
export interface SearchRequest {
  query?: string
  report_type?: string
  district?: string
  usage?: string
  top_k?: number
}

// 任务列表响应
export interface ReviewTaskListResponse {
  success: boolean
  tasks: ReviewTask[]
  stats: {
    total: number
    by_status: Record<string, number>
    by_risk: Record<string, number>
  }
}
