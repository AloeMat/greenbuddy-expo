/**
 * Onboarding E2E Tests
 * Tests the 5-step onboarding flow
 */

describe('🎯 Onboarding Flow', () => {
  beforeAll(async () => {
    await device.launchApp();
    // Fresh install/new user
  });

  it('should display onboarding step 1 (Welcome)', async () => {
    // Step 1 should be visible
    await expect(element(by.id('onboarding-step1'))).toBeVisible();
    await expect(element(by.text('Bienvenue sur GreenBuddy'))).toBeVisible();
  });

  it('should navigate to step 2 from step 1', async () => {
    // Tap next button
    await element(by.id('onboarding-next-button')).tap();

    // Step 2 should be visible
    await expect(element(by.id('onboarding-step2'))).toBeVisible();
  });

  it('should display onboarding step 2 (Scan)', async () => {
    // Step 2 should show camera button
    await expect(element(by.id('open-camera-button'))).toBeVisible();

    // Should have skip option
    await expect(element(by.id('skip-step-button'))).toBeVisible();
  });

  it('should skip scan step', async () => {
    // Tap skip button
    await element(by.id('skip-step-button')).tap();

    // Confirm skip
    await element(by.id('skip-confirm-button')).tap();

    // Step 3 should be visible
    await expect(element(by.id('onboarding-step3'))).toBeVisible();
  });

  it('should display onboarding step 3 (Avatar Birth)', async () => {
    // Step 3 should show avatar
    await expect(element(by.id('plant-avatar'))).toBeVisible();

    // Should have name input
    await expect(element(by.id('plant-name-input'))).toBeVisible();
  });

  it('should name the plant and continue', async () => {
    // Type plant name
    await element(by.id('plant-name-input')).typeText('Mon Ami');

    // Tap continue
    await element(by.id('continue-button')).tap();

    // Step 4 should be visible
    await expect(element(by.id('onboarding-step4'))).toBeVisible();
  });

  it('should display onboarding step 4 (Voice)', async () => {
    // Avatar should be speaking
    await expect(element(by.id('plant-avatar'))).toBeVisible();

    // Should hear voice (or see text)
    await expect(element(by.text(/parler|speak/i))).toBeVisible();
  });

  it('should continue to step 5', async () => {
    // Tap continue
    await element(by.id('continue-button')).tap();

    // Step 5 should be visible
    await expect(element(by.id('onboarding-step5'))).toBeVisible();
  });

  it('should display onboarding step 5 (Preferences)', async () => {
    // Should show notification toggle
    await expect(element(by.id('notifications-toggle'))).toBeVisible();

    // Should show location toggle
    await expect(element(by.id('location-toggle'))).toBeVisible();
  });

  it('should complete onboarding', async () => {
    // Enable notifications
    await element(by.id('notifications-toggle')).tap();

    // Enable location
    await element(by.id('location-toggle')).tap();

    // Tap finish button
    await element(by.id('finish-button')).tap();

    // Should see completion alert
    await expect(element(by.text(/🎉|complet/i))).toBeVisible();

    // Confirm alert
    await element(by.id('completion-alert-button')).tap();

    // Should navigate to dashboard
    await expect(element(by.id('dashboard-screen'))).toBeVisible();
  });

  it('should show XP reward after onboarding', async () => {
    // Dashboard should display XP/level
    await expect(element(by.id('xp-bar'))).toBeVisible();
    await expect(element(by.id('level-badge'))).toBeVisible();
  });
});
