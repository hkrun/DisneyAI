import type React from "react"
import { type Locale } from "@/i18n-config"
import { getDictionary, i18nNamespaces } from "@/i18n"
import { Navbar } from "@/types/locales"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"

export const metadata = {
  robots: { index: false, follow: false },
}

export default async function Layout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode
  params: Promise<{ lang: Locale }>
}>) {
  const { lang } = await params
  const i18nNavbar = await getDictionary<Navbar>("en", i18nNamespaces.navbar, "dashboard")

  return (
    <DashboardShell lang={lang} navbarLocal={i18nNavbar}>
      {children}
    </DashboardShell>
  )
}

