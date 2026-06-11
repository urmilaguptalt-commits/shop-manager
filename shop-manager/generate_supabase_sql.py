import json
import os

json_path = os.path.join('frontend', 'public', 'data.json')
if not os.path.exists(json_path):
    print("Error: data.json not found.")
    exit(1)

with open(json_path, 'r', encoding='utf-8') as f:
    db = json.load(f)

# Write schema.sql
schema_sql = """-- 1. Create Suppliers table
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
"""

with open('supabase_schema.sql', 'w', encoding='utf-8') as f:
    f.write(schema_sql)
print("Generated supabase_schema.sql successfully!")

# Write seed.sql
seed_lines = [
    "-- Seeding initial database tables",
    "BEGIN;"
]

def clean_str(s):
    if s is None:
        return 'NULL'
    return "'" + s.replace("'", "''") + "'"

def clean_num(n):
    if n is None:
        return 'NULL'
    return str(n)

# Seed Suppliers
for s in db.get('suppliers', []):
    seed_lines.append(
        f"INSERT INTO suppliers (id, name, contact_person, phone, email, category) VALUES "
        f"({s['id']}, {clean_str(s.get('name'))}, {clean_str(s.get('contact_person'))}, "
        f"{clean_str(s.get('phone'))}, {clean_str(s.get('email'))}, {clean_str(s.get('category'))}) "
        f"ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, contact_person=EXCLUDED.contact_person, phone=EXCLUDED.phone, email=EXCLUDED.email, category=EXCLUDED.category;"
    )

# Seed Products
for p in db.get('products', []):
    seed_lines.append(
        f"INSERT INTO products (id, name, brand, sku, category, price, cost_price, specs, stock_qty, min_stock, image_url, supplier_id) VALUES "
        f"({p['id']}, {clean_str(p.get('name'))}, {clean_str(p.get('brand'))}, {clean_str(p.get('sku'))}, "
        f"{clean_str(p.get('category'))}, {clean_num(p.get('price'))}, {clean_num(p.get('cost_price'))}, "
        f"{clean_str(p.get('specs'))}, {clean_num(p.get('stock_qty'))}, {clean_num(p.get('min_stock'))}, "
        f"{clean_str(p.get('image_url'))}, {clean_num(p.get('supplier_id'))}) "
        f"ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, brand=EXCLUDED.brand, sku=EXCLUDED.sku, category=EXCLUDED.category, price=EXCLUDED.price, cost_price=EXCLUDED.cost_price, specs=EXCLUDED.specs, stock_qty=EXCLUDED.stock_qty, min_stock=EXCLUDED.min_stock, image_url=EXCLUDED.image_url, supplier_id=EXCLUDED.supplier_id;"
    )

# Seed Product Units
for pu in db.get('product_units', []):
    seed_lines.append(
        f"INSERT INTO product_units (id, product_id, serial_imei, status, warranty_expiry_date) VALUES "
        f"({pu['id']}, {clean_num(pu.get('product_id'))}, {clean_str(pu.get('serial_imei'))}, "
        f"{clean_str(pu.get('status'))}, {clean_str(pu.get('warranty_expiry_date'))}) "
        f"ON CONFLICT (id) DO UPDATE SET status=EXCLUDED.status, warranty_expiry_date=EXCLUDED.warranty_expiry_date;"
    )

# Seed Customers
for c in db.get('customers', []):
    seed_lines.append(
        f"INSERT INTO customers (id, name, phone, email, total_purchases) VALUES "
        f"({c['id']}, {clean_str(c.get('name'))}, {clean_str(c.get('phone'))}, "
        f"{clean_str(c.get('email'))}, {clean_num(c.get('total_purchases'))}) "
        f"ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, phone=EXCLUDED.phone, email=EXCLUDED.email, total_purchases=EXCLUDED.total_purchases;"
    )

