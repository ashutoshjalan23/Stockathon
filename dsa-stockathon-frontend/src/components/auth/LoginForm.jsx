import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';
import { authService } from '../../services/authService';
import { USER_ROLES } from '../../utils/constants';

const LoginForm = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, user, loading: authLoading } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    password: '',
    role: USER_ROLES.INVESTOR
  });
  
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && isAuthenticated && user) {
      // User is already logged in, redirect to appropriate dashboard
      const redirectMap = {
        [USER_ROLES.ADMIN]: '/admin/dashboard',
        [USER_ROLES.INVESTOR]: '/investor/dashboard',
        [USER_ROLES.STOCK]: '/stock/dashboard'
      };
      
      const redirectPath = redirectMap[user.role] || '/';
      navigate(redirectPath, { replace: true });
    }
  }, [authLoading, isAuthenticated, user, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name || !formData.password) {
      toast.error('Name and password are required');
      return;
    }

    setLoading(true);

    try {
      let response;
      
      // Call the appropriate login method based on role
      switch (formData.role) {
        case USER_ROLES.ADMIN:
          response = await authService.adminLogin(formData.name, formData.password);
          break;
        case USER_ROLES.INVESTOR:
          response = await authService.investorLogin(formData.name, formData.password);
          break;
        case USER_ROLES.STOCK:
          response = await authService.stockLogin(formData.name, formData.password);
          break;
        default:
          throw new Error('Invalid user role');
      }

      // Update auth context (token first, then user)
      login(response.token, response.user);
      
      toast.success(`Welcome back, ${response.user?.name || formData.name}!`);

      // Redirect based on role
      switch (formData.role) {
        case USER_ROLES.ADMIN:
          navigate('/admin/dashboard');
          break;
        case USER_ROLES.INVESTOR:
          navigate('/investor/dashboard');
          break;
        case USER_ROLES.STOCK:
          navigate('/stock/dashboard');
          break;
        default:
          navigate('/');
      }
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Login failed';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: '#0A0E27',
      padding: '20px'
    }}>
      <div className="panel" style={{ maxWidth: '500px', width: '100%' }}>
        <div className="panel-header">
          <span style={{ color: '#FF6B00' }}>STOCKATHON</span> / LOGIN
        </div>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Role Selection */}
          <div>
            <label style={{ 
              display: 'block',
              marginBottom: '8px',
              color: '#FFD700',
              fontSize: '12px',
              fontWeight: 'bold',
              fontFamily: 'Courier New, monospace',
              textTransform: 'uppercase'
            }}>
              User Type
            </label>
            <div style={{ display: 'flex', gap: '12px' }}>
              {[
                { value: USER_ROLES.INVESTOR, label: 'Investor' },
                { value: USER_ROLES.STOCK, label: 'Stock' },
                { value: USER_ROLES.ADMIN, label: 'Admin' }
              ].map((role) => (
                <label 
                  key={role.value}
                  style={{ 
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '12px',
                    background: formData.role === role.value ? '#FF6B00' : '#1A1F3A',
                    border: `1px solid ${formData.role === role.value ? '#FF6B00' : '#2E3A59'}`,
                    color: formData.role === role.value ? '#000' : '#B0B0B0',
                    fontFamily: 'Courier New, monospace',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  <input
                    type="radio"
                    name="role"
                    value={role.value}
                    checked={formData.role === role.value}
                    onChange={handleChange}
                    style={{ display: 'none' }}
                  />
                  {role.label}
                </label>
              ))}
            </div>
          </div>

          {/* Name */}
          <div>
            <label 
              htmlFor="name"
              style={{ 
                display: 'block',
                marginBottom: '8px',
                color: '#FFD700',
                fontSize: '12px',
                fontWeight: 'bold',
                fontFamily: 'Courier New, monospace',
                textTransform: 'uppercase'
              }}
            >
              {formData.role === USER_ROLES.STOCK ? 'Stock Name' : 'Name'}
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder={formData.role === USER_ROLES.STOCK ? 'e.g., Apple Inc.' : 'Enter your name'}
              required
              style={{
                width: '100%',
                padding: '12px 16px',
                background: '#1A1F3A',
                border: '1px solid #2E3A59',
                color: '#FFFFFF',
                fontFamily: 'Courier New, monospace',
                fontSize: '14px',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#FF6B00'}
              onBlur={(e) => e.target.style.borderColor = '#2E3A59'}
            />
          </div>

          {/* Password */}
          <div>
            <label 
              htmlFor="password"
              style={{ 
                display: 'block',
                marginBottom: '8px',
                color: '#FFD700',
                fontSize: '12px',
                fontWeight: 'bold',
                fontFamily: 'Courier New, monospace',
                textTransform: 'uppercase'
              }}
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
              style={{
                width: '100%',
                padding: '12px 16px',
                background: '#1A1F3A',
                border: '1px solid #2E3A59',
                color: '#FFFFFF',
                fontFamily: 'Courier New, monospace',
                fontSize: '14px',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#FF6B00'}
              onBlur={(e) => e.target.style.borderColor = '#2E3A59'}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{
              width: '100%',
              opacity: loading ? 0.6 : 1,
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'AUTHENTICATING...' : 'LOGIN'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;
