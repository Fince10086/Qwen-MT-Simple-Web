/**
 * 无障碍公告功能
 * 为屏幕阅读器用户提供实时通知
 */

export type AnnouncementPriority = 'polite' | 'assertive'

/**
 * 向屏幕阅读器发送公告
 * @param message 要公告的消息
 * @param priority 优先级，'polite' 等待用户空闲时播报，'assertive' 立即播报
 * @param timeout 消息保留时间（毫秒），默认3000ms
 */
export function announceToScreenReader(
  message: string, 
  priority: AnnouncementPriority = 'polite',
  timeout: number = 3000
): void {
  // 查找现有的实时区域
  let liveRegion = document.getElementById('live-region')
  
  // 如果不存在，创建一个
  if (!liveRegion) {
    liveRegion = document.createElement('div')
    liveRegion.id = 'live-region'
    liveRegion.className = 'sr-live'
    liveRegion.setAttribute('aria-live', priority)
    liveRegion.setAttribute('aria-atomic', 'true')
    document.body.appendChild(liveRegion)
  } else {
    // 更新现有区域的优先级
    liveRegion.setAttribute('aria-live', priority)
  }
  
  // 设置消息
  liveRegion.textContent = message
  
  // 清理消息
  setTimeout(() => {
    if (liveRegion && liveRegion.textContent === message) {
      liveRegion.textContent = ''
    }
  }, timeout)
}

/**
 * 页面切换公告
 * @param pageName 页面名称
 */
export function announcePageChange(pageName: string): void {
  announceToScreenReader(`已切换到${pageName}`, 'polite')
}

/**
 * 操作成功公告
 * @param action 操作名称
 */
export function announceSuccess(action: string): void {
  announceToScreenReader(`${action}成功`, 'polite')
}

/**
 * 操作失败公告
 * @param action 操作名称
 * @param error 错误信息（可选）
 */
export function announceError(action: string, error?: string): void {
  const message = error ? `${action}失败：${error}` : `${action}失败`
  announceToScreenReader(message, 'assertive')
}

/**
 * 状态变化公告
 * @param status 状态描述
 */
export function announceStatusChange(status: string): void {
  announceToScreenReader(status, 'polite')
}

/**
 * 进度公告
 * @param current 当前进度
 * @param total 总数
 * @param unit 单位（可选）
 */
export function announceProgress(current: number, total: number, unit?: string): void {
  const unitText = unit ? unit : '项'
  const message = `进度：${current} / ${total} ${unitText}`
  announceToScreenReader(message, 'polite')
}

/**
 * 设置焦点并公告
 * @param elementId 要聚焦的元素ID
 * @param announcement 公告消息（可选）
 */
export function focusAndAnnounce(elementId: string, announcement?: string): void {
  const element = document.getElementById(elementId)
  if (element) {
    element.focus()
    if (announcement) {
      // 延迟公告，让焦点先设置
      setTimeout(() => {
        announceToScreenReader(announcement, 'polite')
      }, 100)
    }
  }
}

/**
 * 检查用户是否使用屏幕阅读器
 * 注意：这是一个启发式检测，不是100%准确
 */
export function isUsingScreenReader(): boolean {
  return (
    // 检查是否有 ARIA 相关的媒体查询
    window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
    // 检查是否存在常见的屏幕阅读器用户代理字符串
    /NVDA|JAWS|DRAGON|VoiceOver/i.test(navigator.userAgent) ||
    // 检查是否启用了高对比度模式
    window.matchMedia('(prefers-contrast: high)').matches
  )
}

/**
 * 为动态内容添加 ARIA 标签
 * @param element 目标元素
 * @param label 标签文本
 * @param live 实时更新类型
 */
export function addDynamicAriaLabel(
  element: HTMLElement, 
  label: string, 
  live: AnnouncementPriority = 'polite'
): void {
  element.setAttribute('aria-label', label)
  element.setAttribute('aria-live', live)
  element.setAttribute('aria-atomic', 'true')
}

/**
 * 创建无障碍的加载状态指示器
 * @param isLoading 是否正在加载
 * @param loadingText 加载文本
 * @param completedText 完成文本
 */
export function createLoadingIndicator(
  isLoading: boolean,
  loadingText: string = '正在加载',
  completedText: string = '加载完成'
): { 
  ariaLabel: string
  ariaLive: AnnouncementPriority
  ariaAtomic: boolean
} {
  return {
    ariaLabel: isLoading ? loadingText : completedText,
    ariaLive: 'polite',
    ariaAtomic: true
  }
}

/**
 * 清理所有实时区域
 */
export function clearLiveRegions(): void {
  const liveRegion = document.getElementById('live-region')
  if (liveRegion) {
    liveRegion.textContent = ''
  }
}