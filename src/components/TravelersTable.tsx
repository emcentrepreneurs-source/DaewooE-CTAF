import React, { useState, useMemo } from 'react';
import { TravelerRecord } from '../types';
import {
  Search,
  CheckSquare,
  Square,
  FileDown,
  Eye,
  Edit,
  Trash2,
  SlidersHorizontal,
  FileArchive,
  Layers,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Users,
  UserPlus,
  Clock,
  Calendar,
  FileSignature,
  Filter,
  Sparkles
} from 'lucide-react';
import { downloadSinglePdf } from '../utils/zipExporter';
import {
  validateTravelerDatesAndTimes,
  validatePassportExpiry,
  validateDate
} from '../utils/dateTimeValidation';

export interface TravelerCriticalIssues {
  isCritical: boolean;
  hasWarning: boolean;
  missingPassportNumber: boolean;
  missingPassportExpiry: boolean;
  isPassportExpired: boolean;
  passportExpiringSoon: boolean;
  passportExpiryMessage?: string;
  missingFlightDate: boolean;
  isFlightDateInvalid: boolean;
  flightDateMessage?: string;
  missingFlightRoute: boolean;
  missingFlightTimes: boolean;
  missingSurname: boolean;
  missingOrInvalidDob: boolean;
  dobMessage?: string;
  criticalErrors: string[];
  warnings: string[];
}

export function getTravelerCriticalIssues(t: TravelerRecord): TravelerCriticalIssues {
  const criticalErrors: string[] = [];
  const warnings: string[] = [];

  let missingPassportNumber = false;
  let missingPassportExpiry = false;
  let isPassportExpired = false;
  let passportExpiringSoon = false;
  let passportExpiryMessage: string | undefined;

  let missingFlightDate = false;
  let isFlightDateInvalid = false;
  let flightDateMessage: string | undefined;
  let missingFlightRoute = false;
  let missingFlightTimes = false;

  let missingSurname = false;
  let missingOrInvalidDob = false;
  let dobMessage: string | undefined;

  const dtStatus = validateTravelerDatesAndTimes(t);
  const flight = t.flights?.[0];

  // 1. Passport / ID Expiry Check
  if (!t.passportExpiryDate || t.passportExpiryDate.trim() === '') {
    missingPassportExpiry = true;
    passportExpiryMessage = 'Passport / ID Expiry date is missing';
    criticalErrors.push('Missing Passport / ID Expiry date');
  } else {
    const expVal = validatePassportExpiry(t.passportExpiryDate, flight?.date);
    if (!expVal.isValid) {
      isPassportExpired = true;
      passportExpiryMessage = expVal.error || 'Passport/ID has expired';
      criticalErrors.push(expVal.error || 'Passport/ID has expired');
    } else if (expVal.isWarning) {
      passportExpiringSoon = true;
      passportExpiryMessage = expVal.warning || 'Passport expires in less than 6 months';
      warnings.push(expVal.warning || 'Passport expires in less than 6 months');
    }
  }

  // 2. Passport / ID Number Check
  if (!t.passportOrIdNumber || t.passportOrIdNumber.trim() === '') {
    missingPassportNumber = true;
    criticalErrors.push('Missing Passport or National ID Number');
  }

  // 3. Flight Date & Route Check
  if (!flight || !flight.date || flight.date.trim() === '') {
    missingFlightDate = true;
    flightDateMessage = 'Flight date is missing';
    criticalErrors.push('Missing Flight Date');
  } else {
    const fDateVal = validateDate(flight.date, 'Flight Date');
    if (!fDateVal.isValid) {
      isFlightDateInvalid = true;
      flightDateMessage = fDateVal.error || 'Invalid flight date format';
      criticalErrors.push(fDateVal.error || 'Invalid flight date format');
    }
  }

  if (!flight || !flight.from || !flight.to || flight.from.trim() === '' || flight.to.trim() === '') {
    missingFlightRoute = true;
    criticalErrors.push('Flight origin or destination route missing');
  }

  if (dtStatus.errors.departureTime || dtStatus.errors.arrivalTime) {
    missingFlightTimes = true;
    criticalErrors.push(dtStatus.errors.departureTime || dtStatus.errors.arrivalTime || 'Invalid flight times');
  }

  // 4. Surname Check
  if (!t.surname || t.surname.trim() === '') {
    missingSurname = true;
    criticalErrors.push('Missing Traveler Surname');
  }

  // 5. Date of Birth Check
  if (!t.dateOfBirth || t.dateOfBirth.trim() === '') {
    missingOrInvalidDob = true;
    dobMessage = 'Date of birth is missing';
    criticalErrors.push('Missing Date of Birth');
  } else if (dtStatus.errors.dateOfBirth) {
    missingOrInvalidDob = true;
    dobMessage = dtStatus.errors.dateOfBirth;
    criticalErrors.push(dtStatus.errors.dateOfBirth);
  }

  // 6. Inherit any other validation errors from record
  if (t.validationErrors && t.validationErrors.length > 0) {
    t.validationErrors.forEach(err => {
      if (!criticalErrors.includes(err) && !warnings.includes(err)) {
        criticalErrors.push(err);
      }
    });
  }

  // Inherit other dtStatus warnings
  Object.values(dtStatus.warnings).forEach(warn => {
    if (!warnings.includes(warn)) {
      warnings.push(warn);
    }
  });

  const isCritical = criticalErrors.length > 0 || t.isValid === false;
  const hasWarning = !isCritical && (warnings.length > 0 || Object.keys(dtStatus.warnings).length > 0);

  return {
    isCritical,
    hasWarning,
    missingPassportNumber,
    missingPassportExpiry,
    isPassportExpired,
    passportExpiringSoon,
    passportExpiryMessage,
    missingFlightDate,
    isFlightDateInvalid,
    flightDateMessage,
    missingFlightRoute,
    missingFlightTimes,
    missingSurname,
    missingOrInvalidDob,
    dobMessage,
    criticalErrors,
    warnings
  };
}

