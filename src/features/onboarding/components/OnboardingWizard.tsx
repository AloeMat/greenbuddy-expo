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
import { useOnboardingStore } from '../store/onboardingStore';
import { router } from 'expo-router';
import onboardingConfigJson from '../constants/onboardingConfig.json';
import { OnboardingConfig, OnboardingPage } from '../types/onboardingSchema';
import { executeActions } from '../utils/actionExecutor';
import { onboardingColors } from '@design-system/onboarding/colors';

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
   * In development: always start from page1
   * In production: resume from currentPage if exists
   */
  useEffect(() => {
    try {
      // In development mode, always reset and start from page1
      if (__DEV__) {
        onboardingStore.resetOnboarding();
        const firstPage = config.onboarding[0];
        if (firstPage) {
          onboardingStore.setCurrentPage(firstPage.id);
          setActivePage(firstPage);
        }
      } else {
        // Production: resume or start from page1
        const { currentPage } = onboardingStore;

        if (!currentPage) {
          const firstPage = config.onboarding[0];
          if (firstPage) {
            onboardingStore.setCurrentPage(firstPage.id);
            setActivePage(firstPage);
          }
        } else {
          const page = config.onboarding.find(p => p.id === currentPage);
          if (page) {
            setActivePage(page);
          } else {
            console.warn(`[OnboardingWizard] Page not found: ${currentPage}, resetting to page1`);
            const firstPage = config.onboarding[0];
            if (firstPage) {
              onboardingStore.setCurrentPage(firstPage.id);
              setActivePage(firstPage);
            }
          }
        }
      }
    } catch (error) {
      console.error('[OnboardingWizard] Initialization error:', error);
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
      console.error(`[OnboardingWizard] Error executing on_enter for ${activePage.id}:`, error);
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
        console.error(`[OnboardingWizard] Next page not found: ${nextPageId}`);
      }
    } catch (error) {
      console.error('[OnboardingWizard] Navigation error:', error);
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
        console.log(`[OnboardingWizard] Onboarding complete! Total XP: ${finalXP}`);
      }

      // Redirect to dashboard
      router.replace('/(tabs)');
    } catch (error) {
      console.error('[OnboardingWizard] Completion error:', error);
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
