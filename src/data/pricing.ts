// ═══════════════════════════════════════════════════════════════════════════
// SUNDAE PRICING DATA — SINGLE SOURCE OF TRUTH
// ═══════════════════════════════════════════════════════════════════════════
// ✅ UPDATED: 2026-02-17 to match sundae_final_pricing_v4.3.md
// ⚠️ ALL pricing values verified against canonical pricing sheet v4.3
// ⚠️ Do NOT modify without updating tests in __tests__/pricing.test.ts

export type ReportTier = 'lite' | 'plus' | 'pro';
export type CoreTier = 'lite' | 'pro';
export type ModuleId = 'labor' | 'inventory' | 'purchasing' | 'marketing' | 'reservations' | 'profit' | 'revenue' | 'delivery' | 'guest' | 'pulse';
export type BundleId = 'ops_suite' | 'growth_suite' | 'finance_addon' | 'channel_suite' | 'realtime_suite' | 'complete_intelligence';
export type WatchtowerId = 'competitive' | 'events' | 'trends' | 'bundle';
export type ClientType = 'independent' | 'growth' | 'multi-site' | 'enterprise' | 'franchise';
export type BillingCycle = 'monthly' | 'annual' | 'two_year';

// ═══════════════════════════════════════════════════════════════════════════
// PRICING CHANGELOG
// ═══════════════════════════════════════════════════════════════════════════

export interface PricingChange {
  id: string;
  date: string;
  summary: string;
  sectionsTouched: string[];
  notes: string;
}

export const pricingChangelog: PricingChange[] = [
  {
    id: 'update-2026-01-01',
    date: '2026-01-01',
    summary: 'Complete pricing update to match canonical pricing sheet v2',
    sectionsTouched: [
      'Report tiers',
      'Core tiers',
      'Modules',
      'Watchtower',
      'Features comparison',
      'Add-ons'
    ],
    notes: 'Updated all pricing values, feature entitlements, AI credits, benchmarking details, data retention, and support SLAs to match sundae_pricing_card_v2.md. Added comprehensive feature comparison tables and FAQ content.'
  },
  {
    id: 'update-2026-02-17-v4.3',
    date: '2026-02-17',
    summary: 'Complete pricing update to match sundae_final_pricing_v4.3.md',
    sectionsTouched: [
      'Report tiers',
      'Core tiers',
      'Modules',
      'Watchtower',
      'Module bundles',
      'Discounts',
      'Setup fees',
      'AI credits',
      'Users model',
      'Data refresh',
      'Enterprise eligibility',
      'Trial policy'
    ],
    notes: 'v4.3: Updated all tier pricing (Report Plus $59, Pro $119, Core Lite $199, Pro $349). AI credits 10x increase. Added Pulse module. Added 6 module bundles. Changed discount model to non-stacking volume/billing (max 15%). Added setup fees. Changed watchtower bundle from $720 to $699 (~18% savings). Updated users model and data refresh terminology.'
  }
];

// ═══════════════════════════════════════════════════════════════════════════
// REPORT TIERS
// ═══════════════════════════════════════════════════════════════════════════

