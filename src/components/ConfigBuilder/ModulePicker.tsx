// Module marketplace interface component

import { motion } from 'framer-motion';
import { Plus, Check, Zap, TrendingUp, Package, DollarSign, ChevronLeft } from 'lucide-react';
import { useConfiguration } from '../../hooks/useConfiguration';
import { modules } from '../../data/pricing';
import { usePriceCalculation } from '../../hooks/usePriceCalculation';

export function ModulePicker() {
  const { layer, tier, locations, modules: selectedModules, toggleModule, setCurrentStep } = useConfiguration();
  
  // Calculate pricing with current modules
  const pricing = usePriceCalculation(layer, tier, locations, selectedModules, []);

  const handleContinue = () => {
    setCurrentStep(5);
  };

  const handleBack = () => {
    setCurrentStep(3);
  };

  const getModuleIcon = (moduleId: string) => {
    const icons: Record<string, any> = {
      labor: '👥',
      inventory: '📦',
      purchasing: '🛒',
      marketing: '📣',
      reservations: '📅'
    };
    return icons[moduleId] || '📊';
  };

  const calculateModulePrice = (module: typeof modules[keyof typeof modules]) => {
    let price = module.orgLicensePrice;
    if (locations > module.includedLocations) {
      price += (locations - module.includedLocations) * module.perLocationPrice;
    }
    return price;
  };

  // Check for combo bonuses
  const hasLaborInventoryCombo = selectedModules.includes('labor') && selectedModules.includes('inventory');
  const hasFullStack = Object.keys(modules).every(id => selectedModules.includes(id));

  return (
    <div className="max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl font-bold mb-4">
          Power Up Your Stack
        </h1>
        <p className="text-xl text-sundae-muted">
          Add intelligence modules to unlock deeper insights and automation
        </p>
      </motion.div>

      {/* Combo bonus notification */}
      {hasLaborInventoryCombo && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-6 p-4 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-lg border border-green-500/30"
        >
          <div className="flex items-center gap-3">
            <Zap className="w-6 h-6 text-green-400" />
            <div>
              <span className="font-semibold text-green-400">Efficiency Combo Unlocked!</span>
              <span className="ml-2 text-sm text-sundae-muted">
                Labor + Inventory modules work together for maximum operational efficiency
              </span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Module grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {Object.entries(modules).map(([moduleId, module]) => {
          const isSelected = selectedModules.includes(moduleId);
          const modulePrice = calculateModulePrice(module);
          const isRecommended = module.powerLevel && module.powerLevel >= 4;

          return (
            <motion.div
              key={moduleId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -5, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <button
                onClick={() => toggleModule(moduleId)}
                className={`w-full h-full p-6 rounded-xl border-2 transition-all relative ${
                  isSelected 
                    ? 'bg-gradient-to-br from-sundae-accent/20 to-blue-500/20 border-sundae-accent/50'
                    : 'bg-sundae-surface border-white/10 hover:border-white/30'
                }`}
              >
                {/* Selected indicator */}
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-3 -right-3 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center"
                  >
                    <Check className="w-5 h-5 text-white" />
                  </motion.div>
                )}

                {/* Recommended badge */}
                {isRecommended && !isSelected && (
                  <div className="absolute -top-2 left-4 px-3 py-1 bg-gradient-primary text-white text-xs font-bold rounded-full">
                    RECOMMENDED
                  </div>
                )}

                <div className="text-left">
                  {/* Header */}
                  <div className="flex items-start gap-4 mb-4">
                    <span className="text-4xl">{getModuleIcon(moduleId)}</span>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg mb-1">{module.name}</h3>
                      <p className="text-xs text-sundae-muted">{module.tagline}</p>
                    </div>
                  </div>

                  {/* Power level */}
                  {module.powerLevel && (
                    <div className="flex gap-1 mb-3">
                      {[...Array(5)].map((_, i) => (
                        <div
                          key={i}
                          className={`w-4 h-4 rounded-full ${
                            module.powerLevel && i < module.powerLevel 
                              ? 'bg-gradient-to-r from-yellow-400 to-orange-400' 
                              : 'bg-sundae-surface-hover'
                          }`}
                        />
                      ))}
                    </div>
                  )}

                  {/* Price */}
                  <div className="mb-4">
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold tabular-nums">${modulePrice}</span>
                      <span className="text-sm text-sundae-muted">/mo</span>
                    </div>
                    {locations > module.includedLocations && (
                      <p className="text-xs text-sundae-muted mt-1">
                        Includes {module.includedLocations} locations + {locations - module.includedLocations} extra
                      </p>
                    )}
                  </div>

                  {/* ROI potential */}
                  <div className="mb-4 p-3 bg-sundae-dark/50 rounded-lg">
                    <div className="flex items-center gap-2 text-sm">
                      <TrendingUp className="w-4 h-4 text-green-400" />
                      <span className="text-green-400 font-semibold">{module.roiPotential}</span>
                    </div>
                  </div>

                  {/* Key unlocks */}
                  {module.unlocks && (
                    <ul className="space-y-1">
                      {module.unlocks.slice(0, 3).map((unlock, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs">
                          <Plus className="w-3 h-3 text-sundae-accent mt-0.5 flex-shrink-0" />
                          <span>{unlock}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* Special note */}
                  {module.note && (
                    <p className="mt-3 text-xs text-yellow-400 italic">
                      {module.note}
                    </p>
                  )}
                </div>
              </button>
            </motion.div>
          );
        })}
      </div>

      {/* Current total with modules */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mb-8 p-6 bg-gradient-to-br from-sundae-surface to-sundae-surface/50 rounded-xl border border-white/10"
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-sundae-muted mb-1">Total with Modules</div>
            <div className="text-3xl font-bold tabular-nums">
              ${pricing.total.toLocaleString()}/mo
            </div>
            <div className="text-sm text-sundae-muted mt-1">
              {selectedModules.length} module{selectedModules.length !== 1 ? 's' : ''} selected
            </div>
          </div>
          
          {/* Savings indicator */}
          {(() => {
            const tenzoMonthly = pricing.savings.tenzo.monthly;
            const ourMonthly = pricing.total;
            const monthlySavings = tenzoMonthly - ourMonthly;
            const savingsPercent = tenzoMonthly > 0 ? (monthlySavings / tenzoMonthly) * 100 : 0;
            
            return monthlySavings > 0 ? (
              <div className="text-right">
                <div className="text-sm text-sundae-muted mb-1">vs Tenzo</div>
                <div className="text-2xl font-bold text-green-400">
                  Save ${Math.round(monthlySavings)}/mo
                </div>
                <div className="text-sm text-green-400">
                  {Math.round(savingsPercent)}% less
                </div>
              </div>
            ) : null;
          })()}
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
            data-testid="continue-button-modules"
          >
            <span>Continue to Watchtower</span>
            {selectedModules.length === 0 && (
              <span className="text-sm opacity-75">(optional)</span>
            )}
          </button>
          
          {selectedModules.length === 0 && (
            <p className="text-sm text-sundae-muted mt-2">
              You can skip modules and add them later
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
}
