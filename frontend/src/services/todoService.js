/**
 * Todo Service
 * Handles all API calls related to todos
 * Provides a clean interface for components to interact with the backend
 */
import apiClient from './api.js';

const todoService = {
  /**
   * Get all todos
   * @returns {Promise<Array>} Array of todo objects
   */
  async getAllTodos() {
    try {
      const response = await apiClient.get('/todos');
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch todos');
    }
  },

  /**
   * Get a single todo by ID
   * @param {number} id - Todo ID
   * @returns {Promise<Object>} Todo object
   */
  async getTodoById(id) {
    try {
      const response = await apiClient.get(`/todos/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch todo');
    }
  },

  /**
   * Create a new todo
   * @param {Object} todoData - Object with title and description
   * @returns {Promise<Object>} Created todo object
   */
  async createTodo(todoData) {
    try {
      const response = await apiClient.post('/todos', todoData);
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Failed to create todo');
    }
  },

  /**
   * Update an existing todo
   * @param {number} id - Todo ID
   * @param {Object} todoData - Object with updated fields
   * @returns {Promise<Object>} Updated todo object
   */
  async updateTodo(id, todoData) {
    try {
      const response = await apiClient.put(`/todos/${id}`, todoData);
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Failed to update todo');
    }
  },

  /**
   * Delete a todo
   * @param {number} id - Todo ID
   * @returns {Promise<void>}
   */
  async deleteTodo(id) {
    try {
      await apiClient.delete(`/todos/${id}`);
    } catch (error) {
      throw this.handleError(error, 'Failed to delete todo');
    }
  },

  /**
   * Toggle a todo's completed status
   * @param {number} id - Todo ID
   * @returns {Promise<Object>} Updated todo object
   */
  async toggleTodoCompleted(id) {
    try {
      const response = await apiClient.patch(`/todos/${id}/toggle`);
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Failed to toggle todo');
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

export default todoService;
