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
  CheckCircle2,
  Users,
  UserPlus
} from 'lucide-react';
import { downloadSinglePdf } from '../utils/zipExporter';

interface TravelersTableProps {
  travelers: TravelerRecord[];
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onSelectAll: (selectAll: boolean) => void;
  onPreviewTraveler: (traveler: TravelerRecord) => void;
  onEditTraveler: (traveler: TravelerRecord) => void;
  onDeleteTraveler: (id: string) => void;
  onAddTraveler?: () => void;
  onManageUsers?: () => void;
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
  onManageUsers,
  onBatchSettings,
  onBatchZipDownload,
  onCombinedPdfDownload,
  isProcessingBatch = false
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCompany, setFilterCompany] = useState<string>('ALL');
  const [filterPurpose, setFilterPurpose] = useState<string>('ALL');

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

      return matchesSearch && matchesCompany && matchesPurpose;
    });
  }, [travelers, searchQuery, filterCompany, filterPurpose]);

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
        <div className="mt-4 pt-4 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Search box */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              id="traveler-search-input"
              type="text"
              placeholder="Search by name, ID, position..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-zinc-800/90 border border-zinc-700 text-zinc-100 placeholder:text-zinc-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
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
                  No travelers match your search criteria.
                </td>
              </tr>
            ) : (
              filteredTravelers.map((t, idx) => {
                const isSelected = selectedIds.includes(t.id);
                const flight = t.flights?.[0];
                const acc = t.accommodation?.[0];

                return (
                  <tr
                    key={t.id}
                    className={`transition-colors ${
                      isSelected
                        ? 'bg-indigo-950/40 hover:bg-indigo-950/60'
                        : idx % 2 === 0
                        ? 'bg-zinc-900 hover:bg-zinc-800/60'
                        : 'bg-zinc-900/60 hover:bg-zinc-800/60'
                    }`}
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
                    <td className="py-2.5 px-3 text-zinc-500 font-mono text-[11px]">
                      {idx + 1}
                    </td>

                    {/* Name */}
                    <td className="py-2.5 px-3">
                      <div className="font-semibold text-zinc-100">
                        {t.surname}{' '}
                        <span className="font-normal text-zinc-300">
                          {t.nameAndGender.split('/')[0]}
                        </span>
                      </div>
                      <div className="text-[10px] text-zinc-500 flex items-center gap-1.5 mt-0.5">
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

                    {/* Passport */}
                    <td className="py-2.5 px-3">
                      <div className="font-mono text-zinc-200 text-[11px]">
                        {t.passportOrIdNumber || <span className="text-red-400 italic">Missing</span>}
                      </div>
                      <div className="text-[10px] text-zinc-500">
                        DOB: {t.dateOfBirth || '-'}
                      </div>
                    </td>

                    {/* Flight */}
                    <td className="py-2.5 px-3">
                      <div className="font-medium text-zinc-200 flex items-center gap-1">
                        <span>{flight?.from || 'PEMBA'}</span>
                        <span className="text-zinc-500">→</span>
                        <span>{flight?.to || 'AFUNGI'}</span>
                      </div>
                      <div className="text-[10px] text-zinc-500">
                        {flight?.date} • {flight?.airlineAndFlightNo}
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

                    {/* Status */}
                    <td className="py-2.5 px-3">
                      {t.isValid !== false ? (
                        <span className="inline-flex items-center gap-1 bg-emerald-950/60 text-emerald-400 text-[10px] font-medium px-2 py-0.5 rounded-full border border-emerald-800/60">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          Ready
                        </span>
                      ) : (
                        <span
                          className="inline-flex items-center gap-1 bg-amber-950/60 text-amber-400 text-[10px] font-medium px-2 py-0.5 rounded-full border border-amber-800/60"
                          title={t.validationErrors?.join(', ')}
                        >
                          <AlertTriangle className="w-3 h-3 text-amber-400" />
                          Check
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
                          className="p-1.5 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-md transition-colors"
                          title="Edit Traveler Info"
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

      {/* Footer info */}
      <div className="px-4 py-3 bg-zinc-900/90 border-t border-zinc-800 text-xs text-zinc-500 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div>
          Showing {filteredTravelers.length} of {travelers.length} travelers
        </div>
        <div className="flex items-center gap-4 text-[11px]">
          <span className="flex items-center gap-1.5 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            All fields parsed & valid
          </span>
          <span className="text-zinc-700">|</span>
          <span>Charter flight notice minimum: 10 business days</span>
        </div>
      </div>
    </div>
  );
};
