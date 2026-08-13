import type { FullyLocalizedPricingLocale, PricingLocale } from './locales'
import { generatedPricingUiCopy } from './generatedPricingLocalePacks'

export type PricingUiLocale = PricingLocale

export function formatMessage(template: string, values: Record<string, string | number>) {
  return Object.entries(values).reduce(
    (result, [key, value]) =>
      result.replaceAll(`\${${key}}`, String(value)).replaceAll(`{${key}}`, String(value)),
    template
  )
}

/**
 * CTL-13: this used to pick ONE pack wholesale with `??`. When the chosen pack
 * was shape-incomplete — which the checked-in generated packs routinely are,
 * because nothing in this repo regenerates them — every key it lacked resolved
 * to `undefined` and rendered blank, or threw on a nested read. That exact
 * failure took the whole simulator down in 18 locales via layerStackCopy.
 *
 * Resolving per FIELD over the English base makes that impossible: a pack that
 * is missing a key degrades to English for that key alone, which is all a
 * missing translation should ever cost. Adding a new copy key is now safe
 * before the generated packs catch up.
 */
function resolvePricingUiCopy<T extends Record<FullyLocalizedPricingLocale, unknown>>(
  copyByLocale: T,
  locale: PricingUiLocale,
  generatedCopyByLocale?: Partial<Record<PricingLocale, unknown>>,
): T[FullyLocalizedPricingLocale] {
  const base = copyByLocale.en as Record<string, unknown>
  const pack = (copyByLocale[locale as FullyLocalizedPricingLocale] ??
    generatedCopyByLocale?.[locale]) as Record<string, unknown> | undefined
  if (!pack) return copyByLocale.en as T[FullyLocalizedPricingLocale]
  if (pack === base) return copyByLocale.en as T[FullyLocalizedPricingLocale]

  // Not every copy group is an object. Several are flat per-locale STRINGS —
  // `annualAmountTemplates` is `{ en: '${amount} annually', fr: '...' }`.
  // Field-merging one spreads the string into an object of character indices,
  // and the caller then invokes `.replaceAll` on that object. English escaped
  // through the identity check above, so this crashed the quote screen to the
  // error boundary in all 21 translated locales while looking fine in dev.
  // A non-object pack has no fields to merge: return it as it is.
  if (typeof pack !== 'object' || pack === null || Array.isArray(pack)) {
    return pack as T[FullyLocalizedPricingLocale]
  }
  if (typeof base !== 'object' || base === null || Array.isArray(base)) {
    return pack as T[FullyLocalizedPricingLocale]
  }

  const merged: Record<string, unknown> = { ...base }
  for (const key of Object.keys(base)) {
    const value = pack[key]
    if (value === undefined || value === null) continue
    // Nested objects (e.g. categoryLabels) merge one level so a partial group
    // cannot blank out the labels it does define.
    if (
      typeof value === 'object' &&
      !Array.isArray(value) &&
      typeof base[key] === 'object' &&
      base[key] !== null &&
      !Array.isArray(base[key])
    ) {
      merged[key] = { ...(base[key] as object), ...(value as object) }
      continue
    }
    if (Array.isArray(value) && value.length === 0) continue
    if (typeof value === 'string' && value.length === 0) continue
    merged[key] = value
  }
  return merged as T[FullyLocalizedPricingLocale]
}

const locationSliderCopy = {
  en: {
    title: 'How Many Locations?',
    subtitle: 'Slide to configure your portfolio size. Pricing scales efficiently.',
    preciseCount: 'For precise counts, click the number above or type here:',
    preciseCountEnterprise: 'Enterprise tier requires {min}+ locations. Type precise count here:',
    minimum: 'Minimum: {min} locations for Enterprise tier',
    totalMonthly: 'Total Monthly',
    annualSuffix: '/year',
    perLocation: 'Per Location',
    avgPerLocation: 'Avg · per location',
    saveVsSingle: 'Save {percent}% vs single',
    bestValueAtScale: 'Best value at scale',
    enterpriseQualified:
      'With {locations} locations, you qualify for Enterprise pricing with dedicated support.',
    volumeDiscountTitle: 'Volume Discount Active',
    volumeDiscountBody: 'You are getting enterprise pricing benefits with {locations} locations',
    portfolioUnlockedTitle: 'Portfolio Management Unlocked',
    portfolioUnlockedBody: 'Compare performance across all {locations} locations in one view',
    back: 'Back',
    continueToModules: 'Continue to Modules',
    continueToSummary: 'Continue to Summary',
    scale: {
      independent: 'Independent',
      smallPortfolio: 'Small Portfolio',
      growthStage: 'Growth Stage',
      enterprise: 'Enterprise',
      regionalChain: 'Regional Chain',
      majorChain: 'Major Chain',
      nationalScale: 'National Scale',
    },
  },
  ar: {
    title: 'كم عدد المواقع؟',
    subtitle: 'حرّك المؤشر لتحديد حجم محفظتك. يتدرج التسعير بكفاءة مع النمو.',
    preciseCount: 'لإدخال عدد دقيق، اضغط على الرقم أعلاه أو اكتب هنا:',
    preciseCountEnterprise: 'فئة Enterprise تتطلب {min}+ موقعاً. اكتب العدد الدقيق هنا:',
    minimum: 'الحد الأدنى: {min} موقعاً لفئة Enterprise',
    totalMonthly: 'الإجمالي الشهري',
    annualSuffix: '/سنوياً',
    perLocation: 'لكل موقع',
    avgPerLocation: 'المتوسط · لكل موقع',
    saveVsSingle: 'وفّر {percent}% مقابل موقع واحد',
    bestValueAtScale: 'أفضل قيمة عند التوسع',
    enterpriseQualified:
      'مع {locations} موقعاً، أنت مؤهل لتسعير Enterprise مع دعم مخصص.',
    volumeDiscountTitle: 'خصم الحجم مفعل',
    volumeDiscountBody: 'أنت تحصل على مزايا تسعير Enterprise مع {locations} موقعاً',
    portfolioUnlockedTitle: 'تم فتح إدارة المحفظة',
    portfolioUnlockedBody: 'قارن الأداء عبر جميع المواقع وعددها {locations} في عرض واحد',
    back: 'رجوع',
    continueToModules: 'المتابعة إلى الوحدات',
    continueToSummary: 'المتابعة إلى الملخص',
    scale: {
      independent: 'مستقل',
      smallPortfolio: 'محفظة صغيرة',
      growthStage: 'مرحلة النمو',
      enterprise: 'مؤسسي',
      regionalChain: 'سلسلة إقليمية',
      majorChain: 'سلسلة كبيرة',
      nationalScale: 'نطاق وطني',
    },
  },
  fr: {
    title: 'Combien de sites ?',
    subtitle: 'Faites glisser le curseur pour configurer la taille de votre portefeuille. Le tarif évolue efficacement avec votre échelle.',
    preciseCount: 'Pour saisir un nombre précis, cliquez sur le chiffre ci-dessus ou renseignez-le ici :',
    preciseCountEnterprise: 'La formule Enterprise exige {min}+ sites. Saisissez le nombre exact ici :',
    minimum: 'Minimum : {min} sites pour la formule Enterprise',
    totalMonthly: 'Total mensuel',
    annualSuffix: '/an',
    perLocation: 'Par site',
    avgPerLocation: 'Moy. · par site',
    saveVsSingle: 'Économisez {percent}% par rapport à un site unique',
    bestValueAtScale: 'Meilleure valeur à grande échelle',
    enterpriseQualified:
      'Avec {locations} sites, vous êtes éligible à la tarification Enterprise avec accompagnement dédié.',
    volumeDiscountTitle: 'Remise volume active',
    volumeDiscountBody:
      'Vous profitez des avantages tarifaires Enterprise avec {locations} sites',
    portfolioUnlockedTitle: 'Gestion de portefeuille débloquée',
    portfolioUnlockedBody:
      'Comparez la performance de vos {locations} sites dans une seule vue',
    back: 'Retour',
    continueToModules: 'Continuer vers les modules',
    continueToSummary: 'Continuer vers le resume',
    scale: {
      independent: 'Indépendant',
      smallPortfolio: 'Petit portefeuille',
      growthStage: 'Phase de croissance',
      enterprise: 'Enterprise',
      regionalChain: 'Chaîne régionale',
      majorChain: 'Grande chaîne',
      nationalScale: 'Échelle nationale',
    },
  },
  es: {
    title: '¿Cuántos locales?',
    subtitle: 'Desliza para configurar el tamaño de tu cartera. El precio escala con eficiencia.',
    preciseCount: 'Para cantidades exactas, haz clic en el número de arriba o escríbelo aquí:',
    preciseCountEnterprise: 'El plan Enterprise requiere {min}+ locales. Escribe aquí la cantidad exacta:',
    minimum: 'Mínimo: {min} locales para el plan Enterprise',
    totalMonthly: 'Total mensual',
    annualSuffix: '/año',
    perLocation: 'Por local',
    avgPerLocation: 'Prom. · por local',
    saveVsSingle: 'Ahorra {percent}% vs un solo local',
    bestValueAtScale: 'Mejor valor a escala',
    enterpriseQualified:
      'Con {locations} locales, calificas para precios Enterprise con soporte dedicado.',
    volumeDiscountTitle: 'Descuento por volumen activo',
    volumeDiscountBody:
      'Estas obteniendo ventajas de precio Enterprise con {locations} locales',
    portfolioUnlockedTitle: 'Gestion de cartera desbloqueada',
    portfolioUnlockedBody:
      'Compara el rendimiento de tus {locations} locales en una sola vista',
    back: 'Volver',
    continueToModules: 'Continuar a los módulos',
    continueToSummary: 'Continuar al resumen',
    scale: {
      independent: 'Independiente',
      smallPortfolio: 'Cartera pequena',
      growthStage: 'Etapa de crecimiento',
      enterprise: 'Enterprise',
      regionalChain: 'Cadena regional',
      majorChain: 'Cadena grande',
      nationalScale: 'Escala nacional',
    },
  },
} as const satisfies Record<FullyLocalizedPricingLocale, object>

