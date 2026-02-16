import * as Sentry from '@sentry/react-native';

interface PageViewEvent {
  page: string; // 'page1', 'page2', etc.
  timestamp: number;
}

interface DropOffEvent {
  page: string;
  reason: 'back_button' | 'app_close' | 'timeout';
  timeSpent: number; // seconds
}

interface CompletionEvent {
  totalTime: number; // seconds
  earnedXP: number;
  userProfile?: string;
  painPoint?: string;
}

/**
 * Track page view for analytics
 */
export const trackPageView = (page: string) => {
  const timestamp = Date.now();

  // Sentry breadcrumb
  Sentry.addBreadcrumb({
    category: 'onboarding',
    message: `Page viewed: ${page}`,
    level: 'info',
    data: { page, timestamp },
  });

  if (__DEV__) {
    console.log('[Onboarding Analytics] Page view:', { page, timestamp });
  }
};

/**
 * Track drop-off (user abandonment)
 */
export const trackDropOff = (page: string, reason: string, timeSpent: number) => {
  Sentry.captureMessage(`Onboarding drop-off at ${page}`, {
    level: 'warning',
    tags: { page, reason },
    extra: { timeSpent },
  });

  if (__DEV__) {
    console.log('[Onboarding Analytics] Drop-off:', { page, reason, timeSpent });
  }
};

/**
 * Track successful onboarding completion
 */
export const trackCompletion = (event: CompletionEvent) => {
  const { totalTime, earnedXP, userProfile, painPoint } = event;

  Sentry.captureMessage('Onboarding completed', {
    level: 'info',
    tags: {
      userProfile: userProfile || 'unknown',
      painPoint: painPoint || 'unknown',
    },
    extra: {
      totalTime,
      earnedXP,
    },
  });

  if (__DEV__) {
    console.log('[Onboarding Analytics] Completion:', {
      totalTime,
      earnedXP,
      userProfile,
      painPoint,
    });
  }
};

/**
 * Track XP earned during onboarding
 */
export const trackXPEarned = (page: string, amount: number, reason: string) => {
  Sentry.addBreadcrumb({
    category: 'onboarding-xp',
    message: `XP earned: +${amount} at ${page}`,
    level: 'info',
    data: { page, amount, reason },
  });

  if (__DEV__) {
    console.log('[Onboarding Analytics] XP earned:', { page, amount, reason });
  }
};

/**
 * Track achievement unlocked
 */
export const trackAchievementUnlocked = (achievementId: string, page: string) => {
  Sentry.addBreadcrumb({
    category: 'onboarding-achievement',
    message: `Achievement unlocked: ${achievementId}`,
    level: 'info',
    data: { achievementId, page },
  });

  if (__DEV__) {
    console.log('[Onboarding Analytics] Achievement unlocked:', {
      achievementId,
      page,
    });
  }
};
