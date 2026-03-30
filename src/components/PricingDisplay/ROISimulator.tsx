// ROI calculator component with dynamic module-based savings

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  type LucideIcon,
  TrendingUp,
  Clock,
  ChevronRight,
  Users,
  Package,
  Megaphone,
  ShoppingCart,
  CalendarDays,
  DollarSign,
  Shield,
  Bike,
  Star,
  Info,
  AlertCircle,
} from 'lucide-react';
import { useConfiguration } from '../../hooks/useConfiguration';
import { usePriceCalculation } from '../../hooks/usePriceCalculation';
import {
  useROICalculation,
  generateROIDescription,
  getTopSavingsCategories,
} from '../../hooks/useROICalculation';
import type { SavingsLineItem } from '../../hooks/useROICalculation';
import { cn } from '../../utils/cn';
import { useLocale } from '../../contexts/LocaleContext';
import {
  formatMessage,
  getRoiCopy,
  type PricingUiLocale,
} from '../../lib/pricingUiCopy';

const ICON_MAP: Record<string, LucideIcon> = {
  Users,
  Package,
  Megaphone,
  ShoppingCart,
  CalendarDays,
  DollarSign,
  Shield,
  Bike,
  Star,
};

export function ROISimulator() {
  const { locale } = useLocale();
  const copy = getRoiCopy(locale as PricingUiLocale);
  const {
    layer,
    tier,
    locations,
    modules,
    watchtowerModules,
    roiInputs,
    setROIInputs,
    setCurrentStep,
  } = useConfiguration();

  const [hoveredTooltip, setHoveredTooltip] = useState<string | null>(null);

  const pricing = usePriceCalculation(layer, tier, locations, modules, watchtowerModules);
  const roi = useROICalculation(
    { layer, tier, locations, modules, watchtowerModules },
    roiInputs,
    pricing.total
  );

  const handleInputChange = (field: keyof typeof roiInputs, value: number | boolean) => {
    setROIInputs({ [field]: value });
  };

  const handleContinue = () => {
    setCurrentStep(7);
  };

  const topCategories = getTopSavingsCategories(roi.savingsLines);
  const hasMarketingModule = modules.includes('marketing');
  const hasDeliveryModule = modules.includes('delivery');
  const hasGuestModule = modules.includes('guest');

  return (
    <div className="max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl font-bold mb-4">{copy.title}</h1>
        <p className="text-xl text-sundae-muted">{copy.subtitle}</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-sundae-surface rounded-xl p-8 mb-8"
      >
        <h3 className="text-lg font-bold mb-6">{copy.businessTitle}</h3>

        <div className="space-y-8">
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-medium">{copy.monthlyRevenuePerLocation}</label>
              <span className="text-lg font-bold tabular-nums">
                ${roiInputs.monthlyRevenue.toLocaleString(locale)}
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
                background: `linear-gradient(to right, #38BDF8 0%, #38BDF8 ${((roiInputs.monthlyRevenue - 50000) / (500000 - 50000)) * 100}%, #334155 ${((roiInputs.monthlyRevenue - 50000) / (500000 - 50000)) * 100}%, #334155 100%)`,
              }}
            />
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-medium">{copy.currentLaborCost}</label>
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
                background: `linear-gradient(to right, #38BDF8 0%, #38BDF8 ${((roiInputs.laborPercent - 20) / 20) * 100}%, #334155 ${((roiInputs.laborPercent - 20) / 20) * 100}%, #334155 100%)`,
              }}
            />
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-medium">{copy.currentFoodCost}</label>
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
                background: `linear-gradient(to right, #38BDF8 0%, #38BDF8 ${((roiInputs.foodCostPercent - 20) / 20) * 100}%, #334155 ${((roiInputs.foodCostPercent - 20) / 20) * 100}%, #334155 100%)`,
              }}
            />
          </div>

          {hasMarketingModule && (
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm font-medium">{copy.monthlyMarketingSpend}</label>
                <span className="text-lg font-bold tabular-nums">
                  ${(roiInputs.marketingSpend || 0).toLocaleString(locale)}
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
                style={{
                  background: `linear-gradient(to right, #38BDF8 0%, #38BDF8 ${((roiInputs.marketingSpend || 0) / 10000) * 100}%, #334155 ${((roiInputs.marketingSpend || 0) / 10000) * 100}%, #334155 100%)`,
                }}
              />
              {(roiInputs.marketingSpend || 0) === 0 && (
                <p className="text-xs text-amber-400 mt-2 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {copy.addMarketingSpend}
                </p>
              )}
            </div>
          )}

          {hasDeliveryModule && (
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm font-medium">{copy.deliveryRevenuePct}</label>
                <span className="text-lg font-bold tabular-nums">{roiInputs.deliveryRevenuePct || 0}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                step="5"
                value={roiInputs.deliveryRevenuePct || 0}
                onChange={(e) => handleInputChange('deliveryRevenuePct', parseInt(e.target.value))}
                className="w-full h-2 bg-sundae-surface-hover rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #38BDF8 0%, #38BDF8 ${((roiInputs.deliveryRevenuePct || 0) / 50) * 100}%, #334155 ${((roiInputs.deliveryRevenuePct || 0) / 50) * 100}%, #334155 100%)`,
                }}
              />
              {(roiInputs.deliveryRevenuePct || 0) === 0 && (
                <p className="text-xs text-amber-400 mt-2 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {copy.addDeliveryMix}
                </p>
              )}
            </div>
          )}

          {hasGuestModule && (
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">{copy.reviewData}</label>
              <button
                onClick={() => handleInputChange('hasReviewData', !roiInputs.hasReviewData)}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  roiInputs.hasReviewData
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                    : 'bg-sundae-surface-hover text-sundae-muted border border-white/10'
                )}
              >
                {roiInputs.hasReviewData ? copy.yes : copy.no}
              </button>
            </div>
          )}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-xl p-8 border border-green-500/30 mb-8"
      >
        <h3 className="text-lg font-bold mb-6">{copy.projectedReturns}</h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <div>
            <div className="text-sm text-sundae-muted mb-1">{copy.monthlySavings}</div>
            <div className="text-3xl font-bold text-green-400">
              ${roi.monthlySavings.toLocaleString(locale)}
            </div>
          </div>
          <div>
            <div className="text-sm text-sundae-muted mb-1">{copy.annualSavings}</div>
            <div className="text-3xl font-bold text-green-400">
              ${roi.annualSavings.toLocaleString(locale)}
            </div>
          </div>
          <div>
            <div className="text-sm text-sundae-muted mb-1">{copy.roiMultiple}</div>
            <div className="text-3xl font-bold text-green-400">{roi.roi}x</div>
          </div>
          <div>
            <div className="text-sm text-sundae-muted mb-1">{copy.paybackPeriod}</div>
            <div className="text-3xl font-bold text-green-400">
              {formatMessage(copy.days, { count: roi.paybackDays })}
            </div>
          </div>
        </div>

        <div className="p-4 bg-sundae-dark/30 rounded-lg">
          <p className="text-center text-lg">
            {generateROIDescription(roi, locale as PricingUiLocale)}
          </p>
        </div>
      </motion.div>

      {roi.savingsLines.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-sundae-surface rounded-xl p-8 mb-8"
        >
          <h3 className="text-lg font-bold mb-6">{copy.savingsBreakdown}</h3>

          <div className="space-y-4">
            {roi.savingsLines.map((line) => (
              <SavingsLineRow
                key={line.moduleId}
                line={line}
                totalSavings={roi.monthlySavings}
                isHovered={hoveredTooltip === line.moduleId}
                onHover={(id) => setHoveredTooltip(id)}
                locale={locale as PricingUiLocale}
                copy={copy}
              />
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-white/10">
            <p className="text-xs text-sundae-muted flex items-start gap-2">
              <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
              {copy.savingsNote}
            </p>
          </div>
        </motion.div>
      )}

      {modules.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-sundae-surface rounded-xl p-8 mb-8 text-center"
        >
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-sundae-muted" />
          <h3 className="text-lg font-bold mb-2">{copy.noModulesSelected}</h3>
          <p className="text-sundae-muted">{copy.noModulesBody}</p>
        </motion.div>
      )}

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
              <h4 className="font-semibold mb-2">{copy.biggestWins}</h4>
              <p className="text-sm text-sundae-muted">
                {formatMessage(copy.biggestWinsBody, { categories: topCategories.join(', ') })}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
        className="bg-sundae-surface rounded-xl p-8 mb-8"
      >
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <div className="text-sm text-sundae-muted mb-1">{copy.monthlyPlatformCost}</div>
            <div className="text-2xl font-bold">${pricing.total.toLocaleString(locale)}</div>
          </div>
          <div className="text-center px-8">
            <Clock className="w-8 h-8 mx-auto mb-2 text-sundae-accent" />
            <div className="text-sm text-sundae-muted">{copy.paysForItselfIn}</div>
            <div className="text-xl font-bold text-green-400">
              {formatMessage(copy.days, { count: roi.paybackDays })}
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-sundae-muted mb-1">{copy.netMonthlyBenefit}</div>
            <div
              className={cn(
                'text-2xl font-bold',
                roi.monthlySavings - pricing.total > 0 ? 'text-green-400' : 'text-sundae-muted'
              )}
            >
              {roi.monthlySavings - pricing.total > 0 ? '+' : ''}
              ${(roi.monthlySavings - pricing.total).toLocaleString(locale)}
            </div>
          </div>
        </div>
      </motion.div>

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
          <span>{copy.viewSummary}</span>
          <ChevronRight className="w-5 h-5" />
        </button>
      </motion.div>
    </div>
  );
}

