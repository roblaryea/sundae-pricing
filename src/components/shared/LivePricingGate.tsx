import { AlertCircle, LoaderCircle } from 'lucide-react';
import type { ReactNode } from 'react';
import type { LivePricingState } from '../../data/livePricing';
import { useLocale } from '../../contexts/LocaleContext';
import { generatedAuxiliaryLocalePacks } from '../../lib/generatedAuxiliaryLocalePacks';

const LIVE_PRICING_COPY = {
  en: {
    loadingTitle: "Loading pricing",
    loadingBody: "One moment while we load the latest pricing.",
    errorTitle: "Pricing is temporarily unavailable",
    errorBody: "We could not load pricing just now. Please try again in a moment. If the problem continues, book a demo and we will walk you through the numbers.",
    retry: "Try again",
  },
  ar: {
    loadingTitle: "جارٍ تحميل الأسعار",
    loadingBody: "لحظة من فضلك، نحمّل أحدث الأسعار.",
    errorTitle: "الأسعار غير متاحة مؤقتًا",
    errorBody: "تعذّر تحميل الأسعار في الوقت الحالي. يُرجى المحاولة مرة أخرى بعد قليل. وإذا استمرت المشكلة، احجز عرضًا توضيحيًا وسنستعرض الأرقام معك.",
    retry: "إعادة المحاولة",
  },
  fr: {
    loadingTitle: "Chargement des tarifs",
    loadingBody: "Un instant, nous chargeons les derniers tarifs.",
    errorTitle: "Les tarifs sont momentanément indisponibles",
    errorBody: "Nous n'avons pas pu charger les tarifs pour le moment. Merci de réessayer dans quelques instants. Si le problème persiste, réservez une démo et nous parcourrons les chiffres avec vous.",
    retry: "Réessayer",
  },
  es: {
    loadingTitle: "Cargando precios",
    loadingBody: "Un momento, estamos cargando los precios más recientes.",
    errorTitle: "Los precios no están disponibles temporalmente",
    errorBody: "No hemos podido cargar los precios en este momento. Inténtalo de nuevo en unos instantes. Si el problema continúa, reserva una demostración y repasaremos las cifras contigo.",
    retry: "Reintentar",
  },
} as const;

type LivePricingCopyLocale = keyof typeof LIVE_PRICING_COPY;

interface LivePricingGateProps {
  state: LivePricingState;
  children: ReactNode;
}

export function LivePricingGate({ state, children }: LivePricingGateProps) {
  const { locale } = useLocale();
  const copy =
    LIVE_PRICING_COPY[locale as LivePricingCopyLocale] ??
    generatedAuxiliaryLocalePacks.supportCopy[locale as keyof typeof generatedAuxiliaryLocalePacks.supportCopy]?.livePricingCopy ??
    LIVE_PRICING_COPY.en;

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
