export interface Country {
  name: string;
  code: string; // ISO 2-letter
  dialCode: string; // e.g. "+234"
  flag: string; // Flag emoji
  placeholder?: string;
  priority?: number;
}

export const COUNTRIES: Country[] = [
  // Primary/Top Matrimonial Hubs
  { name: 'Nigeria', code: 'NG', dialCode: '+234', flag: '🇳🇬', placeholder: '801 234 5678', priority: 1 },
  { name: 'Saudi Arabia', code: 'SA', dialCode: '+966', flag: '🇸🇦', placeholder: '50 123 4567', priority: 2 },
  { name: 'United Kingdom', code: 'GB', dialCode: '+44', flag: '🇬🇧', placeholder: '7911 123456', priority: 3 },
  { name: 'United States', code: 'US', dialCode: '+1', flag: '🇺🇸', placeholder: '202 555 0123', priority: 4 },
  { name: 'Canada', code: 'CA', dialCode: '+1', flag: '🇨🇦', placeholder: '416 555 0199', priority: 5 },
  { name: 'United Arab Emirates', code: 'AE', dialCode: '+971', flag: '🇦🇪', placeholder: '50 123 4567', priority: 6 },
  { name: 'Ghana', code: 'GH', dialCode: '+233', flag: '🇬🇭', placeholder: '24 123 4567', priority: 7 },
  { name: 'Niger', code: 'NE', dialCode: '+227', flag: '🇳🇪', placeholder: '90 12 34 56', priority: 8 },
  { name: 'Egypt', code: 'EG', dialCode: '+20', flag: '🇪🇬', placeholder: '100 123 4567', priority: 9 },
  { name: 'Qatar', code: 'QA', dialCode: '+974', flag: '🇶🇦', placeholder: '3312 3456', priority: 10 },
  { name: 'Malaysia', code: 'MY', dialCode: '+60', flag: '🇲🇾', placeholder: '12 345 6789', priority: 11 },
  { name: 'Turkey', code: 'TR', dialCode: '+90', flag: '🇹🇷', placeholder: '532 123 4567', priority: 12 },
  { name: 'South Africa', code: 'ZA', dialCode: '+27', flag: '🇿🇦', placeholder: '71 123 4567', priority: 13 },
  { name: 'Kenya', code: 'KE', dialCode: '+254', flag: '🇰🇪', placeholder: '712 345678', priority: 14 },
  { name: 'Pakistan', code: 'PK', dialCode: '+92', flag: '🇵🇰', placeholder: '300 1234567', priority: 15 },
  { name: 'India', code: 'IN', dialCode: '+91', flag: '🇮🇳', placeholder: '98123 45678', priority: 16 },

  // Rest of African Countries & Diaspora
  { name: 'Algeria', code: 'DZ', dialCode: '+213', flag: '🇩🇿', placeholder: '551 23 45 67' },
  { name: 'Australia', code: 'AU', dialCode: '+61', flag: '🇦🇺', placeholder: '412 345 678' },
  { name: 'Austria', code: 'AT', dialCode: '+43', flag: '🇦🇹', placeholder: '664 1234567' },
  { name: 'Bahrain', code: 'BH', dialCode: '+973', flag: '🇧🇭', placeholder: '3912 3456' },
  { name: 'Bangladesh', code: 'BD', dialCode: '+880', flag: '🇧🇩', placeholder: '1712 345678' },
  { name: 'Belgium', code: 'BE', dialCode: '+32', flag: '🇧🇪', placeholder: '470 12 34 56' },
  { name: 'Benin', code: 'BJ', dialCode: '+229', flag: '🇧🇯', placeholder: '97 12 34 56' },
  { name: 'Botswana', code: 'BW', dialCode: '+267', flag: '🇧🇼', placeholder: '71 123 456' },
  { name: 'Brazil', code: 'BR', dialCode: '+55', flag: '🇧🇷', placeholder: '11 91234 5678' },
  { name: 'Cameroon', code: 'CM', dialCode: '+237', flag: '🇨🇲', placeholder: '6 71 23 45 67' },
  { name: 'Chad', code: 'TD', dialCode: '+235', flag: '🇹🇩', placeholder: '63 12 34 56' },
  { name: 'China', code: 'CN', dialCode: '+86', flag: '🇨🇳', placeholder: '138 0013 8000' },
  { name: "Cote d'Ivoire", code: 'CI', dialCode: '+225', flag: '🇨🇮', placeholder: '07 12 34 56' },
  { name: 'Denmark', code: 'DK', dialCode: '+45', flag: '🇩🇰', placeholder: '20 12 34 56' },
  { name: 'Ethiopia', code: 'ET', dialCode: '+251', flag: '🇪🇹', placeholder: '91 123 4567' },
  { name: 'Finland', code: 'FI', dialCode: '+358', flag: '🇫🇮', placeholder: '40 1234567' },
  { name: 'France', code: 'FR', dialCode: '+33', flag: '🇫🇷', placeholder: '6 12 34 56 78' },
  { name: 'Gambia', code: 'GM', dialCode: '+220', flag: '🇬🇲', placeholder: '701 2345' },
  { name: 'Germany', code: 'DE', dialCode: '+49', flag: '🇩🇪', placeholder: '151 12345678' },
  { name: 'Guinea', code: 'GN', dialCode: '+224', flag: '🇬🇳', placeholder: '621 12 34 56' },
  { name: 'Indonesia', code: 'ID', dialCode: '+62', flag: '🇮🇩', placeholder: '812 3456 7890' },
  { name: 'Ireland', code: 'IE', dialCode: '+353', flag: '🇮🇪', placeholder: '85 123 4567' },
  { name: 'Italy', code: 'IT', dialCode: '+39', flag: '🇮🇹', placeholder: '320 123 4567' },
  { name: 'Japan', code: 'JP', dialCode: '+81', flag: '🇯🇵', placeholder: '90 1234 5678' },
  { name: 'Jordan', code: 'JO', dialCode: '+962', flag: '🇯🇴', placeholder: '7 9012 3456' },
  { name: 'Kuwait', code: 'KW', dialCode: '+965', flag: '🇰🇼', placeholder: '9012 3456' },
  { name: 'Lebanon', code: 'LB', dialCode: '+961', flag: '🇱🇧', placeholder: '70 123 456' },
  { name: 'Liberia', code: 'LR', dialCode: '+231', flag: '🇱🇷', placeholder: '77 123 456' },
  { name: 'Libya', code: 'LY', dialCode: '+218', flag: '🇱🇾', placeholder: '91 234 5678' },
  { name: 'Mali', code: 'ML', dialCode: '+223', flag: '🇲🇱', placeholder: '65 12 34 56' },
  { name: 'Mauritania', code: 'MR', dialCode: '+222', flag: '🇲🇷', placeholder: '22 12 34 56' },
  { name: 'Morocco', code: 'MA', dialCode: '+212', flag: '🇲🇦', placeholder: '612 34 56 78' },
  { name: 'Netherlands', code: 'NL', dialCode: '+31', flag: '🇳🇱', placeholder: '6 12345678' },
  { name: 'New Zealand', code: 'NZ', dialCode: '+64', flag: '🇳🇿', placeholder: '21 123 4567' },
  { name: 'Norway', code: 'NO', dialCode: '+47', flag: '🇳🇴', placeholder: '412 34 567' },
  { name: 'Oman', code: 'OM', dialCode: '+968', flag: '🇴🇲', placeholder: '9123 4567' },
  { name: 'Poland', code: 'PL', dialCode: '+48', flag: '🇵🇱', placeholder: '512 345 678' },
  { name: 'Portugal', code: 'PT', dialCode: '+351', flag: '🇵🇹', placeholder: '912 345 678' },
  { name: 'Rwanda', code: 'RW', dialCode: '+250', flag: '🇷🇼', placeholder: '788 123 456' },
  { name: 'Senegal', code: 'SN', dialCode: '+221', flag: '🇸🇳', placeholder: '77 123 45 67' },
  { name: 'Sierra Leone', code: 'SL', dialCode: '+232', flag: '🇸🇱', placeholder: '76 123456' },
  { name: 'Singapore', code: 'SG', dialCode: '+65', flag: '🇸🇬', placeholder: '8123 4567' },
  { name: 'Somalia', code: 'SO', dialCode: '+252', flag: '🇸🇴', placeholder: '61 2345678' },
  { name: 'Spain', code: 'ES', dialCode: '+34', flag: '🇪🇸', placeholder: '612 34 56 78' },
  { name: 'Sudan', code: 'SD', dialCode: '+249', flag: '🇸🇩', placeholder: '91 234 5678' },
  { name: 'Sweden', code: 'SE', dialCode: '+46', flag: '🇸🇪', placeholder: '70 123 45 67' },
  { name: 'Switzerland', code: 'CH', dialCode: '+41', flag: '🇨🇭', placeholder: '78 123 45 67' },
  { name: 'Tanzania', code: 'TZ', dialCode: '+255', flag: '🇹🇿', placeholder: '712 345 678' },
  { name: 'Togo', code: 'TG', dialCode: '+228', flag: '🇹🇬', placeholder: '90 12 34 56' },
  { name: 'Tunisia', code: 'TN', dialCode: '+216', flag: '🇹🇳', placeholder: '20 123 456' },
  { name: 'Uganda', code: 'UG', dialCode: '+256', flag: '🇺🇬', placeholder: '712 345678' },
  { name: 'Zambia', code: 'ZM', dialCode: '+260', flag: '🇿🇲', placeholder: '97 1234567' },
  { name: 'Zimbabwe', code: 'ZW', dialCode: '+263', flag: '🇿🇼', placeholder: '71 234 5678' }
];

export const DEFAULT_COUNTRY = COUNTRIES[0]; // Nigeria

export function findCountryByCode(code: string): Country {
  return COUNTRIES.find(c => c.code.toUpperCase() === code.toUpperCase()) || DEFAULT_COUNTRY;
}

export function findCountryByDialCode(dialCode: string): Country | undefined {
  return COUNTRIES.find(c => c.dialCode === dialCode);
}

export function parsePhoneNumber(fullNumber: string): { country: Country; nationalNumber: string } {
  if (!fullNumber) return { country: DEFAULT_COUNTRY, nationalNumber: '' };

  const cleaned = fullNumber.trim();
  // Check if starts with a known dialCode (longest matching first)
  const sorted = [...COUNTRIES].sort((a, b) => b.dialCode.length - a.dialCode.length);
  for (const c of sorted) {
    if (cleaned.startsWith(c.dialCode)) {
      const national = cleaned.slice(c.dialCode.length).trim().replace(/^0+/, '');
      return { country: c, nationalNumber: national };
    }
  }

  // Fallback if starts with 0 or no dial code
  const national = cleaned.replace(/^0+/, '');
  return { country: DEFAULT_COUNTRY, nationalNumber: national };
}
