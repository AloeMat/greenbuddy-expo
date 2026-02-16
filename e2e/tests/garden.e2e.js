/**
 * Garden & Plants E2E Tests
 * Tests the plants list, add plant, and plant detail flows
 */

describe('🌱 Jardin - Gestion des Plantes', () => {
  beforeAll(async () => {
    await device.launchApp();
    // TODO: Auto-login for testing
    // await loginWithTestAccount();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should display garden screen with plants list', async () => {
    // Navigate to garden tab
    await element(by.id('tab-garden')).tap();

    // Garden screen should be visible
    await expect(element(by.id('garden-screen'))).toBeVisible();
  });

  it('should display add plant button', async () => {
    // Navigate to garden
    await element(by.id('tab-garden')).tap();

    // Add plant button should be visible
    await expect(element(by.id('add-plant-button'))).toBeVisible();
  });

  it('should open add plant modal', async () => {
    // Navigate to garden
    await element(by.id('tab-garden')).tap();

    // Tap add plant button
    await element(by.id('add-plant-button')).tap();

    // Modal should be visible
    await expect(element(by.id('add-plant-modal'))).toBeVisible();
  });

  it('should add a new plant', async () => {
    // Navigate to garden
    await element(by.id('tab-garden')).tap();

    // Open add plant modal
    await element(by.id('add-plant-button')).tap();

    // Fill plant name
    await element(by.id('plant-name-input')).typeText('Monstera Deliciosa');

    // Fill plant type
    await element(by.id('plant-type-input')).typeText('Houseplant');

    // Set watering frequency
    await element(by.id('watering-frequency-input')).multiTap(3);

    // Submit
    await element(by.id('add-plant-submit-button')).tap();

    // Plant should appear in list
    await expect(element(by.text('Monstera Deliciosa'))).toBeVisible();
  });

  it('should open plant detail screen', async () => {
    // Navigate to garden
    await element(by.id('tab-garden')).tap();

    // Tap a plant card
    await element(by.id('plant-card-0')).tap();

    // Plant detail screen should be visible
    await expect(element(by.id('plant-detail-screen'))).toBeVisible();
  });

  it('should water a plant', async () => {
    // Navigate to garden
    await element(by.id('tab-garden')).tap();

    // Open plant detail
    await element(by.id('plant-card-0')).tap();

    // Tap water button
    await element(by.id('water-button')).tap();

    // Success message should appear
    await expect(element(by.text(/watered|arrosé/i))).toBeVisible();
  });

  it('should fertilize a plant', async () => {
    // Navigate to garden
    await element(by.id('tab-garden')).tap();

    // Open plant detail
    await element(by.id('plant-card-0')).tap();

    // Tap fertilize button
    await element(by.id('fertilize-button')).tap();

    // Success message should appear
    await expect(element(by.text(/fertilized|fertilisé/i))).toBeVisible();
  });

  it('should delete a plant', async () => {
    // Navigate to garden
    await element(by.id('tab-garden')).tap();

    // Open plant detail
    await element(by.id('plant-card-0')).tap();

    // Tap delete button
    await element(by.id('delete-button')).tap();

    // Confirm deletion
    await element(by.id('delete-confirm-button')).tap();

    // Should return to garden screen
    await expect(element(by.id('garden-screen'))).toBeVisible();
  });
});
