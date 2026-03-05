export async function checkRateLimit(
  kv: KVNamespace,
  key: string,
  maxAttempts: number,
  windowSeconds: number,
): Promise<{ allowed: boolean; remaining: number }> {
  const now = Math.floor(Date.now() / 1000);
  const stored = await kv.get(key);
  let attempts: number[] = stored ? JSON.parse(stored) : [];

  attempts = attempts.filter((ts) => now - ts < windowSeconds);

  if (attempts.length >= maxAttempts) {
    return { allowed: false, remaining: 0 };
  }

  attempts.push(now);
  await kv.put(key, JSON.stringify(attempts), { expirationTtl: windowSeconds });
  return { allowed: true, remaining: maxAttempts - attempts.length };
}
