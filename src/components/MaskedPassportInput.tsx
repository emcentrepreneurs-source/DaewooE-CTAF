import React, { useState, useMemo } from 'react';
import { CreditCard, Check, AlertCircle, Shield, Sparkles } from 'lucide-react';
import {
  DocumentType,
  validateAndFormatPassportOrId,
  formatPassportOrIdInput
} from '../utils/inputMasking';

interface MaskedPassportInputProps {
  id?: string;
  label?: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
  required?: boolean;
  placeholder?: string;
  nationality?: string;
}

export const MaskedPassportInput: React.FC<MaskedPassportInputProps> = ({
  id = 'masked-passport-input',
  label = 'PASSPORT / ID NUMBER',
  value,
  onChange,
  className = '',
  required = true,
  placeholder = 'e.g. 110842918B or M84920194',
  nationality = ''
}) => {
  const isMozambican = nationality.toUpperCase().includes('MOZ');
  const [selectedDocType, setSelectedDocType] = useState<DocumentType>(
    isMozambican ? 'Mozambique BI' : 'Passport'
  );

  // Validate and detect format
  const docValidation = useMemo(
    () => validateAndFormatPassportOrId(value, selectedDocType),
    [value, selectedDocType]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPassportOrIdInput(e.target.value);
    onChange(formatted);
  };

  const handleSetDocType = (type: DocumentType) => {
    setSelectedDocType(type);
    if (value) {
      const sanitized = formatPassportOrIdInput(value);
      onChange(sanitized);
    }
  };

  const handleSanitizeAndFormat = () => {
    if (!value) return;
    const formatted = formatPassportOrIdInput(value);
    onChange(formatted);
  };

  return (
    <div className={`relative ${className}`}>
      <div className="flex items-center justify-between mb-1">
        <label htmlFor={id} className="text-[11px] font-medium text-zinc-400 flex items-center gap-1">
          <CreditCard className="w-3 h-3 text-indigo-400" />
          {label} {required && <span className="text-rose-400">*</span>}
        </label>

        {value && (
          <div className="flex items-center gap-1">
            {docValidation.isValid ? (
              <span className="text-[10px] text-emerald-400 flex items-center gap-0.5 font-mono bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/60">
                <Check className="w-3 h-3" />
                {docValidation.badge}
              </span>
            ) : (
              <span className="text-[10px] text-amber-400 flex items-center gap-0.5 font-mono bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-800/60">
                <AlertCircle className="w-3 h-3" />
                {docValidation.badge}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Quick Document Type Filter Buttons */}
      <div className="flex items-center gap-1 mb-1.5 overflow-x-auto pb-0.5 text-[10px]">
        {(['Passport', 'Mozambique BI', 'DIRE', 'Company ID'] as DocumentType[]).map(type => {
          const isActive = docValidation.docType === type || selectedDocType === type;
          return (
            <button
              key={type}
              type="button"
              onClick={() => handleSetDocType(type)}
              className={`px-2 py-0.5 rounded text-[10px] transition-colors cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-indigo-950 text-indigo-300 border border-indigo-700/60 font-medium'
                  : 'bg-zinc-800/60 text-zinc-400 border border-zinc-800 hover:bg-zinc-800 hover:text-zinc-200'
              }`}
            >
              {type === 'Mozambique BI' ? '🇲🇿 BI' : type === 'Passport' ? '🛂 Passport' : type === 'DIRE' ? '🪪 DIRE' : '🏢 Staff ID'}
            </button>
          );
        })}
      </div>

      <div className="relative flex items-center">
        <input
          id={id}
          type="text"
          value={value}
          onChange={handleInputChange}
          placeholder={
            selectedDocType === 'Mozambique BI'
              ? '110394820K (12 digits + letter)'
              : selectedDocType === 'DIRE'
              ? '01/DIRE/2024 or 12345678/D'
              : selectedDocType === 'Company ID'
              ? 'DW-30190'
              : placeholder
          }
          required={required}
          className={`w-full px-2.5 py-1.5 text-xs bg-zinc-800/90 border rounded-lg focus:ring-2 focus:ring-indigo-500 font-mono tracking-wider uppercase ${
            value && !docValidation.isValid
              ? 'border-rose-500 text-rose-200 focus:border-rose-500'
              : 'border-zinc-700 text-zinc-100'
          }`}
        />

        {value && (
          <button
            type="button"
            onClick={handleSanitizeAndFormat}
            title="Capitalize and sanitize format"
            className="absolute right-2 text-zinc-400 hover:text-indigo-400 p-0.5 transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Validation Message / Helper */}
      {value && !docValidation.isValid && docValidation.error ? (
        <p className="text-[10px] text-rose-400 mt-1 flex items-center gap-1">
          <AlertCircle className="w-3 h-3 flex-shrink-0" />
          {docValidation.error}
        </p>
      ) : docValidation.hint ? (
        <p className="text-[10px] text-zinc-500 mt-1 flex items-center gap-1">
          <Shield className="w-3 h-3 text-indigo-400 flex-shrink-0" />
          {docValidation.hint}
        </p>
      ) : (
        <p className="text-[10px] text-zinc-500 mt-1">Alphanumeric (auto-capitalized)</p>
      )}
    </div>
  );
};
