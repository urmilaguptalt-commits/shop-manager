import sqlite3

conn = sqlite3.connect('shop.db')
cur = conn.cursor()

# Check current columns
cols = [r[1] for r in cur.execute('PRAGMA table_info(products)').fetchall()]
print('Current products columns:', cols)

# Add missing columns to products
migrations = [
    ("brand",  "ALTER TABLE products ADD COLUMN brand TEXT NOT NULL DEFAULT ''"),
    ("specs",  "ALTER TABLE products ADD COLUMN specs TEXT"),
]

for col_name, sql in migrations:
    if col_name not in cols:
        cur.execute(sql)
        print(f'Added column: {col_name}')
    else:
        print(f'Column already exists: {col_name}')

conn.commit()

# Verify final schema
cols2 = [r[1] for r in cur.execute('PRAGMA table_info(products)').fetchall()]
print('Final products columns:', cols2)

# Also check supplier count
cur.execute("SELECT COUNT(*) FROM suppliers")
count = cur.fetchone()[0]
print(f'Supplier count: {count}')

cur.execute("SELECT id, name, category FROM suppliers ORDER BY id")
for row in cur.fetchall():
    print(f'  Supplier ID={row[0]}: {row[1]} ({row[2]})')

conn.close()
print('Done!')
