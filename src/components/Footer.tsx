import React from 'react'
import { HeartIcon } from '@heroicons/react/24/solid'

interface FooterProps {
  className?: string
}

export const Footer: React.FC<FooterProps> = ({ className = '' }) => {
  return (
    <footer className={`bg-gray-50 border-t border-gray-200 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase">
              Qwen-MT 翻译
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              基于通义千问模型的智能翻译服务，支持92种语言互译，为您提供高质量的翻译体验。
            </p>
          </div>
          
          {/* Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase">
              相关链接
            </h3>
            <ul className="mt-2 space-y-2">
              <li>
                <a
                  href="https://help.aliyun.com/zh/model-studio/machine-translation"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-600 hover:text-primary-600 transition-colors"
                >
                  Qwen-MT 文档
                </a>
              </li>
              <li>
                <a
                  href="https://bailian.console.aliyun.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-600 hover:text-primary-600 transition-colors"
                >
                  阿里云百炼
                </a>
              </li>
              <li>
                <a
                  href="https://tongyi.aliyun.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-600 hover:text-primary-600 transition-colors"
                >
                  通义千问
                </a>
              </li>
            </ul>
          </div>
          
          {/* Features */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase">
              特性
            </h3>
            <ul className="mt-2 space-y-2 text-sm text-gray-600">
              <li>• 支持92种语言互译</li>
              <li>• 高质量翻译结果</li>
              <li>• 实时翻译响应</li>
              <li>• 翻译历史记录</li>
              <li>• 响应式设计</li>
            </ul>
          </div>
        </div>
        
        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <p className="text-sm text-gray-500">
              © {new Date().getFullYear()} Qwen-MT 翻译网站. 基于阿里云百炼平台构建.
            </p>
            <div className="mt-4 md:mt-0 flex items-center text-sm text-gray-500">
              <span>Made with</span>
              <HeartIcon className="w-4 h-4 text-red-500 mx-1" />
              <span>by AI Assistant</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer