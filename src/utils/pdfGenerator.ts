import { jsPDF } from 'jspdf';
import { TravelerRecord } from '../types';
import { CCS_JV_LOGO_BASE64 } from '../assets/logo';
import { ERIC_MATOLA_SIGNATURE_BASE64, DEFAULT_SIGNATURE_NAME } from '../assets/signature';

/**
 * Draws text fitted within a maximum width by dynamically reducing font size if necessary.
 * Prevents any text from bleeding outside borders or overlapping adjacent words/columns.
 */
function drawFittedText(
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  align: 'left' | 'center' | 'right' = 'center',
  baseFontSize: number = 6.8,
  minFontSize: number = 4.8
) {
  if (!text) return;
  const cleanText = String(text).trim();
  if (!cleanText) return;

  let currentFontSize = baseFontSize;
  doc.setFontSize(currentFontSize);
  let textWidth = doc.getTextWidth(cleanText);

  // Scale down font size if text exceeds the available width with padding
  while (textWidth > maxWidth - 1.5 && currentFontSize > minFontSize) {
    currentFontSize -= 0.3;
    doc.setFontSize(currentFontSize);
    textWidth = doc.getTextWidth(cleanText);
  }

  // If still too wide at minimum font size, truncate with ellipsis
  let finalText = cleanText;
  if (textWidth > maxWidth - 1.0) {
    while (finalText.length > 3 && doc.getTextWidth(finalText + '...') > maxWidth - 1.0) {
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
  // Restore font size to base
  doc.setFontSize(baseFontSize);
}

/**
 * Draws a standardized grid cell with background, borders, and fitted text
 */
function drawGridCell(
  doc: jsPDF,
  x: number,
  y: number,
  w: number,
  h: number,
  text: string,
  options?: {
    isHeader?: boolean;
    fillColor?: [number, number, number];
    textColor?: [number, number, number];
    fontStyle?: 'normal' | 'bold' | 'italic';
    fontSize?: number;
    align?: 'left' | 'center' | 'right';
  }
) {
  const isHeader = options?.isHeader ?? false;
  const fillColor = options?.fillColor ?? (isHeader ? [242, 242, 242] : [255, 255, 255]);
  const textColor = options?.textColor ?? [0, 0, 0];
  const fontStyle = options?.fontStyle ?? (isHeader ? 'bold' : 'normal');
  const fontSize = options?.fontSize ?? (isHeader ? 6.2 : 6.8);
  const align = options?.align ?? 'center';

  // Draw background fill
  doc.setFillColor(fillColor[0], fillColor[1], fillColor[2]);
  doc.rect(x, y, w, h, 'F');

  // Draw border
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.2);
  doc.rect(x, y, w, h, 'S');

  // Draw text
  if (text) {
    doc.setFont('helvetica', fontStyle);
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    const textY = y + h / 2 + (fontSize * 0.35) * 0.3527 + 0.3;
    drawFittedText(doc, text, x, textY, w, align, fontSize, 4.5);
  }
}

/**
 * Creates the official CCS JV TAF PDF for a single traveler.
 * Guaranteed to fit perfectly on a single A4 page with crystal-clear formatting.
 */
export function createTafPdf(traveler: TravelerRecord): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true
  });

  renderTafPage(doc, traveler);
  return doc;
}

/**
 * Renders the entire TAF Form on the current page of the jsPDF instance.
 */
