import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import adminService from '../services/adminService';
import { BarChart3, Users, ArrowLeftRight, DollarSign, TrendingUp } from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalStocks: 0,
    totalInvestors: 0,
    totalTransactions: 0,
    totalVolume: 0,
    totalMarketCap: 0,
  });
  const [stocks, setStocks] = useState([]);
  const [investors, setInvestors] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [lastUpdate, setLastUpdate] = useState(null);

  // Fetch all data
  const fetchDashboardData = async () => {
    try {
      const [stocksData, investorsData, adminsData, transactionsData, statsData] = await Promise.all([
        adminService.getAllStocks(),
        adminService.getAllInvestors(),
        adminService.getAllAdmins(),
        adminService.getAllTransactions(),
        adminService.getSystemStats(),
      ]);

      setStocks(stocksData);
      setInvestors(investorsData);
      setAdmins(adminsData);
      setTransactions(transactionsData);
      setStats(statsData);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error fetching admin dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    
    // Auto-refresh every 10 seconds
    const interval = setInterval(fetchDashboardData, 10000);
    
    return () => clearInterval(interval);
  }, []);

  // Calculate user data from stocks and investors
  const getAllUsers = () => {
    const users = [];
    
    // Add all stocks as users
    stocks.forEach(stock => {
      users.push({
        _id: stock._id,
        name: stock.name,
        role: 'Stock',
        pricePerShare: stock.pricePerShare,
        shares: stock.shares,
        totalShares: (stock.shares || 0) + 
          (stock.Owners?.reduce((sum, o) => sum + (o.sharesOwned || 0), 0) || 0),
      });
    });

    // Add all investors with their portfolio data
    investors.forEach(investor => {
      // Calculate total holdings and value
      let totalHoldings = 0;
      let totalValue = 0;
      
      investor.portfolio?.forEach(item => {
        const stock = stocks.find(s => s._id?.toString() === item.stock?.toString());
        if (stock) {
          totalHoldings += item.shares || 0;
          totalValue += (item.shares || 0) * (stock.pricePerShare || 0);
        }
      });

      users.push({
        _id: investor._id,
        name: investor.name,
        role: 'Investor',
        balance: investor.balance,
        holdings: totalHoldings,
        totalValue: totalValue,
      });
    });
    
    // Add all admins
    admins.forEach(admin => {
      users.push({
        _id: admin._id,
        name: admin.name,
        role: 'Admin',
      });
    });

    return users;
  };

  const users = getAllUsers();

  if (loading) {
    return (
      <div style={{ 
        minHeight: 'calc(100vh - 60px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#FFD700'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            fontSize: '14px',
            fontFamily: 'Courier New, monospace'
          }}>
            LOADING ADMIN DASHBOARD...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', minHeight: 'calc(100vh - 60px)' }}>
      {/* Header */}
      <div className="panel" style={{ marginBottom: '24px' }}>
        <div className="panel-header" style={{ 
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span>ADMIN DASHBOARD</span>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button
              onClick={() => navigate('/signup')}
              className="btn-primary"
              style={{ fontSize: '12px', padding: '8px 16px' }}
            >
              + CREATE USER
            </button>
            {lastUpdate && (
              <span style={{ 
                fontSize: '11px',
                color: '#B0B0B0',
                fontFamily: 'Courier New, monospace'
              }}>
                Last Update: {lastUpdate.toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>
        
        <div style={{ padding: '16px 0' }}>
          <p style={{ color: '#B0B0B0', fontSize: '14px' }}>
            Welcome, <span style={{ color: '#FF6B00', fontWeight: 'bold' }}>{user?.name}</span>
          </p>
        </div>
      </div>

      {/* Stats Overview Cards */}
      <div style={{ 
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '24px'
      }}>
        <StatCard 
          label="Total Stocks"
          value={stats.totalStocks}
          icon={<BarChart3 size={24} color="#FF6B00" />}
        />
        <StatCard 
          label="Total Investors"
          value={stats.totalInvestors}
          icon={<Users size={24} color="#00A6FF" />}
        />
        <StatCard 
          label="Total Transactions"
          value={stats.totalTransactions}
          icon={<ArrowLeftRight size={24} color="#FFD700" />}
        />
        <StatCard 
          label="Trading Volume"
          value={`$${stats.totalVolume.toLocaleString()}`}
          icon={<DollarSign size={24} color="#00FF00" />}
        />
        <StatCard 
          label="Market Cap"
          value={`$${stats.totalMarketCap.toLocaleString()}`}
          icon={<TrendingUp size={24} color="#00FF00" />}
        />
      </div>

      {/* Tabs */}
      <div className="panel">
        <div style={{ 
          display: 'flex',
          borderBottom: '2px solid #2E3A59',
          marginBottom: '20px'
        }}>
          {['overview', 'users', 'stocks', 'transactions'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '12px 24px',
                background: activeTab === tab ? '#FF6B00' : 'transparent',
                border: 'none',
                borderBottom: activeTab === tab ? '2px solid #FF6B00' : '2px solid transparent',
                color: activeTab === tab ? '#000' : '#B0B0B0',
                fontFamily: 'Courier New, monospace',
                fontSize: '12px',
                fontWeight: 'bold',
                textTransform: 'uppercase',
                cursor: 'pointer',
                transition: 'all 0.2s',
                marginBottom: '-2px'
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        <div style={{ padding: '16px' }}>
          {activeTab === 'overview' && (
            <OverviewTab 
              stocks={stocks}
              transactions={transactions}
              users={users}
            />
          )}
          
          {activeTab === 'users' && (
            <UsersTab users={users} />
          )}
          
          {activeTab === 'stocks' && (
            <StocksTab stocks={stocks} />
          )}
          
          {activeTab === 'transactions' && (
            <TransactionsTab transactions={transactions} stocks={stocks} />
          )}
        </div>
      </div>
    </div>
  );
};

// Stat Card Component
const StatCard = ({ label, value, icon }) => (
  <div style={{
    background: '#1A1F3A',
    border: '1px solid #2E3A59',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  }}>
    <div style={{ 
      marginBottom: '4px'
    }}>
      {icon}
    </div>
    <div style={{ 
      color: '#FFD700',
      fontSize: '11px',
      fontFamily: 'Courier New, monospace',
      textTransform: 'uppercase',
      fontWeight: 'bold'
    }}>
      {label}
    </div>
    <div style={{ 
      color: '#FFFFFF',
      fontSize: '20px',
      fontFamily: 'Courier New, monospace',
      fontWeight: 'bold'
    }}>
      {value}
    </div>
  </div>
);

// Overview Tab Component
const OverviewTab = ({ stocks, transactions, users }) => {
  const recentTransactions = transactions.slice(0, 5);
  const topStocks = [...stocks]
    .sort((a, b) => {
      const aMarketCap = ((a.shares || 0) + 
        (a.Owners?.reduce((s, o) => s + (o.sharesOwned || 0), 0) || 0)) * (a.pricePerShare || 0);
      const bMarketCap = ((b.shares || 0) + 
        (b.Owners?.reduce((s, o) => s + (o.sharesOwned || 0), 0) || 0)) * (b.pricePerShare || 0);
      return bMarketCap - aMarketCap;
    })
    .slice(0, 5);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h3 style={{ 
          color: '#FF6B00',
          fontSize: '14px',
          fontFamily: 'Courier New, monospace',
          marginBottom: '16px',
          textTransform: 'uppercase'
        }}>
          System Summary
        </h3>
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '16px'
        }}>
          <div style={{ 
            background: '#0F1429',
            padding: '16px',
            border: '1px solid #2E3A59'
          }}>
            <div style={{ color: '#B0B0B0', fontSize: '12px', marginBottom: '8px' }}>
              Total Users
            </div>
            <div style={{ color: '#00FF00', fontSize: '24px', fontFamily: 'Courier New, monospace' }}>
              {users.length}
            </div>
          </div>
          <div style={{ 
            background: '#0F1429',
            padding: '16px',
            border: '1px solid #2E3A59'
          }}>
            <div style={{ color: '#B0B0B0', fontSize: '12px', marginBottom: '8px' }}>
              Active Stocks
            </div>
            <div style={{ color: '#00FF00', fontSize: '24px', fontFamily: 'Courier New, monospace' }}>
              {stocks.filter(s => s.shares > 0).length}/{stocks.length}
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 style={{ 
          color: '#FF6B00',
          fontSize: '14px',
          fontFamily: 'Courier New, monospace',
          marginBottom: '12px',
          textTransform: 'uppercase'
        }}>
          Top 5 Stocks by Market Cap
        </h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#1A1F3A' }}>
                <th className="table-header">Stock Name</th>
                <th className="table-header">Price/Share</th>
                <th className="table-header">Total Shares</th>
                <th className="table-header">Market Cap</th>
              </tr>
            </thead>
            <tbody>
              {topStocks.map((stock) => {
                const totalShares = (stock.shares || 0) + 
                  (stock.Owners?.reduce((s, o) => s + (o.sharesOwned || 0), 0) || 0);
                const marketCap = totalShares * (stock.pricePerShare || 0);
                
                return (
                  <tr key={stock._id} className="table-row">
                    <td style={{ padding: '12px' }}>{stock.name}</td>
                    <td style={{ padding: '12px' }}>${stock.pricePerShare?.toFixed(2)}</td>
                    <td style={{ padding: '12px' }}>{totalShares.toLocaleString()}</td>
                    <td style={{ padding: '12px', color: '#00FF00' }}>
                      ${marketCap.toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h3 style={{ 
          color: '#FF6B00',
          fontSize: '14px',
          fontFamily: 'Courier New, monospace',
          marginBottom: '12px',
          textTransform: 'uppercase'
        }}>
          Recent Transactions
        </h3>
        <TransactionsTab transactions={recentTransactions} stocks={stocks} compact />
      </div>
    </div>
  );
};

// Users Tab Component  
const UsersTab = ({ users }) => {
  const [filter, setFilter] = useState('all');
  
  const filteredUsers = filter === 'all' 
    ? users 
    : users.filter(u => u.role === filter);

  return (
    <div>
      <div style={{ 
        display: 'flex',
        gap: '12px',
        marginBottom: '16px'
      }}>
        {['all', 'Admin', 'Investor', 'Stock'].map(role => (
          <button
            key={role}
            onClick={() => setFilter(role)}
            style={{
              padding: '8px 16px',
              background: filter === role ? '#FF6B00' : '#1A1F3A',
              border: `1px solid ${filter === role ? '#FF6B00' : '#2E3A59'}`,
              color: filter === role ? '#000' : '#B0B0B0',
              fontFamily: 'Courier New, monospace',
              fontSize: '12px',
              fontWeight: 'bold',
              cursor: 'pointer',
              textTransform: 'uppercase',
              transition: 'all 0.2s'
            }}
          >
            {role} ({role === 'all' ? users.length : users.filter(u => u.role === role).length})
          </button>
        ))}
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#1A1F3A' }}>
              <th className="table-header">User ID</th>
              <th className="table-header">Name</th>
              <th className="table-header">Role</th>
              <th className="table-header">Details</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => (
              <tr key={user._id} className="table-row">
                <td style={{ 
                  padding: '12px',
                  fontFamily: 'Courier New, monospace',
                  fontSize: '11px',
                  color: '#B0B0B0'
                }}>
                  {user._id?.toString().slice(-8)}
                </td>
                <td style={{ padding: '12px', fontWeight: 'bold' }}>{user.name}</td>
                <td style={{ padding: '12px' }}>
                  <span style={{
                    padding: '4px 8px',
                    background: user.role === 'Admin' ? '#FF6B00' : 
                               user.role === 'Investor' ? '#00A6FF' : '#00FF00',
                    color: '#000',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    fontFamily: 'Courier New, monospace'
                  }}>
                    {user.role}
                  </span>
                </td>
                <td style={{ padding: '12px', fontSize: '12px', color: '#B0B0B0' }}>
                  {user.role === 'Stock' && (
                    <>Price: ${user.pricePerShare?.toFixed(2)} | Shares: {user.shares}</>
                  )}
                  {user.role === 'Investor' && (
                    <>
                      Balance: ${user.balance?.toFixed(2)} | 
                      Holdings: {user.holdings} | 
                      Value: ${user.totalValue?.toFixed(2)}
                    </>
                  )}
                  {user.role === 'Admin' && <>System Administrator</>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Stocks Tab Component
const StocksTab = ({ stocks }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredStocks = stocks.filter(stock =>
    stock.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div style={{ marginBottom: '16px' }}>
        <input
          type="text"
          placeholder="Search stocks..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input-field"
          style={{ width: '100%', maxWidth: '400px' }}
        />
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#1A1F3A' }}>
              <th className="table-header">Stock Name</th>
              <th className="table-header">Price/Share</th>
              <th className="table-header">Available</th>
              <th className="table-header">Owned</th>
              <th className="table-header">Total Shares</th>
              <th className="table-header">Investors</th>
              <th className="table-header">Market Cap</th>
            </tr>
          </thead>
          <tbody>
            {filteredStocks.map(stock => {
              const ownedShares = stock.Owners?.reduce((sum, o) => sum + (o.sharesOwned || 0), 0) || 0;
              const totalShares = (stock.shares || 0) + ownedShares;
              const marketCap = totalShares * (stock.pricePerShare || 0);
              const investorCount = stock.Owners?.length || 0;

              return (
                <tr key={stock._id} className="table-row">
                  <td style={{ padding: '12px', fontWeight: 'bold' }}>{stock.name}</td>
                  <td style={{ padding: '12px', color: '#FFD700' }}>
                    ${stock.pricePerShare?.toFixed(2)}
                  </td>
                  <td style={{ padding: '12px' }}>{stock.shares?.toLocaleString()}</td>
                  <td style={{ padding: '12px' }}>{ownedShares.toLocaleString()}</td>
                  <td style={{ padding: '12px' }}>{totalShares.toLocaleString()}</td>
                  <td style={{ padding: '12px', color: '#00A6FF' }}>{investorCount}</td>
                  <td style={{ padding: '12px', color: '#00FF00' }}>
                    ${marketCap.toLocaleString()}
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
const TransactionsTab = ({ transactions, stocks, compact = false }) => {
  const [filterType, setFilterType] = useState('all');
  
  const filteredTransactions = filterType === 'all'
    ? transactions
    : transactions.filter(t => t.type === filterType);

  const getStockName = (txn) => {
    // Try to get stock name from populated field or from stocks array
    if (txn.stock?.name) return txn.stock.name;
    if (txn.startup?.name) return txn.startup.name;
    
    const stockId = txn.stock?._id || txn.stock || txn.startup?._id || txn.startup;
    if (stockId) {
      const stock = stocks.find(s => s._id?.toString() === stockId?.toString());
      return stock?.name || 'Unknown';
    }
    return 'Unknown';
  };

  const displayTransactions = compact ? filteredTransactions : filteredTransactions;

  return (
    <div>
      {!compact && (
        <div style={{ 
          display: 'flex',
          gap: '12px',
          marginBottom: '16px'
        }}>
          {['all', 'BUY', 'SELL'].map(type => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              style={{
                padding: '8px 16px',
                background: filterType === type ? '#FF6B00' : '#1A1F3A',
                border: `1px solid ${filterType === type ? '#FF6B00' : '#2E3A59'}`,
                color: filterType === type ? '#000' : '#B0B0B0',
                fontFamily: 'Courier New, monospace',
                fontSize: '12px',
                fontWeight: 'bold',
                cursor: 'pointer',
                textTransform: 'uppercase',
                transition: 'all 0.2s'
              }}
            >
              {type}
            </button>
          ))}
        </div>
      )}

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#1A1F3A' }}>
              <th className="table-header">Type</th>
              <th className="table-header">Stock</th>
              <th className="table-header">Shares</th>
              <th className="table-header">Price/Share</th>
              <th className="table-header">Total Value</th>
              <th className="table-header">Date</th>
            </tr>
          </thead>
          <tbody>
            {displayTransactions.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ 
                  padding: '24px',
                  textAlign: 'center',
                  color: '#B0B0B0',
                  fontFamily: 'Courier New, monospace'
                }}>
                  No transactions found
                </td>
              </tr>
            ) : (
              displayTransactions.map((txn, idx) => (
                <tr key={txn._id || idx} className="table-row">
                  <td style={{ padding: '12px' }}>
                    <span style={{
                      padding: '4px 8px',
                      background: txn.type === 'BUY' ? '#00FF00' : '#FF0000',
                      color: '#000',
                      fontSize: '11px',
                      fontWeight: 'bold',
                      fontFamily: 'Courier New, monospace'
                    }}>
                      {txn.type}
                    </span>
                  </td>
                  <td style={{ padding: '12px' }}>{getStockName(txn)}</td>
                  <td style={{ padding: '12px' }}>{txn.shares?.toLocaleString()}</td>
                  <td style={{ padding: '12px', color: '#FFD700' }}>
                    ${txn.pricePerShare?.toFixed(2)}
                  </td>
                  <td style={{ padding: '12px', fontWeight: 'bold' }}>
                    ${((txn.shares || 0) * (txn.pricePerShare || 0)).toFixed(2)}
                  </td>
                  <td style={{ 
                    padding: '12px',
                    fontSize: '11px',
                    color: '#B0B0B0',
                    fontFamily: 'Courier New, monospace'
                  }}>
                    {txn.timestamp 
                      ? new Date(txn.timestamp).toLocaleString()
                      : txn.createdAt 
                        ? new Date(txn.createdAt).toLocaleString()
                        : 'N/A'
                    }
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDashboard;
