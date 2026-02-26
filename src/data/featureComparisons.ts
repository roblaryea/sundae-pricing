// Detailed feature comparison tables — v5.1 (Derived from sundae_final_pricing_v5.1.md)

export const reportFeatureComparison = [
  {
    category: 'Data Input Method',
    features: [
      { name: 'Manual CSV upload', lite: '✓', plus: '✓', pro: '✓' },
      { name: 'AI-parsed upload (PDF/Excel/Screenshot)', lite: '❌', plus: '✓', pro: '✓' },
      { name: 'API integration (automated)', lite: '❌', plus: '❌', pro: '✓' },
      { name: 'Data refresh', lite: 'Manual upload', plus: 'Daily EOD (AI-assisted)', pro: 'Daily EOD (automated API)' },
    ]
  },
  {
    category: 'Visuals & Analytics',
    features: [
      { name: 'Pre-built visuals', lite: '~20 core visuals', plus: '~30 visuals', pro: '~80 visuals' },
      { name: 'Dashboard type', lite: 'Pre-built only', plus: 'Pre-built + custom', pro: 'Pre-built + custom' },
      { name: 'Filtering', lite: 'Basic', plus: 'Advanced', pro: 'Advanced' },
      { name: 'Custom date ranges', lite: '❌', plus: '✓', pro: '✓' },
      { name: 'Correlation analysis', lite: '❌', plus: '❌', pro: '✓' },
      { name: 'Multi-location comparison', lite: '❌', plus: '❌', pro: '✓' },
    ]
  },
  {
    // Derived from v5.1 Section 5: AI Credit System
    category: 'AI Credits (Monthly)',
    features: [
      { name: 'Base org credits', lite: '250 credits', plus: '1,200 credits', pro: '3,500 credits' },
      { name: 'Credits per additional location', lite: '+80 credits', plus: '+300 credits', pro: '+800 credits' },
      { name: 'Rollover policy', lite: 'No rollover', plus: '25% of base credits (1 month)', pro: '25% of base credits (1 month)' },
      { name: 'Can purchase top-ups?', lite: '✓ (1,000 cr only)', plus: '✓', pro: '✓' },
    ]
  },
  {
    // Derived from v5.1 Section 7: User Seats
    category: 'Users',
    features: [
      { name: 'Included seats', lite: '1 seat', plus: '5 seats', pro: '10 seats' },
      { name: 'Unlimited viewer seats', lite: '✓ (free)', plus: '✓ (free)', pro: '✓ (free)' },
      { name: 'Additional seats', lite: 'None', plus: '$19/seat (max 3 additional)', pro: '$15/seat (max 5 additional)' },
    ]
  },
  {
    // Derived from v5.1 Section 1: Benchmarking included at all tiers (free)
    category: 'Benchmarking',
    features: [
      { name: 'Benchmarking included', lite: '✓ Basic', plus: '✓ Expanded', pro: '✓ Full' },
      { name: 'Radius control', lite: '1km (locked)', plus: '1-2km adjustable', pro: '1-3km adjustable' },
      { name: 'Segment filters', lite: '"All restaurants" only', plus: '1 simultaneous filter', pro: '2 simultaneous filters' },
      { name: 'Comparison type', lite: 'Anonymous only', plus: 'Percentile rankings', pro: 'Percentile + portfolio' },
    ]
  },
  {
    // Derived from v5.1 Section 7: Historical Access Upgrades
    category: 'Historical Access',
    features: [
      { name: 'Included access', lite: '90 days', plus: '1 year', pro: '2 years' },
      { name: 'Upgrade to 1 year', lite: '+$19/mo', plus: 'Included', pro: 'Included' },
      { name: 'Upgrade to 2 years', lite: 'Not available', plus: '+$19/mo', pro: 'Included' },
      { name: 'Upgrade to 3 years', lite: 'Not available', plus: '+$32/mo', pro: '+$29/mo' },
      { name: 'Upgrade to 5 years', lite: 'Not available', plus: 'Not available', pro: '+$49/mo' },
    ]
  },
  {
    // Derived from v5.1: Sundae Intelligence + Pulse Access
    category: 'Add-ons (Report Pro Only)',
    features: [
      { name: 'Sundae Intelligence', lite: '❌', plus: '❌', pro: '+$79/mo unlock' },
      { name: 'Pulse access', lite: '❌', plus: '❌', pro: '+$99/mo unlock + $199/mo module (setup fee applies)' },
      { name: 'API access', lite: '❌', plus: '❌', pro: '✓ (5,000 calls/mo)' },
    ]
  },
  {
    category: 'Collaboration',
    features: [
      { name: 'View dashboards', lite: '✓', plus: '✓', pro: '✓' },
      { name: 'Share dashboard links', lite: '❌', plus: '✓ Internal only', pro: '✓ Internal + exports (PDF/CSV)' },
      { name: 'Scheduled exports', lite: '❌', plus: 'Weekly', pro: 'Daily' },
      { name: 'Commenting', lite: '❌', plus: 'Basic', pro: 'Full + @mentions' },
      { name: 'Custom shared views', lite: '❌', plus: '❌', pro: '2 views' },
    ]
  },
  {
    category: 'Reports',
    features: [
      { name: 'AI summaries', lite: 'Monthly', plus: 'Weekly + monthly', pro: 'Weekly + monthly' },
      { name: 'Report detail level', lite: 'Basic summary', plus: 'Standard report', pro: 'Expanded report' },
      { name: 'Custom insights', lite: '❌', plus: '❌', pro: '✓ Per location' },
    ]
  },
  {
    // Derived from v5.1 Section 7: Support Upgrades
    category: 'Support',
    features: [
      { name: 'Support channels', lite: 'Email only', plus: 'Email + Chat', pro: 'Priority Email + Chat' },
      { name: 'Response time SLA', lite: '72 hours', plus: '24 hours', pro: '12 hours' },
      { name: 'Priority upgrade', lite: '❌', plus: '+$99/mo (4hr SLA)', pro: '+$79/mo (4hr SLA)' },
      { name: 'Premium 24/7 upgrade', lite: '❌', plus: '+$249/mo', pro: '+$199/mo' },
    ]
  },
  {
    // Derived from v5.1 Section 5: AI Credit Top-Up Bundles
    category: 'AI Credit Top-Ups',
    features: [
      { name: '1,000 credits', lite: '$30', plus: '$20', pro: '$15' },
      { name: '3,000 credits', lite: '—', plus: '$55', pro: '$40' },
      { name: '5,000 credits', lite: '—', plus: '—', pro: '$60' },
    ]
  }
];

