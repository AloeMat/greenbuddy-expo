/**
 * Onboarding Entry Point
 *
 * Renders the dynamic OnboardingWizard component
 * The wizard loads configuration from JSON and manages the complete onboarding flow
 *
 * Flow: page1 → page2 → ... → page10 → dashboard
 */

import { OnboardingWizard } from '@features/onboarding/components/OnboardingWizard';

export default function OnboardingIndex() {
  return <OnboardingWizard />;
}
