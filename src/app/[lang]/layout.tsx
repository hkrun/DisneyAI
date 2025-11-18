import type React from "react"
import '@/styles/globals.css'
import { ThemeProvider } from "@/components/theme-provider"
import { type Locale } from "@/i18n-config";
import { Geist } from 'next/font/google'
import { Toaster } from "@/components/ui/toaster"
import type { Metadata } from "next"
import { GoogleAnalytics } from '@next/third-parties/google'
import { NextAuthProvider } from "@/components/auth/next-auth-provider";

export const metadata: Metadata = {
  title: "Disney Ai - 迪士尼魔法转换平台",
  description:
    "专业的迪士尼魔法转换服务平台，提供高质量的迪士尼魔法转换技术，支持多种视频格式，让您轻松实现视频中的迪士尼魔法转换效果。",
  icons: {
    icon: [
      {
        url: '/favicon.svg',
        type: 'image/svg+xml',
      },
      {
        url: '/favicon.svg',
        type: 'image/svg+xml',
      }
    ],
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
}

const geist = Geist({
  subsets: ['latin'],
})

export default async function RootLayout({
  children,
  params
}: Readonly<{
  children: React.ReactNode,
  params: Promise<{ lang: Locale }>
}>) {
  const { lang } = await params

  return (
    <html lang={lang} className={geist.className} suppressHydrationWarning>
      <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css" />
        
        {/* PWA Manifest */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#DC2626" />
        
        {/* Apple iOS 支持 */}
        <link rel="apple-touch-icon" href="/favicon.svg" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content="DisneyAi" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        
        {/* Service Worker 注册 */}
        <script dangerouslySetInnerHTML={{
          __html: `
          if ('serviceWorker' in navigator) {
            window.addEventListener('load', function() {
              navigator.serviceWorker.register('/sw.js').then(function(reg) {
                console.log('Service Worker 注册成功:', reg);
              }).catch(function(err) {
                console.log('Service Worker 注册失败:', err);
              });
            });
          }
          `
        }} />
      </head>
      <body>
        <NextAuthProvider>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <Toaster />
            {children}
        </ThemeProvider>
        </NextAuthProvider>
        <GoogleAnalytics gaId="G-4WQMFTCY1Q" />
      </body>
    </html>
  )
}

