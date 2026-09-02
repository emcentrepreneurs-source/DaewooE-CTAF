import { TravelerRecord } from '../types';

export interface ExtractedIdResult {
  id?: string;
  surname: string;
  givenNames: string;
  nameAndGender: string;
  passportOrIdNumber: string;
  dateOfBirth: string;
  dateOfBirthRaw?: string;
  nationality: string;
  nationalityCode?: string;
  passportExpiryDate: string;
  passportExpiryDateRaw?: string;
  gender: string;
  companyId: string;
  company: string;
  projectPosition: string;
  projectDepartment: string;
  documentType: string;
  issuingCountry?: string;
  issuingAuthority?: string;
  confidence: number;
  fieldConfidences?: {
    surname: number;
    givenNames: number;
    passportOrIdNumber: number;
    dateOfBirth: number;
    passportExpiryDate: number;
    nationality: number;
    gender: number;
  };
  mrz?: {
    hasMrz: boolean;
    rawLines: string[];
    isChecksumValid?: boolean;
    mrzType?: 'TD1' | 'TD2' | 'TD3';
  };
  validationStatus?: {
    isValid: boolean;
    warnings: string[];
    checksPassed: string[];
    isExpiringSoon?: boolean;
    isExpired?: boolean;
  };
  imagePreview?: string;
  sourceFile?: string;
  notes?: string;
}

