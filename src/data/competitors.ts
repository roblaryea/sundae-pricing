// ═══════════════════════════════════════════════════════════════════════════
// COMPETITOR INTELLIGENCE DATA
// ═══════════════════════════════════════════════════════════════════════════

export type CompetitorCategory = 
  | 'restaurant-bi'      // Tenzo, Nory, MarketMan, R365
  | 'generic-bi'         // Power BI, Tableau, Looker
  | 'spreadsheets'       // Excel, Google Sheets
  | 'pos-native'         // Toast, Square, Lightspeed reports
  | 'nothing';           // Gut feel, no analytics

export type CompetitorId = 
  | 'tenzo' 
  | 'nory' 
  | 'marketman' 
  | 'restaurant365'
  | 'powerbi' 
  | 'tableau' 
  | 'looker'
  | 'excel'
  | 'pos-native'
  | 'nothing';

export interface CompetitorProfile {
  id: CompetitorId;
  name: string;
  category: CompetitorCategory;
  logo?: string;
  tagline: string;
  
  // Pricing model
  pricing: {
    model: 'per-location' | 'per-user' | 'flat' | 'custom' | 'free' | 'hidden-cost';
    baseMonthly?: number;
    perLocation?: number;
    perUser?: number;
    setupFee?: number;
    setupPerLocation?: number;
    implementationMonths?: number;
    hiddenCosts?: string[];
  };
  
  // Feature comparison
  features: {
    realTimeData: boolean | 'limited';
    aiInsights: boolean | 'limited';
    benchmarking: boolean | 'limited';
    predictive: boolean | 'limited';
    laborAnalytics: boolean | 'addon';
    inventoryAnalytics: boolean | 'addon';
    competitiveIntel: boolean;
    mobileApp: boolean;
    apiAccess: boolean | 'limited';
    multiLocation: boolean | 'limited';
    restaurantSpecific: boolean;
  };
  
  // What they lack that Sundae has
  sundaeAdvantages: string[];
  
  // What they might have that's comparable
  strengths: string[];
  
