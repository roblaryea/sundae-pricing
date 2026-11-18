import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { Layout } from './components/Layout';
import { ErrorBoundary } from './components/ErrorBoundary';
import { PricingMetadata } from './components/PricingMetadata';
import { CookieConsent } from './components/CookieConsent';
import { LivePricingPending } from './components/shared/LivePricingGate';
import { importWithRecovery } from './lib/lazyImport';

const PricingOverview = lazy(() =>
  importWithRecovery(() => import('./pages/PricingOverview'), 'pricing-overview').then((module) => ({ default: module.PricingOverview })),
);
const Simulator = lazy(() =>
  importWithRecovery(() => import('./pages/Simulator'), 'simulator').then((module) => ({ default: module.Simulator })),
);

function App() {
  return (
    <ErrorBoundary>
    <BrowserRouter>
      <PricingMetadata/>
      <Layout><Suspense fallback={<LivePricingPending />}>
        <Routes>
          {/* Landing page at root */}
          <Route path="/" element={<PricingOverview />} />

          {/* Simulator at /simulator */}
          <Route path="/simulator" element={<Simulator />} />

          {/* Redirect any unknown routes to home */}
          <Route path="*" element={<div className="buyer-page"><p>404</p><h1>Page not found</h1><Link className="pricing-primary" to="/">Sundae Pricing</Link></div>} />
        </Routes>
      </Suspense></Layout>
      <CookieConsent />
    </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
