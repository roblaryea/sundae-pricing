// Final configuration summary component - Optimized with collapsibles

import { motion, AnimatePresence } from 'framer-motion';
import { Check, Rocket, ChevronDown, Sparkles, Castle, GitBranch, Zap, Calendar, Search, TrendingUp } from 'lucide-react';
import { useConfiguration } from '../../hooks/useConfiguration';
import { usePriceCalculation } from '../../hooks/usePriceCalculation';
import { useROICalculation } from '../../hooks/useROICalculation';
import {
  watchtower,
  getLocalizedTierCatalog,
  corePackages,
  modules as coreDomainModules,
  foresightAction,
  conceptSkus,
  crewSkus,
  billingTerms,
  type BillingCycle,
} from '../../data/pricing';
import confetti from 'canvas-confetti';
import { useEffect, useMemo, useState } from 'react';
import { PDFExportButton } from './PDFExport';
import { EmailQuoteButton } from './EmailQuoteButton';
import { BookDemoButton } from './BookDemoButton';
import { CompactCompetitorCompare } from './CompactCompetitorCompare';
import { WatchtowerValue } from './WatchtowerValue';
import { PricingFAQ } from './PricingFAQ';
import { LEGAL, getMarketingUrl } from '../../config/legal';
import { useLocale } from '../../contexts/LocaleContext';
import { useLivePricingCatalog } from '../../data/livePricing';
import { formatAnnualAmount, getLiveCalculatorCopy, getLocalizedLayerName } from '../../lib/pricingUiCopy';

const WATCHTOWER_ICON_MAP = {
  competitive: Search,
  events: Calendar,
  trends: TrendingUp,
} as const;

/**
 * Render a discount line in the buyer's language.
 *
 * The engine has no locale, so it emits English plus a stable key. Without this
 * the discount lines — the part of the quote a buyer scrutinises hardest —
 * stayed English on an otherwise translated screen.
 */
function localiseDiscount(
  d: DiscountLine,
  q: ReturnType<typeof getQuoteSummaryCopy>,
  locations: number,
): string {
  const pct = `${d.percent}%`;
  switch (d.key) {
    case 'volume':
      return `${q.volumeLabel.replace('{locations}', String(locations))} — ${pct}`;
    case 'term':
      return `${q.commitmentTerm} — ${pct}`;
    case 'earlyAdopter':
      return `${q.earlyAdopter} — ${pct}`;
    case 'volumeNotApplied':
      return q.volumeNotApplied.replace('{percent}', pct);
    case 'termNotApplied':
      return q.termNotApplied.replace('{percent}', pct);
    default:
      return d.name;
  }
}

