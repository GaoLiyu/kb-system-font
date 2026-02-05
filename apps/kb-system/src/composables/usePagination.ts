import { ref, computed } from 'vue'

interface PaginationOptions {
  defaultPageSize?: number
  pageSizes?: number[]
}

export function usePagination(options: PaginationOptions = {}) {
  const { defaultPageSize = 20, pageSizes = [10, 20, 50, 100] } = options

  const page = ref(1)
  const pageSize = ref(defaultPageSize)
  const total = ref(0)

  const totalPages = computed(() => Math.ceil(total.value / pageSize.value))

  const offset = computed(() => (page.value - 1) * pageSize.value)

  function reset() {
    page.value = 1
  }

  function setTotal(value: number) {
    total.value = value
  }

  return {
    page,
    pageSize,
    total,
    totalPages,
    offset,
    pageSizes,
    reset,
    setTotal,
  }
}
