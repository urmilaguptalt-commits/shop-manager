import sqlite3

db_path = r"c:\Users\Lenovo\Desktop\projectCollege\shop-manager\shop.db"
conn = sqlite3.connect(db_path)
cur = conn.cursor()

# Show existing
cur.execute("SELECT id, name, phone FROM suppliers")
rows = cur.fetchall()
print(f"Existing suppliers ({len(rows)}):")
for r in rows:
    print(f"  ID={r[0]} | Name='{r[1]}' | Phone='{r[2]}'")

# Delete blank-name suppliers
cur.execute("DELETE FROM suppliers WHERE name IS NULL OR name = ''")
deleted = cur.rowcount
print(f"\nDeleted {deleted} blank-name suppliers")

# Suppliers to add
new_suppliers = [
    ("Samsung Electronics India",  "Ramesh Kumar",  "9876543201", "ramesh@samsung.in",  "Smartphones"),
    ("Apple India Pvt Ltd",        "Priya Sharma",  "9876543202", "priya@apple.in",     "Smartphones"),
    ("Xiaomi Technology India",    "Anil Gupta",    "9876543203", "anil@xiaomi.in",     "Smartphones"),
    ("boAt Lifestyle",             "Neha Verma",    "9876543204", "neha@boat.in",       "Accessories"),
    ("Dell India Pvt Ltd",         "Suresh Rao",    "9876543205", "suresh@dell.in",     "Laptops"),
    ("HP India Solutions",         "Kavita Singh",  "9876543206", "kavita@hp.in",       "Laptops"),
    ("Realme India Distributors",  "Mohit Joshi",   "9876543207", "mohit@realme.in",    "Smartphones"),
    ("Sony India Electronics",     "Deepa Nair",    "9876543208", "deepa@sony.in",      "Audio & TV"),
    ("OnePlus India",              "Arjun Mehta",   "9876543209", "arjun@oneplus.in",   "Smartphones"),
    ("Syska Electronics",          "Ritu Pandey",   "9876543210", "ritu@syska.in",      "Accessories"),
]

added = 0
for name, contact, phone, email, category in new_suppliers:
    # Check if phone already exists
    cur.execute("SELECT id FROM suppliers WHERE phone = ?", (phone,))
    if cur.fetchone():
        print(f"Skipped (exists): {name}")
    else:
        cur.execute(
            "INSERT INTO suppliers (name, contact_person, phone, email, category) VALUES (?, ?, ?, ?, ?)",
            (name, contact, phone, email, category)
        )
        added += 1
        print(f"Added: {name}")

conn.commit()

# Final count
cur.execute("SELECT id, name, category FROM suppliers ORDER BY id")
all_rows = cur.fetchall()
print(f"\nAll suppliers now ({len(all_rows)}):")
for r in all_rows:
    print(f"  ID={r[0]} | {r[1]} | {r[2]}")

conn.close()
print(f"\nDone! Added {added} suppliers.")
