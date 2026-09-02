import { PurposeOfTrip } from '../types';
export type { PurposeOfTrip };

export interface RotationPurposeItem {
  value: PurposeOfTrip;
  label: string;
  tag: string;
  description: string;
  sublabel: string; // Portuguese / Mozambique project translation
  color: string;
  badgeBg: string;
  border: string;
}

export const ROTATION_PURPOSE_OPTIONS: RotationPurposeItem[] = [
  {
    value: 'Mobilization',
    label: 'Mobilization',
    tag: 'MOB',
    description: 'Initial site deployment & onboarding at Mozambique LNG',
    sublabel: 'Mobilização para o Projecto',
    color: 'text-emerald-300',
    badgeBg: 'bg-emerald-950/80 text-emerald-300 border-emerald-700/70',
    border: 'border-emerald-500/50'
  },
  {
    value: 'Rotational Leave',
    label: 'Rotational Leave',
    tag: 'ROT',
    description: 'Standard 28/28 or scheduled field work rotation cycle',
    sublabel: 'Folga / Rotação Periódica',
    color: 'text-indigo-300',
    badgeBg: 'bg-indigo-950/80 text-indigo-300 border-indigo-700/70',
    border: 'border-indigo-500/50'
  },
  {
    value: 'Business Trip',
    label: 'Business Trip',
    tag: 'BT',
    description: 'Short-term technical assignment, audit, or site inspection',
    sublabel: 'Viagem de Trabalho / Missão',
    color: 'text-sky-300',
    badgeBg: 'bg-sky-950/80 text-sky-300 border-sky-700/70',
    border: 'border-sky-500/50'
  },
  {
    value: 'Emergency Leave',
    label: 'Emergency Leave',
    tag: 'EMG',
    description: 'Urgent compassionate leave or medical evacuation departure',
    sublabel: 'Licença de Emergência / Médica',
    color: 'text-amber-300',
    badgeBg: 'bg-amber-950/80 text-amber-300 border-amber-700/70',
    border: 'border-amber-500/50'
  },
  {
    value: 'Demobilization',
    label: 'Demobilization',
    tag: 'DEMOB',
    description: 'Contract completion, handover, and site departure',
    sublabel: 'Desmobilização Final',
    color: 'text-rose-300',
    badgeBg: 'bg-rose-950/80 text-rose-300 border-rose-700/70',
    border: 'border-rose-500/50'
  },
  {
    value: 'Visa Application',
    label: 'Visa Application',
    tag: 'VISA',
    description: 'Travel required for consular visa processing or renewals',
    sublabel: 'Tratamento de Visto / Passaporte',
    color: 'text-purple-300',
    badgeBg: 'bg-purple-950/80 text-purple-300 border-purple-700/70',
    border: 'border-purple-500/50'
  }
];

export const PRIMARY_FIVE_PURPOSES: PurposeOfTrip[] = [
  'Mobilization',
  'Rotational Leave',
  'Business Trip',
  'Emergency Leave',
  'Demobilization'
];

/**
 * Normalize any input string to the closest standard PurposeOfTrip / Rotation Type
 */
export function normalizeRotationOrPurpose(val: string | undefined | null): PurposeOfTrip {
  if (!val) return 'Mobilization';
  const clean = val.trim().toLowerCase();
  
  if (clean.includes('rotat') || clean.includes('rotação') || clean.includes('28/28')) return 'Rotational Leave';
  if (clean.includes('mob') && !clean.includes('demob')) return 'Mobilization';
  if (clean.includes('demob') || clean.includes('desmob')) return 'Demobilization';
  if (clean.includes('bus') || clean.includes('work') || clean.includes('trabalho') || clean.includes('miss')) return 'Business Trip';
  if (clean.includes('emerg') || clean.includes('med')) return 'Emergency Leave';
  if (clean.includes('vis') || clean.includes('visto')) return 'Visa Application';
  
  const found = ROTATION_PURPOSE_OPTIONS.find(
    opt => opt.value.toLowerCase() === clean || opt.label.toLowerCase() === clean
  );
  return found ? found.value : 'Mobilization';
}

/**
 * Step up or down among the options with automatic wrap-around
 */
export function getNextRotationOption(
  current: string | undefined,
  direction: 'up' | 'down'
): PurposeOfTrip {
  const currentNormalized = normalizeRotationOrPurpose(current);
  const currentIndex = ROTATION_PURPOSE_OPTIONS.findIndex(
    opt => opt.value === currentNormalized
  );
  const total = ROTATION_PURPOSE_OPTIONS.length;
  
  if (direction === 'down') {
    const nextIdx = (currentIndex + 1) % total;
    return ROTATION_PURPOSE_OPTIONS[nextIdx].value;
  } else {
    const prevIdx = (currentIndex - 1 + total) % total;
    return ROTATION_PURPOSE_OPTIONS[prevIdx].value;
  }
}
