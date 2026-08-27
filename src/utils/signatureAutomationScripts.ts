import { SignatureAutomationConfig } from '../types';
import { ERIC_MATOLA_SIGNATURE_BASE64, DEFAULT_SIGNATURE_NAME } from '../assets/signature';

export const DEFAULT_SIGNATURE_CONFIG: SignatureAutomationConfig = {
  mode: 'both',
  signatureName: DEFAULT_SIGNATURE_NAME,
  signerTitle: 'Site Travel Coordinator / Logistics Lead',
  organization: 'Daewoo E&C / CCS JV',
  department: 'LOGISTICS / SITE SERVICES',
  signatureDate: '06 AUGUST 2026',
  signatureImageBase64: ERIC_MATOLA_SIGNATURE_BASE64,
  includeLegalDisclaimer: true,
  legalDisclaimerText: 'By signing I confirm all information provided is true, accurate, and approved for travel and accommodation booking in accordance with CCS JV Project Standards.',
  includeTimestamp: true,
  includeSupervisorBlock: true,
  includeHrBlock: true,
  textBlockTemplate: `ELECTRONICALLY SIGNED & VERIFIED
Signer: {{SIGNATURE_NAME}}
Position: {{SIGNER_TITLE}}
Organization: {{ORGANIZATION}} - {{DEPARTMENT}}
Verification Date: {{SIGNATURE_DATE}}
Timestamp (UTC): {{TIMESTAMP_UTC}}
Ref / Approval ID: CCSJV-TAF-AUTO-{{AUTO_ID}}
Status: CERTIFIED & COMPLIANT`,
  autoStampGeneratedFiles: true
};

/**
 * Generate Python Google Docs API Automation Script
 */
