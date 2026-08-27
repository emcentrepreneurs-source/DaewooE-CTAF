import React, { useRef, useEffect, useCallback } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

export interface DrumOption {
  value: string | number;
  label: string;
  sublabel?: string;
}

interface DrumWheelColumnProps {
  id?: string;
  label?: string;
  options: DrumOption[];
  selectedValue: string | number;
  onSelect: (value: string | number) => void;
  height?: number; // Total container height, default 200px
  itemHeight?: number; // Single item height, default 40px
  visibleCount?: number; // Number of items visible at once (odd number, e.g. 5)
  className?: string;
}

export const DrumWheelColumn: React.FC<DrumWheelColumnProps> = ({
  id,
  label,
  options,
  selectedValue,
  onSelect,
  height = 200,
  itemHeight = 40,
  visibleCount = 5,
  className = ''
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const startYRef = useRef(0);
  const startScrollTopRef = useRef(0);
  const scrollTimeoutRef = useRef<number | null>(null);

  const selectedIndex = options.findIndex(opt => String(opt.value) === String(selectedValue));
  const activeIndex = selectedIndex >= 0 ? selectedIndex : 0;

  // Center the selected item on mount or when selectedValue changes from outside
  useEffect(() => {
    if (!containerRef.current || isDraggingRef.current) return;
    const targetScroll = activeIndex * itemHeight;
    if (Math.abs(containerRef.current.scrollTop - targetScroll) > 2) {
      containerRef.current.scrollTo({
        top: targetScroll,
        behavior: 'smooth'
      });
    }
  }, [activeIndex, itemHeight]);

  // Snap to nearest item after scroll finishes
  const snapToNearest = useCallback(() => {
    if (!containerRef.current) return;
    const currentScroll = containerRef.current.scrollTop;
    const nearestIndex = Math.round(currentScroll / itemHeight);
    const clampedIndex = Math.max(0, Math.min(options.length - 1, nearestIndex));
    
    containerRef.current.scrollTo({
      top: clampedIndex * itemHeight,
      behavior: 'smooth'
    });

    if (options[clampedIndex] && String(options[clampedIndex].value) !== String(selectedValue)) {
      onSelect(options[clampedIndex].value);
    }
  }, [itemHeight, options, onSelect, selectedValue]);

  const handleScroll = () => {
    if (scrollTimeoutRef.current) {
      window.clearTimeout(scrollTimeoutRef.current);
    }
    // Set debounced snap
    scrollTimeoutRef.current = window.setTimeout(() => {
      snapToNearest();
    }, 120);
  };

  // Mouse wheel handler for crisp discrete clicks
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (!containerRef.current) return;
    const delta = e.deltaY > 0 ? 1 : -1;
    const nextIndex = Math.max(0, Math.min(options.length - 1, activeIndex + delta));
    if (options[nextIndex]) {
      onSelect(options[nextIndex].value);
    }
  };

  // Mouse drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    startYRef.current = e.clientY;
    if (containerRef.current) {
      startScrollTopRef.current = containerRef.current.scrollTop;
    }
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDraggingRef.current || !containerRef.current) return;
    const deltaY = e.clientY - startYRef.current;
    containerRef.current.scrollTop = startScrollTopRef.current - deltaY;
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', handleMouseUp);
    snapToNearest();
  };

  // Up/Down step buttons
  const stepUp = () => {
    const prevIndex = Math.max(0, activeIndex - 1);
    if (options[prevIndex]) {
      onSelect(options[prevIndex].value);
    }
  };

  const stepDown = () => {
    const nextIndex = Math.min(options.length - 1, activeIndex + 1);
    if (options[nextIndex]) {
      onSelect(options[nextIndex].value);
    }
  };

  // Half padding so the first and last items can align exactly with the center focus slot
  const paddingY = (height - itemHeight) / 2;

  return (
    <div className={`flex flex-col items-center select-none ${className}`}>
      {label && (
        <span className="text-[10px] font-semibold tracking-wider text-zinc-400 uppercase mb-1">
          {label}
        </span>
      )}

      {/* Step up button */}
      <button
        type="button"
        onClick={stepUp}
        aria-label={`Previous ${label || 'option'}`}
        className="p-1 text-zinc-500 hover:text-indigo-300 hover:bg-zinc-800/80 rounded transition-colors cursor-pointer mb-0.5"
      >
        <ChevronUp className="w-3.5 h-3.5" />
      </button>

      {/* Drum Cylinder Container */}
      <div
        id={id}
        className="relative w-full overflow-hidden bg-zinc-950/70 rounded-xl border border-zinc-800/90 shadow-inner"
        style={{ height }}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
      >
        {/* Center Selection Lens / Glass Bar */}
        <div
          className="absolute left-0 right-0 pointer-events-none z-10 border-y border-indigo-500/40 bg-indigo-950/25 backdrop-blur-[1px] shadow-[0_0_12px_rgba(99,102,241,0.12)]"
          style={{
            top: paddingY,
            height: itemHeight
          }}
        />

        {/* Top 3D Cylinder Fade Mask */}
        <div
          className="absolute top-0 left-0 right-0 pointer-events-none z-20 bg-gradient-to-b from-zinc-950 via-zinc-950/80 to-transparent"
          style={{ height: paddingY }}
        />

        {/* Bottom 3D Cylinder Fade Mask */}
        <div
          className="absolute bottom-0 left-0 right-0 pointer-events-none z-20 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent"
          style={{ height: paddingY }}
        />

        {/* Scrollable Items List */}
        <div
          ref={containerRef}
          onScroll={handleScroll}
          className="w-full h-full overflow-y-auto overflow-x-hidden scrollbar-none cursor-grab active:cursor-grabbing"
          style={{
            paddingTop: paddingY,
            paddingBottom: paddingY,
            scrollSnapType: 'y proximity'
          }}
        >
          {options.map((option, idx) => {
            const isSelected = idx === activeIndex;
            const distance = Math.abs(idx - activeIndex);

            // Compute 3D cylinder tilt & scale
            const opacity = isSelected ? 1 : Math.max(0.2, 1 - distance * 0.35);
            const scale = isSelected ? 1.06 : Math.max(0.85, 1 - distance * 0.08);

            return (
              <div
                key={option.value}
                onClick={() => onSelect(option.value)}
                style={{
                  height: itemHeight,
                  opacity,
                  transform: `scale(${scale})`,
                  transition: isDraggingRef.current ? 'none' : 'all 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
                  scrollSnapAlign: 'center'
                }}
                className={`flex items-center justify-center px-2 text-center transition-colors cursor-pointer ${
                  isSelected
                    ? 'text-indigo-200 font-bold text-base tracking-wide'
                    : 'text-zinc-400 font-medium text-xs hover:text-zinc-200'
                }`}
              >
                <span className="truncate">{option.label}</span>
                {option.sublabel && (
                  <span className="text-[9px] text-zinc-500 ml-1">
                    {option.sublabel}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Step down button */}
      <button
        type="button"
        onClick={stepDown}
        aria-label={`Next ${label || 'option'}`}
        className="p-1 text-zinc-500 hover:text-indigo-300 hover:bg-zinc-800/80 rounded transition-colors cursor-pointer mt-0.5"
      >
        <ChevronDown className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
