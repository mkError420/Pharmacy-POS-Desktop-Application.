// PDF generation service for invoices and reports
class PDFService {
  constructor() {
    // Using browser print functionality for better Electron compatibility
  }

  async generateInvoicePDF(sale, saleDetails) {
    try {
      const printContent = this.createInvoiceHTML(sale, saleDetails);
      this.openPrintPreview(printContent, `Invoice_${sale.id}`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw error;
    }
  }

  async generateSalesReportPDF(salesData, reportTitle, dateRange) {
    try {
      const printContent = this.createSalesReportHTML(salesData, reportTitle, dateRange);
      this.openPrintPreview(printContent, reportTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase());
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw error;
    }
  }

  createInvoiceHTML(sale, saleDetails) {
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

    const formatPrice = (price) => {
      return new Intl.NumberFormat('en-BD', {
        style: 'currency',
        currency: 'BDT',
        minimumFractionDigits: 2
      }).format(price).replace('BDT', '৳');
    };

    const itemsRows = saleDetails.map(item => `
      <tr>
        <td>${item.name}</td>
        <td>${item.generic_name || '-'}</td>
        <td>${item.quantity}</td>
        <td>${formatPrice(item.price)}</td>
        <td>${formatPrice(item.total)}</td>
      </tr>
    `).join('');

    return `
      <div class="invoice-container">
        <div class="invoice-header">
          <div class="shop-name">PHARMACY POS</div>
          <div class="shop-address">123 Medicine Street, Pharma City</div>
          <div class="shop-address">Phone: +1 234 567 8900</div>
          <div class="shop-address">Email: info@pharmacypos.com</div>
        </div>

        <div class="invoice-info">
          <div class="invoice-details">
            <h3>Invoice Details</h3>
            <p><strong>Invoice #:</strong> ${sale.id}</p>
            <p><strong>Date:</strong> ${formatDate(sale.date)}</p>
            <p><strong>Time:</strong> ${formatTime(sale.created_at)}</p>
          </div>
          <div class="payment-details">
            <h3>Payment Information</h3>
            <p><strong>Payment Method:</strong> Cash</p>
            <p><strong>Status:</strong> Paid</p>
          </div>
        </div>

        <table class="items-table">
          <thead>
            <tr>
              <th>Product Name</th>
              <th>Generic Name</th>
              <th>Quantity</th>
              <th>Unit Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsRows}
          </tbody>
        </table>

        <div class="totals-section">
          <div class="total-row">
            <span>Subtotal:</span>
            <span>${formatPrice(sale.total_amount)}</span>
          </div>
          ${sale.discount > 0 ? `
            <div class="total-row">
              <span>Discount:</span>
              <span>-${formatPrice(sale.discount)}</span>
            </div>
          ` : ''}
          <div class="total-row final">
            <span>Total Amount:</span>
            <span>${formatPrice(sale.net_amount)}</span>
          </div>
        </div>

        <div class="footer">
          <div class="thank-you">Thank you for your purchase!</div>
          <div>Please come again</div>
          <div class="generated">*** This is a computer generated invoice ***</div>
          <div class="generated">Generated on: ${new Date().toLocaleString()}</div>
        </div>
      </div>

      <style>
        .invoice-container {
          font-family: 'Arial', sans-serif;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          background: white;
        }
        .invoice-header {
          text-align: center;
          margin-bottom: 30px;
          border-bottom: 2px solid #333;
          padding-bottom: 20px;
        }
        .shop-name {
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 10px;
          color: #2c3e50;
        }
        .shop-address {
          font-size: 14px;
          color: #666;
          margin-bottom: 5px;
        }
        .invoice-info {
          display: flex;
          justify-content: space-between;
          margin-bottom: 20px;
          background: #f8f9fa;
          padding: 15px;
          border-radius: 5px;
        }
        .invoice-details h3, .payment-details h3 {
          margin: 0 0 10px 0;
          color: #2c3e50;
        }
        .invoice-details p, .payment-details p {
          margin: 5px 0;
          font-size: 14px;
        }
        .items-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
        }
        .items-table th, .items-table td {
          text-align: left;
          padding: 12px 8px;
          border: 1px solid #ddd;
        }
        .items-table th {
          background: #2c3e50;
          color: white;
          font-weight: bold;
        }
        .items-table tr:nth-child(even) {
          background: #f8f9fa;
        }
        .totals-section {
          margin-top: 20px;
          padding: 15px;
          background: #f8f9fa;
          border-radius: 5px;
        }
        .total-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 10px;
          font-size: 16px;
        }
        .total-row.final {
          font-weight: bold;
          font-size: 18px;
          border-top: 2px solid #333;
          padding-top: 10px;
          margin-top: 10px;
        }
        .footer {
          margin-top: 30px;
          text-align: center;
          padding-top: 20px;
          border-top: 1px solid #ddd;
        }
        .thank-you {
          font-size: 16px;
          font-weight: bold;
          margin-bottom: 10px;
          color: #2c3e50;
        }
        .generated {
          font-size: 12px;
          color: #666;
          margin-top: 5px;
        }
        @media print {
          body { margin: 0; }
          .invoice-container { margin: 0; padding: 10px; }
        }
      </style>
    `;
  }

  createSalesReportHTML(salesData, reportTitle, dateRange) {
    const formatPrice = (price) => {
      return new Intl.NumberFormat('en-BD', {
        style: 'currency',
        currency: 'BDT',
        minimumFractionDigits: 2
      }).format(price).replace('BDT', '৳');
    };

    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString('en-US');
    };

    const totalRevenue = salesData.reduce((sum, sale) => sum + sale.net_amount, 0);
    const totalDiscount = salesData.reduce((sum, sale) => sum + sale.discount, 0);
    const averageSale = salesData.length > 0 ? totalRevenue / salesData.length : 0;

    const salesRows = salesData.map(sale => `
      <tr>
        <td>#${sale.id}</td>
        <td>${formatDate(sale.date)}</td>
        <td>${new Date(sale.created_at).toLocaleTimeString()}</td>
        <td>${formatPrice(sale.total_amount)}</td>
        <td>${formatPrice(sale.discount)}</td>
        <td class="amount">${formatPrice(sale.net_amount)}</td>
      </tr>
    `).join('');

    return `
      <div class="report-container">
        <div class="report-header">
          <div class="report-title">${reportTitle}</div>
          <div class="date-range">${dateRange}</div>
        </div>

        <div class="summary-section">
          <div class="summary-item">
            <div class="summary-value">${salesData.length}</div>
            <div class="summary-label">Total Sales</div>
          </div>
          <div class="summary-item">
            <div class="summary-value">${formatPrice(totalRevenue)}</div>
            <div class="summary-label">Total Revenue</div>
          </div>
          <div class="summary-item">
            <div class="summary-value">${formatPrice(totalDiscount)}</div>
            <div class="summary-label">Total Discount</div>
          </div>
          <div class="summary-item">
            <div class="summary-value">${formatPrice(averageSale)}</div>
            <div class="summary-label">Average Sale</div>
          </div>
        </div>

        <table class="sales-table">
          <thead>
            <tr>
              <th>Invoice #</th>
              <th>Date</th>
              <th>Time</th>
              <th>Total Amount</th>
              <th>Discount</th>
              <th>Net Amount</th>
            </tr>
          </thead>
          <tbody>
            ${salesRows}
          </tbody>
        </table>

        <div class="footer">
          <div>Generated on: ${new Date().toLocaleString()}</div>
          <div>Pharmacy POS System</div>
        </div>
      </div>

      <style>
        .report-container {
          font-family: 'Arial', sans-serif;
          max-width: 1000px;
          margin: 0 auto;
          padding: 20px;
          background: white;
        }
        .report-header {
          text-align: center;
          margin-bottom: 30px;
          border-bottom: 2px solid #333;
          padding-bottom: 20px;
        }
        .report-title {
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 10px;
          color: #2c3e50;
        }
        .date-range {
          font-size: 14px;
          color: #666;
        }
        .summary-section {
          display: flex;
          justify-content: space-around;
          margin-bottom: 30px;
          background: #f8f9fa;
          padding: 20px;
          border-radius: 5px;
        }
        .summary-item {
          text-align: center;
        }
        .summary-value {
          font-size: 24px;
          font-weight: bold;
          color: #2c3e50;
        }
        .summary-label {
          font-size: 14px;
          color: #666;
          margin-top: 5px;
        }
        .sales-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
        }
        .sales-table th, .sales-table td {
          text-align: left;
          padding: 10px 8px;
          border: 1px solid #ddd;
          font-size: 12px;
        }
        .sales-table th {
          background: #2c3e50;
          color: white;
          font-weight: bold;
        }
        .sales-table tr:nth-child(even) {
          background: #f8f9fa;
        }
        .amount {
          text-align: right;
          font-weight: bold;
        }
        .footer {
          margin-top: 30px;
          text-align: center;
          padding-top: 20px;
          border-top: 1px solid #ddd;
          font-size: 12px;
          color: #666;
        }
        @media print {
          body { margin: 0; }
          .report-container { margin: 0; padding: 10px; }
        }
      </style>
    `;
  }

