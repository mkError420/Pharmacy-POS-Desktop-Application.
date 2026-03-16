-- Pharmacy POS Database Schema

-- Products table
CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    generic_name TEXT,
    company TEXT,
    buy_price REAL NOT NULL,
    sell_price REAL NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0,
    expiry_date TEXT,
    barcode TEXT UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Sales table
CREATE TABLE IF NOT EXISTS sales (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    total_amount REAL NOT NULL,
    discount REAL DEFAULT 0,
    net_amount REAL NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Sale items table
CREATE TABLE IF NOT EXISTS sale_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sale_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    price REAL NOT NULL,
    total REAL NOT NULL,
    FOREIGN KEY (sale_id) REFERENCES sales(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);
CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode);
CREATE INDEX IF NOT EXISTS idx_sales_date ON sales(date);
CREATE INDEX IF NOT EXISTS idx_sale_items_sale_id ON sale_items(sale_id);
CREATE INDEX IF NOT EXISTS idx_sale_items_product_id ON sale_items(product_id);

-- Insert sample data
INSERT OR IGNORE INTO products (name, generic_name, company, buy_price, sell_price, stock, expiry_date, barcode) VALUES
('Paracetamol 500mg', 'Paracetamol', 'Square Pharma', 2.50, 3.00, 100, '2025-12-31', '1234567890'),
('Napa 500mg', 'Paracetamol', 'Beximco Pharma', 3.00, 3.50, 80, '2025-11-30', '1234567891'),
('Amoxicillin 500mg', 'Amoxicillin', 'Incepta Pharma', 8.00, 10.00, 50, '2025-06-30', '1234567892'),
('Omeprazole 20mg', 'Omeprazole', 'ACI Pharma', 12.00, 15.00, 30, '2025-08-31', '1234567893'),
('Azithromycin 250mg', 'Azithromycin', 'Square Pharma', 25.00, 30.00, 20, '2025-09-30', '1234567894'),
('Ibuprofen 400mg', 'Ibuprofen', 'Renata Pharma', 4.00, 5.00, 60, '2025-10-31', '1234567895'),
('Cetirizine 10mg', 'Cetirizine', 'Beximco Pharma', 6.00, 7.50, 45, '2025-07-31', '1234567896'),
('Metformin 500mg', 'Metformin', 'Square Pharma', 5.00, 6.00, 70, '2025-12-15', '1234567897'),
('Amlodipine 5mg', 'Amlodipine', 'Incepta Pharma', 15.00, 18.00, 25, '2025-11-15', '1234567898'),
('Atorvastatin 10mg', 'Atorvastatin', 'ACI Pharma', 20.00, 25.00, 35, '2025-10-15', '1234567899');
