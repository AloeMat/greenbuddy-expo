import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { PlantPersonality } from '@/types';

export interface IdentifiedPlant {
  commonName: string;
  scientificName: string;
  family: string;
  confidence: number;
  description?: string; // Optional - from PlantNet result for display
}

export interface OnboardingState {
  // Progress tracking
  currentPage: string | null; // 'page1' | 'page2' | ... | 'page10'
  completedPages: string[];
  isOnboardingComplete: boolean;

  // User profiling
  userProfile: 'actif' | 'comprehension' | 'sensible' | 'libre' | null;
  painPoint: 'oui_une' | 'plusieurs' | 'jamais' | null;

  // Plant data
  plantPhoto: string | null; // base64 or URI
  identifiedPlant: IdentifiedPlant | null;
  plantName: string;
  plantPersonality: PlantPersonality | 'funny' | 'gentle' | 'expert' | null;

  // XP tracking
  earnedXP: number;

  // Actions
  setCurrentPage: (page: string) => void;
  markPageComplete: (page: string) => void;
  setUserProfile: (profile: 'actif' | 'comprehension' | 'sensible' | 'libre') => void;
  setPainPoint: (point: 'oui_une' | 'plusieurs' | 'jamais') => void;
  setPlantData: (photo: string, identified: IdentifiedPlant) => void;
  setPlantName: (name: string) => void;
  setPlantPersonality: (personality: PlantPersonality | 'funny' | 'gentle' | 'expert') => void;
  addXP: (amount: number) => void;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set, get) => ({
      // Initial state
      currentPage: null,
      completedPages: [],
      isOnboardingComplete: false,
      userProfile: null,
      painPoint: null,
      plantPhoto: null,
      identifiedPlant: null,
      plantName: '',
      plantPersonality: null,
      earnedXP: 0,

      // Actions
      setCurrentPage: (page) =>
        set({
          currentPage: page,
        }),

      markPageComplete: (page) =>
        set((state) => ({
          completedPages: [...new Set([...state.completedPages, page])],
        })),

      setUserProfile: (profile) =>
        set({
          userProfile: profile,
        }),

      setPainPoint: (point) =>
        set({
          painPoint: point,
        }),

      setPlantData: (photo, identified) =>
        set({
          plantPhoto: photo,
          identifiedPlant: identified,
        }),

      setPlantName: (name) =>
        set({
          plantName: name,
        }),

      setPlantPersonality: (personality) =>
        set({
          plantPersonality: personality,
        }),

      addXP: (amount) =>
        set((state) => ({
          earnedXP: state.earnedXP + amount,
        })),

      completeOnboarding: () =>
        set({
          isOnboardingComplete: true,
          currentPage: null,
        }),

      resetOnboarding: () =>
        set({
          currentPage: null,
          completedPages: [],
          isOnboardingComplete: false,
          userProfile: null,
          painPoint: null,
          plantPhoto: null,
          identifiedPlant: null,
          plantName: '',
          plantPersonality: null,
          earnedXP: 0,
        }),
    }),
    {
      name: 'onboarding-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