export const coreFeatureComparison = [
  {
    category: 'POS Integration',
    features: [
      { name: 'Number of POS systems', lite: '1 system', pro: 'Multi-POS supported', enterprise: 'Multi-POS + custom' },
      { name: 'Live API connection', lite: '✓', pro: '✓', enterprise: '✓' },
      { name: 'Historical data import', lite: '✓', pro: '✓', enterprise: '✓' },
      { name: 'Different POS per location', lite: '❌', pro: '✓', enterprise: '✓' },
      { name: 'Consolidated cross-platform analytics', lite: '❌', pro: '✓', enterprise: '✓' },
      { name: 'Custom integrations', lite: '❌', pro: 'Supported', enterprise: '✓ Included' },
    ]
  },
  {
    // Derived from v5.1 Section 1: Tier Feature Summary
    category: 'Data Refresh',
    features: [
      { name: 'Refresh frequency', lite: '15-min', pro: '5-min', enterprise: 'Real-time (configurable)' },
      { name: 'Historical data', lite: '2 years', pro: '3 years', enterprise: 'Custom' },
    ]
  },
  {
    category: 'Sales Analytics (Included)',
    features: [
      { name: 'Revenue trending', lite: '✓', pro: '✓', enterprise: '✓' },
      { name: 'Day part performance', lite: '✓', pro: '✓', enterprise: '✓' },
      { name: 'Menu item analysis', lite: '✓', pro: '✓', enterprise: '✓' },
      { name: 'Payment breakdown', lite: '✓', pro: '✓', enterprise: '✓' },
      { name: 'Customer patterns', lite: '✓', pro: '✓', enterprise: '✓' },
      { name: 'Sales per labor hour', lite: '✓', pro: '✓', enterprise: '✓' },
      { name: 'Advanced forecasting models', lite: '❌', pro: '✓', enterprise: '✓' },
      { name: 'Channel correlation / attribution', lite: '❌', pro: '✓ (where integrations exist)', enterprise: '✓ Advanced (custom)' },
      { name: 'Cross-platform analytics', lite: '❌', pro: '✓', enterprise: '✓' },
      { name: 'Custom analytics modules', lite: '❌', pro: '❌', enterprise: '✓ (contracted)' },
      { name: 'White-label reporting', lite: '❌', pro: '❌', enterprise: '✓ (contracted)' },
    ]
  },
  {
    // Derived from v5.1 Section 5: AI Credit System
    category: 'AI Credits (Monthly)',
    features: [
      { name: 'Base org credits', lite: '8,000 credits', pro: '14,000 credits', enterprise: '50,000+' },
      { name: 'Credits per additional location', lite: '+1,600 credits', pro: '+2,800 credits', enterprise: '+5,000 credits' },
      { name: 'Rollover policy', lite: '25% of base credits (1 month)', pro: '25% of base credits (1 month)', enterprise: 'N/A (50,000+ base)' },
      { name: 'Can purchase top-ups?', lite: '✓', pro: '✓', enterprise: 'Custom' },
    ]
  },
  {
    // Derived from v5.1 Section 1 + Section 6: AI Capabilities
    category: 'AI Capabilities',
    features: [
      { name: 'Anomaly detection & alerts', lite: '✓ (15-min cadence)', pro: '✓ (5-min cadence)', enterprise: '✓ Real-time (configurable)' },
      { name: 'Predictive forecasting', lite: '14-day', pro: '30-day', enterprise: 'Custom horizon' },
      { name: 'What-if scenario modeling', lite: 'Basic (limited)', pro: '✓', enterprise: '✓ Advanced' },
      { name: 'AI insights & recommendations', lite: '✓', pro: '✓', enterprise: '✓' },
      { name: 'Live performance alerts', lite: '✓', pro: '✓', enterprise: '✓' },
      { name: 'Sundae Intelligence', lite: '✓ Included', pro: '✓ Included', enterprise: '✓ Included' },
      { name: 'AI Plus/Pro packages', lite: '✓ Available', pro: '✓ Available', enterprise: 'Custom cap' },
      { name: 'Custom ML models', lite: '❌', pro: '❌', enterprise: '✓ (contracted)' },
      { name: 'Priority AI capacity', lite: '❌', pro: '❌', enterprise: '✓ (contracted)' },
    ]
  },
  {
    // Derived from v5.1 Section 7: User Seats
    category: 'Users',
    features: [
      { name: 'Included seats', lite: '15', pro: '25', enterprise: 'Unlimited' },
      { name: 'Unlimited viewer seats', lite: '✓ (free)', pro: '✓ (free)', enterprise: '✓ (free)' },
      { name: 'Additional seats', lite: '$12/seat/mo (unlimited)', pro: '$10/seat/mo (unlimited)', enterprise: 'N/A (unlimited)' },
    ]
  },
  {
    // Derived from v5.1 Section 1: Benchmarking included (free)
    category: 'Benchmarking',
    features: [
      { name: 'Benchmarking included', lite: '✓', pro: '✓', enterprise: '✓ Custom' },
      { name: 'Radius control', lite: '1-5km', pro: '0.5-10km', enterprise: 'Custom geography' },
      { name: 'Segment filters', lite: 'Multiple simultaneous', pro: 'Expanded filters', enterprise: 'Expanded + custom' },
      { name: 'Near real-time updates', lite: '✓', pro: '✓', enterprise: '✓' },
      { name: 'Custom peer groups', lite: '❌', pro: '✓', enterprise: '✓' },
      { name: 'Portfolio comparison across markets', lite: '❌', pro: '✓', enterprise: '✓' },
      { name: 'Private peer groups', lite: '❌', pro: '❌', enterprise: '✓' },
      { name: 'Proprietary benchmarks', lite: '❌', pro: '❌', enterprise: '✓' },
    ]
  },
  {
    // Derived from v5.1 Section 2 + Section 4: Modules & Watchtower availability
    category: 'Modules & Watchtower',
    features: [
      { name: 'Intelligence modules', lite: '✓ (10 available)', pro: '✓ (10 available)', enterprise: 'Included (contract-based)' },
      { name: 'Watchtower', lite: '✓ (add-on)', pro: '✓ (add-on)', enterprise: 'Included (contract-based)' },
      { name: 'Pulse', lite: '✓ Available as module (setup fee applies)', pro: '✓ Available as module (setup fee applies)', enterprise: 'Included (contract-based)' },
      { name: 'Module setup fees', lite: 'Per module', pro: 'Per module', enterprise: 'Waived' },
    ]
  },
  {
    category: 'Portfolio Management',
    features: [
      { name: 'Multi-location overview', lite: '✓ (2+ locations)', pro: '✓ Premium dashboard', enterprise: '✓ Enterprise suite' },
      { name: 'Location comparison & ranking', lite: '✓', pro: '✓ Advanced', enterprise: '✓ Advanced' },
      { name: 'Cross-location alerts', lite: '✓', pro: '✓', enterprise: '✓' },
      { name: 'Performance distribution', lite: '✓', pro: '✓', enterprise: '✓' },
      { name: 'Brand/region grouping', lite: '❌', pro: '✓', enterprise: '✓' },
      { name: 'Best practice identification', lite: '❌', pro: '✓', enterprise: '✓' },
      { name: 'Multi-brand management', lite: 'Limited', pro: '✓', enterprise: '✓' },
    ]
  },
  {
    category: 'Custom Dashboards',
    features: [
      { name: 'Custom dashboards', lite: 'Standard quota', pro: 'Higher quota', enterprise: 'No limit (contracted)' },
      { name: 'AI Chart Builder', lite: '✓', pro: '✓ Advanced', enterprise: '✓ Advanced' },
      { name: 'Team sharing', lite: '✓', pro: '✓', enterprise: '✓' },
      { name: 'Custom KPI builder', lite: '❌', pro: '✓', enterprise: '✓' },
      { name: 'Dashboard scheduling', lite: '❌', pro: '✓', enterprise: '✓' },
      { name: 'API-driven dashboards', lite: '❌', pro: '❌', enterprise: '✓' },
    ]
  },
  {
    // Derived from v5.1 Section 7: Historical Access Upgrades
    category: 'Historical Access',
    features: [
      { name: 'Included access', lite: '2 years', pro: '3 years', enterprise: 'Custom' },
      { name: 'Upgrade to 3 years', lite: '+$29/mo', pro: 'Included', enterprise: 'Custom' },
      { name: 'Upgrade to 5 years', lite: '+$49/mo', pro: '+$49/mo', enterprise: 'Custom' },
      { name: 'Archival options', lite: '❌', pro: '❌', enterprise: '✓' },
    ]
  },
  {
    // Derived from v5.1 Section 7: API Add-Ons
    category: 'API Access',
    features: [
      { name: 'Base API calls', lite: '10,000/mo', pro: '100,000/mo', enterprise: 'Custom' },
      { name: '+10K calls', lite: '+$39/mo', pro: '+$29/mo', enterprise: 'Custom' },
      { name: '+50K calls', lite: '+$149/mo', pro: '+$99/mo', enterprise: 'Custom' },
      { name: 'BI Connector', lite: '+$149/mo', pro: '+$99/mo', enterprise: '✓ Included' },
      { name: 'Additional POS', lite: '+$99/mo', pro: 'Included', enterprise: '✓ Included' },
    ]
  },
  {
    // Derived from v5.1 Section 7: Support Upgrades
    category: 'Support',
    features: [
      { name: 'Base support', lite: 'Chat', pro: 'Phone', enterprise: 'Dedicated CSM' },
      { name: 'Priority (4hr SLA)', lite: '+$79/mo', pro: 'Included', enterprise: 'Included' },
      { name: 'Premium 24/7 (2hr)', lite: '+$149/mo', pro: '+$99/mo', enterprise: 'Included' },
      { name: 'Dedicated CSM', lite: '+$499/mo', pro: '+$299/mo', enterprise: 'Included' },
      { name: 'Slack/Teams', lite: '+$149/mo', pro: '+$99/mo', enterprise: 'Included' },
    ]
  },
  {
    // Derived from v5.1 Section 5: AI Credit Top-Up Bundles
    category: 'AI Credit Top-Ups',
    features: [
      { name: '1,000 credits', lite: '$12', pro: '$10', enterprise: 'Custom' },
      { name: '3,000 credits', lite: '$33', pro: '$27', enterprise: 'Custom' },
      { name: '5,000 credits', lite: '$50', pro: '$40', enterprise: 'Custom' },
      { name: '10,000 credits', lite: '$90', pro: '$70', enterprise: 'Custom' },
    ]
  }
];
