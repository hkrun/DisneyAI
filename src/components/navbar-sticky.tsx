"use client"
import Link from "next/link"
import { LanguageToggle } from "@/components/language-toggle"
import { ThemeToggle } from "@/components/theme-toggle"
import { MobileMenu } from "@/components/mobile-menu"
// 不再需要自定义AuthProvider，使用NextAuth的SessionProvider
import { type Locale, getPathname } from "@/i18n-config";
import { AuthButton } from '@/components/auth/auth-button';
import { Navbar } from "@/types/locales/navbar"
import { usePathname } from "next/navigation"
import dynamic from "next/dynamic"
// 避免 SSR/CSR 渲染差异导致 Radix useId 链错位：积分组件仅在客户端渲染
const CreditsDisplay = dynamic(() => import("@/components/credits-display").then(m => m.CreditsDisplay), { ssr: false })
import { SubscriptionLocal, ToastLocal } from "@/types/locales/billing";
import { TransformHistoryLocal } from "@/types/locales/transform-history";
import { useAddToHomeScreen } from "@/hooks/useAddToHomeScreen";
import { Download, Share, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";

interface NavbarStickyProps {
    lang: Locale;
    navbarLocal: Navbar,
    subscriptionLocal: SubscriptionLocal,
    toastLocal: ToastLocal,
    historyLocal?: TransformHistoryLocal,
    i18n: {
        auth: {
            login: {
                title: string;
                googleButton: string;
                orDivider: string;
                emailLabel: string;
                emailPlaceholder: string;
                passwordLabel: string;
                passwordPlaceholder: string;
                loginButton: string;
                registerLink: string;
                registerButton: string;
                forgotPassword: string;
            };
            register: {
                title: string;
                googleButton: string;
                orDivider: string;
                emailLabel: string;
                emailPlaceholder: string;
                passwordLabel: string;
                passwordPlaceholder: string;
                firstNameLabel: string;
                firstNamePlaceholder: string;
                lastNameLabel: string;
                lastNamePlaceholder: string;
                registerButton: string;
                loginLink: string;
                loginButton: string;
            };
            errors: {
                emailRequired: string;
                emailInvalid: string;
                passwordRequired: string;
                passwordLength: string;
                firstNameRequired: string;
                lastNameRequired: string;
                loginFailed: string;
                registerFailed: string;
                googleLoginFailed: string;
                networkError: string;
                userNotFound: string;
                invalidCredentials: string;
                accountDisabled: string;
                [key: string]: string;
            };
            success: {
                welcomeBack: string;
                welcomeNew: string;
                [key: string]: string;
            };
        };
    };
}

export function NavbarSticky({ lang, navbarLocal, subscriptionLocal, toastLocal, historyLocal, i18n }: NavbarStickyProps) {
    const pathname = usePathname();
    const { isVisible: canInstall, promptInstall, isIosSafari } = useAddToHomeScreen();
    const [showIosGuide, setShowIosGuide] = useState(false);
    
    const isActive = (href: string) => {
        if (lang === "en") {
            // 对于首页，只匹配精确路径
            if (href === "/") {
                return pathname === "/";
            }
            // 对于其他页面，支持子路径匹配
            return pathname === href || pathname.startsWith(href + "/");
        } else {
            const langPrefix = `/${lang}`;
            const fullPath = href === "/" ? langPrefix : `${langPrefix}${href}`;
            // 对于首页，只匹配精确路径
            if (href === "/") {
                return pathname === fullPath;
            }
            // 对于其他页面，支持子路径匹配
            return pathname === fullPath || pathname.startsWith(fullPath + "/");
        }
    };
    
    const handleInstallClick = async () => {
        if (isIosSafari) {
            setShowIosGuide(true);
        } else {
            await promptInstall();
        }
    };

    return (
        <header className="sticky top-0 z-50 w-full border-b border-primary/20 bg-background">
            <div className="container mx-auto">
                <div className="flex justify-between items-center py-4">
                    {/* Left Side: Logo + Navigation */}
                    <div className="flex items-center gap-8 flex-1">
                    {/* Logo */}
                    <Link scroll={true} href={getPathname(lang,"/")} className="flex items-center gap-3 flex-shrink-0" title="迪士尼风格转换 - AI图像转换应用">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 flex items-center justify-center text-yellow-400 shadow-lg">
                            👑
                        </div>
                        <span className="text-2xl font-bold bg-gradient-to-r from-disney-red via-disney-yellow to-disney-blue bg-clip-text text-transparent">
                        DisneyAi
                        </span>
                    </Link>

                    {/* Desktop Navigation - Right next to logo */}
                    <nav className="hidden md:flex items-center gap-6">
                        {navbarLocal.navigation.map((item) => (
                            <Link
                                scroll={false}
                                key={item.href}
                                href={getPathname(lang, item.href)}
                                className={`text-sm font-medium transition-colors hover:text-disney-red
                                ${isActive(item.href) ? "text-disney-red" : "text-foreground/60"}`}
                            >
                                {item.label}
                            </Link>
                        ))}
                    </nav>
                    </div>

                    {/* Right Side Actions */}
                    <div className="flex items-center gap-1 md:gap-4 flex-shrink-0">
                    {/* Credits (Client-only to prevent hydration mismatch) */}
                    <CreditsDisplay lang={lang} creditsDisplay={navbarLocal.creditsDisplay} />

                    {/* Language, Theme Toggles - Hidden on mobile */}
                    <div className="hidden md:flex items-center gap-4">
                        <LanguageToggle lang={lang} label={navbarLocal.languageToggle.label} />
                        <ThemeToggle label={navbarLocal.themeToggle.label} />
                    </div>
                    
                    {/* Install PWA Button - 在头像左边 */}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleInstallClick}
                        className="hover:bg-accent"
                        title={navbarLocal.installApp?.tooltip || "添加到主屏幕"}
                    >
                        <Home className="h-5 w-5" />
                    </Button>
                    
                    {/* Auth Button */}
                    <AuthButton
                        lang={lang}
                        userButton={navbarLocal.userButton}
                        loginLabel={navbarLocal.actions.signIn}
                        subscription={subscriptionLocal}
                        toastLocal={toastLocal}
                        historyLocal={historyLocal}
                        i18n={i18n}
                    />

                    {/* Mobile Navigation Menu */}
                    <MobileMenu lang={lang} i18n={navbarLocal.mobileMenu}
                        themeToggle={navbarLocal.languageToggle.label}
                        languageToggle={navbarLocal.themeToggle.label} />
                    </div>
                </div>
            </div>
            
            {/* 安装引导对话框 */}
            <Dialog open={showIosGuide} onOpenChange={setShowIosGuide}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>{navbarLocal.installApp?.manualInstall?.title || "手动添加到主屏幕"}</DialogTitle>
                        <DialogDescription>
                            {navbarLocal.installApp?.manualInstall?.description || "根据您使用的浏览器，按照以下步骤操作："}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-6 py-4">
                        {/* Chrome */}
                        <div className="space-y-2">
                            <h4 className="font-semibold text-sm">{navbarLocal.installApp?.manualInstall?.chrome?.title || "Chrome 浏览器"}</h4>
                            <ol className="list-decimal list-inside space-y-1.5 text-sm text-muted-foreground">
                                {(navbarLocal.installApp?.manualInstall?.chrome?.steps || [
                                    "点击浏览器右上角的三个点（⋮）",
                                    "在菜单中选择「添加到主屏幕」",
                                    "等待安装完成即可"
                                ]).map((step, idx) => (
                                    <li key={idx}>{step}</li>
                                ))}
                            </ol>
                        </div>
                        
                        {/* Edge */}
                        <div className="space-y-2">
                            <h4 className="font-semibold text-sm">{navbarLocal.installApp?.manualInstall?.edge?.title || "Edge 浏览器"}</h4>
                            <ol className="list-decimal list-inside space-y-1.5 text-sm text-muted-foreground">
                                {(navbarLocal.installApp?.manualInstall?.edge?.steps || [
                                    "点击浏览器右下角的三条短横线（☰）",
                                    "在菜单中选择「添加到手机」",
                                    "等待安装完成即可"
                                ]).map((step, idx) => (
                                    <li key={idx}>{step}</li>
                                ))}
                            </ol>
                        </div>
                        
                        {/* Safari */}
                        <div className="space-y-2">
                            <h4 className="font-semibold text-sm">{navbarLocal.installApp?.manualInstall?.safari?.title || "Safari 浏览器（iOS）"}</h4>
                            <ol className="list-decimal list-inside space-y-1.5 text-sm text-muted-foreground">
                                {(navbarLocal.installApp?.manualInstall?.safari?.steps || [
                                    "点击浏览器底部的分享按钮（□↑）",
                                    "在菜单中选择「添加到主屏幕」",
                                    "等待安装完成即可"
                                ]).map((step, idx) => (
                                    <li key={idx}>{step}</li>
                                ))}
                            </ol>
                        </div>
                        
                        {/* 提示 */}
                        <p className="text-xs text-muted-foreground border-l-2 border-primary pl-3">
                            {navbarLocal.installApp?.manualInstall?.tip || "温馨提示：建议使用 Chrome 或 Edge 浏览器以获得最佳体验"}
                        </p>
                    </div>
                </DialogContent>
            </Dialog>
        </header>
    )
}