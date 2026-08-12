// Multi-competitor comparison for the quote screen.
//
// Everything on this card is compared against the SAME quote printed above it.
// It previously was not, and the gap was visible on one screen without
// scrolling: the summary said "$57,168 annually" and this card said "Sundae
// First Year $51,180", then built a "$37,420 saving" on the smaller figure.
// The card was re-running the Core engine with no client profile (so no
// commitment discount), no Cross-Intelligence selection, and no Crew rail at
// all — pricing a configuration the buyer had not chosen, and one that
// flattered us by $5,988 a year.
//
// The rules this file now keeps:
//   • Sundae's number is derived from the same inputs ConfigSummary uses, so
//     the two figures reconcile by construction (see `useQuotedSundaeCost`).
//   • The headline saving is RECURRING ANNUAL on both sides. One-time fees are
//     shown separately, because ours is usually "scoped at contract" and a
//     first-year claim that silently treats an unknown as zero is not a claim.
//   • Every competitor line renders — no slicing — and the lines are summed on
//     screen so a reader can check the total against its parts.
//   • Every line carries its own verification level and source.
//   • The verified badge expires (see `effectiveVerification`).

import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, TrendingDown, Info, AlertTriangle, X, CheckCircle, AlertCircle } from 'lucide-react';
import { getIconByEmoji } from '../../lib/iconMap';
import { useConfiguration } from '../../hooks/useConfiguration';
import { usePriceCalculation } from '../../hooks/usePriceCalculation';
import {
  calculateAllComparisons,
  COMPETITOR_ASSUMPTIONS,
  COMPETITOR_PRICING,
  CORE_PACKAGE_SELECTION_ID,
  VERIFICATION_FRESHNESS_DAYS,
  verificationAgeDays,
  type ComparisonResult,
  type SundaeQuoteBasis,
} from '../../data/competitorPricing';
import { comparisonAmount } from '../../data/competitorPricing';
import { PACKAGE_DOMAIN_GRANTS, modules as coreDomainModules } from '../../data/pricing';
import { computeCrewQuote } from '../../lib/crewPricing';
import { resolveImplementationFee } from '../../lib/pricingEngine';
import { resolveImplementationClass } from '../../lib/discoveryEngine';
import { cn } from '../../utils/cn';
import { useLocale } from '../../contexts/LocaleContext';
import {
  formatMessage,
  getCompetitorCompareCopy,
  getLocalizedCompetitorBreakdownLabel,
  getLocalizedCompetitorCategory,
  getLocalizedCompetitorLimitation,
  getLocalizedCompetitorNote,
  getLocalizedCompetitorSource,
  type PricingUiLocale,
} from '../../lib/pricingUiCopy';

function EmojiIcon({ emoji, className }: { emoji: string; className?: string }) {
  const Icon = getIconByEmoji(emoji);
  return <Icon className={className} />;
}

/**
 * Sundae's cost as the quote screen states it.
 *
 * This deliberately mirrors ConfigSummary field for field — the same client
 * profile (so the commitment discount applies), the same Cross-Intelligence
 * selection, the same Crew rail, the same implementation resolution. Any figure
 * here that diverges from the summary is a contradiction on a single screen,
 * which is exactly the defect this replaces.
 */