export function generatePythonGoogleDocsScript(config: SignatureAutomationConfig = DEFAULT_SIGNATURE_CONFIG): string {
  return `"""
=============================================================================
CCS JV Travel Automation: Google Docs API Signature Appender
=============================================================================
Description:
    Automatically appends a high-resolution signature image and/or an
    official multi-line signature verification block to the bottom
    of newly generated Google Docs via Google Docs API (v1).

Requirements:
    pip install --upgrade google-api-python-client google-auth-httplib2 google-auth-oauthlib
=============================================================================
"""

import os
import datetime
from google.oauth2 import service_account
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

# OAuth2 scopes required for modifying Google Docs
SCOPES = [
    'https://www.googleapis.com/auth/documents',
    'https://www.googleapis.com/auth/drive'
]

# Signature Metadata Configuration
SIGNER_NAME = "${config.signatureName}"
SIGNER_TITLE = "${config.signerTitle}"
ORGANIZATION = "${config.organization}"
DEPARTMENT = "${config.department}"
APPROVAL_DATE = "${config.signatureDate}"
LEGAL_DISCLAIMER = "${config.legalDisclaimerText}"

# Publicly accessible URL or Google Drive hosted URL for the signature PNG/JPEG
# Note: Google Docs API insertInlineImage requires a publicly reachable URI
SIGNATURE_IMAGE_URI = "https://raw.githubusercontent.com/user/taf-assets/main/eric_matola_signature.png"


def authenticate_google_docs():
    """Authenticates the user and returns the Google Docs API service client."""
    creds = None
    if os.path.exists('token.json'):
        creds = Credentials.from_authorized_user_file('token.json', SCOPES)
    
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file('credentials.json', SCOPES)
            creds = flow.run_local_server(port=0)
        with open('token.json', 'w') as token:
            token.write(creds.to_json())

    return build('docs', 'v1', credentials=creds)


def get_document_end_index(docs_service, document_id):
    """Fetches the document and retrieves the index of the end of the document body."""
    doc = docs_service.documents().get(documentId=document_id).execute()
    content = doc.get('body', {}).get('content', [])
    if content:
        end_index = content[-1].get('endIndex', 1) - 1
        return max(1, end_index)
    return 1


def append_signature_block(docs_service, document_id, image_url=None):
    """
    Appends the signature image and formatted text signature block
    to the very bottom of the specified Google Document.
    """
    end_idx = get_document_end_index(docs_service, document_id)
    requests = []
    
    now_utc = datetime.datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")
    
    # 1. Insert a divider and newline
    divider_text = "\\n\\n____________________________________________________________________\\n"
    requests.append({
        'insertText': {
            'location': {'index': end_idx},
            'text': divider_text
        }
    })
    
    # Execute first batch to get updated index
    docs_service.documents().batchUpdate(
        documentId=document_id,
        body={'requests': requests}
    ).execute()
    
    # 2. Append Signature Image if requested
    end_idx = get_document_end_index(docs_service, document_id)
    requests = []
    
    if image_url:
        requests.append({
            'insertInlineImage': {
                'location': {'index': end_idx},
                'uri': image_url,
                'objectSize': {
                    'height': {'magnitude': 45, 'unit': 'PT'},
                    'width': {'magnitude': 120, 'unit': 'PT'}
                }
            }
        })
        
    # 3. Append Text Signature Block
    sig_text_block = (
        f"\\n\\n[ELECTRONICALLY SIGNED & CERTIFIED]\\n"
        f"Authorized Signature: {SIGNER_NAME}\\n"
        f"Designation: {SIGNER_TITLE}\\n"
        f"Department / JV: {ORGANIZATION} - {DEPARTMENT}\\n"
        f"Date of Authorization: {APPROVAL_DATE}\\n"
        f"Audit Verification Timestamp: {now_utc}\\n"
        f"Compliance: {LEGAL_DISCLAIMER}\\n"
    )
    
    requests.append({
        'insertText': {
            'location': {'index': end_idx + (1 if image_url else 0)},
            'text': sig_text_block
        }
    })

    # Apply bold styling to the signature heading
    style_start = end_idx + (1 if image_url else 0)
    requests.append({
        'updateTextStyle': {
            'range': {
                'startIndex': style_start,
                'endIndex': style_start + 35
            },
            'textStyle': {
                'bold': True,
                'italic': False,
                'foregroundColor': {
                    'color': {'rgbColor': {'blue': 0.6, 'green': 0.1, 'red': 0.08}}
                }
            },
            'fields': 'bold,italic,foregroundColor'
        }
    })

    # Execute batch updates
    result = docs_service.documents().batchUpdate(
        documentId=document_id,
        body={'requests': requests}
    ).execute()
    
    print(f"[OK] Successfully appended signature block to Google Doc: {document_id}")
    return result


if __name__ == '__main__':
    # Replace with your target Google Doc ID
    TARGET_DOC_ID = 'YOUR_GOOGLE_DOC_FILE_ID_HERE'
    
    print(f"Connecting to Google Docs API...")
    service = authenticate_google_docs()
    
    print(f"Appending signature block to doc {TARGET_DOC_ID}...")
    append_signature_block(service, TARGET_DOC_ID, image_url=SIGNATURE_IMAGE_URI)
`;
}

/**
 * Generate Python PyPDF2 / PyMuPDF PDF Stamp Automation Script
 */
