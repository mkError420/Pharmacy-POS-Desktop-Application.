const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Product operations
  getProducts: () => ipcRenderer.invoke('get-products'),
  addProduct: (product) => ipcRenderer.invoke('add-product', product),
  updateProduct: (id, product) => ipcRenderer.invoke('update-product', id, product),
  deleteProduct: (id) => ipcRenderer.invoke('delete-product', id),
  searchProducts: (query) => ipcRenderer.invoke('search-products', query),
  
  // Sales operations
  createSale: (sale) => ipcRenderer.invoke('create-sale', sale),
  getSales: (startDate, endDate) => ipcRenderer.invoke('get-sales', startDate, endDate),
  getSaleDetails: (saleId) => ipcRenderer.invoke('get-sale-details', saleId),
  
  // Report operations
  getLowStockProducts: () => ipcRenderer.invoke('get-low-stock-products'),
  getExpiryAlerts: () => ipcRenderer.invoke('get-expiry-alerts'),
  getDailySalesReport: (date) => ipcRenderer.invoke('get-daily-sales-report', date),
  getMonthlySalesReport: (year, month) => ipcRenderer.invoke('get-monthly-sales-report', year, month),
  
  // Database operations
  getDatabaseStatus: () => ipcRenderer.invoke('get-database-status'),
  
  // Print operation
  printInvoice: (invoiceData) => ipcRenderer.invoke('print-invoice', invoiceData)
});
