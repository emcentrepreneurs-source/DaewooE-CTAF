export type PurposeOfTrip = 
  | 'Business Trip'
  | 'Rotational Leave'
  | 'Mobilization'
  | 'Emergency Leave'
  | 'Visa Application'
  | 'Demobilization';

export interface FlightEntry {
  date: string;
  from: string;
  to: string;
  departureTime: string;
  arrivalTime: string;
  airlineAndFlightNo: string;
}

export interface AccommodationEntry {
  checkIn: string;
  checkOut: string;
  hotelOrCamp: string;
  location: string;
  notes: string;
}

export interface TravelerRecord {
  id: string;
  // Section 1: Traveler Information
  surname: string;
  nameAndGender: string; // e.g. "ABREU ANTONIO / MALE"
  finalDestination: string; // e.g. "Afungi"
  rotationType: string; // e.g. "Mobilization", "Rotational", "Regular"
  purposeOfTrip: PurposeOfTrip | string;
  
  companyId: string; // e.g. "30190"
  company: string; // e.g. "DAEWOO"
  projectPosition: string; // e.g. "BOOM TRUCK OPERATOR"
  projectDepartment: string; // e.g. "LOGISTICS"
  
  mobileNumber: string;
  emailAddress: string;
  substituteInAbsence: string;
  frequentFlyerCard: string;
  
  passportOrIdNumber: string;
  dateOfBirth: string; // e.g. "12-Aug-90"
  nationality: string; // e.g. "MOZAMBICAN"
  passportExpiryDate: string; // e.g. "16-Jan-33"

  // Section 2: Flights & Transportation
  flights: FlightEntry[];

  // Section 2: Accommodation
  accommodation: AccommodationEntry[];

  // Section 5: Signatures & Metadata
  signatureDate: string; // e.g. "06 AUGUST 2026" or "08/09/2026"
  signatureName?: string; // name to render
  signatureImage?: string; // base64 or drawn svg/dataUrl
  
  // Validation status
  isValid?: boolean;
  validationErrors?: string[];
}

export interface ColumnMapping {
  excelColumn: string;
  targetField: keyof TravelerRecord | string;
}

export interface BatchProgress {
  total: number;
  current: number;
  status: 'idle' | 'parsing' | 'generating' | 'zipping' | 'completed' | 'error';
  currentTravelerName?: string;
  errorMessage?: string;
}

export interface DefaultFormSettings {
  finalDestination: string;
  rotationType: string;
  purposeOfTrip: PurposeOfTrip;
  company: string;
  projectDepartment: string;
  flightFrom: string;
  flightTo: string;
  flightDate: string;
  departureTime: string;
  arrivalTime: string;
  airline: string;
  camp: string;
  campLocation: string;
  accommodationNotes: string;
  signatureDate: string;
  travelContact: string;
  securityContact: string;
}

export interface UserAccount {
  id?: number;
  uid: string;
  username?: string;
  email: string;
  displayName: string;
  role: 'admin' | 'coordinator' | 'logistics' | 'traveler' | 'user';
  department?: string;
  company?: string;
  password?: string;
  createdAt?: string;
  updatedAt?: string;
}
