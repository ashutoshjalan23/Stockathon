import api from './api';
import { ENDPOINTS } from '../utils/constants';

/**
 * Portfolio Service
 * Handles portfolio-related operations for investors
 */

const portfolioService = {
  /**
   * Get investor portfolio (Requires JWT authentication)
   * @param {string} investorId - Investor ID
   * @returns {Promise<Object>} Response with portfolio data
   */
  getPortfolio: async (investorId) => {
    try {
      const response = await api.get(ENDPOINTS.GET_PORTFOLIO(investorId));
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Calculate total portfolio value
   * @param {Array} portfolio - Portfolio array with {stock, shares}
   * @returns {number} Total portfolio value
   */
  calculateTotalValue: (portfolio) => {
    if (!portfolio || !Array.isArray(portfolio)) return 0;
    
    return portfolio.reduce((total, item) => {
      const stockValue = item.stock?.pricePerShare || 0;
      const shares = item.shares || 0;
      return total + (stockValue * shares);
    }, 0);
  },

  /**
   * Calculate profit/loss for a portfolio item
   * @param {number} currentPrice - Current price per share
   * @param {number} buyPrice - Original buy price per share
   * @param {number} shares - Number of shares
   * @returns {Object} {amount, percentage}
   */
  calculateProfitLoss: (currentPrice, buyPrice, shares) => {
    const currentValue = currentPrice * shares;
    const originalValue = buyPrice * shares;
    const amount = currentValue - originalValue;
    const percentage = originalValue > 0 ? (amount / originalValue) * 100 : 0;
    
    return { amount, percentage };
  },

  /**
   * Get portfolio statistics
   * @param {Array} portfolio - Portfolio array
   * @param {number} balance - Current balance
   * @returns {Object} Portfolio stats
   */
  getPortfolioStats: (portfolio, balance) => {
    const totalValue = portfolioService.calculateTotalValue(portfolio);
    const totalInvested = balance; // Initial balance - current balance would need transaction history
    const numberOfStocks = portfolio?.length || 0;
    
    return {
      totalValue,
      totalInvested,
      numberOfStocks,
      availableBalance: balance,
      totalAssets: totalValue + balance,
    };
  },

  /**
   * Check if investor owns shares of a specific stock
   * @param {Array} portfolio - Portfolio array
   * @param {string} stockId - Stock ID to check
   * @returns {Object|null} Portfolio item or null
   */
  findStockInPortfolio: (portfolio, stockId) => {
    if (!portfolio || !Array.isArray(portfolio)) return null;
    return portfolio.find(item => 
      (item.stock?._id === stockId || item.stock === stockId)
    );
  },

  /**
   * Get number of shares owned for a specific stock
   * @param {Array} portfolio - Portfolio array
   * @param {string} stockId - Stock ID
   * @returns {number} Number of shares owned
   */
  getSharesOwned: (portfolio, stockId) => {
    const item = portfolioService.findStockInPortfolio(portfolio, stockId);
    return item?.shares || 0;
  },
};

export default portfolioService;
export { portfolioService };
