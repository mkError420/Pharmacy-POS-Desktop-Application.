import React, { useState, useEffect } from 'react';
import salesService from '../services/salesService.js';
import productService from '../services/productService.js';

const Dashboard = () => {
  const [todaySales, setTodaySales] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [expiryAlerts, setExpiryAlerts] = useState([]);
  const [salesSummary, setSalesSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [todayData, lowStock, expiring, summary] = await Promise.all([
        salesService.getTodaySales(),
        productService.getLowStockProducts(20),
        productService.getExpiringProducts(90),
        salesService.getSalesSummary(
          new Date().toISOString().split('T')[0],
          new Date().toISOString().split('T')[0]
        )
      ]);

      setTodaySales(todayData);
      setLowStockProducts(lowStock);
      setExpiryAlerts(expiring);
      setSalesSummary(summary);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 2
    }).format(price).replace('BDT', '৳');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
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
    if (days < 0) return { color: 'red', text: 'Expired' };
    if (days <= 30) return { color: 'red', text: `${days} days` };
    if (days <= 60) return { color: 'orange', text: `${days} days` };
    return { color: 'yellow', text: `${days} days` };
  };

  if (loading) {
    return (
      <div className="dashboard loading">
        <div className="loading-spinner">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Pharmacy POS Dashboard</h1>
        <div className="current-date">
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </div>
      </div>

      {/* Sales Summary Cards */}
      <div className="summary-cards">
        <div className="summary-card">
          <div className="card-icon sales">
            💰
          </div>
          <div className="card-content">
            <h3>Today's Sales</h3>
            <div className="card-value">{todaySales.length}</div>
            <div className="card-subtitle">
              {formatPrice(salesSummary?.totalRevenue || 0)}
            </div>
          </div>
        </div>

        <div className="summary-card">
          <div className="card-icon revenue">
            📈
          </div>
          <div className="card-content">
            <h3>Total Revenue</h3>
            <div className="card-value">
              {formatPrice(salesSummary?.totalRevenue || 0)}
            </div>
            <div className="card-subtitle">
              Avg: {formatPrice(salesSummary?.averageSaleAmount || 0)}
            </div>
          </div>
        </div>

        <div className="summary-card">
          <div className="card-icon stock">
            📦
          </div>
          <div className="card-content">
            <h3>Low Stock Alert</h3>
            <div className="card-value">{lowStockProducts.length}</div>
            <div className="card-subtitle">
              Below 20 units
            </div>
          </div>
        </div>

        <div className="summary-card">
          <div className="card-icon expiry">
            ⏰
          </div>
          <div className="card-content">
            <h3>Expiry Alert</h3>
            <div className="card-value">{expiryAlerts.length}</div>
            <div className="card-subtitle">
              Within 90 days
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        {/* Recent Sales */}
        <div className="dashboard-section">
          <h2>Today's Sales</h2>
          {todaySales.length === 0 ? (
            <div className="empty-state">
              <p>No sales today</p>
            </div>
          ) : (
            <div className="recent-sales">
              {todaySales.slice(0, 5).map((sale) => (
                <div key={sale.id} className="sale-item">
                  <div className="sale-info">
                    <div className="sale-number">Invoice #{sale.id}</div>
                    <div className="sale-time">
                      {new Date(sale.created_at).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                  <div className="sale-amount">
                    {formatPrice(sale.net_amount)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Low Stock Products */}
        <div className="dashboard-section">
          <h2>Low Stock Products</h2>
          {lowStockProducts.length === 0 ? (
            <div className="empty-state">
              <p>All products have sufficient stock</p>
            </div>
          ) : (
            <div className="alert-list">
              {lowStockProducts.slice(0, 5).map((product) => (
                <div key={product.id} className="alert-item">
                  <div className="alert-info">
                    <div className="alert-title">{product.name}</div>
                    <div className="alert-subtitle">{product.company}</div>
                  </div>
                  <div className="alert-value stock">
                    {product.stock} units
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Expiry Alerts */}
        <div className="dashboard-section">
          <h2>Expiry Alerts</h2>
          {expiryAlerts.length === 0 ? (
            <div className="empty-state">
              <p>No products expiring soon</p>
            </div>
          ) : (
            <div className="alert-list">
              {expiryAlerts.slice(0, 5).map((product) => {
                const daysUntilExpiry = getDaysUntilExpiry(product.expiry_date);
                const expiryStatus = getExpiryStatus(daysUntilExpiry);
                
                return (
                  <div key={product.id} className="alert-item">
                    <div className="alert-info">
                      <div className="alert-title">{product.name}</div>
                      <div className="alert-subtitle">
                        Expires: {formatDate(product.expiry_date)}
                      </div>
                    </div>
                    <div className={`alert-value expiry ${expiryStatus.color}`}>
                      {expiryStatus.text}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .dashboard {
          padding: 24px;
          background: #f5f5f5;
          min-height: 100vh;
        }

        .loading {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 400px;
        }

        .loading-spinner {
          font-size: 18px;
          color: #666;
        }

        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 32px;
        }

        .dashboard-header h1 {
          margin: 0;
          color: #333;
          font-size: 28px;
        }

        .current-date {
          color: #666;
          font-size: 16px;
        }

        .summary-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
          margin-bottom: 32px;
        }

        .summary-card {
          background: white;
          border-radius: 8px;
          padding: 20px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .card-icon {
          width: 48px;
          height: 48px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
        }

        .card-icon.sales {
          background: #e3f2fd;
        }

        .card-icon.revenue {
          background: #e8f5e8;
        }

        .card-icon.stock {
          background: #fff3e0;
        }

        .card-icon.expiry {
          background: #ffebee;
        }

        .card-content h3 {
          margin: 0 0 8px 0;
          font-size: 14px;
          color: #666;
          font-weight: 500;
        }

        .card-value {
          font-size: 24px;
          font-weight: 700;
          color: #333;
          margin-bottom: 4px;
        }

        .card-subtitle {
          font-size: 12px;
          color: #888;
        }

        .dashboard-content {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 24px;
        }

        .dashboard-section {
          background: white;
          border-radius: 8px;
          padding: 20px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .dashboard-section h2 {
          margin: 0 0 16px 0;
          font-size: 18px;
          color: #333;
          border-bottom: 2px solid #f0f0f0;
          padding-bottom: 8px;
        }

        .empty-state {
          text-align: center;
          padding: 40px 20px;
          color: #666;
        }

        .recent-sales {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .sale-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px;
          background: #f8f9fa;
          border-radius: 6px;
        }

        .sale-info .sale-number {
          font-weight: 600;
          color: #007bff;
          font-size: 14px;
        }

        .sale-info .sale-time {
          font-size: 12px;
          color: #666;
          margin-top: 2px;
        }

        .sale-amount {
          font-weight: 600;
          color: #28a745;
          font-size: 16px;
        }

        .alert-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .alert-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px;
          background: #f8f9fa;
          border-radius: 6px;
        }

        .alert-info .alert-title {
          font-weight: 600;
          color: #333;
          font-size: 14px;
        }

        .alert-info .alert-subtitle {
          font-size: 12px;
          color: #666;
          margin-top: 2px;
        }

        .alert-value {
          font-weight: 600;
          font-size: 14px;
          padding: 4px 8px;
          border-radius: 4px;
        }

        .alert-value.stock {
          background: #fff3cd;
          color: #856404;
        }

        .alert-value.expiry {
          background: #f8d7da;
          color: #721c24;
        }

        .alert-value.expiry.orange {
          background: #ffe0b2;
          color: #e65100;
        }

        .alert-value.expiry.yellow {
          background: #fff9c4;
          color: #f57c00;
        }

        @media (max-width: 768px) {
          .dashboard {
            padding: 16px;
          }

          .dashboard-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
          }

          .summary-cards {
            grid-template-columns: 1fr;
          }

          .dashboard-content {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