export function ConfigSummary() {
  const { locale, messages } = useLocale();
  useLivePricingCatalog();
  const {
    layer, corePackage, locations, addOns, watchtowerModules,
    crossIntelligence: crossIntelSelection, markStepCompleted, crewSkus: selectedCrewSkus,
    operatingModels, techStack, billingCycle, setBillingCycle, roiInputs
  } = useConfiguration();

  // The discovery answers resolve the one-time implementation class and the
  // per-object overlays. Both are omitted entirely when the visitor skipped the
  // systems question — a blank is honest, an invented fee is not.
  const stackEstimate = useMemo(
    () =>
      techStack.length > 0
        ? resolveImplementationClass(techStack, operatingModels, {
            crewPayrollSelected: selectedCrewSkus.includes('crew_payroll'),
          })
        : null,
    [techStack, operatingModels, selectedCrewSkus],
  );
  // Overlays follow the SKU on the quote, not the survey answer.
  //
  // Keying off `operatingModels` meant a group that answered "hotel F&B" saw
  // revenue-centre billing whether or not they bought the Hotel pathway, and a
  // group that added a concept without having said so at question two saw
  // none. A CFO put the miss at a plausible $64,800/yr of uncapped,
  // non-discountable recurring spend that never appeared before signature.
  // The quote screen is the artefact a buyer forwards; its most important lines
  // were literal English in JSX, so a German visitor configured in German and
  // then read the number that decides the deal in English.
  const q = getQuoteSummaryCopy(locale);

  const overlays = useMemo(
    () => objectOverlaysForPurchased(addOns as string[]),
    [addOns],
  );


  // The quote now carries a REAL client profile. `billingCycle` was never set
  // by any surface, so the 10% annual and 15% two-year terms — the main lever
  // in any negotiation — were unreachable, and `isFranchise` stayed false even
  // though question two asks exactly that.
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

  const pricing = usePriceCalculation(layer, corePackage, locations, addOns, watchtowerModules, clientProfile, crossIntelSelection);
  void getLocalizedTierCatalog(locale);
  // Layer label is rendered in the Report/Core branch only; coerce Crew to
  // null for the helper signature (Crew branch returns early below).
  const layerLabel = getLocalizedLayerName(locale, layer === 'core' || layer === 'both' ? 'core' : null);
  
  // Collapsible states
  const [whatsIncludedOpen, setWhatsIncludedOpen] = useState(true);
  const [comparisonOpen, setComparisonOpen] = useState(false);
  const [watchtowerOpen, setWatchtowerOpen] = useState(true);
  const [faqOpen, setFaqOpen] = useState(false);

  useEffect(() => {
    // Mark summary as viewed and trigger confetti
    markStepCompleted('summary');
    
    if (!prefersReducedMotion()) confetti({
      particleCount: 200,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#FF5C4D', '#E9A24A', '#FF5C4D', '#22C55E']
    });
  }, [markStepCompleted]);

  // The Core PACKAGE is the thing being summarised. Its "what's included"
  // list must use this package's actual grants, never the global catalogue.
  //
  // The Core rail is present on BOTH the Core-only and the Core+Crew pathways,
  // and gating this on `layer === 'core'` alone meant that ADDING Crew — a
  // strictly larger deal — silently deleted the package name and tagline, the
  // What's-Included list, the AI credit allowance and the Cross-Intelligence
  // line from the quote. The combined pathway printed less product than the
  // Core-only pathway it is a superset of.
  const hasCoreRail = layer === 'core' || layer === 'both';
  const packageDetails = hasCoreRail ? corePackages[corePackage] : null;
  const includedFeatures = packageDetails
    ? packageDetails.includesDomainModules.map((moduleId) => coreDomainModules[moduleId].name)
    : [];
  // Add-ons are the only Core-side line items a buyer actually purchases, so
  // they get their published names. Rendering the raw ids put `foresight_action`
  // and `concept_hotel_fb` on the quote, which reads like an internal key, not
  // a thing anyone agreed to pay for.
  const addOnNames = addOns.map((id) =>
    id === 'foresight_action' ? foresightAction.name : conceptSkus[id].name,
  );

  // Carry the value case to the decision screen. The ROI step previously
  // disappeared entirely at summary, leaving a buyer to decide from price and
  // competitor cards alone after they had just built a funding case.
  // Recalculate against the Core rail only, matching the scope shown on the
  // ROI step: add-ons and Crew are quoted, but earn no unsubstantiated saving.
  const coreOnlyPricing = usePriceCalculation(
    layer,
    corePackage,
    locations,
    [],
    [],
    clientProfile,
    'base',
  );
  const summaryRoi = useROICalculation(
    {
      layer: hasCoreRail ? 'core' : null,
      corePackage,
      locations,
      activeDomains: packageDetails ? [...packageDetails.includesDomainModules] : [],
      watchtowerModules,
    },
    roiInputs,
    coreOnlyPricing.total,
    stackEstimate
      ? stackEstimate.fee
      : pricing.implementation.requiresScoping
        ? 0
        : pricing.implementation.fee,
  );

  // Crew is the parallel operational substrate path — it doesn't use
  // tiers, modules, watchtower, AI credits, or the cross-intelligence
  // engine. Render a dedicated Crew-specific summary that shows the
  // SKU/bundle they picked, the location-driven price, and the BYO-HR
  // strategic note. This branch runs after all hooks so React's rules
  // of hooks are honored.
  if (layer === 'crew') {
    return <CrewSummaryBody selectedSkus={selectedCrewSkus} locations={locations} />;
  }

  // Core + Crew is the most common real deal — decision intelligence on one
  // rail, the operational substrate on the other — and it could not be quoted
  // at all while this branch was an either/or. The two rails are priced
  // separately (they have separate unit economics) and presented together.
  const crewRail =
    layer === 'both' && selectedCrewSkus.length > 0
      ? computeCrewQuote(selectedCrewSkus, locations)
      : null;

  // What the buyer actually pays each month. The headline used to print the
  // Core rail only, while a "Combined monthly" line further down the same card
  // printed a bigger number — two answers to one question, and the prominent
  // one was the wrong one. Crew is a flat price, so it adds to the total but
  // never to a per-location rate.
  const crewMonthly = crewRail?.monthly ?? 0;
  const combinedMonthly = pricing.total + crewMonthly;

  // Anchor relief discounts the FIRST UNIT only, so the schedule needs the
  // anchors split out from everything that scales with locations. Read from the
  // catalogue rather than retyped: a hardcoded anchor here would silently drift
  // from pricing_master the first time a package is repriced.
  const anchorTotal =
    coreAnchor(corePackage) + (crewRail ? crewAnchor(selectedCrewSkus, crewRail.detectedBundleId ?? null) : 0);
  const recurringTotal = Math.max(0, combinedMonthly - anchorTotal);
  // At 250+ units v1.7 publishes no self-serve number, so nothing derived from
  // the total may be printed as if it were a quote.
  const isQuotable = !pricing.requiresEnterpriseQuote && Number.isFinite(combinedMonthly);
  // A term discount takes the total off a round number: 10% of $5,351 is
  // $4,815.90, and the bare locale format printed that as "$4,815.9" — a price
  // one digit short of a cent. Whole figures keep their clean form; fractional
  // ones get both decimal places.
  const money = (amount: number) =>
    `$${amount.toLocaleString(locale, {
      minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
      maximumFractionDigits: 2,
    })}`;
  const crewHeadline = crewRail
    ? crewRail.detectedBundleId || crewRail.lines.length === 1
      ? crewRail.lines[0].label
      : `${crewRail.selectedSkus.length}-SKU Crew stack`
    : null;
  // "Schedule & Time" is the one published name that does not say Crew, and a
  // quote line has to name its rail.
  const crewTitle =
    crewHeadline && !crewHeadline.startsWith('Crew') ? `Crew · ${crewHeadline}` : crewHeadline;
  // A bundle collapses to a single priced line, so the SKUs the buyer actually
  // ticked are the only place the entitlements are still visible.
  const crewSkuNames = crewRail?.selectedSkus.map((id) => crewSkus[id].name) ?? [];

  // Implementation is ONE charge at the highest class in the whole SELECTION,
  // and on this pathway the selection is two rails. The fallback resolved it
  // from the Core rail alone. Both rails land on "scoped at contract" today
  // because v1.7 publishes no class for a Core package or a Crew SKU, so the
  // rendered line is unchanged — this is here so that publishing a class on one
  // rail can never print that rail's fee as if it covered the other one.
  const railImplementation = crewRail
    ? {
        ...resolveImplementationFee([pricing.implementation.classId, crewRail.implementation.classId]),
        requiresScoping:
          pricing.implementation.requiresScoping || crewRail.implementation.requiresScoping,
      }
    : pricing.implementation;

  // `pricing.perLocation` is total ÷ units. Bands are MARGINAL, so no location
  // is ever billed at this figure — it is an average and has to be labelled as
  // one, or it gets quoted back at us as a rate card.
  const avgLabel = getLiveCalculatorCopy(locale).avgPerLocation;
  const locationWord = `${messages.summary.locationLabel}${locations !== 1 ? messages.summary.locationPluralSuffix : ''}`;
  const avgDerivation = `${crewRail ? 'Core rail ' : ''}${money(pricing.total)} ÷ ${locations.toLocaleString(locale)} ${locationWord} — an average, never a per-location rate`;

  return (
    <div className="max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <motion.h1 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
          className="text-4xl md:text-5xl font-bold mb-3 flex items-center justify-center gap-3"
        >
          {messages.summary.stackTitle}
          <Sparkles className="w-10 h-10 text-sundae-accent" />
        </motion.h1>
        <p className="text-lg md:text-xl text-sundae-muted">
          {messages.summary.stackSubtitle}
        </p>
      </motion.div>

      {/* 1. Configuration & Investment Summary */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-br from-sundae-surface to-sundae-surface/50 rounded-xl p-6 md:p-8 mb-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {/* Left side - Configuration */}
          <div>
            <h3 className="text-lg font-bold mb-4">{messages.summary.configurationTitle}</h3>
            
            <div className="space-y-3">
              {/* Layer & Tier */}
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                <div>
                  {/* Every v1.7 package name already starts with its layer, so
                      prefixing the layer label printed "Core Core Growth" on
                      the line that is supposed to name what was bought. */}
                  <div className="font-semibold">
                    {packageDetails?.name?.startsWith(layerLabel)
                      ? packageDetails.name
                      : `${layerLabel} ${packageDetails?.name ?? ''}`.trim()}
                  </div>
                  <div className="text-sm text-sundae-muted">
                    {packageDetails?.tagline}
                  </div>
                </div>
              </div>

              {/* Locations */}
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-semibold">{locations.toLocaleString(locale)} {messages.summary.locationLabel}{locations !== 1 ? messages.summary.locationPluralSuffix : ''}</div>
                  {/* Bands are MARGINAL, so this figure is an AVERAGE (total ÷
                      locations), not a per-location rate card. Label it as one
                      and show the division, so it cannot be read as a rate. */}
                  <div className="text-sm text-sundae-muted">
                    {isQuotable && Number.isFinite(pricing.perLocation)
                      ? `${avgLabel} · $${pricing.perLocation.toLocaleString(locale, { maximumFractionDigits: 0 })}`
                      : messages.summary.customPricing}
                  </div>
                  {isQuotable && Number.isFinite(pricing.perLocation) && (
                    <div className="text-[10px] text-sundae-muted/80">{avgDerivation}</div>
                  )}
                </div>
              </div>

              {/* Modules */}
              {/* Included domain modules — a package component, not a purchase.
                  The quote has to say so outright: elsewhere in the journey the
                  same domain names sit next to prices, and a buyer who reads
                  "modules" as a line item asks to drop the ones they don't want. */}
              {packageDetails && (
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-semibold">
                      {packageDetails.includesDomainModules.length} Core outcome domains included
                    </div>
                    <div className="text-sm text-sundae-muted">
                      {packageDetails.includedOutcome}. Package components have no standalone price.
                    </div>
                  </div>
                </div>
              )}

              {addOns.length > 0 && (
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-semibold">
                      {addOns.length} add-on{addOns.length === 1 ? '' : 's'} · priced separately
                    </div>
                    <div className="text-sm text-sundae-muted">
                      {addOnNames.join(', ')}
                    </div>
                  </div>
                </div>
              )}

              {/* Watchtower */}
              {watchtowerModules.length > 0 && (
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-semibold">{messages.summary.watchtowerTitle}</div>
                    <div className="text-sm text-sundae-muted flex items-center gap-1">
                      {watchtowerModules.includes('bundle') ? (
                        <>
                          <Castle className="w-4 h-4 inline" />
                          <span>{messages.summary.fullBundle}</span>
                        </>
                      ) : (
                        watchtowerModules.map((id, idx) => {
                          const module = watchtower[id as keyof typeof watchtower];
                          if (!module || 'includes' in module) return null;
                          const IconComponent = WATCHTOWER_ICON_MAP[id as keyof typeof WATCHTOWER_ICON_MAP];
                          const localizedWatchtower = messages.catalog.watchtower[id as keyof typeof messages.catalog.watchtower];
                          return (
                            <span key={idx} className="inline-flex items-center gap-1">
                              {IconComponent && <IconComponent className="w-4 h-4" />}
                              <span>{localizedWatchtower?.name ?? module.name}</span>
                            </span>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Cross-Intelligence. The BASE correlation engine ships with
                  every Core package at $0, so a quote that only mentions it
                  when the visitor toggled Pro drops a capability the buyer is
                  already entitled to — which is how the combined pathway ended
                  up listing fewer engines than the Core-only one. */}
              {packageDetails && (
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-semibold flex items-center gap-2">
                      {crossIntelSelection === 'pro' ? (
                        <><Zap className="w-4 h-4 text-[#FF7E6F]" /> {messages.summary.crossIntelligencePro}</>
                      ) : (
                        <><GitBranch className="w-4 h-4 text-[#E9A24A]" /> {messages.summary.crossIntelligence}</>
                      )}
                    </div>
                    <div className="text-sm text-sundae-muted">
                      {crossIntelSelection === 'pro'
                        ? messages.summary.crossIntelligenceProDesc
                        : 'The base correlation engine ships with every Core package at no extra cost.'}
                    </div>
                  </div>
                </div>
              )}

              {/* AI Credits */}
              {packageDetails && (
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-semibold">
                      {pricing.aiCredits.toLocaleString(locale)} {messages.summary.aiCreditsPerMonth}
                    </div>
                    <div className="text-sm text-sundae-muted">
                      {messages.summary.aiCreditsDescription}
                    </div>
                  </div>
                </div>
              )}

              {/* The Crew rail. Without it the combined configuration listed
                  only the Core side, so the second thing the buyer picked —
                  and is charged for below — was invisible in the summary of
                  what they picked. */}
              {crewRail && (
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-[#FF7E6F] mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-semibold">{crewTitle}</div>
                    <div className="text-sm text-sundae-muted">{crewSkuNames.join(' · ')}</div>
                    <div className="text-[10px] text-sundae-muted/80">
                      {crewRail.detectedBundleId
                        ? 'Published net bundle price at your estate size — not a percentage discount off the SKUs'
                        : 'First-location anchor plus lower marginal location bands'}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right side - Investment Summary */}
          <div>
            <h3 className="text-lg font-bold mb-4">{messages.summary.investmentTitle}</h3>
            
            <div className="space-y-4">
              {/* Monthly total — BOTH rails. Core and Crew are priced
                  separately because they have separate unit economics, but the
                  buyer signs one number, and printing the Core rail here while
                  the combined figure sat lower down made the headline the
                  cheaper of two contradictory answers. */}
              <div className="text-center p-6 bg-sundae-dark/50 rounded-lg">
                <div className="text-sm text-sundae-muted mb-1">
                  {messages.summary.monthlyInvestment}
                  {crewRail ? ' · Core + Crew' : ''}
                </div>
                <div className="text-4xl md:text-5xl font-bold mb-1" data-testid="summary-monthly-total">
                  {isQuotable
                    ? money(combinedMonthly)
                    : messages.summary.customPricing}
                </div>
                <div className="text-sm text-sundae-muted">
                  {pricing.requiresEnterpriseQuote
                    ? messages.summary.enterpriseQuote.replace('{email}', LEGAL.supportEmail)
                    : !isQuotable
                      ? messages.summary.contactSales
                      : formatAnnualAmount(locale, money(combinedMonthly * 12))}
                </div>
                {isQuotable && crewRail && (
                  <div className="text-xs text-sundae-muted mt-1">
                    Core {money(pricing.total)} + Crew {money(crewMonthly)}
                  </div>
                )}
              </div>

              {/* The onboarding price path. Shown whenever the quote carries an
                  anchor, because the anchor is the part relief applies to — and
                  at five locations it is 63% of the bill, which is why a flat
                  discount off the whole invoice would miss the point. */}
              {isQuotable && anchorTotal > 0 && (
                <div className="mb-6" data-testid="anchor-relief-schedule">
                  <AnchorReliefSchedule
                    anchorTotal={anchorTotal}
                    recurringTotal={recurringTotal}
                    locations={locations}
                    money={money}
                  />
                </div>
              )}

              {/* Breakdown */}
              <div className="space-y-2 text-sm">
                {crewRail && (
                  <div className="text-[10px] uppercase tracking-wider text-sundae-muted/80">
                    Core rail
                  </div>
                )}
                {pricing.breakdown.map((item, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span className="text-sundae-muted">{item.item}</span>
                    <span className="font-medium">{money(item.price)}</span>
                  </div>
                ))}
                {/* Commitment term AND payment timing — v1.8 prices the pair.
                    "Annual" alone could not tell a quarterly payer from one
                    paying twelve months up front, though the cash position and
                    therefore the concession differ. Exclusive with the volume
                    ladder; the buyer gets whichever is larger, never the sum. */}
                <div className="pt-3 mt-2 border-t border-white/10">
                  {/* The term discount is computed on the Core rail; Crew SKUs
                      and bundles are published net prices. Saying which rail it
                      moves stops the 10% being read against the combined
                      figure printed two lines below. */}
                  <span className="text-sundae-muted text-xs">
                    {q.commitmentTerm}{crewRail ? ` · ${q.coreRail}` : ''}
                  </span>
                  <div
                    className="mt-2 grid grid-cols-2 gap-1.5"
                    role="radiogroup"
                    aria-label={q.commitmentTerm}
                  >
                    {(Object.entries(billingTerms) as Array<
                      [BillingCycle, (typeof billingTerms)[BillingCycle]]
                    >).map(([cycle, term]) => (
                      <button
                        key={cycle}
                        type="button"
                        role="radio"
                        aria-checked={billingCycle === cycle}
                        onClick={() => setBillingCycle(cycle)}
                        className={`rounded-lg border px-2 py-2 text-xs transition-colors ${
                          billingCycle === cycle
                            ? 'border-[#FF5C4D] bg-[#FF5C4D]/15 text-white'
                            : 'border-white/10 bg-sundae-surface text-sundae-muted hover:border-white/30'
                        }`}
                      >
                        <span className="block font-semibold">{term.label}</span>
                        <span className="block text-[10px] opacity-70">{term.timing}</span>
                        {term.discountPercent > 0 && (
                          <span className="block text-[10px] opacity-80">
                            {q.saveShort.replace('{percent}', `${term.discountPercent}%`)}
                          </span>
                        )}
                        {/* The lock is what the extra 8% actually buys, so it
                            travels with the price rather than sitting in terms
                            the buyer meets after signing. */}
                        {term.priceLockMonths && (
                          <span className="block text-[10px] text-green-400">
                            {term.priceLockMonths}-month price lock
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                  {pricing.discounts.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {pricing.discounts.map((d: DiscountLine) => (
                        <div key={d.name} className="flex justify-between text-xs text-green-400">
                          <span>{localiseDiscount(d, q, locations)}</span>
                          {/* `amount` is already signed negative; prefixing a
                              minus rendered "-$-562". */}
                          <span>-${Math.abs(Math.round(d.amount)).toLocaleString(locale)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {crewRail && (
                  <div className="pt-2 mt-2 border-t border-white/10 space-y-2">
                    <div className="text-[10px] uppercase tracking-wider text-sundae-muted/80">
                      Crew rail (operational substrate)
                    </div>
                    {/* The rail used to be one anonymous total. A buyer cannot
                        check a number they cannot see the parts of. */}
                    {crewRail.lines.map((line) => (
                      <div key={line.id} className="flex justify-between">
                        <span className="text-sundae-muted">{line.label}</span>
                        <span className="font-medium">{money(line.monthly)}</span>
                      </div>
                    ))}
                    {crewRail.bundleSavingsMonthly > 0 && (
                      <div className="flex justify-between text-xs text-green-400">
                        <span>vs the SKUs bought separately</span>
                        <span>-{money(crewRail.bundleSavingsMonthly)}</span>
                      </div>
                    )}
                  </div>
                )}
                {crewRail && (
                  <div className="flex justify-between pt-2 mt-2 border-t border-white/20 text-base">
                    <span className="font-semibold">{q.combinedMonthly}</span>
                    <span className="font-bold">
                      {isQuotable
                        ? money(combinedMonthly)
                        : messages.summary.customPricing}
                    </span>
                  </div>
                )}
                {/* Implementation is the largest one-time line in the deal, and
                    it used to read "Scoped at contract" for every visitor
                    because nothing in the journey asked what a launch would
                    involve. The systems answer now resolves a real class, and
                    the drivers are shown so the number is not a mystery. */}
                <div className="flex justify-between pt-2 mt-2 border-t border-white/10">
                  <span className="text-sundae-muted">{q.implementationOneTime}</span>
                  <span className="font-medium">
                    {stackEstimate
                      ? `${stackEstimate.isFloor ? 'from ' : ''}$${stackEstimate.fee.toLocaleString(locale)}`
                      : railImplementation.requiresScoping
                        ? 'Scoped at contract'
                        : railImplementation.fee === 0
                          ? 'Self-service · $0'
                          : `${railImplementation.isFloor ? 'from ' : ''}$${railImplementation.fee.toLocaleString(locale)}`}
                  </span>
                </div>
                {stackEstimate && stackEstimate.drivers.length > 0 && (
                  <ul className="space-y-0.5 pl-0.5">
                    {stackEstimate.drivers.map((d) => (
                      <li key={d} className="text-[10px] text-sundae-muted/80">
                        · {d}
                      </li>
                    ))}
                  </ul>
                )}
                {stackEstimate?.isIndicative && (
                  <p className="text-[10px] text-sundae-muted/80">
                    {q.indicativeOnly}
                  </p>
                )}
                {overlays.length > 0 && (
                  <div className="pt-2 mt-2 border-t border-white/10 space-y-1">
                    <span className="text-sundae-muted text-xs">{q.billedPerObject}</span>
                    {overlays.map((o) => (
                      <div key={o.object} className="flex justify-between text-xs">
                        <span className="text-sundae-muted">
                          {o.object}s beyond {o.includedPerLocation} per location
                        </span>
                        <span className="font-medium">${o.ratePerObject} each</span>
                      </div>
                    ))}
                    <p className="text-[10px] text-sundae-muted/80">
                      {q.objectChargeNote}
                    </p>
                  </div>
                )}
                <p className="text-[10px] text-sundae-muted/80">
                  Charged once at the highest implementation class in your selection — never summed
                  per module.
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 2. Funding case — the value side of the decision, carried forward
          from the ROI step with exactly the same inputs and scope. */}
      {hasCoreRail && isQuotable && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18 }}
          className="rounded-xl border border-[#E9A24A]/30 bg-gradient-to-br from-[#E9A24A]/10 to-sundae-surface p-6 md:p-8 mb-6"
          aria-labelledby="funding-case-title"
        >
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between mb-5">
            <div>
              <div className="text-xs font-bold uppercase tracking-[0.18em] text-[#E9A24A]">
                Value at your inputs
              </div>
              <h3 id="funding-case-title" className="mt-1 text-2xl font-bold">
                What can fund this Core investment
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-sundae-muted">
                A planning model, not a measured outcome. Operational recovery uses the disclosed
                midpoints; cash avoidance includes only spend you entered as replaceable.
              </p>
            </div>
            <div className="text-left md:text-right">
              <div className="text-sm text-sundae-muted">Monthly funding case</div>
              <div className="font-display text-3xl font-bold tabular-nums text-white">
                {money(summaryRoi.monthlyFunding)}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
            <div className="rounded-lg border border-white/10 bg-sundae-dark/40 p-4">
              <div className="text-xs text-sundae-muted">Profit recovery</div>
              <div className="mt-1 text-xl font-bold tabular-nums">
                {money(summaryRoi.monthlySavings)}<span className="text-xs text-sundae-muted">/mo</span>
              </div>
              <p className="mt-1 text-[10px] text-sundae-muted">Only domains granted by {packageDetails?.name}.</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-sundae-dark/40 p-4">
              <div className="text-xs text-sundae-muted">Cash cost avoidance</div>
              <div className="mt-1 text-xl font-bold tabular-nums">
                {money(summaryRoi.replaceableSystemsSavings)}<span className="text-xs text-sundae-muted">/mo</span>
              </div>
              <p className="mt-1 text-[10px] text-sundae-muted">Buyer-entered replaceable systems only.</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-sundae-dark/40 p-4">
              <div className="text-xs text-sundae-muted">Redeployable capacity</div>
              <div className="mt-1 text-xl font-bold tabular-nums">
                {money(summaryRoi.capacityValue)}<span className="text-xs text-sundae-muted">/mo</span>
              </div>
              <p className="mt-1 text-[10px] text-sundae-muted">
                {summaryRoi.capacityFte.toLocaleString(locale, { maximumFractionDigits: 1 })} FTE-equivalent; not counted as cash.
              </p>
            </div>
            <div className="rounded-lg border border-green-400/25 bg-green-400/5 p-4">
              <div className="text-xs text-sundae-muted">Net after Core</div>
              <div className="mt-1 text-xl font-bold tabular-nums text-green-400">
                {money(summaryRoi.monthlyFunding - coreOnlyPricing.total)}<span className="text-xs">/mo</span>
              </div>
              <p className="mt-1 text-[10px] text-sundae-muted">
                {summaryRoi.roiCapped ? `${summaryRoi.roi.toFixed(1)}x+` : `${summaryRoi.roi.toFixed(1)}x`} modelled return; {crewRail ? 'Crew and add-ons' : 'add-ons'} excluded.
              </p>
            </div>
          </div>
        </motion.section>
      )}

      {/* 3. What's Included - COLLAPSIBLE */}
      {packageDetails && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-sundae-surface rounded-xl mb-6"
        >
          <button
            onClick={() => setWhatsIncludedOpen(!whatsIncludedOpen)}
            className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-white/5 transition-colors rounded-xl"
            aria-expanded={whatsIncludedOpen}
            aria-controls="whats-included-content"
          >
            <h3 className="text-lg font-bold">{messages.summary.whatsIncluded}</h3>
            <motion.div
              animate={{ rotate: whatsIncludedOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="w-5 h-5 text-sundae-accent" />
            </motion.div>
          </button>
          
          <AnimatePresence initial={false}>
            {whatsIncludedOpen && (
              <motion.div
                id="whats-included-content"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="px-6 pb-6 grid grid-cols-1 md:grid-cols-2 gap-3">
                  {includedFeatures.map((feature: string, idx: number) => (
                    <div key={idx} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* 3. How You Compare - COLLAPSIBLE (hidden by default) */}
      {/* Note: CompactCompetitorCompare has its own "Best Savings Opportunity" card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-sundae-surface rounded-xl mb-6"
      >
        <button
          onClick={() => setComparisonOpen(!comparisonOpen)}
          className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-white/5 transition-colors rounded-xl"
          aria-expanded={comparisonOpen}
          aria-controls="comparison-content"
        >
          <h3 className="text-lg font-bold">{messages.summary.competitorComparison}</h3>
          <motion.div
            animate={{ rotate: comparisonOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-5 h-5 text-sundae-accent" />
          </motion.div>
        </button>
        
        <AnimatePresence initial={false}>
          {comparisonOpen && (
            <motion.div
              id="comparison-content"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="px-6 pb-6">
                <CompactCompetitorCompare />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Watchtower Strategic Value - COLLAPSIBLE (only if selected) */}
      {watchtowerModules.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-sundae-surface rounded-xl mb-6"
        >
          <button
            onClick={() => setWatchtowerOpen(!watchtowerOpen)}
            className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-white/5 transition-colors rounded-xl"
            aria-expanded={watchtowerOpen}
            aria-controls="watchtower-content"
          >
            <h3 className="text-lg font-bold">{messages.summary.watchtowerValueTitle}</h3>
            <motion.div
              animate={{ rotate: watchtowerOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="w-5 h-5 text-sundae-accent" />
            </motion.div>
          </button>
          
          <AnimatePresence initial={false}>
            {watchtowerOpen && (
              <motion.div
                id="watchtower-content"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="px-6 pb-6">
                  <WatchtowerValue />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* 5. FAQ Section - COLLAPSIBLE (hidden by default) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-sundae-surface rounded-xl mb-6"
      >
        <button
          onClick={() => setFaqOpen(!faqOpen)}
          className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-white/5 transition-colors rounded-xl"
          aria-expanded={faqOpen}
          aria-controls="faq-content"
        >
          <h3 className="text-lg font-bold">{messages.summary.faqTitle}</h3>
          <motion.div
            animate={{ rotate: faqOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-5 h-5 text-sundae-accent" />
          </motion.div>
        </button>
        
        <AnimatePresence initial={false}>
          {faqOpen && (
            <motion.div
              id="faq-content"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="px-6 pb-6">
                {/* The Core FAQ answers the questions this quote raises —
                    marginal bands, no location allowance, whether the domain
                    modules can be bought individually. A Core+Crew buyer needs
                    those answers at least as much as a Core-only one. */}
                <PricingFAQ category={hasCoreRail ? 'core' : 'general'} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* 6. CTA Row */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6"
      >
        <EmailQuoteButton
          pricing={pricing}
          crewMonthly={crewRail?.monthly ?? 0}
          funding={{
            monthlyFunding: summaryRoi.monthlyFunding,
            profitRecovery: summaryRoi.monthlySavings,
            cashAvoidance: summaryRoi.replaceableSystemsSavings,
            capacityValue: summaryRoi.capacityValue,
            capacityFte: summaryRoi.capacityFte,
            coreMonthly: coreOnlyPricing.total,
          }}
        />
        <PDFExportButton
          pricing={pricing}
          crewMonthly={crewRail?.monthly ?? 0}
          funding={{
            monthlyFunding: summaryRoi.monthlyFunding,
            profitRecovery: summaryRoi.monthlySavings,
            cashAvoidance: summaryRoi.replaceableSystemsSavings,
            capacityValue: summaryRoi.capacityValue,
            capacityFte: summaryRoi.capacityFte,
            coreMonthly: coreOnlyPricing.total,
          }}
        />
        <BookDemoButton />
      </motion.div>

      {/* 7. Ready to Get Started */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.45 }}
        className="text-center p-6 md:p-8 bg-gradient-to-r from-[#C2410C]/10 to-[#E9A24A]/10 rounded-xl border border-[#C2410C]/30 mb-8"
      >
        <h3 className="text-2xl font-bold mb-3">{messages.summary.readyTitle}</h3>
        <p className="text-base md:text-lg text-sundae-muted mb-5">
          {messages.summary.readyDescription}
        </p>
        <a
          href={LEGAL.signUpUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-gradient-primary text-white font-bold px-8 py-4 rounded-lg text-lg hover:shadow-glow transition-all inline-flex items-center gap-2"
        >
          <Rocket className="w-6 h-6" />
          {messages.summary.startTrial}
        </a>
        <p className="text-sm text-sundae-muted mt-4">
          {messages.summary.noCard}
        </p>
      </motion.div>

      {/* Support info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center text-sm text-sundae-muted mb-6"
      >
        <p>
          {messages.summary.questions}{' '}
          <a 
            href={getMarketingUrl('/contact', locale)}
            target="_blank" 
            rel="noopener noreferrer"
            className="text-sundae-accent hover:underline font-medium"
          >
            {messages.summary.contactUs}
          </a>
        </p>
        <p className="mt-2">{messages.summary.successManager}</p>
      </motion.div>

      {/* Pricing footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.55 }}
        className="pt-6 border-t border-white/10 text-center text-xs text-sundae-muted space-y-2"
      >
        <p>
          {messages.summary.pricingFooterNote.replace('{date}', pricingFooter.effectiveDate)}
        </p>
        <p>{messages.summary.taxNote} • {messages.summary.changeNotice}</p>
        <p className="text-[10px] opacity-70">{messages.summary.locationPricingNote}</p>
      </motion.div>
    </div>
  );
}

// ─── Crew-path summary ────────────────────────────────────────────────────
// Self-contained renderer for the Crew operational substrate path. Mirrors
// the headline + investment + actions structure of the main ConfigSummary
// but with Crew-specific math (multi-SKU set, bundle auto-detection),
// no AI credits / modules / Watchtower. Includes PDF + Email quote +
// Book Demo CTAs in the same row Core/Report use, so the Crew path
// reaches feature-parity with the analytics path.

import { CrewQuoteButtons } from './CrewQuoteButtons';
import type { CrewSkuId } from '../../types/configuration';
import { objectOverlaysForPurchased, resolveImplementationClass } from '../../lib/discoveryEngine';
import { coreAnchor, crewAnchor } from '../../lib/anchorRelief';
import { AnchorReliefSchedule } from './AnchorReliefSchedule';
import { resolveImplementationFee } from '../../lib/pricingEngine';
import { computeCrewQuote } from '../../lib/crewPricing';
import type { DiscountLine } from '../../types/configuration';
import { pricingFooter } from '../../data/pricing';
import { prefersReducedMotion } from '../../lib/motion';
import { getQuoteSummaryCopy } from '../../lib/quoteSummaryCopy';

interface CrewSummaryBodyProps {
  selectedSkus: CrewSkuId[];
  locations: number;
}

function CrewSummaryBody({ selectedSkus, locations }: CrewSummaryBodyProps) {
  const { locale, messages } = useLocale();
  // The Crew quote is a quote too — it was entirely English.
  const q = getQuoteSummaryCopy(locale);
  const quote = computeCrewQuote(selectedSkus, locations);
  const { monthly, annual, implementation, lines, detectedBundleId, bundleSavingsMonthly } = quote;
  const implementationLabel = implementation.requiresScoping
    ? 'Scoped at contract'
    : implementation.fee === 0
      ? 'Self-service · $0'
      : `${implementation.isFloor ? 'from ' : ''}$${implementation.fee.toLocaleString()}`;
  const headline = detectedBundleId
    ? lines[0].label
    : selectedSkus.length === 1
      ? lines[0].label
      : `${selectedSkus.length}-SKU Crew stack`;

  useEffect(() => {
    if (!prefersReducedMotion()) confetti({
      particleCount: 200,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#06B6D4', '#0E7490', '#22D3EE', '#10B981'],
    });
  }, []);

  return (
    <div className="max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <motion.h1
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="text-4xl md:text-5xl font-bold mb-3 flex items-center justify-center gap-3"
        >
          {q.crewStackReady}
          <Sparkles className="w-10 h-10 text-[#FF7E6F]" />
        </motion.h1>
        <p className="text-lg md:text-xl text-sundae-muted">
          {q.crewSubstrateNote}
        </p>
      </motion.div>

      {/* Investment summary */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-br from-sundae-surface to-sundae-surface/50 rounded-xl p-6 md:p-8 mb-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          <div>
            <h3 className="text-lg font-bold mb-4">{q.yourConfiguration}</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-[#FF7E6F] mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-semibold">{headline}</div>
                  <div className="text-sm text-sundae-muted">
                    {detectedBundleId
                      ? 'Bundle auto-detected · published net bundle price'
                      : `${selectedSkus.length} SKU${selectedSkus.length === 1 ? '' : 's'} selected`}
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-[#FF7E6F] mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-semibold">{quote.locations} {quote.locations === 1 ? 'location' : 'locations'}</div>
                  <div className="text-sm text-sundae-muted">
                    {q.crewCurveNote}
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-[#FF7E6F] mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-semibold">Implementation: {implementationLabel}</div>
                  <div className="text-sm text-sundae-muted">
                    Charged once at the highest implementation class in your selection — never
                    summed per SKU
                  </div>
                </div>
              </div>
              {bundleSavingsMonthly > 0 && (
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-semibold text-emerald-300">Bundle savings · ${bundleSavingsMonthly}/mo</div>
                    <div className="text-sm text-sundae-muted">
                      the published net bundle price vs buying the SKUs separately
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Pricing column */}
          <div className="bg-gradient-to-br from-[#FF7E6F]/10 to-teal-600/5 border-2 border-[#FF7E6F]/30 rounded-xl p-6">
            <p className="text-xs uppercase tracking-wider text-sundae-muted font-semibold mb-2">{q.monthlyInvestment}</p>
            <div className="flex items-baseline gap-1 mb-4">
              <span
                className="font-display text-5xl font-bold text-white tabular-nums"
                data-testid="summary-monthly-total"
              >
                ${monthly.toLocaleString(locale)}
              </span>
              <span className="text-lg text-sundae-muted">/mo</span>
            </div>
            <div
              className="mb-4 rounded-lg border border-white/10 bg-sundae-dark/30 px-3 py-2 text-xs text-sundae-muted"
              data-testid="crew-commitment-policy"
            >
              Published net Crew pricing. No automatic annual or multi-year discount is assumed;
              enterprise commercial terms are scoped in contract.
            </div>
            <div className="space-y-2 pt-4 border-t border-[#FF7E6F]/20">
              {lines.length > 1 && lines.map((line) => {
                const isFreeIncluded = line.monthly === 0 && line.id === 'crew_scheduling';
                return (
                  <div key={line.id} className="flex justify-between text-xs">
                    <span className="text-sundae-muted truncate pr-2">
                      {line.label}
                      {isFreeIncluded && (
                        <span className="text-[10px] text-emerald-300 ml-1">· included</span>
                      )}
                    </span>
                    <span
                      className={`tabular-nums flex-shrink-0 ${
                        isFreeIncluded ? 'text-emerald-300' : 'text-white'
                      }`}
                    >
                      ${line.monthly}
                    </span>
                  </div>
                );
              })}
              <div className="flex justify-between text-sm">
                <span className="text-sundae-muted">Annual</span>
                <span className="text-white tabular-nums">${annual.toLocaleString()}/yr</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-sundae-muted">{q.implementationOneTime}</span>
                <span className="text-white tabular-nums">{implementationLabel}</span>
              </div>
              <div className="flex justify-between text-sm pt-2 mt-2 border-t border-[#FF7E6F]/10">
                <span className="text-sundae-muted">
                  First-year subscription
                  {implementation.requiresScoping ? ' (excl. implementation)' : ''}
                </span>
                <span className="text-white font-semibold tabular-nums">
                  ${(annual + (implementation.requiresScoping ? 0 : implementation.fee)).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* CTAs — Email Quote, PDF, Book Demo (mirrors Report/Core summary) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6"
      >
        <CrewQuoteButtons quote={quote} />
        <BookDemoButton />
      </motion.div>

      {/* Pricing footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.55 }}
        className="pt-6 border-t border-white/10 text-center text-xs text-sundae-muted space-y-2"
      >
        <p>
          {messages.summary.pricingFooterNote.replace('{date}', pricingFooter.effectiveDate)}
        </p>
        <p>{messages.summary.taxNote} • {messages.summary.changeNotice}</p>
        <p className="text-[10px] opacity-70">
          Crew uses a first-location anchor plus lower marginal location bands. Implementation is
          charged once, at the highest class in your selection.
        </p>
      </motion.div>

      {/* A Crew-only buyer used to get a price with no comparison at all.
          The reason not to show one was real — the workforce rivals were
          missing from the catalogue, and a comparison containing only 7shifts
          would have omitted the cheapest options and rebuilt the "only show
          what we win" defect. Homebase, Deputy and 7shifts now carry published
          prices, and Fourth, Bayzat, gulfHR and Nostradamus carry coverage, so
          the comparison is both possible and honest. It scores on `labor`,
          which is what Crew actually delivers. */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mt-8"
      >
        <CompactCompetitorCompare />
      </motion.div>
    </div>
  );
}
