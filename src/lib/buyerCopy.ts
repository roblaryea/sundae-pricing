import type { PricingLocale } from './locales';
import { buyerAuxiliaryCopy, getBuyerAuxiliaryActions } from './buyerAuxiliaryCopy';
import { generatedPricingMessages } from './generatedPricingLocalePacks';
import { generatedAuxiliaryLocalePacks } from './generatedAuxiliaryLocalePacks';
import { getQuoteSummaryCopy } from './quoteSummaryCopy';
const en = {
  title: 'Pricing that fits your business.', subtitle: 'Choose what you need. See your price. Refine when you’re ready.',
  choose: 'Choose your plan', refine: 'Refine your needs', review: 'Review your estimate',
  need: 'What do you need?', core: 'Understand performance', crew: 'Run your workforce', both: 'Bring it together',
  coreHint: 'Revenue, costs and decisions', crewHint: 'Scheduling, time and people', bothHint: 'Core intelligence + Crew operations',
  estimate: 'Base subscription estimate', exclusions: 'USD · taxes and one-time setup excluded',
  refineCta: 'Refine this plan', reviewCta: 'Review estimate', selected: 'Selected',
  compare: 'Compare what’s included', details: 'How your price is calculated', schedule: 'View the full location price list',
  business: 'How is your business set up?', optional: 'Optional. This recommends extensions; it does not add a charge.',
  models: ['Single brand', 'Diversified group', 'Franchise network', 'Hotel F&B', 'Cloud kitchen', 'Catering & events', 'Production & commissary'],
  workforce: 'Unique employees across your locations', workforceHint: 'Count each person once. Leave blank for a base estimate.',
  allowance: 'employees included across your group', overage: 'Additional employees',
  overageNote: 'Extra employees are charged once at the highest rate for your selected Crew plans, without a subscription discount. If added during your subscription, you pay for the remaining time. The added capacity stays payable until the current subscription period ends. Reducing employee numbers does not automatically create a credit.',
  workforceUnknown: 'Extra employee charges are not included until you enter your employee count.',
  payroll: 'Payroll country', payrollNote: 'We’ll confirm payroll availability, local legal requirements and setup for your country before you start.',
  countryPlaceholder: 'Country code, e.g. AE', commitment: 'Commitment & payment',
  terms: ['Monthly · rolling', 'Annual · paid quarterly', 'Annual · paid upfront', '2 years · paid upfront'],
  payment: 'Subscription payment estimate', setup: 'One-time setup', scoped: 'Confirmed separately',
  specialist: 'We’ll confirm what your specialist extensions cover and their included usage in your proposal. Charges above those limits are not included in this estimate.',
  enterprise: 'A plan for your whole business.', enterpriseBody: '250+ locations, custom connections to your systems or specific business requirements? We’ll prepare a proposal around your needs.',
  customCrew: 'Choose individual Crew capabilities', specialists: 'Relevant extensions',
  foresight: 'Forecasting included', watchtower: 'Add market intelligence',
  share: 'Copy configuration link', copied: 'Link copied', shareError: 'Copy this link', pdfError: 'Download failed. Please try again.',
  intentError: 'This configuration link is invalid or uses a retired offer. Your current selection has been kept.',
  continue: 'Continue to Sundae', intentNote: 'This is an estimate, not a final quote. We’ll confirm current prices and plan availability before you start.',
  next: 'Make the next step yours.', nextHint: 'Bring this configuration to a demo, save it for your team, or continue to account setup.',
  roi: 'Explore the value case', roiHint: 'Optional planning model. Outcomes depend on your data and actions.',
  available: 'Available separately', included: 'Included', excluded: 'Not included',
  starterCap: 'Up to 5 locations', bands: 'Locations', anchor: 'First location',
  chooseCrew: 'Choose a Crew plan to see your estimate.',
  perEmployee: 'per additional employee / month',
};
type BuyerCopy = { [K in keyof typeof en]: typeof en[K] extends string[] ? readonly string[] : string };
const translations: Partial<Record<PricingLocale, BuyerCopy>> = {
  en,
  fr: {
    perEmployee: 'par employé supplémentaire / mois',
    chooseCrew: 'Choisissez une offre Crew pour voir votre estimation.',
    title:'Des tarifs adaptés à votre activité.',subtitle:'Choisissez vos besoins. Voyez le prix. Affinez quand vous le souhaitez.',choose:'Choisissez votre offre',refine:'Affinez vos besoins',review:'Vérifiez votre estimation',need:'De quoi avez-vous besoin ?',core:'Comprendre la performance',crew:'Gérer vos équipes',both:'Tout réunir',coreHint:'Revenus, coûts et décisions',crewHint:'Planning, temps et personnel',bothHint:'Intelligence Core + opérations Crew',estimate:'Estimation de l’abonnement de base',exclusions:'USD · taxes et mise en place initiale exclues',refineCta:'Affiner cette offre',reviewCta:'Voir l’estimation',selected:'Sélectionné',compare:'Comparer les fonctionnalités incluses',details:'Calcul de votre prix',schedule:'Voir toutes les tranches',business:'Comment votre activité est-elle organisée ?',optional:'Facultatif. Ces réponses recommandent des extensions sans ajouter de frais.',models:['Une marque','Groupe diversifié','Réseau de franchises','Restauration hôtelière','Cuisine virtuelle','Traiteur et événements','Production et commissariat'],workforce:'Employés uniques dans l’ensemble de vos sites',workforceHint:'Comptez chaque personne une fois. Laissez vide pour une estimation de base.',allowance:'employés inclus dans votre groupe',overage:'Estimation des effectifs supplémentaires',overageNote:'Les places supplémentaires sont facturées une seule fois au tarif applicable le plus élevé, au prorata et jusqu’à la fin de la période. Une baisse d’effectif ne crée pas automatiquement d’avoir.',workforceUnknown:'Frais d’effectifs supplémentaires exclus tant que l’effectif n’est pas renseigné.',payroll:'Pays de paie',payrollNote:'La couverture de paie, les obligations locales et la mise en place doivent être confirmées pour votre pays.',countryPlaceholder:'Code pays, par ex. FR',commitment:'Engagement et paiement',terms:['Mensuel · sans engagement annuel','Annuel · payé par trimestre','Annuel · payé à l’avance','2 ans · payés à l’avance'],payment:'Estimation du paiement de l’abonnement',setup:'Mise en place initiale',scoped:'Chiffrée séparément avant activation',specialist:'Le périmètre spécialisé et les franchises d’objets seront confirmés dans une proposition ; les dépassements sont exclus de cette estimation.',enterprise:'Définissons votre portefeuille.',enterpriseBody:'250 sites ou plus, intégrations sur mesure ou besoins d’entreprise ? Nous préparerons une proposition adaptée.',customCrew:'Choisir les fonctions Crew individuellement',specialists:'Extensions pertinentes',foresight:'Prévisions incluses',watchtower:'Ajouter l’intelligence de marché',share:'Copier le lien de configuration',copied:'Lien copié',shareError:'Copiez ce lien',pdfError:'Échec du téléchargement. Réessayez.',intentError:'Ce lien est invalide ou utilise une ancienne offre. Votre sélection a été conservée.',continue:'Continuer vers Sundae',intentNote:'Il s’agit d’une estimation, pas d’un devis ferme. Tarifs et éligibilité seront revérifiés avant activation.',next:'Choisissez la prochaine étape.',nextHint:'Utilisez cette configuration pour une démo, partagez-la ou poursuivez la création de compte.',roi:'Explorer la valeur potentielle',roiHint:'Modèle de planification facultatif. Les résultats dépendent de vos données et actions.',available:'Disponible séparément',included:'Inclus',excluded:'Non inclus',starterCap:'Jusqu’à 5 sites',bands:'Sites',anchor:'Premier site',
  },
  es: {
    perEmployee: 'por empleado adicional / mes',
    chooseCrew: 'Elige un plan Crew para ver tu estimación.',
    title:'Precios que se adaptan a tu negocio.',subtitle:'Elige lo que necesitas. Consulta el precio. Ajusta cuando quieras.',choose:'Elige tu plan',refine:'Ajusta tus necesidades',review:'Revisa tu estimación',need:'¿Qué necesitas?',core:'Entender el rendimiento',crew:'Gestionar tu equipo',both:'Unirlo todo',coreHint:'Ingresos, costes y decisiones',crewHint:'Turnos, tiempo y personas',bothHint:'Inteligencia Core + operaciones Crew',estimate:'Estimación de la suscripción base',exclusions:'USD · impuestos e implementación inicial excluidos',refineCta:'Ajustar este plan',reviewCta:'Revisar estimación',selected:'Seleccionado',compare:'Compara lo que incluye',details:'Cómo se calcula tu precio',schedule:'Ver todos los tramos',business:'¿Cómo se organiza tu negocio?',optional:'Opcional. Recomienda extensiones sin añadir cargos.',models:['Una marca','Grupo diversificado','Red de franquicias','Restauración hotelera','Cocina virtual','Catering y eventos','Producción y cocina central'],workforce:'Empleados únicos en todas tus ubicaciones',workforceHint:'Cuenta cada persona una vez. Déjalo vacío para una estimación base.',allowance:'empleados incluidos en tu grupo',overage:'Estimación de empleados adicionales',overageNote:'Las plazas adicionales se cobran una sola vez con la tarifa aplicable más alta, prorrateadas y hasta el final del periodo. Las reducciones no generan abonos automáticos.',workforceUnknown:'Los cargos por empleados adicionales están excluidos hasta indicar el número de empleados.',payroll:'País de nómina',payrollNote:'La cobertura, los requisitos legales y la implementación deben confirmarse para tu país.',countryPlaceholder:'Código de país, p. ej. ES',commitment:'Compromiso y pago',terms:['Mensual · renovable','Anual · pago trimestral','Anual · pago anticipado','2 años · pago anticipado'],payment:'Estimación del pago de la suscripción',setup:'Implementación inicial',scoped:'Se cotiza por separado antes de activar',specialist:'El alcance especializado y las franquicias de objetos se confirman en una propuesta; los excesos están excluidos de esta estimación.',enterprise:'Definamos tu cartera.',enterpriseBody:'¿250 o más ubicaciones, integraciones a medida o requisitos empresariales? Prepararemos una propuesta adaptada.',customCrew:'Elegir funciones Crew individuales',specialists:'Extensiones relevantes',foresight:'Previsión incluida',watchtower:'Añadir inteligencia de mercado',share:'Copiar enlace de configuración',copied:'Enlace copiado',shareError:'Copia este enlace',pdfError:'Error al descargar. Inténtalo de nuevo.',intentError:'El enlace no es válido o utiliza una oferta retirada. Se ha conservado tu selección.',continue:'Continuar a Sundae',intentNote:'Es una estimación, no una oferta fija. Los precios y la elegibilidad se revisan antes de activar.',next:'Elige tu siguiente paso.',nextHint:'Lleva esta configuración a una demo, compártela o continúa con la creación de cuenta.',roi:'Explorar el valor potencial',roiHint:'Modelo de planificación opcional. Los resultados dependen de tus datos y acciones.',available:'Disponible por separado',included:'Incluido',excluded:'No incluido',starterCap:'Hasta 5 ubicaciones',bands:'Ubicaciones',anchor:'Primera ubicación',
  },
  ar: {
    perEmployee: 'لكل موظف إضافي / شهر',
    chooseCrew: 'اختر باقة Crew لرؤية تقديرك.',
    title:'أسعار تناسب أعمالك.',subtitle:'اختر ما تحتاجه. شاهد السعر. وخصصه عندما تكون مستعدًا.',choose:'اختر باقتك',refine:'حدد احتياجاتك',review:'راجع تقديرك',need:'ما الذي تحتاجه؟',core:'فهم الأداء',crew:'إدارة فريقك',both:'اجمعهما معًا',coreHint:'الإيرادات والتكاليف والقرارات',crewHint:'الجداول والوقت والموظفون',bothHint:'ذكاء Core وعمليات Crew',estimate:'تقدير الاشتراك الأساسي',exclusions:'بالدولار الأمريكي · الضرائب والإعداد الأولي غير مشمولين',refineCta:'تخصيص هذه الباقة',reviewCta:'مراجعة التقدير',selected:'محدد',compare:'قارن المزايا المشمولة',details:'كيف يُحسب سعرك',schedule:'عرض جدول الشرائح الكامل',business:'كيف تُنظم أعمالك؟',optional:'اختياري. يقترح إضافات دون إضافة رسوم.',models:['علامة واحدة','مجموعة متنوعة','شبكة امتياز','مطاعم الفنادق','مطبخ سحابي','تموين وفعاليات','إنتاج ومطبخ مركزي'],workforce:'عدد الموظفين الفريدين عبر مواقعك',workforceHint:'احسب كل شخص مرة واحدة. اتركه فارغًا للتقدير الأساسي.',allowance:'موظفًا مشمولًا في مجموعتك',overage:'تقدير الموظفين الإضافيين',overageNote:'تُحسب السعة الإضافية مرة واحدة بأعلى سعر مطبق، نسبيًا وحتى نهاية فترة الاشتراك. انخفاض العدد لا ينشئ رصيدًا تلقائيًا.',workforceUnknown:'رسوم الموظفين الإضافيين مستبعدة حتى تحديد العدد.',payroll:'بلد الرواتب',payrollNote:'يجب تأكيد تغطية الرواتب والمتطلبات القانونية والتنفيذ لبلدك.',countryPlaceholder:'رمز البلد، مثل AE',commitment:'الالتزام والدفع',terms:['شهري · متجدد','سنوي · دفع ربع سنوي','سنوي · دفع مقدم','سنتان · دفع مقدم'],payment:'تقدير دفعة الاشتراك',setup:'الإعداد لمرة واحدة',scoped:'يُحدد منفصلًا قبل التفعيل',specialist:'يُؤكد النطاق المتخصص وحدود العناصر في عرض؛ رسوم العناصر الإضافية مستبعدة من التقدير.',enterprise:'لنحدد احتياجات مجموعتك.',enterpriseBody:'250 موقعًا أو أكثر، أو تكاملات خاصة، أو متطلبات مؤسسية؟ سنعد عرضًا يناسب نموذج أعمالك.',customCrew:'اختيار قدرات Crew منفردة',specialists:'إضافات ذات صلة',foresight:'التنبؤ مشمول',watchtower:'إضافة ذكاء السوق',share:'نسخ رابط التكوين',copied:'تم نسخ الرابط',shareError:'انسخ هذا الرابط',pdfError:'تعذر التنزيل. حاول مجددًا.',intentError:'الرابط غير صالح أو يستخدم عرضًا قديمًا. تم الاحتفاظ باختيارك.',continue:'المتابعة إلى Sundae',intentNote:'هذا تقدير وليس عرض سعر ثابتًا. يُراجع السعر والأهلية قبل التفعيل.',next:'اختر خطوتك التالية.',nextHint:'استخدم التكوين لعرض توضيحي أو شاركه مع فريقك أو تابع إعداد حسابك.',roi:'استكشاف القيمة المحتملة',roiHint:'نموذج تخطيط اختياري. تعتمد النتائج على بياناتك وإجراءاتك.',available:'متاح منفصلًا',included:'مشمول',excluded:'غير مشمول',starterCap:'حتى 5 مواقع',bands:'المواقع',anchor:'الموقع الأول',
  },
};
export function getBuyerCopy(locale: PricingLocale): BuyerCopy {
  const primary = translations[locale];
  if (primary) return { ...primary, chooseCrew: primary.chooseCrew ?? primary.choose };
  const key = locale as keyof typeof buyerAuxiliaryCopy;
  const p = generatedPricingMessages[key];
  const stack = generatedAuxiliaryLocalePacks.layerStackCopy[key];
  const values = generatedAuxiliaryLocalePacks.comparisonValues[key];
  const q = getQuoteSummaryCopy(locale);
  const a = getBuyerAuxiliaryActions(key);
  return {
    ...buyerAuxiliaryCopy[key], ...a, perEmployee: employeeUnits[key],
    core: stack.core.tagline, crew: stack.crew.tagline, both: 'Core + Crew',
    coreHint: stack.core.tagline, crewHint: stack.crew.tagline, bothHint: 'Core + Crew',
    refineCta: a.refine, reviewCta: a.review, selected: p.builder.watchtowerToggle.selected,
    compare: p.summary.whatsIncluded, countryPlaceholder: 'ISO 3166-1: AE',
    setup: q.implementationOneTime, specialists: p.overview.moduleAddonsTitle,
    watchtower: p.builder.watchtowerToggle.title, shareError: a.share, pdfError: p.pdf.failed,
    next: p.summary.readyTitle, nextHint: buyerAuxiliaryCopy[key].intentNote,
    roi: q.modelledHeading, available: values['✓ (add-on)'].replace('✓ ',''),
    included: values.Included, excluded: p.quote.none,
    starterCap: `≤ 5 ${p.quote.locations}`, bands: p.quote.locations, anchor: `1 ${p.summary.locationLabel}`,
  };
}
const employeeUnits = {
  de:'pro zusätzlichem Mitarbeiter / Monat',nl:'per extra medewerker / maand',pt:'por funcionário adicional / mês',it:'per dipendente aggiuntivo / mese',pl:'za dodatkowego pracownika / miesiąc',tr:'ek çalışan başına / ay',ro:'per angajat suplimentar / lună',sv:'per extra medarbetare / månad',
  'zh-Hans':'每名额外员工 / 月',ja:'追加従業員1名あたり / 月',ko:'추가 직원 1명당 / 월',id:'per karyawan tambahan / bulan',vi:'cho mỗi nhân viên thêm / tháng',ms:'bagi setiap pekerja tambahan / bulan',hi:'प्रति अतिरिक्त कर्मचारी / माह',ur:'فی اضافی ملازم / ماہ',bn:'প্রতি অতিরিক্ত কর্মী / মাস',th:'ต่อพนักงานเพิ่มเติมหนึ่งคน / เดือน',
} as const;

