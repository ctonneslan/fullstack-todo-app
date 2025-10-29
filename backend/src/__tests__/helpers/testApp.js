/**
 * Test App Helper
 * Creates app instance for testing without starting HTTP server
 */

import createApp from "../../app.js";
import pool from "../../config/database.js";

let app;

export function getTestApp() {
  if (!app) {
    app = createApp(pool);
  }
  return app;
}

export function getTestPool() {
  return pool;
}
