import type { FullyLocalizedPricingLocale, PricingLocale } from './locales';
import { generatedPricingI18nCopy } from './generatedPricingLocalePacks';

export type { PricingLocale } from './locales';

type LocaleCopy = {
  tiers: Record<string, string>;
  modules: Record<string, string>;
  watchtower: Record<string, string>;
  discounts: Record<string, string>;
  pdf: {
    headerSubtitle: string;
    quoteLabel: string;
    generatedLabel: string;
    validUntilLabel: string;
    configurationTitle: string;
    platformLabel: string;
    locationsLabel: string;
    perLocationLabel: string;
    modulesLabel: string;
    watchtowerLabel: string;
    monthlyInvestmentLabel: string;
    annualLabel: string;
    priceBreakdownTitle: string;
    howYouCompareTitle: string;
    competitorLabel: string;
    theirCostLabel: string;
    yourCostLabel: string;
    youSaveLabel: string;
    verifiedLabel: string;
    bestSavingsLabel: string;
    competitorDisclaimer: string;
    informationalOnlyLabel: string;
    formalProposalLabel: string;
    pageLabel: string;
    ofLabel: string;
    perYearLabel: string;
    vsLabel: string;
  };
};

const localizedCopy: Record<FullyLocalizedPricingLocale, LocaleCopy> = {
  en: {
    tiers: {
      'Report Lite': 'Report Lite',
      'Report Plus': 'Report Plus',
      'Report Pro': 'Report Pro',
      'Core Lite': 'Core Lite',
      'Core Pro': 'Core Pro',
      'Enterprise': 'Enterprise',
    },
    modules: {
      'labor': 'Labor Intelligence',
      'inventory': 'Inventory Connect',
      'purchasing': 'Purchasing Analytics',
      'marketing': 'Marketing Performance',
      'reservations': 'Reservations Intelligence',
      'profit': 'Profit Intelligence',
      'revenue': 'Revenue Assurance',
      'delivery': 'Delivery Economics',
      'guest': 'Guest Experience',
      'pulse': 'Pulse',
    },
    watchtower: {
      'competitive': 'Competitive Intelligence',
      'events': 'Event & Calendar Signals',
      'trends': 'Market Trends',
      'bundle': 'Watchtower Bundle',
    },
    discounts: {
      volume: 'Volume discount',
      billing: 'Billing discount',
      early: 'Early Adopter discount',
      negotiated: 'Negotiated discount',
    },
    pdf: {
      headerSubtitle: 'Decision Intelligence for Restaurants',
      quoteLabel: 'Quote',
      generatedLabel: 'Generated',
      validUntilLabel: 'Valid until',
      configurationTitle: 'Your Configuration',
      platformLabel: 'Platform',
      locationsLabel: 'Locations',
      perLocationLabel: 'per location',
      modulesLabel: 'Modules',
      watchtowerLabel: 'Watchtower',
      monthlyInvestmentLabel: 'Monthly Investment',
      annualLabel: 'Annual',
      priceBreakdownTitle: 'Price Breakdown',
      howYouCompareTitle: 'How You Compare',
      competitorLabel: 'Competitor',
      theirCostLabel: 'Their Cost',
      yourCostLabel: 'Your Cost',
      youSaveLabel: 'You Save',
      verifiedLabel: 'Verified',
      bestSavingsLabel: 'Best Savings',
      competitorDisclaimer: '* Competitor pricing based on public information and industry estimates. Contact vendors for exact quotes.',
      informationalOnlyLabel: 'This quote is for informational purposes only.',
      formalProposalLabel: 'contact us for a formal proposal.',
      pageLabel: 'Page',
      ofLabel: 'of',
      perYearLabel: 'year',
      vsLabel: 'vs',
    },
  },
  ar: {
    tiers: {
      'Report Lite': 'Report Lite',
      'Report Plus': 'Report Plus',
      'Report Pro': 'Report Pro',
      'Core Lite': 'Core Lite',
      'Core Pro': 'Core Pro',
      'Enterprise': 'Enterprise',
    },
    modules: {
      'labor': 'ذكاء العمالة',
      'inventory': 'Inventory Connect',
      'purchasing': 'Purchasing Analytics',
      'marketing': 'أداء التسويق',
      'reservations': 'ذكاء الحجوزات',
      'profit': 'ذكاء الربح',
      'revenue': 'ضمان الإيرادات',
      'delivery': 'Delivery Economics',
      'guest': 'تجربة الضيف',
      'pulse': 'Pulse',
    },
    watchtower: {
      'competitive': 'ذكاء تنافسي',
      'events': 'إشارات الفعاليات والتقويم',
      'trends': 'اتجاهات السوق',
      'bundle': 'حزمة Watchtower',
    },
    discounts: {
      volume: 'خصم الحجم',
      billing: 'خصم الفوترة',
      early: 'خصم المؤسسين الأوائل',
      negotiated: 'خصم متفق عليه',
    },
    pdf: {
      headerSubtitle: 'ذكاء القرار للمطاعم',
      quoteLabel: 'عرض السعر',
      generatedLabel: 'تم الإنشاء',
      validUntilLabel: 'ساري حتى',
      configurationTitle: 'التهيئة الخاصة بك',
      platformLabel: 'المنصة',
      locationsLabel: 'المواقع',
      perLocationLabel: 'لكل موقع',
      modulesLabel: 'الوحدات',
      watchtowerLabel: 'Watchtower',
      monthlyInvestmentLabel: 'الاستثمار الشهري',
      annualLabel: 'سنوي',
      priceBreakdownTitle: 'تفصيل السعر',
      howYouCompareTitle: 'كيف تقارن',
      competitorLabel: 'المنافس',
      theirCostLabel: 'تكلفته',
      yourCostLabel: 'تكلفتك',
      youSaveLabel: 'توفّر',
      verifiedLabel: 'موثّق',
      bestSavingsLabel: 'أفضل توفير',
      competitorDisclaimer: '* تعتمد أسعار المنافسين على المعلومات العامة وتقديرات الصناعة. تواصل مع المزوّدين للحصول على عروض دقيقة.',
      informationalOnlyLabel: 'هذا العرض لأغراض معلوماتية فقط.',
      formalProposalLabel: 'تواصل معنا للحصول على عرض رسمي.',
      pageLabel: 'الصفحة',
      ofLabel: 'من',
      perYearLabel: 'سنة',
      vsLabel: 'مقابل',
    },
  },
  fr: {
    tiers: {
      'Report Lite': 'Report Lite',
      'Report Plus': 'Report Plus',
      'Report Pro': 'Report Pro',
      'Core Lite': 'Core Lite',
      'Core Pro': 'Core Pro',
      'Enterprise': 'Enterprise',
    },
    modules: {
      'labor': 'Intelligence main-d’œuvre',
      'inventory': 'Inventory Connect',
      'purchasing': 'Purchasing Analytics',
      'marketing': 'Performance marketing',
      'reservations': 'Intelligence réservations',
      'profit': 'Intelligence profit',
      'revenue': 'Assurance revenus',
      'delivery': 'Delivery Economics',
      'guest': 'Expérience client',
      'pulse': 'Pulse',
    },
    watchtower: {
      'competitive': 'Intelligence concurrentielle',
      'events': 'Signaux evenements et calendrier',
      'trends': 'Tendances de marche',
      'bundle': 'Pack Watchtower',
    },
    discounts: {
      volume: 'Remise volume',
      billing: 'Remise facturation',
      early: 'Remise fondateurs',
      negotiated: 'Remise negociee',
    },
    pdf: {
      headerSubtitle: 'Intelligence décisionnelle pour les restaurants',
      quoteLabel: 'Devis',
      generatedLabel: 'Généré',
      validUntilLabel: "Valable jusqu'au",
      configurationTitle: 'Votre configuration',
      platformLabel: 'Plateforme',
      locationsLabel: 'Sites',
      perLocationLabel: 'par site',
      modulesLabel: 'Modules',
      watchtowerLabel: 'Watchtower',
      monthlyInvestmentLabel: 'Investissement mensuel',
      annualLabel: 'Annuel',
      priceBreakdownTitle: 'Detail des prix',
      howYouCompareTitle: 'Votre comparaison',
      competitorLabel: 'Concurrent',
      theirCostLabel: 'Leur coût',
      yourCostLabel: 'Votre coût',
      youSaveLabel: 'Vous économisez',
      verifiedLabel: 'Vérifié',
      bestSavingsLabel: 'Meilleure économie',
      competitorDisclaimer: '* Les prix des concurrents reposent sur des informations publiques et des estimations sectorielles. Contactez les fournisseurs pour obtenir des devis exacts.',
      informationalOnlyLabel: 'Ce devis est fourni à titre informatif uniquement.',
      formalProposalLabel: 'contactez-nous pour une proposition formelle.',
      pageLabel: 'Page',
      ofLabel: 'sur',
      perYearLabel: 'an',
      vsLabel: 'vs',
    },
  },
  es: {
    tiers: {
      'Report Lite': 'Report Lite',
      'Report Plus': 'Report Plus',
      'Report Pro': 'Report Pro',
      'Core Lite': 'Core Lite',
      'Core Pro': 'Core Pro',
      'Enterprise': 'Enterprise',
    },
    modules: {
      'labor': 'Inteligencia de personal',
      'inventory': 'Inventory Connect',
      'purchasing': 'Purchasing Analytics',
      'marketing': 'Rendimiento de marketing',
      'reservations': 'Inteligencia de reservas',
      'profit': 'Inteligencia de beneficio',
      'revenue': 'Aseguramiento de ingresos',
      'delivery': 'Delivery Economics',
      'guest': 'Experiencia del cliente',
      'pulse': 'Pulse',
    },
    watchtower: {
      'competitive': 'Inteligencia competitiva',
      'events': 'Señales de eventos y calendario',
      'trends': 'Tendencias de mercado',
      'bundle': 'Paquete Watchtower',
    },
    discounts: {
      volume: 'Descuento por volumen',
      billing: 'Descuento por facturación',
      early: 'Descuento de adopción temprana',
      negotiated: 'Descuento negociado',
    },
    pdf: {
      headerSubtitle: 'Inteligencia de decisión para restaurantes',
      quoteLabel: 'Cotización',
      generatedLabel: 'Generado',
      validUntilLabel: 'Válido hasta',
      configurationTitle: 'Tu configuración',
      platformLabel: 'Plataforma',
      locationsLabel: 'Locales',
      perLocationLabel: 'por local',
      modulesLabel: 'Módulos',
      watchtowerLabel: 'Watchtower',
      monthlyInvestmentLabel: 'Inversión mensual',
      annualLabel: 'Anual',
      priceBreakdownTitle: 'Desglose de precios',
      howYouCompareTitle: 'Cómo comparas',
      competitorLabel: 'Competidor',
      theirCostLabel: 'Su coste',
      yourCostLabel: 'Tu coste',
      youSaveLabel: 'Ahorras',
      verifiedLabel: 'Verificado',
      bestSavingsLabel: 'Mejor ahorro',
      competitorDisclaimer: '* Los precios de la competencia se basan en información pública y estimaciones del sector. Contacta con los proveedores para obtener cotizaciones exactas.',
      informationalOnlyLabel: 'Esta cotización es solo para fines informativos.',
      formalProposalLabel: 'contáctanos para recibir una propuesta formal.',
      pageLabel: 'Página',
      ofLabel: 'de',
      perYearLabel: 'año',
      vsLabel: 'vs',
    },
  },
};

