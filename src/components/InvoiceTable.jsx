import React, { useState, useEffect } from 'react';
import salesService from '../services/salesService.js';
import pdfService from '../services/pdfService.js';

const InvoiceTable = ({ dateRange, onSaleSelect }) => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedSales, setExpandedSales] = useState(new Set());

  useEffect(() => {
    fetchSales();
  }, [dateRange]);

  const fetchSales = async () => {
    setLoading(true);
    try {
      const salesData = await salesService.getSales(dateRange.startDate, dateRange.endDate);
      setSales(salesData);
    } catch (error) {
      console.error('Error fetching sales:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSaleDetails = async (saleId) => {
    const newExpanded = new Set(expandedSales);
    
    if (newExpanded.has(saleId)) {
      newExpanded.delete(saleId);
    } else {
      newExpanded.add(saleId);
    }
    
    setExpandedSales(newExpanded);
  };

  const handleDownloadPDF = async (sale) => {
    try {
      const saleDetails = await salesService.getSaleDetails(sale.id);
      await pdfService.generateInvoicePDF(sale, saleDetails);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  const handleDownloadAllPDF = async () => {
    try {
      const reportTitle = `Sales Report - ${dateRange.startDate} to ${dateRange.endDate}`;
      await pdfService.generateSalesReportPDF(sales, reportTitle, `Date Range: ${dateRange.startDate} to ${dateRange.endDate}`);
    } catch (error) {
      console.error('Error generating report PDF:', error);
      alert('Failed to generate PDF report. Please try again.');
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

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const SaleDetails = ({ saleId }) => {
    const [details, setDetails] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
      if (expandedSales.has(saleId)) {
        fetchSaleDetails();
      }
    }, [saleId, expandedSales.has(saleId)]);

    const fetchSaleDetails = async () => {
      setLoading(true);
      try {
        const saleDetails = await salesService.getSaleDetails(saleId);
        setDetails(saleDetails);
      } catch (error) {
        console.error('Error fetching sale details:', error);
      } finally {
        setLoading(false);
      }
    };

    if (!expandedSales.has(saleId)) {
      return null;
    }

    return (
      <div className="sale-details">
        {loading ? (
          <div className="details-loading">Loading details...</div>
        ) : (
          <table className="details-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Generic</th>
                <th>Qty</th>
                <th>Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {details.map((item, index) => (
                <tr key={index}>
                  <td>{item.name}</td>
                  <td>{item.generic_name || '-'}</td>
                  <td>{item.quantity}</td>
                  <td>{formatPrice(item.price)}</td>
                  <td>{formatPrice(item.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="invoice-table loading">
        <div className="loading-spinner">Loading sales data...</div>
      </div>
    );
  }

  if (sales.length === 0) {
    return (
      <div className="invoice-table empty">
        <p>No sales found for the selected period</p>
      </div>
    );
  }

  return (
    <div className="invoice-table">
      <table className="sales-table">
        <thead>
          <tr>
            <th>Invoice #</th>
            <th>Date</th>
            <th>Items</th>
            <th>Total</th>
            <th>Discount</th>
            <th>Net Amount</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {sales.map((sale) => (
            <React.Fragment key={sale.id}>
              <tr 
                className={`sale-row ${expandedSales.has(sale.id) ? 'expanded' : ''}`}
                onClick={() => onSaleSelect && onSaleSelect(sale)}
              >
                <td className="invoice-number">#{sale.id}</td>
                <td className="sale-date">
                  <div>{formatDate(sale.date)}</div>
                  <small>{formatDateTime(sale.created_at)}</small>
                </td>
                <td className="items-count">
                  <div className="items-badge">?</div>
                </td>
                <td className="total-amount">{formatPrice(sale.total_amount)}</td>
                <td className="discount-amount">
                  {sale.discount > 0 ? formatPrice(sale.discount) : '-'}
                </td>
                <td className="net-amount">{formatPrice(sale.net_amount)}</td>
                <td className="actions">
                  <button
                    onClick={() => handleDownloadPDF(sale)}
                    className="btn-pdf"
                    title="Download PDF"
                  >
                    📄 PDF
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSaleDetails(sale.id);
                    }}
                    className="btn-details"
                  >
                    {expandedSales.has(sale.id) ? 'Hide' : 'Details'}
                  </button>
                </td>
              </tr>
              {expandedSales.has(sale.id) && (
                <tr className="details-row">
                  <td colSpan="7">
                    <SaleDetails saleId={sale.id} />
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>

      <div className="table-summary">
        <button
          onClick={handleDownloadAllPDF}
          className="btn-download-all"
          disabled={sales.length === 0}
        >
          📄 Download All as PDF
        </button>
        <div className="summary-stats">
          <div className="stat">
            <span className="stat-label">Total Sales:</span>
            <span className="stat-value">{sales.length}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Total Revenue:</span>
            <span className="stat-value">
              {formatPrice(sales.reduce((sum, sale) => sum + sale.net_amount, 0))}
            </span>
          </div>
          <div className="stat">
            <span className="stat-label">Total Discount:</span>
            <span className="stat-value">
              {formatPrice(sales.reduce((sum, sale) => sum + sale.discount, 0))}
            </span>
          </div>
        </div>
      </div>

      <style jsx>{`
        .invoice-table {
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }

        .loading, .empty {
          padding: 40px;
          text-align: center;
          color: #666;
        }

        .loading-spinner {
          font-size: 16px;
        }

        .sales-table {
          width: 100%;
          border-collapse: collapse;
        }

        .sales-table th {
          background: #f8f9fa;
          padding: 12px 16px;
          text-align: left;
          font-weight: 600;
          color: #333;
          font-size: 14px;
          border-bottom: 2px solid #dee2e6;
        }

        .sale-row {
          cursor: pointer;
          transition: background-color 0.2s;
          border-bottom: 1px solid #eee;
        }

        .sale-row:hover {
          background-color: #f8f9fa;
        }

        .sale-row.expanded {
          background-color: #e7f3ff;
        }

        .sale-row td {
          padding: 12px 16px;
          font-size: 14px;
        }

        .invoice-number {
          font-weight: 600;
          color: #007bff;
        }

        .sale-date small {
          color: #666;
          font-size: 11px;
        }

        .items-badge {
          background: #007bff;
          color: white;
          padding: 2px 6px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 500;
          display: inline-block;
          min-width: 20px;
          text-align: center;
        }

        .total-amount {
          font-weight: 600;
          color: #333;
        }

        .discount-amount {
          color: #dc3545;
        }

        .net-amount {
          font-weight: 700;
          color: #28a745;
          font-size: 15px;
        }

        .btn-details {
          background: #007bff;
          color: white;
          border: none;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          cursor: pointer;
          transition: background-color 0.3s;
        }

        .btn-details:hover {
          background: #0056b3;
        }

        .btn-pdf {
          background: #28a745;
          color: white;
          border: none;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          cursor: pointer;
          transition: background-color 0.3s;
          margin-right: 4px;
        }

        .btn-pdf:hover {
          background: #218838;
        }

        .sale-details {
          padding: 16px;
        }

        .details-loading {
          text-align: center;
          color: #666;
          font-size: 14px;
          padding: 16px;
        }

        .details-table {
          width: 100%;
          background: white;
          border-radius: 4px;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .details-table th {
          background: #e9ecef;
          padding: 8px 12px;
          text-align: left;
          font-weight: 600;
          font-size: 12px;
          color: #495057;
        }

        .details-table td {
          padding: 8px 12px;
          font-size: 13px;
          border-bottom: 1px solid #dee2e6;
        }

        .details-table tr:last-child td {
          border-bottom: none;
        }

        .table-summary {
          padding: 16px;
          background: #f8f9fa;
          border-top: 1px solid #dee2e6;
        }

        .btn-download-all {
          background: #17a2b8;
          color: white;
          border: none;
          padding: 10px 16px;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.3s;
          margin-bottom: 16px;
          display: block;
          width: 100%;
        }

        .btn-download-all:hover:not(:disabled) {
          background: #138496;
        }

        .btn-download-all:disabled {
          background: #ccc;
          cursor: not-allowed;
        }

        .summary-stats {
          display: flex;
          justify-content: space-around;
          gap: 16px;
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
          font-size: 16px;
          font-weight: 600;
          color: #333;
        }

        @media (max-width: 768px) {
          .summary-stats {
            flex-direction: column;
            gap: 8px;
          }
          
          .sales-table {
            font-size: 12px;
          }
          
          .sales-table th,
          .sale-row td {
            padding: 8px;
          }
        }
      `}</style>
    </div>
  );
};

export default InvoiceTable;
