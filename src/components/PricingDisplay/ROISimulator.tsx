// ROI calculator component with dynamic module-based savings

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  type LucideIcon,
  TrendingUp,
  Clock,
  ChevronRight,
  ChevronLeft,
  Users,
  Package,
  Megaphone,
  ShoppingCart,
  CalendarDays,
  DollarSign,
  Shield,
  Bike,
  Star,
  Info,
  AlertCircle,
} from 'lucide-react';
import { useConfiguration } from '../../hooks/useConfiguration';
import { usePriceCalculation } from '../../hooks/usePriceCalculation';
import { resolveImplementationClass } from '../../lib/discoveryEngine';
import {
  useROICalculation,
  generateROIDescription,
  getTopSavingsCategories,
  clampMonthlyRevenue,
  MIN_MONTHLY_REVENUE_PER_LOCATION,
  MAX_MONTHLY_REVENUE_PER_LOCATION,
  REVENUE_SLIDER_STEP,
} from '../../hooks/useROICalculation';
import type { SavingsLineItem } from '../../hooks/useROICalculation';
import { cn } from '../../utils/cn';
import { useLocale } from '../../contexts/LocaleContext';
import { tMicro } from '../../lib/pricingI18n';
import {
  formatMessage,
  getRoiCopy,
  type PricingUiLocale,
} from '../../lib/pricingUiCopy';
import { stepIndex } from '../../lib/journey';
import { computeCrewQuote } from '../../lib/crewPricing';
import { corePackages } from '../../data/pricing';
import { getQuoteSummaryCopy } from '../../lib/quoteSummaryCopy';

const ICON_MAP: Record<string, LucideIcon> = {
  Users,
  Package,
  Megaphone,
  ShoppingCart,
  CalendarDays,
  DollarSign,
  Shield,
  Bike,
  Star,
};

