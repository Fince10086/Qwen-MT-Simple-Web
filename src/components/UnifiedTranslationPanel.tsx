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
import { DEFAULT_CONFIG } from '../utils/constants'

interface UnifiedTranslationPanelProps {
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
  dotColor: string
}

const LanguageButton: React.FC<LanguageButtonProps> = ({
  language,
  options,
  onChange,
  disabled = false,
  label,
  dotColor
}) => {
  return (
    <Listbox value={language?.code || ''} onChange={onChange} disabled={disabled}>
      <div className="relative">
        <Listbox.Button className="group flex items-center space-x-2 lg:space-x-3 bg-white rounded-xl px-3 lg:px-4 py-2.5 lg:py-3 border border-gray-200 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed min-w-[120px] lg:min-w-[140px] justify-center transform hover:scale-[1.02] disabled:hover:scale-100 shadow-sm hover:shadow-md">
          <div className={`w-2 lg:w-2.5 h-2 lg:h-2.5 ${dotColor} rounded-full group-hover:scale-110 transition-transform duration-200`}></div>
          <span className="text-xs lg:text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors duration-200 truncate">
            {language?.name || label}
          </span>
          <ChevronUpDownIcon className="w-3 h-3 lg:w-4 lg:h-4 text-gray-400 group-hover:text-gray-600 transition-colors duration-200 flex-shrink-0" />
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
          <Listbox.Options className="absolute z-30 mt-2 w-full max-w-xs min-w-[200px] bg-white rounded-xl border border-gray-200 shadow-xl backdrop-blur-sm bg-white/95 focus:outline-none left-1/2 transform -translate-x-1/2">
            <div className="max-h-64 overflow-y-auto py-2 custom-scrollbar">
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
                          {lang.code === 'auto' && (
                            <span className="ml-2 text-xs text-gray-500">(自动检测)</span>
                          )}
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
    <div className="relative flex items-center bg-gray-100 rounded-full p-1 border border-gray-200 shadow-sm">
      {/* 滑动背景 */}
      <div 
        className={`absolute top-1 bottom-1 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-300 ease-out shadow-md z-0`}
        style={{
          width: `calc(50% - 2px)`,
          left: selectedIndex === 0 ? '2px' : `calc(50% + 0px)`,
        }}
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
              relative z-10 flex-1 px-4 py-2 text-sm font-semibold rounded-full transition-all duration-300 min-w-[70px] flex items-center justify-center
              ${
                isSelected
                  ? 'text-white'
                  : 'text-gray-600 hover:text-gray-800'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
            title={model.name}
          >
            <span className="flex items-center space-x-1">
              <span>{getModelDisplayName(model.id)}</span>
              {model.id === 'qwen-mt-plus' && (
                <span className={`text-xs ${
                  isSelected ? 'text-yellow-200' : 'text-yellow-600'
                }`}>★</span>
              )}
            </span>
          </button>
        )
      })}
    </div>
  )
}