export function generatePythonPdfStampScript(config: SignatureAutomationConfig = DEFAULT_SIGNATURE_CONFIG): string {
  return `"""
=============================================================================
CCS JV Travel Automation: Python PDF Batch Signature Appender
=============================================================================
Description:
    Automatically processes all newly generated PDF files in an input folder,
    appends a transparent signature image and official verification block
    at the bottom coordinates of the last page, and saves to the output folder.

Requirements:
    pip install pypdf reportlab pillow
=============================================================================
"""

import os
import io
import datetime
from pypdf import PdfReader, PdfWriter
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors

# Configuration
INPUT_DIR = "./generated_taf_pdfs"
OUTPUT_DIR = "./signed_taf_pdfs"
SIGNATURE_IMAGE_FILE = "signature.png"  # Local transparent PNG signature

SIGNER_NAME = "${config.signatureName}"
SIGNER_TITLE = "${config.signerTitle}"
ORGANIZATION = "${config.organization}"
SIGNATURE_DATE = "${config.signatureDate}"
LEGAL_NOTE = "${config.legalDisclaimerText}"


def create_signature_overlay(width_pt, height_pt, page_number=1, total_pages=1):
    """Generates an in-memory PDF overlay containing the signature & text block."""
    packet = io.BytesIO()
    can = canvas.Canvas(packet, pagesize=(width_pt, height_pt))
    
    # Bottom margin coordinates (in Points: 1 pt = 1/72 inch)
    # A4 standard size is 595.28 x 841.89 points
    box_x = 36          # 0.5 inch left margin
    box_y = 36          # 0.5 inch bottom margin
    box_w = width_pt - 72
    box_h = 75
    
    # 1. Draw signature bounding box
    can.setStrokeColor(colors.HexColor('#CCCCCC'))
    can.setFillColor(colors.HexColor('#FAFAFA'))
    can.setLineWidth(0.8)
    can.roundRect(box_x, box_y, box_w, box_h, 4, fill=1, stroke=1)
    
    # 2. Draw Signature Image on Left/Center column
    sig_x = box_x + 10
    sig_y = box_y + 12
    if os.path.exists(SIGNATURE_IMAGE_FILE):
        try:
            can.drawImage(
                SIGNATURE_IMAGE_FILE,
                sig_x, sig_y,
                width=110, height=45,
                mask='auto',
                preserveAspectRatio=True
            )
        except Exception as e:
            print(f"Warning: Could not load signature image: {e}")
    else:
        # Fallback drawn cursive marker
        can.setFont("Helvetica-Oblique", 14)
        can.setFillColor(colors.HexColor('#1E285A'))
        can.drawString(sig_x + 5, sig_y + 20, f"~ {SIGNER_NAME} ~")
    
    # 3. Text Details
    can.setFont("Helvetica-Bold", 8)
    can.setFillColor(colors.HexColor('#0F172A'))
    can.drawString(box_x + 130, box_y + 55, f"VERIFIED & DIGITALLY APPROVED: {SIGNER_NAME.upper()}")
    
    can.setFont("Helvetica", 7)
    can.setFillColor(colors.HexColor('#475569'))
    can.drawString(box_x + 130, box_y + 43, f"Title / Role: {SIGNER_TITLE} | Dept: {ORGANIZATION}")
    can.drawString(box_x + 130, box_y + 32, f"Approval Date: {SIGNATURE_DATE} | Certified by CCS JV Portal Automation")
    
    # Legal disclaimer line
    can.setFont("Helvetica-Oblique", 5.8)
    can.setFillColor(colors.HexColor('#64748B'))
    can.drawString(box_x + 130, box_y + 18, LEGAL_NOTE[:95] + ("..." if len(LEGAL_NOTE) > 95 else ""))
    
    # Stamp timestamp & Unique Hash
    timestamp_utc = datetime.datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")
    can.setFont("Courier-Bold", 6.5)
    can.setFillColor(colors.HexColor('#059669'))
    can.drawRightString(box_x + box_w - 8, box_y + 55, f"[STATUS: CERTIFIED]")
    can.setFont("Courier", 5.5)
    can.setFillColor(colors.HexColor('#94A3B8'))
    can.drawRightString(box_x + box_w - 8, box_y + 43, f"TS: {timestamp_utc}")
    can.drawRightString(box_x + box_w - 8, box_y + 32, f"PAGE {page_number} OF {total_pages}")
    
    can.save()
    packet.seek(0)
    return PdfReader(packet)


def sign_pdf_file(input_pdf_path, output_pdf_path):
    """Reads input PDF, applies signature overlay on the last page, and writes output."""
    reader = PdfReader(input_pdf_path)
    writer = PdfWriter()
    total_pages = len(reader.pages)
    
    for idx, page in enumerate(reader.pages):
        # Apply signature to the final page
        if idx == total_pages - 1:
            media_box = page.mediabox
            width = float(media_box.width)
            height = float(media_box.height)
            
            overlay_pdf = create_signature_overlay(width, height, idx + 1, total_pages)
            overlay_page = overlay_pdf.pages[0]
            page.merge_page(overlay_page)
            
        writer.add_page(page)
        
    with open(output_pdf_path, "wb") as f_out:
        writer.write(f_out)
        
    print(f"[OK] Signed and saved: {output_pdf_path}")


def batch_process_all_files():
    """Iterates through all PDF files in INPUT_DIR and signs them."""
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    if not os.path.exists(INPUT_DIR):
        os.makedirs(INPUT_DIR, exist_ok=True)
        print(f"Created '{INPUT_DIR}'. Please place your generated PDF files here.")
        return

    files = [f for f in os.listdir(INPUT_DIR) if f.lower().endswith('.pdf')]
    if not files:
        print(f"No PDF files found in '{INPUT_DIR}'.")
        return

    print(f"Found {len(files)} PDF file(s). Processing batch signature stamping...")
    for filename in files:
        src = os.path.join(INPUT_DIR, filename)
        dst = os.path.join(OUTPUT_DIR, f"SIGNED_{filename}")
        try:
            sign_pdf_file(src, dst)
        except Exception as err:
            print(f"[ERROR] Failed to sign {filename}: {err}")

    print(f"\\nAll done! Signed files are ready in '{OUTPUT_DIR}'.")


if __name__ == '__main__':
    batch_process_all_files()
`;
}

