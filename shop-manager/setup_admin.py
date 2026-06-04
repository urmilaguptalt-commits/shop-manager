import sqlite3, sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))

from passlib.context import CryptContext
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

hashed = pwd_context.hash("1234")

conn = sqlite3.connect(str(Path(__file__).parent / "shop.db"))
cur = conn.cursor()

# Clear existing users and set only the real admin
cur.execute("DELETE FROM users")
cur.execute(
    "INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)",
    ("vaibhav", "vaibhav", hashed, "owner")
)
conn.commit()

# Verify silently
cur.execute("SELECT COUNT(*) FROM users WHERE name='vaibhav'")
count = cur.fetchone()[0]
conn.close()

if count == 1:
    print("OK")
else:
    print("ERROR")
