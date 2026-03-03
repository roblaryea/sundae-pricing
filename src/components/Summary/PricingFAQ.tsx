// Pricing FAQ component with category-specific questions

import { motion } from 'framer-motion';
import { HelpCircle, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { LEGAL } from '../../config/legal';

interface FAQItem {
  question: string;
  answer: string;
}

type FAQCategory = 'report' | 'core' | 'watchtower' | 'general';

const reportFAQ: FAQItem[] = [
  {
    question: 'What is Sundae Report?',
    answer: 'Sundae Report is our analytics layer that connects to your existing data sources (POS, delivery, reviews) and generates actionable insights — no POS integration required. Start free with Report Lite, or unlock benchmarking and AI-powered analysis with Plus or Pro.'
  },
  {
    question: 'What\'s the difference between Report Lite, Plus, and Pro?',
    answer: 'Report Lite is free with 1 AI seat and 250 base credits — great for trying Sundae. Report Plus ($79/mo) adds benchmarking, 3 AI seats, 1,200 credits, and 30 visuals. Report Pro ($159/mo) includes 5 AI seats, 3,500 credits, 80 visuals, and advanced analytics like trend forecasting.'
  },
  {
    question: 'How do AI credits work?',
    answer: 'AI credits power Sundae\'s intelligent features — every AI query, insight generation, or automated analysis consumes credits. Each tier includes a base amount plus per-location credits. Unused credits roll over at 25% of your base allocation (one month). You can also buy top-up bundles that never expire.'
  },
  {
    question: 'Do I need a POS integration for Report?',
    answer: 'No! Report works with uploaded data — CSV files, delivery platform exports, and manual entry. POS integration is optional and unlocks real-time data refresh. Core tier is recommended if you want live POS integration.'
  },
  {
    question: 'What are viewer seats vs AI user seats?',
    answer: 'Viewer seats are unlimited and free at all tiers — they provide read-only access to dashboards without AI query capabilities. AI user seats allow team members to ask questions, generate insights, and use AI features. Each tier includes a set number of AI seats.'
  },
  {
    question: 'Can I upgrade from Report to Core later?',
    answer: 'Yes! You can upgrade from Report to Core anytime. Upgrades are effective immediately and your existing data, dashboards, and settings carry over. Core adds real-time POS integration, modules, and Watchtower eligibility.'
  },
  {
    question: 'Is there a free trial?',
    answer: 'Report Lite is free forever — no credit card required. For Report Plus and Pro, we offer a 14-day free trial so you can experience the full feature set before committing.'
  }
];

const coreFAQ: FAQItem[] = [
  {
    question: 'What\'s the difference between Report and Core?',
    answer: 'Core adds real-time POS integration, intelligence modules (Labor, Inventory, Marketing, etc.), Watchtower eligibility, and significantly more AI credits and seats. Report is great for analytics on uploaded data; Core is for live operational intelligence.'
  },
  {
    question: 'What are intelligence modules?',
    answer: 'Modules are specialized add-ons for Core tier that provide deep intelligence in specific areas: Labor ($219/mo), Inventory ($229/mo), Purchasing ($169/mo), Marketing ($249/mo), and more. Each module has an org license covering your first 3 locations, then per-location pricing from location #4+.'
  },
  {
    question: 'Are there setup fees for modules?',
    answer: 'Yes — each module has a one-time setup fee covering integration work (e.g., Labor $399, Inventory $499, Pulse $499). Discounts apply: 20% off for 3+ modules, 50% off for Complete Intelligence bundle, 25% off with annual prepay, and setup fees are waived for Enterprise contracts.'
  },
  {
    question: 'What is the Cross-Intelligence Engine?',
    answer: 'When you activate 3+ modules, the Cross-Intelligence Engine automatically surfaces hidden correlations between your data sources — e.g., how weather impacts both labor scheduling and inventory waste. The base tier is included free; Cross-Intelligence Pro ($199/mo + $19/location) adds full correlation matrix, revenue attribution, spend efficiency radar, campaign pulse monitoring, and cannibalization detection.'
  },
  {
    question: 'What\'s included in Core Lite vs Core Pro?',
    answer: 'Core Lite ($279/mo) includes 10 AI seats, 8,000 base credits, and 30 custom dashboards. Core Pro ($449/mo) adds 15 AI seats, 14,000 credits, 75 dashboards, 30-day predictive analytics, and lower per-location pricing on modules.'
  },
  {
    question: 'How do volume discounts work?',
    answer: 'Volume discounts (5% for growth chains at 30-99 locations, 7% for multi-site at 100-200) and billing discounts (10% annual, 15% 2-year) are non-stacking — you get whichever is larger, up to a maximum of 15%. Enterprise customers (30+ locations) receive custom pricing.'
  },
  {
    question: "What's the contract term?",
    answer: 'Month-to-month by default. Cancel anytime with no penalty. Annual prepay saves 10%, 2-year prepay saves 15%. Enterprise contracts have custom terms.'
  }
];

const watchtowerFAQ: FAQItem[] = [
  {
    question: 'What is Sundae Watchtower?',
    answer: 'Watchtower is Sundae\'s market intelligence suite that monitors your competitive landscape, local events, and industry trends. It provides actionable alerts so you can proactively adjust pricing, staffing, and marketing based on external factors.'
  },
  {
    question: 'What are the three Watchtower modules?',
    answer: 'Competitive Intelligence ($549/mo base + $69/loc) tracks competitor pricing, menus, and reviews. Events Intelligence ($249/mo + $39/loc) monitors local events that impact traffic. Trends Intelligence ($299/mo + $29/loc) identifies macro industry and consumer trends in your market.'
  },
  {
    question: 'What is the Watchtower Bundle?',
    answer: 'The Watchtower Bundle ($899/mo base + $109/loc) includes all three modules at a discount — saving you $198/mo on base pricing compared to buying them individually. It\'s the most popular option for multi-location operators who want complete market visibility.'
  },
  {
    question: 'Does Watchtower require Core tier?',
    answer: 'Yes. Watchtower is available exclusively for Core tier subscribers (Core Lite, Core Pro, or Enterprise). It is not available with Report tier.'
  },
  {
    question: 'How does Watchtower pricing scale with locations?',
    answer: 'Each Watchtower module has a base price covering your first location, plus a per-location fee from location #2 onward. For example, Competitive Intelligence is $549 base + $69 per additional location. The Bundle is $899 + $109 per additional location.'
  },
  {
    question: 'Is Enterprise pricing available for Watchtower?',
    answer: 'Yes. Enterprise customers (30+ locations or $10,000+/month projected spend) receive custom Watchtower pricing, including flat-rate options. Contact sales for a custom quote.'
  },
  {
    question: 'Can I add individual Watchtower modules later?',
    answer: 'Yes! You can start with one module and add more anytime. If you later activate all three, you can switch to the Bundle pricing to get the discount. Changes take effect immediately.'
  }
];

const generalFAQ: FAQItem[] = [
  {
    question: 'Are there setup fees?',
    answer: 'Yes — each module has a one-time setup fee covering integration work (e.g. Labor $399, Inventory $499, Pulse $499). Discounts apply: 20% off for 3+ modules, 50% off for Complete Intelligence bundle, 25% off with annual prepay, and setup fees are waived for Enterprise contracts.'
  },
  {
    question: "What's the contract term?",
    answer: 'Month-to-month by default. Cancel anytime with no penalty. Annual prepay saves 10%, 2-year prepay saves 15%. Enterprise contracts have custom terms.'
  },
  {
    question: 'Can I upgrade or downgrade?',
    answer: 'Yes. Upgrades are effective immediately. Downgrades take effect at next billing cycle.'
  },
  {
    question: 'How do discounts work?',
    answer: 'Volume discounts (5% at 30-99 locations, 7% at 100-200) and billing discounts (10% annual, 15% 2-year) are non-stacking — you get whichever is larger, up to a maximum of 15%. Enterprise customers receive custom pricing.'
  },
  {
    question: 'Are AI credits shared across locations?',
    answer: 'Yes. AI credits are pooled at the org level and can be used across all locations. Unused credits roll over at 25% of base credits (one month). Purchased top-up credits never expire.'
  },
  {
    question: 'What are viewer seats vs user seats?',
    answer: 'Viewer seats (read-only, no AI queries) are unlimited and free at all tiers. "Users" are accounts with AI query capabilities — each tier includes a set number (1-25 depending on tier), with additional seats available at $10-$19/seat/mo depending on tier.'
  },
  {
    question: 'When does Enterprise pricing apply?',
    answer: 'You are eligible for Enterprise pricing if you have 30+ locations, $10,000+/month projected spend, or need custom integrations, SSO/SAML, or custom SLAs. Eligible customers may choose standard pricing with a volume discount OR request custom Enterprise pricing.'
  }
];

const faqByCategory: Record<FAQCategory, FAQItem[]> = {
  report: reportFAQ,
  core: coreFAQ,
  watchtower: watchtowerFAQ,
  general: generalFAQ,
};

interface PricingFAQProps {
  category?: FAQCategory;
}

export function PricingFAQ({ category = 'general' }: PricingFAQProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqItems = faqByCategory[category] || generalFAQ;

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleFAQ(index);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="bg-sundae-surface rounded-xl p-8"
    >
      <h3 className="text-2xl font-bold mb-2 flex items-center gap-2">
        <HelpCircle className="w-6 h-6 text-sundae-accent" />
        Frequently Asked Questions
      </h3>
      <p className="text-sundae-muted mb-6">Everything you need to know about Sundae pricing</p>

      <div className="space-y-3">
        {faqItems.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.05 * index }}
            className="border border-white/10 rounded-lg overflow-hidden"
          >
            <button
              onClick={() => toggleFAQ(index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
              aria-expanded={openIndex === index}
              aria-controls={`faq-answer-${index}`}
              type="button"
            >
              <span className="font-semibold pr-4">{item.question}</span>
              <motion.div
                animate={{ rotate: openIndex === index ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="w-5 h-5 text-sundae-accent flex-shrink-0" />
              </motion.div>
            </button>

            <motion.div
              id={`faq-answer-${index}`}
              role="region"
              initial={false}
              animate={{
                height: openIndex === index ? 'auto' : 0,
                opacity: openIndex === index ? 1 : 0
              }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="px-6 pb-4 text-sundae-muted" aria-live="polite">
                {item.answer}
              </div>
            </motion.div>
          </motion.div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-violet-500/10 rounded-lg border border-violet-500/30">
        <p className="text-sm text-center">
          <strong>Still have questions?</strong> Contact us at{' '}
          <a
            href={`mailto:${LEGAL.supportEmail}`}
            className="text-sundae-accent hover:underline font-semibold"
          >
            {LEGAL.supportEmail}
          </a>
          {' '}or visit{' '}
          <a
            href={LEGAL.demoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sundae-accent hover:underline font-semibold"
          >
            {LEGAL.primaryDomain}/demo
          </a>
        </p>
      </div>
    </motion.div>
  );
}