function SavingsLineRow({
  line,
  totalSavings,
  isHovered,
  onHover,
  locale,
  copy,
}: {
  line: SavingsLineItem;
  totalSavings: number;
  isHovered: boolean;
  onHover: (id: string | null) => void;
  locale: PricingUiLocale;
  copy: ReturnType<typeof getRoiCopy>;
}) {
  const IconComponent = ICON_MAP[line.icon] || DollarSign;
  const percentage = totalSavings > 0 ? (line.amount / totalSavings) * 100 : 0;
  const showMissing = line.missingInputMessage && !line.isCountedInTotal;

  return (
    <div
      className="relative"
      onMouseEnter={() => onHover(line.moduleId)}
      onMouseLeave={() => onHover(null)}
    >
      <div className="flex justify-between mb-2">
        <span className="text-sm font-medium flex items-center gap-2">
          <IconComponent className="w-4 h-4" />
          {line.label}
          <button className="text-sundae-muted hover:text-white transition-colors">
            <Info className="w-3 h-3" />
          </button>
        </span>
        <span className={cn('text-sm font-bold', showMissing ? 'text-amber-400' : '')}>
          {showMissing ? (
            <span className="text-xs">{line.missingInputMessage}</span>
          ) : (
            `$${line.amount.toLocaleString(locale)}${copy.perMonthShort}`
          )}
        </span>
      </div>

      {!showMissing && (
        <div className="w-full bg-sundae-surface-hover rounded-full h-2">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(percentage, 100)}%` }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className={cn(
              'h-2 rounded-full',
              line.isCountedInTotal
                ? 'bg-gradient-to-r from-green-400 to-emerald-400'
                : 'bg-gradient-to-r from-amber-400/50 to-yellow-400/50'
            )}
          />
        </div>
      )}

      {!line.isCountedInTotal && line.amount > 0 && !showMissing && (
        <p className="text-xs text-amber-400 mt-1 italic">{copy.potentialUpside}</p>
      )}

      {isHovered && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute z-50 left-0 right-0 top-full mt-2 p-3 bg-sundae-dark border border-white/20 rounded-lg shadow-xl"
        >
          <p className="text-xs text-white mb-2">{line.tooltip}</p>
          <div className="text-xs text-sundae-muted">
            <strong>{copy.rangeLabel}:</strong> ${line.rangeMin.toLocaleString(locale)} - $
            {line.rangeMax.toLocaleString(locale)}
            {copy.perMonthShort}
          </div>
        </motion.div>
      )}
    </div>
  );
}
