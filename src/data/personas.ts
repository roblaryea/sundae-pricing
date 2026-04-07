// User personas and pathways for the gamified journey

export interface Persona {
  id: string;
  name: string;
  emoji: string;
  description: string;
  recommendedPath: string;
  color: string;
  modules: string[];
  locationRange: {
    min: number;
    max: number;
  };
}

export interface QuizQuestion {
  id: string;
  question: string;
  subtitle?: string;
  helperText?: string;
  multiSelect?: boolean;
  maxSelections?: number;
  options: QuizOption[];
}

export interface QuizOption {
  id: string;
  label: string;
  emoji?: string;
  value: string | number | boolean;
  weight: Record<string, number>; // Persona weights
  moduleMapping?: string; // Maps to pain point ID for module engine
}

// Personas definitions
export const personas: Record<string, Persona> = {
  explorer: {
    id: "explorer",
    name: "The Data Explorer",
    emoji: "radar",
    description: "You're curious about analytics but want to test the waters before diving in. Perfect for single locations looking to understand their data better.",
    recommendedPath: "report-lite",
    color: "#10B981", // green
    modules: [],
    locationRange: { min: 1, max: 2 }
  },
  optimizer: {
    id: "optimizer",
    name: "The Efficiency Hunter",
    emoji: "zap",
    description: "Every percentage point matters. You want real-time control over operations and are ready to optimize labor and inventory costs.",
    recommendedPath: "core-lite",
    color: "#3B82F6", // blue
    modules: ["labor", "inventory"],
    locationRange: { min: 2, max: 5 }
  },
  commander: {
    id: "commander",
    name: "The Portfolio Commander",
    emoji: "target",
    description: "Multiple locations need unified visibility and strategic tools. You're building an empire and need intelligence to match.",
    recommendedPath: "core-pro",
    color: "#8B5CF6", // purple
    modules: ["labor", "inventory", "marketing"],
    locationRange: { min: 6, max: 20 }
  },
  strategist: {
    id: "strategist",
    name: "The Market Strategist",
    emoji: "crown",
    description: "Competitive intelligence and market positioning drive your decisions. You're playing the long game and want every edge.",
    recommendedPath: "core-pro-watchtower",
    color: "#F59E0B", // amber
    modules: ["labor", "inventory", "marketing", "purchasing"],
    locationRange: { min: 10, max: 100 }
  }
};

