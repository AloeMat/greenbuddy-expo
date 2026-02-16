import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';
import { logger } from '@lib/services/logger';

// Get Supabase credentials from expo-constants (reads from .env EXPO_PUBLIC_* vars)
const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl || process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseKey || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

const trimmedUrl = supabaseUrl?.trim();
const trimmedKey = supabaseAnonKey?.trim();

logger.debug('🔐 Supabase URL:', { url: trimmedUrl });
logger.debug('🔐 Supabase Key present:', { isValid: !!trimmedKey && trimmedKey !== 'YOUR_SUPABASE_ANON_KEY_HERE' });

// Allow app to start even with missing keys (prevents blank page)
// Will fail gracefully on actual Supabase calls with meaningful error
const createSupabaseClient = () => {
  if (!trimmedUrl || !trimmedKey || trimmedKey === 'YOUR_SUPABASE_ANON_KEY_HERE') {
    logger.warn('⚠️ SUPABASE CONFIG MISSING:');
    logger.warn('   URL:', trimmedUrl);
    logger.warn('   Key valid:', trimmedKey && trimmedKey !== 'YOUR_SUPABASE_ANON_KEY_HERE');
    logger.warn('   Update greenbuddy-expo/.env with real credentials!');

    // Create with dummy credentials to allow app to load
    return createClient(trimmedUrl || 'https://dummy.supabase.co', trimmedKey || 'dummy_key');
  }
  return createClient(trimmedUrl, trimmedKey);
};

export const supabase = createSupabaseClient();
