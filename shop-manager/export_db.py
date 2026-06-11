import sqlite3
import json
import os
from datetime import datetime

db_path = 'shop.db'
if not os.path.exists(db_path):
    print("Error: shop.db not found in current directory.")
    exit(1)

conn = sqlite3.connect(db_path)
conn.row_factory = sqlite3.Row
cursor = conn.cursor()

def dict_from_row(row):
    d = dict(row)
    for k, v in d.items():
        if isinstance(v, datetime):
            d[k] = v.isoformat()
    return d

# 1. Fetch Users
cursor.execute("SELECT id, name, email, role FROM users")
users = [dict_from_row(r) for r in cursor.fetchall()]

# 2. Fetch Suppliers
cursor.execute("SELECT * FROM suppliers")
suppliers = [dict_from_row(r) for r in cursor.fetchall()]
suppliers_dict = {s['id']: s for s in suppliers}

# 3. Fetch Products
cursor.execute("SELECT * FROM products")
products = [dict_from_row(r) for r in cursor.fetchall()]
products_dict = {p['id']: p for p in products}

# 4. Fetch Product Units
cursor.execute("SELECT * FROM product_units")
product_units = [dict_from_row(r) for r in cursor.fetchall()]

# 5. Fetch Customers
cursor.execute("SELECT * FROM customers")
customers = [dict_from_row(r) for r in cursor.fetchall()]
customers_dict = {c['id']: c for c in customers}

# 6. Fetch Invoices and Items
cursor.execute("SELECT * FROM invoices")
invoices_rows = cursor.fetchall()
invoices = []
for inv_row in invoices_rows:
    inv = dict_from_row(inv_row)
    # Fetch customer details
    inv['customer'] = customers_dict.get(inv['customer_id'])
    
    # Fetch invoice items
    cursor.execute("SELECT * FROM invoice_items WHERE invoice_id = ?", (inv['id'],))
    items_rows = cursor.fetchall()
    items = []
    for item_row in items_rows:
        item = dict_from_row(item_row)
        # Embed product details
        item['product'] = products_dict.get(item['product_id'])
        items.append(item)
    inv['items'] = items
    invoices.append(inv)

# 7. Fetch Purchase Orders and Items
cursor.execute("SELECT * FROM purchase_orders")
po_rows = cursor.fetchall()
purchase_orders = []
for po_row in po_rows:
    po = dict_from_row(po_row)
    # Fetch supplier details
    po['supplier'] = suppliers_dict.get(po['supplier_id'])
    
    # Fetch PO items
    cursor.execute("SELECT * FROM purchase_order_items WHERE po_id = ?", (po['id'],))
    items_rows = cursor.fetchall()
    items = []
    for item_row in items_rows:
        item = dict_from_row(item_row)
        # Embed product details
        item['product'] = products_dict.get(item['product_id'])
        items.append(item)
    po['items'] = items
    purchase_orders.append(po)

db_data = {
    "users": users,
    "suppliers": suppliers,
    "products": products,
    "product_units": product_units,
    "customers": customers,
    "invoices": invoices,
    "purchase_orders": purchase_orders
}

output_path = os.path.join('frontend', 'public', 'data.json')
os.makedirs(os.path.dirname(output_path), exist_ok=True)
with open(output_path, 'w', encoding='utf-8') as f:
    json.dump(db_data, f, indent=2, ensure_ascii=False)

# Save to root college project folder as a single JSON file
root_json_path = os.path.join('..', 'shop_data.json')
with open(root_json_path, 'w', encoding='utf-8') as f:
    json.dump(db_data, f, indent=2, ensure_ascii=False)

# Save to root college project folder as a single JS file
root_js_path = os.path.join('..', 'shop_data.js')
with open(root_js_path, 'w', encoding='utf-8') as f:
    f.write("// Consolidated Shop Management Data\n")
    f.write("const shopData = ")
    json.dump(db_data, f, indent=2, ensure_ascii=False)
    f.write(";\n\n")
    f.write("// Also make it available globally on window if running in browser\n")
    f.write("if (typeof window !== 'undefined') {\n")
    f.write("  window.shopData = shopData;\n")
    f.write("}\n\n")
    f.write("// Expose as module if using ES modules or node\n")
    f.write("if (typeof module !== 'undefined' && module.exports) {\n")
    f.write("  module.exports = shopData;\n")
    f.write("} else if (typeof exports !== 'undefined') {\n")
    f.write("  exports.default = shopData;\n")
    f.write("}\n")

print(f"Database successfully exported to:")
print(f" - {output_path}")
print(f" - {root_json_path}")
print(f" - {root_js_path}")
print(f"Exported: {len(products)} products, {len(suppliers)} suppliers, {len(customers)} customers, {len(invoices)} invoices, {len(purchase_orders)} purchase orders.")

conn.close()
