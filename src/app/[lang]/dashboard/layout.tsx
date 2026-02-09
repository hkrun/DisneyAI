import type React from "react"
import { NavbarSticky } from "@/components/dashboard/navbar-sticky"
import { type Locale } from "@/i18n-config";
import { getDictionary, i18nNamespaces } from '@/i18n'
import { Navbar } from "@/types/locales";

export const metadata = {
  robots: { index: false, follow: false },
}

export default async function Layout({
  children,
  params
}: Readonly<{
  children: React.ReactNode,
  params: Promise<{ lang: Locale }>
}>) {
  const { lang } = await params
  const i18nNavbar = await getDictionary<Navbar>("en", i18nNamespaces.navbar, "dashboard");
  return (
    <>
      {/* Navigation Bar */}
      <NavbarSticky lang={lang} navbarLocal={i18nNavbar}/>
      <div className="md:container">
      {children}
      </div>
    </>
  )
}

