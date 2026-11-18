import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useLocale } from '../contexts/LocaleContext';
import { getPricingMetadata, SOCIAL_IMAGE } from '../lib/pricingMetadata';

export function PricingMetadata() {
  const { locale } = useLocale();
  const { pathname } = useLocation();
  useEffect(() => {
    const known = pathname === '/' || pathname === '/simulator';
    const meta = getPricingMetadata(locale, pathname !== '/');
    document.title = known ? meta.title : 'Page not found | Sundae Pricing';
    const setMeta = (key: string, value: string) => {
      const attr = key.startsWith('og:') ? 'property' : 'name';
      let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
      if (!el) { el = document.createElement('meta'); el.setAttribute(attr,key); document.head.append(el); }
      el.content = value;
    };
    const canonical = document.head.querySelector<HTMLLinkElement>('link[rel=canonical]');
    if (canonical) canonical.href = meta.canonical;
    setMeta('description', meta.description);
    setMeta('robots', meta.robots);
    setMeta('og:title', document.title); setMeta('og:description',meta.description); setMeta('og:url',meta.canonical); setMeta('og:image',SOCIAL_IMAGE);
    setMeta('twitter:title',document.title); setMeta('twitter:description',meta.description); setMeta('twitter:image',SOCIAL_IMAGE);
    document.head.querySelectorAll('link[rel=alternate][hreflang]').forEach(el=>el.remove());
    for (const alternate of [...meta.alternates,{lang:'x-default',href:meta.alternates[0].href}]) {
      const link = document.createElement('link'); link.rel = 'alternate'; link.hreflang = alternate.lang; link.href = alternate.href; document.head.append(link);
    }
  }, [locale,pathname]);
  return null;
}
