// Watchtower competitive intelligence add-on component
// UPDATED: Uses new base + per-location pricing model

import { motion } from 'framer-motion';
import { Eye, TrendingUp, Calendar, Target, ChevronRight, ChevronLeft } from 'lucide-react';
import { useConfiguration } from '../../hooks/useConfiguration';
import { watchtower } from '../../data/pricing';
import { usePriceCalculation } from '../../hooks/usePriceCalculation';
import { calculateWatchtowerPrice, type WatchtowerModuleId } from '../../lib/watchtowerEngine';

export function WatchtowerToggle() {
  const { layer, tier, locations, modules, watchtowerModules, toggleWatchtowerModule, setCurrentStep } = useConfiguration();
  
  // Calculate pricing with current configuration
  const pricing = usePriceCalculation(layer, tier, locations, modules, watchtowerModules);

  const handleContinue = () => {
    setCurrentStep(6);
  };

  const handleBack = () => {
    setCurrentStep(4);
  };

  const getModuleIcon = (moduleId: string) => {
    const icons: Record<string, any> = {
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

  return (
    <div className="max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl font-bold mb-4">
          Unlock Market Intelligence
        </h1>
        <p className="text-xl text-sundae-muted">
          See what your competitors can't with Watchtower competitive intel
        </p>
        <p className="text-sm text-sundae-muted mt-2">
          Base price covers your first location, then ${watchtower.bundle.perLocationPrice}/location for additional markets
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
              <h3 className="font-bold text-lg text-watchtower mb-1">Bundle & Save!</h3>
              <p className="text-sm text-sundae-muted">
                Get all three Watchtower modules for ${bundleResult.total.toLocaleString()}/mo
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-400">
                Save ${Math.round(individualResult.total - bundleResult.total)}
              </div>
              <button
                onClick={() => toggleWatchtowerModule('bundle')}
                className="mt-2 px-4 py-2 bg-watchtower/20 hover:bg-watchtower/30 text-watchtower border border-watchtower/50 rounded-lg transition-all"
              >
                Select Bundle
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
                onClick={() => !isDisabledByBundle && toggleWatchtowerModule(moduleId)}
                disabled={isDisabledByBundle}
                className={`w-full p-6 rounded-xl border-2 transition-all relative ${
                  isSelected || isDisabledByBundle
                    ? 'bg-gradient-to-br from-watchtower/20 to-red-500/20 border-watchtower/50'
                    : 'bg-sundae-surface border-white/10 hover:border-white/30'
                } ${isDisabledByBundle ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isDisabledByBundle && (
                  <div className="absolute top-2 right-2 text-xs bg-watchtower/20 text-watchtower px-2 py-1 rounded">
                    Included in bundle
                  </div>
                )}

                <div className="text-left">
                  <div className="flex items-start gap-4 mb-4">
                    <Icon className="w-8 h-8 text-watchtower" />
                    <div className="flex-1">
                      <h3 className="font-bold text-lg mb-1">{module.name}</h3>
                      <p className="text-sm text-sundae-muted">{module.description}</p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <span className="text-2xl font-bold">${modulePrice.toLocaleString()}</span>
                    <span className="text-sundae-muted">/mo</span>
                    <div className="text-xs text-sundae-muted mt-1">
                      ${module.basePrice} base + ${module.perLocationPrice} × {locations - 1} locations
                    </div>
                  </div>

                  <ul className="space-y-2">
                    {module.features.slice(0, 3).map((feature, idx) => (
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
          className="md:col-span-2 relative overflow-visible"
        >
          <button
            onClick={() => toggleWatchtowerModule('bundle')}
            className={`w-full p-6 rounded-xl border-2 transition-all relative overflow-visible ${
              watchtowerModules.includes('bundle')
                ? 'bg-gradient-to-br from-watchtower/30 to-red-500/30 border-watchtower'
                : 'bg-gradient-to-br from-watchtower/10 to-red-500/10 border-watchtower/50 hover:border-watchtower'
            }`}
          >
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 px-4 py-1 bg-gradient-gold text-white text-sm font-bold rounded-full z-10 whitespace-nowrap shadow-lg">
              BEST VALUE – SAVE 15%
            </div>

            <div className="flex items-center justify-between">
              <div className="text-left">
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-5xl">{watchtower.bundle.icon}</span>
                  <div>
                    <h3 className="font-bold text-2xl mb-1">{watchtower.bundle.name}</h3>
                    <p className="text-sundae-muted">{watchtower.bundle.description}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {watchtower.bundle.includes.map((includedId: string) => {
                    const included = watchtower[includedId as keyof typeof watchtower];
                    if (!included || 'includes' in included) return null;
                    const Icon = getModuleIcon(includedId);
                    const individualPrice = included.basePrice + ((locations - 1) * included.perLocationPrice);
                    return (
                      <div key={includedId} className="flex items-center gap-2 text-sm">
                        <Icon className="w-4 h-4 text-watchtower" />
                        <span>{included.name}</span>
                        <span className="text-sundae-muted">(${individualPrice})</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="text-right">
                <div className="text-3xl font-bold mb-1">${bundleResult.total.toLocaleString()}/mo</div>
                <div className="text-xs text-sundae-muted mb-2">
                  ${watchtower.bundle.basePrice} base + ${watchtower.bundle.perLocationPrice} × {locations - 1} locs
                </div>
                <div className="text-sm text-sundae-muted line-through">
                  ${bundleResult.subtotal.toLocaleString()}/mo individual
                </div>
                <div className="text-green-400 font-semibold">15% OFF</div>
              </div>
            </div>
          </button>
        </motion.div>
      </div>

      {/* Current total */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mb-8 p-6 bg-gradient-to-br from-sundae-surface to-sundae-surface/50 rounded-xl border border-white/10"
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-sundae-muted mb-1">Total with Watchtower</div>
            <div className="text-3xl font-bold tabular-nums">
              ${pricing.total.toLocaleString()}/mo
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-sundae-muted mb-1">Per Location</div>
            <div className="text-2xl font-bold">
              ${pricing.perLocation.toFixed(0)}/mo
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
          Back
        </button>
        
        <div className="text-center">
          <button
            onClick={handleContinue}
            className="button-primary inline-flex items-center gap-2 relative z-50"
            data-testid="continue-button-watchtower"
          >
            <span>Continue to ROI Calculator</span>
            <ChevronRight className="w-5 h-5" />
          </button>
          
          {watchtowerModules.length === 0 && (
            <p className="text-sm text-sundae-muted mt-2">
              Watchtower is optional - you can skip this step
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
}