export const reportTiers = {
  lite: {
    id: 'report-lite',
    name: 'Report Lite',
    tagline: 'FREE Forever',
    basePrice: 0,
    additionalLocationPrice: 0,
    aiCredits: { base: 400, perLocation: 80 },
    aiSeats: 1,
    benchmarkMetrics: 5,
    benchmarkRadius: '1km (locked)',
    segmentFilters: '"All restaurants" only',
    visuals: 20,
    dataInput: 'Manual CSV',
    dataRetention: 'Current month + 90 days',
    refresh: 'Manual upload',
    support: 'Email (72hr)',
    rolloverPolicy: 'No rollover',
    customDashboards: 'Pre-built only',
    additionalSeatCost: 12,
    historicalData: '90 days',
    chatWithData: false,
    pulseAccess: false,
    apiAccess: false,
    modulesAllowed: false,
    watchtowerAllowed: false,
    aiPackages: false,
    features: [
      '20 core visuals',
      'Pre-built dashboard layouts',
      'Basic filtering',
      '5 core benchmark metrics',
      'Anonymous peer comparison only',
      '1km radius (locked)',
      'Monthly AI summary',
      'Current month + 90 days retention'
    ],
    limitations: [
      'Manual CSV upload only',
      'No AI-parsed uploads',
      'No API integration',
      'No dashboard sharing',
      'No custom date ranges',
      'No multi-location comparison',
      'No rollover credits'
    ],
    bestFor: 'Testing Sundae, Basic visibility, Proof of concept'
  },

  plus: {
    id: 'report-plus',
    name: 'Report Plus',
    tagline: 'Automated Insights',
    basePrice: 59,
    additionalLocationPrice: 25,
    aiCredits: { base: 1500, perLocation: 300 },
    aiSeats: 5,
    benchmarkMetrics: 15,
    benchmarkRadius: '1-2km adjustable',
    segmentFilters: '1 simultaneous filter',
    visuals: 50,
    dataInput: 'AI-parsed upload (PDF/Excel/Screenshot)',
    dataRetention: 'Current month + 1 year',
    refresh: 'Daily EOD (AI-assisted)',
    support: 'Email + Chat (24hr)',
    rolloverPolicy: '25% (max 375)',
    customDashboards: 'Pre-built + custom',
    additionalSeatCost: 10,
    historicalData: '1 year',
    chatWithData: false,
    pulseAccess: false,
    apiAccess: false,
    modulesAllowed: false,
    watchtowerAllowed: false,
    aiPackages: false,
    features: [
      '50 comprehensive visuals',
      'AI-parsed data ingestion (2-3 min process)',
      '15 key benchmark metrics',
      '1-2km adjustable radius',
      'Percentile rankings',
      'Weekly + monthly AI summaries',
      'Dashboard sharing (internal only)',
      'Basic commenting',
      '25% credit rollover',
      'Custom date ranges'
    ],
    limitations: [
      'No API integration (manual/AI-parsed only)',
      'No real-time data',
      'No correlation analysis',
      'No multi-location comparison',
      'Single segment filter only'
    ],
    bestFor: 'Serious single-location, Automated data input, Regular AI insights'
  },

  pro: {
    id: 'report-pro',
    name: 'Report Pro',
    tagline: 'API-Powered Analytics',
    basePrice: 119,
    additionalLocationPrice: 35,
    aiCredits: { base: 4000, perLocation: 800 },
    aiSeats: 15,
    benchmarkMetrics: 30,
    benchmarkRadius: '1-3km adjustable',
    segmentFilters: '2 simultaneous filters',
    visuals: 120,
    dataInput: 'API integration (automated)',
    dataRetention: 'Current month + 2 years',
    refresh: 'Daily EOD (automated API)',
    support: 'Email + Chat (12hr)',
    rolloverPolicy: '25% (max 1000)',
    customDashboards: 'Pre-built + custom',
    additionalSeatCost: 8,
    historicalData: '2 years',
    chatWithData: { available: true, unlockFee: 49 },
    pulseAccess: { available: true, unlockFee: 99 },
    apiAccess: true,
    modulesAllowed: false,
    watchtowerAllowed: false,
    aiPackages: false,
    features: [
      'Up to 120 comprehensive visuals',
      'Full API integration',
      'Zero manual effort data updates',
      '30 full benchmark metrics',
      '1-3km adjustable radius',
      'Percentile + portfolio comparison',
      '2 simultaneous segment filters',
      'Correlation analysis',
      'Multi-location comparison',
      'Full commenting with @mentions',
      '2 custom shared views',
      '25% credit rollover',
      'Chat with visual (2 credits)'
    ],
    limitations: [
      'Next-day data (not real-time)',
      'No predictive analytics',
      'No real-time anomaly detection'
    ],
    bestFor: 'Multi-location operators, API automation, Advanced analytics, Portfolio prep'
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// CORE TIERS
// ═══════════════════════════════════════════════════════════════════════════

export const coreTiers = {
  lite: {
    id: 'core-lite',
    name: 'Core Lite',
    tagline: 'Real-Time Operations',
    basePrice: 199,
    additionalLocationPrice: 39,
    aiCredits: { base: 8000, perLocation: 1600 },
    aiSeats: 10,
    aiSeatsPerLocation: 2,
    benchmarkMetrics: '30+',
    benchmarkRadius: '1-5km',
    visuals: 200,
    dataInput: 'Real-time POS API',
    dataRetention: 'Current month + 2 years',
    refresh: '15-min refresh',
    support: 'Chat (4hr SLA)',
    rolloverPolicy: '25% (max 2000)',
    customDashboards: 30,
    customKPIs: 0,
    predictiveDays: 14,
    posIntegrations: '1 system',
    multiPOS: false,
    salesAnalyticsIncluded: true,
    additionalSeatCost: 5,
    historicalData: '2 years',
    chatWithData: { available: true, unlockFee: 0 },
    pulseAccess: { available: true, unlockFee: 0 },
    apiAccess: true,
    modulesAllowed: true,
    watchtowerAllowed: true,
    aiPackages: true,
    features: [
      'Real-time POS integration (15-min refresh)',
      'FULL sales analytics included',
      '30+ benchmark metrics',
      '1-5km adjustable radius',
      '3+ simultaneous segment filters',
      '14-day predictive forecasting',
      'Portfolio management (2+ locations)',
      'Real-time anomaly detection',
      'Location comparison & ranking',
      '30 custom dashboards',
      'AI Chart Builder',
      'Quarterly reviews (optional)',
      '25% credit rollover'
    ],
    limitations: [
      'Single POS system only',
      '15-min refresh (not 5-min)',
      '14-day forecasting (not 30-day)',
      'No custom KPI builder',
      'No multi-POS support'
    ],
    bestFor: '1-10 locations, Real-time operations, Portfolio management, Single POS system'
  },

  pro: {
    id: 'core-pro',
    name: 'Core Pro',
    tagline: 'Portfolio Intelligence',
    basePrice: 349,
    additionalLocationPrice: 35,
    aiCredits: { base: 14000, perLocation: 2800 },
    aiSeats: 25,
    aiSeatsPerLocation: 5,
    benchmarkMetrics: '30+',
    benchmarkRadius: '0.5-10km',
    visuals: 200,
    dataInput: 'Real-time POS API',
    dataRetention: 'Current month + 3 years',
    refresh: '5-min refresh',
    support: 'Phone (2hr priority)',
    rolloverPolicy: '25% (max 3500)',
    customDashboards: 75,
    customKPIs: 10,
    predictiveDays: 30,
    posIntegrations: 'Unlimited (multi-POS)',
    multiPOS: true,
    salesAnalyticsIncluded: true,
    additionalSeatCost: 5,
    historicalData: '3 years',
    chatWithData: { available: true, unlockFee: 0 },
    pulseAccess: { available: true, unlockFee: 0 },
    apiAccess: true,
    modulesAllowed: true,
    watchtowerAllowed: true,
    aiPackages: true,
    features: [
      'Everything in Core Lite PLUS:',
      '5-min data refresh (vs 15-min)',
      '30-day predictive forecasting',
      'Multi-POS support (unlimited systems)',
      'Consolidated cross-platform analytics',
      '0.5-10km benchmark radius',
      'Unlimited segment filters',
      'Custom peer groups',
      'Portfolio comparison across markets',
      '75 custom dashboards',
      '10 custom KPIs',
      'AI Chart Builder Advanced',
      'Advanced forecasting models',
      'Multi-channel attribution',
      'Best practice identification',
      'Monthly strategic reviews',
      'Dashboard scheduling'
    ],
    limitations: [],
    bestFor: '10-50 locations, Multi-POS environments, Advanced forecasting, Strategic planning'
  },

  enterprise: {
    id: 'core-enterprise',
    name: 'Enterprise',
    tagline: 'Custom Solutions',
    basePrice: 'Custom',
    additionalLocationPrice: 'Volume-based',
    aiCredits: { base: 50000, perLocation: 5000 },
    aiSeats: 'Unlimited',
    benchmarkMetrics: '30+',
    benchmarkRadius: 'Custom geography',
    visuals: 200,
    dataInput: 'Real-time POS API',
    dataRetention: 'Custom (typically 5+ years)',
    refresh: 'Real-time',
    support: 'Dedicated CSM (24/7 available, 15min SLA)',
    rolloverPolicy: 'N/A (unlimited)',
    customDashboards: 'Unlimited',
    customKPIs: 'Unlimited',
    predictiveDays: 'Custom horizon',
    posIntegrations: 'Unlimited + custom',
    multiPOS: true,
    salesAnalyticsIncluded: true,
    historicalData: 'Custom',
    chatWithData: { available: true, unlockFee: 0 },
    pulseAccess: { available: true, unlockFee: 0 },
    apiAccess: true,
    modulesAllowed: true,
    watchtowerAllowed: true,
    aiPackages: true,
    setupFeesWaived: true,
    features: [
      'Everything in Core Pro PLUS:',
      'Dedicated CSM',
      '24/7 support available',
      '15-minute SLA (critical)',
      'Unlimited AI credits & seats',
      'Custom data refresh schedules',
      'Custom ML models',
      'Dedicated AI resources',
      'Private peer groups',
      'Proprietary benchmarks',
      'Multi-brand management',
      'Regional aggregation',
      'Executive dashboards',
      'Full CRUD API access',
      'Custom integrations included',
      'Dedicated endpoints',
      'White-label reporting',
      'Custom onboarding program',
      'Quarterly executive reviews',
      'Archival options'
    ],
    limitations: [],
    bestFor: '100+ locations OR enterprise features required (Dedicated CSM, 24/7, SSO, SLAs, security/compliance), Multi-brand portfolios',
    note: 'Enterprise pricing is scope-based and includes volume discounts. Typically starts at 100+ locations or when enterprise requirements apply (SSO, SLAs, security/compliance, dedicated CSM, custom ML, white-label, custom integrations).'
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// MODULES (Add-ons for Core tier only; Pulse also on Report Pro with unlock)
// ═══════════════════════════════════════════════════════════════════════════

export const modules = {
  labor: {
    id: 'labor',
    name: 'Labor Intelligence',
    icon: '👥',
    orgLicensePrice: 169,
    perLocationPrice: 17,
    includedLocations: 5,
    setupFee: 299,
    setupIncludes: '1 labor/scheduling system integration',
    prerequisites: [] as string[],
    description: 'Labor cost %, sales per labor hour, actual vs scheduled variance, overtime analysis, break compliance, benchmarking, predictive staffing, demand-based scheduling, shift performance, server rankings',
    features: [
      'Labor cost % by location/day part',
      'Sales per labor hour tracking',
      'Actual vs scheduled variance',
      'Overtime pattern analysis',
      'Break compliance tracking',
      'Labor productivity benchmarking',
      'Predictive staffing recommendations',
      'Demand-based scheduling',
      'Shift performance analysis',
      'Server productivity rankings',
      'Monthly Labor Analytics Report'
    ],
    roiPotential: '1-3% labor cost reduction'
  },

  inventory: {
    id: 'inventory',
    name: 'Inventory Connect',
    icon: '📦',
    orgLicensePrice: 179,
    perLocationPrice: 19,
    includedLocations: 5,
    setupFee: 499,
    setupIncludes: '1 inventory management system integration',
    prerequisites: [] as string[],
    description: 'COGS tracking, recipe costing, theoretical vs actual variance, menu engineering, waste tracking, menu item profitability, price optimization, portion cost, inventory turnover, supplier performance',
    features: [
      'COGS tracking by category',
      'Recipe costing & management',
      'Theoretical vs actual variance',
      'Menu engineering analysis',
      'Waste tracking & cost calculation',
      'Menu item profitability ranking',
      'Price optimization recommendations',
      'Portion cost analysis',
      'Inventory turnover ratios',
      'Supplier performance scoring',
      'Monthly Inventory Analytics Report'
    ],
    roiPotential: '0.5-2% food cost reduction'
  },

  purchasing: {
    id: 'purchasing',
    name: 'Purchasing Analytics',
    icon: '🛒',
    orgLicensePrice: 129,
    perLocationPrice: 12,
    includedLocations: 5,
    setupFee: 299,
    setupIncludes: '1 purchasing/vendor system integration',
    prerequisites: [] as string[],
    description: 'Spend analysis by supplier, price variance alerts, supplier performance, contract compliance, consolidation opportunities, volume discount analysis, order frequency optimization, delivery cost, contract renewal alerts',
    features: [
      'Spend analysis by supplier',
      'Price variance alerts',
      'Supplier performance tracking',
      'Contract compliance monitoring',
      'Consolidation opportunities',
      'Volume discount analysis',
      'Order frequency optimization',
      'Delivery cost analysis',
      'Contract renewal alerts',
      'Monthly Purchasing Analytics Report'
    ],
    roiPotential: '2-5% purchasing savings'
  },

  marketing: {
    id: 'marketing',
    name: 'Marketing Performance',
    icon: '📣',
    orgLicensePrice: 199,
    perLocationPrice: 20,
    includedLocations: 5,
    setupFee: 299,
    setupIncludes: 'Up to 3 marketing platform integrations',
    prerequisites: [] as string[],
    description: 'Meta/Facebook Ads, Google Ads integration, campaign performance, multi-touch attribution, CAC, channel ROI by location, budget allocation, new vs returning customers, lifetime value estimation',
    features: [
      'Meta/Facebook Ads integration',
      'Google Ads integration',
      'Campaign performance tracking',
      'Multi-touch attribution',
      'Customer acquisition cost (CAC)',
      'Channel ROI by location',
      'Budget allocation recommendations',
      'New vs returning customer tracking',
      'Lifetime value estimation',
      'Monthly Marketing Analytics Report'
    ],
    roiPotential: '10-20% marketing efficiency improvement'
  },

  reservations: {
    id: 'reservations',
    name: 'Reservations Intelligence',
    icon: '📅',
    orgLicensePrice: 129,
    perLocationPrice: 12,
    includedLocations: 5,
    setupFee: 299,
    setupIncludes: '1 reservation system integration',
    prerequisites: [] as string[],
    description: 'Booked vs actual, no-show rate tracking, booking channel attribution, table utilization, revenue per reservation, optimal booking pace, cancellation pattern analysis',
    features: [
      'Covers booked vs actual',
      'No-show rate tracking',
      'Booking channel attribution',
      'Table utilization analysis',
      'Revenue per reservation',
      'Optimal booking pace',
      'Cancellation pattern analysis',
      'Monthly Reservations Report'
    ],
    roiPotential: '5-10% table utilization improvement',
    note: 'Only for standalone reservation systems (OpenTable, Resy, SevenRooms). POS-based reservations included in Core Lite/Pro (no add-on charge).'
  },

  profit: {
    id: 'profit',
    name: 'Profit Intelligence',
    icon: '💰',
    orgLicensePrice: 229,
    perLocationPrice: 22,
    includedLocations: 5,
    setupFee: 0,
    setupIncludes: 'Uses Labor + Inventory data (no new integration)',
    prerequisites: ['labor', 'inventory'],
    prerequisiteMessage: 'Requires Labor Intelligence and Inventory Connect',
    description: 'See true unit economics. Complete P&L visibility, profit margin analysis, cost allocation, break-even analysis, and profitability forecasting by location.',
    features: [
      'True unit economics per location',
      'Complete P&L visibility',
      'Profit margin analysis by daypart',
      'Cost allocation tracking',
      'Break-even analysis',
      'Profitability forecasting',
      'Location-level profit ranking',
      'Monthly Profit Analytics Report'
    ],
    roiPotential: 'See true unit economics',
    tier: 'Super Premium',
    isNew: false
  },

  revenue: {
    id: 'revenue',
    name: 'Revenue Assurance',
    icon: '🔒',
    orgLicensePrice: 109,
    perLocationPrice: 10,
    includedLocations: 5,
    setupFee: 149,
    setupIncludes: 'POS transaction-level data configuration',
    prerequisites: [] as string[],
    description: 'Catch 1-2% leakage. Identify revenue loss from voids, comps, discounts, theft patterns, and transaction anomalies before they impact your bottom line.',
    features: [
      'Revenue leakage detection',
      'Void pattern analysis',
      'Comp and discount tracking',
      'Theft pattern identification',
      'Transaction anomaly alerts',
      'Employee behavior analysis',
      'Shrinkage quantification',
      'Monthly Revenue Assurance Report'
    ],
    roiPotential: 'Catch 1-2% leakage',
    tier: 'Protection',
    isNew: false
  },

  delivery: {
    id: 'delivery',
    name: 'Delivery Economics',
    icon: '🛵',
    orgLicensePrice: 169,
    perLocationPrice: 17,
    includedLocations: 5,
    setupFee: 499,
    setupIncludes: 'Up to 3 delivery platform integrations',
    prerequisites: [] as string[],
    description: 'True delivery profitability. Platform-by-platform margin analysis, delivery vs dine-in comparison, commission impact, and channel optimization insights.',
    features: [
      'True delivery profitability',
      'Platform-by-platform margin analysis',
      'Delivery vs dine-in comparison',
      'Commission impact tracking',
      'Driver efficiency metrics',
      'Peak delivery time optimization',
      'Channel mix optimization',
      'Monthly Delivery Economics Report'
    ],
    roiPotential: 'True delivery profitability',
    tier: 'Channel',
    isNew: false
  },

  guest: {
    id: 'guest',
    name: 'Guest Experience',
    icon: '⭐',
    orgLicensePrice: 99,
    perLocationPrice: 10,
    includedLocations: 5,
    setupFee: 249,
    setupIncludes: 'Up to 5 review platform integrations',
    prerequisites: [] as string[],
    description: 'Why customers leave. Aggregate review sentiment, rating trends, guest feedback patterns, and experience correlation to identify what drives satisfaction.',
    features: [
      'Aggregate review sentiment',
      'Rating trend analysis',
      'Guest feedback patterns',
      'Experience-revenue correlation',
      'Service speed impact',
      'Menu item satisfaction',
      'Repeat visit indicators',
      'Monthly Guest Experience Report'
    ],
    roiPotential: 'Why customers leave',
    tier: 'Insight',
    isNew: false
  },

  pulse: {
    id: 'pulse',
    name: 'Pulse',
    icon: '📡',
    orgLicensePrice: 199,
    perLocationPrice: 24,
    includedLocations: 5,
    setupFee: 399,
    setupIncludes: '1 POS + 1 Labor + 1 Inventory system integration',
    additionalIntegrationFee: 149,
    prerequisites: [] as string[],
    isPremium: true,
    description: 'Real-time operational pulse. Live monitoring, instant alerts, cross-system correlation, and proactive anomaly detection across all your operations.',
    features: [
      'Real-time operational monitoring',
      'Instant anomaly alerts',
      'Cross-system data correlation',
      'Proactive issue detection',
      'Live performance dashboards',
      'Threshold-based notifications',
      'Multi-system health monitoring',
      'Monthly Pulse Analytics Report'
    ],
    roiPotential: 'Real-time operational awareness',
    tier: 'Premium',
    isNew: true,
    integrationCreditRules: {
      laborSameSystem: 299,
      inventorySameSystem: 499,
      maxCredit: 399
    }
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// MODULE BUNDLES (10-20% monthly discount)
// ═══════════════════════════════════════════════════════════════════════════

export const moduleBundles = {
  ops_suite: {
    id: 'ops_suite',
    name: 'Ops Suite',
    modules: ['labor', 'inventory', 'purchasing'] as ModuleId[],
    basePrice: 429,
    perLocationPrice: 43,
    discountPercent: 10,
    setupFee: 879,
    prerequisites: [] as string[],
  },
  growth_suite: {
    id: 'growth_suite',
    name: 'Growth Suite',
    modules: ['marketing', 'reservations', 'guest'] as ModuleId[],
    basePrice: 385,
    perLocationPrice: 38,
    discountPercent: 10,
    setupFee: 679,
    prerequisites: [] as string[],
  },
  finance_addon: {
    id: 'finance_addon',
    name: 'Finance Add-On',
    modules: ['profit', 'revenue'] as ModuleId[],
    basePrice: 304,
    perLocationPrice: 29,
    discountPercent: 10,
    setupFee: 149,
    prerequisites: ['labor', 'inventory'],
    prerequisiteMessage: 'Requires Ops data (Labor + Inventory modules)',
  },
  channel_suite: {
    id: 'channel_suite',
    name: 'Channel Suite',
    modules: ['delivery', 'marketing'] as ModuleId[],
    basePrice: 331,
    perLocationPrice: 33,
    discountPercent: 10,
    setupFee: 639,
    prerequisites: [] as string[],
  },
  realtime_suite: {
    id: 'realtime_suite',
    name: 'Real-time Suite',
    modules: ['pulse', 'revenue'] as ModuleId[],
    basePrice: 277,
    perLocationPrice: 31,
    discountPercent: 10,
    setupFee: 439,
    prerequisites: [] as string[],
  },
  complete_intelligence: {
    id: 'complete_intelligence',
    name: 'Complete Intelligence',
    modules: ['labor', 'inventory', 'purchasing', 'marketing', 'reservations', 'profit', 'revenue', 'delivery', 'guest', 'pulse'] as ModuleId[],
    basePrice: 1288,
    perLocationPrice: 130,
    discountPercent: 20,
    setupFee: 999,
    prerequisites: [] as string[],
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// WATCHTOWER (Add-ons for Core tier only)
// ═══════════════════════════════════════════════════════════════════════════

export const watchtower = {
  competitive: {
    id: 'competitive',
    name: 'Competitive Intelligence',
    icon: '🔍',
    basePrice: 399,
    perLocationPrice: 49,
    includedLocations: 1,
    description: 'Track 10 competitors per location, daily menu/pricing monitoring, pricing change alerts, photo/dish tracking, promotion monitoring, review sentiment, rating trends, competitor review comparison, social media monitoring, engagement metrics, competitive positioning, real-time alerts',
    features: [
      'Track 10 competitors per location',
      'Daily menu/pricing monitoring per location',
      'Pricing change alerts (location-specific)',
      'Photo/dish presentation tracking',
      'Promotion and special monitoring',
      'Review sentiment analysis (per location)',
      'Rating trend tracking',
      'Competitor review comparison',
      'Social media monitoring per location',
      'Engagement metrics tracking',
      'Competitive positioning analysis',
      'Real-time competitor change alerts'
    ],
    valueProposition: 'Prevent market share loss, optimize pricing strategy'
  },

  events: {
    id: 'events',
    name: 'Event & Calendar Signals',
    icon: '📅',
    basePrice: 199,
    perLocationPrice: 29,
    includedLocations: 1,
    description: 'Local event calendar, concert & entertainment tracking, conference & convention schedules, festival & holiday monitoring, local sports schedules, game day impact, weather correlation, temperature sensitivity, traffic patterns, tourism season tracking, cruise ship arrivals, convention center activity',
    features: [
      'Local event calendar (per location)',
      'Concert & entertainment tracking',
      'Conference & convention schedules',
      'Festival & holiday monitoring',
      'Local sports team schedules',
      'Game day impact analysis',
      'Weather correlation (location-specific)',
      'Temperature sensitivity analysis',
      'Traffic pattern correlation',
      'Tourism season tracking',
      'Cruise ship arrivals (if applicable)',
      'Convention center activity'
    ],
    valueProposition: 'Optimize staffing and inventory for demand spikes'
  },

  trends: {
    id: 'trends',
    name: 'Market Trends',
    icon: '📈',
    basePrice: 249,
    perLocationPrice: 19,
    includedLocations: 1,
    description: 'Google Trends integration (national + local), cuisine search demand, menu item popularity, category trends, demographic shifts, income level changes, local economic indicators, tourism indicators, real estate development, long-term demand forecasting, market saturation, competitive density',
    features: [
      'Google Trends integration (national + local)',
      'Cuisine search demand tracking',
      'Menu item popularity trends',
      'Category trend analysis',
      'Demographic shifts (location-specific)',
      'Income level changes',
      'Local economic indicators',
      'Tourism indicators',
      'Real estate development tracking',
      'Long-term demand forecasting',
      'Market saturation analysis',
      'Competitive density tracking'
    ],
    valueProposition: 'Stay ahead of market shifts, inform strategic decisions'
  },

  bundle: {
    id: 'bundle',
    name: 'Full Watchtower Bundle',
    icon: '🏰',
    basePrice: 699,
    perLocationPrice: 79,
    includedLocations: 1,
    individualBaseTotal: 847,
    individualPerLocTotal: 97,
    baseSavings: 148,
    perLocSavings: 18,
    savingsPercent: 17,
    savingsNote: 'approximately 18%',
    description: 'Complete market intelligence suite',
    includes: ['competitive', 'events', 'trends'],
    features: [
      'All Competitive Intelligence features',
      'All Event & Calendar features',
      'All Market Trends features',
      'Unified intelligence dashboard',
      'Cross-module insights',
      'Comprehensive monthly intelligence report'
    ],
    valueProposition: 'Full market intelligence at ~18% discount'
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// DISCOUNT RULES (v4.3 — non-stacking, max 15%)
// ═══════════════════════════════════════════════════════════════════════════

export const volumeDiscounts = {
  tiers: [
    { min: 1, max: 29, percent: 0, label: 'Standard pricing' },
    { min: 30, max: 99, percent: 5, label: 'Eligible for Enterprise' },
    { min: 100, max: 200, percent: 7, label: 'Eligible for Enterprise' },
    { min: 201, max: null, percent: 0, label: 'Enterprise only — custom pricing required' }
  ]
};

export const billingDiscounts: Record<BillingCycle, number> = {
  monthly: 0,
  annual: 10,
  two_year: 15
};

export const DISCOUNT_RULES = {
  stackingAllowed: false,
  maxDiscountPercent: 15,
  note: 'Volume OR Billing — choose one, not both'
};

// ═══════════════════════════════════════════════════════════════════════════
// CLIENT TYPE RULES (kept for backward compat, updated to v4.3 volume model)
// ═══════════════════════════════════════════════════════════════════════════

export const CLIENT_TYPE_RULES: Record<ClientType, {
  locationRange: [number, number | null];
  discountTier: number;
  pricingModel: 'standard' | 'growth' | 'enterprise';
  features: string[];
}> = {
  'independent': {
    locationRange: [1, 29],
    discountTier: 0,
    pricingModel: 'standard',
    features: ['Standard pricing', 'Self-service onboarding']
  },
  'growth': {
    locationRange: [30, 99],
    discountTier: 5,
    pricingModel: 'growth',
    features: ['5% volume discount', 'Eligible for Enterprise pricing']
  },
  'multi-site': {
    locationRange: [100, 200],
    discountTier: 7,
    pricingModel: 'growth',
    features: ['7% volume discount', 'Eligible for Enterprise pricing']
  },
  'enterprise': {
    locationRange: [30, null],
    discountTier: 0,
    pricingModel: 'enterprise',
    features: ['Custom Enterprise pricing', 'Dedicated CSM', 'Custom SLA']
  },
  'franchise': {
    locationRange: [1, null],
    discountTier: 0,
    pricingModel: 'enterprise',
    features: ['Franchise-specific pricing', 'Multi-entity support', 'Franchisee portal']
  }
};

export function detectClientType(locations: number, isFranchise = false): ClientType {
  if (isFranchise) return 'franchise';
  if (locations <= 29) return 'independent';
  if (locations <= 99) return 'growth';
  if (locations <= 200) return 'multi-site';
  return 'enterprise';
}

export function getVolumeDiscount(locations: number): number {
  const tier = volumeDiscounts.tiers.find(
    t => locations >= t.min && (t.max === null || locations <= t.max)
  );
  return tier?.percent ?? 0;
}

// ═══════════════════════════════════════════════════════════════════════════
// EARLY ADOPTER PROGRAM (kept for backward compatibility)
// ═══════════════════════════════════════════════════════════════════════════

export const EARLY_ADOPTER_TERMS = {
  discountPercent: 20,
  priceLockMonths: 24,
  extendedTrialDays: 30,
  bonusCredits: 500,
  features: [
    '20% founding member discount',
    '24-month price lock guarantee',
    '30-day extended trial (vs 14-day standard)',
    '500 bonus AI credits',
    'Early access to new features',
    'Founding member badge'
  ]
};

// ═══════════════════════════════════════════════════════════════════════════
// ENTERPRISE PRICING
// ═══════════════════════════════════════════════════════════════════════════

export const enterprisePricing = {
  minLocations: 30,

  eligibilityTriggers: [
    '30+ locations',
    '$10,000+/month projected spend',
    'Custom integration requirements',
    'SSO/SAML requirements',
    'Custom SLA requirements'
  ],

  eligibilityNote: 'Eligible customers may choose standard pricing with volume discount OR request custom Enterprise pricing',

  volumeDiscount: {
    id: 'enterprise-volume',
    name: 'Enterprise Volume',
    description: 'Best for single-brand chains with 30+ locations',
    tiers: [
      { min: 30, max: 50, monthly: 7500 },
      { min: 51, max: 100, monthly: 12000 },
      { min: 101, max: 200, monthly: 20000 },
      { min: 201, max: null, monthly: 'Custom' }
    ],
    includes: [
      'Unlimited POS integrations',
      'Unlimited AI seats and credits',
      'All modules included',
      'Full Watchtower bundle',
      'Dedicated CSM',
      '99.9% SLA',
      '24/7 priority support'
    ]
  },

  orgLicense: {
    id: 'enterprise-org',
    name: 'Enterprise Org License',
    description: 'Best for multi-brand portfolios',
    baseFee: 2500,
    perLocationTiers: [
      { min: 1, max: 10, price: 99 },
      { min: 11, max: 30, price: 79 },
      { min: 31, max: 50, price: 59 },
      { min: 51, max: null, price: 49 }
    ],
    includes: [
      'Platform for unlimited brands',
      'All modules (org-wide)',
      'Full Watchtower bundle',
      'Dedicated CSM',
      'Full API access'
    ]
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// WATCHTOWER ENTERPRISE TIERS (For backward compatibility)
// ═══════════════════════════════════════════════════════════════════════════

export const watchtowerEnterprise = {
  description: 'Volume pricing for large chains',
  tiers: [
    {
      name: 'Enterprise Standard',
      locationRange: [30, 50],
      bundlePrice: 2500,
      perModulePricing: {
        competitive: 1500,
        events: 800,
        trends: 600
      }
    },
    {
      name: 'Enterprise Plus',
      locationRange: [51, 100],
      bundlePrice: 4000,
      perModulePricing: {
        competitive: 2400,
        events: 1200,
        trends: 900
      }
    },
    {
      name: 'Enterprise Custom',
      locationRange: [101, null] as [number, null],
      bundlePrice: null,
      perModulePricing: null,
      note: 'Contact sales for custom enterprise pricing'
    }
  ]
};

// ═══════════════════════════════════════════════════════════════════════════
// SETUP FEE DISCOUNTS
// ═══════════════════════════════════════════════════════════════════════════

export const setupFeeDiscounts = {
  threeOrMoreModulesPercent: 20,
  completeIntelligencePercent: 50,
  annualPrepayPercent: 25,
  enterprisePercent: 100,
};

// ═══════════════════════════════════════════════════════════════════════════
// AI CREDIT SYSTEM
// ═══════════════════════════════════════════════════════════════════════════

export const aiCreditActions: Record<string, number> = {
  VIEW_SUMMARY: 5,
  CHAT: 8,
  INSIGHTS_WIDGET: 10,
  DOC_EXTRACT_TEXT: 12,
  INSIGHTS_CHAT: 12,
  DOC_EXTRACT_OCR: 18,
  DATA_ANALYSIS: 20,
  SQL_GENERATION: 15,
  CHAT_DATA_QUERY: 25,
  REPORT_GENERATION: 35,
};

export const aiCreditTopups = {
  report_lite: { 1000: 30 },
  report_plus: { 1000: 20, 3000: 55 },
  report_pro: { 1000: 15, 3000: 40, 5000: 60 },
  core_lite: { 1000: 12, 3000: 33, 5000: 50, 10000: 90 },
  core_pro: { 1000: 10, 3000: 27, 5000: 40, 10000: 70 },
};

export const aiCreditRollover = {
  capPercent: 25,
  durationMonths: 1,
  purchasedCreditsExpire: false,
  usageOrder: ['Rollover', 'Monthly', 'Purchased'],
};

// ═══════════════════════════════════════════════════════════════════════════
// AI PACKAGES (Core tiers only)
// ═══════════════════════════════════════════════════════════════════════════

export const aiPackages = {
  ai_plus: {
    id: 'ai_plus',
    name: 'AI Plus',
    monthlyFee: 399,
    dailyCap: 500,
    overflow: 'credit_wallet',
    availability: 'core_only',
  },
  ai_pro: {
    id: 'ai_pro',
    name: 'AI Pro',
    monthlyFee: 599,
    dailyCap: 1000,
    overflow: 'credit_wallet',
    availability: 'core_only',
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// TRIAL POLICY
// ═══════════════════════════════════════════════════════════════════════════

export const trialPolicy = {
  report_plus: { days: 14, cardRequired: false },
  report_pro: { days: 14, cardRequired: false },
  core_lite: { days: 14, cardRequired: true },
  core_pro: { days: 14, cardRequired: true },
  modules: { days: 7, cardRequired: true },
  watchtower: { days: 7, cardRequired: true },
};

// ═══════════════════════════════════════════════════════════════════════════
// BREAK-EVEN POINTS (For backward compatibility)
// ═══════════════════════════════════════════════════════════════════════════

export const BREAK_EVEN_POINTS = {
  sundaeVsTenzo: { locations: 3, description: 'Sundae becomes cheaper than Tenzo' },
  coreProVsLite: { locations: null, description: 'Core Pro is premium-priced at all scales for premium features' },
  enterprise: { locations: 30, description: 'Eligible for Enterprise pricing' }
};

// ═══════════════════════════════════════════════════════════════════════════
// COMPETITOR PRICING (For backward compatibility)
// ═══════════════════════════════════════════════════════════════════════════

export const competitorPricing = {
  tenzo: {
    name: 'Tenzo',
    setupFeePerModulePerLocation: 350,
    modules: {
      sales: 75,
      labor: 75,
      inventory: 75
    },
    limitations: [
      'No AI-powered insights',
      'No peer benchmarking',
      'No predictive analytics',
      'Setup fees required ($350/module/location)'
    ]
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// PRICING FOOTER
// ═══════════════════════════════════════════════════════════════════════════

export const pricingFooter = {
  effectiveDate: 'February 17, 2026',
  currency: 'USD',
  taxNote: 'Taxes (VAT/GST) not included unless stated',
  changeNotice: 'Subject to change with 30-day notice',
  supportHours: 'M-F 9am-6pm UTC+4 (Report), M-F 8am-8pm UTC+4 (Core)',
  locationPricingNote: 'Additional locations are billed from location #2 onward (location #1 is included in the base price)',
  bundleRoundingNote: 'Bundle prices rounded to nearest whole dollar'
};
