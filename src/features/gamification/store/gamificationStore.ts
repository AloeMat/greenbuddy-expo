/**
 * Gamification Store - Zustand
 * Gestion de l'Arbre de Vie (9 tiers), XP, Achievements, Streaks
 * Remplace GamificationContext.tsx
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { GamificationState, Achievement, RewardType } from '@appTypes';
import { logger } from '@lib/services/logger';
import {
  LIFE_TREE_TIERS,
  XP_REWARDS,
  calculateTierFromXp,
  calculateTierProgress,
  getXpNeededForNextTier,
} from '@gamification/constants/lifetree';

// Mock achievements (à remplacer par vraies données)
const MOCK_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_plant',
    title: 'Main Verte',
    description: 'Added your first plant',
    category: 'botaniste',
    tier: 1,
    xpReward: 25,
    iconName: 'Sprout',
  },
  {
    id: 'streak_7',
    title: 'Jardinier Dévoué',
    description: 'Maintained a 7-day streak',
    category: 'soigneur',
    tier: 2,
    xpReward: 50,
    iconName: 'Flame',
  },
  {
    id: 'collection_10',
    title: 'Jungle Urbaine',
    description: 'Collected 10 plants',
    category: 'collectionneur',
    tier: 3,
    xpReward: 75,
    iconName: 'Leaf',
  },
];

export const useGamificationStore = create<GamificationState>()(
  persist(
    (set, get) => ({
      // Initial state
      totalXp: 0,
      currentTier: 1,
      tierProgress: 0,
      isLevelUp: false,
      achievements: MOCK_ACHIEVEMENTS,
      unlockedAchievements: [],
      currentStreak: 0,
      longestStreak: 0,
      lastActiveDate: null,

      /**
       * Ajouter XP pour une récompense spécifique
       */
      addXp: (amount: number, type: RewardType) => {
        const reward = XP_REWARDS[type];
        if (!reward) {
          logger.warn(`⚠️ Unknown reward type: ${type}`);
          return;
        }

        get().addXpCustom(reward.amount, reward.description || String(type));

        // Unlock achievement si applicable
        if (reward.achievementId) {
          get().unlockAchievement(reward.achievementId);
        }
      },

      /**
       * Ajouter XP custom (montant + description)
       */
      addXpCustom: (amount: number, description: string) => {
        set((state) => {
          const newXp = Math.max(0, state.totalXp + amount);
          const oldTier = state.currentTier;
          const newTier = calculateTierFromXp(newXp);
          const newProgress = calculateTierProgress(newXp);

          const isLevelUp = newTier > oldTier;
          if (isLevelUp) {
            logger.debug(`🎉 Level Up! Tier: ${oldTier} → ${newTier}`);
          }

          return {
            totalXp: newXp,
            currentTier: newTier,
            tierProgress: newProgress,
            isLevelUp,
          };
        });
      },

      /**
       * Unlock achievement
       */
      unlockAchievement: (achievementId: string) => {
        set((state) => {
          if (state.unlockedAchievements.includes(achievementId)) {
            return state; // Already unlocked
          }

          const updatedAchievements = state.achievements.map((ach) =>
            ach.id === achievementId
              ? { ...ach, unlockedAt: new Date().toISOString() }
              : ach
          );

          logger.debug(`🏆 Achievement unlocked: ${achievementId}`);

          return {
            achievements: updatedAchievements,
            unlockedAchievements: [...state.unlockedAchievements, achievementId],
          };
        });
      },

      /**
       * Obtenir les achievements par catégorie
       */
      getAchievementsByCategory: (category: string) => {
        return get().achievements.filter((ach) => ach.category === category);
      },

      /**
       * Mettre à jour le streak
       */
      updateStreak: () => {
        const today = new Date().toISOString().split('T')[0];
        const lastDate = get().lastActiveDate;

        set((state) => {
          if (!lastDate || lastDate === today) {
            // Same day or first time
            return { lastActiveDate: today };
          }

          const lastDateObj = new Date(lastDate);
          const todayObj = new Date(today);
          const diffTime = todayObj.getTime() - lastDateObj.getTime();
          const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

          if (diffDays === 1) {
            // Consecutive day
            const newStreak = state.currentStreak + 1;
            logger.debug(`🔥 Streak: ${state.currentStreak} → ${newStreak} days`);

            return {
              currentStreak: newStreak,
              longestStreak: Math.max(state.longestStreak, newStreak),
              lastActiveDate: today,
            };
          } else {
            // Streak broken
            logger.debug(`⚠️ Streak reset (gap of ${diffDays} days)`);
            return {
              currentStreak: 1,
              lastActiveDate: today,
            };
          }
        });
      },

      /**
       * Reset streak
       */
      resetStreak: () => {
        set({
          currentStreak: 0,
          lastActiveDate: null,
        });
      },

      /**
       * Initialize gamification from AsyncStorage
       */
      initialize: async () => {
        try {
          logger.debug('📊 Initializing gamification state...');
          // Données sont déjà persistées via Zustand persist middleware
          // Appeler updateStreak si nécessaire au app launch
          get().updateStreak();
          logger.debug('✅ Gamification initialized');
        } catch (error) {
          logger.error('❌ Gamification init error:', error);
        }
      },

      /**
       * Obtenir le tier par numéro
       */
      getLifeTreeTier: (tier: number) => {
        return LIFE_TREE_TIERS.find((t) => t.tier === tier);
      },

      /**
       * Obtenir tous les tiers
       */
      getAllLifeTreeTiers: () => LIFE_TREE_TIERS,

      /**
       * Obtenir le pourcentage de progrès du tier
       */
      getTierProgressPercentage: () => {
        return get().tierProgress;
      },

      /**
       * Obtenir XP nécessaire pour le prochain tier
       */
      getNextTierXpNeeded: () => {
        return getXpNeededForNextTier(get().totalXp);
      },

      /**
       * Réinitialiser l'état gamification
       */
      clearGameification: () => {
        set({
          totalXp: 0,
          currentTier: 1,
          tierProgress: 0,
          isLevelUp: false,
          achievements: MOCK_ACHIEVEMENTS,
          unlockedAchievements: [],
          currentStreak: 0,
          longestStreak: 0,
          lastActiveDate: null,
        });
      },

      /**
       * Check milestones and process level-up
       */
      checkMilestones: () => {
        // Milestones are processed in addXpCustom
      },

      /**
       * Get current tier information
       */
      getTier: () => {
        return LIFE_TREE_TIERS.find((t) => t.tier === get().currentTier);
      },

      /**
       * Get progress towards next tier (0-100)
       */
      getProgress: () => {
        return get().tierProgress;
      },

      /**
       * Dismiss level up notification
       */
      dismissLevelUp: () => {
        set({ isLevelUp: false });
      },

      /**
       * Reset all gamification state
       */
      reset: () => {
        set({
          totalXp: 0,
          currentTier: 1,
          tierProgress: 0,
          isLevelUp: false,
          achievements: MOCK_ACHIEVEMENTS,
          unlockedAchievements: [],
          currentStreak: 0,
          longestStreak: 0,
          lastActiveDate: null,
        });
      },
    }),
    {
      name: 'greenbuddy-gamification',
      storage: createJSONStorage(() => AsyncStorage),
      // Persister seulement certaines clés
      partialize: (state) => ({
        totalXp: state.totalXp,
        currentTier: state.currentTier,
        tierProgress: state.tierProgress,
        unlockedAchievements: state.unlockedAchievements,
        currentStreak: state.currentStreak,
        longestStreak: state.longestStreak,
        lastActiveDate: state.lastActiveDate,
        achievements: state.achievements,
        isLevelUp: state.isLevelUp,
      }),
    }
  )
);

// Export pour compatibilité avec ancien useGamificationContext hook
export const useGamification = () => useGamificationStore();
