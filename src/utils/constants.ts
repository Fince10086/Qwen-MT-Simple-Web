import { Language, ModelInfo, QwenMTModel } from '../types'

// 支持的语言列表（基于Qwen-MT支持的92种语言）
export const SUPPORTED_LANGUAGES: Language[] = [
  { code: 'auto', name: '自动检测', nativeName: 'Auto Detect' },
  { code: 'zh', name: '中文', nativeName: '中文' },
  { code: 'en', name: '英语', nativeName: 'English' },
  { code: 'ja', name: '日语', nativeName: '日本語' },
  { code: 'ko', name: '韩语', nativeName: '한국어' },
  { code: 'fr', name: '法语', nativeName: 'Français' },
  { code: 'es', name: '西班牙语', nativeName: 'Español' },
  { code: 'de', name: '德语', nativeName: 'Deutsch' },
  { code: 'pt', name: '葡萄牙语', nativeName: 'Português' },
  { code: 'ru', name: '俄语', nativeName: 'Русский' },
  { code: 'it', name: '意大利语', nativeName: 'Italiano' },
  { code: 'nl', name: '荷兰语', nativeName: 'Nederlands' },
  { code: 'tr', name: '土耳其语', nativeName: 'Türkçe' },
  { code: 'hi', name: '印地语', nativeName: 'हिन्दी' },
  { code: 'ar', name: '阿拉伯语', nativeName: 'العربية' },
  { code: 'th', name: '泰语', nativeName: 'ไทย' },
  { code: 'vi', name: '越南语', nativeName: 'Tiếng Việt' },
  { code: 'id', name: '印尼语', nativeName: 'Bahasa Indonesia' },
  { code: 'ms', name: '马来语', nativeName: 'Bahasa Melayu' },
  { code: 'bn', name: '孟加拉语', nativeName: 'বাংলা' },
  { code: 'ur', name: '乌尔都语', nativeName: 'اردو' },
  { code: 'te', name: '泰卢固语', nativeName: 'తెలుగు' },
  { code: 'ta', name: '泰米尔语', nativeName: 'தமிழ்' },
  { code: 'mr', name: '马拉地语', nativeName: 'मराठी' },
  { code: 'gu', name: '古吉拉特语', nativeName: 'ગુજરાતી' },
  { code: 'kn', name: '卡纳达语', nativeName: 'ಕನ್ನಡ' },
  { code: 'ml', name: '马拉雅拉姆语', nativeName: 'മലയാളം' },
  { code: 'pa', name: '旁遮普语', nativeName: 'ਪੰਜਾਬੀ' },
  { code: 'or', name: '奥里亚语', nativeName: 'ଓଡ଼ିଆ' },
  { code: 'as', name: '阿萨姆语', nativeName: 'অসমীয়া' },
  { code: 'ne', name: '尼泊尔语', nativeName: 'नेपाली' },
  { code: 'si', name: '僧伽罗语', nativeName: 'සිංහල' },
  { code: 'my', name: '缅甸语', nativeName: 'မြန်မာ' },
  { code: 'km', name: '高棉语', nativeName: 'ខ្មែរ' },
  { code: 'lo', name: '老挝语', nativeName: 'ລາວ' },
  { code: 'ka', name: '格鲁吉亚语', nativeName: 'ქართული' },
  { code: 'am', name: '阿姆哈拉语', nativeName: 'አማርኛ' },
  { code: 'sw', name: '斯瓦希里语', nativeName: 'Kiswahili' },
  { code: 'zu', name: '祖鲁语', nativeName: 'isiZulu' },
  { code: 'af', name: '南非荷兰语', nativeName: 'Afrikaans' },
  { code: 'sq', name: '阿尔巴尼亚语', nativeName: 'Shqip' },
  { code: 'az', name: '阿塞拜疆语', nativeName: 'Azərbaycan' },
  { code: 'be', name: '白俄罗斯语', nativeName: 'Беларуская' },
  { code: 'bg', name: '保加利亚语', nativeName: 'Български' },
  { code: 'bs', name: '波斯尼亚语', nativeName: 'Bosanski' },
  { code: 'ca', name: '加泰罗尼亚语', nativeName: 'Català' },
  { code: 'hr', name: '克罗地亚语', nativeName: 'Hrvatski' },
  { code: 'cs', name: '捷克语', nativeName: 'Čeština' },
  { code: 'da', name: '丹麦语', nativeName: 'Dansk' },
  { code: 'et', name: '爱沙尼亚语', nativeName: 'Eesti' },
  { code: 'fi', name: '芬兰语', nativeName: 'Suomi' },
  { code: 'gl', name: '加利西亚语', nativeName: 'Galego' },
  { code: 'he', name: '希伯来语', nativeName: 'עברית' },
  { code: 'hu', name: '匈牙利语', nativeName: 'Magyar' },
  { code: 'is', name: '冰岛语', nativeName: 'Íslenska' },
  { code: 'ga', name: '爱尔兰语', nativeName: 'Gaeilge' },
  { code: 'lv', name: '拉脱维亚语', nativeName: 'Latviešu' },
  { code: 'lt', name: '立陶宛语', nativeName: 'Lietuvių' },
  { code: 'mk', name: '马其顿语', nativeName: 'Македонски' },
  { code: 'mt', name: '马耳他语', nativeName: 'Malti' },
  { code: 'no', name: '挪威语', nativeName: 'Norsk' },
  { code: 'fa', name: '波斯语', nativeName: 'فارسی' },
  { code: 'pl', name: '波兰语', nativeName: 'Polski' },
  { code: 'ro', name: '罗马尼亚语', nativeName: 'Română' },
  { code: 'sr', name: '塞尔维亚语', nativeName: 'Српски' },
  { code: 'sk', name: '斯洛伐克语', nativeName: 'Slovenčina' },
  { code: 'sl', name: '斯洛文尼亚语', nativeName: 'Slovenščina' },
  { code: 'sv', name: '瑞典语', nativeName: 'Svenska' },
  { code: 'uk', name: '乌克兰语', nativeName: 'Українська' },
  { code: 'cy', name: '威尔士语', nativeName: 'Cymraeg' },
  { code: 'yo', name: '约鲁巴语', nativeName: 'Yorùbá' },
]

