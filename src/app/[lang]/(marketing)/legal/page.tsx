import Link from 'next/link'
import type { Metadata } from 'next'
import { type Locale, getPathname, generateAlternates } from '@/i18n-config'
import { host } from '@/config/config'

interface LegalPageProps {
  params: Promise<{ lang: Locale }>
}

export async function generateMetadata({ params }: LegalPageProps): Promise<Metadata> {
  const { lang } = await params
  const canonical = `${host}${getPathname(lang, '/legal')}`
  const alternates = generateAlternates(lang, '/legal')

  return {
    title: 'Legal Information | DisneyAi',
    description: 'Read our privacy policy, terms of service, and refund policy.',
    alternates: {
      canonical,
      languages: alternates,
    },
    openGraph: {
      type: 'website',
      url: canonical,
      title: 'Legal Information | DisneyAi',
      description: 'Privacy, terms of service, and refund policies for DisneyAi.',
      siteName: 'DisneyAi',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Legal Information | DisneyAi',
      description: 'Privacy, terms of service, and refund policies for DisneyAi.',
    },
  }
}

export default async function LegalIndex({ params }: LegalPageProps) {
  const { lang } = await params

  const entries = [
    {
      title: 'Privacy Policy',
      description: '了解我们如何收集、使用并保护您的数据。',
      href: '/legal/privacy',
    },
    {
      title: 'Terms of Service',
      description: '查看使用 DisneyAi 服务时需要遵守的条款与条件。',
      href: '/legal/terms',
    },
    {
      title: 'Payments & Refund',
      description: '熟悉订阅付费、退款与发票等相关政策。',
      href: '/legal/payments-refund',
    },
  ]

  return (
    <main className="bg-gray-50 dark:bg-gray-900 min-h-screen py-16">
      <div className="container mx-auto px-6 lg:px-8 max-w-5xl">
        <div className="text-center mb-12">
          <span className="text-sm uppercase tracking-widest text-disney-red font-semibold">Legal Center</span>
          <h1 className="text-[clamp(2rem,4vw,3rem)] font-bold mt-3 text-gray-900 dark:text-white">
            法务与合规
          </h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
            在这里查看 DisneyAi 的隐私政策、服务条款与退款政策，确保您在使用产品时始终获得透明、可靠的体验。
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {entries.map((entry) => (
            <div
              key={entry.href}
              className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm hover:shadow-lg transition-shadow"
            >
              <div className="p-6 flex flex-col h-full">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">{entry.title}</h2>
                <p className="text-gray-600 dark:text-gray-300 flex-1">{entry.description}</p>
                <Link
                  href={getPathname(lang, entry.href)}
                  className="mt-6 inline-flex items-center text-disney-red font-semibold"
                >
                  查看详情
                  <span className="ml-2">→</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}

