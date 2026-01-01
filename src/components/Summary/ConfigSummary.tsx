// Final configuration summary component - Optimized with collapsibles

import { motion, AnimatePresence } from 'framer-motion';
import { Check, Rocket, ChevronDown } from 'lucide-react';
import { useConfiguration } from '../../hooks/useConfiguration';
import { usePriceCalculation } from '../../hooks/usePriceCalculation';
import { reportTiers, coreTiers, watchtower } from '../../data/pricing';
import confetti from 'canvas-confetti';
import { useEffect, useState } from 'react';
import { PDFExportButton } from './PDFExport';
import { EmailQuoteButton } from './EmailQuoteButton';
import { BookDemoButton } from './BookDemoButton';
import { CompactCompetitorCompare } from './CompactCompetitorCompare';
import { WatchtowerValue } from './WatchtowerValue';
import { PricingFAQ } from './PricingFAQ';
import { pricingFooter } from '../../data/pricing';

export function ConfigSummary() {
  const { 
    layer, tier, locations, modules: selectedModules, watchtowerModules,
    markStepCompleted
  } = useConfiguration();
  
  const pricing = usePriceCalculation(layer, tier, locations, selectedModules, watchtowerModules);
  
  // Collapsible states
  const [whatsIncludedOpen, setWhatsIncludedOpen] = useState(true);
  const [comparisonOpen, setComparisonOpen] = useState(false);

  useEffect(() => {
    // Mark summary as viewed and trigger confetti
    markStepCompleted('summary');
    
    confetti({
      particleCount: 200,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#667eea', '#764ba2', '#38BDF8', '#22C55E']
    });

    // Collapse "What's Included" on mobile by default
    const isMobile = window.innerWidth < 768;
    if (isMobile) {
      setWhatsIncludedOpen(false);
    }
  }, []);

  // Get tier details
  const getTierDetails = () => {
    if (layer === 'report' && tier !== 'enterprise') {
      const reportTier = tier as 'lite' | 'plus' | 'pro';
      return reportTiers[reportTier];
    } else if (layer === 'core' && (tier === 'lite' || tier === 'pro')) {
      const coreTier = tier as 'lite' | 'pro';
      return coreTiers[coreTier];
    }
    return null;
  };

  const tierDetails = getTierDetails();

  // Calculate best savings opportunity
  const getBestSavings = () => {
    const tenzoMonthly = pricing.savings.tenzo.monthly;
    const ourMonthly = pricing.total;
    const monthlySavings = tenzoMonthly - ourMonthly;
    
    if (monthlySavings > 0) {
      return {
        competitor: 'Tenzo',
        monthly: monthlySavings,
        annual: monthlySavings * 12
      };
    }
    return null;
  };

  const bestSavings = getBestSavings();

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
          className="text-4xl md:text-5xl font-bold mb-3"
        >
          Your Sundae Stack 🍨
        </motion.h1>
        <p className="text-lg md:text-xl text-sundae-muted">
          Ready to transform your restaurant intelligence
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
            <h3 className="text-lg font-bold mb-4">Your Configuration</h3>
            
            <div className="space-y-3">
              {/* Layer & Tier */}
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-semibold">
                    {layer?.toUpperCase()} {tierDetails?.name}
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
                  <div className="font-semibold">{locations} Location{locations !== 1 ? 's' : ''}</div>
                  <div className="text-sm text-sundae-muted">
                    ${pricing.perLocation.toFixed(0)} per location
                  </div>
                </div>
              </div>

              {/* Modules */}
              {selectedModules.length > 0 && (
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-semibold">
                      {selectedModules.length} Intelligence Module{selectedModules.length !== 1 ? 's' : ''}
                    </div>
                    <div className="text-sm text-sundae-muted">
                      Enhanced analytics & operations
                    </div>
                  </div>
                </div>
              )}

              {/* Watchtower */}
              {watchtowerModules.length > 0 && (
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-semibold">Watchtower Intelligence</div>
                    <div className="text-sm text-sundae-muted">
                      {watchtowerModules.includes('bundle') 
                        ? '🏰 Full Bundle (All modules)'
                        : watchtowerModules.map(id => watchtower[id as keyof typeof watchtower]?.icon).filter(Boolean).join(' ')}
                    </div>
                  </div>
                </div>
              )}

              {/* AI Credits */}
              {tierDetails && (
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-semibold">{pricing.aiCredits} AI Credits/month</div>
                    <div className="text-sm text-sundae-muted">
                      For insights and automation
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right side - Investment Summary */}
          <div>
            <h3 className="text-lg font-bold mb-4">Investment Summary</h3>
            
            <div className="space-y-4">
              {/* Monthly total */}
              <div className="text-center p-6 bg-sundae-dark/50 rounded-lg">
                <div className="text-sm text-sundae-muted mb-1">Monthly Investment</div>
                <div className="text-4xl md:text-5xl font-bold mb-1">${pricing.total.toLocaleString()}</div>
                <div className="text-sm text-sundae-muted">
                  ${(pricing.total * 12).toLocaleString()} annually
                </div>
              </div>

              {/* Breakdown */}
              <div className="space-y-2 text-sm">
                {pricing.breakdown.map((item, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span className="text-sundae-muted">{item.item}</span>
                    <span className="font-medium">${item.price.toLocaleString()}</span>
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
            <h3 className="text-lg font-bold">What's Included</h3>
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

      {/* 3. Best Savings Opportunity - ALWAYS VISIBLE */}
      {bestSavings && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-xl p-6 border border-green-500/30 mb-6"
        >
          <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
            <span className="text-2xl">💰</span>
            Best Savings Opportunity
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-sundae-muted mb-1">vs {bestSavings.competitor}</div>
              <div className="text-3xl font-bold text-green-400">
                ${Math.round(bestSavings.monthly).toLocaleString()}/mo
              </div>
              <div className="text-sm text-sundae-muted mt-1">
                ${Math.round(bestSavings.annual).toLocaleString()} per year
              </div>
            </div>
            <div className="flex items-center">
              <p className="text-sm text-sundae-muted">
                You'll save <strong className="text-white">${Math.round(bestSavings.monthly).toLocaleString()}</strong> every month compared to {bestSavings.competitor}, 
                while getting more features and better support.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* 4. How You Compare - COLLAPSIBLE (hidden by default) */}
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
          <h3 className="text-lg font-bold">View Full Competitor Comparison</h3>
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

      {/* Watchtower Strategic Value - Only if selected */}
      {watchtowerModules.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="mb-6"
        >
          <WatchtowerValue />
        </motion.div>
      )}

      {/* 5. FAQ Section - Already has accordion behavior */}
      <div className="mb-6">
        <PricingFAQ />
      </div>

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
        <h3 className="text-2xl font-bold mb-3">Ready to Get Started?</h3>
        <p className="text-base md:text-lg text-sundae-muted mb-5">
          Join hundreds of restaurants already using Sundae to make smarter decisions
        </p>
        <button className="bg-gradient-primary text-white font-bold px-8 py-4 rounded-lg text-lg hover:shadow-glow transition-all inline-flex items-center gap-2">
          <Rocket className="w-6 h-6" />
          Start Free Trial
        </button>
        <p className="text-sm text-sundae-muted mt-4">
          No credit card required • 14-day free trial • Cancel anytime
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
          Questions?{' '}
          <a 
            href="https://www.sundae.io/contact" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-sundae-accent hover:underline font-medium"
          >
            Click here to contact us
          </a>
        </p>
        <p className="mt-2">Your dedicated Customer Success Manager will help you get started</p>
      </motion.div>

      {/* Pricing footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.55 }}
        className="pt-6 border-t border-white/10 text-center text-xs text-sundae-muted space-y-2"
      >
        <p>
          <strong>Pricing effective {pricingFooter.effectiveDate}</strong> • All prices in {pricingFooter.currency}
        </p>
        <p>{pricingFooter.taxNote} • {pricingFooter.changeNotice}</p>
        <p className="text-[10px] opacity-70">{pricingFooter.locationPricingNote}</p>
      </motion.div>
    </div>
  );
}
