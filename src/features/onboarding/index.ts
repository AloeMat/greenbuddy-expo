/**
 * Onboarding Feature — Barrel Export
 * Main entry point for the onboarding feature
 * FSD phase 6 — 100% compliant feature module
 */

// Components
export { OnboardingWizard } from './components/OnboardingWizard';
export { FeedbackModal } from './components/FeedbackModal';

// Store
export { useOnboardingStore } from './store/onboardingStore';
export type { OnboardingState, IdentifiedPlant } from './store/onboardingStore';

// Types
export type {
  OnboardingState as OnboardingStateType,
  UserProfile,
  UserPreferences,
  HumanDesignType,
  HumanDesignProfile,
  PersonalizationSettings,
  PlantPersonality,
  Language,
} from './types';

// Constants
export { PAGE_PROGRESS, XP_REWARDS } from './constants/onboardingFlow';
