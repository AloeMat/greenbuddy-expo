/**
 * Mock Auth Repository
 * For testing components and hooks without Supabase
 */

import type { IAuthRepository } from './AuthRepository';
import type { AuthUser } from '@/types';

const mockUser: AuthUser = {
  id: 'mock-user-id-12345',
  email: 'test@example.com',
  role: 'User',
  isFirstLogin: false,
};

const mockSession = {
  access_token: 'mock-access-token-xyz',
  refresh_token: 'mock-refresh-token-abc',
  user: {
    id: mockUser.id,
    email: mockUser.email,
  },
};

export const createMockAuthRepository = (overrides?: Partial<IAuthRepository>): IAuthRepository => {
  let isSignedIn = false;

  return {
    async getSession() {
      if (isSignedIn) {
        return { user: mockUser, session: mockSession };
      }
      return { user: null, session: null };
    },

    async signIn(email: string, password: string) {
      // Simulate successful login
      isSignedIn = true;
      return { user: mockUser, session: mockSession };
    },

    async signUp(email: string, password: string) {
      // Simulate successful signup
      isSignedIn = false; // Requires email verification
    },

    async signOut() {
      isSignedIn = false;
    },

    async refreshSession() {
      return {
        accessToken: 'mock-access-token-refreshed',
        refreshToken: 'mock-refresh-token-refreshed',
      };
    },

    onAuthStateChange(callback) {
      // Call callback immediately with current state
      if (isSignedIn) {
        callback(mockUser);
      } else {
        callback(null);
      }

      // Return unsubscribe function
      return () => {};
    },

    ...overrides,
  };
};

export const mockAuthRepository = createMockAuthRepository();
