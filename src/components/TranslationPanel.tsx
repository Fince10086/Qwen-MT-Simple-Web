import React, { useState } from 'react'
import {
  LanguageIcon,
  ClipboardDocumentIcon,
  TrashIcon,
  BookmarkIcon,
  SpeakerWaveIcon
} from '@heroicons/react/24/outline'
import { TranslationPanelProps } from '../types'
import { DEFAULT_CONFIG } from '../utils/constants'

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

export const TranslationPanel: React.FC<TranslationPanelProps> = ({
  sourceText,
  translatedText,
  isTranslating,
  onSourceTextChange,
  onTranslate,
  onClear,
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
  
  const textLength = sourceText.length
  const maxLength = DEFAULT_CONFIG.MAX_TEXT_LENGTH
  const isTextTooLong = textLength > maxLength
  
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <LanguageIcon className="w-5 h-5 mr-2 text-primary-600" />
            文本翻译
          </h3>
          <div className="flex items-center space-x-2">
            <span className={`text-sm ${isTextTooLong ? 'text-red-500' : 'text-gray-500'}`}>
              {textLength}/{maxLength}
            </span>
          </div>
        </div>
      </div>
      
      {/* Translation Interface */}
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
        
        {/* Quick Tips */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="text-sm font-medium text-blue-900 mb-2">使用提示</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• 使用 Ctrl/Cmd + Enter 快速翻译</li>
            <li>• 支持最多 {maxLength.toLocaleString()} 字符的文本翻译</li>
            <li>• 选择合适的模型以获得最佳翻译效果</li>
            <li>• 翻译结果会自动保存到历史记录</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default TranslationPanel