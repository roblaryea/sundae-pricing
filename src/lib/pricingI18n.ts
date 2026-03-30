export type PricingLocale = 'en' | 'ar' | 'fr' | 'es';

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
  };
};

const localizedCopy: Record<PricingLocale, LocaleCopy> = {
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
      'inventory': 'Inventory Intelligence',
      'purchasing': 'Purchasing Intelligence',
      'marketing': 'Marketing Performance',
      'reservations': 'Reservations Intelligence',
      'profit': 'Profit Intelligence',
      'revenue': 'Revenue Assurance',
      'delivery': 'Delivery Intelligence',
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
      'inventory': 'ذكاء المخزون',
      'purchasing': 'ذكاء المشتريات',
      'marketing': 'أداء التسويق',
      'reservations': 'ذكاء الحجوزات',
      'profit': 'ذكاء الربح',
      'revenue': 'ضمان الإيرادات',
      'delivery': 'ذكاء التوصيل',
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
      'labor': 'Intelligence RH',
      'inventory': 'Intelligence Stocks',
      'purchasing': 'Intelligence Achats',
      'marketing': 'Performance Marketing',
      'reservations': 'Intelligence Reservations',
      'profit': 'Intelligence Profit',
      'revenue': 'Assurance Revenus',
      'delivery': 'Intelligence Livraison',
      'guest': 'Experience Client',
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
      headerSubtitle: 'Decision Intelligence pour les restaurants',
      quoteLabel: 'Devis',
      generatedLabel: 'Genere',
      validUntilLabel: 'Valable jusqu au',
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
      theirCostLabel: 'Son cout',
      yourCostLabel: 'Votre cout',
      youSaveLabel: 'Vous economisez',
      verifiedLabel: 'Verifie',
      bestSavingsLabel: 'Meilleure economie',
      competitorDisclaimer: '* Les prix des concurrents sont bases sur des informations publiques et des estimations du secteur. Contactez les fournisseurs pour des devis exacts.',
      informationalOnlyLabel: 'Ce devis est fourni a titre informatif uniquement.',
      formalProposalLabel: 'contactez-nous pour une proposition formelle.',
      pageLabel: 'Page',
      ofLabel: 'sur',
      perYearLabel: 'an',
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
      'inventory': 'Inteligencia de inventario',
      'purchasing': 'Inteligencia de compras',
      'marketing': 'Rendimiento de marketing',
      'reservations': 'Inteligencia de reservas',
      'profit': 'Inteligencia de beneficio',
      'revenue': 'Aseguramiento de ingresos',
      'delivery': 'Inteligencia de delivery',
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
      headerSubtitle: 'Decision Intelligence para restaurantes',
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
      competitorDisclaimer: '* Los precios de la competencia se basan en informacion publica y estimaciones del sector. Contacta a los proveedores para obtener cotizaciones exactas.',
      informationalOnlyLabel: 'Esta cotizacion es solo para fines informativos.',
      formalProposalLabel: 'contactanos para una propuesta formal.',
      pageLabel: 'Pagina',
      ofLabel: 'de',
      perYearLabel: 'ano',
    },
  },
};

export function localizeTierName(name: string, locale: PricingLocale): string {
  const copy = localizedCopy[locale] ?? localizedCopy.en;
  return copy.tiers[name] ?? name;
}

export function localizeModuleName(moduleId: string, locale: PricingLocale): string {
  const copy = localizedCopy[locale] ?? localizedCopy.en;
  return copy.modules[moduleId] ?? moduleId;
}

export function localizeWatchtowerName(moduleId: string, locale: PricingLocale): string {
  const copy = localizedCopy[locale] ?? localizedCopy.en;
  return copy.watchtower[moduleId] ?? moduleId;
}

export function localizeDiscountName(name: string, locale: PricingLocale): string {
  const copy = localizedCopy[locale] ?? localizedCopy.en;
  const lowered = name.toLowerCase();

  if (lowered.includes('volume discount')) return copy.discounts.volume;
  if (lowered.includes('billing discount')) return copy.discounts.billing;
  if (lowered.includes('early adopter')) return copy.discounts.early;
  if (lowered.includes('negotiated discount')) return copy.discounts.negotiated;

  return name;
}

export function localizeBreakdownLabel(name: string, locale: PricingLocale): string {
  const copy = localizedCopy[locale] ?? localizedCopy.en;
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
  return (localizedCopy[locale] ?? localizedCopy.en).pdf;
}
