/**
 * 在文件管理器中打开文件并选中它
 * @param filePath 文件的绝对路径
 */
import { Command } from '@tauri-apps/plugin-shell';
import { type } from '@tauri-apps/plugin-os'; // 引入官方平台查询

export const showInFolder = async (filePath: string) => {
  // type() 会返回 'windows', 'macos', 'linux', 'android', 'ios'
  const platform = type();

  try {
    if (platform === 'windows') {
      // Windows 必须处理路径中的斜杠，确保 explorer 能识别
      const winPath = filePath.replace(/\//g, '\\');
      await Command.create('explorer', ['/select,', winPath]).execute();
    } else if (platform === 'macos') {
      await Command.create('open', ['-R', filePath]).execute();
    } else {
      // Linux 逻辑
      const lastSlash = filePath.lastIndexOf('/');
      const dir = filePath.substring(0, lastSlash);
      await Command.create('xdg-open', [dir]).execute();
    }
  } catch (err) {
    console.error('打开文件夹失败:', err);
  }
};