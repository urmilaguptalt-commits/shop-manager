import sqlite3

conn = sqlite3.connect('shop.db')
cursor = conn.cursor()

try:
    cursor.execute("ALTER TABLE products ADD COLUMN brand VARCHAR")
except Exception as e:
    print(e)
    
try:
    cursor.execute("ALTER TABLE products ADD COLUMN specs VARCHAR")
except Exception as e:
    print(e)

conn.commit()
conn.close()
print("Done")
