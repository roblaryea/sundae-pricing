// ═══════════════════════════════════════════════════════════════════════════
// VERIFICATION LEVELS & COMPETITOR PRICING DATA
// Sources: Public pricing pages, industry research, customer interviews
// Last updated: January 2026
// ═══════════════════════════════════════════════════════════════════════════

export type VerificationLevel = 'verified' | 'estimated' | 'unverified';

export const VERIFICATION_LABELS = {
  verified: {
    label: 'Verified',
    description: 'From public pricing page or official documentation',
    color: 'green',
    badge: '✓',
    showInComparison: true
  },
  estimated: {
    label: 'Estimated',
    description: 'Based on industry research and estimates',
    color: 'amber',
    badge: '~',
    showInComparison: true
  },
  unverified: {
    label: 'Unverified',
    description: 'Pricing not publicly available - contact vendor',
    color: 'red',
    badge: '?',
    showInComparison: false  // Don't show in main comparison
  }
};

export interface CompetitorPricing {
  id: string;
  name: string;
  category: string;
  icon: string;
  verification: VerificationLevel;
  sourceUrl?: string | null;
  lastVerified?: string | null;
  showPricing?: boolean;
  pricing: any;
  calculate: (locations: number, modules: string[]) => {
    monthly: number | null;
    firstYear: number | null;
    ongoing: number | null;
    setupFee: number | null;
    breakdown?: Record<string, number> | null;
    notes: string | null;
    confidence?: 'high' | 'medium' | 'low' | 'none';
  };
  limitations: string[];
}

