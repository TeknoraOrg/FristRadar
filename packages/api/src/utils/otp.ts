export function generateOTP(): string {
  const buf = crypto.getRandomValues(new Uint8Array(4));
  const num = new DataView(buf.buffer).getUint32(0);
  return String(100_000 + (num % 900_000));
}

export function isExpired(expiresAtISO: string): boolean {
  return new Date(expiresAtISO).getTime() <= Date.now();
}
