import { TravelerRecord } from '../types';
import * as XLSX from 'xlsx';

export const SAMPLE_TRAVELERS: TravelerRecord[] = [
  {
    id: 'TRV-001',
    surname: 'LUIS',
    nameAndGender: 'ABREU ANTONIO / MALE',
    finalDestination: 'Afungi',
    rotationType: 'Mobilization',
    purposeOfTrip: 'Mobilization',
    companyId: '30190',
    company: 'DAEWOO',
    projectPosition: 'BOOM TRUCK OPERATOR',
    projectDepartment: 'HEAVY EQUIPMENT',
    mobileNumber: '+258 841234567',
    emailAddress: 'DEC.TravelMZ@daewooenc.com',
    substituteInAbsence: 'N/A',
    frequentFlyerCard: 'N/A',
    passportOrIdNumber: '050101589757Q',
    dateOfBirth: '12-Aug-90',
    nationality: 'MOZAMBICAN',
    passportExpiryDate: '16-Jan-33',
    flights: [
      {
        date: '8/9/2026',
        from: 'PEMBA',
        to: 'AFUNGI',
        departureTime: '06:45',
        arrivalTime: '07:30',
        airlineAndFlightNo: 'SOLENTA'
      }
    ],
    accommodation: [
      {
        checkIn: '8/9/2026',
        checkOut: '',
        hotelOrCamp: '9500',
        location: 'AFUNGI',
        notes: 'SHARED'
      }
    ],
    signatureDate: '06 AUGUST 2026',
    signatureName: 'Eric Matola'
  },
  {
    id: 'TRV-002',
    surname: 'MATUSSE',
    nameAndGender: 'CARLOS ALBERTO / MALE',
    finalDestination: 'Afungi',
    rotationType: 'Mobilization',
    purposeOfTrip: 'Mobilization',
    companyId: '30245',
    company: 'DAEWOO',
    projectPosition: 'SENIOR RIGGER',
    projectDepartment: 'CONSTRUCTION',
    mobileNumber: '+258 842345678',
    emailAddress: 'DEC.TravelMZ@daewooenc.com',
    substituteInAbsence: 'N/A',
    frequentFlyerCard: 'N/A',
    passportOrIdNumber: '110200489122K',
    dateOfBirth: '05-Mar-88',
    nationality: 'MOZAMBICAN',
    passportExpiryDate: '22-Nov-31',
    flights: [
      {
        date: '8/9/2026',
        from: 'PEMBA',
        to: 'AFUNGI',
        departureTime: '06:45',
        arrivalTime: '07:30',
        airlineAndFlightNo: 'SOLENTA'
      }
    ],
    accommodation: [
      {
        checkIn: '8/9/2026',
        checkOut: '',
        hotelOrCamp: '9500',
        location: 'AFUNGI',
        notes: 'SHARED'
      }
    ],
    signatureDate: '06 AUGUST 2026',
    signatureName: 'Eric Matola'
  },
  {
    id: 'TRV-003',
    surname: 'CHISSANO',
    nameAndGender: 'ARMANDO JOAQUIM / MALE',
    finalDestination: 'Afungi',
    rotationType: 'Mobilization',
    purposeOfTrip: 'Mobilization',
    companyId: '30312',
    company: 'DAEWOO',
    projectPosition: 'HSE OFFICER',
    projectDepartment: 'SAFETY & ENVIRONMENT',
    mobileNumber: '+258 843456789',
    emailAddress: 'DEC.TravelMZ@daewooenc.com',
    substituteInAbsence: 'N/A',
    frequentFlyerCard: 'N/A',
    passportOrIdNumber: '080319854711M',
    dateOfBirth: '18-Jul-85',
    nationality: 'MOZAMBICAN',
    passportExpiryDate: '15-Sep-26',
    flights: [
      {
        date: '8/9/2026',
        from: 'PEMBA',
        to: 'AFUNGI',
        departureTime: '06:45',
        arrivalTime: '07:30',
        airlineAndFlightNo: 'SOLENTA'
      }
    ],
    accommodation: [
      {
        checkIn: '8/9/2026',
        checkOut: '',
        hotelOrCamp: '9500',
        location: 'AFUNGI',
        notes: 'SINGLE'
      }
    ],
    signatureDate: '06 AUGUST 2026',
    signatureName: 'Eric Matola'
  },
  {
    id: 'TRV-004',
    surname: 'FERNANDES',
    nameAndGender: 'MARIA BEATRIZ / FEMALE',
    finalDestination: 'Afungi',
    rotationType: 'Mobilization',
    purposeOfTrip: 'Mobilization',
    companyId: '30418',
    company: 'CCS JV',
    projectPosition: 'SITE QA/QC INSPECTOR',
    projectDepartment: 'QUALITY ASSURANCE',
    mobileNumber: '+258 844567890',
    emailAddress: 'DEC.TravelMZ@daewooenc.com',
    substituteInAbsence: 'N/A',
    frequentFlyerCard: 'N/A',
    passportOrIdNumber: '020419934822P',
    dateOfBirth: '24-Apr-93',
    nationality: 'MOZAMBICAN',
    passportExpiryDate: '14-Aug-34',
    flights: [
      {
        date: '8/9/2026',
        from: 'PEMBA',
        to: 'AFUNGI',
        departureTime: '06:45',
        arrivalTime: '07:30',
        airlineAndFlightNo: 'SOLENTA'
      }
    ],
    accommodation: [
      {
        checkIn: '8/9/2026',
        checkOut: '',
        hotelOrCamp: '9500',
        location: 'AFUNGI',
        notes: 'SHARED FEMALE'
      }
    ],
    signatureDate: '06 AUGUST 2026',
    signatureName: 'Eric Matola'
  },
  {
    id: 'TRV-005',
    surname: 'DOS SANTOS',
    nameAndGender: 'PAULO MANUEL / MALE',
    finalDestination: 'Afungi',
    rotationType: 'Mobilization',
    purposeOfTrip: 'Mobilization',
    companyId: '30509',
    company: 'DAEWOO',
    projectPosition: 'ELECTRICAL TECHNICIAN',
    projectDepartment: 'MAINTENANCE',
    mobileNumber: '+258 845678901',
    emailAddress: 'DEC.TravelMZ@daewooenc.com',
    substituteInAbsence: 'N/A',
    frequentFlyerCard: 'N/A',
    passportOrIdNumber: '070619890334T',
    dateOfBirth: '09-Sep-89',
    nationality: 'MOZAMBICAN',
    passportExpiryDate: '03-May-30',
    flights: [
      {
        date: '8/9/2026',
        from: 'PEMBA',
        to: 'AFUNGI',
        departureTime: '06:45',
        arrivalTime: '07:30',
        airlineAndFlightNo: 'SOLENTA'
      }
    ],
    accommodation: [
      {
        checkIn: '8/9/2026',
        checkOut: '',
        hotelOrCamp: '9500',
        location: 'AFUNGI',
        notes: 'SHARED'
      }
    ],
    signatureDate: '06 AUGUST 2026',
    signatureName: 'Eric Matola'
  },
  {
    id: 'TRV-006',
    surname: 'SITHOLE',
    nameAndGender: 'EUGENIO BAPTISTA / MALE',
    finalDestination: 'Afungi',
    rotationType: 'Mobilization',
    purposeOfTrip: 'Mobilization',
    companyId: '30621',
    company: 'DAEWOO',
    projectPosition: 'PIPING FOREMAN',
    projectDepartment: 'PIPING & MECHANICAL',
    mobileNumber: '+258 846789012',
    emailAddress: 'DEC.TravelMZ@daewooenc.com',
    substituteInAbsence: 'N/A',
    frequentFlyerCard: 'N/A',
    passportOrIdNumber: '090819875601R',
    dateOfBirth: '30-Oct-87',
    nationality: 'MOZAMBICAN',
    passportExpiryDate: '19-Jul-33',
    flights: [
      {
        date: '8/9/2026',
        from: 'PEMBA',
        to: 'AFUNGI',
        departureTime: '06:45',
        arrivalTime: '07:30',
        airlineAndFlightNo: 'SOLENTA'
      }
    ],
    accommodation: [
      {
        checkIn: '8/9/2026',
        checkOut: '',
        hotelOrCamp: '9500',
        location: 'AFUNGI',
        notes: 'SHARED'
      }
    ],
    signatureDate: '06 AUGUST 2026',
    signatureName: 'Eric Matola'
  },
  {
    id: 'TRV-007',
    surname: 'MABOTE',
    nameAndGender: 'FERNANDO TOMAS / MALE',
    finalDestination: 'Afungi',
    rotationType: 'Mobilization',
    purposeOfTrip: 'Mobilization',
    companyId: '30733',
    company: 'DAEWOO',
    projectPosition: '6G PIPE WELDER',
    projectDepartment: 'WELDING & FABRICATION',
    mobileNumber: '+258 847890123',
    emailAddress: 'DEC.TravelMZ@daewooenc.com',
    substituteInAbsence: 'N/A',
    frequentFlyerCard: 'N/A',
    passportOrIdNumber: '040519912844S',
    dateOfBirth: '14-Feb-91',
    nationality: 'MOZAMBICAN',
    passportExpiryDate: '',
    flights: [
      {
        date: '8/9/2026',
        from: 'PEMBA',
        to: 'AFUNGI',
        departureTime: '06:45',
        arrivalTime: '07:30',
        airlineAndFlightNo: 'SOLENTA'
      }
    ],
    accommodation: [
      {
        checkIn: '8/9/2026',
        checkOut: '',
        hotelOrCamp: '9500',
        location: 'AFUNGI',
        notes: 'SHARED'
      }
    ],
    signatureDate: '06 AUGUST 2026',
    signatureName: 'Eric Matola'
  },
  {
    id: 'TRV-008',
    surname: 'NHAMPULE',
    nameAndGender: 'INACIO RAFAEL / MALE',
    finalDestination: 'Afungi',
    rotationType: 'Mobilization',
    purposeOfTrip: 'Mobilization',
    companyId: '30844',
    company: 'DAEWOO',
    projectPosition: 'SCAFFOLDING SUPERVISOR',
    projectDepartment: 'CIVIL & ACCESS',
    mobileNumber: '+258 848901234',
    emailAddress: 'DEC.TravelMZ@daewooenc.com',
    substituteInAbsence: 'N/A',
    frequentFlyerCard: 'N/A',
    passportOrIdNumber: '010119864902A',
    dateOfBirth: '02-Jan-86',
    nationality: 'MOZAMBICAN',
    passportExpiryDate: '11-Dec-31',
    flights: [
      {
        date: '8/9/2026',
        from: 'PEMBA',
        to: 'AFUNGI',
        departureTime: '06:45',
        arrivalTime: '07:30',
        airlineAndFlightNo: 'SOLENTA'
      }
    ],
    accommodation: [
      {
        checkIn: '8/9/2026',
        checkOut: '',
        hotelOrCamp: '9500',
        location: 'AFUNGI',
        notes: 'SHARED'
      }
    ],
    signatureDate: '06 AUGUST 2026',
    signatureName: 'Eric Matola'
  },
  {
    id: 'TRV-009',
    surname: 'CUMBE',
    nameAndGender: 'GELSON DOMINGOS / MALE',
    finalDestination: 'Afungi',
    rotationType: 'Mobilization',
    purposeOfTrip: 'Mobilization',
    companyId: '30955',
    company: 'DAEWOO',
    projectPosition: 'LOGISTICS COORDINATOR',
    projectDepartment: 'MATERIAL LOGISTICS',
    mobileNumber: '+258 849012345',
    emailAddress: 'DEC.TravelMZ@daewooenc.com',
    substituteInAbsence: 'N/A',
    frequentFlyerCard: 'N/A',
    passportOrIdNumber: '060719948190B',
    dateOfBirth: '21-Jun-94',
    nationality: 'MOZAMBICAN',
    passportExpiryDate: '05-Jun-35',
    flights: [
      {
        date: '8/9/2026',
        from: 'PEMBA',
        to: 'AFUNGI',
        departureTime: '06:45',
        arrivalTime: '07:30',
        airlineAndFlightNo: 'SOLENTA'
      }
    ],
    accommodation: [
      {
        checkIn: '8/9/2026',
        checkOut: '',
        hotelOrCamp: '9500',
        location: 'AFUNGI',
        notes: 'SHARED'
      }
    ],
    signatureDate: '06 AUGUST 2026',
    signatureName: 'Eric Matola'
  },
  {
    id: 'TRV-010',
    surname: 'ZACARIAS',
    nameAndGender: 'TERESA AMELIA / FEMALE',
    finalDestination: 'Afungi',
    rotationType: 'Mobilization',
    purposeOfTrip: 'Mobilization',
    companyId: '31066',
    company: 'CCS JV',
    projectPosition: 'SITE NURSE / MEDEVAC',
    projectDepartment: 'MEDICAL & HEALTH',
    mobileNumber: '+258 840123456',
    emailAddress: 'DEC.TravelMZ@daewooenc.com',
    substituteInAbsence: 'N/A',
    frequentFlyerCard: 'N/A',
    passportOrIdNumber: '030919920199W',
    dateOfBirth: '15-Aug-92',
    nationality: 'MOZAMBICAN',
    passportExpiryDate: '18-Feb-34',
    flights: [
      {
        date: '8/9/2026',
        from: 'PEMBA',
        to: 'AFUNGI',
        departureTime: '06:45',
        arrivalTime: '07:30',
        airlineAndFlightNo: 'SOLENTA'
      }
    ],
    accommodation: [
      {
        checkIn: '8/9/2026',
        checkOut: '',
        hotelOrCamp: '9500',
        location: 'AFUNGI',
        notes: 'SHARED FEMALE'
      }
    ],
    signatureDate: '06 AUGUST 2026',
    signatureName: 'Eric Matola'
  },
  {
    id: 'TRV-011',
    surname: 'GUAMBE',
    nameAndGender: 'SALVADOR FELIX / MALE',
    finalDestination: 'Afungi',
    rotationType: 'Mobilization',
    purposeOfTrip: 'Mobilization',
    companyId: '31177',
    company: 'DAEWOO',
    projectPosition: 'TELEHANDLER OPERATOR',
    projectDepartment: 'EQUIPMENT OPERATIONS',
    mobileNumber: '+258 841357924',
    emailAddress: 'DEC.TravelMZ@daewooenc.com',
    substituteInAbsence: 'N/A',
    frequentFlyerCard: 'N/A',
    passportOrIdNumber: '100419889201Z',
    dateOfBirth: '11-Nov-88',
    nationality: 'MOZAMBICAN',
    passportExpiryDate: '27-Oct-32',
    flights: [
      {
        date: '',
        from: 'PEMBA',
        to: 'AFUNGI',
        departureTime: '06:45',
        arrivalTime: '07:30',
        airlineAndFlightNo: 'SOLENTA'
      }
    ],
    accommodation: [
      {
        checkIn: '8/9/2026',
        checkOut: '',
        hotelOrCamp: '9500',
        location: 'AFUNGI',
        notes: 'SHARED'
      }
    ],
    signatureDate: '06 AUGUST 2026',
    signatureName: 'Eric Matola'
  },
  {
    id: 'TRV-012',
    surname: 'MONDLANE',
    nameAndGender: 'VALENTIM LUCAS / MALE',
    finalDestination: 'Afungi',
    rotationType: 'Mobilization',
    purposeOfTrip: 'Mobilization',
    companyId: '31288',
    company: 'DAEWOO',
    projectPosition: 'RIGGING SUPERINTENDENT',
    projectDepartment: 'HEAVY LIFT',
    mobileNumber: '+258 842468013',
    emailAddress: 'DEC.TravelMZ@daewooenc.com',
    substituteInAbsence: 'N/A',
    frequentFlyerCard: 'N/A',
    passportOrIdNumber: '080219830114H',
    dateOfBirth: '29-Jan-83',
    nationality: 'MOZAMBICAN',
    passportExpiryDate: '09-Aug-30',
    flights: [
      {
        date: '8/9/2026',
        from: 'PEMBA',
        to: 'AFUNGI',
        departureTime: '06:45',
        arrivalTime: '07:30',
        airlineAndFlightNo: 'SOLENTA'
      }
    ],
    accommodation: [
      {
        checkIn: '8/9/2026',
        checkOut: '',
        hotelOrCamp: '9500',
        location: 'AFUNGI',
        notes: 'SINGLE'
      }
    ],
    signatureDate: '06 AUGUST 2026',
    signatureName: 'Eric Matola'
  }
];

