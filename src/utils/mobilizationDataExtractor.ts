import { TravelerRecord, MobilizationFormData, MobilizationRouteEntry } from '../types';
import { findProvinceForLocation } from './mozambiqueLocations';
import { DEFAULT_SIGNATURE_NAME, ERIC_MATOLA_SIGNATURE_BASE64 } from '../assets/signature';

/**
 * Ensures any traveler name is formatted strictly as:
 * NAME FIRST (Given/First Names) and SURNAME LAST (Family Name/Apelido)
 *
 * Handles:
 * - Standard: nameAndGender="ABREU ANTONIO / MALE", surname="LUIS" -> "ABREU ANTONIO LUIS"
 * - Comma format: "LUIS, ABREU ANTONIO / MALE" -> "ABREU ANTONIO LUIS"
 * - Inverted order: "LUIS ABREU ANTONIO", surname="LUIS" -> "ABREU ANTONIO LUIS"
 * - Single name + surname: "ERIC", surname="MATOLA" -> "ERIC MATOLA"
 * - Already name first + surname last: "ERIC MATOLA", surname="MATOLA" -> "ERIC MATOLA" (no duplicate "MATOLA MATOLA")
 * - Semicolon/dash separated: "MATOLA; ERIC" -> "ERIC MATOLA"
 */
export function formatNameFirstSurnameLast(nameAndGender?: string, surname?: string): string {
  let rawName = nameAndGender ? nameAndGender.split('/')[0].trim() : '';
  const sur = surname ? surname.replace(/[,;]/g, '').trim().toUpperCase() : '';

  // 1. Handle comma format: "SURNAME, GIVEN NAMES" (common in HR manifests)
  if (rawName.includes(',')) {
    const commaParts = rawName.split(',').map(s => s.trim()).filter(Boolean);
    if (commaParts.length >= 2) {
      const part1 = commaParts[0].toUpperCase();
      const part2 = commaParts.slice(1).join(' ').toUpperCase();
      // If the part before comma is the surname or matches it, flip to Given Name + Surname
      if (!sur || part1 === sur || sur.includes(part1) || part1.includes(sur)) {
        return `${part2} ${sur || part1}`.replace(/\s+/g, ' ').trim();
      }
    }
  }

  // 2. Clean remaining punctuation and whitespace
  rawName = rawName.replace(/[,;]/g, ' ').replace(/\s+/g, ' ').trim().toUpperCase();

  // 3. Fallbacks when either part is missing
  if (!rawName && !sur) return 'VANIA GUAMBE';
  if (!sur) return rawName;
  if (!rawName) return sur;

  // 4. If rawName already equals surname
  if (rawName === sur) {
    return sur;
  }

  // 5. If rawName starts with the surname (e.g. "LUIS ABREU ANTONIO" with surname "LUIS", or "MATOLA ERIC" with surname "MATOLA")
  if (rawName.startsWith(`${sur} `)) {
    const givenPart = rawName.slice(sur.length).trim();
    return `${givenPart} ${sur}`.replace(/\s+/g, ' ').trim();
  }

  // 6. If rawName already ends with the surname (e.g. "ABREU ANTONIO LUIS" with surname "LUIS")
  if (rawName.endsWith(` ${sur}`)) {
    return rawName;
  }

  // 7. If rawName contains the surname inside it (e.g. "ANTONIO LUIS ABREU")
  const words = rawName.split(/\s+/);
  if (words.includes(sur)) {
    const withoutSur = words.filter(w => w !== sur).join(' ');
    return `${withoutSur} ${sur}`.replace(/\s+/g, ' ').trim();
  }

  // 8. Default: Name First, Surname Last
  return `${rawName} ${sur}`.replace(/\s+/g, ' ').trim();
}

/**
 * Backward compatibility alias for formatNameFirstSurnameLast.
 */
export const formatFirstAndSurname = formatNameFirstSurnameLast;

/**
 * Automatically collects and extracts complete Mobilization Form data from any Traveler / TAF record.
 * Guarantees zero data loss, injects the same signatures and dates as TAF, and prepares the form to be printed separately.
 */
