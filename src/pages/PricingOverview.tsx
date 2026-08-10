import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check, Star, ChevronRight, AlertCircle, Lock } from 'lucide-react';
import {
  modules as coreDomainModules,
  corePackages,
  CORE_PACKAGE_IDS,
  conceptSkus,
  CONCEPT_SKU_IDS,
  foresightAction,
  implementationClasses,
  IMPLEMENTATION_CLASS_ORDER,
  volumeDiscounts,
  billingDiscounts,
  DISCOUNT_RULES,
  watchtower,
  crossIntelligence,
  crewSkus,
  crewBundles,
  getLocalizedTierCatalog,
  getLocalizedAddOnDisplay,
} from '../data/pricing';
import type { CorePackageId } from '../data/pricing';
import { calculateBandedTotal, calculateBandLines } from '../lib/pricingEngine';
import { PRODUCT_ICONS } from '../constants/icons';

// Get product icons from centralized mapping (per SUNDAE_ICON_MAPPING.md)
const { core: Zap, watchtower: Castle, crew: Users } = PRODUCT_ICONS;
import { cn } from '../utils/cn';
import { getMarketingUrl } from '../config/legal';
import { PricingFAQ } from '../components/Summary/PricingFAQ';
import { useLivePricingCatalog } from '../data/livePricing';
import { useLocale } from '../contexts/LocaleContext';
import { LivePricingGate } from '../components/shared/LivePricingGate';

// The Report layer was retired with price book v1.7 and has no tab here.
type ProductTab = 'core' | 'watchtower' | 'crew';

const PACKAGE_COLORS: Record<CorePackageId, string> = {
  core_foundation: '#E9A24A',
  core_margin: '#FF7E6F',
  core_growth: '#FF5C4D',
  core_performance: '#C2410C',
};

// Illustrative unit counts for the "what does this cost at scale" strip. The
// numbers are computed with marginal bands, never a flat per-location rate.
const SCALE_POINTS = [1, 5, 25, 60];

