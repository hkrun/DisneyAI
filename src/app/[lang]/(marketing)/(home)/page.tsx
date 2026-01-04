import Link from 'next/link'
import { notFound } from 'next/navigation'
import { type Locale, i18nConfig, getPathname, generateAlternates } from '@/i18n-config'
import { getDictionary, i18nNamespaces } from '@/i18n'
import { type Home } from '@/types/locales/home'
import { type ConverterPanelLocal } from '@/types/locales/converter-panel'
import { HeroConverterSection } from './HeroConverterSection'
import { host } from '@/config/config'
import type { Metadata } from 'next'

interface HomePageProps {
  params: Promise<{ lang: Locale }>
}

export async function generateMetadata({ params }: { params: Promise<{ lang: Locale }> }): Promise<Metadata> {
  const { lang } = await params

  if (!i18nConfig.locales.includes(lang)) {
    return {}
  }

  const translations = await getDictionary<Home>(lang, i18nNamespaces.home)
  const meta = translations.meta ?? {}
  const alternates = generateAlternates(lang, '')
  const canonical = `${host}${getPathname(lang, '')}`

  return {
    title: meta.title ?? 'DisneyAi',
    description: meta.description ?? 'AI video disney ai website',
    keywords: meta.keywords,
    alternates: {
      canonical,
      languages: alternates,
    },
    openGraph: {
      type: 'website',
      url: canonical,
      title: meta.title ?? 'DisneyAi',
      description: meta.description ?? 'AI video disney ai website',
      siteName: 'DisneyAi',
    },
    twitter: {
      card: 'summary_large_image',
      title: meta.title ?? 'DisneyAi',
      description: meta.description ?? 'AI video disney ai website',
    },
  }
}

