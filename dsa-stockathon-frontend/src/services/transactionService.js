import api from './api';
import { ENDPOINTS } from '../utils/constants';

/**
 * Transaction Service
 * Handles transaction-related operations
 */

const transactionService = {
  /**
   * Get all transactions (Admin only - requires API key)
   * @returns {Promise<Object>} Response with all transactions
   */
  getAllTransactions: async () => {
    try {
      const response = await api.get(ENDPOINTS.ALL_TRANSACTIONS);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Filter transactions by investor ID
   * @param {Array} transactions - All transactions
   * @param {string} investorId - Investor ID
   * @returns {Array} Filtered transactions
   */
  filterByInvestor: (transactions, investorId) => {
    if (!transactions || !Array.isArray(transactions)) return [];
    
    return transactions.filter(txn => 
      txn.investor?._id === investorId || 
      txn.investor === investorId
    );
  },

  /**
   * Filter transactions by stock ID
   * @param {Array} transactions - All transactions
   * @param {string} stockId - Stock ID
   * @returns {Array} Filtered transactions
   */
  filterByStock: (transactions, stockId) => {
    if (!transactions || !Array.isArray(transactions)) return [];
    
    return transactions.filter(txn => 
      txn.stock?._id === stockId || 
      txn.stock === stockId ||
      txn.startup?._id === stockId || // Backend uses 'startup' in schema
      txn.startup === stockId
    );
  },

  /**
   * Filter transactions by type (BUY/SELL)
   * @param {Array} transactions - All transactions
   * @param {string} type - Transaction type ('BUY' or 'SELL')
   * @returns {Array} Filtered transactions
   */
  filterByType: (transactions, type) => {
    if (!transactions || !Array.isArray(transactions)) return [];
    
    return transactions.filter(txn => txn.type === type);
  },

  /**
   * Filter transactions by date range
   * @param {Array} transactions - All transactions
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @returns {Array} Filtered transactions
   */
  filterByDateRange: (transactions, startDate, endDate) => {
    if (!transactions || !Array.isArray(transactions)) return [];
    
    return transactions.filter(txn => {
      const txnDate = new Date(txn.timestamp);
      return txnDate >= startDate && txnDate <= endDate;
    });
  },

  /**
   * Sort transactions by date (newest first)
   * @param {Array} transactions - Transactions to sort
   * @returns {Array} Sorted transactions
   */
  sortByDateDesc: (transactions) => {
    if (!transactions || !Array.isArray(transactions)) return [];
    
    return [...transactions].sort((a, b) => 
      new Date(b.timestamp) - new Date(a.timestamp)
    );
  },

  /**
   * Sort transactions by date (oldest first)
   * @param {Array} transactions - Transactions to sort
   * @returns {Array} Sorted transactions
   */
  sortByDateAsc: (transactions) => {
    if (!transactions || !Array.isArray(transactions)) return [];
    
    return [...transactions].sort((a, b) => 
      new Date(a.timestamp) - new Date(b.timestamp)
    );
  },

  /**
   * Calculate total transaction value
   * @param {Array} transactions - Transactions array
   * @returns {number} Total value
   */
  calculateTotalValue: (transactions) => {
    if (!transactions || !Array.isArray(transactions)) return 0;
    
    return transactions.reduce((total, txn) => {
      const value = (txn.pricePerShare || txn.value || 0) * (txn.shares || 0);
      return total + value;
    }, 0);
  },

  /**
   * Get transaction statistics
   * @param {Array} transactions - Transactions array
   * @returns {Object} Transaction stats
   */
  getTransactionStats: (transactions) => {
    if (!transactions || !Array.isArray(transactions)) {
      return {
        total: 0,
        buyCount: 0,
        sellCount: 0,
        totalBuyValue: 0,
        totalSellValue: 0,
      };
    }

    const buyTransactions = transactionService.filterByType(transactions, 'BUY');
    const sellTransactions = transactionService.filterByType(transactions, 'SELL');

    return {
      total: transactions.length,
      buyCount: buyTransactions.length,
      sellCount: sellTransactions.length,
      totalBuyValue: transactionService.calculateTotalValue(buyTransactions),
      totalSellValue: transactionService.calculateTotalValue(sellTransactions),
    };
  },
};

export default transactionService;
export { transactionService };
