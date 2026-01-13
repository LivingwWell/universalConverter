<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { open } from "@tauri-apps/plugin-dialog";
import { listen, type UnlistenFn } from "@tauri-apps/api/event";
import { readDir, stat } from "@tauri-apps/plugin-fs";
import { convertFileSrc } from "@tauri-apps/api/core";
import { join } from "@tauri-apps/api/path";
import { FolderOpened, Picture, Loading } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';

export interface ImageResult {
  name: string;
  absolutePath: string;
  previewUrl: string;
}

const props = withDefaults(defineProps<{
  active?: boolean;
}>(), {
  active: true,
});

const emit = defineEmits<{
  (e: 'imagesFound', images: ImageResult[]): void;
}>();

const isScanning = ref(false);
const dragging = ref(false);
let unlistenHandlers: UnlistenFn[] = [];

const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'];

/** 递归扫描文件夹 */
const scanDirectory = async (dirPath: string): Promise<ImageResult[]> => {
  let results: ImageResult[] = [];
  const entries = await readDir(dirPath);
  for (const entry of entries) {
    const filePath = await join(dirPath, entry.name);
    if (entry.isDirectory) {
      const sub = await scanDirectory(filePath);
      results = [...results, ...sub];
    } else {
      checkAndPushImage(entry.name, filePath, results);
    }
  }
  return results;
};

const checkAndPushImage = (name: string, path: string, target: ImageResult[]) => {
  const ext = name.split('.').pop()?.toLowerCase();
  if (ext && IMAGE_EXTENSIONS.includes(ext)) {
    target.push({ name, absolutePath: path, previewUrl: convertFileSrc(path) });
  }
};

/** 核心处理逻辑 */
const handlePaths = async (paths: string[]) => {
  if (isScanning.value || !props.active) return;
  isScanning.value = true;
  let allImages: ImageResult[] = [];

  try {
    for (const path of paths) {
      try {
        const info = await stat(path);
        if (info.isDirectory) {
          const dirImages = await scanDirectory(path);
          allImages = [...allImages, ...dirImages];
        } else {
          const fileName = path.split(/[\\/]/).pop() || "image";
          checkAndPushImage(fileName, path, allImages);
        }
      } catch (e) {
        ElMessage.error(`权限拒绝或路径失效: ${path}`);
      }
    }
    emit('imagesFound', allImages);
  } finally {
    isScanning.value = false;
  }
};

onMounted(async () => {
  // 监听 Tauri 2.0 拖拽事件
  unlistenHandlers.push(await listen("tauri://drag-enter", () => dragging.value = true));
  unlistenHandlers.push(await listen("tauri://drag-leave", () => dragging.value = false));
  unlistenHandlers.push(await listen<{ paths: string[] }>("tauri://drag-drop", (e) => {
    dragging.value = false;
    handlePaths(e.payload.paths);
  }));
});

onUnmounted(() => unlistenHandlers.forEach(fn => fn()));

const handleClick = async () => {
  const selected = await open({ directory: true, multiple: true, title: "选择图片或文件夹" });
  if (selected) {
    const paths = Array.isArray(selected) ? selected : [selected];
    handlePaths(paths);
  }
};
</script>

<template>
  <div class="drop-zone-container">
    <div
      class="custom-dragger"
      :class="{ 'is-active': dragging && active, 'is-loading': isScanning }"
      @click="handleClick"
    >
      <el-icon class="main-icon">
        <Loading v-if="isScanning" class="is-spinning" />
        <FolderOpened v-else-if="dragging" />
        <Picture v-else />
      </el-icon>

      <div class="text-content">
        <p class="main-text">{{ isScanning ? '深度扫描中...' : '拖入文件夹或图片' }}</p>
        <p class="sub-text">支持自动识别子目录图片，已适配暗色模式</p>
      </div>

      <div v-if="isScanning" class="scan-line"></div>
    </div>
  </div>
</template>

<style scoped>
.drop-zone-container { width: 100%; margin: 10px 0; }

.custom-dragger {
  border: 2px dashed var(--el-border-color);
  background: var(--el-fill-color-blank);
  border-radius: 12px;
  padding: 40px;
  text-align: center;
  cursor: pointer;
  transition: all 0.25s ease;
  position: relative;
  overflow: hidden;
}

.custom-dragger:hover { border-color: var(--el-color-primary); }

.custom-dragger.is-active {
  border-color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
  transform: scale(1.01);
}

.custom-dragger.is-loading { cursor: wait; opacity: 0.8; }

.main-icon {
  font-size: 50px;
  color: var(--el-text-color-placeholder);
  margin-bottom: 16px;
}

.custom-dragger:hover .main-icon,
.is-active .main-icon { color: var(--el-color-primary); }

.main-text { color: var(--el-text-color-regular); font-weight: bold; margin-bottom: 4px; }

.sub-text { color: var(--el-text-color-secondary); font-size: 12px; }

.is-spinning { animation: rotating 2s linear infinite; }

.scan-line {
  position: absolute;
  bottom: 0; left: 0;
  width: 100%; height: 2px;
  background: var(--el-color-primary);
  animation: scanning 1.5s infinite;
}

@keyframes rotating { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
@keyframes scanning { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
</style>