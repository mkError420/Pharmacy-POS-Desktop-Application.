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

-- Insert Sample medicines data
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
