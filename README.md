# Pharmacy POS - Complete Offline Desktop Application

A comprehensive offline Pharmacy Point of Sale (POS) system built with Electron, React, and SQLite for Windows desktop usage.

## Features

### 🏪 Core POS Functionality
- **Product Management**: Add, edit, delete, and search medicines
- **Sales & Billing**: Fast POS interface with cart system
- **Invoice Generation**: Automatic invoice creation with printing
- **Stock Management**: Real-time stock tracking and updates
- **Barcode Support**: Search products by barcode

### 📊 Reporting & Analytics
- **Dashboard**: Today's sales summary, low stock alerts, expiry alerts
- **Sales Reports**: Daily, monthly, and custom date range reports
- **Stock Reports**: Complete inventory overview with valuations
- **Top Products**: Best-selling medicines analysis
- **Export Functionality**: CSV export for all reports

### ⚠️ Inventory Alerts
- **Low Stock Alerts**: Automatic notifications for items below threshold
- **Expiry Alerts**: Products expiring within 90 days
- **Out of Stock**: Real-time out-of-stock monitoring
- **Critical Alerts**: Priority-based alert system

### 🖨️ Invoice Printing
- **Professional Receipts**: Clean, printable invoice format
- **Automatic Calculations**: Subtotal, discount, and total amounts
- **Item Details**: Complete product information on receipts

## Technology Stack

- **Frontend**: React.js with modern hooks
- **Desktop Framework**: Electron.js
- **Backend**: Node.js (integrated in Electron)
- **Database**: SQLite (local, offline)
- **Build Tool**: Electron Builder for Windows installer

## Installation & Setup

### Prerequisites
- Node.js (version 14 or higher)
- npm or yarn package manager

### Install Dependencies
```bash
npm install
```

### Development Mode
```bash
# Start React development server
npm start

# Run Electron in development mode
npm run electron-dev
```

### Build Application
```bash
# Build React app
npm run build

# Create Windows installer
npm run electron-pack
```

## Project Structure

```
pharmacy-pos/
├── electron/
│   ├── main.js           # Electron main process
│   └── preload.js        # Security bridge
├── src/
│   ├── components/       # React components
│   │   ├── ProductSearch.jsx
│   │   ├── ProductForm.jsx
│   │   ├── InvoiceCart.jsx
│   │   ├── InvoiceTable.jsx
│   │   ├── InvoicePrint.jsx
│   │   └── InventoryAlerts.jsx
│   ├── pages/           # React pages
│   │   ├── Dashboard.jsx
│   │   ├── Products.jsx
│   │   ├── Sales.jsx
│   │   └── Reports.jsx
│   ├── services/        # Business logic
│   │   ├── database.js
│   │   ├── productService.js
│   │   └── salesService.js
│   ├── App.jsx          # Main App component
│   └── main.jsx         # React entry point
├── database/
│   └── init.sql         # Database schema
├── public/
│   └── index.html       # HTML template
└── package.json         # Dependencies and scripts
```

## Database Schema

### Products Table
- `id` - Primary key
- `name` - Product name
- `generic_name` - Generic medicine name
- `company` - Manufacturer
- `buy_price` - Purchase price
- `sell_price` - Selling price
- `stock` - Current stock quantity
- `expiry_date` - Expiration date
- `barcode` - Product barcode

### Sales Table
- `id` - Primary key
- `date` - Sale date
- `total_amount` - Total before discount
- `discount` - Discount amount
- `net_amount` - Final amount

### Sale Items Table
- `id` - Primary key
- `sale_id` - Reference to sales table
- `product_id` - Reference to products table
- `quantity` - Item quantity
- `price` - Unit price
- `total` - Line total

## Usage Instructions

### 1. Adding Products
1. Navigate to **Products** page
2. Click **Add New Product**
3. Fill in product details (name, price, stock, etc.)
4. Save to add to inventory

### 2. Making Sales
1. Go to **POS** page
2. Search products by name or scan barcode
3. Add items to cart
4. Adjust quantities if needed
5. Apply discount (optional)
6. Click **Complete Sale**

### 3. Viewing Reports
1. Access **Reports** page
2. Choose report type (Daily, Monthly, Stock, Top Products)
3. Set date range if needed
4. Export to CSV if required

### 4. Managing Inventory
1. **Dashboard** shows quick alerts
2. **Products** page for detailed inventory management
3. **Reports** → **Stock Report** for comprehensive view

## Keyboard Shortcuts

### POS Screen
- `Ctrl + Enter` - Complete sale
- `Ctrl + Delete` - Clear cart
- `Escape` - Close search results

### General
- `Tab` - Navigate between fields
- `Enter` - Confirm actions

## Sample Data

The application comes pre-loaded with 10 sample medicines to demonstrate functionality:

1. Paracetamol 500mg - Square Pharma
2. Napa 500mg - Beximco Pharma
3. Amoxicillin 500mg - Incepta Pharma
4. Omeprazole 20mg - ACI Pharma
5. Azithromycin 250mg - Square Pharma
6. Ibuprofen 400mg - Renata Pharma
7. Cetirizine 10mg - Beximco Pharma
8. Metformin 500mg - Square Pharma
9. Amlodipine 5mg - Incepta Pharma
10. Atorvastatin 10mg - ACI Pharma

## Security Features

- **Context Isolation**: Electron security best practices
- **Input Validation**: All user inputs validated
- **SQL Injection Prevention**: Parameterized queries
- **Data Integrity**: Transaction-based operations

## Performance Optimizations

- **Debounced Search**: Fast product searching
- **Lazy Loading**: Efficient data fetching
- **Caching**: Service layer caching
- **Optimized Queries**: Indexed database queries

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Ensure SQLite3 is properly installed
   - Check database file permissions

2. **Electron Window Not Opening**
   - Verify React development server is running
   - Check port conflicts (default: 3000)

3. **Build Errors**
   - Clear node_modules and reinstall
   - Check Node.js version compatibility

### Getting Help

1. Check console logs for error messages
2. Verify all dependencies are installed
3. Ensure database schema is properly initialized

## Future Enhancements

- [ ] User authentication and role management
- [ ] Supplier management
- [ ] Purchase order management
- [ ] Customer management
- [ ] Advanced reporting with charts
- [ ] Backup and restore functionality
- [ ] Multi-language support
- [ ] Cloud synchronization (optional)

## License

This project is open-source and available under the MIT License.

## Support

For technical support or feature requests, please refer to the project documentation or contact the development team.

---

**Note**: This application is designed to work completely offline without requiring internet connectivity. All data is stored locally using SQLite database.
