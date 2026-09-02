import React, { useState, useMemo, useEffect } from 'react';
import {
  X,
  Check,
  Calendar,
  Clock,
  RotateCcw,
  Sparkles,
  ChevronRight,
  Disc3,
  CalendarDays
} from 'lucide-react';
import { DrumWheelColumn, DrumOption } from './DrumWheelColumn';
import {
  parseFlexibleDate,
  formatToStandardDate,
  parseFlexibleTime,
  formatTo24HourTime
} from '../utils/dateTimeValidation';
import {
  ROTATION_PURPOSE_OPTIONS,
  normalizeRotationOrPurpose,
  PurposeOfTrip
} from '../utils/rotationPurposeOptions';

export type DrumPickerMode = 'date' | 'time' | 'rotation' | 'purpose';
export type DateFormatTarget = 'dob' | 'short' | 'full' | 'iso';

interface DrumWheelPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: DrumPickerMode;
  title?: string;
  initialValue: string;
  onConfirm: (formattedValue: string) => void;
  dateFormat?: DateFormatTarget; // 'dob' (12-Aug-90), 'short' (M/D/YYYY), 'full' (06 AUGUST 2026), 'iso' (YYYY-MM-DD)
  context?: 'dob' | 'passportExpiry' | 'flightDate' | 'signatureDate' | 'checkIn' | 'checkOut' | 'time';
}

const MONTHS: DrumOption[] = [
  { value: 0, label: '01 - Jan', sublabel: 'Janeiro' },
  { value: 1, label: '02 - Feb', sublabel: 'Fevereiro' },
  { value: 2, label: '03 - Mar', sublabel: 'Março' },
  { value: 3, label: '04 - Apr', sublabel: 'Abril' },
  { value: 4, label: '05 - May', sublabel: 'Maio' },
  { value: 5, label: '06 - Jun', sublabel: 'Junho' },
  { value: 6, label: '07 - Jul', sublabel: 'Julho' },
  { value: 7, label: '08 - Aug', sublabel: 'Agosto' },
  { value: 8, label: '09 - Sep', sublabel: 'Setembro' },
  { value: 9, label: '10 - Oct', sublabel: 'Outubro' },
  { value: 10, label: '11 - Nov', sublabel: 'Novembro' },
  { value: 11, label: '12 - Dec', sublabel: 'Dezembro' }
];

