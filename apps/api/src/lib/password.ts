const ALGORITHM = 'PBKDF2';
const HASH_FUNCTION = 'SHA-256';
const ITERATIONS = 100_000;
const SALT_BYTES = 16;
const KEY_BYTES = 32;

function toBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function fromBase64(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES));
  const keyMaterial = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(password), ALGORITHM, false, ['deriveBits'],
  );
  const derivedBits = await crypto.subtle.deriveBits(
    { name: ALGORITHM, salt, iterations: ITERATIONS, hash: HASH_FUNCTION },
    keyMaterial, KEY_BYTES * 8,
  );
  return `pbkdf2:${ITERATIONS}:${toBase64(salt.buffer.slice(salt.byteOffset, salt.byteOffset + salt.byteLength))}:${toBase64(derivedBits)}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parts = stored.split(':');
  if (parts.length !== 4 || parts[0] !== 'pbkdf2') return false;

  const iterations = parseInt(parts[1], 10);
  const salt = fromBase64(parts[2]);
  const expectedHash = fromBase64(parts[3]);

  const keyMaterial = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(password), ALGORITHM, false, ['deriveBits'],
  );
  const derivedBits = await crypto.subtle.deriveBits(
    { name: ALGORITHM, salt, iterations, hash: HASH_FUNCTION },
    keyMaterial, expectedHash.length * 8,
  );

  const derivedArray = new Uint8Array(derivedBits);
  if (derivedArray.length !== expectedHash.length) return false;
  let diff = 0;
  for (let i = 0; i < derivedArray.length; i++) {
    diff |= derivedArray[i] ^ expectedHash[i];
  }
  return diff === 0;
}
