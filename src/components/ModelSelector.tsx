import React from 'react'
import { RadioGroup } from '@headlessui/react'
import { CheckCircleIcon, InformationCircleIcon } from '@heroicons/react/24/solid'
import { ModelSelectorProps, ModelInfo } from '../types'

interface ModelCardProps {
  model: ModelInfo
  selected: boolean
  disabled?: boolean
}

const ModelCard: React.FC<ModelCardProps> = ({ model, selected, disabled = false }) => {
  return (
    <div className={`
      relative rounded-lg border p-4 cursor-pointer transition-all duration-200
      ${selected 
        ? 'border-primary-500 ring-2 ring-primary-500 bg-primary-50' 
        : 'border-gray-300 hover:border-gray-400 bg-white'
      }
      ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
    `}>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <h4 className={`text-sm font-medium ${selected ? 'text-primary-900' : 'text-gray-900'}`}>
              {model.name}
            </h4>
            {model.id === 'qwen-mt-plus' && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                推荐
              </span>
            )}
          </div>
          <p className={`mt-1 text-sm ${selected ? 'text-primary-700' : 'text-gray-500'}`}>
            {model.description}
          </p>
          
          {/* Model Specs */}
          <div className="mt-3 grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-gray-500">上下文长度:</span>
              <span className="ml-1 font-medium">{model.contextLength.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-gray-500">最大输入:</span>
              <span className="ml-1 font-medium">{model.maxInput.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-gray-500">输入成本:</span>
              <span className="ml-1 font-medium">¥{model.inputCostPer1k}/1K tokens</span>
            </div>
            <div>
              <span className="text-gray-500">输出成本:</span>
              <span className="ml-1 font-medium">¥{model.outputCostPer1k}/1K tokens</span>
            </div>
          </div>
        </div>
        
        {/* Selection Indicator */}
        <div className="flex-shrink-0 ml-4">
          {selected && (
            <CheckCircleIcon className="w-5 h-5 text-primary-600" />
          )}
        </div>
      </div>
    </div>
  )
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({
  selectedModel,
  availableModels,
  onModelChange,
  disabled = false
}) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center space-x-2 mb-4">
        <h3 className="text-lg font-medium text-gray-900">模型选择</h3>
        <div className="group relative">
          <InformationCircleIcon className="w-5 h-5 text-gray-400 cursor-help" />
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 p-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
            选择合适的模型以获得最佳翻译效果。Plus模型提供更高质量，Turbo模型速度更快成本更低。
          </div>
        </div>
      </div>
      
      <RadioGroup value={selectedModel} onChange={onModelChange} disabled={disabled}>
        <RadioGroup.Label className="sr-only">选择翻译模型</RadioGroup.Label>
        <div className="space-y-4">
          {availableModels.map((model) => (
            <RadioGroup.Option
              key={model.id}
              value={model.id}
              disabled={disabled}
              className="focus:outline-none"
            >
              {({ checked }) => (
                <ModelCard
                  model={model}
                  selected={checked}
                  disabled={disabled}
                />
              )}
            </RadioGroup.Option>
          ))}
        </div>
      </RadioGroup>
      
      {/* Model Comparison */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-medium text-gray-900 mb-3">模型对比</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h5 className="font-medium text-gray-700 mb-2">Qwen-MT Plus</h5>
            <ul className="space-y-1 text-gray-600">
              <li>• 旗舰级翻译质量</li>
              <li>• 更好的上下文理解</li>
              <li>• 专业术语准确性高</li>
              <li>• 适合重要文档翻译</li>
            </ul>
          </div>
          <div>
            <h5 className="font-medium text-gray-700 mb-2">Qwen-MT Turbo</h5>
            <ul className="space-y-1 text-gray-600">
              <li>• 快速响应速度</li>
              <li>• 低成本高效率</li>
              <li>• 日常翻译需求</li>
              <li>• 批量翻译场景</li>
            </ul>
          </div>
        </div>
      </div>
      
      {/* Current Selection Info */}
      <div className="mt-4 p-3 bg-primary-50 rounded-lg border border-primary-200">
        <div className="flex items-center space-x-2">
          <CheckCircleIcon className="w-4 h-4 text-primary-600" />
          <span className="text-sm text-primary-800">
            当前选择: {availableModels.find(m => m.id === selectedModel)?.name}
          </span>
        </div>
        <p className="mt-1 text-xs text-primary-700">
          {availableModels.find(m => m.id === selectedModel)?.description}
        </p>
      </div>
    </div>
  )
}

export default ModelSelector