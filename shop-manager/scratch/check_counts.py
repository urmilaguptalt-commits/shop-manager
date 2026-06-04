import sqlite3
import os

db_path = 'shop.db'
if not os.path.exists(db_path):
    print("shop.db not found")
else:
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    tables = ['suppliers', 'products', 'purchase_orders', 'invoices', 'customers']
    for table in tables:
        count = cursor.execute(f"SELECT COUNT(*) FROM {table}").fetchone()[0]
        print(f"Table {table}: {count} rows")
        if count > 0:
            sample = cursor.execute(f"SELECT * FROM {table} LIMIT 1").fetchone()
            print(f"  Sample: {sample}")
    
    conn.close()
