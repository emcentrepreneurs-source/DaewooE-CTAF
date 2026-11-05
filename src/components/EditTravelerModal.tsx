import React, { useState, useMemo } from 'react';
import { TravelerRecord, FlightEntry, AccommodationEntry, PurposeOfTrip } from '../types';
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
  AlertCircle,
  Plus,
  Trash2,
  ArrowRightLeft,
  Shield,
  Building2
} from 'lucide-react';
import { MozambiqueProvincePicker } from './MozambiqueProvincePicker';
import { MozambiqueAirportPicker } from './MozambiqueAirportPicker';
import { extractMobilizationDataFromTraveler } from '../utils/mobilizationDataExtractor';
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
  calculateAge,
  isMozambicanSenior,
  isLifetimeExpiry,
  isMozambican,
  getMozambiqueIdValidityByAge,
  MozIdValidityResult
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
import { RotationPurposeSelector } from './RotationPurposeSelector';
import { normalizeRotationOrPurpose } from '../utils/rotationPurposeOptions';

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
    setFormData(prev => ({
      ...prev,
      rotationType: normalized,
      purposeOfTrip: normalized
    }));
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

  const handleAddFlight = (customDefaults?: Partial<FlightEntry>) => {
    setFormData(prev => {
      const currentFlights = (prev.flights && prev.flights.length > 0)
        ? [...prev.flights]
        : [{
            date: '8/9/2026',
            from: 'PEMBA',
            to: 'AFUNGI',
            departureTime: '06:45',
            arrivalTime: '07:30',
            airlineAndFlightNo: 'SOLENTA'
          }];

      const last = currentFlights[currentFlights.length - 1];
      const newFlight: FlightEntry = {
        date: customDefaults?.date || last?.date || '8/9/2026',
        from: customDefaults?.from || (last?.to ? last.to : 'AFUNGI'),
        to: customDefaults?.to || (last?.from ? last.from : 'PEMBA'),
        departureTime: customDefaults?.departureTime || '08:00',
        arrivalTime: customDefaults?.arrivalTime || '08:45',
        airlineAndFlightNo: customDefaults?.airlineAndFlightNo || last?.airlineAndFlightNo || 'SOLENTA'
      };

      return {
        ...prev,
        flights: [...currentFlights, newFlight]
      };
    });
  };

  const handleRemoveFlight = (index: number) => {
    setFormData(prev => {
      const currentFlights = [...(prev.flights || [])];
      if (currentFlights.length <= 1) return prev;
      currentFlights.splice(index, 1);
      return { ...prev, flights: currentFlights };
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

  const handleAddAccommodation = (customDefaults?: Partial<AccommodationEntry>) => {
    setFormData(prev => {
      const current = (prev.accommodation && prev.accommodation.length > 0)
        ? [...prev.accommodation]
        : [{
            checkIn: '8/9/2026',
            checkOut: '',
            hotelOrCamp: '9500',
            location: 'AFUNGI',
            notes: 'SHARED'
          }];

      const last = current[current.length - 1];
      const newAcc: AccommodationEntry = {
        checkIn: customDefaults?.checkIn || last?.checkOut || last?.checkIn || '8/9/2026',
        checkOut: customDefaults?.checkOut || '',
        hotelOrCamp: customDefaults?.hotelOrCamp || last?.hotelOrCamp || '9500',
        location: customDefaults?.location || last?.location || 'AFUNGI',
        notes: customDefaults?.notes || last?.notes || 'SHARED'
      };

      return {
        ...prev,
        accommodation: [...current, newAcc]
      };
    });
  };

  const handleRemoveAccommodation = (index: number) => {
    setFormData(prev => {
      const current = [...(prev.accommodation || [])];
      if (current.length <= 1) return prev;
      current.splice(index, 1);
      return { ...prev, accommodation: current };
    });
  };

  const flightsList = (formData.flights && formData.flights.length > 0)
    ? formData.flights
    : [{
        date: '8/9/2026',
        from: 'PEMBA',
        to: 'AFUNGI',
        departureTime: '06:45',
        arrivalTime: '07:30',
        airlineAndFlightNo: 'SOLENTA'
      }];

  const primaryFlight = flightsList[0];

  const accommodationList = (formData.accommodation && formData.accommodation.length > 0)
    ? formData.accommodation
    : [{
        checkIn: '8/9/2026',
        checkOut: '',
        hotelOrCamp: '9500',
        location: 'AFUNGI',
        notes: 'SHARED'
      }];

  const primaryAcc = accommodationList[0];

  // Mozambican National ID validity calculation by age rules
  // (Under 40: 5 yrs, 40 to 49: 10 yrs, 50+: Vitalício)
  const mozValidity: MozIdValidityResult | null = useMemo(() => {
    if (isMozambican(formData.nationality) || !formData.nationality) {
      return getMozambiqueIdValidityByAge(formData.dateOfBirth, { flightDate: primaryFlight.date });
    }
    return null;
  }, [formData.nationality, formData.dateOfBirth, primaryFlight.date]);

  // Real-time validations
  const dobValidation = useMemo(() => validateDateOfBirth(formData.dateOfBirth), [formData.dateOfBirth]);
  const isSeniorMozambican = useMemo(
    () => isMozambicanSenior(formData),
    [formData.nationality, formData.dateOfBirth, formData.passportExpiryDate]
  );
  const passportExpValidation = useMemo(
    () => validatePassportExpiry(formData.passportExpiryDate, primaryFlight.date, formData),
    [formData.passportExpiryDate, primaryFlight.date, formData.nationality, formData.dateOfBirth, formData.passportOrIdNumber]
  );
  const isLifetime = useMemo(
    () => isLifetimeExpiry(formData.passportExpiryDate) || isSeniorMozambican.isSenior || passportExpValidation.isLifetime,
    [formData.passportExpiryDate, isSeniorMozambican.isSenior, passportExpValidation.isLifetime]
  );
  const accDatesValidation = useMemo(
    () => validateAccommodationDates(primaryAcc.checkIn, primaryAcc.checkOut),
    [primaryAcc.checkIn, primaryAcc.checkOut]
  );
  const signatureDateValidation = useMemo(
    () => validateDate(formData.signatureDate, 'Signature Date'),
    [formData.signatureDate]
  );

  const overallValidation = useMemo(
    () => validateTravelerDatesAndTimes(formData),
    [formData]
  );

  // Automatically compute and update Mozambique ID expiry date when DOB changes
  const handleDateOfBirthChange = (newDob: string, autoApplyMozRule: boolean = true) => {
    setFormData(prev => {
      const updated = { ...prev, dateOfBirth: newDob };
      if (autoApplyMozRule && (isMozambican(prev.nationality) || !prev.nationality)) {
        const mozRule = getMozambiqueIdValidityByAge(newDob, { flightDate: primaryFlight.date });
        if (mozRule) {
          updated.passportExpiryDate = mozRule.expiryDate;
        }
      }
      return updated;
    });
  };

  // Handle nationality change and auto-populate Mozambique validity if appropriate
  const handleNationalityChange = (newNationality: string) => {
    setFormData(prev => {
      const updated = { ...prev, nationality: newNationality };
      if (isMozambican(newNationality) && prev.dateOfBirth) {
        const mozRule = getMozambiqueIdValidityByAge(prev.dateOfBirth, { flightDate: primaryFlight.date });
        if (mozRule) {
          if (!prev.passportExpiryDate || prev.passportExpiryDate === '01-Jan-32' || !validatePassportExpiry(prev.passportExpiryDate).isValid) {
            updated.passportExpiryDate = mozRule.expiryDate;
          }
        }
      }
      return updated;
    });
  };

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
        updated.emailAddress = updated.emailAddress.trim();
      }
      
      // DOB
      if (dobValidation.parsedDate) {
        updated.dateOfBirth = formatToStandardDate(dobValidation.parsedDate, 'dob');
      }
      // Passport Exp
      if (isLifetimeExpiry(updated.passportExpiryDate) || (isSeniorMozambican.isSenior && (!updated.passportExpiryDate || updated.passportExpiryDate.trim() === ''))) {
        updated.passportExpiryDate = 'VITALÍCIO';
      } else if (mozValidity && (isMozambican(updated.nationality) || !updated.nationality)) {
        updated.passportExpiryDate = mozValidity.expiryDate;
      } else if (passportExpValidation.parsedDate) {
        updated.passportExpiryDate = formatToStandardDate(passportExpValidation.parsedDate, 'dob');
      }
      // All Flights
      if (updated.flights && updated.flights.length > 0) {
        updated.flights = updated.flights.map(f => {
          const formattedF = { ...f };
          const dVal = validateDate(formattedF.date, 'Flight Date');
          if (dVal.parsedDate) {
            formattedF.date = formatToStandardDate(dVal.parsedDate, 'short');
          }
          const depV = validateTime(formattedF.departureTime, 'Departure Time');
          if (depV.formattedValue) {
            formattedF.departureTime = depV.formattedValue;
          }
          const arrV = validateTime(formattedF.arrivalTime, 'Arrival Time');
          if (arrV.formattedValue) {
            formattedF.arrivalTime = arrV.formattedValue;
          }
          return formattedF;
        });
      }
      // All Accommodations
      if (updated.accommodation && updated.accommodation.length > 0) {
        updated.accommodation = updated.accommodation.map(a => {
          const formattedA = { ...a };
          const cInVal = validateDate(formattedA.checkIn, 'Check-In Date');
          if (cInVal.parsedDate) {
            formattedA.checkIn = formatToStandardDate(cInVal.parsedDate, 'short');
          }
          if (formattedA.checkOut) {
            const cOutVal = validateDate(formattedA.checkOut, 'Check-Out Date');
            if (cOutVal.parsedDate) {
              formattedA.checkOut = formatToStandardDate(cOutVal.parsedDate, 'short');
            }
          }
          return formattedA;
        });
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
                <MozambiqueProvincePicker
                  label="FINAL DESTINATION / SITE"
                  value={formData.finalDestination}
                  onSelect={loc => handleChange('finalDestination', loc.toUpperCase())}
                  placeholder="Select Site (OPBL1, Afungi, Pemba, Maputo)..."
                />
              </div>
            </div>

            {/* ROTATION TYPE & PURPOSE OF TRIP (AUTOMATIC SCROLL UP / DOWN SELECTOR) */}
            <div className="mt-3.5 pt-3 border-t border-zinc-800/80">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-semibold text-indigo-300 flex items-center gap-1.5">
                  <FileCheck className="w-3.5 h-3.5 text-indigo-400" />
                  ROTATION TYPE & PURPOSE OF TRIP (SELECT FROM 5)
                </label>
                <span className="text-[10px] text-zinc-500 hidden sm:inline">
                  Scroll mouse wheel ▲/▼ or click arrows to cycle through options
                </span>
              </div>

              <RotationPurposeSelector
                id="edit-traveler-rotation-purpose"
                value={formData.rotationType || formData.purposeOfTrip || 'Mobilization'}
                onChange={handleRotationOrPurposeChange}
                onOpenDrumWheel={() =>
                  openDrumRotationPicker(
                    'Select Rotation Type / Purpose of Trip',
                    formData.rotationType || formData.purposeOfTrip || 'Mobilization',
                    val => handleRotationOrPurposeChange(val)
                  )
                }
                showChips={true}
              />
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
                          val => handleDateOfBirthChange(val)
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
                    onChange={e => handleDateOfBirthChange(e.target.value)}
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
                        handleDateOfBirthChange(formatToStandardDate(parsed, 'dob'));
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
                  onChange={e => handleNationalityChange(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-zinc-800/90 border border-zinc-700 text-zinc-100 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* PASSPORT / ID EXPIRY WITH LIVE VALIDATION & MOZAMBIQUE VITALÍCIO SUPPORT */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-medium text-zinc-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-indigo-400" />
                    PASSPORT / ID EXPIRY *
                  </label>
                  <div className="flex items-center gap-1.5">
                    {isLifetime ? (
                      <span className="text-[10px] font-mono text-emerald-400 font-bold flex items-center gap-0.5">
                        <Shield className="w-2.5 h-2.5 text-emerald-400" />
                        Vitalício
                      </span>
                    ) : passportExpValidation.isValid ? (
                      <span
                        className={`text-[10px] font-mono ${
                          passportExpValidation.warning ? 'text-amber-400' : 'text-emerald-400'
                        }`}
                      >
                        {passportExpValidation.warning ? 'Expiring soon' : 'Valid'}
                      </span>
                    ) : null}
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
                    placeholder="DD-MMM-YY or VITALÍCIO"
                    value={formData.passportExpiryDate}
                    onChange={e => handleChange('passportExpiryDate', e.target.value)}
                    className={`w-full px-2.5 py-1.5 text-xs bg-zinc-800/90 border rounded-lg focus:ring-2 focus:ring-indigo-500 font-mono ${
                      isLifetime
                        ? 'border-emerald-500/70 text-emerald-200 bg-emerald-950/20 focus:border-emerald-400'
                        : !passportExpValidation.isValid
                        ? 'border-rose-500 text-rose-200 focus:border-rose-500'
                        : passportExpValidation.warning
                        ? 'border-amber-500 text-amber-200'
                        : 'border-zinc-700 text-zinc-100'
                    }`}
                  />
                  {!isLifetime && (
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
                  )}
                </div>

                {/* Expiry Status Messages & Mozambique Senior Hint */}
                {isLifetime ? (
                  <p className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1 font-medium">
                    <Shield className="w-3 h-3 text-emerald-400 shrink-0" />
                    <span>Mozambique ID: Vitalício / Lifetime (No Expiry Date required under Mozambican law).</span>
                  </p>
                ) : !passportExpValidation.isValid ? (
                  <p className="text-[10px] text-rose-400 mt-1">{passportExpValidation.error}</p>
                ) : passportExpValidation.warning ? (
                  <p className="text-[10px] text-amber-400 mt-1">{passportExpValidation.warning}</p>
                ) : (
                  <p className="text-[10px] text-zinc-500 mt-1">Standard format: DD-MMM-YY or VITALÍCIO</p>
                )}

                {/* One-click Mozambique Vitalício trigger if not currently set */}
                {!isLifetime && (isMozambican(formData.nationality) || isSeniorMozambican.isSenior) && (
                  <button
                    type="button"
                    onClick={() => handleChange('passportExpiryDate', 'VITALÍCIO')}
                    className="mt-1.5 w-full flex items-center justify-center gap-1.5 px-2 py-1 bg-emerald-950/70 hover:bg-emerald-900/90 text-emerald-300 border border-emerald-800/70 rounded-md text-[10px] font-semibold transition-colors cursor-pointer"
                    title="Set this Mozambique National ID as Vitalício (non-expiring for senior citizen / lifetime)"
                  >
                    <Shield className="w-3 h-3 text-emerald-400" />
                    <span>Set as Vitalício (Mozambique ID does not expire for 50+)</span>
                  </button>
                )}
              </div>
            </div>

            {/* MOZAMBIQUE NATIONAL ID (BI) VALIDITY RULES BANNER */}
            {(isMozambican(formData.nationality) || !formData.nationality) && (
              <div className="mt-3 p-3 bg-zinc-900/90 rounded-xl border border-indigo-900/40 shadow-sm space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-indigo-400 shrink-0" />
                    <div>
                      <span className="text-xs font-semibold text-zinc-100 flex items-center gap-1.5">
                        Mozambique National ID (BI) Validity Rules by Age
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono">
                          Auto-Calculate Active
                        </span>
                      </span>
                      <p className="text-[10px] text-zinc-400">
                        Entering Date of Birth automatically computes and sets the legal expiry date.
                      </p>
                    </div>
                  </div>

                  {/* Quick Action Buttons */}
                  <div className="flex items-center flex-wrap gap-1.5">
                    {mozValidity && !mozValidity.isLifetime && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleChange('passportExpiryDate', mozValidity.expiryDate)}
                          className="px-2.5 py-1 text-[11px] font-medium bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg shadow-sm transition-colors cursor-pointer"
                          title="Apply rule from Birth Day & Month"
                        >
                          Auto {mozValidity.validityYears}y: {mozValidity.expiryDate}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleChange('passportExpiryDate', mozValidity.expiryDateFromToday)}
                          className="px-2.5 py-1 text-[11px] font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 rounded-lg transition-colors cursor-pointer"
                          title="Apply rule from today's date"
                        >
                          From Today: {mozValidity.expiryDateFromToday}
                        </button>
                      </>
                    )}
                    <button
                      type="button"
                      onClick={() => handleChange('passportExpiryDate', 'VITALÍCIO')}
                      className={`px-2.5 py-1 text-[11px] font-medium rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
                        isLifetime
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'bg-emerald-950/70 hover:bg-emerald-900/90 text-emerald-300 border border-emerald-800/70'
                      }`}
                      title="Set as Vitalício (non-expiring for 50+ / lifetime)"
                    >
                      <Shield className="w-3.5 h-3.5" />
                      Set Vitalício
                    </button>
                  </div>
                </div>

                {/* The 3 rule tiers with dynamic highlighting */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 border-t border-zinc-800/80">
                  <div
                    className={`p-2 rounded-lg border text-[11px] transition-all ${
                      mozValidity?.ageGroup === 'UNDER_40'
                        ? 'bg-emerald-950/40 border-emerald-500/60 text-emerald-200'
                        : 'bg-zinc-950/40 border-zinc-800/80 text-zinc-400'
                    }`}
                  >
                    <div className="font-semibold flex items-center justify-between">
                      <span>Under 40 years old</span>
                      <span className="font-mono px-1 py-0.2 rounded bg-indigo-500/10 text-indigo-300 text-[10px]">5 Years</span>
                    </div>
                    <div className="text-[10px] text-zinc-400 mt-0.5">
                      Valid for 5 years
                    </div>
                  </div>

                  <div
                    className={`p-2 rounded-lg border text-[11px] transition-all ${
                      mozValidity?.ageGroup === '40_TO_49'
                        ? 'bg-emerald-950/40 border-emerald-500/60 text-emerald-200'
                        : 'bg-zinc-950/40 border-zinc-800/80 text-zinc-400'
                    }`}
                  >
                    <div className="font-semibold flex items-center justify-between">
                      <span>40 to 49 years old</span>
                      <span className="font-mono px-1 py-0.2 rounded bg-indigo-500/10 text-indigo-300 text-[10px]">10 Years</span>
                    </div>
                    <div className="text-[10px] text-zinc-400 mt-0.5">
                      Valid for 10 years
                    </div>
                  </div>

                  <div
                    className={`p-2 rounded-lg border text-[11px] transition-all ${
                      mozValidity?.ageGroup === '50_AND_OLDER'
                        ? 'bg-emerald-950/40 border-emerald-500/60 text-emerald-200'
                        : 'bg-zinc-950/40 border-zinc-800/80 text-zinc-400'
                    }`}
                  >
                    <div className="font-semibold flex items-center justify-between">
                      <span>50 years and older</span>
                      <span className="font-mono px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-300 text-[10px]">Vitalício</span>
                    </div>
                    <div className="text-[10px] text-zinc-400 mt-0.5">
                      Valid for life (no expiry)
                    </div>
                  </div>
                </div>

                {mozValidity && (
                  <div className="text-[11px] text-emerald-400 font-medium flex items-center gap-1.5 pt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>
                      Matched Traveler: Age {mozValidity.age} ➔ {mozValidity.ruleDescription} (Auto-Set: <strong className="font-mono">{mozValidity.expiryDate}</strong>)
                    </span>
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                  EMAIL ADDRESS
                </label>
                <input
                  type="email"
                  placeholder="DEC.TravelMZ@daewooenc.com"
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

          {/* Section 2: Flights & Transportation Details */}
          <div className="pt-4 border-t border-zinc-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                  <Plane className="w-3.5 h-3.5 text-indigo-400" />
                  2. Flight & Transportation Details
                </h4>
                <span className="text-[10px] bg-zinc-800 text-indigo-300 font-mono px-2 py-0.5 rounded-full border border-zinc-700">
                  {flightsList.length} {flightsList.length === 1 ? 'Flight Date' : 'Flight Dates / Legs'}
                </span>
              </div>
              <span className="text-[10px] text-zinc-500 hidden sm:inline">
                Official TAF supports up to 4 flight dates
              </span>
            </div>

            {/* List of Flight Dates / Legs */}
            <div className="space-y-3">
              {flightsList.map((flt, idx) => {
                const fDateVal = validateDate(flt.date, `Flight #${idx + 1} Date`);
                const fDepVal = validateTime(flt.departureTime, `Flight #${idx + 1} Dep Time`);
                const fArrVal = validateTime(flt.arrivalTime, `Flight #${idx + 1} Arr Time`);
                const fTimesVal = validateFlightTimes(flt.departureTime, flt.arrivalTime);

                return (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl border border-zinc-800/90 bg-zinc-950/60 space-y-2.5 transition-all"
                  >
                    {/* Leg Header */}
                    <div className="flex items-center justify-between pb-2 border-b border-zinc-800/60">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-semibold text-zinc-200 flex items-center gap-1.5">
                          <Plane className="w-3 h-3 text-indigo-400" />
                          {idx === 0 ? 'Flight Date / Leg #1 (Primary / Outbound)' : `Flight Date / Leg #${idx + 1} (Return / Connecting / Extra Date)`}
                        </span>
                        {flt.from && flt.to && (
                          <span className="text-[10px] font-mono text-zinc-400 bg-zinc-800/80 px-1.5 py-0.5 rounded border border-zinc-700/60">
                            {flt.from} → {flt.to}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {fTimesVal.warning && (
                          <span className="text-[10px] text-amber-400 flex items-center gap-1 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-800/50">
                            <AlertTriangle className="w-2.5 h-2.5" />
                            {fTimesVal.warning}
                          </span>
                        )}

                        {flightsList.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveFlight(idx)}
                            className="p-1 text-zinc-400 hover:text-rose-400 hover:bg-rose-950/40 rounded border border-transparent hover:border-rose-900/50 transition-colors cursor-pointer text-[10px] flex items-center gap-1"
                            title="Remove this extra flight leg"
                          >
                            <Trash2 className="w-3 h-3 text-rose-400" />
                            <span className="hidden sm:inline text-rose-300">Remove</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Leg Fields Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
                      {/* FLIGHT DATE */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-[10px] font-medium text-zinc-400 flex items-center gap-1">
                            <Calendar className="w-2.5 h-2.5 text-indigo-400" />
                            DATE *
                          </label>
                          <DrumPickerTriggerButton
                            onClick={() =>
                              openDrumDatePicker(
                                `Select Flight Date #${idx + 1}`,
                                flt.date,
                                'short',
                                'flightDate',
                                val => handleFlightChange(idx, 'date', val)
                              )
                            }
                            title={`Open Scroll Wheel / Drum Date Picker for Flight #${idx + 1}`}
                          />
                        </div>
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="M/D/YYYY"
                            value={flt.date}
                            onChange={e => handleFlightChange(idx, 'date', e.target.value)}
                            className={`w-full px-2.5 py-1.5 text-xs bg-zinc-800/90 border rounded-lg focus:ring-2 focus:ring-indigo-500 font-mono ${
                              !fDateVal.isValid ? 'border-rose-500 text-rose-200' : 'border-zinc-700 text-zinc-100'
                            }`}
                          />
                          <input
                            type="date"
                            aria-label={`Pick Flight Date #${idx + 1}`}
                            className="absolute right-2 top-1.5 opacity-0 w-5 h-5 cursor-pointer"
                            onChange={e => {
                              if (e.target.value) {
                                const parsed = new Date(e.target.value + 'T00:00:00');
                                handleFlightChange(idx, 'date', formatToStandardDate(parsed, 'short'));
                              }
                            }}
                          />
                        </div>
                        {!fDateVal.isValid && (
                          <p className="text-[9px] text-rose-400 mt-0.5">{fDateVal.error}</p>
                        )}
                      </div>

                      {/* FROM (AIRPORT WITH SCROLL UP/DOWN) */}
                      <div>
                        <MozambiqueAirportPicker
                          label="FROM (AIRPORT)"
                          value={flt.from}
                          onSelect={loc => handleFlightChange(idx, 'from', loc.toUpperCase())}
                          placeholder="e.g. PEMBA"
                        />
                      </div>

                      {/* TO (AIRPORT WITH SCROLL UP/DOWN) */}
                      <div>
                        <MozambiqueAirportPicker
                          label="TO (AIRPORT)"
                          value={flt.to}
                          onSelect={loc => handleFlightChange(idx, 'to', loc.toUpperCase())}
                          placeholder="e.g. AFUNGI"
                        />
                      </div>

                      {/* DEP TIME */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-[10px] font-medium text-zinc-400 flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5 text-indigo-400" />
                            DEP TIME
                          </label>
                          <DrumPickerTriggerButton
                            onClick={() =>
                              openDrumTimePicker(
                                `Select Dep Time #${idx + 1}`,
                                flt.departureTime,
                                val => handleFlightChange(idx, 'departureTime', val)
                              )
                            }
                            title={`Open Scroll Wheel / Drum Time Picker for Dep Time #${idx + 1}`}
                          />
                        </div>
                        <input
                          type="text"
                          placeholder="06:45"
                          value={flt.departureTime}
                          onChange={e => handleFlightChange(idx, 'departureTime', e.target.value)}
                          className={`w-full px-2.5 py-1.5 text-xs bg-zinc-800/90 border rounded-lg focus:ring-2 focus:ring-indigo-500 font-mono ${
                            !fDepVal.isValid ? 'border-rose-500 text-rose-200' : 'border-zinc-700 text-zinc-100'
                          }`}
                        />
                        {!fDepVal.isValid && (
                          <p className="text-[9px] text-rose-400 mt-0.5">{fDepVal.error}</p>
                        )}
                      </div>

                      {/* ARR TIME */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-[10px] font-medium text-zinc-400 flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5 text-indigo-400" />
                            ARR TIME
                          </label>
                          <DrumPickerTriggerButton
                            onClick={() =>
                              openDrumTimePicker(
                                `Select Arr Time #${idx + 1}`,
                                flt.arrivalTime,
                                val => handleFlightChange(idx, 'arrivalTime', val)
                              )
                            }
                            title={`Open Scroll Wheel / Drum Time Picker for Arr Time #${idx + 1}`}
                          />
                        </div>
                        <input
                          type="text"
                          placeholder="07:30"
                          value={flt.arrivalTime}
                          onChange={e => handleFlightChange(idx, 'arrivalTime', e.target.value)}
                          className={`w-full px-2.5 py-1.5 text-xs bg-zinc-800/90 border rounded-lg focus:ring-2 focus:ring-indigo-500 font-mono ${
                            !fArrVal.isValid ? 'border-rose-500 text-rose-200' : 'border-zinc-700 text-zinc-100'
                          }`}
                        />
                        {!fArrVal.isValid && (
                          <p className="text-[9px] text-rose-400 mt-0.5">{fArrVal.error}</p>
                        )}
                      </div>

                      {/* AIRLINE & FLIGHT NO */}
                      <div>
                        <label className="block text-[10px] font-medium text-zinc-400 mb-1">
                          AIRLINE & FLT
                        </label>
                        <input
                          type="text"
                          value={flt.airlineAndFlightNo}
                          onChange={e => handleFlightChange(idx, 'airlineAndFlightNo', e.target.value)}
                          placeholder="e.g. SOLENTA"
                          className="w-full px-2.5 py-1.5 text-xs bg-zinc-800/90 border border-zinc-700 text-zinc-100 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* BUTTON BAR: ADD EXTRA DATE / LEG AT BOTTOM */}
            <div className="pt-2 flex flex-wrap items-center justify-between gap-2 bg-zinc-950/40 p-3 rounded-xl border border-dashed border-zinc-800">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  id="add-extra-flight-date-btn"
                  onClick={() => handleAddFlight()}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs rounded-lg shadow-sm transition-all cursor-pointer hover:shadow-indigo-500/20 active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Add Extra Date / Flight Leg</span>
                </button>

                {/* Quick Helper Presets */}
                <button
                  type="button"
                  onClick={() => {
                    const last = flightsList[flightsList.length - 1];
                    handleAddFlight({
                      from: 'AFUNGI',
                      to: 'PEMBA',
                      date: last?.date || '8/9/2026',
                      departureTime: '14:00',
                      arrivalTime: '14:45',
                      airlineAndFlightNo: 'SOLENTA'
                    });
                  }}
                  className="flex items-center gap-1 px-2.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[11px] rounded-lg border border-zinc-700 transition-colors cursor-pointer"
                  title="Add Return Leg (Afungi to Pemba)"
                >
                  <ArrowRightLeft className="w-3 h-3 text-indigo-400" />
                  <span>+ Return Leg (AFUNGI → PEMBA)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const last = flightsList[flightsList.length - 1];
                    handleAddFlight({
                      from: 'MAPUTO',
                      to: 'PEMBA',
                      date: last?.date || '8/9/2026',
                      departureTime: '09:00',
                      arrivalTime: '11:30',
                      airlineAndFlightNo: 'LAM TM120'
                    });
                  }}
                  className="flex items-center gap-1 px-2.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[11px] rounded-lg border border-zinc-700 transition-colors cursor-pointer"
                  title="Add Connecting Leg (Maputo to Pemba)"
                >
                  <Plane className="w-3 h-3 text-indigo-400" />
                  <span>+ Connecting Leg (MAPUTO → PEMBA)</span>
                </button>
              </div>

              <span className="text-[10px] text-zinc-500 font-mono">
                {flightsList.length} / 4 Rows Populated
              </span>
            </div>
          </div>

          {/* Section 3: Accommodation Required */}
          <div className="pt-4 border-t border-zinc-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                  <Hotel className="w-3.5 h-3.5 text-indigo-400" />
                  3. Accommodation Required
                </h4>
                <span className="text-[10px] bg-zinc-800 text-indigo-300 font-mono px-2 py-0.5 rounded-full border border-zinc-700">
                  {accommodationList.length} {accommodationList.length === 1 ? 'Accommodation Stay' : 'Accommodation Stays / Dates'}
                </span>
              </div>
              <span className="text-[10px] text-zinc-500 hidden sm:inline">
                Official TAF supports up to 4 accommodation rows
              </span>
            </div>

            {/* List of Accommodation Stays / Dates */}
            <div className="space-y-3">
              {accommodationList.map((accItem, idx) => {
                const cInVal = validateDate(accItem.checkIn, `Stay #${idx + 1} Check-In`);
                const cOutVal = validateDate(accItem.checkOut, `Stay #${idx + 1} Check-Out`, { allowEmpty: true });
                const stayDatesVal = validateAccommodationDates(accItem.checkIn, accItem.checkOut);

                return (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl border border-zinc-800/90 bg-zinc-950/60 space-y-2.5 transition-all"
                  >
                    {/* Stay Header */}
                    <div className="flex items-center justify-between pb-2 border-b border-zinc-800/60">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-semibold text-zinc-200 flex items-center gap-1.5">
                          <Hotel className="w-3 h-3 text-indigo-400" />
                          {idx === 0 ? 'Accommodation Stay #1 (Primary / Site Camp)' : `Accommodation Stay #${idx + 1} (Transit / Extra Date)`}
                        </span>
                        {accItem.hotelOrCamp && (
                          <span className="text-[10px] font-mono text-zinc-400 bg-zinc-800/80 px-1.5 py-0.5 rounded border border-zinc-700/60">
                            {accItem.hotelOrCamp} {accItem.location ? `• ${accItem.location}` : ''}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {stayDatesVal.error && (
                          <span className="text-[10px] text-rose-400 flex items-center gap-1 bg-rose-950/40 px-2 py-0.5 rounded border border-rose-800/50">
                            <AlertTriangle className="w-2.5 h-2.5" />
                            {stayDatesVal.error}
                          </span>
                        )}

                        {accommodationList.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveAccommodation(idx)}
                            className="p-1 text-zinc-400 hover:text-rose-400 hover:bg-rose-950/40 rounded border border-transparent hover:border-rose-900/50 transition-colors cursor-pointer text-[10px] flex items-center gap-1"
                            title="Remove this accommodation stay"
                          >
                            <Trash2 className="w-3 h-3 text-rose-400" />
                            <span className="hidden sm:inline text-rose-300">Remove</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Stay Fields Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                      {/* CHECK-IN */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-[10px] font-medium text-zinc-400 flex items-center gap-1">
                            <Calendar className="w-2.5 h-2.5 text-indigo-400" />
                            CHECK-IN *
                          </label>
                          <DrumPickerTriggerButton
                            onClick={() =>
                              openDrumDatePicker(
                                `Select Check-In Date #${idx + 1}`,
                                accItem.checkIn,
                                'short',
                                'checkIn',
                                val => handleAccommodationChange(idx, 'checkIn', val)
                              )
                            }
                            title={`Open Scroll Wheel / Drum Date Picker for Check-In #${idx + 1}`}
                          />
                        </div>
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="M/D/YYYY"
                            value={accItem.checkIn}
                            onChange={e => handleAccommodationChange(idx, 'checkIn', e.target.value)}
                            className={`w-full px-2.5 py-1.5 text-xs bg-zinc-800/90 border rounded-lg focus:ring-2 focus:ring-indigo-500 font-mono ${
                              !cInVal.isValid ? 'border-rose-500 text-rose-200' : 'border-zinc-700 text-zinc-100'
                            }`}
                          />
                          <input
                            type="date"
                            aria-label={`Pick Check-In Date #${idx + 1}`}
                            className="absolute right-2 top-1.5 opacity-0 w-5 h-5 cursor-pointer"
                            onChange={e => {
                              if (e.target.value) {
                                const parsed = new Date(e.target.value + 'T00:00:00');
                                handleAccommodationChange(idx, 'checkIn', formatToStandardDate(parsed, 'short'));
                              }
                            }}
                          />
                        </div>
                        {!cInVal.isValid && (
                          <p className="text-[9px] text-rose-400 mt-0.5">{cInVal.error}</p>
                        )}
                      </div>

                      {/* CHECK-OUT */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-[10px] font-medium text-zinc-400 flex items-center gap-1">
                            <Calendar className="w-2.5 h-2.5 text-indigo-400" />
                            CHECK-OUT (Opt)
                          </label>
                          <DrumPickerTriggerButton
                            onClick={() =>
                              openDrumDatePicker(
                                `Select Check-Out Date #${idx + 1}`,
                                accItem.checkOut,
                                'short',
                                'checkOut',
                                val => handleAccommodationChange(idx, 'checkOut', val)
                              )
                            }
                            title={`Open Scroll Wheel / Drum Date Picker for Check-Out #${idx + 1}`}
                          />
                        </div>
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="M/D/YYYY"
                            value={accItem.checkOut}
                            onChange={e => handleAccommodationChange(idx, 'checkOut', e.target.value)}
                            className={`w-full px-2.5 py-1.5 text-xs bg-zinc-800/90 border rounded-lg focus:ring-2 focus:ring-indigo-500 font-mono ${
                              !cOutVal.isValid || stayDatesVal.error
                                ? 'border-rose-500 text-rose-200'
                                : 'border-zinc-700 text-zinc-100'
                            }`}
                          />
                          <input
                            type="date"
                            aria-label={`Pick Check-Out Date #${idx + 1}`}
                            className="absolute right-2 top-1.5 opacity-0 w-5 h-5 cursor-pointer"
                            onChange={e => {
                              if (e.target.value) {
                                const parsed = new Date(e.target.value + 'T00:00:00');
                                handleAccommodationChange(idx, 'checkOut', formatToStandardDate(parsed, 'short'));
                              }
                            }}
                          />
                        </div>
                        {stayDatesVal.error ? (
                          <p className="text-[9px] text-rose-400 mt-0.5">{stayDatesVal.error}</p>
                        ) : !cOutVal.isValid ? (
                          <p className="text-[9px] text-rose-400 mt-0.5">{cOutVal.error}</p>
                        ) : null}
                      </div>

                      {/* HOTEL / CAMP */}
                      <div>
                        <label className="block text-[10px] font-medium text-zinc-400 mb-1">
                          HOTEL / CAMP
                        </label>
                        <input
                          type="text"
                          value={accItem.hotelOrCamp}
                          onChange={e => handleAccommodationChange(idx, 'hotelOrCamp', e.target.value)}
                          placeholder="e.g. 9500 / AVANI"
                          className="w-full px-2.5 py-1.5 text-xs bg-zinc-800/90 border border-zinc-700 text-zinc-100 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>

                      {/* LOCATION */}
                      <div>
                        <label className="block text-[10px] font-medium text-zinc-400 mb-1">
                          LOCATION
                        </label>
                        <input
                          type="text"
                          value={accItem.location}
                          onChange={e => handleAccommodationChange(idx, 'location', e.target.value)}
                          placeholder="e.g. AFUNGI / PEMBA"
                          className="w-full px-2.5 py-1.5 text-xs bg-zinc-800/90 border border-zinc-700 text-zinc-100 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>

                      {/* NOTES */}
                      <div>
                        <label className="block text-[10px] font-medium text-zinc-400 mb-1">
                          NOTES
                        </label>
                        <input
                          type="text"
                          value={accItem.notes}
                          onChange={e => handleAccommodationChange(idx, 'notes', e.target.value)}
                          placeholder="e.g. SHARED / SINGLE"
                          className="w-full px-2.5 py-1.5 text-xs bg-zinc-800/90 border border-zinc-700 text-zinc-100 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* BUTTON BAR: ADD EXTRA DATE / ACCOMMODATION AT BOTTOM */}
            <div className="pt-2 flex flex-wrap items-center justify-between gap-2 bg-zinc-950/40 p-3 rounded-xl border border-dashed border-zinc-800">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  id="add-extra-accommodation-date-btn"
                  onClick={() => handleAddAccommodation()}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs rounded-lg shadow-sm transition-all cursor-pointer hover:shadow-indigo-500/20 active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Add Extra Date / Accommodation Stay</span>
                </button>

                {/* Quick Helper Presets */}
                <button
                  type="button"
                  onClick={() => {
                    const last = accommodationList[accommodationList.length - 1];
                    handleAddAccommodation({
                      hotelOrCamp: '9500',
                      location: 'AFUNGI',
                      notes: 'SHARED',
                      checkIn: last?.checkOut || last?.checkIn || '8/9/2026',
                      checkOut: ''
                    });
                  }}
                  className="flex items-center gap-1 px-2.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[11px] rounded-lg border border-zinc-700 transition-colors cursor-pointer"
                  title="Add Afungi Camp 9500 Stay"
                >
                  <Hotel className="w-3 h-3 text-indigo-400" />
                  <span>+ Afungi Camp (9500)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const last = accommodationList[accommodationList.length - 1];
                    handleAddAccommodation({
                      hotelOrCamp: 'AVANI PEMBA',
                      location: 'PEMBA',
                      notes: 'TRANSIT',
                      checkIn: last?.checkOut || last?.checkIn || '8/9/2026',
                      checkOut: ''
                    });
                  }}
                  className="flex items-center gap-1 px-2.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[11px] rounded-lg border border-zinc-700 transition-colors cursor-pointer"
                  title="Add Pemba Hotel Transit Stay"
                >
                  <Hotel className="w-3 h-3 text-indigo-400" />
                  <span>+ Pemba Hotel (AVANI)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const last = accommodationList[accommodationList.length - 1];
                    handleAddAccommodation({
                      hotelOrCamp: 'HOTEL POLANA',
                      location: 'MAPUTO',
                      notes: 'TRANSIT',
                      checkIn: last?.checkOut || last?.checkIn || '8/9/2026',
                      checkOut: ''
                    });
                  }}
                  className="flex items-center gap-1 px-2.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[11px] rounded-lg border border-zinc-700 transition-colors cursor-pointer"
                  title="Add Maputo Hotel Transit Stay"
                >
                  <Hotel className="w-3 h-3 text-indigo-400" />
                  <span>+ Maputo Hotel (POLANA)</span>
                </button>
              </div>

              <span className="text-[10px] text-zinc-500 font-mono">
                {accommodationList.length} / 4 Rows Populated
              </span>
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

          {/* Section 5: Daewoo E&C Mobilization Form - Independent Route & Site */}
          <div className="pt-4 border-t border-zinc-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                  5. Daewoo E&amp;C Mobilization Form - Route &amp; Site (Separate Print)
                </h4>
              </div>
              <span className="text-[10px] text-zinc-400 font-mono">
                Prints as a separate legal sheet
              </span>
            </div>

            <div className="p-3.5 bg-zinc-950/70 border border-emerald-900/40 rounded-xl space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label className="flex items-center gap-2 text-xs font-medium text-zinc-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!formData.mobilizationForm?.isCustomRoute}
                    onChange={e => {
                      const isCustom = e.target.checked;
                      setFormData(prev => {
                        const currentMob = prev.mobilizationForm || extractMobilizationDataFromTraveler(prev);
                        return {
                          ...prev,
                          mobilizationForm: {
                            ...currentMob,
                            isCustomRoute: isCustom
                          }
                        };
                      });
                    }}
                    className="rounded accent-emerald-500 w-4 h-4 cursor-pointer"
                  />
                  <span>Customize Route location (not the same as TAF)</span>
                </label>

                <span className="text-[10px] text-zinc-400 font-mono">
                  Scroll ▲/▼ for all Mozambican airports
                </span>
              </div>

              {/* Mobilization Site & Route Pickers with Scroll Up / Down */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                <div>
                  <MozambiqueAirportPicker
                    label="MOBILIZATION SITE / BASE"
                    value={formData.mobilizationForm?.site || formData.finalDestination || 'OPBL1'}
                    onSelect={loc => {
                      setFormData(prev => {
                        const currentMob = prev.mobilizationForm || extractMobilizationDataFromTraveler(prev);
                        return {
                          ...prev,
                          mobilizationForm: {
                            ...currentMob,
                            site: loc.toUpperCase(),
                            isCustomRoute: true
                          }
                        };
                      });
                    }}
                    placeholder="e.g. OPBL1, Afungi, Palma..."
                  />
                </div>

                <div>
                  <MozambiqueAirportPicker
                    label="MOBILIZATION ORIGIN (AIRPORT)"
                    value={formData.mobilizationForm?.routes?.[0]?.origin || formData.flights?.[0]?.from || 'MAPUTO'}
                    onSelect={loc => {
                      setFormData(prev => {
                        const currentMob = prev.mobilizationForm || extractMobilizationDataFromTraveler(prev);
                        const newRoutes = [...currentMob.routes];
                        if (!newRoutes[0]) newRoutes[0] = { date: '', origin: '', etd: '', destination: '', eta: '' };
                        newRoutes[0] = { ...newRoutes[0], origin: loc.toUpperCase() };
                        return {
                          ...prev,
                          mobilizationForm: {
                            ...currentMob,
                            isCustomRoute: true,
                            routes: newRoutes
                          }
                        };
                      });
                    }}
                    placeholder="e.g. MAPUTO, BEIRA, PEMBA..."
                  />
                </div>

                <div>
                  <MozambiqueAirportPicker
                    label="MOBILIZATION DESTINATION (AIRPORT)"
                    value={formData.mobilizationForm?.routes?.[0]?.destination || formData.flights?.[0]?.to || 'PEMBA'}
                    onSelect={loc => {
                      setFormData(prev => {
                        const currentMob = prev.mobilizationForm || extractMobilizationDataFromTraveler(prev);
                        const newRoutes = [...currentMob.routes];
                        if (!newRoutes[0]) newRoutes[0] = { date: '', origin: '', etd: '', destination: '', eta: '' };
                        newRoutes[0] = { ...newRoutes[0], destination: loc.toUpperCase() };
                        return {
                          ...prev,
                          mobilizationForm: {
                            ...currentMob,
                            isCustomRoute: true,
                            routes: newRoutes
                          }
                        };
                      });
                    }}
                    placeholder="e.g. PEMBA, AFUNGI, NACALA..."
                  />
                </div>
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

