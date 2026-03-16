const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();

// Database setup
const dbPath = path.join(__dirname, '..', 'database', 'pharmacy.db');
let db;

function initDatabase() {
  // Ensure database directory exists
  const dbDir = path.dirname(dbPath);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  // Connect to database
  db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error('Error opening database:', err.message);
    } else {
      console.log('Connected to SQLite database');
      initializeTables();
    }
  });
}

function initializeTables() {
  const initSqlPath = path.join(__dirname, '..', 'database', 'init.sql');
  if (fs.existsSync(initSqlPath)) {
    const initSql = fs.readFileSync(initSqlPath, 'utf8');
    db.exec(initSql, (err) => {
      if (err) {
        console.error('Error initializing database:', err.message);
      } else {
        console.log('Database initialized successfully');
      }
    });
  }
}

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, '..', 'assets', 'icon.png')
  });

  // Load the React app
  const startUrl = process.env.ELECTRON_START_URL || `file://${path.join(__dirname, '..', 'build', 'index.html')}`;
  mainWindow.loadURL(startUrl);

  // Open DevTools in development
  if (process.env.ELECTRON_START_URL) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  initDatabase();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC Handlers for Products
ipcMain.handle('get-products', async () => {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM products ORDER BY name', [], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
});

ipcMain.handle('add-product', async (event, product) => {
  return new Promise((resolve, reject) => {
    const { name, generic_name, company, buy_price, sell_price, stock, expiry_date, barcode } = product;
    db.run(
      'INSERT INTO products (name, generic_name, company, buy_price, sell_price, stock, expiry_date, barcode) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [name, generic_name, company, buy_price, sell_price, stock, expiry_date, barcode],
      function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID });
        }
      }
    );
  });
});

ipcMain.handle('update-product', async (event, id, product) => {
  return new Promise((resolve, reject) => {
    const { name, generic_name, company, buy_price, sell_price, stock, expiry_date, barcode } = product;
    db.run(
      'UPDATE products SET name = ?, generic_name = ?, company = ?, buy_price = ?, sell_price = ?, stock = ?, expiry_date = ?, barcode = ? WHERE id = ?',
      [name, generic_name, company, buy_price, sell_price, stock, expiry_date, barcode, id],
      function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ changes: this.changes });
        }
      }
    );
  });
});

ipcMain.handle('delete-product', async (event, id) => {
  return new Promise((resolve, reject) => {
    db.run('DELETE FROM products WHERE id = ?', [id], function(err) {
      if (err) {
        reject(err);
      } else {
        resolve({ changes: this.changes });
      }
    });
  });
});

ipcMain.handle('search-products', async (event, query) => {
  return new Promise((resolve, reject) => {
    db.all(
      'SELECT * FROM products WHERE name LIKE ? OR generic_name LIKE ? OR barcode LIKE ? ORDER BY name',
      [`%${query}%`, `%${query}%`, `%${query}%`],
      (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      }
    );
  });
});

// IPC Handlers for Sales
ipcMain.handle('create-sale', async (event, sale) => {
  return new Promise((resolve, reject) => {
    const { date, total_amount, discount, net_amount, items } = sale;
    
    db.serialize(() => {
      db.run('BEGIN TRANSACTION');
      
      // Insert sale
      db.run(
        'INSERT INTO sales (date, total_amount, discount, net_amount) VALUES (?, ?, ?, ?)',
        [date, total_amount, discount, net_amount],
        function(err) {
          if (err) {
            db.run('ROLLBACK');
            reject(err);
            return;
          }
          
          const saleId = this.lastID;
          
          // Insert sale items and update product stock
          let itemsProcessed = 0;
          const totalItems = items.length;
          
          items.forEach(item => {
            // Insert sale item
            db.run(
              'INSERT INTO sale_items (sale_id, product_id, quantity, price, total) VALUES (?, ?, ?, ?, ?)',
              [saleId, item.product_id, item.quantity, item.price, item.total],
              function(err) {
                if (err) {
                  db.run('ROLLBACK');
                  reject(err);
                  return;
                }
                
                // Update product stock
                db.run(
                  'UPDATE products SET stock = stock - ? WHERE id = ?',
                  [item.quantity, item.product_id],
                  function(err) {
                    if (err) {
                      db.run('ROLLBACK');
                      reject(err);
                      return;
                    }
                    
                    itemsProcessed++;
                    if (itemsProcessed === totalItems) {
                      db.run('COMMIT', (err) => {
                        if (err) {
                          reject(err);
                        } else {
                          resolve({ id: saleId });
                        }
                      });
                    }
                  }
                );
              }
            );
          });
        }
      );
    });
  });
});

ipcMain.handle('get-sales', async (event, startDate, endDate) => {
  return new Promise((resolve, reject) => {
    db.all(
      'SELECT * FROM sales WHERE date BETWEEN ? AND ? ORDER BY date DESC',
      [startDate, endDate],
      (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      }
    );
  });
});

ipcMain.handle('get-sale-details', async (event, saleId) => {
  return new Promise((resolve, reject) => {
    db.all(
      'SELECT si.*, p.name, p.generic_name FROM sale_items si JOIN products p ON si.product_id = p.id WHERE si.sale_id = ?',
      [saleId],
      (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      }
    );
  });
});

// IPC Handlers for Reports
ipcMain.handle('get-low-stock-products', async () => {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM products WHERE stock < 20 ORDER BY stock ASC', [], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
});

ipcMain.handle('get-expiry-alerts', async () => {
  return new Promise((resolve, reject) => {
    const threeMonthsFromNow = new Date();
    threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);
    const expiryDate = threeMonthsFromNow.toISOString().split('T')[0];
    
    db.all(
      'SELECT * FROM products WHERE expiry_date <= ? ORDER BY expiry_date ASC',
      [expiryDate],
      (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      }
    );
  });
});

ipcMain.handle('get-daily-sales-report', async (event, date) => {
  return new Promise((resolve, reject) => {
    db.all(
      'SELECT * FROM sales WHERE date = ? ORDER BY created_at DESC',
      [date],
      (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      }
    );
  });
});

ipcMain.handle('get-monthly-sales-report', async (event, year, month) => {
  return new Promise((resolve, reject) => {
    db.all(
      'SELECT * FROM sales WHERE strftime("%Y", date) = ? AND strftime("%m", date) = ? ORDER BY date DESC',
      [year.toString(), month.toString().padStart(2, '0')],
      (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      }
    );
  });
});

// IPC Handler for printing
ipcMain.handle('print-invoice', async (event, invoiceData) => {
  const options = {
    type: 'info',
    buttons: ['Print', 'Cancel'],
    defaultId: 0,
    title: 'Print Invoice',
    message: `Invoice #${invoiceData.id} - Total: $${invoiceData.net_amount}`
  };
  
  const result = await dialog.showMessageBox(mainWindow, options);
  return result.response === 0; // Return true if Print was clicked
});