const liveCalculatorCopy = {
  en: {
    monthlyTotal: 'Monthly Total',
    perLocation: 'Per Location',
    avgPerLocation: 'Avg · per location',
    saveVs: 'Save {percent}% vs {competitor}',
    expandAria: 'Expand price calculator',
    minimizeAria: 'Minimize price calculator',
    perMonthShort: '/mo',
  },
  ar: {
    monthlyTotal: 'الإجمالي الشهري',
    perLocation: 'لكل موقع',
    avgPerLocation: 'المتوسط · لكل موقع',
    saveVs: 'وفّر {percent}% مقابل {competitor}',
    expandAria: 'توسيع حاسبة الأسعار',
    minimizeAria: 'تصغير حاسبة الأسعار',
    perMonthShort: '/شهرياً',
  },
  fr: {
    monthlyTotal: 'Total mensuel',
    perLocation: 'Par site',
    avgPerLocation: 'Moy. · par site',
    saveVs: 'Économisez {percent}% par rapport à {competitor}',
    expandAria: 'Développer le calculateur de prix',
    minimizeAria: 'Réduire le calculateur de prix',
    perMonthShort: '/mois',
  },
  es: {
    monthlyTotal: 'Total mensual',
    perLocation: 'Por local',
    avgPerLocation: 'Prom. · por local',
    saveVs: 'Ahorra {percent}% vs {competitor}',
    expandAria: 'Expandir calculadora de precios',
    minimizeAria: 'Minimizar calculadora de precios',
    perMonthShort: '/mes',
  },
} as const satisfies Record<FullyLocalizedPricingLocale, object>

