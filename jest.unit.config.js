/**
 * Jest Configuration for Unit Tests
 *
 * Runs unit tests located in __tests__/ folders throughout src/
 * Separate from jest.config.js which is reserved for Detox E2E tests.
 *
 * Usage: npx jest --config jest.unit.config.js
 *        npm run test:unit
 */

module.exports = {
  // Use ts-jest for TypeScript files
  preset: 'ts-jest',
  testEnvironment: 'node',
  testTimeout: 10000,

  // Find tests in src/**/__tests__/**/*.test.ts
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.test.ts',
    '<rootDir>/src/**/__tests__/**/*.test.tsx',
    '<rootDir>/src/**/*.test.ts',
    '<rootDir>/src/**/*.test.tsx',
  ],

  // Module resolution - match tsconfig paths
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@appTypes$': '<rootDir>/src/types/index',
    '^expo-notifications$': '<rootDir>/src/lib/services/__mocks__/expo-notifications.mock.ts',
  },

  // Transform TypeScript files
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: '<rootDir>/tsconfig.json',
      diagnostics: false, // Faster transforms
    }],
  },

  // Don't transform node_modules except Expo/RN packages
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|expo|@expo|@react-native|moti|@supabase)/)',
  ],

  // Mock native modules
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],

  // Coverage
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/index.ts', // Skip barrel exports
    '!src/**/__tests__/**',
  ],

  // Setup files
  setupFiles: [],

  // Verbose output
  verbose: true,
};
