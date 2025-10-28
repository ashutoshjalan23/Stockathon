import { useMemo } from 'react';
import { useAuth } from './useAuth';
import { ROLES } from '../utils/constants';

/**
 * Custom hook for role-based permissions
 * @returns {Object} Role checking methods
 */
export const useRole = () => {
  const { user, hasRole } = useAuth();

  const permissions = useMemo(() => {
    const role = user?.role;

    return {
      // Basic role checks
      isAdmin: role === ROLES.ADMIN,
      isInvestor: role === ROLES.INVESTOR,
      isStock: role === ROLES.STOCK,
      
      // Access permissions
      canAccessMarketplace: role === ROLES.ADMIN || role === ROLES.INVESTOR,
      canAccessPortfolio: role === ROLES.INVESTOR,
      canAccessAdminPanel: role === ROLES.ADMIN,
      canAccessStockDashboard: role === ROLES.STOCK,
      
      // Transaction permissions
      canViewAllTransactions: role === ROLES.ADMIN,
      canViewOwnTransactions: role === ROLES.INVESTOR,
      canViewStockTransactions: role === ROLES.STOCK,
      
      // Trading permissions
      canBuyStocks: role === ROLES.INVESTOR,
      canSellStocks: role === ROLES.INVESTOR,
      
      // Management permissions
      canCreateStocks: role === ROLES.ADMIN,
      canCreateInvestors: role === ROLES.ADMIN,
      canViewAllInvestors: role === ROLES.ADMIN,
      canViewShareholders: role === ROLES.STOCK || role === ROLES.ADMIN,
      
      // Navigation permissions
      showMarketplaceLink: role === ROLES.ADMIN || role === ROLES.INVESTOR,
      showPortfolioLink: role === ROLES.INVESTOR,
      showAdminLink: role === ROLES.ADMIN,
      showDashboardLink: true, // All users have dashboard
      
      // Generic permission check
      hasRole: (roleOrRoles) => hasRole(roleOrRoles),
      
      // Current role
      currentRole: role,
    };
  }, [user?.role, hasRole]);

  return permissions;
};
