import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { USER_ROLES, API_BASE_URL } from '../../utils/constants';
import { toast } from 'react-hot-toast';

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated, loading } = useAuth();
  const [isOnline, setIsOnline] = useState(true);

  // Check backend connectivity
  useEffect(() => {
    const checkBackend = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/stocks/allstocks`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });
        setIsOnline(response.ok);
      } catch {
        setIsOnline(false);
      }
    };

    // Initial check
    checkBackend();

    // Check every 10 seconds
    const interval = setInterval(checkBackend, 10000);

    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  // Don't show navbar while loading or if not authenticated
  if (loading || !isAuthenticated || !user) {
    return null;
  }

  // Role-based navigation items
  const getNavItems = () => {
    if (!user) return [];

    const items = [];

    // All roles can see their dashboard
    items.push({ 
      path: `/${user.role}/dashboard`, 
      label: 'Dashboard' 
    });

    // Investors and Admins can see marketplace
    if (user.role === USER_ROLES.INVESTOR || user.role === USER_ROLES.ADMIN) {
      items.push({ 
        path: '/marketplace', 
        label: 'Marketplace' 
      });
    }

    return items;
  };

  const navItems = getNavItems();

  return (
    <nav style={{ 
      background: '#000', 
      borderBottom: '2px solid #FF6B00',
      padding: '12px 24px'
    }}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        maxWidth: '1400px',
        margin: '0 auto'
      }}>
        {/* Logo */}
        <Link 
          to="/"
          style={{
            fontSize: '24px', 
            fontWeight: 'bold', 
            color: '#FF6B00',
            fontFamily: 'Courier New, monospace',
            textDecoration: 'none'
          }}
        >
          STOCKATHON
        </Link>

        {/* Navigation Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              style={{
                color: '#B0B0B0',
                fontSize: '14px',
                fontFamily: 'Courier New, monospace',
                textDecoration: 'none',
                textTransform: 'uppercase',
                fontWeight: 'bold',
                transition: 'color 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.color = '#FF6B00'}
              onMouseLeave={(e) => e.target.style.color = '#B0B0B0'}
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* User Info & Logout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Online Indicator */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            padding: '6px 12px',
            background: '#1A1F3A',
            border: `1px solid ${isOnline ? '#00FF00' : '#FF0000'}`,
            borderRadius: '4px'
          }}>
            <div style={{ 
              width: '8px', 
              height: '8px', 
              borderRadius: '50%', 
              background: isOnline ? '#00FF00' : '#FF0000',
              animation: isOnline ? 'pulse 2s infinite' : 'none',
              boxShadow: isOnline ? '0 0 8px #00FF00' : '0 0 8px #FF0000'
            }} />
            <span style={{ 
              color: isOnline ? '#00FF00' : '#FF0000',
              fontSize: '10px',
              fontFamily: 'Courier New, monospace',
              fontWeight: 'bold',
              textTransform: 'uppercase'
            }}>
              {isOnline ? 'ONLINE' : 'OFFLINE'}
            </span>
          </div>

          <div style={{ 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'flex-end',
            gap: '2px'
          }}>
            <span style={{ 
              color: '#FFD700',
              fontSize: '12px',
              fontFamily: 'Courier New, monospace',
              fontWeight: 'bold'
            }}>
              {user?.name || user?.ticker || user?.email}
            </span>
            <span style={{ 
              color: '#B0B0B0',
              fontSize: '10px',
              fontFamily: 'Courier New, monospace',
              textTransform: 'uppercase'
            }}>
              {user?.role}
            </span>
          </div>
          
          <button
            onClick={handleLogout}
            style={{
              padding: '8px 16px',
              background: 'transparent',
              border: '1px solid #FF6B00',
              color: '#FF6B00',
              fontSize: '12px',
              fontFamily: 'Courier New, monospace',
              fontWeight: 'bold',
              cursor: 'pointer',
              textTransform: 'uppercase',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = '#FF6B00';
              e.target.style.color = '#000';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'transparent';
              e.target.style.color = '#FF6B00';
            }}
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