// Quiz questions for persona matching
export const quizQuestions: QuizQuestion[] = [
  {
    id: "locations",
    question: "How many locations are in your kingdom?",
    subtitle: "Let's understand the scale of your empire",
    multiSelect: false,
    options: [
      {
        id: "solo",
        label: "Solo Act",
        emoji: "store",
        value: 1,
        weight: { explorer: 10, optimizer: 0, commander: 0, strategist: 0 }
      },
      {
        id: "small",
        label: "Small Squad",
        emoji: "building",
        value: 3,
        weight: { explorer: 5, optimizer: 10, commander: 3, strategist: 0 }
      },
      {
        id: "growing",
        label: "Growing Empire",
        emoji: "building",
        value: 8,
        weight: { explorer: 0, optimizer: 5, commander: 10, strategist: 5 }
      },
      {
        id: "enterprise",
        label: "Restaurant Royalty",
        emoji: "crown",
        value: 25,
        weight: { explorer: 0, optimizer: 0, commander: 5, strategist: 10 }
      }
    ]
  },
  {
    id: "pain",
    question: "What keeps you up at night?",
    subtitle: "Your biggest operational challenges",
    helperText: "Pick up to 3",
    multiSelect: true,
    maxSelections: 3,
    options: [
      {
        id: "labor_costs",
        label: "Labor costs & staffing",
        emoji: "users",
        value: "labor_costs",
        weight: { explorer: 3, optimizer: 10, commander: 8, strategist: 5 },
        moduleMapping: "labor_costs"
      },
      {
        id: "food_waste",
        label: "Food cost & waste",
        emoji: "utensils",
        value: "food_waste",
        weight: { explorer: 3, optimizer: 10, commander: 8, strategist: 5 },
        moduleMapping: "food_waste"
      },
      {
        id: "supplier_prices",
        label: "Supplier prices & purchasing control",
        emoji: "cart",
        value: "supplier_prices",
        weight: { explorer: 2, optimizer: 8, commander: 7, strategist: 5 },
        moduleMapping: "supplier_prices"
      },
      {
        id: "revenue_leakage",
        label: "Discounts, comps & revenue leakage",
        emoji: "shield",
        value: "revenue_leakage",
        weight: { explorer: 2, optimizer: 7, commander: 8, strategist: 6 },
        moduleMapping: "revenue_leakage"
      },
      {
        id: "delivery_profitability",
        label: "Delivery profitability & aggregator fees",
        emoji: "delivery",
        value: "delivery_profitability",
        weight: { explorer: 2, optimizer: 6, commander: 7, strategist: 5 },
        moduleMapping: "delivery_profitability"
      },
      {
        id: "table_utilization",
        label: "Table utilization & reservations",
        emoji: "calendar",
        value: "table_utilization",
        weight: { explorer: 3, optimizer: 6, commander: 7, strategist: 4 },
        moduleMapping: "table_utilization"
      },
      {
        id: "marketing_roi",
        label: "Marketing ROI & demand generation",
        emoji: "megaphone",
        value: "marketing_roi",
        weight: { explorer: 2, optimizer: 5, commander: 8, strategist: 9 },
        moduleMapping: "marketing_roi"
      },
      {
        id: "guest_complaints",
        label: "Guest complaints & reviews",
        emoji: "star",
        value: "guest_complaints",
        weight: { explorer: 3, optimizer: 5, commander: 7, strategist: 6 },
        moduleMapping: "guest_complaints"
      },
      {
        id: "profit_visibility",
        label: "Profit visibility (what actually drops to bottom line)",
        emoji: "dollar",
        value: "profit_visibility",
        weight: { explorer: 2, optimizer: 7, commander: 9, strategist: 8 },
        moduleMapping: "profit_visibility"
      },
      {
        id: "competition",
        label: "Competition & market pressure",
        emoji: "swords",
        value: "competition",
        weight: { explorer: 0, optimizer: 3, commander: 5, strategist: 10 },
        moduleMapping: "competition"
      }
    ]
  },
  {
    id: "decisions",
    question: "How do you make decisions today?",
    subtitle: "Your current analytics approach",
    helperText: "Select all that apply",
    multiSelect: true,
    options: [
      {
        id: "gut",
        label: "Gut feel / experience",
        emoji: "message",
        value: "gut",
        weight: { explorer: 10, optimizer: 0, commander: 0, strategist: 0 }
      },
      {
        id: "pos",
        label: "POS reports only",
        emoji: "clipboard",
        value: "pos",
        weight: { explorer: 8, optimizer: 8, commander: 5, strategist: 3 }
      },
      {
        id: "spreadsheets",
        label: "Spreadsheets & manual tracking",
        emoji: "chart",
        value: "spreadsheets",
        weight: { explorer: 5, optimizer: 10, commander: 3, strategist: 2 }
      },
      {
        id: "fragmented",
        label: "Multiple tools that don't talk to each other",
        emoji: "plug",
        value: "fragmented",
        weight: { explorer: 3, optimizer: 6, commander: 8, strategist: 7 }
      },
      {
        id: "bi",
        label: "We already use BI dashboards",
        emoji: "trending-up",
        value: "bi",
        weight: { explorer: 0, optimizer: 5, commander: 8, strategist: 9 }
      },
      {
        id: "ai",
        label: "I want AI to help prioritize actions",
        emoji: "bot",
        value: "ai",
        weight: { explorer: 3, optimizer: 5, commander: 10, strategist: 10 }
      }
    ]
  },
  {
    id: "appetite",
    question: "What's your analytics appetite?",
    subtitle: "How quickly do you need results?",
    multiSelect: false,
    options: [
      {
        id: "exploring",
        label: "Just exploring",
        emoji: "radar",
        value: "exploring",
        weight: { explorer: 10, optimizer: 2, commander: 0, strategist: 0 }
      },
      {
        id: "ready",
        label: "Ready to improve with a plan",
        emoji: "file",
        value: "ready",
        weight: { explorer: 0, optimizer: 10, commander: 8, strategist: 5 }
      },
      {
        id: "urgent",
        label: "Need results fast",
        emoji: "rocket",
        value: "urgent",
        weight: { explorer: 0, optimizer: 5, commander: 10, strategist: 10 }
      }
    ]
  }
];

