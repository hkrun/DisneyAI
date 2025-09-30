'use client'

import { useState, useEffect } from 'react'
import { type Locale } from '@/i18n-config'
import { type Home } from '@/types/locales/home'

export function useHomeTranslation(lang: Locale) {
  const [translations, setTranslations] = useState<Home | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadTranslations = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // 动态导入翻译文件
        const translationModule = await import(`@/locales/${lang}/home.json`)
        setTranslations(translationModule.default)
      } catch (err) {
        console.error('Failed to load home translations:', err)
        setError('Failed to load translations')
        // 回退到默认语言
        if (lang !== 'en') {
          try {
            const fallbackModule = await import('@/locales/en/home.json')
            setTranslations(fallbackModule.default)
          } catch (fallbackErr) {
            console.error('Failed to load fallback translations:', fallbackErr)
            setError('Failed to load fallback translations')
          }
        }
      } finally {
        setLoading(false)
      }
    }

    loadTranslations()
  }, [lang])

  return { translations, loading, error }
}
