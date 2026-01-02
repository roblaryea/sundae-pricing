// Watchtower Strategic Value Display - Scenario-Based (Defensible)

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Zap, Target, Info, Castle } from 'lucide-react';
import { useConfiguration } from '../../hooks/useConfiguration';
import { calculateWatchtowerValue } from '../../lib/watchtowerValueScenarios';
import { calculateWatchtowerPrice } from '../../lib/watchtowerEngine';
import { cn } from '../../utils/cn';

export function WatchtowerValue() {
  const { locations, watchtowerModules } = useConfiguration();
  const [expandedModule, setExpandedModule] = useState<string | null>(null);
  
  // Skip if no Watchtower selected
  if (!watchtowerModules || watchtowerModules.length === 0) {
    return null;
  }
  
  // Default revenue assumption (can be made configurable later)
  const monthlyRevenuePerLocation = 100000;
  
  // Get Watchtower cost
  const watchtowerPricing = useMemo(() => 
    calculateWatchtowerPrice(watchtowerModules as any[], locations),
    [watchtowerModules, locations]
  );
  
  // Get value scenarios
  const valueResult = useMemo(() => 
    calculateWatchtowerValue(
      watchtowerModules,
      locations,
      monthlyRevenuePerLocation,
      watchtowerPricing.total
    ),
    [watchtowerModules, locations, watchtowerPricing.total]
  );
  
  const annualCost = watchtowerPricing.total * 12;
  
  return (
    <div className="watchtower-value bg-gradient-to-r from-watchtower/10 to-red-500/10 dark:from-watchtower/20 dark:to-red-500/20 rounded-xl p-6 border border-watchtower/30">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Castle className="w-6 h-6 text-watchtower" />
          <h3 className="text-lg font-semibold">Watchtower Strategic Value</h3>
        </div>
        <span className="text-xs bg-watchtower/20 text-watchtower px-2 py-1 rounded-full">
          Intelligence Advantage
        </span>
      </div>
      
      {/* One Win Message */}
      <div className="bg-watchtower/10 dark:bg-watchtower/20 rounded-lg p-4 mb-6 border border-watchtower/30">
        <div className="flex items-start gap-3">
          <Target className="w-5 h-5 text-watchtower flex-shrink-0 mt-0.5" />
          <div>
            <div className="font-medium mb-1">One Win Pays for the Year</div>
            <div className="text-sm text-sundae-muted">
              Your Watchtower investment: <span className="text-watchtower font-medium">${annualCost.toLocaleString()}/year</span>
            </div>
            <div className="text-sm text-sundae-muted mt-1">
              Just one of these scenarios covers it: {valueResult.breakevenScenario}
            </div>
          </div>
        </div>
      </div>
      
      {/* Module Scenarios */}
      <div className="space-y-4">
        {valueResult.modules.map(module => (
          <ModuleValueCard
            key={module.id}
            module={module}
            isExpanded={expandedModule === module.id}
            onToggle={() => setExpandedModule(expandedModule === module.id ? null : module.id)}
          />
        ))}
      </div>
      
      {/* Total Value Range */}
      <div className="mt-6 pt-6 border-t border-watchtower/20">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sundae-muted">Potential Annual Value</span>
          <div className="text-right">
            <div className="text-xl font-bold text-watchtower">
              ${valueResult.totalAnnualRange.low.toLocaleString()} – ${valueResult.totalAnnualRange.high.toLocaleString()}
            </div>
            <div className="text-xs text-sundae-muted">
              {valueResult.roiRange.low}x – {valueResult.roiRange.high}x potential ROI
            </div>
          </div>
        </div>
      </div>
      
      {/* Disclaimer */}
      <div className="mt-4 flex items-start gap-2 text-xs text-sundae-muted">
        <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
        <p>
          Strategic value estimates based on typical scenarios. Actual impact depends on market 
          conditions, competitive landscape, and actions taken on insights. Unlike operational 
          savings, strategic value is opportunistic — it materializes when opportunities arise 
          and you act on them.
        </p>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MODULE VALUE CARD
// ═══════════════════════════════════════════════════════════════════════════

interface ModuleValueCardProps {
  module: {
    id: string;
    name: string;
    icon: string;
    tagline: string;
    scenarios: {
      title: string;
      description: string;
      impact: number;
      explanation: string;
      frequency: string;
      confidence: string;
    }[];
    annualRange: { low: number; mid: number; high: number };
    oneWinExample: { description: string; typicalValue: number };
  };
  isExpanded: boolean;
  onToggle: () => void;
}

function ModuleValueCard({ module, isExpanded, onToggle }: ModuleValueCardProps) {
  return (
    <div className="bg-sundae-surface rounded-lg overflow-hidden border border-white/10">
      {/* Header */}
      <button
        onClick={onToggle}
        className="w-full p-4 flex items-center justify-between hover:bg-sundae-surface-hover transition-colors"
      >
        <div className="flex items-center gap-3">
          {(() => {
            const IconComponent = module.icon === '📅' ? import('lucide-react').then(m => m.CalendarDays) : 
                                  module.icon === '📈' ? import('lucide-react').then(m => m.TrendingUp) : 
                                  Castle;
            return typeof IconComponent === 'object' ? <Castle className="w-5 h-5" /> : <IconComponent className="w-5 h-5" />;
          })()}
          <div className="text-left">
            <div className="font-medium">{module.name}</div>
            <div className="text-xs text-sundae-muted">{module.tagline}</div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-watchtower font-medium">
              ${module.annualRange.low.toLocaleString()} – ${module.annualRange.high.toLocaleString()}
            </div>
            <div className="text-xs text-sundae-muted">annual potential</div>
          </div>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-sundae-muted" />
          ) : (
            <ChevronDown className="w-5 h-5 text-sundae-muted" />
          )}
        </div>
      </button>
      
      {/* Expanded Scenarios */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3">
              {module.scenarios.map((scenario, index) => (
                <div 
                  key={index}
                  className="bg-black/20 dark:bg-black/40 rounded-lg p-3 border-l-2 border-watchtower/50"
                >
                  <div className="flex items-start justify-between mb-1">
                    <div className="font-medium text-sm">{scenario.title}</div>
                    <div className="text-watchtower font-medium text-sm">
                      ${scenario.impact.toLocaleString()}
                    </div>
                  </div>
                  <div className="text-xs text-sundae-muted mb-2">{scenario.description}</div>
                  <div className="flex items-center gap-4 text-xs">
                    <span className="text-sundae-muted">
                      <span className="opacity-70">Frequency:</span> {scenario.frequency}
                    </span>
                    <ConfidenceBadge confidence={scenario.confidence} />
                  </div>
                </div>
              ))}
              
              {/* One Win Highlight */}
              <div className="bg-green-500/10 dark:bg-green-500/20 rounded-lg p-3 border border-green-500/30">
                <div className="flex items-center gap-2 text-sm">
                  <Zap className="w-4 h-4 text-green-400" />
                  <span className="text-green-300 dark:text-green-400">
                    <strong>One win:</strong> {module.oneWinExample.description} = ${module.oneWinExample.typicalValue.toLocaleString()}
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
// CONFIDENCE BADGE
// ═══════════════════════════════════════════════════════════════════════════

function ConfidenceBadge({ confidence }: { confidence: string }) {
  const config = {
    high: { label: 'Measurable', color: 'text-green-400 bg-green-500/20' },
    medium: { label: 'Likely', color: 'text-amber-400 bg-amber-500/20' },
    low: { label: 'Variable', color: 'text-slate-400 bg-slate-500/20' }
  }[confidence] || { label: confidence, color: 'text-slate-400 bg-slate-500/20' };
  
  return (
    <span className={cn('px-2 py-0.5 rounded text-xs', config.color)}>
      {config.label}
    </span>
  );
}
