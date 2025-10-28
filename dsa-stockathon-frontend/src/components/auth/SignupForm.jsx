import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';
import { authService } from '../../services/authService';
import { USER_ROLES } from '../../utils/constants';

const SignupForm = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin, loading: authLoading } = useAuth();

  // Redirect non-admin users
  useEffect(() => {
    if (!authLoading && (!isAuthenticated || !isAdmin)) {
      toast.error('Only administrators can create new users');
      navigate('/login');
    }
  }, [isAuthenticated, isAdmin, authLoading, navigate]);
  
  const [formData, setFormData] = useState({
    name: '',
    password: '',
    confirmPassword: '',
    role: USER_ROLES.INVESTOR,
    // Advanced fields
    balance: 10000, // For Investor
    pricePerShare: 100, // For Stock
    shares: 1000, // For Stock
  });
  
  const [loading, setLoading] = useState(false);
  const [advancedMode, setAdvancedMode] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.name || !formData.password) {
      toast.error('Name and password are required');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return false;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      let response;
      let userName = '';
      
      // Call the appropriate signup method based on role
      switch (formData.role) {
        case USER_ROLES.ADMIN:
          response = await authService.adminSignup(formData.name, formData.password);
          userName = response.admin?.name || formData.name;
          break;
        case USER_ROLES.INVESTOR:
          // Include balance if in advanced mode
          response = await authService.investorSignup(
            formData.name, 
            formData.password,
            advancedMode ? formData.balance : undefined
          );
          userName = response.Investor?.name || formData.name;
          break;
        case USER_ROLES.STOCK:
          // Include pricePerShare and shares if in advanced mode
          response = await authService.stockSignup(
            formData.name, 
            formData.password,
            advancedMode ? formData.pricePerShare : undefined,
            advancedMode ? formData.shares : undefined
          );
          userName = response.stocks?.name || formData.name;
          break;
        default:
          throw new Error('Invalid user role');
      }

      // Show success message
      toast.success(`User "${userName}" created successfully as ${formData.role}!`);

      // Reset form to create another user
      setFormData({
        name: '',
        password: '',
        confirmPassword: '',
        role: USER_ROLES.INVESTOR,
        balance: 10000,
        pricePerShare: 100,
        shares: 1000,
      });

    } catch (error) {
      console.error('Signup error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'User creation failed';
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
      <div className="panel" style={{ maxWidth: '600px', width: '100%' }}>
        <div className="panel-header">
          <span style={{ color: '#FF6B00' }}>ADMIN</span> / CREATE NEW USER
        </div>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Advanced Mode Toggle */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            padding: '12px 16px',
            background: '#1A1F3A',
            border: '1px solid #2E3A59'
          }}>
            <div>
              <span style={{ 
                color: '#FFD700',
                fontSize: '12px',
                fontWeight: 'bold',
                fontFamily: 'Courier New, monospace',
                textTransform: 'uppercase'
              }}>
                Advanced Mode
              </span>
              <div style={{ 
                color: '#B0B0B0',
                fontSize: '11px',
                marginTop: '4px',
                fontFamily: 'Courier New, monospace'
              }}>
                {advancedMode ? 'All schema fields visible' : 'Basic fields only'}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setAdvancedMode(!advancedMode)}
              style={{
                padding: '8px 16px',
                background: advancedMode ? '#FF6B00' : '#2E3A59',
                border: `1px solid ${advancedMode ? '#FF6B00' : '#2E3A59'}`,
                color: advancedMode ? '#000' : '#B0B0B0',
                fontFamily: 'Courier New, monospace',
                fontSize: '12px',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.2s',
                textTransform: 'uppercase'
              }}
            >
              {advancedMode ? 'ON' : 'OFF'}
            </button>
          </div>

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

          {/* Name Field */}
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
              placeholder={formData.role === USER_ROLES.STOCK ? 'e.g., Apple Inc.' : 'John Doe'}
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

          {/* Password Fields */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
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
                placeholder="Min. 6 characters"
                required
                minLength="6"
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

            <div>
              <label 
                htmlFor="confirmPassword"
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
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Re-enter password"
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
          </div>

          {/* Advanced Fields */}
          {advancedMode && (
            <div style={{ 
              padding: '16px',
              background: '#0F1429',
              border: '1px solid #FF6B00',
              borderRadius: '4px'
            }}>
              <div style={{ 
                color: '#FF6B00',
                fontSize: '11px',
                fontWeight: 'bold',
                fontFamily: 'Courier New, monospace',
                textTransform: 'uppercase',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span style={{ 
                  display: 'inline-block',
                  width: '6px',
                  height: '6px',
                  background: '#FF6B00',
                  animation: 'pulse 2s infinite'
                }} />
                Advanced Settings
              </div>

              {/* Investor Advanced Fields */}
              {formData.role === USER_ROLES.INVESTOR && (
                <div>
                  <label 
                    htmlFor="balance"
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
                    Initial Balance ($)
                  </label>
                  <input
                    type="number"
                    id="balance"
                    name="balance"
                    value={formData.balance}
                    onChange={handleChange}
                    placeholder="10000"
                    min="0"
                    step="100"
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
                  <div style={{ 
                    color: '#B0B0B0',
                    fontSize: '11px',
                    marginTop: '6px',
                    fontFamily: 'Courier New, monospace'
                  }}>
                    Default: $10,000
                  </div>
                </div>
              )}

              {/* Stock Advanced Fields */}
              {formData.role === USER_ROLES.STOCK && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label 
                      htmlFor="pricePerShare"
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
                      Price Per Share ($)
                    </label>
                    <input
                      type="number"
                      id="pricePerShare"
                      name="pricePerShare"
                      value={formData.pricePerShare}
                      onChange={handleChange}
                      placeholder="100"
                      min="0.01"
                      step="0.01"
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
                    <div style={{ 
                      color: '#B0B0B0',
                      fontSize: '11px',
                      marginTop: '6px',
                      fontFamily: 'Courier New, monospace'
                    }}>
                      Default: $100
                    </div>
                  </div>

                  <div>
                    <label 
                      htmlFor="shares"
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
                      Available Shares
                    </label>
                    <input
                      type="number"
                      id="shares"
                      name="shares"
                      value={formData.shares}
                      onChange={handleChange}
                      placeholder="1000"
                      min="1"
                      step="1"
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
                    <div style={{ 
                      color: '#B0B0B0',
                      fontSize: '11px',
                      marginTop: '6px',
                      fontFamily: 'Courier New, monospace'
                    }}>
                      Default: 1,000 shares
                    </div>
                  </div>
                </div>
              )}

              {/* Admin has no advanced fields */}
              {formData.role === USER_ROLES.ADMIN && (
                <div style={{ 
                  color: '#B0B0B0',
                  fontSize: '12px',
                  fontFamily: 'Courier New, monospace',
                  fontStyle: 'italic',
                  textAlign: 'center',
                  padding: '12px'
                }}>
                  No additional fields for Admin role
                </div>
              )}
            </div>
          )}

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
            {loading ? 'CREATING ACCOUNT...' : 'SIGN UP'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SignupForm;
