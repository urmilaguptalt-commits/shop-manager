-- 1. Create Suppliers table
CREATE TABLE IF NOT EXISTS suppliers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255),
    phone VARCHAR(50),
    email VARCHAR(255),
    category VARCHAR(255)
);

-- 2. Create Products table
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    brand VARCHAR(255),
    sku VARCHAR(100) UNIQUE NOT NULL,
    category VARCHAR(100),
    price NUMERIC(15, 2),
    cost_price NUMERIC(15, 2),
    specs TEXT,
    stock_qty INT DEFAULT 0,
    min_stock INT DEFAULT 10,
    image_url TEXT,
    supplier_id INT REFERENCES suppliers(id) ON DELETE SET NULL
);

-- 3. Create Product Units table
CREATE TABLE IF NOT EXISTS product_units (
    id SERIAL PRIMARY KEY,
    product_id INT REFERENCES products(id) ON DELETE CASCADE,
    serial_imei VARCHAR(100) UNIQUE NOT NULL,
    status VARCHAR(50) DEFAULT 'in-stock',
    warranty_expiry_date TIMESTAMP
);

-- 4. Create Customers table
CREATE TABLE IF NOT EXISTS customers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) UNIQUE,
    email VARCHAR(255),
    total_purchases NUMERIC(15, 2) DEFAULT 0.00
);

-- 5. Create Invoices table
CREATE TABLE IF NOT EXISTS invoices (
    id SERIAL PRIMARY KEY,
    invoice_number VARCHAR(100) UNIQUE NOT NULL,
    customer_id INT REFERENCES customers(id) ON DELETE SET NULL,
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    subtotal NUMERIC(15, 2),
    gst_amount NUMERIC(15, 2),
    total NUMERIC(15, 2),
    status VARCHAR(50) DEFAULT 'paid',
    payment_mode VARCHAR(50)
);

-- 6. Create Invoice Items table
CREATE TABLE IF NOT EXISTS invoice_items (
    id SERIAL PRIMARY KEY,
    invoice_id INT REFERENCES invoices(id) ON DELETE CASCADE,
    product_id INT REFERENCES products(id) ON DELETE SET NULL,
    product_unit_id INT REFERENCES product_units(id) ON DELETE SET NULL,
    quantity INT,
    unit_price NUMERIC(15, 2),
    total_price NUMERIC(15, 2)
);

-- 7. Create Purchase Orders table
CREATE TABLE IF NOT EXISTS purchase_orders (
    id SERIAL PRIMARY KEY,
    po_number VARCHAR(100) UNIQUE NOT NULL,
    supplier_id INT REFERENCES suppliers(id) ON DELETE CASCADE,
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'completed',
    total_amount NUMERIC(15, 2),
    expected_delivery TIMESTAMP
);

-- 8. Create Purchase Order Items table
CREATE TABLE IF NOT EXISTS purchase_order_items (
    id SERIAL PRIMARY KEY,
    po_id INT REFERENCES purchase_orders(id) ON DELETE CASCADE,
    product_id INT REFERENCES products(id) ON DELETE SET NULL,
    quantity INT,
    unit_price NUMERIC(15, 2),
    total_price NUMERIC(15, 2)
);
