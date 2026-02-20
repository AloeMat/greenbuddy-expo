/**
 * Streak Hook
 * Easy integration of streak functionality in components
 */

import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  performDailyCheckIn,
  getDaysUntilNextMilestone,
  formatStreakLabel,
  initializeStreakCheck,
} from '@/features/gamification/services/streakService';
import { useGamificationStore } from '@/features/gamification/store/gamificationStore';
import { logger } from '@/lib/services/logger';

interface StreakHookData {
  currentStreak: number;
  longestStreak: number;
  nextMilestone: number;
  daysRemaining: number;
  label: string;
  isCheckInAvailable: boolean;
}

interface CheckInResult {
  xpEarned: number;
  streakAfter: number;
  milestonReached?: { days: number };
}

/**
 * useStreak Hook
 * Provides streak data and check-in functionality
 */
export function useStreak(): StreakHookData & {
  performCheckIn: () => Promise<CheckInResult | null>;
  resetStreak: () => Promise<void>;
} {
  const store = useGamificationStore();
  const [nextMilestone, setNextMilestone] = useState(7);
  const [daysRemaining, setDaysRemaining] = useState(7);
  const [isCheckInAvailable, setIsCheckInAvailable] = useState(false);

  // Initialize on mount
  useEffect(() => {
    initializeStreakCheck();
    updateMilestoneInfo();
    checkCheckInStatus();
  }, []);

  // Update milestone info
  const updateMilestoneInfo = async () => {
    const { nextMilestone: next, daysRemaining: days } =
      await getDaysUntilNextMilestone();
    setNextMilestone(next);
    setDaysRemaining(days);
  };

  // Check if check-in is available today
  const checkCheckInStatus = async () => {
    try {
      const lastCheckIn = await AsyncStorage.getItem('lastCheckInDate');
      const today = new Date().toISOString().split('T')[0];
      setIsCheckInAvailable(!lastCheckIn || lastCheckIn !== today);
    } catch (error) {
      logger.error('Error checking check-in status:', error);
      setIsCheckInAvailable(true); // Allow check-in on error
    }
  };

  // Perform daily check-in
  const performCheckIn = async () => {
    const result = await performDailyCheckIn();
    await updateMilestoneInfo();
    await checkCheckInStatus();
    return result;
  };

  // Reset streak (for testing or special cases)
  const resetStreak = async () => {
    try {
      await AsyncStorage.removeItem('lastCheckInDate');
      await AsyncStorage.setItem('unlockedMilestones', '[]');
      store.resetStreak?.();
      await updateMilestoneInfo();
      await checkCheckInStatus();
    } catch (error) {
      logger.error('Error resetting streak:', error);
    }
  };

  return {
    currentStreak: store.currentStreak || 0,
    longestStreak: store.longestStreak || 0,
    nextMilestone,
    daysRemaining,
    label: formatStreakLabel(store.currentStreak || 0),
    isCheckInAvailable,
    performCheckIn,
    resetStreak,
  };
}

/**
 * Daily check-in component wrapper
 * Use this in Dashboard or main screen
 */
export function useDailyCheckIn() {
  const { performCheckIn, isCheckInAvailable } = useStreak();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<CheckInResult | null>(null);

  const handleCheckIn = async () => {
    if (!isCheckInAvailable || isLoading) return null;

    setIsLoading(true);
    try {
      const checkInResult = await performCheckIn();
      setResult(checkInResult);

      // Show success message
      if (checkInResult?.milestonReached) {
        logger.info(
          `🎉 Milestone reached: ${checkInResult.milestonReached.days} days!`
        );
      } else if (checkInResult) {
        logger.info(`✅ Check-in completed! +${checkInResult.xpEarned} XP`);
      }

      return checkInResult;
    } catch (error) {
      logger.error('Check-in failed:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    handleCheckIn,
    isLoading,
    isCheckInAvailable,
    result,
  };
}
