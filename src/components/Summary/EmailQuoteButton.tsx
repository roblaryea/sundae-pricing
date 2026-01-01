// Email Quote button - Opens user's email client with pre-populated message
// Generates and downloads PDF for user to attach

import { useState } from 'react';
import { Mail, Loader2, CheckCircle, Download } from 'lucide-react';
import { useConfiguration } from '../../hooks/useConfiguration';
import { usePriceCalculation } from '../../hooks/usePriceCalculation';
import { generateQuotePDF } from '../../lib/pdfGenerator';

export function EmailQuoteButton() {
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
        pricing
      );
      
      // Download PDF
      const today = new Date();
      const dateStr = today.toLocaleDateString().replace(/\//g, '-');
      const filename = `Sundae-Quote-${locations}loc-${dateStr}.pdf`;
      
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();
      URL.revokeObjectURL(url);
      
      // Step 2: Prepare email content
      const tierName = `${layer?.toUpperCase()} ${tier}`;
      const moduleList = selectedModules.length > 0 
        ? selectedModules.map(m => m.charAt(0).toUpperCase() + m.slice(1)).join(', ')
        : 'None';
      const watchtowerList = watchtowerModules.includes('bundle')
        ? 'Full Watchtower Bundle'
        : watchtowerModules.length > 0
          ? watchtowerModules.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(', ')
          : 'None';
      
      const subject = encodeURIComponent(`Sundae Quote Request - ${locations} Locations`);
      const body = encodeURIComponent(`Hi Sundae Team,

I'm interested in Sundae for my restaurant(s). Please find my configuration details below:

CONFIGURATION:
• Platform: ${tierName}
• Locations: ${locations}
• Monthly Investment: $${pricing.total.toLocaleString()}
• Annual Investment: $${pricing.annualTotal.toLocaleString()}
• Modules: ${moduleList}
• Watchtower: ${watchtowerList}

I've attached the detailed PDF quote (${filename}) to this email.

Please contact me to discuss next steps.

Best regards`);
      
      // Step 3: Show instruction modal then open email
      alert(`✅ PDF Downloaded!\n\n"${filename}" has been downloaded to your computer.\n\nYour email will open next - please attach the downloaded PDF before sending.\n\nTip: The PDF is usually in your Downloads folder.`);
      
      // Step 4: Open email client with mailto link
      window.location.href = `mailto:sales@sundae.io?subject=${subject}&body=${body}`;
      
      setIsComplete(true);
      setTimeout(() => setIsComplete(false), 3000);
      
    } catch (error) {
      console.error('Failed to prepare email:', error);
      alert('Failed to prepare email. Please try downloading the PDF manually.');
    } finally {
      setIsGenerating(false);
    }
  };
  
  return (
    <button
      onClick={handleEmailQuote}
      disabled={isGenerating}
      className="button-secondary flex items-center justify-center gap-2"
      title="Downloads PDF and opens your email client"
    >
      {isGenerating ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          Preparing...
        </>
      ) : isComplete ? (
        <>
          <CheckCircle className="w-5 h-5 text-green-400" />
          Email Ready!
        </>
      ) : (
        <>
          <Mail className="w-5 h-5" />
          <Download className="w-4 h-4" />
          Email Quote
        </>
      )}
    </button>
  );
}
