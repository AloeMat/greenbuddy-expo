/**
 * Gamification Feature Exports
 * Arbre de Vie (9 tiers), XP, Achievements, Streaks
 */

// Store
export { useGamificationStore, useGamification } from './store/gamificationStore';

// Types
export type { GamificationState, Achievement, LifeTreeTier, RewardType, XpReward, PlantPersonality, AvatarEmotion, MicroActionType } from './types';
export type { AttachmentState, AttachmentPhase, AttachmentPhaseMetadata } from './services/attachmentService';

// Constants
export {
  LIFE_TREE_TIERS,
  XP_REWARDS,
  calculateTierFromXp,
  calculateTierProgress,
  getXpForTier,
  getXpNeededForNextTier,
} from './constants/lifetree';

// Components
export { ConfettiAnimation, ConfettiBurst, ConfettiExplosion } from './components/ConfettiAnimation';
export { StreakCounter } from './components/StreakCounter';
export { AchievementGrid, AchievementCategorySection } from './components/AchievementGrid';
export { DailyCheckInButton } from './components/DailyCheckInButton';
export { NotificationSettings } from './components/NotificationSettings';
export { VocalInteraction } from './components/VocalInteraction';
export { AttachmentIndicator } from './components/AttachmentIndicator';

// Achievements
export {
  ALL_ACHIEVEMENTS,
  BOTANISTE_ACHIEVEMENTS,
  SOIGNEUR_ACHIEVEMENTS,
  SOCIAL_ACHIEVEMENTS,
  EXPLORATEUR_ACHIEVEMENTS,
  COLLECTIONNEUR_ACHIEVEMENTS,
  getAchievementsByCategory,
  getAchievementById,
  getTotalAchievementReward,
  CATEGORY_METADATA,
} from './constants/achievements';
export type { AchievementCategory } from './constants/achievements';

// Hooks
export { useStreak, useDailyCheckIn } from './hooks/useStreak';
export { useDailyNotification } from './hooks/useDailyNotification';
export { useAttachment, useAttachmentMulti } from './hooks/useAttachment';
export { usePersonalization, useNotificationStyle, useAvatarPersonality } from './hooks/usePersonalization';

// Services
export {
  hapticFeedback,
  hapticPatterns,
  xpRewardService,
  streakService,
  personalizationService,
  microInteractionService,
  dailyNotificationService,
  avatarService,
  attachmentService,
  contextualReplyService,
} from './services';

// Personalities (Phase 4.2)
export {
  CACTUS,
  ORCHIDEE,
  MONSTERA,
  POTHOS,
  FOUGERE,
  CARNIVORE,
  ALL_PERSONALITIES,
  getPersonalityProfile,
  getGeminiPrompt,
  getGreeting,
  mapSpeciesToPersonality,
} from './constants/personalities';
export type { PersonalityProfile } from './constants/personalities';