  // Typical pain points users mention
  painPoints: string[];
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPETITOR DATABASE
// ═══════════════════════════════════════════════════════════════════════════

export const competitors: Record<CompetitorId, CompetitorProfile> = {
  
  // ─────────────────────────────────────────────────────────────────────────
  // RESTAURANT-SPECIFIC BI
  // ─────────────────────────────────────────────────────────────────────────
  
  tenzo: {
    id: 'tenzo',
    name: 'Tenzo',
    category: 'restaurant-bi',
    tagline: 'Restaurant analytics platform',
    pricing: {
      model: 'per-location',
      perLocation: 75,  // Per module per location
      setupFee: 350,    // Per module per location
      setupPerLocation: 350,
      implementationMonths: 1
    },
    features: {
      realTimeData: true,
      aiInsights: false,
      benchmarking: false,
      predictive: false,
      laborAnalytics: 'addon',
      inventoryAnalytics: 'addon',
      competitiveIntel: false,
      mobileApp: true,
      apiAccess: 'limited',
      multiLocation: true,
      restaurantSpecific: true
    },
    sundaeAdvantages: [
      'AI-powered insights and recommendations',
      'Peer benchmarking against 50+ metrics',
      'Predictive forecasting (14-30 days)',
      'No setup fees',
      'Competitive intelligence (Watchtower)',
      'More AI credits included'
    ],
    strengths: [
      'Established in market',
      'Good POS integrations',
      'Clean interface'
    ],
    painPoints: [
      'High setup fees add up quickly',
      'No AI recommendations',
      "Can't see how you compare to peers",
      'Each module costs extra'
    ]
  },
  
  nory: {
    id: 'nory',
    name: 'Nory',
    category: 'restaurant-bi',
    tagline: 'AI-powered restaurant management',
    pricing: {
      model: 'per-location',
      perLocation: 200,
      setupFee: 500,
      implementationMonths: 2
    },
    features: {
      realTimeData: true,
      aiInsights: 'limited',
      benchmarking: false,
      predictive: 'limited',
      laborAnalytics: true,
      inventoryAnalytics: true,
      competitiveIntel: false,
      mobileApp: true,
      apiAccess: 'limited',
      multiLocation: true,
      restaurantSpecific: true
    },
    sundaeAdvantages: [
      'Deeper AI with more credits',
      'Peer benchmarking (Nory has none)',
      'Competitive intelligence',
      'More flexible module selection',
      'Lower per-location cost at scale'
    ],
    strengths: [
      'Good labor scheduling',
      'Demand forecasting',
      'Modern interface'
    ],
    painPoints: [
      'Expensive at scale',
      'Limited customization',
      'No peer comparison data'
    ]
  },
  
  marketman: {
    id: 'marketman',
    name: 'MarketMan',
    category: 'restaurant-bi',
    tagline: 'Inventory management for restaurants',
    pricing: {
      model: 'per-location',
      baseMonthly: 179,
      perLocation: 50,
      setupFee: 0,
      implementationMonths: 1
    },
    features: {
      realTimeData: 'limited',
      aiInsights: false,
      benchmarking: false,
      predictive: false,
      laborAnalytics: false,
      inventoryAnalytics: true,
      competitiveIntel: false,
      mobileApp: true,
      apiAccess: true,
      multiLocation: true,
      restaurantSpecific: true
    },
    sundaeAdvantages: [
      'Full analytics suite, not just inventory',
      'AI-powered insights',
      'Peer benchmarking',
      'Labor analytics included',
      'Predictive forecasting',
      'Competitive intelligence'
    ],
    strengths: [
      'Strong inventory focus',
      'Good supplier management',
      'Recipe costing'
    ],
    painPoints: [
      'Inventory-only, need other tools for full picture',
      'No AI recommendations',
      'No benchmarking'
    ]
  },
  
  restaurant365: {
    id: 'restaurant365',
    name: 'Restaurant365',
    category: 'restaurant-bi',
    tagline: 'All-in-one restaurant management',
    pricing: {
      model: 'custom',
      baseMonthly: 400,
      perLocation: 100,
      setupFee: 2000,
      implementationMonths: 3
    },
    features: {
      realTimeData: true,
      aiInsights: 'limited',
      benchmarking: 'limited',
      predictive: 'limited',
      laborAnalytics: true,
      inventoryAnalytics: true,
      competitiveIntel: false,
      mobileApp: true,
      apiAccess: true,
      multiLocation: true,
      restaurantSpecific: true
    },
    sundaeAdvantages: [
      'Faster implementation (days vs months)',
      'More AI credits and deeper insights',
      'Better peer benchmarking',
      'Competitive intelligence',
      'Lower total cost for analytics'
    ],
    strengths: [
      'Accounting integration',
      'Comprehensive feature set',
      'Enterprise-ready'
    ],
    painPoints: [
      'Long implementation (3+ months)',
      'Complex, steep learning curve',
      'Expensive setup',
      'Overkill if you just need analytics'
    ]
  },
  
  // ─────────────────────────────────────────────────────────────────────────
  // GENERIC BI TOOLS
  // ─────────────────────────────────────────────────────────────────────────
  
  powerbi: {
    id: 'powerbi',
    name: 'Power BI',
    category: 'generic-bi',
    tagline: 'Microsoft business intelligence',
    pricing: {
      model: 'per-user',
      perUser: 10,  // Pro license
      setupFee: 0,
      hiddenCosts: [
        'Data engineering team ($150k+/year)',
        'Dashboard development (200+ hours)',
        'Ongoing maintenance',
        'POS connector development'
      ],
      implementationMonths: 4
    },
    features: {
      realTimeData: 'limited',
      aiInsights: 'limited',
      benchmarking: false,
      predictive: 'limited',
      laborAnalytics: false,
      inventoryAnalytics: false,
      competitiveIntel: false,
      mobileApp: true,
      apiAccess: true,
      multiLocation: 'limited',
      restaurantSpecific: false
    },
    sundaeAdvantages: [
      'Zero setup — works in days, not months',
      'Pre-built restaurant dashboards',
      'No data engineering required',
      'Peer benchmarking (impossible in Power BI)',
      'Restaurant-specific AI insights',
      'Competitive intelligence'
    ],
    strengths: [
      'Flexible visualization',
      'Microsoft ecosystem integration',
      'Low license cost'
    ],
    painPoints: [
      'Requires data engineering team',
      '3-6 month implementation',
      'No restaurant-specific features',
      'No benchmarking data',
      'Maintenance burden'
    ]
  },
  
  tableau: {
    id: 'tableau',
    name: 'Tableau',
    category: 'generic-bi',
    tagline: 'Enterprise data visualization',
    pricing: {
      model: 'per-user',
      perUser: 70,  // Creator license
      setupFee: 0,
      hiddenCosts: [
        'Data engineering team ($150k+/year)',
        'Dashboard development (300+ hours)',
        'Server infrastructure',
        'Training and adoption'
      ],
      implementationMonths: 6
    },
    features: {
      realTimeData: 'limited',
      aiInsights: 'limited',
      benchmarking: false,
      predictive: 'limited',
      laborAnalytics: false,
      inventoryAnalytics: false,
      competitiveIntel: false,
      mobileApp: true,
      apiAccess: true,
      multiLocation: 'limited',
      restaurantSpecific: false
    },
    sundaeAdvantages: [
      'Ready in days, not months',
      'No data team required',
      'Restaurant-specific metrics',
      'Peer benchmarking built-in',
      'AI insights included',
      '90% lower total cost'
    ],
    strengths: [
      'Beautiful visualizations',
      'Powerful for custom analysis',
      'Enterprise security'
    ],
    painPoints: [
      'Expensive total cost of ownership',
      'Requires specialized skills',
      'Long implementation',
      'Not restaurant-aware'
    ]
  },
  
  looker: {
    id: 'looker',
    name: 'Looker',
    category: 'generic-bi',
    tagline: 'Google Cloud BI platform',
    pricing: {
      model: 'custom',
      baseMonthly: 3000,  // Typical starting point
      perUser: 60,
      hiddenCosts: [
        'LookML development',
        'Data warehouse costs',
        'Implementation partner'
      ],
      implementationMonths: 4
    },
    features: {
      realTimeData: true,
      aiInsights: 'limited',
      benchmarking: false,
      predictive: 'limited',
      laborAnalytics: false,
      inventoryAnalytics: false,
      competitiveIntel: false,
      mobileApp: true,
      apiAccess: true,
      multiLocation: true,
      restaurantSpecific: false
    },
    sundaeAdvantages: [
      'Fraction of the cost',
      'No LookML development needed',
      'Restaurant-specific out of the box',
      'Peer benchmarking included',
      'Faster time to value'
    ],
    strengths: [
      'Modern architecture',
      'Good for data teams',
      'Embedded analytics'
    ],
    painPoints: [
      'Expensive base cost',
      'Requires technical expertise',
      'Not restaurant-specific'
    ]
  },
  
  // ─────────────────────────────────────────────────────────────────────────
  // SPREADSHEETS & MANUAL
  // ─────────────────────────────────────────────────────────────────────────
  
  excel: {
    id: 'excel',
    name: 'Spreadsheets',
    category: 'spreadsheets',
    tagline: 'Excel / Google Sheets',
    pricing: {
      model: 'hidden-cost',
      baseMonthly: 0,
      hiddenCosts: [
        'Manager time (10+ hrs/week)',
        'Error risk (2-5% data mistakes)',
        'Delayed decisions (stale data)',
        'No scalability'
      ]
    },
    features: {
      realTimeData: false,
      aiInsights: false,
      benchmarking: false,
      predictive: false,
      laborAnalytics: false,
      inventoryAnalytics: false,
      competitiveIntel: false,
      mobileApp: false,
      apiAccess: false,
      multiLocation: false,
      restaurantSpecific: false
    },
    sundaeAdvantages: [
      'Automated data collection',
      'Real-time visibility',
      'AI does the analysis for you',
      'See how you compare to peers',
      'Predictive insights',
      'Mobile access anywhere'
    ],
    strengths: [
      'Familiar interface',
      'Flexible',
      'Low direct cost'
    ],
    painPoints: [
      'Hours of manual data entry',
      'Data is always stale',
      'Easy to make errors',
      "Can't scale with growth",
      'No benchmarking possible'
    ]
  },
  
  // ─────────────────────────────────────────────────────────────────────────
  // POS NATIVE REPORTING
  // ─────────────────────────────────────────────────────────────────────────
  
  'pos-native': {
    id: 'pos-native',
    name: 'POS Reports',
    category: 'pos-native',
    tagline: 'Toast / Square / Lightspeed native reports',
    pricing: {
      model: 'free',
      baseMonthly: 0,
      hiddenCosts: [
        'Limited insights',
        'No cross-location view',
        'No benchmarking',
        'Basic metrics only'
      ]
    },
    features: {
      realTimeData: true,
      aiInsights: false,
      benchmarking: false,
      predictive: false,
      laborAnalytics: false,
      inventoryAnalytics: false,
      competitiveIntel: false,
      mobileApp: true,
      apiAccess: false,
      multiLocation: false,
      restaurantSpecific: true
    },
    sundaeAdvantages: [
      'Cross-location analytics',
      'AI-powered recommendations',
      'Peer benchmarking',
      'Predictive forecasting',
      'Deeper insights',
      'Competitive intelligence'
    ],
    strengths: [
      'Already included with POS',
      'Real-time sales data',
      'Easy to access'
    ],
    painPoints: [
      'Very basic metrics',
      "Can't compare locations easily",
      'No AI or predictions',
      'No benchmarking',
      'Siloed data'
    ]
  },
  
  // ─────────────────────────────────────────────────────────────────────────
  // NO CURRENT SOLUTION
  // ─────────────────────────────────────────────────────────────────────────
  
  nothing: {
    id: 'nothing',
    name: 'No Analytics',
    category: 'nothing',
    tagline: 'Gut feel / No current solution',
    pricing: {
      model: 'hidden-cost',
      baseMonthly: 0,
      hiddenCosts: [
        'Blind spots in operations',
        'Missed optimization opportunities',
        'Reactive instead of proactive',
        'Competitor advantage gap'
      ]
    },
    features: {
      realTimeData: false,
      aiInsights: false,
      benchmarking: false,
      predictive: false,
      laborAnalytics: false,
      inventoryAnalytics: false,
      competitiveIntel: false,
      mobileApp: false,
      apiAccess: false,
      multiLocation: false,
      restaurantSpecific: false
    },
    sundaeAdvantages: [
      'See your business clearly for the first time',
      "AI spots opportunities you're missing",
      'Know how you stack up vs peers',
      'Predict demand before it happens',
      'Stay ahead of competitors'
    ],
    strengths: [
      'No current spend',
      'Fresh start'
    ],
    painPoints: [
      'Flying blind',
      'Missing savings opportunities',
      "Can't spot problems early",
      'Competitors may have an edge'
    ]
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// COMPETITOR SELECTION OPTIONS FOR QUIZ
// ═══════════════════════════════════════════════════════════════════════════

export const competitorQuizOptions = [
  {
    id: 'tenzo' as CompetitorId,
    label: 'Tenzo',
    category: 'restaurant-bi',
    icon: '📊'
  },
  {
    id: 'nory' as CompetitorId,
    label: 'Nory',
    category: 'restaurant-bi',
    icon: '🤖'
  },
  {
    id: 'marketman' as CompetitorId,
    label: 'MarketMan',
    category: 'restaurant-bi',
    icon: '📦'
  },
  {
    id: 'restaurant365' as CompetitorId,
    label: 'Restaurant365',
    category: 'restaurant-bi',
    icon: '🏢'
  },
  {
    id: 'powerbi' as CompetitorId,
    label: 'Power BI',
    category: 'generic-bi',
    icon: '📈'
  },
  {
    id: 'tableau' as CompetitorId,
    label: 'Tableau',
    category: 'generic-bi',
    icon: '📉'
  },
  {
    id: 'looker' as CompetitorId,
    label: 'Looker',
    category: 'generic-bi',
    icon: '🔍'
  },
  {
    id: 'excel' as CompetitorId,
    label: 'Excel / Google Sheets',
    category: 'spreadsheets',
    icon: '📋'
  },
  {
    id: 'pos-native' as CompetitorId,
    label: 'POS Reports Only',
    category: 'pos-native',
    icon: '🧾'
  },
  {
    id: 'nothing' as CompetitorId,
    label: 'Nothing Yet / Gut Feel',
    category: 'nothing',
    icon: '🤔'
  }
];

// Group for display
export const competitorGroups = {
  'restaurant-bi': {
    label: 'Restaurant Analytics',
    description: 'Tools built for restaurants',
    competitors: ['tenzo', 'nory', 'marketman', 'restaurant365'] as CompetitorId[]
  },
  'generic-bi': {
    label: 'General BI Tools',
    description: 'Enterprise analytics platforms',
    competitors: ['powerbi', 'tableau', 'looker'] as CompetitorId[]
  },
  'spreadsheets': {
    label: 'Manual / Spreadsheets',
    description: 'DIY analytics',
    competitors: ['excel'] as CompetitorId[]
  },
  'pos-native': {
    label: 'POS Built-in',
    description: 'What comes with your POS',
    competitors: ['pos-native'] as CompetitorId[]
  },
  'nothing': {
    label: 'Starting Fresh',
    description: 'No current analytics',
    competitors: ['nothing'] as CompetitorId[]
  }
};

// Legacy export for backward compatibility with existing code
export function calculateSavingsVsCompetitor(
  sundaeMonthly: number,
  competitorId: CompetitorId,
  locations: number,
  modules: string[]
): { monthly: number; setup: number; firstYear: number } {
  // Simple calculation for backward compatibility
  const moduleCount = Math.max(1, modules.length);
  
  let competitorMonthly = 0;
  let setupFee = 0;
  
  switch (competitorId) {
    case 'tenzo':
      competitorMonthly = locations * moduleCount * 75;
      setupFee = locations * moduleCount * 350;
      break;
    case 'nory':
      competitorMonthly = locations * 200;
      setupFee = 500 * locations;
      break;
    default:
      competitorMonthly = sundaeMonthly * 1.5; // Estimate
  }
  
  return {
    monthly: competitorMonthly,
    setup: setupFee,
    firstYear: (competitorMonthly * 12) + setupFee
  };
}
