'use client'

import { useState, useEffect } from 'react'
import { type Locale } from '@/i18n-config'
import { type ConverterPanelLocal } from '@/types/locales/converter-panel'

export function useConverterPanelTranslation(lang: Locale) {
  const [translations, setTranslations] = useState<ConverterPanelLocal | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadTranslations = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // 动态导入翻译文件
        const translationModule = await import(`@/locales/${lang}/converter-panel.json`)
        setTranslations(translationModule.default)
      } catch (err) {
        console.error('Failed to load converter panel translations:', err)
        setError('Failed to load translations')
        // 回退到默认语言
        if (lang !== 'en') {
          try {
            const fallbackModule = await import('@/locales/en/converter-panel.json')
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
