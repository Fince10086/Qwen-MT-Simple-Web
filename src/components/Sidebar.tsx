import React from 'react'
import {
  LanguageIcon,
  ClockIcon,
  CogIcon
} from '@heroicons/react/24/outline'

interface SidebarProps {
  activeTab: 'translate' | 'history' | 'settings'
  onTabChange: (tab: 'translate' | 'history' | 'settings') => void
  onShowSettings: () => void
}

interface SidebarItemProps {
  icon: React.ComponentType<{ className?: string }>
  label: string
  isActive?: boolean
  onClick: () => void
  isMobile?: boolean
}

const SidebarItem: React.FC<SidebarItemProps> = ({ icon: Icon, label, isActive, onClick, isMobile = false }) => {
  return (
    <button
      onClick={onClick}
      className={`
        ${isMobile 
          ? 'flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all duration-300'
          : 'w-full flex flex-col items-center justify-center p-4 rounded-2xl transition-all duration-300 group hover:scale-105'
        }
        ${isActive 
          ? 'bg-white text-blue-600 transform scale-105 shadow-lg' 
          : 'text-white/80 hover:text-white hover:bg-white/10'
        }
        focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600
      `}
      aria-label={`导航到${label}页面`}
      aria-current={isActive ? 'page' : undefined}
      title={label}
      type="button"
    >
      <Icon 
        className={`
          ${isMobile ? 'w-5 h-5 mb-1' : 'w-6 h-6 mb-2'} 
          transition-all duration-300 
          ${isActive ? 'scale-110' : (isMobile ? '' : 'group-hover:scale-110')}
        `}
        aria-hidden="true"
      />
      <span className={`
        ${isMobile ? 'text-xs' : 'text-xs'} 
        font-medium transition-all duration-300 
        ${isActive ? 'text-blue-600' : 'text-white/80 hover:text-white'}
      `}>
        {label}
      </span>
    </button>
  )
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, 
  onTabChange, 
  onShowSettings 
}) => {
  return (
    <>
      {/* 桌面端侧边栏 */}
      <nav 
        className="hidden lg:flex fixed left-0 top-0 h-screen w-20 bg-gradient-to-b from-blue-600 to-indigo-600 border-r border-blue-700 z-40 flex-col"
        aria-label="主导航"
        role="navigation"
      >
        {/* Logo 区域 */}
        <div className="flex-shrink-0 p-4 border-b border-blue-500/30">
          <div className="flex flex-col items-center justify-center">
            <div className="w-12 h-16 rounded-2xl flex items-center justify-center mb-2 transform hover:scale-110 transition-all duration-300">
              <img 
                src="/tongyi.png" 
                alt="Qwen翻译"
                className="w-12 h-12 object-contain"
              />
            </div>
            <div className="text-center" role="img" aria-label="Qwen翻译">
              <div className="text-xs font-bold text-white">
                Qwen
              </div>
              <div className="text-xs font-bold text-white">
                MT
              </div>
            </div>
          </div>
        </div>

        {/* 导航区域 */}
        <div className="flex-1 p-4 space-y-4" role="group" aria-label="功能导航">
          <SidebarItem
            icon={LanguageIcon}
            label="翻译"
            isActive={activeTab === 'translate'}
            onClick={() => onTabChange('translate')}
          />
          
          <SidebarItem
            icon={ClockIcon}
            label="历史"
            isActive={activeTab === 'history'}
            onClick={() => onTabChange('history')}
          />
          
          <SidebarItem
            icon={CogIcon}
            label="设置"
            isActive={activeTab === 'settings'}
            onClick={() => {
              onTabChange('settings')
              onShowSettings()
            }}
          />
        </div>
      </nav>

      {/* 移动端底栏 */}
      <nav 
        className="lg:hidden fixed bottom-0 left-0 right-0 bg-gradient-to-r from-blue-600 to-indigo-600 border-t border-blue-700 z-40 safe-area-pb"
        aria-label="主导航"
        role="navigation"
      >
        <div className="flex items-center justify-around px-4 py-2" role="group" aria-label="功能导航">
          <SidebarItem
            icon={LanguageIcon}
            label="翻译"
            isActive={activeTab === 'translate'}
            onClick={() => onTabChange('translate')}
            isMobile={true}
          />
          
          <SidebarItem
            icon={ClockIcon}
            label="历史"
            isActive={activeTab === 'history'}
            onClick={() => onTabChange('history')}
            isMobile={true}
          />
          
          <SidebarItem
            icon={CogIcon}
            label="设置"
            isActive={activeTab === 'settings'}
            onClick={() => {
              onTabChange('settings')
              onShowSettings()
            }}
            isMobile={true}
          />
        </div>
      </nav>
    </>
  )
}

export default Sidebar