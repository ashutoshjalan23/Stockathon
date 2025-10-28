import api from './api';
import { ENDPOINTS } from '../utils/constants';

/**
 * Stock Service
 * Handles stock-related operations
 */

const stockService = {
  /**
   * Get all stocks (Public endpoint - no authentication required)
   * @returns {Promise<Object>} Response with all stocks
   */
  getAllStocks: async () => {
    try {
      const response = await api.get(ENDPOINTS.ALL_STOCKS);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Buy stock shares (Requires JWT authentication)
   * @param {string} stockId - Stock ID
   * @param {string} investorId - Investor ID
   * @param {number} shares - Number of shares to buy
   * @returns {Promise<Object>} Response with transaction details
   */
  buyStock: async (stockId, investorId, shares) => {
    try {
      const response = await api.post(ENDPOINTS.BUY_STOCK(stockId), {
        investorID: investorId,
        stockID: stockId,
        shares: parseInt(shares),
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Sell stock shares (Requires JWT authentication)
   * @param {string} stockId - Stock ID
   * @param {string} investorId - Investor ID
   * @param {number} shares - Number of shares to sell
   * @returns {Promise<Object>} Response with transaction details
   */
  sellStock: async (stockId, investorId, shares) => {
    try {
      const response = await api.post(ENDPOINTS.SELL_STOCK(stockId), {
        investorID: investorId,
        stockID: stockId,
        shares: parseInt(shares),
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Get user/investor details (Requires JWT authentication)
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Response with user data
   */
  getUser: async (userId) => {
    try {
      const response = await api.get(ENDPOINTS.GET_USER(userId));
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Get stock by ID (from all stocks list)
   * @param {string} stockId - Stock ID
   * @returns {Promise<Object>} Stock object
   */
  getStockById: async (stockId) => {
    try {
      const response = await stockService.getAllStocks();
      const stock = response.stocks?.find(s => s._id === stockId);
      return stock || null;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Create new stock (Admin only - requires API key)
   * @param {string} name - Stock name
   * @param {string} password - Stock password
   * @returns {Promise<Object>} Response with created stock
   */
  createStock: async (name, password) => {
    try {
      const response = await api.post(ENDPOINTS.STOCK_CREATE, {
        name,
        password,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Calculate total cost for buying shares
   * @param {number} pricePerShare - Price per share
   * @param {number} shares - Number of shares
   * @returns {number} Total cost
   */
  calculateTotalCost: (pricePerShare, shares) => {
    return pricePerShare * shares;
  },

  /**
   * Check if investor can afford to buy shares
   * @param {number} balance - Investor balance
   * @param {number} totalCost - Total cost of shares
   * @returns {boolean} True if can afford
   */
  canAffordPurchase: (balance, totalCost) => {
    return balance >= totalCost;
  },

  /**
   * Check if stock has enough shares available
   * @param {number} availableShares - Available shares
   * @param {number} requestedShares - Requested shares
   * @returns {boolean} True if enough shares available
   */
  hasEnoughShares: (availableShares, requestedShares) => {
    return availableShares >= requestedShares;
  },
};

export default stockService;
export { stockService };
