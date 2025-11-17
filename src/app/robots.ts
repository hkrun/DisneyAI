import { MetadataRoute } from 'next'
import { host } from '@/config/config'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/dashboard', '/test-qwen'],
      },
    ],
    sitemap: `${host}/sitemap.xml`,
  }
}