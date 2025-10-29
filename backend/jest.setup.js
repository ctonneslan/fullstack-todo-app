/**
 * Jest Global Setup
 * Runs once before all test suites
 */

import { setupDatabase } from './src/__tests__/helpers/setupDatabase.js';

export default async function globalSetup() {
  // Initialize database schema before running tests
  await setupDatabase();
}
