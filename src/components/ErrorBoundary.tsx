import React, { Component, ErrorInfo, ReactNode } from 'react'
import { ExclamationTriangleIcon, ArrowPathIcon } from '@heroicons/react/24/outline'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
          <div className="sm:mx-auto sm:w-full sm:max-w-md">
            <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
              <div className="text-center">
                <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-400" />
                <h2 className="mt-4 text-lg font-medium text-gray-900">
                  出现了意外错误
                </h2>
                <p className="mt-2 text-sm text-gray-600">
                  抱歉，应用遇到了一个错误。请尝试刷新页面。
                </p>
                
                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                  <button onClick={this.handleReset} className="btn-primary flex items-center justify-center">
                    <ArrowPathIcon className="w-4 h-4 mr-2" />
                    重试
                  </button>
                  <button onClick={() => window.location.reload()} className="btn-secondary">
                    刷新页面
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary