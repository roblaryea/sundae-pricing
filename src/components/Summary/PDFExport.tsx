// PDF Export functionality using jsPDF

import { useState } from 'react';
import { Download, Loader2, CheckCircle } from 'lucide-react';
import jsPDF from 'jspdf';
import { useConfiguration } from '../../hooks/useConfiguration';
import { usePriceCalculation } from '../../hooks/usePriceCalculation';

export function PDFExportButton() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  
  const { layer, tier, locations, modules: selectedModules, watchtowerModules } = useConfiguration();
  const pricing = usePriceCalculation(layer, tier, locations, selectedModules, watchtowerModules);
  
  const handleDownload = async () => {
    setIsGenerating(true);
    
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      
      // ═══════════════════════════════════════════════════════════════
      // Header
      // ═══════════════════════════════════════════════════════════════
      doc.setFillColor(15, 23, 42); // slate-900
      doc.rect(0, 0, pageWidth, 40, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.text('Sundae 🍨', 20, 25);
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text('Decision Intelligence for Restaurants', 20, 33);
      
      // Quote details
      doc.setTextColor(100, 116, 139);
      doc.setFontSize(10);
      const today = new Date().toLocaleDateString();
      doc.text(`Generated: ${today}`, pageWidth - 60, 25);
      doc.text(`Quote ID: SUN-${Date.now().toString(36).toUpperCase()}`, pageWidth - 60, 32);
      
      // ═══════════════════════════════════════════════════════════════
      // Configuration Summary
      // ═══════════════════════════════════════════════════════════════
      let yPos = 55;
      
      doc.setTextColor(30, 41, 59);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Your Configuration', 20, yPos);
      yPos += 12;
      
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105);
      
      // Platform
      const tierName = `${layer?.toUpperCase()} ${tier?.charAt(0).toUpperCase()}${tier?.slice(1)}`;
      doc.text(`Platform: ${tierName}`, 20, yPos);
      yPos += 8;
      
      // Locations
      doc.text(`Locations: ${locations}`, 20, yPos);
      yPos += 8;
      
      // Modules
      if (selectedModules.length > 0) {
        const moduleNames = selectedModules.map(m => 
          m.charAt(0).toUpperCase() + m.slice(1)
        ).join(', ');
        doc.text(`Modules: ${moduleNames}`, 20, yPos);
        yPos += 8;
      }
      
      // Watchtower
      if (watchtowerModules.length > 0) {
        const wtText = watchtowerModules.includes('bundle') 
          ? 'Full Watchtower Bundle'
          : watchtowerModules.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(', ');
        doc.text(`Watchtower: ${wtText}`, 20, yPos);
        yPos += 8;
      }
      
      yPos += 10;
      
      // ═══════════════════════════════════════════════════════════════
      // Pricing Box
      // ═══════════════════════════════════════════════════════════════
      doc.setFillColor(241, 245, 249);
      doc.roundedRect(20, yPos, pageWidth - 40, 50, 3, 3, 'F');
      
      yPos += 15;
      doc.setTextColor(30, 41, 59);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Monthly Investment', 30, yPos);
      
      doc.setFontSize(28);
      doc.setTextColor(217, 119, 6); // amber-600
      doc.text(`$${pricing.total.toLocaleString()}`, 30, yPos + 20);
      
      doc.setFontSize(11);
      doc.setTextColor(100, 116, 139);
      doc.setFont('helvetica', 'normal');
      doc.text(`$${pricing.perLocation.toLocaleString()} per location`, 30, yPos + 32);
      doc.text(`Annual: $${pricing.annualTotal.toLocaleString()}`, pageWidth - 80, yPos + 10);
      
      yPos += 60;
      
      // ═══════════════════════════════════════════════════════════════
      // Price Breakdown
      // ═══════════════════════════════════════════════════════════════
      doc.setTextColor(30, 41, 59);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Price Breakdown', 20, yPos);
      yPos += 10;
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105);
      
      pricing.breakdown.forEach(item => {
        if (yPos > pageHeight - 40) {
          doc.addPage();
          yPos = 25;
        }
        doc.text(item.item, 25, yPos);
        doc.text(`$${item.price.toLocaleString()}`, pageWidth - 50, yPos, { align: 'right' });
        yPos += 7;
      });
      
      // Discounts
      if (pricing.discounts.length > 0) {
        yPos += 5;
        doc.setTextColor(22, 163, 74);
        pricing.discounts.forEach(discount => {
          if (yPos > pageHeight - 40) {
            doc.addPage();
            yPos = 25;
          }
          doc.text(`${discount.name} (${discount.percent}%)`, 25, yPos);
          doc.text(`-$${Math.abs(discount.amount).toLocaleString()}`, pageWidth - 50, yPos, { align: 'right' });
          yPos += 7;
        });
      }
      
      // ═══════════════════════════════════════════════════════════════
      // Footer
      // ═══════════════════════════════════════════════════════════════
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text(
        'This quote is for informational purposes. Contact us for a formal proposal.',
        pageWidth / 2,
        pageHeight - 15,
        { align: 'center' }
      );
      
      // Save
      const filename = `Sundae-Quote-${locations}loc-${today.replace(/\//g, '-')}.pdf`;
      doc.save(filename);
      
      setIsComplete(true);
      setTimeout(() => setIsComplete(false), 2000);
      
    } catch (error) {
      console.error('PDF generation failed:', error);
      alert('Failed to generate PDF. Please try again.');
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
          Generating...
        </>
      ) : isComplete ? (
        <>
          <CheckCircle className="w-5 h-5 text-green-400" />
          Downloaded!
        </>
      ) : (
        <>
          <Download className="w-5 h-5" />
          Download PDF
        </>
      )}
    </button>
  );
}
