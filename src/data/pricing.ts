// ═══════════════════════════════════════════════════════════════════════════
// SUNDAE PRICING DATA — SINGLE SOURCE OF TRUTH
// ═══════════════════════════════════════════════════════════════════════════
// ✅ UPDATED: 2026-01-01 to match sundae_pricing_card_v2.md
// ⚠️ ALL pricing values verified against canonical pricing sheet
// ⚠️ Do NOT modify without updating tests in __tests__/pricing.test.ts

export type ReportTier = 'lite' | 'plus' | 'pro';
export type CoreTier = 'lite' | 'pro';
export type ModuleId = 'labor' | 'inventory' | 'purchasing' | 'marketing' | 'reservations';
export type WatchtowerId = 'competitive' | 'events' | 'trends' | 'bundle';
export type ClientType = 'independent' | 'growth' | 'multi-site' | 'enterprise' | 'franchise';

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
    aiCredits: { base: 40, perLocation: 8 },
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
    basePrice: 49,
    additionalLocationPrice: 29,
    aiCredits: { base: 150, perLocation: 30 },
    aiSeats: 3,
    benchmarkMetrics: 15,
    benchmarkRadius: '1-2km adjustable',
    segmentFilters: '1 simultaneous filter',
    visuals: 50,
    dataInput: 'AI-parsed upload (PDF/Excel/Screenshot)',
    dataRetention: 'Current month + 1 year',
    refresh: 'Manual or AI-parsed (daily EOD)',
    support: 'Email + Chat (24hr)',
    rolloverPolicy: '25% (max 50)',
    customDashboards: 'Pre-built + custom',
    features: [
      '50 comprehensive visuals',
      'AI-parsed data ingestion (2-3 min process)',
      '15 key benchmark metrics',
      '1-2km adjustable radius',
      'Percentile rankings',
      'Weekly + monthly AI summaries',
      'Dashboard sharing (internal only)',
      'Basic commenting',
      '25% credit rollover (max 50)',
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
    basePrice: 99,
    additionalLocationPrice: 49,
    aiCredits: { base: 400, perLocation: 80 },
    aiSeats: 5,
    benchmarkMetrics: 30,
    benchmarkRadius: '1-3km adjustable',
    segmentFilters: '2 simultaneous filters',
    visuals: 120,
    dataInput: 'API integration (automated)',
    dataRetention: 'Current month + 2 years',
    refresh: 'Fully automated API (daily EOD)',
    support: 'Email + Chat (12hr)',
    rolloverPolicy: '25% (max 100)',
    customDashboards: 'Pre-built + custom',
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
      '25% credit rollover (max 100)',
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
    basePrice: 169,
    additionalLocationPrice: 54,
    aiCredits: { base: 800, perLocation: 160 },
    aiSeats: 10,
    benchmarkMetrics: '30+',
    benchmarkRadius: '1-5km',
    visuals: 200,
    dataInput: 'Real-time POS API',
    dataRetention: 'Current month + 2 years',
    refresh: '4-hour refresh cycle',
    support: 'Email + Chat + Phone (4hr)',
    rolloverPolicy: '25% (max 200)',
    customDashboards: 30,
    customKPIs: 0,
    predictiveDays: 14,
    posIntegrations: '1 system',
    multiPOS: false,
    salesAnalyticsIncluded: true,
    features: [
      'Real-time POS integration (4-hour refresh)',
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
      '25% credit rollover (max 200)'
    ],
    limitations: [
      'Single POS system only',
      '4-hour refresh (not 2-hour)',
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
    basePrice: 319,
    additionalLocationPrice: 49,
    aiCredits: { base: 1400, perLocation: 280 },
    aiSeats: 20,
    benchmarkMetrics: '30+',
    benchmarkRadius: '0.5-10km',
    visuals: 200,
    dataInput: 'Real-time POS API',
    dataRetention: 'Current month + 3 years',
    refresh: '2-hour refresh cycle',
    support: 'Email + Chat + Phone (2hr priority)',
    rolloverPolicy: '25% (max 350)',
    customDashboards: 75,
    customKPIs: 10,
    predictiveDays: 30,
    posIntegrations: 'Unlimited (multi-POS)',
    multiPOS: true,
    salesAnalyticsIncluded: true,
    features: [
      'Everything in Core Lite PLUS:',
      '2-hour data refresh (vs 4-hour)',
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
    aiCredits: { base: 'Unlimited', perLocation: 'Unlimited' },
    aiSeats: 'Unlimited',
    benchmarkMetrics: '30+',
    benchmarkRadius: 'Custom geography',
    visuals: 200,
    dataInput: 'Real-time POS API',
    dataRetention: 'Custom (typically 5+ years)',
    refresh: 'Custom (configurable)',
    support: 'Dedicated CSM (24/7 available, 15min SLA)',
    rolloverPolicy: 'N/A (unlimited)',
    customDashboards: 'Unlimited',
    customKPIs: 'Unlimited',
    predictiveDays: 'Custom horizon',
    posIntegrations: 'Unlimited + custom',
    multiPOS: true,
    salesAnalyticsIncluded: true,
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
// MODULES (Add-ons for Core tier only)
// ═══════════════════════════════════════════════════════════════════════════

export const modules = {
  labor: {
    id: 'labor',
    name: 'Labor Intelligence',
    icon: '👥',
    orgLicensePrice: 139,
    perLocationPrice: 19,
    includedLocations: 5,
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
    orgLicensePrice: 139,
    perLocationPrice: 19,
    includedLocations: 5,
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
    orgLicensePrice: 119,
    perLocationPrice: 15,
    includedLocations: 5,
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
    orgLicensePrice: 169,
    perLocationPrice: 25,
    includedLocations: 5,
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
    orgLicensePrice: 119,
    perLocationPrice: 15,
    includedLocations: 5,
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
    basePrice: 720,
    perLocationPrice: 82,
    includedLocations: 1,
    individualBaseTotal: 847,
    individualPerLocTotal: 97,
    baseSavings: 127,
    perLocSavings: 15,
    savingsPercent: 15,
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
    valueProposition: 'Full market intelligence at 15% discount'
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// CLIENT TYPE RULES
// ═══════════════════════════════════════════════════════════════════════════

export const CLIENT_TYPE_RULES: Record<ClientType, {
  locationRange: [number, number | null];
  discountTier: number;
  pricingModel: 'standard' | 'growth' | 'enterprise';
  features: string[];
}> = {
  'independent': {
    locationRange: [1, 2],
    discountTier: 0,
    pricingModel: 'standard',
    features: ['Standard pricing', 'Self-service onboarding']
  },
  'growth': {
    locationRange: [3, 24],
    discountTier: 10,
    pricingModel: 'growth',
    features: ['10% growth discount', 'Priority onboarding', 'Quarterly reviews']
  },
  'multi-site': {
    locationRange: [25, 29],
    discountTier: 15,
    pricingModel: 'growth',
    features: ['15% multi-site discount', 'Dedicated onboarding', 'Monthly reviews']
  },
  'enterprise': {
    locationRange: [30, null],
    discountTier: 0,
    pricingModel: 'enterprise',
    features: ['Volume or Org License pricing', 'Dedicated CSM', 'Custom SLA']
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
  if (locations <= 2) return 'independent';
  if (locations <= 24) return 'growth';
  if (locations <= 29) return 'multi-site';
  return 'enterprise';
}

// ═══════════════════════════════════════════════════════════════════════════
// EARLY ADOPTER PROGRAM
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
// BREAK-EVEN POINTS (For backward compatibility)
// ═══════════════════════════════════════════════════════════════════════════

export const BREAK_EVEN_POINTS = {
  sundaeVsTenzo: { locations: 3, description: 'Sundae becomes cheaper than Tenzo' },
  coreProVsLite: { locations: null, description: 'Core Pro is premium-priced at all scales for premium features' },
  enterprise: { locations: 30, description: 'Qualifies for Enterprise pricing' }
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
  effectiveDate: 'January 1, 2026',
  currency: 'USD',
  taxNote: 'Taxes (VAT/GST) not included unless stated',
  changeNotice: 'Subject to change with 30-day notice',
  supportHours: 'M-F 9am-6pm UTC+4 (Report), M-F 8am-8pm UTC+4 (Core)',
  locationPricingNote: 'Additional locations are billed from location #2 onward (location #1 is included in the base price)'
};
