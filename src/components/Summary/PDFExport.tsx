// PDF Export functionality - Now uses shared PDF generator

import { useState } from 'react';
import { Download, Loader2, CheckCircle } from 'lucide-react';
import { useConfiguration } from '../../hooks/useConfiguration';
import { usePriceCalculation } from '../../hooks/usePriceCalculation';
import { useLocale } from '../../contexts/LocaleContext';

export function PDFExportButton() {
  const { locale, messages } = useLocale();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  
  const { layer, tier, locations, modules: selectedModules, watchtowerModules } = useConfiguration();
  const pricing = usePriceCalculation(layer, tier, locations, selectedModules, watchtowerModules);
  
  const handleDownload = async () => {
    setIsGenerating(true);
    
    try {
      const { generateQuotePDF } = await import('../../lib/pdfGenerator');

      // Generate PDF using shared utility
      const pdfBlob = await generateQuotePDF(
        layer,
        tier,
        locations,
        selectedModules,
        watchtowerModules,
        pricing,
        locale
      );
      
      // Convert blob to file and download
      const today = new Date();
      const dateStr = new Intl.DateTimeFormat(locale).format(today).replace(/[\\/]/g, '-');
      const filename = `Sundae-Quote-${locations}loc-${dateStr}.pdf`;
      
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
