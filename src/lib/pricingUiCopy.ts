export type PricingUiLocale = 'en' | 'ar' | 'fr' | 'es'

export function formatMessage(template: string, values: Record<string, string | number>) {
  return Object.entries(values).reduce(
    (result, [key, value]) =>
      result.replaceAll(`\${${key}}`, String(value)).replaceAll(`{${key}}`, String(value)),
    template
  )
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
    saveVsSingle: 'Save {percent}% vs single',
    bestValueAtScale: 'Best value at scale',
    enterpriseQualified:
      'With {locations} locations, you qualify for Enterprise pricing with dedicated support.',
    volumeDiscountTitle: 'Volume Discount Active',
    volumeDiscountBody: 'You are getting enterprise pricing benefits with {locations} locations',
    considerCoreProTitle: 'Consider Core Pro',
    considerCoreProBody:
      'At {locations} locations, Core Pro may be worth considering for advanced forecasting and multi-POS workflows.',
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
    saveVsSingle: 'وفّر {percent}% مقابل موقع واحد',
    bestValueAtScale: 'أفضل قيمة عند التوسع',
    enterpriseQualified:
      'مع {locations} موقعاً، أنت مؤهل لتسعير Enterprise مع دعم مخصص.',
    volumeDiscountTitle: 'خصم الحجم مفعل',
    volumeDiscountBody: 'أنت تحصل على مزايا تسعير Enterprise مع {locations} موقعاً',
    considerCoreProTitle: 'فكر في Core Pro',
    considerCoreProBody:
      'عند {locations} موقعاً، قد يكون Core Pro خياراً مناسباً للتنبؤات المتقدمة وتدفقات العمل متعددة POS.',
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
    subtitle: 'Faites glisser pour configurer la taille de votre portefeuille. Le prix evolue efficacement avec votre echelle.',
    preciseCount: 'Pour un nombre precis, cliquez sur le chiffre ci-dessus ou saisissez-le ici :',
    preciseCountEnterprise: 'La formule Enterprise exige {min}+ sites. Saisissez le nombre exact ici :',
    minimum: 'Minimum : {min} sites pour la formule Enterprise',
    totalMonthly: 'Total mensuel',
    annualSuffix: '/an',
    perLocation: 'Par site',
    saveVsSingle: 'Economisez {percent}% vs site unique',
    bestValueAtScale: 'Meilleure valeur a grande echelle',
    enterpriseQualified:
      'Avec {locations} sites, vous etes eligible a la tarification Enterprise avec accompagnement dedie.',
    volumeDiscountTitle: 'Remise volume active',
    volumeDiscountBody:
      'Vous profitez des avantages tarifaires Enterprise avec {locations} sites',
    considerCoreProTitle: 'Envisagez Core Pro',
    considerCoreProBody:
      'A {locations} sites, Core Pro peut valoir le coup pour la prevision avancee et les workflows multi-POS.',
    portfolioUnlockedTitle: 'Gestion de portefeuille debloquee',
    portfolioUnlockedBody:
      'Comparez la performance sur l ensemble de vos {locations} sites dans une seule vue',
    back: 'Retour',
    continueToModules: 'Continuer vers les modules',
    continueToSummary: 'Continuer vers le resume',
    scale: {
      independent: 'Independant',
      smallPortfolio: 'Petit portefeuille',
      growthStage: 'Phase de croissance',
      enterprise: 'Enterprise',
      regionalChain: 'Chaine regionale',
      majorChain: 'Grande chaine',
      nationalScale: 'Echelle nationale',
    },
  },
  es: {
    title: 'Cuantos locales?',
    subtitle: 'Desliza para configurar el tamano de tu cartera. El precio escala con eficiencia.',
    preciseCount: 'Para cantidades exactas, haz clic en el numero de arriba o escribelo aqui:',
    preciseCountEnterprise: 'El plan Enterprise requiere {min}+ locales. Escribe aqui la cantidad exacta:',
    minimum: 'Minimo: {min} locales para el plan Enterprise',
    totalMonthly: 'Total mensual',
    annualSuffix: '/ano',
    perLocation: 'Por local',
    saveVsSingle: 'Ahorra {percent}% vs un solo local',
    bestValueAtScale: 'Mejor valor a escala',
    enterpriseQualified:
      'Con {locations} locales, calificas para precios Enterprise con soporte dedicado.',
    volumeDiscountTitle: 'Descuento por volumen activo',
    volumeDiscountBody:
      'Estas obteniendo ventajas de precio Enterprise con {locations} locales',
    considerCoreProTitle: 'Considera Core Pro',
    considerCoreProBody:
      'Con {locations} locales, Core Pro puede compensar por sus pronosticos avanzados y flujos multi-POS.',
    portfolioUnlockedTitle: 'Gestion de cartera desbloqueada',
    portfolioUnlockedBody:
      'Compara el rendimiento de tus {locations} locales en una sola vista',
    back: 'Volver',
    continueToModules: 'Continuar a los modulos',
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
} as const satisfies Record<PricingUiLocale, object>