const roiCopy = {
  en: {
    title: 'Calculate Your ROI',
    subtitle: 'Build a funding case from operational recovery and validated cost avoidance',
    businessTitle: 'Tell us about your business',
    monthlyRevenuePerLocation: 'Monthly Revenue per Location',
    currentLaborCost: 'Current Labor Cost %',
    currentFoodCost: 'Current Food Cost %',
    monthlyMarketingSpend: 'Monthly Marketing Spend per Location',
    addMarketingSpend: 'Add marketing spend to see Marketing Efficiency savings',
    deliveryRevenuePct: 'Delivery Revenue %',
    addDeliveryMix: 'Add delivery mix % to see Delivery Margin Protection savings',
    reviewData: 'Do you have review/NPS data to connect?',
    yes: 'Yes',
    no: 'No',
    projectedReturns: 'Your Projected Returns',
    monthlySavings: 'Monthly Savings',
    annualSavings: 'Annual Savings',
    roiMultiple: 'ROI Multiple',
    paybackPeriod: 'Payback Period',
    days: '{count} days',
    savingsBreakdown: 'Savings Breakdown',
    savingsNote:
      'Operational lines use illustrative midpoints within the disclosed planning ranges. Actual results depend on baseline conditions and execution.',
    noModulesSelected: 'No Modules Selected',
    noModulesBody: 'Add modules to your stack to see projected ROI savings.',
    biggestWins: 'Your Biggest Wins',
    biggestWinsBody: 'Focus on {categories} for maximum impact',
    monthlyPlatformCost: 'Monthly Platform Cost',
    paysForItselfIn: 'Pays for itself in',
    noPaybackAtTheseInputs: 'Not at these inputs',
    roiBasisNote: 'Return is modelled on your Core package only. {excluded}/mo of Watchtower, add-ons and Crew is in your quote but earns no savings line here.',
    netMonthlyBenefit: 'Net Monthly Benefit',
    viewSummary: 'View Summary',
    rangeLabel: 'Range',
    perMonthShort: '/mo',
    potentialUpside: 'Potential upside (not counted in totals)',
    assumptionLabels: {
      labor: 'Labor Optimization',
      inventory: 'Food Cost Reduction',
      purchasing: 'Purchasing Savings',
      reservations: 'Table Utilization',
      marketing: 'Marketing Efficiency',
      profit: 'Profit Intelligence Measurement',
      revenue: 'Revenue Leakage Recovery',
      delivery: 'Delivery Margin Protection',
      guest: 'Reputation & Retention Lift',
    },
    tooltips: {
      labor:
        'Models 1-3% of labour cost through scheduling and productivity improvements',
      inventory:
        'Models 0.5-2% of food cost through waste and recipe controls',
      purchasing:
        'Models 2-5% of purchasing spend; food cost is the planning proxy until purchasing spend is supplied',
      reservations:
        'Revenue uplift of 0.5-2.0% through improved table utilization. Assumes demand exists.',
      marketing:
        'Improves marketing efficiency by 5-15% of marketing spend through better attribution and targeting',
      profit:
        'Measures and attributes the recovery lines above; no separate uplift is added to avoid double counting.',
      revenue:
        'Recovers 0.05-0.25% of revenue from voids, comps, and discount leakage. Depends on baseline leakage.',
      delivery:
        'Saves 0.2-0.8% of delivery revenue through commission optimization and pricing parity',
      guest:
        'Qualitative benefit from improved reviews and guest satisfaction. Conservative estimate unless review data is connected.',
    },
    missingInput: {
      marketing: 'Add marketing spend to estimate savings',
      delivery: 'Add delivery mix % to estimate savings',
      guest: 'Potential upside (not counted in totals)',
    },
    roiDescriptions: {
      strong:
        'Modelled at these inputs: {roi}x return, {weeks}-week payback.',
      solid: 'Modelled at these inputs: {roi}x return, {weeks}-week payback.',
      positive: 'Modelled positive return at these inputs.',
      value: 'Value builds as you optimize operations over time.',
      longTerm: 'At these inputs this configuration does not pay for itself. A smaller package may fit better.',
    },
  },
  ar: {
    title: 'احسب العائد على الاستثمار',
    subtitle: 'اعرف مدى سرعة تغطية Sundae لتكلفتها عبر الوفورات التشغيلية',
    businessTitle: 'أخبرنا عن نشاطك',
    monthlyRevenuePerLocation: 'الإيراد الشهري لكل موقع',
    currentLaborCost: 'نسبة تكلفة العمالة الحالية',
    currentFoodCost: 'نسبة تكلفة الطعام الحالية',
    monthlyMarketingSpend: 'الإنفاق التسويقي الشهري لكل موقع',
    addMarketingSpend: 'أضف إنفاق التسويق لرؤية وفورات كفاءة التسويق',
    deliveryRevenuePct: 'نسبة إيرادات التوصيل',
    addDeliveryMix: 'أضف نسبة التوصيل لرؤية وفورات حماية هامش التوصيل',
    reviewData: 'هل لديك بيانات مراجعات/NPS لربطها؟',
    yes: 'نعم',
    no: 'لا',
    projectedReturns: 'العائدات المتوقعة',
    monthlySavings: 'الوفورات الشهرية',
    annualSavings: 'الوفورات السنوية',
    roiMultiple: 'مضاعف العائد',
    paybackPeriod: 'فترة الاسترداد',
    days: '{count} يوماً',
    savingsBreakdown: 'تفصيل الوفورات',
    savingsNote:
      'تعتمد التقديرات على افتراضات وسطية محافظة. مرر فوق كل سطر لرؤية نطاق التقدير. النتائج الفعلية تعتمد على التنفيذ وخط الأساس لديك.',
    noModulesSelected: 'لم يتم اختيار وحدات',
    noModulesBody: 'أضف وحدات إلى حزمتك لرؤية وفورات العائد المتوقعة.',
    biggestWins: 'أكبر فرصك',
    biggestWinsBody: 'ركز على {categories} لتحقيق أكبر أثر',
    monthlyPlatformCost: 'التكلفة الشهرية للمنصة',
    paysForItselfIn: 'تغطي تكلفتها خلال',
    noPaybackAtTheseInputs: 'ليس عند هذه المدخلات',
    roiBasisNote: 'يُحتسب العائد على باقة Core وحدها. مبلغ {excluded} شهريًا من Watchtower والإضافات وCrew مدرج في عرض السعر لكنه لا يُحتسب ضمن الوفورات هنا.',
    netMonthlyBenefit: 'صافي الفائدة الشهرية',
    viewSummary: 'عرض الملخص',
    rangeLabel: 'النطاق',
    perMonthShort: '/شهرياً',
    potentialUpside: 'فرصة محتملة إضافية (غير محتسبة في الإجمالي)',
    assumptionLabels: {
      labor: 'تحسين العمالة',
      inventory: 'خفض تكلفة الطعام',
      purchasing: 'توفير المشتريات',
      reservations: 'استغلال الطاولات',
      marketing: 'كفاءة التسويق',
      profit: 'رفع ذكاء الربحية',
      revenue: 'استرداد تسرب الإيرادات',
      delivery: 'حماية هامش التوصيل',
      guest: 'تحسين السمعة والاحتفاظ',
    },
    tooltips: {
      labor:
        'يقدّر 1-3% من قاعدة تكلفة العمالة عبر تحسين الجدولة والإنتاجية',
      inventory:
        'يقدّر 0.5-2% من قاعدة تكلفة الطعام عبر الحد من الهدر وضبط الوصفات',
      purchasing:
        'يقدّر 2-5% من إنفاق المشتريات؛ تُستخدم تكلفة الطعام كبديل تخطيطي حتى إدخال إنفاق المشتريات',
      reservations:
        'يرفع الإيرادات بنسبة 0.5-2.0% عبر تحسين استغلال الطاولات. يفترض وجود طلب.',
      marketing:
        'يحسن كفاءة التسويق بنسبة 5-15% من الإنفاق التسويقي عبر إسناد أفضل واستهداف أدق',
      profit:
        'يقيس وينسب بنود الاسترداد أعلاه؛ لا تُضاف زيادة منفصلة لتجنب الاحتساب المزدوج.',
      revenue:
        'يسترد 0.05-0.25% من الإيرادات من الإلغاءات والتعويضات وتسرب الخصومات بحسب خط الأساس.',
      delivery:
        'يوفر 0.2-0.8% من إيرادات التوصيل عبر تحسين العمولات وتكافؤ التسعير',
      guest:
        'فائدة نوعية من تحسين المراجعات ورضا الضيوف. يظل التقدير محافظاً ما لم يتم ربط بيانات المراجعات.',
    },
    missingInput: {
      marketing: 'أضف إنفاق التسويق لتقدير الوفورات',
      delivery: 'أضف نسبة التوصيل لتقدير الوفورات',
      guest: 'فرصة محتملة إضافية (غير محتسبة في الإجمالي)',
    },
    roiDescriptions: {
      strong: 'إمكانات عائد قوية: عائد {roi}x مع فترة استرداد {weeks} أسابيع.',
      solid: 'عائد قوي بمضاعف {roi}x وفترة استرداد {weeks} أسابيع.',
      positive: 'عائد إيجابي مع أثر ملموس على عملياتك.',
      value: 'تزداد القيمة مع تحسين العمليات بمرور الوقت.',
      longTerm: 'بهذه المدخلات لا تغطي هذه التهيئة تكلفتها. قد تكون باقة أصغر أنسب لك.',
    },
  },
  fr: {
    title: 'Calculez votre ROI',
    subtitle:
      "Voyez à quelle vitesse Sundae s'amortit grâce aux gains opérationnels",
    businessTitle: 'Parlez-nous de votre activité',
    monthlyRevenuePerLocation: 'Revenu mensuel par site',
    currentLaborCost: 'Coût du travail actuel %',
    currentFoodCost: 'Coût alimentaire actuel %',
    monthlyMarketingSpend: 'Dépense marketing mensuelle par site',
    addMarketingSpend:
      "Ajoutez une dépense marketing pour estimer les gains d'efficacité marketing",
    deliveryRevenuePct: 'Part du revenu delivery %',
    addDeliveryMix:
      'Ajoutez la part delivery pour estimer les gains de marge delivery',
    reviewData: 'Disposez-vous de données avis/NPS à connecter ?',
    yes: 'Oui',
    no: 'Non',
    projectedReturns: 'Vos retours projetés',
    monthlySavings: 'Économies mensuelles',
    annualSavings: 'Économies annuelles',
    roiMultiple: 'Multiple ROI',
    paybackPeriod: 'Durée de retour',
    days: '{count} jours',
    savingsBreakdown: 'Détail des économies',
    savingsNote:
      "Les estimations utilisent des hypothèses médianes prudentes. Survolez chaque ligne pour voir la fourchette. Les résultats réels dépendent de l'exécution et de votre point de départ.",
    noModulesSelected: 'Aucun module sélectionné',
    noModulesBody:
      'Ajoutez des modules à votre configuration pour voir les économies de ROI projetées.',
    biggestWins: 'Vos plus gros leviers',
    biggestWinsBody: 'Concentrez-vous sur {categories} pour un impact maximal',
    monthlyPlatformCost: 'Coût mensuel de la plateforme',
    paysForItselfIn: "S'amortit en",
    noPaybackAtTheseInputs: 'Pas avec ces valeurs',
    roiBasisNote: 'Le retour est modélisé sur votre forfait Core uniquement. Les {excluded}/mois de Watchtower, options et Crew figurent dans votre devis mais ne génèrent aucune ligne d\'économies ici.',
    netMonthlyBenefit: 'Bénéfice mensuel net',
    viewSummary: 'Voir le résumé',
    rangeLabel: 'Fourchette',
    perMonthShort: '/mois',
    potentialUpside: 'Potentiel supplémentaire (non compté dans les totaux)',
    assumptionLabels: {
      labor: 'Optimisation du travail',
      inventory: 'Réduction du coût alimentaire',
      purchasing: 'Économies achats',
      reservations: 'Utilisation des tables',
      marketing: 'Efficacité marketing',
      profit: 'Gain Profit Intelligence',
      revenue: 'Récupération des fuites de revenu',
      delivery: 'Protection de marge delivery',
      guest: 'Réputation et rétention',
    },
    tooltips: {
      labor:
        "Modélise 1 à 3 % de la masse salariale grâce à un meilleur planning et à des gains de productivité",
      inventory:
        "Modélise 0,5 à 2 % du coût alimentaire grâce à la baisse du gaspillage et au contrôle des recettes",
      purchasing:
        "Modélise 2 à 5 % des achats ; le coût alimentaire sert de proxy jusqu'à la saisie des dépenses d'achat",
      reservations:
        "Génère 0,5-2,0% de revenu supplémentaire grâce à une meilleure utilisation des tables. Suppose qu'il existe une demande.",
      marketing:
        "Améliore l'efficacité marketing de 5-15% de la dépense marketing grâce à une meilleure attribution et un meilleur ciblage",
      profit:
        "Mesure et attribue les leviers de récupération ci-dessus ; aucun gain distinct n'est ajouté afin d'éviter le double comptage.",
      revenue:
        "Récupère 0,05-0,25% du chiffre d'affaires sur les annulations, gestes commerciaux et remises. Dépend de la fuite initiale.",
      delivery:
        "Économise 0,2-0,8% du revenu delivery grâce à l'optimisation des commissions et de la parité prix",
      guest:
        "Bénéfice qualitatif issu de meilleurs avis et d'une meilleure satisfaction client. Estimation prudente sans données d'avis connectées.",
    },
    missingInput: {
      marketing: 'Ajoutez une dépense marketing pour estimer les gains',
      delivery: 'Ajoutez la part delivery pour estimer les gains',
      guest: 'Potentiel supplémentaire (non compté dans les totaux)',
    },
    roiDescriptions: {
      strong:
        'Fort potentiel de ROI : retour de {roi}x avec un amortissement en {weeks} semaines.',
      solid: 'Retours solides avec {roi}x de ROI et {weeks} semaines de retour.',
      positive: 'ROI positif avec un impact mesurable sur vos operations.',
      value: 'La valeur augmente a mesure que vous optimisez vos operations.',
      longTerm: 'Avec ces hypothèses, cette configuration ne se rembourse pas. Un forfait plus petit conviendrait mieux.',
    },
  },
  es: {
    title: 'Calcula tu ROI',
    subtitle:
      'Comprueba que tan rapido Sundae se paga solo gracias al ahorro operativo',
    businessTitle: 'Cuentanos sobre tu negocio',
    monthlyRevenuePerLocation: 'Ingresos mensuales por local',
    currentLaborCost: 'Costo laboral actual %',
    currentFoodCost: 'Costo de alimentos actual %',
    monthlyMarketingSpend: 'Gasto mensual de marketing por local',
    addMarketingSpend:
      'Agrega gasto de marketing para estimar el ahorro de eficiencia de marketing',
    deliveryRevenuePct: 'Porcentaje de ingresos de delivery',
    addDeliveryMix:
      'Agrega el mix de delivery para estimar el ahorro de margen de delivery',
    reviewData: '¿Tienes datos de reseñas/NPS para conectar?',
    yes: 'Sí',
    no: 'No',
    projectedReturns: 'Tus retornos proyectados',
    monthlySavings: 'Ahorro mensual',
    annualSavings: 'Ahorro anual',
    roiMultiple: 'Múltiplo ROI',
    paybackPeriod: 'Periodo de recuperación',
    days: '{count} días',
    savingsBreakdown: 'Desglose de ahorro',
    savingsNote:
      'Las estimaciones usan supuestos de punto medio conservadores. Pasa el cursor por cada línea para ver el rango. Los resultados reales dependen de la ejecución y de tus métricas base.',
    noModulesSelected: 'No hay módulos seleccionados',
    noModulesBody:
      'Agrega módulos a tu stack para ver el ahorro de ROI proyectado.',
    biggestWins: 'Tus mayores oportunidades',
    biggestWinsBody: 'Enfócate en {categories} para lograr el mayor impacto',
    monthlyPlatformCost: 'Costo mensual de la plataforma',
    paysForItselfIn: 'Se paga solo en',
    noPaybackAtTheseInputs: 'No con estos valores',
    roiBasisNote: 'El retorno se modela solo sobre tu paquete Core. Los {excluded}/mes de Watchtower, complementos y Crew están en tu presupuesto pero no generan ahorro aquí.',
    netMonthlyBenefit: 'Beneficio mensual neto',
    viewSummary: 'Ver resumen',
    rangeLabel: 'Rango',
    perMonthShort: '/mes',
    potentialUpside: 'Potencial adicional (no contado en los totales)',
    assumptionLabels: {
      labor: 'Optimización laboral',
      inventory: 'Reducción del costo de alimentos',
      purchasing: 'Ahorro en compras',
      reservations: 'Utilización de mesas',
      marketing: 'Eficiencia de marketing',
      profit: 'Mejora de Profit Intelligence',
      revenue: 'Recuperación de fuga de ingresos',
      delivery: 'Protección del margen de delivery',
      guest: 'Reputación y retención',
    },
    tooltips: {
      labor:
        'Modela entre el 1% y el 3% de la base de costo laboral mediante mejor programación y productividad',
      inventory:
        'Modela entre el 0,5% y el 2% de la base de costo de alimentos mediante menor desperdicio y control de recetas',
      purchasing:
        'Modela entre el 2% y el 5% del gasto de compras; usa el costo de alimentos como referencia hasta que se indique ese gasto',
      reservations:
        'Aumenta los ingresos 0,5-2,0% gracias a una mejor utilización de mesas. Supone demanda existente.',
      marketing:
        'Mejora la eficiencia de marketing entre 5% y 15% del gasto gracias a mejor atribución y segmentación',
      profit:
        'Mide y atribuye las líneas de recuperación anteriores; no añade otra mejora para evitar el doble conteo.',
      revenue:
        'Recupera 0,05-0,25% de los ingresos por voids, comps y fugas de descuentos. Depende del nivel de fuga actual.',
      delivery:
        'Ahorra 0,2-0,8% de los ingresos de delivery mediante optimización de comisiones y paridad de precios',
      guest:
        'Beneficio cualitativo por mejores reseñas y satisfacción del cliente. Estimación conservadora salvo que conectes datos de reseñas.',
    },
    missingInput: {
      marketing: 'Agrega gasto de marketing para estimar el ahorro',
      delivery: 'Agrega el mix de delivery para estimar el ahorro',
      guest: 'Potencial adicional (no contado en los totales)',
    },
    roiDescriptions: {
      strong:
        'Fuerte potencial de ROI: retorno de {roi}x con recuperación en {weeks} semanas.',
      solid: 'Retornos sólidos con {roi}x de ROI y recuperación en {weeks} semanas.',
      positive: 'ROI positivo con impacto medible en tus operaciones.',
      value: 'El valor crece a medida que optimizas tus operaciones.',
      longTerm: 'Con estos datos, esta configuración no se paga sola. Un paquete más pequeño puede encajar mejor.',
    },
  },
} as const satisfies Record<FullyLocalizedPricingLocale, object>

