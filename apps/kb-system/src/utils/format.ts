/**
 * 格式化工具函数
 */

/**
 * 格式化日期时间
 * @param value 日期字符串或Date对象
 * @param format 格式化模板，默认 'YYYY-MM-DD HH:mm:ss'
 */
export function formatDateTime(value: string | Date | null | undefined): string {
  if (!value) return '-'
  const date = typeof value === 'string' ? new Date(value) : value
  if (isNaN(date.getTime())) return '-'
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })
}

/**
 * 格式化日期
 */
export function formatDate(value: string | Date | null | undefined): string {
  if (!value) return '-'
  const date = typeof value === 'string' ? new Date(value) : value
  if (isNaN(date.getTime())) return '-'
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

/**
 * 格式化时间（简洁版，去除T和毫秒）
 */
export function formatTime(value: string | null | undefined): string {
  if (!value) return '-'
  return value.replace('T', ' ').slice(0, 19)
}

/**
 * 格式化数字（带千分位）
 */
export function formatNumber(
  value: number | null | undefined,
  options: { decimals?: number; fallback?: string } = {}
): string {
  const { decimals = 2, fallback = '-' } = options
  if (value === null || value === undefined) return fallback
  if (typeof value !== 'number' || isNaN(value)) return String(value)

  // 大于1000的数字加千分位
  if (Math.abs(value) >= 1000) {
    return value.toLocaleString('zh-CN', { maximumFractionDigits: decimals })
  }

  // 小数点处理，去除末尾的0
  return value.toFixed(decimals).replace(/\.?0+$/, '')
}

/**
 * 格式化金额
 */
export function formatMoney(value: number | null | undefined): string {
  if (value === null || value === undefined) return '-'
  return `¥${formatNumber(value)}`
}

/**
 * 格式化面积
 */
export function formatArea(value: number | null | undefined): string {
  if (value === null || value === undefined) return '-'
  return `${formatNumber(value)} ㎡`
}

/**
 * 格式化单价
 */
export function formatPrice(value: number | null | undefined): string {
  if (value === null || value === undefined) return '-'
  return `${formatNumber(value, { decimals: 0 })} 元/㎡`
}

/**
 * 格式化文件大小
 */
export function formatFileSize(bytes: number | null | undefined): string {
  if (bytes === null || bytes === undefined || bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`
}

/**
 * 格式化时长（秒 -> 可读格式）
 */
export function formatDuration(seconds: number | null | undefined): string {
  if (!seconds) return '-'
  if (seconds < 60) return `${seconds.toFixed(1)}秒`
  if (seconds < 3600) return `${Math.floor(seconds / 60)}分${Math.floor(seconds % 60)}秒`
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  return `${hours}时${minutes}分`
}

/**
 * 计算两个时间的时长
 */
export function calcDuration(
  startTime: string | null | undefined,
  endTime: string | null | undefined
): string {
  if (!startTime || !endTime) return '-'
  const start = new Date(startTime).getTime()
  const end = new Date(endTime).getTime()
  if (isNaN(start) || isNaN(end)) return '-'
  const seconds = Math.round((end - start) / 1000)
  return formatDuration(seconds)
}

/**
 * 格式化百分比
 */
export function formatPercent(value: number | null | undefined, decimals = 1): string {
  if (value === null || value === undefined) return '-'
  return `${(value * 100).toFixed(decimals)}%`
}

/**
 * 格式化公式输入值
 */
export function formatFormulaValue(val: any): string {
  if (val === undefined || val === null) return '-'
  if (typeof val === 'number') {
    return formatNumber(val, { decimals: 4 })
  }
  // 如果是对象（如 {raw: '108/103', value: 1.0485}）
  if (typeof val === 'object' && val.raw) {
    return val.value ? `${val.raw} (=${val.value.toFixed(4)})` : val.raw
  }
  return String(val)
}

/**
 * 截断文本
 */
export function truncateText(text: string | null | undefined, maxLength: number): string {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}
