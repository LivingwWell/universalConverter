import { Command } from '@tauri-apps/plugin-shell';
import { path } from '@tauri-apps/api';
import { ElMessage, ElLoading } from 'element-plus';
import { exists } from '@tauri-apps/plugin-fs'; // 引入文件检查
/**
 * 核心转换函数
 * @param inputPath 输入文件的绝对路径
 * @param targetExt 目标后缀，如 'webp' 或 'gif'
 * @param showLoading 显示loading
 * @param quality 转换质量
 * @param overwrite 是否覆盖原文件
 */

export const convertImage = async (
  inputPath: string,
  targetExt: string,
  showLoading = true,
  quality = 75,
  overwrite = false
) => {

  let loadingInstance: any = null;

  // 只有在需要时才开启全屏 Loading
  if (showLoading) {
    loadingInstance = ElLoading.service({
      text: `正在处理...`,
      background: 'rgba(0, 0, 0, 0.7)'
    });
  }

  try {
    const lastDotIndex = inputPath.lastIndexOf('.');
    const baseDir = inputPath.substring(0, lastDotIndex);
    let outputPath = `${baseDir}.${targetExt}`;

    // --- 自动重命名逻辑 ---
    if (!overwrite) {
      let counter = 1;
      // 循环检查文件是否存在，如果存在则生成新名字：name_1.webp, name_2.webp...
      while (await exists(outputPath)) {
        outputPath = `${baseDir}_${counter}.${targetExt}`;
        counter++;
      }
    }


    const args = [
      inputPath,
      ...(targetExt === 'webp' ? ['-coalesce', '-loop', '0', '-quality', quality.toString()] : []),
      ...(targetExt === 'gif' ? ['-coalesce', '-layers', 'Optimize'] : []),
      outputPath
    ];

    const sidecar = Command.sidecar('binaries/magick', args);
    const result = await sidecar.execute();

    if (result.code === 0) {
      // 只有单次转换才弹出成功提示，批量转换时由父组件统一提示
      if (showLoading) ElMessage.success(`转换成功`);
      return outputPath;
    } else {
      throw new Error(result.stderr || '转换失败');
    }
  } catch (err: any) {
    if (showLoading) ElMessage.error(`错误: ${err.message}`);
    console.error(err);
    return null;
  } finally {
    // 关闭 Loading
    if (loadingInstance) loadingInstance.close();
  }
};