// Compact multi-competitor comparison widget for summary page

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, TrendingDown, DollarSign } from 'lucide-react';
import { useConfiguration } from '../../hooks/useConfiguration';
import { usePriceCalculation } from '../../hooks/usePriceCalculation';
import { competitors, type CompetitorId, calculateSavingsVsCompetitor, competitorQuizOptions } from '../../data/competitors';
import { cn } from '../../utils/cn';

// Default competitors to show if none selected
const DEFAULT_COMPETITORS: CompetitorId[] = ['tenzo', 'powerbi', 'excel'];

export function CompactCompetitorCompare() {
  const { layer, tier, locations, modules: selectedModules, watchtowerModules, competitors: selectedCompetitors } = useConfiguration();
  const pricing = usePriceCalculation(layer, tier, locations, selectedModules, watchtowerModules);
  
  const [expandedCompetitor, setExpandedCompetitor] = useState<CompetitorId | null>(null);
  
  // Get competitors to compare - from quiz selection or defaults
  const competitorsToShow = selectedCompetitors?.current?.filter(c => c !== 'nothing')?.length > 0
    ? selectedCompetitors.current.filter(c => c !== 'nothing')
    : DEFAULT_COMPETITORS;
  
  // Calculate savings for each competitor
  const comparisons = competitorsToShow.map(id => {
    const savings = calculateSavingsVsCompetitor(pricing.total, id, locations, selectedModules);
    const monthlySavings = savings.monthly - pricing.total;
    
    return {
      id,
      info: competitors[id],
      savings: {
        monthly: monthlySavings,
        setup: savings.setup,
        firstYear: (monthlySavings * 12) + savings.setup
      }
    };
  });
  
  // Sort by first year savings (highest first)
  comparisons.sort((a, b) => b.savings.firstYear - a.savings.firstYear);
  
  // Get icon for competitor
  const getIcon = (id: CompetitorId) => {
    const option = competitorQuizOptions.find(o => o.id === id);
    return option?.icon || '📊';
  };
  
  return (
    <div className="compact-competitor-compare">
      <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <TrendingDown className="w-5 h-5 text-green-400" />
        How You Compare
      </h4>
      
      {/* Competitor cards */}
      <div className="space-y-3">
        {comparisons.map(({ id, info, savings }) => (
          <div
            key={id}
            className={cn(
              'bg-slate-800/50 rounded-lg border transition-all',
              expandedCompetitor === id 
                ? 'border-amber-500/50' 
                : 'border-slate-700 hover:border-slate-600'
            )}
          >
            {/* Main row - always visible */}
            <button
              onClick={() => setExpandedCompetitor(expandedCompetitor === id ? null : id)}
              className="w-full p-4 flex items-center justify-between text-left"
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">{getIcon(id)}</span>
                <div>
                  <div className="font-medium text-white">vs {info.name}</div>
                  <div className="text-xs text-slate-400">{info.tagline}</div>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                {savings.firstYear > 0 ? (
                  <div className="text-right">
                    <div className="text-green-400 font-bold">
                      Save ${savings.firstYear.toLocaleString()}
                    </div>
                    <div className="text-xs text-slate-400">first year</div>
                  </div>
                ) : (
                  <div className="text-right">
                    <div className="text-slate-400 text-sm">Similar cost</div>
                  </div>
                )}
                <ChevronDown 
                  className={cn(
                    'w-5 h-5 text-slate-400 transition-transform',
                    expandedCompetitor === id && 'rotate-180'
                  )} 
                />
              </div>
            </button>
            
            {/* Expanded details */}
            <AnimatePresence>
              {expandedCompetitor === id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-4 pt-2 border-t border-slate-700/50">
                    {/* Quick stats */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="text-center p-2 bg-slate-900/50 rounded">
                        <DollarSign className="w-4 h-4 text-green-400 mx-auto mb-1" />
                        <div className="text-sm font-medium text-white">
                          ${Math.abs(savings.monthly).toLocaleString()}
                        </div>
                        <div className="text-xs text-slate-500">monthly savings</div>
                      </div>
                      
                      {savings.setup > 0 && (
                        <div className="text-center p-2 bg-slate-900/50 rounded">
                          <DollarSign className="w-4 h-4 text-amber-400 mx-auto mb-1" />
                          <div className="text-sm font-medium text-white">
                            ${savings.setup.toLocaleString()}
                          </div>
                          <div className="text-xs text-slate-500">setup avoided</div>
                        </div>
                      )}
                    </div>
                    
                    {/* What Sundae adds */}
                    <div className="text-xs text-slate-400 mb-2">What Sundae gives you:</div>
                    <div className="flex flex-wrap gap-2">
                      {info.sundaeAdvantages.slice(0, 3).map((adv, i) => (
                        <span 
                          key={i}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-green-900/30 text-green-400 rounded text-xs"
                        >
                          {adv}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
      
      {/* Best savings highlight */}
      {comparisons.length > 0 && comparisons[0].savings.firstYear > 0 && (
        <div className="mt-4 p-4 bg-gradient-to-r from-green-900/30 to-emerald-900/30 border border-green-500/30 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-green-400 font-medium">Best Savings Opportunity</div>
              <div className="text-sm text-slate-400">
                vs {competitors[comparisons[0].id].name}
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-400">
                ${comparisons[0].savings.firstYear.toLocaleString()}
              </div>
              <div className="text-xs text-slate-400">first year</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
