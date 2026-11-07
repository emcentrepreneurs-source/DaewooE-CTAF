import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { TravelerRecord } from '../types';
import { createTafPdf, generateMultiPagePdf } from './pdfGenerator';
import { createMobilizationPdf, generateCombinedMobilizationPdf } from './mobilizationPdfGenerator';
import { extractMobilizationDataFromTraveler } from './mobilizationDataExtractor';

// Sanitize filename
function cleanFileName(str: string): string {
  return str.replace(/[^a-zA-Z0-9_\-]/g, '_').replace(/_+/g, '_');
}

export interface ZipExportOptions {
  includeTaf?: boolean;
  includeMobilization?: boolean;
}

export async function exportTravelersToZip(
  travelers: TravelerRecord[],
  onProgress?: (current: number, total: number, travelerName: string) => void,
  options: ZipExportOptions = { includeTaf: true, includeMobilization: false }
): Promise<void> {
  if (travelers.length === 0) {
    throw new Error('No travelers selected for export.');
  }

  const { includeTaf = true, includeMobilization = false } = options;

  if (!includeTaf && !includeMobilization) {
    throw new Error('Please select at least one form type (TAF or Mobilization) to export.');
  }

  const zip = new JSZip();
  const tafFolder = includeTaf ? zip.folder('01_CCSJV_TAF_Forms') : null;
  const mobFolder = includeMobilization ? zip.folder('02_Daewoo_Mobilization_Forms') : null;
  const total = travelers.length;

  for (let i = 0; i < total; i++) {
    const traveler = travelers[i];
    const namePart = cleanFileName(`${traveler.companyId || (i + 1)}_${traveler.surname}_${traveler.nameAndGender.split('/')[0]}`.trim());

    if (onProgress) {
      onProgress(i + 1, total, `${traveler.surname} ${traveler.nameAndGender.split('/')[0]}`);
    }

    // Give UI thread a tiny break to render progress
    await new Promise((resolve) => setTimeout(resolve, 10));

    // 1. TAF Form
    if (includeTaf && tafFolder) {
      const tafDoc = createTafPdf(traveler);
      const tafBlob = tafDoc.output('blob');
      tafFolder.file(`TAF_${namePart || `Traveler_${i + 1}`}.pdf`, tafBlob);
    }

    // 2. Mobilization Form (Separate PDF with full Moz legal data)
    if (includeMobilization && mobFolder) {
      const mobData = extractMobilizationDataFromTraveler(traveler);
      const mobNamePart = cleanFileName(`${traveler.companyId || (i + 1)}_${mobData.applicantName}`);
      const mobDoc = createMobilizationPdf(mobData);
      const mobBlob = mobDoc.output('blob');
      mobFolder.file(`Mobilization_${mobNamePart || `Traveler_${i + 1}`}.pdf`, mobBlob);
    }
  }

  const timestamp = new Date().toISOString().slice(0, 10);
  const zipBlob = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 }
  });

  let prefix = 'CCSJV_TAF_';
  if (includeTaf && includeMobilization) {
    prefix = 'CCSJV_TAF_and_Mobilization_';
  } else if (includeMobilization) {
    prefix = 'Daewoo_Mobilization_';
  }

  saveAs(zipBlob, `${prefix}Batch_${travelers.length}_Travelers_${timestamp}.zip`);
}

export function downloadSinglePdf(traveler: TravelerRecord): void {
  const namePart = cleanFileName(`${traveler.companyId || 'TAF'}_${traveler.surname}_${traveler.nameAndGender.split('/')[0]}`.trim());
  const fileName = `TAF_${namePart || 'Form'}.pdf`;
  const doc = createTafPdf(traveler);
  doc.save(fileName);
}

export function downloadCombinedPdf(travelers: TravelerRecord[]): void {
  if (travelers.length === 0) return;
  const doc = generateMultiPagePdf(travelers);
  const timestamp = new Date().toISOString().slice(0, 10);
  doc.save(`CCSJV_Combined_TAF_${travelers.length}_Travelers_${timestamp}.pdf`);
}

export function downloadCombinedMobilization(travelers: TravelerRecord[]): void {
  if (travelers.length === 0) return;
  const doc = generateCombinedMobilizationPdf(travelers);
  const timestamp = new Date().toISOString().slice(0, 10);
  doc.save(`Daewoo_Combined_Mobilization_${travelers.length}_Travelers_${timestamp}.pdf`);
}
