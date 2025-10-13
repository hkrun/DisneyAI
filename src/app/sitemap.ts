import { MetadataRoute } from 'next'
import { host } from '@/config/config'
import { localizationsKV } from '@/i18n-config'
import { getDictionary, i18nNamespaces } from '@/i18n'
import type { About } from '@/types/locales/about'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const commonPages = [
        '/contact',
        '/pricing',
        '/about'
    ]

    const singleUrls = [
        '/legal/privacy',
        '/legal/terms',
        '/legal/payments-refund'
    ];

    // 动态获取博客文章的slugs
    let blogSlugs: string[] = [];
    try {
        // 从英文博客数据中获取所有文章的ID
        const i18n: About = await getDictionary<About>('en', i18nNamespaces.about);
        blogSlugs = i18n.blogPosts.map(post => (post as any).id).filter(Boolean);
    } catch (error) {
        console.error('Failed to load blog posts for sitemap:', error);
        // 如果加载失败，使用默认的文章列表
        blogSlugs = [
            'disney-style-conversion-guide',
            'ai-disney-ai-guide',
            'disney-style-video-conversion-guide'
        ];
    }

    const generateLocalizedUrls = (path: string) => {
        return Object.keys(localizationsKV).map((lang) => ({
            url: lang === 'en' 
                ? `${host}${path}` 
                : `${host}/${lang}${path}`,
            lastModified: new Date(),
            priority: path === '' ? 1.0 : (lang === 'en' ? 0.8 : 0.64),
        }))
    }

    const generateSingleUrl = (path: string) => ({
        url: `${host}${path}`,
        lastModified: new Date(),
        priority: 0.64,
    })

    // 生成博客文章的URL
    const generateBlogUrls = () => {
        // 生成所有语言的所有博客文章URL
        return blogSlugs.flatMap(slug => 
            Object.keys(localizationsKV).map(lang => ({
                url: lang === 'en' 
                    ? `${host}/about/${slug}` 
                    : `${host}/${lang}/about/${slug}`,
                lastModified: new Date(),
                priority: 0.6,
            }))
        );
    };

    const sitemapEntries: MetadataRoute.Sitemap = [
        ...generateLocalizedUrls(''),
        ...commonPages.flatMap(page => generateLocalizedUrls(`${page}`)),
        ...singleUrls.map(url => generateSingleUrl(url)),
        ...generateBlogUrls() // 添加博客文章URL
    ]

    return sitemapEntries
}