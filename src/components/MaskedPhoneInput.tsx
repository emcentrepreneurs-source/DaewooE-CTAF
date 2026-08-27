import React, { useState, useMemo } from 'react';
import { Phone, Check, AlertCircle, ChevronDown, Sparkles } from 'lucide-react';
import {
  COUNTRY_PHONE_PRESETS,
  CountryPhoneConfig,
  formatPhoneNumber,
  validatePhoneNumber
} from '../utils/inputMasking';

interface MaskedPhoneInputProps {
  id?: string;
  label?: string;
  value: string;
  onChange: (value: string) => void;
  defaultCountryCode?: string;
  className?: string;
  required?: boolean;
  placeholder?: string;
}

export const MaskedPhoneInput: React.FC<MaskedPhoneInputProps> = ({
  id = 'masked-phone-input',
  label = 'MOBILE NUMBER',
  value,
  onChange,
  defaultCountryCode = '+258',
  className = '',
  required = false,
  placeholder
}) => {
  const [showCountryMenu, setShowCountryMenu] = useState(false);

  // Validate current value
  const validation = useMemo(() => validatePhoneNumber(value), [value]);

  // Determine detected or selected country
  const selectedCountry = useMemo(() => {
    if (validation.country) return validation.country;
    // Check if starts with any country code
    const digits = (value || '').replace(/\D/g, '');
    for (const c of COUNTRY_PHONE_PRESETS) {
      if (digits.startsWith(c.code.replace('+', ''))) {
        return c;
      }
    }
    // Fallback to default
    return COUNTRY_PHONE_PRESETS.find(c => c.code === defaultCountryCode) || COUNTRY_PHONE_PRESETS[0];
  }, [value, validation.country, defaultCountryCode]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const formatted = formatPhoneNumber(raw, selectedCountry.code);
    onChange(formatted);
  };

  const handleSelectCountry = (country: CountryPhoneConfig) => {
    setShowCountryMenu(false);
    // If value already has digits, replace or prefix country code
    const digits = value.replace(/\D/g, '');
    if (digits.length === 0) {
      onChange(`${country.code} `);
    } else {
      // If starts with previous country code digits, replace
      const prevDigits = selectedCountry.code.replace('+', '');
      let national = digits;
      if (digits.startsWith(prevDigits)) {
        national = digits.slice(prevDigits.length);
      }
      const formatted = formatPhoneNumber(`${country.code} ${national}`, country.code);
      onChange(formatted);
    }
  };

  const handleQuickFormat = () => {
    if (!value) return;
    const formatted = formatPhoneNumber(value, selectedCountry.code);
    onChange(formatted);
  };

  return (
    <div className={`relative ${className}`}>
      <div className="flex items-center justify-between mb-1">
        <label htmlFor={id} className="text-[11px] font-medium text-zinc-400 flex items-center gap-1">
          <Phone className="w-3 h-3 text-indigo-400" />
          {label} {required && <span className="text-rose-400">*</span>}
        </label>
        {value && (
          <div className="flex items-center gap-1.5">
            {validation.isValid ? (
              <span className="text-[10px] text-emerald-400 flex items-center gap-0.5 font-mono">
                <Check className="w-3 h-3" />
                {selectedCountry.name}
              </span>
            ) : (
              <span className="text-[10px] text-rose-400 flex items-center gap-0.5">
                <AlertCircle className="w-3 h-3" />
                Format check
              </span>
            )}
          </div>
        )}
      </div>

      <div className="relative flex items-center">
        {/* Country Selector Dropdown Trigger */}
        <button
          type="button"
          onClick={() => setShowCountryMenu(!showCountryMenu)}
          className="flex items-center gap-1 px-2.5 py-1.5 bg-zinc-800 border border-r-0 border-zinc-700 rounded-l-lg text-xs font-mono text-zinc-200 hover:bg-zinc-700/80 transition-colors cursor-pointer select-none"
          title={`Selected: ${selectedCountry.name} (${selectedCountry.code})`}
        >
          <span className="text-sm">{selectedCountry.flag}</span>
          <span className="text-[11px] font-medium">{selectedCountry.code}</span>
          <ChevronDown className="w-3 h-3 text-zinc-400" />
        </button>

        {/* Input */}
        <input
          id={id}
          type="tel"
          value={value}
          onChange={handleInputChange}
          placeholder={placeholder || selectedCountry.placeholder}
          required={required}
          className={`w-full px-2.5 py-1.5 text-xs bg-zinc-800/90 border rounded-r-lg focus:ring-2 focus:ring-indigo-500 font-mono ${
            value && !validation.isValid
              ? 'border-rose-500 text-rose-200 focus:border-rose-500'
              : 'border-zinc-700 text-zinc-100'
          }`}
        />

        {value && (
          <button
            type="button"
            onClick={handleQuickFormat}
            title="Auto-format standard phone number mask"
            className="absolute right-2 text-zinc-400 hover:text-indigo-400 p-0.5 transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Validation error message */}
      {value && !validation.isValid && validation.error && (
        <p className="text-[10px] text-rose-400 mt-1 flex items-center gap-1">
          <AlertCircle className="w-3 h-3 flex-shrink-0" />
          {validation.error}
        </p>
      )}

      {/* Country Dropdown Menu */}
      {showCountryMenu && (
        <>
          <div
            className="fixed inset-0 z-20"
            onClick={() => setShowCountryMenu(false)}
          />
          <div className="absolute left-0 top-full mt-1 w-64 max-h-60 overflow-y-auto bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl z-30 p-1.5 space-y-0.5 animate-in fade-in zoom-in-95 duration-100">
            <div className="px-2 py-1 text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
              Select Country Prefix
            </div>
            {COUNTRY_PHONE_PRESETS.map(c => {
              const isSelected = selectedCountry.code === c.code;
              return (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => handleSelectCountry(c)}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-950/80 text-indigo-200 border border-indigo-700/60 font-medium'
                      : 'text-zinc-300 hover:bg-zinc-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">{c.flag}</span>
                    <span className="text-zinc-200">{c.name}</span>
                  </div>
                  <span className="font-mono text-zinc-400 text-[11px]">{c.code}</span>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};
