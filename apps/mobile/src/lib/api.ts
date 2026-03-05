import Constants from 'expo-constants';
import i18n from '../i18n/i18n';
import { getAccessToken, getRefreshToken, updateTokens, clearTokens, getDeviceId } from './tokenStorage';
import type { User, UpdateUserInput, ApiResponse } from '../types';

const API_URL = Constants.expoConfig?.extra?.apiUrl ?? 'https://api.fristradar.de';

interface TokenResponse {
  access_token: string;
  refresh_token: string;
  user: User;
}

interface RequestOptions {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
  skipAuth?: boolean;
}

let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

async function refreshAccessToken(): Promise<boolean> {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) return false;

  try {
    const deviceId = await getDeviceId();
    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken, device_id: deviceId }),
    });

    if (!response.ok) {
      await clearTokens();
      return false;
    }

    const data = await response.json();
    if (data.access_token && data.refresh_token) {
      await updateTokens(data.access_token, data.refresh_token);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, headers = {}, skipAuth = false } = options;

  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept-Language': i18n.language,
    ...headers,
  };

  if (!skipAuth) {
    const token = await getAccessToken();
    if (token) {
      requestHeaders['Authorization'] = `Bearer ${token}`;
    }
  }

  let response = await fetch(`${API_URL}${endpoint}`, {
    method,
    headers: requestHeaders,
    body: body ? JSON.stringify(body) : undefined,
  });

  // Handle 401 - attempt token refresh
  if (response.status === 401 && !skipAuth) {
    if (!isRefreshing) {
      isRefreshing = true;
      refreshPromise = refreshAccessToken();
    }

    const refreshed = await refreshPromise;
    isRefreshing = false;
    refreshPromise = null;

    if (refreshed) {
      const newToken = await getAccessToken();
      if (newToken) {
        requestHeaders['Authorization'] = `Bearer ${newToken}`;
      }
      response = await fetch(`${API_URL}${endpoint}`, {
        method,
        headers: requestHeaders,
        body: body ? JSON.stringify(body) : undefined,
      });
    } else {
      await clearTokens();
      throw new ApiError('Session expired', 401);
    }
  }

  if (!response.ok) {
    let errorMessage = i18n.t('api.errors.serverError', { status: response.status });
    try {
      const errorData = await response.json();
      if (errorData.error) errorMessage = errorData.error;
      if (errorData.message) errorMessage = errorData.message;
    } catch {}
    throw new ApiError(errorMessage, response.status);
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

// ─── Auth ────────────────────────────────────────────────────────────────────

export async function register(params: {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
}): Promise<TokenResponse> {
  const deviceId = await getDeviceId();
  return request<TokenResponse>('/auth/register', {
    method: 'POST',
    body: { ...params, device_id: deviceId },
    skipAuth: true,
  });
}

export async function login(email: string, password: string): Promise<TokenResponse> {
  const deviceId = await getDeviceId();
  return request<TokenResponse>('/auth/login', {
    method: 'POST',
    body: { email, password, device_id: deviceId },
    skipAuth: true,
  });
}

export async function logout(): Promise<void> {
  try {
    await request<void>('/auth/logout', { method: 'POST' });
  } finally {
    await clearTokens();
  }
}

export async function logoutAll(): Promise<void> {
  try {
    await request<void>('/auth/logout-all', { method: 'POST' });
  } finally {
    await clearTokens();
  }
}

// ─── User ────────────────────────────────────────────────────────────────────

export async function getMe(): Promise<User> {
  return request<User>('/auth/me');
}

export async function updateMe(data: UpdateUserInput): Promise<User> {
  return request<User>('/auth/me', {
    method: 'PATCH',
    body: data,
  });
}

// ─── Password ────────────────────────────────────────────────────────────────

export async function forgotPassword(email: string): Promise<ApiResponse<null>> {
  return request<ApiResponse<null>>('/auth/forgot-password', {
    method: 'POST',
    body: { email },
    skipAuth: true,
  });
}

export async function resetPassword(token: string, password: string): Promise<TokenResponse> {
  const deviceId = await getDeviceId();
  return request<TokenResponse>('/auth/reset-password', {
    method: 'POST',
    body: { token, password, device_id: deviceId },
    skipAuth: true,
  });
}

// ─── Verification ────────────────────────────────────────────────────────────

export async function verifyOtp(email: string, code: string): Promise<TokenResponse> {
  const deviceId = await getDeviceId();
  return request<TokenResponse>('/auth/verify-otp', {
    method: 'POST',
    body: { email, code, device_id: deviceId },
    skipAuth: true,
  });
}

export async function resendVerification(email: string): Promise<ApiResponse<null>> {
  return request<ApiResponse<null>>('/auth/resend-verification', {
    method: 'POST',
    body: { email },
    skipAuth: true,
  });
}

// ─── Token refresh (exposed for external use) ───────────────────────────────

export async function refreshToken(): Promise<TokenResponse> {
  const refreshTok = await getRefreshToken();
  const deviceId = await getDeviceId();
  return request<TokenResponse>('/auth/refresh', {
    method: 'POST',
    body: { refresh_token: refreshTok, device_id: deviceId },
    skipAuth: true,
  });
}
