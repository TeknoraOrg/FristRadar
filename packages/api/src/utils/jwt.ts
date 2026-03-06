import { SignJWT, jwtVerify, type JWTPayload } from 'jose';

export async function createToken(
  userId: string,
  phone: string,
  secret: string,
  issuer = 'fristradar',
): Promise<string> {
  const key = await importKey(secret);

  return new SignJWT({ sub: userId, phone })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuer(issuer)
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(key);
}

export async function verifyToken(
  token: string,
  secret: string,
  issuer = 'fristradar',
): Promise<JWTPayload | null> {
  try {
    const key = await importKey(secret);
    const { payload } = await jwtVerify(token, key, { issuer });
    return payload;
  } catch {
    return null;
  }
}

async function importKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify'],
  );
}