const competitorCompareCopy = {
  en: {
    title: 'How You Compare',
    hideAssumptions: 'Hide assumptions',
    viewAssumptions: 'View assumptions',
    assumptionsTitle: 'Pricing Sources & Assumptions:',
    competitorPricingMayVary:
      'Competitor pricing may vary. Contact vendors for exact quotes.',
    bestSavingsOpportunity: 'Best Savings Opportunity',
    firstYear: 'first year',
    notePointSolutions:
      'Note: Some point solutions may be cheaper if you only need specific features',
    crewCompareOutcomeTitle: 'Compare the outcome, not a partial rate',
    crewCompareOutcomeBody:
      'Your Sundae quote delivers {scope} on one workforce operating layer. The published rates below price only part of that selected scope.',
    crewComparePayrollProof:
      'Crew Pay is native Sundae payroll across 36 supported countries, not a single-market add-on.',
    crewCompareUnpricedGap:
      'A full rival total cannot be calculated from public rates without employee count, country coverage, paid add-ons, integrations, and the operating cost of multiple systems. The figures below are entry-price references, not product-parity savings.',
    coreCompareOutcomeBody:
      'Your Sundae quote delivers {count} connected outcome domains on one decision layer: {scope}. Lower published rates below cover only part of that selected outcome set.',
    coreCompareUnpricedGap:
      'A lower point-solution rate is not a like-for-like alternative until the missing domains, data integration, build effort, and operating cost of multiple systems are priced.',
    notLikeForLike: 'Not like-for-like',
    partialScopeAnnualRate: 'partial-scope annual rate',
    vendorRateDoesNotPriceScope: 'This vendor rate does not price your full selected scope',
    yourSelectedCrewScope: 'Your selected Sundae Crew scope: {scope}.',
    yourSelectedCoreScope: 'Your selected Sundae Core scope: {scope}.',
    fullScopeQuoteRequired:
      'Treat the difference as an unpriced scope gap—not a saving—until the vendor prices the missing modules, employee-based charges, integrations, and required country coverage.',
    coreFullScopeQuoteRequired:
      'Treat the difference as an unpriced scope gap—not a saving—until the missing outcome domains, required data integration, and any build or companion-system costs are priced.',
    disclosedPartialScopeGap: 'Disclosed partial-scope gap',
    bestSavings: 'Best savings',
    saveVsCompetitor: 'Save ${amount}',
    competitorFirstYear: '{name} First Year',
    sundaeFirstYear: 'Sundae First Year',
    noSetupFees: 'No setup fees',
    missingOffer: "What {name} doesn't offer:",
    viewPricing: 'View {name} pricing ->',
    ongoingAnnualSavings: 'Ongoing annual savings',
    alsoEvaluated: 'Also evaluated — price on application',
    alsoEvaluatedBasis: 'These vendors publish no rate card, so we do not quote one. What they cover is shown instead.',
    cheaperPerYear: 'cheaper per year',
    competitorCostsLess: '{name} costs less per year',
    dayOneLabel: 'Working on day one',
    dayOneDomains: '{count} of your {total} domains',
    buildFirst: 'after a {amount} build',
    cannotBuyLabel: 'Not available from {name} at any price',
    firstYearSavings: 'First-year savings',
    vsName: 'vs {name}',
    plusMore: '+{count} more',
    verified: 'Verified',
    estimated: 'Estimated',
    unverified: 'Unverified',
    categoryLabels: {
      'AI restaurant operations': 'AI restaurant operations',
      'Build-your-own with Microsoft BI': 'Build-your-own with Microsoft BI',
      'Excel / Google Sheets': 'Excel / Google Sheets',
      'Inventory & purchasing': 'Inventory & purchasing',
      'Labor & scheduling': 'Labor & scheduling',
      'Restaurant ERP & accounting': 'Restaurant ERP & accounting',
      'Restaurant analytics platform': 'Restaurant analytics platform',
      'generic-bi': 'Generic BI',
      nothing: 'No direct match',
      'pos-native': 'POS-native analytics',
      'restaurant-bi': 'Restaurant BI',
      spreadsheets: 'Spreadsheets',
    },
  },
  ar: {
    title: 'كيف تقارن',
    hideAssumptions: 'إخفاء الافتراضات',
    viewAssumptions: 'عرض الافتراضات',
    assumptionsTitle: 'مصادر التسعير والافتراضات:',
    competitorPricingMayVary:
      'قد تختلف أسعار المنافسين. تواصل مع الموردين للحصول على عروض دقيقة.',
    bestSavingsOpportunity: 'أفضل فرصة للتوفير',
    firstYear: 'السنة الأولى',
    notePointSolutions:
      'ملاحظة: قد تكون بعض الحلول المتخصصة أرخص إذا كنت تحتاج مزايا محددة فقط',
    crewCompareOutcomeTitle: 'قارن النتيجة، لا سعرًا جزئيًا',
    crewCompareOutcomeBody:
      'يشمل عرض Sundae الخاص بك {scope} ضمن طبقة تشغيل واحدة للقوى العاملة. الأسعار المنشورة أدناه تغطي جزءًا فقط من هذا النطاق.',
    crewComparePayrollProof:
      'Crew Pay هو نظام رواتب أصلي من Sundae عبر 36 دولة مدعومة، وليس إضافة لسوق واحد.',
    crewCompareUnpricedGap:
      'لا يمكن حساب إجمالي منافس مماثل من الأسعار العامة دون عدد الموظفين وتغطية الدول والإضافات المدفوعة والتكاملات وتكلفة تشغيل أنظمة متعددة. الأرقام أدناه مراجع لسعر الدخول وليست وفورات على منتج مماثل.',
    coreCompareOutcomeBody:
      'يشمل عرض Sundae الخاص بك {count} مجالات نتائج مترابطة ضمن طبقة قرار واحدة: {scope}. الأسعار الأقل أدناه تغطي جزءًا فقط من هذه النتائج.',
    coreCompareUnpricedGap:
      'سعر الحل الجزئي الأقل ليس بديلًا مماثلًا حتى تُسعّر المجالات الناقصة وتكامل البيانات وأعمال البناء وتكلفة تشغيل أنظمة متعددة.',
    notLikeForLike: 'ليست مقارنة مماثلة',
    partialScopeAnnualRate: 'سعر سنوي لنطاق جزئي',
    vendorRateDoesNotPriceScope: 'هذا السعر لا يغطي كامل النطاق الذي اخترته',
    yourSelectedCrewScope: 'نطاق Sundae Crew المختار: {scope}.',
    yourSelectedCoreScope: 'نطاق Sundae Core المختار: {scope}.',
    fullScopeQuoteRequired:
      'تعامل مع الفرق كنطاق غير مسعّر، وليس كتوفير، حتى يضيف المورد الوحدات الناقصة ورسوم الموظفين والتكاملات وتغطية الدول المطلوبة.',
    coreFullScopeQuoteRequired:
      'تعامل مع الفرق كنطاق غير مسعّر، وليس كتوفير، حتى تُسعّر مجالات النتائج الناقصة وتكامل البيانات وأعمال البناء أو الأنظمة المساندة.',
    disclosedPartialScopeGap: 'فجوة نطاق جزئي معلنة',
    bestSavings: 'أفضل توفير',
    saveVsCompetitor: 'وفّر ${amount}',
    competitorFirstYear: 'تكلفة {name} في السنة الأولى',
    sundaeFirstYear: 'تكلفة Sundae في السنة الأولى',
    noSetupFees: 'بدون رسوم إعداد',
    missingOffer: 'ما الذي لا يقدمه {name}:',
    viewPricing: 'عرض تسعير {name} ->',
    ongoingAnnualSavings: 'التوفير السنوي المستمر',
    alsoEvaluated: 'جرى النظر فيها أيضًا — السعر عند الطلب',
    alsoEvaluatedBasis: 'هؤلاء الموردون لا ينشرون قائمة أسعار، لذلك لا نعرض سعرًا لهم. نعرض بدلًا من ذلك ما يغطونه.',
    cheaperPerYear: 'أرخص سنويًا',
    competitorCostsLess: '‏{name} أقل تكلفة سنويًا',
    dayOneLabel: 'جاهز من اليوم الأول',
    dayOneDomains: '{count} من مجالاتك الـ{total}',
    buildFirst: 'بعد إنشاء بقيمة {amount}',
    cannotBuyLabel: 'غير متاح من {name} بأي سعر',
    firstYearSavings: 'وفورات السنة الأولى',
    vsName: 'مقابل {name}',
    plusMore: '+{count} أخرى',
    verified: 'موثّق',
    estimated: 'تقديري',
    unverified: 'غير موثّق',
    categoryLabels: {
      'AI restaurant operations': 'عمليات المطاعم المدعومة بالذكاء الاصطناعي',
      'Build-your-own with Microsoft BI': 'حل مخصص عبر Microsoft BI',
      'Excel / Google Sheets': 'Excel / Google Sheets',
      'Inventory & purchasing': 'المخزون والمشتريات',
      'Labor & scheduling': 'العمالة والجدولة',
      'Restaurant ERP & accounting': 'ERP والمحاسبة للمطاعم',
      'Restaurant analytics platform': 'منصة تحليلات للمطاعم',
      'generic-bi': 'ذكاء أعمال عام',
      nothing: 'بدون تطابق مباشر',
      'pos-native': 'تحليلات أصلية لـ POS',
      'restaurant-bi': 'ذكاء أعمال للمطاعم',
      spreadsheets: 'جداول بيانات',
    },
  },
  fr: {
    title: 'Votre comparaison',
    hideAssumptions: 'Masquer les hypotheses',
    viewAssumptions: 'Voir les hypotheses',
    assumptionsTitle: 'Sources tarifaires et hypotheses :',
    competitorPricingMayVary:
      'Les prix concurrents peuvent varier. Contactez les fournisseurs pour des devis exacts.',
    bestSavingsOpportunity: 'Meilleure opportunite d economie',
    firstYear: 'premiere annee',
    notePointSolutions:
      'Note : certaines solutions ponctuelles peuvent etre moins cheres si vous avez seulement besoin de fonctions precises',
    crewCompareOutcomeTitle: 'Comparez le résultat, pas un tarif partiel',
    crewCompareOutcomeBody:
      'Votre offre Sundae fournit {scope} sur une seule couche opérationnelle RH. Les tarifs publiés ci-dessous ne couvrent qu’une partie de ce périmètre.',
    crewComparePayrollProof:
      'Crew Pay est la paie native Sundae dans 36 pays pris en charge, et non une option limitée à un seul marché.',
    crewCompareUnpricedGap:
      'Un total concurrent réellement comparable ne peut pas être calculé sans effectif, couverture pays, options payantes, intégrations et coût d’exploitation de plusieurs systèmes. Les chiffres ci-dessous sont des repères d’entrée, pas des économies à périmètre égal.',
    coreCompareOutcomeBody:
      'Votre offre Sundae fournit {count} domaines de résultats connectés sur une seule couche de décision : {scope}. Les tarifs inférieurs ci-dessous n’en couvrent qu’une partie.',
    coreCompareUnpricedGap:
      'Un tarif inférieur de solution ponctuelle n’est pas une alternative comparable tant que les domaines manquants, l’intégration des données, la construction et les systèmes complémentaires ne sont pas chiffrés.',
    notLikeForLike: 'Périmètres différents',
    partialScopeAnnualRate: 'tarif annuel à périmètre partiel',
    vendorRateDoesNotPriceScope: 'Ce tarif ne couvre pas tout le périmètre sélectionné',
    yourSelectedCrewScope: 'Votre périmètre Sundae Crew : {scope}.',
    yourSelectedCoreScope: 'Votre périmètre Sundae Core : {scope}.',
    fullScopeQuoteRequired:
      'Traitez l’écart comme un périmètre non chiffré, et non comme une économie, jusqu’à ce que le fournisseur chiffre les modules manquants, les frais par employé, les intégrations et les pays requis.',
    coreFullScopeQuoteRequired:
      'Traitez l’écart comme un périmètre non chiffré, et non comme une économie, tant que les domaines manquants, l’intégration des données et les coûts de construction ou de systèmes complémentaires ne sont pas chiffrés.',
    disclosedPartialScopeGap: 'Écart de périmètre partiel déclaré',
    bestSavings: 'Meilleure economie',
    saveVsCompetitor: 'Economisez ${amount}',
    competitorFirstYear: '{name} la premiere annee',
    sundaeFirstYear: 'Sundae la premiere annee',
    noSetupFees: 'Sans frais de mise en place',
    missingOffer: 'Ce que {name} ne propose pas :',
    viewPricing: 'Voir les tarifs de {name} ->',
    ongoingAnnualSavings: 'Economies annuelles continues',
    alsoEvaluated: 'Également étudiés — prix sur demande',
    alsoEvaluatedBasis: 'Ces éditeurs ne publient aucun tarif : nous n\'en inventons donc pas. Nous montrons ce qu\'ils couvrent.',
    cheaperPerYear: 'moins cher par an',
    competitorCostsLess: '{name} coûte moins par an',
    dayOneLabel: 'Opérationnel dès le premier jour',
    dayOneDomains: '{count} de vos {total} domaines',
    buildFirst: 'après un chantier de {amount}',
    cannotBuyLabel: 'Indisponible chez {name} à tout prix',
    firstYearSavings: 'Économies la première année',
    vsName: 'vs {name}',
    plusMore: '+{count} de plus',
    verified: 'Verifie',
    estimated: 'Estime',
    unverified: 'Non verifie',
    categoryLabels: {
      'AI restaurant operations': 'Operations restaurant IA',
      'Build-your-own with Microsoft BI': 'BI personnalisee avec Microsoft',
      'Excel / Google Sheets': 'Excel / Google Sheets',
      'Inventory & purchasing': 'Stocks et achats',
      'Labor & scheduling': 'Travail et planning',
      'Restaurant ERP & accounting': 'ERP et comptabilite restaurant',
      'Restaurant analytics platform': 'Plateforme analytique restaurant',
      'generic-bi': 'BI generique',
      nothing: 'Pas d equivalent direct',
      'pos-native': 'Analytique native POS',
      'restaurant-bi': 'BI restaurant',
      spreadsheets: 'Feuilles de calcul',
    },
  },
  es: {
    title: 'Cómo comparas',
    hideAssumptions: 'Ocultar supuestos',
    viewAssumptions: 'Ver supuestos',
    assumptionsTitle: 'Fuentes de precios y supuestos:',
    competitorPricingMayVary:
      'Los precios de la competencia pueden variar. Contacta a los proveedores para cotizaciones exactas.',
    bestSavingsOpportunity: 'Mejor oportunidad de ahorro',
    firstYear: 'primer año',
    notePointSolutions:
      'Nota: algunas soluciones puntuales pueden ser más baratas si solo necesitas funciones específicas',
    crewCompareOutcomeTitle: 'Compara el resultado, no una tarifa parcial',
    crewCompareOutcomeBody:
      'Tu propuesta de Sundae entrega {scope} en una sola capa operativa de personal. Las tarifas publicadas de abajo solo cubren una parte de ese alcance.',
    crewComparePayrollProof:
      'Crew Pay es la nómina nativa de Sundae en 36 países compatibles, no un complemento de un solo mercado.',
    crewCompareUnpricedGap:
      'No se puede calcular un total rival comparable sin empleados, cobertura por país, complementos, integraciones y el coste operativo de varios sistemas. Las cifras siguientes son referencias de entrada, no ahorros con paridad de producto.',
    coreCompareOutcomeBody:
      'Tu propuesta de Sundae entrega {count} dominios de resultado conectados en una sola capa de decisión: {scope}. Las tarifas inferiores de abajo solo cubren una parte.',
    coreCompareUnpricedGap:
      'Una tarifa inferior de solución puntual no es una alternativa equivalente hasta valorar los dominios ausentes, la integración de datos, el trabajo de construcción y los sistemas complementarios.',
    notLikeForLike: 'No es equivalente',
    partialScopeAnnualRate: 'tarifa anual de alcance parcial',
    vendorRateDoesNotPriceScope: 'Esta tarifa no cubre todo el alcance seleccionado',
    yourSelectedCrewScope: 'Tu alcance de Sundae Crew: {scope}.',
    yourSelectedCoreScope: 'Tu alcance de Sundae Core: {scope}.',
    fullScopeQuoteRequired:
      'Trata la diferencia como alcance sin cotizar, no como ahorro, hasta que el proveedor valore los módulos ausentes, los cargos por empleado, las integraciones y los países requeridos.',
    coreFullScopeQuoteRequired:
      'Trata la diferencia como alcance sin cotizar, no como ahorro, hasta valorar los dominios ausentes, la integración de datos y cualquier coste de construcción o sistema complementario.',
    disclosedPartialScopeGap: 'Diferencia de alcance parcial declarada',
    bestSavings: 'Mejor ahorro',
    saveVsCompetitor: 'Ahorra ${amount}',
    competitorFirstYear: '{name} primer año',
    sundaeFirstYear: 'Sundae primer año',
    noSetupFees: 'Sin costes de implementación',
    missingOffer: 'Lo que {name} no ofrece:',
    viewPricing: 'Ver precios de {name} ->',
    ongoingAnnualSavings: 'Ahorro anual continuo',
    alsoEvaluated: 'También evaluados — precio a consultar',
    alsoEvaluatedBasis: 'Estos proveedores no publican tarifas, así que no citamos ninguna. Mostramos lo que cubren.',
    cheaperPerYear: 'más barato al año',
    competitorCostsLess: '{name} cuesta menos al año',
    dayOneLabel: 'Operativo desde el primer día',
    dayOneDomains: '{count} de tus {total} dominios',
    buildFirst: 'tras una implantación de {amount}',
    cannotBuyLabel: 'No disponible en {name} a ningún precio',
    firstYearSavings: 'Ahorro del primer año',
    vsName: 'vs {name}',
    plusMore: '+{count} más',
    verified: 'Verificado',
    estimated: 'Estimado',
    unverified: 'Sin verificar',
    categoryLabels: {
      'AI restaurant operations': 'Operaciones para restaurantes con IA',
      'Build-your-own with Microsoft BI': 'BI personalizada con Microsoft',
      'Excel / Google Sheets': 'Excel / Google Sheets',
      'Inventory & purchasing': 'Inventario y compras',
      'Labor & scheduling': 'Personal y horarios',
      'Restaurant ERP & accounting': 'ERP y contabilidad para restaurantes',
      'Restaurant analytics platform': 'Plataforma de analítica para restaurantes',
      'generic-bi': 'BI genérica',
      nothing: 'Sin equivalente directo',
      'pos-native': 'Analítica nativa de POS',
      'restaurant-bi': 'BI para restaurantes',
      spreadsheets: 'Hojas de calculo',
    },
  },
} as const satisfies Record<FullyLocalizedPricingLocale, object>


