// PDF Export functionality - Now uses shared PDF generator

import { useMemo, useState } from 'react';
import { Download, Loader2, CheckCircle } from 'lucide-react';
import { resolveImplementationClass } from '../../lib/discoveryEngine';
import { useConfiguration } from '../../hooks/useConfiguration';
import { useLocale } from '../../contexts/LocaleContext';
import type { PriceCalculation } from '../../types/configuration';
import { getPricingPdfCopy, type PricingLocale } from '../../lib/pricingI18n';

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
export function PDFExportButton({ pricing, crewMonthly = 0, funding }: {
  pricing: PriceCalculation;
  crewMonthly?: number;
  /** The funding case as the summary computed it, so the PDF cannot disagree. */
  funding?: {
    monthlyFunding: number;
    profitRecovery: number;
    cashAvoidance: number;
    capacityValue: number;
    capacityFte: number;
    coreMonthly: number;
  };
}) {
  const { locale, messages } = useLocale();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  
  const {
    layer, corePackage, locations, addOns, watchtowerModules,
    techStack, operatingModels, crewSkus, roiInputs,
  } = useConfiguration();
  // Identical resolution to ConfigSummary, the ROI step and the comparison card.
  const stackEstimate = useMemo(
    () =>
      techStack.length > 0
        ? resolveImplementationClass(techStack, operatingModels, {
            crewPayrollSelected: crewSkus.includes('crew_payroll'),
          })
        : null,
    [techStack, operatingModels, crewSkus],
  );
  
  const handleDownload = async () => {
    setIsGenerating(true);
    
    try {
      const { generateQuotePDF } = await import('../../lib/pdfGenerator');

      // Generate PDF using shared utility
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
        locale,
        // Same comparison inputs as the on-screen card, so the document and the
        // screen cannot answer differently. Without the revenue context the
        // status quo loses its error/rework line; without the basis our own
        // implementation is missing from a first-year figure that includes
        // theirs.
        {
          basis: {
            coreMonthly: pricing.total,
            crewMonthly,
            implementationFee: stackEstimate ? stackEstimate.fee : 0,
            implementationScoped: !stackEstimate,
            implementationIsFloor: stackEstimate ? stackEstimate.isFloor : false,
          },
          context: { monthlyRevenuePerLocation: roiInputs.monthlyRevenue },
        },
        funding,
      );
      
      // Convert blob to file and download
      const today = new Date();
      const dateStr = new Intl.DateTimeFormat(locale).format(today).replace(/[\\/]/g, '-');
      const pdfCopy = getPricingPdfCopy(locale as PricingLocale);
      const filename = `Sundae-${pdfCopy.quoteLabel}-${locations}-${dateStr}.pdf`;
      
      // Create download link
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();
      URL.revokeObjectURL(url);
      
      setIsComplete(true);
      setTimeout(() => setIsComplete(false), 2000);
      
    } catch (error) {
      console.error('PDF generation failed:', error);
      alert(messages.pdf.failed);
    } finally {
      setIsGenerating(false);
    }
  };
  
  return (
    <button
      onClick={handleDownload}
      disabled={isGenerating}
      className="button-secondary flex items-center justify-center gap-2"
    >
      {isGenerating ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          {messages.pdf.generating}
        </>
      ) : isComplete ? (
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
  );
}
