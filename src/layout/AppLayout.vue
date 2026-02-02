<template>
  <el-container class="app-layout">
    <!-- 侧边栏 -->
    <el-aside :width="sidebarWidth" class="app-sidebar">
      <div class="logo" @click="router.push('/')">
<!--        <img src="@/assets/logo.svg" alt="Logo" class="logo-img" v-if="!collapsed" />-->
        <h1 v-if="!collapsed">内部测试</h1>
        <h1 v-else>KB</h1>
      </div>

      <SideMenu :collapsed="collapsed" />
    </el-aside>

    <el-container class="app-main-container">
      <!-- 顶部栏 -->
      <el-header class="app-header">
        <div class="header-left">
          <el-icon class="collapse-btn" @click="collapsed = !collapsed">
            <Fold v-if="!collapsed" />
            <Expand v-else />
          </el-icon>

          <!-- 面包屑 -->
          <el-breadcrumb separator="/">
            <el-breadcrumb-item
              v-for="(item, index) in breadcrumb"
              :key="item.id"
              :to="index < breadcrumb.length - 1 && item.path ? item.path : undefined"
            >
              {{ item.title }}
            </el-breadcrumb-item>
          </el-breadcrumb>
        </div>

        <div class="header-right">
          <el-tooltip content="刷新" placement="bottom">
            <el-icon class="header-icon" @click="handleRefresh"><Refresh /></el-icon>
          </el-tooltip>
          <el-tooltip content="全屏" placement="bottom">
            <el-icon class="header-icon" @click="toggleFullscreen"><FullScreen /></el-icon>
          </el-tooltip>
          <el-dropdown trigger="click" @command="handleCommand">
        <span class="user-dropdown">
          <el-avatar :size="32" icon="UserFilled" />
          <!-- <span class="username">{{ userStore.userInfo?.username || '用户' }}</span> -->
          <!-- <el-icon><ArrowDown /></el-icon> -->
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item disabled>
              <el-icon><UserFilled /></el-icon>
              {{ userStore.userInfo?.username }}
            </el-dropdown-item>
            <el-dropdown-item disabled>
              <el-tag size="small" type="info">
                {{ getRoleLabel(userStore.roles[0]) }}
              </el-tag>
            </el-dropdown-item>
            <el-dropdown-item divided command="profile">
              <el-icon><Setting /></el-icon>
              个人设置
            </el-dropdown-item>
            <el-dropdown-item command="changePassword">
              <el-icon><Key /></el-icon>
              修改密码
            </el-dropdown-item>
            <el-dropdown-item divided command="logout">
              <el-icon><SwitchButton /></el-icon>
              退出登录
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
        </div>
      </el-header>

      <!-- 主内容区 -->
      <el-main class="app-main">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Fold, Expand, ArrowDown, UserFilled, Setting, Key, SwitchButton, Refresh, FullScreen } from '@element-plus/icons-vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import SideMenu from '@/components/SideMenu.vue'
import { getBreadcrumb } from '@/config/menu'
import { useUserStore } from "@/stores";

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

// 侧边栏折叠
const collapsed = ref(false)
const sidebarWidth = computed(() => collapsed.value ? '64px' : '220px')

// 面包屑
const breadcrumb = computed(() => {
  return getBreadcrumb(route.path)
})

// 刷新页面
function handleRefresh() {
  router.go(0)
}

// 全屏切换
function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen()
  } else {
    document.exitFullscreen()
  }
}

// 角色标签
const roleLabels: Record<string, string> = {
  'super_admin': '超级管理员',
  'admin': '管理员',
  'reviewer': '审查员',
  'editor': '编辑员',
  'viewer': '只读用户',
}

function getRoleLabel(role: string): string {
  return roleLabels[role] || role
}

// 处理下拉菜单命令
async function handleCommand(command: string) {
  switch (command) {
    case 'profile':
      router.push('/profile')
      break
    case 'changePassword':
      router.push('/change-password')
      break
    case 'logout':
      handleLogout()
      break
  }
}

// 退出登录
async function handleLogout() {
  try {
    await ElMessageBox.confirm(
      '确定要退出登录吗？',
      '退出确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )

    await userStore.logout()
    ElMessage.success('已退出登录')
    router.push('/login')
  } catch {
    // 用户取消
  }
}
</script>

<style scoped>
.app-layout {
  height: 100vh;
  overflow: hidden;
}

.app-sidebar {
  background-color: #304156;
  transition: width 0.3s;
  overflow: hidden;
}

.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  border-bottom: 1px solid #3d4a5a;
}

.logo h1 {
  color: #fff;
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  white-space: nowrap;
}

.logo-img {
  width: 32px;
  height: 32px;
}

.app-main-container {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.app-header {
  background: #fff;
  border-bottom: 1px solid #e6e6e6;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  height: 50px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.collapse-btn {
  font-size: 20px;
  cursor: pointer;
  color: #606266;
}

.collapse-btn:hover {
  color: #409EFF;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-icon {
  font-size: 18px;
  cursor: pointer;
  color: #606266;
}

.header-icon:hover {
  color: #409EFF;
}

.app-main {
  background: #f5f7fa;
  padding: 16px;
  overflow-y: auto;
}

/* 页面切换动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>