const annualAmountTemplates = {
  en: '${amount} annually',
  ar: '${amount} سنوياً',
  fr: '${amount} par an',
  es: '${amount} al año',
} as const

const layerLabels = {
  en: {
    report: 'Report',
    core: 'Core',
  },
  ar: {
    report: 'التقارير',
    core: 'Core',
  },
  fr: {
    report: 'Report',
    core: 'Core',
  },
  es: {
    report: 'Report',
    core: 'Core',
  },
} as const

const competitorBreakdownLabels = {
  en: {
    'Monthly licenses': 'Monthly licenses',
    'Setup fees': 'Setup fees',
    'Monthly subscription': 'Monthly subscription',
    Implementation: 'Implementation',
    'Licenses (verified)': 'Licenses (verified)',
    'Implementation (estimated)': 'Implementation (estimated)',
    'Maintenance (estimated)': 'Maintenance (estimated)',
    'Analyst 0.5 FTE (estimated)': 'Analyst 0.5 FTE (estimated)',
    Software: 'Software',
    'Error/rework cost (0.2% revenue)': 'Error/rework cost (0.2% revenue)',
    'Monthly licenses (Professional)': 'Monthly licenses (Professional)',
    'Monthly licenses (The Works tier)': 'Monthly licenses (The Works tier)',
  },
  ar: {
    'Monthly licenses': 'التراخيص الشهرية',
    'Setup fees': 'رسوم الإعداد',
    'Monthly subscription': 'الاشتراك الشهري',
    Implementation: 'التنفيذ',
    'Licenses (verified)': 'التراخيص (موثّقة)',
    'Implementation (estimated)': 'التنفيذ (تقديري)',
    'Maintenance (estimated)': 'الصيانة (تقديرية)',
    'Analyst 0.5 FTE (estimated)': 'محلل 0.5 FTE (تقديري)',
    Software: 'البرمجيات',
    'Error/rework cost (0.2% revenue)': 'تكلفة الأخطاء/إعادة العمل (0.2% من الإيرادات)',
    'Monthly licenses (Professional)': 'التراخيص الشهرية (Professional)',
    'Monthly licenses (The Works tier)': 'التراخيص الشهرية (فئة The Works)',
  },
  fr: {
    'Monthly licenses': 'Licences mensuelles',
    'Setup fees': 'Frais de mise en place',
    'Monthly subscription': 'Abonnement mensuel',
    Implementation: 'Implémentation',
    'Licenses (verified)': 'Licences (vérifiées)',
    'Implementation (estimated)': 'Implémentation (estimée)',
    'Maintenance (estimated)': 'Maintenance (estimée)',
    'Analyst 0.5 FTE (estimated)': 'Analyste 0,5 ETP (estimé)',
    Software: 'Logiciel',
    'Error/rework cost (0.2% revenue)': 'Coût erreurs/reprise (0,2% du revenu)',
    'Monthly licenses (Professional)': 'Licences mensuelles (Professional)',
    'Monthly licenses (The Works tier)': 'Licences mensuelles (The Works)',
  },
  es: {
    'Monthly licenses': 'Licencias mensuales',
    'Setup fees': 'Costes de implementación',
    'Monthly subscription': 'Suscripción mensual',
    Implementation: 'Implementación',
    'Licenses (verified)': 'Licencias (verificadas)',
    'Implementation (estimated)': 'Implementación (estimada)',
    'Maintenance (estimated)': 'Mantenimiento (estimado)',
    'Analyst 0.5 FTE (estimated)': 'Analista 0,5 FTE (estimado)',
    Software: 'Software',
    'Error/rework cost (0.2% revenue)': 'Coste de errores/retrabajo (0,2% de ingresos)',
    'Monthly licenses (Professional)': 'Licencias mensuales (Professional)',
    'Monthly licenses (The Works tier)': 'Licencias mensuales (The Works)',
  },
} as const

