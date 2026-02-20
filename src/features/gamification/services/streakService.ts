/**
 * Streak Tracking Service
 * Manages daily streaks, check-ins, and milestone rewards
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useGamificationStore } from '@/features/gamification/store/gamificationStore';
import { logger } from '@/lib/services/logger';
import { STORAGE_KEYS } from '@/lib/constants/storageKeys';

export const STREAK_MILESTONES = {
  STREAK_7: { days: 7, xp: 50, achievementId: 'streak_7' },
  STREAK_30: { days: 30, xp: 200, achievementId: 'streak_30' },
  STREAK_90: { days: 90, xp: 500, achievementId: 'streak_90' },
};

interface StreakState {
  currentStreak: number;
  longestStreak: number;
  lastCheckInDate: string | null;
  checkInHistory: string[]; // Array of ISO date strings
  unlockedMilestones: string[];
}

/**
 * Get today's date as ISO string (YYYY-MM-DD)
 */
function getTodayISO(): string {
  const today = new Date();
  return today.toISOString().split('T')[0];
}

/**
 * Check if date is today
 */
function isToday(dateString: string): boolean {
  return dateString === getTodayISO();
}

/**
 * Check if date is yesterday
 */
function isYesterday(dateString: string): boolean {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return dateString === yesterday.toISOString().split('T')[0];
}

/**
 * Perform daily check-in
 * Returns XP earned from check-in + milestone rewards
 */
export async function performDailyCheckIn(): Promise<{
  xpEarned: number;
  streakBefore: number;
  streakAfter: number;
  milestonReached?: { days: number; xp: number };
  unlockedAchievement?: string;
}> {
  const store = useGamificationStore.getState();
  const today = getTodayISO();

  // Get current streak data (from AsyncStorage or store)
  const streakData = await getStreakData();

  // Already checked in today
  if (streakData.lastCheckInDate && isToday(streakData.lastCheckInDate)) {
    return {
      xpEarned: 0,
      streakBefore: streakData.currentStreak,
      streakAfter: streakData.currentStreak,
    };
  }

  let newStreak = streakData.currentStreak;
  let xpEarned = 0;

  // Check if streak should continue (yesterday) or reset
  if (
    streakData.lastCheckInDate &&
    isYesterday(streakData.lastCheckInDate)
  ) {
    // Streak continues
    newStreak = streakData.currentStreak + 1;
  } else {
    // Streak reset (didn't check in yesterday)
    newStreak = 1;
  }

  // Check for milestone rewards
  let milestonReached: { days: number; xp: number } | undefined;
  let unlockedAchievement: string | undefined;

  for (const [key, milestone] of Object.entries(STREAK_MILESTONES)) {
    if (
      newStreak === milestone.days &&
      !streakData.unlockedMilestones.includes(key)
    ) {
      xpEarned += milestone.xp;
      milestonReached = milestone;
      unlockedAchievement = milestone.achievementId;
      streakData.unlockedMilestones.push(key);

      // Unlock achievement
      store.unlockAchievement(milestone.achievementId);
    }
  }

  // Update longest streak if applicable
  if (newStreak > streakData.longestStreak) {
    streakData.longestStreak = newStreak;
  }

  // Update streak data
  streakData.currentStreak = newStreak;
  streakData.lastCheckInDate = today;
  streakData.checkInHistory.push(today);

  // Save to store
  await saveStreakData(streakData);

  // Base XP for daily check-in
  const dailyXP = 5;
  const totalXP = dailyXP + xpEarned;

  // Add XP to store
  store.addXp(totalXP, 'daily_login');

  return {
    xpEarned: totalXP,
    streakBefore: streakData.currentStreak - 1,
    streakAfter: newStreak,
    milestonReached,
    unlockedAchievement,
  };
}

/**
 * Get current streak data
 */
