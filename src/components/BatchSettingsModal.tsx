import React, { useState, useMemo } from 'react';
import { TravelerRecord, PurposeOfTrip } from '../types';
import { X, Check, SlidersHorizontal, Sparkles, Calendar, Clock, AlertCircle } from 'lucide-react';
import {
  validateDate,
  validateTime,
  validateFlightTimes,
  formatToStandardDate
} from '../utils/dateTimeValidation';
import { DrumWheelPickerModal } from './DrumWheelPickerModal';
import { DrumPickerTriggerButton } from './DrumPickerTriggerButton';
import { RotationPurposeSelector } from './RotationPurposeSelector';
import { normalizeRotationOrPurpose } from '../utils/rotationPurposeOptions';

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

  // Scroll Wheel / Drum Picker modal state
  const [drumPickerState, setDrumPickerState] = useState<{
    isOpen: boolean;
    mode: 'date' | 'time' | 'rotation' | 'purpose';
    title: string;
    initialValue: string;
    dateFormat?: 'dob' | 'short' | 'full' | 'iso';
    context?: 'dob' | 'passportExpiry' | 'flightDate' | 'signatureDate' | 'checkIn' | 'checkOut' | 'time';
    onConfirm: (val: string) => void;
  }>({
    isOpen: false,
    mode: 'date',
    title: '',
    initialValue: '',
    onConfirm: () => {}
  });

  const openDrumDatePicker = (
    title: string,
    initialValue: string,
    dateFormat: 'dob' | 'short' | 'full' | 'iso',
    context: 'dob' | 'passportExpiry' | 'flightDate' | 'signatureDate' | 'checkIn' | 'checkOut',
    onConfirm: (val: string) => void
  ) => {
    setDrumPickerState({
      isOpen: true,
      mode: 'date',
      title,
      initialValue: initialValue || '8/9/2026',
      dateFormat,
      context,
      onConfirm
    });
  };

  const openDrumTimePicker = (
    title: string,
    initialValue: string,
    onConfirm: (val: string) => void
  ) => {
    setDrumPickerState({
      isOpen: true,
      mode: 'time',
      title,
      initialValue: initialValue || '06:45',
      context: 'time',
      onConfirm
    });
  };

  const openDrumRotationPicker = (
    title: string,
    initialValue: string,
    onConfirm: (val: string) => void
  ) => {
    setDrumPickerState({
      isOpen: true,
      mode: 'rotation',
      title,
      initialValue: initialValue || 'Mobilization',
      onConfirm
    });
  };

  const handleRotationOrPurposeChange = (val: PurposeOfTrip | string) => {
    const normalized = normalizeRotationOrPurpose(val);
    setRotationType(normalized);
    setPurposeOfTrip(normalized);
  };

  // Checkbox toggles for what to apply
  const [applyFlight, setApplyFlight] = useState(true);
  const [applyAccommodation, setApplyAccommodation] = useState(true);
  const [applySignatureDate, setApplySignatureDate] = useState(true);
  const [applySignatureName, setApplySignatureName] = useState(true);
  const [applyRotation, setApplyRotation] = useState(true);

  // Validations
  const flightDateValidation = useMemo(() => validateDate(flightDate, 'Flight Date'), [flightDate]);
  const depTimeValidation = useMemo(() => validateTime(departureTime, 'Departure Time'), [departureTime]);
  const arrTimeValidation = useMemo(() => validateTime(arrivalTime, 'Arrival Time'), [arrivalTime]);
  const flightTimesValidation = useMemo(
    () => validateFlightTimes(departureTime, arrivalTime),
    [departureTime, arrivalTime]
  );
  const signatureDateValidation = useMemo(() => validateDate(signatureDate, 'Signature Date'), [signatureDate]);

  const hasFlightErrors = applyFlight && (!flightDateValidation.isValid || !depTimeValidation.isValid || !arrTimeValidation.isValid);
  const hasSignatureErrors = applySignatureDate && !signatureDateValidation.isValid;
  const isFormValid = !hasFlightErrors && !hasSignatureErrors;

  const handleApply = () => {
    if (!isFormValid) return;

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
            className="p-1.5 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
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
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[10px] font-medium text-zinc-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-indigo-400" />
                      FLIGHT DATE
                    </label>
                    <DrumPickerTriggerButton
                      onClick={() =>
                        openDrumDatePicker(
                          'Batch: Select Flight Date',
                          flightDate,
                          'short',
                          'flightDate',
                          val => setFlightDate(val)
                        )
                      }
                      title="Open Scroll Wheel / Drum Date Picker for Flight Date"
                    />
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="M/D/YYYY"
                      value={flightDate}
                      onChange={e => setFlightDate(e.target.value)}
                      className={`w-full px-2.5 py-1.5 text-xs bg-zinc-800/90 border rounded-lg focus:ring-2 focus:ring-indigo-500 font-mono ${
                        !flightDateValidation.isValid ? 'border-rose-500 text-rose-200' : 'border-zinc-700 text-zinc-100'
                      }`}
                    />
                    <input
                      type="date"
                      aria-label="Pick Flight Date"
                      className="absolute right-2 top-1.5 opacity-0 w-5 h-5 cursor-pointer"
                      onChange={e => {
                        if (e.target.value) {
                          const parsed = new Date(e.target.value + 'T00:00:00');
                          setFlightDate(formatToStandardDate(parsed, 'short'));
                        }
                      }}
                    />
                  </div>
                  {!flightDateValidation.isValid && (
                    <p className="text-[10px] text-rose-400 mt-1">{flightDateValidation.error}</p>
                  )}
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
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[10px] font-medium text-zinc-400 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-indigo-400" />
                      DEP TIME
                    </label>
                    <DrumPickerTriggerButton
                      onClick={() =>
                        openDrumTimePicker(
                          'Batch: Select Departure Time',
                          departureTime,
                          val => setDepartureTime(val)
                        )
                      }
                      title="Open Scroll Wheel / Drum Time Picker for Departure Time"
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="06:45"
                    value={departureTime}
                    onChange={e => setDepartureTime(e.target.value)}
                    className={`w-full px-2.5 py-1.5 text-xs bg-zinc-800/90 border rounded-lg focus:ring-2 focus:ring-indigo-500 font-mono ${
                      !depTimeValidation.isValid ? 'border-rose-500 text-rose-200' : 'border-zinc-700 text-zinc-100'
                    }`}
                  />
                  {!depTimeValidation.isValid && (
                    <p className="text-[10px] text-rose-400 mt-1">{depTimeValidation.error}</p>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[10px] font-medium text-zinc-400 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-indigo-400" />
                      ARR TIME
                    </label>
                    <DrumPickerTriggerButton
                      onClick={() =>
                        openDrumTimePicker(
                          'Batch: Select Arrival Time',
                          arrivalTime,
                          val => setArrivalTime(val)
                        )
                      }
                      title="Open Scroll Wheel / Drum Time Picker for Arrival Time"
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="07:30"
                    value={arrivalTime}
                    onChange={e => setArrivalTime(e.target.value)}
                    className={`w-full px-2.5 py-1.5 text-xs bg-zinc-800/90 border rounded-lg focus:ring-2 focus:ring-indigo-500 font-mono ${
                      !arrTimeValidation.isValid ? 'border-rose-500 text-rose-200' : 'border-zinc-700 text-zinc-100'
                    }`}
                  />
                  {!arrTimeValidation.isValid && (
                    <p className="text-[10px] text-rose-400 mt-1">{arrTimeValidation.error}</p>
                  )}
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
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[10px] font-medium text-zinc-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-indigo-400" />
                      FORM SIGNATURE DATE
                    </label>
                    <DrumPickerTriggerButton
                      onClick={() =>
                        openDrumDatePicker(
                          'Batch: Select Form Signature Date',
                          signatureDate,
                          'full',
                          'signatureDate',
                          val => setSignatureDate(val)
                        )
                      }
                      title="Open Scroll Wheel / Drum Date Picker for Signature Date"
                    />
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      value={signatureDate}
                      onChange={e => setSignatureDate(e.target.value)}
                      className={`w-full px-2.5 py-1.5 text-xs bg-zinc-800/90 border rounded-lg font-mono focus:ring-2 focus:ring-indigo-500 ${
                        !signatureDateValidation.isValid ? 'border-rose-500 text-rose-200' : 'border-zinc-700 text-zinc-100'
                      }`}
                      placeholder="e.g. 06 AUGUST 2026"
                    />
                    <input
                      type="date"
                      aria-label="Pick Signature Date"
                      className="absolute right-2 top-1.5 opacity-0 w-5 h-5 cursor-pointer"
                      onChange={e => {
                        if (e.target.value) {
                          const parsed = new Date(e.target.value + 'T00:00:00');
                          setSignatureDate(formatToStandardDate(parsed, 'full'));
                        }
                      }}
                    />
                  </div>
                  {!signatureDateValidation.isValid && (
                    <p className="text-[10px] text-rose-400 mt-1">{signatureDateValidation.error}</p>
                  )}
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

          {/* Rotation Type & Purpose of Trip Batch Section */}
          <div className="p-4 rounded-xl border border-zinc-800/90 bg-zinc-950/50 space-y-3">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-xs font-semibold text-zinc-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={applyRotation}
                  onChange={e => setApplyRotation(e.target.checked)}
                  className="rounded accent-indigo-500 focus:ring-indigo-500"
                />
                Apply Rotation Type, Purpose of Trip & Destination
              </label>
            </div>

            {applyRotation && (
              <div className="space-y-3 pt-2">
                <div>
                  <label className="block text-[10px] font-medium text-zinc-400 mb-1">
                    FINAL DESTINATION
                  </label>
                  <input
                    type="text"
                    value={finalDestination}
                    onChange={e => setFinalDestination(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-zinc-800/90 border border-zinc-700 text-zinc-100 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g. Afungi / Pemba / Maputo"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[10px] font-medium text-zinc-300">
                      ROTATION TYPE & PURPOSE OF TRIP (CHOOSE FROM 5)
                    </label>
                    <span className="text-[9px] text-zinc-500">
                      Scroll mouse wheel up/down to select
                    </span>
                  </div>

                  <RotationPurposeSelector
                    id="batch-rotation-purpose-selector"
                    value={rotationType || purposeOfTrip}
                    onChange={handleRotationOrPurposeChange}
                    onOpenDrumWheel={() =>
                      openDrumRotationPicker(
                        'Batch: Select Rotation Type / Purpose of Trip',
                        rotationType || purposeOfTrip,
                        val => handleRotationOrPurposeChange(val)
                      )
                    }
                    showChips={true}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-zinc-800 bg-zinc-900/90 flex items-center justify-between gap-2.5">
          <div>
            {!isFormValid && (
              <span className="text-xs text-rose-400 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                Please correct invalid date/time fields before applying.
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-zinc-300 bg-zinc-800 hover:bg-zinc-700 rounded-lg border border-zinc-700 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              id="apply-batch-settings-btn"
              disabled={!isFormValid}
              onClick={handleApply}
              className="flex items-center gap-1.5 px-5 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-lg hover:shadow-indigo-500/20 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              Apply to {travelerCount} Travelers
            </button>
          </div>
        </div>
      </div>

      {/* Drum Wheel Picker Modal for Batch Settings */}
      <DrumWheelPickerModal
        isOpen={drumPickerState.isOpen}
        onClose={() => setDrumPickerState(prev => ({ ...prev, isOpen: false }))}
        mode={drumPickerState.mode}
        title={drumPickerState.title}
        initialValue={drumPickerState.initialValue}
        dateFormat={drumPickerState.dateFormat}
        context={drumPickerState.context}
        onConfirm={drumPickerState.onConfirm}
      />
    </div>
  );
};