// Calculate persona match based on quiz answers
export function calculatePersonaMatch(answers: Record<string, string>, locale: PersonasLocale = 'en'): {
  persona: Persona;
  scores: Record<string, number>;
  confidence: number;
} {
  const scores: Record<string, number> = {
    explorer: 0,
    optimizer: 0,
    commander: 0,
    strategist: 0
  };
  
  // Calculate weighted scores
  Object.entries(answers).forEach(([questionId, answerId]) => {
    const question = quizQuestions.find(q => q.id === questionId);
    if (question) {
      const option = question.options.find(o => o.id === answerId);
      if (option) {
        Object.entries(option.weight).forEach(([personaId, weight]) => {
          scores[personaId] += weight;
        });
      }
    }
  });
  
  // Find the highest scoring persona
  const maxScore = Math.max(...Object.values(scores));
  const winningPersonaId = Object.entries(scores).find(([, score]) => score === maxScore)?.[0] || 'explorer';
  const persona = getLocalizedPersona(locale, winningPersonaId);
  
  // Calculate confidence (how much higher the winning score is vs the average)
  const avgScore = Object.values(scores).reduce((a, b) => a + b, 0) / Object.values(scores).length;
  const confidence = maxScore > 0 ? (maxScore - avgScore) / maxScore : 0;
  
  return {
    persona,
    scores,
    confidence
  };
}

// Achievements data
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  trigger: string;
  points: number;
}

export const achievements: Achievement[] = [
  {
    id: "explorer",
    name: "Data Explorer",
    description: "Completed the persona quiz",
    icon: "radar",
    trigger: "quiz_complete",
    points: 10
  },
  {
    id: "stack-builder",
    name: "Stack Builder",
    description: "Selected your first tier",
    icon: "building",
    trigger: "tier_selected",
    points: 20
  },
  {
    id: "module-master",
    name: "Module Master",
    description: "Added 2+ modules to your stack",
    icon: "zap",
    trigger: "modules_count >= 2",
    points: 30
  },
  {
    id: "intelligence-commander",
    name: "Intelligence Commander",
    description: "Unlocked Watchtower",
    icon: "castle",
    trigger: "watchtower_selected",
    points: 50
  },
  {
    id: "roi-believer",
    name: "ROI Believer",
    description: "Calculated your projected returns",
    icon: "trending-up",
    trigger: "roi_calculated",
    points: 25
  },
  {
    id: "sundae-ready",
    name: "Sundae Ready",
    description: "Completed your full configuration",
    icon: "sundae",
    trigger: "summary_viewed",
    points: 100
  },
  {
    id: "savings-hero",
    name: "Savings Hero",
    description: "Discovered 50%+ savings vs competitors",
    icon: "dollar",
    trigger: "savings_percent >= 50",
    points: 40
  },
  {
    id: "efficiency-expert",
    name: "Efficiency Expert",
    description: "Selected labor + inventory modules",
    icon: "gear",
    trigger: "combo_labor_inventory",
    points: 35
  },
  {
    id: "full-stack",
    name: "Full Stack Operator",
    description: "Selected all available modules",
    icon: "target",
    trigger: "all_modules",
    points: 75
  },
  {
    id: "empire-builder",
    name: "Empire Builder",
    description: "Configured 10+ locations",
    icon: "castle",
    trigger: "locations >= 10",
    points: 45
  }
];

