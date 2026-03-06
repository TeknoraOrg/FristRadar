import Constants from 'expo-constants';
import i18n from '../i18n/i18n';

const API_URL = Constants.expoConfig?.extra?.apiUrl ?? 'https://api.fristradar.de';

interface RequestOptions {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, headers = {} } = options;

  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept-Language': i18n.language,
    ...headers,
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    method,
    headers: requestHeaders,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    let errorMessage = i18n.t('api.errors.serverError', { status: response.status });
    try {
      const errorData = await response.json();
      if (errorData.error) errorMessage = errorData.error;
      if (errorData.message) errorMessage = errorData.message;
    } catch {}
    throw new ApiError(errorMessage, response.status);
  }

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

// ─── Health ──────────────────────────────────────────────────────────────────

export async function healthCheck(): Promise<{ status: string }> {
  return request<{ status: string }>('/api/health');
}

// ─── Auth ────────────────────────────────────────────────────────────────────

interface SendOtpResponse {
  success: boolean;
  data: {
    message: string;
    phone: string;
    expiresInSeconds: number;
    _devOtp?: string;
  };
}

interface VerifyOtpResponse {
  success: boolean;
  data: {
    message: string;
    phone: string;
    verificationToken: string;
  };
}

interface RegisterResponse {
  success: boolean;
  data: {
    message: string;
    user: { id: string; phone: string; phoneVerified: boolean; createdAt: string };
    token: string;
  };
}

export async function sendOtp(phone: string, countryCode = 'DE'): Promise<SendOtpResponse> {
  return request<SendOtpResponse>('/auth/send-otp', {
    method: 'POST',
    body: { phone, countryCode },
  });
}

export async function verifyOtp(phone: string, code: string, countryCode = 'DE'): Promise<VerifyOtpResponse> {
  return request<VerifyOtpResponse>('/auth/verify-otp', {
    method: 'POST',
    body: { phone, code, countryCode },
  });
}

export async function register(
  phone: string,
  password: string,
  verificationToken: string,
  countryCode = 'DE',
): Promise<RegisterResponse> {
  return request<RegisterResponse>('/auth/register', {
    method: 'POST',
    body: { phone, password, verificationToken, countryCode },
  });
}
