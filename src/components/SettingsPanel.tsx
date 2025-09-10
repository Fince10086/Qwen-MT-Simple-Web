import React from 'react'
import {
  CogIcon,
  KeyIcon,
} from '@heroicons/react/24/outline'
import APIKeySettings from './APIKeySettings'
import LanguageSettings from './LanguageSettings'
import { useTranslationStore } from '../stores/translationStore'

export const SettingsPanel: React.FC = () => {
  const { 
    apiRegion, 
    apiKey,
    isAPIKeyValid,
    isValidatingAPIKey,
    setAPIRegion,
    setAPIKey,
    validateAPIKey
  } = useTranslationStore()
  
  return (
    <div className="w-full">
      {/* 主容器 - 参照翻译面板风格 */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        {/* 顶部配置栏 */}
        <div className="bg-gray-50 px-4 lg:px-8 py-4 lg:py-6 border-b border-gray-200">
          <div className="flex flex-col space-y-4">
            {/* 标题 */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-3 sm:space-y-0">
              <h2 className="text-lg lg:text-xl font-semibold text-gray-900 flex items-center">
                <CogIcon className="w-5 h-5 lg:w-6 lg:h-6 mr-3 text-blue-600" aria-hidden="true" />
                设置
              </h2>
            </div>
          </div>
        </div>
        
        {/* 内容区域 */}
        <div className="p-4 lg:p-8">
          <div className="space-y-6 lg:space-y-8">
            {/* API 区域设置 */}
            <div className="space-y-4">
              <h3 className="text-base font-medium text-gray-900 flex items-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-3" aria-hidden="true"></div>
                服务区域
              </h3>
              <select
                value={apiRegion}
                onChange={(e) => setAPIRegion(e.target.value as 'beijing' | 'singapore')}
                className="w-full px-4 py-3 lg:py-4 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors hover:border-gray-300 text-sm lg:text-base"
                aria-label="选择API服务区域"
              >
                <option value="beijing">北京（大陆）</option>
                <option value="singapore">新加坡（国际）</option>
              </select>
            </div>
            
            {/* API Key 配置 */}
            <div className="space-y-4">
              <h3 className="text-base font-medium text-gray-900 flex items-center">
                <KeyIcon className="w-4 h-4 mr-3 text-blue-600" aria-hidden="true" />
                API Key 配置
              </h3>
              <APIKeySettings
                apiKey={apiKey}
                isValid={isAPIKeyValid}
                isValidating={isValidatingAPIKey}
                region={apiRegion}
                onAPIKeyChange={setAPIKey}
                onValidate={validateAPIKey}
              />
            </div>
            
            {/* 语言设置 */}
            <div className="space-y-4">
              <LanguageSettings />
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}

export default SettingsPanel