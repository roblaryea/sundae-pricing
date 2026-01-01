// ═══════════════════════════════════════════════════════════════════════════
// SUNDAE PRICING DATA — SINGLE SOURCE OF TRUTH
// ═══════════════════════════════════════════════════════════════════════════
// ⚠️ ALL pricing values verified against source documentation
// ⚠️ Do NOT modify without updating tests in __tests__/pricing.test.ts

export type ReportTier = 'lite' | 'plus' | 'pro';
export type CoreTier = 'lite' | 'pro';
export type ModuleId = 'labor' | 'inventory' | 'purchasing' | 'marketing' | 'reservations';
export type WatchtowerId = 'competitive' | 'events' | 'trends' | 'bundle';
export type ClientType = 'independent' | 'growth' | 'multi-site' | 'enterprise' | 'franchise';

// ═══════════════════════════════════════════════════════════════════════════
// REPORT TIERS — CORRECTED VALUES
// ═══════════════════════════════════════════════════════════════════════════

export const reportTiers = {
  lite: {
    id: 'report-lite',
    name: 'Report Lite',
    tagline: 'Free Forever',
    basePrice: 0,                          // ✅ FREE (Main Prompt had $29)
    additionalLocationPrice: 0,            // ✅ FREE for all locations
    aiCredits: { base: 40, perLocation: 8 },
    aiSeats: 1,                            // ✅ CORRECT (Main Prompt had 2)
    benchmarkMetrics: 5,
    benchmarkRadius: '1km (locked)',
    visuals: 20,
    dataInput: 'Manual CSV',
    dataRetention: 'Current month + 90 days',
    refresh: 'Manual upload',
    support: 'Email (72hr)',
    features: [
      '20 core visuals',
      'Pre-built dashboard layouts',
      'Basic filtering and date range selection',
      'Mobile-responsive viewing',
      'Monthly AI summary email',
      '5 benchmark metrics',
      'Anonymous peer comparison'
    ],
    limitations: [
      'Manual data upload required',
      'No dashboard sharing',
      'No export capabilities',
      '1km radius only (cannot zoom)',
      'Limited to 90-day history'
    ]
  },
  
  plus: {
    id: 'report-plus',
    name: 'Report Plus',
    tagline: 'Automated Insights',
    basePrice: 49,
    additionalLocationPrice: 29,
    aiCredits: { base: 150, perLocation: 30 },
    aiSeats: 3,                            // ✅ FIXED (Main Prompt had 2)
    benchmarkMetrics: 15,
    benchmarkRadius: '1-2km',              // ✅ FIXED (Main Prompt had '1-3km')
    visuals: 120,                          // ✅ FIXED (Main Prompt had 80)
    dataInput: 'AI-parsed upload',
    dataRetention: 'Current month + 1 year',
    refresh: 'Daily (EOD)',
    support: 'Email + Chat (24hr)',
    features: [
      '120 comprehensive visuals with drill-down',  // ✅ FIXED
      'AI-parsed data ingestion (drag & drop PDF/Excel/Screenshot)',
      '15 benchmark metrics',
      '1-2km radius with zoom control',            // ✅ FIXED
      'Weekly + monthly AI summaries',
      'Dashboard sharing & PDF export',
      'Variance alerts',
      'Basic commenting on visuals',
      '25% credit rollover (max 50)'
    ],
    limitations: [
      'Next-day data (not real-time)',
      'No predictive analytics',
      'No portfolio management',
      'Single segment filter only'
    ]
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
    benchmarkRadius: '1-3km',
    visuals: 120,
    dataInput: 'API integration',
    dataRetention: 'Current month + 2 years',
    refresh: 'Daily automated',
    support: 'Email + Chat (12hr)',
    features: [
      'All 120+ visuals with advanced analytics',
      'Full API integration with POS',
      'Automated daily data pull',
      '30 benchmark metrics with filtering',
      '1-3km radius with zoom control',
      '2 simultaneous segment filters',
      'Chat with visual (150 char, 2 credits)',
      'Multi-location comparison dashboard',
      'Full commenting with @mentions',
      '25% credit rollover (max 100)'
    ],
    limitations: [
      'Next-day data (not real-time)',
      'No predictive analytics',
      'No portfolio management'
    ]
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// CORE TIERS — VALUES VERIFIED
// ═══════════════════════════════════════════════════════════════════════════

export const coreTiers = {
  lite: {
    id: 'core-lite',
    name: 'Core Lite',
    tagline: 'Real-Time Operations',
    basePrice: 169,
    additionalLocationPrice: 54,          // WAS $49 → NOW $54 (fixes inversion)
    aiCredits: { base: 800, perLocation: 160 },
    aiSeats: 5,
    benchmarkMetrics: 50,
    benchmarkRadius: '1-5km',
    visuals: 200,
    dataInput: 'Live POS integration',
    dataRetention: '36 months',
    refresh: '15-minute',
    support: 'Email + Chat + Phone (4hr)',
    predictiveDays: 14,
    customDashboards: 3,
    salesAnalyticsIncluded: true,
    features: [
      'Real-time POS integration (15-min refresh)',
      'FULL sales analytics included (not an add-on)',
      '200 visuals with real-time data',
      '50+ benchmark metrics',
      '1-5km benchmark radius',
      '14-day predictive forecasting',
      'Portfolio management (2+ locations)',
      'Anomaly detection & alerts',
      'Location comparison tools',
      '3 custom dashboards',
      'Mobile app access',
      '25% credit rollover'
    ],
    limitations: [
      'Single POS system only',
      '15-minute refresh (not 5-min)',
      '14-day forecasting (not 30-day)',
      'Limited custom dashboards'
    ]
  },
  
  pro: {
    id: 'core-pro',
    name: 'Core Pro',
    tagline: 'Portfolio Intelligence',
    basePrice: 319,                        // WAS $299 → NOW $319
    additionalLocationPrice: 49,           // WAS $39 → NOW $49 (Pro now ALWAYS > Lite)
    aiCredits: { base: 1400, perLocation: 280 },
    aiSeats: 10,
    benchmarkMetrics: 50,
    benchmarkRadius: '0.5-10km',
    visuals: 200,
    dataInput: 'Live POS integration',
    dataRetention: 'Unlimited',
    refresh: '5-minute',
    support: 'Priority Phone (2hr)',
    predictiveDays: 30,
    customDashboards: 15,
    customKPIs: 10,
    multiPOS: true,
    salesAnalyticsIncluded: true,
    features: [
      'Everything in Core Lite PLUS:',
      '5-minute data refresh',
      '30-day predictive forecasting',
      'Multi-POS support (unlimited systems)',
      '0.5-10km benchmark radius',
      '15 custom dashboards',
      '10 custom KPI definitions',
      'Advanced anomaly detection',
      'White-label reporting',
      'API access for integrations',
      'Unlimited data retention'
    ],
    limitations: []
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// MODULES — CORRECTED VALUES
// ═══════════════════════════════════════════════════════════════════════════

export const modules = {
  labor: {
    id: 'labor',
    name: 'Labor Intelligence',
    icon: '👥',
    orgLicensePrice: 139,                  // WAS $129 → NOW $139 (+$10)
    perLocationPrice: 19,
    includedLocations: 5,
    description: 'Deep labor analytics, scheduling optimization, productivity tracking',
    features: [
      'Scheduling vs actual analysis',
      'Labor productivity metrics',
      'Overtime prediction & alerts',
      'Staff performance ranking',
      'Shift optimization recommendations',
      'Labor cost forecasting'
    ],
    roiPotential: '1-3% labor cost reduction'
  },
  
  inventory: {
    id: 'inventory',
    name: 'Inventory Connect',
    icon: '📦',
    orgLicensePrice: 139,                  // WAS $129 → NOW $139 (+$10)
    perLocationPrice: 19,
    includedLocations: 5,
    description: 'Food cost management, waste tracking, recipe costing',
    features: [
      'Waste tracking & categorization',
      'Recipe costing & updates',
      'Menu engineering matrix',
      'Theoretical vs actual food cost',
      'Inventory variance alerts',
      'Supplier price tracking'
    ],
    roiPotential: '0.5-2% food cost reduction'
  },
  
  purchasing: {
    id: 'purchasing',
    name: 'Purchasing Analytics',
    icon: '🛒',
    orgLicensePrice: 119,                  // WAS $99 → NOW $119 (+$20)
    perLocationPrice: 15,
    includedLocations: 5,
    description: 'Supplier optimization, contract tracking, spend analysis',
    features: [
      'Supplier performance scoring',
      'Price variance tracking',
      'Contract compliance monitoring',
      'Purchase pattern analysis',
      'Rebate tracking',
      'Consolidation opportunities'
    ],
    roiPotential: '2-5% purchasing savings'
  },
  
  marketing: {
    id: 'marketing',
    name: 'Marketing Performance',
    icon: '📣',
    orgLicensePrice: 169,                  // WAS $149 → NOW $169 (+$20)
    perLocationPrice: 25,
    includedLocations: 5,
    description: 'Campaign ROI, attribution modeling, promotional analysis',
    features: [
      'Campaign ROI tracking',
      'Promotion effectiveness analysis',
      'Customer segment performance',
      'Channel attribution',
      'LTV by acquisition source',
      'Marketing spend optimization'
    ],
    roiPotential: '10-20% marketing efficiency improvement'
  },
  
  reservations: {
    id: 'reservations',
    name: 'Reservations Intelligence',
    icon: '📅',
    orgLicensePrice: 119,                  // WAS $99 → NOW $119 (+$20)
    perLocationPrice: 15,
    includedLocations: 5,
    description: 'Booking analytics for OpenTable, Resy, SevenRooms',
    features: [
      'No-show prediction',
      'Booking pattern analysis',
      'Table utilization optimization',
      'Party size trends',
      'Peak demand forecasting',
      'Waitlist conversion tracking'
    ],
    roiPotential: '5-10% table utilization improvement',
    note: 'Only required for standalone reservation systems. POS-based reservations included in Core free.'
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// WATCHTOWER — RESTRUCTURED TO BASE + PER-LOCATION MODEL
// ═══════════════════════════════════════════════════════════════════════════

export const watchtower = {
  competitive: {
    id: 'competitive',
    name: 'Competitive Intelligence',
    icon: '🔍',
    basePrice: 399,                        // WAS $249 flat → NOW $399 base
    perLocationPrice: 49,                  // NEW: $49 per additional location
    includedLocations: 1,                  // Base price covers 1 location
    description: 'Track competitor pricing, promotions, and market moves',
    features: [
      'Track up to 10 competitors per location',
      'Daily menu/pricing monitoring',
      'Review sentiment analysis',
      'Social media tracking',
      'Competitive alerts',
      'Market share estimates'
    ],
    valueProposition: 'Prevent market share loss, optimize pricing strategy'
  },
  
  events: {
    id: 'events',
    name: 'Event & Calendar Signals',
    icon: '📅',
    basePrice: 199,                        // WAS $119 flat → NOW $199 base
    perLocationPrice: 29,                  // NEW: $29 per additional location
    includedLocations: 1,
    description: 'Local events, holidays, weather impact on demand',
    features: [
      'Local event calendar integration',
      'Weather demand correlation',
      'Holiday impact modeling',
      'Sports event tracking',
      'Convention/tourism data',
      'Traffic pattern analysis'
    ],
    valueProposition: 'Optimize staffing and inventory for demand spikes'
  },
  
  trends: {
    id: 'trends',
    name: 'Market Trends',
    icon: '📈',
    basePrice: 249,                        // WAS $179 flat → NOW $249 base
    perLocationPrice: 19,                  // NEW: $19 per additional location
    includedLocations: 1,
    description: 'Industry trends, consumer behavior shifts, emerging concepts',
    features: [
      'Google Trends integration',
      'Category trend analysis',
      'Demographic shift alerts',
      'Economic indicators',
      'Emerging concept tracking',
      'Consumer behavior insights'
    ],
    valueProposition: 'Stay ahead of market shifts, inform strategic decisions'
  },
  
  bundle: {
    id: 'bundle',
    name: 'Full Watchtower Bundle',
    icon: '🏰',
    basePrice: 720,                        // WAS $449 flat → NOW $720 base
    perLocationPrice: 82,                  // NEW: $82 per additional location
    includedLocations: 1,
    individualBaseTotal: 847,              // $399 + $199 + $249 = $847
    individualPerLocTotal: 97,             // $49 + $29 + $19 = $97
    baseSavings: 127,                      // $847 - $720 = $127 (15% off base)
    perLocSavings: 15,                     // $97 - $82 = $15 (15% off per-loc)
    savingsPercent: 15,
    description: 'Complete market intelligence suite',
    includes: ['competitive', 'events', 'trends'],
    features: [
      'All Competitive Intelligence features',
      'All Event & Calendar features',
      'All Market Trends features',
      'Unified intelligence dashboard',
      'Cross-module insights',
      'Priority intelligence support'
    ]
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// WATCHTOWER ENTERPRISE TIERS (30+ Locations)
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
// CLIENT TYPE RULES — NEW (Not in Main Prompt)
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
  'multi-site': {                          // ✅ HYPHENATED KEY (v3 used camelCase)
    locationRange: [25, 29],
    discountTier: 15,
    pricingModel: 'growth',
    features: ['15% multi-site discount', 'Dedicated onboarding', 'Monthly reviews']
  },
  'enterprise': {
    locationRange: [30, null],             // ✅ 30+ (v3 said 50+)
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
// EARLY ADOPTER PROGRAM — NEW (Not in Main Prompt)
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
// ENTERPRISE PRICING — NEW (Not in Main Prompt)
// ═══════════════════════════════════════════════════════════════════════════

export const enterprisePricing = {
  minLocations: 30,                        // ✅ CORRECT (v3 said 50)
  
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
// BREAK-EVEN POINTS — NEW (Not in Main Prompt)
// ═══════════════════════════════════════════════════════════════════════════

export const BREAK_EVEN_POINTS = {
  sundaeVsTenzo: { locations: 3, description: 'Sundae becomes cheaper than Tenzo' },
  coreProVsLite: { locations: null, description: 'Core Pro is premium-priced at all scales for premium features' },
  enterprise: { locations: 30, description: 'Qualifies for Enterprise pricing' }
};

// ═══════════════════════════════════════════════════════════════════════════
// COMPETITOR PRICING — FOR COMPARISON UI
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
