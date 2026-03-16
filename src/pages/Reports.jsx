import React, { useState, useEffect } from 'react';
import InvoiceTable from '../components/InvoiceTable.jsx';
import salesService from '../services/salesService.js';
import productService from '../services/productService.js';
import pdfService from '../services/pdfService.js';

const Reports = () => {
  const [activeTab, setActiveTab] = useState('sales');
  const [dateRange, setDateRange] = useState({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [selectedMonth, setSelectedMonth] = useState({
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1
  });
  const [salesData, setSalesData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [stockData, setStockData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    fetchReportsData();
  }, [activeTab, dateRange, selectedMonth]);

  const fetchReportsData = async () => {
    setLoading(true);
    try {
      switch (activeTab) {
        case 'sales':
          await fetchSalesReport();
          break;
        case 'monthly':
          await fetchMonthlyReport();
          break;
        case 'stock':
          await fetchStockReport();
          break;
        case 'top':
          await fetchTopProductsReport();
          break;
      }
    } catch (error) {
      console.error('Error fetching reports data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSalesReport = async () => {
    const [sales, summaryData] = await Promise.all([
      salesService.getSales(dateRange.startDate, dateRange.endDate),
      salesService.getSalesSummary(dateRange.startDate, dateRange.endDate)
    ]);
    setSalesData(sales);
    setSummary(summaryData);
  };

  const fetchMonthlyReport = async () => {
    const [sales, summaryData] = await Promise.all([
      salesService.getMonthlySalesReport(selectedMonth.year, selectedMonth.month),
      salesService.getSalesSummary(
        `${selectedMonth.year}-${selectedMonth.month.toString().padStart(2, '0')}-01`,
        `${selectedMonth.year}-${selectedMonth.month.toString().padStart(2, '0')}-31`
      )
    ]);
    setMonthlyData(sales);
    setSummary(summaryData);
  };

  const fetchStockReport = async () => {
    const products = await productService.getAllProducts();
    const lowStock = products.filter(p => p.stock < 20);
    const outOfStock = products.filter(p => p.stock === 0);
    const totalStock = products.reduce((sum, p) => sum + p.stock, 0);
    const totalValue = products.reduce((sum, p) => sum + (p.stock * p.sell_price), 0);
    
    setStockData({
      totalProducts: products.length,
      lowStock: lowStock.length,
      outOfStock: outOfStock.length,
      totalStock,
      totalValue,
      products: products.sort((a, b) => b.stock - a.stock)
    });
  };

  const fetchTopProductsReport = async () => {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 1);
    const endDate = new Date();
    
    const products = await salesService.getTopSellingProducts(
      startDate.toISOString().split('T')[0],
      endDate.toISOString().split('T')[0],
      20
    );
    setTopProducts(products);
  };

  const handleDateRangeChange = (field, value) => {
    setDateRange(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleMonthChange = (field, value) => {
    setSelectedMonth(prev => ({
      ...prev,
      [field]: field === 'year' ? parseInt(value) : parseInt(value)
    }));
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

  const handleDownloadPDF = async (data, filename, reportTitle) => {
    try {
      await pdfService.generateSalesReportPDF(data, reportTitle, filename);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  const exportToCSV = (data, filename) => {
    if (data.length === 0) return;

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          return typeof value === 'string' && value.includes(',') 
            ? `"${value}"` 
            : value;
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const renderSalesReport = () => (
    <div className="report-content">
      <div className="report-controls">
        <div className="date-range">
          <label>From:</label>
          <input
            type="date"
            value={dateRange.startDate}
            onChange={(e) => handleDateRangeChange('startDate', e.target.value)}
          />
          <label>To:</label>
          <input
            type="date"
            value={dateRange.endDate}
            onChange={(e) => handleDateRangeChange('endDate', e.target.value)}
          />
        </div>
        <div className="export-buttons">
          <button
            onClick={() => handleDownloadPDF(salesData, 'Daily Sales Report', `Daily Sales Report - ${dateRange.startDate} to ${dateRange.endDate}`)}
            className="btn btn-pdf"
            disabled={salesData.length === 0}
          >
            📄 Download PDF
          </button>
          <button
            onClick={() => exportToCSV(salesData, 'sales_report.csv')}
            className="btn btn-secondary"
            disabled={salesData.length === 0}
          >
            Export CSV
          </button>
        </div>
      </div>

      {summary && (
        <div className="report-summary">
          <div className="summary-card">
            <h3>Total Sales</h3>
            <div className="summary-value">{summary.totalSales}</div>
          </div>
          <div className="summary-card">
            <h3>Total Revenue</h3>
            <div className="summary-value">{formatPrice(summary.totalRevenue)}</div>
          </div>
          <div className="summary-card">
            <h3>Average Sale</h3>
            <div className="summary-value">{formatPrice(summary.averageSaleAmount)}</div>
          </div>
          <div className="summary-card">
            <h3>Total Discount</h3>
            <div className="summary-value">{formatPrice(summary.totalDiscount)}</div>
          </div>
        </div>
      )}

      <InvoiceTable dateRange={dateRange} />
    </div>
  );

  const renderMonthlyReport = () => (
    <div className="report-content">
      <div className="report-controls">
          <div className="month-selector">
            <label>Year:</label>
            <select
              value={selectedMonth.year}
              onChange={(e) => handleMonthChange('year', e.target.value)}
            >
              {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
            <label>Month:</label>
            <select
              value={selectedMonth.month}
              onChange={(e) => handleMonthChange('month', e.target.value)}
            >
              {[
                'January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December'
              ].map((month, index) => (
                <option key={index + 1} value={index + 1}>{month}</option>
              ))}
            </select>
          </div>
          <div className="export-buttons">
            <button
              onClick={() => handleDownloadPDF(monthlyData, 'Monthly Sales Report', `Monthly Sales Report - ${selectedMonth.month}/${selectedMonth.year}`)}
              className="btn btn-pdf"
              disabled={monthlyData.length === 0}
            >
              📄 Download PDF
            </button>
            <button
              onClick={() => exportToCSV(monthlyData, 'monthly_sales_report.csv')}
              className="btn btn-secondary"
              disabled={monthlyData.length === 0}
            >
              Export CSV
            </button>
          </div>
        </div>

      {summary && (
        <div className="report-summary">
          <div className="summary-card">
            <h3>Monthly Sales</h3>
            <div className="summary-value">{summary.totalSales}</div>
          </div>
          <div className="summary-card">
            <h3>Monthly Revenue</h3>
            <div className="summary-value">{formatPrice(summary.totalRevenue)}</div>
          </div>
          <div className="summary-card">
            <h3>Daily Average</h3>
            <div className="summary-value">{formatPrice(summary.averageSaleAmount)}</div>
          </div>
        </div>
      )}

      <InvoiceTable dateRange={{
        startDate: `${selectedMonth.year}-${selectedMonth.month.toString().padStart(2, '0')}-01`,
        endDate: `${selectedMonth.year}-${selectedMonth.month.toString().padStart(2, '0')}-31`
      }} />
    </div>
  );

  const renderStockReport = () => (
    <div className="report-content">
      <div className="report-controls">
        <button
          onClick={() => exportToCSV(stockData.products || [], 'stock_report.csv')}
          className="btn btn-secondary"
          disabled={!stockData.products || stockData.products.length === 0}
        >
          Export CSV
        </button>
      </div>

      {stockData.totalProducts !== undefined && (
        <div className="report-summary">
          <div className="summary-card">
            <h3>Total Products</h3>
            <div className="summary-value">{stockData.totalProducts}</div>
          </div>
          <div className="summary-card">
            <h3>Total Stock Value</h3>
            <div className="summary-value">{formatPrice(stockData.totalValue)}</div>
          </div>
          <div className="summary-card">
            <h3>Low Stock Items</h3>
            <div className="summary-value">{stockData.lowStock}</div>
          </div>
          <div className="summary-card">
            <h3>Out of Stock</h3>
            <div className="summary-value">{stockData.outOfStock}</div>
          </div>
        </div>
      )}

      {stockData.products && (
        <div className="stock-table-container">
          <table className="stock-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Company</th>
                <th>Stock</th>
                <th>Buy Price</th>
                <th>Sell Price</th>
                <th>Total Value</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {stockData.products.map((product) => {
                const totalValue = product.stock * product.sell_price;
                const status = product.stock === 0 ? 'Out of Stock' : 
                              product.stock < 20 ? 'Low Stock' : 'In Stock';
                const statusColor = product.stock === 0 ? 'red' : 
                                   product.stock < 20 ? 'orange' : 'green';
                
                return (
                  <tr key={product.id}>
                    <td>{product.name}</td>
                    <td>{product.company || '-'}</td>
                    <td className={`stock ${statusColor}`}>{product.stock}</td>
                    <td>{formatPrice(product.buy_price)}</td>
                    <td>{formatPrice(product.sell_price)}</td>
                    <td>{formatPrice(totalValue)}</td>
                    <td className={`status ${statusColor}`}>{status}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const renderTopProductsReport = () => (
    <div className="report-content">
      <div className="report-controls">
        <button
          onClick={() => exportToCSV(topProducts, 'top_products_report.csv')}
          className="btn btn-secondary"
          disabled={topProducts.length === 0}
        >
          Export CSV
        </button>
      </div>

      <div className="top-products-grid">
        {topProducts.map((product, index) => (
          <div key={index} className="product-card">
            <div className="product-rank">#{index + 1}</div>
            <div className="product-info">
              <h4>{product.name}</h4>
              <p>{product.generic_name}</p>
            </div>
            <div className="product-stats">
              <div className="stat">
                <span className="stat-label">Quantity Sold</span>
                <span className="stat-value">{product.totalQuantity}</span>
              </div>
              <div className="stat">
                <span className="stat-label">Revenue</span>
                <span className="stat-value">{formatPrice(product.totalRevenue)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="reports-page loading">
        <div className="loading-spinner">Loading reports...</div>
      </div>
    );
  }

  return (
    <div className="reports-page">
      <div className="reports-header">
        <h1>Reports & Analytics</h1>
      </div>

      <div className="reports-tabs">
        <button
          className={`tab ${activeTab === 'sales' ? 'active' : ''}`}
          onClick={() => setActiveTab('sales')}
        >
          Daily Sales
        </button>
        <button
          className={`tab ${activeTab === 'monthly' ? 'active' : ''}`}
          onClick={() => setActiveTab('monthly')}
        >
          Monthly Sales
        </button>
        <button
          className={`tab ${activeTab === 'stock' ? 'active' : ''}`}
          onClick={() => setActiveTab('stock')}
        >
          Stock Report
        </button>
        <button
          className={`tab ${activeTab === 'top' ? 'active' : ''}`}
          onClick={() => setActiveTab('top')}
        >
          Top Products
        </button>
      </div>

      <div className="reports-content">
        {activeTab === 'sales' && renderSalesReport()}
        {activeTab === 'monthly' && renderMonthlyReport()}
        {activeTab === 'stock' && renderStockReport()}
        {activeTab === 'top' && renderTopProductsReport()}
      </div>

      <style jsx>{`
        .reports-page {
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

        .reports-header {
          margin-bottom: 24px;
        }

        .reports-header h1 {
          margin: 0;
          color: #333;
          font-size: 28px;
        }

        .reports-tabs {
          display: flex;
          gap: 4px;
          margin-bottom: 24px;
          background: white;
          padding: 4px;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .tab {
          padding: 12px 24px;
          border: none;
          background: transparent;
          color: #666;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          border-radius: 6px;
          transition: all 0.3s;
        }

        .tab:hover {
          background: #f8f9fa;
        }

        .tab.active {
          background: #007bff;
          color: white;
        }

        .reports-content {
          background: white;
          border-radius: 8px;
          padding: 24px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .report-controls {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          flex-wrap: wrap;
          gap: 16px;
        }

        .date-range,
        .month-selector {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .export-buttons {
          display: flex;
          gap: 8px;
        }

        .date-range label,
        .month-selector label {
          font-size: 14px;
          color: #666;
          font-weight: 500;
        }

        .date-range input,
        .month-selector select {
          padding: 8px 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
          outline: none;
        }

        .date-range input:focus,
        .month-selector select:focus {
          border-color: #007bff;
        }

        .btn {
          padding: 8px 16px;
          border: none;
          border-radius: 4px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.3s;
        }

        .btn-pdf {
          background: #28a745;
          color: white;
        }

        .btn-pdf:hover:not(:disabled) {
          background: #218838;
        }

        .btn-secondary {
          background: #6c757d;
          color: white;
        }

        .btn-secondary:hover:not(:disabled) {
          background: #545b62;
        }

        .btn:disabled {
          background: #ccc;
          cursor: not-allowed;
        }

        .report-summary {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }

        .summary-card {
          background: #f8f9fa;
          padding: 16px;
          border-radius: 8px;
          text-align: center;
        }

        .summary-card h3 {
          margin: 0 0 8px 0;
          font-size: 14px;
          color: #666;
          font-weight: 500;
        }

        .summary-value {
          font-size: 20px;
          font-weight: 700;
          color: #007bff;
        }

        .stock-table-container {
          overflow-x: auto;
        }

        .stock-table {
          width: 100%;
          border-collapse: collapse;
        }

        .stock-table th {
          background: #f8f9fa;
          padding: 12px;
          text-align: left;
          font-weight: 600;
          color: #333;
          font-size: 14px;
          border-bottom: 2px solid #dee2e6;
        }

        .stock-table td {
          padding: 12px;
          font-size: 14px;
          border-bottom: 1px solid #eee;
        }

        .stock.green {
          color: #28a745;
          font-weight: 600;
        }

        .stock.orange {
          color: #ffc107;
          font-weight: 600;
        }

        .stock.red {
          color: #dc3545;
          font-weight: 600;
        }

        .status.green {
          background: #d4edda;
          color: #155724;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
        }

        .status.orange {
          background: #fff3cd;
          color: #856404;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
        }

        .status.red {
          background: #f8d7da;
          color: #721c24;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
        }

        .top-products-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 16px;
        }

        .product-card {
          background: #f8f9fa;
          border-radius: 8px;
          padding: 16px;
          position: relative;
        }

        .product-rank {
          position: absolute;
          top: 12px;
          right: 12px;
          background: #007bff;
          color: white;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 600;
        }

        .product-info h4 {
          margin: 0 0 4px 0;
          font-size: 16px;
          color: #333;
        }

        .product-info p {
          margin: 0 0 12px 0;
          font-size: 14px;
          color: #666;
        }

        .product-stats {
          display: flex;
          justify-content: space-between;
        }

        .stat {
          text-align: center;
        }

        .stat-label {
          display: block;
          font-size: 12px;
          color: #666;
          margin-bottom: 4px;
        }

        .stat-value {
          display: block;
          font-size: 14px;
          font-weight: 600;
          color: #007bff;
        }

        @media (max-width: 768px) {
          .reports-page {
            padding: 16px;
          }

          .reports-tabs {
            flex-wrap: wrap;
          }

          .tab {
            flex: 1;
            min-width: 100px;
          }

          .report-controls {
            flex-direction: column;
            align-items: stretch;
          }

          .date-range,
          .month-selector {
            flex-wrap: wrap;
          }

          .report-summary {
            grid-template-columns: repeat(2, 1fr);
          }

          .top-products-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default Reports;
