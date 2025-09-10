import React, { useState, Fragment } from 'react'
import { Listbox, Transition } from '@headlessui/react'
import {
  LanguageIcon,
  ClipboardDocumentIcon,
  TrashIcon,
  BookmarkIcon,
  ArrowsRightLeftIcon,
  ChevronUpDownIcon,
  CheckIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import { Language, QwenMTModel, ModelInfo } from '../types'

interface TranslationPanelProps {
  // 文本相关
  sourceText: string
  translatedText: string
  isTranslating: boolean
  onSourceTextChange: (text: string) => void
  onTranslate: () => void
  onClear: () => void
  
  // 语言配置
  sourceLanguage: string
  targetLanguage: string
  availableLanguages: Language[]
  onSourceLanguageChange: (language: string) => void
  onTargetLanguageChange: (language: string) => void
  onSwapLanguages: () => void
  
  // 模型配置
  selectedModel: QwenMTModel
  availableModels: ModelInfo[]
  onModelChange: (model: QwenMTModel) => void
  
  // API Key 状态
  apiKey?: string
  isAPIKeyValid?: boolean
  
  disabled?: boolean
}

interface ActionButtonProps {
  onClick: () => void
  disabled?: boolean
  children: React.ReactNode
  title?: string
  variant?: 'primary' | 'secondary' | 'danger'
  size?: 'sm' | 'md' | 'lg'
}

const ActionButton: React.FC<ActionButtonProps> = ({
  onClick,
  disabled = false,
  children,
  title,
  variant = 'secondary',
  size = 'md'
}) => {
  const baseClasses = 'inline-flex items-center justify-center rounded-2xl font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 disabled:hover:scale-100'
  
  const variants = {
    primary: 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white focus:ring-blue-500 border-0',
    secondary: 'bg-white hover:bg-gray-50 text-gray-700 focus:ring-gray-400 border border-gray-200 hover:border-gray-300',
    danger: 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white focus:ring-red-500 border-0'
  }
  
  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base font-semibold'
  }
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]}`}
      type="button"
      aria-label={title}
    >
      {children}
    </button>
  )
}

// 语言选择按钮组件
interface LanguageButtonProps {
  language: Language | undefined
  options: Language[]
  onChange: (language: string) => void
  disabled?: boolean
  label: string
}

const LanguageButton: React.FC<LanguageButtonProps> = ({
  language,
  options,
  onChange,
  disabled = false,
  label
}) => {
  return (
    <Listbox value={language?.code || ''} onChange={onChange} disabled={disabled}>
      <div className="relative">
        <Listbox.Label className="sr-only">{label}选择</Listbox.Label>
        <Listbox.Button 
          className="group flex items-center space-x-2 lg:space-x-3 bg-white rounded-xl px-2 lg:px-3 py-2.5 lg:py-3 border border-gray-200 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed min-w-[80px] lg:min-w-[100px] justify-center transform hover:scale-[1.02] disabled:hover:scale-10"
          aria-label={`当前${label}: ${language?.name || '未选择'}`}
          aria-haspopup="listbox"
          aria-expanded={false}
        >
          <span className="text-xs lg:text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors duration-200 truncate">
            {language?.name || label}
          </span>
          <ChevronUpDownIcon className="w-3 h-3 lg:w-4 lg:h-4 text-gray-400 group-hover:text-gray-600 transition-colors duration-200 flex-shrink-0" aria-hidden="true" />
        </Listbox.Button>
        
        <Transition
          as={Fragment}
          enter="transition ease-out duration-200"
          enterFrom="opacity-0 translate-y-1 scale-95"
          enterTo="opacity-100 translate-y-0 scale-100"
          leave="transition ease-in duration-150"
          leaveFrom="opacity-100 translate-y-0 scale-100"
          leaveTo="opacity-0 translate-y-1 scale-95"
        >
          <Listbox.Options className="absolute z-30 mt-2 w-full max-w-[160px] min-w-[140px] bg-white rounded-xl border border-gray-200 backdrop-blur-sm bg-white/95 focus:outline-none left-1/2 transform -translate-x-1/2">
            <div className="max-h-64 overflow-y-auto py-2 custom-scrollbar" role="listbox" aria-label={`${label}选项列表`}>
              {options.map((lang) => (
                <Listbox.Option
                  key={lang.code}
                  className={({ active, selected }) =>
                    `relative cursor-pointer select-none py-3 pl-4 pr-10 transition-colors duration-150 ${
                      active ? 'bg-blue-50 text-blue-900' : 'text-gray-900'
                    } ${
                      selected ? 'bg-blue-100 text-blue-800 font-medium' : ''
                    }`
                  }
                  value={lang.code}
                >
                  {({ selected, active }) => (
                    <>
                      <div className="flex items-center space-x-3">
                        <span className={`block truncate ${
                          selected ? 'font-semibold' : 'font-normal'
                        }`}>
                          {lang.name}
                          {lang.code === 'auto'}
                        </span>
                      </div>
                      {selected && (
                        <span className={`absolute inset-y-0 right-0 flex items-center pr-4 ${
                          active ? 'text-blue-600' : 'text-blue-600'
                        }`}>
                          <CheckIcon className="h-4 w-4" aria-hidden="true" />
                        </span>
                      )}
                    </>
                  )}
                </Listbox.Option>
              ))}
            </div>
          </Listbox.Options>
        </Transition>
      </div>
    </Listbox>
  )
}

// 模型切换按钮组件
interface ModelToggleProps {
  selectedModel: QwenMTModel
  availableModels: ModelInfo[]
  onModelChange: (model: QwenMTModel) => void
  disabled?: boolean
}

const ModelToggle: React.FC<ModelToggleProps> = ({
  selectedModel,
  availableModels,
  onModelChange,
  disabled = false
}) => {
  const getModelDisplayName = (modelId: QwenMTModel) => {
    return modelId === 'qwen-mt-plus' ? 'Plus' : 'Turbo'
  }
  
  const selectedIndex = availableModels.findIndex(model => model.id === selectedModel)
  
  return (
    <div className="relative flex items-center bg-gray-100 rounded-full p-1 border border-gray-200 w-[160px]" role="radiogroup" aria-label="选择翻译模型">
      {/* 滑动背景 */}
      <div 
        className={`absolute top-1 bottom-1 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-300 ease-out z-0`}
        style={{
          width: `calc(50% - 4px)`,
          left: selectedIndex === 0 ? '4px' : `calc(50% + 0px)`,
        }}
        aria-hidden="true"
      />
      
      {/* 按钮 */}
      {availableModels.map((model) => {
        const isSelected = selectedModel === model.id
        return (
          <button
            key={model.id}
            onClick={() => !disabled && onModelChange(model.id)}
            disabled={disabled}
            className={`
              relative z-10 flex-1 px-4 py-2 text-sm font-semibold rounded-full transition-all duration-300 min-w-[70px] flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
              ${
                isSelected
                  ? 'text-white'
                  : 'text-gray-600 hover:text-gray-800'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
            aria-checked={isSelected}
            role="radio"
            aria-label={`选择${model.name}模型`}
            title={model.name}
          >
            <span className="flex items-center space-x-1">
              <span>{getModelDisplayName(model.id)}</span>
            </span>
          </button>
        )
      })}
    </div>
  )
}



