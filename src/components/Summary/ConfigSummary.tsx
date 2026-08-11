// Final configuration summary component - Optimized with collapsibles

import { motion, AnimatePresence } from 'framer-motion';
import { Check, Rocket, ChevronDown, Sparkles, Castle, GitBranch, Zap, Calendar, Search, TrendingUp } from 'lucide-react';
import { useConfiguration } from '../../hooks/useConfiguration';
import { usePriceCalculation } from '../../hooks/usePriceCalculation';
import {
  watchtower,
  getLocalizedTierCatalog,
  corePackages,
  CORE_DOMAIN_MODULE_IDS,
  modules as coreDomainModules,
  foresightAction,
  conceptSkus,
  crewSkus,
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

export function ConfigSummary() {
  const { locale, messages } = useLocale();
  useLivePricingCatalog();
  const {
    layer, corePackage, locations, addOns, watchtowerModules,
    crossIntelligence: crossIntelSelection, markStepCompleted, crewSkus: selectedCrewSkus,
    operatingModels, techStack, billingCycle, setBillingCycle
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
  const overlays = useMemo(() => objectOverlaysFor(operatingModels), [operatingModels]);


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

  // v1.7: the Core PACKAGE is the thing being summarised. Its "what's
  // included" list is the eleven domain modules, which ship with every package.
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
    ? CORE_DOMAIN_MODULE_IDS.map((moduleId) => coreDomainModules[moduleId].name)
    : [];
  // Add-ons are the only Core-side line items a buyer actually purchases, so
  // they get their published names. Rendering the raw ids put `foresight_action`
  // and `concept_hotel_fb` on the quote, which reads like an internal key, not
  // a thing anyone agreed to pay for.
  const addOnNames = addOns.map((id) =>
    id === 'foresight_action' ? foresightAction.name : conceptSkus[id].name,
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
                  same eleven names sit next to prices, and a buyer who reads
                  "modules" as a line item asks to drop the ones they don't want. */}
              {packageDetails && (
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-semibold">
                      All {CORE_DOMAIN_MODULE_IDS.length} Core domain modules included
                    </div>
                    <div className="text-sm text-sundae-muted">
                      Components of {packageDetails.name} — no standalone price, never sold
                      separately.
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
                        ? 'Published net bundle price — a flat monthly figure, not a discount off the SKUs'
                        : 'Flat monthly price per SKU — your location count does not change it'}
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
                <div className="text-4xl md:text-5xl font-bold mb-1">
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
                {/* Commitment term. v1.7 gives 10% annual and 15% two-year,
                    exclusive with the volume ladder and capped at 15% combined.
                    No surface ever set this, so both were unreachable. */}
                <div className="pt-3 mt-2 border-t border-white/10">
                  {/* The term discount is computed on the Core rail; Crew SKUs
                      and bundles are published net prices. Saying which rail it
                      moves stops the 10% being read against the combined
                      figure printed two lines below. */}
                  <span className="text-sundae-muted text-xs">
                    Commitment term{crewRail ? ' · applies to the Core rail' : ''}
                  </span>
                  <div
                    className="mt-2 grid grid-cols-3 gap-1.5"
                    role="radiogroup"
                    aria-label="Commitment term"
                  >
                    {([
                      ['monthly', 'Monthly', null],
                      ['annual', 'Annual', '10%'],
                      ['two_year', '2 years', '15%'],
                    ] as const).map(([cycle, label, off]) => (
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
                        <span className="block font-semibold">{label}</span>
                        {off && <span className="block text-[10px] opacity-80">save {off}</span>}
                      </button>
                    ))}
                  </div>
                  {pricing.discounts.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {pricing.discounts.map((d: DiscountLine) => (
                        <div key={d.name} className="flex justify-between text-xs text-green-400">
                          <span>{d.name}</span>
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
                    <span className="font-semibold">Combined monthly</span>
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
                  <span className="text-sundae-muted">Implementation (one-time)</span>
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
                    Indicative only — confirm your systems and we will scope the exact class.
                  </p>
                )}
                {overlays.length > 0 && (
                  <div className="pt-2 mt-2 border-t border-white/10 space-y-1">
                    <span className="text-sundae-muted text-xs">Billed per active object</span>
                    {overlays.map((o) => (
                      <div key={o.object} className="flex justify-between text-xs">
                        <span className="text-sundae-muted">
                          {o.object}s beyond {o.includedPerLocation} per location
                        </span>
                        <span className="font-medium">${o.ratePerObject} each</span>
                      </div>
                    ))}
                    <p className="text-[10px] text-sundae-muted/80">
                      Charged only while the object is active, and never discounted.
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

      {/* 2. What's Included - COLLAPSIBLE */}
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
        <EmailQuoteButton />
        <PDFExportButton />
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
import { objectOverlaysFor, resolveImplementationClass } from '../../lib/discoveryEngine';
import { resolveImplementationFee } from '../../lib/pricingEngine';
import { computeCrewQuote } from '../../lib/crewPricing';
import type { DiscountLine } from '../../types/configuration';
import { pricingFooter } from '../../data/pricing';
import { prefersReducedMotion } from '../../lib/motion';

interface CrewSummaryBodyProps {
  selectedSkus: CrewSkuId[];
  locations: number;
}

function CrewSummaryBody({ selectedSkus, locations }: CrewSummaryBodyProps) {
  const { messages } = useLocale();
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
          Your Crew stack is ready
          <Sparkles className="w-10 h-10 text-[#FF7E6F]" />
        </motion.h1>
        <p className="text-lg md:text-xl text-sundae-muted">
          Multi-region payroll readiness, scheduling, and HR ops on one operational substrate.
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
            <h3 className="text-lg font-bold mb-4">Your configuration</h3>
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
                    Crew is a flat monthly price — your location count does not change it
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
            <p className="text-xs uppercase tracking-wider text-sundae-muted font-semibold mb-2">Monthly investment</p>
            <div className="flex items-baseline gap-1 mb-4">
              <span className="font-display text-5xl font-bold text-white tabular-nums">${monthly}</span>
              <span className="text-lg text-sundae-muted">/mo</span>
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
                <span className="text-sundae-muted">Implementation (one-time)</span>
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
          Crew SKUs and bundles are a flat monthly price. Implementation is charged once, at the
          highest class in your selection.
        </p>
      </motion.div>
    </div>
  );
}