function renderTafPage(doc: jsPDF, traveler: TravelerRecord) {
  const pageWidth = 210;
  const leftMargin = 12;
  const contentWidth = 186; // 210 - 24 = 186 mm
  let y = 7.0;

  // 1. CCS JV LOGO (Centered, natural 2.804:1 uncompressed aspect ratio)
  const logoW = 46;
  const logoH = 16.4;
  drawCcsJvLogo(doc, (pageWidth - logoW) / 2, y, logoW, logoH);
  y += logoH + 2.5;

  // 2. MAIN FORM TITLE
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12.5);
  doc.setTextColor(0, 0, 0);
  doc.text('TRAVEL & ACCOMMODATION REQUEST-SITE TRAVEL', pageWidth / 2, y + 3.5, { align: 'center' });
  y += 5.5;

  // 3. INSTRUCTION PARAGRAPH
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.8);
  doc.setTextColor(0, 0, 0);

  const subText1 = 'This form is required for all CCS JV employees/sub contractors. Complete the form, attach your passport and send to CCSJV at a minimum of ';
  const subText2 = '10 business days for charter flights.';
  
  const fullNotice = subText1 + subText2;
  const noticeWidth = doc.getTextWidth(fullNotice);
  const startNoticeX = (pageWidth - noticeWidth) / 2;

  doc.text(subText1, startNoticeX, y + 2.5);
  const subText1Width = doc.getTextWidth(subText1);
  doc.setTextColor(220, 20, 20); // Red
  doc.text(subText2, startNoticeX + subText1Width, y + 2.5);

  y += 3.8;
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.text(
    'If this form is not properly completed and fully approved CCS JV travel team will not proceed with any booking.',
    pageWidth / 2,
    y + 2.2,
    { align: 'center' }
  );

  y += 4.2;

  // 4. TOP HEADER BLOCKS: Luggage Banner & Emergency Info (Left) + Office Use / Class (Right)
  const leftBlockW = 134;
  const rightBlockX = leftMargin + leftBlockW + 3; // 12 + 134 + 3 = 149
  const rightBlockW = contentWidth - leftBlockW - 3; // 186 - 137 = 49 mm

  // Left Top: Green Luggage Box
  const luggageY = y;
  const luggageHeight = 5.2;
  doc.setFillColor(141, 198, 63); // CCS Green #8DC63F
  doc.rect(leftMargin, luggageY, leftBlockW, luggageHeight, 'F');
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.2);
  doc.rect(leftMargin, luggageY, leftBlockW, luggageHeight, 'S');

  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(5.8);
  const luggageText = 'Luggage allowance: Maputo/Pemba-Afungi-Pemba/Maputo on charter flight 1 piece 23kg check-in and 1 piece 5kg carry-on/ Pemba-Afungi-Pemba.';
  drawFittedText(doc, luggageText, leftMargin + 1, luggageY + 3.7, leftBlockW - 2, 'left', 5.8, 5.0);

  // Left Bottom: Yellow Emergency Contact Box
  const emergencyY = luggageY + luggageHeight + 1.2;
  const emergencyW = 86;
  const emergencyH = 14.5;
  doc.setFillColor(255, 242, 0); // Yellow #FFF200
  doc.rect(leftMargin, emergencyY, emergencyW, emergencyH, 'F');
  doc.rect(leftMargin, emergencyY, emergencyW, emergencyH, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(0, 0, 0);
  doc.text('CCSJV Emergency Contact Info', leftMargin + emergencyW / 2, emergencyY + 3.2, { align: 'center' });
  doc.line(leftMargin, emergencyY + 4.2, leftMargin + emergencyW, emergencyY + 4.2);

  doc.setFontSize(6.2);
  doc.text('TRAVEL: +258 841300027', leftMargin + emergencyW / 2, emergencyY + 7.6, { align: 'center' });
  doc.line(leftMargin, emergencyY + 9.0, leftMargin + emergencyW, emergencyY + 9.0);

  doc.text('Security: Hendrik Theron +258 843312798', leftMargin + emergencyW / 2, emergencyY + 12.6, { align: 'center' });

  // Right Top: Office Use & Class Type Box
  const officeH = 4.5;
  const classH = 4.5;
  const ecoH = 5.7;

  // Office Use Row
  drawGridCell(doc, rightBlockX, luggageY, rightBlockW, officeH, 'Office Use', {
    isHeader: true,
    fillColor: [255, 255, 255],
    fontSize: 6.8,
    align: 'center'
  });

  // Class Type Row
  drawGridCell(doc, rightBlockX, luggageY + officeH, rightBlockW, classH, 'CLASS TYPE', {
    isHeader: true,
    fillColor: [255, 255, 255],
    fontSize: 6.8,
    align: 'center'
  });

  // Economy (Left) | YES (Right)
  const ecoHalfW = rightBlockW / 2;
  drawGridCell(doc, rightBlockX, luggageY + officeH + classH, ecoHalfW, ecoH, 'Economy', {
    isHeader: false,
    fillColor: [255, 255, 255],
    fontSize: 6.8,
    align: 'center'
  });
  drawGridCell(doc, rightBlockX + ecoHalfW, luggageY + officeH + classH, ecoHalfW, ecoH, 'YES', {
    isHeader: false,
    fillColor: [255, 242, 0], // Yellow
    fontStyle: 'bold',
    fontSize: 7.2,
    align: 'center'
  });

  y = emergencyY + emergencyH + 2.2;

  // ==========================================
  // SECTION 1 - TRAVELER INFORMATION
  // ==========================================
  const bannerH = 4.5;
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.25);
  doc.rect(leftMargin, y, contentWidth, bannerH, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.2);
  doc.setTextColor(220, 20, 20); // Red
  doc.text(
    'SECTION 1 - TRAVELER INFORMATION (to be filled by the traveler/travel arranger)',
    pageWidth / 2,
    y + 3.2,
    { align: 'center' }
  );

  y += bannerH;

  // Row 1: SURNAME | NAME / GENDER | FINAL DESTINATION | ROTATION TYPE
  const colW1 = [48, 58, 40, 40]; // Sum = 186
  const headers1 = ['SURNAME', 'NAME / GENDER', 'FINAL DESTINATION', 'ROTATION TYPE'];
  
  let curX = leftMargin;
  for (let i = 0; i < 4; i++) {
    drawGridCell(doc, curX, y, colW1[i], 4.5, headers1[i], {
      isHeader: true,
      fillColor: [0, 0, 0],
      textColor: [255, 255, 255],
      fontSize: 6.2
    });
    curX += colW1[i];
  }
  y += 4.5;

  const values1 = [
    traveler.surname || '',
    traveler.nameAndGender || '',
    traveler.finalDestination || 'Afungi',
    traveler.rotationType || 'Mobilization'
  ];

  curX = leftMargin;
  for (let i = 0; i < 4; i++) {
    drawGridCell(doc, curX, y, colW1[i], 5.5, values1[i], {
      fontStyle: 'italic',
      fontSize: 6.8
    });
    curX += colW1[i];
  }
  y += 5.5;

  // PURPOSE OF TRIP Header
  drawGridCell(doc, leftMargin, y, contentWidth, 4.2, 'PURPOSE OF TRIP', {
    isHeader: true,
    fillColor: [242, 242, 242],
    fontSize: 6.8
  });
  y += 4.2;

  // 6 Checkboxes in 2 rows of 3
  const purposeList: { label: string; key: string }[][] = [
    [
      { label: 'Business Trip', key: 'Business Trip' },
      { label: 'Rotational Leave', key: 'Rotational Leave' },
      { label: 'Mobilization', key: 'Mobilization' }
    ],
    [
      { label: 'Emergency Leave', key: 'Emergency Leave' },
      { label: 'Visa Application', key: 'Visa Application' },
      { label: 'Demobilization', key: 'Demobilization' }
    ]
  ];

  const pColW = contentWidth / 3; // 62 mm each
  const pRowH = 4.8;

  for (let r = 0; r < 2; r++) {
    for (let c = 0; c < 3; c++) {
      const cellX = leftMargin + c * pColW;
      const cellY = y + r * pRowH;
      const item = purposeList[r][c];

      // Draw cell outline
      doc.setFillColor(255, 255, 255);
      doc.rect(cellX, cellY, pColW, pRowH, 'F');
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.2);
      doc.rect(cellX, cellY, pColW, pRowH, 'S');

      // Label text
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.2);
      doc.setTextColor(0, 0, 0);
      doc.text(item.label, cellX + 4, cellY + 3.3);

      // Checkbox square
      const boxSize = 3.2;
      const boxX = cellX + pColW - 10;
      const boxY = cellY + (pRowH - boxSize) / 2;
      doc.rect(boxX, boxY, boxSize, boxSize, 'S');

      // Blue X if active
      const isSelected = traveler.purposeOfTrip?.toLowerCase() === item.key.toLowerCase();
      if (isSelected) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.5);
        doc.setTextColor(0, 70, 180); // Blue X
        doc.text('X', boxX + boxSize / 2, boxY + boxSize - 0.6, { align: 'center' });
      }
    }
  }
  y += 2 * pRowH;

  // Grid 2: COMPANY ID | COMPANY | PROJECT POSITION / JOB TITLE | PROJECT DEPARTMENT
  const colW2 = [38, 42, 58, 48]; // Sum = 186
  const headers2 = ['COMPANY ID', 'COMPANY', 'PROJECT POSITION / JOB TITLE', 'PROJECT DEPARTMENT'];

  curX = leftMargin;
  for (let i = 0; i < 4; i++) {
    drawGridCell(doc, curX, y, colW2[i], 4.5, headers2[i], {
      isHeader: true,
      fillColor: [242, 242, 242],
      fontSize: 6.2
    });
    curX += colW2[i];
  }
  y += 4.5;

  const values2 = [
    traveler.companyId || '',
    traveler.company || '',
    traveler.projectPosition || '',
    traveler.projectDepartment || ''
  ];

  curX = leftMargin;
  for (let i = 0; i < 4; i++) {
    drawGridCell(doc, curX, y, colW2[i], 5.5, values2[i], {
      fontSize: 6.8
    });
    curX += colW2[i];
  }
  y += 5.5;

  // Grid 3: MOBILE NUMBER | EMAIL ADDRESS | SUBSTITUTE IN MY ABSENCE | FREQUENT FLYER CARD
  const colW3 = [42, 58, 48, 38]; // Sum = 186
  const headers3 = ['MOBILE NUMBER', 'EMAIL ADDRESS', 'SUBSTITUTE IN MY ABSENCE', 'FREQUENT FLYER CARD'];

  curX = leftMargin;
  for (let i = 0; i < 4; i++) {
    drawGridCell(doc, curX, y, colW3[i], 4.5, headers3[i], {
      isHeader: true,
      fillColor: [242, 242, 242],
      fontSize: 6.2
    });
    curX += colW3[i];
  }
  y += 4.5;

  const values3 = [
    traveler.mobileNumber || '',
    traveler.emailAddress || '',
    traveler.substituteInAbsence || '',
    traveler.frequentFlyerCard || 'N/A'
  ];

  curX = leftMargin;
  for (let i = 0; i < 4; i++) {
    const isEmail = i === 1;
    drawGridCell(doc, curX, y, colW3[i], 5.5, values3[i], {
      fillColor: isEmail && traveler.emailAddress ? [255, 255, 200] : [255, 255, 255],
      textColor: isEmail && traveler.emailAddress ? [0, 50, 180] : [0, 0, 0],
      fontSize: 6.5
    });
    curX += colW3[i];
  }
  y += 5.5;

  // Grid 4: PASSPORT/ NATIONAL ID NUMBER | DATE OF BIRTH | NATIONALITY | PASSPORT EXPIRY DATE
  const colW4 = [50, 42, 46, 48]; // Sum = 186
  const headers4 = ['PASSPORT/ NATIONAL ID NUMBER', 'DATE OF BIRTH', 'NATIONALITY', 'PASSPORT EXPIRY DATE'];

  curX = leftMargin;
  for (let i = 0; i < 4; i++) {
    drawGridCell(doc, curX, y, colW4[i], 4.5, headers4[i], {
      isHeader: true,
      fillColor: [242, 242, 242],
      fontSize: 6.2
    });
    curX += colW4[i];
  }
  y += 4.5;

  const values4 = [
    traveler.passportOrIdNumber || '',
    traveler.dateOfBirth || '',
    traveler.nationality || '',
    traveler.passportExpiryDate || ''
  ];

  curX = leftMargin;
  for (let i = 0; i < 4; i++) {
    drawGridCell(doc, curX, y, colW4[i], 5.5, values4[i], {
      fontSize: 6.8
    });
    curX += colW4[i];
  }
  y += 7.0;

  // ==========================================
  // SECTION 2 - FLIGHT TRAVEL PLAN
  // ==========================================
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.25);
  doc.rect(leftMargin, y, contentWidth, bannerH, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.2);
  doc.setTextColor(220, 20, 20); // Red
  doc.text(
    'SECTION 2 - FLIGHT TRAVEL PLAN (to be filled by the traveler)',
    pageWidth / 2,
    y + 3.2,
    { align: 'center' }
  );
  y += bannerH;

  // Warning text
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(5.8);
  doc.setTextColor(220, 20, 20);
  const warningText = 'Flight departure to & from Maputo/Pemba and Site with less than 4 business days notification will be postponed to ensure at least 4 business days notification is given';
  doc.text(warningText, pageWidth / 2, y + 2.8, { align: 'center' });
  y += 4.0;

  // FLIGHTS & TRANSPORTATION Header Bar
  drawGridCell(doc, leftMargin, y, contentWidth, 4.2, 'FLIGHTS &TRANSPORTATION - INDICATE PREFERED FLIGHT DETAILS', {
    isHeader: true,
    fillColor: [255, 255, 255],
    fontSize: 6.5
  });
  y += 4.2;

  // Flights Table Columns
  const flightColW = [28, 30, 30, 28, 28, 42]; // Sum = 186
  const flightHeaders = ['DATE', 'FROM', 'TO', 'DEPARTURE TIME', 'ARRIVAL TIME', 'AIRLINE & FLIGHT NUMBER'];

  curX = leftMargin;
  for (let i = 0; i < 6; i++) {
    drawGridCell(doc, curX, y, flightColW[i], 4.5, flightHeaders[i], {
      isHeader: true,
      fillColor: [242, 242, 242],
      fontSize: 5.8
    });
    curX += flightColW[i];
  }
  y += 4.5;

  // 4 rows of flights
  const flightRowH = 4.8;
  for (let r = 0; r < 4; r++) {
    const flight = traveler.flights && traveler.flights[r] ? traveler.flights[r] : null;
    const fValues = flight ? [
      flight.date || '',
      flight.from || '',
      flight.to || '',
      flight.departureTime || '',
      flight.arrivalTime || '',
      flight.airlineAndFlightNo || ''
    ] : ['', '', '', '', '', ''];

    curX = leftMargin;
    for (let i = 0; i < 6; i++) {
      drawGridCell(doc, curX, y, flightColW[i], flightRowH, fValues[i], {
        fontSize: 6.5
      });
      curX += flightColW[i];
    }
    y += flightRowH;
  }
  y += 1.5;

  // ACCOMMODATION Header Bar
  drawGridCell(doc, leftMargin, y, contentWidth, 4.2, 'ACCOMMODATION - INDICATE ACCOMMODATION REQUIRED', {
    isHeader: true,
    fillColor: [255, 255, 255],
    fontSize: 6.5
  });
  y += 4.2;

  // Accommodation Table Columns
  const accColW = [30, 30, 44, 40, 42]; // Sum = 186
  const accHeaders = ['CHECK-IN', 'CHECK-OUT', 'HOTEL / CAMP', 'LOCATION', 'NOTES'];

  curX = leftMargin;
  for (let i = 0; i < 5; i++) {
    drawGridCell(doc, curX, y, accColW[i], 4.5, accHeaders[i], {
      isHeader: true,
      fillColor: [242, 242, 242],
      fontSize: 5.8
    });
    curX += accColW[i];
  }
  y += 4.5;

  // 4 rows of accommodation
  const accRowH = 4.8;
  for (let r = 0; r < 4; r++) {
    const acc = traveler.accommodation && traveler.accommodation[r] ? traveler.accommodation[r] : null;
    const aValues = acc ? [
      acc.checkIn || '',
      acc.checkOut || '',
      acc.hotelOrCamp || '',
      acc.location || '',
      acc.notes || ''
    ] : ['', '', '', '', ''];

    curX = leftMargin;
    for (let i = 0; i < 5; i++) {
      drawGridCell(doc, curX, y, accColW[i], accRowH, aValues[i], {
        fontSize: 6.5
      });
      curX += accColW[i];
    }
    y += accRowH;
  }
  y += 2.5;

  // ==========================================
  // SECTION 5 - APPROVAL SIGNATURES
  // ==========================================
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.25);
  doc.rect(leftMargin, y, contentWidth, bannerH, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.2);
  doc.setTextColor(220, 20, 20); // Red
  doc.text(
    'SECTION 5 - APPROVAL SIGNATURES (sign & print name)',
    pageWidth / 2,
    y + 3.2,
    { align: 'center' }
  );
  y += bannerH;

  // 3 Signature Columns (62mm each)
  const sigColW = contentWidth / 3;
  const sigBoxHeight = 23;

  // Column 1: Traveler
  doc.rect(leftMargin, y, sigColW, sigBoxHeight, 'S');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(0, 0, 0);
  doc.text(`Date: ${traveler.signatureDate || '06 AUGUST 2026'}`, leftMargin + 2.5, y + 4);

  // Handwritten stroke signature + printed name
  drawTravelerSignature(
    doc,
    leftMargin + (sigColW - 32) / 2,
    y + 5,
    traveler.signatureName || DEFAULT_SIGNATURE_NAME,
    traveler.signatureImage || ERIC_MATOLA_SIGNATURE_BASE64
  );

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(5.5);
  doc.setTextColor(0, 0, 0);
  doc.text('By signing I confirm all information provided is true and accurate', leftMargin + sigColW / 2, y + sigBoxHeight - 2.0, { align: 'center' });

  // Column 2: Supervisor
  const col2X = leftMargin + sigColW;
  doc.rect(col2X, y, sigColW, sigBoxHeight, 'S');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.text('Date:', col2X + 2.5, y + 4);

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(5.8);
  doc.text('CCSJV Head / Supervisor of Department', col2X + sigColW / 2, y + sigBoxHeight - 2.0, { align: 'center' });

  // Column 3: HR Representative
  const col3X = leftMargin + sigColW * 2;
  doc.rect(col3X, y, sigColW, sigBoxHeight, 'S');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.text('Date:', col3X + 2.5, y + 4);

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(5.8);
  doc.text('CCSJV HR Site Representative', col3X + sigColW / 2, y + sigBoxHeight - 2.0, { align: 'center' });

  // Classification Footer
  y += sigBoxHeight + 5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(120, 120, 120);
  doc.text('Saipem Classification - General Use', pageWidth / 2, y, { align: 'center' });
}

