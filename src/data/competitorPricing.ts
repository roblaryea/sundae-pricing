// ═══════════════════════════════════════════════════════════════════════════
// VERIFICATION LEVELS & COMPETITOR PRICING DATA
// Sources: public vendor pricing pages, re-checked on the dates recorded below.
// ═══════════════════════════════════════════════════════════════════════════
//
// Five rules this module now enforces STRUCTURALLY, because every one of them
// was broken by a figure that shipped on the quote screen:
//
//   1. A cost is a LIST OF LINES. `firstYear`, `ongoing`, `setupFee` and
//      `monthly` are DERIVED from those lines by `summarise()`, never written
//      by hand. Power BI printed "$88,600" over a breakdown that summed to
//      $53,600 — a $35,000 gap the reader could not see, let alone check.
//   2. Every line carries its own `verification` and `source`. "Estimated"
//      applied to a whole card told a buyer nothing about WHICH number was the
//      estimate; Power BI's licence cost is a published Microsoft rate and its
//      implementation cost is an industry guess, and they were badged the same.
//   3. No line may be derived from a figure the buyer did not supply. The
//      spreadsheets card charged 0.2% of an invented $100k/location/month — at
//      25 sites that is $60,000 of competitor cost conjured out of a constant,
//      and it survived the buyer typing a real $50k two steps earlier.
//   4. A `verified` badge is a claim about FRESHNESS as well as accuracy, so it
//      decays. See `effectiveVerification`.
//   5. Sundae's side of the comparison is the SAME total the quote screen
//      shows — including the Crew rail and the commitment discount. See
//      `SundaeQuoteBasis`.

import { SPREADSHEETS_LABOR_RATE_USD } from '../config/pricingAssumptions';
import { CORE_DOMAIN_MODULE_IDS } from './pricing';

export type VerificationLevel = 'verified' | 'estimated' | 'unverified';

