/**
 * API Configuration
 * Central configuration for all API calls
 */
import axios from 'axios';

// Base URL for backend API
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

// Create an axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

// Request interceptor - runs before every request
apiClient.interceptors.request.use(
  config => {
    console.log(
      `Making ${config.method.toUpperCase()} request to ${config.url}`
    );
    return config;
  },
  error => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - runs after every request
apiClient.interceptors.response.use(
  response => {
    return response;
  },
  error => {
    if (error.response) {
      console.error(
        'Response error:',
        error.response.status,
        error.response.data
      );
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Request setup error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default apiClient;