async function getStreakData(): Promise<StreakState> {
  const store = useGamificationStore.getState();

  try {
    const lastCheckInDate = await AsyncStorage.getItem(STORAGE_KEYS.LAST_CHECK_IN_DATE);
    const checkInHistoryStr = await AsyncStorage.getItem(STORAGE_KEYS.CHECK_IN_HISTORY);
    const unlockedMilestonesStr = await AsyncStorage.getItem(STORAGE_KEYS.UNLOCKED_MILESTONES);

    return {
      currentStreak: store.currentStreak || 0,
      longestStreak: store.longestStreak || 0,
      lastCheckInDate: lastCheckInDate || null,
      checkInHistory: checkInHistoryStr ? JSON.parse(checkInHistoryStr) : [],
      unlockedMilestones: unlockedMilestonesStr ? JSON.parse(unlockedMilestonesStr) : [],
    };
  } catch (error) {
    logger.error('Error getting streak data from AsyncStorage:', error);
    return {
      currentStreak: store.currentStreak || 0,
      longestStreak: store.longestStreak || 0,
      lastCheckInDate: null,
      checkInHistory: [],
      unlockedMilestones: [],
    };
  }
}

/**
 * Save streak data
 */
async function saveStreakData(data: StreakState): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.LAST_CHECK_IN_DATE, data.lastCheckInDate || '');
    await AsyncStorage.setItem(STORAGE_KEYS.CHECK_IN_HISTORY, JSON.stringify(data.checkInHistory));
    await AsyncStorage.setItem(STORAGE_KEYS.UNLOCKED_MILESTONES, JSON.stringify(data.unlockedMilestones));
  } catch (error) {
    logger.error('Error saving streak data to AsyncStorage:', error);
  }
}

/**
 * Reset streak if more than 1 day has passed
 */
export async function checkAndResetStreakIfNeeded(): Promise<boolean> {
  const streakData = await getStreakData();

  if (!streakData.lastCheckInDate) {
    return false; // No streak yet
  }

  const lastCheckInDate = new Date(streakData.lastCheckInDate);
  const today = new Date();
  const daysSinceLastCheckIn = Math.floor(
    (today.getTime() - lastCheckInDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  // Reset if more than 1 day has passed
  if (daysSinceLastCheckIn > 1) {
    streakData.currentStreak = 0;
    streakData.lastCheckInDate = null;
    await saveStreakData(streakData);
    return true; // Streak was reset
  }

  return false; // Streak is still active
}

/**
 * Get days until next milestone
 */
export async function getDaysUntilNextMilestone(): Promise<{
  nextMilestone: number;
  daysRemaining: number;
}> {
  const streakData = await getStreakData();
  const currentStreak = streakData.currentStreak;

  const milestones = [7, 30, 90];
  for (const milestone of milestones) {
    if (currentStreak < milestone) {
      return {
        nextMilestone: milestone,
        daysRemaining: milestone - currentStreak,
      };
    }
  }

  // All milestones reached
  return {
    nextMilestone: 90,
    daysRemaining: 0,
  };
}

/**
 * Format streak for display
 */
export function formatStreakLabel(days: number): string {
  if (days >= 90) return 'Légendaire!';
  if (days >= 30) return 'Incroyable!';
  if (days >= 7) return 'Excellent!';
  return 'Bravo!';
}

/**
 * Get streak color based on milestone
 */
export function getStreakColor(
  days: number,
  theme: { colors: Record<string, Record<number, string>> }
): string {
  if (days >= 90) return theme.colors.error[600];
  if (days >= 30) return theme.colors.warning[600];
  if (days >= 7) return theme.colors.primary[600];
  return theme.colors.text[700];
}

/**
 * Initialize streak check at app startup
 */
export async function initializeStreakCheck(): Promise<void> {
  // Reset if more than 1 day has passed
  await checkAndResetStreakIfNeeded();

  // Check if should perform daily check-in
  const streakData = await getStreakData();
  const today = getTodayISO();

  if (streakData.lastCheckInDate !== today) {
    // Not checked in today - schedule reminder or auto-perform
    // This could be triggered by a button or automatic notification
    logger.debug('Streak check-in available for today');
  }
}
