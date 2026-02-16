/**
 * Onboarding v2.0 Layout
 *
 * 14-page emotional journey with animations, XP tracking, and personalization
 * File-system routing with Stack navigation
 */

import { Stack } from 'expo-router';

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animationEnabled: true
      }}
    >
      {/* Page 1: Welcome */}
      <Stack.Screen name="page1" />

      {/* Page 2: Projection */}
      <Stack.Screen name="page2" />

      {/* Page 3: Profile Selection */}
      <Stack.Screen name="page3" />

      {/* Page 3_feedback: Auto-advance */}
      <Stack.Screen name="page3_feedback" />

      {/* Page 4: Pain Point */}
      <Stack.Screen name="page4" />

      {/* Page 4_reassurance: Heart pulse animation */}
      <Stack.Screen name="page4_reassurance" />

      {/* Page 5: Plant Photo */}
      <Stack.Screen name="page5" />

      {/* Page 5_identification: Loading */}
      <Stack.Screen name="page5_identification" />

      {/* Page 6_dynamic: Profile-adapted speech */}
      <Stack.Screen name="page6_dynamic" />

      {/* Page 7: Preview Dashboard */}
      <Stack.Screen name="page7" />

      {/* Page 8: Plant Naming */}
      <Stack.Screen name="page8" />

      {/* Page 8_confirmation: Auto-advance */}
      <Stack.Screen name="page8_confirmation" />

      {/* Page 9: Signup Form */}
      <Stack.Screen name="page9" />

      {/* Page 10: Celebration with Confetti */}
      <Stack.Screen name="page10" />
    </Stack>
  );
}