// Final configuration summary component

import { motion } from 'framer-motion';
import { Check, Mail, Rocket } from 'lucide-react';
import { useConfiguration } from '../../hooks/useConfiguration';
import { usePriceCalculation } from '../../hooks/usePriceCalculation';
import { reportTiers, coreTiers, watchtower } from '../../data/pricing';
import confetti from 'canvas-confetti';
import { useEffect } from 'react';
import { PDFExportButton } from './PDFExport';
import { BookDemoButton } from './BookDemoButton';

export function ConfigSummary() {
  const { 
    layer, tier, locations, modules: selectedModules, watchtowerModules,
    markStepCompleted
  } = useConfiguration();
  
  const pricing = usePriceCalculation(layer, tier, locations, selectedModules, watchtowerModules);

  useEffect(() => {
    // Mark summary as viewed and trigger confetti
    markStepCompleted('summary');
    
    confetti({
      particleCount: 200,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#667eea', '#764ba2', '#38BDF8', '#22C55E']
    });
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

  return (
    <div className="max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <motion.h1 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
          className="text-5xl font-bold mb-4"
        >
          Your Sundae Stack 🍨
        </motion.h1>
        <p className="text-xl text-sundae-muted">
          Ready to transform your restaurant intelligence
        </p>
      </motion.div>

      {/* Configuration overview */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-gradient-to-br from-sundae-surface to-sundae-surface/50 rounded-xl p-8 mb-8"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left side - Configuration */}
          <div>
            <h3 className="text-lg font-bold mb-6">Your Configuration</h3>
            
            <div className="space-y-4">
              {/* Layer & Tier */}
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-400 mt-0.5" />
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
                <Check className="w-5 h-5 text-green-400 mt-0.5" />
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
                  <Check className="w-5 h-5 text-green-400 mt-0.5" />
                  <div>
                    <div className="font-semibold">
                      {selectedModules.length} Intelligence Module{selectedModules.length !== 1 ? 's' : ''}
                    </div>
                    <div className="text-sm text-sundae-muted">
                      Module details available
                    </div>
                  </div>
                </div>
              )}

              {/* Watchtower */}
              {watchtowerModules.length > 0 && (
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-400 mt-0.5" />
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
                  <Check className="w-5 h-5 text-green-400 mt-0.5" />
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

          {/* Right side - Pricing */}
          <div>
            <h3 className="text-lg font-bold mb-6">Investment Summary</h3>
            
            <div className="space-y-6">
              {/* Monthly total */}
              <div className="text-center p-6 bg-sundae-dark/50 rounded-lg">
                <div className="text-sm text-sundae-muted mb-2">Monthly Investment</div>
                <div className="text-5xl font-bold mb-2">${pricing.total.toLocaleString()}</div>
                <div className="text-sm text-sundae-muted">
                  ${(pricing.total * 12).toLocaleString()} annually
                </div>
              </div>

              {/* Savings - Calculate difference vs Tenzo */}
              {(() => {
                const tenzoMonthly = pricing.savings.tenzo.monthly;
                const ourMonthly = pricing.total;
                const monthlySavings = tenzoMonthly - ourMonthly;
                
                return monthlySavings > 0 ? (
                  <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/30">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">vs Tenzo</span>
                      <span className="font-bold text-green-400">
                        Save ${Math.round(monthlySavings)}/mo
                      </span>
                    </div>
                  </div>
                ) : null;
              })()}

              {/* Breakdown */}
              <div className="space-y-2 text-sm">
                {pricing.breakdown.map((item, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span className="text-sundae-muted">{item.item}</span>
                    <span>${item.price.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Features included */}
      {tierDetails && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-sundae-surface rounded-xl p-8 mb-8"
        >
          <h3 className="text-lg font-bold mb-6">What's Included</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tierDetails.features.map((feature, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                <span className="text-sm">{feature}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* CTAs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
      >
        <button 
          className="button-secondary flex items-center justify-center gap-2"
          onClick={() => {
            const subject = encodeURIComponent(`Sundae Quote - ${locations} Locations`);
            const body = encodeURIComponent(`I'm interested in Sundae for ${locations} location(s).\n\nConfiguration: ${layer?.toUpperCase()} ${tier}\nMonthly: $${pricing.total}\n\nPlease send me more information.`);
            window.location.href = `mailto:hello@sundae.io?subject=${subject}&body=${body}`;
          }}
        >
          <Mail className="w-5 h-5" />
          Email Quote
        </button>
        <PDFExportButton />
        <BookDemoButton />
      </motion.div>

      {/* Final CTA */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center p-8 bg-gradient-to-r from-violet-500/10 to-purple-500/10 rounded-xl border border-violet-500/30"
      >
        <h3 className="text-2xl font-bold mb-4">Ready to Get Started?</h3>
        <p className="text-lg text-sundae-muted mb-6">
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
        transition={{ delay: 0.6 }}
        className="mt-12 text-center text-sm text-sundae-muted"
      >
        <p>Questions? Call us at 1-800-SUNDAE1 or email hello@sundae.io</p>
        <p className="mt-2">Your dedicated Customer Success Manager will help you get started</p>
      </motion.div>
    </div>
  );
}
