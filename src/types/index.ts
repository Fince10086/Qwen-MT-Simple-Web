// 翻译记录接口
export interface TranslationRecord {
  id: string
  sourceText: string
  translatedText: string
  sourceLanguage: string
  targetLanguage: string
  model: string
  timestamp: Date
  tokenUsage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
}

// 支持的模型类型
export type QwenMTModel = 'qwen-mt-plus' | 'qwen-mt-turbo'

// 模型信息接口
export interface ModelInfo {
  id: QwenMTModel
  name: string
  description: string
  contextLength: number
  maxInput: number
  maxOutput: number
  inputCostPer1k: number // 每千token成本
  outputCostPer1k: number
  supportedLanguages: string[]
}

// 语言选项接口
export interface Language {
  code: string
  name: string
  nativeName: string
}

// API请求接口（基于阿里云百炼 DashScope API）
export interface QwenTranslationRequest {
  model: QwenMTModel
  messages: {
    role: 'user'
    content: string
  }[]
  translation_options: {
    source_lang: string // 支持 'auto' 自动检测
    target_lang: string
  }
  stream?: boolean
}

// API响应接口
export interface QwenTranslationResponse {
  id: string
  object: string
  created: number
  model: string
  choices: {
    index: number
    message: {
      role: string
      content: string
    }
    finish_reason: string
  }[]
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

// 错误类型枚举
export enum QwenTranslationErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  API_RATE_LIMIT = 'API_RATE_LIMIT', // 429
  INVALID_API_KEY = 'INVALID_API_KEY', // 401
  INVALID_REQUEST = 'INVALID_REQUEST', // 400
  MODEL_NOT_FOUND = 'MODEL_NOT_FOUND', // 404
  CONTEXT_LENGTH_EXCEEDED = 'CONTEXT_LENGTH_EXCEEDED', // 413
  SERVER_ERROR = 'SERVER_ERROR', // 5xx
  UNSUPPORTED_LANGUAGE = 'UNSUPPORTED_LANGUAGE',
  TRANSLATION_FAILED = 'TRANSLATION_FAILED'
}

// 翻译错误类
export class QwenTranslationError extends Error {
  public type: QwenTranslationErrorType
  public statusCode?: number
  public retryable: boolean
  
  constructor(
    type: QwenTranslationErrorType, 
    message?: string, 
    statusCode?: number
  ) {
    super(message)
    this.type = type
    this.statusCode = statusCode
    this.retryable = this.isRetryable(type)
    this.name = 'QwenTranslationError'
  }
  
  private isRetryable(type: QwenTranslationErrorType): boolean {
    return [
      QwenTranslationErrorType.NETWORK_ERROR,
      QwenTranslationErrorType.API_RATE_LIMIT,
      QwenTranslationErrorType.SERVER_ERROR
    ].includes(type)
  }
}

// 组件Props类型定义
export interface LanguageSelectorProps {
  sourceLanguage: string
  targetLanguage: string
  availableLanguages: Language[]
  onSourceLanguageChange: (language: string) => void
  onTargetLanguageChange: (language: string) => void
  onSwapLanguages: () => void
  disabled?: boolean
}

export interface ModelSelectorProps {
  selectedModel: QwenMTModel
  availableModels: ModelInfo[]
  onModelChange: (model: QwenMTModel) => void
  disabled?: boolean
}

export interface TranslationPanelProps {
  sourceText: string
  translatedText: string
  isTranslating: boolean
  onSourceTextChange: (text: string) => void
  onTranslate: () => void
  onClear: () => void
  disabled?: boolean
}

export interface HistoryPanelProps {
  history: TranslationRecord[]
  onHistoryItemClick: (record: TranslationRecord) => void
  onDeleteHistoryItem: (id: string) => void
  onClearHistory: () => void
}

// Store状态接口
export interface TranslationState {
  // 基础状态
  sourceLanguage: string
  targetLanguage: string
  selectedModel: QwenMTModel
  sourceText: string
  translatedText: string
  isTranslating: boolean
  history: TranslationRecord[]
  error: string | null
  
  // 配置状态
  availableModels: ModelInfo[]
  supportedLanguages: Language[]
  apiRegion: 'beijing' | 'singapore'
  
  // Actions
  setSourceLanguage: (language: string) => void
  setTargetLanguage: (language: string) => void
  setSelectedModel: (model: QwenMTModel) => void
  setSourceText: (text: string) => void
  setTranslatedText: (text: string) => void
  setError: (error: string | null) => void
  swapLanguages: () => void
  translate: () => Promise<void>
  clearTranslation: () => void
  addToHistory: (record: TranslationRecord) => void
  removeFromHistory: (id: string) => void
  clearHistory: () => void
  setAPIRegion: (region: 'beijing' | 'singapore') => void
  initializeAPI: () => void
}

// API配置类型
export interface APIConfig {
  apiKey: string
  region: 'beijing' | 'singapore'
  baseURL: string
}