// 支持的模型信息
export const AVAILABLE_MODELS: ModelInfo[] = [
  {
    id: 'qwen-mt-plus' as QwenMTModel,
    name: 'Qwen-MT Plus',
    description: '旗舰级翻译模型，提供高质量翻译结果',
    contextLength: 4096,
    maxInput: 2048,
    maxOutput: 2048,
    inputCostPer1k: 1.8,
    outputCostPer1k: 5.4,
    supportedLanguages: SUPPORTED_LANGUAGES.map(lang => lang.code)
  },
  {
    id: 'qwen-mt-turbo' as QwenMTModel,
    name: 'Qwen-MT Turbo',
    description: '快速翻译模型，低成本高速度',
    contextLength: 4096,
    maxInput: 2048,
    maxOutput: 2048,
    inputCostPer1k: 0.7,
    outputCostPer1k: 1.95,
    supportedLanguages: SUPPORTED_LANGUAGES.map(lang => lang.code)
  }
]

// API配置常量
export const API_CONFIG = {
  BEIJING_BASE_URL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
  SINGAPORE_BASE_URL: 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1',
  CHAT_COMPLETIONS_ENDPOINT: '/chat/completions'
}

// 错误信息映射
export const ERROR_MESSAGES = {
  NETWORK_ERROR: '网络连接错误，请检查网络连接',
  API_RATE_LIMIT: 'API 调用频率超限，请稍后再试',
  INVALID_API_KEY: 'API Key 无效，请检查配置',
  INVALID_REQUEST: '请求参数错误，请检查输入',
  MODEL_NOT_FOUND: '模型不存在，请选择正确的模型',
  CONTEXT_LENGTH_EXCEEDED: '输入文本过长，请缩短文本长度',
  SERVER_ERROR: '服务器错误，请稍后再试',
  UNSUPPORTED_LANGUAGE: '不支持的语言，请选择其他语言',
  TRANSLATION_FAILED: '翻译失败，请再试一次'
}

// 默认配置
export const DEFAULT_CONFIG = {
  SOURCE_LANGUAGE: 'auto',
  TARGET_LANGUAGE: 'zh',
  MODEL: 'qwen-mt-turbo' as QwenMTModel,
  API_REGION: 'beijing' as 'beijing' | 'singapore',
  MAX_TEXT_LENGTH: 2000,
  HISTORY_LIMIT: 100
}

// 默认启用的语言列表（中英日韩法西德俄意阿）
export const DEFAULT_ENABLED_LANGUAGES = [
  'auto', // 自动检测
  'zh',   // 中文
  'en',   // 英语
  'ja',   // 日语
  'ko',   // 韩语
  'fr',   // 法语
  'es',   // 西班牙语
  'de',   // 德语
  'ru',   // 俄语
  'it',   // 意大利语
  'ar'    // 阿拉伯语
]