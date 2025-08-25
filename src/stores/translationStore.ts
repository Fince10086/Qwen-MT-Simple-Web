import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { 
  TranslationState, 
  TranslationRecord, 
  QwenMTModel,
  QwenTranslationError,
  QwenTranslationErrorType 
} from '../types'
import { createQwenAPI } from '../services/qwenTranslationAPI'
import { 
  DEFAULT_CONFIG, 
  AVAILABLE_MODELS, 
  SUPPORTED_LANGUAGES,
  DEFAULT_ENABLED_LANGUAGES
} from '../utils/constants'

interface TranslationStore extends TranslationState {}

export const useTranslationStore = create<TranslationStore>()(
  persist(
    (set, get) => ({
      // 基础状态
      sourceLanguage: DEFAULT_CONFIG.SOURCE_LANGUAGE,
      targetLanguage: DEFAULT_CONFIG.TARGET_LANGUAGE,
      selectedModel: DEFAULT_CONFIG.MODEL,
      sourceText: '',
      translatedText: '',
      isTranslating: false,
      history: [],
      error: null,
      
      // 配置状态
      availableModels: AVAILABLE_MODELS,
      supportedLanguages: SUPPORTED_LANGUAGES,
      enabledLanguages: DEFAULT_ENABLED_LANGUAGES,
      apiRegion: DEFAULT_CONFIG.API_REGION,
      apiKey: '',
      isAPIKeyValid: false,
      isValidatingAPIKey: false,
      
      // Actions
      setSourceLanguage: (language: string) => {
        set({ sourceLanguage: language, error: null })
      },
      
      setTargetLanguage: (language: string) => {
        set({ targetLanguage: language, error: null })
      },
      
      setSelectedModel: (model: QwenMTModel) => {
        set({ selectedModel: model, error: null })
      },
      
      setSourceText: (text: string) => {
        set({ sourceText: text, error: null })
        
        // 自动清空翻译结果当源文本改变
        if (text !== get().sourceText) {
          set({ translatedText: '' })
        }
      },
      
      setTranslatedText: (text: string) => {
        set({ translatedText: text })
      },
      
      setError: (error: string | null) => {
        set({ error })
      },
      
      swapLanguages: () => {
        const { sourceLanguage, targetLanguage, sourceText, translatedText } = get()
        
        set({
          sourceLanguage: targetLanguage,
          targetLanguage: sourceLanguage,
          sourceText: translatedText,
          translatedText: sourceText,
          error: null
        })
      },
      
      translate: async () => {
        const state = get()
        const { sourceText, sourceLanguage, targetLanguage, selectedModel } = state
        
        // 验证输入
        if (!sourceText.trim()) {
          set({ error: '请输入要翻译的文本' })
          return
        }
        
        if (sourceLanguage === targetLanguage && sourceLanguage !== 'auto') {
          set({ error: '源语言和目标语言不能相同' })
          return
        }
        
        // 检查文本长度
        if (sourceText.length > DEFAULT_CONFIG.MAX_TEXT_LENGTH) {
          set({ error: `文本长度超出限制（最大${DEFAULT_CONFIG.MAX_TEXT_LENGTH}字符）` })
          return
        }
        
        set({ isTranslating: true, error: null })
        
        try {
          const { apiKey, apiRegion } = state
          
          // 检查API Key是否存在
          if (!apiKey || !apiKey.trim()) {
            set({ error: '请先在设置中配置API Key' })
            return
          }
          
          const api = createQwenAPI(apiKey, apiRegion)
          
          const response = await api.translate({
            model: selectedModel,
            messages: [{ role: 'user', content: sourceText }],
            translation_options: {
              source_lang: sourceLanguage,
              target_lang: targetLanguage
            }
          })
          
          const translatedText = response.choices[0].message.content
          
          // 创建历史记录
          const record: TranslationRecord = {
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            sourceText: sourceText.trim(),
            translatedText,
            sourceLanguage,
            targetLanguage,
            model: selectedModel,
            timestamp: new Date(),
            tokenUsage: {
              promptTokens: response.usage.prompt_tokens,
              completionTokens: response.usage.completion_tokens,
              totalTokens: response.usage.total_tokens
            }
          }
          
          set({
            translatedText,
            history: [record, ...state.history.slice(0, DEFAULT_CONFIG.HISTORY_LIMIT - 1)]
          })
        } catch (error) {
          const translationError = error as QwenTranslationError
          let errorMessage = translationError.message
          
          // 针对特定错误类型提供更友好的提示
          switch (translationError.type) {
            case QwenTranslationErrorType.INVALID_API_KEY:
              errorMessage = 'API Key 无效，请检查环境变量配置'
              break
            case QwenTranslationErrorType.API_RATE_LIMIT:
              errorMessage = 'API 调用频率过高，请稍后再试'
              break
            case QwenTranslationErrorType.NETWORK_ERROR:
              errorMessage = '网络连接失败，请检查网络状态'
              break
            case QwenTranslationErrorType.CONTEXT_LENGTH_EXCEEDED:
              errorMessage = '文本过长，请缩短后重试'
              break
          }
          
          set({ error: errorMessage })
          console.error('Translation error:', translationError)
        } finally {
          set({ isTranslating: false })
        }
      },
      
      clearTranslation: () => {
        set({
          sourceText: '',
          translatedText: '',
          error: null
        })
      },
      
      addToHistory: (record: TranslationRecord) => {
        const { history } = get()
        set({
          history: [record, ...history.slice(0, DEFAULT_CONFIG.HISTORY_LIMIT - 1)]
        })
      },
      
      removeFromHistory: (id: string) => {
        const { history } = get()
        set({
          history: history.filter(record => record.id !== id)
        })
      },
      
      clearHistory: () => {
        set({ history: [] })
      },
      
      setAPIRegion: (region: 'beijing' | 'singapore') => {
        set({ apiRegion: region, error: null })
      },
      
      setAPIKey: async (apiKey: string) => {
        set({ apiKey: apiKey.trim(), error: null })
        
        // 如果API Key不为空，自动验证
        if (apiKey.trim()) {
          await get().validateAPIKey()
        } else {
          set({ isAPIKeyValid: false })
        }
      },
      
      validateAPIKey: async (): Promise<boolean> => {
        const { apiKey, apiRegion } = get()
        
        if (!apiKey.trim()) {
          set({ isAPIKeyValid: false, error: 'API Key不能为空' })
          return false
        }
        
        set({ isValidatingAPIKey: true, error: null })
        
        try {
          console.log('开始验证API Key...', {
            apiKeyLength: apiKey.length,
            region: apiRegion
          })
          
          const api = createQwenAPI(apiKey, apiRegion)
          const isValid = await api.validateConfig()
          
          console.log('API Key验证结果:', isValid)
          
          set({ 
            isAPIKeyValid: isValid,
            error: isValid ? null : 'API Key验证失败，请检查是否正确'
          })
          
          return isValid
        } catch (error) {
          console.error('API Key验证过程出错:', error)
          
          const translationError = error as QwenTranslationError
          let errorMessage = 'API Key验证失败'
          
          // 根据错误类型提供更具体的错误信息
          switch (translationError.type) {
            case QwenTranslationErrorType.INVALID_API_KEY:
              errorMessage = 'API Key无效，请检查是否正确输入'
              break
            case QwenTranslationErrorType.NETWORK_ERROR:
              errorMessage = '网络连接失败，请检查网络状态或尝试更换区域'
              break
            case QwenTranslationErrorType.API_RATE_LIMIT:
              errorMessage = 'API调用频率过高，请稍后再试'
              break
            case QwenTranslationErrorType.SERVER_ERROR:
              errorMessage = '服务器错误，请稍后再试或联系技术支持'
              break
            default:
              // 显示具体的错误信息
              errorMessage = `验证失败: ${translationError.message}`
              
              // 如果有HTTP状态码，显示出来
              if (translationError.statusCode) {
                errorMessage += ` (HTTP ${translationError.statusCode})`
              }
          }
          
          console.error('最终错误信息:', errorMessage)
          
          set({ 
            isAPIKeyValid: false, 
            error: errorMessage 
          })
          
          return false
        } finally {
          set({ isValidatingAPIKey: false })
        }
      },
      
      initializeAPI: async () => {
        try {
          const state = get()
          let { apiKey } = state
          
          console.log('初始化API...', {
            hasStoredKey: !!apiKey,
            hasEnvKey: !!import.meta.env.VITE_DASHSCOPE_API_KEY
          })
          
          // 如果没有设置API Key，尝试从环境变量获取
          if (!apiKey && import.meta.env.VITE_DASHSCOPE_API_KEY) {
            apiKey = import.meta.env.VITE_DASHSCOPE_API_KEY
            set({ apiKey })
            console.log('从环境变量加载API Key')
          }
          
          // 初始化时验证API配置（但不阻塞应用启动）
          if (apiKey && apiKey.trim()) {
            console.log('开始验证存储的API Key...')
            // 使用setTimeout避免阻塞应用初始化
            setTimeout(async () => {
              try {
                await get().validateAPIKey()
              } catch (error) {
                console.warn('API Key初始化验证失败，但不影响应用启动:', error)
              }
            }, 100)
          } else {
            // 如果没有API Key，设置提示但不是错误
            console.log('未找到API Key，需要用户手动配置')
            // 也使用延迟设置，避免干扰初始化
            setTimeout(() => {
              const currentState = get()
              if (!currentState.apiKey) {
                set({ error: '请在设置中配置API Key以使用翻译功能' })
              }
            }, 500)
          }
          
          console.log('API初始化完成')
        } catch (error) {
          console.error('API初始化过程出错:', error)
          // 不设置错误状态，避免影响应用正常启动
        }
      },

      setEnabledLanguages: (languages: string[]) => {
        // 确保自动检测在列表中
        const enabledLanguages = languages.includes('auto') ? languages : ['auto', ...languages]
        set({ enabledLanguages, error: null })
        
        // 如果当前选中的源语言或目标语言不在新的列表中，重置为默认值
        const { sourceLanguage, targetLanguage } = get()
        if (!enabledLanguages.includes(sourceLanguage)) {
          set({ sourceLanguage: DEFAULT_CONFIG.SOURCE_LANGUAGE })
        }
        if (!enabledLanguages.includes(targetLanguage)) {
          set({ targetLanguage: DEFAULT_CONFIG.TARGET_LANGUAGE })
        }
      }
    }),
    {
      name: 'qwen-translation-storage',
      partialize: (state) => ({
        // 只持久化特定字段
        history: state.history,
        selectedModel: state.selectedModel,
        sourceLanguage: state.sourceLanguage,
        targetLanguage: state.targetLanguage,
        apiRegion: state.apiRegion,
        apiKey: state.apiKey, // 持久化API Key
        isAPIKeyValid: state.isAPIKeyValid,
        enabledLanguages: state.enabledLanguages // 持久化用户选择的语言
      }),
      version: 2, // 增加版本号
      migrate: (persistedState: any, version: number) => {
        try {
          // 版本迁移逻辑
          if (version === 0) {
            // 从版本0升级到版本1的逻辑
            persistedState = {
              ...persistedState,
              apiRegion: DEFAULT_CONFIG.API_REGION
            }
          }
          
          if (version <= 1) {
            // 从版本1升级到版本2：修复历史记录中的时间戳问题
            if (persistedState.history && Array.isArray(persistedState.history)) {
              persistedState.history = persistedState.history.map((record: any) => {
                // 确保timestamp是Date对象
                if (record.timestamp && typeof record.timestamp === 'string') {
                  record.timestamp = new Date(record.timestamp)
                }
                return record
              })
            }
          }
          
          return persistedState
        } catch (error) {
          console.error('数据迁移失败，使用默认配置:', error)
          // 如果迁移失败，返回默认状态
          return {
            history: [],
            selectedModel: DEFAULT_CONFIG.MODEL,
            sourceLanguage: DEFAULT_CONFIG.SOURCE_LANGUAGE,
            targetLanguage: DEFAULT_CONFIG.TARGET_LANGUAGE,
            apiRegion: DEFAULT_CONFIG.API_REGION,
            apiKey: '',
            isAPIKeyValid: false
          }
        }
      },
      // 添加数据验证函数
      onRehydrateStorage: () => (state) => {
        if (state) {
          try {
            // 验证和修复持久化的数据
            if (state.history && Array.isArray(state.history)) {
              state.history = state.history.filter((record: any) => {
                // 检查记录的完整性
                return record && 
                       typeof record.id === 'string' &&
                       typeof record.sourceText === 'string' &&
                       typeof record.translatedText === 'string' &&
                       typeof record.sourceLanguage === 'string' &&
                       typeof record.targetLanguage === 'string'
              }).map((record: any) => {
                // 确保timestamp是Date对象
                if (!(record.timestamp instanceof Date)) {
                  record.timestamp = new Date(record.timestamp)
                }
                return record
              })
            }
            
            // 验证其他字段
            if (!state.selectedModel || !AVAILABLE_MODELS.find(m => m.id === state.selectedModel)) {
              state.selectedModel = DEFAULT_CONFIG.MODEL
            }
            
            if (!state.sourceLanguage || !SUPPORTED_LANGUAGES.find(l => l.code === state.sourceLanguage)) {
              state.sourceLanguage = DEFAULT_CONFIG.SOURCE_LANGUAGE
            }
            
            if (!state.targetLanguage || !SUPPORTED_LANGUAGES.find(l => l.code === state.targetLanguage)) {
              state.targetLanguage = DEFAULT_CONFIG.TARGET_LANGUAGE
            }
            
            if (!state.apiRegion || !['beijing', 'singapore'].includes(state.apiRegion)) {
              state.apiRegion = DEFAULT_CONFIG.API_REGION
            }
            
            // 验证启用的语言列表
            if (!state.enabledLanguages || !Array.isArray(state.enabledLanguages)) {
              state.enabledLanguages = DEFAULT_ENABLED_LANGUAGES
            }
            
            console.log('数据恢复成功，历史记录数量:', state.history?.length || 0)
          } catch (error) {
            console.error('数据验证失败:', error)
            // 清理错误数据
            state.history = []
            state.error = '数据恢复时发生错误，已重置为默认设置'
          }
        }
      }
    }
  )
)

