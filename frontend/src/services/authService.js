/**
 * Authentication Service
 * Handles all API calls related to authentication
 */
import apiClient from './api.js';

const authService = {
  /**
   * Register a new user
   * @param {Object} userData - Object with email, password, and name
   * @returns {Promise<Object>} Object with user and token
   */
  async register(userData) {
    try {
      const response = await apiClient.post('/auth/register', userData);
      return response.data; // { user, token }
    } catch (error) {
      throw this.handleError(error, 'Failed to register');
    }
  },

  /**
   * Login an existing user
   * @param {Object} credentials - Object with email and password
   * @returns {Promise<Object>} Object with user and token
   */
  async login(credentials) {
    try {
      const response = await apiClient.post('/auth/login', credentials);
      return response.data; // { user, token }
    } catch (error) {
      throw this.handleError(error, 'Failed to login');
    }
  },

  /**
   * Get current user info
   * @returns {Promise<Object>} User object
   */
  async getCurrentUser() {
    try {
      const response = await apiClient.get('/auth/me');
      return response.data.user;
    } catch (error) {
      throw this.handleError(error, 'Failed to get user info');
    }
  },

  /**
   * Centralized error handler
   * @param {Error} error - The error object
   * @param {string} defaultMessage - Default error message
   * @returns {Error} Formatted error
   */
  handleError(error, defaultMessage) {
    if (error.response) {
      const message = error.response.data?.error || defaultMessage;
      return new Error(message);
    } else if (error.request) {
      return new Error('Network error. Please check your connection.');
    } else {
      return new Error(error.message || defaultMessage);
    }
  },
};

export default authService;
