import { type Locale, getPathname, generateAlternates } from "@/i18n-config";
import { host } from '@/config/config'
import Refund from "./refund.mdx";


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
    return <Refund />
}