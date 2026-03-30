// PDF Generator utility - Shared function for generating quote PDFs
// Returns PDF as Blob for download or email attachment

import jsPDF from 'jspdf';
import { calculateAllComparisons } from '../data/competitorPricing';
import { LEGAL } from '../config/legal';
import {
  getPricingPdfCopy,
  localizeModuleName,
  localizeTierName,
  localizeWatchtowerName,
  type PricingLocale,
} from './pricingI18n';

interface PricingData {
  total: number;
  perLocation: number;
  annualTotal: number;
  breakdown: Array<{ item: string; price: number }>;
  discounts: Array<{ name: string; percent: number; amount: number }>;
}

function formatTierName(layer: string | null, tier: string | null, locale: PricingLocale): string {
  if (!layer || !tier) return '';
  const rawTier =
    layer === 'report'
      ? `Report ${tier.charAt(0).toUpperCase()}${tier.slice(1)}`
      : layer === 'core'
        ? `Core ${tier.charAt(0).toUpperCase()}${tier.slice(1)}`
        : tier.charAt(0).toUpperCase() + tier.slice(1);
  return localizeTierName(rawTier, locale);
}

function formatModuleList(moduleIds: string[], locale: PricingLocale): string {
  return moduleIds.map((moduleId) => localizeModuleName(moduleId, locale)).join(', ');
}

function formatWatchtowerList(watchtowerModules: string[], locale: PricingLocale): string {
  if (watchtowerModules.includes('bundle')) {
    return localizeWatchtowerName('bundle', locale);
  }
  return watchtowerModules.map((moduleId) => localizeWatchtowerName(moduleId, locale)).join(', ');
}

