import React, { useState, useRef, useEffect } from 'react'
import {
  ClockIcon,
  TrashIcon,
  ClipboardDocumentIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  ArrowPathIcon,
  CpuChipIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import { HistoryPanelProps, TranslationRecord } from '../types'
import { announceToScreenReader } from '../utils/accessibility'

// 确认对话框组件
interface ConfirmDialogProps {
  isOpen: boolean
  title: string
  message: string
  confirmText: string
  cancelText: string
  onConfirm: () => void
  onCancel: () => void
  isDangerous?: boolean
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
  isDangerous = false
}) => {
  const dialogRef = useRef<HTMLDivElement>(null)
  const cancelButtonRef = useRef<HTMLButtonElement>(null)
  
  // 自动聚焦到取消按钮
  useEffect(() => {
    if (isOpen && cancelButtonRef.current) {
      cancelButtonRef.current.focus()
    }
  }, [isOpen])
  
  // ESC键关闭对话框
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onCancel()
      }
    }
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onCancel])
  
  if (!isOpen) return null
  
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="dialog-title" role="dialog" aria-modal="true">
      {/* 背景遮罩 */}
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" 
          aria-hidden="true"
          onClick={onCancel}
        ></div>
        
        {/* 对话框内容 */}
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        <div 
          ref={dialogRef}
          className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full border border-gray-200"
        >
          <div className="bg-white px-6 py-6">
            <div className="flex items-start">
              <div className={`mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full ${isDangerous ? 'bg-red-100' : 'bg-blue-100'} sm:mx-0 sm:h-10 sm:w-10`}>
                <ExclamationTriangleIcon className={`h-6 w-6 ${isDangerous ? 'text-red-600' : 'text-blue-600'}`} aria-hidden="true" />
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left flex-1">
                <h3 className="text-lg leading-6 font-semibold text-gray-900" id="dialog-title">
                  {title}
                </h3>
                <div className="mt-3">
                  <p className="text-sm text-gray-600">
                    {message}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-6 py-4 flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-3 space-y-3 space-y-reverse sm:space-y-0">
            <button
              ref={cancelButtonRef}
              type="button"
              className="w-full inline-flex justify-center rounded-xl border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 sm:w-auto sm:text-sm transition-colors"
              onClick={onCancel}
            >
              {cancelText}
            </button>
            <button
              type="button"
              className={`w-full inline-flex justify-center rounded-xl border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 sm:w-auto sm:text-sm transition-colors ${
                isDangerous 
                  ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500' 
                  : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
              }`}
              onClick={onConfirm}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

interface HistoryItemProps {
  record: TranslationRecord
  onSelect: (record: TranslationRecord) => void
  onDelete: (id: string) => void
  isActive: boolean
  onFocus: (id: string) => void
}

