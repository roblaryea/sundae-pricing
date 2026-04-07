import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check, Star, ChevronRight, AlertCircle } from 'lucide-react';
import { modules, watchtower, crossIntelligence, getLocalizedTierCatalog, getLocalizedAddOnDisplay } from '../data/pricing';
import { PRODUCT_ICONS } from '../constants/icons';

// Get product icons from centralized mapping (per SUNDAE_ICON_MAPPING.md)
const { report: FileText, core: Zap, watchtower: Castle } = PRODUCT_ICONS;
import { getCoreProAdvantageMessage } from '../utils/pricingCalculators';
import { cn } from '../utils/cn';
import { getLocalizedFeatureComparisons } from '../data/featureComparisons';
import { getMarketingUrl } from '../config/legal';
import { FeatureComparisonTable } from '../components/PricingOverview/FeatureComparisonTable';
import { PricingFAQ } from '../components/Summary/PricingFAQ';
import { useLivePricingCatalog } from '../data/livePricing';
import { useLocale } from '../contexts/LocaleContext';
import { LivePricingGate } from '../components/shared/LivePricingGate';

type ProductTab = 'report' | 'core' | 'watchtower';

export function PricingOverview() {
  const navigate = useNavigate();
  const { locale, messages } = useLocale();
  const [activeTab, setActiveTab] = useState<ProductTab>('report');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const livePricing = useLivePricingCatalog();
  const overview = messages.overview;
  const catalog = messages.catalog;
  const localizedTiers = getLocalizedTierCatalog(locale);
  const localizedAddOns = getLocalizedAddOnDisplay(locale);
  const localizedComparisons = getLocalizedFeatureComparisons(locale);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const formatMessage = (template: string, values: Record<string, string | number>) =>
    Object.entries(values).reduce(
      (result, [key, value]) => result.replaceAll(`\${${key}}`, String(value)).replaceAll(`{${key}}`, String(value)),
      template,
    );

  const getTierColor = (tierId: string) => {
    const colors: Record<string, string> = {
      'report-lite': '#10B981',
      'report-plus': '#3B82F6',
      'report-pro': '#6366F1',
      'core-lite': '#8B5CF6',
      'core-pro': '#A855F7',
      'core-enterprise': '#F59E0B'
    };
    return colors[tierId] || '#3B82F6';
  };

  const getReportTierCatalog = (tierId: string) => {
    const shortId = tierId.split('-').pop() as 'lite' | 'plus' | 'pro';
    return localizedTiers.reportTiers[shortId];
  };

  const getCoreTierCatalog = (tierKey: 'lite' | 'pro' | 'enterprise') => localizedTiers.coreTiers[tierKey];

  return (
    <LivePricingGate state={livePricing}>
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12">
      {/* HERO */}
      <section className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">
          {overview.heroTitle}
        </h1>
        <p className="text-base md:text-lg text-sundae-muted max-w-2xl mx-auto mb-8">
          {overview.heroSubtitle}
        </p>
      </section>

      {/* PRODUCT TABS */}
      <div className="flex justify-center mb-12">
        <div className="inline-flex bg-sundae-surface rounded-lg p-1 border border-white/10">
          <button
            onClick={() => setActiveTab('report')}
            className={cn(
              'px-6 py-2 rounded-md text-sm font-semibold transition-all',
              activeTab === 'report'
                ? 'bg-gradient-primary text-white'
                : 'text-sundae-muted hover:text-white'
            )}
          >
            {overview.reportTab}
          </button>
          <button
            onClick={() => setActiveTab('core')}
            className={cn(
              'px-6 py-2 rounded-md text-sm font-semibold transition-all',
              activeTab === 'core'
                ? 'bg-gradient-primary text-white'
                : 'text-sundae-muted hover:text-white'
            )}
          >
            {overview.coreTab}
          </button>
          <button
            onClick={() => setActiveTab('watchtower')}
            className={cn(
              'px-6 py-2 rounded-md text-sm font-semibold transition-all',
              activeTab === 'watchtower'
                ? 'bg-gradient-primary text-white'
                : 'text-sundae-muted hover:text-white'
            )}
          >
            {overview.watchtowerTab}
          </button>
        </div>
      </div>

      {/* TIER CONTENT */}
      <AnimatePresence mode="wait">
      {activeTab === 'report' && (
        <motion.div
          key="report"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-2">
              <FileText className="w-8 h-8 text-green-400" />
              <h2 className="text-3xl md:text-4xl font-bold text-white">{overview.reportTitle}</h2>
            </div>
            <p className="text-sundae-muted">{overview.reportSubtitle}</p>
          </div>

          {/* Tier Cards - Matching Simulator Style */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {Object.values(localizedTiers.reportTiers).map((tier, index) => {
              const tierColor = getTierColor(tier.id);
              const isPopular = tier.id === 'report-plus';
              const tierCatalog = getReportTierCatalog(tier.id);

              return (
                <motion.div
                  key={tier.id}
                  className="relative"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  {isPopular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                      <div className="bg-gradient-primary text-white px-4 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                        <Star className="w-4 h-4" />
                        {overview.recommended}
                      </div>
                    </div>
                  )}

                  <div
                    className={cn(
                      'h-full p-6 rounded-xl border-2 transition-all hover:scale-[1.02] hover:shadow-lg',
                      isPopular
                        ? 'bg-gradient-to-br from-white/10 to-white/5 border-white/30'
                        : 'bg-sundae-surface border-white/10'
                    )}
                    style={{
                      borderColor: isPopular ? `${tierColor}50` : undefined,
                      boxShadow: isPopular ? `0 0 30px ${tierColor}30` : undefined
                    }}
                  >
                    {/* Header */}
                    <div className="mb-4">
                      <h3 className="text-2xl font-bold mb-1" style={{ color: tierColor }}>
                        {tierCatalog.name}
                      </h3>
                      <p className="text-sm text-sundae-muted">{tierCatalog.tagline}</p>
                    </div>

                    {/* Price */}
                    <div className="mb-6">
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-bold text-white tabular-nums">${tier.basePrice}</span>
                        <span className="text-sundae-muted">{overview.perMonth}</span>
                      </div>
                      {tier.additionalLocationPrice > 0 && (
                        <p className="text-sm text-sundae-muted mt-1">
                          {formatMessage(overview.perAdditionalLocation, { price: tier.additionalLocationPrice })}
                        </p>
                      )}
                    </div>

                    {/* Key Metrics */}
                    <div className="space-y-3 mb-6 pb-6 border-b border-white/10">
                        <div className="flex justify-between text-sm">
                        <span className="text-sundae-muted">{overview.aiCredits}</span>
                        <span className="font-semibold text-white">{tier.aiCredits.base}+</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-sundae-muted">{overview.visuals}</span>
                        <span className="font-semibold text-white">{tier.visuals}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-sundae-muted">{overview.dataRefresh}</span>
                        <span className="font-semibold text-white text-xs">{tier.refresh}</span>
                      </div>
                    </div>

                    {/* Features */}
                    <ul className="space-y-2 mb-6">
                      {tierCatalog.features.slice(0, 5).map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm">
                          <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-white">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {/* CTA */}
                    <button
                      onClick={() => navigate('/simulator')}
                      className="w-full flex items-center justify-center gap-2 text-sm font-semibold py-2"
                      style={{ color: tierColor }}
                    >
                      {formatMessage(overview.selectTier, { tier: tierCatalog.name })}
                      <ChevronRight className="w-4 h-4" />
                    </button>

                    {tier.bestFor && (
                      <p className="text-xs text-sundae-muted border-t border-white/10 pt-4 mt-4">
                        <strong>{overview.bestFor}</strong> {tierCatalog.bestFor}
                      </p>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Report Feature Comparison */}
          <CollapsibleSection
            title={overview.reportFeaturesComparison}
            isExpanded={expandedSections['report-features']}
            onToggle={() => toggleSection('report-features')}
          >
            <FeatureComparisonTable
              data={localizedComparisons.reportFeatureComparison}
              tierKeys={['lite', 'plus', 'pro']}
              tierLabels={[
                localizedTiers.reportTiers.lite.name,
                localizedTiers.reportTiers.plus.name,
                localizedTiers.reportTiers.pro.name,
              ]}
              tierColors={['#10B981', '#3B82F6', '#6366F1']}
            />
          </CollapsibleSection>
        </motion.div>
      )}

      {activeTab === 'core' && (
        <motion.div
          key="core"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-2">
              <Zap className="w-8 h-8 text-violet-400" />
              <h2 className="text-3xl md:text-4xl font-bold text-white">{overview.coreTitle}</h2>
            </div>
            <p className="text-sundae-muted">{overview.coreSubtitle}</p>
          </div>

          {/* Tier Cards - Matching Simulator Style */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {['lite', 'pro', 'enterprise'].map((tierKey, index) => {
              const tier = localizedTiers.coreTiers[tierKey as keyof typeof localizedTiers.coreTiers];
              const tierColor = getTierColor(`core-${tierKey}`);
              const isPopular = tierKey === 'pro';
              const tierCatalog = getCoreTierCatalog(tierKey as 'lite' | 'pro' | 'enterprise');

              return (
                <motion.div
                  key={tier.id}
                  className="relative"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  {isPopular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                      <div className="bg-gradient-primary text-white px-4 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                        <Star className="w-4 h-4" />
                        {overview.popular}
                      </div>
                    </div>
                  )}

                  <div
                    className={cn(
                      'h-full p-6 rounded-xl border-2 transition-all hover:scale-[1.02] hover:shadow-lg',
                      isPopular
                        ? 'bg-gradient-to-br from-white/10 to-white/5 border-white/30'
                        : 'bg-sundae-surface border-white/10'
                    )}
                    style={{
                      borderColor: isPopular ? `${tierColor}50` : undefined,
                      boxShadow: isPopular ? `0 0 30px ${tierColor}30` : undefined
                    }}
                  >
                    {/* Header */}
                    <div className="mb-4">
                      <h3 className="text-2xl font-bold mb-1" style={{ color: tierColor }}>
                        {tierCatalog.name}
                      </h3>
                      <p className="text-sm text-sundae-muted">{tierCatalog.tagline}</p>
                    </div>

                    {/* Price */}
                    <div className="mb-6">
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-bold text-white tabular-nums">
                          {typeof tier.basePrice === 'number' ? `$${tier.basePrice}` : tier.basePrice}
                        </span>
                        {typeof tier.basePrice === 'number' && <span className="text-sundae-muted">{overview.perMonth}</span>}
                      </div>
                      {typeof tier.additionalLocationPrice === 'number' && (
                        <p className="text-sm text-sundae-muted mt-1">
                          {formatMessage(overview.perAdditionalLocation, { price: tier.additionalLocationPrice })}
                        </p>
                      )}
                      {typeof tier.additionalLocationPrice === 'string' && (
                        <p className="text-sm text-sundae-muted mt-1">
                          {formatMessage(overview.pricingSuffix, { label: tier.additionalLocationPrice })}
                        </p>
                      )}
                    </div>

                    {/* Key Metrics */}
                    {tierKey !== 'enterprise' && (
                      <div className="space-y-3 mb-6 pb-6 border-b border-white/10">
                        <div className="flex justify-between text-sm">
                          <span className="text-sundae-muted">{overview.aiCredits}</span>
                          <span className="font-semibold text-white">{tier.aiCredits.base}+</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-sundae-muted">{overview.visuals}</span>
                          <span className="font-semibold text-white">{tier.visuals}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-sundae-muted">{overview.dataRefresh}</span>
                          <span className="font-semibold text-white text-xs">{tier.refresh}</span>
                        </div>
                      </div>
                    )}

                    {/* Features */}
                    <ul className="space-y-2 mb-6">
                      {tierCatalog.features.slice(0, 5).map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm">
                          <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-white">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {/* CTA */}
                    {tierKey === 'enterprise' ? (
                      <a
                        href={getMarketingUrl('/demo', locale)}
                        className="block w-full text-center py-2 text-sm font-semibold"
                        style={{ color: tierColor }}
                      >
                        {overview.contactSales}
                      </a>
                    ) : (
                      <button
                        onClick={() => navigate('/simulator')}
                        className="w-full flex items-center justify-center gap-2 text-sm font-semibold py-2"
                        style={{ color: tierColor }}
                      >
                        {formatMessage(overview.selectTier, { tier: tierCatalog.name })}
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    )}

                    {tier.bestFor && (
                      <p className="text-xs text-sundae-muted border-t border-white/10 pt-4 mt-4">
                        <strong>{overview.bestFor}</strong> {tierCatalog.bestFor}
                      </p>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Portfolio Pricing Advantage */}
          {(() => {
            const advantageMessage = getCoreProAdvantageMessage(locale);
            return advantageMessage ? (
              <div className="mb-8 p-4 bg-gradient-to-r from-purple-500/10 to-violet-500/10 rounded-lg border border-purple-500/30">
                <p className="text-sm flex items-start gap-2 text-white">
                  <Star className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                  <span>
                    <strong>{overview.portfolioPricingAdvantage}:</strong> {advantageMessage}
                  </span>
                </p>
              </div>
            ) : null;
          })()}

          {/* Core Feature Comparison */}
          <CollapsibleSection
            title={overview.coreFeaturesComparison}
            isExpanded={expandedSections['core-features']}
            onToggle={() => toggleSection('core-features')}
          >
            <FeatureComparisonTable
              data={localizedComparisons.coreFeatureComparison}
              tierKeys={['lite', 'pro', 'enterprise']}
              tierLabels={[
                localizedTiers.coreTiers.lite.name,
                localizedTiers.coreTiers.pro.name,
                localizedTiers.coreTiers.enterprise.name,
              ]}
              tierColors={['#8B5CF6', '#A855F7', '#F59E0B']}
            />
          </CollapsibleSection>

          {/* Module Add-ons for Core */}
          <div className="mb-8 p-6 rounded-xl border-2 border-violet-500/30 bg-gradient-to-br from-violet-500/10 to-purple-500/10" style={{ boxShadow: '0 0 30px rgba(139, 92, 246, 0.2)' }}>
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-violet-500/20 rounded-full border border-violet-500/30 mb-4">
                <Star className="w-4 h-4 text-violet-400" />
                <span className="text-sm font-semibold text-violet-300">{overview.addOnModulesEyebrow}</span>
              </div>
              <h3 className="text-2xl font-bold mb-2 text-white">{overview.moduleAddonsTitle}</h3>
              <p className="text-sundae-muted max-w-3xl mx-auto">
                {overview.moduleAddonsSubtitle}
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border border-white/10 rounded-xl overflow-hidden bg-sundae-surface/50">
                <thead>
                  <tr className="bg-violet-500/20 border-b border-violet-500/30">
                    <th className="text-left p-4 font-semibold text-white">{overview.module}</th>
                    <th className="text-right p-4 font-semibold text-white">{overview.orgLicense}</th>
                    <th className="text-right p-4 font-semibold text-white">{overview.perLocationFrom4}</th>
                    <th className="text-right p-4 font-semibold text-white">{overview.locations5}</th>
                    <th className="text-right p-4 font-semibold text-white">{overview.locations10}</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.values(modules).map((module, idx) => (
                    (() => {
                      const localizedModule = catalog.modules[module.id as keyof typeof catalog.modules];
                      return (
                    <tr
                      key={module.id}
                      className={cn(
                        'border-b border-white/5 last:border-b-0 hover:bg-white/5 transition-colors',
                        idx % 2 === 0 ? 'bg-white/5' : ''
                      )}
                    >
                      <td className="p-4">
                        <div>
                          <div className="font-semibold text-white">{localizedModule?.name ?? module.name}</div>
                          <div className="text-xs text-violet-300 mt-1">{localizedModule?.roi ?? module.roiPotential}</div>
                        </div>
                      </td>
                      <td className="text-right p-4 font-semibold text-violet-300">${module.orgLicensePrice}</td>
                      <td className="text-right p-4 text-white">${module.perLocationPrice}</td>
                      <td className="text-right p-4 font-semibold text-white">${module.orgLicensePrice + (module.perLocationPrice * 2)}</td>
                      <td className="text-right p-4 font-semibold text-white">
                        ${module.orgLicensePrice + (module.perLocationPrice * 7)}
                      </td>
                    </tr>
                      );
                    })()
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Cross-Intelligence Correlation Engine */}
          <div className="mb-8 p-6 rounded-xl border-2 border-purple-500/30 bg-gradient-to-br from-purple-500/10 to-cyan-500/10" style={{ boxShadow: '0 0 30px rgba(168, 85, 247, 0.15)' }}>
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/20 rounded-full border border-purple-500/30 mb-4">
                <Star className="w-4 h-4 text-purple-400" />
                <span className="text-sm font-semibold text-purple-300">{overview.crossIntelligenceEyebrow}</span>
              </div>
              <h3 className="text-2xl font-bold mb-2 text-white">{overview.crossIntelligenceTitle}</h3>
              <p className="text-sundae-muted max-w-3xl mx-auto">
                {overview.crossIntelligenceSubtitle}
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Base tier */}
              <div className="p-5 rounded-xl bg-sundae-surface border border-purple-500/20">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold text-lg text-white">{catalog.crossIntelligence.base.name}</h4>
                  <span className="px-3 py-1 bg-green-500/20 text-green-400 text-sm font-semibold rounded-full">{overview.free}</span>
                </div>
                <p className="text-sm text-sundae-muted mb-4">{overview.autoEnabledWithThreeModules}</p>
                <ul className="space-y-2">
                  {localizedAddOns.crossIntelligence.base.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                      <span className="text-white">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Pro tier */}
              <div className="p-5 rounded-xl bg-gradient-to-br from-purple-500/10 to-cyan-500/10 border-2 border-purple-500/40 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-cyan-500" />
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-bold text-lg text-white">{catalog.crossIntelligence.pro.name}</h4>
                  <span className="px-3 py-1 bg-purple-500/20 text-purple-300 text-sm font-semibold rounded-full">{overview.pro}</span>
                </div>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-2xl font-bold text-white">${crossIntelligence.pro.monthlyFee}</span>
                  <span className="text-sundae-muted">{overview.perMonth}</span>
                </div>
                <p className="text-xs text-sundae-muted mb-4">
                  {formatMessage(overview.perLocationFrom2, { price: crossIntelligence.pro.perLocationPrice })}
                </p>
                <ul className="space-y-2">
                  {localizedAddOns.crossIntelligence.pro.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                      <span className="text-white">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {activeTab === 'watchtower' && (
        <motion.div
          key="watchtower"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-2">
              <Castle className="w-8 h-8 text-red-400" />
              <h2 className="text-3xl md:text-4xl font-bold text-white">{overview.watchtowerTitle}</h2>
            </div>
            <p className="text-sundae-muted">{overview.watchtowerSubtitle}</p>
          </div>

          {/* Tier Cards - Matching Simulator Style */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {Object.values(watchtower).map((item) => {
              const isBundle = item.id === 'bundle';
              const watchtowerItem = catalog.watchtower[item.id as keyof typeof catalog.watchtower];
              const tierColors: Record<string, string> = {
                'competitive': '#EF4444',
                'events': '#F59E0B',
                'trends': '#3B82F6',
                'bundle': '#8B5CF6'
              };
              const tierColor = tierColors[item.id] || '#EF4444';
              
              return (
                <div key={item.id} className="relative">
                  {isBundle && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                      <div className="bg-gradient-primary text-white px-4 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                        <Star className="w-4 h-4" />
                        {overview.bestValue}
                      </div>
                    </div>
                  )}

                  <div
                    className={cn(
                      'h-full p-6 rounded-xl border-2 transition-all',
                      isBundle
                        ? 'bg-gradient-to-br from-white/10 to-white/5 border-white/30'
                        : 'bg-sundae-surface border-white/10'
                    )}
                    style={{
                      borderColor: isBundle ? `${tierColor}50` : undefined,
                      boxShadow: isBundle ? `0 0 30px ${tierColor}30` : undefined
                    }}
                  >
                    {/* Header */}
                    <div className="mb-4">
                      <h3 className="text-2xl font-bold mb-1" style={{ color: tierColor }}>
                        {watchtowerItem?.name ?? item.name}
                      </h3>
                      <p className="text-sm text-sundae-muted">
                        {watchtowerItem?.value ?? watchtowerItem?.description ?? (item.valueProposition || item.description)}
                      </p>
                    </div>

                    {/* Price */}
                    <div className="mb-6">
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-bold text-white tabular-nums">${item.basePrice}</span>
                        <span className="text-sundae-muted">{overview.perMonth}</span>
                      </div>
                      {!isBundle && (
                        <p className="text-sm text-sundae-muted mt-1">
                          {formatMessage(overview.perAdditionalLocation, { price: item.perLocationPrice })}
                        </p>
                      )}
                      {isBundle && 'perLocationPrice' in item && (
                        <p className="text-sm text-sundae-muted mt-1">
                          {formatMessage(overview.perAdditionalLocation, { price: item.perLocationPrice })}
                        </p>
                      )}
                    </div>

                    {/* Key Metrics */}
                    <div className="space-y-3 mb-6 pb-6 border-b border-white/10">
                      <div className="flex justify-between text-sm">
                        <span className="text-sundae-muted">{overview.locationOne}</span>
                        <span className="font-semibold text-white">${item.basePrice}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-sundae-muted">{overview.locations5}</span>
                        <span className="font-semibold text-white">
                          ${item.basePrice + (item.perLocationPrice * 4)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-sundae-muted">{overview.locations10}</span>
                        <span className="font-semibold text-white">
                          ${item.basePrice + (item.perLocationPrice * 9)}
                        </span>
                      </div>
                    </div>

                    {/* Bundle Savings Badge */}
                    {isBundle && 'baseSavings' in item && (
                      <div className="mb-4 p-3 bg-gradient-to-r from-purple-500/20 to-violet-500/20 rounded-lg border border-purple-500/30">
                        <p className="text-xs font-semibold text-purple-300 text-center">
                          {formatMessage(overview.savePerMonth, {
                            amount: item.baseSavings,
                            percent: item.savingsPercent,
                          })}
                        </p>
                      </div>
                    )}

                    {/* CTA */}
                    <button
                      onClick={() => navigate('/simulator')}
                      className="w-full flex items-center justify-center gap-2 text-sm font-semibold py-2"
                      style={{ color: tierColor }}
                    >
                      {formatMessage(overview.selectTier, { tier: watchtowerItem?.name ?? item.name })}
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Strategic Value Disclaimer - Moved below pricing */}
          <div className="mb-8 p-4 bg-amber-500/10 rounded-lg border border-amber-500/30 flex gap-3">
            <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-sundae-muted">
              <strong className="text-white">{overview.strategicValueTitle}</strong> {overview.strategicValueDisclaimer}
            </div>
          </div>
        </motion.div>
      )}
      </AnimatePresence>

      {/* FAQ */}
      <CollapsibleSection
        title={messages.faq.title}
        isExpanded={expandedSections['faq']}
        onToggle={() => toggleSection('faq')}
      >
        <div className="pt-2">
          <PricingFAQ category={activeTab} />
        </div>
      </CollapsibleSection>

      {/* PRICING EFFECTIVE NOTE */}
      <div className="text-center text-sm text-sundae-muted border-t border-white/10 pt-8 mt-12">
        <p>
          {formatMessage(messages.summary.pricingFooterNote, {
            date: new Intl.DateTimeFormat(locale, { dateStyle: 'long' }).format(new Date('2026-02-26T00:00:00Z')),
          })}. {messages.summary.taxNote}. {messages.summary.changeNotice}.
        </p>
      </div>
    </div>
    </LivePricingGate>
  );
}

interface CollapsibleSectionProps {
  title: string;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

function CollapsibleSection({ title, isExpanded, onToggle, children }: CollapsibleSectionProps) {
  return (
    <div className="border border-white/10 rounded-xl overflow-hidden bg-white/5 mb-4">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-6 hover:bg-white/5 transition-colors"
      >
        <h3 className="text-xl font-bold text-white">{title}</h3>
        <ChevronDown
          className={cn(
            'w-5 h-5 text-white transition-transform',
            isExpanded && 'rotate-180'
          )}
        />
      </button>
      
      {isExpanded && (
        <div className="px-6 pb-6">
          {children}
        </div>
      )}
    </div>
  );
}
