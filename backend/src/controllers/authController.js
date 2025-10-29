/**
 * Auth Controller
 * Handles HTTP requests for authentication
 */

class AuthController {
  constructor(authService) {
    this.authService = authService;

    // Bind methods to maintain 'this' context
    this.register = this.register.bind(this);
    this.login = this.login.bind(this);
    this.me = this.me.bind(this);
  }

  /**
   * POST /api/auth/register
   * Register a new user
   */
  async register(req, res) {
    try {
      const { email, password, name } = req.body;

      const result = await this.authService.register(email, password, name);

      res.status(201).json(result);
    } catch (error) {
      console.error("Error in register:", error.message);

      // Handle specific error types
      if (error.message.includes("already registered")) {
        return res.status(409).json({ error: error.message });
      }

      if (
        error.message.includes("required") ||
        error.message.includes("must be") ||
        error.message.includes("Valid")
      ) {
        return res.status(400).json({ error: error.message });
      }

      res.status(500).json({ error: "Registration failed" });
    }
  }

  /**
   * POST /api/auth/login
   * Login a user
   */
  async login(req, res) {
    try {
      const { email, password } = req.body;

      const result = await this.authService.login(email, password);

      res.status(200).json(result);
    } catch (error) {
      console.error("Error in login:", error.message);

      // Don't reveal specific errors to prevent user enumeration
      if (error.message.includes("Invalid email or password")) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      if (error.message.includes("required")) {
        return res.status(400).json({ error: error.message });
      }

      res.status(500).json({ error: "Login failed" });
    }
  }

  /**
   * GET /api/auth/me
   * Get current user info
   * Requires authentication
   */
  async me(req, res) {
    try {
      const token = req.headers.authorization.split(" ")[1];
      const user = await this.authService.getUserFromToken(token);

      res.status(200).json({ user });
    } catch (error) {
      console.error("Error in me:", error.message);

      if (error.message.includes("expired")) {
        return res.status(401).json({ error: "Token has expired" });
      }

      if (error.message.includes("Invalid token")) {
        return res.status(401).json({ error: "Invalid token" });
      }

      res.status(500).json({ error: "Failed to get user info" });
    }
  }
}

export default AuthController;
