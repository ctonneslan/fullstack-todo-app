/**
 * Authentication Service
 * Handles user authentication and authorization
 */

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

class AuthService {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  /**
   * Register a new user
   * @param {string} email - User's email
   * @param {string} password - Plain text password
   * @param {string} name - User's name
   * @returns {Promise<Object>} User object and token
   */
  async register(email, password, name) {
    // Validation
    if (!email || !email.includes("@")) {
      throw new Error("Valid email is required");
    }

    if (!password || password.length < 6) {
      throw new Error("Password must be at least 6 characters");
    }

    if (!name || name.trim().length === 0) {
      throw new Error("Name is required");
    }

    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(
      email.toLowerCase()
    );
    if (existingUser) {
      throw new Error("Email already registered");
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // Create user in database
    const user = await this.userRepository.create(
      email.toLowerCase().trim(),
      passwordHash,
      name.trim()
    );

    // Generate JWT token
    const token = this.generateToken(user);

    // Return user (without password) and token
    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        created_at: user.created_at,
      },
      token,
    };
  }

  /**
   * Login a user
   * @param {string} email - User's email
   * @param {string} password - Plain text password
   * @returns {Promise<Object>} User object and token
   */
  async login(email, password) {
    // Validation
    if (!email || !password) {
      throw new Error("Email and password are required");
    }

    // Find user with password hash
    const user = await this.userRepository.findByEmailWithPassword(
      email.toLowerCase()
    );

    if (!user) {
      // Don't reveal whether email exists (security best practice)
      throw new Error("Invalid email or password");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      throw new Error("Invalid email or password");
    }

    // Generate JWT token
    const token = this.generateToken(user);

    // Return user (without password hash) and token
    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        created_at: user.created_at,
      },
      token,
    };
  }

  /**
   * Generate JWT token
   * @param {Object} user - User object
   * @returns {string} JWT token
   */
  generateToken(user) {
    const payload = {
      userId: user.id,
      email: user.email,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    });

    return token;
  }

  /**
   * Verify JWT token
   * @param {string} token - JWT token
   * @returns {Object} Decoded payload
   */
  verifyToken(token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      return decoded;
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        throw new Error("Token has expired");
      } else if (error.name === "JsonWebTokenError") {
        throw new Error("Invalid token");
      }
      throw error;
    }
  }

  /**
   * Get user from token
   * @param {string} token - JWT token
   * @returns {Promise<Object>} User object
   */
  async getUserFromToken(token) {
    const decoded = this.verifyToken(token);

    const user = await this.userRepository.findById(decoded.userId);

    if (!user) {
      throw new Error("User not found");
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      created_at: user.created_at,
    };
  }
}

export default AuthService;
