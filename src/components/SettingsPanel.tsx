import React from 'react'
import {
  CogIcon,
  KeyIcon,
  GlobeAltIcon,
  CodeBracketIcon
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
    <div className="space-y-6">
      {/* 头部 */}
      <div className="flex items-center">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <CogIcon className="w-5 h-5 mr-2 text-blue-600" />
          设置
        </h3>
      </div>

        {/* API 区域设置 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            服务区域
          </label>
          <select
            value={apiRegion}
            onChange={(e) => setAPIRegion(e.target.value as 'beijing' | 'singapore')}
            className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors hover:border-gray-300"
          >
            <option value="beijing">北京（大陆）</option>
            <option value="singapore">新加坡（国际）</option>
          </select>
        </div>
      
      {/* API Key 配置 */}
      <div className="space-y-4">
        <h4 className="text-base font-medium text-gray-900 flex items-center">
          <KeyIcon className="w-4 h-4 mr-2 text-blue-600" />
          API Key 配置
        </h4>
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
      
      {/* 环境变量配置提示 */}
      <div className="space-y-4">
        <h4 className="text-base font-medium text-gray-900 flex items-center">
          <CodeBracketIcon className="w-4 h-4 mr-2 text-blue-600" />
          环境变量配置
        </h4>
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600 mb-3">您也可以在 .env 文件中配置：</p>
          <code className="block text-sm text-gray-800 bg-white p-3 rounded border font-mono">
            VITE_DASHSCOPE_API_KEY=your_api_key_here<br />
            VITE_API_REGION={apiRegion}
          </code>
          <p className="mt-3 text-xs text-gray-500">
            注意：网页设置优先级高于环境变量配置
          </p>
        </div>
      </div>
    </div>
  )
}

export default SettingsPanel