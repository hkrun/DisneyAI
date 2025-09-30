'use client'

import { useEffect, useState } from 'react'
import { type Locale } from '@/i18n-config'

export interface StyleI18nEntry {
  name: string
  description: string
}

export function useStyleTranslations(lang: Locale) {
  const [dict, setDict] = useState<Record<string, StyleI18nEntry> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        setError(null)
        const mod = await import(`@/locales/${lang}/styles.json`)
        setDict(mod.default as Record<string, StyleI18nEntry>)
      } catch (err) {
        console.error('Failed to load styles translations:', err)
        try {
          const fallback = await import('@/locales/en/styles.json')
          setDict(fallback.default as Record<string, StyleI18nEntry>)
        } catch (fallbackErr) {
          console.error('Failed to load fallback styles translations:', fallbackErr)
          setError('Failed to load styles translations')
        }
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [lang])

  return { dict, loading, error }
}
