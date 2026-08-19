// Site-navigation labels for the pricing site, lifted verbatim from the
// marketing site's `navbar` block (sundae-website src/lib/i18n.ts) so the two
// surfaces name the same destinations identically in all 22 locales. Do not
// re-translate these here - update the marketing site and re-lift, otherwise
// the same link reads differently depending on which site you are on.
import type { PricingLocale } from './locales';

export interface SiteNavLabels {
  products: string;
  solutions: string;
  resources: string;
  company: string;
}

export const siteNavLabels: Record<PricingLocale, SiteNavLabels> = {
  en: { products: 'Products', solutions: 'Solutions', resources: 'Resources', company: 'Company' },
  ar: { products: 'المنتج', solutions: 'الحلول', resources: 'الموارد', company: 'الشركة' },
  fr: { products: 'Produit', solutions: 'Solutions', resources: 'Ressources', company: 'Entreprise' },
  es: { products: 'Producto', solutions: 'Soluciones', resources: 'Recursos', company: 'Empresa' },
  de: { products: 'Produkte', solutions: 'Lösungen', resources: 'Ressourcen', company: 'Unternehmen' },
  nl: { products: 'Producten', solutions: 'Oplossingen', resources: 'Bronnen', company: 'Bedrijf' },
  pt: { products: 'Produtos', solutions: 'Soluções', resources: 'Recursos', company: 'Empresa' },
  hi: { products: 'उत्पाद', solutions: 'समाधान', resources: 'संसाधन', company: 'कंपनी' },
  ur: { products: 'مصنوعات', solutions: 'حل', resources: 'وسائل', company: 'کمپنی' },
  it: { products: 'Prodotti', solutions: 'Soluzioni', resources: 'Risorse', company: 'Azienda' },
  pl: { products: 'Produkty', solutions: 'Rozwiązania', resources: 'Zasoby', company: 'Firma' },
  tr: { products: 'Ürünler', solutions: 'Çözümler', resources: 'Kaynaklar', company: 'Şirket' },
  'zh-Hans': { products: '产品', solutions: '解决方案', resources: '资源', company: '公司' },
  ja: { products: '製品', solutions: 'ソリューション', resources: 'リソース', company: '会社' },
  ko: { products: '제품', solutions: '솔루션', resources: '리소스', company: '회사' },
  id: { products: 'Produk', solutions: 'Solusi', resources: 'Sumber daya', company: 'Perusahaan' },
  vi: { products: 'Sản phẩm', solutions: 'Giải pháp', resources: 'Tài nguyên', company: 'Công ty' },
  ro: { products: 'Produse', solutions: 'Soluții', resources: 'Resurse', company: 'Companie' },
  sv: { products: 'Produkter', solutions: 'Lösningar', resources: 'Resurser', company: 'Företag' },
  bn: { products: 'পণ্য', solutions: 'সমাধান', resources: 'রিসোর্স', company: 'কোম্পানি' },
  th: { products: 'ผลิตภัณฑ์', solutions: 'โซลูชัน', resources: 'แหล่งข้อมูล', company: 'บริษัท' },
  ms: { products: 'Produk', solutions: 'Penyelesaian', resources: 'Sumber', company: 'Syarikat' },
};

/** Marketing destinations mirrored in the pricing header and footer. */
export const siteNavLinks = [
  { key: 'products' as const, path: '/product' },
  { key: 'solutions' as const, path: '/solutions' },
  { key: 'resources' as const, path: '/docs' },
  { key: 'company' as const, path: '/about' },
];
