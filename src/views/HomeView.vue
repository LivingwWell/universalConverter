<script setup lang="ts">
import TheWelcome from '../components/TheWelcome.vue'
import ImageConversion from '../views/ImageConversion/index.vue'
import { useDark, useToggle } from '@vueuse/core';
import { Sunny, Moon, Picture } from '@element-plus/icons-vue';

// 自动处理 html 的 .dark 类名，并持久化到 localStorage
const isDark = useDark();
const toggleDark = useToggle(isDark);

</script>

<template>
  <main>
    <el-container class="layout-container">
      <el-header class="app-header">
        <div class="header-left">
          <el-icon :size="20"><Picture /></el-icon>
          <span class="title">图片格式转换器</span>
        </div>

        <div class="header-right">
          <el-switch
            v-model="isDark"
            inline-prompt
            :active-icon="Moon"
            :inactive-icon="Sunny"
            @change="toggleDark"
          />
        </div>
      </el-header>

      <el-main class="app-main">
        <ImageConversion />
      </el-main>
    </el-container>

  </main>
</template>

<style scoped>
/* 确保容器占满全屏且不滚动 */
.layout-container {

  overflow: hidden; /* 关键：禁止最外层滚动 */
  background-color: var(--el-bg-color-page);
}

.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--el-border-color-light);
  background-color: var(--el-bg-color);
  padding: 0 20px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: bold;
}

.header-right {
  display: flex;
  align-items: center;
}

.app-main {
  padding: 20px;
  overflow: hidden; /* 防止主区域出现双滚动条 */
}

.full-height-row {
  height: 100%;
}

/* 确保三个 el-col 下的卡片都能高度撑满 */
:deep(.el-col) {
  height: 100%;
}

:deep(.el-card) {
  height: 100%;
  display: flex;
  flex-direction: column;
}

:deep(.el-card__body) {
  flex: 1;
  overflow-y: auto; /* 只有卡片内部可以滚动 */
}

</style>
