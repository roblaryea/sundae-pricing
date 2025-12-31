// Tier selector with feature comparison component

import { motion } from 'framer-motion';
import { Check, X, Star, TrendingUp, ChevronRight } from 'lucide-react';
import { useConfiguration } from '../../hooks/useConfiguration';
import { reportTiers, coreTiers } from '../../data/pricing';
import { suggestOptimalTier } from '../../hooks/usePriceCalculation';

export function TierSelector() {
  const { layer, tier, setTier, locations, setCurrentStep } = useConfiguration();

  if (!layer) {
    // Shouldn't happen, but handle gracefully
    setCurrentStep(1);
    return null;
  }

  const tiers = layer === 'report' 
    ? Object.values(reportTiers)
    : Object.values(coreTiers).filter(t => typeof t === 'object' && 'basePrice' in t);

  const optimalTier = suggestOptimalTier(locations, layer);

  const handleTierSelect = (tierId: string) => {
    setTier(tierId as 'lite' | 'plus' | 'pro' | 'enterprise');
    setCurrentStep(3);
  };

  const getTierColor = (tierId: string) => {
    const colors: Record<string, string> = {
      'report-lite': '#10B981',
      'report-plus': '#3B82F6',
      'report-pro': '#6366F1',
      'core-lite': '#8B5CF6',
      'core-pro': '#A855F7',
      'enterprise': '#F59E0B'
    };
    return colors[tierId] || '#3B82F6';
  };

  return (
    <div className="max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl font-bold mb-4">
          Choose Your {layer === 'report' ? 'Report' : 'Core'} Tier
        </h1>
        <p className="text-xl text-sundae-muted">
          {layer === 'report' 
            ? 'Start free or unlock more analytics power'
            : 'Real-time intelligence tailored to your scale'}
        </p>
      </motion.div>

      {/* Tier cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {tiers.map((tierData, index) => {
          if (!('basePrice' in tierData)) return null;
          
          const isOptimal = tierData.id.includes(optimalTier);
          const tierColor = getTierColor(tierData.id);

          return (
            <motion.div
              key={tierData.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -10 }}
              className="relative"
            >
              {isOptimal && (
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                  className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10"
                >
                  <div className="bg-gradient-primary text-white px-4 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                    <Star className="w-4 h-4" />
                    RECOMMENDED
                  </div>
                </motion.div>
              )}

              <motion.button
                onClick={() => handleTierSelect(tierData.id.split('-').pop() || 'lite')}
                className={`w-full h-full p-6 rounded-xl border-2 transition-all ${
                  isOptimal 
                    ? 'bg-gradient-to-br from-white/10 to-white/5 border-white/30 hover:border-white/50'
                    : 'bg-sundae-surface border-white/10 hover:border-white/30'
                }`}
                style={{ 
                  borderColor: isOptimal ? `${tierColor}50` : undefined,
                  boxShadow: isOptimal ? `0 0 30px ${tierColor}30` : undefined
                }}
              >
                <div className="text-left">
                  {/* Header */}
                  <div className="mb-4">
                    <h3 className="text-2xl font-bold mb-1" style={{ color: tierColor }}>
                      {tierData.name}
                    </h3>
                    <p className="text-sm text-sundae-muted">{tierData.tagline}</p>
                  </div>

                  {/* Price */}
                  <div className="mb-6">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold tabular-nums">
                        ${tierData.basePrice}
                      </span>
                      <span className="text-sundae-muted">/mo</span>
                    </div>
                    {tierData.additionalLocationPrice > 0 && (
                      <p className="text-sm text-sundae-muted mt-1">
                        +${tierData.additionalLocationPrice} per additional location
                      </p>
                    )}
                  </div>

                  {/* Key metrics */}
                  <div className="space-y-3 mb-6 pb-6 border-b border-white/10">
                    <div className="flex justify-between text-sm">
                      <span className="text-sundae-muted">AI Credits</span>
                      <span className="font-semibold">
                        {tierData.aiCredits.base}+
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-sundae-muted">Visuals</span>
                      <span className="font-semibold">{tierData.visuals}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-sundae-muted">Data Refresh</span>
                      <span className="font-semibold">{tierData.refresh}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-sundae-muted">Benchmark</span>
                      <span className="font-semibold">{tierData.benchmarkMetrics} metrics</span>
                    </div>
                  </div>

                  {/* Features */}
                  <ul className="space-y-2">
                    {tierData.features.slice(0, 5).map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <div className="mt-6 flex items-center justify-center gap-2 text-sm font-semibold" style={{ color: tierColor }}>
                    Select {tierData.name}
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </motion.button>
            </motion.div>
          );
        })}
      </div>

      {/* Feature comparison table */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="bg-sundae-surface rounded-xl p-6"
      >
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-sundae-accent" />
          Detailed Feature Comparison
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-2 px-4">Feature</th>
                {tiers.map(tierData => (
                  'basePrice' in tierData && (
                    <th key={tierData.id} className="text-center py-2 px-4" style={{ color: getTierColor(tierData.id) }}>
                      {tierData.name}
                    </th>
                  )
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              <tr>
                <td className="py-3 px-4">Monthly Price</td>
                {tiers.map(tierData => (
                  'basePrice' in tierData && (
                    <td key={tierData.id} className="text-center py-3 px-4">
                      ${tierData.basePrice}
                    </td>
                  )
                ))}
              </tr>
              <tr>
                <td className="py-3 px-4">AI Credits</td>
                {tiers.map(tierData => (
                  'basePrice' in tierData && (
                    <td key={tierData.id} className="text-center py-3 px-4">
                      {tierData.aiCredits.base}
                    </td>
                  )
                ))}
              </tr>
              <tr>
                <td className="py-3 px-4">Data Refresh</td>
                {tiers.map(tierData => (
                  'basePrice' in tierData && (
                    <td key={tierData.id} className="text-center py-3 px-4">
                      {tierData.refresh}
                    </td>
                  )
                ))}
              </tr>
              <tr>
                <td className="py-3 px-4">Benchmark Metrics</td>
                {tiers.map(tierData => (
                  'basePrice' in tierData && (
                    <td key={tierData.id} className="text-center py-3 px-4">
                      {tierData.benchmarkMetrics}
                    </td>
                  )
                ))}
              </tr>
              <tr>
                <td className="py-3 px-4">Support</td>
                {tiers.map(tierData => (
                  'basePrice' in tierData && (
                    <td key={tierData.id} className="text-center py-3 px-4 text-xs">
                      {tierData.support}
                    </td>
                  )
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Special note for Core Pro */}
      {layer === 'core' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-6 p-4 bg-gradient-to-r from-purple-500/10 to-violet-500/10 rounded-lg border border-purple-500/30"
        >
          <p className="text-sm flex items-start gap-2">
            <Star className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
            <span>
              <strong>Portfolio Pricing Advantage:</strong> Core Pro becomes cheaper per location than Core Lite at 15+ locations 
              due to its lower per-location pricing ($39 vs $49).
            </span>
          </p>
        </motion.div>
      )}
    </div>
  );
}
