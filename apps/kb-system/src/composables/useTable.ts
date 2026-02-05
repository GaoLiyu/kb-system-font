import { Ref, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { usePagination } from './usePagination'
import { useLoading } from "./useLoading"

interface UseTableOptions<T> {
  fetchFn: (params: any) => Promise<{ items: T[], total: number }>
  deleteFn?: (id: string | number) => Promise<any>
  defaultPageSize?: number
}


export function useTable<T extends { id: string | number }>(options: UseTableOptions<T>) {
  const { fetchFn, deleteFn, defaultPageSize = 20 } = options

  const list = ref<T[]>([]) as Ref<T[]>
  const { loading, withLoading } = useLoading()
  const pagination = usePagination({ defaultPageSize })

  const query = ref<Record<string, any>>({})

  async function fetch(extraParams: Record<string, any> = {}) {

    query.value = { ...query.value, ...extraParams }

    await withLoading(async () => {
      const params = {
        page: pagination.page.value,
        page_size: pagination.pageSize.value,
        ...extraParams,
      }
      const res = await fetchFn(params)
      list.value = res.items
      pagination.setTotal(res.total)
    })
  }

  function resetAndFetch(extraParams: Record<string, any> = {}) {
    pagination.reset()
    return fetch(extraParams)
  }

  async function handleDelete(row: T, confirmText = '确定删除吗？') {
    if (!deleteFn || !row.id) return

    try {
      await ElMessageBox.confirm(confirmText, '提示', {
        type: 'warning',
        confirmButtonText: '确定',
        cancelButtonText: '取消',
      })
    } catch {
      return
    }

    await withLoading(async () => {
      await deleteFn(row.id)
    })

    ElMessage.success('删除成功')
    await fetch()
  }

  return {
    list,
    loading,
    pagination,
    fetch,
    handleDelete,
    query,
    resetAndFetch
  }
}