const competitorSourceLabels = {
  en: {
    'tenzo.io/pricing (verified)': 'tenzo.io/pricing (verified)',
    'Industry estimates (pricing not public)': 'Industry estimates (pricing not public)',
    'Microsoft pricing + industry estimates': 'Microsoft pricing + industry estimates',
    'Industry labor cost estimates': 'Industry labor cost estimates',
    'Industry estimates': 'Industry estimates',
    'marketman.com/pricing (verified)': 'marketman.com/pricing (verified)',
  },
  ar: {
    'tenzo.io/pricing (verified)': 'tenzo.io/pricing (موثّق)',
    'Industry estimates (pricing not public)': 'تقديرات الصناعة (التسعير غير علني)',
    'Microsoft pricing + industry estimates': 'تسعير Microsoft + تقديرات الصناعة',
    'Industry labor cost estimates': 'تقديرات تكلفة العمالة في القطاع',
    'Industry estimates': 'تقديرات الصناعة',
    'marketman.com/pricing (verified)': 'marketman.com/pricing (موثّق)',
  },
  fr: {
    'tenzo.io/pricing (verified)': 'tenzo.io/pricing (vérifié)',
    'Industry estimates (pricing not public)': 'Estimations du secteur (prix non publics)',
    'Microsoft pricing + industry estimates': 'Tarifs Microsoft + estimations du secteur',
    'Industry labor cost estimates': 'Estimations du coût du travail du secteur',
    'Industry estimates': 'Estimations du secteur',
    'marketman.com/pricing (verified)': 'marketman.com/pricing (vérifié)',
  },
  es: {
    'tenzo.io/pricing (verified)': 'tenzo.io/pricing (verificado)',
    'Industry estimates (pricing not public)': 'Estimaciones del sector (precio no público)',
    'Microsoft pricing + industry estimates': 'Precios de Microsoft + estimaciones del sector',
    'Industry labor cost estimates': 'Estimaciones sectoriales de coste laboral',
    'Industry estimates': 'Estimaciones del sector',
    'marketman.com/pricing (verified)': 'marketman.com/pricing (verificado)',
  },
} as const

