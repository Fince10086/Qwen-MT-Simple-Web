import {
  QwenTranslationRequest,
  QwenTranslationResponse,
  QwenTranslationError,
  QwenTranslationErrorType,
  ModelInfo,
  APIConfig
} from '../types'
import { API_CONFIG, AVAILABLE_MODELS, ERROR_MESSAGES } from '../utils/constants'

/**
 * 错误处理工具函数
 */
export const handleQwenAPIError = (error: any): QwenTranslationError => {
  // HTTP 状态码错误
  if (error.response) {
    const status = error.response.status
    
    switch (status) {
      case 400:
        return new QwenTranslationError(
          QwenTranslationErrorType.INVALID_REQUEST, 
          error.response.data?.message || ERROR_MESSAGES.INVALID_REQUEST,
          status
        )
      case 401:
        return new QwenTranslationError(
          QwenTranslationErrorType.INVALID_API_KEY,
          ERROR_MESSAGES.INVALID_API_KEY,
          status
        )
      case 404:
        return new QwenTranslationError(
          QwenTranslationErrorType.MODEL_NOT_FOUND,
          ERROR_MESSAGES.MODEL_NOT_FOUND,
          status
        )
      case 413:
        return new QwenTranslationError(
          QwenTranslationErrorType.CONTEXT_LENGTH_EXCEEDED,
          ERROR_MESSAGES.CONTEXT_LENGTH_EXCEEDED,
          status
        )
      case 429:
        return new QwenTranslationError(
          QwenTranslationErrorType.API_RATE_LIMIT,
          ERROR_MESSAGES.API_RATE_LIMIT,
          status
        )
      case 500:
      case 502:
      case 503:
      case 504:
        return new QwenTranslationError(
          QwenTranslationErrorType.SERVER_ERROR,
          ERROR_MESSAGES.SERVER_ERROR,
          status
        )
      default:
        return new QwenTranslationError(
          QwenTranslationErrorType.TRANSLATION_FAILED,
          `HTTP ${status}: ${error.response.data?.message || 'Unknown error'}`,
          status
        )
    }
  }
  
  // 网络错误
  if (error.code === 'NETWORK_ERROR' || error.name === 'NetworkError' || !navigator.onLine) {
    return new QwenTranslationError(QwenTranslationErrorType.NETWORK_ERROR, ERROR_MESSAGES.NETWORK_ERROR)
  }
  
  // 默认错误
  return new QwenTranslationError(
    QwenTranslationErrorType.TRANSLATION_FAILED,
    error.message || ERROR_MESSAGES.TRANSLATION_FAILED
  )
}

/**
 * 重试机制处理器
 */
class RetryHandler {
  private maxRetries: number = 3
  private baseDelay: number = 1000 // 1秒
  
  async executeWithRetry<T>(
    operation: () => Promise<T>,
    errorHandler: (error: any) => QwenTranslationError
  ): Promise<T> {
    let lastError: QwenTranslationError
    
    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        return await operation()
      } catch (error) {
        lastError = errorHandler(error)
        
        // 不可重试的错误直接抛出
        if (!lastError.retryable || attempt === this.maxRetries) {
          throw lastError
        }
        
        // 指数退避等待
        const delay = this.baseDelay * Math.pow(2, attempt)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
    
    throw lastError!
  }
}

/**
 * Qwen-MT API 客户端类
 */
export class QwenTranslationAPI {
  private config: APIConfig
  private retryHandler: RetryHandler
  
  constructor(apiKey: string, region: 'beijing' | 'singapore' = 'beijing') {
    this.config = {
      apiKey,
      region,
      baseURL: region === 'singapore' 
        ? API_CONFIG.SINGAPORE_BASE_URL 
        : API_CONFIG.BEIJING_BASE_URL
    }
    this.retryHandler = new RetryHandler()
  }
  
