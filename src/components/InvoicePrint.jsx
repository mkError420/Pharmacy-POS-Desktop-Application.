import React from 'react';
import databaseService from '../services/database.js';

const InvoicePrint = ({ sale, saleDetails, onPrint, onClose }) => {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handlePrint = () => {
    const printContent = document.getElementById('invoice-print-content');
    const printWindow = window.open('', '', 'width=400,height=600');
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice #${sale.id}</title>
          <style>
            body {
              font-family: 'Courier New', monospace;
              margin: 0;
              padding: 20px;
              width: 300px;
              font-size: 12px;
            }
            .header {
              text-align: center;
              margin-bottom: 20px;
              border-bottom: 2px dashed #000;
              padding-bottom: 10px;
            }
            .shop-name {
              font-size: 18px;
              font-weight: bold;
              margin-bottom: 5px;
            }
            .shop-address {
              font-size: 10px;
              margin-bottom: 5px;
            }
            .invoice-info {
              margin-bottom: 15px;
            }
            .invoice-info div {
              margin-bottom: 3px;
            }
            .items-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 15px;
            }
            .items-table th,
            .items-table td {
              text-align: left;
              padding: 3px 0;
              border-bottom: 1px dotted #ccc;
            }
            .items-table th {
              border-bottom: 1px solid #000;
              font-weight: bold;
            }
            .totals {
              border-top: 1px dashed #000;
              padding-top: 10px;
              margin-bottom: 15px;
            }
            .totals div {
              display: flex;
              justify-content: space-between;
              margin-bottom: 3px;
            }
            .total-row {
              font-weight: bold;
              font-size: 14px;
              border-top: 1px solid #000;
              padding-top: 5px;
              margin-top: 5px;
            }
            .footer {
              text-align: center;
              margin-top: 20px;
              border-top: 2px dashed #000;
              padding-top: 10px;
              font-size: 10px;
            }
            .thank-you {
              font-weight: bold;
              margin-bottom: 5px;
            }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.print();
    printWindow.close();
    
    onPrint();
  };

  return (
    <div className="invoice-print-modal">
      <div className="invoice-print-container">
        <div className="invoice-print-header">
          <h3>Print Invoice</h3>
          <button onClick={onClose} className="btn-close">×</button>
        </div>

        <div id="invoice-print-content" className="invoice-print-content">
          {/* Invoice Header */}
          <div className="header">
            <div className="shop-name">PHARMACY POS</div>
            <div className="shop-address">123 Medicine Street, Pharma City</div>
            <div className="shop-address">Phone: +1 234 567 8900</div>
          </div>

          {/* Invoice Info */}
          <div className="invoice-info">
            <div><strong>Invoice #:</strong> {sale.id}</div>
            <div><strong>Date:</strong> {formatDate(sale.date)}</div>
            <div><strong>Time:</strong> {formatTime(sale.created_at)}</div>
          </div>

          {/* Items Table */}
          <table className="items-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Qty</th>
                <th>Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {saleDetails.map((item, index) => (
                <tr key={index}>
                  <td>
                    <div>{item.name}</div>
                    {item.generic_name && (
                      <div style={{ fontSize: '10px', color: '#666' }}>
                        {item.generic_name}
                      </div>
                    )}
                  </td>
                  <td>{item.quantity}</td>
                  <td>{formatPrice(item.price)}</td>
                  <td>{formatPrice(item.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div className="totals">
            <div>
              <span>Subtotal:</span>
              <span>{formatPrice(sale.total_amount)}</span>
            </div>
            {sale.discount > 0 && (
              <div>
                <span>Discount:</span>
                <span>-{formatPrice(sale.discount)}</span>
              </div>
            )}
            <div className="total-row">
              <span>TOTAL:</span>
              <span>{formatPrice(sale.net_amount)}</span>
            </div>
          </div>

          {/* Payment Info */}
          <div className="payment-info">
            <div><strong>Payment Method:</strong> Cash</div>
            <div><strong>Status:</strong> Paid</div>
          </div>

          {/* Footer */}
          <div className="footer">
            <div className="thank-you">Thank you for your purchase!</div>
            <div>Please come again</div>
            <div style={{ marginTop: '10px' }}>
              *** This is a computer generated invoice ***
            </div>
          </div>
        </div>

        <div className="invoice-print-actions">
          <button onClick={handlePrint} className="btn btn-primary">
            Print Invoice
          </button>
          <button onClick={onClose} className="btn btn-secondary">
            Cancel
          </button>
        </div>
      </div>

      <style jsx>{`
        .invoice-print-modal {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .invoice-print-container {
          background: white;
          border-radius: 8px;
          width: 90%;
          max-width: 500px;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        }

        .invoice-print-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 20px;
          border-bottom: 1px solid #eee;
          background: #f8f9fa;
          border-radius: 8px 8px 0 0;
        }

        .invoice-print-header h3 {
          margin: 0;
          color: #333;
          font-size: 18px;
        }

        .btn-close {
          background: none;
          border: none;
          font-size: 24px;
          color: #666;
          cursor: pointer;
          padding: 0;
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
          transition: background-color 0.2s;
        }

        .btn-close:hover {
          background: #e9ecef;
        }

        .invoice-print-content {
          padding: 20px;
          background: white;
          font-family: 'Courier New', monospace;
        }

        .header {
          text-align: center;
          margin-bottom: 20px;
          border-bottom: 2px dashed #000;
          padding-bottom: 10px;
        }

        .shop-name {
          font-size: 18px;
          font-weight: bold;
          margin-bottom: 5px;
        }

        .shop-address {
          font-size: 10px;
          margin-bottom: 5px;
        }

        .invoice-info {
          margin-bottom: 15px;
        }

        .invoice-info div {
          margin-bottom: 3px;
          font-size: 12px;
        }

        .items-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 15px;
          font-size: 11px;
        }

        .items-table th,
        .items-table td {
          text-align: left;
          padding: 3px 0;
          border-bottom: 1px dotted #ccc;
        }

        .items-table th {
          border-bottom: 1px solid #000;
          font-weight: bold;
          font-size: 10px;
        }

        .totals {
          border-top: 1px dashed #000;
          padding-top: 10px;
          margin-bottom: 15px;
        }

        .totals div {
          display: flex;
          justify-content: space-between;
          margin-bottom: 3px;
          font-size: 12px;
        }

        .total-row {
          font-weight: bold;
          font-size: 14px;
          border-top: 1px solid #000;
          padding-top: 5px;
          margin-top: 5px;
        }

        .payment-info {
          margin-bottom: 15px;
          font-size: 11px;
        }

        .payment-info div {
          margin-bottom: 3px;
        }

        .footer {
          text-align: center;
          margin-top: 20px;
          border-top: 2px dashed #000;
          padding-top: 10px;
          font-size: 10px;
        }

        .thank-you {
          font-weight: bold;
          margin-bottom: 5px;
        }

        .invoice-print-actions {
          display: flex;
          gap: 12px;
          padding: 16px 20px;
          border-top: 1px solid #eee;
          background: #f8f9fa;
          border-radius: 0 0 8px 8px;
          justify-content: flex-end;
        }

        .btn {
          padding: 10px 20px;
          border: none;
          border-radius: 4px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.3s;
        }

        .btn-primary {
          background: #007bff;
          color: white;
        }

        .btn-primary:hover {
          background: #0056b3;
        }

        .btn-secondary {
          background: #6c757d;
          color: white;
        }

        .btn-secondary:hover {
          background: #545b62;
        }

        @media print {
          .invoice-print-header,
          .invoice-print-actions {
            display: none;
          }

          .invoice-print-container {
            box-shadow: none;
            max-width: none;
            width: 100%;
            max-height: none;
          }

          .invoice-print-content {
            padding: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default InvoicePrint;
