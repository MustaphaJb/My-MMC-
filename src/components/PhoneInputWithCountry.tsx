import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown, Search, X, Check } from 'lucide-react';
import { COUNTRIES, Country, DEFAULT_COUNTRY, findCountryByCode, parsePhoneNumber } from '../data/countries';

interface PhoneInputWithCountryProps {
  value: string;
  onChange: (fullNumber: string, country: Country) => void;
  onCountryChange?: (country: Country) => void;
  defaultCountryCode?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  id?: string;
  name?: string;
  className?: string;
}

export const PhoneInputWithCountry: React.FC<PhoneInputWithCountryProps> = ({
  value,
  onChange,
  onCountryChange,
  defaultCountryCode = 'NG',
  placeholder,
  required = false,
  disabled = false,
  id,
  name,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const numberInputRef = useRef<HTMLInputElement>(null);

  // Initialize selected country & national number from value or default
  const [selectedCountry, setSelectedCountry] = useState<Country>(() => {
    if (value && value.startsWith('+')) {
      const parsed = parsePhoneNumber(value);
      return parsed.country;
    }
    return findCountryByCode(defaultCountryCode);
  });

  const [nationalNumber, setNationalNumber] = useState<string>(() => {
    if (value) {
      if (value.startsWith('+')) {
        const parsed = parsePhoneNumber(value);
        return parsed.nationalNumber;
      }
      return value.replace(/^0+/, '');
    }
    return '';
  });

  // Keep state in sync if value prop changes from outside
  useEffect(() => {
    if (value) {
      if (value.startsWith('+')) {
        const parsed = parsePhoneNumber(value);
        if (parsed.country.code !== selectedCountry.code) {
          setSelectedCountry(parsed.country);
        }
        setNationalNumber(parsed.nationalNumber);
      } else {
        const cleaned = value.replace(/^0+/, '');
        setNationalNumber(cleaned);
      }
    } else {
      setNationalNumber('');
    }
  }, [value]);

  // Click outside listener to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Focus search input when opened
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Filtered countries based on search
  const filteredCountries = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return COUNTRIES;
    return COUNTRIES.filter(
      c =>
        c.name.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q) ||
        c.dialCode.includes(q)
    );
  }, [searchQuery]);

  const handleCountrySelect = (country: Country) => {
    setSelectedCountry(country);
    setIsOpen(false);
    setSearchQuery('');
    
    // Notify country change
    if (onCountryChange) {
      onCountryChange(country);
    }

    // Build new full number
    const cleanedDigits = nationalNumber.replace(/\D/g, '');
    const fullNumber = cleanedDigits ? `${country.dialCode}${cleanedDigits}` : '';
    onChange(fullNumber, country);

    // Re-focus phone input
    setTimeout(() => {
      numberInputRef.current?.focus();
    }, 50);
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;

    // Check if user pasted an international number starting with +
    if (rawVal.startsWith('+')) {
      const parsed = parsePhoneNumber(rawVal);
      setSelectedCountry(parsed.country);
      setNationalNumber(parsed.nationalNumber);
      if (onCountryChange) onCountryChange(parsed.country);
      const digitsOnly = parsed.nationalNumber.replace(/\D/g, '');
      const full = digitsOnly ? `${parsed.country.dialCode}${digitsOnly}` : '';
      onChange(full, parsed.country);
      return;
    }

    // Regular typing: strip non-digits except spaces/dashes
    let sanitized = rawVal.replace(/[^\d\s-]/g, '');
    // Strip leading 0 if present (e.g. 08012345678 -> 8012345678)
    if (sanitized.startsWith('0')) {
      sanitized = sanitized.replace(/^0+/, '');
    }

    setNationalNumber(sanitized);
    const digitsOnly = sanitized.replace(/\D/g, '');
    const fullNumber = digitsOnly ? `${selectedCountry.dialCode}${digitsOnly}` : '';
    onChange(fullNumber, selectedCountry);
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div className="flex items-stretch rounded-xl border border-white/10 bg-white/5 focus-within:border-[#c5a059] focus-within:ring-2 focus-within:ring-[#c5a059]/40 backdrop-blur-sm transition overflow-hidden">
        {/* Country Flag & Dial Code Selector Button */}
        <button
          type="button"
          id={id ? `${id}-country-btn` : 'country-code-select-btn'}
          disabled={disabled}
          onClick={() => setIsOpen(prev => !prev)}
          className="flex items-center gap-1.5 px-3 py-2.5 bg-black/20 hover:bg-white/10 text-white border-r border-white/10 transition shrink-0 focus:outline-none focus:bg-white/10"
          title={`Selected country: ${selectedCountry.name} (${selectedCountry.dialCode})`}
        >
          <span className="text-xl leading-none select-none" role="img" aria-label={selectedCountry.name}>
            {selectedCountry.flag}
          </span>
          <span className="font-mono text-xs font-semibold text-white/90">
            {selectedCountry.dialCode}
          </span>
          <ChevronDown
            className={`w-3.5 h-3.5 text-white/50 transition-transform duration-200 ${
              isOpen ? 'rotate-180 text-[#c5a059]' : ''
            }`}
          />
        </button>

        {/* National Phone Number Input */}
        <div className="relative flex-1 flex items-center">
          <input
            ref={numberInputRef}
            type="tel"
            id={id}
            name={name}
            required={required}
            disabled={disabled}
            value={nationalNumber}
            onChange={handleNumberChange}
            placeholder={placeholder || selectedCountry.placeholder || '801 234 5678'}
            className="w-full h-full px-3.5 py-2.5 bg-transparent text-white placeholder-white/30 text-sm focus:outline-none font-mono"
            autoComplete="tel-national"
          />
          {nationalNumber && (
            <button
              type="button"
              onClick={() => {
                setNationalNumber('');
                onChange('', selectedCountry);
                numberInputRef.current?.focus();
              }}
              className="mr-2.5 p-1 rounded-md text-white/40 hover:text-white/80 hover:bg-white/10 transition"
              title="Clear phone number"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Floating Dropdown Country Selector */}
      {isOpen && (
        <div className="absolute left-0 top-full mt-2 w-72 sm:w-80 max-w-[90vw] bg-[#031c17]/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95">
          {/* Header & Search Bar */}
          <div className="p-3 border-b border-white/10 space-y-2 bg-black/20">
            <div className="flex items-center justify-between text-xs font-semibold text-white/70">
              <span className="flex items-center gap-1.5 text-[#c5a059]">
                <span>Select Country & Dial Code</span>
              </span>
              <span className="text-[10px] font-mono text-white/40">
                {filteredCountries.length} countries
              </span>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search country or code (e.g. Nigeria, +234, SA)..."
                className="w-full pl-9 pr-8 py-2 rounded-xl bg-white/10 border border-white/10 text-white placeholder-white/40 text-xs focus:outline-none focus:ring-1 focus:ring-[#c5a059]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Scrollable Countries List */}
          <div className="max-h-60 overflow-y-auto divide-y divide-white/5 text-xs py-1">
            {filteredCountries.length === 0 ? (
              <div className="py-6 text-center text-white/40 text-xs">
                No matching country found for "{searchQuery}"
              </div>
            ) : (
              filteredCountries.map(c => {
                const isSelected = c.code === selectedCountry.code;
                return (
                  <button
                    key={`${c.code}-${c.dialCode}`}
                    type="button"
                    onClick={() => handleCountrySelect(c)}
                    className={`w-full px-3.5 py-2.5 flex items-center justify-between transition text-left ${
                      isSelected
                        ? 'bg-[#c5a059]/20 text-[#c5a059] font-semibold'
                        : 'text-white/80 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <span className="text-xl leading-none select-none" role="img" aria-label={c.name}>
                        {c.flag}
                      </span>
                      <span className="truncate">{c.name}</span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      <span className="font-mono text-[11px] text-white/50 font-medium">
                        {c.dialCode}
                      </span>
                      {isSelected && (
                        <Check className="w-4 h-4 text-[#c5a059]" />
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Quick Footer info */}
          <div className="px-3.5 py-2 bg-black/40 border-t border-white/10 text-[10px] text-white/50 flex items-center justify-between">
            <span>Current: {selectedCountry.flag} {selectedCountry.name}</span>
            <span className="font-mono text-[#c5a059]">{selectedCountry.dialCode}</span>
          </div>
        </div>
      )}
    </div>
  );
};