// 选择器函数，用于优化性能
export const useTranslationState = () => {
  return useTranslationStore((state) => ({
    sourceLanguage: state.sourceLanguage,
    targetLanguage: state.targetLanguage,
    selectedModel: state.selectedModel,
    sourceText: state.sourceText,
    translatedText: state.translatedText,
    isTranslating: state.isTranslating,
    error: state.error
  }))
}

export const useTranslationActions = () => {
  return useTranslationStore((state) => ({
    setSourceLanguage: state.setSourceLanguage,
    setTargetLanguage: state.setTargetLanguage,
    setSelectedModel: state.setSelectedModel,
    setSourceText: state.setSourceText,
    swapLanguages: state.swapLanguages,
    translate: state.translate,
    clearTranslation: state.clearTranslation,
    setError: state.setError
  }))
}

export const useTranslationHistory = () => {
  return useTranslationStore((state) => ({
    history: state.history,
    removeFromHistory: state.removeFromHistory,
    clearHistory: state.clearHistory
  }))
}

export const useTranslationConfig = () => {
  return useTranslationStore((state) => ({
    availableModels: state.availableModels,
    supportedLanguages: state.supportedLanguages,
    apiRegion: state.apiRegion,
    apiKey: state.apiKey,
    isAPIKeyValid: state.isAPIKeyValid,
    isValidatingAPIKey: state.isValidatingAPIKey,
    setAPIRegion: state.setAPIRegion,
    setAPIKey: state.setAPIKey,
    validateAPIKey: state.validateAPIKey,
    initializeAPI: state.initializeAPI
  }))
}