function useQuotedSundaeCost() {
  const {
    layer, corePackage, locations, addOns, watchtowerModules,
    crossIntelligence, crewSkus: selectedCrewSkus,
    operatingModels, techStack, billingCycle, roiInputs,
  } = useConfiguration();

  const clientProfile = useMemo(
    () => ({
      type: 'independent' as const,
      isEarlyAdopter: false,
      isFranchise: operatingModels.includes('franchise'),
      brandCount: operatingModels.includes('multi_brand') ? 2 : 1,
      billingCycle,
    }),
    [operatingModels, billingCycle],
  );

  const pricing = usePriceCalculation(
    layer, corePackage, locations, addOns, watchtowerModules, clientProfile, crossIntelligence,
  );

  const crewRail = useMemo(
    () =>
      layer === 'both' && selectedCrewSkus.length > 0
        ? computeCrewQuote(selectedCrewSkus, locations)
        : null,
    [layer, selectedCrewSkus, locations],
  );

  // Implementation is ONE charge at the highest class in the whole selection,
  // across both rails — and the discovery answers override it when the visitor
  // told us what they run. Identical resolution order to ConfigSummary.
  const stackEstimate = useMemo(
    () =>
      techStack.length > 0
        ? resolveImplementationClass(techStack, operatingModels, {
            crewPayrollSelected: selectedCrewSkus.includes('crew_payroll'),
          })
        : null,
    [techStack, operatingModels, selectedCrewSkus],
  );

  const railImplementation = crewRail
    ? {
        ...resolveImplementationFee([
          pricing.implementation.classId,
          crewRail.implementation.classId,
        ]),
        requiresScoping:
          pricing.implementation.requiresScoping || crewRail.implementation.requiresScoping,
      }
    : pricing.implementation;

  const basis: SundaeQuoteBasis = {
    coreMonthly: pricing.total,
    crewMonthly: crewRail?.monthly ?? 0,
    implementationFee: stackEstimate ? stackEstimate.fee : railImplementation.fee,
    implementationScoped: stackEstimate ? false : railImplementation.requiresScoping,
    implementationIsFloor: stackEstimate ? stackEstimate.isFloor : railImplementation.isFloor,
  };

  return {
    basis,
    locations,
    addOns,
    corePackage,
    hasCrewRail: crewRail !== null,
    requiresEnterpriseQuote: pricing.requiresEnterpriseQuote,
    /** Per-location monthly revenue the buyer entered on the ROI step. */
    monthlyRevenuePerLocation: roiInputs.monthlyRevenue,
  };
}

