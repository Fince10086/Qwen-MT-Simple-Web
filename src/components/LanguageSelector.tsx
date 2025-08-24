import React, { Fragment } from 'react'
import { Listbox, Transition } from '@headlessui/react'
import { ChevronUpDownIcon, ArrowsRightLeftIcon, CheckIcon } from '@heroicons/react/24/outline'
import { LanguageSelectorProps, Language } from '../types'

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
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <Listbox value={value} onChange={onChange} disabled={disabled}>
        <div className="relative">
          <Listbox.Button className="relative w-full cursor-pointer rounded-lg bg-white py-3 pl-3 pr-10 text-left shadow-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors">
            <span className="flex items-center">
              {selectedLanguage ? (
                <>
                  <span className="block truncate font-medium text-gray-900">
                    {selectedLanguage.name}
                  </span>
                  <span className="ml-2 block truncate text-gray-500 text-sm">
                    {selectedLanguage.nativeName}
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
                className="h-5 w-5 text-gray-400"
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
            <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
              {options.map((language) => (
                <Listbox.Option
                  key={language.code}
                  className={({ active }) =>
                    `relative cursor-pointer select-none py-2 pl-10 pr-4 ${
                      active ? 'bg-primary-100 text-primary-900' : 'text-gray-900'
                    }`
                  }
                  value={language.code}
                >
                  {({ selected }) => (
                    <>
                      <div className="flex items-center">
                        <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                          {language.name}
                        </span>
                        <span className="ml-2 block truncate text-gray-500 text-sm">
                          {language.nativeName}
                        </span>
                      </div>
                      {selected ? (
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-primary-600">
                          <CheckIcon className="h-5 w-5" aria-hidden="true" />
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

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
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
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
      <h3 className="text-lg font-medium text-gray-900 mb-4">语言设置</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
        {/* Source Language */}
        <LanguageDropdown
          value={sourceLanguage}
          options={availableLanguages}
          onChange={onSourceLanguageChange}
          disabled={disabled}
          label="源语言"
          placeholder="选择源语言"
        />
        
        {/* Target Language */}
        <LanguageDropdown
          value={targetLanguage}
          options={targetLanguageOptions}
          onChange={onTargetLanguageChange}
          disabled={disabled}
          label="目标语言"
          placeholder="选择目标语言"
        />
      </div>
      
      {/* Swap Button */}
      <div className="mt-4 flex justify-center">
        <button
          onClick={handleSwap}
          disabled={disabled || sourceLanguage === 'auto'}
          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title={sourceLanguage === 'auto' ? '无法交换：源语言为自动检测' : '交换语言'}
        >
          <ArrowsRightLeftIcon className="w-4 h-4 mr-2" />
          交换语言
        </button>
      </div>
      
      {/* Language Pair Info */}
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-500">
          {availableLanguages.find(l => l.code === sourceLanguage)?.name || '未选择'} 
          {' → '} 
          {availableLanguages.find(l => l.code === targetLanguage)?.name || '未选择'}
        </p>
      </div>
    </div>
  )
}

export default LanguageSelector