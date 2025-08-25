import React, { useEffect, useRef } from 'react'
import { ExclamationTriangleIcon, XMarkIcon } from '@heroicons/react/24/outline'

interface ErrorAlertProps {
  message: string
  onClose: () => void
}

export const ErrorAlert: React.FC<ErrorAlertProps> = ({ message, onClose }) => {
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  
  // 自动聚焦到关闭按钮，方便键盘用户操作
  useEffect(() => {
    if (closeButtonRef.current) {
      closeButtonRef.current.focus()
    }
  }, [])
  
  // 键盘事件处理
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose()
    }
  }
  
  return (
    <div 
      className="fixed top-4 right-4 max-w-md bg-red-50 border border-red-200 rounded-lg p-4 shadow-lg z-50"
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <div className="flex">
        <div className="flex-shrink-0">
          <ExclamationTriangleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
        </div>
        <div className="ml-3">
          <p className="text-sm text-red-800" id="error-message">{message}</p>
        </div>
        <div className="ml-auto pl-3">
          <button
            ref={closeButtonRef}
            onClick={onClose}
            className="inline-flex text-red-400 hover:text-red-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-red-50 rounded"
            aria-label="关闭错误提示"
            aria-describedby="error-message"
            type="button"
          >
            <XMarkIcon className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default ErrorAlert