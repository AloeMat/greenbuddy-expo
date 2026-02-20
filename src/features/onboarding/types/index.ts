/**
 * Onboarding Feature Types — Localized
 * Source unique de vérité pour les types onboarding
 * Import: import type { OnboardingState } from '@/features/onboarding/types'
 */

export interface OnboardingState {
  currentStep: number;
  completed: boolean;
  userProfile?: UserProfile;
  selectedHumanDesignType?: HumanDesignType;
  selectedPlantPersonality?: PlantPersonality;
  selectedLanguage?: Language;
  error?: string;
  loading?: boolean;

  // Actions
  nextStep: () => void;
  previousStep: () => void;
  setStep: (step: number) => void;
  completeOnboarding: () => void;
  updateProfile: (profile: Partial<UserProfile>) => void;
  reset: () => void;
}

export interface UserProfile {
  id?: string;
  displayName: string;
  gardenerLevel: 'novice' | 'hobbyist' | 'expert';
  preferences?: UserPreferences;
  humanDesignType?: HumanDesignType;
  createdAt?: string;
}

export interface UserPreferences {
  language: 'fr' | 'en';
  voiceEnabled: boolean;
  gamificationEnabled: boolean;
  theme: 'light' | 'dark' | 'auto';
  notificationsEnabled: boolean;
  wateringReminders: boolean;
}

export interface UserState {
  user: AuthUser | null;
  preferences: UserPreferences;
  loading: boolean;
  error: string | null;
}

export type HumanDesignType = 'Manifestor' | 'ManifestedGenerator' | 'Generator' | 'Generator Reflector' | 'Reflector';

export interface HumanDesignProfile {
  type: HumanDesignType;
  strategy: string;
  authority: string;
  profile: string;
  theme: string;
}

export interface PersonalizationSettings {
  avatarType: PlantPersonality;
  notificationStyle: 'formal' | 'casual' | 'poetic' | 'scientific';
  interactionLevel: 'minimal' | 'balanced' | 'intensive';
  humanDesignType?: HumanDesignType;
}

export type PlantPersonality =
  | 'cactus'
  | 'orchidee'
  | 'monstera'
  | 'succulente'
  | 'fougere'
  | 'carnivore'
  | 'pilea'
  | 'palmier'
  | 'pothos';

export type Language = 'fr' | 'en';

// Auth types needed for onboarding context
export interface AuthUser {
  id: string;
  email: string;
  username?: string;
  avatar?: string;
  role?: string;
  isFirstLogin?: boolean;
  createdAt?: string;
  updatedAt?: string;
}
