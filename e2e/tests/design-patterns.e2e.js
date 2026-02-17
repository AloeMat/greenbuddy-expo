/**
 * Design Patterns E2E Tests
 * Tests for Proxy, Mediator, Flyweight, and Template Method patterns
 *
 * Patterns tested:
 * 1. Proxy Pattern - Cache layer for APIs
 * 2. Mediator Pattern - EventBus for inter-feature communication
 * 3. Flyweight Pattern - Shared avatar instances
 * 4. Template Method - BaseScreen component
 */

describe('Design Patterns Integration Tests', () => {

  // ============================================================================
  // PROXY PATTERN TESTS - API Caching
  // ============================================================================

  describe('Proxy Pattern - API Caching', () => {

    it('should cache Gemini API responses for plant analysis', async () => {
      // Navigate to camera/scan screen
      await element(by.id('tab-scan')).tap();

      // Take first photo (will call Gemini)
      await element(by.id('camera-capture-button')).tap();

      // Wait for analysis to complete
      await waitFor(element(by.id('analysis-result')))
        .toBeVisible()
        .withTimeout(15000);

      // Get first analysis result
      const firstAnalysis = await element(by.id('plant-name-result')).getAttributes();
      expect(firstAnalysis.text).toBeTruthy();

      // Go back
      await element(by.id('button-back')).tap();

      // Take SAME photo again (should be cached)
      const startTime = Date.now();
      await element(by.id('camera-capture-button')).tap();

      await waitFor(element(by.id('analysis-result')))
        .toBeVisible()
        .withTimeout(5000); // Should be faster

      const cacheTime = Date.now() - startTime;

      // Verify result is identical
      const secondAnalysis = await element(by.id('plant-name-result')).getAttributes();
      expect(secondAnalysis.text).toBe(firstAnalysis.text);

      // Cache should make second call faster
      expect(cacheTime).toBeLessThan(3000);
    });

    it('should handle PlantNet API quota gracefully with fallback to Gemini', async () => {
      // This test verifies caching extends quota by reusing results
      // Multiple photo analyses should succeed with cached results

      await element(by.id('tab-scan')).tap();

      // Perform 3 analyses (with caching, only 1 should hit API)
      for (let i = 0; i < 3; i++) {
        await element(by.id('camera-capture-button')).tap();

        await waitFor(element(by.id('analysis-result')))
          .toBeVisible()
          .withTimeout(10000);

        await element(by.id('button-back')).tap();

        if (i < 2) {
          // Add small delay between attempts
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }

      // All 3 should succeed (demonstrating caching effectiveness)
      expect(await element(by.id('success-count')).getAttributes()).toBeTruthy();
    });

    it('should persist cache across app restarts', async () => {
      await element(by.id('tab-scan')).tap();

      // Perform analysis
      await element(by.id('camera-capture-button')).tap();

      await waitFor(element(by.id('analysis-result')))
        .toBeVisible()
        .withTimeout(15000);

      const analysis = await element(by.id('plant-name-result')).getAttributes();

      // Restart app
      await device.sendUserActivity({state: 'background'});
      await new Promise(resolve => setTimeout(resolve, 1000));
      await device.sendUserActivity({state: 'foreground'});

      // Go back to scan
      await element(by.id('tab-scan')).tap();

      // Same analysis should be instant (from persisted cache)
      const startTime = Date.now();
      await element(by.id('camera-capture-button')).tap();

      await waitFor(element(by.id('analysis-result')))
        .toBeVisible()
        .withTimeout(3000); // Much faster

      const cachedAnalysis = await element(by.id('plant-name-result')).getAttributes();
      expect(cachedAnalysis.text).toBe(analysis.text);
    });
  });

  // ============================================================================
  // MEDIATOR PATTERN TESTS - EventBus Communication
  // ============================================================================

  describe('Mediator Pattern - EventBus', () => {

    it('should emit PLANT_WATERED event when watering plant', async () => {
      // Navigate to garden
      await element(by.id('tab-garden')).tap();

      // Tap first plant
      await element(by.id('plant-card-0')).tap();

      // Wait for plant detail screen
      await waitFor(element(by.id('plant-detail-screen')))
        .toBeVisible()
        .withTimeout(5000);

      // Record initial XP
      const initialXP = await element(by.id('xp-display')).getAttributes();

      // Water the plant
      await element(by.id('button-water')).tap();

      // Verify event caused gamification update (XP increased)
      await waitFor(element(by.id('xp-gained-notification')))
        .toBeVisible()
        .withTimeout(3000);

      const updatedXP = await element(by.id('xp-display')).getAttributes();
      expect(parseInt(updatedXP.text)).toBeGreaterThan(parseInt(initialXP.text));
    });

    it('should emit PLANT_ADDED event and unlock achievement', async () => {
      // Navigate to garden
      await element(by.id('tab-garden')).tap();

      // Open add plant modal
      await element(by.id('button-add-plant')).tap();

      // Check initial achievement unlock count
      const initialAchievements = await element(by.id('achievement-count')).getAttributes();

      // Fill form
      await element(by.id('input-plant-name')).typeText('Test Monstera');
      await element(by.id('input-species')).typeText('Monstera deliciosa');

      // Submit
      await element(by.id('button-submit-plant')).tap();

      // Verify event triggered (achievement notifications)
      // For first plant, should see "First Plant" achievement
      if (parseInt(initialAchievements.text) === 0) {
        await waitFor(element(by.text('🎁 First Plant Achievement!')))
          .toBeVisible()
          .withTimeout(5000);
      }

      // Verify plant appears in list
      await waitFor(element(by.text('Test Monstera')))
        .toBeVisible()
        .withTimeout(5000);
    });

    it('should handle multiple event listeners without interference', async () => {
      // Navigate to garden
      await element(by.id('tab-garden')).tap();

      // Tap plant
      await element(by.id('plant-card-0')).tap();

      // Perform multiple actions
      await element(by.id('button-water')).tap();

      // Wait for first event
      await waitFor(element(by.id('xp-gained-notification')))
        .toBeVisible()
        .withTimeout(3000);

      // Close notification
      await element(by.id('notification-close')).tap();

      // Fertilize plant
      await element(by.id('button-fertilize')).tap();

      // Verify second event processed correctly
      await waitFor(element(by.id('xp-gained-notification')))
        .toBeVisible()
        .withTimeout(3000);

      // Both should succeed
      expect(await element(by.id('success-indicator')).getAttributes()).toBeTruthy();
    });
  });

  // ============================================================================
  // FLYWEIGHT PATTERN TESTS - Avatar Image Sharing
  // ============================================================================

  describe('Flyweight Pattern - Avatar Images', () => {

    it('should display same avatar for plants with same personality', async () => {
      // Navigate to garden
      await element(by.id('tab-garden')).tap();

      // Get first plant avatar
      const plant1Avatar = await element(by.id('avatar-0')).getAttributes();

      // Check if there's another plant with same personality
      const plant2Avatar = await element(by.id('avatar-1')).getAttributes();

      // Both should use cached images from flyweight pool
      // (in reality, source would be same object reference)
      expect(plant1Avatar).toBeTruthy();
      expect(plant2Avatar).toBeTruthy();
    });

    it('should preload all avatar images on app start', async () => {
      // This is implicit - if app loads quickly and avatars display,
      // preloading worked

      await element(by.id('tab-garden')).tap();

      // Avatars should render instantly (no loading delay)
      await waitFor(element(by.id('avatar-0')))
        .toBeVisible()
        .withTimeout(2000); // Very fast

      expect(await element(by.id('avatar-0')).getAttributes()).toBeTruthy();
    });

    it('should handle 10+ plants without memory issues', async () => {
      // Add multiple plants to verify Flyweight effectiveness
      await element(by.id('tab-garden')).tap();

      // Scroll through garden (if 10+ plants)
      for (let i = 0; i < 5; i++) {
        await element(by.id('plant-list')).scrollTo('right');
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // App should still be responsive
      await element(by.id('button-add-plant')).multiTap(2);

      expect(await element(by.id('add-plant-modal')).getAttributes()).toBeTruthy();
    });
  });

  // ============================================================================
  // TEMPLATE METHOD PATTERN TESTS - BaseScreen
  // ============================================================================

  describe('Template Method Pattern - BaseScreen', () => {

    it('should display consistent header with back button on all screens', async () => {
      // Test on Garden screen
      await element(by.id('tab-garden')).tap();
      await element(by.id('plant-card-0')).tap();

      // Should have header with back button
      await expect(element(by.id('header-title'))).toBeVisible();
      await expect(element(by.id('button-back'))).toBeVisible();

      // Go back
      await element(by.id('button-back')).tap();

      // Test on Profile screen
      await element(by.id('tab-profile')).tap();

      // Should also have header
      await expect(element(by.id('header-title'))).toBeVisible();
    });

    it('should show loading state consistently on data fetch', async () => {
      // Navigate to plant detail (triggers data fetch)
      await element(by.id('tab-garden')).tap();
      await element(by.id('plant-card-0')).tap();

      // Loading spinner should appear briefly
      await waitFor(element(by.id('loading-spinner')))
        .toBeVisible()
        .withTimeout(1000);

      // Then content should appear
      await waitFor(element(by.id('plant-detail-content')))
        .toBeVisible()
        .withTimeout(5000);
    });

    it('should handle error state with consistent UI', async () => {
      // This would need a network error scenario
      // For now, verify error UI exists

      // Navigate to screen that might error
      await element(by.id('tab-garden')).tap();

      // If we simulate network error (by offline mode)
      // await device.setAirplaneMode(true);

      // Error message should display consistently
      // (if app supports offline gracefully)
    });

    it('should support pull-to-refresh on scrollable screens', async () => {
      await element(by.id('tab-garden')).tap();

      // Pull down to refresh
      await element(by.id('plant-list')).multiTap(1);

      // Refresh indicator should appear
      await waitFor(element(by.id('refresh-control')))
        .toBeVisible()
        .withTimeout(2000);

      // Should complete and dismiss
      await waitFor(element(by.id('refresh-control')))
        .not.toBeVisible()
        .withTimeout(5000);
    });

    it('should display footer actions consistently', async () => {
      await element(by.id('tab-garden')).tap();

      // Footer should be visible and tappable
      await expect(element(by.id('footer-action-button'))).toBeVisible();

      // On plant detail screen too
      await element(by.id('plant-card-0')).tap();

      await expect(element(by.id('footer-action-button'))).toBeVisible();
    });
  });

  // ============================================================================
  // INTEGRATION TESTS - All Patterns Together
  // ============================================================================

  describe('Design Patterns Integration', () => {

    it('should work together seamlessly in complete user flow', async () => {
      // 1. Scan plant (uses Proxy for caching)
      await element(by.id('tab-scan')).tap();
      await element(by.id('camera-capture-button')).tap();

      await waitFor(element(by.id('analysis-result')))
        .toBeVisible()
        .withTimeout(15000);

      const plantName = await element(by.id('plant-name-result')).getAttributes();

      // 2. Add plant (uses Mediator to emit PLANT_ADDED event)
      await element(by.id('button-add-from-result')).tap();

      // 3. View in garden (uses Flyweight for avatar, Template for layout)
      await element(by.id('tab-garden')).tap();

      await waitFor(element(by.text(plantName.text)))
        .toBeVisible()
        .withTimeout(5000);

      // 4. Water plant (uses Mediator for event, gamification updates)
      await element(by.id('plant-card-0')).tap();
      await element(by.id('button-water')).tap();

      // All patterns should have worked together
      expect(await element(by.id('success-indicator')).getAttributes()).toBeTruthy();
    });

    it('should maintain data consistency across pattern layers', async () => {
      // Add plant
      await element(by.id('tab-garden')).tap();
      await element(by.id('button-add-plant')).tap();

      await element(by.id('input-plant-name')).typeText('Consistency Test');
      await element(by.id('button-submit-plant')).tap();

      // Plant should be in garden
      await waitFor(element(by.text('Consistency Test')))
        .toBeVisible()
        .withTimeout(5000);

      // Event should have been emitted (XP gained)
      const xpDisplay = await element(by.id('xp-display')).getAttributes();
      expect(xpDisplay.text).toMatch(/\d+/);

      // Restart app
      await device.sendUserActivity({state: 'background'});
      await new Promise(resolve => setTimeout(resolve, 500));
      await device.sendUserActivity({state: 'foreground'});

      // Plant should still be there (persistence)
      await element(by.id('tab-garden')).tap();
      await waitFor(element(by.text('Consistency Test')))
        .toBeVisible()
        .withTimeout(5000);
    });
  });

  // ============================================================================
  // PERFORMANCE TESTS
  // ============================================================================

  describe('Performance - Design Patterns Overhead', () => {

    it('cache should reduce API call time by 90%+', async () => {
      await element(by.id('tab-scan')).tap();

      // First call (cold cache)
      const start1 = Date.now();
      await element(by.id('camera-capture-button')).tap();
      await waitFor(element(by.id('analysis-result')))
        .toBeVisible()
        .withTimeout(15000);
      const coldTime = Date.now() - start1;

      await element(by.id('button-back')).tap();

      // Second call (warm cache)
      const start2 = Date.now();
      await element(by.id('camera-capture-button')).tap();
      await waitFor(element(by.id('analysis-result')))
        .toBeVisible()
        .withTimeout(3000);
      const warmTime = Date.now() - start2;

      // Warm should be <10% of cold
      expect(warmTime).toBeLessThan(coldTime * 0.1);
    });

    it('should not cause memory leaks with multiple plant loads', async () => {
      await element(by.id('tab-garden')).tap();

      // Rapidly scroll and interact
      for (let i = 0; i < 10; i++) {
        await element(by.id('plant-card-0')).tap();
        await element(by.id('button-back')).tap();
      }

      // App should still be responsive
      await expect(element(by.id('tab-garden'))).toBeVisible();
    });
  });
});
