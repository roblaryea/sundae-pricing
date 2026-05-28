// Final configuration summary component - Optimized with collapsibles

import { motion, AnimatePresence } from 'framer-motion';
import { Check, Rocket, ChevronDown, Sparkles, Castle, GitBranch, Zap, Calendar, Search, TrendingUp } from 'lucide-react';
import { useConfiguration } from '../../hooks/useConfiguration';
import { usePriceCalculation } from '../../hooks/usePriceCalculation';
import { watchtower, getLocalizedTierCatalog } from '../../data/pricing';
import confetti from 'canvas-confetti';
import { useEffect, useState } from 'react';
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
    layer, tier, locations, modules: selectedModules, watchtowerModules,
    crossIntelligence: crossIntelSelection, markStepCompleted, crewSkus: selectedCrewSkus
  } = useConfiguration();

  const pricing = usePriceCalculation(layer, tier, locations, selectedModules, watchtowerModules, undefined, crossIntelSelection);
  const localizedTiers = getLocalizedTierCatalog(locale);
  // Layer label is rendered in the Report/Core branch only; coerce Crew to
  // null for the helper signature (Crew branch returns early below).
  const layerLabel = getLocalizedLayerName(locale, layer === 'crew' ? null : layer);
  
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
      colors: ['#667eea', '#764ba2', '#38BDF8', '#22C55E']
    });
  }, [markStepCompleted]);

  // Get tier details
  const getTierDetails = () => {
    if (layer === 'report' && tier !== 'enterprise') {
      const reportTier = tier as 'lite' | 'plus' | 'pro';
      return localizedTiers.reportTiers[reportTier];
    } else if (layer === 'core' && (tier === 'lite' || tier === 'pro')) {
      const coreTier = tier as 'lite' | 'pro';
      return localizedTiers.coreTiers[coreTier];
    }
    return null;
  };

  const tierDetails = getTierDetails();

  // Crew is the parallel operational substrate path — it doesn't use
  // tiers, modules, watchtower, AI credits, or the cross-intelligence
  // engine. Render a dedicated Crew-specific summary that shows the
  // SKU/bundle they picked, the location-driven price, and the BYO-HR
  // strategic note. This branch runs after all hooks so React's rules
  // of hooks are honored.
  if (layer === 'crew') {
    return <CrewSummaryBody selectedSkus={selectedCrewSkus} locations={locations} />;
  }

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
                    {layerLabel} {tierDetails?.name}
                  </div>
                  <div className="text-sm text-sundae-muted">
                    {tierDetails?.tagline}
                  </div>
                </div>
              </div>

              {/* Locations */}
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-semibold">{locations.toLocaleString(locale)} {messages.summary.locationLabel}{locations !== 1 ? messages.summary.locationPluralSuffix : ''}</div>
                  <div className="text-sm text-sundae-muted">
                    {tier === 'enterprise'
                      ? messages.summary.volumePricing
                      : isNaN(pricing.perLocation) || !isFinite(pricing.perLocation)
                        ? messages.summary.customPricing
                        : `$${pricing.perLocation.toLocaleString(locale, { maximumFractionDigits: 0 })} ${messages.summary.perLocation}`}
                  </div>
                </div>
              </div>

              {/* Modules */}
              {selectedModules.length > 0 && (
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-semibold">
                      {selectedModules.length} {messages.summary.intelligenceModule}{selectedModules.length !== 1 ? messages.summary.locationPluralSuffix : ''}
                    </div>
                    <div className="text-sm text-sundae-muted">
                      {messages.summary.enhancedAnalytics}
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
                        <><Zap className="w-4 h-4 text-cyan-400" /> {messages.summary.crossIntelligencePro}</>
                      ) : (
                        <><GitBranch className="w-4 h-4 text-purple-400" /> {messages.summary.crossIntelligence}</>
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
              {tierDetails && (
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
                  {tier === 'enterprise' 
                    ? messages.summary.customPricing
                    : isNaN(pricing.total) || !isFinite(pricing.total)
                      ? messages.summary.customPricing
                      : `$${pricing.total.toLocaleString(locale)}`}
                </div>
                <div className="text-sm text-sundae-muted">
                  {tier === 'enterprise'
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
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 2. What's Included - COLLAPSIBLE */}
      {tierDetails && (
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
                  {tierDetails.features.map((feature, idx) => (
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
                <PricingFAQ category={layer === 'report' || layer === 'core' ? layer : 'general'} />
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
        className="text-center p-6 md:p-8 bg-gradient-to-r from-violet-500/10 to-purple-500/10 rounded-xl border border-violet-500/30 mb-8"
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

import { computeCrewQuote } from '../../lib/crewPricing';
import { CrewQuoteButtons } from './CrewQuoteButtons';
import type { CrewSkuId } from '../../types/configuration';

interface CrewSummaryBodyProps {
  selectedSkus: CrewSkuId[];
  locations: number;
}

function CrewSummaryBody({ selectedSkus, locations }: CrewSummaryBodyProps) {
  const { locale, messages } = useLocale();
  const quote = computeCrewQuote(selectedSkus, locations);
  const { monthly, annual, setupFee, lines, detectedBundleId, bundleSavingsMonthly } = quote;
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
          <Sparkles className="w-10 h-10 text-cyan-400" />
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
                <Check className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-semibold">{headline}</div>
                  <div className="text-sm text-sundae-muted">
                    {detectedBundleId
                      ? 'Bundle auto-detected · 20% discount applied'
                      : `${selectedSkus.length} SKU${selectedSkus.length === 1 ? '' : 's'} selected`}
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-semibold">{quote.locations} {quote.locations === 1 ? 'location' : 'locations'}</div>
                  <div className="text-sm text-sundae-muted">
                    {detectedBundleId
                      ? `Bundle includes 3 · ${Math.max(0, quote.locations - 3)} billable extra`
                      : `${lines.length === 1 ? lines[0].includedLocations : 'Per-SKU'} included · scales by SKU`}
                  </div>
                </div>
              </div>
              {setupFee > 0 && (
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-semibold">One-time setup: ${setupFee}</div>
                    <div className="text-sm text-sundae-muted">
                      {detectedBundleId
                        ? 'Bundle setup · country pack activation + statutory exports'
                        : 'Onboarding + activation across selected SKUs'}
                    </div>
                  </div>
                </div>
              )}
              {bundleSavingsMonthly > 0 && (
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-semibold text-emerald-300">Bundle savings · ${bundleSavingsMonthly}/mo</div>
                    <div className="text-sm text-sundae-muted">vs buying the SKUs separately</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Pricing column */}
          <div className="bg-gradient-to-br from-cyan-500/10 to-teal-600/5 border-2 border-cyan-500/30 rounded-xl p-6">
            <p className="text-xs uppercase tracking-wider text-cyan-300 font-semibold mb-2">Monthly investment</p>
            <div className="flex items-baseline gap-1 mb-4">
              <span className="text-5xl font-bold text-white tabular-nums">${monthly}</span>
              <span className="text-lg text-sundae-muted">/mo</span>
            </div>
            <div className="space-y-2 pt-4 border-t border-cyan-500/20">
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
              {setupFee > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-sundae-muted">One-time setup</span>
                  <span className="text-white tabular-nums">${setupFee}</span>
                </div>
              )}
              <div className="flex justify-between text-sm pt-2 mt-2 border-t border-cyan-500/10">
                <span className="text-sundae-muted">First-year total</span>
                <span className="text-white font-semibold tabular-nums">${(annual + setupFee).toLocaleString()}</span>
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
        <p className="text-[10px] opacity-70">{messages.summary.locationPricingNote}</p>
      </motion.div>
    </div>
  );
}
