/**
 * Onboarding Layout
 *
 * Wrapper for the OnboardingWizard component
 * Pages are managed internally by OnboardingWizard via JSON configuration
 */

import { Stack } from 'expo-router';

export default function OnboardingLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}