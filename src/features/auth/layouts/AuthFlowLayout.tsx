import { Stack } from 'expo-router';
import React from 'react';

/**
 * AuthFlowLayout Component
 *
 * Renders the authentication flow layout with stack-based navigation.
 * Used by app/(auth)/_layout.tsx for the auth group routing.
 *
 * Features:
 * - Stack navigator for login/register flows
 * - Auth screen routes management
 *
 * This component is part of the auth feature's layout encapsulation (Phase 5).
 */
export const AuthFlowLayout: React.FC = () => {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
    </Stack>
  );
};
