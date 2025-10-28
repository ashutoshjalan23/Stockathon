import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './hooks/useAuth';

// Components
import Navbar from './components/layout/Navbar';
import ProtectedRoute from './components/auth/ProtectedRoute';
import LoginForm from './components/auth/LoginForm';
import SignupForm from './components/auth/SignupForm';

// Pages
import AdminDashboard from './pages/AdminDashboard';
import InvestorDashboard from './pages/InvestorDashboard';
import StockDashboard from './pages/StockDashboard';
import Marketplace from './pages/Marketplace';
import NotFound from './pages/NotFound';

import './App.css';
import { USER_ROLES } from './utils/constants';

// Home component - redirects based on authentication
const Home = () => {
  const { isAuthenticated, user, loading } = useAuth();

  // Wait for auth to initialize before redirecting
  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: '#0A0E27',
        color: '#00D9FF'
      }}>
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Redirect to appropriate dashboard based on role
  const redirectMap = {
    [USER_ROLES.ADMIN]: '/admin/dashboard',
    [USER_ROLES.INVESTOR]: '/investor/dashboard',
    [USER_ROLES.STOCK]: '/stock/dashboard'
  };

  return <Navigate to={redirectMap[user?.role] || '/login'} replace />;
};

function AppRoutes() {
  return (
    <div style={{ minHeight: '100vh', background: '#0A0E27' }}>
      <Navbar />
      
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginForm />} />
        
        {/* Admin Only - Create New Users */}
        <Route 
          path="/signup" 
          element={
            <ProtectedRoute allowedRoles={USER_ROLES.ADMIN}>
              <SignupForm />
            </ProtectedRoute>
          } 
        />
        
        {/* Home - redirects to appropriate dashboard */}
        <Route path="/" element={<Home />} />

        {/* Admin Routes */}
        <Route 
          path="/admin/dashboard" 
          element={
            <ProtectedRoute allowedRoles={USER_ROLES.ADMIN}>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />

        {/* Investor Routes */}
        <Route 
          path="/investor/dashboard" 
          element={
            <ProtectedRoute allowedRoles={USER_ROLES.INVESTOR}>
              <InvestorDashboard />
            </ProtectedRoute>
          } 
        />

        {/* Stock Routes */}
        <Route 
          path="/stock/dashboard" 
          element={
            <ProtectedRoute allowedRoles={USER_ROLES.STOCK}>
              <StockDashboard />
            </ProtectedRoute>
          } 
        />

        {/* Marketplace - Accessible by Investors and Admins */}
        <Route 
          path="/marketplace" 
          element={
            <ProtectedRoute allowedRoles={[USER_ROLES.INVESTOR, USER_ROLES.ADMIN]}>
              <Marketplace />
            </ProtectedRoute>
          } 
        />

        {/* 404 Not Found */}
        <Route path="*" element={<NotFound />} />
      </Routes>

      {/* Toast Notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#0D1B2A',
            color: '#FFFFFF',
            border: '1px solid #FF6B00',
            fontFamily: 'Courier New, monospace',
          },
          success: {
            style: {
              background: '#00FF00',
              color: '#000000',
              border: '1px solid #39FF14',
            },
          },
          error: {
            style: {
              background: '#FF0000',
              color: '#FFFFFF',
              border: '1px solid #FF1744',
            },
          },
        }}
      />
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;
