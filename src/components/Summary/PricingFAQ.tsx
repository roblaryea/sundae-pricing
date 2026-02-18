// Pricing FAQ component from sundae_pricing_card_v2.md

import { motion } from 'framer-motion';
import { HelpCircle, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { LEGAL } from '../../config/legal';

interface FAQItem {
  question: string;
  answer: string;
}

const faqItems: FAQItem[] = [
  {
    question: 'Are there setup fees?',
    answer: 'Yes — each module has a one-time setup fee covering integration work (e.g. Labor $299, Inventory $499, Pulse $399). Discounts apply: 20% off for 3+ modules, 50% off for Complete Intelligence bundle, 25% off with annual prepay, and setup fees are waived for Enterprise contracts.'
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
    question: 'Do modules require Core tier?',
    answer: 'Yes. All 10 intelligence modules are Core tier add-ons. The exception is Pulse, which can also be added to Report Pro with a $99/mo unlock fee.'
  },
  {
    question: 'Can I add Watchtower to Report tier?',
    answer: 'No. Watchtower requires Core tier or higher.'
  },
  {
    question: 'How do discounts work?',
    answer: 'Volume discounts (5% at 30-99 locations, 7% at 100-200) and billing discounts (10% annual, 15% 2-year) are non-stacking — you get whichever is larger, up to a maximum of 15%. Enterprise customers receive custom pricing.'
  },
  {
    question: 'Are AI credits shared across locations?',
    answer: 'Yes. AI credits are pooled at the org level and can be used across all locations. Unused credits roll over at 25% (one month). Purchased top-up credits never expire.'
  },
  {
    question: 'What are viewer seats vs user seats?',
    answer: 'Viewer seats (read-only, no AI queries) are unlimited and free at all tiers. "Users" are accounts with AI query capabilities — each tier includes a set number, with additional seats available at $5-$12/seat/mo depending on tier.'
  },
  {
    question: 'What is Pulse and how does it work?',
    answer: 'Pulse is a premium real-time monitoring module. On Core tiers it costs $199/mo + $24/loc. On Report Pro it requires an additional $99/mo unlock fee. Setup is $399 (covers 1 POS + 1 Labor + 1 Inventory integration).'
  },
  {
    question: 'What is the Finance Add-On prerequisite?',
    answer: 'The Finance Add-On bundle (Profit Intelligence + Revenue Assurance) requires active Labor Intelligence and Inventory Connect modules. You can get these individually or via the Ops Suite bundle.'
  },
  {
    question: 'When does Enterprise pricing apply?',
    answer: 'You are eligible for Enterprise pricing if you have 30+ locations, $10,000+/month projected spend, or need custom integrations, SSO/SAML, or custom SLAs. Eligible customers may choose standard pricing with a volume discount OR request custom Enterprise pricing.'
  }
];

export function PricingFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

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
