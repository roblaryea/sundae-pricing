import { afterEach, describe, expect, it, vi } from 'vitest';
import { formatPayrollCountry } from '../src/lib/payrollCountryLabels';
import { PAYROLL_COUNTRIES, type PricingIntent } from '../src/lib/pricingIntent';
import { buildBasketPrintHTML } from '../src/lib/basketPdf';
import { calculateBasketQuote } from '../src/lib/basketQuote';

afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); });

describe.each([
  ['az', 'Birləşmiş Ərəb Əmirlikləri', 'Birləşmiş Krallıq'],
  ['pap', 'Emiratonan Arabe Uni', 'Reino Uni'],
] as const)('%s payroll country names with missing browser language data', (locale, emirates, unitedKingdom) => {
  it('does not silently substitute English when Intl lacks the locale', () => {
    vi.spyOn(Intl, 'DisplayNames').mockImplementation(() => { throw new Error('Locale unavailable'); });
    expect(formatPayrollCountry('AE', locale)).toBe(emirates);
    expect(formatPayrollCountry('GB', locale)).toBe(unitedKingdom);
    for (const country of PAYROLL_COUNTRIES) expect(formatPayrollCountry(country.code, locale)).toBeTruthy();
  });

  it('keeps the selected country native in the branded print document', () => {
    vi.stubGlobal('window', { location: { origin: 'https://pricing.sundae.io' } });
    const config: PricingIntent = { v: 2, layer: 'crew', corePackage: 'core_foundation', locations: 8,
      addOns: [], watchtowerModules: [], crewSkus: ['crew_operations', 'crew_scheduling', 'crew_tna', 'crew_payroll'],
      crossIntelligence: 'none', billingCycle: 'monthly', operatingModels: [], employees: 200, payrollCountry: 'AE' };
    const html = buildBasketPrintHTML(config, calculateBasketQuote(config), 'https://pricing.sundae.io/simulator', locale);
    expect(html).toContain(emirates);
    expect(html).not.toContain('United Arab Emirates');
  });
});

it('retains standard region names in other supported locales', () => {
  expect(formatPayrollCountry('AE', 'ar')).toBe('الإمارات العربية المتحدة');
  expect(formatPayrollCountry('FR', 'fr')).toBe('France');
});

it('does not display unrecognized handoff data as a country label', () => {
  expect(formatPayrollCountry('XX', 'az')).toBe('');
  expect(formatPayrollCountry('<script>', 'pap')).toBe('');
});

it('covers the 36 payroll country codes, with the four UK nations represented by GB', () => {
  const expected = 'AE SA QA BH OM KW US CA GB AT BE BG HR CY CZ DK EE FI FR DE GR HU IE IT LV LT LU MT NL PL PT RO SK SI ES SE'.split(' ').sort();
  expect(PAYROLL_COUNTRIES.filter(c => c.supported).map(c => c.code).sort()).toEqual(expected);
  expect(new Set(PAYROLL_COUNTRIES.map(c => c.code)).size).toBe(PAYROLL_COUNTRIES.length);
});
