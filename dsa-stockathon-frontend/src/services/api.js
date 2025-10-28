import axios from 'axios';
import { API_BASE_URL, API_KEY, STORAGE_KEYS } from '../utils/constants';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds
});

// REQUEST INTERCEPTOR - Add JWT token and API key to requests
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    
    // Add Bearer token for protected routes
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add API key for admin routes and signup routes
    // Routes that need API key:
    // - /auth (admin login)
    // - /auth/all (get all admins - admin only)
    // - /stocks/transactions (admin only)
    // - /stocks (POST - create stock)
    // - /investors/signup (investor signup)
    // - /investors/all (get all investors - admin only)
    const needsApiKey = 
      config.url?.includes('/auth') || 
      config.url?.includes('/transactions') ||
      config.url?.includes('/investors/signup') ||
      config.url?.includes('/investors/all') ||
      (config.url?.includes('/stocks') && config.method === 'post' && !config.url.includes('/signin'));
    
    if (needsApiKey) {
      config.headers['x-api-key'] = API_KEY;
    }
    
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// RESPONSE INTERCEPTOR - Handle errors and token expiration
api.interceptors.response.use(
  (response) => {
    // Successfully received response
    return response;
  },
  (error) => {
    // Handle different error scenarios
    if (error.response) {
      const { status, data } = error.response;
      
      // 401 Unauthorized - Token expired or invalid
      if (status === 401) {
        // Only clear auth data, not all localStorage
        localStorage.removeItem(STORAGE_KEYS.TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER);
        localStorage.removeItem(STORAGE_KEYS.USER_ID);
        localStorage.removeItem(STORAGE_KEYS.ROLE);
        
        // Only redirect if not already on login/signup page
        if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/signup')) {
          window.location.href = '/login';
          console.error('Session expired. Please login again.');
        }
      }
      
      // 403 Forbidden - Invalid API key or insufficient permissions
      if (status === 403) {
        console.error('Access denied:', data.message);
      }
      
      // 404 Not Found
      if (status === 404) {
        console.error('Resource not found:', data.message);
      }
      
      // 409 Conflict - User already exists
      if (status === 409) {
        console.error('Conflict:', data.message);
      }
      
      // 500 Server Error
      if (status >= 500) {
        console.error('Server error:', data.message);
      }
    } else if (error.request) {
      // Request was made but no response received
      console.error('Network error: No response from server');
    } else {
      // Error in setting up the request
      console.error('Request setup error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default api;
