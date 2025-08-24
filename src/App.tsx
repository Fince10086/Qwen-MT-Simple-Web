import React, { useEffect, useState } from 'react'
import Header from './components/Header'
import Footer from './components/Footer'
import LanguageSelector from './components/LanguageSelector'
import ModelSelector from './components/ModelSelector'
import TranslationPanel from './components/TranslationPanel'
import HistoryPanel from './components/HistoryPanel'
import ErrorBoundary from './components/ErrorBoundary'
import { useTranslationStore } from './stores/translationStore'
import { TranslationRecord } from './types'
import { ExclamationTriangleIcon, XMarkIcon } from '@heroicons/react/24/outline'

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
const TranslationContainer: React.FC = () => {
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
    setSourceLanguage,
    setTargetLanguage,
    setSelectedModel,
    setSourceText,
    swapLanguages,
    translate,
    clearTranslation,
    removeFromHistory,
    clearHistory,
    setError,
    initializeAPI
  } = useTranslationStore()
  
  // 初始化API
  useEffect(() => {
    initializeAPI()
  }, [initializeAPI])
  
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 错误提示 */}
        {error && (
          <ErrorAlert
            message={error}
            onClose={() => setError(null)}
          />
        )}
        
        <div className="space-y-8">
          {/* 欢迎信息 */}
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Qwen-MT 智能翻译
            </h1>
            <p className="mt-3 max-w-md mx-auto text-lg text-gray-500 sm:text-xl sm:max-w-3xl">
              基于通义千问模型的多语言翻译服务，支持92种语言互译
            </p>
          </div>
          
          {/* 配置区域 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <LanguageSelector
              sourceLanguage={sourceLanguage}
              targetLanguage={targetLanguage}
              availableLanguages={supportedLanguages}
              onSourceLanguageChange={setSourceLanguage}
              onTargetLanguageChange={setTargetLanguage}
              onSwapLanguages={swapLanguages}
              disabled={isTranslating}
            />
            
            <ModelSelector
              selectedModel={selectedModel}
              availableModels={availableModels}
              onModelChange={setSelectedModel}
              disabled={isTranslating}
            />
          </div>
          
          {/* 翻译面板 */}
          <TranslationPanel
            sourceText={sourceText}
            translatedText={translatedText}
            isTranslating={isTranslating}
            onSourceTextChange={setSourceText}
            onTranslate={translate}
            onClear={clearTranslation}
            disabled={false}
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

// 设置面板组件（简化版）
const SettingsPanel: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { apiRegion, setAPIRegion } = useTranslationStore()
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">设置</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              API 区域
            </label>
            <select
              value={apiRegion}
              onChange={(e) => setAPIRegion(e.target.value as 'beijing' | 'singapore')}
              className="select-field"
            >
              <option value="beijing">北京 (中国大陆)</option>
              <option value="singapore">新加坡 (国际)</option>
            </select>
            <p className="mt-1 text-sm text-gray-500">
              选择距离您最近的API服务区域以获得更好的性能
            </p>
          </div>
          
          <div className="pt-4 border-t border-gray-200">
            <h4 className="text-sm font-medium text-gray-900 mb-2">环境变量配置</h4>
            <div className="bg-gray-50 p-3 rounded text-sm">
              <p className="text-gray-600 mb-2">请在 .env 文件中配置：</p>
              <code className="block text-gray-800">
                VITE_DASHSCOPE_API_KEY=your_api_key_here<br />
                VITE_API_REGION={apiRegion}
              </code>
            </div>
          </div>
        </div>
        
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="btn-primary"
          >
            确定
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
      <div className="min-h-screen flex flex-col">
        <Header onSettingsClick={() => setShowSettings(true)} />
        
        <div className="flex-1">
          <TranslationContainer />
        </div>
        
        <Footer />
        
        {showSettings && (
          <SettingsPanel onClose={() => setShowSettings(false)} />
        )}
      </div>
    </ErrorBoundary>
  )
}

export default App