import React, { useState } from 'react'
import {
  ClockIcon,
  TrashIcon,
  ClipboardDocumentIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline'
import { HistoryPanelProps, TranslationRecord } from '../types'

interface HistoryItemProps {
  record: TranslationRecord
  onSelect: (record: TranslationRecord) => void
  onDelete: (id: string) => void
}

const HistoryItem: React.FC<HistoryItemProps> = ({ record, onSelect, onDelete }) => {
  const [showFullText, setShowFullText] = useState(false)
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
  
  const truncateText = (text: string, maxLength: number = 100) => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
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
    <div className="bg-white border border-gray-100 rounded-xl p-4 hover:shadow-md transition-all duration-200 hover:border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <ClockIcon className="w-4 h-4" />
          <span>{formatTimestamp(record.timestamp)}</span>
          <span className="px-2 py-1 bg-gray-100 rounded text-xs">
            {record.model === 'qwen-mt-plus' ? 'Plus' : 'Turbo'}
          </span>
          <span className="text-gray-400">
            {record.sourceLanguage} → {record.targetLanguage}
          </span>
        </div>
        
        <div className="flex items-center space-x-1">
          <button
            onClick={() => onSelect(record)}
            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200"
            title="使用此翻译"
          >
            <ArrowPathIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(record.id)}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200"
            title="删除记录"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      {/* Content */}
      <div className="space-y-3">
        {/* Source Text */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-gray-700">原文</span>
            <button
              onClick={() => handleCopy(record.sourceText, 'source')}
              className="text-xs text-gray-500 hover:text-blue-600 flex items-center space-x-1 px-2 py-1 rounded-lg hover:bg-blue-50 transition-all duration-200"
            >
              <ClipboardDocumentIcon className="w-3 h-3" />
              <span>{copiedField === 'source' ? '已复制' : '复制'}</span>
            </button>
          </div>
          <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-xl border border-gray-100">
            {showFullText ? record.sourceText : truncateText(record.sourceText)}
          </p>
        </div>
        
        {/* Translated Text */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-gray-700">译文</span>
            <button
              onClick={() => handleCopy(record.translatedText, 'target')}
              className="text-xs text-gray-500 hover:text-blue-600 flex items-center space-x-1 px-2 py-1 rounded-lg hover:bg-blue-50 transition-all duration-200"
            >
              <ClipboardDocumentIcon className="w-3 h-3" />
              <span>{copiedField === 'target' ? '已复制' : '复制'}</span>
            </button>
          </div>
          <p className="text-sm text-gray-900 bg-green-50 p-3 rounded-xl border border-green-100">
            {showFullText ? record.translatedText : truncateText(record.translatedText)}
          </p>
        </div>
      </div>
      
      {/* Toggle Full Text */}
      {(record.sourceText.length > 100 || record.translatedText.length > 100) && (
        <button
          onClick={() => setShowFullText(!showFullText)}
          className="mt-3 text-xs text-blue-600 hover:text-blue-700 font-medium px-2 py-1 rounded-lg hover:bg-blue-50 transition-all duration-200"
        >
          {showFullText ? '收起' : '展开全文'}
        </button>
      )}
      
      {/* Token Usage */}
      {record.tokenUsage && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Token 用量: {record.tokenUsage.totalTokens}</span>
            <span>
              输入: {record.tokenUsage.promptTokens} | 输出: {record.tokenUsage.completionTokens}
            </span>
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
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <ClockIcon className="w-5 h-5 mr-2 text-primary-600" />
            翻译历史
            <span className="ml-2 text-sm text-gray-500">({history.length})</span>
          </h3>
          
          {history.length > 0 && (
            <button
              onClick={onClearHistory}
              className="text-sm text-red-600 hover:text-red-700 font-medium px-3 py-1.5 rounded-lg hover:bg-red-50 transition-all duration-200"
            >
              清空历史
            </button>
          )}
        </div>
        
        {/* Search Bar */}
        {history.length > 0 && (
          <div className="mt-4 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-10 py-3 border-2 border-gray-200 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all duration-200 hover:border-gray-300"
              placeholder="搜索翻译历史..."
            />
            {searchTerm && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <button
                  onClick={clearSearch}
                  className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-all duration-200"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Content */}
      <div className="p-6">
        {filteredHistory.length === 0 ? (
          <div className="text-center py-12">
            {history.length === 0 ? (
              <>
                <ClockIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">暂无翻译记录</h3>
                <p className="mt-1 text-sm text-gray-500">
                  开始翻译文本，您的翻译历史会显示在这里
                </p>
              </>
            ) : (
              <>
                <MagnifyingGlassIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">未找到匹配的记录</h3>
                <p className="mt-1 text-sm text-gray-500">
                  尝试使用不同的关键词搜索
                </p>
                <button
                  onClick={clearSearch}
                  className="mt-3 text-sm text-blue-600 hover:text-blue-700 font-medium px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-all duration-200"
                >
                  清除搜索条件
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto">
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
        
        {/* Usage Statistics */}
        {history.length > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">{history.length}</div>
                <div className="text-sm text-gray-500">总翻译次数</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {history.reduce((sum, record) => sum + (record.tokenUsage?.totalTokens || 0), 0).toLocaleString()}
                </div>
                <div className="text-sm text-gray-500">总Token消耗</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {new Set(history.map(r => `${r.sourceLanguage}-${r.targetLanguage}`)).size}
                </div>
                <div className="text-sm text-gray-500">语言对数量</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  {history.filter(r => r.model === 'qwen-mt-plus').length}
                </div>
                <div className="text-sm text-gray-500">Plus模型使用</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default HistoryPanel