import { MetadataRoute } from 'next'
import { host } from '@/config/config'
import { type Locale, i18nConfig, getPathname } from '@/i18n-config'
import { getDictionary, i18nNamespaces } from '@/i18n'
import type { About } from '@/types/locales/about'
import { generateBlogPosts } from '@/data/blog-posts'

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

  // 与 about/[slug] 的 generateStaticParams 使用同一数据源，避免 sitemap 与实际页面不一致导致 404
  let blogSlugs: string[] = []
  try {
    const i18n: About = await getDictionary<About>('en', i18nNamespaces.about)
    const blogPosts = generateBlogPosts(i18n)
    blogSlugs = Object.keys(blogPosts)
  } catch (error) {
    console.error('Failed to load blog posts for sitemap:', error)
    blogSlugs = [
      'disney-style-conversion-guide',
      'ai-disney-ai-guide',
      'disney-style-video-conversion-guide',
    ]
  }

  const generateLocalizedUrls = (path: string): MetadataRoute.Sitemap =>
    i18nConfig.locales.map((locale) => {
      const normalizedPath = path === '/' ? '/' : path
      const changeFrequency: MetadataRoute.Sitemap[0]['changeFrequency'] =
        normalizedPath === '/' ? 'daily' : 'weekly'
      return {
        url: `${host}${getPathname(locale as Locale, normalizedPath)}`,
        lastModified: new Date(),
        changeFrequency,
        priority: normalizedPath === '/' ? 1 : 0.8,
      }
    })

  const blogUrls: MetadataRoute.Sitemap = blogSlugs.flatMap((slug) =>
    i18nConfig.locales.map((locale) => ({
      url: `${host}${getPathname(locale as Locale, `/about/${slug}`)}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
  )

  const sitemapEntries: MetadataRoute.Sitemap = [
    ...localizedPages.flatMap((page) => generateLocalizedUrls(page)),
    ...blogUrls,
  ]

  return sitemapEntries
}