// 通用 API 响应类型

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  timestamp?: string
  error?: string
}

export interface PaginatedResponse<T = any> extends BaseResponse {
  data: T[]
  pagination: PaginationMeta
}

export interface ErrorResponse extends BaseResponse {
  success: false
  error_code: string
  detail?: any
}

// 搜索请求
export interface SearchRequest {
  query?: string
  report_type?: string
  district?: string
  usage?: string
  top_k?: number
}

export interface BaseResponse {
  success: boolean
  message: string
  timestamp?: string
}

export interface DataResponse<T = any> extends BaseResponse {
  data?: T
}

export interface PaginationMeta {
  total: number
  page: number
  page_size: number
  total_pages: number
}
