import type React from "react"
import { NavbarSticky } from "@/components/navbar-sticky"
import { FooterSocial } from "@/components/footer-social"
import { BottomFixedAd } from "@/components/ads/bottom-fixed-ad"
import { AdTriggerProvider } from "@/components/ads/ad-trigger-provider"
import { i18nConfig, type Locale } from "@/i18n-config";
import { getDictionary, i18nNamespaces } from '@/i18n'
import { Navbar, Footer, Billing, Auth } from "@/types/locales";
import { TransformHistoryLocal } from "@/types/locales/transform-history";

import { setCurrentLanguage } from '@/actions/constants'

export async function generateStaticParams() {
  return i18nConfig.locales.map((locale) => ({ lang: locale }));
}

export async function generateMetadata({ params }: { params: { lang: Locale } }) {
  return {
    robots: { index: true, follow: true },
    other: { "shortcut icon": "favicon.ico" }
  }
}

export default async function Layout({
  children,
  params
}: Readonly<{
  children: React.ReactNode,
  params: Promise<{ lang: Locale }>
}>) {
  const { lang } = await params
  
  setCurrentLanguage(lang)
  
  const i18nNavbar = await getDictionary<Navbar>(lang, i18nNamespaces.navbar);
  const i18nFooter = await getDictionary<Footer>(lang, i18nNamespaces.footer);
  const i18nBilling = await getDictionary<Billing>(lang, i18nNamespaces.billing);
  const i18nAuth = await getDictionary<Auth>(lang, i18nNamespaces.auth);
  const i18nHistory = await getDictionary<TransformHistoryLocal>(lang, 'transform-history');

  return (
    <>
      {/* Navigation Bar */}
      <NavbarSticky
        lang={lang}
        navbarLocal={i18nNavbar}
        subscriptionLocal={i18nBilling.subscription}
        toastLocal={i18nBilling.toast}
        historyLocal={i18nHistory}
        i18n={{ auth: i18nAuth }}
      />
      <div className="pb-[33vh] md:pb-[120px]">
        {children}
      </div>
      {/* Footer */}
      <FooterSocial i18n={i18nFooter} lang={lang} />
      {/* 底部固定广告 */}
      <BottomFixedAd
        id="bottom-fixed-ad-main"
        label="广告"
        showOnMobile={true}
      >
        <div
          className="w-full md:w-auto h-full flex items-center justify-center min-h-[250px] md:min-h-[90px] pt-4 md:pt-0"
          style={{ minWidth: '300px', maxWidth: '728px' }}
        >
          <iframe
            id="95b49ef8524fe084d660d25ea47e802a"
            className="border-0 block md:hidden"
            sandbox="allow-scripts allow-same-origin"
            referrerPolicy="no-referrer"
            style={{ width: '300px', height: '250px' }}
            srcDoc={`
              <!DOCTYPE html>
              <html>
                <head>
                  <meta charset="utf-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1">
                  <style>
                    body { margin: 0; padding: 0; overflow: hidden; }
                  </style>
                </head>
                <body>
                 <script>
  atOptions = {
    'key' : 'c934864e48cfd6133fda14666a004518',
    'format' : 'iframe',
    'height' : 250,
    'width' : 300,
    'params' : {}
  };
</script>
<script src="https://controlslaverystuffing.com/c934864e48cfd6133fda14666a004518/invoke.js"></script>
                </body>
              </html>
            `}
            title="移动广告"
            scrolling="no"
          />
          <iframe
            id="214deec7c06803a52f9407ff22418767"
            className="border-0 hidden md:block"
            sandbox="allow-scripts allow-same-origin"
            referrerPolicy="no-referrer"
            style={{ width: '728px', height: '90px' }}
            srcDoc={`
              <!DOCTYPE html>
              <html>
                <head>
                  <meta charset="utf-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1">
                  <style>
                    body { margin: 0; padding: 0; overflow: hidden; }
                  </style>
                </head>
                <body>
                 <script>
  atOptions = {
    'key' : '742e868bcc97a1c6c20966ae4a67556e',
    'format' : 'iframe',
    'height' : 90,
    'width' : 728,
    'params' : {}
  };
</script>
<script src="https://controlslaverystuffing.com/742e868bcc97a1c6c20966ae4a67556e/invoke.js"></script>
                </body>
              </html>
            `}
            title="桌面广告"
            scrolling="no"
          />
        </div>
      </BottomFixedAd>
      {/* 广告弹窗触发提供者 */}
      <AdTriggerProvider
        lang={lang}
        title="Strategy Hub for Better Wins"
        description="From Backtest to Live Deployment — All in One Place"
      />
    </>
  )
}

