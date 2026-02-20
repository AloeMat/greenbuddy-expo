import type { Session } from '@supabase/supabase-js';

/**
 * Auth Feature Types - GreenBuddy v2.2
 */

export interface AuthToken {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface TokenPayload {
  id: string;
  email: string;
  role: 'Admin' | 'User' | 'Moderator';
  iat: number;
  exp: number;
}

export interface AuthUser {
  id: string;
  email: string;
  role: 'Admin' | 'User' | 'Moderator';
  isFirstLogin?: boolean;
}

export interface AuthState {
  // State
  user: AuthUser | null;
  session: Session | null; // Supabase session
  isLoading: boolean;
  isAuthenticated: boolean;
  accessToken: string | null;
  refreshTokenValue: string | null;

  // Actions
  signIn: (email: string, password: string) => Promise<AuthUser | void>;
  signUp: (email: string, password: string, role?: string) => Promise<void>;
  signOut: () => Promise<void>;
  login: (email: string, password: string) => Promise<AuthUser | void>;
  register: (email: string, password: string, role?: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  getAccessToken: () => string | null;
  initializeAuth: () => Promise<void>;
  clearAuth: () => void;
}
