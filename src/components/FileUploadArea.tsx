import React, { useRef, useState, useEffect } from 'react';
import { UploadCloud, FileSpreadsheet, Download, Sparkles, AlertCircle, CheckCircle2, Camera, ChevronDown, Check, FileText } from 'lucide-react';
import {
  generateTravelersExcelBlob,
  downloadTravelersExcel,
  downloadBlankExcelTemplate,
  downloadSampleExcelTemplate,
  SAMPLE_TRAVELERS
} from '../utils/sampleData';
import { parseExcelFile } from '../utils/excelParser';
import { TravelerRecord } from '../types';

interface FileUploadAreaProps {
  onTravelersLoaded: (travelers: TravelerRecord[], fileName: string) => void;
  onOpenScanner?: () => void;
  isLoading?: boolean;
  savedTravelers?: TravelerRecord[];
  onToast?: (msg: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
}

export const FileUploadArea: React.FC<FileUploadAreaProps> = ({
  onTravelersLoaded,
  onOpenScanner,
  isLoading = false,
  savedTravelers = [],
  onToast
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [lastUploadedName, setLastUploadedName] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const hasSavedTravelers = savedTravelers && savedTravelers.length > 0;

  const handleDownloadSavedTemplate = () => {
    try {
      if (hasSavedTravelers) {
        downloadTravelersExcel(savedTravelers);
        onToast?.(`Downloaded Excel template with ${savedTravelers.length} saved TAF records.`, 'success');
      } else {
        downloadSampleExcelTemplate();
        onToast?.('Downloaded Excel template with 12 sample traveler records.', 'info');
      }
      setIsMenuOpen(false);
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Failed to download Excel template.');
      onToast?.('Failed to download Excel template.', 'error');
    }
  };

  const handleDownloadBlankTemplate = () => {
    try {
      downloadBlankExcelTemplate();
      setIsMenuOpen(false);
      onToast?.('Downloaded blank official TAF Excel template.', 'success');
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Failed to download blank template.');
    }
  };

  const handleDownloadSampleTemplate = () => {
    try {
      downloadSampleExcelTemplate();
      setIsMenuOpen(false);
      onToast?.('Downloaded Excel template with 12 sample traveler records.', 'info');
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Failed to download sample template.');
    }
  };

  const handleLoadSampleData = () => {
    setErrorMsg(null);
    setLastUploadedName('12 Sample Travelers (CCS JV / DAEWOO)');
    onTravelersLoaded(SAMPLE_TRAVELERS, '12 Sample Travelers (Pre-filled Batch)');
  };

  const processFile = async (file: File) => {
    setErrorMsg(null);
    if (!file) return;

    const validExtensions = ['.xlsx', '.xls', '.csv'];
    const hasValidExt = validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));

    if (!hasValidExt) {
      setErrorMsg('Please upload a valid Excel (.xlsx, .xls) or CSV (.csv) file.');
      return;
    }

    try {
      const buffer = await file.arrayBuffer();
      const result = parseExcelFile(buffer);

      if (result.travelers.length === 0) {
        setErrorMsg('No valid traveler rows were found in the uploaded file.');
        return;
      }

      setLastUploadedName(`${file.name} (${result.travelers.length} rows)`);
      onTravelersLoaded(result.travelers, file.name);
    } catch (err: any) {
      console.error('Error parsing file:', err);
      setErrorMsg(err.message || 'Failed to parse Excel file. Please ensure columns match standard TAF headers.');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div className="bg-zinc-900 rounded-2xl border border-zinc-800 shadow-xl p-6 transition-all">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-5">
        <div>
          <h2 className="text-base font-semibold text-zinc-100 flex items-center gap-2.5">
            <FileSpreadsheet className="w-5 h-5 text-indigo-400" />
            Upload Excel Travel Manifest
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Upload your flight schedule or traveler roster (supports batch generation for 10, 50, 100+ travelers in 1 click).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          {onOpenScanner && (
            <button
              id="scan-passport-id-btn"
              onClick={onOpenScanner}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:scale-98 px-3.5 py-2 rounded-lg shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
              title="Scan Passport or National ID card with Camera or Photo Upload"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Scan ID / Passport (AI OCR)</span>
            </button>
          )}

          {/* Download Template Button with Saved TAFs intelligence */}
          <div className="relative flex-1 sm:flex-none" ref={menuRef}>
            <div className="inline-flex rounded-lg shadow-sm w-full">
              <button
                id="download-template-btn"
                onClick={handleDownloadSavedTemplate}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 text-xs font-medium px-3.5 py-2 rounded-l-lg border transition-all cursor-pointer ${
                  hasSavedTravelers
                    ? 'bg-emerald-950/80 hover:bg-emerald-900/90 text-emerald-200 border-emerald-700/70'
                    : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border-zinc-700'
                }`}
                title={
                  hasSavedTravelers
                    ? `Download Excel template populated with your ${savedTravelers.length} saved TAF records`
                    : 'Download ready-to-fill Excel spreadsheet with 12 sample traveler records'
                }
              >
                <FileSpreadsheet className={`w-3.5 h-3.5 ${hasSavedTravelers ? 'text-emerald-400' : 'text-zinc-400'}`} />
                <span>
                  {hasSavedTravelers
                    ? `Download Template (${savedTravelers.length} Saved TAFs)`
                    : 'Download Excel Template (.xlsx)'}
                </span>
              </button>

              <button
                id="download-template-menu-btn"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={`px-2 py-2 rounded-r-lg border-y border-r transition-all cursor-pointer ${
                  hasSavedTravelers
                    ? 'bg-emerald-950/90 hover:bg-emerald-900 text-emerald-300 border-emerald-700/70'
                    : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 border-zinc-700'
                }`}
                title="Template download options (Saved TAFs, Blank Template, Sample)"
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Dropdown Menu */}
            {isMenuOpen && (
              <div className="absolute right-0 mt-1.5 w-72 bg-zinc-900 border border-zinc-700/90 rounded-xl shadow-2xl z-30 py-1.5 overflow-hidden backdrop-blur-md">
                <div className="px-3 py-1.5 border-b border-zinc-800 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                  Template Download Options
                </div>

                {hasSavedTravelers && (
                  <button
                    onClick={handleDownloadSavedTemplate}
                    className="w-full text-left px-3 py-2 text-xs text-emerald-300 hover:bg-emerald-950/60 flex items-center justify-between gap-2 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <div>
                        <div className="font-medium text-zinc-200">With Saved TAF Records</div>
                        <div className="text-[10px] text-zinc-400">{savedTravelers.length} saved records included</div>
                      </div>
                    </div>
                    <span className="text-[10px] bg-emerald-900/80 text-emerald-300 px-1.5 py-0.5 rounded font-mono font-bold">
                      {savedTravelers.length} TAFs
                    </span>
                  </button>
                )}

                <button
                  onClick={handleDownloadBlankTemplate}
                  className="w-full text-left px-3 py-2 text-xs text-zinc-300 hover:bg-zinc-800 flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <div>
                    <div className="font-medium text-zinc-200">Blank Official Template</div>
                    <div className="text-[10px] text-zinc-400">Empty standard headers for distributing to staff</div>
                  </div>
                </button>

                <button
                  onClick={handleDownloadSampleTemplate}
                  className="w-full text-left px-3 py-2 text-xs text-zinc-300 hover:bg-zinc-800 flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <div>
                    <div className="font-medium text-zinc-200">Sample Template (12 Demo Records)</div>
                    <div className="text-[10px] text-zinc-400">Pre-filled with DAEWOO Mozambique LNG examples</div>
                  </div>
                </button>
              </div>
            )}
          </div>

          <button
            id="load-sample-btn"
            onClick={handleLoadSampleData}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 text-xs font-medium text-indigo-300 bg-indigo-950/60 hover:bg-indigo-900/60 px-3.5 py-2 rounded-lg border border-indigo-700/60 transition-colors"
            title="Populate table with 12 real-world styled CCS JV traveler records"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            Load 12 Sample Records
          </button>
        </div>
      </div>

      {hasSavedTravelers && (
        <div className="mb-4 px-3.5 py-2.5 bg-emerald-950/40 border border-emerald-800/60 rounded-xl flex items-center justify-between gap-3 text-xs text-emerald-300">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              <strong>{savedTravelers.length} saved TAF records</strong> currently available. You can download the Excel template containing your saved data anytime.
            </span>
          </div>
          <button
            onClick={handleDownloadSavedTemplate}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-800 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer shrink-0 shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            Download Excel ({savedTravelers.length} TAFs)
          </button>
        </div>
      )}

      {/* Drag & Drop Card */}
      <div
        id="dropzone-area"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
          isDragging
            ? 'border-indigo-500 bg-indigo-950/30 scale-[0.99]'
            : 'border-zinc-800 hover:border-indigo-500/50 bg-zinc-950/40 hover:bg-zinc-950/70'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          onChange={handleFileInputChange}
          className="hidden"
          id="excel-file-input"
        />

        <div className="w-14 h-14 rounded-full bg-zinc-800 flex items-center justify-center mb-3 text-zinc-400 border border-zinc-700/60 shadow-inner">
          <UploadCloud className="w-6 h-6 text-zinc-400" />
        </div>

        <p className="text-sm font-medium text-zinc-200 mb-1">
          Drop Excel source file here or click to browse
        </p>
        <p className="text-xs text-zinc-500 max-w-md">
          Supports <span className="font-medium text-zinc-400">.XLSX</span>, <span className="font-medium text-zinc-400">.XLS</span>, or <span className="font-medium text-zinc-400">.CSV</span> with automatic header detection for Surname, ID, Flights, Camps, and Dates.
        </p>

        {lastUploadedName && (
          <div className="mt-4 inline-flex items-center gap-2 bg-emerald-950/50 text-emerald-300 text-xs font-medium px-3 py-1.5 rounded-lg border border-emerald-800/50">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Loaded: {lastUploadedName}
          </div>
        )}
      </div>

      {/* Error display */}
      {errorMsg && (
        <div className="mt-3 p-3 bg-red-950/40 border border-red-800/50 rounded-xl flex items-center gap-2.5 text-xs text-red-300">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}
    </div>
  );
};