const competitorNotes = {
  en: {
    'Pricing not publicly available. Contact Nory directly for custom quotes based on your restaurant size and needs.':
      'Pricing not publicly available. Contact Nory directly for custom quotes based on your restaurant size and needs.',
    'Includes accounting; different focus than pure analytics. Industry estimate.':
      'Includes accounting; different focus than pure analytics. Industry estimate.',
    'Requires technical expertise. License costs verified from Microsoft; implementation and maintenance are industry estimates.':
      'Requires technical expertise. License costs verified from Microsoft; implementation and maintenance are industry estimates.',
    'Hidden costs in manual labor and decision-making errors. Based on industry research.':
      'Hidden costs in manual labor and decision-making errors. Based on industry research.',
    'Inventory & purchasing focused only. Professional tier used for comparison.':
      'Inventory & purchasing focused only. Professional tier used for comparison.',
    'Labor & scheduling only. The Works tier used for comparison.':
      'Labor & scheduling only. The Works tier used for comparison.',
    '$75/location/module/month + $350 setup per module per location':
      '$75/location/module/month + $350 setup per module per location',
    '~$1,000/location/month + $2K setup per location':
      '~$1,000/location/month + $2K setup per location',
    '$20/user Premium licenses + implementation + maintenance + 0.5 FTE analyst':
      '$20/user Premium licenses + implementation + maintenance + 0.5 FTE analyst',
    "${'{locations * 2}'} hours/week analyst @ $${SPREADSHEETS_LABOR_RATE_USD}/hr + 0.2% revenue impact from errors":
      "${'{locations * 2}'} hours/week analyst @ $${SPREADSHEETS_LABOR_RATE_USD}/hr + 0.2% revenue impact from errors",
  },
  ar: {
    'Pricing not publicly available. Contact Nory directly for custom quotes based on your restaurant size and needs.':
      'التسعير غير متاح علناً. تواصل مع Nory مباشرة للحصول على عرض مخصص بحسب حجم مطعمك واحتياجاتك.',
    'Includes accounting; different focus than pure analytics. Industry estimate.':
      'يشمل المحاسبة، لذلك يختلف تركيزه عن منصات التحليلات البحتة. هذا تقدير صناعي.',
    'Requires technical expertise. License costs verified from Microsoft; implementation and maintenance are industry estimates.':
      'يتطلب خبرة تقنية. تكلفة التراخيص موثقة من Microsoft، أما التنفيذ والصيانة فهما تقديران صناعيان.',
    'Hidden costs in manual labor and decision-making errors. Based on industry research.':
      'هناك تكاليف خفية في العمل اليدوي وأخطاء اتخاذ القرار. يستند هذا إلى أبحاث صناعية.',
    'Inventory & purchasing focused only. Professional tier used for comparison.':
      'يركز فقط على المخزون والمشتريات. تمت مقارنة فئة Professional.',
    'Labor & scheduling only. The Works tier used for comparison.':
      'يركز فقط على العمالة والجدولة. تمت مقارنة فئة The Works.',
    '$75/location/module/month + $350 setup per module per location':
      '$75/موقع/وحدة/شهرياً + إعداد $350 لكل وحدة ولكل موقع',
    '~$1,000/location/month + $2K setup per location':
      '~$1,000/موقع/شهرياً + إعداد $2K لكل موقع',
    '$20/user Premium licenses + implementation + maintenance + 0.5 FTE analyst':
      'تراخيص Premium بقيمة $20 لكل مستخدم + تنفيذ + صيانة + محلل 0.5 FTE',
    "${'{locations * 2}'} hours/week analyst @ $${SPREADSHEETS_LABOR_RATE_USD}/hr + 0.2% revenue impact from errors":
      "${'{locations * 2}'} ساعة/أسبوع لمحلل بسعر $${SPREADSHEETS_LABOR_RATE_USD}/ساعة + أثر 0.2% من الإيرادات بسبب الأخطاء",
  },
  fr: {
    'Pricing not publicly available. Contact Nory directly for custom quotes based on your restaurant size and needs.':
      'Prix non publics. Contactez directement Nory pour un devis adapté à la taille et aux besoins de votre restaurant.',
    'Includes accounting; different focus than pure analytics. Industry estimate.':
      "Inclut la comptabilité, avec un positionnement différent d'une solution analytique pure. Estimation du secteur.",
    'Requires technical expertise. License costs verified from Microsoft; implementation and maintenance are industry estimates.':
      "Nécessite une expertise technique. Les licences sont vérifiées chez Microsoft ; l'implémentation et la maintenance sont estimées.",
    'Hidden costs in manual labor and decision-making errors. Based on industry research.':
      'Coûts cachés liés au travail manuel et aux erreurs de décision. Basé sur des recherches sectorielles.',
    'Inventory & purchasing focused only. Professional tier used for comparison.':
      'Concentré uniquement sur les stocks et achats. Niveau Professional utilisé pour la comparaison.',
    'Labor & scheduling only. The Works tier used for comparison.':
      'Concentré uniquement sur le travail et le planning. Niveau The Works utilisé pour la comparaison.',
    '$75/location/module/month + $350 setup per module per location':
      '$75/site/module/mois + $350 de mise en place par module et par site',
    '~$1,000/location/month + $2K setup per location':
      '~$1,000/site/mois + $2K de mise en place par site',
    '$20/user Premium licenses + implementation + maintenance + 0.5 FTE analyst':
      'Licences Premium à $20/utilisateur + implémentation + maintenance + analyste 0,5 ETP',
    "${'{locations * 2}'} hours/week analyst @ $${SPREADSHEETS_LABOR_RATE_USD}/hr + 0.2% revenue impact from errors":
      "${'{locations * 2}'} h/semaine d'analyste à $${SPREADSHEETS_LABOR_RATE_USD}/h + impact de 0,2% du revenu lié aux erreurs",
  },
  es: {
    'Pricing not publicly available. Contact Nory directly for custom quotes based on your restaurant size and needs.':
      'El precio no es público. Contacta directamente con Nory para una cotización según el tamaño y las necesidades de tu restaurante.',
    'Includes accounting; different focus than pure analytics. Industry estimate.':
      'Incluye contabilidad, por lo que su enfoque es distinto al de una plataforma puramente analítica. Estimación del sector.',
    'Requires technical expertise. License costs verified from Microsoft; implementation and maintenance are industry estimates.':
      'Requiere experiencia técnica. Los costes de licencia están verificados por Microsoft; implementación y mantenimiento son estimaciones del sector.',
    'Hidden costs in manual labor and decision-making errors. Based on industry research.':
      'Hay costes ocultos en el trabajo manual y en los errores de decisión. Basado en investigación sectorial.',
    'Inventory & purchasing focused only. Professional tier used for comparison.':
      'Enfocado solo en inventario y compras. Se usa el plan Professional para la comparación.',
    'Labor & scheduling only. The Works tier used for comparison.':
      'Enfocado solo en personal y horarios. Se usa el plan The Works para la comparación.',
    '$75/location/module/month + $350 setup per module per location':
      '$75/local/módulo/mes + $350 de implementación por módulo y local',
    '~$1,000/location/month + $2K setup per location':
      '~$1,000/local/mes + $2K de implementación por local',
    '$20/user Premium licenses + implementation + maintenance + 0.5 FTE analyst':
      'Licencias Premium de $20/usuario + implementación + mantenimiento + analista 0,5 FTE',
    "${'{locations * 2}'} hours/week analyst @ $${SPREADSHEETS_LABOR_RATE_USD}/hr + 0.2% revenue impact from errors":
      "${'{locations * 2}'} horas/semana de analista a $${SPREADSHEETS_LABOR_RATE_USD}/h + impacto del 0,2% de ingresos por errores",
  },
} as const

