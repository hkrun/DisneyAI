"use client"

import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, ChevronRight } from "lucide-react"
import { type Locale } from "@/i18n-config"
import type { Navbar } from "@/types/locales/navbar"
import { DashboardSidebarLayout } from "./dashboard-sidebar"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { ThemeToggle } from "@/components/theme-toggle"
import { AuthButton } from "@/components/dashboard/auth/auth-button"

export interface DashboardShellProps {
  lang: Locale
  navbarLocal: Navbar
  children: React.ReactNode
}

export function DashboardShell({ lang, navbarLocal, children }: DashboardShellProps) {
  const pathname = usePathname()

  const breadcrumbCurrent =
    navbarLocal.navigation
      .flatMap((item) => [item, ...(item.children ?? [])])
      .find((item) => {
        const base = item.href.replace(/\/+$/, "") || "/"
        const segments = pathname.split("/")
        const withoutLang = segments.length > 2 ? "/" + segments.slice(2).join("/") : "/"
        const normalized = withoutLang.replace(/\/+$/, "") || "/"
        return normalized === base
      })?.label ?? "Dashboard"

  return (
    <DashboardSidebarLayout lang={lang} navbarLocal={navbarLocal}>
      <div className="flex min-h-svh flex-col">
        <header className="flex h-16 items-center border-b bg-background/80 px-4 md:px-6 backdrop-blur">
          <div className="flex flex-1 items-center gap-2">
            <div className="md:hidden">
              <SidebarTrigger />
            </div>
            <nav className="flex items-center gap-1 text-sm text-muted-foreground">
              <Link href="/" className="flex items-center gap-1 hover:text-foreground">
                <Home className="h-4 w-4" />
                <span>Home</span>
              </Link>
              <ChevronRight className="h-4 w-4" />
              <span className="font-medium text-foreground">{breadcrumbCurrent}</span>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden md:flex">
              <ThemeToggle label={navbarLocal.themeToggle.label} />
            </div>
            <AuthButton
              lang={lang}
              userButton={navbarLocal.userButton}
              loginLabel={navbarLocal.actions.signIn}
            />
          </div>
        </header>
        <main className="flex-1 px-4 py-4 md:px-6 md:py-6">
          <div className="mx-auto max-w-6xl">
            {children}
          </div>
        </main>
      </div>
    </DashboardSidebarLayout>
  )
}

