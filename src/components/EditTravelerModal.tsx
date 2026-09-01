import React, { useState, useMemo } from 'react';
import { TravelerRecord, PurposeOfTrip } from '../types';
import {
  X,
  Save,
  User,
  Plane,
  Hotel,
  Check,
  FileCheck,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Clock,
  Wand2,
  AlertCircle
} from 'lucide-react';
import {
  validateDateOfBirth,
  validatePassportExpiry,
  validateDate,
  validateTime,
  validateFlightTimes,
  validateAccommodationDates,
  validateTravelerDatesAndTimes,
  formatToStandardDate,
  parseFlexibleDate,
  calculateAge
} from '../utils/dateTimeValidation';
import { MaskedPhoneInput } from './MaskedPhoneInput';
import { MaskedPassportInput } from './MaskedPassportInput';
import {
  formatPhoneNumber,
  validatePhoneNumber,
  validateAndFormatPassportOrId,
  formatPassportOrIdInput
} from '../utils/inputMasking';
import { DrumWheelPickerModal } from './DrumWheelPickerModal';
import { DrumPickerTriggerButton } from './DrumPickerTriggerButton';

interface EditTravelerModalProps {
  traveler: TravelerRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: TravelerRecord) => void;
}

const PURPOSES: PurposeOfTrip[] = [
  'Business Trip',
  'Rotational Leave',
  'Mobilization',
  'Emergency Leave',
  'Visa Application',
  'Demobilization'
];

