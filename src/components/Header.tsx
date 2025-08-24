import React from 'react'
import { LanguageIcon, CogIcon } from '@heroicons/react/24/outline'

interface HeaderProps {
  onSettingsClick?: () => void
  className?: string
}

export const Header: React.FC<HeaderProps> = ({ onSettingsClick, className = '' }) => {
  return (
    <header className={`bg-white shadow-sm border-b border-gray-200 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Title */}
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                <LanguageIcon className="w-6 h-6 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Qwen-MT 翻译</h1>
              <p className="text-sm text-gray-500">智能多语言翻译服务</p>
            </div>
          </div>
          
          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <a
              href="#translate"
              className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              翻译
            </a>
            <a
              href="#history"
              className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              历史记录
            </a>
            <a
              href="#about"
              className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              关于
            </a>
          </nav>
          
          {/* Settings Button */}
          <div className="flex items-center">
            <button
              onClick={onSettingsClick}
              className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-md transition-colors"
              title="设置"
            >
              <CogIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Navigation */}
      <div className="md:hidden">
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-gray-200">
          <a
            href="#translate"
            className="text-gray-700 hover:text-primary-600 block px-3 py-2 rounded-md text-base font-medium"
          >
            翻译
          </a>
          <a
            href="#history"
            className="text-gray-700 hover:text-primary-600 block px-3 py-2 rounded-md text-base font-medium"
          >
            历史记录
          </a>
          <a
            href="#about"
            className="text-gray-700 hover:text-primary-600 block px-3 py-2 rounded-md text-base font-medium"
          >
            关于
          </a>
        </div>
      </div>
    </header>
  )
}

export default Header