import { jsPDF } from 'jspdf';
import { TravelerRecord, MobilizationFormData } from '../types';
import { drawDaewooLogoInPdf } from '../assets/daewooLogo';
import { extractMobilizationDataFromTraveler, formatNameFirstSurnameLast } from './mobilizationDataExtractor';
import { DEFAULT_SIGNATURE_NAME, ERIC_MATOLA_SIGNATURE_BASE64 } from '../assets/signature';

/**
 * Draws the official TAF signature (image or cursive flourish) with printed name and date
 */
function drawMobilizationSignature(
  doc: jsPDF,
  x: number,
  y: number,
  w: number,
  h: number,
  name: string,
  sigImageBase64?: string,
  dateText?: string
) {
  let drewImage = false;
  if (sigImageBase64) {
    try {
      const sigW = Math.min(w - 2, 18);
      const sigH = Math.min(h - 2.8, 6.2);
      const imgX = x + (w - sigW) / 2;
      const imgY = y + 0.6;
      doc.addImage(sigImageBase64, 'JPEG', imgX, imgY, sigW, sigH);
      drewImage = true;
    } catch {
      drewImage = false;
    }
  }

  if (!drewImage) {
    doc.setDrawColor(20, 35, 95); // Royal blue ink
    doc.setLineWidth(0.3);
    const midX = x + w / 2;
    const midY = y + h / 2 - 1;
    doc.lines([
      [2.5, -1.5],
      [1.5, 1],
      [2, -1.5],
      [3, 1.5],
      [-4, 1.5],
      [6, 0.5],
      [5, -1]
    ], midX - 5, midY, [0.6, 0.6]);

    doc.setFont('helvetica', 'italic');
    doc.setFontSize(5.5);
    doc.setTextColor(30, 45, 95);
    doc.text(name || DEFAULT_SIGNATURE_NAME, midX, y + h - 2.2, { align: 'center' });
  }

  if (dateText) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(4.6);
    doc.setTextColor(80, 80, 80);
    doc.text(dateText, x + w / 2, y + h - 0.6, { align: 'center' });
    doc.setTextColor(0, 0, 0);
  }
}

/**
 * Draws text fitted within maximum width with automatic font size scaling
 */
function drawFittedText(
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  align: 'left' | 'center' | 'right' = 'center',
  baseFontSize: number = 8,
  minFontSize: number = 5.5
) {
  if (!text) return;
  const clean = String(text).trim();
  if (!clean) return;

  let currentSize = baseFontSize;
  doc.setFontSize(currentSize);
  let textWidth = doc.getTextWidth(clean);

  while (textWidth > maxWidth - 1.5 && currentSize > minFontSize) {
    currentSize -= 0.3;
    doc.setFontSize(currentSize);
    textWidth = doc.getTextWidth(clean);
  }

  let finalText = clean;
  if (textWidth > maxWidth - 0.8) {
    while (finalText.length > 3 && doc.getTextWidth(finalText + '...') > maxWidth - 0.8) {
      finalText = finalText.slice(0, -1);
    }
    finalText += '...';
  }

  let drawX = x;
  if (align === 'center') {
    drawX = x + maxWidth / 2;
  } else if (align === 'right') {
    drawX = x + maxWidth - 1.5;
  } else {
    drawX = x + 1.5;
  }

  doc.text(finalText, drawX, y, { align });
  doc.setFontSize(baseFontSize);
}

/**
 * Renders a complete single-page Mozambique Mobilization Form on an existing jsPDF document.
 * Exactly replicates the physical Mobilization_Form_2c6f7c7a.pdf template.
 */
