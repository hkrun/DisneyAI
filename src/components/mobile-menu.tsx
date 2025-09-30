"use client"

import { useState } from "react"
import Link from "next/link"
import { X, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "./theme-toggle"
import { LanguageToggle } from "./language-toggle"
import { MobileLanguageToggle } from "./mobile-language-toggle"
import { type Locale, getPathname } from "@/i18n-config";
import { useSession } from 'next-auth/react'
import { type MobileMenuLocale } from "@/types/locales/navbar"
import { usePathname } from "next/navigation"

interface MobileMenuProps {
    lang: Locale;
    i18n: MobileMenuLocale;
    languageToggle: string;
    themeToggle: string;
}

export function MobileMenu({ lang, i18n, languageToggle, themeToggle }: MobileMenuProps) {
    const [isOpen, setIsOpen] = useState(false)
    const { data: session } = useSession();
    const pathname = usePathname();
    
    const isActive = (href: string) => {
        if (lang === "en") {
            if (href === "/") {
                return pathname === "/";
            }
            return pathname === href || pathname.startsWith(href + "/");
        } else {
            const langPrefix = `/${lang}`;
            const fullPath = href === "/" ? langPrefix : `${langPrefix}${href}`;
            if (href === "/") {
            return pathname === fullPath;
            }
            return pathname === fullPath || pathname.startsWith(fullPath + "/");
        }
    };

    const toggleMenu = () => {
        setIsOpen(!isOpen)

        if (isOpen) {
            document.body.style.overflow = "hidden"
        } else {
            document.body.style.overflow = "unset"
        }
    }



    return (
        <div className="md:hidden">
            <Button variant="ghost" size="icon" onClick={toggleMenu}>
                {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                <span className="sr-only">{i18n.toggleMenu}</span>
            </Button>

            {isOpen && (
                <div className="fixed inset-0 z-40 min-h-screen h-full w-full bg-background flex flex-col">
                    {/* Header Section - Logo and Close Button */}
                    <div className="flex items-center justify-between px-4 h-16 border-b border-border">
                        <Link scroll = {false} href={getPathname(lang, "/")} className="flex items-center gap-3" onClick={() => setIsOpen(false)}>
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 flex items-center justify-center text-yellow-400 shadow-lg">
                                👑
                            </div>
                            <span className="text-2xl font-bold bg-gradient-to-r from-disney-red via-disney-yellow to-disney-blue bg-clip-text text-transparent">
                                DisneyAi
                            </span>
                        </Link>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsOpen(false)}
                            className="text-foreground/60 hover:text-foreground"
                        >
                            <X className="h-6 w-6" />
                        </Button>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 overflow-y-auto">
                        <div className="container flex flex-col h-full px-4 py-6">
                            {/* Primary Navigation */}
                            <nav className="space-y-2 mb-8">
                                {i18n.navigation.map((item) => (
                                    <Link
                                        scroll = {false}
                                        key={item.href}
                                        href={getPathname(lang, item.href)}
                                        className={`
                                            flex items-center h-12 px-4 rounded-lg
                                            text-sm font-medium transition-colors
                                            hover:bg-disney-red/10 hover:text-disney-red
                                             ${isActive(item.href) ? "text-white bg-disney-red" : "text-foreground/60"}`}
                                        onClick={() => setIsOpen(false)}
                                    >
                                        {item.label}
                                    </Link>
                                ))}
                            </nav>

                            {/* Actions Section */}
                            <div className="space-y-3 mb-8 pt-6 border-t border-border">
                                {session?.user && (
                                    <Link
                                        scroll = {false}
                                        href={getPathname(lang, "/pricing")}
                                        className="inline-flex w-full h-12 items-center justify-center border border-border
                            hover:bg-accent rounded-md text-foreground font-medium shadow-sm"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        {i18n.actions.upgradePlan}
                                    </Link>
                                )}
                                <Link
                                    scroll = {false}
                                    href={getPathname(lang, "/contact")}
                                    className="inline-flex w-full h-12 items-center justify-center border border-border
                        hover:bg-accent rounded-md text-foreground"
                                    onClick={() => setIsOpen(false)}
                                >
                                    {i18n.actions.contactUs}
                                </Link>
                            </div>

                            {/* Settings Section */}
                            <div className="pt-6">
                                <div className="flex items-center justify-center px-4 py-4 rounded-lg bg-muted">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm">{i18n.settings.theme}</span>
                                        <ThemeToggle label={languageToggle} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            {/* 悬浮语言切换按钮 - 仅移动端显示 */}
            <MobileLanguageToggle lang={lang} label={languageToggle} />
        </div>
    )
}