'use client'

import { useState, useEffect } from 'react'
import ConverterPanel from '@/components/disney-converter/ConverterPanel'
import { type Locale } from '@/i18n-config'
import { type Home } from '@/types/locales/home'
import { type ConverterPanelLocal } from '@/types/locales/converter-panel'

interface HeroConverterSectionProps {
  lang: Locale
  hero: Home['hero']
  converter: Home['converter']
  converterTranslations: ConverterPanelLocal
}

export function HeroConverterSection({
  hero,
  converter,
  converterTranslations
}: HeroConverterSectionProps) {
  const [conversionMode, setConversionMode] = useState<'image' | 'video'>('image')

  useEffect(() => {
    try {
      const saved = localStorage.getItem('disney-converter-mode') as 'image' | 'video' | null
      if (saved === 'image' || saved === 'video') {
        setConversionMode(saved)
      }
    } catch {
      // ignore
    }
  }, [])

  const switchToImageMode = () => {
    setConversionMode('image')
    try {
      localStorage.setItem('disney-converter-mode', 'image')
    } catch {
      // ignore
    }
  }

  const switchToVideoMode = () => {
    setConversionMode('video')
    try {
      localStorage.setItem('disney-converter-mode', 'video')
    } catch {
      // ignore
    }
  }

  return (
    <section id="converter" className="relative pt-8 md:pt-16 pb-16 overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[url('https://picsum.photos/id/1035/1920/1080')] bg-cover bg-center opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-b from-disney-blue/30 to-disney-light/80" />
      </div>
      <div className="container mx-auto px-4 mb-4 md:mb-8 relative z-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h1 className="text-[clamp(2.5rem,5vw,4rem)] font-bold leading-tight text-shadow-lg mb-2">
              <span className="bg-gradient-to-r from-disney-red via-disney-yellow to-disney-purple bg-clip-text text-transparent">
                {conversionMode === 'image'
                  ? hero.title.imageConversion
                  : hero.title.videoConversion}
              </span>
            </h1>
            <p className="text-gray-600 text-lg">
              {conversionMode === 'image'
                ? hero.subtitle.imageConversion
                : hero.subtitle.videoConversion}
            </p>
          </div>
          <div className="mt-6 md:mt-0 flex w-full md:inline-flex md:w-auto rounded-full overflow-hidden border-2 border-disney-red shadow-md">
            <button
              onClick={switchToImageMode}
              className={`flex-1 md:flex-none px-6 py-3 font-bold transition-all ${
                conversionMode === 'image'
                  ? 'bg-disney-red text-white'
                  : 'bg-white text-disney-red hover:bg-gray-100'
              }`}
            >
              {converter.imageMode.label}
              <span
                className={`block text-xs font-normal mt-1 ${
                  conversionMode === 'image' ? 'text-white/80' : 'text-disney-red/80'
                }`}
              >
                {converter.imageMode.description}
              </span>
            </button>
            <button
              onClick={switchToVideoMode}
              className={`flex-1 md:flex-none px-6 py-3 font-bold transition-all ${
                conversionMode === 'video'
                  ? 'bg-disney-red text-white'
                  : 'bg-white text-disney-red hover:bg-gray-100'
              }`}
            >
              {converter.videoMode.label}
              <span
                className={`block text-xs font-normal mt-1 ${
                  conversionMode === 'video' ? 'text-white/80' : 'text-disney-red/80'
                }`}
              >
                {converter.videoMode.description}
              </span>
            </button>
          </div>
        </div>
      </div>

      <div className="relative z-10">
        <ConverterPanel mode={conversionMode} i18n={converterTranslations} />
      </div>
    </section>
  )
}

