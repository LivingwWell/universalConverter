# 🚀 UniversalConverter

**一款极致轻便的 WebP 与 GIF 互转神器**
基于现代技术栈构建，专注于提供简单、高效的图片格式转换体验。

---

### 🎨 界面展示

| 浅色模式 | 深色模式 |
| :---: | :---: |
| <img src="[你的浅色截图链接](https://github.com/LivingwWell/universalConverter/blob/main/Screenshots/dark.png)" width="400"> | <img src="[你的深色截图链接](https://github.com/LivingwWell/universalConverter/blob/main/Screenshots/light.png)" width="400"> |

### ✨ 功能特性

* **🔄 双向转换**：完美支持 `WebP ⇄ GIF` 高质量互转。
* **📦 批量处理**：支持多文件同时导入，一键完成队列转换，告别重复劳动。
* **🖼️ 实时预览**：内置交互式预览区域，支持转换前后的画面对比。
* **⚡ 极致性能**：底层基于强大的 `ImageMagick` 内核，通过 Rust 驱动，转换速度飞快。
* **🌙 现代 UI**：基于 Element Plus 设计，原生适配**深色模式**，提供沉浸式操作体验。

---

### 🛠️ 技术栈

项目采用典型的 **Tauri + Frontend** 架构，兼顾网页开发的灵活性与原生应用的轻量化：

| 技术 | 用途 |
| :--- | :--- |
| **Framework** | [Vue 3](https://vuejs.org/) (Composition API + Script Setup) |
| **Build Tool** | [Vite](https://vitejs.dev/) |
| **Desktop Runtime** | [Tauri 2.0](https://tauri.app/) (安全、高性能的 Rust 运行时) |
| **UI Library** | [Element Plus](https://element-plus.org/) |
| **Engine** | [ImageMagick](https://imagemagick.org/) (Magick Rust Bindings) |

---

### 🖥️ 平台支持

| 操作系统 | 状态 | 备注 |
| :--- | :---: | :--- |
| **Windows** | ✅ 已通过测试 | 建议 Windows 10/11，支持 `.exe` & `.msi` |
| **macOS** | 🚧 适配中 | 计划支持 `.dmg` 与 `.app` (Intel/Apple Silicon) |
| **Linux** | 📅 规划中 | 视后续社区反馈而定 |

---

### 📦 开发与构建

#### 1. 环境准备
确保你的系统已安装：
* **Node.js** (推荐 v18+)
* **Rust** (使用 [rustup](https://rustup.rs/) 安装)
* **Windows 用户**: 需要 Visual Studio Build Tools 或 WebView2

#### 2. 安装依赖
```npm install```


#### 3. 开发调试
```npm run tauri dev```

#### 4. 打包构建
```npm run tauri build```