export const UnifiedTranslationPanel: React.FC<UnifiedTranslationPanelProps> = ({
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
      return // 不能交换自动检测
    }
    onSwapLanguages()
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
  
  const textLength = sourceText.length
  const maxLength = DEFAULT_CONFIG.MAX_TEXT_LENGTH
  const isTextTooLong = textLength > maxLength
  
  // 过滤目标语言列表，排除自动检测选项
  const targetLanguageOptions = availableLanguages.filter(lang => lang.code !== 'auto')
  const selectedSourceLang = availableLanguages.find(lang => lang.code === sourceLanguage)
  const selectedTargetLang = targetLanguageOptions.find(lang => lang.code === targetLanguage)
  
  return (
    <div className="w-full">
      {/* 主对话框容器 - 简化设计 */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        {/* 顶部配置栏 */}
        <div className="bg-gray-50 px-4 lg:px-8 py-4 lg:py-6 border-b border-gray-200">
          <div className="flex flex-col space-y-4">
            {/* 语言选择区域 */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-3 sm:space-y-0">
              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
                {/* 语言选择按钮 */}
                <div className="flex items-center space-x-2 w-full sm:w-auto">
                  <LanguageButton
                    language={selectedSourceLang}
                    options={availableLanguages}
                    onChange={onSourceLanguageChange}
                    disabled={disabled}
                    label="源语言"
                    dotColor="bg-blue-500"
                  />
                  
                  <button
                    onClick={handleSwap}
                    disabled={disabled || sourceLanguage === 'auto'}
                    className="p-2 lg:p-3 text-gray-400 hover:text-blue-600 hover:bg-white/80 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 disabled:hover:scale-100 shadow-sm hover:shadow-md flex-shrink-0"
                    title={sourceLanguage === 'auto' ? '无法交换：源语言为自动检测' : '交换语言'}
                  >
                    <ArrowsRightLeftIcon className="w-4 h-4 lg:w-5 lg:h-5" />
                  </button>
                  
                  <LanguageButton
                    language={selectedTargetLang}
                    options={targetLanguageOptions}
                    onChange={onTargetLanguageChange}
                    disabled={disabled}
                    label="目标语言"
                    dotColor="bg-emerald-500"
                  />
                </div>
              </div>
              
              {/* 模型选择 */}
              <div className="w-full sm:w-auto">
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
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            {/* 输入区域 */}
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <label className="text-base font-semibold text-gray-700 flex items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                  输入文本
                </label>
                {sourceText && (
                  <ActionButton
                    onClick={() => handleCopy(sourceText, 'source')}
                    title="复制源文本"
                    size="sm"
                  >
                    <ClipboardDocumentIcon className="w-4 h-4 mr-1" />
                    {copiedText === 'source' ? '已复制' : '复制'}
                  </ActionButton>
                )}
              </div>
              
              <div className="relative">
                <textarea
                  value={sourceText}
                  onChange={(e) => onSourceTextChange(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={disabled}
                  placeholder="请输入要翻译的文本……"
                  className={`
                    w-full px-6 py-4 pb-12 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-300 placeholder:text-gray-400 resize-none text-base leading-relaxed custom-scrollbar
                    ${isTextTooLong 
                      ? 'border-red-300 focus:border-red-500 bg-red-50' 
                      : 'hover:border-gray-300'
                    }
                    ${disabled ? 'bg-gray-50 cursor-not-allowed' : ''}
                  `}
                  style={{ 
                    minHeight: '220px',
                    height: unifiedHeight + 'px',
                    maxHeight: '600px'
                  }}
                  maxLength={maxLength}
                />
                
                {/* 左下角文本统计 */}
                <div className="absolute bottom-3 left-4 flex items-center space-x-4">
                  <span className={`text-xs font-medium ${
                    isTextTooLong ? 'text-red-500' : 'text-gray-500'
                  }`}>
                    {textLength.toLocaleString()}/{maxLength.toLocaleString()}
                  </span>
                  {isTextTooLong && (
                    <div className="flex items-center space-x-1 text-red-500">
                      <ExclamationTriangleIcon className="w-3 h-3" />
                      <span className="text-xs">超出限制</span>
                    </div>
                  )}
                </div>
                
                {/* 右下角操作提示 */}
                <div className="absolute bottom-3 right-4 flex items-center space-x-2">
                  {isTranslating && (
                    <div className="flex items-center space-x-1 text-blue-600">
                      <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                      <span className="text-xs font-medium">分析中</span>
                    </div>
                  )}
                  <div className="text-xs text-gray-400 bg-white/80 backdrop-blur-sm px-2 py-1 rounded-md border border-gray-200">
                    Ctrl+Enter 快速翻译
                  </div>
                </div>
              </div>
            </div>
            
            {/* 翻译结果区域 */}
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <label className="text-base font-semibold text-gray-700 flex items-center">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full mr-3"></div>
                  翻译结果
                </label>
                {translatedText && (
                  <div className="flex items-center space-x-3">
                    <ActionButton
                      onClick={() => handleCopy(translatedText, 'target')}
                      title="复制翻译结果"
                      size="sm"
                    >
                      <ClipboardDocumentIcon className="w-4 h-4 mr-1" />
                      {copiedText === 'target' ? '已复制' : '复制'}
                    </ActionButton>
                    
                    <ActionButton
                      onClick={() => {
                        console.log('Save to history')
                      }}
                      title="保存到历史记录"
                      size="sm"
                    >
                      <BookmarkIcon className="w-4 h-4" />
                    </ActionButton>
                  </div>
                )}
              </div>
              
              <div className="relative">
                <div 
                  className={`
                    w-full px-6 py-4 pb-12 bg-white border border-gray-200 rounded-2xl transition-all duration-300 overflow-y-auto custom-scrollbar
                    ${translatedText ? 'border-emerald-200 bg-emerald-50' : 'bg-gray-50'}
                  `}
                  style={{ 
                    minHeight: '220px',
                    height: unifiedHeight + 'px',
                    maxHeight: '600px'
                  }}
                >
                  {isTranslating ? (
                    <div className="h-full flex items-center justify-center" style={{ minHeight: '188px' }}>
                      <div className="flex items-center space-x-3 text-blue-600">
                        <div className="w-6 h-6 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
                        <div className="text-center">
                          <div className="text-sm font-medium">AI 正在为您翻译...</div>
                          <div className="text-xs text-blue-500 mt-1">请稍候，优质翻译需要一点时间</div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="min-h-[188px] pb-8">
                      {translatedText ? (
                        <p className="text-gray-900 whitespace-pre-wrap break-words leading-relaxed text-base">
                          {translatedText}
                        </p>
                      ) : (
                        <div className="h-full flex items-center justify-center text-gray-400" style={{ minHeight: '188px' }}>
                          <div className="text-center">
                            <LanguageIcon className="w-10 h-10 mx-auto mb-3 opacity-50" />
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
                  <div className="absolute bottom-3 left-4 flex items-center space-x-4">
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>翻译完成</span>
                    </div>
                    <span className="text-xs text-gray-500">{translatedText.length} 字符</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* 操作按钮区域 */}
          <div className="flex flex-col sm:flex-row items-center justify-center pt-6 lg:pt-8 border-t border-gray-200 mt-6 lg:mt-8 space-y-4 sm:space-y-0 sm:space-x-6">
            <ActionButton
              onClick={onTranslate}
              disabled={disabled || isTranslating || !sourceText.trim() || isTextTooLong}
              variant="primary"
              size="lg"
            >
              {isTranslating ? (
                <>
                  <div className="w-5 h-5 mr-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  翻译中...
                </>
              ) : (
                <>
                  <LanguageIcon className="w-5 h-5 mr-3" />
                  翻译
                </>
              )}
            </ActionButton>
            
            {sourceText && (
              <ActionButton
                onClick={onClear}
                disabled={disabled || isTranslating}
                variant="secondary"
                title="清空文本"
              >
                <TrashIcon className="w-4 h-4 mr-2" />
                清空
              </ActionButton>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default UnifiedTranslationPanel