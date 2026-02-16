/**
 * Authentication E2E Tests
 * Tests the login, registration, and logout flows
 */

describe('🔐 Authentification', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should display login screen on app start', async () => {
    await expect(element(by.id('login-screen'))).toBeVisible();
  });

  it('should navigate to register screen', async () => {
    await element(by.id('register-button')).tap();
    await expect(element(by.id('register-screen'))).toBeVisible();
  });

  it('should register a new user', async () => {
    // Go to register screen
    await element(by.id('register-button')).tap();

    // Fill email
    await element(by.id('register-email-input')).typeText('test@greenbuddy.com');

    // Fill password
    await element(by.id('register-password-input')).typeText('TestPassword123!');

    // Confirm password
    await element(by.id('register-confirm-input')).typeText('TestPassword123!');

    // Submit registration
    await element(by.id('register-submit-button')).tap();

    // Should navigate to onboarding or dashboard
    await expect(element(by.id('onboarding-step1') || by.id('dashboard-screen'))).toBeVisible();
  });

  it('should login with valid credentials', async () => {
    // Login form should be visible
    await expect(element(by.id('login-email-input'))).toBeVisible();

    // Fill email
    await element(by.id('login-email-input')).typeText('test@greenbuddy.com');

    // Fill password
    await element(by.id('login-password-input')).typeText('TestPassword123!');

    // Submit login
    await element(by.id('login-submit-button')).tap();

    // Should navigate to dashboard or onboarding
    await expect(element(by.id('dashboard-screen') || by.id('onboarding-step1'))).toBeVisible();
  });

  it('should show error with invalid credentials', async () => {
    // Fill email
    await element(by.id('login-email-input')).typeText('wrong@email.com');

    // Fill password
    await element(by.id('login-password-input')).typeText('WrongPassword123!');

    // Submit login
    await element(by.id('login-submit-button')).tap();

    // Error message should appear
    await expect(element(by.text(/erreur|error/i))).toBeVisible();
  });
});