/**
 * Draw official CCS JV Logo using high-resolution embedded image
 */
function drawCcsJvLogo(doc: jsPDF, x: number, y: number, logoWidth: number = 46, logoHeight: number = 16.4) {
  try {
    doc.addImage(CCS_JV_LOGO_BASE64, 'PNG', x, y, logoWidth, logoHeight);
  } catch {
    // Fallback vector drawing if image parsing fails
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(0, 114, 188); // #0072BC Blue
    doc.text('CCS', x, y + 7.5);

    const emblemX = x + 23;
    const emblemY = y + 4.5;

    doc.setFillColor(141, 198, 63); // #8DC63F
    doc.triangle(emblemX, emblemY + 3.5, emblemX + 3.5, emblemY - 3.5, emblemX + 6, emblemY + 2, 'F');

    doc.setFillColor(237, 28, 36); // #ED1C24
    doc.triangle(emblemX + 4.5, emblemY + 3.5, emblemX + 7, emblemY - 2, emblemX + 9.5, emblemY + 2.5, 'F');

    doc.setFillColor(247, 148, 29); // #F7941D
    doc.triangle(emblemX + 8, emblemY + 3.5, emblemX + 10.5, emblemY - 1, emblemX + 12.5, emblemY + 3.5, 'F');

    doc.setTextColor(0, 114, 188);
    doc.text('JV', emblemX + 14, y + 7.5);
  }
}