export function renderMobilizationPage(doc: jsPDF, travelerOrData: TravelerRecord | MobilizationFormData): void {
  const rawData: MobilizationFormData =
    'applicantName' in travelerOrData
      ? (travelerOrData as MobilizationFormData)
      : extractMobilizationDataFromTraveler(travelerOrData as TravelerRecord);

  const data: MobilizationFormData = {
    ...rawData,
    applicantName: formatNameFirstSurnameLast(rawData.applicantName)
  };

  // Layout Boundaries (A4: 210 x 297 mm)
  const startX = 20;
  const startY = 24;
  const tableWidth = 170;

  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.28);

  // -------------------------------------------------------------
  // 1. TOP HEADER & APPROVAL BOXES
  // -------------------------------------------------------------
  const titleBoxW = 78;
  const headerH = 18;

  // Title Box (Left)
  doc.setFillColor(224, 230, 236); // Soft blue-grey header background
  doc.rect(startX, startY, titleBoxW, headerH, 'FD');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(14);
  doc.setTextColor(20, 25, 35);
  doc.text('Mobilization Form', startX + titleBoxW / 2, startY + 11.5, { align: 'center' });

  // 4 Approval Columns (Right): Total width = 92mm (23mm each)
  const appColW = 23;
  const appColHeaders = ['Applicant', 'HR Manager', 'Admin. Manager', 'PM'];
  const appX = startX + titleBoxW;

  // Draw approval column headers
  for (let i = 0; i < 4; i++) {
    const colX = appX + i * appColW;
    // Header box (height 6.5mm)
    doc.setFillColor(255, 255, 255);
    doc.rect(colX, startY, appColW, 6.5, 'S');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(0, 0, 0);
    doc.text(appColHeaders[i], colX + appColW / 2, startY + 4.8, { align: 'center' });

    // Signature box below (height 11.5mm) - KEEP BLANK FOR APPROVAL (no signature on top)
    doc.rect(colX, startY + 6.5, appColW, 11.5, 'S');

    // ONLY the PM box has pre-printed "N/A". Applicant, HR Manager, and Admin. Manager remain blank
    if (i === 3) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.0);
      doc.setTextColor(0, 0, 0);
      doc.text(data.pmApproval || 'N/A', colX + appColW / 2, startY + 13.8, { align: 'center' });
    }
  }

  // -------------------------------------------------------------
  // 2. DATE ROW
  // -------------------------------------------------------------
  const dateY = startY + headerH;
  const dateH = 8.5;
  doc.rect(startX, dateY, tableWidth, dateH, 'S');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(0, 0, 0);
  doc.text(`Date:    ${data.formDate || data.signatureDate || ''}`, startX + 2, dateY + 5.8);

  // -------------------------------------------------------------
  // 3. APPLICANT DETAILS TABLE
  // -------------------------------------------------------------
  const appSectionY = dateY + dateH;
  const rowH = 8.0;
  const numAppRows = 7;
  const appSectionH = rowH * numAppRows; // 56.0 mm

  const col1W = 20;
  const col2W = 28;
  const col3W = 54;
  const col4W = 23;
  const col5W = 23;
  const col6W = 22;

  // Background for Field Label & Value columns (Light Sage Green as in PDF)
  doc.setFillColor(236, 243, 234);
  doc.rect(startX + col1W, appSectionY, col2W + col3W, appSectionH, 'F');

  // Merged Column 1: "Applicant"
  doc.rect(startX, appSectionY, col1W, appSectionH, 'S');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(0, 0, 0);
  doc.text('Applicant', startX + col1W / 2, appSectionY + appSectionH / 2 + 1, { align: 'center' });

  const applicantFields = [
    { label: 'Name', val: data.applicantName },
    { label: 'Position', val: data.position },
    { label: 'Department', val: data.department },
    { label: 'Site', val: data.site },
    { label: 'Nationality', val: data.nationality },
    { label: 'ID No.', val: data.idNumber },
    { label: 'Arrival Date', val: data.arrivalDate || data.formDate || data.signatureDate }
  ];

  for (let r = 0; r < numAppRows; r++) {
    const rY = appSectionY + r * rowH;

    // Field Label (Col 2)
    doc.rect(startX + col1W, rY, col2W, rowH, 'S');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.0);
    doc.text(applicantFields[r].label, startX + col1W + 2, rY + 5.2);

    // Field Value (Col 3)
    doc.rect(startX + col1W + col2W, rY, col3W, rowH, 'S');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.0);
    drawFittedText(
      doc,
      applicantFields[r].val || '',
      startX + col1W + col2W,
      rY + 5.2,
      col3W,
      'left',
      8.0,
      6.0
    );

    // Additional 3 columns matching the approval columns above (leave blank)
    const x4 = startX + col1W + col2W + col3W;
    doc.rect(x4, rY, col4W, rowH, 'S');
    doc.rect(x4 + col4W, rY, col5W, rowH, 'S');
    doc.rect(x4 + col4W + col5W, rY, col6W, rowH, 'S');
  }

  // -------------------------------------------------------------
  // 4. TRAVEL ROUTE SECTION
  // -------------------------------------------------------------
  const routeSectionY = appSectionY + appSectionH;
  const routeHeaderH = 7.2;
  const routeColH = 7.2;
  const routeRowH = 8.0;
  const numRouteRows = 5;
  const routeTotalH = routeHeaderH + routeColH + numRouteRows * routeRowH;

  // Left Merged Column: "Travel Route" (20mm wide)
  doc.rect(startX, routeSectionY, col1W, routeTotalH, 'S');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.2);
  doc.text('Travel Route', startX + col1W / 2, routeSectionY + routeTotalH / 2 + 1, { align: 'center' });

  // Top Subheader spanning across: "Departure"
  const routeDataW = tableWidth - col1W; // 150mm
  doc.setFillColor(245, 247, 249);
  doc.rect(startX + col1W, routeSectionY, routeDataW, routeHeaderH, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.2);
  doc.text('Departure', startX + col1W + routeDataW / 2, routeSectionY + 4.8, { align: 'center' });

  // Route Columns: Date, Origin, ETD, Destination, ETA (Total = 150mm matching 170mm - 20mm)
  const rCols = [
    { title: 'Date', w: 28, align: 'center' as const },
    { title: 'Origin', w: 34, align: 'center' as const },
    { title: 'ETD', w: 22, align: 'center' as const },
    { title: 'Destination', w: 44, align: 'center' as const },
    { title: 'ETA', w: 22, align: 'center' as const }
  ];

  const colY = routeSectionY + routeHeaderH;
  let currX = startX + col1W;
  for (const c of rCols) {
    doc.rect(currX, colY, c.w, routeColH, 'S');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.6);
    doc.text(c.title, currX + c.w / 2, colY + 4.8, { align: 'center' });
    currX += c.w;
  }

  // 5 Route Data Rows
  const routes = data.routes || [];
  for (let r = 0; r < numRouteRows; r++) {
    const rowY = colY + routeColH + r * routeRowH;
    const item = routes[r] || { date: '', origin: '', etd: '', destination: '', eta: '' };

    let rx = startX + col1W;
    const rowValues = [item.date, item.origin, item.etd, item.destination, item.eta];

    for (let c = 0; c < rCols.length; c++) {
      const col = rCols[c];
      doc.rect(rx, rowY, col.w, routeRowH, 'S');

      if (rowValues[c]) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.8);
        drawFittedText(doc, rowValues[c], rx, rowY + 5.2, col.w, 'center', 7.8, 5.8);
      }
      rx += col.w;
    }
  }

  // -------------------------------------------------------------
  // 5. FOR ADMINISTRATION DEPARTMENT USE ONLY
  // -------------------------------------------------------------
  const adminY = routeSectionY + routeTotalH;
  const adminTitleH = 7.2;
  const adminColH = 7.2;
  const adminRowH = 9.8;

  // Title Row
  doc.setFillColor(245, 247, 249);
  doc.rect(startX, adminY, tableWidth, adminTitleH, 'FD');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.2);
  doc.setTextColor(0, 0, 0);
  doc.text('For Administration Department Use Only', startX + tableWidth / 2, adminY + 5.0, { align: 'center' });

  // Column Headers: Nos, Description, Mark, Name, Signature (Total = 170mm)
  const adminCols = [
    { title: 'Nos', w: 20 },
    { title: 'Description', w: 78 },
    { title: 'Mark', w: 24 },
    { title: 'Name', w: 24 },
    { title: 'Signature', w: 24 }
  ];

  const adminHeaderY = adminY + adminTitleH;
  let ax = startX;
  for (const c of adminCols) {
    doc.rect(ax, adminHeaderY, c.w, adminColH, 'S');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.6);
    doc.text(c.title, ax + c.w / 2, adminHeaderY + 4.8, { align: 'center' });
    ax += c.w;
  }

  // 3 Check Rows
  const checkItems = [
    {
      no: 'Check 1',
      desc: '- Is the application correct according to an\n  employment agreement?',
      check: data.check1
    },
    {
      no: 'Check 2',
      desc: '- Is the notice period correct?',
      check: data.check2
    },
    {
      no: 'Check 3',
      desc: '- Is the route appropriate ?',
      check: data.check3
    }
  ];

  for (let i = 0; i < 3; i++) {
    const item = checkItems[i];
    const rY = adminHeaderY + adminColH + i * adminRowH;

    // Nos
    doc.rect(startX, rY, adminCols[0].w, adminRowH, 'S');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.text(item.no, startX + adminCols[0].w / 2, rY + 6.0, { align: 'center' });

    // Description
    const xDesc = startX + adminCols[0].w;
    doc.rect(xDesc, rY, adminCols[1].w, adminRowH, 'S');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.0);
    if (i === 0) {
      doc.text('- Is the application correct according to an', xDesc + 2, rY + 3.8);
      doc.text('  employment agreement?', xDesc + 2, rY + 7.4);
    } else {
      doc.text(item.desc, xDesc + 2, rY + 6.0);
    }

    // Mark (defaults to X if not set)
    const xMark = xDesc + adminCols[1].w;
    doc.rect(xMark, rY, adminCols[2].w, adminRowH, 'S');
    const markVal = item.check?.mark || 'X';
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.0);
    doc.setTextColor(0, 0, 0);
    doc.text(markVal, xMark + adminCols[2].w / 2, rY + 6.0, { align: 'center' });

    // Name (defaults to TAF signatureName / Eric Matola)
    const xName = xMark + adminCols[2].w;
    doc.rect(xName, rY, adminCols[3].w, adminRowH, 'S');
    const checkName = item.check?.name || data.signatureName || DEFAULT_SIGNATURE_NAME;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.2);
    drawFittedText(doc, checkName, xName, rY + 6.0, adminCols[3].w, 'center', 7.2, 5.2);

    // Signature: MUST ONLY BE ON FOR ADMINISTRATION USE ONLY (same as TAF: Eric Matola)
    const xSig = xName + adminCols[3].w;
    doc.rect(xSig, rY, adminCols[4].w, adminRowH, 'S');
    const checkSigDate = item.check?.signatureDate || data.signatureDate || data.formDate || '';
    drawMobilizationSignature(
      doc,
      xSig,
      rY,
      adminCols[4].w,
      adminRowH,
      checkName,
      data.signatureImage || ERIC_MATOLA_SIGNATURE_BASE64,
      checkSigDate
    );
  }

  // -------------------------------------------------------------
  // 6. BOTTOM DAEWOO E&C LOGO (Right-aligned at bottom as requested)
  // -------------------------------------------------------------
  const logoW = 58;
  const logoH = 9.2; // Native aspect ratio of official Daewoo E&C image (310x49)
  const logoX = startX + tableWidth - logoW; // Right side bottom
  const logoY = adminHeaderY + adminColH + 3 * adminRowH + 16;

  drawDaewooLogoInPdf(doc, logoX, logoY, logoW, logoH);
}

