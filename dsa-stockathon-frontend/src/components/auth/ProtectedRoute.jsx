import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

/**
 * ProtectedRoute Component
 * Wraps routes that require authentication and/or specific roles
 * 
 * @param {React.ReactNode} children - The component to render if authorized
 * @param {string|string[]} allowedRoles - Optional: Role(s) allowed to access this route
 * @param {string} redirectTo - Optional: Where to redirect unauthorized users (default: /login)
 */
const ProtectedRoute = ({ 
  children, 
  allowedRoles = null,
  redirectTo = '/login' 
}) => {
  const { user, isAuthenticated, loading } = useAuth();

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: '#0A0E27'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px'
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '4px solid #2E3A59',
            borderTop: '4px solid #FF6B00',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          <p style={{ 
            color: '#B0B0B0',
            fontFamily: 'Courier New, monospace',
            fontSize: '14px'
          }}>
            AUTHENTICATING...
          </p>
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Check if user is authenticated
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  // Check if specific roles are required
  if (allowedRoles) {
    const rolesArray = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
    
    if (!rolesArray.includes(user?.role)) {
      // Redirect to user's appropriate dashboard based on their role
      const redirectMap = {
        'admin': '/admin/dashboard',
        'investor': '/investor/dashboard',
        'stock': '/stock/dashboard'
      };
      
      const userDashboard = redirectMap[user?.role] || '/login';
      return <Navigate to={userDashboard} replace />;
    }
  }

  // User is authenticated and has the right role
  return children;
};

export default ProtectedRoute;
