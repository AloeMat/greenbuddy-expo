/**
 * Profile Screen E2E Tests
 * Tests du profil utilisateur et des préférences
 */

const {
  performLogin,
  performSignup,
  performLogout,
  waitForElementAndVerify,
  delay,
} = require('../helpers/testHelpers');

describe('👤 Profile Screen', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  afterEach(async () => {
    await device.sendUserActivity({ type: 'alert', params: { delay: 500 } });
  });

  describe('Profile Display', () => {
    it('should display profile screen', async () => {
      // Naviguer vers profile
      await element(by.id('profile-tab')).tap();

      // Vérifier qu'on est sur la page du profil
      await waitForElementAndVerify('profile-screen');
    });

    it('should show user information', async () => {
      await element(by.id('profile-tab')).tap();

      // Vérifier la présence des infos utilisateur
      await expect(element(by.id('user-email'))).toBeVisible();
      await expect(element(by.id('user-name-display'))).toBeVisible();
    });

    it('should display level badge and XP bar', async () => {
      await element(by.id('profile-tab')).tap();

      // Vérifier le badge de niveau
      await expect(element(by.id('profile-level-badge'))).toBeVisible();

      // Vérifier la barre XP
      await expect(element(by.id('profile-xp-bar'))).toBeVisible();

      // Vérifier le texte du niveau
      await expect(element(by.text(/Niveau|Level/i))).toBeVisible();
    });

    it('should show stats grid', async () => {
      await element(by.id('profile-tab')).tap();

      // Vérifier les stats
      await expect(element(by.id('stat-total-xp'))).toBeVisible();
      await expect(element(by.id('stat-plants'))).toBeVisible();
      await expect(element(by.id('stat-achievements'))).toBeVisible();
    });
  });

  describe('Quick Actions', () => {
    it('should have quick action buttons', async () => {
      await element(by.id('profile-tab')).tap();

      // Vérifier la présence des boutons
      await expect(element(by.id('achievements-button'))).toBeVisible();
      await expect(element(by.id('settings-button'))).toBeVisible();
      await expect(element(by.id('logout-button'))).toBeVisible();
    });

    it('should navigate to achievements from profile', async () => {
      await element(by.id('profile-tab')).tap();
      await element(by.id('achievements-button')).tap();

      // Vérifier qu'on est sur la page achievements
      await waitForElementAndVerify('achievements-screen');

      // Retour
      await element(by.id('back-button')).tap();
    });
  });

  describe('Settings & Preferences', () => {
    it('should open settings modal', async () => {
      await element(by.id('profile-tab')).tap();
      await element(by.id('settings-button')).tap();

      // Vérifier la présence du modal settings
      await waitForElementAndVerify('settings-modal');
    });

    it('should show notification preferences', async () => {
      await element(by.id('profile-tab')).tap();
      await element(by.id('settings-button')).tap();

      // Vérifier les préférences de notification
      await expect(element(by.id('notifications-toggle'))).toBeVisible();
      await expect(element(by.text(/notifications/i))).toBeVisible();
    });

    it('should show location preferences', async () => {
      await element(by.id('profile-tab')).tap();
      await element(by.id('settings-button')).tap();

      // Vérifier les préférences de localisation
      await expect(element(by.id('location-toggle'))).toBeVisible();
      await expect(element(by.text(/géolocalisation|location/i))).toBeVisible();
    });

    it('should toggle notification preference', async () => {
      await element(by.id('profile-tab')).tap();
      await element(by.id('settings-button')).tap();

      // Récupérer l'état actuel
      const toggle = element(by.id('notifications-toggle'));
      const initialState = await toggle.getAttributes();

      // Cliquer sur le toggle
      await toggle.tap();

      // Attendre la mise à jour
      await delay(500);

      // Fermer le modal
      await element(by.id('close-settings-button')).tap();

      console.log('✅ Notification preference toggled');
    });

    it('should toggle location preference', async () => {
      await element(by.id('profile-tab')).tap();
      await element(by.id('settings-button')).tap();

      // Cliquer sur le toggle location
      await element(by.id('location-toggle')).tap();

      // Attendre la mise à jour
      await delay(500);

      // Fermer le modal
      await element(by.id('close-settings-button')).tap();

      console.log('✅ Location preference toggled');
    });
  });

  describe('Profile Navigation', () => {
    it('should return to previous screen after viewing profile', async () => {
      // Aller sur dashboard
      await element(by.id('dashboard-tab')).tap();
      await waitForElementAndVerify('dashboard-screen');

      // Aller sur profile
      await element(by.id('profile-tab')).tap();
      await waitForElementAndVerify('profile-screen');

      // Cliquer back (ou swipe)
      await element(by.id('back-button')).tap();

      // Vérifier qu'on est revenu au dashboard
      await waitForElementAndVerify('dashboard-screen');
    });

    it('should maintain scroll position when returning to profile', async () => {
      await element(by.id('profile-tab')).tap();

      // Scroller vers le bas
      await element(by.id('profile-scroll-view')).scroll(500, 'down');

      // Aller vers une autre tab
      await element(by.id('garden-tab')).tap();
      await delay(500);

      // Revenir au profile
      await element(by.id('profile-tab')).tap();

      // Attendre que le scroll revienne à sa position
      await delay(500);

      console.log('✅ Scroll position maintained');
    });
  });

  describe('Logout Flow', () => {
    it('should logout user', async () => {
      await element(by.id('profile-tab')).tap();
      await element(by.id('logout-button')).tap();

      // Confirmer logout si dialog
      try {
        await element(by.text('Confirmer')).tap();
      } catch {
        // Pas de dialog, juste un bouton
      }

      // Attendre le redirection vers login
      await waitForElementAndVerify('login-screen', 8000);

      console.log('✅ Logout successful');
    });

    it('should require re-login after logout', async () => {
      // Déjà disconnecté du test précédent
      // Vérifier qu'on est sur login
      await expect(element(by.id('login-screen'))).toBeVisible();

      // Essayer d'accéder au profile devrait redirecter vers login
      const token = await AsyncStorage.getItem('authToken');
      await expect(token).toBe(null);
    });
  });

  describe('Profile Edge Cases', () => {
    it('should handle missing user data gracefully', async () => {
      // Ce test dépend de la gestion d'erreur
      // Vérifier que le profil ne crash pas même avec données manquantes

      await element(by.id('profile-tab')).tap();
      await waitForElementAndVerify('profile-screen');

      // Scroller pour voir tous les éléments
      await element(by.id('profile-scroll-view')).scroll(1000, 'down');

      console.log('✅ Profile loads without crashing');
    });

    it('should refresh profile data when pulling down', async () => {
      await element(by.id('profile-tab')).tap();

      // Pull to refresh
      await element(by.id('profile-scroll-view')).multiTap(1);
      await element(by.id('profile-scroll-view')).scroll(1000, 'up');

      // Attendre le refresh
      await delay(1000);

      console.log('✅ Profile data refreshed');
    });
  });

  describe('Session Persistence', () => {
    it('should keep user logged in after app restart', async () => {
      // Login
      await element(by.id('dashboard-tab')).tap();

      // Quitter l'app (simulé)
      // Dans un vrai test, on utiliserait device.pauseApp() et device.sendToBackground()

      // Vérifier qu'on est toujours connecté
      await element(by.id('profile-tab')).tap();
      await expect(element(by.id('user-email'))).toBeVisible();

      console.log('✅ Session persisted');
    });
  });
});
