'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { type Locale } from "@/i18n-config"
import { Pricing } from "@/types/locales/pricing"
import { Auth } from '@/types/locales/auth'
import { UnifiedPricingCard } from './unified-pricing-card'
import { OneTimeCard } from './one-time-card'
import { BusinessCard } from './business-card'
import { FreeTrialCard } from './free-trial-card'
import { hasValidSubscription } from '@/actions/user-order'
// PricingSkeleton 已移除，这里使用内联占位以保持构建通过

interface PricingPageClientProps {
  lang: Locale
  i18nPricing: Pricing
  i18nAuth: Auth
}

export default function PricingPageClient({ lang, i18nPricing, i18nAuth }: PricingPageClientProps) {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly')
  const [hasSubscription, setHasSubscription] = useState<boolean>(false)
  const [isLoadingSubscriptionStatus, setIsLoadingSubscriptionStatus] = useState(true)
  const { data: session } = useSession()

  // 检查用户是否有订阅记录
  useEffect(() => {
    const checkSubscriptionStatus = async () => {
      if (session?.user?.id) {
        try {
          const subscriptionResult = await hasValidSubscription()
          setHasSubscription(subscriptionResult.hasValidSubscription)
        } catch (error) {
          console.error('检查订阅状态失败:', error)
          setHasSubscription(false)
        }
      } else {
        setHasSubscription(false)
      }
      setIsLoadingSubscriptionStatus(false)
    }

    checkSubscriptionStatus()
  }, [session?.user?.id])

  // 如果正在加载订阅状态，显示骨架屏
  if (isLoadingSubscriptionStatus) {
    return (
      <div className="bg-disney-light py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="animate-pulse rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 h-64" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-disney-light font-inter text-gray-900 dark:text-white overflow-x-hidden">
      <main className="py-12 bg-disney-light relative">
        <section id="pricing" className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-blue-600 dark:text-blue-400 font-semibold">{i18nPricing.billing.title}</span>
            <h2 className="text-[clamp(1.8rem,4vw,3rem)] font-bold mt-2 mb-6 text-gray-900 dark:text-white">
              {i18nPricing.hero.title}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              {i18nPricing.hero.description}
            </p>

            <div className="mt-8 inline-flex bg-white dark:bg-gray-800 p-1 rounded-full shadow-sm">
              <button
                onClick={() => setBillingPeriod('monthly')}
                className={`px-6 py-2 rounded-full font-medium transition-colors ${
                  billingPeriod === 'monthly'
                    ? 'bg-blue-600 dark:bg-blue-500 text-white'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {i18nPricing.billing.monthly}
              </button>
              <button
                onClick={() => setBillingPeriod('annual')}
                className={`px-6 py-2 rounded-full font-medium transition-colors ${
                  billingPeriod === 'annual'
                    ? 'bg-blue-600 dark:bg-blue-500 text-white'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {i18nPricing.billing.annual}
                <span className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-0.5 rounded ml-1">{i18nPricing.billing.save}</span>
              </button>
            </div>
          </div>

          {/* 价格卡片容器 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 xl:gap-8 max-w-screen-2xl mx-auto">
            {/* 根据订阅状态显示不同的卡片布局 */}
            {!hasSubscription ? (
              // 无订阅记录：显示免费试用 + 个人版 + 单次购买
              <>
                {/* 免费试用卡片 */}
                <FreeTrialCard
                  lang={lang}
                  i18nPricing={i18nPricing}
                  i18nAuth={i18nAuth}
                  billingPeriod={billingPeriod}
                />

                {/* 个人版订阅卡片 */}
                <UnifiedPricingCard
                  lang={lang}
                  i18nPricing={i18nPricing}
                  i18nAuth={i18nAuth}
                  billingPeriod={billingPeriod}
                />

                {/* 单次购买卡片 */}
                <OneTimeCard
                  lang={lang}
                  i18nPricing={i18nPricing}
                  i18nAuth={i18nAuth}
                  billingPeriod={billingPeriod}
                />
              </>
            ) : (
              // 有订阅记录：显示个人版 + 单次购买 + 商业版
              <>
                {/* 个人版订阅卡片 */}
                <UnifiedPricingCard
                  lang={lang}
                  i18nPricing={i18nPricing}
                  i18nAuth={i18nAuth}
                  billingPeriod={billingPeriod}
                />

                {/* 单次购买卡片 */}
                <OneTimeCard
                  lang={lang}
                  i18nPricing={i18nPricing}
                  i18nAuth={i18nAuth}
                  billingPeriod={billingPeriod}
                />

                {/* 商业版卡片 */}
                <BusinessCard
                  lang={lang}
                  i18nPricing={i18nPricing}
                  i18nAuth={i18nAuth}
                  billingPeriod={billingPeriod}
                />
              </>
            )}
          </div>




        </section>
      </main>
    </div>
  )
}