export type PersonasLocale = 'en' | 'ar' | 'fr' | 'es';

type LocalizedPersonaText = Pick<Persona, 'name' | 'description'>;
type LocalizedQuestionText = {
  question: string;
  subtitle?: string;
  helperText?: string;
  options: Record<string, string>;
};
type LocalizedAchievementText = Pick<Achievement, 'name' | 'description'>;

const localizedPersonaText: Partial<Record<PersonasLocale, Record<string, LocalizedPersonaText>>> = {
  ar: {
    explorer: {
      name: 'مستكشف البيانات',
      description: 'أنت فضولي بشأن التحليلات وتريد اختبار البيانات قبل التوسع. مناسب للمواقع الفردية التي تريد فهم بياناتها بشكل أفضل.',
    },
    optimizer: {
      name: 'باحث الكفاءة',
      description: 'كل نقطة مئوية مهمة. تريد تحكماً لحظياً بالعمليات ومستعداً لتحسين العمالة وتكاليف المخزون.',
    },
    commander: {
      name: 'قائد المحفظة',
      description: 'تحتاج المواقع المتعددة إلى رؤية موحدة وأدوات استراتيجية. أنت تبني مجموعة كبيرة وتحتاج ذكاءً يواكبها.',
    },
    strategist: {
      name: 'استراتيجي السوق',
      description: 'الذكاء التنافسي وتموضع السوق يقودان قراراتك. أنت تلعب على المدى الطويل وتريد كل ميزة ممكنة.',
    },
  },
  fr: {
    explorer: {
      name: 'Explorateur de données',
      description: "Vous êtes curieux des analyses, mais vous voulez tester avant d'aller plus loin. Idéal pour les sites uniques qui veulent mieux comprendre leurs données.",
    },
    optimizer: {
      name: 'Chasseur d’efficacité',
      description: "Chaque point de pourcentage compte. Vous voulez un contrôle en temps réel des opérations et optimiser les coûts de main-d’œuvre et d’inventaire.",
    },
    commander: {
      name: 'Commandant de portefeuille',
      description: 'Les sites multiples ont besoin d’une visibilité unifiée et d’outils stratégiques. Vous construisez un groupe qui a besoin d’un niveau de renseignement équivalent.',
    },
    strategist: {
      name: 'Stratège du marché',
      description: 'L’intelligence concurrentielle et le positionnement marché guident vos décisions. Vous jouez sur le long terme et cherchez chaque avantage.',
    },
  },
  es: {
    explorer: {
      name: 'Explorador de datos',
      description: 'Tienes curiosidad por la analítica, pero quieres probar antes de profundizar. Ideal para ubicaciones únicas que quieren entender mejor sus datos.',
    },
    optimizer: {
      name: 'Cazador de eficiencia',
      description: 'Cada punto porcentual importa. Quieres control en tiempo real de las operaciones y estás listo para optimizar costes de personal e inventario.',
    },
    commander: {
      name: 'Comandante de cartera',
      description: 'Las ubicaciones múltiples necesitan visibilidad unificada y herramientas estratégicas. Estás construyendo una red que necesita inteligencia a su nivel.',
    },
    strategist: {
      name: 'Estratega del mercado',
      description: 'La inteligencia competitiva y el posicionamiento de mercado guían tus decisiones. Juegas a largo plazo y quieres cada ventaja posible.',
    },
  },
};

