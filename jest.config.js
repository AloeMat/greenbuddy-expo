/**
 * Jest Configuration for Detox E2E Tests
 *
 * Détox utilise Jest comme test runner pour les tests E2E.
 * Cette configuration optimise Jest pour les tests d'application mobile.
 */

module.exports = {
  // Test runner configuration
  testRunner: 'jest-circus/runner',
  testEnvironment: 'node',
  testTimeout: 120000, // 2 minutes timeout pour les tests E2E (longue durée d'exécution)

  // Patterns et chemins
  testNamePattern: '(?:e2e)',
  testMatch: ['<rootDir>/e2e/**/*.e2e.js'],
  moduleFileExtensions: ['js', 'json'],

  // Configuration des reporters
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: 'artifacts',
        outputName: 'detox-results.xml',
        classNameTemplate: '{classname}',
        titleTemplate: '{title}',
        ancestorSeparator: ' › ',
        usePathAsClassName: 'true',
      },
    ],
  ],

  // Setup et teardown global
  globalSetupFilePath: '<rootDir>/e2e/globalSetup.js',
  globalTeardownFilePath: '<rootDir>/e2e/globalTeardown.js',

  // Transformation et module mapping
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|react-native-reanimated|expo|@expo|@react-native|moti)/)',
  ],

  // Collecte de couverture (optionnel, disabled par défaut pour E2E)
  collectCoverageFrom: [],

  // Paths personnalisés pour imports
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^@/components/(.*)$': '<rootDir>/components/$1',
    '^@/services/(.*)$': '<rootDir>/services/$1',
    '^@/hooks/(.*)$': '<rootDir>/hooks/$1',
  },

  // Options de verbosité
  verbose: true,
  logHeapUsage: true,

  // Configuration des logs
  bail: false, // Continue même après un échec pour voir tous les résultats
  maxWorkers: 1, // Exécuter les tests séquentiellement (Detox ne supporte pas bien les parallèles)
};
