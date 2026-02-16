/**
 * Onboarding Layout
 *
 * File-system routing with Stack navigation
 * Screens are lazy-loaded via dynamic imports to reduce bundle size by ~500KB
 */

import { Stack } from 'expo-router';

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false
      }}
    >
      <Stack.Screen
        name="step1"
        options={{
          animationTypeForReplace: 'pop'
        }}
      />
      <Stack.Screen name="step2" />
      <Stack.Screen name="step3" />
      <Stack.Screen name="step4" />
      <Stack.Screen
        name="step5"
        options={{
          animationTypeForReplace: 'pop'
        }}
      />
    </Stack>
  );
}