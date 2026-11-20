import type { PricingLocale } from './locales';

export type CapabilityComparisonCopy = {
  everyCore: string;
  limits: string;
  benchmarks: string;
  recovery: string;
  inventory: string;
  purchasing: string;
  crewOperations: string;
  crewPayroll: string;
  crewScheduling: string;
  crewPeople: string;
  noContact: string;
};

// Buyer-facing functions. SKU names and commercial calculations stay in their existing producers.
export const capabilityComparisonCopy: Record<PricingLocale, CapabilityComparisonCopy> = {
  "en": {
    "everyCore": "Included in every Core package",
    "limits": "Available data and plan usage limits apply.",
    "benchmarks": "Benchmarks",
    "recovery": "Profit Recovery",
    "inventory": "Inventory and waste",
    "purchasing": "Purchasing and suppliers",
    "crewOperations": "HR, tasks, checklists and shift logbook",
    "crewPayroll": "Payroll preparation and tips",
    "crewScheduling": "Scheduling and handover viewing",
    "crewPeople": "People intelligence",
    "noContact": "Enter locations for an instant estimate. No contact details needed."
  },
  "ar": {
    "everyCore": "مشمول في كل باقة Core",
    "limits": "تُطبّق حدود الاستخدام وتوفّر البيانات في باقتك.",
    "benchmarks": "المقارنات المرجعية",
    "recovery": "استرداد الأرباح",
    "inventory": "المخزون والهدر",
    "purchasing": "المشتريات والموردون",
    "crewOperations": "الموارد البشرية والمهام وقوائم التحقق وسجل الورديات",
    "crewPayroll": "إعداد الرواتب والإكراميات",
    "crewScheduling": "جدولة الورديات وعرض التسليمات",
    "crewPeople": "ذكاء شؤون الموظفين",
    "noContact": "أدخل عدد المواقع لتحصل على تقدير فوري دون بيانات اتصال."
  },
  "fr": {
    "everyCore": "Inclus dans chaque offre Core",
    "limits": "La disponibilité des données et les limites d’usage de l’offre s’appliquent.",
    "benchmarks": "Comparaisons de performance",
    "recovery": "Récupération du profit",
    "inventory": "Stocks et gaspillage",
    "purchasing": "Achats et fournisseurs",
    "crewOperations": "RH, tâches, listes de contrôle et journal de service",
    "crewPayroll": "Préparation de la paie et pourboires",
    "crewScheduling": "Planning et consultation des passations",
    "crewPeople": "Intelligence RH",
    "noContact": "Indiquez vos établissements pour une estimation immédiate, sans coordonnées."
  },
  "es": {
    "everyCore": "Incluido en todos los paquetes Core",
    "limits": "Se aplican la disponibilidad de datos y los límites de uso del plan.",
    "benchmarks": "Comparativas de rendimiento",
    "recovery": "Recuperación de beneficios",
    "inventory": "Inventario y desperdicio",
    "purchasing": "Compras y proveedores",
    "crewOperations": "RR. HH., tareas, listas de control y registro de turnos",
    "crewPayroll": "Preparación de nóminas y propinas",
    "crewScheduling": "Planificación y consulta de relevos",
    "crewPeople": "Inteligencia de personal",
    "noContact": "Indica tus locales para obtener una estimación inmediata, sin datos de contacto."
  },
  "de": {
    "everyCore": "In jedem Core-Paket enthalten",
    "limits": "Verfügbare Daten und die Nutzungslimits des Pakets gelten weiterhin.",
    "benchmarks": "Benchmarks",
    "recovery": "Gewinnrückgewinnung",
    "inventory": "Bestand und Verschwendung",
    "purchasing": "Einkauf und Lieferanten",
    "crewOperations": "Personalverwaltung, Aufgaben, Checklisten und Schichtbuch",
    "crewPayroll": "Lohnvorbereitung und Trinkgelder",
    "crewScheduling": "Schichtplanung und Übergaben einsehen",
    "crewPeople": "Personalintelligenz",
    "noContact": "Standorte eingeben und sofort eine Schätzung erhalten, ohne Kontaktdaten."
  },
  "nl": {
    "everyCore": "In elk Core-pakket inbegrepen",
    "limits": "Beschikbare gegevens en de gebruikslimieten van je pakket zijn van toepassing.",
    "benchmarks": "Benchmarks",
    "recovery": "Winstherstel",
    "inventory": "Voorraad en verspilling",
    "purchasing": "Inkoop en leveranciers",
    "crewOperations": "HR, taken, checklists en het dienstlogboek",
    "crewPayroll": "Loonvoorbereiding en fooien",
    "crewScheduling": "Roosters en overdrachten bekijken",
    "crewPeople": "Personeelsinzichten",
    "noContact": "Vul je aantal locaties in voor een directe raming, zonder contactgegevens."
  },
  "pt": {
    "everyCore": "Incluído em todos os pacotes Core",
    "limits": "Aplicam-se a disponibilidade de dados e os limites de utilização do plano.",
    "benchmarks": "Comparações de desempenho",
    "recovery": "Recuperação de lucro",
    "inventory": "Inventário e desperdício",
    "purchasing": "Compras e fornecedores",
    "crewOperations": "RH, tarefas, listas de verificação e diário de turnos",
    "crewPayroll": "Preparação salarial e gorjetas",
    "crewScheduling": "Escalas e consulta de passagens de turno",
    "crewPeople": "Inteligência de pessoas",
    "noContact": "Indique o número de locais para uma estimativa imediata, sem dados de contacto."
  },
  "hi": {
    "everyCore": "हर Core पैकेज में शामिल",
    "limits": "उपलब्ध डेटा और योजना की उपयोग सीमाएँ लागू हैं।",
    "benchmarks": "तुलनात्मक मानक",
    "recovery": "लाभ की वसूली",
    "inventory": "स्टॉक और बर्बादी",
    "purchasing": "खरीद और आपूर्तिकर्ता",
    "crewOperations": "एचआर, कार्य, चेकलिस्ट और शिफ्ट लॉगबुक",
    "crewPayroll": "वेतन की तैयारी और टिप्स",
    "crewScheduling": "शिफ्ट योजना और हैंडओवर देखना",
    "crewPeople": "कर्मचारी संबंधी जानकारी",
    "noContact": "तुरंत अनुमान के लिए स्थानों की संख्या दर्ज करें। संपर्क विवरण की ज़रूरत नहीं।"
  },
  "ur": {
    "everyCore": "ہر Core پیکیج میں شامل",
    "limits": "دستیاب ڈیٹا اور منصوبے کی استعمال کی حدود لاگو ہیں۔",
    "benchmarks": "تقابلی معیارات",
    "recovery": "منافع کی بازیابی",
    "inventory": "اسٹاک اور ضیاع",
    "purchasing": "خریداری اور سپلائرز",
    "crewOperations": "ایچ آر، کام، چیک لسٹس اور شفٹ لاگ بک",
    "crewPayroll": "تنخواہ کی تیاری اور ٹپس",
    "crewScheduling": "شفٹ کی منصوبہ بندی اور حوالگی دیکھنا",
    "crewPeople": "افرادی قوت کی بصیرت",
    "noContact": "فوری تخمینے کے لیے مقامات کی تعداد درج کریں۔ رابطے کی تفصیلات درکار نہیں۔"
  },
  "it": {
    "everyCore": "Incluso in ogni pacchetto Core",
    "limits": "Si applicano i dati disponibili e i limiti di utilizzo del piano.",
    "benchmarks": "Confronti delle prestazioni",
    "recovery": "Recupero dei profitti",
    "inventory": "Scorte e sprechi",
    "purchasing": "Acquisti e fornitori",
    "crewOperations": "HR, attività, checklist e registro dei turni",
    "crewPayroll": "Preparazione delle paghe e mance",
    "crewScheduling": "Pianificazione e consultazione dei passaggi di consegne",
    "crewPeople": "Intelligence del personale",
    "noContact": "Inserisci le sedi per una stima immediata, senza dati di contatto."
  },
  "pl": {
    "everyCore": "W każdym pakiecie Core",
    "limits": "Obowiązują dostępność danych i limity wykorzystania planu.",
    "benchmarks": "Porównania wyników",
    "recovery": "Odzyskiwanie zysku",
    "inventory": "Zapasy i straty",
    "purchasing": "Zakupy i dostawcy",
    "crewOperations": "HR, zadania, listy kontrolne i dziennik zmian",
    "crewPayroll": "Przygotowanie płac i napiwki",
    "crewScheduling": "Planowanie zmian i przegląd przekazań",
    "crewPeople": "Analityka pracowników",
    "noContact": "Podaj liczbę lokali, aby od razu zobaczyć szacunek, bez danych kontaktowych."
  },
  "tr": {
    "everyCore": "Her Core paketine dahildir",
    "limits": "Veri kullanılabilirliği ve plan kullanım sınırları geçerlidir.",
    "benchmarks": "Performans karşılaştırmaları",
    "recovery": "Kâr geri kazanımı",
    "inventory": "Stok ve israf",
    "purchasing": "Satın alma ve tedarikçiler",
    "crewOperations": "İK, görevler, kontrol listeleri ve vardiya defteri",
    "crewPayroll": "Bordro hazırlığı ve bahşişler",
    "crewScheduling": "Vardiya planlama ve devir teslimleri görüntüleme",
    "crewPeople": "Çalışan içgörüleri",
    "noContact": "İletişim bilgisi vermeden anında tahmin için lokasyon sayısını girin."
  },
  "zh-Hans": {
    "everyCore": "每个 Core 套餐均包含",
    "limits": "实际使用受可用数据和套餐额度限制。",
    "benchmarks": "基准对比",
    "recovery": "利润回收",
    "inventory": "库存与浪费",
    "purchasing": "采购与供应商",
    "crewOperations": "人事、任务、检查清单和班次日志",
    "crewPayroll": "薪资准备与小费",
    "crewScheduling": "排班与交接查看",
    "crewPeople": "人员洞察",
    "noContact": "输入门店数量即可查看即时估算，无需提供联系方式。"
  },
  "ja": {
    "everyCore": "すべての Core パッケージに含まれます",
    "limits": "利用可能なデータとプランの利用上限が適用されます。",
    "benchmarks": "ベンチマーク",
    "recovery": "利益回復",
    "inventory": "在庫と廃棄",
    "purchasing": "購買と仕入先",
    "crewOperations": "人事、タスク、チェックリスト、シフト日誌",
    "crewPayroll": "給与計算の準備とチップ",
    "crewScheduling": "シフト計画と引き継ぎの閲覧",
    "crewPeople": "人材インテリジェンス",
    "noContact": "拠点数を入力するとすぐに見積りを確認できます。連絡先は不要です。"
  },
  "ko": {
    "everyCore": "모든 Core 패키지에 포함",
    "limits": "사용 가능한 데이터와 요금제 이용 한도가 적용됩니다.",
    "benchmarks": "벤치마크",
    "recovery": "이익 회수",
    "inventory": "재고와 낭비",
    "purchasing": "구매와 공급업체",
    "crewOperations": "인사, 업무, 체크리스트와 교대 일지",
    "crewPayroll": "급여 준비와 팁",
    "crewScheduling": "근무 일정과 인수인계 조회",
    "crewPeople": "인력 인사이트",
    "noContact": "매장 수를 입력하면 연락처 없이 바로 예상 금액을 확인할 수 있습니다."
  },
  "id": {
    "everyCore": "Termasuk dalam setiap paket Core",
    "limits": "Ketersediaan data dan batas penggunaan paket tetap berlaku.",
    "benchmarks": "Tolok ukur",
    "recovery": "Pemulihan laba",
    "inventory": "Persediaan dan pemborosan",
    "purchasing": "Pembelian dan pemasok",
    "crewOperations": "SDM, tugas, daftar periksa, dan buku catatan sif",
    "crewPayroll": "Persiapan penggajian dan tip",
    "crewScheduling": "Penjadwalan dan melihat serah terima",
    "crewPeople": "Wawasan karyawan",
    "noContact": "Masukkan jumlah lokasi untuk perkiraan langsung, tanpa detail kontak."
  },
  "vi": {
    "everyCore": "Có trong mọi gói Core",
    "limits": "Áp dụng dữ liệu hiện có và giới hạn sử dụng của gói.",
    "benchmarks": "So sánh chuẩn",
    "recovery": "Thu hồi lợi nhuận",
    "inventory": "Hàng tồn kho và lãng phí",
    "purchasing": "Mua hàng và nhà cung cấp",
    "crewOperations": "Nhân sự, công việc, danh sách kiểm tra và nhật ký ca",
    "crewPayroll": "Chuẩn bị bảng lương và tiền tip",
    "crewScheduling": "Xếp ca và xem bàn giao",
    "crewPeople": "Thông tin nhân sự",
    "noContact": "Nhập số địa điểm để xem ước tính ngay, không cần thông tin liên hệ."
  },
  "ro": {
    "everyCore": "Inclus în fiecare pachet Core",
    "limits": "Se aplică disponibilitatea datelor și limitele de utilizare ale planului.",
    "benchmarks": "Comparații de performanță",
    "recovery": "Recuperarea profitului",
    "inventory": "Stocuri și risipă",
    "purchasing": "Achiziții și furnizori",
    "crewOperations": "HR, sarcini, liste de verificare și jurnal de tură",
    "crewPayroll": "Pregătirea salarizării și bacșișuri",
    "crewScheduling": "Planificare și consultarea predării turelor",
    "crewPeople": "Informații despre personal",
    "noContact": "Introduceți numărul de locații pentru o estimare imediată, fără date de contact."
  },
  "sv": {
    "everyCore": "Ingår i varje Core-paket",
    "limits": "Tillgängliga data och paketets användningsgränser gäller.",
    "benchmarks": "Jämförelsetal",
    "recovery": "Återvunnen vinst",
    "inventory": "Lager och svinn",
    "purchasing": "Inköp och leverantörer",
    "crewOperations": "HR, uppgifter, checklistor och skiftloggbok",
    "crewPayroll": "Löneförberedelser och dricks",
    "crewScheduling": "Schemaläggning och visning av överlämningar",
    "crewPeople": "Personalinsikter",
    "noContact": "Ange antal platser för en direkt uppskattning, utan kontaktuppgifter."
  },
  "bn": {
    "everyCore": "প্রতিটি Core প্যাকেজে অন্তর্ভুক্ত",
    "limits": "উপলব্ধ ডেটা এবং প্ল্যানের ব্যবহারের সীমা প্রযোজ্য।",
    "benchmarks": "তুলনামূলক মানদণ্ড",
    "recovery": "মুনাফা পুনরুদ্ধার",
    "inventory": "মজুত ও অপচয়",
    "purchasing": "ক্রয় ও সরবরাহকারী",
    "crewOperations": "এইচআর, কাজ, চেকলিস্ট এবং শিফট লগবুক",
    "crewPayroll": "বেতন প্রস্তুতি ও টিপস",
    "crewScheduling": "শিফট পরিকল্পনা ও হস্তান্তর দেখা",
    "crewPeople": "কর্মীসংক্রান্ত অন্তর্দৃষ্টি",
    "noContact": "তাৎক্ষণিক হিসাব দেখতে লোকেশনের সংখ্যা লিখুন। যোগাযোগের তথ্য লাগবে না।"
  },
  "th": {
    "everyCore": "รวมอยู่ในทุกแพ็กเกจ Core",
    "limits": "ขึ้นอยู่กับข้อมูลที่มีและขีดจำกัดการใช้งานของแพ็กเกจ",
    "benchmarks": "การเทียบเคียงประสิทธิภาพ",
    "recovery": "การกู้คืนกำไร",
    "inventory": "สินค้าคงคลังและของเสีย",
    "purchasing": "การจัดซื้อและผู้จัดส่ง",
    "crewOperations": "งานบุคคล งาน รายการตรวจสอบ และสมุดบันทึกกะ",
    "crewPayroll": "การเตรียมเงินเดือนและทิป",
    "crewScheduling": "การจัดตารางและดูการส่งมอบกะ",
    "crewPeople": "ข้อมูลเชิงลึกด้านบุคลากร",
    "noContact": "กรอกจำนวนสาขาเพื่อดูประมาณการทันที โดยไม่ต้องให้ข้อมูลติดต่อ"
  },
  "ms": {
    "everyCore": "Termasuk dalam setiap pakej Core",
    "limits": "Ketersediaan data dan had penggunaan pelan terpakai.",
    "benchmarks": "Penanda aras",
    "recovery": "Pemulihan keuntungan",
    "inventory": "Inventori dan pembaziran",
    "purchasing": "Pembelian dan pembekal",
    "crewOperations": "HR, tugasan, senarai semak dan buku log syif",
    "crewPayroll": "Persediaan gaji dan tip",
    "crewScheduling": "Penjadualan dan melihat serah tugas",
    "crewPeople": "Cerapan tenaga kerja",
    "noContact": "Masukkan bilangan lokasi untuk anggaran segera tanpa butiran hubungan."
  },
  "az": {
    "everyCore": "Hər Core paketinə daxildir",
    "limits": "Mövcud məlumatlar və planın istifadə limitləri tətbiq olunur.",
    "benchmarks": "Performans müqayisələri",
    "recovery": "Mənfəətin bərpası",
    "inventory": "Ehtiyatlar və israf",
    "purchasing": "Satınalma və təchizatçılar",
    "crewOperations": "İK, tapşırıqlar, yoxlama siyahıları və növbə jurnalı",
    "crewPayroll": "Əməkhaqqı hazırlığı və bəxşişlər",
    "crewScheduling": "Növbə planlaması və təhvil-təslimə baxış",
    "crewPeople": "İşçi heyəti üzrə məlumatlar",
    "noContact": "Əlaqə məlumatları vermədən dərhal təxmin üçün məntəqə sayını daxil edin."
  },
  "ru": {
    "everyCore": "В каждом пакете Core",
    "limits": "Действуют доступность данных и лимиты использования плана.",
    "benchmarks": "Сравнение показателей",
    "recovery": "Восстановление прибыли",
    "inventory": "Запасы и потери",
    "purchasing": "Закупки и поставщики",
    "crewOperations": "HR, задачи, контрольные списки и журнал смен",
    "crewPayroll": "Подготовка зарплаты и чаевые",
    "crewScheduling": "Расписание и просмотр передачи смен",
    "crewPeople": "Аналитика персонала",
    "noContact": "Укажите число точек для мгновенной оценки, без контактных данных."
  },
  "pap": {
    "everyCore": "Inkluí den kada pakete Core",
    "limits": "Dato disponibel i límitenan di uso di e plan ta apliká.",
    "benchmarks": "Komparashon di prestashon",
    "recovery": "Rekuperashon di ganashi",
    "inventory": "Inventario i desperdicio",
    "purchasing": "Kompra i suplidornan",
    "crewOperations": "HR, tareanan, lista di kontrol i logboek di turno",
    "crewPayroll": "Preparashon di sueldo i propina",
    "crewScheduling": "Planifikashon i mira entrega di turno",
    "crewPeople": "Inteligensia di personal",
    "noContact": "Yena e kantidat di lokashon pa un estimashon direkt, sin dato di kontakto."
  }
};
