import { MetadataRoute } from 'next'
import { host } from '@/config/config'
import { type Locale, i18nConfig, getPathname } from '@/i18n-config'
import { getDictionary, i18nNamespaces } from '@/i18n'
import type { About } from '@/types/locales/about'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const localizedPages = [
    '/',
    '/contact',
    '/pricing',
    '/about',
    '/legal',
    '/legal/privacy',
    '/legal/terms',
    '/legal/payments-refund',
  ]

  // 动态获取博客文章的 slugs
  let blogSlugs: string[] = []
  try {
    const i18n: About = await getDictionary<About>('en', i18nNamespaces.about)
    blogSlugs = i18n.blogPosts.map((post) => (post as any).id).filter(Boolean)
  } catch (error) {
    console.error('Failed to load blog posts for sitemap:', error)
    blogSlugs = [
      'disney-style-conversion-guide',
      'ai-disney-ai-guide',
      'disney-style-video-conversion-guide',
    ]
  }

  const generateLocalizedUrls = (path: string) =>
    i18nConfig.locales.map((locale) => {
      const normalizedPath = path === '/' ? '/' : path
      return {
        url: `${host}${getPathname(locale as Locale, normalizedPath)}`,
        priority: normalizedPath === '/' ? 1 : 0.8,
      }
    })

  const blogUrls = blogSlugs.flatMap((slug) =>
    i18nConfig.locales.map((locale) => ({
      url: `${host}${getPathname(locale as Locale, `/about/${slug}`)}`,
      priority: 0.6,
    })),
  )

  const sitemapEntries: MetadataRoute.Sitemap = [
    ...localizedPages.flatMap((page) => generateLocalizedUrls(page)),
    ...blogUrls,
  ]

  return sitemapEntries
}