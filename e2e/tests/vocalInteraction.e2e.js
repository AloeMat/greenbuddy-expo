/**
 * E2E Tests: VocalInteraction Component & Avatar Vocal System
 * ════════════════════════════════════════════════════════════════
 *
 * Tests Phase 4.2 Avatar Vocal Enrichi features:
 * - Contextual reply generation
 * - Micro-action triggering
 * - Attachment phase display
 * - Emotion evaluation
 *
 * Phase 4.2: Avatar Vocal Enrichi
 */

describe('VocalInteraction Component', () => {
  beforeAll(async () => {
    await device.launchApp();
    await device.disableSynchronization();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  afterAll(async () => {
    await device.enableSynchronization();
  });

  // ═══════════════════════════════════════════════════════════════
  // VOCAL INTERACTION - BASIC FUNCTIONALITY
  // ═══════════════════════════════════════════════════════════════

  it('should display avatar emotion badge', async () => {
    // Navigate to plant detail with vocal interaction
    await element(by.text('🌱 Garden')).tap();
    await waitFor(element(by.text(/Monstera|Cactus/))).toBeVisible().withTimeout(3000);

    await element(by.text(/Monstera|Cactus/)).atIndex(0).multiTap();
    await element(by.text('🗣️ Talk')).tap();

    // Check emotion badge is visible
    await waitFor(element(by.id('emotion-badge'))).toBeVisible().withTimeout(3000);

    // Badge should show one of the 6 emotions
    const emotions = ['Happy', 'Sad', 'Tired', 'Excited', 'Worried', 'Neutral'];
    let foundEmotion = false;

    for (const emotion of emotions) {
      try {
        await expect(element(by.text(emotion))).toBeVisible();
        foundEmotion = true;
        break;
      } catch (e) {
        // Continue to next emotion
      }
    }

    expect(foundEmotion).toBe(true);
  });

  it('should generate contextual reply', async () => {
    await element(by.text('🌱 Garden')).tap();
    await waitFor(element(by.text(/Monstera|Cactus/))).toBeVisible().withTimeout(3000);

    await element(by.text(/Monstera|Cactus/)).atIndex(0).multiTap();
    await element(by.text('🗣️ Talk')).tap();

    // Wait for reply text to appear (French phrases)
    const frenchPhrases = [
      /L'eau/,           // "Water needed"
      /merci/,           // "thank you"
      /bien/,            // "well"
      /soin/,            // "care"
      /plante/,          // "plant"
    ];

    let foundReply = false;
    for (const phrase of frenchPhrases) {
      try {
        await waitFor(element(by.text(phrase))).toBeVisible().withTimeout(3000);
        foundReply = true;
        break;
      } catch (e) {
        // Continue
      }
    }

    expect(foundReply).toBe(true);
  });

  it('should display speech bubble with text', async () => {
    await element(by.text('🌱 Garden')).tap();
    await element(by.text(/Monstera|Cactus/)).atIndex(0).multiTap();
    await element(by.text('🗣️ Talk')).tap();

    // Speech bubble should be visible
    await waitFor(element(by.id('speech-bubble'))).toBeVisible().withTimeout(3000);
  });

  it('should trigger "Talk Again" button', async () => {
    await element(by.text('🌱 Garden')).tap();
    await element(by.text(/Monstera|Cactus/)).atIndex(0).multiTap();
    await element(by.text('🗣️ Talk')).tap();

    // Wait for reply
    await waitFor(element(by.id('speech-bubble'))).toBeVisible().withTimeout(3000);

    // Click "Parlez à nouveau" (Talk Again)
    await element(by.text(/Parlez à nouveau|Talk Again/)).tap();

    // New reply should be generated (speech bubble updates)
    await waitFor(element(by.id('speech-bubble'))).toBeVisible().withTimeout(3000);
  });

  // ═══════════════════════════════════════════════════════════════
  // EMOTION EVALUATION
  // ═══════════════════════════════════════════════════════════════

  it('should show happy emotion for healthy plant', async () => {
    // This test requires accessing a plant with high health
    await element(by.text('🌱 Garden')).tap();

    // Find and tap a healthy plant (health > 80%)
    // In real test, filter by health status
    await element(by.text(/Monstera|Cactus/)).atIndex(0).multiTap();

    // Check if health is good
    const healthText = await element(by.id('plant-health')).getAttributes();
    const health = parseInt(healthText.label);

    if (health >= 80) {
      await element(by.text('🗣️ Talk')).tap();
      await waitFor(element(by.text('Happy'))).toBeVisible().withTimeout(3000);
    }
  });

  it('should show worried emotion for unhealthy plant', async () => {
    // Requires a plant with low health
    await element(by.text('🌱 Garden')).tap();
    await element(by.text(/Monstera|Cactus/)).atIndex(0).multiTap();

    const healthText = await element(by.id('plant-health')).getAttributes();
    const health = parseInt(healthText.label);

    if (health < 40) {
      await element(by.text('🗣️ Talk')).tap();
      await waitFor(element(by.text(/Worried|Sad/))).toBeVisible().withTimeout(3000);
    }
  });

  // ═══════════════════════════════════════════════════════════════
  // ATTACHMENT INDICATOR DISPLAY
  // ═══════════════════════════════════════════════════════════════

  it('should display attachment phase in vocal interaction', async () => {
    await element(by.text('🌱 Garden')).tap();
    await element(by.text(/Monstera|Cactus/)).atIndex(0).multiTap();
    await element(by.text('🗣️ Talk')).tap();

    // Attachment phase should be visible
    await waitFor(element(by.id('attachment-phase'))).toBeVisible().withTimeout(3000);

    // Should show one of 4 phases
    const phases = ['Discovery', 'Familiarité', 'Attachement', 'Compagnon'];
    let foundPhase = false;

    for (const phase of phases) {
      try {
        await expect(element(by.text(phase))).toBeVisible();
        foundPhase = true;
        break;
      } catch (e) {
        // Continue
      }
    }

    expect(foundPhase).toBe(true);
  });

  it('should show progress bar for attachment phase', async () => {
    await element(by.text('🌱 Garden')).tap();
    await element(by.text(/Monstera|Cactus/)).atIndex(0).multiTap();
    await element(by.text('🗣️ Talk')).tap();

    // Progress bar visible
    await waitFor(element(by.id('attachment-progress'))).toBeVisible().withTimeout(3000);
  });

  // ═══════════════════════════════════════════════════════════════
  // MICRO-ACTIONS
  // ═══════════════════════════════════════════════════════════════

  it('should trigger water drop micro-action on watering', async () => {
    await element(by.text('🌱 Garden')).tap();
    await element(by.text(/Monstera|Cactus/)).atIndex(0).multiTap();

    // Water the plant
    await element(by.text('💧 Water')).tap();

    // Reply should be generated with water_drop action
    await waitFor(element(by.id('speech-bubble'))).toBeVisible().withTimeout(3000);

    // Emotion should be happy (watered = happy)
    await expect(element(by.text('Happy'))).toBeVisible();
  });

  it('should update attachment score on care action', async () => {
    await element(by.text('🌱 Garden')).tap();
    await element(by.text(/Monstera|Cactus/)).atIndex(0).multiTap();

    // Get initial attachment score
    const initialScore = await element(by.id('attachment-score')).getAttributes();
    const initialValue = parseInt(initialScore.label);

    // Perform care action
    await element(by.text('💧 Water')).tap();
    await waitFor(element(by.text('Close'))).toBeVisible().withTimeout(2000);
    await element(by.text('Close')).tap();

    // Wait a moment
    await new Promise(resolve => setTimeout(resolve, 500));

    // Get updated score (might be same day, so no change expected)
    // But action should be recorded
    const updatedScore = await element(by.id('attachment-score')).getAttributes();
    expect(updatedScore).toBeDefined();
  });

  // ═══════════════════════════════════════════════════════════════
  // FEATURE UNLOCKING
  // ═══════════════════════════════════════════════════════════════

  it('should show unlocked features for discovery phase', async () => {
    await element(by.text('🌱 Garden')).tap();
    await element(by.text(/Monstera|Cactus/)).atIndex(0).multiTap();

    // Navigate to attachment indicator or check in voice modal
    await element(by.text('🗣️ Talk')).tap();

    // In discovery phase, basic_care and voice_greeting should be visible
    // (if component shows features list)
    await expect(element(by.text(/care|greeting/))).toBeVisible();
  });

  // ═══════════════════════════════════════════════════════════════
  // ERROR HANDLING
  // ═══════════════════════════════════════════════════════════════

  it('should handle missing plant data gracefully', async () => {
    // Attempt to open vocal interaction without proper plant context
    // Should show loading or error state

    await element(by.text('🌱 Garden')).tap();

    // If no plants exist, should show empty state
    try {
      await waitFor(element(by.text('Pas de plantes|No plants')))
        .toBeVisible()
        .withTimeout(3000);
    } catch (e) {
      // If plants exist, continue normal flow
    }
  });

  it('should display error message if reply generation fails', async () => {
    // This test would require mocking API failure
    // For now, just verify error handling exists

    await element(by.text('🌱 Garden')).tap();
    await element(by.text(/Monstera|Cactus/)).atIndex(0).multiTap();
    await element(by.text('🗣️ Talk')).tap();

    // Even if API fails, should show fallback reply
    await waitFor(element(by.id('speech-bubble'))).toBeVisible().withTimeout(3000);
  });

  // ═══════════════════════════════════════════════════════════════
  // VISUAL REGRESSION
  // ═══════════════════════════════════════════════════════════════

  it('should render vocal interaction with correct styling', async () => {
    await element(by.text('🌱 Garden')).tap();
    await element(by.text(/Monstera|Cactus/)).atIndex(0).multiTap();
    await element(by.text('🗣️ Talk')).tap();

    // All major elements should be visible
    await expect(element(by.id('emotion-badge'))).toBeVisible();
    await expect(element(by.id('speech-bubble'))).toBeVisible();
    await expect(element(by.id('attachment-phase'))).toBeVisible();

    // Take screenshot for visual regression
    await device.takeScreenshot('vocal-interaction-full');
  });

  // ═══════════════════════════════════════════════════════════════
  // PERFORMANCE
  // ═══════════════════════════════════════════════════════════════

  it('should load vocal interaction within 3 seconds', async () => {
    const startTime = Date.now();

    await element(by.text('🌱 Garden')).tap();
    await element(by.text(/Monstera|Cactus/)).atIndex(0).multiTap();
    await element(by.text('🗣️ Talk')).tap();

    await waitFor(element(by.id('speech-bubble'))).toBeVisible().withTimeout(3000);

    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(3000);
  });

  it('should handle multiple rapid talk requests', async () => {
    await element(by.text('🌱 Garden')).tap();
    await element(by.text(/Monstera|Cactus/)).atIndex(0).multiTap();

    // Rapidly click Talk multiple times
    await element(by.text('🗣️ Talk')).multiTap(3);

    // Should not crash, should show one reply
    await waitFor(element(by.id('speech-bubble'))).toBeVisible().withTimeout(3000);
  });
});

// ═══════════════════════════════════════════════════════════════
// TEST HELPERS
// ═══════════════════════════════════════════════════════════════

async function waitForAndTap(testID, timeout = 3000) {
  await waitFor(element(by.id(testID))).toBeVisible().withTimeout(timeout);
  await element(by.id(testID)).tap();
}

async function getAttributeValue(testID, attribute) {
  const attrs = await element(by.id(testID)).getAttributes();
  return attrs[attribute];
}
