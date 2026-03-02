'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams } from 'next/navigation'
import type { Ad } from '@/types/locales/ad'

// 直连广告触发规则常量与工具函数
const STORAGE_KEY = 'direct-link-ad-trigger'
const STORAGE_KEY_VISIBLE = 'direct-link-ad-trigger-visible'
const INITIAL_DELAY_MS = 3 * 1000 // 3 秒
const RE_SHOW_DELAY_MIN_MS = 15 * 1000 // 15 秒
const RE_SHOW_DELAY_MAX_MS = 45 * 1000 // 45 秒

function getHasShownFirst(): boolean {
  if (typeof window === 'undefined') return false
  try {
    return sessionStorage.getItem(STORAGE_KEY) === '1'
  } catch {
    return false
  }
}

function setHasShownFirst() {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem(STORAGE_KEY, '1')
  }
}

function getAdVisible(): boolean {
  if (typeof window === 'undefined') return false
  try {
    return sessionStorage.getItem(STORAGE_KEY_VISIBLE) === '1'
  } catch {
    return false
  }
}

function setAdVisible(visible: boolean) {
  if (typeof window !== 'undefined') {
    if (visible) {
      sessionStorage.setItem(STORAGE_KEY_VISIBLE, '1')
    } else {
      sessionStorage.removeItem(STORAGE_KEY_VISIBLE)
    }
  }
}

function randomDelay(): number {
  return (
    Math.floor(Math.random() * (RE_SHOW_DELAY_MAX_MS - RE_SHOW_DELAY_MIN_MS + 1)) +
    RE_SHOW_DELAY_MIN_MS
  )
}

type TopRightAdProps = {
  /** 组件唯一标识 */
  id: string
  /** 广告内容（后续可放入 iframe 或自定义内容） */
  children?: React.ReactNode
  /** 右上角通知角标数字（0 或不传则不显示） */
  badgeCount?: number
  /** 移动端是否显示（默认：true） */
  showOnMobile?: boolean
  /** 默认距离顶部的偏移（考虑导航栏高度，默认 4rem） */
  topOffset?: string
}

/**
 * 右上角悬浮广告位组件
 * - 固定在页面右上角，深灰圆角卡片样式
 * - 支持「隐藏」收起，切换页面或刷新后会重新显示
 * - 预留 children 插槽，后续可放入具体广告内容
 */
export function TopRightAd({
  id,
  children,
  badgeCount,
  showOnMobile = true,
  topOffset = '4rem',
}: TopRightAdProps) {
  const params = useParams() as { lang?: string }
  const lang = (params?.lang || 'zh') as string
  const [shouldShowAd, setShouldShowAd] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [hideLabel, setHideLabel] = useState('隐藏')
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // 加载多语言隐藏按钮文案
  useEffect(() => {
    let cancelled = false

    const loadTranslations = async () => {
      try {
        const mod = await import(`@/locales/${lang}/ad.json`)
        const data = (mod?.default ?? mod) as Ad
        if (!cancelled) {
          setHideLabel(data.hide || data.close || '隐藏')
        }
      } catch {
        if (!cancelled) {
          setHideLabel('隐藏')
        }
      }
    }

    loadTranslations()

    return () => {
      cancelled = true
    }
  }, [lang])

  // 根据规则调度广告显示时间：首次 3 秒后显示，之后 15–45 秒随机
  const scheduleShow = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }

    const delay = getHasShownFirst() ? randomDelay() : INITIAL_DELAY_MS

    timerRef.current = setTimeout(() => {
      timerRef.current = null
      if (!getHasShownFirst()) setHasShownFirst()
      setAdVisible(true)
      setShouldShowAd(true)
    }, delay)
  }, [])

  // 关闭广告后，按规则重新调度
  const handleHide = useCallback(() => {
    setAdVisible(false)
    setShouldShowAd(false)
    scheduleShow()
  }, [scheduleShow])

  // 挂载时：如果之前是可见状态，则直接显示；否则按规则计时
  useEffect(() => {
    if (getAdVisible()) {
      setShouldShowAd(true)
      return
    }

    scheduleShow()

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
    }
  }, [scheduleShow])

  // 控制淡入动画：提前挂载 iframe，但在 shouldShowAd 之前保持完全不可见且不可点击
  useEffect(() => {
    if (!shouldShowAd) {
      setIsVisible(false)
      return
    }

    if (typeof window === 'undefined') return
    const t = setTimeout(() => setIsVisible(true), 300)
    return () => clearTimeout(t)
  }, [shouldShowAd])

  return (
    <div
      className={`
        fixed z-[90]
        ${showOnMobile ? 'block' : 'hidden md:block'}
        transition-all duration-300 ease-out
        ${isVisible ? 'pointer-events-auto' : 'pointer-events-none'}
        ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}
      `}
      style={{ top: topOffset, right: '2rem' }}
      role="banner"
      aria-label="右上角广告位"
    >
      <div
        className="
          relative
          inline-block w-fit
          bg-black dark:bg-black
          rounded-xl
          shadow-[0_4px_20px_rgba(0,0,0,0.25)]
          overflow-visible
          border border-gray-600/50 dark:border-gray-600/30
        "
      >
        {/* 角标（可选） */}
        {badgeCount != null && badgeCount > 0 && (
          <span
            className="
              absolute -top-2 -right-2
              flex items-center justify-center
              min-w-[1.25rem] h-5 px-1
              bg-red-500 text-white text-xs font-bold rounded-full
              shadow-md
              z-10
            "
          >
            {badgeCount > 99 ? '99+' : badgeCount}
          </span>
        )}

        {/* 广告内容区域 - 尺寸随内部元素自适应，四周留一点内边距与广告隔开 */}
        <div className="flex flex-col p-1">
          {children}
        </div>

        {/* 悬浮隐藏按钮，覆盖在广告右下角 */}
        <button
          type="button"
          onClick={handleHide}
          className="
            absolute bottom-1 right-1
            px-2 py-0.5
            rounded
            bg-black/60 hover:bg-black/80
            text-xs text-gray-100
            transition-colors
          "
          aria-label={hideLabel}
        >
          {hideLabel}
        </button>
      </div>
    </div>
  )
}
