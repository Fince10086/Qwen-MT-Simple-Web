import React, { useState, Fragment } from 'react'
import { RadioGroup, Listbox, Transition } from '@headlessui/react'
import {
  LanguageIcon,
  ClipboardDocumentIcon,
  TrashIcon,
  BookmarkIcon,
  ArrowsRightLeftIcon,
  CheckCircleIcon,
  ChevronUpDownIcon,
  CheckIcon,
  CogIcon,
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
  const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'
  
  const variants = {
    primary: 'bg-primary-600 hover:bg-primary-700 text-white focus:ring-primary-500',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-700 focus:ring-gray-500',
    danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500'
  }
  
  const sizes = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-2 text-base'
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

// 语言下拉选择器组件
interface LanguageDropdownProps {
  value: string
  options: Language[]
  onChange: (value: string) => void
  disabled?: boolean
  label: string
  placeholder?: string
}

const LanguageDropdown: React.FC<LanguageDropdownProps> = ({
  value,
  options,
  onChange,
  disabled = false,
  label,
  placeholder = '选择语言'
}) => {
  const selectedLanguage = options.find(lang => lang.code === value)

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <Listbox value={value} onChange={onChange} disabled={disabled}>
        <div className="relative">
          <Listbox.Button className="relative w-full cursor-pointer rounded-md bg-white py-2 pl-3 pr-8 text-left shadow-sm border border-gray-300 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors text-sm">
            <span className="flex items-center">
              {selectedLanguage ? (
                <span className="block truncate font-medium text-gray-900">
                  {selectedLanguage.name}
                </span>
              ) : (
                <span className="block truncate text-gray-400">
                  {placeholder}
                </span>
              )}
            </span>
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronUpDownIcon
                className="h-4 w-4 text-gray-400"
                aria-hidden="true"
              />
            </span>
          </Listbox.Button>
          
          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options className="absolute z-10 mt-1 max-h-48 w-full overflow-auto rounded-md bg-white py-1 text-sm shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
              {options.map((language) => (
                <Listbox.Option
                  key={language.code}
                  className={({ active }) =>
                    `relative cursor-pointer select-none py-2 pl-8 pr-4 ${
                      active ? 'bg-primary-100 text-primary-900' : 'text-gray-900'
                    }`
                  }
                  value={language.code}
                >
                  {({ selected }) => (
                    <>
                      <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                        {language.name}
                      </span>
                      {selected ? (
                        <span className="absolute inset-y-0 left-0 flex items-center pl-2 text-primary-600">
                          <CheckIcon className="h-4 w-4" aria-hidden="true" />
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
  const [showConfig, setShowConfig] = useState(false)
  
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
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <LanguageIcon className="w-5 h-5 mr-2 text-primary-600" />
            智能翻译
          </h3>
          <div className="flex items-center space-x-3">
            <span className={`text-sm ${isTextTooLong ? 'text-red-500' : 'text-gray-500'}`}>
              {textLength}/{maxLength}
            </span>
            <button
              onClick={() => setShowConfig(!showConfig)}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
              title={showConfig ? '隐藏配置' : '显示配置'}
            >
              <CogIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Quick Language Selector */}
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center justify-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">
              {selectedSourceLang?.name || '源语言'}
            </span>
          </div>
          
          <button
            onClick={handleSwap}
            disabled={disabled || sourceLanguage === 'auto'}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title={sourceLanguage === 'auto' ? '无法交换：源语言为自动检测' : '交换语言'}
          >
            <ArrowsRightLeftIcon className="w-4 h-4" />
          </button>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">
              {selectedTargetLang?.name || '目标语言'}
            </span>
          </div>
        </div>
      </div>
      
      {/* Configuration Panel */}
      {showConfig && (
        <div className="px-4 py-4 bg-gray-50 border-b border-gray-200">
          {/* API Key 状态提示 */}
          {(!apiKey || !isAPIKeyValid) && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
              <div className="flex items-center space-x-2">
                <ExclamationTriangleIcon className="w-5 h-5 text-amber-500" />
                <div className="flex-1">
                  <p className="text-sm text-amber-800">
                    {!apiKey 
                      ? '请在设置中配置API Key以使用翻译服务'
                      : 'API Key无效，请检查配置'
                    }
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <div className="space-y-4">
            {/* 语言配置 */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">语言设置</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <LanguageDropdown
                  value={sourceLanguage}
                  options={availableLanguages}
                  onChange={onSourceLanguageChange}
                  disabled={disabled}
                  label="源语言"
                  placeholder="选择源语言"
                />
                
                <LanguageDropdown
                  value={targetLanguage}
                  options={targetLanguageOptions}
                  onChange={onTargetLanguageChange}
                  disabled={disabled}
                  label="目标语言"
                  placeholder="选择目标语言"
                />
              </div>
            </div>
            
            {/* 模型选择 */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">模型选择</h4>
              <RadioGroup value={selectedModel} onChange={onModelChange} disabled={disabled}>
                <RadioGroup.Label className="sr-only">选择翻译模型</RadioGroup.Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {availableModels.map((model) => (
                    <RadioGroup.Option
                      key={model.id}
                      value={model.id}
                      disabled={disabled}
                      className="focus:outline-none"
                    >
                      {({ checked }) => (
                        <div className={`
                          relative rounded-md border p-2 cursor-pointer transition-all duration-200
                          ${checked 
                            ? 'border-primary-500 ring-1 ring-primary-500 bg-primary-50' 
                            : 'border-gray-300 hover:border-gray-400 bg-white'
                          }
                          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                        `}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <span className={`text-sm font-medium ${checked ? 'text-primary-900' : 'text-gray-900'}`}>
                                {model.name}
                              </span>
                              {model.id === 'qwen-mt-plus' && (
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                                  推荐
                                </span>
                              )}
                            </div>
                            {checked && (
                              <CheckCircleIcon className="w-4 h-4 text-primary-600" />
                            )}
                          </div>
                        </div>
                      )}
                    </RadioGroup.Option>
                  ))}
                </div>
              </RadioGroup>
            </div>
          </div>
        </div>
      )}
      
      {/* Translation Interface */}
      <div className="p-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Source Text */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700">
                源文本
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
            
            <textarea
              value={sourceText}
              onChange={(e) => onSourceTextChange(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={disabled}
              placeholder="请输入要翻译的文本... (Ctrl/Cmd + Enter 快速翻译)"
              className={`textarea-field h-32 ${isTextTooLong ? 'border-red-300 focus:ring-red-500' : ''}`}
              maxLength={maxLength}
            />
            
            {isTextTooLong && (
              <p className="text-sm text-red-600">
                文本长度超出限制，请缩短至 {maxLength} 字符以内
              </p>
            )}
          </div>
          
          {/* Translated Text */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700">
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
                      // 这里可以添加保存到历史记录的逻辑
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
              <textarea
                value={translatedText}
                readOnly
                placeholder={isTranslating ? "正在翻译，请稍候..." : "翻译结果将显示在这里"}
                className="textarea-field h-32 bg-gray-50 cursor-default"
              />
              
              {isTranslating && (
                <div className="absolute inset-0 bg-gray-50 bg-opacity-75 flex items-center justify-center rounded-lg">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <div className="w-5 h-5 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm">AI 正在为您翻译...</span>
                  </div>
                </div>
              )}
            </div>
            
            {translatedText && (
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>翻译完成</span>
                <span>{translatedText.length} 字符</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center space-x-2">
            <ActionButton
              onClick={onTranslate}
              disabled={disabled || isTranslating || !sourceText.trim() || isTextTooLong}
              variant="primary"
            >
              {isTranslating ? (
                <>
                  <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  翻译中...
                </>
              ) : (
                <>
                  <LanguageIcon className="w-4 h-4 mr-2" />
                  翻译
                </>
              )}
            </ActionButton>
            
            {sourceText && (
              <ActionButton
                onClick={onClear}
                disabled={disabled || isTranslating}
                variant="danger"
                title="清空文本"
              >
                <TrashIcon className="w-4 h-4 mr-2" />
                清空
              </ActionButton>
            )}
          </div>
          
          <div className="text-xs text-gray-500">
            Ctrl/Cmd + Enter 快速翻译
          </div>
        </div>
      </div>
    </div>
  )
}

export default UnifiedTranslationPanel