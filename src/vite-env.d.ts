/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DASHSCOPE_API_KEY?: string
  readonly VITE_API_REGION?: string
  // 更多环境变量...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}