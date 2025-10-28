import { useState, useEffect, useCallback } from 'react';
import stockService from '../services/stockService';

/**
 * Custom hook to fetch and manage stocks
 * @param {boolean} autoFetch - Whether to fetch on mount
 * @returns {Object} Stocks data and methods
 */
export const useStocks = (autoFetch = true) => {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Fetch all stocks
   */
  const fetchStocks = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await stockService.getAllStocks();
      setStocks(response.stocks || []);
      return response.stocks || [];
    } catch (err) {
      const errorMessage = err.message || 'Failed to fetch stocks';
      setError(errorMessage);
      console.error('Error fetching stocks:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Refresh stocks (alias for fetchStocks)
   */
  const refreshStocks = useCallback(() => {
    return fetchStocks();
  }, [fetchStocks]);

  /**
   * Get stock by ID
   * @param {string} stockId - Stock ID
   * @returns {Object|null} Stock object
   */
  const getStockById = useCallback((stockId) => {
    return stocks.find(stock => stock._id === stockId) || null;
  }, [stocks]);

  /**
   * Search stocks by name
   * @param {string} query - Search query
   * @returns {Array} Filtered stocks
   */
  const searchStocks = useCallback((query) => {
    if (!query) return stocks;
    
    const lowerQuery = query.toLowerCase();
    return stocks.filter(stock => 
      stock.name?.toLowerCase().includes(lowerQuery)
    );
  }, [stocks]);

  /**
   * Sort stocks by price
   * @param {boolean} ascending - Sort order
   * @returns {Array} Sorted stocks
   */
  const sortByPrice = useCallback((ascending = true) => {
    return [...stocks].sort((a, b) => {
      const priceA = a.pricePerShare || 0;
      const priceB = b.pricePerShare || 0;
      return ascending ? priceA - priceB : priceB - priceA;
    });
  }, [stocks]);

  /**
   * Sort stocks by name
   * @param {boolean} ascending - Sort order
   * @returns {Array} Sorted stocks
   */
  const sortByName = useCallback((ascending = true) => {
    return [...stocks].sort((a, b) => {
      const nameA = a.name || '';
      const nameB = b.name || '';
      return ascending 
        ? nameA.localeCompare(nameB) 
        : nameB.localeCompare(nameA);
    });
  }, [stocks]);

  // Auto-fetch on mount if enabled
  useEffect(() => {
    if (autoFetch) {
      fetchStocks();
    }
  }, [autoFetch, fetchStocks]);

  return {
    stocks,
    loading,
    error,
    fetchStocks,
    refreshStocks,
    getStockById,
    searchStocks,
    sortByPrice,
    sortByName,
  };
};