const liveCalculatorCopy = {
  en: {
    monthlyTotal: 'Monthly Total',
    perLocation: 'Per Location',
    saveVs: 'Save {percent}% vs {competitor}',
    expandAria: 'Expand price calculator',
    minimizeAria: 'Minimize price calculator',
    perMonthShort: '/mo',
  },
  ar: {
    monthlyTotal: 'الإجمالي الشهري',
    perLocation: 'لكل موقع',
    saveVs: 'وفّر {percent}% مقابل {competitor}',
    expandAria: 'توسيع حاسبة الأسعار',
    minimizeAria: 'تصغير حاسبة الأسعار',
    perMonthShort: '/شهرياً',
  },
  fr: {
    monthlyTotal: 'Total mensuel',
    perLocation: 'Par site',
    saveVs: 'Economisez {percent}% vs {competitor}',
    expandAria: 'Developper le calculateur de prix',
    minimizeAria: 'Reduire le calculateur de prix',
    perMonthShort: '/mois',
  },
  es: {
    monthlyTotal: 'Total mensual',
    perLocation: 'Por local',
    saveVs: 'Ahorra {percent}% vs {competitor}',
    expandAria: 'Expandir calculadora de precios',
    minimizeAria: 'Minimizar calculadora de precios',
    perMonthShort: '/mes',
  },
} as const satisfies Record<PricingUiLocale, object>

