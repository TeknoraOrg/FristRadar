export interface PasswordValidation {
  valid: boolean;
  errors: string[];
  checks: {
    minLength: boolean;
    hasUppercase: boolean;
    hasNumber: boolean;
  };
}

export function validatePassword(password: string): PasswordValidation {
  const checks = {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasNumber: /[0-9]/.test(password),
  };

  const errors: string[] = [];
  if (!checks.minLength) errors.push('Password must be at least 8 characters');
  if (!checks.hasUppercase) errors.push('Password must contain at least 1 uppercase letter');
  if (!checks.hasNumber) errors.push('Password must contain at least 1 number');

  return { valid: errors.length === 0, errors, checks };
}

export const COUNTRY_CODES = [
  { code: 'DE', dialCode: '+49', name: 'Germany', flag: '🇩🇪' },
  { code: 'AT', dialCode: '+43', name: 'Austria', flag: '🇦🇹' },
  { code: 'CH', dialCode: '+41', name: 'Switzerland', flag: '🇨🇭' },
  { code: 'US', dialCode: '+1', name: 'USA', flag: '🇺🇸' },
  { code: 'GB', dialCode: '+44', name: 'UK', flag: '🇬🇧' },
] as const;

export type CountryCode = typeof COUNTRY_CODES[number]['code'];