export const EditTravelerModal: React.FC<EditTravelerModalProps> = ({
  traveler,
  isOpen,
  onClose,
  onSave
}) => {
  if (!isOpen || !traveler) return null;

  const [formData, setFormData] = useState<TravelerRecord>({ ...traveler });

  // Scroll Wheel / Drum Picker state
  const [drumPickerState, setDrumPickerState] = useState<{
    isOpen: boolean;
    mode: 'date' | 'time';
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
      initialValue: initialValue || (context === 'dob' ? '12-Aug-90' : '8/9/2026'),
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

  const handleChange = (field: keyof TravelerRecord, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFlightChange = (idx: number, field: string, value: string) => {
    setFormData(prev => {
      const flights = [...(prev.flights || [])];
      if (!flights[idx]) {
        flights[idx] = {
          date: '',
          from: '',
          to: '',
          departureTime: '',
          arrivalTime: '',
          airlineAndFlightNo: ''
        };
      }
      flights[idx] = { ...flights[idx], [field]: value };
      return { ...prev, flights };
    });
  };

  const handleAccommodationChange = (idx: number, field: string, value: string) => {
    setFormData(prev => {
      const accommodation = [...(prev.accommodation || [])];
      if (!accommodation[idx]) {
        accommodation[idx] = {
          checkIn: '',
          checkOut: '',
          hotelOrCamp: '',
          location: '',
          notes: ''
        };
      }
      accommodation[idx] = { ...accommodation[idx], [field]: value };
      return { ...prev, accommodation };
    });
  };

  const flight = formData.flights?.[0] || {
    date: '8/9/2026',
    from: 'PEMBA',
    to: 'AFUNGI',
    departureTime: '06:45',
    arrivalTime: '07:30',
    airlineAndFlightNo: 'SOLENTA'
  };

  const acc = formData.accommodation?.[0] || {
    checkIn: '8/9/2026',
    checkOut: '',
    hotelOrCamp: '9500',
    location: 'AFUNGI',
    notes: 'SHARED'
  };

  // Real-time validations
  const dobValidation = useMemo(() => validateDateOfBirth(formData.dateOfBirth), [formData.dateOfBirth]);
  const passportExpValidation = useMemo(
    () => validatePassportExpiry(formData.passportExpiryDate, flight.date),
    [formData.passportExpiryDate, flight.date]
  );
  const flightDateValidation = useMemo(() => validateDate(flight.date, 'Flight Date'), [flight.date]);
  const depTimeValidation = useMemo(() => validateTime(flight.departureTime, 'Departure Time'), [flight.departureTime]);
  const arrTimeValidation = useMemo(() => validateTime(flight.arrivalTime, 'Arrival Time'), [flight.arrivalTime]);
  const flightTimesValidation = useMemo(
    () => validateFlightTimes(flight.departureTime, flight.arrivalTime),
    [flight.departureTime, flight.arrivalTime]
  );
  const accDatesValidation = useMemo(
    () => validateAccommodationDates(acc.checkIn, acc.checkOut),
    [acc.checkIn, acc.checkOut]
  );
  const signatureDateValidation = useMemo(
    () => validateDate(formData.signatureDate, 'Signature Date'),
    [formData.signatureDate]
  );

  const overallValidation = useMemo(
    () => validateTravelerDatesAndTimes(formData),
    [formData]
  );

  // Auto-normalize all date, time, phone, and passport formats
  const handleAutoFormatAll = () => {
    setFormData(prev => {
      const updated = { ...prev };

      // Phone & Passport sanitization and masking
      if (updated.mobileNumber) {
        updated.mobileNumber = formatPhoneNumber(updated.mobileNumber);
      }
      if (updated.passportOrIdNumber) {
        updated.passportOrIdNumber = formatPassportOrIdInput(updated.passportOrIdNumber);
      }
      if (updated.emailAddress) {
        updated.emailAddress = updated.emailAddress.trim().toLowerCase();
      }
      
      // DOB
      if (dobValidation.parsedDate) {
        updated.dateOfBirth = formatToStandardDate(dobValidation.parsedDate, 'dob');
      }
      // Passport Exp
      if (passportExpValidation.parsedDate) {
        updated.passportExpiryDate = formatToStandardDate(passportExpValidation.parsedDate, 'dob');
      }
      // Flight
      if (updated.flights && updated.flights.length > 0) {
        const f = { ...updated.flights[0] };
        if (flightDateValidation.parsedDate) {
          f.date = formatToStandardDate(flightDateValidation.parsedDate, 'short');
        }
        if (depTimeValidation.formattedValue) {
          f.departureTime = depTimeValidation.formattedValue;
        }
        if (arrTimeValidation.formattedValue) {
          f.arrivalTime = arrTimeValidation.formattedValue;
        }
        updated.flights = [f];
      }
      // Accommodation
      if (updated.accommodation && updated.accommodation.length > 0) {
        const a = { ...updated.accommodation[0] };
        if (accDatesValidation.checkInValidation.parsedDate) {
          a.checkIn = formatToStandardDate(accDatesValidation.checkInValidation.parsedDate, 'short');
        }
        if (accDatesValidation.checkOutValidation.parsedDate) {
          a.checkOut = formatToStandardDate(accDatesValidation.checkOutValidation.parsedDate, 'short');
        }
        updated.accommodation = [a];
      }
      // Signature Date
      if (signatureDateValidation.parsedDate) {
        updated.signatureDate = formatToStandardDate(signatureDateValidation.parsedDate, 'full');
      }

      return updated;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Re-verify traveler validity
    const val = validateTravelerDatesAndTimes(formData);
    const errors: string[] = [];
    if (!formData.surname) errors.push('Missing Surname');
    if (!formData.passportOrIdNumber) errors.push('Missing Passport / ID');
    if (!formData.projectPosition) errors.push('Missing Job Title');
    errors.push(...val.allMessages);

    const updatedRecord: TravelerRecord = {
      ...formData,
      isValid: errors.length === 0,
      validationErrors: errors
    };

    onSave(updatedRecord);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-800 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-zinc-800 border border-zinc-700/60 text-indigo-400 flex items-center justify-center font-bold text-sm shadow-inner">
              <User className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-zinc-100">
                  Edit Traveler & Flight Information
                </h3>
                {overallValidation.isValid ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-800/60">
                    <CheckCircle2 className="w-3 h-3" />
                    Valid Dates & Times
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-rose-950/80 text-rose-300 border border-rose-800/60">
                    <AlertCircle className="w-3 h-3" />
                    {Object.keys(overallValidation.errors).length} Date/Time Issue{Object.keys(overallValidation.errors).length > 1 ? 's' : ''}
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Adjust personal, flight, and accommodation fields with automatic date & time validation.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              id="auto-format-dates-btn"
              onClick={handleAutoFormatAll}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-950/80 hover:bg-indigo-900 text-indigo-300 border border-indigo-700/60 rounded-lg text-xs font-medium transition-colors cursor-pointer"
              title="Standardize all date and time fields to official TAF format"
            >
              <Wand2 className="w-3.5 h-3.5 text-indigo-400" />
              <span>Standardize Formats</span>
            </button>
            <button
              id="close-edit-modal-btn"
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Validation Issues Alert Banner (if any) */}
        {!overallValidation.isValid && (
          <div className="px-6 py-2.5 bg-rose-950/40 border-b border-rose-900/50 flex items-start gap-2.5 text-xs text-rose-200">
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-semibold">Please correct the following date/time errors:</span>
              <ul className="mt-1 list-disc list-inside text-[11px] text-rose-300/90 space-y-0.5">
                {Object.values(overallValidation.errors).map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Section 1: Personal Info */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-indigo-400" />
                1. Personal & Company Information
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                  SURNAME *
                </label>
                <input
                  type="text"
                  required
                  value={formData.surname}
                  onChange={e => handleChange('surname', e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-zinc-800/90 border border-zinc-700 text-zinc-100 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                  NAME / GENDER *
                </label>
                <input
                  type="text"
                  required
                  value={formData.nameAndGender}
                  onChange={e => handleChange('nameAndGender', e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-zinc-800/90 border border-zinc-700 text-zinc-100 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                  FINAL DESTINATION
                </label>
                <input
                  type="text"
                  value={formData.finalDestination}
                  onChange={e => handleChange('finalDestination', e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-zinc-800/90 border border-zinc-700 text-zinc-100 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                  ROTATION TYPE
                </label>
                <input
                  type="text"
                  value={formData.rotationType}
                  onChange={e => handleChange('rotationType', e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-zinc-800/90 border border-zinc-700 text-zinc-100 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Purpose of Trip */}
            <div className="mt-3">
              <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                PURPOSE OF TRIP
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {PURPOSES.map(p => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => handleChange('purposeOfTrip', p)}
                    className={`flex items-center justify-between px-3 py-1.5 text-xs rounded-lg border transition-all cursor-pointer ${
                      formData.purposeOfTrip === p
                        ? 'border-indigo-500 bg-indigo-950/60 text-indigo-200 font-medium'
                        : 'border-zinc-800 bg-zinc-950/60 text-zinc-300 hover:bg-zinc-800'
                    }`}
                  >
                    <span>{p}</span>
                    {formData.purposeOfTrip === p && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mt-3">
              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                  COMPANY ID
                </label>
                <input
                  type="text"
                  value={formData.companyId}
                  onChange={e => handleChange('companyId', e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-zinc-800/90 border border-zinc-700 text-zinc-100 rounded-lg focus:ring-2 focus:ring-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                  COMPANY
                </label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={e => handleChange('company', e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-zinc-800/90 border border-zinc-700 text-zinc-100 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                  JOB POSITION / TITLE *
                </label>
                <input
                  type="text"
                  value={formData.projectPosition}
                  onChange={e => handleChange('projectPosition', e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-zinc-800/90 border border-zinc-700 text-zinc-100 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                  PROJECT DEPARTMENT
                </label>
                <input
                  type="text"
                  value={formData.projectDepartment}
                  onChange={e => handleChange('projectDepartment', e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-zinc-800/90 border border-zinc-700 text-zinc-100 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Passport & Contact */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mt-3">
              <MaskedPassportInput
                id="edit-traveler-passport-input"
                label="PASSPORT / ID NUMBER"
                required
                value={formData.passportOrIdNumber}
                onChange={val => handleChange('passportOrIdNumber', val)}
                nationality={formData.nationality}
              />

              {/* DATE OF BIRTH WITH LIVE VALIDATION */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-medium text-zinc-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-indigo-400" />
                    DATE OF BIRTH *
                  </label>
                  <div className="flex items-center gap-1.5">
                    {dobValidation.isValid && dobValidation.parsedDate && (
                      <span className="text-[10px] text-emerald-400 font-mono">
                        Age: {calculateAge(dobValidation.parsedDate)}y
                      </span>
                    )}
                    <DrumPickerTriggerButton
                      onClick={() =>
                        openDrumDatePicker(
                          'Select Date of Birth',
                          formData.dateOfBirth,
                          'dob',
                          'dob',
                          val => handleChange('dateOfBirth', val)
                        )
                      }
                      title="Open Scroll Wheel / Drum Date Picker for Date of Birth"
                    />
                  </div>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="DD-MMM-YY (e.g. 12-Aug-90)"
                    value={formData.dateOfBirth}
                    onChange={e => handleChange('dateOfBirth', e.target.value)}
                    className={`w-full px-2.5 py-1.5 text-xs bg-zinc-800/90 border rounded-lg focus:ring-2 focus:ring-indigo-500 font-mono ${
                      !dobValidation.isValid
                        ? 'border-rose-500 text-rose-200 focus:border-rose-500'
                        : dobValidation.warning
                        ? 'border-amber-500 text-zinc-100'
                        : 'border-zinc-700 text-zinc-100'
                    }`}
                  />
                  {/* HTML5 Date Picker sync button */}
                  <input
                    type="date"
                    aria-label="Pick Date of Birth"
                    className="absolute right-2 top-1.5 opacity-0 w-5 h-5 cursor-pointer"
                    onChange={e => {
                      if (e.target.value) {
                        const parsed = new Date(e.target.value + 'T00:00:00');
                        handleChange('dateOfBirth', formatToStandardDate(parsed, 'dob'));
                      }
                    }}
                  />
                </div>
                {!dobValidation.isValid ? (
                  <p className="text-[10px] text-rose-400 mt-1">{dobValidation.error}</p>
                ) : dobValidation.warning ? (
                  <p className="text-[10px] text-amber-400 mt-1">{dobValidation.warning}</p>
                ) : (
                  <p className="text-[10px] text-zinc-500 mt-1">Standard format: DD-MMM-YY</p>
                )}
              </div>

              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                  NATIONALITY
                </label>
                <input
                  type="text"
                  value={formData.nationality}
                  onChange={e => handleChange('nationality', e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-zinc-800/90 border border-zinc-700 text-zinc-100 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* PASSPORT EXPIRY WITH LIVE VALIDATION */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-medium text-zinc-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-indigo-400" />
                    PASSPORT EXPIRY *
                  </label>
                  <div className="flex items-center gap-1.5">
                    {passportExpValidation.isValid && (
                      <span
                        className={`text-[10px] font-mono ${
                          passportExpValidation.warning ? 'text-amber-400' : 'text-emerald-400'
                        }`}
                      >
                        {passportExpValidation.warning ? 'Expiring soon' : 'Valid'}
                      </span>
                    )}
                    <DrumPickerTriggerButton
                      onClick={() =>
                        openDrumDatePicker(
                          'Select Passport Expiry Date',
                          formData.passportExpiryDate,
                          'dob',
                          'passportExpiry',
                          val => handleChange('passportExpiryDate', val)
                        )
                      }
                      title="Open Scroll Wheel / Drum Date Picker for Passport Expiry"
                    />
                  </div>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="DD-MMM-YY (e.g. 16-Jan-33)"
                    value={formData.passportExpiryDate}
                    onChange={e => handleChange('passportExpiryDate', e.target.value)}
                    className={`w-full px-2.5 py-1.5 text-xs bg-zinc-800/90 border rounded-lg focus:ring-2 focus:ring-indigo-500 font-mono ${
                      !passportExpValidation.isValid
                        ? 'border-rose-500 text-rose-200 focus:border-rose-500'
                        : passportExpValidation.warning
                        ? 'border-amber-500 text-amber-200'
                        : 'border-zinc-700 text-zinc-100'
                    }`}
                  />
                  <input
                    type="date"
                    aria-label="Pick Passport Expiry Date"
                    className="absolute right-2 top-1.5 opacity-0 w-5 h-5 cursor-pointer"
                    onChange={e => {
                      if (e.target.value) {
                        const parsed = new Date(e.target.value + 'T00:00:00');
                        handleChange('passportExpiryDate', formatToStandardDate(parsed, 'dob'));
                      }
                    }}
                  />
                </div>
                {!passportExpValidation.isValid ? (
                  <p className="text-[10px] text-rose-400 mt-1">{passportExpValidation.error}</p>
                ) : passportExpValidation.warning ? (
                  <p className="text-[10px] text-amber-400 mt-1">{passportExpValidation.warning}</p>
                ) : (
                  <p className="text-[10px] text-zinc-500 mt-1">Standard format: DD-MMM-YY</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                  EMAIL ADDRESS
                </label>
                <input
                  type="email"
                  value={formData.emailAddress}
                  onChange={e => handleChange('emailAddress', e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-zinc-800/90 border border-zinc-700 text-zinc-100 rounded-lg focus:ring-2 focus:ring-indigo-500 font-mono"
                />
              </div>

              <MaskedPhoneInput
                id="edit-traveler-mobile-input"
                label="MOBILE NUMBER"
                value={formData.mobileNumber}
                onChange={val => handleChange('mobileNumber', val)}
                defaultCountryCode={formData.nationality?.toUpperCase().includes('MOZ') ? '+258' : '+258'}
              />
            </div>
          </div>

          {/* Section 2: Flights */}
          <div className="pt-4 border-t border-zinc-800">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <Plane className="w-3.5 h-3.5 text-indigo-400" />
                2. Flight & Transportation Details
              </h4>
              {flightTimesValidation.warning && (
                <span className="text-[11px] text-amber-400 flex items-center gap-1 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-800/50">
                  <AlertTriangle className="w-3 h-3" />
                  {flightTimesValidation.warning}
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
              {/* FLIGHT DATE */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-medium text-zinc-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-indigo-400" />
                    DATE *
                  </label>
                  <DrumPickerTriggerButton
                    onClick={() =>
                      openDrumDatePicker(
                        'Select Flight Date',
                        flight.date,
                        'short',
                        'flightDate',
                        val => handleFlightChange(0, 'date', val)
                      )
                    }
                    title="Open Scroll Wheel / Drum Date Picker for Flight Date"
                  />
                </div>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="M/D/YYYY"
                    value={flight.date}
                    onChange={e => handleFlightChange(0, 'date', e.target.value)}
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
                        handleFlightChange(0, 'date', formatToStandardDate(parsed, 'short'));
                      }
                    }}
                  />
                </div>
                {!flightDateValidation.isValid && (
                  <p className="text-[10px] text-rose-400 mt-1">{flightDateValidation.error}</p>
                )}
              </div>

              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                  FROM
                </label>
                <input
                  type="text"
                  value={flight.from}
                  onChange={e => handleFlightChange(0, 'from', e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-zinc-800/90 border border-zinc-700 text-zinc-100 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                  TO
                </label>
                <input
                  type="text"
                  value={flight.to}
                  onChange={e => handleFlightChange(0, 'to', e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-zinc-800/90 border border-zinc-700 text-zinc-100 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* DEPARTURE TIME */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-medium text-zinc-400 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-indigo-400" />
                    DEP TIME
                  </label>
                  <DrumPickerTriggerButton
                    onClick={() =>
                      openDrumTimePicker(
                        'Select Departure Time',
                        flight.departureTime,
                        val => handleFlightChange(0, 'departureTime', val)
                      )
                    }
                    title="Open Scroll Wheel / Drum Time Picker for Departure Time"
                  />
                </div>
                <input
                  type="text"
                  placeholder="06:45"
                  value={flight.departureTime}
                  onChange={e => handleFlightChange(0, 'departureTime', e.target.value)}
                  className={`w-full px-2.5 py-1.5 text-xs bg-zinc-800/90 border rounded-lg focus:ring-2 focus:ring-indigo-500 font-mono ${
                    !depTimeValidation.isValid ? 'border-rose-500 text-rose-200' : 'border-zinc-700 text-zinc-100'
                  }`}
                />
                {!depTimeValidation.isValid && (
                  <p className="text-[10px] text-rose-400 mt-1">{depTimeValidation.error}</p>
                )}
              </div>

              {/* ARRIVAL TIME */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-medium text-zinc-400 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-indigo-400" />
                    ARR TIME
                  </label>
                  <DrumPickerTriggerButton
                    onClick={() =>
                      openDrumTimePicker(
                        'Select Arrival Time',
                        flight.arrivalTime,
                        val => handleFlightChange(0, 'arrivalTime', val)
                      )
                    }
                    title="Open Scroll Wheel / Drum Time Picker for Arrival Time"
                  />
                </div>
                <input
                  type="text"
                  placeholder="07:30"
                  value={flight.arrivalTime}
                  onChange={e => handleFlightChange(0, 'arrivalTime', e.target.value)}
                  className={`w-full px-2.5 py-1.5 text-xs bg-zinc-800/90 border rounded-lg focus:ring-2 focus:ring-indigo-500 font-mono ${
                    !arrTimeValidation.isValid ? 'border-rose-500 text-rose-200' : 'border-zinc-700 text-zinc-100'
                  }`}
                />
                {!arrTimeValidation.isValid && (
                  <p className="text-[10px] text-rose-400 mt-1">{arrTimeValidation.error}</p>
                )}
              </div>

              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                  AIRLINE & FLT
                </label>
                <input
                  type="text"
                  value={flight.airlineAndFlightNo}
                  onChange={e => handleFlightChange(0, 'airlineAndFlightNo', e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-zinc-800/90 border border-zinc-700 text-zinc-100 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Accommodation */}
          <div className="pt-4 border-t border-zinc-800">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-3 flex items-center gap-1.5">
              <Hotel className="w-3.5 h-3.5 text-indigo-400" />
              3. Accommodation Required
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              {/* CHECK-IN */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-medium text-zinc-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-indigo-400" />
                    CHECK-IN
                  </label>
                  <DrumPickerTriggerButton
                    onClick={() =>
                      openDrumDatePicker(
                        'Select Accommodation Check-In Date',
                        acc.checkIn,
                        'short',
                        'checkIn',
                        val => handleAccommodationChange(0, 'checkIn', val)
                      )
                    }
                    title="Open Scroll Wheel / Drum Date Picker for Check-In"
                  />
                </div>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="M/D/YYYY"
                    value={acc.checkIn}
                    onChange={e => handleAccommodationChange(0, 'checkIn', e.target.value)}
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
                        handleAccommodationChange(0, 'checkIn', formatToStandardDate(parsed, 'short'));
                      }
                    }}
                  />
                </div>
                {!accDatesValidation.checkInValidation.isValid && (
                  <p className="text-[10px] text-rose-400 mt-1">
                    {accDatesValidation.checkInValidation.error}
                  </p>
                )}
              </div>

              {/* CHECK-OUT */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-medium text-zinc-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-indigo-400" />
                    CHECK-OUT (Opt)
                  </label>
                  <DrumPickerTriggerButton
                    onClick={() =>
                      openDrumDatePicker(
                        'Select Accommodation Check-Out Date',
                        acc.checkOut,
                        'short',
                        'checkOut',
                        val => handleAccommodationChange(0, 'checkOut', val)
                      )
                    }
                    title="Open Scroll Wheel / Drum Date Picker for Check-Out"
                  />
                </div>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="M/D/YYYY"
                    value={acc.checkOut}
                    onChange={e => handleAccommodationChange(0, 'checkOut', e.target.value)}
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
                        handleAccommodationChange(0, 'checkOut', formatToStandardDate(parsed, 'short'));
                      }
                    }}
                  />
                </div>
                {accDatesValidation.error ? (
                  <p className="text-[10px] text-rose-400 mt-1">{accDatesValidation.error}</p>
                ) : !accDatesValidation.checkOutValidation.isValid ? (
                  <p className="text-[10px] text-rose-400 mt-1">
                    {accDatesValidation.checkOutValidation.error}
                  </p>
                ) : null}
              </div>

              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                  HOTEL / CAMP
                </label>
                <input
                  type="text"
                  value={acc.hotelOrCamp}
                  onChange={e => handleAccommodationChange(0, 'hotelOrCamp', e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-zinc-800/90 border border-zinc-700 text-zinc-100 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                  LOCATION
                </label>
                <input
                  type="text"
                  value={acc.location}
                  onChange={e => handleAccommodationChange(0, 'location', e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-zinc-800/90 border border-zinc-700 text-zinc-100 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                  NOTES
                </label>
                <input
                  type="text"
                  value={acc.notes}
                  onChange={e => handleAccommodationChange(0, 'notes', e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-zinc-800/90 border border-zinc-700 text-zinc-100 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Section 5: Signature */}
          <div className="pt-4 border-t border-zinc-800">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-3 flex items-center gap-1.5">
              <FileCheck className="w-3.5 h-3.5 text-indigo-400" />
              4. Approval & Signature Details
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* SIGNATURE DATE */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-medium text-zinc-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-indigo-400" />
                    SIGNATURE DATE
                  </label>
                  <DrumPickerTriggerButton
                    onClick={() =>
                      openDrumDatePicker(
                        'Select Approval & Signature Date',
                        formData.signatureDate,
                        'full',
                        'signatureDate',
                        val => handleChange('signatureDate', val)
                      )
                    }
                    title="Open Scroll Wheel / Drum Date Picker for Signature Date"
                  />
                </div>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="06 AUGUST 2026"
                    value={formData.signatureDate}
                    onChange={e => handleChange('signatureDate', e.target.value)}
                    className={`w-full px-2.5 py-1.5 text-xs bg-zinc-800/90 border rounded-lg focus:ring-2 focus:ring-indigo-500 font-mono ${
                      !signatureDateValidation.isValid ? 'border-rose-500 text-rose-200' : 'border-zinc-700 text-zinc-100'
                    }`}
                  />
                  <input
                    type="date"
                    aria-label="Pick Signature Date"
                    className="absolute right-2 top-1.5 opacity-0 w-5 h-5 cursor-pointer"
                    onChange={e => {
                      if (e.target.value) {
                        const parsed = new Date(e.target.value + 'T00:00:00');
                        handleChange('signatureDate', formatToStandardDate(parsed, 'full'));
                      }
                    }}
                  />
                </div>
                {!signatureDateValidation.isValid && (
                  <p className="text-[10px] text-rose-400 mt-1">{signatureDateValidation.error}</p>
                )}
              </div>

              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                  SIGNATURE PRINT NAME
                </label>
                <input
                  type="text"
                  value={formData.signatureName || ''}
                  onChange={e => handleChange('signatureName', e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-zinc-800/90 border border-zinc-700 text-zinc-100 rounded-lg focus:ring-2 focus:ring-indigo-500 font-serif italic"
                />
              </div>
            </div>
          </div>

          {/* Footer Save */}
          <div className="pt-4 border-t border-zinc-800 flex items-center justify-between gap-2.5 sticky bottom-0 bg-zinc-900 py-3">
            <div className="text-xs text-zinc-400 flex items-center gap-1.5">
              {!overallValidation.isValid ? (
                <span className="text-rose-400 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Fix date/time errors before saving
                </span>
              ) : (
                <span className="text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  All date & time fields validated
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
                type="submit"
                id="save-traveler-btn"
                disabled={!overallValidation.isValid}
                className="flex items-center gap-1.5 px-5 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-lg hover:shadow-indigo-500/20 transition-all cursor-pointer"
              >
                <Save className="w-4 h-4" />
                Save Changes
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Drum Wheel Picker Modal for Dates and Times */}
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

