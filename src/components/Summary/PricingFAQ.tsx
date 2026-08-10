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

const localizedFaqsByLocale: Partial<Record<'ar' | 'fr' | 'es', Partial<Record<FAQCategory, FAQItem[]>>>> = {
  ar: {
  core: [
      {
        question: 'ما الفرق بين Report و Core؟',
        answer: 'Core يضيف تكاملاً لحظياً مع POS ووحدات ذكاء متخصصة وأهلية Watchtower وأرصدة ومقاعد ذكاء اصطناعي أكبر بكثير. Report مناسب لتحليل البيانات المرفوعة، بينما Core مخصص للذكاء التشغيلي المباشر.',
      },
      {
        question: 'ما هي وحدات الذكاء؟',
        answer: 'الوحدات هي إضافات متخصصة لـ Core تمنح عمقاً تحليلياً في مجالات مثل العمالة والمخزون والمشتريات والتسويق والتوصيل وضمان الإيرادات وتجربة الضيف وغيرها. لكل وحدة ترخيص على مستوى المؤسسة مع تسعير حسب الموقع.',
      },
      {
        question: 'هل توجد رسوم إعداد للوحدات؟',
        answer: 'نعم. قد تتضمن الوحدات رسوماً لمرة واحدة تغطي الإعداد والتكامل. قد تنطبق خصومات أو إعفاءات حسب الحزم وشروط الفوترة والترتيبات المؤسسية. يعكس المحاكي وعرض السعر سياسة رسوم الإعداد الحالية.',
      },
      {
        question: 'ما هو محرك Cross-Intelligence؟',
        answer: 'عند تفعيل 3 وحدات أو أكثر يكشف محرك Cross-Intelligence الارتباطات الخفية بين مصادر بياناتك تلقائياً. النسخة الأساسية مجانية، بينما تضيف Cross-Intelligence Pro مصفوفة ترابط كاملة وإسناد الإيرادات ورادار كفاءة الإنفاق ومراقبة الحملات وكشف الإزاحة.',
      },
      {
        question: 'ما الذي يتضمنه Core Lite مقابل Core Pro؟',
        answer: 'Core Lite مناسب للفرق التي تحتاج ذكاءً تشغيلياً مباشراً مع قدرة ذكاء اصطناعي جيدة ولوحات واضحة. Core Pro يضيف قدرة أكبر وتحليلات تنبؤية أعمق واقتصاديات أفضل عند التوسع في الوحدات. تعرض الكتالوجات الحالية الحصص والأسعار الدقيقة.',
      },
      {
        question: 'كيف تعمل خصومات الحجم؟',
        answer: 'خصومات الحجم وخصومات الفوترة غير قابلة للجمع. تحصل دائماً على الخصم الأكبر فقط، وبحد أقصى 15%. العملاء المؤسسيون يحصلون على تسعير مخصص.',
      },
      {
        question: 'ما مدة العقد؟',
        answer: 'الاشتراك شهري افتراضياً ويمكن الإلغاء في أي وقت دون غرامة. الفوترة السنوية توفر 10%، والدفع لسنتين يوفر 15%. أما عقود المؤسسة فلها شروط مخصصة.',
      },
    ],
    watchtower: [
      {
        question: 'ما هو Sundae Watchtower؟',
        answer: 'Watchtower هي مجموعة الذكاء السوقي في Sundae التي تراقب المنافسين والفعاليات المحلية واتجاهات السوق. توفر تنبيهات عملية تساعدك على تعديل التسعير والتوظيف والتسويق بشكل استباقي.',
      },
      {
        question: 'ما هي وحدات Watchtower الثلاث؟',
        answer: 'ذكاء المنافسين يتتبع الأسعار والقوائم والمراجعات لدى المنافسين. إشارات الفعاليات تراقب الفعاليات المحلية التي تؤثر في الحركة. اتجاهات السوق تكشف تحولات الطلب الاستهلاكي والسوقي. كل وحدة تتبع نموذج التسعير المنشور داخل المحاكي.',
      },
      {
        question: 'ما هي حزمة Watchtower؟',
        answer: 'حزمة Watchtower تتضمن الوحدات الثلاث كلها بسعر مخفّض للفرق التي تريد رؤية سوقية كاملة. تسعير الحزمة في المحاكي يعكس النموذج المنشور الحالي.',
      },
      {
        question: 'هل يتطلب Watchtower فئة Core؟',
        answer: 'نعم. Watchtower متاح حصرياً لمشتركي Core (Core Lite أو Core Pro أو Enterprise). وهو غير متاح مع فئة Report.',
      },
      {
        question: 'كيف يتدرج تسعير Watchtower مع عدد المواقع؟',
        answer: 'لكل وحدة Watchtower سعر أساسي يغطي نطاقاً أولياً من المواقع ثم يتدرج مع المواقع الإضافية. يوضح المحاكي التسعير المنشور فعلياً حسب تركيبة Watchtower التي تختارها.',
      },
      {
        question: 'هل يتوفر تسعير مؤسسي لـ Watchtower؟',
        answer: 'نعم. عملاء Enterprise (30+ موقعاً أو إنفاق متوقع يفوق 10,000 دولار/شهر) يحصلون على تسعير مخصص لـ Watchtower، بما في ذلك خيارات السعر الثابت. تواصل مع المبيعات لعرض مخصص.',
      },
      {
        question: 'هل يمكنني إضافة وحدات Watchtower منفردة لاحقاً؟',
        answer: 'نعم. يمكنك البدء بوحدة واحدة وإضافة المزيد في أي وقت. وإذا فعّلت الوحدات الثلاث لاحقاً، يمكنك التحول إلى تسعير الحزمة للاستفادة من الخصم. تسري التغييرات فوراً.',
      },
    ],
    general: [
      {
        question: 'هل توجد رسوم إعداد؟',
        answer: 'نعم. بعض الوحدات تتضمن رسوماً لمرة واحدة مقابل أعمال الإعداد والتكامل. قد تنطبق خصومات أو إعفاءات بحسب الحزم والتزامات الفوترة وترتيبات المؤسسات. العروض المنشأة من المحاكي تعكس سياسة رسوم الإعداد المنشورة.',
      },
      {
        question: 'ما مدة العقد؟',
        answer: 'الاشتراك شهري افتراضياً ويمكن الإلغاء في أي وقت دون غرامة. الفوترة السنوية توفر 10%، والدفع لسنتين يوفر 15%. أما عقود المؤسسة فلها شروط مخصصة.',
      },
      {
        question: 'هل يمكنني الترقية أو التخفيض لاحقاً؟',
        answer: 'نعم. الترقية تسري فوراً. أما التخفيض فيسري في دورة الفوترة التالية.',
      },
      {
        question: 'كيف تعمل الخصومات؟',
        answer: 'خصومات الحجم (5% بين 30 و99 موقعاً، و7% بين 100 و200) وخصومات الفوترة (10% سنوي، 15% لسنتين) لا تتجمع. تحصل على الأعلى فقط وبحد أقصى 15%. عملاء Enterprise يحصلون على تسعير مخصص.',
      },
      {
        question: 'هل أرصدة الذكاء الاصطناعي مشتركة بين المواقع؟',
        answer: 'نعم. أرصدة الذكاء الاصطناعي مجمعة على مستوى المؤسسة ويمكن استخدامها عبر جميع المواقع. تُرحّل الأرصدة غير المستخدمة بنسبة 25% من الأرصدة الأساسية لمدة شهر واحد. الأرصدة الإضافية المشتراة لا تنتهي صلاحيتها.',
      },
      {
        question: 'ما الفرق بين مقاعد العرض ومقاعد المستخدمين؟',
        answer: 'مقاعد العرض للقراءة فقط ومفصولة عن مقاعد المستخدمين المفعلة بالذكاء الاصطناعي. أما المقاعد المفعلة بالذكاء الاصطناعي فهي الحسابات التي يمكنها طرح الأسئلة وتوليد الرؤى واستخدام ميزات الذكاء المتقدمة. عدد المقاعد المشمولة وأي تسعير توسعي يعتمدان على كتالوج الطبقة المنشور.',
      },
      {
        question: 'متى ينطبق تسعير Enterprise؟',
        answer: 'تكون مؤهلاً لتسعير Enterprise إذا كان لديك 30+ موقعاً، أو إنفاق متوقع يفوق 10,000 دولار/شهر، أو كنت تحتاج تكاملات مخصصة أو SSO/SAML أو SLAs مخصصة. يمكن للعملاء المؤهلين اختيار التسعير القياسي مع خصم الحجم أو طلب تسعير Enterprise مخصص.',
      },
    ],
  },
  fr: {
  core: [
      {
        question: 'Quelle difference entre Report et Core ?',
        answer: 'Core ajoute le temps reel POS, les modules d intelligence, l acces Watchtower et beaucoup plus de credits et sieges IA. Report est ideal pour analyser des donnees importees ; Core est fait pour l intelligence operationnelle en direct.',
      },
      {
        question: 'Que sont les modules d intelligence ?',
        answer: 'Les modules sont des options specialisees pour Core qui apportent une profondeur analytique sur le travail, les stocks, les achats, le marketing, la livraison, la garantie de revenu, l experience client, etc. Chaque module dispose d une licence organisation avec tarification par site.',
      },
      {
        question: 'Y a-t-il des frais de configuration ?',
        answer: 'Oui. Certains modules incluent des frais uniques couvrant l onboarding et l integration. Des remises ou exonerations peuvent s appliquer selon les bundles, les engagements de facturation et les accords enterprise. Le configurateur reflete la politique en vigueur.',
      },
      {
        question: 'Qu est-ce que Cross-Intelligence Engine ?',
        answer: 'Lorsque 3 modules ou plus sont actifs, Cross-Intelligence revele automatiquement les correlations cachees entre vos sources de donnees. La version de base est gratuite ; Cross-Intelligence Pro ajoute une matrice de correlation complete, l attribution des revenus, un radar d efficacite et le suivi des campagnes.',
      },
      {
        question: 'Que comprend Core Lite vs Core Pro ?',
        answer: 'Core Lite convient aux equipes qui ont besoin d une intelligence operationnelle en temps reel avec une bonne base IA. Core Pro ajoute plus de capacite, des previsions plus profondes et une meilleure economie a grande echelle. Le catalogue actuel affiche les quotas exacts.',
      },
      {
        question: 'Comment fonctionnent les remises volume ?',
        answer: 'Les remises volume et les remises de facturation ne se cumulent pas. Vous obtenez toujours la plus avantageuse, avec un plafond de 15 %. Les clients enterprise beneficient d une tarification personnalisee.',
      },
      {
        question: 'Quelle est la duree du contrat ?',
        answer: 'L abonnement est mensuel par defaut et annulable a tout moment sans penalite. Le prepaiement annuel offre 10 % de remise et le prepaiement sur 2 ans 15 %. Les contrats enterprise ont des conditions specifiques.',
      },
    ],
    watchtower: [
      {
        question: 'Qu est-ce que Sundae Watchtower ?',
        answer: 'Watchtower est la suite d intelligence de marche de Sundae qui surveille votre paysage concurrentiel, les evenements locaux et les tendances du secteur. Elle fournit des alertes actionnables pour ajuster prix, staffing et marketing de facon proactive.',
      },
      {
        question: 'Quelles sont les trois modules Watchtower ?',
        answer: 'Competitive Intelligence suit les prix, menus et avis des concurrents. Events Intelligence surveille les evenements locaux qui influencent la demande. Trends Intelligence met en avant les evolutions de demande du marche et des consommateurs. Chaque module suit le modele de prix publie dans le configurateur.',
      },
      {
        question: 'Qu est-ce que le Watchtower Bundle ?',
        answer: 'Le Watchtower Bundle regroupe les trois modules Watchtower dans un package a tarif reduit pour les operateurs qui veulent une vision complete du marche. Le prix du bundle dans le configurateur reflete le modele publie actuel.',
      },
      {
        question: 'Watchtower requiert-il la formule Core ?',
        answer: 'Oui. Watchtower est disponible uniquement pour les abonnes Core (Core Lite, Core Pro ou Enterprise). Il n est pas disponible avec la formule Report.',
      },
      {
        question: 'Comment le prix Watchtower evolue-t-il selon les sites ?',
        answer: 'Chaque module Watchtower a un prix de base couvrant un premier perimetre de sites, puis un tarif par site supplementaire. Le configurateur affiche le prix publie en direct pour la combinaison Watchtower choisie.',
      },
      {
        question: 'Le prix Enterprise est-il disponible pour Watchtower ?',
        answer: 'Oui. Les clients Enterprise (30+ sites ou plus de 10 000 $/mois de depense projetee) beneficient d un prix Watchtower personnalise, y compris des options a tarif fixe. Contactez les ventes pour un devis sur mesure.',
      },
      {
        question: 'Puis-je ajouter des modules Watchtower individuels plus tard ?',
        answer: 'Oui. Vous pouvez commencer avec un module et en ajouter d autres a tout moment. Si vous activez ensuite les trois, vous pouvez passer au prix Bundle pour profiter de la remise. Les changements s appliquent immediatement.',
      },
    ],
    general: [
      {
        question: 'Y a-t-il des frais de configuration ?',
        answer: 'Oui. Certains modules incluent des frais uniques pour l onboarding et l integration. Des remises ou exemptions peuvent s appliquer selon les bundles, les engagements de facturation et les accords enterprise. Les devis generes depuis le configurateur refletent la politique de frais publiee.',
      },
      {
        question: 'Quelle est la duree du contrat ?',
        answer: 'L abonnement est mensuel par defaut et annulable a tout moment sans penalite. Le prepaiement annuel offre 10 % de remise et le prepaiement sur 2 ans 15 %. Les contrats enterprise ont des conditions specifiques.',
      },
      {
        question: 'Puis-je monter ou descendre de gamme ?',
        answer: 'Oui. Les montes en gamme sont immediates. Les baisses de gamme prennent effet au cycle de facturation suivant.',
      },
      {
        question: 'Comment fonctionnent les remises ?',
        answer: 'Les remises volume (5 % entre 30 et 99 sites, 7 % entre 100 et 200) et les remises de facturation (10 % annuel, 15 % sur 2 ans) ne se cumulent pas. Vous obtenez toujours la plus avantageuse, avec un plafond de 15 %. Les clients Enterprise recoivent une tarification personnalisee.',
      },
      {
        question: 'Les credits IA sont-ils partages entre les sites ?',
        answer: 'Oui. Les credits IA sont mutualises au niveau de l organisation et peuvent etre utilises sur tous les sites. Les credits non utilises reportent 25 % des credits de base pendant un mois. Les packs supplementaires achetes n expirent jamais.',
      },
      {
        question: 'Quelle difference entre sieges viewers et sieges utilisateurs ?',
        answer: 'Les sieges viewers sont en lecture seule et separent des sieges utilisateurs actives par IA. Les sieges IA sont les comptes qui peuvent poser des questions, generer des insights et utiliser les fonctions avancees. Les quotas inclus et le prix d extension dependent du catalogue publie.',
      },
      {
        question: 'Quand le prix Enterprise s applique-t-il ?',
        answer: 'Vous etes eligible au prix Enterprise si vous avez 30+ sites, plus de 10 000 $/mois de depense projetee, ou si vous avez besoin d integrations personnalisees, de SSO/SAML ou de SLA specifiques. Les clients eligibles peuvent choisir le tarif standard avec remise volume ou demander un prix Enterprise personnalise.',
      },
    ],
  },
  es: {
  core: [
      {
        question: 'Cual es la diferencia entre Report y Core?',
        answer: 'Core añade POS en tiempo real, modulos especializados, acceso a Watchtower y mucha mas capacidad de creditos y puestos IA. Report es ideal para analizar datos cargados; Core es para inteligencia operativa en vivo.',
      },
      {
        question: 'Que son los modulos de inteligencia?',
        answer: 'Los modulos son complementos especializados para Core que aportan profundidad analitica en areas como personal, inventario, compras, marketing, delivery, aseguramiento de ingresos, experiencia del cliente y mas. Cada modulo tiene una licencia por organizacion con precios por local.',
      },
      {
        question: 'Hay costes de configuracion para los modulos?',
        answer: 'Si. Algunos modulos incluyen una tarifa unica para onboarding e integracion. Pueden aplicarse descuentos o exenciones segun el bundle, el compromiso de facturacion y acuerdos enterprise. El configurador refleja la politica vigente.',
      },
      {
        question: 'Que es Cross-Intelligence Engine?',
        answer: 'Cuando activas 3 o mas modulos, Cross-Intelligence revela automaticamente correlaciones ocultas entre tus fuentes de datos. La version base es gratis; Cross-Intelligence Pro añade matriz completa de correlacion, atribucion de ingresos, radar de eficiencia y monitor de campañas.',
      },
      {
        question: 'Que incluye Core Lite frente a Core Pro?',
        answer: 'Core Lite es ideal para equipos que necesitan inteligencia operativa en tiempo real con una buena base de IA. Core Pro añade mas capacidad, pronosticos mas profundos y mejor economia a gran escala. El catalogo actual muestra las cuotas exactas.',
      },
      {
        question: 'Como funcionan los descuentos por volumen?',
        answer: 'Los descuentos por volumen y por facturacion no se acumulan. Siempre recibes el mayor, con un maximo del 15%. Los clientes enterprise reciben precios personalizados.',
      },
      {
        question: 'Cual es el plazo del contrato?',
        answer: 'La suscripcion es mensual por defecto y se puede cancelar en cualquier momento sin penalizacion. El prepago anual ofrece 10% de descuento y el de 2 años, 15%. Los contratos enterprise tienen condiciones personalizadas.',
      },
    ],
    watchtower: [
      {
        question: 'Que es Sundae Watchtower?',
        answer: 'Watchtower es la suite de inteligencia de mercado de Sundae que supervisa tu panorama competitivo, los eventos locales y las tendencias del sector. Proporciona alertas accionables para ajustar precios, personal y marketing de forma proactiva.',
      },
      {
        question: 'Cuales son los tres modulos de Watchtower?',
        answer: 'Competitive Intelligence sigue precios, menus y reseñas de competidores. Events Intelligence supervisa eventos locales que afectan al trafico. Trends Intelligence muestra cambios en la demanda del mercado y de los consumidores. Cada modulo sigue el modelo de precios publicado en el configurador.',
      },
      {
        question: 'Que incluye el Watchtower Bundle?',
        answer: 'El Watchtower Bundle incluye los tres modulos de Watchtower en un paquete con descuento para operadores que quieren visibilidad total del mercado. El precio del bundle en el configurador refleja el modelo publicado actual.',
      },
      {
        question: 'Watchtower requiere Core?',
        answer: 'Si. Watchtower esta disponible solo para suscriptores Core (Core Lite, Core Pro o Enterprise). No esta disponible con Report.',
      },
      {
        question: 'Como escala el precio de Watchtower con los locales?',
        answer: 'Cada modulo de Watchtower tiene un precio base que cubre un primer alcance de locales y luego escala con locales adicionales. El configurador muestra el precio publicado en vivo para la combinacion que selecciones.',
      },
      {
        question: 'Hay precio Enterprise para Watchtower?',
        answer: 'Si. Los clientes Enterprise (30+ locales o mas de $10,000/mes de gasto previsto) obtienen precio personalizado para Watchtower, incluidas opciones de tarifa fija. Contacta ventas para una propuesta a medida.',
      },
      {
        question: 'Puedo añadir modulos de Watchtower individualmente mas adelante?',
        answer: 'Si. Puedes empezar con un modulo y agregar mas cuando quieras. Si luego activas los tres, puedes pasar al precio de bundle para obtener el descuento. Los cambios se aplican de inmediato.',
      },
    ],
    general: [
      {
        question: 'Hay costes de configuracion?',
        answer: 'Si. Algunos modulos incluyen tarifas unicas de configuracion para onboarding e integracion. Pueden aplicarse descuentos o exenciones segun bundles, compromisos de facturacion y acuerdos enterprise. Las cotizaciones generadas desde el configurador reflejan la politica publicada de setup.',
      },
      {
        question: 'Cual es el plazo del contrato?',
        answer: 'La suscripcion es mensual por defecto y se puede cancelar en cualquier momento sin penalizacion. El prepago anual ofrece 10% de descuento y el de 2 años, 15%. Los contratos enterprise tienen condiciones personalizadas.',
      },
      {
        question: 'Puedo subir o bajar de plan?',
        answer: 'Si. Las mejoras se aplican de inmediato. Las bajadas entran en vigor en el siguiente ciclo de facturacion.',
      },
      {
        question: 'Como funcionan los descuentos?',
        answer: 'Los descuentos por volumen (5% entre 30 y 99 locales, 7% entre 100 y 200) y los descuentos por facturacion (10% anual, 15% a 2 años) no se acumulan. Siempre recibes el mayor, con un maximo del 15%. Los clientes Enterprise reciben precios personalizados.',
      },
      {
        question: 'Los creditos de IA se comparten entre locales?',
        answer: 'Si. Los creditos de IA se agrupan a nivel de la organizacion y se pueden usar en todos los locales. Los creditos no usados se arrastran al 25% de los creditos base durante un mes. Los paquetes top-up comprados nunca vencen.',
      },
      {
        question: 'Que diferencia hay entre puestos viewer y puestos de usuario?',
        answer: 'Los puestos viewer son solo lectura y estan separados de los puestos de usuario con IA. Los puestos con IA son las cuentas que pueden hacer preguntas, generar insights y usar funciones avanzadas. Las cantidades incluidas y el precio de expansion dependen del catalogo publicado.',
      },
      {
        question: 'Cuando aplica el precio Enterprise?',
        answer: 'Eres elegible para precio Enterprise si tienes 30+ locales, mas de $10,000/mes de gasto previsto, o necesitas integraciones personalizadas, SSO/SAML o SLAs especificos. Los clientes elegibles pueden elegir el precio estandar con descuento por volumen o pedir una propuesta Enterprise personalizada.',
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
    answer: 'Each Watchtower module has a base price that covers an initial location footprint, then scales with additional locations. The configurator shows the live published pricing for the specific Watchtower mix you select.'
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
  const resolvedFaqItems =
    localizedFaqItems ??
    generatedFaqItems ??
    (locale === 'en'
      ? faqByCategory[category] || generalFAQ
      : localizedGeneralFaqItems || generatedGeneralFaqItems || []);

  // Translated FAQ packs still carry answers written for the retired price
  // book (Report tiers, Core Lite/Pro, the "base covers N locations" mechanic,
  // the old non-stacking discount rule). Retranslating 22 locales is a
  // separate task; until then we DROP those entries rather than display a
  // retired offer. Dropping is safe — a shorter FAQ beats a wrong one.
  const faqItems = resolvedFaqItems.filter(
    (item) => !mentionsRetiredCatalog(`${item.question} ${item.answer}`),
  );

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