export function extractMobilizationDataFromTraveler(traveler: TravelerRecord): MobilizationFormData {
  const existing = traveler.mobilizationForm;

  // 1. Applicant Name: Strictly Name First and Surname Last (e.g. "ABREU ANTONIO LUIS", "ERIC MATOLA", or "VANIA GUAMBE")
  const rawGivenName = traveler.nameAndGender ? traveler.nameAndGender.split('/')[0].replace(/,/g, '').trim() : '';
  const surname = traveler.surname ? traveler.surname.replace(/,/g, '').trim() : '';
  const fullName = formatNameFirstSurnameLast(traveler.nameAndGender, traveler.surname);

  // If existing applicantName exists, ensure it is also strictly formatted with Name First and Surname Last
  let applicantName = fullName;
  if (existing?.applicantName) {
    const existingClean = existing.applicantName.trim().toUpperCase();
    const oldSurnameFirst = [surname, rawGivenName].filter(Boolean).join(' ').trim().toUpperCase();

    if (
      existingClean === oldSurnameFirst ||
      (surname && (existingClean.startsWith(surname.toUpperCase() + ' ') || existingClean.startsWith(surname.toUpperCase() + ',')))
    ) {
      applicantName = fullName;
    } else {
      // Re-apply Name First, Surname Last guarantee even if user had typed or imported a surname-first string
      applicantName = formatNameFirstSurnameLast(existingClean, surname);
    }
  }

  // 2. Position & Department
  const position = (traveler.projectPosition || 'ADMIN. SECRETARY').toUpperCase();
  const department = (traveler.projectDepartment || 'ADMIN.').toUpperCase();

  // 3. Site: Prioritize specific camp/base like OPBL1, Afungi, Palma, Pemba
  let site = existing?.site || 'OPBL1';
  if (!existing?.site) {
    if (traveler.finalDestination) {
      const dest = traveler.finalDestination.toUpperCase();
      if (dest.includes('OPBL') || dest.includes('PLANT')) {
        site = 'OPBL1';
      } else if (dest.includes('AFUNGI')) {
        site = 'AFUNGI (OPBL1)';
      } else if (dest.includes('PEMBA')) {
        site = 'PEMBA BASE';
      } else if (dest.includes('PALMA')) {
        site = 'PALMA';
      } else {
        site = traveler.finalDestination.toUpperCase();
      }
    } else if (traveler.accommodation?.[0]?.hotelOrCamp) {
      site = traveler.accommodation[0].hotelOrCamp.toUpperCase();
    }
  }

  // 4. Nationality & ID Number
  const nationality = (traveler.nationality || 'MOZAMBIQUE').toUpperCase();
  const idNumber = (traveler.passportOrIdNumber || '').toUpperCase();

  // 5. Same Signatures & Dates as TAF
  const signatureName = traveler.signatureName || existing?.signatureName || DEFAULT_SIGNATURE_NAME;
  const signatureImage = traveler.signatureImage || existing?.signatureImage || ERIC_MATOLA_SIGNATURE_BASE64;
  const signatureDate = traveler.signatureDate || existing?.signatureDate || traveler.flights?.[0]?.date || '06 AUGUST 2026';
  const arrivalDate = existing?.arrivalDate || traveler.accommodation?.[0]?.checkIn || traveler.flights?.[0]?.date || signatureDate || '12-Mar-2026';
  const formDate = existing?.formDate || traveler.signatureDate || signatureDate;

  // 6. Routes: If existing has custom route, preserve existing.routes!
  let routes: MobilizationRouteEntry[] = [];
  if (existing && existing.isCustomRoute && existing.routes && existing.routes.length > 0) {
    routes = existing.routes.map(r => ({ ...r }));
  } else if (existing?.routes && existing.routes.length > 0) {
    routes = existing.routes.map(r => ({ ...r }));
  } else if (traveler.flights && traveler.flights.length > 0) {
    traveler.flights.forEach(f => {
      routes.push({
        date: f.date || arrivalDate || signatureDate,
        origin: (f.from || 'MAPUTO').toUpperCase(),
        etd: f.departureTime || '',
        destination: (f.to || 'PEMBA').toUpperCase(),
        eta: f.arrivalTime || ''
      });
    });
  } else {
    routes.push({
      date: arrivalDate || signatureDate,
      origin: 'MAPUTO',
      etd: '',
      destination: 'PEMBA',
      eta: ''
    });
  }

  // Ensure first route always has a valid date populated
  if (routes[0] && !routes[0].date) {
    routes[0].date = arrivalDate || signatureDate;
  }

  // Pad up to 5 rows matching the 5-row table in Mobilization_Form_2c6f7c7a.pdf
  while (routes.length < 5) {
    routes.push({
      date: '',
      origin: '',
      etd: '',
      destination: '',
      eta: ''
    });
  }

  // Provinces
  const firstRoute = routes[0] || { origin: 'MAPUTO', destination: 'PEMBA' };
  const originProvince = existing?.originProvince || findProvinceForLocation(firstRoute.origin)?.name || 'Maputo Cidade';
  const destinationProvince = existing?.destinationProvince || findProvinceForLocation(firstRoute.destination)?.name || 'Cabo Delgado';

  return {
    formDate,
    applicantName,
    position: existing?.position || position,
    department: existing?.department || department,
    site,
    nationality: existing?.nationality || nationality,
    idNumber: existing?.idNumber || idNumber,
    arrivalDate,
    pmApproval: existing?.pmApproval || 'N/A',
    signatureName,
    signatureImage,
    signatureDate,
    isCustomRoute: existing?.isCustomRoute || false,
    routes,
    originProvince,
    destinationProvince,
    check1: {
      mark: existing?.check1?.mark || 'X',
      name: existing?.check1?.name || signatureName,
      signature: existing?.check1?.signature || signatureName,
      signatureDate: existing?.check1?.signatureDate || signatureDate
    },
    check2: {
      mark: existing?.check2?.mark || 'X',
      name: existing?.check2?.name || signatureName,
      signature: existing?.check2?.signature || signatureName,
      signatureDate: existing?.check2?.signatureDate || signatureDate
    },
    check3: {
      mark: existing?.check3?.mark || 'X',
      name: existing?.check3?.name || signatureName,
      signature: existing?.check3?.signature || signatureName,
      signatureDate: existing?.check3?.signatureDate || signatureDate
    }
  };
}
