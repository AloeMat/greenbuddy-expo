/**
 * GreenBuddy Types — Source Unique de Vérité
 * Tous les types applicatifs centralisés
 * Import: import type { Plant, AuthUser } from '@/types'
 */

// ============================================
// 🔐 AUTH TYPES

import type { Session } from '@supabase/supabase-js';

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

export interface AuthState {
  user: AuthUser | null;
  session: Session | null;
  loading?: boolean;
  isLoading?: boolean;
  isAuthenticated?: boolean;
  accessToken?: string | null;
  refreshTokenValue?: string | null;
  error: string | null;

  // Main methods
  login: (email: string, password: string) => Promise<AuthUser>;
  register: (email: string, password: string, role?: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  getAccessToken: () => string | null | undefined;
  initializeAuth?: () => Promise<void>;
  clearAuth?: () => void;

  // Aliases for compatibility
  signIn?: (email: string, password: string) => Promise<AuthUser>;
  signUp?: (email: string, password: string, role?: string) => Promise<void>;
  signOut?: () => Promise<void>;
}

// ============================================
// 🌱 PLANT TYPES

export interface Plant {
  id: string;
  userId: string;
  nickname?: string;
  commonName: string;
  scientificName?: string;
  family?: string;
  personality?: PlantPersonality;
  healthScore: number;
  healthStatus: PlantHealthStatus;
  wateringFrequency: number; // en jours
  lastWatered?: string; // ISO date
  nextWatering?: string; // ISO date
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

// ============================================
// 💬 CHAT & VOICE TYPES

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

export type MicroActionType =
  | 'water_drop'
  | 'confetti'
  | 'shake'
  | 'dance'
  | 'fire_pulse'
  | 'shock'
  | 'none';

// ============================================
// 🎮 GAMIFICATION TYPES

export interface GamificationState {
  totalXp: number;
  currentTier: number;
  tierProgress: number;
  achievements: Achievement[];
  unlockedAchievements: string[];
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string | null;
  isLevelUp: boolean;

  // Actions
  addXp: (amount: number, source: RewardType) => void;
  addXpCustom: (amount: number, source: string) => void;
  unlockAchievement: (achievementId: string) => void;
  updateStreak: () => void;
  resetStreak: () => void;
  checkMilestones: () => void;
  getTier: () => LifeTreeTier | undefined;
  getProgress: () => number;
  dismissLevelUp: () => void;
  reset: () => void;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  category: AchievementCategory;
  tier: number;
  xpReward: number;
  iconName: string;
  unlockedAt?: string;
  progress?: number;
  target?: number;
  // Additional optional properties
  icon?: string;
  name?: string;
}

export type AchievementCategory =
  | 'watering'
  | 'health'
  | 'collection'
  | 'streak'
  | 'special'
  | 'botaniste'
  | 'soigneur'
  | 'social'
  | 'explorateur'
  | 'collectionneur';

export interface LifeTreeTier {
  tier: number;
  name: string;
  minXp?: number;
  maxXp?: number;
  color?: string;
  benefits?: string[];
  // Additional optional properties
  description?: string;
  requiredXp?: number;
  xpRequired?: number;  // Alias for requiredXp (used in lifetree.ts)
  totalXpRequired?: number;
  rewards?: string[];
  icon?: string;
  frenchName?: string;
}

export type RewardType =
  | 'watering'
  | 'health_milestone'
  | 'streak_milestone'
  | 'achievement'
  | 'daily_login'
  | 'add_plant'
  | 'first_plant'
  | 'collection_10'
  | 'collection_25'
  | 'fertilize'
  // Uppercase variants (for backward compatibility with lifetree.ts)
  | 'ADD_PLANT'
  | 'WATER_PLANT'
  | 'FERTILIZE_PLANT'
  | 'DELETE_PLANT'
  | 'FIRST_PLANT'
  | 'PLANT_HEALTHY'
  | 'STREAK_7'
  | 'STREAK_30'
  | 'STREAK_90'
  | 'LEVEL_5'
  | 'LEVEL_10'
  | 'COLLECTION_10'
  | 'COLLECTION_25'
  | 'CUSTOM';

export interface XpReward {
  amount: number;
  source?: RewardType;
  type?: RewardType;  // Alias for source
  description?: string;
  achievementId?: string;
  timestamp?: string;
}

// ============================================
// 🌍 WEATHER & ENVIRONMENT TYPES

export interface WeatherData {
  temp: number;
  humidity: number;
  outdoorHumidity: number;
  indoorHumidity: number;
  aqi: number;
  outdoorAqi: number;
  indoorAqi: number;
  cloudCover: number;
  condition: 'clear' | 'cloudy' | 'rain' | 'snow' | 'storm' | 'fog';
  description: string;
  isDay: boolean;
  moon: MoonData;
  locationName: string;
}

export interface MoonData {
  phase: 'new' | 'waxing_crescent' | 'first_quarter' | 'waxing_gibbous' | 'full' | 'waning_gibbous' | 'last_quarter' | 'waning_crescent';
  label: string;
  illumination: number;
  advice: string;
}

export type Season = 'printemps' | 'ete' | 'automne' | 'hiver';

// ============================================
// 🎨 UI & APP STATE TYPES

export type AppState = 'ONBOARDING' | 'GARDEN' | 'DASHBOARD' | 'CHAT' | 'SCAN' | 'ANALYZING' | 'NAMING' | 'CELEBRATION' | 'PROFILE' | 'MAP';

export type Theme = 'light' | 'dark' | 'auto';
export type Language = 'fr' | 'en';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

// ============================================
// 📊 STORE SLICES

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

export interface UserState {
  user: AuthUser | null;
  preferences: UserPreferences;
  loading: boolean;
  error: string | null;
}

export interface UserPreferences {
  language: 'fr' | 'en';
  voiceEnabled: boolean;
  gamificationEnabled: boolean;
  theme: 'light' | 'dark' | 'auto';
  notificationsEnabled: boolean;
  wateringReminders: boolean;
}

// ============================================
// 📡 API TYPES

export interface CreatePlantRequest {
  name: string;
  species: string;
  scientificName?: string;
  personality?: PlantPersonality;
  wateringFrequency: number;
  imageUrl?: string;
}

export interface UpdatePlantRequest {
  name?: string;
  healthScore?: number;
  wateringFrequency?: number;
  lastWatered?: string;
  notes?: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// ============================================
// 👤 HUMAN DESIGN TYPES

export interface HumanDesignProfile {
  type: HumanDesignType;
  strategy: string;
  authority: string;
  profile: string;
  theme: string;
}

export type HumanDesignType = 'Manifestor' | 'ManifestedGenerator' | 'Generator' | 'Generator Reflector' | 'Reflector';

export interface PersonalizationSettings {
  avatarType: PlantPersonality;
  notificationStyle: 'formal' | 'casual' | 'poetic' | 'scientific';
  interactionLevel: 'minimal' | 'balanced' | 'intensive';
  humanDesignType?: HumanDesignType;
}

// ============================================
// 🔧 UTILITY TYPES

export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type PlantListItem = Plant;

/** Result from Gemini health diagnosis */
export interface HealthDiagnosisResult {
  issue: string;
  treatment: string;
  urgency: 'low' | 'medium' | 'high';
  analysis?: Partial<PlantAnalysis>;
}
