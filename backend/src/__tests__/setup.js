/**
 * Test Setup
 * Runs before all tests
 * Sets up test database and cleans up after tests
 */

import pool from "../config/database.js";

// Runs once before all tests
beforeAll(async () => {
  // Could create tables here if needed
  console.log("🧪 Test suite starting...");
});

// Runs after each test
afterEach(async () => {
  // Delete all data to prevent test pollution
  await pool.query("DELETE FROM todos");
});

// Runs once after all tests
afterAll(async () => {
  // Clean up and close connections
  await pool.query("DELETE FROM todos");
  await pool.end();
  console.log("✅ Test suite complete!");
});
