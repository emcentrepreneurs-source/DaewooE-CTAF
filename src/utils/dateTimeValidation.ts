// Comprehensive Date and Time Validation & Normalization Utility

export interface ValidationResult {
  isValid: boolean;
  isWarning?: boolean;
  formattedValue?: string;
  error?: string;
  warning?: string;
  parsedDate?: Date;
}

export interface TravelerDateTimeValidation {
  isValid: boolean;
  hasWarnings: boolean;
  errors: Record<string, string>;
  warnings: Record<string, string>;
  allMessages: string[];
}

const MONTH_MAP: Record<string, number> = {
  // English
  jan: 0, january: 0,
  feb: 1, february: 1,
  mar: 2, march: 2,
  apr: 3, april: 3,
  may: 4,
  jun: 5, june: 5,
  jul: 6, july: 6,
  aug: 7, august: 7,
  sep: 8, sept: 8, september: 8,
  oct: 9, october: 9,
  nov: 10, november: 10,
  dec: 11, december: 11,
  // Portuguese
  fev: 1, fevereiro: 1,
  abr: 3, abril: 3,
  maio: 4,
  junho: 5,
  julho: 6,
  ago: 7, agosto: 7,
  set: 8, setembro: 8,
  out: 9, outubro: 9,
  dez: 11, dezembro: 11
};

const MONTH_NAMES_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTH_NAMES_FULL = [
  'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
  'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'
];

/**
 * Checks if a year, month (0-indexed), and day form a valid calendar date
 */
export function isValidCalendarDate(year: number, month: number, day: number): boolean {
  if (year < 1900 || year > 2100) return false;
  if (month < 0 || month > 11) return false;
  if (day < 1) return false;

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  return day <= daysInMonth;
}

/**
 * Parses flexible date strings into a Javascript Date object.
 * Supported formats:
 * - DD-MMM-YY / DD-MMM-YYYY (e.g. 12-Aug-90, 16-Jan-2033)
 * - DD/MM/YYYY or MM/DD/YYYY or YYYY-MM-DD
 * - DD Month YYYY (e.g. 06 AUGUST 2026)
 * - M/D/YY or M/D/YYYY
 */
export function parseFlexibleDate(dateStr: string): Date | null {
  if (!dateStr || typeof dateStr !== 'string') return null;
  const str = dateStr.trim();
  if (!str) return null;

  // 1. ISO format: YYYY-MM-DD
  const isoMatch = str.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/);
  if (isoMatch) {
    const year = parseInt(isoMatch[1], 10);
    const month = parseInt(isoMatch[2], 10) - 1;
    const day = parseInt(isoMatch[3], 10);
    if (isValidCalendarDate(year, month, day)) {
      return new Date(year, month, day);
    }
    return null;
  }

  // 2. DD-MMM-YY or DD-MMM-YYYY or DD MMM YYYY (e.g. 12-Aug-90, 16-Jan-33, 06 AUGUST 2026)
  const dmmmyMatch = str.match(/^(\d{1,2})[-/\s]([A-Za-z]{3,12})[-/\s](\d{2,4})$/);
  if (dmmmyMatch) {
    const day = parseInt(dmmmyMatch[1], 10);
    const monthStr = dmmmyMatch[2].toLowerCase();
    let year = parseInt(dmmmyMatch[3], 10);

    // Handle 2-digit years (e.g. 90 -> 1990, 33 -> 2033, 26 -> 2026)
    if (year < 100) {
      year = year >= 50 ? 1900 + year : 2000 + year;
    }

    const month = MONTH_MAP[monthStr];
    if (month !== undefined && isValidCalendarDate(year, month, day)) {
      return new Date(year, month, day);
    }
  }

  // 3. Month DD, YYYY (e.g. August 9, 2026 or Aug 09 2026)
  const mmmdyMatch = str.match(/^([A-Za-z]{3,12})[-/\s](\d{1,2}),?[-/\s](\d{2,4})$/);
  if (mmmdyMatch) {
    const monthStr = mmmdyMatch[1].toLowerCase();
    const day = parseInt(mmmdyMatch[2], 10);
    let year = parseInt(mmmdyMatch[3], 10);
    if (year < 100) {
      year = year >= 50 ? 1900 + year : 2000 + year;
    }
    const month = MONTH_MAP[monthStr];
    if (month !== undefined && isValidCalendarDate(year, month, day)) {
      return new Date(year, month, day);
    }
  }

  // 4. Numeric: D/M/YYYY, DD/MM/YYYY or M/D/YYYY
  const numMatch = str.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{2,4})$/);
  if (numMatch) {
    const n1 = parseInt(numMatch[1], 10);
    const n2 = parseInt(numMatch[2], 10);
    let year = parseInt(numMatch[3], 10);
    if (year < 100) {
      year = year >= 50 ? 1900 + year : 2000 + year;
    }

    // Try both M/D/YYYY and D/M/YYYY
    // If n1 > 12, then n1 must be day, n2 is month
    if (n1 > 12 && n2 <= 12) {
      if (isValidCalendarDate(year, n2 - 1, n1)) {
        return new Date(year, n2 - 1, n1);
      }
    } else if (n2 > 12 && n1 <= 12) {
      // n1 is month, n2 is day
      if (isValidCalendarDate(year, n1 - 1, n2)) {
        return new Date(year, n1 - 1, n2);
      }
    } else if (n1 <= 12 && n2 <= 12) {
      // Default to M/D/YYYY or D/M/YYYY
      if (isValidCalendarDate(year, n1 - 1, n2)) {
        return new Date(year, n1 - 1, n2);
      }
    }
  }

  // 5. Native Date fallback
  const timestamp = Date.parse(str);
  if (!isNaN(timestamp)) {
    const d = new Date(timestamp);
    if (!isNaN(d.getTime())) return d;
  }

  return null;
}

