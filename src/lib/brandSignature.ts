import type { PricingLocale } from './locales';

// Shared website locales reuse the canonical brand-signature.json clauses
// verbatim. Azerbaijani, Russian and Papiamento are pricing-only locales.
export const brandSignature: Record<PricingLocale, string> = {
  "en": "Connected Operations. Informed Decisions. Recovered Profit.",
  "ar": "عمليات مترابطة. قرارات مدروسة. أرباح مستردة.",
  "fr": "Des opérations connectées. Des décisions éclairées. Des profits récupérés.",
  "es": "Operaciones conectadas. Decisiones informadas. Beneficios recuperados.",
  "de": "Vernetzte Abläufe. Fundierte Entscheidungen. Zurückgewonnener Gewinn.",
  "nl": "Verbonden processen. Weloverwogen beslissingen. Teruggewonnen winst.",
  "pt": "Operações conectadas. Decisões informadas. Lucro recuperado.",
  "hi": "जुड़े हुए संचालन। जानकारी पर आधारित निर्णय। वापस पाया मुनाफ़ा।",
  "ur": "مربوط آپریشنز۔ باخبر فیصلے۔ واپس حاصل شدہ منافع۔",
  "it": "Operazioni connesse. Decisioni informate. Profitti recuperati.",
  "pl": "Połączone operacje. Świadome decyzje. Odzyskany zysk.",
  "tr": "Bağlantılı operasyonlar. Bilgiye dayalı kararlar. Geri kazanılan kâr.",
  "zh-Hans": "运营互联。 决策有据。 挽回利润。",
  "ja": "つながる現場。 根拠ある判断。 取り戻す利益。",
  "ko": "연결된 운영. 근거 있는 의사결정. 되찾은 이익.",
  "id": "Operasional terhubung. Keputusan berbasis informasi. Laba yang dipulihkan.",
  "vi": "Vận hành kết nối. Quyết định có cơ sở. Lợi nhuận được khôi phục.",
  "ro": "Operațiuni conectate. Decizii informate. Profit recuperat.",
  "sv": "Sammanlänkad drift. Välgrundade beslut. Återvunnen vinst.",
  "bn": "সংযুক্ত কার্যক্রম। তথ্যভিত্তিক সিদ্ধান্ত। পুনরুদ্ধার করা মুনাফা।",
  "th": "การดำเนินงานที่เชื่อมถึงกัน การตัดสินใจบนข้อมูล กำไรที่กู้คืนได้",
  "ms": "Operasi yang terhubung. Keputusan berasaskan maklumat. Keuntungan yang dipulihkan.",
  "az": "Əlaqəli əməliyyatlar. Məlumatlı qərarlar. Geri qazanılan mənfəət.",
  "ru": "Связанные операции. Обоснованные решения. Возвращённая прибыль.",
  "pap": "Operashonnan konektá. Desishonnan informá. Ganashi rekuperá."
};
