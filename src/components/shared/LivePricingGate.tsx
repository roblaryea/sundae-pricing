import { AlertCircle, LoaderCircle } from 'lucide-react';
import type { ReactNode } from 'react';
import type { LivePricingState } from '../../data/livePricing';
import { useLocale } from '../../contexts/LocaleContext';

const LIVE_PRICING_COPY = {
  en: {
    loadingTitle: 'Loading published pricing',
    loadingBody: 'We are fetching the latest pricing from Sundae Admin so this page reflects the current published catalog.',
    errorTitle: 'Published pricing is unavailable',
    errorBody: 'This pricing experience requires the current published catalog from Sundae Admin and will not fall back to static values.',
    retry: 'Retry',
  },
  ar: {
    loadingTitle: 'جارٍ تحميل الأسعار المنشورة',
    loadingBody: 'نقوم بجلب أحدث الأسعار من Sundae Admin حتى تعكس هذه الصفحة الكتالوج المنشور الحالي.',
    errorTitle: 'الأسعار المنشورة غير متاحة',
    errorBody: 'تتطلب هذه التجربة السعرية الكتالوج المنشور الحالي من Sundae Admin ولن تعود إلى قيم ثابتة.',
    retry: 'إعادة المحاولة',
  },
  fr: {
    loadingTitle: 'Chargement des tarifs publies',
    loadingBody: 'Nous recuperons les derniers tarifs depuis Sundae Admin afin que cette page reflete le catalogue publie actuel.',
    errorTitle: 'Les tarifs publies ne sont pas disponibles',
    errorBody: 'Cette experience tarifaire requiert le catalogue publie actuel depuis Sundae Admin et ne revient pas a des valeurs statiques.',
    retry: 'Reessayer',
  },
  es: {
    loadingTitle: 'Cargando precios publicados',
    loadingBody: 'Estamos obteniendo los precios mas recientes desde Sundae Admin para que esta pagina refleje el catalogo publicado actual.',
    errorTitle: 'Los precios publicados no estan disponibles',
    errorBody: 'Esta experiencia de precios requiere el catalogo publicado actual de Sundae Admin y no volvera a valores estaticos.',
    retry: 'Reintentar',
  },
} as const;

interface LivePricingGateProps {
  state: LivePricingState;
  children: ReactNode;
}

export function LivePricingGate({ state, children }: LivePricingGateProps) {
  const { locale } = useLocale();
  const copy = LIVE_PRICING_COPY[locale] ?? LIVE_PRICING_COPY.en;

  if (!state.required || state.status === 'ready') {
    return <>{children}</>;
  }

  const isLoading = state.status === 'idle' || state.status === 'loading';

  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <div className="rounded-2xl border border-white/10 bg-sundae-surface p-8 text-center shadow-2xl">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-white/5">
          {isLoading ? (
            <LoaderCircle className="h-7 w-7 animate-spin text-sundae-accent" />
          ) : (
            <AlertCircle className="h-7 w-7 text-amber-400" />
          )}
        </div>
        <h1 className="mb-3 text-2xl font-bold text-white">
          {isLoading ? copy.loadingTitle : copy.errorTitle}
        </h1>
        <p className="mx-auto mb-4 max-w-2xl text-sm text-sundae-muted">
          {isLoading ? copy.loadingBody : copy.errorBody}
        </p>
        {!isLoading && state.error ? (
          <p className="mb-6 text-xs text-sundae-muted">{state.error}</p>
        ) : null}
        {!isLoading ? (
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="inline-flex items-center justify-center rounded-lg bg-gradient-primary px-5 py-2.5 text-sm font-semibold text-white"
          >
            {copy.retry}
          </button>
        ) : null}
      </div>
    </div>
  );
}
