'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { ChevronUp, ChevronDown } from 'lucide-react'

type BottomFixedAdProps = {
  /** 组件唯一标识（可用于区分不同广告位） */
  id: string
  /** 左上角的小标题，例如：广告 / 推广 / Sponsored */
  label?: string
  /** 广告内容 */
  children: React.ReactNode
  /** 自定义样式类名 */
  className?: string
  /** 背景色（默认：白色） */
  backgroundColor?: string
  /** 展开时的高度（默认：120px） */
  expandedHeight?: string
  /** 收起时的高度（默认：50px） */
  collapsedHeight?: string
  /** 在移动端是否显示（默认：true） */
  showOnMobile?: boolean
  /** 默认是否展开（默认：true） */
  defaultExpanded?: boolean
}

/**
 * 底部悬浮广告位组件
 * - 固定在页面底部
 * - 支持展开/收起功能
 * - 不使用 localStorage，每次路由变化时都会根据 defaultExpanded 重置展开状态
 * - 响应式设计，可在移动端隐藏
 * - 可自定义样式和内容
 */
export function BottomFixedAd({
  id,
  label = '广告',
  children,
  className = '',
  backgroundColor = 'bg-white dark:bg-gray-800',
  expandedHeight = 'h-[120px]',
  collapsedHeight = 'h-[50px]',
  showOnMobile = true,
  defaultExpanded = true,
}: BottomFixedAdProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)
  const pathname = usePathname()

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setTimeout(() => setIsVisible(true), 100)
    }
  }, [])

  useEffect(() => {
    setIsExpanded(defaultExpanded)
  }, [pathname, defaultExpanded])

  const handleToggle = () => {
    setIsExpanded(!isExpanded)
  }

  const mobileHeight = isExpanded ? 'h-1/5' : 'h-0'
  const desktopExpandedHeight = expandedHeight.replace('h-', 'md:h-')
  const desktopHeight = isExpanded ? desktopExpandedHeight : 'md:h-0'

  return (
    <div
      className={`
        fixed bottom-0 z-[99]
        ${showOnMobile ? 'block' : 'hidden md:block'}
        ${className}
        w-full
        md:w-auto md:left-1/2 md:-translate-x-1/2
      `}
    >
      <button
        type="button"
        onClick={handleToggle}
        className={`
          absolute bottom-full left-1/2 -translate-x-1/2 mb-[-1px]
          inline-flex items-center justify-center
          w-[60px] h-6 rounded-t-md
          ${backgroundColor}
          border-x border-t border-gray-200 dark:border-gray-700
          text-gray-600 dark:text-gray-300
          hover:opacity-90
          shadow-sm
          transition-all duration-200
          outline-none
          z-[100]
          ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-full'}
        `}
        aria-label={isExpanded ? '收起广告' : '展开广告'}
        title={isExpanded ? '收起广告' : '展开广告'}
      >
        {isExpanded ? (
          <ChevronDown className="w-3.5 h-3.5" />
        ) : (
          <ChevronUp className="w-3.5 h-3.5" />
        )}
      </button>
      <div
        className={`
          ${backgroundColor}
          shadow-[0_-4px_12px_-4px_rgba(0,0,0,0.5),0_4px_8px_-3px_rgba(0,0,0,0.3)]
          transition-all duration-300 ease-in-out
          ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-full'}
          rounded-t-lg
          overflow-hidden
          w-full
          ${mobileHeight}
          min-w-[300px] md:min-w-[728px]
          md:w-auto md:overflow-visible
          ${desktopHeight}
        `}
        role="banner"
        aria-label="底部广告位"
      >
        <div className="h-full flex flex-col relative">
          <div
            className={`
              flex-1 flex items-center justify-center
              transition-all duration-300
              w-full
              md:overflow-visible
              ${isExpanded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'}
            `}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
