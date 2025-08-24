# 快速启动指南

## 1. 环境配置

### 获取 API Key
1. 访问 [阿里云百炼控制台](https://bailian.console.aliyun.com/)
2. 登录阿里云账号
3. 在模型服务中找到 Qwen-MT 系列模型
4. 创建或获取您的 API Key

### 配置环境变量
复制 `.env.example` 为 `.env` 并填入您的配置：

```bash
cp .env.example .env
```

编辑 `.env` 文件：
```
VITE_DASHSCOPE_API_KEY=sk-your-actual-api-key-here
VITE_API_REGION=beijing
```

## 2. 安装和运行

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

## 3. 功能测试

### 基本翻译测试
1. 打开应用 (http://localhost:3000)
2. 选择源语言和目标语言
3. 选择翻译模型 (建议先选择 Qwen-MT Turbo)
4. 输入测试文本: "Hello, world!"
5. 点击翻译按钮

### 预期结果
- 应该能看到翻译结果
- 翻译记录自动保存到历史
- 可以复制翻译结果

## 4. 常见问题

### API Key 错误
- 检查 API Key 是否正确
- 确认账户已开通百炼服务
- 检查 API Key 权限

### 网络错误
- 检查网络连接
- 尝试切换API区域 (beijing/singapore)

### 翻译质量问题
- 尝试使用 Qwen-MT Plus 模型
- 确保源语言选择正确
- 检查文本长度是否超限

## 5. 部署建议

### 环境变量安全
- 不要在客户端暴露真实的 API Key
- 考虑使用代理服务器
- 生产环境使用后端 API

### 性能优化
- 启用 CDN
- 配置适当的缓存策略
- 使用生产构建版本

---

更多详细信息请参考 README.md 文件。