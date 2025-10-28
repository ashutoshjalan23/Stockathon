import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import { stockService } from '../services/stockService';
import { portfolioService } from '../services/portfolioService';
import { TrendingUp, TrendingDown } from 'lucide-react';

const Marketplace = () => {
  const { user, getUserId, isAdmin } = useAuth();
  const [stocks, setStocks] = useState([]);
  const [portfolio, setPortfolio] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name'); // name, price-asc, price-desc, available
  const [buyModal, setBuyModal] = useState({ isOpen: false, stock: null });
  const [sellModal, setSellModal] = useState({ isOpen: false, stock: null, maxShares: 0 });
  const [shares, setShares] = useState('');
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const investorId = getUserId();
  const REFRESH_INTERVAL = 10000; // 10 seconds

  // Fetch marketplace data
  const fetchMarketplaceData = useCallback(async () => {
    try {
      // Fetch all stocks
      const stocksResponse = await stockService.getAllStocks();
      setStocks(stocksResponse.stocks || []);

      // Fetch portfolio if investor
      if (!isAdmin && investorId) {
        const portfolioResponse = await portfolioService.getPortfolio(investorId);
        setPortfolio(portfolioResponse.portfolio || []);
      }

      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error fetching marketplace data:', error);
      toast.error('Failed to load marketplace data');
    } finally {
      setLoading(false);
    }
  }, [investorId, isAdmin]);

  // Initial load
  useEffect(() => {
    fetchMarketplaceData();
  }, [fetchMarketplaceData]);

  // Auto-refresh every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchMarketplaceData();
    }, REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, [fetchMarketplaceData]);

  // Filter and sort stocks
  const filteredStocks = stocks
    .filter(stock => {
      if (!searchQuery) return true;
      return stock.name?.toLowerCase().includes(searchQuery.toLowerCase());
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return (a.name || '').localeCompare(b.name || '');
        case 'price-asc':
          return (a.pricePerShare || 0) - (b.pricePerShare || 0);
        case 'price-desc':
          return (b.pricePerShare || 0) - (a.pricePerShare || 0);
        case 'available':
          return (b.shares || 0) - (a.shares || 0);
        default:
          return 0;
      }
    });

  const handleBuy = async () => {
    if (!buyModal.stock || !shares) {
      toast.error('Please enter number of shares');
      return;
    }

    const totalCost = buyModal.stock.pricePerShare * parseInt(shares);
    if (!stockService.canAffordPurchase(user.balance, totalCost)) {
      toast.error('Insufficient balance');
      return;
    }

    if (parseInt(shares) > buyModal.stock.shares) {
      toast.error('Not enough shares available');
      return;
    }

    try {
      await stockService.buyStock(buyModal.stock._id, investorId, parseInt(shares));
      toast.success(`Bought ${shares} shares of ${buyModal.stock.name}`);
      setBuyModal({ isOpen: false, stock: null });
      setShares('');
      fetchMarketplaceData(); // Refresh data
    } catch (error) {
      console.error('Buy error:', error);
      toast.error(error.message || 'Failed to buy stock');
    }
  };

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
      fetchMarketplaceData(); // Refresh data
    } catch (error) {
      console.error('Sell error:', error);
      toast.error(error.message || 'Failed to sell stock');
    }
  };

  const openBuyModal = (stock) => {
    setBuyModal({ isOpen: true, stock });
    setShares('');
  };

  const openSellModal = (stock, sharesOwned) => {
    setSellModal({ 
      isOpen: true, 
      stock, 
      maxShares: sharesOwned 
    });
    setShares('');
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div className="panel" style={{ marginBottom: '24px' }}>
        <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>STOCK MARKETPLACE</span>
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

        {/* Search and Filter Bar */}
        <div style={{ 
          padding: '16px 24px', 
          borderTop: '1px solid #2E3A59',
          display: 'flex',
          gap: '16px',
          alignItems: 'center',
          flexWrap: 'wrap'
        }}>
          {/* Search */}
          <div style={{ flex: '1 1 300px' }}>
            <input
              type="text"
              placeholder="Search stocks by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                background: '#1A1F3A',
                border: '1px solid #2E3A59',
                color: '#FFFFFF',
                fontSize: '12px',
                fontFamily: 'Courier New, monospace',
              }}
            />
          </div>

          {/* Sort */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={{ 
              color: '#B0B0B0', 
              fontSize: '10px',
              fontFamily: 'Courier New, monospace',
              textTransform: 'uppercase'
            }}>
              Sort By:
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                padding: '8px 12px',
                background: '#1A1F3A',
                border: '1px solid #2E3A59',
                color: '#FFD700',
                fontSize: '11px',
                fontFamily: 'Courier New, monospace',
                cursor: 'pointer',
              }}
            >
              <option value="name">Name (A-Z)</option>
              <option value="price-asc">Price (Low to High)</option>
              <option value="price-desc">Price (High to Low)</option>
              <option value="available">Most Available</option>
            </select>
          </div>

          {/* Results Count */}
          <div style={{ 
            color: '#B0B0B0', 
            fontSize: '11px',
            fontFamily: 'Courier New, monospace'
          }}>
            {filteredStocks.length} stock{filteredStocks.length !== 1 ? 's' : ''} found
          </div>
        </div>
      </div>

      {/* Stock List/Table */}
      {loading ? (
        <div className="panel">
          <div style={{ padding: '48px', textAlign: 'center', color: '#B0B0B0' }}>
            Loading marketplace...
          </div>
        </div>
      ) : filteredStocks.length === 0 ? (
        <div className="panel">
          <div style={{ padding: '48px', textAlign: 'center', color: '#B0B0B0' }}>
            {searchQuery ? 'No stocks match your search.' : 'No stocks available in marketplace.'}
          </div>
        </div>
      ) : (
        <div className="panel">
          <div className="panel-header">AVAILABLE STOCKS</div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #FF6B00' }}>
                  <th style={tableHeaderStyle}>STOCK NAME</th>
                  <th style={tableHeaderStyle}>PRICE/SHARE</th>
                  <th style={tableHeaderStyle}>AVAILABLE SHARES</th>
                  {!isAdmin && <th style={tableHeaderStyle}>YOU OWN</th>}
                  {!isAdmin && <th style={tableHeaderStyle}>YOUR VALUE</th>}
                  {!isAdmin && <th style={tableHeaderStyle}>ACTIONS</th>}
                </tr>
              </thead>
              <tbody>
                {filteredStocks.map((stock) => {
                  const sharesOwned = portfolioService.getSharesOwned(portfolio, stock._id);
                  const yourValue = sharesOwned * stock.pricePerShare;
                  const canBuy = stock.shares > 0;
                  const canSell = sharesOwned > 0;

                  return (
                    <tr 
                      key={stock._id} 
                      style={{ 
                        borderBottom: '1px solid #2E3A59',
                        transition: 'background 0.2s',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#1A1F3A'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={tableCellStyle}>
                        <span style={{ color: '#FFD700', fontWeight: 'bold', fontSize: '14px' }}>
                          {stock.name}
                        </span>
                      </td>
                      <td style={{ ...tableCellStyle, color: '#00FF00', fontSize: '14px', fontWeight: 'bold' }}>
                        ${stock.pricePerShare?.toFixed(2) || '0.00'}
                      </td>
                      <td style={{
                        ...tableCellStyle,
                        color: stock.shares > 0 ? '#00FF00' : '#FF0000',
                        fontWeight: 'bold'
                      }}>
                        {stock.shares || 0}
                        {stock.shares === 0 && (
                          <span style={{ marginLeft: '8px', fontSize: '10px', color: '#FF0000' }}>
                            [SOLD OUT]
                          </span>
                        )}
                      </td>
                      {!isAdmin && (
                        <>
                          <td style={{ 
                            ...tableCellStyle, 
                            color: sharesOwned > 0 ? '#FFD700' : '#666',
                            fontWeight: sharesOwned > 0 ? 'bold' : 'normal'
                          }}>
                            {sharesOwned}
                          </td>
                          <td style={{ 
                            ...tableCellStyle, 
                            color: sharesOwned > 0 ? '#00FF00' : '#666',
                            fontWeight: sharesOwned > 0 ? 'bold' : 'normal'
                          }}>
                            {sharesOwned > 0 ? `$${yourValue.toFixed(2)}` : '-'}
                          </td>
                          <td style={{ ...tableCellStyle, padding: '8px 12px' }}>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button
                                onClick={() => openBuyModal(stock)}
                                disabled={!canBuy}
                                style={{
                                  padding: '8px 16px',
                                  background: canBuy ? '#00FF00' : '#333',
                                  border: 'none',
                                  color: canBuy ? '#000' : '#666',
                                  fontSize: '11px',
                                  fontFamily: 'Courier New, monospace',
                                  fontWeight: 'bold',
                                  cursor: canBuy ? 'pointer' : 'not-allowed',
                                  textTransform: 'uppercase',
                                  transition: 'all 0.2s',
                                }}
                                onMouseEnter={(e) => {
                                  if (canBuy) e.target.style.background = '#39FF14';
                                }}
                                onMouseLeave={(e) => {
                                  if (canBuy) e.target.style.background = '#00FF00';
                                }}
                              >
                                <TrendingUp size={14} style={{ display: 'inline', marginRight: '4px' }} />
                                BUY
                              </button>
                              <button
                                onClick={() => openSellModal(stock, sharesOwned)}
                                disabled={!canSell}
                                style={{
                                  padding: '8px 16px',
                                  background: canSell ? '#FF0000' : '#333',
                                  border: 'none',
                                  color: canSell ? '#FFF' : '#666',
                                  fontSize: '11px',
                                  fontFamily: 'Courier New, monospace',
                                  fontWeight: 'bold',
                                  cursor: canSell ? 'pointer' : 'not-allowed',
                                  textTransform: 'uppercase',
                                  transition: 'all 0.2s',
                                }}
                                onMouseEnter={(e) => {
                                  if (canSell) e.target.style.background = '#FF1744';
                                }}
                                onMouseLeave={(e) => {
                                  if (canSell) e.target.style.background = '#FF0000';
                                }}
                              >
                                <TrendingDown size={14} style={{ display: 'inline', marginRight: '4px' }} />
                                SELL
                              </button>
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Buy Modal */}
      {buyModal.isOpen && (
        <Modal
          title={`Buy ${buyModal.stock?.name}`}
          onClose={() => setBuyModal({ isOpen: false, stock: null })}
        >
          <div style={{ marginBottom: '16px' }}>
            <div style={{ 
              padding: '12px',
              background: '#1A1F3A',
              border: '1px solid #2E3A59',
              marginBottom: '16px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: '#B0B0B0', fontSize: '11px' }}>Price per share:</span>
                <span style={{ color: '#FFD700', fontSize: '11px', fontWeight: 'bold' }}>
                  ${buyModal.stock?.pricePerShare?.toFixed(2)}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: '#B0B0B0', fontSize: '11px' }}>Available shares:</span>
                <span style={{ color: '#00FF00', fontSize: '11px', fontWeight: 'bold' }}>
                  {buyModal.stock?.shares}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#B0B0B0', fontSize: '11px' }}>Your balance:</span>
                <span style={{ color: '#FFD700', fontSize: '11px', fontWeight: 'bold' }}>
                  ${user?.balance?.toFixed(2)}
                </span>
              </div>
            </div>

            <label style={{ 
              display: 'block',
              marginBottom: '8px',
              color: '#FFD700',
              fontSize: '11px',
              fontWeight: 'bold',
              fontFamily: 'Courier New, monospace',
              textTransform: 'uppercase'
            }}>
              Number of Shares
            </label>
            <input
              type="number"
              placeholder="Enter shares to buy"
              value={shares}
              onChange={(e) => setShares(e.target.value)}
              min="1"
              max={buyModal.stock?.shares}
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
              <div style={{ 
                marginTop: '12px',
                padding: '12px',
                background: '#1A1F3A',
                border: '1px solid #FF6B00'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#B0B0B0', fontSize: '12px' }}>Total Cost:</span>
                  <span style={{ color: '#FF6B00', fontSize: '14px', fontWeight: 'bold' }}>
                    ${(buyModal.stock?.pricePerShare * parseInt(shares || 0)).toFixed(2)}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={handleBuy}
              style={{
                flex: 1,
                padding: '12px',
                background: '#00FF00',
                border: 'none',
                color: '#000',
                fontFamily: 'Courier New, monospace',
                fontWeight: 'bold',
                cursor: 'pointer',
                fontSize: '12px',
                textTransform: 'uppercase',
              }}
            >
              ✓ Confirm Buy
            </button>
            <button
              onClick={() => setBuyModal({ isOpen: false, stock: null })}
              style={{
                flex: 1,
                padding: '12px',
                background: 'transparent',
                border: '1px solid #FF6B00',
                color: '#FF6B00',
                fontFamily: 'Courier New, monospace',
                fontWeight: 'bold',
                cursor: 'pointer',
                fontSize: '12px',
                textTransform: 'uppercase',
              }}
            >
              ✕ Cancel
            </button>
          </div>
        </Modal>
      )}

      {/* Sell Modal */}
      {sellModal.isOpen && (
        <Modal
          title={`Sell ${sellModal.stock?.name}`}
          onClose={() => setSellModal({ isOpen: false, stock: null, maxShares: 0 })}
        >
          <div style={{ marginBottom: '16px' }}>
            <div style={{ 
              padding: '12px',
              background: '#1A1F3A',
              border: '1px solid #2E3A59',
              marginBottom: '16px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: '#B0B0B0', fontSize: '11px' }}>Price per share:</span>
                <span style={{ color: '#FFD700', fontSize: '11px', fontWeight: 'bold' }}>
                  ${sellModal.stock?.pricePerShare?.toFixed(2)}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#B0B0B0', fontSize: '11px' }}>You own:</span>
                <span style={{ color: '#00FF00', fontSize: '11px', fontWeight: 'bold' }}>
                  {sellModal.maxShares} shares
                </span>
              </div>
            </div>

            <label style={{ 
              display: 'block',
              marginBottom: '8px',
              color: '#FFD700',
              fontSize: '11px',
              fontWeight: 'bold',
              fontFamily: 'Courier New, monospace',
              textTransform: 'uppercase'
            }}>
              Number of Shares
            </label>
            <input
              type="number"
              placeholder="Enter shares to sell"
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
              <div style={{ 
                marginTop: '12px',
                padding: '12px',
                background: '#1A1F3A',
                border: '1px solid #00FF00'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#B0B0B0', fontSize: '12px' }}>You will receive:</span>
                  <span style={{ color: '#00FF00', fontSize: '14px', fontWeight: 'bold' }}>
                    ${(sellModal.stock?.pricePerShare * parseInt(shares || 0)).toFixed(2)}
                  </span>
                </div>
              </div>
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
                fontSize: '12px',
                textTransform: 'uppercase',
              }}
            >
              ✓ Confirm Sell
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
                fontSize: '12px',
                textTransform: 'uppercase',
              }}
            >
              ✕ Cancel
            </button>
          </div>
        </Modal>
      )}
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
    background: 'rgba(0, 0, 0, 0.9)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  }}>
    <div className="panel" style={{ maxWidth: '500px', width: '90%', maxHeight: '90vh', overflow: 'auto' }}>
      <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {title}
        <button
          onClick={onClose}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#FF6B00',
            fontSize: '24px',
            cursor: 'pointer',
            lineHeight: 1,
            padding: '0 8px',
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

export default Marketplace;
