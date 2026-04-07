import { Component, type ErrorInfo, type ReactNode } from "react";
import * as Sentry from "@sentry/react";
import { supportedLocales, type PricingLocale } from "../contexts/LocaleContext";

interface Props { children: ReactNode; fallback?: ReactNode; }
interface State { hasError: boolean; }

const errorCopy: Record<PricingLocale, { title: string; description: string; retry: string }> = {
  en: {
    title: "Something went wrong",
    description: "Please try refreshing the page.",
    retry: "Try again",
  },
  ar: {
    title: "حدث خطأ ما",
    description: "يرجى تحديث الصفحة والمحاولة مرة أخرى.",
    retry: "حاول مرة أخرى",
  },
  fr: {
    title: "Une erreur s'est produite",
    description: "Veuillez actualiser la page puis réessayer.",
    retry: "Réessayer",
  },
  es: {
    title: "Algo salió mal",
    description: "Actualiza la página y vuelve a intentarlo.",
    retry: "Volver a intentarlo",
  },
};

function resolveLocale(): PricingLocale {
  if (typeof document === "undefined") return "en";
  const lang = document.documentElement.lang?.toLowerCase().split("-")[0];
  if ((supportedLocales as readonly string[]).includes(lang)) {
    return lang as PricingLocale;
  }
  return "en";
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State { return { hasError: true }; }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    Sentry.captureException(error, { extra: { componentStack: errorInfo.componentStack } });
  }

  render() {
    if (this.state.hasError) {
      const copy = errorCopy[resolveLocale()] ?? errorCopy.en;
      return this.props.fallback || (
        <div style={{ padding: "40px", textAlign: "center", fontFamily: "system-ui" }}>
          <h2>{copy.title}</h2>
          <p style={{ color: "#666" }}>{copy.description}</p>
          <button onClick={() => this.setState({ hasError: false })} style={{ padding: "8px 16px", marginTop: "16px", cursor: "pointer" }}>
            {copy.retry}
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