  openPrintPreview(htmlContent, title) {
    try {
      // Create a new window for print preview
      const printWindow = window.open('', '_blank', 'width=900,height=700,scrollbars=yes,resizable=yes');
      
      if (!printWindow) {
        // If popup is blocked, try inline approach
        this.inlinePrint(htmlContent);
        return;
      }
      
      // Write the complete HTML document
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${title} - Print Preview</title>
            <meta charset="utf-8">
            <style>
              body {
                margin: 0;
                padding: 20px;
                font-family: Arial, sans-serif;
                background: #f5f5f5;
              }
              .toolbar {
                background: #2c3e50;
                color: white;
                padding: 15px 20px;
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                z-index: 1000;
                display: flex;
                justify-content: space-between;
                align-items: center;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
              }
              .toolbar h3 {
                margin: 0;
                font-size: 18px;
              }
              .toolbar-buttons {
                display: flex;
                gap: 10px;
              }
              .btn {
                background: #3498db;
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 5px;
                cursor: pointer;
                font-size: 14px;
                font-weight: 500;
                transition: background-color 0.3s;
                text-decoration: none;
                display: inline-block;
              }
              .btn:hover {
                background: #2980b9;
                transform: translateY(-1px);
              }
              .btn-print {
                background: #27ae60;
              }
              .btn-print:hover {
                background: #229954;
              }
              .btn-download {
                background: #f39c12;
              }
              .btn-download:hover {
                background: #e67e22;
              }
              .btn-close {
                background: #e74c3c;
              }
              .btn-close:hover {
                background: #c0392b;
              }
              .content-area {
                margin-top: 80px;
                background: white;
                border-radius: 8px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.1);
                overflow: hidden;
              }
              .print-container {
                max-height: calc(100vh - 120px);
                overflow-y: auto;
                padding: 20px;
              }
              @media print {
                body { 
                  margin: 0; 
                  background: white;
                }
                .toolbar {
                  display: none !important;
                }
                .content-area {
                  margin: 0;
                  box-shadow: none;
                  border-radius: 0;
                }
                .print-container {
                  margin: 0;
                  padding: 10px;
                  max-height: none;
                  overflow: visible;
                }
              }
              .loading {
                text-align: center;
                padding: 50px;
                color: #666;
                font-size: 16px;
              }
            </style>
          </head>
          <body>
            <div class="toolbar">
              <h3>${title} - Print Preview</h3>
              <div class="toolbar-buttons">
                <button class="btn btn-print" onclick="window.print()">🖨️ Print</button>
                <button class="btn btn-download" onclick="downloadAsPDF()">💾 Save as PDF</button>
                <button class="btn btn-close" onclick="window.close()">✕ Close</button>
              </div>
            </div>
            <div class="content-area">
              <div class="print-container">
                <div class="loading">Loading preview...</div>
                <div id="invoice-content"></div>
              </div>
            </div>
            <script>
              // Load the content
              document.getElementById('invoice-content').innerHTML = \`${htmlContent.replace(/`/g, '\\`')}\`;
              document.querySelector('.loading').style.display = 'none';
              
              // Download as PDF function
              function downloadAsPDF() {
                window.print();
              }
              
              // Handle print events
              window.addEventListener('beforeprint', function() {
                document.body.style.background = 'white';
              });
              
              window.addEventListener('afterprint', function() {
                document.body.style.background = '#f5f5f5';
              });
              
              // Auto-focus on print button
              setTimeout(() => {
                document.querySelector('.btn-print').focus();
              }, 100);
            </script>
          </body>
        </html>
      `);
      
      printWindow.document.close();
      
      // Focus the window
      printWindow.focus();
      
    } catch (error) {
      console.error('Error opening print preview:', error);
      // Fallback to inline print
      this.inlinePrint(htmlContent);
    }
  }

  inlinePrint(htmlContent) {
    // Create a hidden iframe for printing
    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.left = '-9999px';
    iframe.style.top = '-9999px';
    iframe.style.width = '0px';
    iframe.style.height = '0px';
    document.body.appendChild(iframe);
    
    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
    iframeDoc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Print Document</title>
          <style>
            body { margin: 0; padding: 20px; }
            @media print {
              body { margin: 0; padding: 10px; }
            }
          </style>
        </head>
        <body>
          ${htmlContent}
          <script>
            window.onload = function() {
              setTimeout(() => {
                window.print();
                window.onafterprint = function() {
                  parent.document.body.removeChild(parent.document.querySelector('iframe'));
                };
              }, 500);
            }
          </script>
        </body>
      </html>
    `);
    
    iframeDoc.close();
  }
}

export default new PDFService();
