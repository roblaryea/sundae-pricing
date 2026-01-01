// Compact multi-competitor comparison widget for summary page
// UPDATED: Now uses comprehensive competitorPricing.ts data

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, TrendingDown, Info, AlertTriangle, X, CheckCircle, AlertCircle } from 'lucide-react';
import { useConfiguration } from '../../hooks/useConfiguration';
import { usePriceCalculation } from '../../hooks/usePriceCalculation';
import { calculateAllComparisons, COMPETITOR_ASSUMPTIONS, COMPETITOR_PRICING, type ComparisonResult } from '../../data/competitorPricing';
import { cn } from '../../utils/cn';

export function CompactCompetitorCompare() {
  const { layer, tier, locations, modules: selectedModules, watchtowerModules } = useConfiguration();
  const pricing = usePriceCalculation(layer, tier, locations, selectedModules, watchtowerModules);
  
  const [expandedCompetitor, setExpandedCompetitor] = useState<string | null>(null);
  const [showAssumptions, setShowAssumptions] = useState(false);
  
  // Calculate all competitor comparisons using new system
  const allModules = [...selectedModules, `${layer}-${tier}`];
  const comparisons = calculateAllComparisons(locations, allModules, pricing.total);
  
  // Split into savings vs costs more
  const savingsComparisons = comparisons.filter(c => c.savings.firstYear > 0);
  const costsMoreComparisons = comparisons.filter(c => c.savings.firstYear <= 0);
  
  const bestSavings = savingsComparisons[0];
  
  return (
    <div className="compact-competitor-compare">
      {/* Header with assumptions button */}
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-lg font-semibold flex items-center gap-2">
          <TrendingDown className="w-5 h-5 text-green-400" />
          How You Compare
        </h4>
        <button
          onClick={() => setShowAssumptions(!showAssumptions)}
          className="text-xs text-slate-500 hover:text-slate-400 flex items-center gap-1 transition-colors"
        >
          <Info className="w-3 h-3" />
          {showAssumptions ? 'Hide' : 'View'} assumptions
        </button>
      </div>
      
      {/* Assumptions Panel */}
      <AnimatePresence>
        {showAssumptions && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mb-4"
          >
            <div className="bg-slate-800/50 rounded-lg p-4 text-xs text-slate-400 space-y-2 border border-slate-700">
              <p className="text-slate-300 font-medium mb-2">Pricing Sources & Assumptions:</p>
              {Object.entries(COMPETITOR_ASSUMPTIONS).slice(0, 4).map(([id, data]) => (
                <p key={id}>
                  <strong className="text-slate-300 capitalize">{id}:</strong> {data.notes} 
                  <span className="text-slate-500"> ({data.source})</span>
                </p>
              ))}
              <p className="text-amber-500/70 mt-3">
                ⚠️ Competitor pricing may vary. Contact vendors for exact quotes.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Competitor cards - show savings first */}
      {savingsComparisons.length > 0 && (
        <div className="space-y-3 mb-4">
          {savingsComparisons.map((comparison) => (
            <ComparisonCard
              key={comparison.competitor.id}
              comparison={comparison}
              isExpanded={expandedCompetitor === comparison.competitor.id}
              onToggle={() => setExpandedCompetitor(
                expandedCompetitor === comparison.competitor.id ? null : comparison.competitor.id
              )}
              isBest={comparison === bestSavings}
            />
          ))}
        </div>
      )}
      
      {/* Best savings highlight */}
      {bestSavings && (
        <div className="mb-4 p-4 bg-gradient-to-r from-green-900/30 to-emerald-900/30 border border-green-500/30 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-green-400 font-medium">Best Savings Opportunity</div>
              <div className="text-sm text-slate-400">
                vs {bestSavings.competitor.name}
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-400">
                ${bestSavings.savings.firstYear.toLocaleString()}
              </div>
              <div className="text-xs text-slate-400">first year</div>
            </div>
          </div>
        </div>
      )}
      
      {/* Competitors where Sundae costs more - honest positioning */}
      {costsMoreComparisons.length > 0 && (
        <div className="mt-4">
          <div className="text-xs text-slate-500 mb-2 flex items-center gap-2">
            <AlertTriangle className="w-3 h-3" />
            Note: Some point solutions may be cheaper if you only need specific features
          </div>
          <div className="flex flex-wrap gap-2">
            {costsMoreComparisons.map(c => (
              <span 
                key={c.competitor.id} 
                className="text-xs bg-slate-800 px-2 py-1 rounded border border-slate-700"
              >
                {c.competitor.icon} {c.competitor.name} ({c.competitor.category})
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPARISON CARD COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

interface ComparisonCardProps {
  comparison: ComparisonResult;
  isExpanded: boolean;
  onToggle: () => void;
  isBest: boolean;
}

function ComparisonCard({ comparison, isExpanded, onToggle, isBest }: ComparisonCardProps) {
  // Get verification info
  const competitor = COMPETITOR_PRICING[comparison.competitor.id];
  const verification = competitor?.verification || 'estimated';
  
  return (
    <div
      className={cn(
        'bg-slate-800/50 rounded-lg border transition-all',
        isBest 
          ? 'border-green-500/50 ring-1 ring-green-500/20' 
          : isExpanded 
            ? 'border-amber-500/50' 
            : 'border-slate-700 hover:border-slate-600'
      )}
    >
      {/* Main row - always visible */}
      <button
        onClick={onToggle}
        className="w-full p-4 flex items-center justify-between text-left"
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <span className="text-lg flex-shrink-0">{comparison.competitor.icon}</span>
          <div className="min-w-0 flex-1">
            <div className="font-medium text-white flex items-start gap-2 flex-wrap">
              <span className="break-words">vs {comparison.competitor.name}</span>
              {isBest && (
                <span className="text-xs bg-green-900/50 text-green-400 px-2 py-0.5 rounded border border-green-500/30 whitespace-nowrap flex-shrink-0">
                  Best savings
                </span>
              )}
              <VerificationBadge level={verification} />
            </div>
            <div className="text-xs text-slate-400 mt-0.5 break-words">{comparison.competitor.category}</div>
          </div>
        </div>
        
        <div className="flex items-center gap-4 flex-shrink-0">
          <div className="text-right">
            <div className="text-green-400 font-bold whitespace-nowrap">
              Save ${comparison.savings.firstYear.toLocaleString()}
            </div>
            <div className="text-xs text-slate-400 whitespace-nowrap">first year</div>
          </div>
          <ChevronDown 
            className={cn(
              'w-5 h-5 text-slate-400 transition-transform flex-shrink-0',
              isExpanded && 'rotate-180'
            )} 
          />
        </div>
      </button>
      
      {/* Expanded details */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-2 border-t border-slate-700/50">
              {/* Cost breakdown */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-slate-900/50 rounded-lg p-3">
                  <div className="text-xs text-slate-500 mb-1">
                    {comparison.competitor.name} First Year
                  </div>
                  <div className="text-lg font-bold text-white">
                    ${comparison.competitorCost.firstYear.toLocaleString()}
                  </div>
                  {comparison.competitorCost.breakdown && (
                    <div className="mt-2 space-y-1 text-xs text-slate-400">
                      {Object.entries(comparison.competitorCost.breakdown).slice(0, 3).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                          <span>${(value as number).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="bg-amber-900/20 rounded-lg p-3 border border-amber-500/20">
                  <div className="text-xs text-slate-500 mb-1">Sundae First Year</div>
                  <div className="text-lg font-bold text-amber-400">
                    ${comparison.sundaeCost.annual.toLocaleString()}
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    No setup fees
                  </div>
                </div>
              </div>
              
              {/* Notes */}
              {comparison.notes && (
                <div className="flex items-start gap-2 text-xs text-amber-400 bg-amber-900/10 rounded p-2 mb-3">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{comparison.notes}</span>
                </div>
              )}
              
              {/* Limitations */}
              <div>
                <div className="text-xs text-slate-500 mb-2">
                  What {comparison.competitor.name} doesn't offer:
                </div>
                <div className="flex flex-wrap gap-1">
                  {comparison.limitations.slice(0, 4).map((limitation, i) => (
                    <span 
                      key={i} 
                      className="text-xs bg-slate-800 text-slate-400 px-2 py-1 rounded flex items-center gap-1"
                    >
                      <X className="w-3 h-3 text-red-400" />
                      {limitation}
                    </span>
                  ))}
                  {comparison.limitations.length > 4 && (
                    <span className="text-xs text-slate-500">
                      +{comparison.limitations.length - 4} more
                    </span>
                  )}
                </div>
              </div>
              
              {/* Pricing source */}
              {competitor?.sourceUrl && (
                <div className="text-xs text-slate-500 mt-2">
                  <a 
                    href={competitor.sourceUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:text-slate-400 underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    View {comparison.competitor.name} pricing →
                  </a>
                </div>
              )}
              
              {/* Ongoing savings */}
              <div className="pt-3 mt-3 border-t border-slate-700">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Ongoing annual savings</span>
                  <span className="text-green-400 font-medium">
                    ${comparison.savings.ongoing.toLocaleString()}/year
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// VERIFICATION BADGE COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

interface VerificationBadgeProps {
  level: 'verified' | 'estimated' | 'unverified';
}

function VerificationBadge({ level }: VerificationBadgeProps) {
  const config = {
    verified: {
      icon: CheckCircle,
      className: 'bg-green-900/30 text-green-400 border-green-500/30',
      label: 'Verified'
    },
    estimated: {
      icon: AlertCircle,
      className: 'bg-amber-900/30 text-amber-400 border-amber-500/30',
      label: 'Estimated'
    },
    unverified: {
      icon: AlertTriangle,
      className: 'bg-red-900/30 text-red-400 border-red-500/30',
      label: 'Unverified'
    }
  }[level];
  
  const Icon = config.icon;
  
  return (
    <span className={cn(
      'text-xs px-2 py-0.5 rounded border flex items-center gap-1',
      config.className
    )}>
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
}
