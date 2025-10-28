// API Base URL
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3090/api/v1';
export const API_KEY = import.meta.env.VITE_API_KEY;

// User Roles
export const ROLES = {
  ADMIN: 'Admin',
  INVESTOR: 'Investor',
  STOCK: 'Stock',
};

// Alias for USER_ROLES (for consistency across the app)
export const USER_ROLES = ROLES;

// Local Storage Keys
export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
  USER_ID: 'userId',
  ROLE: 'role',
};

// API Endpoints
export const ENDPOINTS = {
  // Auth
  ADMIN_LOGIN: '/auth',
  INVESTOR_SIGNUP: '/investors/signup',
  INVESTOR_SIGNIN: '/investors/signin',
  STOCK_SIGNIN: '/stocks/signin',
  STOCK_CREATE: '/stocks',
  
  // Stocks
  ALL_STOCKS: '/stocks/allstocks',
  BUY_STOCK: (id) => `/stocks/${id}/buy`,
  SELL_STOCK: (id) => `/stocks/${id}/sell`,
  GET_USER: (id) => `/stocks/${id}/user`,
  
  // Portfolio
  GET_PORTFOLIO: (id) => `/portfolio/${id}`,
  
  // Admin
  ALL_TRANSACTIONS: '/stocks/transactions',
};

// Transaction Types
export const TRANSACTION_TYPES = {
  BUY: 'BUY',
  SELL: 'SELL',
};

// Toast Messages
export const TOAST_MESSAGES = {
  LOGIN_SUCCESS: 'Login successful!',
  LOGOUT_SUCCESS: 'Logged out successfully',
  SIGNUP_SUCCESS: 'Account created successfully!',
  BUY_SUCCESS: 'Stock purchased successfully!',
  SELL_SUCCESS: 'Stock sold successfully!',
  ERROR: 'An error occurred. Please try again.',
  UNAUTHORIZED: 'Session expired. Please login again.',
  INSUFFICIENT_BALANCE: 'Insufficient balance',
  INSUFFICIENT_SHARES: 'Insufficient shares to sell',
};

// Bloomberg Terminal specific
export const BLOOMBERG_COLORS = {
  ORANGE: '#FF6B00',
  GREEN: '#00FF00',
  RED: '#FF0000',
  YELLOW: '#FFD700',
  BLUE: '#00A6FF',
};