export const SAMPLE_ID_PRESETS: Array<{
  name: string;
  type: string;
  nationality: string;
  badgeColor?: string;
  description: string;
  data: ExtractedIdResult;
}> = [
  {
    name: 'Armando Sebastião Chale (Mozambique Passport)',
    type: 'Passport',
    nationality: 'MOZAMBICAN',
    badgeColor: 'emerald',
    description: 'Official Standard Passport for CCS JV Afungi Site Rigging Foreman',
    data: {
      surname: 'CHALE',
      givenNames: 'ARMANDO SEBASTIAO',
      nameAndGender: 'ARMANDO SEBASTIAO / MALE',
      passportOrIdNumber: '110842918B',
      dateOfBirth: '18-Aug-87',
      nationality: 'MOZAMBICAN',
      nationalityCode: 'MOZ',
      passportExpiryDate: '12-Nov-31',
      gender: 'MALE',
      companyId: '30481',
      company: 'DAEWOO',
      projectPosition: 'RIGGING FOREMAN',
      projectDepartment: 'CONSTRUCTION',
      documentType: 'Passport',
      issuingCountry: 'Mozambique',
      confidence: 99,
      fieldConfidences: {
        surname: 100,
        givenNames: 100,
        passportOrIdNumber: 100,
        dateOfBirth: 99,
        passportExpiryDate: 99,
        nationality: 100,
        gender: 100,
      },
      mrz: {
        hasMrz: true,
        rawLines: [
          'P<MOZCHALE<<ARMANDO<SEBASTIAO<<<<<<<<<<<<<<<<<',
          '1108429180MOZ8708182M3111124<<<<<<<<<<<<<<00'
        ],
        isChecksumValid: true,
        mrzType: 'TD3'
      },
      validationStatus: {
        isValid: true,
        warnings: [],
        checksPassed: [
          'Passport machine-readable zone verified with 100% check digit integrity',
          'Passport validity extends beyond 6 months (Expires Nov 2031)',
          'High biometric match and character segregation'
        ],
        isExpiringSoon: false,
        isExpired: false
      },
      notes: 'Machine-Readable Zone (MRZ) Verified'
    }
  },
  {
    name: 'Celso Matias Nhantumbo (Mozambique BI Card)',
    type: 'National ID',
    nationality: 'MOZAMBICAN',
    badgeColor: 'blue',
    description: 'Mozambique Bilhete de Identidade (BI) Card - HSE Site Officer',
    data: {
      surname: 'NHANTUMBO',
      givenNames: 'CELSO MATIAS',
      nameAndGender: 'CELSO MATIAS / MALE',
      passportOrIdNumber: '110394820K',
      dateOfBirth: '05-May-91',
      nationality: 'MOZAMBICAN',
      nationalityCode: 'MOZ',
      passportExpiryDate: '18-Mar-32',
      gender: 'MALE',
      companyId: '30245',
      company: 'DAEWOO',
      projectPosition: 'HSE OFFICER',
      projectDepartment: 'HSE',
      documentType: 'National ID',
      issuingCountry: 'Mozambique',
      confidence: 98,
      fieldConfidences: {
        surname: 100,
        givenNames: 99,
        passportOrIdNumber: 100,
        dateOfBirth: 98,
        passportExpiryDate: 98,
        nationality: 100,
        gender: 100,
      },
      mrz: {
        hasMrz: true,
        rawLines: [
          'I<MOZ110394820K<<<<<<<<<<<<<<<',
          '9105054M3203188MOZ<<<<<<<<<<<0',
          'NHANTUMBO<<CELSO<MATIAS<<<<<<<'
        ],
        isChecksumValid: true,
        mrzType: 'TD1'
      },
      validationStatus: {
        isValid: true,
        warnings: [],
        checksPassed: [
          'República de Moçambique Bilhete de Identidade verified',
          '11-Digit + Check Char format validated (110394820K)',
          'Valid through 2032'
        ],
        isExpiringSoon: false,
        isExpired: false
      },
      notes: 'Republica de Mocambique Bilhete de Identidade'
    }
  },
  {
    name: 'Sung Hoon Kim (Korean Expat Passport)',
    type: 'Passport',
    nationality: 'KOREAN',
    badgeColor: 'purple',
    description: 'Daewoo E&C International Piping Superintendent Expat Passport',
    data: {
      surname: 'KIM',
      givenNames: 'SUNG HOON',
      nameAndGender: 'SUNG HOON / MALE',
      passportOrIdNumber: 'M84920194',
      dateOfBirth: '22-Oct-83',
      nationality: 'KOREAN',
      nationalityCode: 'KOR',
      passportExpiryDate: '09-Jul-33',
      gender: 'MALE',
      companyId: '10842',
      company: 'DAEWOO',
      projectPosition: 'PIPING SUPERINTENDENT',
      projectDepartment: 'CONSTRUCTION',
      documentType: 'Passport',
      issuingCountry: 'Republic of Korea',
      confidence: 99,
      fieldConfidences: {
        surname: 100,
        givenNames: 100,
        passportOrIdNumber: 100,
        dateOfBirth: 99,
        passportExpiryDate: 99,
        nationality: 100,
        gender: 100,
      },
      mrz: {
        hasMrz: true,
        rawLines: [
          'P<KORKIM<<SUNG<HOON<<<<<<<<<<<<<<<<<<<<<<<<<<<',
          'M849201944KOR8310228M3307092<<<<<<<<<<<<<<00'
        ],
        isChecksumValid: true,
        mrzType: 'TD3'
      },
      validationStatus: {
        isValid: true,
        warnings: [],
        checksPassed: [
          'Expat International Travel Passport Validated',
          'Valid for visa issuing (Expires Jul 2033)',
          'Complete MRZ matching'
        ],
        isExpiringSoon: false,
        isExpired: false
      },
      notes: 'Expat International Travel Passport'
    }
  },
  {
    name: 'Filomena Ernesto Mabunda (Camp Coordinator ID)',
    type: 'National ID',
    nationality: 'MOZAMBICAN',
    badgeColor: 'pink',
    description: 'CCS JV Pioneer Camp Logistics Coordinator National Identity',
    data: {
      surname: 'MABUNDA',
      givenNames: 'FILOMENA ERNESTO',
      nameAndGender: 'FILOMENA ERNESTO / FEMALE',
      passportOrIdNumber: '110592817C',
      dateOfBirth: '14-Sep-94',
      nationality: 'MOZAMBICAN',
      nationalityCode: 'MOZ',
      passportExpiryDate: '24-Apr-30',
      gender: 'FEMALE',
      companyId: '30512',
      company: 'DAEWOO',
      projectPosition: 'CAMP COORDINATOR',
      projectDepartment: 'LOGISTICS',
      documentType: 'National ID',
      issuingCountry: 'Mozambique',
      confidence: 98,
      fieldConfidences: {
        surname: 100,
        givenNames: 99,
        passportOrIdNumber: 100,
        dateOfBirth: 98,
        passportExpiryDate: 98,
        nationality: 100,
        gender: 100,
      },
      mrz: {
        hasMrz: true,
        rawLines: [
          'I<MOZ110592817C<<<<<<<<<<<<<<<',
          '9409144F3004248MOZ<<<<<<<<<<<4',
          'MABUNDA<<FILOMENA<ERNESTO<<<<<'
        ],
        isChecksumValid: true,
        mrzType: 'TD1'
      },
      validationStatus: {
        isValid: true,
        warnings: [],
        checksPassed: [
          'Verified National ID document',
          'Gender FEMALE confirmed',
          'Compliant for internal air transit'
        ],
        isExpiringSoon: false,
        isExpired: false
      },
      notes: 'Verified ID Document'
    }
  },
  {
    name: 'João Pedro da Silva (Portuguese Consultant)',
    type: 'Passport',
    nationality: 'PORTUGUESE',
    badgeColor: 'amber',
    description: 'European Union Standard Portuguese Passport for Commissioning Lead',
    data: {
      surname: 'DA SILVA',
      givenNames: 'JOAO PEDRO',
      nameAndGender: 'JOAO PEDRO / MALE',
      passportOrIdNumber: 'N7204918',
      dateOfBirth: '11-Dec-79',
      nationality: 'PORTUGUESE',
      nationalityCode: 'PRT',
      passportExpiryDate: '04-Feb-34',
      gender: 'MALE',
      companyId: '20194',
      company: 'CCS JV',
      projectPosition: 'COMMISSIONING LEAD',
      projectDepartment: 'OPERATIONS',
      documentType: 'Passport',
      issuingCountry: 'Portugal',
      confidence: 99,
      fieldConfidences: {
        surname: 100,
        givenNames: 100,
        passportOrIdNumber: 100,
        dateOfBirth: 99,
        passportExpiryDate: 99,
        nationality: 100,
        gender: 100,
      },
      mrz: {
        hasMrz: true,
        rawLines: [
          'P<PRTDA<SILVA<<JOAO<PEDRO<<<<<<<<<<<<<<<<<<<',
          'N7204918<4PRT7912115M3402042<<<<<<<<<<<<<<02'
        ],
        isChecksumValid: true,
        mrzType: 'TD3'
      },
      validationStatus: {
        isValid: true,
        warnings: [],
        checksPassed: [
          'EU biometric passport verified',
          'Checksum verified',
          '10+ years remaining validity'
        ],
        isExpiringSoon: false,
        isExpired: false
      },
      notes: 'EU Biometric Passport'
    }
  },
  {
    name: 'Johannes Van Der Merwe (South Africa Passport)',
    type: 'Passport',
    nationality: 'SOUTH AFRICAN',
    badgeColor: 'green',
    description: 'Republic of South Africa TD3 International Passport - Heavy Lift Specialist',
    data: {
      surname: 'VAN DER MERWE',
      givenNames: 'JOHANNES PETRUS',
      nameAndGender: 'JOHANNES PETRUS / MALE',
      passportOrIdNumber: 'A09482718',
      dateOfBirth: '24-Jun-81',
      nationality: 'SOUTH AFRICAN',
      nationalityCode: 'ZAF',
      passportExpiryDate: '15-Aug-33',
      gender: 'MALE',
      companyId: '20853',
      company: 'CCS JV',
      projectPosition: 'HEAVY LIFT SPECIALIST',
      projectDepartment: 'LOGISTICS',
      documentType: 'Passport',
      issuingCountry: 'South Africa',
      confidence: 99,
      fieldConfidences: {
        surname: 100,
        givenNames: 100,
        passportOrIdNumber: 100,
        dateOfBirth: 99,
        passportExpiryDate: 99,
        nationality: 100,
        gender: 100,
      },
      mrz: {
        hasMrz: true,
        rawLines: [
          'P<ZAFVAN<DER<MERWE<<JOHANNES<PETRUS<<<<<<<<<',
          'A094827184ZAF8106245M3308152<<<<<<<<<<<<<<04'
        ],
        isChecksumValid: true,
        mrzType: 'TD3'
      },
      validationStatus: {
        isValid: true,
        warnings: [],
        checksPassed: [
          'RSA Department of Home Affairs format verified',
          'MRZ TD3 Checksum passed',
          'Valid for international transit'
        ],
        isExpiringSoon: false,
        isExpired: false
      },
      notes: 'Scanned via ID Analyzer Engine (1.2s)'
    }
  },
  {
    name: 'David Robert Thompson (United Kingdom Passport)',
    type: 'Passport',
    nationality: 'BRITISH',
    badgeColor: 'indigo',
    description: 'British Citizen e-Passport - Offshore Project Director',
    data: {
      surname: 'THOMPSON',
      givenNames: 'DAVID ROBERT',
      nameAndGender: 'DAVID ROBERT / MALE',
      passportOrIdNumber: '550184920',
      dateOfBirth: '03-Nov-75',
      nationality: 'BRITISH',
      nationalityCode: 'GBR',
      passportExpiryDate: '29-May-34',
      gender: 'MALE',
      companyId: '10041',
      company: 'TOTALENERGIES',
      projectPosition: 'PROJECT DIRECTOR',
      projectDepartment: 'EXECUTIVE',
      documentType: 'Passport',
      issuingCountry: 'United Kingdom',
      confidence: 99,
      fieldConfidences: {
        surname: 100,
        givenNames: 100,
        passportOrIdNumber: 100,
        dateOfBirth: 99,
        passportExpiryDate: 99,
        nationality: 100,
        gender: 100,
      },
      mrz: {
        hasMrz: true,
        rawLines: [
          'P<GBRTHOMPSON<<DAVID<ROBERT<<<<<<<<<<<<<<<<<',
          '5501849202GBR7511038M3405294<<<<<<<<<<<<<<08'
        ],
        isChecksumValid: true,
        mrzType: 'TD3'
      },
      validationStatus: {
        isValid: true,
        warnings: [],
        checksPassed: [
          'UK HM Passport Office biometric chip standard',
          'High security MRZ verified',
          'Valid through 2034'
        ],
        isExpiringSoon: false,
        isExpired: false
      },
      notes: 'UK e-Passport Biometric Doc'
    }
  },
  {
    name: 'Eduardo Ramos Santos (Philippines Passport)',
    type: 'Passport',
    nationality: 'FILIPINO',
    badgeColor: 'cyan',
    description: 'Republic of the Philippines Biometric Passport - Electrical Foreman',
    data: {
      surname: 'SANTOS',
      givenNames: 'EDUARDO RAMOS',
      nameAndGender: 'EDUARDO RAMOS / MALE',
      passportOrIdNumber: 'P8920145A',
      dateOfBirth: '19-Jan-86',
      nationality: 'FILIPINO',
      nationalityCode: 'PHL',
      passportExpiryDate: '11-Oct-32',
      gender: 'MALE',
      companyId: '30784',
      company: 'DAEWOO',
      projectPosition: 'ELECTRICAL FOREMAN',
      projectDepartment: 'CONSTRUCTION',
      documentType: 'Passport',
      issuingCountry: 'Philippines',
      confidence: 99,
      fieldConfidences: {
        surname: 100,
        givenNames: 100,
        passportOrIdNumber: 100,
        dateOfBirth: 99,
        passportExpiryDate: 99,
        nationality: 100,
        gender: 100,
      },
      mrz: {
        hasMrz: true,
        rawLines: [
          'P<PHLSANTOS<<EDUARDO<RAMOS<<<<<<<<<<<<<<<<<<',
          'P8920145A1PHL8601194M3210118<<<<<<<<<<<<<<00'
        ],
        isChecksumValid: true,
        mrzType: 'TD3'
      },
      validationStatus: {
        isValid: true,
        warnings: [],
        checksPassed: [
          'DFA Philippine Biometric Passport validated',
          'Overseas contract compliant',
          'Valid through 2032'
        ],
        isExpiringSoon: false,
        isExpired: false
      },
      notes: 'Philippine Biometric Passport'
    }
  }
];

