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
        <h4 className="text-base font-medium text-gray-900 flex items-center">
          <GlobeAltIcon className="w-4 h-4 mr-2 text-blue-600" />
          语言选择
        </h4>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleReset}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors"
          >
            重置默认
          </button>
          <button
            onClick={handleSelectAll}
            className="text-sm text-gray-600 hover:text-gray-700 font-medium px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
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
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="block w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-lg bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-colors hover:border-gray-300"
          placeholder="搜索语言..."
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
      
      {/* 语言列表 */}
      <div className="max-h-64 overflow-y-auto custom-scrollbar border border-gray-200 rounded-lg">
        <div className="p-2 space-y-1">
          {filteredLanguages.map((language) => {
            const isEnabled = enabledLanguages.includes(language.code)
            const isAuto = language.code === 'auto'
            
            return (
              <div
                key={language.code}
                className={`flex items-center justify-between p-2 rounded-lg transition-colors cursor-pointer hover:bg-gray-50 ${
                  isEnabled ? 'bg-blue-50 border border-blue-200' : 'border border-transparent'
                }`}
                onClick={() => !isAuto && handleLanguageToggle(language.code)}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
                    isEnabled 
                      ? 'bg-blue-600 border-blue-600' 
                      : 'border-gray-300 hover:border-gray-400'
                  } ${isAuto ? 'opacity-50' : ''}`}>
                    {isEnabled && (
                      <CheckIcon className="w-3 h-3 text-white" />
                    )}
                  </div>
                  <div>
                    <div className={`text-sm font-medium ${
                      isEnabled ? 'text-blue-900' : 'text-gray-900'
                    }`}>
                      {language.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {language.nativeName} ({language.code})
                      {isAuto && ' - 必选'}
                    </div>
                  </div>
                </div>
                
                {isAuto && (
                  <span className="text-xs text-blue-600 font-medium bg-blue-100 px-2 py-1 rounded">
                    必选
                  </span>
                )}
              </div>
            )
          })}
        </div>
      </div>
      
      {filteredLanguages.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <GlobeAltIcon className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-sm">未找到匹配的语言</p>
        </div>
      )}
    </div>
  )
}

export default LanguageSettings