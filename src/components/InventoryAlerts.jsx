import React, { useState, useEffect } from 'react';
import productService from '../services/productService.js';

const InventoryAlerts = () => {
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [expiryAlerts, setExpiryAlerts] = useState([]);
  const [outOfStockProducts, setOutOfStockProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('low-stock');

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const [lowStock, expiring] = await Promise.all([
        productService.getLowStockProducts(20),
        productService.getExpiringProducts(90)
      ]);

      setLowStockProducts(lowStock);
      setExpiryAlerts(expiring);
      setOutOfStockProducts(lowStock.filter(p => p.stock === 0));
    } catch (error) {
      console.error('Error fetching inventory alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDaysUntilExpiry = (expiryDate) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getExpiryStatus = (days) => {
    if (days < 0) return { color: 'red', text: 'Expired', priority: 'high' };
    if (days <= 15) return { color: 'red', text: `${days} days`, priority: 'high' };
    if (days <= 30) return { color: 'orange', text: `${days} days`, priority: 'medium' };
    if (days <= 90) return { color: 'yellow', text: `${days} days`, priority: 'low' };
    return null;
  };

  const getStockStatus = (stock) => {
    if (stock === 0) return { color: 'red', text: 'Out of Stock', priority: 'high' };
    if (stock <= 5) return { color: 'red', text: 'Critical', priority: 'high' };
    if (stock <= 10) return { color: 'orange', text: 'Low Stock', priority: 'medium' };
    if (stock <= 20) return { color: 'yellow', text: 'Low Stock', priority: 'low' };
    return null;
  };

  const getAlertIcon = (priority) => {
    switch (priority) {
      case 'high': return '🚨';
      case 'medium': return '⚠️';
      case 'low': return 'ℹ️';
      default: return '📋';
    }
  };

  const renderLowStockAlerts = () => (
    <div className="alerts-list">
      {lowStockProducts.length === 0 ? (
        <div className="empty-state">
          <p>✅ All products have sufficient stock</p>
        </div>
      ) : (
        lowStockProducts.map((product) => {
          const stockStatus = getStockStatus(product.stock);
          return (
            <div key={product.id} className="alert-item">
              <div className="alert-icon">
                {getAlertIcon(stockStatus.priority)}
              </div>
              <div className="alert-content">
                <div className="alert-header">
                  <h4>{product.name}</h4>
                  <span className={`alert-badge ${stockStatus.color}`}>
                    {stockStatus.text}
                  </span>
                </div>
                <div className="alert-details">
                  <div className="detail-row">
                    <span>Current Stock:</span>
                    <span className="stock-value">{product.stock} units</span>
                  </div>
                  <div className="detail-row">
                    <span>Company:</span>
                    <span>{product.company || 'N/A'}</span>
                  </div>
                  <div className="detail-row">
                    <span>Sell Price:</span>
                    <span>{formatPrice(product.sell_price)}</span>
                  </div>
                  <div className="detail-row">
                    <span>Stock Value:</span>
                    <span>{formatPrice(product.stock * product.sell_price)}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );

  const renderExpiryAlerts = () => (
    <div className="alerts-list">
      {expiryAlerts.length === 0 ? (
        <div className="empty-state">
          <p>✅ No products expiring in the next 90 days</p>
        </div>
      ) : (
        expiryAlerts.map((product) => {
          const daysUntilExpiry = getDaysUntilExpiry(product.expiry_date);
          const expiryStatus = getExpiryStatus(daysUntilExpiry);
          
          return (
            <div key={product.id} className="alert-item">
              <div className="alert-icon">
                {getAlertIcon(expiryStatus.priority)}
              </div>
              <div className="alert-content">
                <div className="alert-header">
                  <h4>{product.name}</h4>
                  <span className={`alert-badge ${expiryStatus.color}`}>
                    {expiryStatus.text}
                  </span>
                </div>
                <div className="alert-details">
                  <div className="detail-row">
                    <span>Expiry Date:</span>
                    <span>{formatDate(product.expiry_date)}</span>
                  </div>
                  <div className="detail-row">
                    <span>Generic Name:</span>
                    <span>{product.generic_name || 'N/A'}</span>
                  </div>
                  <div className="detail-row">
                    <span>Current Stock:</span>
                    <span>{product.stock} units</span>
                  </div>
                  <div className="detail-row">
                    <span>Stock Value:</span>
                    <span>{formatPrice(product.stock * product.sell_price)}</span>
                  </div>
                </div>
                {daysUntilExpiry < 0 && (
                  <div className="expiry-warning">
                    ⚠️ This product has expired and should be removed from inventory
                  </div>
                )}
              </div>
            </div>
          );
        })
      )}
    </div>
  );

  const renderOutOfStockAlerts = () => (
    <div className="alerts-list">
      {outOfStockProducts.length === 0 ? (
        <div className="empty-state">
          <p>✅ No products are out of stock</p>
        </div>
      ) : (
        outOfStockProducts.map((product) => (
          <div key={product.id} className="alert-item critical">
            <div className="alert-icon">
              🚨
            </div>
            <div className="alert-content">
              <div className="alert-header">
                <h4>{product.name}</h4>
                <span className="alert-badge red">
                  Out of Stock
                </span>
              </div>
              <div className="alert-details">
                <div className="detail-row">
                  <span>Company:</span>
                  <span>{product.company || 'N/A'}</span>
                </div>
                <div className="detail-row">
                  <span>Sell Price:</span>
                  <span>{formatPrice(product.sell_price)}</span>
                </div>
                <div className="detail-row">
                  <span>Last Stock:</span>
                  <span>Currently unavailable</span>
                </div>
              </div>
              <div className="action-suggestion">
                💡 Consider reordering this product immediately
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="inventory-alerts loading">
        <div className="loading-spinner">Loading inventory alerts...</div>
      </div>
    );
  }

  return (
    <div className="inventory-alerts">
      <div className="alerts-header">
        <h2>Inventory Alerts</h2>
        <button onClick={fetchAlerts} className="btn btn-refresh">
          🔄 Refresh
        </button>
      </div>

      <div className="alerts-summary">
        <div className="summary-card critical">
          <div className="summary-icon">🚨</div>
          <div className="summary-content">
            <div className="summary-number">{outOfStockProducts.length}</div>
            <div className="summary-label">Out of Stock</div>
          </div>
        </div>
        <div className="summary-card warning">
          <div className="summary-icon">⚠️</div>
          <div className="summary-content">
            <div className="summary-number">{lowStockProducts.filter(p => p.stock > 0 && p.stock <= 10).length}</div>
            <div className="summary-label">Critical Low Stock</div>
          </div>
        </div>
        <div className="summary-card info">
          <div className="summary-icon">⏰</div>
          <div className="summary-content">
            <div className="summary-number">{expiryAlerts.filter(p => getDaysUntilExpiry(p.expiry_date) <= 30).length}</div>
            <div className="summary-label">Expiring Soon</div>
          </div>
        </div>
        <div className="summary-card expired">
          <div className="summary-icon">❌</div>
          <div className="summary-content">
            <div className="summary-number">{expiryAlerts.filter(p => getDaysUntilExpiry(p.expiry_date) < 0).length}</div>
            <div className="summary-label">Expired</div>
          </div>
        </div>
      </div>

      <div className="alerts-tabs">
        <button
          className={`tab ${activeTab === 'low-stock' ? 'active' : ''}`}
          onClick={() => setActiveTab('low-stock')}
        >
          Low Stock ({lowStockProducts.length})
        </button>
        <button
          className={`tab ${activeTab === 'expiry' ? 'active' : ''}`}
          onClick={() => setActiveTab('expiry')}
        >
          Expiry Alerts ({expiryAlerts.length})
        </button>
        <button
          className={`tab ${activeTab === 'out-of-stock' ? 'active' : ''}`}
          onClick={() => setActiveTab('out-of-stock')}
        >
          Out of Stock ({outOfStockProducts.length})
        </button>
      </div>

      <div className="alerts-content">
        {activeTab === 'low-stock' && renderLowStockAlerts()}
        {activeTab === 'expiry' && renderExpiryAlerts()}
        {activeTab === 'out-of-stock' && renderOutOfStockAlerts()}
      </div>

      <style jsx>{`
        .inventory-alerts {
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }

        .loading {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 400px;
        }

        .loading-spinner {
          font-size: 16px;
          color: #666;
        }

        .alerts-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          background: #f8f9fa;
          border-bottom: 1px solid #dee2e6;
        }

        .alerts-header h2 {
          margin: 0;
          color: #333;
          font-size: 20px;
        }

        .btn-refresh {
          background: #007bff;
          color: white;
          border: none;
          padding: 8px 12px;
          border-radius: 4px;
          font-size: 12px;
          cursor: pointer;
          transition: background-color 0.3s;
        }

        .btn-refresh:hover {
          background: #0056b3;
        }

        .alerts-summary {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 16px;
          padding: 20px;
          background: white;
          border-bottom: 1px solid #eee;
        }

        .summary-card {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          border-radius: 6px;
          background: #f8f9fa;
        }

        .summary-card.critical {
          background: #ffebee;
        }

        .summary-card.warning {
          background: #fff3e0;
        }

        .summary-card.info {
          background: #e3f2fd;
        }

        .summary-card.expired {
          background: #fce4ec;
        }

        .summary-icon {
          font-size: 24px;
        }

        .summary-content {
          text-align: left;
        }

        .summary-number {
          font-size: 20px;
          font-weight: 700;
          color: #333;
          line-height: 1;
        }

        .summary-label {
          font-size: 12px;
          color: #666;
          margin-top: 2px;
        }

        .alerts-tabs {
          display: flex;
          background: #f8f9fa;
          border-bottom: 1px solid #dee2e6;
        }

        .tab {
          flex: 1;
          padding: 12px 16px;
          border: none;
          background: transparent;
          color: #666;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s;
          border-bottom: 3px solid transparent;
        }

        .tab:hover {
          background: rgba(0, 0, 0, 0.05);
        }

        .tab.active {
          color: #007bff;
          border-bottom-color: #007bff;
          background: white;
        }

        .alerts-content {
          padding: 20px;
          max-height: 500px;
          overflow-y: auto;
        }

        .alerts-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .alert-item {
          display: flex;
          gap: 12px;
          padding: 16px;
          background: #f8f9fa;
          border-radius: 6px;
          border-left: 4px solid #ddd;
        }

        .alert-item.critical {
          border-left-color: #dc3545;
          background: #fff5f5;
        }

        .alert-icon {
          font-size: 20px;
          flex-shrink: 0;
          width: 24px;
          text-align: center;
        }

        .alert-content {
          flex: 1;
        }

        .alert-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .alert-header h4 {
          margin: 0;
          font-size: 16px;
          color: #333;
        }

        .alert-badge {
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
        }

        .alert-badge.red {
          background: #dc3545;
          color: white;
        }

        .alert-badge.orange {
          background: #fd7e14;
          color: white;
        }

        .alert-badge.yellow {
          background: #ffc107;
          color: #212529;
        }

        .alert-details {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 8px;
          margin-bottom: 8px;
        }

        .detail-row {
          display: flex;
          justify-content: space-between;
          font-size: 13px;
        }

        .detail-row span:first-child {
          color: #666;
        }

        .detail-row span:last-child {
          font-weight: 500;
          color: #333;
        }

        .stock-value {
          color: #dc3545 !important;
          font-weight: 600 !important;
        }

        .expiry-warning,
        .action-suggestion {
          background: #fff3cd;
          color: #856404;
          padding: 8px 12px;
          border-radius: 4px;
          font-size: 12px;
          margin-top: 8px;
        }

        .expiry-warning {
          background: #f8d7da;
          color: #721c24;
        }

        .empty-state {
          text-align: center;
          padding: 40px;
          color: #666;
        }

        .empty-state p {
          margin: 0;
          font-size: 16px;
        }

        @media (max-width: 768px) {
          .alerts-summary {
            grid-template-columns: repeat(2, 1fr);
          }

          .alerts-tabs {
            flex-wrap: wrap;
          }

          .tab {
            flex: 1;
            min-width: 120px;
          }

          .alert-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
          }

          .alert-details {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default InventoryAlerts;
