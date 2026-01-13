<script setup lang="ts">
import { ref } from 'vue';
import { ArrowLeft, ArrowRight, Delete, Picture, CircleCheckFilled } from '@element-plus/icons-vue';

// 定义接口
export interface ImageResult {
  name: string;
  absolutePath: string;
  previewUrl: string;
}

const props = defineProps<{
  images: ImageResult[];
  activeIndex?: number | null; // 接收父组件传递的选中索引
}>();

const emit = defineEmits<{
  (e: 'remove', index: number): void;
  (e: 'select', index: number): void;
}>();

const scrollContainer = ref<any>(null);

// 滚动控制
const scroll = (direction: 'left' | 'right') => {
  if (!scrollContainer.value) return;
  const scrollElement = scrollContainer.value.wrapRef;
  const moveDistance = 400;
  const target = direction === 'left'
    ? scrollElement.scrollLeft - moveDistance
    : scrollElement.scrollLeft + moveDistance;
  scrollContainer.value.setScrollLeft(target);
};

const placeholderCount = 5;

const isDragging = ref(false);
const startX = ref(0);
const scrollLeft = ref(0);

const handleMouseDown = (e: MouseEvent) => {
  // 只有点击容器背景或图片（非按钮）时触发
  isDragging.value = true;
  const wrap = scrollContainer.value.wrapRef;
  // 记录初始位置
  startX.value = e.pageX - wrap.offsetLeft;
  scrollLeft.value = wrap.scrollLeft;

  // 改变鼠标指针样式
  wrap.style.cursor = 'grabbing';
  wrap.style.userSelect = 'none'; // 防止拖拽时选中文字/图片
};

const handleMouseMove = (e: MouseEvent) => {
  if (!isDragging.value) return;
  e.preventDefault();

  const wrap = scrollContainer.value.wrapRef;
  const x = e.pageX - wrap.offsetLeft;
  // 计算移动距离 (乘以 2 或 3 可以增加滚动速度感)
  const walk = (x - startX.value) * 1.5;
  wrap.scrollLeft = scrollLeft.value - walk;
};

const handleMouseUpOrLeave = () => {
  isDragging.value = false;
  const wrap = scrollContainer.value.wrapRef;
  if (wrap) {
    wrap.style.cursor = 'grab';
    wrap.style.removeProperty('user-select');
  }
};

// 按钮滚动保持不变
const scrollByButton = (direction: 'left' | 'right') => {
  if (!scrollContainer.value) return;
  const wrap = scrollContainer.value.wrapRef;
  const moveDistance = 400;
  const target = direction === 'left' ? wrap.scrollLeft - moveDistance : wrap.scrollLeft + moveDistance;
  scrollContainer.value.setScrollLeft(target);
};
</script>

<template>
  <div class="image-list-wrapper">
    <el-button
      v-if="images.length > placeholderCount"
      class="nav-btn left"
      :icon="ArrowLeft"
      circle
      @click="scroll('left')"
    />

    <el-scrollbar ref="scrollContainer" class="horizontal-scroll"
                  @mousedown="handleMouseDown"
                  @mousemove="handleMouseMove"
                  @mouseup="handleMouseUpOrLeave"
                  @mouseleave="handleMouseUpOrLeave">
      <div class="image-flex-container">

        <template v-if="images.length > 0">
          <div
            v-for="(img, index) in images"
            :key="img.absolutePath"
            class="image-item-card"
            :class="{ 'is-active': activeIndex === index }"
            @click="emit('select', index)"
          >
            <transition name="el-zoom-in-center">
              <div v-if="activeIndex === index" class="active-badge">
                <el-icon><CircleCheckFilled /></el-icon>
              </div>
            </transition>

            <el-image :src="img.previewUrl" fit="cover" class="main-img">
              <template #placeholder>
                <div class="img-slot">加载中...</div>
              </template>
            </el-image>

            <div class="image-mask">
              <el-icon class="del-icon" @click.stop="emit('remove', index)">
                <Delete />
              </el-icon>
            </div>

            <div class="image-info">
              <span class="file-name">{{ img.name }}</span>
            </div>
          </div>
        </template>

        <template v-else>
          <div v-for="n in placeholderCount" :key="n" class="image-item-card is-placeholder">
            <div class="placeholder-content">
              <el-icon class="placeholder-icon"><Picture /></el-icon>
              <span>待添加</span>
            </div>
          </div>
        </template>

      </div>
    </el-scrollbar>

    <el-button
      v-if="images.length > placeholderCount"
      class="nav-btn right"
      :icon="ArrowRight"
      circle
      @click="scroll('right')"
    />
  </div>
