# Qwen-MT 翻译网站

基于通义千问模型的智能翻译服务，支持92种语言互译。

## 功能特性

- ✨ **多语言支持**: 支持92种语言互译，包括中、英、日、韩等主流语言
- 🤖 **智能模型**: 提供 Qwen-MT Plus 和 Qwen-MT Turbo 两种模型选择
- ⚡ **实时翻译**: 快速响应，高质量翻译结果
- 📝 **翻译历史**: 自动保存翻译记录，支持搜索和管理
- 📱 **响应式设计**: 完美适配桌面端和移动端
- 🎨 **现代UI**: 基于 Tailwind CSS 的美观界面

## 技术栈

- **前端框架**: React 18 + TypeScript
- **构建工具**: Vite
- **样式框架**: Tailwind CSS
- **状态管理**: Zustand
- **UI组件**: Headless UI
- **图标**: Heroicons
- **翻译API**: 阿里云百炼 DashScope (Qwen-MT)

## 快速开始

### 1. 环境要求

- Node.js 18.0.0 或更高版本
- npm 或 yarn 包管理器

### 2. 安装依赖

```bash
npm install
```

### 3. 环境配置

复制环境变量示例文件：

```bash
cp .env.example .env
```

编辑 `.env` 文件，配置您的 API Key：

```env
# Qwen-MT API 配置
VITE_DASHSCOPE_API_KEY=your_dashscope_api_key_here
VITE_API_REGION=beijing

# 可选的API区域: beijing | singapore
# beijing: https://dashscope.aliyuncs.com/compatible-mode/v1
# singapore: https://dashscope-intl.aliyuncs.com/compatible-mode/v1
```

### 4. 获取 API Key

1. 访问 [阿里云百炼控制台](https://bailian.console.aliyun.com/)
2. 登录您的阿里云账号
3. 在左侧菜单选择「模型」
4. 找到 Qwen-MT 系列模型
5. 创建或查看您的 API Key

### 5. 启动开发服务器

```bash
npm run dev
```

应用将在 `http://localhost:3000` 启动。

### 6. 构建生产版本

```bash
npm run build
```

构建文件将输出到 `dist` 目录。

## 使用指南

### 基本翻译

1. 选择源语言和目标语言
2. 选择合适的翻译模型：
   - **Qwen-MT Plus**: 高质量翻译，适合重要文档
   - **Qwen-MT Turbo**: 快速翻译，适合日常使用
3. 在源文本框输入要翻译的文本
4. 点击「翻译」按钮或使用快捷键 `Ctrl/Cmd + Enter`

### 快捷操作

- **快速翻译**: `Ctrl/Cmd + Enter`
- **交换语言**: 点击「交换语言」按钮
- **复制结果**: 点击复制按钮
- **清空文本**: 点击清空按钮

### 历史记录

- 所有翻译记录会自动保存到本地
- 支持搜索历史记录
- 可以重新使用历史翻译
- 可以删除单条记录或清空所有历史

## 模型对比

| 特性 | Qwen-MT Plus | Qwen-MT Turbo |
|------|--------------|---------------|
| 翻译质量 | 高质量 | 标准质量 |
| 响应速度 | 较快 | 极快 |
| 成本 | 较高 | 较低 |
| 适用场景 | 重要文档、专业翻译 | 日常翻译、批量处理 |
| 输入成本 | ¥1.8/1K tokens | ¥0.7/1K tokens |
| 输出成本 | ¥5.4/1K tokens | ¥1.95/1K tokens |

## 支持的语言

支持92种语言，包括但不限于：

**主流语言**:
- 中文 (Chinese)
- 英语 (English) 
- 日语 (Japanese)
- 韩语 (Korean)
- 法语 (French)
- 西班牙语 (Spanish)
- 德语 (German)
- 俄语 (Russian)

**亚洲语言**:
- 泰语 (Thai)
- 越南语 (Vietnamese)
- 印尼语 (Indonesian)
- 马来语 (Malay)
- 印地语 (Hindi)
- 阿拉伯语 (Arabic)

更多语言请参考应用内的语言选择器。

## API 配置

### 区域选择

- **北京**: 适合中国大陆用户，延迟更低
- **新加坡**: 适合国际用户，海外访问更稳定

### 使用限制

- 单次翻译最大长度: 2000 字符
- 上下文长度: 4096 tokens
- 建议合理控制调用频率，避免触发限流

## 开发指南

### 项目结构

```
src/
├── components/          # React 组件
│   ├── Header.tsx      # 页面头部
│   ├── Footer.tsx      # 页面底部
│   ├── LanguageSelector.tsx  # 语言选择器
│   ├── ModelSelector.tsx     # 模型选择器
│   ├── TranslationPanel.tsx  # 翻译面板
│   └── HistoryPanel.tsx      # 历史记录面板
├── stores/             # 状态管理
│   └── translationStore.ts   # Zustand store
├── services/           # API 服务
│   └── qwenTranslationAPI.ts # Qwen-MT API 客户端
├── types/              # TypeScript 类型定义
│   └── index.ts
├── utils/              # 工具函数和常量
│   └── constants.ts
├── App.tsx             # 主应用组件
├── main.tsx            # 应用入口
└── index.css           # 全局样式
```

### 自定义配置

可以通过修改 `src/utils/constants.ts` 来自定义：

- 支持的语言列表
- 模型配置信息
- 默认设置
- 错误消息

### 状态管理

使用 Zustand 进行状态管理，主要状态包括：

- 翻译配置 (语言、模型)
- 翻译内容 (源文本、译文)
- 翻译状态 (加载中、错误)
- 历史记录

## 常见问题

### Q: API Key 无效怎么办？

A: 请检查以下几点：
1. 确认 API Key 正确无误
2. 确认您的阿里云账户已开通百炼服务
3. 确认 API Key 具有调用 Qwen-MT 模型的权限

### Q: 翻译速度很慢怎么办？

A: 可以尝试：
1. 选择 Qwen-MT Turbo 模型
2. 切换到距离更近的 API 区域
3. 检查网络连接状况

### Q: 翻译质量不满意怎么办？

A: 建议：
1. 使用 Qwen-MT Plus 模型
2. 提供更清晰、完整的源文本
3. 选择正确的源语言和目标语言

### Q: 支持批量翻译吗？

A: 当前版本不支持批量翻译，但您可以：
1. 使用历史记录功能管理多个翻译
2. 复制粘贴多段文本分别翻译

## 许可证

本项目基于 MIT 许可证开源。

## 贡献

欢迎提交 Issue 和 Pull Request 来改进这个项目。

## 相关链接

- [Qwen-MT 模型文档](https://help.aliyun.com/zh/model-studio/machine-translation)
- [阿里云百炼控制台](https://bailian.console.aliyun.com/)
- [通义千问](https://tongyi.aliyun.com/)

---

如有问题，请通过 GitHub Issues 联系我们。