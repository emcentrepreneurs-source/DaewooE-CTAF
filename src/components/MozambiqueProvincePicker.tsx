import React, { useState, useMemo, useRef } from 'react';
import {
  MOZAMBIQUE_PROVINCES,
  MOZAMBIQUE_PROJECT_SITES,
  COMMON_MOBILIZATION_ROUTES,
  MozambiqueProvince,
  MozambiqueDistrictOrCity
} from '../utils/mozambiqueLocations';
import { Search, MapPin, ChevronDown, ChevronUp, Plane, Building2, Check, ArrowRight, Compass } from 'lucide-react';

interface MozambiqueProvincePickerProps {
  value?: string;
  onSelect: (locationName: string, provinceName?: string) => void;
  label?: string;
  placeholder?: string;
  showSitesFirst?: boolean;
}

export const MozambiqueProvincePicker: React.FC<MozambiqueProvincePickerProps> = ({
  value = '',
  onSelect,
  label = 'Select Province / Location in Mozambique',
  placeholder = 'Search province, city, airport or site...',
  showSitesFirst = true
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [regionFilter, setRegionFilter] = useState<'All' | 'Sul' | 'Centro' | 'Norte'>('All');
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Filter provinces and locations
  const filteredProvinces = useMemo(() => {
    const q = search.trim().toLowerCase();
    return MOZAMBIQUE_PROVINCES.filter(p => {
      if (regionFilter !== 'All' && p.region !== regionFilter) return false;
      if (!q) return true;
      if (p.name.toLowerCase().includes(q)) return true;
      if (p.capital.toLowerCase().includes(q)) return true;
      if (p.description.toLowerCase().includes(q)) return true;
      return p.keyLocations.some(
        loc =>
          loc.name.toLowerCase().includes(q) ||
          loc.iataCode?.toLowerCase().includes(q) ||
          loc.siteDescription?.toLowerCase().includes(q)
      );
    });
  }, [search, regionFilter]);

  const handleScroll = (direction: 'up' | 'down') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'up' ? -220 : 220;
      scrollContainerRef.current.scrollBy({ top: scrollAmount, behavior: 'smooth' });
    }
  };

  const handleSelectLocation = (locName: string, provName: string) => {
    onSelect(locName, provName);
    setIsOpen(false);
    setSearch('');
  };

  return (
    <div className="relative w-full">
      {label && (
        <label className="block text-[11px] font-medium text-zinc-400 mb-1 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-indigo-400" />
            {label}
          </span>
          <span className="text-[10px] text-zinc-500 font-mono">11 Moz Provinces</span>
        </label>
      )}

      {/* Main Trigger Input Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2 text-xs bg-zinc-800/90 border border-zinc-700 hover:border-indigo-500 rounded-lg text-zinc-100 transition-colors cursor-pointer text-left focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        <div className="flex items-center gap-2 truncate">
          <Compass className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span className={value ? 'font-medium text-zinc-100' : 'text-zinc-500'}>
            {value || placeholder}
          </span>
        </div>
        <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Modal Container */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-zinc-900 border border-zinc-700/80 rounded-xl shadow-2xl overflow-hidden backdrop-blur-md">
          {/* Header & Quick Search */}
          <div className="p-2.5 bg-zinc-950/80 border-b border-zinc-800 space-y-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search Mozambique province, site (OPBL1, Afungi, Pemba)..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-zinc-900 border border-zinc-700 rounded-lg text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
                autoFocus
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200 text-xs"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Region Filters */}
            <div className="flex items-center justify-between gap-1 text-[11px]">
              <div className="flex items-center gap-1">
                {(['All', 'Sul', 'Centro', 'Norte'] as const).map(reg => (
                  <button
                    key={reg}
                    type="button"
                    onClick={() => setRegionFilter(reg)}
                    className={`px-2 py-0.5 rounded-md font-medium transition-colors cursor-pointer ${
                      regionFilter === reg
                        ? 'bg-indigo-600 text-white'
                        : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200'
                    }`}
                  >
                    {reg === 'All' ? 'All (11 Prov.)' : `${reg} Region`}
                  </button>
                ))}
              </div>

              {/* Scroll Controls (Up/Down) */}
              <div className="flex items-center gap-0.5">
                <button
                  type="button"
                  onClick={() => handleScroll('up')}
                  className="p-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
                  title="Scroll Up Provinces"
                >
                  <ChevronUp className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleScroll('down')}
                  className="p-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
                  title="Scroll Down Provinces"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Key Operational Project Sites (Quick Pick) */}
          {showSitesFirst && !search && regionFilter === 'All' && (
            <div className="px-3 py-2 bg-indigo-950/30 border-b border-zinc-800/80">
              <span className="text-[10px] uppercase font-bold text-indigo-300 tracking-wider flex items-center gap-1 mb-1.5">
                <Building2 className="w-3 h-3 text-indigo-400" />
                Top Operational Project Bases
              </span>
              <div className="flex flex-wrap gap-1.5">
                {MOZAMBIQUE_PROJECT_SITES.slice(0, 6).map(site => (
                  <button
                    key={site.id}
                    type="button"
                    onClick={() => handleSelectLocation(site.id, site.province)}
                    className={`px-2 py-0.5 text-[10px] font-medium rounded-md border transition-colors cursor-pointer flex items-center gap-1 ${
                      value === site.id
                        ? 'bg-emerald-600 text-white border-emerald-500'
                        : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border-zinc-700'
                    }`}
                  >
                    <span>{site.name}</span>
                    <span className="text-[9px] text-zinc-400 font-mono">({site.province})</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Scrollable Provinces Container (Scroll Up and Down) */}
          <div
            ref={scrollContainerRef}
            className="max-h-64 overflow-y-auto divide-y divide-zinc-800/80 scroll-smooth p-1"
          >
            {filteredProvinces.length === 0 ? (
              <div className="py-6 text-center text-xs text-zinc-500">
                No Mozambique provinces or locations found matching "{search}"
              </div>
            ) : (
              filteredProvinces.map(prov => (
                <div key={prov.id} className="p-2 space-y-1.5 hover:bg-zinc-800/30 rounded-lg transition-colors">
                  {/* Province Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-zinc-100">{prov.name}</span>
                      <span
                        className={`text-[9px] px-1.5 py-0.2 rounded font-mono ${
                          prov.region === 'Norte'
                            ? 'bg-rose-500/20 text-rose-300'
                            : prov.region === 'Centro'
                            ? 'bg-amber-500/20 text-amber-300'
                            : 'bg-blue-500/20 text-blue-300'
                        }`}
                      >
                        {prov.region}
                      </span>
                    </div>
                    <span className="text-[10px] text-zinc-400 font-mono">Cap: {prov.capital}</span>
                  </div>

                  <p className="text-[10px] text-zinc-400 line-clamp-1">{prov.description}</p>

                  {/* Locations / Cities in this Province */}
                  <div className="flex flex-wrap gap-1 pt-0.5">
                    {prov.keyLocations.map(loc => {
                      const isSelected = value.toUpperCase() === loc.name.toUpperCase();
                      return (
                        <button
                          key={loc.name}
                          type="button"
                          onClick={() => handleSelectLocation(loc.name, prov.name)}
                          className={`px-2 py-0.5 text-[10px] font-medium rounded border transition-colors cursor-pointer flex items-center gap-1 ${
                            isSelected
                              ? 'bg-indigo-600 text-white border-indigo-500 font-bold'
                              : loc.isOperationalSite
                              ? 'bg-indigo-950/40 hover:bg-indigo-900/60 text-indigo-200 border-indigo-800/50'
                              : 'bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 border-zinc-700/60'
                          }`}
                          title={loc.siteDescription || `${loc.name}, ${prov.name}`}
                        >
                          {loc.isAirportHub ? (
                            <Plane className="w-2.5 h-2.5 text-indigo-400" />
                          ) : loc.isOperationalSite ? (
                            <Building2 className="w-2.5 h-2.5 text-emerald-400" />
                          ) : (
                            <MapPin className="w-2.5 h-2.5 text-zinc-400" />
                          )}
                          <span>{loc.name}</span>
                          {loc.iataCode && (
                            <span className="text-[8px] font-mono text-zinc-400">[{loc.iataCode}]</span>
                          )}
                          {isSelected && <Check className="w-2.5 h-2.5 text-white" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer with Common Route Shortcuts */}
          <div className="p-2 bg-zinc-950/90 border-t border-zinc-800 flex items-center justify-between text-[10px] text-zinc-400">
            <span className="font-mono">Quick Mobilization Routes:</span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleSelectLocation('PEMBA', 'Cabo Delgado')}
                className="hover:text-indigo-300 underline cursor-pointer"
              >
                PEMBA
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => handleSelectLocation('AFUNGI', 'Cabo Delgado')}
                className="hover:text-indigo-300 underline cursor-pointer"
              >
                AFUNGI
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => handleSelectLocation('OPBL1', 'Cabo Delgado')}
                className="hover:text-indigo-300 underline cursor-pointer"
              >
                OPBL1
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => handleSelectLocation('MAPUTO', 'Maputo Cidade')}
                className="hover:text-indigo-300 underline cursor-pointer"
              >
                MAPUTO
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
