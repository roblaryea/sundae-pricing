// Watchtower Strategic Value Display - Scenario-Based (Defensible)

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Zap, Target, Info, Castle, Search, Calendar, TrendingUp } from 'lucide-react';
import { useConfiguration } from '../../hooks/useConfiguration';
import { calculateWatchtowerValue } from '../../lib/watchtowerValueScenarios';
import { calculateWatchtowerPrice, type WatchtowerModuleId } from '../../lib/watchtowerEngine';
import { cn } from '../../utils/cn';
import { useLocale } from '../../contexts/LocaleContext';

const localizedWatchtowerCopy = {
  en: {
    title: 'Watchtower Strategic Value',
    badge: 'Intelligence Advantage',
    oneWin: 'One Win Pays for the Year',
    oneWinLabel: 'One win',
    investment: 'Your Watchtower investment:',
    scenariosCover: 'Just one of these scenarios covers it:',
    annualValue: 'Potential Annual Value',
    annualPotential: 'annual potential',
    frequency: 'Frequency:',
    disclaimer:
      'Strategic value estimates based on typical scenarios. Actual impact depends on market conditions, competitive landscape, and actions taken on insights. Unlike operational savings, strategic value is opportunistic - it materializes when opportunities arise and you act on them.',
    confidence: {
      high: 'Measurable',
      medium: 'Likely',
      low: 'Variable',
    },
  },
  ar: {
    title: 'القيمة الاستراتيجية لـ Watchtower',
    badge: 'ميزة ذكية',
    oneWin: 'فوز واحد يكفي للسنة',
    oneWinLabel: 'فوز واحد',
    investment: 'استثمارك في Watchtower:',
    scenariosCover: 'سيناريو واحد من هذه السيناريوهات يكفي:',
    annualValue: 'القيمة السنوية المحتملة',
    annualPotential: 'احتمال سنوي',
    frequency: 'التكرار:',
    disclaimer:
      'تقديرات القيمة الاستراتيجية تعتمد على سيناريوهات نموذجية. يعتمد الأثر الفعلي على ظروف السوق والمشهد التنافسي والإجراءات المتخذة بناءً على الرؤى. وعلى عكس الوفورات التشغيلية، فإن القيمة الاستراتيجية تظهر عند توفر الفرصة واتخاذك الإجراء.',
    confidence: {
      high: 'قابل للقياس',
      medium: 'مرجح',
      low: 'متغير',
    },
  },
  fr: {
    title: 'Valeur strategique de Watchtower',
    badge: 'Avantage intelligence',
    oneWin: 'Un seul gain paie l annee',
    oneWinLabel: 'Un seul gain',
    investment: 'Votre investissement Watchtower :',
    scenariosCover: 'Un seul de ces scenarios suffit :',
    annualValue: 'Valeur annuelle potentielle',
    annualPotential: 'potentiel annuel',
    frequency: 'Frequence :',
    disclaimer:
      'Les estimations de valeur strategique reposent sur des scenarios typiques. L impact reel depend des conditions du marche, du paysage concurrentiel et des actions prises sur les insights. Contrairement aux economies operationnelles, la valeur strategique est opportuniste - elle se materialise lorsque des opportunites apparaissent et que vous agissez.',
    confidence: {
      high: 'Mesurable',
      medium: 'Probable',
      low: 'Variable',
    },
  },
  es: {
    title: 'Valor estrategico de Watchtower',
    badge: 'Ventaja de inteligencia',
    oneWin: 'Un acierto paga el ano',
    oneWinLabel: 'Un acierto',
    investment: 'Tu inversion en Watchtower:',
    scenariosCover: 'Solo uno de estos escenarios lo cubre:',
    annualValue: 'Valor anual potencial',
    annualPotential: 'potencial anual',
    frequency: 'Frecuencia:',
    disclaimer:
      'Las estimaciones de valor estrategico se basan en escenarios tipicos. El impacto real depende de las condiciones del mercado, del panorama competitivo y de las acciones tomadas sobre los insights. A diferencia del ahorro operativo, el valor estrategico es oportunista: aparece cuando surgen oportunidades y actuas sobre ellas.',
    confidence: {
      high: 'Medible',
      medium: 'Probable',
      low: 'Variable',
    },
  },
} as const;

const WATCHTOWER_ICON_MAP = {
  search: Search,
  calendar: Calendar,
  'trending-up': TrendingUp,
} as const;