export function localizeTierName(name: string, locale: PricingLocale): string {
  const copy =
    localizedCopy[locale as FullyLocalizedPricingLocale] ??
    generatedPricingI18nCopy[locale as keyof typeof generatedPricingI18nCopy] ??
    localizedCopy.en;
  return copy.tiers[name] ?? name;
}

export function localizeModuleName(moduleId: string, locale: PricingLocale): string {
  const copy =
    localizedCopy[locale as FullyLocalizedPricingLocale] ??
    generatedPricingI18nCopy[locale as keyof typeof generatedPricingI18nCopy] ??
    localizedCopy.en;
  return copy.modules[moduleId] ?? moduleId;
}

export function localizeWatchtowerName(moduleId: string, locale: PricingLocale): string {
  const copy =
    localizedCopy[locale as FullyLocalizedPricingLocale] ??
    generatedPricingI18nCopy[locale as keyof typeof generatedPricingI18nCopy] ??
    localizedCopy.en;
  return copy.watchtower[moduleId] ?? moduleId;
}

export function localizeDiscountName(name: string, locale: PricingLocale): string {
  const copy =
    localizedCopy[locale as FullyLocalizedPricingLocale] ??
    generatedPricingI18nCopy[locale as keyof typeof generatedPricingI18nCopy] ??
    localizedCopy.en;
  const lowered = name.toLowerCase();

  if (lowered.includes('volume discount')) return copy.discounts.volume;
  if (lowered.includes('billing discount')) return copy.discounts.billing;
  if (lowered.includes('early adopter')) return copy.discounts.early;
  if (lowered.includes('negotiated discount')) return copy.discounts.negotiated;

  return name;
}

