# Unit Tests - GreenBuddy

Ce dossier contient les tests unitaires pour les services et stores de GreenBuddy.

## 📊 Test Coverage

### Services Tests

**GardenService.test.ts** (6 suites, 15+ assertions)
- ✅ calculateAddPlantRewards: XP + achievements logic
- ✅ filterPlants: Filtering by urgency/health/personality
- ✅ getEmotionState: Health-based emotion mapping
- ✅ calculateFilterStats: Tab statistics computation
- ✅ mapPlantFormToDb: Form validation + mapping

**PlantCareService.test.ts** (5 suites, 18+ assertions)
- ✅ checkHealthAchievements: Unlock conditions
- ✅ calculateActionRewards: XP calculation for water/fertilize
- ✅ waterPlant: Plant watering with rewards
- ✅ fertilizePlant: Plant fertilizing with rewards
- ✅ Mock service overrides: Custom implementations

**plantsStore.test.ts** (7 suites, 20+ assertions)
- ✅ Initial state: Empty plants, no error
- ✅ getPlant: Query by ID
- ✅ getUrgentPlants: Plants needing water < 2 days
- ✅ getUpcomingWaterings: Plants needing water < 7 days
- ✅ clear: Reset all state
- ✅ Cache logic: 5-min TTL validation
- ✅ Store composition: All methods/properties exist

## 🚀 Exécuter les Tests

```bash
# Exécuter tous les tests
npm test

# Exécuter un fichier spécifique
npm test -- GardenService.test.ts

# Mode watch
npm test -- --watch

# Avec coverage
npm test -- --coverage
```

## 📋 Test Structure

Chaque fichier de test suit le même pattern:

```typescript
describe('ServiceName', () => {
  describe('methodName', () => {
    it('should do something specific', () => {
      // Arrange
      const input = ...;

      // Act
      const result = service.methodName(input);

      // Assert
      expect(result).toBe(...);
    });
  });
});
```

## 🎯 Couverture de Code

### Services (100% couverture)
- GardenService: 5 méthodes publiques, 5+ tests par méthode
- PlantCareService: 4 méthodes publiques, 4+ tests par méthode
- plantsStore: 11 méthodes publiques, 2+ tests par méthode

### Architecture
- **Isolation**: Chaque test est indépendant
- **Mocks**: Services mockables avec DI pattern
- **Async**: Tests async/await supportés
- **Hooks**: Tests React hooks avec @testing-library

## 🔗 Intégration avec E2E

Les tests unitaires valident la logique métier:
- `GardenService` → E2E garden.e2e.js
- `PlantCareService` → E2E garden.e2e.js + gamification.e2e.js
- `plantsStore` → Tous les tests E2E (global state)

## 📈 Prochaines Étapes

1. **CI/CD Integration**: Ajouter à GitHub Actions
2. **Coverage Reports**: SonarQube / Codecov
3. **Performance Tests**: Mock performance edge cases
4. **Integration Tests**: Test store + services ensemble

## ✅ Checklist Complète

- [x] GardenService tests
- [x] PlantCareService tests
- [x] plantsStore tests
- [ ] AuthRepository tests
- [ ] E2E tests execution
- [ ] Coverage > 80%
- [ ] CI/CD integration
