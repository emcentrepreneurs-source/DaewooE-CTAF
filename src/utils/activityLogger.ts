import { ActivityLogItem, ActivityActionType } from '../types';

const ACTIVITY_LOGS_STORAGE_KEY = 'taf_activity_logs_v1';

export const INITIAL_SAMPLE_ACTIVITY_LOGS: ActivityLogItem[] = [
  {
    id: 'act-10',
    action: 'Batch Generated',
    user: 'ericstamarais@gmail.com',
    details: 'Generated and archived 12 official Mozambique LNG TAF documents into ZIP package.',
    timestamp: 'Today at 03:05 AM',
    badgeColor: 'purple',
    count: 12
  },
  {
    id: 'act-9',
    action: 'ID Scanned',
    user: 'ericstamarais@gmail.com',
    details: 'Extracted biometric passport data for Johannes Van Der Merwe (ZAF) via ID Analyzer (< 3s).',
    timestamp: 'Today at 02:48 AM',
    badgeColor: 'cyan',
    targetId: 'A09482718'
  },
  {
    id: 'act-8',
    action: 'Traveler Modified',
    user: 'ericstamarais@gmail.com',
    details: 'Updated flight connection Solenta Pemba -> Afungi for Traveler ABREU ANTONIO.',
    timestamp: 'Today at 02:22 AM',
    badgeColor: 'amber',
    targetId: 'T-101'
  },
  {
    id: 'act-7',
    action: 'Batch Parameters Applied',
    user: 'ericstamarais@gmail.com',
    details: 'Assigned Afungi Camp 9500 accommodation and departure flight (06:45) to 12 travelers.',
    timestamp: 'Today at 01:50 AM',
    badgeColor: 'indigo',
    count: 12
  },
  {
    id: 'act-6',
    action: 'Signature Updated',
    user: 'ericstamarais@gmail.com',
    details: 'Updated default authorization stamp for Project Logistics Director (Eric Matola).',
    timestamp: 'Today at 01:15 AM',
    badgeColor: 'emerald'
  },
  {
    id: 'act-5',
    action: 'ID Scanned',
    user: 'ericstamarais@gmail.com',
    details: 'Biometric MRZ scan verified for David Robert Thompson (UK Passport #550184920).',
    timestamp: 'Yesterday at 11:42 PM',
    badgeColor: 'cyan',
    targetId: '550184920'
  },
  {
    id: 'act-4',
    action: 'Traveler Added',
    user: 'ericstamarais@gmail.com',
    details: 'Created new profile for Eduardo Ramos Santos (Daewoo Electrical Foreman).',
    timestamp: 'Yesterday at 10:15 PM',
    badgeColor: 'emerald',
    targetId: 'T-112'
  },
  {
    id: 'act-3',
    action: 'PDF Combined Export',
    user: 'ericstamarais@gmail.com',
    details: 'Exported combined multi-page TAF dossier for Afungi Site Access Security clearance.',
    timestamp: 'Yesterday at 09:30 PM',
    badgeColor: 'blue',
    count: 12
  },
  {
    id: 'act-2',
    action: 'Manifest Imported',
    user: 'ericstamarais@gmail.com',
    details: 'Imported Daewoo / Saipem Weekly Rotation Flight Manifest (12 passengers).',
    timestamp: 'Yesterday at 08:10 PM',
    badgeColor: 'indigo',
    count: 12
  },
  {
    id: 'act-1',
    action: 'Database Synced',
    user: 'System / PostgreSQL',
    details: 'Synchronized TAF traveler records with Cloud SQL PostgreSQL schema.',
    timestamp: 'Yesterday at 08:00 PM',
    badgeColor: 'emerald'
  }
];

export function getStoredActivityLogs(): ActivityLogItem[] {
  try {
    const raw = localStorage.getItem(ACTIVITY_LOGS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.slice(0, 10);
      }
    }
  } catch (e) {
    console.warn('Could not read activity logs from storage:', e);
  }
  return INITIAL_SAMPLE_ACTIVITY_LOGS;
}

export function saveStoredActivityLogs(logs: ActivityLogItem[]): void {
  try {
    localStorage.setItem(ACTIVITY_LOGS_STORAGE_KEY, JSON.stringify(logs.slice(0, 50)));
  } catch (e) {
    console.warn('Could not save activity logs to storage:', e);
  }
}

export function formatActivityTimestamp(date: Date = new Date()): string {
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
  if (isToday) {
    return `Today at ${timeStr}`;
  }
  
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) {
    return `Yesterday at ${timeStr}`;
  }
  
  return `${date.toLocaleDateString([], { month: 'short', day: 'numeric' })} at ${timeStr}`;
}

export function determineActionBadgeColor(action: ActivityActionType | string): ActivityLogItem['badgeColor'] {
  switch (action) {
    case 'Batch Generated':
      return 'purple';
    case 'Traveler Modified':
      return 'amber';
    case 'ID Scanned':
      return 'cyan';
    case 'Traveler Added':
      return 'emerald';
    case 'Traveler Deleted':
      return 'rose';
    case 'Batch Parameters Applied':
      return 'indigo';
    case 'Signature Updated':
      return 'emerald';
    case 'Manifest Imported':
      return 'indigo';
    case 'PDF Combined Export':
      return 'blue';
    default:
      return 'indigo';
  }
}

export function createActivityLog(
  action: ActivityActionType | string,
  details: string,
  user: string = 'ericstamarais@gmail.com',
  extra?: { targetId?: string; count?: number; badgeColor?: ActivityLogItem['badgeColor'] }
): ActivityLogItem {
  return {
    id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    action,
    user: user || 'ericstamarais@gmail.com',
    details,
    timestamp: formatActivityTimestamp(new Date()),
    targetId: extra?.targetId,
    count: extra?.count,
    badgeColor: extra?.badgeColor || determineActionBadgeColor(action)
  };
}
