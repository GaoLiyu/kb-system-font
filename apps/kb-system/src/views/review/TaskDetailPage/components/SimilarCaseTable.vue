<template>
  <el-card v-if="cases.length > 0" style="margin-top: 16px">
    <template #header>
      <div class="panel-header">
        <span>相似案例参考</span>
        <el-tag size="small" type="info">{{ cases.length }} 个</el-tag>
      </div>
    </template>
    <el-table :data="cases.slice(0, 5)" size="small">
      <el-table-column label="地址" min-width="200">
        <template #default="{ row }">
          {{ row.address?.value || row.address || '-' }}
        </template>
      </el-table-column>
      <el-table-column label="面积(㎡)" width="100">
        <template #default="{ row }">
          {{ row.building_area?.value || row.area || '-' }}
        </template>
      </el-table-column>
      <el-table-column label="价格(元/㎡)" width="120">
        <template #default="{ row }">
          {{ (row.transaction_price?.value || row.rental_price?.value || row.price || 0).toFixed(0) }}
        </template>
      </el-table-column>
      <el-table-column label="区域" width="100">
        <template #default="{ row }">
          {{ row.district || '-' }}
        </template>
      </el-table-column>
    </el-table>
  </el-card>
</template>

<script setup lang="ts">
defineProps<{
  cases: any[]
}>()
</script>

<style scoped>
.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
