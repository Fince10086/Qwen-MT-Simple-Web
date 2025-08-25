import React, { useState } from 'react'
import { 
  GlobeAltIcon,
  CheckIcon,
  MagnifyingGlassIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import { useTranslationStore } from '../stores/translationStore'

export const LanguageSettings: React.FC = () => {
  const { 
    supportedLanguages, 
    enabledLanguages, 
    setEnabledLanguages 
  } = useTranslationStore()
  
  const [searchTerm, setSearchTerm] = useState('')
  
  // 过滤语言列表
  const filteredLanguages = supportedLanguages.filter(lang =>
    lang.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lang.nativeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lang.code.toLowerCase().includes(searchTerm.toLowerCase())
  )
  
  // 处理语言选择切换
  const handleLanguageToggle = (languageCode: string) => {
    if (languageCode === 'auto') {
      // 自动检测不能被取消
      return
    }
    
    const newEnabledLanguages = enabledLanguages.includes(languageCode)
      ? enabledLanguages.filter(code => code !== languageCode)
      : [...enabledLanguages, languageCode]
    
    // 确保至少有一个非auto语言被启用
    const nonAutoLanguages = newEnabledLanguages.filter(code => code !== 'auto')
    if (nonAutoLanguages.length === 0) {
      return // 不允许取消所有语言
    }
    
    setEnabledLanguages(newEnabledLanguages)
  }
  
  // 重置为默认语言
  const handleReset = () => {
    // 导入默认语言列表
    import('../utils/constants').then(({ DEFAULT_ENABLED_LANGUAGES }) => {
      setEnabledLanguages(DEFAULT_ENABLED_LANGUAGES)
    })
  }
  
  // 选择全部语言
  const handleSelectAll = () => {
    setEnabledLanguages(supportedLanguages.map(lang => lang.code))
  }
  
  const clearSearch = () => {
    setSearchTerm('')
  }
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-medium text-gray-900 flex items-center">
          <GlobeAltIcon className="w-4 h-4 mr-3 text-blue-600" aria-hidden="true" />
          语言选择
        </h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleReset}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium px-4 py-2 rounded-xl hover:bg-blue-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            type="button"
          >
            重置默认
          </button>
          <button
            onClick={handleSelectAll}
            className="text-sm text-gray-600 hover:text-gray-700 font-medium px-4 py-2 rounded-xl hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 border border-gray-200"
            type="button"
          >
            选择全部
          </button>
        </div>
      </div>
      
      <p className="text-sm text-gray-600">
        选择您需要的语言，这些语言将出现在翻译界面的下拉菜单中。已选择 {enabledLanguages.length - 1} 种语言（除自动检测外）。
      </p>
      
      {/* 搜索框 */}
      <div className="relative">
        <label htmlFor="language-search" className="sr-only">搜索语言</label>
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" aria-hidden="true" />
        </div>
        <input
          id="language-search"
          type="search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="block w-full pl-10 pr-10 py-2 border border-gray-200 rounded-lg bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-colors hover:border-gray-300"
          placeholder="搜索语言..."
          aria-describedby="search-help"
          autoComplete="off"
        />
        {searchTerm && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <button
              onClick={clearSearch}
              className="text-gray-400 hover:text-gray-600 p-1 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-1"
              aria-label="清除搜索条件"
              type="button"
            >
              <XMarkIcon className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        )}
        <div id="search-help" className="sr-only">
          输入关键词搜索语言，支持按语言名称、本地名称或代码搜索
        </div>
      </div>
      
      {/* 语言列表 */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="max-h-72 overflow-y-auto custom-scrollbar">
          <div className="p-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1" role="group" aria-label="语言选择列表">
            {filteredLanguages.map((language) => {
              const isEnabled = enabledLanguages.includes(language.code)
              const isAuto = language.code === 'auto'
              
              return (
                <div
                  key={language.code}
                  className={`flex items-center justify-between p-2 rounded-lg transition-colors cursor-pointer hover:bg-gray-50 ${
                    isEnabled ? 'bg-blue-50 border border-blue-200' : 'border border-transparent'
                  } ${isAuto ? 'opacity-75' : ''}`}
                  onClick={() => !isAuto && handleLanguageToggle(language.code)}
                  role="button"
                  tabIndex={isAuto ? -1 : 0}
                  aria-pressed={isEnabled}
                  aria-label={`${language.name} (${language.nativeName}) ${isAuto ? '必选' : isEnabled ? '已选中' : '未选中'}`}
                  onKeyDown={(e) => {
                    if ((e.key === 'Enter' || e.key === ' ') && !isAuto) {
                      e.preventDefault()
                      handleLanguageToggle(language.code)
                    }
                  }}
                >
                  <div className="flex items-center space-x-2 min-w-0 flex-1">
                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors flex-shrink-0 ${
                      isEnabled 
                        ? 'bg-blue-600 border-blue-600' 
                        : 'border-gray-300 hover:border-gray-400'
                    } ${isAuto ? 'opacity-50' : ''}`} aria-hidden="true">
                      {isEnabled && (
                        <CheckIcon className="w-2.5 h-2.5 text-white" aria-hidden="true" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className={`text-xs font-medium truncate ${
                        isEnabled ? 'text-blue-900' : 'text-gray-900'
                      }`}>
                        {language.name}
                      </div>
                      <div className="text-xs text-gray-500 truncate">
                        {language.nativeName}
                        {isAuto && ' - 必选'}
                      </div>
                    </div>
                  </div>
                  
                  {isAuto && (
                    <span className="text-xs font-medium bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded text-center flex-shrink-0" aria-hidden="true">
                      必选
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
      
      {filteredLanguages.length === 0 && (
        <div className="text-center py-8" role="status" aria-live="polite">
          <GlobeAltIcon className="mx-auto h-12 w-12 text-gray-300" aria-hidden="true" />
          <h3 className="mt-3 text-sm font-medium text-gray-900">未找到匹配的语言</h3>
          <p className="mt-1 text-xs text-gray-500">
            尝试使用不同的关键词搜索
          </p>
          <button
            onClick={clearSearch}
            className="mt-3 text-blue-600 hover:text-blue-700 font-medium px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 text-xs"
            type="button"
          >
            清除搜索条件
          </button>
        </div>
      )}
    </div>
  )
}

export default LanguageSettings