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
import { getLocalizedCompetitorCategory } from './pricingUiCopy';

const ARABIC_PDF_FONT_NAME = 'NotoSansArabic';
const ARABIC_PDF_FONT_FILE = 'NotoSansArabic-Regular.ttf';
const ARABIC_PDF_FONT_PATH = `/fonts/${ARABIC_PDF_FONT_FILE}`;

let arabicFontBase64Promise: Promise<string> | null = null;

interface PricingData {
  total: number;
  perLocation: number;
  annualTotal: number;
  breakdown: Array<{ item: string; price: number }>;
  discounts: Array<{ name: string; percent: number; amount: number }>;
}

function isRtlLocale(locale: PricingLocale): boolean {
  return locale === 'ar';
}

function toBase64(arrayBuffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(arrayBuffer);
  const chunkSize = 0x8000;

  for (let index = 0; index < bytes.length; index += chunkSize) {
    const chunk = bytes.subarray(index, index + chunkSize);
    binary += String.fromCharCode(...chunk);
  }

  return btoa(binary);
}

async function loadArabicFontBase64(): Promise<string> {
  if (!arabicFontBase64Promise) {
    arabicFontBase64Promise = fetch(ARABIC_PDF_FONT_PATH)
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`Failed to load Arabic PDF font: ${response.status}`);
        }
        return response.arrayBuffer();
      })
      .then(toBase64);
  }

  return arabicFontBase64Promise;
}

async function ensurePdfFont(doc: jsPDF, locale: PricingLocale): Promise<void> {
  if (!isRtlLocale(locale)) return;

  if ((doc.getFontList?.() as Record<string, string[]> | undefined)?.[ARABIC_PDF_FONT_NAME]) {
    return;
  }

  const base64Font = await loadArabicFontBase64();
  doc.addFileToVFS(ARABIC_PDF_FONT_FILE, base64Font);
  doc.addFont(ARABIC_PDF_FONT_FILE, ARABIC_PDF_FONT_NAME, 'normal');
}

function setPdfFont(doc: jsPDF, locale: PricingLocale, style: 'normal' | 'bold' = 'normal'): void {
  if (isRtlLocale(locale)) {
    doc.setFont(ARABIC_PDF_FONT_NAME, 'normal');
    return;
  }

  doc.setFont('helvetica', style);
}

function formatCurrencyAmount(value: number, locale: PricingLocale): string {
  return `$${value.toLocaleString(locale)}`;
}

function formatPercent(value: number, locale: PricingLocale): string {
  return value.toLocaleString(locale);
}

