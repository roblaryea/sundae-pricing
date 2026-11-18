import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { Layout } from '../src/components/Layout';
import { LivePricingPending } from '../src/components/shared/LivePricingGate';
import { ThemeProvider } from '../src/contexts/ThemeContext';
import { LocaleProvider } from '../src/contexts/LocaleContext';
import type { PricingLocale } from '../src/lib/locales';

/** Use the actual responsive loading tree before JavaScript as well as during
 * route/catalogue loading. Discovery copy remains available without JavaScript. */
export function renderPricingShell(locale: PricingLocale, simulator: boolean, discoveryHtml: string) {
  const html = renderToStaticMarkup(
    <LocaleProvider initialLocale={locale}><ThemeProvider>
      <MemoryRouter initialEntries={[simulator ? '/simulator' : '/']}>
        <Layout><LivePricingPending/><noscript dangerouslySetInnerHTML={{__html:discoveryHtml}}/></Layout>
      </MemoryRouter>
    </ThemeProvider></LocaleProvider>,
  );
  // The build cannot know a visitor's shared theme cookie. Both unmodified
  // approved PNGs follow the pre-paint html class until React takes over.
  return html.replace(/<img\b[^>]*src="[^"]*sundae-wordmark-fraunces-white\.png"[^>]*\/?\s*>/g, image =>
    `<span class="pricing-static-wordmark">${image.replace('<img','<img data-prerender-theme="dark"')}${image.replace('<img','<img data-prerender-theme="light"').replace('sundae-wordmark-fraunces-white.png','sundae-wordmark-fraunces.png')}</span>`);
}