export function ROISimulator() {
  const { locale } = useLocale();
  const copy = getRoiCopy(locale as PricingUiLocale);
  const {
    layer,
    corePackage,
    locations,
    addOns,
    watchtowerModules,
    roiInputs,
    setROIInputs,
    setCurrentStep,
    crewSkus: selectedCrewSkus,
    techStack,
    operatingModels,
  } = useConfiguration();

  const q = getQuoteSummaryCopy(locale);
  const [hoveredTooltip, setHoveredTooltip] = useState<string | null>(null);

  const pricing = usePriceCalculation(layer, corePackage, locations, addOns, watchtowerModules);
  // The ROI denominator must contain exactly what the numerator credits.
  //
  // `pricing.total` carries the add-ons, Watchtower and Cross-Intelligence, and
  // `SAVINGS_ASSUMPTIONS` has a rate for none of them — nine domain rates, and
  // nothing for Watchtower, Foresight & Action or any concept SKU. So every
  // incremental purchase entered the model as pure cost against zero benefit
  // and mechanically LOWERED the return: a Core Performance single site at
  // $100k/month went from +$378/mo net to -$521/mo simply by ticking Watchtower
  // Complete, and the verdict flipped to "does not pay for itself". The
  // configurator was arguing against its own upsell.
  //
  // Charging something in the denominator while refusing it a numerator is an
  // arithmetic error, not conservatism. The two honest repairs are to give each
  // rail a reasoned savings line or to model the return on the rail we can
  // actually evidence. An evidence review rejected five separate attempts to
  // raise or invent savings rates, so inventing one for Watchtower is not
  // available — the ROI is modelled on the Core package, and the screen says so
  // and names what it left out. The full monthly investment is still totalled on
  // the quote summary.
  const corePricing = usePriceCalculation(layer, corePackage, locations, [], []);
  // Identical resolution order to ConfigSummary and CompactCompetitorCompare:
  // the discovery answers override the per-SKU classes when the visitor told us
  // what they run. A blank is honest when they skipped it; an invented fee is
  // not.
  const stackEstimate = useMemo(
    () =>
      techStack.length > 0
        ? resolveImplementationClass(techStack, operatingModels, {
            crewPayrollSelected: selectedCrewSkus.includes('crew_payroll'),
          })
        : null,
    [techStack, operatingModels, selectedCrewSkus],
  );
  // Credit ONLY the domains the selected package actually grants.
  //
  // This passed all eleven regardless of package, on the belief that every Core
  // package shipped every domain. Price book v1.7 section 3.1 grants four to
  // Foundation, six to Margin and eight to Growth — so a Foundation buyer was
  // shown savings from inventory, purchasing, marketing, reservations and guest
  // domains their package does not include, overstating the case by roughly ten
  // times ($234,400/mo credited against $24,000 earned at eight locations).
  const activeDomains = (corePackages[corePackage]?.includesDomainModules ??
    []) as readonly string[];
  // Crew is a separate rail with its own unit economics, but it is a real cost
  // on the combined pathway and the ROI model must carry it.
  const crewMonthly =
    layer === 'both' && selectedCrewSkus.length > 0
      ? computeCrewQuote(selectedCrewSkus, locations).monthly
      : 0;

  // What the model charges, and what it deliberately does not.
  const coreOnlyMonthly = corePricing.total;
  const excludedFromRoi = Math.max(0, pricing.total + crewMonthly - coreOnlyMonthly);

  const roi = useROICalculation(
    {
      // ROI models the Core decision layer; 'both' contributes its Core side.
      layer: layer === 'core' || layer === 'both' ? 'core' : null,
      corePackage,
      locations,
      activeDomains: [...activeDomains],
      watchtowerModules,
    },
    roiInputs,
    // The Core rail alone, priced under the same discount rules.
    //
    // This previously read `pricing.total + crewMonthly`, added so the combined
    // pathway did not understate monthly cost. That fixed a real understatement
    // but produced the mirror error: Crew has no savings line either, so the
    // combined quote charged two rails against one rail's benefit. Matching the
    // scope on BOTH sides is the repair that is right in both directions, and
    // the excluded spend is named on screen rather than dropped quietly.
    coreOnlyMonthly,
    // And payback must clear the one-time implementation the quote charges.
    //
    // This read `pricing.implementation` alone, which collects the class of each
    // selected SKU — and every Core package publishes `implementationClass:
    // null`. One null forces `requiresScoping`, so the fee resolved to 0 on
    // EVERY Core quote, payback fell to the 14-day floor, and the tile printed
    // "14 days" on 100% of paying configurations: the same answer for a
    // $1,195/mo single site and a $78,576/mo hundred-site estate.
    //
    // The buyer has usually already told us. The discovery step asks which
    // systems they run and `resolveImplementationClass` grades that into a real
    // class — the same resolution ConfigSummary and the competitor card use to
    // quote the fee. Payback now clears the fee we actually quote. When the
    // systems question was skipped there is genuinely nothing to charge, and it
    // stays scoped at contract.
    stackEstimate
      ? stackEstimate.fee
      : pricing.implementation.requiresScoping
        ? 0
        : pricing.implementation.fee,
  );

  // The configuration store is persisted, so a visitor who set $50,000 before
  // the floor moved would otherwise keep modelling a figure the slider can no
  // longer express — and the ROI beneath it would not match the track.
  const revenueForSlider = clampMonthlyRevenue(roiInputs.monthlyRevenue);
  const revenueTrackPct =
    ((revenueForSlider - MIN_MONTHLY_REVENUE_PER_LOCATION) /
      (MAX_MONTHLY_REVENUE_PER_LOCATION - MIN_MONTHLY_REVENUE_PER_LOCATION)) *
    100;

  useEffect(() => {
    if (roiInputs.monthlyRevenue !== revenueForSlider) {
      setROIInputs({ monthlyRevenue: revenueForSlider });
    }
  }, [roiInputs.monthlyRevenue, revenueForSlider, setROIInputs]);

  const handleInputChange = (field: keyof typeof roiInputs, value: number | boolean) => {
    setROIInputs({ [field]: value });
  };

  const handleContinue = () => {
    setCurrentStep(stepIndex('summary'));
  };

  const handleBack = () => {
    setCurrentStep(stepIndex('watchtower'));
  };

  // Per-location helper + small locale labels (localized across all 22 locales via tMicro).
  const perLoc = (n: number) => (locations > 0 ? Math.round(n / locations) : n);
  const backLabel = tMicro(locale, 'back');
  const perLocationLabel = tMicro(locale, 'perLocation');
  const totalLabel = tMicro(locale, 'total');

  const topCategories = getTopSavingsCategories(roi.savingsLines);
  const hasMarketingModule = activeDomains.includes('marketing');
  const hasDeliveryModule = activeDomains.includes('delivery');
  const hasGuestModule = activeDomains.includes('guest');

  return (
    <div className="max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl font-bold mb-4">{copy.title}</h1>
        <p className="text-xl text-sundae-muted">{copy.subtitle}</p>
      </motion.div>

      {/* The model has no published evidence behind its rates. The defensible

          posture is not to invent a source but to stop presenting a planning

          model as a measurement — and to show the basis on every line. */}

      <div className="mb-6 rounded-xl border border-[#E9A24A]/40 bg-[#E9A24A]/10 p-4">

        <p className="text-sm font-semibold text-[#E9A24A]">{q.modelledHeading}</p>

        <p className="mt-1 text-xs text-sundae-muted">{q.modelledNote}</p>

      </div>


      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-sundae-surface rounded-xl p-8 mb-8"
      >
        <h3 className="text-lg font-bold mb-6">{copy.businessTitle}</h3>

        <div className="space-y-8">
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-medium">{copy.monthlyRevenuePerLocation}</label>
              <span className="text-lg font-bold tabular-nums">
                ${revenueForSlider.toLocaleString(locale)}
              </span>
            </div>
            <input
              aria-label={copy.monthlyRevenuePerLocation}
              type="range"
              min={MIN_MONTHLY_REVENUE_PER_LOCATION}
              max={MAX_MONTHLY_REVENUE_PER_LOCATION}
              step={REVENUE_SLIDER_STEP}
              value={revenueForSlider}
              onChange={(e) => handleInputChange('monthlyRevenue', parseInt(e.target.value))}
              className="touch-slider w-full cursor-pointer"
              style={{
                ['--track' as string]: `linear-gradient(to right, #FF5C4D 0%, #FF5C4D ${revenueTrackPct}%, #2A231C ${revenueTrackPct}%, #2A231C 100%)`,
              }}
            />
          </div>

          <div className="pt-6 border-t border-white/10">
            <h4 className="font-semibold mb-1">Cost avoidance (optional)</h4>
            <p className="text-xs text-sundae-muted mb-4">
              Use only costs you can validate. Replaceable system spend is counted in the funding
              case; time capacity is disclosed separately and never treated as automatic cash.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <label className="text-sm">
                <span className="block text-sundae-muted mb-2">Replaceable tools / month</span>
                <input
                  aria-label="Replaceable tools per month"
                  type="number"
                  min="0"
                  step="100"
                  value={roiInputs.replaceableSystemsSpend || 0}
                  onChange={(e) => handleInputChange('replaceableSystemsSpend', Math.max(0, Number(e.target.value)))}
                  className="w-full rounded-lg border border-white/10 bg-sundae-dark px-3 py-2 tabular-nums"
                />
              </label>
              <label className="text-sm">
                <span className="block text-sundae-muted mb-2">Manual reporting hours / week</span>
                <input
                  aria-label="Manual reporting hours per week"
                  type="number"
                  min="0"
                  step="1"
                  value={roiInputs.manualReportingHoursPerWeek || 0}
                  onChange={(e) => handleInputChange('manualReportingHoursPerWeek', Math.max(0, Number(e.target.value)))}
                  className="w-full rounded-lg border border-white/10 bg-sundae-dark px-3 py-2 tabular-nums"
                />
              </label>
              <label className="text-sm">
                <span className="block text-sundae-muted mb-2">Loaded hourly cost</span>
                <input
                  aria-label="Loaded hourly cost"
                  type="number"
                  min="0"
                  step="5"
                  value={roiInputs.loadedHourlyRate || 0}
                  onChange={(e) => handleInputChange('loadedHourlyRate', Math.max(0, Number(e.target.value)))}
                  className="w-full rounded-lg border border-white/10 bg-sundae-dark px-3 py-2 tabular-nums"
                />
              </label>
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-medium">{copy.currentLaborCost}</label>
              <span className="text-lg font-bold tabular-nums">{roiInputs.laborPercent}%</span>
            </div>
            <input
              aria-label={copy.currentLaborCost}
              type="range"
              min="20"
              max="40"
              value={roiInputs.laborPercent}
              onChange={(e) => handleInputChange('laborPercent', parseInt(e.target.value))}
              className="touch-slider w-full cursor-pointer"
              style={{
                ['--track' as string]: `linear-gradient(to right, #FF5C4D 0%, #FF5C4D ${((roiInputs.laborPercent - 20) / 20) * 100}%, #2A231C ${((roiInputs.laborPercent - 20) / 20) * 100}%, #2A231C 100%)`,
              }}
            />
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-medium">{copy.currentFoodCost}</label>
              <span className="text-lg font-bold tabular-nums">{roiInputs.foodCostPercent}%</span>
            </div>
            <input
              aria-label={copy.currentFoodCost}
              type="range"
              min="20"
              max="40"
              value={roiInputs.foodCostPercent}
              onChange={(e) => handleInputChange('foodCostPercent', parseInt(e.target.value))}
              className="touch-slider w-full cursor-pointer"
              style={{
                ['--track' as string]: `linear-gradient(to right, #FF5C4D 0%, #FF5C4D ${((roiInputs.foodCostPercent - 20) / 20) * 100}%, #2A231C ${((roiInputs.foodCostPercent - 20) / 20) * 100}%, #2A231C 100%)`,
              }}
            />
          </div>

          {hasMarketingModule && (
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm font-medium">{copy.monthlyMarketingSpend}</label>
                <span className="text-lg font-bold tabular-nums">
                  ${(roiInputs.marketingSpend || 0).toLocaleString(locale)}
                </span>
              </div>
              <input
                aria-label={copy.monthlyMarketingSpend}
              type="range"
                min="0"
                max="10000"
                step="500"
                value={roiInputs.marketingSpend || 0}
                onChange={(e) => handleInputChange('marketingSpend', parseInt(e.target.value))}
                className="touch-slider w-full cursor-pointer"
                style={{
                  ['--track' as string]: `linear-gradient(to right, #FF5C4D 0%, #FF5C4D ${((roiInputs.marketingSpend || 0) / 10000) * 100}%, #2A231C ${((roiInputs.marketingSpend || 0) / 10000) * 100}%, #2A231C 100%)`,
                }}
              />
              {(roiInputs.marketingSpend || 0) === 0 && (
                <p className="text-xs text-amber-400 mt-2 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {copy.addMarketingSpend}
                </p>
              )}
            </div>
          )}

          {hasDeliveryModule && (
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm font-medium">{copy.deliveryRevenuePct}</label>
                <span className="text-lg font-bold tabular-nums">{roiInputs.deliveryRevenuePct || 0}%</span>
              </div>
              <input
                aria-label={copy.deliveryRevenuePct}
              type="range"
                min="0"
                max="50"
                step="5"
                value={roiInputs.deliveryRevenuePct || 0}
                onChange={(e) => handleInputChange('deliveryRevenuePct', parseInt(e.target.value))}
                className="touch-slider w-full cursor-pointer"
                style={{
                  ['--track' as string]: `linear-gradient(to right, #FF5C4D 0%, #FF5C4D ${((roiInputs.deliveryRevenuePct || 0) / 50) * 100}%, #2A231C ${((roiInputs.deliveryRevenuePct || 0) / 50) * 100}%, #2A231C 100%)`,
                }}
              />
              {(roiInputs.deliveryRevenuePct || 0) === 0 && (
                <p className="text-xs text-amber-400 mt-2 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {copy.addDeliveryMix}
                </p>
              )}
            </div>
          )}

          {hasGuestModule && (
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">{copy.reviewData}</label>
              <button
                onClick={() => handleInputChange('hasReviewData', !roiInputs.hasReviewData)}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  roiInputs.hasReviewData
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                    : 'bg-sundae-surface-hover text-sundae-muted border border-white/10'
                )}
              >
                {roiInputs.hasReviewData ? copy.yes : copy.no}
              </button>
            </div>
          )}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-xl p-8 border border-green-500/30 mb-8"
      >
        <h3 className="text-lg font-bold mb-6">{copy.projectedReturns}</h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <div>
            <div className="text-sm text-sundae-muted mb-1">Monthly funding case</div>
            <div className="font-display text-3xl font-bold text-green-400">
              ${roi.monthlyFunding.toLocaleString(locale)}
            </div>
            {locations > 1 && (
              <div className="text-xs text-sundae-muted mt-1">
                ${perLoc(roi.monthlyFunding).toLocaleString(locale)} {perLocationLabel}
              </div>
            )}
          </div>
          <div>
            <div className="text-sm text-sundae-muted mb-1">Annual funding case</div>
            <div className="font-display text-3xl font-bold text-green-400">
              ${roi.annualFunding.toLocaleString(locale)}
            </div>
            {locations > 1 && (
              <div className="text-xs text-sundae-muted mt-1">
                ${perLoc(roi.annualFunding).toLocaleString(locale)} {perLocationLabel}
              </div>
            )}
          </div>
          <div>
            <div className="text-sm text-sundae-muted mb-1">{copy.roiMultiple}</div>
            {/* Show the cap as a floor. Printing a bare "15x" for every strong
                configuration made the headline read as a constant rather than a
                result, and hid the difference between packages. */}
            <div className="font-display text-3xl font-bold text-green-400">
              {roi.roi}x{roi.roiCapped ? '+' : ''}
            </div>
          </div>
          <div>
            <div className="text-sm text-sundae-muted mb-1">{copy.paybackPeriod}</div>
            {/* A model that can only ever say "yes" is a brochure. When the
                monthly saving does not overtake the monthly cost, say so. */}
            <div
              className={`font-display text-3xl font-bold ${roi.paysBack ? 'text-green-400' : 'text-sundae-muted'}`}
            >
              {roi.paysBack
                ? formatMessage(copy.days, { count: roi.paybackDays })
                : copy.noPaybackAtTheseInputs ?? 'Not at these inputs'}
            </div>
          </div>
        </div>

        <div className="p-4 bg-sundae-dark/30 rounded-lg">
          <p className="text-center text-lg">
            {generateROIDescription(roi, locale as PricingUiLocale)}
          </p>
        </div>

        {/* Naming the excluded spend is what makes modelling the Core rail
            alone honest rather than flattering. Without this line the return
            would simply look better for reasons the buyer cannot see. */}
        {excludedFromRoi > 0 && (
          <p className="mt-3 text-xs text-sundae-muted text-center">
            {formatMessage(copy.roiBasisNote, {
              excluded: `$${Math.round(excludedFromRoi).toLocaleString(locale)}`,
            })}
          </p>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="mb-8 border-y border-white/10 py-6"
      >
        <h3 className="text-lg font-bold mb-4">What can fund Sundae</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <div className="text-xs uppercase tracking-wide text-sundae-muted">Profit recovery</div>
            <div className="mt-1 text-2xl font-bold text-green-400 tabular-nums">
              ${roi.monthlySavings.toLocaleString(locale)}/mo
            </div>
            <p className="mt-1 text-xs text-sundae-muted">Only recovery producers granted by this Core package.</p>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wide text-sundae-muted">Cash cost avoidance</div>
            <div className="mt-1 text-2xl font-bold tabular-nums">
              ${roi.replaceableSystemsSavings.toLocaleString(locale)}/mo
            </div>
            <p className="mt-1 text-xs text-sundae-muted">Buyer-entered spend expected to be retired.</p>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wide text-sundae-muted">Redeployable capacity</div>
            <div className="mt-1 text-2xl font-bold tabular-nums">
              ${roi.capacityValue.toLocaleString(locale)}/mo
            </div>
            <p className="mt-1 text-xs text-sundae-muted">
              {roi.capacityFte.toLocaleString(locale)} FTE-equivalent; shown separately, not counted as cash.
            </p>
          </div>
        </div>
      </motion.div>

      {roi.savingsLines.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-sundae-surface rounded-xl p-8 mb-8"
        >
          <h3 className="text-lg font-bold mb-4">{copy.savingsBreakdown}</h3>

          {/* Two-column header: per-location vs total-across-all-locations */}
          <div className="flex items-baseline justify-end gap-4 mb-3 pr-0.5">
            <span className="w-20 sm:w-24 text-right text-[11px] font-semibold uppercase tracking-wide text-sundae-muted">{perLocationLabel}</span>
            <span className="w-24 sm:w-28 text-right text-[11px] font-semibold uppercase tracking-wide text-sundae-muted">{totalLabel}</span>
          </div>
          <div className="space-y-4">
            {roi.savingsLines.map((line) => (
              <SavingsLineRow
                key={line.moduleId}
                line={line}
                totalSavings={roi.monthlySavings}
                locations={locations}
                isHovered={hoveredTooltip === line.moduleId}
                onHover={(id) => setHoveredTooltip(id)}
                locale={locale as PricingUiLocale}
                copy={copy}
              />
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-white/10">
            <p className="text-xs text-sundae-muted flex items-start gap-2">
              <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
              {copy.savingsNote}
            </p>
          </div>
        </motion.div>
      )}

      {topCategories.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8 p-6 bg-gradient-to-r from-sundae-accent/10 to-[#FF5C4D]/10 rounded-lg border border-sundae-accent/30"
        >
          <div className="flex items-start gap-3">
            <TrendingUp className="w-6 h-6 text-sundae-accent mt-0.5" />
            <div>
              <h4 className="font-semibold mb-2">{copy.biggestWins}</h4>
              <p className="text-sm text-sundae-muted">
                {formatMessage(copy.biggestWinsBody, { categories: topCategories.join(', ') })}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
        className="bg-sundae-surface rounded-xl p-8 mb-8"
      >
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <div className="text-sm text-sundae-muted mb-1">{copy.monthlyPlatformCost}</div>
            <div className="font-display text-2xl font-bold">${pricing.total.toLocaleString(locale)}</div>
          </div>
          <div className="text-center px-8">
            <Clock className="w-8 h-8 mx-auto mb-2 text-sundae-accent" />
            <div className="text-sm text-sundae-muted">{copy.paysForItselfIn}</div>
            <div
              className={`font-display text-xl font-bold ${roi.paysBack ? 'text-green-400' : 'text-sundae-muted'}`}
            >
              {roi.paysBack
                ? formatMessage(copy.days, { count: roi.paybackDays })
                : copy.noPaybackAtTheseInputs ?? 'Not at these inputs'}
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-sundae-muted mb-1">{copy.netMonthlyBenefit}</div>
            <div
              className={cn(
                'text-2xl font-bold',
                roi.monthlyFunding - pricing.total > 0 ? 'text-green-400' : 'text-sundae-muted'
              )}
            >
              {roi.monthlyFunding - pricing.total > 0 ? '+' : ''}
              ${(roi.monthlyFunding - pricing.total).toLocaleString(locale)}
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="flex flex-col sm:flex-row items-center justify-center gap-4"
      >
        <button
          onClick={handleBack}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-sundae-surface hover:bg-sundae-surface-hover border border-white/10 hover:border-white/20 transition-colors font-semibold"
        >
          <ChevronLeft className="w-5 h-5" />
          {backLabel}
        </button>
        <button
          onClick={handleContinue}
          className="button-primary inline-flex items-center gap-2"
        >
          <span>{copy.viewSummary}</span>
          <ChevronRight className="w-5 h-5" />
        </button>
      </motion.div>
    </div>
  );
}

function SavingsLineRow({
  line,
  totalSavings,
  locations,
  isHovered,
  onHover,
  locale,
  copy,
}: {
  line: SavingsLineItem;
  totalSavings: number;
  locations: number;
  isHovered: boolean;
  onHover: (id: string | null) => void;
  locale: PricingUiLocale;
  copy: ReturnType<typeof getRoiCopy>;
}) {
  const IconComponent = ICON_MAP[line.icon] || DollarSign;
  const percentage = totalSavings > 0 ? (line.amount / totalSavings) * 100 : 0;
  const showMissing = line.missingInputMessage && !line.isCountedInTotal;

  return (
    <div
      className="relative"
      onMouseEnter={() => onHover(line.moduleId)}
      onMouseLeave={() => onHover(null)}
    >
      <div className="flex justify-between mb-2">
        <span className="text-sm font-medium flex items-center gap-2">
          <IconComponent className="w-4 h-4" />
          {line.label}
          <button className="text-sundae-muted hover:text-white transition-colors">
            <Info className="w-3 h-3" />
          </button>
        </span>
        {showMissing ? (
          <span className="text-sm font-bold text-amber-400">
            <span className="text-xs">{line.missingInputMessage}</span>
          </span>
        ) : (
          <span className="flex items-baseline gap-4 flex-none tabular-nums">
            <span className="w-20 sm:w-24 text-right text-sm text-sundae-muted">
              ${(locations > 0 ? Math.round(line.amount / locations) : line.amount).toLocaleString(locale)}
              {copy.perMonthShort}
            </span>
            <span className="w-24 sm:w-28 text-right text-sm font-bold">
              ${line.amount.toLocaleString(locale)}
              {copy.perMonthShort}
            </span>
          </span>
        )}
      </div>

      {!showMissing && (
        <div className="w-full bg-sundae-surface-hover rounded-full h-2">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(percentage, 100)}%` }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className={cn(
              'h-2 rounded-full',
              line.isCountedInTotal
                ? 'bg-gradient-to-r from-green-400 to-emerald-400'
                : 'bg-gradient-to-r from-amber-400/50 to-yellow-400/50'
            )}
          />
        </div>
      )}

      {!line.isCountedInTotal && line.amount > 0 && !showMissing && (
        <p className="text-xs text-amber-400 mt-1 italic">{copy.potentialUpside}</p>
      )}

      {isHovered && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute z-50 left-0 right-0 top-full mt-2 p-3 bg-sundae-dark border border-white/20 rounded-lg shadow-xl"
        >
          <p className="text-xs text-white mb-2">{line.tooltip}</p>
          <div className="text-xs text-sundae-muted">
            <strong>{copy.rangeLabel}:</strong> ${line.rangeMin.toLocaleString(locale)} - $
            {line.rangeMax.toLocaleString(locale)}
            {copy.perMonthShort}
          </div>
        </motion.div>
      )}
    </div>
  );
}
