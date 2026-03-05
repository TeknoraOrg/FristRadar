import React, { createContext, useContext, ReactNode } from 'react';
import { useAuth, type AuthStatus } from '../hooks/useAuth';
import type { User, UpdateUserInput } from '../types';

interface AuthContextType {
  status: AuthStatus;
  user: User | null;
  pendingEmail: string | null;
  signIn: (email: string, password: string) => Promise<User>;
  signUp: (params: { email: string; password: string; first_name: string; last_name: string }) => Promise<void>;
  signOut: () => Promise<void>;
  verifyOtp: (email: string, code: string) => Promise<User>;
  resendVerificationEmail: (email: string) => Promise<void>;
  resetPasswordForEmail: (email: string) => Promise<void>;
  updatePassword: (token: string, newPassword: string) => Promise<User>;
  refreshProfile: () => Promise<User | null>;
  updateProfile: (data: UpdateUserInput) => Promise<User>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useAuth();
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

export function useAuthContext(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}
