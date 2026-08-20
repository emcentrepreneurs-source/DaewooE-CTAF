import React, { useRef, useState } from 'react';
import { UploadCloud, FileSpreadsheet, Download, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';
import { generateSampleExcelBlob, SAMPLE_TRAVELERS } from '../utils/sampleData';
import { parseExcelFile } from '../utils/excelParser';
import { TravelerRecord } from '../types';
import { saveAs } from 'file-saver';

interface FileUploadAreaProps {
  onTravelersLoaded: (travelers: TravelerRecord[], fileName: string) => void;
  isLoading?: boolean;
}

export const FileUploadArea: React.FC<FileUploadAreaProps> = ({
  onTravelersLoaded,
  isLoading = false
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [lastUploadedName, setLastUploadedName] = useState<string | null>(null);

  const handleDownloadTemplate = () => {
    try {
      const blob = generateSampleExcelBlob();
      saveAs(blob, 'CCSJV_TAF_Travelers_Template_12_Records.xlsx');
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

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            id="download-template-btn"
            onClick={handleDownloadTemplate}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 text-xs font-medium text-zinc-200 bg-zinc-800 hover:bg-zinc-700 px-3.5 py-2 rounded-lg border border-zinc-700 transition-colors"
            title="Download ready-to-fill Excel spreadsheet with 12 sample traveler records"
          >
            <Download className="w-3.5 h-3.5 text-zinc-400" />
            Download Excel Template (.xlsx)
          </button>

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
