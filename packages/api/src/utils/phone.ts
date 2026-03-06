const COUNTRY_CODES: Record<string, string> = {
  DE: '49',
  AT: '43',
  CH: '41',
  US: '1',
  GB: '44',
};

type PhoneOk = { ok: true; phone: string };
type PhoneErr = { ok: false; error: string };
export type PhoneResult = PhoneOk | PhoneErr;

export function toE164(raw: unknown, countryCode = 'DE'): PhoneResult {
  if (typeof raw !== 'string') {
    return { ok: false, error: 'Phone number must be a string' };
  }

  let cleaned = raw.replace(/[\s\-().]/g, '');

  if (cleaned.length === 0) {
    return { ok: false, error: 'Phone number is required' };
  }

  if (cleaned.startsWith('+')) {
    if (!/^\+[1-9]\d{6,14}$/.test(cleaned)) {
      return { ok: false, error: 'Invalid E.164 phone number format' };
    }
    return { ok: true, phone: cleaned };
  }

  if (cleaned.startsWith('00')) {
    cleaned = cleaned.slice(2);
    if (!/^[1-9]\d{6,14}$/.test(cleaned)) {
      return { ok: false, error: 'Invalid phone number after international prefix' };
    }
    return { ok: true, phone: `+${cleaned}` };
  }

  const cc = COUNTRY_CODES[countryCode.toUpperCase()];
  if (!cc) {
    return { ok: false, error: `Unsupported country code: ${countryCode}` };
  }

  if (cleaned.startsWith('0')) {
    cleaned = cleaned.slice(1);
  }

  const e164 = `+${cc}${cleaned}`;
  if (!/^\+[1-9]\d{6,14}$/.test(e164)) {
    return { ok: false, error: 'Phone number is too short or too long' };
  }

  return { ok: true, phone: e164 };
}
