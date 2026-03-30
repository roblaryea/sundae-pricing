// Email Quote button - Opens user's email client with pre-populated message
// Generates and downloads PDF for user to attach

import { useState } from 'react';
import { Mail, Loader2, CheckCircle, Download } from 'lucide-react';
import { useConfiguration } from '../../hooks/useConfiguration';
import { usePriceCalculation } from '../../hooks/usePriceCalculation';
import { generateQuotePDF } from '../../lib/pdfGenerator';
import { LEGAL } from '../../config/legal';
import { useLocale } from '../../contexts/LocaleContext';
import { localizeModuleName, localizeTierName, localizeWatchtowerName, type PricingLocale } from '../../lib/pricingI18n';

export function EmailQuoteButton() {
  const { locale, messages } = useLocale();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  
  const { layer, tier, locations, modules: selectedModules, watchtowerModules } = useConfiguration();
  const pricing = usePriceCalculation(layer, tier, locations, selectedModules, watchtowerModules);
  
  const handleEmailQuote = async () => {
    setIsGenerating(true);
    
    try {
      // Step 1: Generate and download PDF
      const pdfBlob = await generateQuotePDF(
        layer,
        tier,
        locations,
        selectedModules,
        watchtowerModules,
        pricing,
        locale as PricingLocale
      );
      
      // Download PDF
      const today = new Date();
      const dateStr = new Intl.DateTimeFormat(locale).format(today).replace(/[\\/]/g, '-');
      const filename = `Sundae-Quote-${locations}loc-${dateStr}.pdf`;
      
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();
      URL.revokeObjectURL(url);
      
      // Step 2: Prepare email content
      const tierName = layer && tier
        ? localizeTierName(
            `${layer === 'report' ? 'Report' : 'Core'} ${tier.charAt(0).toUpperCase()}${tier.slice(1)}`,
            locale as PricingLocale
          )
        : messages.quote.none;
      const moduleList = selectedModules.length > 0 
        ? selectedModules.map((moduleId) => localizeModuleName(moduleId, locale as PricingLocale)).join(', ')
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
