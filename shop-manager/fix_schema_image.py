import sqlite3

def add_image_url_column():
    conn = sqlite3.connect('shop.db')
    cursor = conn.cursor()
    try:
        cursor.execute("ALTER TABLE products ADD COLUMN image_url TEXT")
        conn.commit()
        print("Column 'image_url' added to 'products' table.")
    except sqlite3.OperationalError:
        print("Column 'image_url' already exists.")
    finally:
        conn.close()

if __name__ == "__main__":
    add_image_url_column()