/**
 * Generate Python python-docx Word Automation Script
 */
export function generatePythonWordDocxScript(config: SignatureAutomationConfig = DEFAULT_SIGNATURE_CONFIG): string {
  return `"""
=============================================================================
CCS JV Travel Automation: Microsoft Word (.docx) Signature Appender
=============================================================================
Description:
    Automatically attaches a transparent signature image and a multi-column
    official signature block table to the bottom of generated .docx documents.

Requirements:
    pip install python-docx
=============================================================================
"""

import os
import datetime
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT

# Configuration
SIGNATURE_IMAGE_PATH = "signature.png"
SIGNER_NAME = "${config.signatureName}"
SIGNER_TITLE = "${config.signerTitle}"
ORGANIZATION = "${config.organization}"
SIGNATURE_DATE = "${config.signatureDate}"
LEGAL_NOTE = "${config.legalDisclaimerText}"


def append_signature_to_docx(docx_file_path, output_file_path=None):
    """Opens a .docx file and appends the signature section at the end."""
    if output_file_path is None:
        output_file_path = docx_file_path.replace(".docx", "_SIGNED.docx")

    doc = Document(docx_file_path)
    
    # 1. Add horizontal divider
    doc.add_paragraph().paragraph_format.space_after = Pt(6)
    divider_p = doc.add_paragraph()
    divider_p.paragraph_format.space_after = Pt(12)
    p_border = divider_p.add_run("____________________________________________________________________")
    p_border.font.color.rgb = RGBColor(180, 180, 180)
    p_border.font.size = Pt(8)
    
    # 2. Add Heading
    h = doc.add_paragraph()
    h.paragraph_format.space_after = Pt(8)
    run_h = h.add_run("SECTION 5: VERIFICATION & AUTHORIZED SIGNATURE")
    run_h.bold = True
    run_h.font.size = Pt(9.5)
    run_h.font.color.rgb = RGBColor(0, 51, 102) # CCS JV Navy Blue
    
    # 3. Create 3-column Signature Table
    table = doc.add_table(rows=1, cols=3)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = False
    
    col_widths = [Inches(2.5), Inches(2.2), Inches(2.2)]
    for i, col in enumerate(table.columns):
        col.width = col_widths[i]
        
    hdr_cells = table.rows[0].cells
    
    # Cell 1: Traveler / Authorizer Signature & Image
    c1 = hdr_cells[0]
    p1 = c1.paragraphs[0]
    p1.paragraph_format.space_after = Pt(4)
    run_c1_title = p1.add_run(f"Authorized Traveler:\\n")
    run_c1_title.bold = True
    run_c1_title.font.size = Pt(8.5)
    
    if os.path.exists(SIGNATURE_IMAGE_PATH):
        try:
            p1_img = c1.add_paragraph()
            p1_img.paragraph_format.space_after = Pt(2)
            p1_img.add_run().add_picture(SIGNATURE_IMAGE_PATH, width=Inches(1.6))
        except Exception as e:
            print(f"Warning: Image attach error: {e}")
            
    p1_info = c1.add_paragraph()
    run_sig_name = p1_info.add_run(f"Signature: {SIGNER_NAME}\\nDate: {SIGNATURE_DATE}")
    run_sig_name.italic = True
    run_sig_name.font.size = Pt(8)
    run_sig_name.font.color.rgb = RGBColor(30, 40, 90)
    
    # Cell 2: Supervisor Approval
    c2 = hdr_cells[1]
    p2 = c2.paragraphs[0]
    run_c2 = p2.add_run(f"Department Supervisor:\\n\\n[ APPROVED ]\\nDate: {SIGNATURE_DATE}\\nCCS JV Head / Lead")
    run_c2.font.size = Pt(8)
    
    # Cell 3: HR / Site Travel Representative
    c3 = hdr_cells[2]
    p3 = c3.paragraphs[0]
    run_c3 = p3.add_run(f"HR Site Representative:\\n\\n[ VERIFIED ]\\nDate: {SIGNATURE_DATE}\\nCCS JV HR Mobility")
    run_c3.font.size = Pt(8)
    
    # 4. Disclaimer paragraph
    p_disc = doc.add_paragraph()
    p_disc.paragraph_format.space_before = Pt(8)
    run_disc = p_disc.add_run(f"Note: {LEGAL_NOTE}")
    run_disc.italic = True
    run_disc.font.size = Pt(7)
    run_disc.font.color.rgb = RGBColor(120, 120, 120)
    
    doc.save(output_file_path)
    print(f"[OK] Saved signed Word document: {output_file_path}")


if __name__ == '__main__':
    # Test on a local file
    test_file = "Travel_Request_Template.docx"
    if os.path.exists(test_file):
        append_signature_to_docx(test_file)
    else:
        print(f"Please specify a valid .docx file path.")
`;
}