export async function generateQuotePDF(
  layer: string | null,
  tier: string | null,
  locations: number,
  selectedModules: string[],
  watchtowerModules: string[],
  pricing: PricingData,
  locale: PricingLocale = 'en'
): Promise<Blob> {
  const doc = new jsPDF();
  const copy = getPricingPdfCopy(locale);
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Calculate competitor comparisons
  const allModules = [...selectedModules, `${layer}-${tier}`];
  const comparisons = calculateAllComparisons(locations, allModules, pricing.total);
  const savingsComparisons = comparisons.filter((c) => c.savings.firstYear > 0).slice(0, 3);

  // Generate quote ID
  const quoteId = `SUN-${Date.now().toString(36).toUpperCase()}`;
  const today = new Date();
  const validUntil = new Date(today);
  validUntil.setDate(validUntil.getDate() + 30);

  // Load logo image - use current origin (works in browser)
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const logoUrl = baseUrl ? `${baseUrl}/logos/sundae-wordmark-white.png` : '/logos/sundae-wordmark-white.png';

  // Header
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, pageWidth, 40, 'F');

  try {
    await new Promise<void>((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        try {
          doc.addImage(img, 'PNG', 20, 16, 0, 11);
          resolve();
        } catch (err) {
          reject(err);
        }
      };
      img.onerror = () => reject(new Error('Failed to load logo'));
      img.src = logoUrl;
    });

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(copy.headerSubtitle, 20, 33);
  } catch (error) {
    console.warn('Logo image failed to load, using text fallback:', error);
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('SUNDAE', 20, 25);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(copy.headerSubtitle, 20, 32);
  }

  // Quote details (right side)
  doc.setTextColor(148, 163, 184);
  doc.setFontSize(9);
  doc.text(`${copy.quoteLabel}: ${quoteId}`, pageWidth - 20, 18, { align: 'right' });
  doc.text(`${copy.generatedLabel}: ${today.toLocaleDateString(locale)}`, pageWidth - 20, 24, { align: 'right' });
  doc.text(`${copy.validUntilLabel}: ${validUntil.toLocaleDateString(locale)}`, pageWidth - 20, 30, { align: 'right' });

  // Configuration Summary
  let yPos = 55;

  doc.setTextColor(30, 41, 59);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(copy.configurationTitle, 20, yPos);
  yPos += 12;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);

  const tierName = formatTierName(layer, tier, locale);
  doc.text(`${copy.platformLabel}: ${tierName}`, 20, yPos);
  yPos += 8;

  doc.text(`${copy.locationsLabel}: ${locations}`, 20, yPos);
  yPos += 8;

  if (selectedModules.length > 0) {
    const moduleNames = formatModuleList(selectedModules, locale);
    doc.text(`${copy.modulesLabel}: ${moduleNames}`, 20, yPos);
    yPos += 8;
  }

  if (watchtowerModules.length > 0) {
    const wtText = formatWatchtowerList(watchtowerModules, locale);
    doc.text(`${copy.watchtowerLabel}: ${wtText}`, 20, yPos);
    yPos += 8;
  }

  yPos += 10;

  // Pricing Box
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(20, yPos, pageWidth - 40, 50, 3, 3, 'F');

  yPos += 15;
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(copy.monthlyInvestmentLabel, 30, yPos);

  doc.setFontSize(28);
  doc.setTextColor(217, 119, 6);
  doc.text(`$${pricing.total.toLocaleString()}`, 30, yPos + 20);

  doc.setFontSize(11);
  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'normal');
  doc.text(`$${pricing.perLocation.toLocaleString()} ${copy.perLocationLabel}`, 30, yPos + 32);
  doc.text(`${copy.annualLabel}: $${pricing.annualTotal.toLocaleString()}`, pageWidth - 80, yPos + 10);

  yPos += 60;

  // Price Breakdown
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(copy.priceBreakdownTitle, 20, yPos);
  yPos += 10;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);

  pricing.breakdown.forEach((item) => {
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
    pricing.discounts.forEach((discount) => {
      if (yPos > pageHeight - 40) {
        doc.addPage();
        yPos = 25;
      }
      doc.text(`${discount.name} (${discount.percent}%)`, 25, yPos);
      doc.text(`-$${Math.abs(discount.amount).toLocaleString()}`, pageWidth - 50, yPos, { align: 'right' });
      yPos += 7;
    });
  }

  // Competitor Comparison
  if (savingsComparisons.length > 0) {
    if (yPos > pageHeight - 80) {
      doc.addPage();
      yPos = 25;
    } else {
      yPos += 10;
    }

    doc.setTextColor(30, 41, 59);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(copy.howYouCompareTitle, 20, yPos);
    yPos += 10;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);

    doc.text(copy.competitorLabel, 25, yPos);
    doc.text(copy.theirCostLabel, 90, yPos);
    doc.text(copy.yourCostLabel, 130, yPos);
    doc.text(copy.youSaveLabel, pageWidth - 30, yPos, { align: 'right' });
    yPos += 2;

    doc.setDrawColor(203, 213, 225);
    doc.line(20, yPos, pageWidth - 20, yPos);
    yPos += 8;

    doc.setFontSize(10);
    doc.setTextColor(30, 41, 59);

    savingsComparisons.forEach((comp) => {
      if (yPos > pageHeight - 40) {
        doc.addPage();
        yPos = 25;
      }

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(30, 41, 59);
      doc.text(comp.competitor.name, 25, yPos);

      doc.text(`$${comp.competitorCost.firstYear.toLocaleString()}`, 90, yPos);
      doc.text(`$${comp.sundaeCost.annual.toLocaleString()}`, 130, yPos);

      doc.setTextColor(22, 163, 74);
      doc.setFont('helvetica', 'bold');
      doc.text(`$${comp.savings.firstYear.toLocaleString()}`, pageWidth - 30, yPos, { align: 'right' });

      yPos += 6;
      doc.setFontSize(7);
      doc.setTextColor(100, 116, 139);
      doc.setFont('helvetica', 'normal');
      doc.text(`${comp.competitor.category} • ${copy.verifiedLabel}`, 25, yPos);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(30, 41, 59);
      yPos += 8;
    });

    if (savingsComparisons[0]) {
      yPos += 5;
      doc.setFillColor(220, 252, 231);
      doc.roundedRect(20, yPos - 3, pageWidth - 40, 15, 2, 2, 'F');

      doc.setTextColor(22, 163, 74);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text(
        `${copy.bestSavingsLabel}: $${savingsComparisons[0].savings.firstYear.toLocaleString()}/year vs ${savingsComparisons[0].competitor.name}`,
        pageWidth / 2,
        yPos + 7,
        { align: 'center' }
      );
      yPos += 18;
    }

    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'normal');
    doc.text(copy.competitorDisclaimer, 20, yPos);
  }

  // Footer on all pages
  const totalPages = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);

    doc.setDrawColor(203, 213, 225);
    doc.line(20, pageHeight - 20, pageWidth - 20, pageHeight - 20);

    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'normal');
    doc.text(`${LEGAL.legalName} | sundae.io`, 20, pageHeight - 12);
    doc.text(`${copy.quoteLabel} ${quoteId}`, pageWidth / 2, pageHeight - 12, { align: 'center' });
    doc.text(`${copy.pageLabel} ${i} of ${totalPages}`, pageWidth - 20, pageHeight - 12, { align: 'right' });

    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `${copy.informationalOnlyLabel} ${LEGAL.legalName} — ${copy.formalProposalLabel}`,
      pageWidth / 2,
      pageHeight - 6,
      { align: 'center' }
    );
  }

  return doc.output('blob');
}