const localizedQuestionText: Partial<Record<PersonasLocale, Record<string, LocalizedQuestionText>>> = {
  ar: {
    locations: {
      question: 'كم عدد المواقع لديك؟',
      subtitle: 'لنفهم نطاق محفظتك',
      options: {
        solo: 'موقع واحد',
        small: 'مجموعة صغيرة',
        growing: 'شبكة نامية',
        enterprise: 'علامة مؤسسية',
      },
    },
    pain: {
      question: 'ما الذي يبقيك مستيقظاً ليلاً؟',
      subtitle: 'أكبر التحديات التشغيلية لديك',
      helperText: 'اختر حتى 3',
      options: {
        labor_costs: 'تكاليف العمالة والتوظيف',
        food_waste: 'تكلفة الطعام والهدر',
        supplier_prices: 'أسعار الموردين والتحكم في الشراء',
        revenue_leakage: 'الخصومات والتسويات وتسرب الإيرادات',
        delivery_profitability: 'ربحية التوصيل ورسوم المنصات',
        table_utilization: 'استغلال الطاولات والحجوزات',
        marketing_roi: 'عائد التسويق وتوليد الطلب',
        guest_complaints: 'شكاوى الضيوف والمراجعات',
        profit_visibility: 'وضوح الربح الفعلي في النهاية',
        competition: 'المنافسة وضغط السوق',
      },
    },
    decisions: {
      question: 'كيف تتخذ القرارات اليوم؟',
      subtitle: 'نهجك الحالي في التحليلات',
      helperText: 'اختر كل ما ينطبق',
      options: {
        gut: 'الإحساس / الخبرة',
        pos: 'تقارير POS فقط',
        spreadsheets: 'جداول Excel وتتبع يدوي',
        fragmented: 'أدوات متعددة لا تتحدث مع بعضها',
        bi: 'نستخدم لوحات BI بالفعل',
        ai: 'أريد للذكاء الاصطناعي أن يساعد في تحديد الأولويات',
      },
    },
    appetite: {
      question: 'ما مدى جاهزيتك التحليلية؟',
      subtitle: 'ما مدى سرعة حاجتك للنتائج؟',
      options: {
        exploring: 'أستكشف فقط',
        ready: 'جاهز للتحسين بخطة واضحة',
        urgent: 'أحتاج نتائج بسرعة',
      },
    },
  },
  fr: {
    locations: {
      question: 'Combien de sites avez-vous ?',
      subtitle: 'Comprenons l’échelle de votre portefeuille',
      options: {
        solo: 'Site unique',
        small: 'Petit groupe',
        growing: 'Réseau en croissance',
        enterprise: 'Groupe Enterprise',
      },
    },
    pain: {
      question: 'Qu’est-ce qui vous empêche de dormir ?',
      subtitle: 'Vos plus grands défis opérationnels',
      helperText: 'Choisissez jusqu’à 3',
      options: {
        labor_costs: 'Coûts de main-d’œuvre et staffing',
        food_waste: 'Coût alimentaire et gaspillage',
        supplier_prices: 'Prix fournisseurs et contrôle des achats',
        revenue_leakage: 'Remises, avoirs et fuite de revenus',
        delivery_profitability: 'Rentabilité livraison et frais de plateformes',
        table_utilization: 'Occupation des tables et réservations',
        marketing_roi: 'ROI marketing et génération de demande',
        guest_complaints: 'Avis et réclamations clients',
        profit_visibility: 'Visibilité sur le profit réel',
        competition: 'Concurrence et pression du marché',
      },
    },
    decisions: {
      question: 'Comment prenez-vous vos décisions aujourd’hui ?',
      subtitle: 'Votre approche analytique actuelle',
      helperText: 'Sélectionnez tout ce qui s’applique',
      options: {
        gut: 'Au feeling / à l’expérience',
        pos: 'Rapports POS uniquement',
        spreadsheets: 'Tableurs et suivi manuel',
        fragmented: 'Plusieurs outils qui ne communiquent pas',
        bi: 'Nous utilisons déjà des tableaux de bord BI',
        ai: 'Je veux que l’IA aide à prioriser les actions',
      },
    },
    appetite: {
      question: 'Quel est votre appétit analytique ?',
      subtitle: 'À quelle vitesse avez-vous besoin de résultats ?',
      options: {
        exploring: 'Je découvre',
        ready: 'Prêt à progresser avec un plan',
        urgent: 'J’ai besoin de résultats vite',
      },
    },
  },
  es: {
    locations: {
      question: '¿Cuántas ubicaciones tienes?',
      subtitle: 'Entendamos la escala de tu cartera',
      options: {
        solo: 'Ubicación única',
        small: 'Grupo pequeño',
        growing: 'Red en crecimiento',
        enterprise: 'Grupo Enterprise',
      },
    },
    pain: {
      question: '¿Qué te quita el sueño?',
      subtitle: 'Tus mayores retos operativos',
      helperText: 'Elige hasta 3',
      options: {
        labor_costs: 'Costes de personal y cobertura',
        food_waste: 'Coste de comida y desperdicio',
        supplier_prices: 'Precios de proveedores y control de compras',
        revenue_leakage: 'Descuentos, comps y fuga de ingresos',
        delivery_profitability: 'Rentabilidad delivery y tarifas de agregadores',
        table_utilization: 'Aprovechamiento de mesas y reservas',
        marketing_roi: 'ROI de marketing y generación de demanda',
        guest_complaints: 'Quejas y reseñas de clientes',
        profit_visibility: 'Visibilidad real del beneficio final',
        competition: 'Competencia y presión de mercado',
      },
    },
    decisions: {
      question: '¿Cómo tomas decisiones hoy?',
      subtitle: 'Tu enfoque analítico actual',
      helperText: 'Selecciona todo lo que aplique',
      options: {
        gut: 'Intuición / experiencia',
        pos: 'Solo informes POS',
        spreadsheets: 'Hojas de cálculo y seguimiento manual',
        fragmented: 'Varias herramientas que no se conectan',
        bi: 'Ya usamos paneles BI',
        ai: 'Quiero que la IA ayude a priorizar acciones',
      },
    },
    appetite: {
      question: '¿Cuál es tu apetito analítico?',
      subtitle: '¿Qué tan rápido necesitas resultados?',
      options: {
        exploring: 'Solo estoy explorando',
        ready: 'Listo para mejorar con un plan',
        urgent: 'Necesito resultados rápido',
      },
    },
  },
};