export default async function Home({ params }: HomePageProps) {
  const { lang } = await params

  if (!i18nConfig.locales.includes(lang)) {
    notFound()
  }

  const translations = await getDictionary<Home>(lang, i18nNamespaces.home)
  const converterTranslations = await getDictionary<ConverterPanelLocal>(lang, 'converter-panel')

  return (
    <>
      <main>
        <HeroConverterSection
          lang={lang}
          hero={translations.hero}
          converter={translations.converter}
          converterTranslations={converterTranslations}
        />
      {/* 功能亮点 */}
      <section id="features" className="py-16 md:py-24 bg-disney-blue text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-[clamp(1.8rem,3vw,2.5rem)] font-bold mb-4">{translations.features.title}</h2>
            <p className="text-white/80 max-w-2xl mx-auto text-lg">{translations.features.subtitle}</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {translations.features.items.map((item, index) => (
            <div key={index} className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 hover:bg-white/15 transition-colors border border-white/20 flex flex-col">
              <div className={`w-16 h-16 ${index === 0 ? 'bg-disney-yellow' : index === 1 ? 'bg-disney-red' : 'bg-disney-purple'} rounded-full flex items-center justify-center mb-6`}>
                <i className={`${item.icon} ${index === 0 ? 'text-disney-blue' : 'text-white'} text-2xl`} />
                </div>
              <h3 className="text-2xl font-bold mb-4">{item.title}</h3>
              <p className="text-white/80 mb-6 flex-grow">{item.description}</p>
              <div className="rounded-xl overflow-hidden border border-white/20 mt-auto">
                {index === 0 && (
                  <div className="flex">
                    <img src="/db1.jpeg" className="w-1/2 h-96 object-cover" />
                    <img src="/1.jpg" className="w-1/2 h-96 object-cover" />
                  </div>
                )}
                {index === 1 && (
                  <video 
                    className="w-full h-96 object-contain bg-black" 
                    controls
                    poster="/sp1.jpeg"
                    preload="metadata"
                  >
                    <source src="/sp1.mp4" type="video/mp4" />
                    {translations.features.videoNotSupported}
                  </video>
                )}
                {index === 2 && (
                  <>
                    <div className="flex">
                      <img src="/gz1.jpg" className="w-1/2 h-48 object-cover" />
                      <img src="/gz2.jpg" className="w-1/2 h-48 object-cover" />
                    </div>
                    <div className="flex">
                      <img src="/gz3.jpg" className="w-1/2 h-48 object-cover" />
                      <img src="/gz4.png" className="w-1/2 h-48 object-cover" />
                    </div>
                  </>
                )}
              </div>
            </div>
            ))}
          </div>
        </div>
      </section>

      {/* 风格模板库 */}
      <section id="templates" className="py-16 md:py-24 bg-magic">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-[clamp(1.8rem,3vw,2.5rem)] font-bold mb-4">{translations.templates.title}</h2>
            <p className="text-disney-blue/80 max-w-2xl mx-auto text-lg">{translations.templates.subtitle}</p>
                    </div>
          <div className="flex flex-wrap justify-center gap-3 mb-10">
            {[
              translations.templates.filters.all,
              translations.templates.filters.classic,
              translations.templates.filters.pixar,
              translations.templates.filters.modern
            ].map((filter, index) => (
              <button key={index} className={`px-5 py-2 rounded-full text-sm font-medium ${index === 0 ? 'bg-disney-red text-white' : 'bg-white text-disney-blue hover:bg-gray-100 transition-colors'}`}>{filter}</button>
            ))}
                  </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {translations.templates.items.map((item, i) => (
              <div key={i} className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow">
                <div className="relative">
                  <img src={[
                    '/cat1.jpg',
                    '/cat2.jpg',
                    '/cat3.jpg',
                    '/cat4.jpg'
                  ][i]} className="w-full h-48 object-cover" />
                  <div className={`absolute top-3 right-3 ${item.tag === '经典' || item.tag === 'Classic' ?'bg-disney-yellow text-disney-blue':'bg-disney-blue text-white'} text-xs px-2 py-1 rounded-full font-medium`}>{item.tag}</div>
                  </div>
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-1">{item.title}</h3>
                  <p className="text-sm text-gray-600 mb-3">{item.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs bg-disney-blue/10 text-disney-blue px-2 py-1 rounded-full">{item.status}</span>
                </div>
              </div>
              </div>
            ))}
            </div>
          </div>
        </section>

      {/* 社区/评价 + 活动 */}
      <section id="community" className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-[clamp(1.8rem,3vw,2.5rem)] font-bold mb-4">{translations.testimonials.title}</h2>
            <p className="text-disney-blue/80 max-w-2xl mx-auto text-lg">{translations.testimonials.subtitle}</p>
            </div>
          <div className="grid md:grid-cols-3 gap-8">
              {translations.testimonials.items.map((testimonial, i) => (
              <div key={i} className="bg-disney-light rounded-2xl p-6 shadow-md border border-gray-100">
                <div className="flex items-center mb-4">
                  <img src={`https://picsum.photos/id/${[237, 26, 91][i]}/100/100`} className="w-12 h-12 rounded-full object-cover mr-4" />
                  <div>
                    <h4 className="font-bold">{testimonial.author}</h4>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
                <div className="mb-4 text-disney-yellow">
                  {Array.from({length:5}).map((_,s)=>(<i key={s} className={`fa ${s < Math.floor([5, 5, 4.5][i]) ? 'fa-star' : ([5, 5, 4.5][i]%1 && s===Math.floor([5, 5, 4.5][i])?'fa-star-half-o':'fa-star-o')}`} />))}
              </div>
                <p className="text-gray-700 mb-4">"{testimonial.content}"</p>
                  <img src={[
                    '/pl1.jpg',
                    '/pl2.jpg',
                    '/4.png'
                  ][i]} className="w-full h-40 object-cover rounded-lg" />
                </div>
            ))}
              </div>

          {/* 活动横幅 */}
          <div className="mt-16 bg-gradient-to-r from-disney-purple to-disney-accent rounded-2xl overflow-hidden shadow-xl">
            <div className="flex flex-col md:flex-row">
              <div className="md:w-1/2 p-8 md:p-12 text-white">
                <span className="inline-block bg-white/20 backdrop-blur-sm text-white text-sm px-3 py-1 rounded-full mb-4">{translations.activity.badge}</span>
                <h3 className="text-2xl md:text-3xl font-bold mb-4">{translations.activity.title}</h3>
                <p className="mb-6 text-white/90">{translations.activity.description}</p>
                <ul className="mb-8 space-y-2">
                  {translations.activity.rules.map((rule, index) => (
                    <li key={index} className="flex items-start"><i className="fa fa-check-circle mt-1 mr-2" />{rule}</li>
                  ))}
                </ul>
                <a href="#" className="inline-block bg-white text-disney-purple hover:bg-gray-100 px-6 py-3 rounded-full font-bold">{translations.activity.cta}</a>
                </div>
              <div className="md:w-1/2 relative h-64 md:h-auto">
                <img src="/jl.jpg" className="absolute inset-0 w-full h-full object-cover" />
                </div>
              </div>
            </div>
          </div>
        </section>

      {/* CTA 统计 */}
      <section className="py-16 md:py-24 bg-gradient-to-r from-disney-blue to-disney-accent text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-[clamp(1.8rem,3vw,2.5rem)] font-bold mb-6">{translations.pricing.title}</h2>
          <p className="max-w-2xl mx-auto text-lg text-white/90 mb-10">{translations.pricing.subtitle}</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-12">
            <Link href={`/${lang}/pricing`} className="w-full sm:w-auto bg-disney-yellow hover:bg-disney-yellow/90 text-disney-blue px-8 py-4 rounded-full font-bold text-lg shadow-lg text-center">{translations.pricing.cta}</Link>
            <Link href={`/${lang}/about`} className="w-full sm:w-auto bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-8 py-4 rounded-full font-bold text-lg shadow-md border border-white/40 text-center">{translations.pricing.learnMore}</Link>
          </div>
          <div className="mt-6 flex flex-wrap justify-center gap-8 md:gap-16">
            {[
              {n:'20+', t:translations.community.stats.users},
              {n:'100k+', t:translations.community.stats.creations},
              {n:'500k+', t:translations.community.stats.creations},
              {n:'98%', t:translations.community.stats.satisfaction},
            ].map((s,i)=> (
              <div key={i} className="flex flex-col items-center"><div className="text-4xl font-bold mb-2">{s.n}</div><div className="text-white/80">{s.t}</div></div>
            ))}
            </div>
          </div>
        </section>
      </main>
    </>
  )
}