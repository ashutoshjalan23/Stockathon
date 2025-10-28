import api from './api';
import { ENDPOINTS, STORAGE_KEYS } from '../utils/constants';

/**
 * Authentication Service
 * Handles login, signup, and logout for all user types
 */

const authService = {
  /**
   * Investor Signup
   * @param {string} name - Investor name
   * @param {string} password - Investor password
   * @param {number} balance - Optional initial balance
   * @returns {Promise<Object>} Response with investor data
   */
  investorSignup: async (name, password, balance) => {
    try {
      const payload = { name, password };
      if (balance !== undefined && balance !== null) {
        payload.balance = balance;
      }
      
      const response = await api.post(ENDPOINTS.INVESTOR_SIGNUP, payload);
      // Note: Signup doesn't return token, need to login after
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Investor Login
   * @param {string} name - Investor name
   * @param {string} password - Investor password
   * @returns {Promise<Object>} Response with token and user data
   */
  investorLogin: async (name, password) => {
    try {
      const response = await api.post(ENDPOINTS.INVESTOR_SIGNIN, {
        name,
        password,
      });
      
      // Store token and user data
      if (response.data.token) {
        authService.storeAuthData(response.data.token, response.data.user);
      }
      
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Stock Login
   * @param {string} name - Stock name
   * @param {string} password - Stock password
   * @returns {Promise<Object>} Response with token and user data
   */
  stockLogin: async (name, password) => {
    try {
      const response = await api.post(ENDPOINTS.STOCK_SIGNIN, {
        name,
        password,
      });
      
      // Store token and user data
      if (response.data.token) {
        authService.storeAuthData(response.data.token, response.data.user);
      }
      
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Admin Login (requires API key - handled by axios interceptor)
   * @param {string} name - Admin name
   * @param {string} password - Admin password
   * @returns {Promise<Object>} Response with token and user data
   */
  adminLogin: async (name, password) => {
    try {
      const response = await api.get(ENDPOINTS.ADMIN_LOGIN, {
        params: { name, password },
      });
      
      // Store token and user data
      if (response.data.token) {
        authService.storeAuthData(response.data.token, response.data.user);
      }
      
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Stock Signup (Create new stock - requires API key)
   * @param {string} name - Stock name
   * @param {string} password - Stock password
   * @param {number} pricePerShare - Optional price per share
   * @param {number} shares - Optional number of shares
   * @returns {Promise<Object>} Response with stock data
   */
  stockSignup: async (name, password, pricePerShare, shares) => {
    try {
      const payload = { name, password };
      if (pricePerShare !== undefined && pricePerShare !== null) {
        payload.pricePerShare = pricePerShare;
      }
      if (shares !== undefined && shares !== null) {
        payload.shares = shares;
      }
      
      const response = await api.post(ENDPOINTS.STOCK_CREATE, payload);
      // Note: Signup doesn't return token, need to login after
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Admin Signup (Create new admin - requires API key)
   * @param {string} name - Admin name
   * @param {string} password - Admin password
   * @returns {Promise<Object>} Response with admin data
   */
  adminSignup: async (name, password) => {
    try {
      const response = await api.post(ENDPOINTS.ADMIN_LOGIN, {
        name,
        password,
      });
      // Note: Signup doesn't return token, need to login after
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Store authentication data in localStorage
   * @param {string} token - JWT token
   * @param {Object} user - User data
   */
  storeAuthData: (token, user) => {
    if (!token || !user) {
      console.error('Invalid auth data: token or user is missing');
      return;
    }

    localStorage.setItem(STORAGE_KEYS.TOKEN, token);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    
    if (user.role) {
      localStorage.setItem(STORAGE_KEYS.ROLE, user.role);
    }
    
    // Store user ID if available (for API calls)
    if (user._id || user.id) {
      localStorage.setItem(STORAGE_KEYS.USER_ID, user._id || user.id);
    }
  },

  /**
   * Get stored token
   * @returns {string|null} JWT token
   */
  getToken: () => {
    return localStorage.getItem(STORAGE_KEYS.TOKEN);
  },

  /**
   * Get stored user data
   * @returns {Object|null} User object
   */
  getUser: () => {
    const userStr = localStorage.getItem(STORAGE_KEYS.USER);
    return userStr ? JSON.parse(userStr) : null;
  },

  /**
   * Get stored user ID
   * @returns {string|null} User ID
   */
  getUserId: () => {
    return localStorage.getItem(STORAGE_KEYS.USER_ID);
  },

  /**
   * Get stored user role
   * @returns {string|null} User role
   */
  getRole: () => {
    return localStorage.getItem(STORAGE_KEYS.ROLE);
  },

  /**
   * Check if user is authenticated
   * @returns {boolean} True if token exists
   */
  isAuthenticated: () => {
    return !!authService.getToken();
  },

  /**
   * Logout - Clear all stored data
   */
  logout: () => {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.USER_ID);
    localStorage.removeItem(STORAGE_KEYS.ROLE);
  },

  /**
   * Clear all authentication data (same as logout)
   */
  clearAuth: () => {
    authService.logout();
  },
};

export default authService;
export { authService };
