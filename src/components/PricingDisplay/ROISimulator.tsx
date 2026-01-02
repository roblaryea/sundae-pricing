// ROI calculator component

import { motion } from 'framer-motion';
import { TrendingUp, Clock, ChevronRight, Users, Package, Megaphone, ShoppingCart, CalendarDays } from 'lucide-react';
import { useConfiguration } from '../../hooks/useConfiguration';
import { usePriceCalculation } from '../../hooks/usePriceCalculation';
import { useROICalculation, generateROIDescription, getTopSavingsCategories } from '../../hooks/useROICalculation';

export function ROISimulator() {
  const { 
    layer, tier, locations, modules, watchtowerModules,
    roiInputs, setROIInputs, setCurrentStep 
  } = useConfiguration();
  
  const pricing = usePriceCalculation(layer, tier, locations, modules, watchtowerModules);
  const roi = useROICalculation({ layer, tier, locations, modules, watchtowerModules }, roiInputs, pricing.total);

  const handleInputChange = (field: keyof typeof roiInputs, value: number) => {
    setROIInputs({ [field]: value });
  };

  const handleContinue = () => {
    setCurrentStep(7);
  };

  const topCategories = getTopSavingsCategories(roi.breakdowns);

  return (
    <div className="max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl font-bold mb-4">
          Calculate Your ROI
        </h1>
        <p className="text-xl text-sundae-muted">
          See how quickly Sundae pays for itself through operational savings
        </p>
      </motion.div>

      {/* Input sliders */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-sundae-surface rounded-xl p-8 mb-8"
      >
        <h3 className="text-lg font-bold mb-6">Tell us about your business</h3>
        
        <div className="space-y-8">
          {/* Monthly revenue */}
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-medium">Monthly Revenue per Location</label>
              <span className="text-lg font-bold tabular-nums">
                ${roiInputs.monthlyRevenue.toLocaleString()}
              </span>
            </div>
            <input
              type="range"
              min="50000"
              max="500000"
              step="10000"
              value={roiInputs.monthlyRevenue}
              onChange={(e) => handleInputChange('monthlyRevenue', parseInt(e.target.value))}
              className="w-full h-2 bg-sundae-surface-hover rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #38BDF8 0%, #38BDF8 ${(roiInputs.monthlyRevenue - 50000) / (500000 - 50000) * 100}%, #334155 ${(roiInputs.monthlyRevenue - 50000) / (500000 - 50000) * 100}%, #334155 100%)`
              }}
            />
          </div>

          {/* Labor cost */}
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-medium">Current Labor Cost %</label>
              <span className="text-lg font-bold tabular-nums">{roiInputs.laborPercent}%</span>
            </div>
            <input
              type="range"
              min="20"
              max="40"
              value={roiInputs.laborPercent}
              onChange={(e) => handleInputChange('laborPercent', parseInt(e.target.value))}
              className="w-full h-2 bg-sundae-surface-hover rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #38BDF8 0%, #38BDF8 ${(roiInputs.laborPercent - 20) / 20 * 100}%, #334155 ${(roiInputs.laborPercent - 20) / 20 * 100}%, #334155 100%)`
              }}
            />
          </div>

          {/* Food cost */}
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-medium">Current Food Cost %</label>
              <span className="text-lg font-bold tabular-nums">{roiInputs.foodCostPercent}%</span>
            </div>
            <input
              type="range"
              min="20"
              max="40"
              value={roiInputs.foodCostPercent}
              onChange={(e) => handleInputChange('foodCostPercent', parseInt(e.target.value))}
              className="w-full h-2 bg-sundae-surface-hover rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #38BDF8 0%, #38BDF8 ${(roiInputs.foodCostPercent - 20) / 20 * 100}%, #334155 ${(roiInputs.foodCostPercent - 20) / 20 * 100}%, #334155 100%)`
              }}
            />
          </div>

          {/* Marketing spend (if module selected) */}
          {modules.includes('marketing') && (
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm font-medium">Monthly Marketing Spend</label>
                <span className="text-lg font-bold tabular-nums">
                  ${(roiInputs.marketingSpend || 0).toLocaleString()}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="10000"
                step="500"
                value={roiInputs.marketingSpend || 0}
                onChange={(e) => handleInputChange('marketingSpend', parseInt(e.target.value))}
                className="w-full h-2 bg-sundae-surface-hover rounded-lg appearance-none cursor-pointer"
              />
            </div>
          )}
        </div>
      </motion.div>

      {/* ROI Results */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-xl p-8 border border-green-500/30 mb-8"
      >
        <h3 className="text-lg font-bold mb-6">Your Projected Returns</h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <div>
            <div className="text-sm text-sundae-muted mb-1">Monthly Savings</div>
            <div className="text-3xl font-bold text-green-400">
              ${roi.monthlySavings.toLocaleString()}
            </div>
          </div>
          <div>
            <div className="text-sm text-sundae-muted mb-1">Annual Savings</div>
            <div className="text-3xl font-bold text-green-400">
              ${roi.annualSavings.toLocaleString()}
            </div>
          </div>
          <div>
            <div className="text-sm text-sundae-muted mb-1">ROI Multiple</div>
            <div className="text-3xl font-bold text-green-400">{roi.roi}x</div>
          </div>
          <div>
            <div className="text-sm text-sundae-muted mb-1">Payback Period</div>
            <div className="text-3xl font-bold text-green-400">
              {roi.paybackDays} days
            </div>
          </div>
        </div>

        <div className="p-4 bg-sundae-dark/30 rounded-lg">
          <p className="text-center text-lg">
            {generateROIDescription(roi)}
          </p>
        </div>
      </motion.div>

      {/* Savings breakdown */}
      {roi.monthlySavings > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-sundae-surface rounded-xl p-8 mb-8"
        >
          <h3 className="text-lg font-bold mb-6">Savings Breakdown</h3>
          
          <div className="space-y-4">
            {Object.entries(roi.breakdowns).map(([category, amount]) => {
              if (amount === 0) return null;
              
              const percentage = (amount / roi.monthlySavings) * 100;
              const labelConfig: Record<string, { icon: any; label: string }> = {
                labor: { icon: Users, label: 'Labor Optimization' },
                food: { icon: Package, label: 'Food Cost Reduction' },
                marketing: { icon: Megaphone, label: 'Marketing Efficiency' },
                purchasing: { icon: ShoppingCart, label: 'Purchasing Savings' },
                reservations: { icon: CalendarDays, label: 'Table Utilization' }
              };
              
              const config = labelConfig[category];
              if (!config) return null;
              const IconComponent = config.icon;
              
              return (
                <div key={category}>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium flex items-center gap-2">
                      <IconComponent className="w-4 h-4" />
                      {config.label}
                    </span>
                    <span className="text-sm font-bold">${amount.toLocaleString()}/mo</span>
                  </div>
                  <div className="w-full bg-sundae-surface-hover rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 0.5, delay: 0.1 }}
                      className="bg-gradient-to-r from-green-400 to-emerald-400 h-2 rounded-full"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Top savings categories */}
      {topCategories.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8 p-6 bg-gradient-to-r from-sundae-accent/10 to-blue-500/10 rounded-lg border border-sundae-accent/30"
        >
          <div className="flex items-start gap-3">
            <TrendingUp className="w-6 h-6 text-sundae-accent mt-0.5" />
            <div>
              <h4 className="font-semibold mb-2">Your Biggest Wins</h4>
              <p className="text-sm text-sundae-muted">
                Focus on {topCategories.join(', ')} for maximum impact
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Platform cost vs savings */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
        className="bg-sundae-surface rounded-xl p-8 mb-8"
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-sundae-muted mb-1">Monthly Platform Cost</div>
            <div className="text-2xl font-bold">${pricing.total.toLocaleString()}</div>
          </div>
          <div className="text-center px-8">
            <Clock className="w-8 h-8 mx-auto mb-2 text-sundae-accent" />
            <div className="text-sm text-sundae-muted">Pays for itself in</div>
            <div className="text-xl font-bold text-green-400">{roi.paybackDays} days</div>
          </div>
          <div className="text-right">
            <div className="text-sm text-sundae-muted mb-1">Net Monthly Benefit</div>
            <div className="text-2xl font-bold text-green-400">
              +${(roi.monthlySavings - pricing.total).toLocaleString()}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Continue button */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="text-center"
      >
        <button
          onClick={handleContinue}
          className="button-primary inline-flex items-center gap-2"
        >
          <span>View Summary</span>
          <ChevronRight className="w-5 h-5" />
        </button>
      </motion.div>
    </div>
  );
}
