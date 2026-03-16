const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();

// Database setup
const dbPath = path.join(__dirname, '..', 'database', 'pharmacy.db');
let db;

function initDatabase() {
  try {
    // Ensure database directory exists
    const dbDir = path.dirname(dbPath);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
      console.log('Database directory created:', dbDir);
    }

    // Check if database file exists
    const dbExists = fs.existsSync(dbPath);
    console.log('Database file exists:', dbExists);

    // Connect to database
    db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Error opening database:', err.message);
        // Try to create database if it doesn't exist
        if (err.message.includes('no such file') || err.message.includes('unable to open database')) {
          console.log('Attempting to create new database...');
          createNewDatabase();
        }
      } else {
        console.log('Connected to SQLite database at:', dbPath);
        
        // Initialize tables if database is new
        if (!dbExists) {
          console.log('New database detected, initializing tables...');
          initializeTables();
        } else {
          // Verify tables exist
          verifyTables();
        }
      }
    });
  } catch (error) {
    console.error('Database initialization error:', error);
    // Fallback to in-memory database
    console.log('Falling back to in-memory database...');
    db = new sqlite3.Database(':memory:', (err) => {
      if (err) {
        console.error('Error creating in-memory database:', err.message);
      } else {
        console.log('Connected to in-memory database');
        initializeTables();
      }
    });
  }
}

function createNewDatabase() {
  try {
    // Create the database file
    const dbDir = path.dirname(dbPath);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }
    
    // Create empty database file
    fs.writeFileSync(dbPath, '');
    
    // Connect to the new database
    db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Error creating new database:', err.message);
      } else {
        console.log('New database created successfully');
        initializeTables();
      }
    });
  } catch (error) {
    console.error('Error creating new database:', error);
  }
}

function verifyTables() {
  db.all("SELECT name FROM sqlite_master WHERE type='table'", [], (err, rows) => {
    if (err) {
      console.error('Error verifying tables:', err.message);
      return;
    }
    
    const tableNames = rows.map(row => row.name);
    const requiredTables = ['products', 'sales', 'sale_items'];
    
    const missingTables = requiredTables.filter(table => !tableNames.includes(table));
    
    if (missingTables.length > 0) {
      console.log('Missing tables:', missingTables);
      console.log('Initializing missing tables...');
      initializeTables();
    } else {
      console.log('All required tables exist');
      // Check if sample data exists
      checkSampleData();
    }
  });
}

function checkSampleData() {
  db.get('SELECT COUNT(*) as count FROM products', [], (err, row) => {
    if (err) {
      console.error('Error checking sample data:', err.message);
      return;
    }
    
    if (row.count === 0) {
      console.log('No sample data found, inserting sample data...');
      insertSampleData();
    } else {
      console.log('Sample data exists:', row.count, 'products');
    }
  });
}

function insertSampleData() {
  const sampleData = `
    INSERT INTO products (name, generic_name, company, buy_price, sell_price, stock, expiry_date, barcode) VALUES
    ('Paracetamol 500mg', 'Acetaminophen', 'Square Pharma', 5.00, 8.00, 100, '2024-12-31', '1234567890123'),
    ('Napa 500mg', 'Acetaminophen', 'Beximco Pharma', 5.50, 9.00, 75, '2024-10-15', '2345678901234'),
    ('Amoxicillin 500mg', 'Amoxicillin', 'Incepta Pharma', 12.00, 18.00, 50, '2024-08-20', '3456789012345'),
    ('Omeprazole 20mg', 'Omeprazole', 'ACI Pharma', 15.00, 25.00, 60, '2024-11-30', '4567890123456'),
    ('Azithromycin 250mg', 'Azithromycin', 'Square Pharma', 25.00, 40.00, 30, '2024-09-10', '5678901234567'),
    ('Ibuprofen 400mg', 'Ibuprofen', 'Renata Pharma', 8.00, 12.00, 80, '2024-07-25', '6789012345678'),
    ('Cetirizine 10mg', 'Cetirizine', 'Beximco Pharma', 6.00, 10.00, 90, '2024-06-15', '7890123456789'),
    ('Metformin 500mg', 'Metformin', 'Square Pharma', 4.00, 7.00, 120, '2024-12-01', '8901234567890'),
    ('Amlodipine 5mg', 'Amlodipine', 'Incepta Pharma', 18.00, 30.00, 40, '2024-08-05', '9012345678901'),
    ('Atorvastatin 10mg', 'Atorvastatin', 'ACI Pharma', 22.00, 35.00, 55, '2024-10-20', '0123456789012');
  `;
  
  db.exec(sampleData, (err) => {
    if (err) {
      console.error('Error inserting sample data:', err.message);
    } else {
      console.log('Sample data inserted successfully');
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
  try {
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
    
    console.log('Loading app from:', startUrl);
    mainWindow.loadURL(startUrl);

    // Handle loading errors
    mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
      console.error('Failed to load app:', errorCode, errorDescription);
      
      // Try to load fallback
      const fallbackUrl = `file://${path.join(__dirname, '..', 'public', 'index.html')}`;
      console.log('Trying fallback URL:', fallbackUrl);
      mainWindow.loadURL(fallbackUrl);
    });

    // Handle page load events
    mainWindow.webContents.on('did-finish-load', () => {
      console.log('App loaded successfully');
    });

    mainWindow.webContents.on('dom-ready', () => {
      console.log('DOM ready, app should be visible');
    });

    // Open DevTools in development
    if (process.env.ELECTRON_START_URL) {
      mainWindow.webContents.openDevTools();
    }

    mainWindow.on('closed', () => {
      mainWindow = null;
    });
    
    return mainWindow;
  } catch (error) {
    console.error('Error creating window:', error);
    return null;
  }
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
    if (!db) {
      reject(new Error('Database not initialized'));
      return;
    }
    
    db.all('SELECT * FROM products ORDER BY name', [], (err, rows) => {
      if (err) {
        console.error('Error getting products:', err.message);
        reject(err);
      } else {
        console.log('Products retrieved:', rows.length);
        resolve(rows);
      }
    });
  });
});

ipcMain.handle('add-product', async (event, product) => {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('Database not initialized'));
      return;
    }
    
    const { name, generic_name, company, buy_price, sell_price, stock, expiry_date, barcode } = product;
    db.run(
      'INSERT INTO products (name, generic_name, company, buy_price, sell_price, stock, expiry_date, barcode) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [name, generic_name, company, buy_price, sell_price, stock, expiry_date, barcode],
      function(err) {
        if (err) {
          console.error('Error adding product:', err.message);
          reject(err);
        } else {
          console.log('Product added:', this.lastID);
          resolve({ id: this.lastID });
        }
      }
    );
  });
});

// Database status checker
ipcMain.handle('get-database-status', async () => {
  return new Promise((resolve, reject) => {
    if (!db) {
      resolve({ 
        connected: false, 
        error: 'Database not initialized',
        tables: [],
        products: 0
      });
      return;
    }
    
    db.get('SELECT COUNT(*) as products FROM products', [], (err, productCount) => {
      if (err) {
        resolve({ 
          connected: true, 
          error: err.message,
          tables: [],
          products: 0
        });
        return;
      }
      
      db.all("SELECT name FROM sqlite_master WHERE type='table'", [], (err, tables) => {
        if (err) {
          resolve({ 
            connected: true, 
            error: err.message,
            tables: [],
            products: productCount?.products || 0
          });
          return;
        }
        
        resolve({ 
          connected: true, 
          error: null,
          tables: tables.map(t => t.name),
          products: productCount?.products || 0,
          path: dbPath
        });
      });
    });
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
