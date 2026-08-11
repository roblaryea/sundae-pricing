// Email Quote button - Opens user's email client with pre-populated message
// Generates and downloads PDF for user to attach

import { useState } from 'react';
import { Mail, Loader2, CheckCircle, Download } from 'lucide-react';
import { useConfiguration } from '../../hooks/useConfiguration';
import { corePackages } from '../../data/pricing';
import { LEGAL } from '../../config/legal';
import { useLocale } from '../../contexts/LocaleContext';
import type { PriceCalculation } from '../../types/configuration';
import {
  getPricingPdfCopy,
  localizeModuleName,
  localizeTierName,
  localizeWatchtowerName,
  type PricingLocale,
} from '../../lib/pricingI18n';

/**
 * The exported artefact must be the SAME deal the screen showed.
 *
 * This re-derived the quote with `usePriceCalculation(layer, corePackage,
 * locations, addOns, watchtowerModules)` — no client profile, so no commitment
 * term, and no Crew rail. The screen applied the term the buyer selected and
 * the PDF did not, so a two-year quote read $18,568.25 on screen and $21,845 in
 * the document, with the discount silently replaced by the volume band and the
 * term never named. That document is the one a board actually reads.
 *
 * The quote is now passed in, computed once by the summary.
 */
export function EmailQuoteButton({ pricing, crewMonthly = 0 }: {
  pricing: PriceCalculation;
  crewMonthly?: number;
}) {
  const { locale, messages } = useLocale();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  
  const { layer, corePackage, locations, addOns, watchtowerModules } = useConfiguration();
  
  const handleEmailQuote = async () => {
    setIsGenerating(true);
    
    try {
      const { generateQuotePDF } = await import('../../lib/pdfGenerator');

      // Step 1: Generate and download PDF
      const pdfBlob = await generateQuotePDF(
        layer,
        corePackage,
        locations,
        addOns,
        watchtowerModules,
        // The Crew rail is part of the deal on the combined pathway; a
        // document that omits it describes a cheaper agreement than the one
        // the buyer configured.
        { ...pricing, total: pricing.total + crewMonthly, annualTotal: (pricing.total + crewMonthly) * 12 },
        locale as PricingLocale
      );
      
      // Download PDF
      const today = new Date();
      const dateStr = new Intl.DateTimeFormat(locale).format(today).replace(/[\\/]/g, '-');
      const pdfCopy = getPricingPdfCopy(locale as PricingLocale);
      const filename = `Sundae-${pdfCopy.quoteLabel}-${locations}-${dateStr}.pdf`;
      
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();
      URL.revokeObjectURL(url);
      
      // Step 2: Prepare email content
      const tierName = layer && corePackage
        ? localizeTierName(corePackages[corePackage].name, locale as PricingLocale)
        : messages.quote.none;
      // Add-ons only. The eleven Core domain modules are package components
      // and must not be listed as separate purchased lines.
      const moduleList = addOns.length > 0
        ? addOns.map((addOnId: string) => localizeModuleName(addOnId, locale as PricingLocale)).join(', ')
        : messages.quote.none;
      const watchtowerList = watchtowerModules.includes('bundle')
        ? localizeWatchtowerName('bundle', locale as PricingLocale)
        : watchtowerModules.length > 0
          ? watchtowerModules.map((moduleId) => localizeWatchtowerName(moduleId, locale as PricingLocale)).join(', ')
          : messages.quote.none;
      
      const subject = encodeURIComponent(messages.quote.subject.replace('{locations}', String(locations)));
      const body = encodeURIComponent(`${messages.quote.intro}

${messages.quote.bodyIntro}

${messages.quote.configuration}
• ${messages.quote.platform}: ${tierName}
• ${messages.quote.locations}: ${locations}
• ${messages.quote.monthlyInvestment}: $${pricing.total.toLocaleString()}
• ${messages.quote.annualInvestment}: $${pricing.annualTotal.toLocaleString()}
• ${messages.quote.modules}: ${moduleList}
• ${messages.quote.watchtower}: ${watchtowerList}

${messages.quote.attached.replace('{filename}', filename)}

${messages.quote.nextSteps}

${messages.quote.bestRegards}`);
      
      // Step 3: Show instruction modal then open email
      alert(`${messages.quote.downloadedTitle}\n\n${messages.quote.downloadedBody.replace('{filename}', filename)}\n\n${messages.quote.downloadedFollowUp}\n\n${messages.quote.downloadedTip}`);
      
      // Step 4: Open email client with mailto link
      window.location.href = `mailto:${LEGAL.supportEmail}?subject=${subject}&body=${body}`;
      
      setIsComplete(true);
      setTimeout(() => setIsComplete(false), 3000);
      
    } catch (error) {
      console.error('Failed to prepare email:', error);
      alert(messages.quote.failedPrepare);
    } finally {
      setIsGenerating(false);
    }
  };
  
  return (
    <button
      onClick={handleEmailQuote}
      disabled={isGenerating}
      className="button-secondary flex items-center justify-center gap-2"
      title={messages.quote.buttonTitle}
    >
      {isGenerating ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          {messages.quote.preparing}
        </>
      ) : isComplete ? (
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
  );
}
