/**
 * Detox E2E Test Configuration
 * Setup and global test configuration for all tests
 */

const config = {
  testTimeout: 120000,
  globalSetup: require('./globalSetup'),
  globalTeardown: require('./globalTeardown'),
};

module.exports = config;
