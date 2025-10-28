import { format, formatDistanceToNow } from 'date-fns';

/**
 * Format currency with $ and 2 decimal places
 * @param {number} amount - The amount to format
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return '$0.00';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Format number with commas
 * @param {number} num - The number to format
 * @returns {string} Formatted number string
 */
export const formatNumber = (num) => {
  if (num === null || num === undefined) return '0';
  return new Intl.NumberFormat('en-US').format(num);
};

/**
 * Format percentage with + or - sign
 * @param {number} value - The percentage value
 * @param {boolean} showSign - Whether to show + sign for positive values
 * @returns {string} Formatted percentage string
 */
export const formatPercentage = (value, showSign = true) => {
  if (value === null || value === undefined) return '0.00%';
  const sign = value > 0 && showSign ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
};

/**
 * Format large numbers with K, M, B suffixes
 * @param {number} num - The number to format
 * @returns {string} Formatted string with suffix
 */
export const formatCompactNumber = (num) => {
  if (num === null || num === undefined) return '0';
  
  if (num >= 1_000_000_000) {
    return `${(num / 1_000_000_000).toFixed(1)}B`;
  }
  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(1)}M`;
  }
  if (num >= 1_000) {
    return `${(num / 1_000).toFixed(1)}K`;
  }
  return num.toString();
};

/**
 * Format date to readable string
 * @param {Date|string} date - The date to format
 * @param {string} formatStr - The format string (default: 'MMM dd, yyyy HH:mm')
 * @returns {string} Formatted date string
 */
export const formatDate = (date, formatStr = 'MMM dd, yyyy HH:mm') => {
  if (!date) return 'N/A';
  return format(new Date(date), formatStr);
};

/**
 * Format date to relative time (e.g., "2 hours ago")
 * @param {Date|string} date - The date to format
 * @returns {string} Relative time string
 */
export const formatRelativeTime = (date) => {
  if (!date) return 'N/A';
  return formatDistanceToNow(new Date(date), { addSuffix: true });
};

/**
 * Calculate profit/loss percentage
 * @param {number} current - Current value
 * @param {number} original - Original value
 * @returns {number} Percentage change
 */
export const calculateProfitLossPercentage = (current, original) => {
  if (!original || original === 0) return 0;
  return ((current - original) / original) * 100;
};

/**
 * Get price change indicator (up/down arrow)
 * @param {number} change - The price change value
 * @returns {string} Arrow symbol
 */
export const getPriceIndicator = (change) => {
  if (change > 0) return '▲';
  if (change < 0) return '▼';
  return '─';
};

/**
 * Get color class based on value (positive/negative)
 * @param {number} value - The value to check
 * @returns {string} Tailwind color class
 */
export const getValueColorClass = (value) => {
  if (value > 0) return 'text-terminal-green';
  if (value < 0) return 'text-terminal-red';
  return 'text-text-primary';
};

/**
 * Truncate text with ellipsis
 * @param {string} text - The text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
export const truncateText = (text, maxLength = 20) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};
