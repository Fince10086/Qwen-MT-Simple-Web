import React, { useEffect, useState } from 'react'
import TranslationPanel from './components/TranslationPanel'
import HistoryPanel from './components/HistoryPanel'
import ErrorBoundary from './components/ErrorBoundary'
import SettingsPanel from './components/SettingsPanel'
import Sidebar from './components/Sidebar'
import ErrorAlert from './components/ErrorAlert'
import { useTranslationStore } from './stores/translationStore'
import { useAppInitialization } from './hooks'
import { TranslationRecord } from './types'

// 主容器组件 - 通义风格
interface TranslationContainerProps {
  activeTab: 'translate' | 'history' | 'settings'
}

const TranslationContainer: React.FC<TranslationContainerProps> = ({ activeTab }) => {
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
    enabledLanguages,
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
  
  // 创建过滤后的语言列表
  const filteredLanguages = supportedLanguages.filter(lang => 
    enabledLanguages.includes(lang.code)
  )
  
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
    <div className="tongyi-page lg:ml-20 pb-20 lg:pb-0">
      {/* 错误提示 */}
      {error && (
        <div role="alert" aria-live="assertive">
          <ErrorAlert
            message={error}
            onClose={() => setError(null)}
          />
        </div>
      )}
      
      {/* 主内容区域 */}
      <main className="lg:mx-auto lg:px-6 lg:py-8" role="main">
        {/* 翻译面板 */}
        {activeTab === 'translate' && (
          <section aria-labelledby="translation-heading">
            <h1 id="translation-heading" className="sr-only">
              翻译
            </h1>
            <TranslationPanel
              sourceText={sourceText}
              translatedText={translatedText}
              isTranslating={isTranslating}
              onSourceTextChange={setSourceText}
              onTranslate={translate}
              onClear={clearTranslation}
              sourceLanguage={sourceLanguage}
              targetLanguage={targetLanguage}
              availableLanguages={filteredLanguages}
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
          </section>
        )}
        
        {/* 历史记录面板 */}
        {activeTab === 'history' && (
            <section aria-labelledby="history-heading">
              <h1 id="history-heading" className="sr-only">
                历史记录
              </h1>
              <HistoryPanel
                history={history}
                onHistoryItemClick={handleHistoryItemClick}
                onDeleteHistoryItem={removeFromHistory}
                onClearHistory={clearHistory}
              />
            </section>
        )}
        
        {/* 设置面板 */}
        {activeTab === 'settings' && (
          <section aria-labelledby="settings-heading">
            <h1 id="settings-heading" className="sr-only">
              设置
            </h1>
            <SettingsPanel />
          </section>
        )}
      </main>
    </div>
  )
}

// 主App组件
const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'translate' | 'history' | 'settings'>('translate')
  
  const handleTabChange = (tab: 'translate' | 'history' | 'settings') => {
    setActiveTab(tab)
    // 当切换标签页时，通知屏幕阅读器
    const pageNames = {
      translate: '翻译页面',
      history: '历史记录页面', 
      settings: '设置页面'
    }
    // 创建一个临时的通知元素
    const announcement = document.createElement('div')
    announcement.setAttribute('aria-live', 'polite')
    announcement.setAttribute('aria-atomic', 'true')
    announcement.className = 'sr-only'
    announcement.textContent = `已切换到${pageNames[tab]}`
    document.body.appendChild(announcement)
    setTimeout(() => {
      document.body.removeChild(announcement)
    }, 1000)
  }
  
  return (
    <ErrorBoundary>
      <div className="min-h-screen">
        {/* 跃过链接 - 无障碍导航 */}
        <a 
          href="#main-content" 
          className="skip-link"
          onFocus={(e) => e.target.style.left = '6px'}
          onBlur={(e) => e.target.style.left = '-9999px'}
        >
          跳过到主要内容
        </a>
        
        {/* 实时通知区域，用于屏幕阅读器 */}
        <div 
          aria-live="polite" 
          aria-atomic="true" 
          className="sr-live"
          id="live-region"
        ></div>
        
        {/* 左侧边栏 */}
        <Sidebar 
          activeTab={activeTab}
          onTabChange={handleTabChange}
          onShowSettings={() => setActiveTab('settings')}
        />
        
        {/* 主内容区域 */}
        <div id="main-content">
          <TranslationContainer 
            activeTab={activeTab}
          />
        </div>
      </div>
    </ErrorBoundary>
  )
}

export default App