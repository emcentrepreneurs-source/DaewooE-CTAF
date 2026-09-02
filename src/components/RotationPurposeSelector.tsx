import React, { useRef, useState, useEffect } from 'react';
import {
  ChevronUp,
  ChevronDown,
  Disc3,
  Check,
  PlaneTakeoff,
  RotateCw,
  Briefcase,
  AlertTriangle,
  PlaneLanding,
  FileCheck,
  MousePointerClick
} from 'lucide-react';
import { PurposeOfTrip } from '../types';
import {
  ROTATION_PURPOSE_OPTIONS,
  RotationPurposeItem,
  normalizeRotationOrPurpose,
  getNextRotationOption
} from '../utils/rotationPurposeOptions';

interface RotationPurposeSelectorProps {
  value: string | PurposeOfTrip;
  onChange: (newValue: PurposeOfTrip) => void;
  onOpenDrumWheel?: () => void;
  id?: string;
  className?: string;
  showChips?: boolean;
}

export const RotationPurposeSelector: React.FC<RotationPurposeSelectorProps> = ({
  value,
  onChange,
  onOpenDrumWheel,
  id = 'rotation-purpose-selector',
  className = '',
  showChips = true
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [animatingDir, setAnimatingDir] = useState<'up' | 'down' | null>(null);

  const currentOption: RotationPurposeItem =
    ROTATION_PURPOSE_OPTIONS.find(
      opt => opt.value === normalizeRotationOrPurpose(value)
    ) || ROTATION_PURPOSE_OPTIONS[0];

  const currentIndex = ROTATION_PURPOSE_OPTIONS.findIndex(
    opt => opt.value === currentOption.value
  );

  const prevOption =
    ROTATION_PURPOSE_OPTIONS[
      (currentIndex - 1 + ROTATION_PURPOSE_OPTIONS.length) %
        ROTATION_PURPOSE_OPTIONS.length
    ];
  const nextOption =
    ROTATION_PURPOSE_OPTIONS[
      (currentIndex + 1) % ROTATION_PURPOSE_OPTIONS.length
    ];

  const handleStep = (direction: 'up' | 'down') => {
    setAnimatingDir(direction);
    const nextVal = getNextRotationOption(value, direction);
    onChange(nextVal);
    setTimeout(() => setAnimatingDir(null), 180);
  };

  // Mouse wheel listener over the widget for automatic scroll up/down
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      handleStep('up');
    } else if (e.deltaY > 0) {
      handleStep('down');
    }
  };

  // Keyboard navigation when focused
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
      e.preventDefault();
      handleStep('up');
    } else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
      e.preventDefault();
      handleStep('down');
    }
  };

  const getIcon = (val: PurposeOfTrip) => {
    switch (val) {
      case 'Mobilization':
        return <PlaneTakeoff className="w-4 h-4 text-emerald-400" />;
      case 'Rotational Leave':
        return <RotateCw className="w-4 h-4 text-indigo-400" />;
      case 'Business Trip':
        return <Briefcase className="w-4 h-4 text-sky-400" />;
      case 'Emergency Leave':
        return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      case 'Demobilization':
        return <PlaneLanding className="w-4 h-4 text-rose-400" />;
      case 'Visa Application':
        return <FileCheck className="w-4 h-4 text-purple-400" />;
      default:
        return <RotateCw className="w-4 h-4 text-indigo-400" />;
    }
  };

  return (
    <div id={id} className={`space-y-2.5 ${className}`}>
      {/* Scroll Up/Down Selection Box */}
      <div
        ref={containerRef}
        onWheel={handleWheel}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        aria-label="Rotation Type / Purpose of Trip - Scroll Up or Down to Change"
        className="relative bg-zinc-950/80 border border-zinc-700/80 hover:border-indigo-500/80 rounded-xl p-2.5 transition-all shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 group select-none cursor-ns-resize"
      >
        <div className="flex items-center justify-between gap-2.5">
          {/* Active Display with Icon & Sublabel */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-700/70 flex items-center justify-center shrink-0 shadow-inner group-hover:scale-105 transition-transform">
              {getIcon(currentOption.value)}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-zinc-100 truncate tracking-wide">
                  {currentOption.label}
                </span>
                <span
                  className={`px-1.5 py-0.2 text-[9.5px] font-mono font-bold rounded-md border ${currentOption.badgeBg}`}
                >
                  {currentOption.tag}
                </span>
                <span className="text-[10px] text-zinc-500 font-mono hidden sm:inline">
                  (Option {currentIndex + 1} of {ROTATION_PURPOSE_OPTIONS.length})
                </span>
              </div>
              <p className="text-[10.5px] text-zinc-400 truncate mt-0.5">
                {currentOption.description}
              </p>
            </div>
          </div>

          {/* Up / Down Controls & Drum Wheel Trigger */}
          <div className="flex items-center gap-1 shrink-0 bg-zinc-900/90 border border-zinc-800 p-1 rounded-lg">
            {/* Scroll Up Button */}
            <button
              type="button"
              id={`${id}-scroll-up-btn`}
              onClick={() => handleStep('up')}
              className="p-1 text-zinc-400 hover:text-white hover:bg-zinc-800 active:bg-indigo-600 rounded transition-colors cursor-pointer"
              title={`Previous: ${prevOption.label} (Scroll Up / Click)`}
            >
              <ChevronUp className="w-4 h-4" />
            </button>

            {/* Scroll Down Button */}
            <button
              type="button"
              id={`${id}-scroll-down-btn`}
              onClick={() => handleStep('down')}
              className="p-1 text-zinc-400 hover:text-white hover:bg-zinc-800 active:bg-indigo-600 rounded transition-colors cursor-pointer"
              title={`Next: ${nextOption.label} (Scroll Down / Click)`}
            >
              <ChevronDown className="w-4 h-4" />
            </button>

            {/* Drum Wheel Modal Launcher */}
            {onOpenDrumWheel && (
              <button
                type="button"
                id={`${id}-drum-wheel-modal-btn`}
                onClick={onOpenDrumWheel}
                className="p-1 text-indigo-400 hover:text-indigo-200 hover:bg-indigo-950/70 border border-indigo-700/50 rounded transition-colors cursor-pointer ml-1"
                title="Open 3D Drum Wheel Picker Modal"
              >
                <Disc3 className="w-3.5 h-3.5 animate-spin-slow" />
              </button>
            )}
          </div>
        </div>

        {/* Scroll Helper Bar on Hover */}
        <div className="mt-1.5 pt-1.5 border-t border-zinc-800/60 flex items-center justify-between text-[10px] text-zinc-500">
          <div className="flex items-center gap-1.5">
            <span className="text-indigo-400 font-mono">▲/▼</span>
            <span>Scroll mouse wheel or click arrows to cycle through the 5 options</span>
          </div>
          <span className="italic text-zinc-400 hidden md:inline">
            Auto-syncs Rotation Type & Purpose
          </span>
        </div>
      </div>

      {/* 5-Choice Quick Buttons Grid */}
      {showChips && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
          {ROTATION_PURPOSE_OPTIONS.map((opt, idx) => {
            const isSelected = opt.value === currentOption.value;
            return (
              <button
                key={opt.value}
                type="button"
                id={`${id}-chip-${idx}`}
                onClick={() => onChange(opt.value)}
                className={`flex items-center justify-between px-2.5 py-1.5 text-xs rounded-lg border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'border-indigo-500 bg-indigo-950/70 text-indigo-100 font-medium shadow-sm ring-1 ring-indigo-500/50'
                    : 'border-zinc-800 bg-zinc-950/60 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/80 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center gap-1.5 truncate">
                  <span
                    className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                      isSelected ? 'bg-indigo-400' : 'bg-zinc-600'
                    }`}
                  />
                  <span className="truncate">{opt.label}</span>
                </div>
                {isSelected && (
                  <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0 ml-1" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