const localizedWatchtowerScenarios = {
  en: {
    competitive: [
      {
        title: 'Pricing Optimization',
        description: 'Spot competitor price increase, follow on portion of menu',
        oneWin: 'Following one competitor price increase',
      },
      {
        title: 'Market Share Protection',
        description: 'Early warning on competitive threats',
        oneWin: 'Protecting market share before a threat lands',
      },
      {
        title: 'Menu Intelligence',
        description: 'Spot trending item at competitor - fast-follow strategy',
        oneWin: 'One competitor menu signal worth acting on',
      },
    ],
    events: [
      {
        title: 'Major Event Preparation',
        description: 'Optimal staffing and inventory for local events',
        oneWin: 'Perfect preparation for 2 major events',
      },
      {
        title: 'Staffing Optimization',
        description: 'Right staff levels for predicted demand',
        oneWin: 'One staffing fix that prevents overspend',
      },
      {
        title: 'Inventory Preparation',
        description: 'Stock up before demand spike - no 86\'d items, less waste',
        oneWin: 'Avoiding one stockout event',
      },
    ],
    trends: [
      {
        title: 'Trend-Informed Menu Addition',
        description: 'Add trending item that captures demand',
        oneWin: 'One successful trend-informed menu item',
      },
      {
        title: 'Concept Validation',
        description: 'Data-informed decision on new location or concept',
        oneWin: 'Avoiding one bad expansion decision',
      },
      {
        title: 'Demographic Shift Awareness',
        description: 'Adapt to changing neighborhood before revenue drops',
        oneWin: 'Staying ahead of one neighborhood shift',
      },
    ],
  },
  ar: {
    competitive: [
      {
        title: 'تحسين التسعير',
        description: 'رصد زيادة أسعار المنافسين والتجاوب معها في جزء من القائمة',
        oneWin: 'متابعة زيادة سعر واحدة لدى منافس',
      },
      {
        title: 'حماية الحصة السوقية',
        description: 'إنذار مبكر بالتهديدات التنافسية',
        oneWin: 'حماية الحصة قبل وصول التهديد',
      },
      {
        title: 'ذكاء القائمة',
        description: 'رصد عنصر رائج لدى المنافس والتحرك بسرعة',
        oneWin: 'إشارة قائمة واحدة تستحق التنفيذ',
      },
    ],
    events: [
      {
        title: 'الاستعداد للفعاليات الكبرى',
        description: 'توظيف ومخزون مثاليان للفعاليات المحلية',
        oneWin: 'استعداد مثالي لفعاليتين كبيرتين',
      },
      {
        title: 'تحسين التوظيف',
        description: 'مستويات موظفين مناسبة للطلب المتوقع',
        oneWin: 'تصحيح توظيف واحد يمنع الهدر',
      },
      {
        title: 'الاستعداد للمخزون',
        description: 'التخزين قبل ارتفاع الطلب لتقليل النقص والهدر',
        oneWin: 'تجنب حالة نفاد واحدة',
      },
    ],
    trends: [
      {
        title: 'إضافة قائمة مبنية على الاتجاهات',
        description: 'إضافة عنصر رائج يلتقط الطلب',
        oneWin: 'عنصر قائمة ناجح واحد',
      },
      {
        title: 'التحقق من المفهوم',
        description: 'قرار مدفوع بالبيانات بشأن موقع أو مفهوم جديد',
        oneWin: 'تجنب قرار توسع سيئ واحد',
      },
      {
        title: 'وعي بالتحول الديموغرافي',
        description: 'التكيف مع الحي قبل انخفاض الإيرادات',
        oneWin: 'السبق لتحول واحد في الحي',
      },
    ],
  },
  fr: {
    competitive: [
      {
        title: 'Optimisation des prix',
        description: 'Detecter une hausse de prix concurrente et suivre une partie du menu',
        oneWin: 'Suivre une hausse de prix concurrente',
      },
      {
        title: 'Protection de part de marche',
        description: 'Alerte precoce sur les menaces concurrentielles',
        oneWin: 'Protegger la part de marche avant une menace',
      },
      {
        title: 'Intelligence menu',
        description: 'Repere un plat tendance chez un concurrent pour agir vite',
        oneWin: 'Un signal menu concurrent a exploiter',
      },
    ],
    events: [
      {
        title: 'Preparation aux grands evenements',
        description: 'Staffing et stock optimaux pour les evenements locaux',
        oneWin: 'Preparation parfaite pour 2 grands evenements',
      },
      {
        title: 'Optimisation du staffing',
        description: 'Bon niveau d effectif pour la demande prevue',
        oneWin: 'Un ajustement de staffing qui evite le surcout',
      },
      {
        title: 'Preparation des stocks',
        description: 'Anticiper la demande pour limiter les ruptures et le gaspillage',
        oneWin: 'Eviter une rupture de stock',
      },
    ],
    trends: [
      {
        title: 'Ajout de menu guide par les tendances',
        description: 'Ajouter un item tendance pour capter la demande',
        oneWin: 'Un item tendance qui fonctionne',
      },
      {
        title: 'Validation de concept',
        description: 'Decision data-driven pour un nouveau site ou concept',
        oneWin: 'Eviter une mauvaise decision d expansion',
      },
      {
        title: 'Suivi des changements demographiques',
        description: 'S adapter au quartier avant la baisse de revenu',
        oneWin: 'Prendre de l avance sur un changement de quartier',
      },
    ],
  },
  es: {
    competitive: [
      {
        title: 'Optimizacion de precios',
        description: 'Detecta una subida de precios de un competidor y responde en parte del menu',
        oneWin: 'Seguir una subida de precio de un competidor',
      },
      {
        title: 'Proteccion de cuota de mercado',
        description: 'Aviso temprano sobre amenazas competitivas',
        oneWin: 'Proteger la cuota antes de que llegue la amenaza',
      },
      {
        title: 'Inteligencia de menu',
        description: 'Detecta un articulo en tendencia en un competidor y reacciona rapido',
        oneWin: 'Una señal de menu que vale la pena actuar',
      },
    ],
    events: [
      {
        title: 'Preparacion para grandes eventos',
        description: 'Personal e inventario optimos para eventos locales',
        oneWin: 'Preparacion perfecta para 2 grandes eventos',
      },
      {
        title: 'Optimizacion de personal',
        description: 'Niveles adecuados de staff para la demanda prevista',
        oneWin: 'Un ajuste de personal que evita sobrecoste',
      },
      {
        title: 'Preparacion de inventario',
        description: 'Asegura stock antes del pico de demanda y reduce desperdicio',
        oneWin: 'Evitar una ruptura de stock',
      },
    ],
    trends: [
      {
        title: 'Adicion de menu guiada por tendencias',
        description: 'Anade un producto en tendencia que capture demanda',
        oneWin: 'Un articulo de tendencia que funciona',
      },
      {
        title: 'Validacion de concepto',
        description: 'Decision basada en datos para un nuevo local o concepto',
        oneWin: 'Evitar una mala decision de expansion',
      },
      {
        title: 'Seguimiento del cambio demografico',
        description: 'Adaptarse al barrio antes de que caigan los ingresos',
        oneWin: 'Ir por delante de un cambio de barrio',
      },
    ],
  },
} as const;

