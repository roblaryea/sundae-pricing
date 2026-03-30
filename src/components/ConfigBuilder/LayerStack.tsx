// Layer stack 3D visualization component

import { motion } from 'framer-motion';
import { ChevronRight, Check, Layers } from 'lucide-react';
import { useConfiguration } from '../../hooks/useConfiguration';
import { PRODUCT_ICONS } from '../../constants/icons';
import { useLocale } from '../../contexts/LocaleContext';

// Get product icons from centralized mapping
const { report: FileText, core: Zap, watchtower: Castle } = PRODUCT_ICONS;

type PricingCopy = {
  title: string;
  subtitle: string;
  report: {
    name: string;
    tagline: string;
    startingPrice: string;
    features: string[];
  };
  core: {
    name: string;
    tagline: string;
    startingPrice: string;
    features: string[];
  };
  watchtower: {
    name: string;
    tagline: string;
    startingPrice: string;
    features: string[];
  };
  recommended: string;
  select: string;
  proTip: string;
  upgradeLater: string;
};

const localizedLayerStackCopy: Record<'en' | 'ar' | 'fr' | 'es', PricingCopy> = {
  en: {
    title: 'Build Your Intelligence Stack',
    subtitle: 'Choose your foundation layer. Start simple or go all-in.',
    report: {
      name: 'REPORT',
      tagline: 'Historical analysis & benchmarking',
      startingPrice: 'Starting at $0/month',
      features: ['Historical data analysis', 'Basic benchmarking', 'Monthly reporting', 'Email insights'],
    },
    core: {
      name: 'CORE',
      tagline: 'Real-time operations & AI',
      startingPrice: 'Starting at $279/month',
      features: ['Real-time POS integration', 'Predictive analytics', 'AI-powered insights', 'Portfolio management'],
    },
    watchtower: {
      name: 'WATCHTOWER',
      tagline: 'Competitive intelligence',
      startingPrice: 'Add-on: From $249/mo + per-location',
      features: ['Competitor tracking', 'Market trends', 'Event signals', 'Strategic insights'],
    },
    recommended: 'RECOMMENDED',
    select: 'Select',
    proTip: 'Pro tip:',
    upgradeLater: 'You can always upgrade later.',
  },
  ar: {
    title: 'ابنِ طبقة الذكاء الخاصة بك',
    subtitle: 'اختر طبقة الأساس. ابدأ ببساطة أو اختر الحزمة الكاملة.',
    report: {
      name: 'التقارير',
      tagline: 'تحليل تاريخي ومقارنات معيارية',
      startingPrice: 'يبدأ من 0 دولار/شهرياً',
      features: ['تحليل البيانات التاريخية', 'مقارنات معيارية أساسية', 'تقارير شهرية', 'رؤى عبر البريد'],
    },
    core: {
      name: 'Core',
      tagline: 'عمليات لحظية وذكاء اصطناعي',
      startingPrice: 'يبدأ من 279 دولار/شهرياً',
      features: ['تكامل POS لحظي', 'تحليلات تنبؤية', 'رؤى مدعومة بالذكاء الاصطناعي', 'إدارة المحافظ'],
    },
    watchtower: {
      name: 'WATCHTOWER',
      tagline: 'ذكاء تنافسي',
      startingPrice: 'إضافة: من 249 دولار/شهرياً + حسب الموقع',
      features: ['تتبع المنافسين', 'اتجاهات السوق', 'إشارات الفعاليات', 'رؤى استراتيجية'],
    },
    recommended: 'موصى به',
    select: 'اختر',
    proTip: 'نصيحة:',
    upgradeLater: 'يمكنك الترقية لاحقاً في أي وقت.',
  },
  fr: {
    title: 'Construisez votre pile d intelligence',
    subtitle: 'Choisissez votre couche de base. Commencez simple ou allez plus loin.',
    report: {
      name: 'REPORT',
      tagline: 'Analyse historique et benchmarks',
      startingPrice: 'A partir de 0 $/mois',
      features: ['Analyse des donnees historiques', 'Benchmarks de base', 'Rapports mensuels', 'Insights par e-mail'],
    },
    core: {
      name: 'CORE',
      tagline: 'Operations en temps reel et IA',
      startingPrice: 'A partir de 279 $/mois',
      features: ['Integration POS en temps reel', 'Analytique predictive', 'Insights IA', 'Gestion de portefeuille'],
    },
    watchtower: {
      name: 'WATCHTOWER',
      tagline: 'Intelligence concurrentielle',
      startingPrice: 'Option : a partir de 249 $/mois + par site',
      features: ['Suivi des concurrents', 'Tendances du marche', 'Signaux d evenements', 'Insights strategiques'],
    },
    recommended: 'RECOMMANDE',
    select: 'Selectionner',
    proTip: 'Astuce :',
    upgradeLater: 'Vous pourrez toujours evoluer plus tard.',
  },
  es: {
    title: 'Construye tu pila de inteligencia',
    subtitle: 'Elige tu capa base. Empieza simple o ve a por todo.',
    report: {
      name: 'REPORT',
      tagline: 'Analisis historico y benchmarks',
      startingPrice: 'Desde 0 $/mes',
      features: ['Analisis de datos historicos', 'Benchmarks basicos', 'Informes mensuales', 'Insights por correo'],
    },
    core: {
      name: 'CORE',
      tagline: 'Operaciones en tiempo real e IA',
      startingPrice: 'Desde 279 $/mes',
      features: ['Integracion POS en tiempo real', 'Analitica predictiva', 'Insights con IA', 'Gestion de portafolio'],
    },
    watchtower: {
      name: 'WATCHTOWER',
      tagline: 'Inteligencia competitiva',
      startingPrice: 'Addon: desde 249 $/mes + por local',
      features: ['Seguimiento de competidores', 'Tendencias del mercado', 'Señales de eventos', 'Insights estrategicos'],
    },
    recommended: 'RECOMENDADO',
    select: 'Seleccionar',
    proTip: 'Consejo:',
    upgradeLater: 'Siempre puedes ampliar mas adelante.',
  },
};

