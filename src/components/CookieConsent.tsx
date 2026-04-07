import { useState, useCallback } from "react";
import { getMarketingUrl } from "../config/legal";
import { useLocale } from "../contexts/LocaleContext";

const CONSENT_KEY = "sundae_cookie_consent";

type ConsentStatus = "accepted" | "declined" | null;

const cookieConsentCopy = {
  en: {
    ariaLabel: "Cookie consent",
    message: "We use cookies to improve your experience and analyze site usage.",
    privacy: "Privacy Policy",
    decline: "Decline",
    accept: "Accept",
  },
  ar: {
    ariaLabel: "موافقة ملفات تعريف الارتباط",
    message: "نستخدم ملفات تعريف الارتباط لتحسين تجربتك وتحليل استخدام الموقع.",
    privacy: "سياسة الخصوصية",
    decline: "رفض",
    accept: "موافقة",
  },
  fr: {
    ariaLabel: "Consentement aux cookies",
    message: "Nous utilisons des cookies pour améliorer votre expérience et analyser l’utilisation du site.",
    privacy: "Politique de confidentialité",
    decline: "Refuser",
    accept: "Accepter",
  },
  es: {
    ariaLabel: "Consentimiento de cookies",
    message: "Usamos cookies para mejorar tu experiencia y analizar el uso del sitio.",
    privacy: "Política de privacidad",
    decline: "Rechazar",
    accept: "Aceptar",
  },
} as const;

export function getConsentStatus(): ConsentStatus {
  const value = localStorage.getItem(CONSENT_KEY);
  if (value === "accepted" || value === "declined") return value;
  return null;
}

export function hasConsent(): boolean {
  return getConsentStatus() === "accepted";
}

export function CookieConsent() {
  const { locale } = useLocale();
  const copy = cookieConsentCopy[locale] ?? cookieConsentCopy.en;
  const [visible, setVisible] = useState(() => getConsentStatus() === null);

  const handleAccept = useCallback(() => {
    localStorage.setItem(CONSENT_KEY, "accepted");
    setVisible(false);
    window.dispatchEvent(new CustomEvent("sundae_consent_change", { detail: "accepted" }));
  }, []);

  const handleDecline = useCallback(() => {
    localStorage.setItem(CONSENT_KEY, "declined");
    setVisible(false);
  }, []);

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label={copy.ariaLabel}
      className="fixed bottom-0 left-0 right-0 z-[9999] border-t border-white/10 bg-slate-900/95 backdrop-blur-md"
    >
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 px-4 py-4 sm:flex-row sm:justify-between sm:px-6">
        <p className="text-sm text-slate-300 text-center sm:text-left">
          {copy.message}{' '}
          <a href={getMarketingUrl('/privacy', locale)} target="_blank" rel="noopener noreferrer" className="underline hover:text-white transition-colors">{copy.privacy}</a>
        </p>
        <div className="flex shrink-0 gap-3">
          <button
            onClick={handleDecline}
            className="rounded-lg border border-white/20 px-4 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-white/5 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/30"
          >
            {copy.decline}
          </button>
          <button
            onClick={handleAccept}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            {copy.accept}
          </button>
        </div>
      </div>
    </div>
  );
}
