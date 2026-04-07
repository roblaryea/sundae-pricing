import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { ErrorBoundary } from './components/ErrorBoundary';
import { CookieConsent } from './components/CookieConsent';
import { useLocale } from './contexts/LocaleContext';

const PricingOverview = lazy(() =>
  import('./pages/PricingOverview').then((module) => ({ default: module.PricingOverview })),
);
const Simulator = lazy(() =>
  import('./pages/Simulator').then((module) => ({ default: module.Simulator })),
);

function RouteFallback() {
  const { locale } = useLocale();
  const copy =
    locale === 'ar'
      ? 'جارٍ تحميل تجربة التسعير...'
      : locale === 'fr'
        ? 'Chargement de l’experience tarifaire...'
        : locale === 'es'
          ? 'Cargando la experiencia de precios...'
          : 'Loading pricing experience...';
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
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          {/* Landing page at root */}
          <Route path="/" element={<Layout><PricingOverview /></Layout>} />

          {/* Simulator at /simulator */}
          <Route path="/simulator" element={<Layout><Simulator /></Layout>} />

          {/* Redirect any unknown routes to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
      <CookieConsent />
    </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
