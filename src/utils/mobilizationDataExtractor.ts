import { TravelerRecord, MobilizationFormData, MobilizationRouteEntry } from '../types';
import { findProvinceForLocation } from './mozambiqueLocations';
import { DEFAULT_SIGNATURE_NAME, ERIC_MATOLA_SIGNATURE_BASE64 } from '../assets/signature';

/**
 * Automatically collects and extracts complete Mobilization Form data from any Traveler / TAF record.
 * Guarantees zero data loss, injects the same signatures and dates as TAF, and prepares the form to be printed separately.
 */
export function extractMobilizationDataFromTraveler(traveler: TravelerRecord): MobilizationFormData {
  const existing = traveler.mobilizationForm;

  // 1. Applicant Name: e.g. "VANIA GUAMBE"
  const rawGivenName = traveler.nameAndGender ? traveler.nameAndGender.split('/')[0].trim() : '';
  const surname = traveler.surname ? traveler.surname.trim() : '';
  const fullName = [surname, rawGivenName].filter(Boolean).join(' ').toUpperCase() || 'VANIA GUAMBE';

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
  const arrivalDate = existing?.arrivalDate || traveler.flights?.[0]?.date || signatureDate || '12-Mar-2026';
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
    applicantName: existing?.applicantName || fullName,
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