export function PricingOverview() {
  const navigate = useNavigate();
  const { locale, messages } = useLocale();
  // v1.7: Core is the default and first tab — the retired Report layer used to
  // be the default here, which meant the page opened on an unsellable product.
  const [activeTab, setActiveTab] = useState<ProductTab>('core');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const livePricing = useLivePricingCatalog();
  const overview = messages.overview;
  const catalog = messages.catalog;
  const localizedTiers = getLocalizedTierCatalog(locale);
  const localizedAddOns = getLocalizedAddOnDisplay(locale);

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const formatMessage = (template: string, values: Record<string, string | number>) =>
    Object.entries(values).reduce(
      (result, [key, value]) =>
        result.replaceAll(`\${${key}}`, String(value)).replaceAll(`{${key}}`, String(value)),
      template,
    );

  const fmt = (value: number) => `$${value.toLocaleString(locale)}`;

  const packages = CORE_PACKAGE_IDS.map((id) => corePackages[id]);
  const enterprise = localizedTiers.coreEnterprise;

  return (
    <LivePricingGate state={livePricing}>
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12">
        {/* HERO */}
        <section className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">{overview.heroTitle}</h1>
          <p className="text-base md:text-lg text-sundae-muted max-w-2xl mx-auto mb-8">
            {overview.heroSubtitle}
          </p>
        </section>

        {/* PRODUCT TABS */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex bg-sundae-surface rounded-lg p-1 border border-white/10">
            {(
              [
                ['core', overview.coreTab],
                ['watchtower', overview.watchtowerTab],
                ['crew', overview.crewTab],
              ] as [ProductTab, string][]
            ).map(([id, label]) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                data-testid={`pricing-tab-${id}`}
                className={cn(
                  'px-6 py-2 rounded-md text-sm font-semibold transition-all',
                  activeTab === id
                    ? 'bg-gradient-primary text-white'
                    : 'text-sundae-muted hover:text-white',
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
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
                  <Zap className="w-8 h-8 text-[#C2410C]" />
                  <h2 className="text-3xl md:text-4xl font-bold text-white">
                    {overview.coreTitle}
                  </h2>
                </div>
                <p className="text-sundae-muted">{overview.coreSubtitle}</p>
              </div>

              {/* How unit pricing works — the mechanic operators get wrong */}
              <div className="mb-10 mx-auto max-w-3xl p-5 rounded-xl border border-[#E9A24A]/30 bg-gradient-to-r from-[#E9A24A]/10 to-[#C2410C]/10">
                <h3 className="font-bold text-white mb-2">How unit pricing works</h3>
                <p className="text-sm text-sundae-muted">
                  Your first location is priced at the package anchor. Every location after that is
                  priced by band, and <strong className="text-white">bands are marginal</strong> —
                  moving into a cheaper band never reprices the locations you already have. No
                  package includes a location allowance.
                </p>
                <p className="text-sm text-sundae-muted mt-2">
                  Example: 5 locations on {corePackages.core_foundation.name} ={' '}
                  {fmt(corePackages.core_foundation.firstUnitPrice)} + 4 ×{' '}
                  {fmt(corePackages.core_foundation.marginalBands[0].pricePerUnit)} ={' '}
                  <strong className="text-white">
                    {fmt(calculateBandedTotal(corePackages.core_foundation, 5))}/mo
                  </strong>{' '}
                  — an average of{' '}
                  {fmt(Math.round(calculateBandedTotal(corePackages.core_foundation, 5) / 5))} per
                  location.
                </p>
              </div>

              {/* Package cards */}
              <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6 mb-12">
                {packages.map((pkg, index) => {
                  const color = PACKAGE_COLORS[pkg.id];
                  const isPopular = pkg.id === 'core_growth';

                  return (
                    <motion.div
                      key={pkg.id}
                      className="relative"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: index * 0.08 }}
                    >
                      {isPopular && (
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                          <div className="bg-gradient-primary text-white px-4 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                            <Star className="w-3.5 h-3.5" />
                            {overview.popular}
                          </div>
                        </div>
                      )}

                      <div
                        className={cn(
                          'h-full p-6 rounded-xl border-2 transition-all hover:scale-[1.02] hover:shadow-lg',
                          isPopular
                            ? 'bg-gradient-to-br from-white/10 to-white/5 border-white/30'
                            : 'bg-sundae-surface border-white/10',
                        )}
                        style={{
                          borderColor: isPopular ? `${color}50` : undefined,
                          boxShadow: isPopular ? `0 0 30px ${color}30` : undefined,
                        }}
                      >
                        <div className="mb-4">
                          <h3 className="text-xl font-bold mb-1" style={{ color }}>
                            {pkg.name}
                          </h3>
                          <p className="text-sm text-sundae-muted">{pkg.tagline}</p>
                        </div>

                        <div className="mb-5">
                          <div className="flex items-baseline gap-1">
                            <span
                              className="font-display text-4xl font-bold text-white tabular-nums"
                              data-testid={`overview-anchor-${pkg.id}`}
                            >
                              {fmt(pkg.firstUnitPrice)}
                            </span>
                            <span className="text-sundae-muted">{overview.perMonth}</span>
                          </div>
                          <p className="text-sm text-sundae-muted mt-1">
                            for your first location
                          </p>
                        </div>

                        <div className="mb-5 pb-5 border-b border-white/10">
                          <p className="text-[11px] uppercase tracking-wider text-sundae-muted font-semibold mb-2">
                            Then, per additional location
                          </p>
                          <ul className="space-y-1">
                            {pkg.marginalBands.map((band) => (
                              <li key={band.label} className="flex justify-between text-xs">
                                <span className="text-sundae-muted">{band.label}</span>
                                <span className="font-semibold text-white tabular-nums">
                                  {fmt(band.pricePerUnit)}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="space-y-2 mb-5">
                          {SCALE_POINTS.map((units) => (
                            <div key={units} className="flex justify-between text-sm">
                              <span className="text-sundae-muted">
                                {units} {units === 1 ? 'location' : 'locations'}
                              </span>
                              <span className="font-semibold text-white tabular-nums">
                                {fmt(calculateBandedTotal(pkg, units))}
                              </span>
                            </div>
                          ))}
                        </div>

                        <div className="flex justify-between text-sm mb-5 pb-5 border-b border-white/10">
                          <span className="text-sundae-muted">{overview.aiCredits}</span>
                          <span className="font-semibold text-white tabular-nums">
                            {pkg.aiCreditWallet.toLocaleString(locale)}
                          </span>
                        </div>

                        <ul className="space-y-2 mb-6">
                          <li className="flex items-start gap-2 text-sm">
                            <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span className="text-white">
                              All {Object.keys(coreDomainModules).length} Core domain modules
                            </span>
                          </li>
                          <li className="flex items-start gap-2 text-sm">
                            <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span className="text-white">Cross-Intelligence correlation engine</span>
                          </li>
                          <li className="flex items-start gap-2 text-sm">
                            <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span className="text-white">Sundae Intelligence (NL-to-SQL)</span>
                          </li>
                        </ul>

                        <button
                          onClick={() => navigate('/simulator')}
                          className="w-full flex items-center justify-center gap-2 text-sm font-semibold py-2"
                          style={{ color }}
                        >
                          {formatMessage(overview.selectTier, { tier: pkg.name })}
                          <ChevronRight className="w-4 h-4" />
                        </button>

                        <p className="text-xs text-sundae-muted border-t border-white/10 pt-4 mt-4">
                          <strong>{overview.bestFor}</strong> {pkg.bestFor}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Enterprise */}
              <div className="mb-12 p-6 rounded-xl border-2 border-[#F59E0B]/30 bg-sundae-surface">
                <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between">
                  <div>
                    <h3 className="text-2xl font-bold text-[#F59E0B] mb-1">{enterprise.name}</h3>
                    <p className="text-sm text-sundae-muted">{enterprise.tagline}</p>
                    <p className="text-sm text-sundae-muted mt-2 max-w-2xl">{enterprise.note}</p>
                  </div>
                  <a
                    href={getMarketingUrl('/demo', locale)}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-[#F59E0B] whitespace-nowrap"
                  >
                    {overview.contactSales}
                    <ChevronRight className="w-4 h-4" />
                  </a>
                </div>
              </div>

              {/* What every Core package INCLUDES — no prices, no purchase */}
              <div className="mb-8 p-6 rounded-xl border-2 border-[#C2410C]/30 bg-gradient-to-br from-[#C2410C]/10 to-[#E9A24A]/10">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#C2410C]/20 rounded-full border border-[#C2410C]/30 mb-4">
                    <Lock className="w-4 h-4 text-[#C2410C]" />
                    <span className="text-sm font-semibold text-[#C2410C]">INCLUDED IN EVERY CORE PACKAGE</span>
                  </div>
                  <h3 className="text-2xl font-bold mb-2 text-white">
                    The {Object.keys(coreDomainModules).length} Core domain modules
                  </h3>
                  <p className="text-sundae-muted max-w-3xl mx-auto">
                    These are components of your Core package, not separate purchases. There is no
                    a-la-carte price for them and nothing to add on.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {Object.entries(coreDomainModules).map(([moduleId, module]) => {
                    const localizedModule = catalog.modules[moduleId as keyof typeof catalog.modules];
                    return (
                      <div
                        key={moduleId}
                        className="p-4 rounded-lg bg-sundae-surface/70 border border-white/10"
                        data-testid={`overview-included-module-${moduleId}`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="font-semibold text-white">
                            {localizedModule?.name ?? module.name}
                          </span>
                          <span className="text-[10px] uppercase tracking-wider text-green-400 flex-shrink-0">
                            Included
                          </span>
                        </div>
                        <p className="text-xs text-[#C2410C]">
                          {localizedModule?.roi ?? module.roiPotential}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Foresight & Action */}
              <div className="mb-8 p-6 rounded-xl border-2 border-[#E9A24A]/30 bg-sundae-surface">
                <div className="flex flex-col lg:flex-row gap-6">
                  <div className="flex-1">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#E9A24A]/20 rounded-full border border-[#E9A24A]/30 mb-3">
                      <Star className="w-3.5 h-3.5 text-[#E9A24A]" />
                      <span className="text-xs font-semibold text-[#E9A24A]">OPTIONAL LAYER</span>
                    </div>
                    <h3 className="text-2xl font-bold mb-1 text-white">{foresightAction.name}</h3>
                    <p className="text-sundae-muted mb-4">{foresightAction.description}</p>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {foresightAction.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm">
                          <Check className="w-4 h-4 text-[#E9A24A] mt-0.5 flex-shrink-0" />
                          <span className="text-white">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="lg:w-72 flex-shrink-0 p-5 rounded-xl bg-sundae-dark/50 border border-white/10">
                    <div className="flex items-baseline gap-1">
                      <span
                        className="font-display text-3xl font-bold text-white tabular-nums"
                        data-testid="overview-anchor-foresight_action"
                      >
                        {fmt(foresightAction.firstUnitPrice)}
                      </span>
                      <span className="text-sundae-muted">{overview.perMonth}</span>
                    </div>
                    <p className="text-xs text-sundae-muted mb-4">for your first location</p>
                    <p className="text-[11px] uppercase tracking-wider text-sundae-muted font-semibold mb-2">
                      Then, per additional location
                    </p>
                    <ul className="space-y-1 mb-4">
                      {foresightAction.marginalBands.map((band) => (
                        <li key={band.label} className="flex justify-between text-xs">
                          <span className="text-sundae-muted">{band.label}</span>
                          <span className="font-semibold text-white tabular-nums">
                            {fmt(band.pricePerUnit)}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <div className="pt-3 border-t border-white/10 space-y-1">
                      {SCALE_POINTS.map((units) => (
                        <div key={units} className="flex justify-between text-xs">
                          <span className="text-sundae-muted">
                            {units} {units === 1 ? 'location' : 'locations'}
                          </span>
                          <span className="text-white tabular-nums">
                            {fmt(calculateBandedTotal(foresightAction, units))}
                          </span>
                        </div>
                      ))}
                    </div>
                    <p className="sr-only">
                      {calculateBandLines(foresightAction, 5)
                        .map((line) => `${line.units} at ${line.band.pricePerUnit}`)
                        .join(', ')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Concept SKUs */}
              <div className="mb-8 p-6 rounded-xl border border-white/10 bg-sundae-surface">
                <h3 className="text-2xl font-bold mb-1 text-white">Concept extensions</h3>
                <p className="text-sundae-muted mb-5">
                  Flat monthly add-ons for the operating models Core does not cover out of the box.
                  These are not priced per location.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {CONCEPT_SKU_IDS.map((conceptId) => {
                    const concept = conceptSkus[conceptId];
                    return (
                      <div
                        key={conceptId}
                        className="p-4 rounded-lg bg-sundae-dark/50 border border-white/10"
                        data-testid={`overview-concept-${conceptId}`}
                      >
                        <div className="flex items-baseline justify-between gap-2 mb-2">
                          <span className="font-semibold text-white">{concept.name}</span>
                          <span className="font-display font-bold text-white tabular-nums">
                            {fmt(concept.monthlyPrice)}
                            <span className="text-xs text-sundae-muted font-normal">
                              {overview.perMonth}
                            </span>
                          </span>
                        </div>
                        <p className="text-xs text-sundae-muted">{concept.description}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Implementation classes */}
              <div className="mb-8 p-6 rounded-xl border border-white/10 bg-sundae-surface">
                <h3 className="text-2xl font-bold mb-1 text-white">Implementation</h3>
                <p className="text-sundae-muted mb-5">
                  Implementation is a one-time charge, billed{' '}
                  <strong className="text-white">once</strong> at the highest class in your
                  selection. It is never summed per module.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {IMPLEMENTATION_CLASS_ORDER.map((classId) => {
                    const cls = implementationClasses[classId];
                    return (
                      <div
                        key={classId}
                        className="p-4 rounded-lg bg-sundae-dark/50 border border-white/10 text-center"
                        data-testid={`implementation-class-${classId}`}
                      >
                        <div className="font-display text-xl font-bold text-white tabular-nums">
                          {cls.isFloor ? `from ${fmt(cls.fee)}` : fmt(cls.fee)}
                        </div>
                        <div className="text-xs text-sundae-muted mt-1">{cls.name}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Discounts */}
              <div className="mb-8 p-6 rounded-xl border border-white/10 bg-sundae-surface">
                <h3 className="text-2xl font-bold mb-1 text-white">Discounts</h3>
                <p className="text-sundae-muted mb-5">{DISCOUNT_RULES.note}.</p>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-white mb-2">Volume</h4>
                    <ul className="space-y-1">
                      {volumeDiscounts.tiers.map((tier) => (
                        <li key={tier.min} className="flex justify-between text-sm">
                          <span className="text-sundae-muted">
                            {tier.max === null ? `${tier.min}+` : `${tier.min}–${tier.max}`} locations
                          </span>
                          <span className="font-semibold text-white">
                            {tier.enterpriseOnly || tier.percent === null
                              ? 'Enterprise'
                              : `${tier.percent}%`}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-2">Billing cycle</h4>
                    <ul className="space-y-1">
                      <li className="flex justify-between text-sm">
                        <span className="text-sundae-muted">Monthly</span>
                        <span className="font-semibold text-white">{billingDiscounts.monthly}%</span>
                      </li>
                      <li className="flex justify-between text-sm">
                        <span className="text-sundae-muted">Annual</span>
                        <span className="font-semibold text-white">{billingDiscounts.annual}%</span>
                      </li>
                      <li className="flex justify-between text-sm">
                        <span className="text-sundae-muted">2-year</span>
                        <span className="font-semibold text-white">
                          {billingDiscounts.two_year}%
                        </span>
                      </li>
                    </ul>
                    <p className="text-xs text-sundae-muted mt-3">
                      Volume and billing-cycle discounts combine, capped at{' '}
                      {DISCOUNT_RULES.maxDiscountPercent}% in total.
                    </p>
                  </div>
                </div>
              </div>

              {/* Cross-Intelligence */}
              <div className="mb-8 p-6 rounded-xl border-2 border-[#E9A24A]/30 bg-gradient-to-br from-[#E9A24A]/10 to-[#FF7E6F]/10">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#E9A24A]/20 rounded-full border border-[#E9A24A]/30 mb-4">
                    <Star className="w-4 h-4 text-[#E9A24A]" />
                    <span className="text-sm font-semibold text-[#E9A24A]">
                      {overview.crossIntelligenceEyebrow}
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold mb-2 text-white">
                    {overview.crossIntelligenceTitle}
                  </h3>
                  <p className="text-sundae-muted max-w-3xl mx-auto">
                    Surfaces hidden correlations between your data sources. Included with every Core
                    package.
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="p-5 rounded-xl bg-sundae-surface border border-[#E9A24A]/20">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-bold text-lg text-white">
                        {catalog.crossIntelligence.base.name}
                      </h4>
                      <span className="px-3 py-1 bg-green-500/20 text-green-400 text-sm font-semibold rounded-full">
                        {overview.free}
                      </span>
                    </div>
                    <p className="text-sm text-sundae-muted mb-4">
                      Included with every Core package — no extra cost.
                    </p>
                    <ul className="space-y-2">
                      {localizedAddOns.crossIntelligence.base.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm">
                          <Check className="w-4 h-4 text-[#E9A24A] mt-0.5 flex-shrink-0" />
                          <span className="text-white">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-5 rounded-xl bg-gradient-to-br from-[#E9A24A]/10 to-[#FF7E6F]/10 border-2 border-[#E9A24A]/40 relative overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#E9A24A] to-[#FF7E6F]" />
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-bold text-lg text-white">
                        {catalog.crossIntelligence.pro.name}
                      </h4>
                      <span className="px-3 py-1 bg-[#E9A24A]/20 text-[#E9A24A] text-sm font-semibold rounded-full">
                        {overview.pro}
                      </span>
                    </div>
                    <div className="flex items-baseline gap-1 mb-1">
                      <span className="font-display text-2xl font-bold text-white">
                        {fmt(crossIntelligence.pro.monthlyFee)}
                      </span>
                      <span className="text-sundae-muted">{overview.perMonth}</span>
                    </div>
                    <p className="text-xs text-sundae-muted mb-4">
                      {formatMessage(overview.perLocationFrom2, {
                        price: crossIntelligence.pro.perLocationPrice,
                      })}
                    </p>
                    <ul className="space-y-2">
                      {localizedAddOns.crossIntelligence.pro.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm">
                          <Check className="w-4 h-4 text-[#FF7E6F] mt-0.5 flex-shrink-0" />
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
                  <h2 className="text-3xl md:text-4xl font-bold text-white">
                    {overview.watchtowerTitle}
                  </h2>
                </div>
                <p className="text-sundae-muted">{overview.watchtowerSubtitle}</p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                {Object.values(watchtower).map((item) => {
                  const isBundle = item.id === 'bundle';
                  const watchtowerItem = catalog.watchtower[item.id as keyof typeof catalog.watchtower];
                  const tierColors: Record<string, string> = {
                    competitive: '#EF4444',
                    events: '#F59E0B',
                    trends: '#FF7E6F',
                    bundle: '#E9A24A',
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
                            : 'bg-sundae-surface border-white/10',
                        )}
                        style={{
                          borderColor: isBundle ? `${tierColor}50` : undefined,
                          boxShadow: isBundle ? `0 0 30px ${tierColor}30` : undefined,
                        }}
                      >
                        <div className="mb-4">
                          <h3 className="text-2xl font-bold mb-1" style={{ color: tierColor }}>
                            {watchtowerItem?.name ?? item.name}
                          </h3>
                          <p className="text-sm text-sundae-muted">
                            {watchtowerItem?.value ??
                              watchtowerItem?.description ??
                              (item.valueProposition || item.description)}
                          </p>
                        </div>

                        <div className="mb-6">
                          <div className="flex items-baseline gap-1">
                            <span className="font-display text-4xl font-bold text-white tabular-nums">
                              {fmt(item.basePrice)}
                            </span>
                            <span className="text-sundae-muted">{overview.perMonth}</span>
                          </div>
                          <p className="text-sm text-sundae-muted mt-1">
                            {formatMessage(overview.perAdditionalLocation, {
                              price: item.perLocationPrice,
                            })}
                          </p>
                        </div>

                        <div className="space-y-3 mb-6 pb-6 border-b border-white/10">
                          <div className="flex justify-between text-sm">
                            <span className="text-sundae-muted">{overview.locationOne}</span>
                            <span className="font-semibold text-white">{fmt(item.basePrice)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-sundae-muted">{overview.locations5}</span>
                            <span className="font-semibold text-white">
                              {fmt(item.basePrice + item.perLocationPrice * 4)}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-sundae-muted">{overview.locations10}</span>
                            <span className="font-semibold text-white">
                              {fmt(item.basePrice + item.perLocationPrice * 9)}
                            </span>
                          </div>
                        </div>

                        {isBundle && 'baseSavings' in item && (
                          <div className="mb-4 p-3 bg-gradient-to-r from-[#E9A24A]/20 to-[#C2410C]/20 rounded-lg border border-[#E9A24A]/30">
                            <p className="text-xs font-semibold text-[#E9A24A] text-center">
                              {formatMessage(overview.savePerMonth, {
                                amount: item.baseSavings,
                                percent: item.savingsPercent,
                              })}
                            </p>
                          </div>
                        )}

                        <button
                          onClick={() => navigate('/simulator')}
                          className="w-full flex items-center justify-center gap-2 text-sm font-semibold py-2"
                          style={{ color: tierColor }}
                        >
                          {formatMessage(overview.selectTier, {
                            tier: watchtowerItem?.name ?? item.name,
                          })}
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mb-8 p-4 bg-amber-500/10 rounded-lg border border-amber-500/30 flex gap-3">
                <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-sundae-muted">
                  <strong className="text-white">{overview.strategicValueTitle}</strong>{' '}
                  {overview.strategicValueDisclaimer}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'crew' && (
            <motion.div
              key="crew"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <div className="text-center mb-8">
                <div className="flex items-center justify-center gap-3 mb-2">
                  <Users className="w-8 h-8 text-emerald-700 dark:text-emerald-400" />
                  <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
                    {overview.crewTitle}
                  </h2>
                </div>
                <p className="text-slate-600 dark:text-sundae-muted max-w-2xl mx-auto">
                  {overview.crewSubtitle}
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {Object.values(crewSkus).map((sku) => (
                  <div
                    key={sku.id}
                    className="h-full p-6 rounded-xl border-2 bg-white dark:bg-sundae-surface border-slate-200 dark:border-white/10 hover:border-emerald-500/40 dark:hover:border-emerald-500/40 transition-colors shadow-sm dark:shadow-none"
                    data-testid={`crew-sku-${sku.id}`}
                  >
                    <div className="mb-3">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-lg font-bold text-emerald-700 dark:text-emerald-400">
                          {sku.name}
                        </h3>
                        <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300">
                          {sku.tier}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-sundae-muted leading-snug">
                        {sku.description}
                      </p>
                    </div>

                    <div className="mb-4">
                      <div className="flex items-baseline gap-1">
                        <span className="font-display text-3xl font-bold text-slate-900 dark:text-white tabular-nums">
                          {fmt(sku.orgLicensePrice)}
                        </span>
                        <span className="text-slate-500 dark:text-sundae-muted text-sm">
                          {overview.perMonth}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-sundae-muted mt-1">
                        {formatMessage(overview.perAdditionalLocation, {
                          price: sku.perLocationPrice,
                        })}
                      </p>
                    </div>

                    {'prerequisiteMessage' in sku && sku.prerequisiteMessage ? (
                      <p className="text-[11px] font-medium text-amber-700 dark:text-amber-300/80 mb-3">
                        {sku.prerequisiteMessage}
                      </p>
                    ) : null}

                    <ul className="space-y-1.5 text-sm">
                      {sku.features.slice(0, 6).map((feature, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2 text-slate-600 dark:text-sundae-muted"
                        >
                          <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                          <span className="leading-snug">{feature}</span>
                        </li>
                      ))}
                      {sku.features.length > 6 && (
                        <li className="text-xs text-slate-500 dark:text-sundae-muted/60 italic pt-1">
                          +{sku.features.length - 6} more
                        </li>
                      )}
                    </ul>
                  </div>
                ))}
              </div>

              <div className="grid md:grid-cols-3 gap-6 mb-8">
                {Object.values(crewBundles).map((bundle) => (
                  <div
                    key={bundle.id}
                    data-testid={`crew-bundle-${bundle.id}`}
                    className="relative h-full p-6 rounded-xl border-2 bg-emerald-50 dark:bg-gradient-to-br dark:from-emerald-500/15 dark:to-emerald-600/5 border-emerald-300 dark:border-emerald-500/40 shadow-sm dark:shadow-[0_0_30px_rgba(16,185,129,0.15)]"
                  >
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                      <div className="bg-gradient-primary text-white px-4 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                        <Star className="w-3 h-3" />
                        {overview.bestValue}
                      </div>
                    </div>

                    <div className="mt-2 mb-3">
                      <h3 className="text-xl font-bold text-emerald-800 dark:text-emerald-300 mb-1">
                        {bundle.name}
                      </h3>
                      <p className="text-sm text-slate-700 dark:text-sundae-muted leading-snug">
                        {bundle.description}
                      </p>
                    </div>

                    <div className="mb-4">
                      <div className="flex items-baseline gap-1">
                        <span className="font-display text-3xl font-bold text-slate-900 dark:text-white tabular-nums">
                          {fmt(bundle.basePrice)}
                        </span>
                        <span className="text-slate-600 dark:text-sundae-muted text-sm">
                          {overview.perMonth}
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 dark:text-sundae-muted mt-1">
                        {formatMessage(overview.perAdditionalLocation, {
                          price: bundle.perLocationPrice,
                        })}
                      </p>
                    </div>

                    <div className="p-3 bg-emerald-100 dark:bg-emerald-500/15 rounded-lg border border-emerald-300 dark:border-emerald-500/30 mb-2">
                      <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-200 text-center">
                        Save {fmt(bundle.baseSavings)}/mo vs buying separately
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mb-8 p-4 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg border border-emerald-300 dark:border-emerald-500/30 flex gap-3">
                <AlertCircle className="w-5 h-5 text-emerald-700 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-slate-700 dark:text-sundae-muted">
                  <strong className="text-slate-900 dark:text-white">BYO-HR supported.</strong> Bring
                  your own HR (Bayzat, Personio, Pento, Gusto, BambooHR) and Sundae still
                  consolidates the workforce signal. Crew is optional — the intelligence loop isn't.
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
              date: new Intl.DateTimeFormat(locale, { dateStyle: 'long' }).format(
                new Date('2026-08-10T00:00:00Z'),
              ),
            })}
            . {messages.summary.taxNote}. {messages.summary.changeNotice}.
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
          className={cn('w-5 h-5 text-white transition-transform', isExpanded && 'rotate-180')}
        />
      </button>

      {isExpanded && <div className="px-6 pb-6">{children}</div>}
    </div>
  );
}
