// Watchtower competitive intelligence add-on component
// UPDATED: Uses new base + per-location pricing model

import { motion } from 'framer-motion';
import { Eye, TrendingUp, Calendar, Target, ChevronRight, ChevronLeft, Castle, Sparkles, Zap, GitBranch, BarChart3, Radar, Activity, AlertTriangle, Search, type LucideIcon } from 'lucide-react';
import { useConfiguration } from '../../hooks/useConfiguration';
import { watchtower, getLocalizedAddOnDisplay } from '../../data/pricing';
import { usePriceCalculation } from '../../hooks/usePriceCalculation';
import { calculateWatchtowerPrice, type WatchtowerModuleId } from '../../lib/watchtowerEngine';
import { calculateCrossIntelligencePrice, isCrossIntelligenceEligible } from '../../lib/pricingEngine';
import { useLocale } from '../../contexts/LocaleContext';

export function WatchtowerToggle() {
  const { layer, tier, locations, modules, watchtowerModules, crossIntelligence: crossIntelSelection, toggleWatchtowerModule, setCrossIntelligence, setCurrentStep } = useConfiguration();
  const { locale, messages } = useLocale();
  const copy = messages.builder.watchtowerToggle;
  const watchtowerCatalog = messages.catalog.watchtower;
  const crossCatalog = messages.catalog.crossIntelligence;
  const localizedAddOns = getLocalizedAddOnDisplay(locale);

  // Calculate pricing with current configuration
  const pricing = usePriceCalculation(layer, tier, locations, modules, watchtowerModules, undefined, crossIntelSelection);

  // Cross-Intelligence eligibility
  const crossIntelEligible = isCrossIntelligenceEligible(modules.length);
  const crossIntelProPrice = calculateCrossIntelligencePrice('pro', locations);

  const handleContinue = () => {
    // Skip ROI page when no modules selected (ROI requires modules for savings)
    setCurrentStep(modules.length === 0 ? 7 : 6);
  };

  const handleBack = () => {
    setCurrentStep(4);
  };

  const getModuleIcon = (moduleId: string) => {
    const icons: Record<string, LucideIcon> = {
      competitive: Eye,
      events: Calendar,
      trends: TrendingUp,
      bundle: Target
    };
    return icons[moduleId] || Eye;
  };

  // Calculate individual cost if user selected modules separately
  const individualResult = watchtowerModules.length > 0 && !watchtowerModules.includes('bundle')
    ? calculateWatchtowerPrice(watchtowerModules as WatchtowerModuleId[], locations)
    : null;

  // Calculate bundle cost
  const bundleResult = calculateWatchtowerPrice(['bundle'], locations);
  
  // Suggest bundle if individual modules cost more
  const shouldSuggestBundle = individualResult && individualResult.total > bundleResult.total && !watchtowerModules.includes('bundle');

  const formatMessage = (template: string, values: Record<string, string | number>) =>
    Object.entries(values).reduce(
      (result, [key, value]) => result.replaceAll(`\${${key}}`, String(value)).replaceAll(`{${key}}`, String(value)),
      template,
    );

  return (
    <div className="max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl font-bold mb-4">
          {copy.title}
        </h1>
        <p className="text-xl text-sundae-muted">
          {copy.subtitle}
        </p>
        <p className="text-sm text-sundae-muted mt-2">
          {formatMessage(copy.baseCoverage, { price: watchtower.bundle.perLocationPrice })}
        </p>
      </motion.div>

      {/* Bundle suggestion */}
      {shouldSuggestBundle && individualResult && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-8 p-6 bg-gradient-to-r from-watchtower/10 to-red-500/10 rounded-xl border border-watchtower/30"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-lg text-watchtower mb-1">{copy.bundleSaveTitle}</h3>
              <p className="text-sm text-sundae-muted">
                {formatMessage(copy.bundleSaveDescription, { total: bundleResult.total.toLocaleString(locale) })}
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-400">
                {formatMessage(copy.saveAmount, { amount: Math.round(individualResult.total - bundleResult.total) })}
              </div>
              <button
                onClick={() => toggleWatchtowerModule('bundle')}
                className="mt-2 px-4 py-2 bg-watchtower/20 hover:bg-watchtower/30 text-watchtower border border-watchtower/50 rounded-lg transition-all"
              >
                {copy.selectBundle}
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Module cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 overflow-visible">
        {/* Individual modules */}
        {Object.entries(watchtower).filter(([id]) => id !== 'bundle').map(([moduleId, module]) => {
          const isSelected = watchtowerModules.includes(moduleId);
          const isDisabledByBundle = watchtowerModules.includes('bundle');
          const Icon = getModuleIcon(moduleId);
          const localizedModule = watchtowerCatalog[moduleId as keyof typeof watchtowerCatalog];

          // Calculate price for this module
          const modulePrice = module.basePrice + ((locations - 1) * module.perLocationPrice);

          return (
            <motion.div
              key={moduleId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: isDisabledByBundle ? 0 : -5 }}
            >
              <button
                onClick={() => {
                  if (isDisabledByBundle) {
                    // If bundle is selected, deselect it and select this individual module
                    toggleWatchtowerModule('bundle'); // Deselect bundle
                    toggleWatchtowerModule(moduleId); // Select this module
                  } else {
                    toggleWatchtowerModule(moduleId);
                  }
                }}
                className={`w-full p-6 rounded-xl border-2 transition-all relative ${
                  isSelected || isDisabledByBundle
                    ? 'bg-gradient-to-br from-watchtower/20 to-red-500/20 border-watchtower/50'
                    : 'bg-sundae-surface border-white/10 hover:border-white/30'
                } ${isDisabledByBundle ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isDisabledByBundle && (
                  <div className="absolute top-2 right-2 text-xs bg-watchtower/20 text-watchtower px-2 py-1 rounded">
                    {copy.includedInBundle}
                  </div>
                )}

                <div className="text-left">
                  <div className="flex items-start gap-4 mb-4">
                    <Icon className="w-8 h-8 text-watchtower" />
                    <div className="flex-1">
                      <h3 className="font-bold text-lg mb-1">{localizedModule?.name ?? module.name}</h3>
                      <p className="text-sm text-sundae-muted">{localizedModule?.description ?? module.description}</p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <span className="text-2xl font-bold">${modulePrice.toLocaleString(locale)}</span>
                    <span className="text-sundae-muted">{copy.perMonth}</span>
                    <div className="text-xs text-sundae-muted mt-1">
                      {formatMessage(copy.basePlusLocations, {
                        base: module.basePrice,
                        perLocation: module.perLocationPrice,
                        extra: locations - 1,
                      })}
                    </div>
                  </div>

                  <ul className="space-y-2">
                    {localizedAddOns.watchtower[moduleId as keyof typeof localizedAddOns.watchtower].map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <span className="text-sundae-accent">•</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </button>
            </motion.div>
          );
        })}

        {/* Bundle card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ y: -5, scale: 1.02 }}
          className="md:col-span-2 relative mt-6 isolate"
        >
          {/* Badge positioned above card with proper spacing */}
          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 px-4 py-1 bg-gradient-gold text-white text-sm font-bold rounded-full z-50 whitespace-nowrap shadow-lg">
            {copy.bestValue}
          </div>
          
          <button
            onClick={() => toggleWatchtowerModule('bundle')}
            className={`w-full p-6 rounded-xl border-2 transition-all relative z-10 ${
              watchtowerModules.includes('bundle')
                ? 'bg-gradient-to-br from-watchtower/30 to-red-500/30 border-watchtower'
                : 'bg-gradient-to-br from-watchtower/10 to-red-500/10 border-watchtower/50 hover:border-watchtower'
            }`}
          >

            <div className="flex items-center justify-between">
              <div className="text-left">
                <div className="flex items-center gap-4 mb-4">
                  <Castle className="w-12 h-12 text-watchtower" />
                  <div>
                    <h3 className="font-bold text-2xl mb-1">{watchtowerCatalog.bundle.name}</h3>
                    <p className="text-sundae-muted">{watchtowerCatalog.bundle.description}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {watchtower.bundle.includes.map((includedId: string) => {
                    const included = watchtower[includedId as keyof typeof watchtower];
                    if (!included || 'includes' in included) return null;
                    const Icon = getModuleIcon(includedId);
                    const individualPrice = included.basePrice + ((locations - 1) * included.perLocationPrice);
                    const localizedIncluded = watchtowerCatalog[includedId as keyof typeof watchtowerCatalog];
                    return (
                      <div key={includedId} className="flex items-center gap-2 text-sm">
                        <Icon className="w-4 h-4 text-watchtower" />
                        <span>{localizedIncluded?.name ?? included.name}</span>
                        <span className="text-sundae-muted">(${individualPrice.toLocaleString(locale)})</span>
                      </div>
                    );
                  })}
                </div>
              </div>

            <div className="text-right">
                <div className="text-3xl font-bold mb-1">${bundleResult.total.toLocaleString(locale)}{copy.perMonth}</div>
                <div className="text-xs text-sundae-muted mb-2">
                  {formatMessage(copy.basePlusLocations, {
                    base: watchtower.bundle.basePrice,
                    perLocation: watchtower.bundle.perLocationPrice,
                    extra: locations - 1,
                  })}
                </div>
                <div className="text-sm text-sundae-muted line-through">
                  ${bundleResult.subtotal.toLocaleString(locale)}{copy.perMonth} {copy.individualSuffix}
                </div>
                <div className="text-green-400 font-semibold">{copy.bundleDiscount}</div>
              </div>
            </div>
          </button>
        </motion.div>
      </div>

      {/* Cross-Intelligence Section */}
      {crossIntelEligible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="mb-8"
        >
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border border-purple-500/30 rounded-full mb-4">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span className="text-sm font-semibold text-purple-300">
                {formatMessage(copy.unlockedWithModules, { count: modules.length })}
              </span>
            </div>
            <h2 className="text-2xl font-bold mb-2">{copy.crossTitle}</h2>
            <p className="text-sundae-muted">
              {copy.crossSubtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Base tier - Auto-included */}
            <motion.div
              whileHover={{ y: -3 }}
              className={`p-6 rounded-xl border-2 transition-all ${
                crossIntelSelection === 'base'
                  ? 'bg-gradient-to-br from-purple-500/15 to-cyan-500/15 border-purple-500/50'
                  : 'bg-sundae-surface border-white/10'
              }`}
            >
              <div className="flex items-center gap-3 mb-4">
                <GitBranch className="w-8 h-8 text-purple-400" />
                <div>
                  <h3 className="font-bold text-lg">{crossCatalog.base.name}</h3>
                  <span className="text-green-400 text-sm font-semibold">{copy.includedFree}</span>
                </div>
              </div>
              <p className="text-sm text-sundae-muted mb-4">{crossCatalog.base.description}</p>
              <ul className="space-y-2">
                {localizedAddOns.crossIntelligence.base.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm">
                    <span className="text-purple-400">•</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Pro tier - Upgrade option */}
            <motion.div
              whileHover={{ y: -5, scale: 1.01 }}
            >
              <button
                onClick={() => setCrossIntelligence(crossIntelSelection === 'pro' ? 'base' : 'pro')}
                className={`w-full h-full text-left p-6 rounded-xl border-2 transition-all ${
                  crossIntelSelection === 'pro'
                    ? 'bg-gradient-to-br from-purple-500/25 to-cyan-500/25 border-purple-500'
                    : 'bg-gradient-to-br from-purple-500/5 to-cyan-500/5 border-purple-500/30 hover:border-purple-500/60'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Zap className="w-8 h-8 text-cyan-400" />
                    <div>
                      <h3 className="font-bold text-lg">{crossCatalog.pro.name}</h3>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold">${crossIntelProPrice.toLocaleString(locale)}</span>
                        <span className="text-sundae-muted">{copy.perMonth}</span>
                      </div>
                    </div>
                  </div>
                  {crossIntelSelection === 'pro' && (
                    <div className="px-3 py-1 bg-purple-500/20 text-purple-300 text-sm font-semibold rounded-full">
                      {copy.selected}
                    </div>
                  )}
                </div>
                <div className="text-xs text-sundae-muted mb-4">
                  {formatMessage(copy.proPriceNote, { locations })}
                </div>
                <p className="text-sm text-sundae-muted mb-4">{crossCatalog.pro.description}</p>

                <div className="grid grid-cols-2 gap-2">
                  {localizedAddOns.crossIntelligence.pro.map((feature, idx) => {
                    const icons: LucideIcon[] = [BarChart3, Activity, Radar, AlertTriangle, Search, Sparkles];
                    const Icon = icons[idx] || Sparkles;
                    return (
                    <div key={feature} className="flex items-center gap-2 text-xs text-sundae-muted">
                      <Icon className="w-3 h-3 text-cyan-400 flex-shrink-0" />
                      <span>{feature}</span>
                    </div>
                    );
                  })}
                </div>
              </button>
            </motion.div>
          </div>
        </motion.div>
      )}

      {/* Current total */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mb-8 p-6 bg-gradient-to-br from-sundae-surface to-sundae-surface/50 rounded-xl border border-white/10"
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-sundae-muted mb-1">{copy.totalWithAddons}</div>
            <div className="text-3xl font-bold tabular-nums">
              ${pricing.total.toLocaleString(locale)}{copy.perMonth}
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-sundae-muted mb-1">{copy.perLocation}</div>
            <div className="text-2xl font-bold">
              ${pricing.perLocation.toFixed(0)}{copy.perMonth}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Navigation buttons */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mb-32 flex items-center justify-between relative z-50"
      >
        <button
          onClick={handleBack}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-sundae-surface hover:bg-sundae-surface-hover border border-white/10 hover:border-white/20 transition-colors font-semibold"
        >
          <ChevronLeft className="w-5 h-5" />
          {copy.back}
        </button>
        
        <div className="text-center">
          <button
            onClick={handleContinue}
            className="button-primary inline-flex items-center gap-2 relative z-50"
            data-testid="continue-button-watchtower"
          >
            <span>{copy.continueToRoi}</span>
            <ChevronRight className="w-5 h-5" />
          </button>
          
          {watchtowerModules.length === 0 && (
            <p className="text-sm text-sundae-muted mt-2">
              {copy.watchtowerOptional}
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
}