/**
 * Creates a standalone jsPDF document containing the Mobilization Form
 */
export function createMobilizationPdf(travelerOrData: TravelerRecord | MobilizationFormData): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true
  });

  renderMobilizationPage(doc, travelerOrData);
  return doc;
}

/**
 * Generates Blob for Mobilization Form
 */
export function generateMobilizationPdfBlob(traveler: TravelerRecord): Blob {
  const doc = createMobilizationPdf(traveler);
  return doc.output('blob');
}

/**
 * Generates a multi-page PDF with all Mobilization Forms combined
 */
export function generateCombinedMobilizationPdf(travelers: TravelerRecord[]): jsPDF {
  if (travelers.length === 0) {
    throw new Error('No travelers provided');
  }

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true
  });

  travelers.forEach((traveler, index) => {
    if (index > 0) {
      doc.addPage('a4', 'portrait');
    }
    renderMobilizationPage(doc, traveler);
  });

  return doc;
}

/**
 * Downloads a single Mobilization Form PDF
 */
export function downloadSingleMobilizationPdf(traveler: TravelerRecord): void {
  const data = extractMobilizationDataFromTraveler(traveler);
  const cleanName = data.applicantName.replace(/[^a-zA-Z0-9_\-]/g, '_').replace(/_+/g, '_');
  const fileName = `Mobilization_${cleanName || 'Form'}.pdf`;
  const doc = createMobilizationPdf(data);
  doc.save(fileName);
}

/**
 * Downloads all Mobilization Forms in a single combined PDF
 */
export function downloadCombinedMobilizationPdf(travelers: TravelerRecord[]): void {
  if (travelers.length === 0) return;
  const doc = generateCombinedMobilizationPdf(travelers);
  const timestamp = new Date().toISOString().slice(0, 10);
  doc.save(`Mobilization_Batch_${travelers.length}_Travelers_${timestamp}.pdf`);
}
