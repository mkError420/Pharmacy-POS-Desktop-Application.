// PDF generation service for invoices and reports
import jsPDF from 'jspdf';

class PDFService {
  constructor() {
    // jsPDF instance
    this.jsPDF = jsPDF;
  }

  async generateInvoicePDF(sale, saleDetails) {
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      // Set font
      doc.setFont('helvetica');
      
      // Add header
      doc.setFontSize(20);
      doc.text('PHARMACY POS', 105, 20, { align: 'center' });
      
      doc.setFontSize(10);
      doc.text('123 Medicine Street, Pharma City', 105, 27, { align: 'center' });
      doc.text('Phone: +1 234 567 8900', 105, 32, { align: 'center' });
      doc.text('Email: info@pharmacypos.com', 105, 37, { align: 'center' });
      
      // Add line
      doc.line(10, 45, 200, 45);
      
      // Invoice details
      doc.setFontSize(12);
      doc.text('Invoice Details', 20, 55);
      doc.setFontSize(10);
      doc.text(`Invoice #: ${sale.id}`, 20, 65);
      doc.text(`Date: ${new Date(sale.date).toLocaleDateString()}`, 20, 72);
      doc.text(`Time: ${new Date(sale.created_at).toLocaleTimeString()}`, 20, 79);
      
      // Payment details
      doc.text('Payment Information', 120, 55);
      doc.text('Payment Method: Cash', 120, 65);
      doc.text('Status: Paid', 120, 72);
      
      // Add line
      doc.line(10, 90, 200, 90);
      
      // Items table header
      doc.setFontSize(12);
      doc.text('Items', 105, 100, { align: 'center' });
      
      doc.setFontSize(9);
      let yPosition = 110;
      
      // Table headers
      doc.text('Product', 15, yPosition);
      doc.text('Qty', 120, yPosition);
      doc.text('Price', 140, yPosition);
      doc.text('Total', 170, yPosition);
      
      yPosition += 7;
      doc.line(15, yPosition, 195, yPosition);
      yPosition += 5;
      
      // Items
      saleDetails.forEach(item => {
        // Product name (truncate if too long)
        const productName = item.name.length > 25 ? item.name.substring(0, 25) + '...' : item.name;
        doc.text(productName, 15, yPosition);
        doc.text(item.quantity.toString(), 120, yPosition);
        doc.text(`$${item.price.toFixed(2)}`, 140, yPosition);
        doc.text(`$${item.total.toFixed(2)}`, 170, yPosition);
        yPosition += 6;
      });
      
      // Add line
      yPosition += 3;
      doc.line(15, yPosition, 195, yPosition);
      yPosition += 8;
      
      // Totals
      doc.setFontSize(10);
      doc.text(`Subtotal: $${sale.total_amount.toFixed(2)}`, 140, yPosition);
      yPosition += 6;
      
      if (sale.discount > 0) {
        doc.text(`Discount: $${sale.discount.toFixed(2)}`, 140, yPosition);
        yPosition += 6;
      }
      
      doc.setFontSize(12);
      doc.text(`Total: $${sale.net_amount.toFixed(2)}`, 140, yPosition);
      
      // Footer
      doc.setFontSize(10);
      doc.text('Thank you for your purchase!', 105, 270, { align: 'center' });
      doc.text('Please come again', 105, 275, { align: 'center' });
      doc.text('*** This is a computer generated invoice ***', 105, 280, { align: 'center' });
      
      // Get PDF as data URL and open in new window for preview
      const pdfDataUrl = doc.output('datauristring');
      this.openPDFPreview(pdfDataUrl, `Invoice_${sale.id}`);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw error;
    }
  }

  async generateSalesReportPDF(salesData, reportTitle, dateRange) {
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      // Set font
      doc.setFont('helvetica');
      
      // Add header
      doc.setFontSize(18);
      doc.text(reportTitle, 105, 20, { align: 'center' });
      
      doc.setFontSize(10);
      doc.text(dateRange, 105, 27, { align: 'center' });
      
      // Add line
      doc.line(10, 35, 200, 35);
      
      // Calculate summary
      const totalRevenue = salesData.reduce((sum, sale) => sum + sale.net_amount, 0);
      const totalDiscount = salesData.reduce((sum, sale) => sum + sale.discount, 0);
      const averageSale = salesData.length > 0 ? totalRevenue / salesData.length : 0;
      
      // Summary section
      doc.setFontSize(12);
      doc.text('Summary', 20, 50);
      
      doc.setFontSize(10);
      doc.text(`Total Sales: ${salesData.length}`, 20, 60);
      doc.text(`Total Revenue: $${totalRevenue.toFixed(2)}`, 20, 67);
      doc.text(`Total Discount: $${totalDiscount.toFixed(2)}`, 20, 74);
      doc.text(`Average Sale: $${averageSale.toFixed(2)}`, 20, 81);
      
      // Add line
      doc.line(10, 90, 200, 90);
      
      // Sales table
      doc.setFontSize(12);
      doc.text('Sales Details', 105, 100, { align: 'center' });
      
      doc.setFontSize(9);
      let yPosition = 110;
      
      // Table headers
      doc.text('Invoice #', 15, yPosition);
      doc.text('Date', 50, yPosition);
      doc.text('Total', 120, yPosition);
      doc.text('Discount', 150, yPosition);
      doc.text('Net Amount', 170, yPosition);
      
      yPosition += 7;
      doc.line(15, yPosition, 195, yPosition);
      yPosition += 5;
      
      // Sales data
      salesData.forEach(sale => {
        doc.text(`#${sale.id}`, 15, yPosition);
        doc.text(new Date(sale.date).toLocaleDateString(), 50, yPosition);
        doc.text(`$${sale.total_amount.toFixed(2)}`, 120, yPosition);
        doc.text(`$${sale.discount.toFixed(2)}`, 150, yPosition);
        doc.text(`$${sale.net_amount.toFixed(2)}`, 170, yPosition);
        yPosition += 6;
        
        // Add new page if needed
        if (yPosition > 270) {
          doc.addPage();
          yPosition = 20;
        }
      });
      
      // Footer
      doc.setFontSize(10);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 105, 280, { align: 'center' });
      doc.text('Pharmacy POS System', 105, 285, { align: 'center' });
      
      // Get PDF as data URL and open in new window for preview
      const pdfDataUrl = doc.output('datauristring');
      const filename = reportTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      this.openPDFPreview(pdfDataUrl, filename);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw error;
    }
  }

  openPDFPreview(pdfDataUrl, title) {
    // Create a new window for PDF preview
    const previewWindow = window.open('', '_blank', 'width=800,height=600');
    
    previewWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title} - PDF Preview</title>
          <style>
            body {
              margin: 0;
              padding: 0;
              font-family: Arial, sans-serif;
              background: #f0f0f0;
            }
            .toolbar {
              background: #2c3e50;
              color: white;
              padding: 10px 20px;
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            .toolbar h3 {
              margin: 0;
              font-size: 16px;
            }
            .toolbar-buttons {
              display: flex;
              gap: 10px;
            }
            .btn {
              background: #3498db;
              color: white;
              border: none;
              padding: 8px 16px;
              border-radius: 4px;
              cursor: pointer;
              font-size: 14px;
              transition: background-color 0.3s;
            }
            .btn:hover {
              background: #2980b9;
            }
            .btn-print {
              background: #27ae60;
            }
            .btn-print:hover {
              background: #229954;
            }
            .btn-close {
              background: #e74c3c;
            }
            .btn-close:hover {
              background: #c0392b;
            }
            .preview-container {
              height: calc(100vh - 60px);
              display: flex;
              justify-content: center;
              align-items: center;
              padding: 20px;
            }
            iframe {
              width: 100%;
              height: 100%;
              border: none;
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
              background: white;
            }
            .loading {
              text-align: center;
              color: #666;
            }
          </style>
        </head>
        <body>
          <div class="toolbar">
            <h3>${title} - PDF Preview</h3>
            <div class="toolbar-buttons">
              <button class="btn btn-print" onclick="window.print()">🖨️ Print</button>
              <button class="btn" onclick="downloadPDF()">💾 Download</button>
              <button class="btn btn-close" onclick="window.close()">✕ Close</button>
            </div>
          </div>
          <div class="preview-container">
            <div class="loading">Loading PDF preview...</div>
            <iframe id="pdfFrame" src="${pdfDataUrl}" onload="hideLoading()"></iframe>
          </div>
          
          <script>
            function hideLoading() {
              document.querySelector('.loading').style.display = 'none';
              document.getElementById('pdfFrame').style.display = 'block';
            }
            
            function downloadPDF() {
              const link = document.createElement('a');
              link.href = '${pdfDataUrl}';
              link.download = '${title}.pdf';
              link.click();
            }
            
            // Handle print
            window.addEventListener('beforeprint', function() {
              document.querySelector('.toolbar').style.display = 'none';
            });
            
            window.addEventListener('afterprint', function() {
              document.querySelector('.toolbar').style.display = 'flex';
            });
          </script>
        </body>
      </html>
    `);
    
    previewWindow.document.close();
  }
}

export default new PDFService();