const roiCopy = {
  en: {
    title: 'Calculate Your ROI',
    subtitle: 'See how quickly Sundae pays for itself through operational savings',
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
      'Estimates use conservative midpoint assumptions. Hover over each line for range details. Actual results depend on execution and baseline metrics.',
    noModulesSelected: 'No Modules Selected',
    noModulesBody: 'Add modules to your stack to see projected ROI savings.',
    biggestWins: 'Your Biggest Wins',
    biggestWinsBody: 'Focus on {categories} for maximum impact',
    monthlyPlatformCost: 'Monthly Platform Cost',
    paysForItselfIn: 'Pays for itself in',
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
      profit: 'Profit Intelligence Uplift',
      revenue: 'Revenue Leakage Recovery',
      delivery: 'Delivery Margin Protection',
      guest: 'Reputation & Retention Lift',
    },
    tooltips: {
      labor:
        'Reduces labor cost by 0.5-1.5% of revenue through better scheduling and productivity insights',
      inventory:
        'Reduces food cost by 0.3-1.0% of revenue through waste reduction and recipe optimization',
      purchasing:
        'Saves 0.2-0.8% of revenue through better supplier pricing and contract management',
      reservations:
        'Revenue uplift of 0.5-2.0% through improved table utilization. Assumes demand exists.',
      marketing:
        'Improves marketing efficiency by 5-15% of marketing spend through better attribution and targeting',
      profit:
        'Uncovers 0.2-0.8% of revenue in margin leakage and menu/mix optimization. Assumes execution on insights.',
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
        'Strong ROI potential: {roi}x return with {weeks}-week payback period.',
      solid: 'Solid returns with {roi}x ROI and {weeks}-week payback.',
      positive: 'Positive ROI with measurable impact on your operations.',
      value: 'Value builds as you optimize operations over time.',
      longTerm: 'Long-term investment in operational intelligence.',
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
        'يخفض تكلفة العمالة بنسبة 0.5-1.5% من الإيرادات عبر تحسين الجدولة والرؤى الإنتاجية',
      inventory:
        'يخفض تكلفة الطعام بنسبة 0.3-1.0% من الإيرادات عبر تقليل الهدر وتحسين الوصفات',
      purchasing:
        'يوفر 0.2-0.8% من الإيرادات عبر تحسين أسعار الموردين وإدارة العقود',
      reservations:
        'يرفع الإيرادات بنسبة 0.5-2.0% عبر تحسين استغلال الطاولات. يفترض وجود طلب.',
      marketing:
        'يحسن كفاءة التسويق بنسبة 5-15% من الإنفاق التسويقي عبر إسناد أفضل واستهداف أدق',
      profit:
        'يكشف 0.2-0.8% من الإيرادات المفقودة بسبب التسرب في الهامش وتحسين المزيج. يفترض تنفيذ الرؤى.',
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
      longTerm: 'استثمار طويل الأجل في الذكاء التشغيلي.',
    },
  },
  fr: {
    title: 'Calculez votre ROI',
    subtitle:
      'Voyez a quelle vitesse Sundae s amortit grace aux gains operationnels',
    businessTitle: 'Parlez-nous de votre activite',
    monthlyRevenuePerLocation: 'Revenu mensuel par site',
    currentLaborCost: 'Cout du travail actuel %',
    currentFoodCost: 'Cout alimentaire actuel %',
    monthlyMarketingSpend: 'Depense marketing mensuelle par site',
    addMarketingSpend:
      'Ajoutez une depense marketing pour estimer les gains d efficacite marketing',
    deliveryRevenuePct: 'Part du revenu delivery %',
    addDeliveryMix:
      'Ajoutez la part delivery pour estimer les gains de marge delivery',
    reviewData: 'Disposez-vous de donnees avis/NPS a connecter ?',
    yes: 'Oui',
    no: 'Non',
    projectedReturns: 'Vos retours projetes',
    monthlySavings: 'Economies mensuelles',
    annualSavings: 'Economies annuelles',
    roiMultiple: 'Multiple ROI',
    paybackPeriod: 'Duree de retour',
    days: '{count} jours',
    savingsBreakdown: 'Detail des economies',
    savingsNote:
      'Les estimations utilisent des hypotheses medianes prudentes. Survolez chaque ligne pour voir la fourchette. Les resultats reels dependent de l execution et de votre point de depart.',
    noModulesSelected: 'Aucun module selectionne',
    noModulesBody:
      'Ajoutez des modules a votre configuration pour voir les economies ROI projetees.',
    biggestWins: 'Vos plus gros leviers',
    biggestWinsBody: 'Concentrez-vous sur {categories} pour un impact maximal',
    monthlyPlatformCost: 'Cout mensuel de la plateforme',
    paysForItselfIn: 'S amortit en',
    netMonthlyBenefit: 'Benefice mensuel net',
    viewSummary: 'Voir le resume',
    rangeLabel: 'Fourchette',
    perMonthShort: '/mois',
    potentialUpside: 'Potentiel supplementaire (non compte dans les totaux)',
    assumptionLabels: {
      labor: 'Optimisation du travail',
      inventory: 'Reduction du cout alimentaire',
      purchasing: 'Economies achats',
      reservations: 'Utilisation des tables',
      marketing: 'Efficacite marketing',
      profit: 'Gain Profit Intelligence',
      revenue: 'Recuperation des fuites de revenu',
      delivery: 'Protection de marge delivery',
      guest: 'Reputation et retention',
    },
    tooltips: {
      labor:
        'Reduit le cout du travail de 0,5-1,5% du chiffre d affaires via un meilleur planning et des insights productivite',
      inventory:
        'Reduit le cout alimentaire de 0,3-1,0% du chiffre d affaires via la baisse du gaspillage et l optimisation des recettes',
      purchasing:
        'Economise 0,2-0,8% du chiffre d affaires via de meilleurs prix fournisseurs et la gestion des contrats',
      reservations:
        'Genere 0,5-2,0% de revenu supplementaire via une meilleure utilisation des tables. Suppose qu il y ait de la demande.',
      marketing:
        'Ameliore l efficacite marketing de 5-15% de la depense marketing via une meilleure attribution et un meilleur ciblage',
      profit:
        'Met au jour 0,2-0,8% du chiffre d affaires en fuite de marge et optimisation du mix. Suppose une execution des insights.',
      revenue:
        'Recupere 0,05-0,25% du chiffre d affaires sur les voids, comps et remises. Depend de la fuite initiale.',
      delivery:
        'Economise 0,2-0,8% du revenu delivery via l optimisation des commissions et de la parite prix',
      guest:
        'Benefice qualitatif issu de meilleurs avis et d une meilleure satisfaction client. Estimation prudente sans donnees avis connectees.',
    },
    missingInput: {
      marketing: 'Ajoutez une depense marketing pour estimer les gains',
      delivery: 'Ajoutez la part delivery pour estimer les gains',
      guest: 'Potentiel supplementaire (non compte dans les totaux)',
    },
    roiDescriptions: {
      strong:
        'Fort potentiel de ROI : retour de {roi}x avec un amortissement en {weeks} semaines.',
      solid: 'Retours solides avec {roi}x de ROI et {weeks} semaines de retour.',
      positive: 'ROI positif avec un impact mesurable sur vos operations.',
      value: 'La valeur augmente a mesure que vous optimisez vos operations.',
      longTerm: 'Investissement de long terme dans l intelligence operationnelle.',
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
    reviewData: 'Tienes datos de resenas/NPS para conectar?',
    yes: 'Si',
    no: 'No',
    projectedReturns: 'Tus retornos proyectados',
    monthlySavings: 'Ahorro mensual',
    annualSavings: 'Ahorro anual',
    roiMultiple: 'Multiplo ROI',
    paybackPeriod: 'Periodo de recuperacion',
    days: '{count} dias',
    savingsBreakdown: 'Desglose de ahorro',
    savingsNote:
      'Las estimaciones usan supuestos de punto medio conservadores. Pasa el cursor por cada linea para ver el rango. Los resultados reales dependen de la ejecucion y de tus metricas base.',
    noModulesSelected: 'No hay modulos seleccionados',
    noModulesBody:
      'Agrega modulos a tu stack para ver el ahorro ROI proyectado.',
    biggestWins: 'Tus mayores oportunidades',
    biggestWinsBody: 'Enfocate en {categories} para lograr el mayor impacto',
    monthlyPlatformCost: 'Costo mensual de la plataforma',
    paysForItselfIn: 'Se paga solo en',
    netMonthlyBenefit: 'Beneficio mensual neto',
    viewSummary: 'Ver resumen',
    rangeLabel: 'Rango',
    perMonthShort: '/mes',
    potentialUpside: 'Potencial adicional (no contado en los totales)',
    assumptionLabels: {
      labor: 'Optimizacion laboral',
      inventory: 'Reduccion del costo de alimentos',
      purchasing: 'Ahorro en compras',
      reservations: 'Utilizacion de mesas',
      marketing: 'Eficiencia de marketing',
      profit: 'Mejora de Profit Intelligence',
      revenue: 'Recuperacion de fuga de ingresos',
      delivery: 'Proteccion del margen de delivery',
      guest: 'Reputacion y retencion',
    },
    tooltips: {
      labor:
        'Reduce el costo laboral entre 0,5% y 1,5% de los ingresos gracias a mejor programacion y productividad',
      inventory:
        'Reduce el costo de alimentos entre 0,3% y 1,0% de los ingresos mediante menor desperdicio y mejor receta',
      purchasing:
        'Ahorra 0,2-0,8% de los ingresos gracias a mejores precios de proveedores y gestion de contratos',
      reservations:
        'Aumenta los ingresos 0,5-2,0% gracias a una mejor utilizacion de mesas. Supone demanda existente.',
      marketing:
        'Mejora la eficiencia de marketing entre 5% y 15% del gasto gracias a mejor atribucion y segmentacion',
      profit:
        'Destapa 0,2-0,8% de los ingresos en fugas de margen y optimizacion del mix. Supone ejecucion de los insights.',
      revenue:
        'Recupera 0,05-0,25% de los ingresos por voids, comps y fugas de descuentos. Depende del nivel de fuga actual.',
      delivery:
        'Ahorra 0,2-0,8% de los ingresos de delivery mediante optimizacion de comisiones y paridad de precios',
      guest:
        'Beneficio cualitativo por mejores resenas y satisfaccion del cliente. Estimacion conservadora salvo que conectes datos de resenas.',
    },
    missingInput: {
      marketing: 'Agrega gasto de marketing para estimar el ahorro',
      delivery: 'Agrega el mix de delivery para estimar el ahorro',
      guest: 'Potencial adicional (no contado en los totales)',
    },
    roiDescriptions: {
      strong:
        'Fuerte potencial de ROI: retorno de {roi}x con recuperacion en {weeks} semanas.',
      solid: 'Retornos solidos con {roi}x de ROI y recuperacion en {weeks} semanas.',
      positive: 'ROI positivo con impacto medible en tus operaciones.',
      value: 'El valor crece a medida que optimizas tus operaciones.',
      longTerm: 'Inversion a largo plazo en inteligencia operativa.',
    },
  },
} as const satisfies Record<PricingUiLocale, object>

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
    bestSavings: 'Best savings',
    saveVsCompetitor: 'Save ${amount}',
    competitorFirstYear: '{name} First Year',
    sundaeFirstYear: 'Sundae First Year',
    noSetupFees: 'No setup fees',
    missingOffer: "What {name} doesn't offer:",
    viewPricing: 'View {name} pricing ->',
    ongoingAnnualSavings: 'Ongoing annual savings',
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
    bestSavings: 'أفضل توفير',
    saveVsCompetitor: 'وفّر ${amount}',
    competitorFirstYear: 'تكلفة {name} في السنة الأولى',
    sundaeFirstYear: 'تكلفة Sundae في السنة الأولى',
    noSetupFees: 'بدون رسوم إعداد',
    missingOffer: 'ما الذي لا يقدمه {name}:',
    viewPricing: 'عرض تسعير {name} ->',
    ongoingAnnualSavings: 'التوفير السنوي المستمر',
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
    bestSavings: 'Meilleure economie',
    saveVsCompetitor: 'Economisez ${amount}',
    competitorFirstYear: '{name} la premiere annee',
    sundaeFirstYear: 'Sundae la premiere annee',
    noSetupFees: 'Sans frais de mise en place',
    missingOffer: 'Ce que {name} ne propose pas :',
    viewPricing: 'Voir les tarifs de {name} ->',
    ongoingAnnualSavings: 'Economies annuelles continues',
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
    title: 'Como comparas',
    hideAssumptions: 'Ocultar supuestos',
    viewAssumptions: 'Ver supuestos',
    assumptionsTitle: 'Fuentes de precios y supuestos:',
    competitorPricingMayVary:
      'Los precios de la competencia pueden variar. Contacta a los proveedores para cotizaciones exactas.',
    bestSavingsOpportunity: 'Mejor oportunidad de ahorro',
    firstYear: 'primer ano',
    notePointSolutions:
      'Nota: algunas soluciones puntuales pueden ser mas baratas si solo necesitas funciones especificas',
    bestSavings: 'Mejor ahorro',
    saveVsCompetitor: 'Ahorra ${amount}',
    competitorFirstYear: '{name} primer ano',
    sundaeFirstYear: 'Sundae primer ano',
    noSetupFees: 'Sin costes de implementacion',
    missingOffer: 'Lo que {name} no ofrece:',
    viewPricing: 'Ver precios de {name} ->',
    ongoingAnnualSavings: 'Ahorro anual continuo',
    vsName: 'vs {name}',
    plusMore: '+{count} mas',
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
      'Restaurant analytics platform': 'Plataforma de analitica para restaurantes',
      'generic-bi': 'BI generica',
      nothing: 'Sin equivalente directo',
      'pos-native': 'Analitica nativa de POS',
      'restaurant-bi': 'BI para restaurantes',
      spreadsheets: 'Hojas de calculo',
    },
  },
} as const satisfies Record<PricingUiLocale, object>

