import React, { useState } from 'react';
import { TravelerRecord } from '../types';
import { downloadSinglePdf } from '../utils/zipExporter';
import { CCS_JV_LOGO_BASE64 } from '../assets/logo';
import { ERIC_MATOLA_SIGNATURE_BASE64, DEFAULT_SIGNATURE_NAME } from '../assets/signature';
import { Download, Printer, ZoomIn, ZoomOut, RotateCcw, Edit3, Check, ChevronLeft, ChevronRight } from 'lucide-react';

interface TafFormPreviewProps {
  traveler: TravelerRecord;
  totalCount?: number;
  currentIndex?: number;
  onNavigate?: (index: number) => void;
  onEdit?: (traveler: TravelerRecord) => void;
}

export const TafFormPreview: React.FC<TafFormPreviewProps> = ({
  traveler,
  totalCount = 1,
  currentIndex = 0,
  onNavigate,
  onEdit
}) => {
  const [scale, setScale] = useState<number>(0.9);

  const handlePrint = () => {
    window.print();
  };

  const isMobilization = traveler.purposeOfTrip?.toLowerCase() === 'mobilization';
  const isBusinessTrip = traveler.purposeOfTrip?.toLowerCase() === 'business trip';
  const isRotationalLeave = traveler.purposeOfTrip?.toLowerCase() === 'rotational leave';
  const isEmergencyLeave = traveler.purposeOfTrip?.toLowerCase() === 'emergency leave';
  const isVisaApplication = traveler.purposeOfTrip?.toLowerCase() === 'visa application';
  const isDemobilization = traveler.purposeOfTrip?.toLowerCase() === 'demobilization';

  const flight1 = traveler.flights?.[0] || {
    date: '8/9/2026',
    from: 'PEMBA',
    to: 'AFUNGI',
    departureTime: '06:45',
    arrivalTime: '07:30',
    airlineAndFlightNo: 'SOLENTA'
  };

  const acc1 = traveler.accommodation?.[0] || {
    checkIn: '8/9/2026',
    checkOut: '',
    hotelOrCamp: '9500',
    location: 'AFUNGI',
    notes: 'SHARED'
  };

  return (
    <div className="flex flex-col h-full bg-zinc-950 rounded-2xl border border-zinc-800 overflow-hidden shadow-2xl">
      {/* Top Toolbar */}
      <div className="bg-zinc-900 border-b border-zinc-800 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 sticky top-0 z-20">
        {/* Navigation if in batch */}
        {totalCount > 1 && (
          <div className="flex items-center gap-2 bg-zinc-800 px-2 py-1 rounded-lg border border-zinc-700 text-xs text-zinc-300">
            <button
              id="preview-prev-btn"
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
              id="preview-next-btn"
              onClick={() => onNavigate && onNavigate(Math.min(totalCount - 1, currentIndex + 1))}
              disabled={currentIndex === totalCount - 1}
              className="p-1 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-100 rounded disabled:opacity-30 transition-colors"
              title="Next Traveler"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Traveler Name Badge */}
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase font-semibold text-indigo-300 bg-indigo-950/60 px-2.5 py-1 rounded-md border border-indigo-700/60">
            {traveler.surname} {traveler.nameAndGender.split('/')[0]}
          </span>
          <span className="text-xs text-zinc-500 font-mono">
            ID: {traveler.companyId || 'N/A'}
          </span>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 ml-auto">
          {/* Zoom */}
          <div className="flex items-center bg-zinc-800 rounded-lg p-0.5 border border-zinc-700">
            <button
              id="preview-zoom-out"
              onClick={() => setScale(s => Math.max(0.6, s - 0.1))}
              className="p-1.5 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-700 rounded transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] font-mono font-medium text-zinc-300 px-1.5">
              {Math.round(scale * 100)}%
            </span>
            <button
              id="preview-zoom-in"
              onClick={() => setScale(s => Math.min(1.3, s + 0.1))}
              className="p-1.5 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-700 rounded transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              id="preview-zoom-reset"
              onClick={() => setScale(0.9)}
              className="p-1.5 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-700 rounded transition-colors ml-0.5"
              title="Reset Zoom"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {onEdit && (
            <button
              id="preview-edit-btn"
              onClick={() => onEdit(traveler)}
              className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg border border-zinc-700 transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5 text-zinc-400" />
              Edit
            </button>
          )}

          <button
            id="preview-print-btn"
            onClick={handlePrint}
            className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg border border-zinc-700 transition-colors"
            title="Print A4 Form"
          >
            <Printer className="w-3.5 h-3.5 text-zinc-300" />
            Print Form
          </button>

          <button
            id="preview-download-pdf-btn"
            onClick={() => downloadSinglePdf(traveler)}
            className="flex items-center gap-1.5 text-xs font-medium px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg shadow-lg hover:shadow-indigo-500/20 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            Download PDF
          </button>
        </div>
      </div>

      {/* Sheet Container with Zoom */}
      <div className="flex-1 overflow-auto p-4 sm:p-6 flex justify-center items-start bg-zinc-950">
        <div
          style={{ transform: `scale(${scale})`, transformOrigin: 'top center' }}
          className="transition-transform duration-150 ease-out my-2"
        >
          {/* Exact Replica of PDF Page (A4 Aspect Ratio: 210mm x 297mm) */}
          <div
            id="pdf-printable-taf"
            className="w-[794px] h-[1123px] max-h-[1123px] bg-white shadow-2xl pt-4 px-[32px] pb-4 text-black font-sans border border-zinc-700 relative select-text box-border flex flex-col justify-between"
            style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}
          >
            <div>
              {/* Header: Official CCS JV Logo */}
              <div className="flex justify-center items-center -mt-1 mb-1.5">
                <img
                  src={CCS_JV_LOGO_BASE64}
                  alt="CCS JV Logo"
                  className="h-14 w-auto max-w-[240px] object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Title */}
              <h1 className="text-center font-bold text-[14px] tracking-wide text-black mb-1">
                TRAVEL & ACCOMMODATION REQUEST-SITE TRAVEL
              </h1>

              {/* Instruction notices */}
              <div className="text-[9px] leading-tight font-bold text-black mb-2">
                <p>
                  This form is required for all CCS JV employees/sub contractors. Complete the form, attach your passport and send to CCSJV at a minimum of{' '}
                  <span className="text-[#ed1c24]">10 business days for charter flights.</span>
                </p>
                <p className="mt-0.5">
                  If this form is not properly completed and fully approved CCS JV travel team will not proceed with any booking.
                </p>
              </div>

              {/* Luggage Banner + Office Use / Emergency Top Section */}
              <div className="grid grid-cols-12 gap-2 mb-2">
                {/* Left 8 cols: Luggage Box & Emergency Contact */}
                <div className="col-span-8 flex flex-col justify-between">
                  {/* Green Luggage banner */}
                  <div className="bg-[#8dc63f] text-black px-2 py-1 text-[8px] font-bold leading-tight mb-1 border border-black/20">
                    Luggage allowance: Maputo/Pemba-Afungi-Pemba/Maputo on charter flight 1 piece 23kg check-in and 1 piece 5kg carry-on/ Pemba-Afungi-Pemba.
                  </div>

                  {/* Emergency Contact Yellow Box */}
                  <div className="bg-[#fff200] border border-black text-center text-[8.5px] py-1 px-2 w-[210px]">
                    <div className="font-bold border-b border-black pb-0.5 mb-0.5 text-[9px]">
                      CCSJV Emergency Contact Info
                    </div>
                    <div className="font-bold">TRAVEL</div>
                    <div className="font-bold text-[9.5px] text-black mb-0.5">+258 841300027</div>
                    <div className="border-t border-black pt-0.5">
                      <span className="font-bold">Security: </span>
                      <span>Hendrik Theron +258 843312798</span>
                    </div>
                  </div>
                </div>

                {/* Right 4 cols: Office Use & Class Type */}
                <div className="col-span-4 flex flex-col items-end">
                  <div className="w-[140px] border border-black text-center text-[8.5px]">
                    <div className="bg-white font-bold py-0.5 border-b border-black">Office Use</div>
                    <div className="bg-white font-bold py-0.5 border-b border-black">CLASS TYPE</div>
                    <div className="grid grid-cols-2">
                      <div className="py-0.5 border-r border-black font-normal bg-white">Economy</div>
                      <div className="py-0.5 bg-[#fff200] font-bold">YES</div>
                    </div>
                  </div>
                </div>
              </div>

            {/* SECTION 1 - TRAVELER INFORMATION */}
            <div className="border border-black mb-3">
              {/* Section 1 Header */}
              <div className="border-b border-black text-center py-0.5 bg-white">
                <span className="text-[#ed1c24] font-bold text-[10px]">
                  SECTION 1 - TRAVELER INFORMATION (to be filled by the traveler/travel arranger)
                </span>
              </div>

              {/* Grid 1: Surname, Name/Gender, Final Destination, Rotation Type */}
              <div className="grid grid-cols-12 bg-black text-white text-[9px] font-bold text-center border-b border-black">
                <div className="col-span-3 py-1 border-r border-slate-600">SURNAME</div>
                <div className="col-span-4 py-1 border-r border-slate-600">NAME / GENDER</div>
                <div className="col-span-2 py-1 border-r border-slate-600">FINAL DESTINATION</div>
                <div className="col-span-3 py-1">ROTATION TYPE</div>
              </div>
              <div className="grid grid-cols-12 text-[10px] text-center italic border-b border-black bg-white min-h-[22px] items-center">
                <div className="col-span-3 py-1 border-r border-black font-medium">{traveler.surname}</div>
                <div className="col-span-4 py-1 border-r border-black font-medium">{traveler.nameAndGender}</div>
                <div className="col-span-2 py-1 border-r border-black font-medium">{traveler.finalDestination}</div>
                <div className="col-span-3 py-1 font-medium">{traveler.rotationType}</div>
              </div>

              {/* PURPOSE OF TRIP */}
              <div className="border-b border-black text-center py-0.5 bg-slate-50 font-bold text-[9.5px]">
                PURPOSE OF TRIP
              </div>
              <div className="grid grid-cols-3 text-[9px] border-b border-black">
                <div className="border-r border-black p-1.5 flex items-center justify-between">
                  <span className="font-bold">Business Trip</span>
                  <div className="w-5 h-5 border border-black flex items-center justify-center font-bold text-[12px] text-blue-700">
                    {isBusinessTrip ? 'X' : ''}
                  </div>
                </div>
                <div className="border-r border-black p-1.5 flex items-center justify-between">
                  <span className="font-bold">Rotational Leave</span>
                  <div className="w-5 h-5 border border-black flex items-center justify-center font-bold text-[12px] text-blue-700">
                    {isRotationalLeave ? 'X' : ''}
                  </div>
                </div>
                <div className="p-1.5 flex items-center justify-between">
                  <span className="font-bold">Mobilization</span>
                  <div className="w-5 h-5 border border-black flex items-center justify-center font-bold text-[12px] text-blue-700">
                    {isMobilization ? 'X' : ''}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 text-[9px] border-b border-black">
                <div className="border-r border-black p-1.5 flex items-center justify-between">
                  <span className="font-bold">Emergency Leave</span>
                  <div className="w-5 h-5 border border-black flex items-center justify-center font-bold text-[12px] text-blue-700">
                    {isEmergencyLeave ? 'X' : ''}
                  </div>
                </div>
                <div className="border-r border-black p-1.5 flex items-center justify-between">
                  <span className="font-bold">Visa Application</span>
                  <div className="w-5 h-5 border border-black flex items-center justify-center font-bold text-[12px] text-blue-700">
                    {isVisaApplication ? 'X' : ''}
                  </div>
                </div>
                <div className="p-1.5 flex items-center justify-between">
                  <span className="font-bold">Demobilization</span>
                  <div className="w-5 h-5 border border-black flex items-center justify-center font-bold text-[12px] text-blue-700">
                    {isDemobilization ? 'X' : ''}
                  </div>
                </div>
              </div>

              {/* Grid 2: Company ID, Company, Job Title, Project Dept */}
              <div className="grid grid-cols-12 bg-slate-50 text-[9px] font-bold text-center border-b border-black">
                <div className="col-span-3 py-1 border-r border-black">COMPANY ID</div>
                <div className="col-span-3 py-1 border-r border-black">COMPANY</div>
                <div className="col-span-3 py-1 border-r border-black">PROJECT POSITION / JOB TITLE</div>
                <div className="col-span-3 py-1">PROJECT DEPARTMENT</div>
              </div>
              <div className="grid grid-cols-12 text-[9.5px] text-center border-b border-black bg-white min-h-[22px] items-center">
                <div className="col-span-3 py-1 border-r border-black">{traveler.companyId}</div>
                <div className="col-span-3 py-1 border-r border-black">{traveler.company}</div>
                <div className="col-span-3 py-1 border-r border-black font-semibold">{traveler.projectPosition}</div>
                <div className="col-span-3 py-1">{traveler.projectDepartment}</div>
              </div>

              {/* Grid 3: Mobile Number, Email Address, Substitute, Frequent Flyer */}
              <div className="grid grid-cols-12 bg-slate-50 text-[9px] font-bold text-center border-b border-black">
                <div className="col-span-3 py-1 border-r border-black">MOBILE NUMBER</div>
                <div className="col-span-3 py-1 border-r border-black">EMAIL ADDRESS</div>
                <div className="col-span-3 py-1 border-r border-black">SUBSTITUTE IN MY ABSENCE</div>
                <div className="col-span-3 py-1">FREQUENT FLYER CARD</div>
              </div>
              <div className="grid grid-cols-12 text-[9.5px] text-center border-b border-black bg-white min-h-[22px] items-center">
                <div className="col-span-3 py-1 border-r border-black">{traveler.mobileNumber || '-'}</div>
                <div className="col-span-3 py-1 border-r border-black bg-[#fffde6] text-blue-700 font-mono text-[8.5px] truncate px-1">
                  {traveler.emailAddress}
                </div>
                <div className="col-span-3 py-1 border-r border-black">{traveler.substituteInAbsence || 'N/A'}</div>
                <div className="col-span-3 py-1">{traveler.frequentFlyerCard || 'N/A'}</div>
              </div>

              {/* Grid 4: Passport / ID, DOB, Nationality, Passport Expiry */}
              <div className="grid grid-cols-12 bg-slate-50 text-[9px] font-bold text-center border-b border-black">
                <div className="col-span-3 py-1 border-r border-black">PASSPORT/ NATIONAL ID NUMBER</div>
                <div className="col-span-3 py-1 border-r border-black">DATE OF BIRTH</div>
                <div className="col-span-3 py-1 border-r border-black">NATIONALITY</div>
                <div className="col-span-3 py-1">PASSPORT EXPIRY DATE</div>
              </div>
              <div className="grid grid-cols-12 text-[9.5px] text-center bg-white min-h-[22px] items-center">
                <div className="col-span-3 py-1 border-r border-black font-mono">{traveler.passportOrIdNumber}</div>
                <div className="col-span-3 py-1 border-r border-black italic">{traveler.dateOfBirth}</div>
                <div className="col-span-3 py-1 border-r border-black">{traveler.nationality}</div>
                <div className="col-span-3 py-1 italic">{traveler.passportExpiryDate}</div>
              </div>
            </div>

            {/* SECTION 2 - FLIGHT TRAVEL PLAN */}
            <div className="border border-black mb-3">
              {/* Section 2 Header */}
              <div className="border-b border-black text-center py-0.5 bg-white">
                <span className="text-[#ed1c24] font-bold text-[10px]">
                  SECTION 2 - FLIGHT TRAVEL PLAN (to be filled by the traveler)
                </span>
              </div>
              {/* Warning Notice */}
              <div className="border-b border-black text-center py-0.5 bg-white">
                <span className="text-[#ed1c24] italic text-[8.5px] font-medium">
                  Flight departure to & from Maputo/Pemba and Site with less than 4 business days notification will be postponed to ensure at least 4 business days notification is given
                </span>
              </div>

              {/* Table Subtitle: FLIGHTS & TRANSPORTATION */}
              <div className="border-b border-black text-center py-0.5 bg-slate-50 font-bold text-[9.5px]">
                FLIGHTS &TRANSPORTATION - INDICATE PREFERED FLIGHT DETAILS
              </div>

              {/* Flights Table */}
              <div className="grid grid-cols-12 bg-white text-[8.5px] font-bold text-center border-b border-black">
                <div className="col-span-2 py-1 border-r border-black">DATE</div>
                <div className="col-span-2 py-1 border-r border-black">FROM</div>
                <div className="col-span-2 py-1 border-r border-black">TO</div>
                <div className="col-span-2 py-1 border-r border-black">DEPARTURE TIME</div>
                <div className="col-span-2 py-1 border-r border-black">ARRIVAL TIME</div>
                <div className="col-span-2 py-1">AIRLINE & FLIGHT NUMBER</div>
              </div>

              {/* Row 1: Primary Flight */}
              <div className="grid grid-cols-12 text-[9px] text-center border-b border-black bg-white min-h-[20px] items-center">
                <div className="col-span-2 py-0.5 border-r border-black font-medium">{flight1.date}</div>
                <div className="col-span-2 py-0.5 border-r border-black font-medium">{flight1.from}</div>
                <div className="col-span-2 py-0.5 border-r border-black font-medium">{flight1.to}</div>
                <div className="col-span-2 py-0.5 border-r border-black font-medium">{flight1.departureTime}</div>
                <div className="col-span-2 py-0.5 border-r border-black font-medium">{flight1.arrivalTime}</div>
                <div className="col-span-2 py-0.5 font-medium">{flight1.airlineAndFlightNo}</div>
              </div>

              {/* Empty Rows 2, 3, 4 for flight plan */}
              {[1, 2, 3].map(idx => (
                <div key={idx} className="grid grid-cols-12 text-[9px] text-center border-b border-black bg-white min-h-[18px]">
                  <div className="col-span-2 border-r border-black"></div>
                  <div className="col-span-2 border-r border-black"></div>
                  <div className="col-span-2 border-r border-black"></div>
                  <div className="col-span-2 border-r border-black"></div>
                  <div className="col-span-2 border-r border-black"></div>
                  <div className="col-span-2"></div>
                </div>
              ))}

              {/* Table Subtitle: ACCOMMODATION */}
              <div className="border-b border-black text-center py-0.5 bg-slate-50 font-bold text-[9.5px]">
                ACCOMMODATION - INDICATE ACCOMMODATION REQUIRED
              </div>

              {/* Accommodation Table */}
              <div className="grid grid-cols-12 bg-white text-[8.5px] font-bold text-center border-b border-black">
                <div className="col-span-2 py-1 border-r border-black">CHECK-IN</div>
                <div className="col-span-2 py-1 border-r border-black">CHECK-OUT</div>
                <div className="col-span-3 py-1 border-r border-black">HOTEL / CAMP</div>
                <div className="col-span-3 py-1 border-r border-black">LOCATION</div>
                <div className="col-span-2 py-1">NOTES</div>
              </div>

              {/* Row 1: Accommodation details */}
              <div className="grid grid-cols-12 text-[9px] text-center border-b border-black bg-white min-h-[20px] items-center">
                <div className="col-span-2 py-0.5 border-r border-black font-medium">{acc1.checkIn}</div>
                <div className="col-span-2 py-0.5 border-r border-black font-medium">{acc1.checkOut}</div>
                <div className="col-span-3 py-0.5 border-r border-black font-medium">{acc1.hotelOrCamp}</div>
                <div className="col-span-3 py-0.5 border-r border-black font-medium">{acc1.location}</div>
                <div className="col-span-2 py-0.5 font-medium">{acc1.notes}</div>
              </div>

              {/* Empty Accommodation rows */}
              {[1, 2, 3].map(idx => (
                <div key={idx} className="grid grid-cols-12 text-[9px] text-center border-b border-black bg-white min-h-[18px]">
                  <div className="col-span-2 border-r border-black"></div>
                  <div className="col-span-2 border-r border-black"></div>
                  <div className="col-span-3 border-r border-black"></div>
                  <div className="col-span-3 border-r border-black"></div>
                  <div className="col-span-2"></div>
                </div>
              ))}
            </div>

            {/* SECTION 5 - APPROVAL SIGNATURES */}
            <div className="border border-black mb-4">
              {/* Section 5 Header */}
              <div className="border-b border-black text-center py-0.5 bg-white">
                <span className="text-[#ed1c24] font-bold text-[10px]">
                  SECTION 5 - APPROVAL SIGNATURES (sign & print name)
                </span>
              </div>

              <div className="grid grid-cols-3 min-h-[85px] bg-white">
                {/* Column 1: Traveler Signature */}
                <div className="border-r border-black p-2 flex flex-col justify-between">
                  <div className="text-[9px]">
                    <span className="font-semibold">Date: </span>
                    <span className="font-bold">{traveler.signatureDate || '06 AUGUST 2026'}</span>
                  </div>

                  {/* Official Digital Signature Graphic */}
                  <div className="my-0.5 py-0.5 flex flex-col items-center justify-center">
                    <img
                      src={traveler.signatureImage || ERIC_MATOLA_SIGNATURE_BASE64}
                      alt="Signature"
                      className="h-10 w-auto max-w-[130px] object-contain select-none mix-blend-multiply"
                      referrerPolicy="no-referrer"
                    />
                    <span className="font-serif italic text-blue-950 font-semibold text-[11px] border-t border-slate-300 pt-0.5 mt-0.5 px-2">
                      {traveler.signatureName || DEFAULT_SIGNATURE_NAME}
                    </span>
                  </div>

                  <div className="text-[8px] italic leading-tight text-center text-slate-700">
                    By signing I confirm all information provided is true and accurate
                  </div>
                </div>

                {/* Column 2: Supervisor Signature */}
                <div className="border-r border-black p-2 flex flex-col justify-between">
                  <div className="text-[9px]">
                    <span className="font-semibold">Date:</span>
                  </div>
                  <div className="h-6"></div>
                  <div className="text-[8.5px] italic text-center text-slate-700">
                    CCSJV Head / Supervisor of Department
                  </div>
                </div>

                {/* Column 3: HR Site Representative */}
                <div className="p-2 flex flex-col justify-between">
                  <div className="text-[9px]">
                    <span className="font-semibold">Date:</span>
                  </div>
                  <div className="h-6"></div>
                  <div className="text-[8.5px] italic text-center text-slate-700">
                    CCSJV HR Site Representative
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-[9px] text-slate-500 pt-1.5 border-t border-slate-200">
            # Saipem Classification - General Use
          </div>
        </div>
      </div>
    </div>
  </div>
);
};
