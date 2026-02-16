import { create } from 'zustand';

interface OnboardingState {
  // Données de l'identification (Page 2)
  identifiedPlant: {
    commonName: string;
    scientificName?: string;
    family?: string;
    confidence: number;
  } | null;

  // Données du baptême (Page 3)
  plantName: string;

  // Actions
  setIdentifiedPlant: (data: OnboardingState['identifiedPlant']) => void;
  setPlantName: (name: string) => void;
}

export const useOnboardingStore = create<OnboardingState>((set) => ({
  identifiedPlant: { species: 'Monstera Deliciosa', commonName: 'Monstera', confidence: 0.95 }, // Mock pour le dev
  plantName: '',

  setIdentifiedPlant: (data) => set({ identifiedPlant: data }),
  setPlantName: (name) => set({ plantName: name }),
}));