export function LayerStack() {
  const { setLayer, setCurrentStep, persona, markStepCompleted } = useConfiguration();
  const { locale } = useLocale();
  const copy = localizedLayerStackCopy[locale] ?? localizedLayerStackCopy.en;

  const handleLayerSelect = (layerId: 'report' | 'core') => {
    setLayer(layerId);
    markStepCompleted('layer');
    setCurrentStep(2);
  };

  const cards = [
    {
      id: 'core' as const,
      icon: Zap,
      color: '#8B5CF6',
      borderColor: 'violet',
      copy: copy.core,
      recommended: persona?.recommendedPath.includes('core'),
    },
    {
      id: 'report' as const,
      icon: FileText,
      color: '#10B981',
      borderColor: 'green',
      copy: copy.report,
      recommended: persona?.recommendedPath === 'report-lite',
    },
  ];

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

      <div className="mb-12">
        <div className="relative flex flex-col items-center gap-4 max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="w-full relative z-10"
          >
            <div className="p-4 bg-gradient-to-br from-red-500/20 to-red-600/20 rounded-xl border border-red-500/30 backdrop-blur">
              <div className="flex items-center gap-3">
                <Castle className="w-6 h-6 text-red-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-base leading-tight">{copy.watchtower.name}</h3>
                  <p className="text-xs text-sundae-muted leading-tight mt-1">{copy.watchtower.tagline}</p>
                  <p className="text-xs text-sundae-muted mt-1">{copy.watchtower.startingPrice}</p>
                </div>
              </div>
            </div>
          </motion.div>

          {cards.map((layerItem, index) => {
            const isCore = layerItem.id === 'core';
            const iconColorClass = isCore ? 'text-violet-400' : 'text-green-400';
            const cardClass = isCore
              ? 'from-violet-500/20 to-purple-600/20 border-violet-500/30 hover:border-violet-500/60'
              : 'from-green-500/20 to-emerald-600/20 border-green-500/30 hover:border-green-500/60';

            return (
              <motion.div
                key={layerItem.id}
                initial={{ opacity: 0, y: index === 0 ? -10 : 0 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index === 0 ? 0.2 : 0 }}
                className={`w-full relative ${isCore ? 'z-20' : 'z-30'}`}
              >
                <motion.button
                  whileHover={{ scale: 1.02, y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleLayerSelect(layerItem.id)}
                  className={`w-full p-6 bg-gradient-to-br rounded-xl border-2 backdrop-blur transition-all group text-left ${cardClass}`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <layerItem.icon className={`w-8 h-8 ${iconColorClass} flex-shrink-0`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-lg leading-tight">{layerItem.copy.name}</h3>
                          {layerItem.recommended && (
                            <span className={`text-xs px-2 py-0.5 rounded-full whitespace-nowrap ${isCore ? 'bg-violet-500/30 text-violet-300' : 'bg-green-500/30 text-green-300'}`}>
                              {copy.recommended}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-sundae-muted leading-tight mt-1">{layerItem.copy.tagline}</p>
                        <p className="text-xs text-sundae-muted mt-2">{layerItem.copy.startingPrice}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-6 h-6 text-sundae-muted group-hover:text-white transition-colors flex-shrink-0" />
                  </div>
                </motion.button>
              </motion.div>
            );
          })}
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        {cards.map((layerItem) => (
          <motion.div
            key={layerItem.id}
            whileHover={{ y: -5 }}
            className="p-6 bg-sundae-surface rounded-xl border border-white/10"
          >
            <div className="flex items-start gap-3 mb-4">
              {(() => {
                const IconComponent = layerItem.icon;
                return <IconComponent className="w-6 h-6" style={{ color: layerItem.color }} />;
              })()}
              <div className="flex-1">
                <h3 className="font-bold text-lg" style={{ color: layerItem.color }}>
                  {layerItem.copy.name}
                </h3>
                <p className="text-sm text-sundae-muted">{layerItem.copy.tagline}</p>
              </div>
            </div>
            <ul className="space-y-2">
              {layerItem.copy.features.map((feature, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleLayerSelect(layerItem.id)}
              className="w-full mt-4 py-2 px-4 bg-gradient-to-r from-white/10 to-white/5 rounded-lg border border-white/10 hover:border-white/20 transition-all"
              style={{ borderColor: `${layerItem.color}30` }}
            >
              {copy.select} {layerItem.copy.name}
            </motion.button>
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-8 p-4 bg-sundae-accent/10 rounded-lg border border-sundae-accent/30"
      >
        <p className="text-sm flex items-start gap-2">
          <Layers className="w-4 h-4 text-sundae-accent mt-0.5 flex-shrink-0" />
          <span>
            <strong>{copy.proTip}</strong> {copy.upgradeLater}
          </span>
        </p>
      </motion.div>
    </div>
  );
}
