// Detailed feature comparison tables from Sundae Pricing Card 2026

export const reportFeatureComparison = [
  {
    category: 'Data Input Method',
    features: [
      { name: 'Manual CSV upload', lite: '✓', plus: '✓', pro: '✓' },
      { name: 'AI-parsed upload (PDF/Excel/Screenshot)', lite: '❌', plus: '✓ (2-3 min process)', pro: '✓' },
      { name: 'API integration (automated)', lite: '❌', plus: '❌', pro: '✓ (zero manual effort)' },
      { name: 'Daily summary refresh (EOD)', lite: 'Manual only', plus: 'Manual or AI-parsed', pro: 'Fully automated API' },
    ]
  },
  {
    category: 'Visuals & Analytics',
    features: [
      { name: 'Pre-built visuals', lite: '20 core visuals', plus: '50 comprehensive', pro: 'Up to 120 comprehensive' },
      { name: 'Dashboard type', lite: 'Pre-built only', plus: 'Pre-built + custom', pro: 'Pre-built + custom' },
      { name: 'Filtering', lite: 'Basic', plus: 'Advanced', pro: 'Advanced' },
      { name: 'Custom date ranges', lite: '❌', plus: '✓', pro: '✓' },
      { name: 'Correlation analysis', lite: '❌', plus: '❌', pro: '✓' },
      { name: 'Multi-location comparison', lite: '❌', plus: '❌', pro: '✓' },
    ]
  },
  {
    category: 'AI Credits (Monthly)',
    features: [
      { name: 'Base org credits', lite: '40 credits', plus: '150 credits', pro: '400 credits' },
      { name: 'Credits per additional location', lite: '+8 credits', plus: '+30 credits', pro: '+80 credits' },
      { name: 'Rollover policy', lite: 'No rollover', plus: '25% (max 50)', pro: '25% (max 100)' },
      { name: 'Available credit types', lite: 'Summary only (1 credit)', plus: 'Summary (1), Detailed (3)', pro: 'Summary (1), Detailed (3), Chat with visual (2)' },
      { name: 'Can purchase top-ups?', lite: '✓ (100 credits only)', plus: '✓', pro: '✓' },
    ]
  },
  {
    category: 'AI Seats',
    features: [
      { name: 'Included AI seats', lite: '1 seat', plus: '3 seats', pro: '5 seats' },
      { name: 'Unlimited viewer seats', lite: '✓', plus: '✓', pro: '✓' },
      { name: 'Additional AI seat cost', lite: '$12/seat/mo', plus: '$10/seat/mo', pro: '$8/seat/mo' },
    ]
  },
  {
    category: 'Benchmarking',
    features: [
      { name: 'Number of metrics', lite: '5 core metrics', plus: '15 key metrics', pro: '30 full metrics' },
      { name: 'Radius control', lite: '1km (locked)', plus: '1-2km adjustable', pro: '1-3km adjustable' },
      { name: 'Segment filters', lite: '"All restaurants" only', plus: '1 simultaneous filter', pro: '2 simultaneous filters' },
      { name: 'Comparison type', lite: 'Anonymous only', plus: 'Percentile rankings', pro: 'Percentile + portfolio' },
    ]
  },
  {
    category: 'Data Retention',
    features: [
      { name: 'Included retention', lite: 'Current month + 90 days', plus: 'Current month + 1 year', pro: 'Current month + 2 years' },
      { name: 'Upgrade to 1 year', lite: '+$19/mo', plus: 'Included', pro: 'Included' },
      { name: 'Upgrade to 2 years', lite: 'Not available', plus: '+$19/mo', pro: 'Included' },
      { name: 'Upgrade to 3 years', lite: 'Not available', plus: '+$32/mo', pro: '+$29/mo' },
    ]
  },
  {
    category: 'Collaboration',
    features: [
      { name: 'View dashboards', lite: '✓', plus: '✓', pro: '✓' },
      { name: 'Share dashboard links', lite: '❌', plus: '✓ Internal only', pro: '✓ Internal + external' },
      { name: 'Email dashboards', lite: '❌', plus: 'Weekly', pro: 'Daily' },
      { name: 'Commenting', lite: '❌', plus: 'Basic', pro: 'Full + @mentions' },
      { name: 'Custom shared views', lite: '❌', plus: '❌', pro: '2 views' },
    ]
  },
  {
    category: 'Reports',
    features: [
      { name: 'AI summaries', lite: 'Monthly', plus: 'Weekly + monthly', pro: 'Weekly + monthly' },
      { name: 'Report detail level', lite: 'Basic summary', plus: '3-4 page reports', pro: '5-6 page reports' },
      { name: 'Custom insights', lite: '❌', plus: '❌', pro: '✓ Per location' },
    ]
  },
  {
    category: 'Support',
    features: [
      { name: 'Support channels', lite: 'Email only', plus: 'Email + Chat', pro: 'Email + Chat' },
      { name: 'Response time SLA', lite: '72 hours', plus: '24 hours', pro: '12 hours' },
      { name: 'Priority queue', lite: '❌', plus: '❌', pro: '✓' },
      { name: 'CS check-ins', lite: '❌', plus: '❌', pro: '✓ Optional' },
    ]
  },
  {
    category: 'Add-ons & Upgrades',
    features: [
      { name: 'AI Credit Top-ups (100 credits)', lite: '$30 one-time', plus: '$20 one-time', pro: '$15 one-time' },
      { name: 'AI Credit Top-ups (500 credits)', lite: 'Not available', plus: '$85 one-time', pro: '$65 one-time' },
      { name: 'AI Credit Top-ups (1,000 credits)', lite: 'Not available', plus: '$160 one-time', pro: '$120 one-time' },
    ]
  }
];