export function generateSampleExcelBlob(): Blob {
  const rows = SAMPLE_TRAVELERS.map((t, idx) => ({
    'No': idx + 1,
    'SURNAME': t.surname,
    'NAME / GENDER': t.nameAndGender,
    'FINAL DESTINATION': t.finalDestination,
    'ROTATION TYPE': t.rotationType,
    'PURPOSE OF TRIP': t.purposeOfTrip,
    'COMPANY ID': t.companyId,
    'COMPANY': t.company,
    'PROJECT POSITION / JOB TITLE': t.projectPosition,
    'PROJECT DEPARTMENT': t.projectDepartment,
    'MOBILE NUMBER': t.mobileNumber,
    'EMAIL ADDRESS': t.emailAddress,
    'SUBSTITUTE IN MY ABSENCE': t.substituteInAbsence,
    'FREQUENT FLYER CARD': t.frequentFlyerCard,
    'PASSPORT/ NATIONAL ID NUMBER': t.passportOrIdNumber,
    'DATE OF BIRTH': t.dateOfBirth,
    'NATIONALITY': t.nationality,
    'PASSPORT EXPIRY DATE': t.passportExpiryDate,
    'FLIGHT DATE': t.flights[0]?.date || '8/9/2026',
    'FROM': t.flights[0]?.from || 'PEMBA',
    'TO': t.flights[0]?.to || 'AFUNGI',
    'DEPARTURE TIME': t.flights[0]?.departureTime || '06:45',
    'ARRIVAL TIME': t.flights[0]?.arrivalTime || '07:30',
    'AIRLINE & FLIGHT NUMBER': t.flights[0]?.airlineAndFlightNo || 'SOLENTA',
    'HOTEL / CAMP': t.accommodation[0]?.hotelOrCamp || '9500',
    'CAMP LOCATION': t.accommodation[0]?.location || 'AFUNGI',
    'ACCOMMODATION NOTES': t.accommodation[0]?.notes || 'SHARED',
    'CHECK-IN': t.accommodation[0]?.checkIn || '8/9/2026',
    'CHECK-OUT': t.accommodation[0]?.checkOut || '',
    'SIGNATURE DATE': t.signatureDate || '06 AUGUST 2026',
    'SIGNATURE NAME': t.signatureName || 'Eric Matola'
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Travelers TAF Manifest');

  // Auto column widths
  const colWidths = Object.keys(rows[0] || {}).map(key => ({
    wch: Math.max(key.length + 3, 14)
  }));
  worksheet['!cols'] = colWidths;

  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  return new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
}
