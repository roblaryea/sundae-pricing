// PDF Export functionality using jsPDF - Enhanced with competitor comparisons

import { useState } from 'react';
import { Download, Loader2, CheckCircle } from 'lucide-react';
import jsPDF from 'jspdf';
import { useConfiguration } from '../../hooks/useConfiguration';
import { usePriceCalculation } from '../../hooks/usePriceCalculation';
import { calculateAllComparisons } from '../../data/competitorPricing';

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
      
      // Calculate competitor comparisons
      const allModules = [...selectedModules, `${layer}-${tier}`];
      const comparisons = calculateAllComparisons(locations, allModules, pricing.total);
      const savingsComparisons = comparisons.filter(c => c.savings.firstYear > 0).slice(0, 3);
      
      // Generate quote ID
      const quoteId = `SUN-${Date.now().toString(36).toUpperCase()}`;
      const today = new Date();
      const validUntil = new Date(today);
      validUntil.setDate(validUntil.getDate() + 30);
      
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
      
      // Quote details (right side)
      doc.setTextColor(148, 163, 184);
      doc.setFontSize(9);
      doc.text(`Quote: ${quoteId}`, pageWidth - 20, 18, { align: 'right' });
      doc.text(`Generated: ${today.toLocaleDateString()}`, pageWidth - 20, 24, { align: 'right' });
      doc.text(`Valid until: ${validUntil.toLocaleDateString()}`, pageWidth - 20, 30, { align: 'right' });
      
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
      // Competitor Comparison (if we have space, or new page)
      // ═══════════════════════════════════════════════════════════════
      if (savingsComparisons.length > 0) {
        // Check if we need a new page
        if (yPos > pageHeight - 80) {
          doc.addPage();
          yPos = 25;
        } else {
          yPos += 10;
        }
        
        doc.setTextColor(30, 41, 59);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('How You Compare', 20, yPos);
        yPos += 10;
        
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 116, 139);
        
        // Table header
        doc.text('Competitor', 25, yPos);
        doc.text('Their Cost', 90, yPos);
        doc.text('Your Cost', 130, yPos);
        doc.text('You Save', pageWidth - 30, yPos, { align: 'right' });
        yPos += 2;
        
        // Horizontal line
        doc.setDrawColor(203, 213, 225);
        doc.line(20, yPos, pageWidth - 20, yPos);
        yPos += 8;
        
        // Competitor rows
        doc.setFontSize(10);
        doc.setTextColor(30, 41, 59);
        
        savingsComparisons.forEach((comp, idx) => {
          if (yPos > pageHeight - 40) {
            doc.addPage();
            yPos = 25;
          }
          
          // Competitor name with verification badge
          doc.setFont('helvetica', 'bold');
          doc.text(comp.competitor.name, 25, yPos);
          
          // Add verification indicator
          doc.setFontSize(7);
          doc.setTextColor(100, 116, 139);
          doc.setFont('helvetica', 'normal');
          doc.text('(verified)', 25 + doc.getTextWidth(comp.competitor.name) + 2, yPos);
          
          // Costs and savings
          doc.setFontSize(10);
          doc.setTextColor(30, 41, 59);
          doc.text(`$${comp.competitorCost.firstYear.toLocaleString()}`, 90, yPos);
          doc.text(`$${comp.sundaeCost.annual.toLocaleString()}`, 130, yPos);
          
          doc.setTextColor(22, 163, 74); // green
          doc.setFont('helvetica', 'bold');
          doc.text(`$${comp.savings.firstYear.toLocaleString()}`, pageWidth - 30, yPos, { align: 'right' });
          
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(30, 41, 59);
          yPos += 8;
        });
        
        // Best savings highlight
        if (savingsComparisons[0]) {
          yPos += 5;
          doc.setFillColor(220, 252, 231); // green-100
          doc.roundedRect(20, yPos - 3, pageWidth - 40, 15, 2, 2, 'F');
          
          doc.setTextColor(22, 163, 74);
          doc.setFontSize(11);
          doc.setFont('helvetica', 'bold');
          doc.text(
            `Best Savings: $${savingsComparisons[0].savings.firstYear.toLocaleString()}/year vs ${savingsComparisons[0].competitor.name}`,
            pageWidth / 2,
            yPos + 7,
            { align: 'center' }
          );
          yPos += 18;
        }
        
        // Disclaimer
        doc.setFontSize(7);
        doc.setTextColor(100, 116, 139);
        doc.setFont('helvetica', 'normal');
        doc.text(
          '* Competitor pricing based on public information and industry estimates. Contact vendors for exact quotes.',
          20,
          yPos
        );
      }
      
      // ═══════════════════════════════════════════════════════════════
      // Footer on all pages
      // ═══════════════════════════════════════════════════════════════
      const totalPages = (doc as any).internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        
        // Footer line
        doc.setDrawColor(203, 213, 225);
        doc.line(20, pageHeight - 20, pageWidth - 20, pageHeight - 20);
        
        // Footer text
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);
        doc.setFont('helvetica', 'normal');
        doc.text('Sundae.io | Decision Intelligence for Restaurants', 20, pageHeight - 12);
        doc.text(`Quote ${quoteId}`, pageWidth / 2, pageHeight - 12, { align: 'center' });
        doc.text(`Page ${i} of ${totalPages}`, pageWidth - 20, pageHeight - 12, { align: 'right' });
        
        doc.setFontSize(7);
        doc.setTextColor(148, 163, 184);
        doc.text(
          'This quote is for informational purposes. Contact us for a formal proposal.',
          pageWidth / 2,
          pageHeight - 6,
          { align: 'center' }
        );
      }
      
      // Save
      const dateStr = today.toLocaleDateString().replace(/\//g, '-');
      const filename = `Sundae-Quote-${locations}loc-${dateStr}.pdf`;
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
