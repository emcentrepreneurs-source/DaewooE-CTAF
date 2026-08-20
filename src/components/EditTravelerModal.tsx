import React, { useState } from 'react';
import { TravelerRecord, PurposeOfTrip } from '../types';
import { X, Save, User, Plane, Hotel, Check, FileCheck } from 'lucide-react';

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
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
              <h3 className="text-base font-semibold text-zinc-100">
                Edit Traveler & Flight Information
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Adjust personal, flight, and accommodation fields for TAF form generation.
              </p>
            </div>
          </div>
          <button
            id="close-edit-modal-btn"
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Section 1: Personal Info */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-3 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-indigo-400" />
              1. Personal & Company Information
            </h4>
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
                    className={`flex items-center justify-between px-3 py-1.5 text-xs rounded-lg border transition-all ${
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
              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                  PASSPORT / ID NUMBER *
                </label>
                <input
                  type="text"
                  value={formData.passportOrIdNumber}
                  onChange={e => handleChange('passportOrIdNumber', e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-zinc-800/90 border border-zinc-700 text-zinc-100 rounded-lg focus:ring-2 focus:ring-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                  DATE OF BIRTH (e.g. 12-Aug-90)
                </label>
                <input
                  type="text"
                  value={formData.dateOfBirth}
                  onChange={e => handleChange('dateOfBirth', e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-zinc-800/90 border border-zinc-700 text-zinc-100 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
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

              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                  EXPIRY DATE (e.g. 16-Jan-33)
                </label>
                <input
                  type="text"
                  value={formData.passportExpiryDate}
                  onChange={e => handleChange('passportExpiryDate', e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-zinc-800/90 border border-zinc-700 text-zinc-100 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
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

              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                  MOBILE NUMBER
                </label>
                <input
                  type="text"
                  value={formData.mobileNumber}
                  onChange={e => handleChange('mobileNumber', e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-zinc-800/90 border border-zinc-700 text-zinc-100 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Flights */}
          <div className="pt-4 border-t border-zinc-800">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-3 flex items-center gap-1.5">
              <Plane className="w-3.5 h-3.5 text-indigo-400" />
              2. Flight & Transportation Details
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                  DATE
                </label>
                <input
                  type="text"
                  value={flight.date}
                  onChange={e => handleFlightChange(0, 'date', e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-zinc-800/90 border border-zinc-700 text-zinc-100 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
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

              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                  DEP TIME
                </label>
                <input
                  type="text"
                  value={flight.departureTime}
                  onChange={e => handleFlightChange(0, 'departureTime', e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-zinc-800/90 border border-zinc-700 text-zinc-100 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                  ARR TIME
                </label>
                <input
                  type="text"
                  value={flight.arrivalTime}
                  onChange={e => handleFlightChange(0, 'arrivalTime', e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-zinc-800/90 border border-zinc-700 text-zinc-100 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
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
              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                  CHECK-IN
                </label>
                <input
                  type="text"
                  value={acc.checkIn}
                  onChange={e => handleAccommodationChange(0, 'checkIn', e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-zinc-800/90 border border-zinc-700 text-zinc-100 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                  CHECK-OUT
                </label>
                <input
                  type="text"
                  value={acc.checkOut}
                  onChange={e => handleAccommodationChange(0, 'checkOut', e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-zinc-800/90 border border-zinc-700 text-zinc-100 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
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
              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                  SIGNATURE DATE (e.g. 06 AUGUST 2026)
                </label>
                <input
                  type="text"
                  value={formData.signatureDate}
                  onChange={e => handleChange('signatureDate', e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-zinc-800/90 border border-zinc-700 text-zinc-100 rounded-lg focus:ring-2 focus:ring-indigo-500 font-mono"
                />
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
          <div className="pt-4 border-t border-zinc-800 flex items-center justify-end gap-2.5 sticky bottom-0 bg-zinc-900 py-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-zinc-300 bg-zinc-800 hover:bg-zinc-700 rounded-lg border border-zinc-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="save-traveler-btn"
              className="flex items-center gap-1.5 px-5 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-lg hover:shadow-indigo-500/20 transition-all"
            >
              <Save className="w-4 h-4" />
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
