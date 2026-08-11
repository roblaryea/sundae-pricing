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
import { formatAnnualAmount, getLocalizedLayerName } from '../../lib/pricingUiCopy';

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
    
    confetti({
      particleCount: 200,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#FF5C4D', '#E9A24A', '#FF5C4D', '#22C55E']
    });
  }, [markStepCompleted]);

  // v1.7: the Core PACKAGE is the thing being summarised. Its "what's
  // included" list is the eleven domain modules, which ship with every package.
  const packageDetails = layer === 'core' ? corePackages[corePackage] : null;
  const includedFeatures = packageDetails
    ? CORE_DOMAIN_MODULE_IDS.map((moduleId) => coreDomainModules[moduleId].name)
    : [];

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
                  <div className="font-semibold">
                    {layerLabel} {packageDetails?.name}
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
                      locations), not a per-location rate card. Label it as one. */}
                  <div className="text-sm text-sundae-muted">
                    {isNaN(pricing.perLocation) || !isFinite(pricing.perLocation)
                        ? messages.summary.customPricing
                        : `Avg $${pricing.perLocation.toLocaleString(locale, { maximumFractionDigits: 0 })} ${messages.summary.perLocation}`}
                  </div>
                </div>
              </div>

              {/* Modules */}
              {/* Included domain modules — a package component, not a purchase */}
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-semibold">
                    {CORE_DOMAIN_MODULE_IDS.length} Core domain modules included
                  </div>
                  <div className="text-sm text-sundae-muted">
                    {messages.summary.enhancedAnalytics}
                  </div>
                </div>
              </div>

              {addOns.length > 0 && (
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-semibold">
                      {addOns.length} add-on{addOns.length === 1 ? '' : 's'}
                    </div>
                    <div className="text-sm text-sundae-muted">
                      {addOns.join(', ')}
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

              {/* Cross-Intelligence */}
              {crossIntelSelection !== 'none' && (
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
                        : messages.summary.crossIntelligenceDesc}
                    </div>
                  </div>
                </div>
              )}

              {/* AI Credits */}
              {packageDetails && (
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-semibold">{pricing.aiCredits} {messages.summary.aiCreditsPerMonth}</div>
                    <div className="text-sm text-sundae-muted">
                      {messages.summary.aiCreditsDescription}
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
              {/* Monthly total */}
              <div className="text-center p-6 bg-sundae-dark/50 rounded-lg">
                <div className="text-sm text-sundae-muted mb-1">{messages.summary.monthlyInvestment}</div>
                <div className="text-4xl md:text-5xl font-bold mb-1">
                  {pricing.requiresEnterpriseQuote
                    ? messages.summary.customPricing
                    : isNaN(pricing.total) || !isFinite(pricing.total)
                      ? messages.summary.customPricing
                      : `$${pricing.total.toLocaleString(locale)}`}
                </div>
                <div className="text-sm text-sundae-muted">
                  {pricing.requiresEnterpriseQuote
                    ? messages.summary.enterpriseQuote.replace('{email}', LEGAL.supportEmail)
                    : isNaN(pricing.total) || !isFinite(pricing.total)
                      ? messages.summary.contactSales
                      : formatAnnualAmount(locale, `$${(pricing.total * 12).toLocaleString(locale)}`)}
                </div>
              </div>

              {/* Breakdown */}
              <div className="space-y-2 text-sm">
                {pricing.breakdown.map((item, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span className="text-sundae-muted">{item.item}</span>
                    <span className="font-medium">${item.price.toLocaleString(locale)}</span>
                  </div>
                ))}
                {/* Commitment term. v1.7 gives 10% annual and 15% two-year,
                    exclusive with the volume ladder and capped at 15% combined.
                    No surface ever set this, so both were unreachable. */}
                <div className="pt-3 mt-2 border-t border-white/10">
                  <span className="text-sundae-muted text-xs">Commitment term</span>
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
                  <div className="flex justify-between pt-2 mt-2 border-t border-white/10">
                    <span className="text-sundae-muted">Crew (operational substrate)</span>
                    <span className="font-medium">
                      ${crewRail.monthly.toLocaleString(locale)}
                    </span>
                  </div>
                )}
                {crewRail && (
                  <div className="flex justify-between pt-2 mt-2 border-t border-white/20 text-base">
                    <span className="font-semibold">Combined monthly</span>
                    <span className="font-bold">
                      ${(pricing.total + crewRail.monthly).toLocaleString(locale)}
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
                      : pricing.implementation.requiresScoping
                        ? 'Scoped at contract'
                        : pricing.implementation.fee === 0
                          ? 'Self-service · $0'
                          : `${pricing.implementation.isFloor ? 'from ' : ''}$${pricing.implementation.fee.toLocaleString(locale)}`}
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
                <PricingFAQ category={layer === 'core' ? 'core' : 'general'} />
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
          {messages.summary.pricingFooterNote.replace('{date}', new Intl.DateTimeFormat(locale, { dateStyle: 'long' }).format(new Date('2026-02-26T00:00:00Z')))}
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
import { computeCrewQuote } from '../../lib/crewPricing';
import type { DiscountLine } from '../../types/configuration';

interface CrewSummaryBodyProps {
  selectedSkus: CrewSkuId[];
  locations: number;
}

function CrewSummaryBody({ selectedSkus, locations }: CrewSummaryBodyProps) {
  const { locale, messages } = useLocale();
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
    confetti({
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
          {messages.summary.pricingFooterNote.replace('{date}', new Intl.DateTimeFormat(locale, { dateStyle: 'long' }).format(new Date('2026-02-26T00:00:00Z')))}
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
