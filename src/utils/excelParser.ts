import * as XLSX from 'xlsx';
import { TravelerRecord, FlightEntry, AccommodationEntry, PurposeOfTrip } from '../types';
import { validateTravelerDatesAndTimes } from './dateTimeValidation';

// Helper to normalize strings for comparison
function cleanStr(val: any): string {
  if (val === null || val === undefined) return '';
  return String(val).trim();
}

// Convert Excel dates (serial numbers or raw date strings) to human readable formats
export function formatExcelDate(raw: any, targetFormat: 'short' | 'dob' | 'full' = 'short'): string {
  if (!raw && raw !== 0) return '';
  const str = String(raw).trim();
  if (!str) return '';

  // If it's a number (Excel serial date)
  const num = Number(raw);
  if (!isNaN(num) && num > 1000 && num < 100000) {
    const jsDate = new Date(Math.round((num - 25569) * 86400 * 1000));
    if (!isNaN(jsDate.getTime())) {
      return formatDateObj(jsDate, targetFormat);
    }
  }

  // If it's already a recognized date string
  const parsed = Date.parse(str);
  if (!isNaN(parsed) && !/^\d{4,8}$/.test(str)) {
    const jsDate = new Date(parsed);
    return formatDateObj(jsDate, targetFormat);
  }

  return str;
}

function formatDateObj(d: Date, targetFormat: 'short' | 'dob' | 'full'): string {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const fullMonths = [
    'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
    'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'
  ];

  const day = d.getUTCDate();
  const monthIdx = d.getUTCMonth();
  const year = d.getUTCFullYear();
  const shortYear = String(year).slice(-2);

  if (targetFormat === 'dob') {
    // e.g. 12-Aug-90
    return `${day < 10 ? '0' + day : day}-${months[monthIdx]}-${shortYear}`;
  } else if (targetFormat === 'full') {
    // e.g. 06 AUGUST 2026
    return `${day < 10 ? '0' + day : day} ${fullMonths[monthIdx]} ${year}`;
  } else {
    // e.g. 8/9/2026 or M/D/YYYY
    return `${monthIdx + 1}/${day}/${year}`;
  }
}

// Find matching key in raw object case-insensitively with fuzzy fallback
export function findRowValue(row: Record<string, any>, candidates: string[]): string {
  const keys = Object.keys(row);
  for (const candidate of candidates) {
    const candNorm = candidate.toLowerCase().replace(/[^a-z0-9]/g, '');
    for (const key of keys) {
      const keyNorm = key.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (keyNorm === candNorm) {
        return cleanStr(row[key]);
      }
    }
  }
  // partial match
  for (const candidate of candidates) {
    const candNorm = candidate.toLowerCase().replace(/[^a-z0-9]/g, '');
    for (const key of keys) {
      const keyNorm = key.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (keyNorm.includes(candNorm) || candNorm.includes(keyNorm)) {
        if (row[key] !== undefined && row[key] !== null && String(row[key]).trim() !== '') {
          return cleanStr(row[key]);
        }
      }
    }
  }
  return '';
}

