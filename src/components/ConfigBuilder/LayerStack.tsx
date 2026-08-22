// Layer stack 3D visualization component

import { motion } from 'framer-motion';
import { Check, Layers } from 'lucide-react';
import { useConfiguration } from '../../hooks/useConfiguration';
import { PRODUCT_ICONS } from '../../constants/icons';
import { useLocale } from '../../contexts/LocaleContext';
import { generatedAuxiliaryLocalePacks } from '../../lib/generatedAuxiliaryLocalePacks';
// Pull canonical prices from the pricing-site data layer (which is itself
// reconciled against the backend pricing master via `npm run sync:backend-pricing`).
// This eliminates the hard-coded "Starting at $XXX/month" strings that the
// pricing audit previously flagged as drift risks.
import { corePackages, watchtower } from '../../data/pricing';
import { fadeUp, selectableCard, staggerChildren, useReducedMotionSafe } from '../../lib/motion';

// v1.7: the entry point into Core is the Core Foundation FIRST-UNIT anchor.
// It is not a per-location rate and it includes no location allowance.
const corePrice = corePackages.core_foundation.firstUnitPrice; // 1195
const watchtowerCheapestPrice = Math.min(
  watchtower.competitive.basePrice,
  watchtower.events.basePrice,
  watchtower.trends.basePrice
); // 249 (events) currently

// Get product icons from centralized mapping
const { core: Zap, watchtower: Castle, crew: UsersIcon } = PRODUCT_ICONS;

/** A layer card's copy, with every field guaranteed present. */
type LayerCopy = PricingCopy['core'];

function resolveLayerCard(
  base: LayerCopy,
  override: Partial<LayerCopy> | undefined,
): LayerCopy {
  if (!override) return base;
  return {
    name: override.name ?? base.name,
    tagline: override.tagline ?? base.tagline,
    startingPrice: override.startingPrice ?? base.startingPrice,
    features:
      Array.isArray(override.features) && override.features.length > 0
        ? override.features
        : base.features,
  };
}

/**
 * Resolve layer-stack copy for a locale, field by field, over the English base.
 * Hand-written packs win, then the generated packs, then English.
 */
