/**
 * OnboardingWizard
 *
 * Main orchestrator component for the dynamic onboarding flow
 *
 * Responsibilities:
 * 1. Load JSON configuration at mount
 * 2. Manage current page state
 * 3. Execute on_enter actions when page loads
 * 4. Delegate rendering to PageRenderer
 * 5. Handle navigation between pages
 * 6. Track completion and XP rewards
 *
 * Flow:
 * page1 → page2 → page3 → page3_feedback → page4 → ... → page10 → dashboard
 */

import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { PageRenderer } from './renderers/PageRenderer';
import { useOnboardingStore } from '@/features/onboarding/store/onboardingStore';
import { router } from 'expo-router';
import onboardingConfigJson from '@/features/onboarding/constants/onboardingConfig.json';
import { OnboardingConfig, OnboardingPage } from '@/features/onboarding/types/onboardingSchema';
import { executeActions } from '@/features/onboarding/utils/actionExecutor';
import { logger } from '@/lib/services/logger';
import { onboardingColors } from '@/design-system/onboarding/colors';

/**
 * Resolve the initial page to display based on environment and saved state
 */
function resolveInitialPage(
  config: OnboardingConfig,
  savedPageId: string | null,
): OnboardingPage | null {
  const firstPage = config.onboarding[0] ?? null;

  // In dev mode, always start fresh
  if (__DEV__) return firstPage;

  // No saved state → start from page1
  if (!savedPageId) return firstPage;

  // Try to resume from saved page
  const savedPage = config.onboarding.find(p => p.id === savedPageId);
  if (savedPage) return savedPage;

  // Saved page not found in config → fall back to page1
  logger.warn(`[OnboardingWizard] Page not found: ${savedPageId}, resetting to page1`);
  return firstPage;
}

/**
 * OnboardingWizard Component
 *
 * Usage:
 * ```tsx
 * export default function OnboardingRoute() {
 *   return <OnboardingWizard />;
 * }
 * ```
 */
export function OnboardingWizard() {
  const onboardingStore = useOnboardingStore();

  // Configuration loaded from JSON
  const [config] = useState<OnboardingConfig>(onboardingConfigJson as OnboardingConfig);

  // Current active page
  const [activePage, setActivePage] = useState<OnboardingPage | null>(null);

  // Loading state
  const [isInitializing, setIsInitializing] = useState(true);

  /**
   * Initialize wizard and load first page
   */
  useEffect(() => {
    try {
      if (__DEV__) {
        onboardingStore.resetOnboarding();
      }

      const initialPage = resolveInitialPage(config, onboardingStore.currentPage);
      if (initialPage) {
        onboardingStore.setCurrentPage(initialPage.id);
        setActivePage(initialPage);
      }
    } catch (error) {
      logger.error('[OnboardingWizard] Initialization error:', error);
    } finally {
      setIsInitializing(false);
    }
  }, []);

  /**
   * Execute on_enter actions when page changes
   * Useful for animations, state updates, etc.
   */
  useEffect(() => {
    if (!activePage) return;

    try {
      if ('on_enter' in activePage && activePage.on_enter && activePage.on_enter.length > 0) {
        executeActions(activePage.on_enter, {
          store: onboardingStore,
        });
      }
    } catch (error) {
      logger.error(`[OnboardingWizard] Error executing on_enter for ${activePage.id}:`, error);
    }
  }, [activePage?.id]);

  /**
   * Navigation handler
   * Called by renderers when user advances to next page
   *
   * Responsibilities:
   * 1. Mark current page as completed
   * 2. Add XP if page has xp property
   * 3. Handle special next values (dashboard)
   * 4. Update currentPage and activePage
   */
  const handleNavigate = (nextPageId: string) => {
    try {
      // Mark current page as completed
      if (activePage) {
        onboardingStore.markPageComplete(activePage.id);

        // Add XP reward if page has xp property
        if ('xp' in activePage && activePage.xp && activePage.xp > 0) {
          onboardingStore.addXP(activePage.xp);
        }
      }

      // Handle end of onboarding
      if (nextPageId === 'dashboard') {
        completeOnboarding();
        return;
      }

      // Navigate to next page
      const nextPage = config.onboarding.find(p => p.id === nextPageId);
      if (nextPage) {
        onboardingStore.setCurrentPage(nextPageId);
        setActivePage(nextPage);
      } else {
        logger.error(`[OnboardingWizard] Next page not found: ${nextPageId}`);
      }
    } catch (error) {
      logger.error('[OnboardingWizard] Navigation error:', error);
    }
  };

  /**
   * Complete onboarding and redirect to dashboard
   */
  const completeOnboarding = async () => {
    try {
      // Mark onboarding as complete
      onboardingStore.completeOnboarding();

      // Add final XP if last page has xp property
      if (activePage && 'xp' in activePage && activePage.xp && activePage.xp > 0) {
        onboardingStore.addXP(activePage.xp);
      }

      if (__DEV__) {
        const finalXP = onboardingStore.earnedXP;
        logger.info(`[OnboardingWizard] Onboarding complete! Total XP: ${finalXP}`);
      }

      // Redirect to dashboard
      router.replace('/(tabs)');
    } catch (error) {
      logger.error('[OnboardingWizard] Completion error:', error);
      // Still redirect even if error
      router.replace('/(tabs)');
    }
  };

  // Loading state
  if (isInitializing || !activePage) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: onboardingColors.green[50],
        }}
      >
        <ActivityIndicator size="large" color={onboardingColors.green[500]} />
      </View>
    );
  }

  return (
    <PageRenderer
      page={activePage}
      onNavigate={handleNavigate}
    />
  );
}
