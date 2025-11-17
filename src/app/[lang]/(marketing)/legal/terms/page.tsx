import React from "react";
import { type Locale, getPathname, generateAlternates, i18nConfig } from "@/i18n-config";
import { host } from '@/config/config'
import TermsEn from "./terms.en.mdx";
import TermsZh from "./terms.zh.mdx";
import TermsJa from "./terms.ja.mdx";
import TermsKo from "./terms.ko.mdx";
import TermsEs from "./terms.es.mdx";
import TermsFr from "./terms.fr.mdx";
import TermsDe from "./terms.de.mdx";

// 动态导入其他语言的 MDX 文件
const TermsComponents: Record<Locale, React.ComponentType> = {
    en: TermsEn,
    zh: TermsZh,
    ja: TermsJa,
    ko: TermsKo,
    es: TermsEs,
    fr: TermsFr,
    de: TermsDe,
} as const;

export async function generateMetadata({ params }: { params: { lang: Locale } }) {
    const { lang } = await params;
    const alternates = generateAlternates(lang, '/legal/terms');
    
    return {
        title: "Terms of Service - DisneyAi",
        description: "Terms of service for our Disney style conversion platform.",
        alternates: {
            canonical: `${host}${getPathname(lang, '/legal/terms')}`,
            languages: alternates
        }
    }
}

export default async function page({ params }: { params: { lang: Locale } }) {
    const { lang } = await params;
    // 根据语言选择对应的组件，如果不存在则使用默认语言
    const TermsComponent = TermsComponents[lang] || TermsComponents[i18nConfig.defaultLocale];
    
    return <TermsComponent />
}