/**
 * Generate Google Apps Script (GAS) for Drive / Google Docs Workspace Automation
 */
export function generateGoogleAppsScript(config: SignatureAutomationConfig = DEFAULT_SIGNATURE_CONFIG): string {
  return `/**
 * =============================================================================
 * CCS JV Travel Automation: Google Apps Script (Google Docs & Drive Automation)
 * =============================================================================
 * Description:
 *     Installs a Google Workspace trigger to automatically append an authorized
 *     signature image and multi-column verification block to every newly created
 *     Travel Authorization Form (TAF) in Google Drive or Google Docs.
 * =============================================================================
 */

const CONFIG = {
  signerName: "${config.signatureName}",
  signerTitle: "${config.signerTitle}",
  organization: "${config.organization}",
  department: "${config.department}",
  signatureDate: "${config.signatureDate}",
  legalDisclaimer: "${config.legalDisclaimerText}",
  // Transparent signature image hosted on Google Drive (File ID) or public URL
  signatureImageDriveId: "1AbCdEfGhIjKlMnOpQrStUvWxYz_SAMPLE_ID"
};

/**
 * Automatically appends the signature section to the active Google Doc.
 */
function appendSignatureToActiveDoc() {
  const doc = DocumentApp.getActiveDocument();
  const body = doc.getBody();
  
  // 1. Add horizontal divider
  body.appendHorizontalRule();
  
  // 2. Add Heading
  const headerPara = body.appendParagraph("SECTION 5: ELECTRONIC SIGNATURE & VERIFICATION");
  headerPara.setHeading(DocumentApp.ParagraphHeading.HEADING3);
  headerPara.setForegroundColor("#003366");
  
  // 3. Insert Signature Image if file ID exists in Google Drive
  try {
    if (CONFIG.signatureImageDriveId && CONFIG.signatureImageDriveId !== "SAMPLE_ID") {
      const imgFile = DriveApp.getFileById(CONFIG.signatureImageDriveId);
      const imgBlob = imgFile.getBlob();
      const inlineImg = body.appendImage(imgBlob);
      inlineImg.setWidth(130);
      inlineImg.setHeight(55);
    }
  } catch (e) {
    Logger.log("Signature image load fallback: " + e.message);
  }
  
  // 4. Create 3-Column Verification Table
  const tableData = [
    [
      "Authorized Traveler:\\n" + CONFIG.signerName + "\\nDate: " + CONFIG.signatureDate + "\\n[Signed Electronically]",
      "CCSJV Department Supervisor:\\n\\n[ APPROVED ]\\nDate: " + CONFIG.signatureDate,
      "CCSJV HR Site Representative:\\n\\n[ VERIFIED ]\\nDate: " + CONFIG.signatureDate
    ]
  ];
  
  const table = body.appendTable(tableData);
  table.setBorderColor("#CCCCCC");
  table.setBorderWidth(1);
  
  // Style the table cells
  for (let r = 0; r < table.getNumRows(); r++) {
    const row = table.getRow(r);
    for (let c = 0; c < row.getNumCells(); c++) {
      const cell = row.getCell(c);
      cell.setBackgroundColor("#F8F9FA");
      cell.setPaddingTop(6);
      cell.setPaddingBottom(6);
      cell.setPaddingLeft(8);
      cell.setPaddingRight(8);
      const p = cell.getChild(0).asParagraph();
      p.setFontSize(8.5);
      p.setFontFamily("Calibri");
    }
  }
  
  // 5. Append Legal Disclaimer
  const disclaimerP = body.appendParagraph(
    "Disclaimer: " + CONFIG.legalDisclaimer + " | Generated via CCS JV Travel Portal."
  );
  disclaimerP.setItalic(true);
  disclaimerP.setFontSize(7.5);
  disclaimerP.setForegroundColor("#666666");
  
  doc.saveAndClose();
  Logger.log("Successfully signed Google Doc: " + doc.getName());
}

/**
 * Drive Folder Batch Trigger:
 * Automatically iterates through all files in a specific Google Drive folder and signs them.
 */
function batchSignDocsInDriveFolder(folderId) {
  const folder = DriveApp.getFolderById(folderId || "YOUR_TARGET_FOLDER_ID");
  const files = folder.getFilesByType(MimeType.GOOGLE_DOCS);
  
  let count = 0;
  while (files.hasNext()) {
    const file = files.next();
    const doc = DocumentApp.openById(file.getId());
    // Check if not already signed
    const text = doc.getBody().getText();
    if (!text.includes("SECTION 5: ELECTRONIC SIGNATURE")) {
      appendSignatureToDocById(file.getId());
      count++;
    }
  }
  Logger.log("Batch completed! Signed " + count + " new document(s).");
}

function appendSignatureToDocById(docId) {
  const doc = DocumentApp.openById(docId);
  const body = doc.getBody();
  body.appendHorizontalRule();
  body.appendParagraph("DIGITALLY SIGNED & VERIFIED: " + CONFIG.signerName)
       .setFontSize(9)
       .setBold(true);
  body.appendParagraph("Designation: " + CONFIG.signerTitle + " | Date: " + CONFIG.signatureDate)
       .setFontSize(8)
       .setItalic(true);
  doc.saveAndClose();
}
`;
}

