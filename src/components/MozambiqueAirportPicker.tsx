import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  MOZAMBIQUE_AIRPORT_SITES,
  MozambiqueAirportSite,
  COMMON_MOBILIZATION_ROUTES
} from '../utils/mozambiqueLocations';
import {
  Plane,
  Building2,
  ChevronDown,
  ChevronUp,
  Search,
  Check,
  Compass,
  MapPin,
  ArrowRight,
  Sparkles
} from 'lucide-react';

interface MozambiqueAirportPickerProps {
  value?: string;
  onSelect: (locationName: string, airport?: MozambiqueAirportSite) => void;
  label?: string;
  placeholder?: string;
  className?: string;
}

export const MozambiqueAirportPicker: React.FC<MozambiqueAirportPickerProps> = ({
  value = '',
  onSelect,
  label = 'Mozambique Airport / Operational Site',
  placeholder = 'Select Mozambican Airport / Base (Scroll ▲/▼)...',
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'All' | 'Project' | 'International' | 'Domestic'>('All');
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Filter airport sites
  const filteredSites = useMemo(() => {
    const q = search.trim().toLowerCase();
    return MOZAMBIQUE_AIRPORT_SITES.filter(site => {
      // Category filter
      if (categoryFilter === 'Project' && !site.isProjectSite) return false;
      if (categoryFilter === 'International' && site.type !== 'International Hub') return false;
      if (
        categoryFilter === 'Domestic' &&
        site.type !== 'Domestic Airport' &&
        site.type !== 'Regional Airstrip'
      ) {
        return false;
      }

      if (!q) return true;
      return (
        site.name.toLowerCase().includes(q) ||
        site.code.toLowerCase().includes(q) ||
        site.fullName.toLowerCase().includes(q) ||
        site.city.toLowerCase().includes(q) ||
        site.province.toLowerCase().includes(q) ||
        site.description.toLowerCase().includes(q)
      );
    });
  }, [search, categoryFilter]);

  // Scroll Up & Down handlers
  const handleScroll = (direction: 'up' | 'down') => {
    if (scrollContainerRef.current) {
      const delta = direction === 'up' ? -180 : 180;
      scrollContainerRef.current.scrollBy({ top: delta, behavior: 'smooth' });
    }
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.moz-airport-picker-container')) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelectSite = (site: MozambiqueAirportSite) => {
    onSelect(site.name, site);
    setIsOpen(false);
    setSearch('');
  };

  return (
    <div className={`relative w-full moz-airport-picker-container ${className}`}>
      {label && (
        <label className="block text-[10px] font-semibold text-zinc-300 mb-1 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Plane className="w-3 h-3 text-indigo-400" />
            {label}
          </span>
          <span className="text-[9px] text-zinc-500 font-mono">
            {MOZAMBIQUE_AIRPORT_SITES.length} Moz Sites w/ Airport
          </span>
        </label>
      )}

      {/* Main Trigger Button */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-2.5 py-1.5 text-xs bg-zinc-800/95 hover:bg-zinc-800 border border-zinc-700 hover:border-indigo-500 rounded-lg text-zinc-100 transition-colors cursor-pointer text-left focus:outline-none focus:ring-2 focus:ring-indigo-500"
        title="Click to open Mozambique Airport scroll list"
      >
        <div className="flex items-center gap-2 truncate">
          <Plane className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span className={value ? 'font-semibold text-zinc-100 font-mono' : 'text-zinc-500'}>
            {value || placeholder}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-[9px] text-zinc-400 font-mono bg-zinc-900 px-1 py-0.5 rounded border border-zinc-800 hidden sm:inline">
            Scroll ▲/▼
          </span>
          <ChevronDown className={`w-3.5 h-3.5 text-zinc-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {/* Dropdown Menu Modal */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl overflow-hidden backdrop-blur-md animate-in fade-in duration-150 min-w-[320px]">
          {/* Header Controls: Search + Category Filters + Scroll Up / Down Buttons */}
          <div className="p-2.5 bg-zinc-950 border-b border-zinc-800 space-y-2">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search Mozambique Airport, code (AFG, POL, MPM) or province..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-zinc-900 border border-zinc-700 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 font-mono"
                autoFocus
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-zinc-400 hover:text-zinc-200 px-1.5 py-0.5 bg-zinc-800 rounded"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Category Tabs & Explicit Scroll Up / Down Controls */}
            <div className="flex items-center justify-between gap-1 text-[10px]">
              <div className="flex items-center gap-1 overflow-x-auto py-0.5">
                <button
                  type="button"
                  onClick={() => setCategoryFilter('All')}
                  className={`px-2 py-0.5 rounded font-medium transition-colors cursor-pointer whitespace-nowrap ${
                    categoryFilter === 'All'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200'
                  }`}
                >
                  All ({MOZAMBIQUE_AIRPORT_SITES.length})
                </button>
                <button
                  type="button"
                  onClick={() => setCategoryFilter('Project')}
                  className={`px-2 py-0.5 rounded font-medium transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                    categoryFilter === 'Project'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-zinc-800 text-emerald-400 hover:bg-zinc-700'
                  }`}
                >
                  <Building2 className="w-2.5 h-2.5" />
                  LNG / Project Bases
                </button>
                <button
                  type="button"
                  onClick={() => setCategoryFilter('International')}
                  className={`px-2 py-0.5 rounded font-medium transition-colors cursor-pointer whitespace-nowrap ${
                    categoryFilter === 'International'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                  }`}
                >
                  International Hubs
                </button>
                <button
                  type="button"
                  onClick={() => setCategoryFilter('Domestic')}
                  className={`px-2 py-0.5 rounded font-medium transition-colors cursor-pointer whitespace-nowrap ${
                    categoryFilter === 'Domestic'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                  }`}
                >
                  Domestic &amp; Strips
                </button>
              </div>

              {/* Scroll Up & Down Arrow Buttons */}
              <div className="flex items-center gap-1 shrink-0 bg-zinc-900 border border-zinc-700 p-0.5 rounded-lg">
                <button
                  type="button"
                  onClick={() => handleScroll('up')}
                  className="p-1 rounded hover:bg-zinc-800 text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
                  title="Scroll Up Mozambique Airport Sites (▲)"
                >
                  <ChevronUp className="w-3.5 h-3.5" />
                </button>
                <span className="text-[9px] text-zinc-500 font-mono">▲▼</span>
                <button
                  type="button"
                  onClick={() => handleScroll('down')}
                  className="p-1 rounded hover:bg-zinc-800 text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
                  title="Scroll Down Mozambique Airport Sites (▼)"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Quick Select Project Bases Bar */}
          {!search && categoryFilter === 'All' && (
            <div className="px-3 py-1.5 bg-emerald-950/30 border-b border-zinc-800 flex items-center justify-between text-[10px]">
              <span className="text-emerald-300 font-semibold flex items-center gap-1">
                <Building2 className="w-3 h-3 text-emerald-400" />
                Key Project Bases:
              </span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {['AFUNGI', 'PEMBA', 'OPBL1', 'PALMA', 'CAMP 9500', 'MAPUTO'].map(hub => {
                  const site = MOZAMBIQUE_AIRPORT_SITES.find(s => s.name === hub);
                  if (!site) return null;
                  const isSel = value.toUpperCase() === hub;
                  return (
                    <button
                      key={hub}
                      type="button"
                      onClick={() => handleSelectSite(site)}
                      className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-medium transition-colors cursor-pointer ${
                        isSel
                          ? 'bg-emerald-600 text-white font-bold'
                          : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                      }`}
                    >
                      {hub} [{site.code}]
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Scrollable Airport Sites List with Up and Down Wheel / Mouse Navigation */}
          <div
            ref={scrollContainerRef}
            className="max-h-64 overflow-y-auto divide-y divide-zinc-800/80 scroll-smooth p-1.5 space-y-0.5"
            tabIndex={0}
            onKeyDown={e => {
              if (e.key === 'ArrowDown') {
                e.preventDefault();
                handleScroll('down');
              } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                handleScroll('up');
              }
            }}
          >
            {filteredSites.length === 0 ? (
              <div className="py-6 text-center text-xs text-zinc-500">
                No Mozambican airport or site found matching "{search}"
                <div className="mt-2">
                  <button
                    type="button"
                    onClick={() => {
                      onSelect(search.toUpperCase());
                      setIsOpen(false);
                    }}
                    className="px-3 py-1 bg-indigo-600 text-white rounded text-xs font-medium hover:bg-indigo-500 cursor-pointer"
                  >
                    Use custom site "{search.toUpperCase()}"
                  </button>
                </div>
              </div>
            ) : (
              filteredSites.map(site => {
                const isSelected =
                  value.toUpperCase() === site.name.toUpperCase() ||
                  value.toUpperCase() === site.code.toUpperCase() ||
                  value.toUpperCase().includes(site.name.toUpperCase());

                return (
                  <button
                    key={`${site.code}-${site.name}`}
                    type="button"
                    onClick={() => handleSelectSite(site)}
                    className={`w-full text-left p-2 rounded-lg transition-colors cursor-pointer flex items-center justify-between gap-2.5 ${
                      isSelected
                        ? 'bg-indigo-600/20 border border-indigo-500 text-white'
                        : 'hover:bg-zinc-800/80 text-zinc-200 border border-transparent'
                    }`}
                  >
                    <div className="flex items-start gap-2.5 min-w-0">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                          site.isProjectSite
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : site.type === 'International Hub'
                            ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                            : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                        }`}
                      >
                        {site.isProjectSite ? (
                          <Building2 className="w-3.5 h-3.5" />
                        ) : (
                          <Plane className="w-3.5 h-3.5" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-xs text-zinc-100 font-mono tracking-wide">
                            {site.name}
                          </span>
                          <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
                            {site.code}
                          </span>
                          <span
                            className={`text-[9px] px-1.5 py-0.2 rounded font-medium ${
                              site.province === 'Cabo Delgado'
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : site.province.includes('Maputo')
                                ? 'bg-blue-500/20 text-blue-300'
                                : 'bg-zinc-800 text-zinc-400'
                            }`}
                          >
                            {site.province}
                          </span>
                        </div>

                        <p className="text-[10px] text-zinc-400 truncate mt-0.5">
                          {site.fullName}
                        </p>
                        <p className="text-[9px] text-zinc-500 line-clamp-1">
                          {site.description}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-1">
                      {isSelected ? (
                        <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-semibold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                          <Check className="w-3 h-3 text-emerald-400" />
                          Selected
                        </span>
                      ) : (
                        <span className="text-[10px] text-zinc-500 hover:text-zinc-300">
                          Select
                        </span>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Footer with Common Mobilization Route Shortcuts */}
          <div className="p-2 bg-zinc-950 border-t border-zinc-800 flex items-center justify-between text-[10px] text-zinc-400">
            <span className="font-mono text-zinc-500">Quick Airports:</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onSelect('MAPUTO')}
                className="hover:text-indigo-300 underline cursor-pointer font-mono"
              >
                MAPUTO [MPM]
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => onSelect('PEMBA')}
                className="hover:text-indigo-300 underline cursor-pointer font-mono"
              >
                PEMBA [POL]
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => onSelect('AFUNGI')}
                className="hover:text-indigo-300 underline cursor-pointer font-mono"
              >
                AFUNGI [AFG]
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => onSelect('NACALA')}
                className="hover:text-indigo-300 underline cursor-pointer font-mono"
              >
                NACALA [MNC]
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
