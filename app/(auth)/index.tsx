import { useEffect } from 'react';
import { useRouter } from 'expo-router';

/**
 * Auth Index - Redirect to Login
 * This is the default route when user navigates to /(auth)
 * Redirects immediately to the login screen
 */
export default function AuthScreen() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to login screen on mount (only once)
    router.replace('/(auth)/login');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Return null since we're immediately redirecting
  return null;
}
