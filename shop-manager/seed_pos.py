import sqlite3
from datetime import datetime, timedelta
import random

db_path = r"c:\Users\Lenovo\Desktop\projectCollege\shop-manager\shop.db"
conn = sqlite3.connect(db_path)
cur = conn.cursor()

def seed_pos():
    # 1. Get Suppliers
    cur.execute("SELECT id, name FROM suppliers")
    suppliers = cur.fetchall()
    if not suppliers:
        print("No suppliers found. Please run seed_suppliers.py first.")
        return

    # 2. Get Products
    cur.execute("SELECT id, name, cost_price FROM products")
    products = cur.fetchall()
    if not products:
        print("No products found to create POs.")
        return

    # 3. Create sample POs
    statuses = ["Pending", "Completed", "Cancelled", "In Transit"]
    po_count = 0
    
    # Add 15 random POs
    for i in range(1, 16):
        supplier = random.choice(suppliers)
        status = random.choice(statuses)
        date = datetime.now() - timedelta(days=random.randint(1, 30))
        expected_delivery = date + timedelta(days=random.randint(5, 10))
        po_number = f"PO-{datetime.now().strftime('%Y%m')}-{1000+i}"
        
        # Check if PO number exists
        cur.execute("SELECT id FROM purchase_orders WHERE po_number = ?", (po_number,))
        if cur.fetchone():
            continue

        cur.execute(
            "INSERT INTO purchase_orders (po_number, supplier_id, date, status, total_amount, expected_delivery) VALUES (?, ?, ?, ?, ?, ?)",
            (po_number, supplier[0], date.isoformat(), status, 0.0, expected_delivery.isoformat())
        )
        po_id = cur.lastrowid
        
        # Add 1-4 items per PO
        total_amount = 0
        num_items = random.randint(1, 4)
        selected_products = random.sample(products, min(num_items, len(products)))
        
        for prod in selected_products:
            prod_id, prod_name, cost_price = prod
            qty = random.randint(5, 20)
            item_total = qty * cost_price
            
            cur.execute(
                "INSERT INTO purchase_order_items (po_id, product_id, quantity, unit_price, total_price) VALUES (?, ?, ?, ?, ?)",
                (po_id, prod_id, qty, cost_price, item_total)
            )
            total_amount += item_total
            
        # Update PO total
        cur.execute("UPDATE purchase_orders SET total_amount = ? WHERE id = ?", (total_amount, po_id))
        po_count += 1
        print(f"Created PO: {po_number} for {supplier[1]} (Total: {total_amount})")

    conn.commit()
    print(f"\nSuccessfully created {po_count} Purchase Orders.")

if __name__ == "__main__":
    seed_pos()
    conn.close()
