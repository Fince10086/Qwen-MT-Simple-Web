import React, { useEffect, useState } from 'react'
import UnifiedTranslationPanel from './components/UnifiedTranslationPanel'
import HistoryPanel from './components/HistoryPanel'
import ErrorBoundary from './components/ErrorBoundary'
import APIKeySettings from './components/APIKeySettings'
import { useTranslationStore } from './stores/translationStore'
import { useAppInitialization } from './hooks'
import { TranslationRecord } from './types'
import { ExclamationTriangleIcon, XMarkIcon, CogIcon } from '@heroicons/react/24/outline'

// 错误提示组件
interface ErrorAlertProps {
  message: string
  onClose: () => void
}

const ErrorAlert: React.FC<ErrorAlertProps> = ({ message, onClose }) => {
  return (
    <div className="fixed top-4 right-4 max-w-md bg-red-50 border border-red-200 rounded-lg p-4 shadow-lg z-50">
      <div className="flex">
        <div className="flex-shrink-0">
          <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
        </div>
        <div className="ml-3">
          <p className="text-sm text-red-800">{message}</p>
        </div>
        <div className="ml-auto pl-3">
          <button
            onClick={onClose}
            className="inline-flex text-red-400 hover:text-red-600"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  )
}

// 主容器组件
interface TranslationContainerProps {
  onShowSettings: () => void
}

const TranslationContainer: React.FC<TranslationContainerProps> = ({ onShowSettings }) => {
  const {
    sourceLanguage,
    targetLanguage,
    selectedModel,
    sourceText,
    translatedText,
    isTranslating,
    history,
    error,
    availableModels,
    supportedLanguages,
    apiKey,
    isAPIKeyValid,
    setSourceLanguage,
    setTargetLanguage,
    setSelectedModel,
    setSourceText,
    swapLanguages,
    translate,
    clearTranslation,
    removeFromHistory,
    clearHistory,
    setError
  } = useTranslationStore()
  
  // 使用安全初始化Hook
  useAppInitialization()
  
  // 监听存储重置事件
  useEffect(() => {
    const handleStorageReset = (event: CustomEvent) => {
      console.log('存储重置事件:', event.detail)
      if (event.detail.reason === 'corrupted-data') {
        setError('检测到数据损坏，已重置为默认设置，请重新配置API Key')
      }
    }
    
    window.addEventListener('storage-reset', handleStorageReset as EventListener)
    
    return () => {
      window.removeEventListener('storage-reset', handleStorageReset as EventListener)
    }
  }, [setError])
  
  // 处理历史记录项点击
  const handleHistoryItemClick = (record: TranslationRecord) => {
    setSourceLanguage(record.sourceLanguage)
    setTargetLanguage(record.targetLanguage)
    setSelectedModel(record.model)
    setSourceText(record.sourceText)
    // 可选：同时设置翻译结果
    // setTranslatedText(record.translatedText)
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-6 py-4">
        {/* 错误提示 */}
        {error && (
          <ErrorAlert
            message={error}
            onClose={() => setError(null)}
          />
        )}
        
        <div className="space-y-6">
          {/* 欢迎信息和设置 */}
          <div className="text-center relative">
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              Qwen-MT 翻译
            </h1>
            
            {/* 设置按钮 */}
            <button
              onClick={onShowSettings}
              className="absolute top-0 right-0 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
              title="设置"
            >
              <CogIcon className="w-5 h-5" />
            </button>
          </div>
          
          {/* 统一翻译面板 */}
          <UnifiedTranslationPanel
            sourceText={sourceText}
            translatedText={translatedText}
            isTranslating={isTranslating}
            onSourceTextChange={setSourceText}
            onTranslate={translate}
            onClear={clearTranslation}
            sourceLanguage={sourceLanguage}
            targetLanguage={targetLanguage}
            availableLanguages={supportedLanguages}
            onSourceLanguageChange={setSourceLanguage}
            onTargetLanguageChange={setTargetLanguage}
            onSwapLanguages={swapLanguages}
            selectedModel={selectedModel}
            availableModels={availableModels}
            onModelChange={setSelectedModel}
            apiKey={apiKey}
            isAPIKeyValid={isAPIKeyValid}
            disabled={!apiKey || !isAPIKeyValid}
          />
          
          {/* 历史记录面板 */}
          <HistoryPanel
            history={history}
            onHistoryItemClick={handleHistoryItemClick}
            onDeleteHistoryItem={removeFromHistory}
            onClearHistory={clearHistory}
          />
        </div>
      </main>
    </div>
  )
}

// 设置面板组件（完整版）
const SettingsPanel: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { 
    apiRegion, 
    apiKey,
    isAPIKeyValid,
    isValidatingAPIKey,
    setAPIRegion,
    setAPIKey,
    validateAPIKey
  } = useTranslationStore()
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900">设置</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
        
        <div className="space-y-6">
          {/* API Key 设置 */}
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-4">API Key 配置</h4>
            <APIKeySettings
              apiKey={apiKey}
              isValid={isAPIKeyValid}
              isValidating={isValidatingAPIKey}
              region={apiRegion}
              onAPIKeyChange={setAPIKey}
              onValidate={validateAPIKey}
            />
          </div>
          
          {/* 分隔线 */}
          <div className="border-t border-gray-200" />
          
          {/* API 区域设置 */}
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-4">API 区域</h4>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                服务区域
              </label>
              <select
                value={apiRegion}
                onChange={(e) => setAPIRegion(e.target.value as 'beijing' | 'singapore')}
                className="select-field"
              >
                <option value="beijing">北京 (中国大陆)</option>
                <option value="singapore">新加坡 (国际)</option>
              </select>
              <p className="mt-2 text-sm text-gray-500">
                选择距离您最近的API服务区域以获得更好的性能
              </p>
            </div>
          </div>
          
          {/* 分隔线 */}
          <div className="border-t border-gray-200" />
          
          {/* 环境变量配置提示 */}
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-4">环境变量配置</h4>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-3">您也可以在 .env 文件中配置：</p>
              <code className="block text-sm text-gray-800 bg-white p-3 rounded border">
                VITE_DASHSCOPE_API_KEY=your_api_key_here<br />
                VITE_API_REGION={apiRegion}
              </code>
              <p className="mt-3 text-xs text-gray-500">
                注意：网页设置优先级高于环境变量配置
              </p>
            </div>
          </div>
        </div>
        
        <div className="mt-8 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="btn-secondary"
          >
            取消
          </button>
          <button
            onClick={onClose}
            className="btn-primary"
          >
            完成
          </button>
        </div>
      </div>
    </div>
  )
}

// 主App组件
const App: React.FC = () => {
  const [showSettings, setShowSettings] = useState(false)
  
  return (
    <ErrorBoundary>
      <div className="min-h-screen">
        <TranslationContainer onShowSettings={() => setShowSettings(true)} />
        
        {showSettings && (
          <SettingsPanel onClose={() => setShowSettings(false)} />
        )}
      </div>
    </ErrorBoundary>
  )
}

export default App