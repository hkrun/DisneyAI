'use client'

import { useEffect, useState } from 'react'
import { ModalAd } from './modal-ad'
import { useAdTrigger } from '@/hooks/use-ad-trigger'
import { type Ad } from '@/types/locales/ad'

type AdTriggerProviderProps = {
  /** 语言 */
  lang: string
  /** 广告标题 */
  title?: string
  /** 广告描述 */
  description?: string
  /** 打开按钮链接（已废弃，保留用于兼容性） */
  openUrl?: string
}

/**
 * 广告触发提供者组件
 * - 跟踪页面上的可点击元素
 * - 管理广告显示逻辑
 */
export function AdTriggerProvider({
  lang,
  title = '',
  description = '',
  openUrl,
}: AdTriggerProviderProps) {
  const { shouldShowAd, recordClick, handleAdClosed } = useAdTrigger({
    initialClickCount: 2,
    clickCountRange: [6, 9],
    timeInterval: 2 * 60 * 1000, // 2分钟
    storageKey: 'modal-ad-trigger',
  })

  // 跟踪页面上的点击事件
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement

      // 排除广告弹窗和底部广告位的点击
      if (
        target.closest('[role="dialog"]') !== null ||
        target.closest('[role="banner"]') !== null ||
        target.closest('.fixed.bottom-0') !== null
      ) {
        return
      }

      // 检查是否是可点击的元素
      // 包括：链接、按钮、可点击的卡片等
      const isClickable =
        target.tagName === 'A' ||
        target.tagName === 'BUTTON' ||
        target.closest('a') !== null ||
        target.closest('button') !== null ||
        target.closest('[role="button"]') !== null ||
        target.closest('[onclick]') !== null ||
        target.closest('.cursor-pointer') !== null

      if (isClickable) {
        recordClick()
      }
    }

    // 添加全局点击监听（使用捕获阶段，确保能捕获所有点击）
    document.addEventListener('click', handleClick, true)

    return () => {
      document.removeEventListener('click', handleClick, true)
    }
  }, [recordClick])

  // 加载翻译
  const [translations, setTranslations] = useState<Ad | null>(null)

  useEffect(() => {
    const loadTranslations = async () => {
      try {
        const mod = await import(`@/locales/${lang}/ad.json`)
        const data = (mod?.default ?? mod) as Ad
        setTranslations(data)
      } catch (error) {
        console.error('Failed to load ad translations:', error)
        // 回退到英文
        try {
          const fallbackMod = await import('@/locales/en/ad.json')
          const fallback = (fallbackMod?.default ?? fallbackMod) as Ad
          setTranslations(fallback)
        } catch (fallbackError) {
          console.error('Failed to load fallback translations:', fallbackError)
          setTranslations({
            close: 'Close',
            open: 'Open',
            ad: 'Ad',
            openButtonBefore: 'Click image to ',
            openButtonHighlight: 'open',
            openButtonAfter: ' link',
          })
        }
      }
    }

    loadTranslations()
  }, [lang])

  const closeText = translations?.close || 'Close'
  const openText = translations?.open || 'Open'
  const adText = translations?.ad || 'Ad'
  const openButtonBefore = translations?.openButtonBefore ?? 'Click image to '
  const openButtonHighlight = translations?.openButtonHighlight ?? 'open'
  const openButtonAfter = translations?.openButtonAfter ?? ' link'

  return (
    <ModalAd
      isOpen={shouldShowAd}
      title={title}
      description={description}
      closeText={closeText}
      openText={openText}
      adText={adText}
      openButtonBefore={openButtonBefore}
      openButtonHighlight={openButtonHighlight}
      openButtonAfter={openButtonAfter}
      onClose={handleAdClosed}
    />
  )
}
