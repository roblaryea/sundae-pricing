// Pricing FAQ component from sundae_pricing_card_v2.md

import { motion } from 'framer-motion';
import { HelpCircle, ChevronDown } from 'lucide-react';
import { useState } from 'react';

interface FAQItem {
  question: string;
  answer: string;
}

const faqItems: FAQItem[] = [
  {
    question: 'Are there setup fees?',
    answer: 'No mandatory setup fees for standard onboarding. We charge $0 for standard implementation, POS integration, data import, and training at all tiers. Optional premium services (white-label branding, custom integrations, on-site training) are priced separately.'
  },
  {
    question: "What's the contract term?",
    answer: 'Report and Core tiers: Month-to-month. Cancel anytime with no penalty. Large portfolios (100+ locations): Annual or multi-year billing commitments may be offered for volume discounts, with minimum location guarantees. Custom terms available.'
  },
  {
    question: 'Can I upgrade or downgrade?',
    answer: 'Yes. Upgrades are effective immediately. Downgrades take effect at next billing cycle.'
  },
  {
    question: 'Do modules require Core tier?',
    answer: 'Yes. Modules are add-ons to Core tier only. Report tier cannot add modules.'
  },
  {
    question: 'Can I add Watchtower to Report tier?',
    answer: 'No. Watchtower requires Core tier or higher.'
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'Credit card, ACH, wire transfer (Enterprise only).'
  },
  {
    question: 'Are AI credits shared across locations?',
    answer: 'Yes. AI credits are pooled at the org level and can be used across all locations.'
  },
  {
    question: 'Do AI seats carry over month-to-month?',
    answer: 'AI seats are monthly subscriptions. Credits have rollover (25% for most tiers), but seats do not accumulate.'
  },
  {
    question: 'Can I buy just data retention without upgrading my tier?',
    answer: 'Yes. Data retention upgrades are available as standalone add-ons (see Add-Ons section).'
  },
  {
    question: 'What if I need custom pricing for 50+ locations?',
    answer: 'We offer volume pricing for 50-99 locations under Core Pro. Enterprise pricing typically starts at 100+ locations (or when enterprise requirements such as SSO, SLAs, or dedicated CSM apply). Contact sales@sundae.io for a custom quote.'
  }
];

export function PricingFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
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
              className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
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
              initial={false}
              animate={{
                height: openIndex === index ? 'auto' : 0,
                opacity: openIndex === index ? 1 : 0
              }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="px-6 pb-4 text-sundae-muted">
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
            href="mailto:sales@sundae.io" 
            className="text-sundae-accent hover:underline font-semibold"
          >
            sales@sundae.io
          </a>
          {' '}or visit{' '}
          <a 
            href="https://sundae.io/demo" 
            target="_blank"
            rel="noopener noreferrer"
            className="text-sundae-accent hover:underline font-semibold"
          >
            sundae.io/demo
          </a>
        </p>
      </div>
    </motion.div>
  );
}