function resolveLayerStackCopy(locale: string): PricingCopy {
  const base = localizedLayerStackCopy.en;
  const handWritten = (
    localizedLayerStackCopy as Record<string, PricingCopy | undefined>
  )[locale];
  const generated = (
    generatedAuxiliaryLocalePacks.layerStackCopy as unknown as Record<
      string,
      Partial<PricingCopy> | undefined
    >
  )[locale];
  const pack: Partial<PricingCopy> | undefined = handWritten ?? generated;
  if (!pack) return base;

  return {
    title: pack.title ?? base.title,
    subtitle: pack.subtitle ?? base.subtitle,
    report: resolveLayerCard(base.report, pack.report),
    core: resolveLayerCard(base.core, pack.core),
    watchtower: resolveLayerCard(base.watchtower, pack.watchtower),
    crew: resolveLayerCard(base.crew, pack.crew),
    recommended: pack.recommended ?? base.recommended,
    select: pack.select ?? base.select,
    proTip: pack.proTip ?? base.proTip,
    upgradeLater: pack.upgradeLater ?? base.upgradeLater,
  };
}

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
  crew: {
    name: string;
    tagline: string;
    startingPrice: string;
    features: string[];
  };
  /** Optional: locales may override the combined pathway card. */
  both?: {
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
      startingPrice: `From $${corePrice}/month for your first location`,
      features: ['Real-time POS integration', 'Predictive analytics', 'AI-powered insights', 'Portfolio management'],
    },
    watchtower: {
      name: 'WATCHTOWER',
      tagline: 'Competitive intelligence',
      startingPrice: `Add-on: From $${watchtowerCheapestPrice}/mo + per-location`,
      features: ['Competitor tracking', 'Market trends', 'Event signals', 'Strategic insights'],
    },
    crew: {
      name: 'CREW',
      tagline: 'Operational substrate: people, schedule, payroll',
      startingPrice: 'Starting at $99/month',
      features: ['Scheduling + T&A', 'Native payroll across 36 countries', 'HR casework + Ask-HR', 'Free employee portal'],
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
      startingPrice: `من ${corePrice} دولار/شهرياً للموقع الأول`,
      features: ['تكامل POS لحظي', 'تحليلات تنبؤية', 'رؤى مدعومة بالذكاء الاصطناعي', 'إدارة المحافظ'],
    },
    watchtower: {
      name: 'WATCHTOWER',
      tagline: 'ذكاء تنافسي',
      startingPrice: `إضافة: من ${watchtowerCheapestPrice} دولار/شهرياً + حسب الموقع`,
      features: ['تتبع المنافسين', 'اتجاهات السوق', 'إشارات الفعاليات', 'رؤى استراتيجية'],
    },
    crew: {
      name: 'CREW',
      tagline: 'الركيزة التشغيلية: الأشخاص، الجدولة، الرواتب',
      startingPrice: 'يبدأ من 99 دولار/شهرياً',
      features: ['الجدولة + الوقت والحضور', 'جاهزية رواتب متعددة المناطق', 'حالات HR + Ask-HR', 'بوابة موظفين مجانية'],
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
      startingPrice: `A partir de ${corePrice} $/mois pour votre premier site`,
      features: ['Integration POS en temps reel', 'Analytique predictive', 'Insights IA', 'Gestion de portefeuille'],
    },
    watchtower: {
      name: 'WATCHTOWER',
      tagline: 'Intelligence concurrentielle',
      startingPrice: `Option : a partir de ${watchtowerCheapestPrice} $/mois + par site`,
      features: ['Suivi des concurrents', 'Tendances du marche', 'Signaux d evenements', 'Insights strategiques'],
    },
    crew: {
      name: 'CREW',
      tagline: 'Substrat operationnel : equipes, planning, paie',
      startingPrice: 'A partir de 99 $/mois',
      features: ['Planning + T&A', 'Readiness paie multi-regions', 'Casework RH + Ask-HR', 'Portail employe gratuit'],
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
      startingPrice: `Desde ${corePrice} $/mes para tu primer local`,
      features: ['Integracion POS en tiempo real', 'Analitica predictiva', 'Insights con IA', 'Gestion de portafolio'],
    },
    watchtower: {
      name: 'WATCHTOWER',
      tagline: 'Inteligencia competitiva',
      startingPrice: `Addon: desde ${watchtowerCheapestPrice} $/mes + por local`,
      features: ['Seguimiento de competidores', 'Tendencias del mercado', 'Señales de eventos', 'Insights estrategicos'],
    },
    crew: {
      name: 'CREW',
      tagline: 'Sustrato operativo: personas, horarios, nomina',
      startingPrice: 'Desde 99 $/mes',
      features: ['Horarios + T&A', 'Readiness de nomina multi-region', 'Casework RR.HH. + Ask-HR', 'Portal de empleados gratis'],
    },
    recommended: 'RECOMENDADO',
    select: 'Seleccionar',
    proTip: 'Consejo:',
    upgradeLater: 'Siempre puedes ampliar mas adelante.',
  },
};


