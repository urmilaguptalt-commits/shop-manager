import sqlite3
import os

db_path = 'shop.db'
if not os.path.exists(db_path):
    print("Error: shop.db not found.")
    exit(1)

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# 1. Update MacBook Air M3 Image URL (from localhost to Unsplash)
macbook_img = "https://images.unsplash.com/photo-1517336714460-4c50d117900b?auto=format&fit=crop&q=80&w=800"
cursor.execute("UPDATE products SET image_url = ? WHERE id = 4", (macbook_img,))

# 2. Update Supplier IDs for products where it is currently NULL
updates = [
    (10, 6),  # Redmi Pad -> Xiaomi Technology India (ID 10)
    (13, 7),  # Legion Pro -> HP India Solutions (ID 13)
    (8, 8),   # X-Phone -> Samsung Electronics India (ID 8)
    (11, 9),  # Chronos Watch -> boAt Lifestyle (ID 11)
    (15, 10), # Aura Sound -> Sony India Electronics (ID 15)
    (15, 11), # Alpha Cam -> Sony India Electronics (ID 15)
    (8, 12),  # Tab Master -> Samsung Electronics India (ID 8)
    (11, 13), # Aero Drone -> boAt Lifestyle (ID 11)
    (9, 14),  # Vision VR -> Apple India Pvt Ltd (ID 9)
    (9, 21),  # Apple Watch -> Apple India Pvt Ltd (ID 9)
]

for supplier_id, product_id in updates:
    cursor.execute("UPDATE products SET supplier_id = ? WHERE id = ?", (supplier_id, product_id))

conn.commit()
print("Successfully updated database records in shop.db!")

# Verify updates
cursor.execute("SELECT id, name, supplier_id, image_url FROM products")
for row in cursor.fetchall():
    print(f"Product ID {row[0]}: {row[1]} -> Supplier ID: {row[2]}, Image: {row[3][:60]}...")

conn.close()