const coreProAdvantageCopy = {
  en:
    'Core Pro becomes cheaper than Core Lite at {cheaperAt}+ locations (break-even at {breakEven}) due to lower per-location pricing (${proPrice} vs ${litePrice}).',
  ar:
    'يصبح Core Pro أقل تكلفة من Core Lite عند {cheaperAt}+ موقعاً (نقطة التعادل عند {breakEven}) بسبب انخفاض تسعير كل موقع (${proPrice} مقابل ${litePrice}).',
  fr:
    'Core Pro devient moins cher que Core Lite a partir de {cheaperAt}+ sites (point d equilibre a {breakEven}) grace a un prix par site plus bas (${proPrice} vs ${litePrice}).',
  es:
    'Core Pro pasa a ser mas barato que Core Lite a partir de {cheaperAt}+ locales (equilibrio en {breakEven}) gracias a un menor precio por local (${proPrice} vs ${litePrice}).',
} as const

const annualAmountTemplates = {
  en: '${amount} annually',
  ar: '${amount} سنوياً',
  fr: '${amount} par an',
  es: '${amount} al ano',
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
    Implementation: 'Implementation',
    'Licenses (verified)': 'Licences (verifiees)',
    'Implementation (estimated)': 'Implementation (estimee)',
    'Maintenance (estimated)': 'Maintenance (estimee)',
    'Analyst 0.5 FTE (estimated)': 'Analyste 0,5 ETP (estime)',
    Software: 'Logiciel',
    'Error/rework cost (0.2% revenue)': 'Cout erreurs/reprise (0,2% du revenu)',
    'Monthly licenses (Professional)': 'Licences mensuelles (Professional)',
    'Monthly licenses (The Works tier)': 'Licences mensuelles (The Works)',
  },
  es: {
    'Monthly licenses': 'Licencias mensuales',
    'Setup fees': 'Costes de implementacion',
    'Monthly subscription': 'Suscripcion mensual',
    Implementation: 'Implementacion',
    'Licenses (verified)': 'Licencias (verificadas)',
    'Implementation (estimated)': 'Implementacion (estimada)',
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
    'tenzo.io/pricing (verified)': 'tenzo.io/pricing (verifie)',
    'Industry estimates (pricing not public)': 'Estimations du secteur (prix non publics)',
    'Microsoft pricing + industry estimates': 'Tarifs Microsoft + estimations du secteur',
    'Industry labor cost estimates': 'Estimations du cout du travail du secteur',
    'Industry estimates': 'Estimations du secteur',
    'marketman.com/pricing (verified)': 'marketman.com/pricing (verifie)',
  },
  es: {
    'tenzo.io/pricing (verified)': 'tenzo.io/pricing (verificado)',
    'Industry estimates (pricing not public)': 'Estimaciones del sector (precio no publico)',
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
      'Prix non publics. Contactez directement Nory pour un devis adapte a la taille et aux besoins de votre restaurant.',
    'Includes accounting; different focus than pure analytics. Industry estimate.':
      'Inclut la comptabilite, avec un positionnement different d une solution analytique pure. Estimation du secteur.',
    'Requires technical expertise. License costs verified from Microsoft; implementation and maintenance are industry estimates.':
      'Necessite une expertise technique. Les licences sont verifiees chez Microsoft; l implementation et la maintenance sont estimees.',
    'Hidden costs in manual labor and decision-making errors. Based on industry research.':
      'Couts caches lies au travail manuel et aux erreurs de decision. Base sur des recherches sectorielles.',
    'Inventory & purchasing focused only. Professional tier used for comparison.':
      'Concentre uniquement sur les stocks et achats. Niveau Professional utilise pour la comparaison.',
    'Labor & scheduling only. The Works tier used for comparison.':
      'Concentre uniquement sur le travail et le planning. Niveau The Works utilise pour la comparaison.',
    '$75/location/module/month + $350 setup per module per location':
      '$75/site/module/mois + $350 de mise en place par module et par site',
    '~$1,000/location/month + $2K setup per location':
      '~$1,000/site/mois + $2K de mise en place par site',
    '$20/user Premium licenses + implementation + maintenance + 0.5 FTE analyst':
      'Licences Premium a $20/utilisateur + implementation + maintenance + analyste 0,5 ETP',
    "${'{locations * 2}'} hours/week analyst @ $${SPREADSHEETS_LABOR_RATE_USD}/hr + 0.2% revenue impact from errors":
      "${'{locations * 2}'} h/semaine d analyste a $${SPREADSHEETS_LABOR_RATE_USD}/h + impact de 0,2% du revenu lie aux erreurs",
  },
  es: {
    'Pricing not publicly available. Contact Nory directly for custom quotes based on your restaurant size and needs.':
      'El precio no es publico. Contacta directamente con Nory para una cotizacion segun el tamano y las necesidades de tu restaurante.',
    'Includes accounting; different focus than pure analytics. Industry estimate.':
      'Incluye contabilidad, por lo que su enfoque es distinto al de una plataforma puramente analitica. Estimacion del sector.',
    'Requires technical expertise. License costs verified from Microsoft; implementation and maintenance are industry estimates.':
      'Requiere experiencia tecnica. Los costes de licencia estan verificados por Microsoft; implementacion y mantenimiento son estimaciones del sector.',
    'Hidden costs in manual labor and decision-making errors. Based on industry research.':
      'Hay costes ocultos en el trabajo manual y en los errores de decision. Basado en investigacion sectorial.',
    'Inventory & purchasing focused only. Professional tier used for comparison.':
      'Enfocado solo en inventario y compras. Se usa el plan Professional para la comparacion.',
    'Labor & scheduling only. The Works tier used for comparison.':
      'Enfocado solo en personal y horarios. Se usa el plan The Works para la comparacion.',
    '$75/location/module/month + $350 setup per module per location':
      '$75/local/modulo/mes + $350 de implementacion por modulo y local',
    '~$1,000/location/month + $2K setup per location':
      '~$1,000/local/mes + $2K de implementacion por local',
    '$20/user Premium licenses + implementation + maintenance + 0.5 FTE analyst':
      'Licencias Premium de $20/usuario + implementacion + mantenimiento + analista 0,5 FTE',
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
    'No marketing analytics': 'Pas d analytique marketing',
    'No purchasing module': 'Pas de module achats',
    'No reservation intelligence': 'Pas d intelligence reservations',
    'No competitive intelligence': 'Pas d intelligence concurrentielle',
    'Setup fees per module per location': 'Frais de mise en place par module et par site',
    'Higher price point': 'Positionnement prix plus eleve',
    'Less granular module selection': 'Selection de modules moins granulaire',
    'Newer platform, less proven at scale': 'Plateforme plus recente, moins prouvee a grande echelle',
    'Accounting-focused, less analytics depth': 'Oriente comptabilite, avec moins de profondeur analytique',
    'No AI-powered insights': 'Pas d insights IA',
    'No benchmark data': 'Pas de donnees de benchmark',
    'Requires technical expertise to build': 'Necessite une expertise technique pour etre construit',
    'No pre-built restaurant analytics': 'Pas d analytique restaurant preconstruite',
    'No AI insights included': 'Pas d insights IA inclus',
    'Ongoing development required': 'Developpement continu requis',
    'Highly manual and time-consuming': 'Tres manuel et chronophage',
    'Error-prone (88% of spreadsheets contain errors)': 'Sujet aux erreurs (88 % des feuilles en contiennent)',
    'No real-time data': 'Pas de donnees en temps reel',
    'No AI insights': 'Pas d insights IA',
    "Doesn't scale well": 'Passe mal a l echelle',
    'Inventory-focused only': 'Concentre uniquement sur les stocks',
    'No labor analytics': 'Pas d analytique RH',
    'No sales analytics': 'Pas d analytique ventes',
    'Labor/scheduling only': 'Travail/planning uniquement',
    'No inventory analytics': 'Pas d analytique stocks',
    'Would need to combine with other tools': 'Il faudrait le combiner avec d autres outils',
  },
  es: {
    'No marketing analytics': 'Sin analitica de marketing',
    'No purchasing module': 'Sin modulo de compras',
    'No reservation intelligence': 'Sin inteligencia de reservas',
    'No competitive intelligence': 'Sin inteligencia competitiva',
    'Setup fees per module per location': 'Costes de implementacion por modulo y local',
    'Higher price point': 'Precio mas alto',
    'Less granular module selection': 'Seleccion de modulos menos granular',
    'Newer platform, less proven at scale': 'Plataforma mas nueva y menos probada a escala',
    'Accounting-focused, less analytics depth': 'Enfocado en contabilidad, con menos profundidad analitica',
    'No AI-powered insights': 'Sin insights con IA',
    'No benchmark data': 'Sin datos benchmark',
    'Requires technical expertise to build': 'Requiere experiencia tecnica para construirlo',
    'No pre-built restaurant analytics': 'Sin analitica preconstruida para restaurantes',
    'No AI insights included': 'No incluye insights de IA',
    'Ongoing development required': 'Requiere desarrollo continuo',
    'Highly manual and time-consuming': 'Muy manual y lento',
    'Error-prone (88% of spreadsheets contain errors)': 'Propenso a errores (el 88 % de las hojas tiene errores)',
    'No real-time data': 'Sin datos en tiempo real',
    'No AI insights': 'Sin insights de IA',
    "Doesn't scale well": 'Escala mal',
    'Inventory-focused only': 'Enfocado solo en inventario',
    'No labor analytics': 'Sin analitica de personal',
    'No sales analytics': 'Sin analitica de ventas',
    'Labor/scheduling only': 'Solo personal y horarios',
    'No inventory analytics': 'Sin analitica de inventario',
    'Would need to combine with other tools': 'Requeriria combinarlo con otras herramientas',
  },
} as const