/**
 * Generate Node.js / TypeScript Batch Automation Script
 */
export function generateNodeJsScript(config: SignatureAutomationConfig = DEFAULT_SIGNATURE_CONFIG): string {
  return `/**
 * =============================================================================
 * CCS JV Travel Automation: Node.js PDF Signature & Verification Appender
 * =============================================================================
 * Requirements:
 *     npm install jspdf pdf-lib fs-extra
 * =============================================================================
 */

import fs from 'fs-extra';
import path from 'path';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

const CONFIG = {
  signerName: "${config.signatureName}",
  signerTitle: "${config.signerTitle}",
  organization: "${config.organization}",
  signatureDate: "${config.signatureDate}",
  legalDisclaimer: "${config.legalDisclaimerText}",
  inputDir: "./input_pdfs",
  outputDir: "./signed_pdfs",
  signatureImagePath: "./signature.png"
};

async function signPdfFile(inputPath: string, outputPath: string) {
  const existingPdfBytes = await fs.readFile(inputPath);
  const pdfDoc = await PDFDocument.load(existingPdfBytes);
  
  const pages = pdfDoc.getPages();
  const lastPage = pages[pages.length - 1];
  const { width, height } = lastPage.getSize();
  
  const fontHelvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontHelveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontHelveticaOblique = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);
  
  // 1. Draw signature bounding box
  const boxX = 35;
  const boxY = 35;
  const boxW = width - 70;
  const boxH = 70;
  
  lastPage.drawRectangle({
    x: boxX,
    y: boxY,
    width: boxW,
    height: boxH,
    borderColor: rgb(0.8, 0.8, 0.8),
    borderWidth: 0.8,
    color: rgb(0.98, 0.98, 0.98),
  });
  
  // 2. Embed Signature PNG Image if present
  if (await fs.pathExists(CONFIG.signatureImagePath)) {
    try {
      const sigImgBytes = await fs.readFile(CONFIG.signatureImagePath);
      const sigImg = await pdfDoc.embedPng(sigImgBytes);
      lastPage.drawImage(sigImg, {
        x: boxX + 8,
        y: boxY + 12,
        width: 100,
        height: 44,
      });
    } catch (e) {
      console.warn("Could not embed PNG signature image:", e);
    }
  }
  
  // 3. Draw Signature Text Info
  lastPage.drawText("ELECTRONICALLY VERIFIED & APPROVED", {
    x: boxX + 118,
    y: boxY + 52,
    size: 7.5,
    font: fontHelveticaBold,
    color: rgb(0, 0.2, 0.4),
  });
  
  lastPage.drawText(\`Signer: \${CONFIG.signerName} | Role: \${CONFIG.signerTitle}\`, {
    x: boxX + 118,
    y: boxY + 41,
    size: 6.8,
    font: fontHelvetica,
    color: rgb(0.2, 0.2, 0.2),
  });
  
  lastPage.drawText(\`Date: \${CONFIG.signatureDate} | Org: \${CONFIG.organization}\`, {
    x: boxX + 118,
    y: boxY + 30,
    size: 6.5,
    font: fontHelvetica,
    color: rgb(0.3, 0.3, 0.3),
  });
  
  lastPage.drawText(CONFIG.legalDisclaimer.substring(0, 85) + '...', {
    x: boxX + 118,
    y: boxY + 18,
    size: 5.5,
    font: fontHelveticaOblique,
    color: rgb(0.45, 0.45, 0.45),
  });
  
  const modifiedPdfBytes = await pdfDoc.save();
  await fs.outputFile(outputPath, modifiedPdfBytes);
  console.log(\`[OK] Signed: \${path.basename(outputPath)}\`);
}

async function runBatch() {
  await fs.ensureDir(CONFIG.inputDir);
  await fs.ensureDir(CONFIG.outputDir);
  
  const files = (await fs.readdir(CONFIG.inputDir)).filter(f => f.endsWith('.pdf'));
  console.log(\`Found \${files.length} PDF file(s) to process...\`);
  
  for (const file of files) {
    await signPdfFile(
      path.join(CONFIG.inputDir, file),
      path.join(CONFIG.outputDir, \`SIGNED_\${file}\`)
    );
  }
  console.log('Batch signature appending complete!');
}

runBatch().catch(console.error);
`;
}
