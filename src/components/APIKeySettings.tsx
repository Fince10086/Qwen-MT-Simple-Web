import React, { useState } from 'react'
import { 
  EyeIcon, 
  EyeSlashIcon, 
  CheckCircleIcon, 
  ExclamationCircleIcon,
  ClockIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  WrenchScrewdriverIcon
} from '@heroicons/react/24/outline'
import { APIKeySettingsProps } from '../types'

// ActionButton组件，与UnifiedTranslationPanel中的保持一致
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
  const baseClasses = 'inline-flex items-center justify-center rounded-2xl font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 disabled:hover:scale-100'
  
  const variants = {
    primary: 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white focus:ring-blue-500 border-0',
    secondary: 'bg-white hover:bg-gray-50 text-gray-700 focus:ring-gray-400 border border-gray-200 hover:border-gray-300',
    danger: 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white focus:ring-red-500 border-0'
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
      type="button"
      aria-label={title}
    >
      {children}
    </button>
  )
}

const APIKeySettings: React.FC<APIKeySettingsProps> = ({
  apiKey,
  isValid,
  isValidating,
  onAPIKeyChange,
  onValidate
}) => {
  const [showAPIKey, setShowAPIKey] = useState(false)
  const [inputValue, setInputValue] = useState(apiKey)
  const [showHelp, setShowHelp] = useState(false)



  const handleAPIKeySubmit = async () => {
    if (inputValue.trim() !== apiKey) {
      await onAPIKeyChange(inputValue.trim())
    } else if (inputValue.trim()) {
      // 如果API Key没有变化但有值，则只验证
      await onValidate()
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAPIKeySubmit()
    }
  }

  const getStatusIcon = () => {
    if (isValidating) {
      return <ClockIcon className="w-5 h-5 text-blue-500 animate-spin" />
    }
    
    if (!inputValue.trim()) {
      return null
    }
    
    if (isValid) {
      return <CheckCircleIcon className="w-5 h-5 text-green-500" />
    } else {
      return <ExclamationCircleIcon className="w-5 h-5 text-red-500" />
    }
  }

  const getStatusText = () => {
    if (isValidating) {
      return '验证中...'
    }
    
    if (!inputValue.trim()) {
      return '请输入API Key'
    }
    
    if (isValid) {
      return 'API Key 有效'
    } else {
      return 'API Key 无效或验证失败'
    }
  }

  const getStatusColor = () => {
    if (isValidating) {
      return 'text-blue-600'
    }
    
    if (!inputValue.trim()) {
      return 'text-gray-500'
    }
    
    if (isValid) {
      return 'text-green-600'
    } else {
      return 'text-red-600'
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="api-key-input" className="block text-sm font-medium text-gray-700 mb-2">
          API Key
        </label>
        <div className="relative">
          <input
            id="api-key-input"
            type={showAPIKey ? 'text' : 'password'}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="请输入阿里云百炼 DashScope API Key"
            className="input-field pr-20"
            disabled={isValidating}
            aria-describedby="api-key-status api-key-help"
            aria-invalid={inputValue.trim() && !isValid ? 'true' : 'false'}
            autoComplete="off"
            spellCheck="false"
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 space-x-1">
            {getStatusIcon()}
            <button
              type="button"
              onClick={() => setShowAPIKey(!showAPIKey)}
              className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded"
              disabled={isValidating}
              aria-label={showAPIKey ? '隐藏API Key' : '显示API Key'}
              title={showAPIKey ? '隐藏API Key' : '显示API Key'}
            >
              {showAPIKey ? (
                <EyeSlashIcon className="w-5 h-5" aria-hidden="true" />
              ) : (
                <EyeIcon className="w-5 h-5" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
        
        {/* 状态显示 */}
        <div id="api-key-status" className={`mt-2 flex items-center space-x-2 text-sm ${getStatusColor()}`} role="status" aria-live="polite">
          <span>{getStatusText()}</span>
        </div>
        
        {/* 操作按钮 */}
        <div className="mt-3 flex flex-wrap gap-3" role="group" aria-label="API Key操作按钮">
          <ActionButton
            onClick={handleAPIKeySubmit}
            disabled={isValidating || !inputValue.trim()}
            variant="primary"
            size="md"
            title={isValidating ? '验证中...' : (inputValue.trim() !== apiKey ? '保存并验证' : '验证')}
          >
            {isValidating && (
              <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" aria-hidden="true" />
            )}
            {isValidating ? '验证中...' : (inputValue.trim() !== apiKey ? '保存并验证' : '验证')}
          </ActionButton>
          
          {inputValue !== apiKey && (
            <ActionButton
              onClick={() => setInputValue(apiKey)}
              disabled={isValidating}
              variant="secondary"
              size="md"
              title="取消修改，恢复到原始值"
            >
              取消
            </ActionButton>
          )}
        </div>
      </div>
      
      {/* API Key 帮助信息 */}
      <div className="border border-gray-200 rounded-lg">
        <button
          onClick={() => setShowHelp(!showHelp)}
          className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg"
          aria-expanded={showHelp}
          aria-controls="api-key-help"
          type="button"
        >
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">API Key 使用说明</span>
            <span className="text-xs text-gray-500">(点击查看详细信息)</span>
          </div>
          {showHelp ? (
            <ChevronDownIcon className="w-4 h-4 text-gray-500" aria-hidden="true" />
          ) : (
            <ChevronRightIcon className="w-4 h-4 text-gray-500" aria-hidden="true" />
          )}
        </button>
        
        {showHelp && (
          <div id="api-key-help" className="border-t border-gray-200 p-4 space-y-4" role="region" aria-label="API Key帮助信息">
              <div>
                <h4 className="text-sm font-medium text-blue-900 mb-2 flex items-center">
                  <ExclamationCircleIcon className="w-4 h-4 mr-2" aria-hidden="true" />
                  格式
                </h4>
                <div className="text-sm text-blue-900 space-y-1">
                  <p>• API Key 通常以 "sk-" 开头，长度约为 50-100 个字符</p>
                  <p>• 确保复制完整的 API Key，不要包含多余的空格</p>
                  <p>• 如果验证失败，请检查：</p>
                  <div className="ml-4 space-y-1 text-xs">
                    <p>- API Key 是否正确复制</p>
                    <p>- 账户是否有足够的余额</p>
                    <p>- 所选区域是否正确</p>
                    <p>- 网络连接是否正常</p>
                  </div>
                </div>
              </div>
            
              <div>
                <h4 className="text-sm font-medium text-green-900 mb-2 flex items-center">
                  <CheckCircleIcon className="w-4 h-4 mr-2" aria-hidden="true" />
                  获取
                </h4>
                <div className="text-sm text-green-900 space-y-1">
                  <p>1. 访问 <a href="https://dashscope.aliyun.com/" target="_blank" rel="noopener noreferrer" className="underline hover:text-green-600">阿里云百炼控制台</a></p>
                  <p>2. 登录/注册阿里云账号</p>
                  <p>3. 在控制台中创建应用并获取 API Key</p>
                  <p>4. 确保账户有足够的免费或付费额度使用翻译服务</p>
                </div>
              </div>
            
              <div>
                <h4 className="text-sm font-medium text-yellow-900 mb-2 flex items-center">
                  <WrenchScrewdriverIcon className="w-4 h-4 mr-2" aria-hidden="true" />
                  安全提示
                </h4>
                <div className="text-sm text-yellow-900 space-y-1">
                  <p>• API Key 将安全存储在您的浏览器本地</p>
                  <p>• 不要在公共场所或不安全的网络环境下输入 API Key</p>
                  <p>• 建议定期更换 API Key 以确保安全</p>
                </div>
              </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default APIKeySettings