export function parseExcelFile(data: ArrayBuffer | Uint8Array): {
  travelers: TravelerRecord[];
  rawHeaders: string[];
  totalRows: number;
} {
  const workbook = XLSX.read(data, { type: 'array', cellDates: false });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) {
    throw new Error('The uploaded Excel file does not contain any sheets.');
  }

  const worksheet = workbook.Sheets[sheetName];
  const jsonRows = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, { defval: '' });

  if (jsonRows.length === 0) {
    throw new Error('The uploaded sheet is empty.');
  }

  const rawHeaders = Object.keys(jsonRows[0] || {});

  const travelers: TravelerRecord[] = jsonRows.map((row, index) => {
    // Extract surname
    let surname = findRowValue(row, ['SURNAME', 'Last Name', 'Family Name', 'Sobrenome', 'Apelido']);
    
    // Extract given name / gender
    let nameAndGender = findRowValue(row, ['NAME / GENDER', 'Name/Gender', 'Full Name', 'Given Name', 'First Name', 'Nome', 'NAME']);
    const gender = findRowValue(row, ['GENDER', 'Sex', 'Sexo']);

    if (gender && !nameAndGender.includes('/')) {
      nameAndGender = `${nameAndGender} / ${gender.toUpperCase()}`.trim();
    }

    // Destination & rotation
    const finalDestination = findRowValue(row, ['FINAL DESTINATION', 'Destination', 'To Destination', 'Local']) || 'Afungi';
    const rotationType = findRowValue(row, ['ROTATION TYPE', 'Rotation', 'Tipo de Rotacao']) || 'Mobilization';
    
    // Purpose of trip
    let purposeOfTrip = findRowValue(row, ['PURPOSE OF TRIP', 'Purpose', 'Trip Purpose', 'Motivo']) || 'Mobilization';
    const validPurposes: PurposeOfTrip[] = [
      'Business Trip',
      'Rotational Leave',
      'Mobilization',
      'Emergency Leave',
      'Visa Application',
      'Demobilization'
    ];
    // Normalize purpose
    const matchedPurpose = validPurposes.find(p => p.toLowerCase() === purposeOfTrip.toLowerCase()) || 'Mobilization';

    // Company & job info
    const companyId = findRowValue(row, ['COMPANY ID', 'CompanyID', 'Emp ID', 'Staff ID', 'ID', 'Badge ID', 'No', 'Matricula']);
    const company = findRowValue(row, ['COMPANY', 'Empresa', 'Employer', 'Contractor']) || 'DAEWOO';
    const projectPosition = findRowValue(row, ['PROJECT POSITION / JOB TITLE', 'PROJECT POSITION', 'JOB TITLE', 'Position', 'Cargo', 'Funcao']);
    const projectDepartment = findRowValue(row, ['PROJECT DEPARTMENT', 'DEPARTMENT', 'Dept', 'Departamento']);

    // Contact info
    const mobileNumber = findRowValue(row, ['MOBILE NUMBER', 'Mobile', 'Phone', 'Cell', 'Telefone', 'Telemovel']);
    const emailAddress = findRowValue(row, ['EMAIL ADDRESS', 'EMAIL', 'Email', 'Correio']);
    const substituteInAbsence = findRowValue(row, ['SUBSTITUTE IN MY ABSENCE', 'Substitute', 'Substituto']) || 'N/A';
    const frequentFlyerCard = findRowValue(row, ['FREQUENT FLYER CARD', 'Flyer Card', 'FFP']) || 'N/A';

    // Passport & Personal
    const passportOrIdNumber = findRowValue(row, ['PASSPORT/ NATIONAL ID NUMBER', 'PASSPORT', 'NATIONAL ID', 'ID NUMBER', 'Passaporte', 'BI']);
    const rawDob = findRowValue(row, ['DATE OF BIRTH', 'DOB', 'Birth Date', 'Data de Nascimento']);
    const dateOfBirth = formatExcelDate(rawDob, 'dob');
    const nationality = findRowValue(row, ['NATIONALITY', 'Nacionalidade', 'Country']) || 'MOZAMBICAN';
    const rawExp = findRowValue(row, ['PASSPORT EXPIRY DATE', 'EXPIRY DATE', 'Passport Expiry', 'Data de Validade']);
    const passportExpiryDate = formatExcelDate(rawExp, 'dob');

    // Flight details
    const rawFlightDate = findRowValue(row, ['FLIGHT DATE', 'DATE', 'Departure Date', 'Data do Voo']);
    const flightDate = formatExcelDate(rawFlightDate, 'short') || '8/9/2026';
    const flightFrom = findRowValue(row, ['FROM', 'Origin', 'De', 'Origem']) || 'PEMBA';
    const flightTo = findRowValue(row, ['TO', 'Flight To', 'Para', 'Destino']) || 'AFUNGI';
    const departureTime = findRowValue(row, ['DEPARTURE TIME', 'Dept Time', 'Hora de Partida']) || '06:45';
    const arrivalTime = findRowValue(row, ['ARRIVAL TIME', 'Arr Time', 'Hora de Chegada']) || '07:30';
    const airlineAndFlightNo = findRowValue(row, ['AIRLINE & FLIGHT NUMBER', 'AIRLINE', 'FLIGHT NUMBER', 'Voo', 'Companhia']) || 'SOLENTA';

    const flights: FlightEntry[] = [
      {
        date: flightDate,
        from: flightFrom,
        to: flightTo,
        departureTime: departureTime,
        arrivalTime: arrivalTime,
        airlineAndFlightNo: airlineAndFlightNo
      }
    ];

    // Accommodation details
    const rawCheckIn = findRowValue(row, ['CHECK-IN', 'Check In', 'CheckIn', 'Entrada']);
    const checkIn = formatExcelDate(rawCheckIn, 'short') || flightDate;
    const rawCheckOut = findRowValue(row, ['CHECK-OUT', 'Check Out', 'CheckOut', 'Saida']);
    const checkOut = formatExcelDate(rawCheckOut, 'short');
    const hotelOrCamp = findRowValue(row, ['HOTEL / CAMP', 'CAMP', 'HOTEL', 'Alojamento', 'Acampamento']) || '9500';
    const campLocation = findRowValue(row, ['CAMP LOCATION', 'LOCATION', 'Localizacao']) || 'AFUNGI';
    const notes = findRowValue(row, ['ACCOMMODATION NOTES', 'NOTES', 'Room Type', 'Notas']) || 'SHARED';

    const accommodation: AccommodationEntry[] = [
      {
        checkIn: checkIn,
        checkOut: checkOut,
        hotelOrCamp: hotelOrCamp,
        location: campLocation,
        notes: notes
      }
    ];

    // Signatures
    const rawSigDate = findRowValue(row, ['SIGNATURE DATE', 'Signature Date', 'Date Signed', 'Data da Assinatura']);
    const signatureDate = formatExcelDate(rawSigDate, 'full') || '06 AUGUST 2026';
    const signatureName = findRowValue(row, ['SIGNATURE NAME', 'Signed By', 'Signer']) || 'Eric Matola';

    // Fallback names if missing
    if (!surname && nameAndGender) {
      const parts = nameAndGender.split('/')[0].trim().split(' ');
      if (parts.length > 1) {
        surname = parts[parts.length - 1];
      } else {
        surname = parts[0];
      }
    }

    const validationErrors: string[] = [];
    if (!surname) validationErrors.push('Missing Surname');
    if (!passportOrIdNumber) validationErrors.push('Missing Passport / ID');
    if (!projectPosition) validationErrors.push('Missing Job Title');

    const tempRecord = {
      surname: surname.toUpperCase(),
      nameAndGender: nameAndGender.toUpperCase(),
      passportOrIdNumber,
      dateOfBirth,
      passportExpiryDate,
      flights,
      accommodation,
      signatureDate
    };

    const dtValidation = validateTravelerDatesAndTimes(tempRecord);
    if (!dtValidation.isValid || dtValidation.hasWarnings) {
      validationErrors.push(...dtValidation.allMessages);
    }

    return {
      id: `TRV-${String(index + 1).padStart(3, '0')}`,
      surname: surname.toUpperCase(),
      nameAndGender: nameAndGender.toUpperCase(),
      finalDestination,
      rotationType,
      purposeOfTrip: matchedPurpose,
      companyId: companyId || String(30000 + index + 1),
      company: company.toUpperCase(),
      projectPosition: projectPosition.toUpperCase(),
      projectDepartment: projectDepartment.toUpperCase(),
      mobileNumber,
      emailAddress: emailAddress || 'DEC.TravelMZ@daewooenc.com',
      substituteInAbsence,
      frequentFlyerCard,
      passportOrIdNumber,
      dateOfBirth,
      nationality: nationality.toUpperCase(),
      passportExpiryDate,
      flights,
      accommodation,
      signatureDate,
      signatureName,
      isValid: validationErrors.length === 0,
      validationErrors
    };
  });

  return {
    travelers,
    rawHeaders,
    totalRows: travelers.length
  };
}
