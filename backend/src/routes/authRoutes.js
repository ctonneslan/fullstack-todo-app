/**
 * Auth Routes
 * Defines authentication endpoints
 */

import express from "express";
import { authenticate } from "../middleware/auth.js";

function createAuthRoutes(authController) {
  const router = express.Router();

  /**
   * POST /api/auth/register
   * Register a new user
   * Public route (no authentication required)
   */
  router.post("/register", authController.register);

  /**
   * POST /api/auth/login
   * Login a user
   * Public route (no authentication required)
   */
  router.post("/login", authController.login);

  /**
   * GET /api/auth/me
   * Get current user info
   * Protected route (authentication required)
   */
  router.get("/me", authenticate, authController.me);

  return router;
}

export default createAuthRoutes;
