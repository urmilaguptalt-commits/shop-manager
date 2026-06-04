import sqlite3
import os

db_path = 'shop.db'
if not os.path.exists(db_path):
    print("shop.db not found")
else:
    conn = sqlite3.connect(db_path)
    print("Suppliers:", conn.execute('PRAGMA table_info(suppliers);').fetchall())
    print("Products:", conn.execute('PRAGMA table_info(products);').fetchall())
    print("Purchase Orders:", conn.execute('PRAGMA table_info(purchase_orders);').fetchall())
    conn.close()