const locationAverageCopy: Record<PricingLocale,string> = {
  en:'Average {amount} per location / month · across {locations} locations',
  ar:'متوسط {amount} لكل موقع شهرياً · عبر {locations} مواقع',
  fr:'En moyenne {amount} par site / mois · pour {locations} sites',
  es:'Promedio de {amount} por local / mes · en {locations} locales',
  de:'Durchschnittlich {amount} je Standort / Monat · über {locations} Standorte',
  nl:'Gemiddeld {amount} per locatie / maand · over {locations} locaties',
  pt:'Média de {amount} por unidade / mês · em {locations} unidades',
  hi:'औसत {amount} प्रति स्थान / माह · {locations} स्थानों पर',
  ur:'اوسط {amount} فی مقام / ماہ · {locations} مقامات میں',
  it:'Media di {amount} per sede / mese · su {locations} sedi',
  pl:'Średnio {amount} na lokalizację / miesiąc · w {locations} lokalizacjach',
  tr:'Lokasyon başına aylık ortalama {amount} · {locations} lokasyon için',
  'zh-Hans':'每个地点每月平均 {amount} · 共 {locations} 个地点',
  ja:'1拠点あたり月平均 {amount} · 全 {locations} 拠点',
  ko:'지점당 월평균 {amount} · 총 {locations}개 지점',
  id:'Rata-rata {amount} per lokasi / bulan · untuk {locations} lokasi',
  vi:'Trung bình {amount} mỗi địa điểm / tháng · trên {locations} địa điểm',
  ro:'În medie {amount} pe locație / lună · pentru {locations} locații',
  sv:'I genomsnitt {amount} per plats / månad · över {locations} platser',
  bn:'গড়ে {amount} প্রতি স্থান / মাস · {locations}টি স্থান জুড়ে',
  th:'เฉลี่ย {amount} ต่อสาขา / เดือน · รวม {locations} สาขา',
  ms:'Purata {amount} setiap lokasi / bulan · untuk {locations} lokasi',
};
/** The basket average is a comparison aid, never the rate for an extra location. */
export function formatLocationAverage(amount:string,locations:number,locale:PricingLocale) {
  return locationAverageCopy[locale].replace('{amount}',amount).replace('{locations}',new Intl.NumberFormat(locale).format(locations));
}
