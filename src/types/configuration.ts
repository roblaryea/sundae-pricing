// Shared configuration types for the pricing configurator

import type { CompetitorId } from '../data/competitors';

export type CrossIntelligenceSelection = 'none' | 'base' | 'pro';

// Individual Crew SKU ids (no bundle ids — bundles are auto-detected from
// the selected SKU set).
export type CrewSkuId =
  | 'crew_lite'
  | 'crew_scheduling'
  | 'crew_operations'
  | 'crew_tna'
  | 'crew_payroll'
  | 'crew_people_intelligence';

// Canonical bundle ids, auto-applied when the selected SKU set matches.
export type CrewBundleId = 'crew_suite_bundle' | 'crew_complete_bundle';

export interface Configuration {
  layer: 'report' | 'core' | 'crew' | null;
  tier: 'lite' | 'plus' | 'pro' | 'enterprise';
  locations: number;
  modules: string[];
  watchtowerModules: string[];
  crossIntelligence: CrossIntelligenceSelection;
  /**
   * Multi-select set of Crew SKUs the visitor picked when `layer === 'crew'`.
   * Empty array on Report / Core paths. Bundles aren't stored separately —
   * the matching bundle (Operating Suite / Complete Suite) is auto-detected
   * from this set and its 20% discount is applied to the math.
   *
   * Invariants:
   *   • `crew_lite` is mutually exclusive with every other Crew SKU.
   *   • `crew_tna` requires `crew_scheduling` OR `crew_operations`
   *     (Operations entitlement includes Scheduling).
   *   • `crew_payroll` requires `crew_operations`.
   *   • `crew_people_intelligence` requires `crew_operations`.
   * Enforcement lives in `useConfiguration.toggleCrewSku`.
   */
  crewSkus: CrewSkuId[];
  competitors: {
    current: CompetitorId[];      // What they use today (from quiz)
    evaluating: CompetitorId[];   // What they're considering (from quiz)
    primaryComparison: CompetitorId; // The main one to show in UI
  };
}

export interface PriceBreakdown {
  item: string;
  price: number;
  perLocation: number;
  category: 'base' | 'module' | 'watchtower' | 'cross_intelligence';
  note?: string;
}

export interface DiscountLine {
  name: string;
  amount: number;
  percent: number;
}

export interface PriceCalculation {
  total: number;
  perLocation: number;
  breakdown: PriceBreakdown[];
  annualTotal: number;
  annualPerLocation: number;
  aiCredits: number;
  aiSeats: number;
  subtotal: number;
  discounts: DiscountLine[];
  savings: {
    tenzo: { monthly: number; setup: number; firstYear: number };
  };
}
