import React, { useState } from 'react'
import {
  ClockIcon,
  TrashIcon,
  ClipboardDocumentIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  ArrowPathIcon,
  CpuChipIcon
} from '@heroicons/react/24/outline'
import { HistoryPanelProps, TranslationRecord } from '../types'

interface HistoryItemProps {
  record: TranslationRecord
  onSelect: (record: TranslationRecord) => void
  onDelete: (id: string) => void
}

const HistoryItem: React.FC<HistoryItemProps> = ({ record, onSelect, onDelete }) => {
  const [copiedField, setCopiedField] = useState<'source' | 'target' | null>(null)
  
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
      setTimeout(() => setCopiedField(null), 2000)
    } catch (error) {
      console.error('Failed to copy text:', error)
    }
  }
  
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-3 lg:p-4 hover:bg-gray-50 transition-colors duration-200">
      {/* 头部信息 */}
      <div className="flex items-center justify-between mb-2 lg:mb-3">
        <div className="flex items-center space-x-2 lg:space-x-3 text-xs lg:text-sm text-gray-600">
          <span className="flex items-center space-x-1">
            <ClockIcon className="w-3 h-3 lg:w-4 lg:h-4" />
            <span>{formatTimestamp(record.timestamp)}</span>
          </span>
          <span className="px-1.5 lg:px-2 py-0.5 lg:py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
            {record.model === 'qwen-mt-plus' ? 'Plus' : 'Turbo'}
          </span>
          <span className="text-gray-500 hidden sm:inline">
            {record.sourceLanguage} → {record.targetLanguage}
          </span>
        </div>
        
        <div className="flex items-center space-x-1">
          <button
            onClick={() => onSelect(record)}
            className="p-1 lg:p-1.5 text-gray-400 hover:text-blue-600 rounded transition-colors"
            title="使用此翻译"
          >
            <ArrowPathIcon className="w-3 h-3 lg:w-4 lg:h-4" />
          </button>
          <button
            onClick={() => onDelete(record.id)}
            className="p-1 lg:p-1.5 text-gray-400 hover:text-red-600 rounded transition-colors"
            title="删除记录"
          >
            <TrashIcon className="w-3 h-3 lg:w-4 lg:h-4" />
          </button>
        </div>
      </div>
      
      {/* 翻译内容 */}
      <div className="space-y-2">
        {/* 原文 */}
        <div className="flex items-start space-x-2">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-gray-600">原文</span>
              <button
                onClick={() => handleCopy(record.sourceText, 'source')}
                className="text-xs text-gray-500 hover:text-blue-600 flex items-center space-x-1 transition-colors"
              >
                <ClipboardDocumentIcon className="w-3 h-3" />
                <span>{copiedField === 'source' ? '已复制' : '复制'}</span>
              </button>
            </div>
            <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded border whitespace-pre-wrap break-words">
              {record.sourceText}
            </p>
          </div>
        </div>
        
        {/* 译文 */}
        <div className="flex items-start space-x-2">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-gray-600">译文</span>
              <button
                onClick={() => handleCopy(record.translatedText, 'target')}
                className="text-xs text-gray-500 hover:text-blue-600 flex items-center space-x-1 transition-colors"
              >
                <ClipboardDocumentIcon className="w-3 h-3" />
                <span>{copiedField === 'target' ? '已复制' : '复制'}</span>
              </button>
            </div>
            <p className="text-sm text-gray-900 bg-green-50 p-2 rounded border border-green-200 whitespace-pre-wrap break-words">
              {record.translatedText}
            </p>
          </div>
        </div>
      </div>
      
      {/* Token 消耗统计 */}
      {record.tokenUsage && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-1 text-gray-600">
              <CpuChipIcon className="w-3 h-3" />
              <span>Token 消耗</span>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-gray-500">
                输入: <span className="font-medium text-blue-600">{record.tokenUsage.promptTokens}</span>
              </span>
              <span className="text-gray-500">
                输出: <span className="font-medium text-green-600">{record.tokenUsage.completionTokens}</span>
              </span>
              <span className="text-gray-700 font-medium">
                总计: <span className="text-indigo-600">{record.tokenUsage.totalTokens}</span>
              </span>
            </div>
          </div>
        </div>
      )}
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
  
  // 搜索功能
  React.useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredHistory(history)
    } else {
      const filtered = history.filter(record =>
        record.sourceText.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.translatedText.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredHistory(filtered)
    }
  }, [searchTerm, history])
  
  const clearSearch = () => {
    setSearchTerm('')
  }
  
  return (
    <div className="space-y-3 lg:space-y-4">
      {/* 头部和搜索 */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-3 sm:space-y-0">
        <h3 className="text-base lg:text-lg font-medium text-gray-900 flex items-center">
          <ClockIcon className="w-4 h-4 lg:w-5 lg:h-5 mr-2 text-blue-600" />
          翻译历史
          <span className="ml-2 text-sm text-gray-500">({history.length})</span>
        </h3>
        
        {history.length > 0 && (
          <button
            onClick={onClearHistory}
            className="text-sm text-red-600 hover:text-red-700 font-medium px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
          >
            清空历史
          </button>
        )}
      </div>
      
      {/* 搜索框 */}
      {history.length > 0 && (
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-10 py-2 lg:py-2.5 border border-gray-200 rounded-lg bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-colors hover:border-gray-300"
            placeholder="搜索翻译历史..."
          />
          {searchTerm && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <button
                onClick={clearSearch}
                className="text-gray-400 hover:text-gray-600 p-1 rounded transition-colors"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      )}
      
      {/* 内容区域 */}
      {filteredHistory.length === 0 ? (
        <div className="text-center py-8">
          {history.length === 0 ? (
            <>
              <ClockIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-3 text-sm font-medium text-gray-900">暂无翻译记录</h3>
              <p className="mt-1 text-sm text-gray-500">
                开始翻译文本，您的翻译历史会显示在这里
              </p>
            </>
          ) : (
            <>
              <MagnifyingGlassIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-3 text-sm font-medium text-gray-900">未找到匹配的记录</h3>
              <p className="mt-1 text-sm text-gray-500">
                尝试使用不同的关键词搜索
              </p>
              <button
                onClick={clearSearch}
                className="mt-3 text-sm text-blue-600 hover:text-blue-700 font-medium px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors"
              >
                清除搜索条件
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-2 lg:space-y-3">
          {filteredHistory.map((record) => (
            <HistoryItem
              key={record.id}
              record={record}
              onSelect={onHistoryItemClick}
              onDelete={onDeleteHistoryItem}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default HistoryPanel