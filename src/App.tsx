import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { Layout } from './components/Layout';
import { ErrorBoundary } from './components/ErrorBoundary';
import { PricingMetadata } from './components/PricingMetadata';
import { CookieConsent } from './components/CookieConsent';
import { useLocale } from './contexts/LocaleContext';
import { importWithRecovery } from './lib/lazyImport';

const PricingOverview = lazy(() =>
  importWithRecovery(() => import('./pages/PricingOverview'), 'pricing-overview').then((module) => ({ default: module.PricingOverview })),
);
const Simulator = lazy(() =>
  importWithRecovery(() => import('./pages/Simulator'), 'simulator').then((module) => ({ default: module.Simulator })),
);

function RouteFallback() {
  const { messages } = useLocale();
  const copy = messages.pdf.generating;
  return (
    <div className="mx-auto flex min-h-[40vh] max-w-7xl items-center justify-center px-4 text-sm text-sundae-muted">
      {copy}
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
    <BrowserRouter>
      <PricingMetadata/>
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          {/* Landing page at root */}
          <Route path="/" element={<Layout><PricingOverview /></Layout>} />

          {/* Simulator at /simulator */}
          <Route path="/simulator" element={<Layout><Simulator /></Layout>} />

          {/* Redirect any unknown routes to home */}
          <Route path="*" element={<Layout><div className="buyer-page"><p>404</p><h1>Page not found</h1><Link className="pricing-primary" to="/">Sundae Pricing</Link></div></Layout>} />
        </Routes>
      </Suspense>
      <CookieConsent />
    </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
