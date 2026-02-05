import { ref } from 'vue'

/**
 * 对话框状态管理
 */
export function useDialog<T = any>() {
  const visible = ref(false)
  const data = ref<T | null>(null)

  function open(initialData?: T) {
    data.value = initialData ?? null
    visible.value = true
  }

  function close() {
    visible.value = false
  }

  function reset() {
    visible.value = false
    data.value = null
  }

  function setData(next: T | null) {
    data.value = next
  }

  function updateData(patch: Partial<T>) {
    data.value = {
      ...(data.value as any),
      ...patch
    }
  }

  return {
    visible,
    data,
    open,
    close,
    reset,
    setData,
    updateData,
  }
}
