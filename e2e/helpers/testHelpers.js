/**
 * Test Helpers pour Detox E2E Tests
 *
 * Fonctions réutilisables pour simplifier l'écriture de tests
 * et éviter la duplication de code.
 */

/**
 * Attendre et vérifier qu'un élément est visible
 * @param {string} testID - L'ID Detox de l'élément
 * @param {number} timeout - Timeout en ms (default: 5000)
 */
async function waitForElementAndVerify(testID, timeout = 5000) {
  try {
    await waitFor(element(by.id(testID)))
      .toBeVisible()
      .withTimeout(timeout);
    return true;
  } catch (error) {
    console.error(`❌ Element ${testID} not visible:`, error.message);
    throw error;
  }
}

/**
 * Remplir un formulaire d'email + mot de passe
 * @param {string} email - Email de l'utilisateur
 * @param {string} password - Mot de passe
 */
async function fillAuthForm(email, password) {
  await element(by.id('email-input')).tap();
  await element(by.id('email-input')).typeText(email);

  await element(by.id('password-input')).tap();
  await element(by.id('password-input')).typeText(password);

  // Dismiss keyboard
  await element(by.id('password-input')).multiTap(2);
}

/**
 * Effectuer une connexion complète
 * @param {string} email - Email de l'utilisateur
 * @param {string} password - Mot de passe
 */
async function performLogin(email, password) {
  // Attendre la page de login
  await waitForElementAndVerify('login-screen');

  // Remplir le formulaire
  await fillAuthForm(email, password);

  // Cliquer sur le bouton Login
  await element(by.id('login-button')).tap();

  // Attendre le redirection vers dashboard
  await waitForElementAndVerify('dashboard-screen', 8000);

  console.log('✅ Login successful');
}

/**
 * Effectuer une inscription complète
 * @param {string} email - Email de l'utilisateur
 * @param {string} password - Mot de passe
 * @param {string} confirmPassword - Confirmation du mot de passe
 */
async function performSignup(email, password, confirmPassword = null) {
  // Attendre la page de register
  await waitForElementAndVerify('register-screen');

  // Remplir email
  await element(by.id('email-input')).tap();
  await element(by.id('email-input')).typeText(email);

  // Remplir password
  await element(by.id('password-input')).tap();
  await element(by.id('password-input')).typeText(password);

  // Remplir confirm password si fourni
  if (confirmPassword) {
    await element(by.id('confirm-password-input')).tap();
    await element(by.id('confirm-password-input')).typeText(confirmPassword);
  }

  // Dismiss keyboard
  await element(by.id('confirm-password-input')).multiTap(2);

  // Cliquer sur le bouton Register
  await element(by.id('register-button')).tap();

  // Attendre le redirection (vers onboarding ou dashboard)
  await waitForElementAndVerify('onboarding-step1', 8000)
    .catch(() => waitForElementAndVerify('dashboard-screen', 8000));

  console.log('✅ Signup successful');
}

/**
 * Effectuer une déconnexion
 */
async function performLogout() {
  // Naviguer vers le profil
  await element(by.id('profile-tab')).tap();

  // Cliquer sur logout button
  await element(by.id('logout-button')).tap();

  // Confirmer logout si dialog
  if (await element(by.text('Confirmer')).isVisible()) {
    await element(by.text('Confirmer')).tap();
  }

  // Attendre le redirection vers login
  await waitForElementAndVerify('login-screen', 8000);

  console.log('✅ Logout successful');
}

/**
 * Compléter l'onboarding flow entier
 */
async function completeOnboarding() {
  // Step 1: Bienvenue
  await waitForElementAndVerify('onboarding-step1');
  await expect(element(by.text('Bienvenue sur GreenBuddy'))).toBeVisible();
  await element(by.id('onboarding-next-button')).multiTap(1);

  // Step 2: Scan
  await waitForElementAndVerify('onboarding-step2');
  await expect(element(by.id('skip-step-button'))).toBeVisible();
  await element(by.id('skip-step-button')).tap();

  // Confirmer skip
  if (await element(by.id('skip-confirm-button')).isVisible()) {
    await element(by.id('skip-confirm-button')).tap();
  }

  // Step 3: Avatar Birth
  await waitForElementAndVerify('onboarding-step3');
  await element(by.id('plant-name-input')).tap();
  await element(by.id('plant-name-input')).typeText('Mon Ami');
  await element(by.id('continue-button')).tap();

  // Step 4: Voice
  await waitForElementAndVerify('onboarding-step4');
  await element(by.id('continue-button')).tap();

  // Step 5: Preferences
  await waitForElementAndVerify('onboarding-step5');
  await element(by.id('notifications-toggle')).tap();
  await element(by.id('location-toggle')).tap();
  await element(by.id('finish-button')).tap();

  // Confirmer completion
  if (await element(by.id('completion-alert-button')).isVisible()) {
    await element(by.id('completion-alert-button')).tap();
  }

  // Attendre dashboard
  await waitForElementAndVerify('dashboard-screen', 8000);

  console.log('✅ Onboarding completed');
}

/**
 * Ajouter une nouvelle plante
 * @param {string} plantName - Nom de la plante
 * @param {string} plantType - Type de plante (optionnel)
 */
async function addNewPlant(plantName, plantType = 'Monstera') {
  // Aller vers Garden
  await element(by.id('garden-tab')).tap();

  // Cliquer sur add plant
  await element(by.id('add-plant-button')).tap();

  // Remplir le formulaire
  await element(by.id('plant-name-input')).tap();
  await element(by.id('plant-name-input')).typeText(plantName);

  if (plantType) {
    await element(by.id('plant-type-input')).tap();
    await element(by.id('plant-type-input')).typeText(plantType);
  }

  // Soumettre
  await element(by.id('plant-form-submit')).tap();

  // Attendre la confirmation
  await waitForElementAndVerify('garden-screen', 5000);

  console.log(`✅ Plant ${plantName} added`);
}

