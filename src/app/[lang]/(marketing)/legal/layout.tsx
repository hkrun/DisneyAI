import { type Locale } from "@/i18n-config";
import { getDictionary, i18nNamespaces } from '@/i18n'
import { Home } from "@/types/locales";

// 不在此 layout 中设置 canonical/alternates，由各子页面（legal、privacy、terms、payments-refund）自行设置正确的 canonical 与 hreflang
export async function generateMetadata({ params }: { params: Promise<{ lang: Locale }> }) {
  const { lang } = await params;
  let title = 'DisneyAi';
  let description = 'AI video disney ai website';
  try {
    const i18nHome = await getDictionary<Home>(lang, i18nNamespaces.home);
    const t = (i18nHome as any)?.meta;
    if (t?.title) title = t.title;
    if (t?.description) description = t.description;
  } catch {
    // Ignore and use defaults
  }

  return {
    title,
    description,
    twitter: {
      card: "summary_large_image",
      title,
      description
    },
    openGraph: {
      type: "website",
      title,
      description,
      siteName: "DisneyAi"
    },
  }
}

export default async function Layout({
  children, params
}: Readonly<{
  children: React.ReactNode,
  params: Promise<{ lang: Locale }>
}>) {
  return (
    <div className={`prose max-w-none m-5 mb-20 dark:prose-h1:text-gray-200 dark:prose-h2:text-gray-200 dark:prose-a:text-gray-200
       dark:prose-h3:text-gray-200 dark:prose-strong:text-gray-200 dark:prose-p:text-gray-400 dark:prose-li:text-gray-400`}>
      {children}
    </div>
  );
}