const HistoryItem: React.FC<HistoryItemProps> = ({ record, onSelect, onDelete, isActive, onFocus }) => {
  const [copiedField, setCopiedField] = useState<'source' | 'target' | null>(null)
  const [isExpanded, setIsExpanded] = useState(false)
  const itemRef = useRef<HTMLDivElement>(null)
  
  const formatTimestamp = (timestamp: Date) => {
    const now = new Date()
    const diff = now.getTime() - timestamp.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)
    
    if (days > 0) return `${days}天前`
    if (hours > 0) return `${hours}小时前`
    if (minutes > 0) return `${minutes}分钟前`
    return '刚刚'
  }
  
  const handleCopy = async (text: string, field: 'source' | 'target') => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(field)
      announceToScreenReader(`${field === 'source' ? '原文' : '译文'}已复制到剪贴板`, 'polite')
      setTimeout(() => setCopiedField(null), 2000)
    } catch (error) {
      console.error('Failed to copy text:', error)
      announceToScreenReader('复制失败', 'assertive')
    }
  }
  
  const handleUseTranslation = () => {
    onSelect(record)
    announceToScreenReader('已应用此翻译记录到翻译面板', 'polite')
  }
  
  const handleDelete = () => {
    onDelete(record.id)
    announceToScreenReader('翻译记录已删除', 'polite')
  }
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      setIsExpanded(!isExpanded)
      announceToScreenReader(isExpanded ? '翻译记录已折叠' : '翻译记录已展开', 'polite')
    }
  }
  
  // 当项目变为活跃状态时聚焦
  useEffect(() => {
    if (isActive && itemRef.current) {
      itemRef.current.focus()
    }
  }, [isActive])
  
  // 文本预览函数
  const getPreviewText = (text: string, maxLength: number = 60) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }
  
  return (
    <div 
      ref={itemRef}
      className={`
        bg-white border rounded-2xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-sm
        ${isActive ? 'border-blue-500 bg-blue-50 shadow-md' : 'border-gray-200 hover:border-gray-300 hover:shadow-md'}
      `}
      role="button"
      tabIndex={0}
      aria-expanded={isExpanded}
      aria-label={`翻译记录: ${getPreviewText(record.sourceText, 30)} 到 ${getPreviewText(record.translatedText, 30)}, ${formatTimestamp(record.timestamp)}`}
      onKeyDown={handleKeyDown}
      onClick={() => {
        onFocus(record.id)
        setIsExpanded(!isExpanded)
      }}
      onFocus={() => onFocus(record.id)}
    >
      {/* 简洁的预览模式 */}
      <div className="p-4 lg:p-5">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            {/* 顶部信息行 */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <div className="w-2 h-2 bg-blue-500 rounded-full" aria-hidden="true"></div>
                  <span>{record.sourceLanguage}</span>
                  <span className="text-gray-400">→</span>
                  <span>{record.targetLanguage}</span>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  record.model === 'qwen-mt-plus' 
                    ? 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700' 
                    : 'bg-gray-100 text-gray-700'
                }`} aria-label={`使用模型: ${record.model === 'qwen-mt-plus' ? 'Plus' : 'Turbo'}`}>
                  {record.model === 'qwen-mt-plus' ? 'Plus' : 'Turbo'}
                </span>
              </div>
              <time className="text-xs text-gray-500" dateTime={record.timestamp.toISOString()}>
                {formatTimestamp(record.timestamp)}
              </time>
            </div>
            
            {/* 文本内容预览 */}
            {!isExpanded ? (
              <div className="space-y-2">
                <div className="text-sm text-gray-900 line-clamp-2">
                  <span className="text-blue-600 font-medium">「</span>
                  <span className="text-gray-800">{getPreviewText(record.sourceText, 100)}</span>
                  <span className="text-blue-600 font-medium">」</span>
                </div>
                <div className="text-sm text-emerald-700 line-clamp-2">
                  <span className="text-emerald-600 font-medium">→ </span>
                  <span>{getPreviewText(record.translatedText, 100)}</span>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* 原文完整显示 */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full" aria-hidden="true"></div>
                      <span className="text-sm font-medium text-gray-700">原文</span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleCopy(record.sourceText, 'source')
                      }}
                      className="text-xs text-gray-500 hover:text-blue-600 flex items-center space-x-1 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded px-2 py-1"
                      aria-label="复制原文内容"
                      type="button"
                    >
                      <ClipboardDocumentIcon className="w-3 h-3" aria-hidden="true" />
                      <span>{copiedField === 'source' ? '已复制' : '复制'}</span>
                    </button>
                  </div>
                  <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 whitespace-pre-wrap break-words" role="region" aria-label="原文内容">
                    {record.sourceText}
                  </div>
                </div>
                
                {/* 译文完整显示 */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full" aria-hidden="true"></div>
                      <span className="text-sm font-medium text-gray-700">译文</span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleCopy(record.translatedText, 'target')
                      }}
                      className="text-xs text-gray-500 hover:text-emerald-600 flex items-center space-x-1 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1 rounded px-2 py-1"
                      aria-label="复制译文内容"
                      type="button"
                    >
                      <ClipboardDocumentIcon className="w-3 h-3" aria-hidden="true" />
                      <span>{copiedField === 'target' ? '已复制' : '复制'}</span>
                    </button>
                  </div>
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-sm text-gray-900 whitespace-pre-wrap break-words" role="region" aria-label="译文内容">
                    {record.translatedText}
                  </div>
                </div>
                
                {/* Token统计和操作区域 */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-3 border-t border-gray-200 space-y-2 sm:space-y-0">
                  {/* Token统计 */}
                  {record.tokenUsage && (
                    <div className="flex items-center space-x-3 text-xs text-gray-600" role="group" aria-label="Token使用统计">
                      <div className="flex items-center space-x-1">
                        <CpuChipIcon className="w-3 h-3" aria-hidden="true" />
                        <span>Token</span>
                      </div>
                      <span>输入: <span className="font-medium text-blue-600">{record.tokenUsage.promptTokens}</span></span>
                      <span>输出: <span className="font-medium text-emerald-600">{record.tokenUsage.completionTokens}</span></span>
                      <span className="font-medium">总计: <span className="text-indigo-600">{record.tokenUsage.totalTokens}</span></span>
                    </div>
                  )}
                  
                  {/* 删除按钮 */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDelete()
                    }}
                    className="text-xs text-red-600 hover:text-red-700 font-medium px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 flex items-center space-x-1"
                    aria-label="删除此翻译记录"
                    type="button"
                  >
                    <TrashIcon className="w-3 h-3" aria-hidden="true" />
                    <span>删除</span>
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {/* 右侧操作区域 */}
          <div className="ml-4 flex flex-col items-center space-y-2">
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleUseTranslation()
              }}
              className="p-2 text-gray-400 hover:text-blue-600 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 hover:bg-blue-50"
              aria-label="使用此翻译记录"
              title="使用此翻译"
              type="button"
            >
              <ArrowPathIcon className="w-4 h-4" aria-hidden="true" />
            </button>
            {isExpanded ? (
              <ChevronUpIcon className="w-4 h-4 text-gray-400" aria-hidden="true" />
            ) : (
              <ChevronDownIcon className="w-4 h-4 text-gray-400" aria-hidden="true" />
            )}
          </div>
        </div>
      </div>

    </div>
  )
}

export const HistoryPanel: React.FC<HistoryPanelProps> = ({
  history,
  onHistoryItemClick,
  onDeleteHistoryItem,
  onClearHistory
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredHistory, setFilteredHistory] = useState(history)
  const [activeItemId, setActiveItemId] = useState<string | null>(null)
  const [announceCount, setAnnounceCount] = useState(0)
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  
  // 搜索功能
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredHistory(history)
    } else {
      const filtered = history.filter(record =>
        record.sourceText.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.translatedText.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredHistory(filtered)
      
      // 通知搜索结果
      if (announceCount > 0) { // 第一次加载时不通知
        announceToScreenReader(`搜索结果: 找到${filtered.length}条翻译记录`, 'polite')
      }
    }
    setAnnounceCount(prev => prev + 1)
  }, [searchTerm, history, announceCount])
  
  const clearSearch = () => {
    setSearchTerm('')
    announceToScreenReader('已清除搜索条件', 'polite')
  }
  
  const handleClearHistory = () => {
    setShowClearConfirm(true)
  }
  
  const confirmClearHistory = () => {
    onClearHistory()
    setActiveItemId(null)
    setShowClearConfirm(false)
    announceToScreenReader('所有翻译历史已清空', 'polite')
  }
  
  const cancelClearHistory = () => {
    setShowClearConfirm(false)
    announceToScreenReader('已取消清空操作', 'polite')
  }
  
  const handleItemFocus = (itemId: string) => {
    setActiveItemId(itemId)
    // 找到当前记录在列表中的位置
    const currentIndex = filteredHistory.findIndex(record => record.id === itemId)
    if (currentIndex !== -1) {
      announceToScreenReader(`第${currentIndex + 1}条，共${filteredHistory.length}条记录`, 'polite')
    }
  }
  
  return (
    <div className="w-full">
      {/* 主容器 - 参照翻译面板风格 */}
      <div className="bg-white lg:border lg:border-gray-200 lg:rounded-2xl overflow-hidden">
        {/* 顶部配置栏 */}
        <div className="bg-gray-50 px-4 lg:px-8 py-4 lg:py-6 border-b border-gray-200">
          <div className="flex flex-col space-y-4">
            {/* 标题和清空按钮 */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-3 sm:space-y-0">
              <h2 className="text-lg lg:text-xl font-semibold text-gray-900 flex items-center">
                <ClockIcon className="w-5 h-5 lg:w-6 lg:h-6 mr-3 text-blue-600" aria-hidden="true" />
                翻译历史
                <span className="ml-3 text-sm font-normal text-gray-500" aria-label={`共${history.length}条记录`}>
                  ({history.length})
                </span>
              </h2>
              
              {history.length > 0 && (
                <button
                  onClick={handleClearHistory}
                  className="text-sm text-red-600 hover:text-red-700 font-medium px-4 py-2 rounded-xl hover:bg-red-50 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 border border-red-200"
                  aria-label="清空所有翻译历史记录"
                  type="button"
                >
                  <TrashIcon className="w-4 h-4 inline mr-2" aria-hidden="true" />
                  清空历史
                </button>
              )}
            </div>
            
            {/* 搜索框 */}
            {history.length > 0 && (
              <div className="relative">
                <label htmlFor="history-search" className="sr-only">搜索翻译历史</label>
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input
                  id="history-search"
                  type="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-12 pr-12 py-3 lg:py-4 border border-gray-200 rounded-xl bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm lg:text-base transition-colors hover:border-gray-300"
                  placeholder="搜索翻译历史..."
                  aria-describedby="search-help"
                  autoComplete="off"
                />
                {searchTerm && (
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                    <button
                      onClick={clearSearch}
                      className="text-gray-400 hover:text-gray-600 p-1 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-1"
                      aria-label="清除搜索条件"
                      type="button"
                    >
                      <XMarkIcon className="h-5 w-5" aria-hidden="true" />
                    </button>
                  </div>
                )}
                <div id="search-help" className="sr-only">
                  输入关键词搜索翻译历史记录，支持在原文和译文中搜索
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* 内容区域 */}
        <div className="p-4 lg:p-8">
          {filteredHistory.length === 0 ? (
            <div className="text-center py-12" role="status" aria-live="polite">
              {history.length === 0 ? (
                <>
                  <ClockIcon className="mx-auto h-16 w-16 text-gray-300" aria-hidden="true" />
                  <h3 className="mt-4 text-lg font-medium text-gray-900">暂无翻译记录</h3>
                  <p className="mt-2 text-gray-500">
                    开始翻译文本，您的翻译历史会显示在这里
                  </p>
                </>
              ) : (
                <>
                  <MagnifyingGlassIcon className="mx-auto h-16 w-16 text-gray-300" aria-hidden="true" />
                  <h3 className="mt-4 text-lg font-medium text-gray-900">未找到匹配的记录</h3>
                  <p className="mt-2 text-gray-500">
                    尝试使用不同的关键词搜索
                  </p>
                  <button
                    onClick={clearSearch}
                    className="mt-4 text-blue-600 hover:text-blue-700 font-medium px-4 py-2 rounded-xl hover:bg-blue-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    type="button"
                  >
                    清除搜索条件
                  </button>
                </>
              )}
            </div>
          ) : (
            <div role="feed" aria-label="翻译历史记录列表" aria-busy="false">
              <div className="sr-only" aria-live="polite" aria-atomic="true">
                当前显示{filteredHistory.length}条翻译记录，使用上下箭头键或Tab键浏览，回车或空格键展开详情
              </div>
              {/* 响应式瀑布流布局 */}
              <div className="columns-1 lg:columns-2 masonry-container">
                {filteredHistory.map((record) => (
                  <div key={record.id} className="masonry-item">
                    <HistoryItem
                      record={record}
                      onSelect={onHistoryItemClick}
                      onDelete={onDeleteHistoryItem}
                      isActive={activeItemId === record.id}
                      onFocus={handleItemFocus}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* 确认对话框 */}
      <ConfirmDialog
        isOpen={showClearConfirm}
        title="确认清空历史记录"
        message={`您即将删除所有 ${history.length} 条翻译历史记录。此操作无法撤销，请确认是否继续？`}
        confirmText="确认清空"
        cancelText="取消"
        onConfirm={confirmClearHistory}
        onCancel={cancelClearHistory}
        isDangerous={true}
      />
    </div>
  )
}

export default HistoryPanel