import { getPricingIntlLocale, type PricingLocale } from './locales';
import { PAYROLL_COUNTRIES } from './pricingIntent';

type PayrollCountryCode = typeof PAYROLL_COUNTRIES[number]['code'];

// Browser region-name data varies. Papiamento is absent from common Intl
// implementations; Azeri also fell back to English in the hosted walkthrough.
// Keep complete native labels for both so selection, review and print agree.
const nativeCountryNames: Partial<Record<PricingLocale, Record<PayrollCountryCode, string>>> = {
  az: {
    AE: 'Birləşmiş Ərəb Əmirlikləri', SA: 'Səudiyyə Ərəbistanı', QA: 'Qətər',
    BH: 'Bəhreyn', OM: 'Oman', KW: 'Küveyt', GB: 'Birləşmiş Krallıq',
    IE: 'İrlandiya', CA: 'Kanada', US: 'Amerika Birləşmiş Ştatları',
    AT: 'Avstriya', BE: 'Belçika', BG: 'Bolqarıstan', HR: 'Xorvatiya',
    CY: 'Kipr', CZ: 'Çexiya', DK: 'Danimarka', EE: 'Estoniya',
    FI: 'Finlandiya', FR: 'Fransa', DE: 'Almaniya', GR: 'Yunanıstan',
    HU: 'Macarıstan', IT: 'İtaliya', LV: 'Latviya', LT: 'Litva',
    LU: 'Lüksemburq', MT: 'Malta', NL: 'Niderland', PL: 'Polşa',
    PT: 'Portuqaliya', RO: 'Rumıniya', SK: 'Slovakiya', SI: 'Sloveniya',
    ES: 'İspaniya', SE: 'İsveç', AU: 'Avstraliya', IN: 'Hindistan',
    JP: 'Yaponiya', MY: 'Malayziya', NZ: 'Yeni Zelandiya',
    SG: 'Sinqapur', ZA: 'Cənubi Afrika',
  },
  pap: {
    AE: 'Emiratonan Arabe Uni', SA: 'Arabia Saudita', QA: 'Qatar',
    BH: 'Bahrain', OM: 'Oman', KW: 'Kuwait', GB: 'Reino Uni',
    IE: 'Irlanda', CA: 'Canada', US: 'Estadonan Uni',
    AT: 'Austria', BE: 'Belgica', BG: 'Bulgaria', HR: 'Croacia',
    CY: 'Chipre', CZ: 'Chekia', DK: 'Dinamarca', EE: 'Estonia',
    FI: 'Finlandia', FR: 'Francia', DE: 'Alemania', GR: 'Grecia',
    HU: 'Hungria', IT: 'Italia', LV: 'Letonia', LT: 'Lituania',
    LU: 'Luxemburgo', MT: 'Malta', NL: 'Hulanda', PL: 'Polonia',
    PT: 'Portugal', RO: 'Rumania', SK: 'Eslovakia', SI: 'Eslovenia',
    ES: 'Spaña', SE: 'Suecia', AU: 'Australia', IN: 'India',
    JP: 'Japon', MY: 'Malasia', NZ: 'Nueva Zelanda',
    SG: 'Singapur', ZA: 'Sur Africa',
  },
};

const regionNames = new Map<PricingLocale, Intl.DisplayNames>();

export function formatPayrollCountry(code: string, locale: PricingLocale): string {
  const country = PAYROLL_COUNTRIES.find(country => country.code === code);
  if (!country) return '';
  const nativeName = nativeCountryNames[locale]?.[country.code];
  if (nativeName) return nativeName;
  let names = regionNames.get(locale);
  if (!names) {
    names = new Intl.DisplayNames(getPricingIntlLocale(locale), { type: 'region' });
    regionNames.set(locale, names);
  }
  return names.of(country.code) ?? country.name;
}
