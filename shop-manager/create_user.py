from backend.database import SessionLocal
from backend import models, security

def create_arpita_user():
    db = SessionLocal()
    try:
        # Check if user already exists
        user = db.query(models.User).filter(models.User.name == "arpita").first()
        if user:
            # Update password
            user.password_hash = security.get_password_hash("1234")
            db.commit()
            print("User 'arpita' updated with password '1234'")
        else:
            # Create new user
            new_user = models.User(
                name="arpita",
                email="arpita@shop.com",
                password_hash=security.get_password_hash("1234"),
                role="owner"
            )
            db.add(new_user)
            db.commit()
            print("User 'arpita' created with password '1234'")
    finally:
        db.close()

if __name__ == "__main__":
    create_arpita_user()
