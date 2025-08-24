import { useEffect } from 'react'
import { useTranslationStore } from '../stores/translationStore'

/**
 * 安全初始化Hook
 * 处理store初始化过程中可能出现的错误，确保应用正常启动
 */
export const useSafeInitialization = () => {
  const initializeAPI = useTranslationStore(state => state.initializeAPI)
  const setError = useTranslationStore(state => state.setError)

  useEffect(() => {
    let isMounted = true
    
    const safeInit = async () => {
      try {
        console.log('开始安全初始化...')
        
        // 清除之前可能的错误状态
        if (isMounted) {
          setError(null)
        }
        
        // 延迟初始化，给组件足够时间挂载
        await new Promise(resolve => setTimeout(resolve, 100))
        
        if (isMounted) {
          await initializeAPI()
          console.log('安全初始化完成')
        }
      } catch (error) {
        console.error('初始化过程中发生错误:', error)
        
        if (isMounted) {
          // 设置友好的错误信息
          setError('应用初始化时遇到问题，请检查网络连接后刷新页面')
        }
      }
    }
    
    // 异步执行初始化
    safeInit()
    
    // 清理函数
    return () => {
      isMounted = false
    }
  }, [initializeAPI, setError])
}

/**
 * 本地存储健康检查Hook
 * 检查并修复可能损坏的本地存储数据
 */
export const useStorageHealthCheck = () => {
  useEffect(() => {
    try {
      const storageKey = 'qwen-translation-storage'
      const storedData = localStorage.getItem(storageKey)
      
      if (storedData) {
        try {
          const parsed = JSON.parse(storedData)
          console.log('存储数据健康检查通过', {
            hasState: !!parsed.state,
            version: parsed.version,
            dataSize: storedData.length
          })
        } catch (parseError) {
          console.warn('本地存储数据损坏，正在清理...', parseError)
          localStorage.removeItem(storageKey)
          // 提示用户数据已重置
          setTimeout(() => {
            window.dispatchEvent(new CustomEvent('storage-reset', {
              detail: { reason: 'corrupted-data' }
            }))
          }, 1000)
        }
      }
    } catch (error) {
      console.error('存储健康检查失败:', error)
    }
  }, [])
}

/**
 * 组合Hook，同时进行安全初始化和存储健康检查
 */
export const useAppInitialization = () => {
  useStorageHealthCheck()
  useSafeInitialization()
}