export function LayerStack() {
  const { setLayer, goToStep, persona, markStepCompleted } = useConfiguration();
  const { locale } = useLocale();
  const reduced = useReducedMotionSafe();
  const card = selectableCard(reduced);
  // The `??` chain used to pick ONE pack wholesale. When that pack was
  // shape-incomplete the whole subtree beneath it went undefined - the
  // generated packs carried a retired `report` layer and no `crew`, so
  // `copy.crew` was undefined and `layerItem.copy.name` threw, taking the
  // entire simulator to the ErrorBoundary in 18 of 22 locales. tsc could not
  // see it because the index lookups are typed non-optional.
  //
  // Resolving per FIELD over the English base makes a missing key structurally
  // impossible: a partial translation now degrades to English for that field
  // only, which is what a missing translation should ever cost.
  const copy = resolveLayerStackCopy(locale);

  const handleLayerSelect = (layerId: 'core' | 'crew' | 'both') => {
    setLayer(layerId);
    markStepCompleted('layer');
    // Each pathway starts at its own first configuring step. Core+Crew asks for
    // the estate first because that one number prices both rails; Crew goes
    // straight to its builder; Core to its packages.
    goToStep(layerId === 'both' ? 'estate' : layerId === 'crew' ? 'crew' : 'tier');
  };

  const cards = [
    {
      id: 'core' as const,
      icon: Zap,
      color: '#E9A24A',
      borderColor: 'violet',
      copy: copy.core,
      recommended: persona?.recommendedPath.includes('core'),
    },
    // The Report layer was retired with price book v1.7 and is no longer
    // offered. Its localized copy stays in the pack only so the translation
    // bundles keep their shape; nothing renders it.
    {
      id: 'crew' as const,
      icon: UsersIcon,
      color: '#06B6D4', // cyan — differentiates from Report's emerald in the stack
      borderColor: 'cyan',
      copy: copy.crew,
      // No persona quiz recommends Crew yet — it's the parallel operational
      // path. Default to no recommended badge.
      recommended: false as boolean,
    },
    {
      // Core + Crew is the deal most multi-site groups actually sign: decision
      // intelligence on one rail, the operational substrate on the other. The
      // layer step was an either/or, so it could not be configured at all.
      id: 'both' as const,
      icon: Layers,
      color: '#8B5CF6',
      borderColor: 'violet',
      copy: {
        name: 'CORE + CREW',
        tagline: copy.both?.tagline ?? 'Run the business and see it, on one contract',
        startingPrice:
          copy.both?.startingPrice ?? `From $${corePrice.toLocaleString()} + $99/month`,
        features:
          copy.both?.features ?? [
            'Everything in Core',
            'Everything in Crew',
            'One contract, one implementation',
            'Workforce signal feeds Labour Intelligence',
          ],
      },
      recommended: false as boolean,
    },
  ];

  return (
    <div className="max-w-5xl mx-auto">
      <motion.div
        variants={fadeUp(reduced)}
        initial="hidden"
        animate="visible"
        className="text-center mb-12"
      >
        <h1 className="text-4xl font-bold mb-4">{copy.title}</h1>
        <p className="text-xl text-sundae-muted">{copy.subtitle}</p>
      </motion.div>

      {/* One render of the three pathways, not two.

            The screen used to draw this list twice: a stack of rows with
            chevrons, and then a grid of cards carrying the same three names,
            the same taglines and a "Select X" button each. Every pathway
            appeared twice on one screen, which reads as two different controls
            for the same decision and makes the page twice as long as the
            choice deserves. The cards win because they carry the features and
            the price the rows only hinted at. */}
      <motion.div
        variants={staggerChildren(reduced, cards.length)}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {cards.map((layerItem) => (
          <motion.div
            key={layerItem.id}
            variants={fadeUp(reduced)}
            {...card}
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
            {/* The lift belongs to the card the pointer is over; a second one
                on the button inside it produced two competing translations of
                the same element. The press stays, because a button should
                acknowledge being pressed. */}
            <motion.button
              whileTap={card.whileTap}
              transition={card.transition}
              onClick={() => handleLayerSelect(layerItem.id)}
              className="w-full mt-4 py-2 px-4 bg-gradient-to-r from-white/10 to-white/5 rounded-lg border border-white/10 hover:border-white/20 transition-colors"
              style={{ borderColor: `${layerItem.color}30` }}
            >
              {copy.select} {layerItem.copy.name}
            </motion.button>
          </motion.div>
        ))}
      </motion.div>

      {/* Watchtower is an ADD-ON, and listing it beside the pathways framed it
          as a fourth thing to choose between — it is not, it layers onto any of
          them. It reads as an option here, after the decision it modifies. */}
      <motion.div
        variants={fadeUp(reduced, 0.06)}
        initial="hidden"
        animate="visible"
        className="mt-8 p-5 rounded-xl border border-white/10 bg-sundae-surface"
      >
        <div className="flex items-start gap-3">
          <Castle className="w-5 h-5 text-[#F472B6] mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-bold text-base leading-tight">{copy.watchtower.name}</h3>
            <p className="text-sm text-sundae-muted mt-1">{copy.watchtower.tagline}</p>
            <p className="text-xs text-sundae-muted mt-2">{copy.watchtower.startingPrice}</p>
            <p className="text-xs text-sundae-muted mt-2">
              Adds onto whichever pathway you pick — you will be offered it later.
            </p>
          </div>
        </div>
      </motion.div>

      <motion.div
        variants={fadeUp(reduced, 0.08)}
        initial="hidden"
        animate="visible"
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
