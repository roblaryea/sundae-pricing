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
  options: QuizOption[];
}

export interface QuizOption {
  id: string;
  label: string;
  emoji?: string;
  value: any;
  weight: Record<string, number>; // Persona weights
}

// Personas definitions
export const personas: Record<string, Persona> = {
  explorer: {
    id: "explorer",
    name: "The Data Explorer",
    emoji: "🔭",
    description: "You're curious about analytics but want to test the waters before diving in. Perfect for single locations looking to understand their data better.",
    recommendedPath: "report-lite",
    color: "#10B981", // green
    modules: [],
    locationRange: { min: 1, max: 2 }
  },
  optimizer: {
    id: "optimizer",
    name: "The Efficiency Hunter",
    emoji: "⚡",
    description: "Every percentage point matters. You want real-time control over operations and are ready to optimize labor and inventory costs.",
    recommendedPath: "core-lite",
    color: "#3B82F6", // blue
    modules: ["labor", "inventory"],
    locationRange: { min: 2, max: 5 }
  },
  commander: {
    id: "commander",
    name: "The Portfolio Commander",
    emoji: "🎯",
    description: "Multiple locations need unified visibility and strategic tools. You're building an empire and need intelligence to match.",
    recommendedPath: "core-pro",
    color: "#8B5CF6", // purple
    modules: ["labor", "inventory", "marketing"],
    locationRange: { min: 6, max: 20 }
  },
  strategist: {
    id: "strategist",
    name: "The Market Strategist",
    emoji: "🏆",
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
    options: [
      {
        id: "solo",
        label: "Solo Act",
        emoji: "🏪",
        value: 1,
        weight: { explorer: 10, optimizer: 0, commander: 0, strategist: 0 }
      },
      {
        id: "small",
        label: "Small Squad",
        emoji: "🏬",
        value: 3,
        weight: { explorer: 5, optimizer: 10, commander: 3, strategist: 0 }
      },
      {
        id: "growing",
        label: "Growing Empire",
        emoji: "🏙️",
        value: 8,
        weight: { explorer: 0, optimizer: 5, commander: 10, strategist: 5 }
      },
      {
        id: "enterprise",
        label: "Restaurant Royalty",
        emoji: "👑",
        value: 25,
        weight: { explorer: 0, optimizer: 0, commander: 5, strategist: 10 }
      }
    ]
  },
  {
    id: "pain",
    question: "What keeps you up at night?",
    subtitle: "Your biggest operational challenge",
    options: [
      {
        id: "labor",
        label: "Labor costs",
        emoji: "👥",
        value: "labor",
        weight: { explorer: 3, optimizer: 10, commander: 8, strategist: 5 }
      },
      {
        id: "food",
        label: "Food waste",
        emoji: "🥘",
        value: "inventory",
        weight: { explorer: 3, optimizer: 10, commander: 8, strategist: 5 }
      },
      {
        id: "competition",
        label: "Competition",
        emoji: "🥊",
        value: "competition",
        weight: { explorer: 0, optimizer: 3, commander: 5, strategist: 10 }
      },
      {
        id: "growth",
        label: "Growth planning",
        emoji: "📈",
        value: "growth",
        weight: { explorer: 5, optimizer: 5, commander: 10, strategist: 8 }
      }
    ]
  },
  {
    id: "decisions",
    question: "How do you make decisions today?",
    subtitle: "Your current analytics approach",
    options: [
      {
        id: "gut",
        label: "Gut feeling",
        emoji: "💭",
        value: "gut",
        weight: { explorer: 10, optimizer: 0, commander: 0, strategist: 0 }
      },
      {
        id: "spreadsheets",
        label: "Spreadsheets",
        emoji: "📊",
        value: "spreadsheets",
        weight: { explorer: 5, optimizer: 10, commander: 3, strategist: 2 }
      },
      {
        id: "pos",
        label: "Basic POS reports",
        emoji: "📋",
        value: "pos",
        weight: { explorer: 8, optimizer: 8, commander: 5, strategist: 3 }
      },
      {
        id: "ai",
        label: "Want AI to help",
        emoji: "🤖",
        value: "ai",
        weight: { explorer: 3, optimizer: 5, commander: 10, strategist: 10 }
      }
    ]
  },
  {
    id: "appetite",
    question: "What's your analytics appetite?",
    subtitle: "How deep do you want to go?",
    options: [
      {
        id: "curious",
        label: "Just curious",
        emoji: "🤔",
        value: "curious",
        weight: { explorer: 10, optimizer: 2, commander: 0, strategist: 0 }
      },
      {
        id: "ready",
        label: "Ready to commit",
        emoji: "💪",
        value: "ready",
        weight: { explorer: 0, optimizer: 10, commander: 8, strategist: 5 }
      },
      {
        id: "everything",
        label: "Need everything yesterday",
        emoji: "🚀",
        value: "everything",
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
    icon: "🔭",
    trigger: "quiz_complete",
    points: 10
  },
  {
    id: "stack-builder",
    name: "Stack Builder",
    description: "Selected your first tier",
    icon: "🏗️",
    trigger: "tier_selected",
    points: 20
  },
  {
    id: "module-master",
    name: "Module Master",
    description: "Added 2+ modules to your stack",
    icon: "⚡",
    trigger: "modules_count >= 2",
    points: 30
  },
  {
    id: "intelligence-commander",
    name: "Intelligence Commander",
    description: "Unlocked Watchtower",
    icon: "🏰",
    trigger: "watchtower_selected",
    points: 50
  },
  {
    id: "roi-believer",
    name: "ROI Believer",
    description: "Calculated your projected returns",
    icon: "📈",
    trigger: "roi_calculated",
    points: 25
  },
  {
    id: "sundae-ready",
    name: "Sundae Ready",
    description: "Completed your full configuration",
    icon: "🍨",
    trigger: "summary_viewed",
    points: 100
  },
  {
    id: "savings-hero",
    name: "Savings Hero",
    description: "Discovered 50%+ savings vs competitors",
    icon: "💰",
    trigger: "savings_percent >= 50",
    points: 40
  },
  {
    id: "efficiency-expert",
    name: "Efficiency Expert",
    description: "Selected labor + inventory modules",
    icon: "⚙️",
    trigger: "combo_labor_inventory",
    points: 35
  },
  {
    id: "full-stack",
    name: "Full Stack Operator",
    description: "Selected all available modules",
    icon: "🎯",
    trigger: "all_modules",
    points: 75
  },
  {
    id: "empire-builder",
    name: "Empire Builder",
    description: "Configured 10+ locations",
    icon: "🏰",
    trigger: "locations >= 10",
    points: 45
  }
];