const localizedAchievementText: Partial<Record<PersonasLocale, Record<string, LocalizedAchievementText>>> = {
  ar: {
    explorer: { name: 'مستكشف البيانات', description: 'أكملت اختبار الشخصية' },
    'stack-builder': { name: 'باني الحزمة', description: 'اخترت أول خطة لديك' },
    'module-master': { name: 'سيد الوحدات', description: 'أضفت وحدتين أو أكثر إلى حزمك' },
    'intelligence-commander': { name: 'قائد الذكاء', description: 'فتحت Watchtower' },
    'roi-believer': { name: 'مؤمن بالعائد', description: 'حسبت العوائد المتوقعة' },
    'sundae-ready': { name: 'جاهز لـ Sundae', description: 'أكملت إعدادك الكامل' },
    'savings-hero': { name: 'بطل التوفير', description: 'اكتشفت وفراً يتجاوز 50% مقارنة بالمنافسين' },
    'efficiency-expert': { name: 'خبير الكفاءة', description: 'اخترت وحدتي العمالة والمخزون' },
    'full-stack': { name: 'مشغل متكامل', description: 'اخترت كل الوحدات المتاحة' },
    'empire-builder': { name: 'باني الإمبراطورية', description: 'أعددت 10 مواقع أو أكثر' },
  },
  fr: {
    explorer: { name: 'Explorateur de données', description: 'Vous avez terminé le quiz de persona' },
    'stack-builder': { name: 'Constructeur de stack', description: 'Vous avez choisi votre premier niveau' },
    'module-master': { name: 'Maître des modules', description: 'Vous avez ajouté 2 modules ou plus à votre stack' },
    'intelligence-commander': { name: 'Commandant de l’intelligence', description: 'Vous avez débloqué Watchtower' },
    'roi-believer': { name: 'Croyant du ROI', description: 'Vous avez calculé vos retours projetés' },
    'sundae-ready': { name: 'Prêt pour Sundae', description: 'Vous avez terminé votre configuration' },
    'savings-hero': { name: 'Héros des économies', description: 'Vous avez découvert plus de 50 % d’économies vs concurrents' },
    'efficiency-expert': { name: 'Expert de l’efficacité', description: 'Vous avez sélectionné les modules main-d’œuvre + inventaire' },
    'full-stack': { name: 'Opérateur full stack', description: 'Vous avez sélectionné tous les modules disponibles' },
    'empire-builder': { name: 'Constructeur d’empire', description: 'Vous avez configuré 10 sites ou plus' },
  },
  es: {
    explorer: { name: 'Explorador de datos', description: 'Completaste el cuestionario de perfil' },
    'stack-builder': { name: 'Constructor de stack', description: 'Elegiste tu primer plan' },
    'module-master': { name: 'Maestro de módulos', description: 'Agregaste 2 o más módulos a tu stack' },
    'intelligence-commander': { name: 'Comandante de inteligencia', description: 'Desbloqueaste Watchtower' },
    'roi-believer': { name: 'Creyente del ROI', description: 'Calculaste tus retornos proyectados' },
    'sundae-ready': { name: 'Listo para Sundae', description: 'Completaste tu configuración completa' },
    'savings-hero': { name: 'Héroe del ahorro', description: 'Descubriste ahorros de más del 50% vs competidores' },
    'efficiency-expert': { name: 'Experto en eficiencia', description: 'Seleccionaste los módulos de personal e inventario' },
    'full-stack': { name: 'Operador full stack', description: 'Seleccionaste todos los módulos disponibles' },
    'empire-builder': { name: 'Constructor de imperios', description: 'Configuraste 10 o más ubicaciones' },
  },
};