export function localizeBreakdownLabel(name: string, locale: PricingLocale): string {
  const copy =
    localizedCopy[locale as FullyLocalizedPricingLocale] ??
    generatedPricingI18nCopy[locale as keyof typeof generatedPricingI18nCopy] ??
    localizedCopy.en;
  const tierPrefix = Object.keys(copy.tiers).find((tierName) => name.startsWith(tierName));
  if (tierPrefix) {
    return name.replace(tierPrefix, copy.tiers[tierPrefix]);
  }

  const moduleEntry = Object.entries(localizedCopy.en.modules).find(([, moduleName]) => name === moduleName);
  if (moduleEntry) {
    return copy.modules[moduleEntry[0]] ?? name;
  }

  const watchtowerEntry = Object.entries(localizedCopy.en.watchtower).find(([, wtName]) => name === wtName);
  if (watchtowerEntry) {
    return copy.watchtower[watchtowerEntry[0]] ?? name;
  }

  if (name === 'Cross-Intelligence') {
    return locale === 'ar' ? 'Cross-Intelligence' : locale === 'fr' ? 'Cross-Intelligence' : locale === 'es' ? 'Cross-Intelligence' : name;
  }
  if (name === 'Cross-Intelligence Pro') {
    return locale === 'ar' ? 'Cross-Intelligence Pro' : locale === 'fr' ? 'Cross-Intelligence Pro' : locale === 'es' ? 'Cross-Intelligence Pro' : name;
  }

  return name;
}

