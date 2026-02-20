/**
 * Centralized AsyncStorage keys
 *
 * Single source of truth for all AsyncStorage key strings.
 * Prevents typos and enables easy refactoring.
 */
export const STORAGE_KEYS = {
  // Gamification / Streak
  LAST_CHECK_IN_DATE: 'lastCheckInDate',
  CHECK_IN_HISTORY: 'checkInHistory',
  UNLOCKED_MILESTONES: 'unlockedMilestones',

  // Notifications
  PLANT_NOTIFICATION_MAP: 'plantNotificationMap',

  // User preferences
  LOCATION_ENABLED: 'locationEnabled',
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];