export const COMPETITOR_PRICING: Record<string, CompetitorPricing> = {
  
  // ─────────────────────────────────────────────────────────────────────────
  // TENZO - ✅ VERIFIED
  // Source: tenzo.io/pricing (last checked: January 2026)
  // ─────────────────────────────────────────────────────────────────────────
  tenzo: {
    id: 'tenzo',
    name: 'Tenzo',
    category: 'Restaurant analytics platform',
    icon: '📊',
    verification: 'verified' as VerificationLevel,
    sourceUrl: 'https://tenzo.io/pricing',
    lastVerified: '2026-01-01',
    
    pricing: {
      perLocationPerModule: 75,  // $75/location/module/month
      setupFeePerModulePerLocation: 350,
      
      modules: {
        sales: { available: true, price: 75 },
        labor: { available: true, price: 75 },
        inventory: { available: true, price: 75 },
        marketing: { available: false, price: null },
        purchasing: { available: false, price: null },
        reservations: { available: false, price: null },
        watchtower: { available: false, price: null }
      }
    },
    
    calculate: (locations: number, modules: string[]) => {
      // Only count modules Tenzo offers
      const tenzoModules = modules.filter(m => 
        ['sales', 'labor', 'inventory'].includes(m) || 
        m === 'core-lite' || m === 'core-pro'  // Core includes sales
      );
      
      // Core counts as sales module equivalent
      let moduleCount = tenzoModules.filter(m => ['labor', 'inventory'].includes(m)).length;
      if (tenzoModules.some(m => m.includes('core'))) moduleCount += 1;  // Add sales
      
      const monthlyPerLoc = moduleCount * 75;
      const monthly = monthlyPerLoc * locations;
      const setupFee = moduleCount * locations * 350;
      const firstYear = (monthly * 12) + setupFee;
      const ongoing = monthly * 12;
      
      const unavailableModules = modules.filter(m => 
        !['sales', 'labor', 'inventory', 'core-lite', 'core-pro'].includes(m)
      );
      
      return {
        monthly,
        firstYear,
        ongoing,
        setupFee,
        breakdown: {
          'Monthly licenses': monthly * 12,
          'Setup fees': setupFee
        },
        notes: unavailableModules.length > 0
          ? `Tenzo doesn't offer: ${unavailableModules.join(', ')}`
          : null,
        confidence: 'high'
      };
    },
    
    limitations: [
      'No marketing analytics',
      'No purchasing module',
      'No reservation intelligence',
      'No competitive intelligence',
      'Setup fees per module per location'
    ]
  },
  
  // ─────────────────────────────────────────────────────────────────────────
  // NORY - ❌ UNVERIFIED (Pricing not public - excluded from comparisons)
  // Note: Contact Nory directly for custom quotes
  // ─────────────────────────────────────────────────────────────────────────
  nory: {
    id: 'nory',
    name: 'Nory',
    category: 'AI restaurant operations',
    icon: '🤖',
    verification: 'unverified' as VerificationLevel,
    sourceUrl: null,
    lastVerified: null,
    showPricing: false,  // Don't show in comparisons
    
    pricing: {
      // Nory uses value-based pricing, typically $800-1,200/location/month
      perLocationMonthly: {
        low: 800,
        mid: 1000,
        high: 1200
      },
      setupFee: {
        perLocation: 2000
      }
    },
    
    calculate: () => {
      // Nory pricing not publicly available
      return {
        monthly: null,
        firstYear: null,
        ongoing: null,
        setupFee: null,
        breakdown: null,
        notes: 'Pricing not publicly available. Contact Nory directly for custom quotes based on your restaurant size and needs.',
        confidence: 'none'
      };
    },
    
    limitations: [
      'Higher price point',
      'Less granular module selection',
      'Newer platform, less proven at scale',
      'No competitive intelligence'
    ]
  },
  
  // ─────────────────────────────────────────────────────────────────────────
  // RESTAURANT365 - ⚠️ ESTIMATED
  // Source: Industry estimates (pricing not fully public)
  // ─────────────────────────────────────────────────────────────────────────
  restaurant365: {
    id: 'restaurant365',
    name: 'Restaurant365',
    category: 'Restaurant ERP & accounting',
    icon: '📒',
    verification: 'estimated' as VerificationLevel,
    sourceUrl: 'https://www.restaurant365.com',
    lastVerified: '2026-01-01',
    
    pricing: {
      // R365 bundles accounting + ops, typically $200 base + $50/location
      baseMonthly: 200,
      perLocationMonthly: 50,
      implementationBase: 5000,
      implementationPerLocation: 500
    },
    
    calculate: (locations: number) => {
      const monthly = 200 + (50 * locations);
      const setupFee = 5000 + (500 * locations);
      const firstYear = (monthly * 12) + setupFee;
      const ongoing = monthly * 12;
      
      return {
        monthly,
        firstYear,
        ongoing,
        setupFee,
        breakdown: {
          'Monthly subscription': monthly * 12,
          'Implementation': setupFee
        },
        notes: 'Includes accounting; different focus than pure analytics. Industry estimate.',
        confidence: 'medium'
      };
    },
    
    limitations: [
      'Accounting-focused, less analytics depth',
      'No AI-powered insights',
      'No competitive intelligence',
      'No benchmark data'
    ]
  },
  
  // ─────────────────────────────────────────────────────────────────────────
  // POWER BI - ⚠️ ESTIMATED (Licenses verified, implementation estimated)
  // Source: Microsoft pricing (verified) + industry implementation estimates
  // ─────────────────────────────────────────────────────────────────────────
  powerbi: {
    id: 'powerbi',
    name: 'Power BI',
    category: 'Build-your-own with Microsoft BI',
    icon: '📊',
    verification: 'estimated' as VerificationLevel,
    sourceUrl: 'https://powerbi.microsoft.com/pricing/',
    lastVerified: '2026-01-01',
    
    pricing: {
      // Power BI Pro: $10/user/month
      // Power BI Premium Per User: $20/user/month
      // Typical restaurant needs 5-15 users across locations
      licenses: {
        proPerUser: 10,
        premiumPerUser: 20,
        typicalUsers: (locations: number) => Math.max(5, Math.ceil(locations * 1.5))
      },
      
      // Implementation costs
      implementation: {
        small: 15000,   // 1-5 locations
        medium: 30000,  // 6-20 locations
        large: 50000    // 21+ locations
      },
      
      // Ongoing development/maintenance (typically need a consultant or FTE)
      annualMaintenance: {
        small: 10000,
        medium: 20000,
        large: 35000
      },
      
      // Internal analyst time to manage
      analystFTE: 0.5  // Half an FTE typically
    },
    
    calculate: (locations: number) => {
      const users = Math.max(5, Math.ceil(locations * 1.5));
      const licenseCost = users * 20 * 12;  // Assume Premium
      
      let implementation, maintenance;
      if (locations <= 5) {
        implementation = 15000;
        maintenance = 10000;
      } else if (locations <= 20) {
        implementation = 30000;
        maintenance = 20000;
      } else {
        implementation = 50000;
        maintenance = 35000;
      }
      
      const analystCost = 35000;  // 0.5 FTE @ $70K
      
      const monthly = Math.round((licenseCost + maintenance + analystCost) / 12);
      const firstYear = licenseCost + implementation + maintenance + analystCost;
      const ongoing = licenseCost + maintenance + analystCost;
      
      return {
        monthly,
        firstYear,
        ongoing,
        setupFee: implementation,
        breakdown: {
          'Licenses (verified)': licenseCost,
          'Implementation (estimated)': implementation,
          'Maintenance (estimated)': maintenance,
          'Analyst 0.5 FTE (estimated)': analystCost
        },
        notes: 'Requires technical expertise. License costs verified from Microsoft; implementation and maintenance are industry estimates.',
        confidence: 'medium'
      };
    },
    
    limitations: [
      'Requires technical expertise to build',
      'No pre-built restaurant analytics',
      'No AI insights included',
      'No benchmark data',
      'Ongoing development required',
      'No competitive intelligence'
    ]
  },
  
  // ─────────────────────────────────────────────────────────────────────────
  // SPREADSHEETS - ⚠️ ESTIMATED
  // Source: Industry labor cost estimates
  // ─────────────────────────────────────────────────────────────────────────
  spreadsheets: {
    id: 'spreadsheets',
    name: 'Spreadsheets',
    category: 'Excel / Google Sheets',
    icon: '📋',
    verification: 'estimated' as VerificationLevel,
    sourceUrl: null,
    lastVerified: '2026-01-01',
    
    pricing: {
      // Software is cheap, labor is expensive
      software: 200,  // Per year, part of existing M365/Google
      
      // Analyst time to maintain manual reporting
      analystHoursPerWeek: (locations: number) => Math.max(10, locations * 2),
      analystHourlyRate: 35,  // $35/hour
      
      // Error cost (industry studies: 2-5% of decisions affected by spreadsheet errors)
      errorCostPercent: 0.002  // 0.2% of revenue
    },
    
    calculate: (locations: number) => {
      const hoursPerWeek = Math.max(10, locations * 2);
      const weeksPerYear = 50;
      const hourlyRate = 35;
      
      const laborCost = hoursPerWeek * weeksPerYear * hourlyRate;
      const softwareCost = 200;
      const errorCost = locations * 100000 * 12 * 0.002;  // 0.2% of revenue lost to errors
      
      const totalAnnual = laborCost + softwareCost + errorCost;
      const monthly = Math.round(totalAnnual / 12);
      
      return {
        monthly,
        firstYear: totalAnnual,
        ongoing: totalAnnual,
        setupFee: 0,
        breakdown: {
          [`Labor (${hoursPerWeek} hrs/week @ $35/hr)`]: laborCost,
          'Software': softwareCost,
          'Error/rework cost (0.2% revenue)': Math.round(errorCost)
        },
        notes: 'Hidden costs in manual labor and decision-making errors. Based on industry research.',
        confidence: 'medium'
      };
    },
    
    limitations: [
      'Highly manual and time-consuming',
      'Error-prone (88% of spreadsheets contain errors)',
      'No real-time data',
      'No AI insights',
      'No benchmark data',
      'No competitive intelligence',
      'Doesn\'t scale well'
    ]
  },
  
  // ─────────────────────────────────────────────────────────────────────────
  // MARKETMAN - ✅ VERIFIED
  // Source: marketman.com/pricing (last checked: January 2026)
  // ─────────────────────────────────────────────────────────────────────────
  marketman: {
    id: 'marketman',
    name: 'MarketMan',
    category: 'Inventory & purchasing',
    icon: '📦',
    verification: 'verified' as VerificationLevel,
    sourceUrl: 'https://www.marketman.com/pricing',
    lastVerified: '2026-01-01',
    
    pricing: {
      perLocationMonthly: {
        operator: 175,
        professional: 250,
        ultimate: 350
      },
      setupFee: 500
    },
    
    calculate: (locations: number) => {
      const perLoc = 250;  // Professional tier
      const monthly = perLoc * locations;
      const setupFee = 500 * locations;
      const firstYear = (monthly * 12) + setupFee;
      const ongoing = monthly * 12;
      
      return {
        monthly,
        firstYear,
        ongoing,
        setupFee,
        breakdown: {
          'Monthly licenses (Professional)': monthly * 12,
          'Setup fees': setupFee
        },
        notes: 'Inventory & purchasing focused only. Professional tier used for comparison.',
        confidence: 'high'
      };
    },
    
    limitations: [
      'Inventory-focused only',
      'No labor analytics',
      'No sales analytics',
      'No AI insights',
      'No competitive intelligence'
    ]
  },
  
  // ─────────────────────────────────────────────────────────────────────────
  // 7SHIFTS - ✅ VERIFIED
  // Source: 7shifts.com/pricing (last checked: January 2026)
  // ─────────────────────────────────────────────────────────────────────────
  sevenShifts: {
    id: '7shifts',
    name: '7shifts',
    category: 'Labor & scheduling',
    icon: '👥',
    verification: 'verified' as VerificationLevel,
    sourceUrl: 'https://www.7shifts.com/pricing',
    lastVerified: '2026-01-01',
    
    pricing: {
      // Per location pricing
      perLocationMonthly: {
        comp: 0,         // Free tier
        entrée: 34.99,   // Basic
        theWorks: 76.99, // Full features
        gourmet: 150     // Enterprise
      }
    },
    
    calculate: (locations: number) => {
      const perLoc = 76.99;  // The Works tier for comparison
      const monthly = perLoc * locations;
      const firstYear = monthly * 12;
      const ongoing = firstYear;
      
      return {
        monthly: Math.round(monthly),
        firstYear: Math.round(firstYear),
        ongoing: Math.round(ongoing),
        setupFee: 0,
        breakdown: {
          'Monthly licenses (The Works tier)': Math.round(monthly * 12)
        },
        notes: 'Labor & scheduling only. The Works tier used for comparison.',
        confidence: 'high'
      };
    },
    
    limitations: [
      'Labor/scheduling only',
      'No inventory analytics',
      'No sales analytics',
      'No AI-powered insights',
      'No competitive intelligence',
      'Would need to combine with other tools'
    ]
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// COMPARISON RESULT INTERFACE
// ═══════════════════════════════════════════════════════════════════════════

export interface ComparisonResult {
  competitor: {
    id: string;
    name: string;
    icon: string;
    category: string;
  };
  competitorCost: {
    monthly: number;
    firstYear: number;
    ongoing: number;
    setupFee: number;
    breakdown?: Record<string, number>;
  };
  sundaeCost: {
    monthly: number;
    annual: number;
  };
  savings: {
    firstYear: number;
    ongoing: number;
    monthly: number;
  };
  notes: string | null;
  limitations: string[];
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPARISON CALCULATOR
// ═══════════════════════════════════════════════════════════════════════════

export function calculateCompetitorComparison(
  competitorId: string,
  locations: number,
  modules: string[],
  sundaeMonthlyCost: number
): ComparisonResult | null {
  const competitor = COMPETITOR_PRICING[competitorId];
  if (!competitor) return null;
  
  const competitorCost = competitor.calculate(locations, modules);
  
  // If pricing not available (null), return null
  if (competitorCost.firstYear === null || competitorCost.monthly === null) {
    return null;
  }
  
  const sundaeAnnual = sundaeMonthlyCost * 12;
  
  return {
    competitor: {
      id: competitor.id,
      name: competitor.name,
      icon: competitor.icon,
      category: competitor.category
    },
    competitorCost: {
      monthly: competitorCost.monthly,
      firstYear: competitorCost.firstYear,
      ongoing: competitorCost.ongoing ?? competitorCost.firstYear,
      setupFee: competitorCost.setupFee ?? 0,
      breakdown: competitorCost.breakdown ?? undefined
    },
    sundaeCost: {
      monthly: sundaeMonthlyCost,
      annual: sundaeAnnual
    },
    savings: {
      firstYear: competitorCost.firstYear - sundaeAnnual,
      ongoing: (competitorCost.ongoing ?? competitorCost.firstYear) - sundaeAnnual,
      monthly: competitorCost.monthly - sundaeMonthlyCost
    },
    notes: competitorCost.notes,
    limitations: competitor.limitations
  };
}

export function calculateAllComparisons(
  locations: number,
  modules: string[],
  sundaeMonthlyCost: number
): ComparisonResult[] {
  const competitorIds = ['tenzo', 'nory', 'powerbi', 'spreadsheets', 'restaurant365', 'marketman', 'sevenShifts'];
  
  const comparisons = competitorIds
    .map(id => calculateCompetitorComparison(id, locations, modules, sundaeMonthlyCost))
    .filter((c): c is ComparisonResult => {
      if (!c) return false;
      // Exclude unverified or those without pricing
      const competitor = COMPETITOR_PRICING[c.competitor.id];
      if (!competitor) return false;
      if (competitor.verification === 'unverified') return false;
      if (competitor.showPricing === false) return false;
      if (c.competitorCost.firstYear === null) return false;
      return true;
    });
  
  return comparisons.sort((a, b) => b.savings.firstYear - a.savings.firstYear);  // Highest savings first
}

// ═══════════════════════════════════════════════════════════════════════════
// ASSUMPTIONS DOCUMENTATION
// ═══════════════════════════════════════════════════════════════════════════

export const COMPETITOR_ASSUMPTIONS = {
  tenzo: {
    source: 'tenzo.io/pricing (verified)',
    notes: '$75/location/module/month + $350 setup per module per location',
    lastVerified: 'January 2026'
  },
  nory: {
    source: 'Industry estimates (pricing not public)',
    notes: '~$1,000/location/month + $2K setup per location',
    lastVerified: 'January 2026'
  },
  powerbi: {
    source: 'Microsoft pricing + industry estimates',
    notes: '$20/user Premium licenses + implementation + maintenance + 0.5 FTE analyst',
    lastVerified: 'January 2026'
  },
  spreadsheets: {
    source: 'Industry labor cost estimates',
    notes: `${'{locations * 2}'} hours/week analyst @ $35/hr + 0.2% revenue impact from errors`,
    lastVerified: 'January 2026'
  },
  restaurant365: {
    source: 'Industry estimates',
    notes: '$200 base + $50/location + implementation fees',
    lastVerified: 'January 2026'
  },
  marketman: {
    source: 'marketman.com',
    notes: '$250/location Professional tier + $500 setup',
    lastVerified: 'January 2026'
  },
  sevenShifts: {
    source: '7shifts.com/pricing',
    notes: '$76.99/location for The Works tier',
    lastVerified: 'January 2026'
  }
};
