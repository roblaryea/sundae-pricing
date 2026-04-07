// Pricing FAQ component with category-specific questions

import { motion } from 'framer-motion';
import { HelpCircle, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { LEGAL, getMarketingUrl } from '../../config/legal';
import { useLocale } from '../../contexts/LocaleContext';

interface FAQItem {
  question: string;
  answer: string;
}

type FAQCategory = 'report' | 'core' | 'watchtower' | 'general';

const localizedFaqsByLocale: Partial<Record<'ar' | 'fr' | 'es', Partial<Record<FAQCategory, FAQItem[]>>>> = {
  ar: {
    report: [
      {
        question: 'ما هو Sundae Report؟',
        answer: 'Sundae Report هي طبقة التحليلات لدينا التي تتصل بمصادر بياناتك الحالية مثل POS والتوصيل والمراجعات وتحوّلها إلى رؤى عملية. لا تحتاج إلى تكامل POS لبدء الاستخدام. ابدأ مجاناً مع Report Lite أو فعّل التحليلات المتقدمة مع Plus أو Pro.',
      },
      {
        question: 'ما الفرق بين Report Lite و Plus و Pro؟',
        answer: 'Report Lite هو نقطة البداية للتجربة. يضيف Report Plus المقارنات المعيارية وسعة ذكاء اصطناعي أكبر ومجموعة مرئيات أوسع. أما Report Pro فيقدّم أعمق حزمة تحليلات وقدرات تنبؤ أقوى وسير عمل أكثر تقدماً. يعرض الكتالوج الحالي الأسعار والسعة المشمولة دائماً داخل المحاكي.',
      },
      {
        question: 'كيف تعمل أرصدة الذكاء الاصطناعي؟',
        answer: 'أرصدة الذكاء الاصطناعي تشغّل الميزات الذكية في Sundae. كل استعلام أو توليد رؤى أو تحليل مؤتمت يستهلك أرصدة. تتضمن كل طبقة رصيداً أساسياً إضافةً إلى أرصدة حسب الموقع. يمكن ترحيل الأرصدة غير المستخدمة بنسبة 25% من الرصيد الأساسي لمدة شهر واحد. كما يمكنك شراء حزم إضافية لا تنتهي صلاحيتها.',
      },
      {
        question: 'هل أحتاج تكاملاً مع POS في Report؟',
        answer: 'لا. يعمل Report مع البيانات المرفوعة مثل CSV وتصديرات منصات التوصيل والإدخال اليدوي. تكامل POS اختياري ويفعّل التحديث اللحظي. نوصي بـ Core إذا كنت تريد تكاملاً مباشراً مع POS.',
      },
      {
        question: 'ما الفرق بين مقاعد العرض ومقاعد مستخدمي الذكاء الاصطناعي؟',
        answer: 'مقاعد العرض مجانية وغير محدودة في جميع الطبقات وتمنح وصولاً للقراءة فقط إلى لوحات المعلومات. أما مقاعد الذكاء الاصطناعي فتسمح لأعضاء الفريق بطرح الأسئلة وتوليد الرؤى واستخدام ميزات الذكاء الاصطناعي. تتضمن كل طبقة عدداً محدداً من هذه المقاعد.',
      },
      {
        question: 'هل يمكنني الترقية من Report إلى Core لاحقاً؟',
        answer: 'نعم. يمكنك الترقية من Report إلى Core في أي وقت. تصبح الترقية فعّالة فوراً وتنتقل بياناتك ولوحاتك وإعداداتك الحالية معك. يضيف Core تكاملاً لحظياً مع POS ووحدات متخصصة وأهلية Watchtower.',
      },
      {
        question: 'هل توجد نسخة تجريبية مجانية؟',
        answer: 'Report Lite مجاني دائماً ولا يحتاج بطاقة. أما Report Plus و Pro فهناك تجربة مجانية لمدة 14 يوماً لتجربة المجموعة الكاملة قبل الالتزام.',
      },
    ],
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
    report: [
      {
        question: 'Qu est-ce que Sundae Report ?',
        answer: 'Sundae Report est notre couche analytique connectee a vos sources de donnees existantes (POS, livraison, avis) pour generer des insights actionnables, sans integration POS requise. Commencez gratuitement avec Report Lite ou activez des analyses plus avancees avec Plus ou Pro.',
      },
      {
        question: 'Quelle difference entre Report Lite, Plus et Pro ?',
        answer: 'Report Lite est le point d entree. Report Plus ajoute les benchmarks, davantage de capacite IA et une palette visuelle plus large. Report Pro apporte la suite analytique la plus profonde, plus de capacite IA et des workflows de prevision plus avances. Le catalogue affiche toujours les tarifs et capacites du moment.',
      },
      {
        question: 'Comment fonctionnent les credits IA ?',
        answer: 'Les credits IA alimentent les fonctionnalites intelligentes de Sundae. Chaque requete IA, generation d insight ou analyse automatisee consomme des credits. Chaque niveau inclut une base plus des credits par site. Les credits non utilises reportent 25% de votre base pendant un mois. Vous pouvez aussi acheter des packs supplementaires sans expiration.',
      },
      {
        question: 'Ai-je besoin d une integration POS pour Report ?',
        answer: 'Non. Report fonctionne avec les donnees importees : CSV, exports des plateformes de livraison et saisie manuelle. L integration POS est optionnelle et active le rafraichissement temps reel. Core est recommande si vous voulez un POS direct.',
      },
      {
        question: 'Quelle difference entre les sieges viewers et les sieges IA ?',
        answer: 'Les sieges viewers sont gratuits et illimites sur tous les niveaux et donnent un acces lecture seule aux tableaux de bord. Les sieges IA permettent de poser des questions, generer des insights et utiliser les fonctions IA. Chaque niveau inclut un nombre fixe de sieges IA.',
      },
      {
        question: 'Puis-je passer de Report a Core plus tard ?',
        answer: 'Oui. Vous pouvez passer de Report a Core a tout moment. La mise a niveau est immediate et conserve vos donnees, tableaux de bord et parametres. Core ajoute le temps reel POS, les modules et l acces Watchtower.',
      },
      {
        question: 'Existe-t-il un essai gratuit ?',
        answer: 'Report Lite est gratuit a vie, sans carte bancaire. Report Plus et Pro incluent un essai gratuit de 14 jours pour tester l ensemble avant de vous engager.',
      },
    ],
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
    report: [
      {
        question: 'Que es Sundae Report?',
        answer: 'Sundae Report es nuestra capa de analitica que conecta con tus fuentes de datos existentes (POS, delivery, reseñas) y genera insights accionables sin requerir integracion POS. Empieza gratis con Report Lite o desbloquea analisis mas avanzados con Plus o Pro.',
      },
      {
        question: 'Cual es la diferencia entre Report Lite, Plus y Pro?',
        answer: 'Report Lite es el punto de entrada. Report Plus añade benchmarks, mas capacidad de IA y un conjunto visual mas amplio. Report Pro ofrece la suite analitica mas profunda, mayor capacidad de IA y flujos de trabajo de pronostico mas avanzados. El catalogo siempre muestra los precios y capacidades vigentes.',
      },
      {
        question: 'Como funcionan los creditos de IA?',
        answer: 'Los creditos de IA impulsan las funciones inteligentes de Sundae. Cada consulta, generacion de insight o analisis automatizado consume creditos. Cada nivel incluye una base mas creditos por local. Los creditos no usados se arrastran en un 25% de tu base durante un mes. Tambien puedes comprar paquetes adicionales sin vencimiento.',
      },
      {
        question: 'Necesito integracion POS para Report?',
        answer: 'No. Report funciona con datos cargados: CSV, exports de plataformas de delivery y entrada manual. La integracion POS es opcional y habilita actualizacion en tiempo real. Recomendamos Core si quieres POS directo.',
      },
      {
        question: 'Cual es la diferencia entre puestos viewer y puestos IA?',
        answer: 'Los puestos viewer son gratis e ilimitados en todos los niveles y ofrecen acceso solo lectura a los dashboards. Los puestos IA permiten hacer preguntas, generar insights y usar las funciones de IA. Cada nivel incluye un numero fijo de puestos IA.',
      },
      {
        question: 'Puedo pasar de Report a Core despues?',
        answer: 'Si. Puedes pasar de Report a Core cuando quieras. La mejora es inmediata y conserva datos, dashboards y configuracion. Core añade POS en tiempo real, modulos y acceso a Watchtower.',
      },
      {
        question: 'Hay prueba gratis?',
        answer: 'Report Lite es gratis para siempre y no requiere tarjeta. Report Plus y Pro incluyen una prueba gratuita de 14 dias para probar todo antes de comprometerte.',
      },
    ],
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

const reportFAQ: FAQItem[] = [
  {
    question: 'What is Sundae Report?',
    answer: 'Sundae Report is our analytics layer that connects to your existing data sources (POS, delivery, reviews) and generates actionable insights — no POS integration required. Start free with Report Lite, or unlock benchmarking and AI-powered analysis with Plus or Pro.'
  },
  {
    question: 'What\'s the difference between Report Lite, Plus, and Pro?',
    answer: 'Report Lite is the entry point for trying Sundae. Report Plus adds benchmarking, more AI capacity, and a broader visual set. Report Pro adds the deepest analytics package, higher AI capacity, and advanced forecasting-oriented workflows. Current pricing and included capacity are always reflected in the published catalog shown in the configurator.'
  },
  {
    question: 'How do AI credits work?',
    answer: 'AI credits power Sundae\'s intelligent features — every AI query, insight generation, or automated analysis consumes credits. Each tier includes a base amount plus per-location credits. Unused credits roll over at 25% of your base allocation (one month). You can also buy top-up bundles that never expire.'
  },
  {
    question: 'Do I need a POS integration for Report?',
    answer: 'No! Report works with uploaded data — CSV files, delivery platform exports, and manual entry. POS integration is optional and unlocks real-time data refresh. Core tier is recommended if you want live POS integration.'
  },
  {
    question: 'What are viewer seats vs AI user seats?',
    answer: 'Viewer seats are unlimited and free at all tiers — they provide read-only access to dashboards without AI query capabilities. AI user seats allow team members to ask questions, generate insights, and use AI features. Each tier includes a set number of AI seats.'
  },
  {
    question: 'Can I upgrade from Report to Core later?',
    answer: 'Yes! You can upgrade from Report to Core anytime. Upgrades are effective immediately and your existing data, dashboards, and settings carry over. Core adds real-time POS integration, modules, and Watchtower eligibility.'
  },
  {
    question: 'Is there a free trial?',
    answer: 'Report Lite is free forever — no credit card required. For Report Plus and Pro, we offer a 14-day free trial so you can experience the full feature set before committing.'
  }
];

const coreFAQ: FAQItem[] = [
  {
    question: 'What\'s the difference between Report and Core?',
    answer: 'Core adds real-time POS integration, intelligence modules (Labor, Inventory, Marketing, etc.), Watchtower eligibility, and significantly more AI credits and seats. Report is great for analytics on uploaded data; Core is for live operational intelligence.'
  },
  {
    question: 'What are intelligence modules?',
    answer: 'Modules are specialized add-ons for Core tier that provide deep intelligence in specific areas like labor, inventory, purchasing, marketing, delivery, revenue assurance, guest experience, and more. Each module has an organization license with location-based scaling. The live configurator reflects the current published catalog for module pricing by tier.'
  },
  {
    question: 'Are there setup fees for modules?',
    answer: 'Yes. Modules can include one-time setup fees covering onboarding and integration work. Discounts and waivers may apply based on bundle selection, billing terms, and enterprise arrangements. The configurator and quote output reflect the current published setup-fee model.'
  },
  {
    question: 'What is the Cross-Intelligence Engine?',
    answer: 'When you activate 3+ modules, the Cross-Intelligence Engine automatically surfaces hidden correlations between your data sources — e.g., how weather impacts both labor scheduling and inventory waste. The base tier is included free; Cross-Intelligence Pro ($199/mo + $19/location) adds full correlation matrix, revenue attribution, spend efficiency radar, campaign pulse monitoring, and cannibalization detection.'
  },
  {
    question: 'What\'s included in Core Lite vs Core Pro?',
    answer: 'Core Lite is designed for teams that need real-time operating intelligence with strong baseline AI capacity and dashboarding. Core Pro adds more AI capacity, deeper predictive workflows, and more favorable economics for scaled module usage. The exact included seats, credits, and pricing are pulled from the current published catalog.'
  },
  {
    question: 'How do volume discounts work?',
    answer: 'Volume discounts (5% for growth chains at 30-99 locations, 7% for multi-site at 100-200) and billing discounts (10% annual, 15% 2-year) are non-stacking — you get whichever is larger, up to a maximum of 15%. Enterprise customers (30+ locations) receive custom pricing.'
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
    answer: 'Yes. Watchtower is available exclusively for Core tier subscribers (Core Lite, Core Pro, or Enterprise). It is not available with Report tier.'
  },
  {
    question: 'How does Watchtower pricing scale with locations?',
    answer: 'Each Watchtower module has a base price that covers an initial location footprint, then scales with additional locations. The configurator shows the live published pricing for the specific Watchtower mix you select.'
  },
  {
    question: 'Is Enterprise pricing available for Watchtower?',
    answer: 'Yes. Enterprise customers (30+ locations or $10,000+/month projected spend) receive custom Watchtower pricing, including flat-rate options. Contact sales for a custom quote.'
  },
  {
    question: 'Can I add individual Watchtower modules later?',
    answer: 'Yes! You can start with one module and add more anytime. If you later activate all three, you can switch to the Bundle pricing to get the discount. Changes take effect immediately.'
  }
];

const generalFAQ: FAQItem[] = [
  {
    question: 'Are there setup fees?',
    answer: 'Yes. Some modules include one-time setup fees for onboarding and integration work. Discounts and waivers can apply depending on bundles, billing commitments, and enterprise arrangements. Quotes generated from the configurator reflect the live published setup-fee policy.'
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
    answer: 'Volume discounts (5% at 30-99 locations, 7% at 100-200) and billing discounts (10% annual, 15% 2-year) are non-stacking — you get whichever is larger, up to a maximum of 15%. Enterprise customers receive custom pricing.'
  },
  {
    question: 'Are AI credits shared across locations?',
    answer: 'Yes. AI credits are pooled at the org level and can be used across all locations. Unused credits roll over at 25% of base credits (one month). Purchased top-up credits never expire.'
  },
  {
    question: 'What are viewer seats vs user seats?',
    answer: 'Viewer seats are read-only and separate from AI-enabled user seats. AI-enabled seats are the accounts that can ask questions, generate insights, and use advanced intelligence features. Included seat counts and any expansion pricing depend on the published tier catalog.'
  },
  {
    question: 'When does Enterprise pricing apply?',
    answer: 'You are eligible for Enterprise pricing if you have 30+ locations, $10,000+/month projected spend, or need custom integrations, SSO/SAML, or custom SLAs. Eligible customers may choose standard pricing with a volume discount OR request custom Enterprise pricing.'
  }
];

const faqByCategory: Record<FAQCategory, FAQItem[]> = {
  report: reportFAQ,
  core: coreFAQ,
  watchtower: watchtowerFAQ,
  general: generalFAQ,
};

interface PricingFAQProps {
  category?: FAQCategory;
}

export function PricingFAQ({ category = 'general' }: PricingFAQProps) {
  const { locale, messages } = useLocale();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const localizedFaqItems =
    localizedFaqsByLocale[locale as keyof typeof localizedFaqsByLocale]?.[category];
  const localizedGeneralFaqItems =
    localizedFaqsByLocale[locale as keyof typeof localizedFaqsByLocale]?.general;
  const faqItems =
    localizedFaqItems ??
    (locale === 'en'
      ? faqByCategory[category] || generalFAQ
      : localizedGeneralFaqItems || []);

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

      <div className="mt-6 p-4 bg-violet-500/10 rounded-lg border border-violet-500/30">
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