function localizeBreakevenScenario(locale: keyof typeof localizedWatchtowerScenarios, scenario: string): string {
  const match = {
    en: {
      'Following one competitor price increase': 'Following one competitor price increase',
      'Protecting market share before a threat lands': 'Protecting market share before a threat lands',
      'One competitor menu signal worth acting on': 'One competitor menu signal worth acting on',
      'Perfect preparation for 2 major events': 'Perfect preparation for 2 major events',
      'One staffing fix that prevents overspend': 'One staffing fix that prevents overspend',
      'Avoiding one stockout event': 'Avoiding one stockout event',
      'One successful trend-informed menu item': 'One successful trend-informed menu item',
      'Avoiding one bad expansion decision': 'Avoiding one bad expansion decision',
      'Staying ahead of one neighborhood shift': 'Staying ahead of one neighborhood shift',
      'Combined wins across modules': 'Combined wins across modules',
    },
    ar: {
      'Following one competitor price increase': 'متابعة زيادة سعر واحدة لدى منافس',
      'Protecting market share before a threat lands': 'حماية الحصة قبل وصول التهديد',
      'One competitor menu signal worth acting on': 'إشارة قائمة واحدة تستحق التنفيذ',
      'Perfect preparation for 2 major events': 'استعداد مثالي لفعاليتين كبيرتين',
      'One staffing fix that prevents overspend': 'تصحيح توظيف واحد يمنع الهدر',
      'Avoiding one stockout event': 'تجنب حالة نفاد واحدة',
      'One successful trend-informed menu item': 'عنصر قائمة ناجح واحد',
      'Avoiding one bad expansion decision': 'تجنب قرار توسع سيئ واحد',
      'Staying ahead of one neighborhood shift': 'السبق لتحول واحد في الحي',
      'Combined wins across modules': 'مكاسب مجمعة عبر الوحدات',
    },
    fr: {
      'Following one competitor price increase': 'Suivre une hausse de prix concurrente',
      'Protecting market share before a threat lands': 'Protegger la part de marche avant une menace',
      'One competitor menu signal worth acting on': 'Un signal menu concurrent a exploiter',
      'Perfect preparation for 2 major events': 'Preparation parfaite pour 2 grands evenements',
      'One staffing fix that prevents overspend': 'Un ajustement de staffing qui evite le surcout',
      'Avoiding one stockout event': 'Eviter une rupture de stock',
      'One successful trend-informed menu item': 'Un item tendance qui fonctionne',
      'Avoiding one bad expansion decision': 'Eviter une mauvaise decision d expansion',
      'Staying ahead of one neighborhood shift': 'Prendre de l avance sur un changement de quartier',
      'Combined wins across modules': 'Gains combines entre modules',
    },
    es: {
      'Following one competitor price increase': 'Seguir una subida de precio de un competidor',
      'Protecting market share before a threat lands': 'Proteger la cuota antes de que llegue la amenaza',
      'One competitor menu signal worth acting on': 'Una senal de menu que vale la pena actuar',
      'Perfect preparation for 2 major events': 'Preparacion perfecta para 2 grandes eventos',
      'One staffing fix that prevents overspend': 'Un ajuste de personal que evita sobrecoste',
      'Avoiding one stockout event': 'Evitar una ruptura de stock',
      'One successful trend-informed menu item': 'Un articulo de tendencia que funciona',
      'Avoiding one bad expansion decision': 'Evitar una mala decision de expansion',
      'Staying ahead of one neighborhood shift': 'Ir por delante de un cambio de barrio',
      'Combined wins across modules': 'Ganancias combinadas entre modulos',
    },
  }[locale] ?? {};

  return match[scenario as keyof typeof match] ?? scenario;
}

