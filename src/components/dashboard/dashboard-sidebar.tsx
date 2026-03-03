"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutGrid,
  ShoppingBag,
  Activity,
  MessageCircle,
  Share2,
} from "lucide-react"
import { type Locale, getPathname } from "@/i18n-config"
import type { Navigation, Navbar } from "@/types/locales/navbar"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"

export interface DashboardSidebarLayoutProps {
  lang: Locale
  navbarLocal: Navbar
  children: React.ReactNode
}

function getIconForHref(href: string) {
  if (href.startsWith("/dashboard/orders")) return ShoppingBag
  if (href.startsWith("/dashboard/logs")) return Activity
  if (href.startsWith("/dashboard/messages")) return MessageCircle
  if (href.startsWith("/dashboard/promotion")) return Share2
  return LayoutGrid
}

function normalizePath(pathname: string, lang: Locale): string {
  if (!pathname) return "/"
  const segments = pathname.split("/")
  const first = segments[1]
  if (first === lang) {
    const withoutLang = "/" + segments.slice(2).join("/")
    const trimmed = withoutLang.replace(/\/+$/, "")
    return trimmed || "/"
  }
  const trimmed = pathname.replace(/\/+$/, "")
  return trimmed || "/"
}

function isActiveHref(currentPath: string, href: string): boolean {
  const base = href.replace(/\/+$/, "") || "/"
  return currentPath === base
}

export function DashboardSidebarLayout({
  lang,
  navbarLocal,
  children,
}: DashboardSidebarLayoutProps) {
  const pathname = usePathname()
  const currentPath = normalizePath(pathname, lang)

  const renderNavItem = (item: Navigation) => {
    const Icon = getIconForHref(item.href)
    const hasChildren = Array.isArray(item.children) && item.children.length > 0

    if (!hasChildren) {
      const active = isActiveHref(currentPath, item.href)
      return (
        <SidebarMenuItem key={item.href}>
          <Link href={getPathname(lang, item.href)} scroll={false}>
            <SidebarMenuButton
              isActive={active}
              className={active ? "bg-primary text-primary-foreground" : ""}
            >
              <Icon className="shrink-0" />
              <span>{item.label}</span>
            </SidebarMenuButton>
          </Link>
        </SidebarMenuItem>
      )
    }

    const childActive = item.children!.some((c) => isActiveHref(currentPath, c.href))
    const ParentIcon = Icon

    return (
      <SidebarMenuItem key={item.href}>
        <Link href={getPathname(lang, item.href)} scroll={false}>
          <SidebarMenuButton
            isActive={false}
            className={cn(
              childActive && "bg-primary/10 text-primary data-[active=false]:bg-primary/10"
            )}
          >
            <ParentIcon className="shrink-0" />
            <span>{item.label}</span>
          </SidebarMenuButton>
        </Link>
        <SidebarMenuSub>
          {item.children!.map((child) => {
            const active = isActiveHref(currentPath, child.href)
            return (
              <SidebarMenuSubItem key={child.href}>
                <SidebarMenuSubButton
                  asChild
                  isActive={active}
                  size="sm"
                  className={active ? "bg-primary text-primary-foreground" : ""}
                >
                  <Link href={getPathname(lang, child.href)} scroll={false}>
                    <span>{child.label}</span>
                  </Link>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            )
          })}
        </SidebarMenuSub>
      </SidebarMenuItem>
    )
  }

  return (
    <SidebarProvider>
      <Sidebar collapsible="offcanvas" variant="sidebar">
        <SidebarHeader>
          <Link
            href={getPathname(lang, "/dashboard")}
            scroll={false}
            className="flex items-center gap-2 rounded-md px-2 py-2 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white">
              <LayoutGrid className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold leading-tight">
                {navbarLocal.logo}
              </span>
              <span className="text-xs text-sidebar-foreground/60">
                Admin Dashboard
              </span>
            </div>
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {navbarLocal.navigation.map(renderNavItem)}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter />
      </Sidebar>
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  )
}