export const TranslationPanel: React.FC<TranslationPanelProps> = ({
  sourceText,
  translatedText,
  isTranslating,
  onSourceTextChange,
  onTranslate,
  onClear,
  sourceLanguage,
  targetLanguage,
  availableLanguages,
  onSourceLanguageChange,
  onTargetLanguageChange,
  onSwapLanguages,
  selectedModel,
  availableModels,
  onModelChange,
  apiKey,
  isAPIKeyValid,
  disabled = false
}) => {
  const [copiedText, setCopiedText] = useState<'source' | 'target' | null>(null)
  
  const handleCopy = async (text: string, type: 'source' | 'target') => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedText(type)
      setTimeout(() => setCopiedText(null), 2000)
    } catch (error) {
      console.error('Failed to copy text:', error)
    }
  }
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      if (!disabled && !isTranslating && sourceText.trim()) {
        onTranslate()
      }
    }
  }
  
  const handleSwap = () => {
    if (sourceLanguage === 'auto') {
      return // 不能交换自动
    }
    onSwapLanguages()
  }
  
  // 智能语言切换处理函数
  const handleSmartLanguageChange = (newLanguage: string, isSource: boolean) => {
    console.log('🔄 智能语言切换:', { 
      isSource, 
      newLanguage, 
      currentSourceLanguage: sourceLanguage, 
      currentTargetLanguage: targetLanguage 
    })
    
    if (isSource) {
      // 处理源语言变化
      if (newLanguage === targetLanguage && newLanguage !== 'auto') {
        // 情况1: 新选择的源语言与目标语言相同（且不为'auto'）
        if (sourceLanguage === 'auto') {
          // 子情况: 源语言从'auto'切换过来，智能切换目标语言
          if (newLanguage === 'zh') {
            onTargetLanguageChange('en') // 如果都是中文，目标变英文
          } else {
            onTargetLanguageChange('zh') // 否则，目标变中文
          }
          // 最后设置源语言
          onSourceLanguageChange(newLanguage)
        } else {
          // 子情况: 源语言不是'auto'，直接交换
          onSwapLanguages()
        }
      } else {
        // 情况2: 正常设置源语言
        onSourceLanguageChange(newLanguage)
      }
    } else {
      // 处理目标语言变化
      if (newLanguage === sourceLanguage && sourceLanguage !== 'auto') {
        // 情况1: 新选择的目标语言与源语言相同，且源语言不是自动检测 -> 交换语言
        onSwapLanguages()
      } else if (newLanguage === targetLanguage) {
        // 情况2: 用户重复选择当前目标语言 -> 智能切换
        if (newLanguage === 'zh') {
          // 如果当前目标语言是中文，切换为英文
          onTargetLanguageChange('en')
        } else {
          // 如果当前目标语言是其他语言，切换为中文
          onTargetLanguageChange('zh')
        }
      } else {
        // 情况3: 正常设置目标语言
        onTargetLanguageChange(newLanguage)
      }
    }
  }
  
  // 计算文本框高度的函数
  const calculateTextBoxHeight = (text: string) => {
    if (!text) return 220
    
    // 基于文本长度估算行数
    const estimatedCharsPerLine = 45 // 估算每行字符数（考虑中文字符宽度）
    const textLines = text.split('\n')
    let totalLines = 0
    
    textLines.forEach(line => {
      if (line.length === 0) {
        totalLines += 1
      } else {
        totalLines += Math.ceil(line.length / estimatedCharsPerLine)
      }
    })
    
    // 计算高度，留出底部空间
    const calculatedHeight = Math.max(220, totalLines * 24 + 60)
    return Math.min(calculatedHeight, 600) // 限制最大高度
  }
  
  // 取两个文本框中的较大值，保持一致的高度
  const sourceTextHeight = calculateTextBoxHeight(sourceText)
  const translatedTextHeight = calculateTextBoxHeight(translatedText)
  const unifiedHeight = Math.max(sourceTextHeight, translatedTextHeight)
  
  // 过滤目标语言列表，排除自动选项
  const targetLanguageOptions = availableLanguages.filter(lang => lang.code !== 'auto')
  const selectedSourceLang = availableLanguages.find(lang => lang.code === sourceLanguage)
  const selectedTargetLang = targetLanguageOptions.find(lang => lang.code === targetLanguage)
  
  return (
    <div className="w-full">
      {/* 主对话框容器 */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        {/* 顶部配置栏 */}
        <div className="bg-gray-50 px-4 lg:px-8 py-4 lg:py-6 border-b border-gray-200">
          <div className="flex flex-col space-y-4">
            {/* 语言选择区域 */}
            <div className="flex flex-col sm:flex-row items-center sm:items-center justify-center sm:justify-between space-y-3 sm:space-y-0">
              <div className="flex flex-col sm:flex-row items-center sm:items-center space-y-3 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
                {/* 语言选择按钮 */}
                <div className="flex flex-col xs:flex-row items-center xs:items-center space-y-2 xs:space-y-0 xs:space-x-2 w-full sm:w-auto justify-center">
                  <LanguageButton
                    language={selectedSourceLang}
                    options={availableLanguages}
                    onChange={(language) => handleSmartLanguageChange(language, true)}
                    disabled={disabled}
                    label="源语言"
                  />
                  
                  <button
                    onClick={handleSwap}
                    disabled={disabled || sourceLanguage === 'auto'}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-white/80 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 disabled:hover:scale-100 hover:ring-1 flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    aria-label={sourceLanguage === 'auto' ? '无法交换：源语言为自动' : '交换源语言和目标语言'}
                    title={sourceLanguage === 'auto' ? '无法交换：源语言为自动' : '交换语言'}
                    type="button"
                  >
                    <ArrowsRightLeftIcon className="w-4 h-4" aria-hidden="true" />
                  </button>
                  
                  <LanguageButton
                    language={selectedTargetLang}
                    options={targetLanguageOptions}
                    onChange={(language) => handleSmartLanguageChange(language, false)}
                    disabled={disabled}
                    label="目标语言"
                  />
                </div>
              </div>
              
              {/* 模型选择 */}
              <div className="flex justify-center w-full sm:w-auto">
                <ModelToggle
                  selectedModel={selectedModel}
                  availableModels={availableModels}
                  onModelChange={onModelChange}
                  disabled={disabled}
                />
              </div>
            </div>
          </div>
        </div>
        

        
        {/* 主对话区域 */}
        <div className="p-4 lg:p-8">
          {/* API Key 状态提示 */}
          {(!apiKey || !isAPIKeyValid) && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 lg:p-6 mb-6 lg:mb-8">
              <div className="flex items-start space-x-3 lg:space-x-4">
                <div className="flex-shrink-0">
                  <ExclamationTriangleIcon className="w-5 h-5 lg:w-6 lg:h-6 text-amber-500" />
                </div>
                <div className="flex-1">
                  <h4 className="text-base lg:text-lg font-semibold text-amber-800 mb-1 lg:mb-2">API Key 配置</h4>
                  <p className="text-sm lg:text-base text-amber-700">
                    {!apiKey 
                      ? '请在设置中配置API Key以使用翻译服务'
                      : 'API Key无效，请检查配置'
                    }
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 lg:gap-8">
            {/* 输入区域 */}
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <label htmlFor="source-text-input" className="text-base font-semibold text-gray-700 flex items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-3" aria-hidden="true"></div>
                  输入文本
                </label>
                {sourceText && (
                  <ActionButton
                    onClick={() => handleCopy(sourceText, 'source')}
                    title="复制源文本"
                    size="sm"
                  >
                    <ClipboardDocumentIcon className="w-4 h-4 mr-1" aria-hidden="true" />
                    {copiedText === 'source' ? '已复制' : '复制'}
                  </ActionButton>
                )}
              </div>
              
              <div className="relative">
                <textarea
                  id="source-text-input"
                  value={sourceText}
                  onChange={(e) => onSourceTextChange(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={disabled}
                  placeholder="请输入要翻译的文本……"
                  className="w-full px-6 py-4 pb-12 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-300 placeholder:text-gray-400 resize-none text-base leading-relaxed custom-scrollbar hover:border-gray-300 disabled:bg-gray-50 disabled:cursor-not-allowed"
                  style={{ 
                    minHeight: '220px',
                    height: unifiedHeight + 'px',
                    maxHeight: '600px'
                  }}
                  spellCheck="true"
                />
              </div>
            </div>
            
            {/* 移动端翻译按钮区域（仅在 lg 以下屏幕显示） */}
            <div className="lg:hidden col-span-1 flex flex-col items-center justify-center py-4" role="group" aria-label="翻译操作按钮">
              <ActionButton
                onClick={onTranslate}
                disabled={disabled || isTranslating || !sourceText.trim()}
                variant="primary"
                size="lg"
              >
                {isTranslating ? (
                  <>
                    <div className="w-5 h-5 mr-3 border-2 border-white border-t-transparent rounded-full animate-spin" aria-hidden="true" />
                    翻译中...
                  </>
                ) : (
                  <>
                    <LanguageIcon className="w-5 h-5 mr-3" aria-hidden="true" />
                    翻译
                  </>
                )}
              </ActionButton>
              
              {sourceText && (
                <div className="mt-3">
                  <ActionButton
                    onClick={onClear}
                    disabled={disabled || isTranslating}
                    variant="secondary"
                    size="md"
                    title="清空文本"
                  >
                    <TrashIcon className="w-4 h-4 mr-2" aria-hidden="true" />
                    清空
                  </ActionButton>
                </div>
              )}
            </div>
            
            {/* 翻译结果区域 */}
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <label htmlFor="translation-result" className="text-base font-semibold text-gray-700 flex items-center">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full mr-3" aria-hidden="true"></div>
                  翻译结果
                </label>
                {translatedText && (
                  <div className="flex items-center space-x-3">
                    <ActionButton
                      onClick={() => handleCopy(translatedText, 'target')}
                      title="复制翻译结果"
                      size="sm"
                    >
                      <ClipboardDocumentIcon className="w-4 h-4 mr-1" aria-hidden="true" />
                      {copiedText === 'target' ? '已复制' : '复制'}
                    </ActionButton>
                    
                    <ActionButton
                      onClick={() => {
                        console.log('Save to history')
                      }}
                      title="保存到历史记录"
                      size="sm"
                    >
                      <BookmarkIcon className="w-4 h-4" aria-hidden="true" />
                    </ActionButton>
                  </div>
                )}
              </div>
              
              <div className="relative">
                <div 
                  id="translation-result"
                  className="w-full px-6 py-4 pb-12 bg-white border border-gray-200 rounded-2xl transition-all duration-300 overflow-y-auto custom-scrollbar"
                  style={{ 
                    minHeight: '220px',
                    height: unifiedHeight + 'px',
                    maxHeight: '600px'
                  }}
                  role="region"
                  aria-label="翻译结果显示区域"
                  aria-live="polite"
                >
                  {isTranslating ? (
                    <div className="h-full flex items-center justify-center" style={{ minHeight: '188px' }}>
                      <div className="flex items-center space-x-3 text-blue-600" role="status" aria-live="polite">
                        <div className="w-6 h-6 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" aria-hidden="true" />
                        <div className="text-center">
                          <div className="text-sm font-medium">翻译中...</div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="min-h-[188px]">
                      {translatedText ? (
                        <p className="text-gray-900 whitespace-pre-wrap break-words leading-relaxed text-base">
                          {translatedText}
                        </p>
                      ) : (
                        <div className="h-full flex items-center justify-center text-gray-400" style={{ minHeight: '188px' }}>
                          <div className="text-center">
                            <LanguageIcon className="w-10 h-10 mx-auto mb-3 opacity-50" aria-hidden="true" />
                            <p className="text-base font-medium mb-1">翻译结果将显示在这里</p>
                            <p className="text-sm">请在左侧输入要翻译的文本</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* 底部统计信息 */}
                {translatedText && (
                  <div className="absolute bottom-3 left-4 flex items-center space-x-4 z-10">
                    <span className="text-xs font-medium text-gray-500" aria-label={`翻译结果长度${translatedText.length}个字符`}>{translatedText.length.toLocaleString()} 字符</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* 桁面端翻译按钮区域（仅在 lg 及以上屏幕显示） */}
          <div className="hidden lg:flex flex-col sm:flex-row items-center justify-center pt-6 lg:pt-8" role="group" aria-label="翻译操作按钮">
            <ActionButton
              onClick={onTranslate}
              disabled={disabled || isTranslating || !sourceText.trim()}
              variant="primary"
              size="lg"
            >
              {isTranslating ? (
                <>
                  <div className="w-5 h-5 mr-3 border-2 border-white border-t-transparent rounded-full animate-spin" aria-hidden="true" />
                  翻译中...
                </>
              ) : (
                <>
                  <LanguageIcon className="w-5 h-5 mr-3" aria-hidden="true" />
                  翻译
                </>
              )}
            </ActionButton>
            
            {sourceText && (
              <ActionButton
                onClick={onClear}
                disabled={disabled || isTranslating}
                variant="secondary"
                size="lg"
                title="清空文本"
              >
                <TrashIcon className="w-5 h-5 mr-3" aria-hidden="true" />
                清空
              </ActionButton>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default TranslationPanel