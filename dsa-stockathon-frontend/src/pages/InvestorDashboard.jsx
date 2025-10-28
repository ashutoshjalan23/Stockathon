import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import { portfolioService } from '../services/portfolioService';
import { stockService } from '../services/stockService';
import { transactionService } from '../services/transactionService';

const InvestorDashboard = () => {
  const { user, getUserId, updateUser } = useAuth();
  
  const [activeTab, setActiveTab] = useState('portfolio'); // portfolio, transactions (removed marketplace)
  const [portfolio, setPortfolio] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sellModal, setSellModal] = useState({ isOpen: false, stock: null, maxShares: 0 });
  const [shares, setShares] = useState('');
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const investorId = getUserId();
  const REFRESH_INTERVAL = 10000; // 10 seconds

  // Fetch dashboard data
  const fetchDashboardData = useCallback(async () => {
    try {
      // Fetch portfolio
      const portfolioResponse = await portfolioService.getPortfolio(investorId);
      setPortfolio(portfolioResponse.portfolio || []);

      // Fetch updated user data (balance)
      const userResponse = await stockService.getUser(investorId);
      if (userResponse.data) {
        // Update user in context with latest balance
        updateUser(userResponse.data);
      }

      // Fetch all transactions and filter by investor
      const transactionsResponse = await transactionService.getAllTransactions();
      const myTransactions = transactionService.filterByInvestor(
        transactionsResponse.transactions || [],
        investorId
      );
      setTransactions(transactionService.sortByDateDesc(myTransactions));

      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, [investorId, updateUser]);

  // Initial load
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Auto-refresh every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchDashboardData();
    }, REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  const handleSell = async () => {
    if (!sellModal.stock || !shares) {
      toast.error('Please enter number of shares');
      return;
    }

    if (parseInt(shares) > sellModal.maxShares) {
      toast.error(`You only own ${sellModal.maxShares} shares`);
      return;
    }

    try {
      await stockService.sellStock(sellModal.stock._id, investorId, parseInt(shares));
      toast.success(`Sold ${shares} shares of ${sellModal.stock.name}`);
      setSellModal({ isOpen: false, stock: null, maxShares: 0 });
      setShares('');
      fetchDashboardData(); // Refresh data
    } catch (error) {
      console.error('Sell error:', error);
      toast.error(error.message || 'Failed to sell stock');
    }
  };

  const openSellModal = (portfolioItem) => {
    setSellModal({ 
      isOpen: true, 
      stock: portfolioItem.stock, 
      maxShares: portfolioItem.shares 
    });
    setShares('');
  };

  // Calculate portfolio stats
  const portfolioValue = portfolioService.calculateTotalValue(portfolio);
  const totalAssets = portfolioValue + (user?.balance || 0);

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div className="panel" style={{ marginBottom: '24px' }}>
        <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>INVESTOR DASHBOARD - {user?.name?.toUpperCase()}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '10px', color: '#B0B0B0' }}>
              Last Update: {lastUpdate.toLocaleTimeString()}
            </span>
            <div style={{ 
              width: '8px', 
              height: '8px', 
              borderRadius: '50%', 
              background: '#00FF00',
              animation: 'pulse 2s infinite'
            }} />
          </div>
        </div>
        <div style={{ padding: '24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <StatCard label="Portfolio Value" value={`$${portfolioValue.toFixed(2)}`} color="#00FF00" />
          <StatCard label="Available Balance" value={`$${(user?.balance || 0).toFixed(2)}`} color="#FFD700" />
          <StatCard label="Total Assets" value={`$${totalAssets.toFixed(2)}`} color="#FF6B00" />
          <StatCard label="Holdings" value={portfolio.length} color="#00A6FF" />
        </div>
      </div>

      {/* Tabs */}
      <div style={{ marginBottom: '24px', display: 'flex', gap: '12px' }}>
        <TabButton 
          label="Portfolio" 
          isActive={activeTab === 'portfolio'} 
          onClick={() => setActiveTab('portfolio')} 
        />
        <TabButton 
          label="Transaction History" 
          isActive={activeTab === 'transactions'} 
          onClick={() => setActiveTab('transactions')} 
        />
      </div>

      {/* Content */}
      {loading ? (
        <div className="panel">
          <div style={{ padding: '48px', textAlign: 'center', color: '#B0B0B0' }}>
            Loading...
          </div>
        </div>
      ) : (
        <>
          {activeTab === 'portfolio' && (
            <PortfolioTab 
              portfolio={portfolio} 
              onSell={openSellModal}
            />
          )}
          {activeTab === 'transactions' && (
            <TransactionsTab transactions={transactions} />
          )}
        </>
      )}

      {/* Sell Modal */}
      {sellModal.isOpen && (
        <Modal
          title={`Sell ${sellModal.stock?.name}`}
          onClose={() => setSellModal({ isOpen: false, stock: null, maxShares: 0 })}
        >
          <div style={{ marginBottom: '16px' }}>
            <p style={{ color: '#B0B0B0', fontSize: '12px', marginBottom: '8px' }}>
              Price per share: <span style={{ color: '#FFD700' }}>${sellModal.stock?.pricePerShare?.toFixed(2)}</span>
            </p>
            <p style={{ color: '#B0B0B0', fontSize: '12px', marginBottom: '16px' }}>
              You own: <span style={{ color: '#00FF00' }}>{sellModal.maxShares} shares</span>
            </p>

            <input
              type="number"
              placeholder="Number of shares"
              value={shares}
              onChange={(e) => setShares(e.target.value)}
              min="1"
              max={sellModal.maxShares}
              style={{
                width: '100%',
                padding: '12px',
                background: '#1A1F3A',
                border: '1px solid #2E3A59',
                color: '#FFFFFF',
                fontSize: '14px',
                fontFamily: 'Courier New, monospace',
              }}
            />

            {shares && (
              <p style={{ color: '#00FF00', fontSize: '12px', marginTop: '8px' }}>
                You will receive: ${(sellModal.stock?.pricePerShare * parseInt(shares || 0)).toFixed(2)}
              </p>
            )}
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={handleSell}
              style={{
                flex: 1,
                padding: '12px',
                background: '#FF0000',
                border: 'none',
                color: '#FFF',
                fontFamily: 'Courier New, monospace',
                fontWeight: 'bold',
                cursor: 'pointer',
              }}
            >
              CONFIRM SELL
            </button>
            <button
              onClick={() => setSellModal({ isOpen: false, stock: null, maxShares: 0 })}
              style={{
                flex: 1,
                padding: '12px',
                background: 'transparent',
                border: '1px solid #FF6B00',
                color: '#FF6B00',
                fontFamily: 'Courier New, monospace',
                fontWeight: 'bold',
                cursor: 'pointer',
              }}
            >
              CANCEL
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};

// Stat Card Component
const StatCard = ({ label, value, color }) => (
  <div style={{
    padding: '16px',
    background: '#1A1F3A',
    border: `1px solid ${color}`,
  }}>
    <p style={{ 
      color: '#B0B0B0', 
      fontSize: '10px', 
      marginBottom: '8px',
      fontFamily: 'Courier New, monospace',
      textTransform: 'uppercase'
    }}>
      {label}
    </p>
    <p style={{ 
      color: color, 
      fontSize: '24px', 
      fontWeight: 'bold',
      fontFamily: 'Courier New, monospace'
    }}>
      {value}
    </p>
  </div>
);

// Tab Button Component
const TabButton = ({ label, isActive, onClick }) => (
  <button
    onClick={onClick}
    style={{
      padding: '12px 24px',
      background: isActive ? '#FF6B00' : '#1A1F3A',
      border: `1px solid ${isActive ? '#FF6B00' : '#2E3A59'}`,
      color: isActive ? '#000' : '#B0B0B0',
      fontFamily: 'Courier New, monospace',
      fontWeight: 'bold',
      fontSize: '12px',
      cursor: 'pointer',
      textTransform: 'uppercase',
      transition: 'all 0.2s',
    }}
  >
    {label}
  </button>
);

// Portfolio Tab Component
const PortfolioTab = ({ portfolio, onSell }) => {
  if (portfolio.length === 0) {
    return (
      <div className="panel">
        <div style={{ padding: '48px', textAlign: 'center', color: '#B0B0B0' }}>
          <p>No holdings yet. Visit the Marketplace to buy stocks!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="panel">
      <div className="panel-header">YOUR PORTFOLIO</div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #FF6B00' }}>
              <th style={tableHeaderStyle}>STOCK</th>
              <th style={tableHeaderStyle}>SHARES</th>
              <th style={tableHeaderStyle}>PRICE/SHARE</th>
              <th style={tableHeaderStyle}>TOTAL VALUE</th>
              <th style={tableHeaderStyle}>ACTION</th>
            </tr>
          </thead>
          <tbody>
            {portfolio.map((item, index) => {
              const totalValue = (item.stock?.pricePerShare || 0) * (item.shares || 0);
              return (
                <tr key={index} style={{ borderBottom: '1px solid #2E3A59' }}>
                  <td style={tableCellStyle}>
                    <span style={{ color: '#FFD700', fontWeight: 'bold' }}>
                      {item.stock?.name || 'Unknown'}
                    </span>
                  </td>
                  <td style={tableCellStyle}>{item.shares}</td>
                  <td style={tableCellStyle}>${(item.stock?.pricePerShare || 0).toFixed(2)}</td>
                  <td style={{ ...tableCellStyle, color: '#00FF00' }}>
                    ${totalValue.toFixed(2)}
                  </td>
                  <td style={tableCellStyle}>
                    <button
                      onClick={() => onSell(item)}
                      style={{
                        padding: '6px 12px',
                        background: '#FF0000',
                        border: 'none',
                        color: '#FFF',
                        fontSize: '10px',
                        fontFamily: 'Courier New, monospace',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                      }}
                    >
                      SELL
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Transactions Tab Component
const TransactionsTab = ({ transactions }) => {
  if (transactions.length === 0) {
    return (
      <div className="panel">
        <div style={{ padding: '48px', textAlign: 'center', color: '#B0B0B0' }}>
          <p>No transactions yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="panel">
      <div className="panel-header">TRANSACTION HISTORY</div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #FF6B00' }}>
              <th style={tableHeaderStyle}>DATE</th>
              <th style={tableHeaderStyle}>TYPE</th>
              <th style={tableHeaderStyle}>STOCK</th>
              <th style={tableHeaderStyle}>SHARES</th>
              <th style={tableHeaderStyle}>PRICE/SHARE</th>
              <th style={tableHeaderStyle}>TOTAL</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((txn) => {
              const isBuy = txn.type === 'BUY';
              const total = (txn.pricePerShare || txn.value || 0) * (txn.shares || 0);
              const stockName = txn.stock?.name || txn.startup?.name || 'Unknown';
              
              return (
                <tr key={txn._id} style={{ borderBottom: '1px solid #2E3A59' }}>
                  <td style={tableCellStyle}>
                    {new Date(txn.timestamp).toLocaleDateString()} {new Date(txn.timestamp).toLocaleTimeString()}
                  </td>
                  <td style={{ ...tableCellStyle, color: isBuy ? '#00FF00' : '#FF0000', fontWeight: 'bold' }}>
                    {txn.type}
                  </td>
                  <td style={tableCellStyle}>{stockName}</td>
                  <td style={tableCellStyle}>{txn.shares}</td>
                  <td style={tableCellStyle}>${(txn.pricePerShare || txn.value || 0).toFixed(2)}</td>
                  <td style={{ ...tableCellStyle, color: isBuy ? '#FF0000' : '#00FF00' }}>
                    ${total.toFixed(2)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Modal Component
const Modal = ({ title, children, onClose }) => (
  <div style={{
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  }}>
    <div className="panel" style={{ maxWidth: '500px', width: '90%' }}>
      <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {title}
        <button
          onClick={onClose}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#FF6B00',
            fontSize: '20px',
            cursor: 'pointer',
          }}
        >
          ×
        </button>
      </div>
      <div style={{ padding: '24px' }}>
        {children}
      </div>
    </div>
  </div>
);

// Table Styles
const tableHeaderStyle = {
  padding: '12px',
  textAlign: 'left',
  color: '#FFD700',
  fontSize: '10px',
  fontFamily: 'Courier New, monospace',
  fontWeight: 'bold',
  textTransform: 'uppercase',
};

const tableCellStyle = {
  padding: '12px',
  color: '#B0B0B0',
  fontSize: '12px',
  fontFamily: 'Courier New, monospace',
};

export default InvestorDashboard;