</template>

<style scoped>
.image-list-wrapper {
  position: relative;
  width: 100%;
  padding: 20px 0;
  display: flex;
  align-items: center;
}

.image-flex-container {
  display: flex;
  gap: 16px;
  padding: 15px 5px; /* 增加顶部 padding 给位移动画留空间 */
}

/* 基础卡片样式 */
.image-item-card {
  position: relative;
  flex: 0 0 160px;
  height: 160px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid var(--el-border-color);
  background: var(--el-fill-color-blank);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
}

/* ⭐ 核心改动：选中后的样式表现 */
.image-item-card.is-active {
  border-color: var(--el-color-primary);
  border-width: 2px;
  /* 向上位移，产生被“提起”的效果 */
  transform: translateY(-10px);
  /* 增加符合主题色的外发光阴影 */
  box-shadow: 0 10px 20px -5px var(--el-color-primary-light-3);
  background: var(--el-color-primary-light-9);
}

.active-badge {
  position: absolute;
  top: 6px;
  left: 6px;
  color: var(--el-color-primary);
  font-size: 22px;
  z-index: 10;
  background: #fff;
  border-radius: 50%;
  display: flex;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

/* 图片和遮罩样式保持稳定 */
.main-img { width: 100%; height: 120px; display: block; }

.image-mask {
  position: absolute;
  top: 0; left: 0; right: 0; height: 120px;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  opacity: 0;
  transition: opacity 0.2s;
}

.image-item-card:hover .image-mask { opacity: 1; }

.del-icon { color: white; font-size: 22px; }
.del-icon:hover { color: var(--el-color-danger); transform: scale(1.1); }

.image-info {
  height: 40px;
  padding: 0 8px;
  display: flex;
  align-items: center;
  font-size: 12px;
  border-top: 1px solid var(--el-border-color-extra-light);
}

.file-name {
  color: var(--el-text-color-regular);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 占位符样式 */
.is-placeholder {
  border: 2px dashed var(--el-border-color-lighter);
  background: var(--el-fill-color-lighter);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.5;
  cursor: default;
  /* 占位符卡片主体 */
  .is-placeholder {
    border: 2px dashed var(--el-border-color-lighter);
    background: var(--el-fill-color-lighter);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0.6;
    cursor: default;
    /* 确保它在横向列表中依然占据原本的宽度 */
    flex: 0 0 160px;
    height: 160px;
  }

  /* 🔥 关键：让内容竖向排列 */
  .placeholder-content {
    display: flex;
    flex-direction: column; /* 纵向排布：上图标，下文字 */
    align-items: center;    /* 水平居中 */
    justify-content: center; /* 垂直居中 */
    gap: 12px;              /* 图标和文字之间的间距 */
  }

  .placeholder-icon {
    font-size: 48px;        /* 增大图标，让它在竖向布局中更显眼 */
    color: var(--el-text-color-placeholder);
  }

  .placeholder-text {
    font-size: 14px;
    color: var(--el-text-color-secondary);
    font-weight: 500;
  }
}

.placeholder-icon { font-size: 40px; color: var(--el-text-color-placeholder); }

/* 导航按钮保持稳定 */
.nav-btn {
  position: absolute; z-index: 10;
  background: var(--el-bg-color);
  box-shadow: var(--el-box-shadow-light);
}
.nav-btn.left { left: -15px; }
.nav-btn.right { right: -15px; }
</style>