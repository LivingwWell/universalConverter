<template>
  <div class="container">
    <el-row :span="24" justify="space-between">
      <!--  菜单设置区-->
      <el-col :span="7">
        <el-card class="side-panel-card" shadow="never">
          <template #header>
            <div class="card-header">
              <el-icon><Setting /></el-icon>
              <span>转换参数配置</span>
            </div>
          </template>

          <el-form label-position="top">
            <el-form-item>
              <template #label>
                <div class="label-info">
                  <span>压缩质量</span>
                  <el-tooltip content="数值越小体积越小，建议 75-85" placement="top">
                    <el-icon class="help-icon"><QuestionFilled /></el-icon>
                  </el-tooltip>
                </div>
              </template>
              <div class="slider-with-input">
                <el-slider
                  v-model="convertConfig.quality"
                  :min="1" :max="100"
                  :format-tooltip="(v:number) => v + '%'"
                />
                <el-tag effect="dark" round type="primary">{{ convertConfig.quality }}%</el-tag>
              </div>
            </el-form-item>

            <el-divider border-style="dashed" />

            <el-form-item label="命名规则">
              <el-radio-group v-model="convertConfig.overwrite" class="full-width-radio">
                <el-radio-button :value="false">自动重命名</el-radio-button>
                <el-radio-button :value="true">覆盖原图</el-radio-button>
              </el-radio-group>
            </el-form-item>

            <el-form-item label="完成后打开文件夹">
              <el-switch
                v-model="convertConfig.autoOpenFolder"
                inline-prompt
                active-text="打开目录"
                inactive-text="保持静默"
              />
            </el-form-item>
          </el-form>

          <el-divider />

          <div class="execution-area">
            <div class="batch-section">
              <p class="section-title">批量处理所有队列</p>
              <el-button-group class="full-width-group">
                <el-button type="primary" :disabled="fileList.length === 0" @click="handleBatchConvert('webp')">
                  全部转 WebP
                </el-button>
                <el-button type="success" :disabled="fileList.length === 0" @click="handleBatchConvert('gif')">
                  全部转 GIF
                </el-button>
              </el-button-group>
            </div>

            <transition name="el-zoom-in-bottom">
              <div v-if="imgIndex !== null" class="single-action-box">
                <p class="section-title active-text">当前选中：{{ fileList[imgIndex]?.name }}</p>
                <div class="flex-row-between">
                  <el-button size="small" type="primary" plain @click="doConvert('webp')">单张 WebP</el-button>
                  <el-button size="small" type="success" plain @click="doConvert('gif')">单张 GIF</el-button>
                </div>
              </div>
            </transition>
          </div>
        </el-card>

        <transition name="el-fade-in">
          <div v-if="isBatchProcessing" class="batch-overlay">
            <div class="progress-box">
              <el-progress type="dashboard" :percentage="currentProgress" :stroke-width="10" color="#409eff" />
              <div class="tip-text">{{ processingText }}</div>
            </div>
          </div>
        </transition>
      </el-col>
      <!--  上传区-->
      <el-col :span="8">
        <div>
          <DropZone @imagesFound="onSelect"></DropZone>
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-bold">待转换列表 ({{ fileList.length }})</h3>
            <el-button type="danger" link @click="fileList = []">清空全部</el-button>
          </div>

          <ImageHorizontalList
            :images="fileList"
            @remove="removeImage"
            @select="handleImageSelect"
            :active-index="imgIndex"
          />
        </div>
      </el-col>

      <!--  预览区-->
      <el-col :span="8">
        <el-card class="preview-card">
          <template #header>
            <div class="preview-header">
              <span>图片预览</span>
            </div>
          </template>
          <div class="preview-body">
            <template v-if="imgIndex !== null && fileList[imgIndex]">
              <div class="img-container">
                <img
                  :src="fileList[imgIndex]?.previewUrl"
                  class="img-display"
                />
              </div>
            </template>

            <div v-else class="preview-empty">
              <el-icon class="empty-icon"><PictureFilled /></el-icon>
              <p>暂无预览内容</p>
            </div>
          </div>
        </el-card>

      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import DropZone, { type ImageResult } from '@/components/DropZone.vue'
import ImageHorizontalList from '@/components/ImageHorizontalList.vue'
import { convertImage } from '@/utils/ConvertImage.ts'

import { ElMessage } from 'element-plus'
import { showInFolder } from '@/utils/fileUtils.ts'

const fileList = ref<ImageResult[]>([])
const imgIndex = ref(0)
const compressList = ref<ImageResult[]>([])
const isBatchProcessing = ref(false)
const currentProgress = ref(0)
const processingText = ref('')
// 默认配置
const convertConfig = ref({
  quality: 75,             // 压缩质量 1-100
  autoOpenFolder: true,    // 转换后是否自动定位文件
  overwrite: false // 默认不覆盖，更安全
});


const onSelect = (paths: ImageResult[]) => {
  fileList.value.push(...paths)
  compressList.value = fileList.value
  console.log(fileList.value)
}

const handleImageSelect = (index: number) => {
  imgIndex.value = index
  const currentImg = fileList.value[index]
  console.log('当前选中的图片信息：', currentImg)

  // 你可以在这里触发更多的逻辑，比如打开侧边栏编辑详情
}