function getLocalizedText<T>(locale: PersonasLocale, map: Partial<Record<PersonasLocale, Record<string, T>>>, id: string): T | undefined {
  return map[locale]?.[id];
}

export function getLocalizedPersonas(locale: PersonasLocale): Record<string, Persona> {
  const copy = localizedPersonaText[locale];
  if (!copy) return personas;

  return Object.fromEntries(
    Object.entries(personas).map(([id, persona]) => [
      id,
      {
        ...persona,
        ...(copy[id] ?? {}),
      },
    ]),
  ) as Record<string, Persona>;
}

export function getLocalizedPersona(locale: PersonasLocale, personaId: string): Persona {
  return getLocalizedPersonas(locale)[personaId] ?? personas[personaId];
}

export function getLocalizedQuizQuestions(locale: PersonasLocale): QuizQuestion[] {
  const copy = localizedQuestionText[locale];
  if (!copy) return quizQuestions;

  return quizQuestions.map((question) => {
    const questionCopy = copy[question.id];
    if (!questionCopy) return question;

    return {
      ...question,
      question: questionCopy.question,
      subtitle: questionCopy.subtitle,
      helperText: questionCopy.helperText,
      options: question.options.map((option) => ({
        ...option,
        label: questionCopy.options[option.id] ?? option.label,
      })),
    };
  });
}

export function getLocalizedAchievement(locale: PersonasLocale, achievement: Achievement): Achievement {
  const copy = getLocalizedText(locale, localizedAchievementText, achievement.id);
  if (!copy) return achievement;

  return {
    ...achievement,
    ...copy,
  };
}

export function getLocalizedAchievements(locale: PersonasLocale): Achievement[] {
  return achievements.map((achievement) => getLocalizedAchievement(locale, achievement));
}
