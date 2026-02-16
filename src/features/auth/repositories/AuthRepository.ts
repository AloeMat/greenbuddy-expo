/**
 * Auth Repository - Data Access Layer
 * Handles all Supabase authentication operations
 * Isolated from business logic and React for better testability
 */

import { supabase } from '@lib/services/supabase';
import { logger } from '@lib/services/logger';
import type { AuthUser } from '@appTypes';

export interface IAuthRepository {
  getSession(): Promise<{ user: AuthUser | null; session: any }>;
  signIn(email: string, password: string): Promise<{ user: AuthUser; session: any }>;
  signUp(email: string, password: string): Promise<void>;
  signOut(): Promise<void>;
  refreshSession(): Promise<{ accessToken: string; refreshToken: string }>;
  onAuthStateChange(callback: (user: AuthUser | null) => void): () => void;
}

export class SupabaseAuthRepository implements IAuthRepository {
  /**
   * Get current session from Supabase
   */
  async getSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) throw error;

      if (session) {
        const user: AuthUser = {
          id: session.user.id,
          email: session.user.email || '',
          role: 'User',
          isFirstLogin: false,
        };
        return { user, session };
      }

      return { user: null, session: null };
    } catch (err) {
      logger.error('getSession failed:', err);
      throw err;
    }
  }

  /**
   * Sign in with email and password
   */
  async signIn(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      const user: AuthUser = {
        id: data.user.id,
        email: data.user.email || '',
        role: 'User',
        isFirstLogin: false,
      };

      return { user, session: data.session };
    } catch (err) {
      logger.error('signIn failed:', err);
      throw err;
    }
  }

  /**
   * Sign up with email and password
   */
  async signUp(email: string, password: string) {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;
    } catch (err) {
      logger.error('signUp failed:', err);
      throw err;
    }
  }

  /**
   * Sign out current user
   */
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (err) {
      logger.error('signOut failed:', err);
      throw err;
    }
  }

  /**
   * Refresh access token
   */
  async refreshSession() {
    try {
      const { data, error } = await supabase.auth.refreshSession();

      if (error) throw error;

      return {
        accessToken: data.session!.access_token,
        refreshToken: data.session!.refresh_token,
      };
    } catch (err) {
      logger.error('refreshSession failed:', err);
      throw err;
    }
  }

  /**
   * Listen to auth state changes
   * Returns unsubscribe function
   */
  onAuthStateChange(callback: (user: AuthUser | null) => void) {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session) {
          const user: AuthUser = {
            id: session.user.id,
            email: session.user.email || '',
            role: 'User',
            isFirstLogin: false,
          };
          callback(user);
        } else {
          callback(null);
        }
      }
    );

    return () => subscription?.unsubscribe();
  }
}

/**
 * Factory function for dependency injection
 */
export const createAuthRepository = (): IAuthRepository => {
  return new SupabaseAuthRepository();
};
