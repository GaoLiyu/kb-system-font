import { Ref, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { usePagination } from './usePagination'
import { useLoading } from "./useLoading"

interface UseTableOptions<T> {
  fetchFn: (params: any) => Promise<{ items: T[], total: number }>
  deleteFn?: (id: string | number) => Promise<any>
  defaultPageSize?: number
  idKey?: keyof T
}


export function useTable<T extends Record<string, any>>(options: UseTableOptions<T>) {
  const { fetchFn, deleteFn, defaultPageSize = 20, idKey = 'id' as keyof T } = options

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
      list.value = res.data || res.items || []
      pagination.setTotal(res.pagination?.total || res.total || 0)
    })
  }

  function resetAndFetch(extraParams: Record<string, any> = {}) {
    pagination.reset()
    return fetch(extraParams)
  }

  async function handleDelete(row: T, confirmText = '确定删除吗？') {
    const rowId = row[idKey]
    if (!deleteFn || !rowId) return

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
      await deleteFn(rowId as string | number)
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
