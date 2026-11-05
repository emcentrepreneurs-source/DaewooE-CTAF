import React, { useState, useEffect } from 'react';
import { TravelerRecord, MobilizationFormData, MobilizationRouteEntry } from '../types';
import { extractMobilizationDataFromTraveler } from '../utils/mobilizationDataExtractor';
import { downloadSingleMobilizationPdf } from '../utils/mobilizationPdfGenerator';
import { MozambiqueProvincePicker } from './MozambiqueProvincePicker';
import { MozambiqueAirportPicker } from './MozambiqueAirportPicker';
import { MobilizationFormPreview } from './MobilizationFormPreview';
import { DEFAULT_SIGNATURE_NAME, ERIC_MATOLA_SIGNATURE_BASE64 } from '../assets/signature';
import {
  X,
  Printer,
  Download,
  Building2,
  MapPin,
  Check,
  Calendar,
  Save,
  Sparkles,
  ArrowRight,
  Plane,
  RotateCcw,
  Plus,
  Trash2,
  Route,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';

interface MobilizationFormModalProps {
  isOpen: boolean;
  traveler: TravelerRecord;
  onClose: () => void;
  onSaveTraveler?: (updatedTraveler: TravelerRecord) => void;
}

export const MobilizationFormModal: React.FC<MobilizationFormModalProps> = ({
  isOpen,
  traveler,
  onClose,
  onSaveTraveler
}) => {
  if (!isOpen || !traveler) return null;

  const [activeTab, setActiveTab] = useState<'preview' | 'edit'>('preview');
  const [formData, setFormData] = useState<MobilizationFormData>(() =>
    extractMobilizationDataFromTraveler(traveler)
  );
  const [isCustomRoute, setIsCustomRoute] = useState<boolean>(() => {
    return traveler.mobilizationForm?.isCustomRoute ?? false;
  });
  const [printSeparate, setPrintSeparate] = useState<boolean>(true);

  // Sync state whenever traveler prop updates
  useEffect(() => {
    if (traveler) {
      const extracted = extractMobilizationDataFromTraveler(traveler);
      setFormData(extracted);
      setIsCustomRoute(extracted.isCustomRoute ?? false);
    }
  }, [traveler.id, traveler.mobilizationForm]);

  const handleFieldChange = (field: keyof MobilizationFormData, val: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: val
    }));
  };

  const handleRouteChange = (idx: number, field: keyof MobilizationRouteEntry, val: string) => {
    setIsCustomRoute(true);
    setFormData(prev => {
      const newRoutes = [...prev.routes];
      while (newRoutes.length <= idx) {
        newRoutes.push({ date: '', origin: '', etd: '', destination: '', eta: '' });
      }
      newRoutes[idx] = {
        ...newRoutes[idx],
        [field]: val
      };
      return {
        ...prev,
        isCustomRoute: true,
        routes: newRoutes
      };
    });
  };

  const handleAddRouteLeg = () => {
    setIsCustomRoute(true);
    setFormData(prev => {
      const last = prev.routes.filter(r => r.origin || r.destination).slice(-1)[0];
      const newRoute: MobilizationRouteEntry = {
        date: last?.date || prev.arrivalDate || '12-Mar-2026',
        origin: last?.destination || 'PEMBA',
        etd: '08:00',
        destination: 'AFUNGI',
        eta: '08:45'
      };
      const nonEmpties = prev.routes.filter(r => r.origin || r.destination);
      const updated = [...nonEmpties, newRoute];
      while (updated.length < 5) {
        updated.push({ date: '', origin: '', etd: '', destination: '', eta: '' });
      }
      return {
        ...prev,
        isCustomRoute: true,
        routes: updated.slice(0, 5)
      };
    });
  };

  const handleClearRouteLeg = (idx: number) => {
    setIsCustomRoute(true);
    setFormData(prev => {
      const newRoutes = [...prev.routes];
      newRoutes[idx] = { date: '', origin: '', etd: '', destination: '', eta: '' };
      return {
        ...prev,
        isCustomRoute: true,
        routes: newRoutes
      };
    });
  };

  const applyRoutePreset = (preset: { origin: string; destination: string; secondLeg?: { origin: string; destination: string } }) => {
    setIsCustomRoute(true);
    setFormData(prev => {
      const date = prev.arrivalDate || '12-Mar-2026';
      const newRoutes: MobilizationRouteEntry[] = [
        {
          date,
          origin: preset.origin,
          etd: '06:30',
          destination: preset.destination,
          eta: '08:45'
        }
      ];

      if (preset.secondLeg) {
        newRoutes.push({
          date,
          origin: preset.secondLeg.origin,
          etd: '09:30',
          destination: preset.secondLeg.destination,
          eta: '10:15'
        });
      }

      while (newRoutes.length < 5) {
        newRoutes.push({ date: '', origin: '', etd: '', destination: '', eta: '' });
      }

      return {
        ...prev,
        isCustomRoute: true,
        routes: newRoutes
      };
    });
  };

  const handleResetToTafRoutes = () => {
    const raw = extractMobilizationDataFromTraveler({
      ...traveler,
      mobilizationForm: undefined
    });
    setIsCustomRoute(false);
    setFormData(prev => ({
      ...prev,
      isCustomRoute: false,
      routes: raw.routes,
      site: raw.site
    }));
  };

  const handleSave = () => {
    const updatedForm: MobilizationFormData = {
      ...formData,
      isCustomRoute
    };
    const updated: TravelerRecord = {
      ...traveler,
      mobilizationForm: updatedForm
    };
    if (onSaveTraveler) {
      onSaveTraveler(updated);
    }
    setActiveTab('preview');
  };

  const handlePrint = () => {
    downloadSingleMobilizationPdf({
      ...traveler,
      mobilizationForm: {
        ...formData,
        isCustomRoute
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/85 backdrop-blur-md overflow-hidden animate-in fade-in duration-200">
      <div className="flex flex-col w-full max-w-5xl h-[94vh] bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Top Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-zinc-900 border-b border-zinc-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold shadow-inner">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-zinc-100">Daewoo E&amp;C Mobilization Form</h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-medium">
                  Mozambique Domestic Mobilization
                </span>
                {isCustomRoute && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono font-medium flex items-center gap-1">
                    <Route className="w-3 h-3" />
                    Custom Route Active
                  </span>
                )}
              </div>
              <p className="text-[11px] text-zinc-400">
                Collects TAF data automatically • Allows independent route locations • Prints as a separate legal sheet
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Tab Switcher */}
            <div className="flex items-center bg-zinc-800 p-0.5 rounded-lg border border-zinc-700">
              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                  activeTab === 'preview'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Form Preview
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('edit')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                  activeTab === 'edit'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Edit Form &amp; Route
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
              title="Close Modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden relative">
          {activeTab === 'preview' ? (
            <MobilizationFormPreview
              traveler={{
                ...traveler,
                mobilizationForm: {
                  ...formData,
                  isCustomRoute
                }
              }}
            />
          ) : (
            <div className="h-full overflow-y-auto p-5 md:p-6 space-y-6 max-w-4xl mx-auto">
              {/* SECTION 2: MOZAMBIQUE TRAVEL ROUTE (CUSTOMIZABLE INDEPENDENT FROM TAF) */}
              <div className="bg-zinc-900 border border-indigo-900/50 rounded-2xl p-4 md:p-5 space-y-4 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-zinc-100 uppercase tracking-wide flex items-center gap-2">
                      <Route className="w-4 h-4 text-emerald-400" />
                      1. Mozambique Travel Route (Departure Table)
                    </h3>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Change route locations (Origin, Destination) freely with scroll up/down for all Mozambican airport sites.
                    </p>
                  </div>

                  {/* Independent Route Toggle */}
                  <label className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-950 border border-indigo-700/60 text-xs font-medium text-indigo-200 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isCustomRoute}
                      onChange={e => setIsCustomRoute(e.target.checked)}
                      className="rounded accent-indigo-500 w-4 h-4 cursor-pointer"
                    />
                    <span>Independent Route (Different from TAF)</span>
                  </label>
                </div>

                {/* Quick Route Preset Shortcuts */}
                <div className="p-3 bg-zinc-950/70 rounded-xl border border-zinc-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-indigo-400" />
                      Quick Mobilization Route Presets:
                    </span>
                    <button
                      type="button"
                      onClick={handleResetToTafRoutes}
                      className="text-[10px] text-zinc-400 hover:text-zinc-200 flex items-center gap-1 hover:underline cursor-pointer"
                      title="Reset mobilization route to match TAF flight schedule"
                    >
                      <RotateCcw className="w-3 h-3 text-indigo-400" />
                      Reset to TAF Flight Schedule
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => applyRoutePreset({ origin: 'MAPUTO', destination: 'PEMBA' })}
                      className="px-2.5 py-1 text-[11px] font-mono bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg border border-zinc-700 transition-colors cursor-pointer"
                    >
                      MAPUTO ➔ PEMBA
                    </button>
                    <button
                      type="button"
                      onClick={() => applyRoutePreset({ origin: 'PEMBA', destination: 'AFUNGI' })}
                      className="px-2.5 py-1 text-[11px] font-mono bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 rounded-lg border border-emerald-800/60 transition-colors cursor-pointer"
                    >
                      PEMBA ➔ AFUNGI
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        applyRoutePreset({
                          origin: 'MAPUTO',
                          destination: 'PEMBA',
                          secondLeg: { origin: 'PEMBA', destination: 'AFUNGI' }
                        })
                      }
                      className="px-2.5 py-1 text-[11px] font-mono bg-indigo-950/60 hover:bg-indigo-900/80 text-indigo-200 rounded-lg border border-indigo-800/60 transition-colors cursor-pointer font-bold"
                    >
                      MAPUTO ➔ PEMBA ➔ AFUNGI (2 Legs)
                    </button>
                    <button
                      type="button"
                      onClick={() => applyRoutePreset({ origin: 'BEIRA', destination: 'PEMBA' })}
                      className="px-2.5 py-1 text-[11px] font-mono bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg border border-zinc-700 transition-colors cursor-pointer"
                    >
                      BEIRA ➔ PEMBA
                    </button>
                    <button
                      type="button"
                      onClick={() => applyRoutePreset({ origin: 'NAMPULA', destination: 'PEMBA' })}
                      className="px-2.5 py-1 text-[11px] font-mono bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg border border-zinc-700 transition-colors cursor-pointer"
                    >
                      NAMPULA ➔ PEMBA
                    </button>
                    <button
                      type="button"
                      onClick={() => applyRoutePreset({ origin: 'NACALA', destination: 'AFUNGI' })}
                      className="px-2.5 py-1 text-[11px] font-mono bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg border border-zinc-700 transition-colors cursor-pointer"
                    >
                      NACALA ➔ AFUNGI
                    </button>
                    <button
                      type="button"
                      onClick={() => applyRoutePreset({ origin: 'TETE', destination: 'PEMBA' })}
                      className="px-2.5 py-1 text-[11px] font-mono bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg border border-zinc-700 transition-colors cursor-pointer"
                    >
                      TETE ➔ PEMBA
                    </button>
                  </div>
                </div>

                {/* 5 Route Rows Table (Matches physical template 5 rows) */}
                <div className="space-y-3">
                  {formData.routes.slice(0, 5).map((route, idx) => (
                    <div
                      key={idx}
                      className={`p-3.5 rounded-xl border transition-all ${
                        route.origin || route.destination
                          ? 'bg-zinc-950/80 border-zinc-700/80 shadow-sm'
                          : 'bg-zinc-950/40 border-dashed border-zinc-800/80 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-zinc-800 text-indigo-300 font-mono text-[10px] font-bold flex items-center justify-center border border-zinc-700">
                            {idx + 1}
                          </span>
                          <span className="text-xs font-semibold text-zinc-200">
                            Departure Leg #{idx + 1}
                          </span>
                          {route.origin && route.destination && (
                            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/70">
                              {route.origin} ➔ {route.destination}
                            </span>
                          )}
                        </div>

                        {(route.origin || route.destination || route.date) && (
                          <button
                            type="button"
                            onClick={() => handleClearRouteLeg(idx)}
                            className="text-[10px] text-zinc-400 hover:text-rose-400 flex items-center gap-1 transition-colors cursor-pointer"
                            title="Clear this route leg"
                          >
                            <Trash2 className="w-3 h-3 text-rose-400" />
                            <span>Clear</span>
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
                        {/* DATE */}
                        <div>
                          <label className="block text-[10px] font-medium text-zinc-400 mb-1 flex items-center gap-1">
                            <Calendar className="w-2.5 h-2.5 text-indigo-400" />
                            DATE
                          </label>
                          <input
                            type="text"
                            value={route.date}
                            onChange={e => handleRouteChange(idx, 'date', e.target.value)}
                            placeholder="DD-MMM-YYYY"
                            className="w-full px-2.5 py-1.5 text-xs bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 font-mono focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>

                        {/* ORIGIN AIRPORT (SCROLL UP / DOWN PICKER) */}
                        <div className="sm:col-span-1">
                          <MozambiqueAirportPicker
                            label="ORIGIN SITE (AIRPORT)"
                            value={route.origin}
                            onSelect={loc => handleRouteChange(idx, 'origin', loc.toUpperCase())}
                            placeholder="Pick Origin..."
                          />
                        </div>

                        {/* ETD */}
                        <div>
                          <label className="block text-[10px] font-medium text-zinc-400 mb-1">
                            ETD (DEP)
                          </label>
                          <input
                            type="text"
                            value={route.etd}
                            onChange={e => handleRouteChange(idx, 'etd', e.target.value)}
                            placeholder="06:30"
                            className="w-full px-2.5 py-1.5 text-xs bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 font-mono focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>

                        {/* DESTINATION AIRPORT (SCROLL UP / DOWN PICKER) */}
                        <div className="sm:col-span-1">
                          <MozambiqueAirportPicker
                            label="DESTINATION SITE (AIRPORT)"
                            value={route.destination}
                            onSelect={loc => handleRouteChange(idx, 'destination', loc.toUpperCase())}
                            placeholder="Pick Destination..."
                          />
                        </div>

                        {/* ETA */}
                        <div>
                          <label className="block text-[10px] font-medium text-zinc-400 mb-1">
                            ETA (ARR)
                          </label>
                          <input
                            type="text"
                            value={route.eta}
                            onChange={e => handleRouteChange(idx, 'eta', e.target.value)}
                            placeholder="08:45"
                            className="w-full px-2.5 py-1.5 text-xs bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 font-mono focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add Extra Leg Button */}
                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={handleAddRouteLeg}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold rounded-lg border border-zinc-700 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 text-emerald-400" />
                    <span>+ Add Next Connecting Leg (e.g. PEMBA ➔ AFUNGI)</span>
                  </button>
                  <span className="text-[10px] text-zinc-500 font-mono">
                    Official Mobilization Form table supports 5 departure rows
                  </span>
                </div>
              </div>

              {/* SECTION 1: APPLICANT & OPERATIONAL SITE */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 md:p-5 space-y-4">
                <h3 className="text-sm font-bold text-zinc-200 uppercase tracking-wide flex items-center gap-2 border-b border-zinc-800 pb-2">
                  <Building2 className="w-4 h-4 text-emerald-400" />
                  2. Applicant &amp; Operational Site Details
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                      Applicant Name
                    </label>
                    <input
                      type="text"
                      value={formData.applicantName}
                      onChange={e => handleFieldChange('applicantName', e.target.value.toUpperCase())}
                      className="w-full px-2.5 py-1.5 text-xs bg-zinc-800/90 border border-zinc-700 text-zinc-100 rounded-lg focus:ring-2 focus:ring-indigo-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                      Position
                    </label>
                    <input
                      type="text"
                      value={formData.position}
                      onChange={e => handleFieldChange('position', e.target.value.toUpperCase())}
                      className="w-full px-2.5 py-1.5 text-xs bg-zinc-800/90 border border-zinc-700 text-zinc-100 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                      Department
                    </label>
                    <input
                      type="text"
                      value={formData.department}
                      onChange={e => handleFieldChange('department', e.target.value.toUpperCase())}
                      className="w-full px-2.5 py-1.5 text-xs bg-zinc-800/90 border border-zinc-700 text-zinc-100 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  {/* Operational Site (OPBL1 / Afungi / Palma / Pemba / etc.) */}
                  <div>
                    <MozambiqueAirportPicker
                      label="Site / Base (OPBL1, Afungi, Pemba)"
                      value={formData.site}
                      onSelect={loc => handleFieldChange('site', loc.toUpperCase())}
                      placeholder="Select Site..."
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                      Nationality
                    </label>
                    <input
                      type="text"
                      value={formData.nationality}
                      onChange={e => handleFieldChange('nationality', e.target.value.toUpperCase())}
                      className="w-full px-2.5 py-1.5 text-xs bg-zinc-800/90 border border-zinc-700 text-zinc-100 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                      ID Number (BI / Passport)
                    </label>
                    <input
                      type="text"
                      value={formData.idNumber}
                      onChange={e => handleFieldChange('idNumber', e.target.value.toUpperCase())}
                      className="w-full px-2.5 py-1.5 text-xs bg-zinc-800/90 border border-zinc-700 text-zinc-100 rounded-lg focus:ring-2 focus:ring-indigo-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                      Arrival Date
                    </label>
                    <input
                      type="text"
                      value={formData.arrivalDate}
                      onChange={e => handleFieldChange('arrivalDate', e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-zinc-800/90 border border-zinc-700 text-zinc-100 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      placeholder="DD-MMM-YYYY (e.g. 12-Mar-2026)"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                      Form Issue Date
                    </label>
                    <input
                      type="text"
                      value={formData.formDate}
                      onChange={e => handleFieldChange('formDate', e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-zinc-800/90 border border-zinc-700 text-zinc-100 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 3: SIGNATURE & VERIFICATION DATES (FOR ADMINISTRATION DEPARTMENT USE ONLY) */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 md:p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                  <h3 className="text-sm font-bold text-zinc-200 uppercase tracking-wide flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400" />
                    3. Administration Department Signature (For Administration Use Only)
                  </h3>
                  <span className="text-[11px] text-emerald-400 font-mono">
                    Top Approvals Blank • Signature on Checklist Only
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                  <div>
                    <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                      Signatory Name
                    </label>
                    <input
                      type="text"
                      value={formData.signatureName || DEFAULT_SIGNATURE_NAME}
                      onChange={e => handleFieldChange('signatureName', e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-zinc-800/90 border border-zinc-700 text-zinc-100 rounded-lg focus:ring-2 focus:ring-indigo-500 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                      Signature / Approval Date
                    </label>
                    <input
                      type="text"
                      value={formData.signatureDate || formData.formDate}
                      onChange={e => handleFieldChange('signatureDate', e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-zinc-800/90 border border-zinc-700 text-zinc-100 rounded-lg focus:ring-2 focus:ring-indigo-500 font-mono"
                    />
                  </div>

                  <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-white border border-zinc-300">
                    <span className="text-[9px] uppercase tracking-wider text-zinc-500 font-bold mb-1">
                      TAF Signature Graphic
                    </span>
                    <img
                      src={formData.signatureImage || ERIC_MATOLA_SIGNATURE_BASE64}
                      alt="Signature Graphic"
                      className="h-7 w-auto max-w-[120px] object-contain mix-blend-multiply"
                    />
                    <span className="text-[9px] font-serif italic text-blue-950 font-bold mt-0.5">
                      {formData.signatureName || DEFAULT_SIGNATURE_NAME}
                    </span>
                  </div>
                </div>

                {/* Checklist Verification Status */}
                <div className="p-3 bg-zinc-950/60 rounded-xl border border-zinc-800 space-y-2">
                  <div className="text-[11px] font-semibold text-zinc-300 flex items-center justify-between">
                    <span>Administration Department Verification Checklist:</span>
                    <span className="text-[10px] text-zinc-500">Auto-filled with TAF Signature &amp; Date</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                    <div className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-between">
                      <span className="text-zinc-400">Check 1: Employment Agrmt</span>
                      <span className="px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 font-bold text-[10px] border border-emerald-800">
                        Mark: {formData.check1?.mark || 'X'}
                      </span>
                    </div>
                    <div className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-between">
                      <span className="text-zinc-400">Check 2: Notice Period</span>
                      <span className="px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 font-bold text-[10px] border border-emerald-800">
                        Mark: {formData.check2?.mark || 'X'}
                      </span>
                    </div>
                    <div className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-between">
                      <span className="text-zinc-400">Check 3: Route Appropriate</span>
                      <span className="px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 font-bold text-[10px] border border-emerald-800">
                        Mark: {formData.check3?.mark || 'X'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Separate Printing Option */}
              <div className="p-4 rounded-xl border border-emerald-900/50 bg-emerald-950/20 flex items-center justify-between">
                <label className="flex items-center gap-2.5 text-xs font-semibold text-emerald-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={printSeparate}
                    onChange={e => setPrintSeparate(e.target.checked)}
                    className="rounded accent-emerald-500 w-4 h-4 cursor-pointer"
                  />
                  <span>Always print Mobilization Form separately from TAF form</span>
                </label>
                <span className="text-[10px] text-zinc-400 font-mono">
                  Separate Single-Page A4 Sheet
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 bg-zinc-900 border-t border-zinc-800 shrink-0">
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>
              {isCustomRoute
                ? 'Custom Route Saved for Mobilization'
                : 'Synchronized with TAF Manifest'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {activeTab === 'edit' && (
              <button
                type="button"
                onClick={handleSave}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer shadow-sm"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Changes &amp; View Preview</span>
              </button>
            )}

            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer shadow-md"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Mobilization PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
