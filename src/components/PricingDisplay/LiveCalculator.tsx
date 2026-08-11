// Live price calculator component that appears during configuration

import { motion, AnimatePresence } from 'framer-motion';
import { DollarSign, ChevronDown, ChevronUp } from 'lucide-react';
import { useConfiguration } from '../../hooks/useConfiguration';
import { usePriceCalculation } from '../../hooks/usePriceCalculation';
import { useEffect, useRef, useState } from 'react';
import { useLocale } from '../../contexts/LocaleContext';
import {
  getLiveCalculatorCopy,
  type PricingUiLocale,
} from '../../lib/pricingUiCopy';

export function LiveCalculator() {
  const { locale } = useLocale();
  const copy = getLiveCalculatorCopy(locale as PricingUiLocale);
  const { layer, corePackage, locations, addOns, watchtowerModules } = useConfiguration();
  const pricing = usePriceCalculation(layer, corePackage, locations, addOns, watchtowerModules);
  
  const barRef = useRef<HTMLDivElement>(null);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    // Load collapsed state from localStorage
    const saved = localStorage.getItem('sundae-price-bar-collapsed');
    return saved === 'true';
  });
  const [isAutoCollapsed, setIsAutoCollapsed] = useState(false);

  // Update CSS variable for bar height
  useEffect(() => {
    if (barRef.current) {
      const updateHeight = () => {
        const height = barRef.current?.offsetHeight || 0;
        document.documentElement.style.setProperty('--sticky-bar-h', `${height}px`);
      };
      
      updateHeight();
      const resizeObserver = new ResizeObserver(updateHeight);
      resizeObserver.observe(barRef.current);
      
      return () => resizeObserver.disconnect();
    }
  }, [isCollapsed, isAutoCollapsed]);

  // IntersectionObserver to detect CTA zone visibility
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // If CTA is visible and user hasn't manually expanded, auto-collapse
          if (entry.isIntersecting && !isCollapsed) {
            setIsAutoCollapsed(true);
          } else if (!entry.isIntersecting) {
            setIsAutoCollapsed(false);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -100px 0px' }
    );

    // Observe all CTA zones
    const ctaZones = document.querySelectorAll('[data-testid^="continue-button"]');
    ctaZones.forEach((zone) => observer.observe(zone.parentElement || zone));

    return () => observer.disconnect();
  }, [isCollapsed]);

  // Toggle manual collapse and persist
  const toggleCollapse = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    setIsAutoCollapsed(false); // Manual override
    localStorage.setItem('sundae-price-bar-collapsed', String(newState));
  };

  const shouldBeCollapsed = isCollapsed || isAutoCollapsed;

  return (
    <motion.div
      ref={barRef}
      initial={{ opacity: 0, y: 100 }}
      animate={{ 
        opacity: 1, 
        y: 0,
        height: shouldBeCollapsed ? 'auto' : 'auto'
      }}
      exit={{ opacity: 0, y: 100 }}
      className="fixed left-1/2 transform -translate-x-1/2 z-30 max-w-lg w-full mx-4 transition-all"
      style={{ 
        bottom: 'calc(env(safe-area-inset-bottom, 0px) + 1rem)'
      }}
    >
      <div className="bg-gradient-to-br from-sundae-dark to-sundae-surface rounded-xl shadow-2xl border border-white/20 overflow-hidden">
        {shouldBeCollapsed ? (
          /* Collapsed compact pill */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-between p-3 cursor-pointer hover:bg-white/5 transition-colors"
            onClick={toggleCollapse}
          >
            <div className="flex items-center gap-3">
              <DollarSign className="w-5 h-5 text-sundae-accent" />
              <span className="font-bold text-lg tabular-nums">${pricing.total.toLocaleString(locale)}{copy.perMonthShort}</span>
            </div>
            <button
              className="p-1 hover:bg-white/10 rounded transition-colors"
              aria-label={copy.expandAria}
            >
              <ChevronUp className="w-4 h-4" />
            </button>
          </motion.div>
        ) : (
          /* Expanded full view */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="p-4"
          >
            <div className="flex items-center justify-between">
              {/* Left side - Current total */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-xs text-sundae-muted">{copy.monthlyTotal}</div>
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={pricing.total}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="font-display text-2xl font-bold tabular-nums"
                    >
                      ${pricing.total.toLocaleString(locale)}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>

              {/* Right side - Per location and savings */}
              <div className="text-right">
                {/* DERIVED AVERAGE (total / units) — bands are marginal, so
                    this is never a per-location rate card. */}
                <div className="text-xs text-sundae-muted">{copy.avgPerLocation}</div>
                <div className="text-lg font-bold tabular-nums">
                  ${pricing.perLocation.toFixed(0)}
                </div>
                {/* A named-competitor savings badge used to sit here, and it
                    could not survive a commercial review:

                    - It priced the competitor at ELEVEN modules — their most
                      expensive possible configuration — against a Sundae
                      package price. Against a realistic three-module purchase
                      Sundae costs more at every estate size we checked, so the
                      "saving" was an artefact of choosing the competitor's
                      worst case.
                    - It rendered only when `monthlySavings > 0`, so it could
                      never show Sundae losing. A comparison that can only
                      return one answer is a boast, not a comparison.
                    - Neither side included implementation, and the competitor
                      price carried no source or date anywhere in the repo.
                    - A one-line badge has nowhere to state any of that.

                    The credible comparison lives on the summary, where
                    CompactCompetitorCompare shows verification level, source
                    link and the assumptions behind every figure. */}
              </div>

              {/* Minimize button */}
              <button
                onClick={toggleCollapse}
                className="ml-2 p-1 hover:bg-white/10 rounded transition-colors"
                aria-label={copy.minimizeAria}
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>

            {/* Progress bar showing price relative to budget thresholds */}
            <div className="mt-3">
              <div className="h-1 bg-sundae-surface-hover rounded-full overflow-hidden">
                <motion.div
                  animate={{ width: `${Math.min((pricing.total / 2000) * 100, 100)}%` }}
                  transition={{ type: "spring", stiffness: 100 }}
                  className={`h-full rounded-full ${
                    pricing.total < 500 
                      ? 'bg-green-500' 
                      : pricing.total < 1000 
                        ? 'bg-sundae-accent'
                        : pricing.total < 1500
                          ? 'bg-yellow-500'
                          : 'bg-gradient-primary'
                  }`}
                />
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