export function getLocationSliderCopy(locale: PricingUiLocale) {
  return locationSliderCopy[locale]
}

export function getLiveCalculatorCopy(locale: PricingUiLocale) {
  return liveCalculatorCopy[locale]
}

export function getRoiCopy(locale: PricingUiLocale) {
  return roiCopy[locale]
}

export function getCompetitorCompareCopy(locale: PricingUiLocale) {
  return competitorCompareCopy[locale]
}

export function getLocalizedCompetitorCategory(locale: PricingUiLocale, category: string) {
  const copy = competitorCompareCopy[locale]
  return copy.categoryLabels[category as keyof typeof copy.categoryLabels] ?? category
}

export function getLocalizedCompetitorBreakdownLabel(locale: PricingUiLocale, label: string) {
  if (label.startsWith('Labor (')) {
    if (locale === 'ar') return label.replace('Labor', 'العمالة')
    if (locale === 'fr') return label.replace('Labor', 'Travail')
    if (locale === 'es') return label.replace('Labor', 'Mano de obra')
  }
  const copy = competitorBreakdownLabels[locale]
  return copy[label as keyof typeof copy] ?? label
}

export function getLocalizedCompetitorSource(locale: PricingUiLocale, source: string) {
  const copy = competitorSourceLabels[locale]
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
        }]?.[locale] ?? item
      )
      .join(', ')

    return {
      en: `Tenzo doesn't offer: ${translatedList}`,
      ar: `Tenzo لا يقدّم: ${translatedList}`,
      fr: `Tenzo ne propose pas : ${translatedList}`,
      es: `Tenzo no ofrece: ${translatedList}`,
    }[locale]
  }
  const copy = competitorNotes[locale]
  return copy[note as keyof typeof copy] ?? note
}

export function getLocalizedCompetitorLimitation(locale: PricingUiLocale, limitation: string) {
  const copy = competitorLimitations[locale]
  return copy[limitation as keyof typeof copy] ?? limitation
}

export function getCoreProAdvantageText(
  locale: PricingUiLocale,
  values: {
    cheaperAt: number
    breakEven: number
    proPrice: number
    litePrice: number
  }
) {
  return formatMessage(coreProAdvantageCopy[locale], values)
}

export function formatAnnualAmount(locale: PricingUiLocale, amount: string) {
  return formatMessage(annualAmountTemplates[locale], { amount })
}

export function getLocalizedLayerName(locale: PricingUiLocale, layer: 'report' | 'core' | null) {
  if (!layer) return ''
  return layerLabels[locale][layer]
}
