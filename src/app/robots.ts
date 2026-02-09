import { MetadataRoute } from 'next'
import { host } from '@/config/config'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // 仅屏蔽接口、后台、测试页，保留所有语言首页及营销页可被索引
        disallow: ['/api/', '/dashboard', '/test-qwen'],
      },
    ],
    sitemap: `${host}/sitemap.xml`,
  }
}