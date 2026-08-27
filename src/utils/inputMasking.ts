// Input Masking and Formatting Utilities for Traveler Fields

export interface CountryPhoneConfig {
  code: string; // e.g. '+258'
  iso: string; // e.g. 'MZ'
  name: string; // e.g. 'Mozambique'
  flag: string; // e.g. '🇲🇿'
  format: string; // e.g. '+258 ## ### ####'
  digitsLength: number[]; // e.g. [9] (without country code)
  placeholder: string;
}

export const COUNTRY_PHONE_PRESETS: CountryPhoneConfig[] = [
  {
    code: '+258',
    iso: 'MZ',
    name: 'Mozambique',
    flag: '🇲🇿',
    format: '+258 ## ### ####',
    digitsLength: [9],
    placeholder: '+258 84 123 4567'
  },
  {
    code: '+27',
    iso: 'ZA',
    name: 'South Africa',
    flag: '🇿🇦',
    format: '+27 ## ### ####',
    digitsLength: [9, 10],
    placeholder: '+27 82 123 4567'
  },
  {
    code: '+351',
    iso: 'PT',
    name: 'Portugal',
    flag: '🇵🇹',
    format: '+351 ### ### ###',
    digitsLength: [9],
    placeholder: '+351 912 345 678'
  },
  {
    code: '+91',
    iso: 'IN',
    name: 'India',
    flag: '🇮🇳',
    format: '+91 ##### #####',
    digitsLength: [10],
    placeholder: '+91 98765 43210'
  },
  {
    code: '+63',
    iso: 'PH',
    name: 'Philippines',
    flag: '🇵🇭',
    format: '+63 ### ### ####',
    digitsLength: [10],
    placeholder: '+63 917 123 4567'
  },
  {
    code: '+82',
    iso: 'KR',
    name: 'South Korea',
    flag: '🇰🇷',
    format: '+82 ## #### ####',
    digitsLength: [9, 10],
    placeholder: '+82 10 1234 5678'
  },
  {
    code: '+44',
    iso: 'GB',
    name: 'United Kingdom',
    flag: '🇬🇧',
    format: '+44 #### ######',
    digitsLength: [10],
    placeholder: '+44 7911 123456'
  },
  {
    code: '+1',
    iso: 'US',
    name: 'USA / Canada',
    flag: '🇺🇸',
    format: '+1 (###) ###-####',
    digitsLength: [10],
    placeholder: '+1 (555) 123-4567'
  }
];

export type DocumentType = 'Passport' | 'Mozambique BI' | 'DIRE' | 'National ID' | 'Company ID' | 'Other';

export interface DocumentValidationResult {
  isValid: boolean;
  docType: DocumentType;
  formattedValue: string;
  badge: string;
  error?: string;
  hint?: string;
}

/**
 * Format Phone Number with Intelligent Masking
 */
export function formatPhoneNumber(input: string, defaultCountryCode: string = '+258'): string {
  if (!input) return '';

  const clean = input.trim();
  if (!clean) return '';

  // Extract raw digits
  const hasPlus = clean.startsWith('+');
  const digits = clean.replace(/\D/g, '');

  if (digits.length === 0) return hasPlus ? '+' : '';

  // 1. Check if input starts with a known country code
  for (const country of COUNTRY_PHONE_PRESETS) {
    const rawCode = country.code.replace('+', '');
    if (digits.startsWith(rawCode)) {
      const rest = digits.slice(rawCode.length);
      return applyCountryFormat(country, rest);
    }
  }

  // 2. If it doesn't have a country code, check if it looks like a local Mozambican number (e.g. 84, 82, 85, 86, 87)
  if (!hasPlus && digits.length <= 9 && (digits.startsWith('8') || digits.length <= 9)) {
    // Format as Mozambique number with default country code
    return applyCountryFormat(
      COUNTRY_PHONE_PRESETS.find(c => c.code === defaultCountryCode) || COUNTRY_PHONE_PRESETS[0],
      digits
    );
  }

  // 3. If has plus but unknown country code, format in chunks of 3-4
  if (hasPlus) {
    if (digits.length <= 3) return `+${digits}`;
    if (digits.length <= 6) return `+${digits.slice(0, 3)} ${digits.slice(3)}`;
    if (digits.length <= 9) return `+${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
    if (digits.length <= 12) return `+${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 9)} ${digits.slice(9)}`;
    return `+${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 9)} ${digits.slice(9, 13)}`;
  }

  // 4. Default fallback chunking
  if (digits.length <= 4) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
  return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 10)}`;
}

