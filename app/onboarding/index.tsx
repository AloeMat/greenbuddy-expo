/**
 * Onboarding Screen
 *
 * Main entry point for the onboarding flow
 * Displays the OnboardingWizard component that manages all 14 pages
 */

import React from 'react';
import { OnboardingWizard } from '@/features/onboarding/components/OnboardingWizard';

export default function OnboardingScreen() {
  return <OnboardingWizard />;
}
