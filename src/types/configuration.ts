// Shared configuration types for the pricing configurator (price book v1.7)

import type { CompetitorId } from '../data/competitors';
import type { CorePackageId } from '../data/pricing';
import type { AddOnId, ImplementationResult } from '../lib/pricingEngine';

export type CrossIntelligenceSelection = 'none' | 'base' | 'pro';

export type { CorePackageId, AddOnId };

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
export type CrewBundleId =
  | 'crew_schedule_time_bundle'
  | 'crew_suite_bundle'
  | 'crew_complete_bundle';

export interface Configuration {
  /**
   * The Report layer was retired with price book v1.7 and is not selectable.
   * 'core' is the analytics path; 'crew' is the operational substrate path.
   */
  /**
   * Which commercial pathway the visitor is buying.
   *
   * 'both' matters commercially: Core (decision intelligence) and Crew
   * (operational substrate) are separate rails that most real groups buy
   * TOGETHER, and the summary used to early-return on the Crew branch — so the
   * single most common deal could not be quoted at all.
   */
  layer: 'core' | 'crew' | 'both' | null;
  /** Which of the four v1.7 Core packages the visitor picked. */
  corePackage: CorePackageId;
  locations: number;
  /**
   * Add-ons sold alongside a Core package: Foresight & Action plus the
   * concept SKUs. The eleven Core DOMAIN modules are NOT here — they are
   * package components and are never purchased individually.
   */
  addOns: AddOnId[];
  watchtowerModules: string[];
  crossIntelligence: CrossIntelligenceSelection;
  /**
   * Multi-select set of Crew SKUs the visitor picked when `layer === 'crew'`.
   * Empty array on the Core path. Bundles aren't stored separately —
   * the matching bundle (Schedule & Time / Crew Operating / Crew Complete) is
   * auto-detected from this set and its discount is applied to the math.
   *
   * Invariants:
   *   • `crew_lite` is mutually exclusive with every other Crew SKU.
   *   • `crew_tna` requires `crew_scheduling` OR `crew_operations`
   *     (Crew Manage entitlement includes Crew Schedule).
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
  /** Derived AVERAGE per unit — never a per-location rate card. */
  perLocation: number;
  category: 'base' | 'addon' | 'watchtower' | 'cross_intelligence';
  note?: string;
}

export interface DiscountLine {
  /** English text, kept for the PDF and for callers with no locale. */
  name: string;
  /**
   * Stable key so a localised surface can render this line in the buyer's
   * language. The engine has no locale, so emitting only `name` left every
   * discount line in English on a translated quote.
   */
  key?: 'volume' | 'term' | 'earlyAdopter' | 'volumeNotApplied' | 'termNotApplied';
  /** True when the published combined cap clipped this line. */
  capped?: boolean;
  amount: number;
  percent: number;
}

export interface PriceCalculation {
  total: number;
  /** Derived AVERAGE per unit (total ÷ units). Bands are marginal. */
  perLocation: number;
  breakdown: PriceBreakdown[];
  annualTotal: number;
  annualPerLocation: number;
  aiCredits: number;
  subtotal: number;
  discounts: DiscountLine[];
  /** True at 250+ units — past the self-serve volume ladder. */
  requiresEnterpriseQuote: boolean;
  /**
   * ONE implementation charge for the whole selection, resolved at the
   * highest class present. Never a per-module sum — the v5.1 setup-fee ladder
   * is retired.
   */
  implementation: ImplementationResult;
  savings: {
    tenzo: { monthly: number; setup: number; firstYear: number };
  };
}
