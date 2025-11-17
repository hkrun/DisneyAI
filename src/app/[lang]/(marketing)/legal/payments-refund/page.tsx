import React from "react";
import { type Locale, getPathname, generateAlternates, i18nConfig } from "@/i18n-config";
import { host } from '@/config/config'
import RefundEn from "./refund.en.mdx";
import RefundZh from "./refund.zh.mdx";
import RefundJa from "./refund.ja.mdx";
import RefundKo from "./refund.ko.mdx";
import RefundEs from "./refund.es.mdx";
import RefundFr from "./refund.fr.mdx";
import RefundDe from "./refund.de.mdx";

// 动态导入其他语言的 MDX 文件
const RefundComponents: Record<Locale, React.ComponentType> = {
    en: RefundEn,
    zh: RefundZh,
    ja: RefundJa,
    ko: RefundKo,
    es: RefundEs,
    fr: RefundFr,
    de: RefundDe,
} as const;

export async function generateMetadata({ params }: { params: { lang: Locale } }) {
    const { lang } = await params;
    const alternates = generateAlternates(lang, '/legal/payments-refund');
    
    return {
        title: "Payments & Refund Policy - DisneyAi",
        description: "Payments and refund policy for our Disney style conversion platform.",
        alternates: {
            canonical: `${host}${getPathname(lang, '/legal/payments-refund')}`,
            languages: alternates
        }
    }
}

export default async function page({ params }: { params: { lang: Locale } }) {
    const { lang } = await params;
    // 根据语言选择对应的组件，如果不存在则使用默认语言
    const RefundComponent = RefundComponents[lang] || RefundComponents[i18nConfig.defaultLocale];
    
    return <RefundComponent />
}