export function getPricingPdfCopy(locale: PricingLocale) {
  return (
    localizedCopy[locale as FullyLocalizedPricingLocale] ??
    generatedPricingI18nCopy[locale as keyof typeof generatedPricingI18nCopy] ??
    localizedCopy.en
  ).pdf;
}

// Shared UI micro-copy (buttons, aria-labels) localized for ALL 22 locales. These were previously
// inline `{ en, ar, fr, es }` lookups scattered across components that silently fell back to English
// for the other 18 locales (and a hardcoded English theme-toggle aria-label for all 22). Centralized
// here so every surface stays transcreated.
const uiMicroCopy = {
  back: {
    en: 'Back', ar: 'رجوع', fr: 'Retour', es: 'Volver', de: 'Zurück', nl: 'Terug', pt: 'Voltar',
    hi: 'वापस', ur: 'واپس', it: 'Indietro', pl: 'Wstecz', tr: 'Geri', 'zh-Hans': '返回', ja: '戻る',
    ko: '뒤로', id: 'Kembali', vi: 'Quay lại', ro: 'Înapoi', sv: 'Tillbaka', bn: 'ফিরে যান', th: 'ย้อนกลับ', ms: 'Kembali',
  },
  perLocation: {
    en: 'Per location', ar: 'لكل موقع', fr: 'Par site', es: 'Por local', de: 'Pro Standort', nl: 'Per locatie',
    pt: 'Por local', hi: 'प्रति स्थान', ur: 'فی مقام', it: 'Per sede', pl: 'Za lokalizację', tr: 'Şube başına',
    'zh-Hans': '每家门店', ja: '店舗ごと', ko: '지점당', id: 'Per lokasi', vi: 'Mỗi địa điểm', ro: 'Per locație',
    sv: 'Per plats', bn: 'প্রতি স্থান', th: 'ต่อสาขา', ms: 'Setiap lokasi',
  },
  total: {
    en: 'Total', ar: 'الإجمالي', fr: 'Total', es: 'Total', de: 'Gesamt', nl: 'Totaal', pt: 'Total',
    hi: 'कुल', ur: 'کل', it: 'Totale', pl: 'Razem', tr: 'Toplam', 'zh-Hans': '总计', ja: '合計',
    ko: '합계', id: 'Total', vi: 'Tổng', ro: 'Total', sv: 'Totalt', bn: 'মোট', th: 'รวม', ms: 'Jumlah',
  },
  points: {
    en: 'points', ar: 'نقطة', fr: 'points', es: 'puntos', de: 'Punkte', nl: 'punten', pt: 'pontos',
    hi: 'अंक', ur: 'پوائنٹس', it: 'punti', pl: 'punkty', tr: 'puan', 'zh-Hans': '积分', ja: 'ポイント',
    ko: '포인트', id: 'poin', vi: 'điểm', ro: 'puncte', sv: 'poäng', bn: 'পয়েন্ট', th: 'คะแนน', ms: 'mata',
  },
  switchToLight: {
    en: 'Switch to light mode', ar: 'التبديل إلى الوضع الفاتح', fr: 'Passer en mode clair', es: 'Cambiar a modo claro',
    de: 'Zu hellem Modus wechseln', nl: 'Naar lichte modus', pt: 'Mudar para o modo claro', hi: 'लाइट मोड पर स्विच करें',
    ur: 'لائٹ موڈ پر جائیں', it: 'Passa alla modalità chiara', pl: 'Przełącz na tryb jasny', tr: 'Açık moda geç',
    'zh-Hans': '切换到浅色模式', ja: 'ライトモードに切り替え', ko: '라이트 모드로 전환', id: 'Beralih ke mode terang',
    vi: 'Chuyển sang chế độ sáng', ro: 'Comută la modul luminos', sv: 'Byt till ljust läge', bn: 'লাইট মোডে যান',
    th: 'สลับเป็นโหมดสว่าง', ms: 'Tukar ke mod cerah',
  },
  switchToDark: {
    en: 'Switch to dark mode', ar: 'التبديل إلى الوضع الداكن', fr: 'Passer en mode sombre', es: 'Cambiar a modo oscuro',
    de: 'Zu dunklem Modus wechseln', nl: 'Naar donkere modus', pt: 'Mudar para o modo escuro', hi: 'डार्क मोड पर स्विच करें',
    ur: 'ڈارک موڈ پر جائیں', it: 'Passa alla modalità scura', pl: 'Przełącz na tryb ciemny', tr: 'Koyu moda geç',
    'zh-Hans': '切换到深色模式', ja: 'ダークモードに切り替え', ko: '다크 모드로 전환', id: 'Beralih ke mode gelap',
    vi: 'Chuyển sang chế độ tối', ro: 'Comută la modul întunecat', sv: 'Byt till mörkt läge', bn: 'ডার্ক মোডে যান',
    th: 'สลับเป็นโหมดมืด', ms: 'Tukar ke mod gelap',
  },
} satisfies Record<string, Record<PricingLocale, string>>;

export type UiMicroKey = keyof typeof uiMicroCopy;

export function tMicro(locale: PricingLocale, key: UiMicroKey): string {
  const entry = uiMicroCopy[key] as Record<string, string>;
  return entry[locale] ?? entry.en;
}
