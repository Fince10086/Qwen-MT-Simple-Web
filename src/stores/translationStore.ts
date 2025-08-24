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
  SUPPORTED_LANGUAGES 
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
      apiRegion: DEFAULT_CONFIG.API_REGION,
      
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
        
        // 不能交换自动检测
        if (sourceLanguage === 'auto') {
          set({ error: '无法交换语言：源语言为自动检测' })
          return
        }
        
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
        const { sourceText, sourceLanguage, targetLanguage, selectedModel, apiRegion } = state
        
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
          const api = createQwenAPI(undefined, apiRegion)
          
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
      
      initializeAPI: () => {
        // 初始化时验证API配置
        try {
          createQwenAPI(undefined, get().apiRegion)
        } catch (error) {
          const translationError = error as QwenTranslationError
          set({ error: translationError.message })
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
        apiRegion: state.apiRegion
      }),
      version: 1,
      migrate: (persistedState: any, version: number) => {
        // 版本迁移逻辑
        if (version === 0) {
          // 从版本0升级到版本1的逻辑
          return {
            ...persistedState,
            apiRegion: DEFAULT_CONFIG.API_REGION
          }
        }
        return persistedState
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
    setAPIRegion: state.setAPIRegion,
    initializeAPI: state.initializeAPI
  }))
}