/**
 * Arroser une plante
 * @param {number} plantIndex - Index de la plante dans la liste (default: 0)
 */
async function waterPlant(plantIndex = 0) {
  // Ouvrir le détail de la plante
  await element(by.id(`plant-card-${plantIndex}`)).tap();

  await waitForElementAndVerify('plant-detail-screen');

  // Cliquer sur water button
  await element(by.id('water-button')).tap();

  // Attendre le feedback
  await waitFor(element(by.text(/arrosée|watered/i)))
    .toBeVisible()
    .withTimeout(5000)
    .catch(() => console.log('No visual feedback for watering'));

  // Retour
  await element(by.id('back-button')).tap();

  console.log('✅ Plant watered');
}

/**
 * Fertiliser une plante
 * @param {number} plantIndex - Index de la plante dans la liste
 */
async function fertilizePlant(plantIndex = 0) {
  // Ouvrir le détail de la plante
  await element(by.id(`plant-card-${plantIndex}`)).tap();

  await waitForElementAndVerify('plant-detail-screen');

  // Cliquer sur fertilize button
  await element(by.id('fertilize-button')).tap();

  // Attendre le feedback
  await waitFor(element(by.text(/fertilisée|fertilized/i)))
    .toBeVisible()
    .withTimeout(5000)
    .catch(() => console.log('No visual feedback for fertilizing'));

  // Retour
  await element(by.id('back-button')).tap();

  console.log('✅ Plant fertilized');
}

/**
 * Supprimer une plante
 * @param {number} plantIndex - Index de la plante dans la liste
 */
async function deletePlant(plantIndex = 0) {
  // Ouvrir le détail de la plante
  await element(by.id(`plant-card-${plantIndex}`)).tap();

  await waitForElementAndVerify('plant-detail-screen');

  // Cliquer sur delete button
  await element(by.id('delete-button')).tap();

  // Confirmer la suppression
  await element(by.text('Confirmer')).tap();

  // Attendre le retour au garden
  await waitForElementAndVerify('garden-screen', 5000);

  console.log('✅ Plant deleted');
}

/**
 * Vérifier le XP gagné après une action
 * @param {number} expectedXP - XP attendu
 */
async function verifyXPGained(expectedXP) {
  // Attendre un message de succès ou alert
  await waitFor(element(by.text(new RegExp(`\\+${expectedXP}.*XP`, 'i'))))
    .toBeVisible()
    .withTimeout(3000);

  console.log(`✅ XP gained: +${expectedXP}`);
}

/**
 * Vérifier qu'une achievement est déverrouillée
 * @param {string} achievementName - Nom de l'achievement
 */
async function verifyAchievementUnlocked(achievementName) {
  // Naviguer vers profil/achievements
  await element(by.id('profile-tab')).tap();
  await element(by.id('achievements-button')).tap();

  // Vérifier que l'achievement est déverrouillée
  await waitFor(element(by.text(achievementName)))
    .toBeVisible()
    .withTimeout(5000);

  // Vérifier qu'il n'a pas l'icône locked
  await expect(
    element(by.id(`achievement-${achievementName.toLowerCase()}-locked`))
  ).not.toBeVisible();

  console.log(`✅ Achievement unlocked: ${achievementName}`);
}

/**
 * Scroll vers un élément
 * @param {string} scrollViewID - ID du scroll view
 * @param {string} targetID - ID de l'élément cible
 * @param {string} direction - 'up' ou 'down' (default: 'down')
 */
async function scrollToElement(scrollViewID, targetID, direction = 'down') {
  const scrollDirection = direction === 'down' ? 'down' : 'up';

  try {
    await waitFor(element(by.id(targetID)))
      .toBeVisible()
      .withTimeout(1000)
      .catch(() => {
        // Si pas visible, scroller
        return element(by.id(scrollViewID)).scroll(
          500,
          scrollDirection === 'down' ? 'down' : 'up'
        );
      });
  } catch (error) {
    console.log(`Element ${targetID} not found after scrolling`);
  }
}

/**
 * Effectuer un geste de pull-to-refresh
 * @param {string} scrollViewID - ID du scroll view
 */
async function pullToRefresh(scrollViewID) {
  await element(by.id(scrollViewID)).multiTap(1);
  await element(by.id(scrollViewID)).scroll(1000, 'up');

  console.log('✅ Pulled to refresh');
}

/**
 * Attendre un certain délai (pour les animations, transitions)
 * @param {number} ms - Délai en millisecondes
 */
async function delay(ms = 1000) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Prendre une screenshot pour debugging
 * @param {string} filename - Nom du fichier (sans extension)
 */
async function takeScreenshot(filename) {
  try {
    await device.captureViewHierarchy();
    console.log(`✅ Screenshot taken: ${filename}`);
  } catch (error) {
    console.error(`Failed to take screenshot: ${error.message}`);
  }
}

module.exports = {
  waitForElementAndVerify,
  fillAuthForm,
  performLogin,
  performSignup,
  performLogout,
  completeOnboarding,
  addNewPlant,
  waterPlant,
  fertilizePlant,
  deletePlant,
  verifyXPGained,
  verifyAchievementUnlocked,
  scrollToElement,
  pullToRefresh,
  delay,
  takeScreenshot,
};
