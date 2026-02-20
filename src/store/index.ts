/**
 * Centralized Store Exports
 * Point d'entrée unique pour tous les stores Zustand
 */

// Auth
export { useAuthStore, useAuth } from '@/features/auth/store';

// Plants
export { usePlantsStore } from '@/features/plants/store';

// Gamification
export { useGamificationStore, useGamification } from '@/features/gamification/store';

// Onboarding
export { useOnboardingStore } from '@/features/onboarding/store/onboardingStore';