const competitorLimitations = {
  en: {
    'No marketing analytics': 'No marketing analytics',
    'No purchasing module': 'No purchasing module',
    'No reservation intelligence': 'No reservation intelligence',
    'No competitive intelligence': 'No competitive intelligence',
    'Setup fees per module per location': 'Setup fees per module per location',
    'Higher price point': 'Higher price point',
    'Less granular module selection': 'Less granular module selection',
    'Newer platform, less proven at scale': 'Newer platform, less proven at scale',
    'Accounting-focused, less analytics depth': 'Accounting-focused, less analytics depth',
    'No AI-powered insights': 'No AI-powered insights',
    'No benchmark data': 'No benchmark data',
    'Requires technical expertise to build': 'Requires technical expertise to build',
    'No pre-built restaurant analytics': 'No pre-built restaurant analytics',
    'No AI insights included': 'No AI insights included',
    'Ongoing development required': 'Ongoing development required',
    'Highly manual and time-consuming': 'Highly manual and time-consuming',
    'Error-prone (88% of spreadsheets contain errors)': 'Error-prone (88% of spreadsheets contain errors)',
    'No real-time data': 'No real-time data',
    'No AI insights': 'No AI insights',
    "Doesn't scale well": "Doesn't scale well",
    'Inventory-focused only': 'Inventory-focused only',
    'No labor analytics': 'No labor analytics',
    'No sales analytics': 'No sales analytics',
    'Labor/scheduling only': 'Labor/scheduling only',
    'No inventory analytics': 'No inventory analytics',
    'Would need to combine with other tools': 'Would need to combine with other tools',
  },
  ar: {
    'No marketing analytics': 'لا يقدم تحليلات تسويق',
    'No purchasing module': 'لا يقدم وحدة مشتريات',
    'No reservation intelligence': 'لا يقدم ذكاء الحجوزات',
    'No competitive intelligence': 'لا يقدم ذكاء تنافسياً',
    'Setup fees per module per location': 'رسوم إعداد لكل وحدة ولكل موقع',
    'Higher price point': 'سعره أعلى',
    'Less granular module selection': 'مرونة أقل في اختيار الوحدات',
    'Newer platform, less proven at scale': 'منصة أحدث وأقل إثباتاً عند التوسع',
    'Accounting-focused, less analytics depth': 'يركز على المحاسبة مع عمق تحليلي أقل',
    'No AI-powered insights': 'لا يقدم رؤى مدعومة بالذكاء الاصطناعي',
    'No benchmark data': 'لا يقدم بيانات معيارية',
    'Requires technical expertise to build': 'يتطلب خبرة تقنية للبناء',
    'No pre-built restaurant analytics': 'لا يقدم تحليلات جاهزة للمطاعم',
    'No AI insights included': 'لا يتضمن رؤى ذكاء اصطناعي',
    'Ongoing development required': 'يتطلب تطويراً مستمراً',
    'Highly manual and time-consuming': 'يدوي جداً ويستهلك وقتاً كبيراً',
    'Error-prone (88% of spreadsheets contain errors)': 'معرض للأخطاء (88% من الجداول تحتوي أخطاء)',
    'No real-time data': 'لا يقدم بيانات لحظية',
    'No AI insights': 'لا يقدم رؤى ذكاء اصطناعي',
    "Doesn't scale well": 'لا يتوسع بكفاءة',
    'Inventory-focused only': 'يركز على المخزون فقط',
    'No labor analytics': 'لا يقدم تحليلات عمالة',
    'No sales analytics': 'لا يقدم تحليلات مبيعات',
    'Labor/scheduling only': 'يركز فقط على العمالة والجدولة',
    'No inventory analytics': 'لا يقدم تحليلات مخزون',
    'Would need to combine with other tools': 'ستحتاج إلى دمجه مع أدوات أخرى',
  },
  fr: {
    'No marketing analytics': "Pas d'analytique marketing",
    'No purchasing module': 'Pas de module achats',
    'No reservation intelligence': "Pas d'intelligence réservations",
    'No competitive intelligence': "Pas d'intelligence concurrentielle",
    'Setup fees per module per location': 'Frais de mise en place par module et par site',
    'Higher price point': 'Positionnement prix plus élevé',
    'Less granular module selection': 'Sélection de modules moins granulaire',
    'Newer platform, less proven at scale': 'Plateforme plus récente, moins prouvée à grande échelle',
    'Accounting-focused, less analytics depth': 'Orienté comptabilité, avec moins de profondeur analytique',
    'No AI-powered insights': "Pas d'insights IA",
    'No benchmark data': 'Pas de données de benchmark',
    'Requires technical expertise to build': 'Nécessite une expertise technique pour être construit',
    'No pre-built restaurant analytics': "Pas d'analytique restaurant préconstruite",
    'No AI insights included': "Pas d'insights IA inclus",
    'Ongoing development required': 'Développement continu requis',
    'Highly manual and time-consuming': 'Très manuel et chronophage',
    'Error-prone (88% of spreadsheets contain errors)': 'Sujet aux erreurs (88 % des feuilles en contiennent)',
    'No real-time data': 'Pas de données en temps réel',
    'No AI insights': "Pas d'insights IA",
    "Doesn't scale well": "Passe mal à l'échelle",
    'Inventory-focused only': 'Concentré uniquement sur les stocks',
    'No labor analytics': "Pas d'analytique RH",
    'No sales analytics': "Pas d'analytique ventes",
    'Labor/scheduling only': 'Travail/planning uniquement',
    'No inventory analytics': "Pas d'analytique stocks",
    'Would need to combine with other tools': "Il faudrait le combiner avec d'autres outils",
  },
  es: {
    'No marketing analytics': 'Sin analítica de marketing',
    'No purchasing module': 'Sin módulo de compras',
    'No reservation intelligence': 'Sin inteligencia de reservas',
    'No competitive intelligence': 'Sin inteligencia competitiva',
    'Setup fees per module per location': 'Costes de implementación por módulo y local',
    'Higher price point': 'Precio más alto',
    'Less granular module selection': 'Selección de módulos menos granular',
    'Newer platform, less proven at scale': 'Plataforma más nueva y menos probada a escala',
    'Accounting-focused, less analytics depth': 'Enfocado en contabilidad, con menos profundidad analítica',
    'No AI-powered insights': 'Sin insights con IA',
    'No benchmark data': 'Sin datos benchmark',
    'Requires technical expertise to build': 'Requiere experiencia técnica para construirlo',
    'No pre-built restaurant analytics': 'Sin analítica preconstruida para restaurantes',
    'No AI insights included': 'No incluye insights de IA',
    'Ongoing development required': 'Requiere desarrollo continuo',
    'Highly manual and time-consuming': 'Muy manual y lento',
    'Error-prone (88% of spreadsheets contain errors)': 'Propenso a errores (el 88 % de las hojas tiene errores)',
    'No real-time data': 'Sin datos en tiempo real',
    'No AI insights': 'Sin insights de IA',
    "Doesn't scale well": 'Escala mal',
    'Inventory-focused only': 'Enfocado solo en inventario',
    'No labor analytics': 'Sin analítica de personal',
    'No sales analytics': 'Sin analítica de ventas',
    'Labor/scheduling only': 'Solo personal y horarios',
    'No inventory analytics': 'Sin analítica de inventario',
    'Would need to combine with other tools': 'Requeriría combinarlo con otras herramientas',
  },
} as const

export function getLocationSliderCopy(locale: PricingUiLocale) {
  return resolvePricingUiCopy(locationSliderCopy, locale, generatedPricingUiCopy.locationSliderCopy)
}

export function getLiveCalculatorCopy(locale: PricingUiLocale) {
  return resolvePricingUiCopy(liveCalculatorCopy, locale, generatedPricingUiCopy.liveCalculatorCopy)
}

export function getRoiCopy(locale: PricingUiLocale) {
  return resolvePricingUiCopy(roiCopy, locale, generatedPricingUiCopy.roiCopy)
}

export function getCompetitorCompareCopy(locale: PricingUiLocale) {
  return resolvePricingUiCopy(competitorCompareCopy, locale, generatedPricingUiCopy.competitorCompareCopy)
}

export function getLocalizedCompetitorCategory(locale: PricingUiLocale, category: string) {
  const copy = resolvePricingUiCopy(competitorCompareCopy, locale, generatedPricingUiCopy.competitorCompareCopy)
  return copy.categoryLabels[category as keyof typeof copy.categoryLabels] ?? category
}

export function getLocalizedCompetitorBreakdownLabel(locale: PricingUiLocale, label: string) {
  if (label.startsWith('Labor (')) {
    if (locale === 'ar') return label.replace('Labor', 'العمالة')
    if (locale === 'fr') return label.replace('Labor', 'Travail')
    if (locale === 'es') return label.replace('Labor', 'Mano de obra')
  }
  const copy = resolvePricingUiCopy(
    competitorBreakdownLabels,
    locale,
    generatedPricingUiCopy.competitorBreakdownLabels,
  )
  return copy[label as keyof typeof copy] ?? label
}

export function getLocalizedCompetitorSource(locale: PricingUiLocale, source: string) {
  const copy = resolvePricingUiCopy(competitorSourceLabels, locale, generatedPricingUiCopy.competitorSourceLabels)
  return copy[source as keyof typeof copy] ?? source
}

export function getLocalizedCompetitorNote(locale: PricingUiLocale, note: string) {
  if (note.startsWith("Tenzo doesn't offer:")) {
    const rawList = note.replace("Tenzo doesn't offer:", '').trim()
    const translatedList = rawList
      .split(',')
      .map((item) => item.trim())
      .map((item) =>
        ({
          marketing: { en: 'marketing', ar: 'التسويق', fr: 'marketing', es: 'marketing' },
          purchasing: { en: 'purchasing', ar: 'المشتريات', fr: 'achats', es: 'compras' },
          reservations: { en: 'reservations', ar: 'الحجوزات', fr: 'reservations', es: 'reservas' },
          watchtower: { en: 'Watchtower', ar: 'Watchtower', fr: 'Watchtower', es: 'Watchtower' },
          profit: { en: 'profit', ar: 'الربح', fr: 'profit', es: 'profit' },
          revenue: { en: 'revenue assurance', ar: 'ضمان الإيرادات', fr: 'assurance revenus', es: 'aseguramiento de ingresos' },
          delivery: { en: 'delivery', ar: 'التوصيل', fr: 'delivery', es: 'delivery' },
          guest: { en: 'guest experience', ar: 'تجربة الضيف', fr: 'experience client', es: 'experiencia del cliente' },
        } as const)[item as keyof {
          marketing: object
          purchasing: object
          reservations: object
          watchtower: object
          profit: object
          revenue: object
          delivery: object
          guest: object
        }]?.[locale as FullyLocalizedPricingLocale] ?? item
      )
      .join(', ')

    return ({
      en: `Tenzo doesn't offer: ${translatedList}`,
      ar: `Tenzo لا يقدّم: ${translatedList}`,
      fr: `Tenzo ne propose pas : ${translatedList}`,
      es: `Tenzo no ofrece: ${translatedList}`,
    } as const)[locale as FullyLocalizedPricingLocale] ?? `Tenzo doesn't offer: ${translatedList}`
  }
  const copy = resolvePricingUiCopy(competitorNotes, locale, generatedPricingUiCopy.competitorNotes)
  return copy[note as keyof typeof copy] ?? note
}

export function getLocalizedCompetitorLimitation(locale: PricingUiLocale, limitation: string) {
  const copy = resolvePricingUiCopy(competitorLimitations, locale, generatedPricingUiCopy.competitorLimitations)
  return copy[limitation as keyof typeof copy] ?? limitation
}


export function formatAnnualAmount(locale: PricingUiLocale, amount: string) {
  return formatMessage(resolvePricingUiCopy(annualAmountTemplates, locale, generatedPricingUiCopy.annualAmountTemplates), { amount })
}

export function getLocalizedLayerName(locale: PricingUiLocale, layer: 'report' | 'core' | null) {
  if (!layer) return ''
  return resolvePricingUiCopy(layerLabels, locale, generatedPricingUiCopy.layerLabels)[layer]
}
