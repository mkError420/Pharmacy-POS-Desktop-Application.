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

## 🚀 Installation on Other PCs

### **Method 1: Easy Installation (Recommended)**

1. **Copy the entire project folder** to the new PC
2. **Double-click `INSTALL.bat`** - Automatic installation!
3. **Use desktop shortcut** to run the application

### **Method 2: Manual Installation**

1. **Install Node.js** from https://nodejs.org (LTS version)
2. **Copy project folder** to the new PC
3. **Open Command Prompt** in the project folder
4. **Run:** `npm install`
5. **Run:** `npm run electron`

### **Method 3: Quick Run**

1. **Copy project folder** to the new PC
2. **Double-click `RUN.bat`** to start directly

### **📋 What's Included in the Package:**
- ✅ **INSTALL.bat** - Automatic installation script
- ✅ **RUN.bat** - Quick launcher
- ✅ **INSTALLATION_GUIDE.md** - Detailed instructions
- ✅ **All application files** - Complete source code
- ✅ **Sample data** - 10 medicines pre-loaded
- ✅ **Database setup** - Automatic on first run

### **🖥️ System Requirements:**
- Windows 10/11 (64-bit recommended)
- Node.js 14+ (download from nodejs.org)
- 4GB RAM minimum
- 500MB storage space

### **📱 After Installation:**
- **Desktop shortcut** for easy access
- **Start Menu shortcut** for quick launch
- **Automatic database** creation
- **Sample medicines** loaded
- **Ready to use** immediately

### **🔧 Troubleshooting:**
- **"Node.js not found"** → Install Node.js first
- **"npm command not found"** → Restart PC after Node.js install
- **"Dependencies missing"** → Run `npm install`
- **"Won't start"** → Check `INSTALLATION_GUIDE.md`

---

**The application works completely offline once installed!**

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

This project is open for every one.

## Support

For technical support or feature requests, please refer to the project documentation or contact the development team.

---

**Note**: This application is designed to work completely offline without requiring internet connectivity. All data is stored locally using SQLite database.