/**
 * Format date to specific standards
 */
export function formatToStandardDate(d: Date, format: 'dob' | 'short' | 'full' | 'iso' = 'short'): string {
  const day = d.getDate();
  const monthIdx = d.getMonth();
  const year = d.getFullYear();
  const shortYear = String(year).slice(-2);
  const padDay = day < 10 ? `0${day}` : `${day}`;
  const padMonth = monthIdx + 1 < 10 ? `0${monthIdx + 1}` : `${monthIdx + 1}`;

  if (format === 'dob') {
    // 12-Aug-90
    return `${padDay}-${MONTH_NAMES_SHORT[monthIdx]}-${shortYear}`;
  } else if (format === 'full') {
    // 06 AUGUST 2026
    return `${padDay} ${MONTH_NAMES_FULL[monthIdx]} ${year}`;
  } else if (format === 'iso') {
    // 2026-08-09
    return `${year}-${padMonth}-${padDay}`;
  } else {
    // 8/9/2026
    return `${monthIdx + 1}/${day}/${year}`;
  }
}

/**
 * Validates a Date String with comprehensive checks
 */
export function validateDate(
  dateStr: string,
  fieldName: string = 'Date',
  options?: {
    allowEmpty?: boolean;
    mustBePast?: boolean;
    mustBeFuture?: boolean;
    minYear?: number;
    maxYear?: number;
    targetFormat?: 'dob' | 'short' | 'full' | 'iso';
  }
): ValidationResult {
  if (!dateStr || dateStr.trim() === '') {
    if (options?.allowEmpty) {
      return { isValid: true };
    }
    return { isValid: false, error: `${fieldName} is required.` };
  }

  const parsed = parseFlexibleDate(dateStr);
  if (!parsed) {
    return {
      isValid: false,
      error: `Invalid ${fieldName} format. Please use valid date (e.g. 12-Aug-1990 or 08/09/2026).`
    };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const parsedZero = new Date(parsed);
  parsedZero.setHours(0, 0, 0, 0);

  // Must be in the past (e.g. Date of Birth)
  if (options?.mustBePast && parsedZero >= today) {
    return {
      isValid: false,
      error: `${fieldName} must be in the past.`,
      parsedDate: parsed
    };
  }

  // Must be in the future
  if (options?.mustBeFuture && parsedZero < today) {
    return {
      isValid: false,
      isWarning: true,
      warning: `${fieldName} is in the past (expired).`,
      error: `${fieldName} is expired.`,
      parsedDate: parsed
    };
  }

  const year = parsed.getFullYear();
  if (options?.minYear && year < options.minYear) {
    return {
      isValid: false,
      error: `${fieldName} year (${year}) is earlier than minimum allowed (${options.minYear}).`,
      parsedDate: parsed
    };
  }

  if (options?.maxYear && year > options.maxYear) {
    return {
      isValid: false,
      error: `${fieldName} year (${year}) exceeds maximum allowed (${options.maxYear}).`,
      parsedDate: parsed
    };
  }

  return {
    isValid: true,
    parsedDate: parsed,
    formattedValue: options?.targetFormat ? formatToStandardDate(parsed, options.targetFormat) : undefined
  };
}

/**
 * Parses flexible time string to hour and minute numbers
 */
export function parseFlexibleTime(timeStr: string): { hour: number; minute: number } | null {
  if (!timeStr || typeof timeStr !== 'string') return null;
  const str = timeStr.trim();
  if (!str) return null;

  // 24-hour format: HH:MM or H:MM (e.g. 06:45, 6:45, 18:30)
  const match24 = str.match(/^([0-1]?[0-9]|2[0-3]):([0-5][0-9])(:[0-5][0-9])?$/);
  if (match24) {
    const hour = parseInt(match24[1], 10);
    const minute = parseInt(match24[2], 10);
    return { hour, minute };
  }

  // 12-hour format with AM/PM (e.g. 6:45 AM, 06:45 PM)
  const match12 = str.match(/^(0?[1-9]|1[0-2]):([0-5][0-9])\s*(am|pm|AM|PM)$/i);
  if (match12) {
    let hour = parseInt(match12[1], 10);
    const minute = parseInt(match12[2], 10);
    const meridian = match12[3].toUpperCase();

    if (meridian === 'PM' && hour < 12) hour += 12;
    if (meridian === 'AM' && hour === 12) hour = 0;

    return { hour, minute };
  }

  return null;
}

/**
 * Formats hour and minute to standard HH:MM (24-hour) string
 */
export function formatTo24HourTime(hour: number, minute: number): string {
  const padHour = hour < 10 ? `0${hour}` : `${hour}`;
  const padMinute = minute < 10 ? `0${minute}` : `${minute}`;
  return `${padHour}:${padMinute}`;
}

/**
 * Validates Time String (HH:MM or HH:MM AM/PM)
 */
export function validateTime(
  timeStr: string,
  fieldName: string = 'Time',
  options?: { allowEmpty?: boolean }
): ValidationResult {
  if (!timeStr || timeStr.trim() === '') {
    if (options?.allowEmpty) {
      return { isValid: true };
    }
    return { isValid: false, error: `${fieldName} is required.` };
  }

  const str = timeStr.trim();

  // 24-hour format: HH:MM or H:MM (e.g. 06:45, 6:45, 18:30)
  const match24 = str.match(/^([0-1]?[0-9]|2[0-3]):([0-5][0-9])(:[0-5][0-9])?$/);
  if (match24) {
    const hours = parseInt(match24[1], 10);
    const minutes = parseInt(match24[2], 10);
    const padHours = hours < 10 ? `0${hours}` : `${hours}`;
    const padMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`;
    return {
      isValid: true,
      formattedValue: `${padHours}:${padMinutes}`
    };
  }

  // 12-hour format with AM/PM (e.g. 6:45 AM, 06:45 PM)
  const match12 = str.match(/^(0?[1-9]|1[0-2]):([0-5][0-9])\s*(am|pm|AM|PM)$/i);
  if (match12) {
    let hours = parseInt(match12[1], 10);
    const minutes = parseInt(match12[2], 10);
    const meridian = match12[3].toUpperCase();

    if (meridian === 'PM' && hours < 12) hours += 12;
    if (meridian === 'AM' && hours === 12) hours = 0;

    const padHours = hours < 10 ? `0${hours}` : `${hours}`;
    const padMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`;
    return {
      isValid: true,
      formattedValue: `${padHours}:${padMinutes}`
    };
  }

  // Invalid time pattern (e.g. 25:00, 12:75, abc)
  return {
    isValid: false,
    error: `Invalid ${fieldName} "${timeStr}". Must be valid 24-hour time in HH:MM format (00:00 to 23:59).`
  };
}

/**
 * Validates Flight Departure & Arrival times together
 */
export function validateFlightTimes(depTimeStr: string, arrTimeStr: string): {
  depValidation: ValidationResult;
  arrValidation: ValidationResult;
  isValid: boolean;
  warning?: string;
} {
  const depVal = validateTime(depTimeStr, 'Departure Time');
  const arrVal = validateTime(arrTimeStr, 'Arrival Time');

  let warning: string | undefined = undefined;

  if (depVal.isValid && arrVal.isValid && depVal.formattedValue && arrVal.formattedValue) {
    const [depH, depM] = depVal.formattedValue.split(':').map(Number);
    const [arrH, arrM] = arrVal.formattedValue.split(':').map(Number);
    const depTotal = depH * 60 + depM;
    const arrTotal = arrH * 60 + arrM;

    if (arrTotal <= depTotal) {
      warning = 'Arrival time is equal to or earlier than departure time (possible overnight or timezone flight).';
    }
  }

  return {
    depValidation: depVal,
    arrValidation: arrVal,
    isValid: depVal.isValid && arrVal.isValid,
    warning
  };
}

/**
 * Validates Date of Birth specifically
 */
export function validateDateOfBirth(dobStr: string): ValidationResult {
  const res = validateDate(dobStr, 'Date of Birth', {
    mustBePast: true,
    minYear: 1920,
    maxYear: new Date().getFullYear(),
    targetFormat: 'dob'
  });

  if (!res.isValid) return res;

  if (res.parsedDate) {
    const age = calculateAge(res.parsedDate);
    if (age < 16) {
      return {
        isValid: false,
        error: `Traveler age (${age} yrs) is under the 16-year project work minimum.`,
        parsedDate: res.parsedDate
      };
    }
    if (age > 90) {
      return {
        isValid: true,
        isWarning: true,
        warning: `Traveler age (${age} yrs) is unusually high. Please double-check DOB.`,
        parsedDate: res.parsedDate,
        formattedValue: res.formattedValue
      };
    }
  }

  return res;
}

/**
 * Validates Passport / National ID Expiry
 */
export function validatePassportExpiry(expiryStr: string, flightDateStr?: string): ValidationResult {
  if (!expiryStr || expiryStr.trim() === '') {
    return { isValid: false, error: 'Passport / ID Expiry Date is required.' };
  }

  const res = validateDate(expiryStr, 'Passport Expiry Date', {
    minYear: 2000,
    maxYear: 2060,
    targetFormat: 'dob'
  });

  if (!res.isValid) return res;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const expDate = res.parsedDate!;
  expDate.setHours(0, 0, 0, 0);

  if (expDate < today) {
    return {
      isValid: false,
      error: `Passport/ID expired on ${formatToStandardDate(expDate, 'dob')}. Document is not valid for travel.`,
      parsedDate: expDate
    };
  }

  // Check 6 months validity rule from flight date or today
  const refDate = flightDateStr ? parseFlexibleDate(flightDateStr) || today : today;
  const sixMonthsAhead = new Date(refDate);
  sixMonthsAhead.setMonth(sixMonthsAhead.getMonth() + 6);

  if (expDate < sixMonthsAhead) {
    return {
      isValid: true,
      isWarning: true,
      warning: `Passport/ID expires soon (${formatToStandardDate(expDate, 'dob')}). Less than 6 months validity remaining.`,
      parsedDate: expDate,
      formattedValue: res.formattedValue
    };
  }

  return res;
}

/**
 * Validates Accommodation Check-in and Check-out
 */
export function validateAccommodationDates(checkInStr: string, checkOutStr?: string): {
  checkInValidation: ValidationResult;
  checkOutValidation: ValidationResult;
  isValid: boolean;
  error?: string;
  warning?: string;
} {
  const checkInVal = validateDate(checkInStr, 'Check-In Date', { allowEmpty: false });
  const checkOutVal = validateDate(checkOutStr || '', 'Check-Out Date', { allowEmpty: true });

  let error: string | undefined = undefined;
  let warning: string | undefined = undefined;

  if (checkInVal.isValid && checkOutVal.isValid && checkOutVal.parsedDate && checkInVal.parsedDate) {
    if (checkOutVal.parsedDate < checkInVal.parsedDate) {
      error = 'Check-Out date cannot be earlier than Check-In date.';
    }
  }

  return {
    checkInValidation: checkInVal,
    checkOutValidation: checkOutVal,
    isValid: checkInVal.isValid && checkOutVal.isValid && !error,
    error,
    warning
  };
}

/**
 * Complete Date & Time validation for an entire traveler record
 */
export function validateTravelerDatesAndTimes(traveler: any): TravelerDateTimeValidation {
  const errors: Record<string, string> = {};
  const warnings: Record<string, string> = {};
  const allMessages: string[] = [];

  // 1. Date of Birth
  if (traveler.dateOfBirth) {
    const dobVal = validateDateOfBirth(traveler.dateOfBirth);
    if (!dobVal.isValid && dobVal.error) {
      errors.dateOfBirth = dobVal.error;
      allMessages.push(`DOB: ${dobVal.error}`);
    } else if (dobVal.warning) {
      warnings.dateOfBirth = dobVal.warning;
      allMessages.push(`DOB: ${dobVal.warning}`);
    }
  } else {
    errors.dateOfBirth = 'Date of Birth is missing.';
    allMessages.push('Missing Date of Birth');
  }

  // 2. Passport / ID Expiry
  if (traveler.passportExpiryDate) {
    const expVal = validatePassportExpiry(traveler.passportExpiryDate, traveler.flights?.[0]?.date);
    if (!expVal.isValid && expVal.error) {
      errors.passportExpiryDate = expVal.error;
      allMessages.push(`Passport Expiry: ${expVal.error}`);
    } else if (expVal.warning) {
      warnings.passportExpiryDate = expVal.warning;
      allMessages.push(`Passport Expiry: ${expVal.warning}`);
    }
  }

  // 3. Flight Date & Times
  const flight = traveler.flights?.[0];
  if (flight) {
    if (flight.date) {
      const fDateVal = validateDate(flight.date, 'Flight Date');
      if (!fDateVal.isValid && fDateVal.error) {
        errors.flightDate = fDateVal.error;
        allMessages.push(`Flight Date: ${fDateVal.error}`);
      }
    }

    if (flight.departureTime) {
      const depVal = validateTime(flight.departureTime, 'Departure Time');
      if (!depVal.isValid && depVal.error) {
        errors.departureTime = depVal.error;
        allMessages.push(`Dep Time: ${depVal.error}`);
      }
    }

    if (flight.arrivalTime) {
      const arrVal = validateTime(flight.arrivalTime, 'Arrival Time');
      if (!arrVal.isValid && arrVal.error) {
        errors.arrivalTime = arrVal.error;
        allMessages.push(`Arr Time: ${arrVal.error}`);
      }
    }

    if (flight.departureTime && flight.arrivalTime) {
      const timesVal = validateFlightTimes(flight.departureTime, flight.arrivalTime);
      if (timesVal.warning) {
        warnings.flightTimes = timesVal.warning;
        allMessages.push(`Flight Time: ${timesVal.warning}`);
      }
    }
  }

  // 4. Accommodation
  const acc = traveler.accommodation?.[0];
  if (acc) {
    if (acc.checkIn) {
      const inVal = validateDate(acc.checkIn, 'Check-In Date');
      if (!inVal.isValid && inVal.error) {
        errors.checkIn = inVal.error;
        allMessages.push(`Check-In: ${inVal.error}`);
      }
    }

    if (acc.checkOut) {
      const outVal = validateDate(acc.checkOut, 'Check-Out Date', { allowEmpty: true });
      if (!outVal.isValid && outVal.error) {
        errors.checkOut = outVal.error;
        allMessages.push(`Check-Out: ${outVal.error}`);
      }

      if (acc.checkIn && outVal.isValid) {
        const accVal = validateAccommodationDates(acc.checkIn, acc.checkOut);
        if (accVal.error) {
          errors.accDates = accVal.error;
          allMessages.push(`Accommodation: ${accVal.error}`);
        }
      }
    }
  }

  // 5. Signature Date
  if (traveler.signatureDate) {
    const sigVal = validateDate(traveler.signatureDate, 'Signature Date');
    if (!sigVal.isValid && sigVal.error) {
      errors.signatureDate = sigVal.error;
      allMessages.push(`Signature Date: ${sigVal.error}`);
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    hasWarnings: Object.keys(warnings).length > 0,
    errors,
    warnings,
    allMessages
  };
}

/**
 * Calculates age given a Date object
 */
export function calculateAge(dob: Date): number {
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age;
}
