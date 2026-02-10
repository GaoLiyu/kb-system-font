/**
 * Axios 实例和拦截器配置
 */
import axios from 'axios'
import { ElMessage } from 'element-plus'
import router from '@/router'
import { getToken, removeToken } from "@/utils/auth";

// 创建 axios 实例
const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
})

// 防止重复跳转登录页的标志
let isRedirectingToLogin = false

// 请求拦截器
api.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    const data = response.data
    if (data && data.success === false) {
      const msg = data.message || '请求失败'
      ElMessage.error(msg)
      return Promise.reject(new Error(msg))
    }
    return data
  },
  (error) => {
    const status = error.response?.status
    const msg = error.response?.data?.detail || error.response?.data?.message || error.message

    // 401 未授权
    if (status === 401) {
      removeToken()

      // 防止重复跳转和循环
      const currentPath = window.location.pathname
      if (!isRedirectingToLogin && currentPath !== '/login') {
        isRedirectingToLogin = true
        ElMessage.error('登录已过期，请重新登录')

        router
          .push({
            path: '/login',
            query: {redirect: currentPath},
          })
          .finally(() => {
            // 延迟重置标志，防止短时间内多次触发
            setTimeout(() => {
              isRedirectingToLogin = false
            }, 1000)
          })
      }
    }
    // 403 无权限
    else if (status === 403) {
      ElMessage.error('无权限访问')
    }

    return Promise.reject(new Error(msg))
  }
)

export default api
