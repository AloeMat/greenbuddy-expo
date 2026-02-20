/**
 * Plants Feature Types — Localized
 * Source unique de vérité pour les types liés aux plantes
 * Import: import type { Plant, PlantAnalysis } from '@/features/plants/types'
 */

// Re-export the authoritative Plant type from the plants feature (snake_case DB shape)
export type { Plant, CreatePlantDto, UpdatePlantDto } from '@/features/plants/repositories/PlantRepository';

export interface PlantAnalysis {
  id: string;
  commonName: string;
  scientificName?: string;
  personality: PlantPersonality;
  dialogue: Dialogue;
  soins: CareRequirements;
  suggestedNames?: string[];
  healthScore?: number;
  wateringFrequency?: number;
}

export interface Dialogue {
  presentation: string;
  diagnosis?: string;
  needs?: string;
}

export interface CareRequirements {
  wateringFrequencyDays: number;
  lightRequirements: 'direct' | 'indirect' | 'shade' | 'partial-shade';
  temperatureMin: number;
  temperatureMax: number;
  humidity: 'low' | 'medium' | 'high';
  fertilizerFrequencyDays: number;
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

export type PlantHealthStatus = 'critical' | 'poor' | 'fair' | 'good' | 'excellent';

export interface CareStats {
  lastWatered: number;
  lastMisted: number;
  lastCleaned: number;
  waterCount: number;
  mistCount: number;
}

export interface HealthRecord {
  date: number;
  score: number;
}

export interface TimeCapsule {
  date: number;
  message: string;
  unlockDate: number;
}

export interface HolisticData {
  origin: string;
  coordinates: { lat: number; lng: number };
  element: 'Terre' | 'Eau' | 'Air' | 'Feu';
  symbolism: string;
  zodiac: string;
}

/**
 * @deprecated Legacy UI Plant shape — NOT used anywhere at runtime.
 * The real Plant type is the repository one (snake_case, from PlantRepository.ts).
 * Kept for reference only. Will be removed in a future cleanup.
 */
export interface PlantUI {
  id: string;
  userId: string;
  nickname?: string;
  commonName: string;
  scientificName?: string;
  family?: string;
  personality?: PlantPersonality;
  healthScore: number;
  healthStatus: PlantHealthStatus;
  wateringFrequency: number;
  lastWatered?: string;
  nextWatering?: string;
  imageUrl?: string;
  avatarUrl?: string;
  customAvatar?: string;
  activeAccessory?: string;
  notes?: string;
  xp: number;
  level: number;
  createdAt: number;
  updatedAt?: number;
  isPlant?: boolean;
  memories?: string[];
  badges?: string[];
  healthHistory?: HealthRecord[];
  timeCapsules?: TimeCapsule[];
  holistic?: HolisticData;
  history?: ChatMessage[];
}

/**
 * @deprecated Legacy PlantsState — the real store uses plantsStore.ts
 * Kept for type compatibility only.
 */
export interface PlantsState {
  plants: Plant[];
  selectedPlant: Plant | null;
  loading: boolean;
  error: string | null;

  // Actions
  fetchPlants: () => Promise<void>;
  selectPlant: (plantId: string | null) => void;
  addPlant: (plant: Plant) => void;
  updatePlant: (plant: Plant) => void;
  removePlant: (plantId: string) => void;
  waterPlant: (plantId: string) => Promise<void>;
}

/** ChatMessage type (used in PlantUI.history) */
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  emotion?: AvatarEmotion;
}

export type AvatarEmotion =
  | 'idle'
  | 'happy'
  | 'sad'
  | 'sleeping'
  | 'thirsty'
  | 'tired'
  | 'excited'
  | 'worried'
  | 'neutral';

/**
 * Result from Gemini health diagnosis
 */
export interface HealthDiagnosisResult {
  issue: string;
  treatment: string;
  urgency: 'low' | 'medium' | 'high';
  analysis?: Partial<PlantAnalysis>;
}