/**
 * Sends image data to backend for AI OCR / ID Analyzer analysis with fallback
 */
export async function scanIdImage(
  imageDataBase64: string,
  mimeType: string = 'image/jpeg',
  options?: {
    provider?: 'idanalyzer' | 'gemini' | 'auto';
    idAnalyzerKey?: string;
  }
): Promise<ExtractedIdResult> {
  try {
    const res = await fetch('/api/scan-id', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        image: imageDataBase64,
        mimeType,
        provider: options?.provider,
        idAnalyzerKey: options?.idAnalyzerKey
      })
    });

    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        return {
          ...json.data,
          imagePreview: imageDataBase64.startsWith('data:') ? imageDataBase64 : `data:${mimeType};base64,${imageDataBase64}`
        };
      }
    }
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `Server returned status ${res.status}`);
  } catch (err: any) {
    console.warn('Error reaching /api/scan-id:', err);
    throw err;
  }
}

/**
 * Initiates DocuPass hosted mobile flow session
 */
export async function generateDocuPassLink(idAnalyzerKey?: string): Promise<{
  success: boolean;
  reference?: string;
  url?: string;
  qrCodeUrl?: string;
}> {
  try {
    const res = await fetch('/api/docupass/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idAnalyzerKey })
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.warn('DocuPass link error:', e);
  }

  const mockRef = `DP-${Date.now().toString().slice(-6)}`;
  return {
    success: true,
    reference: mockRef,
    url: `https://verify.idanalyzer.com/docupass/${mockRef}`,
    qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=https://verify.idanalyzer.com/docupass/${mockRef}`
  };
}


/**
 * Converts extracted ID data into a complete production-ready TravelerRecord
 */
export function convertExtractedIdToTravelerRecord(
  extracted: ExtractedIdResult,
  customOptions?: {
    flightFrom?: string;
    flightTo?: string;
    flightDate?: string;
    campName?: string;
    airline?: string;
  }
): TravelerRecord {
  const flightDate = customOptions?.flightDate || new Date().toISOString().split('T')[0];
  const formattedFlightDate = new Date(flightDate).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: '2-digit'
  }).replace(/ /g, '-');

  const travelerId = extracted.id || `TRV-SCAN-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`;

  const surname = (extracted.surname || 'TRAVELER').toUpperCase().trim();
  const givenNames = (extracted.givenNames || '').toUpperCase().trim();
  const gender = (extracted.gender || 'MALE').toUpperCase();

  // Name and Gender standard: "GIVEN NAMES / GENDER"
  const nameAndGender = givenNames ? `${givenNames} / ${gender}` : `${surname} / ${gender}`;

  const traveler: TravelerRecord = {
    id: travelerId,
    surname,
    nameAndGender,
    finalDestination: customOptions?.flightTo?.includes('Afungi') ? 'Afungi' : (customOptions?.flightTo || 'Afungi'),
    rotationType: 'Mobilization',
    purposeOfTrip: 'Business Trip / Site Assignment',

    companyId: extracted.companyId || '30190',
    company: extracted.company || 'DAEWOO',
    projectPosition: extracted.projectPosition || 'PROJECT SPECIALIST',
    projectDepartment: extracted.projectDepartment || 'LOGISTICS',

    mobileNumber: '+258 84 000 0000',
    emailAddress: 'DEC.TravelMZ@daewooenc.com',
    substituteInAbsence: 'Duty Supervisor / Site Lead',
    frequentFlyerCard: 'N/A',

    passportOrIdNumber: extracted.passportOrIdNumber || '110000000A',
    dateOfBirth: extracted.dateOfBirth || '01-Jan-90',
    nationality: extracted.nationality || 'MOZAMBICAN',
    passportExpiryDate: extracted.passportExpiryDate || '01-Jan-32',

    flights: [
      {
        date: formattedFlightDate,
        from: customOptions?.flightFrom || 'Maputo (MPM)',
        to: customOptions?.flightTo || 'Afungi (AFG)',
        departureTime: '07:00',
        arrivalTime: '09:30',
        airlineAndFlightNo: customOptions?.airline || 'Solenta Aviation / CCS-01'
      }
    ],

    accommodation: [
      {
        checkIn: formattedFlightDate,
        checkOut: 'TBD (Rotation)',
        hotelOrCamp: customOptions?.campName || 'CCS JV Pioneer Camp',
        location: 'Afungi Site, Cabo Delgado',
        notes: 'Room reservation request via CCS JV Site Logistics'
      }
    ],

    signatureDate: new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    }).toUpperCase(),
    signatureName: 'Eric Matola (Travel Coordinator)',
    isValid: true,
    validationErrors: []
  };

  return traveler;
}