export const VERIFICATION_LABELS = {
  verified: {
    label: 'Verified',
    description: 'Read from the vendor public pricing page on the date shown',
    color: 'green',
    badge: '✓',
    showInComparison: true
  },
  estimated: {
    label: 'Estimated',
    description: 'Modelled from industry research, or a published price we have not re-checked recently',
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

/**
 * How long a first-party price check stays "Verified".
 *
 * A green Verified badge asserts two things: that the figure was on the
 * vendor's page, and that it still is. The second half rots. Every entry here
 * carried `lastVerified: '2026-01-01'` and a permanent green badge, and by the
 * time anyone looked, MarketMan's own linked page had replaced the tier the
 * card was quoting — the badge was vouching for a number the source
 * contradicted. A quarter is the window; past it the badge downgrades itself to
 * "Estimated" and shows the date, which is the honest claim: this was true when
 * we read it, and we have not read it since.
 */
export const VERIFICATION_FRESHNESS_DAYS = 90;

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** Whole days since `lastVerified`, or null when there is no check to age. */
export function verificationAgeDays(
  lastVerified: string | null | undefined,
  asOf: Date = new Date(),
): number | null {
  if (!lastVerified) return null;
  const checked = Date.parse(lastVerified);
  if (Number.isNaN(checked)) return null;
  return Math.floor((asOf.getTime() - checked) / MS_PER_DAY);
}

/**
 * The verification level a badge may actually claim today.
 *
 * `verified` requires a dated first-party check inside the freshness window.
 * Anything older is `estimated` — not because the number is wrong, but because
 * we can no longer assert it is current.
 */
export function effectiveVerification(
  declared: VerificationLevel,
  lastVerified: string | null | undefined,
  asOf: Date = new Date(),
): VerificationLevel {
  if (declared !== 'verified') return declared;
  const age = verificationAgeDays(lastVerified, asOf);
  if (age === null) return 'estimated';
  return age <= VERIFICATION_FRESHNESS_DAYS ? 'verified' : 'estimated';
}

// ═══════════════════════════════════════════════════════════════════════════
// COST LINES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * One line of a competitor's cost of ownership.
 *
 * `kind` is what makes a like-for-like comparison possible: recurring lines can
 * be set against Sundae's subscription, one-time lines against Sundae's
 * implementation. Mixing them is how a card ends up counting the competitor's
 * setup fee while printing "No setup fees" under our own number.
 */
export interface CompetitorCostLine {
  /** Stable label. Doubles as the i18n lookup key (falls back to itself). */
  label: string;
  amount: number;
  kind: 'recurring' | 'one_time';
  /** Verification of THIS line, which is rarely the whole card's. */
  verification: VerificationLevel;
  /** Where the number comes from. Required — a line with no basis is a guess. */
  source: string;
}

export interface CompetitorCostResult {
  monthly: number | null;
  firstYear: number | null;
  ongoing: number | null;
  setupFee: number | null;
  breakdown?: Record<string, number> | null;
  lines: CompetitorCostLine[];
  notes: string | null;
  confidence?: 'high' | 'medium' | 'low' | 'none';
}

/**
 * Derive every headline figure from the lines, so the parts always sum to the
 * whole. This is the fix for the Power BI card: there is no longer anywhere to
 * put a number that the breakdown does not account for.
 */
function summarise(
  lines: CompetitorCostLine[],
  notes: string | null,
  confidence: CompetitorCostResult['confidence'],
): CompetitorCostResult {
  const ongoing = lines
    .filter((l) => l.kind === 'recurring')
    .reduce((t, l) => t + l.amount, 0);
  const setupFee = lines
    .filter((l) => l.kind === 'one_time')
    .reduce((t, l) => t + l.amount, 0);
  const breakdown: Record<string, number> = {};
  for (const line of lines) breakdown[line.label] = line.amount;

  return {
    monthly: Math.round(ongoing / 12),
    firstYear: ongoing + setupFee,
    ongoing,
    setupFee,
    breakdown,
    lines,
    notes,
    confidence,
  };
}

/**
 * What the buyer told us, used only where a line genuinely depends on it.
 *
 * `monthlyRevenuePerLocation` is optional and stays optional: when it is
 * absent, the revenue-derived line is DROPPED rather than back-filled from a
 * constant. A missing input must cost the comparison a line, not the buyer a
 * fabricated number.
 */
export interface CompetitorCalcContext {
  monthlyRevenuePerLocation?: number;
}

export interface CompetitorPricing {
  id: string;
  name: string;
  category: string;
  icon: string;
  verification: VerificationLevel;
  sourceUrl?: string | null;
  lastVerified?: string | null;
  showPricing?: boolean;
  /**
   * Sundae domain ids this vendor sells an equivalent for. Used for the
   * coverage line, never for pricing — the honest argument against a cheaper
   * point solution is what it does not cover, not a price at an imagined equal
   * scope.
   */
  coversDomains: readonly string[];
  /**
   * Capabilities this vendor cannot deliver AT ANY SPEND — not "harder", not
   * "needs work", but structurally unavailable because it depends on data or a
   * model the buyer does not have.
   *
   * Deliberately small and hand-written. Everything derivable is derived:
   * domain gaps come from `coversDomains`, and day-one coverage comes from the
   * comparison itself. Only claims with a checkable basis belong here, because
   * this is the part of the card that argues value rather than price, and an
   * overclaim here is worth less than silence.
   *
   * House rule: phrase every entry as what the VENDOR cannot do, never as
   * "only Sundae can". Toast Benchmarking already gives Toast merchants peer
   * comparison at no separate fee, so an exclusivity claim is false the moment
   * a buyer runs Toast.
   */
  cannotDoAtAnyPrice?: ReadonlyArray<{ claim: string; basis: string }>;
  pricing: Record<string, unknown>;
  calculate: (
    locations: number,
    modules: string[],
    context?: CompetitorCalcContext,
  ) => CompetitorCostResult;
  limitations: string[];
}

/**
 * Selection id passed to a competitor calculator to mean "the customer has a
 * Sundae Core package".
 *
 * Price book v1.7 retired `core-lite` / `core-pro`, so nothing may key on a
 * tier id any more — a Core PACKAGE (Foundation / Margin / Growth /
 * Performance) includes all eleven domain modules, which is what actually
 * determines competitor overlap. Callers pass this marker plus the domain
 * module ids; competitor calculators must never test for a retired tier id.
 */
export const CORE_PACKAGE_SELECTION_ID = 'core_package';

export const COMPETITOR_PRICING: Record<string, CompetitorPricing> = {

  // ─────────────────────────────────────────────────────────────────────────
  // TENZO
  // Source: tenzo.io/pricing (last first-party read: 2026-01-01)
  // ─────────────────────────────────────────────────────────────────────────
  tenzo: {
    id: 'tenzo',
    name: 'Tenzo',
    category: 'Restaurant analytics platform',
    icon: 'chart',
    verification: 'verified' as VerificationLevel,
    sourceUrl: 'https://tenzo.io/pricing',
    lastVerified: '2026-01-01',
    // These are the SAME three modules `calculate` bills for, in Sundae's own
    // domain ids. They disagreed: the calculator charges for
    // ['sales', 'labor', 'inventory'] while the coverage rail scored
    // ['labor', 'inventory', 'pulse'] — so a Foundation or Growth buyer, whose
    // package grants no `inventory`, was billed $75/location/month for a Tenzo
    // module they would never buy, while Tenzo's real sales/revenue coverage
    // went uncredited. One list drove the price and a different one drove the
    // argument.
    coversDomains: ['revenue', 'labor', 'inventory'],

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
      // The three products Tenzo actually sells, in Sundae's domain ids.
      // Sundae's domain id for sales is `revenue`; 'sales' matched no domain
      // in the buyer's selection, so this filter silently dropped it.
      const TENZO_DOMAINS = ['revenue', 'labor', 'inventory'];

      // Bill only the modules that overlap what the buyer actually bought.
      //
      // This used to short-circuit on "a v1.7 Core package includes every
      // domain module, so all three of Tenzo's are in scope" — which is false,
      // and is the same claim removed from the FAQ: packages grant four, six,
      // eight and eleven domains, not eleven each. A Core Foundation buyer
      // (labour, profit, revenue, pulse) needs two Tenzo modules, not three, so
      // we were invoicing a named competitor $75/location/month for an
      // Inventory product that buyer would never have reason to purchase.
      //
      // Correcting it makes Tenzo CHEAPER against Foundation and Growth, which
      // is worse for us and right. An inflated rival price is the one defect
      // that cannot survive the buyer opening the rival's pricing page.
      const covered = TENZO_DOMAINS.filter((d) => modules.includes(d));
      const moduleCount = covered.length;

      const monthlyPerLoc = moduleCount * 75;
      const monthly = monthlyPerLoc * locations;
      const setupFee = moduleCount * locations * 350;

      return summarise(
        [
          {
            label: 'Monthly licenses',
            amount: monthly * 12,
            kind: 'recurring',
            verification: 'verified',
            source: `${moduleCount} module(s) x ${locations} location(s) x $75/month — tenzo.io/pricing`,
          },
          {
            label: 'Setup fees',
            amount: setupFee,
            kind: 'one_time',
            verification: 'verified',
            source: `$350 per module per location — tenzo.io/pricing`,
          },
        ],
        // Static and always true. This used to be a dynamic "covers N of M
        // areas" string computed from whatever the caller happened to pass,
        // which counted add-on ids as uncovered "areas". Coverage is now a
        // structural field on the comparison, computed from the domains the
        // buyer's package actually grants.
        'Tenzo sells sales, labour and inventory analytics. Domains outside those three are not available at any price.',
        'high',
      );
    },

    // Limitations are buyer-facing and get checked. Everything a vendor's own
    // site disproves has been removed rather than softened — a claim the rep
    // can refute from their homepage costs more than the claim was worth.
    limitations: [
      // REMOVED, each disproved on Tenzo's own properties: "No purchasing
      // module", "No reservation intelligence" (they ship a Reservations
      // module with SevenRooms/Tripleseat integrations and a reservations_
      // schema prefix), and "No competitive intelligence" — which was never
      // sourced on any of the five entries that carried it, and Tenzo
      // publishes monthly market-level like-for-like sales for several hundred
      // London and South-East sites.
      'Three modules only — the other domains are not sold at any price',
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
    icon: 'bot',
    verification: 'unverified' as VerificationLevel,
    sourceUrl: null,
    lastVerified: null,
    showPricing: false,  // Don't show in comparisons
    coversDomains: ['labor', 'inventory', 'purchasing', 'profit', 'pulse'],

    pricing: {},

    calculate: () => {
      // Nory pricing not publicly available. Nothing is modelled here — the
      // former $800/$1,000/$1,200 band was an unsourced guess sitting in a
      // shipped file, one refactor away from being rendered.
      return {
        monthly: null,
        firstYear: null,
        ongoing: null,
        setupFee: null,
        breakdown: null,
        lines: [],
        notes: 'Pricing not publicly available. Contact Nory directly for custom quotes based on your restaurant size and needs.',
        confidence: 'none',
      };
    },

    // Limitations are buyer-facing and get checked. Everything a vendor's own
    // site disproves has been removed rather than softened — a claim the rep
    // can refute from their homepage costs more than the claim was worth.
    limitations: [
      // REMOVED, all four. "Higher price point" asserts a comparison against a
      // price we do not have — this entry is verification: 'unverified' and
      // showPricing: false, so we cannot claim their price is higher than
      // anything. "Less granular module selection" and "Newer platform, less
      // proven at scale" are unsourced opinion. "No competitive intelligence"
      // was unsourced, and Nory markets peer benchmarking against anonymised
      // data from hundreds of operators.
      //
      // Nothing replaces them: we do not publish a price for Nory, and we have
      // no sourced limitation. An empty list is the honest state.
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
    icon: 'file',
    verification: 'estimated' as VerificationLevel,
    sourceUrl: 'https://www.restaurant365.com',
    lastVerified: '2026-01-01',
    coversDomains: ['inventory', 'purchasing', 'labor', 'profit'],

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

      return summarise(
        [
          {
            label: 'Monthly subscription',
            amount: monthly * 12,
            kind: 'recurring',
            verification: 'estimated',
            source: 'Industry estimate: $200 base + $50/location/month. R365 does not publish list pricing.',
          },
          {
            label: 'Implementation',
            amount: setupFee,
            kind: 'one_time',
            verification: 'estimated',
            source: 'Industry estimate: $5,000 base + $500/location, one time.',
          },
        ],
        'Includes accounting; different focus than pure analytics. Industry estimate.',
        'medium',
      );
    },

    // Limitations are buyer-facing and get checked. Everything a vendor's own
    // site disproves has been removed rather than softened — a claim the rep
    // can refute from their homepage costs more than the claim was worth.
    limitations: [
      // REMOVED: "No AI-powered insights" (R365 markets R365 AI and an "AI
      // Advisor" answering cross-domain questions with no report building),
      // "No benchmark data" (they publish industry benchmarks off roughly
      // 10,000 US locations and market franchisee-vs-franchisee comparison),
      // and the unsourced "No competitive intelligence".
      'Accounting-led: the analytics follow the ledger rather than operations'
    ]
  },

  // ─────────────────────────────────────────────────────────────────────────
  // POWER BI — licences published by Microsoft, build cost estimated
  // ─────────────────────────────────────────────────────────────────────────
  // The card used to print $88,600 over a breakdown that summed to $53,600.
  // Two separate defects produced that:
  //
  //   • The UI rendered only the first three lines, so the fourth was invisible.
  //     Fixed structurally — `summarise()` derives the total FROM the lines.
  //   • The fourth line was a duplicate. `annualMaintenance` was documented in
  //     this very file as "typically need a consultant or FTE", and then a
  //     SECOND $35,000 "Analyst 0.5 FTE" was added on top. The same half-analyst
  //     was billed twice: once as maintenance, once by name. The named line is
  //     removed and the maintenance line states what it covers.
  //
  // Net effect is a LOWER competitor cost and therefore a smaller claimed
  // saving. That is the direction an unsupported figure must always move.
  // ─────────────────────────────────────────────────────────────────────────
  powerbi: {
    id: 'powerbi',
    name: 'Power BI',
    category: 'Build-your-own with Microsoft BI',
    icon: 'chart',
    verification: 'estimated' as VerificationLevel,
    sourceUrl: 'https://powerbi.microsoft.com/pricing/',
    lastVerified: '2026-01-01',
    coversDomains: [],
    cannotDoAtAnyPrice: [
      {
        claim: 'No pre-built restaurant connectors',
        basis:
          'Power Query ships no production connector for Toast, Square, Lightspeed, Oracle MICROS/Simphony, OpenTable, SevenRooms, DoorDash, Uber Eats or Deliveroo. Fivetran offers Toast only as an SDK template the customer modifies and maintains.',
      },
      {
        claim: 'No restaurant data model — it starts as a blank canvas',
        basis:
          "Microsoft's only shipped industry model is a generic Retail schema (Customer / Product / Transaction / Inventory / Promotion). Covers, dayparts, theoretical food cost, recipe yield, void and comp, tender mix and aggregator commission have to be modelled from scratch.",
      },
      {
        claim: 'Peer benchmarking is impossible inside your own tenant',
        basis:
          'Benchmarking needs other operators\' data. A Power BI tenant contains only your own, at any licence tier.',
      },
      {
        claim: 'Every viewer needs a paid seat',
        basis:
          'Free viewing requires an F64 or larger Fabric capacity (~$60,000/yr). Below that, Microsoft requires each viewer to hold Pro or PPU.',
      },
    ],

    pricing: {
      // Microsoft list prices, re-fetched from the pricing page 2026-08-11.
      // Both figures here were stale: Pro was $10 and PPU $20 before the 2025
      // reprice.
      licenses: {
        proPerUser: 14,
        premiumPerUser: 24,
        typicalUsers: (locations: number) => Math.max(5, Math.ceil(locations * 1.5))
      },

      // One-time build
      implementation: {
        small: 15000,   // 1-5 locations
        medium: 30000,  // 6-20 locations
        large: 50000    // 21+ locations
      },

      // Ongoing development + support. This IS the half-analyst: a consultant
      // retainer or ~0.5 FTE keeping the model and reports alive. There is no
      // separate analyst line, because there is no separate analyst.
      annualDevelopmentAndSupport: {
        small: 10000,
        medium: 20000,
        large: 35000
      }
    },

    calculate: (locations: number) => {
      const users = Math.max(5, Math.ceil(locations * 1.5));
      // Premium Per User at the current $24 list price (was hardcoded at the
      // stale $20). PPU rather than Pro is an ASSUMPTION and is declared as one
      // in COMPETITOR_ASSUMPTIONS: Microsoft caps shared capacity at eight
      // scheduled semantic-model refreshes a day, which a multi-site group
      // running intraday sales dashboards exceeds. A group reporting once a day
      // fits inside Pro at $14, and this line then overstates them by $120 per
      // seat per year.
      const licenseCost = users * 24 * 12;

      let implementation: number;
      let support: number;
      if (locations <= 5) {
        implementation = 15000;
        support = 10000;
      } else if (locations <= 20) {
        implementation = 30000;
        support = 20000;
      } else {
        implementation = 50000;
        support = 35000;
      }

      return summarise(
        [
          {
            label: 'Licenses (verified)',
            amount: licenseCost,
            kind: 'recurring',
            verification: 'verified',
            source: `${users} Premium Per User seats x $20/month — Microsoft published list price`,
          },
          {
            label: 'Implementation (estimated)',
            amount: implementation,
            kind: 'one_time',
            verification: 'estimated',
            source: 'Industry estimate for a restaurant data model + report build at this estate size.',
          },
          {
            label: 'Maintenance (estimated)',
            amount: support,
            kind: 'recurring',
            verification: 'estimated',
            source:
              'Industry estimate. Covers ongoing development and support — the ~0.5 FTE analyst or consultant retainer. Counted once; it is not billed again as a separate analyst line.',
          },
        ],
        'Requires technical expertise. License costs verified from Microsoft; implementation and maintenance are industry estimates.',
        'medium',
      );
    },

    limitations: [
      // "No AI insights included" used to sit in this list and is false.
      // Power BI ships ETS forecasting and anomaly detection in the Analytics
      // pane, what-if parameters, and Copilot grounded in the semantic model.
      // It is the easiest claim on the card for a buyer to disprove in the
      // room, and losing that line costs far less than being caught making it.
      // The honest version of each gap is "narrower", not "none".
      'Requires technical expertise to build',
      'No pre-built restaurant analytics',
      'Forecasting is a chart-level trend line, not a P&L forecast with scenarios',
      'Copilot requires paid Fabric capacity, not a Pro or PPU seat alone',
      'No benchmark data',
      'Ongoing development required',
      'No competitive intelligence'
    ]
  },

  // ─────────────────────────────────────────────────────────────────────────
  // SPREADSHEETS - ⚠️ ESTIMATED
  // ─────────────────────────────────────────────────────────────────────────
  // The error/rework line is 0.2% of revenue. The RATE is unchanged; what
  // changed is whose revenue it is applied to. It used to multiply a hardcoded
  // $100,000/location/month that no buyer ever entered, so at 25 sites it
  // invented $60,000 of competitor cost — and it did that while the buyer's own
  // $50,000 sat two steps earlier in the same journey. The basis is now the
  // figure the buyer supplied, and when they supplied none the line is dropped
  // instead of assumed.
  // ─────────────────────────────────────────────────────────────────────────
  spreadsheets: {
    id: 'spreadsheets',
    name: 'Spreadsheets',
    category: 'Excel / Google Sheets',
    icon: 'clipboard',
    verification: 'estimated' as VerificationLevel,
    sourceUrl: null,
    lastVerified: '2026-01-01',
    coversDomains: [],
    cannotDoAtAnyPrice: [
      {
        claim: 'Nothing updates unless someone updates it',
        basis:
          'A spreadsheet has no ingestion. Every figure on it is there because a person exported, pasted and reconciled it, so the analysis is exactly as current as the last time somebody did that work.',
      },
      {
        claim: 'No peer benchmarking',
        basis: 'A workbook contains only your own numbers; there is nothing to compare against.',
      },
    ],

    pricing: {
      software: 200,  // Per year, part of existing M365/Google
      analystHoursPerWeek: (locations: number) => Math.max(10, locations * 2),
      analystHourlyRate: SPREADSHEETS_LABOR_RATE_USD,
      errorCostPercent: 0.002  // 0.2% of the buyer's OWN revenue
    },

    calculate: (locations: number, _modules: string[], context?: CompetitorCalcContext) => {
      void _modules;
      const hoursPerWeek = Math.max(10, locations * 2);
      const weeksPerYear = 50;
      const hourlyRate = SPREADSHEETS_LABOR_RATE_USD;

      const laborCost = hoursPerWeek * weeksPerYear * hourlyRate;

      const lines: CompetitorCostLine[] = [
        {
          // Named as time, not as an invoice.
          //
          // This is the single largest line in the only comparison Sundae
          // consistently wins — the status quo took the "best savings" badge in
          // 316 of 316 sampled configurations — and it is imputed: nobody writes
          // a cheque for it. Labelled "Labor" beside two cash costs it read as
          // an invoice, and a CFO who strikes it flips roughly 3,400 of 8,700
          // "Sundae is cheaper" cells the other way.
          //
          // It is NOT deleted. The time is genuinely spent and every credible
          // TCO comparison counts staff time. What was wrong was presenting it
          // as cash without saying so, which is the one thing that does not
          // survive the question "do we actually pay that?".
          label: `Manager time (${hoursPerWeek} hrs/week @ $${SPREADSHEETS_LABOR_RATE_USD}/hr)`,
          amount: laborCost,
          kind: 'recurring',
          verification: 'estimated',
          source: `${hoursPerWeek} hrs/week x ${weeksPerYear} weeks x $${SPREADSHEETS_LABOR_RATE_USD}/hr. This is the VALUE OF TIME already being spent, not an invoice you receive — if that time is not redeployed, the cash saving is the software line alone.`,
        },
        {
          label: 'Software',
          amount: 200,
          kind: 'recurring',
          verification: 'estimated',
          source: 'Marginal seat cost within an existing M365 / Google Workspace subscription.',
        },
      ];

      const revenuePerLocation = context?.monthlyRevenuePerLocation;
      const hasRevenue =
        typeof revenuePerLocation === 'number' &&
        Number.isFinite(revenuePerLocation) &&
        revenuePerLocation > 0;

      if (hasRevenue) {
        const annualRevenue = revenuePerLocation * locations * 12;
        lines.push({
          label: 'Error/rework cost (0.2% revenue)',
          amount: Math.round(annualRevenue * 0.002),
          kind: 'recurring',
          verification: 'estimated',
          source: `0.2% of the $${annualRevenue.toLocaleString('en-US')} annual revenue you entered (${locations} location(s) x $${revenuePerLocation.toLocaleString('en-US')}/month). Modelled rate, not a vendor price.`,
        });
      }

      return summarise(
        lines,
        hasRevenue
          ? 'Hidden costs in manual labor and decision-making errors. Based on industry research.'
          : 'Labour and software only. The error/rework estimate is omitted because no revenue figure was entered.',
        'medium',
      );
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
  // MARKETMAN — corrected against the vendor's own page, 2026-08-11
  // ─────────────────────────────────────────────────────────────────────────
  // This entry carried the only green "Verified" badge on the screen, and the
  // page it linked to contradicted it. marketman.com/pricing publishes:
  //
  //   Starter  $199 /monthly
  //   Growth   $249 /monthly
  //   Enterprise — "Custom"
  //   "Get started with FREE setup ($1,500 Value)"
  //
  // There is NO "Professional" tier, the figure was $250 not $249, and the
  // $500/location setup fee we were charging them is advertised free. The page
  // also states no per-location multiplier, so a multi-site total is OURS, not
  // theirs — hence one Growth subscription per location is declared as an
  // assumption and the card is `estimated` above a single site.
  // ─────────────────────────────────────────────────────────────────────────
  marketman: {
    id: 'marketman',
    name: 'MarketMan',
    category: 'Inventory & purchasing',
    icon: 'package',
    verification: 'verified' as VerificationLevel,
    sourceUrl: 'https://www.marketman.com/pricing',
    lastVerified: '2026-08-11',
    coversDomains: ['inventory', 'purchasing'],

    pricing: {
      publishedMonthly: {
        starter: 199,
        growth: 249,
        enterprise: null,  // "Custom" — not quotable
      },
      /** Advertised free on the pricing page ("FREE setup ($1,500 Value)"). */
      setupFee: 0,
      /** NOT published. Applying it per location is our assumption, stated. */
      perLocationMultiplierPublished: false,
    },

    calculate: (locations: number) => {
      const growthMonthly = 249;
      const multiSite = locations > 1;

      return summarise(
        [
          {
            label: 'Monthly licenses',
            amount: growthMonthly * locations * 12,
            kind: 'recurring',
            verification: multiSite ? 'estimated' : 'verified',
            source: multiSite
              ? `$249/month Growth plan (published, marketman.com/pricing) x ${locations} locations. The per-location multiplier is NOT published — one subscription per location is our assumption.`
              : '$249/month Growth plan — published on marketman.com/pricing.',
          },
        ],
        multiSite
          ? 'Inventory & purchasing only. $249/mo Growth plan is published; the multi-site multiplier is our assumption, not MarketMan\'s.'
          : 'Inventory & purchasing only. Growth plan, published price. Setup is advertised free.',
        multiSite ? 'low' : 'high',
      );
    },

    limitations: [
      'Inventory-focused only',
      // REMOVED: "No labor analytics". MarketMan's own site markets visibility
      // into "every dollar spent on labor, food, and supplies" through its Push
      // Operations partnership, so the claim is refutable from their homepage.
      // Their real scope limit is already carried by coversDomains.
      'No sales analytics',
      'No AI insights',
      // REMOVED: "No competitive intelligence" was never sourced here. It is
      // defensible for Power BI and spreadsheets, which structurally hold only
      // the buyer's own data — and it is stated there with a basis. It is not
      // defensible for a vendor whose own partner directory offers it.
    ]
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 7SHIFTS
  // Source: 7shifts.com/pricing (last first-party read: 2026-01-01)
  // ─────────────────────────────────────────────────────────────────────────
  '7shifts': {
    id: '7shifts',
    name: '7shifts',
    category: 'Labor & scheduling',
    icon: 'users',
    verification: 'verified' as VerificationLevel,
    sourceUrl: 'https://www.7shifts.com/pricing',
    lastVerified: '2026-01-01',
    coversDomains: ['labor'],

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

      return summarise(
        [
          {
            label: 'Monthly licenses (The Works tier)',
            amount: Math.round(perLoc * locations * 12),
            kind: 'recurring',
            verification: 'verified',
            source: `$76.99/location/month, The Works tier x ${locations} location(s) — 7shifts.com/pricing`,
          },
        ],
        'Labor & scheduling only. The Works tier used for comparison.',
        'high',
      );
    },

    limitations: [
      'Labor/scheduling only',
      'No inventory analytics',
      'No sales analytics',
      'No AI-powered insights',
      // REMOVED: "No competitive intelligence" was never sourced here. It is
      // defensible for Power BI and spreadsheets, which structurally hold only
      // the buyer's own data — and it is stated there with a basis. It is not
      // defensible for a vendor whose own partner directory offers it.
      'Would need to combine with other tools'
    ]
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// SUNDAE'S SIDE OF THE COMPARISON
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Sundae's cost, exactly as the quote screen above the card computes it.
 *
 * The competitor card used to price Sundae by re-running the Core engine with
 * no client profile and no Crew rail, so on the Core+Crew pathway the summary
 * said "$57,168 annually" and the card 30 pixels below said "Sundae First Year
 * $51,180" — and then built a saving on the smaller number. Two answers to one
 * question on one screen, and the one used to sell was the flattering one.
 *
 * Passing a bare number is still supported for the PDF path, which prices the
 * Core rail only; it is treated as `coreMonthly` with no Crew and no known
 * implementation, which is exactly what that caller means.
 */
export interface SundaeQuoteBasis {
  /** Core rail monthly AFTER discounts — the summary's `pricing.total`. */
  coreMonthly: number;
  /** Crew rail monthly. Zero when the quote has no Crew rail. */
  crewMonthly: number;
  /** One-time implementation as the summary resolves it. */
  implementationFee: number;
  /** True when v1.7 publishes no class and the fee is scoped at contract. */
  implementationScoped: boolean;
  /** True when the published fee is a floor ("from $12,500"). */
  implementationIsFloor: boolean;
}

function toBasis(input: number | SundaeQuoteBasis): SundaeQuoteBasis {
  if (typeof input === 'number') {
    return {
      coreMonthly: input,
      crewMonthly: 0,
      implementationFee: 0,
      implementationScoped: false,
      implementationIsFloor: false,
    };
  }
  return input;
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPARISON RESULT INTERFACE
// ═══════════════════════════════════════════════════════════════════════════

export interface ComparisonResult {
  competitor: {
    id: string;
    name: string;
    icon: string;
    category: string;
    verification: VerificationLevel;
    /** After freshness decay — what the badge is allowed to say today. */
    effectiveVerification: VerificationLevel;
    lastVerified: string | null;
    sourceUrl: string | null;
  };
  competitorCost: {
    monthly: number;
    firstYear: number;
    ongoing: number;
    setupFee: number;
    breakdown?: Record<string, number>;
    lines: CompetitorCostLine[];
  };
  sundaeCost: {
    monthly: number;
    annual: number;
    coreMonthly: number;
    crewMonthly: number;
    implementationFee: number;
    implementationScoped: boolean;
    implementationIsFloor: boolean;
    /** Annual + implementation. Null when implementation is scoped at contract. */
    firstYear: number | null;
  };
  savings: {
    monthly: number;
    /**
     * Recurring annual difference — the ONLY basis that is always like-for-like
     * and always reconciles with the annual figure printed on the quote above.
     * This is what the card leads with.
     */
    ongoing: number;
    /**
     * Both sides including one-time fees. Retained for the PDF, which passes a
     * bare number and therefore gets today's arithmetic unchanged.
     */
    firstYear: number;
    /** False when our implementation is scoped, so first year is not knowable. */
    firstYearComparable: boolean;
  };
  /** Which of the buyer's granted domains this vendor sells an equivalent for. */
  coverage: {
    covered: string[];
    missing: string[];
    selectedDomains: number;
    /**
     * How many of the buyer's granted domains this vendor answers on DAY ONE.
     *
     * For Power BI and for spreadsheets this is zero — our own `coversDomains`
     * says so — and it is the strongest true statement on the card: the buyer
     * pays a five-figure build before the first question is answered. It was
     * computed nowhere and rendered nowhere.
     */
    dayOneDomains: number;
    /** The one-time spend that precedes that day-one figure, if any. */
    buildBeforeFirstAnswer: number;
  };
  /** Capabilities unavailable from this vendor at any spend. */
  cannotDoAtAnyPrice: ReadonlyArray<{ claim: string; basis: string }>;
  notes: string | null;
  confidence: 'high' | 'medium' | 'low' | 'none';
  limitations: string[];
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPARISON CALCULATOR
// ═══════════════════════════════════════════════════════════════════════════

const DOMAIN_IDS = new Set<string>(CORE_DOMAIN_MODULE_IDS);

export function calculateCompetitorComparison(
  competitorId: string,
  locations: number,
  modules: string[],
  sundae: number | SundaeQuoteBasis,
  context?: CompetitorCalcContext,
  asOf: Date = new Date(),
): ComparisonResult | null {
  const competitor = COMPETITOR_PRICING[competitorId];
  if (!competitor) return null;

  const competitorCost = competitor.calculate(locations, modules, context);

  // If pricing not available (null), return null
  if (
    competitorCost.firstYear === null ||
    competitorCost.monthly === null ||
    competitorCost.ongoing === null
  ) {
    return null;
  }

  const basis = toBasis(sundae);
  const sundaeMonthly = basis.coreMonthly + basis.crewMonthly;
  const sundaeAnnual = Math.round(sundaeMonthly * 12 * 100) / 100;
  const sundaeFirstYear = basis.implementationScoped
    ? null
    : sundaeAnnual + basis.implementationFee;

  const selectedDomains = modules.filter((m) => DOMAIN_IDS.has(m));
  const covered = selectedDomains.filter((d) => competitor.coversDomains.includes(d));
  const missing = selectedDomains.filter((d) => !competitor.coversDomains.includes(d));

  return {
    competitor: {
      id: competitor.id,
      name: competitor.name,
      icon: competitor.icon,
      category: competitor.category,
      verification: competitor.verification,
      effectiveVerification: effectiveVerification(
        competitor.verification,
        competitor.lastVerified,
        asOf,
      ),
      lastVerified: competitor.lastVerified ?? null,
      sourceUrl: competitor.sourceUrl ?? null,
    },
    competitorCost: {
      monthly: competitorCost.monthly,
      firstYear: competitorCost.firstYear,
      ongoing: competitorCost.ongoing,
      setupFee: competitorCost.setupFee ?? 0,
      breakdown: competitorCost.breakdown ?? undefined,
      lines: competitorCost.lines,
    },
    sundaeCost: {
      monthly: sundaeMonthly,
      annual: sundaeAnnual,
      coreMonthly: basis.coreMonthly,
      crewMonthly: basis.crewMonthly,
      implementationFee: basis.implementationFee,
      implementationScoped: basis.implementationScoped,
      implementationIsFloor: basis.implementationIsFloor,
      firstYear: sundaeFirstYear,
    },
    savings: {
      monthly: competitorCost.monthly - sundaeMonthly,
      ongoing: competitorCost.ongoing - sundaeAnnual,
      firstYear: competitorCost.firstYear - (sundaeFirstYear ?? sundaeAnnual),
      firstYearComparable: sundaeFirstYear !== null,
    },
    coverage: {
      covered,
      missing,
      selectedDomains: selectedDomains.length,
      dayOneDomains: covered.length,
      buildBeforeFirstAnswer: competitorCost.setupFee ?? 0,
    },
    cannotDoAtAnyPrice: competitor.cannotDoAtAnyPrice ?? [],
    notes: competitorCost.notes,
    confidence: competitorCost.confidence ?? 'medium',
    limitations: competitor.limitations
  };
}

/**
 * The basis a comparison is argued on — one definition, used by both the sort
 * here and every figure the card renders.
 *
 * First year (recurring plus one-time on BOTH sides) is the honest basis when
 * our own implementation is knowable, because every competitor here charges
 * real setup: Tenzo $350 per module per location, Power BI $15,000-$50,000 to
 * build. Recurring-only silently gave them those fees for free.
 *
 * It is used only when `firstYearComparable` is true. That flag is false while
 * Sundae's implementation is still scoped at contract, and counting a
 * competitor's setup fee against a Sundae figure that excludes ours is the same
 * defect pointing the other way — which is exactly why an earlier fix moved
 * this sort onto `ongoing`. The asymmetry is gone once the discovery answers
 * resolve our class, so the basis can follow the data again.
 */
export function comparisonAmount(c: ComparisonResult): number {
  return c.savings.firstYearComparable ? c.savings.firstYear : c.savings.ongoing;
}

export function calculateAllComparisons(
  locations: number,
  modules: string[],
  sundae: number | SundaeQuoteBasis,
  context?: CompetitorCalcContext,
  asOf: Date = new Date(),
): ComparisonResult[] {
  // Derived from the catalogue itself. The hand-maintained list carried
  // 'sevenShifts' — the RECORD KEY — while the lookup below reads
  // `COMPETITOR_PRICING[c.competitor.id]` and that record's id is '7shifts'.
  // The lookup returned undefined and the row was filtered out of every
  // comparison on screen, while the Assumptions panel went on printing
  // "sevenShifts: $76.99/location". It was the only entry whose key and id
  // disagreed, and it was the cheapest rival on the board.
  const competitorIds = Object.keys(COMPETITOR_PRICING);

  const comparisons = competitorIds
    .map(id => calculateCompetitorComparison(id, locations, modules, sundae, context, asOf))
    .filter((c): c is ComparisonResult => {
      if (!c) return false;
      // Exclude anything whose price is not public. Freshness decay downgrades
      // a BADGE; it must never silently drop a competitor from the comparison,
      // or the card would quietly become a list of whoever we checked last.
      const competitor = COMPETITOR_PRICING[c.competitor.id];
      if (!competitor) return false;
      if (competitor.verification === 'unverified') return false;
      if (competitor.showPricing === false) return false;
      return true;
    });

  // Sorted on the SAME basis the card renders, so the ranking can never
  // disagree with the number beside it.
  return comparisons.sort((a, b) => comparisonAmount(b) - comparisonAmount(a));
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
    notes: 'Not priced here — Nory publishes no list price, so no figure is modelled.',
    lastVerified: 'January 2026'
  },
  powerbi: {
    source: 'powerbi.microsoft.com/pricing (list prices re-checked 2026-08-11) + our own estimates',
    notes:
      'Pro $14/user/month, Premium Per User $24/user/month — both were stale here at $10 and $20. We model PPU because Microsoft caps shared capacity at eight scheduled semantic-model refreshes a day; a group reporting once daily fits inside Pro, and this line then overstates them by $120 per seat per year. Seat count, one-time build and ongoing support (the ~0.5 FTE, counted once) are our estimates, not published prices.',
    lastVerified: 'August 2026'
  },
  spreadsheets: {
    source: 'Industry labor cost estimates',
    notes: `${'{locations * 2}'} hours/week analyst @ $${SPREADSHEETS_LABOR_RATE_USD}/hr, plus 0.2% of YOUR entered revenue for errors (omitted if you enter none)`,
    lastVerified: 'January 2026'
  },
  restaurant365: {
    source: 'Industry estimates',
    notes: '$200 base + $50/location + implementation fees',
    lastVerified: 'January 2026'
  },
  marketman: {
    source: 'marketman.com/pricing',
    notes: '$249/month Growth plan, setup advertised free. Multi-site multiplier is not published — one subscription per location is our assumption.',
    lastVerified: 'August 2026'
  },
  '7shifts': {
    source: '7shifts.com/pricing',
    notes: '$76.99/location for The Works tier',
    lastVerified: 'January 2026'
  }
};