export const DrumWheelPickerModal: React.FC<DrumWheelPickerModalProps> = ({
  isOpen,
  onClose,
  mode,
  title,
  initialValue,
  onConfirm,
  dateFormat = 'short',
  context
}) => {
  // ------------------ DATE STATE ------------------
  const initialParsedDate = useMemo(() => {
    return parseFlexibleDate(initialValue) || new Date();
  }, [initialValue]);

  const [selectedYear, setSelectedYear] = useState<number>(initialParsedDate.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(initialParsedDate.getMonth());
  const [selectedDay, setSelectedDay] = useState<number>(initialParsedDate.getDate());
  const [selectedFormat, setSelectedFormat] = useState<DateFormatTarget>(dateFormat);

  // ------------------ TIME STATE ------------------
  const initialParsedTime = useMemo(() => {
    return parseFlexibleTime(initialValue) || { hour: 6, minute: 45 };
  }, [initialValue]);

  const [selectedHour, setSelectedHour] = useState<number>(initialParsedTime.hour);
  const [selectedMinute, setSelectedMinute] = useState<number>(initialParsedTime.minute);

  // ------------------ ROTATION / PURPOSE STATE ------------------
  const [selectedRotation, setSelectedRotation] = useState<PurposeOfTrip>(() => {
    return normalizeRotationOrPurpose(initialValue);
  });

  const rotationOptions: DrumOption[] = useMemo(() => {
    return ROTATION_PURPOSE_OPTIONS.map(opt => ({
      value: opt.value,
      label: opt.label,
      sublabel: `[${opt.tag}] ${opt.sublabel}`
    }));
  }, []);

  // ------------------ DATE OPTIONS GENERATION ------------------
  // Years range: 1940 to 2045
  const yearOptions: DrumOption[] = useMemo(() => {
    const years: DrumOption[] = [];
    const maxYear = context === 'dob' ? new Date().getFullYear() - 10 : 2045;
    const minYear = context === 'dob' ? 1940 : 2020;
    for (let y = minYear; y <= maxYear; y++) {
      years.push({ value: y, label: String(y) });
    }
    return years;
  }, [context]);

  // Days in selected Month & Year
  const daysInMonth = useMemo(() => {
    return new Date(selectedYear, selectedMonth + 1, 0).getDate();
  }, [selectedYear, selectedMonth]);

  const dayOptions: DrumOption[] = useMemo(() => {
    const days: DrumOption[] = [];
    for (let d = 1; d <= daysInMonth; d++) {
      const pad = d < 10 ? `0${d}` : `${d}`;
      days.push({ value: d, label: pad });
    }
    return days;
  }, [daysInMonth]);

  // ------------------ TIME OPTIONS GENERATION ------------------
  const hourOptions: DrumOption[] = useMemo(() => {
    const hours: DrumOption[] = [];
    for (let h = 0; h <= 23; h++) {
      const pad = h < 10 ? `0${h}` : `${h}`;
      hours.push({
        value: h,
        label: pad,
        sublabel: h >= 12 ? (h === 12 ? '12 PM' : `${h - 12} PM`) : (h === 0 ? '12 AM' : `${h} AM`)
      });
    }
    return hours;
  }, []);

  const minuteOptions: DrumOption[] = useMemo(() => {
    const minutes: DrumOption[] = [];
    for (let m = 0; m <= 59; m++) {
      const pad = m < 10 ? `0${m}` : `${m}`;
      minutes.push({ value: m, label: pad });
    }
    return minutes;
  }, []);

  // Clamped day to ensure valid date within selected month
  const effectiveDay = Math.min(selectedDay, daysInMonth);

  // Active constructed Date object
  const activeDateObj = useMemo(() => {
    return new Date(selectedYear, selectedMonth, effectiveDay);
  }, [selectedYear, selectedMonth, effectiveDay]);

  const formattedPreview = useMemo(() => {
    return formatToStandardDate(activeDateObj, selectedFormat);
  }, [activeDateObj, selectedFormat]);

  const formattedTimePreview = useMemo(() => {
    return formatTo24HourTime(selectedHour, selectedMinute);
  }, [selectedHour, selectedMinute]);

  // ------------------ HANDLERS ------------------
  const handleConfirm = () => {
    if (mode === 'date') {
      onConfirm(formattedPreview);
    } else if (mode === 'time') {
      onConfirm(formattedTimePreview);
    } else {
      onConfirm(selectedRotation);
    }
    onClose();
  };

  // Quick preset actions for dates
  const setQuickDate = (yearsOffset: number, monthsOffset: number = 0, daysOffset: number = 0) => {
    const d = new Date();
    d.setFullYear(d.getFullYear() + yearsOffset);
    d.setMonth(d.getMonth() + monthsOffset);
    d.setDate(d.getDate() + daysOffset);
    setSelectedYear(d.getFullYear());
    setSelectedMonth(d.getMonth());
    setSelectedDay(d.getDate());
  };

  // Quick preset actions for times
  const setQuickTime = (hours: number, minutes: number) => {
    setSelectedHour(hours);
    setSelectedMinute(minutes);
  };

  // Sync state when initial value or modal opening changes
  useEffect(() => {
    if (isOpen) {
      if (mode === 'date') {
        const d = parseFlexibleDate(initialValue) || new Date();
        setSelectedYear(d.getFullYear());
        setSelectedMonth(d.getMonth());
        setSelectedDay(d.getDate());
        setSelectedFormat(dateFormat);
      } else if (mode === 'time') {
        const t = parseFlexibleTime(initialValue) || { hour: 6, minute: 45 };
        setSelectedHour(t.hour);
        setSelectedMinute(t.minute);
      } else {
        setSelectedRotation(normalizeRotationOrPurpose(initialValue));
      }
    }
  }, [isOpen, initialValue, mode, dateFormat]);

  if (!isOpen) return null;

  const activeRotationMeta = ROTATION_PURPOSE_OPTIONS.find(opt => opt.value === selectedRotation) || ROTATION_PURPOSE_OPTIONS[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800 bg-zinc-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-950/80 text-indigo-400 rounded-xl border border-indigo-800/60 shadow-inner">
              <Disc3 className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-1.5">
                {title || (mode === 'date' ? 'Scroll Wheel Date Picker' : mode === 'time' ? 'Scroll Wheel Time Picker' : 'Scroll Wheel Rotation & Trip Purpose')}
              </h3>
              <p className="text-[11px] text-zinc-400">
                Drag or scroll cylinder wheel to select from the 5 options
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selected Output Highlight Box */}
        <div className="px-5 pt-4 pb-2">
          <div className="p-3 bg-indigo-950/40 border border-indigo-500/30 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              {mode === 'date' ? (
                <Calendar className="w-4 h-4 text-indigo-400" />
              ) : mode === 'time' ? (
                <Clock className="w-4 h-4 text-indigo-400" />
              ) : (
                <Sparkles className="w-4 h-4 text-indigo-400" />
              )}
              <span className="text-xs text-zinc-400">Current Selection:</span>
            </div>
            <div className="font-mono text-base font-bold text-indigo-200 tracking-wider">
              {mode === 'date' ? formattedPreview : mode === 'time' ? formattedTimePreview : selectedRotation}
            </div>
          </div>
        </div>

        {/* Context-aware Quick Preset Chips */}
        <div className="px-5 py-2 flex items-center gap-1.5 overflow-x-auto text-[10px] scrollbar-none">
          <span className="text-zinc-500 font-medium whitespace-nowrap">Presets:</span>
          {mode === 'date' && (
            <>
              {context === 'dob' ? (
                <>
                  <button
                    type="button"
                    onClick={() => setQuickDate(-20)}
                    className="px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-md border border-zinc-700 whitespace-nowrap transition-colors cursor-pointer"
                  >
                    20 yrs ago
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuickDate(-30)}
                    className="px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-md border border-zinc-700 whitespace-nowrap transition-colors cursor-pointer"
                  >
                    30 yrs ago
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuickDate(-40)}
                    className="px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-md border border-zinc-700 whitespace-nowrap transition-colors cursor-pointer"
                  >
                    40 yrs ago
                  </button>
                </>
              ) : context === 'passportExpiry' ? (
                <>
                  <button
                    type="button"
                    onClick={() => setQuickDate(5)}
                    className="px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-md border border-zinc-700 whitespace-nowrap transition-colors cursor-pointer"
                  >
                    +5 Years
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuickDate(10)}
                    className="px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-md border border-zinc-700 whitespace-nowrap transition-colors cursor-pointer"
                  >
                    +10 Years
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuickDate(0, 6)}
                    className="px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-md border border-zinc-700 whitespace-nowrap transition-colors cursor-pointer"
                  >
                    +6 Months
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setQuickDate(0, 0, 0)}
                    className="px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-md border border-zinc-700 whitespace-nowrap transition-colors cursor-pointer"
                  >
                    Today
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuickDate(0, 0, 1)}
                    className="px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-md border border-zinc-700 whitespace-nowrap transition-colors cursor-pointer"
                  >
                    Tomorrow
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuickDate(0, 0, 7)}
                    className="px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-md border border-zinc-700 whitespace-nowrap transition-colors cursor-pointer"
                  >
                    In 1 Week
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuickDate(0, 1, 0)}
                    className="px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-md border border-zinc-700 whitespace-nowrap transition-colors cursor-pointer"
                  >
                    In 1 Month
                  </button>
                </>
              )}
            </>
          )}

          {mode === 'time' && (
            <>
              <button
                type="button"
                onClick={() => setQuickTime(6, 45)}
                className="px-2 py-1 bg-indigo-950/70 hover:bg-indigo-900 text-indigo-300 rounded-md border border-indigo-700/60 whitespace-nowrap transition-colors cursor-pointer font-mono"
              >
                06:45 (AFUNGI AM)
              </button>
              <button
                type="button"
                onClick={() => setQuickTime(7, 30)}
                className="px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-md border border-zinc-700 whitespace-nowrap transition-colors cursor-pointer font-mono"
              >
                07:30
              </button>
              <button
                type="button"
                onClick={() => setQuickTime(14, 0)}
                className="px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-md border border-zinc-700 whitespace-nowrap transition-colors cursor-pointer font-mono"
              >
                14:00 (PM Flight)
              </button>
              <button
                type="button"
                onClick={() => setQuickTime(17, 30)}
                className="px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-md border border-zinc-700 whitespace-nowrap transition-colors cursor-pointer font-mono"
              >
                17:30 (Return)
              </button>
            </>
          )}

          {(mode === 'rotation' || mode === 'purpose') && (
            <>
              {ROTATION_PURPOSE_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setSelectedRotation(opt.value)}
                  className={`px-2 py-1 rounded-md border whitespace-nowrap transition-colors cursor-pointer font-sans ${
                    selectedRotation === opt.value
                      ? 'bg-indigo-600 text-white border-indigo-400 font-semibold'
                      : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border-zinc-700'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </>
          )}
        </div>

        {/* DRUM WHEELS DISPLAY */}
        <div className="px-5 py-3">
          {mode === 'date' ? (
            <div className="grid grid-cols-3 gap-2.5">
              {/* Day Wheel */}
              <DrumWheelColumn
                id="drum-day-column"
                label="DAY"
                options={dayOptions}
                selectedValue={selectedDay}
                onSelect={val => setSelectedDay(Number(val))}
                height={210}
                itemHeight={42}
              />

              {/* Month Wheel */}
              <DrumWheelColumn
                id="drum-month-column"
                label="MONTH"
                options={MONTHS}
                selectedValue={selectedMonth}
                onSelect={val => setSelectedMonth(Number(val))}
                height={210}
                itemHeight={42}
              />

              {/* Year Wheel */}
              <DrumWheelColumn
                id="drum-year-column"
                label="YEAR"
                options={yearOptions}
                selectedValue={selectedYear}
                onSelect={val => setSelectedYear(Number(val))}
                height={210}
                itemHeight={42}
              />
            </div>
          ) : mode === 'time' ? (
            <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto">
              {/* Hours Wheel */}
              <DrumWheelColumn
                id="drum-hour-column"
                label="HOUR (24H)"
                options={hourOptions}
                selectedValue={selectedHour}
                onSelect={val => setSelectedHour(Number(val))}
                height={210}
                itemHeight={42}
              />

              {/* Minutes Wheel */}
              <DrumWheelColumn
                id="drum-minute-column"
                label="MINUTE"
                options={minuteOptions}
                selectedValue={selectedMinute}
                onSelect={val => setSelectedMinute(Number(val))}
                height={210}
                itemHeight={42}
              />
            </div>
          ) : (
            <div className="max-w-sm mx-auto">
              {/* Rotation / Purpose Single Cylinder Wheel */}
              <DrumWheelColumn
                id="drum-rotation-column"
                label="ROTATION TYPE / PURPOSE OF TRIP"
                options={rotationOptions}
                selectedValue={selectedRotation}
                onSelect={val => setSelectedRotation(String(val) as PurposeOfTrip)}
                height={220}
                itemHeight={44}
              />
            </div>
          )}
        </div>

        {/* Date Target Format Selector (if Date mode) */}
        {mode === 'date' && (
          <div className="px-5 py-2 border-t border-zinc-800/80 bg-zinc-950/40 flex items-center justify-between">
            <span className="text-[10px] text-zinc-400 uppercase tracking-wider">Format Style:</span>
            <div className="flex items-center gap-1">
              {(
                [
                  { key: 'dob', label: '12-Aug-90' },
                  { key: 'short', label: 'M/D/YYYY' },
                  { key: 'full', label: '06 AUGUST 2026' },
                  { key: 'iso', label: 'YYYY-MM-DD' }
                ] as { key: DateFormatTarget; label: string }[]
              ).map(fmt => (
                <button
                  key={fmt.key}
                  type="button"
                  onClick={() => setSelectedFormat(fmt.key)}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors cursor-pointer ${
                    selectedFormat === fmt.key
                      ? 'bg-indigo-600 text-white font-medium'
                      : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {fmt.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Description Banner (if Rotation mode) */}
        {(mode === 'rotation' || mode === 'purpose') && (
          <div className="px-5 py-2 border-t border-zinc-800/80 bg-zinc-950/40 flex items-center justify-between text-xs">
            <span className="text-[10px] text-zinc-400 uppercase tracking-wider">Selected Definition:</span>
            <span className="text-zinc-300 font-medium text-[11px] truncate max-w-[240px]">
              {activeRotationMeta.description}
            </span>
          </div>
        )}

        {/* Footer */}
        <div className="px-5 py-3 border-t border-zinc-800 bg-zinc-950/80 flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              if (mode === 'date') {
                const now = new Date();
                setSelectedYear(now.getFullYear());
                setSelectedMonth(now.getMonth());
                setSelectedDay(now.getDate());
              } else if (mode === 'time') {
                setSelectedHour(6);
                setSelectedMinute(45);
              } else {
                setSelectedRotation('Mobilization');
              }
            }}
            className="flex items-center gap-1 px-3 py-1.5 text-xs text-zinc-400 hover:text-zinc-200 bg-zinc-800/60 hover:bg-zinc-800 rounded-lg border border-zinc-700/60 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 text-xs text-zinc-300 bg-zinc-800 hover:bg-zinc-700 rounded-lg border border-zinc-700 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              id="confirm-drum-wheel-picker"
              onClick={handleConfirm}
              className="flex items-center gap-1.5 px-5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-lg hover:shadow-indigo-500/20 transition-all cursor-pointer"
            >
              <Check className="w-4 h-4" />
              Apply Selection
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
