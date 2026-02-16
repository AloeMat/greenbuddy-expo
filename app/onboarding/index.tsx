/**
 * Onboarding Entry Point
 * Redirects to step1 (the first step of the onboarding flow)
 */

import { useEffect } from 'react';
import { useRouter } from 'expo-router';

export default function OnboardingIndex() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to first step of onboarding
    router.replace('/onboarding/step1');
  }, [router]);

  // Return empty view while redirecting
  return null;
}
