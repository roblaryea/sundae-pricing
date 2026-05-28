export const supportedLocales = [
  'en',
  'ar',
  'fr',
  'es',
  'de',
  'nl',
  'pt',
  'hi',
  'ur',
  'it',
  'pl',
  'tr',
  'zh-Hans',
  'ja',
  'ko',
  'id',
  'vi',
  'ro',
  'sv',
  'bn',
  'th',
  'ms',
] as const

export type PricingLocale = (typeof supportedLocales)[number]

export const defaultPricingLocale: PricingLocale = 'en'

export const fullyLocalizedPricingLocales = ['en', 'ar', 'fr', 'es'] as const
export type FullyLocalizedPricingLocale = (typeof fullyLocalizedPricingLocales)[number]

export const localeNames: Record<PricingLocale, string> = {
  en: 'English',
  ar: 'العربية',
  fr: 'Français',
  es: 'Español',
  de: 'Deutsch',
  nl: 'Nederlands',
  pt: 'Português',
  hi: 'हिन्दी',
  ur: 'اردو',
  it: 'Italiano',
  pl: 'Polski',
  tr: 'Türkçe',
  'zh-Hans': '简体中文',
  ja: '日本語',
  ko: '한국어',
  id: 'Bahasa Indonesia',
  vi: 'Tiếng Việt',
  ro: 'Română',
  sv: 'Svenska',
  bn: 'বাংলা',
  th: 'ไทย',
  ms: 'Bahasa Melayu',
}

export const localeDirection: Record<PricingLocale, 'ltr' | 'rtl'> = {
  en: 'ltr',
  ar: 'rtl',
  fr: 'ltr',
  es: 'ltr',
  de: 'ltr',
  nl: 'ltr',
  pt: 'ltr',
  hi: 'ltr',
  ur: 'rtl',
  it: 'ltr',
  pl: 'ltr',
  tr: 'ltr',
  'zh-Hans': 'ltr',
  ja: 'ltr',
  ko: 'ltr',
  id: 'ltr',
  vi: 'ltr',
  ro: 'ltr',
  sv: 'ltr',
  bn: 'ltr',
  th: 'ltr',
  ms: 'ltr',
}

export const localeIntlTags: Record<PricingLocale, string> = {
  en: 'en-US',
  ar: 'ar-AE',
  fr: 'fr-FR',
  es: 'es-ES',
  de: 'de-DE',
  nl: 'nl-NL',
  pt: 'pt-BR',
  hi: 'hi-IN',
  ur: 'ur-PK',
  it: 'it-IT',
  pl: 'pl-PL',
  tr: 'tr-TR',
  'zh-Hans': 'zh-Hans-CN',
  ja: 'ja-JP',
  ko: 'ko-KR',
  id: 'id-ID',
  vi: 'vi-VN',
  ro: 'ro-RO',
  sv: 'sv-SE',
  bn: 'bn-BD',
  th: 'th-TH',
  ms: 'ms-MY',
}

const localeLookup = new Map<string, PricingLocale>(
  supportedLocales.flatMap((locale) => {
    const lower = locale.toLowerCase()
    const intl = localeIntlTags[locale].toLowerCase()
    return [
      [lower, locale],
      [intl, locale],
    ]
  }),
)

localeLookup.set('zh', 'zh-Hans')
localeLookup.set('zh-cn', 'zh-Hans')
localeLookup.set('zh-sg', 'zh-Hans')
localeLookup.set('zh-hans-cn', 'zh-Hans')
localeLookup.set('in', 'id')

export function normalizePricingLocale(locale?: string | null): PricingLocale {
  if (!locale) return defaultPricingLocale

  const normalized = locale.trim().replace('_', '-').toLowerCase()
  const directMatch = localeLookup.get(normalized)
  if (directMatch) return directMatch

  const prefix = normalized.split('-')[0]
  return localeLookup.get(prefix) ?? defaultPricingLocale
}

export function getPricingIntlLocale(locale: PricingLocale): string {
  return localeIntlTags[locale] ?? localeIntlTags[defaultPricingLocale]
}

export function isFullyLocalizedPricingLocale(locale: PricingLocale): locale is FullyLocalizedPricingLocale {
  return (fullyLocalizedPricingLocales as readonly string[]).includes(locale)
}