interface TravelersTableProps {
  travelers: TravelerRecord[];
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onSelectAll: (selectAll: boolean) => void;
  onPreviewTraveler: (traveler: TravelerRecord) => void;
  onEditTraveler: (traveler: TravelerRecord) => void;
  onDeleteTraveler: (id: string) => void;
  onAddTraveler?: () => void;
  onOpenScanner?: () => void;
  onOpenSignatureModal?: () => void;
  onBatchSettings: () => void;
  onBatchZipDownload: (selectedOnly?: boolean) => void;
  onCombinedPdfDownload: (selectedOnly?: boolean) => void;
  isProcessingBatch?: boolean;
}

export const TravelersTable: React.FC<TravelersTableProps> = ({
  travelers,
  selectedIds,
  onToggleSelect,
  onSelectAll,
  onPreviewTraveler,
  onEditTraveler,
  onDeleteTraveler,
  onAddTraveler,
  onOpenScanner,
  onOpenSignatureModal,
  onBatchSettings,
  onBatchZipDownload,
  onCombinedPdfDownload,
  isProcessingBatch = false
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCompany, setFilterCompany] = useState<string>('ALL');
  const [filterPurpose, setFilterPurpose] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'NEEDS_FIX' | 'WARNINGS' | 'READY'>('ALL');

  // Unique companies
  const companies = useMemo(() => {
    const set = new Set<string>();
    travelers.forEach(t => {
      if (t.company) set.add(t.company);
    });
    return Array.from(set);
  }, [travelers]);

  // Unique purposes
  const purposes = useMemo(() => {
    const set = new Set<string>();
    travelers.forEach(t => {
      if (t.purposeOfTrip) set.add(t.purposeOfTrip);
    });
    return Array.from(set);
  }, [travelers]);

  // Status counts for the whole manifest
  const { criticalCount, warningCount, readyCount } = useMemo(() => {
    let critical = 0;
    let warning = 0;
    let ready = 0;
    travelers.forEach(t => {
      const iss = getTravelerCriticalIssues(t);
      if (iss.isCritical) critical++;
      else if (iss.hasWarning) warning++;
      else ready++;
    });
    return { criticalCount: critical, warningCount: warning, readyCount: ready };
  }, [travelers]);

  // Filtered list
  const filteredTravelers = useMemo(() => {
    return travelers.filter(t => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        t.surname.toLowerCase().includes(q) ||
        t.nameAndGender.toLowerCase().includes(q) ||
        t.companyId.toLowerCase().includes(q) ||
        t.passportOrIdNumber.toLowerCase().includes(q) ||
        t.projectPosition.toLowerCase().includes(q) ||
        t.company.toLowerCase().includes(q);

      const matchesCompany = filterCompany === 'ALL' || t.company === filterCompany;
      const matchesPurpose = filterPurpose === 'ALL' || t.purposeOfTrip === filterPurpose;

      const issues = getTravelerCriticalIssues(t);
      const matchesStatus =
        filterStatus === 'ALL' ||
        (filterStatus === 'NEEDS_FIX' && issues.isCritical) ||
        (filterStatus === 'WARNINGS' && !issues.isCritical && issues.hasWarning) ||
        (filterStatus === 'READY' && !issues.isCritical && !issues.hasWarning);

      return matchesSearch && matchesCompany && matchesPurpose && matchesStatus;
    });
  }, [travelers, searchQuery, filterCompany, filterPurpose, filterStatus]);

  const isAllSelected = filteredTravelers.length > 0 && filteredTravelers.every(t => selectedIds.includes(t.id));
  const isSomeSelected = filteredTravelers.some(t => selectedIds.includes(t.id)) && !isAllSelected;

  return (
    <div className="bg-zinc-900 rounded-2xl border border-zinc-800 shadow-xl overflow-hidden">
      {/* Top Action & Stats Bar */}
      <div className="p-4 sm:p-5 border-b border-zinc-800 bg-zinc-900/60">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700/60 text-indigo-400 flex items-center justify-center font-bold shadow-inner">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-zinc-100">
                  Traveler Manifest ({travelers.length} Total)
                </h3>
                {criticalCount > 0 && (
                  <button
                    onClick={() => setFilterStatus(prev => prev === 'NEEDS_FIX' ? 'ALL' : 'NEEDS_FIX')}
                    className="text-xs bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1 cursor-pointer transition-colors"
                    title="Click to filter travelers needing critical information fixed"
                  >
                    <AlertTriangle className="w-3 h-3 text-rose-400" />
                    {criticalCount} Need Fix
                  </button>
                )}
                {selectedIds.length > 0 && (
                  <span className="text-xs bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-medium px-2.5 py-0.5 rounded-full">
                    {selectedIds.length} Selected
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Review loaded travelers, customize details, or trigger bulk generation of all TAF PDFs.
              </p>
            </div>
          </div>

          {/* Bulk Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            {onAddTraveler && (
              <button
                id="add-traveler-btn"
                onClick={onAddTraveler}
                className="flex items-center gap-1.5 text-xs font-medium px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg border border-zinc-700 transition-colors cursor-pointer"
                title="Add a new traveler record to the manifest"
              >
                <UserPlus className="w-3.5 h-3.5 text-indigo-400" />
                Add Traveler
              </button>
            )}

            {onOpenSignatureModal && (
              <button
                id="table-signature-automation-btn"
                onClick={onOpenSignatureModal}
                className="flex items-center gap-1.5 text-xs font-medium px-3.5 py-2 bg-zinc-800 hover:bg-indigo-950/70 text-zinc-200 hover:text-indigo-200 rounded-lg border border-zinc-700 hover:border-indigo-600/70 transition-colors cursor-pointer"
                title="Configure signature appending and view Python & Google Docs API scripts"
              >
                <FileSignature className="w-3.5 h-3.5 text-indigo-400" />
                Signature & Scripts
              </button>
            )}

            <button
              id="batch-settings-btn"
              onClick={onBatchSettings}
              disabled={travelers.length === 0}
              className="flex items-center gap-1.5 text-xs font-medium px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg border border-zinc-700 transition-colors disabled:opacity-40 cursor-pointer"
              title="Apply shared flight date, camp, or airline to all travelers in 1 click"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-zinc-400" />
              Batch Set Flight/Camp
            </button>

            <button
              id="download-combined-pdf-btn"
              onClick={() => onCombinedPdfDownload(selectedIds.length > 0)}
              disabled={travelers.length === 0 || isProcessingBatch}
              className="flex items-center gap-1.5 text-xs font-medium px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg border border-zinc-700 transition-colors disabled:opacity-40"
              title="Download single combined multi-page PDF document with all travelers"
            >
              <Layers className="w-3.5 h-3.5 text-zinc-400" />
              Combined Multi-page PDF
            </button>

            <button
              id="generate-all-zip-btn"
              onClick={() => onBatchZipDownload(selectedIds.length > 0)}
              disabled={travelers.length === 0 || isProcessingBatch}
              className="flex items-center gap-2 text-xs font-medium px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg shadow-lg hover:shadow-indigo-500/20 transition-all disabled:opacity-40"
              title="Generate individual PDF for each traveler and download packaged in ZIP"
            >
              <FileArchive className="w-4 h-4" />
              {isProcessingBatch
                ? 'Processing Batch...'
                : selectedIds.length > 0
                ? `Generate ${selectedIds.length} TAF PDFs (ZIP)`
                : `Generate All ${travelers.length} TAF PDFs (ZIP)`}
            </button>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="mt-4 pt-4 border-t border-zinc-800 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Search box */}
          <div className="flex items-center gap-2 flex-1 max-w-xl">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                id="traveler-search-input"
                type="text"
                placeholder="Search by name, company ID, passport, position..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-14 py-2 text-xs bg-zinc-800/90 border border-zinc-700 text-zinc-100 placeholder:text-zinc-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200 text-[10px] bg-zinc-700/70 hover:bg-zinc-600 px-1.5 py-0.5 rounded cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            {/* Status Filter */}
            <select
              id="status-filter"
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value as any)}
              className={`text-xs border rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${
                filterStatus === 'NEEDS_FIX'
                  ? 'bg-rose-950/80 border-rose-600 text-rose-200 font-semibold'
                  : 'bg-zinc-800 border-zinc-700 text-zinc-200'
              }`}
            >
              <option value="ALL">All Records ({travelers.length})</option>
              <option value="NEEDS_FIX">
                ⚠️ Needs Fix ({criticalCount})
              </option>
              {warningCount > 0 && (
                <option value="WARNINGS">
                  🕒 Review / Warnings ({warningCount})
                </option>
              )}
              <option value="READY">
                ✅ Ready ({readyCount})
              </option>
            </select>

            {/* Company Filter */}
            <select
              id="company-filter"
              value={filterCompany}
              onChange={e => setFilterCompany(e.target.value)}
              className="text-xs bg-zinc-800 border border-zinc-700 text-zinc-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ALL">All Companies ({travelers.length})</option>
              {companies.map(c => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            {/* Purpose Filter */}
            <select
              id="purpose-filter"
              value={filterPurpose}
              onChange={e => setFilterPurpose(e.target.value)}
              className="text-xs bg-zinc-800 border border-zinc-700 text-zinc-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ALL">All Purposes</option>
              {purposes.map(p => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Attention Notice Banner if any record has critical issues */}
        {criticalCount > 0 && (
          <div className="mt-4 p-3 bg-rose-950/25 border border-rose-500/40 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0 border border-rose-500/30">
                <AlertCircle className="w-4 h-4" />
              </div>
              <div>
                <span className="font-semibold text-rose-100">
                  {criticalCount} record{criticalCount > 1 ? 's have' : ' has'} missing or invalid critical info:
                </span>{' '}
                <span className="text-rose-300/90">
                  Passport expiry or flight dates are missing or invalid. Highlighted in red below with direct 1-click fix shortcuts.
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                id="filter-critical-toggle-btn"
                onClick={() => setFilterStatus(prev => (prev === 'NEEDS_FIX' ? 'ALL' : 'NEEDS_FIX'))}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer border flex items-center gap-1.5 ${
                  filterStatus === 'NEEDS_FIX'
                    ? 'bg-rose-600 hover:bg-rose-500 text-white border-rose-400'
                    : 'bg-rose-950/60 hover:bg-rose-900/80 text-rose-200 border-rose-700/60'
                }`}
              >
                <Filter className="w-3.5 h-3.5" />
                {filterStatus === 'NEEDS_FIX' ? 'Show All Travelers' : `View ${criticalCount} Needing Fix`}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto max-h-[500px]">
        <table className="w-full text-left border-collapse text-xs">
          <thead className="bg-zinc-950/80 text-zinc-400 font-medium border-b border-zinc-800 sticky top-0 z-10">
            <tr>
              <th className="py-2.5 px-3 w-10 text-center">
                <button
                  id="select-all-checkbox"
                  onClick={() => onSelectAll(!isAllSelected)}
                  className="text-zinc-500 hover:text-indigo-400 focus:outline-none"
                  title={isAllSelected ? 'Deselect All' : 'Select All'}
                >
                  {isAllSelected ? (
                    <CheckSquare className="w-4 h-4 text-indigo-400" />
                  ) : isSomeSelected ? (
                    <div className="w-4 h-4 bg-indigo-500 text-white rounded-xs flex items-center justify-center text-[10px] font-bold">
                      -
                    </div>
                  ) : (
                    <Square className="w-4 h-4 text-zinc-600" />
                  )}
                </button>
              </th>
              <th className="py-2.5 px-3">#</th>
              <th className="py-2.5 px-3">SURNAME & GIVEN NAME</th>
              <th className="py-2.5 px-3">COMPANY / ID</th>
              <th className="py-2.5 px-3">POSITION & DEPT</th>
              <th className="py-2.5 px-3">PASSPORT / ID</th>
              <th className="py-2.5 px-3">FLIGHT / ROUTE</th>
              <th className="py-2.5 px-3">CAMP</th>
              <th className="py-2.5 px-3">STATUS</th>
              <th className="py-2.5 px-3 text-right">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {filteredTravelers.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-12 text-center text-zinc-500">
                  {filterStatus === 'NEEDS_FIX' ? (
                    <div className="flex flex-col items-center gap-2">
                      <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                      <p className="text-zinc-300 font-medium">All records are verified and complete!</p>
                      <p className="text-xs text-zinc-500">No travelers have missing passport expiry or flight dates.</p>
                      <button
                        onClick={() => setFilterStatus('ALL')}
                        className="mt-2 px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs transition-colors cursor-pointer"
                      >
                        Show All Travelers
                      </button>
                    </div>
                  ) : (
                    'No travelers match your search criteria.'
                  )}
                </td>
              </tr>
            ) : (
              filteredTravelers.map((t, idx) => {
                const isSelected = selectedIds.includes(t.id);
                const flight = t.flights?.[0];
                const acc = t.accommodation?.[0];
                const issues = getTravelerCriticalIssues(t);

                // Row highlighting based on critical status
                let rowBgClasses = '';
                if (isSelected) {
                  if (issues.isCritical) {
                    rowBgClasses = 'bg-rose-950/40 hover:bg-rose-950/60 border-l-4 border-l-rose-500';
                  } else if (issues.hasWarning) {
                    rowBgClasses = 'bg-amber-950/30 hover:bg-amber-950/50 border-l-4 border-l-amber-500';
                  } else {
                    rowBgClasses = 'bg-indigo-950/40 hover:bg-indigo-950/60 border-l-4 border-l-transparent';
                  }
                } else {
                  if (issues.isCritical) {
                    rowBgClasses = 'bg-rose-950/20 hover:bg-rose-950/35 border-l-4 border-l-rose-500';
                  } else if (issues.hasWarning) {
                    rowBgClasses = 'bg-amber-950/15 hover:bg-amber-950/30 border-l-4 border-l-amber-500';
                  } else {
                    rowBgClasses = idx % 2 === 0
                      ? 'bg-zinc-900 hover:bg-zinc-800/60 border-l-4 border-l-transparent'
                      : 'bg-zinc-900/60 hover:bg-zinc-800/60 border-l-4 border-l-transparent';
                  }
                }

                return (
                  <tr
                    key={t.id}
                    className={`transition-colors ${rowBgClasses}`}
                  >
                    {/* Checkbox */}
                    <td className="py-2.5 px-3 text-center">
                      <button
                        id={`select-row-${t.id}`}
                        onClick={() => onToggleSelect(t.id)}
                        className="text-zinc-500 hover:text-indigo-400 focus:outline-none"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-indigo-400" />
                        ) : (
                          <Square className="w-4 h-4 text-zinc-600 hover:text-zinc-400" />
                        )}
                      </button>
                    </td>

                    {/* Row Index */}
                    <td className="py-2.5 px-3 font-mono text-[11px]">
                      <div className="flex items-center gap-1.5">
                        <span className={issues.isCritical ? 'text-rose-400 font-semibold' : 'text-zinc-500'}>
                          {idx + 1}
                        </span>
                        {issues.isCritical && (
                          <span title={`${issues.criticalErrors.length} critical issue(s):\n• ${issues.criticalErrors.join('\n• ')}`}>
                            <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Name */}
                    <td className="py-2.5 px-3">
                      <div className="font-semibold text-zinc-100 flex items-center gap-1.5">
                        {issues.missingSurname ? (
                          <span className="text-rose-400 italic bg-rose-500/10 px-1 rounded border border-rose-500/30">
                            [Missing Surname]
                          </span>
                        ) : (
                          <span>{t.surname}</span>
                        )}
                        <span className="font-normal text-zinc-300">
                          {t.nameAndGender.split('/')[0]}
                        </span>
                      </div>
                      <div className="text-[10px] text-zinc-500 flex items-center gap-1.5 mt-0.5 flex-wrap">
                        <span className="bg-zinc-800 border border-zinc-700/80 px-1.5 py-0.2 rounded text-zinc-400">
                          {t.purposeOfTrip}
                        </span>
                        <span>•</span>
                        <span>{t.rotationType}</span>
                      </div>
                    </td>

                    {/* Company & ID */}
                    <td className="py-2.5 px-3">
                      <div className="font-medium text-zinc-200">{t.company}</div>
                      <div className="text-[10px] font-mono text-zinc-500">ID: {t.companyId || '-'}</div>
                    </td>

                    {/* Position */}
                    <td className="py-2.5 px-3">
                      <div className="font-normal text-zinc-200 truncate max-w-[150px]">
                        {t.projectPosition}
                      </div>
                      <div className="text-[10px] text-zinc-500 truncate max-w-[150px]">
                        {t.projectDepartment || '-'}
                      </div>
                    </td>

                    {/* Passport / ID (Critical field highlighting) */}
                    <td className="py-2.5 px-3">
                      {/* ID Number */}
                      {issues.missingPassportNumber ? (
                        <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 font-mono text-[11px] font-semibold mb-1">
                          <AlertTriangle className="w-3 h-3 text-rose-400 shrink-0" />
                          Missing ID Number
                        </div>
                      ) : (
                        <div className="font-mono text-zinc-200 text-[11px] font-medium">
                          {t.passportOrIdNumber}
                        </div>
                      )}

                      {/* Dates row: DOB and Expiry */}
                      <div className="text-[10px] flex flex-wrap items-center gap-1.5 mt-0.5">
                        {/* DOB */}
                        {issues.missingOrInvalidDob ? (
                          <span
                            className="inline-flex items-center gap-0.5 px-1 py-0.2 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 font-medium cursor-help"
                            title={issues.dobMessage || 'Date of Birth is missing or invalid'}
                          >
                            <AlertTriangle className="w-2.5 h-2.5 text-rose-400 shrink-0" />
                            DOB: {t.dateOfBirth || 'Missing'}
                          </span>
                        ) : (
                          <span className="text-zinc-500">DOB: {t.dateOfBirth || '-'}</span>
                        )}

                        <span>•</span>

                        {/* Expiry */}
                        {issues.missingPassportExpiry ? (
                          <span
                            className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-rose-500/25 text-rose-200 border border-rose-500/50 font-bold cursor-help"
                            title="Passport / ID expiry date is required for site security clearance"
                          >
                            <AlertTriangle className="w-2.5 h-2.5 text-rose-400 shrink-0" />
                            Missing Expiry Date
                          </span>
                        ) : issues.isPassportExpired ? (
                          <span
                            className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-rose-500/25 text-rose-200 border border-rose-500/50 font-bold cursor-help"
                            title={issues.passportExpiryMessage}
                          >
                            <AlertTriangle className="w-2.5 h-2.5 text-rose-400 shrink-0" />
                            Expired: {t.passportExpiryDate}
                          </span>
                        ) : issues.passportExpiringSoon ? (
                          <span
                            className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-medium cursor-help"
                            title={issues.passportExpiryMessage}
                          >
                            <Clock className="w-2.5 h-2.5 text-amber-400 shrink-0" />
                            Exp: {t.passportExpiryDate} (&lt;6mo)
                          </span>
                        ) : (
                          <span className="text-zinc-400">Exp: {t.passportExpiryDate || '-'}</span>
                        )}
                      </div>
                    </td>

                    {/* Flight / Route (Critical field highlighting) */}
                    <td className="py-2.5 px-3">
                      {/* Route */}
                      {issues.missingFlightRoute ? (
                        <div className="inline-flex items-center gap-1 text-rose-400 font-semibold text-xs mb-1">
                          <AlertTriangle className="w-3 h-3 text-rose-400 shrink-0" />
                          Route Incomplete
                        </div>
                      ) : (
                        <div className="font-medium text-zinc-200 flex items-center gap-1">
                          <span>{flight?.from || 'PEMBA'}</span>
                          <span className="text-zinc-500">→</span>
                          <span>{flight?.to || 'AFUNGI'}</span>
                        </div>
                      )}

                      {/* Flight Date & Departure */}
                      <div className="text-[10px] flex flex-wrap items-center gap-1.5 mt-0.5">
                        {issues.missingFlightDate ? (
                          <span
                            className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-rose-500/25 text-rose-200 border border-rose-500/50 font-bold cursor-help"
                            title="Flight date is required for charter passenger manifest"
                          >
                            <AlertTriangle className="w-2.5 h-2.5 text-rose-400 shrink-0" />
                            Missing Flight Date
                          </span>
                        ) : issues.isFlightDateInvalid ? (
                          <span
                            className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-rose-500/25 text-rose-200 border border-rose-500/50 font-bold cursor-help"
                            title={issues.flightDateMessage}
                          >
                            <AlertTriangle className="w-2.5 h-2.5 text-rose-400 shrink-0" />
                            Invalid Date: {flight?.date}
                          </span>
                        ) : (
                          <span className="text-zinc-300 font-medium">
                            {flight?.date} • {flight?.departureTime || '06:45'}
                          </span>
                        )}

                        {issues.missingFlightTimes && (
                          <span className="text-rose-400 font-medium" title="Invalid flight departure or arrival time">
                            ⚠️ Time Issue
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Accommodation */}
                    <td className="py-2.5 px-3">
                      <div className="font-medium text-zinc-200">
                        {acc?.hotelOrCamp || '9500'}
                      </div>
                      <div className="text-[10px] text-zinc-500">
                        {acc?.notes || 'SHARED'}
                      </div>
                    </td>

                    {/* Status with Direct Fix Action */}
                    <td className="py-2.5 px-3">
                      {issues.isCritical ? (
                        <button
                          id={`fix-btn-${t.id}`}
                          onClick={() => onEditTraveler(t)}
                          className="inline-flex items-center gap-1.5 bg-rose-500/25 hover:bg-rose-500/35 text-rose-200 text-[11px] font-semibold px-2.5 py-1 rounded-md border border-rose-500/50 shadow-xs group cursor-pointer transition-colors"
                          title={`Record has ${issues.criticalErrors.length} critical issue(s). Click to edit:\n• ${issues.criticalErrors.join('\n• ')}`}
                        >
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0 animate-pulse" />
                          <span>Fix ({issues.criticalErrors.length})</span>
                        </button>
                      ) : issues.hasWarning ? (
                        <span
                          className="inline-flex items-center gap-1 bg-amber-500/20 text-amber-300 text-[10px] font-medium px-2 py-0.5 rounded-full border border-amber-500/35 cursor-help"
                          title={`Warnings:\n• ${issues.warnings.join('\n• ')}`}
                        >
                          <Clock className="w-3 h-3 text-amber-400 shrink-0" />
                          <span>Review</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-emerald-950/60 text-emerald-400 text-[10px] font-medium px-2 py-0.5 rounded-full border border-emerald-800/60">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                          <span>Ready</span>
                        </span>
                      )}
                    </td>

                    {/* Row Actions */}
                    <td className="py-2.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          id={`preview-btn-${t.id}`}
                          onClick={() => onPreviewTraveler(t)}
                          className="p-1.5 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-md transition-colors"
                          title="Preview TAF Document"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          id={`edit-btn-${t.id}`}
                          onClick={() => onEditTraveler(t)}
                          className={`p-1.5 rounded-md transition-colors ${
                            issues.isCritical
                              ? 'text-rose-400 hover:text-rose-200 hover:bg-rose-900/40'
                              : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800'
                          }`}
                          title={issues.isCritical ? "Edit traveler info to fix issues" : "Edit Traveler Info"}
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          id={`download-pdf-${t.id}`}
                          onClick={() => downloadSinglePdf(t)}
                          className="p-1.5 text-indigo-400 hover:text-indigo-300 hover:bg-indigo-950/50 rounded-md transition-colors"
                          title="Download single TAF PDF"
                        >
                          <FileDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          id={`delete-btn-${t.id}`}
                          onClick={() => onDeleteTraveler(t.id)}
                          className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-red-950/40 rounded-md transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer info & Color Legend */}
      <div className="px-4 py-3 bg-zinc-900/90 border-t border-zinc-800 text-xs text-zinc-400 flex flex-col md:flex-row items-center justify-between gap-3">
        <div>
          Showing {filteredTravelers.length} of {travelers.length} travelers
          {filterStatus !== 'ALL' && (
            <button
              onClick={() => setFilterStatus('ALL')}
              className="ml-2 text-indigo-400 hover:underline cursor-pointer font-medium"
            >
              (Clear filter)
            </button>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-3 text-[11px]">
          <span className="flex items-center gap-1.5 text-rose-400 font-medium">
            <span className="w-2.5 h-2.5 rounded-xs bg-rose-500"></span>
            Critical Issue (Passport Expiry, Flight Date, ID)
          </span>
          <span className="text-zinc-700">|</span>
          <span className="flex items-center gap-1.5 text-amber-400">
            <span className="w-2.5 h-2.5 rounded-xs bg-amber-500"></span>
            Warning (Expiring &lt;6mo)
          </span>
          <span className="text-zinc-700">|</span>
          <span className="flex items-center gap-1.5 text-emerald-400">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
            Ready for TAF PDF
          </span>
        </div>
      </div>
    </div>
  );
};