function applyCountryFormat(country: CountryPhoneConfig, nationalDigits: string): string {
  const code = country.code;
  if (nationalDigits.length === 0) return `${code} `;

  // Mozambique (+258 84 123 4567)
  if (country.code === '+258') {
    if (nationalDigits.length <= 2) return `${code} ${nationalDigits}`;
    if (nationalDigits.length <= 5) return `${code} ${nationalDigits.slice(0, 2)} ${nationalDigits.slice(2)}`;
    return `${code} ${nationalDigits.slice(0, 2)} ${nationalDigits.slice(2, 5)} ${nationalDigits.slice(5, 9)}`;
  }

  // South Africa (+27 82 123 4567)
  if (country.code === '+27') {
    // Remove leading zero if entered (e.g. 082 -> 82)
    const d = nationalDigits.startsWith('0') ? nationalDigits.slice(1) : nationalDigits;
    if (d.length <= 2) return `${code} ${d}`;
    if (d.length <= 5) return `${code} ${d.slice(0, 2)} ${d.slice(2)}`;
    return `${code} ${d.slice(0, 2)} ${d.slice(2, 5)} ${d.slice(5, 9)}`;
  }

  // Portugal (+351 912 345 678)
  if (country.code === '+351') {
    if (nationalDigits.length <= 3) return `${code} ${nationalDigits}`;
    if (nationalDigits.length <= 6) return `${code} ${nationalDigits.slice(0, 3)} ${nationalDigits.slice(3)}`;
    return `${code} ${nationalDigits.slice(0, 3)} ${nationalDigits.slice(3, 6)} ${nationalDigits.slice(6, 9)}`;
  }

  // USA / Canada (+1 (555) 123-4567)
  if (country.code === '+1') {
    if (nationalDigits.length <= 3) return `${code} (${nationalDigits}`;
    if (nationalDigits.length <= 6) return `${code} (${nationalDigits.slice(0, 3)}) ${nationalDigits.slice(3)}`;
    return `${code} (${nationalDigits.slice(0, 3)}) ${nationalDigits.slice(3, 6)}-${nationalDigits.slice(6, 10)}`;
  }

  // India (+91 98765 43210)
  if (country.code === '+91') {
    if (nationalDigits.length <= 5) return `${code} ${nationalDigits}`;
    return `${code} ${nationalDigits.slice(0, 5)} ${nationalDigits.slice(5, 10)}`;
  }

  // Philippines (+63 917 123 4567)
  if (country.code === '+63') {
    if (nationalDigits.length <= 3) return `${code} ${nationalDigits}`;
    if (nationalDigits.length <= 6) return `${code} ${nationalDigits.slice(0, 3)} ${nationalDigits.slice(3)}`;
    return `${code} ${nationalDigits.slice(0, 3)} ${nationalDigits.slice(3, 6)} ${nationalDigits.slice(6, 10)}`;
  }

  // Generic 3-3-4 pattern
  if (nationalDigits.length <= 3) return `${code} ${nationalDigits}`;
  if (nationalDigits.length <= 6) return `${code} ${nationalDigits.slice(0, 3)} ${nationalDigits.slice(3)}`;
  return `${code} ${nationalDigits.slice(0, 3)} ${nationalDigits.slice(3, 6)} ${nationalDigits.slice(6, 10)}`;
}

/**
 * Validate Phone Number
 */
export function validatePhoneNumber(phone: string): { isValid: boolean; error?: string; country?: CountryPhoneConfig } {
  if (!phone || phone.trim() === '') {
    return { isValid: true }; // optional
  }

  const digits = phone.replace(/\D/g, '');
  if (digits.length < 7) {
    return { isValid: false, error: 'Phone number is too short (min 7 digits).' };
  }
  if (digits.length > 15) {
    return { isValid: false, error: 'Phone number is too long (max 15 digits).' };
  }

  // Find matched country preset
  for (const country of COUNTRY_PHONE_PRESETS) {
    const rawCode = country.code.replace('+', '');
    if (digits.startsWith(rawCode)) {
      const national = digits.slice(rawCode.length);
      if (country.digitsLength.includes(national.length)) {
        return { isValid: true, country };
      }
      return {
        isValid: national.length >= 7,
        country,
        error: !country.digitsLength.includes(national.length) && national.length < Math.min(...country.digitsLength)
          ? `Expected ${country.digitsLength.join(' or ')} digits for ${country.name}.`
          : undefined
      };
    }
  }

  return { isValid: true };
}

