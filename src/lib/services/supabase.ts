import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';
import { logger } from '@/lib/services/logger';

// Get Supabase credentials from environment variables
// Expo automatically exposes EXPO_PUBLIC_* variables to process.env
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || Constants.expoConfig?.extra?.supabaseUrl;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || Constants.expoConfig?.extra?.supabaseKey;

const trimmedUrl = supabaseUrl?.trim();
const trimmedKey = supabaseAnonKey?.trim();

// Only log config presence (never partial credentials)
logger.debug('🔐 Supabase init', { hasUrl: !!trimmedUrl, hasKey: !!trimmedKey });

// Validate Supabase credentials at startup
const createSupabaseClient = () => {
  const isMissingConfig = !trimmedUrl || !trimmedKey || trimmedKey === 'YOUR_SUPABASE_ANON_KEY_HERE';

  if (isMissingConfig) {
    logger.error('❌ SUPABASE CONFIG MISSING — app will not function correctly.');
    logger.error('   URL present:', !!trimmedUrl);
    logger.error('   Key valid:', !!trimmedKey && trimmedKey !== 'YOUR_SUPABASE_ANON_KEY_HERE');
    logger.error('   → Update greenbuddy-expo/.env with real credentials!');

    if (__DEV__) {
      // In dev, use placeholder to allow UI rendering (all Supabase calls will fail gracefully)
      return createClient(
        trimmedUrl || 'https://placeholder.supabase.co',
        trimmedKey || 'placeholder_anon_key_dev_only'
      );
    }
    // In production, still create client but log prominently
    // Supabase calls will fail with auth errors — which is the correct behavior
    return createClient(
      trimmedUrl || 'https://invalid.supabase.co',
      trimmedKey || 'invalid'
    );
  }
  return createClient(trimmedUrl, trimmedKey);
};

export const supabase = createSupabaseClient();