export const coreFeatureComparison = [
  {
    category: 'POS Integration',
    features: [
      { name: 'Number of POS systems', lite: '1 system', pro: 'Unlimited (multi-POS)', enterprise: 'Unlimited + custom' },
      { name: 'Real-time API connection', lite: '✓', pro: '✓', enterprise: '✓' },
      { name: 'Historical data import', lite: '✓', pro: '✓', enterprise: '✓' },
      { name: 'Different POS per location', lite: '❌', pro: '✓', enterprise: '✓' },
      { name: 'Consolidated cross-platform analytics', lite: '❌', pro: '✓', enterprise: '✓' },
      { name: 'Custom integrations', lite: '❌', pro: 'Supported', enterprise: '✓ Included' },
    ]
  },
  {
    category: 'Data Refresh',
    features: [
      { name: 'Refresh frequency', lite: '4-hour cycle', pro: '2-hour cycle', enterprise: 'Custom (configurable)' },
      { name: 'Monitoring level', lite: 'Regular updates (6x daily)', pro: 'Frequent updates (12x daily)', enterprise: 'Custom schedules' },
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
      { name: 'Multi-channel attribution', lite: '❌', pro: '✓', enterprise: '✓' },
      { name: 'Cross-platform analytics', lite: '❌', pro: '✓', enterprise: '✓' },
      { name: 'Custom analytics modules', lite: '❌', pro: '❌', enterprise: '✓' },
      { name: 'White-label reporting', lite: '❌', pro: '❌', enterprise: '✓' },
    ]
  },
  {
    category: 'AI Credits (Monthly)',
    features: [
      { name: 'Base org credits', lite: '800 credits', pro: '1,400 credits', enterprise: 'Unlimited' },
      { name: 'Credits per additional location', lite: '+160 credits', pro: '+280 credits', enterprise: 'Unlimited' },
      { name: 'Rollover policy', lite: '25% (max 200)', pro: '25% (max 350)', enterprise: 'N/A (unlimited)' },
      { name: 'Can purchase top-ups?', lite: '✓', pro: '✓', enterprise: 'N/A (unlimited)' },
    ]
  },
  {
    category: 'AI Capabilities',
    features: [
      { name: 'Real-time anomaly detection', lite: '✓', pro: '✓', enterprise: '✓' },
      { name: 'Predictive forecasting', lite: '14-day', pro: '30-day', enterprise: 'Custom horizon' },
      { name: 'What-if scenario modeling', lite: '✓', pro: '✓', enterprise: '✓ Advanced' },
      { name: 'Operational recommendations', lite: '✓', pro: '✓', enterprise: '✓' },
      { name: 'Live performance alerts', lite: '✓', pro: '✓', enterprise: '✓' },
      { name: 'Advanced ML models', lite: '❌', pro: '✓', enterprise: '✓' },
      { name: 'Custom prediction algorithms', lite: '❌', pro: '✓', enterprise: '✓ Custom-built' },
      { name: 'Portfolio-wide insights', lite: '❌', pro: '✓', enterprise: '✓' },
      { name: 'Custom ML models', lite: '❌', pro: '❌', enterprise: '✓' },
      { name: 'Dedicated AI resources', lite: '❌', pro: '❌', enterprise: '✓' },
    ]
  },
  {
    category: 'AI Seats',
    features: [
      { name: 'Included AI seats', lite: '10 seats', pro: '20 seats', enterprise: 'Unlimited' },
      { name: 'Unlimited viewer seats', lite: '✓', pro: '✓', enterprise: '✓' },
      { name: 'Additional AI seat cost', lite: '$5/seat/mo', pro: '$5/seat/mo', enterprise: 'N/A (unlimited)' },
    ]
  },
  {
    category: 'Benchmarking',
    features: [
      { name: 'Number of metrics', lite: '30+ metrics', pro: '30+ metrics', enterprise: '30+ metrics' },
      { name: 'Radius control', lite: '1-5km', pro: '0.5-10km', enterprise: 'Custom geography' },
      { name: 'Segment filters', lite: '3+ simultaneous', pro: 'Unlimited', enterprise: 'Unlimited' },
      { name: 'Real-time updates', lite: '✓', pro: '✓', enterprise: '✓' },
      { name: 'Custom peer groups', lite: '❌', pro: '✓', enterprise: '✓' },
      { name: 'Portfolio comparison across markets', lite: '❌', pro: '✓', enterprise: '✓' },
      { name: 'Private peer groups', lite: '❌', pro: '❌', enterprise: '✓' },
      { name: 'Proprietary benchmarks', lite: '❌', pro: '❌', enterprise: '✓' },
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
      { name: 'Performance variance analysis', lite: '❌', pro: '✓', enterprise: '✓' },
      { name: 'Multi-brand management', lite: '✓', pro: '✓', enterprise: '✓' },
      { name: 'Regional aggregation', lite: '✓', pro: '✓', enterprise: '✓' },
      { name: 'Executive dashboards', lite: '✓', pro: '✓', enterprise: '✓' },
    ]
  },
  {
    category: 'Custom Dashboards',
    features: [
      { name: 'Number of custom dashboards', lite: '30 dashboards', pro: '75 dashboards', enterprise: 'Unlimited' },
      { name: 'AI Chart Builder', lite: '✓', pro: '✓ Advanced', enterprise: '✓ Advanced' },
      { name: 'Team sharing', lite: '✓', pro: '✓', enterprise: '✓' },
      { name: 'Custom KPI builder', lite: '❌', pro: '✓ (10 KPIs)', enterprise: '✓ Unlimited' },
      { name: 'Dashboard scheduling', lite: '❌', pro: '✓', enterprise: '✓' },
      { name: 'API-driven dashboards', lite: '❌', pro: '❌', enterprise: '✓' },
      { name: 'Custom development', lite: '❌', pro: '❌', enterprise: '✓' },
    ]
  },
  {
    category: 'Data Retention',
    features: [
      { name: 'Included retention', lite: 'Current month + 2 years', pro: 'Current month + 3 years', enterprise: 'Custom' },
      { name: 'Upgrade to 3 years', lite: '+$29/mo', pro: 'Included', enterprise: 'Custom' },
      { name: 'Upgrade to 5 years', lite: '+$49/mo', pro: '+$49/mo', enterprise: 'Custom' },
      { name: 'Archival options', lite: '❌', pro: '❌', enterprise: '✓' },
    ]
  },
  {
    category: 'API Access',
    features: [
      { name: 'API type', lite: 'Read-only', pro: 'Read-only', enterprise: 'Full CRUD' },
      { name: 'Rate limits', lite: 'Standard', pro: 'Higher', enterprise: 'Custom' },
      { name: 'Webhook notifications', lite: '✓', pro: '✓', enterprise: '✓' },
      { name: 'Custom integrations', lite: '❌', pro: 'Supported', enterprise: '✓ Included' },
      { name: 'Dedicated endpoints', lite: '❌', pro: '❌', enterprise: '✓' },
    ]
  },
  {
    category: 'Support',
    features: [
      { name: 'Support channels', lite: 'Email + Chat + Phone', pro: 'Email + Chat + Phone', enterprise: 'Dedicated CSM' },
      { name: 'Coverage', lite: 'Business hours', pro: 'Business hours + priority', enterprise: '24/7 available' },
      { name: 'Response time SLA', lite: '4 hours', pro: '2 hours', enterprise: '15 min (critical)' },
      { name: 'Onboarding training', lite: '✓', pro: '✓ Enhanced', enterprise: '✓ Custom program' },
      { name: 'Ongoing reviews', lite: 'Quarterly (optional)', pro: 'Monthly strategic', enterprise: 'Quarterly executive' },
    ]
  },
  {
    category: 'Add-ons & Upgrades',
    features: [
      { name: 'AI Credit Top-ups (100 credits)', lite: '$12 one-time', pro: '$10 one-time', enterprise: 'Unlimited included' },
      { name: 'AI Credit Top-ups (500 credits)', lite: '$50 one-time', pro: '$40 one-time', enterprise: 'Unlimited included' },
      { name: 'AI Credit Top-ups (1,000 credits)', lite: '$90 one-time', pro: '$70 one-time', enterprise: 'Unlimited included' },
      { name: 'Priority Support (2hr SLA)', lite: '+$149/mo', pro: '+$149/mo', enterprise: 'Included' },
      { name: 'Premium Support (24/7, 1hr SLA)', lite: '+$299/mo', pro: '+$299/mo', enterprise: 'Included or Custom' },
    ]
  }
];
