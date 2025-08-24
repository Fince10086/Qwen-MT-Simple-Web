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
  const baseClasses = 'inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md'
  
  const variants = {
    primary: 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white focus:ring-blue-500 border border-blue-600',
    secondary: 'bg-white hover:bg-gray-50 text-gray-700 focus:ring-gray-500 border border-gray-300 hover:border-gray-400',
    danger: 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white focus:ring-red-500 border border-red-500'
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
        <Listbox.Button className="group flex items-center space-x-3 bg-white rounded-full px-4 py-2.5 shadow-sm border border-gray-200 hover:shadow-md hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed min-w-[140px] justify-center">
          <div className={`w-2.5 h-2.5 ${dotColor} rounded-full group-hover:scale-110 transition-transform duration-200`}></div>
          <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors duration-200">
            {language?.name || label}
          </span>
          <ChevronUpDownIcon className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors duration-200" />
        </Listbox.Button>
        
        <Transition
          as={Fragment}
          enter="transition ease-out duration-200"
          enterFrom="opacity-0 translate-y-1"
          enterTo="opacity-100 translate-y-0"
          leave="transition ease-in duration-150"
          leaveFrom="opacity-100 translate-y-0"
          leaveTo="opacity-0 translate-y-1"
        >
          <Listbox.Options className="absolute z-20 mt-2 max-h-60 w-64 overflow-auto rounded-xl bg-white py-2 text-sm shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none border border-gray-100 left-1/2 transform -translate-x-1/2">
            {options.map((lang) => (
              <Listbox.Option
                key={lang.code}
                className={({ active }) =>
                  `relative cursor-pointer select-none py-3 pl-10 pr-4 transition-colors ${
                    active ? 'bg-blue-50 text-blue-900' : 'text-gray-900'
                  }`
                }
                value={lang.code}
              >
                {({ selected, active }) => (
                  <>
                    <span className={`block truncate ${
                      selected ? 'font-semibold' : 'font-normal'
                    }`}>
                      {lang.name}
                      {lang.code === 'auto' && (
                        <span className="ml-2 text-xs text-gray-500">(自动检测)</span>
                      )}
                    </span>
                    {selected ? (
                      <span className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                        active ? 'text-blue-600' : 'text-blue-600'
                      }`}>
                        <CheckIcon className="h-5 w-5" aria-hidden="true" />
                      </span>
                    ) : null}
                  </>
                )}
              </Listbox.Option>
            ))}
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
  
  return (
    <div className="flex items-center bg-gray-100 rounded-full p-1 shadow-sm">
      {availableModels.map((model) => {
        const isSelected = selectedModel === model.id
        return (
          <button
            key={model.id}
            onClick={() => !disabled && onModelChange(model.id)}
            disabled={disabled}
            className={`
              px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 min-w-[70px]
              ${isSelected
                ? 'bg-white text-blue-600 shadow-sm border border-blue-200'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
            title={model.name}
          >
            {getModelDisplayName(model.id)}
            {model.id === 'qwen-mt-plus' && (
              <span className="ml-1 text-xs text-yellow-600">★</span>
            )}
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
  
  const textLength = sourceText.length
  const maxLength = DEFAULT_CONFIG.MAX_TEXT_LENGTH
  const isTextTooLong = textLength > maxLength
  
  // 过滤目标语言列表，排除自动检测选项
  const targetLanguageOptions = availableLanguages.filter(lang => lang.code !== 'auto')
  const selectedSourceLang = availableLanguages.find(lang => lang.code === sourceLanguage)
  const selectedTargetLang = targetLanguageOptions.find(lang => lang.code === targetLanguage)
  
  return (
    <div className="w-full max-w-8xl mx-auto">
      {/* 主对话框容器 */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        {/* 顶部配置栏 */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* 语言选择按钮 */}
              <div className="flex items-center space-x-3">
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
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-white rounded-full transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  title={sourceLanguage === 'auto' ? '无法交换：源语言为自动检测' : '交换语言'}
                >
                  <ArrowsRightLeftIcon className="w-4 h-4" />
                </button>
                
                <LanguageButton
                  language={selectedTargetLang}
                  options={targetLanguageOptions}
                  onChange={onTargetLanguageChange}
                  disabled={disabled}
                  label="目标语言"
                  dotColor="bg-green-500"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className={`text-sm ${isTextTooLong ? 'text-red-500' : 'text-gray-500'}`}>
                {textLength}/{maxLength}
              </span>
              <ModelToggle
                selectedModel={selectedModel}
                availableModels={availableModels}
                onModelChange={onModelChange}
                disabled={disabled}
              />
            </div>
          </div>
        </div>
        

        
        {/* 主对话区域 */}
        <div className="p-6">
          {/* API Key 状态提示 */}
          {(!apiKey || !isAPIKeyValid) && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
              <div className="flex items-start space-x-3">
                <ExclamationTriangleIcon className="w-5 h-5 text-amber-500 mt-0.5" />
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-amber-800 mb-1">API Key 配置</h4>
                  <p className="text-sm text-amber-700">
                    {!apiKey 
                      ? '请在设置中配置API Key以使用翻译服务'
                      : 'API Key无效，请检查配置'
                    }
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 输入区域 */}
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-gray-700 flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
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
                    w-full px-4 py-4 border-2 rounded-xl resize-none transition-all duration-200
                    focus:outline-none focus:ring-0
                    placeholder:text-gray-400 text-base leading-relaxed
                    ${isTextTooLong 
                      ? 'border-red-300 focus:border-red-500 bg-red-50' 
                      : 'border-gray-200 focus:border-blue-500 bg-white hover:border-gray-300'
                    }
                    ${disabled ? 'bg-gray-50 cursor-not-allowed' : ''}
                  `}
                  style={{ 
                    minHeight: '200px',
                    height: Math.max(200, Math.min(400, (sourceText.split('\n').length + 1) * 24 + 32)) + 'px'
                  }}
                  maxLength={maxLength}
                />
                
                {/* 输入框底部指示器 */}
                <div className="absolute bottom-4 right-4 flex items-center space-x-2">
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
              
              {isTextTooLong && (
                <div className="flex items-center space-x-2 text-red-600 text-sm">
                  <ExclamationTriangleIcon className="w-4 h-4" />
                  <span>文本长度超出限制，请缩短至 {maxLength.toLocaleString()} 字符以内</span>
                </div>
              )}
            </div>
            
            {/* 翻译结果区域 */}
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-gray-700 flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  翻译结果
                </label>
                {translatedText && (
                  <div className="flex items-center space-x-2">
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
                    w-full px-4 py-4 border-2 rounded-xl transition-all duration-200 overflow-hidden
                    ${translatedText ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'}
                  `}
                  style={{ 
                    minHeight: '200px',
                    height: Math.max(200, Math.min(400, (translatedText.split('\n').length + 1) * 24 + 32)) + 'px'
                  }}
                >
                  {isTranslating ? (
                    <div className="h-full flex items-center justify-center">
                      <div className="flex items-center space-x-3 text-blue-600">
                        <div className="w-6 h-6 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
                        <div className="text-center">
                          <div className="text-sm font-medium">AI 正在为您翻译...</div>
                          <div className="text-xs text-blue-500 mt-1">请稍候，优质翻译需要一点时间</div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="h-full">
                      {translatedText ? (
                        <div className="h-full overflow-y-auto scrollbar-thin">
                          <p className="text-gray-900 whitespace-pre-wrap break-words leading-relaxed text-base">
                            {translatedText}
                          </p>
                        </div>
                      ) : (
                        <div className="h-full flex items-center justify-center text-gray-400">
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
                
                {translatedText && (
                  <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>翻译完成</span>
                    </div>
                    <span>{translatedText.length} 字符</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* 操作按钮区域 */}
          <div className="flex items-center justify-center pt-6 border-t border-gray-200 mt-6">
            <div className="flex items-center space-x-4">
              <ActionButton
                onClick={onTranslate}
                disabled={disabled || isTranslating || !sourceText.trim() || isTextTooLong}
                variant="primary"
                size="lg"
              >
                {isTranslating ? (
                  <>
                    <div className="w-5 h-5 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    翻译中...
                  </>
                ) : (
                  <>
                    <LanguageIcon className="w-5 h-5 mr-2" />
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
    </div>
  )
}

export default UnifiedTranslationPanel