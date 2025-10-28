import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import { stockService } from '../services/stockService';

const StockDashboard = () => {
  const { getUserId } = useAuth();
  
  const [stockData, setStockData] = useState(null);
  const [shareholders, setShareholders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const stockId = getUserId();
  const REFRESH_INTERVAL = 10000; // 10 seconds

  // Fetch stock dashboard data
  const fetchDashboardData = useCallback(async () => {
    try {
      // Fetch all stocks and find this stock
      const stocksResponse = await stockService.getAllStocks();
      const myStock = stocksResponse.stocks?.find(s => s._id === stockId);
      
      if (!myStock) {
        toast.error('Stock not found');
        setLoading(false);
        return;
      }

      setStockData(myStock);
      setShareholders(myStock.Owners || []);

      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error fetching stock dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, [stockId]);

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

  // Calculate statistics
  const totalShares = (stockData?.shares || 0) + 
    (shareholders.reduce((sum, owner) => sum + (owner.sharesOwned || 0), 0) || 0);
  const sharesOwned = shareholders.reduce((sum, owner) => sum + (owner.sharesOwned || 0), 0) || 0;
  const marketCap = totalShares * (stockData?.pricePerShare || 0);

  if (loading) {
    return (
      <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
        <div className="panel">
          <div style={{ padding: '48px', textAlign: 'center', color: '#B0B0B0' }}>
            Loading stock dashboard...
          </div>
        </div>
      </div>
    );
  }

  if (!stockData) {
    return (
      <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
        <div className="panel">
          <div style={{ padding: '48px', textAlign: 'center', color: '#FF0000' }}>
            Stock data not found
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div className="panel" style={{ marginBottom: '24px' }}>
        <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>STOCK DASHBOARD - {stockData.name?.toUpperCase()}</span>
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

        {/* Stock Statistics */}
        <div style={{ padding: '24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <StatCard label="Current Price" value={`$${(stockData.pricePerShare || 0).toFixed(2)}`} color="#00FF00" />
          <StatCard label="Available Shares" value={stockData.shares || 0} color="#FFD700" />
          <StatCard label="Shares Owned" value={sharesOwned} color="#FF6B00" />
          <StatCard label="Total Shares" value={totalShares} color="#00A6FF" />
          <StatCard label="Market Cap" value={`$${marketCap.toFixed(2)}`} color="#9C27B0" />
          <StatCard label="Total Investors" value={shareholders.length} color="#4CAF50" />
        </div>
      </div>

      {/* Shareholders Table */}
      <div className="panel" style={{ marginBottom: '24px' }}>
        <div className="panel-header">SHAREHOLDERS ({shareholders.length})</div>
        {shareholders.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: '#B0B0B0' }}>
            No shareholders yet
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #FF6B00' }}>
                  <th style={tableHeaderStyle}>INVESTOR ID</th>
                  <th style={tableHeaderStyle}>SHARES OWNED</th>
                  <th style={tableHeaderStyle}>OWNERSHIP %</th>
                  <th style={tableHeaderStyle}>VALUE</th>
                </tr>
              </thead>
              <tbody>
                {shareholders.map((owner, index) => {
                  const ownershipPercent = ((owner.sharesOwned / totalShares) * 100).toFixed(2);
                  const value = owner.sharesOwned * (stockData.pricePerShare || 0);
                  
                  return (
                    <tr 
                      key={index} 
                      style={{ borderBottom: '1px solid #2E3A59' }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#1A1F3A'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={tableCellStyle}>
                        <span style={{ color: '#FFD700', fontFamily: 'monospace', fontSize: '11px' }}>
                          {owner.investor?._id || owner.investor || 'Unknown'}
                        </span>
                      </td>
                      <td style={{ ...tableCellStyle, color: '#00FF00', fontWeight: 'bold' }}>
                        {owner.sharesOwned || 0}
                      </td>
                      <td style={{ ...tableCellStyle, color: '#FFD700' }}>
                        {ownershipPercent}%
                      </td>
                      <td style={{ ...tableCellStyle, color: '#00FF00', fontWeight: 'bold' }}>
                        ${value.toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
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

export default StockDashboard;
