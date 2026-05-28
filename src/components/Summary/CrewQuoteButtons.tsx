// Crew-path PDF download + Email quote buttons. Same UX as
// PDFExportButton + EmailQuoteButton on the Report/Core path, but wired
// to the Crew quote shape (multi-SKU set + bundle auto-detection +
// per-SKU setup fees). Rendered side-by-side in CrewSummaryBody so the
// Crew path reaches feature parity with the analytics path.

import { useState } from 'react';
import { Download, Mail, Loader2, CheckCircle } from 'lucide-react';
import { LEGAL } from '../../config/legal';
import { useLocale } from '../../contexts/LocaleContext';
import { getPricingPdfCopy, type PricingLocale } from '../../lib/pricingI18n';
import type { CrewQuote } from '../../lib/crewPricing';

interface CrewQuoteButtonsProps {
  quote: CrewQuote;
}

async function generateAndDownloadCrewPdf(
  quote: CrewQuote,
  locale: PricingLocale,
): Promise<string> {
  const { generateCrewQuotePDF } = await import('../../lib/pdfGenerator');
  const pdfBlob = await generateCrewQuotePDF(quote, locale);

  const today = new Date();
  const dateStr = new Intl.DateTimeFormat(locale).format(today).replace(/[\\/]/g, '-');
  const pdfCopy = getPricingPdfCopy(locale);
  const filename = `Sundae-Crew-${pdfCopy.quoteLabel}-${quote.locations}-${dateStr}.pdf`;

  const url = URL.createObjectURL(pdfBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
  return filename;
}

export function CrewQuoteButtons({ quote }: CrewQuoteButtonsProps) {
  const { locale, messages } = useLocale();
  const [pdfState, setPdfState] = useState<'idle' | 'generating' | 'done'>('idle');
  const [emailState, setEmailState] = useState<'idle' | 'generating' | 'done'>('idle');

  const handleDownload = async () => {
    setPdfState('generating');
    try {
      await generateAndDownloadCrewPdf(quote, locale as PricingLocale);
      setPdfState('done');
      setTimeout(() => setPdfState('idle'), 2000);
    } catch (err) {
      console.error('Crew PDF generation failed:', err);
      alert(messages.pdf.failed);
      setPdfState('idle');
    }
  };

  const handleEmail = async () => {
    setEmailState('generating');
    try {
      const filename = await generateAndDownloadCrewPdf(quote, locale as PricingLocale);

      const skuList = quote.detectedBundleId
        ? quote.lines[0].label
        : quote.selectedSkus.join(', ');

      const subject = encodeURIComponent(
        messages.quote.subject.replace('{locations}', String(quote.locations)),
      );
      const body = encodeURIComponent(`${messages.quote.intro}

${messages.quote.bodyIntro}

${messages.quote.configuration}
• Stack: ${skuList}
• ${messages.quote.locations}: ${quote.locations}
• ${messages.quote.monthlyInvestment}: $${quote.monthly.toLocaleString()}
• ${messages.quote.annualInvestment}: $${quote.annual.toLocaleString()}
${quote.setupFee > 0 ? `• One-time setup: $${quote.setupFee.toLocaleString()}\n` : ''}${quote.bundleSavingsMonthly > 0 ? `• Bundle savings: $${quote.bundleSavingsMonthly}/mo\n` : ''}
${messages.quote.attached.replace('{filename}', filename)}

${messages.quote.nextSteps}

${messages.quote.bestRegards}`);

      alert(
        `${messages.quote.downloadedTitle}\n\n${messages.quote.downloadedBody.replace('{filename}', filename)}\n\n${messages.quote.downloadedFollowUp}\n\n${messages.quote.downloadedTip}`,
      );

      window.location.href = `mailto:${LEGAL.supportEmail}?subject=${subject}&body=${body}`;
      setEmailState('done');
      setTimeout(() => setEmailState('idle'), 3000);
    } catch (err) {
      console.error('Failed to prepare email:', err);
      alert(messages.quote.failedPrepare);
      setEmailState('idle');
    }
  };

  return (
    <>
      <button
        onClick={handleEmail}
        disabled={emailState === 'generating'}
        className="button-secondary flex items-center justify-center gap-2"
        title={messages.quote.buttonTitle}
      >
        {emailState === 'generating' ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            {messages.quote.preparing}
          </>
        ) : emailState === 'done' ? (
          <>
            <CheckCircle className="w-5 h-5 text-green-400" />
            {messages.quote.ready}
          </>
        ) : (
          <>
            <Mail className="w-5 h-5" />
            <Download className="w-4 h-4" />
            {messages.quote.emailQuote}
          </>
        )}
      </button>
      <button
        onClick={handleDownload}
        disabled={pdfState === 'generating'}
        className="button-secondary flex items-center justify-center gap-2"
      >
        {pdfState === 'generating' ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            {messages.pdf.generating}
          </>
        ) : pdfState === 'done' ? (
          <>
            <CheckCircle className="w-5 h-5 text-green-400" />
            {messages.pdf.downloaded}
          </>
        ) : (
          <>
            <Download className="w-5 h-5" />
            {messages.pdf.download}
          </>
        )}
      </button>
    </>
  );
}
