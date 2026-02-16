# Guide Complet: E2E Testing avec Detox

## 📋 Table des matières

1. [Overview](#overview)
2. [Setup Initial](#setup-initial)
3. [Écriture de Tests](#écriture-de-tests)
4. [Exécution des Tests](#exécution-des-tests)
5. [CI/CD Integration](#cicd-integration)
6. [Debugging & Troubleshooting](#debugging--troubleshooting)
7. [Best Practices](#best-practices)

---

## Overview

### Qu'est-ce que Detox?

Detox est un framework E2E (End-to-End) testing pour applications React Native.

**Avantages:**
- ✅ Tests automatisés réalistes (simule l'utilisateur réel)
- ✅ Pas de timing fragile (pas de `setTimeout`, `waitFor` intégré)
- ✅ Synchronisation automatique avec l'app (attends que l'app soit stable)
- ✅ Cross-platform (iOS et Android)
- ✅ Intégration CI/CD facile

### Architecture de Test GreenBuddy

```
greenbuddy-expo/
├── e2e/
│   ├── config.e2e.js           # Configuration globale
│   ├── globalSetup.js          # Setup avant tous les tests
│   ├── globalTeardown.js       # Cleanup après tous les tests
│   ├── helpers/
│   │   └── testHelpers.js      # Fonctions réutilisables
│   └── tests/
│       ├── auth.e2e.js         # Tests authentification
│       ├── garden.e2e.js       # Tests gestion plantes
│       ├── onboarding.e2e.js   # Tests onboarding
│       ├── gamification.e2e.js # Tests XP/achievements
│       └── profile.e2e.js      # Tests profil utilisateur
├── .detoxrc.json               # Configuration Detox
├── jest.config.js              # Configuration Jest
└── package.json                # Scripts de test
```

---

## Setup Initial

### Prérequis

```bash
# Node.js 14+
node --version

# Xcode 14+ (pour iOS)
xcode-select --install

# Android SDK (pour Android)
# ou utiliser Android Studio

# CocoaPods (pour iOS dependencies)
sudo gem install cocoapods
```

### Installation Dépendances

Les dépendances sont déjà dans `package.json`. Pour les installer:

```bash
cd greenbuddy-expo
npm install

# Installer les pods iOS (si testé sur iOS)
cd ios
pod install
cd ..
```

### Configuration App.json

Vérifier que `app.json` contient la configuration Detox:

```json
{
  "expo": {
    "plugins": [
      ["detox/plugin", { "android": true, "ios": true }]
    ]
  }
}
```

---

## Écriture de Tests

### Structure d'un Test

```javascript
describe('Feature Name', () => {
  beforeAll(async () => {
    // Exécuté une fois avant tous les tests
    await device.launchApp();
  });

  beforeEach(async () => {
    // Exécuté avant chaque test
    await reloadApp();
  });

  it('should do something', async () => {
    // Test case
    await element(by.id('button-id')).tap();
    await expect(element(by.text('Expected Text'))).toBeVisible();
  });
});
```

### Sélecteurs Detox

```javascript
// Par ID
element(by.id('my-button'))

// Par texte exact
element(by.text('Click me'))

// Par texte partial (regex)
element(by.text(/click/i))

// Par label (accessibility)
element(by.label('My Label'))

// Par type (React Native)
element(by.type('RCTScrollView'))

// Combinaisons
element(
  by.type('RCTButton').and(by.text('Save'))
)
```

### Actions Disponibles

```javascript
// Tap (clic)
await element(by.id('button')).tap();

// Multi-tap (double-clic)
await element(by.id('button')).multiTap(2);

// Texte input
await element(by.id('input')).typeText('hello');

// Clear input
await element(by.id('input')).clearText();

// Scroll
await element(by.id('scroll-view')).scroll(500, 'down');

// Swipe
await element(by.id('view')).swipe('left');

// Long press
await element(by.id('button')).longPress();

// Multiple taps
await element(by.id('button')).multiTap(3);
```

### Assertions Disponibles

```javascript
// Visible
await expect(element(by.id('view'))).toBeVisible();

// Not visible
await expect(element(by.id('view'))).not.toBeVisible();

// Texte exact
await expect(element(by.id('text'))).toHaveText('Expected');

// Toggled on/off
await expect(element(by.id('toggle'))).toHaveToggleValue(true);

// Multiple assertions
await expect(element(by.id('view')))
  .toBeVisible()
  .and(toHaveText('Something'));
```

### Attendre des Éléments

```javascript
// Attendre jusqu'à 5 secondes
await waitFor(element(by.text('Loaded')))
  .toBeVisible()
  .withTimeout(5000);

// Attendre avec fallback
try {
  await waitFor(element(by.id('modal')))
    .toBeVisible()
    .withTimeout(3000);
} catch {
  console.log('Modal not appeared');
}
```

### Utiliser les Test Helpers

```javascript
const { performLogin, addNewPlant } = require('../helpers/testHelpers');

it('should add plant after login', async () => {
  // Login avec helper
  await performLogin('user@example.com', 'password123');

  // Add plant avec helper
  await addNewPlant('Monstera', 'Monstera deliciosa');

  // Vérifier le résultat
  await expect(element(by.text('Monstera'))).toBeVisible();
});
```

---

## Exécution des Tests

### Tests Locaux

#### Sur iOS Simulator

```bash
# Build et run les tests
npm run test:e2e

# Ou étapes séparées
npm run test:e2e:build  # Build l'app
npm run test:e2e:test   # Run les tests

# Avec output verbeux
npm run test:e2e -- --verbose

# Tests spécifiques
npm run test:e2e -- --testNamePattern="Auth"

# Avec recording
npm run test:e2e -- --record-logs all
```

#### Sur Android Emulator

```bash
# Dans .detoxrc.json, ajouter config Android:
# "android.emu.debug": { ... }

npm run test:e2e -- --configuration android.emu.debug
```

### Voir les Résultats

Tests exécutés → Résultats dans:
- `artifacts/detox-results.xml` (format JUnit)
- Console output (formaté par Jest)

### Debugging

#### Voir ce qui se passe

```bash
# Record vidéo de chaque test
npm run test:e2e -- --record-logs all

# Voir la vidéo après
open artifacts/  # macOS
explorer artifacts  # Windows
```

#### Pause et inspection

```javascript
it('debug test', async () => {
  await element(by.id('button')).tap();

  // Pause l'exécution (30 secondes pour inspecter)
  await device.pause();

  // Continuer
  // Appuyer sur 'c' dans le terminal
});
```

#### Screenshot manuel

```javascript
const { takeScreenshot } = require('../helpers/testHelpers');

it('take screenshot', async () => {
  await element(by.id('button')).tap();

  await takeScreenshot('button-clicked');
});
```

---

## CI/CD Integration

### GitHub Actions

Créer `.github/workflows/e2e-tests.yml`:

```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: macos-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm install

      - name: Build app for testing
        run: npm run test:e2e:build

      - name: Run E2E tests
        run: npm run test:e2e:test

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: detox-results
          path: artifacts/

      - name: Comment PR with results
        if: github.event_name == 'pull_request' && always()
        uses: actions/github-script@v6
        with:
          script: |
            const fs = require('fs');
            const results = fs.readFileSync('artifacts/detox-results.xml', 'utf8');
            // Parse et commenter sur le PR
```

### GitLab CI

Créer `.gitlab-ci.yml`:

```yaml
e2e_tests:
  image: node:18-alpine
  stage: test
  script:
    - npm install
    - npm run test:e2e:build
    - npm run test:e2e:test
  artifacts:
    paths:
      - artifacts/
    reports:
      junit: artifacts/detox-results.xml
    when: always
```

### EAS Build with Testing

Detox peut s'intégrer avec EAS Build pour tester les builds production:

```bash
# Build avec Detox
eas build --platform ios --profile testing-production

# Run tests contre le build
npm run test:e2e
```

---

## Debugging & Troubleshooting

### Common Issues

#### Issue: "Element not found"

```javascript
// ❌ Mauvais
await element(by.id('my-button')).tap();

// ✅ Correct: Attendre d'abord
await waitFor(element(by.id('my-button')))
  .toBeVisible()
  .withTimeout(5000);
await element(by.id('my-button')).tap();
```

#### Issue: "Timeout waiting for synchronization"

L'app n'est pas stable. Solutions:

```javascript
// Ajouter delay
await delay(1000);

// Ou attendre un élément spécifique
await waitFor(element(by.id('loaded-indicator')))
  .toBeVisible()
  .withTimeout(10000);
```

#### Issue: "Keyboard keeps appearing"

```javascript
// Dismiss keyboard après typeText
await element(by.id('input')).typeText('text');
await element(by.id('input')).multiTap(2); // Double-tap pour fermer
```

### Logging & Monitoring

```javascript
// Custom logs
console.log('Debug message');

// Device logs
device.logLevel = 'verbose';

// Voir les logs d'erreur
await device.logLevelHigh();
```

### Recording & Analysis

```bash
# Recorder les interactions
npm run test:e2e -- --record-logs all

# Outputs:
# - artifacts/*.mp4 (vidéos)
# - artifacts/detox-results.xml (résultats)
```

---

## Best Practices

### 1. Tests Indépendants

Chaque test doit être indépendant:

```javascript
// ✅ Bon
describe('Features', () => {
  it('feature 1', async () => {
    await device.launchApp();
    // Test 1
  });

  it('feature 2', async () => {
    await device.launchApp();
    // Test 2 (ne dépend pas de test 1)
  });
});

// ❌ Mauvais
let globalState;
it('test 1', () => {
  globalState = setup();
});
it('test 2', () => {
  use(globalState); // Dépend de test 1 !
});
```

### 2. Utiliser les Helpers

Réutiliser les fonctions du `testHelpers.js`:

```javascript
// ✅ Réutilisable
const { performLogin, waitForElementAndVerify } = require('../helpers/testHelpers');

await performLogin('user@example.com', 'password');

// ❌ Code dupliqué
await element(by.id('email-input')).tap();
await element(by.id('email-input')).typeText('user@example.com');
await element(by.id('password-input')).tap();
await element(by.id('password-input')).typeText('password');
await element(by.id('login-button')).tap();
```

### 3. Naming Convention

```javascript
// ✅ Clair
it('should display welcome message on first login', async () => {});

// ❌ Vague
it('test login', async () => {});
```

### 4. Setup & Teardown

```javascript
describe('Plant Management', () => {
  beforeEach(async () => {
    // Setup avant chaque test
    await device.reloadReactNative();
  });

  afterEach(async () => {
    // Cleanup après chaque test
    // Reset app state si nécessaire
  });

  it('test 1', async () => {});
  it('test 2', async () => {});
});
```

### 5. Délais et Synchronisation

```javascript
// ✅ Bon: waitFor avec timeout
await waitFor(element(by.id('loaded')))
  .toBeVisible()
  .withTimeout(5000);

// ❌ Mauvais: delay fixe
await delay(5000); // Peut être trop court ou trop long
```

### 6. Error Handling

```javascript
// ✅ Avec fallback
try {
  await element(by.id('optional-element')).tap();
} catch (error) {
  console.log('Optional element not found, continuing');
}

// ❌ Sans gestion
await element(by.id('optional-element')).tap(); // Crash si absent
```

### 7. Matchers Robustes

```javascript
// ✅ Regex pour flexibilité
await expect(element(by.text(/loading|chargement/i))).toBeVisible();

// ❌ Exact text (fragile si texte change)
await expect(element(by.text('Loading...'))).toBeVisible();
```

---

## Performance & Optimization

### Réduire le temps de test

1. **Paralléliser (si possible)**
   ```bash
   # Remarque: Detox ne supporte pas bien les parallèles
   # Garder maxWorkers: 1 dans jest.config.js
   ```

2. **Optimiser les timeouts**
   ```javascript
   // Réduire si l'app est rapide
   .withTimeout(3000) // 3s au lieu de 5s
   ```

3. **Reuse app state**
   ```javascript
   // Réutiliser l'app plutôt que de la relancer
   beforeEach(async () => {
     // Ne pas faire device.launchApp() chaque fois
   });
   ```

### Coût de test

```
Temps d'exécution approximatif:
- Build app: 2-3 minutes
- Auth test: 30 secondes
- Garden test: 1 minute
- Onboarding test: 2 minutes
- Gamification test: 1.5 minutes
- Profile test: 45 secondes

Total: ~7-8 minutes pour suite complète
```

---

## Exemples Complets

### Test Simple

```javascript
describe('Login', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  it('should login with valid credentials', async () => {
    // Arrange
    const email = 'test@example.com';
    const password = 'password123';

    // Act
    await element(by.id('email-input')).typeText(email);
    await element(by.id('password-input')).typeText(password);
    await element(by.id('login-button')).tap();

    // Assert
    await waitFor(element(by.id('dashboard-screen')))
      .toBeVisible()
      .withTimeout(8000);
  });
});
```

### Test Complexe avec Helper

```javascript
const { performLogin, addNewPlant, waterPlant } = require('../helpers/testHelpers');

describe('Complete User Flow', () => {
  it('should complete user journey', async () => {
    // Login
    await performLogin('journey@example.com', 'password123');

    // Add plant
    await addNewPlant('Calathea', 'Calathea orbifolia');

    // Care for plant
    await waterPlant(0);

    // Verify gamification
    await element(by.id('profile-tab')).tap();
    await expect(element(by.id('xp-display'))).toBeVisible();
  });
});
```

---

## Ressources

- [Detox Official Docs](https://wix.github.io/Detox/)
- [Jest Documentation](https://jestjs.io/)
- [React Native Testing](https://reactnative.dev/docs/testing-overview)
- [GreenBuddy E2E Tests](../e2e/)

---

**Dernière mise à jour**: Phase 5.2
**Statut**: ✅ Infrastructure Complète, Tests Prêts à Exécuter
**Prochaines étapes**: Exécuter tests en local, intégrer CI/CD GitHub Actions
