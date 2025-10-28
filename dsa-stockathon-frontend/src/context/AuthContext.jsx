import { createContext, useState, useEffect, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';
import authService from '../services/authService';
import { ROLES } from '../utils/constants';

export const AuthContext = createContext();

/**
 * AuthProvider Component
 * Manages authentication state and provides auth methods to the app
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  /**
   * Check if token is expired
   * @param {string} token - JWT token
   * @returns {boolean} True if expired
   */
  const isTokenExpired = useCallback((token) => {
    if (!token) return true;

    try {
      const decoded = jwtDecode(token);
      const now = Math.floor(Date.now() / 1000); // Current time in seconds
      
      // Check if token has expired (with 5 minute buffer)
      return decoded.exp < (now + 300);
    } catch (error) {
      console.error('Error decoding token:', error);
      return true;
    }
  }, []);

  /**
   * Initialize auth state from localStorage
   */
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const storedToken = authService.getToken();
        const storedUser = authService.getUser();

        if (storedToken && storedUser) {
          // Check if token is still valid
          if (!isTokenExpired(storedToken)) {
            setToken(storedToken);
            setUser(storedUser);
          } else {
            // Token expired, clear everything
            authService.clearAuth();
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        authService.clearAuth();
      } finally {
        setLoading(false);
        setIsInitialized(true);
      }
    };

    initializeAuth();
  }, [isTokenExpired]);

  /**
   * Login user and store auth data
   * @param {string} tokenData - JWT token
   * @param {Object} userData - User data
   */
  const login = useCallback((tokenData, userData) => {
    authService.storeAuthData(tokenData, userData);
    setToken(tokenData);
    setUser(userData);
  }, []);

  /**
   * Logout user and clear auth data
   */
  const logout = useCallback(() => {
    authService.clearAuth();
    setToken(null);
    setUser(null);
  }, []);

  /**
   * Update user data (e.g., after balance change)
   * @param {Object} updatedUser - Updated user object
   */
  const updateUser = useCallback((updatedUser) => {
    setUser(updatedUser);
    authService.storeAuthData(token, updatedUser);
  }, [token]);

  /**
   * Check if user is authenticated
   * @returns {boolean} True if authenticated
   */
  const isAuthenticated = !isTokenExpired(token) && !!token && !!user;

  /**
   * Get user role
   * @returns {string|null} User role
   */
  const getUserRole = useCallback(() => {
    return user?.role || null;
  }, [user]);

  /**
   * Check if user is admin
   * @returns {boolean} True if admin
   */
  const isAdmin = useCallback(() => {
    return user?.role === ROLES.ADMIN;
  }, [user]);

  /**
   * Check if user is investor
   * @returns {boolean} True if investor
   */
  const isInvestor = useCallback(() => {
    return user?.role === ROLES.INVESTOR;
  }, [user]);

  /**
   * Check if user is stock
   * @returns {boolean} True if stock
   */
  const isStock = useCallback(() => {
    return user?.role === ROLES.STOCK;
  }, [user]);

  /**
   * Get user ID
   * @returns {string|null} User ID
   */
  const getUserId = useCallback(() => {
    return user?._id || user?.id || authService.getUserId();
  }, [user]);

  /**
   * Get user name
   * @returns {string|null} User name
   */
  const getUserName = useCallback(() => {
    return user?.name || null;
  }, [user]);

  /**
   * Get user balance (for investors)
   * @returns {number|null} User balance
   */
  const getUserBalance = useCallback(() => {
    return user?.balance || null;
  }, [user]);

  /**
   * Check if user has specific role
   * @param {string|Array} roles - Role or array of roles to check
   * @returns {boolean} True if user has one of the roles
   */
  const hasRole = useCallback((roles) => {
    if (!user?.role) return false;
    
    if (Array.isArray(roles)) {
      return roles.includes(user.role);
    }
    
    return user.role === roles;
  }, [user]);

  const value = {
    // State
    user,
    token,
    loading,
    isInitialized,
    
    // Methods
    login,
    logout,
    updateUser,
    
    // Checks
    isAuthenticated,
    getUserRole,
    isAdmin,
    isInvestor,
    isStock,
    getUserId,
    getUserName,
    getUserBalance,
    hasRole,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
