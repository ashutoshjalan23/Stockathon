import { useState, useEffect, useCallback } from 'react';
import transactionService from '../services/transactionService';
import { useAuth } from './useAuth';
import { useRole } from './useRole';

/**
 * Custom hook to fetch and filter transactions based on user role
 * @param {boolean} autoFetch - Whether to fetch on mount
 * @returns {Object} Transactions data and methods
 */
export const useTransactions = (autoFetch = true) => {
  const { getUserId } = useAuth();
  const { isAdmin, isInvestor, isStock } = useRole();
  
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Fetch all transactions (admin only)
   */
  const fetchTransactions = useCallback(async () => {
    if (!isAdmin) {
      setError('Insufficient permissions to fetch all transactions');
      return [];
    }

    setLoading(true);
    setError(null);

    try {
      const response = await transactionService.getAllTransactions();
      const txns = response.data || [];
      setTransactions(txns);
      setFilteredTransactions(txns);
      return txns;
    } catch (err) {
      const errorMessage = err.message || 'Failed to fetch transactions';
      setError(errorMessage);
      console.error('Error fetching transactions:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  /**
   * Filter transactions for current user based on role
   */
  const filterForCurrentUser = useCallback(() => {
    const userId = getUserId();
    
    if (isAdmin) {
      // Admin sees all transactions
      setFilteredTransactions(transactions);
    } else if (isInvestor) {
      // Investor sees only own transactions
      const filtered = transactionService.filterByInvestor(transactions, userId);
      setFilteredTransactions(filtered);
    } else if (isStock) {
      // Stock sees only related transactions
      const filtered = transactionService.filterByStock(transactions, userId);
      setFilteredTransactions(filtered);
    } else {
      setFilteredTransactions([]);
    }
  }, [transactions, getUserId, isAdmin, isInvestor, isStock]);

  /**
   * Filter transactions by type
   * @param {string} type - 'BUY' or 'SELL'
   */
  const filterByType = useCallback((type) => {
    const filtered = transactionService.filterByType(filteredTransactions, type);
    return filtered;
  }, [filteredTransactions]);

  /**
   * Filter transactions by date range
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   */
  const filterByDateRange = useCallback((startDate, endDate) => {
    const filtered = transactionService.filterByDateRange(
      filteredTransactions, 
      startDate, 
      endDate
    );
    return filtered;
  }, [filteredTransactions]);

  /**
   * Get transaction statistics
   */
  const getStats = useCallback(() => {
    return transactionService.getTransactionStats(filteredTransactions);
  }, [filteredTransactions]);

  /**
   * Sort transactions by date
   * @param {boolean} ascending - Sort order
   */
  const sortByDate = useCallback((ascending = false) => {
    const sorted = ascending 
      ? transactionService.sortByDateAsc(filteredTransactions)
      : transactionService.sortByDateDesc(filteredTransactions);
    setFilteredTransactions(sorted);
    return sorted;
  }, [filteredTransactions]);

  // Auto-fetch on mount if user is admin
  useEffect(() => {
    if (autoFetch && isAdmin) {
      fetchTransactions();
    }
  }, [autoFetch, isAdmin, fetchTransactions]);

  // Filter for current user when transactions change
  useEffect(() => {
    filterForCurrentUser();
  }, [transactions, filterForCurrentUser]);

  return {
    transactions: filteredTransactions,
    allTransactions: transactions,
    loading,
    error,
    fetchTransactions,
    filterByType,
    filterByDateRange,
    getStats,
    sortByDate,
  };
};
