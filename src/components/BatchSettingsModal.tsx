import React, { useState, useMemo } from 'react';
import { TravelerRecord, PurposeOfTrip } from '../types';
import { X, Check, SlidersHorizontal, Sparkles, Calendar, Clock, AlertCircle, Shield, Building2, CalendarCheck, RotateCcw } from 'lucide-react';
import {
  validateDate,
  validateTime,
  validateFlightTimes,
  validateAccommodationDates,
  formatToStandardDate
} from '../utils/dateTimeValidation';
import { DrumWheelPickerModal } from './DrumWheelPickerModal';
import { DrumPickerTriggerButton } from './DrumPickerTriggerButton';
import { RotationPurposeSelector } from './RotationPurposeSelector';
import { normalizeRotationOrPurpose } from '../utils/rotationPurposeOptions';
import { MozambiqueProvincePicker } from './MozambiqueProvincePicker';
import { MozambiqueAirportPicker } from './MozambiqueAirportPicker';

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
  checkInDate?: string;
  checkOutDate?: string;
  applyAccommodationDates?: boolean;
  applyToMobilization?: boolean;
  signatureDate?: string;
  signatureName?: string;
  applyMozambiqueIdValidityByAge?: boolean;
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
  const [checkInDate, setCheckInDate] = useState('8/9/2026');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [applyAccommodationDates, setApplyAccommodationDates] = useState(true);
  const [applyToMobilization, setApplyToMobilization] = useState(true);
  const [signatureDate, setSignatureDate] = useState('06 AUGUST 2026');
  const [signatureName, setSignatureName] = useState('Eric Matola');
  const [finalDestination, setFinalDestination] = useState('Afungi');
  const [rotationType, setRotationType] = useState('Mobilization');
  const [purposeOfTrip, setPurposeOfTrip] = useState<PurposeOfTrip>('Mobilization');

  // Quick Date Helpers for Stay Dates
  const handleSyncCheckInWithFlightDate = () => {
    setCheckInDate(flightDate);
  };

  const handleAddDaysToCheckIn = (days: number) => {
    const val = validateDate(checkInDate, 'Check-In Date');
    if (val.isValid && val.parsedDate) {
      const nextDate = new Date(val.parsedDate);
      nextDate.setDate(nextDate.getDate() + days);
      setCheckOutDate(formatToStandardDate(nextDate, 'short'));
    }
  };

  const handleClearCheckOut = () => {
    setCheckOutDate('');
  };

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
  const [applyMozIdValidity, setApplyMozIdValidity] = useState(false);

  // Validations
  const flightDateValidation = useMemo(() => validateDate(flightDate, 'Flight Date'), [flightDate]);
  const depTimeValidation = useMemo(() => validateTime(departureTime, 'Departure Time'), [departureTime]);
  const arrTimeValidation = useMemo(() => validateTime(arrivalTime, 'Arrival Time'), [arrivalTime]);
  const flightTimesValidation = useMemo(
    () => validateFlightTimes(departureTime, arrivalTime),
    [departureTime, arrivalTime]
  );
  const signatureDateValidation = useMemo(() => validateDate(signatureDate, 'Signature Date'), [signatureDate]);
  const accDatesValidation = useMemo(
    () => validateAccommodationDates(checkInDate, checkOutDate),
    [checkInDate, checkOutDate]
  );

  const hasFlightErrors = applyFlight && (!flightDateValidation.isValid || !depTimeValidation.isValid || !arrTimeValidation.isValid);
  const hasAccommodationErrors = applyAccommodation && applyAccommodationDates && !accDatesValidation.isValid;
  const hasSignatureErrors = applySignatureDate && !signatureDateValidation.isValid;
  const isFormValid = !hasFlightErrors && !hasAccommodationErrors && !hasSignatureErrors;

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
      if (applyAccommodationDates) {
        settings.checkInDate = checkInDate;
        settings.checkOutDate = checkOutDate;
        settings.applyAccommodationDates = true;
        settings.applyToMobilization = applyToMobilization;
      }
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
    if (applyMozIdValidity) {
      settings.applyMozambiqueIdValidityByAge = true;
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
                  <MozambiqueAirportPicker
                    label="FROM (AIRPORT)"
                    value={flightFrom}
                    onSelect={loc => setFlightFrom(loc.toUpperCase())}
                    placeholder="e.g. PEMBA"
                  />
                </div>

                <div>
                  <MozambiqueAirportPicker
                    label="TO (AIRPORT)"
                    value={flightTo}
                    onSelect={loc => setFlightTo(loc.toUpperCase())}
                    placeholder="e.g. AFUNGI"
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

                {/* Stay Dates (Check-In & Check-Out) */}
                <div className="sm:col-span-3 pt-3 border-t border-zinc-800/80 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <label className="flex items-center gap-2 text-xs font-semibold text-indigo-300 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={applyAccommodationDates}
                        onChange={e => setApplyAccommodationDates(e.target.checked)}
                        className="rounded accent-indigo-500 focus:ring-indigo-500"
                      />
                      <CalendarCheck className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Apply Stay Dates (Check-In &amp; Check-Out)</span>
                    </label>

                    {/* Quick sync with flight date shortcut */}
                    {applyAccommodationDates && (
                      <button
                        type="button"
                        onClick={handleSyncCheckInWithFlightDate}
                        className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 hover:underline cursor-pointer"
                        title="Copy flight date directly to Check-In Date"
                      >
                        <RotateCcw className="w-3 h-3 text-indigo-400" />
                        <span>Sync Check-In with Flight Date ({flightDate})</span>
                      </button>
                    )}
                  </div>

                  {applyAccommodationDates && (
                    <div className="p-3.5 bg-zinc-900/90 border border-zinc-800 rounded-xl space-y-3 shadow-inner">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {/* Check-In Date */}
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="text-[10px] font-medium text-zinc-300 flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-emerald-400" />
                              CHECK-IN DATE (TAF &amp; MOBILIZATION)
                            </label>
                            <DrumPickerTriggerButton
                              onClick={() =>
                                openDrumDatePicker(
                                  'Batch: Select Check-In Date',
                                  checkInDate,
                                  'short',
                                  'checkIn',
                                  val => setCheckInDate(val)
                                )
                              }
                              title="Open Scroll Wheel / Drum Date Picker for Check-In Date"
                            />
                          </div>
                          <div className="relative">
                            <input
                              type="text"
                              placeholder="M/D/YYYY (e.g. 8/9/2026)"
                              value={checkInDate}
                              onChange={e => setCheckInDate(e.target.value)}
                              className={`w-full px-2.5 py-1.5 text-xs bg-zinc-800/90 border rounded-lg focus:ring-2 focus:ring-indigo-500 font-mono ${
                                !accDatesValidation.checkInValidation.isValid
                                  ? 'border-rose-500 text-rose-200'
                                  : 'border-zinc-700 text-zinc-100'
                              }`}
                            />
                            <input
                              type="date"
                              aria-label="Pick Check-In Date"
                              className="absolute right-2 top-1.5 opacity-0 w-5 h-5 cursor-pointer"
                              onChange={e => {
                                if (e.target.value) {
                                  const parsed = new Date(e.target.value + 'T00:00:00');
                                  setCheckInDate(formatToStandardDate(parsed, 'short'));
                                }
                              }}
                            />
                          </div>
                          {!accDatesValidation.checkInValidation.isValid && (
                            <p className="text-[10px] text-rose-400 mt-1">
                              {accDatesValidation.checkInValidation.error}
                            </p>
                          )}
                          <p className="text-[10px] text-zinc-400 mt-1">
                            Sets TAF Stay Check-In &amp; Mobilization Site Arrival Date
                          </p>
                        </div>

                        {/* Check-Out Date */}
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="text-[10px] font-medium text-zinc-300 flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-amber-400" />
                              CHECK-OUT DATE (TAF)
                            </label>
                            <DrumPickerTriggerButton
                              onClick={() =>
                                openDrumDatePicker(
                                  'Batch: Select Check-Out Date',
                                  checkOutDate,
                                  'short',
                                  'checkOut',
                                  val => setCheckOutDate(val)
                                )
                              }
                              title="Open Scroll Wheel / Drum Date Picker for Check-Out Date"
                            />
                          </div>
                          <div className="relative">
                            <input
                              type="text"
                              placeholder="M/D/YYYY (or leave empty for open-ended)"
                              value={checkOutDate}
                              onChange={e => setCheckOutDate(e.target.value)}
                              className={`w-full px-2.5 py-1.5 text-xs bg-zinc-800/90 border rounded-lg focus:ring-2 focus:ring-indigo-500 font-mono ${
                                !accDatesValidation.checkOutValidation.isValid || accDatesValidation.error
                                  ? 'border-rose-500 text-rose-200'
                                  : 'border-zinc-700 text-zinc-100'
                              }`}
                            />
                            <input
                              type="date"
                              aria-label="Pick Check-Out Date"
                              className="absolute right-2 top-1.5 opacity-0 w-5 h-5 cursor-pointer"
                              onChange={e => {
                                if (e.target.value) {
                                  const parsed = new Date(e.target.value + 'T00:00:00');
                                  setCheckOutDate(formatToStandardDate(parsed, 'short'));
                                }
                              }}
                            />
                          </div>
                          {(!accDatesValidation.checkOutValidation.isValid || accDatesValidation.error) && (
                            <p className="text-[10px] text-rose-400 mt-1">
                              {accDatesValidation.error || accDatesValidation.checkOutValidation.error}
                            </p>
                          )}
                          <p className="text-[10px] text-zinc-400 mt-1">
                            Sets TAF Accommodation Check-Out date (optional for open rotations)
                          </p>
                        </div>
                      </div>

                      {/* Quick Rotation Duration Buttons */}
                      <div className="flex items-center justify-between pt-1 flex-wrap gap-1.5">
                        <span className="text-[10px] text-zinc-400 font-medium">Quick Rotation Presets:</span>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <button
                            type="button"
                            onClick={() => handleAddDaysToCheckIn(14)}
                            className="px-2 py-0.5 text-[10px] font-mono bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded border border-zinc-700 transition-colors cursor-pointer"
                            title="Calculate Check-Out as Check-In + 14 days (2 Weeks Rotation)"
                          >
                            +14 Days (2 Wks)
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAddDaysToCheckIn(28)}
                            className="px-2 py-0.5 text-[10px] font-mono bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded border border-zinc-700 transition-colors cursor-pointer"
                            title="Calculate Check-Out as Check-In + 28 days (4 Weeks Rotation)"
                          >
                            +28 Days (4 Wks)
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAddDaysToCheckIn(42)}
                            className="px-2 py-0.5 text-[10px] font-mono bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded border border-zinc-700 transition-colors cursor-pointer"
                            title="Calculate Check-Out as Check-In + 42 days (6 Weeks Rotation)"
                          >
                            +42 Days (6 Wks)
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAddDaysToCheckIn(60)}
                            className="px-2 py-0.5 text-[10px] font-mono bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded border border-zinc-700 transition-colors cursor-pointer"
                            title="Calculate Check-Out as Check-In + 60 days (2 Months)"
                          >
                            +60 Days (2 Mos)
                          </button>
                          <button
                            type="button"
                            onClick={handleClearCheckOut}
                            className="px-2 py-0.5 text-[10px] font-mono bg-zinc-800/60 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 rounded border border-zinc-700/80 transition-colors cursor-pointer"
                            title="Clear Check-Out Date for open-ended stay"
                          >
                            Clear (Open-ended)
                          </button>
                        </div>
                      </div>

                      {/* Mobilization Synchronization Option */}
                      <label className="flex items-start gap-2.5 p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-800/50 text-xs font-medium text-emerald-200 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={applyToMobilization}
                          onChange={e => setApplyToMobilization(e.target.checked)}
                          className="rounded accent-emerald-500 w-4 h-4 cursor-pointer mt-0.5"
                        />
                        <div className="flex flex-col">
                          <span className="font-semibold text-emerald-300 flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                            Apply Check-In Date to Daewoo Mobilization Forms
                          </span>
                          <span className="text-[11px] text-zinc-400 mt-0.5">
                            Synchronizes the Arrival Date in the applicant section and the initial travel route departure date across all Mobilization sheets.
                          </span>
                        </div>
                      </label>
                    </div>
                  )}
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
                <MozambiqueProvincePicker
                  label="FINAL DESTINATION / OPERATIONAL SITE"
                  value={finalDestination}
                  onSelect={loc => setFinalDestination(loc.toUpperCase())}
                  placeholder="Select Site (OPBL1, Afungi, Palma, Pemba, Maputo)..."
                />

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

          {/* Mozambique ID Validity by Age Batch Section */}
          <div className="p-4 rounded-xl border border-indigo-900/40 bg-indigo-950/20 space-y-2">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-xs font-semibold text-indigo-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={applyMozIdValidity}
                  onChange={e => setApplyMozIdValidity(e.target.checked)}
                  className="rounded accent-indigo-500 focus:ring-indigo-500"
                />
                <Shield className="w-4 h-4 text-indigo-400" />
                Auto-calculate Mozambique ID Expiry Date by Age
              </label>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono">
                Legal Rules
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 pl-6">
              Automatically calculates and applies ID expiry for Mozambican travelers based on their Date of Birth:
              <br />
              <span className="text-zinc-300 font-medium">• Under 40: <strong>5 Years</strong></span> |{' '}
              <span className="text-zinc-300 font-medium">• 40 to 49: <strong>10 Years</strong></span> |{' '}
              <span className="text-zinc-300 font-medium">• 50+: <strong>Vitalício (Lifetime)</strong></span>
            </p>
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

