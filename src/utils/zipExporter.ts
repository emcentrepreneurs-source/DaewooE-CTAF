import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { TravelerRecord } from '../types';
import { createTafPdf, generateMultiPagePdf } from './pdfGenerator';

// Sanitize filename
function cleanFileName(str: string): string {
  return str.replace(/[^a-zA-Z0-9_\-]/g, '_').replace(/_+/g, '_');
}

export async function exportTravelersToZip(
  travelers: TravelerRecord[],
  onProgress?: (current: number, total: number, travelerName: string) => void
): Promise<void> {
  if (travelers.length === 0) {
    throw new Error('No travelers selected for export.');
  }

  const zip = new JSZip();
  const folder = zip.folder('CCSJV_TAF_Forms');
  const total = travelers.length;

  for (let i = 0; i < total; i++) {
    const traveler = travelers[i];
    const namePart = cleanFileName(`${traveler.companyId || (i + 1)}_${traveler.surname}_${traveler.nameAndGender.split('/')[0]}`.trim());
    const fileName = `TAF_${namePart || `Traveler_${i + 1}`}.pdf`;

    if (onProgress) {
      onProgress(i + 1, total, `${traveler.surname} ${traveler.nameAndGender.split('/')[0]}`);
    }

    // Give UI thread a tiny break to render progress
    await new Promise((resolve) => setTimeout(resolve, 10));

    const doc = createTafPdf(traveler);
    const pdfBlob = doc.output('blob');
    if (folder) {
      folder.file(fileName, pdfBlob);
    }
  }

  const timestamp = new Date().toISOString().slice(0, 10);
  const zipBlob = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 }
  });

  saveAs(zipBlob, `CCSJV_TAF_Batch_${travelers.length}_Travelers_${timestamp}.zip`);
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