function renderPdfText(
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  locale: PricingLocale,
  options?: Parameters<jsPDF['text']>[3]
): void {
  const output = isRtlLocale(locale) ? doc.processArabic(text) : text;
  doc.text(output, x, y, options);
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
  const isRtl = isRtlLocale(locale);
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  doc.setR2L(isRtl);
  await ensurePdfFont(doc, locale);

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
    setPdfFont(doc, locale, 'normal');
    renderPdfText(doc, copy.headerSubtitle, 20, 33, locale);
  } catch (error) {
    console.warn('Logo image failed to load, using text fallback:', error);
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    setPdfFont(doc, locale, 'bold');
    doc.text('SUNDAE', 20, 25);

    doc.setFontSize(10);
    setPdfFont(doc, locale, 'normal');
    renderPdfText(doc, copy.headerSubtitle, 20, 32, locale);
  }

  // Quote details (right side)
  doc.setTextColor(148, 163, 184);
  doc.setFontSize(9);
  renderPdfText(doc, `${copy.quoteLabel}: ${quoteId}`, pageWidth - 20, 18, locale, { align: 'right' });
  renderPdfText(doc, `${copy.generatedLabel}: ${today.toLocaleDateString(locale)}`, pageWidth - 20, 24, locale, { align: 'right' });
  renderPdfText(doc, `${copy.validUntilLabel}: ${validUntil.toLocaleDateString(locale)}`, pageWidth - 20, 30, locale, { align: 'right' });

  // Configuration Summary
  let yPos = 55;

  doc.setTextColor(30, 41, 59);
  doc.setFontSize(16);
  setPdfFont(doc, locale, 'bold');
  renderPdfText(doc, copy.configurationTitle, 20, yPos, locale);
  yPos += 12;

  doc.setFontSize(11);
  setPdfFont(doc, locale, 'normal');
  doc.setTextColor(71, 85, 105);

  const tierName = formatTierName(layer, tier, locale);
  renderPdfText(doc, `${copy.platformLabel}: ${tierName}`, 20, yPos, locale);
  yPos += 8;

  renderPdfText(doc, `${copy.locationsLabel}: ${locations.toLocaleString(locale)}`, 20, yPos, locale);
  yPos += 8;

  if (selectedModules.length > 0) {
    const moduleNames = formatModuleList(selectedModules, locale);
    renderPdfText(doc, `${copy.modulesLabel}: ${moduleNames}`, 20, yPos, locale);
    yPos += 8;
  }

  if (watchtowerModules.length > 0) {
    const wtText = formatWatchtowerList(watchtowerModules, locale);
    renderPdfText(doc, `${copy.watchtowerLabel}: ${wtText}`, 20, yPos, locale);
    yPos += 8;
  }

  yPos += 10;

  // Pricing Box
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(20, yPos, pageWidth - 40, 50, 3, 3, 'F');

  yPos += 15;
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(14);
  setPdfFont(doc, locale, 'bold');
  renderPdfText(doc, copy.monthlyInvestmentLabel, 30, yPos, locale);

  doc.setFontSize(28);
  doc.setTextColor(217, 119, 6);
  renderPdfText(doc, formatCurrencyAmount(pricing.total, locale), 30, yPos + 20, locale);

  doc.setFontSize(11);
  doc.setTextColor(100, 116, 139);
  setPdfFont(doc, locale, 'normal');
  renderPdfText(doc, `${formatCurrencyAmount(pricing.perLocation, locale)} ${copy.perLocationLabel}`, 30, yPos + 32, locale);
  renderPdfText(doc, `${copy.annualLabel}: ${formatCurrencyAmount(pricing.annualTotal, locale)}`, pageWidth - 80, yPos + 10, locale);

  yPos += 60;

  // Price Breakdown
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(14);
  setPdfFont(doc, locale, 'bold');
  renderPdfText(doc, copy.priceBreakdownTitle, 20, yPos, locale);
  yPos += 10;

  doc.setFontSize(10);
  setPdfFont(doc, locale, 'normal');
  doc.setTextColor(71, 85, 105);

  pricing.breakdown.forEach((item) => {
    if (yPos > pageHeight - 40) {
      doc.addPage();
      yPos = 25;
    }
    renderPdfText(doc, item.item, 25, yPos, locale);
    renderPdfText(doc, formatCurrencyAmount(item.price, locale), pageWidth - 50, yPos, locale, { align: 'right' });
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
      renderPdfText(doc, `${discount.name} (${formatPercent(discount.percent, locale)}%)`, 25, yPos, locale);
      renderPdfText(doc, `-${formatCurrencyAmount(Math.abs(discount.amount), locale)}`, pageWidth - 50, yPos, locale, { align: 'right' });
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
    setPdfFont(doc, locale, 'bold');
    renderPdfText(doc, copy.howYouCompareTitle, 20, yPos, locale);
    yPos += 10;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);

    renderPdfText(doc, copy.competitorLabel, 25, yPos, locale);
    renderPdfText(doc, copy.theirCostLabel, 90, yPos, locale);
    renderPdfText(doc, copy.yourCostLabel, 130, yPos, locale);
    renderPdfText(doc, copy.youSaveLabel, pageWidth - 30, yPos, locale, { align: 'right' });
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

      setPdfFont(doc, locale, 'bold');
      doc.setFontSize(10);
      doc.setTextColor(30, 41, 59);
      renderPdfText(doc, comp.competitor.name, 25, yPos, locale);

      renderPdfText(doc, formatCurrencyAmount(comp.competitorCost.firstYear, locale), 90, yPos, locale);
      renderPdfText(doc, formatCurrencyAmount(comp.sundaeCost.annual, locale), 130, yPos, locale);

      doc.setTextColor(22, 163, 74);
      setPdfFont(doc, locale, 'bold');
      renderPdfText(doc, formatCurrencyAmount(comp.savings.firstYear, locale), pageWidth - 30, yPos, locale, { align: 'right' });

      yPos += 6;
      doc.setFontSize(7);
      doc.setTextColor(100, 116, 139);
      setPdfFont(doc, locale, 'normal');
      renderPdfText(
        doc,
        `${getLocalizedCompetitorCategory(locale, comp.competitor.category)} • ${copy.verifiedLabel}`,
        25,
        yPos,
        locale
      );

      setPdfFont(doc, locale, 'normal');
      doc.setTextColor(30, 41, 59);
      yPos += 8;
    });

    if (savingsComparisons[0]) {
      yPos += 5;
      doc.setFillColor(220, 252, 231);
      doc.roundedRect(20, yPos - 3, pageWidth - 40, 15, 2, 2, 'F');

      doc.setTextColor(22, 163, 74);
      doc.setFontSize(11);
      setPdfFont(doc, locale, 'bold');
      renderPdfText(
        doc,
        `${copy.bestSavingsLabel}: $${savingsComparisons[0].savings.firstYear.toLocaleString(locale)}/${copy.perYearLabel} ${copy.vsLabel} ${savingsComparisons[0].competitor.name}`,
        pageWidth / 2,
        yPos + 7,
        locale,
        { align: 'center' }
      );
      yPos += 18;
    }

    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    setPdfFont(doc, locale, 'normal');
    renderPdfText(doc, copy.competitorDisclaimer, 20, yPos, locale);
  }

  // Footer on all pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);

    doc.setDrawColor(203, 213, 225);
    doc.line(20, pageHeight - 20, pageWidth - 20, pageHeight - 20);

    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    setPdfFont(doc, locale, 'normal');
    renderPdfText(doc, `${LEGAL.legalName} | sundae.io`, 20, pageHeight - 12, locale);
    renderPdfText(doc, `${copy.quoteLabel} ${quoteId}`, pageWidth / 2, pageHeight - 12, locale, { align: 'center' });
    renderPdfText(doc, `${copy.pageLabel} ${i.toLocaleString(locale)} ${copy.ofLabel} ${totalPages.toLocaleString(locale)}`, pageWidth - 20, pageHeight - 12, locale, { align: 'right' });

    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    renderPdfText(
      doc,
      `${copy.informationalOnlyLabel} ${LEGAL.legalName} — ${copy.formalProposalLabel}`,
      pageWidth / 2,
      pageHeight - 6,
      locale,
      { align: 'center' }
    );
  }

  return doc.output('blob');
}