/**
 * Detects Document Type and Validates Passport / ID Number
 */
export function validateAndFormatPassportOrId(
  input: string,
  preferredType?: DocumentType
): DocumentValidationResult {
  if (!input || !input.trim()) {
    return {
      isValid: false,
      docType: preferredType || 'Passport',
      formattedValue: '',
      badge: 'Missing',
      error: 'Passport or ID number is required.'
    };
  }

  // Clean and uppercase (allow letters, numbers, forward slash and dash)
  let clean = input.trim().toUpperCase().replace(/[^A-Z0-9/-]/g, '');

  // 1. Mozambican BI (Bilhete de Identidade)
  // Standard format: 12 digits followed by 1 uppercase letter (e.g. 110100234567A or 110394820K)
  const mozBiRegex = /^(\d{8,12})([A-Z])$/;
  if (preferredType === 'Mozambique BI' || mozBiRegex.test(clean)) {
    const match = clean.match(mozBiRegex);
    if (match) {
      return {
        isValid: true,
        docType: 'Mozambique BI',
        formattedValue: clean,
        badge: '🇲🇿 Mozambican BI',
        hint: 'Verified Mozambican National Identity Card'
      };
    }
    // If it has only numbers and is 8-12 digits long without final letter yet
    if (/^\d{8,13}$/.test(clean)) {
      return {
        isValid: false,
        docType: 'Mozambique BI',
        formattedValue: clean,
        badge: '🇲🇿 BI Format',
        error: 'Mozambique BI typically ends with a single check-letter (e.g. 110394820K).'
      };
    }
  }

  // 2. DIRE (Documento de Identificação e Residência para Estrangeiros)
  if (preferredType === 'DIRE' || clean.includes('DIRE') || /^\d{6,10}\/D$/.test(clean)) {
    return {
      isValid: clean.length >= 5,
      docType: 'DIRE',
      formattedValue: clean,
      badge: '🪪 DIRE Resident ID',
      hint: 'Mozambique Foreign Resident Document (DIRE)'
    };
  }

  // 3. Standard International Passport
  // Usually 1-2 letters + 6-9 digits OR 8-10 alphanumeric characters
  const standardPassportRegex = /^[A-Z0-9]{6,12}$/;
  if (standardPassportRegex.test(clean)) {
    // Check if it starts with known passport formats
    return {
      isValid: true,
      docType: 'Passport',
      formattedValue: clean,
      badge: '🛂 Passport Valid',
      hint: 'Standard Alphanumeric Passport format'
    };
  }

  // 4. Company Badge ID (e.g. DW-30190 or 30190)
  if (/^(DW-?)?\d{4,8}$/.test(clean)) {
    return {
      isValid: true,
      docType: 'Company ID',
      formattedValue: clean,
      badge: '🏢 Project / Badge ID',
      hint: 'Company / Project Staff ID'
    };
  }

  // 5. Fallback for other valid alphanumeric ID formats (5-15 characters)
  if (/^[A-Z0-9/-]{4,16}$/.test(clean)) {
    return {
      isValid: true,
      docType: 'National ID',
      formattedValue: clean,
      badge: '🪪 National ID / Doc',
      hint: 'Standard Identification Document'
    };
  }

  return {
    isValid: false,
    docType: 'Other',
    formattedValue: clean,
    badge: 'Invalid Format',
    error: 'Document number should be 5-15 alphanumeric characters without special symbols.'
  };
}

/**
 * Format and sanitize Passport/ID input string dynamically
 */
export function formatPassportOrIdInput(raw: string): string {
  if (!raw) return '';
  // Convert to uppercase and strip invalid characters
  return raw.toUpperCase().replace(/[^A-Z0-9/-]/g, '');
}