/**
 * Draw realistic signature flourish and printed name
 */
function drawTravelerSignature(
  doc: jsPDF,
  x: number,
  y: number,
  name: string,
  sigImageBase64?: string
) {
  let drewImage = false;
  if (sigImageBase64) {
    try {
      const sigWidth = 25;
      const sigHeight = 13.9; // Natural uncompressed aspect ratio (~1.79:1)
      doc.addImage(sigImageBase64, 'JPEG', x + 3.5, y, sigWidth, sigHeight);
      drewImage = true;
    } catch {
      drewImage = false;
    }
  }

  if (!drewImage) {
    doc.setDrawColor(20, 35, 95); // Royal blue ink
    doc.setLineWidth(0.35);

    // Artistic cursive strokes
    doc.lines([
      [5, -3],
      [3, 2],
      [4, -3],
      [6, 3],
      [-8, 3],
      [12, 1],
      [10, -2]
    ], x, y + 4, [1, 1]);

    doc.lines([
      [3, 5],
      [4, -4],
      [2, 3],
      [5, -2]
    ], x + 10, y + 3, [1, 1]);

    // Flourish underline
    doc.line(x - 1, y + 8.5, x + 30, y + 7.8);
  }

  // Printed signature name
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(6.0);
  doc.setTextColor(30, 40, 90);
  doc.text(name || DEFAULT_SIGNATURE_NAME, x + 16, y + 13.5, { align: 'center' });
}

export function generatePdfBlob(traveler: TravelerRecord): Blob {
  const doc = createTafPdf(traveler);
  return doc.output('blob');
}

export function generateMultiPagePdf(travelers: TravelerRecord[]): jsPDF {
  if (travelers.length === 0) {
    throw new Error('No travelers provided');
  }

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true
  });

  // Render each traveler on its own single A4 page
  travelers.forEach((traveler, index) => {
    if (index > 0) {
      doc.addPage('a4', 'portrait');
    }
    renderTafPage(doc, traveler);
  });

  return doc;
}

