import React, { useState } from 'react';
import { TravelerRecord, MobilizationFormData } from '../types';
import { extractMobilizationDataFromTraveler } from '../utils/mobilizationDataExtractor';
import { downloadSingleMobilizationPdf } from '../utils/mobilizationPdfGenerator';
import { DAEWOO_LOGO_SVG, DAEWOO_LOGO_IMAGE_PATH } from '../assets/daewooLogo';
import { ERIC_MATOLA_SIGNATURE_BASE64, DEFAULT_SIGNATURE_NAME } from '../assets/signature';
import {
  Download,
  Printer,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Check,
  Building2,
  FileCheck2,
  ChevronLeft,
  ChevronRight,
  Route
} from 'lucide-react';

interface MobilizationFormPreviewProps {
  traveler: TravelerRecord;
  totalCount?: number;
  currentIndex?: number;
  onNavigate?: (index: number) => void;
  onEdit?: (traveler: TravelerRecord) => void;
  onOpenMobilizationModal?: (traveler: TravelerRecord) => void;
  onSwitchToTaf?: () => void;
}

export const MobilizationFormPreview: React.FC<MobilizationFormPreviewProps> = ({
  traveler,
  totalCount = 1,
  currentIndex = 0,
  onNavigate,
  onEdit,
  onOpenMobilizationModal,
  onSwitchToTaf
}) => {
  const [scale, setScale] = useState<number>(0.92);
  const [printSeparately, setPrintSeparately] = useState<boolean>(true);

  const mobData: MobilizationFormData = extractMobilizationDataFromTraveler(traveler);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = () => {
    downloadSingleMobilizationPdf(traveler);
  };

  return (
    <div className="flex flex-col h-full bg-zinc-950 rounded-2xl border border-zinc-800 overflow-hidden shadow-2xl">
      {/* Top Toolbar */}
      <div className="bg-zinc-900 border-b border-zinc-800 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 sticky top-0 z-20">
        {/* Navigation if in batch */}
        {totalCount > 1 && (
          <div className="flex items-center gap-2 bg-zinc-800 px-2 py-1 rounded-lg border border-zinc-700 text-xs text-zinc-300">
            <button
              onClick={() => onNavigate && onNavigate(Math.max(0, currentIndex - 1))}
              disabled={currentIndex === 0}
              className="p-1 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-100 rounded disabled:opacity-30 transition-colors"
              title="Previous Traveler"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-semibold text-zinc-200">
              {currentIndex + 1} of {totalCount}
            </span>
            <button
              onClick={() => onNavigate && onNavigate(Math.min(totalCount - 1, currentIndex + 1))}
              disabled={currentIndex === totalCount - 1}
              className="p-1 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-100 rounded disabled:opacity-30 transition-colors"
              title="Next Traveler"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Form Type Badge & Traveler Name */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/70 border border-emerald-800/80 px-2.5 py-1 rounded-lg flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-emerald-400" />
            Daewoo E&amp;C Mobilization Form
          </span>
          <span className="text-xs uppercase font-semibold text-zinc-200 bg-zinc-800 px-2.5 py-1 rounded-md border border-zinc-700">
            {mobData.applicantName}
          </span>
          <span className="text-xs text-zinc-400 font-mono">Site: {mobData.site}</span>
        </div>

        {/* Separate Print Tick Checkbox Option */}
        <label className="flex items-center gap-2 text-xs text-zinc-300 bg-zinc-800/90 hover:bg-zinc-800 px-2.5 py-1.5 rounded-lg border border-zinc-700 cursor-pointer select-none transition-colors">
          <input
            type="checkbox"
            checked={printSeparately}
            onChange={e => setPrintSeparately(e.target.checked)}
            className="rounded accent-emerald-500 focus:ring-emerald-500 w-3.5 h-3.5 cursor-pointer"
          />
          <span className="text-emerald-300 font-medium flex items-center gap-1">
            <Check className="w-3.5 h-3.5 text-emerald-400" />
            Print separate from original TAF
          </span>
        </label>

        {/* Toolbar Controls */}
        <div className="flex items-center gap-2 ml-auto">
          {/* Switch to TAF View */}
          {onSwitchToTaf && (
            <button
              onClick={onSwitchToTaf}
              className="flex items-center gap-1 text-xs text-indigo-300 bg-indigo-950/60 hover:bg-indigo-900/60 border border-indigo-700/60 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
              title="View CCS JV Travel Authorization Form (TAF)"
            >
              <FileCheck2 className="w-3.5 h-3.5 text-indigo-400" />
              Switch to TAF Form
            </button>
          )}

          {/* Zoom */}
          <div className="flex items-center bg-zinc-800 rounded-lg p-0.5 border border-zinc-700">
            <button
              onClick={() => setScale(Math.max(0.5, scale - 0.1))}
              className="p-1 hover:bg-zinc-700 text-zinc-300 rounded transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-[11px] font-mono px-1.5 text-zinc-300">{Math.round(scale * 100)}%</span>
            <button
              onClick={() => setScale(Math.min(1.4, scale + 0.1))}
              className="p-1 hover:bg-zinc-700 text-zinc-300 rounded transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => setScale(0.92)}
              className="p-1 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 rounded border-l border-zinc-700 transition-colors"
              title="Reset Zoom"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>

          {/* Change Route Location Button */}
          {onOpenMobilizationModal && (
            <button
              onClick={() => onOpenMobilizationModal(traveler)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-950/70 hover:bg-indigo-900/90 text-indigo-200 hover:text-white rounded-lg text-xs font-semibold border border-indigo-700/60 transition-colors cursor-pointer shadow-sm"
              title="Change route location or site independently from TAF"
            >
              <Route className="w-3.5 h-3.5 text-indigo-400" />
              <span>Change Route Location</span>
            </button>
          )}

          {/* Print */}
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 rounded-lg text-xs font-medium border border-zinc-700 transition-colors cursor-pointer shadow-sm"
            title="Print Mobilization Form"
          >
            <Printer className="w-3.5 h-3.5 text-emerald-400" />
            <span>Print Form</span>
          </button>

          {/* Download PDF */}
          <button
            onClick={handleDownloadPdf}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-md transition-all cursor-pointer"
            title="Download Mobilization Form as standalone PDF"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download PDF</span>
          </button>
        </div>
      </div>

      {/* Main Preview Viewport */}
      <div className="flex-1 overflow-auto p-4 md:p-8 flex justify-center bg-zinc-900/60">
        <div
          style={{
            transform: `scale(${scale})`,
            transformOrigin: 'top center',
            transition: 'transform 0.15s ease-out'
          }}
          className="shadow-2xl rounded-sm"
        >
          {/* Printable Sheet (Standard A4 dimensions: 794px x 1123px) */}
          <div
            id="printable-mobilization-sheet"
            className="w-[794px] min-h-[1123px] bg-white text-zinc-900 p-[42px] relative box-border font-sans select-text shadow-xl"
            style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}
          >
            {/* 1. Header with Title & Approval Grid */}
            <table className="w-full border-collapse border border-black mb-0">
              <tbody>
                <tr>
                  {/* Left Box: Mobilization Form */}
                  <td
                    className="w-[45%] bg-[#e0e6ec] text-center align-middle font-normal text-[20px] text-zinc-900 py-3.5 border border-black tracking-wide"
                    style={{ backgroundColor: '#e0e6ec' }}
                  >
                    Mobilization Form
                  </td>

                  {/* 4 Approval Columns (Top approval boxes kept blank for approval - signature only for administration use below) */}
                  <td className="w-[13.75%] p-0 border border-black text-center align-top">
                    <div className="border-b border-black py-1 text-[11px] font-normal">Applicant</div>
                    <div className="h-10"></div>
                  </td>
                  <td className="w-[13.75%] p-0 border border-black text-center align-top">
                    <div className="border-b border-black py-1 text-[11px] font-normal">HR Manager</div>
                    <div className="h-10"></div>
                  </td>
                  <td className="w-[13.75%] p-0 border border-black text-center align-top">
                    <div className="border-b border-black py-1 text-[11px] font-normal">Admin. Manager</div>
                    <div className="h-10"></div>
                  </td>
                  <td className="w-[13.75%] p-0 border border-black text-center align-top">
                    <div className="border-b border-black py-1 text-[11px] font-normal">PM</div>
                    <div className="h-10 flex items-center justify-center text-[12px] font-normal text-zinc-800">
                      {mobData.pmApproval || 'N/A'}
                    </div>
                  </td>
                </tr>

                {/* Date Row */}
                <tr>
                  <td colSpan={5} className="border border-black px-2.5 py-1 text-[12px] font-normal">
                    Date: <span className="ml-8 font-normal font-mono">{mobData.formDate || mobData.signatureDate || '06 AUGUST 2026'}</span>
                  </td>
                </tr>
              </tbody>
            </table>

            {/* 2. Applicant Section Table */}
            <table className="w-full border-collapse border border-black -mt-[1px]">
              <tbody>
                {/* Row 1: Name */}
                <tr>
                  <td
                    rowSpan={7}
                    className="w-[12%] text-center align-middle font-normal text-[13px] border border-black"
                  >
                    Applicant
                  </td>
                  <td className="w-[16%] px-2.5 py-1 text-[12px] font-normal border border-black bg-[#ecf3ea]">
                    Name
                  </td>
                  <td className="w-[32%] px-2.5 py-1 text-[12px] font-normal border border-black bg-[#ecf3ea] font-sans">
                    {mobData.applicantName}
                  </td>
                  <td className="w-[13.75%] border border-black"></td>
                  <td className="w-[13.75%] border border-black"></td>
                  <td className="w-[12.5%] border border-black"></td>
                </tr>

                {/* Row 2: Position */}
                <tr>
                  <td className="px-2.5 py-1 text-[12px] font-normal border border-black bg-[#ecf3ea]">
                    Position
                  </td>
                  <td className="px-2.5 py-1 text-[12px] font-normal border border-black bg-[#ecf3ea]">
                    {mobData.position}
                  </td>
                  <td className="border border-black"></td>
                  <td className="border border-black"></td>
                  <td className="border border-black"></td>
                </tr>

                {/* Row 3: Department */}
                <tr>
                  <td className="px-2.5 py-1 text-[12px] font-normal border border-black bg-[#ecf3ea]">
                    Department
                  </td>
                  <td className="px-2.5 py-1 text-[12px] font-normal border border-black bg-[#ecf3ea]">
                    {mobData.department}
                  </td>
                  <td className="border border-black"></td>
                  <td className="border border-black"></td>
                  <td className="border border-black"></td>
                </tr>

                {/* Row 4: Site */}
                <tr>
                  <td className="px-2.5 py-1 text-[12px] font-normal border border-black bg-[#ecf3ea]">
                    Site
                  </td>
                  <td className="px-2.5 py-1 text-[12px] font-normal border border-black bg-[#ecf3ea]">
                    {mobData.site}
                  </td>
                  <td className="border border-black"></td>
                  <td className="border border-black"></td>
                  <td className="border border-black"></td>
                </tr>

                {/* Row 5: Nationality */}
                <tr>
                  <td className="px-2.5 py-1 text-[12px] font-normal border border-black bg-[#ecf3ea]">
                    Nationality
                  </td>
                  <td className="px-2.5 py-1 text-[12px] font-normal border border-black bg-[#ecf3ea]">
                    {mobData.nationality}
                  </td>
                  <td className="border border-black"></td>
                  <td className="border border-black"></td>
                  <td className="border border-black"></td>
                </tr>

                {/* Row 6: ID No. */}
                <tr>
                  <td className="px-2.5 py-1 text-[12px] font-normal border border-black bg-[#ecf3ea]">
                    ID No.
                  </td>
                  <td className="px-2.5 py-1 text-[12px] font-normal border border-black bg-[#ecf3ea] font-mono">
                    {mobData.idNumber}
                  </td>
                  <td className="border border-black"></td>
                  <td className="border border-black"></td>
                  <td className="border border-black"></td>
                </tr>

                {/* Row 7: Arrival Date */}
                <tr>
                  <td className="px-2.5 py-1 text-[12px] font-normal border border-black bg-[#ecf3ea]">
                    Arrival Date
                  </td>
                  <td className="px-2.5 py-1 text-[12px] font-normal border border-black bg-[#ecf3ea]">
                    {mobData.arrivalDate}
                  </td>
                  <td className="border border-black"></td>
                  <td className="border border-black"></td>
                  <td className="border border-black"></td>
                </tr>
              </tbody>
            </table>

            {/* 3. Travel Route Section Table */}
            <table className="w-full border-collapse border border-black -mt-[1px]">
              <tbody>
                {/* Header Row: Departure Subheader */}
                <tr>
                  <td
                    rowSpan={7}
                    className="w-[12%] text-center align-middle font-normal text-[13px] border border-black"
                  >
                    Travel Route
                  </td>
                  <td
                    colSpan={5}
                    className="text-center font-bold text-[12px] py-1 border border-black bg-[#f5f7f9]"
                  >
                    Departure
                  </td>
                </tr>

                {/* Column Headers */}
                <tr className="text-center text-[11px] font-normal">
                  <td className="w-[15%] py-1 border border-black">Date</td>
                  <td className="w-[22%] py-1 border border-black">Origin</td>
                  <td className="w-[13%] py-1 border border-black">ETD</td>
                  <td className="w-[28%] py-1 border border-black">Destination</td>
                  <td className="w-[12%] py-1 border border-black">ETA</td>
                </tr>

                {/* 5 Route Data Rows */}
                {[0, 1, 2, 3, 4].map(idx => {
                  const leg = mobData.routes[idx] || { date: '', origin: '', etd: '', destination: '', eta: '' };
                  return (
                    <tr key={idx} className="h-6 text-center text-[11px]">
                      <td className="border border-black px-1.5 py-0.5">{leg.date}</td>
                      <td className="border border-black px-1.5 py-0.5">{leg.origin}</td>
                      <td className="border border-black px-1.5 py-0.5">{leg.etd}</td>
                      <td className="border border-black px-1.5 py-0.5">{leg.destination}</td>
                      <td className="border border-black px-1.5 py-0.5">{leg.eta}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* 4. For Administration Department Use Only */}
            <table className="w-full border-collapse border border-black -mt-[1px]">
              <tbody>
                <tr>
                  <td
                    colSpan={5}
                    className="text-center font-normal text-[12px] py-1 border border-black bg-[#f5f7f9]"
                  >
                    For Administration Department Use Only
                  </td>
                </tr>
                <tr className="text-center text-[11px] font-normal">
                  <td className="w-[12%] py-1 border border-black">Nos</td>
                  <td className="w-[48%] py-1 border border-black">Description</td>
                  <td className="w-[13%] py-1 border border-black">Mark</td>
                  <td className="w-[14%] py-1 border border-black">Name</td>
                  <td className="w-[13%] py-1 border border-black">Signature</td>
                </tr>

                {/* Check 1 */}
                <tr className="text-[11px]">
                  <td className="border border-black text-center py-1.5 font-normal">Check 1</td>
                  <td className="border border-black px-2 py-1 leading-snug">
                    - Is the application correct according to an
                    <br />
                    &nbsp;&nbsp;employment agreement?
                  </td>
                  <td className="border border-black text-center font-bold text-emerald-800">
                    {mobData.check1?.mark || 'X'}
                  </td>
                  <td className="border border-black text-center text-[10px] font-medium">
                    {mobData.check1?.name || mobData.signatureName || DEFAULT_SIGNATURE_NAME}
                  </td>
                  <td className="border border-black text-center p-0.5">
                    <div className="flex flex-col items-center justify-center">
                      <img
                        src={mobData.signatureImage || ERIC_MATOLA_SIGNATURE_BASE64}
                        alt="Signature"
                        className="h-5 w-auto max-w-[75px] object-contain select-none mix-blend-multiply"
                        referrerPolicy="no-referrer"
                      />
                      <span className="text-[7.5px] text-zinc-500 font-mono">
                        {mobData.check1?.signatureDate || mobData.signatureDate || mobData.formDate}
                      </span>
                    </div>
                  </td>
                </tr>

                {/* Check 2 */}
                <tr className="text-[11px]">
                  <td className="border border-black text-center py-1.5 font-normal">Check 2</td>
                  <td className="border border-black px-2 py-1 leading-snug">
                    - Is the notice period correct?
                  </td>
                  <td className="border border-black text-center font-bold text-emerald-800">
                    {mobData.check2?.mark || 'X'}
                  </td>
                  <td className="border border-black text-center text-[10px] font-medium">
                    {mobData.check2?.name || mobData.signatureName || DEFAULT_SIGNATURE_NAME}
                  </td>
                  <td className="border border-black text-center p-0.5">
                    <div className="flex flex-col items-center justify-center">
                      <img
                        src={mobData.signatureImage || ERIC_MATOLA_SIGNATURE_BASE64}
                        alt="Signature"
                        className="h-5 w-auto max-w-[75px] object-contain select-none mix-blend-multiply"
                        referrerPolicy="no-referrer"
                      />
                      <span className="text-[7.5px] text-zinc-500 font-mono">
                        {mobData.check2?.signatureDate || mobData.signatureDate || mobData.formDate}
                      </span>
                    </div>
                  </td>
                </tr>

                {/* Check 3 */}
                <tr className="text-[11px]">
                  <td className="border border-black text-center py-1.5 font-normal">Check 3</td>
                  <td className="border border-black px-2 py-1 leading-snug">
                    - Is the route appropriate ?
                  </td>
                  <td className="border border-black text-center font-bold text-emerald-800">
                    {mobData.check3?.mark || 'X'}
                  </td>
                  <td className="border border-black text-center text-[10px] font-medium">
                    {mobData.check3?.name || mobData.signatureName || DEFAULT_SIGNATURE_NAME}
                  </td>
                  <td className="border border-black text-center p-0.5">
                    <div className="flex flex-col items-center justify-center">
                      <img
                        src={mobData.signatureImage || ERIC_MATOLA_SIGNATURE_BASE64}
                        alt="Signature"
                        className="h-5 w-auto max-w-[75px] object-contain select-none mix-blend-multiply"
                        referrerPolicy="no-referrer"
                      />
                      <span className="text-[7.5px] text-zinc-500 font-mono">
                        {mobData.check3?.signatureDate || mobData.signatureDate || mobData.formDate}
                      </span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>

            {/* 5. Daewoo E&C Logo Right Side Bottom as requested */}
            <div className="mt-8 flex justify-end items-center pr-2">
              <img
                src={DAEWOO_LOGO_IMAGE_PATH}
                alt="DAEWOO E&C"
                className="h-10 w-auto max-w-[240px] object-contain select-none"
                loading="eager"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
