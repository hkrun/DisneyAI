'use client'

import { useState, useEffect } from 'react'
import { PaymentButton } from './button'
import { Pricing } from "@/types/locales/pricing"
import { Auth } from '@/types/locales/auth'
import { type Locale } from "@/i18n-config"
import { hasUsedFreeTrial } from '@/actions/user-order'

interface FreeTrialCardProps {
  lang: Locale
  i18nPricing: Pricing
  i18nAuth: Auth
  billingPeriod: 'monthly' | 'annual'
}

export function FreeTrialCard({ lang, i18nPricing, i18nAuth, billingPeriod }: FreeTrialCardProps) {
  const freeTrialPlan = (i18nPricing as any).freeTrial
  const [hasUsedTrial, setHasUsedTrial] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // 检查用户是否已经使用过免费试用
  useEffect(() => {
    async function checkTrialStatus() {
      try {
        const hasUsed = await hasUsedFreeTrial()
        setHasUsedTrial(hasUsed)
      } catch (error) {
        console.error('Error checking trial status:', error)
      } finally {
        setIsLoading(false)
      }
    }
    checkTrialStatus()
  }, [])

  return (
    <div className="w-full">
      {/* 免费试用价格卡片 */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg border border-gray-200 dark:border-gray-700 relative h-full min-h-[500px] flex flex-col">
        

        {/* 标题和价格信息 */}
        <div className="p-6 border-b dark:border-gray-700">
          <h3 className="text-xl font-bold mb-1 text-gray-900 dark:text-white">{freeTrialPlan.title}</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-3 text-sm">{freeTrialPlan.description}</p>
          <div className="flex items-end mb-1">
            <span className="text-3xl font-bold text-green-600 dark:text-green-400">{freeTrialPlan.price.amount}</span>
            <span className="text-gray-500 dark:text-gray-400 ml-1 text-sm">{freeTrialPlan.price.period}</span>
          </div>
          <p className="text-xs text-green-600 dark:text-green-400">{freeTrialPlan.trial}</p>
        </div>

        {/* 版本选择器 */}
        <div className="p-4 border-b dark:border-gray-700">
          <div className="space-y-1.5">
            <div className="p-2.5 rounded-lg border border-white dark:border-gray-800 bg-white dark:bg-gray-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white text-sm">{freeTrialPlan.placeholderFeatures.templateUsage}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{freeTrialPlan.placeholderDescriptions.templateUsage}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-base font-bold text-gray-900 dark:text-white opacity-0">免费</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 opacity-0">3天</div>
                </div>
              </div>
            </div>
            <div className="p-2.5 rounded-lg border border-white dark:border-gray-800 bg-white dark:bg-gray-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white text-sm">{freeTrialPlan.placeholderFeatures.customDisneyAi}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{freeTrialPlan.placeholderDescriptions.customDisneyAi}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-base font-bold text-gray-900 dark:text-white opacity-0">免费</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 opacity-0">3天</div>
                </div>
              </div>
            </div>
            <div className="p-2.5 rounded-lg border border-white dark:border-gray-800 bg-white dark:bg-gray-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white text-sm">{freeTrialPlan.placeholderFeatures.historyView}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{freeTrialPlan.placeholderDescriptions.historyView}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-base font-bold text-gray-900 dark:text-white opacity-0">免费</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 opacity-0">3天</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 支付按钮 */}
        <div className="p-4 border-t dark:border-gray-700">
          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500"></div>
              <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">{freeTrialPlan.statusTexts.checkingTrial}</span>
            </div>
          ) : hasUsedTrial ? (
            <button
              disabled
              className="w-full py-4 px-6 bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 rounded-xl cursor-not-allowed font-semibold"
            >
              {freeTrialPlan.statusTexts.trialUsed}
            </button>
          ) : (
            <PaymentButton
              lang={lang}
              mode={freeTrialPlan.mode}
              currency={freeTrialPlan.currency}
              btnlabel={freeTrialPlan.cta}
              paymentTips={i18nPricing.paymentTips}
              product={freeTrialPlan.product}
              authErrorTitle={(i18nPricing as any).auth?.loginRequired?.title}
              authErrorDesc={(i18nPricing as any).auth?.loginRequired?.description}
              authTexts={{auth: i18nAuth}}
              paymentTexts={(i18nPricing as any).payment}
              i18nPricing={i18nPricing}
              isPopular={true}
              planType="freeTrial"
            />
          )}
        </div>

        {/* 功能列表 */}
        <div className="p-4 flex-1">
          <ul className="space-y-1.5">
            {freeTrialPlan.features.map((feature: string, index: number) => (
              <li key={index} className="flex items-start text-sm">
                <i className="fa fa-check text-green-500 dark:text-green-400 mt-0.5 mr-2 text-xs"></i>
                <span className="text-gray-900 dark:text-white">{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
