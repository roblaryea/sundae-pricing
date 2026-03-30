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
export function calculatePersonaMatch(answers: Record<string, string>): {
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
  const persona = personas[winningPersonaId];
  
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
