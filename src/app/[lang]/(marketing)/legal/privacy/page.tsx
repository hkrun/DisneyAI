import React from "react";
import { type Locale, getPathname, generateAlternates, i18nConfig } from "@/i18n-config";
import { host } from '@/config/config'
import PolicyEn from "./policy.en.mdx";
import PolicyZh from "./policy.zh.mdx";
import PolicyJa from "./policy.ja.mdx";
import PolicyKo from "./policy.ko.mdx";
import PolicyEs from "./policy.es.mdx";
import PolicyFr from "./policy.fr.mdx";
import PolicyDe from "./policy.de.mdx";

// 动态导入其他语言的 MDX 文件
const PolicyComponents: Record<Locale, React.ComponentType> = {
    en: PolicyEn,
    zh: PolicyZh,
    ja: PolicyJa,
    ko: PolicyKo,
    es: PolicyEs,
    fr: PolicyFr,
    de: PolicyDe,
} as const;

export async function generateMetadata({ params }: { params: { lang: Locale } }) {
    const { lang } = await params;
    const alternates = generateAlternates(lang, '/legal/privacy');
    
    return {
        title: "Privacy Policy - DisneyAi",
        description: "Privacy policy for our Disney style conversion platform.",
        alternates: {
            canonical: `${host}${getPathname(lang, '/legal/privacy')}`,
            languages: alternates
        }
    }
}

export default async function page({ params }: { params: { lang: Locale } }) {
    const { lang } = await params;
    // 根据语言选择对应的组件，如果不存在则使用默认语言
    const PolicyComponent = PolicyComponents[lang] || PolicyComponents[i18nConfig.defaultLocale];
    
    return <PolicyComponent />
}