export function CompactCompetitorCompare() {
  const { locale } = useLocale();
  const uiLocale = locale as PricingUiLocale;
  const copy = getCompetitorCompareCopy(uiLocale);

  const {
    basis, locations, addOns, corePackage, hasCrewRail,
    requiresEnterpriseQuote, monthlyRevenuePerLocation,
  } = useQuotedSundaeCost();

  const [expandedCompetitor, setExpandedCompetitor] = useState<string | null>(null);
  const [showAssumptions, setShowAssumptions] = useState(false);

  // Coverage is scored against the domains THIS package grants, not all eleven.
  // Under v1.7 the packages differ by grant (Foundation 4 → Performance 11), so
  // telling a Foundation buyer a vendor misses eight domains they were never
  // sold is as wrong as telling them it misses none.
  const grantedDomains = PACKAGE_DOMAIN_GRANTS[corePackage] as readonly string[];
  const allModules = useMemo(
    () => [...addOns, CORE_PACKAGE_SELECTION_ID, ...grantedDomains],
    [addOns, grantedDomains],
  );

  const comparisons = useMemo(
    () =>
      calculateAllComparisons(locations, allModules, basis, {
        monthlyRevenuePerLocation,
      }),
    // `basis` is a fresh object each render; its fields are the real inputs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      locations,
      allModules,
      basis.coreMonthly,
      basis.crewMonthly,
      basis.implementationFee,
      basis.implementationScoped,
      monthlyRevenuePerLocation,
    ],
  );

  const money = (amount: number) =>
    `$${Math.round(amount).toLocaleString(locale)}`;

  // At 250+ units v1.7 publishes no self-serve number. The summary prints
  // "Custom pricing" there, so this card must not manufacture a comparison
  // against a total the quote itself refuses to state.
  if (requiresEnterpriseQuote) {
    return (
      <div className="compact-competitor-compare">
        <h4 className="text-lg font-semibold flex items-center gap-2 mb-3">
          <TrendingDown className="w-5 h-5 text-green-400" />
          {copy.title}
        </h4>
        <div className="flex items-start gap-2 text-sm text-amber-400 bg-amber-900/10 border border-amber-500/20 rounded p-3">
          <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>
            No comparison is shown at this estate size. Your Sundae price is quoted, not
            published, so there is no total to compare against.
          </span>
        </div>
      </div>
    );
  }

  const cheaper = comparisons.filter((c) => comparisonAmount(c) > 0);
  const costsMore = comparisons.filter((c) => comparisonAmount(c) <= 0);
  const bestSavings = cheaper[0];

  return (
    <div className="compact-competitor-compare">
      {/* Header with assumptions button */}
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-lg font-semibold flex items-center gap-2">
          <TrendingDown className="w-5 h-5 text-green-400" />
          {copy.title}
        </h4>
        <button
          onClick={() => setShowAssumptions(!showAssumptions)}
          className="text-xs text-slate-500 hover:text-slate-400 flex items-center gap-1 transition-colors"
        >
          <Info className="w-3 h-3" />
          {showAssumptions ? copy.hideAssumptions : copy.viewAssumptions}
        </button>
      </div>

      {/* The basis, stated before any number. Without this the reader cannot
          tell whether a "saving" counted setup fees, and ours is usually not
          knowable until the implementation is scoped. */}
      <div className="mb-4 rounded-lg border border-slate-700 bg-slate-900/40 p-3 text-xs text-slate-400 space-y-1">
        <div className="flex justify-between gap-3">
          <span>Your Sundae quote, annual recurring</span>
          <span className="font-medium text-white tabular-nums">{money(basis.coreMonthly * 12 + basis.crewMonthly * 12)}</span>
        </div>
        <div className="text-[11px] text-slate-500">
          {hasCrewRail
            ? `Core ${money(basis.coreMonthly)}/mo + Crew ${money(basis.crewMonthly)}/mo — the same total as the investment summary above, after any commitment discount.`
            : `${money(basis.coreMonthly)}/mo — the same total as the investment summary above, after any commitment discount.`}
        </div>
        <div className="text-[11px] text-slate-500">
          {basis.implementationScoped
            ? 'Implementation is scoped at contract, so it is excluded here — and so is every competitor setup fee. Comparisons below are recurring-only, on both sides.'
            : `Implementation ${basis.implementationIsFloor ? 'from ' : ''}${money(basis.implementationFee)} one-time, excluded from the recurring comparison below on both sides.`}
        </div>
      </div>

      {/* Assumptions Panel */}
      <AnimatePresence>
        {showAssumptions && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mb-4"
          >
            <div className="bg-slate-800/50 rounded-lg p-4 text-xs text-slate-400 space-y-2 border border-slate-700">
              <p className="text-slate-300 font-medium mb-2">{copy.assumptionsTitle}</p>
              {/* Every priced competitor, not the first four. A source panel
                  that stops before the end is how an unsourced figure hides. */}
              {Object.entries(COMPETITOR_ASSUMPTIONS).map(([id, data]) => (
                <p key={id}>
                  <strong className="text-slate-300 capitalize">{id}:</strong>{' '}
                  {getLocalizedCompetitorNote(uiLocale, data.notes)}
                  <span className="text-slate-500">
                    {' '}
                    ({getLocalizedCompetitorSource(uiLocale, data.source)} · {data.lastVerified})
                  </span>
                </p>
              ))}
              <p className="text-amber-500/70 mt-3 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                {copy.competitorPricingMayVary}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Competitors Sundae undercuts on recurring cost */}
      {cheaper.length > 0 && (
        <div className="space-y-3 mb-4">
          {cheaper.map((comparison) => (
            <ComparisonCard
              key={comparison.competitor.id}
              comparison={comparison}
              isExpanded={expandedCompetitor === comparison.competitor.id}
              onToggle={() => setExpandedCompetitor(
                expandedCompetitor === comparison.competitor.id ? null : comparison.competitor.id
              )}
              isBest={comparison === bestSavings}
              locale={uiLocale}
              copy={copy}
              money={money}
            />
          ))}
        </div>
      )}

      {/* Best savings highlight */}
      {bestSavings && (
        <div className="mb-4 p-4 bg-gradient-to-r from-green-900/30 to-emerald-900/30 border border-green-500/30 rounded-lg">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-green-400 font-medium">{copy.bestSavingsOpportunity}</div>
              <div className="text-sm text-slate-400">
                {formatMessage(copy.vsName, { name: bestSavings.competitor.name })}
              </div>
            </div>
            <div className="text-right">
              <div className="font-display text-2xl font-bold text-green-400 tabular-nums">
                {money(comparisonAmount(bestSavings))}
              </div>
              <div className="text-xs text-slate-400">
                {bestSavings.savings.firstYearComparable
                  ? copy.firstYearSavings
                  : copy.ongoingAnnualSavings}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Competitors that cost LESS than Sundae. These are expandable too: a
          buyer is entitled to see why a cheaper tool is cheaper, and the answer
          is coverage. Reducing them to a row of chips hid the honest argument
          along with the unflattering number. */}
      {costsMore.length > 0 && (
        <div className="mt-4 space-y-3">
          <div className="text-xs text-slate-500 flex items-center gap-2">
            <AlertTriangle className="w-3 h-3" />
            {copy.notePointSolutions}
          </div>
          {costsMore.map((comparison) => (
            <ComparisonCard
              key={comparison.competitor.id}
              comparison={comparison}
              isExpanded={expandedCompetitor === comparison.competitor.id}
              onToggle={() => setExpandedCompetitor(
                expandedCompetitor === comparison.competitor.id ? null : comparison.competitor.id
              )}
              isBest={false}
              locale={uiLocale}
              copy={copy}
              money={money}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPARISON CARD COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

interface ComparisonCardProps {
  comparison: ComparisonResult;
  isExpanded: boolean;
  onToggle: () => void;
  isBest: boolean;
  locale: PricingUiLocale;
  copy: ReturnType<typeof getCompetitorCompareCopy>;
  money: (amount: number) => string;
}

function ComparisonCard({ comparison, isExpanded, onToggle, isBest, locale, copy, money }: ComparisonCardProps) {
  const competitor = COMPETITOR_PRICING[comparison.competitor.id];
  const { effectiveVerification: badge, lastVerified } = comparison.competitor;
  const cheaperThanSundae = comparisonAmount(comparison) <= 0;

  // Generic label lookup: returns a translation when one exists and the English
  // string otherwise. New labels therefore ship readable and pick up a
  // translation the moment one is added, with no code change.
  const t = (label: string) => getLocalizedCompetitorBreakdownLabel(locale, label);

  const recurringLines = comparison.competitorCost.lines.filter((l) => l.kind === 'recurring');
  const oneTimeLines = comparison.competitorCost.lines.filter((l) => l.kind === 'one_time');
  const linesTotal = comparison.competitorCost.lines.reduce((sum, l) => sum + l.amount, 0);

  return (
    <div
      className={cn(
        'bg-slate-800/50 rounded-lg border transition-all',
        isBest
          ? 'border-green-500/50 ring-1 ring-green-500/20'
          : isExpanded
            ? 'border-amber-500/50'
            : 'border-slate-700 hover:border-slate-600'
      )}
    >
      {/* Main row - always visible */}
      <button
        onClick={onToggle}
        className="w-full p-4 flex items-center justify-between text-left"
        aria-expanded={isExpanded}
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <EmojiIcon emoji={comparison.competitor.icon} className="w-5 h-5 flex-shrink-0" />
          <div className="min-w-0 flex-1">
            <div className="font-medium text-white flex items-start gap-2 flex-wrap">
              <span className="break-words">{formatMessage(copy.vsName, { name: comparison.competitor.name })}</span>
              {isBest && (
                <span className="text-xs bg-green-900/50 text-green-400 px-2 py-0.5 rounded border border-green-500/30 whitespace-nowrap flex-shrink-0">
                  {copy.bestSavings}
                </span>
              )}
              <VerificationBadge level={badge} copy={copy} lastVerified={lastVerified} />
            </div>
            {/* The always-visible line. Two things were wrong with it.
                It was hardcoded English — "covers N of your M domains" — on a
                row every visitor sees, in a product that ships 22 locales. And
                it was a bare count: an inventory, not a reason to buy.
                It now carries the day-one signal, so a buyer who never opens
                the accordion still sees that a build-your-own option answers
                nothing on day one and what the build costs first. */}
            <div className="text-xs text-slate-400 mt-0.5 break-words">
              {getLocalizedCompetitorCategory(locale, comparison.competitor.category)}
              {comparison.coverage.selectedDomains > 0 && (
                <>
                  {' · '}
                  {copy.dayOneLabel}
                  {': '}
                  {formatMessage(copy.dayOneDomains, {
                    count: comparison.coverage.dayOneDomains,
                    total: comparison.coverage.selectedDomains,
                  })}
                  {comparison.coverage.dayOneDomains === 0 &&
                    comparison.coverage.buildBeforeFirstAnswer > 0 && (
                      <>
                        {' '}
                        {formatMessage(copy.buildFirst, {
                          amount: money(comparison.coverage.buildBeforeFirstAnswer),
                        })}
                      </>
                    )}
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 flex-shrink-0">
          <div className="text-right">
            {cheaperThanSundae ? (
              <>
                <div className="text-slate-300 font-bold whitespace-nowrap tabular-nums">
                  {money(Math.abs(comparisonAmount(comparison)))}
                </div>
                <div className="text-xs text-slate-400 whitespace-nowrap">{copy.cheaperPerYear}</div>
              </>
            ) : (
              <>
                <div className="text-green-400 font-bold whitespace-nowrap">
                  {formatMessage(copy.saveVsCompetitor, {
                    amount: Math.round(comparisonAmount(comparison)).toLocaleString(locale),
                  })}
                </div>
                <div className="text-xs text-slate-400 whitespace-nowrap">
                  {copy.ongoingAnnualSavings}
                </div>
              </>
            )}
          </div>
          <ChevronDown
            className={cn(
              'w-5 h-5 text-slate-400 transition-transform flex-shrink-0',
              isExpanded && 'rotate-180'
            )}
          />
        </div>
      </button>

      {/* Expanded details */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-2 border-t border-slate-700/50">
              {/* Cost breakdown. EVERY line renders and the lines are totalled
                  on screen. The Power BI card used to print $88,600 above three
                  lines summing to $53,600 because the fourth was sliced away. */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="bg-slate-900/50 rounded-lg p-3">
                  <div className="text-xs text-slate-500 mb-1">
                    {comparison.competitor.name} · {t('Annual recurring')}
                  </div>
                  <div className="text-lg font-bold text-white tabular-nums">
                    {money(comparison.competitorCost.ongoing)}
                  </div>
                  <div className="mt-2 space-y-1.5 text-xs text-slate-400">
                    {recurringLines.map((line) => (
                      <div key={line.label}>
                        <div className="flex justify-between gap-2">
                          <span>{t(line.label)}</span>
                          <span className="tabular-nums">{money(line.amount)}</span>
                        </div>
                        <div className="text-[10px] text-slate-500 leading-snug">
                          {line.verification === 'verified' ? '✓ ' : '~ '}
                          {line.source}
                        </div>
                      </div>
                    ))}
                  </div>
                  {oneTimeLines.length > 0 && (
                    <div className="mt-3 pt-2 border-t border-slate-700/60 space-y-1.5 text-xs text-slate-400">
                      <div className="text-[10px] uppercase tracking-wider text-slate-500">
                        {t('One-time')}
                      </div>
                      {oneTimeLines.map((line) => (
                        <div key={line.label}>
                          <div className="flex justify-between gap-2">
                            <span>{t(line.label)}</span>
                            <span className="tabular-nums">{money(line.amount)}</span>
                          </div>
                          <div className="text-[10px] text-slate-500 leading-snug">
                            {line.verification === 'verified' ? '✓ ' : '~ '}
                            {line.source}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="mt-3 pt-2 border-t border-slate-700 flex justify-between text-xs font-medium text-slate-200">
                    <span>{t('Total, first 12 months')}</span>
                    <span className="tabular-nums">{money(linesTotal)}</span>
                  </div>
                </div>

                <div className="bg-amber-900/20 rounded-lg p-3 border border-amber-500/20">
                  <div className="text-xs text-slate-500 mb-1">Sundae · {t('Annual recurring')}</div>
                  <div className="text-lg font-bold text-amber-400 tabular-nums">
                    {money(comparison.sundaeCost.annual)}
                  </div>
                  <div className="mt-2 space-y-1.5 text-xs text-slate-400">
                    <div className="flex justify-between gap-2">
                      <span>{t('Core rail')}</span>
                      <span className="tabular-nums">{money(comparison.sundaeCost.coreMonthly * 12)}</span>
                    </div>
                    {comparison.sundaeCost.crewMonthly > 0 && (
                      <div className="flex justify-between gap-2">
                        <span>{t('Crew rail')}</span>
                        <span className="tabular-nums">{money(comparison.sundaeCost.crewMonthly * 12)}</span>
                      </div>
                    )}
                  </div>
                  {/* This box used to read "No setup fees" directly beneath an
                      investment summary saying "Implementation: Scoped at
                      contract". One of the two was false; it was this one. */}
                  <div className="mt-3 pt-2 border-t border-amber-500/20 text-xs text-slate-400">
                    <div className="flex justify-between gap-2">
                      <span>{t('Implementation')}</span>
                      <span className="tabular-nums">
                        {comparison.sundaeCost.implementationScoped
                          ? t('Scoped at contract')
                          : comparison.sundaeCost.implementationFee === 0
                            ? t('Self-service · $0')
                            : `${comparison.sundaeCost.implementationIsFloor ? 'from ' : ''}${money(comparison.sundaeCost.implementationFee)}`}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-500 leading-snug mt-1">
                      {comparison.sundaeCost.implementationScoped
                        ? 'Charged once at the highest class in your selection. Not yet a number, so it is excluded from the comparison — as is every competitor setup fee.'
                        : 'Charged once at the highest class in your selection, never summed per module.'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Honest headline restatement */}
              <div className="text-xs mb-3 flex justify-between gap-2 rounded bg-slate-900/40 px-3 py-2">
                <span className="text-slate-400">
                  {cheaperThanSundae
                    ? formatMessage(copy.competitorCostsLess, { name: comparison.competitor.name })
                    : copy.ongoingAnnualSavings}
                </span>
                <span
                  className={cn(
                    'font-medium tabular-nums',
                    cheaperThanSundae ? 'text-slate-300' : 'text-green-400',
                  )}
                >
                  {cheaperThanSundae ? '-' : ''}
                  {money(Math.abs(comparisonAmount(comparison)))}
                </span>
              </div>

              {/* The value rail.
                  Price alone cannot carry this comparison — above roughly 25
                  locations several rivals are genuinely cheaper and no honest
                  line changes that. What the card never said is what the buyer
                  GETS: day-one coverage, the build that precedes it, and the
                  capabilities the vendor cannot sell at any price. Every figure
                  here is derived from data already on the comparison; the
                  capability claims are hand-written and each carries a basis. */}
              <div className="text-xs mb-3 rounded bg-slate-900/40 px-3 py-2 space-y-2">
                <div className="flex justify-between gap-2">
                  <span className="text-slate-400">{copy.dayOneLabel}</span>
                  <span className="font-medium tabular-nums text-slate-300">
                    {formatMessage(copy.dayOneDomains, {
                      count: comparison.coverage.dayOneDomains,
                      total: comparison.coverage.selectedDomains,
                    })}
                    {comparison.coverage.dayOneDomains === 0 &&
                      comparison.coverage.buildBeforeFirstAnswer > 0 && (
                        <span className="text-slate-500">
                          {' '}
                          {formatMessage(copy.buildFirst, {
                            amount: money(comparison.coverage.buildBeforeFirstAnswer),
                          })}
                        </span>
                      )}
                  </span>
                </div>

                {comparison.cannotDoAtAnyPrice.length > 0 && (
                  <div>
                    <div className="text-slate-400 mb-1">
                      {formatMessage(copy.cannotBuyLabel, {
                        name: comparison.competitor.name,
                      })}
                    </div>
                    <ul className="space-y-1">
                      {comparison.cannotDoAtAnyPrice.map((gap) => (
                        <li key={gap.claim} className="text-slate-300">
                          <span className="text-slate-500">- </span>
                          <span title={gap.basis}>{gap.claim}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Notes */}
              {comparison.notes && (
                <div className="flex items-start gap-2 text-xs text-amber-400 bg-amber-900/10 rounded p-2 mb-3">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{getLocalizedCompetitorNote(locale, comparison.notes)}</span>
                </div>
              )}

              {/* What the buyer's own package covers that this vendor does not.
                  Named domains, not a count — the argument against a cheaper
                  point solution is coverage, and it has to be checkable. */}
              {comparison.coverage.missing.length > 0 && (
                <div className="mb-3">
                  <div className="text-xs text-slate-500 mb-2">
                    {formatMessage(copy.missingOffer, { name: comparison.competitor.name })}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {comparison.coverage.missing.map((domainId) => (
                      <span
                        key={domainId}
                        className="text-xs bg-slate-800 text-slate-400 px-2 py-1 rounded flex items-center gap-1"
                      >
                        <X className="w-3 h-3 text-red-400" />
                        {coreDomainModules[domainId as keyof typeof coreDomainModules]?.name ?? domainId}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Qualitative limitations */}
              <div className="flex flex-wrap gap-1">
                {comparison.limitations.map((limitation) => (
                  <span
                    key={limitation}
                    className="text-[10px] bg-slate-800/60 text-slate-500 px-2 py-0.5 rounded"
                  >
                    {getLocalizedCompetitorLimitation(locale, limitation)}
                  </span>
                ))}
              </div>

              {/* Pricing source */}
              {competitor?.sourceUrl && (
                <div className="text-xs text-slate-500 mt-3">
                  <a
                    href={competitor.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-slate-400 underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {formatMessage(copy.viewPricing, { name: comparison.competitor.name })}
                  </a>
                  {lastVerified && (
                    <span className="ml-2 text-slate-600">last read {lastVerified}</span>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// VERIFICATION BADGE COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

interface VerificationBadgeProps {
  level: 'verified' | 'estimated' | 'unverified';
  copy: ReturnType<typeof getCompetitorCompareCopy>;
  lastVerified: string | null;
}

function VerificationBadge({ level, copy, lastVerified }: VerificationBadgeProps) {
  const config = {
    verified: {
      icon: CheckCircle,
      className: 'bg-green-900/30 text-green-400 border-green-500/30',
      label: copy.verified
    },
    estimated: {
      icon: AlertCircle,
      className: 'bg-amber-900/30 text-amber-400 border-amber-500/30',
      label: copy.estimated
    },
    unverified: {
      icon: AlertTriangle,
      className: 'bg-red-900/30 text-red-400 border-red-500/30',
      label: copy.unverified
    }
  }[level];

  const Icon = config.icon;
  const age = verificationAgeDays(lastVerified);
  // A green badge asserts the figure is CURRENT, so it has to show what that
  // claim rests on. Past the freshness window the level has already decayed to
  // "estimated"; the title says why.
  const title = lastVerified
    ? `Read from the vendor pricing page on ${lastVerified}` +
      (age !== null && age > VERIFICATION_FRESHNESS_DAYS
        ? ` — ${age} days ago, past the ${VERIFICATION_FRESHNESS_DAYS}-day freshness window, so it is shown as an estimate`
        : '')
    : 'No dated first-party price check on file';

  return (
    <span
      title={title}
      className={cn(
        'text-xs px-2 py-0.5 rounded border flex items-center gap-1',
        config.className
      )}
    >
      <Icon className="w-3 h-3" />
      {config.label}
      {lastVerified && <span className="opacity-70">· {lastVerified}</span>}
    </span>
  );
}
