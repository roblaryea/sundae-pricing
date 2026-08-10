// Pricing FAQ component with category-specific questions

import { motion } from 'framer-motion';
import { HelpCircle, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { LEGAL, getMarketingUrl } from '../../config/legal';
import { useLocale } from '../../contexts/LocaleContext';
import { crossIntelligence } from '../../data/pricing';
import { generatedAuxiliaryLocalePacks } from '../../lib/generatedAuxiliaryLocalePacks';

const CI_PRO_MONTHLY = crossIntelligence.pro.monthlyFee; // 199
const CI_PRO_PER_LOC = crossIntelligence.pro.perLocationPrice; // 19

interface FAQItem {
  question: string;
  answer: string;
}

// The Report layer was retired with price book v1.7 — there is no 'report'
// FAQ category, because there is no Report product to answer questions about.
type FAQCategory = 'core' | 'watchtower' | 'crew' | 'general';

// Hand-written locale packs, rewritten for price book v1.7.
//
// The previous packs were written for v5.1 and stated retired facts that the
// retired-NAME filter below could not catch: modules sold a la carte with
// per-location pricing, a per-module setup fee, "volume and billing discounts
// do NOT combine — you get the larger", the 30-99/100-200 volume ladder, and a
// 30-location Enterprise threshold. All of that is wrong under v1.7, so it was
// rewritten rather than left to a name filter that would never fire on it.
const localizedFaqsByLocale: Partial<Record<'ar' | 'fr' | 'es', Partial<Record<FAQCategory, FAQItem[]>>>> = {
  ar: {
    core: [
      {
        question: 'ما هي باقات Core الأربع؟',
        answer: 'Core Foundation و Core Margin و Core Growth و Core Performance. كل باقة تتضمن وحدات Core المجالية الإحدى عشرة كاملةً، ومحرك الترابط Cross-Intelligence، و Sundae Intelligence. تختلف الباقات في النطاق وفي حجم محفظة أرصدة الذكاء الاصطناعي الشهرية، والمحاكي يعرض دائماً الأرقام المنشورة الحالية.',
      },
      {
        question: 'كيف يعمل التسعير حسب عدد المواقع؟',
        answer: 'يُسعَّر موقعك الأول بسعر الباقة الأساسي (سعر الارتكاز). وكل موقع بعده يُسعَّر حسب شريحته، والشرائح حدّية: الانتقال إلى شريحة أرخص لا يعيد تسعير المواقع التي لديك بالفعل. مثال: 5 مواقع على Core Foundation = 1,195 دولاراً + 4 × 175 دولاراً = 1,895 دولاراً شهرياً، أي بمتوسط 379 دولاراً للموقع.',
      },
      {
        question: 'كم عدد المواقع المشمولة في السعر الأساسي؟',
        answer: 'لا شيء. لا يوجد أي حد مجاني من المواقع. سعر الارتكاز يغطي موقعك الأول فقط، وكل موقع إضافي يُحتسب بسعر شريحته. أي عرض سعر يقول "السعر الأساسي يشمل 3 مواقع" هو عرض قديم.',
      },
      {
        question: 'هل يمكنني شراء الوحدات المجالية منفردة؟',
        answer: 'لا. العمالة والمخزون والمشتريات والتسويق والحجوزات والربحية وضمان الإيرادات والتوصيل وتجربة الضيف و Pulse و Guest CRM هي مكوّنات داخل كل باقة Core. ليس لها سعر مستقل ولا تُضاف كإضافات.',
      },
      {
        question: 'ما هي Foresight & Action؟',
        answer: 'طبقة التخطيط التنبؤي والتنفيذ الاختيارية: التنبؤ ونمذجة السيناريوهات وتحليل الحساسية وإعادة تشغيل القرارات والإجراءات باعتماد بشري. تُسعَّر مثل باقة Core — 495 دولاراً لموقعك الأول، ثم شرائح حدّية لما بعده.',
      },
      {
        question: 'ما هو محرك Cross-Intelligence؟',
        answer: `يكشف Cross-Intelligence الارتباطات الخفية بين مصادر بياناتك — مثل تأثير الطقس على جدولة العمالة وهدر المخزون معاً. المحرك الأساسي مشمول في كل باقة Core بلا تكلفة إضافية. أما Cross-Intelligence Pro (${CI_PRO_MONTHLY} دولاراً شهرياً + ${CI_PRO_PER_LOC} دولاراً للموقع) فيضيف مصفوفة الترابط الكاملة وإسناد الإيرادات ورادار كفاءة الإنفاق ومراقبة الحملات وكشف الإزاحة.`,
      },
      {
        question: 'كم تبلغ تكلفة التنفيذ؟',
        answer: 'تُحتسب تكلفة التنفيذ مرة واحدة فقط، بأعلى فئة ضمن اختيارك — ولا تُجمع أبداً لكل وحدة. الفئات هي: 0 دولار خدمة ذاتية، و1,500 دولار للفئة A، و2,500 دولار للفئة B، و7,500 دولار للفئة C، وابتداءً من 12,500 دولار للفئة D.',
      },
      {
        question: 'كيف تعمل الخصومات؟',
        answer: 'خصومات الحجم هي 0% تحت 50 موقعاً، و2.5% من 50 إلى 99، و5% من 100 إلى 199، و7% من 200 إلى 249. وخصومات دورة الفوترة هي 10% للسنوي و15% لسنتين. الخصمان يُجمعان معاً بحد أقصى 15% إجمالاً. ومن 250 موقعاً لا توجد شريحة ذاتية الخدمة، ويصبح التسعير بعرض سعر مخصص.',
      },
      {
        question: 'ما مدة العقد؟',
        answer: 'الاشتراك شهري افتراضياً ويمكن الإلغاء في أي وقت دون غرامة. الدفع السنوي المسبق يوفر 10%، والدفع لسنتين يوفر 15%. أما عقود Enterprise فلها شروط مخصصة.',
      },
    ],
    watchtower: [
      {
        question: 'ما هو Sundae Watchtower؟',
        answer: 'Watchtower هي مجموعة الذكاء السوقي في Sundae التي تراقب المنافسين والفعاليات المحلية واتجاهات القطاع. توفر تنبيهات عملية تساعدك على تعديل التسعير والتوظيف والتسويق بشكل استباقي.',
      },
      {
        question: 'ما هي وحدات Watchtower الثلاث؟',
        answer: 'ذكاء المنافسين يتتبع أسعار المنافسين وقوائمهم ومراجعاتهم. ذكاء الفعاليات يراقب الفعاليات المحلية التي تؤثر في الحركة. ذكاء الاتجاهات يكشف تحولات الطلب في السوق ولدى المستهلك. وكل وحدة تتبع نموذج تسعير Watchtower المنشور داخل المحاكي.',
      },
      {
        question: 'ما هي حزمة Watchtower؟',
        answer: 'حزمة Watchtower تتضمن الوحدات الثلاث كلها بسعر مخفّض للمشغلين الذين يريدون رؤية سوقية كاملة. تسعير الحزمة في المحاكي يعكس النموذج المنشور الحالي.',
      },
      {
        question: 'هل يتطلب Watchtower اشتراك Core؟',
        answer: 'نعم. Watchtower متاح حصرياً لمشتركي Core — أي باقة Core (Foundation أو Margin أو Growth أو Performance) أو Enterprise.',
      },
      {
        question: 'كيف يتدرج تسعير Watchtower مع عدد المواقع؟',
        answer: 'يحتفظ Watchtower بنموذج تسعيره المنشور الخاص: سعر أساسي للوحدة زائد مكوّن لكل موقع. وهو ليس باقة Core ولا يُسعَّر بالشرائح الحدّية الخاصة بـ Core. يعرض المحاكي التسعير المنشور مباشرةً حسب تركيبة Watchtower التي تختارها.',
      },
      {
        question: 'هل يتوفر تسعير Enterprise لـ Watchtower؟',
        answer: 'نعم. يحصل عملاء Enterprise على تسعير مخصص لـ Watchtower، بما في ذلك خيارات السعر الثابت. تسعير Enterprise إلزامي ابتداءً من 250 موقعاً، ومتاح قبل ذلك عند الطلب. تواصل مع المبيعات لعرض مخصص.',
      },
      {
        question: 'هل يمكنني إضافة وحدات Watchtower منفردة لاحقاً؟',
        answer: 'نعم. يمكنك البدء بوحدة واحدة وإضافة المزيد في أي وقت. وإذا فعّلت الوحدات الثلاث لاحقاً، يمكنك التحول إلى تسعير الحزمة للاستفادة من الخصم. تسري التغييرات فوراً.',
      },
    ],
    general: [
      {
        question: 'كم تبلغ تكلفة التنفيذ؟',
        answer: 'التنفيذ رسم لمرة واحدة يُحتسب بأعلى فئة ضمن اختيارك: 0 دولار خدمة ذاتية، أو 1,500 دولار للفئة A، أو 2,500 دولار للفئة B، أو 7,500 دولار للفئة C، أو ابتداءً من 12,500 دولار للفئة D. ولا يُجمع أبداً لكل وحدة.',
      },
      {
        question: 'ما مدة العقد؟',
        answer: 'الاشتراك شهري افتراضياً ويمكن الإلغاء في أي وقت دون غرامة. الدفع السنوي المسبق يوفر 10%، والدفع لسنتين يوفر 15%. أما عقود Enterprise فلها شروط مخصصة.',
      },
      {
        question: 'هل يمكنني الترقية أو التخفيض لاحقاً؟',
        answer: 'نعم. الترقية تسري فوراً. أما التخفيض فيسري في دورة الفوترة التالية.',
      },
      {
        question: 'كيف تعمل الخصومات؟',
        answer: 'خصومات الحجم هي 0% تحت 50 موقعاً، و2.5% من 50 إلى 99، و5% من 100 إلى 199، و7% من 200 إلى 249. وخصومات دورة الفوترة هي 10% سنوي و15% لسنتين. الخصمان يُجمعان معاً بحد أقصى 15% إجمالاً. ومن 250 موقعاً يكون التسعير بعرض سعر مخصص.',
      },
      {
        question: 'هل أرصدة الذكاء الاصطناعي مشتركة بين المواقع؟',
        answer: 'نعم. أرصدة الذكاء الاصطناعي مجمّعة على مستوى المؤسسة ويمكن استخدامها عبر جميع المواقع. تُرحّل الأرصدة غير المستخدمة بنسبة 25% من الأرصدة الأساسية لمدة شهر واحد. أما أرصدة التعبئة المشتراة فلا تنتهي صلاحيتها.',
      },
      {
        question: 'متى ينطبق تسعير Enterprise؟',
        answer: 'تسعير Enterprise إلزامي ابتداءً من 250 موقعاً، حيث تنتهي شريحة الحجم ذاتية الخدمة. وتحت هذا الحد يتوفر عند الطلب إذا كنت تحتاج تكاملات مخصصة أو SSO/SAML أو SLAs مخصصة أو مراجعة أمنية وامتثالية.',
      },
    ],
  },
  fr: {
    core: [
      {
        question: 'Quels sont les quatre forfaits Core ?',
        answer: "Core Foundation, Core Margin, Core Growth et Core Performance. Chaque forfait inclut les onze modules de domaine Core, le moteur de corrélation Cross-Intelligence et Sundae Intelligence. Ils diffèrent par leur périmètre et par la taille du portefeuille mensuel de crédits IA ; le configurateur affiche toujours les chiffres publiés en vigueur.",
      },
      {
        question: 'Comment fonctionne la tarification par site ?',
        answer: "Votre premier site est facturé au prix d'ancrage du forfait. Chaque site suivant est facturé par tranche, et les tranches sont MARGINALES : passer dans une tranche moins chère ne retarife pas les sites que vous avez déjà. Exemple : 5 sites en Core Foundation coûtent 1 195 $ + 4 × 175 $ = 1 895 $/mois, soit une moyenne de 379 $ par site.",
      },
      {
        question: "Combien de sites sont compris dans le prix de base ?",
        answer: "Aucun. Il n'y a pas de quota de sites. Le prix d'ancrage couvre votre premier site, et chaque site supplémentaire est facturé au tarif de sa tranche. Tout devis indiquant « la base couvre 3 sites » est obsolète.",
      },
      {
        question: 'Puis-je acheter les modules de domaine séparément ?',
        answer: "Non. Travail, Stocks, Achats, Marketing, Réservations, Rentabilité, Garantie de revenu, Livraison, Expérience client, Pulse et Guest CRM sont des composants de chaque forfait Core. Ils n'ont pas de prix autonome et ne s'ajoutent pas en option.",
      },
      {
        question: "Qu'est-ce que Foresight & Action ?",
        answer: "La couche optionnelle de planification prédictive et d'actuation : prévisions, modélisation de scénarios, analyse de sensibilité, rejeu de décisions et actions validées par un humain. Elle est tarifée comme un forfait Core — 495 $ pour votre premier site, puis des tranches marginales pour les suivants.",
      },
      {
        question: "Qu'est-ce que le moteur Cross-Intelligence ?",
        answer: `Cross-Intelligence révèle les corrélations cachées entre vos sources de données — par exemple la façon dont la météo agit à la fois sur la planification du personnel et sur le gaspillage des stocks. Le moteur de base est inclus dans chaque forfait Core, sans supplément. Cross-Intelligence Pro (${CI_PRO_MONTHLY} $/mois + ${CI_PRO_PER_LOC} $/site) ajoute la matrice de corrélation complète, l'attribution des revenus, le radar d'efficacité des dépenses, le suivi des campagnes et la détection de cannibalisation.`,
      },
      {
        question: "Combien coûte l'implémentation ?",
        answer: "L'implémentation est facturée UNE SEULE FOIS, à la classe la plus élevée de votre sélection — jamais additionnée par module. Les classes sont : 0 $ en libre-service, 1 500 $ classe A, 2 500 $ classe B, 7 500 $ classe C et à partir de 12 500 $ classe D.",
      },
      {
        question: 'Comment fonctionnent les remises ?',
        answer: "Les remises volume sont de 0 % en dessous de 50 sites, 2,5 % de 50 à 99, 5 % de 100 à 199 et 7 % de 200 à 249. Les remises de cycle de facturation sont de 10 % en annuel et 15 % sur deux ans. Les deux SE CUMULENT, dans la limite de 15 % au total. À partir de 250 sites, il n'existe plus de palier en libre-service et le prix est établi sur devis.",
      },
      {
        question: 'Quelle est la durée du contrat ?',
        answer: "L'abonnement est mensuel par défaut et annulable à tout moment sans pénalité. Le prépaiement annuel offre 10 % de remise et le prépaiement sur deux ans 15 %. Les contrats Enterprise ont des conditions spécifiques.",
      },
    ],
    watchtower: [
      {
        question: "Qu'est-ce que Sundae Watchtower ?",
        answer: "Watchtower est la suite d'intelligence de marché de Sundae qui surveille votre paysage concurrentiel, les événements locaux et les tendances du secteur. Elle fournit des alertes actionnables pour ajuster prix, staffing et marketing de façon proactive.",
      },
      {
        question: 'Quels sont les trois modules Watchtower ?',
        answer: "Competitive Intelligence suit les prix, menus et avis des concurrents. Events Intelligence surveille les événements locaux qui influencent la fréquentation. Trends Intelligence met en avant les évolutions de la demande du marché et des consommateurs. Chaque module suit le modèle de prix Watchtower publié dans le configurateur.",
      },
      {
        question: "Qu'est-ce que le Watchtower Bundle ?",
        answer: "Le Watchtower Bundle regroupe les trois modules Watchtower dans un package à tarif réduit pour les opérateurs qui veulent une vision complète du marché. Le prix du bundle dans le configurateur reflète le modèle publié actuel.",
      },
      {
        question: 'Watchtower nécessite-t-il un abonnement Core ?',
        answer: "Oui. Watchtower est réservé aux abonnés Core — n'importe quel forfait Core (Foundation, Margin, Growth ou Performance) ou Enterprise.",
      },
      {
        question: 'Comment le prix Watchtower évolue-t-il selon les sites ?',
        answer: "Watchtower conserve son propre modèle de prix publié : un prix de base par module plus une composante par site. Ce n'est pas un forfait Core et il n'est pas tarifé avec les tranches marginales de Core. Le configurateur affiche le prix publié en direct pour la combinaison Watchtower choisie.",
      },
      {
        question: "Le prix Enterprise est-il disponible pour Watchtower ?",
        answer: "Oui. Les clients Enterprise bénéficient d'un prix Watchtower personnalisé, y compris des options à tarif fixe. La tarification Enterprise est obligatoire à partir de 250 sites et disponible plus tôt sur demande. Contactez les ventes pour un devis sur mesure.",
      },
      {
        question: 'Puis-je ajouter des modules Watchtower individuels plus tard ?',
        answer: "Oui. Vous pouvez commencer avec un module et en ajouter d'autres à tout moment. Si vous activez ensuite les trois, vous pouvez passer au prix Bundle pour profiter de la remise. Les changements s'appliquent immédiatement.",
      },
    ],
    general: [
      {
        question: "Combien coûte l'implémentation ?",
        answer: "L'implémentation est un frais unique, facturé une seule fois à la classe la plus élevée de votre sélection : 0 $ en libre-service, 1 500 $ classe A, 2 500 $ classe B, 7 500 $ classe C ou à partir de 12 500 $ classe D. Elle n'est jamais additionnée par module.",
      },
      {
        question: 'Quelle est la durée du contrat ?',
        answer: "L'abonnement est mensuel par défaut et annulable à tout moment sans pénalité. Le prépaiement annuel offre 10 % de remise et le prépaiement sur deux ans 15 %. Les contrats Enterprise ont des conditions spécifiques.",
      },
      {
        question: 'Puis-je monter ou descendre de gamme ?',
        answer: "Oui. Les montées en gamme sont immédiates. Les baisses de gamme prennent effet au cycle de facturation suivant.",
      },
      {
        question: 'Comment fonctionnent les remises ?',
        answer: "Les remises volume sont de 0 % en dessous de 50 sites, 2,5 % de 50 à 99, 5 % de 100 à 199 et 7 % de 200 à 249. Les remises de cycle de facturation sont de 10 % en annuel et 15 % sur deux ans. Les deux se cumulent, dans la limite de 15 % au total. À partir de 250 sites, le prix est établi sur devis.",
      },
      {
        question: 'Les crédits IA sont-ils partagés entre les sites ?',
        answer: "Oui. Les crédits IA sont mutualisés au niveau de l'organisation et utilisables sur tous les sites. Les crédits non utilisés se reportent à hauteur de 25 % des crédits de base pendant un mois. Les packs de recharge achetés n'expirent jamais.",
      },
      {
        question: "Quand la tarification Enterprise s'applique-t-elle ?",
        answer: "La tarification Enterprise est obligatoire à partir de 250 sites, là où s'arrête le palier volume en libre-service. En dessous, elle est disponible sur demande si vous avez besoin d'intégrations personnalisées, de SSO/SAML, de SLA spécifiques ou d'une revue de sécurité et de conformité.",
      },
    ],
  },
  es: {
    core: [
      {
        question: '¿Cuáles son los cuatro paquetes Core?',
        answer: 'Core Foundation, Core Margin, Core Growth y Core Performance. Cada paquete incluye los once módulos de dominio de Core, el motor de correlación Cross-Intelligence y Sundae Intelligence. Se diferencian en el alcance y en el tamaño de la cartera mensual de créditos de IA; el configurador siempre muestra las cifras publicadas vigentes.',
      },
      {
        question: '¿Cómo funciona el precio por local?',
        answer: 'Tu primer local se cobra al precio ancla del paquete. Cada local posterior se cobra por tramo, y los tramos son MARGINALES: entrar en un tramo más barato no vuelve a tarificar los locales que ya tienes. Ejemplo: 5 locales en Core Foundation cuestan 1.195 $ + 4 × 175 $ = 1.895 $/mes, una media de 379 $ por local.',
      },
      {
        question: '¿Cuántos locales incluye el precio base?',
        answer: 'Ninguno. No hay cupo de locales. El precio ancla cubre tu primer local y cada local adicional se cobra a la tarifa de su tramo. Cualquier presupuesto que diga «la base cubre 3 locales» está desactualizado.',
      },
      {
        question: '¿Puedo comprar los módulos de dominio por separado?',
        answer: 'No. Personal, Inventario, Compras, Marketing, Reservas, Rentabilidad, Revenue Assurance, Delivery, Experiencia del cliente, Pulse y Guest CRM son componentes de cada paquete Core. No tienen precio independiente ni se añaden como extras.',
      },
      {
        question: '¿Qué es Foresight & Action?',
        answer: 'La capa opcional de planificación predictiva y actuación: previsión, modelado de escenarios, análisis de sensibilidad, repetición de decisiones y acciones aprobadas por una persona. Se tarifica como un paquete Core: 495 $ para tu primer local y luego tramos marginales para el resto.',
      },
      {
        question: '¿Qué es el motor Cross-Intelligence?',
        answer: `Cross-Intelligence revela correlaciones ocultas entre tus fuentes de datos, por ejemplo cómo el clima mueve a la vez la planificación de personal y la merma de inventario. El motor base va incluido en cada paquete Core sin coste adicional. Cross-Intelligence Pro (${CI_PRO_MONTHLY} $/mes + ${CI_PRO_PER_LOC} $/local) añade la matriz de correlación completa, la atribución de ingresos, el radar de eficiencia del gasto, el seguimiento de campañas y la detección de canibalización.`,
      },
      {
        question: '¿Cuánto cuesta la implementación?',
        answer: 'La implementación se cobra UNA SOLA VEZ, a la clase más alta de tu selección, y nunca se suma por módulo. Las clases son: 0 $ autoservicio, 1.500 $ clase A, 2.500 $ clase B, 7.500 $ clase C y desde 12.500 $ clase D.',
      },
      {
        question: '¿Cómo funcionan los descuentos?',
        answer: 'Los descuentos por volumen son del 0 % por debajo de 50 locales, 2,5 % de 50 a 99, 5 % de 100 a 199 y 7 % de 200 a 249. Los descuentos por ciclo de facturación son del 10 % anual y del 15 % a dos años. Ambos SE COMBINAN, con un tope del 15 % en total. A partir de 250 locales no hay tramo de autoservicio y el precio se presupuesta.',
      },
      {
        question: '¿Cuál es el plazo del contrato?',
        answer: 'La suscripción es mensual por defecto y se puede cancelar en cualquier momento sin penalización. El prepago anual ahorra un 10 % y el de dos años un 15 %. Los contratos Enterprise tienen condiciones personalizadas.',
      },
    ],
    watchtower: [
      {
        question: '¿Qué es Sundae Watchtower?',
        answer: 'Watchtower es la suite de inteligencia de mercado de Sundae que vigila tu panorama competitivo, los eventos locales y las tendencias del sector. Ofrece alertas accionables para ajustar precios, personal y marketing de forma proactiva.',
      },
      {
        question: '¿Cuáles son los tres módulos de Watchtower?',
        answer: 'Competitive Intelligence sigue precios, cartas y reseñas de la competencia. Events Intelligence vigila los eventos locales que afectan al tráfico. Trends Intelligence destaca los cambios de demanda del mercado y del consumidor. Cada módulo sigue el modelo de precios de Watchtower publicado en el configurador.',
      },
      {
        question: '¿Qué es el Watchtower Bundle?',
        answer: 'El Watchtower Bundle reúne los tres módulos de Watchtower en un paquete con precio reducido para operadores que quieren visibilidad de mercado completa. El precio del bundle en el configurador refleja el modelo publicado actual.',
      },
      {
        question: '¿Watchtower requiere una suscripción Core?',
        answer: 'Sí. Watchtower está disponible exclusivamente para suscriptores de Core: cualquier paquete Core (Foundation, Margin, Growth o Performance) o Enterprise.',
      },
      {
        question: '¿Cómo escala el precio de Watchtower con los locales?',
        answer: 'Watchtower mantiene su propio modelo de precios publicado: un precio base por módulo más un componente por local. No es un paquete Core y no se tarifica con los tramos marginales de Core. El configurador muestra el precio publicado en vivo para la combinación de Watchtower que elijas.',
      },
      {
        question: '¿Hay precio Enterprise para Watchtower?',
        answer: 'Sí. Los clientes Enterprise reciben precios personalizados de Watchtower, incluidas opciones de tarifa plana. El precio Enterprise es obligatorio a partir de 250 locales y está disponible antes bajo petición. Contacta con ventas para una propuesta a medida.',
      },
      {
        question: '¿Puedo añadir módulos de Watchtower individuales más adelante?',
        answer: 'Sí. Puedes empezar con un módulo y añadir más cuando quieras. Si más adelante activas los tres, puedes pasar al precio del Bundle para aprovechar el descuento. Los cambios se aplican de inmediato.',
      },
    ],
    general: [
      {
        question: '¿Cuánto cuesta la implementación?',
        answer: 'La implementación es un cargo único que se factura una sola vez a la clase más alta de tu selección: 0 $ autoservicio, 1.500 $ clase A, 2.500 $ clase B, 7.500 $ clase C o desde 12.500 $ clase D. Nunca se suma por módulo.',
      },
      {
        question: '¿Cuál es el plazo del contrato?',
        answer: 'La suscripción es mensual por defecto y se puede cancelar en cualquier momento sin penalización. El prepago anual ahorra un 10 % y el de dos años un 15 %. Los contratos Enterprise tienen condiciones personalizadas.',
      },
      {
        question: '¿Puedo subir o bajar de plan?',
        answer: 'Sí. Las mejoras se aplican de inmediato. Las bajadas entran en vigor en el siguiente ciclo de facturación.',
      },
      {
        question: '¿Cómo funcionan los descuentos?',
        answer: 'Los descuentos por volumen son del 0 % por debajo de 50 locales, 2,5 % de 50 a 99, 5 % de 100 a 199 y 7 % de 200 a 249. Los descuentos por ciclo de facturación son del 10 % anual y del 15 % a dos años. Ambos se combinan, con un tope del 15 % en total. A partir de 250 locales el precio se presupuesta.',
      },
      {
        question: '¿Los créditos de IA se comparten entre locales?',
        answer: 'Sí. Los créditos de IA se agrupan a nivel de organización y se pueden usar en todos los locales. Los créditos no usados se arrastran al 25 % de los créditos base durante un mes. Los paquetes de recarga comprados nunca caducan.',
      },
      {
        question: '¿Cuándo aplica el precio Enterprise?',
        answer: 'El precio Enterprise es obligatorio a partir de 250 locales, donde termina la escala de volumen de autoservicio. Por debajo está disponible bajo petición si necesitas integraciones personalizadas, SSO/SAML, SLAs específicos o una revisión de seguridad y cumplimiento.',
      },
    ],
  },
};

const coreFAQ: FAQItem[] = [
  {
    question: 'What are the four Core packages?',
    answer: 'Core Foundation, Core Margin, Core Growth, and Core Performance. Every package includes all eleven Core domain modules, the Cross-Intelligence correlation engine, and Sundae Intelligence. They differ in scope and in the size of the monthly AI credit wallet; the configurator always shows the current published figures.'
  },
  {
    question: 'How does per-location pricing work?',
    answer: 'Your first location is priced at the package anchor. Every location after that is priced by band, and the bands are MARGINAL — moving into a cheaper band does not reprice the locations you already have. For example, 5 Core Foundation locations cost $1,195 + 4 x $175 = $1,895/mo, an average of $379 per location.'
  },
  {
    question: 'How many locations are included in the base price?',
    answer: 'None. There is no location allowance. The anchor price covers your first location, and each additional location is charged at its band rate. Any quote that says "base covers 3 locations" is out of date.'
  },
  {
    question: 'Can I buy the domain modules individually?',
    answer: 'No. Labor, Inventory, Purchasing, Marketing, Reservations, Profit, Revenue Assurance, Delivery, Guest Experience, Pulse and Guest CRM are components of every Core package. They have no standalone price and nothing to add on.'
  },
  {
    question: 'What is Foresight & Action?',
    answer: 'The optional predictive-planning and actuation layer: forecasting, scenario modelling, sensitivity analysis, decision replay, and approve-in-the-loop actions. It is priced like a Core package — $495 for your first location, then marginal bands for the rest.'
  },
  {
    question: 'What is the Cross-Intelligence Engine?',
    answer: `Cross-Intelligence surfaces hidden correlations between your data sources — for example how weather moves both labour scheduling and inventory waste. The base engine is included with every Core package at no extra cost. Cross-Intelligence Pro ($${CI_PRO_MONTHLY}/mo + $${CI_PRO_PER_LOC}/location) adds the full correlation matrix, revenue attribution, spend efficiency radar, campaign pulse monitoring, and cannibalization detection.`
  },
  {
    question: 'How much is implementation?',
    answer: 'Implementation is charged ONCE, at the highest class in your selection — never summed per module. The classes are $0 self-service, $1,500 Class A, $2,500 Class B, $7,500 Class C, and from $12,500 Class D.'
  },
  {
    question: 'How do discounts work?',
    answer: 'Volume discounts are 0% below 50 locations, 2.5% at 50-99, 5% at 100-199 and 7% at 200-249. Billing-cycle discounts are 10% for annual and 15% for two-year. Volume and billing-cycle discounts COMBINE, capped at 15% in total. From 250 locations there is no self-serve band and pricing is quoted.'
  },
  {
    question: "What's the contract term?",
    answer: 'Month-to-month by default. Cancel anytime with no penalty. Annual prepay saves 10%, 2-year prepay saves 15%. Enterprise contracts have custom terms.'
  }
];

const watchtowerFAQ: FAQItem[] = [
  {
    question: 'What is Sundae Watchtower?',
    answer: 'Watchtower is Sundae\'s market intelligence suite that monitors your competitive landscape, local events, and industry trends. It provides actionable alerts so you can proactively adjust pricing, staffing, and marketing based on external factors.'
  },
  {
    question: 'What are the three Watchtower modules?',
    answer: 'Competitive Intelligence tracks competitor pricing, menus, and reviews. Events Intelligence monitors local events that can affect traffic. Trends Intelligence surfaces market and consumer demand shifts. Each module follows the published Watchtower pricing model shown in the configurator.'
  },
  {
    question: 'What is the Watchtower Bundle?',
    answer: 'The Watchtower Bundle includes all three Watchtower modules under a discounted package for operators who want complete market visibility. Bundle pricing in the configurator reflects the current published pricing model.'
  },
  {
    question: 'Does Watchtower require Core tier?',
    answer: 'Yes. Watchtower is available exclusively to Core subscribers — any Core package (Foundation, Margin, Growth or Performance) or Enterprise.'
  },
  {
    question: 'How does Watchtower pricing scale with locations?',
    answer: 'Watchtower keeps its own published pricing model — a module base price plus a per-location component. It is not a Core package and is not priced with the Core marginal bands. The configurator shows the live published pricing for the specific Watchtower mix you select.'
  },
  {
    question: 'Is Enterprise pricing available for Watchtower?',
    answer: 'Yes. Enterprise customers receive custom Watchtower pricing, including flat-rate options. Enterprise pricing is mandatory from 250 locations and available earlier on request. Contact sales for a custom quote.'
  },
  {
    question: 'Can I add individual Watchtower modules later?',
    answer: 'Yes! You can start with one module and add more anytime. If you later activate all three, you can switch to the Bundle pricing to get the discount. Changes take effect immediately.'
  }
];

const generalFAQ: FAQItem[] = [
  {
    question: 'How much is implementation?',
    answer: 'Implementation is a one-time charge, billed once at the highest class in your selection: $0 self-service, $1,500 Class A, $2,500 Class B, $7,500 Class C, or from $12,500 Class D. It is never summed per module.'
  },
  {
    question: "What's the contract term?",
    answer: 'Month-to-month by default. Cancel anytime with no penalty. Annual prepay saves 10%, 2-year prepay saves 15%. Enterprise contracts have custom terms.'
  },
  {
    question: 'Can I upgrade or downgrade?',
    answer: 'Yes. Upgrades are effective immediately. Downgrades take effect at next billing cycle.'
  },
  {
    question: 'How do discounts work?',
    answer: 'Volume discounts are 0% below 50 locations, 2.5% at 50-99, 5% at 100-199 and 7% at 200-249. Billing-cycle discounts are 10% annual and 15% two-year. The two combine, capped at 15% in total. From 250 locations, pricing is quoted.'
  },
  {
    question: 'Are AI credits shared across locations?',
    answer: 'Yes. AI credits are pooled at the org level and can be used across all locations. Unused credits roll over at 25% of base credits (one month). Purchased top-up credits never expire.'
  },
  {
    question: 'When does Enterprise pricing apply?',
    answer: 'Enterprise pricing is mandatory from 250 locations, where the self-serve volume ladder ends. Below that it is available on request when you need custom integrations, SSO/SAML, custom SLAs, or a security and compliance review.'
  }
];

const faqByCategory: Record<FAQCategory, FAQItem[]> = {
  core: coreFAQ,
  watchtower: watchtowerFAQ,
  // Crew-specific FAQ content not yet authored; falling back to the
  // general entries (which already cover billing / location count /
  // BYO-HR-style adjacent questions). When Crew-specific entries land
  // they can be added inline without touching the consumer.
  crew: generalFAQ,
  general: generalFAQ,
};

// Product names are proper nouns and are left untranslated in every locale
// pack, so a literal match catches the retired entries across all 22 of them.
const RETIRED_CATALOG_PATTERNS = [
  /Report\s+(Lite|Plus|Pro)/i,
  /Core\s+(Lite|Pro)\b/i,
  /Sundae\s+Report/i,
  /report[_-](lite|plus|pro)/i,
  /core[_-](lite|pro)/i,
];

function mentionsRetiredCatalog(text: string): boolean {
  return RETIRED_CATALOG_PATTERNS.some((pattern) => pattern.test(text));
}

// A name filter cannot catch a retired RULE. The machine-generated packs were
// translated from the v5.1 English source and still assert, in eighteen
// languages, that "volume and billing discounts do not combine — you get the
// larger", that the volume ladder runs 5% at 30-99 / 7% at 100-200, and that
// Enterprise starts at 30 locations or $10,000/month. Every one of those is
// wrong under v1.7 and none of them names a retired product.
//
// Pattern-matching that prose across eighteen languages cannot be shown to be
// complete — a first attempt here missed Turkish "%5" (percent leading), German
// "10.000 US-Dollar" and Japanese "10,000 ドル". So the gate is structural
// instead: a machine-generated FAQ entry may not contain a NUMBER. Every
// pricing claim needs one, so no number provably means no pricing claim, and
// the digit classes below cover the numerals these locales actually use.
// Anything dropped is still answered by the configurator, which reads the live
// catalog; entries with no number (what Watchtower is, how upgrades take
// effect) survive — roughly half of each generated pack.
//
// The hand-written ar/fr/es packs above are curated against v1.7 and are
// deliberately NOT subject to this gate — their figures are correct.
const NUMERAL_PATTERN = /[0-9\u0660-\u0669\u06F0-\u06F9\u0966-\u096F\u09E6-\u09EF\u0E50-\u0E59]/;

function statesNumber(text: string): boolean {
  return NUMERAL_PATTERN.test(text);
}

interface PricingFAQProps {
  category?: FAQCategory;
}

export function PricingFAQ({ category = 'general' }: PricingFAQProps) {
  const { locale, messages } = useLocale();
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  // 'crew' has no dedicated FAQ pack yet; fall back to the general pool for
  // both generated + localized lookups. Local faqByCategory map already
  // points crew → generalFAQ, so the EN path is covered separately.
  const lookupCategory: 'core' | 'watchtower' | 'general' =
    category === 'crew' ? 'general' : category;
  const generatedFaqItems =
    generatedAuxiliaryLocalePacks.pricingFaqs[locale as keyof typeof generatedAuxiliaryLocalePacks.pricingFaqs]?.[lookupCategory];
  const generatedGeneralFaqItems =
    generatedAuxiliaryLocalePacks.pricingFaqs[locale as keyof typeof generatedAuxiliaryLocalePacks.pricingFaqs]?.general;

  const localizedFaqItems =
    localizedFaqsByLocale[locale as keyof typeof localizedFaqsByLocale]?.[lookupCategory];
  const localizedGeneralFaqItems =
    localizedFaqsByLocale[locale as keyof typeof localizedFaqsByLocale]?.general;
  // Curated (English + hand-written ar/fr/es) packs are written against v1.7
  // and may quote figures. Machine-generated packs are still v5.1 output and
  // may not state a number at all — see `statesNumber`.
  const curatedFaqItems =
    localizedFaqItems ?? (locale === 'en' ? faqByCategory[category] || generalFAQ : undefined);
  const curatedFallback = locale === 'en' ? undefined : localizedGeneralFaqItems;
  const generatedFallback = generatedFaqItems ?? generatedGeneralFaqItems;

  const resolvedFaqItems: Array<FAQItem & { isGenerated?: boolean }> =
    curatedFaqItems ??
    curatedFallback ??
    (generatedFallback ?? []).map((item) => ({ ...item, isGenerated: true }));

  // Retranslating 22 locales against v1.7 is a separate task; until then we
  // DROP entries written for the retired book rather than display a retired
  // offer. Dropping is safe — a shorter FAQ beats a wrong one.
  const faqItems = resolvedFaqItems.filter((item) => {
    const text = `${item.question} ${item.answer}`;
    if (mentionsRetiredCatalog(text)) return false;
    if (item.isGenerated && statesNumber(text)) return false;
    return true;
  });

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleFAQ(index);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="bg-sundae-surface rounded-xl p-8"
    >
      <h3 className="text-2xl font-bold mb-2 flex items-center gap-2">
        <HelpCircle className="w-6 h-6 text-sundae-accent" />
        {messages.faq.title}
      </h3>
      <p className="text-sundae-muted mb-6">{messages.faq.description}</p>

      <div className="space-y-3">
        {faqItems.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.05 * index }}
            className="border border-white/10 rounded-lg overflow-hidden"
          >
            <button
              onClick={() => toggleFAQ(index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
              aria-expanded={openIndex === index}
              aria-controls={`faq-answer-${index}`}
              type="button"
            >
              <span className="font-semibold pr-4">{item.question}</span>
              <motion.div
                animate={{ rotate: openIndex === index ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="w-5 h-5 text-sundae-accent flex-shrink-0" />
              </motion.div>
            </button>

            <motion.div
              id={`faq-answer-${index}`}
              role="region"
              initial={false}
              animate={{
                height: openIndex === index ? 'auto' : 0,
                opacity: openIndex === index ? 1 : 0
              }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="px-6 pb-4 text-sundae-muted" aria-live="polite">
                {item.answer}
              </div>
            </motion.div>
          </motion.div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-[#C2410C]/10 rounded-lg border border-[#C2410C]/30">
        <p className="text-sm text-center">
          <strong>{messages.faq.stillQuestions}</strong> {messages.faq.contactIntro}{' '}
          <a
            href={`mailto:${LEGAL.supportEmail}`}
            className="text-sundae-accent hover:underline font-semibold"
          >
            {LEGAL.supportEmail}
          </a>
          {' '}{messages.faq.visit}{' '}
          <a
            href={getMarketingUrl('/demo', locale)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sundae-accent hover:underline font-semibold"
          >
            {new URL(getMarketingUrl('/demo', locale)).host}{new URL(getMarketingUrl('/demo', locale)).pathname}
          </a>
        </p>
      </div>
    </motion.div>
  );
}
