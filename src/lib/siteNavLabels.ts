// Shared navigation contract: the 22 marketing locales use the exact labels
// exported from sundae-website navbar + workflow-proof on 17 November 2026.
// Pricing's three additional locales retain translated chrome, with English
// marketing destinations until those marketing locales are published.
import type { PricingLocale } from './locales';

export interface SiteNavLabels {
  products: string;
  solutions: string;
  pricing: string;
  whySundae: string;
  resources: string;
  about: string;
  bookDemo: string;
  signIn: string;
  openMenu: string;
  closeMenu: string;
}

export const siteNavLabels: Record<PricingLocale, SiteNavLabels> = {
  "en": {
    "products": "Products",
    "solutions": "Solutions",
    "pricing": "Pricing",
    "whySundae": "Why Sundae",
    "resources": "Resources",
    "about": "About",
    "bookDemo": "Book a Demo",
    "signIn": "Sign In",
    "openMenu": "Open menu",
    "closeMenu": "Close menu"
  },
  "ar": {
    "products": "المنتج",
    "solutions": "الحلول",
    "pricing": "الأسعار",
    "whySundae": "لماذا Sundae",
    "resources": "الموارد",
    "about": "حول",
    "bookDemo": "احجز جلسة عمل",
    "signIn": "تسجيل الدخول",
    "openMenu": "افتح القائمة",
    "closeMenu": "أغلق القائمة"
  },
  "fr": {
    "products": "Produit",
    "solutions": "Solutions",
    "pricing": "Tarifs",
    "whySundae": "Pourquoi Sundae",
    "resources": "Ressources",
    "about": "À propos",
    "bookDemo": "Réserver une démo",
    "signIn": "Se connecter",
    "openMenu": "Ouvrir le menu",
    "closeMenu": "Fermer le menu"
  },
  "es": {
    "products": "Producto",
    "solutions": "Soluciones",
    "pricing": "Precios",
    "whySundae": "Por qué Sundae",
    "resources": "Recursos",
    "about": "Acerca de",
    "bookDemo": "Reservar demo",
    "signIn": "Iniciar sesión",
    "openMenu": "Abrir menú",
    "closeMenu": "Cerrar menú"
  },
  "de": {
    "products": "Produkte",
    "solutions": "Lösungen",
    "pricing": "Preise",
    "whySundae": "Warum Sundae",
    "resources": "Ressourcen",
    "about": "Über",
    "bookDemo": "Demo buchen",
    "signIn": "Anmelden",
    "openMenu": "Menü öffnen",
    "closeMenu": "Menü schließen"
  },
  "nl": {
    "products": "Producten",
    "solutions": "Oplossingen",
    "pricing": "Prijzen",
    "whySundae": "Waarom Sundae",
    "resources": "Hulpmiddelen",
    "about": "Over",
    "bookDemo": "Boek Demo",
    "signIn": "Inloggen",
    "openMenu": "Menu openen",
    "closeMenu": "Menu sluiten"
  },
  "pt": {
    "products": "Produtos",
    "solutions": "Soluções",
    "pricing": "Preços",
    "whySundae": "Por que Sundae",
    "resources": "Recursos",
    "about": "Sobre",
    "bookDemo": "Agendar Demonstração",
    "signIn": "Entrar",
    "openMenu": "Abrir menu",
    "closeMenu": "Fechar menu"
  },
  "hi": {
    "products": "उत्पाद",
    "solutions": "समाधान",
    "pricing": "मूल्य निर्धारण",
    "whySundae": "Sundae क्यों",
    "resources": "संसाधन",
    "about": "के बारे में",
    "bookDemo": "डेमो बुक करें",
    "signIn": "साइन इन करें",
    "openMenu": "मेनू खोलें",
    "closeMenu": "मेनू बंद करें"
  },
  "ur": {
    "products": "مصنوعات",
    "solutions": "حلول",
    "pricing": "قیمتیں",
    "whySundae": "Sundae کیوں",
    "resources": "وسائل",
    "about": "کے بارے میں",
    "bookDemo": "ڈیمو بک کریں",
    "signIn": "سائن ان کریں",
    "openMenu": "مینیو کھولیں",
    "closeMenu": "مینیو بند کریں"
  },
  "it": {
    "products": "Prodotti",
    "solutions": "Soluzioni",
    "pricing": "Prezzi",
    "whySundae": "Perché Sundae",
    "resources": "Risorse",
    "about": "Informazioni",
    "bookDemo": "Prenota una Demo",
    "signIn": "Accedi",
    "openMenu": "Apri menu",
    "closeMenu": "Chiudi menu"
  },
  "pl": {
    "products": "Produkty",
    "solutions": "Rozwiązania",
    "pricing": "Cennik",
    "whySundae": "Dlaczego Sundae",
    "resources": "Zasoby",
    "about": "O nas",
    "bookDemo": "Umów demo",
    "signIn": "Zaloguj się",
    "openMenu": "Otwórz menu",
    "closeMenu": "Zamknij menu"
  },
  "tr": {
    "products": "Ürünler",
    "solutions": "Çözümler",
    "pricing": "Fiyatlandırma",
    "whySundae": "Neden Sundae",
    "resources": "Kaynaklar",
    "about": "Hakkında",
    "bookDemo": "Demo Randevusu Al",
    "signIn": "Giriş Yap",
    "openMenu": "Menüyü Aç",
    "closeMenu": "Menüyü Kapat"
  },
  "zh-Hans": {
    "products": "产品",
    "solutions": "解决方案",
    "pricing": "定价",
    "whySundae": "为什么选择 Sundae",
    "resources": "资源",
    "about": "关于",
    "bookDemo": "预约演示",
    "signIn": "登录",
    "openMenu": "打开菜单",
    "closeMenu": "关闭菜单"
  },
  "ja": {
    "products": "製品",
    "solutions": "ソリューション",
    "pricing": "価格",
    "whySundae": "Sundae が選ばれる理由",
    "resources": "リソース",
    "about": "について",
    "bookDemo": "デモを予約",
    "signIn": "サインイン",
    "openMenu": "メニューを開く",
    "closeMenu": "メニューを閉じる"
  },
  "ko": {
    "products": "제품",
    "solutions": "솔루션",
    "pricing": "가격",
    "whySundae": "Sundae를 선택하는 이유",
    "resources": "리소스",
    "about": "정보",
    "bookDemo": "데모 예약",
    "signIn": "로그인",
    "openMenu": "메뉴 열기",
    "closeMenu": "메뉴 닫기"
  },
  "id": {
    "products": "Produk",
    "solutions": "Solusi",
    "pricing": "Harga",
    "whySundae": "Mengapa Sundae",
    "resources": "Sumber Daya",
    "about": "Tentang",
    "bookDemo": "Pesan Demo",
    "signIn": "Masuk",
    "openMenu": "Buka menu",
    "closeMenu": "Tutup menu"
  },
  "vi": {
    "products": "Sản phẩm",
    "solutions": "Giải pháp",
    "pricing": "Giá cả",
    "whySundae": "Vì sao chọn Sundae",
    "resources": "Tài nguyên",
    "about": "Giới thiệu",
    "bookDemo": "Đặt lịch demo",
    "signIn": "Đăng nhập",
    "openMenu": "Mở menu",
    "closeMenu": "Đóng menu"
  },
  "ro": {
    "products": "Produse",
    "solutions": "Soluții",
    "pricing": "Prețuri",
    "whySundae": "De ce Sundae",
    "resources": "Resurse",
    "about": "Despre",
    "bookDemo": "Programează o demonstrație",
    "signIn": "Autentificare",
    "openMenu": "Deschide meniul",
    "closeMenu": "Închide meniul"
  },
  "sv": {
    "products": "Produkter",
    "solutions": "Lösningar",
    "pricing": "Prissättning",
    "whySundae": "Varför Sundae",
    "resources": "Resurser",
    "about": "Om",
    "bookDemo": "Boka demo",
    "signIn": "Logga in",
    "openMenu": "Öppna meny",
    "closeMenu": "Stäng meny"
  },
  "bn": {
    "products": "পণ্য",
    "solutions": "সমাধান",
    "pricing": "মূল্য নির্ধারণ",
    "whySundae": "কেন Sundae",
    "resources": "সম্পদ",
    "about": "সম্পর্কিত",
    "bookDemo": "ডেমো বুক করুন",
    "signIn": "সাইন ইন করুন",
    "openMenu": "মেনু খুলুন",
    "closeMenu": "মেনু বন্ধ করুন"
  },
  "th": {
    "products": "ผลิตภัณฑ์",
    "solutions": "โซลูชัน",
    "pricing": "ราคา",
    "whySundae": "ทำไมต้อง Sundae",
    "resources": "ทรัพยากร",
    "about": "เกี่ยวกับ",
    "bookDemo": "จองการสาธิต",
    "signIn": "เข้าสู่ระบบ",
    "openMenu": "เปิดเมนู",
    "closeMenu": "ปิดเมนู"
  },
  "ms": {
    "products": "Produk",
    "solutions": "Penyelesaian",
    "pricing": "Harga",
    "whySundae": "Mengapa Sundae",
    "resources": "Sumber",
    "about": "Tentang",
    "bookDemo": "Tempah Demo",
    "signIn": "Log Masuk",
    "openMenu": "Buka menu",
    "closeMenu": "Tutup menu"
  },
  "az": {
    "products": "Məhsullar",
    "solutions": "Həllər",
    "pricing": "Qiymətlər",
    "whySundae": "Niyə Sundae",
    "resources": "Resurslar",
    "about": "Haqqımızda",
    "bookDemo": "Demo sifariş edin",
    "signIn": "Daxil olun",
    "openMenu": "Menyunu açın",
    "closeMenu": "Menyunu bağlayın"
  },
  "ru": {
    "products": "Продукты",
    "solutions": "Решения",
    "pricing": "Цены",
    "whySundae": "Почему Sundae",
    "resources": "Ресурсы",
    "about": "О компании",
    "bookDemo": "Заказать демо",
    "signIn": "Войти",
    "openMenu": "Открыть меню",
    "closeMenu": "Закрыть меню"
  },
  "pap": {
    "products": "Produktonan",
    "solutions": "Solushonnan",
    "pricing": "Preisnan",
    "whySundae": "Dikon Sundae",
    "resources": "Rekursonan",
    "about": "Tokante nos",
    "bookDemo": "Reserva un demo",
    "signIn": "Drenta",
    "openMenu": "Habri menu",
    "closeMenu": "Sera menu"
  }
};

/** Same names, order and destinations as the main site's global navigation. */
export const siteNavLinks = [
  { key: 'products' as const, path: '/product' },
  { key: 'solutions' as const, path: '/solutions' },
  { key: 'pricing' as const, path: '/', pricing: true },
  { key: 'whySundae' as const, path: '/why-sundae' },
  { key: 'resources' as const, path: '/resources' },
];
