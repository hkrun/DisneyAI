import { host } from '@/config/config'

export const languages: Record<string, string> = {
  en: "English",
  es: "Español",
  zh: "中文",
  de: "Deutsch",
  fr: "Français",
  ja: "日本語",
  ko: "한국어",
};

export const i18nConfig = {
  defaultLocale: "en",
  locales: Object.keys(languages),
  localeDetector: false,
  prefixDefault : true
} as const;

export type Locale = (typeof i18nConfig)["locales"][number];

export const localizationsKV: Record<string, string> = {
  en: 'en-US',
  zh: 'zh-CN',
  fr: 'fr-FR',
  de: 'de-DE',
  es: 'es-ES',
  ja: 'ja-JP',
  ko: 'ko-KR'
}

const normalizePath = (pathname: string) => {
  if (!pathname || pathname === '/') {
    return '/'
  }
  return pathname.startsWith('/') ? pathname : `/${pathname}`
}

export function getPathname(lang: Locale, pathname: string) {
  const normalized = normalizePath(pathname)
  const shouldPrefix = lang !== i18nConfig.defaultLocale || i18nConfig.prefixDefault

  if (!shouldPrefix) {
    return normalized
  }

  if (normalized === '/') {
    return `/${lang}`
  }

  return `/${lang}${normalized}`
}

export function generateAlternates(lang: Locale, path: string) {
  const mapped = i18nConfig.locales.reduce((acc, locale) => {
    const localeKey = localizationsKV[locale]
    acc[localeKey] = `${host}${getPathname(locale as Locale, path)}`
    return acc
  }, {} as { [key: string]: string })

  mapped['x-default'] = mapped[localizationsKV[i18nConfig.defaultLocale]]
  
  return mapped
}