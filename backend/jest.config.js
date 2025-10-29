/**
 * Jest Configuration
 */

export default {
  testEnvironment: "node",
  moduleFileExtensions: ["js", "json"],
  transform: {},
  injectGlobals: true,

  // Pattern to find test files
  // Looks for files ending in .test.js or .spec.js
  testMatch: ["**/__tests__/**/*.test.js", "**/?(*.)+(spec|test).js"],

  // Coverage settings
  collectCoverageFrom: [
    "src/**/*.js", // Include all source files
    "!src/**/*.test.js", // Exclude test files
    "!src/config/**", // Exclude config
  ],

  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },

  // Setup file to run before tests (we'll create this)
  setupFilesAfterEnv: ["<rootDir>/src/__tests__/setup.js"],

  // Global setup to initialize database schema
  globalSetup: "<rootDir>/jest.setup.js",

  // Verbose output (shows each test result)
  verbose: true,
};
