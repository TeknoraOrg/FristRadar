import type { Database } from '../db';
import { sessions } from '../db/schema';

export async function hashToken(token: string): Promise<string> {
  const data = new TextEncoder().encode(token);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export function detectDeviceType(userAgent: string | null): string | null {
  if (!userAgent) return null;
  const ua = userAgent.toLowerCase();
  if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) return 'mobile';
  if (ua.includes('tablet') || ua.includes('ipad')) return 'tablet';
  return 'desktop';
}

export function parseDeviceName(userAgent: string | null): string | null {
  if (!userAgent) return null;
  if (userAgent.includes('iPhone')) return 'iPhone';
  if (userAgent.includes('iPad')) return 'iPad';
  if (userAgent.includes('Android')) return 'Android Device';
  if (userAgent.includes('Windows')) return 'Windows PC';
  if (userAgent.includes('Macintosh')) return 'Mac';
  return 'Unknown Device';
}

export interface SessionLogEvent {
  event: 'session_created' | 'session_refreshed' | 'session_activity' | 'session_revoked' | 'session_expired' | 'auth_failed' | 'blacklist_hit';
  userId: string;
  sessionId: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export function logSessionEvent(event: SessionLogEvent): void {
  console.log(JSON.stringify({
    level: 'info',
    service: 'fristradar-api',
    component: 'session',
    ...event,
  }));
}

export function decodeBase64Url(base64url: string): string {
  let base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
  const pad = base64.length % 4;
  if (pad) base64 += '='.repeat(4 - pad);
  return atob(base64);
}

export interface CreateSessionParams {
  db: Database;
  accessToken: string;
  refreshToken: string;
  userId: string;
  userAgent: string | null;
  ipAddress: string | null;
  eventName?: 'session_created' | 'session_refreshed';
  metadata?: Record<string, unknown>;
}

export async function createSessionRecord(params: CreateSessionParams): Promise<string> {
  const { db, accessToken, refreshToken, userId, userAgent, ipAddress, eventName = 'session_created', metadata } = params;

  const tokenHash = await hashToken(accessToken);
  const refreshTokenHash = await hashToken(refreshToken);

  let expiresAt: string;
  try {
    const payload = JSON.parse(decodeBase64Url(accessToken.split('.')[1]));
    expiresAt = new Date(payload.exp * 1000).toISOString();
  } catch {
    expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();
  }

  await db.insert(sessions).values({
    id: tokenHash,
    userId,
    expiresAt,
    refreshTokenHash,
    deviceType: detectDeviceType(userAgent),
    deviceName: parseDeviceName(userAgent),
    ipAddress,
    userAgent,
    lastActivityAt: new Date().toISOString(),
  });

  logSessionEvent({
    event: eventName,
    userId,
    sessionId: tokenHash.slice(0, 8),
    timestamp: new Date().toISOString(),
    metadata: { deviceType: detectDeviceType(userAgent), ipAddress, ...metadata },
  });

  return tokenHash;
}