# Seed Invoices
invoice_items = []
for inv in db.get('invoices', []):
    seed_lines.append(
        f"INSERT INTO invoices (id, invoice_number, customer_id, date, subtotal, gst_amount, total, status, payment_mode) VALUES "
        f"({inv['id']}, {clean_str(inv.get('invoice_number'))}, {clean_num(inv.get('customer_id'))}, "
        f"{clean_str(inv.get('date'))}, {clean_num(inv.get('subtotal'))}, {clean_num(inv.get('gst_amount'))}, "
        f"{clean_num(inv.get('total'))}, {clean_str(inv.get('status'))}, {clean_str(inv.get('payment_mode'))}) "
        f"ON CONFLICT (id) DO UPDATE SET invoice_number=EXCLUDED.invoice_number, customer_id=EXCLUDED.customer_id, date=EXCLUDED.date, subtotal=EXCLUDED.subtotal, gst_amount=EXCLUDED.gst_amount, total=EXCLUDED.total, status=EXCLUDED.status, payment_mode=EXCLUDED.payment_mode;"
    )
    for item in inv.get('items', []):
        invoice_items.append(item)

# Seed Invoice Items
for ii in invoice_items:
    seed_lines.append(
        f"INSERT INTO invoice_items (id, invoice_id, product_id, product_unit_id, quantity, unit_price, total_price) VALUES "
        f"({ii['id']}, {clean_num(ii.get('invoice_id'))}, {clean_num(ii.get('product_id'))}, "
        f"{clean_num(ii.get('product_unit_id'))}, {clean_num(ii.get('quantity'))}, "
        f"{clean_num(ii.get('unit_price'))}, {clean_num(ii.get('total_price'))}) "
        f"ON CONFLICT (id) DO UPDATE SET quantity=EXCLUDED.quantity, unit_price=EXCLUDED.unit_price, total_price=EXCLUDED.total_price;"
    )

# Seed Purchase Orders
po_items = []
for po in db.get('purchase_orders', []):
    seed_lines.append(
        f"INSERT INTO purchase_orders (id, po_number, supplier_id, date, status, total_amount, expected_delivery) VALUES "
        f"({po['id']}, {clean_str(po.get('po_number'))}, {clean_num(po.get('supplier_id'))}, "
        f"{clean_str(po.get('date'))}, {clean_str(po.get('status'))}, {clean_num(po.get('total_amount'))}, "
        f"{clean_str(po.get('expected_delivery'))}) "
        f"ON CONFLICT (id) DO UPDATE SET po_number=EXCLUDED.po_number, supplier_id=EXCLUDED.supplier_id, date=EXCLUDED.date, status=EXCLUDED.status, total_amount=EXCLUDED.total_amount, expected_delivery=EXCLUDED.expected_delivery;"
    )
    for item in po.get('items', []):
        po_items.append(item)

# Seed Purchase Order Items
for poi in po_items:
    seed_lines.append(
        f"INSERT INTO purchase_order_items (id, po_id, product_id, quantity, unit_price, total_price) VALUES "
        f"({poi['id']}, {clean_num(poi.get('po_id'))}, {clean_num(poi.get('product_id'))}, "
        f"{clean_num(poi.get('quantity'))}, {clean_num(poi.get('unit_price'))}, {clean_num(poi.get('total_price'))}) "
        f"ON CONFLICT (id) DO UPDATE SET quantity=EXCLUDED.quantity, unit_price=EXCLUDED.unit_price, total_price=EXCLUDED.total_price;"
    )

# Adjust Sequences so that new inserts don't conflict with existing IDs
seq_adjusts = [
    "SELECT setval('suppliers_id_seq', (SELECT COALESCE(MAX(id), 1) FROM suppliers));",
    "SELECT setval('products_id_seq', (SELECT COALESCE(MAX(id), 1) FROM products));",
    "SELECT setval('product_units_id_seq', (SELECT COALESCE(MAX(id), 1) FROM product_units));",
    "SELECT setval('customers_id_seq', (SELECT COALESCE(MAX(id), 1) FROM customers));",
    "SELECT setval('invoices_id_seq', (SELECT COALESCE(MAX(id), 1) FROM invoices));",
    "SELECT setval('invoice_items_id_seq', (SELECT COALESCE(MAX(id), 1) FROM invoice_items));",
    "SELECT setval('purchase_orders_id_seq', (SELECT COALESCE(MAX(id), 1) FROM purchase_orders));",
    "SELECT setval('purchase_order_items_id_seq', (SELECT COALESCE(MAX(id), 1) FROM purchase_order_items));"
]
seed_lines.extend(seq_adjusts)

seed_lines.append("COMMIT;")

with open('supabase_seed.sql', 'w', encoding='utf-8') as f:
    f.write('\n'.join(seed_lines))
print("Generated supabase_seed.sql successfully!")
