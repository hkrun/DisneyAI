"use client"

import { usePathname } from 'next/navigation'
import { Languages } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { i18nConfig, type Locale, languages, getPathname } from "@/i18n-config";
import Link from 'next/link'

interface MobileLanguageToggleProps {
  lang: Locale;
  label: string;
}

export function MobileLanguageToggle({ lang, label }: MobileLanguageToggleProps) {

  const pathname = usePathname()

  const redirectedPathName = (locale: Locale) => {
    if (!pathname) return "/";
    const pathSegments = pathname.split("/").filter(Boolean);
    if (pathname === "/") {
      return locale === i18nConfig.defaultLocale ? "/" : `/${locale}`;
    }
    if (pathSegments.length === 1 && i18nConfig.locales.includes(pathSegments[0])) {
      return locale === i18nConfig.defaultLocale ? "/" : `/${locale}`;
    }
    const firstSegmentIsLocale = i18nConfig.locales.includes(pathSegments[0]);
    if (locale === i18nConfig.defaultLocale) {
      return firstSegmentIsLocale ? `/${pathSegments.slice(1).join('/')}` : pathname;
    } else {
      return firstSegmentIsLocale
        ? `/${locale}${pathname.substring(pathname.indexOf("/", 1))}`
        : `/${locale}${pathname}`;
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 md:hidden">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="default" 
            size="icon"
            className="w-10 h-10 rounded-full bg-gray-900 hover:bg-gray-800 text-white shadow-lg border-0"
          >
            <Languages className="h-4 w-4" />
            <span className="sr-only">{label}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          side="top"
          className="w-40 border-border bg-background mb-2"
        >
          {Object.entries(languages).map(([locale, name]) => (
            <DropdownMenuItem
              key={locale}
              className="focus:bg-accent focus:text-accent-foreground"
            >
              <Link
                href={redirectedPathName(locale)}
                locale={locale}
                className={`w-full ${locale === lang
                    ? "text-primary font-medium"
                    : "text-foreground/60 hover:text-primary"
                  }`}
              >
                {name}
              </Link>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
