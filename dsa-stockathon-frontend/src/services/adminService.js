import api from './api';
import { ENDPOINTS } from '../utils/constants';

/**
 * Admin Service
 * Handles all admin-related operations
 */

export const adminService = {
  /**
   * Get all stocks with their details
   * @returns {Promise<Array>} List of all stocks
   */
  getAllStocks: async () => {
    try {
      const response = await api.get(ENDPOINTS.ALL_STOCKS);
      return response.data.stocks || [];
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Get all transactions (admin only)
   * @returns {Promise<Array>} List of all transactions
   */
  getAllTransactions: async () => {
    try {
      const response = await api.get(ENDPOINTS.ALL_TRANSACTIONS);
      return response.data.data || [];
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Get all investors (need to add backend endpoint)
   * @returns {Promise<Array>} List of all investors
   */
  getAllInvestors: async () => {
    try {
      const response = await api.get('/investors/all');
      return response.data.investors || [];
    } catch (error) {
      console.error('Error fetching investors:', error);
      throw error.response?.data || error.message;
    }
  },

  /**
   * Get all admins
   * @returns {Promise<Array>} List of all admins
   */
  getAllAdmins: async () => {
    try {
      const response = await api.get('/auth/all');
      return response.data.admins || [];
    } catch (error) {
      console.error('Error fetching admins:', error);
      throw error.response?.data || error.message;
    }
  },

  /**
   * Get system statistics
   * @returns {Promise<Object>} System-wide statistics
   */
  getSystemStats: async () => {
    try {
      const [stocks, transactions] = await Promise.all([
        adminService.getAllStocks(),
        adminService.getAllTransactions(),
      ]);

      const totalStocks = stocks.length;
      const totalInvestors = new Set(
        stocks.flatMap(stock => 
          stock.Owners?.map(owner => owner.investor?.toString()) || []
        )
      ).size;
      
      const totalTransactions = transactions.length;
      const totalVolume = transactions.reduce((sum, txn) => 
        sum + (txn.shares * txn.pricePerShare || 0), 0
      );

      const totalMarketCap = stocks.reduce((sum, stock) => {
        const totalShares = (stock.shares || 0) + 
          (stock.Owners?.reduce((s, o) => s + (o.sharesOwned || 0), 0) || 0);
        return sum + (totalShares * (stock.pricePerShare || 0));
      }, 0);

      return {
        totalStocks,
        totalInvestors,
        totalTransactions,
        totalVolume,
        totalMarketCap,
      };
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Delete a stock (admin only - need backend endpoint)
   * @param {string} stockId - Stock ID to delete
   * @returns {Promise<Object>} Response
   */
  deleteStock: async (stockId) => {
    try {
      const response = await api.delete(`/stocks/${stockId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Delete an investor (admin only - need backend endpoint)
   * @param {string} investorId - Investor ID to delete
   * @returns {Promise<Object>} Response
   */
  deleteInvestor: async (investorId) => {
    try {
      const response = await api.delete(`/investors/${investorId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Update stock details (admin only - need backend endpoint)
   * @param {string} stockId - Stock ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>} Updated stock
   */
  updateStock: async (stockId, updates) => {
    try {
      const response = await api.patch(`/stocks/${stockId}`, updates);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export default adminService;
