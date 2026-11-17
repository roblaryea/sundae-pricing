import type { PricingLocale } from './locales';

// The public website requests onboarding; account creation follows an invitation.
const copy = {
  en: ['Request access', 'Tell us about your business. We’ll confirm your package and onboarding steps, then send a secure invitation to create your account.'],
  ar: ['طلب الوصول', 'أخبرنا عن نشاطك. سنؤكد الباقة وخطوات التهيئة، ثم نرسل دعوة آمنة لإنشاء حسابك.'],
  fr: ['Demander un accès', 'Présentez votre entreprise. Nous confirmerons votre offre et les étapes de mise en place, puis vous enverrons une invitation sécurisée pour créer votre compte.'],
  es: ['Solicitar acceso', 'Cuéntanos sobre tu negocio. Confirmaremos tu paquete y los pasos de incorporación y te enviaremos una invitación segura para crear tu cuenta.'],
  de: ['Zugang anfragen', 'Erzählen Sie uns von Ihrem Unternehmen. Wir bestätigen Ihr Paket und die Einrichtungsschritte und senden Ihnen eine sichere Einladung zur Kontoerstellung.'],
  nl: ['Toegang aanvragen', 'Vertel ons over uw bedrijf. We bevestigen uw pakket en de inrichtingsstappen en sturen een beveiligde uitnodiging om uw account aan te maken.'],
  pt: ['Solicitar acesso', 'Conte-nos sobre a sua empresa. Confirmaremos o pacote e os passos de configuração e enviaremos um convite seguro para criar a sua conta.'],
  hi: ['एक्सेस का अनुरोध करें', 'अपने व्यवसाय के बारे में बताएं। हम आपके पैकेज और सेटअप के चरणों की पुष्टि करके खाता बनाने के लिए सुरक्षित आमंत्रण भेजेंगे।'],
  ur: ['رسائی کی درخواست کریں', 'اپنے کاروبار کے بارے میں بتائیں۔ ہم پیکیج اور سیٹ اپ کے مراحل کی تصدیق کر کے اکاؤنٹ بنانے کے لیے محفوظ دعوت بھیجیں گے۔'],
  it: ['Richiedi accesso', 'Parlaci della tua attività. Confermeremo il pacchetto e i passaggi di configurazione, poi invieremo un invito sicuro per creare il tuo account.'],
  pl: ['Poproś o dostęp', 'Opowiedz nam o swojej firmie. Potwierdzimy pakiet i etapy wdrożenia, a następnie wyślemy bezpieczne zaproszenie do utworzenia konta.'],
  tr: ['Erişim talep edin', 'İşletmenizi anlatın. Paketinizi ve kurulum adımlarını onaylayıp hesabınızı oluşturmanız için güvenli bir davet göndereceğiz.'],
  'zh-Hans': ['申请访问', '请介绍您的企业。我们将确认套餐和入门步骤，然后发送安全邀请以创建您的账户。'],
  ja: ['アクセスを申請', '事業についてお知らせください。プランと導入手順を確認した後、アカウント作成用の安全な招待をお送りします。'],
  ko: ['이용 신청', '사업에 대해 알려 주세요. 요금제와 도입 절차를 확인한 후 계정을 만들 수 있는 안전한 초대장을 보내드립니다.'],
  id: ['Minta akses', 'Ceritakan bisnis Anda. Kami akan mengonfirmasi paket dan langkah penyiapan, lalu mengirim undangan aman untuk membuat akun.'],
  vi: ['Yêu cầu truy cập', 'Hãy cho chúng tôi biết về doanh nghiệp của bạn. Chúng tôi sẽ xác nhận gói và các bước thiết lập, rồi gửi lời mời bảo mật để tạo tài khoản.'],
  ro: ['Solicită acces', 'Spune-ne despre afacerea ta. Vom confirma pachetul și pașii de configurare, apoi vom trimite o invitație securizată pentru crearea contului.'],
  sv: ['Begär åtkomst', 'Berätta om ditt företag. Vi bekräftar paketet och stegen för att komma igång och skickar sedan en säker inbjudan för att skapa ditt konto.'],
  bn: ['অ্যাক্সেসের অনুরোধ করুন', 'আপনার ব্যবসা সম্পর্কে জানান। আমরা প্যাকেজ ও সেটআপের ধাপ নিশ্চিত করে অ্যাকাউন্ট তৈরির নিরাপদ আমন্ত্রণ পাঠাব।'],
  th: ['ขอสิทธิ์เข้าใช้งาน', 'บอกเราเกี่ยวกับธุรกิจของคุณ เราจะยืนยันแพ็กเกจและขั้นตอนเริ่มต้น จากนั้นส่งคำเชิญที่ปลอดภัยเพื่อสร้างบัญชีของคุณ'],
  ms: ['Minta akses', 'Ceritakan tentang perniagaan anda. Kami akan mengesahkan pakej dan langkah persediaan, kemudian menghantar jemputan selamat untuk mencipta akaun anda.'],
  az: ['Giriş üçün müraciət edin', 'Biznesiniz haqqında məlumat verin. Paketi və ilkin quraşdırma addımlarını təsdiqləyib hesab yaratmaq üçün təhlükəsiz dəvət göndərəcəyik.'],
  ru: ['Запросить доступ', 'Расскажите о своей компании. Мы согласуем пакет и этапы подключения, затем отправим безопасное приглашение для создания аккаунта.'],
  pap: ['Pidi akseso', 'Konta nos di bo negoshi. Nos lo konfirmá bo pakete i e pasonan pa kuminsá, i manda un invitashon sigur pa krea bo kuenta.'],
} as const satisfies Record<PricingLocale, readonly [string, string]>;

export function getAccessRequestCopy(locale: PricingLocale) {
  const [title, description] = copy[locale];
  return { title, description };
}