function getLocalizedScenarioCopy(
  locale: keyof typeof localizedWatchtowerScenarios,
  moduleId: string,
  index: number,
  fallback: { title: string; description: string; oneWin: string }
) {
  const moduleCopy = localizedWatchtowerScenarios[locale][moduleId as keyof typeof localizedWatchtowerScenarios.en];
  const scenarioCopy = moduleCopy?.[index];

  return {
    title: scenarioCopy?.title ?? fallback.title,
    description: scenarioCopy?.description ?? fallback.description,
    oneWin: scenarioCopy?.oneWin ?? fallback.oneWin,
  };
}

export function WatchtowerValue() {
  const { locations, watchtowerModules } = useConfiguration();
  const { locale, messages } = useLocale();
  const [expandedModule, setExpandedModule] = useState<string | null>(null);
  const copy = localizedWatchtowerCopy[locale] ?? localizedWatchtowerCopy.en;
  const hasSelection = Boolean(watchtowerModules?.length);

  // Default revenue assumption (can be made configurable later)
  const monthlyRevenuePerLocation = 100000;
  
  // Get Watchtower cost
  const watchtowerPricing = useMemo(() => 
    calculateWatchtowerPrice((watchtowerModules ?? []) as WatchtowerModuleId[], locations),
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

  // Skip if no Watchtower selected
  if (!hasSelection) {
    return null;
  }
  
  const localizedModules = valueResult.modules.map((module) => {
    const moduleCopy = messages.catalog.watchtower[module.id as keyof typeof messages.catalog.watchtower];
    return {
      ...module,
      name: moduleCopy?.name ?? module.name,
      tagline: moduleCopy?.value ?? moduleCopy?.description ?? module.tagline,
    };
  });

  return (
    <div className="watchtower-value bg-gradient-to-r from-watchtower/10 to-red-500/10 dark:from-watchtower/20 dark:to-red-500/20 rounded-xl p-6 border border-watchtower/30">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Castle className="w-6 h-6 text-watchtower" />
          <h3 className="text-lg font-semibold">{copy.title}</h3>
        </div>
        <span className="text-xs bg-watchtower/20 text-watchtower px-2 py-1 rounded-full">
          {copy.badge}
        </span>
      </div>
      
      {/* One Win Message */}
      <div className="bg-watchtower/10 dark:bg-watchtower/20 rounded-lg p-4 mb-6 border border-watchtower/30">
        <div className="flex items-start gap-3">
          <Target className="w-5 h-5 text-watchtower flex-shrink-0 mt-0.5" />
          <div>
            <div className="font-medium mb-1">{copy.oneWin}</div>
            <div className="text-sm text-sundae-muted">
              {copy.investment} <span className="text-watchtower font-medium">${annualCost.toLocaleString()}/year</span>
            </div>
            <div className="text-sm text-sundae-muted mt-1">
              {copy.scenariosCover} {localizeBreakevenScenario(locale, valueResult.breakevenScenario)}
            </div>
          </div>
        </div>
      </div>
      
      {/* Module Scenarios */}
      <div className="space-y-4">
        {localizedModules.map(module => (
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
          <span className="text-sundae-muted">{copy.annualValue}</span>
          <div className="text-right">
            <div className="text-xl font-bold text-watchtower">
              ${valueResult.totalAnnualRange.low.toLocaleString()} – ${valueResult.totalAnnualRange.high.toLocaleString()}
            </div>
            <div className="text-xs text-sundae-muted">
              {valueResult.roiRange.low}x – {valueResult.roiRange.high}x {copy.annualPotential}
            </div>
          </div>
        </div>
      </div>
      
      {/* Disclaimer */}
      <div className="mt-4 flex items-start gap-2 text-xs text-sundae-muted">
        <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
        <p>{copy.disclaimer}</p>
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
  const { locale } = useLocale();
  const copy = localizedWatchtowerCopy[locale] ?? localizedWatchtowerCopy.en;
  const IconComponent = WATCHTOWER_ICON_MAP[module.icon as keyof typeof WATCHTOWER_ICON_MAP] ?? Castle;
  const scenarioCopy = localizedWatchtowerScenarios[locale][module.id as keyof typeof localizedWatchtowerScenarios.en];

  return (
    <div className="bg-sundae-surface rounded-lg overflow-hidden border border-white/10">
      {/* Header */}
      <button
        onClick={onToggle}
        className="w-full p-4 flex items-center justify-between hover:bg-sundae-surface-hover transition-colors"
      >
        <div className="flex items-center gap-3">
          <IconComponent className="w-5 h-5 text-watchtower" />
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
            <div className="text-xs text-sundae-muted">{copy.annualPotential}</div>
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
              {module.scenarios.map((scenario, index) => {
                const localizedScenario = getLocalizedScenarioCopy(
                  locale,
                  module.id,
                  index,
                  {
                    title: scenario.title,
                    description: scenario.description,
                    oneWin: scenario.title,
                  }
                );

                return (
                  <div
                    key={index}
                    className="bg-black/20 dark:bg-black/40 rounded-lg p-3 border-l-2 border-watchtower/50"
                  >
                    <div className="flex items-start justify-between mb-1">
                      <div className="font-medium text-sm">{localizedScenario.title}</div>
                      <div className="text-watchtower font-medium text-sm">
                        ${scenario.impact.toLocaleString()}
                      </div>
                    </div>
                    <div className="text-xs text-sundae-muted mb-2">{localizedScenario.description}</div>
                    <div className="flex items-center gap-4 text-xs">
                      <span className="text-sundae-muted">
                        <span className="opacity-70">{copy.frequency}</span> {scenario.frequency}
                      </span>
                      <ConfidenceBadge confidence={scenario.confidence} />
                    </div>
                  </div>
                );
              })}
              
              {/* One Win Highlight */}
              <div className="bg-green-500/10 dark:bg-green-500/20 rounded-lg p-3 border border-green-500/30">
                <div className="flex items-center gap-2 text-sm">
                  <Zap className="w-4 h-4 text-green-400" />
                  <span className="text-green-300 dark:text-green-400">
                    <strong>{copy.oneWinLabel}:</strong> {scenarioCopy?.[0]?.oneWin ?? module.oneWinExample.description} = ${module.oneWinExample.typicalValue.toLocaleString()}
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
  const { locale } = useLocale();
  const copy = localizedWatchtowerCopy[locale] ?? localizedWatchtowerCopy.en;
  const config = {
    high: { label: copy.confidence.high, color: 'text-green-400 bg-green-500/20' },
    medium: { label: copy.confidence.medium, color: 'text-amber-400 bg-amber-500/20' },
    low: { label: copy.confidence.low, color: 'text-slate-400 bg-slate-500/20' }
  }[confidence] || { label: confidence, color: 'text-slate-400 bg-slate-500/20' };
  
  return (
    <span className={cn('px-2 py-0.5 rounded text-xs', config.color)}>
      {config.label}
    </span>
  );
}
