// Tier selector with feature comparison component

import { motion } from 'framer-motion';
import { Check, Star, TrendingUp, ChevronRight } from 'lucide-react';
import { useConfiguration } from '../../hooks/useConfiguration';
import { getLocalizedTierCatalog } from '../../data/pricing';
import { suggestOptimalTier } from '../../hooks/usePriceCalculation';
import { getCoreProAdvantageMessage } from '../../utils/pricingCalculators';
import { useLivePricingCatalog } from '../../data/livePricing';
import { useLocale } from '../../contexts/LocaleContext';

export function TierSelector() {
  const { layer, setTier, locations, setCurrentStep } = useConfiguration();
  const { locale, messages } = useLocale();
  useLivePricingCatalog();
  const copy = messages.builder.tierSelector;
  const localizedTiers = getLocalizedTierCatalog(locale);

  if (!layer) {
    // Shouldn't happen, but handle gracefully
    setCurrentStep(1);
    return null;
  }

  const tiers = layer === 'report' 
    ? Object.values(localizedTiers.reportTiers)
    : Object.values(localizedTiers.coreTiers).filter(t => typeof t === 'object' && 'basePrice' in t);

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

  const formatMessage = (template: string, values: Record<string, string | number>) =>
    Object.entries(values).reduce(
      (result, [key, value]) => result.replaceAll(`\${${key}}`, String(value)).replaceAll(`{${key}}`, String(value)),
      template,
    );

  const getTierCatalog = (tierId: string) => {
    const shortId = tierId.split('-').pop() as 'lite' | 'plus' | 'pro' | 'enterprise';
    return layer === 'report' ? localizedTiers.reportTiers[shortId as 'lite' | 'plus' | 'pro'] : localizedTiers.coreTiers[shortId as 'lite' | 'pro' | 'enterprise'];
  };

  return (
    <div className="max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl font-bold mb-4">
          {layer === 'report' ? copy.chooseReportTier : copy.chooseCoreTier}
        </h1>
        <p className="text-xl text-sundae-muted">
          {layer === 'report' 
            ? copy.reportSubtitle
            : copy.coreSubtitle}
        </p>
      </motion.div>

      {/* Tier cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {tiers.map((tierData, index) => {
          if (!('basePrice' in tierData)) return null;
          
          const isOptimal = tierData.id.includes(optimalTier);
          const tierColor = getTierColor(tierData.id);
          const tierCatalog = getTierCatalog(tierData.id);

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
                  <div className="bg-gradient-primary text-white px-4 py-1 rounded-full text-sm font-bold flex items-center gap-1 shimmer">
                    <Star className="w-4 h-4" />
                    {copy.recommended}
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
                whileHover={{
                  boxShadow: `0 20px 40px ${tierColor}30`,
                }}
              >
                <div className="text-left">
                  {/* Header */}
                  <div className="mb-4">
                    <h3 className="text-2xl font-bold mb-1" style={{ color: tierColor }}>
                      {tierCatalog?.name ?? tierData.name}
                    </h3>
                    <p className="text-sm text-sundae-muted">{tierCatalog?.tagline ?? tierData.tagline}</p>
                  </div>

                  {/* Price */}
                  <div className="mb-6">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold tabular-nums">
                        {typeof tierData.basePrice === 'number' ? `$${tierData.basePrice}` : tierData.basePrice}
                      </span>
                      {typeof tierData.basePrice === 'number' && <span className="text-sundae-muted">{copy.perMonth}</span>}
                    </div>
                    {typeof tierData.additionalLocationPrice === 'number' && tierData.additionalLocationPrice > 0 && (
                      <p className="text-sm text-sundae-muted mt-1">
                        {formatMessage(copy.perAdditionalLocation, { price: tierData.additionalLocationPrice })}
                      </p>
                    )}
                    {typeof tierData.additionalLocationPrice === 'string' && (
                      <p className="text-sm text-sundae-muted mt-1">
                        {formatMessage(copy.pricingSuffix, { label: tierData.additionalLocationPrice })}
                      </p>
                    )}
                  </div>

                  {/* Key metrics */}
                  <div className="space-y-3 mb-6 pb-6 border-b border-white/10">
                    <div className="flex justify-between text-sm">
                      <span className="text-sundae-muted">{copy.aiCredits}</span>
                      <span className="font-semibold">
                        {tierData.aiCredits.base}+
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-sundae-muted">{copy.visuals}</span>
                      <span className="font-semibold">{tierData.visuals}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-sundae-muted">{copy.dataRefresh}</span>
                      <span className="font-semibold">{tierData.refresh}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-sundae-muted">{copy.benchmark}</span>
                      <span className="font-semibold">{tierData.benchmarkMetrics} {copy.metrics}</span>
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
                    {formatMessage(copy.selectTier, { tier: tierCatalog?.name ?? tierData.name })}
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
          {copy.detailedFeatureComparison}
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-2 px-4">{copy.feature}</th>
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
                <td className="py-3 px-4">{copy.monthlyPrice}</td>
                {tiers.map(tierData => (
                  'basePrice' in tierData && (
                    <td key={tierData.id} className="text-center py-3 px-4">
                      ${tierData.basePrice}
                    </td>
                  )
                ))}
              </tr>
              <tr>
                <td className="py-3 px-4">{copy.aiCredits}</td>
                {tiers.map(tierData => (
                  'basePrice' in tierData && (
                    <td key={tierData.id} className="text-center py-3 px-4">
                      {tierData.aiCredits.base}
                    </td>
                  )
                ))}
              </tr>
              <tr>
                <td className="py-3 px-4">{copy.dataRefresh}</td>
                {tiers.map(tierData => (
                  'basePrice' in tierData && (
                    <td key={tierData.id} className="text-center py-3 px-4">
                      {tierData.refresh}
                    </td>
                  )
                ))}
              </tr>
              <tr>
                <td className="py-3 px-4">{copy.benchmarkMetrics}</td>
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

      {/* Special note for Core Pro - DYNAMIC calculation */}
      {layer === 'core' && (() => {
        const advantageMessage = getCoreProAdvantageMessage();
        return advantageMessage ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-6 p-4 bg-gradient-to-r from-purple-500/10 to-violet-500/10 rounded-lg border border-purple-500/30"
          >
            <p className="text-sm flex items-start gap-2">
              <Star className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
              <span>
                <strong>{messages.overview.portfolioPricingAdvantage}:</strong> {advantageMessage}
              </span>
            </p>
          </motion.div>
        ) : null;
      })()}
    </div>
  );
}