  /**
   * 翻译文本
   */
  async translate(request: QwenTranslationRequest): Promise<QwenTranslationResponse> {
    const operation = async () => {
      const response = await fetch(`${this.config.baseURL}${API_CONFIG.CHAT_COMPLETIONS_ENDPOINT}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(request)
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw {
          response: {
            status: response.status,
            data: errorData
          }
        }
      }
      
      return await response.json()
    }
    
    return this.retryHandler.executeWithRetry(operation, handleQwenAPIError)
  }
  
  /**
   * 流式翻译（可选功能）
   */
  async *translateStream(request: QwenTranslationRequest): AsyncGenerator<string> {
    const streamRequest = { ...request, stream: true }
    
    const response = await fetch(`${this.config.baseURL}${API_CONFIG.CHAT_COMPLETIONS_ENDPOINT}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(streamRequest)
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw handleQwenAPIError({
        response: {
          status: response.status,
          data: errorData
        }
      })
    }
    
    const reader = response.body?.getReader()
    if (!reader) throw new Error('No response body')
    
    const decoder = new TextDecoder()
    let buffer = ''
    
    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') return
            
            try {
              const parsed = JSON.parse(data)
              const content = parsed.choices?.[0]?.delta?.content
              if (content) yield content
            } catch (e) {
              // 忽略解析错误
              console.warn('Failed to parse SSE data:', e)
            }
          }
        }
      }
    } finally {
      reader.releaseLock()
    }
  }
  
  /**
   * 获取支持的模型列表
   */
  getAvailableModels(): ModelInfo[] {
    return AVAILABLE_MODELS
  }
  
  /**
   * 验证API配置
   */
  async validateConfig(): Promise<boolean> {
    try {
      console.log('开始验证API Key...', {
        region: this.config.region,
        baseURL: this.config.baseURL,
        apiKeyLength: this.config.apiKey.length,
        apiKeyPrefix: this.config.apiKey.substring(0, 10) + '...'
      })
      
      // 使用更简单的请求来验证API Key
      const testRequest = {
        model: 'qwen-mt-turbo',
        messages: [{ role: 'user', content: 'hello' }],
        translation_options: {
          source_lang: 'en',
          target_lang: 'zh'
        },
        max_tokens: 10  // 限制token数量以降低成本
      }
      
      console.log('发送验证请求:', testRequest)
      
      const response = await fetch(`${this.config.baseURL}${API_CONFIG.CHAT_COMPLETIONS_ENDPOINT}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(testRequest)
      })
      
      console.log('验证响应状态:', response.status, response.statusText)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('验证失败，错误详情:', {
          status: response.status,
          statusText: response.statusText,
          errorData
        })
        
        // 抛出详细错误以便上层处理
        throw {
          response: {
            status: response.status,
            data: errorData
          }
        }
      }
      
      const result = await response.json()
      console.log('验证成功，API响应:', result)
      
      return true
    } catch (error) {
      console.error('API Key验证过程中发生错误:', error)
      
      const translationError = handleQwenAPIError(error)
      console.error('处理后的错误:', translationError)
      
      // 只有在确实是API Key无效时才返回false
      if (translationError.type === QwenTranslationErrorType.INVALID_API_KEY) {
        return false
      }
      
      // 对于其他类型的错误，我们假设API Key是有效的，但存在其他问题
      console.warn('验证过程中遇到非API Key相关错误，假设API Key有效')
      throw translationError  // 抛出错误以便上层显示具体错误信息
    }
  }
  
  /**
   * 更新配置
   */
  updateConfig(apiKey: string, region: 'beijing' | 'singapore' = 'beijing'): void {
    this.config = {
      apiKey,
      region,
      baseURL: region === 'singapore' 
        ? API_CONFIG.SINGAPORE_BASE_URL 
        : API_CONFIG.BEIJING_BASE_URL
    }
  }
}

/**
 * 创建API实例的工厂函数
 */
export const createQwenAPI = (
  apiKey?: string, 
  region?: 'beijing' | 'singapore'
): QwenTranslationAPI => {
  // 优先使用传入的apiKey，再考虑环境变量
  const key = apiKey || import.meta.env.VITE_DASHSCOPE_API_KEY
  const apiRegion = region || import.meta.env.VITE_API_REGION || 'beijing'
  
  if (!key) {
    throw new QwenTranslationError(
      QwenTranslationErrorType.INVALID_API_KEY,
      'API Key is required. Please provide an API Key or set VITE_DASHSCOPE_API_KEY in your environment variables.'
    )
  }
  
  return new QwenTranslationAPI(key, apiRegion as 'beijing' | 'singapore')
}

/**
 * 文本长度验证工具
 */
export const validateTextLength = (text: string, maxLength: number = 2000): boolean => {
  return text.length <= maxLength
}

/**
 * 语言代码验证工具
 */
export const validateLanguageCode = (code: string): boolean => {
  const supportedCodes = AVAILABLE_MODELS[0].supportedLanguages
  return supportedCodes.includes(code)
}

/**
 * 简化的翻译函数，用于快速调用
 */
export const quickTranslate = async (
  text: string,
  targetLang: string,
  sourceLang: string = 'auto',
  model: 'qwen-mt-plus' | 'qwen-mt-turbo' = 'qwen-mt-turbo'
): Promise<string> => {
  const api = createQwenAPI()
  
  const response = await api.translate({
    model,
    messages: [{ role: 'user', content: text }],
    translation_options: {
      source_lang: sourceLang,
      target_lang: targetLang
    }
  })
  
  return response.choices[0].message.content
}