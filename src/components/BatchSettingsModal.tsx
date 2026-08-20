import React, { useState } from 'react';
import { TravelerRecord, PurposeOfTrip } from '../types';
import { X, Check, SlidersHorizontal, Sparkles } from 'lucide-react';

interface BatchSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  travelerCount: number;
  onApplyBatchSettings: (settings: BatchSettings) => void;
}

export interface BatchSettings {
  finalDestination?: string;
  rotationType?: string;
  purposeOfTrip?: PurposeOfTrip;
  company?: string;
  projectDepartment?: string;
  flightDate?: string;
  flightFrom?: string;
  flightTo?: string;
  departureTime?: string;
  arrivalTime?: string;
  airline?: string;
  hotelOrCamp?: string;
  campLocation?: string;
  accommodationNotes?: string;
  signatureDate?: string;
  signatureName?: string;
}

export const BatchSettingsModal: React.FC<BatchSettingsModalProps> = ({
  isOpen,
  onClose,
  travelerCount,
  onApplyBatchSettings
}) => {
  if (!isOpen) return null;

  const [flightDate, setFlightDate] = useState('8/9/2026');
  const [flightFrom, setFlightFrom] = useState('PEMBA');
  const [flightTo, setFlightTo] = useState('AFUNGI');
  const [departureTime, setDepartureTime] = useState('06:45');
  const [arrivalTime, setArrivalTime] = useState('07:30');
  const [airline, setAirline] = useState('SOLENTA');
  const [hotelOrCamp, setHotelOrCamp] = useState('9500');
  const [campLocation, setCampLocation] = useState('AFUNGI');
  const [accommodationNotes, setAccommodationNotes] = useState('SHARED');
  const [signatureDate, setSignatureDate] = useState('06 AUGUST 2026');
  const [signatureName, setSignatureName] = useState('Eric Matola');
  const [finalDestination, setFinalDestination] = useState('Afungi');
  const [rotationType, setRotationType] = useState('Mobilization');
  const [purposeOfTrip, setPurposeOfTrip] = useState<PurposeOfTrip>('Mobilization');

  // Checkbox toggles for what to apply
  const [applyFlight, setApplyFlight] = useState(true);
  const [applyAccommodation, setApplyAccommodation] = useState(true);
  const [applySignatureDate, setApplySignatureDate] = useState(true);
  const [applySignatureName, setApplySignatureName] = useState(true);
  const [applyRotation, setApplyRotation] = useState(true);

  const handleApply = () => {
    const settings: BatchSettings = {};
    if (applyFlight) {
      settings.flightDate = flightDate;
      settings.flightFrom = flightFrom;
      settings.flightTo = flightTo;
      settings.departureTime = departureTime;
      settings.arrivalTime = arrivalTime;
      settings.airline = airline;
    }
    if (applyAccommodation) {
      settings.hotelOrCamp = hotelOrCamp;
      settings.campLocation = campLocation;
      settings.accommodationNotes = accommodationNotes;
    }
    if (applySignatureDate) {
      settings.signatureDate = signatureDate;
    }
    if (applySignatureName) {
      settings.signatureName = signatureName;
    }
    if (applyRotation) {
      settings.finalDestination = finalDestination;
      settings.rotationType = rotationType;
      settings.purposeOfTrip = purposeOfTrip;
    }

    onApplyBatchSettings(settings);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-800 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-zinc-800 border border-zinc-700/60 text-indigo-400 flex items-center justify-center font-bold shadow-inner">
              <SlidersHorizontal className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-zinc-100">
                Batch Update Common Fields
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Apply standardized flight schedule, camp, and dates to all {travelerCount} travelers at once.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Flight Schedule */}
          <div className="p-4 rounded-xl border border-zinc-800/90 bg-zinc-950/50 space-y-3">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-xs font-semibold text-zinc-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={applyFlight}
                  onChange={e => setApplyFlight(e.target.checked)}
                  className="rounded accent-indigo-500 focus:ring-indigo-500"
                />
                Apply Shared Flight Schedule
              </label>
              <span className="text-[11px] text-zinc-500">
                Solenta Pemba ⇄ Afungi Charter
              </span>
            </div>

            {applyFlight && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2">
                <div>
                  <label className="block text-[10px] font-medium text-zinc-400 mb-1">
                    FLIGHT DATE
                  </label>
                  <input
                    type="text"
                    value={flightDate}
                    onChange={e => setFlightDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-zinc-800/90 border border-zinc-700 text-zinc-100 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-medium text-zinc-400 mb-1">
                    FROM
                  </label>
                  <input
                    type="text"
                    value={flightFrom}
                    onChange={e => setFlightFrom(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-zinc-800/90 border border-zinc-700 text-zinc-100 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-medium text-zinc-400 mb-1">
                    TO
                  </label>
                  <input
                    type="text"
                    value={flightTo}
                    onChange={e => setFlightTo(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-zinc-800/90 border border-zinc-700 text-zinc-100 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-medium text-zinc-400 mb-1">
                    DEP TIME
                  </label>
                  <input
                    type="text"
                    value={departureTime}
                    onChange={e => setDepartureTime(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-zinc-800/90 border border-zinc-700 text-zinc-100 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-medium text-zinc-400 mb-1">
                    ARR TIME
                  </label>
                  <input
                    type="text"
                    value={arrivalTime}
                    onChange={e => setArrivalTime(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-zinc-800/90 border border-zinc-700 text-zinc-100 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-medium text-zinc-400 mb-1">
                    AIRLINE
                  </label>
                  <input
                    type="text"
                    value={airline}
                    onChange={e => setAirline(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-zinc-800/90 border border-zinc-700 text-zinc-100 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Accommodation & Camp */}
          <div className="p-4 rounded-xl border border-zinc-800/90 bg-zinc-950/50 space-y-3">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-xs font-semibold text-zinc-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={applyAccommodation}
                  onChange={e => setApplyAccommodation(e.target.checked)}
                  className="rounded accent-indigo-500 focus:ring-indigo-500"
                />
                Apply Accommodation & Camp
              </label>
              <span className="text-[11px] text-zinc-500">
                Site Housing / Camp 9500
              </span>
            </div>

            {applyAccommodation && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
                <div>
                  <label className="block text-[10px] font-medium text-zinc-400 mb-1">
                    HOTEL / CAMP
                  </label>
                  <input
                    type="text"
                    value={hotelOrCamp}
                    onChange={e => setHotelOrCamp(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-zinc-800/90 border border-zinc-700 text-zinc-100 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-medium text-zinc-400 mb-1">
                    LOCATION
                  </label>
                  <input
                    type="text"
                    value={campLocation}
                    onChange={e => setCampLocation(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-zinc-800/90 border border-zinc-700 text-zinc-100 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-medium text-zinc-400 mb-1">
                    ROOM NOTES
                  </label>
                  <input
                    type="text"
                    value={accommodationNotes}
                    onChange={e => setAccommodationNotes(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-zinc-800/90 border border-zinc-700 text-zinc-100 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Signature Date & Destination */}
          <div className="p-4 rounded-xl border border-zinc-800/90 bg-zinc-950/50 space-y-3">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-xs font-semibold text-zinc-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={applySignatureDate}
                  onChange={e => setApplySignatureDate(e.target.checked)}
                  className="rounded accent-indigo-500 focus:ring-indigo-500"
                />
                Apply Shared Signature Details
              </label>
            </div>

            {applySignatureDate && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-[10px] font-medium text-zinc-400 mb-1">
                    FORM SIGNATURE DATE
                  </label>
                  <input
                    type="text"
                    value={signatureDate}
                    onChange={e => setSignatureDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-zinc-800/90 border border-zinc-700 text-zinc-100 rounded-lg font-mono focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g. 06 AUGUST 2026"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-medium text-zinc-400 mb-1">
                    SIGNER NAME (SECTION 5)
                  </label>
                  <input
                    type="text"
                    value={signatureName}
                    onChange={e => setSignatureName(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-zinc-800/90 border border-zinc-700 text-zinc-100 rounded-lg font-mono focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g. Eric Matola"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-zinc-800 bg-zinc-900/90 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-zinc-300 bg-zinc-800 hover:bg-zinc-700 rounded-lg border border-zinc-700 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            id="apply-batch-settings-btn"
            onClick={handleApply}
            className="flex items-center gap-1.5 px-5 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-lg hover:shadow-indigo-500/20 transition-all"
          >
            <Sparkles className="w-4 h-4" />
            Apply to {travelerCount} Travelers
          </button>
        </div>
      </div>
    </div>
  );
};
