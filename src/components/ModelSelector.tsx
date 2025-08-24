import React, { Fragment } from 'react'
import { RadioGroup, Listbox, Transition } from '@headlessui/react'
import { CheckCircleIcon, ChevronUpDownIcon, ArrowsRightLeftIcon, CheckIcon } from '@heroicons/react/24/outline'
import { ModelSelectorProps, LanguageSelectorProps, Language } from '../types'

// 语言下拉选择器组件
interface LanguageDropdownProps {
  value: string
  options: Language[]
  onChange: (value: string) => void
  disabled?: boolean
  label: string
  placeholder?: string
}

const LanguageDropdown: React.FC<LanguageDropdownProps> = ({
  value,
  options,
  onChange,
  disabled = false,
  label,
  placeholder = '选择语言'
}) => {
  const selectedLanguage = options.find(lang => lang.code === value)

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <Listbox value={value} onChange={onChange} disabled={disabled}>
        <div className="relative">
          <Listbox.Button className="relative w-full cursor-pointer rounded-md bg-white py-2 pl-3 pr-8 text-left shadow-sm border border-gray-300 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors text-sm">
            <span className="flex items-center">
              {selectedLanguage ? (
                <>
                  <span className="block truncate font-medium text-gray-900">
                    {selectedLanguage.name}
                  </span>
                </>
              ) : (
                <span className="block truncate text-gray-400">
                  {placeholder}
                </span>
              )}
            </span>
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronUpDownIcon
                className="h-4 w-4 text-gray-400"
                aria-hidden="true"
              />
            </span>
          </Listbox.Button>
          
          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options className="absolute z-10 mt-1 max-h-48 w-full overflow-auto rounded-md bg-white py-1 text-sm shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
              {options.map((language) => (
                <Listbox.Option
                  key={language.code}
                  className={({ active }) =>
                    `relative cursor-pointer select-none py-2 pl-8 pr-4 ${
                      active ? 'bg-primary-100 text-primary-900' : 'text-gray-900'
                    }`
                  }
                  value={language.code}
                >
                  {({ selected }) => (
                    <>
                      <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                        {language.name}
                      </span>
                      {selected ? (
                        <span className="absolute inset-y-0 left-0 flex items-center pl-2 text-primary-600">
                          <CheckIcon className="h-4 w-4" aria-hidden="true" />
                        </span>
                      ) : null}
                    </>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox>
    </div>
  )
}

// 整合的配置选择器组件
interface ConfigSelectorProps extends ModelSelectorProps, LanguageSelectorProps {}

export const ConfigSelector: React.FC<ConfigSelectorProps> = ({
  // Model props
  selectedModel,
  availableModels,
  onModelChange,
  // Language props
  sourceLanguage,
  targetLanguage,
  availableLanguages,
  onSourceLanguageChange,
  onTargetLanguageChange,
  onSwapLanguages,
  disabled = false
}) => {
  // 过滤目标语言列表，排除自动检测选项
  const targetLanguageOptions = availableLanguages.filter(lang => lang.code !== 'auto')
  
  const handleSwap = () => {
    if (sourceLanguage === 'auto') {
      return // 不能交换自动检测
    }
    onSwapLanguages()
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
      <h3 className="text-lg font-medium text-gray-900 mb-4">翻译配置</h3>
      
      {/* 语言配置 */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">语言设置</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
          <LanguageDropdown
            value={sourceLanguage}
            options={availableLanguages}
            onChange={onSourceLanguageChange}
            disabled={disabled}
            label="源语言"
            placeholder="选择源语言"
          />
          
          <LanguageDropdown
            value={targetLanguage}
            options={targetLanguageOptions}
            onChange={onTargetLanguageChange}
            disabled={disabled}
            label="目标语言"
            placeholder="选择目标语言"
          />
        </div>
        
        {/* 交换按钮 */}
        <div className="mt-3 flex justify-center">
          <button
            onClick={handleSwap}
            disabled={disabled || sourceLanguage === 'auto'}
            className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title={sourceLanguage === 'auto' ? '无法交换：源语言为自动检测' : '交换语言'}
          >
            <ArrowsRightLeftIcon className="w-3 h-3 mr-1" />
            交换
          </button>
        </div>
      </div>
      
      {/* 模型选择 */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-3">模型选择</h4>
        <RadioGroup value={selectedModel} onChange={onModelChange} disabled={disabled}>
          <RadioGroup.Label className="sr-only">选择翻译模型</RadioGroup.Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {availableModels.map((model) => (
              <RadioGroup.Option
                key={model.id}
                value={model.id}
                disabled={disabled}
                className="focus:outline-none"
              >
                {({ checked }) => (
                  <div className={`
                    relative rounded-md border p-3 cursor-pointer transition-all duration-200
                    ${checked 
                      ? 'border-primary-500 ring-1 ring-primary-500 bg-primary-50' 
                      : 'border-gray-300 hover:border-gray-400 bg-white'
                    }
                    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                  `}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className={`text-sm font-medium ${checked ? 'text-primary-900' : 'text-gray-900'}`}>
                          {model.name}
                        </span>
                        {model.id === 'qwen-mt-plus' && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                            推荐
                          </span>
                        )}
                      </div>
                      {checked && (
                        <CheckCircleIcon className="w-4 h-4 text-primary-600" />
                      )}
                    </div>
                  </div>
                )}
              </RadioGroup.Option>
            ))}
          </div>
        </RadioGroup>
      </div>
    </div>
  )
}

// 保持原有的ModelSelector组件，但简化版本
export const ModelSelector: React.FC<ModelSelectorProps> = ({
  selectedModel,
  availableModels,
  onModelChange,
  disabled = false
}) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
      <h3 className="text-base font-medium text-gray-900 mb-3">模型选择</h3>
      
      <RadioGroup value={selectedModel} onChange={onModelChange} disabled={disabled}>
        <RadioGroup.Label className="sr-only">选择翻译模型</RadioGroup.Label>
        <div className="space-y-2">
          {availableModels.map((model) => (
            <RadioGroup.Option
              key={model.id}
              value={model.id}
              disabled={disabled}
              className="focus:outline-none"
            >
              {({ checked }) => (
                <div className={`
                  relative rounded-md border p-3 cursor-pointer transition-all duration-200
                  ${checked 
                    ? 'border-primary-500 ring-1 ring-primary-500 bg-primary-50' 
                    : 'border-gray-300 hover:border-gray-400 bg-white'
                  }
                  ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                `}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className={`text-sm font-medium ${checked ? 'text-primary-900' : 'text-gray-900'}`}>
                        {model.name}
                      </span>
                      {model.id === 'qwen-mt-plus' && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                          推荐
                        </span>
                      )}
                    </div>
                    {checked && (
                      <CheckCircleIcon className="w-4 h-4 text-primary-600" />
                    )}
                  </div>
                </div>
              )}
            </RadioGroup.Option>
          ))}
        </div>
      </RadioGroup>
    </div>
  )
}

export default ModelSelector