const removeImage = async (index: number) => {
  fileList.value.splice(index, 1)
}

//单独转换
const doConvert = async (ext: string) => {
  if (imgIndex.value === null) return

  const currentImg = fileList.value[imgIndex.value]
  if (currentImg != null) {
    const newPath = await convertImage(currentImg.absolutePath, ext,true,convertConfig.value.quality,convertConfig.value.overwrite)
    if (newPath) {
      // 转换成功后，你可能想刷新列表或自动选中新文件
      console.log('转换后的路径为: ', newPath)
      //  判断是否需要打开文件夹
      if (newPath && convertConfig.value.autoOpenFolder) {
        await showInFolder(newPath);
      }
    }
  }
}

//批量转换
const handleBatchConvert = async (targetExt: 'webp' | 'gif') => {
  if (isBatchProcessing.value || fileList.value.length === 0) return
  let lastSuccessPath = ''; // 用于记录最后成功的文件路径
  isBatchProcessing.value = true
  currentProgress.value = 0
  let successCount = 0

  const total = fileList.value.length
  let completedCount = 0

  // 1. 复制一份待处理队列
  const queue = [...fileList.value]

  // 2. 设置最大并发数（建议 3-5，取决于 CPU 核心数）
  const MAX_CONCURRENT = 3

  // 3. 定义单个“执行器”
  const worker = async () => {
    while (queue.length > 0) {
      // 从队列头部取出一张图片
      const img = queue.shift()
      if (!img) continue

      // 更新实时状态文字
      processingText.value = `正在转换: ${img.name}...`

      // 执行转换（禁用内部 loading）
      const result = await convertImage(img.absolutePath, targetExt, false,convertConfig.value.quality,convertConfig.value.overwrite)

      if (result){
        successCount++
        lastSuccessPath = result; // 每次成功都更新这个路径
      }

      // 每完成一张，更新总进度
      completedCount++
      currentProgress.value = Math.round((completedCount / total) * 100)
    }
  }

  // 4. 同时启动多个执行器
  const workers = []
  for (let i = 0; i < Math.min(MAX_CONCURRENT, total); i++) {
    workers.push(worker())
  }

  // 5. 等待所有执行器完成工作
  await Promise.all(workers)

  isBatchProcessing.value = false
  ElMessage.success(`处理完成！成功 ${successCount} 张`)
  //  判断是否需要打开文件夹
  if (convertConfig.value.autoOpenFolder && lastSuccessPath) {
    // 延迟一小会儿打开，体验更平滑
    setTimeout(() => {
      showInFolder(lastSuccessPath);
    }, 500);
  }
}
</script>

<style scoped>
/* --- 你原来的样式保留 --- */
.container {
  margin: 15px;
  width: auto;
}
.imagePreview {
  width: 100%;
  height: 100%;
}
.action-panel {
  margin-top: 20px;
}
.flex-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.buttons {
  display: flex;
  gap: 10px;
}
.batch-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.85);
  z-index: 3000;
  display: flex;
  justify-content: center;
  align-items: center;
  backdrop-filter: blur(4px);
}
.progress-box {
  text-align: center;
  color: white;
}
.tip-text {
  margin-top: 20px;
  font-size: 16px;
  letter-spacing: 1px;
}
.config-panel {
  margin-bottom: 20px;
  border-radius: 8px;
}
.slider-with-input {
  display: flex;
  align-items: center;
  width: 100%;
}

/* --- 新增/优化的辅助样式 (使用 cfg- 前缀避免冲突) --- */
.cfg-options {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.cfg-radio-group {
  display: flex;
  flex-direction: column;
}
.cfg-batch-title {
  font-size: 13px;
  color: #909399;
  margin-bottom: 12px;
}
.cfg-full-btns .el-button {
  flex: 1; /* 让批量按钮平分宽度 */
}
.cfg-single-tip {
  margin-top: 15px;
}
.cfg-divider {
  height: 1px;
  background: #ebeef5;
  margin: 15px 0;
}
.cfg-file-name {
  font-size: 12px;
  color: #409eff;
  margin-bottom: 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.preview-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  /* 使用变量：自动适配白天/黑夜的背景和边框 */
  background-color: var(--el-bg-color);
  border: 1px solid var(--el-border-color-light);
  transition: all 0.3s;
}

.preview-header {
  font-weight: bold;
  /* 自动适配文字颜色 */
  color: var(--el-text-color-primary);
}

.preview-card :deep(.el-card__body) {
  padding: 10px;
  flex: 1;
  display: flex;
  overflow: hidden;
}

.preview-body {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  /* 深色模式下预览区底色稍微加深 */
  background-color: var(--el-fill-color-blank);
}

/* 2. 图片展示适配 */
.img-container {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.img-display {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  /* 深色模式下的阴影调整 */
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

/* 3. 空状态适配 */
.preview-empty {
  text-align: center;
  color: var(--el-text-color-placeholder);
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 10px;
  color: var(--el-text-color-disabled);
}

/* 4. 遮罩层适配 (批量转换时的 Overlay) */
.batch-overlay {
  position: fixed;
  inset: 0;
  /* 使用半透明背景变量 */
  background: var(--el-mask-color-extra-light);
  backdrop-filter: blur(6px);
  z-index: 3000;
  display: flex;
  justify-content: center;
  align-items: center;
}


</style>
