import React, { useState } from 'react'
import { 
  ComputerDesktopIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'

interface APIDiagnosticsProps {
  apiKey: string
  region: 'beijing' | 'singapore'
  onClose: () => void
}

const APIDiagnostics: React.FC<APIDiagnosticsProps> = ({ apiKey, region, onClose }) => {
  const [diagnostics, setDiagnostics] = useState<{
    keyFormat: boolean
    networkReach: boolean
    authTest: 'pending' | 'success' | 'failed'
    details: string[]
  }>({
    keyFormat: false,
    networkReach: false,
    authTest: 'pending',
    details: []
  })
  const [isRunning, setIsRunning] = useState(false)

  const runDiagnostics = async () => {
    setIsRunning(true)
    const details: string[] = []
    
    try {
      // 1. 检查API Key格式
      const keyFormat = apiKey.length > 20 && (apiKey.startsWith('sk-') || apiKey.includes('-'))
      details.push(`API Key长度: ${apiKey.length}字符`)
      details.push(`API Key前缀: ${apiKey.substring(0, 10)}...`)
      
      // 2. 检查网络连通性
      const baseURL = region === 'singapore' 
        ? 'https://dashscope-intl.aliyuncs.com' 
        : 'https://dashscope.aliyuncs.com'
      
      let networkReach = false
      try {
        // 简单的网络连通性测试
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 5000)
        
        const response = await fetch(`${baseURL}/compatible-mode/v1/chat/completions`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer invalid_key_test`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'qwen-mt-turbo',
            messages: [{ role: 'user', content: 'test' }]
          }),
          signal: controller.signal
        })
        
        clearTimeout(timeoutId)
        networkReach = true
        details.push(`网络连接: 成功 (${response.status})`)
      } catch (error: any) {
        if (error.name === 'AbortError') {
          details.push('网络连接: 超时 (5秒)')
        } else {
          details.push(`网络连接: 失败 (${error.message})`)
        }
      }
      
      // 3. 认证测试
      let authTest: 'success' | 'failed' = 'failed'
      try {
        const response = await fetch(`${baseURL}/compatible-mode/v1/chat/completions`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'qwen-mt-turbo',
            messages: [{ role: 'user', content: 'test' }],
            translation_options: {
              source_lang: 'en',
              target_lang: 'zh'
            },
            max_tokens: 5
          })
        })
        
        if (response.ok) {
          authTest = 'success'
          details.push('认证测试: ✅ 成功')
        } else {
          const errorData = await response.json().catch(() => ({}))
          details.push(`认证测试: ❌ 失败 (HTTP ${response.status})`)
          details.push(`错误详情: ${JSON.stringify(errorData, null, 2)}`)
        }
      } catch (error: any) {
        details.push(`认证测试: ❌ 异常 (${error.message})`)
      }
      
      setDiagnostics({
        keyFormat,
        networkReach,
        authTest,
        details
      })
    } finally {
      setIsRunning(false)
    }
  }

  const getStatusIcon = (status: boolean | string) => {
    if (status === true || status === 'success') {
      return <ShieldCheckIcon className="w-5 h-5 text-green-500" />
    } else if (status === 'pending') {
      return <ComputerDesktopIcon className="w-5 h-5 text-gray-400" />
    } else {
      return <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900">API 诊断工具</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>
        
        <div className="space-y-6">
          {/* 诊断项目 */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              {getStatusIcon(diagnostics.keyFormat)}
              <span className="font-medium">API Key 格式检查</span>
            </div>
            
            <div className="flex items-center space-x-3">
              {getStatusIcon(diagnostics.networkReach)}
              <span className="font-medium">网络连通性</span>
            </div>
            
            <div className="flex items-center space-x-3">
              {getStatusIcon(diagnostics.authTest)}
              <span className="font-medium">认证测试</span>
            </div>
          </div>
          
          {/* 运行按钮 */}
          <div className="flex justify-center">
            <button
              onClick={runDiagnostics}
              disabled={isRunning || !apiKey.trim()}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isRunning ? '诊断中...' : '开始诊断'}
            </button>
          </div>
          
          {/* 诊断详情 */}
          {diagnostics.details.length > 0 && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-3">诊断详情</h4>
              <div className="space-y-2 text-sm font-mono">
                {diagnostics.details.map((detail, index) => (
                  <div key={index} className="text-gray-700">
                    {detail}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* 建议 */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">常见问题解决方案</h4>
            <div className="text-sm text-blue-800 space-y-2">
              <div>
                <strong>认证失败:</strong>
                <ul className="ml-4 list-disc space-y-1">
                  <li>确认API Key是否正确复制（包含完整字符串）</li>
                  <li>检查阿里云账户余额是否充足</li>
                  <li>确认API Key权限是否包含DashScope服务</li>
                </ul>
              </div>
              
              <div>
                <strong>网络问题:</strong>
                <ul className="ml-4 list-disc space-y-1">
                  <li>尝试切换API区域（北京/新加坡）</li>
                  <li>检查是否被防火墙或代理拦截</li>
                  <li>确认网络连接稳定</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-6 flex justify-end">
          <button onClick={onClose} className="btn-secondary">
            关闭
          </button>
        </div>
      </div>
    </div>
  )
}

export default APIDiagnostics