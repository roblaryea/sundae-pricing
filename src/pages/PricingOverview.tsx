import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, Check, Star, ChevronRight, AlertCircle } from 'lucide-react';
import { reportTiers, coreTiers, modules, watchtower, pricingFooter } from '../data/pricing';
import { PRODUCT_ICONS } from '../constants/icons';

// Get product icons from centralized mapping (per SUNDAE_ICON_MAPPING.md)
const { report: FileText, core: Zap, watchtower: Castle } = PRODUCT_ICONS;
import { getCoreProAdvantageMessage } from '../utils/pricingCalculators';
import { cn } from '../utils/cn';
import { reportFeatureComparison, coreFeatureComparison } from '../data/featureComparisons';
import { FeatureComparisonTable } from '../components/PricingOverview/FeatureComparisonTable';

type ProductTab = 'report' | 'core' | 'watchtower';

export function PricingOverview() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<ProductTab>('report');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

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

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12">
      {/* HERO */}
      <section className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">
          Simple, Transparent Pricing
        </h1>
        <p className="text-base md:text-lg text-sundae-muted max-w-2xl mx-auto mb-8">
          Start free, scale as you grow. No hidden fees, no surprises.
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
            Report
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
            Core
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
            Watchtower
          </button>
        </div>
      </div>

      {/* REPORT TIER */}
      {activeTab === 'report' && (
        <div>
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-2">
              <FileText className="w-8 h-8 text-green-400" />
              <h2 className="text-3xl md:text-4xl font-bold text-white">Sundae Report</h2>
            </div>
            <p className="text-sundae-muted">Analytics and insights for restaurant data</p>
          </div>

          {/* Tier Cards - Matching Simulator Style */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {Object.values(reportTiers).map((tier) => {
              const tierColor = getTierColor(tier.id);
              const isPopular = tier.id === 'report-plus';

              return (
                <div key={tier.id} className="relative">
                  {isPopular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                      <div className="bg-gradient-primary text-white px-4 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                        <Star className="w-4 h-4" />
                        RECOMMENDED
                      </div>
                    </div>
                  )}

                  <div
                    className={cn(
                      'h-full p-6 rounded-xl border-2 transition-all',
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
                        {tier.name}
                      </h3>
                      <p className="text-sm text-sundae-muted">{tier.tagline}</p>
                    </div>

                    {/* Price */}
                    <div className="mb-6">
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-bold text-white tabular-nums">${tier.basePrice}</span>
                        <span className="text-sundae-muted">/mo</span>
                      </div>
                      {tier.additionalLocationPrice > 0 && (
                        <p className="text-sm text-sundae-muted mt-1">
                          +${tier.additionalLocationPrice} per additional location
                        </p>
                      )}
                    </div>

                    {/* Key Metrics */}
                    <div className="space-y-3 mb-6 pb-6 border-b border-white/10">
                      <div className="flex justify-between text-sm">
                        <span className="text-sundae-muted">AI Credits</span>
                        <span className="font-semibold text-white">{tier.aiCredits.base}+</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-sundae-muted">Visuals</span>
                        <span className="font-semibold text-white">{tier.visuals}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-sundae-muted">Data Refresh</span>
                        <span className="font-semibold text-white text-xs">{tier.refresh}</span>
                      </div>
                    </div>

                    {/* Features */}
                    <ul className="space-y-2 mb-6">
                      {tier.features.slice(0, 5).map((feature, idx) => (
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
                      Select {tier.name}
                      <ChevronRight className="w-4 h-4" />
                    </button>

                    {tier.bestFor && (
                      <p className="text-xs text-sundae-muted border-t border-white/10 pt-4 mt-4">
                        <strong>Best for:</strong> {tier.bestFor}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Report Feature Comparison */}
          <CollapsibleSection
            title="Report Features Comparison"
            isExpanded={expandedSections['report-features']}
            onToggle={() => toggleSection('report-features')}
          >
            <FeatureComparisonTable
              data={reportFeatureComparison}
              tierKeys={['lite', 'plus', 'pro']}
              tierLabels={['Report Lite', 'Report Plus', 'Report Pro']}
              tierColors={['#10B981', '#3B82F6', '#6366F1']}
            />
          </CollapsibleSection>
        </div>
      )}

      {/* CORE TIER */}
      {activeTab === 'core' && (
        <div>
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-2">
              <Zap className="w-8 h-8 text-violet-400" />
              <h2 className="text-3xl md:text-4xl font-bold text-white">Sundae Core</h2>
            </div>
            <p className="text-sundae-muted">Real-time operations with POS integration</p>
          </div>

          {/* Tier Cards - Matching Simulator Style */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {['lite', 'pro', 'enterprise'].map((tierKey) => {
              const tier = coreTiers[tierKey as keyof typeof coreTiers];
              const tierColor = getTierColor(`core-${tierKey}`);
              const isPopular = tierKey === 'pro';

              return (
                <div key={tier.id} className="relative">
                  {isPopular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                      <div className="bg-gradient-primary text-white px-4 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                        <Star className="w-4 h-4" />
                        POPULAR
                      </div>
                    </div>
                  )}

                  <div
                    className={cn(
                      'h-full p-6 rounded-xl border-2 transition-all',
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
                        {tier.name}
                      </h3>
                      <p className="text-sm text-sundae-muted">{tier.tagline}</p>
                    </div>

                    {/* Price */}
                    <div className="mb-6">
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-bold text-white tabular-nums">
                          {typeof tier.basePrice === 'number' ? `$${tier.basePrice}` : tier.basePrice}
                        </span>
                        {typeof tier.basePrice === 'number' && <span className="text-sundae-muted">/mo</span>}
                      </div>
                      {typeof tier.additionalLocationPrice === 'number' && (
                        <p className="text-sm text-sundae-muted mt-1">
                          +${tier.additionalLocationPrice} per additional location
                        </p>
                      )}
                      {typeof tier.additionalLocationPrice === 'string' && (
                        <p className="text-sm text-sundae-muted mt-1">{tier.additionalLocationPrice} pricing</p>
                      )}
                    </div>

                    {/* Key Metrics */}
                    {tierKey !== 'enterprise' && (
                      <div className="space-y-3 mb-6 pb-6 border-b border-white/10">
                        <div className="flex justify-between text-sm">
                          <span className="text-sundae-muted">AI Credits</span>
                          <span className="font-semibold text-white">{tier.aiCredits.base}+</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-sundae-muted">Visuals</span>
                          <span className="font-semibold text-white">{tier.visuals}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-sundae-muted">Data Refresh</span>
                          <span className="font-semibold text-white text-xs">{tier.refresh}</span>
                        </div>
                      </div>
                    )}

                    {/* Features */}
                    <ul className="space-y-2 mb-6">
                      {tier.features.slice(0, 5).map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm">
                          <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-white">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {/* CTA */}
                    {tierKey === 'enterprise' ? (
                      <a
                        href="https://sundae.io/demo"
                        className="block w-full text-center py-2 text-sm font-semibold"
                        style={{ color: tierColor }}
                      >
                        Contact Sales
                      </a>
                    ) : (
                      <button
                        onClick={() => navigate('/simulator')}
                        className="w-full flex items-center justify-center gap-2 text-sm font-semibold py-2"
                        style={{ color: tierColor }}
                      >
                        Select {tier.name}
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    )}

                    {tier.bestFor && (
                      <p className="text-xs text-sundae-muted border-t border-white/10 pt-4 mt-4">
                        <strong>Best for:</strong> {tier.bestFor}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Portfolio Pricing Advantage */}
          {(() => {
            const advantageMessage = getCoreProAdvantageMessage();
            return advantageMessage ? (
              <div className="mb-8 p-4 bg-gradient-to-r from-purple-500/10 to-violet-500/10 rounded-lg border border-purple-500/30">
                <p className="text-sm flex items-start gap-2 text-white">
                  <Star className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                  <span>
                    <strong>Portfolio Pricing Advantage:</strong> {advantageMessage}
                  </span>
                </p>
              </div>
            ) : null;
          })()}

          {/* Core Feature Comparison */}
          <CollapsibleSection
            title="Core Features Comparison"
            isExpanded={expandedSections['core-features']}
            onToggle={() => toggleSection('core-features')}
          >
            <FeatureComparisonTable
              data={coreFeatureComparison}
              tierKeys={['lite', 'pro', 'enterprise']}
              tierLabels={['Core Lite', 'Core Pro', 'Enterprise']}
              tierColors={['#8B5CF6', '#A855F7', '#F59E0B']}
            />
          </CollapsibleSection>

          {/* Module Add-ons for Core */}
          <div className="mb-8 p-6 rounded-xl border-2 border-violet-500/30 bg-gradient-to-br from-violet-500/10 to-purple-500/10" style={{ boxShadow: '0 0 30px rgba(139, 92, 246, 0.2)' }}>
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-violet-500/20 rounded-full border border-violet-500/30 mb-4">
                <Star className="w-4 h-4 text-violet-400" />
                <span className="text-sm font-semibold text-violet-300">ADD-ON MODULES</span>
              </div>
              <h3 className="text-2xl font-bold mb-2 text-white">Module Add-ons for Core</h3>
              <p className="text-sundae-muted max-w-3xl mx-auto">
                Add specialized intelligence to Core tier. Org license covers locations 1-5, then per-location from #6+
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border border-white/10 rounded-xl overflow-hidden bg-sundae-surface/50">
                <thead>
                  <tr className="bg-violet-500/20 border-b border-violet-500/30">
                    <th className="text-left p-4 font-semibold text-white">Module</th>
                    <th className="text-right p-4 font-semibold text-white">Org License</th>
                    <th className="text-right p-4 font-semibold text-white">Per Location (#6+)</th>
                    <th className="text-right p-4 font-semibold text-white">5 Locations</th>
                    <th className="text-right p-4 font-semibold text-white">10 Locations</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.values(modules).map((module, idx) => (
                    <tr 
                      key={module.id} 
                      className={cn(
                        'border-b border-white/5 last:border-b-0 hover:bg-white/5 transition-colors',
                        idx % 2 === 0 ? 'bg-white/5' : ''
                      )}
                    >
                      <td className="p-4">
                        <div>
                          <div className="font-semibold text-white">{module.name}</div>
                          <div className="text-xs text-violet-300 mt-1">{module.roiPotential}</div>
                        </div>
                      </td>
                      <td className="text-right p-4 font-semibold text-violet-300">${module.orgLicensePrice}</td>
                      <td className="text-right p-4 text-white">${module.perLocationPrice}</td>
                      <td className="text-right p-4 font-semibold text-white">${module.orgLicensePrice}</td>
                      <td className="text-right p-4 font-semibold text-white">
                        ${module.orgLicensePrice + (module.perLocationPrice * 5)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* WATCHTOWER */}
      {activeTab === 'watchtower' && (
        <div>
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-2">
              <Castle className="w-8 h-8 text-red-400" />
              <h2 className="text-3xl md:text-4xl font-bold text-white">Sundae Watchtower</h2>
            </div>
            <p className="text-sundae-muted">Track competitors, events, and market trends</p>
          </div>

          {/* Tier Cards - Matching Simulator Style */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {Object.values(watchtower).map((item) => {
              const isBundle = item.id === 'bundle';
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
                        BEST VALUE
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
                        {item.name}
                      </h3>
                      <p className="text-sm text-sundae-muted">{item.valueProposition || item.description}</p>
                    </div>

                    {/* Price */}
                    <div className="mb-6">
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-bold text-white tabular-nums">${item.basePrice}</span>
                        <span className="text-sundae-muted">/mo</span>
                      </div>
                      {!isBundle && (
                        <p className="text-sm text-sundae-muted mt-1">
                          +${item.perLocationPrice} per additional location
                        </p>
                      )}
                      {isBundle && 'perLocationPrice' in item && (
                        <p className="text-sm text-sundae-muted mt-1">
                          +${item.perLocationPrice} per additional location
                        </p>
                      )}
                    </div>

                    {/* Key Metrics */}
                    <div className="space-y-3 mb-6 pb-6 border-b border-white/10">
                      <div className="flex justify-between text-sm">
                        <span className="text-sundae-muted">1 location</span>
                        <span className="font-semibold text-white">${item.basePrice}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-sundae-muted">5 locations</span>
                        <span className="font-semibold text-white">
                          ${item.basePrice + (item.perLocationPrice * 4)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-sundae-muted">10 locations</span>
                        <span className="font-semibold text-white">
                          ${item.basePrice + (item.perLocationPrice * 9)}
                        </span>
                      </div>
                    </div>

                    {/* Bundle Savings Badge */}
                    {isBundle && 'baseSavings' in item && (
                      <div className="mb-4 p-3 bg-gradient-to-r from-purple-500/20 to-violet-500/20 rounded-lg border border-purple-500/30">
                        <p className="text-xs font-semibold text-purple-300 text-center">
                          Save ${item.baseSavings}/mo ({item.savingsPercent}%)
                        </p>
                      </div>
                    )}

                    {/* CTA */}
                    <button
                      onClick={() => navigate('/simulator')}
                      className="w-full flex items-center justify-center gap-2 text-sm font-semibold py-2"
                      style={{ color: tierColor }}
                    >
                      Select {item.name}
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
              <strong className="text-white">Strategic value estimates</strong> based on typical scenarios. Actual impact depends on market conditions, competitive landscape, and actions taken on insights. Unlike operational savings, strategic value is opportunistic — it materializes when opportunities arise and you act on them.
            </div>
          </div>
        </div>
      )}

      {/* FAQ */}
      <CollapsibleSection
        title="Frequently Asked Questions"
        isExpanded={expandedSections['faq']}
        onToggle={() => toggleSection('faq')}
      >
        <div className="pt-6 space-y-6">
          <div>
            <h4 className="font-semibold mb-2 text-white">What's included in the base price?</h4>
            <p className="text-sm text-sundae-muted">
              The base price includes your first location. Additional locations are charged from location #2 onward.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-2 text-white">Can I switch tiers later?</h4>
            <p className="text-sm text-sundae-muted">
              Yes! You can upgrade or downgrade anytime. Upgrades are instant, downgrades take effect at the next billing cycle.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-2 text-white">What POS systems do you integrate with?</h4>
            <p className="text-sm text-sundae-muted">
              We integrate with all major POS systems including Toast, Square, Clover, Lightspeed, and more. Custom integrations available for Enterprise.
            </p>
          </div>
        </div>
      </CollapsibleSection>

      {/* PRICING EFFECTIVE NOTE */}
      <div className="text-center text-sm text-sundae-muted border-t border-white/10 pt-8 mt-12">
        <p>
          Pricing effective {pricingFooter.effectiveDate}. {pricingFooter.taxNote}. {pricingFooter.changeNotice}.
        </p>
      </div>
    </div>
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
